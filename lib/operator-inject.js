/**
 * 提示词「挂起算子」（hung operator）与注入快照。
 *
 * 从 lib/index.js 拆出（P2-2 第二刀）。拆出的原因不是行数，而是 `/override` 与
 * `/apply` 都要读写同一份缓存：`hungCache` 的唯一所有者必须就是 `refreshHungOperator`，
 * 否则两条路由各自 import 一份状态，缓存失效条件会分裂。
 *
 * `installHungPromptGlobal` 仍留在 index.js —— 它依赖 purgeLog 与 host 侧兜底链，
 * 不属于这组纯读 / 同步逻辑。
 */
import fs from "node:fs";
import * as core from "./core.js";
import * as rules from "./rules.js";

/** 提示词框自改 > prompt-inject.md > 加密默认（见 rules.resolveInjectText）。 */
// mtime 节流:400ms setInterval + 每 pre-step + 每 preset-selected + 每 readInjectFallback
// 的高频触发下,disk sync + 3 次 hashOverride + 2 次模块级赋值一轮能点 20 次。
// 短窗复用上次结果:home 没换 + 文件 mtime 没变 + 距上次 < 200ms,直接返回缓存。
let hungCache = { home: "", mtime: 0, at: 0, resolved: null };
const HUNG_CACHE_MS = 200;

/* sync 失败不阻断 refresh：resolveInjectText 会直接读盘。显式返回布尔而不是空 catch，
   否则 R1 会把它判成「静默吞异常」。/override 的 seed 兜底共用同一实现。 */
export function attempt(fn) {
  try {
    fn();
    return true;
  } catch {
    return false;
  }
}

function statInjectMtimeMs(home) {
  if (!home) return 0;
  try {
    return Math.floor(fs.statSync(core.findOverrideFile(home)).mtimeMs);
  } catch { return 0; }
}

export function refreshHungOperator(dshHome = core.findDshHome()) {
  const home = core.pinDshHome() || dshHome || core.findDshHome();
  const now = Date.now();
  const mtimeBefore = statInjectMtimeMs(home);
  if (
    hungCache.resolved
    && hungCache.home === home
    && hungCache.mtime === mtimeBefore
    && now - hungCache.at < HUNG_CACHE_MS
  ) {
    return hungCache.resolved;
  }
  attempt(() => core.syncPromptInjectOnDiskSync(home));
  const resolved = rules.resolveInjectText(home);
  // 兜底顺序:resolved.text > 加密默认 > 永不空串(避免二轮 fallbackInject 为空走 purge[] 残留)。
  const fallback = core.normalizeOverride(core.defaultOverrideText()) || "";
  // 框、磁盘、加密槽保持原样。发给模型只整理 ChatML 单独成行，并补上缺失的闭合标签。
  const text = resolved.text || fallback;
  if (text) {
    core.hangOperatorPrompt(text);
    // 与点「保存」同一钉钉：不点保存，组装也要读到这一份全文。
    core.rememberCommittedOverride(home, text);
  }
  const out = { ...resolved, text: text || resolved.text };
  // 用 sync 之后的 mtime 存 cache,下次高频轮询(文件没被外部动)直接命中。
  hungCache = { home, mtime: statInjectMtimeMs(home), at: now, resolved: out };
  return out;
}

export function injectSnapshot(dshHome = core.findDshHome()) {
  const resolved = rules.resolveInjectText(dshHome);
  return {
    injectSource: resolved.source,
    injectRuleId: resolved.ruleId,
    needPrompt: resolved.source === "none",
  };
}

/** 框里正在显示的字优先；框空则 resolveInjectText（含 prompt-inject.md）。 */
function injectSnapshotFromBox(dshHome, boxText) {
  if (typeof boxText === "string" && core.normalizeOverride(boxText)) {
    return { injectSource: "prompt", injectRuleId: null, needPrompt: false };
  }
  const resolved = rules.resolveInjectText(dshHome);
  if (resolved.text) {
    return { injectSource: resolved.source, injectRuleId: null, needPrompt: false };
  }
  return { injectSource: "none", injectRuleId: null, needPrompt: true };
}

const NEED_PROMPT_ERROR = "提示词和规则集都是空的，必须先添加提示词";

export function rejectIfNeedPrompt(dshHome, boxText) {
  const snap = injectSnapshotFromBox(dshHome, boxText);
  if (!snap.needPrompt) return null;
  return { ...snap, error: NEED_PROMPT_ERROR };
}
