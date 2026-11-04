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

