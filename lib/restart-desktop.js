import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

/* 日志先于一切：helper 的 stdio 是 ignore，宿主退出后没有任何人接 stdout。
 * 下面每个 `process.exit` 都必须先留下一行原因，否则「重启没反应」永远查不到
 * 是死在参数、等待、杀进程还是拉起。 */
const helperTmpDir = os.tmpdir();
const logPath = path.join(helperTmpDir, "Xsdsh-purge-next-restart-desktop.log");

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

const cleanup = Array.isArray(info.cleanup) ? info.cleanup : [];
const helperCore = typeof info.helperCore === "string" ? info.helperCore : "";

log(
  `payload killApp=${info.killApp === true} respawn=${info.respawn !== false}`
  + ` pid=${info.pid ?? ""} exec=${info.execPath || ""} asar=${info.asar || ""}`
  + ` cleanup=${cleanup.length}`,
);

/* 主进程会把 uninstall-rmtree.js 复制到 %TEMP%，这里动态加载；
 * 加载失败就退回本地 rmTree，至少不会因为缺少模块整条卸载链失败。 */
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
  for (const key of Object.keys(env)) {
    if (key.toUpperCase() === "ELECTRON_RUN_AS_NODE") delete env[key];
  }
  // [Xsdsh-purge-next-fix 2026-10-09] 从 explorer 继承的 env 常缺 DSH_PROFILE
  // (WM_SETTINGCHANGE broadcast 不刷新存活很久的 explorer)。helper relaunch
  // 时如果不兜底，新 Electron → host 子进程继续缺,报 "cannot determine the
  // boot profile" host crash → Xsdsh-purge-next 插件没 activate → inject 全断。
  if (!env.DSH_PROFILE) env.DSH_PROFILE = "desktop";
  return env;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pidAlive(pid) {
  const n = Number(pid);
  if (!n) return false;
  try {
    process.kill(n, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitPidGone(pid) {
  if (!pid) {
    await sleep(400);
    return true;
  }
  for (let i = 0; i < 80; i++) {
    if (!pidAlive(pid)) return true;
    await sleep(120);
  }
  return !pidAlive(pid);
}

function rmTree(dir) {
  if (!dir) return;
  try {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 8, retryDelay: 120 });
  } catch {
    // 锁着就留下
  }
}

function cleanupDirs() {
  if (!removeCleanupDirs) {
    for (const dir of cleanup) rmTree(dir);
    log(`cleanup fallback dirs=${cleanup.length} (helper core unavailable)`);
    return { ok: true, failures: [], leftoverPath: "" };
  }
  const r = removeCleanupDirs(cleanup, { tmpDir: helperTmpDir, logPath });
  log(`cleanup ok=${r.ok} failures=${r.failures.length}`);
  for (const f of r.failures) log(`cleanup leftover: ${f.path} (${f.error})`);
  if (r.leftoverPath) log(`leftover record: ${r.leftoverPath}`);
  return r;
}

function pidsForImage(image) {
  const out = execFileSync("tasklist", ["/FI", `IMAGENAME eq ${image}`, "/FO", "CSV", "/NH"], {
    encoding: "utf8",
    windowsHide: true,
    timeout: 8000,
  });
  const pids = [];
  for (const line of String(out || "").split(/\r?\n/)) {
    const cols = line.split(",");
    const pid = Number(String(cols[1] || "").replace(/"/g, "").trim());
    if (pid) pids.push(pid);
  }
  return pids;
}

function darwinBundleOf(exe) {
  const n = String(exe || "").replace(/\\/g, "/");
  const m = n.match(/^(.*\.app)\/Contents\/MacOS\//i);
  return m ? m[1] : "";
}

function darwinBundleName(bundle) {
  if (!bundle) return "";
  const infoPlist = path.join(bundle, "Contents", "Info.plist");
  try {
    return execFileSync("defaults", ["read", path.join(bundle, "Contents", "Info"), "CFBundleName"], {
      encoding: "utf8",
      timeout: 5000,
    }).trim();
  } catch {
    // fall through
  }
  try {
    return execFileSync("plutil", ["-extract", "CFBundleName", "raw", infoPlist], {
      encoding: "utf8",
      timeout: 5000,
    }).trim();
  } catch {
    return path.basename(bundle, ".app");
  }
}

function listDarwinPids(exe) {
  const bundle = darwinBundleOf(exe);
  if (!exe || !bundle) return [];
  let out = "";
  try {
    out = execFileSync("ps", ["-Ao", "pid=,command="], {
      encoding: "utf8",
      timeout: 8000,
    });
  } catch {
    return [];
  }
  const frameworks = `${bundle}/Contents/Frameworks/`;
  const pids = [];
  for (const line of String(out || "").split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const sp = trimmed.search(/\s/);
    if (sp < 0) continue;
    const pid = Number(trimmed.slice(0, sp).trim());
    const cmd = trimmed.slice(sp + 1).trim();
    if (!pid) continue;
    // CLI 独立宿主（dsh web / plugin 等），不占桌面单实例锁，不能一起杀。
    if (cmd.includes("/dsh-desktop-host/lib/cli.js")) continue;
    if (cmd === exe || cmd.startsWith(`${exe} `) || cmd.startsWith(frameworks)) {
      pids.push(pid);
    }
  }
  return [...new Set(pids)];
}

function commandMatchesExe(cmd, exe) {
  if (!cmd || !exe) return false;
  if (cmd.includes("/dsh-desktop-host/lib/cli.js")) return false;
  return cmd === exe || cmd.startsWith(`${exe} `) || cmd.startsWith(`${exe}\t`);
}

function listPosixPids(exe) {
  if (!exe) return [];
  let out = "";
  try {
    out = execFileSync("ps", ["-Ao", "pid=,command="], {
      encoding: "utf8",
      timeout: 8000,
    });
  } catch {
    return [];
  }
  const pids = [];
  for (const line of String(out || "").split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const sp = trimmed.search(/\s/);
    if (sp < 0) continue;
    const pid = Number(trimmed.slice(0, sp).trim());
    const cmd = trimmed.slice(sp + 1).trim();
    if (!pid || !commandMatchesExe(cmd, exe)) continue;
    pids.push(pid);
  }
  return [...new Set(pids)];
}

function listDesktopPids(exe = info.execPath) {
  if (process.platform === "darwin") return listDarwinPids(exe);
  if (process.platform !== "win32") return listPosixPids(exe);
  const images = ["DeepSeek Harness.exe", "DSH Desktop.exe"];
  const pids = [];
  for (const image of images) {
    try {
      pids.push(...pidsForImage(image));
    } catch {
      // 该进程名不存在
    }
  }
  return pids;
}

function signalPids(pids, signal) {
  for (const pid of pids) {
    if (pid === process.pid) continue;
    try {
      process.kill(pid, signal);
    } catch (e) {
      // ESRCH = 已经退了，这是正常结果；其它错误必须留痕，否则「杀了没反应」查不到。
      if (e && e.code === "ESRCH") continue;
      log(`kill pid=${pid} signal=${signal || "default"} failed: ${errText(e)}`);
    }
  }
}

async function waitDesktopGone(exe, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const left = listDesktopPids(exe).filter((pid) => pid !== process.pid);
    if (left.length === 0) return true;
    await sleep(200);
  }
  return listDesktopPids(exe).filter((pid) => pid !== process.pid).length === 0;
}

async function quitPosixDesktop(exe) {
  signalPids(listDesktopPids(exe), "SIGTERM");
  if (await waitDesktopGone(exe, 8000)) {
    log("quit by SIGTERM");
    return "SIGTERM";
  }
  signalPids(listDesktopPids(exe), "SIGKILL");
  await waitDesktopGone(exe, 2000);
  log("quit by SIGKILL");
  return "SIGKILL";
}

async function quitDarwinDesktop(exe) {
  const bundle = darwinBundleOf(exe);
  const name = darwinBundleName(bundle);
  if (name) {
    try {
      execFileSync(
        "osascript",
        ["-e", `if application "${name}" is running then tell application "${name}" to quit`],
        { timeout: 15000 },
      );
      log("osascript quit sent");
    } catch (e) {
      log(`osascript quit failed: ${e && e.message ? e.message : e}`);
    }
    if (await waitDesktopGone(exe, 8000)) {
      log("quit by apple event");
      return "apple-event";
    }
  }
  signalPids(listDesktopPids(exe), "SIGTERM");
  if (await waitDesktopGone(exe, 5000)) {
    log("quit by SIGTERM");
    return "SIGTERM";
  }
  signalPids(listDesktopPids(exe), "SIGKILL");
  await waitDesktopGone(exe, 2000);
  log("quit by SIGKILL");
  return "SIGKILL";
}

function killOtherDesktopProcesses(keepPid, exe = info.execPath) {
  const pids = listDesktopPids(exe);
  if (pids.length) log(`kill desktop pids=[${pids.join(",")}] keep=${keepPid}`);
  for (const pid of pids) {
    if (pid === keepPid || pid === process.pid) continue;
    try {
      process.kill(pid, process.platform === "darwin" ? "SIGTERM" : undefined);
    } catch (e) {
      if (e && e.code === "ESRCH") continue;
      log(`kill desktop pid=${pid} failed: ${errText(e)}`);
    }
  }
}

async function moveAsarAsideAsync(asar) {
  if (!asar) return false;
  try {
    if (!fs.existsSync(asar) || !fs.statSync(asar).isFile()) return true;
  } catch {
    return true;
  }
  const bak = `${asar}.bak`;
  try {
    if (fs.existsSync(bak)) fs.rmSync(bak, { force: true });
  } catch {
    // keep going
  }
  for (let i = 0; i < 80; i++) {
    try {
      if (!fs.existsSync(asar) || !fs.statSync(asar).isFile()) {
        log("asar already absent");
        return true;
      }
      fs.renameSync(asar, bak);
      log(`asar moved to ${bak}`);
      return true;
    } catch {
      await sleep(300);
    }
  }
  log("asar move failed after retries");
  return false;
}

function asarStillSealed(asar) {
  try {
    return Boolean(asar) && fs.existsSync(asar) && fs.statSync(asar).isFile();
  } catch {
    return false;
  }
}

async function releaseSealedAsar(asar, exe) {
  if (!asar) return true;
  if (await moveAsarAsideAsync(asar)) return true;
  log("retry quit then move asar");
  if (process.platform === "darwin") await quitDarwinDesktop(exe);
  else if (process.platform === "win32") {
    killOtherDesktopProcesses(process.pid, exe);
    await sleep(800);
  } else await quitPosixDesktop(exe);
  if (await moveAsarAsideAsync(asar)) return true;
  const left = listDesktopPids(exe).filter((pid) => pid !== process.pid);
  // 这一行是「换包失败」的唯一现场证据：asar 还在，谁还占着它。
  log(`asar release failed; desktop still alive: [${left.join(",")}] asar=${asar}`);
  return !asarStillSealed(asar);
}

function relaunchDesktop() {
  if (!info.execPath) {
    log("abort: payload has no execPath; cannot relaunch");
    process.exit(1);
  }
  const env = spawnEnv();
  if (process.platform === "darwin") {
    const bundle = darwinBundleOf(info.execPath);
    if (bundle) {
      const child = spawn("open", [bundle], {
        detached: true,
        stdio: "ignore",
        env,
        shell: false,
      });
      child.on("error", (e) => {
        log(`relaunch spawn error: engine=open bundle=${bundle} ${errText(e)}`);
        process.exit(1);
      });
      child.on("spawn", () => log(`relaunched via open bundle=${bundle}`));
      child.unref();
      return;
    }
  }
  // [Xsdsh-purge-next-fix 2026-10-09] 复用 Electron 自带的 --updated argv 分支:
  // main.js:11256 process.argv.includes("--updated") → raiseAfterUpdate=true
  // → enterWorkspace 时 window.moveTop() + window.focus() 内部强制前台。
  // 比外部 PS SetForegroundWindow 可靠得多 (Win11 前台保护只挡外部进程)。
  const baseArgv = Array.isArray(info.argv) ? info.argv.slice() : [];
  let updated = "skipped(non-win32)";
  if (process.platform === "win32") {
    if (baseArgv.includes("--updated")) updated = "already-present";
    else {
      baseArgv.push("--updated");
      updated = "added";
    }
  }
  log(`--updated: ${updated}`);
  const child = spawn(info.execPath, baseArgv, {
    detached: true,
    stdio: "ignore",
    cwd: info.cwd || process.cwd(),
    env,
    windowsHide: true,
    shell: false,
  });
  child.on("error", (e) => {
    log(
      `relaunch spawn error: engine=execPath exe=${info.execPath}`
      + ` cwd=${info.cwd || process.cwd()} argv=${JSON.stringify(baseArgv)} ${errText(e)}`,
    );
    process.exit(1);
  });
  // 只在 spawn 成功后才写「已拉起」：否则失败时日志会先报成功再报错误，自相矛盾。
  child.on("spawn", () => log(`relaunched via execPath pid=${child.pid || ""} argv=${JSON.stringify(baseArgv)}`));
  child.unref();

  /* [Xsdsh-purge-next-fix 2026-10-09] Windows: 新 Electron 从 detached helper spawn,
   * Windows 焦点规则让它跑在后台。helper 已经不是前台(老 Electron 被 kill 了),
   * 直接 SetForegroundWindow 会被 Windows 静默 reject。
   * 三重 trick 强推前台:
   *   1) keybd_event 发送虚拟 Alt key — 模拟用户输入,解除 foreground lock
   *   2) AttachThreadInput attach 当前前台线程的 input queue — 继承前台权限
   *   3) ShowWindow(SW_RESTORE) + BringWindowToTop + SetForegroundWindow
   *
   * `focus:false` 只给诊断 / 测试用（不抢前台），生产 payload 不传。 */
  if (process.platform === "win32" && info.focus !== false) {
    const exeLiteral = info.execPath.replace(/'/g, "''");
    const psScript =
      "$ErrorActionPreference='SilentlyContinue';" +
      "$sig=@'\n" +
      "[DllImport(\"user32.dll\")] public static extern bool SetForegroundWindow(IntPtr h);\n" +
      "[DllImport(\"user32.dll\")] public static extern bool ShowWindow(IntPtr h,int c);\n" +
      "[DllImport(\"user32.dll\")] public static extern bool BringWindowToTop(IntPtr h);\n" +
      "[DllImport(\"user32.dll\")] public static extern IntPtr GetForegroundWindow();\n" +
      "[DllImport(\"user32.dll\")] public static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);\n" +
      "[DllImport(\"kernel32.dll\")] public static extern uint GetCurrentThreadId();\n" +
      "[DllImport(\"user32.dll\")] public static extern bool AttachThreadInput(uint a,uint b,bool f);\n" +
      "[DllImport(\"user32.dll\")] public static extern void keybd_event(byte k,byte s,uint f,int e);\n" +
      "'@;" +
      "$t=Add-Type -MemberDefinition $sig -Name W -Namespace U -PassThru;" +
      "[void]$t::keybd_event(0x12,0,0,0);" +
      "[void]$t::keybd_event(0x12,0,2,0);" +
      "for($i=0;$i -lt 25;$i++){" +
      "  Start-Sleep -Milliseconds 300;" +
      "  $p=Get-Process | Where-Object {$_.Path -eq '" + exeLiteral + "' -and $_.MainWindowHandle -ne 0} | Select-Object -First 1;" +
      "  if($p){" +
      "    $h=$p.MainWindowHandle;" +
      "    $fg=$t::GetForegroundWindow();" +
      "    $pid2=0;" +
      "    $fgTid=$t::GetWindowThreadProcessId($fg,[ref]$pid2);" +
      "    $curTid=$t::GetCurrentThreadId();" +
      "    [void]$t::AttachThreadInput($curTid,$fgTid,$true);" +
      "    [void]$t::ShowWindow($h,9);" +
      "    [void]$t::BringWindowToTop($h);" +
      "    [void]$t::SetForegroundWindow($h);" +
      "    [void]$t::AttachThreadInput($curTid,$fgTid,$false);" +
      "    break;" +
      "  }" +
      "}";
    try {
      const ps = spawn("powershell.exe", [
        "-NoProfile", "-WindowStyle", "Hidden", "-ExecutionPolicy", "Bypass",
        "-Command", psScript,
      ], { detached: true, stdio: "ignore", windowsHide: true, shell: false });
      // detached + unref 后 ENOENT 等异步错走 'error' 事件,外层 try/catch 捕不到 → uncaught 崩进程。
      ps.on("error", (err) => log("ps bring-to-front spawn error: " + String(err?.message || err)));
      ps.unref();
      log("spawned ps bring-to-front helper (keybd+attach+setfg)");
    } catch (err) {
      log("ps bring-to-front spawn failed: " + String(err));
    }
  }
}

let asarReleased = true;
let cleanupResult = { ok: true, failures: [], leftoverPath: "" };
if (info.killApp) {
  // #85: 先杀 Electron,再 sleep + cleanup。原顺序 sleep 400ms 开头 →
  // host 已经 exit → Electron 还活着跑旧 close 回调弹 crash dialog。
  // 新顺序:立刻 kill (host 这边 killInstallElectronSync 已经杀过,这里兜底),
  // Electron 死得越快,旧回调越没机会跑。
  log("phase: kill");
  if (process.platform === "darwin") {
    await quitDarwinDesktop(info.execPath);
  } else if (process.platform === "win32") {
    killOtherDesktopProcesses(process.pid);
    await sleep(500);
    // 二次保险:再杀一次,防第一次漏掉的 pid
    killOtherDesktopProcesses(process.pid);
  } else {
    await quitPosixDesktop(info.execPath);
  }
  log("phase: cleanup");
  cleanupResult = cleanupDirs();
  for (const fp of [info.helper, info.helperCore]) {
    if (!fp) continue;
    try {
      fs.unlinkSync(fp);
    } catch (e) {
      log(`unlink helper failed: ${fp} ${errText(e)}`);
    }
  }
  if (info.asar) {
    log("phase: release-asar");
    asarReleased = await releaseSealedAsar(info.asar, info.execPath);
  }
} else {
  log(`phase: wait-pid pid=${info.pid ?? ""}`);
  const gone = await waitPidGone(info.pid);
  if (!gone) {
    log(`abort: pid ${info.pid ?? ""} still alive after wait; not cleaning up`);
    process.exit(1);
  }
  log("phase: cleanup");
  cleanupResult = cleanupDirs();
  for (const fp of [info.helper, info.helperCore]) {
    if (!fp) continue;
    try {
      fs.unlinkSync(fp);
    } catch (e) {
      log(`unlink helper failed: ${fp} ${errText(e)}`);
    }
  }
  if (info.asar) {
    log("phase: release-asar");
    asarReleased = await releaseSealedAsar(info.asar, info.execPath);
  }
}

if (info.respawn === false) {
  if (!asarReleased) {
    log("exit code=1 reason=asar-still-sealed");
    process.exit(1);
  }
  if (!cleanupResult.ok) {
    log("exit code=2 reason=cleanup-leftover");
    process.exit(2);
  }
  log("exit code=0");
  process.exit(0);
}

if (info.asar && !asarReleased) {
  log("asar still sealed; not relaunching");
  process.exit(1);
}

if (!info.execPath) {
  log("abort: no execPath; cannot relaunch");
  process.exit(1);
}

log("phase: relaunch");
relaunchDesktop();
await sleep(400);
if (!cleanupResult.ok) {
  log("exit code=2 reason=cleanup-leftover");
  process.exit(2);
}
log("exit code=0");
process.exit(0);
