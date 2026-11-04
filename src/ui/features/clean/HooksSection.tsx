import { React } from "../../host/react";
import { errorText } from "./api";
import type { CleanApi } from "./api";
import type { CleanStatus, Notice } from "./types";
import { hookState, hookStateLabels, HOOK_DESCRIPTION } from "./patch-model";
import { NoticeView } from "./primitives";

export function HooksSection({ api, status, locked, onSaved }: { api: CleanApi; status: CleanStatus | null; locked: boolean; onSaved: () => void }) {
  const [enabled, setEnabled] = React.useState<boolean | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [savedDirty, setSavedDirty] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice>({ kind: "idle", text: "" });
  const flight = React.useRef(false);
  const state = hookState(status);
  React.useEffect(() => {
    let alive = true;
    api.get("hooks-deny").then(data => { if (alive) setEnabled(data.hooksDenyBypass !== false); })
      .catch(error => { if (alive) setNotice({ kind: "error", text: errorText(error) }); });
    return () => { alive = false; };
  }, [api]);
  React.useEffect(() => { if (state === "dirty" || state === "applied_unrestarted") setSavedDirty(false); }, [state]);
  const effectiveState = savedDirty ? "dirty" : state;
  const save = async (next: boolean) => {
    if (effectiveState !== "synced" || flight.current || locked || enabled === null) return;
    flight.current = true; setBusy(true);
    try {
      const data = await api.post("hooks-deny", { hooksDenyBypass: next });
      setEnabled(data.hooksDenyBypass === true);
      setSavedDirty(true);
      setNotice({ kind: "ok", text: "选择已保存，待应用并重启后才能改变宿主行为。" });
      onSaved();
    } catch (error) { setNotice({ kind: "error", text: errorText(error) }); }
    finally { flight.current = false; setBusy(false); }
  };
  return <section><p>{HOOK_DESCRIPTION}</p>
    <label className="clean9-toggle"><input type="checkbox" checked={enabled === true} disabled={enabled === null || busy || locked || effectiveState !== "synced"} onChange={event => { void save(event.target.checked); }} />开启 Hook拦截选项</label>
    <p role="status">{hookStateLabels[effectiveState]}</p>
    {effectiveState !== "synced" && <p>待应用时请先应用补丁；待重启时请重启宿主。状态未知时请重新检测。</p>}
    <NoticeView notice={notice} />
  </section>;
}
