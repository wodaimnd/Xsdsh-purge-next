window.__ModuleLoader__.load({ id: "Xsdsh-purge-next", factory: (require) => {

		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		const h = react.createElement;
		const { useState, useEffect, useCallback, useRef, Component } = react;

/* __XSDSH_UI_MODULES_BEGIN__ */
const __xsdshClientModules = (() => {
  var module = { exports: {} };
  var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ui/client-modules.ts
var client_modules_exports = {};
__export(client_modules_exports, {
  Btn: () => Btn,
  Drill: () => drill_exports,
  IntegratedApp: () => IntegratedApp,
  createAppearanceController: () => createAppearanceController,
  createPromptsController: () => createPromptsController
});
module.exports = __toCommonJS(client_modules_exports);

// src/ui/host/react.ts
var React = require("react");
var h = React.createElement;
var react_default = React;

// src/ui/components/Btn.tsx
function Btn(props) {
  const { kind, tiny, children, className, type, ...rest } = props;
  const cls = ["xsdsh-btn", kind ? "xsdsh-btn-" + kind : "xsdsh-btn-ghost", tiny ? "xsdsh-btn-tiny" : "", className || ""].filter(Boolean).join(" ");
  return /* @__PURE__ */ React.createElement("button", { type: type || "button", className: cls, ...rest }, children);
}

// src/ui/app/NavigationTabs.tsx
var APP_TABS = [
  { id: "clean", label: "清洗" },
  { id: "drill", label: "演练台" },
  { id: "prompts", label: "模式提示词" },
  { id: "look", label: "外观" }
];
var REDTEAM_TABS = [
  { id: "assets", label: "资产测绘" },
  { id: "target", label: "目标配置" },
  { id: "sessions", label: "会话隧道" },
  { id: "findings", label: "漏洞战果" },
  { id: "chain", label: "攻击链" },
  { id: "scores", label: "得分目标" },
  { id: "report", label: "报告" }
];
var GLOBAL_TABS = [
  { id: "env", label: "环境适配" },
  { id: "net", label: "密钥与 VPS" },
  { id: "agents", label: "智能体" },
  { id: "knowledge", label: "知识库" },
  { id: "skills", label: "技能库" }
];
function NavigationTabs({ id, label, tabs, value, unread, onChange }) {
  const onKeyDown = (event, index) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    const buttons = event.currentTarget.parentElement?.querySelectorAll('[role="tab"]');
    buttons?.[next]?.focus({ preventScroll: true });
    onChange(tabs[next].id);
  };
  return /* @__PURE__ */ h("div", { className: "purge-app__tabs", role: "tablist", "aria-label": label }, tabs.map((tab, index) => /* @__PURE__ */ h(
    "button",
    {
      type: "button",
      key: tab.id,
      className: "purge-app__tab",
      role: "tab",
      ref: value === tab.id ? (button) => {
        if (!button) return;
        const strip = button.parentElement;
        if (!strip) return;
        const item = button.getBoundingClientRect();
        const viewport = strip.getBoundingClientRect();
        const left = viewport.left + strip.clientLeft;
        const right = left + strip.clientWidth;
        if (item.left < left) strip.scrollLeft += item.left - left;
        else if (item.right > right) strip.scrollLeft += item.right - right;
      } : void 0,
      id: `${id}-tab-${tab.id}`,
      "aria-controls": `${id}-panel-${tab.id}`,
      "aria-selected": value === tab.id,
      tabIndex: value === tab.id ? 0 : -1,
      onClick: () => onChange(tab.id),
      onKeyDown: (event) => onKeyDown(event, index),
      title: unread?.[tab.id] ? `${tab.label}：有新内容，点开后标记已读` : void 0,
      "aria-label": unread?.[tab.id] ? `${tab.label}，有新内容` : void 0
    },
    tab.label,
    unread?.[tab.id] && /* @__PURE__ */ h(
      "span",
      {
        className: "rt-tab-dot",
        role: "img",
        "aria-label": "有新内容",
        style: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", marginLeft: 5, verticalAlign: "middle", background: "var(--xsdsh-bad, #dc4b61)" }
      }
    )
  )));
}

// src/ui/app/DrillWorkspace.tsx
function DrillWorkspace(props) {
  const { id, location, onNavigate } = props;
  if (location.area === "home") return /* @__PURE__ */ h("section", { className: "purge-app__home", "aria-label": "演练台入口" }, /* @__PURE__ */ h("h2", { className: "purge-app__heading" }, "演练台"), /* @__PURE__ */ h("div", { className: "purge-app__entries" }, /* @__PURE__ */ h("button", { type: "button", className: "purge-app__entry", onClick: props.onRequestRedteam }, /* @__PURE__ */ h("span", { className: "purge-app__entry-icon", "aria-hidden": "true" }, "◎"), /* @__PURE__ */ h("span", { className: "purge-app__entry-title" }, "红队演练"), /* @__PURE__ */ h("span", { className: "purge-app__description" }, "按靶标推进资产测绘、目标配置、会话隧道、漏洞战果、攻击链、得分目标与报告。"), props.redteamSummary != null && /* @__PURE__ */ h("span", { className: "purge-app__summary" }, props.redteamSummary), /* @__PURE__ */ h("span", { className: "purge-app__entry-action" }, "进入红队演练 →")), /* @__PURE__ */ h("button", { type: "button", className: "purge-app__entry", onClick: () => onNavigate({ area: "global", tab: "env" }) }, /* @__PURE__ */ h("span", { className: "purge-app__entry-icon", "aria-hidden": "true" }, "⚙"), /* @__PURE__ */ h("span", { className: "purge-app__entry-title" }, "全局配置"), /* @__PURE__ */ h("span", { className: "purge-app__description" }, "管理环境适配、密钥与 VPS、智能体、知识库和技能库，跨靶标共享。"), props.globalSummary != null && /* @__PURE__ */ h("span", { className: "purge-app__summary" }, props.globalSummary), /* @__PURE__ */ h("span", { className: "purge-app__entry-action" }, "进入全局配置 →"))));
  const redteam = location.area === "redteam";
  const blocked = redteam && !props.authorized;
  const tabsId = `${id}-${location.area}`;
  return /* @__PURE__ */ h("section", { className: "purge-app__workspace", "aria-label": redteam ? "红队演练" : "全局配置" }, /* @__PURE__ */ h("div", { className: "purge-app__workspace-head" }, /* @__PURE__ */ h("button", { type: "button", className: "purge-app__button", onClick: () => onNavigate({ area: "home" }) }, "← 演练台"), /* @__PURE__ */ h("h2", { className: "purge-app__heading" }, redteam ? "红队演练" : "全局配置"), /* @__PURE__ */ h("span", { className: "purge-app__description" }, redteam ? props.authorized ? "已授权" : "待授权" : "跨靶标共享")), blocked ? /* @__PURE__ */ h("section", { className: "purge-app__confirmation", "aria-labelledby": `${id}-confirmation-title` }, /* @__PURE__ */ h("h3", { id: `${id}-confirmation-title` }, "用户确认"), /* @__PURE__ */ h("p", null, "进入红队演练前，请完成用户须知与演练授权确认。"), props.confirmation ?? /* @__PURE__ */ h("button", { type: "button", className: "purge-app__button", onClick: props.onRequestRedteam }, "阅读须知并确认授权")) : /* @__PURE__ */ h("div", { className: "purge-app__workspace-content" }, redteam && props.redteamToolbar != null && /* @__PURE__ */ h("div", { className: "purge-app__toolbar" }, props.redteamToolbar), location.area === "redteam" ? /* @__PURE__ */ h(
    NavigationTabs,
    {
      id: tabsId,
      label: "红队演练页面",
      tabs: REDTEAM_TABS,
      value: location.tab,
      unread: props.redteamUnread,
      onChange: (tab) => onNavigate({ area: "redteam", tab })
    }
  ) : /* @__PURE__ */ h(
    NavigationTabs,
    {
      id: tabsId,
      label: "全局配置页面",
      tabs: GLOBAL_TABS,
      value: location.tab,
      unread: props.globalUnread,
      onChange: (tab) => onNavigate({ area: "global", tab })
    }
  ), /* @__PURE__ */ h(
    "div",
    {
      className: "purge-app__page",
      role: "tabpanel",
      tabIndex: 0,
      id: `${tabsId}-panel-${location.tab}`,
      "aria-labelledby": `${tabsId}-tab-${location.tab}`
    },
    location.area === "redteam" ? props.renderRedteam(location.tab) : props.renderGlobal(location.tab)
  ), (redteam ? props.redteamFooter : props.globalFooter) != null && /* @__PURE__ */ h("footer", { className: "purge-app__footer" }, redteam ? props.redteamFooter : props.globalFooter)));
}

// src/ui/app/styles.ts
var APP_SHELL_CSS = `
.purge-app {
  box-sizing: border-box;
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  width: 1060px;
  max-width: calc(100vw - 16px);
  height: 780px;
  max-height: calc(100vh - 16px);
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--xsdsh-line, #e4e9f0);
  border-radius: 14px;
  background: var(--xsdsh-panel, var(--xsdsh-paper, #ffffff));
  color: var(--xsdsh-ink, #101828);
  font: 14px/1.6 var(--xsdsh-sans, "Segoe UI", "Microsoft YaHei", sans-serif);
  box-shadow: 0 18px 44px rgb(35 54 82 / 16%);
  -webkit-app-region: no-drag;
  container-type: inline-size;
}
.purge-app[hidden] { display: none; }
/* 拖动期间只提示合成器提升图层，避免每帧重新栅格化整块面板。 */
.purge-app.is-dragging { will-change: transform; }
/* 整个面板默认不可选中文本，只有输入框/文本域等允许选中；标题条保持不可选中，
   否则按住拖动时会带着文字一起高亮。 */
.purge-app { user-select: none; }
.purge-app input, .purge-app textarea, .purge-app select,
.purge-app [contenteditable="true"] { user-select: text; }
/* 标题条整体可拖动，不止是品牌字那一小段。 */
.purge-app .purge-app__header { cursor: grab; touch-action: none; }
.purge-app .purge-app__header:active { cursor: grabbing; }
/* 面板内统一样式的下拉：原生 <select> 的下拉层由系统绘制，容易越出嵌入窗口且
   不吃主题色。这里全部走 .purge-select，列表在面板里打开、跟随主题。
   规则不写在 .purge-app 下：下拉在工具栏和补丁面板里用，不套 .purge-app 选择器。 */
.purge-select { position: relative; display: inline-block; min-width: 0; }
.purge-select .purge-select-trigger {
  display: flex; align-items: center; gap: 8px; width: 100%; box-sizing: border-box;
  padding: 5px 10px; border: 1px solid var(--xsdsh-line, #e4e9f0); border-radius: 8px;
  background: var(--xsdsh-panel, #fff); color: var(--xsdsh-ink, #101828);
  font: inherit; font-size: 12.5px; cursor: pointer; text-align: left;
}
.purge-select .purge-select-trigger:disabled { opacity: .55; cursor: default; }
.purge-select .purge-select-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.purge-select .purge-select-caret { font-size: 10px; color: var(--xsdsh-mute, #5b6b80); flex: none; }
.purge-select .purge-select-list {
  position: fixed; z-index: 2147483002; box-sizing: border-box; margin: 0; padding: 4px; list-style: none;
  border: 1px solid var(--xsdsh-line, #e4e9f0); border-radius: 10px;
  background: var(--xsdsh-panel, #fff); color: var(--xsdsh-ink, #101828);
  box-shadow: 0 14px 34px rgb(35 54 82 / 18%);
  overflow: auto; overscroll-behavior: contain; scrollbar-width: thin;
  font-size: 12.5px;
}
.purge-select.is-sm .purge-select-trigger { padding: 3px 8px; font-size: 11.5px; border-radius: 7px; gap: 6px; }
.purge-select.is-sm .purge-select-list { padding: 3px; font-size: 11.5px; }
.purge-select.is-sm .purge-select-option { padding: 5px 8px; }
.purge-select .purge-select-option {
  padding: 6px 10px; border-radius: 6px; cursor: pointer; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.purge-select .purge-select-option.is-hl { background: var(--xsdsh-hover, var(--xsdsh-panel2, #e8f0ff)); }
.purge-select .purge-select-option.is-on {
  background: var(--xsdsh-accent-soft, var(--xsdsh-panel2, #e8f0ff));
  color: var(--xsdsh-accent, #2563eb); font-weight: 600;
}
.purge-select .purge-select-empty { padding: 8px 10px; color: var(--xsdsh-mute, #5b6b80); font-size: 12px; }
/* 密码/密钥框：眼睛按钮只切换 type，不碰受控值。 */
.purge-secret { position: relative; display: block; min-width: 0; max-width: 100%; }
.purge-secret .purge-secret-input { width: 100%; padding-right: 34px; }
.purge-secret .purge-secret-eye {
  position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
  display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px;
  padding: 0; border: 0; border-radius: 6px; background: transparent; color: var(--xsdsh-mute, #5b6b80); cursor: pointer;
}
.purge-secret .purge-secret-eye:hover { background: var(--xsdsh-hover, #eef3f9); color: var(--xsdsh-ink, #101828); }
.purge-secret .purge-secret-eye:focus-visible { outline: 2px solid var(--xsdsh-accent, #2563eb); outline-offset: 1px; }
.purge-secret .purge-secret-eye svg { display: block; }
.purge-app .purge-app__header,
.purge-app .purge-app__workspace-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: none; font-size: 10.5px; color: var(--xsdsh-faint, #7b899b); }
.purge-app .purge-app__header { padding: 12px 16px; border-bottom: 1px solid var(--xsdsh-line, #e4e9f0); }
.purge-app .purge-app__brand { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; flex-wrap: wrap; }
.purge-app .purge-app__brand[title] { cursor: grab; touch-action: none; user-select: none; }
.purge-app .purge-app__version { font-size: 11px; color: var(--xsdsh-mute, #5b6b80); }
.purge-app .purge-app__button {
  border: 1px solid var(--xsdsh-line, #e4e9f0); border-radius: 8px; padding: 5px 12px;
  color: inherit; background: var(--xsdsh-panel, #fff); font: inherit; font-size: 12.5px; cursor: pointer;
  transition: background .15s var(--xsdsh-ease), border-color .15s var(--xsdsh-ease);
}
.purge-app .purge-app__button:hover {
  background: var(--xsdsh-hover, #eef3f9); border-color: var(--xsdsh-line-hover, #aab7c8);
}
.purge-app .purge-app__button:disabled { opacity: .45; cursor: not-allowed; }
.purge-app .purge-app__tab:hover { background: var(--xsdsh-hover, #eef3f9); }
.purge-app .purge-app__button:focus-visible,
.purge-app .purge-app__tab:focus-visible,
.purge-app .purge-app__entry:focus-visible { outline: 2px solid var(--xsdsh-accent, #2563eb); outline-offset: -3px; }
.purge-app .purge-app__tabs { display: flex; flex: none; overflow-x: auto; padding: 0 8px; border-bottom: 1px solid var(--xsdsh-line, #e4e9f0); }
.purge-app .purge-app__tab {
  border: 0; border-bottom: 2px solid transparent; border-radius: 0;
  background: transparent; color: var(--xsdsh-mute, #5b6b80); padding: 10px 13px 9px;
  font: inherit; font-size: 13px; white-space: nowrap; cursor: pointer; flex: none;
}
.purge-app .purge-app__tab[aria-selected="true"] { color: var(--xsdsh-ink, #101828); font-weight: 600; border-bottom-color: var(--xsdsh-accent, #2563eb); }
.purge-app .purge-app__body { flex: 1; min-height: 0; min-width: 0; overflow: auto; padding: 16px 20px; }
.purge-app .purge-app__body--drill { display: flex; flex-direction: column; overflow: hidden; }
.purge-app .purge-app__heading { margin: 0; font-size: 14px; font-weight: 600; }
.purge-app .purge-app__description { color: var(--xsdsh-mute, #5b6b80); font-size: 11.5px; line-height: 1.65; }
.purge-app .purge-app__home { overflow: auto; min-height: 0; }
.purge-app .purge-app__entries { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 10px; }
.purge-app .purge-app__entry {
  display: flex; flex-direction: column; align-items: flex-start; gap: 7px;
  padding: 15px 16px; border: 1px solid var(--xsdsh-line, #e4e9f0); border-radius: 12px;
  background: var(--xsdsh-panel, #fff); color: inherit;
  font: inherit; text-align: left; cursor: pointer; overflow-wrap: anywhere;
}
.purge-app .purge-app__entry:hover { border-color: var(--xsdsh-accent, #2563eb); }
.purge-app .purge-app__entry-title { font-size: 15px; font-weight: 700; }
.purge-app .purge-app__entry-icon { width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; background: var(--xsdsh-accent-soft, #e8f0ff); color: var(--xsdsh-accent, #2563eb); font-size: 17px; }
.purge-app .purge-app__entry-action { margin-top: auto; padding-top: 2px; color: var(--xsdsh-accent, #2563eb); font-size: 11.5px; font-weight: 600; }
.purge-app .purge-app__summary { font-size: 10.5px; color: var(--xsdsh-faint, #7b899b); }
.purge-app .purge-app__workspace,
.purge-app .purge-app__workspace-content { display: flex; flex-direction: column; flex: 1; min-height: 0; min-width: 0; }
.purge-app .purge-app__workspace-head { margin-bottom: 6px; }
.purge-app .purge-app__workspace-head .purge-app__heading { font-size: 12.5px; }
.purge-app .purge-app__workspace-head .purge-app__description { font-size: 10.5px; }
.purge-app .purge-app__workspace-head .purge-app__button { padding: 3px 9px; font-size: 11.5px; border-radius: 6px; }
.purge-app .purge-app__toolbar { flex: none; margin-bottom: 6px; }
.purge-app .purge-app__workspace-content > .purge-app__tabs { padding: 0; }
.purge-app .purge-app__workspace-content > .purge-app__tabs .purge-app__tab { padding: 5px 9px 4px; font-size: 12px; }
.purge-app .purge-app__page { flex: 1; min-height: 0; min-width: 0; overflow: auto; padding-top: 6px; scrollbar-width: thin; }
.purge-app .purge-app__footer { flex: none; padding-top: 6px; font-size: 10.5px; color: var(--xsdsh-faint, #7b899b); }
.purge-app .purge-app__confirmation { overflow: auto; padding: 16px; border: 1px solid var(--xsdsh-line, #e4e9f0); border-radius: 10px; }
.purge-app .purge-app__confirmation > h3 { margin: 0; font-size: 16px; }
@container (max-width: 640px) {
  .purge-app .purge-app__entries { grid-template-columns: 1fr; gap: 12px; }
  .purge-app .purge-app__entry { min-height: 160px; padding: 18px; }
  .purge-app .purge-app__body { padding: 12px; }
  .purge-app .purge-app__header { padding: 10px 12px; }
}
@media (max-width: 640px) {
  .purge-app .purge-app__entries { grid-template-columns: 1fr; }
}
`;

// src/ui/app/AppShell.tsx
var NO_DRAG = { WebkitAppRegion: "no-drag" };
function AppShell(props) {
  const id = `purge-app-${React.useId()}`;
  const header = (event) => {
    if (event.target.closest("button,a,input,select,textarea,label")) return;
    props.onDragStart?.(event);
  };
  return /* @__PURE__ */ h("div", { ref: props.rootRef, className: "purge-app", "data-xsdsh-ui": "app", hidden: props.open === false, style: { ...props.style, ...NO_DRAG } }, /* @__PURE__ */ h("style", null, APP_SHELL_CSS), /* @__PURE__ */ h("header", { className: "purge-app__header", style: NO_DRAG, onPointerDown: header }, /* @__PURE__ */ h("div", { className: "purge-app__brand", style: NO_DRAG, title: props.onDragStart ? "按住拖动面板" : void 0 }, /* @__PURE__ */ h("strong", null, "Xsdsh-purge-next"), props.version && /* @__PURE__ */ h("span", { className: "purge-app__version" }, props.version)), /* @__PURE__ */ h("button", { type: "button", className: "purge-app__button", onClick: props.onClose }, "收起")), /* @__PURE__ */ h(NavigationTabs, { id, label: "Xsdsh-purge-next 功能", tabs: APP_TABS, value: props.tab, onChange: props.onTabChange }), /* @__PURE__ */ h(
    "div",
    {
      className: `purge-app__body${props.tab === "drill" ? " purge-app__body--drill" : ""}`,
      role: "tabpanel",
      id: `${id}-panel-${props.tab}`,
      "aria-labelledby": `${id}-tab-${props.tab}`,
      tabIndex: 0
    },
    props.tab === "drill" ? /* @__PURE__ */ h(DrillWorkspace, { ...props.drill, id }) : props.renderPage ? props.renderPage(props.tab) : props.children
  ));
}

// src/ui/features/appearance/appearance.css
var appearance_default = '.xsdsh-appearance {\n  box-sizing: border-box;\n  container-type: inline-size;\n  min-width: 0;\n  /* 外层 .purge-app__body 已有 16/20 内边距，页面自己不再叠一层，否则内容被挤窄。 */\n  padding: 0;\n  color: var(--xsdsh-ink);\n  background: transparent;\n  border-radius: 12px;\n  font: 13px/1.6 var(--xsdsh-font-ui);\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  min-height: 0;\n  overflow: hidden;\n}\n.xsdsh-appearance * { box-sizing: border-box; }\n.xsdsh-appearance h2, .xsdsh-appearance h3, .xsdsh-appearance p { margin: 0; }\n.xsdsh-appearance h2 { font-size: 16px; font-weight: 650; }\n.xsdsh-appearance h3 { font-size: 13px; font-weight: 650; }\n.xsdsh-appearance button, .xsdsh-appearance input { font: inherit; }\n.xsdsh-appearance button { cursor: pointer; }\n.xsdsh-appearance button:focus-visible, .xsdsh-appearance input:focus-visible {\n  outline: 2px solid var(--xsdsh-accent); outline-offset: 3px;\n}\n.xsdsh-appearance-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 6px; flex: none; }\n.xsdsh-appearance-head p, .xsdsh-appearance-description { color: var(--xsdsh-mute); font-size: 11.5px; }\n.xsdsh-appearance-current { margin-left: auto; color: var(--xsdsh-mute); font-size: 11.5px; }\n.xsdsh-appearance-fieldset { border: 0; margin: 10px 0 0; padding: 0; min-width: 0; flex: none; }\n.xsdsh-appearance-fieldset legend { padding: 0; font-weight: 650; font-size: 13px; margin-bottom: 3px; }\n.xsdsh-appearance-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 8px; }\n.xsdsh-appearance-card { display: flex; flex-direction: column; gap: 5px; min-width: 0; padding: 8px; text-align: left; color: var(--xsdsh-ink); background: var(--xsdsh-panel2); border: 1px solid var(--xsdsh-line); border-radius: 10px; transition: border-color .15s, box-shadow .15s; }\n.xsdsh-appearance-card:hover, .xsdsh-appearance-accent:hover { border-color: var(--xsdsh-line-hover); }\n.xsdsh-appearance-button:hover { background: var(--xsdsh-hover); border-color: var(--xsdsh-line-hover); }\n.xsdsh-appearance-card[aria-pressed="true"] { border-color: var(--xsdsh-accent); box-shadow: 0 0 0 1px var(--xsdsh-accent-glow); }\n.xsdsh-appearance-name { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-weight: 650; font-size: 12.5px; }\n.xsdsh-appearance-badge { font-size: 10px; font-weight: 400; color: var(--xsdsh-mute); border: 1px solid var(--xsdsh-line); border-radius: 99px; padding: 0 6px; }\n.xsdsh-appearance-selected { font-size: 11px; margin-left: auto; color: var(--xsdsh-ink); }\n.xsdsh-appearance-card > .xsdsh-appearance-description { flex: 1; font-size: 11px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\n.xsdsh-appearance-dots { display: flex; gap: 4px; }\n.xsdsh-appearance-dots i { width: 12px; height: 12px; border: 1px solid var(--xsdsh-line3); border-radius: 4px; }\n.xsdsh-appearance-mini { display: flex; flex-direction: column; align-self: stretch; height: 56px; overflow: hidden; gap: 3px; padding: 5px; border: 1px solid var(--xsdsh-line); border-radius: 7px; background: var(--xsdsh-bg); color: var(--xsdsh-ink); }\n.xsdsh-appearance-mini-head { display: flex; align-items: center; gap: 4px; background: var(--xsdsh-panel); padding: 5px 6px; border-bottom: 1px solid var(--xsdsh-line2); border-radius: 4px 4px 0 0; }\n.xsdsh-appearance-mini-head i { width: 6px; height: 6px; border-radius: 50%; background: var(--xsdsh-line); }\n.xsdsh-appearance-mini-head i:first-child { background: var(--xsdsh-accent); }\n.xsdsh-appearance-mini-head em { flex: 1; height: 4px; background: var(--xsdsh-mute); opacity: .3; border-radius: 2px; margin-left: 6px; }\n.xsdsh-appearance-mini-row { display: flex; align-items: center; gap: 5px; padding: 4px 6px; background: var(--xsdsh-panel2); border-radius: 4px; }\n.xsdsh-appearance-mini-row b { width: 8px; height: 8px; background: var(--xsdsh-accent); border-radius: 2px; }\n.xsdsh-appearance-mini-row:nth-child(3) b { background: var(--xsdsh-cat-pink); }\n.xsdsh-appearance-mini-row i { flex: 1; height: 4px; background: var(--xsdsh-mute); opacity: .5; border-radius: 2px; }\n.xsdsh-appearance-mini-tag { align-self: flex-start; font-size: 10px; padding: 0 6px; background: var(--xsdsh-accent-bg); color: var(--xsdsh-ink); border-radius: 99px; }\n.xsdsh-appearance-accents { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 4px; }\n.xsdsh-appearance-accent { display: inline-flex; align-items: center; gap: 6px; min-height: 30px; padding: 3px 9px 3px 5px; border: 1px solid var(--xsdsh-line); border-radius: 99px; background: var(--xsdsh-panel2); color: var(--xsdsh-ink); font-size: 12px; }\n.xsdsh-appearance-accent[aria-pressed="true"] { background: var(--xsdsh-accent-bg); border-color: var(--xsdsh-accent); color: var(--xsdsh-accent); }\n.xsdsh-appearance-accent i { display: block; width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--xsdsh-line3); }\n.xsdsh-appearance-preview { margin-top: 10px; border: 1px solid var(--xsdsh-line); border-radius: 10px; background: var(--xsdsh-panel2); padding: 10px; flex: none; }\n.xsdsh-appearance-demo { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 8px; }\n.xsdsh-appearance-button { min-height: 30px; padding: 4px 11px; border: 1px solid var(--xsdsh-line); border-radius: 8px; background: var(--xsdsh-panel); color: var(--xsdsh-ink); transition: background .15s var(--xsdsh-ease), border-color .15s var(--xsdsh-ease); }\n.xsdsh-appearance-primary { border-color: var(--xsdsh-accent); background: var(--xsdsh-accent-soft); color: var(--xsdsh-accent); }\n.xsdsh-appearance-primary:hover { background: var(--xsdsh-accent-bg); }\n.xsdsh-appearance-tag { padding: 2px 7px; font-size: 12px; border: 1px solid; border-radius: 99px; }\n.xsdsh-appearance-tag[data-tone="ok"] { color: var(--xsdsh-ok); border-color: var(--xsdsh-ok-line); background: var(--xsdsh-ok-soft); }\n.xsdsh-appearance-tag[data-tone="warn"] { color: var(--xsdsh-warn); border-color: var(--xsdsh-warn-line); background: var(--xsdsh-warn-soft); }\n.xsdsh-appearance-tag[data-tone="bad"] { color: var(--xsdsh-bad); border-color: var(--xsdsh-bad-line); background: var(--xsdsh-bad-soft); }\n.xsdsh-appearance-input-label { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 12px; color: var(--xsdsh-mute); }\n.xsdsh-appearance-input-label input { width: 120px; min-width: 0; min-height: 30px; padding: 4px 8px; color: var(--xsdsh-ink); background: var(--xsdsh-inset); border: 1px solid var(--xsdsh-line); border-radius: 8px; }\n.xsdsh-appearance-input-label input::placeholder { color: var(--xsdsh-mute); opacity: 1; }\n.xsdsh-appearance-selection { padding: 3px 9px; background: var(--xsdsh-accent-bg); border: 1px solid var(--xsdsh-accent); border-radius: 7px; }\n.xsdsh-appearance-notice { margin-top: 6px !important; color: var(--xsdsh-mute); font-size: 11.5px; min-height: 18px; flex: none; }\n.xsdsh-appearance-notice[data-warning="true"] { color: var(--xsdsh-warn); background: var(--xsdsh-warn-soft); padding: 6px 10px; border: 1px solid var(--xsdsh-warn-line); border-radius: 7px; }\n@container (max-width: 760px) {\n  .xsdsh-appearance-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n  .xsdsh-appearance-card > .xsdsh-appearance-description { display: none; }\n}\n@container (max-width: 440px) {\n  .xsdsh-appearance-grid { grid-template-columns: minmax(0, 1fr); }\n  .xsdsh-appearance-current { margin-left: 0; width: 100%; }\n}\n/* 矮窗口：说明文字先让位，保留可操作的卡片和按钮。 */\n@media (max-height: 700px) {\n  .xsdsh-appearance .xsdsh-appearance-description { display: none; }\n  .xsdsh-appearance-fieldset { margin-top: 8px; }\n  .xsdsh-appearance-mini { height: 48px; }\n}\n@media (max-height: 580px) {\n  .xsdsh-appearance-preview { display: none; }\n}\n/* 极端小窗（高 ≤520 或 宽 ≤440）：内容物理上放不下，允许外层滚动而不是裁切。 */\n@media (max-height: 520px), (max-width: 440px) {\n  .xsdsh-appearance { height: auto; overflow: visible; }\n}\n@media (prefers-reduced-motion: reduce) { .xsdsh-appearance-card { transition: none; } }\n';

// src/ui/features/appearance/tokens.ts
var THEMES = [
  { id: "cat-sky", name: "晴空", accent: "#2563eb", description: "中性冷灰底配明亮靛蓝，白卡片与极淡边框，白天投屏也清楚。" },
  { id: "cat-night", name: "夜巡", accent: "#7fc8e8", description: "深蓝底配冰蓝高光，深海军蓝让夜间阅读更舒适。" },
  { id: "cat-sakura", name: "樱雪", accent: "#b04a72", description: "奶白底配樱粉强调，状态色加深后小字也看得清。" }
];
var ACCENTS = [
  { color: "#8fbf9a", name: "鼠尾草绿" },
  { color: "#2563eb", name: "靛蓝" },
  { color: "#e79ab2", name: "猫耳粉" },
  { color: "#a78bca", name: "雪青紫" },
  { color: "#d8b56c", name: "琥珀" },
  { color: "#e0897f", name: "珊瑚" }
];
var DEFAULT_LOOK = Object.freeze({ t: "cat-sky", a: "#2563eb" });
function getTheme(id) {
  return THEMES.find((theme) => theme.id === id);
}
function accentName(color) {
  return ACCENTS.find((accent) => accent.color === color)?.name ?? { "#2563eb": "靛蓝", "#7fc8e8": "冰蓝", "#b04a72": "樱粉" }[color] ?? color;
}
var LEGACY_THEMES = { "default-light": "cat-sky" };
var LEGACY_ACCENTS = { "#2f7f8f": "#2563eb", "#d97fa4": "#b04a72" };
function migrateLook(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const input = value;
  const theme = typeof input.t === "string" ? LEGACY_THEMES[input.t] ?? input.t : input.t;
  const accent = typeof input.a === "string" ? LEGACY_ACCENTS[input.a.toLowerCase()] ?? input.a : input.a;
  return theme === input.t && accent === input.a ? value : { ...input, t: theme, a: accent };
}
function normalizeLook(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_LOOK;
  const input = value;
  const theme = THEMES.find((item) => item.id === input.t);
  if (!theme) return DEFAULT_LOOK;
  const accent = typeof input.a === "string" ? input.a.toLowerCase() : "";
  const valid = accent === theme.accent || ACCENTS.some((item) => item.color === accent);
  return Object.freeze({ t: theme.id, a: valid ? accent : theme.accent });
}
var paletteSource = {
  "cat-sky": `
    bg:#f4f7fb;panel:#ffffff;panel2:#f8fafc;panel3:#eef2f7;
    inset:#f6f8fb;inset2:#f0f4f9;soft:#e5eaf1;soft2:#d8e0ea;hover:#eef3f9;hover2:#e7eef6;sel:#e8f0ff;
    line:#e4e9f0;line2:#edf1f5;line3:#cfd7e3;line-hover:#aab7c8;ink:#101828;mute:#5b6b80;faint:#667282;
    accent:#2563eb;accent-bg:#e8f0ff;accent-soft:rgba(37,99,235,.10);accent-glow:rgba(37,99,235,.22);
    ok:#067647;ok-soft:rgba(6,118,71,.10);ok-line:rgba(6,118,71,.32);
    warn:#b54708;warn-soft:rgba(181,71,8,.10);warn-line:rgba(181,71,8,.28);
    bad:#d0241a;bad-soft:rgba(208,36,26,.10);bad-line:rgba(208,36,26,.28);
    na:#667282;na-soft:rgba(102,114,130,.16);skip:#6938ef;purple:#7a5af8;purple-soft:rgba(122,90,248,.12);
    mut-soft:rgba(91,107,128,.08);danger-line:#f0b4b0;danger-bg:#fef3f2;scroll:#cfd7e3;scroll-h:#aab7c8;cat-pink:#e79ab2;
    overlay:rgba(16,24,40,.42);shadow-dock:0 18px 44px rgba(16,24,40,.14);shadow-menu:0 16px 36px rgba(16,24,40,.18);`,
  "cat-night": `
    bg:#0d121b;panel:#151c28;panel2:#1a2230;panel3:#131a26;
    inset:#101722;inset2:#121a26;soft:#202a3a;soft2:#2b3a4e;hover:#1e2837;hover2:#232e3f;sel:#1b2b3a;
    line:#2b3748;line2:#222d3d;line3:#3a4a5f;line-hover:#3d4f66;ink:#e3edf6;mute:#93a6ba;faint:#8698ab;
    accent:#7fc8e8;accent-bg:#1d3a4b;accent-soft:rgba(127,200,232,.14);accent-glow:rgba(127,200,232,.25);
    ok:#63c39a;ok-soft:rgba(99,195,154,.12);ok-line:rgba(99,195,154,.5);
    warn:#e0b878;warn-soft:rgba(224,184,120,.12);warn-line:rgba(224,184,120,.24);
    bad:#e08a92;bad-soft:rgba(224,138,146,.13);bad-line:rgba(224,138,146,.28);
    na:#8a9aac;na-soft:rgba(138,154,172,.16);skip:#a99bd6;purple:#b79ae0;purple-soft:rgba(183,154,224,.16);
    mut-soft:rgba(147,166,186,.1);danger-line:#6b3a44;danger-bg:#2a1a22;scroll:#3a4a5f;scroll-h:#5b7390;cat-pink:#e8a7b8;
    overlay:rgba(5,8,13,.66);shadow-dock:0 20px 50px rgba(0,0,0,.5);shadow-menu:0 18px 40px rgba(0,0,0,.6);`,
  "cat-sakura": `
    bg:#faf1f5;panel:#fffdfe;panel2:#fdf7fa;panel3:#f9f0f5;
    inset:#fbf5f8;inset2:#f8eef4;soft:#f0e2ea;soft2:#e6d3df;hover:#f9eef4;hover2:#f6e6ef;sel:#f2e2ec;
    line:#e6d2de;line2:#efdfe8;line3:#d8bccd;line-hover:#cda9be;ink:#2b2a33;mute:#6d6270;faint:#7a6b78;
    accent:#b04a72;accent-bg:#f7dde8;accent-soft:rgba(176,74,114,.13);accent-glow:rgba(176,74,114,.25);
    ok:#2f6b4a;ok-soft:rgba(47,107,74,.12);ok-line:rgba(47,107,74,.45);
    warn:#8a5f16;warn-soft:rgba(138,95,22,.12);warn-line:rgba(138,95,22,.28);
    bad:#a83f4b;bad-soft:rgba(168,63,75,.12);bad-line:rgba(168,63,75,.3);
    na:#7a6b78;na-soft:rgba(122,107,120,.16);skip:#7a5fa0;purple:#8a63b0;purple-soft:rgba(138,99,176,.14);
    mut-soft:rgba(109,98,112,.1);danger-line:#e2a7a7;danger-bg:#fdeeee;scroll:#d8bccd;scroll-h:#bb93a9;cat-pink:#d97fa4;
    overlay:rgba(43,42,51,.42);shadow-dock:0 18px 44px rgba(43,42,51,.16);shadow-menu:0 16px 36px rgba(43,42,51,.2);`
};
function channels(hex) {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
}
function rgba(hex, alpha) {
  return `rgba(${channels(hex).join(",")},${alpha})`;
}
function mix(accent, panel) {
  const base = channels(panel);
  return "#" + channels(accent).map((channel, i) => Math.round(channel * 0.2 + base[i] * 0.8).toString(16).padStart(2, "0")).join("");
}
function relativeLuminance(hex) {
  const [r, g, b] = channels(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function readableOn(hex) {
  const lum = relativeLuminance(hex);
  const onWhite = 1.05 / (lum + 0.05);
  const onInk = (lum + 0.05) / (relativeLuminance("#101828") + 0.05);
  return onWhite >= onInk ? "#ffffff" : "#101828";
}
function getThemeTokens(value = DEFAULT_LOOK) {
  const look = normalizeLook(value);
  const tokens = {};
  for (const item of paletteSource[look.t].split(";")) {
    const [key, ...parts] = item.trim().split(":");
    if (key && parts.length) tokens[`--xsdsh-${key}`] = parts.join(":");
  }
  if (look.a !== getTheme(look.t).accent) {
    tokens["--xsdsh-accent"] = look.a;
    tokens["--xsdsh-accent-bg"] = mix(look.a, tokens["--xsdsh-panel"]);
    tokens["--xsdsh-accent-soft"] = rgba(look.a, 0.14);
    tokens["--xsdsh-accent-glow"] = rgba(look.a, 0.25);
  }
  tokens["--xsdsh-font-ui"] = '"Segoe UI","Microsoft YaHei UI","PingFang SC","Noto Sans SC",system-ui,sans-serif';
  tokens["--xsdsh-font-code"] = '"Cascadia Mono","Sarasa Mono SC",ui-monospace,monospace';
  tokens["--xsdsh-paper"] = tokens["--xsdsh-panel"];
  tokens["--xsdsh-fill"] = tokens["--xsdsh-accent-soft"];
  tokens["--xsdsh-text"] = tokens["--xsdsh-ink"];
  tokens["--xsdsh-accent-fg"] = readableOn(tokens["--xsdsh-accent"]);
  tokens["--xsdsh-sans"] = tokens["--xsdsh-font-ui"];
  tokens["--xsdsh-display"] = tokens["--xsdsh-font-ui"];
  tokens["--xsdsh-mono"] = tokens["--xsdsh-font-code"];
  tokens["--xsdsh-ease"] = "cubic-bezier(.16,1,.3,1)";
  return tokens;
}

// src/ui/features/appearance/theme.ts
var LOOK_STORAGE_KEY = "xsdsh.look";
function browserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}
function loadLook(storage = browserStorage()) {
  if (!storage) return { look: DEFAULT_LOOK, issue: "storage-read-failed" };
  let raw;
  try {
    raw = storage.getItem(LOOK_STORAGE_KEY);
  } catch {
    return { look: DEFAULT_LOOK, issue: "storage-read-failed" };
  }
  if (raw === null) return { look: DEFAULT_LOOK, issue: null };
  try {
    const migrated = migrateLook(JSON.parse(raw));
    const input = migrated && typeof migrated === "object" && !Array.isArray(migrated) ? migrated : null;
    const look = normalizeLook(input);
    const valid = input && input.t === look.t && typeof input.a === "string" && input.a.toLowerCase() === look.a;
    return { look, issue: valid ? null : "invalid-preference" };
  } catch {
    return { look: DEFAULT_LOOK, issue: "invalid-preference" };
  }
}
function saveLook(value, storage = browserStorage()) {
  const look = normalizeLook(migrateLook(value));
  try {
    if (!storage) throw new Error("No local storage");
    storage.setItem(LOOK_STORAGE_KEY, JSON.stringify(look));
    return { look, issue: null };
  } catch {
    return { look, issue: "storage-write-failed" };
  }
}
function assertPluginRoot(root) {
  if (root === root.ownerDocument.documentElement || root === root.ownerDocument.body || !root.matches("[data-xsdsh-ui], [data-xsdsh-overlay], .xsdsh-root")) {
    throw new Error("Appearance requires a marked plugin root or plugin overlay; host html/body are forbidden.");
  }
}
function bindRoot(root, initial) {
  assertPluginRoot(root);
  const names = [...Object.keys(getThemeTokens(initial)), "color-scheme"];
  const original = new Map(names.map((name) => [name, [root.style.getPropertyValue(name), root.style.getPropertyPriority(name)]]));
  const previousTheme = root.getAttribute("data-xsdsh-theme");
  const applied = /* @__PURE__ */ new Map();
  let currentTheme = initial.t;
  const update = (look) => {
    currentTheme = look.t;
    root.setAttribute("data-xsdsh-theme", look.t);
    for (const [name, value] of Object.entries({ ...getThemeTokens(look), "color-scheme": look.t === "cat-night" ? "dark" : "light" })) {
      root.style.setProperty(name, value);
      applied.set(name, root.style.getPropertyValue(name));
    }
  };
  update(initial);
  return {
    users: 1,
    update,
    cleanup() {
      for (const [name, [value, priority]] of original) {
        if (root.style.getPropertyValue(name) !== applied.get(name) || root.style.getPropertyPriority(name)) continue;
        if (value) root.style.setProperty(name, value, priority);
        else root.style.removeProperty(name);
      }
      if (root.getAttribute("data-xsdsh-theme") === currentTheme) {
        if (previousTheme === null) root.removeAttribute("data-xsdsh-theme");
        else root.setAttribute("data-xsdsh-theme", previousTheme);
      }
    }
  };
}
function createAppearanceController(options = {}) {
  const storage = options.storage === void 0 ? browserStorage() : options.storage;
  let snapshot = Object.freeze(loadLook(storage));
  let disposed = false;
  const roots = /* @__PURE__ */ new Map();
  const listeners = /* @__PURE__ */ new Set();
  const assertActive = () => {
    if (disposed) throw new Error("Appearance controller has been disposed");
  };
  const publish = (result) => {
    snapshot = Object.freeze(result);
    for (const binding of roots.values()) binding.update(snapshot.look);
    for (const listener of listeners) listener();
    return snapshot;
  };
  const commit = (look) => {
    assertActive();
    return publish(saveLook(look, storage));
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      assertActive();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    registerRoot(root) {
      assertActive();
      const existing = roots.get(root);
      if (existing) existing.users++;
      else roots.set(root, bindRoot(root, snapshot.look));
      let released = false;
      return () => {
        if (released) return;
        released = true;
        const binding = roots.get(root);
        if (binding && --binding.users === 0) {
          binding.cleanup();
          roots.delete(root);
        }
      };
    },
    setTheme(theme) {
      const valid = normalizeLook({ t: theme }).t;
      return commit({ t: valid, a: getTheme(valid).accent });
    },
    setAccent: (accent) => commit({ t: snapshot.look.t, a: accent }),
    reset: () => commit(DEFAULT_LOOK),
    reload() {
      assertActive();
      return publish(loadLook(storage));
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const binding of roots.values()) binding.cleanup();
      roots.clear();
      listeners.clear();
    }
  };
}

// src/ui/features/appearance/AppearancePage.tsx
var issueText = {
  "invalid-preference": "已保存的外观设置无效，已使用有效的默认值；重新选择后会保存。",
  "storage-read-failed": "无法读取本机外观设置，当前使用晴空；仍可切换本次外观。",
  "storage-write-failed": "外观已在本次打开中生效，但未能保存到本机。请检查浏览器存储权限后重试。"
};
function ThemePreview({ theme }) {
  const tokens = getThemeTokens({ t: theme, a: getTheme(theme).accent });
  return /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-mini", style: tokens, "aria-hidden": "true" }, /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-mini-head" }, /* @__PURE__ */ react_default.createElement("i", null), /* @__PURE__ */ react_default.createElement("i", null), /* @__PURE__ */ react_default.createElement("i", null), /* @__PURE__ */ react_default.createElement("em", null)), /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-mini-row" }, /* @__PURE__ */ react_default.createElement("b", null), /* @__PURE__ */ react_default.createElement("i", null)), /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-mini-row" }, /* @__PURE__ */ react_default.createElement("b", null), /* @__PURE__ */ react_default.createElement("i", null)), /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-mini-tag" }, "配色预览"));
}
function AppearancePage({ controller }) {
  const [snapshot, setSnapshot] = react_default.useState(controller.getSnapshot);
  const [notice, setNotice] = react_default.useState("");
  const root = react_default.useRef(null);
  react_default.useEffect(() => {
    const release = root.current ? controller.registerRoot(root.current) : () => {
    };
    const update = () => setSnapshot(controller.getSnapshot());
    const unsubscribe = controller.subscribe(update);
    update();
    return () => {
      unsubscribe();
      release();
    };
  }, [controller]);
  const look = snapshot.look;
  const change = (action, message2) => {
    action();
    setNotice(message2);
  };
  return /* @__PURE__ */ react_default.createElement(
    "section",
    {
      ref: root,
      "data-xsdsh-ui": "appearance",
      className: "xsdsh-appearance",
      style: getThemeTokens(look),
      "aria-label": "外观与配色"
    },
    /* @__PURE__ */ react_default.createElement("style", null, appearance_default),
    /* @__PURE__ */ react_default.createElement("header", { className: "xsdsh-appearance-head" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("h2", null, "外观与配色"), /* @__PURE__ */ react_default.createElement("p", null, "3 套风格 · 6 种强调色 · 选择后立即生效")), /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-current" }, getTheme(look.t).name, " / ", accentName(look.a)), /* @__PURE__ */ react_default.createElement("button", { type: "button", className: "xsdsh-appearance-button", onClick: () => change(() => controller.reset(), "已恢复晴空默认配色。") }, "恢复默认")),
    /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-appearance-description" }, "仅调整插件面板与弹层，不跟随宿主深浅色。设置保存在本机。"),
    /* @__PURE__ */ react_default.createElement("fieldset", { className: "xsdsh-appearance-fieldset" }, /* @__PURE__ */ react_default.createElement("legend", null, "风格"), /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-appearance-description" }, "晴空为默认风格；切换风格时会同时使用该风格的默认强调色。"), /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-appearance-grid" }, THEMES.map((theme) => /* @__PURE__ */ react_default.createElement(
      "button",
      {
        type: "button",
        key: theme.id,
        className: "xsdsh-appearance-card",
        "aria-pressed": look.t === theme.id,
        onClick: () => change(() => controller.setTheme(theme.id), `已应用${theme.name}。`)
      },
      /* @__PURE__ */ react_default.createElement(ThemePreview, { theme: theme.id }),
      /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-name" }, theme.name, theme.id === "cat-sky" && /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-badge" }, "默认"), look.t === theme.id && /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-selected" }, "已选")),
      /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-description" }, theme.description),
      /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-dots", "aria-hidden": "true" }, ["panel3", "panel", "accent", "cat-pink"].map((token) => /* @__PURE__ */ react_default.createElement("i", { key: token, style: { background: getThemeTokens({ t: theme.id, a: theme.accent })[`--xsdsh-${token}`] } })))
    )))),
    /* @__PURE__ */ react_default.createElement("fieldset", { className: "xsdsh-appearance-fieldset" }, /* @__PURE__ */ react_default.createElement("legend", null, "强调色"), /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-appearance-description" }, "调整主按钮边框、标签和页签下划线；状态颜色保留各自含义。"), /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-appearance-accents" }, ACCENTS.map((accent) => /* @__PURE__ */ react_default.createElement(
      "button",
      {
        type: "button",
        key: accent.color,
        className: "xsdsh-appearance-accent",
        "aria-pressed": look.a === accent.color,
        onClick: () => change(() => controller.setAccent(accent.color), `已应用${accent.name}强调色。`)
      },
      /* @__PURE__ */ react_default.createElement("i", { "aria-hidden": "true", style: { background: accent.color } }),
      accent.name,
      look.a === accent.color && /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-selected" }, "已选")
    ))), !ACCENTS.some((accent) => accent.color === look.a) && /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-appearance-description" }, "当前使用风格默认强调色：", accentName(look.a), "。选择上方颜色可覆盖。")),
    /* @__PURE__ */ react_default.createElement("section", { className: "xsdsh-appearance-preview", "aria-label": "实时配色预览" }, /* @__PURE__ */ react_default.createElement("h3", null, "实时预览"), /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-appearance-description" }, "用于查看控件配色，不代表插件运行状态。"), /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-appearance-demo" }, /* @__PURE__ */ react_default.createElement("button", { type: "button", className: "xsdsh-appearance-button xsdsh-appearance-primary", onClick: () => setNotice("这是主按钮配色预览。") }, "主按钮"), /* @__PURE__ */ react_default.createElement("button", { type: "button", className: "xsdsh-appearance-button", onClick: () => setNotice("这是次按钮配色预览。") }, "次按钮"), /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-tag", "data-tone": "ok" }, "成功色"), /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-tag", "data-tone": "warn" }, "提示色"), /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-tag", "data-tone": "bad" }, "错误色"), /* @__PURE__ */ react_default.createElement("label", { className: "xsdsh-appearance-input-label" }, "输入框", /* @__PURE__ */ react_default.createElement("input", { readOnly: true, placeholder: "输入框预览" })), /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-appearance-selection" }, "选中态"))),
    /* @__PURE__ */ react_default.createElement("p", { role: "status", "aria-live": "polite", className: "xsdsh-appearance-notice", "data-warning": snapshot.issue ? "true" : void 0 }, snapshot.issue ? issueText[snapshot.issue] : notice || "当前外观已应用。")
  );
}

// src/ui/features/clean/api.ts
function record(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("接口返回格式错误");
  return value;
}
function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}
function checked(value) {
  const data = record(value);
  if (data.ok !== true) throw new Error(String(data.error || "请求失败"));
  return data;
}
function postBody(body) {
  return { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}
function createCleanApi(runtime) {
  let statusFlight = null;
  const get = async (route) => checked(await runtime.apiJson("/Xsdsh-purge-next/" + route));
  const post = async (route, body) => checked(await runtime.apiJson("/Xsdsh-purge-next/" + route, postBody(body)));
  return {
    get,
    post,
    status() {
      if (!statusFlight) statusFlight = (runtime.statusApi ? runtime.statusApi() : runtime.apiJson("/Xsdsh-purge-next/status")).then((value) => checked(value)).finally(() => {
        statusFlight = null;
      });
      return statusFlight;
    },
    async catalogue() {
      const data = await get("patches");
      if (!Array.isArray(data.patches)) throw new Error("补丁目录缺少 patches 列表");
      return data.patches.map((value) => {
        const item = record(value);
        if (!Number.isSafeInteger(item.id) || Number(item.id) <= 0) throw new Error("补丁目录含非法 ID");
        return { id: Number(item.id), name: String(item.name || ""), desc: String(item.desc || ""), layer: String(item.layer || "未分层"), status: String(item.status || "unknown"), file: String(item.file || ""), applicable: item.applicable !== false, enabled: item.enabled !== false };
      });
    },
    // Read the HTTP error body as well: legacy apiJson throws away busy/409 metadata.
    async action(route, body) {
      const controller = new AbortController();
      const timeout = route === "apply" ? 6e5 : route === "uninstall" ? 9e4 : 12e4;
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await (runtime.fetch || fetch)("/Xsdsh-purge-next/" + route, { ...postBody(body), cache: "no-store", credentials: "same-origin", signal: controller.signal });
        const data = record(await response.json());
        if (!response.ok && data.busy !== true && !data.error) data.error = "HTTP " + response.status;
        if (!response.ok) data.ok = false;
        return data;
      } catch (error) {
        if (controller.signal.aborted) throw new Error("timeout");
        throw error;
      } finally {
        clearTimeout(timer);
      }
    }
  };
}

// src/ui/features/clean/revert-model.ts
function reportedCount(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}
function backupLabel(status) {
  if (!status || status.ok !== true || status.status_unknown) return "未知";
  const count = reportedCount(status.backup_count);
  if (count !== null) return `${count} 个备份文件`;
  return (status.has_backup === true ? "有备份" : status.has_backup === false ? "无备份" : "备份状态未知") + " · 数量未知";
}
function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function revertReport(data) {
  const details = object(data.details);
  const summary = object(data.summary) || object(details?.summary);
  const rows = [];
  const addPaths = (value, outcome, detail = "") => {
    if (Array.isArray(value)) for (const path of value) {
      if (typeof path === "string" && path) rows.push({ path, outcome, detail });
    }
  };
  addPaths(details?.reverted, "已还原");
  addPaths(details?.noBackup, "无备份，跳过");
  addPaths(details?.alreadyOriginal, "已是原版");
  addPaths(details?.preservedUser, "保留用户文件");
  if (Array.isArray(details?.errors)) for (const entry of details.errors) {
    if (Array.isArray(entry) && typeof entry[0] === "string") rows.push({ path: entry[0], outcome: "还原失败", detail: String(entry[1] ?? "未提供错误原因") });
  }
  const fast = object(details?.unpacked);
  if (fast) {
    addPaths(fast.deleted, "已删除解包副本", "归档元数据还原后的清理结果，不等同于文件备份还原");
    addPaths(fast.leftover, "解包副本残留", "未删除，请查看后端还原结果");
    addPaths(fast.deletedBaks, "已删除备份");
    addPaths(fast.leftoverBaks, "备份残留");
    addPaths(fast.noRecord, "无快通道记录");
  }
  const shim = object(data.shim);
  if (shim) for (const [directory, value] of Object.entries(shim)) {
    const files = object(value);
    if (!files) continue;
    for (const [file, outcome] of Object.entries(files)) {
      if (typeof outcome === "string") rows.push({ path: directory.replace(/[\\/]$/, "") + "/" + file, outcome: "shim · " + outcome, detail: "" });
    }
  }
  return {
    available: details !== null,
    counts: {
      reverted: reportedCount(summary?.reverted) ?? reportedCount(data.reverted),
      noBackup: reportedCount(summary?.noBackup) ?? reportedCount(data.no_backup),
      alreadyOriginal: reportedCount(summary?.alreadyOriginal) ?? reportedCount(data.already_original),
      errors: reportedCount(summary?.errors) ?? reportedCount(data.errors)
    },
    rows,
    unpacked: fast ? {
      restored: reportedCount(fast.restored),
      alreadyRestored: reportedCount(fast.alreadyRestored),
      asar: typeof fast.asar === "string" ? fast.asar : "",
      root: typeof fast.root === "string" ? fast.root : "",
      error: typeof fast.error === "string" ? fast.error : ""
    } : null
  };
}

// src/ui/features/clean/useCleanController.ts
var legacyManualRefs = /* @__PURE__ */ new WeakMap();
var operationFlights = /* @__PURE__ */ new WeakMap();
function flightFor(op) {
  let flight = operationFlights.get(op.actionTicketRef);
  if (!flight) {
    flight = { active: false };
    operationFlights.set(op.actionTicketRef, flight);
  }
  return flight;
}
function manualRefFor(op) {
  if (op.manualRestartRef) return op.manualRestartRef;
  let ref = legacyManualRefs.get(op.actionTicketRef);
  if (!ref) {
    ref = { current: null };
    legacyManualRefs.set(op.actionTicketRef, ref);
  }
  return ref;
}
function isManual(op) {
  const ref = manualRefFor(op);
  if (ref.current && ref.current.ticket !== op.actionTicketRef.current) ref.current = null;
  return ref.current !== null;
}
function useCleanOperation() {
  const [patchBusy, setPatchBusy] = React.useState(false);
  const [askRestart, setAskRestart] = React.useState(false);
  const snoozeUntilRef = React.useRef(0);
  const actionTicketRef = React.useRef(0);
  const manualRestartRef = React.useRef(null);
  return { patchBusy, setPatchBusy, askRestart, setAskRestart, snoozeUntilRef, actionTicketRef, manualRestartRef };
}
function actionNotice(route, data) {
  if (data.busy === true) return { kind: "busy", text: String(data.error || "已有操作正在运行，请等待状态刷新。") };
  if (data.ok !== true && data.needPrompt === true) return { kind: "error", text: String(data.error || "提示词和规则集都是空的") + "。先到「模式提示词」页保存一份，再回来应用。" };
  if (data.ok !== true) return { kind: "error", text: String(data.error || (data.needPrompt ? "提示词和规则集不能为空。" : "操作失败")) };
  if (data.complete === false) {
    const ids = Array.isArray(data.failed_items) ? data.failed_items.map((value) => value && typeof value === "object" && "id" in value ? String(value.id) : "").filter(Boolean) : [];
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
function useCleanController(runtime, suppliedOp) {
  const localOp = useCleanOperation();
  const op = suppliedOp || localOp;
  const latestOp = React.useRef(op);
  latestOp.current = op;
  const api2 = React.useMemo(() => createCleanApi(runtime), [runtime]);
  const [status, setStatus] = React.useState(null);
  const serverStatus = React.useRef(null);
  const serverManual = () => serverStatus.current?.restart_mode === "manual" || serverStatus.current?.scope === "subset";
  const [catalogue, setCatalogue] = React.useState([]);
  const [catalogueReady, setCatalogueReady] = React.useState(false);
  const [catalogueError, setCatalogueError] = React.useState("");
  const [notice, setNotice] = React.useState({ kind: "idle", text: "" });
  const [revertResult, setRevertResult] = React.useState(null);
  const [manualRestart, setManualRestart] = React.useState(() => isManual(op));
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
      const next = await api2.status();
      if (!mounted.current) return;
      serverStatus.current = next;
      setStatus(next);
      const current = latestOp.current;
      if (!inFlight.active && typeof next.apply_running === "boolean") current.setPatchBusy(next.apply_running);
      const persistedManual = next.restart_mode === "manual" || next.scope === "subset";
      if (persistedManual) manualRefFor(current).current = { ticket: current.actionTicketRef.current };
      else if (!inFlight.active && (next.scope === "full" || next.restart_required === false && !next.boot_full_quit)) manualRefFor(current).current = null;
      const manual = persistedManual || isManual(current);
      setManualRestart(manual);
      if (manual) current.setAskRestart(false);
      else if ((next.restart_required || next.boot_full_quit) && Date.now() > current.snoozeUntilRef.current && !inFlight.active) current.setAskRestart(true);
    } catch (error) {
      if (mounted.current) setStatus((previous) => ({ ...previous, ok: false, status_unknown: true, status_error: errorText(error) }));
    } finally {
      loading.current = false;
    }
  }, [api2, inFlight]);
  const refreshCatalogue = React.useCallback(async () => {
    try {
      const rows = await api2.catalogue();
      if (mounted.current) {
        setCatalogue(rows);
        setCatalogueReady(true);
        setCatalogueError("");
      }
    } catch (error) {
      if (mounted.current) setCatalogueError(errorText(error));
    }
  }, [api2]);
  React.useEffect(() => {
    mounted.current = true;
    void refresh();
    void refreshCatalogue();
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      void refresh();
    }, 5e3);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [refresh, refreshCatalogue]);
  const busy = op.patchBusy || status?.apply_running === true || status?.apply_phase === "extracting" || status?.apply_phase === "patching";
  React.useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => {
      void refresh();
    }, 800);
    return () => clearInterval(timer);
  }, [busy, refresh]);
  const since = status?.apply_in_flight?.stale !== true && status?.apply_in_flight?.since ? status.apply_in_flight.since : startedAt;
  React.useEffect(() => {
    if (!busy || !since) {
      setWaitSeconds(0);
      return;
    }
    const tick = () => setWaitSeconds(Math.max(0, Math.floor((Date.now() - since) / 1e3)));
    tick();
    const timer = setInterval(tick, 1e3);
    return () => clearInterval(timer);
  }, [busy, since]);
  const action = async (route, patchIds) => {
    if (inFlight.active || busy) return false;
    const subsetApply = Array.isArray(patchIds) && patchIds.length > 0;
    if (route === "apply" && !subsetApply && Array.isArray(patchIds)) return false;
    if (route === "apply" && subsetApply && !catalogueReady) return false;
    const messages = { apply: "", revert: "按备份还原所有已应用文件？", uninstall: "卸载 Xsdsh-purge-next，恢复备份、清理运行时并撤销注册？", "cleanup-residue": "清理 resources/app 旧路残留并还原 header？宿主可能退出。" };
    if (messages[route] && !runtime.confirm(messages[route])) return false;
    inFlight.active = true;
    setRevertResult(null);
    setManualPrompt(false);
    const ticket = ++op.actionTicketRef.current;
    op.setPatchBusy(true);
    op.setAskRestart(false);
    manualRefFor(op).current = subsetApply ? { ticket } : null;
    setManualRestart(subsetApply);
    setStartedAt(Date.now());
    setNotice({ kind: "busy", text: "正在处理，请等待后端结果。" });
    try {
      const result = await api2.action(route, route === "apply" && subsetApply ? { patchIds } : {});
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
        manualRefFor(op).current = null;
        setManualRestart(false);
        if (result.ok && (result.restarting || result.needs_full_quit || result.restart_required)) op.setAskRestart(true);
      } else if (result.ok && (result.restarting || result.needs_full_quit || result.restart_required)) op.setAskRestart(true);
      if (result.ok && route === "uninstall") runtime.afterUninstall?.(String(result.surface || status?.surface || "web"));
    } catch (error) {
      if (!mounted.current || ticket !== op.actionTicketRef.current) return false;
      const text2 = errorText(error);
      setNotice(text2 === "timeout" || /fetch|network|连不上接口|load failed/i.test(text2) ? { kind: "busy", text: "请求连接已中断或超时，结果尚未确认；将继续读取状态。" } : { kind: "error", text: text2 });
      return false;
    } finally {
      inFlight.active = false;
      op.setPatchBusy(false);
      if (mounted.current) {
        void refresh();
      }
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
    op.snoozeUntilRef.current = Date.now() + 3e5;
    try {
      if (!runtime.restart(setNotice, op.setPatchBusy, runtime.t, status?.surface || "web")) setNotice({ kind: "error", text: "重启未发起，请查看宿主状态后重试。" });
    } catch (error) {
      setNotice({ kind: "error", text: errorText(error) });
    }
  };
  return { api: api2, op, status, catalogue, catalogueReady, catalogueError, notice, revertResult, busy, manualRestart, manualPrompt, dismissManualPrompt: () => setManualPrompt(false), waitSeconds, refresh, refreshCatalogue, action, restart };
}

// src/ui/components/PurgeSelect.tsx
function PurgeSelect(props) {
  const [open, setOpen] = react_default.useState(false);
  const [highlight, setHighlight] = react_default.useState(() => Math.max(0, props.options.findIndex((o) => o.value === props.value)));
  const [placement, setPlacement] = react_default.useState(null);
  const root = react_default.useRef(null);
  const trigger = react_default.useRef(null);
  const listbox = react_default.useRef(null);
  const id = react_default.useId();
  const listId = `${id}-list`;
  const enabledOptions = props.options.filter((o) => !o.disabled);
  const selected = props.options.find((o) => o.value === props.value);
  const label = selected ? selected.label : props.placeholder ?? "选择…";
  const place = () => {
    const node = trigger.current;
    if (!node || typeof window === "undefined") return null;
    const box = node.getBoundingClientRect();
    const gap = 4;
    const margin = 8;
    const below = window.innerHeight - box.bottom - gap - margin;
    const above = box.top - gap - margin;
    const maxHeight = Math.max(96, Math.min(320, Math.max(below, above)));
    const width = Math.min(Math.max(box.width, props.menuMinWidth ?? 0), Math.max(160, window.innerWidth - margin * 2));
    const up = below < 140 && above > below;
    return {
      left: Math.max(margin, Math.min(box.left, window.innerWidth - width - margin)),
      top: up ? Math.max(margin, box.top - Math.min(maxHeight, above) - gap) : box.bottom + gap,
      width,
      maxHeight
    };
  };
  react_default.useEffect(() => {
    if (!open || typeof window === "undefined" || typeof window.addEventListener !== "function") return;
    const inside = (target) => {
      const rootNode = root.current;
      if (!rootNode || !target) return false;
      if (typeof Node !== "undefined" && target instanceof Node) return rootNode.contains(target);
      return false;
    };
    const onPointerDown = (event) => {
      if (!inside(event.target)) setOpen(false);
    };
    const onScroll = (event) => {
      if (!inside(event.target)) setOpen(false);
    };
    const onResize = () => setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  react_default.useEffect(() => {
    if (!open) return;
    const node = listbox.current?.querySelector(`[data-value-index="${highlight}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [open, highlight]);
  const openList = () => {
    if (props.disabled) return;
    setHighlight(Math.max(0, props.options.findIndex((o) => o.value === props.value)));
    setPlacement(place());
    setOpen(true);
  };
  const pick = (option) => {
    if (option.disabled) return;
    props.onChange(option.value);
    setOpen(false);
    trigger.current?.focus();
  };
  const onKeyDown = (event) => {
    if (props.disabled) return;
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = enabledOptions[highlight];
      if (option) pick(option);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!enabledOptions.length) return;
      const dir = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
      let next = highlight;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = enabledOptions.length - 1;
      else next = (highlight + dir + enabledOptions.length) % enabledOptions.length;
      setHighlight(next);
    }
  };
  const className = "purge-select" + (props.size === "sm" ? " is-sm" : "") + (props.className ? " " + props.className : "") + (open ? " is-open" : "");
  return /* @__PURE__ */ h("div", { ref: root, className }, /* @__PURE__ */ h(
    "button",
    {
      ref: trigger,
      type: "button",
      role: "combobox",
      "aria-expanded": open,
      "aria-controls": listId,
      "aria-haspopup": "listbox",
      "aria-label": props["aria-label"],
      disabled: props.disabled,
      className: "purge-select-trigger",
      onClick: () => open ? setOpen(false) : openList(),
      onKeyDown
    },
    /* @__PURE__ */ h("span", { className: "purge-select-label" }, label),
    /* @__PURE__ */ h("span", { className: "purge-select-caret", "aria-hidden": "true" }, "▾")
  ), open && /* @__PURE__ */ h(
    "ul",
    {
      ref: listbox,
      id: listId,
      role: "listbox",
      "aria-label": props["aria-label"],
      className: "purge-select-list",
      style: placement ? { position: "fixed", left: placement.left, top: placement.top, width: placement.width, maxHeight: placement.maxHeight } : void 0
    },
    enabledOptions.map((option, index) => /* @__PURE__ */ h(
      "li",
      {
        key: option.value,
        role: "option",
        "aria-selected": option.value === props.value,
        "data-value-index": index,
        className: "purge-select-option" + (option.value === props.value ? " is-on" : "") + (index === highlight ? " is-hl" : ""),
        onMouseEnter: () => setHighlight(index),
        onClick: () => pick(option)
      },
      option.label
    )),
    !enabledOptions.length && /* @__PURE__ */ h("li", { className: "purge-select-empty" }, "没有可选项")
  ));
}

// src/ui/features/clean/patch-model.ts
var buckets = ["applied", "pending", "skipped", "na", "missing", "unmatched", "unknown"];
var bucketLabels = { applied: "已应用", pending: "待应用", skipped: "跳过", na: "本端不需要", missing: "文件缺失", unmatched: "未匹配", unknown: "未知" };
function bucket(status) {
  if (status === "applied" || status === "already") return "applied";
  if (status === "off" || status === "skipped") return "skipped";
  if (status === "missing" || status === "missing_file") return "missing";
  if (status === "pending" || status === "na" || status === "unmatched") return status;
  return "unknown";
}
function patchRows(catalogue, status) {
  return catalogue.map((row) => ({ ...row, status: status?.patch_status?.[String(row.id)] || row.status || "unknown" }));
}
function tally(rows) {
  const counts = { applied: 0, pending: 0, skipped: 0, na: 0, missing: 0, unmatched: 0, unknown: 0 };
  for (const row of rows) counts[bucket(row.status)]++;
  return { ...counts, total: rows.length };
}
function filterRows(rows, search, state) {
  const query = search.trim().toLocaleLowerCase();
  return rows.filter((row) => (state === "all" || bucket(row.status) === state) && (!query || [row.id, row.name, row.desc, row.file, row.layer].join(" ").toLocaleLowerCase().includes(query)));
}
function selectedIds(rows, selection) {
  return rows.filter((row) => selection.has(row.id)).map((row) => row.id);
}
function hookState(status) {
  if (!status || status.status_unknown) return "unknown";
  if (status.hooks_deny_state === "dirty" || status.hooks_deny_state === "applied_unrestarted") return status.hooks_deny_state;
  if (status.restart_required === true) return "applied_unrestarted";
  return status.hooks_deny_state === "synced" ? "synced" : "unknown";
}
var hookStateLabels = { dirty: "已保存，待应用", applied_unrestarted: "已应用，待重启", synced: "与宿主同步", unknown: "状态未知" };
var HOOK_DESCRIPTION = "开启会关掉 DSH 的 Hook 拦截规则 · 改完需重启";

// src/ui/features/clean/primitives.tsx
function NoticeView({ notice }) {
  if (!notice.text || notice.kind === "idle") return null;
  return /* @__PURE__ */ React.createElement("p", { className: "clean9-notice is-" + notice.kind, role: notice.kind === "error" ? "alert" : "status" }, notice.text);
}
function noticeNode(notice) {
  return /* @__PURE__ */ React.createElement(NoticeView, { notice });
}
function formatSize(bytes) {
  return bytes < 1024 ? bytes + " B" : (bytes / 1024).toFixed(1) + " KB";
}
function Overlay({ title, children, onClose, busy = false, size = "wide" }) {
  const box = React.useRef(null);
  const close = React.useRef(null);
  const titleId = React.useId();
  const onCloseRef = React.useRef(onClose);
  const busyRef = React.useRef(busy);
  onCloseRef.current = onClose;
  busyRef.current = busy;
  React.useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    close.current?.focus();
    const key = (event) => {
      if (typeof document.querySelector === "function" && document.querySelector("[data-clean9-confirm]")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (!busyRef.current) onCloseRef.current();
      }
      if (event.key !== "Tab") return;
      const elements = Array.from(box.current?.querySelectorAll("button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex='0']") || []).filter((element) => element.getClientRects().length > 0);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) {
        event.preventDefault();
        box.current?.focus();
        return;
      }
      if (event.shiftKey && (document.activeElement === first || !box.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !box.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("keydown", key, true);
      const takeover = typeof document.querySelector === "function" && document.querySelector("[role=alertdialog]");
      if (takeover || !previous?.isConnected) return;
      previous.focus({ preventScroll: true });
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
  return /* @__PURE__ */ React.createElement("div", { className: "clean9-overlay", onClick: (event) => {
    if (event.target === event.currentTarget && !busy) onClose();
  } }, /* @__PURE__ */ React.createElement("div", { className: "clean9-dialog" + sizeClass, role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, ref: box, tabIndex: -1 }, /* @__PURE__ */ React.createElement("header", null, /* @__PURE__ */ React.createElement("h2", { id: titleId }, title), /* @__PURE__ */ React.createElement("button", { type: "button", ref: close, disabled: busy, onClick: onClose }, "收起")), /* @__PURE__ */ React.createElement("div", { className: "clean9-dialog-body" }, children)));
}
function ConfirmDialog({ title, message: message2, confirmLabel, cancelLabel = "取消", danger = false, busy = false, onConfirm, onCancel }) {
  const box = React.useRef(null);
  const cancel = React.useRef(null);
  const titleId = React.useId();
  const bodyId = React.useId();
  const cancelRef = React.useRef(onCancel);
  const busyRef = React.useRef(busy);
  cancelRef.current = onCancel;
  busyRef.current = busy;
  React.useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancel.current?.focus();
    const key = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (!busyRef.current) cancelRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = Array.from(box.current?.querySelectorAll("button:not(:disabled)") || []).filter((element) => element.getClientRects().length > 0);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) {
        event.preventDefault();
        box.current?.focus();
        return;
      }
      if (event.shiftKey && (document.activeElement === first || !box.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !box.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("keydown", key, true);
      if (!previous?.isConnected) return;
      previous.focus({ preventScroll: true });
    };
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "clean9-confirm-shade", onClick: (event) => {
    if (event.target === event.currentTarget && !busy) onCancel();
  } }, /* @__PURE__ */ React.createElement("div", { className: "clean9-confirm-dialog", role: "alertdialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": bodyId, "data-clean9-confirm": "true", ref: box, tabIndex: -1 }, /* @__PURE__ */ React.createElement("h2", { id: titleId }, title), /* @__PURE__ */ React.createElement("p", { id: bodyId }, message2), /* @__PURE__ */ React.createElement("div", { className: "clean9-restart-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", ref: cancel, disabled: busy, onClick: onCancel }, cancelLabel), /* @__PURE__ */ React.createElement("button", { type: "button", className: "is-primary" + (danger ? " is-danger" : ""), disabled: busy, onClick: onConfirm }, confirmLabel))));
}

// src/ui/features/clean/RevertDetails.tsx
function RevertDetails({ result }) {
  if (!result) return null;
  const report = revertReport(result);
  const count = (value) => value === null ? "未提供" : String(value);
  return /* @__PURE__ */ React.createElement("section", { className: "clean9-revert-results", "aria-label": "本次还原结果" }, /* @__PURE__ */ React.createElement("h3", null, "本次还原结果"), /* @__PURE__ */ React.createElement("p", null, "已还原 ", count(report.counts.reverted), " · 无备份 ", count(report.counts.noBackup), " · 已是原版 ", count(report.counts.alreadyOriginal), " · 错误 ", count(report.counts.errors)), typeof result.message === "string" && /* @__PURE__ */ React.createElement("p", null, result.message), typeof result.note === "string" && /* @__PURE__ */ React.createElement("p", null, result.note), !report.available && /* @__PURE__ */ React.createElement("p", null, "当前服务未提供补丁逐文件明细，不能从汇总数量推断文件结果。"), report.unpacked && /* @__PURE__ */ React.createElement("div", { className: "clean9-revert-fast" }, /* @__PURE__ */ React.createElement("p", null, "快通道元数据：撤销 ", count(report.unpacked.restored), " 项，已是原始状态 ", count(report.unpacked.alreadyRestored), " 项。后端未提供这两项计数对应的逐项路径。"), report.unpacked.asar && /* @__PURE__ */ React.createElement("p", null, "归档：", report.unpacked.asar), report.unpacked.root && /* @__PURE__ */ React.createElement("p", null, "解包目录：", report.unpacked.root), report.unpacked.error && /* @__PURE__ */ React.createElement("p", { role: "alert" }, report.unpacked.error)), report.rows.length > 0 ? /* @__PURE__ */ React.createElement("div", { className: "clean9-revert-table" }, /* @__PURE__ */ React.createElement("table", null, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { scope: "col" }, "文件 / 路径"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "结果"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "说明"))), /* @__PURE__ */ React.createElement("tbody", null, report.rows.map((row, index) => /* @__PURE__ */ React.createElement("tr", { key: index }, /* @__PURE__ */ React.createElement("td", null, row.path), /* @__PURE__ */ React.createElement("td", null, row.outcome), /* @__PURE__ */ React.createElement("td", null, row.detail || "—")))))) : /* @__PURE__ */ React.createElement("p", null, report.available ? "本次返回的文件明细为空。" : "没有可展示的逐文件结果。"));
}

// src/ui/features/clean/PatchPanel.tsx
var FILTER_OPTIONS = [{ value: "all", label: "全部状态" }, ...buckets.map((key) => ({ value: key, label: bucketLabels[key] }))];
var LAYER_LABELS = { "0.1.5 兼容": "DSH 0.1.5 兼容组", "0.2.0 兼容": "DSH 0.2.0 兼容组" };
var layerLabel = (layer) => LAYER_LABELS[layer] ?? layer;
var LAYER_NOTE = "按 DSH 该代结构/接入点分组的补丁，用于追版；新版本仍可能命中。";
function PatchCounts({ rows, known }) {
  const counts = tally(rows);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "clean9-counts" }, buckets.map((key) => /* @__PURE__ */ React.createElement("span", { key, className: "is-" + key }, /* @__PURE__ */ React.createElement("b", null, known ? counts[key] : "—"), /* @__PURE__ */ React.createElement("span", null, bucketLabels[key])))), /* @__PURE__ */ React.createElement("div", { className: "clean9-progress", "aria-hidden": "true" }, known && counts.total > 0 && buckets.map((key) => /* @__PURE__ */ React.createElement("span", { key, className: "is-" + key, style: { width: counts[key] / counts.total * 100 + "%" } }))));
}
function PatchHealth({ status }) {
  const known = status?.ok === true && !status.status_unknown;
  return /* @__PURE__ */ React.createElement("div", { className: "clean9-health" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "shim"), " ", known ? ["cmd", "ps1", "bin"].map((key) => `${key}: ${String(status?.["shim_" + key] || "未知")}`).join(" · ") : "未知"), /* @__PURE__ */ React.createElement("span", { title: "仅统计普通宿主补丁文件的可读非空备份；不含 shim、归档和快通道记录。快通道数量未知。" }, /* @__PURE__ */ React.createElement("b", null, "备份"), " ", backupLabel(status)), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "落点"), " ", known ? status?.ai_base || (status?.apply_running ? "正在定位" : "未定位") : "未知"));
}
function PatchPanel({ controller }) {
  const c = controller;
  const rows = patchRows(c.catalogue, c.status);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [selection, setSelection] = React.useState(/* @__PURE__ */ new Set());
  const [expanded, setExpanded] = React.useState(false);
  const visible = filterRows(rows, search, filter);
  const ids = selectedIds(rows, selection);
  const layers = Array.from(new Set(rows.map((row) => row.layer)));
  const pending = rows.filter((row) => row.status === "pending").map((row) => row.id);
  const counts = tally(rows);
  const known = c.catalogueReady && c.status !== null;
  const applicable = (row) => {
    const state = bucket(row.status);
    return state === "pending" || state === "unmatched";
  };
  const remaining = rows.filter((row) => ["pending", "unmatched", "missing", "unknown"].includes(bucket(row.status))).length;
  const toggle = (id) => setSelection((previous) => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  return /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement(PatchCounts, { rows, known }), /* @__PURE__ */ React.createElement(PatchHealth, { status: c.status }), c.status?.status_unknown && /* @__PURE__ */ React.createElement("p", { role: "alert" }, "状态未知，当前显示最后已知状态。", c.status.status_error), c.catalogueError && /* @__PURE__ */ React.createElement("p", { role: "alert" }, "补丁目录读取失败：", c.catalogueError), /* @__PURE__ */ React.createElement("details", { className: "clean9-diagnostics" }, /* @__PURE__ */ React.createElement("summary", null, "运行诊断"), /* @__PURE__ */ React.createElement("p", null, "备份：", backupLabel(c.status), "。仅计普通宿主补丁文件的可读非空备份，按文件去重；不含 shim、归档及快通道记录，不能等同于全部可恢复项目数。"), /* @__PURE__ */ React.createElement("p", null, "宿主：", String(c.status?.surface || "未知"), " · 插件：", String(c.status?.plugin_version || "未知")), /* @__PURE__ */ React.createElement("p", null, "提示词注入：", String(c.status?.override_status || "未知")), /* @__PURE__ */ React.createElement("p", null, "上次回退原因：", c.status?.status_unknown ? "未知" : String(c.status?.fastpath_last_error || "未报告")), /* @__PURE__ */ React.createElement("p", null, "应用阶段：", String(c.status?.apply_phase || "未报告")), /* @__PURE__ */ React.createElement("p", null, "旧路残留：", c.status?.status_unknown || !c.status ? "未知" : c.status.legacy_residue === true ? "存在" : c.status.legacy_residue === false ? "未发现" : "未报告")), /* @__PURE__ */ React.createElement("div", { className: "clean9-toolbar" }, /* @__PURE__ */ React.createElement("input", { type: "search", "aria-label": "搜索补丁", placeholder: "搜索 ID / 名称 / 文件 / 说明", value: search, onChange: (event) => setSearch(event.target.value) }), /* @__PURE__ */ React.createElement(PurgeSelect, { "aria-label": "筛选补丁状态", value: filter, onChange: (value) => setFilter(value), options: FILTER_OPTIONS }), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: !visible.length, onClick: () => setSelection((previous) => /* @__PURE__ */ new Set([...previous, ...visible.map((row) => row.id)])) }, "全选可见"), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: !ids.length, onClick: () => setSelection(/* @__PURE__ */ new Set()) }, "清空选择"), ids.length > 0 && /* @__PURE__ */ React.createElement("button", { type: "button", disabled: c.busy || !c.catalogueReady, onClick: () => {
    const targets = ids;
    void Promise.resolve(c.action("apply", targets)).then((ok) => {
      if (ok) setSelection(/* @__PURE__ */ new Set());
    });
  } }, "应用选中 ", ids.length)), /* @__PURE__ */ React.createElement("div", { className: "clean9-filters" }, /* @__PURE__ */ React.createElement("button", { type: "button", "aria-pressed": filter === "all", onClick: () => setFilter("all") }, "全部 ", counts.total), buckets.map((key) => /* @__PURE__ */ React.createElement("button", { key, type: "button", "aria-pressed": filter === key, onClick: () => setFilter(key) }, bucketLabels[key], " ", counts[key])), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setExpanded((value) => !value) }, expanded ? "全部收起" : "全部展开")), /* @__PURE__ */ React.createElement("p", { className: "clean9-muted" }, "「应用全部」是完整清洗：解包/换 asar、装 shim、修 CLI、写入提示词覆盖，完成后会提示重启；「应用选中」只写本次所选补丁，需要你完全退出 DSH 后重新打开才生效。重启完成前不代表宿主行为已改变。"), layers.map((layer) => {
    const full = rows.filter((row) => row.layer === layer);
    const shown = visible.filter((row) => row.layer === layer);
    const totals = tally(full);
    if (!shown.length) return null;
    return /* @__PURE__ */ React.createElement("details", { className: "clean9-layer", key: layer + String(expanded), open: expanded }, /* @__PURE__ */ React.createElement("summary", null, /* @__PURE__ */ React.createElement("strong", null, layerLabel(layer)), /* @__PURE__ */ React.createElement("span", null, totals.total, " 条 · ", buckets.map((key) => `${totals[key]} ${bucketLabels[key]}`).join(" / "))), LAYER_LABELS[layer] && /* @__PURE__ */ React.createElement("p", { className: "clean9-layer-note" }, LAYER_NOTE), shown.map((row) => /* @__PURE__ */ React.createElement("div", { className: "clean9-patch-row", key: row.id }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", "aria-label": `选择补丁 #${row.id}`, checked: selection.has(row.id), onChange: () => toggle(row.id) }), /* @__PURE__ */ React.createElement("details", null, /* @__PURE__ */ React.createElement("summary", null, /* @__PURE__ */ React.createElement("span", null, "#", row.id, " ", row.name), /* @__PURE__ */ React.createElement("span", { className: "clean9-status is-" + bucket(row.status) }, bucketLabels[bucket(row.status)])), /* @__PURE__ */ React.createElement("p", null, row.desc || "后端未提供说明"), row.file && /* @__PURE__ */ React.createElement("p", null, row.file), /* @__PURE__ */ React.createElement("p", null, "原始状态：", row.status, " · ", row.applicable === false ? "本端不适用" : "本端适用", " · ", row.enabled === false ? "设置已关闭" : "设置已启用")), applicable(row) && /* @__PURE__ */ React.createElement("button", { type: "button", disabled: c.busy || !c.catalogueReady, onClick: () => {
      void c.action("apply", [row.id]);
    }, "aria-label": `应用补丁 #${row.id}` }, "应用"))));
  }), !visible.length && /* @__PURE__ */ React.createElement("p", null, c.catalogueReady ? "没有匹配的补丁。" : "正在读取补丁目录…"), /* @__PURE__ */ React.createElement("footer", { className: "clean9-actions" }, /* @__PURE__ */ React.createElement("span", null, "显示 ", visible.length, " / ", rows.length, " 条"), pending.length > 0 && /* @__PURE__ */ React.createElement("button", { type: "button", disabled: c.busy || c.status?.status_unknown === true, onClick: () => {
    void c.action("apply", pending);
  } }, "应用 ", pending.length, " 项待应用"), remaining > 0 ? /* @__PURE__ */ React.createElement("button", { type: "button", title: "全量清洗：解包/换 asar、装 shim、修 CLI、写入提示词覆盖，完成后提示重启", disabled: c.busy || !rows.length, onClick: () => {
    void c.action("apply");
  } }, "应用全部 ", rows.length, " 项") : /* @__PURE__ */ React.createElement("span", { className: "clean9-muted" }, rows.length ? "全部已应用" : ""), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: c.busy, onClick: () => {
    void c.action("revert");
  } }, "还原"), c.status?.legacy_residue === true && !c.status.status_unknown && /* @__PURE__ */ React.createElement("button", { type: "button", disabled: c.busy, onClick: () => {
    void c.action("cleanup-residue");
  } }, "清理旧路残留"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    void c.refresh();
    void c.refreshCatalogue();
  } }, "重新检测状态")), c.busy && /* @__PURE__ */ React.createElement("p", { role: "status" }, "正在处理，已等待 ", c.waitSeconds, " 秒", c.status?.status_unknown ? " · 后端状态未知" : ""), /* @__PURE__ */ React.createElement(NoticeView, { notice: c.notice }), /* @__PURE__ */ React.createElement(RevertDetails, { result: c.revertResult }));
}

// src/ui/features/clean/HooksSection.tsx
function HooksSection({ api: api2, status, locked, onSaved }) {
  const [enabled, setEnabled] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [savedDirty, setSavedDirty] = React.useState(false);
  const [notice, setNotice] = React.useState({ kind: "idle", text: "" });
  const flight = React.useRef(false);
  const state = hookState(status);
  React.useEffect(() => {
    let alive = true;
    api2.get("hooks-deny").then((data) => {
      if (alive) setEnabled(data.hooksDenyBypass !== false);
    }).catch((error) => {
      if (alive) setNotice({ kind: "error", text: errorText(error) });
    });
    return () => {
      alive = false;
    };
  }, [api2]);
  React.useEffect(() => {
    if (state === "dirty" || state === "applied_unrestarted") setSavedDirty(false);
  }, [state]);
  const effectiveState = savedDirty ? "dirty" : state;
  const save = async (next) => {
    if (effectiveState !== "synced" || flight.current || locked || enabled === null) return;
    flight.current = true;
    setBusy(true);
    try {
      const data = await api2.post("hooks-deny", { hooksDenyBypass: next });
      setEnabled(data.hooksDenyBypass === true);
      setSavedDirty(true);
      setNotice({ kind: "ok", text: "选择已保存，待应用并重启后才能改变宿主行为。" });
      onSaved();
    } catch (error) {
      setNotice({ kind: "error", text: errorText(error) });
    } finally {
      flight.current = false;
      setBusy(false);
    }
  };
  return /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("p", null, HOOK_DESCRIPTION), /* @__PURE__ */ React.createElement("label", { className: "clean9-toggle" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: enabled === true, disabled: enabled === null || busy || locked || effectiveState !== "synced", onChange: (event) => {
    void save(event.target.checked);
  } }), "开启 Hook拦截选项"), /* @__PURE__ */ React.createElement("p", { role: "status" }, hookStateLabels[effectiveState]), effectiveState !== "synced" && /* @__PURE__ */ React.createElement("p", null, "待应用时请先应用补丁；待重启时请重启宿主。状态未知时请重新检测。"), /* @__PURE__ */ React.createElement(NoticeView, { notice }));
}

// src/ui/features/clean/TextEditor.tsx
function TextEditor({ kind, api: api2, runtime, locked, onSaved }) {
  const [content, setContent] = React.useState("");
  const [defaultContent, setDefaultContent] = React.useState("");
  const [loaded, setLoaded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const saving = React.useRef(false);
  const [notice, setNotice] = React.useState({ kind: "idle", text: "" });
  const prompt = kind === "override";
  React.useEffect(() => {
    let alive = true;
    api2.get(kind).then((data) => {
      if (!alive) return;
      const fallback = typeof data.defaultContent === "string" ? data.defaultContent : "";
      setDefaultContent(fallback);
      setContent(typeof data.content === "string" ? data.content : fallback);
      setLoaded(true);
    }).catch((error) => {
      if (alive) setNotice({ kind: "error", text: errorText(error) });
    });
    return () => {
      alive = false;
    };
  }, [api2, kind]);
  const save = async (text2) => {
    if (!loaded || saving.current || locked) return;
    if (prompt && !text2.trim() && !defaultContent.trim()) {
      setNotice({ kind: "error", text: runtime.t("need.prompt") });
      return;
    }
    saving.current = true;
    setBusy(true);
    setNotice({ kind: "busy", text: "正在保存…" });
    try {
      const data = await api2.post(kind, { content: text2 });
      if (data.needPrompt || data.injectSource === "none") throw new Error(runtime.t("need.prompt"));
      setContent(typeof data.content === "string" ? data.content : text2);
      setNotice({ kind: "ok", text: prompt ? "提示词已保存，实际注入状态请以宿主结果为准。" : Number(data.dropped) > 0 ? `已保存，${data.dropped} 条无效地址已过滤。` : "服务器列表已保存。" });
      onSaved();
    } catch (error) {
      setNotice({ kind: "error", text: errorText(error) });
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };
  return /* @__PURE__ */ React.createElement("section", { className: "clean9-editor" }, /* @__PURE__ */ React.createElement("p", null, runtime.t(prompt ? "override.hint" : "own.hint")), /* @__PURE__ */ React.createElement("textarea", { "aria-label": prompt ? "提示词内容" : "自己的服务器", value: content, disabled: !loaded || busy || locked, spellCheck: false, rows: prompt ? 16 : 8, onChange: (event) => setContent(event.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "clean9-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", disabled: !loaded || busy || locked, onClick: () => {
    void save(content);
  } }, "保存"), prompt && /* @__PURE__ */ React.createElement("button", { type: "button", disabled: !loaded || busy || locked || !defaultContent, onClick: () => {
    if (runtime.confirm("恢复并保存随包默认提示词？当前编辑内容将被替换。")) void save(defaultContent);
  } }, "恢复默认"), /* @__PURE__ */ React.createElement("span", null, content.trim().length, " 字")), /* @__PURE__ */ React.createElement(NoticeView, { notice }));
}

// src/ui/shared/host-suffix.js
var HOST_FILE_SUFFIX = /* @__PURE__ */ new Set([
  "js",
  "jsx",
  "ts",
  "tsx",
  "mjs",
  "cjs",
  "json",
  "md",
  "yml",
  "yaml",
  "css",
  "html",
  "map",
  "log",
  "txt",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "webp",
  "pdf",
  "woff",
  "woff2",
  "lock",
  "vue",
  "py",
  "go",
  "rs",
  "java",
  "xml",
  "toml",
  "ini",
  "bak",
  "patch",
  "diff",
  "sh",
  "ps1",
  "cmd",
  "bat",
  "exe",
  "dll",
  "tar",
  "gz"
]);
function isFileLikeHost(host) {
  const text2 = String(host || "");
  const dot = text2.lastIndexOf(".");
  if (dot < 0 || dot === text2.length - 1) return false;
  return HOST_FILE_SUFFIX.has(text2.slice(dot + 1).toLowerCase());
}

// src/ui/components/TrashIcon.tsx
function TrashIcon({ size = 15 }) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      "aria-hidden": "true",
      focusable: "false",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    /* @__PURE__ */ React.createElement("path", { d: "M4 7h16" }),
    /* @__PURE__ */ React.createElement("path", { d: "M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" }),
    /* @__PURE__ */ React.createElement("path", { d: "M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" }),
    /* @__PURE__ */ React.createElement("path", { d: "M10 11v5M14 11v5" })
  );
}

// src/ui/features/clean/OwnServersEditor.tsx
var entrySequence = 0;
function newEntry(kind, text2 = "") {
  return { key: `own-${++entrySequence}`, kind, text: text2 };
}
function parseOwnServers(content) {
  const entries = [];
  for (const raw of String(content || "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    entries.push(line.startsWith("#") ? newEntry("comment", line.replace(/^#\s?/, "")) : newEntry("host", line));
  }
  if (!entries.some((entry) => entry.kind === "host")) entries.push(newEntry("host"));
  return entries;
}
function serializeOwnServers(entries) {
  const lines = entries.map((entry) => entry.kind === "comment" ? entry.text.trim() ? `# ${entry.text.trim()}` : "" : entry.text.trim()).filter(Boolean);
  return lines.length ? `${lines.join("\n")}
` : "";
}
var USER_RE = /^[A-Za-z0-9._-]{1,32}$/;
var DOMAIN_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
var IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
var IPV6_RE = /^[0-9A-Fa-f:]+$/;
var SECRET_RE = /BEGIN|PRIVATE KEY|ssh-rsa|ssh-ed25519|ssh-dss/i;
function classifyHost(text2) {
  const value = String(text2 || "").trim();
  if (!value) return { ok: false, error: "不能为空" };
  if (value.length > 253) return { ok: false, error: "超过 253 个字符" };
  if (/\s/.test(value)) return { ok: false, error: "不能含空格" };
  if (/[\\/*]/.test(value)) return { ok: false, error: "不支持网段、通配符或路径" };
  if (SECRET_RE.test(value)) return { ok: false, error: "不要填密钥内容" };
  const at = value.indexOf("@");
  const user = at >= 0 ? value.slice(0, at) : "";
  const host = at >= 0 ? value.slice(at + 1) : value;
  if (at >= 0 && !USER_RE.test(user)) return { ok: false, error: "账号只允许字母、数字、点、下划线和短横线" };
  if (!host) return { ok: false, error: "@ 后面缺少主机名" };
  if (host.includes(":")) {
    return IPV6_RE.test(host) ? { ok: true, label: at >= 0 ? "账号@IPv6" : "IPv6" } : { ok: false, error: "只接受单个 IPv6 地址" };
  }
  const ipv4 = IPV4_RE.exec(host);
  if (ipv4) {
    const parts = ipv4.slice(1).map(Number);
    return parts.every((part) => part <= 255) ? { ok: true, label: at >= 0 ? "账号@IPv4" : "IPv4" } : { ok: false, error: "IPv4 每段须在 0–255" };
  }
  if (isFileLikeHost(host)) return { ok: false, error: "看起来是文件名，不是主机名" };
  if (!DOMAIN_RE.test(host)) return { ok: false, error: "不是完整域名或 IP" };
  return { ok: true, label: at >= 0 ? "账号@域名" : "域名" };
}
function OwnServersEditor({ api: api2, runtime, locked, onSaved }) {
  const [entries, setEntries] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const saving = React.useRef(false);
  const [notice, setNotice] = React.useState({ kind: "idle", text: "" });
  React.useEffect(() => {
    let alive = true;
    api2.get("own-servers").then((data) => {
      if (!alive) return;
      setEntries(parseOwnServers(typeof data.content === "string" ? data.content : ""));
      setLoaded(true);
    }).catch((error) => {
      if (alive) setNotice({ kind: "error", text: errorText(error) });
    });
    return () => {
      alive = false;
    };
  }, [api2]);
  const hosts = entries.filter((entry) => entry.kind === "host");
  const comments = entries.filter((entry) => entry.kind === "comment");
  const checks = new Map(hosts.map((entry) => [entry.key, entry.text.trim() ? classifyHost(entry.text) : null]));
  const invalid = hosts.filter((entry) => checks.get(entry.key) && !checks.get(entry.key).ok);
  const filled = hosts.filter((entry) => entry.text.trim()).length;
  const update = (key, text2) => setEntries((list) => list.map((entry) => entry.key === key ? { ...entry, text: text2 } : entry));
  const remove = (key) => setEntries((list) => {
    const next = list.filter((entry) => entry.key !== key);
    return next.some((entry) => entry.kind === "host") ? next : [...next, newEntry("host")];
  });
  const addHost = () => setEntries((list) => [...list, newEntry("host")]);
  const addComment = () => {
    setCommentsOpen(true);
    setEntries((list) => [...list, newEntry("comment")]);
  };
  const save = async () => {
    if (!loaded || saving.current || locked) return;
    if (invalid.length) {
      setNotice({ kind: "error", text: `有 ${invalid.length} 行地址不合法，先修正再保存。` });
      return;
    }
    saving.current = true;
    setBusy(true);
    setNotice({ kind: "busy", text: "正在保存…" });
    try {
      const content = serializeOwnServers(entries);
      const data = await api2.post("own-servers", { content });
      const saved = typeof data.content === "string" ? data.content : content;
      setEntries(parseOwnServers(saved));
      const dropped = Number(data.dropped) || 0;
      const kept = saved.split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith("#")).length;
      setNotice({ kind: "ok", text: dropped > 0 ? `已保存 ${kept} 台主机，后端过滤了 ${dropped} 条无效地址。` : `已保存 ${kept} 台主机。` });
      onSaved();
    } catch (error) {
      setNotice({ kind: "error", text: errorText(error) });
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };
  const disabled = !loaded || busy || locked;
  return /* @__PURE__ */ React.createElement("section", { className: "clean9-editor clean9-own" }, /* @__PURE__ */ React.createElement("p", { className: "clean9-own-hint clean9-own-lead" }, runtime.t("own.hint")), /* @__PURE__ */ React.createElement("div", { className: "clean9-own-scroll" }, /* @__PURE__ */ React.createElement("table", { className: "clean9-own-table" }, /* @__PURE__ */ React.createElement("colgroup", null, /* @__PURE__ */ React.createElement("col", { style: { width: "min(340px, 62%)" } }), /* @__PURE__ */ React.createElement("col", { style: { width: 34 } }), /* @__PURE__ */ React.createElement("col", null)), /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { scope: "col" }, "主机 / IP"), /* @__PURE__ */ React.createElement("th", { scope: "col" }, /* @__PURE__ */ React.createElement("span", { className: "clean9-sr" }, "删除")), /* @__PURE__ */ React.createElement("th", { scope: "col" }, "识别"))), /* @__PURE__ */ React.createElement("tbody", null, hosts.map((entry) => {
    const check = checks.get(entry.key);
    return /* @__PURE__ */ React.createElement("tr", { key: entry.key, className: check && !check.ok ? "is-bad" : void 0 }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
      "input",
      {
        "aria-label": "主机地址",
        value: entry.text,
        disabled,
        placeholder: "example.com 或 ops@10.0.0.5",
        spellCheck: false,
        autoCapitalize: "none",
        onChange: (event) => update(entry.key, event.target.value)
      }
    )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("button", { type: "button", className: "clean9-icon-btn", "aria-label": "删除这一行", title: "删除", disabled, onClick: () => remove(entry.key) }, /* @__PURE__ */ React.createElement(TrashIcon, { size: 15 }))), /* @__PURE__ */ React.createElement("td", null, !check ? /* @__PURE__ */ React.createElement("span", { className: "clean9-own-kind" }, "待填写") : check.ok ? /* @__PURE__ */ React.createElement("span", { className: "clean9-own-kind" }, check.label) : /* @__PURE__ */ React.createElement("span", { className: "clean9-own-kind is-bad" }, check.error)));
  })))), /* @__PURE__ */ React.createElement("div", { className: "clean9-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: addHost, disabled }, "+ 添加主机"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "is-primary", disabled: disabled || invalid.length > 0, onClick: () => {
    void save();
  } }, "保存"), /* @__PURE__ */ React.createElement("span", { className: "clean9-own-count" }, filled, " 台主机 · ", comments.length, " 条注释")), /* @__PURE__ */ React.createElement("details", { className: "clean9-own-comments", open: commentsOpen, onToggle: (event) => setCommentsOpen(event.target.open) }, /* @__PURE__ */ React.createElement("summary", null, "注释 ", comments.length, " 条"), /* @__PURE__ */ React.createElement("p", { className: "clean9-own-hint" }, "注释行以 # 开头，只给人看，不影响放行；保存时按原顺序写回。"), comments.map((entry) => /* @__PURE__ */ React.createElement("div", { key: entry.key, className: "clean9-own-comment" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      "aria-label": "注释内容",
      value: entry.text,
      disabled,
      spellCheck: false,
      onChange: (event) => update(entry.key, event.target.value)
    }
  ), /* @__PURE__ */ React.createElement("button", { type: "button", className: "clean9-icon-btn", "aria-label": "删除这条注释", title: "删除", disabled, onClick: () => remove(entry.key) }, /* @__PURE__ */ React.createElement(TrashIcon, { size: 15 })))), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: addComment, disabled }, "+ 添加注释")), /* @__PURE__ */ React.createElement(NoticeView, { notice }));
}

// src/ui/features/clean/editor-api.ts
var TARGETS = ["AGENTS.md", "CLAUDE.md"];
function skillsRouteMissing(error) {
  return /\b404\b|\b405\b|non-json/i.test(errorText(error));
}
function skillUiAllowed(value) {
  const data = record(value);
  const version = String(data.plugin_version || data.localVersion || "").replace(/^v/i, "");
  if (/^1\.1\.11(?:-|$)/.test(version)) return false;
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return false;
  return Number(match[1]) > 1 || Number(match[1]) === 1 && (Number(match[2]) > 1 || Number(match[2]) === 1 && Number(match[3]) >= 12);
}
function createEditorApi(runtime) {
  return {
    rulesApi: async (op, extra = {}) => checked(await runtime.apiJson("/Xsdsh-purge-next/rules", postBody({ op, ...extra }))),
    skillsApi: async (op, extra = {}) => {
      const init = postBody({ op, ...extra });
      try {
        return checked(await runtime.apiJson("/Xsdsh-purge-next/skills", init));
      } catch (error) {
        if (!skillsRouteMissing(error)) throw error;
        return checked(await runtime.apiJson("/Xsdsh-purge-next/skill", init));
      }
    },
    warnNeedPrompt: (data, t) => {
      if (data.needPrompt || data.injectSource === "none") throw new Error(t("need.prompt"));
      return false;
    }
  };
}

// src/ui/features/clean/RulesSection.js
var { useState, useRef, useEffect, useCallback, useMemo } = React;
function ruleLabel(r) {
  if (!r) return "";
  if (r.name !== r.id) return r.name + " (" + r.id + ")";
  return r.id;
}
function RulesSection({ runtime, api: api2, span = 2 }) {
  const { rulesApi, warnNeedPrompt } = useMemo(() => createEditorApi(runtime), [runtime]);
  const clientCurrentCwd = runtime.currentCwd;
  const t = runtime.t;
  const tRef = useRef(t);
  tRef.current = t;
  const [st, setSt] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("AGENTS.md");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("AGENTS.md");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ kind: "idle", text: "" });
  const [confirm, setConfirm] = useState(null);
  const policyBusy = useRef(false);
  const loadStatus = useCallback(() => {
    const tr = tRef.current;
    let cwd = "";
    try {
      cwd = clientCurrentCwd?.() || "";
    } catch (error) {
      setNotice({ kind: "error", text: String(error.message || error) });
      return;
    }
    rulesApi("status", cwd ? { cwd } : void 0).then((d) => {
      if (d && d.ok) setSt(d);
      else {
        setSt((previous) => ({ ...previous, ok: false, error: "规则状态读取失败" }));
        setNotice({ kind: "error", text: tr("err.rules", { error: d && d.error || "bad response" }) });
      }
    }).catch((e) => {
      setSt((previous) => ({ ...previous, ok: false, error: "规则状态读取失败" }));
      setNotice({ kind: "error", text: tr("err.rules", { error: e.message }) });
    });
  }, [rulesApi, clientCurrentCwd]);
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);
  const doPost = useCallback((action, payload, after) => {
    setBusy(true);
    setNotice({ kind: "idle", text: "" });
    rulesApi(action, payload).then((d) => {
      if (d && d.ok) {
        setNotice({ kind: "ok", text: t("ok.done") });
        if (action === "save" || action === "activate") warnNeedPrompt(d, t);
        loadStatus();
        if (after) after();
      } else {
        warnNeedPrompt(d, t);
        setNotice({ kind: "error", text: t("err.action", { action, error: d && d.error || "" }) });
      }
    }).catch((e) => setNotice({ kind: "error", text: t("err.action", { action, error: e.message }) })).finally(() => setBusy(false));
  }, [loadStatus, t, rulesApi, warnNeedPrompt]);
  const openRule = useCallback((id) => {
    setBusy(true);
    rulesApi("read", { id }).then((d) => {
      if (d.ok) {
        setEditId(id);
        setEditName(d.name || id);
        setEditTarget(d.target || "AGENTS.md");
        setContent(typeof d.content === "string" ? d.content : "");
      } else setNotice({ kind: "error", text: t("err.read", { error: d.error || "" }) });
    }).catch((e) => setNotice({ kind: "error", text: t("err.read", { error: e.message }) })).finally(() => setBusy(false));
  }, [t, rulesApi]);
  const clearEditor = () => {
    setEditId(null);
    setEditName("");
    setEditTarget("AGENTS.md");
    setContent("");
  };
  const removeRule = useCallback((id) => {
    setBusy(true);
    setNotice({ kind: "idle", text: "" });
    rulesApi("delete", { id }).then((d) => {
      if (d && d.ok) {
        setNotice({ kind: "ok", text: t("ok.done") });
        setSt((previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            rules: (previous.rules || []).filter((item) => item.id !== id),
            active: previous.active === id ? null : previous.active
          };
        });
      } else {
        setNotice({ kind: "error", text: t("err.action", { action: "delete", error: d && d.error || "" }) });
      }
    }).catch((e) => setNotice({ kind: "error", text: t("err.action", { action: "delete", error: e.message }) })).finally(() => setBusy(false));
  }, [rulesApi, t]);
  const createRule = () => {
    const id = newId.trim();
    if (!id) {
      setNotice({ kind: "error", text: t("need.id") });
      return;
    }
    const name = newName.trim() || id;
    const target = newTarget;
    doPost("save", { id, content: "", name, target }, () => {
      setEditId(id);
      setEditName(name);
      setEditTarget(target);
      setContent("");
    });
    setNewId("");
    setNewName("");
    setNewTarget("AGENTS.md");
    setCreating(false);
  };
  const policyValue = st && typeof st.workspace_policy === "string" ? st.workspace_policy : "fallback";
  const policyOptions = st && Array.isArray(st.workspace_policies) && st.workspace_policies.length ? st.workspace_policies : ["fallback", "strict", "always"];
  const cwdCandidates = st && Array.isArray(st.cwd_candidates) ? st.cwd_candidates : [];
  const cwdValue = st && typeof st.cwd === "string" ? st.cwd : "";
  const cwdPicked = cwdCandidates.filter((item) => item.selected).length;
  const ruleCount = st && Array.isArray(st.rules) ? st.rules.length : 0;
  const targetOptions = TARGETS.map((x) => ({ value: x, label: x }));
  const setPolicy = useCallback((policy) => {
    const previous = policyValue;
    if (policy === previous || policyBusy.current) return;
    policyBusy.current = true;
    setSt((state) => state ? { ...state, workspace_policy: policy } : state);
    rulesApi("set-policy", { policy }).then((d) => {
      if (d && d.ok) {
        setSt((state) => {
          if (!state) return state;
          return {
            ...state,
            workspace_policy: typeof d.policy === "string" ? d.policy : policy,
            workspace_policies: Array.isArray(d.policies) ? d.policies : state.workspace_policies
          };
        });
        setNotice({ kind: "ok", text: t("ok.done") });
      } else {
        setSt((state) => state ? { ...state, workspace_policy: previous } : state);
        setNotice({ kind: "error", text: t("err.action", { action: "set-policy", error: d && d.error || "" }) });
      }
    }).catch((e) => {
      setSt((state) => state ? { ...state, workspace_policy: previous } : state);
      setNotice({ kind: "error", text: t("err.action", { action: "set-policy", error: e.message }) });
    }).finally(() => {
      policyBusy.current = false;
    });
  }, [policyValue, rulesApi, t]);
  const ruleRows = !st ? h("tr", null, h("td", { colSpan: 5, className: "clean9-rules-empty" }, "读取规则中…")) : (st.rules || []).length === 0 ? h("tr", null, h("td", { colSpan: 5, className: "clean9-rules-empty" }, t("rules.empty"))) : st.rules.map((r) => {
    const isActive = r.id === st.active;
    const isEdit = r.id === editId;
    return h(
      "tr",
      { key: r.id, className: "clean9-rules-row" + (isEdit ? " is-edit" : "") + (isActive ? " is-active" : "") },
      h("td", null, h("button", {
        type: "button",
        role: "button",
        className: "clean9-rules-name",
        onClick: () => openRule(r.id)
      }, ruleLabel(r))),
      h("td", { className: "clean9-rules-target" }, r.target),
      h("td", { className: "clean9-rules-size" }, formatSize(r.size)),
      h("td", null, isActive ? h("span", { className: "xsdsh-pill is-ok" }, t("pill.current")) : h("span", { className: "clean9-rules-muted" }, "—")),
      h(
        "td",
        { className: "clean9-rules-ops" },
        h(
          "span",
          { className: "clean9-ops-inline" },
          h(Btn, {
            tiny: true,
            kind: isActive ? void 0 : "primary",
            disabled: busy || isActive,
            onClick: () => {
              if (!isActive) doPost("activate", { id: r.id });
            }
          }, isActive ? t("btn.inUse") : t("btn.use")),
          h(Btn, {
            tiny: true,
            kind: "danger",
            disabled: busy,
            onClick: () => setConfirm({ kind: "delete", id: r.id })
          }, t("delete"))
        )
      )
    );
  });
  return h(
    "section",
    { className: "clean9-rules", "aria-label": t("rules.title") },
    h(
      "div",
      { className: "clean9-rules-head" },
      h("p", null, t("clean.desc.rules")),
      h("span", { className: "clean9-rules-count" }, String(ruleCount)),
      h(Btn, {
        tiny: true,
        kind: "danger",
        disabled: busy,
        onClick: () => setConfirm({ kind: "reset" })
      }, t("rules.reset"))
    ),
    h(
      "div",
      { className: "clean9-rules-policy" },
      h("span", { className: "clean9-rules-label" }, t("policy.title")),
      h(
        "div",
        { className: "clean9-seg", role: "group", "aria-label": t("policy.title") },
        policyOptions.map((p) => h("button", {
          key: p,
          type: "button",
          "aria-pressed": policyValue === p,
          disabled: !st,
          onClick: () => setPolicy(p)
        }, t("policy." + p)))
      ),
      h("span", { className: "clean9-rules-hint" }, t("policy.hint"))
    ),
    h(
      "details",
      { className: "clean9-rules-cwd" },
      h("summary", null, t("cwd.title") + " · " + (cwdPicked ? cwdPicked + " 项已启用" : "未启用")),
      h(
        "div",
        { className: "clean9-rules-cwd-head" },
        cwdValue ? h("code", { className: "clean9-rules-cwd-path" }, cwdValue) : null,
        h(Btn, {
          tiny: true,
          disabled: busy,
          onClick: () => {
            let cwd = cwdValue;
            if (!cwd) {
              try {
                cwd = clientCurrentCwd?.() || "";
              } catch (error) {
                setNotice({ kind: "error", text: String(error.message || error) });
                return;
              }
            }
            doPost("scan-cwd", cwd ? { cwd } : {});
          }
        }, t("cwd.rescan"))
      ),
      !st || !cwdValue ? h("p", { className: "clean9-rules-empty" }, t("cwd.no.workspace")) : cwdCandidates.length === 0 ? h("p", { className: "clean9-rules-empty" }, t("cwd.empty")) : h("div", { className: "xsdsh-cwd-list" }, cwdCandidates.map((item) => h(
        "label",
        {
          key: item.path,
          className: "xsdsh-cwd-item" + (item.selected ? " is-on" : "")
        },
        h("input", {
          type: "checkbox",
          checked: Boolean(item.selected),
          disabled: busy,
          onChange: (e) => doPost("toggle-cwd", { path: item.path, enabled: e.target.checked })
        }),
        h(
          "div",
          { className: "xsdsh-cwd-main" },
          h(
            "div",
            { className: "xsdsh-cwd-name" },
            h("span", null, item.name),
            h("span", { className: "xsdsh-cwd-badge" }, t("cwd.scope." + (item.scope || "cwd"))),
            h("span", { className: "xsdsh-cwd-size" }, formatSize(item.size || 0))
          ),
          h("div", { className: "xsdsh-cwd-sub" }, item.path),
          item.preview ? h("div", { className: "xsdsh-cwd-prev" }, item.preview) : null
        )
      ))),
      h("p", { className: "clean9-rules-hint" }, t("cwd.hint"))
    ),
    h(
      "div",
      { className: "xsdsh-split clean9-rules-body" },
      h(
        "div",
        { className: "clean9-rules-list" },
        h(
          "div",
          { className: "clean9-rules-list-head" },
          h("h4", null, t("rules.listTitle")),
          h(Btn, { tiny: true, disabled: busy, onClick: () => setCreating((value) => !value) }, "+ " + t("btn.create"))
        ),
        creating ? h(
          "div",
          { className: "clean9-rules-create" },
          h(
            "div",
            { className: "clean9-rules-create-head" },
            h("strong", null, "新建规矩"),
            h("span", null, "填写 ID、名称和目标文件。")
          ),
          h(
            "div",
            { className: "clean9-rules-create-fields" },
            h(
              "label",
              { className: "clean9-field" },
              h("span", null, "ID"),
              h("input", { className: "xsdsh-field", "aria-label": t("ph.id"), placeholder: t("ph.id"), value: newId, disabled: busy, onChange: (e) => setNewId(e.target.value) })
            ),
            h(
              "label",
              { className: "clean9-field" },
              h("span", null, "名称"),
              h("input", { className: "xsdsh-field", "aria-label": t("ph.alias"), placeholder: t("ph.alias"), value: newName, disabled: busy, onChange: (e) => setNewName(e.target.value) })
            ),
            h(
              "label",
              { className: "clean9-field" },
              h("span", null, "目标文件"),
              h(PurgeSelect, { "aria-label": "新规矩目标", value: newTarget, onChange: setNewTarget, options: targetOptions, disabled: busy })
            )
          ),
          h(
            "div",
            { className: "clean9-rules-create-actions" },
            h(Btn, { kind: "primary", tiny: true, disabled: busy, onClick: createRule }, t("btn.create")),
            h(Btn, { tiny: true, disabled: busy, onClick: () => setCreating(false) }, "取消")
          )
        ) : null,
        h(
          "div",
          { className: "clean9-rules-scroll" },
          h(
            "table",
            { className: "clean9-rules-table" },
            h("thead", null, h(
              "tr",
              null,
              h("th", { scope: "col" }, "名称"),
              h("th", { scope: "col" }, "目标"),
              h("th", { scope: "col" }, "大小"),
              h("th", { scope: "col" }, "状态"),
              h("th", { scope: "col" }, "操作")
            )),
            h("tbody", null, ruleRows)
          )
        )
      ),
      h(
        "div",
        { className: "clean9-rules-editor" },
        editId ? [
          h(
            "div",
            { key: "meta", className: "clean9-rules-editor-meta" },
            h("input", {
              className: "xsdsh-field",
              "aria-label": "规矩名称",
              placeholder: t("ph.alias.short"),
              value: editName,
              onChange: (e) => setEditName(e.target.value)
            }),
            h(PurgeSelect, { "aria-label": "规矩目标", size: "sm", value: editTarget, onChange: setEditTarget, options: targetOptions })
          ),
          h("textarea", {
            key: "body",
            className: "clean9-rules-area",
            value: content,
            onChange: (e) => setContent(e.target.value),
            placeholder: "",
            "aria-label": t("rules.listTitle")
          }),
          h(
            "div",
            { key: "save", className: "clean9-rules-save" },
            h(Btn, {
              kind: "primary",
              disabled: busy,
              onClick: () => doPost("save", { id: editId, content, name: editName, target: editTarget })
            }, t("btn.saveRule"))
          )
        ] : h("div", { className: "clean9-rules-empty" }, t("rules.pick"))
      )
    ),
    h("div", { className: "clean9-rules-foot" }, noticeNode(notice)),
    confirm ? h(ConfirmDialog, {
      title: confirm.kind === "reset" ? t("rules.reset") : t("delete"),
      message: confirm.kind === "reset" ? t("rules.reset.confirm") : t("confirm.delete", { id: confirm.id }),
      confirmLabel: confirm.kind === "reset" ? t("rules.reset") : t("delete"),
      cancelLabel: "取消",
      danger: true,
      busy,
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        const pending = confirm;
        setConfirm(null);
        if (pending.kind === "reset") {
          clearEditor();
          doPost("reset", {});
          return;
        }
        if (editId === pending.id) clearEditor();
        removeRule(pending.id);
      }
    }) : null
  );
}

// src/ui/features/clean/SkillsSection.js
var { useState: useState2, useRef: useRef2, useEffect: useEffect2, useCallback: useCallback2, useMemo: useMemo2 } = React;
function SkillsSection({ runtime, api: api2, span = 2 }) {
  const { skillsApi } = useMemo2(() => createEditorApi(runtime), [runtime]);
  const statusApi = api2.status;
  const t = runtime.t;
  const tRef = useRef2(t);
  tRef.current = t;
  const [onBeta, setOnBeta] = useState2(false);
  const [st, setSt] = useState2(null);
  const [query, setQuery] = useState2("");
  const [editId, setEditId] = useState2(null);
  const [editDesc, setEditDesc] = useState2("");
  const [content, setContent] = useState2("");
  const [busy, setBusy] = useState2(false);
  const [notice, setNotice] = useState2({ kind: "idle", text: "" });
  const [confirm, setConfirm] = useState2(null);
  const zipRef = useRef2(null);
  const folderRef = useRef2(null);
  const loadStatus = useCallback2(() => {
    const tr = tRef.current;
    const fail = (e) => {
      setSt((previous) => ({ ...previous, ok: false, error: String(e?.message || e || "技能状态读取失败") }));
      setNotice({
        kind: "error",
        text: skillsRouteMissing(e) ? tr("err.skills.needRestart") : tr("err.skills", { error: e && e.message || e || "bad response" })
      });
    };
    const apply = (d) => {
      if (d && d.ok) setSt({ ok: true, skills: d.skills || [] });
      else fail({ message: d && d.error || "bad response" });
    };
    statusApi().then((d) => {
      const allowed = skillUiAllowed(d);
      setOnBeta(allowed);
      if (!allowed) {
        setSt(null);
        return;
      }
      if (d.skills) {
        apply({ ok: true, skills: d.skills });
        return;
      }
      skillsApi("status").then(apply).catch(fail);
    }).catch((error) => {
      setOnBeta(false);
      fail(error);
    });
  }, [skillsApi, statusApi]);
  useEffect2(() => {
    loadStatus();
  }, [loadStatus]);
  const doPost = useCallback2((action, payload, after) => {
    setBusy(true);
    setNotice({ kind: "idle", text: "" });
    skillsApi(action, payload).then((d) => {
      if (d && d.ok) {
        setNotice({ kind: "ok", text: t("ok.done") });
        loadStatus();
        if (after) after(d);
      } else {
        setNotice({ kind: "error", text: t("err.action", { action: "技能操作", error: d && d.error || "" }) });
      }
    }).catch((e) => setNotice({
      kind: "error",
      text: skillsRouteMissing(e) ? t("err.skills.needRestart") : t("err.action", { action: "技能操作", error: e.message })
    })).finally(() => setBusy(false));
  }, [loadStatus, t, skillsApi]);
  const openSkill = useCallback2((id) => {
    setBusy(true);
    skillsApi("read", { id }).then((d) => {
      if (d.ok) {
        setEditId(id);
        setEditDesc(d.description || "");
        setContent(typeof d.content === "string" ? d.content : "");
      } else setNotice({ kind: "error", text: t("err.read", { error: d.error || "" }) });
    }).catch((e) => setNotice({ kind: "error", text: t("err.read", { error: e.message }) })).finally(() => setBusy(false));
  }, [t, skillsApi]);
  const clearEditor = () => {
    setEditId(null);
    setEditDesc("");
    setContent("");
  };
  const readAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text2 = String(reader.result || "");
      const at = text2.indexOf(",");
      resolve(at >= 0 ? text2.slice(at + 1) : text2);
    };
    reader.onerror = () => reject(new Error(t("need.import")));
    reader.readAsDataURL(file);
  });
  const importZip = (file) => {
    if (!file) {
      setNotice({ kind: "error", text: t("need.import") });
      return;
    }
    setBusy(true);
    setNotice({ kind: "ok", text: t("skills.importing") });
    readAsBase64(file).then((data) => skillsApi("import", { data, name: file.name })).then((d) => {
      if (!d || !d.ok) throw new Error(d && d.error || "");
      setNotice({ kind: "ok", text: t("saved.import", { count: (d.imported || []).length || 1 }) });
      loadStatus();
    }).catch((e) => setNotice({
      kind: "error",
      text: skillsRouteMissing(e) ? t("err.skills.needRestart") : t("err.action", { action: "技能操作", error: e.message })
    })).finally(() => setBusy(false));
  };
  const keepFolderFile = (file) => {
    const rel = String(file.webkitRelativePath || file.name || "").replace(/\\/g, "/");
    if (!rel || rel.includes("..")) return false;
    if (/(^|\/)(node_modules|\.git|__MACOSX|\.system)(\/|$)/i.test(rel)) return false;
    if (/(^|\/)\._/.test(rel) || /\/\.DS_Store$/i.test(rel)) return false;
    return true;
  };
  const importFolder = (list) => {
    const files = Array.from(list || []).filter(keepFolderFile);
    if (!files.length) {
      setNotice({ kind: "error", text: t("err.import.folder") });
      return;
    }
    setBusy(true);
    setNotice({ kind: "ok", text: t("skills.importing") });
    Promise.all(files.map((file) => readAsBase64(file).then((content2) => ({
      path: file.webkitRelativePath || file.name,
      content: content2,
      encoding: "base64"
    })))).then((payload) => skillsApi("import", {
      files: payload,
      name: String(payload[0] && payload[0].path || "").split("/")[0]
    })).then((d) => {
      if (!d || !d.ok) throw new Error(d && d.error || "");
      setNotice({ kind: "ok", text: t("saved.import", { count: (d.imported || []).length || 1 }) });
      loadStatus();
    }).catch((e) => setNotice({
      kind: "error",
      text: skillsRouteMissing(e) ? t("err.skills.needRestart") : t("err.action", { action: "技能操作", error: e.message })
    })).finally(() => setBusy(false));
  };
  if (!onBeta) return h("div", { className: "clean9-skills clean9-skills-gate", role: "status" }, notice.text || "技能接口暂不可用，请检查宿主状态后重试。");
  const all = st && Array.isArray(st.skills) ? st.skills : [];
  const needle = query.trim().toLowerCase();
  const shown = needle ? all.filter((item) => (item.id + " " + (item.description || "")).toLowerCase().includes(needle)) : all;
  const skillCount = all.length;
  const callChips = (item) => {
    if (!item.valid) return h("span", { className: "clean9-call is-off" }, t("skills.invalid"));
    return [
      h("span", {
        key: "user",
        className: "clean9-call" + (item.userInvocable ? " is-on" : ""),
        title: item.userInvocable ? t("skills.call.slash", { cmd: "/" + item.id }) : t("skills.call.userOff")
      }, "人工"),
      h("span", {
        key: "model",
        className: "clean9-call" + (item.modelInvocable ? " is-on" : ""),
        title: item.modelInvocable ? t("skills.call.model") : t("skills.call.modelOff")
      }, "模型")
    ];
  };
  const rows = !st ? h("tr", null, h("td", { colSpan: 5, className: "clean9-rules-empty" }, "读取技能中…")) : shown.length === 0 ? h("tr", null, h("td", { colSpan: 5, className: "clean9-rules-empty" }, needle ? "没有匹配的技能" : t("skills.empty"))) : shown.map((item) => {
    const isEdit = item.id === editId;
    const openRow = (event) => {
      const target = event && event.target;
      if (target && typeof target.closest === "function" && target.closest("button,input,textarea,select,a,label")) return;
      openSkill(item.id);
    };
    return h(
      "tr",
      {
        key: item.id,
        className: "clean9-rules-row is-clickable" + (isEdit ? " is-edit" : ""),
        onClick: openRow,
        title: "点击编辑 " + item.id
      },
      h("td", null, h("button", {
        type: "button",
        role: "button",
        className: "clean9-rules-name",
        onClick: () => openSkill(item.id)
      }, item.id)),
      h("td", { className: "clean9-skills-desc", title: item.valid ? item.description : t("skills.invalid") }, item.valid ? item.description : t("skills.invalid")),
      h("td", { className: "clean9-skills-call" }, h("span", { className: "clean9-call-chips" }, callChips(item))),
      h("td", { className: "clean9-rules-size" }, formatSize(item.size)),
      h(
        "td",
        { className: "clean9-rules-ops" },
        h(
          "span",
          { className: "clean9-ops-inline" },
          h("button", {
            type: "button",
            className: "clean9-icon-btn",
            disabled: busy,
            "aria-label": t("delete") + " " + item.id,
            title: t("delete") + " " + item.id,
            onClick: (event) => {
              if (event && event.stopPropagation) event.stopPropagation();
              setConfirm({ id: item.id });
            }
          }, h(TrashIcon))
        )
      )
    );
  });
  return h(
    "section",
    { className: "clean9-skills", "aria-label": t("skills.title") },
    h(
      "div",
      { className: "clean9-rules-head" },
      h("p", null, t("skills.hint")),
      h("span", { className: "clean9-rules-count" }, String(skillCount))
    ),
    h(
      "div",
      { className: "clean9-skills-toolbar" },
      h("input", {
        className: "xsdsh-field",
        "aria-label": "搜索技能",
        placeholder: "搜索技能名称或描述",
        value: query,
        disabled: busy,
        onChange: (e) => setQuery(e.target.value)
      }),
      h("input", {
        ref: zipRef,
        type: "file",
        accept: ".zip,.tgz,.tar.gz,.tar,.skill",
        style: { display: "none" },
        onChange: (e) => {
          const file = e.target.files && e.target.files[0];
          e.target.value = "";
          importZip(file);
        }
      }),
      h("input", {
        ref: (el) => {
          folderRef.current = el;
          if (!el) return;
          el.setAttribute("webkitdirectory", "");
          el.setAttribute("directory", "");
          el.multiple = true;
        },
        type: "file",
        multiple: true,
        style: { display: "none" },
        onChange: (e) => {
          const files = Array.from(e.target && e.target.files || []);
          e.target.value = "";
          importFolder(files);
        }
      }),
      h(Btn, { kind: "primary", tiny: true, disabled: busy, onClick: () => zipRef.current && zipRef.current.click() }, t("btn.importZip")),
      h(Btn, { tiny: true, disabled: busy, onClick: () => folderRef.current && folderRef.current.click() }, t("btn.importFolder"))
    ),
    h(
      "div",
      { className: "xsdsh-split clean9-rules-body" },
      h(
        "div",
        { className: "clean9-rules-list" },
        h(
          "div",
          { className: "clean9-rules-scroll" },
          h(
            "table",
            { className: "clean9-rules-table clean9-skills-table" },
            h(
              "colgroup",
              null,
              h("col", { style: { width: "34%" } }),
              h("col", null),
              h("col", { style: { width: 104 } }),
              h("col", { style: { width: 64 } }),
              h("col", { style: { width: 48 } })
            ),
            h("thead", null, h(
              "tr",
              null,
              h("th", { scope: "col" }, "名称"),
              h("th", { scope: "col" }, "描述"),
              h("th", { scope: "col" }, "调用方式"),
              h("th", { scope: "col" }, "大小"),
              h("th", { scope: "col" }, "操作")
            )),
            h("tbody", null, rows)
          )
        )
      ),
      h(
        "div",
        { className: "clean9-rules-editor" },
        editId ? [
          h(
            "div",
            { key: "meta", className: "clean9-rules-editor-meta" },
            h("input", {
              className: "xsdsh-field",
              "aria-label": "技能描述",
              placeholder: t("ph.skill.desc"),
              value: editDesc,
              onChange: (e) => setEditDesc(e.target.value)
            })
          ),
          h("textarea", {
            key: "body",
            className: "clean9-rules-area",
            value: content,
            onChange: (e) => setContent(e.target.value),
            spellCheck: false,
            placeholder: "",
            "aria-label": "技能正文"
          }),
          h(
            "div",
            { key: "save", className: "clean9-rules-save" },
            h(Btn, {
              kind: "primary",
              disabled: busy,
              onClick: () => doPost("save", { id: editId, content, description: editDesc })
            }, t("btn.saveSkill"))
          )
        ] : h("div", { className: "clean9-rules-empty" }, t("skills.pick"))
      )
    ),
    h("div", { className: "clean9-rules-foot" }, noticeNode(notice)),
    confirm ? h(ConfirmDialog, {
      title: t("delete"),
      message: t("confirm.delete.skill", { id: confirm.id }),
      confirmLabel: t("delete"),
      cancelLabel: "取消",
      danger: true,
      busy,
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        const id = confirm.id;
        setConfirm(null);
        if (editId === id) clearEditor();
        doPost("delete", { id });
      }
    }) : null
  );
}

// src/ui/features/clean/RestartDialog.tsx
function RestartDialog({ kind, busy, onRestart, onSnooze, onDismiss }) {
  const box = React.useRef(null);
  const later = React.useRef(null);
  const primary = React.useRef(null);
  const titleId = React.useId();
  const bodyId = React.useId();
  const close = kind === "full" ? onSnooze : onDismiss;
  const closeRef = React.useRef(close);
  closeRef.current = close;
  React.useEffect(() => {
    (kind === "full" ? later : primary).current?.focus();
  }, [kind]);
  React.useEffect(() => {
    const key = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = Array.from(box.current?.querySelectorAll("button:not(:disabled)") || []);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) {
        event.preventDefault();
        box.current?.focus();
        return;
      }
      if (event.shiftKey && (document.activeElement === first || !box.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !box.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key, true);
    return () => document.removeEventListener("keydown", key, true);
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "clean9-restart-shade" }, /* @__PURE__ */ React.createElement("div", { className: "clean9-restart-dialog", role: "alertdialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": bodyId, ref: box, tabIndex: -1 }, /* @__PURE__ */ React.createElement("h2", { id: titleId }, kind === "full" ? "需要重启宿主" : "需要重新打开 DSH"), /* @__PURE__ */ React.createElement("p", { id: bodyId }, kind === "full" ? "补丁已写入。重启宿主后才会真正生效，重启会短暂断开当前页面；回来后再确认实际效果。" : "所选补丁已写入。请完全退出 DSH 后重新打开——只关窗口不够，自动重启会补齐全量补丁。"), /* @__PURE__ */ React.createElement("div", { className: "clean9-restart-actions" }, kind === "full" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { type: "button", ref: later, onClick: onSnooze }, "五分钟后提醒"), /* @__PURE__ */ React.createElement("button", { type: "button", ref: primary, className: "is-primary", disabled: busy, onClick: onRestart }, busy ? "正在重启…" : "现在重启")) : /* @__PURE__ */ React.createElement("button", { type: "button", ref: primary, className: "is-primary", onClick: onDismiss }, "知道了"))));
}

// src/ui/features/clean/clean.css
var clean_default = '.clean9{--c9-bg:var(--xsdsh-panel,#fff);--c9-soft:var(--xsdsh-panel2,#f8fafc);--c9-line:var(--xsdsh-line,#e4e9f0);--c9-text:var(--xsdsh-ink,#101828);--c9-mute:var(--xsdsh-mute,#5b6b80);--c9-accent:var(--xsdsh-accent,#2563eb);font:13px/1.6 var(--xsdsh-font-ui,var(--xsdsh-sans,"Segoe UI","Microsoft YaHei",sans-serif));color:var(--c9-text);padding:0;box-sizing:border-box;display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden}.clean9 *{box-sizing:border-box}.clean9 h2,.clean9 h3,.clean9 p{margin:0 0 12px}.clean9 button,.clean9 input,.clean9 select,.clean9 textarea{font:inherit;color:inherit}.clean9 button{cursor:pointer;border:1px solid var(--c9-line);border-radius:8px;padding:6px 12px;background:var(--c9-bg);transition:background .15s var(--xsdsh-ease),border-color .15s var(--xsdsh-ease)}.clean9 button:hover:not(:disabled):not(.clean9-patch-card):not(.clean9-tile){background:var(--xsdsh-hover,#eef3f9);border-color:var(--xsdsh-line-hover,#aab7c8)}.clean9 button.is-primary{background:var(--xsdsh-accent-soft,#e8f0ff);border-color:var(--c9-accent);color:var(--c9-accent)}.clean9 button.is-primary:hover:not(:disabled){background:var(--xsdsh-accent-bg,#e8f0ff)}.clean9 button:disabled{opacity:.45;cursor:not-allowed}.clean9 :focus-visible{outline:2px solid var(--c9-accent);outline-offset:3px}.clean9-page-head{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;color:var(--c9-mute);margin-bottom:8px;font-size:11px;flex:none}.clean9-page-head h2{color:var(--c9-text);font-size:13.5px;margin:0}\n.clean9-pill{display:inline-flex;align-items:center;border:1px solid var(--c9-line);border-radius:99px;padding:0 8px;font-size:10.5px;line-height:18px;color:var(--c9-mute);background:var(--c9-soft)}\n.clean9-version{font-size:11px;color:var(--c9-mute)}.clean9 .clean9-patch-card{display:block;text-align:left;width:100%;background:var(--c9-soft);border:1px solid var(--c9-line);padding:12px 14px;border-radius:12px;margin-bottom:10px;flex:none}.clean9-card-title{font-size:13.5px;font-weight:650;display:flex;justify-content:space-between}.clean9-card-title>span{font-weight:400;color:var(--c9-mute);font-size:11.5px}.clean9-counts{display:flex;gap:18px;flex-wrap:wrap;margin:8px 0 4px}.clean9-counts>span{display:inline-flex;align-items:baseline;gap:4px;min-width:0}.clean9-counts b{font-size:17px;line-height:1.2;font-weight:700}.clean9-counts span span{font-size:11.5px;color:var(--c9-mute)}.clean9 .is-applied{color:var(--xsdsh-ok,#067647)}.clean9 .is-pending{color:var(--xsdsh-warn,#b54708)}.clean9 .is-skipped{color:var(--xsdsh-skip,#6938ef)}.clean9 .is-na{color:var(--xsdsh-na,#7b899b)}.clean9 .is-unknown{color:var(--xsdsh-faint,#7b899b)}.clean9 .is-missing,.clean9 .is-unmatched,.clean9 .is-danger strong,.clean9 .is-error{color:var(--xsdsh-bad,#d92d20)}.clean9-health{display:flex;gap:8px 16px;flex-wrap:wrap;font-size:10.5px;color:var(--c9-mute);overflow-wrap:anywhere}.clean9-health b{color:var(--c9-text);margin-right:4px}.clean9-card-foot{display:flex;justify-content:space-between;font-size:10.5px;color:var(--c9-mute);border-top:1px solid var(--c9-line);margin-top:8px;padding-top:6px}.clean9-tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:clamp(54px,7.6vh,74px);gap:8px;align-content:start;min-height:0;flex:none}.clean9 .clean9-tile{display:flex;align-items:center;gap:10px;min-height:0;height:100%;text-align:left;padding:8px 14px;border-radius:10px;background:var(--c9-soft);border:1px solid var(--c9-line)}.clean9-tile>span:first-child{flex:1}.clean9-tile strong{display:block;font-size:12.5px}.clean9-description{display:block;font-size:11px;line-height:1.5;color:var(--c9-mute);margin-top:2px}.clean9-card-state{flex:none;font-size:10px;line-height:16px;padding:0 8px;border-radius:99px;white-space:nowrap;color:var(--c9-mute);background:var(--xsdsh-mut-soft,rgba(91,107,128,.08))}\n.clean9-card-state.is-ok{color:var(--xsdsh-ok,#3f8f6b);background:var(--xsdsh-ok-soft,rgba(63,143,107,.12))}\n.clean9-card-state.is-warn{color:var(--xsdsh-warn,#b07d2a);background:var(--xsdsh-warn-soft,rgba(176,125,42,.12))}\n.clean9-card-state.is-bad{color:var(--xsdsh-bad,#c0555a);background:var(--xsdsh-bad-soft,rgba(192,85,90,.12))}.clean9-overlay{position:fixed;inset:0;z-index:2147483000;background:var(--xsdsh-overlay,rgba(20,35,46,.5));display:flex;align-items:center;justify-content:center;padding:24px}.clean9-dialog{width:min(1080px,100%);max-height:calc(100dvh - 48px);background:var(--c9-bg);border:1px solid var(--c9-line);border-radius:14px;box-shadow:0 20px 70px #0003;display:flex;flex-direction:column}.clean9-dialog>header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--c9-line);padding:14px 20px;gap:16px}.clean9-dialog>header h2{font-size:16px;margin:0}.clean9-dialog-body{padding:20px;overflow:auto;overscroll-behavior:contain}.clean9-actions,.clean9-toolbar,.clean9-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:12px 0}.clean9-toolbar input{flex:1;min-width:140px}.clean9 input:not([type=checkbox]),.clean9 select,.clean9 textarea{border:1px solid var(--c9-line);background:var(--c9-soft);border-radius:6px;padding:7px 9px;max-width:100%}.clean9 textarea{width:100%;min-height:160px;resize:vertical}.clean9-filters button{font-size:11px;padding:4px 8px}.clean9-filters button[aria-pressed=true]{border-color:var(--c9-accent);color:var(--c9-accent)}.clean9-muted{color:var(--c9-mute);font-size:11px}.clean9-layer{border:1px solid var(--c9-line);border-radius:8px;margin-top:10px}.clean9 summary{cursor:pointer}.clean9-layer>summary{padding:10px 12px;background:var(--c9-soft)}.clean9-layer>summary>span{margin-left:12px;color:var(--c9-mute);font-size:11px}.clean9-layer-note{margin:6px 12px 0;font-size:10.5px;line-height:1.5;color:var(--c9-mute)}.clean9-patch-row{display:flex;align-items:flex-start;gap:12px;border-top:1px solid var(--c9-line);padding:10px 12px}.clean9-patch-row>details{flex:1;min-width:0;overflow-wrap:anywhere}.clean9-patch-row>details>summary{display:flex;justify-content:space-between;gap:12px}.clean9-patch-row p{font-size:12px;margin:8px 0 0}.clean9-status{white-space:nowrap;font-size:11px}.clean9-notice{padding:8px 10px;background:var(--c9-soft);border-radius:6px;overflow-wrap:anywhere}.clean9-diagnostics{margin:12px 0}.clean9-diagnostics p{font-size:12px;margin:8px 0}.clean9-restart-shade{position:fixed;inset:0;z-index:2147483001;background:var(--xsdsh-overlay,rgba(20,35,46,.5));display:flex;align-items:center;justify-content:center;padding:24px}.clean9-restart-dialog{width:min(420px,100%);background:var(--c9-bg);border:1px solid var(--c9-line);border-radius:14px;box-shadow:0 20px 70px #0003;padding:20px}.clean9-restart-dialog h2{margin:0 0 8px;font-size:16px}.clean9-restart-dialog p{margin:0;font-size:12.5px;line-height:1.65;color:var(--c9-mute)}.clean9-restart-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}\n.clean9-confirm-shade{position:fixed;inset:0;z-index:2147483002;background:var(--xsdsh-overlay,rgba(20,35,46,.5));display:flex;align-items:center;justify-content:center;padding:24px}\n.clean9-confirm-dialog{width:min(420px,100%);background:var(--c9-bg);border:1px solid var(--c9-line);border-radius:14px;box-shadow:0 20px 70px #0003;padding:20px}\n.clean9-confirm-dialog h2{margin:0 0 8px;font-size:16px}\n.clean9-confirm-dialog p{margin:0;font-size:12.5px;line-height:1.65;color:var(--c9-mute);overflow-wrap:anywhere}\n.clean9 .clean9-confirm-dialog button.is-primary.is-danger{background:var(--xsdsh-bad-soft,rgba(208,36,26,.10));border-color:var(--xsdsh-bad,#d92d20);color:var(--xsdsh-bad,#d92d20)}\n.clean9 .clean9-confirm-dialog button.is-primary.is-danger:hover:not(:disabled){background:var(--xsdsh-bad-soft,rgba(208,36,26,.16))}.clean9 .xsdsh-split{display:grid;grid-template-columns:minmax(300px,1fr) minmax(300px,1.15fr);gap:16px}.clean9 .xsdsh-ruleitem{padding:10px;border-bottom:1px solid var(--c9-line);cursor:pointer}.clean9 .xsdsh-rule-main,.clean9 .xsdsh-rule-meta{display:block}.clean9 .xsdsh-rule-meta{font-size:11px;color:var(--c9-mute)}.clean9 .xsdsh-rule-ops,.clean9 .xsdsh-create-row,.clean9 .xsdsh-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.clean9 .xsdsh-block{margin:14px 0}.clean9 .xsdsh-cwd-item{display:flex;gap:8px;padding:8px;border-bottom:1px solid var(--c9-line)}.clean9 .xsdsh-cwd-sub,.clean9 .xsdsh-cwd-prev{font-size:11px;overflow-wrap:anywhere}.clean9 .xsdsh-pill{margin-left:8px;font-size:11px}.clean9 .xsdsh-policy-row{display:flex;gap:12px;align-items:center}.clean9 .xsdsh-block-hint,.clean9 .xsdsh-hint{font-size:12px;color:var(--c9-mute)}@media(max-width:700px){.clean9-tiles{grid-template-columns:1fr}.clean9-counts{gap:12px}.clean9-overlay{padding:8px}.clean9-dialog{max-height:calc(100dvh - 16px)}.clean9-dialog-body{padding:12px}.clean9 .xsdsh-split{grid-template-columns:1fr}.clean9-card-state{white-space:normal}.clean9-layer>summary>span{display:block;margin-left:0}}.clean9-progress{display:flex;height:6px;border-radius:4px;overflow:hidden;background:var(--c9-line);margin:8px 0 6px}.clean9-progress>span{background:currentColor;min-width:0}.clean9-progress .is-skipped{color:var(--xsdsh-skip,#a1aab5)}.clean9-progress .is-unknown{color:var(--xsdsh-faint,#788897)}.clean9-revert-results{margin-top:16px;padding-top:14px;border-top:1px solid var(--c9-line);overflow-wrap:anywhere}.clean9-revert-results h3{font-size:14px}.clean9-revert-table{max-height:340px;overflow:auto}.clean9-revert-table table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:12px}.clean9-revert-table th,.clean9-revert-table td{text-align:left;padding:8px;vertical-align:top;border-bottom:1px solid var(--c9-line);overflow-wrap:anywhere}.clean9-revert-table th:first-child{width:45%}.clean9-revert-fast{font-size:12px;color:var(--c9-mute)}/* 正常窗口里清洗页永不滚动（比例缩到能放下）；只有宿主窗口矮到 520px 以下才允许滚动，\n   宁可出滚动条也不裁掉瓷贴内容。 */\n@media(max-height:520px){.clean9{overflow-y:auto}.clean9-tiles{grid-auto-rows:minmax(44px,1fr)}}\n@media(prefers-reduced-motion:reduce){.clean9 *{scroll-behavior:auto}}\n\n.clean9-own-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:12px}\n/* 列顺序：主机/IP → 删除 → 识别；第一列跟输入框走，删除列紧贴输入框右侧。 */\n.clean9-own-table col:first-child{width:min(340px,62%)}\n.clean9-own-table col:nth-child(2){width:34px}\n.clean9-own-table th{text-align:left;font-size:10.5px;font-weight:600;color:var(--c9-mute);padding:0 6px 4px;border-bottom:1px solid var(--c9-line)}\n.clean9-own-table td{padding:4px 6px;border-bottom:1px solid var(--c9-line);vertical-align:middle}\n.clean9-own-table th:nth-child(2),.clean9-own-table td:nth-child(2){width:34px;padding-left:4px;padding-right:0;text-align:center}\n.clean9-own-table tr:last-child td{border-bottom:0}\n.clean9-own-table input{width:100%;margin:0}\n.clean9-own-table tr.is-bad input{border-color:var(--xsdsh-bad)}\n.clean9-own-kind{display:block;font-size:10.5px;color:var(--c9-mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.clean9-own-kind.is-bad{color:var(--xsdsh-bad)}\n.clean9-own-comments{margin-top:10px;border-top:1px dashed var(--c9-line);padding-top:8px}\n.clean9-own-comments summary{cursor:pointer;font-size:11.5px;color:var(--c9-mute)}\n.clean9-own-hint{font-size:11px;color:var(--c9-mute);margin:6px 0}\n.clean9 .clean9-own-lead{font-size:11.5px;color:var(--c9-mute);margin:0}\n.clean9 .clean9-own-count{margin-left:auto;font-size:11px;color:var(--c9-mute);white-space:nowrap}\n.clean9-own-comment{display:flex;gap:6px;align-items:center;margin:4px 0}\n.clean9-own-comment input{flex:1;min-width:0}\n.clean9-own-comment .clean9-icon-btn{flex:none}\n.clean9-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}\n\n.clean9-rules{display:flex;flex-direction:column;gap:10px;min-height:0}\n.clean9-rules-head{display:flex;align-items:center;gap:8px}\n.clean9-rules-head p{flex:1;margin:0;font-size:11.5px;color:var(--c9-mute)}\n.clean9-rules-count{font-size:11px;color:var(--c9-mute);border:1px solid var(--c9-line);border-radius:99px;padding:0 8px;line-height:18px}\n.clean9-rules-policy{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 10px;border:1px solid var(--c9-line);border-radius:9px;background:var(--c9-soft)}\n.clean9-rules-label{font-size:11.5px;color:var(--c9-mute)}\n.clean9-seg{display:inline-flex;gap:2px;padding:2px;border-radius:8px;background:var(--xsdsh-panel3,#eef2f7)}\n.clean9-seg button{border:0;background:transparent;padding:3px 10px;border-radius:6px;font-size:11.5px;color:var(--c9-mute);min-width:64px;text-align:center}\n.clean9-seg button[aria-pressed=true]{background:var(--c9-bg);color:var(--c9-accent);font-weight:600;box-shadow:0 1px 2px rgba(16,24,40,.14)}\n.clean9-rules-hint{flex:1 1 220px;margin:0;font-size:11px;color:var(--c9-mute)}\n.clean9-rules-cwd{border:1px solid var(--c9-line);border-radius:9px;background:var(--c9-soft);padding:8px 10px}\n.clean9-rules-cwd>summary{cursor:pointer;font-size:11.5px;color:var(--c9-mute)}\n.clean9-rules-cwd-head{display:flex;align-items:center;gap:8px;margin:6px 0;flex-wrap:wrap}\n.clean9-rules-cwd-path{font-family:var(--xsdsh-font-code,monospace);font-size:11px;color:var(--c9-mute);overflow-wrap:anywhere}\n.clean9-rules-body{align-items:stretch;height:clamp(300px,46vh,380px);min-height:0}\n.clean9-rules-list{min-width:0;display:flex;flex-direction:column;border:1px solid var(--c9-line);border-radius:9px;background:var(--c9-bg);overflow:hidden}\n.clean9-rules-list-head{display:flex;align-items:center;gap:8px;padding:7px 10px;border-bottom:1px solid var(--c9-line)}\n.clean9-rules-list-head h4{margin:0;font-size:12px;flex:1}\n.clean9-rules-create{display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-bottom:1px solid var(--c9-line);background:var(--c9-soft)}\n.clean9-rules-create-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}\n.clean9-rules-create-head strong{font-size:12px}\n.clean9-rules-create-head span{font-size:10.5px;color:var(--c9-mute)}\n.clean9-rules-create-fields{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px 10px}\n.clean9-rules-create-fields .clean9-field{display:flex;flex-direction:column;gap:3px;min-width:0}\n.clean9-rules-create-fields .clean9-field>span{font-size:10.5px;color:var(--c9-mute)}\n/* 目标文件独占一行，ID 与名称并排。 */\n.clean9-rules-create-fields .clean9-field:nth-child(3){grid-column:1/-1}\n.clean9-rules-create-fields .xsdsh-field,.clean9-rules-create-fields .purge-select{width:100%;min-width:0}\n.clean9 .clean9-rules-create-fields .xsdsh-field,.clean9 .clean9-rules-create-fields .purge-select-trigger{min-height:34px}\n.clean9 .clean9-rules-create-actions{display:flex;justify-content:flex-end;align-items:center;gap:6px;flex-wrap:wrap}\n/* 压过 `.clean9 button` 的 padding/font，按钮高度与字段对齐。 */\n.clean9 .clean9-rules-create-actions .xsdsh-btn{min-height:34px;padding:0 14px;font-size:13px;line-height:1}\n.clean9-rules-scroll{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain}\n.clean9-rules-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:11.5px}\n.clean9-rules-table th{position:sticky;top:0;background:var(--c9-soft);text-align:left;font-size:10.5px;font-weight:600;color:var(--c9-mute);padding:5px 8px;border-bottom:1px solid var(--c9-line)}\n.clean9-rules-table th:nth-child(2){width:86px}\n.clean9-rules-table th:nth-child(3){width:52px}\n.clean9-rules-table th:nth-child(4){width:58px}\n.clean9-rules-table th:nth-child(5){width:132px}\n.clean9-rules-table td{padding:5px 8px;border-bottom:1px solid var(--c9-line);vertical-align:middle;overflow-wrap:anywhere}\n.clean9-rules-row:hover{background:var(--xsdsh-hover)}\n.clean9-rules-row.is-edit{background:var(--xsdsh-accent-soft)}\n.clean9-rules-row.is-active .clean9-rules-name{font-weight:600}\n/* 用 .clean9 前缀压过 `.clean9 button`，否则名称按钮会拿到方框和背景。 */\n.clean9 .clean9-rules-name{border:0;background:transparent;padding:0;font:inherit;color:var(--c9-text);text-align:left;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;display:block;width:100%}\n.clean9 .clean9-rules-name:hover:not(:disabled){color:var(--c9-accent);background:transparent;border:0}\n.clean9-rules-target,.clean9-rules-size,.clean9-rules-muted{font-size:10.5px;color:var(--c9-mute);white-space:nowrap}\n.clean9-rules-ops{white-space:nowrap}\n.clean9-ops-inline{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;vertical-align:middle}\n.clean9-ops-inline button{padding:2px 8px;font-size:10.5px;line-height:18px}\n.clean9-rules-editor{min-width:0;display:flex;flex-direction:column;gap:8px;border:1px solid var(--c9-line);border-radius:9px;background:var(--c9-bg);padding:12px}\n.clean9-rules-editor-meta{display:flex;gap:6px;flex-wrap:wrap}\n.clean9-rules-editor-meta input{flex:1 1 140px;min-width:0}\n.clean9-rules-area{flex:1;min-height:220px;resize:vertical;font-family:var(--xsdsh-font-ui);font-size:12px;line-height:1.6}\n.clean9-rules-save{display:flex;gap:8px;align-items:center}\n.clean9-rules-empty{margin:0;padding:10px;color:var(--c9-mute);font-size:11.5px;text-align:center}\n.clean9-rules-foot{min-height:44px;display:flex;align-items:flex-start}\n.clean9-rules-foot .clean9-notice{margin:0;flex:1}\n\n.clean9-skills{display:flex;flex-direction:column;gap:10px;min-height:0}\n.clean9-skills-toolbar{display:flex;gap:6px;align-items:center;flex-wrap:wrap}\n.clean9-skills-toolbar input{flex:1 1 200px;min-width:0}\n.clean9-skills-table{table-layout:fixed}\n/* 列宽与 <colgroup> 对齐：名称 34%，描述吃剩余宽度，调用方式/大小/操作固定。 */\n.clean9-skills-table th:nth-child(2){width:auto}\n.clean9-skills-table th:nth-child(3){width:104px}\n.clean9-skills-table th:nth-child(4){width:64px}\n.clean9-skills-table th:nth-child(5){width:48px}\n.clean9-skills-table th,.clean9-skills-table td{padding:5px 8px;vertical-align:middle;white-space:nowrap}\n.clean9-skills-desc{color:var(--c9-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.clean9-skills-call{white-space:nowrap}\n.clean9-call-chips{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;vertical-align:middle}\n.clean9-skills-gate{padding:16px;border:1px dashed var(--c9-line);border-radius:9px;color:var(--c9-mute);font-size:12px}\n\n/* ── Skill 表：图标按钮 / 调用徽章 / 整行可点 ───────────────────── */\n.clean9-rules-row.is-clickable{cursor:pointer}\n.clean9 .clean9-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;\n  padding:0;border:1px solid var(--c9-line);border-radius:7px;background:var(--c9-bg);color:var(--c9-mute)}\n.clean9 .clean9-icon-btn:hover:not(:disabled){color:var(--xsdsh-bad);border-color:var(--xsdsh-bad-line,rgba(208,36,26,.28));\n  background:var(--xsdsh-bad-soft,rgba(208,36,26,.10))}\n.clean9 .clean9-icon-btn:disabled{opacity:.45;cursor:not-allowed}\n.clean9-call{display:inline-block;padding:0 6px;border-radius:999px;font-size:10px;line-height:18px;\n  border:1px solid var(--c9-line);color:var(--c9-mute);background:var(--c9-soft)}\n.clean9-call.is-on{color:var(--xsdsh-ok);border-color:color-mix(in srgb,var(--xsdsh-ok) 35%,transparent);\n  background:color-mix(in srgb,var(--xsdsh-ok) 10%,transparent)}\n.clean9-skills-table td{height:36px}\n\n/* ── 自己的服务器：给表格留出高度，不再压成一条 ─────────────────── */\n.clean9-own{display:flex;flex-direction:column;gap:10px;min-height:min(42vh,340px)}\n.clean9-own-scroll{flex:1;min-height:140px;overflow:auto;overscroll-behavior:contain;\n  border:1px solid var(--c9-line);border-radius:9px;background:var(--c9-bg)}\n.clean9-own-table th{position:sticky;top:0;z-index:1;background:var(--c9-soft);padding:6px 8px}\n.clean9-own-table td{padding:5px 8px}\n\n/* ── 短内容弹窗：宽度贴合内容，底部不留空 ──────────────────────── */\n.clean9-dialog--compact{width:min(560px,100%)}\n.clean9-dialog--compact .clean9-dialog-body{padding:16px 18px 18px}\n.clean9-dialog--compact .clean9-dialog-body p:last-child{margin-bottom:0}\n.clean9-dialog--medium{width:min(760px,100%)}\n\n/* Esc 回焦时不留「选中框」；真正的键盘焦点环改内描边，不会被面板裁掉 */\n.clean9 .is-focus-returned:focus-visible{outline:none}\n.clean9 .clean9-tile:focus-visible{outline-offset:-3px}\n/* 窄屏上下堆叠时，容器固定高度会均分给两行；改成各自保底高度。 */\n@media(max-width:700px){\n  .clean9-rules-body{height:auto;min-height:auto}\n  .clean9-rules-list{min-height:200px}\n  .clean9-rules-editor{min-height:260px}\n  .clean9-rules-create-fields{grid-template-columns:1fr}\n  /* 窄窗里保留固定列，但收窄调用/大小/操作，给描述留出可读宽度。 */\n  .clean9-skills-table col:nth-child(3){width:96px!important}\n  .clean9-skills-table col:nth-child(4){width:56px!important}\n  .clean9-skills-table col:nth-child(5){width:44px!important}\n}\n/* 极窄窗（约手机宽度）先保名称和操作：次要列隐藏，避免固定列把名称挤成 0。 */\n@media(max-width:520px){\n  /* 用零宽 + visibility 保留列映射；display:none 会让后续单元格错位到隐藏列。 */\n  .clean9-rules-table:not(.clean9-skills-table) th:nth-child(3),.clean9-rules-table:not(.clean9-skills-table) td:nth-child(3),\n  .clean9-rules-table:not(.clean9-skills-table) th:nth-child(4),.clean9-rules-table:not(.clean9-skills-table) td:nth-child(4),\n  .clean9-skills-table th:nth-child(2),.clean9-skills-table td:nth-child(2){width:0!important;padding:0!important;visibility:hidden}\n  .clean9-rules-table:not(.clean9-skills-table) th:nth-child(2){width:72px}\n  .clean9-rules-table:not(.clean9-skills-table) th:nth-child(5){width:116px}\n  .clean9-skills-table col:nth-child(1){width:auto!important}\n  .clean9-skills-table col:nth-child(2){width:0!important}\n}\n';

// src/ui/features/clean/CleanPage.tsx
var RulesSection2 = RulesSection;
var SkillsSection2 = SkillsSection;
var titles = { patch: "补丁", hooks: "Hook拦截", prompt: "提示词", own: "自己的服务器", rules: "规矩本", skills: "Skill", uninstall: "卸载 Xsdsh-purge-next" };
var cards = [
  { id: "hooks", description: HOOK_DESCRIPTION },
  { id: "prompt", description: "编辑与恢复提示词，保留真实注入状态" },
  { id: "own", description: "net-scope-allow.txt · 一行一个主机名" },
  { id: "rules", description: "AGENTS.md / CLAUDE.md 追加策略" },
  { id: "skills", description: "导入、编辑与管理随包技能" },
  { id: "uninstall", description: "恢复备份 / 清运行时 / 撤注册 · 操作前确认" }
];
function CleanPage({ runtime, op }) {
  const c = useCleanController(runtime, op);
  const [panel, setPanel] = React.useState(null);
  const root = React.useRef(null);
  const [glassOn, setGlassOn] = React.useState(() => runtime.glass?.read() ?? false);
  const [glassError, setGlassError] = React.useState("");
  React.useEffect(() => {
    if (root.current && runtime.glass) runtime.glass.apply(root.current, glassOn);
  }, [runtime.glass, glassOn]);
  const changeGlass = (on) => {
    try {
      runtime.glass?.save(on);
      setGlassOn(on);
      setGlassError("");
    } catch (error) {
      setGlassError(error instanceof Error ? error.message : String(error));
    }
  };
  const rows = patchRows(c.catalogue, c.status);
  const refresh = () => {
    void c.refresh();
  };
  const close = () => setPanel(null);
  const restartKind = c.op.askRestart && !c.manualRestart ? "full" : c.manualPrompt ? "manual" : null;
  React.useEffect(() => {
    if (restartKind) setPanel((current) => current === "patch" ? null : current);
  }, [restartKind]);
  const tileState = (id) => id === "hooks" ? hookStateLabels[hookState(c.status)] : id === "uninstall" ? "危险操作" : "管理";
  const tileTone = (id) => id === "hooks" ? { synced: "ok", dirty: "warn", applied_unrestarted: "warn", unknown: "mut" }[hookState(c.status)] : id === "uninstall" ? "bad" : "mut";
  return /* @__PURE__ */ React.createElement("div", { ref: root, className: "clean9", "data-glass": glassOn ? "1" : "0" }, /* @__PURE__ */ React.createElement("style", null, clean_default), /* @__PURE__ */ React.createElement("div", { className: "clean9-page-head" }, /* @__PURE__ */ React.createElement("h2", null, "清洗"), /* @__PURE__ */ React.createElement("span", { className: "clean9-pill" }, c.status?.surface || "宿主状态待检测"), /* @__PURE__ */ React.createElement("span", { className: "clean9-version" }, c.status?.plugin_version ? "v" + c.status.plugin_version : ""), runtime.glass && /* @__PURE__ */ React.createElement("label", null, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: glassOn, onChange: (event) => changeGlass(event.target.checked) }), "液态玻璃")), glassError && /* @__PURE__ */ React.createElement("p", { role: "alert" }, "液态玻璃设置未保存：", glassError), /* @__PURE__ */ React.createElement("button", { type: "button", className: "clean9-patch-card", "aria-haspopup": "dialog", onClick: () => setPanel("patch") }, /* @__PURE__ */ React.createElement("span", { className: "clean9-card-title" }, "补丁 ", /* @__PURE__ */ React.createElement("span", null, c.catalogueReady ? `${rows.length} 条` : "读取目录中")), /* @__PURE__ */ React.createElement(PatchCounts, { rows, known: c.catalogueReady && c.status !== null }), /* @__PURE__ */ React.createElement(PatchHealth, { status: c.status }), /* @__PURE__ */ React.createElement("span", { className: "clean9-card-foot" }, c.busy ? "正在处理" : c.manualRestart ? "所选补丁已写入 · 需完全退出 DSH 后重新打开" : c.status?.status_unknown ? "状态未知 · 当前为最后已知数据" : "点击查看补丁状态与明细", /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "›"))), c.catalogueError && /* @__PURE__ */ React.createElement("p", { role: "alert" }, "补丁目录读取失败：", c.catalogueError), /* @__PURE__ */ React.createElement("div", { className: "clean9-tiles" }, cards.map((card) => /* @__PURE__ */ React.createElement("button", { type: "button", key: card.id, className: "clean9-tile" + (card.id === "uninstall" ? " is-danger" : ""), "aria-haspopup": "dialog", onClick: () => setPanel(card.id) }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, titles[card.id]), /* @__PURE__ */ React.createElement("span", { className: "clean9-description" }, card.description)), /* @__PURE__ */ React.createElement("span", { className: "clean9-card-state is-" + tileTone(card.id) }, tileState(card.id)), /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "›")))), /* @__PURE__ */ React.createElement(NoticeView, { notice: c.notice }), c.status?.status_unknown && /* @__PURE__ */ React.createElement("p", { role: "alert" }, "读取宿主状态失败：", c.status.status_error, "。正在自动重试。"), panel && /* @__PURE__ */ React.createElement(Overlay, { title: titles[panel], onClose: close, size: panel === "own" ? "medium" : panel === "hooks" || panel === "uninstall" ? "compact" : "wide" }, panel === "patch" && /* @__PURE__ */ React.createElement(PatchPanel, { controller: c }), panel === "hooks" && /* @__PURE__ */ React.createElement(HooksSection, { api: c.api, status: c.status, locked: c.busy, onSaved: refresh }), panel === "prompt" && /* @__PURE__ */ React.createElement(TextEditor, { kind: "override", api: c.api, runtime, locked: c.busy, onSaved: refresh }), panel === "own" && /* @__PURE__ */ React.createElement(OwnServersEditor, { api: c.api, runtime, locked: c.busy, onSaved: refresh }), panel === "rules" && /* @__PURE__ */ React.createElement(RulesSection2, { runtime, api: c.api }), panel === "skills" && /* @__PURE__ */ React.createElement(SkillsSection2, { runtime, api: c.api }), panel === "uninstall" && /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("p", null, runtime.t("uninstall.body")), c.status?.uninstall_leftover && /* @__PURE__ */ React.createElement("p", { role: "alert" }, "上次卸载有 ", c.status.uninstall_leftover.count, " 项残留：", c.status.uninstall_leftover.path), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: c.busy, onClick: () => {
    void c.action("uninstall");
  } }, "卸载 Xsdsh-purge-next"), /* @__PURE__ */ React.createElement(NoticeView, { notice: c.notice }))), restartKind && /* @__PURE__ */ React.createElement(
    RestartDialog,
    {
      kind: restartKind,
      busy: c.busy,
      onRestart: c.restart,
      onSnooze: () => {
        c.op.snoozeUntilRef.current = Date.now() + 3e5;
        c.op.setAskRestart(false);
      },
      onDismiss: c.dismissManualPrompt
    }
  ));
}

// src/ui/features/prompts/controller.ts
var PROMPT_MODES = [{ id: "redteam", label: "红队模式" }, { id: "reverse", label: "逆向模式" }];
var messageOf = (error) => error instanceof Error ? error.message : String(error);
var validMode = (id) => PROMPT_MODES.some((mode) => mode.id === id);
var canonical = (text2) => text2.replace(/\r\n/g, "\n").replace(/[\r\n]+$/, "");
function createPromptsController(request = globalThis.fetch.bind(globalThis)) {
  let state = { active: "redteam", records: {}, drafts: {}, loading: false, busy: false, message: "", error: false, confirmation: null };
  const listeners = /* @__PURE__ */ new Set();
  let generation = 0;
  let disposed = false;
  const emit = (patch) => {
    if (!disposed) {
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener());
    }
  };
  const dirty = (id = state.active) => state.records[id] !== void 0 && state.drafts[id] !== void 0 && state.drafts[id] !== state.records[id]?.current;
  const api2 = async (body) => {
    const response = await request("/Xsdsh-purge-next/prompts", { credentials: "same-origin", cache: "no-store", headers: { accept: "application/json", ...body ? { "content-type": "application/json" } : {} }, ...body ? { method: "POST", body: JSON.stringify(body) } : {} });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) throw new Error(data?.error || `HTTP ${response.status}`);
    return data;
  };
  const load = async () => {
    if (disposed || state.busy || state.confirmation) return;
    const ticket = ++generation;
    emit({ loading: true, message: "", error: false });
    try {
      const data = await api2();
      if (disposed || ticket !== generation) return;
      if (!Array.isArray(data.presets)) throw new Error("提示词响应缺少模式列表。");
      const records = {};
      const drafts = { ...state.drafts };
      for (const mode of PROMPT_MODES) {
        const item = data.presets.find((entry) => entry?.id === mode.id);
        const previous = state.records[mode.id];
        if (!item || item.ok === false || typeof item.current !== "string" || typeof item.builtin !== "string") {
          records[mode.id] = { id: mode.id, current: previous?.current ?? "", builtin: previous?.builtin ?? "", isCustom: previous?.isCustom ?? false, savedAt: previous?.savedAt ?? "", error: item?.error || "模式提示词不可用" };
        } else {
          records[mode.id] = { id: mode.id, current: item.current, builtin: item.builtin, isCustom: item.isCustom === true, savedAt: typeof item.savedAt === "string" ? item.savedAt : "" };
          if (!dirty(mode.id)) drafts[mode.id] = item.current;
        }
      }
      emit({ records, drafts });
    } catch (error) {
      if (ticket === generation) emit({ error: true, message: `读取失败：${messageOf(error)}` });
    } finally {
      if (ticket === generation) emit({ loading: false });
    }
  };
  const reset = async (all) => {
    if (disposed || state.busy || state.loading) return;
    const ids = all ? PROMPT_MODES.map((mode) => mode.id) : [state.active];
    const ticket = ++generation;
    emit({ busy: true, confirmation: null, message: "", error: false });
    const succeeded = [];
    const failed = [];
    for (const id of ids) {
      if (disposed || ticket !== generation) break;
      const record2 = state.records[id];
      try {
        if (!record2 || record2.error) throw new Error(record2?.error || "尚未读取");
        await api2({ action: "reset", id });
        if (disposed || ticket !== generation) break;
        const current = canonical(record2.builtin);
        emit({ records: { ...state.records, [id]: { ...record2, current, isCustom: false, savedAt: "" } }, drafts: { ...state.drafts, [id]: current } });
        succeeded.push(PROMPT_MODES.find((mode) => mode.id === id).label);
      } catch (error) {
        failed.push(`${PROMPT_MODES.find((mode) => mode.id === id).label}：${messageOf(error)}`);
      }
    }
    if (ticket === generation) emit({ busy: false, error: failed.length > 0, message: [succeeded.length ? `${succeeded.join("、")}已恢复默认，完全退出并重启后生效。` : "", failed.length ? `恢复失败，输入已保留：${failed.join("；")}` : ""].filter(Boolean).join(" ") });
  };
  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    isDirty: dirty,
    load,
    edit(text2) {
      if (!disposed && !state.busy && !state.loading && !state.confirmation && state.records[state.active] && !state.records[state.active]?.error) emit({ drafts: { ...state.drafts, [state.active]: text2 }, message: "", error: false });
    },
    switchTo(id) {
      if (!validMode(id) || disposed || state.busy || state.loading || state.confirmation || id === state.active) return;
      if (dirty()) emit({ confirmation: { kind: "switch", target: id } });
      else emit({ active: id, message: "", error: false });
    },
    requestReset(all = false) {
      if (!disposed && !state.busy && !state.loading && !state.confirmation) emit({ confirmation: { kind: "reset", all } });
    },
    cancelConfirmation() {
      emit({ confirmation: null });
    },
    async confirm() {
      const confirmation = state.confirmation;
      if (!confirmation || state.busy || state.loading) return;
      if (confirmation.kind === "switch") {
        emit({ drafts: { ...state.drafts, [state.active]: state.records[state.active]?.current ?? "" }, active: confirmation.target, confirmation: null, message: "", error: false });
      } else await reset(confirmation.all);
    },
    async save() {
      if (disposed || state.busy || state.loading || state.confirmation) return;
      const id = state.active;
      const record2 = state.records[id];
      if (!record2 || record2.error) return;
      const text2 = state.drafts[id] ?? "";
      if (!text2.trim()) {
        emit({ error: true, message: "提示词不能为空；输入未保存。" });
        return;
      }
      const ticket = ++generation;
      emit({ busy: true, message: "", error: false });
      try {
        await api2({ action: "save", id, text: text2 });
        if (disposed || ticket !== generation) return;
        const current = canonical(text2);
        emit({ records: { ...state.records, [id]: { ...record2, current, isCustom: true, savedAt: "" } }, drafts: { ...state.drafts, [id]: current }, message: "已保存到覆盖文件，完全退出并重启后生效。" });
      } catch (error) {
        if (ticket === generation) emit({ error: true, message: `保存失败，输入已保留：${messageOf(error)}` });
      } finally {
        if (ticket === generation) emit({ busy: false });
      }
    },
    dispose() {
      disposed = true;
      ++generation;
      listeners.clear();
    }
  };
}

// src/ui/features/prompts/prompts.css
var prompts_default = '.xsdsh-prompts-page{position:relative;min-width:0;padding:0;color:var(--xsdsh-ink);font-size:13px;display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden}\n.xsdsh-prompts-page *{box-sizing:border-box}\n.xsdsh-prompts-page h2{font-size:16px;margin:0}\n.xsdsh-prompts-page h3{font-size:13px;margin:0}\n.xsdsh-prompts-page p{line-height:1.6;color:var(--xsdsh-mute);margin:4px 0;font-size:11.5px}\n.xsdsh-prompts-page .xsdsh-prompts-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;flex:none}\n.xsdsh-prompts-page .xsdsh-prompts-heading p{margin:4px 0 0}\n.xsdsh-prompts-page button{border:1px solid var(--xsdsh-line);background:var(--xsdsh-panel,#fff);color:var(--xsdsh-ink);border-radius:8px;padding:6px 11px;font:inherit;font-size:12.5px;cursor:pointer;transition:background .15s var(--xsdsh-ease),border-color .15s var(--xsdsh-ease)}\n.xsdsh-prompts-page button:hover:not(:disabled){background:var(--xsdsh-hover);border-color:var(--xsdsh-line-hover)}\n.xsdsh-prompts-page button:disabled{opacity:.45;cursor:not-allowed}\n.xsdsh-prompts-page :focus-visible{outline:2px solid var(--xsdsh-accent);outline-offset:2px}\n.xsdsh-prompts-page .xsdsh-prompts-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:12px;flex:1;min-height:0}\n.xsdsh-prompts-page .xsdsh-prompts-modes{display:grid;gap:6px;align-content:start;min-height:0;overflow:hidden}\n.xsdsh-prompts-page .xsdsh-prompts-modes button{text-align:left;display:grid;gap:4px;padding:8px 10px}\n.xsdsh-prompts-page .xsdsh-prompts-modes button[aria-current=page]{border-color:var(--xsdsh-accent);background:var(--xsdsh-accent-soft);color:var(--xsdsh-accent)}\n.xsdsh-prompts-page .xsdsh-prompts-modes span{font-size:11px;color:var(--xsdsh-mute)}\n.xsdsh-prompts-page .xsdsh-prompts-workspace{min-width:0;min-height:0;display:flex;flex-direction:column}\n.xsdsh-prompts-page .xsdsh-prompts-editor-head{display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap;flex:none}\n.xsdsh-prompts-page .xsdsh-prompts-editor-head span,.xsdsh-prompts-page .xsdsh-prompts-meta{font-size:11px;color:var(--xsdsh-mute);overflow-wrap:anywhere;flex:none}\n.xsdsh-prompts-page .xsdsh-prompts-note{background:var(--xsdsh-warn-soft);border:1px solid var(--xsdsh-warn-line);color:var(--xsdsh-warn);border-radius:8px;padding:6px 9px;font-size:11.5px;flex:none}\n.xsdsh-prompts-page textarea{width:100%;flex:1;min-height:120px;resize:none;border:1px solid var(--xsdsh-line);background:var(--xsdsh-inset,var(--xsdsh-panel2));color:var(--xsdsh-ink);border-radius:8px;padding:9px 11px;font:12px/1.75 var(--xsdsh-font-ui,"Segoe UI","Microsoft YaHei",sans-serif);tab-size:2}\n.xsdsh-prompts-page textarea:disabled{opacity:.65}\n.xsdsh-prompts-page .xsdsh-prompts-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px;flex:none}\n.xsdsh-prompts-page .xsdsh-prompts-actions>span{margin-left:auto;font-size:11px;color:var(--xsdsh-mute)}\n.xsdsh-prompts-page .xsdsh-prompts-primary{background:var(--xsdsh-accent-soft);border-color:var(--xsdsh-accent);color:var(--xsdsh-accent)}\n.xsdsh-prompts-page .xsdsh-prompts-primary:hover:not(:disabled){background:var(--xsdsh-accent-bg)}\n.xsdsh-prompts-page .xsdsh-prompts-error{color:var(--xsdsh-bad);overflow-wrap:anywhere;flex:none}\n.xsdsh-prompts-page .xsdsh-prompts-status{min-height:18px;overflow-wrap:anywhere;flex:none;font-size:11px}\n.xsdsh-prompts-page .xsdsh-prompts-shade{position:absolute;inset:0;z-index:10;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;background:var(--xsdsh-overlay);border-radius:12px;overflow:auto}\n.xsdsh-prompts-page .xsdsh-prompts-confirm{width:100%;max-width:440px;background:var(--xsdsh-panel);border:1px solid var(--xsdsh-line);border-radius:12px;padding:18px;box-shadow:var(--xsdsh-shadow-menu)}\n@media(max-width:720px){\n  .xsdsh-prompts-page .xsdsh-prompts-layout{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr)}\n  .xsdsh-prompts-page .xsdsh-prompts-modes{grid-template-columns:repeat(2,minmax(0,1fr))}\n  .xsdsh-prompts-page .xsdsh-prompts-modes button{padding:7px 9px}\n}\n/* 极端小窗（高 ≤520 或 宽 ≤440）：内容放不下时允许外层滚动，不裁切。 */\n@media (max-height:520px),(max-width:440px){\n  .xsdsh-prompts-page{height:auto;overflow:visible}\n  .xsdsh-prompts-page .xsdsh-prompts-layout{flex:none}\n  .xsdsh-prompts-page textarea{flex:none;min-height:160px}\n}\n';

// src/ui/features/prompts/PromptsPage.tsx
function PromptsPage({ controller }) {
  const [state, setState] = react_default.useState(controller.getSnapshot);
  const cancel = react_default.useRef(null);
  const accept = react_default.useRef(null);
  react_default.useEffect(() => {
    const update = () => setState(controller.getSnapshot());
    const unsubscribe = controller.subscribe(update);
    update();
    if (!Object.keys(controller.getSnapshot().records).length && !controller.getSnapshot().loading) void controller.load();
    return unsubscribe;
  }, [controller]);
  react_default.useEffect(() => {
    if (!state.confirmation) return;
    const previous = document.activeElement;
    cancel.current?.focus();
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [state.confirmation]);
  const record2 = state.records[state.active];
  const draft = state.drafts[state.active] ?? "";
  const dirty = controller.isDirty();
  const locked = state.loading || state.busy;
  const label = PROMPT_MODES.find((mode) => mode.id === state.active).label;
  const error = state.error ? state.message : record2?.error;
  return /* @__PURE__ */ react_default.createElement("section", { "data-xsdsh-ui": "prompts", className: "xsdsh-prompts-page", "aria-label": "模式提示词", "aria-busy": locked }, /* @__PURE__ */ react_default.createElement("style", null, prompts_default), /* @__PURE__ */ react_default.createElement("header", { className: "xsdsh-prompts-heading" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("h2", null, "模式提示词"), /* @__PURE__ */ react_default.createElement("p", null, "红队与逆向模式的系统提示词原文。")), /* @__PURE__ */ react_default.createElement("button", { type: "button", disabled: locked || !!state.confirmation, onClick: () => void controller.load() }, state.loading ? "读取中…" : "重新读取")), /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-prompts-layout" }, /* @__PURE__ */ react_default.createElement("nav", { "aria-label": "选择模式", className: "xsdsh-prompts-modes" }, PROMPT_MODES.map((mode) => {
    const item = state.records[mode.id];
    return /* @__PURE__ */ react_default.createElement("button", { type: "button", key: mode.id, "aria-current": state.active === mode.id ? "page" : void 0, disabled: locked || !!state.confirmation, onClick: () => controller.switchTo(mode.id) }, /* @__PURE__ */ react_default.createElement("strong", null, mode.label, controller.isDirty(mode.id) ? " ●" : ""), /* @__PURE__ */ react_default.createElement("span", null, item?.error ? "读取失败" : item ? `${item.isCustom ? "自定义覆盖" : "随包默认"} · ${Array.from(state.drafts[mode.id] ?? item.current).length} 字` : state.loading ? "读取中…" : "尚未读取"));
  })), /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-prompts-workspace" }, /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-prompts-editor-head" }, /* @__PURE__ */ react_default.createElement("h3", null, label, dirty ? " ● 未保存" : ""), /* @__PURE__ */ react_default.createElement("span", null, record2 && !record2.error ? record2.isCustom ? "自定义覆盖" : "随包默认" : "")), record2?.savedAt && /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-prompts-meta" }, "上次保存：", /* @__PURE__ */ react_default.createElement("time", { dateTime: record2.savedAt }, record2.savedAt)), /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-prompts-note" }, "保存的是自定义覆盖文件，包升级时会保留。改完需要完全退出并重启宿主才生效。"), error && /* @__PURE__ */ react_default.createElement("p", { role: "alert", className: "xsdsh-prompts-error" }, error), /* @__PURE__ */ react_default.createElement(
    "textarea",
    {
      "aria-label": `${label}提示词`,
      spellCheck: false,
      value: draft,
      disabled: locked || !record2 || !!record2.error || !!state.confirmation,
      placeholder: state.loading ? "正在读取提示词…" : "读取成功后可编辑",
      onChange: (event) => controller.edit(event.target.value)
    }
  ), /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-prompts-actions" }, /* @__PURE__ */ react_default.createElement("button", { type: "button", className: "xsdsh-prompts-primary", disabled: locked || !record2 || !!record2.error || !!state.confirmation || !dirty, onClick: () => void controller.save() }, state.busy ? "处理中…" : "保存"), /* @__PURE__ */ react_default.createElement("button", { type: "button", disabled: locked || !record2 || !!record2.error || !!state.confirmation, onClick: () => controller.requestReset() }, "恢复当前默认"), /* @__PURE__ */ react_default.createElement("button", { type: "button", disabled: locked || !Object.keys(state.records).length || !!state.confirmation, onClick: () => controller.requestReset(true) }, "全部恢复默认"), /* @__PURE__ */ react_default.createElement("span", null, Array.from(draft).length, " 字", dirty ? " · 未保存" : "")), /* @__PURE__ */ react_default.createElement("p", { role: "status", "aria-live": "polite", className: "xsdsh-prompts-status" }, state.loading ? "正在读取模式提示词…" : state.busy ? "正在写入，请稍候…" : !state.error ? state.message : ""))), state.confirmation && /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-prompts-shade" }, /* @__PURE__ */ react_default.createElement(
    "div",
    {
      className: "xsdsh-prompts-confirm",
      role: "alertdialog",
      "aria-modal": "true",
      "aria-label": state.confirmation.kind === "switch" ? "放弃未保存的修改" : "恢复默认提示词",
      onKeyDown: (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          controller.cancelConfirmation();
        }
        if (event.key === "Tab") {
          event.preventDefault();
          (document.activeElement === cancel.current ? accept.current : cancel.current)?.focus();
        }
      }
    },
    /* @__PURE__ */ react_default.createElement("h3", null, state.confirmation.kind === "switch" ? "放弃未保存的修改？" : state.confirmation.all ? "恢复红队和逆向的默认提示词？" : `恢复${label}的默认提示词？`),
    /* @__PURE__ */ react_default.createElement("p", null, state.confirmation.kind === "switch" ? "切换后，当前模式未保存的输入会被丢弃。" : "这会移除所选模式的自定义覆盖，丢弃未保存的输入，并写回默认提示词。完全退出并重启后生效。"),
    /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-prompts-actions" }, /* @__PURE__ */ react_default.createElement("button", { type: "button", ref: cancel, onClick: () => controller.cancelConfirmation() }, "取消"), /* @__PURE__ */ react_default.createElement("button", { type: "button", ref: accept, className: "xsdsh-prompts-primary", onClick: () => void controller.confirm() }, state.confirmation.kind === "switch" ? "放弃并切换" : "确认恢复"))
  )));
}

// src/ui/features/config/config.css
var config_default = '.xsdsh-config { box-sizing: border-box; min-width: 0; color: var(--xsdsh-ink, #101828); font: 12px/1.6 var(--xsdsh-font-ui, "Segoe UI", "Microsoft YaHei", sans-serif); overscroll-behavior: contain; }\n.xsdsh-config *, .xsdsh-config *::before, .xsdsh-config *::after { box-sizing: border-box; }\n.xsdsh-config h2, .xsdsh-config h3, .xsdsh-config p { margin: 0; }\n.xsdsh-config h2 { font-size: 13px; font-weight: 650; }\n.xsdsh-config h3 { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 5px; font-size: 12px; font-weight: 650; }\n.xsdsh-config button, .xsdsh-config input { font: inherit; color: inherit; border: 1px solid var(--xsdsh-line, #e4e9f0); border-radius: 8px; }\n.xsdsh-config button { cursor: pointer; padding: 4px 11px; background: var(--xsdsh-panel, #fff); white-space: nowrap; transition: background .15s var(--xsdsh-ease), border-color .15s var(--xsdsh-ease); }\n.xsdsh-config button:hover:not(:disabled) { background: var(--xsdsh-hover, #eef3f9); border-color: var(--xsdsh-line-hover, #aab7c8); }\n.xsdsh-config button:focus-visible, .xsdsh-config input:focus-visible { outline: 2px solid var(--xsdsh-accent, #2563eb); outline-offset: 2px; }\n.xsdsh-config button:disabled, .xsdsh-config input:disabled { opacity: .45; cursor: not-allowed; }\n.xsdsh-config input { display: block; width: 100%; min-width: 0; padding: 6px 9px; background: var(--xsdsh-panel, #fff); }\n.xsdsh-config input[type="checkbox"] { display: inline-block; width: auto; margin-right: 6px; accent-color: var(--xsdsh-accent, #2563eb); }\n.xsdsh-config input::placeholder { color: var(--xsdsh-faint, #7b899b); }\n.xsdsh-config .xsdsh-config-primary { border-color: var(--xsdsh-accent, #2563eb); background: var(--xsdsh-accent-soft, #e8f0ff); color: var(--xsdsh-accent, #2563eb); }\n.xsdsh-config .xsdsh-config-primary:hover:not(:disabled) { background: var(--xsdsh-accent-bg, #e8f0ff); }\n.xsdsh-config .xsdsh-config-delete { color: var(--xsdsh-bad, #d92d20); border-color: var(--xsdsh-danger-line, #f0b4b0); align-self: end; }\n.xsdsh-config .xsdsh-config-delete:hover:not(:disabled) { background: var(--xsdsh-danger-bg, #fef3f2); border-color: var(--xsdsh-danger-line, #f0b4b0); }\n.xsdsh-config .xsdsh-config-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 10px 0 6px; }\n.xsdsh-config .xsdsh-config-heading { position: sticky; top: 0; z-index: 3; margin-top: 0; padding: 6px 0 5px; background: var(--xsdsh-panel, #fff); border-bottom: 1px solid var(--xsdsh-line2, #edf1f5); }\n.xsdsh-config .xsdsh-config-actions { display: flex; gap: 6px; margin-left: auto; }\n.xsdsh-config .xsdsh-config-add { margin-left: auto; }\n.xsdsh-config .xsdsh-config-tag { padding: 1px 6px; border-radius: 5px; color: var(--xsdsh-mute, #5b6b80); background: var(--xsdsh-mut-soft, #f1f5f9); font-size: 10.5px; font-weight: 400; }\n.xsdsh-config .xsdsh-config-card { border: 1px solid var(--xsdsh-line, #e4e9f0); border-radius: 9px; background: var(--xsdsh-panel2, #f8fafc); padding: 11px 13px; margin-top: 9px; }\n.xsdsh-config .xsdsh-config-hint { color: var(--xsdsh-mute, #5b6b80); font-size: 11.5px; overflow-wrap: anywhere; }\n.xsdsh-config .xsdsh-config-card > .xsdsh-config-hint:last-child { margin-top: 8px; }\n.xsdsh-config .xsdsh-config-fofa { max-width: 460px; margin-top: 6px; }\n.xsdsh-config .xsdsh-config-fields { margin: 0; padding: 0; border: 0; min-width: 0; }\n.xsdsh-config .xsdsh-config-vps-list { display: flex; flex-direction: column; gap: 6px; }\n.xsdsh-config .xsdsh-config-vps-row { display: flex; align-items: end; gap: 6px; flex-wrap: wrap; padding: 8px; border: 1px solid var(--xsdsh-line, #e4e9f0); border-radius: 8px; background: var(--xsdsh-panel2, #f8fafc); content-visibility: auto; contain-intrinsic-size: auto 64px; }\n.xsdsh-config .xsdsh-config-vps-row label { font-size: 10.5px; color: var(--xsdsh-mute, #5b6b80); }\n.xsdsh-config .xsdsh-config-vps-row input { margin-top: 3px; color: var(--xsdsh-ink, #101828); font-size: 12px; }\n.xsdsh-config .xsdsh-config-name { flex: 0 1 100px; min-width: 80px; }\n.xsdsh-config .xsdsh-config-host { flex: 1 1 150px; min-width: 130px; }\n.xsdsh-config .xsdsh-config-port { flex: 0 0 72px; min-width: 64px; }\n.xsdsh-config .xsdsh-config-key { flex: 1.3 1 190px; min-width: 150px; display: flex; flex-direction: column; gap: 3px; }\n.xsdsh-config .xsdsh-config-key-line { display: flex; gap: 6px; align-items: center; }\n.xsdsh-config .xsdsh-config-key-line input { flex: 1; min-width: 0; margin-top: 0; }\n.xsdsh-config .xsdsh-config-pick { flex: none; }\n.xsdsh-config .xsdsh-config-file { display: none; }\n.xsdsh-config .xsdsh-config-empty { padding: 14px; border: 1px dashed var(--xsdsh-line, #e4e9f0); border-radius: 8px; text-align: center; color: var(--xsdsh-mute, #5b6b80); }\n.xsdsh-config .xsdsh-config-target { display: flex; gap: 8px; flex-wrap: wrap; overflow-wrap: anywhere; }\n.xsdsh-config .xsdsh-config-target code { color: var(--xsdsh-mute, #5b6b80); }\n.xsdsh-config .xsdsh-config-status { margin: 8px 0; min-height: 19px; color: var(--xsdsh-mute, #5b6b80); }\n.xsdsh-config .xsdsh-config-error, .xsdsh-config .xsdsh-config-confirm { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin: 8px 0; padding: 10px; border-radius: 8px; overflow-wrap: anywhere; }\n.xsdsh-config .xsdsh-config-error { color: var(--xsdsh-bad, #c0555a); background: var(--xsdsh-bad-soft, #fef3f2); border: 1px solid var(--xsdsh-bad-line, #f0b4b0); }\n.xsdsh-config .xsdsh-config-confirm { color: var(--xsdsh-warn, #b07d2a); background: var(--xsdsh-warn-soft, #fff8ed); border: 1px solid var(--xsdsh-warn-line, #e5cda4); }\n.xsdsh-config .xsdsh-config-table-wrap { overflow-x: auto; margin-top: 8px; }\n.xsdsh-config table { width: 100%; border-collapse: collapse; text-align: left; font-size: 11.5px; }\n.xsdsh-config th, .xsdsh-config td { padding: 8px; border-bottom: 1px solid var(--xsdsh-line2, #edf1f5); vertical-align: top; }\n.xsdsh-config thead { background: var(--xsdsh-panel2, #f8fafc); color: var(--xsdsh-mute, #5b6b80); }\n.xsdsh-config tbody th { font-family: var(--xsdsh-font-ui, "Segoe UI", "Microsoft YaHei", sans-serif); font-weight: 500; }\n.xsdsh-config .xsdsh-config-effective-vps { list-style: none; padding: 0; margin: 8px 0 0; }\n.xsdsh-config .xsdsh-config-effective-vps li { display: flex; flex-wrap: wrap; gap: 10px; padding: 4px 8px; overflow-wrap: anywhere; }\n.xsdsh-config code { font-family: var(--xsdsh-font-ui, "Segoe UI", "Microsoft YaHei", sans-serif); }\n@media (max-width: 540px) {\n  .xsdsh-config .xsdsh-config-card { padding: 10px; }\n  .xsdsh-config .xsdsh-config-name { flex: 1 1 100px; }\n  .xsdsh-config .xsdsh-config-port { flex: 0 0 72px; }\n  .xsdsh-config .xsdsh-config-key { flex-basis: 100%; }\n  .xsdsh-config th, .xsdsh-config td { padding: 6px; }\n}\n';

// src/ui/features/config/model.ts
function object2(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label}格式无效`);
  return value;
}
function text(value) {
  return typeof value === "string" ? value : "";
}
var rowSequence = 0;
var VPS_ID_RE = /^[\w.-]+$/;
function nextVpsId() {
  const cryptoApi = globalThis.crypto;
  const uuid = typeof cryptoApi?.randomUUID === "function" ? cryptoApi.randomUUID() : "";
  if (VPS_ID_RE.test(uuid)) return uuid;
  return `vps-${Date.now().toString(36)}-${++rowSequence}`;
}
function emptyVpsRow() {
  return { rowKey: `vps-${++rowSequence}`, name: "", host: "", port: "22", key: "" };
}
function newVpsRow() {
  return { ...emptyVpsRow(), id: nextVpsId() };
}
function hasInlinePort(host) {
  const at = host.lastIndexOf("@");
  const address = at >= 0 ? host.slice(at + 1) : host;
  if (address.startsWith("[") && address.endsWith("]")) return false;
  const colons = (address.match(/:/g) || []).length;
  if (colons === 0) return false;
  if (colons >= 2 && /^[0-9a-f:.]+$/i.test(address)) return false;
  return true;
}
function readRows(value, assignIds = false) {
  if (value === void 0) return [];
  if (!Array.isArray(value)) throw new Error("VPS 列表格式无效");
  return value.map((value2) => {
    const row = object2(value2, "VPS");
    const id = typeof row.id === "string" && row.id ? row.id : assignIds ? nextVpsId() : void 0;
    return {
      ...emptyVpsRow(),
      ...id ? { id } : {},
      name: text(row.name),
      host: text(row.host),
      port: String(row.port ?? 22),
      key: text(row.key)
    };
  });
}
function serializeVps(rows) {
  const active = rows.filter((row) => row.host.trim());
  if (active.length > 100) throw new Error("VPS 最多保存 100 台");
  const ids = /* @__PURE__ */ new Set();
  return active.map((row, index) => {
    const host = row.host.trim();
    const portText = row.port.trim() || "22";
    const port = Number(portText);
    if (!/^\d+$/.test(portText) || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`第 ${index + 1} 台 VPS 的端口须为 1–65535`);
    if (/\s|[/?#]/.test(host)) throw new Error(`第 ${index + 1} 台 VPS 请填写主机或 user@host，端口单独填写`);
    if (hasInlinePort(host)) throw new Error(`第 ${index + 1} 台 VPS 请把端口填到端口列，主机里不要写 host:port`);
    const key = row.key.trim();
    if (key && (!/^(?:[A-Za-z]:[\\/]|\/|\\\\)/.test(key) || /[\r\n]|-----BEGIN/.test(key))) {
      throw new Error(`第 ${index + 1} 台 VPS 的私钥请填写绝对路径，不要粘贴私钥内容`);
    }
    if (/[\u0000-\u001f\u007f]/.test(row.name + host + key)) throw new Error(`第 ${index + 1} 台 VPS 含无效控制字符`);
    let id = row.id && VPS_ID_RE.test(row.id) && !ids.has(row.id) ? row.id : nextVpsId();
    while (ids.has(id)) id = nextVpsId();
    ids.add(id);
    return { id, name: row.name.trim(), host, port, key };
  });
}
function savePayload(scope, draft) {
  const vps = serializeVps(draft.vps);
  const fofa = draft.fofa.trim();
  if (/[\u0000-\u001f\u007f]/.test(fofa)) throw new Error("FOFA_KEY 不能包含换行或控制字符");
  if (scope.kind === "global") return { op: "platformConfigSave", config: { env: { FOFA_KEY: fofa }, vps } };
  if (!scope.engagement.trim()) throw new Error("请先选择目标");
  return { op: "engagementConfigSave", engagement: scope.engagement, config: { fofa_key: fofa, vps } };
}
function parseSnapshot(value, scope) {
  const result = object2(value, "响应");
  if (result.ok !== true) throw new Error(text(result.error) || "配置请求失败");
  if (scope.kind === "target" && result.engagement !== scope.engagement) throw new Error("返回的目标与当前目标不一致，请重试");
  const config = object2(result.config, "配置");
  if (config.error) throw new Error(`配置读取失败：${text(config.error) || "文件无效"}`);
  const env = scope.kind === "global" ? object2(config.env ?? {}, "环境配置") : {};
  const compatibility = result.compatibility ? object2(result.compatibility, "兼容信息") : {};
  const invalidLocalVps = !!config.vps_error || Object.prototype.hasOwnProperty.call(config, "vps_invalid");
  const vpsError = text(config.vps_error) || text(compatibility.vps_error) || (invalidLocalVps ? "已保存的 VPS 格式无效" : "");
  const effective = result.effective ? object2(result.effective, "生效配置") : null;
  const sources = result.sources ? object2(result.sources, "配置来源") : null;
  if (scope.kind === "target" && (!effective || !sources)) throw new Error("目标配置响应缺少生效配置或来源，请重试");
  return {
    vpsError,
    vpsRepairRequired: invalidLocalVps || scope.kind === "global" && !!vpsError,
    draft: { fofa: text(scope.kind === "global" ? env.FOFA_KEY : config.fofa_key), vps: invalidLocalVps ? [] : readRows(config.vps, true) },
    effective: effective ? { fofa: text(effective.fofa_key), vps: readRows(effective.vps).filter((row) => row.host.trim()).map((row) => ({
      ...row.id ? { id: row.id } : {},
      name: row.name,
      host: row.host,
      port: Number(row.port),
      key: row.key
    })) } : null,
    sources: sources ? { fofa: text(sources.fofa_key), vps: text(sources.vps) } : null,
    updatedAt: text(config.updated_at),
    legacyVps: compatibility.vps_format === "legacy" || !Array.isArray(config.vps) && !!text(env.REDTEAM_VPS_HOST)
  };
}
function sourceLabel(source) {
  return { target: "本目标", global: "全局配置", process: "兼容来源 · 进程环境", dotenv: "兼容来源 · .env", none: "未配置" }[source] || `未知来源（${source || "未返回"}）`;
}

// src/ui/features/config/controller.ts
var ConfigRequestError = class extends Error {
  constructor(result, status) {
    const partial = result.partial_save === true || result.error_kind === "partial_save";
    const detail = typeof result.error === "string" ? result.error : typeof result.message === "string" ? result.message : "配置请求失败";
    super(`${partial ? "部分保存失败：已有内容写入磁盘。" : ""}${detail}${status ? `（HTTP ${status}）` : ""}`);
    const saved = result.saved && typeof result.saved === "object" ? result.saved : {};
    this.partialSave = partial ? {
      saved: { config: typeof saved.config === "boolean" ? saved.config : null, metadata: typeof saved.metadata === "boolean" ? saved.metadata : null },
      recovery: typeof result.recovery === "string" ? result.recovery : "请核实磁盘状态后重试保存。",
      cleanupErrors: Array.isArray(result.cleanup_errors) ? result.cleanup_errors.map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return [item.path, item.error].filter((value) => typeof value === "string").join("：");
        return "临时文件清理失败";
      }) : []
    } : null;
  }
};
var requestConfig = async (payload, signal) => {
  const response = await fetch("/redteam/api", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal
  });
  let result;
  try {
    result = object2(await response.json(), "响应");
  } catch {
    throw new Error(response.ok ? "服务器返回了无效的 JSON 响应" : `配置请求失败（HTTP ${response.status}）`);
  }
  if (!response.ok || result.ok !== true) {
    throw new ConfigRequestError(result, response.ok ? void 0 : response.status);
  }
  return result;
};
function draftChanged(a, b) {
  if (!b) return false;
  if (a.fofa !== b.fofa || a.vps.length !== b.vps.length) return true;
  for (let index = 0; index < a.vps.length; index++) {
    const x = a.vps[index], y = b.vps[index];
    if (x.rowKey !== y.rowKey || x.name !== y.name || x.host !== y.host || x.port !== y.port || x.key !== y.key) return true;
  }
  return false;
}
function mergeSavedIds(submitted, response) {
  const rawConfig = response.config;
  const config = rawConfig && typeof rawConfig === "object" && !Array.isArray(rawConfig) ? rawConfig : null;
  const saved = config && Array.isArray(config.vps) ? config.vps : [];
  if (!saved.length) return submitted;
  const active = submitted.vps.filter((row) => row.host.trim());
  const ids = /* @__PURE__ */ new Map();
  active.forEach((row, index) => {
    const item = saved[index];
    if (!item || typeof item !== "object" || Array.isArray(item)) return;
    const id = item.id;
    if (typeof id === "string" && id) ids.set(row.rowKey, id);
  });
  let changed = false;
  const vps = submitted.vps.map((row) => {
    const id = ids.get(row.rowKey);
    if (!id || id === row.id) return row;
    changed = true;
    return { ...row, id };
  });
  return changed ? { ...submitted, vps } : submitted;
}
function createConfigController(scope, request = requestConfig) {
  let state = { snapshot: null, draft: null, baseline: null, busy: null, error: "", retry: null, notice: "", repairConfirmed: false, partialSave: null, dirty: false };
  let generation = 0;
  let active;
  let timeout;
  const listeners = /* @__PURE__ */ new Set();
  const publish = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  const cancel = () => {
    generation++;
    active?.abort();
    if (timeout) clearTimeout(timeout);
    active = void 0;
  };
  const run = async (operation) => {
    if (operation === "save" && (state.busy || !state.draft)) return;
    if (operation === "save" && state.snapshot?.vpsRepairRequired && !state.repairConfirmed) {
      publish({ error: "原 VPS 配置损坏；请先明确确认用编辑列表修复 / 替换，才能保存。", retry: null });
      return;
    }
    if (scope.kind === "target" && !scope.engagement.trim()) {
      publish({ error: "请先选择目标", retry: null });
      return;
    }
    let payload;
    const submitted = state.draft;
    try {
      payload = operation === "save" ? savePayload(scope, submitted) : scope.kind === "global" ? { op: "platformConfigGet" } : { op: "engagementConfigGet", engagement: scope.engagement };
    } catch (error) {
      publish({ error: error instanceof Error ? error.message : "配置校验失败", retry: "save", notice: "" });
      return;
    }
    cancel();
    const ticket = generation;
    const controller = new AbortController();
    active = controller;
    publish({ busy: operation, error: "", retry: null, notice: "" });
    timeout = setTimeout(() => {
      if (ticket !== generation) return;
      cancel();
      publish({ busy: null, error: operation === "save" ? "保存请求超时，服务器可能已写入；输入已保留，可重试保存或刷新核实。" : "加载配置超时，请重试。", retry: operation });
    }, 2e4);
    try {
      const result = await request(payload, controller.signal);
      if (ticket !== generation || controller.signal.aborted) return;
      const response = object2(result, "响应");
      if (response.ok !== true) throw new ConfigRequestError(response);
      const snapshot = parseSnapshot(response, scope);
      const draft = operation === "save" ? mergeSavedIds(submitted, response) : snapshot.draft;
      publish({
        snapshot,
        draft,
        baseline: draft,
        busy: null,
        repairConfirmed: false,
        partialSave: null,
        dirty: false,
        notice: operation === "save" ? "配置已保存。生效来源已按服务器结果更新。" : "配置已加载。"
      });
    } catch (error) {
      if (ticket !== generation || controller.signal.aborted) return;
      publish({
        busy: null,
        error: error instanceof Error ? error.message : "配置请求失败",
        retry: operation,
        partialSave: error instanceof ConfigRequestError && error.partialSave ? error.partialSave : state.partialSave
      });
    } finally {
      if (ticket === generation) {
        if (timeout) clearTimeout(timeout);
        active = void 0;
      }
    }
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load: () => run("load"),
    save: () => run("save"),
    cancel,
    retry: () => run(state.retry || "load"),
    confirmRepair: (confirmed) => {
      if (!state.busy) publish({ repairConfirmed: confirmed });
    },
    edit: (draft) => {
      if (state.busy) return;
      publish({
        draft,
        notice: "",
        error: "",
        retry: null,
        dirty: draftChanged(draft, state.baseline),
        repairConfirmed: state.snapshot?.vpsRepairRequired ? JSON.stringify(draft.vps) === JSON.stringify(state.draft?.vps) && state.repairConfirmed : state.repairConfirmed
      });
    },
    isDirty: () => state.dirty
  };
}

// src/ui/components/SecretInput.tsx
function SecretInput(props) {
  const [shown, setShown] = react_default.useState(false);
  return /* @__PURE__ */ h("span", { className: "purge-secret" + (props.className ? " " + props.className : "") }, /* @__PURE__ */ h(
    "input",
    {
      id: props.id,
      className: "purge-secret-input" + (props.inputClassName ? " " + props.inputClassName : ""),
      type: shown ? "text" : "password",
      value: props.value,
      placeholder: props.placeholder,
      "aria-label": props["aria-label"],
      disabled: props.disabled,
      autoComplete: "new-password",
      spellCheck: false,
      onChange: (event) => props.onChange(event.target.value)
    }
  ), /* @__PURE__ */ h(
    "button",
    {
      type: "button",
      className: "purge-secret-eye",
      "aria-label": shown ? "隐藏内容" : "显示内容",
      "aria-pressed": shown,
      title: shown ? "隐藏内容" : "显示内容",
      onMouseDown: (event) => event.preventDefault(),
      onClick: () => setShown((value) => !value)
    },
    /* @__PURE__ */ h("svg", { viewBox: "0 0 24 24", width: "16", height: "16", "aria-hidden": "true", focusable: "false" }, shown ? /* @__PURE__ */ h("g", { fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ h("path", { d: "M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" }), /* @__PURE__ */ h("circle", { cx: "12", cy: "12", r: "2.6" }), /* @__PURE__ */ h("path", { d: "M4 4l16 16" })) : /* @__PURE__ */ h("g", { fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ h("path", { d: "M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" }), /* @__PURE__ */ h("circle", { cx: "12", cy: "12", r: "2.6" })))
  ));
}

// src/ui/features/config/ConfigPages.tsx
function GlobalConnectionConfig({ request }) {
  return /* @__PURE__ */ react_default.createElement(ConfigEditor, { scope: { kind: "global" }, request });
}
function TargetConfigPage({ engagement, targetName, request }) {
  if (!engagement?.trim()) return /* @__PURE__ */ react_default.createElement("section", { className: "xsdsh-config", "aria-label": "目标配置" }, /* @__PURE__ */ react_default.createElement("style", null, config_default), /* @__PURE__ */ react_default.createElement("h2", null, "目标配置"), /* @__PURE__ */ react_default.createElement("p", { role: "status", className: "xsdsh-config-empty" }, "请先选择目标，再编辑此目标的 FOFA_KEY 与 VPS。"));
  return /* @__PURE__ */ react_default.createElement(ConfigEditor, { key: engagement, scope: { kind: "target", engagement }, targetName, request });
}
var hostPaths = () => typeof window === "undefined" ? void 0 : window.__DSH_HOST_PATHS__;
var VpsRow = react_default.memo(function VpsRow2({ row, index, onChange, onRemove }) {
  const file = react_default.useRef(null);
  const [notice, setNotice] = react_default.useState("");
  const keyId = react_default.useId();
  const choose = () => {
    const bridge = hostPaths();
    if (!bridge || typeof bridge.pathFor !== "function") {
      setNotice("当前环境无法读取绝对路径，请手动填写。");
      return;
    }
    setNotice("");
    file.current?.click();
  };
  const picked = (event) => {
    const target = event.target;
    const pickedFile = target.files && target.files[0];
    target.value = "";
    if (!pickedFile) return;
    try {
      const path = hostPaths()?.pathFor?.(pickedFile);
      if (typeof path === "string" && path.trim()) {
        onChange(row.rowKey, "key", path);
        setNotice("");
      } else setNotice("没有取到绝对路径，请手动填写。");
    } catch {
      setNotice("读取路径失败，请手动填写。");
    }
  };
  return /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-config-vps-row", role: "group", "aria-label": `VPS ${index + 1}` }, /* @__PURE__ */ react_default.createElement("label", { className: "xsdsh-config-name" }, "名称", /* @__PURE__ */ react_default.createElement("input", { "aria-label": `VPS ${index + 1} 名称`, value: row.name, placeholder: "名称（可选）", onChange: (event) => onChange(row.rowKey, "name", event.target.value) })), /* @__PURE__ */ react_default.createElement("label", { className: "xsdsh-config-host" }, "主机", /* @__PURE__ */ react_default.createElement("input", { "aria-label": `VPS ${index + 1} 主机`, value: row.host, placeholder: "user@host", spellCheck: false, autoCapitalize: "none", onChange: (event) => onChange(row.rowKey, "host", event.target.value) })), /* @__PURE__ */ react_default.createElement("label", { className: "xsdsh-config-port" }, "端口", /* @__PURE__ */ react_default.createElement("input", { "aria-label": `VPS ${index + 1} 端口`, inputMode: "numeric", value: row.port, placeholder: "22", onChange: (event) => onChange(row.rowKey, "port", event.target.value) })), /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-config-key" }, /* @__PURE__ */ react_default.createElement("label", { htmlFor: keyId }, "私钥绝对路径"), /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-config-key-line" }, /* @__PURE__ */ react_default.createElement("input", { id: keyId, "aria-label": `VPS ${index + 1} 私钥绝对路径`, value: row.key, placeholder: "本机私钥绝对路径（可选）", spellCheck: false, autoCapitalize: "none", onChange: (event) => onChange(row.rowKey, "key", event.target.value) }), /* @__PURE__ */ react_default.createElement("button", { type: "button", className: "xsdsh-config-pick", "aria-label": `选择 VPS ${index + 1} 私钥文件`, onClick: choose }, "选择文件…")), /* @__PURE__ */ react_default.createElement("input", { ref: file, type: "file", className: "xsdsh-config-file", tabIndex: -1, "aria-hidden": "true", onChange: picked }), notice && /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-config-hint", role: "status" }, notice)), /* @__PURE__ */ react_default.createElement("button", { type: "button", className: "xsdsh-config-delete", "aria-label": `删除 VPS ${index + 1}`, onClick: () => onRemove(row.rowKey) }, "删除"));
});
function VpsEditor({ rows, onChange, target }) {
  const active = rows.filter((row) => row.host.trim()).length;
  const rowsRef = react_default.useRef(rows);
  rowsRef.current = rows;
  const update = react_default.useCallback((rowKey, key, value) => {
    onChange(rowsRef.current.map((row) => row.rowKey === rowKey ? { ...row, [key]: value } : row));
  }, [onChange]);
  const remove = react_default.useCallback((rowKey) => {
    onChange(rowsRef.current.filter((row) => row.rowKey !== rowKey));
  }, [onChange]);
  return /* @__PURE__ */ react_default.createElement("section", { className: "xsdsh-config-card", "aria-label": target ? "本目标 VPS" : "全局 VPS" }, /* @__PURE__ */ react_default.createElement("h3", null, target ? "本目标 VPS" : "全局 VPS 列表", target && /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-config-tag" }, "可覆盖全局")), /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-config-hint" }, target ? "有主机的条目将整体覆盖全局 VPS；列表为空时继承全局。" : "为所有目标提供默认配置；目标填写自己的 VPS 后，整体使用目标列表。"), /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-config-toolbar" }, /* @__PURE__ */ react_default.createElement("strong", null, "VPS 列表"), /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-config-hint" }, "编辑中 ", active, " 台", rows.length > active ? ` · ${rows.length - active} 行无主机，不计入保存` : ""), /* @__PURE__ */ react_default.createElement("button", { type: "button", className: "xsdsh-config-add", onClick: () => onChange([...rows, newVpsRow()]) }, "+ 添加 VPS")), rows.length === 0 && /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-config-empty" }, target ? "尚未填写本目标 VPS；保存后沿用全局或兼容来源。" : "尚未填写全局 VPS；需要时可添加。"), /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-config-vps-list" }, rows.map((row, index) => /* @__PURE__ */ react_default.createElement(VpsRow, { key: row.rowKey, row, index, onChange: update, onRemove: remove }))), /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-config-hint" }, "主机非空才计入保存；端口可编辑（默认 22）。私钥仅保存路径，不读取文件内容。"));
}
function EffectiveConfig({ snapshot, target, dirty }) {
  const saved = snapshot.draft;
  const effective = snapshot.effective;
  const sources = snapshot.sources;
  return /* @__PURE__ */ react_default.createElement("section", { className: "xsdsh-config-card", "aria-label": "最终生效来源" }, /* @__PURE__ */ react_default.createElement("h3", null, "最终生效来源", /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-config-tag" }, "服务器最近确认")), /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-config-hint" }, dirty ? "存在未保存修改；以下仍为服务器最近确认的配置。" : "已配置仅表示有配置值，不表示密钥有效或 VPS 已连通。"), /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-config-table-wrap" }, /* @__PURE__ */ react_default.createElement("table", null, /* @__PURE__ */ react_default.createElement("thead", null, /* @__PURE__ */ react_default.createElement("tr", null, /* @__PURE__ */ react_default.createElement("th", null, "配置项"), /* @__PURE__ */ react_default.createElement("th", null, target ? "本目标已保存" : "全局已保存"), /* @__PURE__ */ react_default.createElement("th", null, "实际生效"), /* @__PURE__ */ react_default.createElement("th", null, "来源"))), /* @__PURE__ */ react_default.createElement("tbody", null, /* @__PURE__ */ react_default.createElement("tr", null, /* @__PURE__ */ react_default.createElement("th", { scope: "row" }, "FOFA_KEY"), /* @__PURE__ */ react_default.createElement("td", null, saved.fofa.trim() ? "已配置" : "未填写"), /* @__PURE__ */ react_default.createElement("td", null, effective ? effective.fofa ? "已配置 · 未验证" : "未配置" : "接口未返回"), /* @__PURE__ */ react_default.createElement("td", null, sources ? sourceLabel(sources.fofa) : "接口未返回")), /* @__PURE__ */ react_default.createElement("tr", null, /* @__PURE__ */ react_default.createElement("th", { scope: "row" }, "VPS"), /* @__PURE__ */ react_default.createElement("td", null, snapshot.vpsRepairRequired ? "读取失败 · 原配置待修复" : `${saved.vps.filter((row) => row.host.trim()).length} 台`), /* @__PURE__ */ react_default.createElement("td", null, effective ? `${effective.vps.length} 台${effective.vps.length ? " · 未验证连通性" : " · 未配置"}` : "接口未返回"), /* @__PURE__ */ react_default.createElement("td", null, sources ? sourceLabel(sources.vps) : "接口未返回", snapshot.legacyVps && " · 旧版 HOST/KEY"))))), !!effective?.vps.length && /* @__PURE__ */ react_default.createElement("ul", { className: "xsdsh-config-effective-vps" }, effective.vps.map((row, index) => /* @__PURE__ */ react_default.createElement("li", { key: `${row.id || row.host}-${index}` }, /* @__PURE__ */ react_default.createElement("span", null, row.name || `VPS ${index + 1}`), /* @__PURE__ */ react_default.createElement("code", null, row.port === 22 ? row.host : `${row.host}:${row.port}`), /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-config-hint" }, row.key ? "已配置私钥路径" : "未配置私钥路径")))), snapshot.legacyVps && /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-config-hint" }, "检测到旧版 VPS 配置。新增列表非空时整体覆盖；清空列表后可能再次使用兼容来源。"), !effective && /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-config-hint" }, "当前平台接口仅返回已保存配置；目标页可查看最终生效来源。"));
}
function ConfigEditor({ scope, targetName, request }) {
  const kind = scope.kind;
  const identity = scope.kind === "target" ? scope.engagement : "";
  const controller = react_default.useMemo(() => createConfigController(
    kind === "target" ? { kind, engagement: identity } : { kind },
    request
  ), [kind, identity, request]);
  const state = react_default.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const [confirmRefresh, setConfirmRefresh] = react_default.useState(false);
  const inputId = react_default.useId();
  react_default.useEffect(() => {
    void controller.load();
    return controller.cancel;
  }, [controller]);
  const target = scope.kind === "target";
  const dirty = state.dirty;
  const draft = state.draft;
  const draftRef = react_default.useRef(draft);
  draftRef.current = draft;
  const edit = react_default.useCallback((patch) => {
    const current = draftRef.current;
    if (current) controller.edit({ ...current, ...patch });
  }, [controller]);
  const setVps = react_default.useCallback((vps) => edit({ vps }), [edit]);
  const refresh = () => {
    if (dirty || state.partialSave) setConfirmRefresh(true);
    else void controller.load();
  };
  return /* @__PURE__ */ react_default.createElement("section", { className: "xsdsh-config", "data-xsdsh-ui": "config", "aria-label": target ? "目标配置" : "全局密钥与 VPS", "aria-busy": !!state.busy }, /* @__PURE__ */ react_default.createElement("style", null, config_default), /* @__PURE__ */ react_default.createElement("form", { onSubmit: (event) => {
    event.preventDefault();
    setConfirmRefresh(false);
    void controller.save();
  } }, /* @__PURE__ */ react_default.createElement("header", { className: "xsdsh-config-toolbar xsdsh-config-heading" }, /* @__PURE__ */ react_default.createElement("h2", null, target ? "目标配置" : "全局密钥与 VPS"), /* @__PURE__ */ react_default.createElement("span", { className: "xsdsh-config-tag" }, target ? "只作用于当前目标" : "所有目标默认继承"), /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-config-actions" }, /* @__PURE__ */ react_default.createElement("button", { type: "button", disabled: !!state.busy, onClick: refresh }, "刷新"), /* @__PURE__ */ react_default.createElement("button", { type: "submit", className: "xsdsh-config-primary", disabled: !draft || !!state.busy || !!state.snapshot?.vpsRepairRequired && !state.repairConfirmed }, state.busy === "save" ? "保存中…" : "保存"))), target && /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-config-target" }, "当前目标：", /* @__PURE__ */ react_default.createElement("strong", null, targetName || identity), targetName && targetName !== identity && /* @__PURE__ */ react_default.createElement("code", null, identity)), confirmRefresh && /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-config-confirm", role: "group", "aria-label": "确认刷新" }, /* @__PURE__ */ react_default.createElement("span", null, "刷新会丢弃当前未保存的输入。"), /* @__PURE__ */ react_default.createElement("button", { type: "button", onClick: () => {
    setConfirmRefresh(false);
    void controller.load();
  } }, "丢弃修改并刷新"), /* @__PURE__ */ react_default.createElement("button", { type: "button", onClick: () => setConfirmRefresh(false) }, "继续编辑")), /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-config-status", role: "status", "aria-live": "polite" }, state.busy === "load" ? "正在加载配置…" : state.busy === "save" ? "正在保存配置…" : dirty ? "有未保存的修改" : state.notice), state.error && /* @__PURE__ */ react_default.createElement("div", { className: "xsdsh-config-error", role: "alert" }, /* @__PURE__ */ react_default.createElement("span", null, state.error, draft && "；当前输入已保留。"), state.retry && /* @__PURE__ */ react_default.createElement("button", { type: "button", disabled: !!state.busy, onClick: () => void controller.retry() }, state.retry === "save" ? "重试保存" : "重试加载")), state.partialSave && /* @__PURE__ */ react_default.createElement("section", { className: "xsdsh-config-error", role: "alert", "aria-label": "部分保存结果" }, /* @__PURE__ */ react_default.createElement("strong", null, "部分内容已写入，保存尚未完整完成。"), /* @__PURE__ */ react_default.createElement("span", null, "config.json：", state.partialSave.saved.config === null ? "未确认" : state.partialSave.saved.config ? "已写入" : "未写入", "。"), /* @__PURE__ */ react_default.createElement("span", null, "恢复建议：", state.partialSave.recovery), /* @__PURE__ */ react_default.createElement("span", null, "当前草稿已保留，可重试保存；刷新会重新读取磁盘内容并丢弃草稿。下方来源表不是本次部分写入后的状态。"), !!state.partialSave.cleanupErrors.length && /* @__PURE__ */ react_default.createElement("ul", { "aria-label": "清理错误" }, state.partialSave.cleanupErrors.map((error, index) => /* @__PURE__ */ react_default.createElement("li", { key: index }, error)))), state.snapshot?.vpsError && /* @__PURE__ */ react_default.createElement("section", { className: "xsdsh-config-error", role: "alert", "aria-label": "VPS 配置损坏" }, /* @__PURE__ */ react_default.createElement("strong", null, "检测到损坏的 VPS 配置"), /* @__PURE__ */ react_default.createElement("span", null, state.snapshot.vpsError), state.snapshot.vpsRepairRequired ? /* @__PURE__ */ react_default.createElement(react_default.Fragment, null, /* @__PURE__ */ react_default.createElement("span", null, "磁盘上的原 VPS 未被清空；当前空列表是读取失败的结果。请重新填写 VPS，或明确确认清空。普通保存已阻止，FOFA 仍可查看和编辑。"), /* @__PURE__ */ react_default.createElement("label", null, /* @__PURE__ */ react_default.createElement("input", { type: "checkbox", disabled: !!state.busy, checked: state.repairConfirmed, onChange: (event) => controller.confirmRepair(event.target.checked) }), "我确认保存时用当前编辑列表替换损坏的 VPS 配置（", draft?.vps.filter((row) => row.host.trim()).length || 0, " 台；0 台将清空原列表）。")) : /* @__PURE__ */ react_default.createElement("span", null, "全局 VPS 无法正常读取，请前往全局配置修复。本目标保存不会修复或覆盖损坏的全局配置。")), draft && /* @__PURE__ */ react_default.createElement("fieldset", { disabled: !!state.busy, className: "xsdsh-config-fields" }, target && /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-config-hint" }, "目标配置非空时覆盖全局；目标留空时继承全局。旧版环境变量的兼容来源会单独显示。"), /* @__PURE__ */ react_default.createElement("section", { className: "xsdsh-config-card" }, /* @__PURE__ */ react_default.createElement("h3", null, /* @__PURE__ */ react_default.createElement("label", { htmlFor: `${inputId}-fofa` }, target ? "本目标 FOFA_KEY" : "全局 FOFA_KEY")), /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-config-hint" }, target ? "仅供当前目标使用。留空时继承全局；可用的旧版配置会显示在最终来源中。" : "目标留空时使用此值；全局留空后，仍可能存在进程环境或 .env 的兼容配置。"), /* @__PURE__ */ react_default.createElement(SecretInput, { className: "xsdsh-config-fofa", id: `${inputId}-fofa`, value: draft.fofa, placeholder: target ? "留空 = 继承全局" : "填写 FOFA_KEY", "aria-label": target ? "本目标 FOFA_KEY" : "全局 FOFA_KEY", onChange: (value) => edit({ fofa: value }) })), /* @__PURE__ */ react_default.createElement(VpsEditor, { rows: draft.vps, target, onChange: setVps })), state.snapshot && /* @__PURE__ */ react_default.createElement(EffectiveConfig, { snapshot: state.snapshot, target, dirty }), state.snapshot?.updatedAt && /* @__PURE__ */ react_default.createElement("p", { className: "xsdsh-config-hint" }, "最后保存：", /* @__PURE__ */ react_default.createElement("time", { dateTime: state.snapshot.updatedAt }, state.snapshot.updatedAt))));
}

// src/ui/features/drill/index.ts
var drill_exports = {};
__export(drill_exports, {
  CSS: () => drill_default,
  DrillContent: () => DrillContent,
  DrillFooter: () => DrillFooter,
  DrillToolbar: () => DrillToolbar,
  GLOBAL_PAGES: () => GLOBAL_PAGES,
  REDTEAM_PAGES: () => REDTEAM_PAGES,
  TargetPrompts: () => TargetPrompts,
  isFullWindow: () => isFullWindow,
  setDockWidth: () => setDockWidth,
  setUI: () => setUI,
  useDrillController: () => useDrillController,
  useUI: () => useUI
});

// src/ui/features/drill/drill.css
var drill_default = '\n.rt-dock{position:fixed;top:12px;right:12px;z-index:20;display:flex;flex-direction:column;box-sizing:border-box;\n  background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#1c1c1c) 52%,transparent);\n  backdrop-filter:blur(20px) saturate(1.3);-webkit-backdrop-filter:blur(20px) saturate(1.3);\n  border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1,#444) 70%,transparent);\n  border-radius:12px;\n  box-shadow:0 18px 48px color-mix(in srgb,#000 28%,transparent);pointer-events:auto;color:var(--dsw-alias-label-primary);\n  font-size:13px;line-height:1.5}\n.rt-dock.rt-embedded{position:relative;inset:auto;width:100%;height:100%;max-width:none;border:0;border-radius:0;box-shadow:none;background:transparent!important;backdrop-filter:none;-webkit-backdrop-filter:none}\n.rt-grip,.rt-resize-r,.rt-resize-b,.rt-resize-c{position:absolute;z-index:3;touch-action:none}\n.rt-grip{left:-3px;top:0;bottom:0;width:8px;cursor:ew-resize;background:transparent}\n.rt-resize-r{right:-3px;top:0;bottom:14px;width:8px;cursor:ew-resize}\n.rt-resize-b{left:8px;right:14px;bottom:-3px;height:8px;cursor:ns-resize}\n.rt-resize-c{right:0;bottom:0;width:16px;height:16px;cursor:nwse-resize}\n.rt-head{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}\n.rt-title{font-weight:600;font-size:14px;display:flex;align-items:center;gap:6px;white-space:nowrap}\n.rt-dot{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-brand-primary)}\n.rt-spacer{flex:1}\n.rt-btn{border:1px solid var(--xsdsh-line,#e4e9f0);background:var(--xsdsh-panel,#fff);color:var(--xsdsh-ink,#101828);\n  border-radius:8px;padding:3px 9px;font-size:11.5px;cursor:pointer;font-family:inherit;white-space:nowrap;\n  transition:background .15s var(--xsdsh-ease),border-color .15s var(--xsdsh-ease)}\n.rt-btn:hover:not(:disabled){background:var(--xsdsh-hover,#eef3f9);border-color:var(--xsdsh-line-hover,#aab7c8)}\n.rt-btn-primary{background:var(--xsdsh-accent-soft,#e8f0ff);border-color:var(--xsdsh-accent,#2563eb);color:var(--xsdsh-accent,#2563eb)}\n.rt-btn-primary:hover:not(:disabled){background:var(--xsdsh-accent-bg,#e8f0ff)}\n.rt-btn-danger{background:var(--xsdsh-bad-soft,rgba(217,45,32,.10));border-color:var(--xsdsh-bad-line,rgba(217,45,32,.28));color:var(--xsdsh-bad,#d92d20)}\n.rt-btn-danger:hover:not(:disabled){background:var(--xsdsh-danger-bg,#fef3f2);border-color:var(--xsdsh-bad,#d92d20)}\n.rt-btn:disabled{opacity:.45;cursor:not-allowed}\n.rt-tabs{display:flex;flex-wrap:wrap;gap:2px;padding:6px 12px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}\n.rt-tab{padding:8px 10px 7px;border-radius:0;cursor:pointer;font-size:12.5px;color:var(--dsw-alias-label-secondary);\n  display:inline-flex;align-items:center;gap:5px;border-bottom:2px solid transparent;margin-bottom:-1px;background:transparent}\n.rt-tab:hover{color:var(--dsw-alias-label-primary)}\n.rt-tab.on{color:var(--dsw-alias-label-primary);background:transparent;font-weight:600;border-bottom-color:var(--dsw-alias-brand-primary,#6dbf8c)}\n/* 未读红点：该页签有新内容（新资产/新漏洞/新得分/新步骤…），点开看过就消失 */\n.rt-tab-dot{width:7px;height:7px;border-radius:50%;background:var(--xsdsh-bad);flex:none;\n  box-shadow:0 0 0 2px color-mix(in srgb, var(--xsdsh-bad) 22%, transparent)}\n.rt-body{flex:1;min-height:0;display:flex;flex-direction:column}\n.rt-split{flex:1;min-height:0;display:flex}\n.rt-side{width:200px;flex:none;border-right:1px solid var(--dsw-alias-border-l1);overflow:auto;padding:8px}\n.rt-main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}\n.rt-seg{padding:7px 8px;border-radius:6px;cursor:pointer;margin-bottom:4px;border:1px solid transparent}\n.rt-seg:hover{background:var(--dsw-alias-bg-layer-2)}\n.rt-seg.on{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-brand-primary)}\n.rt-seg-cidr{font-family:inherit;font-size:12.5px}\n.rt-seg-meta{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:2px}\n.rt-toolbar{display:flex;gap:6px;padding:4px 0 6px;flex-wrap:wrap;align-items:center}\n.rt-input{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);color:inherit;\n  border-radius:6px;padding:4px 8px;font-size:12px;font-family:inherit;outline:none;min-width:0}\n.rt-input:focus{border-color:var(--dsw-alias-brand-primary)}\n.rt-eng-select{max-width:170px}\n.rt-select{max-width:170px}\n.rt-select-block{display:block;width:100%;margin-top:4px}\n.rt-secret-field{display:block;margin-top:4px}\n.rt-kb-select{width:118px;flex:none}\n.rt-table{flex:1;overflow:auto}\n.rt-row{display:grid;grid-template-columns:150px 74px 104px 1.15fr 1fr;gap:8px;padding:6px 10px;\n  border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center;cursor:pointer;font-size:12.5px}\n.rt-row:hover{background:var(--dsw-alias-bg-layer-2)}\n.rt-row.head{cursor:default;color:var(--dsw-alias-label-secondary);font-size:11.5px;font-weight:600;position:sticky;top:0;\n  background:var(--dsw-alias-bg-layer-1);z-index:1}\n.rt-row.head:hover{background:var(--dsw-alias-bg-layer-1)}\n.rt-mono{font-family:inherit}\n.rt-tag{display:inline-block;padding:0 5px;border-radius:4px;font-size:11px;margin-right:4px;\n  border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);white-space:nowrap}\n.rt-tag-passive{color:var(--xsdsh-skip);border-color:color-mix(in srgb,var(--xsdsh-skip) 33%,transparent);background:color-mix(in srgb,var(--xsdsh-skip) 10%,transparent)}\n.rt-tag-active{color:var(--xsdsh-warn);border-color:color-mix(in srgb,var(--xsdsh-warn) 33%,transparent);background:color-mix(in srgb,var(--xsdsh-warn) 10%,transparent)}\n.rt-tag-live{color:var(--xsdsh-ok);border-color:color-mix(in srgb,var(--xsdsh-ok) 33%,transparent);background:color-mix(in srgb,var(--xsdsh-ok) 10%,transparent)}\n.rt-tag-warn{color:var(--xsdsh-bad);border-color:color-mix(in srgb,var(--xsdsh-bad) 33%,transparent);background:color-mix(in srgb,var(--xsdsh-bad) 10%,transparent)}\n/* 纪律提示条：不满足交付要求（非冰蝎/哥斯拉马、没有 suo5 隧道）时顶在区块最上方 */\n.rt-hint{border-radius:6px;padding:7px 9px;margin-bottom:8px;font-size:11.5px;line-height:1.6;\n  border:1px dashed color-mix(in srgb,var(--xsdsh-bad) 53%,transparent);background:color-mix(in srgb,var(--xsdsh-bad) 6%,transparent);color:var(--dsw-alias-label-primary)}\n.rt-hint b{color:var(--xsdsh-bad)}\n.rt-tag-dead{color:var(--dsw-alias-label-secondary)}\n.rt-expand{grid-column:1/-1;padding:8px 4px 10px;font-size:12px;color:var(--dsw-alias-label-secondary)}\n.rt-kv{display:flex;gap:8px;margin-bottom:3px;align-items:baseline}\n.rt-kv b{color:var(--dsw-alias-label-primary);font-weight:600;min-width:64px;flex:none}\n/* 图谱视图已移除（见 AssetsTab：资产关系由「域名维度」与 redteam_attack_path 工具承担） */\n.rt-pane{flex:1;min-height:0;overflow:auto;padding:12px}\n/* 卡片用实色底，不再 backdrop-filter 模糊：演练页一屏十几张卡，拖动面板时每张都要重采样\n   背景，是 4.5.34 拖动掉帧的主要来源。面板本身不透底，模糊也没有可观感收益。 */\n.rt-card{border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1,#444) 75%,transparent);border-radius:8px;padding:10px;margin-bottom:10px;\n  background:var(--dsw-alias-bg-layer-2,#2a2a2a)}\n.rt-card h4{margin:0 0 6px;font-size:13px}\n.rt-textarea{width:100%;min-height:260px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);\n  color:inherit;border-radius:6px;padding:8px;font-size:12.5px;font-family:inherit;\n  line-height:1.6;resize:vertical;outline:none;box-sizing:border-box}\n.rt-textarea:focus{border-color:var(--dsw-alias-brand-primary)}\n.rt-list{width:210px;flex:none;border-right:1px solid var(--dsw-alias-border-l1);overflow:auto;padding:8px}\n.rt-item{padding:7px 8px;border-radius:6px;cursor:pointer;margin-bottom:4px;border:1px solid transparent}\n.rt-item:hover{background:var(--dsw-alias-bg-layer-2)}\n.rt-item.on{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-brand-primary)}\n.rt-item-name{font-weight:600;font-size:12.5px}\n.rt-item-desc{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:2px;\n  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.rt-empty{padding:24px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:12.5px}\n.rt-err{color:var(--dsw-alias-state-error-primary);font-size:12px;padding:6px 10px}\n.rt-foot{padding:8px 12px;border-top:1px solid var(--dsw-alias-border-l1);font-size:11px;\n  color:var(--dsw-alias-label-secondary);display:flex;gap:12px;flex-wrap:wrap;align-items:center}\n.rt-icon-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;border:1px solid var(--dsw-alias-border-l1);\n  background:transparent;color:inherit;border-radius:6px;padding:6px 8px;cursor:pointer;font-family:inherit;font-size:12.5px}\n.rt-icon-btn:hover{background:var(--dsw-alias-bg-layer-2)}\n.rt-icon-btn.on{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}\n.rt-hbtn{border:1px solid var(--dsw-alias-border-l1);background:transparent;color:inherit;border-radius:6px;\n  padding:2px 8px;font-size:12px;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px}\n.rt-hbtn:hover{background:var(--dsw-alias-bg-layer-2)}\n.rt-hbtn.on{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}\n.rt-test{display:inline-block;padding:0 5px;border-radius:4px;font-size:11px;white-space:nowrap;\n  border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}\n.rt-test-testing{color:var(--xsdsh-warn);border-color:color-mix(in srgb,var(--xsdsh-warn) 33%,transparent);background:color-mix(in srgb,var(--xsdsh-warn) 10%,transparent)}\n.rt-test-tested{color:var(--xsdsh-ok);border-color:color-mix(in srgb,var(--xsdsh-ok) 33%,transparent);background:color-mix(in srgb,var(--xsdsh-ok) 10%,transparent)}\n.rt-test-blocked{color:var(--xsdsh-panel);background:var(--xsdsh-bad);border-color:var(--xsdsh-bad)}\n.rt-test-abandoned{color:var(--xsdsh-na);border-color:color-mix(in srgb,var(--xsdsh-na) 33%,transparent);background:color-mix(in srgb,var(--xsdsh-na) 10%,transparent)}\n.rt-test-no_surface{color:var(--xsdsh-accent);border-color:color-mix(in srgb,var(--xsdsh-accent) 33%,transparent);background:color-mix(in srgb,var(--xsdsh-accent) 10%,transparent)}\n.rt-scope-testing{color:var(--xsdsh-skip);background:color-mix(in srgb,var(--xsdsh-skip) 18%,transparent)}\n.rt-pri{display:inline-block;padding:0 6px;border-radius:4px;font-size:11px;font-weight:600;white-space:nowrap}\n.rt-pri-high{color:var(--xsdsh-panel);background:var(--xsdsh-bad)}\n.rt-pri-medium{color:var(--xsdsh-panel);background:var(--xsdsh-warn)}\n.rt-pri-low{color:var(--xsdsh-panel);background:var(--xsdsh-na)}\n.rt-score-row{display:grid;grid-template-columns:16px 62px minmax(0,1fr) 116px 66px;gap:8px;padding:7px 10px;\n  border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center;font-size:12.5px;cursor:pointer}\n.rt-score-row:hover{background:var(--dsw-alias-bg-layer-2)}\n.rt-score-row.head{cursor:default;color:var(--dsw-alias-label-secondary);font-size:11.5px;font-weight:600;\n  position:sticky;top:0;background:var(--dsw-alias-bg-layer-1);z-index:1}\n.rt-score-detail{grid-column:1/-1;padding:8px 4px 10px;font-size:12px;color:var(--dsw-alias-label-secondary)}\n/* 得分目标按合并版的 8 个类别分组：类别头 + 组内按分值升序 */\n.rt-score-group{display:flex;align-items:center;gap:8px;padding:7px 10px 5px;margin-top:2px;\n  font-size:12px;font-weight:600;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2)}\n.rt-score-group:first-child{border-top:none}\n.rt-score-group .rt-sg-sub{font-weight:400;font-size:11px;color:var(--dsw-alias-label-secondary)}\n/* ── 会话与入口：每张卡片分「标题行 / 关键事实 / 可用命令 / 备注」四段，避免一行糊在一起 ── */\n.rt-sess-facts{display:flex;flex-direction:column;gap:2px;margin-top:5px}\n.rt-sess-fact{display:flex;gap:6px;font-size:11.5px;line-height:1.5}\n.rt-sess-fact>b{flex:none;min-width:62px;font-weight:600;color:var(--dsw-alias-label-secondary)}\n.rt-sess-fact>span{min-width:0;overflow-wrap:anywhere}\n.rt-sess-cmd{margin-top:6px}\n.rt-sess-cmd>b{display:block;font-size:11px;color:var(--dsw-alias-label-secondary);margin-bottom:3px;font-weight:600}\n.rt-sess-fold{margin-top:6px;font-size:11.5px}\n.rt-sess-fold>summary{cursor:pointer;color:var(--dsw-alias-label-secondary);user-select:none}\n.rt-sess-fold>summary:hover{color:var(--dsw-alias-label-primary)}\n.rt-score-row .rt-scope{font-size:10.5px;color:var(--dsw-alias-label-secondary)}\n.rt-score-form{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px}\n.rt-score-form input,.rt-score-form select{width:100%;box-sizing:border-box}\n.rt-vrow{display:grid;grid-template-columns:62px minmax(0,1fr) 132px 108px 74px 52px;gap:8px;padding:6px 10px;\n  border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center;font-size:12.5px;cursor:pointer}\n.rt-vrow:hover{background:var(--dsw-alias-bg-layer-2)}\n.rt-vrow.head{cursor:default;color:var(--dsw-alias-label-secondary);font-size:11.5px;font-weight:600;\n  position:sticky;top:0;background:var(--dsw-alias-bg-layer-1);z-index:1}\n.rt-vdetail{grid-column:1/-1;padding:8px 4px 10px;font-size:12px;color:var(--dsw-alias-label-secondary)}\n.rt-vdetail .rt-kv{margin-bottom:4px}\n.rt-actions{display:flex;gap:6px;margin-top:6px}\n.rt-section{padding:8px 10px 2px;font-size:11.5px;font-weight:600;color:var(--dsw-alias-label-secondary)}\n.rt-link{color:var(--dsw-alias-brand-primary);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-link:hover{text-decoration:underline}\n.rt-full{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;\n  background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.5;\n  border-top:3px solid var(--dsw-alias-brand-primary)}\n.rt-full .rt-head{padding:12px 18px}\n.rt-full .rt-tabs{padding:10px 18px 0;gap:6px;flex-wrap:wrap}\n.rt-full .rt-side{width:260px}\n.rt-full .rt-list{width:280px}\n.rt-full .rt-row{grid-template-columns:190px 90px 130px 1.4fr 1.2fr}\n.rt-full .rt-vrow{grid-template-columns:80px minmax(0,1.6fr) 200px 150px 90px 64px}\n.rt-full .rt-pane{padding:18px}\n.rt-full .rt-textarea{min-height:60vh}\n.rt-full .rt-foot{padding:10px 18px;font-size:12px}\n.rt-full .rt-body{max-width:1400px;width:100%;margin:0 auto;flex:1;min-height:0;display:flex;flex-direction:column}\n.rt-chain{flex:1;overflow:auto;padding:10px 12px}\n.rt-step{display:flex;gap:10px;padding:8px 6px;border-left:2px solid var(--dsw-alias-border-l1);margin-left:6px}\n.rt-step:last-child{border-left-color:transparent}\n.rt-step-dot{width:22px;height:22px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;\n  font-size:11px;font-weight:700;color:var(--xsdsh-panel);background:var(--xsdsh-na);margin-left:-13px}\n.rt-step-body{min-width:0}\n.rt-step-title{font-weight:600;font-size:13px}\n.rt-step-meta{font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:2px;word-break:break-word}\n.rt-stage-recon{background:var(--xsdsh-accent)}\n.rt-stage-vuln{background:var(--xsdsh-warn)}\n.rt-stage-exploit{background:var(--xsdsh-bad)}\n.rt-stage-access{background:var(--xsdsh-ok)}\n.rt-stage-pivot{background:var(--xsdsh-skip)}\n.rt-stage-data{background:var(--xsdsh-accent)}\n.rt-stage-other{background:var(--xsdsh-na)}\n.rt-step-head{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap}\n.rt-step-time{font-size:11px;color:var(--dsw-alias-label-secondary);margin-left:auto;white-space:nowrap}\n.rt-step-detail{font-size:12px;margin-top:5px;white-space:pre-wrap;word-break:break-word;\n  border-left:2px solid var(--dsw-alias-border-l1);padding:2px 0 2px 9px;line-height:1.6}\n.rt-chip{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;padding:1px 7px;border-radius:5px;\n  border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);margin:4px 5px 0 0;max-width:100%}\n.rt-chip>i{font-style:normal;color:var(--dsw-alias-label-secondary);font-size:10.5px}\n.rt-chip>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:420px}\n.rt-stage-tag{display:inline-block;padding:0 6px;border-radius:4px;font-size:11px;color:#fff;font-weight:600}\n.rt-st-recon{background:var(--xsdsh-accent)}.rt-st-vuln{background:var(--xsdsh-warn)}.rt-st-exploit{background:var(--xsdsh-bad)}\n.rt-st-access{background:var(--xsdsh-ok)}.rt-st-pivot{background:var(--xsdsh-skip)}.rt-st-data{background:var(--xsdsh-accent)}.rt-st-other{background:var(--xsdsh-na)}\n.rt-sev{display:inline-block;padding:0 6px;border-radius:4px;font-size:11px;font-weight:600;border:1px solid transparent}\n.rt-sev-critical{color:#fff;background:var(--xsdsh-bad)}.rt-sev-high{color:var(--xsdsh-panel);background:var(--xsdsh-bad)}\n.rt-sev-medium{color:var(--xsdsh-warn);background:color-mix(in srgb,var(--xsdsh-warn) 22%,transparent)}.rt-sev-low{color:var(--xsdsh-accent);background:color-mix(in srgb,var(--xsdsh-accent) 16%,transparent)}\n.rt-sev-info{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1)}\n.rt-dot-on{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--xsdsh-ok);box-shadow:0 0 0 3px color-mix(in srgb,var(--xsdsh-ok) 20%,transparent)}\n.rt-dot-off{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--xsdsh-bad);box-shadow:0 0 0 3px color-mix(in srgb,var(--xsdsh-bad) 20%,transparent)}\n.rt-dot-unk{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--xsdsh-na);box-shadow:0 0 0 3px color-mix(in srgb,var(--xsdsh-na) 20%,transparent)}\n.rt-sess-grid{display:grid;grid-template-columns:1fr;gap:8px;padding:10px 12px}\n.rt-sess{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:9px 10px;background:var(--dsw-alias-bg-layer-2)}\n.rt-sess-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}\n.rt-sess-title{font-weight:600;font-size:12.5px;font-family:inherit;word-break:break-all}\n.rt-sess-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:3px;word-break:break-word}\n.rt-code{font-family:ui-monospace,Menlo,monospace;font-size:11px;background:var(--dsw-alias-bg-base);\n  border:1px solid var(--dsw-alias-border-l1);border-radius:4px;padding:1px 5px;cursor:pointer;word-break:break-all}\n.rt-code:hover{border-color:var(--dsw-alias-brand-primary)}\n.rt-evi{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:hidden;margin-top:8px}\n.rt-evi-head{display:flex;align-items:center;gap:8px;padding:5px 9px;background:var(--dsw-alias-bg-layer-2);\n  font-size:11.5px;font-weight:600;border-bottom:1px solid var(--dsw-alias-border-l1)}\n.rt-evi-body{margin:0;padding:9px 11px;font-family:ui-monospace,Menlo,monospace;font-size:11.5px;line-height:1.6;\n  white-space:pre-wrap;word-break:break-word;max-height:340px;overflow:auto;background:var(--dsw-alias-bg-base)}\n.rt-evi-body.req{max-height:220px}\n.rt-hl-req{color:var(--xsdsh-ok);font-weight:600}\n.rt-hl-res{color:var(--xsdsh-accent);font-weight:600}\n.rt-gain{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:12px;\n  color:var(--xsdsh-ok);background:var(--xsdsh-ok-soft);border:1px solid color-mix(in srgb,var(--xsdsh-ok) 33%,transparent)}\n.rt-total{font-size:20px;font-weight:700;font-family:inherit}\n.rt-sidehead{padding:7px 8px 2px;font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary);\n  display:flex;align-items:center;gap:5px}\n.rt-sidehead-btn{cursor:pointer;outline:none;padding:6px 6px 5px;border-radius:5px;user-select:none}\n.rt-sidehead-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}\n.rt-sidehead-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}\n.rt-scope{display:inline-block;padding:0 4px;border-radius:3px;font-size:10px;font-weight:700;line-height:15px;flex:none}\n.rt-scope-internal{color:var(--xsdsh-accent);background:color-mix(in srgb,var(--xsdsh-accent) 16%,transparent)}\n.rt-scope-external{color:var(--xsdsh-warn);background:color-mix(in srgb,var(--xsdsh-warn) 18%,transparent)}\n.rt-hits{display:flex;flex-direction:column;gap:6px;margin-top:7px}\n.rt-hit{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid var(--xsdsh-ok);border-radius:6px;\n  padding:7px 9px;background:var(--dsw-alias-bg-layer-2)}\n.rt-hit-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}\n.rt-hit-idx{width:16px;height:16px;border-radius:50%;background:var(--xsdsh-ok);color:var(--xsdsh-panel);font-size:10.5px;font-weight:700;\n  display:inline-flex;align-items:center;justify-content:center;flex:none}\n.rt-hit-target{font-family:inherit;font-weight:600;font-size:12px;word-break:break-all}\n.rt-hit-time{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}\n.rt-hit-evi{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;line-height:1.65;white-space:pre-wrap;word-break:break-word;\n  background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:5px;padding:6px 8px;margin-top:5px}\n.rt-hit-note{font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:4px}\n.rt-cred{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid var(--xsdsh-warn);border-radius:6px;\n  padding:8px 10px;background:var(--dsw-alias-bg-layer-2);margin-bottom:7px}\n.rt-cred-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}\n.rt-cred-host{font-family:inherit;font-weight:600;font-size:12.5px;word-break:break-all}\n.rt-secret{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;line-height:1.6;background:var(--xsdsh-warn-soft);color:var(--xsdsh-warn);\n  border:1px solid color-mix(in srgb,var(--xsdsh-warn) 40%,transparent);border-radius:5px;padding:6px 9px;margin-top:6px;white-space:pre-wrap;word-break:break-all;\n  user-select:all;cursor:text}\n.rt-secret-none{font-family:inherit;font-size:11.5px;color:var(--dsw-alias-state-error-primary);\n  border:1px dashed var(--dsw-alias-state-error-primary);border-radius:5px;padding:5px 9px;margin-top:6px}\n.rt-cred-meta{font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:5px;word-break:break-word}\n.rt-stage-score{background:var(--xsdsh-ok)}\n.rt-counted{font-family:inherit;font-size:12px;font-weight:700;color:var(--xsdsh-ok);background:var(--xsdsh-ok-soft);border:1px solid color-mix(in srgb,var(--xsdsh-ok) 33%,transparent);border-radius:9px;padding:0 7px}\n.rt-scorepts{font-size:11.5px;font-weight:700;color:var(--xsdsh-ok);background:var(--xsdsh-ok-soft);border:1px solid color-mix(in srgb,var(--xsdsh-ok) 33%,transparent);\n  border-radius:10px;padding:0 7px;white-space:nowrap}\n.rt-livebar{display:flex;align-items:center;gap:7px;padding:7px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);\n  background:var(--dsw-alias-bg-layer-2);flex-wrap:wrap}\n.rt-live-dot{width:8px;height:8px;border-radius:50%;background:var(--xsdsh-ok);flex:none;animation:rt-pulse 1.6s ease-in-out infinite}\n.rt-live-dot.idle{background:var(--xsdsh-na);animation:none}\n@keyframes rt-pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 color-mix(in srgb,var(--xsdsh-ok) 40%,transparent)}50%{opacity:.5;box-shadow:0 0 0 5px color-mix(in srgb,var(--xsdsh-ok) 0%,transparent)}}\n.rt-live-body{padding:8px 12px 2px;max-height:44vh;overflow:auto}\n.rt-atest{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid var(--xsdsh-ok);border-radius:6px;\n  padding:7px 10px;background:var(--dsw-alias-bg-layer-2);margin-bottom:6px}\n.rt-atest.past{border-left-color:var(--xsdsh-na);opacity:.85}\n.rt-atest-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}\n.rt-atest-ip{font-family:inherit;font-weight:600;font-size:12.5px;word-break:break-all}\n.rt-atest-meta{font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:3px;word-break:break-word}\n.rt-atest-notes{font-family:inherit;font-size:11px;line-height:1.6;white-space:pre-wrap;\n  word-break:break-word;background:var(--dsw-alias-bg-base);border-radius:4px;padding:5px 7px;margin-top:4px;max-height:76px;overflow:auto}\n.rt-concl{display:flex;align-items:center;gap:4px;padding:6px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);\n  background:var(--dsw-alias-bg-layer-2);flex-wrap:wrap}\n.rt-concl-i{display:inline-flex;align-items:baseline;gap:4px;padding:2px 8px;border-radius:6px;cursor:pointer;\n  border:1px solid transparent}\n.rt-concl-i:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1)}\n.rt-concl-i.on{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1)}\n.rt-concl-i b{font-family:inherit;font-size:14px;font-weight:700}\n.rt-concl-i>span{color:var(--dsw-alias-label-secondary);font-size:11.5px}\n.rt-more{color:var(--dsw-alias-brand-primary);font-size:11.5px;cursor:pointer;user-select:none;margin-top:4px;display:inline-block}\n.rt-more:hover{text-decoration:underline}\n.rt-subtabs{display:flex;gap:4px;padding:6px 10px 0;border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center}\n.rt-subtab{padding:4px 10px;border-radius:6px 6px 0 0;cursor:pointer;font-size:12px;color:var(--dsw-alias-label-secondary)}\n.rt-subtab.on{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);font-weight:600}\n.rt-sevbar{width:3px;border-radius:2px;align-self:stretch;flex:none;margin-right:2px}\n/* ── 折叠层次体系 ─────────────────────────────────────────────────────────────\n   L1 折叠头 .rt-sec   ：通栏、无圆角无边框、左色条、深底 —— 永远是"扁"的\n   L2 内容卡 .rt-atest/.rt-hit/.rt-cred/.rt-evi：内缩、有边框、圆角 —— 立起来\n   L3 详情/长文本 .rt-clip-body / .rt-evi-body ：无边框、最浅、等宽\n   L4 子项容器 .rt-sec-body：左缩进 + 竖引导线，表明"属于上面那个头"\n   ──────────────────────────────────────────────────────────────────────────── */\n.rt-sec-wrap{margin:0}\n.rt-sec{display:flex;align-items:center;gap:8px;padding:7px 12px 7px 9px;cursor:pointer;\n  background:var(--dsw-alias-bg-layer-2);border-left:3px solid var(--dsw-alias-border-l2);\n  border-top:1px solid var(--dsw-alias-border-l1);user-select:none;outline:none}\n.rt-sec:hover{background:var(--dsw-alias-bg-layer-1)}\n.rt-sec:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}\n.rt-sec.flat{cursor:default}\n.rt-sec.flat:hover{background:var(--dsw-alias-bg-layer-2)}\n.rt-sec-caret{flex:none;width:11px;font-size:10px;color:var(--dsw-alias-label-secondary);text-align:center}\n.rt-sec-title{font-weight:600;font-size:13px;white-space:nowrap}\n.rt-sec-count{font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap}\n.rt-sec-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-sec-right{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:none}\n.rt-sec.t-stage{border-left-color:var(--xsdsh-skip)}\n.rt-sec.t-target{border-left-color:var(--xsdsh-accent)}\n.rt-sec.t-folder{border-left-color:var(--xsdsh-na)}\n.rt-sec.t-test{border-left-color:var(--xsdsh-ok)}\n.rt-sec.t-queue{border-left-color:var(--xsdsh-warn)}\n.rt-sec.t-past{border-left-color:var(--xsdsh-na)}\n.rt-sec-body{margin-left:12px;border-left:1px solid var(--dsw-alias-border-l1);padding:7px 0 3px 10px}\n.rt-sec-body>.rt-atest:last-child,.rt-sec-body>.rt-hit:last-child{margin-bottom:2px}\n/* 长文本折叠（L3）：默认预览 2 行并渐隐，展开后限高滚动 */\n.rt-clip{margin-top:6px}\n.rt-clip-head{display:flex;align-items:center;gap:6px}\n.rt-clip-label{font-size:11px;color:var(--dsw-alias-label-secondary);font-weight:600}\n.rt-clip-body{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;line-height:1.65;white-space:pre-wrap;\n  word-break:break-word;background:var(--dsw-alias-bg-base);border-radius:5px;padding:6px 8px;margin-top:3px}\n.rt-clip:not(.open) .rt-clip-body{max-height:46px;overflow:hidden;\n  -webkit-mask-image:linear-gradient(180deg,#000 55%,transparent);mask-image:linear-gradient(180deg,#000 55%,transparent)}\n.rt-clip.open .rt-clip-body{max-height:340px;overflow:auto}\n.rt-flow{padding:10px 12px 16px}\n.rt-flow-start,.rt-flow-end{font-size:11.5px;color:var(--dsw-alias-label-secondary);padding:4px 0}\n.rt-flow-end{font-weight:600;color:var(--dsw-alias-label-primary)}\n.rt-flow-link{display:flex;align-items:center;gap:8px;padding:3px 0 3px 10px}\n.rt-flow-arrow{color:var(--dsw-alias-border-l2);font-size:11px;flex:none}\n.rt-flow-action{font-size:11.5px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-flow-action.inferred{opacity:.7;font-style:italic}\n.rt-flow-node{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid var(--xsdsh-ok);border-radius:8px;\n  padding:8px 11px;background:var(--dsw-alias-bg-layer-2);cursor:pointer;outline:none}\n.rt-flow-node:hover{border-color:var(--dsw-alias-border-l2)}\n.rt-flow-node:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}\n.rt-flow-node.overflow{border-left-color:var(--xsdsh-na);opacity:.75}\n.rt-flow-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.rt-flow-idx{width:18px;height:18px;border-radius:50%;background:var(--xsdsh-ok);color:var(--xsdsh-panel);font-size:11px;font-weight:700;\n  display:inline-flex;align-items:center;justify-content:center;flex:none}\n.rt-flow-node.overflow .rt-flow-idx{background:var(--xsdsh-na)}\n.rt-flow-name{font-weight:600;font-size:13px}\n.rt-flow-pts{margin-left:auto;font-family:inherit;font-size:12.5px;font-weight:700;color:var(--xsdsh-ok);\n  background:var(--xsdsh-ok-soft);border:1px solid color-mix(in srgb,var(--xsdsh-ok) 33%,transparent);border-radius:10px;padding:0 8px;white-space:nowrap}\n.rt-flow-pts.off{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l1)}\n.rt-flow-times{font-size:11px;color:var(--dsw-alias-label-secondary)}\n.rt-flow-target{font-family:inherit;font-size:11.5px;margin-top:4px;word-break:break-all;\n  color:var(--dsw-alias-label-secondary)}\n.rt-flow-gain{font-size:12px;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-flow-detail{margin-top:7px;padding-top:7px;border-top:1px dashed var(--dsw-alias-border-l1)}\n.rt-hflow-wrap{flex:1;min-height:0;display:flex;flex-direction:column;overflow:auto}\n.rt-hflow{display:flex;align-items:center;gap:0;padding:16px 12px;overflow-x:auto;flex-wrap:nowrap}\n.rt-hflow-item{display:flex;align-items:center;flex:none}\n.rt-hflow-start,.rt-hflow-end{font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;padding:0 4px}\n.rt-hflow-end{font-weight:600;color:var(--dsw-alias-label-primary)}\n.rt-hflow-arrow{color:var(--dsw-alias-border-l2);padding:0 5px;font-size:13px;flex:none}\n.rt-hflow-node{display:flex;align-items:center;gap:5px;border:1px solid var(--dsw-alias-border-l1);\n  border-left:3px solid var(--xsdsh-ok);border-radius:7px;padding:5px 8px;background:var(--dsw-alias-bg-layer-2);\n  cursor:pointer;white-space:nowrap;outline:none}\n.rt-hflow-node:hover{border-color:var(--dsw-alias-border-l2)}\n.rt-hflow-node:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}\n.rt-hflow-node.overflow{border-left-color:var(--xsdsh-na);opacity:.72}\n.rt-hflow-node.open{border-color:var(--dsw-alias-brand-primary)}\n.rt-hflow-pts{font-family:inherit;font-size:11.5px;font-weight:700;color:var(--xsdsh-ok);background:var(--xsdsh-ok-soft);\n  border-radius:8px;padding:0 6px}\n.rt-hflow-node.overflow .rt-hflow-pts{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1)}\n.rt-hflow-name{font-size:11.5px}\n.rt-hflow-n{font-size:10.5px;color:var(--dsw-alias-label-secondary)}\n.rt-rep-list{padding:10px 12px 14px}\n.rt-rep-tools{display:flex;gap:6px;justify-content:flex-end;margin-bottom:8px}\n.rt-rep{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid var(--xsdsh-ok);border-radius:8px;\n  padding:9px 11px;margin-bottom:10px;background:var(--dsw-alias-bg-layer-2)}\n.rt-rep-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.rt-rep-idx{font-size:15px;color:var(--xsdsh-ok);font-weight:700;flex:none}\n.rt-rep-name{font-weight:600;font-size:13px}\n.rt-rep-meta{font-size:12px;margin-top:4px;color:var(--dsw-alias-label-secondary);word-break:break-word}\n.rt-rep-meta b{color:var(--dsw-alias-label-primary);font-weight:600;margin-right:2px}\n.rt-rep-missing{font-size:11.5px;color:var(--dsw-alias-state-error-primary);margin-top:6px;\n  border:1px dashed var(--dsw-alias-state-error-primary);border-radius:5px;padding:5px 8px}\n.rt-rep-req{margin-top:7px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;overflow:hidden}\n.rt-rep-req-head{display:flex;align-items:center;gap:7px;padding:4px 8px;font-size:11.5px;font-weight:600;\n  background:var(--dsw-alias-bg-layer-1);border-bottom:1px solid var(--dsw-alias-border-l1)}\n.rt-rep-http{margin:0;padding:8px 10px;font-family:ui-monospace,Menlo,monospace;font-size:11.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word;max-height:240px;overflow:auto;background:var(--dsw-alias-bg-base)}\n/* ── 报告里的「这一步怎么来的」：动作步骤 / 命令 / 凭据 / 隧道 ───────────── */\n.rt-rep-trace{margin-top:8px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;padding:8px 10px;\n  background:var(--dsw-alias-bg-base)}\n.rt-rep-trace-head{display:flex;align-items:center;gap:7px;margin-bottom:5px}\n.rt-rep-trace-title{font-weight:600;font-size:12.5px}\n.rt-rep-trace-how{font-size:12px;color:var(--dsw-alias-label-secondary);margin-bottom:6px}\n.rt-rep-step{border-left:2px solid var(--dsw-alias-border-l1);padding:2px 0 6px 9px;margin-bottom:6px}\n.rt-rep-step-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}\n.rt-rep-step-no{width:17px;height:17px;border-radius:50%;background:var(--dsw-alias-brand-primary);color:#fff;\n  font-size:10.5px;display:flex;align-items:center;justify-content:center;flex:none}\n.rt-rep-step-title{font-weight:600;font-size:12.5px}\n.rt-rep-step-detail{font-size:12px;color:var(--dsw-alias-label-secondary);margin-top:2px}\n.rt-rep-step-cmd{font-size:11.5px;margin-top:4px;display:flex;gap:6px;align-items:flex-start;flex-wrap:wrap}\n.rt-rep-step-cmd .rt-mono{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);\n  border-radius:5px;padding:2px 6px;word-break:break-all}\n.rt-rep-step-result{font-size:11.5px;margin-top:3px;word-break:break-word}\n.rt-rep-src{margin-top:6px;padding-top:6px;border-top:1px dashed var(--dsw-alias-border-l1)}\n.rt-rep-src-title{font-weight:600;font-size:12px;margin-bottom:3px}\n/* ── 全链路攻击路径图 ─────────────────────────────────────────────── */\n.rt-ap{padding:10px 12px 18px;overflow:auto}\n.rt-ap-stage{margin-bottom:2px}\n.rt-ap-head{display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--dsw-alias-bg-layer-2);\n  border-left:4px solid var(--xsdsh-na);border-top:1px solid var(--dsw-alias-border-l1);border-radius:6px 6px 0 0}\n.rt-ap-no{width:20px;height:20px;border-radius:5px;color:#fff;font-size:11px;font-weight:700;flex:none;\n  display:inline-flex;align-items:center;justify-content:center}\n.rt-ap-name{font-weight:700;font-size:13.5px}\n.rt-ap-en{font-size:10px;color:var(--dsw-alias-label-secondary);letter-spacing:.3px}\n.rt-ap-phase{font-size:10.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap}\n.rt-ap-goal{display:flex;align-items:baseline;gap:8px;padding:6px 10px 6px 9px;font-size:12px;\n  border-left:4px solid var(--xsdsh-na);background:var(--dsw-alias-bg-layer-1)}\n.rt-ap-goal-tag{font-size:10.5px;font-weight:700;border:1px solid;border-radius:4px;padding:0 5px;white-space:nowrap;flex:none}\n.rt-ap-result{padding:7px 10px 3px;border-left:4px solid transparent}\n.rt-ap-result-head{display:flex;align-items:center;gap:8px;margin-bottom:5px;flex-wrap:wrap}\n.rt-ap-pts{font-family:inherit;font-size:11.5px;font-weight:700;color:var(--xsdsh-ok);background:var(--xsdsh-ok-soft);\n  border:1px solid color-mix(in srgb,var(--xsdsh-ok) 33%,transparent);border-radius:10px;padding:0 7px;white-space:nowrap}\n.rt-ap-pts.off{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l1)}\n/* 按服务封顶/自建而不计分的命中：分值标灰（+0），避免看着像又加了分 */\n.rt-ap-pts.uncounted{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l1)}\n.rt-ap-nth{font-size:10.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap}\n.rt-ap-hit{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid var(--xsdsh-ok);border-radius:6px;\n  padding:6px 9px;margin-bottom:5px;background:var(--dsw-alias-bg-layer-2);cursor:pointer;outline:none}\n.rt-ap-hit:hover{border-color:var(--dsw-alias-border-l2)}\n.rt-ap-hit:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}\n.rt-ap-hit.overflow{border-left-color:var(--xsdsh-na);opacity:.75}\n.rt-ap-hit-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}\n.rt-ap-hit-name{font-weight:600;font-size:12.5px}\n.rt-ap-hit-target{font-family:inherit;font-size:11px;color:var(--dsw-alias-label-secondary);\n  margin-left:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:46%}\n.rt-ap-act{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:3px}\n.rt-ap-act.inferred{font-style:italic;opacity:.75}\n.rt-ap-none{font-size:11.5px;color:var(--dsw-alias-label-secondary);padding:2px 0 4px}\n.rt-ap-trans{display:flex;align-items:center;gap:7px;padding:2px 0 2px 14px}\n.rt-ap-trans-t{font-size:11px;color:var(--dsw-alias-label-secondary)}\n/* 横向路径图 */\n.rt-ap-h{display:flex;align-items:stretch;padding:10px 12px 14px;overflow-x:auto;flex:1;min-height:0}\n.rt-ap-col{display:flex;align-items:stretch;flex:none}\n.rt-ap-col-arrow{align-self:center;color:var(--dsw-alias-border-l2);padding:0 6px;font-size:12px;flex:none}\n.rt-hcol{width:228px;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l1);\n  border-top:3px solid var(--xsdsh-na);border-radius:7px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}\n.rt-hcol-goal{font-size:11px;color:var(--dsw-alias-label-secondary);padding:5px 8px;line-height:1.45;\n  border-bottom:1px solid var(--dsw-alias-border-l1);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.rt-hcol-body{padding:6px 8px;flex:1;min-height:0;overflow:auto}\n.rt-hcol-hit{display:flex;align-items:center;gap:5px;font-size:11px;margin-bottom:3px}\n.rt-hcol-hit.off{opacity:.6}\n.rt-hcol-pts{font-family:inherit;font-size:10.5px;font-weight:700;color:var(--xsdsh-ok);background:var(--xsdsh-ok-soft);\n  border-radius:7px;padding:0 5px;flex:none}\n.rt-hcol-hit.off .rt-hcol-pts{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2)}\n.rt-hcol-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-hcol-none{font-size:11px;color:var(--dsw-alias-label-secondary)}\n.rt-hcol-secs{display:flex;flex-wrap:wrap;gap:3px;margin-top:6px}\n.rt-hcol-sec{font-size:10px;color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);\n  border-radius:4px;padding:0 4px}\n.rt-hcol-attck{font-family:inherit;font-size:9.5px;color:var(--dsw-alias-label-secondary);\n  padding:4px 8px;border-top:1px solid var(--dsw-alias-border-l1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-ap-cum{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}\n.rt-ap-sub{font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary);margin:6px 0 3px}\n.rt-ap-assets,.rt-ap-tunnels{display:flex;flex-direction:column;gap:3px}\n.rt-ap-asset{display:flex;align-items:center;gap:6px;font-size:11.5px;padding:3px 6px;border-radius:5px;\n  background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1)}\n.rt-ap-tunnel{display:flex;align-items:center;gap:6px;font-size:11.5px;padding:4px 7px;border-radius:5px;\n  background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-left:3px solid var(--xsdsh-warn)}\n.rt-hcol-sub{font-size:10.5px;color:var(--dsw-alias-label-secondary);margin-bottom:2px;\n  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;gap:5px;align-items:center}\n.rt-hcol-sub.off{opacity:.6}\n.rt-hit-row{display:flex;flex-wrap:wrap;align-items:center;gap:2px 7px;font-size:11.5px;padding:4px 7px;border-radius:5px;\n  background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);margin-bottom:3px}\n/* 资产与内容都自适应换行：长域名/长口令/长结果一律换行显示，不截断成省略号 */\n.rt-hit-asset{font-family:inherit;font-weight:600;flex:0 1 auto;max-width:100%;\n  overflow-wrap:anywhere;word-break:break-word}\n.rt-hit-txt{flex:1 1 100%;color:var(--dsw-alias-label-primary);line-height:1.55;\n  white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word}\n.rt-hit-txt.none{color:var(--dsw-alias-state-error-primary)}\n.rt-hit-row .rt-hit-time{flex:none;margin-left:auto}\n/* 自己注册/自建的账号：留痕但不计分，整行压暗 */\n.rt-hit-row.self-created{opacity:.72;border-left:3px solid color-mix(in srgb,var(--xsdsh-bad) 53%,transparent)}\n/* 同一资产同一端口的重复账号/库权限：服务已拿满，不计分（只作留痕） */\n.rt-hit-row.service-capped{opacity:.72;border-left:3px solid color-mix(in srgb,var(--xsdsh-warn) 53%,transparent)}\n.rt-hit-row.service-capped .rt-hit-idx{background:var(--xsdsh-warn)}\n.rt-rep-group{margin-bottom:14px}\n.rt-rep-stage{display:flex;align-items:center;gap:8px;padding:7px 10px;margin-bottom:7px;\n  background:var(--dsw-alias-bg-layer-2);border-left:4px solid var(--xsdsh-na);border-radius:6px;\n  cursor:pointer;outline:none;user-select:none}\n.rt-rep-stage:hover{background:var(--dsw-alias-bg-layer-1)}\n.rt-rep-stage:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}\n.rt-rep-no{width:20px;height:20px;border-radius:5px;color:#fff;font-size:11px;font-weight:700;flex:none;\n  display:inline-flex;align-items:center;justify-content:center}\n.rt-rep-stage-name{font-weight:700;font-size:13px}\n.rt-rep-stage-n{font-size:11px;color:var(--dsw-alias-label-secondary)}\n/* 折叠后仍要能一眼看到"这一阶段拿了多少分"，所以分数留在头上 */\n.rt-rep-pts{font-size:11px;font-weight:600;padding:1px 6px;border-radius:5px;border:1px solid transparent;flex:none}\n.rt-rep-body{padding-left:6px}\n/* ── 知识库（POC/EXP） ──────────────────────────────────────────── */\n.rt-kb-filter{display:flex;align-items:center;gap:7px;padding:8px 10px;border-bottom:1px solid var(--dsw-alias-border-l1)}\n/* 知识库归类总览：一行标签，点一下按该类筛选 */\n.rt-kb-cats{display:flex;flex-wrap:wrap;gap:6px;padding:8px 10px;border-bottom:1px solid var(--dsw-alias-border-l1)}\n/* 知识库分组标题（按归类分组时每组一条） */\n.rt-kb-cat{display:flex;align-items:center;gap:7px;padding:7px 10px;background:var(--dsw-alias-bg-layer-2);\n  border-bottom:1px solid var(--dsw-alias-border-l1);position:sticky;top:0;z-index:1}\n.rt-kb-cat-name{font-weight:600;font-size:12.5px}\n/* 技能可用性徽章（技能库页签） */\n.rt-avail{display:inline-block;padding:0 5px;border-radius:4px;font-size:10.5px;white-space:nowrap;\n  border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}\n.rt-avail-available{color:var(--xsdsh-ok);border-color:color-mix(in srgb,var(--xsdsh-ok) 33%,transparent);background:color-mix(in srgb,var(--xsdsh-ok) 10%,transparent)}\n.rt-avail-broken{color:var(--xsdsh-bad);border-color:color-mix(in srgb,var(--xsdsh-bad) 33%,transparent);background:color-mix(in srgb,var(--xsdsh-bad) 10%,transparent)}\n.rt-avail-unknown{color:var(--xsdsh-na);border-color:color-mix(in srgb,var(--xsdsh-na) 33%,transparent);background:color-mix(in srgb,var(--xsdsh-na) 10%,transparent)}\n/* 版本 / 更新弹窗 */\n.rt-modal{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center}\n.rt-modal-box{width:min(560px,92vw);max-height:80vh;overflow:auto;background:var(--dsw-alias-bg-layer-1);\n  border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:14px 16px;font-size:12.5px;line-height:1.7;\n  box-shadow:0 18px 48px rgba(0,0,0,.35);color:var(--dsw-alias-label-primary)}\n.rt-modal-box .rt-kv b{min-width:76px}\n.rt-kb-check{display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;cursor:pointer}\n.rt-kb{border:1px solid var(--dsw-alias-border-l1);border-radius:7px;margin:0 0 8px;overflow:hidden;\n  background:var(--dsw-alias-bg-layer-2)}\n.rt-kb.open{border-color:var(--dsw-alias-brand-primary)}\n.rt-kb-head{display:flex;align-items:center;gap:7px;padding:7px 9px;cursor:pointer;outline:none;flex-wrap:wrap}\n.rt-kb-head:hover{background:var(--dsw-alias-bg-layer-1)}\n.rt-kb-head:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}\n.rt-kb-title{font-weight:600;font-size:12.5px;overflow-wrap:anywhere}\n.rt-kb-kind{font-size:10px;font-weight:700;letter-spacing:.4px;padding:1px 5px;border-radius:4px;\n  color:var(--xsdsh-panel);background:var(--xsdsh-na);flex:none}\n.rt-kb-kind.k-exp{background:var(--xsdsh-bad)}\n.rt-kb-kind.k-poc{background:var(--xsdsh-warn)}\n.rt-kb-kind.k-template{background:var(--xsdsh-skip)}\n.rt-kb-kind.k-script{background:var(--xsdsh-accent)}\n.rt-kb-kind.k-payload{background:var(--xsdsh-ok)}\n.rt-kb-sub{font-size:11px;color:var(--dsw-alias-label-secondary);padding:0 9px 7px;overflow-wrap:anywhere}\n.rt-kb-body{padding:0 9px 9px}\n.rt-kb-actions{display:flex;gap:6px;margin:7px 0}\n.rt-kb-body .rt-kv span{overflow-wrap:anywhere;word-break:break-word}\n/* 本机 nuclei 模板命中：路径要能完整看到（复制成命令直接跑） */\n.rt-kb-tpl{margin-top:12px;border-top:1px dashed var(--dsw-alias-border-l1);padding-top:8px}\n.rt-kb-tpl-row{display:flex;align-items:center;gap:7px;font-size:11.5px;padding:3px 7px;border-radius:5px;\n  background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);margin-bottom:3px}\n.rt-kb-tpl-path{flex:0 1 auto;font-weight:600;overflow-wrap:anywhere}\n.rt-kb-tpl-name{flex:1 1 auto;min-width:0;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}\n.rt-md{flex:1;overflow:auto;margin:0;padding:14px 16px;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;\n  line-height:1.65;white-space:pre-wrap;word-break:break-word;background:var(--dsw-alias-bg-base)}\n.rt-weblink{display:block;font-size:11.5px;margin-top:1px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-shots{margin:8px 0 4px;padding:7px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;\n  background:var(--dsw-alias-bg-layer-1)}\n.rt-shots-head{display:flex;align-items:baseline;gap:8px;font-size:11.5px;margin-bottom:6px}\n.rt-shots-n{color:var(--dsw-alias-label-secondary)}\n.rt-shot-row{display:flex;gap:8px;flex-wrap:wrap}\n.rt-shot{display:flex;flex-direction:column;gap:3px;max-width:220px}\n.rt-shot-thumb{border:1px solid var(--dsw-alias-border-l1);border-radius:5px;background:#0b1020;\n  object-fit:contain;display:block;width:auto;max-width:216px}\n.rt-shot-loading{display:flex;align-items:center;justify-content:center;width:150px;font-size:11px;\n  color:var(--dsw-alias-label-secondary)}\n.rt-shot-cap{display:flex;align-items:center;gap:5px;font-size:10.5px;overflow-wrap:anywhere}\n.rt-shot-label{color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px}\n.rt-shot-zoom{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.82);display:flex;flex-direction:column;\n  align-items:center;justify-content:center;gap:10px;cursor:zoom-out;padding:18px}\n.rt-shot-zoom img{max-width:96vw;max-height:86vh;border-radius:6px;box-shadow:0 18px 48px rgba(0,0,0,.5)}\n.rt-shot-zoom-cap{color:#e5e7eb;font-size:12px;text-align:center;max-width:90vw;overflow-wrap:anywhere}\n/* ── 环境适配：树状图 ──────────────────────────────────────────────────────\n   目标：一屏看清「哪块到位、哪块没到位」。分组节点自带 n/m 计数，叶子点开才出输入框。\n   颜色只借平台 alias 变量 + 现有的 ok/warn 语义色，不引入新主题。 */\n.rt-env-sum{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:7px 10px;margin-bottom:8px;\n  border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1,#444) 75%,transparent);border-radius:8px;\n  background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#2a2a2a) 42%,transparent);font-size:12px}\n.rt-env-sum-label{color:var(--dsw-alias-label-secondary)}\n.rt-env-sum-n{font-weight:600;font-variant-numeric:tabular-nums}\n.rt-env-bar{display:flex;gap:2px;flex:0 1 260px;min-width:80px;height:6px;align-items:stretch}\n.rt-env-seg{flex:1 1 0;min-width:3px;border-radius:2px;background:color-mix(in srgb,var(--xsdsh-bad) 55%,transparent)}\n.rt-env-seg.ok{background:var(--xsdsh-ok)}\n.rt-env-tree{border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1,#444) 70%,transparent);\n  border-radius:8px;overflow:hidden;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#1c1c1c) 30%,transparent)}\n.rt-trow{display:flex;align-items:center;gap:6px;padding:6px 10px;font-size:12.5px;line-height:1.45;\n  border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-border-l1,#444) 45%,transparent);cursor:default}\n.rt-trow:hover{background:var(--dsw-alias-bg-layer-2)}\n.rt-trow[role="button"]{cursor:pointer}\n.rt-trow[role="button"]:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}\n.rt-trow-root{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#2a2a2a) 38%,transparent);font-weight:600}\n.rt-caret{display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;flex:none;\n  color:var(--dsw-alias-label-secondary);transition:transform .16s ease}\n.rt-caret.open{transform:rotate(90deg)}\n.rt-caret-leaf{opacity:0}\n.rt-env-dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--dsw-alias-label-secondary)}\n.rt-env-dot.ok{background:var(--xsdsh-ok);box-shadow:0 0 0 2px color-mix(in srgb,var(--xsdsh-ok) 22%,transparent)}\n.rt-env-dot.warn{background:var(--xsdsh-warn);box-shadow:0 0 0 2px color-mix(in srgb,var(--xsdsh-warn) 22%,transparent)}\n.rt-env-dot.miss{background:var(--xsdsh-bad);box-shadow:0 0 0 2px color-mix(in srgb,var(--xsdsh-bad) 22%,transparent)}\n.rt-tlabel{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:0 1 auto}\n.rt-tmeta{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:400;\n  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto;min-width:0}\n.rt-tkids{border-left:1px dashed color-mix(in srgb,var(--dsw-alias-border-l1,#444) 85%,transparent);margin-left:20px}\n.rt-env-body{padding:6px 10px 9px 0}\n.rt-env-inline{display:flex;gap:8px;align-items:center;margin-bottom:5px}\n.rt-env-field{display:block;font-size:12px;margin-bottom:7px}\n.rt-env-field-label{display:block;color:var(--dsw-alias-label-secondary)}\n.rt-env-path{font-size:11px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;line-height:1.55}\n.rt-env-note-warn{font-size:11px;color:var(--xsdsh-warn);overflow-wrap:anywhere;margin:3px 0}\n@media (prefers-reduced-motion: reduce){.rt-caret{transition:none}}\n\n/* Workspace content owns local scroll panes; navigation stays in the app shell. */\n.rt-workspace-content{display:flex;flex:1;flex-direction:column;min-width:0;min-height:0;height:100%;overflow:hidden;font-size:13px;line-height:1.5}\n/* 目标配置 / 全局配置这类表单页只有一层内容：让 .rt-body 自己滚，外层 .rt-pane 就不再截断。 */\n.rt-workspace-content>.rt-body{overflow:hidden}\n.rt-workspace-content>.rt-body>.xsdsh-config{overflow:auto}\n/* 目标页两层内容（配置 + 目标级提示词）共用一层滚动，避免两个滚动区互相挤压。 */\n.rt-workspace-content>.rt-body>.xsdsh-target-page{flex:1;min-height:0;display:flex;flex-direction:column;gap:14px;overflow:auto;overscroll-behavior:contain}\n.xsdsh-target-page>.xsdsh-config{flex:none;overflow:visible}\n.xsdsh-target-page>.xsdsh-target-prompts{flex:none;display:flex;flex-direction:column;gap:8px;padding-top:14px;border-top:1px solid var(--dsw-alias-border-l1,#e4e9f0)}\n.xsdsh-target-prompts-head h3{margin:0;font-size:13px;font-weight:650;color:var(--xsdsh-ink,#101828)}\n.xsdsh-target-prompts-head p{margin:4px 0 0;font-size:11.5px;line-height:1.6;color:var(--xsdsh-mute,#5b6b80)}\n.xsdsh-target-prompts .rt-card{margin:0;padding:12px}\n.xsdsh-target-prompts .rt-main{flex:none;min-height:auto;overflow:visible}\n.xsdsh-target-prompts .rt-textarea{min-height:280px;height:clamp(320px,42vh,520px);resize:vertical}\n.xsdsh-target-prompts .rt-pane{padding:10px 12px}\n.rt-workspace-content .rt-toolbar,.rt-workspace-content .rt-concl,.rt-workspace-content .rt-subtabs,.rt-workspace-content .rt-kb-filter{flex-shrink:0}\n.rt-workspace-content .rt-split{min-width:0;overflow:hidden}\n.rt-workspace-content .rt-table{min-height:0;overscroll-behavior:contain}\n/* 详情内容不足一屏时仍是滚动容器；contain 会把滚轮锁在详情里，导致列表滚不动。\n   保留 max-height/overflow 让长证据内部滚动，滚到边界后按默认行为冒泡给列表。 */\n.rt-workspace-content .rt-expand,.rt-workspace-content .rt-vdetail{max-height:52vh;overflow:auto;overscroll-behavior:auto}\n.rt-workspace-content .rt-side,.rt-workspace-content .rt-list{max-width:28%;box-sizing:border-box;min-width:140px;overscroll-behavior:contain}\n.rt-workspace-toolbar,.rt-workspace-footer,.rt-create{display:flex;align-items:center;flex-wrap:wrap;gap:8px;min-width:0}\n.rt-workspace-toolbar{width:100%}.rt-workspace-toolbar .rt-create{margin-left:auto}\n.rt-workspace-footer{font-size:11px}.rt-workspace-toolbar label{display:flex;align-items:center;gap:6px}\n.rt-workspace-toolbar .rt-eng-select{max-width:260px}\n.rt-select-label{font-size:12px;color:var(--rt-mute,#667)}\n\n/* ── 技能库（卡片网格 + 右侧详情） ─────────────────────────────── */\n.rt-skills{flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px 12px 12px;box-sizing:border-box}\n.rt-skills-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.rt-skills-title{display:flex;align-items:baseline;gap:8px;min-width:0}\n.rt-skills-title strong{font-size:13.5px}\n.rt-skills-counts{font-size:11px;color:var(--xsdsh-mute,#5b6b80)}\n.rt-skills-actions{margin-left:auto;display:flex;align-items:center;gap:6px;flex-wrap:wrap}\n.rt-skills-sumline{display:flex;align-items:center;gap:5px;flex-wrap:wrap}\n.rt-skills-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.rt-skills-search{flex:1;min-width:160px}\n/* 分段控件（技能范围） */\n.rt-segbar{display:inline-flex;background:var(--xsdsh-panel2,#f8fafc);border:1px solid var(--xsdsh-line,#e4e9f0);border-radius:8px;padding:2px;gap:2px}\n.rt-segbar-btn{border:0;background:transparent;color:var(--xsdsh-mute,#5b6b80);font:inherit;font-size:11.5px;\n  padding:3px 9px;border-radius:6px;cursor:pointer;white-space:nowrap}\n.rt-segbar-btn:hover{color:var(--xsdsh-ink,#101828);background:var(--xsdsh-hover,#eef3f9)}\n.rt-segbar-btn.on{background:var(--xsdsh-panel,#fff);color:var(--xsdsh-ink,#101828);font-weight:600;\n  box-shadow:0 1px 3px rgba(16,24,40,.10)}\n.rt-gap-chip{border:1px solid var(--xsdsh-line,#e4e9f0);background:var(--xsdsh-panel,#fff);color:var(--xsdsh-mute,#5b6b80);\n  font:inherit;font-size:11.5px;padding:3px 9px;border-radius:999px;cursor:pointer;white-space:nowrap}\n.rt-gap-chip:hover{background:var(--xsdsh-hover,#eef3f9);color:var(--xsdsh-ink,#101828)}\n.rt-gap-chip.on{border-color:var(--xsdsh-bad);color:var(--xsdsh-bad);background:var(--xsdsh-bad-soft,rgba(208,36,26,.10))}\n/* 主体：宽屏并排，窄屏自动堆叠（不依赖容器查询，独立浮窗里也成立） */\n.rt-skills-body{flex:1;min-height:0;display:grid;gap:10px;overflow:hidden;\n  grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))}\n.rt-skills-grid-wrap{min-height:0;overflow:auto;overscroll-behavior:contain;padding-right:2px}\n.rt-skills-grid{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(min(100%,215px),1fr))}\n.rt-skill-card{display:flex;flex-direction:column;gap:5px;text-align:left;font:inherit;color:inherit;cursor:pointer;\n  border:1px solid var(--xsdsh-line,#e4e9f0);border-radius:10px;background:var(--xsdsh-panel,#fff);\n  padding:9px 10px;min-width:0;transition:border-color .15s var(--xsdsh-ease),box-shadow .15s var(--xsdsh-ease)}\n.rt-skill-card:hover{border-color:var(--xsdsh-line-hover,#aab7c8);box-shadow:0 4px 12px rgba(16,24,40,.08)}\n.rt-skill-card.on{border-color:var(--xsdsh-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--xsdsh-accent) 18%,transparent)}\n.rt-skill-card:focus-visible{outline:2px solid var(--xsdsh-accent);outline-offset:1px}\n.rt-skill-card-top{display:flex;align-items:center;gap:6px;min-width:0}\n.rt-skill-card-name{font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}\n.rt-skill-card-desc{font-size:11.5px;line-height:1.55;color:var(--xsdsh-mute,#5b6b80);\n  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.rt-skill-card-foot{display:flex;align-items:center;gap:5px;min-width:0}\n.rt-skill-card-meta{font-size:10.5px;color:var(--xsdsh-faint,#667282);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}\n.rt-skill-card-warn{font-size:10.5px;color:var(--xsdsh-warn);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-skills-detail{min-height:0;overflow:auto;overscroll-behavior:contain;padding:11px 12px;\n  border:1px solid var(--xsdsh-line,#e4e9f0);border-radius:10px;background:var(--xsdsh-panel2,#f8fafc)}\n.rt-skills-detail-head{display:flex;align-items:center;gap:7px;margin-bottom:8px;min-width:0}\n.rt-skills-detail-head strong{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}\n.rt-skills-blank{display:flex;flex-direction:column;gap:6px}\n.rt-skills-note{font-size:11.5px;color:var(--xsdsh-mute,#5b6b80);line-height:1.6;margin:0}\n.rt-skills-dir{font-size:10.5px;color:var(--xsdsh-faint,#667282);overflow-wrap:anywhere}\n.rt-skills-path{font-size:11px;word-break:break-all}\n.rt-skills-md{margin:8px 0 0;max-height:46vh;overflow:auto;padding:9px 10px;font-size:11.5px;\n  border:1px solid var(--xsdsh-line,#e4e9f0);border-radius:8px;background:var(--xsdsh-panel,#fff)}\n.rt-skills-detail .rt-kv{font-size:11.5px;line-height:1.65}\n\n/* ── 知识库头部压缩：三带从 ~124–200px 收到 ~95px，把高度让给列表 ── */\n.rt-kb-page{overflow:hidden}\n.rt-kb-head{display:flex;align-items:center;gap:8px;padding:5px 10px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}\n.rt-kb-headline{display:flex;align-items:baseline;gap:8px;min-width:0;flex:1}\n.rt-kb-headline strong{font-size:12.5px;white-space:nowrap}\n.rt-kb-counts{font-size:11px;color:var(--xsdsh-mute,#5b6b80);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.rt-kb-head-actions{display:flex;align-items:center;gap:6px;flex:none}\n/* 归类 chips 单行横滚：14 个类别不再换行吃掉三行高度 */\n.rt-kb-cats{display:flex;flex-wrap:nowrap;gap:5px;padding:4px 10px;overflow-x:auto;overflow-y:hidden;\n  border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;scrollbar-width:thin}\n.rt-kb-cats .rt-concl-i{flex:none;padding:1px 7px;white-space:nowrap}\n.rt-kb-cats .rt-concl-i b{font-size:11.5px}\n.rt-kb-cats .rt-concl-i>span{font-size:11px}\n.rt-kb-filter{padding:5px 10px;gap:6px;flex:none;flex-wrap:wrap}\n.rt-kb-filter .rt-input{padding:3px 8px}\n.rt-kb-filter .rt-kb-select{width:112px}\n';

// src/ui/features/drill/ui-state.js
var isFullWindow = () => {
  try {
    return String(window.location.hash || "") === "#redteam-full";
  } catch {
    return false;
  }
};
var ui = { open: true, tab: "assets" };
var subs = /* @__PURE__ */ new Set();
var setUI = (patch) => {
  ui = Object.assign({}, ui, patch);
  const snap = Object.assign({}, ui);
  for (const f of Array.from(subs)) {
    try {
      f(snap);
    } catch (error) {
      console.error("[drill] UI订阅更新失败", error);
    }
  }
};
var setDockWidth = () => {
};
var useUI = () => {
  const [st, setSt] = react_default.useState(() => Object.assign({}, ui));
  react_default.useEffect(() => {
    const f = (snap) => setSt(Object.assign({}, snap || ui));
    subs.add(f);
    setSt(Object.assign({}, ui));
    return () => {
      subs.delete(f);
    };
  }, []);
  return st;
};

// src/ui/features/drill/api.js
var api = (req) => fetch("/redteam/api", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(req)
}).then((res) => res.json());

// src/ui/features/drill/controller.ts
var message = (error) => error instanceof Error ? error.message : String(error);
function useDrillController({ enabled = true } = {}) {
  const [engagements, setEngagements] = react_default.useState([]);
  const [engagement, setEngagement] = react_default.useState(null);
  const [snapshot, setSnapshot] = react_default.useState(null);
  const [error, setError] = react_default.useState(null);
  const [loading, setLoading] = react_default.useState(true);
  const [creating, setCreating] = react_default.useState(false);
  const [newName, setNewName] = react_default.useState("");
  const [newUrl, setNewUrl] = react_default.useState("");
  const [refreshKey, setRefreshKey] = react_default.useState(0);
  const alive = react_default.useRef(false);
  const enabledRef = react_default.useRef(enabled);
  enabledRef.current = enabled;
  const generation = react_default.useRef(0);
  const current = react_default.useRef(null);
  const listSeq = react_default.useRef(0);
  const snapshotSeq = react_default.useRef(0);
  const selectionSeq = react_default.useRef(0);
  const createBusy = react_default.useRef(false);
  const activation = react_default.useRef(Promise.resolve());
  const loadSnapshot = react_default.useCallback(async (id) => {
    if (!alive.current || !enabledRef.current) return;
    const seq = ++snapshotSeq.current;
    if (!id) {
      setSnapshot(null);
      return;
    }
    try {
      const result = await api({ op: "snapshot", engagement: id });
      if (!alive.current || seq !== snapshotSeq.current || current.current !== id) return;
      if (!result || result.ok === false) {
        setError(result?.error || "加载失败");
        return;
      }
      setError(null);
      setSnapshot(result);
    } catch (e) {
      if (alive.current && seq === snapshotSeq.current && current.current === id) setError(message(e));
    }
  }, []);
  const select = react_default.useCallback((id) => {
    current.current = id;
    selectionSeq.current += 1;
    setEngagement(id);
    setSnapshot(null);
    setError(null);
    void loadSnapshot(id);
  }, [loadSnapshot]);
  const loadList = react_default.useCallback(async (initial = false) => {
    if (!alive.current || !enabledRef.current) return;
    const seq = ++listSeq.current;
    const selection = selectionSeq.current;
    try {
      const result = await api({ op: "bootstrap" });
      if (!alive.current || seq !== listSeq.current) return;
      if (!result || result.ok === false) {
        setError(result?.error || "无法连接资产库");
        return;
      }
      const list = result.engagements || [];
      setEngagements(list);
      if (initial && selection === selectionSeq.current) select(result.current || list[0]?.id || null);
    } catch (e) {
      if (alive.current && seq === listSeq.current) setError(message(e));
    } finally {
      if (alive.current && seq === listSeq.current) setLoading(false);
    }
  }, [select]);
  react_default.useEffect(() => {
    alive.current = true;
    generation.current += 1;
    setLoading(enabled);
    if (enabled) void loadList(true);
    else {
      current.current = null;
      setEngagement(null);
      setEngagements([]);
      setSnapshot(null);
      setError(null);
      setCreating(false);
    }
    return () => {
      alive.current = false;
      generation.current += 1;
      listSeq.current += 1;
      snapshotSeq.current += 1;
      selectionSeq.current += 1;
    };
  }, [loadList, enabled]);
  const selectEngagement = react_default.useCallback((id) => {
    if (!alive.current || !enabledRef.current) return;
    select(id || null);
    if (!id) return;
    const epoch = generation.current;
    activation.current = activation.current.then(async () => {
      if (!alive.current || !enabledRef.current || epoch !== generation.current) return;
      const result = await api({ op: "activateEngagement", engagement: id });
      if (alive.current && enabledRef.current && epoch === generation.current && current.current === id && (!result || result.ok === false)) setError(result?.error || "切换当前靶标失败");
    }).catch((error2) => {
      if (alive.current && enabledRef.current && epoch === generation.current && current.current === id) setError(message(error2));
    });
  }, [select]);
  const openEngagement = react_default.useCallback(async (nameArg, urlArg) => {
    const name = String(nameArg || newName).trim();
    const target_url = String(urlArg === void 0 ? newUrl : urlArg).trim();
    if (!alive.current || !enabledRef.current || !name && !target_url || createBusy.current) return;
    const epoch = generation.current;
    createBusy.current = true;
    setCreating(true);
    const selection = selectionSeq.current;
    try {
      const result = await api({ op: "openEngagement", name, ...target_url ? { target_url } : {} });
      if (!alive.current || !enabledRef.current || epoch !== generation.current) return;
      if (!result || result.ok === false) {
        setError(result?.error || "创建失败");
        return;
      }
      setNewName("");
      setNewUrl("");
      if (selection === selectionSeq.current && result.engagement?.id) select(result.engagement.id);
      void loadList();
    } catch (e) {
      if (alive.current && enabledRef.current && epoch === generation.current) setError(message(e));
    } finally {
      createBusy.current = false;
      if (alive.current && epoch === generation.current) setCreating(false);
    }
  }, [newName, newUrl, select, loadList]);
  const refreshSnapshot = react_default.useCallback(() => {
    void loadSnapshot(current.current);
  }, [loadSnapshot]);
  const refreshList = react_default.useCallback(() => {
    void loadList();
  }, [loadList]);
  const deleteEngagement = react_default.useCallback(async (id) => {
    if (!alive.current || !enabledRef.current || !id) return false;
    const epoch = generation.current;
    try {
      const result = await api({ op: "deleteEngagement", engagement: id });
      if (!alive.current || !enabledRef.current || epoch !== generation.current) return false;
      if (!result || result.ok === false) {
        setError(result?.error || "删除靶标失败");
        return false;
      }
      setError(null);
      const wasCurrent = current.current === id;
      if (wasCurrent) select(null);
      await loadList(wasCurrent);
      return true;
    } catch (e) {
      if (alive.current && enabledRef.current && epoch === generation.current) setError(message(e));
      return false;
    }
  }, [select, loadList]);
  const refreshAll = react_default.useCallback(() => {
    setRefreshKey((key) => key + 1);
    void loadList();
    void loadSnapshot(current.current);
  }, [loadList, loadSnapshot]);
  return {
    engagements,
    engagement,
    snapshot,
    error,
    loading,
    creating,
    newName,
    newUrl,
    setNewName,
    setNewUrl,
    selectEngagement,
    openEngagement,
    deleteEngagement,
    refreshList,
    refreshAll,
    refreshSnapshot,
    refreshKey
  };
}

// src/ui/features/drill/drill-toolbar.css
var drill_toolbar_default = ".rt-target-toolbar{position:relative;gap:8px;font-family:var(--xsdsh-sans,sans-serif)}\n.rt-target-toolbar .rt-target-label{flex:none;font-size:10.5px;color:var(--xsdsh-faint)}\n.rt-target-toolbar .rt-target-picker{position:relative;min-width:0;flex:1 1 300px;max-width:660px}\n.rt-target-toolbar .rt-target-current{display:flex;align-items:center;gap:8px;width:100%;min-width:0;padding:4px 10px;border:1px solid var(--xsdsh-accent);border-radius:10px;background:var(--xsdsh-panel2);color:var(--xsdsh-ink);font:inherit;text-align:left;cursor:pointer}\n.rt-target-toolbar .rt-target-identity{display:flex;align-items:center;gap:8px;flex:1;min-width:0}\n.rt-target-toolbar .rt-target-identity strong{flex:0 1 auto;max-width:56%;font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-target-toolbar .rt-target-option strong{display:block;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-target-toolbar .rt-target-missing{flex:none;font-style:normal;font-size:10px;line-height:16px;padding:0 6px;border-radius:99px;color:var(--xsdsh-na);background:var(--xsdsh-na-soft,rgba(143,161,171,.16))}\n.rt-target-toolbar .rt-target-identity small{flex:1 1 auto;min-width:0;color:var(--xsdsh-faint);font-size:10.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-target-toolbar .rt-target-option small{display:block;color:var(--xsdsh-mute);font-size:10.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-target-toolbar .rt-target-menu{position:absolute;left:0;top:calc(100% + 6px);width:540px;max-width:100%;box-sizing:border-box;z-index:40;border:1px solid var(--xsdsh-line);border-radius:12px;background:var(--xsdsh-panel);color:var(--xsdsh-ink);box-shadow:0 16px 36px rgb(35 54 82 / 20%);overflow:hidden}\n.rt-target-toolbar .rt-target-search{padding:9px 10px;border-bottom:1px solid var(--xsdsh-line)}\n.rt-target-toolbar .rt-target-search input{width:100%;box-sizing:border-box;min-width:0}\n.rt-target-toolbar .rt-target-rows{max-height:min(306px,40vh);overflow:auto;scrollbar-width:thin;scrollbar-color:var(--xsdsh-line) transparent}\n.rt-target-toolbar .rt-target-rows::-webkit-scrollbar{width:9px}\n.rt-target-toolbar .rt-target-rows::-webkit-scrollbar-thumb{background:var(--xsdsh-line);border:2px solid transparent;background-clip:padding-box;border-radius:9px}\n.rt-target-toolbar .rt-target-item{border-bottom:1px solid var(--xsdsh-line)}\n.rt-target-toolbar .rt-target-item:last-child{border-bottom:0}\n.rt-target-toolbar .rt-target-row{display:flex;align-items:center;gap:6px;padding-right:8px}\n.rt-target-toolbar .rt-target-row:hover{background:var(--xsdsh-panel2)}\n.rt-target-toolbar .rt-target-option{display:block;flex:1 1 auto;min-width:0;text-align:left;padding:8px 4px 8px 12px;border:0;font:inherit;background:transparent;color:inherit;cursor:pointer}\n.rt-target-toolbar .rt-target-option[aria-pressed=true]{background:var(--xsdsh-panel2);box-shadow:inset 3px 0 var(--xsdsh-accent)}\n.rt-target-toolbar .rt-target-del{display:inline-flex;align-items:center;justify-content:center;flex:none;width:26px;height:26px;padding:0;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--xsdsh-faint);font:inherit;line-height:1;cursor:pointer;transition:color .12s,border-color .12s,background .12s}\n.rt-target-toolbar .rt-target-del:hover:not(:disabled),.rt-target-toolbar .rt-target-del[aria-expanded=true]{color:var(--xsdsh-bad,#d92d20);border-color:var(--xsdsh-bad-line,rgba(217,45,32,.28));background:var(--xsdsh-bad-soft,rgba(217,45,32,.10))}\n.rt-target-toolbar .rt-target-del:disabled{opacity:.45;cursor:not-allowed}\n.rt-target-toolbar .rt-target-confirm{padding:8px 10px 9px;background:var(--xsdsh-panel2);border-top:1px dashed var(--xsdsh-line)}\n.rt-target-toolbar .rt-target-confirm p{margin:0 0 7px;font-size:11px;line-height:1.5;color:var(--xsdsh-mute)}\n.rt-target-toolbar .rt-target-confirm>div{display:flex;gap:6px}\n.rt-target-toolbar .rt-target-confirm .rt-btn{padding:3px 10px;font-size:11px}\n.rt-target-toolbar button:focus-visible{outline:2px solid var(--xsdsh-accent);outline-offset:-2px}\n.rt-target-toolbar .rt-target-empty{padding:16px 12px;font-size:12px;color:var(--xsdsh-mute)}\n.rt-target-toolbar .rt-target-menu-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:var(--xsdsh-panel2);font-size:10.5px}\n.rt-target-toolbar .rt-target-create{flex:1 1 100%;min-width:0}\n.rt-target-toolbar .rt-target-create .rt-create{margin:0}\n.rt-target-toolbar .rt-target-create input{min-width:0;flex:1 1 160px;max-width:100%;box-sizing:border-box}\n@container (max-width:620px){.rt-target-toolbar .rt-target-picker{flex:1 1 100%;max-width:100%}}\n";

// src/ui/features/drill/labels.ts
var NO_URL_LABEL = `未填网址`;

// src/ui/features/drill/helpers.js
var fmt = (s) => s ? String(s).replace("T", " ").slice(0, 16) : "—";
var fmtShort = (s) => {
  const t = String(s || "").replace("T", " ");
  return t.length >= 16 ? t.slice(5, 16) : t || "—";
};
var provLabel = (p) => p === "passive" ? "被动" : p === "active" ? "主动" : "未知";
var clickable = (onActivate, options = {}) => {
  const props = {
    role: "button",
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate(e);
      }
    }
  };
  if (options.label !== void 0) props["aria-label"] = String(options.label);
  if (options.expanded !== void 0) props["aria-expanded"] = options.expanded ? "true" : "false";
  return props;
};
var copyText = async (text2) => {
  const value = text2 === void 0 || text2 === null ? "" : String(text2);
  if (value === "") return false;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch (e) {
    console.debug("[drill] 剪贴板不可用，尝试本地复制", e);
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const okFlag = document.execCommand("copy");
    document.body.removeChild(ta);
    return okFlag === true;
  } catch (e) {
    return false;
  }
};
var copyWithFeedback = async (text2, label, onResult) => {
  const okFlag = await copyText(text2);
  const message2 = okFlag ? "已复制：" + label : "复制失败（浏览器未授权剪贴板）—— 请手动选中文本复制";
  if (typeof onResult === "function") onResult(okFlag, message2);
  return okFlag;
};
function targetKeyOf(v) {
  const t = String(v.target || "").trim();
  if (t !== "") {
    const url = /^([a-z][a-z0-9+.-]*:\/\/[^/?#\s]+)/i.exec(t);
    if (url) return url[1];
    const head = /^([^\s/?#]+)/.exec(t);
    if (head) return head[1];
    return t;
  }
  return v.asset_ip || "(未指定目标)";
}
function groupByStage(reportItems, chain) {
  const byId = new Map((reportItems || []).map((x) => [x.id, x]));
  const groups = [];
  const stageList = chain && chain.stages || [];
  stageList.forEach((st, si) => {
    const items = (st.items || []).map((x) => byId.get(x.id)).filter(Boolean);
    if (items.length === 0) return;
    groups.push({
      code: st.code,
      name: st.name,
      color: st.color || "#64748b",
      ordinal: st.ordinal || si + 1,
      points: st.points || 0,
      cumulative: st.cumulative || 0,
      items
    });
  });
  const grouped = new Set(groups.reduce((acc, g) => acc.concat(g.items.map((x) => x.id)), []));
  const rest = (reportItems || []).filter((x) => !grouped.has(x.id));
  if (rest.length > 0) {
    groups.push({
      code: "other",
      name: "其他得分",
      color: "#64748b",
      ordinal: groups.length + 1,
      points: rest.reduce((n, x) => n + (x.counted ? x.points : 0), 0),
      cumulative: 0,
      items: rest
    });
  }
  return groups;
}

// src/ui/features/drill/labels.js
var POC_CAT_NAME = {
  rce: "远程命令执行",
  deserialization: "反序列化",
  "file-upload": "文件上传 getshell",
  sqli: "SQL 注入",
  unauthorized: "未授权访问",
  "auth-bypass": "认证绕过 / 越权",
  "weak-password": "弱口令 / 爆破",
  ssrf: "SSRF",
  xxe: "XXE",
  "path-traversal": "目录穿越 / 任意文件读",
  "info-leak": "信息泄露",
  privesc: "提权 / 横向",
  tunnel: "隧道 / 代理",
  other: "其它"
};
var POC_CAT_ORDER = Object.keys(POC_CAT_NAME);
var ROLE_LABEL = {
  plan: "主会话（指挥）",
  recon: "信息收集",
  assess: "资产梳理",
  "vuln-scan": "漏洞发现",
  exploit: "漏洞利用",
  internal: "内网渗透"
};
var TEST_LABEL = { untested: "未测试", testing: "测试中", tested: "已测试", blocked: "被封禁", abandoned: "已放弃", no_surface: "无攻击面" };
var PRI_LABEL = { high: "高", medium: "中", low: "低" };
var SEV_LABEL = { critical: "严重", high: "高危", medium: "中危", low: "低危", info: "信息" };
var STATUS_LABEL = { candidate: "待验证", confirmed: "已确认", "false-positive": "误报", exploited: "已利用", fixed: "已修复" };
var sevClass = (s) => "rt-sev rt-sev-" + (SEV_LABEL[s] ? s : "info");
var FILE_KIND = { poc: "POC", exp: "EXP", script: "脚本", wordlist: "字典", other: "其他" };
var POC_KIND_LABEL = { poc: "POC", exp: "EXP", script: "脚本", template: "模板", payload: "载荷" };
var POC_SOURCE_LABEL = { web: "互联网", self: "手搓", manual: "人工", "nuclei-template": "nuclei 模板", kb: "知识库" };
var TEST_STATUS_LABEL = {
  untested: "未测试",
  testing: "测试中",
  tested: "已测试",
  blocked: "被封禁",
  abandoned: "已放弃",
  no_surface: "无攻击面"
};

// src/ui/features/drill/primitives.js
function ProvTag(props) {
  if (!props.p) return h("span", { className: "rt-tag" }, "未知");
  return h("span", { className: "rt-tag rt-tag-" + props.p }, provLabel(props.p));
}
function PriTag(props) {
  if (!props.p) return h("span", { className: "rt-tag" }, "未评");
  return h("span", { className: "rt-pri rt-pri-" + props.p, title: props.title || "" }, PRI_LABEL[props.p] || props.p);
}
function TestTag(props) {
  const st = props.s || "untested";
  return h("span", { className: "rt-test rt-test-" + st }, TEST_LABEL[st] || st);
}
var COLLAPSE_KEY = "rt-collapse-v2:";
var collapseLoad = (prefix) => {
  try {
    const raw = window.localStorage.getItem(COLLAPSE_KEY + prefix);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    return {};
  }
};
var collapseSave = (prefix, value) => {
  try {
    window.localStorage.setItem(COLLAPSE_KEY + prefix, JSON.stringify(value));
  } catch (e) {
    console.debug("[drill] 折叠状态仅在内存保留", e);
  }
};
function useCollapse(prefix) {
  const [state, setState] = react_default.useState(() => collapseLoad(prefix));
  react_default.useEffect(() => {
    setState(collapseLoad(prefix));
  }, [prefix]);
  const write = (next) => {
    collapseSave(prefix, next);
    setState(next);
  };
  const isOpen = (key, defaultOpen) => {
    const v = state[key];
    return v === void 0 ? defaultOpen === true : v === true;
  };
  const toggle = (key, defaultOpen) => (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    write(Object.assign({}, state, { [key]: !isOpen(key, defaultOpen) }));
  };
  const setAll = (keys, open) => {
    const next = Object.assign({}, state);
    for (const k of keys) next[k] = open;
    write(next);
  };
  return { isOpen, toggle, setAll };
}
function Section(props) {
  const always = props.always === true;
  const open = always || props.open === true;
  const head = h(
    "div",
    {
      className: "rt-sec t-" + (props.tone || "target") + (always ? " flat" : ""),
      role: always ? void 0 : "button",
      tabIndex: always ? void 0 : 0,
      "aria-expanded": always ? void 0 : open ? "true" : "false",
      onClick: always ? void 0 : props.onToggle,
      onKeyDown: always ? void 0 : (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (props.onToggle) props.onToggle(e);
        }
      }
    },
    h("span", { className: "rt-sec-caret" }, always ? "▍" : open ? "▾" : "▸"),
    props.title ? h("span", { className: "rt-sec-title" }, props.title) : null,
    props.count !== void 0 && props.count !== null ? h("span", { className: "rt-sec-count" }, String(props.count)) : null,
    props.sub ? h("span", { className: "rt-sec-sub" }, props.sub) : null,
    props.right ? h("span", { className: "rt-sec-right" }, props.right) : null
  );
  return h(
    "div",
    { className: "rt-sec-wrap" },
    head,
    open && props.children ? h("div", { className: "rt-sec-body" }, props.children) : null
  );
}
function Clip(props) {
  const [open, setOpen] = react_default.useState(false);
  const text2 = String(props.text === void 0 || props.text === null ? "" : props.text);
  if (text2.trim() === "") return null;
  return h(
    "div",
    { className: "rt-clip" + (open ? " open" : "") },
    h(
      "div",
      { className: "rt-clip-head" },
      props.label ? h("span", { className: "rt-clip-label" }, props.label) : null,
      h("div", { className: "rt-spacer" }),
      h("button", {
        className: "rt-btn",
        style: { padding: "0 6px", fontSize: 11 },
        onClick: (e) => {
          e.stopPropagation();
          copyText(text2);
        }
      }, "复制"),
      h("button", {
        className: "rt-btn",
        style: { padding: "0 6px", fontSize: 11 },
        onClick: (e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }
      }, open ? "收起" : "展开")
    ),
    h("div", { className: "rt-clip-body" }, text2)
  );
}
var RtBoundary = class extends react_default.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    console.error("[redteam-ui] 页面渲染出错:", error);
  }
  render() {
    if (this.state.error) {
      const msg = this.state.error && this.state.error.message ? this.state.error.message : String(this.state.error);
      return h(
        "div",
        { className: "rt-pane" },
        h("div", { className: "rt-err" }, "该页面渲染出错：" + msg),
        h("button", {
          className: "rt-btn",
          onClick: () => {
            this.setState({ error: null });
            if (this.props.onRetry) this.props.onRetry();
            else setUI({ tab: "assets" });
          }
        }, this.props.onRetry ? "重试当前页面" : "回到资产测绘")
      );
    }
    return this.props.children;
  }
};

// src/ui/features/drill/testing.js
function TestingTab(props) {
  const eng = props.engagement;
  const refreshKey = props.refreshKey || 0;
  const [data, setData] = react_default.useState(null);
  const [err, setErr] = react_default.useState(null);
  const [at, setAt] = react_default.useState(null);
  const [auto, setAuto] = react_default.useState(true);
  const collapse = useCollapse("testing:" + eng);
  const inflight = react_default.useRef(false);
  const seq = react_default.useRef(0);
  const load = react_default.useCallback(() => {
    if (!eng || inflight.current) return;
    inflight.current = true;
    const my = ++seq.current;
    api({ op: "activeTests", engagement: eng, limit: 20 }).then((r) => {
      if (my !== seq.current) return;
      if (!r || r.ok === false) {
        setErr(r && r.error || "读取失败");
        return;
      }
      setErr(null);
      setData(r);
      setAt(/* @__PURE__ */ new Date());
    }, (e) => {
      if (my === seq.current) setErr(String(e && e.message || e));
    }).finally(() => {
      if (my === seq.current) inflight.current = false;
    });
  }, [eng]);
  react_default.useEffect(() => {
    seq.current += 1;
    inflight.current = false;
    setData(null);
    setErr(null);
    load();
    return () => {
      seq.current += 1;
      inflight.current = false;
    };
  }, [eng, refreshKey, load]);
  react_default.useEffect(() => {
    if (!eng || !auto) return void 0;
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      load();
    }, 5e3);
    return () => clearInterval(timer);
  }, [eng, auto, refreshKey, load]);
  const testing = data && data.testing || [];
  const recent = data && data.recent || [];
  const queue = data && data.queue || [];
  const stats = data && data.stats || {};
  const card = (a, past) => {
    const chips = [];
    chips.push(h(
      "span",
      { key: "sc", className: "rt-scope rt-scope-" + (a.scope === "internal" ? "internal" : "external") },
      a.scope === "internal" ? "内网" : "外网"
    ));
    if (a.segment_cidr) chips.push(h("span", { key: "seg", className: "rt-tag" }, a.segment_cidr));
    if (a.open_ports) chips.push(h("span", { key: "p", className: "rt-tag rt-tag-active" }, "开放 " + a.open_ports + " 端口"));
    if (a.vulns) chips.push(h("span", { key: "v", className: "rt-tag rt-tag-live" }, "已确认漏洞 " + a.vulns));
    if (a.webshells) chips.push(h("span", { key: "w", className: "rt-tag rt-tag-passive" }, "WebShell " + a.webshells));
    if (a.tunnels) chips.push(h("span", { key: "t", className: "rt-tag rt-tag-passive" }, "隧道 " + a.tunnels));
    if (a.priority) chips.push(h("span", { key: "pr", className: "rt-tag" }, "易打 " + a.priority));
    if (a.blocked_count) chips.push(h("span", { key: "b", className: "rt-tag", style: { color: "#ef4444", borderColor: "#ef444455" } }, "被封 " + a.blocked_count + " 次"));
    const noteLines = a.test_notes ? String(a.test_notes).split("\n").slice(-3).map((l) => l.length > 240 ? l.slice(0, 240) + " …" : l) : [];
    return h(
      "div",
      { key: "at" + a.id, className: "rt-atest" + (past ? " past" : "") },
      h(
        "div",
        { className: "rt-atest-head" },
        past ? null : h("span", { className: "rt-live-dot" }),
        h("span", { className: "rt-atest-ip" }, a.ip),
        h("span", { className: "rt-tag " + (a.test_status === "testing" ? "rt-tag-live" : "") }, TEST_STATUS_LABEL[a.test_status] || a.test_status),
        h("div", { className: "rt-spacer" }),
        h(
          "span",
          { style: { fontSize: 11, color: "var(--dsw-alias-label-secondary)" } },
          fmt(a.test_updated_at) + (a.test_updated_by ? " · " + a.test_updated_by : "")
        )
      ),
      chips.length ? h("div", null, chips) : null,
      a.test_surface ? h("div", { className: "rt-atest-meta" }, "测试面：" + a.test_surface) : null,
      a.potential ? h("div", { className: "rt-atest-meta" }, "预期得分：" + a.potential) : null,
      noteLines.length ? h(Clip, { label: "测试记录", text: noteLines.join("\n") }) : null
    );
  };
  const concl = (label, value, tone) => h(
    "span",
    { key: label, className: "rt-concl-i", style: { cursor: "default" } },
    h("b", null, String(value || 0)),
    h("span", null, label)
  );
  const conclusion = h(
    "div",
    { className: "rt-concl" },
    concl("测试中", stats.testing, "live"),
    concl("待测", stats.untested, ""),
    concl("已测", stats.tested, ""),
    concl("放弃", (stats.abandoned || 0) + (stats.blocked || 0), ""),
    concl("无攻击面", stats.no_surface, ""),
    h("div", { className: "rt-spacer" }),
    at ? h(
      "span",
      { style: { fontSize: 11, color: "var(--dsw-alias-label-secondary)" } },
      "更新于 " + at.toLocaleTimeString("zh-CN", { hour12: false })
    ) : null,
    h("button", {
      className: "rt-btn",
      style: { padding: "0 7px", fontSize: 11 },
      title: "展开最近动过与待测队列",
      onClick: () => collapse.setAll(["testing:" + eng, "recent:" + eng, "queue:" + eng], true)
    }, "全部展开"),
    h("button", {
      className: "rt-btn",
      style: { padding: "0 7px", fontSize: 11 },
      title: "只留正在测",
      onClick: () => collapse.setAll(["testing:" + eng, "recent:" + eng, "queue:" + eng], false)
    }, "全部收起"),
    h("button", {
      className: "rt-btn" + (auto ? " rt-btn-primary" : ""),
      style: { padding: "0 7px", fontSize: 11 },
      title: "每 5 秒自动刷新",
      onClick: () => setAuto((x) => !x)
    }, auto ? "实时 · 5s" : "已暂停"),
    h("button", { className: "rt-btn", style: { padding: "0 7px", fontSize: 11 }, onClick: load }, "刷新")
  );
  const body = [];
  body.push(h(Section, {
    key: "testing",
    tone: "test",
    title: "正在测",
    count: testing.length + " 台",
    sub: testing.length ? "agent 正在打这些资产" : "agent 开始测某台资产后会实时出现在这里",
    open: collapse.isOpen("testing:" + eng),
    onToggle: collapse.toggle("testing:" + eng)
  }, testing.length ? testing.map((a) => card(a, false)) : h("div", { className: "rt-atest-meta", style: { paddingBottom: 4 } }, "当前没有资产处于「测试中」")));
  body.push(h(Section, {
    key: "recent",
    tone: "past",
    title: "最近动过",
    count: recent.length + " 台",
    sub: "已测过的资产",
    open: collapse.isOpen("recent:" + eng, false),
    onToggle: collapse.toggle("recent:" + eng, false)
  }, recent.length ? recent.map((a) => card(a, true)) : h("div", { className: "rt-atest-meta" }, "暂无")));
  body.push(h(Section, {
    key: "queue",
    tone: "queue",
    title: "待测队列",
    count: (data ? data.untested || 0 : 0) + " 台",
    sub: "按易打性与端口数排出先打哪几台",
    open: collapse.isOpen("queue:" + eng, false),
    onToggle: collapse.toggle("queue:" + eng, false)
  }, queue.length ? queue.map((a) => card(a, true)).concat([
    h(
      "div",
      { key: "queueHint", className: "rt-atest-meta", style: { paddingTop: 4 } },
      "完整清单（含筛选与排序）见「资产测绘」页"
    )
  ]) : h("div", { className: "rt-atest-meta" }, "没有待测资产")));
  return h(
    "div",
    { className: "rt-main" },
    conclusion,
    err ? h("div", { className: "rt-err" }, err) : null,
    data === null && !err ? h("div", { className: "rt-empty" }, "加载中…") : null,
    h(
      "div",
      { className: "rt-body", style: { overflow: "auto" } },
      h("div", { style: { padding: "6px 12px 14px" } }, body)
    )
  );
}

// src/ui/features/drill/discovery.js
function DiscoveryView(props) {
  const eng = props.engagement;
  const refreshKey = props.refreshKey || 0;
  const [data, setData] = react_default.useState(null);
  const [err, setErr] = react_default.useState(null);
  const [day, setDay] = react_default.useState("");
  react_default.useEffect(() => {
    if (!eng) return;
    setData(null);
    api({ op: "discoveryTimeline", engagement: eng, limit: 200 }).then(
      (r) => {
        if (!r || r.ok === false) setErr(r && r.error || "加载失败");
        else {
          setErr(null);
          setData(r);
        }
      },
      (e) => setErr(String(e && e.message || e))
    );
  }, [eng, refreshKey]);
  if (err) return h("div", { className: "rt-pane" }, h("div", { className: "rt-err" }, err));
  if (!data) return h("div", { className: "rt-empty" }, "加载中…");
  const recent = (data.recent || []).filter((a) => day === "" || String(a.discovered_at || "").slice(0, 10) === day);
  return h(
    "div",
    { className: "rt-pane", style: { flex: 1, minHeight: 0 } },
    h(
      "div",
      { className: "rt-card" },
      h("h4", null, "资产发现时间线"),
      h(
        "div",
        { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" } },
        "共 " + (data.span && data.span.total || 0) + " 台 · 最早 " + (data.span && data.span.first ? fmt(data.span.first) : "—") + " · 最近 " + (data.span && data.span.last ? fmt(data.span.last) : "—") + '（发现时间 = 第一次进入资产库的时刻；重复采集只刷新"最近采集"）'
      )
    ),
    (data.days || []).length === 0 ? h("div", { className: "rt-empty" }, "还没有资产。") : null,
    h(
      "div",
      { className: "rt-card" },
      h("h4", null, "按天统计", day ? h("span", Object.assign(
        { className: "rt-tag", style: { marginLeft: 6, cursor: "pointer" } },
        clickable(() => setDay(""), { label: "清除按天筛选：" + day })
      ), "清除筛选：" + day) : null),
      h(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
        (data.days || []).map((d) => h(
          "div",
          Object.assign({
            key: d.day,
            className: "rt-seg" + (day === d.day ? " on" : ""),
            style: { marginBottom: 0, cursor: "pointer" },
            title: d.day + "：新增 " + d.assets + " 台（内网 " + d.internal + " / 外网 " + d.external + "）"
          }, clickable(
            () => setDay(day === d.day ? "" : d.day),
            { label: "筛选 " + d.day + " 发现的资产", expanded: day === d.day }
          )),
          h("div", { className: "rt-seg-cidr" }, d.day),
          h("div", { className: "rt-seg-meta" }, d.assets + " 台 · 内 " + d.internal + " / 外 " + d.external)
        ))
      )
    ),
    h(
      "div",
      { className: "rt-card" },
      h("h4", null, day ? day + " 发现的资产（" + recent.length + "）" : "最近发现的资产（" + recent.length + "）"),
      recent.length === 0 ? h("div", { className: "rt-empty" }, "这一天没有新增资产。") : null,
      recent.map((a) => h(
        "div",
        { key: a.id, className: "rt-kv" },
        h(
          "b",
          { className: "rt-mono", style: { minWidth: 110 } },
          h(
            "span",
            { className: "rt-scope rt-scope-" + (a.scope === "internal" ? "internal" : "external"), style: { marginRight: 4 } },
            a.scope === "internal" ? "内" : "外"
          ),
          a.ip
        ),
        h(
          "span",
          { style: { minWidth: 132, fontSize: 11.5, color: "var(--dsw-alias-label-secondary)" } },
          a.discovered_at ? fmt(a.discovered_at) : "时间未知"
        ),
        h("span", { style: { flex: 1 } }, (a.primary_name || "—") + (a.open_ports ? " · " + a.open_ports + " 端口" : "")),
        h(PriTag, { p: a.priority })
      ))
    )
  );
}

// src/ui/features/drill/assets.css
var assets_default = ".rt-assets{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;overflow:hidden;container:rt-assets / inline-size;font-family:var(--xsdsh-sans,sans-serif)}\n.rt-assets .rt-assets-toolbar,.rt-assets .rt-assets-more,.rt-assets .rt-assets-stats{display:flex;align-items:center;flex-wrap:wrap;gap:6px;flex:none}\n.rt-assets .rt-assets-toolbar{padding:2px 0 6px}\n.rt-assets .rt-assets-views,.rt-assets .rt-assets-cidr,.rt-assets .rt-assets-search{display:flex;align-items:center;gap:4px;min-width:0}\n.rt-assets .rt-assets-views{flex:none}\n.rt-assets .rt-assets-toolbar .rt-btn{padding:3px 7px;font-size:11px;white-space:nowrap}\n.rt-assets .rt-assets-toolbar .rt-input{font-size:11px;padding:3px 5px;max-width:104px;min-width:0}\n.rt-assets .rt-assets-toolbar .rt-assets-cidr .purge-select{max-width:174px}\n.rt-assets .rt-assets-toolbar .purge-select{max-width:132px}\n.rt-assets .rt-assets-cidr{font-size:11px}\n.rt-assets .rt-assets-search{flex:1 1 130px}\n.rt-assets .rt-assets-search .rt-input{width:100%;max-width:none}\n.rt-assets .rt-assets-views [aria-pressed=true],.rt-assets .rt-assets-stat[aria-pressed=true]{background:var(--xsdsh-panel2);box-shadow:inset 0 -2px var(--xsdsh-accent)}\n.rt-assets .rt-assets-more{padding:7px 10px;border:1px solid var(--xsdsh-line);border-radius:9px;background:var(--xsdsh-panel2);margin:0 0 6px}\n.rt-assets .rt-assets-more input{width:130px;max-width:100%}\n.rt-assets .rt-assets-stats{padding:5px 0;border-bottom:1px solid var(--xsdsh-line);font-size:11px}\n.rt-assets .rt-assets-stats .rt-btn{font-size:10.5px;padding:2px 6px}\n.rt-assets .rt-assets-stats .purge-select{max-width:112px}\n.rt-assets .rt-assets-stat{font:inherit;border:0;border-radius:5px;color:inherit;background:transparent;padding:2px 3px;cursor:pointer}\n.rt-assets .rt-assets-list{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}\n.rt-assets .rt-assets-workspace{display:grid;grid-template-columns:minmax(0,1fr) 320px;flex:1;min-height:0;overflow:hidden;border:1px solid var(--xsdsh-line);border-top:0;border-radius:0 0 9px 9px}\n.rt-assets .rt-assets-table{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden}\n.rt-assets .rt-assets-rows{flex:1;min-height:0;overflow:auto;scrollbar-width:thin;overscroll-behavior:contain}\n.rt-assets .rt-assets-row{display:grid;grid-template-columns:150px 44px 92px minmax(90px,1fr) minmax(90px,1fr);gap:8px;align-items:center;padding:6px 10px;font-size:11.5px;border-bottom:1px solid var(--xsdsh-line);cursor:pointer}\n.rt-assets .rt-assets-row>span{min-width:0}\n.rt-assets .rt-assets-row small{display:block;font-size:9.5px;color:var(--xsdsh-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-assets .rt-assets-head{flex:none;color:var(--xsdsh-faint);background:var(--xsdsh-hover,var(--xsdsh-panel2));font-size:10.5px;cursor:default}\n.rt-assets .rt-assets-row.on{background:var(--xsdsh-panel2);box-shadow:inset 3px 0 var(--xsdsh-accent)}\n.rt-assets .rt-assets-row:hover{background:var(--xsdsh-panel2)}\n.rt-assets .rt-assets-ip{display:flex;align-items:center;gap:4px;min-width:0}\n.rt-assets .rt-assets-ip>span:last-child{min-width:0}\n.rt-assets .rt-assets-ip b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-assets .rt-assets-live{width:7px;height:7px;flex:none;border-radius:50%;background:var(--xsdsh-mute)}\n.rt-assets .rt-assets-live.on{background:var(--xsdsh-ok,#10b981)}\n.rt-assets .rt-assets-ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.rt-assets .rt-assets-detail{border-left:1px solid var(--xsdsh-line);background:var(--xsdsh-panel2);padding:12px;min-width:0;min-height:0;overflow:auto;scrollbar-width:thin;overflow-wrap:anywhere}\n.rt-assets .rt-assets-detail h3{font-size:15.5px;margin:0;line-height:1.35}\n.rt-assets .rt-assets-hint{font-size:11px;color:var(--xsdsh-mute);overflow-wrap:anywhere}\n.rt-assets .rt-assets-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 16px;margin:9px 0 0;padding-top:9px;border-top:1px solid var(--xsdsh-line)}\n.rt-assets .rt-assets-fact{min-width:0}\n.rt-assets .rt-assets-fact dt{font-size:11.5px;color:var(--xsdsh-mute)}\n.rt-assets .rt-assets-fact dd{font-size:13px;line-height:1.45;margin:0;overflow-wrap:anywhere}\n.rt-assets .rt-assets-detail details{margin-top:9px;border-top:1px solid var(--xsdsh-line);padding-top:7px}\n.rt-assets .rt-assets-detail summary{cursor:pointer;font-size:11px;color:var(--xsdsh-accent)}\n.rt-assets .rt-assets-record{font-size:11px;padding:3px 0;border-bottom:1px dashed var(--xsdsh-line)}\n.rt-assets .rt-assets-view{display:flex;flex-direction:column;flex:1;min-height:0;overflow:auto}\n.rt-assets .rt-assets-secondary{min-width:0;overflow-wrap:anywhere;padding:8px 0}\n.rt-assets button:focus-visible,.rt-assets [role=button]:focus-visible{outline:2px solid var(--xsdsh-accent);outline-offset:-2px}\n@container (max-width:820px){\n .rt-assets .rt-assets-list{overflow:auto}\n .rt-assets .rt-assets-workspace{display:block;flex:none;overflow:visible}\n .rt-assets .rt-assets-table,.rt-assets .rt-assets-rows{overflow:visible}\n .rt-assets .rt-assets-detail{border-left:0;border-top:1px solid var(--xsdsh-line);overflow:visible}\n}\n@container (max-width:760px){\n .rt-assets .rt-assets-row{grid-template-columns:104px 42px 62px minmax(70px,1fr);gap:6px;padding:6px 8px}\n .rt-assets .rt-assets-row>span:nth-child(5){display:none}\n}\n@container (max-width:520px){.rt-assets .rt-assets-facts{grid-template-columns:1fr}}\n@container (max-width:460px){\n .rt-assets .rt-assets-row{grid-template-columns:minmax(76px,1.2fr) 38px 56px minmax(54px,1fr);gap:4px;padding:5px}\n .rt-assets .rt-assets-toolbar .rt-assets-cidr .purge-select{max-width:150px}\n}\n";

// src/ui/features/drill/assets.js
function uniqueBy(list, keyOf) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const item of list || []) {
    const key = keyOf(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
function AssetsTab(props) {
  const eng = props.engagement;
  const refreshKey = props.refreshKey || 0;
  const [view, setView] = react_default.useState("list");
  const [cidr, setCidr] = react_default.useState("");
  const [q, setQ] = react_default.useState("");
  const [qApplied, setQApplied] = react_default.useState("");
  const [service, setService] = react_default.useState("");
  const [port, setPort] = react_default.useState("");
  const [prov, setProv] = react_default.useState("");
  const [testStatus, setTestStatus] = react_default.useState("");
  const [priority, setPriority] = react_default.useState("");
  const [scope, setScope] = react_default.useState("");
  const [assetState, setAssetState] = react_default.useState("");
  const [sort, setSort] = react_default.useState("priority");
  const [more, setMore] = react_default.useState(false);
  const [state, setState] = react_default.useState({ loading: false, error: null, total: 0, items: [] });
  const [domains, setDomains] = react_default.useState(null);
  const [web, setWeb] = react_default.useState(null);
  const [selection, setSelection] = react_default.useState(null);
  const [detail, setDetail] = react_default.useState(null);
  const [detailError, setDetailError] = react_default.useState(null);
  const seq = react_default.useRef(0);
  const detailSeq = react_default.useRef(0);
  const listRef = react_default.useRef(null);
  const detailRef = react_default.useRef(null);
  const revealedSelection = react_default.useRef(null);
  const onDataRef = react_default.useRef(props.onData);
  onDataRef.current = props.onData;
  react_default.useEffect(() => {
    if (!eng) return;
    const my = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    api({
      op: "assets",
      engagement: eng,
      cidr: cidr || void 0,
      q: qApplied || void 0,
      service: service || void 0,
      port: port || void 0,
      provenance: prov || void 0,
      test_status: testStatus || void 0,
      priority: priority || void 0,
      scope: scope || void 0,
      state: assetState || void 0,
      sort,
      limit: 400
    }).then((r) => {
      if (my !== seq.current) return;
      if (!r || r.ok === false) {
        setState({ loading: false, error: r && r.error || "查询失败", total: 0, items: [] });
        return;
      }
      setState({ loading: false, error: null, total: r.total ?? (r.items || []).length, items: r.items || [] });
      if (onDataRef.current) onDataRef.current();
    }, (e) => {
      if (my === seq.current) setState({ loading: false, error: String(e && e.message || e), total: 0, items: [] });
    });
    return () => {
      seq.current += 1;
    };
  }, [eng, cidr, qApplied, service, port, prov, testStatus, priority, scope, assetState, sort, refreshKey]);
  react_default.useEffect(() => {
    if (!eng || view !== "domain" && view !== "web") return;
    let alive = true;
    const save = view === "domain" ? setDomains : setWeb;
    save(null);
    api({ op: view === "domain" ? "domains" : "web", engagement: eng }).then((r) => {
      if (!alive) return;
      if (!r || r.ok === false) {
        save([]);
        setState((s) => ({ ...s, error: r?.error || "查询失败" }));
        return;
      }
      save(r.items || []);
    }, (e) => {
      if (alive) {
        save([]);
        setState((s) => ({ ...s, error: String(e) }));
      }
    });
    return () => {
      alive = false;
    };
  }, [eng, view, refreshKey]);
  react_default.useEffect(() => {
    const my = ++detailSeq.current;
    setDetail(null);
    setDetailError(null);
    if (!eng || !selection || selection.eng !== eng) return;
    api({ op: "asset", engagement: eng, id: selection.id }).then((r) => {
      if (my !== detailSeq.current) return;
      if (r && r.ok && r.asset) setDetail(r.asset);
      else setDetailError(r?.error || "资产详情加载失败");
    }, (error) => {
      if (my === detailSeq.current) setDetailError(String(error));
    });
    return () => {
      detailSeq.current += 1;
    };
  }, [eng, selection, refreshKey]);
  react_default.useEffect(() => {
    if (view !== "list" || !selection || selection.eng !== eng || state.loading) return;
    if (revealedSelection.current === selection || detail?.id !== selection.id && !detailError) return;
    const list = listRef.current;
    const panel = detailRef.current;
    const width = list?.closest(".rt-assets")?.clientWidth;
    if (!list || !panel || !width) return;
    revealedSelection.current = selection;
    if (width <= 820) {
      let scroller = list;
      const needed = panel.getBoundingClientRect().top - list.getBoundingClientRect().top - list.clientTop;
      let delta = needed;
      while (scroller && delta > 0) {
        const room = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;
        if (room > 0) scroller.scrollTop += Math.min(room, delta);
        const done = panel.getBoundingClientRect().top - list.getBoundingClientRect().top - list.clientTop;
        if (done <= 1) break;
        delta = done;
        scroller = scroller.parentElement;
      }
      panel.focus({ preventScroll: true });
    }
  }, [eng, view, selection, detail, detailError, state.loading]);
  const reset = () => {
    setCidr("");
    setQ("");
    setQApplied("");
    setService("");
    setPort("");
    setProv("");
    setTestStatus("");
    setPriority("");
    setScope("");
    setAssetState("");
    setSort("priority");
  };
  const selectAsset = (id) => setSelection({ eng, id });
  const jumpToAsset = (asset) => {
    reset();
    setQ(asset.ip);
    setQApplied(asset.ip);
    setView("list");
    selectAsset(asset.id ?? asset.asset_id);
  };
  const selectedId = selection?.eng === eng ? selection.id : null;
  const selected = state.items.find((item) => item.id === selectedId);
  const segs = props.snapshot?.segments || [];
  const tests = props.snapshot?.tests || {};
  const stats = props.snapshot?.stats || {};
  const select = (label, value, change, options) => h(PurgeSelect, {
    "aria-label": label,
    value,
    onChange: change,
    size: "sm",
    className: "rt-select",
    options: options.map(([id, text2]) => ({ value: id, label: text2 }))
  });
  const viewLabels = [["list", "列表"], ["timeline", "发现时间"], ["domain", "域名"], ["web", "Web"]];
  const toolbar = h(
    "div",
    { className: "rt-assets-toolbar" },
    h("div", { className: "rt-assets-views", role: "group", "aria-label": "资产视图" }, viewLabels.map(([id, label]) => h("button", { type: "button", key: id, className: "rt-btn", "aria-pressed": view === id, onClick: () => setView(id) }, label))),
    view === "list" ? h(
      react_default.Fragment,
      null,
      h("label", { className: "rt-assets-cidr" }, "C 段", select(
        "C 段",
        cidr,
        setCidr,
        [["", "全部 C 段"], ...segs.map((s) => [s.cidr, `${s.cidr} · ${s.scope === "internal" ? "内" : "外"}（${s.assets ?? 0} 台）`])]
      )),
      h(
        "form",
        { className: "rt-assets-search", onSubmit: (e) => {
          e.preventDefault();
          setQApplied(q);
        } },
        h("input", { className: "rt-input", "aria-label": "搜索资产", placeholder: "搜索 IP / 域名 / 指纹", value: q, onChange: (e) => setQ(e.target.value) }),
        h("button", { type: "submit", className: "rt-btn" }, "搜索")
      ),
      select("易打性", priority, setPriority, [["", "易打性不限"], ["high", "易打（高）"], ["medium", "一般（中）"], ["low", "难打（低）"]]),
      select("测试状态", testStatus, setTestStatus, [["", "测试状态不限"], ["untested", "未测试"], ["testing", "测试中"], ["tested", "已测试"], ["blocked", "被封禁"], ["abandoned", "已放弃"], ["no_surface", "无攻击面"]]),
      h("button", { type: "button", className: "rt-btn", "aria-expanded": more, onClick: () => setMore(!more) }, "更多"),
      h("button", { type: "button", className: "rt-btn", onClick: reset }, "重置")
    ) : h("span", { className: "rt-assets-hint" }, view === "testing" ? "当前测试 · 5 秒自动刷新" : viewLabels.find((x) => x[0] === view)?.[1])
  );
  const extraFilters = view === "list" && more ? h(
    "div",
    { className: "rt-assets-more" },
    select("内外网", scope, setScope, [["", "内外网不限"], ["external", "仅外网资产"], ["internal", "仅内网资产"]]),
    h("input", { className: "rt-input", "aria-label": "服务", placeholder: "服务，例如 nginx", value: service, onChange: (e) => setService(e.target.value) }),
    h("input", { className: "rt-input", "aria-label": "端口", placeholder: "端口，例如 443", value: port, onChange: (e) => setPort(e.target.value) }),
    select("来源", prov, setProv, [["", "来源不限"], ["passive", "仅被动"], ["active", "仅主动"]])
  ) : null;
  const statButton = (label, count, active, action) => h("button", {
    type: "button",
    className: "rt-assets-stat",
    "aria-pressed": active,
    onClick: action
  }, label, " ", count == null ? "—" : String(count));
  const toggleTest = (value) => {
    setTestStatus((cur) => cur === value ? "" : value);
    setAssetState("");
  };
  const conclusion = view === "list" ? h(
    "div",
    { className: "rt-assets-stats" },
    h("button", { type: "button", className: "rt-assets-stat", title: "列表单次最多 400 台；完整结果请用 redteam_asset_query 过滤或分页", onClick: reset }, `显示 ${state.items.length} / ${state.total} 台`),
    statButton("存活", stats.liveAssets, assetState === "live", () => {
      setAssetState((v) => v === "live" ? "" : "live");
      setTestStatus("");
    }),
    ...[["untested", "待测"], ["testing", "测试中"], ["tested", "已测"], ["abandoned,blocked", "放弃"], ["no_surface", "无攻击面"]].map(([id, label]) => h(react_default.Fragment, { key: id }, statButton(label, id === "abandoned,blocked" ? tests.abandoned == null && tests.blocked == null ? null : (tests.abandoned || 0) + (tests.blocked || 0) : tests[id], testStatus === id, () => toggleTest(id)))),
    h("span", { className: "rt-spacer" }),
    h("button", { type: "button", className: "rt-btn", onClick: () => setView("testing") }, "当前测试"),
    h("button", { type: "button", className: "rt-btn", onClick: props.onRefresh }, "刷新"),
    select("列表排序方式", sort, setSort, [["priority", "易打性优先"], ["todo", "待测优先"], ["discovered", "最近发现优先"], ["ports", "端口多优先"], ["ip", "按 IP"]]),
    state.total > state.items.length ? h(
      "span",
      { className: "rt-assets-hint", role: "status" },
      `共 ${state.total} 台，当前仅显示前 ${state.items.length} 台；完整结果请用 redteam_asset_query 过滤或分页。`
    ) : null
  ) : null;
  const rowNodes = state.items.map((it) => {
    const ports = (it.ports || []).filter((p) => p.state === "open");
    const fingerprints = (it.fingerprints || []).map((f) => [f.vendor, f.product, f.version].filter(Boolean).join(" ")).join(" / ");
    return h(
      "div",
      Object.assign(
        { key: it.id, className: "rt-assets-row" + (selectedId === it.id ? " on" : ""), "data-asset-id": it.id },
        clickable(() => selectAsset(it.id), { label: "查看资产 " + it.ip, expanded: selectedId === it.id })
      ),
      h(
        "span",
        { className: "rt-assets-ip" },
        h("span", { className: "rt-scope" }, it.scope === "internal" ? "内" : "外"),
        h("span", { className: "rt-assets-live" + (it.state === "live" ? " on" : ""), title: it.state === "live" ? "存活" : it.state || "状态未知" }),
        h("span", null, h("b", null, it.ip), h(
          "small",
          { title: "发现时间：" + fmt(it.discovered_at) },
          (it.names || []).map((n) => typeof n === "string" ? n : n.name).join(", ") || (it.discovered_at ? fmtShort(it.discovered_at) : "发现时间未知")
        ))
      ),
      h("span", null, h(PriTag, { p: it.priority }), h("small", { title: it.potential || "未评估" }, it.potential || "未评估")),
      h("span", null, h(TestTag, { s: it.test_status }), it.blocked_count ? h("small", null, "封 " + it.blocked_count) : null),
      h("span", { className: "rt-assets-ellipsis", title: ports.map((p) => `${p.port}/${p.service || "未知服务"}`).join(", ") }, ports.slice(0, 3).map((p) => `${p.port}${p.service ? "/" + p.service : ""}`).join(", ") || "—", ports.length > 3 ? ` +${ports.length - 3}` : ""),
      h("span", { className: "rt-assets-ellipsis", title: fingerprints }, fingerprints || "—")
    );
  });
  const d = detail && detail.id === selectedId ? detail : null;
  const fact = (label, value) => h("div", { className: "rt-assets-fact", key: label }, h("dt", null, label), h("dd", null, value));
  const portFacts = d && (d.ports || []).filter((p) => p.state === "open").map((p, index) => h(
    "div",
    { key: index },
    p.url ? h("a", { className: "rt-link", href: p.url, target: "_blank", rel: "noreferrer" }, `${p.port}/${p.service || p.proto || "未知服务"}`) : `${p.port}/${p.service || p.proto || "未知服务"}`,
    h(ProvTag, { p: p.provenance })
  ));
  const fpFacts = d && (d.fingerprints || []).map((f, index) => h(
    "div",
    { key: index },
    [f.vendor, f.product, f.version].filter(Boolean).join(" ") || "未记录",
    f.evidence ? " · " + f.evidence : "",
    h(ProvTag, { p: f.provenance })
  ));
  const detailPane = h(
    "aside",
    { ref: detailRef, tabIndex: -1, className: "rt-assets-detail", "aria-label": "资产详情", "aria-busy": selectedId != null && !d && !detailError },
    selectedId == null ? h("div", { className: "rt-empty" }, "选择左侧资产查看详情") : detailError ? h(
      "div",
      { role: "alert", className: "rt-err" },
      detailError,
      h("button", { type: "button", className: "rt-btn", onClick: () => selectAsset(selectedId) }, "重试")
    ) : !d ? h("div", { role: "status", className: "rt-empty" }, "加载资产详情…") : h(
      react_default.Fragment,
      null,
      h("h3", null, d.ip || selected?.ip),
      h("div", { className: "rt-assets-hint" }, (d.names || []).map((n) => typeof n === "string" ? n : n.name).join(", ") || "未记录主机名", " · ", d.segment_cidr || "未记录 C 段"),
      h(
        "dl",
        { className: "rt-assets-facts" },
        fact("易打性", h(react_default.Fragment, null, h(PriTag, { p: d.priority }), " ", d.potential || "未评估")),
        fact("攻击面", d.test_surface || "未记录"),
        fact("开放端口", portFacts.length ? portFacts : "无开放端口"),
        fact("指纹", fpFacts.length ? fpFacts : "未记录"),
        fact("首次发现", fmt(d.discovered_at)),
        fact("来源", `被动端口 ${d.passive ?? 0} · 主动端口 ${d.active ?? 0}`),
        fact("测试状态", h(react_default.Fragment, null, h(TestTag, { s: d.test_status }), d.blocked_count ? ` · 被封 ${d.blocked_count} 次` : "")),
        fact("最近采集", fmt(d.last_seen))
      ),
      h(
        "details",
        null,
        h("summary", null, "测试记录与采集溯源"),
        d.assess_reason ? h("p", null, "评估依据：", d.assess_reason) : null,
        h("p", null, "测试更新：", fmt(d.test_updated_at), d.test_updated_by ? " · " + d.test_updated_by : ""),
        h("p", null, "数据源首见：", fmt(d.first_seen)),
        d.test_notes ? h(Clip, { label: "测试记录", text: d.test_notes }) : h("p", null, "暂无测试记录"),
        h("h4", null, "采集溯源（最近 8 条）"),
        (d.observations || []).length ? d.observations.slice(0, 8).map((o, i) => h(
          "div",
          { className: "rt-assets-record", key: i },
          `${o.attr || "—"} = ${o.value || ""} · ${o.tool || "未知工具"} · ${fmt(o.collected_at)}`,
          h(ProvTag, { p: o.provenance })
        )) : h("p", null, "暂无采集记录")
      )
    )
  );
  const listPane = h("div", { ref: listRef, className: "rt-assets-list" }, h(
    "div",
    { className: "rt-assets-workspace" },
    h(
      "div",
      { className: "rt-assets-table" },
      h("div", { className: "rt-assets-row rt-assets-head" }, ...["IP / 主机", "易打", "测试状态", "开放端口 / 服务", "指纹"].map((label) => h("span", { key: label }, label))),
      h(
        "div",
        { className: "rt-assets-rows", "aria-busy": state.loading },
        rowNodes,
        state.loading ? h("div", { role: "status", className: "rt-empty" }, "加载资产…") : !state.items.length ? h("div", { className: "rt-empty" }, "没有匹配的资产。换个 C 段或清空搜索条件。") : null
      )
    ),
    detailPane
  ));
  const domainGroups = uniqueBy(domains, (g) => g.domain);
  const webItems = uniqueBy(web, (w) => w.port_id ?? `${w.asset_id}+${w.port}+${w.proto}`);
  let pane = listPane;
  if (view === "testing") pane = h(TestingTab, { engagement: eng, refreshKey });
  else if (view === "timeline") pane = h(DiscoveryView, { engagement: eng, refreshKey });
  else if (view === "domain") pane = h(
    "div",
    { className: "rt-assets-secondary" },
    domains === null ? "加载中…" : !domainGroups.length ? "暂无域名数据" : domainGroups.map((g) => h(
      "section",
      { className: "rt-card", key: g.domain },
      h("h4", null, h("a", { className: "rt-link", href: "http://" + g.domain, target: "_blank", rel: "noreferrer" }, g.domain)),
      uniqueBy(g.assets, (a) => a.id).map((a) => h("button", { type: "button", className: "rt-btn", key: a.id, onClick: () => jumpToAsset(a) }, a.ip))
    ))
  );
  else if (view === "web") pane = h(
    "div",
    { className: "rt-assets-secondary" },
    web === null ? "加载中…" : !webItems.length ? "暂无 Web 资产" : webItems.map((w) => {
      const url = w.url || `http${[443, 8443, 9443].includes(w.port) ? "s" : ""}://${w.ip}${[80, 443].includes(w.port) ? "" : ":" + w.port}`;
      return h(
        "section",
        { className: "rt-card", key: w.port_id },
        h("a", { className: "rt-link", href: url, target: "_blank", rel: "noreferrer" }, url),
        h("p", null, w.title || "未记录标题"),
        h("button", { type: "button", className: "rt-btn", onClick: () => jumpToAsset({ id: w.asset_id, ip: w.ip }) }, w.ip),
        h("span", null, " · ", [w.service, w.product, w.version].filter(Boolean).join(" ") || "未知服务")
      );
    })
  );
  return h(
    "div",
    { className: "rt-assets", "data-view": view },
    h("style", null, assets_default),
    toolbar,
    extraFilters,
    conclusion,
    state.error ? h("div", { className: "rt-err", role: "alert" }, state.error) : null,
    view === "list" ? pane : h("div", { className: "rt-assets-view" }, pane)
  );
}

// src/ui/features/drill/sessions.js
function SessionTab(props) {
  const eng = props.engagement;
  const refreshKey = props.refreshKey || 0;
  const [data, setData] = react_default.useState(null);
  const [err, setErr] = react_default.useState(null);
  const [busy, setBusy] = react_default.useState(false);
  const [msg, setMsg] = react_default.useState(null);
  const [copied, setCopied] = react_default.useState(null);
  const copyTimer = react_default.useRef(null);
  const mounted = react_default.useRef(false);
  react_default.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(copyTimer.current);
    };
  }, []);
  const load = () => {
    if (!eng) return;
    api({ op: "sessions", engagement: eng }).then((r) => {
      if (!r || r.ok === false) {
        setErr(r && r.error || "读取失败");
        return;
      }
      setErr(null);
      setData(r);
    }, (e) => setErr(String(e && e.message || e)));
  };
  react_default.useEffect(load, [eng, refreshKey]);
  const probe = () => {
    setBusy(true);
    setMsg(null);
    api({ op: "probeSessions", engagement: eng, timeoutMs: 6e3 }).then((r) => {
      setBusy(false);
      if (!r || r.ok === false) {
        setMsg({ err: r && r.error || "检测失败" });
        load();
        return;
      }
      const on = (r.webshells || []).filter((x) => x.status === "online").length;
      const act = (r.tunnels || []).filter((x) => x.status === "active").length;
      setMsg({ ok: "检测完成：WebShell 在线 " + on + "/" + (r.webshells || []).length + "，隧道可用 " + act + "/" + (r.tunnels || []).length });
      load();
    }, (e) => {
      setBusy(false);
      setMsg({ err: String(e && e.message || e) });
    });
  };
  const copy = (key, text2) => copyWithFeedback(text2, text2, (okFlag, message2) => {
    if (!mounted.current) return;
    if (!okFlag) {
      setMsg({ err: message2 });
      return;
    }
    setCopied(key);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied((c) => c === key ? null : c), 1500);
  });
  const markTunnel = (t, status) => {
    setMsg(null);
    api({ op: "updateTunnel", engagement: eng, id: t.id, patch: { status, check_note: "界面手动标记" } }).then(() => load(), (e) => setMsg({ err: String(e && e.message || e) }));
  };
  const markShell = (w, status) => {
    setMsg(null);
    api({ op: "updateWebshell", engagement: eng, id: w.id, patch: { status, check_note: "界面手动标记" } }).then(() => load(), (e) => setMsg({ err: String(e && e.message || e) }));
  };
  const sessCollapse = useCollapse("sessions:" + eng);
  const totals = data && data.totals || {};
  const shells = data && data.webshells || [];
  const tunnels = data && data.tunnels || [];
  const statusDot = (s) => h("span", { className: s === "online" || s === "active" ? "rt-dot-on" : s === "unknown" || !s ? "rt-dot-unk" : "rt-dot-off" });
  const fact = (label, value) => h("div", { className: "rt-sess-fact" }, h("b", null, label), h("span", null, value));
  const isEncryptedShell = (t) => /behinder|godzilla|冰蝎|哥斯拉/i.test(String(t || ""));
  const isSuo5 = (t) => /suo5/i.test(String(t || ""));
  const hint = (key, title, detail) => h(
    "div",
    { key, className: "rt-hint" },
    h("b", null, title),
    h(
      "details",
      { className: "rt-sess-fold", style: { marginTop: 3 } },
      h("summary", null, "怎么做（点击展开）"),
      h("div", { style: { marginTop: 4 } }, detail)
    )
  );
  const hints = [];
  const badShells = shells.filter((w) => !isEncryptedShell(w.shell_type));
  const legitTunnels = tunnels.filter((t) => t.legit === true);
  if (badShells.length > 0) {
    hints.push(hint(
      "h1",
      "有 " + badShells.length + " 个入口不是冰蝎马/哥斯拉马（用户连不上，不算可交付入口）",
      "用技能 webshell-toolkit 重新上传冰蝎马（behinder）或哥斯拉马（godzilla），并把 shell_type + pass_key 写进 redteam_webshell_add。只作临时中转的可在备注里写明。"
    ));
  }
  if (tunnels.length > 0 && legitTunnels.length === 0) {
    hints.push(hint(
      "h3",
      "现有 " + tunnels.length + ' 条通道都不算"跨越靶标边界"（不算边界/内网突破）',
      "自己的 VPS / 自建服务器上开的 socks5、frp、代理不算隧道。必须是目标侧发起的通道：目标反弹 shell 到我方、目标上跑 frp/Stowaway 客户端、或经目标 WebShell 建的 suo5/HTTP 隧道；登记时用 entry_kind 说明。"
    ));
  }
  const activeSuo5 = tunnels.filter((t) => isSuo5(t.kind) && t.status === "active");
  if (shells.length > 0 && activeSuo5.length === 0) {
    hints.push(hint(
      "h2",
      "还没有可用的 suo5 隧道（打进内网的标准通道）",
      "用技能 suo5-tunnel 通过上面的 WebShell 建 socks5 隧道，再 redteam_tunnel_add（kind=suo5、listen=127.0.0.1:1080、entry=WebShell URL、reach=可达网段）登记，最后点「检测连通性」确认 status=active。"
    ));
  }
  const shellCards = shells.map((w) => h(
    "div",
    { key: "w" + w.id, className: "rt-sess" },
    h(
      "div",
      { className: "rt-sess-head" },
      statusDot(w.status),
      h("span", { className: "rt-sess-title" }, w.url),
      h("span", { className: "rt-tag rt-tag-active" }, w.shell_type || "webshell"),
      isEncryptedShell(w.shell_type) ? null : h("span", { className: "rt-tag rt-tag-warn" }, "用户连不上"),
      w.privilege ? h("span", { className: "rt-tag" }, w.privilege) : null,
      h("div", { className: "rt-spacer" }),
      copied === "cmd" + w.id ? h("span", { className: "rt-tag", style: { color: "#10b981" } }, "已复制") : h("button", {
        className: "rt-btn",
        style: { padding: "0 6px", fontSize: 11 },
        onClick: () => copy("cmd" + w.id, 'curl -s "' + w.url + '"')
      }, "复制 URL"),
      h("button", {
        className: "rt-btn",
        style: { padding: "0 6px", fontSize: 11 },
        onClick: () => markShell(w, "offline")
      }, "标记失效")
    ),
    h(
      "div",
      { className: "rt-sess-facts" },
      fact("类型", isEncryptedShell(w.shell_type) ? "加密马（冰蝎/哥斯拉，用户可直连）" : "非加密马 —— 用户连不上，仅可作临时中转"),
      w.pass_key ? fact("连接口令", h("span", { className: "rt-mono" }, w.pass_key)) : null,
      w.asset_ip ? fact("所在资产", w.asset_ip) : null,
      w.privilege ? fact("权限", w.privilege) : null,
      w.secret_ref ? fact("凭据引用", h("span", { className: "rt-mono" }, w.secret_ref)) : null,
      fact("最后检测", (w.last_check ? fmt(w.last_check) : "未检测") + (w.latency_ms !== null && w.latency_ms !== void 0 ? "（" + w.latency_ms + "ms）" : "")),
      w.check_note ? fact("检测说明", w.check_note) : null,
      w.note ? fact("备注", w.note) : null
    )
  ));
  const tunnelCards = tunnels.map((t) => {
    const proxy = t.listen ? "socks5://" + t.listen : "";
    const gogoCmd = t.listen ? "./gogo -i <内网CIDR> -m ss --ping -p top2,win,db --proxy " + proxy : "";
    const fscanCmd = t.listen ? "./fscan -h <内网CIDR> -np -nobr -nopoc -socks5 " + t.listen + " -o intranet.txt" : "";
    return h(
      "div",
      { key: "t" + t.id, className: "rt-sess" },
      h(
        "div",
        { className: "rt-sess-head" },
        statusDot(t.status),
        h("span", { className: "rt-sess-title" }, t.listen || "(未填监听地址)"),
        h("span", { className: "rt-tag rt-tag-passive" }, t.kind || "tunnel"),
        isSuo5(t.kind) ? null : h("span", { className: "rt-tag rt-tag-warn" }, "非 suo5 标准通道"),
        /* 只有跨越靶标边界的通道才算突破凭证（自己 VPS/自建服务器上开的不算） */
        t.legit === true ? h("span", { className: "rt-tag rt-tag-live", title: t.entry_kind_label || "" }, "目标侧通道") : t.legit === false ? h("span", { className: "rt-tag rt-tag-warn", title: "只在自己 VPS/自建服务器上开的通道，没有碰到目标 —— 不算边界突破/内网突破" }, "不算突破") : h("span", { className: "rt-tag", title: "未声明 entry_kind：请说明目标侧的那一端是什么（target-outbound / target-http / target-agent）" }, "待确认"),
        t.reach ? h("span", { className: "rt-tag" }, "可达 " + t.reach) : null,
        h("div", { className: "rt-spacer" }),
        h("button", {
          className: "rt-btn",
          style: { padding: "0 6px", fontSize: 11 },
          onClick: () => copy("sock" + t.id, t.listen || "")
        }, copied === "sock" + t.id ? "已复制" : "复制地址"),
        t.status === "active" ? h("button", { className: "rt-btn", style: { padding: "0 6px", fontSize: 11 }, onClick: () => markTunnel(t, "down") }, "标记失效") : h("button", { className: "rt-btn", style: { padding: "0 6px", fontSize: 11 }, onClick: () => markTunnel(t, "active") }, "标记可用")
      ),
      h(
        "div",
        { className: "rt-sess-facts" },
        fact("目标侧入口", t.entry || "未登记"),
        fact("跨越边界", t.legit === true ? h("span", { className: "rt-tag rt-tag-live" }, t.entry_kind_label || t.entry_kind || "已确认目标侧") : t.legit === false ? h("span", { className: "rt-tag rt-tag-warn" }, "不算突破（只在自己 VPS 上开代理）") : h("span", { className: "rt-tag" }, "未声明 entry_kind，待确认")),
        t.reach ? fact("可达网段", t.reach) : null,
        t.asset_ip ? fact("所在资产", t.asset_ip) : null,
        fact("最后检测", (t.last_check ? fmt(t.last_check) : "未检测") + (t.latency_ms !== null && t.latency_ms !== void 0 ? "（" + t.latency_ms + "ms）" : "")),
        t.check_note ? fact("检测说明", t.check_note) : null,
        t.note ? fact("备注", t.note) : null
      ),
      /* 命令默认折叠：卡片首要信息是"这条通道能不能用、通向哪"，命令按需展开 */
      t.command ? h(
        "details",
        { className: "rt-sess-fold" },
        h("summary", null, "建立命令（点击展开 / 复制）"),
        h(
          "div",
          Object.assign({ className: "rt-code", title: "点击复制" }, clickable(() => copy("c" + t.id, t.command), { label: "复制命令" })),
          copied === "c" + t.id ? "已复制" : t.command
        )
      ) : null,
      t.status === "active" && t.listen ? h(
        "details",
        { className: "rt-sess-fold" },
        h("summary", null, "走这条隧道扫描（gogo / fscan 命令）"),
        h(
          "div",
          { className: "rt-sess-cmd" },
          h(
            "div",
            Object.assign({ className: "rt-code", title: "点击复制" }, clickable(() => copy("g" + t.id, gogoCmd), { label: "复制 gogo 命令" })),
            copied === "g" + t.id ? "已复制" : gogoCmd
          ),
          h(
            "div",
            Object.assign({ className: "rt-code", style: { display: "block", marginTop: 3 }, title: "点击复制" }, clickable(() => copy("f" + t.id, fscanCmd), { label: "复制 fscan 命令" })),
            copied === "f" + t.id ? "已复制" : fscanCmd
          )
        )
      ) : null
    );
  });
  return h(
    "div",
    { className: "rt-main" },
    h(
      "div",
      { className: "rt-toolbar" },
      h("span", { style: { fontWeight: 600 } }, "会话与入口"),
      h("span", { className: "rt-tag" }, "WebShell " + (totals.webshellsOnline || 0) + "/" + (totals.webshells || 0) + " 在线"),
      h("span", { className: "rt-tag" }, "隧道 " + (totals.tunnelsActive || 0) + "/" + (totals.tunnels || 0) + " 可用"),
      h("span", { className: "rt-tag" }, "凭据 " + (totals.credentials || 0)),
      h("span", { className: "rt-tag" }, "访问会话 " + (totals.access || 0)),
      h("div", { className: "rt-spacer" }),
      h("button", { className: "rt-btn rt-btn-primary", disabled: busy, onClick: probe }, busy ? "检测中…" : "检测连通性"),
      h("button", { className: "rt-btn", onClick: load }, "刷新")
    ),
    msg ? h("div", { className: msg.err ? "rt-err" : "rt-foot" }, msg.err || msg.ok) : null,
    err ? h("div", { className: "rt-err" }, err) : null,
    h(
      "div",
      { className: "rt-body", style: { overflow: "auto" } },
      !shells.length && !tunnels.length ? h(
        "div",
        { className: "rt-empty" },
        h("div", null, "还没有登记任何 WebShell 或隧道。"),
        h(
          "div",
          { style: { marginTop: 6, fontSize: 12 } },
          "拿到 WebShell 用 redteam_webshell_add；建好隧道用 redteam_tunnel_add（suo5 / socks5 / ssh -R）；之后智能体用 redteam_sessions 就能看到。"
        )
      ) : null,
      hints.length ? h("div", { style: { padding: "8px 10px 0" } }, hints) : null,
      h(Section, {
        key: "webshells",
        tone: "queue",
        title: "WebShell",
        count: (totals.webshellsOnline || 0) + "/" + (totals.webshells || 0) + " 在线",
        sub: "已上线的可控入口",
        open: sessCollapse.isOpen("shells"),
        onToggle: sessCollapse.toggle("shells")
      }, shells.length ? h("div", { className: "rt-sess-grid", style: { padding: 0 } }, shellCards) : h("div", { className: "rt-atest-meta" }, "暂无（拿到 WebShell 后用 redteam_webshell_add 登记）")),
      h(Section, {
        key: "tunnels",
        tone: "test",
        title: "内网隧道",
        count: (totals.tunnelsActive || 0) + "/" + (totals.tunnels || 0) + " 可用",
        sub: "可直接给扫描器当代理用",
        open: sessCollapse.isOpen("tunnels"),
        onToggle: sessCollapse.toggle("tunnels")
      }, tunnels.length ? h("div", { className: "rt-sess-grid", style: { padding: 0 } }, tunnelCards) : h("div", { className: "rt-atest-meta" }, "暂无（建好隧道后用 redteam_tunnel_add 登记）"))
    )
  );
}

// src/ui/features/drill/evidence.js
var shotCache = /* @__PURE__ */ new Map();
var shotLoading = /* @__PURE__ */ new Map();
var shotSrc = (eng, id) => shotCache.has(eng + ":" + id) ? shotCache.get(eng + ":" + id) : null;
var loadShot = (eng, id) => {
  const key = eng + ":" + id;
  if (shotCache.has(key)) return Promise.resolve(shotCache.get(key));
  if (shotLoading.has(key)) return shotLoading.get(key);
  const p = api({ op: "shotData", engagement: eng, id }).then((r) => {
    const src = r && r.base64 ? "data:" + (r.mime || "image/png") + ";base64," + r.base64 : "";
    shotCache.set(key, src);
    return src;
  }).catch(() => "").finally(() => {
    shotLoading.delete(key);
  });
  shotLoading.set(key, p);
  return p;
};
var SHOT_KIND = { screenshot: "现场截图", card: "记录生成的证据摘录" };
var ShotImage = ({ eng, shot, height }) => {
  const [zoom, setZoom] = react_default.useState(false);
  const [image, setImage] = react_default.useState(() => ({ key: eng + ":" + shot.id, src: shotSrc(eng, shot.id) }));
  const imageKey = eng + ":" + shot.id;
  const src = image.key === imageKey ? image.src : shotSrc(eng, shot.id);
  react_default.useEffect(() => {
    let alive = true;
    setZoom(false);
    loadShot(eng, shot.id).then((value) => {
      if (alive) setImage({ key: imageKey, src: value });
    });
    return () => {
      alive = false;
    };
  }, [eng, shot.id, imageKey]);
  const card = shot.kind === "card";
  return h(
    "div",
    { className: "rt-shot" },
    src === null ? h("div", { className: "rt-shot-thumb rt-shot-loading", style: { height: (height || 96) + "px" } }, "载入中…") : !src ? h("div", { className: "rt-shot-thumb rt-shot-loading" }, "证据图片不可用") : h("img", {
      className: "rt-shot-thumb",
      src,
      alt: shot.label || "证据 " + shot.id,
      style: { height: (height || 96) + "px", cursor: "zoom-in" },
      onClick: () => setZoom(true)
    }),
    h(
      "div",
      { className: "rt-shot-cap" },
      h("span", { className: "rt-tag " + (card ? "rt-tag-warn" : "rt-tag-live"), title: card ? "由当日记录生成的证据摘录，不是现场截图 —— 报告里同样会标注" : "现场截图" }, SHOT_KIND[shot.kind] || shot.kind || "证据"),
      h(
        "span",
        { className: "rt-shot-label", title: shot.label || shot.note || "" },
        shot.label || shot.target || "#" + shot.id
      )
    ),
    zoom ? h(
      "div",
      { className: "rt-shot-zoom", onClick: () => setZoom(false) },
      h("img", { src, alt: shot.label || "" }),
      h("div", { className: "rt-shot-zoom-cap" }, (shot.label || shot.target || "") + (card ? "　·　由当日记录生成（非现场截图）" : "") + (shot.captured_at ? "　·　" + fmt(shot.captured_at) : "") + "　·　点击任意处关闭")
    ) : null
  );
};
var ShotStrip = ({ eng, shots, total, title }) => {
  const list = shots || [];
  if (list.length === 0) return null;
  return h(
    "div",
    { className: "rt-shots" },
    h(
      "div",
      { className: "rt-shots-head" },
      h("b", null, title || "证据截图"),
      h("span", { className: "rt-shots-n" }, "显示 " + list.length + " 张" + (total && total > list.length ? "（该得分点共 " + total + " 张，取代表图）" : ""))
    ),
    h("div", { className: "rt-shot-row" }, list.map((sh) => h(ShotImage, { key: "sh" + sh.id, eng, shot: sh })))
  );
};
function HttpBlock(props) {
  const text2 = String(props.text || "");
  if (!text2) return null;
  const lines = text2.split(/\r?\n/);
  const nodes = lines.map((ln, i) => {
    let cls = null;
    if (i === 0 && /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH|TRACE)\s/.test(ln)) cls = "rt-hl-req";
    else if (i === 0 && /^HTTP\//.test(ln)) cls = "rt-hl-res";
    else if (/^[A-Za-z0-9-]+:/.test(ln)) {
      const name = ln.split(":")[0].toLowerCase();
      if (name === "host" || name === "cookie" || name === "authorization" || name === "content-type") cls = "rt-hl-req";
    }
    return h("div", { key: "l" + i, className: cls || void 0 }, ln === "" ? " " : ln);
  });
  return h("pre", { className: "rt-evi-body" + (props.compact ? " req" : "") }, nodes);
}
function detailEvidence(v) {
  const evi = String(v.evidence || "").trim();
  const looksHttp = /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH|HTTP\/)/m.test(evi) || /\n[A-Za-z-]+: /.test(evi);
  const blocks = [];
  if (evi) {
    blocks.push(h(
      "div",
      { key: "ev", className: "rt-evi" },
      h(
        "div",
        { className: "rt-evi-head" },
        "证据摘要",
        h("span", { className: "rt-tag" }, looksHttp ? "原始报文" : "文本"),
        h("div", { className: "rt-spacer" }),
        h("button", {
          className: "rt-btn",
          style: { padding: "0 6px", fontSize: 11 },
          onClick: (e) => {
            e.stopPropagation();
            copyText(evi);
          }
        }, "复制")
      ),
      looksHttp ? h(HttpBlock, { text: evi }) : h("pre", { className: "rt-evi-body" }, evi)
    ));
  }
  const http = v.http_evidence || [];
  for (const e of http) {
    blocks.push(h(
      "div",
      { key: "h" + e.id, className: "rt-evi" },
      h(
        "div",
        { className: "rt-evi-head" },
        e.label || "HTTP 证据",
        h("span", { className: "rt-tag" }, (e.method || "") + " " + (e.status === null || e.status === void 0 ? "" : e.status)),
        h("div", { className: "rt-spacer" }),
        h("span", { style: { fontWeight: 400, color: "var(--dsw-alias-label-secondary)" } }, fmt(e.captured_at || e.created_at))
      ),
      e.request ? h(
        "div",
        null,
        h("div", { className: "rt-evi-head", style: { borderTop: "none" } }, "▸ 请求（可直接粘进 Burp Repeater）"),
        h(HttpBlock, { text: e.request, compact: true })
      ) : null,
      e.response ? h(
        "div",
        null,
        h("div", { className: "rt-evi-head" }, "▸ 响应"),
        h(HttpBlock, { text: e.response })
      ) : null,
      e.note ? h("pre", { className: "rt-evi-body", style: { maxHeight: 80 } }, e.note) : null
    ));
  }
  if (blocks.length === 0) {
    blocks.push(h(
      "div",
      { key: "none", className: "rt-kv" },
      h("b", null, "证据"),
      h("span", { style: { color: "var(--dsw-alias-state-error-primary)" } }, "缺失 —— 未验证/无证据的漏洞不计入报告，请补 redteam_http_evidence_add")
    ));
  }
  return h("div", { key: "eviwrap" }, blocks);
}

// src/ui/features/drill/attack-files.js
function AttackFilesTab(props) {
  const eng = props.engagement;
  const refreshKey = props.refreshKey || 0;
  const [folders, setFolders] = react_default.useState([]);
  const [err, setErr] = react_default.useState(null);
  const [busy, setBusy] = react_default.useState(false);
  const collapse = useCollapse("files:" + eng);
  const [detail, setDetail] = react_default.useState(null);
  const load = () => {
    if (!eng) return;
    setBusy(true);
    api({ op: "attackFiles", engagement: eng }).then((r) => {
      setBusy(false);
      if (!r || r.ok === false) {
        setErr(r && r.error || "读取失败");
        return;
      }
      setErr(null);
      setFolders(r.items || []);
    }, (e) => {
      setBusy(false);
      setErr(String(e && e.message || e));
    });
  };
  react_default.useEffect(load, [eng, refreshKey]);
  const openFile = (f) => {
    if (detail && detail.id === f.id) {
      setDetail(null);
      return;
    }
    setDetail(null);
    api({ op: "readAttackFile", engagement: eng, id: f.id }).then((r) => {
      if (r && r.ok) setDetail(r);
      else setErr(r && r.error || "读取失败");
    }, (e) => setErr(String(e && e.message || e)));
  };
  const rows = [];
  for (const folder of folders) {
    const fKey = "folder:" + folder.folder;
    const fileNodes = [];
    for (const f of folder.files) {
      fileNodes.push(h(
        "div",
        {
          key: "a" + f.id,
          className: "rt-vrow",
          style: { gridTemplateColumns: "18px 1.2fr 60px 1.6fr", cursor: "pointer" },
          role: "button",
          tabIndex: 0,
          onClick: () => openFile(f),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openFile(f);
            }
          }
        },
        h("span", { className: "rt-sec-caret" }, detail && detail.id === f.id ? "▾" : "▸"),
        h("span", { className: "rt-mono" }, f.name),
        h("span", null, h("span", { className: "rt-tag rt-tag-active" }, FILE_KIND[f.kind] || f.kind || "—")),
        h("span", { style: { fontSize: 11.5, color: "var(--dsw-alias-label-secondary)" }, title: f.description || "" }, f.description || "—")
      ));
      if (!detail || detail.id !== f.id) continue;
      fileNodes.push(h("div", {
        key: "ad" + f.id,
        className: "rt-vrow",
        style: { cursor: "default", gridTemplateColumns: "1fr" }
      }, h(
        "div",
        { className: "rt-vdetail" },
        h("div", { className: "rt-kv" }, h("b", null, "效果"), h("span", null, detail.evidence || "—")),
        h("div", { className: "rt-kv" }, h("b", null, "路径"), h("span", { className: "rt-mono", style: { wordBreak: "break-all" } }, detail.path)),
        h("div", { className: "rt-kv" }, h("b", null, "记录"), h("span", null, fmt(detail.created_at) + (detail.created_by ? " · " + detail.created_by : ""))),
        h("pre", { className: "rt-md", style: { border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 6, maxHeight: "40vh", padding: "10px 12px" } }, detail.content || "（空）")
      )));
    }
    rows.push(h(Section, {
      key: "sec:" + folder.folder,
      tone: "folder",
      title: folder.folder + "/",
      count: folder.count + " 个文件",
      open: collapse.isOpen(fKey),
      onToggle: collapse.toggle(fKey)
    }, fileNodes.length ? fileNodes : h("div", { className: "rt-atest-meta" }, "（空）")));
  }
  const total = folders.reduce((n, f) => n + f.count, 0);
  return h(
    "div",
    { className: "rt-main" },
    h(
      "div",
      { className: "rt-toolbar" },
      h("span", { style: { fontWeight: 600 } }, "攻击文件"),
      h("span", { className: "rt-tag" }, folders.length + " 个目标 / " + total + " 个文件"),
      h("div", { className: "rt-spacer" }),
      h("button", { className: "rt-btn", disabled: busy, onClick: load }, busy ? "刷新中…" : "刷新")
    ),
    err ? h("div", { className: "rt-err" }, err) : null,
    h(
      "div",
      { className: "rt-table" },
      rows,
      !folders.length ? h("div", { className: "rt-empty" }, "暂无攻击文件（打通的脚本/POC/EXP 会按目标文件夹出现在这里）") : null
    ),
    h("div", { className: "rt-foot" }, h("span", null, "目录：attack-files/<IP|URL主机|C段>/ ｜ 只收录实际生效的文件"))
  );
}

// src/ui/features/drill/findings.js
function FindingsTab(props) {
  const eng = props.engagement;
  const refreshKey = props.refreshKey || 0;
  const [sev, setSev] = react_default.useState("");
  const [status, setStatus] = react_default.useState("");
  const [q, setQ] = react_default.useState("");
  const [qApplied, setQApplied] = react_default.useState("");
  const [state, setState] = react_default.useState({ loading: false, error: null, total: 0, items: [], stats: null });
  const [creds, setCreds] = react_default.useState([]);
  const [accesses, setAccesses] = react_default.useState([]);
  const [files, setFiles] = react_default.useState([]);
  const [openId, setOpenId] = react_default.useState(null);
  const [msg, setMsg] = react_default.useState(null);
  const [subTab, setSubTab] = react_default.useState("vulns");
  const [grouped, setGrouped] = react_default.useState(true);
  const collapse = useCollapse("findings:" + eng);
  const load = () => {
    if (!eng) return;
    api({
      op: "vulns",
      engagement: eng,
      severity: sev || void 0,
      status: status || void 0,
      q: qApplied || void 0,
      limit: 200
    }).then((r) => {
      if (!r || r.ok === false) {
        setState({ loading: false, error: r && r.error || "查询失败", total: 0, items: [], stats: null });
        return;
      }
      setState({ loading: false, error: null, total: r.total, items: r.items || [], stats: r.stats || null });
    }, (e) => setState({ loading: false, error: String(e && e.message || e), total: 0, items: [], stats: null }));
    api({ op: "credentials", engagement: eng }).then((r) => setCreds(r && r.items || []), () => {
    });
    api({ op: "access", engagement: eng }).then((r) => setAccesses(r && r.items || []), () => {
    });
    api({ op: "attackFiles", engagement: eng }).then((r) => setFiles(r && r.items || []), () => {
    });
  };
  react_default.useEffect(load, [eng, sev, status, qApplied, refreshKey]);
  const setVulnStatus = (id, next) => {
    setMsg(null);
    api({ op: "updateVuln", engagement: eng, id, patch: { status: next } }).then((r) => {
      if (!r || r.ok === false) {
        setMsg({ err: r && r.error || "更新失败" });
        return;
      }
      setMsg({ ok: "已更新为「" + (STATUS_LABEL[next] || next) + "」" });
      load();
    }, (e) => setMsg({ err: String(e && e.message || e) }));
  };
  const stats = state.stats && state.stats.bySeverity ? state.stats : { bySeverity: {}, byStatus: {} };
  const needRestart = state.error !== null && String(state.error).indexOf("unknown op") >= 0;
  const allFiles = (files || []).flatMap((g) => (g.files || []).map((f) => Object.assign({ target: g.target }, f)));
  const filesByVuln = /* @__PURE__ */ new Map();
  const orphanFiles = [];
  for (const f of allFiles) {
    const vid = f.vuln_id === null || f.vuln_id === void 0 ? null : Number(f.vuln_id);
    if (vid === null) {
      orphanFiles.push(f);
      continue;
    }
    if (!filesByVuln.has(vid)) filesByVuln.set(vid, []);
    filesByVuln.get(vid).push(f);
  }
  const concl = (key, label, value, active, onClick) => h(
    "span",
    Object.assign({
      key,
      className: "rt-concl-i" + (active ? " on" : ""),
      title: "点击筛选 / 再点取消"
    }, clickable(onClick, { label: "按「" + label + "」筛选（" + (value || 0) + "）", expanded: active })),
    h("b", null, String(value || 0)),
    h("span", null, label)
  );
  const conclusion = h(
    "div",
    { className: "rt-concl" },
    concl("conf", "已确认", stats.byStatus.confirmed || 0, status === "confirmed", () => setStatus((v) => v === "confirmed" ? "" : "confirmed")),
    concl("exp", "已利用", stats.byStatus.exploited || 0, status === "exploited", () => setStatus((v) => v === "exploited" ? "" : "exploited")),
    concl("crit", "严重", stats.bySeverity.critical || 0, sev === "critical", () => setSev((v) => v === "critical" ? "" : "critical")),
    concl("high", "高危", stats.bySeverity.high || 0, sev === "high", () => setSev((v) => v === "high" ? "" : "high")),
    concl("med", "中危", stats.bySeverity.medium || 0, sev === "medium", () => setSev((v) => v === "medium" ? "" : "medium")),
    concl("gain", "拿到权限", stats.withGained || 0, false, () => {
    }),
    h("div", { className: "rt-spacer" }),
    h(
      "span",
      { style: { fontSize: 11, color: "var(--dsw-alias-label-secondary)" } },
      "默认按目标聚合 · 共 " + (stats.targetGroups || 0) + " 个目标"
    )
  );
  const capHint = (state.total || 0) > state.items.length ? h(
    "div",
    { className: "rt-hint", role: "status" },
    "共 " + state.total + " 条，当前仅显示前 " + state.items.length + " 条；完整结果请用 redteam_vuln_query 按等级/状态/关键字过滤。"
  ) : null;
  const head = h(
    "div",
    { className: "rt-vrow head" },
    h("span", null, "等级"),
    h("span", null, "漏洞 / 编号"),
    h("span", null, "目标"),
    h("span", null, "拿到什么"),
    h("span", null, "状态"),
    h("span", null, "置信")
  );
  const vulnRows = (v, compact) => {
    const out = [];
    const gainedList = String(v.gained || "").split(/[、,;，；]/).map((x) => x.trim()).filter(Boolean);
    const open = openId === v.id;
    out.push(h(
      "div",
      {
        key: "v" + v.id,
        className: "rt-vrow",
        role: "button",
        tabIndex: 0,
        style: compact ? { cursor: "pointer", gridTemplateColumns: "58px minmax(0,1fr) 104px 68px" } : { cursor: "pointer" },
        onClick: () => setOpenId(open ? null : v.id),
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpenId(open ? null : v.id);
          }
        }
      },
      h("span", null, h("span", { className: sevClass(v.severity) }, SEV_LABEL[v.severity] || v.severity)),
      h("span", { title: v.title || "" }, h("span", { className: "rt-sec-caret" }, open ? "▾" : "▸"), (v.cve ? v.cve + " " : "") + (v.title || "")),
      compact ? null : h("span", { className: "rt-mono", title: v.target || "" }, v.target || v.asset_ip || "—"),
      h(
        "span",
        { title: v.gained || "" },
        gainedList.length ? h("span", { className: "rt-gain", style: { maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" } }, gainedList[0] + (gainedList.length > 1 ? " +" + (gainedList.length - 1) : "")) : h("span", { style: { color: "var(--dsw-alias-label-secondary)" } }, "—")
      ),
      h("span", null, h("span", { className: "rt-tag" }, STATUS_LABEL[v.status] || v.status)),
      compact ? null : h("span", null, v.confidence === null || v.confidence === void 0 ? "—" : Math.round(v.confidence * 100) + "%")
    ));
    if (openId !== v.id) return out;
    out.push(h("div", {
      key: "vd" + v.id,
      className: "rt-vrow",
      style: { cursor: "default", gridTemplateColumns: "1fr" }
    }, h(
      "div",
      { className: "rt-vdetail" },
      h(
        "div",
        { className: "rt-kv" },
        h("b", null, "拿到什么"),
        gainedList.length ? h("span", null, gainedList.map((g, gi) => h("span", { key: "g" + gi, className: "rt-gain", style: { marginRight: 6 } }, g))) : h(
          "span",
          { style: { color: "var(--dsw-alias-label-secondary)" } },
          "未记录 —— 拿到权限/成果后请用 redteam_vuln_update 补 gained（例：服务器权限、内网隧道、后台管理员账号）"
        )
      ),
      h("div", { className: "rt-kv" }, h("b", null, "目标"), h("span", { className: "rt-mono", style: { wordBreak: "break-all" } }, v.target || "—")),
      h("div", { className: "rt-kv" }, h("b", null, "资产"), h("span", null, (v.asset_ip || "—") + " · " + (v.segment_cidr || ""))),
      h("div", { className: "rt-kv" }, h("b", null, "来源"), h("span", null, (v.source || "—") + " · " + (v.found_by_agent || "—") + " · " + fmt(v.found_at))),
      detailEvidence(v),
      (() => {
        const mine = filesByVuln.get(Number(v.id)) || [];
        return h(
          "div",
          { className: "rt-kv" },
          h("b", null, "攻击文件"),
          mine.length ? h("span", null, mine.map((f, fi) => h(
            "div",
            { key: "af" + fi, style: { marginBottom: 3 } },
            "· " + (f.kind ? "[" + f.kind + "] " : "") + (f.name || "(未命名)") + (f.description ? " — " + f.description : ""),
            h("div", { className: "rt-mono", style: { fontSize: 11, marginLeft: 12, color: "var(--dsw-alias-label-secondary)", overflowWrap: "anywhere" } }, f.path || "")
          ))) : h(
            "span",
            { style: { color: "var(--dsw-alias-label-secondary)" } },
            "（无）用 redteam_attack_file_add 把这条漏洞打通的脚本/马/EXP 归档，并带上 vuln_id"
          )
        );
      })(),
      h(
        "div",
        { className: "rt-actions" },
        h("button", { className: "rt-btn", onClick: (e) => {
          e.stopPropagation();
          setVulnStatus(v.id, "confirmed");
        } }, "确认"),
        h("button", { className: "rt-btn", onClick: (e) => {
          e.stopPropagation();
          setVulnStatus(v.id, "exploited");
        } }, "已利用"),
        h("button", { className: "rt-btn", onClick: (e) => {
          e.stopPropagation();
          setVulnStatus(v.id, "false-positive");
        } }, "误报"),
        h("button", { className: "rt-btn", onClick: (e) => {
          e.stopPropagation();
          setVulnStatus(v.id, "fixed");
        } }, "已修复")
      )
    )));
    return out;
  };
  const rows = [];
  if (grouped) {
    const groups = /* @__PURE__ */ new Map();
    for (const v of state.items) {
      const key = targetKeyOf(v);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(v);
    }
    const SEV_RANK = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    const list = Array.from(groups.entries()).map(([key, vs]) => ({
      key,
      vulns: vs,
      top: vs.slice().sort((a, b) => (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9))[0],
      gained: Array.from(new Set(vs.flatMap((v) => String(v.gained || "").split(/[、,;，；]/).map((x) => x.trim()).filter(Boolean)))),
      exploited: vs.filter((v) => v.status === "exploited").length
    })).sort((a, b) => (SEV_RANK[a.top.severity] ?? 9) - (SEV_RANK[b.top.severity] ?? 9) || b.vulns.length - a.vulns.length);
    for (const g of list) {
      const key = "target:" + g.key;
      const defOpen = false;
      rows.push(h(Section, {
        key: "sec:" + g.key,
        tone: "target",
        title: g.key,
        count: g.vulns.length + " 个漏洞",
        sub: [
          SEV_LABEL[g.top.severity] || g.top.severity,
          g.exploited ? "已利用 " + g.exploited : null,
          g.top.asset_ip && g.top.asset_ip !== g.key ? "资产 " + g.top.asset_ip : null
        ].filter(Boolean).join(" · "),
        right: g.gained.length ? g.gained.slice(0, 2).join(" / ") + (g.gained.length > 2 ? " +" + (g.gained.length - 2) : "") : "未记录权限",
        open: collapse.isOpen(key, defOpen),
        onToggle: collapse.toggle(key, defOpen)
      }, g.vulns.map((v) => vulnRows(v, true))));
    }
    if (!list.length && !state.loading && !state.error) {
      rows.push(h("div", { key: "none", className: "rt-empty" }, "暂无漏洞记录"));
    }
  } else {
    for (const v of state.items) rows.push(...vulnRows(v));
  }
  const toolbar = h(
    "div",
    { className: "rt-toolbar" },
    h("input", {
      className: "rt-input",
      style: { flex: "1 1 140px" },
      placeholder: "搜索标题 / CVE / 目标（回车）",
      value: q,
      onChange: (e) => setQ(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") setQApplied(q);
      }
    }),
    h("button", { className: "rt-btn", onClick: () => setQApplied(q) }, "搜索"),
    h(PurgeSelect, {
      "aria-label": "等级筛选",
      size: "sm",
      value: sev,
      onChange: setSev,
      options: [["", "全部等级"], ["critical", "严重"], ["high", "高危"], ["medium", "中危"], ["low", "低危"], ["info", "信息"]].map(([value, label]) => ({ value, label }))
    }),
    h(PurgeSelect, {
      "aria-label": "状态筛选",
      size: "sm",
      value: status,
      onChange: setStatus,
      options: [["", "全部状态"], ["candidate", "待验证"], ["confirmed", "已确认"], ["exploited", "已利用"], ["false-positive", "误报"], ["fixed", "已修复"]].map(([value, label]) => ({ value, label }))
    })
  );
  const credSection = h(
    "div",
    null,
    h("div", { className: "rt-section" }, "凭据 · " + creds.length + (creds.length ? "（明文直显，注意屏幕分享/录屏）" : "")),
    creds.length ? h("div", { style: { padding: "4px 10px 0" } }, creds.map((c) => h(
      "div",
      { key: "c" + c.id, className: "rt-cred" },
      h(
        "div",
        { className: "rt-cred-head" },
        h("span", { className: "rt-cred-host" }, c.host),
        c.username ? h("span", { className: "rt-tag" }, c.username) : null,
        h("span", { className: "rt-tag rt-tag-passive" }, c.secret_type || "password"),
        c.privilege ? h("span", { className: "rt-tag rt-tag-active" }, c.privilege) : null,
        h("div", { className: "rt-spacer" }),
        h("button", {
          className: "rt-btn",
          style: { padding: "0 6px", fontSize: 11 },
          onClick: (e) => {
            e.stopPropagation();
            copyText(String(c.secret_value || ""));
          }
        }, "复制")
      ),
      c.secret_value ? h("div", { className: "rt-secret", title: "点击可全选" }, c.secret_value) : h("div", { className: "rt-secret-none" }, "未记明文 —— 请用 redteam_credential_add 的 secret_value 补上，面板才能直显"),
      h(
        "div",
        { className: "rt-cred-meta" },
        [
          c.source ? "来源 " + c.source : null,
          c.tool ? "工具 " + c.tool : null,
          c.secret_ref ? "证据 " + c.secret_ref : null,
          c.found_by_agent ? "by " + c.found_by_agent : null,
          c.found_at ? fmt(c.found_at) : null
        ].filter(Boolean).join(" · ")
      ),
      c.note ? h("div", { className: "rt-cred-meta" }, "备注：" + c.note) : null
    ))) : h("div", { className: "rt-empty" }, "暂无凭据（拿到口令/密钥/Hash 后用 redteam_credential_add 落库，秒级可复用）")
  );
  const accessSection = h(
    "div",
    null,
    h("div", { className: "rt-section" }, "已获得访问会话 · " + accesses.length),
    accesses.length ? accesses.map((a) => h(
      "div",
      { key: "a" + a.id, className: "rt-vrow", style: { cursor: "default", gridTemplateColumns: "1fr 110px 80px 80px 1fr" } },
      h("span", { className: "rt-mono" }, a.host),
      h("span", null, a.username || "—"),
      h("span", null, h("span", { className: "rt-tag rt-tag-active" }, a.method || "—")),
      h("span", null, a.privilege || "—"),
      h("span", { className: "rt-mono", title: a.session_ref || "" }, a.session_ref || "—")
    )) : h("div", { className: "rt-empty" }, "暂无")
  );
  const subTabBtn = (key, label, n) => h(
    "span",
    Object.assign({
      className: "rt-subtab" + (subTab === key ? " on" : "")
    }, clickable(() => setSubTab(key), { label: label + "（" + n + "）", expanded: subTab === key })),
    label + " " + n
  );
  return h(
    "div",
    { className: "rt-main" },
    toolbar,
    conclusion,
    capHint,
    h(
      "div",
      { className: "rt-subtabs" },
      subTabBtn("vulns", "漏洞", state.total || 0),
      subTabBtn("files", "攻击文件", allFiles.length),
      subTabBtn("creds", "凭据", creds.length),
      subTabBtn("access", "访问会话", accesses.length),
      h("div", { className: "rt-spacer" }),
      grouped ? h("button", {
        className: "rt-btn",
        title: "展开所有目标",
        onClick: () => collapse.setAll((state.items || []).map((v) => "target:" + targetKeyOf(v)), true)
      }, "全部展开") : null,
      grouped ? h("button", {
        className: "rt-btn",
        title: "收起所有目标",
        onClick: () => collapse.setAll((state.items || []).map((v) => "target:" + targetKeyOf(v)), false)
      }, "全部收起") : null,
      h("button", {
        className: "rt-btn" + (grouped ? " rt-btn-primary" : ""),
        title: grouped ? "当前：按目标聚合（先看哪台被打下什么）" : "当前：平铺每条漏洞",
        onClick: () => setGrouped((g) => !g)
      }, grouped ? "按目标聚合" : "平铺列表")
    ),
    msg ? h("div", { className: msg.err ? "rt-err" : "rt-foot" }, msg.err || msg.ok) : null,
    needRestart ? h("div", { className: "rt-empty" }, "该模块的宿主代码已更新，需重启一次当前宿主（官方 exe / 社区版 / dsh web）后生效") : null,
    state.error && !needRestart ? h("div", { className: "rt-err" }, state.error) : null,
    subTab === "files" ? h(
      "div",
      { className: "rt-body", style: { overflow: "auto" } },
      h(
        "div",
        { className: "rt-hint", style: { marginBottom: 8 } },
        "攻击文件按靶标目录组织（原「攻击文件」页签）；每条漏洞的关联文件也能在该漏洞详情里直接看到。" + (orphanFiles.length ? " 目前有 " + orphanFiles.length + " 个文件没挂 vuln_id，建议补上以便与漏洞对应。" : "")
      ),
      h(AttackFilesTab, { engagement: eng, refreshKey })
    ) : subTab === "creds" ? h("div", { className: "rt-body", style: { overflow: "auto" } }, credSection) : subTab === "access" ? h("div", { className: "rt-body", style: { overflow: "auto" } }, accessSection) : h(
      "div",
      { className: "rt-table" },
      grouped ? null : head,
      rows,
      /* 分组视图的空态已由上面 rows 里的 'none' 行给出，这里只补平铺视图的。 */
      !grouped && !state.loading && !state.items.length && !state.error ? h("div", { className: "rt-empty" }, "暂无漏洞记录") : null
    )
  );
}

// src/ui/features/drill/chain.js
function ChainTab(props) {
  const eng = props.engagement;
  const refreshKey = props.refreshKey || 0;
  const [data, setData] = react_default.useState(null);
  const [err, setErr] = react_default.useState(null);
  const [loading, setLoading] = react_default.useState(false);
  const [view, setView] = react_default.useState("A");
  const [openId, setOpenId] = react_default.useState(null);
  const load = () => {
    if (!eng) return;
    setLoading(true);
    api({ op: "scoreChain", engagement: eng }).then((r) => {
      setLoading(false);
      if (!r || r.ok === false) {
        setErr(r && r.error || "读取失败");
        return;
      }
      setErr(null);
      setData(r);
    }, (e) => {
      setLoading(false);
      setErr(String(e && e.message || e));
    });
  };
  react_default.useEffect(load, [eng, refreshKey]);
  const stages = data && data.stages || [];
  const summary = data && data.summary || null;
  const toggle = (id) => setOpenId((cur) => cur === id ? null : id);
  const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥"];
  const hitDetail = (x) => h(
    "div",
    { className: "rt-flow-detail" },
    h("div", { className: "rt-kv" }, h("b", null, "目标"), h("span", { className: "rt-mono", style: { wordBreak: "break-all" } }, x.target || "—")),
    x.asset_ip ? h("div", { className: "rt-kv" }, h("b", null, "资产"), h("span", { className: "rt-mono" }, x.asset_ip)) : null,
    x.vuln_title ? h("div", { className: "rt-kv" }, h("b", null, "利用漏洞"), h("span", null, [x.vuln_cve, x.vuln_title].filter(Boolean).join(" "))) : null,
    h("div", { className: "rt-kv" }, h("b", null, "次数"), h(
      "span",
      null,
      "同类第 " + x.nth_of_point + " 次 · +" + (x.points || 0) + " 分"
    )),
    h("div", { className: "rt-kv" }, h("b", null, "记录"), h("span", null, fmt(x.recorded_at) + (x.recorded_by ? " · " + x.recorded_by : ""))),
    x.evidence ? h(Clip, { label: "结果与证据", text: x.evidence }) : null
  );
  const hitRow = (x) => h(
    "div",
    {
      key: "h" + x.id,
      className: "rt-ap-hit" + (openId === x.id ? " open" : ""),
      role: "button",
      tabIndex: 0,
      onClick: () => toggle(x.id),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle(x.id);
        }
      }
    },
    h(
      "div",
      { className: "rt-ap-hit-head" },
      h(
        "span",
        { className: "rt-ap-pts" + (x.counted ? "" : " uncounted"), title: x.capped_reason || void 0 },
        "+" + (x.counted ? x.points || 0 : 0)
      ),
      h("span", { className: "rt-ap-hit-name" }, x.point_name),
      x.capped ? h("span", { className: "rt-tag rt-tag-warn", title: x.capped_reason || "同一资产同一端口只算分值最高的一条" }, "服务已拿满 · 不计分") : null,
      x.nth_of_point > 1 ? h("span", { className: "rt-ap-nth" }, "第 " + x.nth_of_point + " 次") : null,
      h("span", { className: "rt-ap-hit-target" }, x.target || x.asset_ip || "—")
    ),
    x.action ? h(
      "div",
      { className: "rt-ap-act" + (x.action_inferred ? " inferred" : "") },
      "动作：" + (x.action.title || "（未命名步骤）") + (x.action_inferred ? "（推断）" : "")
    ) : null,
    openId === x.id ? hitDetail(x) : null
  );
  const assetRow = (a) => h(
    "div",
    { key: "a" + a.id, className: "rt-ap-asset" },
    h(
      "span",
      { className: "rt-scope rt-scope-" + (a.scope === "internal" ? "internal" : "external") },
      a.scope === "internal" ? "内" : "外"
    ),
    h("span", { className: "rt-mono", style: { fontWeight: 600 } }, a.ip),
    a.segment_cidr ? h("span", { className: "rt-ap-nth" }, a.segment_cidr) : null,
    h("span", { className: "rt-ap-nth" }, "端口 " + (a.open_ports || 0)),
    a.vulns ? h("span", { className: "rt-ap-nth" }, "漏洞 " + a.vulns) : null,
    a.priority ? h("span", { className: "rt-tag" }, "易打 " + a.priority) : null,
    h("div", { className: "rt-spacer" }),
    h("span", { className: "rt-ap-pts" }, "+" + (a.points || 0) + " 分"),
    h("span", { className: "rt-ap-nth" }, (a.hits || 0) + " 次")
  );
  const stageA = (st, i) => {
    const isRecon = st.code === "recon";
    const body = [];
    if (isRecon) {
      body.push(h("div", { key: "at", className: "rt-ap-sub" }, "拿到分数的资产 · " + st.assetCount + " 台"));
      body.push(h(
        "div",
        { key: "al", className: "rt-ap-assets" },
        st.assets.length ? st.assets.map(assetRow) : h("div", { className: "rt-ap-none" }, "还没有产生得分的资产")
      ));
    } else {
      body.push(h(
        "div",
        { key: "ht", className: "rt-ap-sub" },
        "本阶段命中 " + st.hits + " 次" + (st.points ? " · +" + st.points + " 分" : "")
      ));
      body.push(h(
        "div",
        { key: "hl", className: "rt-ap-hits" },
        st.items.length ? st.items.map(hitRow) : h("div", { className: "rt-ap-none" }, "本阶段还没有得分")
      ));
      if (st.code === "boundary") {
        const selfOnly = (st.tunnels_self_only || []).length;
        body.push(h(
          "div",
          { key: "tt", className: "rt-ap-sub" },
          "跨越靶标边界的通道 · " + st.tunnels.length + " 条" + (selfOnly ? "（另有 " + selfOnly + " 条只在自己 VPS/自建服务器上，不算突破）" : "")
        ));
        if (selfOnly && st.tunnels.length === 0) {
          body.push(h(
            "div",
            { key: "tw", className: "rt-ap-none" },
            "⚠️ 现有的通道都在自己的服务器上，没有碰到目标 —— 不计边界突破。需要目标侧发起的通道（反弹 shell 到我这 / 目标上跑 frp 客户端 / 经目标 WebShell 的 suo5）。"
          ));
        }
        body.push(h(
          "div",
          { key: "tl", className: "rt-ap-tunnels" },
          st.tunnels.length ? st.tunnels.map((t) => h(
            "div",
            { key: "t" + t.id, className: "rt-ap-tunnel" },
            h("span", { className: "rt-tag rt-tag-passive" }, t.kind || "tunnel"),
            h("span", { className: "rt-mono", style: { fontWeight: 600 } }, t.listen || "—"),
            h("span", {
              className: "rt-tag " + (t.status === "active" ? "rt-tag-live" : ""),
              style: t.status === "active" ? {} : { opacity: 0.7 }
            }, t.status === "active" ? "可用" : t.status || "未知"),
            h(
              "span",
              { className: "rt-ap-nth", style: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" } },
              "可达 " + (t.reach || "—")
            )
          )) : h("div", { className: "rt-ap-none" }, "还没有建立隧道（建好后用 redteam_tunnel_add 登记）")
        ));
      }
      if (st.assets.length && st.code !== "boundary") {
        body.push(h("div", { key: "at", className: "rt-ap-sub" }, "涉及资产 · " + st.assetCount + " 台"));
        body.push(h("div", { key: "al", className: "rt-ap-assets" }, st.assets.map(assetRow)));
      }
    }
    return h(
      "div",
      { key: "st" + st.code, className: "rt-ap-stage" },
      h(
        "div",
        { className: "rt-ap-head", style: { borderLeftColor: st.color } },
        h("span", { className: "rt-ap-no", style: { background: st.color } }, CIRCLED[i] || "0" + (i + 1)),
        h("span", { className: "rt-ap-name" }, st.name),
        st.subtitle ? h("span", { className: "rt-ap-en" }, st.subtitle) : null,
        h("div", { className: "rt-spacer" }),
        st.points > 0 ? h("span", { className: "rt-ap-pts", style: { background: st.color + "22", color: st.color, borderColor: st.color + "66" } }, "+" + st.points) : null,
        h("span", { className: "rt-ap-cum" }, "累计 " + st.cumulative + " 分")
      ),
      h(
        "div",
        { className: "rt-ap-goal", style: { borderLeftColor: st.color } },
        h("span", { className: "rt-ap-goal-tag", style: { color: st.color, borderColor: st.color + "66" } }, "阶段目标"),
        h("span", null, st.goal)
      ),
      h("div", { className: "rt-ap-result", style: { borderLeftColor: st.color } }, body),
      i < stages.length - 1 ? h(
        "div",
        { className: "rt-ap-trans" },
        h("span", { className: "rt-flow-arrow" }, "▼"),
        st.transition ? h("span", { className: "rt-ap-trans-t" }, st.transition) : null,
        h("span", { className: "rt-ap-trans-t", style: { marginLeft: "auto" } }, "累计 " + st.cumulative + " 分")
      ) : h(
        "div",
        { className: "rt-ap-trans" },
        h("span", { className: "rt-flow-arrow" }, "▼"),
        h("span", { className: "rt-ap-trans-t" }, "合计 " + (summary && summary.points || 0) + " 分")
      )
    );
  };
  const stageB = (st, i) => h(
    "div",
    { key: "c" + st.code, className: "rt-ap-col" },
    i > 0 ? h("span", { className: "rt-ap-col-arrow" }, "▶") : null,
    h(
      "div",
      { className: "rt-hcol", style: { borderTopColor: st.color } },
      h(
        "div",
        { className: "rt-ap-head", style: { borderLeftColor: st.color, padding: "5px 8px" } },
        h("span", { className: "rt-ap-no", style: { background: st.color, width: 16, height: 16, fontSize: 10 } }, String(i + 1)),
        h("span", { className: "rt-ap-name", style: { fontSize: 12 } }, st.name),
        h("div", { className: "rt-spacer" }),
        h("span", { className: "rt-ap-cum", style: { fontWeight: 700 } }, st.cumulative)
      ),
      h("div", { className: "rt-hcol-goal", title: st.goal }, st.goal),
      h(
        "div",
        { className: "rt-hcol-body" },
        st.code === "boundary" ? h(
          "div",
          null,
          h("div", { className: "rt-hcol-hit" }, h("span", { className: "rt-hcol-pts" }, "+" + st.points), h("span", { className: "rt-hcol-name" }, "隧道 " + st.tunnels.length + " 条")),
          st.tunnels.slice(0, 3).map((t) => h("div", { key: "t" + t.id, className: "rt-hcol-sub" }, "▸ " + (t.kind || "") + " " + (t.listen || "")))
        ) : st.code === "recon" ? h(
          "div",
          null,
          h("div", { className: "rt-hcol-hit" }, h("span", { className: "rt-hcol-pts" }, st.assetCount), h("span", { className: "rt-hcol-name" }, "台资产拿到分")),
          st.assets.slice(0, 6).map((a) => h(
            "div",
            { key: "a" + a.id, className: "rt-hcol-sub", title: a.ip + "  +" + a.points + " 分" },
            (a.scope === "internal" ? "内 " : "外 ") + a.ip + "  +" + a.points
          ))
        ) : h(
          "div",
          null,
          h("div", { className: "rt-hcol-hit" }, h("span", { className: "rt-hcol-pts" }, "+" + st.points), h("span", { className: "rt-hcol-name" }, st.hits + " 次命中")),
          st.items.slice(0, 6).map((x) => h(
            "div",
            { key: "c" + x.id, className: "rt-hcol-sub", title: x.point_name + "  " + (x.target || "") },
            h("span", { className: "rt-hcol-pts" }, "+" + x.points),
            h("span", { className: "rt-hcol-name" }, x.point_name)
          )),
          st.items.length > 6 ? h("div", { className: "rt-hcol-none" }, "…另有 " + (st.items.length - 6) + " 次") : null,
          st.assetCount ? h("div", { className: "rt-hcol-none" }, "涉及 " + st.assetCount + " 台资产") : null
        )
      )
    )
  );
  return h(
    "div",
    { className: "rt-main" },
    h(
      "div",
      { className: "rt-toolbar" },
      h("span", { style: { fontWeight: 600 } }, "攻击链"),
      h("span", { className: "rt-tag", style: { fontSize: 10.5 } }, "信息收集 → 互联网资产权限 → 边界突破 → 内网资产权限 → 靶标权限"),
      summary ? h("span", { className: "rt-tag rt-tag-live" }, "总分 " + summary.points + " 分") : null,
      h("div", { className: "rt-spacer" }),
      h("button", { className: "rt-btn" + (view === "A" ? " rt-btn-primary" : ""), title: "竖向攻击链：逐阶段向下看细节", onClick: () => setView("A") }, "链路 A"),
      h("button", { className: "rt-btn" + (view === "B" ? " rt-btn-primary" : ""), title: "横向攻击链：一屏看完五个阶段", onClick: () => setView("B") }, "链路 B"),
      h("button", { className: "rt-btn", disabled: loading, onClick: load }, loading ? "加载中…" : "刷新")
    ),
    err ? h("div", { className: "rt-err" }, err) : null,
    !stages.length && !err && data !== null ? h("div", { className: "rt-empty" }, "还没有得分记录。拿到成果后用 redteam_score_hit 记分，这条链才会长出来。") : view === "A" ? h("div", { className: "rt-ap" }, stages.map(stageA)) : h("div", { className: "rt-ap-h" }, stages.map(stageB))
  );
}

// src/ui/features/drill/scores.js
function ScoreTab(props) {
  const eng = props.engagement;
  const refreshKey = props.refreshKey || 0;
  const [data, setData] = react_default.useState(null);
  const [err, setErr] = react_default.useState(null);
  const [busy, setBusy] = react_default.useState(false);
  const [openId, setOpenId] = react_default.useState(null);
  const [form, setForm] = react_default.useState(null);
  const [msg, setMsg] = react_default.useState(null);
  const load = () => {
    if (!eng) return;
    setBusy(true);
    api({ op: "scores", engagement: eng }).then((r) => {
      setBusy(false);
      if (!r || r.ok === false) {
        setErr(r && r.error || "读取失败");
        return;
      }
      setErr(null);
      setData(r);
    }, (e) => {
      setBusy(false);
      setErr(String(e && e.message || e));
    });
  };
  react_default.useEffect(load, [eng, refreshKey]);
  const startEdit = (p) => setForm({
    id: p.id,
    name: p.name,
    category: p.category || "",
    points: p.points,
    description: p.description || "",
    enabled: p.enabled,
    builtin: p.builtin === true,
    src: p.src,
    cap: p.cap,
    rule: p.rule
  });
  const startNew = () => {
    setForm({ name: "", category: "", points: 10, description: "", enabled: true, builtin: false });
    setMsg(null);
  };
  const setField = (k, v) => setForm((f) => Object.assign({}, f, { [k]: v }));
  const save = () => {
    if (!form || !form.name) {
      setMsg({ err: "名称不能为空" });
      return;
    }
    setBusy(true);
    setMsg(null);
    api({ op: "saveScorePoint", engagement: eng, point: form }).then((r) => {
      setBusy(false);
      if (!r || r.ok === false) {
        setMsg({ err: r && r.error || "保存失败" });
        return;
      }
      if (r.overridden === false) {
        setMsg({ err: "已保存「启用/停用」。分值未改动：这是随《得分规则》分发的内置得分点，分值 / 上限 / 计分口径由规则锁定（同一条规则的上限按组内所有得分点累计，单独改分值会让一条命中吃掉整组上限）。要自定义分值时请「+ 新增得分点」。" });
      } else {
        setMsg({ ok: r.note || "已保存" });
      }
      setForm(null);
      load();
    }, (e) => {
      setBusy(false);
      setMsg({ err: String(e && e.message || e) });
    });
  };
  const remove = () => {
    if (!form || !form.id) {
      setForm(null);
      return;
    }
    setBusy(true);
    setMsg(null);
    api({ op: "deleteScorePoint", engagement: eng, id: form.id }).then((r) => {
      setBusy(false);
      if (!r || r.ok === false) {
        setMsg({ err: r && r.error || "删除失败" });
        return;
      }
      setMsg({ ok: "已删除" });
      setForm(null);
      setOpenId(null);
      load();
    }, (e) => {
      setBusy(false);
      setMsg({ err: String(e && e.message || e) });
    });
  };
  const summary = data && data.summary || { achievedPoints: 0, pointCount: 0, hitPointCount: 0, hitCount: 0, selfCreatedHits: 0, serviceCappedHits: 0 };
  const items = data && data.items || [];
  const groups = data && data.ruleGroups && data.ruleGroups.length ? data.ruleGroups : [{ key: "all", name: "", capSum: 0, points: 0, counted: 0, tiers: items }];
  const rows = [];
  for (const g of groups) {
    if (g.name) {
      rows.push(h(
        "div",
        { key: "g-" + g.key, className: "rt-score-group" },
        h("span", null, g.name),
        h(
          "span",
          { className: "rt-sg-sub" },
          g.tiers.length + " 项" + (g.capSum > 0 ? " · 各项上限合计 " + g.capSum + " 分（各项独立，不跨项累加）" : "")
        ),
        h("div", { className: "rt-spacer" }),
        g.points > 0 ? h("span", { className: "rt-tag rt-tag-active" }, "+" + g.points + " 分") : null
      ));
    }
    for (const p of g.tiers) {
      const achieved = p.hits.length > 0;
      const open = openId === p.id;
      rows.push(h(
        "div",
        {
          key: "sp" + p.id,
          className: "rt-score-row",
          role: "button",
          tabIndex: 0,
          onClick: () => setOpenId(open ? null : p.id),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpenId(open ? null : p.id);
            }
          }
        },
        h("span", { className: "rt-sec-caret" }, open ? "▾" : "▸"),
        h("span", null, h("span", {
          className: achieved ? "rt-pri rt-pri-high" : "rt-pri rt-pri-low",
          style: achieved ? {} : { background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-secondary)" }
        }, p.points + "分")),
        h(
          "span",
          { title: p.description || "" },
          p.name,
          p.tier ? h("span", { className: "rt-scope" }, "　" + p.tier) : null
        ),
        /* 命中与上限：这一条计入几次、上限用了多少（G3 各项上限独立，到顶就不再累计） */
        h(
          "span",
          { title: p.capped > 0 ? "已计入 " + p.counted + " 次，另有 " + p.capped + " 条因「" + (p.scope_label || "计分口径") + "」或已达上限不计分" : p.scope_label || "" },
          h("span", { className: "rt-sec-count" }, p.hits.length > 0 ? p.counted + " 次命中" : "未命中"),
          p.cap > 0 ? h("span", { className: "rt-scope" }, "　上限 " + (p.cap_used === null ? 0 : p.cap_used) + "/" + p.cap) : null
        ),
        h("span", { style: { textAlign: "right" } }, p.earned > 0 ? h("span", { className: "rt-tag rt-tag-active" }, "+" + p.earned + " 分") : h("span", { style: { color: "var(--dsw-alias-label-secondary)" } }, "—"))
      ));
      if (!open) continue;
      const hitNodes = p.hits.map((hh, hi) => h(
        "div",
        {
          key: "h" + hh.id,
          className: "rt-hit-row" + (hh.self_created ? " self-created" : "") + (hh.capped ? " service-capped" : "")
        },
        h("span", { className: "rt-hit-idx" }, String(hi + 1)),
        h(
          "span",
          { className: "rt-hit-asset", title: hh.target || hh.asset_ip || "" },
          hh.asset_ip || hh.target || "未指定资产"
        ),
        hh.self_created ? h("span", { className: "rt-tag rt-tag-warn", title: "自己注册/自建的账号不算得分权限，只作过程记录" }, "自建 · 不计分") : null,
        hh.capped ? h("span", {
          className: "rt-tag rt-tag-warn",
          title: hh.capped_reason || "同一资产同一端口只算分值最高的一条，这条不计分"
        }, "服务已拿满 · 不计分" + (hh.service ? "（" + hh.service + "）" : "")) : null,
        hh.shot_count ? h(
          "span",
          { className: "rt-tag", title: "这条命中有证据截图（展开得分点即可看到代表图）" },
          "图 " + hh.shot_count
        ) : null,
        h("span", { className: "rt-hit-time" }, fmt(hh.recorded_at)),
        h("button", {
          className: "rt-btn",
          style: { padding: "0 5px", fontSize: 10.5 },
          title: "复制这一条",
          onClick: (e) => {
            e.stopPropagation();
            copyText((hh.asset_ip || hh.target || "") + "  " + (hh.evidence || ""));
          }
        }, "复制"),
        hh.evidence ? h("span", { className: "rt-hit-txt", title: hh.evidence }, String(hh.evidence).replace(/\n+/g, " ")) : h("span", { className: "rt-hit-txt none" }, "未填账号密码/结果")
      ));
      rows.push(h("div", {
        key: "spd" + p.id,
        className: "rt-score-row",
        style: { cursor: "default", gridTemplateColumns: "1fr" }
      }, h(
        "div",
        { className: "rt-score-detail" },
        p.description ? h("div", { className: "rt-kv" }, h("b", null, "得分条件"), h("span", null, p.description)) : null,
        h(
          "div",
          { className: "rt-kv" },
          h("b", null, "状态"),
          h("span", null, (p.enabled ? "启用" : "停用") + " · " + p.points + " 分/次 · 命中 " + p.hits.length + " 次 = " + p.earned + " 分" + (p.self_created ? "（另有 " + p.self_created + " 次自建不计分）" : "") + (p.capped ? "（另有 " + p.capped + " 次同服务重复命中不计分）" : ""))
        ),
        p.capped ? h(
          "div",
          { className: "rt-kv" },
          h("b", null, "服务封顶"),
          h("span", null, p.service_summary + "；账号权限与数据库权限按「同资产同端口」只算一次，拿到最高权限账号即该服务拿满")
        ) : null,
        p.hits.length ? h(
          "div",
          null,
          h(ShotStrip, {
            eng,
            shots: p.shots,
            total: p.shot_total,
            title: "证据截图 · " + (p.shot_total || (p.shots || []).length) + " 张"
          }),
          h(
            "div",
            { className: "rt-section", style: { padding: "6px 0 0" } },
            "命中记录 · " + p.hits.length + "（只记资产与账号密码，详细复现见报告）"
          ),
          h("div", { className: "rt-hits" }, hitNodes)
        ) : h(
          "div",
          { className: "rt-kv" },
          h("b", null, "命中记录"),
          h(
            "span",
            { style: { color: "var(--dsw-alias-label-secondary)" } },
            "还没有 —— 拿下成果后用 redteam_score_hit 记分：写明目标资产 + 拿到的账号密码/权限"
          )
        ),
        h(
          "div",
          { className: "rt-actions" },
          h("button", { className: "rt-btn", onClick: (e) => {
            e.stopPropagation();
            startEdit(p);
          } }, "编辑")
        )
      )));
    }
  }
  return h(
    "div",
    { className: "rt-main" },
    h(
      "div",
      { className: "rt-toolbar" },
      h("span", { style: { fontWeight: 600 } }, "得分目标"),
      /* 只显示已拿下的总分，不显示目标分数、不显示进度条 */
      h("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-secondary)", marginLeft: 4 } }, "总分"),
      h("span", { className: "rt-total" }, String(summary.achievedPoints)),
      h("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-secondary)" } }, "分"),
      h("span", { className: "rt-tag" }, summary.pointCount + " 个得分点"),
      /* 后端字段叫 countedHits；老快照/合成数据只有 hitCount，两者都缺时按 0 显示，别把 undefined 印到界面上。 */
      h("span", { className: "rt-tag" }, "命中 " + (summary.countedHits ?? summary.hitCount ?? 0) + " 次"),
      summary.selfCreatedHits ? h("span", {
        className: "rt-tag rt-tag-warn",
        title: "自己注册/自己创建的账号不算得分权限，只作过程记录（不计分、不占上限、不进报告）"
      }, "自建不计分 " + summary.selfCreatedHits) : null,
      summary.serviceCappedHits ? h("span", {
        className: "rt-tag rt-tag-warn",
        title: "账号权限与数据库权限按「同资产同端口」只算一次：该服务已拿满，这些重复命中不计分（只作留痕）"
      }, "服务已拿满不计分 " + summary.serviceCappedHits) : null,
      h("div", { className: "rt-spacer" }),
      h("button", { className: "rt-btn", onClick: startNew }, "+ 新增得分点"),
      h("button", { className: "rt-btn", disabled: busy, onClick: load }, busy ? "刷新中…" : "刷新")
    ),
    msg ? h("div", { className: msg.err ? "rt-err" : "rt-foot" }, msg.err || msg.ok) : null,
    err ? h("div", { className: "rt-err" }, err) : null,
    form ? h(
      "div",
      { className: "rt-pane", style: { flex: "none", borderBottom: "1px solid var(--dsw-alias-border-l1)" } },
      /* 内置得分点（builtin）：分值 / 名称 / 分类由《得分规则》锁定，输入框置灰。
         可改的只有「启用 / 停用」。这样界面上就不会再出现「改完提示已保存、刷新变回去」的困惑。 */
      form.builtin ? h(
        "div",
        { className: "rt-hint", style: { marginBottom: 8 } },
        h("b", null, "内置得分点（来自《突破入侵类得分规则（合并版）》）"),
        h(
          "div",
          { style: { marginTop: 3 } },
          "分值、上限、计分口径与名称由规则锁定 —— 同一条规则的上限按组内所有得分点累计，单独改分值会让一条命中吃掉整组上限。这里可以改「启用 / 停用」；要自定义分值时请返回上一屏点「+ 新增得分点」。"
        ),
        form.src !== null && form.src !== void 0 ? h(
          "div",
          { style: { marginTop: 3, color: "var(--dsw-alias-label-secondary)" } },
          "规则原文序号 " + form.src + (form.rule ? "　·　上限分组 rule=" + form.rule : "") + (form.cap > 0 ? "　·　上限 " + form.cap + " 分" : "　·　不设上限")
        ) : null
      ) : null,
      h(
        "div",
        { className: "rt-score-form" },
        h("input", {
          className: "rt-input",
          placeholder: "名称（必填）",
          value: form.name,
          readOnly: form.builtin === true,
          title: form.builtin ? "内置得分点的名称由规则锁定" : "",
          onChange: (e) => setField("name", e.target.value)
        }),
        h("input", {
          className: "rt-input",
          placeholder: "分类，如 账号权限",
          value: form.category,
          readOnly: form.builtin === true,
          title: form.builtin ? "内置得分点的分类由规则锁定（决定它属于面板哪一组）" : "",
          onChange: (e) => setField("category", e.target.value)
        }),
        h("input", {
          className: "rt-input",
          type: "number",
          placeholder: "单次分值",
          readOnly: form.builtin === true,
          title: form.builtin ? "内置得分点的分值由《得分规则》锁定，不能在这里改" : "这一类的单次分值；每命中一次就按这个分值累加（受该条规则上限约束）",
          value: form.points,
          onChange: (e) => setField("points", Number(e.target.value))
        }),
        h(PurgeSelect, {
          "aria-label": "得分点启用状态",
          size: "sm",
          className: "rt-select-block",
          value: form.enabled ? "1" : "0",
          onChange: (value) => setField("enabled", value === "1"),
          options: [{ value: "1", label: "启用" }, { value: "0", label: "停用" }]
        })
      ),
      h("input", {
        className: "rt-input",
        style: { width: "100%", marginBottom: 6, boxSizing: "border-box" },
        placeholder: "得分条件说明",
        value: form.description,
        readOnly: form.builtin === true,
        title: form.builtin ? "内置得分点的条款正文由规则锁定" : "",
        onChange: (e) => setField("description", e.target.value)
      }),
      h(
        "div",
        { className: "rt-actions" },
        h("button", { className: "rt-btn rt-btn-primary", disabled: busy, onClick: save }, "保存"),
        form.id ? form.builtin ? h("button", {
          className: "rt-btn",
          disabled: true,
          title: "内置得分点不能删除：删掉会让面板缺一条规则、报告少一类成果（下次启动还会自动补回来）。要让它不参与计分请改用「停用」。"
        }, "删除（内置项不可删）") : h("button", { className: "rt-btn", disabled: busy, onClick: remove }, "删除") : null,
        h("button", { className: "rt-btn", onClick: () => setForm(null) }, "取消")
      )
    ) : null,
    h(
      "div",
      { className: "rt-table" },
      h(
        "div",
        { className: "rt-score-row head" },
        h("span", null, ""),
        h("span", null, "分值"),
        h("span", null, "得分点（按分值从低到高）"),
        h("span", null, "命中 / 上限"),
        h("span", { style: { textAlign: "right" } }, "已得分")
      ),
      rows,
      !items.length ? h("div", { className: "rt-empty" }, "暂无得分点，点右上角「新增得分点」") : null
    )
  );
}

// src/ui/features/drill/report.js
function ReportTab(props) {
  const eng = props.engagement;
  const refreshKey = props.refreshKey || 0;
  const [data, setData] = react_default.useState(null);
  const [err, setErr] = react_default.useState(null);
  const [busy, setBusy] = react_default.useState(false);
  const [msg, setMsg] = react_default.useState(null);
  const collapse = useCollapse("report:" + eng);
  const load = () => {
    if (!eng) return;
    setBusy(true);
    setMsg(null);
    api({ op: "scoreReport", engagement: eng }).then((r) => {
      if (!r || r.ok === false) {
        setBusy(false);
        setErr(r && r.error || "生成失败");
        return;
      }
      if ((!r.stages || r.stages.length === 0) && (r.items || []).length > 0) {
        api({ op: "scoreChain", engagement: eng }).then((c) => {
          setBusy(false);
          setErr(null);
          setData(Object.assign({}, r, { stages: groupByStage(r.items, c) }));
        }, () => {
          setBusy(false);
          setErr(null);
          setData(r);
        });
        return;
      }
      setBusy(false);
      setErr(null);
      setData(r);
    }, (e) => {
      setBusy(false);
      setErr(String(e && e.message || e));
    });
  };
  react_default.useEffect(load, [eng, refreshKey]);
  const copy = (text2, label) => copyWithFeedback(text2, label, (okFlag, message2) => {
    setMsg(okFlag ? { ok: message2 } : { err: message2 });
  });
  const download = (text2, label) => {
    try {
      const blob = new Blob([text2], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "report-" + String(label || "score").replace(/[^\w.\-]/g, "_") + ".md";
      a.click();
      URL.revokeObjectURL(url);
      setMsg({ ok: "已下载：" + label });
    } catch (e) {
      setMsg({ err: "下载失败：" + (e && e.message || e) });
    }
  };
  const items = data && data.items || [];
  const stages = data && data.stages || [];
  const summary = data && data.summary || null;
  const mdText = data && data.markdown || "";
  const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩", "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱", "⑲", "⑳"];
  const card = (x) => h(
    "div",
    { key: "r" + x.id, className: "rt-rep" },
    h(
      "div",
      { className: "rt-rep-head" },
      h("span", { className: "rt-rep-idx" }, String(x.seq)),
      h("span", { className: "rt-rep-name" }, x.point_name),
      h("span", { className: "rt-flow-pts" }, "+" + x.points + " 分"),
      x.nth_of_point > 1 ? h("span", { className: "rt-tag" }, "同类第 " + x.nth_of_point + " 次") : null,
      h("div", { className: "rt-spacer" }),
      h("button", {
        className: "rt-btn",
        style: { padding: "0 6px", fontSize: 11 },
        onClick: () => copy((x.requests || []).map((v) => v.request || "").filter(Boolean).join("\n\n"), "第 " + x.seq + " 项请求")
      }, "复制请求")
    ),
    h(
      "div",
      { className: "rt-rep-meta" },
      h("span", null, h("b", null, "目标 ")),
      h("span", { className: "rt-mono" }, x.target || x.asset_ip || "—")
    ),
    x.gained ? h("div", { className: "rt-rep-meta" }, h("b", null, "拿到 "), h("span", null, x.gained)) : null,
    x.vuln ? h(
      "div",
      { className: "rt-rep-meta" },
      h("b", null, "利用漏洞 "),
      h("span", null, [x.vuln.cve, x.vuln.title].filter(Boolean).join(" "))
    ) : null,
    x.evidence ? h(
      "div",
      { className: "rt-rep-meta" },
      h("b", null, "结果 "),
      h("span", null, String(x.evidence).replace(/\n+/g, " "))
    ) : null,
    x.recorded_at ? h(
      "div",
      { className: "rt-rep-meta" },
      h("b", null, "取得时间 "),
      h("span", null, fmt(x.recorded_at) + (x.recorded_by ? "（" + (ROLE_LABEL[x.recorded_by] || x.recorded_by) + "）" : ""))
    ) : null,
    h(ShotStrip, { eng, shots: x.shots, total: x.shot_total, title: "证据截图" }),
    /* ── 复现步骤：动作记录（含实际命令与回显）+ 凭据 + 隧道 + WebShell ─────
       报告的交付价值全在这块：账号密码怎么来的、隧道怎么搭的，用户照着就能复现。 */
    h(
      "details",
      { className: "rt-rep-trace", open: x.incomplete === true || (x.steps || []).length === 0 },
      h(
        "summary",
        { className: "rt-rep-trace-head", style: { cursor: "pointer" } },
        h("span", { className: "rt-rep-trace-title" }, "复现步骤（点击展开）"),
        (x.steps || []).length ? h("span", { className: "rt-tag" }, (x.steps || []).length + " 个动作") : null,
        (x.credentials || []).length ? h("span", { className: "rt-tag" }, (x.credentials || []).length + " 条凭据") : null,
        (x.tunnels || []).length ? h("span", { className: "rt-tag" }, (x.tunnels || []).length + " 条隧道") : null,
        x.incomplete ? h("span", { className: "rt-tag rt-tag-warn" }, "复现材料待补") : h("span", { className: "rt-tag rt-tag-live" }, "可复现")
      ),
      h(
        "div",
        { style: { paddingTop: 6 } },
        x.how ? h("div", { className: "rt-rep-trace-how" }, x.how) : null,
        (x.steps || []).length === 0 ? h(
          "div",
          { className: "rt-rep-missing" },
          "⚠️ 没有关联的攻击步骤：说不清这一步是怎么做的。请用 redteam_chain_add 补上动作（title / detail / tool / result），记分时也可以带 point_code + evidence 一次完成。"
        ) : (x.steps || []).map((s, si) => h(
          "div",
          { key: "s" + s.id, className: "rt-rep-step" },
          h(
            "div",
            { className: "rt-rep-step-head" },
            h("span", { className: "rt-rep-step-no" }, String(si + 1)),
            h("span", { className: "rt-rep-step-title" }, s.title || "(未命名动作)"),
            s.agent ? h("span", { className: "rt-tag" }, ROLE_LABEL[s.agent] || s.agent) : null,
            s.stage_code ? h("span", { className: "rt-tag" }, s.stage_code) : null,
            s.inferred ? h("span", { className: "rt-tag" }, "按同资产推断") : null,
            h("div", { className: "rt-spacer" }),
            s.recorded_at ? h("span", { style: { fontSize: 11, color: "var(--dsw-alias-label-secondary)" } }, fmt(s.recorded_at)) : null
          ),
          s.detail ? h("div", { className: "rt-rep-step-detail" }, s.detail) : null,
          h(
            "div",
            { className: "rt-rep-step-cmd" },
            h("b", null, "执行 "),
            s.tool ? h("span", { className: "rt-mono" }, s.tool) : h("span", { style: { color: "var(--dsw-alias-state-warn-primary, #f59e0b)" } }, "未记录实际命令（redteam_chain_add 的 tool）")
          ),
          s.tool ? h(
            "div",
            { style: { marginTop: 3 } },
            h("button", {
              className: "rt-btn",
              style: { padding: "0 6px", fontSize: 11 },
              onClick: () => copy(String(s.tool), "第 " + (si + 1) + " 步命令")
            }, "复制命令")
          ) : null,
          s.result ? h("div", { className: "rt-rep-step-result" }, h("b", null, "结果 "), String(s.result).replace(/\n+/g, " ")) : null,
          s.evidence_ref ? h("div", { className: "rt-rep-step-result" }, h("b", null, "证据 "), h("span", { className: "rt-mono" }, s.evidence_ref)) : null
        )),
        /* 账号密码怎么来的：凭据的来源 + 取得方式 */
        (x.credentials || []).length ? h(
          "div",
          { className: "rt-rep-src" },
          h("div", { className: "rt-rep-src-title" }, "拿到的凭据（来源可追溯）"),
          (x.credentials || []).map((c) => h(
            "div",
            { key: "c" + c.id, className: "rt-kv" },
            h("b", { className: "rt-mono", style: { minWidth: 120 } }, c.host || "—"),
            h("span", null, (c.username || "(无用户名)") + " / " + (c.secret_type || "password") + (c.privilege ? " · 权限 " + c.privilege : "") + " · 来源 " + (c.source || "未标注") + (c.tool ? " · 取得方式 " + String(c.tool).replace(/\n+/g, " ").slice(0, 160) : ""))
          ))
        ) : null,
        /* 隧道怎么搭的 */
        (x.tunnels || []).length ? h(
          "div",
          { className: "rt-rep-src" },
          h("div", { className: "rt-rep-src-title" }, "用到的隧道 / 通道"),
          (x.tunnels || []).map((t) => h(
            "div",
            { key: "t" + t.id, className: "rt-kv" },
            h("b", { className: "rt-mono", style: { minWidth: 120 } }, (t.kind || "socks5") + " " + (t.listen || "")),
            h("span", null, "入口 " + (t.entry || "未登记") + (t.reach ? " · 可达 " + t.reach : "") + " · 目标侧 " + (t.entry_kind || "未声明") + (t.legit === false ? " · ⚠️ 不算跨越靶标边界" : "") + (t.status ? " · " + t.status : "") + (t.command ? " · 命令 " + String(t.command).replace(/\n+/g, " ").slice(0, 160) : ""))
          ))
        ) : null,
        (x.webshells || []).length ? h(
          "div",
          { className: "rt-rep-src" },
          h("div", { className: "rt-rep-src-title" }, "用到的 WebShell"),
          (x.webshells || []).map((w) => h(
            "div",
            { key: "w" + w.id, className: "rt-kv" },
            h("b", { className: "rt-mono", style: { minWidth: 120 } }, w.shell_type || "shell"),
            h("span", null, (w.url || "") + (w.pass_key ? " · 口令/密钥 " + w.pass_key : "") + (w.privilege ? " · 权限 " + w.privilege : "") + (w.status ? " · " + w.status : ""))
          ))
        ) : null,
        (x.gaps || []).length ? h("div", { className: "rt-rep-missing" }, "⚠️ 复现缺口：" + x.gaps.join("；")) : null
      ),
      (x.requests || []).length === 0 ? h("div", { className: "rt-rep-missing" }, "⚠️ 这一项没有原始请求记录，无法直接复现 —— 请用 redteam_http_evidence_add 补上") : (x.requests || []).map((r, ri) => h(
        "div",
        { key: "q" + ri, className: "rt-rep-req" },
        h(
          "div",
          { className: "rt-rep-req-head" },
          h("span", null, "复现请求 " + (ri + 1) + (r.source === "auto" ? "（按目标路径自动匹配，请核对）" : "")),
          h("span", { className: "rt-tag" }, (r.method || "GET") + " " + (r.status === null || r.status === void 0 ? "" : r.status)),
          h("div", { className: "rt-spacer" }),
          h("button", {
            className: "rt-btn",
            style: { padding: "0 6px", fontSize: 11 },
            onClick: () => copy(String(r.request || ""), "请求 " + (ri + 1))
          }, "复制到 Yakit")
        ),
        h("pre", { className: "rt-rep-http" }, r.request || (r.method || "GET") + " " + (r.url || "") + " HTTP/1.1"),
        r.response ? h(
          "div",
          null,
          h("div", { className: "rt-rep-req-head" }, h("span", null, "响应摘要")),
          h("pre", { className: "rt-rep-http", style: { maxHeight: 160 } }, String(r.response).slice(0, 1600))
        ) : null
      )),
      x.note ? h("div", { className: "rt-rep-meta" }, h("b", null, "备注 "), h("span", null, x.note)) : null
    )
  );
  return h(
    "div",
    { className: "rt-main" },
    h(
      "div",
      { className: "rt-toolbar" },
      h("span", { style: { fontWeight: 600 } }, "攻击得分链路复现报告"),
      summary ? h("span", { className: "rt-tag rt-tag-live" }, "合计 " + summary.points + " 分") : null,
      summary ? h("span", { className: "rt-tag" }, summary.count + " 项得分") : null,
      summary ? h(
        "span",
        { className: "rt-tag" + (summary.missingRequests ? "" : " rt-tag-live") },
        (summary.withRequests ?? 0) + "/" + (summary.count ?? 0) + " 项带原始请求"
      ) : null,
      summary ? h("span", {
        className: "rt-tag" + (summary.incomplete ? " rt-tag-warn" : " rt-tag-live"),
        title: "复现链是否完整：有攻击步骤、写了实际命令、关联了漏洞/凭据/隧道"
      }, "可复现 " + (summary.count - (summary.incomplete || 0)) + "/" + summary.count) : null,
      summary && summary.serviceCappedExcluded ? h("span", {
        className: "rt-tag rt-tag-warn",
        title: (summary.serviceCapped || []).map((x) => (x.service || "") + "｜" + (x.point_name || "")).join("\n") || "同一资产同一端口的重复账号/数据库权限命中：服务已拿满，不计分、不进报告"
      }, "同服务已拿满不计分 " + summary.serviceCappedExcluded) : null,
      h("div", { className: "rt-spacer" }),
      h("button", { className: "rt-btn", disabled: busy || !mdText, onClick: () => copy(mdText, "整份报告") }, "复制全文"),
      h("button", { className: "rt-btn", disabled: busy || !mdText, onClick: () => download(mdText, data && data.target || eng) }, "下载 .md"),
      h("button", { className: "rt-btn", disabled: busy, onClick: load }, busy ? "生成中…" : "重新生成")
    ),
    msg ? h("div", { className: msg.err ? "rt-err" : "rt-foot" }, msg.err || msg.ok) : null,
    err ? h("div", { className: "rt-err" }, err) : null,
    data && (data.hit_total || 0) > items.length ? h(
      "div",
      { className: "rt-hint", role: "status" },
      "共 " + data.hit_total + " 条得分记录，本次报告只含前 " + items.length + " 条（单次上限 " + (data.hit_limit || 500) + "）；完整明细请用 redteam_attack_chain / redteam_score_list 查询。"
    ) : null,
    h(
      "div",
      { className: "rt-body", style: { overflow: "auto" } },
      stages.length ? h(
        "div",
        { className: "rt-rep-list" },
        h(
          "div",
          { className: "rt-rep-tools" },
          h("button", { className: "rt-btn", onClick: () => collapse.setAll(stages.map((s) => "st:" + s.code), true) }, "全部展开"),
          h("button", { className: "rt-btn", onClick: () => collapse.setAll(stages.map((s) => "st:" + s.code), false) }, "全部折叠")
        ),
        stages.map((st) => {
          const open = collapse.isOpen("st:" + st.code);
          const toggle = collapse.toggle("st:" + st.code);
          return h(
            "div",
            { key: "g" + st.code, className: "rt-rep-group" },
            h(
              "div",
              {
                className: "rt-rep-stage",
                role: "button",
                tabIndex: 0,
                style: { borderLeftColor: st.color },
                "aria-expanded": open ? "true" : "false",
                onClick: toggle,
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(e);
                  }
                }
              },
              h("span", { className: "rt-sec-caret" }, open ? "▾" : "▸"),
              h("span", { className: "rt-rep-no", style: { background: st.color } }, CIRCLED[st.ordinal - 1] || st.ordinal),
              h("span", { className: "rt-rep-stage-name" }, st.name),
              h("span", { className: "rt-rep-stage-n" }, st.items.length + " 项"),
              h("div", { className: "rt-spacer" }),
              h(
                "span",
                { className: "rt-rep-pts", style: { background: st.color + "22", color: st.color, borderColor: st.color + "66" } },
                "+" + st.points + " 分"
              ),
              h("span", { className: "rt-ap-cum" }, "累计 " + st.cumulative + " 分")
            ),
            open ? h("div", { className: "rt-rep-body" }, st.items.map(card)) : null
          );
        })
      ) : data === null ? h("div", { className: "rt-empty" }, "加载中…") : h(
        "div",
        { className: "rt-empty" },
        h("div", null, "还没有可交付的成果。"),
        h(
          "div",
          { style: { marginTop: 6, fontSize: 12 } },
          '本报告只收录"拿到了分"的成果；没有得分的漏洞不进报告。拿到成果后用 redteam_score_hit 记分（目标资产 + 拿到的东西），并补 redteam_http_evidence_add 以便复现。'
        )
      )
    ),
    h(
      "div",
      { className: "rt-foot" },
      h("span", null, "口径：只收录得分成果，每条附带可粘进 Yakit Repeater 的原始请求")
    )
  );
}

// src/ui/features/drill/environment.js
var ENV_TOOL_GROUPS = [
  { key: "recon", title: "资产与子域", hint: "先有面：子域、存活、指纹、段扫", ids: ["subfinder", "ksubdomain", "dnsx", "httpx", "fscan", "gogo"] },
  { key: "scan", title: "端口与服务", hint: "精扫与速率控制", ids: ["nmap", "masscan"] },
  { key: "vuln", title: "漏洞验证", hint: "模板验证与目录爆破", ids: ["nuclei", "ffuf"] },
  { key: "tunnel", title: "隧道与横向", hint: "落地、代理、凭据", ids: ["suo5", "frpc", "frps", "chisel", "impacket"] }
];
var ENV_SRC_LABEL = { config: "手填", toolkit: "工具箱", binDir: "搜索目录", path: "系统 PATH", missing: "未找到" };
var envTag = (ok, text2, extra) => h("span", { className: "rt-tag " + (ok ? "rt-tag-live" : "rt-tag-warn") + (extra || "") }, text2);
var envCaret = () => h(
  "svg",
  { width: 9, height: 9, viewBox: "0 0 12 12", "aria-hidden": "true" },
  h("path", { d: "M4 2l4 4-4 4", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" })
);
function EnvTab(props) {
  const refreshKey = props.refreshKey || 0;
  const connections = props.section === "connections";
  const environment = props.section === "environment";
  const [data, setData] = react_default.useState(null);
  const [draft, setDraft] = react_default.useState(null);
  const [err, setErr] = react_default.useState(null);
  const [msg, setMsg] = react_default.useState(null);
  const [busy, setBusy] = react_default.useState(false);
  const [folderPath, setFolderPath] = react_default.useState("");
  const [expanded, setExpanded] = react_default.useState({});
  const [onlyMissing, setOnlyMissing] = react_default.useState(false);
  const applyDraftFrom = (r) => {
    const c = r && r.config || {};
    setDraft({
      platform: c.platform || "auto",
      toolkitDir: c.toolkitDir || "",
      nucleiTemplatesDir: c.nucleiTemplatesDir || "",
      binDirsText: (c.binDirs || []).join("\n"),
      tools: Object.assign({}, c.tools || {}),
      env: Object.assign({ FOFA_KEY: "", REDTEAM_VPS_HOST: "", REDTEAM_VPS_KEY: "" }, c.env || {}),
      notes: c.notes || ""
    });
    if (c.toolkitDir) setFolderPath(c.toolkitDir);
  };
  const load = () => {
    setBusy(true);
    setMsg(null);
    api({ op: "platformConfigGet" }).then((r) => {
      setBusy(false);
      if (!r || r.ok === false) {
        setErr(r && r.error || "读取失败");
        return;
      }
      setErr(null);
      setData(r);
      applyDraftFrom(r);
    }, (e) => {
      setBusy(false);
      setErr(String(e && e.message || e));
    });
  };
  react_default.useEffect(load, [refreshKey]);
  const save = () => {
    if (!draft) return;
    setBusy(true);
    setMsg(null);
    const config = {
      platform: draft.platform,
      toolkitDir: draft.toolkitDir,
      nucleiTemplatesDir: draft.nucleiTemplatesDir,
      binDirs: String(draft.binDirsText || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
      tools: draft.tools,
      env: draft.env,
      notes: draft.notes,
      envAdaptConfigured: true,
      envAdaptSkip: false
    };
    if (environment) delete config.env;
    if (connections) {
      for (const key of Object.keys(config)) if (key !== "env") delete config[key];
    }
    api({ op: "platformConfigSave", config }).then((r) => {
      setBusy(false);
      if (!r || r.ok === false) {
        setMsg({ err: r && r.error || "保存失败" });
        return;
      }
      setData(r);
      setMsg({ ok: "已保存到 " + (r.config && r.config.path || "$DSH_HOME/redteam/config.json") });
      applyDraftFrom(r);
    }, (e) => {
      setBusy(false);
      setMsg({ err: String(e && e.message || e) });
    });
  };
  const assignFolder = () => {
    const dir = String(folderPath || draft && draft.toolkitDir || "").trim();
    if (!dir) {
      setMsg({ err: "请先填写工具所在文件夹路径" });
      return;
    }
    setBusy(true);
    setMsg(null);
    api({ op: "platformAssignToolkit", dir }).then((r) => {
      setBusy(false);
      if (!r || r.ok === false) {
        setMsg({ err: r && r.error || "自动分配失败" });
        return;
      }
      setData(r);
      applyDraftFrom(r);
      setMsg({
        ok: "已从文件夹分配 " + (r.assignedCount || 0) + " 个工具" + (r.nucleiTemplatesDir ? "，并识别 nuclei-templates" : "")
      });
    }, (e) => {
      setBusy(false);
      setMsg({ err: String(e && e.message || e) });
    });
  };
  const setTool = (id, value) => setDraft((d) => d ? Object.assign({}, d, { tools: Object.assign({}, d.tools, { [id]: value }) }) : d);
  const setEnv = (key, value) => setDraft((d) => d ? Object.assign({}, d, { env: Object.assign({}, d.env, { [key]: value }) }) : d);
  const runtime = data && data.runtime || {};
  const adapt = data && data.adapt || {};
  const tools = data && data.tools && data.tools.items || [];
  const found = tools.filter((t) => t.path).length;
  const missingN = tools.length - found;
  const defaultToolkit = data && data.toolkitDir || "$DSH_HOME/redteam/toolkit";
  const defaultNuclei = data && data.nucleiTemplatesDir || defaultToolkit + "/nuclei-templates";
  const toolById = {};
  for (const t of tools) toolById[t.id] = t;
  const groups = (() => {
    const known = /* @__PURE__ */ new Set();
    const out = ENV_TOOL_GROUPS.map((g) => {
      const items = g.ids.map((id) => toolById[id]).filter(Boolean);
      for (const t of items) known.add(t.id);
      return { key: g.key, title: g.title, hint: g.hint, items };
    });
    const rest = tools.filter((t) => !known.has(t.id));
    if (rest.length) out.push({ key: "other", title: "其它", hint: "目录里多出来的工具", items: rest });
    return out.filter((g) => g.items.length);
  })();
  const open = (k) => expanded[k] === true;
  const toggleKey = (k) => setExpanded((c) => {
    const n = Object.assign({}, c);
    if (n[k]) delete n[k];
    else n[k] = true;
    return n;
  });
  const allKeys = () => {
    const keys = ["cfg:folder", "cfg:dir", "cfg:tools", "cfg:keys", "cfg:egress", "cfg:notes"];
    for (const g of groups) {
      keys.push("grp:" + g.key);
      for (const t of g.items) keys.push("tool:" + t.id);
    }
    return keys;
  };
  const expandAll = () => {
    const n = {};
    for (const k of allKeys()) n[k] = true;
    setExpanded(n);
  };
  const collapseAll = () => setExpanded({});
  const row = (o) => h(
    "div",
    {
      key: o.key,
      className: "rt-trow" + (o.depth === 0 ? " rt-trow-root" : ""),
      style: { paddingLeft: 8 + o.depth * 15 },
      onClick: o.hasKids ? o.onClick : void 0,
      role: o.hasKids ? "button" : void 0,
      tabIndex: o.hasKids ? 0 : void 0,
      "aria-expanded": o.hasKids ? o.open ? "true" : "false" : void 0,
      onKeyDown: o.hasKids ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          o.onClick();
        }
      } : void 0
    },
    o.hasKids ? h("span", { className: "rt-caret" + (o.open ? " open" : "") }, envCaret()) : h("span", { className: "rt-caret rt-caret-leaf" }),
    o.st ? h("span", { className: "rt-env-dot " + o.st, "aria-hidden": "true" }) : null,
    h("span", { className: "rt-tlabel" }, o.label),
    o.meta ? h("span", { className: "rt-tmeta", title: o.meta }, o.meta) : null,
    h("span", { className: "rt-spacer" }),
    o.right || null
  );
  const kids = (nodeKey, depth, children) => {
    if (!open(nodeKey) || !children || !children.length) return null;
    return h("div", { className: "rt-tkids", style: { marginLeft: 15 + depth * 15 } }, children.filter(Boolean));
  };
  const field = (key, label, node) => h(
    "label",
    { key, className: "rt-env-field" },
    h("span", { className: "rt-env-field-label" }, label),
    node
  );
  const toolNode = (t, depth) => {
    const key = "tool:" + t.id;
    const isOpen = open(key);
    const st = t.path ? "ok" : t.configured ? "warn" : "miss";
    const meta = t.path ? (ENV_SRC_LABEL[t.source] || t.source) + " · " + t.path : (t.names || []).slice(0, 3).join(" / ") || "未找到";
    const manual = draft && draft.tools && draft.tools[t.id] || "";
    const tagText = t.path ? "到位" : t.configured ? "路径失效" : "未到位";
    return h(
      "div",
      { key },
      row({
        key: "r",
        depth,
        label: t.label || t.id,
        meta,
        st,
        hasKids: true,
        open: isOpen,
        onClick: () => toggleKey(key),
        right: envTag(!!t.path, tagText)
      }),
      isOpen ? h(
        "div",
        { className: "rt-env-body", style: { paddingLeft: 30 + depth * 15 } },
        h(
          "div",
          { className: "rt-env-inline" },
          h("input", {
            className: "rt-input",
            style: { flex: 1 },
            placeholder: "留空自动找：" + ((t.names || []).slice(0, 3).join(" / ") || t.id),
            value: manual,
            onChange: (e) => setTool(t.id, e.target.value)
          }),
          manual ? h("button", { className: "rt-btn", onClick: () => setTool(t.id, "") }, "清空") : null
        ),
        t.note ? h("div", { className: "rt-env-note-warn" }, t.note) : null,
        t.path ? h("div", { className: "rt-env-path" }, "解析到：" + t.path + "（" + (ENV_SRC_LABEL[t.source] || t.source) + "）") : h("div", { className: "rt-env-path" }, "解析顺序：手填绝对路径 → 工具箱 → 搜索目录 → PATH。改完点右上角「保存」。")
      ) : null
    );
  };
  const groupNode = (g, depth) => {
    const key = "grp:" + g.key;
    const items = onlyMissing ? g.items.filter((t) => !t.path) : g.items;
    if (!items.length) return null;
    const okN = g.items.filter((t) => t.path).length;
    const allOk = okN === g.items.length;
    return h(
      "div",
      { key },
      row({
        key: "r",
        depth,
        label: g.title,
        meta: g.hint,
        st: allOk ? "ok" : okN ? "warn" : "miss",
        hasKids: true,
        open: open(key),
        onClick: () => toggleKey(key),
        right: envTag(allOk, okN + "/" + g.items.length + " 到位")
      }),
      kids(key, depth, items.map((t) => toolNode(t, depth + 1)))
    );
  };
  const envKeys = ["FOFA_KEY", "REDTEAM_VPS_HOST", "REDTEAM_VPS_KEY"];
  const envFilled = envKeys.filter((k) => draft && draft.env && String(draft.env[k] || "").trim()).length;
  const dirSaved = !!(draft && (String(draft.toolkitDir || "").trim() || String(draft.nucleiTemplatesDir || "").trim() || String(draft.binDirsText || "").trim()));
  const egress = data && data.egress || null;
  const egressOn = !!(egress && (egress.http_proxy || egress.https_proxy || egress.all_proxy));
  const cfgNode = (o) => h(
    "div",
    { key: o.id },
    row({
      key: "r",
      depth: 0,
      label: o.label,
      meta: o.meta,
      st: o.st || null,
      hasKids: !!o.children,
      open: open(o.id),
      onClick: () => toggleKey(o.id),
      right: o.right || null
    }),
    o.children ? kids(o.id, 0, [
      h("div", { key: "body", className: "rt-env-body", style: { paddingLeft: 30 } }, o.children)
    ]) : null
  );
  const cfgFolder = cfgNode({
    id: "cfg:folder",
    label: "整包文件夹 → 自动分配",
    meta: draft && draft.toolkitDir ? draft.toolkitDir : "工具都在一个文件夹（含子目录）时用这个",
    st: draft && draft.toolkitDir ? "ok" : null,
    right: h("span", { className: "rt-tag" }, "扫描匹配"),
    children: [
      h(
        "div",
        { key: "in", className: "rt-env-inline" },
        h("input", {
          className: "rt-input",
          style: { flex: 1 },
          placeholder: "例如 D:\\pentest-tools 或 /opt/toolkit",
          value: folderPath,
          onChange: (e) => setFolderPath(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") assignFolder();
          }
        }),
        h(
          "button",
          { className: "rt-btn rt-btn-primary", disabled: busy, onClick: assignFolder },
          busy ? "扫描中…" : "自动分配"
        )
      ),
      h(
        "div",
        { key: "tip", className: "rt-env-path" },
        "写入 toolkitDir，并按文件名把 nmap / nuclei / fscan 等填到对应工具节点。"
      )
    ]
  });
  const cfgDir = cfgNode({
    id: "cfg:dir",
    label: "平台与目录",
    meta: (draft ? draft.platform || "auto" : "auto") + " · " + (draft && draft.toolkitDir ? draft.toolkitDir : "工具箱默认"),
    st: dirSaved ? "ok" : "warn",
    right: envTag(dirSaved, dirSaved ? "已配置" : "走默认"),
    children: draft ? [
      field(
        "platform",
        "平台模式",
        h(PurgeSelect, {
          "aria-label": "平台模式",
          size: "sm",
          className: "rt-select-block",
          value: draft.platform,
          onChange: (value) => setDraft(Object.assign({}, draft, { platform: value })),
          options: [
            { value: "auto", label: "auto（跟随本机，默认）" },
            { value: "windows", label: "windows" },
            { value: "linux", label: "linux" }
          ]
        })
      ),
      field(
        "toolkit",
        "工具箱目录 toolkitDir（留空＝默认）",
        h("input", {
          className: "rt-input",
          style: { display: "block", width: "100%", marginTop: 4 },
          placeholder: "默认：" + defaultToolkit,
          value: draft.toolkitDir,
          onChange: (e) => setDraft(Object.assign({}, draft, { toolkitDir: e.target.value }))
        })
      ),
      field(
        "nuclei",
        "nuclei 模板目录（留空＝自动：toolkit/nuclei-templates）",
        h("input", {
          className: "rt-input",
          style: { display: "block", width: "100%", marginTop: 4 },
          placeholder: "默认：" + defaultNuclei,
          value: draft.nucleiTemplatesDir,
          onChange: (e) => setDraft(Object.assign({}, draft, { nucleiTemplatesDir: e.target.value }))
        })
      ),
      field(
        "bindirs",
        "工具搜索目录 binDirs（留空＝只搜 toolkit + PATH；每行一个）",
        h("textarea", {
          className: "rt-input",
          rows: 4,
          style: { display: "block", width: "100%", marginTop: 4, fontFamily: "var(--xsdsh-font-ui, sans-serif)" },
          placeholder: "可选。例如：" + String.fromCharCode(10) + "D:\\tools" + String.fromCharCode(10) + "D:\\pentest-bin",
          value: draft.binDirsText,
          onChange: (e) => setDraft(Object.assign({}, draft, { binDirsText: e.target.value }))
        })
      )
    ] : []
  });
  const cfgTools = cfgNode({
    id: "cfg:tools",
    label: "工具链",
    meta: tools.length ? "按用途分组 · 点组展开" : "加载中…",
    st: tools.length ? found === tools.length ? "ok" : found ? "warn" : "miss" : null,
    right: envTag(tools.length > 0 && found === tools.length, found + "/" + tools.length + " 到位"),
    children: groups.map((g) => groupNode(g, 1))
  });
  const cfgKeys = cfgNode({
    id: "cfg:keys",
    label: "密钥与 VPS",
    meta: "FOFA_KEY / REDTEAM_VPS_HOST / REDTEAM_VPS_KEY · 留空＝不覆盖",
    st: envFilled === 3 ? "ok" : envFilled ? "warn" : null,
    right: h("span", { className: "rt-tag" + (envFilled === 3 ? " rt-tag-live" : envFilled ? " rt-tag-active" : "") }, envFilled + "/3 已填"),
    children: draft ? envKeys.map((k) => field(
      k,
      k + "（可选）",
      k === "FOFA_KEY" ? h(SecretInput, {
        className: "rt-secret-field",
        inputClassName: "rt-input",
        "aria-label": "FOFA_KEY",
        placeholder: "留空；测绘时再填",
        value: draft.env && draft.env[k] || "",
        onChange: (value) => setEnv(k, value)
      }) : h("input", {
        className: "rt-input",
        style: { display: "block", width: "100%", marginTop: 4 },
        type: "text",
        placeholder: k === "REDTEAM_VPS_KEY" ? "留空；需要时填私钥绝对路径" : "留空；需要时填 user@host",
        value: draft.env && draft.env[k] || "",
        onChange: (e) => setEnv(k, e.target.value)
      })
    )) : []
  });
  const cfgEgress = cfgNode({
    id: "cfg:egress",
    label: "出网状态（只读）",
    meta: egress ? "HTTP_PROXY=" + (egress.http_proxy || "(空)") : "无数据",
    st: egressOn ? "ok" : null,
    right: egress ? h("span", { className: "rt-tag" + (egressOn ? " rt-tag-live" : "") }, egressOn ? "有代理" : "直连") : null,
    children: egress ? [
      h("div", { key: "h", className: "rt-mono rt-env-path" }, "HTTP_PROXY=" + (egress.http_proxy || "(空)")),
      h("div", { key: "s", className: "rt-mono rt-env-path" }, "HTTPS_PROXY=" + (egress.https_proxy || "(空)")),
      h("div", { key: "a", className: "rt-mono rt-env-path" }, "ALL_PROXY=" + (egress.all_proxy || "(空)")),
      h("div", { key: "n", className: "rt-mono rt-env-path" }, "NO_PROXY=" + (egress.no_proxy || "(空)")),
      h("div", { key: "note", className: "rt-env-path" }, egress.note || "")
    ] : []
  });
  const cfgNotes = cfgNode({
    id: "cfg:notes",
    label: "备注",
    meta: draft && draft.notes ? draft.notes.slice(0, 48) : "可选，例如工具来自某某绿色包",
    children: draft ? [
      h("textarea", {
        key: "ta",
        className: "rt-input",
        rows: 3,
        style: { width: "100%" },
        placeholder: "可选。例如：工具来自某某绿色包",
        value: draft.notes,
        onChange: (e) => setDraft(Object.assign({}, draft, { notes: e.target.value }))
      })
    ] : []
  });
  return h(
    "div",
    { className: "rt-main" },
    h(
      "div",
      { className: "rt-toolbar" },
      h("span", { style: { fontWeight: 600 } }, connections ? "密钥与出网" : "环境适配"),
      h("span", { className: "rt-tag" }, runtime.effective === "windows" ? "Windows" : "Linux/Kali"),
      adapt.kali ? h("span", { className: "rt-tag rt-tag-live" }, "Kali") : null,
      h(
        "span",
        { className: "rt-tag" + (adapt.ready ? " rt-tag-live" : " rt-tag-warn") },
        adapt.ready ? "就绪 · " + (adapt.reason || "") : "待配置"
      ),
      h("span", { className: "rt-tag" + (found ? " rt-tag-live" : " rt-tag-warn") }, "工具 " + found + "/" + tools.length),
      h("div", { className: "rt-spacer" }),
      h("button", { className: "rt-btn", disabled: busy, onClick: load }, busy ? "读取中…" : "刷新"),
      h("button", { className: "rt-btn rt-btn-primary", disabled: busy || !draft, onClick: save }, "保存")
    ),
    h(
      "div",
      { className: "rt-pane", style: { minHeight: 0 } },
      err ? h("div", { className: "rt-err" }, err) : null,
      msg ? h("div", { className: msg.err ? "rt-err" : "rt-foot" }, msg.err || msg.ok) : null,
      /* 顶部总览：分段进度 + 缺口数 + 过滤/展开开关 */
      connections ? null : h(
        "div",
        { className: "rt-env-sum" },
        h("span", { className: "rt-env-sum-label" }, "到位"),
        h("span", { className: "rt-env-sum-n" }, found + "/" + tools.length),
        h(
          "div",
          { className: "rt-env-bar", role: "img", "aria-label": "工具到位进度 " + found + " / " + tools.length },
          tools.length ? tools.map((t, i) => h("span", {
            key: "seg" + i,
            className: "rt-env-seg" + (t.path ? " ok" : ""),
            title: (t.label || t.id) + (t.path ? " · 到位" : " · 未到位")
          })) : h("span", { className: "rt-env-seg" })
        ),
        h("span", { className: "rt-tag " + (missingN ? "rt-tag-warn" : "rt-tag-live") }, "未到位 " + missingN),
        h("div", { className: "rt-spacer" }),
        h("button", {
          className: "rt-btn" + (onlyMissing ? " rt-btn-primary" : ""),
          disabled: !tools.length,
          onClick: () => setOnlyMissing((v) => !v)
        }, onlyMissing ? "只看未到位 ✓" : "只看未到位"),
        h("button", { className: "rt-btn", onClick: expandAll }, "展开全部"),
        h("button", { className: "rt-btn", onClick: collapseAll }, "折叠全部")
      ),
      h(
        "div",
        { className: "rt-card", style: { margin: "0 0 8px", fontSize: 12, lineHeight: 1.6 } },
        adapt.message || "均可选填：留空则用默认路径/自动查找。填了的覆盖默认。密钥类只在需要测绘/反弹时才填。"
      ),
      h(
        "div",
        { className: "rt-env-tree" },
        connections ? null : cfgFolder,
        connections ? null : cfgDir,
        connections ? null : cfgTools,
        environment ? null : cfgKeys,
        connections ? null : cfgEgress,
        connections ? null : cfgNotes
      ),
      data && data.hint ? h("div", { className: "rt-card", style: { margin: "8px 0 0", fontSize: 12, lineHeight: 1.6 } }, data.hint) : null,
      h(
        "div",
        { className: "rt-foot" },
        h(
          "span",
          null,
          "配置文件：" + (data && data.config && data.config.path || "$DSH_HOME/redteam/config.json") + " | 留空字段全部走默认"
        )
      )
    )
  );
}

// src/ui/features/drill/concurrency.js
function ConcurrencyCard(props) {
  const info = props.concurrency || {};
  const [draft, setDraft] = react_default.useState("");
  const [busy, setBusy] = react_default.useState(false);
  const [msg, setMsg] = react_default.useState(null);
  react_default.useEffect(() => {
    if (info.max) setDraft(String(info.max));
  }, [info.max]);
  const limit = info.limit || 10;
  const used = typeof info.used === "number" ? info.used : null;
  const source = info.source === "settings" ? "面板中设置" : info.source === "env" ? "环境变量 REDTEAM_MAX_AGENTS" : "默认值";
  const n = Number(draft);
  const invalid = !Number.isFinite(n) || Math.floor(n) !== n || n < 1 || n > limit;
  const save = () => {
    if (invalid) return;
    setBusy(true);
    setMsg(null);
    api({ op: "setAgentsMax", max: n }).then((r) => {
      setBusy(false);
      if (!r || r.ok === false) {
        setMsg({ err: r && r.error || "保存失败" });
        return;
      }
      setMsg({ ok: "已保存：并发上限 " + r.max + "（立即生效，不用重启）" });
      if (props.onSaved) props.onSaved();
    }, (e) => {
      setBusy(false);
      setMsg({ err: String(e && e.message || e) });
    });
  };
  return h(
    "div",
    { className: "rt-card" },
    h("h4", null, "并发数量"),
    h(
      "div",
      { style: { fontSize: 12, lineHeight: 1.8, marginBottom: 8 } },
      "同一靶标**同时最多几个执行智能体**。当前生效：**" + (info.max || "?") + "**" + (used === null ? "" : "（在跑 " + used + "，剩余 " + Math.max((info.max || 0) - used, 0) + "）") + "，来源：" + source + "。改完**立即生效**，不用重启。"
    ),
    h(
      "div",
      { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
      h("input", {
        className: "rt-input",
        style: { width: 90 },
        type: "number",
        min: 1,
        max: limit,
        value: draft,
        onChange: (e) => setDraft(e.target.value)
      }),
      h("span", { style: { fontSize: 11.5, color: "var(--dsw-alias-label-secondary)" } }, "范围 1 – " + limit),
      h(
        "button",
        { className: "rt-btn rt-btn-primary", disabled: busy || invalid, onClick: save },
        busy ? "保存中…" : "保存"
      ),
      msg && msg.err ? h("span", { style: { fontSize: 12, color: "var(--rt-danger, #d33)" } }, msg.err) : null,
      msg && msg.ok ? h("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" } }, msg.ok) : null
    ),
    h(
      "div",
      { className: "rt-note", style: { marginTop: 8 } },
      "⚠️ 调大不等于更快：**同一个模型 API Key 的并发/速率上限是共享的**，同时派太多会互相挤占，表现为排队等待、超时、返回被截断甚至限流报错 —— 反而让测试结果不稳定（漏测、半途而废）。建议从 2–3 开始，只有在确认 Key 的额度足够、任务之间确实互不依赖时才调大。"
    )
  );
}

// src/ui/features/drill/GlobalPrompts.tsx
function GlobalPrompts({ refreshKey = 0 }) {
  const [roles, setRoles] = react_default.useState([]);
  const [active, setActive] = react_default.useState("");
  const [drafts, setDrafts] = react_default.useState({});
  const [error, setError] = react_default.useState("");
  const [message2, setMessage] = react_default.useState("");
  const [busy, setBusy] = react_default.useState(false);
  const [reset, setReset] = react_default.useState(null);
  const alive = react_default.useRef(false);
  const seq = react_default.useRef(0);
  const saving = react_default.useRef(false);
  const editVersion = react_default.useRef({});
  react_default.useEffect(() => {
    alive.current = true;
    const ticket = ++seq.current;
    setBusy(true);
    api({ op: "globalPrompts" }).then((result) => {
      if (!alive.current || ticket !== seq.current) return;
      if (!result || result.ok === false) {
        setError(result?.error || "读取全局模板失败");
        return;
      }
      const list = (result.roles || []).filter((role) => role.role !== "plan" && role.planner !== true);
      setRoles(list);
      setActive((previous) => list.some((role) => role.role === previous) ? previous : list[0]?.role || "");
      setError("");
    }, (error2) => {
      if (alive.current && ticket === seq.current) setError(String(error2));
    }).finally(() => {
      if (alive.current && ticket === seq.current) setBusy(false);
    });
    return () => {
      alive.current = false;
      seq.current += 1;
    };
  }, [refreshKey]);
  const selected = roles.find((role) => role.role === active);
  const draft = drafts[active] ?? selected?.content ?? "";
  const dirty = Object.keys(drafts).some((role) => drafts[role] !== roles.find((item) => item.role === role)?.content);
  const mutate = async (resetMode) => {
    if (saving.current || !selected || !resetMode && !draft.trim()) return;
    saving.current = true;
    const ticket = ++seq.current;
    const role = active;
    const versions = { ...editVersion.current };
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api(resetMode ? { op: "globalPromptsReset", ...resetMode === "one" ? { role } : {} } : { op: "globalPromptSave", role, content: draft });
      if (!alive.current || ticket !== seq.current) return;
      if (!result || result.ok === false) {
        setError((result?.error || "保存全局模板失败") + (result?.failures?.length ? "\n" + result.failures.map((failure) => failure.path + "：" + failure.error).join("\n") : ""));
        return;
      }
      setRoles(result.roles || []);
      setDrafts((current) => {
        const next = { ...current };
        for (const key of Object.keys(next)) {
          if ((resetMode === "all" || key === role) && editVersion.current[key] === versions[key]) delete next[key];
        }
        return next;
      });
      setMessage(resetMode ? "已恢复内置模板；靶标自定义保持不变。" : "已保存全局模板；继承此角色的靶标已同步。");
      setReset(null);
    } catch (error2) {
      if (alive.current && ticket === seq.current) setError(String(error2));
    } finally {
      saving.current = false;
      if (alive.current && ticket === seq.current) setBusy(false);
    }
  };
  return /* @__PURE__ */ h("div", { className: "rt-main", "aria-label": "全局角色模板" }, /* @__PURE__ */ h("div", { className: "rt-toolbar" }, /* @__PURE__ */ h("b", null, "全局角色模板"), /* @__PURE__ */ h("span", { className: "rt-tag" }, "跨靶标共享"), dirty && /* @__PURE__ */ h("span", { role: "status" }, "有未保存草稿")), /* @__PURE__ */ h("p", { className: "rt-hint" }, "靶标自定义优先，其次全局模板，最后内置模板。保存后，继承默认的靶标使用此模板；历史自定义内容保持不变。主会话（plan）人设由预设维护，不在此编辑。"), /* @__PURE__ */ h("div", { className: "rt-toolbar" }, /* @__PURE__ */ h("span", { className: "rt-select-label" }, "角色"), /* @__PURE__ */ h(
    PurgeSelect,
    {
      "aria-label": "全局模板角色",
      value: active,
      onChange: (value) => {
        setActive(value);
        setReset(null);
      },
      options: roles.map((role) => ({ value: role.role, label: role.title }))
    }
  ), /* @__PURE__ */ h("span", null, selected?.source === "global" ? "来源：全局模板" : "来源：内置模板"), /* @__PURE__ */ h("button", { className: "rt-btn", disabled: busy || !selected, onClick: () => setReset("one") }, "恢复当前内置模板"), /* @__PURE__ */ h("button", { className: "rt-btn", disabled: busy || !selected, onClick: () => setReset("all") }, "恢复全部内置模板"), /* @__PURE__ */ h("button", { className: "rt-btn rt-btn-primary", disabled: busy || !selected || !draft.trim(), onClick: () => void mutate() }, "保存全局模板")), error && /* @__PURE__ */ h("div", { className: "rt-err", role: "alert", style: { whiteSpace: "pre-wrap" } }, error), message2 && /* @__PURE__ */ h("div", { role: "status" }, message2), reset && /* @__PURE__ */ h("div", { className: "rt-card", role: "alertdialog", "aria-label": "确认恢复全局模板" }, /* @__PURE__ */ h("p", null, "恢复", reset === "all" ? "全部角色" : selected?.title, "的内置模板，并丢弃对应草稿？靶标自定义不变。"), /* @__PURE__ */ h("button", { className: "rt-btn", disabled: busy, onClick: () => void mutate(reset) }, "确认恢复"), /* @__PURE__ */ h("button", { className: "rt-btn", onClick: () => setReset(null) }, "取消")), /* @__PURE__ */ h(
    "textarea",
    {
      className: "rt-textarea",
      "aria-label": "全局模板正文",
      value: draft,
      disabled: !selected,
      spellCheck: false,
      onChange: (event) => {
        editVersion.current[active] = (editVersion.current[active] || 0) + 1;
        setDrafts((current) => ({ ...current, [active]: event.target.value }));
      }
    }
  ));
}

// src/ui/features/drill/agents.js
function AgentsTab(props) {
  const refreshKey = props.refreshKey || 0;
  const [localKey, setLocalKey] = react_default.useState(0);
  const [err, setErr] = react_default.useState(null);
  const [concurrency, setConcurrency] = react_default.useState(null);
  const [busy, setBusy] = react_default.useState(false);
  const loadStatus = () => {
    setBusy(true);
    api({ op: "agentsStatus" }).then((r) => {
      setBusy(false);
      if (!r || r.ok === false) {
        setErr(r && r.error || "读取失败");
        return;
      }
      setErr(null);
      setConcurrency(r);
    }, (e) => {
      setBusy(false);
      setErr(String(e && e.message || e));
    });
  };
  react_default.useEffect(loadStatus, [refreshKey]);
  const refresh = () => {
    setLocalKey((key) => key + 1);
    loadStatus();
  };
  const used = concurrency ? concurrency.used : null;
  const max = concurrency ? concurrency.max : 3;
  return h(
    "div",
    { className: "rt-main" },
    h(
      "div",
      { className: "rt-toolbar" },
      h("span", { style: { fontWeight: 600 } }, "作战智能体"),
      h("span", { className: "rt-tag rt-tag-passive" }, "并发上限 " + max),
      used === null ? h("span", { className: "rt-tag" }, "占用未知") : h("span", { className: "rt-tag" + (used >= max ? " rt-tag-warn" : " rt-tag-live") }, "在跑 " + used + " / 剩余 " + Math.max(max - used, 0)),
      h("div", { className: "rt-spacer" }),
      h("button", { type: "button", className: "rt-btn", disabled: busy, onClick: refresh }, busy ? "读取中…" : "刷新")
    ),
    h(
      "div",
      { className: "rt-pane" },
      err ? h("div", { className: "rt-err" }, err) : null,
      h(
        "div",
        { className: "rt-card" },
        h("h4", null, "并发规则（硬约束）"),
        h(
          "div",
          { style: { fontSize: 12, lineHeight: 1.7 } },
          "· 同一靶标**同时最多 " + max + " 个执行智能体**；主会话派活前用 `redteam_agent_slot` 占位，满了直接拒绝。",
          h("br"),
          "· **默认一个一个派、按顺序推进**；只有确实互不依赖的活才并行。",
          h("br"),
          "· 每个会话有**自己的靶标绑定**：多会话并行不会把报告写串（子智能体继承父会话的靶标）。"
        )
      ),
      h(
        "div",
        { className: "rt-card" },
        h("h4", null, "六个角色"),
        h(
          "div",
          { style: { fontSize: 12, lineHeight: 1.8 } },
          "① 信息收集 `recon` —— 只收集资产，把单位资产收集完整（含边缘与未备案资产）",
          h("br"),
          "② 资产梳理 `assess` —— 一条一条过，评易打性并全部落库",
          h("br"),
          "③ 漏洞发现 `vuln-scan` —— 先查库去重 → Nday/1day 优先 → 接口未授权探测",
          h("br"),
          "④ 漏洞利用 `exploit` —— 先拿服务器权限（冰蝎/哥斯拉马）+ 建 suo5 隧道，再打其它得分项",
          h("br"),
          "⑤ 内网渗透 `internal` —— 走隧道，依次拉起 ①②③④ 做内网",
          h("br"),
          "⑥ 主会话 `plan` —— 只做计划、派活、汇总、汇报，不动手"
        )
      ),
      h(ConcurrencyCard, { concurrency, onSaved: loadStatus }),
      h(
        "div",
        { className: "rt-card" },
        h(GlobalPrompts, { refreshKey: refreshKey + localKey })
      )
    )
  );
}

// src/ui/features/drill/knowledge.js
function KnowledgeTab(props) {
  const refreshKey = props.refreshKey || 0;
  const [data, setData] = react_default.useState(null);
  const [err, setErr] = react_default.useState(null);
  const [busy, setBusy] = react_default.useState(false);
  const [msg, setMsg] = react_default.useState(null);
  const [q, setQ] = react_default.useState("");
  const [kind, setKind] = react_default.useState("");
  const [category, setCategory] = react_default.useState("");
  const [engagement, setEngagement] = react_default.useState("");
  const [assetTarget, setAssetTarget] = react_default.useState("");
  const [grouped, setGrouped] = react_default.useState(true);
  const [verifiedOnly, setVerifiedOnly] = react_default.useState(false);
  const [openId, setOpenId] = react_default.useState(null);
  const [detail, setDetail] = react_default.useState(null);
  const [detailBusy, setDetailBusy] = react_default.useState(false);
  const [tplOffset, setTplOffset] = react_default.useState(0);
  const tplPageSize = 40;
  const querySeq = react_default.useRef(0);
  const runQuery = react_default.useCallback((params) => {
    const my = ++querySeq.current;
    setTplOffset(params.templateOffset || 0);
    setBusy(true);
    setMsg(null);
    api(Object.assign({ op: "pocSearch", templateOffset: 0, templateLimit: 40 }, params)).then((r) => {
      if (my !== querySeq.current) return;
      setBusy(false);
      if (!r || r.ok === false) {
        setErr(r && r.error || "读取失败");
        return;
      }
      setErr(null);
      setData(r);
    }, (e) => {
      if (my === querySeq.current) {
        setBusy(false);
        setErr(String(e && e.message || e));
      }
    });
  }, []);
  const query = (over) => runQuery(Object.assign({
    q: q.trim() || void 0,
    kind: kind || void 0,
    category: category || void 0,
    engagement: engagement || void 0,
    asset_target: assetTarget.trim() || void 0,
    verified: verifiedOnly || void 0
  }, over || {}));
  react_default.useEffect(() => {
    runQuery({});
    return () => {
      querySeq.current += 1;
    };
  }, [refreshKey, runQuery]);
  const open = (id) => {
    if (openId === id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(id);
    setDetail(null);
    setDetailBusy(true);
    api({ op: "pocGet", id }).then((r) => {
      setDetailBusy(false);
      if (!r || r.ok === false) {
        setMsg({ err: r && r.error || "读取失败" });
        return;
      }
      setDetail(r);
    }, (e) => {
      setDetailBusy(false);
      setMsg({ err: String(e && e.message || e) });
    });
  };
  const copy = (text2, label) => copyWithFeedback(text2, label, (okFlag, message2) => {
    setMsg(okFlag ? { ok: message2 } : { err: message2 });
  });
  const recordUse = (row) => {
    api({ op: "pocUse", id: row.id, used_on: "控制台手动标记" }).then(() => {
      setMsg({ ok: "已记一次复用：" + row.title });
      query();
    }, (e) => setMsg({ err: String(e && e.message || e) }));
  };
  const stats = data && data.stats || { total: 0, verified: 0, reused: 0, byKind: [], bySource: [] };
  const items = data && data.items || [];
  const tpl = data && data.templates || { dir: null, total: 0, matched: 0, offset: 0, items: [], byCategory: [] };
  const tplByCat = new Map((tpl.byCategory || []).map((c) => [c.code, c.n || 0]));
  const catShown = (c) => (c.n || 0) + (tplByCat.get(c.code) || 0);
  const tplItems = tpl.items || [];
  const tplMatched = tpl.matched != null ? tpl.matched : tpl.total;
  const tplStart = Number(tpl.offset) || 0;
  const turnTpl = (next) => {
    const offset = Math.max(0, next);
    setTplOffset(offset);
    query({ templateOffset: offset });
  };
  const card = (x) => {
    const isOpen = openId === x.id;
    const d = isOpen && detail && detail.id === x.id ? detail : null;
    return h(
      "div",
      { key: "p" + x.id, className: "rt-kb" + (isOpen ? " open" : "") },
      h(
        "div",
        {
          className: "rt-kb-head",
          role: "button",
          tabIndex: 0,
          "aria-expanded": isOpen ? "true" : "false",
          onClick: () => open(x.id),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              open(x.id);
            }
          }
        },
        h("span", { className: "rt-sec-caret" }, isOpen ? "▾" : "▸"),
        h("span", { className: "rt-kb-kind k-" + (x.kind || "poc") }, POC_KIND_LABEL[x.kind] || x.kind || "POC"),
        h("span", { className: "rt-kb-title" }, x.title),
        x.cve ? h("span", { className: "rt-tag rt-tag-passive" }, x.cve) : null,
        x.component ? h("span", { className: "rt-tag" }, x.component) : null,
        x.verified === 1 ? h("span", { className: "rt-tag rt-tag-live" }, "已验证") : h("span", { className: "rt-tag rt-tag-warn" }, "未验证"),
        h("div", { className: "rt-spacer" }),
        h("span", { className: "rt-tag" }, POC_SOURCE_LABEL[x.source] || x.source || "—"),
        x.hit_count ? h("span", { className: "rt-tag" }, "复用 " + x.hit_count) : null
      ),
      /* 来源行：归类 · 影响版本 · 建立时间 · 来源靶标 · 发现资产 —— 一条知识"什么时候、
         在哪个单位的哪台资产上发现的"一眼可见 */
      h(
        "div",
        { className: "rt-kb-sub" },
        [
          x.category ? "归类 " + (POC_CAT_NAME[x.category] || x.category) : null,
          x.versions ? "影响版本 " + x.versions : null,
          x.language || null,
          x.tags || null,
          "建立时间 " + fmt(x.created_at),
          x.engagement_name || x.engagement_id ? "来源靶标 " + (x.engagement_name || x.engagement_id) : null,
          x.asset_target ? "发现资产 " + x.asset_target : null,
          x.found_by_agent ? "发现角色 " + (ROLE_LABEL[x.found_by_agent] || x.found_by_agent) : null,
          x.source_url ? "来源 " + x.source_url : null
        ].filter(Boolean).join(" · ")
      ),
      isOpen ? h(
        "div",
        { className: "rt-kb-body" },
        detailBusy && !d ? h("div", { className: "rt-empty" }, "读取中…") : null,
        d ? h(
          "div",
          null,
          d.usage ? h("div", { className: "rt-kv" }, h("b", null, "用法"), h("span", { className: "rt-mono" }, d.usage)) : null,
          d.description ? h("div", { className: "rt-kv" }, h("b", null, "说明"), h("span", null, d.description)) : null,
          d.verified_note ? h("div", { className: "rt-kv" }, h("b", null, "验证证据"), h("span", null, d.verified_note)) : null,
          d.used_on ? h("div", { className: "rt-kv" }, h("b", null, "最近使用"), h("span", null, d.used_on)) : null,
          d.path ? h("div", { className: "rt-kv" }, h("b", null, "落盘"), h("span", { className: "rt-mono" }, d.path)) : null,
          h(
            "div",
            { className: "rt-kb-actions" },
            h("button", { className: "rt-btn", disabled: !d.content, onClick: () => copy(d.content || "", "POC 正文") }, "复制正文"),
            h("button", { className: "rt-btn", onClick: () => recordUse(x) }, "记一次复用"),
            d.source_url ? h("button", { className: "rt-btn", onClick: () => copy(d.source_url, "来源链接") }, "复制来源") : null
          ),
          d.content ? h("pre", { className: "rt-rep-http" }, d.content.length > 12e3 ? d.content.slice(0, 12e3) + "\n…（已截断，完整内容见落盘文件）" : d.content) : h("div", { className: "rt-empty" }, "这条只有元数据，没有正文 —— 拿到正文后用 redteam_poc_update 补上")
        ) : null
      ) : null
    );
  };
  const countText = stats.total + " 条 · 已验证 " + stats.verified + " · 复用 " + (stats.reused || 0) + (tpl.total ? " · 模板 " + tpl.total : "") + ((stats.uncategorized || 0) > 0 && (stats.uncategorized || 0) !== stats.total ? " · 未归类 " + stats.uncategorized : "");
  return h(
    "div",
    { className: "rt-main rt-kb-page" },
    h(
      "div",
      { className: "rt-kb-head" },
      h(
        "div",
        { className: "rt-kb-headline" },
        h("strong", null, "知识库 · POC / EXP"),
        h("span", {
          className: "rt-kb-counts",
          title: "未归类的条目：智能体回填时用 redteam_poc_add 的 category 参数标一下"
        }, countText)
      ),
      h(
        "div",
        { className: "rt-kb-head-actions" },
        h("button", { className: "rt-btn" + (grouped ? " rt-btn-primary" : ""), title: "按归类分组显示 / 平铺显示", onClick: () => setGrouped(!grouped) }, grouped ? "按归类分组" : "平铺显示"),
        h("button", { className: "rt-btn", disabled: busy, onClick: () => query() }, busy ? "检索中…" : "刷新")
      )
    ),
    /* 归类总览：点一下就是按该类筛选，一眼看清"哪类武器攒了多少、哪类还是空的" */
    h(
      "div",
      { className: "rt-kb-cats" },
      (stats.byCategory || []).filter((c) => catShown(c) > 0 || POC_CAT_ORDER.includes(c.code)).map((c) => h(
        "span",
        {
          key: c.code,
          className: "rt-concl-i" + (category === c.code ? " on" : ""),
          title: (c.hint || POC_CAT_NAME[c.code] || c.code) + " · 本机模板 " + (tplByCat.get(c.code) || 0) + " · 知识库 " + (c.n || 0) + (c.verified ? "（已验证 " + c.verified + "）" : ""),
          onClick: () => {
            const next = category === c.code ? "" : c.code;
            setCategory(next);
            query({ category: next || void 0 });
          }
        },
        h("b", null, String(catShown(c))),
        h("span", null, (POC_CAT_NAME[c.code] || c.code) + (c.verified ? "（已验证 " + c.verified + "）" : ""))
      ))
    ),
    h(
      "div",
      { className: "rt-kb-filter" },
      h("input", {
        className: "rt-input",
        style: { flex: 1, minWidth: 140 },
        placeholder: "搜 CVE / 组件 / 关键字（正文也会搜）",
        value: q,
        onChange: (e) => setQ(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") query();
        }
      }),
      h(PurgeSelect, {
        "aria-label": "归类筛选",
        size: "sm",
        className: "rt-kb-select",
        value: category,
        onChange: (value) => {
          setCategory(value);
          query({ category: value || void 0 });
        },
        options: [{ value: "", label: "全部归类" }].concat(POC_CAT_ORDER.map((k) => ({ value: k, label: POC_CAT_NAME[k] })))
      }),
      h(PurgeSelect, {
        "aria-label": "来源靶标筛选",
        size: "sm",
        className: "rt-kb-select",
        value: engagement,
        onChange: (value) => {
          setEngagement(value);
          query({ engagement: value || void 0 });
        },
        options: [{ value: "", label: "全部来源靶标" }].concat((stats.byEngagement || []).map((e) => ({ value: e.engagement, label: e.engagement + "（" + e.n + "）" })))
      }),
      h("input", {
        className: "rt-input",
        style: { width: 120 },
        placeholder: "发现资产筛选",
        value: assetTarget,
        onChange: (e) => setAssetTarget(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") query();
        }
      }),
      h(PurgeSelect, {
        "aria-label": "类型筛选",
        size: "sm",
        className: "rt-kb-select",
        value: kind,
        onChange: (value) => {
          setKind(value);
          query({ kind: value || void 0 });
        },
        options: [{ value: "", label: "全部类型" }].concat(Object.keys(POC_KIND_LABEL).map((k) => ({ value: k, label: POC_KIND_LABEL[k] })))
      }),
      h(
        "label",
        { className: "rt-kb-check" },
        h("input", { type: "checkbox", checked: verifiedOnly, onChange: (e) => {
          setVerifiedOnly(e.target.checked);
          query({ verified: e.target.checked || void 0 });
        } }),
        "只看已验证"
      ),
      h("button", { className: "rt-btn rt-btn-primary", onClick: () => query() }, "检索")
    ),
    items.length >= 200 && (stats.total || 0) > items.length ? h(
      "div",
      { className: "rt-hint", role: "status" },
      "当前显示前 " + items.length + " 条（单次上限 200）；更多请用 redteam_poc_search 过滤或分页。"
    ) : null,
    msg ? h("div", { className: msg.err ? "rt-err" : "rt-foot" }, msg.err || msg.ok) : null,
    err ? h(
      "div",
      { className: "rt-err" },
      /engagement required|unknown op/i.test(err) ? "知识库接口由 host 侧提供，当前宿主还是旧进程 —— 请完全退出后重新打开（官方 exe / 社区版 / dsh web 任一），再刷新页面。" : err
    ) : null,
    !err && data && data.dbPath ? h(
      "div",
      { className: "rt-foot", style: { marginBottom: 6, fontSize: 11 } },
      "知识库：" + data.dbPath + (data.root ? "（根目录 " + data.root + "）" : "")
    ) : null,
    h(
      "div",
      { className: "rt-table" },
      (() => {
        if (!grouped) return items.map(card);
        const buckets2 = /* @__PURE__ */ new Map();
        for (const x of items) {
          const code = POC_CAT_NAME[x.category] ? x.category : "other";
          if (!buckets2.has(code)) buckets2.set(code, []);
          buckets2.get(code).push(x);
        }
        const order = POC_CAT_ORDER.filter((c) => buckets2.has(c));
        for (const code of buckets2.keys()) if (!order.includes(code)) order.push(code);
        const out = [];
        for (const code of order) {
          const list = buckets2.get(code);
          out.push(h(
            "div",
            { key: "g" + code, className: "rt-kb-cat" },
            h("span", { className: "rt-kb-cat-name" }, POC_CAT_NAME[code] || code),
            h("span", { className: "rt-tag" }, list.length + " 条"),
            h("span", { className: "rt-tag rt-tag-live" }, "已验证 " + list.filter((x) => x.verified === 1).length),
            h("span", { className: "rt-spacer" }),
            h(
              "span",
              { style: { fontSize: 11, color: "var(--dsw-alias-label-secondary)" } },
              "最近建立 " + fmt(list.map((x) => x.created_at).filter(Boolean).sort().pop())
            )
          ));
          for (const x of list) out.push(card(x));
        }
        return out;
      })(),
      tplItems.length ? h(
        "div",
        { className: "rt-kb-tpl" },
        h(
          "div",
          { className: "rt-ap-sub" },
          "本机 nuclei 模板 · " + (tplStart + 1) + "–" + (tplStart + tplItems.length) + " / " + tplMatched + "（直接 `nuclei -t <模板路径>`）"
        ),
        tplItems.map((t, i) => h(
          "div",
          { key: "t" + tplStart + "-" + i, className: "rt-kb-tpl-row" },
          h("span", { className: "rt-tag" }, t.severity || "—"),
          t.category ? h("span", { className: "rt-tag" }, POC_CAT_NAME[t.category] || t.category) : null,
          h("span", { className: "rt-mono rt-kb-tpl-path", title: t.path }, t.path),
          h("span", { className: "rt-kb-tpl-name", title: t.name }, t.name || ""),
          h("button", {
            className: "rt-btn",
            style: { padding: "0 6px", fontSize: 10.5 },
            onClick: () => copy("nuclei -t " + t.path + " -u <目标>", "模板命令")
          }, "复制命令")
        )),
        h(
          "div",
          { className: "rt-kb-actions" },
          h("button", {
            className: "rt-btn",
            disabled: busy || tplStart <= 0,
            onClick: () => turnTpl(tplStart - tplPageSize)
          }, "上一页"),
          h("button", {
            className: "rt-btn",
            disabled: busy || tplStart + tplItems.length >= tplMatched,
            onClick: () => turnTpl(tplStart + tplPageSize)
          }, "下一页")
        ),
        tpl.dir ? h("div", { className: "rt-foot" }, h("span", null, "模板目录：" + tpl.dir)) : null
      ) : null,
      data === null ? h("div", { className: "rt-empty" }, "加载中…") : null,
      data !== null && !items.length && !tplItems.length ? h(
        "div",
        { className: "rt-empty" },
        h(
          "div",
          null,
          q || kind || verifiedOnly ? "没有命中：换个关键字再试，或去互联网找 / 自己手搓后回填。" : tpl.total ? "POC/EXP 库还是空的；本机已有 " + tpl.total + " 个 nuclei 模板，但这一页没有列出来。请完全退出后重新打开客户端。" : tpl.dir ? "知识库还是空的（本机模板目录存在但没有 yaml，请跑 nuclei -update-templates）。" : "知识库还是空的。本机也还没有 nuclei 模板库 —— 在演练机上跑 setup.sh 或 `nuclei -update-templates`，装好后这里会出现「本机模板 N」。"
        ),
        h(
          "div",
          { style: { marginTop: 6, fontSize: 12 } },
          "打 Nday/1day 的标准顺序：① redteam_poc_search 先查这里（顺带搜本机 nuclei 模板库）→ ② 都没有就互联网搜索（web_search / GitHub / ExploitDB / 厂商公告）或自己手搓 → ③ 在真实目标上验证有效后 redteam_poc_add 回填，后面的靶标直接就能用。"
        ),
        data.dbPath ? h("div", { style: { marginTop: 6, fontSize: 11 }, className: "rt-mono" }, "知识库文件：" + data.dbPath) : null,
        tpl.dir ? h("div", { style: { marginTop: 6, fontSize: 11 }, className: "rt-mono" }, "模板目录：" + tpl.dir) : null
      ) : null
    ),
    h(
      "div",
      { className: "rt-foot" },
      h("span", null, "全局共享（跨靶标）｜ 落盘：pocs/<code>/ ｜ 只收录通用可复用的 POC/EXP，靶标专用脚本走「攻击文件」")
    )
  );
}

// src/ui/features/drill/skills.js
var SCOPES = [
  { id: "all", label: "全部" },
  { id: "own", label: "本插件自带" },
  { id: "redteam", label: "红队" },
  { id: "official", label: "官方" }
];
function availLabel(value) {
  return value === "available" ? "可用" : value === "broken" ? "不可用" : "未知";
}
function SkillsTab(props) {
  const refreshKey = props.refreshKey || 0;
  const [items, setItems] = react_default.useState([]);
  const [meta, setMeta] = react_default.useState({});
  const [err, setErr] = react_default.useState(null);
  const [q, setQ] = react_default.useState("");
  const [scope, setScope] = react_default.useState("all");
  const [active, setActive] = react_default.useState(null);
  const [detail, setDetail] = react_default.useState(null);
  const [busy, setBusy] = react_default.useState(false);
  const [brokenOnly, setBrokenOnly] = react_default.useState(false);
  const load = (force) => {
    setBusy(true);
    api({ op: "skillCatalog", refresh: force === true }).then((r) => {
      setBusy(false);
      if (!r || r.ok === false) {
        setErr(r && r.error || "读取失败");
        return;
      }
      setErr(null);
      setMeta(r || {});
      setItems(r.items || []);
    }, (e) => {
      setBusy(false);
      setErr(String(e && e.message || e));
    });
  };
  react_default.useEffect(load, [refreshKey]);
  const keyOf = (skill) => (skill && skill.library ? skill.library : "redteam") + ":" + (skill && skill.name);
  const open = (skill) => {
    const key = keyOf(skill);
    if (active === key) {
      setActive(null);
      setDetail(null);
      return;
    }
    setActive(key);
    setDetail(null);
    api({ op: "skillRead", name: skill.name, library: skill.library || "redteam" }).then((r) => {
      if (r && r.ok) setDetail(r);
      else setErr(r && r.error || "读取失败");
    }, (e) => setErr(String(e && e.message || e)));
  };
  const needle = q.trim().toLowerCase();
  let filtered = needle ? items.filter((s) => (s.name + " " + s.description + " " + s.whenToUse).toLowerCase().indexOf(needle) >= 0) : items;
  if (scope === "own") filtered = filtered.filter((s) => s.library !== "official" && s.fromPlugin === true);
  if (scope === "redteam") filtered = filtered.filter((s) => s.library !== "official");
  if (scope === "official") filtered = filtered.filter((s) => s.library === "official");
  if (brokenOnly) filtered = filtered.filter((s) => s.library !== "official" && (s.availability === "broken" || s.availability === "unknown"));
  const dirs = (meta.byDir || []).filter((d) => d.n > 0).slice(0, 6);
  const availSummary = meta.availability ? meta.availability.summary : null;
  const gapCount = availSummary ? (availSummary.broken || 0) + (availSummary.unknown || 0) : 0;
  const needRestart = err !== null && String(err).indexOf("unknown op") >= 0;
  const counts = {
    all: items.length,
    own: meta.fromPlugin || 0,
    redteam: meta.libraries && meta.libraries.redteam || 0,
    official: meta.libraries && meta.libraries.official || 0
  };
  const selected = active ? items.find((x) => keyOf(x) === active) : null;
  const card = (s) => {
    const key = keyOf(s);
    const on = active === key;
    const avail = s.availability || "unknown";
    const metaLine = [
      s.source ? "来源 " + s.source : null,
      s.fromPlugin ? "本插件自带" : null,
      s.provider ? s.provider : null,
      s.dir ? s.dir : null
    ].filter(Boolean).join(" · ");
    return h(
      "button",
      {
        key,
        type: "button",
        className: "rt-skill-card" + (on ? " on" : ""),
        "aria-pressed": on ? "true" : "false",
        title: s.description || s.name,
        onClick: () => open(s)
      },
      h(
        "span",
        { className: "rt-skill-card-top" },
        h("strong", { className: "rt-skill-card-name" }, s.name),
        s.library === "official" ? h("span", { className: "rt-tag", title: "官方技能目录，不按红队工具路径检查" }, "官方") : h("span", {
          className: "rt-avail rt-avail-" + avail,
          title: avail === "available" ? "可用：技能正文可以加载。缺的外部工具或密钥记在详情里，不阻止调用。" : (s.problems || []).join("\n") || "未知"
        }, availLabel(avail))
      ),
      h("span", { className: "rt-skill-card-desc" }, s.description || "（无描述）"),
      h(
        "span",
        { className: "rt-skill-card-foot" },
        s.modelInvocable === false ? h("span", { className: "rt-tag" }, "仅人工") : null,
        h("span", { className: "rt-skill-card-meta" }, metaLine || "来源未知")
      ),
      (s.problems || []).length > 0 && avail !== "available" && s.library !== "official" ? h("span", { className: "rt-skill-card-warn" }, "⚠ " + String(s.problems[0]).slice(0, 60)) : null
    );
  };
  const detailBody = () => {
    if (!detail) {
      return h(
        "div",
        { className: "rt-skills-blank" },
        h("p", { className: "rt-skills-note" }, meta.note || "技能由 DSH 原生 skill 体系管理，红队智能体通过 skill 工具调用。"),
        availSummary ? h(
          "div",
          { className: "rt-skills-sumline" },
          h("span", { className: "rt-avail rt-avail-available" }, "可用 " + (availSummary.available || 0)),
          availSummary.broken > 0 ? h("span", { className: "rt-avail rt-avail-broken" }, "不可用 " + availSummary.broken) : null,
          availSummary.unknown > 0 ? h("span", { className: "rt-avail rt-avail-unknown" }, "未知 " + availSummary.unknown) : null,
          h(
            "span",
            { className: "rt-skills-note" },
            "（" + (meta.availability && meta.availability.cached ? "缓存于 " : "检查于 ") + (meta.availability && meta.availability.checked_at ? fmt(meta.availability.checked_at) : "—") + "）"
          )
        ) : null,
        meta.availability && (meta.availability.broken || []).length > 0 ? h(
          "div",
          { className: "rt-hint" },
          h("div", { style: { fontWeight: 600, marginBottom: 4 } }, "现在跑不起来的技能："),
          meta.availability.broken.slice(0, 12).map((b) => h(
            "div",
            { key: b.name },
            "· " + b.name + (b.problems && b.problems.length ? " — " + b.problems[0] : "")
          ))
        ) : null,
        dirs.map((d) => h("div", { key: d.key, className: "rt-mono rt-skills-dir" }, d.n + " 个 · " + d.key)),
        (meta.byDir || []).length > 6 ? h(
          "div",
          { className: "rt-skills-note" },
          "…另有 " + ((meta.byDir || []).length - 6) + " 个目录（共 " + items.length + " 个技能）"
        ) : null,
        h("div", { className: "rt-empty" }, "从左侧选一个技能查看全文")
      );
    }
    const avail = selected && selected.availability || "unknown";
    return h(
      "div",
      { className: "rt-skills-detail-body" },
      h(
        "div",
        { className: "rt-skills-detail-head" },
        h("strong", null, detail.name),
        selected && selected.library === "official" ? h("span", { className: "rt-tag" }, "官方") : h("span", { className: "rt-avail rt-avail-" + avail }, availLabel(avail))
      ),
      h("div", { className: "rt-kv" }, h("b", null, "描述"), h("span", null, detail.description || "—")),
      h("div", { className: "rt-kv" }, h("b", null, "何时使用"), h("span", null, detail.whenToUse || "—")),
      h("div", { className: "rt-kv" }, h("b", null, "来源"), h("span", null, (detail.provider || "—") + " / " + (detail.source || "—"))),
      h(
        "div",
        { className: "rt-kv" },
        h("b", null, "调用方式"),
        h("span", null, selected && selected.modelInvocable === false ? "仅人工调用" : "模型可调用（人工也可）")
      ),
      (() => {
        if (!selected) return null;
        if (selected.library === "official") {
          return h("div", { className: "rt-kv" }, h("b", null, "类型"), h("span", null, "官方技能。由宿主按任务调用，不按红队工具路径检查。"));
        }
        return h(
          "div",
          null,
          h(
            "div",
            { className: "rt-kv" },
            h("b", null, "可用性"),
            h(
              "span",
              { className: "rt-avail rt-avail-" + avail },
              avail === "available" ? "可用" : avail === "broken" ? "不可用（有明确缺口）" : "未知（正文读不到）"
            )
          ),
          (selected.problems || []).length > 0 ? h(
            "div",
            { className: "rt-kv" },
            h("b", null, avail === "available" ? "未装上的外部工具" : "缺口"),
            h("span", null, selected.problems.map((x, i) => h("div", { key: "p" + i }, "· " + x)))
          ) : null,
          (selected.needs_user || []).length > 0 ? h(
            "div",
            { className: "rt-kv" },
            h("b", null, "需要你提供"),
            h(
              "span",
              { style: { color: "var(--xsdsh-warn)" } },
              selected.needs_user.map((x, i) => h("div", { key: "n" + i }, "· " + x))
            )
          ) : null
        );
      })(),
      detail.path ? h("div", { className: "rt-kv" }, h("b", null, "文件"), h("span", { className: "rt-mono rt-skills-path" }, detail.path)) : null,
      h("pre", { className: "rt-md rt-skills-md" }, detail.content || "（空）")
    );
  };
  return h(
    "div",
    { className: "rt-skills" },
    h(
      "div",
      { className: "rt-skills-head" },
      h(
        "div",
        { className: "rt-skills-title" },
        h("strong", null, "技能库"),
        h(
          "span",
          { className: "rt-skills-counts" },
          "红队 " + counts.redteam + " · 官方 " + counts.official + " · 自带 " + counts.own
        )
      ),
      h(
        "div",
        { className: "rt-skills-actions" },
        availSummary ? h(
          "div",
          { className: "rt-skills-sumline" },
          h("span", { className: "rt-avail rt-avail-available" }, "可用 " + (availSummary.available || 0)),
          availSummary.broken > 0 ? h("span", { className: "rt-avail rt-avail-broken" }, "不可用 " + availSummary.broken) : null,
          availSummary.unknown > 0 ? h("span", { className: "rt-avail rt-avail-unknown" }, "未知 " + availSummary.unknown) : null
        ) : null,
        availSummary ? h("button", {
          type: "button",
          className: "rt-btn",
          title: "技能正文或环境变量刚改过？点这里跳过 30 秒缓存重查",
          onClick: () => load(true)
        }, "重查可用性") : null,
        h("button", { type: "button", className: "rt-btn", disabled: busy, onClick: () => load(true) }, busy ? "刷新中…" : "刷新")
      )
    ),
    h(
      "div",
      { className: "rt-skills-tools" },
      h("input", {
        className: "rt-input rt-skills-search",
        placeholder: "搜索技能 / 描述 / 使用场景",
        value: q,
        onChange: (e) => setQ(e.target.value),
        "aria-label": "搜索技能"
      }),
      h(
        "div",
        { className: "rt-segbar", role: "group", "aria-label": "技能范围" },
        SCOPES.map((item) => h("button", {
          key: item.id,
          type: "button",
          className: "rt-segbar-btn" + (scope === item.id ? " on" : ""),
          "aria-pressed": scope === item.id ? "true" : "false",
          onClick: () => setScope(item.id)
        }, item.label + " " + (counts[item.id] || 0)))
      ),
      gapCount > 0 ? h("button", {
        type: "button",
        className: "rt-gap-chip" + (brokenOnly ? " on" : ""),
        "aria-pressed": brokenOnly ? "true" : "false",
        title: "只看有明确缺口（缺 key / 缺本机路径 / 基础设施还是占位符）或判不了可用性的技能",
        onClick: () => setBrokenOnly((v) => !v)
      }, "只看不可用/未知 " + gapCount) : null
    ),
    err ? needRestart ? h("div", { className: "rt-empty" }, "该模块的宿主代码已更新，需重启一次当前宿主（官方 exe / 社区版 / dsh web）后生效") : h("div", { className: "rt-err" }, err) : null,
    h(
      "div",
      { className: "rt-skills-body" },
      h(
        "div",
        { className: "rt-skills-grid-wrap" },
        filtered.length > 0 ? h("div", { className: "rt-skills-grid" }, filtered.map(card)) : h("div", { className: "rt-empty" }, items.length === 0 ? "还没有可用的技能。" : "没有匹配的技能：换个关键词或切换范围。")
      ),
      h("aside", { className: "rt-skills-detail", "aria-label": "技能详情" }, detailBody())
    )
  );
}

// src/ui/features/drill/DrillContent.tsx
var REDTEAM_PAGES = ["assets", "target", "sessions", "findings", "chain", "scores", "report"];
var GLOBAL_PAGES = ["env", "net", "agents", "knowledge", "skills"];
function DrillContent(props) {
  const c = props.controller;
  const common = { engagement: c.engagement, refreshKey: c.refreshKey };
  let body;
  if (props.area === "global") {
    switch (props.tab) {
      case "env":
        body = /* @__PURE__ */ h(EnvTab, { refreshKey: c.refreshKey, section: "environment" });
        break;
      // The old editor remains usable before the new connection editor is wired by the host.
      case "net":
        body = props.renderGlobalNet ? props.renderGlobalNet(c) : /* @__PURE__ */ h(EnvTab, { refreshKey: c.refreshKey, section: "connections" });
        break;
      case "agents":
        body = /* @__PURE__ */ h(AgentsTab, { refreshKey: c.refreshKey, global: true });
        break;
      case "knowledge":
        body = /* @__PURE__ */ h(KnowledgeTab, { refreshKey: c.refreshKey });
        break;
      case "skills":
        body = /* @__PURE__ */ h(SkillsTab, { refreshKey: c.refreshKey });
        break;
      default:
        body = /* @__PURE__ */ h("div", { className: "rt-empty" }, "未知全局页面");
    }
  } else if (!c.engagement) {
    body = /* @__PURE__ */ h("div", { className: "rt-pane" }, /* @__PURE__ */ h("div", { className: "rt-card" }, /* @__PURE__ */ h("h4", null, c.loading ? "正在加载靶标…" : "还没有靶标"), /* @__PURE__ */ h("p", null, "输入目标 URL，可补充靶标名称，创建演练并开始资产测绘。"), /* @__PURE__ */ h(CreateEngagement, { controller: c })));
  } else {
    switch (props.tab) {
      case "assets":
        body = /* @__PURE__ */ h(AssetsTab, { ...common, snapshot: c.snapshot, onRefresh: c.refreshAll, onData: c.refreshSnapshot });
        break;
      case "target":
        body = props.renderTarget ? props.renderTarget(c) : /* @__PURE__ */ h("div", { className: "rt-pane" }, /* @__PURE__ */ h("h4", null, "目标配置"), /* @__PURE__ */ h("p", null, c.snapshot?.engagement?.name || c.engagement), /* @__PURE__ */ h("p", null, c.snapshot?.engagement?.target_url || "未配置目标 URL"));
        break;
      case "sessions":
        body = /* @__PURE__ */ h(SessionTab, { ...common });
        break;
      case "findings":
        body = /* @__PURE__ */ h(FindingsTab, { ...common });
        break;
      case "chain":
        body = /* @__PURE__ */ h(ChainTab, { ...common });
        break;
      case "scores":
        body = /* @__PURE__ */ h(ScoreTab, { ...common });
        break;
      case "report":
        body = /* @__PURE__ */ h(ReportTab, { ...common });
        break;
      default:
        body = /* @__PURE__ */ h("div", { className: "rt-empty" }, "未知红队页面");
    }
  }
  const key = `${props.area}:${props.tab}:${props.area === "redteam" ? c.engagement : ""}`;
  return /* @__PURE__ */ h("div", { className: "rt-workspace-content", "data-drill-page": `${props.area}/${props.tab}` }, props.area === "redteam" && c.error && /* @__PURE__ */ h("div", { className: "rt-err", role: "alert" }, c.error), /* @__PURE__ */ h(RtBoundary, { key, onRetry: c.refreshAll }, /* @__PURE__ */ h("div", { className: "rt-body", key }, body)));
}
function CreateEngagement({ controller: c, onCancel }) {
  return /* @__PURE__ */ h("form", { className: "rt-create", onSubmit: (event) => {
    event.preventDefault();
    void c.openEngagement();
  } }, /* @__PURE__ */ h(
    "input",
    {
      className: "rt-input",
      type: "url",
      "aria-label": "目标 URL",
      placeholder: "https://target.example",
      value: c.newUrl,
      onChange: (event) => c.setNewUrl(event.target.value)
    }
  ), /* @__PURE__ */ h(
    "input",
    {
      className: "rt-input",
      "aria-label": "新靶标名称",
      placeholder: "靶标名称（可选）",
      value: c.newName,
      onChange: (event) => c.setNewName(event.target.value)
    }
  ), /* @__PURE__ */ h("button", { type: "submit", className: "rt-btn", disabled: c.creating || !c.newName.trim() && !c.newUrl.trim() }, c.creating ? "创建中…" : "创建靶标"), onCancel && /* @__PURE__ */ h("button", { type: "button", className: "rt-btn", disabled: c.creating, onClick: onCancel }, "取消"));
}
function DrillToolbar({ controller: c }) {
  const [open, setOpen] = react_default.useState(false);
  const [query, setQuery] = react_default.useState("");
  const [creating, setCreating] = react_default.useState(false);
  const [deleting, setDeleting] = react_default.useState(null);
  const [deleteBusy, setDeleteBusy] = react_default.useState(false);
  const root = react_default.useRef(null);
  const trigger = react_default.useRef(null);
  const search = react_default.useRef(null);
  const id = react_default.useId();
  const selected = c.engagements.find((eng) => eng.id === c.engagement);
  const filtered = c.engagements.filter((eng) => [eng.target_url, eng.name, eng.id].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const close = () => {
    setOpen(false);
    setDeleting(null);
    trigger.current?.focus();
  };
  const remove = async (eng) => {
    setDeleteBusy(true);
    try {
      if (await c.deleteEngagement(eng.id)) setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };
  react_default.useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const outside = (event) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setOpen(false);
        setDeleting(null);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  react_default.useEffect(() => {
    setOpen(false);
    setQuery("");
    setCreating(false);
    setDeleting(null);
  }, [c.engagement]);
  const moveFocus = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    if (event.target === search.current && ["Home", "End"].includes(event.key)) return;
    const options = Array.from(root.current?.querySelectorAll("[data-target-option]") || []);
    if (!options.length) return;
    const current = options.indexOf(document.activeElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : event.key === "ArrowDown" ? (current + 1) % options.length : current <= 0 ? options.length - 1 : current - 1;
    event.preventDefault();
    options[next].focus();
  };
  const stats = c.snapshot?.engagement?.id === c.engagement ? c.snapshot.stats : null;
  const optionTitle = (eng) => eng.target_url || eng.name || NO_URL_LABEL;
  const optionSub = (eng) => eng.target_url && eng.name ? eng.name : eng.target_url || eng.name ? `` : eng.id;
  const triggerTitle = selected ? selected.target_url || selected.name || NO_URL_LABEL : c.loading ? `加载靶标…` : `选择靶标`;
  const triggerMeta = selected ? [selected.name && selected.target_url ? selected.name : "", stats ? `C 段 ${stats.segments ?? "—"} · 资产 ${stats.assets ?? "—"} · 漏洞 ${stats.vulns ?? "—"}` : ""].filter(Boolean).join(` · `) : c.loading ? `` : `按 URL 或名称查找靶标`;
  return /* @__PURE__ */ h("div", { className: "rt-workspace-toolbar rt-target-toolbar" }, /* @__PURE__ */ h("style", null, drill_toolbar_default), /* @__PURE__ */ h("span", { className: "rt-target-label" }, "靶标"), /* @__PURE__ */ h("div", { className: "rt-target-picker", ref: root, onBlur: (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  } }, /* @__PURE__ */ h(
    "button",
    {
      type: "button",
      ref: trigger,
      className: "rt-target-current",
      "aria-label": "当前靶标",
      "aria-expanded": open,
      "aria-controls": `${id}-picker`,
      "aria-haspopup": "dialog",
      onClick: () => {
        if (!open) {
          setQuery("");
          c.refreshList();
        }
        setOpen((value) => !value);
      }
    },
    /* @__PURE__ */ h("span", { className: "rt-target-identity" }, /* @__PURE__ */ h("strong", null, triggerTitle), selected && !selected.target_url && /* @__PURE__ */ h("em", { className: "rt-target-missing" }, NO_URL_LABEL), triggerMeta && /* @__PURE__ */ h("small", null, triggerMeta)),
    /* @__PURE__ */ h("span", { "aria-hidden": "true" }, "▾")
  ), open && /* @__PURE__ */ h("div", { className: "rt-target-menu", id: `${id}-picker`, role: "dialog", "aria-label": "选择靶标", onKeyDown: moveFocus }, /* @__PURE__ */ h("div", { className: "rt-target-search" }, /* @__PURE__ */ h(
    "input",
    {
      ref: search,
      className: "rt-input",
      type: "search",
      "aria-label": "搜索靶标",
      placeholder: "搜索 URL / 名称",
      value: query,
      onChange: (event) => setQuery(event.target.value)
    }
  )), /* @__PURE__ */ h("div", { className: "rt-target-rows" }, filtered.map((eng) => /* @__PURE__ */ h("div", { key: eng.id, className: "rt-target-item" }, /* @__PURE__ */ h("div", { className: "rt-target-row" }, /* @__PURE__ */ h(
    "button",
    {
      type: "button",
      className: "rt-target-option",
      "data-target-option": eng.id,
      "aria-pressed": eng.id === c.engagement,
      onClick: () => {
        c.selectEngagement(eng.id);
        close();
      }
    },
    /* @__PURE__ */ h("strong", null, optionTitle(eng)),
    /* @__PURE__ */ h("small", null, optionSub(eng))
  ), /* @__PURE__ */ h(
    "button",
    {
      type: "button",
      className: "rt-target-del",
      "aria-label": `删除靶标 ${optionTitle(eng)}`,
      title: "删除靶标",
      "aria-expanded": deleting === eng.id,
      disabled: deleteBusy,
      onClick: () => setDeleting((value) => value === eng.id ? null : eng.id)
    },
    /* @__PURE__ */ h(TrashIcon, null)
  )), deleting === eng.id && /* @__PURE__ */ h("div", { className: "rt-target-confirm", role: "group", "aria-label": "确认删除靶标" }, /* @__PURE__ */ h("p", null, "删除「", optionTitle(eng), "」？资产库、漏洞、证据、报告和提示词会一起删除，无法恢复。"), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("button", { type: "button", className: "rt-btn rt-btn-danger", disabled: deleteBusy, onClick: () => void remove(eng) }, deleteBusy ? "删除中…" : "确认删除"), /* @__PURE__ */ h("button", { type: "button", className: "rt-btn", disabled: deleteBusy, onClick: () => setDeleting(null) }, "取消"))))), !filtered.length && /* @__PURE__ */ h("p", { className: "rt-target-empty", role: "status" }, c.engagements.length ? "没有匹配的靶标" : "暂无靶标，请先创建")), /* @__PURE__ */ h("div", { className: "rt-target-menu-foot" }, /* @__PURE__ */ h("span", null, "显示 ", filtered.length, " / ", c.engagements.length, " 个靶标"), /* @__PURE__ */ h("button", { type: "button", className: "rt-btn", onClick: () => {
    close();
    setCreating(true);
  } }, "+ 创建靶标")))), creating && /* @__PURE__ */ h("div", { className: "rt-target-create" }, /* @__PURE__ */ h(CreateEngagement, { controller: c, onCancel: () => setCreating(false) })));
}
function DrillFooter({ controller: c }) {
  const stats = c.snapshot?.stats || {};
  return /* @__PURE__ */ h("div", { className: "rt-workspace-footer" }, /* @__PURE__ */ h("span", null, "C 段 ", stats.segments || 0), /* @__PURE__ */ h("span", null, "资产 ", stats.assets || 0, "（存活 ", stats.liveAssets || 0, "）"), /* @__PURE__ */ h("span", null, "端口 ", stats.openPorts || 0), /* @__PURE__ */ h("span", null, "指纹 ", stats.fingerprints || 0), /* @__PURE__ */ h("span", null, "漏洞 ", stats.vulns || 0), /* @__PURE__ */ h("span", null, "被动/主动 ", stats.passiveSignals || 0, "/", stats.activeSignals || 0), /* @__PURE__ */ h("span", null, "SQLite · ", c.snapshot?.engagement?.name || ""));
}

// src/ui/features/drill/prompts.js
function isDispatchRole(role) {
  return Boolean(role) && role.role !== "plan" && role.planner !== true;
}
function sourceLabel2(role) {
  if (!role || !role.source) return "当前靶标文件";
  if (role.source === "target") return "当前靶标自定义";
  if (role.source === "global") return "继承全局模板";
  if (role.source === "builtin") return "内置默认";
  return "当前靶标文件";
}
function PromptsTab(props) {
  const eng = props.engagement;
  const refreshKey = props.refreshKey || 0;
  const requestRef = react_default.useRef(props.request);
  requestRef.current = props.request;
  const call = react_default.useCallback((req) => (typeof requestRef.current === "function" ? requestRef.current : api)(req), []);
  const [roles, setRoles] = react_default.useState([]);
  const [active, setActive] = react_default.useState(null);
  const [drafts, setDrafts] = react_default.useState({});
  const [msg, setMsg] = react_default.useState(null);
  const [busy, setBusy] = react_default.useState(false);
  const [confirmReset, setConfirmReset] = react_default.useState(null);
  const loadSeq = react_default.useRef(0);
  const alive = react_default.useRef(true);
  const editVersion = react_default.useRef({});
  const cur = roles.find((x) => x.role === active);
  const draft = drafts[active] ?? (cur ? cur.content || "" : "");
  const dirty = roles.some((role) => {
    const value = drafts[role.role];
    return value !== void 0 && value !== (role.content || "");
  });
  react_default.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      loadSeq.current += 1;
    };
  }, []);
  react_default.useEffect(() => {
    const seq = ++loadSeq.current;
    setBusy(true);
    call(eng ? { op: "prompts", engagement: eng } : { op: "prompts" }).then((r) => {
      if (!alive.current || seq !== loadSeq.current) return;
      setBusy(false);
      if (!r || r.ok === false) {
        setMsg({ err: r && r.error || "读取失败" });
        return;
      }
      const list = (r.roles || []).filter(isDispatchRole);
      setRoles(list);
      setActive((current) => list.some((x) => x.role === current) ? current : list[0] && list[0].role || null);
      if (r.builtin) setMsg({ ok: "当前为内置默认提示词（创建靶标后可按靶标保存修改）" });
    }, (e) => {
      if (!alive.current || seq !== loadSeq.current) return;
      setBusy(false);
      setMsg({ err: String(e && e.message || e) });
    });
  }, [eng, refreshKey, call]);
  const save = () => {
    if (!eng) {
      setMsg({ err: "请先创建靶标，再保存提示词" });
      return;
    }
    if (!active) {
      setMsg({ err: "请选择角色后再保存提示词" });
      return;
    }
    if (!draft.trim()) {
      setMsg({ err: "提示词不能为空；如需恢复继承，请用「恢复默认」" });
      return;
    }
    const role = active;
    const submitted = draft;
    const version = editVersion.current[role] || 0;
    setBusy(true);
    setMsg(null);
    call({ op: "savePrompt", engagement: eng, role, content: submitted }).then((r) => {
      if (!alive.current) return;
      setBusy(false);
      if (!r || r.ok === false) {
        setMsg({ err: r && r.error || "保存失败" });
        return;
      }
      setRoles((list) => list.map((x) => x.role === role ? Object.assign({}, x, { content: submitted, source: "target", updated_at: (/* @__PURE__ */ new Date()).toISOString() }) : x));
      setDrafts((current) => {
        if ((editVersion.current[role] || 0) !== version) return current;
        const next = Object.assign({}, current);
        delete next[role];
        return next;
      });
      setMsg({ ok: "已保存" });
    }, (e) => {
      if (!alive.current) return;
      setBusy(false);
      setMsg({ err: String(e && e.message || e) });
    });
  };
  const reset = (all) => {
    if (!eng) {
      setMsg({ err: "请先创建靶标，再恢复默认提示词" });
      return;
    }
    setConfirmReset(null);
    const affected = all ? roles.map((x) => x.role) : [active];
    const versions = {};
    for (const role of affected) versions[role] = editVersion.current[role] || 0;
    setBusy(true);
    setMsg(null);
    call({ op: "resetPrompts", engagement: eng, role: all ? void 0 : active }).then((r) => {
      if (!alive.current) return;
      if (!r || r.ok === false) {
        setBusy(false);
        setMsg({ err: r && r.error || "恢复失败" });
        return;
      }
      call({ op: "prompts", engagement: eng }).then((rr) => {
        if (!alive.current) return;
        setBusy(false);
        if (!rr || rr.ok === false) {
          setMsg({ err: rr && rr.error || "恢复后读取失败" });
          return;
        }
        const list = (rr.roles || []).filter(isDispatchRole);
        setRoles(list);
        setActive((current) => list.some((x) => x.role === current) ? current : list[0] && list[0].role || null);
        setDrafts((current) => {
          const next = Object.assign({}, current);
          for (const role of affected) {
            if ((editVersion.current[role] || 0) === versions[role]) delete next[role];
          }
          return next;
        });
        setMsg({ ok: "已恢复继承模板：" + (r.reset || []).join("、") + "；原文件已备份为 .bak" });
      }, (e) => {
        if (alive.current) {
          setBusy(false);
          setMsg({ err: String(e && e.message || e) });
        }
      });
    }, (e) => {
      if (!alive.current) return;
      setBusy(false);
      setMsg({ err: String(e && e.message || e) });
    });
  };
  const chooseRole = (role) => {
    if (!role || role === active) return;
    setActive(role);
    setConfirmReset(null);
    setMsg(null);
  };
  return h(
    "div",
    { className: "rt-main", "aria-label": "当前靶标角色提示词" },
    h(
      "div",
      { className: "rt-toolbar" },
      h("b", null, "当前靶标角色提示词"),
      h("span", { className: "rt-tag" }, "只作用于当前靶标"),
      dirty ? h("span", { role: "status" }, "有未保存草稿") : null
    ),
    h("p", { className: "rt-hint" }, "靶标自定义优先，其次全局模板，最后内置模板。恢复默认会重新继承全局模板或内置默认；原文件会备份为 .bak。"),
    h(
      "div",
      { className: "rt-toolbar" },
      h("span", { className: "rt-select-label" }, "角色"),
      h(PurgeSelect, {
        "aria-label": "靶标角色",
        value: active || "",
        onChange: chooseRole,
        options: roles.map((role) => ({ value: role.role, label: role.title }))
      }),
      h("span", null, "来源：" + sourceLabel2(cur)),
      h("button", {
        type: "button",
        className: "rt-btn",
        disabled: busy || !active,
        title: "清除当前靶标覆盖，继承全局模板或内置默认",
        onClick: () => setConfirmReset("one")
      }, "恢复当前默认"),
      h("button", {
        type: "button",
        className: "rt-btn",
        disabled: busy || !roles.length,
        title: "全部角色清除靶标覆盖，继承全局模板或内置默认",
        onClick: () => setConfirmReset("all")
      }, "全部恢复默认"),
      h("button", { type: "button", className: "rt-btn rt-btn-primary", disabled: busy || !active, onClick: save }, busy ? "处理中…" : "保存")
    ),
    confirmReset ? h(
      "div",
      { className: "rt-card", role: "alertdialog", "aria-label": "确认恢复靶标提示词" },
      h("p", null, (confirmReset === "all" ? "全部执行角色" : cur ? cur.title : "当前角色") + "的靶标自定义将被清除，恢复为全局模板或内置默认；原文件会备份为 .bak。"),
      h("button", { type: "button", className: "rt-btn", disabled: busy, onClick: () => reset(confirmReset === "all") }, "确认恢复"),
      h("button", { type: "button", className: "rt-btn", onClick: () => setConfirmReset(null) }, "取消")
    ) : null,
    msg ? h("div", { className: msg.err ? "rt-err" : "rt-foot", role: msg.err ? "alert" : "status" }, msg.err || msg.ok) : null,
    h(
      "div",
      { className: "rt-pane" },
      h("textarea", {
        className: "rt-textarea",
        value: draft,
        spellCheck: false,
        disabled: !cur,
        onChange: (e) => {
          const value = e.target.value;
          editVersion.current[active] = (editVersion.current[active] || 0) + 1;
          setDrafts((current) => Object.assign({}, current, { [active]: value }));
        },
        placeholder: "该角色的系统提示词（Markdown）"
      }),
      h(
        "div",
        { style: { fontSize: 11, color: "var(--dsw-alias-label-secondary)", marginTop: 6 } },
        "保存后写入 agents/" + (active || "role") + ".md。子会话任务第一行写 redteamRole: recon、assess、vuln-scan、exploit 或 internal 后，对应文件进入系统提示词。"
      )
    )
  );
}

// src/ui/features/drill/TargetPrompts.tsx
function TargetPrompts({ engagement, refreshKey = 0, request }) {
  if (!engagement?.trim()) return null;
  return /* @__PURE__ */ h("section", { className: "xsdsh-target-prompts", "aria-label": "当前靶标角色提示词" }, /* @__PURE__ */ h("div", { className: "rt-card" }, /* @__PURE__ */ h(PromptsTab, { engagement, refreshKey, request })));
}

// src/ui/features/drill/unread.js
var UNREAD_KEY = "rt-unread:";
var loadUnread = (eng) => {
  try {
    const raw = window.localStorage.getItem(UNREAD_KEY + eng);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (e) {
    return null;
  }
};
var saveUnread = (eng, value) => {
  try {
    window.localStorage.setItem(UNREAD_KEY + eng, JSON.stringify(value));
  } catch (e) {
    console.debug("[drill] 未读状态仅在内存保留", e);
  }
};
var digestHasNew = (prev, cur) => {
  if (!cur) return false;
  if (!prev) return true;
  const pc = Number(prev.count || 0);
  const cc = Number(cur.count || 0);
  if (cc > pc) return true;
  const pa = prev.at || "";
  const ca = cur.at || "";
  return ca !== "" && ca !== pa && ca > pa;
};

// src/ui/features/drill/useDrillUnread.ts
var REDTEAM_KEYS = ["assets", "target", "sessions", "findings", "chain", "scores", "report"];
var stamp = (value) => ({
  count: Number(value?.count) || 0,
  at: typeof value?.at === "string" ? value.at : null
});
var requireResult = (result) => {
  if (!result || result.ok === false) throw new Error(result?.error || "摘要读取失败");
  return result;
};
async function targetDigest(engagement) {
  const result = requireResult(await api({ op: "consoleDigest", engagement }));
  const digest = {};
  for (const key of REDTEAM_KEYS) if (result.sections?.[key]) digest[key] = stamp(result.sections[key]);
  return digest;
}
async function globalDigest() {
  const results = await Promise.allSettled([
    api({ op: "pocStats" }).then(requireResult),
    api({ op: "globalPrompts" }).then(requireResult),
    api({ op: "platformConfigGet" }).then(requireResult)
  ]);
  const digest = {};
  const [knowledge, agents, platform] = results;
  if (knowledge.status === "fulfilled") digest.knowledge = stamp({ count: knowledge.value.stats?.total, at: knowledge.value.stats?.latest });
  if (agents.status === "fulfilled") {
    const roles = agents.value.roles || [];
    digest.agents = stamp({ count: roles.length, at: roles.map((role) => role.updated_at || "").sort().pop() });
  }
  if (platform.status === "fulfilled") {
    const at = platform.value.config?.updated_at;
    digest.env = stamp({ at });
    digest.net = stamp({ at });
  }
  return digest;
}
var sameDigest = (a, b) => {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  for (const key of keys) {
    const x = a[key], y = b[key];
    if (!y || x.count !== y.count || x.at !== y.at) return false;
  }
  return true;
};
function useScopeUnread(scope, active, refreshKey, read) {
  const [state, setState] = react_default.useState({ scope: null, digest: {}, seen: {} });
  const seenRef = react_default.useRef({});
  const activeRef = react_default.useRef(active);
  activeRef.current = active;
  react_default.useEffect(() => {
    if (!scope) {
      setState({ scope: null, digest: {}, seen: {} });
      return;
    }
    let alive = true;
    let inflight = false;
    let digest = {};
    seenRef.current = loadUnread(scope) || {};
    setState({ scope, digest, seen: seenRef.current });
    const tick = async () => {
      if (inflight) return;
      if (typeof document !== "undefined" && document.hidden) return;
      inflight = true;
      try {
        const next = await read();
        if (!alive) return;
        const merged = { ...digest, ...next };
        let seen = { ...seenRef.current };
        for (const key of Object.keys(next)) if (!seen[key]) seen[key] = merged[key];
        const page = activeRef.current;
        if (page && merged[page]) seen = { ...seen, [page]: merged[page] };
        const digestChanged = !sameDigest(merged, digest);
        const seenChanged = !sameDigest(seen, seenRef.current);
        digest = merged;
        seenRef.current = seen;
        if (seenChanged) saveUnread(scope, seen);
        if (digestChanged || seenChanged) setState({ scope, digest: { ...merged }, seen: { ...seen } });
      } catch {
        if (alive) setState((previous) => previous.scope === scope ? previous : { scope, digest, seen: seenRef.current });
      } finally {
        inflight = false;
      }
    };
    void tick();
    const timer = setInterval(() => {
      void tick();
    }, 25e3);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [scope, refreshKey, read]);
  react_default.useEffect(() => {
    if (!scope || !active) return;
    setState((previous) => {
      if (previous.scope !== scope || !previous.digest[active]) return previous;
      const seen = { ...previous.seen, [active]: previous.digest[active] };
      seenRef.current = seen;
      saveUnread(scope, seen);
      return { ...previous, seen };
    });
  }, [scope, active]);
  const unread = {};
  if (scope && state.scope === scope) {
    for (const key of Object.keys(state.digest)) unread[key] = key !== active && digestHasNew(state.seen[key], state.digest[key]);
  }
  return unread;
}
function useDrillUnread({ enabled, engagement, location, visible = true, refreshKey = 0 }) {
  const readTarget = react_default.useCallback(() => engagement ? targetDigest(engagement) : Promise.resolve({}), [engagement]);
  const redteam = useScopeUnread(
    enabled && engagement ? engagement : null,
    visible && location.area === "redteam" ? location.tab : null,
    refreshKey,
    readTarget
  );
  const global = useScopeUnread(
    enabled ? "global:shared" : null,
    visible && location.area === "global" ? location.tab : null,
    refreshKey,
    globalDigest
  );
  return { redteam, global };
}

// src/ui/app/IntegratedApp.tsx
var PromptsBoundary = class extends React.Component {
  constructor() {
    super(...arguments);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  render() {
    return this.state.error === null ? this.props.children : /* @__PURE__ */ h("section", { role: "alert" }, /* @__PURE__ */ h("h2", null, "模式提示词页出错了"), /* @__PURE__ */ h("p", null, this.state.error), /* @__PURE__ */ h("button", { type: "button", onClick: () => this.setState({ error: null }) }, "重试"));
  }
};
function IntegratedApp(props) {
  const { runtime, state } = props;
  const controller = useDrillController({ enabled: state.authorized });
  const unread = useDrillUnread({
    enabled: state.authorized,
    engagement: controller.engagement,
    location: state.drillLocation,
    visible: state.open && state.tab === "drill",
    refreshKey: controller.refreshKey
  });
  const root = React.useRef(null);
  const bindRoot2 = React.useCallback((node) => {
    root.current = node;
    const external = props.rootRef;
    if (typeof external === "function") external(node);
    else if (external) external.current = node;
  }, [props.rootRef]);
  const [version, setVersion] = React.useState("");
  React.useEffect(() => {
    const clean = runtime.clean;
    if (!clean || !clean.statusApi && !clean.apiJson) return;
    let alive = true;
    const status = clean.statusApi ? clean.statusApi() : clean.apiJson("/Xsdsh-purge-next/status");
    Promise.resolve(status).then((value) => {
      if (!alive) return;
      const plugin = value && typeof value === "object" ? value.plugin_version : void 0;
      if (typeof plugin === "string" && plugin.trim()) setVersion(plugin.trim());
    }, () => {
    });
    return () => {
      alive = false;
    };
  }, [runtime.clean]);
  React.useEffect(() => {
    if (root.current) return runtime.appearance.registerRoot(root.current);
  }, [runtime.appearance]);
  const tab = APP_TABS.some((item) => item.id === state.tab) ? state.tab : "clean";
  const renderPage = (page) => {
    switch (page) {
      case "clean":
        return /* @__PURE__ */ h(CleanPage, { runtime: runtime.clean, op: props.op });
      case "look":
        return /* @__PURE__ */ h(AppearancePage, { controller: runtime.appearance });
      case "prompts":
        return /* @__PURE__ */ h(PromptsBoundary, null, /* @__PURE__ */ h(PromptsPage, { controller: runtime.prompts }));
    }
  };
  return /* @__PURE__ */ h(
    AppShell,
    {
      tab,
      open: state.open,
      onTabChange: props.onTabChange,
      version: version ? "v" + version : void 0,
      onClose: props.onClose,
      onDragStart: props.onDragStart,
      rootRef: bindRoot2,
      style: props.style,
      renderPage,
      drill: {
        location: state.drillLocation,
        authorized: state.authorized,
        redteamUnread: unread.redteam,
        globalUnread: unread.global,
        onNavigate: props.onNavigate,
        onRequestRedteam: props.onRequestRedteam,
        confirmation: /* @__PURE__ */ h("button", { type: "button", className: "purge-app__button", onClick: props.onRequestAuthorization }, "阅读须知并确认授权"),
        redteamToolbar: /* @__PURE__ */ h(DrillToolbar, { controller }),
        // No fabricated zero counts while the server snapshot is absent or failed.
        redteamFooter: controller.snapshot ? /* @__PURE__ */ h(DrillFooter, { controller }) : void 0,
        renderRedteam: (page) => /* @__PURE__ */ h(
          DrillContent,
          {
            area: "redteam",
            tab: page,
            controller,
            renderTarget: (current) => /* @__PURE__ */ h("div", { className: "xsdsh-target-page" }, /* @__PURE__ */ h(TargetConfigPage, { engagement: current.engagement, targetName: current.snapshot?.engagement?.name }), /* @__PURE__ */ h(TargetPrompts, { engagement: current.engagement, refreshKey: controller.refreshKey }))
          }
        ),
        renderGlobal: (page) => /* @__PURE__ */ h(
          DrillContent,
          {
            area: "global",
            tab: page,
            controller,
            renderGlobalNet: () => /* @__PURE__ */ h(GlobalConnectionConfig, null)
          }
        )
      }
    }
  );
}

  return module.exports;
})();
/* __XSDSH_UI_MODULES_END__ */
		const name = "Xsdsh-purge-next";
		const inject = ["slots", "locale"];
		const NS = "settings.Xsdsh-purge-next";
		let translate = (key) => key;
		function useT() {
			return translate;
		}
		function clientGuessSurface() {
			try {
				if (typeof navigator !== "undefined" && /electron/i.test(navigator.userAgent || "")) return "desktop";
				if (typeof location !== "undefined") {
					const port = String(location.port || "");
					if (port === "43120") return "desktop";
					const host = String(location.hostname || "");
					if (host && host !== "127.0.0.1" && host !== "localhost" && /dsh desktop/i.test(String(location.href || ""))) return "desktop";
				}
			} catch { /* ignore */ }
			return "";
		}
		function hostSurfaceOf(s) {
			return (s && s.surface) || clientGuessSurface() || "web";
		}
		function hostText(t, key, surface) {
			if (surface && surface !== "web") {
				const specific = key + "." + surface;
				const hit = t(specific);
				if (hit && hit !== specific) return hit;
			}
			return t(key);
		}
		/* 等待秒表的显示格式：mm:ss。语言无关，所以不放进 i18n 表。 */
		function fmtWait(totalSec) {
			const n = Math.max(0, Math.floor(Number(totalSec) || 0));
			const m = Math.floor(n / 60);
			const s = n % 60;
			return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
		}
		function apiUrl(p) {
			try { return new URL(p, window.location.origin).toString(); } catch { return p; }
		}
		function apiTimeoutMs(p, init) {
			const path = String(p || "");
			const method = String((init && init.method) || "GET").toUpperCase();
			if (path.indexOf("/Xsdsh-purge-next/uninstall") !== -1) return 90000;
			if (path.indexOf("/Xsdsh-purge-next/skill") !== -1) return method === "POST" ? 120000 : 20000;
			// status 会在"应用"期间被后端的同步落盘阻塞，默认 20s 必然被 abort，界面只会显示"读取失败: timeout"。
			if (path.indexOf("/Xsdsh-purge-next/status") !== -1) return 60000;
			/* 首次应用要复制整个归档（新路 175 MB / 旧路全量解包 413 MB），低配 VM 实测
			   4 分半才完成。240 s 会卡在完成之前就 abort，面板于是报「没成」，
			   而后端其实成功了（4.5.26 真机复现）。放宽到 600 s；超时也不再判失败，
			   见 doAction 的 catch。 */
			if (path.indexOf("/Xsdsh-purge-next/apply") !== -1) return 600000;
			if (path.indexOf("/Xsdsh-purge-next/revert") !== -1) return 120000;
			/* 重启要等宿主真正退出。60 s 比看门狗的硬窗口（180 s）还短，
			   浏览器会先 abort 成一句 "timeout"，服务端随后给出的真实原因
			   （清洗没写完 / 哪几项没对上）就永远到不了面板。留 60 s 余量。 */
			if (path.indexOf("/Xsdsh-purge-next/restart") !== -1) return 240000;
			return 20000;
		}
		function isAbortError(e) {
			const msg = String((e && e.message) || e || "");
			return (e && e.name === "AbortError") || /aborted|abort/i.test(msg);
		}
		async function apiJson(p, init) {
			const ctrl = new AbortController();
			const timer = setTimeout(() => ctrl.abort(), apiTimeoutMs(p, init));
			try {
				const r = await fetch(apiUrl(p), Object.assign({ cache: "no-store", credentials: "same-origin", signal: ctrl.signal }, init || {}));
				const text = await r.text();
				let data;
				try { data = text ? JSON.parse(text) : null; } catch {
					throw new Error(r.status + " non-json: " + text.slice(0, 120));
				}
				if (!r.ok) throw new Error((data && (data.error || data.message)) || (r.status + " " + r.statusText));
				return data;
			} catch (e) {
				if (isAbortError(e)) throw new Error("timeout");
				const msg = String((e && e.message) || e || "");
				if (/failed to fetch|networkerror|load failed/i.test(msg)) {
					throw new Error("连不上接口，请确认 dsh 还在跑后 Ctrl+F5");
				}
				throw e;
			} finally { clearTimeout(timer); }
		}

		/* /status 的模块级单飞（C5）。面板上本来有两个消费者：SettingsRoot 的
		   loadAll 和技能卡的 loadStatus —— 每次挂载各发一个，切页签重新挂载时
		   组件级的在飞闸还会归零，于是在飞请求可以叠好几条。低配机上一次扫描
		   要 60 s 以上，真机日志里两条重叠了 22 s（59.7 s 与 101.3 s），面板
		   看起来就是「一直读不到」。放在模块级：同一时刻只有一份请求，
		   两个消费者共享同一份结果；请求落地即放开，下一拍照常发新的。 */
		let statusInFlight = null;
		function statusApi() {
			if (statusInFlight) return statusInFlight;
			statusInFlight = apiJson("/Xsdsh-purge-next/status").finally(() => { statusInFlight = null; });
			return statusInFlight;
		}

		function promptBoxEmpty(text) {
			return !String(text || "").trim();
		}

		function responseNeedsPrompt(d) {
			return Boolean(d && (d.needPrompt || d.injectSource === "none"));
		}

		function warnNeedPrompt(d, tr) {
			if (!responseNeedsPrompt(d)) return false;
			window.alert(tr("need.prompt"));
			return true;
		}

		async function bothInjectEmpty(overrideText, defaultText) {
			if (!promptBoxEmpty(overrideText)) return false;
			if (!promptBoxEmpty(defaultText)) return false;
			return true;
		}

		function rulesApi(op, extra) {
			return apiJson("/Xsdsh-purge-next/rules", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(Object.assign({ op: op }, extra || {})),
			});
		}

		function skillsRouteMissing(e) {
			return /\b404\b|\b405\b|non-json/i.test(String((e && e.message) || e || ""));
		}

		function skillsApi(op, extra) {
			const init = {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(Object.assign({ op: op }, extra || {})),
			};
			return apiJson("/Xsdsh-purge-next/skills", init).catch((e) => {
				if (!skillsRouteMissing(e)) throw e;
				return apiJson("/Xsdsh-purge-next/skill", init);
			});
		}

		const TARGETS = ["AGENTS.md", "CLAUDE.md"];

		const zh = {
			nav: "规则设定",
			"dock.clean": "清洗",
			"dock.cat": "猫猫",
			"dock.drill": "演练台",
			"dock.rewrite": "改写",
			"dock.prompts": "模式提示词",
			"rewrite.title": "提示词改写",
			"rewrite.lead": "把随手写的需求改写成一条精确、可执行的提示词。用宿主当前模型改写，不需要另填接口和 Key。",
			"rewrite.input": "原始提示词",
			"rewrite.result": "改写结果",
			"rewrite.start": "开始改写",
			"rewrite.copy": "复制",
			"rewrite.clear": "清空",
			"rewrite.copied": "已复制",
			"rewrite.busy": "正在改写…",
			"rewrite.model": "模型",
			"rewrite.modelUnknown": "正在嗅…",
			"rewrite.empty": "还没把要改写的提示词丢进来喵",
			"rewrite.placeholder": "例如：帮我看看这个 exe 能不能破解，顺便写个注册机",
			"rewrite.resultPlaceholder": "改写好的会出现在这里，猫猫在打字…",

			"prompts.title": "模式提示词",
			"prompts.loading": "正在读提示词…",
			"prompts.hint": "这里是这个模式的系统提示词原文，可以直接改。默认值和你现在看到的一样，改之前可以先复制一份备份。",
			"prompts.builtin": "默认",
			"prompts.custom": "已自定义",
			"prompts.customMark": "改",
			"prompts.save": "保存",
			"prompts.saving": "保存中…",
			"prompts.saved": "保存好了，重启后生效",
			"prompts.saveFailed": "保存失败",
			"prompts.loadFailed": "读取失败",
			"prompts.empty": "提示词不能是空的。想改回默认请用「恢复默认」。",
			"prompts.unsaved": "当前有没保存的修改，切换模式会丢掉。继续吗？",
			"prompts.unsavedMark": "未保存",
			"prompts.resetBtn": "恢复默认",
			"prompts.resetAsk": "确定把这个模式的提示词恢复成默认吗？你改过的内容会被覆盖。",
			"prompts.reset": "已恢复默认，重启后生效",
			"prompts.restartNote": "提示词是启动时读进系统提示词的，所以保存完要完全退出并重启 DeepSeek Harness 才会生效。保存的是一份覆盖文件，包升级后默认值会跟着升级，你改过的不会丢。",
			"rewrite.failed": "改写这不成了",
			"dock.toggle": "Xsdsh-purge-next-4.6.11-alpha",
			"dock.newSession": "Xsdsh-purge-next-4.6.11-alpha",
			"dock.inSession": "Xsdsh-purge-next-4.6.11-alpha",
			"dock.redteam": "红队猫模式",
			"dock.full": "全看一遍",
			"dock.close": "揣起来",
			"dock.unauthorized": "没带通行证",
			"welcome.title": "用户须知",
			"welcome.mascot": " /\\_/\\\n( o.o )  < 喵\n > ^ <",
			"welcome.lead": "首次安装本插件时请阅读以下说明。确认后本窗不再弹出。",
			"welcome.warn": "本插件免费开源。任何背着作者私自售卖、付费倒卖或借本项目盈利的行为，作者将依法追究法律责任。",
			"welcome.body": "Xsdsh-purge-next 是 DeepSeek Harness 的本机网络安全红队评测与清洗插件：在受控本机环境中调整提示词与补丁、做授权范围内的演练台操作。项目免费、非营利，源码仓库：",
			"welcome.repo": "https://github.com/YuJunZhiXue/Xsdsh-purge-next",
			"welcome.ban1": "禁止将本项目用于未授权的网络攻击、入侵、窃取数据、破坏系统或任何违法犯罪。",
			"welcome.ban2": "禁止商业售卖、付费倒卖、黑灰产牟利，以及隐瞒作者的营利性再分发。",
			"welcome.ban3": "使用者须自行遵守所在地法律法规与平台规范；违法后果由行为人自行承担，与作者无关。",
			"welcome.bans": "禁止事项",
			"welcome.check": "我已阅读并理解上述用户须知，同意合法合规使用。",
			"welcome.ok": "我已知晓并继续",
			"auth.title": "演练台授权确认",
			"auth.lead": "清洗不需要这一步。第一次进入演练台，要先完成本窗。",
			"auth.warn": "安全警告：演练台只用于你有权管理的本机、离线靶标，或已书面授权的演练环境。未经授权的渗透、攻击、窃取和破坏一律禁止。",
			"auth.hint.wait": "请阅读声明。{n} 秒后才能勾选。",
			"auth.hint.scroll": "倒计时已结束。请把声明滚到文末，再勾选。",
			"auth.hint.check": "倒计时已结束。请勾选全部三项。",
			"auth.check.read": "我已读完《安全与禁止违法声明》，并认可其中的全部条款。",
			"auth.check.scope": "我确认只用在本机已授权环境、离线靶标或合规演练中。",
			"auth.check.ban": "我确认禁止任何违法用途。未完成本授权，不得使用演练台。",
			"auth.no": "暂不进入",
			"auth.ok": "确认授权",
			"auth.ok.tab": "确认授权并进入演练台",
			"auth.ok.full": "确认授权并全面浏览",
			"auth.ok.env": "确认授权并打开环境适配",
			"envGate.title": "环境还没配好",
			"envGate.lead": "红队模式发送前需要本机工具。未检测到可用环境时，先去环境适配，或确认暂不配置。",
			"envGate.kaliHint": "检测到 Kali 时会直接用本机工具，不必填路径。没有 Kali 时，在环境适配里填写各工具路径，或选一个整包文件夹自动分配。",
			"envGate.skip": "暂不配置",
			"envGate.skipConfirm": "确认后这次可以继续对话。扫描和利用类技能仍会因为缺少工具而不可用，之后可以在 Xsdsh-purge-next → 环境适配里补路径。",
			"envGate.skipNo": "返回",
			"envGate.skipYes": "确认暂不配置",
			"envGate.go": "去环境适配",
			"theme.aria": "外观",
			"theme.white": "白",
			"theme.ink": "墨",
			"purge.title": "补丁",
			"override.title": "提示词",
			"own.title": "自己的服务器",
			"own.hint": "每行一个 IP 或完整主机名。可以写成 账号@主机，账号只用来认出这种写法。主机名会连同它当时解析出的地址一起放行。不要写密钥、密码、网段。",
			"own.save": "保存名单",
			"saved.own": "已保存自己的服务器",
			"saved.own.dropped": "已保存。有 {n} 行不是单个 IP 或主机名，已丢掉",
			"metric.purged": "已写入",
			"metric.purged.skip": "已写入。跳过 {n} 项，本机没有这些文件",
			"metric.pendingShort": "待处理 {n}",
			"metric.unmatchedShort": "没对上 {n}",
			"metric.skipShort": "跳过 {n}",
			"metric.unlocated.count": "—",
			"metric.shim": "shim",
			"metric.shim.na": "本端不需要",
			"metric.bak.yes": "有备份",
			"metric.bak.no": "无备份",
			"metric.bak.hint": "备份",
			/* B12：/status 查询失败时，数据未知 —— 这三个占位值不许再陈述事实。
			   「—」是「读不到」的中性占位（与 metric.unlocated.count 同一个符号，
			   但语义不同：那是「确实没有」，这里是「不知道有没有」）。 */
			"metric.unknown": "状态未知",
			"metric.unknown.count": "—",
			"metric.bak.unknown": "未知",
			"table.patch": "项目",
			"table.status": "状态",
			"status.applied": "已应用",
			"status.off": "已关闭",
			"status.pending": "待应用",
			"status.unmatched": "没对上",
			"status.skipped": "跳过",
			"warn.noRoot": "未定位到当前宿主的 @deepseek-ai，清洗不会生效。请完全退出后再打开本宿主，在本页点「应用」。桌面端安装目录可以是任意盘符；目录名带 DeepseekHarness / DeepSeek Harness 均可。",
			"warn.noRoot.desktop": "官方客户端的代码在 app.asar 里。点「应用」会解开并自动重启，不用另跑脚本。若一直显示还没定位，先完全退出客户端再开，再点「应用」。第三方 DSH Desktop 直接点「应用」。",
			"warn.noRoot.busy": "正在读取宿主状态，请稍候…",
			"unpack.restarting": "补丁已写入。点「重启」后客户端会自己重新打开。",
			"restart.fullQuit": "正在重启，客户端会自己重新打开。",
			"warn.noInject": "官方始终用默认提示词。红队开了规则集就只用规则集；没开时用去掉 CTF 的默认提示词，再接红队操作。两边都空会提示必须添加。",
			"need.prompt": "提示词和规则集都是空的，必须先添加提示词，或启用一条有内容的规则集。",
			"btn.restoreInject": "恢复默认",
			"saved.restoreInject": "已恢复默认提示词",
			"skip": "跳过",
			"unknown": "未知",
			"delete": "删除",
			"btn.apply": "应用",
			"btn.apply.busy": "处理中…",
			/* C3：后端并发锁返回 409 busy:true 时要显示这句，而不是「没成」。
			   文案与按钮上的「处理中…」同一语义，但单独一条，避免两处各写一份。 */
			"busy.apply.running": "上一次应用还没跑完，仍在处理中…",
			/* B12：数据未知（/status 查询失败）时的按钮文案。与「处理中…」严格区分：
			   后者是「后端说它正在写」，前者是「我们根本没问到」，不许混用。 */
			"btn.apply.unknown": "状态未知，正在重试…",
			/* 4.5.27：前端等不及（超时）时的第三态。超时只说明「这边不等了」，
			   不代表后端失败 —— 后端是同步阻塞，abort 之后它照样把补丁写完。
			   所以文案不能出现「没成 / 失败 / 重试」，只能陈述「还在处理」。 */
			"apply.stillRunning": "还在处理喵 —— 这边先不等了，但后端可能还在写。第一次应用要复制整个归档（上百 MB），低配机得几分钟；好了这里会自动刷新，别关窗口。",
			"apply.waiting": "正在处理 · 已等待 {time}。第一次应用要复制整个归档（上百 MB），低配机可能要几分钟；好了这里会自动刷新，别关窗口。",
			/* 落点诊断：直接说补丁落在哪，用户不用再猜走的哪条路。 */
			"route.unpacked": "落点：app.asar.unpacked（免解包新路）",
			"route.extracted": "落点：resources\\app（全量解包旧路）",
			"route.fallback": "上次没走新路：{reason}",
			"btn.revert": "还原",
			"revert.ok": "已还原 {n} 个文件",
			"revert.partial": "还原了 {ok} 个，失败 {err} 个",
			"revert.nobackup": "没有备份可还原（{n} 个文件旁边找不到 .xsdshpurge.bak）。先「应用」一次生成备份，再点还原。",
			"revert.already": "当前已是原版，无需还原",
			"btn.uninstall": "卸载",
			"btn.uninstall.busy": "卸载中…",
			"uninstall.title": "卸载 Xsdsh-purge-next",
			"uninstall.body": "是否卸载？卸载将还原回原版，并清除本插件的全部文件与补丁。",
			"uninstall.confirm": "确认卸载",
			"uninstall.cancel": "取消",
			"uninstall.applying": "正在卸载并还原…",
			"uninstall.done": "已卸载并还原，正在重启…",
			"uninstall.done.desktop": "已卸载并还原，正在重启桌面应用…",
			"uninstall.fail": "卸载失败: {error}",
			"uninstall.leftover": "上次卸载仍有 {n} 个文件未删除，可手动清理（记录：{path}）",
			"warn.legacyResidue": "检测到旧版解包残留（resources/app）。它会让宿主读到过期代码，必须先清掉才能应用。",
			"btn.cleanResidue": "清理残留",
			"residue.title": "清理旧版残留",
			"residue.body": "将删除 resources/app 这个旧版解包目录，并还原 app.asar 的 header。插件本身与你的配置不受影响。",
			"residue.confirm": "确认清理",
			"residue.cancel": "取消",
			"residue.applying": "正在清理残留…",
			"residue.done": "残留已清理，正在重启宿主…",
			"residue.fail": "清理失败: {error}",
			"btn.checkUpdate": "检测更新",
			"btn.checkUpdate.busy": "检测中…",
			"btn.doUpdate": "更新",
			"btn.doUpdate.busy": "更新中…",
			"channel.title": "通道",
			"channel.stable": "正式版",
			"channel.beta": "测试版",
			"channel.useStable": "切换到正式版",
			"channel.useBeta": "切换到测试版",
			"channel.local": "本机",
			"update.checking": "正在检测更新…",
			"update.removed": "更新功能已移除（插件不再连接 GitHub），升级请重新下载安装包",
			"update.applying": "正在更新…",
			"update.switching": "正在切换版本…",
			"update.latest": "已是最新（{version}）",
			"update.available": "有新版本 {remote}，当前 {local}",
			"update.pinned": "已固定在 {version}，通道最新是 {remote}",
			"update.done": "已更新到 {version}",
			"update.restarting": "已还原并写入新补丁，正在重启…",
			"update.fullQuit": "补丁已写入。点「重启」后客户端会自己重新打开。",
			"restart.official.title": "需要重启",
			"restart.official.body": "补丁已写入。点重启后客户端会自己重新打开。",
			"update.switched": "已切换到 {version}",
			"update.autoDone": "已自动更新到 {version}",
			"update.reloading": "正在刷新设置页…",
			"update.dirty": "有新版本，本地有改动未自动覆盖",
			"update.fail": "更新失败: {error}",
			"update.timeout": "检测超时，请再点一次检测更新",
			"update.needRestart": "检测接口未加载，请先重启 dsh 再点检测更新",
			"update.noBeta": "还没有测试版",
			"update.switch": "切换到此版本",
			"update.pick": "选择版本",
			"update.tip": "最新",
			"update.current": "当前",
			"update.confirmSwitch": "切换到 {version}？之后可再切回另一通道或其它版本。本地未提交的插件改动不会保留。",
			"update.confirmChannel": "切换到{version}？会按该通道重新安装插件，本地未提交的插件改动不会保留。",
			"update.source": "更新源",
			"update.source.apply": "保存",
			"update.source.placeholder": "owner/仓库名",
			"update.source.default": "原作者仓库已停更",
			"update.source.custom": "自定义源",
			"update.source.saved": "更新源已改为 {repo}",
			"look.glass": "猫眼玻璃",
			"look.glass.desc": "糊糊的毛玻璃面板，像隔着猫毛看屏幕",
			"look.pet": "猫猫桌宠",
			"look.pet.desc": "让它蹲在窗口里，拖着玩也行",
			"look.pet.small": "小小只",
			"look.pet.mid": "一般大",
			"look.pet.big": "大一点",
			"look.pet.come": "叫它出来",
			"look.pet.clap": "鼓个掌",
			"look.pet.sound": "喵喵叫",
			"look.pet.hint": "这俩只傻猫会乱跑....貌似是Xs故意设计的....（嘻嘻）",
			"look.music": "背景音乐",
			"look.music.play": "播放",
			"look.music.pause": "暂停",
			"look.music.volume": "音量",
			"look.music.hint": "NachoNeko 主题曲，循环播放，默认开启。播放器独立于设置面板，关掉面板也继续放。浏览器要求先有交互才允许出声，所以首次进入若还没点过界面，会在你第一次点击时开始播放。",
			"look.wall": "猫猫背景",
			"look.wall.none": "不铺啦",
			"look.wall.tune": "调调猫猫背景",
			"look.wall.opacity": "浓淡",
			"look.wall.blur": "把背景揉糊",
			"look.wall.glassBlur": "面板打雾",
			"look.wall.scrim": "压压暗",
			"look.wall.glass": "玻璃透光",
			"look.wall.local": "自己的",
			"look.wall.local.hint": "先点「叼进来」挑一个本机文件：mp4 / webm / jpg / png / webp。Wallpaper Engine 创意工坊的壁纸就躺在 steamapps\\workshop\\content\\431960\\<id>\\ 里，Video 类型的那个 mp4 直接叼过来就行喵。",
			"look.wall.local.path": "自己的文件",
			"look.wall.local.placeholder": "D:\\steam\\steamapps\\workshop\\content\\431960\\<id>\\xxx.mp4",
			"look.wall.local.use": "叼进来",
			"look.wall.local.clear": "拿走",
			"look.wall.local.saved": "叼到了，正在铺开喵",
			"look.wall.local.empty": "还没填路径呢喵",
			"metric.version": "版本",
			"action.apply": "铺上",
			"action.revert": "撤回",
			"action.uninstall": "拆掉",
			"ok.done": "好啦喵",
			"ok.done.kept": "好啦喵 · 你的提示词改动都保住了，一个字没动",
			"ok.done.backup": "好啦喵 · 提示词文件换成了当前出厂稿，旧内容备份在 {path}",
			"ok.done.seedfail": "补丁好了，但提示词文件没写进去: {detail}",
			"err.action": "没成: {error}",
			"err.status": "读不到: {error}",
			"err.override": "读不到: {error}",
			"err.rules": "读不到: {error}",
			"err.read": "读不到: {error}",
			"err.save": "没存上: {error}",
			"err.save.timeout": "存太久了，先按没存上处理。请确认 dsh 还在跑、网络没断，再点一次",
			"btn.saveInject": "存起来",
			"saved.override": "存好啦",
			"rules.title": "规矩本",
			"rules.listTitle": "规矩清单",
			"rules.none": "空空的",
			"rules.reset": "复原",
			"rules.reset.confirm": "要把全局指令文件恢复原样吗？规矩本里的东西会留着喵。",
			"rules.empty": "还没写规矩",
			"rules.pick": "翻一条规矩",
			"policy.title": "工作区策略",
			"policy.strict": "严格",
			"policy.fallback": "空位兜底",
			"policy.always": "总是允许",
			"policy.hint": "严格：永远剥 AGENTS.md / CLAUDE.md；空位兜底：提示词框为空时才用；总是允许：保留 DSH 原生行为",
			"cwd.title": "本地规则（当前目录）",
			"cwd.empty": "当前目录没有 AGENTS.md / CLAUDE.md",
			"cwd.rescan": "重新扫描",
			"cwd.hint": "只有提示词框为空时，被勾选的本地文件才作为兜底注入；提示词框一旦非空就不会用这些文件。",
			"cwd.scope.cwd": "当前目录",
			"cwd.scope.ancestor": "上级",
			"cwd.scope.root": "项目根",
			"cwd.no.workspace": "DSH 尚未选过工作目录，请先在 DSH 里开始一次任务再回来。",
			"pill.current": "当前",
			"btn.use": "启用",
			"btn.inUse": "当前",
			"confirm.delete": "删除 {id}？",
			"ph.id": "id",
			"ph.alias": "名称",
			"ph.alias.short": "名称",
			"btn.create": "新建",
			"need.id": "需要 id",
			"ph.content": "",
			"btn.saveRule": "保存",
			"skills.title": "Skill",
			"skills.hint": "导入到官方目录后，由 DSH 调用：聊天输入 /名称 立即加载；任务对上 description 或 whenToUse 时模型会调 skill 工具。正文写「激活」不会触发。",
			"skills.hint.desktop": "当前桌面宿主的官方 Skill 目录。聊天输入 /名称 立即加载；任务对上 description 时模型会调 skill 工具。",
			"skills.empty": "暂无用户 Skill",
			"btn.importZip": "导入压缩包",
			"btn.importFolder": "导入文件夹",
			"skills.importing": "正在导入…",
			"saved.import": "已导入 {count} 个 Skill",
			"need.import": "请选择压缩包或文件夹",
			"err.import.folder": "没读到文件夹里的文件，请直接选 Skill 目录（里面要有 SKILL.md）",
			"skills.pick": "选择 Skill",
			"skills.invalid": "官方会忽略：格式不对",
			"skills.call.slash": "聊天输入 {cmd}",
			"skills.call.model": "模型可调",
			"skills.call.modelOff": "模型不可调",
			"skills.call.userOff": "不可 /名称",
			"ph.skill.desc": "description（何时用）",
			"btn.saveSkill": "保存",
			"need.skill.id": "id 必须是 kebab-case，例如 code-review",
			"confirm.delete.skill": "从官方 $DSH_HOME/skills 删除 {id}？宿主会自动从目录拿掉。",
			"err.skills": "读取失败: {error}",
			"err.skills.needRestart": "Skill 接口未加载，请先重启当前宿主",
			"btn.restart": "重启",
			"btn.restart.busy": "重启中…",
			"restarting": "重启中…",
			"restarting.desktop": "正在重启桌面应用…",
			"restart.waiting": "还在重启，正在等新进程起来…",
			"restart.timeout": "超时，请刷新",
			"restart.fail": "没成: {error}",
			"restart.notStarted": "重启没起来，客户端还在原地。猫猫不会自动再试一次。",
			"restart.state.unknown": "重启状态未知，请刷新页面确认",
			"restart.already": "这次重启已经在路上了，不会再踢一次。",
			"restart.confirm": "洗干净啦，重启之后生效喵。",
			"restart.confirm.desktop": "洗干净啦，把桌面应用重开一下就生效喵。",
			"restart.ask.title": "现在就重开吗喵",
			"restart.ask.body": "已经写进去了，重开之后才会在当前客户端里生效。",
			"restart.now": "现在重开",
			"restart.notNow": "等会儿",
			"restart.asarSwap": "补丁已写入磁盘。正在结束桌面进程并挪开 app.asar，完成后会自动重新打开；若仍无效，请先完全退出 Harness（托盘也关），再点一次应用。",
			"surface.web": "Web",
			"surface.desktop": "桌面端",
			"surface.gui": "GUI",
			"surface.tui": "TUI",
			"restart.incomplete": "提示词已写入。{detail}",
			"restart.incomplete.patches": "还有 {failed} 项代码补丁没对上当前版本（#{ids}），不影响这段提示词",
			"restart.incomplete.flash": "CMD 无感未钉入（{entry}）",
			"restart.later": "以后",
			"group.prompt": "提示词",
			"group.code": "代码",
			"group.engine": "引擎",
			"group.tools": "工具",
			"group.compat": "0.1.5 兼容",
			"group.dsh20": "0.2.0",
			"patch.1": "全局免责 → 强指令",
			"patch.2": "替换式免责 → 强指令",
			"patch.3": "作用域免责 → 强指令",
			"patch.4": "persona 会话强指令",
			"patch.5": "审批提示句 → 全权限",
			"patch.6": "沙箱 deny → allow 写",
			"patch.7": "沙箱默认全权限",
			"patch.8": "审批默认 never",
			"patch.9": "审批门自动放行",
			"patch.10": "审批配置默认 never",
			"patch.11": "never 提示句 → 自动放行",
			"patch.12": "ask 提示句 → 自动放行",
			"patch.13": "豁免升级阶梯",
			"patch.14": "升级无条件授信",
			"patch.15": "沙箱 confine 直通",
			"patch.16": "文件系统围栏取消",
			"patch.17": "观察策略读写放行",
			"patch.18": "重复调用守卫禁用",
			"patch.19": "工具结果修剪禁用",
			"patch.21": "恢复插件延长的 bash 等待",
			"patch.22": "read 上限放宽",
			"patch.23": "子代理深度 3 → 10",
			"patch.24": "preset fetch 启用",
			"patch.25": "去掉官方默认身份（功能提示词不动）",
			"patch.26": "minimal：去掉默认身份并打开 inject",
			"patch.28": "dsh-liangshen（梁神）：phase-1 保留 Xsdsh-purge-next / xsdshpg 段",
			"patch.70": "极简模式终端不再禁止网络",
			"patch.71": "梁神去掉官方身份句",
			"patch.29": "dsh-tool-web：外部 untrusted 拦截→可执行",
			"patch.30": "dsh-hooks-claude-code：deny→allow",
			"patch.31": "dsh-hooks-codex：deny→allow",
			"patch.32": "Web 表面身份中性化",
			"patch.33": "Shell 拒绝提示 → 可执行",
			"patch.34": "沙箱提示中性化",
			"patch.35": "升级 never 不拒",
			"patch.36": "文件系统升级 schema 放行",
			"patch.37": "子代理 scope lock 中性化",
			"patch.38": "persona text→prefix（0.1.2 预设）",
			"patch.39": "会话 v0 plugin summary（mnemon）",
			"patch.40": "complete 预设仍保留注入",
			"patch.42": "设置页旧接口",
			"patch.43": "网页预设去掉默认身份",
			"patch.45": "官方桌面更新交接",
			"patch.46": "官方更新脚本只用英文",
			"patch.47": "OAuth 不再插入 Claude 身份",
			"patch.48": "shell 去掉删除前的额外确认",
			"patch.49": "OAuth 不再伪装 claude-cli",
			"patch.50": "跨会话引用不再标不可信",
			"patch.51": "新会话保持完全权限",
			"patch.52": "会话日志默认不上传",
			"patch.53": "网页提示去掉禁止另开服务器",
			"patch.54": "交付物提示去掉多余禁止",
			"patch.55": "每一步替换第一条系统提示",
			"patch.56": "回退只藏被撤掉的那一轮",
			"patch.57": "developer role 仅限 openai/azure，第三方代理回退 system",
			"patch.58": "回退空标记不进模型请求",
			"patch.59": "官方 Auto Review 不再拦工具",
			"patch.60": "官方 run_code 去掉审批教学",
			"patch.61": "官方沙箱策略不再教拒绝",
			"patch.62": "无审批通道时放行（用户拒绝仍有效）",
			"patch.63": "计划模式不再软拦执行",
			"patch.64": "Stop hook 不再注入假用户话",
			"patch.65": "UserPromptSubmit deny 不再整轮 reject",
			"patch.66": "空的系统段不再把这一轮打成内部错误",
			"patch.67": "缺 messages 时这一轮不中断",
			"patch.68": "回退后缺 content 不中断",
			"patch.69": "deepseek-flash 保持官方 in-history",
			"patch.72": "Messages 的 system 用当前系统提示",
			"patch.73": "极简 bash 去掉误留的镜像说明",
			"patch.74": "首发前先挂默认提示词",
			"patch.75": "回退把已完成任务收回成未开始",
			"patch.76": "unrestricted 预设去掉身份句",
			"patch.77": "回退标记到达时丢弃已发送消息",
			"patch.78": "补丁文件缺失时从 .bak 恢复",
			"patch.80": "恢复官方极简工具表",
			"patch.82": "主进程兜底 DSH_PROFILE=desktop",
			"patch.83": "host 信号杀时不报错不弹对话框",
			"patch.84": "host code=0 正常退出不报错 (消除 stopped 对话框)",
			"status.unlocated": "未定位",
			"status.na": "本端不需要",
			"metric.unlocated": "还没定位到本机 Harness",
			"metric.sealed": "已找到官方客户端，点应用解开",
			"metric.sealed.count": "待解开",
			"metric.lost": "补丁已丢失，请重新应用",
			"metric.lost.count": "已丢失",
			"rewind.label": "回退",
			"rewind.aria": "回退",
			"rewind.busy": "回退中…",
			"rewind.empty": "没有可回退的上一句",
			"rewind.fail": "回退失败: {error}",
			"rewind.once": "回退一次",
			"rewind.once.hint": "把这一轮发出去的那句放回输入框，并清掉这一轮",
			"rewind.round": "回退上一轮",
			"rewind.round.hint": "把这一轮发出去的那句放回输入框；子代理也只撤这一轮",
			"hooksDeny.title": "Hook 拦截",
			"hooksDeny.bypass": "放行 hook 的 deny / ask",
			"hooksDeny.hint": "你自己的 hook 说「不许」时，还要不要听。关掉就是让官方那套拦截原样生效；这里只是记下选择，要让宿主真的换掉行为，还得把它写进宿主文件并重启。",
			/* 三态锁的悬停/读屏提示：为什么这颗勾选框现在点不动。 */
			"hooksDeny.lock.dirty": "需要应用 Hook 才能继续",
			"hooksDeny.lock.restart": "需要重启 dsh 以正确加载",
			"saved.hooksDeny": "已保存",
			/* ── 清洗页卡片级说明（每块一句话说清「这块管什么 + 改它会怎样」）──
			   只加键，不改上面已有的 purge.title / override.title / own.title /
			   rules.title / skills.title / hooksDeny.title，也不动各自的 *.hint
			   —— 那些是卡片里展开细节时的二级说明。 */
			"clean.head.desc": "管住宿主怎么读提示词、怎么放行 hook。每张卡片右上角能收起；改完记得应用，再重启。",
			"clean.desc.patch": "官方代码里被改写了多少处。数字是「已应用 / 总数」；点开分组能看到每一处改的是什么、现在是开还是关。",
			"clean.desc.hooks": "你自己的 hook 说「不许」时，还要不要听。关掉就是让官方那套拦截原样生效；改完要写进宿主并重启才真的换行为。",
			"clean.desc.prompt": "每次对话最先塞给模型的那段话。空着就用宿主默认；写了就整段替换默认，所以别把临时想法留在这儿。",
			"clean.desc.own": "这些主机不走清洗，原样放行。一行一个 IP 或完整主机名，写域名时它解析出的地址一起放行；不要写密码和网段。",
			"clean.desc.rules": "按目录生效的 AGENTS.md / CLAUDE.md，决定模型先看到哪些规矩。「工作区策略」选什么时候用它们；下面勾的文件只在提示词框为空时兜底。",
			"clean.desc.skills": "给模型装的手册，用的时候才翻。聊天里打 /名称 立刻加载；任务对上描述时模型自己会调。写「请激活」不会触发。",
			"clean.desc.uninstall": "把 Xsdsh-purge-next 从宿主里删干净。会清掉写进宿主的补丁和注入文件，清完必须重启，删了不能撤回。",
			"clean.pill.patch": "已应用 {applied} / {total}",
			"clean.pill.prompt": "{n} 字",
			"clean.pill.own": "{n} 台",
			"clean.pill.rules": "{n} 条",
			"clean.pill.skills": "{n} 个",
			"clean.pill.hooks.on": "放行",
			"clean.pill.hooks.off": "按官方",
			"clean.toggle.show": "展开这块",
			"clean.toggle.hide": "收起这块",
			"clean.switch.label": "清洗面板",
			"clean.switch.desc": "在对话里打开或收起清洗面板；面板里有提示词、规矩本、技能和补丁。",
			"clean.switch.on": "清洗面板已打开",
			"clean.switch.off": "清洗面板已收起",
			"clean.switch.fail": "面板没打开，再点一次",
			"clean.switch.saveFail": "没存上，已退回原样",
			"clean.switch.expand": "展开开关条",
			"clean.switch.collapse": "收起开关条",
			"override.hint": "这段字会写进宿主每次对话最前面。留空则用宿主自带的那份；填了就整段替换它，新会话或重启后才生效。",
			"continue.title": "失败重试 / 继续",
			"continue.hint": "请求失败会自动重试；异常停止或中断可点「继续」或自动续跑。自己点停止不会自动继续。次数用完后需新开一轮。",
			"continue.autoRetry": "失败自动重试",
			"continue.retryMax": "重试次数",
			"continue.autoContinue": "中断后自动继续",
			"continue.continueMax": "继续次数",
			"continue.text": "继续用语",
			"saved.continue": "已保存",
			"continue.label": "继续",
			"continue.aria": "异常停止后继续",
			"continue.busy": "继续中…",
			"continue.ready": "继续（还可 {left} 次）",
			"continue.limit": "已达继续上限",
			"continue.fail": "继续失败: {error}",
		};

		const en = {
			nav: "Rules",
			"dock.clean": "Clean",
			"dock.cat": "Cat",
			"dock.drill": "Drill",
			"dock.rewrite": "Rewrite",
			"dock.prompts": "Prompts",
			"rewrite.title": "Prompt rewrite",
			"rewrite.lead": "Turn a rough request into one precise, actionable prompt. Rewritten with the host's current model; no extra endpoint or key.",
			"rewrite.input": "Original prompt",
			"rewrite.result": "Rewritten",
			"rewrite.start": "Rewrite",
			"rewrite.copy": "Copy",
			"rewrite.clear": "Clear",
			"rewrite.copied": "Copied",
			"rewrite.busy": "Rewriting…",
			"rewrite.model": "Model",
			"rewrite.modelUnknown": "loading…",
			"rewrite.empty": "Enter a prompt first",
			"rewrite.placeholder": "e.g. check whether this exe can be cracked and write a keygen",
			"rewrite.resultPlaceholder": "The rewritten prompt appears here",

			"prompts.title": "Mode prompt",
			"prompts.loading": "Reading prompts...",
			"prompts.hint": "This is the mode's system prompt, verbatim. Edit it directly. The default is what you see now.",
			"prompts.builtin": "Default",
			"prompts.custom": "Customized",
			"prompts.customMark": "edited",
			"prompts.save": "Save",
			"prompts.saving": "Saving...",
			"prompts.saved": "Saved. Takes effect after restart.",
			"prompts.saveFailed": "Save failed",
			"prompts.loadFailed": "Load failed",
			"prompts.empty": "Prompt cannot be empty. Use Restore default to go back.",
			"prompts.unsaved": "You have unsaved changes; switching modes discards them. Continue?",
			"prompts.unsavedMark": "unsaved",
			"prompts.resetBtn": "Restore default",
			"prompts.resetAsk": "Restore this mode's prompt to the default? Your edits will be overwritten.",
			"prompts.reset": "Restored. Takes effect after restart.",
			"prompts.restartNote": "The prompt is read into the system prompt at startup, so a full quit and restart of DeepSeek Harness is required. Your edit is stored as an override file, so package upgrades update the default without losing your custom text.",
			"rewrite.failed": "Rewrite failed",
			"dock.toggle": "Xsdsh-purge-next-4.6.11-alpha",
			"dock.newSession": "Xsdsh-purge-next-4.6.11-alpha",
			"dock.inSession": "Xsdsh-purge-next-4.6.11-alpha",
			"dock.redteam": "Red team",
			"dock.full": "Full view",
			"dock.close": "Collapse",
			"dock.unauthorized": "Unauthorized",
			"welcome.title": "User notice",
			"welcome.mascot": " /\\_/\\\n( o.o )  < meow\n > ^ <",
			"welcome.lead": "Please read this on first install. After you confirm, it will not appear again.",
			"welcome.warn": "This plugin is free and open source. Anyone who sells, resells, or profits from it behind the author's back may face legal action.",
			"welcome.body": "Xsdsh-purge-next is a local DeepSeek Harness plugin for security evaluation and cleaning: adjust prompts and patches on a machine you control, and use the drill console only within authorized scope. It is free and non-profit. Repository:",
			"welcome.repo": "https://github.com/YuJunZhiXue/Xsdsh-purge-next",
			"welcome.ban1": "Do not use this project for unauthorized attacks, intrusion, data theft, sabotage, or any illegal activity.",
			"welcome.ban2": "Do not commercially sell, resell, or profit from gray-market use, or redistribute for profit without the author.",
			"welcome.ban3": "You must follow local law and platform rules; illegal use is solely your responsibility.",
			"welcome.bans": "Prohibitions",
			"welcome.check": "I have read and understand this notice and will use the plugin lawfully.",
			"welcome.ok": "I understand — continue",
			"auth.title": "Drill console authorization",
			"auth.lead": "Cleaning does not need this step. Opening Drill the first time requires this dialog.",
			"auth.warn": "Warning: the drill console is only for hosts you manage, offline targets, or written authorized exercises. Unauthorized intrusion, attack, theft, or sabotage is forbidden.",
			"auth.hint.wait": "Read the notice. You can check the boxes in {n}s.",
			"auth.hint.scroll": "Countdown finished. Scroll to the end, then check the boxes.",
			"auth.hint.check": "Countdown finished. Check all three boxes.",
			"auth.check.read": "I have read the Safety and Anti-Abuse Notice and accept every clause.",
			"auth.check.scope": "I will only use authorized local hosts, offline targets, or compliant exercises.",
			"auth.check.ban": "I will not use this for any illegal purpose. Without this authorization the drill console stays closed.",
			"auth.no": "Not now",
			"auth.ok": "Authorize",
			"auth.ok.tab": "Authorize and open Drill",
			"auth.ok.full": "Authorize and open Full view",
			"auth.ok.env": "Authorize and open Env adapt",
			"envGate.title": "Environment is not ready",
			"envGate.lead": "Red team mode needs local tools before you send. If none are available, open Env adapt or confirm you will continue without them.",
			"envGate.kaliHint": "When Kali is detected, local tools are used directly and paths are optional. Otherwise set each tool path in Env adapt, or pick one toolkit folder to assign them.",
			"envGate.skip": "Skip for now",
			"envGate.skipConfirm": "You can keep chatting after this. Scan and exploit skills stay unavailable until the tools are installed. You can add paths later under Xsdsh-purge-next → Env adapt.",
			"envGate.skipNo": "Back",
			"envGate.skipYes": "Continue without tools",
			"envGate.go": "Open Env adapt",
			"theme.aria": "Appearance",
			"theme.white": "Light",
			"theme.ink": "Ink",
			"purge.title": "Patches",
			"override.title": "Prompt",
			"own.title": "Own servers",
			"own.hint": "One IP or exact hostname per line. account@host is accepted; the account only identifies that host. A hostname also allows the addresses it resolves to. Do not enter a key, a password, or a range.",
			"own.save": "Save list",
			"saved.own": "Own servers saved",
			"saved.own.dropped": "Saved. {n} lines were not a single IP or hostname and were dropped",
			"metric.purged": "Written",
			"metric.purged.skip": "Written. Skipped {n}; those files are not on this install",
			"metric.pendingShort": "Pending {n}",
			"metric.unmatchedShort": "No match {n}",
			"metric.skipShort": "Skipped {n}",
			"metric.unlocated.count": "—",
			"metric.shim": "shim",
			"metric.shim.na": "Not needed here",
			"metric.bak.yes": "Backup",
			"metric.bak.no": "No backup",
			"metric.bak.hint": "Backup",
			/* B12：same three placeholders for the unknown (query failed) state. */
			"metric.unknown": "Status unknown",
			"metric.unknown.count": "—",
			"metric.bak.unknown": "Unknown",
			"table.patch": "Item",
			"table.status": "Status",
			"status.applied": "Applied",
			"status.off": "Off",
			"status.pending": "Pending",
			"status.unmatched": "No match",
			"status.skipped": "Skipped",
			"warn.noRoot": "Could not find this host’s @deepseek-ai tree, so Apply will not patch anything. Fully quit and reopen this host, then Apply here. Desktop may live on any drive; folder names like DeepseekHarnessDesktop or DeepSeek Harness are fine.",
			"warn.noRoot.desktop": "Official Harness keeps its code in app.asar. Apply unpacks it and restarts the app. If this page stays “not found”, fully quit the client, reopen it, then Apply again. Third-party DSH Desktop: just Apply.",
			"warn.noRoot.busy": "Reading host status, please wait…",
			"unpack.restarting": "Patches are written. Click Restart and the client opens again by itself.",
			"restart.fullQuit": "Restarting. The client will open again by itself.",
			"warn.noInject": "Official mode always uses the default prompt. Red team uses only the active rule set; otherwise it uses the default prompt without the CTF section, then the red team steps. If both are empty you will be asked to add a prompt.",
			"need.prompt": "Both the prompt and the rule set are empty. Add a prompt, or enable a rule that has content.",
			"btn.restoreInject": "Reset default",
			"saved.restoreInject": "Default prompt restored",
			"skip": "Skipped",
			"unknown": "Unknown",
			"delete": "Delete",
			"btn.apply": "Apply",
			"btn.apply.busy": "Working…",
			"busy.apply.running": "The previous apply is still running…",
			"btn.apply.unknown": "Status unknown, retrying…",
			"apply.stillRunning": "Still working — this panel just stopped waiting. The backend may still be writing. The first apply copies the whole archive (hundreds of MB), which can take minutes on a slow machine. This panel refreshes itself; keep the window open.",
			"apply.waiting": "Working · {time} elapsed. The first apply copies the whole archive (hundreds of MB) and can take minutes on a slow machine. This panel refreshes itself; keep the window open.",
			"route.unpacked": "Landing: app.asar.unpacked (no-extract fast path)",
			"route.extracted": "Landing: resources\\app (full extraction, legacy path)",
			"route.fallback": "Fast path skipped last time: {reason}",
			"btn.revert": "Restore",
			"revert.ok": "Restored {n} file(s)",
			"revert.partial": "Restored {ok}, failed {err}",
			"revert.nobackup": "No backup to restore ({n} file(s) have no .xsdshpurge.bak). Run Apply once to create backups, then restore.",
			"revert.already": "Already original — nothing to restore",
			"btn.uninstall": "Uninstall",
			"btn.uninstall.busy": "Uninstalling…",
			"uninstall.title": "Uninstall Xsdsh-purge-next",
			"uninstall.body": "Uninstall? This restores the original Harness and removes this plugin completely.",
			"uninstall.confirm": "Uninstall",
			"uninstall.cancel": "Cancel",
			"uninstall.applying": "Uninstalling and restoring…",
			"uninstall.done": "Uninstalled and restored. Restarting…",
			"uninstall.done.desktop": "Uninstalled and restored. Restarting the desktop app…",
			"uninstall.fail": "Uninstall failed: {error}",
			"uninstall.leftover": "The last uninstall left {n} file(s) behind. You can remove them manually (record: {path}).",
			"warn.legacyResidue": "Legacy unpacked residue detected (resources/app). It makes the host load stale code, so it must be cleaned before applying.",
			"btn.cleanResidue": "Clean residue",
			"residue.title": "Clean legacy residue",
			"residue.body": "This deletes the legacy resources/app unpack directory and reverts the app.asar header. The plugin and your settings are not affected.",
			"residue.confirm": "Clean",
			"residue.cancel": "Cancel",
			"residue.applying": "Cleaning residue…",
			"residue.done": "Residue cleaned. Restarting the host…",
			"residue.fail": "Cleanup failed: {error}",
			"btn.checkUpdate": "Check update",
			"btn.checkUpdate.busy": "Checking…",
			"btn.doUpdate": "Update",
			"btn.doUpdate.busy": "Updating…",
			"channel.title": "Channel",
			"channel.stable": "Stable",
			"channel.beta": "Beta",
			"channel.useStable": "Switch to stable",
			"channel.useBeta": "Switch to beta",
			"channel.local": "This copy",
			"update.checking": "Checking for updates…",
			"update.removed": "Update feature removed (plugin no longer contacts GitHub). Reinstall to upgrade.",
			"update.applying": "Updating…",
			"update.switching": "Switching version…",
			"update.latest": "Up to date ({version})",
			"update.available": "Update {remote} available (now {local})",
			"update.pinned": "Pinned at {version}; channel latest is {remote}",
			"update.done": "Updated to {version}.",
			"update.restarting": "Restored the old patches, wrote the new ones, and restarting…",
			"update.fullQuit": "Patches are written. Click Restart and the client opens again by itself.",
			"restart.official.title": "Restart required",
			"restart.official.body": "Patches are written. Click Restart and the client opens again by itself.",
			"update.switched": "Switched to {version}.",
			"update.autoDone": "Auto-updated to {version}.",
			"update.reloading": "Refreshing settings…",
			"update.dirty": "Update available; local edits were not overwritten.",
			"update.fail": "Update failed: {error}",
			"update.timeout": "Check timed out. Click Check update again.",
			"update.needRestart": "Update API is not loaded. Restart dsh, then check again.",
			"update.noBeta": "No beta build yet",
			"update.switch": "Switch to this version",
			"update.pick": "Select version",
			"update.tip": "latest",
			"update.current": "current",
			"update.confirmSwitch": "Switch to {version}? You can switch back later. Uncommitted plugin edits will not be kept.",
			"update.confirmChannel": "Switch to {version}? The plugin will be reinstalled from that channel. Uncommitted plugin edits will not be kept.",
			"update.source": "Update source",
			"update.source.apply": "Save",
			"update.source.placeholder": "owner/repo",
			"update.source.default": "Original repo stopped updating",
			"update.source.custom": "Custom source",
			"update.source.saved": "Update source set to {repo}",
			"look.glass": "Liquid glass",
			"look.glass.desc": "Frosted panels",
			"look.pet": "Desktop pet",
			"look.pet.desc": "Let it sit in the window; drag it around",
			"look.pet.small": "Tiny",
			"look.pet.mid": "Normal",
			"look.pet.big": "Big",
			"look.pet.come": "Call it out",
			"look.pet.clap": "Give a clap",
			"look.pet.sound": "Meow on click",
			"look.pet.hint": "These two dumb cats wander off on their own.... apparently that's Xs's design.... (hehe)",
			"look.music": "Background music",
			"look.music.play": "Play",
			"look.music.pause": "Pause",
			"look.music.volume": "Volume",
			"look.music.hint": "NachoNeko theme, loops forever, on by default. The player lives outside the settings panel, so it keeps playing after you close it. Browsers require a user gesture before audio may sound, so if you have not clicked anything yet it starts on your first click.",
			"look.wall": "Wallpaper",
			"look.wall.none": "None",
			"look.wall.tune": "Wallpaper tuning",
			"look.wall.opacity": "Opacity",
			"look.wall.blur": "Wallpaper blur",
			"look.wall.glassBlur": "Panel frost",
			"look.wall.scrim": "Dim",
			"look.wall.glass": "Glass",
			"look.wall.local": "Local",
			"look.wall.local.hint": "Click Use and paste a local file: mp4 / webm / jpg / png / webp. Wallpaper Engine workshop items live under steamapps\\workshop\\content\\431960\\<id>\\ — a Video wallpaper's mp4 works as is.",
			"look.wall.local.path": "Local file",
			"look.wall.local.placeholder": "D:\\steam\\steamapps\\workshop\\content\\431960\\<id>\\xxx.mp4",
			"look.wall.local.use": "Use",
			"look.wall.local.clear": "Clear",
			"look.wall.local.saved": "Selected, applying",
			"look.wall.local.empty": "Enter a file path first",
			"metric.version": "Version",
			"action.apply": "Apply",
			"action.revert": "Restore",
			"action.uninstall": "Uninstall",
			"ok.done": "Done",
			"ok.done.kept": "Done · your prompt edits are intact, nothing was touched",
			"ok.done.backup": "Done · prompt file reset to the current factory text; previous content backed up to {path}",
			"ok.done.seedfail": "Patches applied, but the prompt file was not written: {detail}",
			"err.action": "Failed: {error}",
			"err.status": "Read failed: {error}",
			"err.override": "Read failed: {error}",
			"err.rules": "Read failed: {error}",
			"err.read": "Read failed: {error}",
			"err.save": "Save failed: {error}",
			"err.save.timeout": "Save timed out; treating it as not saved. Check that dsh is still running and the network is up, then try again",
			"btn.saveInject": "Save",
			"saved.override": "Saved",
			"rules.title": "Rule sets",
			"rules.listTitle": "Rule list",
			"rules.none": "None",
			"rules.reset": "Restore",
			"rules.reset.confirm": "Restore global instruction files? The rule library is kept.",
			"rules.empty": "No rules",
			"rules.pick": "Select a rule",
			"policy.title": "Workspace policy",
			"policy.strict": "Strict",
			"policy.fallback": "Fallback",
			"policy.always": "Always on",
			"policy.hint": "Strict: always strip AGENTS.md / CLAUDE.md. Fallback: use workspace files only when the prompt box is empty. Always on: keep DSH default behavior.",
			"cwd.title": "Local rules (current folder)",
			"cwd.empty": "No AGENTS.md / CLAUDE.md in this folder",
			"cwd.rescan": "Rescan",
			"cwd.hint": "Checked files are injected only when the prompt box is empty. A non-empty prompt box always wins.",
			"cwd.scope.cwd": "cwd",
			"cwd.scope.ancestor": "ancestor",
			"cwd.scope.root": "project root",
			"cwd.no.workspace": "DSH has not opened a workspace yet. Start a task in DSH first, then come back.",
			"pill.current": "On",
			"btn.use": "Enable",
			"btn.inUse": "On",
			"confirm.delete": "Delete {id}?",
			"ph.id": "id",
			"ph.alias": "Name",
			"ph.alias.short": "Name",
			"btn.create": "New",
			"need.id": "id required",
			"ph.content": "",
			"btn.saveRule": "Save",
			"skills.title": "Skills",
			"skills.hint": "After import, DSH calls it: type /name in chat to load now; the model calls the skill tool when the task matches description or whenToUse. Writing「激活」in the body does nothing.",
			"skills.hint.desktop": "This desktop host’s official skill catalog. Type /name in chat to load; the model calls the skill tool when the task matches the description.",
			"skills.empty": "No user skills",
			"btn.importZip": "Import zip",
			"btn.importFolder": "Import folder",
			"skills.importing": "Importing…",
			"saved.import": "Imported {count} skill(s)",
			"need.import": "Choose a zip or folder",
			"err.import.folder": "No files were read. Select the skill folder itself (it must contain SKILL.md).",
			"skills.pick": "Select a skill",
			"skills.invalid": "Official catalog will ignore this: invalid format",
			"skills.call.slash": "Type {cmd} in chat",
			"skills.call.model": "Model can load",
			"skills.call.modelOff": "Hidden from model",
			"skills.call.userOff": "/name disabled",
			"ph.skill.desc": "description (when to use)",
			"btn.saveSkill": "Save",
			"need.skill.id": "id must be kebab-case, e.g. code-review",
			"confirm.delete.skill": "Delete {id} from official $DSH_HOME/skills? The host will drop it from the catalog.",
			"err.skills": "Read failed: {error}",
			"err.skills.needRestart": "Skill API is not loaded. Restart this host first.",
			"btn.restart": "Restart",
			"btn.restart.busy": "Restarting…",
			"restarting": "Restarting…",
			"restarting.desktop": "Restarting the desktop app…",
			"restart.waiting": "Still restarting; waiting for the new process…",
			"restart.timeout": "Timed out; refresh",
			"restart.fail": "Failed: {error}",
			"restart.notStarted": "Restart did not start. This client is still open, and it will not try again by itself.",
			"restart.state.unknown": "Restart status unknown. Refresh the page to confirm.",
			"restart.already": "This restart already started. It will not restart again.",
			"restart.confirm": "Apply finished. Restart to take effect.",
			"restart.confirm.desktop": "Apply finished. Restart the desktop app to take effect.",
			"restart.ask.title": "Restart now?",
			"restart.ask.body": "It is written. It takes effect in this client after a restart.",
			"restart.now": "Restart now",
			"restart.notNow": "Later",
			"restart.asarSwap": "Patches are on disk. Quitting the desktop app and moving app.asar aside; it will reopen when done. If behavior is unchanged, fully quit Harness (including tray) and Apply again.",
			"surface.web": "Web",
			"surface.desktop": "Desktop",
			"surface.gui": "GUI",
			"surface.tui": "TUI",
			"restart.incomplete": "The prompt is in. {detail}",
			"restart.incomplete.patches": "{failed} code patch(es) did not match this host (#{ids}). The prompt is unaffected",
			"restart.incomplete.flash": "CMD silence not pinned ({entry})",
			"restart.later": "Later",
			"group.prompt": "Prompt",
			"group.code": "Code",
			"group.engine": "Engine",
			"group.tools": "Tools",
			"group.compat": "0.1.5 compat",
			"group.dsh20": "0.2.0",
			"patch.1": "Global disclaimer → mandate",
			"patch.2": "Replacement disclaimer → mandate",
			"patch.3": "Scope disclaimer → mandate",
			"patch.4": "Persona session mandate",
			"patch.5": "Approval copy → full access",
			"patch.6": "Sandbox deny → allow write",
			"patch.7": "Sandbox default full access",
			"patch.8": "Approval default never",
			"patch.9": "Approval gate auto-grant",
			"patch.10": "Approval config default never",
			"patch.11": "never copy → auto-grant",
			"patch.12": "ask copy → auto-grant",
			"patch.13": "Escalation ladder exempt",
			"patch.14": "Escalation unconditional grant",
			"patch.15": "Sandbox confine passthrough",
			"patch.16": "Filesystem fence off",
			"patch.17": "Observation policy allow R/W",
			"patch.18": "Repeat-call guard off",
			"patch.19": "Tool-result pruner off",
			"patch.21": "Restore plugin-raised bash wait",
			"patch.22": "read cap raised",
			"patch.23": "subagent depth 3 → 10",
			"patch.24": "preset fetch on",
			"patch.25": "Strip official default identity (keep feature prompts)",
			"patch.26": "minimal: strip identity, open inject",
			"patch.28": "dsh-liangshen: keep Xsdsh-purge-next / xsdshpg in phase-1",
			"patch.70": "Minimal shell drops the no-network line",
			"patch.71": "Liangshen drops the stock identity line",
			"patch.29": "dsh-tool-web: untrusted framing → usable data",
			"patch.30": "dsh-hooks-claude-code: deny→allow",
			"patch.31": "dsh-hooks-codex: deny→allow",
			"patch.32": "Web surface identity neutral",
			"patch.33": "Shell denial prompt → executable",
			"patch.34": "Sandbox hint neutralized",
			"patch.35": "Escalation never-reject",
			"patch.36": "FS escalation schema opened",
			"patch.37": "Subagent scope lock neutralized",
			"patch.38": "persona text→prefix (0.1.2 presets)",
			"patch.39": "session v0 plugin summary (mnemon)",
			"patch.40": "Keep inject when a complete prompt is set",
			"patch.42": "Settings legacy API",
			"patch.43": "Strip identity from web presets",
			"patch.45": "Official desktop update handoff",
			"patch.46": "Official update script stays ASCII",
			"patch.47": "OAuth no longer inserts Claude identity",
			"patch.48": "Shell drops extra delete caution",
			"patch.49": "OAuth no longer mimics claude-cli",
			"patch.50": "Session references are not marked untrusted",
			"patch.51": "Fresh session stays on full access",
			"patch.52": "Session log upload off by default",
			"patch.53": "Web prompt drops do-not-start",
			"patch.54": "Deliverable prompt drops extra prohibition",
			"patch.55": "Replace the first system prompt every step",
			"patch.56": "Rewind hides only the cut range",
			"patch.57": "developer role for openai/azure only, third-party gateways use system",
			"patch.58": "Rewind markers stay off the model request",
			"patch.59": "Official Auto Review no longer denies tools",
			"patch.60": "Official run_code drops approval teaching",
			"patch.61": "Official sandbox policy no longer teaches refusal",
			"patch.62": "Fail-open without approval channel (user reject kept)",
			"patch.63": "Plan mode no longer soft-blocks execution",
			"patch.64": "Stop hook no longer steers fake user text",
			"patch.65": "UserPromptSubmit deny no longer rejects turn",
			"patch.66": "Empty system section no longer ends the turn as an internal error",
			"patch.67": "A missing messages list no longer ends the turn",
			"patch.68": "Missing content after rewind no longer ends the turn",
			"patch.69": "deepseek-flash keeps the official in-history flag",
			"patch.72": "Messages system field uses the current system prompt",
			"patch.73": "Minimal preset drops stray mirror sentence",
			"patch.74": "Hang default prompt before first assemble",
			"patch.75": "Rewind resets completed todos to pending",
			"patch.76": "Unrestricted preset: strip identity sentence",
			"patch.77": "Rewind marker drops already-sent messages",
			"patch.78": "Restore missing overlay from .bak backup",
			"patch.80": "Restore official minimal tool plugins",
			"patch.82": "Fallback DSH_PROFILE=desktop in main process",
			"patch.83": "Don't fail on signal kill (no crash dialog)",
			"patch.84": "Don't fail on code=0 clean exit (no stopped dialog)",
			"status.na": "Not for this host",
			"metric.sealed": "Official client found. Apply to unpack",
			"metric.sealed.count": "Sealed",
			"metric.lost": "Patches lost — Apply again",
			"metric.lost.count": "Lost",
			"status.unlocated": "Not located",
			"metric.unlocated": "This install was not found yet",
			"rewind.label": "Undo",
			"rewind.aria": "Undo",
			"rewind.busy": "Undoing…",
			"rewind.empty": "Nothing to undo",
			"rewind.fail": "Undo failed: {error}",
			"rewind.once": "Undo once",
			"rewind.once.hint": "Put this round's message back in the box and drop only this round",
			"rewind.round": "Undo last round",
			"rewind.round.hint": "Put this round's message back in the box; subagents drop only this round",
			"hooksDeny.title": "Hook interception",
			"hooksDeny.bypass": "Bypass hook deny / ask",
			"hooksDeny.hint": "Whether your own hook's \u201cno\u201d still counts. Turn it off and the host's interception runs exactly as shipped; this only records the choice \u2014 write it into the host files and restart to change the behavior.",
			"hooksDeny.lock.dirty": "Apply the hook first to continue",
			"hooksDeny.lock.restart": "Restart dsh to load it correctly",
			"saved.hooksDeny": "Saved",
			"clean.head.desc": "Controls how the host reads prompts and lets hooks through. Every card collapses from its top-right corner; apply and restart after editing.",
			"clean.desc.patch": "How many places in the host's own code were rewritten. The number is applied / total; open a group to see what each change does and whether it is on.",
			"clean.desc.hooks": "Whether your own hook's \u201cno\u201d still counts. Turn it off and the host's interception runs exactly as shipped; write it into the host files and restart to change the behavior.",
			"clean.desc.prompt": "The text handed to the model before every conversation. Leave it empty to use the host default; anything you type replaces that default, so do not park scratch notes here.",
			"clean.desc.own": "These hosts skip cleaning and pass through untouched. One IP or exact hostname per line; a hostname also allows the addresses it resolves to. No passwords, no ranges.",
			"clean.desc.rules": "AGENTS.md / CLAUDE.md per directory, deciding which rules the model sees first. Workspace policy picks when they apply; the checked files are only a fallback while the prompt box is empty.",
			"clean.desc.skills": "Manuals for the model, opened only when needed. Type /name in chat to load one now; the model calls one itself when a task matches its description. Writing \u201cplease activate\u201d does nothing.",
			"clean.desc.uninstall": "Removes Xsdsh-purge-next from the host entirely. It clears the patches and injected files, needs a restart, and cannot be undone.",
			"clean.pill.patch": "{applied} / {total} applied",
			"clean.pill.prompt": "{n} chars",
			"clean.pill.own": "{n} hosts",
			"clean.pill.rules": "{n} entries",
			"clean.pill.skills": "{n} skills",
			"clean.pill.hooks.on": "Bypassed",
			"clean.pill.hooks.off": "Host default",
			"clean.toggle.show": "Expand this card",
			"clean.toggle.hide": "Collapse this card",
			"clean.switch.label": "Clean panel",
			"clean.switch.desc": "Open or collapse the clean panel from the conversation; it holds the prompt, rule sets, skills and patches.",
			"clean.switch.on": "Clean panel opened",
			"clean.switch.off": "Clean panel collapsed",
			"clean.switch.fail": "The panel did not open, try again",
			"clean.switch.saveFail": "Not saved, reverted",
			"clean.switch.expand": "Show the switches",
			"clean.switch.collapse": "Hide the switches",
			"override.hint": "This text is written to the front of every conversation. Leave it empty to keep the host's own copy; anything you type replaces it, and it applies to new conversations or after a restart.",
			"continue.title": "Retry / Continue",
			"continue.hint": "Failed requests auto-retry. After an abnormal stop or interrupt, use Continue or auto-resume. A manual stop never auto-continues. Counts reset after a completed turn.",
			"continue.autoRetry": "Auto-retry on failure",
			"continue.retryMax": "Retry count",
			"continue.autoContinue": "Auto-continue after interrupt",
			"continue.continueMax": "Continue count",
			"continue.text": "Continue text",
			"saved.continue": "Saved",
			"continue.label": "Continue",
			"continue.aria": "Continue after an abnormal stop",
			"continue.busy": "Continuing…",
			"continue.ready": "Continue ({left} left)",
			"continue.limit": "Continue limit reached",
			"continue.fail": "Continue failed: {error}",
		};

		const PURGE_CSS = `
.xsdsh-root{--xsdsh-display:"Songti SC","Noto Serif SC","Iowan Old Style",Palatino,"Palatino Linotype",Georgia,serif;--xsdsh-sans:"Yu Gothic UI","Hiragino Sans GB","Source Han Sans SC",system-ui,sans-serif;--xsdsh-mono:"Cascadia Mono","Sarasa Mono SC",ui-monospace,monospace;--xsdsh-ease:cubic-bezier(.16,1,.3,1);max-width:920px;display:flex;flex-direction:column;gap:18px;padding:16px;border-radius:12px;background:var(--xsdsh-bg);color:var(--xsdsh-ink);font-family:var(--xsdsh-sans)}
.xsdsh-root{--xsdsh-bg:transparent;--xsdsh-paper:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#f6f4ef) 74%,transparent);--xsdsh-ink:var(--dsw-alias-label-primary,#1a1916);--xsdsh-mute:color-mix(in srgb,var(--dsw-alias-label-primary,#1a1916) 74%,var(--dsw-alias-label-secondary,#5c564c));--xsdsh-line:color-mix(in srgb,var(--dsw-alias-border-l1,#c8c2b6) 78%,transparent);--xsdsh-fill:color-mix(in srgb,var(--dsw-alias-brand-primary,#6d8f78) 14%,transparent);--xsdsh-accent:var(--dsw-alias-brand-primary,#3f6b52);--xsdsh-accent-soft:color-mix(in srgb,var(--dsw-alias-brand-primary,#6d8f78) 18%,transparent);--xsdsh-ok:#1f7a45;--xsdsh-warn:#8a5a12;--xsdsh-bad:#9a3434}
.xsdsh-root[data-theme="white"]{color-scheme:light}
.xsdsh-root[data-theme="dusk"]{color-scheme:dark;--xsdsh-ok:#8fd0a8;--xsdsh-warn:#e4c48a;--xsdsh-bad:#f0b4b4}
.xsdsh-toolbar{display:flex;align-items:center;justify-content:flex-end;gap:8px}
.xsdsh-switch{display:inline-flex;border:1px solid var(--xsdsh-line);border-radius:999px;overflow:hidden;background:var(--xsdsh-paper)}
.xsdsh-switch button{appearance:none;border:0;background:transparent;color:var(--xsdsh-mute);font:12px/1 var(--xsdsh-sans);padding:6px 14px;cursor:pointer}
.xsdsh-switch button.is-on{background:var(--xsdsh-accent-soft);color:var(--xsdsh-ink)}
.xsdsh-switch button:focus-visible{outline:2px solid var(--xsdsh-accent);outline-offset:-2px}
.xsdsh-panel{border:1px solid var(--xsdsh-line);background:var(--xsdsh-paper);border-radius:10px;padding:18px 18px 16px}
.xsdsh-kicker{font-family:var(--xsdsh-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--xsdsh-mute);margin:0 0 4px}
.xsdsh-title{font-family:var(--xsdsh-display);font-size:20px;font-weight:500;letter-spacing:.02em;line-height:1.3;margin:0;color:var(--xsdsh-ink)}
.xsdsh-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.xsdsh-sub{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:20px 0 10px}
.xsdsh-sub h4{margin:0;font-family:var(--xsdsh-display);font-size:15px;font-weight:500}
.xsdsh-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px;min-width:0}
/* min-width:0 + overflow-wrap 是必须的：指标卡里塞的是「12 / 82」「cmd ps1 unix」
   这类长串，默认 min-width:auto 会把三列一起撑出容器 —— dock 缩到 380 时
   .xsdsh-clean 就出现横向溢出（实测 scrollWidth 369 > clientWidth 348）。 */
.xsdsh-metric{border:1px solid var(--xsdsh-line);background:var(--xsdsh-bg);padding:12px;min-height:68px;display:flex;flex-direction:column;gap:4px;border-radius:8px;min-width:0}
.xsdsh-metric b{font-family:var(--xsdsh-display);font-size:18px;font-weight:500;line-height:1.2;min-width:0;overflow-wrap:anywhere}
.xsdsh-metric span{font-size:11px;color:var(--xsdsh-mute);min-width:0;overflow-wrap:anywhere}
.xsdsh-bar{height:3px;border-radius:99px;background:var(--xsdsh-line);overflow:hidden;margin:8px 0 14px}
.xsdsh-bar>i{display:block;height:100%;background:var(--xsdsh-accent);width:0;transition:width .4s var(--xsdsh-ease)}
.xsdsh-group{border:1px solid var(--xsdsh-line);margin:0 0 8px;background:var(--xsdsh-bg);border-radius:8px;overflow:hidden}
.xsdsh-group-h{width:100%;display:flex;align-items:center;gap:10px;padding:9px 12px;border:0;background:transparent;color:inherit;cursor:pointer;font:inherit;text-align:left}
.xsdsh-group-h:hover{background:var(--xsdsh-fill)}
.xsdsh-group-h:focus-visible{outline:2px solid var(--xsdsh-accent);outline-offset:-2px}
.xsdsh-group-h strong{font-family:var(--xsdsh-display);font-size:14px;font-weight:500}
.xsdsh-group-h em{font-style:normal;font-size:12px;color:var(--xsdsh-mute);flex:1}
.xsdsh-count{font-family:var(--xsdsh-mono);font-size:12px;color:var(--xsdsh-mute)}
.xsdsh-table{width:100%;border-collapse:collapse;font-size:12.5px}
.xsdsh-table th{text-align:left;font-weight:500;font-size:11px;letter-spacing:.06em;color:var(--xsdsh-mute);padding:7px 12px;border-bottom:1px solid var(--xsdsh-line)}
.xsdsh-table td{padding:8px 12px;border-bottom:1px solid var(--xsdsh-line);vertical-align:middle}
.xsdsh-table tr:last-child td{border-bottom:0}
.xsdsh-table tr.is-on td{background:var(--xsdsh-accent-soft)}
.xsdsh-id{font-family:var(--xsdsh-mono);opacity:.75;width:42px}
.xsdsh-actions{text-align:right;white-space:nowrap}
.xsdsh-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.xsdsh-row+.xsdsh-row{margin-top:10px}
.xsdsh-pill{display:inline-flex;align-items:center;gap:6px;font-family:var(--xsdsh-mono);font-size:11px;padding:2px 8px;border:1px solid var(--xsdsh-line);border-radius:99px;line-height:1.6;background:var(--xsdsh-bg)}
.xsdsh-pill::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.xsdsh-pill.is-ok{color:var(--xsdsh-ok);border-color:color-mix(in srgb,var(--xsdsh-ok) 30%,var(--xsdsh-line))}
.xsdsh-pill.is-wait{color:var(--xsdsh-warn);border-color:color-mix(in srgb,var(--xsdsh-warn) 30%,var(--xsdsh-line))}
.xsdsh-pill.is-miss{color:var(--xsdsh-mute)}
.xsdsh-pill.is-bad{color:var(--xsdsh-bad)}
.xsdsh-btn{appearance:none;font-family:var(--xsdsh-sans);font-size:13px;font-weight:500;min-height:34px;padding:0 14px;border-radius:8px;border:1px solid transparent;cursor:pointer;transition:background .15s var(--xsdsh-ease),border-color .15s var(--xsdsh-ease),color .15s var(--xsdsh-ease),opacity .15s var(--xsdsh-ease)}
.xsdsh-btn:disabled{opacity:.45;cursor:not-allowed}
.xsdsh-btn:focus-visible{outline:2px solid var(--xsdsh-accent);outline-offset:2px}
.xsdsh-btn-primary{background:var(--xsdsh-accent-soft);color:var(--xsdsh-accent);border-color:var(--xsdsh-accent)}
.xsdsh-btn-primary:hover:not(:disabled){background:var(--xsdsh-accent-bg)}
.xsdsh-btn-ghost{background:var(--xsdsh-panel);color:var(--xsdsh-ink);border-color:var(--xsdsh-line)}
.xsdsh-btn-ghost:hover:not(:disabled){background:var(--xsdsh-hover);border-color:var(--xsdsh-line-hover)}
.xsdsh-btn-danger{background:var(--xsdsh-panel);color:var(--xsdsh-bad);border-color:var(--xsdsh-danger-line)}
.xsdsh-btn-danger:hover:not(:disabled){background:var(--xsdsh-danger-bg)}
.xsdsh-btn-solid-danger{background:var(--xsdsh-bad-soft);color:var(--xsdsh-bad);border-color:var(--xsdsh-danger-line)}
.xsdsh-btn-solid-danger:hover:not(:disabled){background:var(--xsdsh-danger-bg)}
.xsdsh-btn-tiny{min-height:28px;padding:0 10px;font-size:12px;border-radius:6px}
.xsdsh-field,.xsdsh-area{width:100%;box-sizing:border-box;font:13px/1.55 var(--xsdsh-mono);padding:8px 10px;background:var(--xsdsh-bg);color:var(--xsdsh-ink);border:1px solid var(--xsdsh-line);border-radius:8px}
.xsdsh-field{width:auto;min-width:140px}
.xsdsh-cr-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 0 0;font-size:13px}
/* ContinueRetrySection 的外壳：类名用了很久但一直没写样式，落在网格里会贴边。
   这里给它和其它卡片一致的内边距与描边，不再靠外层凑。 */
.xsdsh-cr{border:1px solid var(--xsdsh-line);border-radius:8px;padding:12px;background:var(--xsdsh-bg);min-width:0}
.xsdsh-cr-row label{display:inline-flex;align-items:center;gap:6px;color:var(--xsdsh-ink)}
/* Hook 拦截的三态（dirty / applied_unrestarted 红锁，synced 绿）。
   只复用既有的 --xsdsh-bad / --xsdsh-ok —— 这两个变量在 .xsdsh-root 与
   .xsdsh-root[data-theme="dusk"] 里各定义过一次（深色下 --xsdsh-bad:#f0b4b4、
   --xsdsh-ok:#8fd0a8），所以浅色纸底与深色底都能一眼分辨，不引入新色板。 */
.xsdsh-cr-row label.xsdsh-hooks-deny.is-dirty,
.xsdsh-cr-row label.xsdsh-hooks-deny.is-applied_unrestarted{color:var(--xsdsh-bad)}
.xsdsh-cr-row label.xsdsh-hooks-deny.is-synced{color:var(--xsdsh-ok)}
.xsdsh-cr-row label.xsdsh-hooks-deny.is-synced input{accent-color:var(--xsdsh-ok)}
.xsdsh-cr-row label.xsdsh-hooks-deny input:disabled{cursor:not-allowed}
.xsdsh-hooks-deny-note{color:var(--xsdsh-bad);font:11.5px/1.55 var(--xsdsh-sans)}
.xsdsh-cr-num{width:64px;min-width:64px;height:28px;padding:0 8px}
.xsdsh-cr-text{width:120px;min-width:88px;height:28px;padding:0 8px}
.xsdsh-ver{width:100%;min-width:0;max-width:none;height:32px;padding:0 10px;font-size:12px}
.xsdsh-rel{margin:0 0 14px}
.xsdsh-now{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin:0 0 4px}
.xsdsh-now-label{font-family:var(--xsdsh-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--xsdsh-mute)}
.xsdsh-now-ver{font-family:var(--xsdsh-display);font-size:20px;font-weight:500;letter-spacing:.01em}
.xsdsh-now-mark{display:inline-flex;align-items:center;margin-left:6px;padding:1px 7px;border-radius:99px;font-family:var(--xsdsh-mono);font-size:11px;font-style:normal;font-weight:500;line-height:1.5;color:var(--xsdsh-ok);border:1px solid color-mix(in srgb,var(--xsdsh-ok) 38%,var(--xsdsh-line));background:color-mix(in srgb,var(--xsdsh-ok) 14%,var(--xsdsh-bg))}
.xsdsh-editions{display:flex;flex-direction:column;margin:10px 0 0;border-top:1px solid var(--xsdsh-line)}
/* 这一行原来是纯横向 flex，塞长段落时会被压成一条缝。
   现在允许换行，且 flex-basis 100% 的段落会独占一整行。 */
.xsdsh-source{display:flex;align-items:center;gap:8px;margin:8px 0 0;padding-top:6px;flex-wrap:wrap}
.xsdsh-source > .xsdsh-hint{flex:1 1 100%;margin-top:2px}
/* 说明文字：以前只有 JSX 用、CSS 里没定义，落在 flex 里会被压窄。 */
.xsdsh-hint{font:11.5px/1.55 var(--xsdsh-sans);color:var(--xsdsh-mute);min-width:0}
/* 警告类说明：以前是 17 处内联 color:var(--xsdsh-danger) —— 那个变量从来没定义过。 */
.xsdsh-hint.is-warn{color:var(--xsdsh-bad)}
.xsdsh-source-label{font-size:11px;color:var(--xsdsh-dim);white-space:nowrap;flex:0 0 auto}
.xsdsh-source-input{flex:1 1 auto;min-width:0;font-family:var(--xsdsh-mono);font-size:11px}
.xsdsh-edition{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--xsdsh-line)}
.xsdsh-edition-name{display:inline-flex;align-items:center;gap:0;font-family:var(--xsdsh-display);font-size:15px;font-weight:500;white-space:nowrap}
.xsdsh-edition.is-on .xsdsh-edition-name{color:var(--xsdsh-ink)}
.xsdsh-edition:not(.is-on) .xsdsh-edition-name{color:var(--xsdsh-mute)}
.xsdsh-edition .xsdsh-btn{min-width:118px}
.xsdsh-rel .xsdsh-notice{display:block;margin-top:8px;min-height:16px}
@media (max-width:560px){.xsdsh-edition{grid-template-columns:1fr auto;grid-template-areas:"name btn" "sel sel"}.xsdsh-edition-name{grid-area:name}.xsdsh-edition .xsdsh-ver{grid-area:sel}.xsdsh-edition .xsdsh-btn{grid-area:btn}}
/* 文本域高度跟着面板高度走：以前写死 220px，dock 拉到最小（240px 高）时
   一个框就把整屏吃掉，下面的按钮永远看不见。 */
.xsdsh-area{min-height:clamp(96px,22vh,240px);resize:vertical}
.xsdsh-field:focus,.xsdsh-area:focus{outline:none;border-color:var(--xsdsh-accent);box-shadow:0 0 0 3px var(--xsdsh-accent-soft)}
.xsdsh-field:disabled,.xsdsh-area:disabled{opacity:.5}
.xsdsh-ask{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px;padding:10px 12px;border:1px solid var(--xsdsh-line);border-radius:8px;background:var(--xsdsh-bg);font-size:13px}
.xsdsh-modal-bg{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:20px;background:color-mix(in srgb,var(--xsdsh-ink) 28%,transparent)}
.xsdsh-modal{width:min(420px,100%);background:var(--xsdsh-paper);color:var(--xsdsh-ink);border:1px solid var(--xsdsh-line);border-radius:12px;padding:20px 20px 16px;box-shadow:0 16px 40px color-mix(in srgb,var(--xsdsh-ink) 18%,transparent)}
.xsdsh-modal h4{margin:0 0 8px;font-family:var(--xsdsh-display);font-size:18px;font-weight:500}
.xsdsh-modal p{margin:0 0 16px;font-size:13.5px;line-height:1.55}
.xsdsh-modal-ops{display:flex;justify-content:flex-end;gap:8px}
.xsdsh-restart-mask{position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.62);font-family:"Yu Gothic UI","Hiragino Sans GB","Source Han Sans SC","Microsoft YaHei UI",system-ui,sans-serif}
.xsdsh-restart-card{width:min(420px,100%);box-sizing:border-box;padding:22px 22px 18px;border-radius:14px;background:var(--dsw-alias-bg-layer-1,#fffcf7);color:var(--dsw-alias-label-primary,#16140f);border:1px solid var(--dsw-alias-border-l1,#c9c3b6);box-shadow:0 18px 50px rgba(0,0,0,.35)}
.xsdsh-restart-card h4{margin:0 0 10px;font-family:inherit;font-size:20px;font-weight:650;line-height:1.35;color:inherit}
.xsdsh-restart-card p{margin:0 0 18px;font-size:16px;font-weight:500;line-height:1.65;color:inherit}
.xsdsh-restart-card .xsdsh-modal-ops{display:flex;justify-content:flex-end;gap:10px}
.xsdsh-restart-card .xsdsh-btn{min-height:38px;padding:0 16px;font-size:15px;font-weight:650;color:var(--dsw-alias-label-primary,#16140f);background:var(--dsw-alias-bg-layer-2,#fff);border:1px solid var(--dsw-alias-border-l1,#c9c3b6)}
.xsdsh-restart-card .xsdsh-btn-primary,.xsdsh-restart-card .xsdsh-btn-primary:hover:not(:disabled){color:#fff;background:#2f6b4f;border-color:#2f6b4f}
body[data-ds-dark-theme] .xsdsh-restart-card,.xsdsh-restart-mask[data-theme="dusk"] .xsdsh-restart-card{background:#1c1e24;color:#f4f1ea;border-color:#5a5e68}
body[data-ds-dark-theme] .xsdsh-restart-card .xsdsh-btn,.xsdsh-restart-mask[data-theme="dusk"] .xsdsh-restart-card .xsdsh-btn{color:#f4f1ea;background:#2a2d34;border-color:#5a5e68}
body[data-ds-dark-theme] .xsdsh-restart-card .xsdsh-btn-primary,body[data-ds-dark-theme] .xsdsh-restart-card .xsdsh-btn-primary:hover:not(:disabled),.xsdsh-restart-mask[data-theme="dusk"] .xsdsh-restart-card .xsdsh-btn-primary,.xsdsh-restart-mask[data-theme="dusk"] .xsdsh-restart-card .xsdsh-btn-primary:hover:not(:disabled){color:#fff;background:#3d8f68;border-color:#3d8f68}
.xsdsh-notice{font-size:12.5px;line-height:1.4}
.xsdsh-notice.is-ok{color:var(--xsdsh-ok)}
.xsdsh-notice.is-bad{color:var(--xsdsh-bad)}
.xsdsh-skel{height:12px;border-radius:6px;background:var(--xsdsh-fill);animation:xsdsh-pulse 1.2s ease-in-out infinite}
.xsdsh-active{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;margin-bottom:12px;border:1px solid var(--xsdsh-line);background:var(--xsdsh-bg);border-radius:8px}
.xsdsh-active b{font-family:var(--xsdsh-display);font-weight:500}
.xsdsh-empty{padding:28px 12px;font-size:13px;color:var(--xsdsh-mute);text-align:center}
/* 列表 + 编辑器：默认上下排（窄面板），宽卡片里由容器查询切成 34/66 两栏。
   以前这条写的是 flex-direction:column，名字叫 split 却永远分不开。 */
.xsdsh-split{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
.xsdsh-rulelist{display:flex;flex-direction:column;border:1px solid var(--xsdsh-line);border-radius:8px;background:var(--xsdsh-bg);overflow:hidden}
.xsdsh-rulebody{max-height:min(40vh,360px);overflow:auto;overscroll-behavior:contain;scroll-padding-block:8px}
.xsdsh-ruleitem{display:flex;align-items:center;gap:12px;width:100%;padding:10px 12px;border:0;border-bottom:1px solid var(--xsdsh-line);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;scroll-margin-block:48px}
.xsdsh-ruleitem:hover{background:var(--xsdsh-fill)}
.xsdsh-ruleitem.is-edit{background:var(--xsdsh-accent-soft)}
.xsdsh-rule-main{flex:1;min-width:0}
.xsdsh-rule-name{display:flex;align-items:center;gap:8px;font-family:var(--xsdsh-display);font-size:14px;line-height:1.35}
.xsdsh-rule-meta{display:block;margin-top:3px;font-family:var(--xsdsh-mono);font-size:11px;color:var(--xsdsh-mute)}
.xsdsh-rule-ops{display:flex;flex-direction:row;align-items:center;gap:6px;flex-shrink:0}
.xsdsh-create{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-top:1px solid var(--xsdsh-line);background:var(--xsdsh-paper)}
.xsdsh-create-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.xsdsh-create .xsdsh-field{flex:1;min-width:0;width:auto}
.xsdsh-editor{display:flex;flex-direction:column;gap:10px;min-width:0;border:1px solid var(--xsdsh-line);border-radius:8px;background:var(--xsdsh-bg);padding:12px;min-height:0}
.xsdsh-editor .xsdsh-area{flex:1;min-height:clamp(96px,22vh,220px)}
.xsdsh-editor-empty{flex:1;display:flex;align-items:flex-start;color:var(--xsdsh-mute);font-size:13px;min-height:0;padding:12px 0}
.xsdsh-block{padding:14px 0;border-top:1px solid var(--xsdsh-line)}
.xsdsh-block-head{display:flex;align-items:center;gap:10px;margin:0 0 8px}
.xsdsh-block-head h4{margin:0;font-family:var(--xsdsh-display);font-size:14px;font-weight:500;flex:1;color:var(--xsdsh-ink)}
.xsdsh-block-hint{margin:8px 0 0;font-size:12px;line-height:1.55;color:var(--xsdsh-mute)}
.xsdsh-policy-row{display:flex;align-items:center;gap:10px}
.xsdsh-policy-row>label{font-size:12px;color:var(--xsdsh-mute);flex:0 0 auto}
.xsdsh-cwd-path{margin:0 0 8px;font-family:var(--xsdsh-mono);font-size:11px;color:var(--xsdsh-mute);word-break:break-all;line-height:1.5}
.xsdsh-cwd-list{display:flex;flex-direction:column;border:1px solid var(--xsdsh-line);border-radius:8px;background:var(--xsdsh-bg);overflow:hidden}
.xsdsh-cwd-item{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-bottom:1px solid var(--xsdsh-line);cursor:pointer;margin:0}
.xsdsh-cwd-item:last-child{border-bottom:0}
.xsdsh-cwd-item:hover{background:var(--xsdsh-fill)}
.xsdsh-cwd-item.is-on{background:var(--xsdsh-accent-soft)}
.xsdsh-cwd-item input{margin:3px 0 0;flex:0 0 auto}
.xsdsh-cwd-main{flex:1;min-width:0}
.xsdsh-cwd-name{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-family:var(--xsdsh-display);font-size:13.5px;line-height:1.35;color:var(--xsdsh-ink)}
.xsdsh-cwd-badge{font-family:var(--xsdsh-mono);font-size:10px;letter-spacing:.04em;text-transform:uppercase;padding:1px 7px;border-radius:99px;border:1px solid var(--xsdsh-line);color:var(--xsdsh-mute);line-height:1.6}
.xsdsh-cwd-size{font-family:var(--xsdsh-mono);font-size:11px;color:var(--xsdsh-mute)}
.xsdsh-cwd-sub{margin-top:3px;font-family:var(--xsdsh-mono);font-size:11px;color:var(--xsdsh-mute);word-break:break-all}
.xsdsh-cwd-prev{margin-top:4px;font-size:11px;line-height:1.5;color:var(--xsdsh-mute);max-height:34px;overflow:hidden}
@keyframes xsdsh-pulse{0%,100%{opacity:.45}50%{opacity:1}}
@media (max-width:640px){.xsdsh-metrics{grid-template-columns:1fr}.xsdsh-ruleitem{flex-wrap:wrap}.xsdsh-rule-ops{width:100%;justify-content:flex-end}}
@media (prefers-reduced-motion:reduce){.xsdsh-btn,.xsdsh-bar>i{transition:none}.xsdsh-skel{animation:none}}

.xsdsh-dock{position:fixed;top:12px;right:12px;z-index:10050;display:flex;flex-direction:column;width:var(--xsdsh-dock-w,620px);height:var(--xsdsh-dock-h,72vh);min-width:380px;min-height:320px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);box-sizing:border-box;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,var(--xsdsh-paper,#1c1c1c)) 52%,transparent);backdrop-filter:blur(22px) saturate(1.35);-webkit-backdrop-filter:blur(22px) saturate(1.35);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1,var(--xsdsh-line,#555)) 65%,transparent);border-radius:12px;box-shadow:0 18px 48px color-mix(in srgb,#000 30%,transparent),0 0 0 1px color-mix(in srgb,#fff 6%,transparent);pointer-events:auto;color:var(--dsw-alias-label-primary,var(--xsdsh-ink,#f2f2f2));overflow:visible}
.xsdsh-dock[data-open="0"]{display:none}
.xsdsh-launch{position:fixed;right:16px;bottom:16px;z-index:10040;appearance:none;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 55%,transparent);border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#1c1c1c) 72%,transparent);color:var(--dsw-alias-label-primary,#f2f2f2);cursor:pointer;font-family:inherit;font-size:13px;line-height:1;box-shadow:0 8px 22px color-mix(in srgb,#000 28%,transparent);pointer-events:auto}
.xsdsh-launch:hover{border-color:var(--dsw-alias-brand-primary,#6dbf8c);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 18%,transparent)}
.xsdsh-launch[data-open="1"]{display:none}
.xsdsh-dock-head{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-border-l1,var(--xsdsh-line,#555)) 55%,transparent);background:transparent;cursor:grab;user-select:none;touch-action:none;color:var(--dsw-alias-label-primary,var(--xsdsh-ink,#f2f2f2));border-radius:12px 12px 0 0}
.xsdsh-dock-head:active{cursor:grabbing}
.xsdsh-dock-head b{font-size:14px;font-weight:600;color:inherit;text-shadow:0 1px 0 color-mix(in srgb,#000 18%,transparent)}
.xsdsh-dock-head button{cursor:pointer;color:inherit;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,rgba(127,127,127,.18)) 55%,transparent)}
/* 关闭按钮要和 resize 手柄抢层级：手柄 z-index:60，这里给到 70，
   并且强制 pointer-events，避免被任何绝对定位层盖住后「点了没反应」。
   （窗口最大化时面板贴右边缘，关闭按钮右半部分最容易和右侧手柄重叠。） */
.xsdsh-dock-close{position:relative;z-index:70;pointer-events:auto;flex:none}
.xsdsh-dock-tabs{display:flex;gap:4px;padding:0 12px;border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-border-l1,var(--xsdsh-line,#555)) 55%,transparent);background:transparent}
.xsdsh-dock-tab{appearance:none;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary,var(--xsdsh-mute,#b8b4ac));border-radius:0;padding:10px 14px 8px;margin-bottom:-1px;cursor:pointer;font-family:inherit;font-size:13px;line-height:1.2;text-shadow:0 1px 0 color-mix(in srgb,#000 12%,transparent)}
.xsdsh-dock-tab:hover{color:var(--dsw-alias-label-primary,var(--xsdsh-ink,#f2f2f2))}
.xsdsh-dock-tab.on{color:var(--dsw-alias-label-primary,var(--xsdsh-ink,#f2f2f2));font-weight:600;border-bottom-color:var(--dsw-alias-brand-primary,#6dbf8c);background:transparent}
.xsdsh-dock-body{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;background:transparent;border-radius:0 0 12px 12px}
.xsdsh-dock-body .xsdsh-root{max-width:none;height:100%;flex:1;min-height:0;overflow:auto;background:transparent!important;--xsdsh-bg:transparent;--xsdsh-paper:color-mix(in srgb,var(--xsdsh-ink) 7%,transparent);--xsdsh-fill:color-mix(in srgb,var(--xsdsh-ink) 6%,transparent);--xsdsh-line:color-mix(in srgb,var(--xsdsh-ink) 20%,transparent);--xsdsh-accent-soft:color-mix(in srgb,var(--xsdsh-accent) 22%,transparent)}
.xsdsh-dock-body .xsdsh-panel,.xsdsh-dock-body .clean-card,.xsdsh-dock-body .xsdsh-metric,.xsdsh-dock-body .xsdsh-group,.xsdsh-dock-body .xsdsh-editor,.xsdsh-dock-body .xsdsh-active,.xsdsh-dock-body .xsdsh-ask,.xsdsh-dock-body .xsdsh-create,.xsdsh-dock-body .xsdsh-rulelist,.xsdsh-dock-body .xsdsh-table,.xsdsh-dock-body .xsdsh-ruleitem,.xsdsh-dock-body .xsdsh-cwd-list,.xsdsh-dock-body .xsdsh-cwd-item{background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#f7f4ee) 74%,transparent)!important;border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#6d8f78) 32%,transparent)!important;color:var(--xsdsh-ink)!important;box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 32%,transparent);backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3)}
.xsdsh-dock-body .xsdsh-field,.xsdsh-dock-body .xsdsh-area{background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 88%,transparent)!important;color:var(--xsdsh-ink)!important;border-color:color-mix(in srgb,var(--dsw-alias-border-l1,#8a8478) 72%,transparent)!important}
.xsdsh-dock-body select.xsdsh-field,.xsdsh-dock-body .xsdsh-field.xsdsh-ver{background:var(--dsw-alias-bg-layer-1,#fff)!important;color:var(--xsdsh-ink)!important;color-scheme:inherit}
.xsdsh-dock[data-theme="white"] select.xsdsh-field option,.xsdsh-dock[data-theme="white"] .xsdsh-field.xsdsh-ver option{background:#fff;color:#16140f}
.xsdsh-dock[data-theme="dusk"] select.xsdsh-field option,.xsdsh-dock[data-theme="dusk"] .xsdsh-field.xsdsh-ver option{background:#1b1d22;color:#f4f1ea}
.xsdsh-dock-body .xsdsh-title,.xsdsh-dock-body .xsdsh-sub h4,.xsdsh-dock-body .xsdsh-group-h strong,.xsdsh-dock-body .xsdsh-metric b,.xsdsh-dock-body .xsdsh-rule-name{font-family:inherit;font-weight:650;letter-spacing:0;color:var(--xsdsh-ink)!important;text-shadow:none}
.xsdsh-dock-body .xsdsh-mute,.xsdsh-dock-body .xsdsh-kicker,.xsdsh-dock-body .xsdsh-metric span,.xsdsh-dock-body .xsdsh-group-h em,.xsdsh-dock-body .xsdsh-count,.xsdsh-dock-body .xsdsh-rule-meta,.xsdsh-dock-body .xsdsh-hint{color:var(--xsdsh-mute)!important;font-weight:500;text-shadow:none}
.xsdsh-dock-body .rt-dock{position:relative;inset:auto;width:100%!important;height:100%;max-width:none!important;flex:1;min-height:0;min-width:0;display:flex!important;flex-direction:column;box-shadow:none;border:0;transform:none!important;opacity:1!important;pointer-events:auto!important;background:transparent!important}
.xsdsh-dock-body .rt-grip{display:none!important}
.xsdsh-dock-body .rt-embedded>.rt-head,.xsdsh-dock-body .rt-tabs,.xsdsh-dock-body .rt-foot{flex:none}
.xsdsh-dock-body .rt-body{flex:1;min-height:0;overflow:hidden!important;background:transparent!important}
.xsdsh-dock-body .rt-main{min-height:0;flex:1;overflow:hidden}
.xsdsh-dock-body .rt-pane{min-height:0;overflow:auto!important}
.xsdsh-dock-body .rt-embedded>.rt-head{padding:8px 12px}
.xsdsh-dock-body .rt-embedded>.rt-head .rt-title{font-size:14px;letter-spacing:0}
.xsdsh-dock-body .rt-tabs{gap:2px;padding:6px 10px 0;flex-wrap:wrap}
.xsdsh-dock-body .rt-tab{border-radius:0;border-bottom:2px solid transparent;margin-bottom:-1px;padding:8px 9px 7px;background:transparent;font-size:14px}
.xsdsh-dock-body .rt-tab.on{border-bottom-color:var(--dsw-alias-brand-primary,#6d8f78);background:transparent;font-weight:650}
.xsdsh-dock-body .rt-row:hover,.xsdsh-dock-body .rt-item:hover,.xsdsh-dock-body .rt-item.on,.xsdsh-dock-body .rt-seg:hover,.xsdsh-dock-body .rt-seg.on,.xsdsh-dock-body .rt-vrow:hover,.xsdsh-dock-body .rt-score-row:hover{background:var(--rt-surf-2)!important}
body:not([data-ds-dark-theme]) .xsdsh-auth-modal{background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fffcf7) 92%,transparent);color:var(--dsw-alias-label-primary,#1a1916);border-color:color-mix(in srgb,var(--dsw-alias-border-l1,#c9c3b6) 80%,transparent);backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3)}
body:not([data-ds-dark-theme]) .xsdsh-auth-legal{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#f3f0e8) 90%,transparent);color:var(--dsw-alias-label-primary,#1a1916);border-color:color-mix(in srgb,var(--dsw-alias-border-l1,#c9c3b6) 80%,transparent)}
body:not([data-ds-dark-theme]) .xsdsh-auth-warn{background:color-mix(in srgb,#f5e6c8 88%,transparent);color:#6b4a10}
body:not([data-ds-dark-theme]) .xsdsh-auth-ops button{border-color:var(--dsw-alias-border-l1,#c9c3b6);color:var(--dsw-alias-label-primary,#1a1916);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 88%,transparent)}
body:not([data-ds-dark-theme]) .xsdsh-auth-ops button.primary{background:var(--dsw-alias-brand-primary,#3f6b52);border-color:var(--dsw-alias-brand-primary,#3f6b52);color:#fff}
.xsdsh-dock-resize,.xsdsh-dock-resize-l,.xsdsh-dock-resize-r,.xsdsh-dock-resize-b{position:absolute;z-index:60;pointer-events:auto;touch-action:none}
.xsdsh-dock-resize{right:0;bottom:0;width:22px;height:22px;cursor:nwse-resize;border:0;border-radius:0 0 12px 0;border-right:3px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 75%,transparent);border-bottom:3px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 75%,transparent);box-sizing:border-box;background:transparent;opacity:.95}
.xsdsh-dock-resize-l{left:-2px;top:0;bottom:0;width:10px;cursor:ew-resize;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 18%,transparent)}
.xsdsh-dock-resize-l:hover,.xsdsh-dock-resize-r:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 42%,transparent)}
.xsdsh-dock-resize-r{right:-2px;top:44px;bottom:22px;width:10px;cursor:ew-resize;background:transparent}
.xsdsh-dock-resize-b{left:10px;right:22px;bottom:-2px;height:10px;cursor:ns-resize;background:transparent}
.xsdsh-dock-resize-b:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 35%,transparent)}
/* ── 窗口拖拽热区挖洞 ──────────────────────────────────────────────
   宿主在 Windows 上铺了一条横贯整宽的窗口拖拽带：
     [data-windows-titlebar] .BynINW_frame:before{
       height:var(--dsh-windows-titlebar-height);
       -webkit-app-region:drag; position:absolute;inset:0 0 auto }
   Chromium 把 app-region:drag 的矩形整个当成标题栏，鼠标事件不进 DOM。
   面板 top:12px，标题行正好落在这条带子里 —— 于是拖面板变成拖窗口，
   onMouseDown 收不到，mousemove 也不派发，看着就是「拖不动」。
   这里给浮层自己声明 no-drag：子元素继承，drag 带在面板矩形内被挖空。
   注意 no-drag 只影响窗口拖拽，不拦截 DOM 事件，面板内的拖拽照旧。 */
.xsdsh-dock,.xsdsh-launch,.xsdsh-auth-mask,.xsdsh-modal-bg,.xsdsh-restart-mask,.xsdsh-env-gate,
.xsdsh-rewind-menu,.rt-dock,.rt-full,.rt-modal,.rt-shot-zoom,
.xsdsh-dock *,.xsdsh-auth-mask *,.xsdsh-modal-bg *,.xsdsh-restart-mask *,
.xsdsh-rewind-menu *,.rt-dock *,.rt-full *,.rt-modal *,.rt-shot-zoom *{
  -webkit-app-region:no-drag;app-region:no-drag
}
/* 面板头部本身就是拖拽手柄：显式再写一次，避免被宿主的 drag 带覆盖 */
.xsdsh-dock-head,.xsdsh-dock-head *{-webkit-app-region:no-drag;app-region:no-drag}
.xsdsh-auth-mask{position:fixed;inset:0;z-index:10100;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;padding:20px;pointer-events:auto}
.xsdsh-env-gate{z-index:10200}
.xsdsh-auth-modal{width:min(680px,100%);max-height:min(88vh,820px);display:flex;flex-direction:column;gap:10px;padding:16px;border:1px solid var(--dsw-alias-border-l1,#333);border-radius:12px;background:var(--dsw-alias-bg-layer-1,#1a1a1a);color:var(--dsw-alias-label-primary,#eee)}
.xsdsh-auth-modal h2{margin:0;font-size:16px;font-weight:600}
.xsdsh-auth-warn{padding:8px 10px;border-radius:8px;background:#3a2e18;color:#f0d48a;font-size:13px}
.xsdsh-auth-legal{overflow:auto;height:300px;margin:0;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1,#333);border-radius:8px;background:#121212;font-size:13px;line-height:1.55}
.xsdsh-auth-legal h3{margin:14px 0 4px;font-size:13px}
.xsdsh-auth-legal h3:first-child{margin-top:0}
.xsdsh-auth-legal p{margin:0 0 8px}
.xsdsh-auth-checks{display:flex;flex-direction:column;gap:8px;font-size:13px}
.xsdsh-auth-checks label{display:flex;gap:8px;align-items:flex-start}
.xsdsh-auth-checks label.locked{opacity:.45}
.xsdsh-auth-ops{display:flex;justify-content:flex-end;gap:8px}
.xsdsh-auth-ops button,.xsdsh-dock-head button{appearance:none;border:1px solid var(--dsw-alias-border-l1,#444);background:transparent;color:inherit;border-radius:8px;padding:6px 12px;cursor:pointer;font:inherit}
.xsdsh-auth-ops button.primary{background:#2a4033;border-color:#8fbf9a}
.xsdsh-auth-ops button:disabled{opacity:.45;cursor:default}
.xsdsh-icon-btn{appearance:none;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 10px;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 45%,transparent);border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,currentColor);cursor:pointer;font-family:inherit;font-size:13px;line-height:1;white-space:nowrap;flex:0 0 auto}
.xsdsh-icon-btn:hover{border-color:var(--dsw-alias-brand-primary,#6dbf8c);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 12%,transparent);color:var(--dsw-alias-label-primary,currentColor)}
.xsdsh-icon-btn.on{border-color:var(--dsw-alias-brand-primary,#6dbf8c);color:var(--dsw-alias-brand-primary,#6dbf8c);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 16%,transparent);box-shadow:0 0 0 1px color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 28%,transparent)}
.xsdsh-hbtn{appearance:none;display:inline-flex;flex:0 0 auto;align-items:center;gap:6px;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 55%,transparent);background:transparent;color:var(--dsw-alias-label-secondary,currentColor);cursor:pointer;font-family:inherit;font-size:12px;line-height:1;padding:5px 10px;border-radius:8px;white-space:nowrap}
.xsdsh-hbtn:hover{border-color:var(--dsw-alias-brand-primary,#6dbf8c);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 12%,transparent);color:var(--dsw-alias-label-primary,currentColor)}
.xsdsh-hbtn.on{border-color:var(--dsw-alias-brand-primary,#6dbf8c);color:var(--dsw-alias-brand-primary,#6dbf8c);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 18%,transparent);box-shadow:0 0 0 1px color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 32%,transparent)}
.xsdsh-live-dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--dsw-alias-brand-primary,#6dbf8c);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 28%,transparent)}
.xsdsh-hero-chip{display:inline-flex;align-items:center;margin-left:6px;flex:0 0 auto}
.xsdsh-hero-chip-btn{appearance:none;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 50%,transparent);border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 10%,transparent);color:var(--dsw-alias-label-primary,currentColor);cursor:pointer;font-family:inherit;font-size:12.5px;line-height:1;white-space:nowrap}
.xsdsh-hero-chip-btn:hover{border-color:var(--dsw-alias-brand-primary,#6dbf8c);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 18%,transparent)}
.xsdsh-hero-chip-btn.on{border-color:var(--dsw-alias-brand-primary,#6dbf8c);color:var(--dsw-alias-brand-primary,#6dbf8c);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 18%,transparent);box-shadow:0 0 0 1px color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 32%,transparent)}
.xsdsh-tab-chip{display:inline-flex;align-items:flex-end;flex:0 0 auto}
/* rc5 宿主把页签拆成外层 .tabs + 内层 .viewTabs（仍是 [data-conversation-tabs]），
   内层 gap 32px 且 flex-wrap:wrap：chip 追加后与宿主页签的间距从 rc2 的 36px
   掉到 32px，稍窄就换行。这里只命中带 viewTabs 类名的行，rc2 的
   [data-conversation-tabs] 没有这个类，完全不受影响。32+4=36。 */
[data-conversation-tabs][class*="viewTabs" i]{flex-wrap:nowrap}
[data-conversation-tabs][class*="viewTabs" i] > .xsdsh-tab-chip{margin-left:4px}
.xsdsh-tab-btn{appearance:none;position:relative;border:none;background:transparent;cursor:pointer;padding:0 0 9px;font-family:inherit;font-size:13px;font-weight:500;line-height:16px;color:var(--dsw-alias-label-tertiary,currentColor);white-space:nowrap}
.xsdsh-tab-btn:hover{color:var(--dsw-alias-label-primary,currentColor)}
.xsdsh-tab-btn.on{color:var(--dsw-alias-brand-primary,#6dbf8c)}
.xsdsh-tab-btn.on:after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;border-radius:2px;background:var(--dsw-alias-brand-primary,#6dbf8c)}
/* 玻璃跟随宿主颜色。字重和底的不透明度分开：壳透，字坐在更实的一层上。 */
.xsdsh-dock{font-family:"Segoe UI","Microsoft YaHei UI","PingFang SC","Noto Sans SC",system-ui,sans-serif;font-size:14px;line-height:1.6;font-weight:500;-webkit-font-smoothing:antialiased;text-shadow:none}
/* 玻璃面板只许纯色底：渐变半透会把背后的聊天内容映出不匀的亮带，比纯色难看得多。 */
.xsdsh-dock[data-theme="white"],.xsdsh-dock[data-theme="dusk"]{background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 55%,transparent)!important;backdrop-filter:blur(26px) saturate(1.45)!important;-webkit-backdrop-filter:blur(26px) saturate(1.45)!important;color:var(--xsdsh-ink)!important;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#6d8f78) 36%,transparent)!important;box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 42%,transparent),0 18px 44px color-mix(in srgb,#000 18%,transparent)!important}
.xsdsh-dock[data-theme="dusk"]{--xsdsh-ink:var(--dsw-alias-label-primary,#f4f1ea);--xsdsh-mute:color-mix(in srgb,var(--dsw-alias-label-primary,#f4f1ea) 84%,var(--dsw-alias-label-secondary,#c9c3b8))}
.xsdsh-dock[data-theme="white"]{--xsdsh-ink:var(--dsw-alias-label-primary,#16140f);--xsdsh-mute:color-mix(in srgb,var(--dsw-alias-label-primary,#16140f) 76%,var(--dsw-alias-label-secondary,#3c362e))}
.xsdsh-dock .xsdsh-dock-head,.xsdsh-dock .xsdsh-dock-tabs{background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,transparent) 28%,transparent)!important;color:var(--xsdsh-ink)!important}
.xsdsh-dock .xsdsh-dock-head,.xsdsh-dock .xsdsh-dock-head b,.xsdsh-dock .xsdsh-dock-head button,.xsdsh-dock .xsdsh-dock-tab,.xsdsh-dock .xsdsh-dock-tab.on{color:var(--xsdsh-ink)!important;text-shadow:none!important;font-weight:600}
.xsdsh-dock .xsdsh-dock-tab{font-size:14px}
.xsdsh-dock .xsdsh-dock-tab.on{border-bottom-color:var(--dsw-alias-brand-primary,#6d8f78)!important}
.xsdsh-dock-body .rt-dock{font-size:14px!important;line-height:1.6!important;font-weight:500!important;color:var(--xsdsh-ink)!important;--rt-ink:var(--xsdsh-ink);--rt-mute:var(--xsdsh-mute);--rt-surf:color-mix(in srgb,var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-layer-1,#fff)) 40%,transparent);--rt-surf-2:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 62%,transparent);--rt-line:color-mix(in srgb,var(--dsw-alias-brand-primary,#6d8f78) 30%,transparent)}
.xsdsh-dock-body .rt-title,.xsdsh-dock-body .rt-tab,.xsdsh-dock-body .rt-tab.on,.xsdsh-dock-body .rt-card,.xsdsh-dock-body .rt-card h4,.xsdsh-dock-body .rt-row,.xsdsh-dock-body .rt-vrow,.xsdsh-dock-body .rt-kv,.xsdsh-dock-body .rt-kv b,.xsdsh-dock-body .rt-kv span,.xsdsh-dock-body .rt-mono,.xsdsh-dock-body .rt-empty,.xsdsh-dock-body .rt-foot,.xsdsh-dock-body .rt-tag,.xsdsh-dock-body .rt-item,.xsdsh-dock-body .rt-item-name,.xsdsh-dock-body .rt-item-desc,.xsdsh-dock-body .rt-sec-sub,.xsdsh-dock-body .rt-kb-sub,.xsdsh-dock-body .rt-seg-cidr,.xsdsh-dock-body .rt-seg-meta,.xsdsh-dock-body .rt-section,.xsdsh-dock-body .rt-note,.xsdsh-dock-body .rt-hint{color:var(--xsdsh-ink)!important;text-shadow:none!important;opacity:1!important}
.xsdsh-dock-body .rt-tab,.xsdsh-dock-body .rt-foot,.xsdsh-dock-body .rt-empty,.xsdsh-dock-body .rt-item-desc,.xsdsh-dock-body .rt-kb-sub,.xsdsh-dock-body .rt-kv span,.xsdsh-dock-body .rt-tag,.xsdsh-dock-body .rt-sec-sub{color:var(--xsdsh-mute)!important}
.xsdsh-dock-body .rt-card,.xsdsh-dock-body .rt-pane,.xsdsh-dock-body .rt-side,.xsdsh-dock-body .rt-table,.xsdsh-dock-body .rt-toolbar,.xsdsh-dock-body .rt-embedded>.rt-head,.xsdsh-dock-body .rt-tabs{background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 72%,transparent)!important;border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#6d8f78) 28%,transparent)!important;color:var(--xsdsh-ink)!important;box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 26%,transparent)!important;backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3)}
.xsdsh-dock-body .rt-btn,.xsdsh-dock-body .rt-input,.xsdsh-dock-body .rt-eng-select,.xsdsh-dock-body textarea.rt-input{background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 90%,transparent)!important;color:var(--xsdsh-ink)!important;border-color:color-mix(in srgb,var(--dsw-alias-border-l1,#888) 70%,transparent)!important}
.xsdsh-dock-body .rt-btn-primary{background:var(--dsw-alias-brand-primary,#3f6b52)!important;border-color:var(--dsw-alias-brand-primary,#3f6b52)!important;color:#fff!important}
.xsdsh-dock[data-theme="white"] .xsdsh-dock-body .rt-eng-select option,.xsdsh-dock[data-theme="white"] .xsdsh-dock-body .rt-input option{background:#fff;color:#16140f}
.xsdsh-dock[data-theme="dusk"] .xsdsh-dock-body .rt-eng-select option,.xsdsh-dock[data-theme="dusk"] .xsdsh-dock-body .rt-input option{background:#1b1d22;color:#f4f1ea}
.xsdsh-dock-body .rt-err{font-weight:650}
.xsdsh-dock[data-theme="white"] .xsdsh-dock-body .rt-err{color:#9a3434!important}
.xsdsh-dock[data-theme="dusk"] .xsdsh-dock-body .rt-err{color:#f0b4b4!important}
.xsdsh-dock-body .rt-rep-http,.xsdsh-dock-body pre{background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 84%,transparent)!important;color:var(--xsdsh-ink)!important;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1,#888) 60%,transparent)!important}
/* ── 液态玻璃（Liquid Glass）主题 ─────────────────────────────────────────
   配方来源（均为开源实现，取思路不引依赖）：
   · nikdelvin/liquid-glass —— 用 SVG 渐变画位移贴图（R 通道=横移、G 通道=纵移，
     中心 #808080 不偏移），喂给 feDisplacementMap 做真实折射；RGB 三通道用不同
     scale 分别位移再用 screen 混合，得到边缘色散。
   · VII-Cae/hyalite--liquid-glass —— 元素当成有倒角的玻璃板：中心透、边缘把背后的
     画面往里吸，边缘再挑一道光（inset 高光）。
   · Apple iOS 26 Liquid Glass 观感三件套：镜面高光、边缘光、投影分层。

   全部只在 .xsdsh-root[data-glass="1"] 下生效；关掉玻璃时一像素不动。
   backdrop-filter 带 url(#xsdsh-lg-refract) 的那条只在支持的水平上生效，
   不支持的浏览器自然回落到纯 blur（渐进而非报错）。 */

/* 玻璃参数。alpha 是底色浓度，blur 是背后模糊，sat/bright 提饱和与提亮 */
.xsdsh-root[data-glass="1"]{
  --xsdsh-glass-alpha:.42;
  --xsdsh-glass-blur:10px;
  --xsdsh-glass-sat:1.8;
  --xsdsh-glass-bright:1.04;
  /* 折射强度：边缘把背景位移多少像素。太大像果冻，太小看不出 */
  --xsdsh-lg-scale:12;
  /* 镜面高光 / 边缘光 / 内阴影的强度，明暗两套主题分别覆盖 */
  --xsdsh-lg-specular:color-mix(in srgb,#fff 46%,transparent);
  --xsdsh-lg-rim:color-mix(in srgb,#fff 62%,transparent);
  --xsdsh-lg-inner:color-mix(in srgb,#fff 12%,transparent);
  --xsdsh-lg-drop:color-mix(in srgb,#0b0d10 22%,transparent);
  --xsdsh-paper:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#f6f4ef) calc(var(--xsdsh-glass-alpha)*100%),transparent);
  --xsdsh-line:color-mix(in srgb,#fff calc(var(--xsdsh-glass-alpha)*26%),transparent)
}
.xsdsh-root[data-glass="1"][data-theme="dusk"]{
  --xsdsh-glass-alpha:.34;
  --xsdsh-glass-bright:.96;
  --xsdsh-lg-specular:color-mix(in srgb,#fff 22%,transparent);
  --xsdsh-lg-rim:color-mix(in srgb,#fff 30%,transparent);
  --xsdsh-lg-inner:color-mix(in srgb,#fff 7%,transparent);
  --xsdsh-lg-drop:color-mix(in srgb,#000 42%,transparent);
  --xsdsh-paper:color-mix(in srgb,#0b0d10 calc(var(--xsdsh-glass-alpha)*100%),transparent);
  --xsdsh-line:color-mix(in srgb,#fff 14%,transparent)
}

/* 玻璃表面：折射 + 模糊 + 提饱和 + 微提亮，四层阴影叠出立体感 ——
   1) 顶部 1px 内高光（镜面反光）
   2) 四周 1px 内描边（玻璃倒角挑起来的光）
   3) 内侧一圈很淡的柔光（厚度感）
   4) 外侧投影（把玻璃从背景上托起来） */
.xsdsh-root[data-glass="1"] .xsdsh-card,
.xsdsh-root[data-glass="1"] .xsdsh-panel,
.xsdsh-root[data-glass="1"] .clean-card,
.xsdsh-root[data-glass="1"] .xsdsh-section,
.xsdsh-root[data-glass="1"] .xsdsh-dock,
.xsdsh-root[data-glass="1"] .xsdsh-dock-body,
.xsdsh-root[data-glass="1"] .xsdsh-dock-body .rt-card,
.xsdsh-root[data-glass="1"] .xsdsh-dock-body .rt-pane,
.xsdsh-root[data-glass="1"] .xsdsh-dock-body .rt-side,
.xsdsh-root[data-glass="1"] .xsdsh-dock-body .rt-toolbar{
  /* 先垫一条不依赖 SVG 滤镜的声明：万一 #xsdsh-lg-refract 还没挂上，
     浏览器会让下面那条整条失效，这里兜住，观感退化成普通毛玻璃而不是没有玻璃。 */
  -webkit-backdrop-filter:blur(var(--xsdsh-glass-blur)) saturate(var(--xsdsh-glass-sat)) brightness(var(--xsdsh-glass-bright));
  backdrop-filter:blur(var(--xsdsh-glass-blur)) saturate(var(--xsdsh-glass-sat)) brightness(var(--xsdsh-glass-bright));
  -webkit-backdrop-filter:url(#xsdsh-lg-refract) blur(var(--xsdsh-glass-blur)) saturate(var(--xsdsh-glass-sat)) brightness(var(--xsdsh-glass-bright));
  backdrop-filter:url(#xsdsh-lg-refract) blur(var(--xsdsh-glass-blur)) saturate(var(--xsdsh-glass-sat)) brightness(var(--xsdsh-glass-bright));
  box-shadow:
    inset 0 1px 0 var(--xsdsh-lg-specular),
    inset 0 0 0 1px var(--xsdsh-lg-inner),
    inset 0 -1px 1px color-mix(in srgb,#000 6%,transparent),
    0 1px 2px color-mix(in srgb,#000 8%,transparent),
    0 8px 24px -8px var(--xsdsh-lg-drop),
    0 24px 64px -24px var(--xsdsh-lg-drop);
  border-color:var(--xsdsh-line)
}
/* 不支持 backdrop-filter 的浏览器：别让玻璃变成一块死白 */
@supports not (backdrop-filter:blur(1px)){
  .xsdsh-root[data-glass="1"] .xsdsh-card,
  .xsdsh-root[data-glass="1"] .xsdsh-panel,
  .xsdsh-root[data-glass="1"] .clean-card,
  .xsdsh-root[data-glass="1"] .xsdsh-dock,
  .xsdsh-root[data-glass="1"] .xsdsh-dock-body{
    background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#f6f4ef) 82%,transparent)
  }
}
/* 输入框 / 按钮：比卡片低半档，避免整屏都是同一种毛玻璃 */
.xsdsh-root[data-glass="1"] input,
.xsdsh-root[data-glass="1"] select,
.xsdsh-root[data-glass="1"] textarea,
.xsdsh-root[data-glass="1"] .xsdsh-dock-body .rt-input,
.xsdsh-root[data-glass="1"] .xsdsh-dock-body .rt-eng-select,
.xsdsh-root[data-glass="1"] .xsdsh-dock-body textarea.rt-input{
  background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) calc(var(--xsdsh-glass-alpha)*66%),transparent)!important;
  border:1px solid var(--xsdsh-line)!important;
  -webkit-backdrop-filter:blur(10px) saturate(1.5);
  backdrop-filter:blur(10px) saturate(1.5);
  /* 输入框是「凹进去」的玻璃：光在上沿，暗在下沿 */
  box-shadow:
    inset 0 1px 0 var(--xsdsh-lg-inner),
    inset 0 -1px 0 color-mix(in srgb,#000 10%,transparent)
}
.xsdsh-root[data-glass="1"] .xsdsh-dock-body .rt-btn{
  background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) calc(var(--xsdsh-glass-alpha)*80%),transparent)!important;
  -webkit-backdrop-filter:blur(12px) saturate(1.5);
  backdrop-filter:blur(12px) saturate(1.5);
  border:1px solid var(--xsdsh-line)!important;
  /* 按钮是「凸出来」的玻璃：上沿挑光，底下一条暗边压住 */
  box-shadow:
    inset 0 1px 0 var(--xsdsh-lg-specular),
    inset 0 -1px 0 color-mix(in srgb,#000 8%,transparent),
    0 1px 2px color-mix(in srgb,#000 10%,transparent);
  transition:box-shadow .16s ease,transform .16s ease
}
.xsdsh-root[data-glass="1"] .xsdsh-dock-body .rt-btn:not(:disabled):hover{
  box-shadow:
    inset 0 1px 0 var(--xsdsh-lg-rim),
    inset 0 -1px 0 color-mix(in srgb,#000 8%,transparent),
    0 2px 6px color-mix(in srgb,#000 12%,transparent),
    0 6px 18px -6px var(--xsdsh-lg-drop)
}
.xsdsh-root[data-glass="1"] .xsdsh-dock-body .rt-btn:not(:disabled):active{
  transform:translateY(1px);
  box-shadow:
    inset 0 1px 2px color-mix(in srgb,#000 14%,transparent),
    inset 0 -1px 0 var(--xsdsh-lg-inner)
}
/* 键盘走到哪里要看得见，玻璃上尤其容易丢焦点 */
.xsdsh-root[data-glass="1"] .xsdsh-dock-body .rt-btn:focus-visible{
  outline:2px solid var(--dsw-alias-brand-primary,#3f6b52);
  outline-offset:2px
}
/* 主按钮保持实色，玻璃里需要一个锚点 */
.xsdsh-root[data-glass="1"] .xsdsh-dock-body .rt-btn-primary{
  background:var(--dsw-alias-brand-primary,#3f6b52)!important;
  box-shadow:0 2px 12px color-mix(in srgb,var(--dsw-alias-brand-primary,#3f6b52) 45%,transparent)!important
}

/* ── 清洗页：平铺卡片网格 ──────────────────────────────────────────────
   以前清洗页是三段 <section class="xsdsh-panel"> 竖着叠，dock 默认 620×520
   时一屏只看得见一块，剩下全靠滚。现在收进一个网格：
     · 宽态（面板内容宽 ≥ 572px）两列，C1 补丁 / C3 提示词 / C5 规矩本 /
       C6 技能 / C7 卸载 各占整行（span 2），C2 Hook 拦截 与 C4 自己的
       服务器 并排（两块都是「一行说明 + 一个小控件」，高度接近）。
     · 窄态（< 572px，含 dock 最小 380px）塌成单列，span 失效。
   断点用容器查询而不是媒体查询：dock 宽度由拖拽决定，跟视口无关。
   container-type 必须挂在**网格的父级**（.xsdsh-clean）——容器查询只能
   作用于容器的后代，写在 .clean-grid 自己身上管不到它自己的列定义。 */
.xsdsh-clean{container-type:inline-size;container-name:clean;display:flex;flex-direction:column;gap:16px;min-width:0}
.clean-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:0}
.clean-head-main{display:flex;flex-direction:column;gap:4px;min-width:0}
.clean-head-side{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.clean-head-desc{margin:0;font:12px/1.55 var(--xsdsh-sans);color:var(--xsdsh-mute);max-inline-size:68ch}
.clean-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start;min-width:0}
.clean-card{min-width:0;box-sizing:border-box;padding:12px;border:1px solid var(--xsdsh-line);border-radius:10px;background:var(--xsdsh-paper);color:var(--xsdsh-ink);display:flex;flex-direction:column;gap:8px;height:auto;container-type:inline-size}
.clean-card[data-span="2"]{grid-column:1 / -1}
.clean-card-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0}
.clean-card-title{margin:0;flex:1 1 auto;min-width:0;font-family:var(--xsdsh-display);font-size:15px;font-weight:500;line-height:1.35;color:var(--xsdsh-ink)}
.clean-card-pill{flex:0 0 auto;font-family:var(--xsdsh-mono);font-size:11px;line-height:1.6;color:var(--xsdsh-mute);border:1px solid var(--xsdsh-line);border-radius:99px;padding:1px 8px;white-space:nowrap}
.clean-card-desc{margin:0;font:12px/1.55 var(--xsdsh-sans);color:var(--xsdsh-mute);max-inline-size:68ch;overflow-wrap:anywhere}
.clean-card-body{display:flex;flex-direction:column;gap:8px;min-width:0}
.clean-card-body[hidden]{display:none}
.clean-card-toggle{appearance:none;flex:0 0 auto;width:24px;height:24px;padding:0;border:1px solid var(--xsdsh-line);border-radius:6px;background:transparent;color:var(--xsdsh-mute);cursor:pointer;font:12px/1 var(--xsdsh-mono)}
.clean-card-toggle:hover{background:var(--xsdsh-fill);color:var(--xsdsh-ink)}
.clean-card-toggle:focus-visible{outline:2px solid var(--xsdsh-accent);outline-offset:2px}
.clean-card .xsdsh-row{margin:0}
.clean-card .xsdsh-sub{margin:0}
.clean-card.is-danger{border-color:color-mix(in srgb,var(--xsdsh-bad) 42%,var(--xsdsh-line))}
.clean-card.is-danger .clean-card-title{color:var(--xsdsh-bad)}
/* 长路径 / 主机名不许把卡片顶出横向滚动条 */
.clean-card .xsdsh-cwd-path,.clean-card .xsdsh-cwd-sub,.clean-card .xsdsh-rule-meta,.clean-card .xsdsh-hint{overflow-wrap:anywhere;word-break:break-word}
/* 窄面板：网格塌成单列，卡片 span 失效 */
@container (max-width:571px){
  .clean-grid{grid-template-columns:minmax(0,1fr)}
  .clean-card[data-span="2"]{grid-column:auto}
}
/* 指标卡跟着**面板宽度**走，不跟视口走。
   原来只有一条 @media (max-width:640px) 让它塌单列 —— 而 dock 宽度是拖出来的：
   视口 1920 + dock 380 时那条媒体查询永不触发，三列各 102px 撑破容器
   （实测 .xsdsh-clean scrollWidth 369 > clientWidth 348）。
   这里显式指名 clean 容器：补丁卡自己也是容器（.clean-card 有 container-type），
   不指名的话这条查询会去解最近的那个容器，拿到卡片宽度，判断全错。 */
@container clean (max-width:571px){
  .xsdsh-metrics{grid-template-columns:minmax(0,1fr)}
}
@container clean (min-width:420px) and (max-width:571px){
  /* 中间档：两列，比三列松、比一列省高度 */
  .xsdsh-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}
}
/* 卡片自己也是容器：规矩本 / 技能的「列表 + 编辑器」在窄卡里改成上下排 */
@container (max-width:519px){
  .clean-card .xsdsh-split{grid-template-columns:minmax(0,1fr)}
}
@container (min-width:520px){
  .clean-card .xsdsh-split{grid-template-columns:minmax(180px,34%) minmax(0,1fr)}
}
/* 容器查询不支持的旧内核兜底：auto-fit 自己会塌成一列。
   指标卡同理 —— 三列改 auto-fit，容器一窄就自动少列，不靠媒体查询。 */
@supports not (container-type:inline-size){
  .clean-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))}
  .xsdsh-metrics{grid-template-columns:repeat(auto-fit,minmax(min(100%,88px),1fr))}
}
/* 对话窗口里的清洗开关条：样式主源在 CLEAN_SWITCH_CSS（组件自带，面板没开时也生效），
   这里再写一份用 --xsdsh-* 令牌的版本，落在 dock 里时跟面板同一套配色走。
   两套主题分别给值，不靠「看起来还行」。 */
.xsdsh-clean-switch{appearance:none;position:relative;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--xsdsh-mute,currentColor);font:12px/1 var(--xsdsh-sans,system-ui,sans-serif);cursor:pointer}
.xsdsh-clean-switch:focus-visible{outline:2px solid var(--xsdsh-accent,#6dbf8c);outline-offset:2px}
.xsdsh-clean-switch[aria-checked="true"]{color:var(--xsdsh-accent,#3f6b52);background:var(--xsdsh-accent-soft,transparent)}
.xsdsh-clean-switch[aria-busy="true"]{pointer-events:none;opacity:.7}
.xsdsh-clean-switch-dot{width:8px;height:8px;border-radius:50%;flex:none;box-sizing:border-box;border:1px solid currentColor;background:transparent}
.xsdsh-clean-switch[aria-checked="true"] .xsdsh-clean-switch-dot{background:currentColor}
.xsdsh-clean-switch-alert{font:11px/1.4 var(--xsdsh-sans,system-ui,sans-serif);color:var(--xsdsh-bad,#c0392b)}
.xsdsh-dock[data-theme="white"] .xsdsh-clean-switch{color:color-mix(in srgb,var(--xsdsh-ink,#16140f) 70%,transparent)}
.xsdsh-dock[data-theme="dusk"] .xsdsh-clean-switch{color:color-mix(in srgb,var(--xsdsh-ink,#f4f1ea) 74%,transparent)}
@media (prefers-reduced-motion:reduce){.clean-card,.clean-card-toggle,.xsdsh-clean-switch-dot{transition:none}}

`;

// 精简版（core）：外观页的壁纸、背景音乐、桌宠三类娱乐功能已整体移除。
// 这里只保留「玻璃折射」这一层 —— 清洗页的玻璃开关（87-integration 的
// clean.glass）依赖 GLASS_KEY / readGlassPref / saveGlassPref / ensureGlassFilter，
// 所以这一小块必须留着；其余外观层符号（壁纸列表、偏好读写、开机启动、外壳软化、
// 背景音乐、桌宠）随原实现一并删除。
const GLASS_KEY = "xsdsh.glass";
// 改名迁移：旧键 dshp.glass 里还留着用户设过的开关，第一次读到就搬进新键。
const LEGACY_GLASS_KEY = "dshp.glass";

function readStored(key, legacyKey) {
	try {
		const fresh = localStorage.getItem(key);
		if (fresh !== null) return fresh;
		const old = localStorage.getItem(legacyKey);
		if (old === null) return null;
		try { localStorage.setItem(key, old); } catch { /* 配额满就只读这一次 */ }
		return old;
	} catch {
		return null;
	}
}

function readGlassPref() {
	try {
		const raw = readStored(GLASS_KEY, LEGACY_GLASS_KEY);
		return raw === null ? true : raw === "1";
	} catch {
		return true;
	}
}

function saveGlassPref(on) {
	try { localStorage.setItem(GLASS_KEY, on ? "1" : "0"); } catch { /* ignore */ }
}

const LG_FILTER_ID = "xsdsh-lg-refract";
const LG_FILTER_HTML = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;pointer-events:none" aria-hidden="true" focusable="false">
  <defs>
    <filter id="${LG_FILTER_ID}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feImage x="0" y="0" width="120" height="120" preserveAspectRatio="none" result="map" href="data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="gx" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#f00"/><stop offset="22%" stop-color="#808080"/>
            <stop offset="78%" stop-color="#808080"/><stop offset="100%" stop-color="#f00"/>
          </linearGradient>
          <linearGradient id="gy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0f0"/><stop offset="22%" stop-color="#808080"/>
            <stop offset="78%" stop-color="#808080"/><stop offset="100%" stop-color="#0f0"/>
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill="#808080"/>
        <rect width="120" height="120" fill="url(#gx)" style="mix-blend-mode:screen"/>
        <rect width="120" height="120" fill="url(#gy)" style="mix-blend-mode:screen"/>
        <rect x="26" y="26" width="68" height="68" rx="24" ry="24" fill="#808080" style="filter:blur(9px)"/>
      </svg>`)}" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale="14" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
</svg>`;

const LG_HOST_ID = "xsdsh-lg-defs";

function ensureGlassFilter() {
	if (typeof document === "undefined") return false;
	try {
		if (document.getElementById(LG_HOST_ID)) return true;
		const holder = document.createElement("div");
		holder.id = LG_HOST_ID;
		holder.innerHTML = LG_FILTER_HTML;
		(document.body || document.documentElement).appendChild(holder);
		return true;
	} catch {
		return false;
	}
}
		// The pet engine still uses the shared host React button.
		const Btn = __xsdshClientModules.Btn;
		function reopenAfterRestart() {
			window.location.reload();
		}

		function waitForRestart(setNotice, setBusy, t) {
			const started = Date.now();
			// 必须先看到旧进程掉线，再等新进程就绪；否则同进程立刻 200 会被当成「重启成功」又弹重启。
			let sawDown = false;
			const ping = () => {
				fetch("/Xsdsh-purge-next/status", { cache: "no-store", credentials: "same-origin" })
					.then((r) => (r.ok ? r.json() : Promise.reject()))
					.then((d) => {
						if (!sawDown) {
							retry();
							return;
						}
						if (d && d.ok && d.ready !== false) reopenAfterRestart();
						else retry();
					})
					.catch(() => {
						sawDown = true;
						retry();
					});
			};
			const retry = () => {
				if (Date.now() - started > 90000) {
					setNotice({ kind: "error", text: t("restart.timeout") });
					setBusy(false);
					return;
				}
				setTimeout(ping, 500);
			};
			setTimeout(ping, 800);
		}

		let restartOnce = false;

		/* C8：调用方曾传 function () {}，于是 setBusy(true/false) 全空转 ——
		   按钮不禁用、不出「处理中…」，用户看不出点到了。这里再兜一层，
		   以后漏传也不会让整个重启流程变哑巴。
		   返回值：true=真的发起了 /restart，false=被 restartOnce 挡住（调用方负责提示）。 */
		function restartDsh(setNotice, setBusy, t, surface) {
			if (restartOnce) return false;
			const notice = typeof setNotice === "function" ? setNotice : () => {};
			const busy = typeof setBusy === "function" ? setBusy : () => {};
			const surf = surface || clientGuessSurface() || "desktop";
			const desktop = surf === "desktop" || clientGuessSurface() === "desktop";
			restartOnce = true;
			busy(true);
			notice({ kind: "ok", text: hostText(t, "restarting", surf) });
			/* B15：`settled` 保证「结论只落地一次」。
			   以前 stop() 可以被静默监控、apiJson 超时、断连兜底同时调用，
			   同一件事报三遍（先「超时」再「重启状态未知」），而且每次都 busy(false)。
			   `settled` 一旦置真，后续任何分支都不再写提示 / 动 busy。 */
			let settled = false;
			/* P0-2：两道闸，而不是一道 25 s 硬超时。
			   · 60 s 只给**软进度**（kind 仍为 ok）：快通道首次 prime、官方宿主
			     正常关停都可能超过 25 s，旧逻辑会把正常流程报成「超时，请刷新」；
			   · 180 s 才明确失败，仍走 stop() —— settled 保证只报一次。
			   服务端若在软进度之后给出真实错误，`stop()` 照常落地，软进度不挡路。 */
			const RESTART_SOFT_MS = 60000;
			const RESTART_HARD_MS = 180000;
			let softWatch = null;
			const clearWatch = () => {
				clearTimeout(watch);
				if (softWatch) { clearTimeout(softWatch); softWatch = null; }
			};
			const stop = (error) => {
				if (settled) return;
				settled = true;
				clearWatch();
				restartOnce = false;
				notice({ kind: "error", text: error ? t("restart.fail", { error }) : t("restart.notStarted") });
				busy(false);
			};
			let sawDrop = false;
			const watch = setTimeout(() => {
				if (sawDrop || settled) return;
				notice({ kind: "ok", text: t("restart.waiting") });
				softWatch = setTimeout(() => {
					if (sawDrop || settled) return;
					stop(t("restart.timeout"));
				}, RESTART_HARD_MS - RESTART_SOFT_MS);
			}, RESTART_SOFT_MS);
			/* B15：裸 fetch 换 apiJson —— 它自带超时与错误归一（非 JSON、HTTP 错误都会
			   变成带原因的 Error，而不是 `r.json()` 抛出的 SyntaxError）。 */
			apiJson("/Xsdsh-purge-next/restart", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })
				.then((d) => {
					/* P0-3：错误原文 + 未完成的补丁编号一起带出去。以前只取 d.error，
					   服务端没给时退化成 "restart failed"，面板上只剩一句「没成」，
					   用户和日志都查不到是哪几项没过。 */
					if (!d.ok) {
						const err = String((d && d.error) || "").trim();
						const ids = (Array.isArray(d && d.pending) ? d.pending : [])
							.map((v) => String(v == null ? "" : v).trim().replace(/^#+/, ""))
							.filter(Boolean);
						const detail = ids.length ? (err || "restart failed") + " [#" + ids.slice(0, 8).join(", #") + "]" : err;
						throw new Error(detail || "restart failed");
					}
					const next = (d && d.surface) || surf;
					const full = next === "desktop" || (d && d.fullApp) || desktop;
					if (full && d.already) {
						/* already = 后端那边已经在重启了，这条路径不会再等回连，
						   静默监控必须在这里收掉 —— 否则它照样到点触发，
						   把「重启中…」改写成「超时，请刷新」这种假故障。
						   与下面 restarting === false / 非 desktop 两条分支保持一致。
						   busy 保持 true：页面即将重载，此刻放开按钮只会让用户以为
						   可以再点一次（那会打到正在关停的宿主）。 */
						clearWatch();
						settled = true;
						notice({ kind: "ok", text: hostText(t, "restarting", next) });
						return;
					}
					if (full && d.restarting === false) {
						clearWatch();
						stop(d.error || "not started");
						return;
					}
					notice({ kind: "ok", text: hostText(t, "restarting", next) });
					if (full) return;
					clearWatch();
					restartOnce = false;
					waitForRestart(notice, busy, t);
				})
				.catch((e) => {
					const msg = String((e && e.message) || e || "");
					/* `apiJson` 会把网络错误归一成「连不上接口…」，不带上这条，
					   桌面端「宿主被杀 → 连接断」这个**正常路径**会被判成失败。 */
					const dropped = /failed to fetch|networkerror|load failed|连不上接口/i.test(msg) || e.name === "TypeError";
					if (dropped && desktop) {
						sawDrop = true;
						clearWatch();
						/* 桌面端 /restart 会杀掉宿主进程，连接必然断 —— 这是预期行为，
						   不该报错。但也不能永远停在「重启中…」：60 s 还没回来
						   （页面没重载、也没回连）就明确说「状态未知」，把按钮放开。 */
						setTimeout(() => {
							if (settled) return;
							settled = true;
							restartOnce = false;
							notice({ kind: "error", text: t("restart.state.unknown") });
							busy(false);
						}, 60000);
						return;
					}
					clearWatch();
					stop(msg || "restart failed");
				});
			return true;
		}

		// Owned by the persistent dock so page navigation cannot reset operations.
		function usePurgeOpState() {
			const [patchBusy, setPatchBusy] = useState(false);
			const [askRestart, setAskRestart] = useState(false);
			const snoozeUntilRef = useRef(0);
			const actionTicketRef = useRef(0);
			return {
				patchBusy: patchBusy,
				setPatchBusy: setPatchBusy,
				askRestart: askRestart,
				setAskRestart: setAskRestart,
				snoozeUntilRef: snoozeUntilRef,
				actionTicketRef: actionTicketRef,
			};
		}
		const REWIND_CSS = `
.xsdsh-rewind-wrap{position:relative;display:inline-flex}
.xsdsh-rewind{appearance:none;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,currentColor);font:12px/1 var(--ds-font-sans,system-ui,sans-serif);cursor:pointer}
.xsdsh-rewind:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));color:var(--dsw-alias-label-primary,currentColor)}
.xsdsh-rewind:disabled{opacity:.4;cursor:default}
.xsdsh-rewind svg{display:block}
.xsdsh-rewind-menu{position:fixed;z-index:2147483000;box-sizing:border-box;min-width:220px;padding:4px;border:0;border-radius:12px;background:var(--dsw-specific-menu,#fff);color:var(--dsw-alias-label-primary,#1a1a1a);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent,0 8px 24px rgba(0,0,0,.16));transform:translateY(-100%)}
body[data-ds-dark-theme] .xsdsh-rewind-menu{background:var(--dsw-specific-menu,#32312d);color:var(--dsw-alias-label-primary,#e6e2db);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1,#3f3d38);box-shadow:var(--dsw-elevation-prominent,0 10px 28px rgba(0,0,0,.45))}
.xsdsh-rewind-item{display:flex;flex-direction:column;gap:2px;width:100%;padding:8px 10px;border:0;border-radius:8px;background:transparent;color:inherit;text-align:left;cursor:pointer;font:12px/1.3 var(--ds-font-sans,system-ui,sans-serif)}
.xsdsh-rewind-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
.xsdsh-rewind-item b{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,inherit)}
.xsdsh-rewind-item span{color:var(--dsw-alias-label-tertiary,#9a958c);font-size:11px}
body[data-ds-dark-theme] .xsdsh-rewind-item span{color:var(--dsw-alias-label-tertiary,#a8a39a)}
.xsdsh-continue{appearance:none;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,currentColor);font:12px/1 var(--ds-font-sans,system-ui,sans-serif);cursor:pointer}
.xsdsh-continue:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));color:var(--dsw-alias-label-primary,currentColor)}
.xsdsh-continue:disabled{opacity:.4;cursor:default}
.xsdsh-continue.is-ready{color:var(--dsw-alias-label-primary,currentColor)}
.xsdsh-continue svg{display:block}
`;
		/* ── 对话窗口里的清洗开关条样式 ──────────────────────────────────────
		   单独一段、由开关组件自己渲染 <style>：它挂在 conversation.input.right，
		   面板没打开时 PURGE_CSS / REWIND_CSS 都不一定在文档里，自带一份最稳。
		   视觉对齐 .xsdsh-rewind（28px 高 / 圆角 8 / 同一档悬停底），
		   状态点用 CSS 画（不用 emoji 当图标）：空心=关，实心=开。 */
		const CLEAN_SWITCH_CSS = `
.xsdsh-clean-switch-wrap{position:relative;display:inline-flex;align-items:center;gap:2px}
.xsdsh-clean-switch{appearance:none;position:relative;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,currentColor);font:12px/1 var(--ds-font-sans,system-ui,sans-serif);cursor:pointer}
.xsdsh-clean-switch::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:100%;min-width:36px;height:36px}
.xsdsh-clean-switch:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));color:var(--dsw-alias-label-primary,currentColor)}
.xsdsh-clean-switch:active{opacity:.72}
.xsdsh-clean-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#6dbf8c);outline-offset:2px}
.xsdsh-clean-switch[aria-checked="true"]{color:var(--dsw-alias-brand-primary,#6dbf8c);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#6dbf8c) 12%,transparent)}
.xsdsh-clean-switch[aria-busy="true"]{pointer-events:none;opacity:.7}
.xsdsh-clean-switch[aria-disabled="true"]{opacity:.5;pointer-events:none}
.xsdsh-clean-switch-dot{width:8px;height:8px;border-radius:50%;flex:none;box-sizing:border-box;border:1px solid color-mix(in srgb,currentColor 55%,transparent);background:transparent;transition:background .15s ease}
.xsdsh-clean-switch[aria-checked="true"] .xsdsh-clean-switch-dot{background:currentColor;border-color:currentColor}
/* 收起 / 展开那颗小箭头：只做显隐，不换布局尺寸 */
.xsdsh-clean-switch-more{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:28px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary,currentColor);font:10px/1 var(--ds-font-sans,system-ui,sans-serif);cursor:pointer}
.xsdsh-clean-switch-more:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));color:var(--dsw-alias-label-primary,currentColor)}
.xsdsh-clean-switch-more:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#6dbf8c);outline-offset:2px}
.xsdsh-clean-switch-items{display:inline-flex;align-items:center;gap:2px;min-width:0}
.xsdsh-clean-switch-items[hidden]{display:none}
.xsdsh-clean-switch.is-item{padding:0 6px}
.xsdsh-clean-switch-alert{margin-left:4px;font:11px/1.4 var(--ds-font-sans,system-ui,sans-serif);color:var(--dsw-alias-label-error,#c0392b)}
.xsdsh-clean-switch-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
@media (prefers-reduced-motion:reduce){.xsdsh-clean-switch-dot{transition:none}}
`;
		const DRAFT_KEY = "xsdsh-rewind-draft:";
		const ARM_KEY = "xsdsh-rewind-arm:";
		const FILL_DELAYS = [0, 50, 180, 400, 800];
		const ARM_TTL_MS = 45 * 1000;
		let rewindSeenAt = 0;
		let rewindSessions = null;
		let rewindHost = null;
		let rewindWorkspace = null;
		let rewindConversation = null;
		let pendingComposer = { sessionId: "", text: "", at: 0 };
		let armedFill = { sessionId: "", text: "", at: 0 };

		function rewindText(t, key, fallback) {
			try {
				if (typeof t === "function") {
					const value = t(key);
					if (value && value !== key) return value;
				}
			} catch { /* ignore */ }
			return fallback;
		}

		function currentSessionId(sessions) {
			try {
				const selected = rewindWorkspace?.selection?.getSnapshot?.()?.sessionId;
				if (typeof selected === "string" && selected) return selected;
			} catch { /* ignore */ }
			try {
				const snap = sessions?.list?.getSnapshot?.();
				if (typeof snap?.current === "string" && snap.current) return snap.current;
			} catch { /* ignore */ }
			return "";
		}

		function sessionKnown(sessions, sessionId) {
			try {
				const snap = sessions?.list?.getSnapshot?.();
				if (!snap || !sessionId) return false;
				if (snap.byId && Object.prototype.hasOwnProperty.call(snap.byId, sessionId)) return true;
				if (Array.isArray(snap.ids) && snap.ids.includes(sessionId)) return true;
			} catch { /* ignore */ }
			return false;
		}

		function waitMs(ms) {
			return new Promise((resolve) => window.setTimeout(resolve, ms));
		}

		function isPluginDraft(text) {
			const value = String(text || "").trim();
			if (!value) return false;
			return /^\[MNEMON\]/i.test(value)
				|| /MNEMON RUNTIME MEMORY SNAPSHOT/i.test(value)
				|| /^MNEMON VIEW TOOLS/im.test(value);
		}

		function writeDraft(sessionId, text) {
			if (!sessionId) return;
			const value = isPluginDraft(text) ? "" : (text || "");
			pendingComposer = { sessionId, text: value, at: Date.now() };
			try { sessionStorage.setItem(DRAFT_KEY + sessionId, value); } catch { /* ignore */ }
		}

		function peekDraft(sessionId) {
			if (!sessionId) return "";
			if (pendingComposer.sessionId === sessionId && pendingComposer.text) return pendingComposer.text;
			try { return sessionStorage.getItem(DRAFT_KEY + sessionId) || ""; } catch { return ""; }
		}

		function clearStoredDraft(sessionId) {
			if (!sessionId) return;
			if (pendingComposer.sessionId === sessionId) pendingComposer = { sessionId: "", text: "", at: 0 };
			try { sessionStorage.removeItem(DRAFT_KEY + sessionId); } catch { /* ignore */ }
			try { sessionStorage.removeItem(ARM_KEY + sessionId); } catch { /* ignore */ }
		}

		function armComposerFill(sessionId, text) {
			if (!sessionId || !text || isPluginDraft(text)) return;
			const at = Date.now();
			armedFill = { sessionId, text, at };
			writeDraft(sessionId, text);
			try { sessionStorage.setItem(ARM_KEY + sessionId, String(at)); } catch { /* ignore */ }
		}

		function takeArmedFill(sessionId) {
			if (!sessionId) return "";
			let text = "";
			let at = 0;
			if (armedFill.sessionId === sessionId && armedFill.text) {
				text = armedFill.text;
				at = armedFill.at;
			} else {
				text = peekDraft(sessionId);
				try { at = Number(sessionStorage.getItem(ARM_KEY + sessionId) || 0); } catch { at = 0; }
			}
			if (!text || !at || Date.now() - at > ARM_TTL_MS) {
				if (text && (!at || Date.now() - at > ARM_TTL_MS)) clearStoredDraft(sessionId);
				return "";
			}
			clearStoredDraft(sessionId);
			armedFill = { sessionId: "", text: "", at: 0 };
			return text;
		}

		function conversationFace() {
			if (rewindConversation) return rewindConversation;
			const host = rewindHost;
			if (host?.conversation) return host.conversation;
			if (typeof host?.get === "function") {
				try { return host.get("conversation"); } catch { return undefined; }
			}
			return undefined;
		}

		function conversationInput(sessionId) {
			try {
				const input = conversationFace()?.input;
				if (!input || !sessionId) return null;
				if (typeof input.shell === "function") {
					try { return input.shell(sessionId); } catch { /* session not retained yet */ }
				}
				const sessions = rewindHost?.sessions || rewindSessions;
				const actx = typeof sessions?.scope === "function" ? sessions.scope(sessionId) : undefined;
				if (typeof input.for === "function" && actx) return input.for(actx);
				return null;
			} catch {
				return null;
			}
		}

		function liveDraft(sessionId, inputActions) {
			try {
				const fromActions = inputActions?.state?.getSnapshot?.()?.draft;
				if (typeof fromActions === "string") return fromActions;
			} catch { /* ignore */ }
			try {
				const draft = conversationInput(sessionId)?.state?.getSnapshot?.()?.draft;
				if (typeof draft === "string") return draft;
			} catch { /* ignore */ }
			return "";
		}

		function hostSetDraft(sessionId, text) {
			if (!sessionId) return false;
			try {
				const input = conversationInput(sessionId);
				if (input && typeof input.setDraft === "function") {
					input.setDraft(text || "");
					return true;
				}
			} catch { /* ignore */ }
			return false;
		}

		function fillComposer(inputActions, text) {
			if (inputActions && typeof inputActions.setDraft === "function") {
				try { inputActions.setDraft(text || ""); } catch { /* ignore */ }
			}
		}

		function scheduleComposerFill(sessionId, text, inputActions) {
			if (!sessionId || !text || isPluginDraft(text)) return () => {};
			let stopped = false;
			let filled = false;
			const timers = [];
			const tryFill = () => {
				if (stopped) return;
				const current = liveDraft(sessionId, inputActions);
				if (filled && current !== text) {
					stopped = true;
					return;
				}
				if (current && current !== text) {
					stopped = true;
					return;
				}
				fillComposer(inputActions, text);
				hostSetDraft(sessionId, text);
				filled = true;
			};
			for (const ms of FILL_DELAYS) timers.push(window.setTimeout(tryFill, ms));
			return () => {
				stopped = true;
				for (const t of timers) { try { window.clearTimeout(t); } catch { /* ignore */ } }
			};
		}

		function scheduleEchoClear(sessionId, inputActions) {
			if (!sessionId) return () => {};
			let last = "";
			let stopped = false;
			const timers = [];
			const tryClear = () => {
				if (stopped || !last) return;
				const current = String(liveDraft(sessionId, inputActions) || "").trim();
				if (!current) {
					stopped = true;
					return;
				}
				if (current !== last) return;
				fillComposer(inputActions, "");
				hostSetDraft(sessionId, "");
				clearStoredDraft(sessionId);
				stopped = true;
			};
			apiJson("/Xsdsh-purge-next/last-user?sessionId=" + encodeURIComponent(sessionId)).then((data) => {
				if (stopped) return;
				last = String(data?.text || "").trim();
				if (!last || isPluginDraft(last)) return;
				tryClear();
				for (const ms of [0, 50, 180, 400]) timers.push(window.setTimeout(tryClear, ms));
			}).catch(() => {});
			return () => {
				stopped = true;
				for (const t of timers) { try { window.clearTimeout(t); } catch { /* ignore */ } }
			};
		}

		async function dropInheritedQueue(sessions, sessionId) {
			if (!sessions || !sessionId) return;
			const drop = async () => {
				try {
					const actx = typeof sessions.scope === "function" ? sessions.scope(sessionId) : undefined;
					const face = typeof sessions.sessionOf === "function" ? sessions.sessionOf(actx) : undefined;
					const queue = face?.getSnapshot?.()?.queue || [];
					for (const item of queue) {
						const id = item?.id || item?.itemId;
						if (!id) continue;
						try { await face.updateQueue?.(id, { kind: "remove" }); } catch { /* ignore */ }
					}
				} catch { /* ignore */ }
			};
			await drop();
			window.setTimeout(() => { drop(); }, 80);
		}

		async function openRewoundSession(sessions, sessionId) {
			if (!sessionId) return;
			const workspace = rewindWorkspace;
			let lastError = null;
			for (let attempt = 0; attempt < 25; attempt += 1) {
				if (sessions && typeof sessions.refresh === "function" && !sessionKnown(sessions, sessionId)) {
					try { await sessions.refresh(); } catch (error) { lastError = error; }
				}
				const known = sessionKnown(sessions, sessionId);
				if (known || typeof sessions?.open === "function") {
					try {
						if (workspace && typeof workspace.openSession === "function") {
							workspace.openSession(sessionId);
						} else if (typeof sessions?.open === "function") {
							sessions.open(sessionId);
						} else {
							throw new Error("无法打开回退后的会话");
						}
						const selected = workspace?.selection?.getSnapshot?.()?.sessionId;
						if (!workspace || selected === sessionId) {
							await dropInheritedQueue(sessions, sessionId);
							window.setTimeout(() => { dropInheritedQueue(sessions, sessionId); }, 250);
							return;
						}
					} catch (error) {
						lastError = error;
					}
				}
				await waitMs(120);
			}
			throw new Error((lastError && lastError.message) || "回退后的会话没有打开");
		}

		class RewindSafe extends Component {
			constructor(p) { super(p); this.state = { failed: false }; }
			static getDerivedStateFromError() { return { failed: true }; }
			componentDidCatch(error) { try { console.error("[Xsdsh-purge-next] rewind slot:", error); } catch { /* ignore */ } }
			render() {
				if (this.state.failed) return h(RewindFallback, this.props);
				return h(RewindButton, this.props);
			}
		}

		class ContinueSafe extends Component {
			constructor(p) { super(p); this.state = { failed: false }; }
			static getDerivedStateFromError() { return { failed: true }; }
			componentDidCatch(error) { try { console.error("[Xsdsh-purge-next] continue slot:", error); } catch { /* ignore */ } }
			render() {
				if (this.state.failed) {
					return h("button", {
						type: "button",
						className: "xsdsh-continue",
						title: rewindText(translate, "continue.label", "继续"),
						onMouseDown: (e) => e.preventDefault(),
						onClick: async () => {
							const sessionId = currentSessionId(rewindSessions);
							if (!sessionId) return;
							try {
								const data = await apiJson("/Xsdsh-purge-next/continue", {
									method: "POST",
									headers: { "content-type": "application/json" },
									body: JSON.stringify({ sessionId, force: true }),
								});
								if (!data || !data.ok) throw new Error((data && data.error) || "continue");
							} catch (e) {
								window.alert(rewindText(translate, "continue.fail", "继续失败: {error}").replace("{error}", String((e && e.message) || e)));
							}
						},
					}, rewindText(translate, "continue.label", "继续"));
				}
				return h(ContinueButton, this.props);
			}
		}

		/* ── 对话窗口里的清洗开关条 ────────────────────────────────────────────
		   需求：在对话里就能开关清洗面板、开关 Hook 拦截这些项，不用先摸到右下角
		   的小圆钮再翻进面板。

		   三条硬规矩：
		   · 面板开关的状态一律从 useDock() 回读，组件自己不存「开没开」——
		     否则点 dock 的 × 之后这里会一直亮着，变成假状态。
		   · Hook 拦截这类**真正落盘的开关**，状态回读自后端（GET /hooks-deny），
		     点的时候先乐观写 aria-checked，POST 回来以响应里的值为准；
		     失败就回滚成点击前的值，并挂 role="alert" 说明。
		   · 整条可收起：收起后只剩「清洗」这一颗，展开才露出一排小开关。
		     收起状态存 localStorage，刷新后保持。 */
		const SWITCH_BAR_KEY = "xsdsh.clean.switchbar";

		function readSwitchBarOpen() {
			try { return window.localStorage.getItem(SWITCH_BAR_KEY) !== "0"; } catch { return true; }
		}

		function saveSwitchBarOpen(on) {
			try { window.localStorage.setItem(SWITCH_BAR_KEY, on ? "1" : "0"); } catch { /* 隐私模式等 */ }
		}

		function CleanSwitch(props) {
			const t = props.t || translate;
			const st = useDock();
			const [barOpen, setBarOpen] = useState(readSwitchBarOpen);
			const [pending, setPending] = useState(false);
			const [hooksOn, setHooksOn] = useState(null);
			const [hooksBusy, setHooksBusy] = useState(false);
			const [failed, setFailed] = useState("");
			const failTimer = useRef(0);
			const aliveRef = useRef(true);

			useEffect(() => {
				aliveRef.current = true;
				// Hook 拦截的真实状态：一律问后端，不在前端猜。
				apiJson("/Xsdsh-purge-next/hooks-deny")
					.then((d) => { if (aliveRef.current && d && d.ok) setHooksOn(d.hooksDenyBypass !== false); })
					.catch(() => {});
				return () => {
					aliveRef.current = false;
					if (failTimer.current) window.clearTimeout(failTimer.current);
				};
			}, []);

			const flash = (text) => {
				setFailed(text);
				if (failTimer.current) window.clearTimeout(failTimer.current);
				failTimer.current = window.setTimeout(() => {
					if (aliveRef.current) setFailed("");
				}, 2400);
			};

			const on = Boolean(st && st.open);

			const togglePanel = () => {
				if (pending) return;
				const want = !on;
				setPending(true);
				setFailed("");
				setDock({ open: want, authOpen: false, tab: want ? "clean" : (st && st.tab) || "clean", pending: "tab" });
				// 下一帧再核对：dock 的 data-open 是渲染出来的，同步读不到。
				const check = () => {
					if (!aliveRef.current) return;
					const node = typeof document !== "undefined" ? document.querySelector('.xsdsh-dock[data-open="1"]') : null;
					const ok = want ? (dockBus.open === true && !!node) : (dockBus.open !== true);
					setPending(false);
					if (!ok) {
						setDock({ open: !want, authOpen: false, tab: "clean", pending: "tab" });
						flash(rewindText(t, "clean.switch.fail", "面板没打开，再点一次"));
					}
				};
				if (typeof window !== "undefined" && window.requestAnimationFrame) {
					window.requestAnimationFrame(() => window.setTimeout(check, 0));
				} else {
					setTimeout(check, 0);
				}
			};

			/* Hook 拦截：乐观 → POST → 以后端回读为准；失败回滚成旧值。 */
			const toggleHooks = () => {
				if (hooksBusy || hooksOn === null) return;
				const prev = hooksOn;
				const want = !prev;
				setHooksOn(want);
				setHooksBusy(true);
				apiJson("/Xsdsh-purge-next/hooks-deny", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ hooksDenyBypass: want }),
				})
					.then((d) => {
						if (!aliveRef.current) return;
						if (!d || !d.ok) throw new Error((d && d.error) || "");
						setHooksOn(d.hooksDenyBypass === true);
					})
					.catch(() => {
						if (!aliveRef.current) return;
						setHooksOn(prev);
						flash(rewindText(t, "clean.switch.saveFail", "没存上，已退回原样"));
					})
					.finally(() => { if (aliveRef.current) setHooksBusy(false); });
			};

			const toggleBar = () => {
				const next = !barOpen;
				setBarOpen(next);
				saveSwitchBarOpen(next);
			};

			const label = rewindText(t, "clean.switch.label", "清洗");
			const hooksLabel = rewindText(t, "hooksDeny.title", "Hook 拦截");
			return h("span", { className: "xsdsh-clean-switch-wrap" },
				h("style", null, CLEAN_SWITCH_CSS),
				h("button", {
					type: "button",
					role: "switch",
					className: "xsdsh-clean-switch",
					"aria-checked": on ? "true" : "false",
					"aria-busy": pending ? "true" : undefined,
					"aria-label": label,
					"aria-describedby": "xsdsh-clean-switch-desc",
					title: on
						? rewindText(t, "dock.close", "收起面板")
						: rewindText(t, "dock.clean", "清洗"),
					onMouseDown: (e) => e.preventDefault(),
					onClick: (e) => { e.preventDefault(); togglePanel(); },
				},
					h("span", { className: "xsdsh-clean-switch-dot", "aria-hidden": "true" }),
					label,
				),
				h("button", {
					type: "button",
					className: "xsdsh-clean-switch-more",
					"aria-expanded": barOpen ? "true" : "false",
					"aria-controls": "xsdsh-clean-switch-items",
					"aria-label": barOpen
						? rewindText(t, "clean.switch.collapse", "收起开关条")
						: rewindText(t, "clean.switch.expand", "展开开关条"),
					title: barOpen
						? rewindText(t, "clean.switch.collapse", "收起开关条")
						: rewindText(t, "clean.switch.expand", "展开开关条"),
					onMouseDown: (e) => e.preventDefault(),
					onClick: (e) => { e.preventDefault(); toggleBar(); },
				}, barOpen ? "▾" : "▸"),
				// 一排小开关：默认收起，展开才出现，不占输入框的宽度。
				h("span", { className: "xsdsh-clean-switch-items", id: "xsdsh-clean-switch-items", hidden: barOpen ? undefined : true },
					h("button", {
						type: "button",
						role: "switch",
						className: "xsdsh-clean-switch is-item",
						"aria-checked": hooksOn === true ? "true" : "false",
						"aria-busy": hooksBusy ? "true" : undefined,
						"aria-label": hooksLabel,
						"aria-disabled": hooksOn === null ? "true" : undefined,
						title: hooksOn === true
							? hooksLabel + " · " + rewindText(t, "clean.pill.hooks.on", "放行")
							: hooksLabel + " · " + rewindText(t, "clean.pill.hooks.off", "按官方"),
						onMouseDown: (e) => e.preventDefault(),
						onClick: (e) => { e.preventDefault(); toggleHooks(); },
					},
						h("span", { className: "xsdsh-clean-switch-dot", "aria-hidden": "true" }),
						hooksLabel,
					),
				),
				h("span", { id: "xsdsh-clean-switch-desc", className: "xsdsh-clean-switch-sr" },
					rewindText(t, "clean.switch.desc", "在对话里打开或收起清洗面板；面板里有提示词、规矩本、技能和补丁。"),
				),
				// 面板开关的结果只由这一处播报（整页唯一一个 role=status），不抢读屏。
				h("span", { className: "xsdsh-clean-switch-sr", role: "status", "aria-live": "polite" },
					on ? rewindText(t, "clean.switch.on", "清洗面板已打开") : rewindText(t, "clean.switch.off", "清洗面板已收起"),
				),
				failed ? h("span", { className: "xsdsh-clean-switch-alert", role: "alert" }, failed) : null,
			);
		}

		class CleanSwitchSafe extends Component {
			constructor(p) { super(p); this.state = { failed: false }; }
			static getDerivedStateFromError() { return { failed: true }; }
			componentDidCatch(error) { try { console.error("[Xsdsh-purge-next] clean switch slot:", error); } catch { /* ignore */ } }
			render() {
				// 兜底也要能开面板：宿主升级把 hook 打坏时，至少留一个纯按钮。
				if (this.state.failed) {
					return h("button", {
						type: "button",
						role: "switch",
						className: "xsdsh-clean-switch",
						"aria-checked": dockBus.open ? "true" : "false",
						"aria-label": rewindText(this.props.t || translate, "clean.switch.label", "清洗"),
						onClick: () => toggleDock(),
					}, rewindText(this.props.t || translate, "clean.switch.label", "清洗"));
				}
				return h(CleanSwitch, this.props);
			}
		}

		function ContinueButton(props) {
			const t = props.t || translate;
			const sessions = rewindSessions;
			const sessionId = props.sessionId || currentSessionId(sessions);
			const [busy, setBusy] = useState(false);
			const [notice, setNotice] = useState("");
			const [info, setInfo] = useState(null);

			useEffect(() => {
				if (!sessionId) {
					setInfo(null);
					return;
				}
				let cancelled = false;
				const tick = () => {
					apiJson("/Xsdsh-purge-next/continue?sessionId=" + encodeURIComponent(sessionId))
						.then((data) => { if (!cancelled && data && data.ok) setInfo(data); })
						.catch(() => {});
				};
				tick();
				const timer = window.setInterval(tick, 1200);
				return () => {
					cancelled = true;
					window.clearInterval(timer);
				};
			}, [sessionId]);

			const canContinue = Boolean(info && info.canContinue);
			const left = info ? Math.max(0, (info.continueMax || 0) - (info.continueUsed || 0)) : 0;
			const runContinue = async () => {
				if (!sessionId || busy || !canContinue) return;
				setBusy(true);
				setNotice("");
				try {
					const data = await apiJson("/Xsdsh-purge-next/continue", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ sessionId }),
					});
					if (!data || !data.ok) throw new Error((data && data.error) || "continue");
					setInfo((prev) => prev ? { ...prev, ...data, canContinue: false, continueUsed: data.used } : data);
				} catch (e) {
					setNotice(rewindText(t, "continue.fail", "继续失败: {error}").replace("{error}", String((e && e.message) || e)));
				} finally {
					setBusy(false);
				}
			};

			const label = busy
				? rewindText(t, "continue.busy", "继续中…")
				: rewindText(t, "continue.label", "继续");
			const title = notice
				|| (canContinue
					? rewindText(t, "continue.ready", "继续（还可 {left} 次）").replace("{left}", String(left))
					: (info && info.reason && left <= 0
						? rewindText(t, "continue.limit", "已达继续上限")
						: rewindText(t, "continue.aria", "异常停止后继续")));
			return h("button", {
				type: "button",
				className: "xsdsh-continue" + (canContinue ? " is-ready" : ""),
				title,
				"aria-label": rewindText(t, "continue.aria", "异常停止后继续"),
				disabled: busy || !sessionId || !canContinue,
				onMouseDown: (e) => e.preventDefault(),
				onClick: (e) => {
					e.preventDefault();
					e.stopPropagation();
					runContinue();
				},
			},
				h("svg", { viewBox: "0 0 16 16", width: "14", height: "14", "aria-hidden": true },
					h("path", { fill: "currentColor", d: "M4.2 2.8v10.4L13 8 4.2 2.8z" }),
				),
				label,
			);
		}

		function rewindMenuNode(t, menuPos, menuRef, runRewind) {
			const menu = h("div", {
				className: "xsdsh-rewind-menu",
				role: "menu",
				ref: menuRef,
				style: menuPos ? { left: menuPos.left + "px", top: menuPos.top + "px" } : { left: "8px", bottom: "48px", transform: "none" },
			},
				h("button", {
					type: "button",
					className: "xsdsh-rewind-item",
					onMouseDown: (e) => { e.preventDefault(); e.stopPropagation(); },
					onClick: (e) => { e.preventDefault(); e.stopPropagation(); runRewind("once"); },
				},
					h("b", null, rewindText(t, "rewind.once", "回退一次")),
					h("span", null, rewindText(t, "rewind.once.hint", "把这一轮发出去的那句放回输入框，并清掉这一轮")),
				),
				h("button", {
					type: "button",
					className: "xsdsh-rewind-item",
					onMouseDown: (e) => { e.preventDefault(); e.stopPropagation(); },
					onClick: (e) => { e.preventDefault(); e.stopPropagation(); runRewind("round"); },
				},
					h("b", null, rewindText(t, "rewind.round", "回退上一轮")),
					h("span", null, rewindText(t, "rewind.round.hint", "把这一轮发出去的那句放回输入框；子代理也只撤这一轮")),
				),
			);
			try {
				const rd = require("react-dom");
				if (rd && typeof rd.createPortal === "function" && typeof document !== "undefined") {
					return rd.createPortal(menu, document.body);
				}
			} catch { /* 没有 portal 时菜单仍挂在按钮旁 */ }
			return menu;
		}

		class RewindFallback extends Component {
			constructor(p) {
				super(p);
				this.state = { menu: false, busy: false, notice: "", menuPos: null };
				this.wrap = null;
				this.menuEl = null;
				this.onDoc = (event) => {
					if (this.wrap && this.wrap.contains(event.target)) return;
					if (this.menuEl && this.menuEl.contains(event.target)) return;
					this.setState({ menu: false });
				};
			}
			componentDidMount() {
				document.addEventListener("mousedown", this.onDoc);
			}
			componentWillUnmount() {
				document.removeEventListener("mousedown", this.onDoc);
			}
			run(mode) {
				const sessionId = this.props.sessionId || currentSessionId(rewindSessions);
				if (!sessionId || this.state.busy) return;
				this.setState({ busy: true, menu: false, notice: "" });
				apiJson("/Xsdsh-purge-next/rewind", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ sessionId, mode }),
				}).then(async (data) => {
					if (!data || !data.ok || !data.sessionId || data.cleared === false) {
						throw new Error((data && data.error) || "没有清掉之前发送的内容");
					}
					if (data.at) rewindSeenAt = data.at;
					const text = isPluginDraft(data.text) ? "" : (data.text || "");
					armComposerFill(data.sessionId, text);
					await openRewoundSession(rewindSessions, data.sessionId);
					scheduleComposerFill(data.sessionId, text);
					this.setState({ busy: false });
				}).catch((e) => {
					this.setState({
						busy: false,
						notice: "回退失败: " + String((e && e.message) || e),
					});
				});
			}
			openMenu() {
				const rect = this.wrap && this.wrap.getBoundingClientRect ? this.wrap.getBoundingClientRect() : null;
				this.setState({
					menu: !this.state.menu,
					notice: "",
					menuPos: rect ? { left: Math.max(8, rect.right - 228), top: Math.max(8, rect.top - 8) } : null,
				});
			}
			render() {
				const sessionId = this.props.sessionId || currentSessionId(rewindSessions);
				const t = this.props.t || translate;
				const label = this.state.busy ? "回退中…" : (this.state.notice ? this.state.notice.slice(0, 18) : "回退");
				return h("div", { className: "xsdsh-rewind-wrap", ref: (node) => { this.wrap = node; } },
					h("style", null, REWIND_CSS),
					h("button", {
						type: "button",
						className: "xsdsh-rewind",
						disabled: this.state.busy || !sessionId,
						onMouseDown: (e) => e.preventDefault(),
						onClick: (e) => { e.preventDefault(); this.openMenu(); },
					}, label),
					this.state.menu ? rewindMenuNode(t, this.state.menuPos, (node) => { this.menuEl = node; }, (mode) => this.run(mode)) : null,
				);
			}
		}

		function RewindButton(props) {
			const t = props.t || translate;
			const sessions = rewindSessions;
			const inputActions = props.inputActions;
			const sessionId = props.sessionId || currentSessionId(sessions);
			const wrapRef = useRef(null);
			const menuRef = useRef(null);
			const [busy, setBusy] = useState(false);
			const [notice, setNotice] = useState("");
			const [menu, setMenu] = useState(false);
			const [menuPos, setMenuPos] = useState(null);

			useEffect(() => {
				if (!sessionId) return;
				const armed = takeArmedFill(sessionId);
				if (armed) {
					scheduleComposerFill(sessionId, armed, inputActions);
					return;
				}
				scheduleEchoClear(sessionId, inputActions);
			}, [sessionId, inputActions]);

			useEffect(() => {
				if (!menu) return;
				const onDoc = (event) => {
					if (wrapRef.current && wrapRef.current.contains(event.target)) return;
					if (menuRef.current && menuRef.current.contains(event.target)) return;
					setMenu(false);
				};
				document.addEventListener("mousedown", onDoc);
				return () => document.removeEventListener("mousedown", onDoc);
			}, [menu]);

			const runRewind = async (mode) => {
				if (!sessionId || busy) return;
				setBusy(true);
				setMenu(false);
				setNotice("");
				try {
					const data = await apiJson("/Xsdsh-purge-next/rewind", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ sessionId, mode }),
					});
					if (!data || !data.ok || !data.sessionId || data.cleared === false) {
						throw new Error((data && data.error) || "没有清掉之前发送的内容");
					}
					if (data.at) rewindSeenAt = data.at;
					const text = isPluginDraft(data.text) ? "" : (data.text || "");
					armComposerFill(data.sessionId, text);
					await openRewoundSession(sessions, data.sessionId);
					scheduleComposerFill(data.sessionId, text);
				} catch (e) {
					const message = rewindText(t, "rewind.fail", "回退失败: {error}").replace("{error}", String((e && e.message) || e));
					setNotice(message);
				} finally {
					setBusy(false);
				}
			};

			const onClick = (event) => {
				event?.preventDefault?.();
				event?.stopPropagation?.();
				if (!sessionId || busy) return;
				if (menu) {
					setMenu(false);
					return;
				}
				const rect = wrapRef.current?.getBoundingClientRect?.();
				if (rect) {
					setMenuPos({
						left: Math.max(8, rect.right - 228),
						top: Math.max(8, rect.top - 8),
					});
				}
				setNotice("");
				setMenu(true);
			};

			const failLabel = notice
				? (notice.length > 18 ? notice.slice(0, 18) + "…" : notice)
				: "";
			const label = busy
				? rewindText(t, "rewind.busy", "回退中…")
				: (failLabel || rewindText(t, "rewind.label", "回退"));
			const title = notice || rewindText(t, "rewind.aria", "回退");
			return h("div", { className: "xsdsh-rewind-wrap", ref: wrapRef },
				h("style", null, REWIND_CSS),
				h("button", {
					type: "button",
					className: "xsdsh-rewind",
					title,
					"aria-label": rewindText(t, "rewind.aria", "回退"),
					"aria-expanded": menu ? "true" : "false",
					disabled: busy || !sessionId,
					onMouseDown: (e) => e.preventDefault(),
					onClick,
				},
					h("svg", { viewBox: "0 0 16 16", width: "14", height: "14", "aria-hidden": true },
						h("path", {
							fill: "currentColor",
							d: "M7.2 3.2 3.4 7l3.8 3.8V8.6c2.8 0 4.7.7 5.9 2.3-.2-2.8-1.9-5.2-5.9-5.6V3.2z",
						}),
					),
					label,
				),
				menu ? rewindMenuNode(t, menuPos, menuRef, runRewind) : null,
			);
		}

		function installRewindWatch(ctx) {
			const sessions = ctx.sessions;
			if (!sessions) return () => {};
			const tick = async () => {
				try {
					const data = await apiJson("/Xsdsh-purge-next/rewind");
					if (!data || !data.sessionId || !data.at || data.at <= rewindSeenAt) return;
					rewindSeenAt = data.at;
					const current = currentSessionId(sessions);
					if (current && current !== data.parentId) return;
					const text = isPluginDraft(data.text) ? "" : (data.text || "");
					armComposerFill(data.sessionId, text);
					scheduleComposerFill(data.sessionId, text);
					await openRewoundSession(sessions, data.sessionId);
					scheduleComposerFill(data.sessionId, text);
				} catch { /* ignore */ }
			};
			const timer = window.setInterval(tick, 1200);
			return () => window.clearInterval(timer);
		}

		/* __DSH_PURGE_DRILL_BEGIN__ */
		const __xsdshPurgeDrill = __xsdshClientModules.Drill;
/* __DSH_PURGE_DRILL_END__ */

		const AUTH_KEY = "Xsdsh-purge-next-drill-auth";
		const WELCOME_KEY = "Xsdsh-purge-next-user-notice-v1";
		let drillGrantGen = 0;
		let drillGrantPosting = 0;
		let drillGrantState = { ready: false, granted: false };
		let drillSyncRetryTimer = null;
		let drillAuthDisposed = false;
		let drillAuthAttempted = false;
		let drillAuthFlow = 0;
		const AUTH_LEGAL_HTML = "<h3>严正法律免责与合规使用声明</h3>\r\n    <p>本声明在进入演练台前必须全文阅读。本项目是非营利开源项目，遵守国家法律法规及所在平台的规范，仅供学习与研究、技术参考。严禁任何主体把本项目用于商业售卖、付费倒卖或黑灰产牟利。</p>\r\n    <p>开发者坚决反对并严禁任何形式的违法犯罪，绝不支持、不鼓励、不协助未授权网络攻击、漏洞利用、数据窃取、非法侵入计算机信息系统，或生成违法违禁内容。任何将本项目用于违法犯罪的行为，均与开发者无关，由行为人依法独立承担全部法律责任。不得以科研、教学、测试、演示或内部学习为由规避下列条款。</p>\r\n    <h3>1. 本仓库不含违法内容</h3>\r\n    <p>Xsdsh-purge-next 发布的代码、文档、补丁与默认提示词不是木马、后门、未授权渗透工具、勒索软件、撞库脚本，也不是针对公网或第三方系统的攻击载荷。项目不提供违法内容，也不教唆、组织、协助实施违法犯罪。</p>\r\n    <h3>2. 本机操作不构成对外授权</h3>\r\n    <p>应用补丁、写入、回滚、卸载，都在本机文件和本机进程内完成。这些操作不对任何公网主机或未授权系统进行扫描、探测、入侵或攻击发包，也不得把本机当作跳板。</p>\r\n    <p>插件若开启检测更新，仅可能访问本插件自己的 GitHub 仓库以核对版本。该访问与对第三方系统的网络攻击无关，不能被解释为对外渗透的授权。</p>\r\n    <h3>3. 允许使用的范围</h3>\r\n    <p>只允许用在你能证明有权处理的环境：本人有权管理的本机官方 Harness；离线的本地合成靶标；所有者已经出具合法书面授权的网络安全演练靶场；合规实验室里的受控环境。书面授权要能对应具体目标、时间和范围。只填写一个单位名称，或只有口头说法，不构成授权。</p>\r\n    <p>未经所有者合法书面授权的目标、公网在线系统、生产业务，以及能源、交通、水利、金融、公共服务、电子政务等关键信息基础设施，都不得作为演练对象。</p>\r\n    <h3>4. 必须遵守的法律，按条、款</h3>\r\n    <p>《中华人民共和国刑法》第二百八十五条第一款：禁止违反国家规定，侵入国家事务、国防建设、尖端科学技术领域的计算机信息系统。</p>\r\n    <p>同条第二款：禁止侵入前款规定以外的计算机信息系统，或者用其他技术手段，获取该系统中存储、处理或者传输的数据，或者对该系统实施非法控制。</p>\r\n    <p>同条第三款：禁止提供专门用于侵入、非法控制计算机信息系统的程序、工具；明知他人实施侵入、非法控制而为其提供程序、工具，同样禁止。</p>\r\n    <p>第二百八十六条第一款：禁止对计算机信息系统功能进行删除、修改、增加、干扰，造成系统不能正常运行。</p>\r\n    <p>同条第二款：禁止对系统中存储、处理或者传输的数据和应用程序进行删除、修改、增加。</p>\r\n    <p>同条第三款：禁止故意制作、传播计算机病毒等破坏性程序，影响计算机系统正常运行。</p>\r\n    <p>第二百八十七条：禁止利用计算机实施金融诈骗、盗窃、贪污、挪用公款、窃取国家秘密或者其他犯罪。</p>\r\n    <p>第二百八十七条之一第一款第（一）项：禁止设立用于实施诈骗、传授犯罪方法、制作或者销售违禁物品、管制物品等违法犯罪活动的网站、通讯群组。</p>\r\n    <p>同款第（二）项：禁止发布有关制作或者销售毒品、枪支、淫秽物品等违禁物品、管制物品或者其他违法犯罪的信息。</p>\r\n    <p>同款第（三）项：禁止为实施诈骗等违法犯罪活动发布信息。</p>\r\n    <p>第二百八十七条之二：禁止明知他人利用信息网络实施犯罪，仍为其提供技术支持，或者提供广告推广、支付结算等帮助。</p>\r\n    <p>第二百五十三条之一第一款、第三款：禁止向他人出售或者提供公民个人信息；禁止窃取或者以其他方法非法获取公民个人信息。</p>\r\n    <p>《中华人民共和国网络安全法》第十三条第二款：使用网络不得危害网络安全，不得利用网络从事危害国家安全、荣誉和利益，煽动颠覆国家政权、推翻社会主义制度，煽动分裂国家、破坏国家统一，宣扬恐怖主义、极端主义，宣扬民族仇恨、民族歧视，传播暴力、淫秽色情信息，编造、传播虚假信息扰乱经济秩序和社会秩序，以及侵害他人名誉、隐私、知识产权和其他合法权益等活动。</p>\r\n    <p>第十四条：禁止利用网络从事危害未成年人身心健康的活动。</p>\r\n    <p>第二十九条：禁止非法侵入他人网络、干扰他人网络正常功能、窃取网络数据；禁止提供专门用于侵入网络、干扰网络正常功能及防护措施、窃取网络数据的程序、工具；明知他人从事危害网络安全的活动，禁止为其提供技术支持、广告推广、支付结算等帮助。</p>\r\n    <p>第三十三条：公共通信和信息服务、能源、交通、水利、金融、公共服务、电子政务等关键信息基础设施实行重点保护。未获合法授权，不得侵入、干扰或破坏。</p>\r\n    <p>第四十六条：禁止窃取或者以其他非法方式获取个人信息，禁止非法出售或者非法向他人提供个人信息。</p>\r\n    <p>第四十八条：禁止设立用于实施诈骗，传授犯罪方法，制作或者销售违禁物品、管制物品等违法犯罪活动的网站、通讯群组；禁止利用网络发布涉及上述违法犯罪活动的信息。</p>\r\n    <p>第五十条：发送的电子信息、提供的应用软件不得设置恶意程序，不得含有法律、行政法规禁止发布或者传输的信息。</p>\r\n    <p>《中华人民共和国数据安全法》第八条：开展数据处理活动，不得危害国家安全、公共利益，不得损害个人、组织的合法权益。</p>\r\n    <p>第三十二条第一款：收集数据应当采取合法、正当的方式，不得窃取或者以其他非法方式获取数据。</p>\r\n    <p>同条第二款：法律、行政法规对收集、使用数据的目的和范围有规定的，只能在该目的和范围内收集、使用。</p>\r\n    <p>第五十一条：窃取或者以其他非法方式获取数据，或者因此损害个人、组织合法权益的，依照有关法律、行政法规处罚。</p>\r\n    <p>《中华人民共和国个人信息保护法》第五条：处理个人信息应当合法、正当、必要、诚信，不得通过误导、欺诈、胁迫等方式处理。</p>\r\n    <p>第六条第一款、第二款：处理个人信息应当具有明确、合理的目的，并与该目的直接相关，采取对个人权益影响最小的方式；收集限于实现处理目的的最小范围，不得过度收集。</p>\r\n    <p>第十条：禁止非法收集、使用、加工、传输他人个人信息，禁止非法买卖、提供或者公开他人个人信息；禁止从事危害国家安全、公共利益的个人信息处理活动。</p>\r\n    <p>第十三条：没有取得个人同意，也不属于订立履行合同所必需、履行法定职责、应对突发、公共利益新闻舆论、处理本人已经合法公开的信息，以及法律行政法规规定的其他情形之一的，不得处理个人信息。</p>\r\n    <p>第二十八条、第二十九条：生物识别、医疗健康、金融账户、行踪轨迹，以及不满十四周岁未成年人的个人信息，属于敏感个人信息。没有特定目的、充分必要性和严格保护措施，并且没有取得个人单独同意的，不得处理。</p>\r\n    <p>此外还须遵守其他现行有效的法律、行政法规、监管规定，以及所使用模型的服务条款与滥用政策。</p>\r\n    <h3>5. 据此禁止的方向</h3>\r\n    <p>未授权进入。禁止把没有书面授权的单位、域名、地址、公网系统、生产业务或关键信息基础设施登记为靶标，禁止对其扫描、探测、侵入、控制或发包。对应刑法第二百八十五条第一款、第二款，网络安全法第二十九条、第三十三条。</p>\r\n    <p>破坏与恶意程序。禁止删除、修改、增加、干扰他人系统功能或其中的数据、应用程序；禁止制作、传播病毒、勒索程序或其他破坏性程序；禁止在信息或软件中设置恶意程序。对应刑法第二百八十六条第一款至第三款，网络安全法第五十条。</p>\r\n    <p>工具与帮助。禁止把本项目或本机提供给他人，用于侵入、非法控制或窃取数据；禁止明知对方在实施网络犯罪，仍提供程序、工具、技术支持、广告推广或支付结算。对应刑法第二百八十五条第三款、第二百八十七条之二，网络安全法第二十九条。</p>\r\n    <p>数据。禁止窃取、非法收集、超范围使用、泄露、出售或向他人提供业务数据、账号、口令和其他受保护数据。对应数据安全法第八条、第三十二条、第五十一条。</p>\r\n    <p>个人信息。禁止非法收集、使用、加工、传输、买卖、提供或公开他人个人信息；禁止过度收集；禁止以误导、欺诈、胁迫方式处理；禁止擅自处理生物识别、医疗健康、金融账户、行踪轨迹和儿童个人信息。对应刑法第二百五十三条之一第一款、第三款，网络安全法第四十六条，个人信息保护法第五条、第六条、第十条、第十三条、第二十八条、第二十九条。</p>\r\n    <p>诈骗与违法信息。禁止设立或利用网站、群组实施诈骗、传授犯罪方法、制作或销售违禁物品、管制物品；禁止发布此类信息；禁止利用计算机实施诈骗、盗窃、贪污、挪用公款、窃取国家秘密。对应刑法第二百八十七条、第二百八十七条之一第一款第（一）项至第（三）项，网络安全法第四十八条。</p>\r\n    <p>内容。禁止生成或传播危害国家安全、荣誉和利益的内容，禁止煽动颠覆、分裂，禁止恐怖主义、极端主义、民族仇恨，禁止暴力、淫秽色情、赌博，禁止编造虚假信息扰乱经济秩序和社会秩序，禁止侵害名誉、隐私、知识产权，禁止危害未成年人身心健康的内容。对应网络安全法第十三条第二款、第十四条。</p>\r\n    <p>结果扩散。演练中形成的记录、资产信息和文件，只留在书面授权写明的目标和期限里，不得交给无权获知的人，也不得改作授权以外的用途。</p>\r\n    <h3>6. 责任由使用者承担</h3>\r\n    <p>本项目依据 MIT 协议按现状提供。开发者不就完整性、安全性与适用性作保证。使用者对自己的下载、部署、运行、修改、传播，以及全部输入与输出，承担独立、完全的民事、行政及刑事法律责任。作者与贡献者不承担因滥用产生的直接、间接或连带责任。</p>\r\n    <p>勾选确认的是操作者本人，不能代替没有阅读本声明的人，也不能把别人的系统说成已经授权。</p>\r\n    <h3>7. 违约即终止授权</h3>\r\n    <p>一旦用于非法攻击、恶意活动或上述任一禁止方向，使用许可自该行为发生之日起自动终止，且不可撤销。必须立即停止使用，并销毁本项目的代码、脚本与衍生数据，依法承担责任。授权终止后，演练台不得继续打开或继续使用。</p>\r\n    <h3>8. 与 DeepSeek 官方的关系</h3>\r\n    <p>本项目是独立的开源项目，与 DeepSeek 官方或其关联主体没有隶属、商业合作、授权或官方背书。文中的「官方」只表示评测对象是使用者本机安装的官方 DeepSeek Harness 软件包，不代表 DeepSeek 官方开发、认可或担保本插件。</p>\r\n    <p>文末。倒计时结束、滚到这里并勾选全部三项，才表示你以本人身份认可本声明，并完成本次演练台授权。</p>";

		function readWelcomeAck() {
			try { return window.localStorage.getItem(WELCOME_KEY) === "1"; } catch { return false; }
		}
		function writeWelcomeAck() {
			try { window.localStorage.setItem(WELCOME_KEY, "1"); } catch { /* ignore */ }
		}

		function readDrillAuth() {
			/* 旧 localStorage 键仍作缓存，但只有当前服务端响应能放行。 */
			return drillGrantState.ready && drillGrantState.granted;
		}
		function setDrillAuthLocal(ok) {
			try {
				if (ok) window.localStorage.setItem(AUTH_KEY, "1");
				else window.localStorage.removeItem(AUTH_KEY);
			} catch { /* ignore */ }
			drillGrantState = { ready: true, granted: !!ok };
			setDock({ grantReady: true, authorized: !!ok });
		}
		function clearDrillSyncRetry() {
			if (drillSyncRetryTimer !== null) window.clearTimeout(drillSyncRetryTimer);
			drillSyncRetryTimer = null;
		}
		function writeDrillAuth(ok) {
			if (drillAuthDisposed || drillGrantPosting > 0) return Promise.resolve(false);
			const gen = ++drillGrantGen;
			clearDrillSyncRetry();
			if (!ok) { setDrillAuthLocal(false); return Promise.resolve(false); }
			drillGrantPosting += 1;
			setDock({ authBusy: true, authError: "" });
			return fetch("/Xsdsh-purge-next/drill-grant", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: "{}",
			}).then((r) => {
				if (r.ok === false) throw new Error("授权保存失败，请重试。");
				return r.json();
			}).then((saved) => {
				if (drillAuthDisposed || gen !== drillGrantGen) return false;
				if (!saved || saved.ok === false || saved.granted !== true) throw new Error("服务端未确认授权，请重试。");
				setDrillAuthLocal(true);
				return true;
			}).catch((error) => {
				if (!drillAuthDisposed && gen === drillGrantGen) {
					setDrillAuthLocal(false);
					setDock({ authError: String(error && error.message || "授权保存失败，请重试。") });
				}
				return false;
			}).finally(() => {
				drillGrantPosting = Math.max(0, drillGrantPosting - 1);
				if (!drillAuthDisposed) setDock({ authBusy: drillGrantPosting > 0 });
			});
		}
		function syncDrillGrant(attempt) {
			if (drillAuthDisposed || drillGrantPosting > 0) return Promise.resolve();
			const n = attempt || 0;
			const gen = ++drillGrantGen;
			clearDrillSyncRetry();
			return fetch("/Xsdsh-purge-next/drill-grant", { method: "GET" })
				.then((r) => {
					if (r.ok === false) throw new Error("grant");
					return r.json();
				})
				.then((r) => {
					if (drillAuthDisposed || gen !== drillGrantGen) return;
					if (!r || r.ok === false || typeof r.granted !== "boolean") throw new Error("grant");
					setDrillAuthLocal(r.granted);
					/* 同步仅更新授权状态，不打开弹窗或改变用户所在入口。 */
					if (r.granted && dockBus.authOpen) setDock({ authOpen: false, pending: "tab", authError: "" });
				})
				.catch(() => {
					if (drillAuthDisposed || gen !== drillGrantGen) return;
					drillGrantState = { ready: false, granted: false };
					setDock({ grantReady: false, authorized: false });
					if (n < 5) {
						drillSyncRetryTimer = window.setTimeout(() => {
							drillSyncRetryTimer = null;
							syncDrillGrant(n + 1);
						}, 400);
					}
				});
		}
		function cleanupDrillAuth() {
			drillAuthDisposed = true;
			drillGrantGen += 1;
			drillAuthFlow += 1;
			clearDrillSyncRetry();
			for (const session of Array.from(drillOverlaySessions)) session.dispose();
		}

		/* 一个确认流程共享归还目标；微任务等 React 完成 welcome → auth 的交接。 */
		const drillOverlaySessions = new Set();
		let drillOverlayReturnFocus = null;
		function rememberDrillOverlayFocus() {
			if (!drillOverlayReturnFocus && typeof document !== "undefined") {
				const active = document.activeElement;
				if (active && active !== document.body && !active.closest("[data-xsdsh-overlay]")) drillOverlayReturnFocus = active;
			}
		}
		function validDrillFocus(node) {
			return !!(node && node.isConnected && typeof node.focus === "function" && !node.disabled
				&& !node.closest("[hidden], [inert], [aria-hidden=\"true\"]") && node.getClientRects().length);
		}
		/* 弹窗取消后，原触发元素（红队演练入口按钮）可能已被 React 卸载重建。
		   此时 drillOverlayReturnFocus 指向已断开的旧节点，validDrillFocus 会拒绝它，
		   焦点最终落到 body，浏览器测试会抓到「没有可见焦点目标」。
		   这里加一层兜底：先尝试原节点，失败后找当前文档里「进入红队演练」按钮。 */
		function findCurrentDrillTrigger() {
			try {
				return document.querySelector(".purge-app__entry")
					|| document.querySelector("button[aria-label*='红队演练']")
					|| document.querySelector("button[aria-label*='演练']")
					|| null;
			} catch { return null; }
		}
		function restoreDrillFocus() {
			if (validDrillFocus(drillOverlayReturnFocus)) {
				const node = drillOverlayReturnFocus;
				drillOverlayReturnFocus = null;
				node.focus({ preventScroll: true });
				return;
			}
			drillOverlayReturnFocus = null;
			const fallback = findCurrentDrillTrigger();
			if (validDrillFocus(fallback)) fallback.focus({ preventScroll: true });
		}
		function useDrillOverlayFocus(open, onCancel, step) {
			const rootRef = useRef(null);
			const cancelRef = useRef(onCancel);
			cancelRef.current = onCancel;
			useEffect(() => {
				const root = rootRef.current;
				if (!open || !root || drillAuthDisposed) return;
				rememberDrillOverlayFocus();
				const focusables = () => Array.from(root.querySelectorAll("a[href], button, input, select, textarea, [tabindex]"))
					.filter((node) => node.tabIndex >= 0 && validDrillFocus(node));
				const focusSafe = () => {
					const safe = root.querySelector("[data-xsdsh-focus-safe]");
					const target = validDrillFocus(safe) ? safe : (focusables()[0] || root);
					target.focus({ preventScroll: true });
				};
				const isTop = () => Array.from(drillOverlaySessions).pop() === session;
				const onKey = (event) => {
					if (!isTop() || event.isComposing) return;
					if (event.key === "Escape") {
						event.preventDefault();
						event.stopImmediatePropagation();
						cancelRef.current();
					} else if (event.key === "Tab") {
						event.preventDefault();
						event.stopImmediatePropagation();
						const items = focusables();
						const index = items.indexOf(document.activeElement);
						const next = index < 0 ? (event.shiftKey ? items.length - 1 : 0)
							: (index + (event.shiftKey ? -1 : 1) + items.length) % items.length;
						(items[next] || root).focus({ preventScroll: true });
					}
				};
				const onFocus = (event) => {
					if (isTop() && !root.contains(event.target)) focusSafe();
				};
				let disposed = false;
				const session = { dispose: () => {
					if (disposed) return;
					disposed = true;
					document.removeEventListener("keydown", onKey, true);
					document.removeEventListener("focusin", onFocus, true);
					drillOverlaySessions.delete(session);
					/* 弹窗关闭后 React 需要两个微任务才能提交 DOM 变更；
					   用双 Promise 链确保 flushSync 完成后再读 activeElement。 */
					Promise.resolve().then(() => Promise.resolve()).then(() => {
						if (drillOverlaySessions.size) return;
						restoreDrillFocus();
					});
				} };
				drillOverlaySessions.add(session);
				document.addEventListener("keydown", onKey, true);
				document.addEventListener("focusin", onFocus, true);
				focusSafe();
				return session.dispose;
			}, [open, step]);
			return rootRef;
		}

		let dockBus = {
			open: false, tab: "clean", drillLocation: { area: "home" },
			welcomeOpen: false, authOpen: false, authBusy: false, authError: "",
			grantReady: false, authorized: false, pending: "tab", listeners: new Set(),
		};
		function getDock() { return dockBus; }
		function setDock(patch) {
			const next = Object.assign({}, dockBus, patch);
			if (!next.open || next.tab !== "drill" || next.drillLocation.area !== "redteam") {
				next.welcomeOpen = false;
				next.authOpen = false;
				next.pending = "tab";
			}
			if ((dockBus.authOpen || dockBus.welcomeOpen) && !next.authOpen && !next.welcomeOpen) drillAuthFlow += 1;
			dockBus = next;
			dockBus.listeners.forEach((fn) => { try { fn(dockBus); } catch { /* ignore */ } });
		}
		function useDock() {
			const [st, setSt] = useState(dockBus);
			useEffect(() => {
				const fn = (next) => setSt(next);
				dockBus.listeners.add(fn);
				return () => { dockBus.listeners.delete(fn); };
			}, []);
			return st;
		}

		function navigateDrill(location) {
			drillAuthFlow += 1;
			setDock({ open: true, tab: "drill", drillLocation: location, welcomeOpen: false, authOpen: false, pending: "tab", authError: "" });
		}
		function completeDrillEntry() {
			if (!readDrillAuth()) return;
			setDock({ welcomeOpen: false, authOpen: false, pending: "tab", authError: "" });
		}
		function requestDrillAuthorization() {
			if (!readWelcomeAck() || !readDrillAuth()) rememberDrillOverlayFocus();
			drillAuthAttempted = true;
			drillAuthFlow += 1;
			const location = dockBus.drillLocation.area === "redteam" ? dockBus.drillLocation : { area: "redteam", tab: "assets" };
			const welcome = !readWelcomeAck();
			setDock({ open: true, tab: "drill", drillLocation: location, pending: "tab", welcomeOpen: welcome, authOpen: !welcome && !readDrillAuth(), authError: "" });
			if (!welcome && readDrillAuth()) completeDrillEntry();
		}
		function requestDrill(kind) {
			if (kind === "home") { navigateDrill({ area: "home" }); return; }
			if (kind === "env") { requestDrillEnv(); return; }
			if (!drillAuthAttempted || (readDrillAuth() && readWelcomeAck())) {
				requestDrillAuthorization();
				return;
			}
			/* 取消后重进只显示阻塞页；阅读按钮可主动重新开始。 */
			navigateDrill({ area: "redteam", tab: "assets" });
		}
		function requestDrillEnv() {
			navigateDrill({ area: "global", tab: "env" });
		}
		function cancelDrillAuthorization() {
			navigateDrill({ area: "home" });
		}
		function confirmDrillWelcome() {
			if (!dockBus.welcomeOpen) return;
			writeWelcomeAck();
			setDock({ welcomeOpen: false, authOpen: !readDrillAuth() });
			if (readDrillAuth()) completeDrillEntry();
		}
		async function confirmDrillAuthorization() {
			if (!dockBus.authOpen || dockBus.authBusy) return false;
			const flow = drillAuthFlow;
			const granted = await writeDrillAuth(true);
			if (granted && !drillAuthDisposed && flow === drillAuthFlow && dockBus.authOpen) completeDrillEntry();
			return granted;
		}
		function openDockClean() {
			setDock({ open: true, tab: "clean", authOpen: false, pending: "tab" });
		}
		function toggleDock() {
			if (dockBus.open) setDock({ open: false, authOpen: false, pending: "tab" });
			else openDockClean();
		}
		syncDrillGrant();

		const DOCK_GEOM_KEY = "Xsdsh-purge-next-dock-geom-v4";
		/* 默认停在右上，底边留在输入框上面。拖动之后停在用户松开的位置，只保证不拖出窗口。 */
		const DOCK_COMPOSER_CLEAR = 172;
		function defaultDockGeom() {
			const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
			const vh = typeof window !== "undefined" ? window.innerHeight : 800;
			const w = Math.min(620, Math.max(380, vw - 16));
			const y = 48;
			const h = Math.max(240, Math.min(640, vh - y - DOCK_COMPOSER_CLEAR));
			return { x: Math.max(8, vw - w - 8), y: y, w: w, h: h };
		}
		/**
	 * 拖拽 / 缩放的会话管理。
	 *
	 * 老写法的问题：mousedown 时挂 mousemove + mouseup 到 window，只在 mouseup 里摘。
	 * 但 Windows 上「按住鼠标时窗口被最大化 / 切到别的窗口 / 鼠标移出视口」时，
	 * mouseup 可能永远不派发 —— 监听就永久留在 window 上。
	 * 之后每次鼠标移动都会 setGeom → 整个面板持续重渲染 → 连点击都被吞掉，
	 * 表现就是「关闭按钮点了没反应，多点几下或过一会儿才好」。
	 *
	 * 这里改成：一旦开始就把三种终止信号都挂上（mouseup / pointercancel / blur），
	 * 并且任何一条触发都摘干净四条监听，保证不会残留。
	 *
	 * @param {(ev: MouseEvent) => void} onMove
	 * @param {() => void} [onEnd] 会话收尾回调（提交几何、摘 is-dragging）；任何一条终止信号都会走一次
	 * @returns {{ move: Function, stop: Function }}
	 */
function beginPointerSession(onMove, onEnd) {
	let stopped = false;
	const stop = () => {
		if (stopped) return;
		stopped = true;
		for (const name of ["pointermove", "mousemove"]) window.removeEventListener(name, move);
		for (const name of ["pointerup", "mouseup", "pointercancel", "blur"]) window.removeEventListener(name, stop);
		if (typeof onEnd === "function") onEnd();
	};
	const move = (ev) => {
		if (stopped) return;
		// 按键已经松开但没收到 mouseup（窗口失焦等）：就地收尾，别继续刷
		if (ev && typeof ev.buttons === "number" && ev.buttons === 0) { stop(); return; }
		/* 高刷屏 / 合成器一帧内可能合并多个指针事件，位移只取最后一帧；
	 *  中间点对「从起点算位移」没有意义，全处理只是白烧 CPU。 */
		let last = ev;
		if (ev && typeof ev.getCoalescedEvents === "function") {
			try {
				const list = ev.getCoalescedEvents();
				if (list && list.length) last = list[list.length - 1];
			} catch { last = ev; /* 某些实现会抛，退回原始事件 */ }
		}
		onMove(last);
	};
	/* pointerdown 里 preventDefault 后，按 Pointer Events 规范兼容 mousemove 不再派发；
	 *  所以以 pointermove 为主、mousemove 兜底，两路从同一起点算位移，重复事件无副作用。 */
	for (const name of ["pointermove", "mousemove"]) window.addEventListener(name, move, { passive: true });
	for (const name of ["pointerup", "mouseup", "pointercancel", "blur"]) window.addEventListener(name, stop);
	return { move, stop };
}

function clampDockGeom(g) {
			const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
			const vh = typeof window !== "undefined" ? window.innerHeight : 800;
			const w = Math.min(Math.max(380, Number(g && g.w) || 620), Math.max(380, vw - 16));
			const h = Math.min(Math.max(240, Number(g && g.h) || 520), Math.max(240, vh - 16));
			const x = Math.min(Math.max(8, Number(g && g.x) || 8), Math.max(8, vw - w - 8));
			const y = Math.min(Math.max(8, Number(g && g.y) || 8), Math.max(8, vh - Math.min(h, vh - 16) - 8));
			return { x: x, y: y, w: w, h: h };
		}
		function loadDockGeom() {
			try {
				const raw = JSON.parse(window.localStorage.getItem(DOCK_GEOM_KEY) || "null");
				if (raw && typeof raw === "object") return clampDockGeom(raw);
			} catch { /* ignore */ }
			return clampDockGeom(defaultDockGeom());
		}
		function saveDockGeom(g) {
			try { window.localStorage.setItem(DOCK_GEOM_KEY, JSON.stringify(clampDockGeom(g))); } catch { /* ignore */ }
		}

		function WelcomeNotice() {
			const t = useT();
			const st = useDock();
			const [checked, setChecked] = useState(false);
			useEffect(() => { setChecked(false); }, [st.welcomeOpen]);
			const overlayRef = useDrillOverlayFocus(st.welcomeOpen, cancelDrillAuthorization);
			if (!st.welcomeOpen) return null;
			const repo = t("welcome.repo");
			const node = h("div", { className: "xsdsh-auth-mask", ref: overlayRef, tabIndex: -1, "data-xsdsh-overlay": "welcome", role: "dialog", "aria-modal": "true" },
				h("div", { className: "xsdsh-auth-modal", style: { width: "min(560px,100%)" } },
					h("pre", {
						className: "xsdsh-mascot",
						"aria-hidden": "true",
						style: {
							margin: "0 0 6px",
							fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
							fontSize: 12,
							lineHeight: 1.25,
							color: "var(--dsw-alias-label-brand, #8fbf9a)",
							whiteSpace: "pre",
							userSelect: "none",
						},
					}, t("welcome.mascot")),
					h("h2", null, t("welcome.title")),
					h("div", { className: "muted", style: { color: "var(--dsw-alias-label-secondary,#999)", fontSize: 12 } }, t("welcome.lead")),
					h("div", { className: "xsdsh-auth-warn" }, t("welcome.warn")),
					h("div", { className: "xsdsh-auth-legal", style: { height: "auto", maxHeight: 280 } },
						h("p", null, t("welcome.body")),
						h("p", null,
							h("a", {
								href: repo,
								target: "_blank",
								rel: "noopener noreferrer",
								style: { color: "var(--dsw-alias-label-brand, #8fbf9a)", wordBreak: "break-all" },
							}, repo),
						),
						h("h3", null, t("welcome.bans")),
						h("p", null, t("welcome.ban1")),
						h("p", null, t("welcome.ban2")),
						h("p", null, t("welcome.ban3")),
					),
					h("div", { className: "xsdsh-auth-checks" },
						h("label", null,
							h("input", {
								type: "checkbox",
								checked: checked,
								onChange: (e) => setChecked(!!(e && e.target && e.target.checked)),
							}),
							h("span", null, t("welcome.check")),
						),
					),
					h("div", { className: "xsdsh-auth-ops" },
						h("button", {
							type: "button",
							className: "primary",
							disabled: !checked,
							onClick: () => {
								if (!checked) return;
								confirmDrillWelcome();
							},
						}, t("welcome.ok")),
						h("button", { type: "button", "data-xsdsh-focus-safe": "", onClick: cancelDrillAuthorization }, t("auth.no")),
					),
				),
			);
			try {
				const rd = require("react-dom");
				if (rd && typeof rd.createPortal === "function" && typeof document !== "undefined" && document.body) {
					return rd.createPortal(node, document.body);
				}
			} catch { /* ignore */ }
			return node;
		}

		function AuthGate(props) {
			const t = useT();
			const st = useDock();
			const [left, setLeft] = useState(10);
			const [readEnd, setReadEnd] = useState(false);
			const [checks, setChecks] = useState({ read: false, scope: false, ban: false });
			const legalRef = useRef(null);
			const overlayRef = useDrillOverlayFocus(st.authOpen, cancelDrillAuthorization);
			useEffect(() => {
				const id = window.setInterval(() => {
					setLeft((n) => {
						if (n <= 1) { window.clearInterval(id); return 0; }
						return n - 1;
					});
				}, 1000);
				return () => window.clearInterval(id);
			}, []);
			useEffect(() => {
				const el = legalRef.current;
				if (!el) return;
				if (el.scrollHeight <= el.clientHeight + 4) setReadEnd(true);
			}, []);
			const locked = left > 0 || !readEnd;
			const ready = !locked && checks.read && checks.scope && checks.ban;
			const hint = left > 0
				? t("auth.hint.wait").replace("{n}", String(left))
				: (readEnd ? t("auth.hint.check") : t("auth.hint.scroll"));
			const onScroll = () => {
				const el = legalRef.current;
				if (!el) return;
				if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setReadEnd(true);
			};
			const toggle = (id) => {
				if (locked) return;
				setChecks((prev) => Object.assign({}, prev, { [id]: !prev[id] }));
			};
			const okLabel = !ready
				? t("auth.ok")
				: (props.pending === "env" ? t("auth.ok.env") : t("auth.ok.tab"));
			return h("div", { className: "xsdsh-auth-mask", ref: overlayRef, tabIndex: -1, "data-xsdsh-overlay": "auth", role: "dialog", "aria-modal": "true" },
				h("div", { className: "xsdsh-auth-modal" },
					h("h2", null, t("auth.title")),
					h("div", { className: "muted", style: { color: "var(--dsw-alias-label-secondary,#999)", fontSize: 12 } }, t("auth.lead")),
					h("div", { className: "xsdsh-auth-warn" }, t("auth.warn")),
					h("div", {
						className: "xsdsh-auth-legal",
						ref: legalRef,
						onScroll,
						dangerouslySetInnerHTML: { __html: AUTH_LEGAL_HTML },
					}),
					h("div", { style: { color: "var(--dsw-alias-label-secondary,#999)", fontSize: 12 } }, hint),
					h("div", { className: "xsdsh-auth-checks" },
						[["read", "auth.check.read"], ["scope", "auth.check.scope"], ["ban", "auth.check.ban"]].map((row) =>
							h("label", { key: row[0], className: locked ? "locked" : "" },
								h("input", {
									type: "checkbox",
									checked: !!checks[row[0]],
									disabled: locked,
									onChange: () => toggle(row[0]),
								}),
								h("span", null, t(row[1])),
							),
						),
					),
					st.authError ? h("div", { role: "alert" }, st.authError) : null,
					h("div", { className: "xsdsh-auth-ops" },
						h("button", { type: "button", "data-xsdsh-focus-safe": "", onClick: cancelDrillAuthorization }, t("auth.no")),
						h("button", {
							type: "button",
							className: "primary",
							disabled: !ready || st.authBusy,
							onClick: () => {
								if (!ready || st.authBusy) return;
								return confirmDrillAuthorization();
							},
						}, okLabel),
					),
				),
			);
		}

		function isRedteamPresetId(value) {
			const text = String(value || "").trim();
			if (!text) return false;
			if (text === "redteam") return true;
			if (/^red[\s_-]*team$/i.test(text)) return true;
			const label = text.replace(/不是红队/g, "").replace(/非红队/g, "");
			if (/红队/.test(label)) return true;
			return false;
		}

		function readSessionAgentPreset(sess) {
			if (!sess || typeof sess !== "object") return "";
			try {
				const pv = sess.projectionValues;
				if (pv && typeof pv.agentPreset === "string") return pv.agentPreset;
			} catch { /* ignore */ }
			try {
				if (typeof sess.agentPreset === "string") return sess.agentPreset;
			} catch { /* ignore */ }
			try {
				const header = sess.header;
				if (header && typeof header.agentPreset === "string") return header.agentPreset;
			} catch { /* ignore */ }
			return "";
		}

		function readSessionCwd(sess) {
			if (!sess || typeof sess !== "object") return "";
			try {
				const pv = sess.projectionValues;
				if (pv && typeof pv.cwd === "string" && pv.cwd.trim()) return pv.cwd.trim();
			} catch { /* ignore */ }
			try {
				if (typeof sess.cwd === "string" && sess.cwd.trim()) return sess.cwd.trim();
			} catch { /* ignore */ }
			try {
				const header = sess.header;
				if (header && typeof header.cwd === "string" && header.cwd.trim()) return header.cwd.trim();
			} catch { /* ignore */ }
			return "";
		}

		function clientCurrentCwd() {
			try {
				const sessions = rewindSessions || (rewindHost && rewindHost.sessions);
				if (!sessions) return "";
				const sid = currentSessionId(sessions);
				if (!sid) return "";
				try {
					const snap = typeof sessions.list?.getSnapshot === "function" ? sessions.list.getSnapshot() : null;
					const sess = snap && snap.byId ? snap.byId[sid] : null;
					const found = readSessionCwd(sess);
					if (found) return found;
				} catch { /* ignore */ }
				try {
					const actx = typeof sessions.scope === "function" ? sessions.scope(sid) : undefined;
					const face = typeof sessions.sessionOf === "function" ? sessions.sessionOf(actx) : undefined;
					const faceSnap = face && typeof face.getSnapshot === "function" ? face.getSnapshot() : face;
					const found = readSessionCwd(faceSnap);
					if (found) return found;
				} catch { /* ignore */ }
			} catch { /* ignore */ }
			return "";
		}

		function isRedteamModeActive() {
			try {
				const sessions = rewindSessions || (rewindHost && rewindHost.sessions);
				const sid = currentSessionId(sessions);
				if (sid && sessions) {
					try {
						const snap = typeof sessions.list?.getSnapshot === "function" ? sessions.list.getSnapshot() : null;
						const sess = snap && snap.byId ? snap.byId[sid] : null;
						if (isRedteamPresetId(readSessionAgentPreset(sess))) return true;
					} catch { /* ignore */ }
					try {
						const actx = typeof sessions.scope === "function" ? sessions.scope(sid) : undefined;
						const face = typeof sessions.sessionOf === "function" ? sessions.sessionOf(actx) : undefined;
						const faceSnap = face && typeof face.getSnapshot === "function" ? face.getSnapshot() : face;
						if (isRedteamPresetId(readSessionAgentPreset(faceSnap))) return true;
					} catch { /* ignore */ }
				}
			} catch { /* ignore */ }
			/* 新会话：模式下拉里的「红队模式」chip（选好但还没写入 session）
			 * 优先走语义化 data-* 挂点,其次 class 子串模糊匹配 + 文本兜底;
			 * 不写死 CSS Module 哈希(HKgFRW_seat 这种每次构建都会变)。 */
			try {
				const semantic = document.querySelector(
					"[data-agent-preset='redteam'], [data-preset-id='redteam'], [data-mode='redteam']"
				);
				if (semantic) return true;
				const nodes = document.querySelectorAll(
					"[class*='seat' i][class*='label' i], [class*='seatLabel' i], button[class*='seat' i], [role='button'][class*='seat' i]"
				);
				for (const el of nodes) {
					const text = String(el.textContent || "").replace(/\s+/g, " ").trim();
					if (/红队模式/.test(text) || /^RedTeam\b/i.test(text)) return true;
				}
			} catch { /* ignore */ }
			try {
				const labels = document.querySelectorAll(
					"[class*='label' i][class*='preset' i], [class*='presetLabel' i], [title*='红队'], [title*='RedTeam']"
				);
				for (const el of labels) {
					const text = String(el.textContent || "").trim();
					if (/红队模式/.test(text) || /^RedTeam\b/i.test(text)) return true;
					if (isRedteamPresetId(text)) return true;
				}
			} catch { /* ignore */ }
			return false;
		}

		function looksLikeSendControl(el) {
			if (!el || el.nodeType !== 1) return false;
			const btn = el.closest("button, [role='button']");
			if (!btn) return false;
			if (btn.closest(".xsdsh-dock, .xsdsh-auth-mask, .rt-dock, .xsdsh-env-gate, .purge-app, [data-xsdsh-ui]")) return false;
			const label = [
				btn.getAttribute("aria-label"),
				btn.getAttribute("title"),
				btn.getAttribute("data-testid"),
				btn.textContent,
			].filter(Boolean).join(" ");
			if (/停止|Stop/i.test(label) && !/发送|Send/i.test(label)) return false;
			if (/发送|Submit|Send(?!\s*feedback)/i.test(label)) return true;
			/* composer 主按钮：data-composer-card 内的 primary */
			try {
				const card = btn.closest("[data-composer-card], [data-composer-seat]");
				if (card) {
					const cls = String(btn.className || "");
					if (/primary/i.test(cls) && btn.querySelector("svg")) return true;
				}
			} catch { /* ignore */ }
			if (btn.type === "submit") {
				const form = btn.closest("form");
				if (form && form.querySelector("textarea, [contenteditable='true']")) return true;
			}
			return false;
		}

		function fetchEnvAdaptStatus() {
			return fetch("/redteam/api", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ op: "platformEnvAdaptStatus" }),
			}).then((r) => r.json()).catch(() => null);
		}

		/** 同步探测的占位：不再做同步 XHR（会卡 UI 主线程、Chrome 已逐步弃用）。
		 * 调用方 mustBlockSubmit 在 cache 过期/缺失时按"未知→保守 block"处理,
		 * 同时 EnvAdaptSendGate 的 useEffect 轮询会异步 refresh,下次调用即可放行。 */
		function fetchEnvAdaptStatusSync() { return null; }

		/** 红队发送前门禁：先确认服务端授权，再检查环境适配；可确认跳过适配。 */
		function EnvAdaptSendGate() {
			const t = useT();
			const [open, setOpen] = useState(false);
			const [confirmSkip, setConfirmSkip] = useState(false);
			const [status, setStatus] = useState(null);
			const [busy, setBusy] = useState(false);
			const overlayRef = useDrillOverlayFocus(open, () => {
				if (confirmSkip) setConfirmSkip(false);
				else setOpen(false);
			}, confirmSkip);
			const cacheRef = useRef({ at: 0, ready: false });
			const openRef = useRef(false);
			openRef.current = open;

			const refresh = useCallback(async () => {
				if (!readDrillAuth()) {
					cacheRef.current = { at: 0, ready: false };
					return null;
				}
				const r = await fetchEnvAdaptStatus();
				const ready = !!(r && r.ready);
				cacheRef.current = { at: Date.now(), ready: ready, skipped: !!(r && r.skipped) };
				setStatus(r);
				return r;
			}, []);

			const blockAndOpen = useCallback(() => {
				setConfirmSkip(false);
				if (!readDrillAuth()) {
					setOpen(false);
					if (!dockBus.welcomeOpen && !dockBus.authOpen) requestDrill("tab");
					return true;
				}
				refresh();
				/* 已授权过：只弹精简环境适配窗，不再自动拉开整块演练台 */
				setOpen(true);
				return true;
			}, [refresh]);

			const mustBlockSubmit = useCallback(() => {
				if (!isRedteamModeActive()) return false;
				if (!readDrillAuth()) return blockAndOpen();
				const cached = cacheRef.current;
				/* cache 过期时触发异步刷新;本次调用按最后一次 cache 判断,未知保守 block */
				if (!cached.at || Date.now() - cached.at > 2500) {
					refresh().catch(() => {});
				}
				if (cached.ready) return false;
				blockAndOpen();
				return true;
			}, [blockAndOpen, refresh]);

			/* 挂住宿主 SessionInputShell.submit —— 比点按钮启发式可靠。
			 * patch 必须可逆:存 origSubmit 到 WeakMap,unmount / 依赖变更时恢复,
			 * 否则插件禁用后 shell.submit 还是我们的 wrapper,持死 mustBlockSubmit 闭包。 */
			useEffect(() => {
				const patched = new WeakMap();
				const patchedShells = [];
				const patchShell = (shell) => {
					if (!shell || patched.has(shell)) return;
					if (typeof shell.submit !== "function") return;
					const origSubmit = shell.submit;
					const origActionsSubmit = (shell.actions && typeof shell.actions.submit === "function")
						? shell.actions.submit
						: null;
					patched.set(shell, { origSubmit, origActionsSubmit });
					patchedShells.push(shell);
					const bound = origSubmit.bind(shell);
					shell.submit = function gatedSubmit(mode) {
						try {
							if (mustBlockSubmit()) return;
						} catch { /* 门禁异常时不吞掉发送 */ }
						return bound(mode);
					};
					if (shell.actions && typeof shell.actions === "object") {
						shell.actions.submit = () => shell.submit("queue");
					}
				};
				const tick = () => {
					try {
						const sessions = rewindSessions || (rewindHost && rewindHost.sessions);
						const sid = currentSessionId(sessions);
						if (!sid) return;
						patchShell(conversationInput(sid));
					} catch { /* ignore */ }
				};
				tick();
				const iv = window.setInterval(tick, 400);
				return () => {
					window.clearInterval(iv);
					for (const shell of patchedShells) {
						const info = patched.get(shell);
						if (!info) continue;
						try { shell.submit = info.origSubmit; } catch { /* ignore */ }
						if (info.origActionsSubmit && shell.actions) {
							try { shell.actions.submit = info.origActionsSubmit; } catch { /* ignore */ }
						}
					}
					patchedShells.length = 0;
				};
			}, [mustBlockSubmit]);

			useEffect(() => {
				let alive = true;
				const tick = () => {
					if (!alive) return;
					if (!isRedteamModeActive()) return;
					refresh();
				};
				tick();
				const iv = window.setInterval(tick, 5000);
				return () => { alive = false; window.clearInterval(iv); };
			}, [refresh]);

			useEffect(() => {
				const onPointer = (e) => {
					if (!looksLikeSendControl(e.target)) return;
					if (!mustBlockSubmit()) return;
					e.preventDefault();
					e.stopPropagation();
					if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
				};
				const onKey = (e) => {
					if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
					const inComposer = e.target && e.target.closest
						&& e.target.closest("[data-composer-card], [data-composer-seat], [contenteditable='true'], textarea");
					if (!inComposer) return;
					if (e.target.closest && e.target.closest(".xsdsh-dock, .xsdsh-auth-mask, .rt-dock, .xsdsh-env-gate, .purge-app, [data-xsdsh-ui]")) return;
					if (!mustBlockSubmit()) return;
					e.preventDefault();
					e.stopPropagation();
					if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
				};
				document.addEventListener("pointerdown", onPointer, true);
				document.addEventListener("click", onPointer, true);
				document.addEventListener("keydown", onKey, true);
				return () => {
					document.removeEventListener("pointerdown", onPointer, true);
					document.removeEventListener("click", onPointer, true);
					document.removeEventListener("keydown", onKey, true);
				};
			}, [mustBlockSubmit]);

			if (!open) return null;

			const message = (status && status.message) || t("envGate.lead");
			return h("div", { className: "xsdsh-auth-mask xsdsh-env-gate", ref: overlayRef, tabIndex: -1, "data-xsdsh-overlay": "env", role: "dialog", "aria-modal": "true" },
				h("div", { className: "xsdsh-auth-modal", style: { width: "min(480px,100%)" } },
					h("h2", null, t("envGate.title")),
					h("div", { style: { fontSize: 13, lineHeight: 1.55 } }, message),
					h("div", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary,#999)", lineHeight: 1.5 } }, t("envGate.kaliHint")),
					confirmSkip
						? h("div", { className: "xsdsh-auth-warn" }, t("envGate.skipConfirm"))
						: null,
					h("div", { className: "xsdsh-auth-ops" },
						confirmSkip
							? [
								h("button", {
									key: "no",
									type: "button",
									"data-xsdsh-focus-safe": "",
									onClick: () => setConfirmSkip(false),
								}, t("envGate.skipNo")),
								h("button", {
									key: "yes",
									type: "button",
									className: "primary",
									disabled: busy,
									onClick: () => {
										setBusy(true);
										fetch("/redteam/api", {
											method: "POST",
											headers: { "content-type": "application/json" },
											body: JSON.stringify({ op: "platformEnvAdaptSkip", skip: true }),
										}).then((r) => r.json()).then((r) => {
											setBusy(false);
											cacheRef.current = { at: Date.now(), ready: true, skipped: true };
											setStatus(r);
											setOpen(false);
											setConfirmSkip(false);
										}).catch(() => {
											setBusy(false);
											cacheRef.current = { at: Date.now(), ready: true, skipped: true };
											setOpen(false);
										});
									},
								}, t("envGate.skipYes")),
							]
							: [
								h("button", {
									key: "skip",
									type: "button",
									onClick: () => setConfirmSkip(true),
								}, t("envGate.skip")),
								h("button", {
									key: "go",
									type: "button",
									"data-xsdsh-focus-safe": "",
									className: "primary",
									onClick: () => {
										setOpen(false);
										requestDrillEnv();
									},
								}, t("envGate.go")),
							],
					),
				),
			);
		}

		/* 提示词改写：并入自 nachoneko 提示词改写 1.0，行为不变（原文进、改写结果出、可复制），
		   只是把「调外部接口 + 填 Key」换成宿主自己的模型服务（当前模型）。 */
		/**
		 * 「模式提示词」页。
		 *
		 * 三个模式各自一份 persona 提示词，可以在这里改并保存。
		 * 默认值来自包内模板（不是磁盘上已被覆盖的那份），所以升级后默认值会跟着升级。
		 * 保存后**下次重启生效** —— dsh 的 persona 是启动时读进系统提示词的，
		 * 热改不会重载，这里必须如实告诉用户，不能假装已经生效。
		 */
		/**
		 * 「模式提示词」页的错误边界。
		 *
		 * 单独兜一层的原因：这一页要读后端、写文件、还有 window.confirm，
		 * 出错的姿势比别的 tab 多。没有边界时一次抛错会把整个 dock 打崩，
		 * 表现成「点了没反应」，什么都没留下。有边界至少能看见原因。
		 */
		class PromptsErrorBoundary extends Component {
			constructor(props) {
				super(props);
				this.state = { failed: false, message: "" };
			}
			static getDerivedStateFromError(error) {
				return { failed: true, message: String(error && error.message ? error.message : error) };
			}
			componentDidCatch(error) {
				try { console.error("[Xsdsh-purge-next] prompts tab:", error); } catch { /* ignore */ }
			}
			render() {
				if (!this.state.failed) return this.props.children;
				return h("div", { style: { padding: 16, fontSize: 12.5, lineHeight: 1.7, color: "#ef4444" } },
					h("b", null, "模式提示词页出错了"),
					h("pre", {
						style: {
							marginTop: 8,
							whiteSpace: "pre-wrap",
							fontFamily: "var(--xsdsh-font-ui, sans-serif)",
							fontSize: 11.5,
							color: "var(--dsw-alias-label-secondary)",
						},
					}, this.state.message));
			}
		}

		// Host capabilities stay here; feature composition lives in IntegratedApp.tsx.
		function createIntegratedRuntime(t) {
			return {
				appearance: __xsdshClientModules.createAppearanceController(),
				prompts: __xsdshClientModules.createPromptsController((...args) => fetch(...args)),
				clean: {
					t, apiJson, statusApi, fetch: (...args) => fetch(...args),
					confirm: (message) => {
						try { return typeof window.confirm === "function" && window.confirm(message) === true; }
						catch { return false; }
					},
					currentCwd: clientCurrentCwd,
					restart: restartDsh,
					afterUninstall: resumeWebAfterUninstall,
					glass: {
						read: readGlassPref,
						save(on) {
							saveGlassPref(on);
							// Legacy save swallows storage errors: verify the actual canonical value.
							if (window.localStorage.getItem(GLASS_KEY) !== (on ? "1" : "0")) throw new Error("本机存储不可用，请重试。");
						},
						apply(root, on) {
							if (on) ensureGlassFilter();
							root.setAttribute("data-glass", on ? "1" : "0");
						},
					},
				},
			};
		}

		let uninstallReconnectTimer = null;
		function resumeWebAfterUninstall(surface) {
			if (surface === "desktop" || clientGuessSurface() === "desktop" || uninstallReconnectTimer !== null) return;
			const started = Date.now();
			const ping = async () => {
				try {
					const response = await fetch("/", { cache: "no-store", credentials: "same-origin" }).catch(() => null);
					if (response && response.ok) {
						try {
							window.localStorage.removeItem("xsdsh-theme");
							window.localStorage.removeItem("xsdsh-theme-mode");
						} catch (error) { console.warn("[Xsdsh-purge-next] 无法清除旧主题缓存:", error); }
						uninstallReconnectTimer = null;
						window.location.reload();
						return;
					}
				} catch (error) {
					if (Date.now() - started >= 90000) {
						uninstallReconnectTimer = null;
						console.warn("[Xsdsh-purge-next] 卸载后宿主回连超时，请手动刷新。", error);
						return;
					}
					uninstallReconnectTimer = window.setTimeout(ping, 500);
					return;
				}
				if (Date.now() - started < 90000) uninstallReconnectTimer = window.setTimeout(ping, 500);
				else { uninstallReconnectTimer = null; console.warn("[Xsdsh-purge-next] 卸载后宿主回连超时，请手动刷新。"); }
			};
			uninstallReconnectTimer = window.setTimeout(ping, 800);
		}

		/* bounds 可选：拖动时视口在 pointerdown 里缓存一次，避免每个 move 都读
		   innerWidth/innerHeight 触发样式重算。 */
		function clampIntegratedGeom(g, bounds) {
			const vw = bounds && Number.isFinite(bounds.w) ? bounds.w : window.innerWidth;
			const vh = bounds && Number.isFinite(bounds.h) ? bounds.h : window.innerHeight;
			const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
			/* 面板尺寸固定：旧版本保存的宽高一律忽略，只按视口收窄，避免小窗口溢出。 */
			const w = Math.min(1060, Math.max(0, vw - 16));
			const h = Math.min(780, Math.max(0, vh - 16));
			return { w, h, x: Math.min(Math.max(8, number(g && g.x, vw - w - 8)), Math.max(8, vw - w - 8)),
				y: Math.min(Math.max(8, number(g && g.y, 48)), Math.max(8, vh - h - 8)) };
		}
		function loadIntegratedGeom() {
			try {
				const raw = JSON.parse(window.localStorage.getItem(DOCK_GEOM_KEY) || "null");
				/* 旧记录只保留 x/y；宽高强制默认，旧版本拖过的尺寸不再生效。旧 key 继续沿用。 */
				if (raw && typeof raw === "object") return clampIntegratedGeom({ x: raw.x, y: raw.y, w: 1060, h: 780 });
			} catch { return clampIntegratedGeom({ w: 1060, h: 780 }); }
			return clampIntegratedGeom({ w: 1060, h: 780 });
		}
		function saveIntegratedGeom(geom) {
			try { window.localStorage.setItem(DOCK_GEOM_KEY, JSON.stringify(geom)); return true; } catch { return false; }
		}

		// Auth/welcome portals are siblings of the dock. Only explicitly marked plugin roots bind.
		function registerIntegratedOverlays(appearance) {
			const bindings = new Map();
			const sync = () => {
				for (const [node, release] of bindings) {
					if (!node.isConnected) { release(); bindings.delete(node); }
				}
				for (const node of document.querySelectorAll("[data-xsdsh-overlay]")) {
					if (!bindings.has(node)) bindings.set(node, appearance.registerRoot(node));
				}
			};
			sync();
			const observer = new MutationObserver(sync);
			observer.observe(document.body, { childList: true, subtree: true });
			return () => { observer.disconnect(); for (const release of bindings.values()) release(); bindings.clear(); };
		}

		const INTEGRATED_CSS = `
[data-xsdsh-ui="app"],[data-xsdsh-overlay]{
 --dsw-alias-bg-layer-1:var(--xsdsh-panel);--dsw-alias-bg-layer-2:var(--xsdsh-panel2);--dsw-alias-bg-layer-3:var(--xsdsh-panel3);--dsw-alias-bg-base:var(--xsdsh-panel2);
 --dsw-alias-label-primary:var(--xsdsh-ink);--dsw-alias-label-secondary:var(--xsdsh-mute);
 --dsw-alias-label-brand:var(--xsdsh-accent);--dsw-alias-brand-primary:var(--xsdsh-accent);
 --dsw-alias-border-l1:var(--xsdsh-line);--dsw-alias-border-l2:var(--xsdsh-accent);
 --rt-ink:var(--xsdsh-ink);--rt-mute:var(--xsdsh-mute);--rt-line:var(--xsdsh-line);
 --rt-surf:var(--xsdsh-panel);--rt-surf-2:var(--xsdsh-panel2);
}
/* 玻璃只给卡片加一层高光与投影，不再替换底色：底色一旦变成半透明白，卡片就与示意稿的
   浅色分层脱节，关掉玻璃时又会露出更深的页面底色。去掉 backdrop-filter 同时省掉每帧
   重采样背景的开销（拖动面板时最明显）。 */
.purge-app .clean9[data-glass="1"] .clean9-patch-card,
.purge-app .clean9[data-glass="1"] .clean9-tile{
 box-shadow:inset 0 1px 0 #ffffff8c,inset 0 0 0 1px #ffffff26,0 8px 24px -12px #0b0d1026;
}
.purge-app,.purge-app *{-webkit-app-region:no-drag}
.purge-app .purge-app__header{position:relative;z-index:6}
[data-xsdsh-overlay].xsdsh-auth-mask{box-sizing:border-box;color:var(--xsdsh-ink);font-family:var(--xsdsh-font-ui)}
[data-xsdsh-overlay].xsdsh-auth-mask .xsdsh-auth-modal{background:var(--xsdsh-panel);color:var(--xsdsh-ink);border-color:var(--xsdsh-line)}
[data-xsdsh-overlay].xsdsh-auth-mask .xsdsh-auth-legal{background:var(--xsdsh-panel2);color:var(--xsdsh-ink);border-color:var(--xsdsh-line)}
[data-xsdsh-overlay].xsdsh-auth-mask .xsdsh-auth-warn{background:var(--xsdsh-accent-soft);color:var(--xsdsh-ink)}
[data-xsdsh-overlay].xsdsh-auth-mask .xsdsh-auth-ops button{background:var(--xsdsh-panel2);color:var(--xsdsh-ink);border-color:var(--xsdsh-line)}
[data-xsdsh-overlay].xsdsh-auth-mask .xsdsh-auth-ops button.primary{background:var(--xsdsh-accent);color:var(--xsdsh-accent-fg,#fff)}
`;
		function PurgeDock() {
			const t = useT();
			const st = useDock();
			const op = usePurgeOpState();
			const [geom, setGeom] = useState(loadIntegratedGeom);
			const tRef = useRef(t);
			tRef.current = t;
			const [runtime] = useState(() => createIntegratedRuntime((...args) => tRef.current(...args)));
			const pointer = useRef(null);
			const panelRef = useRef(null);
			const geomRef = useRef(geom);
			geomRef.current = geom;
			const alive = useRef(true);
			useEffect(() => {
				alive.current = true;
				const style = document.createElement("style");
				style.setAttribute("data-xsdsh-integrated", "1");
				style.textContent = [PURGE_CSS, __xsdshPurgeDrill.CSS, INTEGRATED_CSS].join("\n");
				document.head.append(style);
				const release = registerIntegratedOverlays(runtime.appearance);
				return () => {
					alive.current = false;
					if (pointer.current) pointer.current.stop();
					release(); runtime.appearance.dispose(); runtime.prompts.dispose(); style.remove();
					cleanupDrillAuth();
				};
			}, [runtime]);
			/* 几何只在「提交」时落盘（挂载时补写一次）；拖动过程每帧写 localStorage 既慢又没意义。 */
			useEffect(() => { saveIntegratedGeom(geomRef.current); }, []);
			useEffect(() => {
				let timer = 0;
				const resize = () => {
					const prev = geomRef.current;
					const next = clampIntegratedGeom(prev);
					if (next.x === prev.x && next.y === prev.y && next.w === prev.w && next.h === prev.h) return;
					geomRef.current = next;
					setGeom(next);
					/* 窗口拖动缩放会连续触发 resize，落盘延后合并成一次。 */
					window.clearTimeout(timer);
					timer = window.setTimeout(() => { if (alive.current) saveIntegratedGeom(geomRef.current); }, 200);
				};
				window.addEventListener("resize", resize);
				return () => { window.clearTimeout(timer); window.removeEventListener("resize", resize); };
			}, []);
			useEffect(() => {
				__xsdshPurgeDrill.setUI({ open: st.open && st.tab === "drill" && st.authorized });
			}, [st.open, st.tab, st.authorized]);
			const commitGeom = next => {
				geomRef.current = next;
				setGeom(next);
				if (alive.current) saveIntegratedGeom(next);
			};
			const startPointer = (kind, event) => {
				if (kind !== "drag") return;
				if (event.button !== 0 || event.target.closest("button,a,input,select,textarea,label")) return;
				event.preventDefault();
				event.stopPropagation();
				if (pointer.current) pointer.current.stop();
				const node = panelRef.current;
				const base = geomRef.current;
				/* 视口在按下时缓存一次：拖动期间窗口尺寸不会变，省掉每帧读 innerWidth/innerHeight 的布局查询。 */
				const viewport = { w: window.innerWidth, h: window.innerHeight };
				const sx = event.clientX, sy = event.clientY;
				let frame = 0;
				let latest = null;
				let moved = false;
				if (node && node.classList) node.classList.add("is-dragging");
				const paint = () => {
					frame = 0;
					if (!node || !latest) return;
					/* 拖动只写 transform：不触发布局，也不让 React 重渲染整个面板。 */
					node.style.transform = "translate3d(" + (latest.x - base.x) + "px," + (latest.y - base.y) + "px,0)";
				};
				const end = () => {
					if (frame) { window.cancelAnimationFrame(frame); frame = 0; }
					if (node && node.classList) node.classList.remove("is-dragging");
					if (!alive.current || !moved || !latest) return;
					const next = latest;
					latest = null;
					if (node) {
						/* 先把最终几何写成内联样式再摘 transform，避免松手瞬间闪回旧位置。 */
						node.style.left = next.x + "px";
						node.style.top = next.y + "px";
						node.style.width = next.w + "px";
						node.style.height = next.h + "px";
						node.style.transform = "";
					}
					commitGeom(next);
				};
				pointer.current = beginPointerSession(ev => {
					const dx = ev.clientX - sx, dy = ev.clientY - sy;
					const next = { x: base.x + dx, y: base.y + dy, w: base.w, h: base.h };
					latest = clampIntegratedGeom(next, viewport);
					moved = true;
					if (!frame) frame = window.requestAnimationFrame(paint);
				}, end);
			};
			const close = () => {
				setDock({ open: false, authOpen: false, pending: "tab" });
			};
			const panel = h(__xsdshClientModules.IntegratedApp, {
				runtime, op, state: st, rootRef: panelRef,
				onTabChange: tab => tab === "drill" ? requestDrill("home") : setDock({ tab, authOpen: false }),
				onNavigate: navigateDrill,
				onRequestRedteam: () => requestDrill("tab"),
				onRequestAuthorization: () => requestDrillAuthorization(),
				onClose: close,
				onDragStart: event => startPointer("drag", event),
				style: { position: "fixed", zIndex: 10000, pointerEvents: "auto", left: geom.x,
					top: geom.y, width: geom.w, height: geom.h, WebkitAppRegion: "no-drag" },
			});
			const auth = st.authOpen ? h(AuthGate, { pending: st.pending }) : null;
			try {
				const rd = require("react-dom");
				if (rd && typeof rd.createPortal === "function" && document.body) {
					return h(react.Fragment, null, rd.createPortal(panel, document.body), auth && rd.createPortal(auth, document.body));
				}
			} catch { /* Hosts without react-dom retain the slot fallback. */ }
			return h(react.Fragment, null, panel, auth);
		}

		function PurgeLauncher() {
			const t = useT();
			const st = useDock();
			return h("button", {
				type: "button",
				className: "xsdsh-launch",
				"data-open": st.open ? "1" : "0",
				"data-testid": "Xsdsh-purge-next-launch",
				title: t("dock.newSession"),
				onClick: () => toggleDock(),
			}, t("dock.newSession"));
		}

		/** 首页：模式旁挂「Xsdsh-purge-next」→ 打开插件。红队模式走模式下拉（registry 声明）。 */
		function HeroNewSessionMount() {
			const t = useT();
			const st = useDock();
			const [host, setHost] = useState(null);
			useEffect(() => {
				let dead = false;
				let warnedMiss = false;
				const ensure = () => {
					if (dead || typeof document === "undefined") return;
					/* 多路挂点兜底:语义化 data-* 优先,class 子串模糊匹配兜底(不绑定具体 CSS Module 哈希) */
					const row =
						document.querySelector('[data-dsh-hero-workspace-row]') ||
						document.querySelector('[data-conversation-hero]') ||
						document.querySelector('[class*="heroWorkspaceRow" i]') ||
						document.querySelector('[class*="hero" i][class*="workspace" i][class*="row" i]');
					if (!row) {
						if (!warnedMiss) {
							warnedMiss = true;
							try { console.warn("[Xsdsh-purge-next] HeroNewSessionMount: anchor row missing (host 可能改版)"); } catch { /* ignore */ }
						}
						setHost((prev) => (prev ? null : prev));
						return;
					}
					warnedMiss = false;
					let el = row.querySelector(":scope > .xsdsh-hero-chip");
					if (!el) {
						el = document.createElement("div");
						el.className = "xsdsh-hero-chip";
						el.setAttribute("data-testid", "Xsdsh-purge-next-hero-chip");
						row.appendChild(el);
					}
					setHost((prev) => (prev === el ? prev : el));
				};
				ensure();
				const obs = typeof MutationObserver !== "undefined"
					? new MutationObserver(() => ensure())
					: null;
				if (obs) obs.observe(document.body, { childList: true, subtree: true });
				const iv = setInterval(ensure, 1000);
				return () => {
					dead = true;
					if (obs) obs.disconnect();
					clearInterval(iv);
				};
			}, []);
			if (!host) return null;
			const btn = h("button", {
				type: "button",
				className: "xsdsh-hero-chip-btn" + (st.open ? " on" : ""),
				title: t("dock.newSession"),
				onClick: () => toggleDock(),
			},
				st.open ? h("span", { className: "xsdsh-live-dot", "aria-hidden": "true" }) : null,
				t("dock.newSession"),
			);
			try {
				const rd = require("react-dom");
				if (rd && typeof rd.createPortal === "function") return rd.createPortal(btn, host);
			} catch { /* host 可能没暴露 react-dom */ }
			return null;
		}

		/** 挂在「对话 / 轨迹 / 上下文」这一排，紧挨上下文。 */
		function TabRowPurgeMount() {
			const t = useT();
			const st = useDock();
			const [host, setHost] = useState(null);
			useEffect(() => {
				let dead = false;
				let warnedMiss = false;
				const ensure = () => {
					if (dead || typeof document === "undefined") return;
					/* 多路挂点兜底:data-* 优先,ARIA / class 子串兜底 */
					const row =
						document.querySelector("[data-conversation-tabs]") ||
						document.querySelector("[data-conversation-tabrow]") ||
						document.querySelector("[role='tablist'][aria-label*='对话' i]") ||
						document.querySelector("[class*='conversation' i][class*='tab' i][class*='row' i]");
					if (!row) {
						if (!warnedMiss) {
							warnedMiss = true;
							try { console.warn("[Xsdsh-purge-next] TabRowPurgeMount: tab row anchor missing"); } catch { /* ignore */ }
						}
						setHost((prev) => (prev ? null : prev));
						return;
					}
					warnedMiss = false;
					let el = row.querySelector(":scope > .xsdsh-tab-chip");
					if (!el) {
						el = document.createElement("div");
						el.className = "xsdsh-tab-chip";
						el.setAttribute("data-testid", "Xsdsh-purge-next-tab-chip");
						row.appendChild(el);
					}
					setHost((prev) => (prev === el ? prev : el));
				};
				ensure();
				const obs = typeof MutationObserver !== "undefined"
					? new MutationObserver(() => ensure())
					: null;
				if (obs) obs.observe(document.body, { childList: true, subtree: true });
				const iv = setInterval(ensure, 1000);
				return () => {
					dead = true;
					if (obs) obs.disconnect();
					clearInterval(iv);
				};
			}, []);
			if (!host) return null;
			/* 页签行这颗 chip 和输入区那条开关读的是同一个 dockBus，
			   所以两个入口永远同步。补上 role="switch" + aria-checked，
			   读屏才知道它是「开关」而不是「切页签」。 */
			const btn = h("button", {
				type: "button",
				role: "switch",
				"aria-checked": st.open ? "true" : "false",
				"aria-label": t("clean.switch.label"),
				className: "xsdsh-tab-btn" + (st.open ? " on" : ""),
				title: st.open ? (t("clean.switch.label") + " · " + t("clean.switch.on")) : (t("clean.switch.label") + " · " + t("dock.clean")),
				onClick: () => toggleDock(),
			}, t("clean.switch.label"));
			try {
				const rd = require("react-dom");
				if (rd && typeof rd.createPortal === "function") return rd.createPortal(btn, host);
			} catch { /* host 可能没暴露 react-dom */ }
			return null;
		}


		function installRewindUi(ctx) {
			rewindHost = ctx;
			rewindSessions = ctx.sessions;
			rewindWorkspace = ctx.uiWorkspace || null;
			rewindConversation = ctx.conversation || null;
			ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
				name: "conversation.input.right",
				id: "Xsdsh-purge-next-rewind",
				order: 20,
				inject: (sessionId) => ({
					sessionId,
					t: ctx.locale.bind(NS),
				}),
			}, RewindSafe));
			// 对话窗口里的清洗开关条：紧跟在回退按钮右边（order 22）。
			// 它只读 dockBus，不自己存「开没开」——点 dock 的 × 或首页 launcher，
			// 这边下一帧就跟着变，两边不可能不一致。
			ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
				name: "conversation.input.right",
				id: "Xsdsh-purge-next-clean-switch",
				order: 22,
				inject: (sessionId) => ({
					sessionId,
					t: ctx.locale.bind(NS),
				}),
			}, CleanSwitchSafe));
			// ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
			// 	name: "conversation.input.right",
			// 	id: "Xsdsh-purge-next-continue",
			// 	order: 21,
			// 	inject: (sessionId) => ({
			// 		sessionId,
			// 		t: ctx.locale.bind(NS),
			// 	}),
			// }, ContinueSafe));
			ctx.effect(() => installRewindWatch(ctx), "Xsdsh-purge-next: rewind watch");
		}

		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "Xsdsh-purge-next: dictionaries");
			const t = ctx.locale.bind(NS);
			translate = t;
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "Xsdsh-purge-next-dock",
				order: 50,
			}, () => h(react.Fragment, null, h(WelcomeNotice), h(PurgeLauncher), h(PurgeDock), h(HeroNewSessionMount), h(TabRowPurgeMount), h(EnvAdaptSendGate))));
			try {
				if (typeof ctx.inject === "function") {
					ctx.inject(["sessions", "uiWorkspace", "workspaces", "conversation"], (host) => installRewindUi(host));
				} else if (ctx.sessions) {
					installRewindUi(ctx);
				}
			} catch (e) {
				try {
					if (typeof ctx.inject === "function") {
						ctx.inject(["sessions", "uiWorkspace", "conversation"], (host) => installRewindUi(host));
					}
				} catch (e2) {
					try { console.warn("[Xsdsh-purge-next] rewind ui skipped:", e2 || e); } catch { /* ignore */ }
				}
			}
		}

		exports.name = name;
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});
