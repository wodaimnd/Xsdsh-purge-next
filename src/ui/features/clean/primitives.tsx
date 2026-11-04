import { React } from "../../host/react";
import type { ReactNode } from "react";
import type { Notice } from "./types";
export { Btn } from "../../components/Btn";

export function NoticeView({ notice }: { notice: Notice }) {
  if (!notice.text || notice.kind === "idle") return null;
  return <p className={"clean9-notice is-" + notice.kind} role={notice.kind === "error" ? "alert" : "status"}>{notice.text}</p>;
}
export function noticeNode(notice: Notice) { return <NoticeView notice={notice} />; }
export function formatSize(bytes: number) { return bytes < 1024 ? bytes + " B" : (bytes / 1024).toFixed(1) + " KB"; }
export function cleanBlockSpan(_id: string) { return 2; }
/** The migrated editors keep their body markup, without the old collapsible outer card. */
export function CleanCard({ title, desc, actions, notice, children }: { id?: string; title?: string; desc?: string; actions?: ReactNode; notice?: Notice; children?: ReactNode; span?: number; collapsible?: boolean; pill?: ReactNode }) {
  return <section className="clean9-editor"><h3>{title}</h3>{desc && <p>{desc}</p>}<div className="clean9-actions">{actions}</div>{notice && <NoticeView notice={notice} />}{children}</section>;
}
export function Overlay({ title, children, onClose, busy = false, size = "wide" }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean; size?: "wide" | "compact" | "medium" }) {
  const box = React.useRef<HTMLDivElement>(null);
  const close = React.useRef<HTMLButtonElement>(null);
  const titleId = React.useId();
  const onCloseRef = React.useRef(onClose);
  const busyRef = React.useRef(busy);
  onCloseRef.current = onClose; busyRef.current = busy;
  React.useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    close.current?.focus();
    const key = (event: KeyboardEvent) => {
      /* 内层确认框在场时，Esc / Tab 归它处理，不能把外层规矩本一起关掉。 */
      if (typeof document.querySelector === "function" && document.querySelector("[data-clean9-confirm]")) return;
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); if (!busyRef.current) onCloseRef.current(); }
      if (event.key !== "Tab") return;
      const elements = Array.from(box.current?.querySelectorAll<HTMLElement>("button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex='0']") || []).filter(element => element.getClientRects().length > 0);
      const first = elements[0]; const last = elements[elements.length - 1];
      if (!first || !last) { event.preventDefault(); box.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !box.current?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !box.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("keydown", key, true);
      /* 重启提醒（alertdialog）接管时不要再把焦点抢回卡片：它的初始焦点更有意义。 */
      const takeover = typeof document.querySelector === "function" && document.querySelector("[role=alertdialog]");
      if (takeover || !previous?.isConnected) return;
      /* preventScroll：焦点回到卡片时不要顺带滚动面板，否则卡片会被滚到边缘、看着像被截断。 */
      previous.focus({ preventScroll: true });
      /* Esc 是键盘事件，浏览器会把程序化 focus 判成 focus-visible，卡片上留下一个像
         「选中框」的焦点环。先压掉，下一次真实交互（按键或点击）再恢复键盘焦点环。 */
      if (!previous.classList) return;
      previous.classList.add("is-focus-returned");
      const clear = () => {
        previous.classList.remove("is-focus-returned");
        document.removeEventListener("keydown", clear, true);
        document.removeEventListener("pointerdown", clear, true);
      };
      document.addEventListener("keydown", clear, true);
      document.addEventListener("pointerdown", clear, true);
    };
  }, []);
  const sizeClass = size === "compact" ? " clean9-dialog--compact" : size === "medium" ? " clean9-dialog--medium" : "";
  return <div className="clean9-overlay" onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div className={"clean9-dialog" + sizeClass} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={box} tabIndex={-1}>
      <header><h2 id={titleId}>{title}</h2><button type="button" ref={close} disabled={busy} onClick={onClose}>收起</button></header>
      <div className="clean9-dialog-body">{children}</div>
    </div>
  </div>;
}

/** 破坏性操作的轻量确认框：固定遮罩 + alertdialog，Esc/点遮罩取消，忙时全部锁住。 */
export function ConfirmDialog({ title, message, confirmLabel, cancelLabel = "取消", danger = false, busy = false, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; cancelLabel?: string;
  danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  const box = React.useRef<HTMLDivElement>(null);
  const cancel = React.useRef<HTMLButtonElement>(null);
  const titleId = React.useId();
  const bodyId = React.useId();
  const cancelRef = React.useRef(onCancel);
  const busyRef = React.useRef(busy);
  cancelRef.current = onCancel; busyRef.current = busy;
  React.useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    /* 默认焦点放在取消：破坏性操作的 Enter 不能顺手删掉东西。 */
    cancel.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); if (!busyRef.current) cancelRef.current(); return; }
      if (event.key !== "Tab") return;
      const elements = Array.from(box.current?.querySelectorAll<HTMLElement>("button:not(:disabled)") || []).filter(element => element.getClientRects().length > 0);
      const first = elements[0]; const last = elements[elements.length - 1];
      if (!first || !last) { event.preventDefault(); box.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !box.current?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !box.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("keydown", key, true);
      if (!previous?.isConnected) return;
      previous.focus({ preventScroll: true });
    };
  }, []);
  return <div className="clean9-confirm-shade" onClick={event => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
    <div className="clean9-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={bodyId} data-clean9-confirm="true" ref={box} tabIndex={-1}>
      <h2 id={titleId}>{title}</h2>
      <p id={bodyId}>{message}</p>
      <div className="clean9-restart-actions">
        <button type="button" ref={cancel} disabled={busy} onClick={onCancel}>{cancelLabel}</button>
        <button type="button" className={"is-primary" + (danger ? " is-danger" : "")} disabled={busy} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>;
}
