#!/usr/bin/env node
/**
 * 结构与规范门禁（零依赖，Node 原生实现）
 *
 * 为什么不用 eslint / prettier：
 *   本插件不发 npm 包，安装器只做「复制目录 + 改 profile 的 package.json」，
 *   项目里没有 node_modules。引入 lint 依赖要么联网安装、要么把 node_modules
 *   塞进发布包，两者都不可接受。所以这里只做**能用文本规则可靠判定**的那部分，
 *   其余（函数复杂度、类型、模块边界）留给人工评审。
 *
 * 两类规则：
 *   硬规则（无基线，违反即失败）
 *     H1 源文件不得有 UTF-8 BOM
 *     H2 新增文件不得用 CRLF（存量文件按基线放行，但不得新增）
 *     H3 lib/bin/scripts/test 下不得有 *.bak* / *.orig / *~ 之类的残留文件
 *     H4 巨型文件冻结：基线里 ≥2000 行的文件不得继续变长（新文件也不得超过）
 *   棘轮规则（只允许持平或变好，基线见 .lint-baseline.json）
 *     R1 no-op catch 数——静默吞异常，是「界面报成功、实际没生效」的温床
 *     R2 console.* 调用数——lib/ 运行时模块应逐步收敛到统一的 logger
 *        （bin/ 与 scripts/ 是命令行工具，console 就是输出接口，不受此限）
 *     R3 少数派引号数——防止单引号文件里继续混入双引号（反之亦然）
 *     R4 少数派缩进数——防止 tab / 空格在同一文件里继续互相渗透
 *     R5 裸失败结果数——`{ ok: false }` 所在的对象字面量里既没有 `error` 也没有
 *        展开（`...`），等于「失败了但没说为什么」。契约见 docs/design/错误模型.md
 *
 * 棘轮的含义：存量债务不清零也能通过，但**新写的代码不能再欠**。
 * 确需重设基线时用 --update，并在提交信息里写明理由。
 *
 * 用法：
 *   node scripts/lint.mjs            # 检查，有违规退出 1
 *   node scripts/lint.mjs --report   # 只打印指标表，不做判定（退出 0）
 *   node scripts/lint.mjs --update   # 按当前树重设基线
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = fileURLToPath(import.meta.url);
export const ROOT = process.env.XSDSH_PLUGIN_ROOT
  ? process.env.XSDSH_PLUGIN_ROOT
  : join(HERE, "..", "..");
const BASELINE_PATH = join(ROOT, ".lint-baseline.json");

/* 扫描范围：源码与测试。docs/、presets/、skills/ 是内容资产，不按代码规范管。
   client.js 不在扫描范围内：它是 lib/ui 片段 + src/ui 模块（含 drillModule: "Drill"
   演练台）的拼装产物；lib/redteam/client.js 是历史源，不在当前拼装清单里。
   规范由源片段/模块承担。把产物也统计进来，同一段代码会被算两遍，改片段还要手动维护
   两份基线——基线一旦不同步，门禁就会在「产物是新的、基线是旧的」上误报。 */
const SCAN_DIRS = ["lib", "src", "bin", "scripts", "test"];
/* 根目录的文档是给人看的唯一入口，行尾/乱码错了没人发现（实测被编辑器整份转 CRLF
   时门禁是绿的）。只收硬规则（BOM/CRLF），不收棘轮：文档没有「代码风格」可言。 */
const ROOT_MD = ["README.md", "README.zh-CN.md", "使用教程.md"];
/* test/fixtures 是测试替身，test/output 是运行产物，都不参与规范统计。 */
const SKIP_DIRS = new Set(["node_modules", ".git", ".audit", "fixtures", "output"]);
const TEXT_EXT = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".css", ".json", ".yml", ".yaml", ".md"]);
const GOD_FILE_LINES = 2000;

/* 空 catch：`catch {}` / `catch (e) { }` / 体内只有注释。 */
const NOOP_CATCH = /\bcatch\s*(?:\([^)]*\))?\s*\{(?:\s*(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/))*\s*\}/g;
const CONSOLE_CALL = /\bconsole\.(?:log|warn|error|info|debug|trace)\s*\(/g;
const DOUBLE_QUOTED = /"[^"\n]*"/g;
const SINGLE_QUOTED = /'[^'\n]*'/g;
const FORBIDDEN_NAME = /\.(?:bak|orig|old|copy)(?:[-.]|$)|~$/i;

/** 递归收集待扫描文件（绝对路径）。 */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(join(dir, entry.name), out);
    } else if (entry.isFile()) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

function extOf(file) {
  const at = file.lastIndexOf(".");
  return at < 0 ? "" : file.slice(at).toLowerCase();
}

/** 待扫描文件清单（相对 ROOT，统一用 / 分隔，便于跨平台比对基线）。 */
export function listFiles(root = ROOT) {
  const files = [];
  for (const dir of SCAN_DIRS) files.push(...walk(join(root, dir)));
  for (const f of ROOT_MD) {
    const abs = join(root, f);
    if (existsSync(abs)) files.push(abs);
  }
  return files
    .filter((f) => TEXT_EXT.has(extOf(f)))
    .map((f) => relative(root, f).split(sep).join("/"))
    .sort();
}

/** 残留文件（*.bak / *.orig / *~）清单。 */
export function listResidue(root = ROOT) {
  const hits = [];
  for (const dir of SCAN_DIRS) {
    for (const abs of walk(join(root, dir))) {
      const name = abs.split(sep).pop() || "";
      if (FORBIDDEN_NAME.test(name)) hits.push(relative(root, abs).split(sep).join("/"));
    }
  }
  return hits.sort();
}

/** 统计匹配次数，跳过落在字符串字面量里的匹配。 */
function countMatches(text, re) {
  let count = 0;
  for (const m of text.matchAll(re)) {
    if (!inStringAt(text, m.index)) count += 1;
  }
  return count;
}

/* 引号字符的码位：34 双引号 / 39 单引号 / 96 反引号。
   用码位而不是字面量，避免本文件自己触发 R3 引号统计。 */
const QUOTE_CODES = new Set([34, 39, 96]);

/**
 * 判断某个下标是否落在字符串字面量里（同一行内判定）。
 * 补丁表里大量「宿主源码」是以字符串形式存在的，里面的 catch / console 不是本仓代码。
 */
function inStringAt(text, index) {
  const lineStart = text.lastIndexOf("\n", index) + 1;
  let quote = null;
  for (let i = lineStart; i < index; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") { i += 1; continue; }
      if (ch === quote) quote = null;
    } else if (QUOTE_CODES.has(ch.charCodeAt(0))) {
      quote = ch;
    }
  }
  return quote !== null;
}

/**
 * 从 `index` 往回找最近一层未闭合的 `{`（对象/块字面量的起点）。
 * 找不到返回 -1。字符串里的花括号会造成误判，属可接受的启发式。
 */
function enclosingBrace(text, index) {
  let depth = 0;
  for (let i = index - 1; i >= 0; i -= 1) {
    const ch = text[i];
    if (ch === "}") depth += 1;
    else if (ch === "{") {
      if (depth === 0) return i;
      depth -= 1;
    }
  }
  return -1;
}

/** 从 `start` 处的 `{` 起，找与之配对的 `}` 下标。 */
function matchingBrace(text, start) {
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * 统计「裸失败结果」：`ok: false` 所在的对象字面量里既没有 `error` 也没有展开。
 * 注释里的示例不算（`// ok: false` 与块注释里的 `*` 行）。
 */
export function countBareFailures(text) {
  let count = 0;
  const re = /\bok\s*:\s*false\b/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const idx = m.index;
    const lineStart = text.lastIndexOf("\n", idx) + 1;
    const lineEnd = text.indexOf("\n", idx);
    const prefix = text.slice(lineStart, idx);
    if (prefix.includes("//") || prefix.includes("/*")) continue;
    if (inStringAt(text, idx)) continue;
    const lineText = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd);
    if (/^\s*\*/.test(lineText)) continue;
    const start = enclosingBrace(text, idx);
    if (start < 0) continue;
    const end = matchingBrace(text, start);
    if (end < 0) continue;
    const literal = text.slice(start, end + 1);
    /* 认的是「error / errors 作为键」，不是字面量里出现 error 这个词——
       `reason: error?.message` 这种写法仍然是裸失败。 */
    if (/(?:^|[,{]\s*)errors?\s*:/.test(literal)) continue;
    if (literal.includes("...")) continue;
    count += 1;
  }
  return count;
}

/**
 * 单文件指标。纯函数，便于单测。
 * @param {string} text 文件全文（BOM 保留在首字符）
 */
export function analyzeSource(text) {
  const body = text.endsWith("\n") ? text.slice(0, -1) : text;
  let tab = 0;
  let space = 0;
  for (const line of body.split("\n")) {
    if (/^\t+\S/.test(line)) tab += 1;
    else if (/^ +\S/.test(line)) space += 1;
  }
  return {
    lines: body.split("\n").length,
    noopCatch: countMatches(text, NOOP_CATCH),
    consoleCalls: countMatches(text, CONSOLE_CALL),
    dq: [...text.matchAll(DOUBLE_QUOTED)].length,
    sq: [...text.matchAll(SINGLE_QUOTED)].length,
    tab,
    space,
    bareFailures: countBareFailures(text),
    crlf: text.includes("\r\n"),
    bom: text.charCodeAt(0) === 0xfeff,
  };
}

/** 整棵树的指标表：{ 相对路径: 指标 }。 */
export function collectMetrics(root = ROOT) {
  const metrics = {};
  for (const rel of listFiles(root)) {
    let text;
    try {
      text = readFileSync(join(root, rel), "utf8");
    } catch {
      continue;
    }
    metrics[rel] = analyzeSource(text);
  }
  return metrics;
}

export function loadBaseline(root = ROOT) {
  const p = join(root, ".lint-baseline.json");
  if (!existsSync(p)) return { version: 1, files: {} };
  try {
    const parsed = JSON.parse(readFileSync(p, "utf8"));
    return { version: parsed.version || 1, files: parsed.files || {} };
  } catch {
    return { version: 1, files: {} };
  }
}

/**
 * 判定：纯函数，输入指标表 + 基线，输出违规列表。
 * 单测靠它造合成数据，不必碰真实文件。
 */
export function evaluate(metrics, baseline, residue = []) {
  const violations = [];
  const files = baseline.files || {};
  const add = (rule, file, message) => violations.push({ rule, file, message });

  for (const rel of Object.keys(metrics).sort()) {
    const m = metrics[rel];
    const base = files[rel];
    /* 测试里会故意构造坏形状验证兼容逻辑，R5 只管生产代码。 */
    const isTest = rel.startsWith("test/");
    /* lib/patches/ 是纯数据表（补丁定义），行数多但无逻辑，不受巨型文件冻结约束。 */
    const isPureData = rel.startsWith("lib/patches/");

    if (m.bom) add("H1", rel, "含 UTF-8 BOM");

    /* 根目录文档只受 H1/H2：文档没有「代码风格」，R 系规则对它只会制造噪音。
       但 BOM 与行尾错了没人会盯着看（实测被编辑器整份转 CRLF 时门禁是绿的）。 */
    const isDoc = ROOT_MD.includes(rel);

    if (!base) {
      /* 新文件：只要求不欠新债，不要求符合全仓多数派风格。 */
      if (m.crlf) add("H2", rel, "新文件使用了 CRLF（应为 LF）");
      if (isDoc) continue;
      if (m.noopCatch > 0) add("R1", rel, `新文件含 ${m.noopCatch} 个 no-op catch`);
      if (m.bareFailures > 0 && !isTest) {
        add("R5", rel, `新文件含 ${m.bareFailures} 处裸失败结果（缺 error 键）`);
      }
      if (m.lines > GOD_FILE_LINES && !isPureData) {
        add("H4", rel, `新文件 ${m.lines} 行，超过 ${GOD_FILE_LINES} 行上限`);
      }
      continue;
    }

    if (m.crlf && !base.crlf) add("H2", rel, "新增了 CRLF 行尾（基线为 LF）");
    if (isDoc) continue;
    if (base.lines >= GOD_FILE_LINES && m.lines > base.lines && !isPureData) {
      add("H4", rel, `巨型文件不得增长：${base.lines} → ${m.lines} 行`);
    }
    if (m.noopCatch > base.noopCatch) {
      add("R1", rel, `no-op catch ${base.noopCatch} → ${m.noopCatch}`);
    }
    /* R2 只管 lib/ 的运行时模块：bin/ 与 scripts/ 是命令行工具，console 就是它的
       输出接口；lib/ui/ 是浏览器侧片段，没有 Node logger 可用，console 同样是唯一出口。
       只有会被宿主 require 的运行时模块才需要收敛到统一 logger。 */
    if (m.consoleCalls > base.consoleCalls && rel.startsWith("lib/") && !rel.startsWith("lib/ui/")) {
      add("R2", rel, `console.* ${base.consoleCalls} → ${m.consoleCalls}`);
    }
    const mq = Math.min(m.dq, m.sq);
    const bq = Math.min(base.dq, base.sq);
    if (mq > bq) add("R3", rel, `少数派引号 ${bq} → ${mq}`);
    const mi = Math.min(m.tab, m.space);
    const bi = Math.min(base.tab, base.space);
    if (mi > bi) add("R4", rel, `少数派缩进 ${bi} → ${mi}`);
    if (m.bareFailures > (base.bareFailures || 0) && !isTest) {
      add("R5", rel, `裸失败结果 ${base.bareFailures || 0} → ${m.bareFailures}（必须带 error 键）`);
    }
  }

  for (const rel of residue) add("H3", rel, "残留文件（.bak/.orig/~）不应留在源码目录");

  return violations;
}

/** 一次性检查：收集 + 判定。 */
export function checkTree(root = ROOT) {
  const metrics = collectMetrics(root);
  const baseline = loadBaseline(root);
  return {
    metrics,
    baseline,
    violations: evaluate(metrics, baseline, listResidue(root)),
  };
}

function fmtInt(n) {
  return String(n).padStart(6);
}

function printReport(metrics) {
  console.log("文件".padEnd(46) + "行数".padStart(7) + "noop".padStart(7) + "console".padStart(8) + "少数引号".padStart(9) + "少数缩进".padStart(9) + "裸失败".padStart(7));
  console.log("-".repeat(94));
  for (const rel of Object.keys(metrics).sort()) {
    const m = metrics[rel];
    console.log(
      rel.padEnd(46)
      + fmtInt(m.lines)
      + fmtInt(m.noopCatch)
      + fmtInt(m.consoleCalls)
      + fmtInt(Math.min(m.dq, m.sq))
      + fmtInt(Math.min(m.tab, m.space))
      + fmtInt(m.bareFailures),
    );
  }
}

function buildBaseline(metrics) {
  const files = {};
  for (const rel of Object.keys(metrics).sort()) {
    const m = metrics[rel];
    files[rel] = {
      lines: m.lines,
      noopCatch: m.noopCatch,
      consoleCalls: m.consoleCalls,
      dq: m.dq,
      sq: m.sq,
      tab: m.tab,
      space: m.space,
      bareFailures: m.bareFailures,
      crlf: m.crlf,
    };
  }
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    note: "棘轮基线：只允许持平或变好。确需放宽时运行 npm run lint:update，并在提交信息写明理由。",
    files,
  };
}

function main(argv) {
  const report = argv.includes("--report");
  const update = argv.includes("--update");
  const { metrics, baseline, violations } = checkTree(ROOT);

  if (report) {
    printReport(metrics);
    return 0;
  }

  if (update) {
    const next = buildBaseline(metrics);
    const prev = baseline.files || {};
    const added = Object.keys(next.files).filter((k) => !prev[k]);
    const removed = Object.keys(prev).filter((k) => !next.files[k]);
    /* 新增/移除之外，「数值变了但文件没动」也要点名：这类多半是与本次改动无关的
       存量漂移（上次有人改了文件却忘了 --update，或改的不是这批）。不点名的话，
       它会混进本次基线，从此没人说得清是哪次动的。 */
    const changed = Object.keys(next.files).filter((k) => prev[k] && JSON.stringify(prev[k]) !== JSON.stringify(next.files[k]));
    writeFileSync(BASELINE_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
    console.log(`基线已更新：${BASELINE_PATH}`);
    console.log(`  文件数 ${Object.keys(next.files).length}，新增 ${added.length}，移除 ${removed.length}，数值变化 ${changed.length}`);
    if (added.length) console.log(`  新增：${added.join(", ")}`);
    if (removed.length) console.log(`  移除：${removed.join(", ")}`);
    if (changed.length) console.log(`  数值变化（既有文件，请确认与本次改动有关）：${changed.join(", ")}`);
    console.log("  注意：本操作只应发生在「有意放宽」时，请在提交信息里说明理由。");
    return 0;
  }

  console.log(`结构与规范门禁：扫描 ${Object.keys(metrics).length} 个文件`);
  const residue = listResidue(ROOT);
  if (residue.length && !violations.some((v) => v.rule === "H3")) {
    for (const rel of residue) console.log(`  [H3] ${rel} 残留文件`);
  }
  if (!violations.length) {
    console.log("结果：通过（0 违规）");
    return 0;
  }

  const byRule = new Map();
  for (const v of violations) {
    if (!byRule.has(v.rule)) byRule.set(v.rule, []);
    byRule.get(v.rule).push(v);
  }
  const ruleName = {
    H1: "BOM",
    H2: "行尾",
    H3: "残留文件",
    H4: "巨型文件",
    R1: "no-op catch",
    R2: "console.*",
    R3: "引号风格",
    R4: "缩进风格",
    R5: "裸失败结果",
  };
  for (const rule of [...byRule.keys()].sort()) {
    console.log(`\n[${rule}] ${ruleName[rule] || ""}`);
    for (const v of byRule.get(rule)) console.log(`  ✖ ${v.file}  ${v.message}`);
  }
  console.log(`\n结果：失败（${violations.length} 条违规）`);
  console.log("修法：改代码，或（确属有意放宽时）运行 npm run lint:update 并在提交信息说明理由。");
  return 1;
}

const invokedDirectly =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (invokedDirectly) {
  process.exitCode = main(process.argv.slice(2));
}
