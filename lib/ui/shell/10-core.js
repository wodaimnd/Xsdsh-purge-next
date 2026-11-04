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

