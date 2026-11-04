import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as core from "./core.js";

export function restartNote() {
  return "正在重启 dsh web…";
}

export function portFromRequest(request) {
  const host = String(request?.headers?.host || "");
  const m = host.match(/:(\d+)$/);
  if (m) return Number(m[1]);
  return Number(process.env.PORT) || 3080;
}

export function hostFromRequest(request) {
  const hostHeader = String(request?.headers?.host || "127.0.0.1");
  return hostHeader.replace(/:\d+$/, "") || "127.0.0.1";
}

export function restartArgv({
  argv = process.argv,
  findBinRoot = core.findDshBinRoot,
} = {}) {
  const root = findBinRoot();
  const binJs = root ? path.join(root, "lib", "bin.js") : null;
  if (binJs && fs.existsSync(binJs)) {
    const rest = argv.slice(2).filter((arg) => arg !== "--no-open");
    if (!rest.includes("web") && !rest.includes("desktop")) {
      const port = Number(process.env.PORT) || 3080;
      rest.unshift("web", "--port", String(port));
    }
    rest.push("--no-open");
    return [binJs, ...rest];
  }
  const next = argv.slice(1).filter((arg) => arg !== "--no-open");
  if (next[0] && /\.(cmd|bat)$/i.test(next[0])) {
    const dir = path.dirname(next[0]);
    const candidates = [
      path.resolve(dir, "node_modules", "@deepseek-ai", "dsh", "lib", "bin.js"),
      path.resolve(dir, "..", "node_modules", "@deepseek-ai", "dsh", "lib", "bin.js"),
    ];
    const hit = candidates.find((p) => fs.existsSync(p));
    if (hit) next[0] = hit;
  }
  next.push("--no-open");
  return next;
}

/* 阶段 5：spawn 失败必须接住并留痕。helper 是 detached + stdio:ignore，
 * 没有 'error' 监听器时 ENOENT/EACCES 会变成未捕获异常打崩宿主；
 * 监听器里只退出又会让现场什么都不剩。写进 helper 日志，与 helper 自己的
 * 输出同一条时间线（父进程行带 [parent] 前缀）。 */
function logRestartHelper(msg) {
  try {
    fs.appendFileSync(
      path.join(os.tmpdir(), "Xsdsh-purge-next-restart-web.log"),
      `${new Date().toISOString()} [parent] ${String(msg)}\n`,
      "utf8",
    );
  } catch {
    /* 写不进去就吞，绝不走 stderr（会被宿主当成 crash 原因） */
  }
}

function spawnRestartHelper(helper, payload, exitAfter = 250) {
  try {
    core.silenceCmdFlash();
  } catch {}
  const child = spawn(process.execPath, [helper], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    shell: false,
    env: {
      ...core.envForDetachedSpawn(),
      DSH_PURGE_RESTART: JSON.stringify(payload),
    },
  });
  child.on("error", (err) => {
    logRestartHelper(
      `helper spawn error: helper=${helper} exec=${process.execPath}`
      + ` ${err && err.message ? err.message : err}`
      + (err && err.code ? ` code=${err.code}` : ""),
    );
  });
  child.unref();
  setTimeout(() => process.exit(0), exitAfter);
}

/**
 * @param {object} [request]
 * @param {unknown} [_ctx]
 * @param {{ openBrowser?: boolean }} [options]
 * settle / 自愈重启传 request=null → 默认不弹浏览器，避免关窗后仍被反复拉起新窗口（#59/#61）。
 */
export function scheduleRestart(request, _ctx, options = {}) {
  const openBrowser = options.openBrowser ?? (request != null);
  const helper = fileURLToPath(new URL("./restart-web.js", import.meta.url));
  spawnRestartHelper(helper, {
    kind: "web",
    execPath: process.execPath,
    argv: restartArgv(),
    cwd: process.cwd(),
    host: hostFromRequest(request),
    port: portFromRequest(request),
    pid: process.pid,
    openBrowser: openBrowser !== false,
  });
}

export function scheduleCleanupRestart({ request, restartArgv: argv, cleanup = [] } = {}) {
  const src = fileURLToPath(new URL("./uninstall-restart.js", import.meta.url));
  const dest = path.join(os.tmpdir(), `Xsdsh-purge-next-uninst-${process.pid}.mjs`);
  fs.copyFileSync(src, dest);
  const coreSrc = fileURLToPath(new URL("./uninstall-rmtree.js", import.meta.url));
  const coreDest = path.join(os.tmpdir(), `Xsdsh-purge-next-rmtree-${process.pid}.mjs`);
  fs.copyFileSync(coreSrc, coreDest);
  spawnRestartHelper(dest, {
    kind: "web",
    execPath: process.execPath,
    argv: argv || restartArgv(),
    cwd: process.cwd(),
    host: hostFromRequest(request),
    port: portFromRequest(request),
    cleanup,
    helper: dest,
    helperCore: coreDest,
    openBrowser: request != null,
  }, 400);
}
