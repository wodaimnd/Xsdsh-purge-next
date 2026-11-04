import { React } from "../../host/react";
import { createCleanApi, errorText } from "./api";
import { revertReport } from "./revert-model";
import type { CleanOperation, CleanRuntime, CleanStatus, JsonRecord, Notice, Patch } from "./types";

// Legacy op objects lack the new ref; key compatibility storage by their persistent ticket ref.
const legacyManualRefs = new WeakMap<object, { current: { ticket: number } | null }>();
// A dock-owned ticket ref survives page unmounts. Request ownership must survive too:
// a new page must not clear busy from an early apply_running:false status snapshot.
const operationFlights = new WeakMap<object, { active: boolean }>();
function flightFor(op: CleanOperation) {
  let flight = operationFlights.get(op.actionTicketRef);
  if (!flight) { flight = { active: false }; operationFlights.set(op.actionTicketRef, flight); }
  return flight;
}
function manualRefFor(op: CleanOperation) {
  if (op.manualRestartRef) return op.manualRestartRef;
  let ref = legacyManualRefs.get(op.actionTicketRef);
  if (!ref) { ref = { current: null }; legacyManualRefs.set(op.actionTicketRef, ref); }
  return ref;
}
function isManual(op: CleanOperation) {
  const ref = manualRefFor(op);
  if (ref.current && ref.current.ticket !== op.actionTicketRef.current) ref.current = null;
  return ref.current !== null;
}

export function useCleanOperation(): CleanOperation {
  const [patchBusy, setPatchBusy] = React.useState(false);
  const [askRestart, setAskRestart] = React.useState(false);
  const snoozeUntilRef = React.useRef(0);
  const actionTicketRef = React.useRef(0);
  const manualRestartRef = React.useRef<{ ticket: number } | null>(null);
  return { patchBusy, setPatchBusy, askRestart, setAskRestart, snoozeUntilRef, actionTicketRef, manualRestartRef };
}
export function actionNotice(route: string, data: JsonRecord): Notice {
  if (data.busy === true) return { kind: "busy", text: String(data.error || "已有操作正在运行，请等待状态刷新。") };
  // 全量应用会写入提示词覆盖，空提示词会被后端挡下：告诉用户去哪儿补，别只丢一句「不能为空」。
  if (data.ok !== true && data.needPrompt === true) return { kind: "error", text: String(data.error || "提示词和规则集都是空的") + "。先到「模式提示词」页保存一份，再回来应用。" };
  if (data.ok !== true) return { kind: "error", text: String(data.error || (data.needPrompt ? "提示词和规则集不能为空。" : "操作失败")) };
  if (data.complete === false) {
    const ids = Array.isArray(data.failed_items) ? data.failed_items.map(value => value && typeof value === "object" && "id" in value ? String(value.id) : "").filter(Boolean) : [];
    return { kind: "error", text: "部分操作未完成" + (ids.length ? "：#" + ids.join("、#") : "") + (data.error ? " · " + String(data.error) : "，请查看状态及后端错误。") };
  }
  if (route === "revert") {
    const counts = revertReport(data).counts;
    if (counts.errors !== null && counts.errors > 0) return { kind: "error", text: `已还原 ${counts.reverted ?? "未知"} 项，${counts.errors} 项出错。` };
    if (counts.noBackup !== null && counts.noBackup > 0) return { kind: "error", text: `已还原 ${counts.reverted ?? "未知"} 项；${counts.noBackup} 项没有备份，已跳过。` };
    if (counts.reverted !== null && counts.reverted > 0) return { kind: "ok", text: `已还原 ${counts.reverted} 项。` };
    if (counts.alreadyOriginal !== null && counts.alreadyOriginal > 0) return { kind: "ok", text: "文件已经是原始状态。" };
  }
  if (String(data.override_installed || "").startsWith("error:")) return { kind: "error", text: "补丁请求完成，但提示词写入失败：" + String(data.override_installed) };
  return { kind: "ok", text: String(data.note || (route === "apply" ? "补丁请求已完成；实际状态以重新检测结果为准。" : "操作已完成。")) + (data.override_backup ? " 提示词备份：" + String(data.override_backup) : "") };
}
export function useCleanController(runtime: CleanRuntime, suppliedOp?: CleanOperation) {
  const localOp = useCleanOperation();
  const op = suppliedOp || localOp;
  const latestOp = React.useRef(op); latestOp.current = op;
  const api = React.useMemo(() => createCleanApi(runtime), [runtime]);
  const [status, setStatus] = React.useState<CleanStatus | null>(null);
  // Read synchronously in restart handlers, including handlers captured before status arrived.
  const serverStatus = React.useRef<CleanStatus | null>(null);
  const serverManual = () => serverStatus.current?.restart_mode === "manual" || serverStatus.current?.scope === "subset";
  const [catalogue, setCatalogue] = React.useState<Patch[]>([]);
  const [catalogueReady, setCatalogueReady] = React.useState(false);
  const [catalogueError, setCatalogueError] = React.useState("");
  const [notice, setNotice] = React.useState<Notice>({ kind: "idle", text: "" });
  const [revertResult, setRevertResult] = React.useState<JsonRecord | null>(null);
  const [manualRestart, setManualRestart] = React.useState(() => isManual(op));
  /* 子集应用后的一次性弹窗：持久化的 manual 状态只在补丁卡上留一句提示，
     弹窗本身不跨页面存活，避免每次进清洗页都再弹一遍。 */
  const [manualPrompt, setManualPrompt] = React.useState(false);
  const [startedAt, setStartedAt] = React.useState(0);
  const [waitSeconds, setWaitSeconds] = React.useState(0);
  const inFlight = flightFor(op);
  const loading = React.useRef(false);
  const mounted = React.useRef(true);
  const refresh = React.useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    try {
      const next = await api.status();
      if (!mounted.current) return;
      serverStatus.current = next;
      setStatus(next);
      const current = latestOp.current;
      if (!inFlight.active && typeof next.apply_running === "boolean") current.setPatchBusy(next.apply_running);
      // Persisted subset scope survives a full page reload. Only explicit full scope or
      // a confirmed completed restart can clear local mode; an in-flight subset wins.
      const persistedManual = next.restart_mode === "manual" || next.scope === "subset";
      if (persistedManual) manualRefFor(current).current = { ticket: current.actionTicketRef.current };
      else if (!inFlight.active && (next.scope === "full" || next.restart_required === false && !next.boot_full_quit)) manualRefFor(current).current = null;
      const manual = persistedManual || isManual(current);
      setManualRestart(manual);
      if (manual) current.setAskRestart(false);
      else if ((next.restart_required || next.boot_full_quit) && Date.now() > current.snoozeUntilRef.current && !inFlight.active) current.setAskRestart(true);
    } catch (error) {
      if (mounted.current) setStatus(previous => ({ ...previous, ok: false, status_unknown: true, status_error: errorText(error) }));
    } finally { loading.current = false; }
  }, [api, inFlight]);
  const refreshCatalogue = React.useCallback(async () => {
    try {
      const rows = await api.catalogue();
      if (mounted.current) { setCatalogue(rows); setCatalogueReady(true); setCatalogueError(""); }
    } catch (error) { if (mounted.current) setCatalogueError(errorText(error)); }
  }, [api]);
  React.useEffect(() => {
    mounted.current = true;
    void refresh(); void refreshCatalogue();
    const timer = setInterval(() => {
      /* 后台标签页不刷新宿主状态：状态没人看，5 秒一次的全量重渲染纯属浪费。 */
      if (typeof document !== "undefined" && document.hidden) return;
      void refresh();
    }, 5000);
    return () => { mounted.current = false; clearInterval(timer); };
  }, [refresh, refreshCatalogue]);
  const busy = op.patchBusy || status?.apply_running === true || status?.apply_phase === "extracting" || status?.apply_phase === "patching";
  React.useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => { void refresh(); }, 800);
    return () => clearInterval(timer);
  }, [busy, refresh]);
  const since = status?.apply_in_flight?.stale !== true && status?.apply_in_flight?.since ? status.apply_in_flight.since : startedAt;
  React.useEffect(() => {
    if (!busy || !since) { setWaitSeconds(0); return; }
    const tick = () => setWaitSeconds(Math.max(0, Math.floor((Date.now() - since) / 1000)));
    tick(); const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [busy, since]);
  const action = async (route: "apply" | "revert" | "uninstall" | "cleanup-residue", patchIds?: number[]): Promise<boolean> => {
    if (inFlight.active || busy) return false;
    // 不传 patchIds = 全量应用（/apply 不带 patchIds 走全量分支：解包/换包、shim、CLI 修复、
    // 提示词覆盖，并按后端 restarting/restart_required 弹重启提示）。
    // 传了 patchIds = 子集应用，只写所选补丁，后端固定 restart_mode=manual。
    const subsetApply = Array.isArray(patchIds) && patchIds.length > 0;
    if (route === "apply" && !subsetApply && Array.isArray(patchIds)) return false;
    if (route === "apply" && subsetApply && !catalogueReady) return false;
    const messages = { apply: "", revert: "按备份还原所有已应用文件？", uninstall: "卸载 Xsdsh-purge，恢复备份、清理运行时并撤销注册？", "cleanup-residue": "清理 resources/app 旧路残留并还原 header？宿主可能退出。" };
    if (messages[route] && !runtime.confirm(messages[route])) return false;
    inFlight.active = true;
    setRevertResult(null);
    setManualPrompt(false);
    const ticket = ++op.actionTicketRef.current;
    op.setPatchBusy(true); op.setAskRestart(false);
    // Even a timeout can leave a subset applied; never let polling offer full-clean restart.
    manualRefFor(op).current = subsetApply ? { ticket } : null;
    setManualRestart(subsetApply);
    setStartedAt(Date.now()); setNotice({ kind: "busy", text: "正在处理，请等待后端结果。" });
    try {
      const result = await api.action(route, route === "apply" && subsetApply ? { patchIds: patchIds! } : {});
      if (!mounted.current || ticket !== op.actionTicketRef.current) return false;
      setNotice(actionNotice(route, result));
      if (route === "revert") setRevertResult(result);
      const subsetResult = result.scope === "subset" || result.restart_mode === "manual" || subsetApply;
      if (route === "apply" && subsetResult) {
        setManualRestart(true);
        manualRefFor(op).current = { ticket };
        op.setAskRestart(false);
        setManualPrompt(result.ok === true);
      } else if (route === "apply") {
        // 全量应用会重写 applied.json 的 scope，上一轮子集留下的手动模式必须一起清掉，
        // 否则 askRestart 被 manualRestart 挡住，重启提示永远不出现。
        manualRefFor(op).current = null;
        setManualRestart(false);
        if (result.ok && (result.restarting || result.needs_full_quit || result.restart_required)) op.setAskRestart(true);
      } else if (result.ok && (result.restarting || result.needs_full_quit || result.restart_required)) op.setAskRestart(true);
      if (result.ok && route === "uninstall") runtime.afterUninstall?.(String(result.surface || status?.surface || "web"));
    } catch (error) {
      if (!mounted.current || ticket !== op.actionTicketRef.current) return false;
      const text = errorText(error);
      setNotice(text === "timeout" || /fetch|network|连不上接口|load failed/i.test(text)
        ? { kind: "busy", text: "请求连接已中断或超时，结果尚未确认；将继续读取状态。" }
        : { kind: "error", text });
      return false;
    } finally {
      inFlight.active = false;
      op.setPatchBusy(false);
      if (mounted.current) { void refresh(); }
    }
    return true;
  };
  const restart = () => {
    if (serverManual() || isManual(op)) {
      setNotice({ kind: "ok", text: "本次请求仅包含所选补丁，完成情况请查看操作结果。需要重启时，请完全退出DSH后重新打开；自动重启会补齐全量补丁。" });
      return;
    }
    if (!serverStatus.current) {
      setNotice({ kind: "busy", text: "尚未读取宿主重启方式，请等待状态检测后重试。" });
      return;
    }
    op.setAskRestart(false);
    /* 重启可能先成功写完补丁、再让宿主失联。只有窗口内重试仍失败才报失败。 */
    op.snoozeUntilRef.current = Date.now() + 300000;
    try { if (!runtime.restart(setNotice, op.setPatchBusy, runtime.t, status?.surface || "web")) setNotice({ kind: "error", text: "重启未发起，请查看宿主状态后重试。" }); }
    catch (error) { setNotice({ kind: "error", text: errorText(error) }); }
  };
  return { api, op, status, catalogue, catalogueReady, catalogueError, notice, revertResult, busy, manualRestart, manualPrompt, dismissManualPrompt: () => setManualPrompt(false), waitSeconds, refresh, refreshCatalogue, action, restart };
}
export type CleanController = ReturnType<typeof useCleanController>;
