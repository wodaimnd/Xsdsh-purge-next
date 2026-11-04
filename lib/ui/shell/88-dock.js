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


