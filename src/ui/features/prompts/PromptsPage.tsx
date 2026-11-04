import React from "../../host/react";
import { PROMPT_MODES, type PromptsController } from "./controller";
import css from "./prompts.css";

export function PromptsPage({ controller }: { controller: PromptsController }) {
  const [state, setState] = React.useState(controller.getSnapshot);
  const cancel = React.useRef<HTMLButtonElement>(null);
  const accept = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    const update = () => setState(controller.getSnapshot());
    const unsubscribe = controller.subscribe(update);
    update();
    if (!Object.keys(controller.getSnapshot().records).length && !controller.getSnapshot().loading) void controller.load();
    return unsubscribe;
  }, [controller]);
  React.useEffect(() => {
    if (!state.confirmation) return;
    const previous = document.activeElement;
    cancel.current?.focus();
    return () => { if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, [state.confirmation]);
  const record = state.records[state.active];
  const draft = state.drafts[state.active] ?? "";
  const dirty = controller.isDirty();
  const locked = state.loading || state.busy;
  const label = PROMPT_MODES.find(mode => mode.id === state.active)!.label;
  const error = state.error ? state.message : record?.error;
  return <section data-xsdsh-ui="prompts" className="xsdsh-prompts-page" aria-label="模式提示词" aria-busy={locked}>
    <style>{css}</style>
    <header className="xsdsh-prompts-heading"><div><h2>模式提示词</h2><p>红队与逆向模式的系统提示词原文。</p></div>
      <button type="button" disabled={locked || !!state.confirmation} onClick={() => void controller.load()}>{state.loading ? "读取中…" : "重新读取"}</button></header>
    <div className="xsdsh-prompts-layout">
      <nav aria-label="选择模式" className="xsdsh-prompts-modes">{PROMPT_MODES.map(mode => {
        const item = state.records[mode.id];
        return <button type="button" key={mode.id} aria-current={state.active === mode.id ? "page" : undefined} disabled={locked || !!state.confirmation} onClick={() => controller.switchTo(mode.id)}>
          <strong>{mode.label}{controller.isDirty(mode.id) ? " ●" : ""}</strong>
          <span>{item?.error ? "读取失败" : item ? `${item.isCustom ? "自定义覆盖" : "随包默认"} · ${Array.from(state.drafts[mode.id] ?? item.current).length} 字` : state.loading ? "读取中…" : "尚未读取"}</span>
        </button>;
      })}</nav>
      <div className="xsdsh-prompts-workspace">
        <div className="xsdsh-prompts-editor-head"><h3>{label}{dirty ? " ● 未保存" : ""}</h3><span>{record && !record.error ? record.isCustom ? "自定义覆盖" : "随包默认" : ""}</span></div>
        {record?.savedAt && <p className="xsdsh-prompts-meta">上次保存：<time dateTime={record.savedAt}>{record.savedAt}</time></p>}
        <p className="xsdsh-prompts-note">保存的是自定义覆盖文件，包升级时会保留。改完需要完全退出并重启宿主才生效。</p>
        {error && <p role="alert" className="xsdsh-prompts-error">{error}</p>}
        <textarea aria-label={`${label}提示词`} spellCheck={false} value={draft} disabled={locked || !record || !!record.error || !!state.confirmation}
          placeholder={state.loading ? "正在读取提示词…" : "读取成功后可编辑"} onChange={event => controller.edit(event.target.value)} />
        <div className="xsdsh-prompts-actions">
          <button type="button" className="xsdsh-prompts-primary" disabled={locked || !record || !!record.error || !!state.confirmation || !dirty} onClick={() => void controller.save()}>{state.busy ? "处理中…" : "保存"}</button>
          <button type="button" disabled={locked || !record || !!record.error || !!state.confirmation} onClick={() => controller.requestReset()}>恢复当前默认</button>
          <button type="button" disabled={locked || !Object.keys(state.records).length || !!state.confirmation} onClick={() => controller.requestReset(true)}>全部恢复默认</button>
          <span>{Array.from(draft).length} 字{dirty ? " · 未保存" : ""}</span>
        </div>
        <p role="status" aria-live="polite" className="xsdsh-prompts-status">{state.loading ? "正在读取模式提示词…" : state.busy ? "正在写入，请稍候…" : !state.error ? state.message : ""}</p>
      </div>
    </div>
    {state.confirmation && <div className="xsdsh-prompts-shade"><div className="xsdsh-prompts-confirm" role="alertdialog" aria-modal="true" aria-label={state.confirmation.kind === "switch" ? "放弃未保存的修改" : "恢复默认提示词"}
      onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); controller.cancelConfirmation(); }
        if (event.key === "Tab") { event.preventDefault(); (document.activeElement === cancel.current ? accept.current : cancel.current)?.focus(); }
      }}>
      <h3>{state.confirmation.kind === "switch" ? "放弃未保存的修改？" : state.confirmation.all ? "恢复红队和逆向的默认提示词？" : `恢复${label}的默认提示词？`}</h3>
      <p>{state.confirmation.kind === "switch" ? "切换后，当前模式未保存的输入会被丢弃。" : "这会移除所选模式的自定义覆盖，丢弃未保存的输入，并写回默认提示词。完全退出并重启后生效。"}</p>
      <div className="xsdsh-prompts-actions"><button type="button" ref={cancel} onClick={() => controller.cancelConfirmation()}>取消</button><button type="button" ref={accept} className="xsdsh-prompts-primary" onClick={() => void controller.confirm()}>{state.confirmation.kind === "switch" ? "放弃并切换" : "确认恢复"}</button></div>
    </div></div>}
  </section>;
}
