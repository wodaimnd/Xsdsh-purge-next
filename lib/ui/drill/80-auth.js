
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

