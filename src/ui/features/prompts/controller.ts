export const PROMPT_MODES = [{ id: "redteam", label: "红队模式" }, { id: "reverse", label: "逆向模式" }] as const;
export type PromptMode = typeof PROMPT_MODES[number]["id"];
export interface PromptRecord { id: PromptMode; current: string; builtin: string; isCustom: boolean; savedAt: string; error?: string }
export type PromptConfirmation = { kind: "switch"; target: PromptMode } | { kind: "reset"; all: boolean } | null;
export interface PromptsSnapshot {
  active: PromptMode; records: Partial<Record<PromptMode, PromptRecord>>; drafts: Partial<Record<PromptMode, string>>;
  loading: boolean; busy: boolean; message: string; error: boolean; confirmation: PromptConfirmation;
}
const messageOf = (error: unknown) => error instanceof Error ? error.message : String(error);
const validMode = (id: string): id is PromptMode => PROMPT_MODES.some(mode => mode.id === id);
const canonical = (text: string) => text.replace(/\r\n/g, "\n").replace(/[\r\n]+$/, "");
export function createPromptsController(request: typeof fetch = globalThis.fetch.bind(globalThis)) {
  let state: PromptsSnapshot = { active: "redteam", records: {}, drafts: {}, loading: false, busy: false, message: "", error: false, confirmation: null };
  const listeners = new Set<() => void>();
  let generation = 0;
  let disposed = false;
  const emit = (patch: Partial<PromptsSnapshot>) => { if (!disposed) { state = { ...state, ...patch }; listeners.forEach(listener => listener()); } };
  const dirty = (id: PromptMode = state.active) => state.records[id] !== undefined && state.drafts[id] !== undefined && state.drafts[id] !== state.records[id]?.current;
  const api = async (body?: object) => {
    const response = await request("/Xsdsh-purge/prompts", { credentials: "same-origin", cache: "no-store", headers: { accept: "application/json", ...(body ? { "content-type": "application/json" } : {}) }, ...(body ? { method: "POST", body: JSON.stringify(body) } : {}) });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) throw new Error(data?.error || `HTTP ${response.status}`);
    return data;
  };
  const load = async () => {
    if (disposed || state.busy || state.confirmation) return;
    const ticket = ++generation;
    emit({ loading: true, message: "", error: false });
    try {
      const data = await api();
      if (disposed || ticket !== generation) return;
      if (!Array.isArray(data.presets)) throw new Error("提示词响应缺少模式列表。");
      const records: PromptsSnapshot["records"] = {};
      const drafts = { ...state.drafts };
      for (const mode of PROMPT_MODES) {
        const item = data.presets.find((entry: { id?: string } | null) => entry?.id === mode.id);
        const previous = state.records[mode.id];
        if (!item || item.ok === false || typeof item.current !== "string" || typeof item.builtin !== "string") {
          records[mode.id] = { id: mode.id, current: previous?.current ?? "", builtin: previous?.builtin ?? "", isCustom: previous?.isCustom ?? false, savedAt: previous?.savedAt ?? "", error: item?.error || "模式提示词不可用" };
        } else {
          records[mode.id] = { id: mode.id, current: item.current, builtin: item.builtin, isCustom: item.isCustom === true, savedAt: typeof item.savedAt === "string" ? item.savedAt : "" };
          if (!dirty(mode.id)) drafts[mode.id] = item.current;
        }
      }
      emit({ records, drafts });
    } catch (error) { if (ticket === generation) emit({ error: true, message: `读取失败：${messageOf(error)}` }); }
    finally { if (ticket === generation) emit({ loading: false }); }
  };
  const reset = async (all: boolean) => {
    if (disposed || state.busy || state.loading) return;
    const ids = all ? PROMPT_MODES.map(mode => mode.id) : [state.active];
    const ticket = ++generation;
    emit({ busy: true, confirmation: null, message: "", error: false });
    const succeeded: string[] = [];
    const failed: string[] = [];
    for (const id of ids) {
      if (disposed || ticket !== generation) break;
      const record = state.records[id];
      try {
        if (!record || record.error) throw new Error(record?.error || "尚未读取");
        await api({ action: "reset", id });
        if (disposed || ticket !== generation) break;
        const current = canonical(record.builtin);
        emit({ records: { ...state.records, [id]: { ...record, current, isCustom: false, savedAt: "" } }, drafts: { ...state.drafts, [id]: current } });
        succeeded.push(PROMPT_MODES.find(mode => mode.id === id)!.label);
      } catch (error) { failed.push(`${PROMPT_MODES.find(mode => mode.id === id)!.label}：${messageOf(error)}`); }
    }
    if (ticket === generation) emit({ busy: false, error: failed.length > 0, message: [succeeded.length ? `${succeeded.join("、")}已恢复默认，完全退出并重启后生效。` : "", failed.length ? `恢复失败，输入已保留：${failed.join("；")}` : ""].filter(Boolean).join(" ") });
  };
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    isDirty: dirty, load,
    edit(text: string) { if (!disposed && !state.busy && !state.loading && !state.confirmation && state.records[state.active] && !state.records[state.active]?.error) emit({ drafts: { ...state.drafts, [state.active]: text }, message: "", error: false }); },
    switchTo(id: PromptMode) {
      if (!validMode(id) || disposed || state.busy || state.loading || state.confirmation || id === state.active) return;
      if (dirty()) emit({ confirmation: { kind: "switch", target: id } });
      else emit({ active: id, message: "", error: false });
    },
    requestReset(all = false) { if (!disposed && !state.busy && !state.loading && !state.confirmation) emit({ confirmation: { kind: "reset", all } }); },
    cancelConfirmation() { emit({ confirmation: null }); },
    async confirm() {
      const confirmation = state.confirmation;
      if (!confirmation || state.busy || state.loading) return;
      if (confirmation.kind === "switch") {
        emit({ drafts: { ...state.drafts, [state.active]: state.records[state.active]?.current ?? "" }, active: confirmation.target, confirmation: null, message: "", error: false });
      } else await reset(confirmation.all);
    },
    async save() {
      if (disposed || state.busy || state.loading || state.confirmation) return;
      const id = state.active;
      const record = state.records[id];
      if (!record || record.error) return;
      const text = state.drafts[id] ?? "";
      if (!text.trim()) { emit({ error: true, message: "提示词不能为空；输入未保存。" }); return; }
      const ticket = ++generation;
      emit({ busy: true, message: "", error: false });
      try {
        await api({ action: "save", id, text });
        if (disposed || ticket !== generation) return;
        // Existing endpoint acknowledges writes without returning a record. Do not stamp a fabricated savedAt.
        const current = canonical(text);
        emit({ records: { ...state.records, [id]: { ...record, current, isCustom: true, savedAt: "" } }, drafts: { ...state.drafts, [id]: current }, message: "已保存到覆盖文件，完全退出并重启后生效。" });
      } catch (error) { if (ticket === generation) emit({ error: true, message: `保存失败，输入已保留：${messageOf(error)}` }); }
      finally { if (ticket === generation) emit({ busy: false }); }
    },
    dispose() { disposed = true; ++generation; listeners.clear(); },
  };
}
export type PromptsController = ReturnType<typeof createPromptsController>;
