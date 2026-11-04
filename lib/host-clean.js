/**
 * 重启前看系统提示词文件：确认注入保留逻辑确实写进去了。
 *
 * 这个函数的返回值决定一件很重的事：false 就取消重启、不挪 app.asar、
 * 其余改宿主树的补丁全部不生效。所以宁可保守（判 false 让用户看到问题），
 * 也不要乐观误判（判 true 然后带着没打补丁的宿主跑起来）。
 *
 * 三层判定，从最硬的证据到结构：
 *   1. 标记 —— 我们确实写过，最硬的证据。
 *   2. 结构 —— sections 分支里真的引用了注入段。
 *   3. 兜底 —— 只在「能证明洗过」时给 true，证明不了就 false。
 */

// 第 1 层：标记。历史上出现过多种尾巴，只认前缀，别认整句。
const MARKER_RE = /\[Xsdsh-purge-next\]\s*(?:complete prompt )?keeps?\b/i;
const MARKER_CLOSER = "[Xsdsh-purge-next] inject last after closer";

// 第 2 层：sections 分支里真的把注入段拼进去了。
// 同时接受两种写法：
//   sections: completeSection === void 0 ? [...xsdshPurgeSections, completeSection]
//   sections: [...xsdshPurgeSections, ...xsdshPurgeRest]
const STRUCT_INJECT_RE = /\[\s*\.\.\.xsdshPurgeSections\b[^\]]*\]/;

// 反向证据：sections 分支直接丢掉了注入（不管用什么比较写法）。
// `=== void 0` / `== null` / `=== undefined` 都算 —— 子代理实测过
// 只认 `=== void 0` 时，宿主换个写法就会被误判成「已洗干净」。
const DROPS_INJECT_RE =
  /sections:\s*completeSection\s*={2,3}\s*(?:void 0|null|undefined)[\s\S]{0,160}?\?\s*transformed\.sections\s*:\s*\[\s*completeSection\s*\]/;

function hasMarker(body) {
  return MARKER_RE.test(body) || body.includes(MARKER_CLOSER);
}

function hasStructuralInject(body) {
  // 变量必须真的被定义过，且真的被展开进 sections。
  // 只出现变量名不算（注释里、补丁源里都可能出现）。
  if (!/\bconst\s+xsdshPurgeSections\b/.test(body)) return false;
  return STRUCT_INJECT_RE.test(body);
}

export function hostPromptKeepsInject(text) {
  const body = String(text || "");

  // 1) 标记 —— 最硬的证据。
  if (hasMarker(body)) return true;

  // 2) 结构 —— 注入段真的进了 sections。
  if (hasStructuralInject(body)) return true;

  // 3) 不是这份模块 / 空文件，不能当成已经洗过。
  if (!body.includes("system-prompt/assemble")) return false;

  // 4) 兜底：只在**能证明**洗过时给 true。
  //
  // 这里以前写的是 `return !identityLeft && !dropsInject` —— 方向反了：
  // 宿主只要换个比较写法（`== null`）或改个变量名，两个「没洗」的证据
  // 都匹配不上，就返回 true，于是带着没打补丁的宿主重启、挪走 asar、
  // 其余补丁全部空转，UI 还显示「已清洗」。
  //
  // 现在改成：有明确的反向证据 → false；没有反向证据但也**没有正向证据**
  // → 也 false（保守）。只有「身份句已清」这种可验证的清理才放行。
  if (DROPS_INJECT_RE.test(body)) return false;
  if (body.includes("You are an AI agent powered by DeepSeek Harness.")) return false;

  // 到这里既没有标记、也没有结构证据、也没有反向证据 ——
  // 说明宿主结构和我们认识的都对不上。判 false，让用户看到问题，
  // 而不是乐观放行。
  return false;
}

/** 诊断用：说清楚是哪一条不过，好让 UI 能报具体原因而不是一句「没洗干净」。 */
export function explainHostPromptClean(text) {
  const body = String(text || "");

  // 顺序必须和 hostPromptKeepsInject 完全一致，否则 UI 报的原因
  // 会和实际行为对不上（子代理实测过两者不一致）。
  if (hasMarker(body)) {
    return { clean: true, reason: MARKER_RE.test(body) ? "marker" : "marker-closer" };
  }
  if (hasStructuralInject(body)) return { clean: true, reason: "structure" };

  if (!body.includes("system-prompt/assemble")) return { clean: false, reason: "not-this-module" };
  if (DROPS_INJECT_RE.test(body)) return { clean: false, reason: "sections-drops-inject" };
  if (body.includes("You are an AI agent powered by DeepSeek Harness.")) {
    return { clean: false, reason: "identity-left" };
  }
  return { clean: false, reason: "structure-unknown" };
}
