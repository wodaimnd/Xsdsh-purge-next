import fs from "node:fs";
import { promises as fsp } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "./core.js";
import * as hostctl from "./host.js";
import * as desktop from "./desktop.js";
// B18：卸载时要「先翻 header 再删目录」。这个函数是 B9 实现好的（全有或全无），
// core.js 没有 re-export，直接从 extract-asar.js 取 —— 该模块只 import node 内建，无环。
import { readAsarHeaderRaw, readFlippedSidecar, asarInnerPathsFor, revertPatchesViaUnpacked, dropAsarRollbackBackup } from "./extract-asar.js";
import * as rules from "./rules.js";
import { clearDrillGrant } from "./drill-grant.js";

export function wasApplied(state) {
  if (!state) return false;
  if (state.has_backup) return true;
  if (Number(state.patches_applied) > 0) return true;
  return [state.shim_cmd, state.shim_ps1, state.shim_bin].includes("patched");
}

export function shouldDeletePluginTree(dir, dshHome = core.findDshHome()) {
  if (!dir) return false;
  let real;
  try {
    real = fs.realpathSync(dir);
  } catch {
    real = path.resolve(dir);
  }
  const n = real.replace(/[/\\]+/g, "/").toLowerCase();
  if (n.includes("/node_modules/Xsdsh-purge-next")) return true;
  let home;
  try {
    home = fs.realpathSync(dshHome);
  } catch {
    home = path.resolve(dshHome);
  }
  const homeN = home.replace(/[/\\]+/g, "/").toLowerCase();
  return n.startsWith(`${homeN}/profiles/`);
}

/* bundles 会出现在三个位置：
 *   ① 顶层 bundles / plugins —— 老格式；
 *   ② dsh.profile.bundles —— 安装器 Register-Profile 写的，DSH 实际从这里加载；
 *   ③ dsh.profiles.bundles —— 多 profile 形态的兜底。
 * 面板卸载以前只看 ①，于是「安装器装、面板卸」的用户会留下 ②：
 * 插件树删干净了，插件列表里却还挂着一条（4.5.33 及以前）。 */
const BUNDLE_KEYS = ["bundles", "plugins"];

function bundleContainers(pkg) {
  if (!pkg || typeof pkg !== "object") return [];
  const out = [pkg];
  const dsh = pkg.dsh;
  if (dsh && typeof dsh === "object") {
    if (dsh.profile && typeof dsh.profile === "object") out.push(dsh.profile);
    if (dsh.profiles && typeof dsh.profiles === "object") {
      out.push(dsh.profiles);
      for (const v of Object.values(dsh.profiles)) {
        if (v && typeof v === "object") out.push(v);
      }
    }
  }
  return out;
}

function isPurgeBundleItem(item) {
  if (typeof item === "string") return item === "Xsdsh-purge-next" || item.startsWith("Xsdsh-purge-next@");
  const id = item && (item.id || item.name);
  return id === "Xsdsh-purge-next";
}

function stripBundles(container) {
  let changed = false;
  for (const key of BUNDLE_KEYS) {
    if (!Array.isArray(container[key])) continue;
    const next = container[key].filter((item) => !isPurgeBundleItem(item));
    if (next.length !== container[key].length) {
      container[key] = next;
      changed = true;
    }
  }
  return changed;
}

function bundlesMentionPurge(container) {
  for (const key of BUNDLE_KEYS) {
    if (Array.isArray(container[key]) && container[key].some(isPurgeBundleItem)) return true;
  }
  return false;
}

export function stripPluginFromPackage(pkg) {
  if (!pkg || typeof pkg !== "object") return false;
  let changed = false;
  for (const key of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    if (pkg[key] && Object.prototype.hasOwnProperty.call(pkg[key], "Xsdsh-purge-next")) {
      delete pkg[key]["Xsdsh-purge-next"];
      changed = true;
    }
  }
  for (const container of bundleContainers(pkg)) {
    if (stripBundles(container)) changed = true;
  }
  return changed;
}

/* ── U6：安装清单 ────────────────────────────────────────────────────────
 *
 * 安装器把插件复制到 profiles/<名字>/node_modules/Xsdsh-purge-next，并在
 * <DSH_HOME>/Xsdsh-purge-next/install-manifest.json 记下每个真实落点。卸载优先按清单删，
 * 清单缺失/损坏时仍走原来的两条启发式（老安装没有清单）。
 *
 * 清单条目不能盲信：安装之后用户可能把目录换成别的东西。删除前必须确认
 * package.json 的 name 仍是 Xsdsh-purge-next，且路径不是盘符根/家目录/dshHome 本身
 * 或其祖先 —— 否则一次清单写错就会把整个用户目录删掉。
 */
export function installManifestPath(dshHome = core.findDshHome()) {
  return path.join(dshHome, "Xsdsh-purge-core", "install-manifest.json");
}

export function readInstallManifest(dshHome = core.findDshHome()) {
  const fp = installManifestPath(dshHome);
  if (!fs.existsSync(fp)) return { path: fp, manifest: null, error: "missing" };
  try {
    const manifest = JSON.parse(fs.readFileSync(fp, "utf8"));
    if (!manifest || typeof manifest !== "object" || !manifest.profiles || typeof manifest.profiles !== "object") {
      return { path: fp, manifest: null, error: "shape" };
    }
    return { path: fp, manifest, error: "" };
  } catch {
    return { path: fp, manifest: null, error: "parse" };
  }
}

function realpathSafe(p) {
  try {
    return fs.realpathSync(p);
  } catch {
    return path.resolve(p);
  }
}

function isPurgePluginDir(dir) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
    return String(pkg && pkg.name).toLowerCase() === "xsdsh-purge";
  } catch {
    return false;
  }
}

function isUnsafeDeleteRoot(real, homeReal) {
  const norm = (p) => p.replace(/[/\\]+/g, "/").replace(/\/+$/, "").toLowerCase();
  const r = norm(real);
  if (!r) return true;
  if (r === norm(path.parse(real).root)) return true;
  if (r === norm(os.homedir())) return true;
  const h = norm(homeReal);
  if (r === h) return true;
  // real 是 dshHome 的祖先（例如把 D:\ 或 D:\dsh 的上一级写进清单）
  if (h && h.startsWith(`${r}/`)) return true;
  return false;
}

/**
 * 按安装清单收集待删目录。返回：
 *   dirs     —— 真实目标 + junction/符号链接路径（链接本身也要删，否则留下悬空入口）
 *   refused  —— 存在但没过安全闸的条目
 *   missing  —— 清单里已经不在的条目（不算错误）
 */
export function manifestCleanupDirs(dshHome = core.findDshHome()) {
  const out = { dirs: [], refused: [], missing: [] };
  const { manifest } = readInstallManifest(dshHome);
  if (!manifest) return out;
  const homeReal = realpathSafe(dshHome);
  const seen = new Set();
  const push = (p) => {
    const key = path.resolve(p).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.dirs.push(path.resolve(p));
  };

  for (const entry of Object.values(manifest.profiles || {})) {
    const raw = typeof entry === "string"
      ? entry
      : entry && (entry.plugin_path || entry.real_path);
    if (!raw) continue;
    const abs = path.resolve(String(raw));
    if (!fs.existsSync(abs)) {
      out.missing.push(abs);
      continue;
    }
    const real = realpathSafe(abs);
    if (!isPurgePluginDir(real)) {
      out.refused.push({ path: abs, reason: "not-plugin" });
      continue;
    }
    if (isUnsafeDeleteRoot(real, homeReal)) {
      out.refused.push({ path: abs, reason: "unsafe-path" });
      continue;
    }
    push(real);
    if (abs.toLowerCase() !== real.toLowerCase()) push(abs);
  }
  return out;
}

/* ── U8：profile lockfile 里的插件条目 ─────────────────────────────────── */
const LOCKFILE_RELS = ["package-lock.json", path.join("node_modules", ".package-lock.json")];

function stripLockObject(obj) {
  if (!obj || typeof obj !== "object") return false;
  let changed = false;
  const packages = obj.packages;
  if (packages && typeof packages === "object") {
    for (const key of Object.keys(packages)) {
      if (key === "node_modules/Xsdsh-purge-next" || key.startsWith("node_modules/Xsdsh-purge-next/")) {
        delete packages[key];
        changed = true;
      }
    }
    const rootDeps = packages[""] && packages[""].dependencies;
    if (rootDeps && Object.prototype.hasOwnProperty.call(rootDeps, "Xsdsh-purge-next")) {
      delete rootDeps["Xsdsh-purge-next"];
      changed = true;
    }
  }
  const deps = obj.dependencies;
  if (deps && Object.prototype.hasOwnProperty.call(deps, "Xsdsh-purge-next")) {
    delete deps["Xsdsh-purge-next"];
    changed = true;
  }
  return changed;
}

export function stripPluginFromLock(profileDir) {
  const result = { changed: false, files: [], errors: [] };
  for (const rel of LOCKFILE_RELS) {
    const fp = path.join(profileDir, rel);
    if (!fs.existsSync(fp)) continue;
    let data;
    try {
      data = JSON.parse(fs.readFileSync(fp, "utf8"));
    } catch (e) {
      result.errors.push(`${rel}: ${e.message || e}`);
      continue;
    }
    if (!stripLockObject(data)) continue;
    try {
      fs.writeFileSync(fp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      result.changed = true;
      result.files.push(fp);
    } catch (e) {
      result.errors.push(`${rel}: ${e.message || e}`);
    }
  }
  return result;
}

function readJson(fp) {
  try {
    return JSON.parse(fs.readFileSync(fp, "utf8"));
  } catch {
    return null;
  }
}

function writeJson(fp, value) {
  fs.writeFileSync(fp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function pkgMentionsPurge(pkg) {
  if (!pkg) return false;
  for (const key of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    if (pkg[key]?.["Xsdsh-purge-next"]) return true;
  }
  return bundleContainers(pkg).some(bundlesMentionPurge);
}

export function listInstalledProfiles(dshHome = core.findDshHome()) {
  const root = path.join(dshHome, "profiles");
  if (!fs.existsSync(root)) return [];
  let names = [];
  try {
    names = fs.readdirSync(root);
  } catch {
    return [];
  }
  const out = [];
  for (const name of names) {
    const dir = path.join(root, name);
    const pkgPath = path.join(dir, "package.json");
    const pkg = readJson(pkgPath);
    const nm = path.join(dir, "node_modules", "Xsdsh-purge-next");
    if (!pkgMentionsPurge(pkg) && !fs.existsSync(nm)) continue;
    const spec = pkg?.dependencies?.["Xsdsh-purge-next"] || pkg?.devDependencies?.["Xsdsh-purge-next"] || "";
    out.push({ name, dir, spec: String(spec || ""), pkgPath, hasModule: fs.existsSync(nm) });
  }
  return out;
}

async function unlinkIfExists(fp) {
  try {
    await fsp.unlink(fp);
    return true;
  } catch (e) {
    if (e && e.code === "ENOENT") return false;
    throw e;
  }
}

async function rmIfExists(fp) {
  try {
    await fsp.rm(fp, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

async function removeOverride(dshHome) {
  const fp = core.findOverrideFile(dshHome);
  const ok = await unlinkIfExists(fp);
  return { path: fp, removed: ok };
}

async function resetRules(dshHome) {
  const reset = await rules.resetToOriginal(dshHome);
  const dir = rules.rulesDir(dshHome);
  const removedDir = await rmIfExists(dir);
  return { ...reset, rules_dir: dir, rules_dir_removed: removedDir };
}

/* ── B18：卸载时清理 resources/app ──────────────────────────────────────────
 *
 * 【要解决的问题】
 * resources/app 是**真目录接管**：它一旦存在，Electron 就优先加载它而不是 app.asar。
 * 老版 uninstallPurge 完全不碰这棵树，于是「卸载 3 秒跑完、报告成功、补丁还在生效」——
 * 用户以为卸干净了，重启后照旧，再装新版本还新旧叠加。
 *
 * 【七步顺序即正确性，不能拆不能换】
 *   ⓪ 定位 appDir（<res>/app）
 *   ① killDesktopProcessesForInstall —— ok=false 直接中止，不继续
 *   ② 先还原 header（复用 B9 的 revertPatchesViaUnpacked）
 *   ③ rename 为 app.xsdshpurge-discard
 *   ④ rmSync
 *   ⑤ 清理 *-prev 等同级残留
 *   ⑥ 绝不删除 app.asar
 *   ⑦ return 明细
 *
 * ② 必须早于 ③：header 还写着 unpacked:true 而目录已被删 → 宿主读条目时 ENOENT 硬崩，
 * 表现为「DSH 打不开」。这是能把机器搞到不可用的顺序错误，所以 ② 一旦失败就**不 rename**。
 * ① 必须早于 ②：宿主进程活着时 asar 被占用，写 header 会 EPERM。
 * ⑥ 绝不删 app.asar：新路不换归档，宿主靠翻转后的 header 读它 —— 删了就没东西可读。
 */

/** 丢弃目录后缀。带这个后缀的目录是「已决定删除、正在删」的中间态。 */
const APP_DISCARD_SUFFIX = ".xsdshpurge-discard";

/** 我们可能在 resources/ 同级留下的残留前缀。注意：`app.asar` **不**匹配它。 */
const APP_RESIDUE_PREFIX = "app.xsdshpurge-";

/**
 * header 里**所有** `unpacked:true` 的叶子条目路径 —— 纯遍历，不做任何归属判定。
 *
 * 只用于诊断（`report.unpacked_total_before`）。
 *
 * 【绝不能拿它当 probePaths / 还原清单】
 *
 * 真宿主的 `app.asar` header 里本来就带 **1583 条官方原生 `unpacked:true`**
 * （Electron 对原生模块的标记，与本插件无关，实测 total entries 21412 / unpacked 1583）。
 * 早先的 `listFlippedInnerPaths()` 就是这个纯遍历，于是把 1583 条也当成「我们翻的」：
 *
 *   · 有 sidecar：只还原 52 条 → 回读仍剩 1583 → header-still-flipped → 中止
 *   · 无 sidecar：1583 条全是 unpacked → 抛「缺少翻转前原条目记录」→ 中止
 *
 * 两条路都在 ③ rename 之前返回，`resources/app` 于是永远删不掉；而 apply 侧又对
 * `legacy-residue` 硬阻断 —— 用户卡在「应用不了、也卸不干净」。归属判定见下面的
 * `ourFlippedCandidates()`。
 */
function allUnpackedInnerPaths(asarPath) {
  const out = [];
  if (!asarPath) return out;
  let raw = null;
  try {
    raw = readAsarHeaderRaw(asarPath);
  } catch {
    return out;
  }
  const walk = (node, prefix) => {
    if (!node || typeof node !== "object" || !node.files || typeof node.files !== "object") return;
    for (const name of Object.keys(node.files)) {
      const child = node.files[name];
      if (!child || typeof child !== "object") continue;
      const inner = prefix ? prefix + "/" + name : name;
      if (!child.files && child.unpacked === true) out.push(inner);
      else walk(child, inner);
    }
  };
  walk(raw && raw.header, "");
  return out;
}

/**
 * 「哪些 unpacked 条目是**本插件**翻的」候选集。
 *
 * 两个来源，按权威性排序：
 *   ① `sidecar` —— `<asar>.xsdshpurge-flipped.json` 的 `entries` 键。
 *      这是 `applyPatchesViaUnpacked()` 亲手写下的翻转前原条目快照，唯一权威来源；
 *      `revertPatchesViaUnpacked({innerPaths: null})` 用的也是它。
 *   ② `targets` —— 无 sidecar 时，按与 `core.js` 的 `unpackedRevertProbePaths()`
 *      **同一套算法**推算：`targetFiles(logicalBase, dshHome, {includeMissing:true})`
 *      → 相对化 → `asarInnerPathsFor()` 映射成归档内路径。与 prime 枚举完全同源。
 *   ③ `none` —— 两条都算不出来。调用方必须当成「判不了」，不许退化成 header 全量。
 *
 * 官方原生条目永远不会进入候选集：它们既不在 sidecar 里，也不在补丁目标清单里。
 */
function ourFlippedCandidates(asarPath, appDir) {
  if (!asarPath) return { candidates: new Set(), source: "none" };

  // ① sidecar（权威）
  try {
    const sidecar = readFlippedSidecar(asarPath);
    const keys = sidecar && sidecar.entries ? Object.keys(sidecar.entries) : [];
    if (keys.length > 0) return { candidates: new Set(keys), source: "sidecar" };
  } catch { /* 落到 targets */ }

  // ② 与 core.unpackedRevertProbePaths 同源推算
  const bases = [
    appDir ? path.join(appDir, "dsh", "node_modules", "@deepseek-ai") : "",
    appDir ? path.join(appDir, "node_modules", "@deepseek-ai") : "",
  ].filter(Boolean);
  for (const aiBase of bases) {
    try {
      if (!fs.existsSync(aiBase)) continue;
      const home = core.findDshHome();
      const files = core.targetFiles(aiBase, home, { includeMissing: true });
      const rels = [];
      for (const val of Object.values(files || {})) {
        for (const fp of (Array.isArray(val) ? val : (val ? [val] : []))) {
          const rel = path.relative(aiBase, fp);
          if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) continue;
          rels.push(rel.split(path.sep).join("/"));
        }
      }
      if (rels.length === 0) continue;
      const mapped = asarInnerPathsFor(asarPath, aiBase, rels)
        .filter((m) => m && m.ok && m.inner)
        .map((m) => m.inner);
      if (mapped.length > 0) return { candidates: new Set(mapped), source: "targets" };
    } catch { /* 试下一个 base */ }
  }

  return { candidates: new Set(), source: "none" };
}

/**
 * 本插件翻过的、且 header 里**仍标记着** unpacked 的条目。
 *
 * 用途：给 `revertPatchesViaUnpacked` 提供 probePaths，以及 ② 步的回读复核。
 * 该函数在没有 sidecar 时靠 probePaths 区分「本来就没翻过（幂等成功）」与
 * 「记录丢了（必须报错）」。
 *
 * 返回的 `source` 必须原样带给调用方：`"none"` 意味着候选集算不出来，
 * 此时**绝不能**拿 header 全量顶替 —— 那正是本条缺陷的成因。
 */
function listOurFlipped(asarPath, appDir) {
  const { candidates, source } = ourFlippedCandidates(asarPath, appDir);
  if (candidates.size === 0) return { flipped: [], source };
  const flipped = allUnpackedInnerPaths(asarPath).filter((inner) => candidates.has(inner));
  return { flipped, source };
}

/**
 * 「resources/app 是不是我们创建的」判据。
 *
 * 目的：避免误删用户自建的同名目录。**只有拿到明确证据才动手**，判不了就不动。
 *
 * 证据分四类，任一成立即可（都是 O(1) 或受限扫描，不做全盘遍历）：
 *   ① 归档同级的新路痕迹：`app.asar.xsdshpurge-flipped.json`（翻 header 的 sidecar）、
 *      `app.asar.xsdshpurge-fastpath.json`（新路身份 stamp）。
 *   ② 路 A 的落盘记录：dshHome/Xsdsh-purge-next/unpacked-asar.json，且其 size 与**本归档**
 *      当前 size 相等 —— 只认 size 匹配，否则那是别的归档的记录，不算数。
 *   ③ resources/ 同级的 `app.xsdshpurge-*` 残留（*-prev / *-next / *-recover.json）。
 *   ④ 兜底：appDir 内部有 `.bak`（路 A 打补丁时留下的备份）或名字含 `.xsdshpurge-`。
 *      扫描有上限（SCAN_CAP 条），命中即返回，扫不完按「没有证据」处理。
 *
 * 【为什么 `app.asar.unpacked` 目录不算证据】
 *
 * 那是 **Electron 官方安装自带的**：真宿主实测里面有 1583 个原生模块文件，
 * 与本插件无关。把它当证据会让 `ours` 在任何官方安装上恒为 true ——
 * 「判不了就不动」这条保护被直接短路，而它保护的正是「删掉 18367 个文件」这个动作。
 * 路 A 真正留下的痕迹是 dshHome 里的 stamp 与目录内的 `.bak`，两类都在上面。
 */
const APP_SCAN_CAP = 3000;

function dirHasOurMarkers(appDir, cap = APP_SCAN_CAP) {
  let seen = 0;
  const stack = [appDir];
  while (stack.length) {
    const d = stack.pop();
    let ents = [];
    try {
      ents = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of ents) {
      seen += 1;
      if (seen > cap) return false;
      const name = String(e.name || "");
      if (e.isDirectory()) {
        stack.push(path.join(d, name));
        continue;
      }
      if (name.endsWith(".bak") || name.includes(".xsdshpurge-")) return true;
    }
  }
  return false;
}

function findAppOwnershipEvidence(resourcesDir, asarPath, appDir) {
  const evidence = [];
  if (!resourcesDir) return evidence;
  // ① 归档同级的新路痕迹
  if (asarPath) {
    if (fs.existsSync(asarPath + ".xsdshpurge-flipped.json")) evidence.push("flipped-sidecar");
    if (fs.existsSync(asarPath + ".xsdshpurge-fastpath.json")) evidence.push("fastpath-stamp");
  }
  // ② 路 A 的落盘记录 —— 必须 size 与**本归档**相等才算数
  try {
    const stamp = core.readUnpackedAsarStamp();
    if (stamp && asarPath && fs.existsSync(asarPath)) {
      const st = fs.statSync(asarPath);
      if (Number(stamp.size) === Number(st.size)) evidence.push("unpacked-asar-stamp");
    }
  } catch { /* 读不到不算证据 */ }
  // ③ 同级残留
  try {
    for (const name of fs.readdirSync(resourcesDir)) {
      if (String(name).startsWith(APP_RESIDUE_PREFIX)) evidence.push("residue:" + name);
    }
  } catch { /* 列不出不算证据 */ }
  // ④ 兜底：目录内部痕迹
  if (evidence.length === 0 && appDir) {
    try {
      if (dirHasOurMarkers(appDir)) evidence.push("inside-markers");
    } catch { /* 扫不动不算证据 */ }
  }
  return evidence;
}

/** 清理 resources/ 同级的 `app.xsdshpurge-*` 残留。**只碰这个前缀**，app.asar 不在其中。 */
function cleanAppResidues(resourcesDir, keepPath = "") {
  const cleaned = [];
  const errors = [];
  if (!resourcesDir) return { cleaned, errors };
  let names = [];
  try {
    names = fs.readdirSync(resourcesDir);
  } catch (e) {
    errors.push("list resources: " + String(e && e.message ? e.message : e));
    return { cleaned, errors };
  }
  const keep = String(keepPath || "").toLowerCase();
  for (const name of names) {
    const nm = String(name);
    if (!nm.startsWith(APP_RESIDUE_PREFIX)) continue;
    const fp = path.join(resourcesDir, nm);
    if (keep && fp.toLowerCase() === keep) continue;
    try {
      fs.rmSync(fp, { recursive: true, force: true });
      cleaned.push(fp);
    } catch (e) {
      errors.push(nm + ": " + String(e && e.message ? e.message : e));
    }
  }
  return { cleaned, errors };
}

/**
 * 七步主体。返回明细（deleted / skipped / errors 等），由 uninstallPurge 塞进 report，
 * 再随 /uninstall 的响应原样带给前端（该路由是 `{...result}` 展开，无需改 index.js）。
 *
 * @param {object} state gatherState() 的结果，用来定位宿主
 * @param {object} options 测试注入：{ appDir, resourcesDir, exe, asar, allowNonElectron, skipKill, kill }
 *   · `kill` —— 注入自定义的「杀桌面进程」实现，用于测试 kill 失败分支；
 *     生产路径不传，走 `desktop.killDesktopProcessesForInstall`。
 */
export async function cleanupResourcesApp(state, options = {}) {
  const report = {
    ok: true,
    ours: false,
    app_dir: "",
    resources_dir: "",
    asar: "",
    evidence: [],
    flipped_before: 0,
    /* 诊断：header 里**全部** unpacked 条目数（含 Electron 官方原生标记）。
     * 与 `flipped_before`（只算本插件翻的）对照，能一眼看出归属判定是否生效。
     * 真宿主这两个数通常差 1500 以上（52 vs 1583+52）。 */
    unpacked_total_before: 0,
    /* 候选集来源：sidecar / targets / none。`none` 表示判不出哪些是我们的。 */
    flipped_source: "none",
    header_reverted: false,
    killed: [],
    remaining: [],
    renamed_to: "",
    deleted: false,
    /* ⑥ 的结论先占位：中途早退（kill 失败 / header 还原失败）时这个键也必须在，
     * 否则前端只能拿到 undefined，分不清「归档没了」和「没查」。定位到 asar 后
     * 立刻求一次真值，⑥ 再复核一次。 */
    asar_preserved: null,
    /* 卸载成功后才删的归档级回滚备份；早退分支保持 null，表示「没走到」。 */
    asar_bak: null,
    residue_cleaned: [],
    warnings: [],
    skipped: "",
    errors: [],
  };

  // ── ⓪ 定位 appDir ────────────────────────────────────────────────────
  const exe = String(options.exe || (state && state.desktop_exe) || "").trim();
  const resourcesDir = String(
    options.resourcesDir
    || (exe ? desktop.resourcesDirForExecutable(exe) : "")
    || process.resourcesPath
    || "",
  ).trim();
  const asarPath = String(options.asar || (resourcesDir ? path.join(resourcesDir, "app.asar") : "")).trim();
  const appDir = String(options.appDir || (resourcesDir ? path.join(resourcesDir, "app") : "")).trim();
  report.resources_dir = resourcesDir;
  report.asar = asarPath;
  report.app_dir = appDir;
  // 定位到归档就先求一次「它在不在」，让所有早退分支也带上 ⑥ 的结论。
  try {
    report.asar_preserved = asarPath ? fs.existsSync(asarPath) : null;
  } catch {
    report.asar_preserved = null;
  }

  if (!appDir || !fs.existsSync(appDir)) {
    report.skipped = "no-app-dir";
    return report;
  }

  // ── 清理前判据：不是我们创建的就绝不动 ────────────────────────────────
  report.evidence = findAppOwnershipEvidence(resourcesDir, asarPath, appDir);
  report.ours = report.evidence.length > 0;
  if (!report.ours) {
    report.skipped = "not-ours";
    return report;
  }

  // ── ① 先杀宿主进程（asar 被占用时写 header 会 EPERM）────────────────────
  if (exe && options.skipKill !== true) {
    let kill = null;
    try {
      /* 注入缝与既有的 skipKill / allowNonElectron 同风格：测试要覆盖
       * 「杀不掉 → 整体中止」这条分支，不能真的去 Stop-Process 本机进程。 */
      kill = typeof options.kill === "function"
        ? options.kill({ exe })
        : desktop.killDesktopProcessesForInstall({ exe });
    } catch (e) {
      report.ok = false;
      report.errors.push("kill desktop: " + String(e && e.message ? e.message : e));
      report.skipped = "kill-threw";
      return report;
    }
    report.killed = (kill && kill.killed) || [];
    report.remaining = (kill && kill.remaining) || [];
    if (!kill || kill.ok !== true) {
      /* 杀不掉就**整体中止**：不还原 header、不 rename、不删任何东西。
       * 半删状态比不删更糟 —— 用户会看到「卸载完成」而实际一半还在。 */
      report.ok = false;
      report.skipped = "kill-failed";
      report.errors.push(
        "kill desktop: 仍有进程占用安装目录（remaining="
        + (report.remaining.length ? report.remaining.join(",") : "?")
        + "），已中止清理，未删除任何文件",
      );
      return report;
    }
  } else {
    report.skipped = "";
  }

  // ── ② 先还原 header（必须在 ③ 之前）──────────────────────────────────
  /* header 还写着 unpacked:true 就把目录删掉 → 宿主读条目时 ENOENT 硬崩。
   * 所以这里失败就**直接返回，不 rename、不 rm**。
   * 注意 uninstallPurge 早前已经调过一次 revertAll，这里是有意的**二次确认**：
   * 那一跑可能因为进程占用而 EPERM，杀掉进程之后重试才有机会成功。
   *
   * 【只还原本插件翻的条目】
   *
   * `listOurFlipped` 先算「哪些条目可能是我们翻的」（sidecar / 补丁目标集），
   * 再在 header 里看这些条目是否仍标着 unpacked。**绝不用 header 全量扫描**：
   * 真宿主 header 里有 1583 条官方原生 unpacked:true，那种写法会让 ② 必然中止
   * （详见 `allUnpackedInnerPaths()` 的注释）。 */
  const probe = listOurFlipped(asarPath, appDir);
  const flipped = probe.flipped;
  report.flipped_before = flipped.length;
  report.flipped_source = probe.source;
  try {
    report.unpacked_total_before = allUnpackedInnerPaths(asarPath).length;
  } catch {
    report.unpacked_total_before = 0;
  }

  /* 安全闸：判不出哪些是我们的，而 header 里又有 unpacked 条目 → 什么都不做。
   *
   * 不能退化成「拿 header 全量去还原」：那正是原缺陷的做法，会把官方 1583 条
   * 拖进 probePaths，还原后回读仍非 0，每次都报 header-still-flipped。
   * 也不能直接往下删目录：header 可能真还翻着，删掉 = 宿主 ENOENT。
   * 所以唯一安全的动作是停下并报清楚原因。 */
  if (flipped.length === 0 && report.unpacked_total_before > 0 && probe.source === "none") {
    report.ok = false;
    report.skipped = "flipped-probe-unknown";
    report.errors.push(
      "revert header: 无法判定 header 里 " + report.unpacked_total_before + " 个 unpacked 条目中"
      + "哪些是本插件翻的（sidecar 丢失且补丁目标清单算不出来），"
      + "为免误改宿主原生条目，已中止清理，resources/app 未删除",
    );
    return report;
  }

  if (flipped.length > 0) {
    try {
      revertPatchesViaUnpacked({
        asarPath,
        innerPaths: null,      // 还原 sidecar 记过的全部条目，不多碰
        probePaths: flipped,   // 只给本插件翻的那些；官方原生条目不参与判定
        allowNonElectron: options.allowNonElectron === true,
      });
      report.header_reverted = true;
    } catch (e) {
      report.ok = false;
      report.skipped = "header-revert-failed";
      report.errors.push(
        "revert header: " + String(e && e.message ? e.message : e)
        + "；为免宿主 ENOENT 硬崩，已中止清理，resources/app 未删除",
      );
      return report;
    }
    /* 回读确认：**我们那批**条目不该再有 unpacked:true。
     * 官方原生条目仍会是 unpacked —— 那是 Electron 的正常状态，不能算失败。 */
    const still = listOurFlipped(asarPath, appDir).flipped;
    if (still.length > 0) {
      report.ok = false;
      report.skipped = "header-still-flipped";
      report.errors.push(
        "revert header: 还原后仍有 " + still.length + " 个条目处于 unpacked 态"
        + "（" + still.slice(0, 3).join(", ") + "），已中止清理，resources/app 未删除",
      );
      return report;
    }
  } else {
    report.header_reverted = true; // 本来就没翻过 = 已经干净
  }

  // ── ③ rename 为 app.xsdshpurge-discard ──────────────────────────────
  /* 先改名再删，是为了让「删到一半失败」留下的残骸有个明确名字，
   * 且宿主启动时不会再把半删的目录当成可用 app 加载。 */
  const discardPath = appDir + APP_DISCARD_SUFFIX;
  try {
    fs.rmSync(discardPath, { recursive: true, force: true });
  } catch { /* 上一轮的残骸删不掉就让下面的 rename 去报错 */ }
  try {
    fs.renameSync(appDir, discardPath);
    report.renamed_to = discardPath;
  } catch (e) {
    report.ok = false;
    report.skipped = "rename-failed";
    report.errors.push("rename app dir: " + String(e && e.message ? e.message : e));
    return report;
  }

  // ── ④ rmSync ────────────────────────────────────────────────────────
  try {
    fs.rmSync(discardPath, { recursive: true, force: true });
    report.deleted = true;
  } catch (e) {
    report.ok = false;
    report.errors.push("rm app dir: " + String(e && e.message ? e.message : e));
  }

  // ── ⑤ 清理 *-prev 等同级残留 ────────────────────────────────────────
  /* 不传 keepPath：万一 ④ 的 rmSync 失败，discard 目录还留着，
   * 这里按同一条前缀规则再删一次 —— 白捡一次重试，不会有副作用。 */
  const residue = cleanAppResidues(resourcesDir);
  report.residue_cleaned = residue.cleaned;
  report.errors.push(...residue.errors);
  if (residue.errors.length) report.ok = false;

  // ── ⑤.5 归档级回滚备份 ──────────────────────────────────────────────
  /* 只有 app 目录确实删掉了才删：header 已还原、sidecar 已清空、无
   * `.unrecovered` 时它已经没有用处；任何一步失败都保留。 */
  if (report.deleted) {
    try {
      report.asar_bak = dropAsarRollbackBackup(asarPath);
      if (!report.asar_bak.dropped && report.asar_bak.reason && report.asar_bak.reason !== "missing") {
        report.warnings.push(`归档备份未删除（${report.asar_bak.reason}）：${report.asar_bak.bak}`);
      }
    } catch (e) {
      report.warnings.push("删除归档备份失败：" + String(e && e.message ? e.message : e));
    }
  }

  // ── ⑥ 绝不删除 app.asar ─────────────────────────────────────────────
  /* 这里**故意什么都不做**。新路不换归档，宿主靠翻转后的 header 读它；
   * 删了 asar 等于宿主没东西可读。上面的 cleanAppResidues 只匹配
   * `app.xsdshpurge-` 前缀，`app.asar` 天然不匹配。 */
  report.asar_preserved = Boolean(asarPath) ? fs.existsSync(asarPath) : null;

  // ── ⑦ return 明细 ───────────────────────────────────────────────────
  return report;
}

export function collectCleanupDirs(profiles, dshHome) {
  const seen = new Set();
  const dirs = [];
  const refused = [];
  const remember = (dir, { literal = false } = {}) => {
    if (!dir) return;
    const abs = path.resolve(dir);
    const real = literal ? abs : realpathSafe(abs);
    const key = real.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    dirs.push(real);
  };

  for (const p of profiles) {
    const nm = path.join(p.dir, "node_modules", "Xsdsh-purge-next");
    if (!fs.existsSync(nm)) continue;
    const real = realpathSafe(nm);
    if (shouldDeletePluginTree(real, dshHome)) remember(real);
    // 链接本身也要删，否则真实目录没了还留下一个悬空入口。
    if (path.resolve(nm).toLowerCase() !== real.toLowerCase()) remember(nm, { literal: true });
  }

  // U6：安装清单里的真实落点。清单条目已经过存在性/身份/安全闸三重校验。
  const mf = manifestCleanupDirs(dshHome);
  for (const d of mf.dirs) remember(d, { literal: true });
  refused.push(...mf.refused);

  const dataDir = path.join(dshHome, "Xsdsh-purge-core");
  remember(dataDir);

  // 插件根 = 本文件所在 lib/ 的上一级。
  // （原来借 update.js 的 pluginRoot()，那个模块随 GitHub 自更新一起移除了。）
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  if (shouldDeletePluginTree(root, dshHome)) remember(root);

  return { dirs, refused };
}

export function unregisterProfiles(profiles) {
  const stripped = [];
  const locks = [];
  const errors = [];
  const leftover = [];
  for (const p of profiles) {
    try {
      const pkg = readJson(p.pkgPath) || {};
      if (stripPluginFromPackage(pkg)) {
        writeJson(p.pkgPath, pkg);
        stripped.push(p.name);
      }
    } catch (e) {
      errors.push({ profile: p.name, error: String(e && e.message ? e.message : e) });
    }
    // U8：package.json 登记之外，npm 的 lockfile 里还有一份。
    try {
      const lock = stripPluginFromLock(p.dir);
      if (lock.changed) locks.push(p.name);
      errors.push(...lock.errors.map((error) => ({ profile: p.name, error })));
    } catch (e) {
      errors.push({ profile: p.name, error: String(e && e.message ? e.message : e) });
    }
    /* 写回之后从磁盘再读一次。并发写回、解析失败、或将来多出某种登记形态时，
       这里把「还登记着」变成一条可见的残留，而不是报告成功。 */
    try {
      if (pkgMentionsPurge(readJson(p.pkgPath))) {
        leftover.push({ profile: p.name, file: p.pkgPath });
      }
    } catch {
      leftover.push({ profile: p.name, file: p.pkgPath });
    }
  }
  return { stripped, locks, errors, leftover };
}

export async function uninstallPurge(options = {}) {
  const state = await core.gatherState();
  const applied = wasApplied(state);
  const dshHome = state.dsh_home || core.findDshHome();
  const report = {
    ok: true,
    applied,
    reverted: false,
    needRestart: true,
    patches: null,
    shim: null,
    flash: null,
    override: null,
    rules: null,
    profiles: [],
    stripped: [],
    locks: [],
    registration_leftover: [],
    cleanup: [],
    app_cleanup: null,
    asar_bak: null,
    warnings: [],
    errors: [],
  };

  try {
    if (state.ai_base) {
      report.patches = await core.revertAll(state.ai_base);
      if (applied) report.reverted = true;
      const leftover = report.patches && report.patches.unpacked_leftover;
      if (Array.isArray(leftover) && leftover.length) {
        report.warnings.push(
          `快通道还原后仍有 ${leftover.length} 个文件未删除（header 已还原，宿主不会读取这些字节）：`
          + leftover.slice(0, 5).join(", ")
          + (leftover.length > 5 ? " …" : ""),
        );
      }
      /* 快通道没有 resources/app，cleanupResourcesApp 会 early-return，
         所以归档备份必须在这里删。只在 header 还原确实成功时动手。 */
      const fastAsar = report.patches && report.patches.unpacked && report.patches.unpacked.asar;
      if (fastAsar && report.patches.unpacked.error === "") {
        try {
          report.asar_bak = dropAsarRollbackBackup(fastAsar);
          if (!report.asar_bak.dropped && report.asar_bak.reason && report.asar_bak.reason !== "missing") {
            report.warnings.push(`归档备份未删除（${report.asar_bak.reason}）：${report.asar_bak.bak}`);
          }
        } catch (e) {
          report.warnings.push("删除归档备份失败：" + String(e && e.message ? e.message : e));
        }
      }
    }
  } catch (e) {
    report.errors.push(`revert patches: ${e.message || e}`);
  }
  if (applied && (report.patches?.errors?.length || report.errors.some((e) => /^revert patches:/.test(e)))) {
    report.ok = false;
    report.needRestart = false;
    report.cleanup = [];
    return report;
  }

  try {
    report.shim = await core.revertAllShims();
    if (state.shim_cmd === "patched" || state.shim_ps1 === "patched" || state.shim_bin === "patched") {
      report.reverted = true;
    }
  } catch (e) {
    report.errors.push(`revert shims: ${e.message || e}`);
  }

  try {
    report.flash = core.revertCmdFlash(state.ai_base, dshHome);
  } catch (e) {
    report.errors.push(`revert flash: ${e.message || e}`);
  }

  try {
    report.override = await removeOverride(dshHome);
  } catch (e) {
    report.errors.push(`remove override: ${e.message || e}`);
  }

  try {
    report.rules = await resetRules(dshHome);
  } catch (e) {
    report.errors.push(`reset rules: ${e.message || e}`);
  }

  const profiles = listInstalledProfiles(dshHome);
  report.profiles = profiles.map((p) => p.name);
  const unreg = unregisterProfiles(profiles);
  report.stripped = unreg.stripped;
  report.locks = unreg.locks;
  report.registration_leftover = unreg.leftover;
  for (const x of unreg.leftover) {
    /* 故意不置 ok=false：/uninstall 路由只在 ok 时 scheduleCleanupRestart，
       ok=false 会让插件树反而删不掉。残留登记不影响树与补丁的清理，
       所以只做可见化 —— 路由会把这条拼进给前端的 note。 */
    report.warnings.push(`profile ${x.profile} 的 package.json 仍登记着 Xsdsh-purge-next：${x.file}`);
  }
  report.errors.push(...unreg.errors.map((x) => `${x.profile}: ${x.error}`));
  if (unreg.errors.length) {
    report.ok = false;
    report.needRestart = false;
    report.cleanup = [];
    report.drillGrantCleared = false;
    return report;
  }

  try {
    report.drillGrantCleared = clearDrillGrant(dshHome);
  } catch (e) {
    report.ok = false;
    report.needRestart = false;
    report.cleanup = [];
    report.errors.push(`clear drill grant: ${e.message || e}`);
    return report;
  }

  /* B18：清理 resources/app。
   *
   * 【为什么插在这儿】
   * ① 在 collectCleanupDirs 之前：那个函数收的是 profiles 侧目录（另一棵树），
   *    resources/app 的明细必须单独一格，混进去会让 report.cleanup 语义混乱。
   * ② 在所有早退分支（上面的 patches/shim/rules/unreg/drillGrant 失败）**之外**：
   *    那些分支的共同点是「补丁没还原干净」，此时删目录正是最危险的（header 可能
   *    还翻着 → ENOENT 硬崩），跳过是对的。但「安装记录已丢」（state.ai_base 为空、
   *    applied=false）不会触发任何早退，能走到这里 —— 而那恰恰是残留最该清理的场景。
   * ③ 失败不推翻整体 ok 之外的东西：这里只影响 report.app_cleanup 与 report.ok，
   *    不影响已经完成的 shim/override/rules 结果，避免一次清理失败抹掉全部明细。 */
  try {
    report.app_cleanup = await cleanupResourcesApp(state, options);
    if (report.app_cleanup && report.app_cleanup.ok === false) {
      report.ok = false;
      report.errors.push(...(report.app_cleanup.errors || []));
    }
    if (report.app_cleanup && Array.isArray(report.app_cleanup.warnings)) {
      report.warnings.push(...report.app_cleanup.warnings);
    }
  } catch (e) {
    report.ok = false;
    report.app_cleanup = { ok: false, errors: [String(e && e.message ? e.message : e)] };
    report.errors.push("cleanup resources/app: " + String(e && e.message ? e.message : e));
  }

  const collected = collectCleanupDirs(profiles, dshHome);
  report.cleanup = collected.dirs;
  for (const r of collected.refused) {
    report.warnings.push(`拒绝删除安装清单里的目录（${r.reason}）：${r.path}`);
  }
  return report;
}

export function scheduleCleanupRestart(opts = {}) {
  hostctl.scheduleCleanupRestart(opts);
}
