import type { CleanStatus, JsonRecord } from "./types";

export function reportedCount(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}
export function backupLabel(status: CleanStatus | null): string {
  if (!status || status.ok !== true || status.status_unknown) return "未知";
  const count = reportedCount(status.backup_count);
  if (count !== null) return `${count} 个备份文件`;
  return (status.has_backup === true ? "有备份" : status.has_backup === false ? "无备份" : "备份状态未知") + " · 数量未知";
}
function object(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : null;
}
export interface RevertRow { path: string; outcome: string; detail: string }
export interface RevertReport {
  available: boolean;
  counts: { reverted: number | null; noBackup: number | null; alreadyOriginal: number | null; errors: number | null };
  rows: RevertRow[];
  unpacked: { restored: number | null; alreadyRestored: number | null; asar: string; root: string; error: string } | null;
}
export function revertReport(data: JsonRecord): RevertReport {
  const details = object(data.details);
  const summary = object(data.summary) || object(details?.summary);
  const rows: RevertRow[] = [];
  const addPaths = (value: unknown, outcome: string, detail = "") => {
    if (Array.isArray(value)) for (const path of value) {
      if (typeof path === "string" && path) rows.push({ path, outcome, detail });
    }
  };
  addPaths(details?.reverted, "已还原");
  addPaths(details?.noBackup, "无备份，跳过");
  addPaths(details?.alreadyOriginal, "已是原版");
  addPaths(details?.preservedUser, "保留用户文件");
  if (Array.isArray(details?.errors)) for (const entry of details.errors) {
    if (Array.isArray(entry) && typeof entry[0] === "string") rows.push({ path: entry[0], outcome: "还原失败", detail: String(entry[1] ?? "未提供错误原因") });
  }
  const fast = object(details?.unpacked);
  if (fast) {
    addPaths(fast.deleted, "已删除解包副本", "归档元数据还原后的清理结果，不等同于文件备份还原");
    addPaths(fast.leftover, "解包副本残留", "未删除，请查看后端还原结果");
    addPaths(fast.deletedBaks, "已删除备份");
    addPaths(fast.leftoverBaks, "备份残留");
    addPaths(fast.noRecord, "无快通道记录");
  }
  const shim = object(data.shim);
  if (shim) for (const [directory, value] of Object.entries(shim)) {
    const files = object(value);
    if (!files) continue;
    for (const [file, outcome] of Object.entries(files)) {
      if (typeof outcome === "string") rows.push({ path: directory.replace(/[\\/]$/, "") + "/" + file, outcome: "shim · " + outcome, detail: "" });
    }
  }
  return {
    available: details !== null,
    counts: {
      reverted: reportedCount(summary?.reverted) ?? reportedCount(data.reverted),
      noBackup: reportedCount(summary?.noBackup) ?? reportedCount(data.no_backup),
      alreadyOriginal: reportedCount(summary?.alreadyOriginal) ?? reportedCount(data.already_original),
      errors: reportedCount(summary?.errors) ?? reportedCount(data.errors),
    },
    rows,
    unpacked: fast ? {
      restored: reportedCount(fast.restored), alreadyRestored: reportedCount(fast.alreadyRestored),
      asar: typeof fast.asar === "string" ? fast.asar : "",
      root: typeof fast.root === "string" ? fast.root : "",
      error: typeof fast.error === "string" ? fast.error : "",
    } : null,
  };
}
