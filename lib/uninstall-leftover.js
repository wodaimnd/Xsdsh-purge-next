/**
 * 读 helper 留下的卸载残留记录（`%TEMP%/Xsdsh-purge-next-uninstall-<pid>.json`）。
 *
 * 只读最近 24 小时内、`ok !== true` 且 `dirs` 非空的最新一份；
 * 坏 JSON、过期文件、成功记录都跳过。没有就返回 null。
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const LEFTOVER_PREFIX = "Xsdsh-purge-next-uninstall-";
export const LEFTOVER_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function readUninstallLeftover(tmpDir = os.tmpdir(), opts = {}) {
  const maxAge = Number.isFinite(opts.maxAgeMs) ? opts.maxAgeMs : LEFTOVER_MAX_AGE_MS;
  const now = Number.isFinite(opts.now) ? opts.now : Date.now();
  let names = [];
  try {
    names = fs.readdirSync(tmpDir);
  } catch {
    return null;
  }

  const candidates = [];
  for (const name of names) {
    if (!name.startsWith(LEFTOVER_PREFIX) || !name.endsWith(".json")) continue;
    const fp = path.join(tmpDir, name);
    try {
      const st = fs.statSync(fp);
      if (!st.isFile()) continue;
      if (now - st.mtimeMs > maxAge) continue;
      candidates.push({ fp, mtime: st.mtimeMs });
    } catch {
      /* 读不到就跳过 */
    }
  }
  candidates.sort((a, b) => b.mtime - a.mtime);

  for (const c of candidates) {
    try {
      const data = JSON.parse(fs.readFileSync(c.fp, "utf8"));
      const dirs = Array.isArray(data.dirs) ? data.dirs.filter((d) => d && d.path) : [];
      if (data.ok === true || dirs.length === 0) continue;
      return {
        path: c.fp,
        ts: typeof data.ts === "string" ? data.ts : new Date(c.mtime).toISOString(),
        pid: Number(data.pid) || 0,
        dirs,
        count: dirs.length,
      };
    } catch {
      /* 坏 JSON 继续看下一份 */
    }
  }
  return null;
}
