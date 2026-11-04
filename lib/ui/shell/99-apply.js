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
