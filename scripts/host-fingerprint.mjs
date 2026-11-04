/**
 * 宿主指纹（Q1b / Q6）—— 宿主矩阵版。
 *
 * 记录「这一版宿主上，每条补丁命中几次」。为什么是「指纹」而不是「夹具原文」：
 * 把宿主原文裁片提交进仓库是**同义反复**——裁片本来就是从宿主切下来的，测试永远
 * 命中，只能证明补丁表没被改（那是 Q1a 的活）。真正会变的是「宿主这一版长什么样」，
 * 所以只提交**观测结果**（每条补丁的命中数），由测试在装了宿主的机器上比对。
 * 宿主升版 → 指纹对不上 → 红，逼人重新确认。
 *
 * fixture 是 **schema 2 宿主矩阵**，`surfaces` 是允许登记的宿主面白名单：
 *
 *   {
 *     "schema": 2,
 *     "surfaces": ["desktop"],
 *     "hosts": {
 *       "desktop/0.2.1-rc.5": {
 *         surface, version, packages, packageSet, baseline,
 *         patches, multiHitOk, multiHitWhy
 *       }
 *     }
 *   }
 *
 * `patches` 的语义与旧版完全一致：`{ hits, files, applied, settled }`。
 * `packageSet` 是「解析到的包名@版本」排序后的 sha256 前 16 位，用来发现宿主
 * 依赖集合的变化（同名同版必须一致；磁盘与 asar 用同一套包名口径）。
 * `baseline` 是原文状态：asar 恒为 `pristine`；磁盘按目标补丁是否已应用判
 * `post-patch`。`multiHitOk` / `multiHitWhy` 是「同一文件内命中 >1 且确认无害」
 * 的登记表与理由，按宿主各自记录。
 *
 * 用法：
 *   node scripts/host-fingerprint.mjs --list
 *   node scripts/host-fingerprint.mjs --host desktop/0.2.1-rc.5 --write
 *   node scripts/host-fingerprint.mjs --host desktop/0.2.1-rc.5 --asar "D:/.../app.asar" --diff
 *   node scripts/host-fingerprint.mjs --base <aiBase> --write
 *   node scripts/host-fingerprint.mjs                 # 自动发现宿主并打印
 *
 * 取原文的规则（磁盘宿主）：有 `<file>.xsdshpurge.bak` 就用它（apply 前的原文），
 * 否则用当前文件。注意当前文件多数已经被打过，needle 早被 replace 掉 —— 直接拿
 * live 当原文会得到一片零命中，那是假象。
 *
 * 桌面宿主密封在 app.asar 里时，用 `--asar` 走归档内条目；不读 `.bak` / `.unpacked`。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  applyReplacementsToText,
  filePatchSettled,
  findAiBase,
  findDshHome,
  normalizeLegacyNames,
  patchApplied,
  patchReplacements,
  targetFiles,
} from "../lib/core.js";
import {
  asarInnerPathsFor,
  readAsarEntryBytes,
  readAsarHeaderRaw,
} from "../lib/extract-asar.js";
import {
  appAsarPath,
  findDesktopAppExecutable,
  isInsideDesktopInstall,
} from "../lib/desktop.js";
import { ALL_PATCHES } from "../lib/patches/index.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const FINGERPRINT_PATH = join(ROOT, "test", "fixtures", "host-fingerprint.json");
export const SCHEMA = 2;

/* 宿主版本：base 指向 `…/node_modules/@deepseek-ai`，版本号在**外层**包的 package.json 里
 * （`…/dsh/package.json`），层级随分发而变（npm 全局 / 桌面解包）。所以逐级往上找，
 * 认 `name === "@deepseek-ai/dsh"` 那一个；找不到就退回最近一个有 version 的。 */
function readHostVersion(base) {
  let dir = base;
  let fallback = "";
  for (let i = 0; i < 8; i += 1) {
    const fp = join(dir, "package.json");
    if (existsSync(fp)) {
      let pkg = null;
      try {
        pkg = JSON.parse(readFileSync(fp, "utf8"));
      } catch {
        pkg = null;
      }
      if (pkg && pkg.name === "@deepseek-ai/dsh" && pkg.version) return String(pkg.version);
      if (pkg && !fallback && pkg.version) fallback = String(pkg.version);
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return fallback;
}

/* 包名口径（磁盘与 asar 统一）：取路径里**最后一个** `node_modules/` 之后的
 * 包目录，scope 包保留 `@scope/pkg` 两段。这样同一套包在两种布局下名字一致：
 *   磁盘 `…/node_modules/@earendil-works/pi-ai/dist/…`
 *   asar `dsh/node_modules/@earendil-works/pi-ai/dist/…`
 * 都得到 `@earendil-works/pi-ai`。旧实现按 `node_modules/@deepseek-ai/` 切，
 * 会把 scope 丢掉、把归档里的 pi-ai 退化成盘符，已删除。 */
function packageSegments(fp) {
  const parts = String(fp || "").split(/[\\/]+/);
  let at = -1;
  for (let i = 0; i < parts.length; i += 1) {
    if (parts[i] === "node_modules") at = i;
  }
  if (at < 0 || at + 1 >= parts.length) return null;
  const first = parts[at + 1];
  if (!first) return null;
  if (first.startsWith("@")) {
    const second = parts[at + 2];
    if (!second) return null;
    return { name: `${first}/${second}`, dir: parts.slice(0, at + 3) };
  }
  return { name: first, dir: parts.slice(0, at + 2) };
}

function packageNameFromPath(fp) {
  const hit = packageSegments(fp);
  return hit ? hit.name : "";
}

/* 磁盘包目录：用于读 `<pkg>/package.json` 的 version。 */
function packageDirFromPath(fp) {
  const hit = packageSegments(fp);
  return hit ? hit.dir.join(path.sep) : "";
}

function countHits(hay, pattern) {
  if (pattern instanceof RegExp) {
    const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
    return (hay.match(re) || []).length;
  }
  return hay.split(pattern).length - 1;
}

/**
 * 链式补丁的内存内前序应用：从原文开始，按 `ALL_PATCHES` 顺序把 `chainAfter`
 * 里的前序补丁打上去。前序自己也可能带 `chainAfter`，递归展开（#45→#46、
 * #83→#84 这类链不会成环，validatePatches 已禁止自引用）。
 *
 * 用 `applyReplacementsToText()` 而不是手工 split/join，是为了和真正 apply 走
 * 同一条路径：`skipIfMarked`、正则 `$1` 展开、legacy 改名、CRLF 还原都一致。
 */
function applyChainToText(raw, chainIds, fp, seen = new Set()) {
  let text = raw;
  const wanted = new Set(chainIds);
  for (const prior of ALL_PATCHES) {
    if (!wanted.has(prior.id) || seen.has(prior.id)) continue;
    const nextSeen = new Set(seen).add(prior.id);
    if (Array.isArray(prior.chainAfter) && prior.chainAfter.length > 0) {
      text = applyChainToText(text, prior.chainAfter, fp, nextSeen);
    }
    text = applyReplacementsToText(text, prior, fp).text;
  }
  return text;
}

/**
 * 统一的计算内核：`readText(fp)` 返回原文，读不到返回 `null`（跳过该候选）。
 * 磁盘与 asar 只在「怎么读」上不同，hits/files/applied/settled 的语义完全一致。
 *
 * `packageOf(fp)` 给出包名（`@scope/pkg`），`readPackageVersion(name, fp)` 读该包
 * 的 version。包集合用「排序后的 name@version 列表」做 sha256 前 16 位，任一包
 * 读不到版本时记 `name@unknown` 并继续 —— 不能因为一个坏 package.json 就让整台
 * 宿主的指纹算不出来。
 */
function fingerprintFromCandidates({ files, readText, packageOf, readPackageVersion }) {
  const packages = new Map(); // name -> { fp, version }
  const patches = {};
  const readVersion = (name, fp) => {
    try {
      return String(readPackageVersion(name, fp) || "");
    } catch {
      return "";
    }
  };
  for (const p of ALL_PATCHES) {
    const pairs = patchReplacements(p);
    /* hits 取**单个文件内的最大出现次数**，不跨文件相加：
     * 同一条 needle 出现在两个目标文件里是正常的（每个文件各一处），
     * 只有「同一个文件里出现 2 次以上」才是 replaceAll 会过量替换的真问题。 */
    const hits = new Array(pairs.length).fill(0);
    let resolved = 0;
    let applied = false;
    let settledAll = true;
    for (const key of [].concat(p.file)) {
      const raw = files[key];
      const list = (Array.isArray(raw) ? raw : [raw]).filter(Boolean);
      for (const fp of list) {
        const original = readText(fp);
        if (original == null) continue;
        resolved += 1;
        const pkg = packageOf(fp);
        if (pkg && !packages.has(pkg)) {
          packages.set(pkg, { fp, version: readVersion(pkg, fp) });
        }
        /* 链式补丁（chainAfter）的 needle 是前序补丁的产物，密封 asar 的原文里
         * 根本没有。先在内存里把前序补丁打上去，再统计本条；这样「宿主这一版
         * 的原文长什么样」仍是唯一变量，而不是被 files:0 静默跳过。
         * 其它补丁保持「单文件最大命中」语义，读的仍是原文。 */
        const chained = Array.isArray(p.chainAfter) && p.chainAfter.length > 0
          ? applyChainToText(original, p.chainAfter, fp)
          : original;
        const hay = normalizeLegacyNames(String(chained).replace(/\r\n?/g, "\n"));
        pairs.forEach((r, i) => { hits[i] = Math.max(hits[i], countHits(hay, r.pattern)); });
        if (patchApplied(hay, p)) applied = true;
        if (!filePatchSettled(hay, p, fp)) settledAll = false;
      }
    }
    patches[p.id] = { hits, files: resolved, applied, settled: resolved > 0 && settledAll };
  }

  /* 第一次读不到版本（例如该文件只是枚举候选、包目录还没解包）时，用记录下来的
   * 首个文件路径重试一次；仍读不到就记 unknown。 */
  for (const [name, rec] of packages) {
    if (!rec.version) rec.version = readVersion(name, rec.fp);
  }
  const rows = [...packages.entries()]
    .map(([name, rec]) => `${name}@${rec.version || "unknown"}`)
    .sort();
  const packageSet = `sha256:${createHash("sha256").update(rows.join("\n")).digest("hex").slice(0, 16)}`;
  return { patches, packages: packages.size, packageSet };
}

/**
 * @param {string} base `findAiBase()` 的结果（…/node_modules/@deepseek-ai）
 * @param {{dshHome?: string}} [options]
 * @returns {{host:{version:string,packages:number,packageSet:string},baseline:"pristine"|"post-patch",patches:Record<string,{hits:number[],files:number,applied:boolean,settled:boolean}>}}
 */
export function computeFingerprint(base = findAiBase(), { dshHome } = {}) {
  if (!base) throw new Error("computeFingerprint 需要 aiBase（findAiBase 返回空）");
  const home = dshHome ?? findDshHome();
  const files = targetFiles(base, home);
  const readText = (fp) => {
    const bak = `${fp}.xsdshpurge.bak`;
    const target = existsSync(bak) ? bak : fp;
    if (!existsSync(target)) return null;
    return readFileSync(target, "utf8");
  };
  const readPackageVersion = (name, fp) => {
    const dir = packageDirFromPath(fp);
    if (!dir) return "";
    const pj = join(dir, "package.json");
    if (!existsSync(pj)) return "";
    try {
      const pkg = JSON.parse(readFileSync(pj, "utf8"));
      return pkg && pkg.version ? String(pkg.version) : "";
    } catch {
      return "";
    }
  };
  const { patches, packages, packageSet } = fingerprintFromCandidates({
    files,
    readText,
    packageOf: packageNameFromPath,
    readPackageVersion,
  });
  /* 磁盘原文可能已经被 apply 过：任一目标补丁的 markers 已在文本里 → post-patch。
   * 这类条目的 `applied` 不能当作「原生已满足」的零命中解释（见测试的零命中规则）。 */
  const baseline = Object.values(patches).some((row) => row.applied) ? "post-patch" : "pristine";
  return { host: { version: readHostVersion(base), packages, packageSet }, baseline, patches };
}

/* asar 内读 package.json 的 version。优先 `dsh/package.json`（桌面运行时包），
 * 退回归档根 `package.json`（Electron 应用包）。 */
function readAsarPackageVersion(asarPath, raw, inner) {
  const bytes = readAsarEntryBytes(asarPath, inner, raw);
  if (!bytes) return "";
  try {
    const pkg = JSON.parse(bytes.toString("utf8"));
    return pkg && pkg.version ? String(pkg.version) : "";
  } catch {
    return "";
  }
}

function readAsarHostVersion(asarPath, raw) {
  return readAsarPackageVersion(asarPath, raw, "dsh/package.json")
    || readAsarPackageVersion(asarPath, raw, "package.json");
}

/* `listPiAiApiFiles()` 在磁盘上只收「真实存在」的文件；宿主密封进 asar 后
 * `<res>/app` 并不存在，归档里那三份 pi-ai 不会被 `targetFiles()` 枚举出来。
 * 这里按同一套相对路径补上归档内侧候选；profile 里的软链副本仍在 targetFiles
 * 结果里，但它们映射不到归档，`readText` 返回 null 后会被跳过。
 * 这与 core.js `primeUnpackedFastpath()` 的结论一致：pi-ai 在归档外，
 * 但指纹需要把归档内那一份算进来。 */
const PI_AI_ASAR_CANDIDATES = {
  "pi-ai-completions": ["@earendil-works", "pi-ai", "dist", "api", "openai-completions.js"],
  "pi-ai-responses-shared": ["@earendil-works", "pi-ai", "dist", "api", "openai-responses-shared.js"],
  "pi-ai-anthropic-messages": ["@earendil-works", "pi-ai", "dist", "api", "anthropic-messages.js"],
};

function asarCandidateFiles(logicalBase, dshHome, asarPath) {
  const files = targetFiles(logicalBase, dshHome ?? findDshHome(), { includeMissing: true });
  for (const [key, rel] of Object.entries(PI_AI_ASAR_CANDIDATES)) {
    // `<res>/app/dsh/node_modules/@deepseek-ai/..` → `<res>/app/dsh/node_modules/...`
    const fp = path.join(logicalBase, "..", ...rel);
    const list = Array.isArray(files[key]) ? files[key] : (files[key] ? [files[key]] : []);
    if (!list.includes(fp)) list.push(fp);
    files[key] = list;
  }
  /* desktop-shell（#45/#46/#82/#83/#84）不在 aiBase 之下：密封 asar 里它在归档根
   * `lib/main.js`（老布局也可能是 `main.js`），逻辑路径是 `<res>/app/lib/main.js`。
   * `targetFiles()` 的 `desktop-shell` 来自 `desktopShellPath()`，Node 进程里
   * surface=web 时直接返回 ""，所以这里按 sibling 规则（`app.asar` ↔ `app`）
   * 显式补两条候选；`readText` 会把不存在的那条映射成 null 后跳过。
   * 不读 `.unpacked` / `.bak`。 */
  const root = path.resolve(String(asarPath || ""));
  if (root.toLowerCase().endsWith(".asar")) {
    const appDir = root.slice(0, -".asar".length); // <res>/app
    const shell = [path.join(appDir, "lib", "main.js"), path.join(appDir, "main.js")];
    const list = Array.isArray(files["desktop-shell"])
      ? files["desktop-shell"]
      : (files["desktop-shell"] ? [files["desktop-shell"]] : []);
    for (const fp of shell) if (!list.includes(fp)) list.push(fp);
    files["desktop-shell"] = list;
  }
  return files;
}

/**
 * 从密封的 app.asar 读指纹。只读归档内条目；`.bak` / `.unpacked` 一律不碰。
 *
 * 逻辑 aiBase 用 sibling 规则：`<res>/app.asar` ↔ `<res>/app`，所以
 * `logicalBase = <res>/app/dsh/node_modules/@deepseek-ai`。`targetFiles()` 那套
 * 枚举完全不用改，`asarInnerPathsFor()` 负责把逻辑路径换算进归档。
 *
 * @param {string} asarPath
 * @param {{dshHome?: string}} [options]
 */
export function computeFingerprintFromAsar(asarPath, { dshHome } = {}) {
  const asar = String(asarPath || "").trim();
  if (!asar) throw new Error("computeFingerprintFromAsar 需要 asarPath");
  const root = path.resolve(asar);
  if (!root.toLowerCase().endsWith(".asar")) throw new Error(`不是 .asar 文件：${asarPath}`);
  if (!existsSync(root)) throw new Error(`asar 不存在：${asarPath}`);

  const logicalBase = path.join(root.slice(0, -".asar".length), "dsh", "node_modules", "@deepseek-ai");
  const files = asarCandidateFiles(logicalBase, dshHome, root);
  const raw = readAsarHeaderRaw(root);
  const readText = (fp) => {
    const rel = path.relative(logicalBase, fp);
    const [mapped] = asarInnerPathsFor(root, logicalBase, [rel]);
    if (!mapped || !mapped.ok || !mapped.inner) return null;
    const bytes = readAsarEntryBytes(root, mapped.inner, raw);
    return bytes ? bytes.toString("utf8") : null;
  };
  /* asar 里的包名已经是 `@scope/pkg`（pi-ai 在 @earendil-works 下），
   * package.json 按 `dsh/node_modules/<pkg>/package.json` 直接拼。 */
  const readPackageVersion = (name) => {
    const bytes = readAsarEntryBytes(root, `dsh/node_modules/${name}/package.json`, raw);
    if (!bytes) return "";
    try {
      const pkg = JSON.parse(bytes.toString("utf8"));
      return pkg && pkg.version ? String(pkg.version) : "";
    } catch {
      return "";
    }
  };
  const { patches, packages, packageSet } = fingerprintFromCandidates({
    files,
    readText,
    packageOf: packageNameFromPath,
    readPackageVersion,
  });
  /* 密封 asar 是未打补丁的原文；这里不读 .bak / .unpacked。 */
  return {
    host: { version: readAsarHostVersion(root, raw), packages, packageSet },
    baseline: "pristine",
    patches,
  };
}

/* ------------------------------------------------------------------ */
/* fixture / CLI                                                       */
/* ------------------------------------------------------------------ */

/**
 * 校验 fixture 结构。除了 schema 2 / hosts，还要求：
 *   · `surfaces` 是非空字符串数组（本矩阵只登记这些宿主面）；
 *   · 每个宿主的 `surface` 必须在该白名单内 —— 否则 `discoverHosts()` 永远
 *     不会发现它，条目就成了永远不会被比对的死数据。
 * 导出给测试和 check-host-matrix 复用。
 */
export function validateFixture(data, file = FINGERPRINT_PATH) {
  if (!data || data.schema !== SCHEMA || !data.hosts || typeof data.hosts !== "object" || Array.isArray(data.hosts)) {
    throw new Error(`${file} 不是 schema ${SCHEMA}（需要 {schema:2, surfaces:[...], hosts:{...}}）`);
  }
  const surfaces = data.surfaces;
  if (!Array.isArray(surfaces) || surfaces.length === 0
    || !surfaces.every((s) => typeof s === "string" && s !== "")) {
    throw new Error(`${file} 的 surfaces 必须是非空字符串数组`);
  }
  for (const [key, entry] of Object.entries(data.hosts)) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`${file} 的宿主条目 ${key} 必须是对象`);
    }
    if (!surfaces.includes(entry.surface)) {
      throw new Error(
        `${file} 的宿主条目 ${key} 的 surface "${entry.surface}" 不在 surfaces（${surfaces.join(", ")}）内`,
      );
    }
  }
  return data;
}

export function loadFixture(file = FINGERPRINT_PATH) {
  if (!existsSync(file)) return { schema: SCHEMA, surfaces: ["desktop"], hosts: {} };
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`${file} 不是合法 JSON：${e && e.message ? e.message : e}`);
  }
  return validateFixture(data, file);
}

function saveFixture(data) {
  mkdirSync(dirname(FINGERPRINT_PATH), { recursive: true });
  writeFileSync(FINGERPRINT_PATH, `${JSON.stringify(data, null, 1)}\n`, "utf8");
}

function entryFor(surface, fingerprint, previous) {
  const prevOk = previous && typeof previous === "object" ? previous : {};
  return {
    surface,
    version: fingerprint.host.version,
    packages: fingerprint.host.packages,
    packageSet: fingerprint.host.packageSet,
    baseline: fingerprint.baseline || "pristine",
    patches: fingerprint.patches,
    // 生成/更新时不擅自登记多处命中；保留已有登记（含理由），新条目从空表开始。
    multiHitOk: prevOk.multiHitOk && typeof prevOk.multiHitOk === "object"
      ? prevOk.multiHitOk
      : {},
    multiHitWhy: prevOk.multiHitWhy && typeof prevOk.multiHitWhy === "object"
      ? prevOk.multiHitWhy
      : {},
  };
}

function surfaceForBase(base) {
  return isInsideDesktopInstall(base) ? "desktop" : "web";
}

function computeForSource({ asar, base }, dshHome) {
  if (asar) {
    return { surface: "desktop", fingerprint: computeFingerprintFromAsar(asar, { dshHome }) };
  }
  return { surface: surfaceForBase(base), fingerprint: computeFingerprint(base, { dshHome }) };
}

function fingerprintSignature(fingerprint) {
  const host = fingerprint && fingerprint.host ? fingerprint.host : {};
  return JSON.stringify({
    packages: host.packages,
    packageSet: host.packageSet,
    patches: fingerprint ? fingerprint.patches : null,
  });
}

/**
 * 自动发现本机可用宿主。只发现 `surfaces` 内的宿主（默认取 fixture 的
 * `surfaces`）。同一 `surface/version` 出现第二个来源时：
 *   · 指纹相同 → 视为同一宿主，跳过；
 *   · 指纹不同 → **抛错并列出两个来源**，不能静默保留第一个（否则 web 的
 *     污染 `.bak` 会悄悄盖掉干净的 asar）。
 * 没有宿主时返回空数组（调用方负责退出码 2）。
 */
export function discoverHosts({ dshHome, surfaces } = {}) {
  const allowed = new Set(surfaces ?? loadFixture().surfaces);
  const out = [];
  const seen = new Map();
  const push = (surface, fingerprint, extra = {}) => {
    if (!allowed.has(surface)) return;
    const version = fingerprint && fingerprint.host && fingerprint.host.version;
    if (!version) return;
    const key = `${surface}/${version}`;
    const prior = seen.get(key);
    if (prior) {
      if (fingerprintSignature(prior.fingerprint) === fingerprintSignature(fingerprint)) return;
      throw new Error(
        `同一宿主 ${key} 发现了两个指纹不同的来源：${prior.source} 与 ${extra.source || "未知来源"}。`
        + `请只保留一个权威来源（web 的 .bak 可能被污染，desktop 用密封 asar）`,
      );
    }
    seen.set(key, { source: extra.source || "未知来源", fingerprint });
    out.push({ key, surface, fingerprint, ...extra });
  };

  const base = findAiBase();
  if (base && !isInsideDesktopInstall(base) && allowed.has("web")) {
    push("web", computeFingerprint(base, { dshHome }), { source: `base:${base}`, base });
  }

  // discover=true 才会走 registryInstallDirs()：本机可能装在非标准目录
  // （例如 D:/Program File/DeepSeek Harness），仅靠 commonDesktopInstallDirs()
  // 的常见路径扫不到，但注册表里的 InstallLocation 能定位。
  const exe = findDesktopAppExecutable({ discover: true });
  const asar = exe ? appAsarPath(exe) : "";
  if (asar && existsSync(asar) && allowed.has("desktop")) {
    push("desktop", computeFingerprintFromAsar(asar, { dshHome }), { source: `asar:${asar}`, asar });
  }

  return out;
}

function parseArgs(argv) {
  const opts = {
    list: false,
    write: false,
    diff: false,
    host: "",
    asar: "",
    base: "",
    dshHome: "",
  };
  const take = (i, flag) => {
    const val = argv[i];
    if (!val || val.startsWith("--")) throw new Error(`${flag} 需要一个值`);
    return val;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--list") opts.list = true;
    else if (a === "--write") opts.write = true;
    else if (a === "--diff") opts.diff = true;
    else if (a === "--host") opts.host = take(++i, "--host");
    else if (a === "--asar") opts.asar = take(++i, "--asar");
    else if (a === "--base") opts.base = take(++i, "--base");
    else if (a === "--dsh-home") opts.dshHome = take(++i, "--dsh-home");
    else if (a.startsWith("--host=")) opts.host = a.slice("--host=".length);
    else if (a.startsWith("--asar=")) opts.asar = a.slice("--asar=".length);
    else if (a.startsWith("--base=")) opts.base = a.slice("--base=".length);
    else if (a.startsWith("--dsh-home=")) opts.dshHome = a.slice("--dsh-home=".length);
    else throw new Error(`未知参数：${a}`);
  }
  return opts;
}

function printList(data) {
  console.log(`surfaces: ${(data.surfaces || []).join(", ")}`);
  const keys = Object.keys(data.hosts);
  if (!keys.length) {
    console.log("（fixture 里没有宿主条目）");
    return;
  }
  for (const key of keys) {
    const e = data.hosts[key];
    console.log([
      key,
      `surface=${e.surface}`,
      `version=${e.version}`,
      `packages=${e.packages}`,
      `packageSet=${e.packageSet}`,
      `baseline=${e.baseline}`,
      `patches=${Object.keys(e.patches || {}).length}`,
      `multiHitOk=${Object.keys(e.multiHitOk || {}).length}`,
      `multiHitWhy=${Object.keys(e.multiHitWhy || {}).length}`,
    ].join("\t"));
  }
}

function diffFingerprint(actual, entry) {
  const diffs = [];
  if (actual.host.version !== entry.version) diffs.push(`version: ${entry.version} -> ${actual.host.version}`);
  if (actual.host.packageSet !== entry.packageSet) {
    diffs.push(`packageSet: ${entry.packageSet ?? "未登记"} -> ${actual.host.packageSet}`);
  }
  if (actual.host.packages !== entry.packages) diffs.push(`packages: ${entry.packages} -> ${actual.host.packages}`);

  const ids = new Set([...Object.keys(entry.patches || {}), ...Object.keys(actual.patches || {})]);
  for (const id of [...ids].sort((a, b) => Number(a) - Number(b))) {
    const a = actual.patches[id];
    const e = entry.patches[id];
    if (!a) { diffs.push(`p${id}: 实测缺失（fixture 有）`); continue; }
    if (!e) { diffs.push(`p${id}: fixture 缺失（实测有）`); continue; }
    if (JSON.stringify(a.hits) !== JSON.stringify(e.hits)) {
      diffs.push(`p${id} hits: ${JSON.stringify(e.hits)} -> ${JSON.stringify(a.hits)}`);
    }
    if (a.files !== e.files) diffs.push(`p${id} files: ${e.files} -> ${a.files}`);
    if (a.applied !== e.applied) diffs.push(`p${id} applied: ${e.applied} -> ${a.applied}`);
    if (a.settled !== e.settled) diffs.push(`p${id} settled: ${e.settled} -> ${a.settled}`);
  }

  const actualMulti = {};
  for (const [id, row] of Object.entries(actual.patches || {})) {
    row.hits.forEach((n, i) => { if (n > 1) actualMulti[`${id}#${i}`] = n; });
  }
  const registered = entry.multiHitOk || {};
  const multiKeys = new Set([...Object.keys(registered), ...Object.keys(actualMulti)]);
  for (const key of [...multiKeys].sort()) {
    if (registered[key] !== actualMulti[key]) {
      diffs.push(`multiHitOk ${key}: ${registered[key] ?? "未登记"} -> ${actualMulti[key] ?? "无"}`);
    }
  }
  return diffs;
}

function resolveTargets(opts, dshHome) {
  const surfaces = loadFixture().surfaces;
  const base = opts.base || String(process.env.DSH_AI_BASE || "").trim();
  if (opts.asar && base) throw new Error("--asar 与 --base 只能二选一");

  /* surfaces 是白名单：显式指定的宿主面不在里面时，直接给出可操作的提示，
   * 而不是走一遍发现流程再报「没找到」。 */
  if (opts.host) {
    const requestedSurface = String(opts.host).split("/")[0];
    if (!surfaces.includes(requestedSurface)) {
      throw new Error(
        `宿主 ${opts.host} 的 surface "${requestedSurface}" 不在 fixture surfaces`
        + `（${surfaces.join(", ")}）内；本矩阵只登记这些宿主面。`
        + `如果确实要登记，请先更新 test/fixtures/host-fingerprint.json 的 surfaces`,
      );
    }
  }

  if (opts.asar || base) {
    const { surface, fingerprint } = computeForSource({ asar: opts.asar, base }, dshHome);
    if (!surfaces.includes(surface)) {
      throw new Error(
        `来源被识别为 surface "${surface}"，但它不在 fixture surfaces（${surfaces.join(", ")}）内`,
      );
    }
    const key = `${surface}/${fingerprint.host.version}`;
    if (opts.host && opts.host !== key) {
      throw new Error(`条目 key 与实测宿主不一致：指定 ${opts.host}，实测 ${key}`);
    }
    return [{ key, surface, fingerprint }];
  }

  const discovered = discoverHosts({ dshHome, surfaces });
  if (!opts.host) return discovered;

  const [surface] = String(opts.host).split("/");
  const exact = discovered.find((h) => h.key === opts.host);
  if (exact) return [exact];
  const bySurface = discovered.find((h) => h.surface === surface);
  if (bySurface) {
    throw new Error(`条目 key 与实测宿主不一致：指定 ${opts.host}，实测 ${bySurface.key}（${surface} 宿主已升级？）`);
  }
  throw new Error(`本机没有发现 ${surface} 宿主（指定 ${opts.host}）；可用 --asar/--base 显式指定来源`);
}

function main(argv) {
  const opts = parseArgs(argv);
  if (opts.list) {
    printList(loadFixture());
    return 0;
  }
  if (opts.write && opts.diff) throw new Error("--write 与 --diff 不能同时使用");

  const dshHome = opts.dshHome || undefined;
  const targets = resolveTargets(opts, dshHome);
  if (!targets.length) {
    console.error("找不到可用的 DSH 宿主（web/desktop 都没有），无法生成指纹");
    return 2;
  }

  if (opts.write) {
    const data = loadFixture();
    for (const target of targets) {
      const previous = data.hosts[target.key];
      const entry = entryFor(target.surface, target.fingerprint, previous);
      data.hosts[target.key] = entry;
      if (entry.baseline !== "pristine") {
        console.warn(
          `[警告] ${target.key} 的 baseline=${entry.baseline}：磁盘原文已被目标补丁改过，`
          + `指纹记录的是打过补丁后的状态（不是宿主原始基线）`,
        );
      }
      console.log(
        `更新条目 ${target.key}：${target.fingerprint.host.version} / `
        + `${target.fingerprint.host.packages} 个包 / `
        + `${Object.keys(target.fingerprint.patches).length} 条补丁 / `
        + `packageSet=${entry.packageSet} / baseline=${entry.baseline}`,
      );
    }
    saveFixture(data);
    console.log(`已写入 ${FINGERPRINT_PATH}`);
    return 0;
  }

  if (opts.diff) {
    const data = loadFixture();
    let failed = false;
    for (const target of targets) {
      const entry = data.hosts[target.key];
      if (!entry) {
        console.log(`条目 ${target.key} 不存在（fixture 里没有）`);
        failed = true;
        continue;
      }
      const diffs = diffFingerprint(target.fingerprint, entry);
      if (!diffs.length) {
        console.log(`无差异：${target.key}`);
      } else {
        console.log(`差异：${target.key}`);
        for (const line of diffs) console.log(`  ${line}`);
        failed = true;
      }
    }
    return failed ? 1 : 0;
  }

  const data = loadFixture();
  const out = {};
  for (const target of targets) {
    out[target.key] = entryFor(target.surface, target.fingerprint, data.hosts[target.key]);
  }
  console.log(JSON.stringify(out, null, 1));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    console.error(String(e && e.message ? e.message : e));
    process.exitCode = 1;
  }
}
