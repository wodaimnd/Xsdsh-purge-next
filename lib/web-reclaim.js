/**
 * 找回「上一次被这次重启挤掉的 dsh web 服务」。
 *
 * 背景：本插件装/卸之后要重启宿主，而重启脚本是新的子进程；新进程起来时旧进程
 * 可能还占着端口。如果直接 `kill` 掉旧的，用户的浏览器标签就停在死页面上，且
 * 用户不知道发生了什么。这个模块的做法是：apply 时把「我现在占的端口 + 宿主 pid」
 * 落一条记录；下次启动后发现记录里的那个进程还在、且确实是 `dsh web`，就交给调用方
 * 决定是提示还是回收。
 *
 * 两条硬约束：
 *   1. **不许 import core.js**（core 会 import 本模块，反向就成环），本文件只依赖 node 内置。
 *   2. **记录目录用本插件自己的数据目录**（`Xsdsh-purge-core`），不能写上游原版的
 *      `dsh-purge` —— 同一台机器上原版 4.6.11-alpha 与本插件并存，共用目录会互相删记录。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

/** 记录目录名（在 `$DSH_HOME` 下）。与 `lib/core.js` 的数据目录一致。 */
export const RECORD_DIR = "Xsdsh-purge-core";

/** 记录文件的子目录与文件名前缀。 */
export const RECORD_SUBDIR = "web";
export const RECORD_PREFIX = "web-server-";

/** 认一个进程是不是宿主 CLI：命令行里出现 `@deepseek-ai/dsh/lib/bin.js`。 */
const DSH_BIN_PATTERN = /@deepseek-ai[\\/]dsh[\\/]lib[\\/]bin\.js/;

/**
 * 跑一个命令拿输出，失败返回空串。
 * 这里不放 catch 到调用点：命令不存在（macOS 没 ss、Linux 没 netstat）是常态，
 * 让上层看到空串自然降级，比每个调用点写一遍 try 干净。
 * @param {string} file
 * @param {string[]} args
 * @returns {string}
 */
function run(file, args) {
  try {
    return execFileSync(file, args, { encoding: "utf8", timeout: 8000, windowsHide: true, stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

/**
 * 记录文件路径。一个端口一份，避免并发 web 实例互相覆盖。
 * @param {string} dshHome
 * @param {number} port
 * @returns {string}
 */
export function recordPath(dshHome, port) {
  return path.join(dshHome, RECORD_DIR, RECORD_SUBDIR, `${RECORD_PREFIX}${port}.json`);
}

/**
 * 落一条记录：本端口当前由哪个 pid 提供服务。
 * @param {{ dshHome: string, port: number|string, pid: number, url?: string, at?: string }} info
 * @returns {{ path: string, ok: boolean }}
 */
export function writeRecord(info) {
  const home = String(info?.dshHome || "");
  const port = Number(info?.port);
  if (!home) return { path: "", ok: false, error: "no-home" };
  if (!Number.isFinite(port) || port <= 0) return { path: "", ok: false, error: "bad-port" };
  const fp = recordPath(home, port);
  const payload = {
    port,
    pid: Number(info?.pid) || 0,
    url: String(info?.url || ""),
    at: info?.at || new Date().toISOString(),
    mark: "Xsdsh-purge-next",
  };
  try {
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, JSON.stringify(payload, null, 2), "utf8");
    return { path: fp, ok: true };
  } catch (error) {
    return { path: fp, ok: false, error: "write-failed", detail: String(error && error.message ? error.message : error) };
  }
}

/**
 * 读回记录。坏文件当作没有。
 * @param {string} fp
 * @returns {{ port: number, pid: number, url: string, at: string } | null}
 */
export function readRecord(fp) {
  try {
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    if (!data || typeof data !== "object") return null;
    return { port: Number(data.port) || 0, pid: Number(data.pid) || 0, url: String(data.url || ""), at: String(data.at || "") };
  } catch {
    return null;
  }
}

/**
 * 这个 pid 还在不在。
 * @param {number} pid
 * @returns {boolean}
 */
export function isAlive(pid) {
  const n = Number(pid);
  if (!Number.isFinite(n) || n <= 0) return false;
  try {
    process.kill(n, 0);
    return true;
  } catch (error) {
    // EPERM 说明进程存在但不是我造的，也算活着。
    return Boolean(error && error.code === "EPERM");
  }
}

/**
 * 读一个进程的完整命令行。
 * Linux 读 `/proc/<pid>/cmdline`；Windows 走 CIM；macOS 退 `ps`。
 * @param {number} pid
 * @returns {string}
 */
export function processCommandLine(pid) {
  const n = Number(pid);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (process.platform === "linux") {
    try {
      return fs.readFileSync(`/proc/${n}/cmdline`, "utf8").replace(/\0/g, " ").trim();
    } catch {
      return "";
    }
  }
  if (process.platform === "win32") {
    return run("powershell", ["-NoProfile", "-Command", `(Get-CimInstance Win32_Process -Filter 'ProcessId=${n}').CommandLine`]).trim();
  }
  return run("ps", ["-o", "command=", "-p", String(n)]).trim();
}

/**
 * 这个命令行看起来是不是宿主 CLI 的 `dsh web`。
 * 宽松匹配：先要命中 bin.js 路径，再要出现 `web` 子命令。
 * @param {string} cmd
 * @returns {boolean}
 */
export function looksLikeDshWeb(cmd) {
  const text = String(cmd || "");
  if (!text) return false;
  return DSH_BIN_PATTERN.test(text) && /(^|[\s"'=])web($|[\s"'])/.test(text);
}

/**
 * 解析 `netstat -ano` 的 LISTENING 行（Windows）。
 * 例：`  TCP    0.0.0.0:24838    0.0.0.0:0    LISTENING    1234`
 * @param {string} text
 * @returns {Array<{ port: number, pid: number }>}
 */
export function parseNetstatListeners(text) {
  const out = [];
  for (const line of String(text || "").split(/\r?\n/)) {
    if (!/LISTENING/i.test(line)) continue;
    const cols = line.trim().split(/\s+/);
    if (cols.length < 5) continue;
    const local = cols[1];
    const idx = local.lastIndexOf(":");
    if (idx <= 0) continue;
    const port = Number(local.slice(idx + 1));
    const pid = Number(cols[cols.length - 1]);
    if (Number.isFinite(port) && port > 0) out.push({ port, pid: Number.isFinite(pid) ? pid : 0 });
  }
  return out;
}

/**
 * 解析 `ss -ltnp` 的行（Linux）。
 * 例：`LISTEN 0 128 0.0.0.0:24838 0.0.0.0:* users:(("node",pid=1234,fd=20))`
 * @param {string} text
 * @returns {Array<{ port: number, pid: number }>}
 */
export function parseSsListeners(text) {
  const out = [];
  for (const line of String(text || "").split(/\r?\n/)) {
    if (!/^LISTEN/i.test(line.trim())) continue;
    const cols = line.trim().split(/\s+/);
    const local = cols[3] || "";
    const idx = local.lastIndexOf(":");
    if (idx <= 0) continue;
    const port = Number(local.slice(idx + 1).replace(/[^\d]/g, ""));
    const m = /pid=(\d+)/.exec(line);
    if (Number.isFinite(port) && port > 0) out.push({ port, pid: m ? Number(m[1]) : 0 });
  }
  return out;
}

/**
 * 解析 `lsof -nP -iTCP -sTCP:LISTEN` 的行（macOS / 兜底）。
 * 例：`node    1234 user   20u  IPv4 0x1  0t0  TCP *:24838 (LISTEN)`
 * @param {string} text
 * @returns {Array<{ port: number, pid: number }>}
 */
export function parseLsofPids(text) {
  const out = [];
  for (const line of String(text || "").split(/\r?\n/)) {
    if (!/\(LISTEN\)/.test(line)) continue;
    const cols = line.trim().split(/\s+/);
    if (cols.length < 9) continue;
    const pid = Number(cols[1]);
    const nameCol = cols.find((c) => /:\d+$/.test(c));
    if (!nameCol) continue;
    const port = Number(nameCol.slice(nameCol.lastIndexOf(":") + 1));
    if (Number.isFinite(port) && port > 0) out.push({ port, pid: Number.isFinite(pid) ? pid : 0 });
  }
  return out;
}

/**
 * 当前所有监听端口 → pid。
 * @returns {Map<number, number>}
 */
export function listenerPids() {
  const rows = [];
  if (process.platform === "win32") rows.push(...parseNetstatListeners(run("netstat", ["-ano"])));
  else rows.push(...parseSsListeners(run("ss", ["-ltnp"])));
  if (!rows.length) rows.push(...parseLsofPids(run("lsof", ["-nP", "-iTCP", "-sTCP:LISTEN"])));
  const map = new Map();
  for (const row of rows) if (!map.has(row.port)) map.set(row.port, row.pid);
  return map;
}

/**
 * 扫一遍记录，找出「记录里的 pid 还活着、确实还在服务、且确实是 dsh web」的条目。
 * 这是给面板提示用的只读视图，不做任何杀进程动作。
 * @param {{ dshHome: string, skipPid?: number }} opts
 * @returns {Array<{ port: number, pid: number, url: string, at: string, alive: boolean, isDshWeb: boolean, record: string }>}
 */
export function listStaleRecords(opts) {
  const home = String(opts?.dshHome || "");
  const skip = Number(opts?.skipPid) || process.pid;
  const dir = path.join(home, RECORD_DIR, RECORD_SUBDIR);
  const out = [];
  let names = [];
  try {
    names = fs.readdirSync(dir);
  } catch {
    return out;
  }
  const listening = listenerPids();
  for (const name of names) {
    if (!name.startsWith(RECORD_PREFIX) || !name.endsWith(".json")) continue;
    const fp = path.join(dir, name);
    const rec = readRecord(fp);
    if (!rec || rec.port <= 0) continue;
    const owner = listening.get(rec.port) || 0;
    const pid = owner || rec.pid;
    if (!pid || pid === skip) continue;
    const alive = isAlive(pid);
    out.push({
      port: rec.port,
      pid,
      url: rec.url,
      at: rec.at,
      alive,
      isDshWeb: alive ? looksLikeDshWeb(processCommandLine(pid)) : false,
      record: fp,
    });
  }
  return out;
}

/** 平台自检：这条链路上本机到底能拿到什么（面板「诊断」区展示）。 */
export function probeCapability() {
  const tools = {};
  if (process.platform === "win32") tools.netstat = run("netstat", ["-ano"]).length > 0;
  else {
    tools.ss = run("ss", ["-ltnp"]).length > 0;
    tools.lsof = run("lsof", ["-nP", "-iTCP", "-sTCP:LISTEN"]).length > 0;
  }
  return {
    platform: process.platform,
    hostname: os.hostname(),
    tools,
    canResolvePid: Boolean(process.platform === "linux" || process.platform === "win32" || tools.lsof),
  };
}
