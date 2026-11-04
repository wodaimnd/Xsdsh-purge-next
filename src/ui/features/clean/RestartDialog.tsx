import { React } from "../../host/react";

export type RestartKind = "full" | "manual";

/**
 * 重启提醒做成模态：全量应用后问「现在重启 / 五分钟后提醒」，
 * 子集应用后只提示「完全退出 DSH 再打开」，确认一次就不再出现。
 */
export function RestartDialog({ kind, busy, onRestart, onSnooze, onDismiss }: {
  kind: RestartKind;
  busy: boolean;
  onRestart: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}) {
  const box = React.useRef<HTMLDivElement>(null);
  const later = React.useRef<HTMLButtonElement>(null);
  const primary = React.useRef<HTMLButtonElement>(null);
  const titleId = React.useId();
  const bodyId = React.useId();
  const close = kind === "full" ? onSnooze : onDismiss;
  const closeRef = React.useRef(close);
  closeRef.current = close;
  /* 全量重启会立刻断开会话，默认焦点放在更安全的「五分钟后提醒」上。 */
  React.useEffect(() => { (kind === "full" ? later : primary).current?.focus(); }, [kind]);
  React.useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeRef.current(); return; }
      if (event.key !== "Tab") return;
      const elements = Array.from(box.current?.querySelectorAll<HTMLElement>("button:not(:disabled)") || []);
      const first = elements[0]; const last = elements[elements.length - 1];
      if (!first || !last) { event.preventDefault(); box.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !box.current?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !box.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key, true);
    return () => document.removeEventListener("keydown", key, true);
  }, []);
  return <div className="clean9-restart-shade">
    <div className="clean9-restart-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={bodyId} ref={box} tabIndex={-1}>
      <h2 id={titleId}>{kind === "full" ? "需要重启宿主" : "需要重新打开 DSH"}</h2>
      <p id={bodyId}>{kind === "full"
        ? "补丁已写入。重启宿主后才会真正生效，重启会短暂断开当前页面；回来后再确认实际效果。"
        : "所选补丁已写入。请完全退出 DSH 后重新打开——只关窗口不够，自动重启会补齐全量补丁。"}</p>
      <div className="clean9-restart-actions">
        {kind === "full" ? <>
          <button type="button" ref={later} onClick={onSnooze}>五分钟后提醒</button>
          <button type="button" ref={primary} className="is-primary" disabled={busy} onClick={onRestart}>{busy ? "正在重启…" : "现在重启"}</button>
        </> : <button type="button" ref={primary} className="is-primary" onClick={onDismiss}>知道了</button>}
      </div>
    </div>
  </div>;
}
