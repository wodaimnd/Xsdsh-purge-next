/**
 * 重启 / 卸载 helper 的日志诊断（只读）。
 *
 * 【为什么需要】
 *
 * `lib/restart-desktop.js`、`lib/uninstall-restart.js` 都是 detached 子进程，
 * stdio 是 ignore：宿主一退出，它们的 stdout/stderr 没有任何人接。失败时用户
 * 手里唯一能说明「死在哪一步」的就是它们自己往 `%TEMP%` 写的日志。过去这个
 * 路径只在桌面换包分支（`asar_swap_log`）里透出，普通重启 / 卸载清理的日志
 * 用户根本不知道在哪。
 *
 * 本模块只做一件事：把日志的**路径 + 尾部若干行**读成结构化数据，供 `/status`
 * 直接返回。不写文件、不清理、不解析业务语义。
 *
 * 【为什么要限制读取量】
 *
 * `/status` 是高频轮询。日志是 append-only 的，跑上几个月可能到 MB 级；
 * 每次都整文件读会白白拖慢面板。这里只读尾部 `maxBytes`（默认 8 KB），
 * 再从里面取最后 `maxLines` 行，单次成本恒定。
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** helper 日志文件名。`lib/desktop.js` 里的常量与本表必须一致（测试会比对）。 */
export const RESTART_LOG_FILES = {
  desktop: "Xsdsh-purge-next-restart-desktop.log",
  web: "Xsdsh-purge-next-restart-web.log",
  asar_swap: "Xsdsh-purge-next-asar-swap.log",
  official: "Xsdsh-purge-next-official-restart.log",
};

/**
 * 读一个日志文件的尾部。
 *
 * @param {string} fp 文件路径
 * @param {{maxLines?:number, maxBytes?:number}} [opts]
 * @returns {{path:string, exists:boolean, size:number, mtime:number, lines:string[], truncated:boolean, error:string}}
 */
export function readLogTail(fp, opts = {}) {
  const maxLines = Math.max(1, Number(opts.maxLines) || 12);
  const maxBytes = Math.max(256, Number(opts.maxBytes) || 8192);
  const out = {
    path: String(fp || ""),
    exists: false,
    size: 0,
    mtime: 0,
    lines: [],
    truncated: false,
    error: "",
  };
  if (!out.path) {
    out.error = "no-path";
    return out;
  }
  let st;
  try {
    st = fs.statSync(out.path);
  } catch {
    // 文件不存在是正常状态（helper 没跑过 / 系统清过 TEMP），不算错误。
    return out;
  }
  if (!st.isFile()) {
    out.error = "not-file";
    return out;
  }
  out.exists = true;
  out.size = st.size;
  out.mtime = st.mtimeMs;

  const start = Math.max(0, st.size - maxBytes);
  out.truncated = start > 0;
  let text = "";
  try {
    const fd = fs.openSync(out.path, "r");
    try {
      const buf = Buffer.alloc(st.size - start);
      if (buf.length > 0) fs.readSync(fd, buf, 0, buf.length, start);
      text = buf.toString("utf8");
    } finally {
      fs.closeSync(fd);
    }
  } catch (e) {
    out.error = String(e && e.message ? e.message : e);
    return out;
  }
  // 从中间切进来时第一行可能只有半截，丢掉它，避免把半个时间戳当成证据。
  if (start > 0) {
    const nl = text.indexOf("\n");
    text = nl >= 0 ? text.slice(nl + 1) : "";
  }
  out.lines = text.split(/\r?\n/).filter((line) => line.trim()).slice(-maxLines);
  return out;
}

/**
 * 收集四份 helper 日志的尾部。
 *
 * @param {string} [tmpDir] 默认 `os.tmpdir()`（与 helper 的 `process.env.TEMP || TMPDIR` 同源）
 * @param {{maxLines?:number, maxBytes?:number}} [opts]
 */
export function restartDiagnostics(tmpDir, opts = {}) {
  const dir = String(tmpDir || "").trim() || os.tmpdir();
  const logs = {};
  for (const [key, name] of Object.entries(RESTART_LOG_FILES)) {
    logs[key] = readLogTail(path.join(dir, name), opts);
  }
  return { tmp_dir: dir, logs };
}
