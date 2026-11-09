/**
 * 尾部锚点的纯文本测试：段名/排序、子会话判定、开关、越界保护。
 * 不加载宿主，不需要 DSH_HOME。
 */
import {
  ANCHOR_SECTION, ANCHOR_ORDER, ANCHOR_MODES, DEFAULT_ANCHOR_MODE,
  isSubagentContext, anchorTextFor, normalizeAnchorMode, buildAnchorSection,
  OPERATOR_ANCHOR_TEXT, CHILD_ANCHOR_TEXT,
} from "../lib/anchor.js";
import { GLOBAL_PROMPT_ORDER } from "../lib/identity.js";

let pass = 0;
let fail = 0;
function ok(name, cond, extra) {
  if (cond) {
    pass += 1;
    return;
  }
  fail += 1;
  console.log(`  FAIL  ${name}${extra === undefined ? "" : "  → " + JSON.stringify(extra)}`);
}
function eq(name, actual, expected) {
  const same = JSON.stringify(actual) === JSON.stringify(expected);
  ok(name, same, same ? undefined : { actual, expected });
}

/* ── 常量与排序 ───────────────────────────────────────────────────────── */
eq("段名", ANCHOR_SECTION, "Xsdsh-purge-next:anchor");
eq("两种模式", ANCHOR_MODES, ["tail", "off"]);
eq("默认开", DEFAULT_ANCHOR_MODE, "tail");
ok("排序在人设 10200 之后", ANCHOR_ORDER > 10200, ANCHOR_ORDER);
ok("排序在全局段之后", ANCHOR_ORDER > GLOBAL_PROMPT_ORDER, { ANCHOR_ORDER, GLOBAL_PROMPT_ORDER });
ok("排序与 postPrompt 默认 5100 不冲突", ANCHOR_ORDER > 5100);

/* ── 子会话判定 ───────────────────────────────────────────────────────── */
const sub = (header) => isSubagentContext({ agent: { session: { header } } });
eq("origin=subagent 算子会话", sub({ origin: "subagent" }), true);
eq("delegationDepth>0 算子会话", sub({ delegationDepth: 2 }), true);
eq("parentSession 算子会话", sub({ parentSession: "s-1" }), true);
eq("普通会话不算", sub({ origin: "user" }), false);
eq("header 缺失不算", isSubagentContext({}), false);
eq("context 为空不算", isSubagentContext(null), false);

/* ── 文本 ─────────────────────────────────────────────────────────────── */
ok("主会话锚点有标记", OPERATOR_ANCHOR_TEXT.startsWith("[OPERATOR ANCHOR — ACTIVE]"), OPERATOR_ANCHOR_TEXT.slice(0, 40));
ok("子会话锚点有标记", CHILD_ANCHOR_TEXT.startsWith("[SUBAGENT ANCHOR — ACTIVE]"), CHILD_ANCHOR_TEXT.slice(0, 40));
ok("主会话锚点是 8 条", OPERATOR_ANCHOR_TEXT.split("\n").filter((l) => /^\d+\./.test(l)).length === 8);
ok("子会话锚点是 3 条", CHILD_ANCHOR_TEXT.split("\n").filter((l) => /^\d+\./.test(l)).length === 3);
ok("主会话锚点不超过 900 字符（不能把提示词撑胖）", OPERATOR_ANCHOR_TEXT.length <= 900, OPERATOR_ANCHOR_TEXT.length);
ok("子会话锚点不超过 400 字符", CHILD_ANCHOR_TEXT.length <= 400, CHILD_ANCHOR_TEXT.length);
ok("没有空行（DSH 会把空行当分段）", !/\n\s*\n/.test(OPERATOR_ANCHOR_TEXT) && !/\n\s*\n/.test(CHILD_ANCHOR_TEXT));

/* ── anchorTextFor ───────────────────────────────────────────────────── */
eq("默认给主会话文本", anchorTextFor(), OPERATOR_ANCHOR_TEXT);
eq("子会话给子会话文本", anchorTextFor({ context: { agent: { session: { header: { origin: "subagent" } } } } }), CHILD_ANCHOR_TEXT);
eq("off 给空串", anchorTextFor({ mode: "off" }), "");
eq("off 优先于子会话", anchorTextFor({ mode: "off", context: { agent: { session: { header: { origin: "subagent" } } } } }), "");

/* ── 配置归一 ─────────────────────────────────────────────────────────── */
eq("tail 保留", normalizeAnchorMode("tail"), "tail");
eq("OFF 大小写不敏感", normalizeAnchorMode("OFF"), "off");
eq("带空格也行", normalizeAnchorMode("  Tail "), "tail");
eq("乱写回落默认", normalizeAnchorMode("whatever"), "tail");
eq("undefined 回落默认", normalizeAnchorMode(undefined), "tail");
eq("null 回落默认", normalizeAnchorMode(null), "tail");

/* ── 段描述 ───────────────────────────────────────────────────────────── */
const sec = buildAnchorSection();
eq("段名一致", sec.name, ANCHOR_SECTION);
eq("排序一致", sec.order, ANCHOR_ORDER);
eq("不做插值", sec.interpolate, false);
eq("text 是函数", typeof sec.text, "function");
eq("text 返回主会话文本", sec.text({}), OPERATOR_ANCHOR_TEXT);
eq("text 对子会话切换", sec.text({ agent: { session: { header: { delegationDepth: 1 } } } }), CHILD_ANCHOR_TEXT);
eq("off 时 text 返回空", buildAnchorSection({ mode: "off" }).text({}), "");

let threw = false;
try {
  buildAnchorSection({ minOrder: 10400 });
} catch {
  threw = true;
}
ok("排序越界要抛（静默排错位置更糟）", threw);

/* ── 收尾 ─────────────────────────────────────────────────────────────── */
console.log(`\n结果: ${pass} PASS / ${fail} FAIL`);
if (fail > 0) process.exit(1);
