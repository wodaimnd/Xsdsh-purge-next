/** @jsx h */
import type { KeyboardEvent } from "react";
import { h } from "../host/react";

export const APP_TABS = [
  { id: "clean", label: "清洗" },
  { id: "drill", label: "演练台" },
  { id: "cat", label: "猫猫" },
  { id: "prompts", label: "模式提示词" },
  { id: "look", label: "外观" },
] as const;
export const REDTEAM_TABS = [
  { id: "assets", label: "资产测绘" },
  { id: "target", label: "目标配置" },
  { id: "sessions", label: "会话隧道" },
  { id: "findings", label: "漏洞战果" },
  { id: "chain", label: "攻击链" },
  { id: "scores", label: "得分目标" },
  { id: "report", label: "报告" },
] as const;
export const GLOBAL_TABS = [
  { id: "env", label: "环境适配" },
  { id: "net", label: "密钥与 VPS" },
  { id: "agents", label: "智能体" },
  { id: "knowledge", label: "知识库" },
  { id: "skills", label: "技能库" },
] as const;
export type AppTab = typeof APP_TABS[number]["id"];
export type RedteamTab = typeof REDTEAM_TABS[number]["id"];
export type GlobalTab = typeof GLOBAL_TABS[number]["id"];

interface NavigationTabsProps<T extends string> {
  id: string;
  label: string;
  tabs: readonly { readonly id: T; readonly label: string }[];
  value: T;
  unread?: Readonly<Partial<Record<T, boolean>>>;
  onChange: (tab: T) => void;
}

/** Automatic activation with roving focus; tab panels use the same id prefix. */
export function NavigationTabs<T extends string>({ id, label, tabs, value, unread, onChange }: NavigationTabsProps<T>) {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[next]?.focus({ preventScroll: true });
    onChange(tabs[next].id);
  };
  return <div className="purge-app__tabs" role="tablist" aria-label={label}>
    {tabs.map((tab, index) => <button
      type="button" key={tab.id} className="purge-app__tab" role="tab"
      ref={value === tab.id ? (button) => {
        if (!button) return;
        // Scroll only the horizontal tab strip. This is nearest alignment without
        // scrollIntoView's older-Chromium behavior of also moving host ancestors.
        const strip = button.parentElement;
        if (!strip) return;
        const item = button.getBoundingClientRect();
        const viewport = strip.getBoundingClientRect();
        const left = viewport.left + strip.clientLeft;
        const right = left + strip.clientWidth;
        if (item.left < left) strip.scrollLeft += item.left - left;
        else if (item.right > right) strip.scrollLeft += item.right - right;
      } : undefined}
      id={`${id}-tab-${tab.id}`} aria-controls={`${id}-panel-${tab.id}`}
      aria-selected={value === tab.id} tabIndex={value === tab.id ? 0 : -1}
      onClick={() => onChange(tab.id)} onKeyDown={(event) => onKeyDown(event, index)}
      title={unread?.[tab.id] ? `${tab.label}：有新内容，点开后标记已读` : undefined}
      aria-label={unread?.[tab.id] ? `${tab.label}，有新内容` : undefined}
    >{tab.label}{unread?.[tab.id] && <span className="rt-tab-dot" role="img" aria-label="有新内容"
      style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", marginLeft: 5, verticalAlign: "middle", background: "var(--xsdsh-bad, #dc4b61)" }} />}</button>)}
  </div>;
}
