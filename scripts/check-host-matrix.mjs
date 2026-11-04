#!/usr/bin/env node
/**
 * 宿主矩阵静态发布闸门 —— 打包前确认「目标宿主指纹已登记且自洽」。
 *
 * 它**不发现宿主、不读宿主文件**，只读插件自己的 package.json 与
 * `test/fixtures/host-fingerprint.json`。这样 CI / 打包机即使没装 DSH 也能拦下：
 *   · package.json 的 engines.dsh 与 dshTarget 不一致（版本目标自相矛盾）；
 *   · fixture 不是 schema 2、surfaces 不含 desktop；
 *   · `hosts["desktop/<dshTarget>"]` 缺失或 version 与 dshTarget 不一致
 *     （升版后忘了重新生成指纹）；
 *   · 条目补丁数少于当前 ALL_PATCHES（新增补丁没有登记到目标宿主）；
 *   · packageSet / baseline 缺失或非法；
 *   · multiHitOk 的键没有对应的非空 multiHitWhy；
 *   · desktop-shell 的 5 条补丁没有解析到目标文件（files >= 1）。
 *
 * 用法：
 *   node scripts/check-host-matrix.mjs
 *   node scripts/check-host-matrix.mjs --src D:/path/to/Xsdsh-purge-next
 *   node scripts/check-host-matrix.mjs --json
 *
 * 失败 exit 1，通过 exit 0。make-package.py 在复制文件前调用它。
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ALL_PATCHES } from "../lib/patches/index.js";

const DEFAULT_SRC = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHELL_IDS = [45, 46, 82, 83, 84];
const BASELINES = new Set(["pristine", "post-patch"]);
const PACKAGE_SET_RE = /^sha256:[0-9a-f]{16}$/;

function readJson(file, errors, label) {
  if (!existsSync(file)) {
    errors.push(`缺少 ${label}：${file}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    errors.push(`${label} 不是合法 JSON（${file}）：${e && e.message ? e.message : e}`);
    return null;
  }
}

/**
 * 纯静态检查。返回 `{ ok, errors, src, version, dshTarget, entryKey }`，
 * 不抛异常 —— 测试直接断言 errors 内容。
 * @param {string} [src] 插件根目录（含 package.json）
 */
export function checkHostMatrix(src = DEFAULT_SRC) {
  const root = resolve(src);
  const errors = [];

  const pkg = readJson(join(root, "package.json"), errors, "package.json");
  let version = "";
  let dshTarget = "";
  if (pkg) {
    version = pkg.version ? String(pkg.version) : "";
    const enginesDsh = pkg.engines && pkg.engines.dsh ? String(pkg.engines.dsh) : "";
    dshTarget = pkg.dshTarget ? String(pkg.dshTarget) : "";
    if (!version) errors.push("package.json 缺 version");
    if (!enginesDsh) errors.push("package.json 缺 engines.dsh");
    if (!dshTarget) errors.push("package.json 缺 dshTarget");
    if (enginesDsh && dshTarget && enginesDsh !== dshTarget) {
      /* 兼容副本允许写范围（例如 ">=0.2.1-rc.0 <0.3.0"）：只要 dshTarget 的
       * 数字主干（0.2.1）出现在范围里就算自洽，不额外依赖 semver。 */
      const core = dshTarget.replace(/-.*$/, "");
      const ranged = new RegExp(`(^|[^0-9.])${core.replace(/\./g, "\\.")}([^0-9.]|$)`).test(enginesDsh);
      if (!ranged) {
        errors.push(`engines.dsh (${enginesDsh}) 与 dshTarget (${dshTarget}) 不一致`);
      }
    }
  }

  const fixturePath = join(root, "test", "fixtures", "host-fingerprint.json");
  const fixture = readJson(fixturePath, errors, "宿主指纹 fixture");
  let entryKey = "";

  if (fixture) {
    if (fixture.schema !== 2) {
      errors.push(`fixture schema 必须是 2，实际 ${fixture.schema}`);
    }
    const surfaces = fixture.surfaces;
    if (!Array.isArray(surfaces) || surfaces.length === 0
      || !surfaces.every((s) => typeof s === "string" && s !== "")) {
      errors.push("fixture 的 surfaces 必须是非空字符串数组");
    } else if (!surfaces.includes("desktop")) {
      errors.push(`fixture 的 surfaces 必须包含 "desktop"（实际 ${surfaces.join(", ")}）`);
    }

    if (!fixture.hosts || typeof fixture.hosts !== "object" || Array.isArray(fixture.hosts)) {
      errors.push("fixture 的 hosts 必须是对象");
    } else if (dshTarget) {
      entryKey = `desktop/${dshTarget}`;
      const entry = fixture.hosts[entryKey];
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        errors.push(`fixture 缺目标宿主条目 ${entryKey}（未登记）`);
      } else {
        if (entry.surface !== "desktop") {
          errors.push(`${entryKey} 的 surface 必须是 "desktop"，实际 ${entry.surface}`);
        }
        if (entry.version !== dshTarget) {
          errors.push(`${entryKey}.version (${entry.version}) 与 dshTarget (${dshTarget}) 不一致`);
        }

        const patches = entry.patches && typeof entry.patches === "object" && !Array.isArray(entry.patches)
          ? entry.patches
          : null;
        if (!patches) {
          errors.push(`${entryKey} 缺 patches 对象`);
        } else {
          const count = Object.keys(patches).length;
          if (count !== ALL_PATCHES.length) {
            errors.push(`${entryKey} 登记了 ${count} 条补丁，但 ALL_PATCHES 有 ${ALL_PATCHES.length} 条（新增补丁未登记）`);
          }
        }

        if (typeof entry.packageSet !== "string" || !PACKAGE_SET_RE.test(entry.packageSet)) {
          errors.push(`${entryKey}.packageSet 缺失或不是 sha256:<16 位 hex>（实际 ${entry.packageSet}）`);
        }
        if (!BASELINES.has(entry.baseline)) {
          errors.push(`${entryKey}.baseline 必须是 pristine 或 post-patch（实际 ${entry.baseline}）`);
        }

        const multiHitOk = entry.multiHitOk && typeof entry.multiHitOk === "object" ? entry.multiHitOk : {};
        const multiHitWhy = entry.multiHitWhy && typeof entry.multiHitWhy === "object" ? entry.multiHitWhy : {};
        for (const hitKey of Object.keys(multiHitOk)) {
          const why = multiHitWhy[hitKey];
          if (typeof why !== "string" || why.trim() === "") {
            errors.push(`${entryKey} 的 multiHitOk ${hitKey} 缺非空 multiHitWhy`);
          }
        }

        for (const id of SHELL_IDS) {
          const row = patches ? patches[id] : null;
          if (!row) {
            errors.push(`${entryKey} 缺 desktop-shell 补丁 p${id}`);
          } else if (!(row.files >= 1)) {
            errors.push(`${entryKey} 的 desktop-shell p${id} files=${row.files}，必须 >= 1（归档内目标没被算进指纹）`);
          }
        }
      }
    }
  }

  return { ok: errors.length === 0, errors, src: root, version, dshTarget, entryKey };
}

function parseArgs(argv) {
  const opts = { src: DEFAULT_SRC, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--src") {
      const val = argv[i + 1];
      if (!val || val.startsWith("--")) throw new Error("--src 需要一个目录");
      opts.src = val;
      i += 1;
    } else if (a.startsWith("--src=")) opts.src = a.slice("--src=".length);
    else throw new Error(`未知参数：${a}`);
  }
  return opts;
}

function main(argv) {
  const opts = parseArgs(argv);
  const result = checkHostMatrix(opts.src);
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(
      `宿主矩阵检查通过：${result.entryKey}（插件 ${result.version}，dshTarget ${result.dshTarget}）`,
    );
  } else {
    console.error(`宿主矩阵检查失败（${result.errors.length} 项）：`);
    for (const line of result.errors) console.error(`  - ${line}`);
  }
  return result.ok ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    console.error(String(e && e.message ? e.message : e));
    process.exitCode = 1;
  }
}
