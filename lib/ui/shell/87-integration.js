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
