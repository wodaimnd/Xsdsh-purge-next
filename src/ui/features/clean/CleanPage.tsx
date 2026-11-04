import { React } from "../../host/react";
import type { ComponentType } from "react";
import type { CleanPageProps, CleanRuntime } from "./types";
import type { CleanApi } from "./api";
import { useCleanController } from "./useCleanController";
import { PatchCounts, PatchHealth, PatchPanel } from "./PatchPanel";
import { HooksSection } from "./HooksSection";
import { TextEditor } from "./TextEditor";
import { OwnServersEditor } from "./OwnServersEditor";
import { RulesSection as MigratedRules } from "./RulesSection.js";
import { SkillsSection as MigratedSkills } from "./SkillsSection.js";
import { NoticeView, Overlay } from "./primitives";
import { RestartDialog } from "./RestartDialog";
import { hookState, hookStateLabels, HOOK_DESCRIPTION, patchRows } from "./patch-model";
import cleanCss from "./clean.css";

// Explicit typed seam around unchanged JS editor internals, progressively migrated.
type EditorProps = { runtime: CleanRuntime; api: CleanApi; span?: number };
const RulesSection = MigratedRules as ComponentType<EditorProps>;
const SkillsSection = MigratedSkills as ComponentType<EditorProps>;
type Panel = "patch" | "hooks" | "prompt" | "own" | "rules" | "skills" | "uninstall";
const titles: Record<Panel, string> = { patch: "补丁", hooks: "Hook拦截", prompt: "提示词", own: "自己的服务器", rules: "规矩本", skills: "Skill", uninstall: "卸载 Xsdsh-purge" };
const cards: { id: Exclude<Panel, "patch">; description: string }[] = [
  { id: "hooks", description: HOOK_DESCRIPTION },
  { id: "prompt", description: "编辑与恢复提示词，保留真实注入状态" },
  { id: "own", description: "net-scope-allow.txt · 一行一个主机名" },
  { id: "rules", description: "AGENTS.md / CLAUDE.md 追加策略" },
  { id: "skills", description: "导入、编辑与管理随包技能" },
  { id: "uninstall", description: "恢复备份 / 清运行时 / 撤注册 · 操作前确认" },
];
export function CleanPage({ runtime, op }: CleanPageProps) {
  const c = useCleanController(runtime, op);
  const [panel, setPanel] = React.useState<Panel | null>(null);
  const root = React.useRef<HTMLDivElement>(null);
  const [glassOn, setGlassOn] = React.useState(() => runtime.glass?.read() ?? false);
  const [glassError, setGlassError] = React.useState("");
  React.useEffect(() => {
    if (root.current && runtime.glass) runtime.glass.apply(root.current, glassOn);
  }, [runtime.glass, glassOn]);
  const changeGlass = (on: boolean) => {
    try { runtime.glass?.save(on); setGlassOn(on); setGlassError(""); }
    catch (error) { setGlassError(error instanceof Error ? error.message : String(error)); }
  };
  const rows = patchRows(c.catalogue, c.status);
  const refresh = () => { void c.refresh(); };
  const close = () => setPanel(null);
  /* 重启提醒是模态：全量应用后由后端状态驱动，子集应用后由本次结果驱动一次。
     弹窗出现时收起补丁面板，避免两层模态叠在一起。 */
  const restartKind = c.op.askRestart && !c.manualRestart ? "full" : c.manualPrompt ? "manual" : null;
  React.useEffect(() => { if (restartKind) setPanel(current => (current === "patch" ? null : current)); }, [restartKind]);
  /* 瓷贴右侧状态按示意稿做成药丸：状态决定色调，不再是清一色的灰字「管理」。 */
  const tileState = (id: Panel) => id === "hooks" ? hookStateLabels[hookState(c.status)] : id === "uninstall" ? "危险操作" : "管理";
  const tileTone = (id: Panel) => id === "hooks"
    ? ({ synced: "ok", dirty: "warn", applied_unrestarted: "warn", unknown: "mut" } as const)[hookState(c.status)]
    : id === "uninstall" ? "bad" : "mut";
  return <div ref={root} className="clean9" data-glass={glassOn ? "1" : "0"}>
    <style>{cleanCss}</style>
    <div className="clean9-page-head"><h2>清洗</h2><span className="clean9-pill">{c.status?.surface || "宿主状态待检测"}</span><span className="clean9-version">{c.status?.plugin_version ? "v" + c.status.plugin_version : ""}</span>
      {runtime.glass && <label><input type="checkbox" checked={glassOn} onChange={event => changeGlass(event.target.checked)} />液态玻璃</label>}
    </div>
    {glassError && <p role="alert">液态玻璃设置未保存：{glassError}</p>}
    <button type="button" className="clean9-patch-card" aria-haspopup="dialog" onClick={() => setPanel("patch")}>
      <span className="clean9-card-title">补丁 <span>{c.catalogueReady ? `${rows.length} 条` : "读取目录中"}</span></span>
      <PatchCounts rows={rows} known={c.catalogueReady && c.status !== null} />
      <PatchHealth status={c.status} />
      <span className="clean9-card-foot">{c.busy ? "正在处理" : c.manualRestart ? "所选补丁已写入 · 需完全退出 DSH 后重新打开" : c.status?.status_unknown ? "状态未知 · 当前为最后已知数据" : "点击查看补丁状态与明细"}<span aria-hidden="true">›</span></span>
    </button>
    {c.catalogueError && <p role="alert">补丁目录读取失败：{c.catalogueError}</p>}
    <div className="clean9-tiles">{cards.map(card => <button type="button" key={card.id} className={"clean9-tile" + (card.id === "uninstall" ? " is-danger" : "")} aria-haspopup="dialog" onClick={() => setPanel(card.id)}>
      <span><strong>{titles[card.id]}</strong><span className="clean9-description">{card.description}</span></span>
      <span className={"clean9-card-state is-" + tileTone(card.id)}>{tileState(card.id)}</span><span aria-hidden="true">›</span>
    </button>)}</div>
    <NoticeView notice={c.notice} />
    {c.status?.status_unknown && <p role="alert">读取宿主状态失败：{c.status.status_error}。正在自动重试。</p>}
    {panel && <Overlay title={titles[panel]} onClose={close} size={panel === "own" ? "medium" : panel === "hooks" || panel === "uninstall" ? "compact" : "wide"}>
      {panel === "patch" && <PatchPanel controller={c} />}
      {panel === "hooks" && <HooksSection api={c.api} status={c.status} locked={c.busy} onSaved={refresh} />}
      {panel === "prompt" && <TextEditor kind="override" api={c.api} runtime={runtime} locked={c.busy} onSaved={refresh} />}
      {panel === "own" && <OwnServersEditor api={c.api} runtime={runtime} locked={c.busy} onSaved={refresh} />}
      {panel === "rules" && <RulesSection runtime={runtime} api={c.api} />}
      {panel === "skills" && <SkillsSection runtime={runtime} api={c.api} />}
      {panel === "uninstall" && <section><p>{runtime.t("uninstall.body")}</p>
        {c.status?.uninstall_leftover && <p role="alert">上次卸载有 {c.status.uninstall_leftover.count} 项残留：{c.status.uninstall_leftover.path}</p>}
        <button type="button" disabled={c.busy} onClick={() => { void c.action("uninstall"); }}>卸载 Xsdsh-purge</button><NoticeView notice={c.notice} /></section>}
    </Overlay>}
    {restartKind && <RestartDialog kind={restartKind} busy={c.busy}
      onRestart={c.restart}
      onSnooze={() => { c.op.snoozeUntilRef.current = Date.now() + 300000; c.op.setAskRestart(false); }}
      onDismiss={c.dismissManualPrompt} />}
  </div>;
}
export const Clear = CleanPage;
export const SettingsRoot = CleanPage;
export const PurgifySection = CleanPage;
