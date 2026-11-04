/** @jsx h */
import { h, React } from "../host/react";
import type { ReactNode, Ref } from "react";
import { AppShell, type AppShellProps } from "./AppShell";
import { APP_TABS, type AppTab } from "./NavigationTabs";
import type { DrillLocation } from "./DrillWorkspace";
import { AppearancePage, type AppearanceController } from "../features/appearance";
import { CleanPage, type CleanRuntime, type CleanOperation } from "../features/clean";
import { CatPage } from "../features/cat/CatPage";
import type { CatRuntime } from "../features/cat/runtime";
import { PromptsPage } from "../features/prompts/PromptsPage";
import type { PromptsController } from "../features/prompts/controller";
import { GlobalConnectionConfig, TargetConfigPage } from "../features/config";
import { DrillContent, DrillToolbar, DrillFooter, TargetPrompts, useDrillController } from "../features/drill";
import { useDrillUnread } from "../features/drill/useDrillUnread";

export interface IntegratedRuntime {
  appearance: AppearanceController;
  clean: CleanRuntime;
  cat: CatRuntime;
  prompts: PromptsController;
}
export interface IntegratedAppProps {
  runtime: IntegratedRuntime;
  op: CleanOperation;
  state: { tab: string; open: boolean; authorized: boolean; drillLocation: DrillLocation };
  onTabChange: (tab: AppTab) => void;
  onNavigate: (location: DrillLocation) => void;
  onRequestRedteam: () => void;
  onRequestAuthorization: () => void;
  onClose: () => void;
  style?: AppShellProps["style"];
  onDragStart?: AppShellProps["onDragStart"];
  /** 宿主（dock）拿这个 ref 在拖动时直接写 transform，绕开整棵 React 重渲染。 */
  rootRef?: Ref<HTMLDivElement>;
}

class PromptsBoundary extends React.Component<{ children: ReactNode }, { error: string | null }> {
  state: { error: string | null } = { error: null };
  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  render() {
    return this.state.error === null ? this.props.children : <section role="alert"><h2>模式提示词页出错了</h2>
      <p>{this.state.error}</p><button type="button" onClick={() => this.setState({ error: null })}>重试</button></section>;
  }
}

/** The persistent composition boundary; legacy code supplies host capabilities only. */
export function IntegratedApp(props: IntegratedAppProps) {
  const { runtime, state } = props;
  const controller = useDrillController({ enabled: state.authorized });
  const unread = useDrillUnread({ enabled: state.authorized, engagement: controller.engagement,
    location: state.drillLocation, visible: state.open && state.tab === "drill", refreshKey: controller.refreshKey });
  const root = React.useRef<HTMLDivElement | null>(null);
  /* 内部 ref 要留给主题注册，外部（dock 拖动）ref 一并转发。 */
  const bindRoot = React.useCallback((node: HTMLDivElement | null) => {
    root.current = node;
    const external = props.rootRef;
    if (typeof external === "function") external(node);
    else if (external) (external as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, [props.rootRef]);
  const [version, setVersion] = React.useState("");
  React.useEffect(() => {
    const clean = runtime.clean;
    /* 部分宿主/测试只注入外观能力：没有状态接口就不显示版本，不影响其余页面。 */
    if (!clean || (!clean.statusApi && !clean.apiJson)) return;
    let alive = true;
    /* 复用宿主的 statusApi 单飞：与清洗页共用同一次 /Xsdsh-purge/status，不额外打一轮。 */
    const status = clean.statusApi ? clean.statusApi() : clean.apiJson("/Xsdsh-purge/status");
    Promise.resolve(status).then(value => {
      if (!alive) return;
      const plugin = value && typeof value === "object" ? (value as { plugin_version?: unknown }).plugin_version : undefined;
      if (typeof plugin === "string" && plugin.trim()) setVersion(plugin.trim());
    }, () => {});
    return () => { alive = false; };
  }, [runtime.clean]);
  React.useEffect(() => {
    if (root.current) return runtime.appearance.registerRoot(root.current);
  }, [runtime.appearance]);
  const tab = APP_TABS.some(item => item.id === state.tab) ? state.tab as AppTab : "clean";
  const renderPage = (page: Exclude<AppTab, "drill">) => {
    switch (page) {
      case "clean": return <CleanPage runtime={runtime.clean} op={props.op} />;
      case "look": return <AppearancePage controller={runtime.appearance} />;
      case "cat": return <CatPage runtime={runtime.cat} />;
      case "prompts": return <PromptsBoundary><PromptsPage controller={runtime.prompts} /></PromptsBoundary>;
    }
  };
  return <AppShell tab={tab} open={state.open} onTabChange={props.onTabChange}
    version={version ? "v" + version : undefined}
    onClose={props.onClose} onDragStart={props.onDragStart}
    rootRef={bindRoot} style={props.style} renderPage={renderPage}
    drill={{
      location: state.drillLocation, authorized: state.authorized,
      redteamUnread: unread.redteam, globalUnread: unread.global,
      onNavigate: props.onNavigate, onRequestRedteam: props.onRequestRedteam,
      confirmation: <button type="button" className="purge-app__button" onClick={props.onRequestAuthorization}>阅读须知并确认授权</button>,
      redteamToolbar: <DrillToolbar controller={controller} />,
      // No fabricated zero counts while the server snapshot is absent or failed.
      redteamFooter: controller.snapshot ? <DrillFooter controller={controller} /> : undefined,
      renderRedteam: page => <DrillContent area="redteam" tab={page} controller={controller}
        renderTarget={current => <div className="xsdsh-target-page">
          <TargetConfigPage engagement={current.engagement!} targetName={current.snapshot?.engagement?.name} />
          <TargetPrompts engagement={current.engagement} refreshKey={controller.refreshKey} />
        </div>} />,
      renderGlobal: page => <DrillContent area="global" tab={page} controller={controller}
        renderGlobalNet={() => <GlobalConnectionConfig />} />,
    }} />;
}
