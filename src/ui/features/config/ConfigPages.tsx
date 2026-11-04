import React from "../../host/react";
import type { ChangeEvent } from "react";
import configCss from "./config.css";
import { createConfigController } from "./controller";
import type { ConfigRequest } from "./controller";
import { newVpsRow, sourceLabel } from "./model";
import type { ConfigDraft, ConfigScope, ConfigSnapshot, VpsDraft } from "./model";
import { SecretInput } from "../../components/SecretInput";

export interface GlobalConnectionConfigProps { request?: ConfigRequest }
export interface TargetConfigPageProps {
  /** Required stable engagement ID, never inferred from the server's active target. */
  engagement: string | null;
  targetName?: string;
  request?: ConfigRequest;
}
export function GlobalConnectionConfig({ request }: GlobalConnectionConfigProps) {
  return <ConfigEditor scope={{ kind: "global" }} request={request} />;
}
export function TargetConfigPage({ engagement, targetName, request }: TargetConfigPageProps) {
  if (!engagement?.trim()) return <section className="xsdsh-config" aria-label="目标配置">
    <style>{configCss}</style><h2>目标配置</h2><p role="status" className="xsdsh-config-empty">请先选择目标，再编辑此目标的 FOFA_KEY 与 VPS。</p>
  </section>;
  // Keyed boundary prevents even a single render of A's draft under B's target heading.
  return <ConfigEditor key={engagement} scope={{ kind: "target", engagement }} targetName={targetName} request={request} />;
}
type VpsField = keyof Pick<VpsDraft, "name" | "host" | "port" | "key">;
type HostPathBridge = { pathFor?: (file: File) => string };
/* 宿主桥接只在桌面端存在；非浏览器环境（测试/服务端渲染）按「不可用」处理。 */
const hostPaths = () => (typeof window === "undefined" ? undefined : (window as unknown as { __DSH_HOST_PATHS__?: HostPathBridge }).__DSH_HOST_PATHS__);
/** 单行独立成组件：输入一个字只重绘这一行，不再整页 reconcile 全部 VPS。 */
const VpsRow = React.memo(function VpsRow({ row, index, onChange, onRemove }: {
  row: VpsDraft; index: number;
  onChange: (rowKey: string, key: VpsField, value: string) => void;
  onRemove: (rowKey: string) => void;
}) {
  const file = React.useRef<HTMLInputElement>(null);
  const [notice, setNotice] = React.useState("");
  const keyId = React.useId();
  const choose = () => {
    const bridge = hostPaths();
    if (!bridge || typeof bridge.pathFor !== "function") { setNotice("当前环境无法读取绝对路径，请手动填写。"); return; }
    setNotice("");
    file.current?.click();
  };
  const picked = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const pickedFile = target.files && target.files[0];
    target.value = "";
    if (!pickedFile) return;
    try {
      const path = hostPaths()?.pathFor?.(pickedFile);
      if (typeof path === "string" && path.trim()) { onChange(row.rowKey, "key", path); setNotice(""); }
      else setNotice("没有取到绝对路径，请手动填写。");
    } catch { setNotice("读取路径失败，请手动填写。"); }
  };
  return <div className="xsdsh-config-vps-row" role="group" aria-label={`VPS ${index + 1}`}>
    <label className="xsdsh-config-name">名称<input aria-label={`VPS ${index + 1} 名称`} value={row.name} placeholder="名称（可选）" onChange={event => onChange(row.rowKey, "name", event.target.value)} /></label>
    <label className="xsdsh-config-host">主机<input aria-label={`VPS ${index + 1} 主机`} value={row.host} placeholder="user@host" spellCheck={false} autoCapitalize="none" onChange={event => onChange(row.rowKey, "host", event.target.value)} /></label>
    <label className="xsdsh-config-port">端口<input aria-label={`VPS ${index + 1} 端口`} inputMode="numeric" value={row.port} placeholder="22" onChange={event => onChange(row.rowKey, "port", event.target.value)} /></label>
    <div className="xsdsh-config-key">
      <label htmlFor={keyId}>私钥绝对路径</label>
      <div className="xsdsh-config-key-line">
        <input id={keyId} aria-label={`VPS ${index + 1} 私钥绝对路径`} value={row.key} placeholder="本机私钥绝对路径（可选）" spellCheck={false} autoCapitalize="none" onChange={event => onChange(row.rowKey, "key", event.target.value)} />
        <button type="button" className="xsdsh-config-pick" aria-label={`选择 VPS ${index + 1} 私钥文件`} onClick={choose}>选择文件…</button>
      </div>
      <input ref={file} type="file" className="xsdsh-config-file" tabIndex={-1} aria-hidden="true" onChange={picked} />
      {notice && <span className="xsdsh-config-hint" role="status">{notice}</span>}
    </div>
    <button type="button" className="xsdsh-config-delete" aria-label={`删除 VPS ${index + 1}`} onClick={() => onRemove(row.rowKey)}>删除</button>
  </div>;
});
function VpsEditor({ rows, onChange, target }: { rows: VpsDraft[]; onChange: (rows: VpsDraft[]) => void; target: boolean }) {
  const active = rows.filter(row => row.host.trim()).length;
  // 行回调必须稳定，React.memo 才真的能跳过未改动的行。
  const rowsRef = React.useRef(rows);
  rowsRef.current = rows;
  const update = React.useCallback((rowKey: string, key: VpsField, value: string) => {
    onChange(rowsRef.current.map(row => row.rowKey === rowKey ? { ...row, [key]: value } : row));
  }, [onChange]);
  const remove = React.useCallback((rowKey: string) => {
    onChange(rowsRef.current.filter(row => row.rowKey !== rowKey));
  }, [onChange]);
  return <section className="xsdsh-config-card" aria-label={target ? "本目标 VPS" : "全局 VPS"}>
    <h3>{target ? "本目标 VPS" : "全局 VPS 列表"}{target && <span className="xsdsh-config-tag">可覆盖全局</span>}</h3>
    <p className="xsdsh-config-hint">{target ? "有主机的条目将整体覆盖全局 VPS；列表为空时继承全局。" : "为所有目标提供默认配置；目标填写自己的 VPS 后，整体使用目标列表。"}</p>
    <div className="xsdsh-config-toolbar"><strong>VPS 列表</strong><span className="xsdsh-config-hint">编辑中 {active} 台{rows.length > active ? ` · ${rows.length - active} 行无主机，不计入保存` : ""}</span>
      <button type="button" className="xsdsh-config-add" onClick={() => onChange([...rows, newVpsRow()])}>+ 添加 VPS</button></div>
    {rows.length === 0 && <p className="xsdsh-config-empty">{target ? "尚未填写本目标 VPS；保存后沿用全局或兼容来源。" : "尚未填写全局 VPS；需要时可添加。"}</p>}
    <div className="xsdsh-config-vps-list">{rows.map((row, index) => <VpsRow key={row.rowKey} row={row} index={index} onChange={update} onRemove={remove} />)}</div>
    <p className="xsdsh-config-hint">主机非空才计入保存；端口可编辑（默认 22）。私钥仅保存路径，不读取文件内容。</p>
  </section>;
}
function EffectiveConfig({ snapshot, target, dirty }: { snapshot: ConfigSnapshot; target: boolean; dirty: boolean }) {
  const saved = snapshot.draft;
  const effective = snapshot.effective;
  const sources = snapshot.sources;
  return <section className="xsdsh-config-card" aria-label="最终生效来源">
    <h3>最终生效来源<span className="xsdsh-config-tag">服务器最近确认</span></h3>
    <p className="xsdsh-config-hint">{dirty ? "存在未保存修改；以下仍为服务器最近确认的配置。" : "已配置仅表示有配置值，不表示密钥有效或 VPS 已连通。"}</p>
    <div className="xsdsh-config-table-wrap"><table>
      <thead><tr><th>配置项</th><th>{target ? "本目标已保存" : "全局已保存"}</th><th>实际生效</th><th>来源</th></tr></thead>
      <tbody>
        <tr><th scope="row">FOFA_KEY</th><td>{saved.fofa.trim() ? "已配置" : "未填写"}</td><td>{effective ? effective.fofa ? "已配置 · 未验证" : "未配置" : "接口未返回"}</td><td>{sources ? sourceLabel(sources.fofa) : "接口未返回"}</td></tr>
        <tr><th scope="row">VPS</th><td>{snapshot.vpsRepairRequired ? "读取失败 · 原配置待修复" : `${saved.vps.filter(row => row.host.trim()).length} 台`}</td><td>{effective ? `${effective.vps.length} 台${effective.vps.length ? " · 未验证连通性" : " · 未配置"}` : "接口未返回"}</td><td>{sources ? sourceLabel(sources.vps) : "接口未返回"}{snapshot.legacyVps && " · 旧版 HOST/KEY"}</td></tr>
      </tbody>
    </table></div>
    {!!effective?.vps.length && <ul className="xsdsh-config-effective-vps">{effective.vps.map((row, index) => <li key={`${row.id || row.host}-${index}`}><span>{row.name || `VPS ${index + 1}`}</span><code>{row.port === 22 ? row.host : `${row.host}:${row.port}`}</code><span className="xsdsh-config-hint">{row.key ? "已配置私钥路径" : "未配置私钥路径"}</span></li>)}</ul>}
    {snapshot.legacyVps && <p className="xsdsh-config-hint">检测到旧版 VPS 配置。新增列表非空时整体覆盖；清空列表后可能再次使用兼容来源。</p>}
    {!effective && <p className="xsdsh-config-hint">当前平台接口仅返回已保存配置；目标页可查看最终生效来源。</p>}
  </section>;
}
function ConfigEditor({ scope, targetName, request }: { scope: ConfigScope; targetName?: string; request?: ConfigRequest }) {
  const kind = scope.kind;
  const identity = scope.kind === "target" ? scope.engagement : "";
  // Reconstruct the scope from stable values: parent renders create a new scope object,
  // which must not recreate the controller and discard an in-progress draft.
  const controller = React.useMemo(() => createConfigController(
    kind === "target" ? { kind, engagement: identity } : { kind }, request,
  ), [kind, identity, request]);
  const state = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const [confirmRefresh, setConfirmRefresh] = React.useState(false);
  const inputId = React.useId();
  React.useEffect(() => { void controller.load(); return controller.cancel; }, [controller]);
  const target = scope.kind === "target";
  const dirty = state.dirty;
  const draft = state.draft;
  // 稳定引用：父组件每次渲染都新建箭头函数会让 VpsRow 的 memo 失效。
  const draftRef = React.useRef(draft);
  draftRef.current = draft;
  const edit = React.useCallback((patch: Partial<ConfigDraft>) => {
    const current = draftRef.current;
    if (current) controller.edit({ ...current, ...patch });
  }, [controller]);
  const setVps = React.useCallback((vps: VpsDraft[]) => edit({ vps }), [edit]);
  const refresh = () => { if (dirty || state.partialSave) setConfirmRefresh(true); else void controller.load(); };
  return <section className="xsdsh-config" data-xsdsh-ui="config" aria-label={target ? "目标配置" : "全局密钥与 VPS"} aria-busy={!!state.busy}>
    <style>{configCss}</style>
    <form onSubmit={event => { event.preventDefault(); setConfirmRefresh(false); void controller.save(); }}>
      <header className="xsdsh-config-toolbar xsdsh-config-heading">
        <h2>{target ? "目标配置" : "全局密钥与 VPS"}</h2><span className="xsdsh-config-tag">{target ? "只作用于当前目标" : "所有目标默认继承"}</span>
        <div className="xsdsh-config-actions"><button type="button" disabled={!!state.busy} onClick={refresh}>刷新</button>
          <button type="submit" className="xsdsh-config-primary" disabled={!draft || !!state.busy || (!!state.snapshot?.vpsRepairRequired && !state.repairConfirmed)}>{state.busy === "save" ? "保存中…" : "保存"}</button></div>
      </header>
      {target && <p className="xsdsh-config-target">当前目标：<strong>{targetName || identity}</strong>{targetName && targetName !== identity && <code>{identity}</code>}</p>}
      {confirmRefresh && <div className="xsdsh-config-confirm" role="group" aria-label="确认刷新">
        <span>刷新会丢弃当前未保存的输入。</span><button type="button" onClick={() => { setConfirmRefresh(false); void controller.load(); }}>丢弃修改并刷新</button><button type="button" onClick={() => setConfirmRefresh(false)}>继续编辑</button>
      </div>}
      <p className="xsdsh-config-status" role="status" aria-live="polite">{state.busy === "load" ? "正在加载配置…" : state.busy === "save" ? "正在保存配置…" : dirty ? "有未保存的修改" : state.notice}</p>
      {state.error && <div className="xsdsh-config-error" role="alert"><span>{state.error}{draft && "；当前输入已保留。"}</span>{state.retry && <button type="button" disabled={!!state.busy} onClick={() => void controller.retry()}>{state.retry === "save" ? "重试保存" : "重试加载"}</button>}</div>}
      {state.partialSave && <section className="xsdsh-config-error" role="alert" aria-label="部分保存结果">
        <strong>部分内容已写入，保存尚未完整完成。</strong>
        <span>config.json：{state.partialSave.saved.config === null ? "未确认" : state.partialSave.saved.config ? "已写入" : "未写入"}。</span>
        <span>恢复建议：{state.partialSave.recovery}</span>
        <span>当前草稿已保留，可重试保存；刷新会重新读取磁盘内容并丢弃草稿。下方来源表不是本次部分写入后的状态。</span>
        {!!state.partialSave.cleanupErrors.length && <ul aria-label="清理错误">{state.partialSave.cleanupErrors.map((error, index) => <li key={index}>{error}</li>)}</ul>}
      </section>}
      {state.snapshot?.vpsError && <section className="xsdsh-config-error" role="alert" aria-label="VPS 配置损坏">
        <strong>检测到损坏的 VPS 配置</strong><span>{state.snapshot.vpsError}</span>
        {state.snapshot.vpsRepairRequired ? <>
          <span>磁盘上的原 VPS 未被清空；当前空列表是读取失败的结果。请重新填写 VPS，或明确确认清空。普通保存已阻止，FOFA 仍可查看和编辑。</span>
          <label><input type="checkbox" disabled={!!state.busy} checked={state.repairConfirmed} onChange={event => controller.confirmRepair(event.target.checked)} />
            我确认保存时用当前编辑列表替换损坏的 VPS 配置（{draft?.vps.filter(row => row.host.trim()).length || 0} 台；0 台将清空原列表）。</label>
        </> : <span>全局 VPS 无法正常读取，请前往全局配置修复。本目标保存不会修复或覆盖损坏的全局配置。</span>}
      </section>}
      {draft && <fieldset disabled={!!state.busy} className="xsdsh-config-fields">
        {target && <p className="xsdsh-config-hint">目标配置非空时覆盖全局；目标留空时继承全局。旧版环境变量的兼容来源会单独显示。</p>}
        <section className="xsdsh-config-card"><h3><label htmlFor={`${inputId}-fofa`}>{target ? "本目标 FOFA_KEY" : "全局 FOFA_KEY"}</label></h3>
          <p className="xsdsh-config-hint">{target ? "仅供当前目标使用。留空时继承全局；可用的旧版配置会显示在最终来源中。" : "目标留空时使用此值；全局留空后，仍可能存在进程环境或 .env 的兼容配置。"}</p>
          <SecretInput className="xsdsh-config-fofa" id={`${inputId}-fofa`} value={draft.fofa} placeholder={target ? "留空 = 继承全局" : "填写 FOFA_KEY"} aria-label={target ? "本目标 FOFA_KEY" : "全局 FOFA_KEY"} onChange={value => edit({ fofa: value })} />
        </section>
        <VpsEditor rows={draft.vps} target={target} onChange={setVps} />
      </fieldset>}
      {state.snapshot && <EffectiveConfig snapshot={state.snapshot} target={target} dirty={dirty} />}
      {state.snapshot?.updatedAt && <p className="xsdsh-config-hint">最后保存：<time dateTime={state.snapshot.updatedAt}>{state.snapshot.updatedAt}</time></p>}
    </form>
  </section>;
}
