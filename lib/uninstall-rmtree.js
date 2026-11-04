/**
 * 卸载 helper 的删除核心（standalone：只 import node 内建）。
 *
 * 为什么要单独成文件：`restart-desktop.js` / `uninstall-restart.js` 被整文件复制到
 * `%TEMP%` 后独立运行，不能 import 插件树里的模块。主进程复制本文件到 `%TEMP%`，
 * 把路径塞进 helper 的 payload（`helperCore`），helper 再动态 import 它。
 *
 * 删除失败不再静默：逐目录记录 attempts/error，写
 * `%TEMP%/Xsdsh-purge-next-uninstall-<pid>.json`，调用方用退出码 2 表示「有残留」。
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function sleepSync(ms) {
  if (!(ms > 0)) return;
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  } catch {
    const end = Date.now() + ms;
    while (Date.now() < end) { /* spin */ }
  }
}

function lstatOrNull(p) {
  try {
    return fs.lstatSync(p);
  } catch {
    return null;
  }
}

function defaultRemove(dir, opts) {
  fs.rmSync(dir, opts);
}

function removeOnce(dir, remove) {
  const st = lstatOrNull(dir);
  if (!st) return;
  if (st.isSymbolicLink()) {
    // junction / 符号链接只删入口，绝不递归进目标目录。
    try {
      fs.unlinkSync(dir);
    } catch {
      fs.rmdirSync(dir);
    }
    return;
  }
  remove(dir, { recursive: true, force: true, maxRetries: 0 });
}

/**
 * @returns {{ok:boolean, path:string, attempts:number, error:string, ms:number}}
 */
export function rmTreeReport(dir, opts = {}) {
  const attempts = Number.isInteger(opts.attempts) && opts.attempts > 0 ? opts.attempts : 25;
  const delayMs = Number.isFinite(opts.delayMs) && opts.delayMs >= 0 ? opts.delayMs : 200;
  const remove = typeof opts.remove === "function" ? opts.remove : defaultRemove;
  const sleep = typeof opts.sleep === "function" ? opts.sleep : sleepSync;
  const started = Date.now();
  let lastError = "";

  for (let i = 1; i <= attempts; i += 1) {
    try {
      removeOnce(dir, remove);
    } catch (e) {
      lastError = String(e && e.message ? e.message : e);
    }
    if (!lstatOrNull(dir)) {
      return { ok: true, path: dir, attempts: i, error: "", ms: Date.now() - started };
    }
    if (i < attempts) sleep(delayMs);
  }
  return {
    ok: false,
    path: dir,
    attempts,
    error: lastError || "still-present",
    ms: Date.now() - started,
  };
}

export function leftoverPathFor(tmpDir, pid = process.pid) {
  return path.join(tmpDir || os.tmpdir(), `Xsdsh-purge-next-uninstall-${pid}.json`);
}

function linkFirst(dirs) {
  const weight = (p) => (lstatOrNull(p)?.isSymbolicLink() ? 0 : 1);
  return dirs
    .map((p, i) => ({ p, i, w: weight(p) }))
    .sort((a, b) => (a.w - b.w) || (a.i - b.i))
    .map((x) => x.p);
}

/**
 * @param {string[]} dirs
 * @param {{tmpDir?:string, pid?:number, logPath?:string, attempts?:number, delayMs?:number,
 *          remove?:Function, sleep?:Function}} opts
 * @returns {{ok:boolean, failures:Array, leftoverPath:string}}
 */
export function removeCleanupDirs(dirs, opts = {}) {
  const tmpDir = opts.tmpDir || os.tmpdir();
  const pid = Number.isInteger(opts.pid) ? opts.pid : process.pid;
  const failures = [];
  const list = linkFirst((Array.isArray(dirs) ? dirs : []).filter(Boolean));

  for (const dir of list) {
    const r = rmTreeReport(dir, opts);
    if (!r.ok) {
      failures.push({ path: r.path, attempts: r.attempts, error: r.error, ms: r.ms });
    }
  }

  const lp = leftoverPathFor(tmpDir, pid);
  if (!failures.length) {
    try { fs.unlinkSync(lp); } catch { /* 没有旧记录 */ }
    return { ok: true, failures: [], leftoverPath: "" };
  }

  const payload = {
    schema: 1,
    ts: new Date().toISOString(),
    pid,
    ok: false, error: "rmtree-failed",
    log: opts.logPath || "",
    dirs: failures,
  };
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(lp, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  } catch {
    return { ok: false, error: "rmtree-failed", failures, leftoverPath: "" };
  }
  return { ok: false, error: "rmtree-failed", failures, leftoverPath: lp };
}
