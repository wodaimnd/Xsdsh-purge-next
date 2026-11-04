/** @jsx h */
import type { CSSProperties, PointerEventHandler, ReactNode, Ref } from "react";
import { h, React } from "../host/react";
import { APP_TABS, NavigationTabs } from "./NavigationTabs";
import type { AppTab } from "./NavigationTabs";
import { DrillWorkspace } from "./DrillWorkspace";
import type { DrillWorkspaceProps } from "./DrillWorkspace";
import { APP_SHELL_CSS } from "./styles";

export interface AppShellProps {
  tab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onClose: () => void;
  drill: Omit<DrillWorkspaceProps, "id">;
  /** Supply the actual installed version; the shell never invents status data. */
  version?: string;
  open?: boolean;
  onDragStart?: PointerEventHandler<HTMLDivElement>;
  /** Geometry remains owned by the existing dock controller. */
  style?: CSSProperties;
  /** Register this element with the theme controller; never theme the host body. */
  rootRef?: Ref<HTMLDivElement>;
  renderPage?: (tab: Exclude<AppTab, "drill">) => ReactNode;
  children?: ReactNode;
}

const NO_DRAG: CSSProperties & { WebkitAppRegion: "no-drag" } = { WebkitAppRegion: "no-drag" };

/** Presentation only: persistence, grant state and long-running operations belong to the owner. */
export function AppShell(props: AppShellProps) {
  const id = `purge-app-${React.useId()}`;
  // 整根标题条都可拖动（点按钮/页签以外的空白也算）。文本选中已被面板级
  // user-select:none 挡住，拖动时不会把「Xsdsh-purge」标题带着高亮。
  const header = (event: React.PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button,a,input,select,textarea,label")) return;
    props.onDragStart?.(event as unknown as React.PointerEvent<HTMLDivElement>);
  };
  return <div ref={props.rootRef} className="purge-app" data-xsdsh-ui="app" hidden={props.open === false} style={{ ...props.style, ...NO_DRAG }}>
    <style>{APP_SHELL_CSS}</style>
    <header className="purge-app__header" style={NO_DRAG} onPointerDown={header}>
      <div className="purge-app__brand" style={NO_DRAG} title={props.onDragStart ? "按住拖动面板" : undefined}>
        <strong>Xsdsh-purge</strong>
        {props.version && <span className="purge-app__version">{props.version}</span>}
      </div>
      <button type="button" className="purge-app__button" onClick={props.onClose}>收起</button>
    </header>
    <NavigationTabs id={id} label="Xsdsh-purge 功能" tabs={APP_TABS} value={props.tab} onChange={props.onTabChange} />
    <div className={`purge-app__body${props.tab === "drill" ? " purge-app__body--drill" : ""}`}
      role="tabpanel" id={`${id}-panel-${props.tab}`} aria-labelledby={`${id}-tab-${props.tab}`} tabIndex={0}>
      {props.tab === "drill"
        ? <DrillWorkspace {...props.drill} id={id} />
        : (props.renderPage ? props.renderPage(props.tab) : props.children)}
    </div>
  </div>;
}
