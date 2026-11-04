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
