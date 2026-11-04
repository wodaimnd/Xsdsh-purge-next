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

