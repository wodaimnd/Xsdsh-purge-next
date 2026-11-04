/**
 * 宿主当前模型的只读选择器。
 * 提示词改写产品已移除；保留此导出路径供 refusal-test 使用。
 * 不读取提示词文件、不调用模型、不写入用户配置。
 */
export function currentRoute(ctx) {
  try {
    const def = ctx && typeof ctx.get === "function" ? ctx.get("agentDefaultModel") : undefined;
    if (def && typeof def.currentSelection === "function") {
      const sel = def.currentSelection();
      if (sel && typeof sel.provider === "string" && sel.provider && typeof sel.model === "string" && sel.model) {
        return { provider: sel.provider, model: sel.model };
      }
    }
  } catch {
    /* 服务缺失或读取失败时不选择替代模型。 */
  }
  return undefined;
}
