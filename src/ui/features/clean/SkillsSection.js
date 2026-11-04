import { React, h } from "../../host/react";
import { Btn, formatSize, noticeNode, ConfirmDialog } from "./primitives";
import { createEditorApi, skillUiAllowed, skillsRouteMissing } from "./editor-api";
import { TrashIcon } from "../../components/TrashIcon";
const { useState, useRef, useEffect, useCallback, useMemo } = React;
export function SkillsSection({ runtime, api, span = 2 }) {
	const { skillsApi } = useMemo(() => createEditorApi(runtime), [runtime]);
	const statusApi = api.status;

	const t = runtime.t;
	const tRef = useRef(t);
	tRef.current = t;
	const [onBeta, setOnBeta] = useState(false);
	const [st, setSt] = useState(null);
	const [query, setQuery] = useState("");
	const [editId, setEditId] = useState(null);
	const [editDesc, setEditDesc] = useState("");
	const [content, setContent] = useState("");
	const [busy, setBusy] = useState(false);
	const [notice, setNotice] = useState({ kind: "idle", text: "" });
	const [confirm, setConfirm] = useState(null);
	const zipRef = useRef(null);
	const folderRef = useRef(null);

	const loadStatus = useCallback(() => {
		const tr = tRef.current;
		const fail = (e) => {
			setSt(previous => ({ ...previous, ok: false, error: String(e?.message || e || "技能状态读取失败") }));
			setNotice({
				kind: "error",
				text: skillsRouteMissing(e) ? tr("err.skills.needRestart") : tr("err.skills", { error: (e && e.message) || e || "bad response" }),
			});
		};
		const apply = (d) => {
			if (d && d.ok) setSt({ ok: true, skills: d.skills || [] });
			else fail({ message: (d && d.error) || "bad response" });
		};
		/* 走模块级单飞（C5）：与 SettingsRoot 的 loadAll 共用同一份在飞请求，
		   否则每次挂载就是两个全量扫描叠着跑。 */
		statusApi()
			.then((d) => {
				const allowed = skillUiAllowed(d);
				setOnBeta(allowed);
				if (!allowed) {
					setSt(null);
					return;
				}
				if (d.skills) {
					apply({ ok: true, skills: d.skills });
					return;
				}
				skillsApi("status").then(apply).catch(fail);
			})
			.catch((error) => {
				setOnBeta(false);
				fail(error);
			});
	}, [skillsApi, statusApi]);

	useEffect(() => { loadStatus(); }, [loadStatus]);

	const doPost = useCallback((action, payload, after) => {
		setBusy(true);
		setNotice({ kind: "idle", text: "" });
		skillsApi(action, payload)
			.then((d) => {
				if (d && d.ok) {
					setNotice({ kind: "ok", text: t("ok.done") });
					loadStatus();
					if (after) after(d);
				} else {
					setNotice({ kind: "error", text: t("err.action", { action: "技能操作", error: (d && d.error) || "" }) });
				}
			})
			.catch((e) => setNotice({
				kind: "error",
				text: skillsRouteMissing(e) ? t("err.skills.needRestart") : t("err.action", { action: "技能操作", error: e.message }),
			}))
			.finally(() => setBusy(false));
	}, [loadStatus, t, skillsApi]);

	const openSkill = useCallback((id) => {
		setBusy(true);
		skillsApi("read", { id: id })
			.then((d) => {
				if (d.ok) {
					setEditId(id);
					setEditDesc(d.description || "");
					setContent(typeof d.content === "string" ? d.content : "");
				} else setNotice({ kind: "error", text: t("err.read", { error: d.error || "" }) });
			})
			.catch((e) => setNotice({ kind: "error", text: t("err.read", { error: e.message }) }))
			.finally(() => setBusy(false));
	}, [t, skillsApi]);

	const clearEditor = () => {
		setEditId(null);
		setEditDesc("");
		setContent("");
	};

	const readAsBase64 = (file) => new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const text = String(reader.result || "");
			const at = text.indexOf(",");
			resolve(at >= 0 ? text.slice(at + 1) : text);
		};
		reader.onerror = () => reject(new Error(t("need.import")));
		reader.readAsDataURL(file);
	});

	const importZip = (file) => {
		if (!file) {
			setNotice({ kind: "error", text: t("need.import") });
			return;
		}
		setBusy(true);
		setNotice({ kind: "ok", text: t("skills.importing") });
		readAsBase64(file)
			.then((data) => skillsApi("import", { data, name: file.name }))
			.then((d) => {
				if (!d || !d.ok) throw new Error((d && d.error) || "");
				setNotice({ kind: "ok", text: t("saved.import", { count: (d.imported || []).length || 1 }) });
				loadStatus();
			})
			.catch((e) => setNotice({
				kind: "error",
				text: skillsRouteMissing(e) ? t("err.skills.needRestart") : t("err.action", { action: "技能操作", error: e.message }),
			}))
			.finally(() => setBusy(false));
	};

	const keepFolderFile = (file) => {
		const rel = String(file.webkitRelativePath || file.name || "").replace(/\\/g, "/");
		if (!rel || rel.includes("..")) return false;
		if (/(^|\/)(node_modules|\.git|__MACOSX|\.system)(\/|$)/i.test(rel)) return false;
		if (/(^|\/)\._/.test(rel) || /\/\.DS_Store$/i.test(rel)) return false;
		return true;
	};

	const importFolder = (list) => {
		const files = Array.from(list || []).filter(keepFolderFile);
		if (!files.length) {
			setNotice({ kind: "error", text: t("err.import.folder") });
			return;
		}
		setBusy(true);
		setNotice({ kind: "ok", text: t("skills.importing") });
		Promise.all(files.map((file) => readAsBase64(file).then((content) => ({
			path: file.webkitRelativePath || file.name,
			content,
			encoding: "base64",
		}))))
			.then((payload) => skillsApi("import", {
				files: payload,
				name: String(payload[0] && payload[0].path || "").split("/")[0],
			}))
			.then((d) => {
				if (!d || !d.ok) throw new Error((d && d.error) || "");
				setNotice({ kind: "ok", text: t("saved.import", { count: (d.imported || []).length || 1 }) });
				loadStatus();
			})
			.catch((e) => setNotice({
				kind: "error",
				text: skillsRouteMissing(e) ? t("err.skills.needRestart") : t("err.action", { action: "技能操作", error: e.message }),
			}))
			.finally(() => setBusy(false));
	};

	if (!onBeta) return h("div", { className: "clean9-skills clean9-skills-gate", role: "status" }, notice.text || "技能接口暂不可用，请检查宿主状态后重试。");

	const all = (st && Array.isArray(st.skills)) ? st.skills : [];
	const needle = query.trim().toLowerCase();
	const shown = needle ? all.filter((item) => (item.id + " " + (item.description || "")).toLowerCase().includes(needle)) : all;
	const skillCount = all.length;
	/* 调用方式用两枚小徽章：长句会把行撑成两三行，整张表看着「竖着」。 */
	const callChips = (item) => {
		if (!item.valid) return h("span", { className: "clean9-call is-off" }, t("skills.invalid"));
		return [
			h("span", {
				key: "user", className: "clean9-call" + (item.userInvocable ? " is-on" : ""),
				title: item.userInvocable ? t("skills.call.slash", { cmd: "/" + item.id }) : t("skills.call.userOff"),
			}, "人工"),
			h("span", {
				key: "model", className: "clean9-call" + (item.modelInvocable ? " is-on" : ""),
				title: item.modelInvocable ? t("skills.call.model") : t("skills.call.modelOff"),
			}, "模型"),
		];
	};
	const rows = !st
		? h("tr", null, h("td", { colSpan: 5, className: "clean9-rules-empty" }, "读取技能中…"))
		: shown.length === 0
			? h("tr", null, h("td", { colSpan: 5, className: "clean9-rules-empty" }, needle ? "没有匹配的技能" : t("skills.empty")))
			: shown.map((item) => {
				const isEdit = item.id === editId;
				/* 整行可点：只有真正的控件（按钮/输入框）不抢点击，其余位置都选中这条技能。 */
				const openRow = (event) => {
					const target = event && event.target;
					if (target && typeof target.closest === "function" && target.closest("button,input,textarea,select,a,label")) return;
					openSkill(item.id);
				};
				return h("tr", {
					key: item.id, className: "clean9-rules-row is-clickable" + (isEdit ? " is-edit" : ""),
					onClick: openRow, title: "点击编辑 " + item.id,
				},
					h("td", null, h("button", {
						type: "button", role: "button", className: "clean9-rules-name",
						onClick: () => openSkill(item.id),
					}, item.id)),
					h("td", { className: "clean9-skills-desc", title: item.valid ? item.description : t("skills.invalid") }, item.valid ? item.description : t("skills.invalid")),
					h("td", { className: "clean9-skills-call" }, h("span", { className: "clean9-call-chips" }, callChips(item))),
					h("td", { className: "clean9-rules-size" }, formatSize(item.size)),
					h("td", { className: "clean9-rules-ops" },
						h("span", { className: "clean9-ops-inline" },
							h("button", {
								type: "button", className: "clean9-icon-btn", disabled: busy,
								"aria-label": t("delete") + " " + item.id, title: t("delete") + " " + item.id,
								onClick: (event) => {
									if (event && event.stopPropagation) event.stopPropagation();
									setConfirm({ id: item.id });
								},
							}, h(TrashIcon)),
						),
					),
				);
			});

	return h("section", { className: "clean9-skills", "aria-label": t("skills.title") },
		h("div", { className: "clean9-rules-head" },
			h("p", null, t("skills.hint")),
			h("span", { className: "clean9-rules-count" }, String(skillCount)),
		),
		h("div", { className: "clean9-skills-toolbar" },
			h("input", {
				className: "xsdsh-field", "aria-label": "搜索技能", placeholder: "搜索技能名称或描述",
				value: query, disabled: busy, onChange: (e) => setQuery(e.target.value),
			}),
			h("input", {
				ref: zipRef, type: "file", accept: ".zip,.tgz,.tar.gz,.tar,.skill", style: { display: "none" },
				onChange: (e) => {
					const file = e.target.files && e.target.files[0];
					e.target.value = "";
					importZip(file);
				},
			}),
			h("input", {
				ref: (el) => {
					folderRef.current = el;
					if (!el) return;
					el.setAttribute("webkitdirectory", "");
					el.setAttribute("directory", "");
					el.multiple = true;
				},
				type: "file", multiple: true, style: { display: "none" },
				onChange: (e) => {
					const files = Array.from((e.target && e.target.files) || []);
					e.target.value = "";
					importFolder(files);
				},
			}),
			h(Btn, { kind: "primary", tiny: true, disabled: busy, onClick: () => zipRef.current && zipRef.current.click() }, t("btn.importZip")),
			h(Btn, { tiny: true, disabled: busy, onClick: () => folderRef.current && folderRef.current.click() }, t("btn.importFolder")),
		),
		h("div", { className: "xsdsh-split clean9-rules-body" },
			h("div", { className: "clean9-rules-list" },
				h("div", { className: "clean9-rules-scroll" },
					h("table", { className: "clean9-rules-table clean9-skills-table" },
						h("colgroup", null,
							h("col", { style: { width: "34%" } }),
							h("col", null),
							h("col", { style: { width: 104 } }),
							h("col", { style: { width: 64 } }),
							h("col", { style: { width: 48 } })),
						h("thead", null, h("tr", null,
							h("th", { scope: "col" }, "名称"),
							h("th", { scope: "col" }, "描述"),
							h("th", { scope: "col" }, "调用方式"),
							h("th", { scope: "col" }, "大小"),
							h("th", { scope: "col" }, "操作"))),
						h("tbody", null, rows),
					),
				),
			),
			h("div", { className: "clean9-rules-editor" },
				editId ? [
					h("div", { key: "meta", className: "clean9-rules-editor-meta" },
						h("input", {
							className: "xsdsh-field", "aria-label": "技能描述", placeholder: t("ph.skill.desc"),
							value: editDesc, onChange: (e) => setEditDesc(e.target.value),
						}),
					),
					h("textarea", {
						key: "body", className: "clean9-rules-area", value: content,
						onChange: (e) => setContent(e.target.value), spellCheck: false, placeholder: "",
						"aria-label": "技能正文",
					}),
					h("div", { key: "save", className: "clean9-rules-save" },
						h(Btn, {
							kind: "primary", disabled: busy,
							onClick: () => doPost("save", { id: editId, content, description: editDesc }),
						}, t("btn.saveSkill")),
					),
				] : h("div", { className: "clean9-rules-empty" }, t("skills.pick")),
			),
		),
		h("div", { className: "clean9-rules-foot" }, noticeNode(notice)),
		confirm ? h(ConfirmDialog, {
			title: t("delete"),
			message: t("confirm.delete.skill", { id: confirm.id }),
			confirmLabel: t("delete"),
			cancelLabel: "取消",
			danger: true,
			busy,
			onCancel: () => setConfirm(null),
			onConfirm: () => {
				const id = confirm.id;
				setConfirm(null);
				if (editId === id) clearEditor();
				doPost("delete", { id });
			},
		}) : null,
	);
}
