/** @jsx h */
import type { ReactNode } from "react";
import { h } from "../host/react";
import { GLOBAL_TABS, REDTEAM_TABS, NavigationTabs } from "./NavigationTabs";
import type { GlobalTab, RedteamTab } from "./NavigationTabs";

export type DrillLocation =
  | { area: "home" }
  | { area: "redteam"; tab: RedteamTab }
  | { area: "global"; tab: GlobalTab };

export interface DrillWorkspaceProps {
  /** Unique within the document; supplied by AppShell when composed there. */
  id: string;
  location: DrillLocation;
  authorized: boolean;
  /** Navigation only. The owner must never use this callback to request a grant. */
  onNavigate: (location: DrillLocation) => void;
  /** Runs the existing welcome notice -> authorization flow. No grant is stored here. */
  onRequestRedteam: () => void;
  renderRedteam: (tab: RedteamTab) => ReactNode;
  renderGlobal: (tab: GlobalTab) => ReactNode;
  /** Real target selector/actions and status from the Panel controller. */
  redteamToolbar?: ReactNode;
  redteamFooter?: ReactNode;
  globalFooter?: ReactNode;
  redteamSummary?: ReactNode;
  globalSummary?: ReactNode;
  redteamUnread?: Readonly<Partial<Record<RedteamTab, boolean>>>;
  globalUnread?: Readonly<Partial<Record<GlobalTab, boolean>>>;
  /** Existing notice/authorization UI, rendered only for a blocked redteam route. */
  confirmation?: ReactNode;
}

export function DrillWorkspace(props: DrillWorkspaceProps) {
  const { id, location, onNavigate } = props;
  if (location.area === "home") return <section className="purge-app__home" aria-label="演练台入口">
    <h2 className="purge-app__heading">演练台</h2>
    <div className="purge-app__entries">
      <button type="button" className="purge-app__entry" onClick={props.onRequestRedteam}>
        <span className="purge-app__entry-icon" aria-hidden="true">◎</span>
        <span className="purge-app__entry-title">红队演练</span>
        <span className="purge-app__description">按靶标推进资产测绘、目标配置、会话隧道、漏洞战果、攻击链、得分目标与报告。</span>
        {props.redteamSummary != null && <span className="purge-app__summary">{props.redteamSummary}</span>}
        <span className="purge-app__entry-action">进入红队演练 →</span>
      </button>
      <button type="button" className="purge-app__entry" onClick={() => onNavigate({ area: "global", tab: "env" })}>
        <span className="purge-app__entry-icon" aria-hidden="true">⚙</span>
        <span className="purge-app__entry-title">全局配置</span>
        <span className="purge-app__description">管理环境适配、密钥与 VPS、智能体、知识库和技能库，跨靶标共享。</span>
        {props.globalSummary != null && <span className="purge-app__summary">{props.globalSummary}</span>}
        <span className="purge-app__entry-action">进入全局配置 →</span>
      </button>
    </div>
  </section>;

  const redteam = location.area === "redteam";
  const blocked = redteam && !props.authorized;
  const tabsId = `${id}-${location.area}`;
  return <section className="purge-app__workspace" aria-label={redteam ? "红队演练" : "全局配置"}>
    <div className="purge-app__workspace-head">
      <button type="button" className="purge-app__button" onClick={() => onNavigate({ area: "home" })}>← 演练台</button>
      <h2 className="purge-app__heading">{redteam ? "红队演练" : "全局配置"}</h2>
      <span className="purge-app__description">{redteam ? (props.authorized ? "已授权" : "待授权") : "跨靶标共享"}</span>
    </div>
    {blocked ? <section className="purge-app__confirmation" aria-labelledby={`${id}-confirmation-title`}>
      <h3 id={`${id}-confirmation-title`}>用户确认</h3>
      <p>进入红队演练前，请完成用户须知与演练授权确认。</p>
      {props.confirmation ?? <button type="button" className="purge-app__button" onClick={props.onRequestRedteam}>阅读须知并确认授权</button>}
    </section> : <div className="purge-app__workspace-content">
      {redteam && props.redteamToolbar != null && <div className="purge-app__toolbar">{props.redteamToolbar}</div>}
      {location.area === "redteam"
        ? <NavigationTabs id={tabsId} label="红队演练页面" tabs={REDTEAM_TABS} value={location.tab}
          unread={props.redteamUnread} onChange={(tab) => onNavigate({ area: "redteam", tab })} />
        : <NavigationTabs id={tabsId} label="全局配置页面" tabs={GLOBAL_TABS} value={location.tab}
          unread={props.globalUnread} onChange={(tab) => onNavigate({ area: "global", tab })} />}
      <div className="purge-app__page" role="tabpanel" tabIndex={0}
        id={`${tabsId}-panel-${location.tab}`} aria-labelledby={`${tabsId}-tab-${location.tab}`}>
        {location.area === "redteam" ? props.renderRedteam(location.tab) : props.renderGlobal(location.tab)}
      </div>
      {(redteam ? props.redteamFooter : props.globalFooter) != null && <footer className="purge-app__footer">
        {redteam ? props.redteamFooter : props.globalFooter}
      </footer>}
    </div>}
  </section>;
}
