/**
 * 宿主 `lib/bin.js` 顶部被 import 的预检入口（安装时整文件复制到宿主 lib/ 下）。
 *
 * 约束：
 *  - 只用 node 内置模块，不 import 本插件任何文件（宿主启动期不能依赖插件包路径）。
 *  - 任何失败都静默放过：预检是为了少一次 EADDRINUSE，不能让宿主起不来。
 *  - 只在 `dsh web` 这条命令上生效；`mcp` / `run` / `doctor` 一律直接返回。
 *  - 默认不打印任何东西；排查时设 `DSH_PURGE_PREFLIGHT_DEBUG=1`。
 */
import { readFileSync, readdirSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

/** 默认最多等 1500 ms；可用 DSH_PURGE_PREFLIGHT_WAIT 覆盖（上限 5000）。 */
const DEFAULT_WAIT_MS = 1500;
const POLL_MS = 120;

const DEBUG = process.env.DSH_PURGE_PREFLIGHT_DEBUG === "1";

function log(message) {
  if (DEBUG) process.stderr.write(`[Xsdsh-purge-next/preflight] ${message}\n`);
}

function isWebCommand(argv) {
  const rest = argv.slice(2).filter((a) => !a.startsWith("-"));
  return rest[0] === "web";
}

function waitBudget() {
  const raw = Number(process.env.DSH_PURGE_PREFLIGHT_WAIT);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_WAIT_MS;
  return Math.min(Math.floor(raw), 5000);
}

function dshHome() {
  const fromEnv = process.env.DSH_HOME;
  if (fromEnv && String(fromEnv).trim() !== "") return String(fromEnv);
  return path.join(os.homedir(), ".dsh");
}

function recordDir() {
  return path.join(dshHome(), "Xsdsh-purge-core", "web");
}

function sleepSync(ms) {
  const sab = new SharedArrayBuffer(4);
  const view = new Int32Array(sab);
  Atomics.wait(view, 0, 0, ms);
}

function alive(pid) {
  if (!Number.isFinite(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return Boolean(error && error.code === "EPERM");
  }
}

/** 端口上现在是谁在听（取不到就返回 0，不当作阻塞理由）。 */
function listenerPid(port) {
  try {
    const cmd = process.platform === "win32" ? ["netstat", ["-ano"]] : ["sh", ["-c", "ss -ltnp 2>/dev/null || netstat -ltnp 2>/dev/null"]];
    const r = spawnSync(cmd[0], cmd[1], { encoding: "utf8", windowsHide: true, timeout: 3000 });
    const text = r && typeof r.stdout === "string" ? r.stdout : "";
    for (const line of text.split(/\r?\n/)) {
      if (!line.includes(String(port))) continue;
      if (!/LISTEN/i.test(line)) continue;
      const m = line.match(/(\d+)\s*$/);
      if (m) return Number(m[1]);
    }
  } catch {
    return 0;
  }
  return 0;
}

function readRecords() {
  const dir = recordDir();
  let names = [];
  try {
    names = readdirSync(dir).filter((n) => n.startsWith("web-server-") && n.endsWith(".json"));
  } catch {
    return [];
  }
  const out = [];
  for (const name of names) {
    const fp = path.join(dir, name);
    let rec = null;
    try {
      rec = JSON.parse(readFileSync(fp, "utf8"));
    } catch {
      rec = null;
    }
    if (!rec) {
      dropFile(fp);
      continue;
    }
    out.push({ fp, port: Number(rec.port), pid: Number(rec.pid), url: String(rec.url || "") });
  }
  return out;
}

/** 删记录；删不掉就留着，下次启动再试（不抛）。 */
function dropFile(fp) {
  try {
    unlinkSync(fp);
    return true;
  } catch (error) {
    log(`删记录失败 ${path.basename(fp)}: ${error && error.message ? error.message : error}`);
    return false;
  }
}

function main() {
  if (!isWebCommand(process.argv)) return;
  const records = readRecords();
  if (records.length === 0) return;
  const deadline = Date.now() + waitBudget();

  for (const rec of records) {
    if (!alive(rec.pid)) {
      dropFile(rec.fp);
      continue;
    }
    // 上一轮还活着：等它把端口让出来。不主动杀——杀人进程不是启动期的职责。
    const owner = rec.port > 0 ? listenerPid(rec.port) : 0;
    if (owner !== rec.pid) {
      log(`记录 ${rec.pid} 仍在，但端口 ${rec.port} 已不由它持有，跳过等待`);
      continue;
    }
    log(`等待 ${rec.pid} 释放端口 ${rec.port}`);
    while (Date.now() < deadline && alive(rec.pid) && listenerPid(rec.port) === rec.pid) {
      sleepSync(POLL_MS);
    }
    if (alive(rec.pid)) {
      log(`端口 ${rec.port} 仍被 ${rec.pid} 占用，交给宿主按原逻辑处理`);
    } else {
      dropFile(rec.fp);
    }
  }
}

try {
  main();
} catch (error) {
  log(`预检失败（已放过）：${error && error.message ? error.message : error}`);
}
