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

