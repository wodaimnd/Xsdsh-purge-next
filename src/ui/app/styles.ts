// Every selector is rooted here; host elements and legacy feature classes are untouched.
export const APP_SHELL_CSS = `
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
