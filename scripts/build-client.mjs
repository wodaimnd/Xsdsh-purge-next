#!/usr/bin/env node
/**
 * `client.js` 是**产物**：按 `lib/ui/client.fragments.json` 的顺序拼接片段。
 * 演练台由清单里的 `drillModule: "Drill"` 指向 src/ui/features/drill（esbuild 编译），
 * 其余 file 片段仍是逐字原文。`lib/redteam/client.js` 是历史源，不参与当前拼装。
 * React 由宿主 require 提供。
 *
 * 为什么要产物化（Q4a）：
 *   以前 `client.js` 是「半产物」——drill 段由本脚本生成，其余手写，另有一个
 *   `patch-client-dock.mjs` 往手写区里注入 locale / CSS / dock / apply，并在结尾
 *   无条件 `writeFileSync` 写回整个 14k 行文件。三个写入口、零个全局守卫：
 *   手改会被下一次构建静默覆盖；改了片段忘了重建，线上跑的还是旧代码。两种漂移
 *   都不报错，只会在某天变成「改了没生效」的悬案。
 *   现在只有一个写入口，`--check` 覆盖**整个文件**，漂移变成一条可执行断言。
 *
 * 清单顺序有意义：顶层 `const` 有 TDZ，调用不能跑到声明前面。改顺序前先确认
 * 没有函数在声明之前被立即执行。
 *
 * 用法：
 *   node scripts/build-client.mjs            # 重新生成并写回
 *   node scripts/build-client.mjs --check    # 只校验，不写盘；不一致退出 1
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { buildUiModules, MODULE_ENTRY } from "./build-ui-modules.mjs";
import ts from "typescript";

const ROOT = process.env.XSDSH_PLUGIN_ROOT
  ? process.env.XSDSH_PLUGIN_ROOT
  : join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "lib", "ui", "client.fragments.json");
const FRAGMENTS_DIR = join(ROOT, "lib", "ui");
const CLIENT_PATH = join(ROOT, "client.js");

const BEGIN = "/* __DSH_PURGE_DRILL_BEGIN__ */";
const END = "/* __DSH_PURGE_DRILL_END__ */";

/* 清单顶层只读这两个键；多写别的（比如想把 version 加进校验时拼错键名）不该静默。 */
const MANIFEST_KEYS = new Set(["version", "note", "parts"]);

/** 收集 lib/ui 下全部 *.js（相对 ROOT，/ 分隔，排序后稳定）。清单必须恰好覆盖这个集合。 */
function listUiFiles() {
  const out = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.endsWith(".js")) out.push(p);
    }
  };
  walk(FRAGMENTS_DIR);
  return out.map((abs) => relative(ROOT, abs).split(sep).join("/")).sort();
}

/** 片段路径必须落在插件根内，避免清单被改成读插件外的文件。 */
function resolveInside(rel) {
  if (typeof rel !== "string" || !rel.trim()) throw new Error("片段路径必须是非空字符串");
  const abs = resolve(ROOT, rel);
  const back = relative(ROOT, abs);
  if (!back || back.startsWith("..") || isAbsolute(back)) {
    throw new Error(`片段路径越出插件根：${rel}`);
  }
  return abs;
}

/** 统一成 LF 再拼。CRLF 片段会让产物与磁盘的 LF 文件对不上，报错信息也很难看懂。 */
function readLf(abs) {
  return readFileSync(abs, "utf8").replace(/\r\n/g, "\n");
}

/** 从 `lib/redteam/client.js` 抽出工厂体，改写成可内嵌的片段。 */
function buildDrillFragment(srcRel) {
  let raw = readLf(resolveInside(srcRel));

  const startMark = "factory: (require) => {";
  const start = raw.indexOf(startMark);
  if (start < 0) throw new Error(`cannot find ModuleLoader factory in ${srcRel}`);
  const endMark = "\n    return module.exports\n  },\n})";
  const end = raw.lastIndexOf(endMark);
  if (end < 0) throw new Error(`cannot find factory end in ${srcRel}`);
  let body = raw.slice(start + startMark.length, end);

  // 去掉末尾 exports（return 已在 endMark 外）
  body = body
    .replace(/\n\s*exports\.apply\s*=\s*apply\s*\n/, "\n")
    .replace(/\n\s*exports\.inject\s*=\s*inject\s*\n/, "\n");

  // 替换 apply(ctx)：不再自己注册槽位，只导出 Panel / CSS / 状态
  const applyAt = body.lastIndexOf("function apply(ctx) {");
  if (applyAt < 0) throw new Error(`apply(ctx) not found in ${srcRel}`);
  // apply() 本体没有嵌套函数花括号冲突到 CSS（CSS 在前面），用括号深度即可
  let d = 0;
  let j = body.indexOf("{", applyAt);
  for (; j < body.length; j += 1) {
    const ch = body[j];
    if (ch === "{") d += 1;
    else if (ch === "}") {
      d -= 1;
      if (d === 0) {
        j += 1;
        break;
      }
    }
  }
  const applyParts = `function applyDrillParts() {
      return { CSS: CSS, Panel: Panel, setUI: setUI, useUI: useUI, isFullWindow: isFullWindow, setDockWidth: setDockWidth };
    }
`;
  body = body.slice(0, applyAt) + applyParts + body.slice(j);

  return `\t\t${BEGIN}
		// 内嵌演练台（源码在 lib/redteam，已并进本插件）
		const __xsdshPurgeDrill = (() => {
			var module = { exports: {} };
			var exports = module.exports;
${body}
			return applyDrillParts();
		})();
${END}
`;
}

/** New drill uses a value exported by the single UI entry; no legacy source executes. */
function buildModuleDrill(exportName) {
  if (exportName !== "Drill") throw new Error("drillModule 必须是公开导出名 Drill");
  const entry = resolveInside(MODULE_ENTRY);
  const program = ts.createProgram([entry], {
    allowJs: true, noEmit: true, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.React,
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  const moduleSymbol = source && checker.getSymbolAtLocation(source);
  const exported = moduleSymbol && checker.getExportsOfModule(moduleSymbol).find((symbol) => symbol.name === exportName);
  const value = exported && (exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported);
  const typeOnly = exported?.declarations?.some((node) =>
    (ts.isExportSpecifier(node) && (node.isTypeOnly || node.parent.parent.isTypeOnly))
    || (ts.isNamespaceExport(node) && node.parent.isTypeOnly));
  if (!value || !(value.flags & ts.SymbolFlags.Value) || typeOnly) {
    throw new Error("drillModule 需要 src/ui/client-modules.ts 的运行时 Drill 导出");
  }
  return `\t\t${BEGIN}\n\t\tconst __xsdshPurgeDrill = __xsdshClientModules.Drill;\n${END}\n`;
}

/** 读清单并逐段取文本。清单是唯一的拼装真源。 */
function buildParts() {
  let manifest;
  try {
    manifest = JSON.parse(readLf(MANIFEST_PATH));
  } catch (e) {
    throw new Error(`拼装清单读取失败（${MANIFEST_PATH}）：${e.message}`);
  }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("拼装清单必须是对象");
  }
  const extraTop = Object.keys(manifest).filter((k) => !MANIFEST_KEYS.has(k));
  if (extraTop.length) throw new Error(`拼装清单有未知顶层字段：${extraTop.join(", ")}`);

  const list = manifest.parts;
  if (!Array.isArray(list) || list.length === 0) throw new Error("拼装清单 parts 为空");

  const parts = [];
  list.forEach((part, i) => {
    if (!part || typeof part !== "object" || Array.isArray(part)) {
      throw new Error(`parts[${i}] 不是对象`);
    }
    const extra = Object.keys(part).filter((k) => !["file", "drill", "drillModule", "module"].includes(k));
    if (extra.length) throw new Error(`parts[${i}] 有未知字段：${extra.join(", ")}`);
    const kinds = ["file", "drill", "drillModule", "module"].filter((k) => k in part);
    if (kinds.length !== 1) throw new Error(`parts[${i}] 必须且只能有 file / drill / drillModule / module 之一`);

    const rel = part[kinds[0]];
    let text;
    try {
      text = kinds[0] === "module"
        ? buildUiModules(ROOT, rel).text
        : kinds[0] === "drillModule" ? buildModuleDrill(rel)
          : kinds[0] === "drill" ? buildDrillFragment(rel) : readLf(resolveInside(rel));
    } catch (e) {
      throw new Error(`片段读取失败：${rel}（${e.code || e.message}）`);
    }
    if (!text) throw new Error(`片段是空文件：${rel}`);
    parts.push({ label: rel, kind: kinds[0], text });
  });

  const modules = parts.filter((p) => p.kind === "module");
  if (modules.length !== 1) throw new Error(`module 段必须恰好一个，清单里有 ${modules.length} 个`);
  if (parts[0].label !== "lib/ui/shell/00-loader.js" || parts[1]?.label !== MODULE_ENTRY) {
    throw new Error("module 段必须紧随 ModuleLoader 片段，且位于所有旧功能片段之前");
  }

  const drills = parts.filter((p) => p.kind === "drill" || p.kind === "drillModule");
  if (drills.length !== 1) throw new Error(`drill 段必须恰好一个，清单里有 ${drills.length} 个`);

  /* 一一对应守卫：清单里的 file 与 lib/ui 下的实际文件必须互为全集。
     缺守卫的两个方向都真实翻车过：文件写了没登记 → 内容无声不进产物；
     清单删一条但文件留着 → 同样静默（清单不知道哪些文件「该在而没列上」）。 */
  const dupes = parts
    .filter((p, i) => p.kind === "file" && parts.findIndex((q) => q.label === p.label) !== i)
    .map((p) => p.label);
  if (dupes.length) throw new Error(`清单里同一片段出现了多次：${[...new Set(dupes)].join(", ")}`);

  const onDisk = listUiFiles();
  const listed = new Set(parts.filter((p) => p.kind === "file").map((p) => p.label));
  const orphans = onDisk.filter((rel) => !listed.has(rel));
  if (orphans.length) throw new Error(`片段文件存在但没进清单：${orphans.join(", ")}`);
  return parts;
}

/** 标记各出现一次，否则产物里会多出/缺少一整个演练台。 */
function assertSingleDrill(text) {
  const count = (needle) => text.split(needle).length - 1;
  const begins = count(BEGIN);
  const ends = count(END);
  if (begins !== 1 || ends !== 1) {
    throw new Error(`产物里 drill 标记必须各出现一次（BEGIN ${begins} / END ${ends}）`);
  }
}

function lineOf(text, index) {
  let n = 1;
  for (let i = 0; i < index && i < text.length; i += 1) if (text[i] === "\n") n += 1;
  return n;
}

/** 定位到**具体片段**，避免把 14k 行整个打出来。 */
function reportDiff(parts, expected, actual) {
  let off = 0;
  for (const p of parts) {
    const want = p.text;
    const got = actual.slice(off, off + want.length);
    if (got !== want) {
      let i = 0;
      while (i < want.length && i < got.length && want[i] === got[i]) i += 1;
      const local = lineOf(want, i);
      const global = lineOf(expected, off + i);
      /* 显示从行首起，不是从差异字符起——公共前缀吃掉后，报错里的「期望」
         会只剩半句（实测删行后曾显示 `期望：tRef = useRef(t);`，丢了 `const `）。 */
      const rowOf = (text, idx) => {
        const start = text.lastIndexOf("\n", idx - 1) + 1;
        return (text.slice(start).split("\n")[0] || "<文件结束>").slice(0, 160);
      };
      console.log(`首个差异：片段 ${p.label} 第 ${local} 行（client.js 第 ${global} 行）`);
      console.log(`  期望：${rowOf(want, i)}`);
      console.log(`  实际：${rowOf(got, i)}`);
      return;
    }
    off += want.length;
  }
  console.log(`片段全部匹配，但长度不同：拼装 ${expected.length} / 磁盘 ${actual.length} 字节`);
  const extra = actual.slice(expected.length, expected.length + 120);
  if (extra) console.log(`  磁盘多出的尾部：${JSON.stringify(extra)}`);
}

function main(argv) {
  const check = argv.includes("--check");
  const parts = buildParts();
  const next = parts.map((p) => p.text).join("");
  assertSingleDrill(next);

  /* 写盘不读旧文件：产物是可以从片段完整重建的，干净检出（还没有 client.js）
     也必须能构建。以前这里无条件读，缺文件时 ENOENT 直接崩。 */
  if (!check) {
    writeFileSync(CLIENT_PATH, next);
    console.log(`拼装完成：${parts.length} 段 → client.js（${Buffer.byteLength(next)} 字节）`);
    return 0;
  }

  let current;
  try {
    current = readFileSync(CLIENT_PATH, "utf8");
  } catch (e) {
    console.log(`client.js 不存在或读不到（${e.code || e.message}）——还没构建过。修法：npm run build:client。`);
    return 1;
  }
  if (next === current) {
    console.log(`client.js 与拼装结果一致（${parts.length} 段，${Buffer.byteLength(next)} 字节）`);
    return 0;
  }
  console.log("client.js 与拼装结果不一致 —— 产物被手改过，或改了片段却没重建。");
  reportDiff(parts, next, current);
  console.log("修法：改 src/ui 模块、lib/ui 片段或 lib/redteam/client.js，再 npm run build:client。不要手改 client.js。");
  return 1;
}

process.exitCode = main(process.argv.slice(2));
