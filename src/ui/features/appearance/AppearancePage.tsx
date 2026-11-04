import React from "../../host/react";
import type { CSSProperties } from "react";
import appearanceCss from "./appearance.css";
import { ACCENTS, THEMES, accentName, getTheme, getThemeTokens, type ThemeId } from "./tokens";
import { type AppearanceController, type LookIssue } from "./theme";

export interface AppearancePageProps { controller: AppearanceController }
const issueText: Record<Exclude<LookIssue, null>, string> = {
  "invalid-preference": "已保存的外观设置无效，已使用有效的默认值；重新选择后会保存。",
  "storage-read-failed": "无法读取本机外观设置，当前使用晴空；仍可切换本次外观。",
  "storage-write-failed": "外观已在本次打开中生效，但未能保存到本机。请检查浏览器存储权限后重试。",
};
function ThemePreview({ theme }: { theme: ThemeId }) {
  const tokens = getThemeTokens({ t: theme, a: getTheme(theme).accent });
  return <span className="xsdsh-appearance-mini" style={tokens as CSSProperties} aria-hidden="true">
    <span className="xsdsh-appearance-mini-head"><i /><i /><i /><em /></span>
    <span className="xsdsh-appearance-mini-row"><b /><i /></span>
    <span className="xsdsh-appearance-mini-row"><b /><i /></span>
    <span className="xsdsh-appearance-mini-tag">配色预览</span>
  </span>;
}
export function AppearancePage({ controller }: AppearancePageProps) {
  const [snapshot, setSnapshot] = React.useState(controller.getSnapshot);
  const [notice, setNotice] = React.useState("");
  const root = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    const release = root.current ? controller.registerRoot(root.current) : () => {};
    const update = () => setSnapshot(controller.getSnapshot());
    const unsubscribe = controller.subscribe(update);
    update();
    return () => { unsubscribe(); release(); };
  }, [controller]);
  const look = snapshot.look;
  const change = (action: () => unknown, message: string) => { action(); setNotice(message); };
  return <section ref={root} data-xsdsh-ui="appearance" className="xsdsh-appearance"
    style={getThemeTokens(look) as CSSProperties} aria-label="外观与配色">
    <style>{appearanceCss}</style>
    <header className="xsdsh-appearance-head">
      <div><h2>外观与配色</h2><p>3 套风格 · 6 种强调色 · 选择后立即生效</p></div>
      <span className="xsdsh-appearance-current">{getTheme(look.t).name} / {accentName(look.a)}</span>
      <button type="button" className="xsdsh-appearance-button" onClick={() => change(() => controller.reset(), "已恢复晴空默认配色。")}>恢复默认</button>
    </header>
    <p className="xsdsh-appearance-description">仅调整插件面板与弹层，不跟随宿主深浅色。设置保存在本机。</p>
    <fieldset className="xsdsh-appearance-fieldset">
      <legend>风格</legend>
      <p className="xsdsh-appearance-description">晴空为默认风格；切换风格时会同时使用该风格的默认强调色。</p>
      <div className="xsdsh-appearance-grid">
        {THEMES.map(theme => <button type="button" key={theme.id} className="xsdsh-appearance-card"
          aria-pressed={look.t === theme.id} onClick={() => change(() => controller.setTheme(theme.id), `已应用${theme.name}。`)}>
          <ThemePreview theme={theme.id} />
          <span className="xsdsh-appearance-name">{theme.name}
            {theme.id === "cat-sky" && <span className="xsdsh-appearance-badge">默认</span>}
            {look.t === theme.id && <span className="xsdsh-appearance-selected">已选</span>}
          </span>
          <span className="xsdsh-appearance-description">{theme.description}</span>
          <span className="xsdsh-appearance-dots" aria-hidden="true">
            {["panel3", "panel", "accent", "cat-pink"].map(token => <i key={token} style={{ background: getThemeTokens({ t: theme.id, a: theme.accent })[`--xsdsh-${token}`] }} />)}
          </span>
        </button>)}
      </div>
    </fieldset>
    <fieldset className="xsdsh-appearance-fieldset">
      <legend>强调色</legend>
      <p className="xsdsh-appearance-description">调整主按钮边框、标签和页签下划线；状态颜色保留各自含义。</p>
      <div className="xsdsh-appearance-accents">
        {ACCENTS.map(accent => <button type="button" key={accent.color} className="xsdsh-appearance-accent"
          aria-pressed={look.a === accent.color} onClick={() => change(() => controller.setAccent(accent.color), `已应用${accent.name}强调色。`)}>
          <i aria-hidden="true" style={{ background: accent.color }} />{accent.name}
          {look.a === accent.color && <span className="xsdsh-appearance-selected">已选</span>}
        </button>)}
      </div>
      {!ACCENTS.some(accent => accent.color === look.a) && <p className="xsdsh-appearance-description">当前使用风格默认强调色：{accentName(look.a)}。选择上方颜色可覆盖。</p>}
    </fieldset>
    <section className="xsdsh-appearance-preview" aria-label="实时配色预览">
      <h3>实时预览</h3>
      <p className="xsdsh-appearance-description">用于查看控件配色，不代表插件运行状态。</p>
      <div className="xsdsh-appearance-demo">
        <button type="button" className="xsdsh-appearance-button xsdsh-appearance-primary" onClick={() => setNotice("这是主按钮配色预览。")}>主按钮</button>
        <button type="button" className="xsdsh-appearance-button" onClick={() => setNotice("这是次按钮配色预览。")}>次按钮</button>
        <span className="xsdsh-appearance-tag" data-tone="ok">成功色</span>
        <span className="xsdsh-appearance-tag" data-tone="warn">提示色</span>
        <span className="xsdsh-appearance-tag" data-tone="bad">错误色</span>
        <label className="xsdsh-appearance-input-label">输入框<input readOnly placeholder="输入框预览" /></label>
        <span className="xsdsh-appearance-selection">选中态</span>
      </div>
    </section>
    <p role="status" aria-live="polite" className="xsdsh-appearance-notice" data-warning={snapshot.issue ? "true" : undefined}>
      {snapshot.issue ? issueText[snapshot.issue] : notice || "当前外观已应用。"}
    </p>
  </section>;
}
