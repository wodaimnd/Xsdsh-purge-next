import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

/* 日志先于一切：helper 的 stdio 是 ignore，宿主退出后没有任何人接 stdout。
 * 下面每个 process.exit 都必须先留下一行原因。 */
const helperTmpDir = os.tmpdir();
const logPath = path.join(helperTmpDir, "Xsdsh-purge-next-restart-web.log");

function log(msg) {
  try {
    fs.appendFileSync(logPath, `${new Date().toISOString()} pid=${process.pid} ${msg}\n`);
  } catch {
    // ignore
  }
}

function errText(e) {
  if (!e) return "unknown";
  const parts = [String(e.message || e)];
  if (e.code) parts.push(`code=${e.code}`);
  if (e.errno) parts.push(`errno=${e.errno}`);
  if (e.syscall) parts.push(`syscall=${e.syscall}`);
  return parts.join(" ");
}

log(`start platform=${process.platform} argv=${JSON.stringify(process.argv.slice(1))}`);

const encoded = process.env.DSH_PURGE_RESTART;
if (!encoded) {
  log("abort: missing payload (DSH_PURGE_RESTART)");
  process.exit(1);
}

let info;
try {
  info = JSON.parse(encoded);
} catch (e) {
  log(`abort: bad payload json: ${errText(e)}`);
  process.exit(1);
}
if (!info || typeof info !== "object" || Array.isArray(info)) {
  log("abort: payload is not an object");
  process.exit(1);
}

const port = Number(info.port) || 3080;
const host = typeof info.host === "string" && info.host ? info.host : "127.0.0.1";
const cleanup = Array.isArray(info.cleanup) ? info.cleanup : [];
const helperCore = typeof info.helperCore === "string" ? info.helperCore : "";

log(
  `payload host=${host}:${port} pid=${info.pid ?? ""} exec=${info.execPath || ""}`
  + ` cleanup=${cleanup.length}`,
);

let removeCleanupDirs = null;
if (helperCore) {
  try {
    ({ removeCleanupDirs } = await import(pathToFileURL(helperCore).href));
  } catch (e) {
    log("helper core import failed: " + String(e && e.message ? e.message : e));
  }
}

function spawnEnv() {
  const env = { ...process.env };
  delete env.DSH_PERMISSION_MODE;
  delete env.DSH_PURGE_RESTART;
  return env;
}

function portFree() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port }, () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(true));
  });
}

async function waitFree() {
  for (let i = 0; i < 80; i++) {
    if (await portFree()) return true;
    await new Promise((r) => setTimeout(r, 120));
  }
  return false;
}

function rmTree(dir) {
  if (!dir) return;
  try {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 8, retryDelay: 120 });
  } catch {
    // 锁着就留下
  }
}

const ok = await waitFree();
if (!ok) {
  log(`abort: port ${host}:${port} still busy after ~10s`);
  process.exit(1);
}
log(`port free ${host}:${port}`);

let cleanupOk = true;
if (removeCleanupDirs) {
  const r = removeCleanupDirs(cleanup, { tmpDir: helperTmpDir, logPath });
  cleanupOk = r.ok;
  log(`cleanup ok=${r.ok} failures=${r.failures.length}`);
  for (const f of r.failures) log(`cleanup leftover: ${f.path} (${f.error})`);
  if (r.leftoverPath) log(`leftover record: ${r.leftoverPath}`);
} else {
  for (const dir of cleanup) rmTree(dir);
  log(`cleanup fallback dirs=${cleanup.length} (helper core unavailable)`);
}
for (const fp of [info.helper, info.helperCore]) {
  if (!fp) continue;
  try {
    fs.unlinkSync(fp);
  } catch (e) {
    log(`unlink helper failed: ${fp} ${errText(e)}`);
  }
}

if (!info.execPath) {
  log("abort: no execPath; cannot relaunch");
  process.exit(1);
}

const argv = Array.isArray(info.argv) ? info.argv : [];
log(`phase: relaunch exe=${info.execPath} cwd=${info.cwd || process.cwd()} argv=${JSON.stringify(argv)}`);
const child = spawn(info.execPath, argv, {
  detached: true,
  stdio: "ignore",
  cwd: info.cwd || process.cwd(),
  env: spawnEnv(),
  windowsHide: true,
  shell: false,
});
child.on("error", (e) => {
  log(
    `relaunch spawn error: exe=${info.execPath} cwd=${info.cwd || process.cwd()}`
    + ` argv=${JSON.stringify(argv)} ${errText(e)}`,
  );
  process.exit(1);
});
// 只在 spawn 成功后才写「已拉起」：否则失败时日志会先报成功再报错误，自相矛盾。
child.on("spawn", () => log(`relaunched pid=${child.pid || ""}`));
child.unref();
await new Promise((r) => setTimeout(r, 400));
if (!cleanupOk) {
  log("exit code=2 reason=cleanup-leftover");
  process.exit(2);
}
log("exit code=0");
process.exit(0);
