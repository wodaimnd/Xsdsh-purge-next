import type { CleanStatus, Patch } from "./types";
export const buckets = ["applied", "pending", "skipped", "na", "missing", "unmatched", "unknown"] as const;
export type Bucket = typeof buckets[number];
export const bucketLabels: Record<Bucket, string> = { applied: "已应用", pending: "待应用", skipped: "跳过", na: "本端不需要", missing: "文件缺失", unmatched: "未匹配", unknown: "未知" };
export function bucket(status: string): Bucket {
  if (status === "applied" || status === "already") return "applied";
  if (status === "off" || status === "skipped") return "skipped";
  if (status === "missing" || status === "missing_file") return "missing";
  if (status === "pending" || status === "na" || status === "unmatched") return status;
  return "unknown";
}
export function patchRows(catalogue: Patch[], status: CleanStatus | null): Patch[] {
  return catalogue.map(row => ({ ...row, status: status?.patch_status?.[String(row.id)] || row.status || "unknown" }));
}
export function tally(rows: Patch[]) {
  const counts: Record<Bucket, number> = { applied: 0, pending: 0, skipped: 0, na: 0, missing: 0, unmatched: 0, unknown: 0 };
  for (const row of rows) counts[bucket(row.status)]++;
  return { ...counts, total: rows.length };
}
export function filterRows(rows: Patch[], search: string, state: Bucket | "all") {
  const query = search.trim().toLocaleLowerCase();
  return rows.filter(row => (state === "all" || bucket(row.status) === state) && (!query || [row.id, row.name, row.desc, row.file, row.layer].join(" ").toLocaleLowerCase().includes(query)));
}
export function selectedIds(rows: Patch[], selection: ReadonlySet<number>) { return rows.filter(row => selection.has(row.id)).map(row => row.id); }
export function hookState(status: CleanStatus | null): "dirty" | "applied_unrestarted" | "synced" | "unknown" {
  if (!status || status.status_unknown) return "unknown";
  if (status.hooks_deny_state === "dirty" || status.hooks_deny_state === "applied_unrestarted") return status.hooks_deny_state;
  if (status.restart_required === true) return "applied_unrestarted";
  return status.hooks_deny_state === "synced" ? "synced" : "unknown";
}
export const hookStateLabels = { dirty: "已保存，待应用", applied_unrestarted: "已应用，待重启", synced: "与宿主同步", unknown: "状态未知" };
export const HOOK_DESCRIPTION = "开启会关掉 DSH 的 Hook 拦截规则 · 改完需重启";
