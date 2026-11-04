import type { CleanRuntime, CleanStatus, JsonRecord, Patch } from "./types";

export function record(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("接口返回格式错误");
  return value as JsonRecord;
}
export function errorText(error: unknown): string { return error instanceof Error ? error.message : String(error); }
export function checked(value: unknown): JsonRecord {
  const data = record(value);
  if (data.ok !== true) throw new Error(String(data.error || "请求失败"));
  return data;
}
export function postBody(body: JsonRecord): RequestInit {
  return { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}
export function createCleanApi(runtime: CleanRuntime) {
  let statusFlight: Promise<CleanStatus> | null = null;
  const get = async (route: string) => checked(await runtime.apiJson("/Xsdsh-purge/" + route));
  const post = async (route: string, body: JsonRecord) => checked(await runtime.apiJson("/Xsdsh-purge/" + route, postBody(body)));
  return {
    get, post,
    status(): Promise<CleanStatus> {
      if (!statusFlight) statusFlight = (runtime.statusApi ? runtime.statusApi() : runtime.apiJson("/Xsdsh-purge/status"))
        .then(value => checked(value) as CleanStatus).finally(() => { statusFlight = null; });
      return statusFlight;
    },
    async catalogue(): Promise<Patch[]> {
      const data = await get("patches");
      if (!Array.isArray(data.patches)) throw new Error("补丁目录缺少 patches 列表");
      return data.patches.map(value => {
        const item = record(value);
        if (!Number.isSafeInteger(item.id) || Number(item.id) <= 0) throw new Error("补丁目录含非法 ID");
        return { id: Number(item.id), name: String(item.name || ""), desc: String(item.desc || ""), layer: String(item.layer || "未分层"), status: String(item.status || "unknown"), file: String(item.file || ""), applicable: item.applicable !== false, enabled: item.enabled !== false };
      });
    },
    // Read the HTTP error body as well: legacy apiJson throws away busy/409 metadata.
    async action(route: "apply" | "revert" | "uninstall" | "cleanup-residue", body: JsonRecord): Promise<JsonRecord> {
      const controller = new AbortController();
      const timeout = route === "apply" ? 600000 : route === "uninstall" ? 90000 : 120000;
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await (runtime.fetch || fetch)("/Xsdsh-purge/" + route, { ...postBody(body), cache: "no-store", credentials: "same-origin", signal: controller.signal });
        const data = record(await response.json());
        if (!response.ok && data.busy !== true && !data.error) data.error = "HTTP " + response.status;
        if (!response.ok) data.ok = false;
        return data;
      } catch (error) {
        if (controller.signal.aborted) throw new Error("timeout");
        throw error;
      } finally { clearTimeout(timer); }
    },
  };
}
export type CleanApi = ReturnType<typeof createCleanApi>;
