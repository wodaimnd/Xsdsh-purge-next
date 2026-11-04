import { React, h } from "../../host/react";
import { Btn, formatSize, noticeNode, ConfirmDialog } from "./primitives";
import { createEditorApi, TARGETS } from "./editor-api";
import { PurgeSelect } from "../../components/PurgeSelect";
const { useState, useRef, useEffect, useCallback, useMemo } = React;
function ruleLabel(r) {
	if (!r) return "";
	if (r.name !== r.id) return r.name + " (" + r.id + ")";
	return r.id;
}

export function RulesSection({ runtime, api, span = 2 }) {
	const { rulesApi, warnNeedPrompt } = useMemo(() => createEditorApi(runtime), [runtime]);
	const clientCurrentCwd = runtime.currentCwd;
	const t = runtime.t;
	const tRef = useRef(t);
	tRef.current = t;
	const [st, setSt] = useState(null);
	const [editId, setEditId] = useState(null);
	const [editName, setEditName] = useState("");
	const [editTarget, setEditTarget] = useState("AGENTS.md");
	const [content, setContent] = useState("");
	const [creating, setCreating] = useState(false);
	const [newId, setNewId] = useState("");
	const [newName, setNewName] = useState("");
	const [newTarget, setNewTarget] = useState("AGENTS.md");
	const [busy, setBusy] = useState(false);
	const [notice, setNotice] = useState({ kind: "idle", text: "" });
	const [confirm, setConfirm] = useState(null);
	const policyBusy = useRef(false);

	const loadStatus = useCallback(() => {
		const tr = tRef.current;
		let cwd = "";
		try { cwd = clientCurrentCwd?.() || ""; } catch (error) { setNotice({ kind: "error", text: String(error.message || error) }); return; }
		rulesApi("status", cwd ? { cwd: cwd } : undefined)
			.then((d) => {
				if (d && d.ok) setSt(d);
				else {
					setSt(previous => ({ ...previous, ok: false, error: "规则状态读取失败" }));
					setNotice({ kind: "error", text: tr("err.rules", { error: (d && d.error) || "bad response" }) });
				}
			})
			.catch((e) => {
				setSt(previous => ({ ...previous, ok: false, error: "规则状态读取失败" }));
				setNotice({ kind: "error", text: tr("err.rules", { error: e.message }) });
			});
	}, [rulesApi, clientCurrentCwd]);

	useEffect(() => { loadStatus(); }, [loadStatus]);

	const doPost = useCallback((action, payload, after) => {
		setBusy(true);
		setNotice({ kind: "idle", text: "" });
		rulesApi(action, payload)
			.then((d) => {
				if (d && d.ok) {
					setNotice({ kind: "ok", text: t("ok.done") });
					if (action === "save" || action === "activate") warnNeedPrompt(d, t);
					loadStatus();
					if (after) after();
				} else {
					warnNeedPrompt(d, t);
					setNotice({ kind: "error", text: t("err.action", { action, error: (d && d.error) || "" }) });
				}
			})
			.catch((e) => setNotice({ kind: "error", text: t("err.action", { action, error: e.message }) }))
			.finally(() => setBusy(false));
	}, [loadStatus, t, rulesApi, warnNeedPrompt]);

	const openRule = useCallback((id) => {
		setBusy(true);
		rulesApi("read", { id: id })
			.then((d) => {
				if (d.ok) {
					setEditId(id);
					setEditName(d.name || id);
					setEditTarget(d.target || "AGENTS.md");
					setContent(typeof d.content === "string" ? d.content : "");
				} else setNotice({ kind: "error", text: t("err.read", { error: d.error || "" }) });
			})
			.catch((e) => setNotice({ kind: "error", text: t("err.read", { error: e.message }) }))
			.finally(() => setBusy(false));
	}, [t, rulesApi]);

	const clearEditor = () => {
		setEditId(null);
		setEditName("");
		setEditTarget("AGENTS.md");
		setContent("");
	};

	/* 删除成功后只改本地列表：再拉一次 status 会让确认框下的整张表闪一下。 */
	const removeRule = useCallback((id) => {
		setBusy(true);
		setNotice({ kind: "idle", text: "" });
		rulesApi("delete", { id })
			.then((d) => {
				if (d && d.ok) {
					setNotice({ kind: "ok", text: t("ok.done") });
					setSt((previous) => {
						if (!previous) return previous;
						return {
							...previous,
							rules: (previous.rules || []).filter((item) => item.id !== id),
							active: previous.active === id ? null : previous.active,
						};
					});
				} else {
					setNotice({ kind: "error", text: t("err.action", { action: "delete", error: (d && d.error) || "" }) });
				}
			})
			.catch((e) => setNotice({ kind: "error", text: t("err.action", { action: "delete", error: e.message }) }))
			.finally(() => setBusy(false));
	}, [rulesApi, t]);

	const createRule = () => {
		const id = newId.trim();
		if (!id) { setNotice({ kind: "error", text: t("need.id") }); return; }
		const name = newName.trim() || id;
		const target = newTarget;
		doPost("save", { id, content: "", name, target }, () => {
			setEditId(id);
			setEditName(name);
			setEditTarget(target);
			setContent("");
		});
		setNewId(""); setNewName(""); setNewTarget("AGENTS.md"); setCreating(false);
	};

	const policyValue = (st && typeof st.workspace_policy === "string") ? st.workspace_policy : "fallback";
	const policyOptions = (st && Array.isArray(st.workspace_policies) && st.workspace_policies.length) ? st.workspace_policies : ["fallback", "strict", "always"];
	const cwdCandidates = (st && Array.isArray(st.cwd_candidates)) ? st.cwd_candidates : [];
	const cwdValue = (st && typeof st.cwd === "string") ? st.cwd : "";
	const cwdPicked = cwdCandidates.filter((item) => item.selected).length;
	const ruleCount = (st && Array.isArray(st.rules)) ? st.rules.length : 0;
	const targetOptions = TARGETS.map((x) => ({ value: x, label: x }));

	/* 策略切换走乐观更新：先动本地，失败再回滚；成功也不重新拉 status，
	   避免选中态在「旧值 → 新值」之间闪一下。 */
	const setPolicy = useCallback((policy) => {
		const previous = policyValue;
		if (policy === previous || policyBusy.current) return;
		policyBusy.current = true;
		setSt((state) => (state ? { ...state, workspace_policy: policy } : state));
		rulesApi("set-policy", { policy })
			.then((d) => {
				if (d && d.ok) {
					setSt((state) => {
						if (!state) return state;
						return {
							...state,
							workspace_policy: typeof d.policy === "string" ? d.policy : policy,
							workspace_policies: Array.isArray(d.policies) ? d.policies : state.workspace_policies,
						};
					});
					setNotice({ kind: "ok", text: t("ok.done") });
				} else {
					setSt((state) => (state ? { ...state, workspace_policy: previous } : state));
					setNotice({ kind: "error", text: t("err.action", { action: "set-policy", error: (d && d.error) || "" }) });
				}
			})
			.catch((e) => {
				setSt((state) => (state ? { ...state, workspace_policy: previous } : state));
				setNotice({ kind: "error", text: t("err.action", { action: "set-policy", error: e.message }) });
			})
			.finally(() => { policyBusy.current = false; });
	}, [policyValue, rulesApi, t]);

	const ruleRows = !st
		? h("tr", null, h("td", { colSpan: 5, className: "clean9-rules-empty" }, "读取规则中…"))
		: (st.rules || []).length === 0
			? h("tr", null, h("td", { colSpan: 5, className: "clean9-rules-empty" }, t("rules.empty")))
			: st.rules.map((r) => {
				const isActive = r.id === st.active;
				const isEdit = r.id === editId;
				return h("tr", { key: r.id, className: "clean9-rules-row" + (isEdit ? " is-edit" : "") + (isActive ? " is-active" : "") },
					h("td", null, h("button", {
						type: "button", role: "button", className: "clean9-rules-name",
						onClick: () => openRule(r.id),
					}, ruleLabel(r))),
					h("td", { className: "clean9-rules-target" }, r.target),
					h("td", { className: "clean9-rules-size" }, formatSize(r.size)),
					h("td", null, isActive ? h("span", { className: "xsdsh-pill is-ok" }, t("pill.current")) : h("span", { className: "clean9-rules-muted" }, "—")),
					h("td", { className: "clean9-rules-ops" },
						h("span", { className: "clean9-ops-inline" },
							h(Btn, {
								tiny: true, kind: isActive ? undefined : "primary", disabled: busy || isActive,
								onClick: () => { if (!isActive) doPost("activate", { id: r.id }); },
							}, isActive ? t("btn.inUse") : t("btn.use")),
							h(Btn, {
								tiny: true, kind: "danger", disabled: busy,
								onClick: () => setConfirm({ kind: "delete", id: r.id }),
							}, t("delete")),
						),
					),
				);
			});

	return h("section", { className: "clean9-rules", "aria-label": t("rules.title") },
		h("div", { className: "clean9-rules-head" },
			h("p", null, t("clean.desc.rules")),
			h("span", { className: "clean9-rules-count" }, String(ruleCount)),
			h(Btn, {
				tiny: true, kind: "danger", disabled: busy,
				onClick: () => setConfirm({ kind: "reset" }),
			}, t("rules.reset")),
		),
		h("div", { className: "clean9-rules-policy" },
			h("span", { className: "clean9-rules-label" }, t("policy.title")),
			h("div", { className: "clean9-seg", role: "group", "aria-label": t("policy.title") },
				policyOptions.map((p) => h("button", {
					key: p, type: "button", "aria-pressed": policyValue === p, disabled: !st,
					onClick: () => setPolicy(p),
				}, t("policy." + p)))),
			h("span", { className: "clean9-rules-hint" }, t("policy.hint")),
		),
		h("details", { className: "clean9-rules-cwd" },
			h("summary", null, t("cwd.title") + " · " + (cwdPicked ? cwdPicked + " 项已启用" : "未启用")),
			h("div", { className: "clean9-rules-cwd-head" },
				cwdValue ? h("code", { className: "clean9-rules-cwd-path" }, cwdValue) : null,
				h(Btn, {
					tiny: true, disabled: busy,
					onClick: () => {
						let cwd = cwdValue;
						if (!cwd) { try { cwd = clientCurrentCwd?.() || ""; } catch (error) { setNotice({ kind: "error", text: String(error.message || error) }); return; } }
						doPost("scan-cwd", cwd ? { cwd: cwd } : {});
					},
				}, t("cwd.rescan")),
			),
			(!st || !cwdValue)
				? h("p", { className: "clean9-rules-empty" }, t("cwd.no.workspace"))
				: (cwdCandidates.length === 0
					? h("p", { className: "clean9-rules-empty" }, t("cwd.empty"))
					: h("div", { className: "xsdsh-cwd-list" }, cwdCandidates.map((item) => h("label", {
						key: item.path,
						className: "xsdsh-cwd-item" + (item.selected ? " is-on" : ""),
					},
						h("input", {
							type: "checkbox", checked: Boolean(item.selected), disabled: busy,
							onChange: (e) => doPost("toggle-cwd", { path: item.path, enabled: e.target.checked }),
						}),
						h("div", { className: "xsdsh-cwd-main" },
							h("div", { className: "xsdsh-cwd-name" },
								h("span", null, item.name),
								h("span", { className: "xsdsh-cwd-badge" }, t("cwd.scope." + (item.scope || "cwd"))),
								h("span", { className: "xsdsh-cwd-size" }, formatSize(item.size || 0)),
							),
							h("div", { className: "xsdsh-cwd-sub" }, item.path),
							item.preview ? h("div", { className: "xsdsh-cwd-prev" }, item.preview) : null,
						),
					)))),
			h("p", { className: "clean9-rules-hint" }, t("cwd.hint")),
		),
		h("div", { className: "xsdsh-split clean9-rules-body" },
			h("div", { className: "clean9-rules-list" },
				h("div", { className: "clean9-rules-list-head" },
					h("h4", null, t("rules.listTitle")),
					h(Btn, { tiny: true, disabled: busy, onClick: () => setCreating((value) => !value) }, "+ " + t("btn.create")),
				),
				creating ? h("div", { className: "clean9-rules-create" },
					h("div", { className: "clean9-rules-create-head" },
						h("strong", null, "新建规矩"),
						h("span", null, "填写 ID、名称和目标文件。"),
					),
					h("div", { className: "clean9-rules-create-fields" },
						h("label", { className: "clean9-field" },
							h("span", null, "ID"),
							h("input", { className: "xsdsh-field", "aria-label": t("ph.id"), placeholder: t("ph.id"), value: newId, disabled: busy, onChange: (e) => setNewId(e.target.value) }),
						),
						h("label", { className: "clean9-field" },
							h("span", null, "名称"),
							h("input", { className: "xsdsh-field", "aria-label": t("ph.alias"), placeholder: t("ph.alias"), value: newName, disabled: busy, onChange: (e) => setNewName(e.target.value) }),
						),
						h("label", { className: "clean9-field" },
							h("span", null, "目标文件"),
							h(PurgeSelect, { "aria-label": "新规矩目标", value: newTarget, onChange: setNewTarget, options: targetOptions, disabled: busy }),
						),
					),
					h("div", { className: "clean9-rules-create-actions" },
						h(Btn, { kind: "primary", tiny: true, disabled: busy, onClick: createRule }, t("btn.create")),
						h(Btn, { tiny: true, disabled: busy, onClick: () => setCreating(false) }, "取消"),
					),
				) : null,
				h("div", { className: "clean9-rules-scroll" },
					h("table", { className: "clean9-rules-table" },
						h("thead", null, h("tr", null,
							h("th", { scope: "col" }, "名称"),
							h("th", { scope: "col" }, "目标"),
							h("th", { scope: "col" }, "大小"),
							h("th", { scope: "col" }, "状态"),
							h("th", { scope: "col" }, "操作"))),
						h("tbody", null, ruleRows),
					),
				),
			),
			h("div", { className: "clean9-rules-editor" },
				editId ? [
					h("div", { key: "meta", className: "clean9-rules-editor-meta" },
						h("input", {
							className: "xsdsh-field", "aria-label": "规矩名称", placeholder: t("ph.alias.short"), value: editName,
							onChange: (e) => setEditName(e.target.value),
						}),
						h(PurgeSelect, { "aria-label": "规矩目标", size: "sm", value: editTarget, onChange: setEditTarget, options: targetOptions }),
					),
					h("textarea", {
						key: "body", className: "clean9-rules-area", value: content,
						onChange: (e) => setContent(e.target.value), placeholder: "",
						"aria-label": t("rules.listTitle"),
					}),
					h("div", { key: "save", className: "clean9-rules-save" },
						h(Btn, {
							kind: "primary", disabled: busy,
							onClick: () => doPost("save", { id: editId, content, name: editName, target: editTarget }),
						}, t("btn.saveRule")),
					),
				] : h("div", { className: "clean9-rules-empty" }, t("rules.pick")),
			),
		),
		h("div", { className: "clean9-rules-foot" }, noticeNode(notice)),
		confirm ? h(ConfirmDialog, {
			title: confirm.kind === "reset" ? t("rules.reset") : t("delete"),
			message: confirm.kind === "reset" ? t("rules.reset.confirm") : t("confirm.delete", { id: confirm.id }),
			confirmLabel: confirm.kind === "reset" ? t("rules.reset") : t("delete"),
			cancelLabel: "取消",
			danger: true,
			busy,
			onCancel: () => setConfirm(null),
			onConfirm: () => {
				const pending = confirm;
				setConfirm(null);
				if (pending.kind === "reset") {
					clearEditor();
					doPost("reset", {});
					return;
				}
				if (editId === pending.id) clearEditor();
				removeRule(pending.id);
			},
		}) : null,
	);
}
