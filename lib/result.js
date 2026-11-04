/**
 * 结果形状的唯一真源。契约见 `docs/design/错误模型.md`。
 *
 * 三种值不要混：
 *   成功结果  { ok: true, ...payload }
 *   失败结果  { ok: false, error: "<机器码>", detail?: "<人话>" }
 *   诊断记录  { status, reason }   —— 不是失败结果，不要用 error 表达
 *
 * 为什么要有这个文件：同一件事此前有 5 种写法（返回 {ok:false}、{ok:false,reason}、
 * 抛异常、返回 null、日志后继续），调用方无法预判失败形态。4.5.34 的「界面报已卸载、
 * 实际登记没撤」就是「失败没有统一出口」的直接后果。
 */

/**
 * 失败原因归一成机器码。
 * @param {unknown} value
 * @returns {string}
 */
function normalizeCode(value) {
  if (value == null) return "unknown";
  if (value instanceof Error) return value.message || value.name || "error";
  const text = String(value).trim();
  return text === "" ? "unknown" : text;
}

/**
 * 成功结果。非阻塞问题请放进 warnings，不要只写日志。
 * @param {object} [payload]
 * @returns {{ ok: true }}
 */
export function okResult(payload = {}) {
  return { ...payload, ok: true };
}

/**
 * 失败结果。
 * @param {string|Error} error 稳定的机器码（kebab-case），不要放长句
 * @param {string} [detail] 给人看的一句话
 * @param {object} [extra] 额外上下文（不会被 ok/error 覆盖）
 * @returns {{ ok: false, error: string }}
 */
export function failResult(error, detail, extra = {}) {
  const out = { ...extra, ok: false, error: normalizeCode(error) };
  if (detail != null && String(detail) !== "") out.detail = String(detail);
  return out;
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isOk(value) {
  return Boolean(value && typeof value === "object" && value.ok === true);
}

/**
 * 兼容层：把存量形状归一成契约形状。
 *
 * 只用于**跨模块边界的过渡期**。新代码不得依赖它产生 legacy 形状——
 * 生产方应当直接用 okResult / failResult。
 *
 * 识别顺序：ok:false 的 error → reason → err → message → unknown；
 * 没有 ok 键的对象按「老式成功载荷」处理（历史代码里 ok 是后加的）。
 *
 * @param {unknown} value
 * @returns {{ ok: boolean, error?: string, detail?: string }}
 */
export function normalizeResult(value) {
  if (value == null) return failResult("empty-result");
  if (typeof value === "string") return failResult(value);
  if (typeof value !== "object") return okResult({ value });

  if (value.ok === true) return value;
  if (value.ok === false) {
    if (value.error != null) {
      const out = failResult(value.error, value.detail != null ? value.detail : value.message);
      return { ...value, ...out };
    }
    if (value.reason != null) return failResult(value.reason, value.detail);
    if (value.err != null) return failResult(value.err, value.detail);
    if (value.message != null) return failResult("unknown", value.message);
    return failResult("unknown");
  }

  /* 没有 ok 键：历史代码里的「成功载荷」。
     若它只有 error/reason 字段，仍按失败处理，避免把错误当成功。 */
  if (value.error != null) return failResult(value.error, value.detail);
  if (value.reason != null && Object.keys(value).length <= 3) return failResult(value.reason);
  return okResult(value);
}

/**
 * 一行摘要，用于日志与诊断。不要把整段 payload 塞进日志。
 * @param {unknown} value
 * @param {{ maxDetail?: number }} [options]
 * @returns {string}
 */
export function describeResult(value, options = {}) {
  const maxDetail = options.maxDetail == null ? 200 : options.maxDetail;
  const r = normalizeResult(value);
  if (r.ok) {
    const warnings = Array.isArray(r.warnings) ? r.warnings.length : 0;
    return warnings ? `ok (${warnings} 条告警)` : "ok";
  }
  let text = `失败: ${r.error}`;
  if (r.detail) {
    const detail = String(r.detail);
    text += ` (${detail.length > maxDetail ? detail.slice(0, maxDetail) + "…" : detail})`;
  }
  return text;
}
