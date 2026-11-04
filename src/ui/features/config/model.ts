export interface Vps { id?: string; name: string; host: string; port: number; key: string }
export interface VpsDraft { rowKey: string; id?: string; name: string; host: string; port: string; key: string }
export interface ConfigDraft { fofa: string; vps: VpsDraft[] }
export interface ConfigSnapshot {
  draft: ConfigDraft;
  effective: { fofa: string; vps: Vps[] } | null;
  sources: { fofa: string; vps: string } | null;
  updatedAt: string;
  legacyVps: boolean;
  vpsError: string;
  vpsRepairRequired: boolean;
}
export type ConfigScope = { kind: "global" } | { kind: "target"; engagement: string };
export type JsonObject = Record<string, unknown>;
export function object(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label}格式无效`);
  return value as JsonObject;
}
function text(value: unknown): string { return typeof value === "string" ? value : ""; }
let rowSequence = 0;
const VPS_ID_RE = /^[\w.-]+$/;
/** runtime_config 的 vps_id 依赖稳定 id；UI 新建行在第一次保存前就带上。 */
function nextVpsId(): string {
  const cryptoApi = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  const uuid = typeof cryptoApi?.randomUUID === "function" ? cryptoApi.randomUUID() : "";
  if (VPS_ID_RE.test(uuid)) return uuid;
  return `vps-${Date.now().toString(36)}-${++rowSequence}`;
}
function emptyVpsRow(): VpsDraft {
  return { rowKey: `vps-${++rowSequence}`, name: "", host: "", port: "22", key: "" };
}
export function newVpsRow(): VpsDraft {
  return { ...emptyVpsRow(), id: nextVpsId() };
}
/** 主机里写 host:port 是最常见的误填；放行方括号 IPv6 与 bare IPv6，其余冒号按端口处理。 */
function hasInlinePort(host: string): boolean {
  const at = host.lastIndexOf("@");
  const address = at >= 0 ? host.slice(at + 1) : host;
  if (address.startsWith("[") && address.endsWith("]")) return false;
  const colons = (address.match(/:/g) || []).length;
  if (colons === 0) return false;
  if (colons >= 2 && /^[0-9a-f:.]+$/i.test(address)) return false;
  return true;
}
function readRows(value: unknown, assignIds = false): VpsDraft[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error("VPS 列表格式无效");
  return value.map(value => {
    const row = object(value, "VPS");
    const id = typeof row.id === "string" && row.id ? row.id : (assignIds ? nextVpsId() : undefined);
    return { ...emptyVpsRow(), ...(id ? { id } : {}),
      name: text(row.name), host: text(row.host), port: String(row.port ?? 22), key: text(row.key) };
  });
}
export function serializeVps(rows: VpsDraft[]): Vps[] {
  const active = rows.filter(row => row.host.trim());
  if (active.length > 100) throw new Error("VPS 最多保存 100 台");
  const ids = new Set<string>();
  return active.map((row, index) => {
    const host = row.host.trim();
    const portText = row.port.trim() || "22";
    const port = Number(portText);
    if (!/^\d+$/.test(portText) || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`第 ${index + 1} 台 VPS 的端口须为 1–65535`);
    if (/\s|[/?#]/.test(host)) throw new Error(`第 ${index + 1} 台 VPS 请填写主机或 user@host，端口单独填写`);
    if (hasInlinePort(host)) throw new Error(`第 ${index + 1} 台 VPS 请把端口填到端口列，主机里不要写 host:port`);
    const key = row.key.trim();
    if (key && (!/^(?:[A-Za-z]:[\\/]|\/|\\\\)/.test(key) || /[\r\n]|-----BEGIN/.test(key))) {
      throw new Error(`第 ${index + 1} 台 VPS 的私钥请填写绝对路径，不要粘贴私钥内容`);
    }
    if (/[\u0000-\u001f\u007f]/.test(row.name + host + key)) throw new Error(`第 ${index + 1} 台 VPS 含无效控制字符`);
    let id = row.id && VPS_ID_RE.test(row.id) && !ids.has(row.id) ? row.id : nextVpsId();
    while (ids.has(id)) id = nextVpsId();
    ids.add(id);
    return { id, name: row.name.trim(), host, port, key };
  });
}
export function savePayload(scope: ConfigScope, draft: ConfigDraft): JsonObject {
  const vps = serializeVps(draft.vps);
  const fofa = draft.fofa.trim();
  if (/[\u0000-\u001f\u007f]/.test(fofa)) throw new Error("FOFA_KEY 不能包含换行或控制字符");
  if (scope.kind === "global") return { op: "platformConfigSave", config: { env: { FOFA_KEY: fofa }, vps } };
  if (!scope.engagement.trim()) throw new Error("请先选择目标");
  return { op: "engagementConfigSave", engagement: scope.engagement, config: { fofa_key: fofa, vps } };
}
export function parseSnapshot(value: unknown, scope: ConfigScope): ConfigSnapshot {
  const result = object(value, "响应");
  if (result.ok !== true) throw new Error(text(result.error) || "配置请求失败");
  if (scope.kind === "target" && result.engagement !== scope.engagement) throw new Error("返回的目标与当前目标不一致，请重试");
  const config = object(result.config, "配置");
  if (config.error) throw new Error(`配置读取失败：${text(config.error) || "文件无效"}`);
  const env = scope.kind === "global" ? object(config.env ?? {}, "环境配置") : {};
  const compatibility = result.compatibility ? object(result.compatibility, "兼容信息") : {};
  const invalidLocalVps = !!config.vps_error || Object.prototype.hasOwnProperty.call(config, "vps_invalid");
  const vpsError = text(config.vps_error) || text(compatibility.vps_error) || (invalidLocalVps ? "已保存的 VPS 格式无效" : "");
  // Old platform summaries have no effective/sources. Do not invent runtime state from saved fields.
  const effective = result.effective ? object(result.effective, "生效配置") : null;
  const sources = result.sources ? object(result.sources, "配置来源") : null;
  if (scope.kind === "target" && (!effective || !sources)) throw new Error("目标配置响应缺少生效配置或来源，请重试");
  return {
    vpsError, vpsRepairRequired: invalidLocalVps || (scope.kind === "global" && !!vpsError),
    draft: { fofa: text(scope.kind === "global" ? env.FOFA_KEY : config.fofa_key), vps: invalidLocalVps ? [] : readRows(config.vps, true) },
    effective: effective ? { fofa: text(effective.fofa_key), vps: readRows(effective.vps).filter(row => row.host.trim()).map(row => ({
      ...(row.id ? { id: row.id } : {}), name: row.name, host: row.host, port: Number(row.port), key: row.key,
    })) } : null,
    sources: sources ? { fofa: text(sources.fofa_key), vps: text(sources.vps) } : null,
    updatedAt: text(config.updated_at), legacyVps: compatibility.vps_format === "legacy" || (!Array.isArray(config.vps) && !!text(env.REDTEAM_VPS_HOST)),
  };
}
export function sourceLabel(source: string): string {
  return ({ target: "本目标", global: "全局配置", process: "兼容来源 · 进程环境", dotenv: "兼容来源 · .env", none: "未配置" } as Record<string, string>)[source] || `未知来源（${source || "未返回"}）`;
}
export function draftEqual(a: ConfigDraft, b: ConfigDraft): boolean {
  const plain = (draft: ConfigDraft) => ({ ...draft, vps: draft.vps.map(({ rowKey: _rowKey, ...row }) => row) });
  return JSON.stringify(plain(a)) === JSON.stringify(plain(b));
}
