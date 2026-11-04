import { object, parseSnapshot, savePayload } from "./model";
import type { ConfigDraft, ConfigScope, ConfigSnapshot, JsonObject } from "./model";

export interface SaveFailure {
  saved: { config: boolean | null; metadata: boolean | null };
  recovery: string;
  cleanupErrors: string[];
}
export class ConfigRequestError extends Error {
  readonly partialSave: SaveFailure | null;
  constructor(result: JsonObject, status?: number) {
    const partial = result.partial_save === true || result.error_kind === "partial_save";
    const detail = typeof result.error === "string" ? result.error : typeof result.message === "string" ? result.message : "配置请求失败";
    super(`${partial ? "部分保存失败：已有内容写入磁盘。" : ""}${detail}${status ? `（HTTP ${status}）` : ""}`);
    const saved = result.saved && typeof result.saved === "object" ? result.saved as JsonObject : {};
    this.partialSave = partial ? {
      saved: { config: typeof saved.config === "boolean" ? saved.config : null, metadata: typeof saved.metadata === "boolean" ? saved.metadata : null },
      recovery: typeof result.recovery === "string" ? result.recovery : "请核实磁盘状态后重试保存。",
      cleanupErrors: Array.isArray(result.cleanup_errors) ? result.cleanup_errors.map(item => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return [item.path, item.error].filter(value => typeof value === "string").join("：");
        return "临时文件清理失败";
      }) : [],
    } : null;
  }
}
export type ConfigRequest = (payload: JsonObject, signal: AbortSignal) => Promise<unknown>;
export const requestConfig: ConfigRequest = async (payload, signal) => {
  const response = await fetch("/redteam/api", {
    method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), signal,
  });
  let result: JsonObject;
  try { result = object(await response.json(), "响应"); }
  catch { throw new Error(response.ok ? "服务器返回了无效的 JSON 响应" : `配置请求失败（HTTP ${response.status}）`); }
  if (!response.ok || result.ok !== true) {
    throw new ConfigRequestError(result, response.ok ? undefined : response.status);
  }
  return result;
};
export interface ConfigState {
  snapshot: ConfigSnapshot | null;
  draft: ConfigDraft | null;
  baseline: ConfigDraft | null;
  busy: "load" | "save" | null;
  error: string;
  retry: "load" | "save" | null;
  notice: string;
  repairConfirmed: boolean;
  partialSave: SaveFailure | null;
  /** 草稿是否与基线不同；随草稿更新一次算好，渲染时不再逐次序列化。 */
  dirty: boolean;
}
/** 逐字段比较，避免每次输入都 JSON.stringify 整份草稿（VPS 多时是主要开销）。 */
function draftChanged(a: ConfigDraft, b: ConfigDraft | null): boolean {
  if (!b) return false;
  if (a.fofa !== b.fofa || a.vps.length !== b.vps.length) return true;
  for (let index = 0; index < a.vps.length; index++) {
    const x = a.vps[index], y = b.vps[index];
    if (x.rowKey !== y.rowKey || x.name !== y.name || x.host !== y.host || x.port !== y.port || x.key !== y.key) return true;
  }
  return false;
}
/** 服务端可能给缺 id 的行补 id；把它回填到草稿，避免下一次保存又换一个新 id。 */
function mergeSavedIds(submitted: ConfigDraft, response: JsonObject): ConfigDraft {
  const rawConfig = response.config;
  const config = rawConfig && typeof rawConfig === "object" && !Array.isArray(rawConfig) ? rawConfig as JsonObject : null;
  const saved = config && Array.isArray(config.vps) ? config.vps : [];
  if (!saved.length) return submitted;
  const active = submitted.vps.filter(row => row.host.trim());
  const ids = new Map<string, string>();
  active.forEach((row, index) => {
    const item = saved[index];
    if (!item || typeof item !== "object" || Array.isArray(item)) return;
    const id = (item as JsonObject).id;
    if (typeof id === "string" && id) ids.set(row.rowKey, id);
  });
  let changed = false;
  const vps = submitted.vps.map(row => {
    const id = ids.get(row.rowKey);
    if (!id || id === row.id) return row;
    changed = true;
    return { ...row, id };
  });
  return changed ? { ...submitted, vps } : submitted;
}
/** A controller belongs to one explicit scope. Cancel also invalidates late, non-abortable responses. */
export function createConfigController(scope: ConfigScope, request: ConfigRequest = requestConfig) {
  let state: ConfigState = { snapshot: null, draft: null, baseline: null, busy: null, error: "", retry: null, notice: "", repairConfirmed: false, partialSave: null, dirty: false };
  let generation = 0;
  let active: AbortController | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<ConfigState>) => { state = { ...state, ...patch }; listeners.forEach(listener => listener()); };
  const cancel = () => { generation++; active?.abort(); if (timeout) clearTimeout(timeout); active = undefined; };
  const run = async (operation: "load" | "save") => {
    if (operation === "save" && (state.busy || !state.draft)) return;
    if (operation === "save" && state.snapshot?.vpsRepairRequired && !state.repairConfirmed) {
      publish({ error: "原 VPS 配置损坏；请先明确确认用编辑列表修复 / 替换，才能保存。", retry: null }); return;
    }
    if (scope.kind === "target" && !scope.engagement.trim()) {
      publish({ error: "请先选择目标", retry: null }); return;
    }
    let payload: JsonObject;
    const submitted = state.draft;
    try {
      payload = operation === "save" ? savePayload(scope, submitted!) : scope.kind === "global"
        ? { op: "platformConfigGet" } : { op: "engagementConfigGet", engagement: scope.engagement };
    } catch (error) {
      publish({ error: error instanceof Error ? error.message : "配置校验失败", retry: "save", notice: "" }); return;
    }
    cancel();
    const ticket = generation;
    const controller = new AbortController();
    active = controller;
    publish({ busy: operation, error: "", retry: null, notice: "" });
    timeout = setTimeout(() => {
      if (ticket !== generation) return;
      cancel();
      publish({ busy: null, error: operation === "save" ? "保存请求超时，服务器可能已写入；输入已保留，可重试保存或刷新核实。" : "加载配置超时，请重试。", retry: operation });
    }, 20000);
    try {
      const result = await request(payload, controller.signal);
      if (ticket !== generation || controller.signal.aborted) return;
      const response = object(result, "响应");
      if (response.ok !== true) throw new ConfigRequestError(response);
      const snapshot = parseSnapshot(response, scope);
      // Keep blank editing rows after saving, but derive effective state only from the server reply.
      const draft = operation === "save" ? mergeSavedIds(submitted!, response) : snapshot.draft;
      publish({ snapshot, draft, baseline: draft, busy: null, repairConfirmed: false, partialSave: null, dirty: false,
        notice: operation === "save" ? "配置已保存。生效来源已按服务器结果更新。" : "配置已加载。" });
    } catch (error) {
      if (ticket !== generation || controller.signal.aborted) return;
      publish({ busy: null, error: error instanceof Error ? error.message : "配置请求失败", retry: operation,
        partialSave: error instanceof ConfigRequestError && error.partialSave ? error.partialSave : state.partialSave });
    } finally {
      if (ticket === generation) { if (timeout) clearTimeout(timeout); active = undefined; }
    }
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    load: () => run("load"), save: () => run("save"), cancel,
    retry: () => run(state.retry || "load"),
    confirmRepair: (confirmed: boolean) => { if (!state.busy) publish({ repairConfirmed: confirmed }); },
    edit: (draft: ConfigDraft) => {
      if (state.busy) return;
      publish({ draft, notice: "", error: "", retry: null, dirty: draftChanged(draft, state.baseline),
        repairConfirmed: state.snapshot?.vpsRepairRequired
          ? JSON.stringify(draft.vps) === JSON.stringify(state.draft?.vps) && state.repairConfirmed
          : state.repairConfirmed });
    },
    isDirty: () => state.dirty,
  };
}
