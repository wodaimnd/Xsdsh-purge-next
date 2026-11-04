import os from "node:os";
import path from "node:path";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { isWshAscii, wshLiteral } from "./official-update.js";
import { asarArchiveIsFile, hostFs } from "./extract-asar.js";
import { hostPromptKeepsInject } from "./host-clean.js";
import { atomicCopyFile, atomicWriteSync } from "./core.js";

function restartUniqSuffix() {
  return `${process.pid}-${randomBytes(4).toString("hex")}`;
}

// 无归档时用 node:fs。app.asar 还在时不能把映射出来的 resources/app 当成已经解开。
const fs = hostFs;

// [Xsdsh-purge-next-fix 2026-10-09] console.warn 写 host stderr → main.js:3729 host.exitPromise
// fail 回调把最后一行 stderr 当 Error reason。helper restart 期间任何 warn 都可能
// 被误判成 crash log。改走内部文件,不污染 stderr。
const INTERNAL_LOG_PATH = path.join(os.tmpdir(), "Xsdsh-purge-next-desktop.log");

/* ── C9-P5：换包日志路径的唯一来源 ────────────────────────────────────────
 * 修之前 JS 侧根本不返回 logPath，core 透传成空串，/restart 的 asar_swap_log
 * 恒为 "" —— 换包失败时用户手里没有任何路径可查。
 *
 * 现在文件名只在这一个常量里写一次：
 *   · PS1 里的 `$SwapLog` 由它插值生成（asarSwapPs1()）
 *   · JS 返回的 logPath 由 asarSwapLogPath() 生成
 * 两边同源，改名字只改这里，不会再出现「脚本写 A、面板说 B」。
 *
 * 为什么 PS1 用 `Join-Path $env:TEMP` 而不是把绝对路径插进去：
 * ps1 是不带 BOM 的 UTF-8，Windows PowerShell 5.1 按 ANSI 读，
 * 非 ASCII 的 TEMP（中文用户名）会把路径读坏。$env:TEMP 由 PowerShell
 * 自己解析，绝对路径只在 JS 侧拼给用户看。 */
const ASAR_SWAP_LOG_NAME = "Xsdsh-purge-next-asar-swap.log";
/** 换包日志（PS1 分支实际写的那个文件）。 */
export function asarSwapLogPath() {
  return path.join(os.tmpdir(), ASAR_SWAP_LOG_NAME);
}

/* lib/restart-desktop.js:18 里同名常量。那份文件是独立子进程脚本，不能 import，
 * 所以这里镜像一份；测试同时断言两边字符串一致，防止改一边漏一边。 */
const RESTART_DESKTOP_LOG_NAME = "Xsdsh-purge-next-restart-desktop.log";
/** helper（非 win32 换包）分支的日志。 */
export function restartDesktopLogPath() {
  return path.join(os.tmpdir(), RESTART_DESKTOP_LOG_NAME);
}

/* wscript 官方重启脚本的日志。原来 officialRestartScript 与
 * officialRestartLogState 各写一份同样的字面量，现在统一从这里取。 */
const OFFICIAL_RESTART_LOG_NAME = "Xsdsh-purge-next-official-restart.log";
/** wscript 官方重启脚本的日志路径。 */
export function officialRestartLogPath() {
  return path.join(os.tmpdir(), OFFICIAL_RESTART_LOG_NAME);
}
function logInternal(msg) {
  try {
    const line = `${new Date().toISOString()} [Xsdsh-purge-next] ${String(msg)}\n`;
    fs.appendFileSync(INTERNAL_LOG_PATH, line, "utf8");
  } catch {
    /* 日志写不进去就吞,绝不走 stderr */
  }
}

/* 阶段 5：父进程侧的 spawn 失败也要写进 helper 日志。
 *
 * helper 是 detached + stdio:ignore，父进程 `spawn()` 的异步 'error'（ENOENT /
 * EACCES / EPERM）如果没有监听器，会变成未捕获异常把宿主整个打崩；监听器里
 * 只 `process.exit(1)` 又会让现场什么都不剩。两件事一起修：接住 + 留痕。 */
function logRestartHelper(msg) {
  try {
    fs.appendFileSync(restartDesktopLogPath(), `${new Date().toISOString()} [parent] ${String(msg)}\n`, "utf8");
  } catch {
    logInternal(msg);
  }
}

/** 启动一次：清掉旧版本留下的无 pid 后缀的 restart 脚本/日志（超过 24h）。 */
export function cleanupLegacyRestartScripts() {
  const tmp = os.tmpdir();
  let entries = [];
  try { entries = fs.readdirSync(tmp); } catch { return; }
  const pat = /^Xsdsh-purge-next-official-restart(?:-[0-9a-f-]+)?\.(?:js|cmd|log)$/i;
  for (const name of entries) {
    if (!pat.test(name)) continue;
    const fp = path.join(tmp, name);
    try {
      const st = fs.statSync(fp);
      if (Date.now() - st.mtimeMs > 24 * 60 * 60 * 1000) {
        fs.unlinkSync(fp);
      }
    } catch { /* ignore */ }
  }
}

/** 路径落在 `app.asar/...` 里面。`app.asar` 文件本身和 `app.asar.unpacked` 不算。 */
export function isAsarSealedPath(p) {
  const parts = String(p || "").replace(/\\/g, "/").split("/").filter(Boolean);
  if (parts.length < 2) return false;
  return parts.slice(0, -1).some((seg) => {
    const s = seg.toLowerCase();
    return s.endsWith(".asar") && !s.endsWith(".asar.unpacked");
  });
}

function isFile(fp) {
  try {
    if (isAsarSealedPath(fp)) return false;
    return Boolean(fp) && fs.existsSync(fp) && fs.statSync(fp).isFile();
  } catch {
    return false;
  }
}

function isDir(fp) {
  try {
    if (isAsarSealedPath(fp)) return false;
    return Boolean(fp) && fs.existsSync(fp) && fs.statSync(fp).isDirectory();
  } catch {
    return false;
  }
}

function isAiBase(p) {
  return Boolean(p) && isDir(path.join(p, "dsh-agent-instructions", "lib"));
}

function uniquePaths(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    if (!item) continue;
    const n = path.normalize(item);
    const key = n.replace(/\\/g, "/").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}

function slashNorm(p) {
  return path.normalize(String(p || "")).replace(/\\/g, "/").toLowerCase();
}

function isSubPath(child, root) {
  const c = slashNorm(child).replace(/\/+$/, "");
  const r = slashNorm(root).replace(/\/+$/, "");
  if (!c || !r || r === "/") return false;
  if (/^[a-z]:$/.test(r)) return false;
  return c === r || c.startsWith(`${r}/`);
}

/**
 * 社区桌面、官方 exe、.app 包才算安装树。
 * 只是上级文件夹叫 DeepSeek Harness 不算：npm 前缀和配置目录经常用这个名字，
 * 按名字整棵排除的话，Web 的身份句和 complete 注入补丁会被跳过。
 */
export function looksLikeDesktopName(p) {
  const n = slashNorm(p);
  if (!n) return false;
  return (
    n.includes("/dsh desktop/") ||
    n.includes("/dsh desktop.app/") ||
    n.endsWith("/dsh desktop") ||
    n.endsWith("/dsh desktop.app") ||
    n.includes("dsh-desktop") ||
    n.includes("/deepseek harness/") ||
    n.includes("/deepseek-harness/") ||
    n.includes("/deepseekharness") ||
    /\/deepseek[\s._-]*harness(\/|$)/.test(n) ||
    n.includes("/deepseek harness.app/") ||
    n.endsWith("/deepseek harness.app") ||
    /\/dsh desktop\.exe$/i.test(n) ||
    /\/deepseek[\s._-]*harness\.exe$/i.test(n) ||
    n.includes("/dsh next/") ||
    n.endsWith("/dsh next") ||
    /\/dsh[\s._-]*next\.exe$/i.test(n)
  );
}

const OFFICIAL_HARNESS_BASES = new Set([
  "deepseek harness.exe",
  "deepseek-harness.exe",
  "deepseek harness",
  "deepseek-harness",
  // DSH Next（内核 0.2.1-rc.4）的桌面壳：同样是官方分发，同样把宿主封进 resources/app(|.asar)
  "dsh next.exe",
  "dsh next",
]);

/** DSH Next 桌面壳名字（exe 或 .app 主程序）。 */
const DSH_NEXT_NAME_RE = /^dsh[\s._-]*next(\.exe)?$/;

/**
 * 只把「路径自己那一段」当桌面名字，不看祖先目录。
 *
 * 上面那段注释说要避免的事，原实现其实在做：`n.includes("/deepseek harness/")`
 * 会命中任意祖先目录。而 npm 前缀（`D:\DeepSeek Harness\npm-global\…`）和
 * DSH_HOME 的父目录（`D:\DeepSeek Harness\.dsh` 的上级）恰好都叫这个名字 ——
 * 于是 Web 安装根被判成桌面，findAiBaseWeb 里每一处
 * `!isInsideDesktopInstall(cand)` 守卫都会把正确答案踢掉，Web 面定位不到宿主。
 *
 * 真正的桌面安装靠结构标记判定：路径里含 `/resources/app/`、
 * `/resources/app.asar.unpacked/` 或 `/contents/resources/`（见 inferDesktopInstallDir）。
 * 名字只作为「这一级目录本身就是安装根」的兜底。
 */
export function looksLikeDesktopNameTail(p) {
  const n = slashNorm(p).toLowerCase().replace(/\/+$/, "");
  if (!n) return false;
  const cut = n.lastIndexOf("/");
  const tail = cut >= 0 ? n.slice(cut + 1) : n;
  if (!tail) return false;
  return (
    tail === "dsh desktop" ||
    tail === "dsh desktop.app" ||
    tail === "deepseek harness" ||
    tail === "deepseek harness.app" ||
    tail === "deepseek-harness" ||
    tail === "deepseekharness" ||
    /^dsh-desktop/.test(tail) ||
    tail === "dsh next" ||
    tail === "dsh next.app" ||
    DSH_NEXT_NAME_RE.test(tail) ||
    /^deepseek[\s._-]*harness(\.exe)?$/.test(tail)
  );
}

function sameBase(name, expected) {
  return String(name || "").toLowerCase() === expected;
}

export function isDesktopExecutable(fp) {
  const base = path.basename(String(fp || "")).toLowerCase();
  if (base === "dsh desktop.exe" || base === "dsh desktop") return true;
  if (OFFICIAL_HARNESS_BASES.has(base)) return true;
  if (DSH_NEXT_NAME_RE.test(base)) return true;
  return /^deepseek[\s._-]*harness(\.exe)?$/.test(base);
}

/** 只有官方 DeepSeek Harness 会把宿主封进 app.asar 并在「应用」时解开。第三方 DSH Desktop 不走这条。 */
export function isOfficialHarnessExecutable(fp) {
  const base = path.basename(String(fp || "")).toLowerCase();
  if (OFFICIAL_HARNESS_BASES.has(base)) return true;
  if (DSH_NEXT_NAME_RE.test(base)) return true;
  return /^deepseek[\s._-]*harness(\.exe)?$/.test(base);
}

/** 某个安装目录下可能的 resources 文件夹（mac 大小写敏感盘要 Resources 和 resources 都试）。 */
export function resourceDirCandidates(installDir) {
  if (!installDir) return [];
  const name = path.basename(installDir);
  if (sameBase(name, "macos")) {
    const contents = path.dirname(installDir);
    return [path.join(contents, "Resources"), path.join(contents, "resources")];
  }
  if (sameBase(name, "contents")) {
    return [path.join(installDir, "Resources"), path.join(installDir, "resources")];
  }
  if (name.toLowerCase().endsWith(".app")) {
    return [
      path.join(installDir, "Contents", "Resources"),
      path.join(installDir, "Contents", "resources"),
    ];
  }
  if (sameBase(name, "resources")) return [installDir];
  return [path.join(installDir, "resources"), path.join(installDir, "Resources")];
}

/** 官方宿主的 resources 目录。已存在的 app.asar 优先，否则用该平台的常规目录名。 */
export function resourcesDirForExecutable(exe) {
  const exeDir = path.dirname(path.normalize(String(exe || "")));
  if (!exeDir) return "";
  const cands = resourceDirCandidates(exeDir);
  const withAsar = cands.find((dir) => isFile(path.join(dir, "app.asar")));
  if (withAsar) return withAsar;
  const existing = cands.find((dir) => isDir(dir));
  if (existing) return existing;
  return cands[0] || "";
}

export function appAsarPath(exe) {
  const dir = resourcesDirForExecutable(exe);
  return dir ? path.join(dir, "app.asar") : "";
}

export function appDirForExecutable(exe) {
  const dir = resourcesDirForExecutable(exe);
  return dir ? path.join(dir, "app") : "";
}

function exeCandidatesBeside(dir) {
  if (!dir) return [];
  return [
    path.join(dir, "DeepSeek Harness.exe"),
    path.join(dir, "deepseek-harness.exe"),
    path.join(dir, "DeepSeek Harness"),
    path.join(dir, "deepseek-harness"),
    path.join(dir, "DSH Desktop.exe"),
    path.join(dir, "DSH Desktop"),
    path.join(dir, "DSH NEXT.exe"),
    path.join(dir, "DSH NEXT"),
    path.join(dir, "MacOS", "DeepSeek Harness"),
    path.join(dir, "MacOS", "deepseek-harness"),
    path.join(dir, "MacOS", "DSH Desktop"),
    path.join(dir, "MacOS", "DSH NEXT"),
    path.join(dir, "Contents", "MacOS", "DeepSeek Harness"),
    path.join(dir, "Contents", "MacOS", "deepseek-harness"),
    path.join(dir, "Contents", "MacOS", "DSH Desktop"),
    path.join(dir, "Contents", "MacOS", "DSH NEXT"),
  ];
}

function firstExistingExe(dirs) {
  for (const dir of dirs) {
    if (!dir) continue;
    for (const cand of exeCandidatesBeside(dir)) {
      if (isFile(cand)) return path.normalize(cand);
    }
  }
  return "";
}

const APP_SCRIPT_RE = /(desktop-cli|host-process-entry)\.js$/i;

function installDirsFromAppScript(scriptPath) {
  if (!scriptPath) return [];
  const abs = path.resolve(scriptPath);
  const lib = path.dirname(abs);
  const app = path.dirname(lib);
  const resources = path.dirname(app);
  const install = path.dirname(resources);
  return uniquePaths([lib, app, resources, install]);
}

/** 从任意 `.../resources/app/...` 树反推安装目录（不要求文件夹叫 DSH Desktop）。 */
export function inferDesktopInstallDir(p) {
  const raw = path.normalize(String(p || "")).replace(/\\/g, "/");
  const n = raw.toLowerCase();
  if (!n) return "";
  const markers = [
    "/resources/app.asar.unpacked/",
    "/resources/app/",
    "/contents/resources/",
  ];
  for (const marker of markers) {
    const i = n.indexOf(marker);
    if (i <= 0) continue;
    return path.normalize(raw.slice(0, i));
  }
  return "";
}

function extraInstallsFromEnv(env = process.env) {
  return String(env.DSH_DESKTOP_INSTALL || "")
    .split(path.delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
}

function trustedInstallDir(dir) {
  if (!dir) return false;
  if (looksLikeDesktopName(dir)) return true;
  if (firstExistingExe([dir])) return true;
  return (
    isAiBase(path.join(dir, "resources", "app", "dsh", "node_modules", "@deepseek-ai")) ||
    isAiBase(path.join(dir, "resources", "app", "node_modules", "@deepseek-ai")) ||
    isAiBase(path.join(dir, "resources", "app.asar.unpacked", "dsh", "node_modules", "@deepseek-ai")) ||
    isAiBase(path.join(dir, "resources", "app.asar.unpacked", "node_modules", "@deepseek-ai"))
  );
}

const REGISTRY_INSTALL_SCRIPT = `
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$names = @('DeepSeek Harness','DSH Desktop','DSH NEXT')
$roots = @(
  'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  'HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
)
$rows = foreach ($root in $roots) {
  if (-not (Test-Path $root)) { continue }
  Get-ChildItem $root -ErrorAction SilentlyContinue | ForEach-Object {
    $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
    if (-not $p.DisplayName) { return }
    $hit = $false
    foreach ($n in $names) { if ($p.DisplayName -like ('*' + $n + '*')) { $hit = $true } }
    if (-not $hit) { return }
    [pscustomobject]@{
      InstallLocation = [string]$p.InstallLocation
      DisplayIcon = [string]$p.DisplayIcon
      UninstallString = [string]$p.UninstallString
    }
  }
}
if ($rows) { @($rows) | ConvertTo-Json -Compress }
`.trim();

function exeDirFromRegistryValue(value) {
  let val = String(value || "").trim();
  const quoted = val.match(/^"([^"]+)"/);
  if (quoted) val = quoted[1];
  val = val.replace(/,0$/, "").trim();
  if (!val) return "";
  return path.normalize(path.dirname(val));
}

let cachedRegistryDirs;
/** 从卸载登记读安装目录。盘符跟着用户安装位置，不写死。 */
export function registryInstallDirs() {
  if (cachedRegistryDirs !== undefined) return cachedRegistryDirs;
  if (process.platform !== "win32") {
    cachedRegistryDirs = [];
    return cachedRegistryDirs;
  }
  let text = "";
  try {
    text = execFileSync("powershell.exe", ["-NoProfile", "-Command", REGISTRY_INSTALL_SCRIPT], {
      encoding: "utf8",
      windowsHide: true,
      timeout: 15000,
      maxBuffer: 8 << 20,
    });
  } catch {
    return [];
  }
  let rows = [];
  try {
    const parsed = JSON.parse(String(text || "").replace(/^\uFEFF/, "").trim() || "[]");
    rows = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
  } catch {
    return [];
  }
  const found = [];
  for (const row of rows) {
    const location = String(row.InstallLocation || "").trim();
    if (location) found.push(path.normalize(location));
    found.push(exeDirFromRegistryValue(row.DisplayIcon));
    found.push(exeDirFromRegistryValue(row.UninstallString));
  }
  const result = uniquePaths(found).filter((dir) => firstExistingExe([dir]));
  if (result.length > 0) cachedRegistryDirs = result;
  return result;
}

const PORTABLE_INSTALL_NAMES = [
  "DeepSeek Harness",
  "DeepseekHarnessDesktop",
  "DeepSeekHarnessDesktop",
  "DSH Desktop",
  "deepseek-harness",
  "DSH NEXT",
];

function homeSiblingInstalls(env = process.env) {
  const homes = [env.DSH_HOME, env.DSH_BASE].filter(Boolean);
  const dirs = [];
  for (const raw of homes) {
    const start = path.normalize(String(raw));
    dirs.push(start, path.dirname(start), path.dirname(path.dirname(start)));
  }
  return uniquePaths(dirs).filter((dir) => firstExistingExe([dir]));
}

/** 用户目录和各盘根下一层常见文件夹名。不扫整盘。 */
function portableInstallGuesses(env = process.env) {
  const home = os.homedir();
  const cands = [];
  for (const folder of ["Desktop", "Documents", "Downloads"]) {
    for (const name of PORTABLE_INSTALL_NAMES) {
      cands.push(path.join(home, folder, name));
    }
  }
  for (const name of PORTABLE_INSTALL_NAMES) {
    cands.push(path.join(home, name));
  }
  if (process.platform === "win32") {
    for (const letter of "CDEFGHI") {
      for (const name of PORTABLE_INSTALL_NAMES) {
        cands.push(`${letter}:\\${name}`);
      }
    }
  }
  return uniquePaths(cands).filter((dir) => firstExistingExe([dir]));
}

function walkParentsForOfficialExe(start, maxUp = 8) {
  if (!start) return "";
  let dir = "";
  try {
    const abs = path.resolve(String(start));
    dir = isDir(abs) ? abs : path.dirname(abs);
  } catch {
    return "";
  }
  for (let i = 0; i < maxUp && dir; i += 1) {
    const hit = firstExistingExe([dir]);
    if (hit) return hit;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return "";
}

const PROCESS_EXE_SCRIPT = `
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$re = 'DeepSeek Harness\\.exe$|deepseek-harness\\.exe$|DSH Desktop\\.exe$|DSH NEXT\\.exe$'
$paths = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Where-Object { $_.ExecutablePath -and $_.ExecutablePath -match $re } |
  Select-Object -ExpandProperty ExecutablePath)
if ($paths) { @($paths) | ConvertTo-Json -Compress }
`.trim();

let cachedRunningExes;
function runningOfficialExecutables() {
  if (cachedRunningExes !== undefined) return cachedRunningExes;
  if (process.platform !== "win32") {
    cachedRunningExes = [];
    return cachedRunningExes;
  }
  let text = "";
  try {
    text = execFileSync("powershell.exe", ["-NoProfile", "-Command", PROCESS_EXE_SCRIPT], {
      encoding: "utf8",
      windowsHide: true,
      // 15s 会把启动期的 UI 线程卡 15s;Win32_Process 枚举 1-3s 够用,超时直接退不缓存。
      timeout: 6000,
      maxBuffer: 8 << 20,
    });
  } catch {
    // 探测失败不缓存空结果，否则整次进程都找不到正在跑的客户端。
    return [];
  }
  let rows = [];
  try {
    const parsed = JSON.parse(String(text || "").replace(/^\uFEFF/, "").trim() || "[]");
    rows = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
  } catch {
    return [];
  }
  // 结果为空也不缓存：客户端可能稍后才启动，否则本进程后续永远找不到它。
  const result = uniquePaths(rows.map((item) => String(item || "").trim()).filter((fp) => isDesktopExecutable(fp) && isFile(fp)));
  if (result.length > 0) cachedRunningExes = result;
  return result;
}

const SHORTCUT_EXE_SCRIPT = `
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$shell = New-Object -ComObject WScript.Shell
$roots = @(
  [Environment]::GetFolderPath('StartMenu'),
  [Environment]::GetFolderPath('CommonStartMenu'),
  [Environment]::GetFolderPath('Desktop'),
  [Environment]::GetFolderPath('CommonDesktopDirectory')
) | Where-Object { $_ }
$pats = @('*DeepSeek*Harness*.lnk','*DSH Desktop*.lnk','*deepseek-harness*.lnk','*DSH NEXT*.lnk')
$out = New-Object System.Collections.Generic.List[string]
foreach ($root in $roots) {
  if (-not (Test-Path -LiteralPath $root)) { continue }
  foreach ($pat in $pats) {
    Get-ChildItem -LiteralPath $root -Filter $pat -Recurse -ErrorAction SilentlyContinue |
      Select-Object -First 16 | ForEach-Object {
        try {
          $t = $shell.CreateShortcut($_.FullName).TargetPath
          if ($t) { $out.Add([string]$t) }
        } catch {}
      }
  }
}
if ($out.Count) { @($out) | ConvertTo-Json -Compress }
`.trim();

let cachedShortcutExes;
function shortcutOfficialExecutables() {
  if (cachedShortcutExes !== undefined) return cachedShortcutExes;
  if (process.platform !== "win32") {
    cachedShortcutExes = [];
    return cachedShortcutExes;
  }
  let text = "";
  try {
    text = execFileSync("powershell.exe", ["-NoProfile", "-Command", SHORTCUT_EXE_SCRIPT], {
      encoding: "utf8",
      windowsHide: true,
      timeout: 15000,
      maxBuffer: 8 << 20,
    });
  } catch {
    return [];
  }
  let rows = [];
  try {
    const parsed = JSON.parse(String(text || "").replace(/^\uFEFF/, "").trim() || "[]");
    rows = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
  } catch {
    return [];
  }
  const result = uniquePaths(rows.map((item) => String(item || "").trim()).filter((fp) => isDesktopExecutable(fp) && isFile(fp)));
  if (result.length > 0) cachedShortcutExes = result;
  return result;
}

/** 点「应用」前清掉失败的空缓存，重新找本机 exe。 */
export function clearDesktopLocateCache() {
  cachedRunningExes = undefined;
  cachedShortcutExes = undefined;
  cachedRegistryDirs = undefined;
}

/* ── 换目录前强制结束本安装的 DSH 进程（应用死锁的第一层修复）─────────────────
 *
 * 为什么非杀不可：`commitExtractedDir` 要 `renameSync` 整个 `resources/app` 目录。
 * Windows 上只要 DSH 进程还开着（Electron main、host、渲染进程都会持有
 * `resources` 下的 dll / 原生 .node / 正在读的 js），目录 rename 只有两种下场：
 *   · 立刻 EPERM / EACCES / EBUSY；
 *   · 杀毒软件或索引服务插一脚，**长时间阻塞**（现场实测几十秒到几分钟）。
 * 阻塞期间 HTTP 请求拿不到响应 → 前端永远停在「正在进行」；而 app.asar 已经被
 * 挪走、resources/app 又没换成功 → `/status` 返回 asar_still_sealed=false 且
 * 找不到 aiBase → UI 降级成「还没定位到本机 Harness」。
 *
 * 判定逻辑与 PS1 里的 `Stop-HarnessInstall` 完全一致：**按安装根路径精确匹配**
 * （exe 全路径相等，或 ExecutablePath 落在安装根目录之下），
 * 不用 `taskkill /IM 名称` —— 那样会把同名的第三方进程一起杀掉。
 */

/** 同步睡眠。`Atomics.wait` 不占 CPU；环境不支持时退回自旋。 */
function sleepSync(ms) {
  const n = Math.floor(Number(ms) || 0);
  if (n <= 0) return;
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
  } catch {
    const end = Date.now() + n;
    while (Date.now() < end) { /* 自旋兜底 */ }
  }
}

/**
 * 安装根目录：exe 所在目录。
 *
 * **必须拒绝盘根和过浅目录**：判定用的是 `ExecutablePath.StartsWith(root + '\\')`，
 * 一旦 root 退化成 `C:\`，`StartsWith("c:\")` 会命中 C 盘上**所有**进程 ——
 * 包括正在跑 apply 的这个 dsh 自己、它的父进程、以及用户开着的每一个程序。
 * 实测过：那种情况下 PowerShell 把调用方一起杀掉，Node 直接以 0xFFFFFFFF 退出，
 * 连错误都报不出来。
 *
 * 会退化到盘根的真实输入：裸文件名（`DeepSeek Harness.exe`，按 cwd resolve）、
 * 反斜杠被吃掉一半的路径（`C:NoSuchInstall\X.exe`）、用户手工输入的盘根路径。
 * 这类输入一律返回空串，调用方按「没有可信安装根」处理：不杀进程，只做 rename。
 */
function installRootForExe(exe) {
  const fp = String(exe || "").trim();
  if (!fp) return "";
  // 没有路径分隔符的裸文件名不是安装路径，resolve 出来的目录是 cwd，杀它是误伤。
  if (!fp.includes("/") && !fp.includes("\\")) return "";
  try {
    const resolved = path.resolve(fp);
    const dir = path.dirname(resolved);
    if (!dir) return "";
    const parsed = path.parse(dir);
    // dir 等于它自己的 root（`C:\` / `/`）→ 盘根，绝不可作为匹配前缀。
    if (!parsed.root || path.resolve(dir) === path.resolve(parsed.root)) return "";
    return dir;
  } catch {
    return "";
  }
}

/* 一次「杀 + 复检」。返回 { killed:[pid], remaining:[pid], protected:[pid] }。
   `kill:false` 时只枚举不杀，用于最终复检。

   **必须排除自身与全部祖先进程**：本插件就跑在 DSH 里，apply 的 HTTP 响应正是
   由被杀的进程发出的。真机实测过不排除的后果：按安装根匹配到 7 个 DSH 进程，
   其中包括调用方自己，PowerShell 一路杀上去，Node 以 0xFFFFFFFF 退出，
   HTTP 请求永远收不到响应 —— 这比原来的 rename 阻塞更彻底地复现了
   「点应用后一直显示正在进行」。祖先链在 PS 里从 $PID 向上走 ParentProcessId。 */
const KILL_SWEEP_SCRIPT = `
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$rootLow = ''
if ($env:XSDSH_INSTALL_ROOT) { $rootLow = $env:XSDSH_INSTALL_ROOT.ToLower().TrimEnd([char]92) }
$exeLow = ''
if ($env:XSDSH_INSTALL_EXE) { $exeLow = $env:XSDSH_INSTALL_EXE.ToLower() }
$doKill = $env:XSDSH_KILL_SWEEP -ne '0'
$sep = [char]92
# 自身 + 全部祖先：这些进程绝不能被本函数杀掉（会连带杀死 HTTP 服务端）。
$selfPid = 0
if ($env:XSDSH_SELF_PID) { [int]::TryParse($env:XSDSH_SELF_PID, [ref]$selfPid) | Out-Null }
$allProcs = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)
$protected = New-Object 'System.Collections.Generic.HashSet[int]'
if ($selfPid -gt 0) {
  $byId = @{}
  foreach ($p in $allProcs) { $byId[[int]$p.ProcessId] = $p }
  $cur = $selfPid
  $guard = 0
  while ($cur -gt 0 -and $guard -lt 64) {
    if (-not $protected.Add($cur)) { break }
    $node = $byId[$cur]
    if (-not $node) { break }
    $cur = [int]$node.ParentProcessId
    $guard++
  }
}
$isInstallProc = {
  param($p)
  $ep = $p.ExecutablePath
  if (-not $ep) { return $false }
  $low = $ep.ToLower()
  if ($exeLow -and $low -eq $exeLow) { return $true }
  if (-not $rootLow) { return $false }
  return $low.StartsWith($rootLow + $sep)
}
$targets = @($allProcs | Where-Object {
  (& $isInstallProc $_) -and (-not $protected.Contains([int]$_.ProcessId))
})
$killed = @()
if ($doKill) {
  foreach ($p in $targets) {
    try {
      Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop
      $killed += [int]$p.ProcessId
    } catch { }
  }
  Start-Sleep -Milliseconds 250
}
# 复检要重新枚举：上面的 $allProcs 是杀之前的快照。
$remaining = @(
  Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    (& $isInstallProc $_) -and (-not $protected.Contains([int]$_.ProcessId))
  } | ForEach-Object { [int]$_.ProcessId }
)
@{ killed = @($killed); remaining = @($remaining); protected = @($protected) } | ConvertTo-Json -Compress
`.trim();

function defaultKillSweep(root, exe, { kill = true, selfPid = process.pid } = {}) {
  const text = execFileSync("powershell.exe", ["-NoProfile", "-Command", KILL_SWEEP_SCRIPT], {
    encoding: "utf8",
    windowsHide: true,
    // 两次杀 + 复检串起来也就几秒；15 s 是 Win32_Process 枚举卡死时的兜底。
    timeout: 15000,
    maxBuffer: 4 << 20,
    env: {
      ...process.env,
      XSDSH_INSTALL_ROOT: String(root || ""),
      XSDSH_INSTALL_EXE: String(exe || ""),
      XSDSH_KILL_SWEEP: kill ? "1" : "0",
      XSDSH_SELF_PID: String(Number(selfPid) > 0 ? Math.floor(Number(selfPid)) : 0),
    },
  });
  const parsed = JSON.parse(String(text || "").replace(/^\uFEFF/, "").trim() || "{}");
  const toPids = (v) => {
    const arr = Array.isArray(v) ? v : v == null ? [] : [v];
    return arr.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0);
  };
  return { killed: toPids(parsed.killed), remaining: toPids(parsed.remaining), protected: toPids(parsed.protected) };
}

/**
 * 结束本安装下**除自己与祖先之外**的所有 DSH 进程，返回 `{ killed, remaining, ok }`。
 *
 * `ok === true` 当且仅当**复检时 remaining 为空** —— 只有这时调用方才允许去
 * rename `resources/app`。连续两轮杀 + 短等待仍杀不干净（权限、受保护进程、
 * 杀毒软件拦刀）就如实返回，由调用方给出具名错误，绝不硬着头皮 rename。
 *
 * 自身与祖先进程同时从 `killed` 与 `remaining` 里排除：它们不是「没杀掉的残留」，
 * 而是**本来就不该杀**的调用方。把它们算进 remaining 会让 ok 恒为 false，
 * 于是每次 apply 都报「关闭 DeepSeek Harness 后再点应用」而永远应用不了。
 *
 * @param {{ exe?: string, sweeps?: number, waitMs?: number, selfPid?: number,
 *           sweep?: (root: string, exe: string, opts: {kill: boolean, selfPid: number}) => {killed:number[], remaining:number[], protected?:number[]} }} [options]
 *        `sweep` 仅供测试注入（真机杀进程不可重复、不可断言）。
 */
export function killDesktopProcessesForInstall(options = {}) {
  const exe = String(options.exe || "").trim();
  const root = installRootForExe(exe);
  if (!root) {
    // 没有可信安装根：不杀。裸文件名 / 盘根路径 resolve 出来是 cwd 或 `C:\`，
    // 按它匹配等于杀全盘，包括调用方自己。
    return { killed: [], remaining: [], ok: true, root: "", skipped: exe ? "bad-root" : "no-exe", protected: [] };
  }
  if (process.platform !== "win32") {
    // 非 Windows 没有「目录被进程占用就不能 rename」这套语义，不杀。
    return { killed: [], remaining: [], ok: true, root, skipped: "platform", protected: [] };
  }
  const sweeps = Number.isFinite(Number(options.sweeps)) ? Math.max(1, Math.floor(Number(options.sweeps))) : 2;
  const waitMs = Number.isFinite(Number(options.waitMs)) ? Math.max(0, Number(options.waitMs)) : 400;
  const selfPid = Number.isFinite(Number(options.selfPid)) && Number(options.selfPid) > 0
    ? Math.floor(Number(options.selfPid))
    : process.pid;
  const runSweep = typeof options.sweep === "function" ? options.sweep : defaultKillSweep;

  const killed = [];
  const guarded = new Set([selfPid]);
  const remember = (pids) => {
    for (const pid of pids || []) if (!killed.includes(pid)) killed.push(pid);
  };
  let remaining = [];

  for (let i = 0; i < sweeps; i += 1) {
    let out = null;
    try { out = runSweep(root, exe, { kill: true, selfPid }); } catch { out = null; }
    if (out) {
      remember(out.killed);
      for (const pid of out.protected || []) guarded.add(Number(pid));
      remaining = (out.remaining || []).map(Number).filter((n) => Number.isFinite(n) && n > 0 && !guarded.has(n));
    }
    if (remaining.length === 0) break;
    if (i < sweeps - 1) sleepSync(waitMs);
  }

  // 最后一轮只复检不杀：Stop-Process 返回后句柄释放有延迟，立刻复检会误报。
  if (remaining.length > 0) {
    sleepSync(waitMs);
    try {
      const out = runSweep(root, exe, { kill: false, selfPid });
      if (out) {
        remember(out.killed);
        for (const pid of out.protected || []) guarded.add(Number(pid));
        remaining = (out.remaining || []).map(Number).filter((n) => Number.isFinite(n) && n > 0 && !guarded.has(n));
      }
    } catch { /* 复检失败就按上一轮结果判，宁可报 remaining 也不谎报干净 */ }
  }

  const ok = remaining.length === 0;
  // 杀过进程就等于文件系统状态变了：把进程/快捷方式/注册表定位缓存全部作废，
  // 否则后续 findDesktopAppExecutable 还会返回刚被杀掉那个 exe 的旧结论。
  if (killed.length > 0) clearDesktopLocateCache();
  return { killed, remaining, ok, root, protected: [...guarded].filter((n) => Number.isFinite(n) && n > 0) };
}

function extraDiscoveredInstallDirs(env = process.env, input = {}) {
  const cheap = [
    ...homeSiblingInstalls(env),
    ...portableInstallGuesses(env),
  ];
  if (input.discover !== true) return uniquePaths(cheap);
  return uniquePaths([
    ...cheap,
    ...runningOfficialExecutables().map((exe) => path.dirname(exe)),
    ...shortcutOfficialExecutables().map((exe) => path.dirname(exe)),
  ]);
}

/** NSIS / 商店默认位置；不是全盘扫描。discover 才查注册表 / 进程 / 快捷方式。 */
export function commonDesktopInstallDirs(env = process.env, input = {}) {
  const discover = input.discover === true;
  const home = os.homedir();
  const local = env.LOCALAPPDATA || path.join(home, "AppData", "Local");
  const pf = env.ProgramFiles || "";
  const pf86 = env["ProgramFiles(x86)"] || "";
  return uniquePaths([
    ...extraInstallsFromEnv(env).filter(trustedInstallDir),
    ...(discover ? registryInstallDirs() : []),
    ...extraDiscoveredInstallDirs(env, { discover }),
    path.join(local, "Programs", "DeepSeek Harness"),
    path.join(local, "Programs", "DSH Desktop"),
    path.join(local, "Programs", "DSH NEXT"),
    path.join(local, "DeepSeek Harness"),
    ...(pf
      ? [path.join(pf, "DeepSeek Harness"), path.join(pf, "DSH Desktop"), path.join(pf, "DSH NEXT")]
      : []),
    ...(pf86
      ? [path.join(pf86, "DeepSeek Harness"), path.join(pf86, "DSH Desktop"), path.join(pf86, "DSH NEXT")]
      : []),
    "/Applications/DeepSeek Harness.app",
    "/Applications/DSH Desktop.app",
    path.join(home, "Applications", "DeepSeek Harness.app"),
    path.join(home, "Applications", "DSH Desktop.app"),
    "/opt/DeepSeek Harness",
    "/opt/deepseek-harness",
    "/usr/lib/DeepSeek Harness",
    "/usr/lib/deepseek-harness",
    "/usr/share/deepseek-harness",
    path.join(home, ".local", "share", "DeepSeek Harness"),
    path.join(home, ".local", "share", "deepseek-harness"),
    "/opt/DSH Desktop",
    "/usr/lib/dsh-desktop",
  ]);
}

export function listDesktopInstallRoots(input = {}) {
  const execPath = input.execPath ?? process.execPath;
  const resourcesPath = input.resourcesPath ?? process.resourcesPath;
  const argv = input.argv ?? process.argv;
  const env = input.env ?? process.env;
  const roots = [];

  if (isDesktopExecutable(execPath)) {
    const dir = path.dirname(path.normalize(execPath));
    roots.push(dir);
    if (sameBase(path.basename(dir), "macos")) {
      const contents = path.dirname(dir);
      roots.push(
        contents,
        path.join(contents, "Resources"),
        path.join(contents, "resources"),
        path.dirname(contents),
      );
    }
  }

  if (resourcesPath) {
    const res = path.normalize(resourcesPath);
    roots.push(res, path.dirname(res), path.join(res, "app"), path.join(res, "app.asar.unpacked"));
  }

  for (const arg of argv) {
    if (typeof arg === "string" && APP_SCRIPT_RE.test(arg)) {
      roots.push(...installDirsFromAppScript(arg));
    }
  }

  for (const extra of extraInstallsFromEnv(env)) {
    if (trustedInstallDir(extra)) roots.push(extra);
  }
  return uniquePaths(roots);
}

/**
 * 是否落在社区 Desktop 安装树。
 * 不依赖盘符、也不要求文件夹叫 “DSH Desktop”：
 * 当前进程的 exe / resources / host-process-entry、旁边真有桌面 exe，或社区安装目录名。
 */
export function isInsideDesktopInstall(p, input = {}) {
  if (!p) return false;
  // 名字兜底只看路径尾部那一段，不看祖先目录名 —— 见 looksLikeDesktopNameTail。
  if (looksLikeDesktopNameTail(p)) return true;
  const roots = listDesktopInstallRoots(input);
  if (roots.some((root) => isSubPath(p, root))) return true;
  const inferred = inferDesktopInstallDir(p);
  if (!inferred) return false;
  if (roots.some((root) => isSubPath(inferred, root) || isSubPath(root, inferred))) return true;
  return Boolean(firstExistingExe([inferred]));
}

export function findDesktopAppExecutable(input = {}) {
  const execPath = input.execPath ?? process.execPath;
  const resourcesPath = input.resourcesPath ?? process.resourcesPath;
  const argv = input.argv ?? process.argv;
  const env = input.env ?? process.env;
  const discover = input.discover === true;

  if (isDesktopExecutable(execPath) && isFile(execPath)) return path.normalize(execPath);

  if (resourcesPath) {
    const hit = firstExistingExe([path.dirname(path.normalize(resourcesPath))]);
    if (hit) return hit;
  }

  for (const arg of argv) {
    if (typeof arg !== "string" || !APP_SCRIPT_RE.test(arg)) continue;
    const hit = firstExistingExe(installDirsFromAppScript(arg));
    if (hit) return hit;
  }

  const walkStarts = [execPath, resourcesPath, env.DSH_HOME, env.DSH_BASE];
  try { walkStarts.push(process.cwd()); } catch { /* ignore */ }
  for (const arg of argv) {
    if (typeof arg === "string") walkStarts.push(arg);
  }
  for (const start of walkStarts) {
    const hit = walkParentsForOfficialExe(start);
    if (hit) return hit;
  }

  if (discover) {
    const running = runningOfficialExecutables();
    if (running[0]) return running[0];
    const shortcuts = shortcutOfficialExecutables();
    if (shortcuts[0]) return shortcuts[0];
  }

  const guessed = firstExistingExe([
    ...extraInstallsFromEnv(env),
    ...commonDesktopInstallDirs(env, { discover }),
  ]);
  return guessed || "";
}

function packageRootsFromInstall(installDir) {
  if (!installDir) return [];
  const out = [];
  for (const resources of resourceDirCandidates(installDir)) {
    out.push(
      path.join(resources, "app", "dsh", "node_modules", "@deepseek-ai"),
      path.join(resources, "app", "node_modules", "@deepseek-ai"),
      path.join(resources, "app.asar.unpacked", "dsh", "node_modules", "@deepseek-ai"),
      path.join(resources, "app.asar.unpacked", "node_modules", "@deepseek-ai"),
    );
  }
  return out;
}

export function listDesktopPackageRoots(input = {}) {
  const execPath = input.execPath ?? process.execPath;
  const resourcesPath = input.resourcesPath ?? process.resourcesPath;
  const argv = input.argv ?? process.argv;
  const env = input.env ?? process.env;
  const discover = input.discover === true;
  const cands = [];

  if (resourcesPath) {
    cands.push(
      path.join(resourcesPath, "app", "dsh", "node_modules", "@deepseek-ai"),
      path.join(resourcesPath, "app", "node_modules", "@deepseek-ai"),
      path.join(resourcesPath, "app.asar.unpacked", "dsh", "node_modules", "@deepseek-ai"),
      path.join(resourcesPath, "app.asar.unpacked", "node_modules", "@deepseek-ai"),
    );
  }

  if (isDesktopExecutable(execPath)) {
    cands.push(...packageRootsFromInstall(path.dirname(execPath)));
  }

  const exe = findDesktopAppExecutable(input);
  if (exe) cands.push(...packageRootsFromInstall(path.dirname(exe)));

  for (const arg of argv) {
    if (typeof arg !== "string" || !APP_SCRIPT_RE.test(arg)) continue;
    const appDir = path.dirname(path.dirname(path.resolve(arg)));
    cands.push(path.join(appDir, "node_modules", "@deepseek-ai"));
    cands.push(path.join(appDir, "dsh", "node_modules", "@deepseek-ai"));
    cands.push(...packageRootsFromInstall(path.dirname(path.dirname(appDir))));
  }

  const localHits = uniquePaths(cands).filter(isAiBase);
  // 已经在某个桌面 exe 里时，只改这一份。旁边装了另一种客户端也不能被带上。
  if (isDesktopExecutable(execPath)) return localHits;
  // 启动自愈：exe / 环境 / 常见目录已经够用。注册表和快捷方式留给点「应用」。
  if (!discover && localHits.length) return localHits;

  for (const install of commonDesktopInstallDirs(env, { discover })) {
    cands.push(...packageRootsFromInstall(install));
  }

  return uniquePaths(cands).filter(isAiBase);
}

export function resolveDesktopAiBase(input = {}) {
  return listDesktopPackageRoots(input)[0] || null;
}

export function isSealedRuntimeDir(dir) {
  if (!dir) return false;
  const n = path.normalize(dir).replace(/\\/g, "/").toLowerCase();
  if (!/(^|\/)bin\/?$/.test(n)) return false;
  return (
    n.includes("/host-commands/") ||
    n.includes("/runtime-commands/") ||
    n.includes("/dsh desktop/")
  );
}

export function sealedRuntimeRoots(env = process.env) {
  const home = os.homedir();
  const appdata = env.APPDATA || path.join(home, "AppData", "Roaming");
  const localapp = env.LOCALAPPDATA || path.join(home, "AppData", "Local");
  return uniquePaths([
    path.join(appdata, "DSH Desktop", "host-commands"),
    path.join(appdata, "DSH Desktop", "runtime-commands"),
    path.join(localapp, "DSH Desktop", "host-commands"),
    path.join(localapp, "DSH Desktop", "runtime-commands"),
    path.join(home, "Library", "Application Support", "DSH Desktop", "host-commands"),
  ]);
}

function walkBinDirs(dir, out, depth) {
  if (depth < 0 || !isDir(dir)) return;
  const n = dir.replace(/\\/g, "/").toLowerCase();
  if (/(^|\/)bin$/.test(n)) {
    out.push(path.normalize(dir));
    return;
  }
  let ents = [];
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of ents) {
    if (ent.isDirectory()) walkBinDirs(path.join(dir, ent.name), out, depth - 1);
  }
}

export function listSealedRuntimeBins(env = process.env) {
  const out = [];
  for (const root of sealedRuntimeRoots(env)) walkBinDirs(root, out, 5);
  return uniquePaths(out).filter(isSealedRuntimeDir);
}

export function restartNote() {
  return "正在重启桌面应用…";
}

export function restartPlan(input = {}) {
  const exe = findDesktopAppExecutable(input);
  if (!exe) {
    return { kind: "desktop", execPath: "", argv: [], cwd: "", error: "未找到 DSH Desktop.exe，无法重启桌面应用" };
  }
  return {
    kind: "desktop",
    execPath: exe,
    argv: [],
    cwd: path.dirname(exe),
  };
}

function helperEnv(payload) {
  const env = { ...process.env };
  delete env.DSH_PERMISSION_MODE;
  env.ELECTRON_RUN_AS_NODE = "1";
  env.DSH_PURGE_RESTART = JSON.stringify(payload);
  return env;
}

// #85 reverted: host 自己同步杀 Electron 会导致 host 作为 Electron 子进程被 Job
// Object 连带杀,spawnHelper 来不及调用 → relaunch 彻底失败 (YG 实测现象:点"重启"
// 没反应,DSH 全死没 relaunch)。改回让 helper 全权处理 kill+relaunch,crash dialog
// 问题靠 patch #83+#84 (新 main.js 加载后 close 回调 silent) 解决第二次之后,
// 第一次 restart 的 crash dialog 是 Electron 内存版本滞后的必然代价,无法避免。

function spawnHelper(helper, payload, opts = {}) {
  const plan = restartPlan();
  const hinted = payload && payload.execPath ? payload.execPath : "";
  const execPath = hinted || plan.execPath;
  if (!execPath) throw new Error(plan.error || "未找到 DSH Desktop.exe，无法重启桌面应用");
  const child = spawn(process.execPath, [helper], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    shell: false,
    env: helperEnv({
      kind: "desktop",
      execPath,
      argv: plan.argv,
      cwd: plan.cwd || path.dirname(execPath),
      pid: process.pid,
      ...payload,
    }),
  });
  child.on("error", (err) => {
    logRestartHelper(
      `helper spawn error: helper=${helper} exec=${process.execPath}`
      + ` ${err && err.message ? err.message : err}`
      + (err && err.code ? ` code=${err.code}` : ""),
    );
  });
  child.unref();
  if (opts.exit !== false) setTimeout(() => process.exit(0), opts.exitAfter ?? 250);
}

function desktopRuntimeOf(ctx) {
  if (!ctx || typeof ctx.get !== "function") return null;
  const runtime = ctx.get("desktopRuntime") || ctx.get("desktopActions");
  return runtime && typeof runtime.requestRestart === "function" ? runtime : null;
}

const ASAR_SWAP_PS1 = [
  "param(",
  "  [Parameter(Mandatory = $true)][int]$WaitPid,",
  "  [Parameter(Mandatory = $true)][string]$AsarPath,",
  "  [Parameter(Mandatory = $true)][string]$ExePath",
  ")",
  "$ErrorActionPreference = 'Continue'",
  "# stdio is ignore: if this script is TerminateProcess'd from outside, these",
  "# lines are the only trace we will ever get.",
  // 文件名来自 ASAR_SWAP_LOG_NAME（唯一来源），JS 侧 asarSwapLogPath() 用的是同一个常量。
  "$SwapLog = Join-Path $env:TEMP '" + ASAR_SWAP_LOG_NAME + "'",
  "function Write-SwapLog([string]$m) {",
  "  try { Add-Content -LiteralPath $SwapLog -Encoding utf8 -Value ((Get-Date).ToString('o') + ' pid=' + $PID + ' ' + $m) } catch { }",
  "}",
  "Write-SwapLog ('begin waitPid=' + $WaitPid + ' asar=' + $AsarPath)",
  "$names = @('DeepSeek Harness', 'DSH Desktop', 'DSH NEXT')",
  "$installRoot = (Split-Path -Parent $ExePath).TrimEnd('\\')",
  "$exeNorm = $ExePath.ToLower()",
  "function Stop-HarnessInstall {",
  "  # 仅按本次安装根路径杀本安装的进程；不再用 /IM 全名杀，避免误伤同名第三方。",
  "  Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {",
  "    $ep = $_.ExecutablePath",
  "    if (-not $ep) { return $false }",
  "    $low = $ep.ToLower()",
  "    return ($low -eq $exeNorm) -or $low.StartsWith($installRoot.ToLower() + '\\')",
  "  } | ForEach-Object {",
  "    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue",
  "  }",
  "}",
  "# #64 crash-dialog 根因消除:不再等 WaitPid (host) 优雅退出,因为那样 Electron main",
  "# 会先看到 host 退出 -> main.js:3725 ChildProcess listener 弹\"host stopped\"对话框。",
  "# 改为立即 Stop-HarnessInstall (包括 Electron main + host 一起杀),Electron 还没",
  "# 来得及处理 host 退出事件就被 kill,UI 根本不存在,无法弹 crash dialog。",
  "# PowerShell 本身是 detached 独立进程(spawn 时 detached:true, stdio:ignore),",
  "# 杀 Electron 不会连带杀 PowerShell。",
  "Write-SwapLog 'step: kill sweep 1'",
  "Stop-HarnessInstall",
  "Start-Sleep -Milliseconds 500",
  "Stop-HarnessInstall",
  "Start-Sleep -Milliseconds 300",
  "Write-SwapLog 'step: kill sweeps done'",
  "# 兜底:万一上面没完全杀干净(例如 CimInstance 枚举漏掉某个进程),再按短超时等一下。",
  "$deadline = (Get-Date).AddSeconds(10)",
  "while ((Get-Date) -lt $deadline) {",
  "  $self = Get-Process -Id $WaitPid -ErrorAction SilentlyContinue",
  "  $holding = @(Get-Process -Name $names -ErrorAction SilentlyContinue | Where-Object {",
  "    try { $_.Path -and ($_.Path.ToLower() -eq $exeNorm -or $_.Path.ToLower().StartsWith($installRoot.ToLower() + '\\')) } catch { $false }",
  "  })",
  "  if (-not $self -and $holding.Count -eq 0) { break }",
  "  Stop-HarnessInstall",
  "  Start-Sleep -Milliseconds 300",
  "}",
  "Start-Sleep -Milliseconds 500",
  "Write-SwapLog 'step: handles should be gone'",
  "$appDir = Join-Path (Split-Path -Parent $AsarPath) 'app'",
  "$unpacked = $AsarPath + '.unpacked'",
  "$marker = Join-Path $appDir 'dsh\\node_modules\\node-addon-require-builtin-win32-x64-msvc\\prebuilt\\win32-x64-msvc-napi-v9.node'",
  "if ((Test-Path -LiteralPath $unpacked) -and -not (Test-Path -LiteralPath $marker)) {",
  "  & robocopy.exe $unpacked $appDir /E /XC /XN /XO /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null",
  "}",
  "$moved = -not (Test-Path -LiteralPath $AsarPath)",
  "Write-SwapLog ('step: asarPresent=' + (Test-Path -LiteralPath $AsarPath))",
  "if (Test-Path -LiteralPath $AsarPath) {",
  "  $bak = \"$AsarPath.bak\"",
  "  if (Test-Path -LiteralPath $bak) { Remove-Item -LiteralPath $bak -Force -ErrorAction SilentlyContinue }",
  "  for ($i = 0; $i -lt 80; $i++) {",
  "    try {",
  "      Move-Item -LiteralPath $AsarPath -Destination $bak -Force",
  "      $moved = $true",
  "      Write-SwapLog ('moved after ' + $i + ' tries')",
  "      break",
  "    } catch {",
  "      Write-SwapLog ('move try ' + $i + ' failed: ' + $_.Exception.Message)",
  "      if ($i -eq 20 -or $i -eq 50) { Write-SwapLog 'step: retry kill sweep'; Stop-HarnessInstall; Start-Sleep -Seconds 1 }",
  "      Start-Sleep -Milliseconds 400",
  "    }",
  "  }",
  "}",
  "$lock = $AsarPath + '.rename-pending'",
  "if ($moved) {",
  "  Write-SwapLog 'step: relaunching harness'",
  "  Remove-Item -LiteralPath $lock -Force -ErrorAction SilentlyContinue",
  "  Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue",
  "  Start-Process -FilePath $ExePath",
  "  Write-SwapLog 'done: relaunched'",
  "} else {",
  "  Write-SwapLog 'FAIL: asar still present; wrote rename-pending'",
  "  Set-Content -LiteralPath $lock -Value ((Get-Date).ToString('o')) -Encoding ascii",
  "}",
  "",
].join("\r\n");

const ASAR_RENAME_WHEN_IDLE_PS1 = [
  "param(",
  "  [Parameter(Mandatory = $true)][string]$AsarPath,",
  "  [Parameter(Mandatory = $true)][string]$ExePath,",
  "  [Parameter(Mandatory = $true)][string]$LockPath",
  ")",
  "$ErrorActionPreference = 'Continue'",
  "$deadline = (Get-Date).AddMinutes(30)",
  "while ((Get-Date) -lt $deadline) {",
  "  $restartFlag = Join-Path $env:TEMP 'Xsdsh-purge-next-official-restarting'",
  "  if (Test-Path -LiteralPath $restartFlag) {",
  "    $flagAge = (Get-Date) - (Get-Item -LiteralPath $restartFlag).LastWriteTime",
  "    if ($flagAge.TotalSeconds -ge 0 -and $flagAge.TotalSeconds -lt 45) { exit 0 }",
  "    Remove-Item -LiteralPath $restartFlag -Force -ErrorAction SilentlyContinue",
  "  }",
  "  $holding = @(Get-Process -ErrorAction SilentlyContinue | Where-Object { try { $_.Path -eq $ExePath } catch { $false } })",
  "  if ($holding.Count -gt 0) { Start-Sleep -Milliseconds 500; continue }",
  "  if (-not (Test-Path -LiteralPath $AsarPath)) {",
  "    Remove-Item -LiteralPath $LockPath -Force -ErrorAction SilentlyContinue",
  "    exit 0",
  "  }",
  "  $appDir = Join-Path (Split-Path -Parent $AsarPath) 'app'",
  "  $unpacked = $AsarPath + '.unpacked'",
  "  $marker = Join-Path $appDir 'dsh\\node_modules\\node-addon-require-builtin-win32-x64-msvc\\prebuilt\\win32-x64-msvc-napi-v9.node'",
  "  if ((Test-Path -LiteralPath $unpacked) -and -not (Test-Path -LiteralPath $marker)) {",
  "    & robocopy.exe $unpacked $appDir /E /XC /XN /XO /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null",
  "  }",
  "  $bak = \"$AsarPath.bak\"",
  "  if (Test-Path -LiteralPath $bak) { Remove-Item -LiteralPath $bak -Force -ErrorAction SilentlyContinue }",
  "  try {",
  "    Move-Item -LiteralPath $AsarPath -Destination $bak -Force -ErrorAction Stop",
  "  } catch {",
  "    Start-Sleep -Milliseconds 400",
  "    continue",
  "  }",
  "  Remove-Item -LiteralPath $LockPath -Force -ErrorAction SilentlyContinue",
  "  Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue",
  "  Start-Process -FilePath $ExePath",
  "  exit 0",
  "}",
  "Remove-Item -LiteralPath $LockPath -Force -ErrorAction SilentlyContinue",
  "",
].join("\r\n");

const ASAR_RENAME_WHEN_IDLE_SH = [
  "#!/bin/sh",
  "asar=$1",
  "exe=$2",
  "lock=$3",
  "deadline=$(($(date +%s) + 1800))",
  "relaunch() {",
  "  unset ELECTRON_RUN_AS_NODE",
  "  case \"$(uname -s)\" in",
  "    Darwin)",
  "      case \"$exe\" in",
  "        */Contents/MacOS/*)",
  "          bundle=$(dirname \"$(dirname \"$(dirname \"$exe\")\")\")",
  "          open \"$bundle\"",
  "          return",
  "          ;;",
  "      esac",
  "      ;;",
  "  esac",
  "  nohup \"$exe\" >/dev/null 2>&1 &",
  "}",
  "app_running() {",
  "  ps -Ao command= 2>/dev/null | grep -F \"$exe\" | grep -v \"Xsdsh-purge-next-asar-rename-when-idle\" | grep -v grep >/dev/null",
  "}",
  "while [ \"$(date +%s)\" -lt \"$deadline\" ]; do",
  "  if [ ! -e \"$asar\" ]; then",
  "    rm -f \"$lock\"",
  "    exit 0",
  "  fi",
  "  if app_running; then",
  "    sleep 1",
  "    continue",
  "  fi",
  "  bak=\"$asar.bak\"",
  "  rm -f \"$bak\"",
  "  if mv \"$asar\" \"$bak\" 2>/dev/null; then",
  "    rm -f \"$lock\"",
  "    relaunch",
  "    exit 0",
  "  fi",
  "  sleep 1",
  "done",
  "rm -f \"$lock\"",
  "exit 1",
  "",
].join("\n");

/** 官方壳开着时 app.asar 被占用。不结束进程，等用户退出后再改名并重新打开。 */
export function scheduleAsarRenameWhenIdle({ exe, asar } = {}) {
  if (!exe || !asar) return { pending: false };
  const lock = `${asar}.rename-pending`;
  try {
    const age = Date.now() - fs.statSync(lock).mtimeMs;
    if (age >= 0 && age < 30 * 60 * 1000) return { pending: true, already: true };
    // age<0 时钟回拨或 age>=30min stale，视为失效，清掉重做。
    try { fs.unlinkSync(lock); } catch { /* ignore */ }
  } catch {
    // 没有待处理标记，下面新建。
  }
  fs.writeFileSync(lock, `${Date.now()}\n`, "utf8");
  if (process.platform === "win32") {
    const script = path.join(os.tmpdir(), `Xsdsh-purge-next-asar-rename-when-idle-${restartUniqSuffix()}.ps1`);
    fs.writeFileSync(script, ASAR_RENAME_WHEN_IDLE_PS1, "utf8");
    const child = spawn(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        script,
        "-AsarPath",
        asar,
        "-ExePath",
        exe,
        "-LockPath",
        lock,
      ],
      { detached: true, stdio: "ignore", windowsHide: true, shell: false },
    );
    // detached spawn 的 ENOENT / 权限错误走 'error' 事件,没监听会 uncaught → 整个进程崩。
    child.on("error", (err) => {
      try { console.warn("[Xsdsh-purge-next] asar rename idle PS1 spawn 失败:", err?.message || err); } catch { /* 忽略 */ }
    });
    child.unref();
    return { pending: true };
  }
  const script = path.join(os.tmpdir(), `Xsdsh-purge-next-asar-rename-when-idle-${restartUniqSuffix()}.sh`);
  fs.writeFileSync(script, ASAR_RENAME_WHEN_IDLE_SH, { encoding: "utf8", mode: 0o755 });
  const child = spawn("/bin/sh", [script, asar, exe, lock], {
    detached: true,
    stdio: "ignore",
    shell: false,
  });
  child.on("error", (err) => {
    try { console.warn("[Xsdsh-purge-next] asar rename idle sh spawn 失败:", err?.message || err); } catch { /* 忽略 */ }
  });
  child.unref();
  return { pending: true };
}

/** 等当前桌面进程退出后把 app.asar 挪走，再启动 exe。解开后的 resources/app 才会被加载。 */
/* ── Job 脱离 ─────────────────────────────────────────────────────────
 * Windows 上 Node 的 `detached: true` 只新建进程组，**不传**
 * `CREATE_BREAKAWAY_FROM_JOB`。Electron 主进程活在 Chromium 的 Job Object 里
 * （带 `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`），spawn 出来的子进程继承 Job 成员
 * 身份。于是「脚本杀掉 Electron 主进程」= Job 句柄全关 = Job 销毁 = Job 内所有
 * 进程（含脚本自己）被 TerminateProcess。实测表现：脚本跑到杀进程那步就消失，
 * `.bak` 和 `.rename-pending` 两个出口标记都不产生，asar 原地不动。
 *
 * 三级降级，优先级按「依赖少、成功率高」排：
 *   1. `schtasks` —— 最干净，但**需要管理员**（非提权会 Access is denied）；
 *   2. `WMIC` / WMI `Win32_Process.Create` —— 由 WMI 服务托管创建，
 *      天然不在调用者的 Job 里，**普通用户可用**，是主方案；
 *   3. 最后的 `spawn(detached)` —— 会踩 Job 坑，仅在 1、2 都不可用时用。
 * ──────────────────────────────────────────────────────────────────── */

/** 用 WMI 的 Win32_Process.Create 起进程。由 WMI 服务托管，不在我们的 Job 里。 */
function launchViaWmi(command) {
  // wmic 在部分 Win11 上被移除，所以先试 wmic，再退 PowerShell 的 CIM。
  const escaped = command.replace(/"/g, '\\"');
  try {
    const out = spawnSync(
      "wmic.exe",
      ["process", "call", "create", command],
      { windowsHide: true, encoding: "utf8", timeout: 20000 },
    );
    if (out.status === 0 && /ReturnValue = 0/i.test(String(out.stdout || ""))) {
      return { ok: true, mode: "wmi", via: "wmic" };
    }
  } catch {
    // wmic 不存在 / 被移除，走 CIM
  }
  try {
    const ps =
      "$r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create "
      + "-Arguments @{ CommandLine = @'\n" + command + "\n'@ }; "
      + "if ($r.ReturnValue -eq 0) { exit 0 } else { exit [int]$r.ReturnValue }";
    const out = spawnSync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", ps],
      { windowsHide: true, encoding: "utf8", timeout: 25000 },
    );
    if (out.status === 0) return { ok: true, mode: "wmi", via: "cim" };
    void escaped;
    return { ok: false, mode: "wmi", via: "cim", error: "Win32_Process.Create exit " + out.status };
  } catch (error) {
    return {
      ok: false,
      mode: "wmi",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 把一个「稍后执行的命令」丢到 Chromium 的 Job Object 之外去跑。
 *
 * @returns `{ ok, mode, error?, name? }`；`ok: true` 时进程已在 Job 之外启动。
 */
export function launchDetachedFromJob(command, { log = null } = {}) {
  const say = typeof log === "function" ? log : () => {};
  const cmd = String(command || "");
  if (!cmd) return { ok: false, error: "empty command", mode: "none" };
  if (process.platform !== "win32") {
    return { ok: false, error: "windows only", mode: "none" };
  }

  // ── 方案 1：schtasks（需要管理员）──
  const name = `XsdshPurgeSwap-${process.pid}-${Date.now()}`;
  try {
    const tr = cmd.replace(/"/g, '\\"');
    const create = spawnSync(
      "schtasks.exe",
      ["/create", "/tn", name, "/sc", "once", "/st", "00:00", "/f", "/tr", tr],
      { windowsHide: true, stdio: "ignore", timeout: 20000 },
    );
    if (create.status === 0) {
      const run = spawnSync("schtasks.exe", ["/run", "/tn", name], {
        windowsHide: true,
        stdio: "ignore",
        timeout: 20000,
      });
      if (run.status === 0) {
        say("job-detach: schtasks task " + name + " started");
        return { ok: true, mode: "schtasks", name };
      }
      spawnSync("schtasks.exe", ["/delete", "/tn", name, "/f"], { windowsHide: true, stdio: "ignore" });
      say("job-detach: schtasks /run failed, trying WMI");
    } else {
      // 非管理员建不了计划任务（实测 Access is denied），这是最常见的分支。
      say("job-detach: schtasks /create denied (no admin), trying WMI");
    }
  } catch {
    say("job-detach: schtasks unavailable, trying WMI");
  }

  // ── 方案 2：WMI Win32_Process.Create（普通用户可用，主方案）──
  const wmi = launchViaWmi(cmd);
  if (wmi.ok) {
    say("job-detach: launched via WMI (" + (wmi.via || "wmi") + ")");
    return wmi;
  }
  say("job-detach: WMI failed (" + (wmi.error || "unknown") + "), will fall back to spawn");

  // ── 方案 3：留给调用方 spawn 兜底（会踩 Job 坑，但至少还能动）──
  return { ok: false, mode: "none", error: wmi.error || "no detach method worked" };
}

/** 删掉上一轮遗留的 schtasks 任务（幂等，失败无声）。 */
export function cleanupDetachedJobTasks() {
  if (process.platform !== "win32") return;
  try {
    const list = spawnSync("schtasks.exe", ["/query", "/fo", "csv", "/nh"], {
      windowsHide: true,
      encoding: "utf8",
      timeout: 20000,
    });
    for (const line of String(list.stdout || "").split(/\r?\n/)) {
      if (!line.includes("XsdshPurgeSwap-")) continue;
      const nm = (line.match(/^"([^"]+)"/) || [])[1];
      if (!nm) continue;
      spawnSync("schtasks.exe", ["/delete", "/tn", nm, "/f"], { windowsHide: true, stdio: "ignore" });
    }
  } catch {
    // 没有计划任务服务 / 权限不足都不影响主流程
  }
}


export function scheduleAsarSwapRestart({ exe, asar, waitPid = process.pid, exit = false, runtime = null, ctx = null } = {}) {
  if (!exe || !asar) throw new Error("缺少桌面 exe 或 app.asar，无法重启");
  // 若调用方没显式传 runtime,但传了 ctx —— 自己解析一次。
  // 让启动期自愈路径 (index.js:scheduleApplyRestart / 2004 自愈分支) 透传 ctx 就能走优雅握手。
  if (!runtime && ctx) {
    try { runtime = desktopRuntimeOf(ctx); } catch { /* ignore */ }
  }
  // #64 crash-dialog 根因:宿主 main.js:3725 ChildProcess listener 把 host 退出当
  // "host stopped" 弹崩溃对话框。双保险:
  //   1) PowerShell 立即 Stop-HarnessInstall (杀 Electron main + host),Electron
  //      还没来得及看到 host 退出事件就被 kill,UI 不存在,无法弹 crash dialog。
  //   2) runtime.requestRestart 存在就先 ack 一次,给宿主"预期退出"标记窗口(若有)。
  // host 自己的 process.exit 是最后兜底 —— 一般会先被 PowerShell kill。
  const gracefulExit = () => {
    if (!runtime) {
      // 没 runtime —— 短 timeout 给 PowerShell 启动完成的时间(实测 ~200-500ms),
      // 然后主动退出。PowerShell 会在这期间杀掉 Electron,即便 host 自己退出
      // Electron 也已经不在了,不会弹 dialog。
      logInternal("asar swap: no runtime handoff, relying on PowerShell to kill Electron first");
      setTimeout(() => { try { process.exit(0); } catch {} }, 1500);
      return;
    }
    logInternal("asar swap: handing off restart to desktopRuntime");
    try {
      // #64:requestRestart 可能"空返回"但副作用也许仍标记预期退出,双保险之一。
      Promise.resolve(runtime.requestRestart()).catch((err) => {
        logInternal("desktopRuntime.requestRestart rejected: " + (err?.message || err));
      });
    } catch (err) {
      logInternal("desktopRuntime.requestRestart threw: " + (err?.message || err));
    }
    // 2000ms 兜底:给宿主 requestRestart 做完 + PowerShell 启动完成。
    // 即便两条路径都挂,PowerShell 也会在 ~500ms 内 kill Electron,不会弹 crash。
    setTimeout(() => {
      try { process.exit(0); } catch {}
    }, 2000);
  };

  if (sealedSwapKind() === "helper") {
    const helper = fileURLToPath(new URL("./restart-desktop.js", import.meta.url));
    spawnHelper(helper, {
      respawn: true,
      killApp: true,
      asar,
      execPath: exe,
      cwd: path.dirname(exe),
      waitPid,
    }, { exit: false });
    if (exit !== false) gracefulExit();
    return { scheduled: true, engine: "helper", logPath: restartDesktopLogPath() };
  }
  const script = path.join(os.tmpdir(), `Xsdsh-purge-next-asar-swap-${process.pid}.ps1`);
  fs.writeFileSync(script, ASAR_SWAP_PS1, "utf8");
  const psArgs = [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-WindowStyle",
    "Hidden",
    "-File",
    script,
    "-WaitPid",
    String(waitPid),
    "-AsarPath",
    asar,
    "-ExePath",
    exe,
  ].map((a) => (/[\s"]/.test(a) ? '"' + String(a).replace(/"/g, '\\"') + '"' : a));
  const psCmd = "powershell.exe " + psArgs.join(" ");
  /* detached:true 在 Windows 上只新建进程组，**不传 CREATE_BREAKAWAY_FROM_JOB**。
     Electron 主进程在 Chromium 的 Job 里（KILL_ON_JOB_CLOSE），spawn 出来的
     PowerShell 继承 Job 身份 → 脚本杀掉 Electron 主进程后，Job 销毁会把它
     自己也 TerminateProcess 掉。这正是「脚本跑了但 .bak 不出现」的原因。
     改用 schtasks 一次性任务，任务计划在独立会话执行，天然不在 Job 内。 */
  const launched = launchDetachedFromJob(psCmd, { log: logInternal });
  // C9-P5：PS1 内部写的日志就是 ASAR_SWAP_LOG_NAME，asarSwapLogPath() 由同一常量生成。
  const logPath = asarSwapLogPath();
  if (!launched.ok) {
    logInternal("asar swap: job-detach failed, falling back to spawn (" + launched.error + ")");
    try {
      const child = spawn("powershell.exe", psArgs, {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
        shell: false,
      });
      child.on("error", (err) => {
        logInternal("asar swap PowerShell spawn failed: " + (err?.message || err));
      });
      child.unref();
    } catch (error) {
      logInternal("asar swap PowerShell spawn threw: " + (error?.message || error));
      return { scheduled: false, error: error?.message || String(error), logPath };
    }
  } else {
    logInternal("asar swap: launched via schtasks (out of Chromium job): " + launched.name);
  }
  if (exit !== false) gracefulExit();
  return { scheduled: true, engine: launched.ok ? "schtasks" : "spawn", logPath };
}

/**
 * 点「应用」之后走哪条重启。#64：宿主 requestRestart 在桌面端会空返回，进程不动。
 * Windows 官方包用 wscript 结束再打开。Linux / macOS 能定位到 exe 就走 restart-desktop.js。
 */
export function desktopRestartChoice(input = {}) {
  const platform = input.platform || process.platform;
  const exe = input.exe || "";
  const desktopExe = Boolean(exe && isDesktopExecutable(exe));
  const official = Boolean(exe && isOfficialHarnessExecutable(exe));
  if (input.openBrowser === false) return "skip";
  if (platform === "win32" && official) return "windows-official";
  if (desktopExe && input.asarSealed === true) return "asar-swap";
  if (desktopExe) return "helper";
  if (input.hasRuntime) return "request-restart";
  return "helper";
}

/** 密封 asar 要先退出进程才能挪走文件。Windows 用 PowerShell；Linux / macOS 用同一份重启脚本。 */
export function sealedSwapKind(platform = process.platform) {
  return platform === "win32" ? "powershell" : "helper";
}

function officialExeFromProcess() {
  if (isOfficialHarnessExecutable(process.execPath) && isFile(process.execPath)) {
    return path.normalize(process.execPath);
  }
  const resources = process.resourcesPath;
  if (!resources) return "";
  const hit = firstExistingExe([path.dirname(path.normalize(resources))]);
  if (hit && isOfficialHarnessExecutable(hit)) return hit;
  return "";
}

function dshHomeForRelaunch() {
  const current = String(process.env.DSH_HOME || "").replace(/[\\/]+$/, "");
  if (!current) return "";
  if (current.toLowerCase().endsWith(".dsh")) return current;
  const nested = path.join(current, ".dsh");
  try {
    if (fs.existsSync(path.join(nested, "profiles"))) return nested;
  } catch {
    // 用当前值。
  }
  return current;
}

export function scheduleRestart(request, ctx, options = {}) {
  // 启动自检会带 openBrowser:false。桌面进程不再因此杀掉自己。
  if (options.openBrowser === false) return { restarting: false, skipped: true };
  const exe =
    officialExeFromProcess() ||
    findDesktopAppExecutable() ||
    "";
  const asar = exe ? appAsarPath(exe) : "";
  // ctx 透传给 restartOfficialHarness → scheduleAsarSwapRestart,让 PowerShell 分支
  // 拿到 desktopRuntime 走 requestRestart 优雅退出,避免宿主误报 crash。
  if (process.platform === "win32" && exe && isOfficialHarnessExecutable(exe)) {
    return restartOfficialHarness({ exe, asar, ctx });
  }
  if (exe && asar && asarArchiveIsFile(asar)) {
    const runtime = desktopRuntimeOf(ctx);
    const swapped = scheduleAsarSwapRestart({ exe, asar, waitPid: process.pid, exit: true, runtime }) || {};
    // C9-P5：同样透出 logPath，/restart 走非密封分支时 asar_swap_log 也不空。
    return { restarting: true, asarSwap: true, logPath: swapped.logPath || asarSwapLogPath() };
  }
  const runtime = desktopRuntimeOf(ctx);
  const choice = desktopRestartChoice({
    exe,
    asarSealed: false,
    hasRuntime: Boolean(runtime),
  });
  if (choice === "helper" && exe && isDesktopExecutable(exe)) {
    const helper = fileURLToPath(new URL("./restart-desktop.js", import.meta.url));
    try {
      spawnHelper(helper, {
        respawn: true,
        killApp: true,
        execPath: exe,
        cwd: path.dirname(exe),
      }, { exit: false });
    } catch (error) {
      return {
        restarting: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
    return { restarting: true };
  }
  if (runtime) {
    // 只走桌面整应用 relaunch，不要 exit Host（那会先把内嵌 web 单独拉起来）。
    Promise.resolve(runtime.requestRestart()).catch((err) => {
      logInternal("desktop requestRestart failed: " + (err?.message || err));
    });
    return { restarting: true };
  }
  const helper = fileURLToPath(new URL("./restart-desktop.js", import.meta.url));
  spawnHelper(helper, { respawn: true, killApp: true }, { exit: false });
  return { restarting: true };
}

/**
 * helper 的 payload 单独导出，测试可以机械断言「不含 `asar`」。
 *
 * `restart-desktop.js` 里 `releaseSealedAsar` 只在 `if (info.asar)` 时调用
 * （`restart-desktop.js:444/456`）。payload 里没有 `asar` → helper 只做
 * 「杀进程 + 重新拉起」，归档原地不动 —— 这是新路（免解包）能保持新路的唯一前提。
 * 谁往这里加回 `asar: …`，新路就会在重启那一刻被打回全量解包。
 */
export function unpackedRelaunchPayload(exe) {
  return {
    respawn: true,
    killApp: true,
    execPath: exe,
    cwd: path.dirname(exe),
    waitPid: process.pid,
  };
}

/**
 * 新路重启时，宿主自己要等多久才 `process.exit(0)`。
 *
 * 为什么不是 `spawnHelper` 的 250 ms 默认值：helper 是用 `process.execPath`
 * （Electron 二进制）加 `ELECTRON_RUN_AS_NODE=1` 启动的，光启动就要 300–600 ms，
 * 之后才去枚举并杀 Electron。宿主 250 ms 就退出的话，Electron 内存里的**旧**
 * `main.js` 会先看到 `close(code=0)` → `fail("dsh desktop host stopped")` →
 * 弹崩溃对话框；helper 紧接着把 Electron 杀掉，用户看到的就是「弹一下、DSH
 * 关闭并重启」。补丁 #83/#84 只在新 `main.js` 被加载后生效，所以这个对话框在
 * **应用后的第一次重启**必然出现。
 *
 * 2000 ms 取 asar-swap 路径（`scheduleAsarSwapRestart` 的 gracefulExit）里
 * 那个「双保险」上限：给 helper 足够时间先杀掉 Electron，宿主再退出，旧 main.js
 * 就没有机会看到 close 事件。helper 起不来时宿主仍会按这个时间兜底退出，不会卡死；
 * helper 正常时 Electron 会在 ~600–1200 ms 内被杀，宿主跟着一起消失，实际等待
 * 远小于 2 s。
 */
export const FASTPATH_RELAUNCH_EXIT_MS = 2000;

/** 单独导出，测试可以直接断言「宿主退出延迟够 helper 先杀 Electron」。 */
export function fastpathRelaunchSpawnOptions(options = {}) {
  return { exit: options.exit !== false, exitAfter: FASTPATH_RELAUNCH_EXIT_MS };
}

/**
 * 新路宿主的重启：只杀进程 + 重新拉起，**绝不碰 `app.asar`**。
 *
 * 为什么不复用 `restartOfficialHarness()`：那条路径会走
 * `officialRestartScript()`（robocopy `.unpacked` → `resources/app` +
 * `MoveFile(asar, asar.bak)`），在新路上等于当场退回旧路。
 *
 * 为什么不复用 `scheduleRestart()`：Windows 官方包上它第一件事就是调
 * `restartOfficialHarness()`，同样会换包。
 */
export function relaunchDesktopHost(options = {}) {
  const hinted = options.exe ? path.normalize(String(options.exe)) : "";
  const exe = (hinted && isDesktopExecutable(hinted) ? hinted : "")
    || officialExeFromProcess()
    || findDesktopAppExecutable()
    || "";
  if (!exe) return { restarting: false, error: "未找到 DSH Desktop.exe，无法重启桌面应用" };
  try {
    const helper = fileURLToPath(new URL("./restart-desktop.js", import.meta.url));
    spawnHelper(helper, unpackedRelaunchPayload(exe), fastpathRelaunchSpawnOptions(options));
  } catch (error) {
    return {
      restarting: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
  return { restarting: true, mode: "unpacked-relaunch", logPath: restartDesktopLogPath() };
}

function jsString(value) {
  return wshLiteral(value);
}

/**
 * 生成 wscript 重启脚本。**整份必须是 ASCII**：wscript 无 BOM 时按系统 ANSI 读文件，
 * 而非 ASCII 会把 isWshAscii() 打成 false，直接降级到 PowerShell 分支（4.5.16 的
 * 「换包失败」就是这个降级加上 Job 连带击杀造成的）。中文路径一律走 wshLiteral()
 * 转成 \uXXXX。
 *
 * @export 供测试直接验证产出是否纯 ASCII
 * @param {string} exe
 * @param {string} asar
 * @param {string} dshHome
 */
export function officialRestartScript(exe, asar, dshHome) {
  const log = officialRestartLogPath();
  return [
    "var exe = " + jsString(exe) + ";",
    "var asar = " + jsString(asar) + ";",
    "var home = " + jsString(dshHome || "") + ";",
    "var logPath = " + jsString(log) + ";",
    "var fso = new ActiveXObject('Scripting.FileSystemObject');",
    "var sh = new ActiveXObject('WScript.Shell');",
    "var wmi = GetObject('winmgmts:\\\\\\\\.\\\\root\\\\cimv2');",
    "function z(n) { return (n < 10 ? '0' : '') + n; }",
    "function stamp() { var d = new Date(); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + 'T' + z(d.getHours()) + ':' + z(d.getMinutes()) + ':' + z(d.getSeconds()); }",
    "function log(m) { var f = fso.OpenTextFile(logPath, 8, true); f.WriteLine(stamp() + ' ' + m); f.Close(); }",
    "function samePath(a, b) { return String(a || '').replace(/\\//g, '\\\\').toLowerCase() === String(b || '').replace(/\\//g, '\\\\').toLowerCase(); }",
    "function installRoot() { return fso.GetParentFolderName(exe); }",
    "function pids() { var out = []; var root = String(installRoot() || '').replace(/\\//g, '\\\\').toLowerCase(); var e = new Enumerator(wmi.ExecQuery(\"SELECT ProcessId, ExecutablePath FROM Win32_Process WHERE Name = 'DeepSeek Harness.exe'\")); for (; !e.atEnd(); e.moveNext()) { var p = e.item(); var ep = String(p.ExecutablePath || '').replace(/\\//g, '\\\\').toLowerCase(); if (samePath(p.ExecutablePath, exe) || (root && ep.indexOf(root) === 0)) out.push(p.ProcessId); } return out; }",
    "log('begin');",
    "var promptFile = asar.replace(/app\\.asar$/i, 'app') + '\\\\dsh\\\\node_modules\\\\@deepseek-ai\\\\dsh-system-prompt\\\\lib\\\\index.js';",
    "var altFile = asar.replace(/app\\.asar$/i, 'app') + '\\\\node_modules\\\\@deepseek-ai\\\\dsh-system-prompt\\\\lib\\\\index.js';",
    "function readBody(file) { if (!fso.FileExists(file)) return ''; var tf = fso.OpenTextFile(file, 1); var body = tf.ReadAll(); tf.Close(); return body; }",
    "function hostClean(body) { if (!body) return null; var ident = body.indexOf('[Xsdsh-purge-next] identity stripped') >= 0; var kept = body.indexOf('[Xsdsh-purge-next] complete prompt keeps waterfall inject') >= 0 || body.indexOf('[Xsdsh-purge-next] complete prompt keeps inject') >= 0; if (ident && kept) return true; if (body.indexOf('system-prompt/assemble') < 0) return false; var identityLeft = body.indexOf('You are an AI agent powered by DeepSeek Harness.') >= 0; var drops = body.indexOf('transformed.sections : [completeSection]') >= 0; return !identityLeft && !drops; }",
    "var clean = false;",
    "var primary = hostClean(readBody(promptFile));",
    "var alt = hostClean(readBody(altFile));",
    // ASCII only: wscript reads this file as ANSI, and isWshAscii() gates the
    // wscript path. One non-ASCII char here silently downgrades to PowerShell.
    "// null = missing or unreadable (first install / read failure): do not block boot;",
    "// only an explicit false (genuinely dirty) blocks.",
    "clean = primary != false && alt != false;",
    "if (!clean) { log('clean markers missing; not starting'); try { if (fso.FileExists(" + jsString(path.join(os.tmpdir(), "Xsdsh-purge-next-official-restarting")) + ")) fso.DeleteFile(" + jsString(path.join(os.tmpdir(), "Xsdsh-purge-next-official-restarting")) + ", true); } catch (ignoreStop) {} WScript.Quit(1); }",
    "if (clean) {",
    "log('clean markers ok');",
    "WScript.Sleep(800);",
    "var list = pids();",
    "log('pids ' + list.join(','));",
    "for (var i = 0; i < list.length; i++) sh.Run('taskkill.exe /F /PID ' + list[i], 0, true);",
    "// Never kill by /IM image name (would hit unrelated same-named apps);",
    "// re-sweep this install's pid list after the timeout instead.",
    "var deadline = new Date().getTime() + 20000;",
    "var left = list;",
    "while (new Date().getTime() < deadline) { left = pids(); if (left.length === 0) break; WScript.Sleep(200); }",
    "log('left ' + left.length);",
    "var unpacked = asar + '.unpacked';",
    "var appDir = asar.replace(/app\\.asar$/i, 'app');",
    "var marker = appDir + '\\\\dsh\\\\node_modules\\\\node-addon-require-builtin-win32-x64-msvc\\\\prebuilt\\\\win32-x64-msvc-napi-v9.node';",
    "if (fso.FolderExists(unpacked) && !fso.FileExists(marker)) { sh.Run('robocopy.exe \"' + unpacked + '\" \"' + appDir + '\" /E /XC /XN /XO /NFL /NDL /NJH /NJS /nc /ns /np', 0, true); log('overlay'); }",
    "var renamed = false;",
    "if (!fso.FileExists(asar)) { renamed = true; log('asar already absent'); }",
    "if (fso.FileExists(asar)) { var bak = asar + '.bak'; if (fso.FileExists(bak)) fso.DeleteFile(bak, true); for (var n = 0; n < 80; n++) { try { fso.MoveFile(asar, bak); renamed = true; log('renamed'); break; } catch (err) { log(err && err.message ? err.message : String(err)); if (n === 20 || n === 50) { var hold = pids(); for (var k = 0; k < hold.length; k++) sh.Run('taskkill.exe /F /PID ' + hold[k], 0, true); WScript.Sleep(800); } WScript.Sleep(300); } } }",
    "if (!renamed) { log('rename failed; not starting'); try { if (fso.FileExists(" + jsString(path.join(os.tmpdir(), "Xsdsh-purge-next-official-restarting")) + ")) fso.DeleteFile(" + jsString(path.join(os.tmpdir(), "Xsdsh-purge-next-official-restarting")) + ", true); } catch (ignoreStop2) {} WScript.Quit(1); }",
    "if (renamed) {",
    "try { sh.Environment('PROCESS').Remove('ELECTRON_RUN_AS_NODE'); } catch (ignore) {}",
    "try { sh.Environment('PROCESS').Remove('DSH_BASE'); } catch (ignoreBase) {}",
    "if (home) { try { sh.Environment('PROCESS').Item('DSH_HOME') = home; } catch (ignore2) {} }",
    "sh.Run('\"' + exe + '\"', 1, false);",
    "log('started');",
    "}",
    "}",
    // Keep the inflight window just long enough to cover a cold client start;
    // the original 180s left the panel unresponsive for 3 minutes after every restart.
    "WScript.Sleep(45000);",
    "try { if (fso.FileExists(" + jsString(path.join(os.tmpdir(), "Xsdsh-purge-next-official-restarting")) + ")) fso.DeleteFile(" + jsString(path.join(os.tmpdir(), "Xsdsh-purge-next-official-restarting")) + ", true); } catch (ignoreFlag) {}",
    "",
  ].join("\r\n");
}

function systemPromptFiles(exe) {
  const appDir = appDirForExecutable(exe);
  if (!appDir) return [];
  return [
    path.join(appDir, "dsh", "node_modules", "@deepseek-ai", "dsh-system-prompt", "lib", "index.js"),
    path.join(appDir, "node_modules", "@deepseek-ai", "dsh-system-prompt", "lib", "index.js"),
  ].filter((fp) => {
    try { return fs.existsSync(fp); } catch { return false; }
  });
}

function unpackedHostIsClean(exe) {
  const files = systemPromptFiles(exe);
  if (files.length === 0) return false;
  return files.every((fp) => {
    try {
      return hostPromptKeepsInject(fs.readFileSync(fp, "utf8"));
    } catch {
      return false;
    }
  });
}

const OFFICIAL_RESTART_FLAG = "Xsdsh-purge-next-official-restarting";
const OFFICIAL_RESTART_WINDOW_MS = 45000;

/**
 * Windows 官方换包走哪条。
 * 本机 wscript 能跑 .js 时仍用原来的脚本。跑不了（云端很多机器没有 JScript 引擎）
 * 才改用已经在用的 PowerShell。没确认脚本已经开始，不把进行中的标记当成成功。
 */
export function planOfficialRestart({ wshJs, scriptAscii, inflightAgeMs, logStarted, logState } = {}) {
  const age = Number(inflightAgeMs);
  const fresh = Number.isFinite(age) && age >= 0 && age < OFFICIAL_RESTART_WINDOW_MS;
  const state = logState || (logStarted === true ? "running" : "none");
  // 只有脚本正在结束当前进程时才算进行中。写过 begin 又停掉的，这次点击要重新开始。
  if (fresh && state === "running") return { action: "already" };
  const kind = wshJs === true && scriptAscii !== false ? "wscript" : "powershell";
  return {
    action: "start",
    kind,
    writeInflight: kind === "wscript",
    clearInflight: kind !== "wscript",
  };
}

function officialRestartFlagPath() {
  return path.join(os.tmpdir(), OFFICIAL_RESTART_FLAG);
}

function officialRestartLogState(sinceMs) {
  try {
    const log = officialRestartLogPath();
    const st = fs.statSync(log);
    if (sinceMs && st.mtimeMs + 1000 < sinceMs) return "none";
    const lines = fs.readFileSync(log, "utf8").split(/\r?\n/).filter(Boolean);
    let begin = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/(^|\s)begin$/.test(lines[i])) begin = i;
    }
    if (begin < 0) return "none";
    const tail = lines.slice(begin);
    if (tail.some((line) => /not starting|rename failed/.test(line))) return "aborted";
    if (tail.some((line) => /(^|\s)started$/.test(line))) return "done";
    return "running";
  } catch {
    return "none";
  }
}

let wshJsEngineCached;
function wshJsEngineWorks() {
  if (wshJsEngineCached !== undefined) return wshJsEngineCached;
  wshJsEngineCached = probeWshJsEngine();
  return wshJsEngineCached;
}

function probeWshJsEngine() {
  const id = `${process.pid}-${Date.now()}`;
  const script = path.join(os.tmpdir(), `Xsdsh-purge-next-wsh-probe-${id}.js`);
  const out = path.join(os.tmpdir(), `Xsdsh-purge-next-wsh-probe-${id}.txt`);
  try {
    const body = "var fso=new ActiveXObject('Scripting.FileSystemObject');var f=fso.CreateTextFile("
      + wshLiteral(out)
      + ", true);f.WriteLine('ok');f.Close();\r\n";
    fs.writeFileSync(script, body, "utf8");
    execFileSync("cscript.exe", ["//nologo", script], {
      timeout: 4000,
      windowsHide: true,
      stdio: "ignore",
    });
    return fs.existsSync(out);
  } catch {
    return false;
  } finally {
    try { fs.unlinkSync(script); } catch { /* 探针用完即删 */ }
    try { fs.unlinkSync(out); } catch { /* 探针用完即删 */ }
  }
}

/** 点「重启」后结束当前官方客户端，挪开被占用的 app.asar，再自己打开。 */
export function restartOfficialHarness(options = {}) {
  const hinted = options.exe ? path.normalize(String(options.exe)) : "";
  const exe =
    (hinted && isDesktopExecutable(hinted) ? hinted : "") ||
    officialExeFromProcess() ||
    findDesktopAppExecutable() ||
    "";
  if (!exe) return { restarting: false };
  // ctx 可用时 → 拿 desktopRuntime 透传给 PowerShell 分支:
  // 让宿主 ack 预期的 restart,避免 host 退出被当成 crash 弹对话框。
  const runtime = options.runtime || (options.ctx ? desktopRuntimeOf(options.ctx) : null);
  if (!isOfficialHarnessExecutable(exe)) {
    const asar = options.asar || appAsarPath(exe);
    if (asar && asarArchiveIsFile(asar)) {
      const swapped = scheduleAsarSwapRestart({
        exe,
        asar,
        waitPid: process.pid,
        exit: options.exit !== false,
        runtime,
      }) || {};
      // C9-P5：logPath 与 PS1 内的 $SwapLog 同源（ASAR_SWAP_LOG_NAME）。
      return {
        restarting: true,
        asarSwap: true,
        scheduled: swapped.scheduled === true,
        logPath: swapped.logPath || asarSwapLogPath(),
      };
    }
    return { restarting: false };
  }
  // #57：不自动跑官方 installer。宿主版本百花齐放，更新交接由用户自己做；
  // 插件只负责解包/补丁。旧逻辑会在落盘前误判失败并清掉 resources\app。
  if (options.requireClean !== false && !unpackedHostIsClean(exe)) {
    return { restarting: false, clean: false };
  }
  const inflight = officialRestartFlagPath();
  let inflightAgeMs = -1;
  let inflightMtime = 0;
  try {
    const st = fs.statSync(inflight);
    inflightAgeMs = Date.now() - st.mtimeMs;
    inflightMtime = st.mtimeMs;
  } catch {
    // 没有进行中的重启。
  }
  const asar = options.asar || appAsarPath(exe);
  const restartBody = officialRestartScript(exe, asar, dshHomeForRelaunch());
  const scriptAscii = isWshAscii(restartBody);
  const plan = planOfficialRestart({
    wshJs: scriptAscii && wshJsEngineWorks(),
    scriptAscii,
    inflightAgeMs,
    logState: officialRestartLogState(inflightMtime),
  });
  if (plan.action === "already") {
    // 上一轮脚本还在跑，它会写官方重启日志。返回该路径，用户仍能查到进度。
    return { restarting: true, already: true, logPath: officialRestartLogPath() };
  }
  if (plan.clearInflight) {
    try { fs.unlinkSync(inflight); } catch { /* 没有残留标记 */ }
  }
  if (plan.kind === "powershell") {
    // [Xsdsh-purge-next-fix 2026-10-09] asar 已被挪走(unpacked 模式常态):
    // ASAR_SWAP_PS1 fs.rename asar 会 ENOENT, 返 restarting:false 时 UI 显示
    // "失败: not started"。改走 helper restart-desktop.js:它的 moveAsarAsideAsync
    // 本身就处理 asar=null(第 283 行 fs.existsSync 不存在直接 return true),
    // relaunchDesktop 走 execPath spawn,干净 kill+relaunch,无 asar swap。
    if (!asar || !asarArchiveIsFile(asar)) {
      logInternal("asar 已不存在(unpacked 模式),改走 helper kill+relaunch");
      try {
        const helper = fileURLToPath(new URL("./restart-desktop.js", import.meta.url));
        spawnHelper(helper, {
          respawn: true,
          killApp: true,
          asar: null,
          execPath: exe,
          cwd: path.dirname(exe),
          waitPid: process.pid,
        }, { exit: options.exit !== false });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logInternal("unpacked helper restart failed: " + message);
        return { restarting: false, error: message };
      }
      return { restarting: true, mode: "unpacked-helper", engine: "helper", logPath: restartDesktopLogPath() };
    }
    logInternal(
      "asar swap: falling back to PowerShell ("
      + "scriptAscii=" + scriptAscii
      + " wshJsEngine=" + wshJsEngineWorks()
      + " inflight=" + inflightAgeMs + "ms"
      + ") - wscript path needs an all-ASCII script",
    );
    let swapped = null;
    try {
      swapped = scheduleAsarSwapRestart({
        exe,
        asar,
        waitPid: process.pid,
        exit: options.exit !== false,
        runtime,
      }) || null;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logInternal("PowerShell asar swap failed: " + message);
      return { restarting: false, error: message, logPath: asarSwapLogPath() };
    }
    // C9-P5：logPath 来自 scheduleAsarSwapRestart 的返回值（与 PS1 内 $SwapLog 同源）。
    return {
      restarting: true,
      asarSwap: true,
      engine: "powershell",
      scheduled: swapped?.scheduled === true,
      logPath: swapped?.logPath || asarSwapLogPath(),
    };
  }
  if (plan.writeInflight) {
    try { fs.writeFileSync(inflight, `${Date.now()}\n`, "utf8"); } catch { /* 标记写失败仍继续这一次 */ }
  }
  const asarPresent = Boolean(asar && asarArchiveIsFile(asar));
  const swapLock = asar ? `${asar}.swap-lock` : "";
  if (asarPresent && swapLock) {
    try {
      const lockStat = fs.statSync(swapLock);
      const age = Date.now() - lockStat.mtimeMs;
      // 锁还在、但重启日志没有 begin：上一轮 wscript 没跑起来，不能把它当成正在换包。
      if (age >= 0 && age < 90 * 1000 && officialRestartLogState(lockStat.mtimeMs) === "running") {
        // 换包确实在进行：日志由 wscript 脚本写，路径同 officialRestartScript。
        return { restarting: true, already: true, asarSwap: true, logPath: officialRestartLogPath() };
      }
    } catch {
      // 没有进行中的切换。
    }
    try { fs.writeFileSync(swapLock, `${Date.now()}\n`, "utf8"); } catch {}
  }
  // 启动时清一次残留的旧 restart 脚本/日志。多实例时，脚本名用 pid+random 避免打架。
  cleanupLegacyRestartScripts();
  const script = path.join(os.tmpdir(), `Xsdsh-purge-next-official-restart-${restartUniqSuffix()}.js`);
  fs.writeFileSync(script, restartBody, "utf8");
  // 起 wscript.exe；不写 .cmd 中介文件，避免路径有空格/引号时解析异常。
  // 这条分支同样要脱离 Chromium 的 Job：它也会杀 Electron 主进程。
  const wshCmd = 'wscript.exe //nologo //B "' + script.replace(/"/g, '\\"') + '"';
  const launched = launchDetachedFromJob(wshCmd, { log: logInternal });
  if (!launched.ok) {
    logInternal("official restart: job-detach failed, falling back to spawn (" + launched.error + ")");
    const child = spawn("wscript.exe", ["//nologo", "//B", script], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
      shell: false,
    });
    child.on("error", (err) => {
      logInternal("official restart wscript spawn failed: " + (err?.message || err));
    });
    child.unref();
    return { restarting: true, engine: "wscript", jobDetach: false, logPath: officialRestartLogPath() };
  }
  logInternal("official restart: launched via schtasks (out of Chromium job): " + launched.name);
  return { restarting: true, engine: "wscript", jobDetach: true, logPath: officialRestartLogPath() };
}

export function scheduleCleanupRestart({ cleanup = [], ctx } = {}) {
  const src = fileURLToPath(new URL("./restart-desktop.js", import.meta.url));
  const dest = path.join(os.tmpdir(), `Xsdsh-purge-next-uninst-${process.pid}.mjs`);
  fs.copyFileSync(src, dest);
  // helper 是 standalone 的，删除核心也要单独复制到 %TEMP% 供它动态加载。
  const coreSrc = fileURLToPath(new URL("./uninstall-rmtree.js", import.meta.url));
  const coreDest = path.join(os.tmpdir(), `Xsdsh-purge-next-rmtree-${process.pid}.mjs`);
  fs.copyFileSync(coreSrc, coreDest);
  const runtime = desktopRuntimeOf(ctx);
  if (runtime) {
    spawnHelper(dest, { cleanup, helper: dest, helperCore: coreDest, respawn: false }, { exit: false });
    Promise.resolve(runtime.requestRestart()).catch((err) => {
      logInternal("desktop uninstall restart failed: " + (err?.message || err));
    });
    return { restarting: true };
  }
  spawnHelper(dest, { cleanup, helper: dest, helperCore: coreDest, respawn: true, killApp: true }, { exit: false });
  return { restarting: true };
}

const CLI_ENTRY_BEGIN = "# Xsdsh-purge-next cli entry begin";
const CLI_ENTRY_END = "# Xsdsh-purge-next cli entry end";
const CLI_ASAR_ENTRY = "app.asar/dsh/node_modules/@deepseek-ai/dsh-desktop-host/lib/cli.js";
// #94:官方桌面版把 dsh host 放在 app.asar.unpacked(见 isAiBase 的 app.asar.unpacked 分支),
// 不在封装的 app.asar 里。stock 启动脚本却写死 app.asar/.../cli.js → Cannot find module。
// 回退链必须是 app.asar → app.asar.unpacked → app/,少了中间这级 macOS 开箱即坏。
const CLI_UNPACKED_ENTRY = "app.asar.unpacked/dsh/node_modules/@deepseek-ai/dsh-desktop-host/lib/cli.js";
const CLI_DIR_ENTRY = "app/dsh/node_modules/@deepseek-ai/dsh-desktop-host/lib/cli.js";

function ensureAppRuntimeSymlink(resources) {
  const appDir = path.join(resources, "app");
  const runtime = path.join(resources, "runtime");
  const link = path.join(appDir, "runtime");
  if (!isDir(appDir) || !isDir(runtime)) return { ok: false, error: "missing" };
  try {
    if (fs.existsSync(link)) {
      const st = fs.lstatSync(link);
      if (st.isSymbolicLink() || st.isDirectory()) return { ok: true, already: true };
    }
  } catch {
    // create below
  }
  try {
    try {
      fs.rmSync(link, { recursive: true, force: true });
    } catch {
      // ignore
    }
    if (process.platform === "win32") {
      fs.symlinkSync("..\\runtime", link, "junction");
      return { ok: true, created: true, type: "junction" };
    }
    fs.symlinkSync("../runtime", link, "dir");
    return { ok: true, created: true, type: "dir" };
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}

function stripShimEntryBlock(text) {
  return text.replace(/# Xsdsh-purge-next cli entry begin[\s\S]*?# Xsdsh-purge-next cli entry end\r?\n?/g, "");
}

function patchOfficialCliShimText(text) {
  if (!text) return { changed: false, text };
  // 老版本已改成 "$entry"、asar 原文不在了,但 BEGIN 标记还在 → 也要进来升级成三级回退。
  if (!text.includes(CLI_ASAR_ENTRY) && !text.includes(CLI_ENTRY_BEGIN)) return { changed: false, text };

  // 先铲掉旧块(可能是两级回退),再把裸 asar 路径归一成 "$entry",最后插入最新三级块,保证幂等升级。
  let next = stripShimEntryBlock(text);
  next = next.replace(
    /"\$resources\/app\.asar\/dsh\/node_modules\/@deepseek-ai\/dsh-desktop-host\/lib\/cli\.js"/g,
    '"$entry"',
  );
  next = next.replace(
    /\$resources\/app\.asar\/dsh\/node_modules\/@deepseek-ai\/dsh-desktop-host\/lib\/cli\.js/g,
    '"$entry"',
  );
  if (!next.includes('"$entry"')) return { changed: false, text };

  const block = [
    CLI_ENTRY_BEGIN,
    `entry="$resources/${CLI_ASAR_ENTRY}"`,
    `if [ ! -f "$entry" ]; then entry="$resources/${CLI_UNPACKED_ENTRY}"; fi`,
    `if [ ! -f "$entry" ]; then entry="$resources/${CLI_DIR_ENTRY}"; fi`,
    CLI_ENTRY_END,
    "",
  ].join("\n");
  const insertAt = next.search(/ELECTRON_RUN_AS_NODE=1/);
  if (insertAt >= 0) {
    // 插到该行行首,避免把 `export ELECTRON_RUN_AS_NODE=1` 从中间劈开。
    const lineStart = next.lastIndexOf("\n", insertAt) + 1;
    next = `${next.slice(0, lineStart)}${block}${next.slice(lineStart)}`;
  } else {
    next = `${block}${next}`;
  }

  if (next === text) return { changed: false, text, already: true };
  return { changed: true, text: next };
}

const CMD_ENTRY_BEGIN = "REM Xsdsh-purge-next cli entry begin";
const CMD_ENTRY_END = "REM Xsdsh-purge-next cli entry end";
const CMD_CLI_TAIL = "dsh\\node_modules\\@deepseek-ai\\dsh-desktop-host\\lib\\cli.js";

function cmdEntryAlreadyGood(text) {
  if (!text.includes(CMD_ENTRY_BEGIN) || !text.includes(CMD_ENTRY_END)) return false;
  if (/set\s+"entry=%entry%"/i.test(text)) return false;
  if (!/set\s+"entry=%~dp0[^"\r\n]*app\.asar\\dsh\\node_modules\\@deepseek-ai\\dsh-desktop-host\\lib\\cli\.js"/i.test(text)) return false;
  // #94:必须含 app.asar.unpacked 这一级回退,否则判为旧块强制升级。
  if (!/if not exist "%entry%" set "entry=%~dp0[^"\r\n]*app\.asar\.unpacked\\dsh\\node_modules\\@deepseek-ai\\dsh-desktop-host\\lib\\cli\.js"/i.test(text)) return false;
  if (!/if not exist "%entry%" set "entry=%~dp0[^"\r\n]*app\\dsh\\node_modules\\@deepseek-ai\\dsh-desktop-host\\lib\\cli\.js"/i.test(text)) return false;
  const outside = text.replace(/set\s+"entry=[^"]*"/gi, "");
  if (/app\.asar\\dsh\\node_modules\\@deepseek-ai\\dsh-desktop-host\\lib\\cli\.js/i.test(outside)) return false;
  return /"%entry%"/.test(text);
}

function stripCmdEntryBlock(text) {
  return text.replace(/\r?\n?REM Xsdsh-purge-next cli entry begin[\s\S]*?REM Xsdsh-purge-next cli entry end\r?\n?/gi, "\r\n");
}

/**
 * 卸载侧：还原 `Xsdsh-purge-next cli entry` 块。
 *
 * 不能只删块 —— 补丁把正文里的原始路径换成了 `%entry%` / `$entry`，
 * 块一删这两个变量就没人定义，CLI 会直接坏掉。所以先从块里把原始
 * asar 路径抠出来，换回正文，再删块。
 *
 * 解析不出来时 `resolved:false`，调用方必须保留原文件：宁可留一个
 * 可用的补丁，也不要把启动器改坏。
 */
export function restoreCliEntryBlock(text) {
  const src = String(text || "");
  if (!src) return { changed: false, text: src, resolved: false };

  const cmdRe = /\r?\n?REM Xsdsh-purge-next cli entry begin([\s\S]*?)REM Xsdsh-purge-next cli entry end\r?\n?/i;
  const cmd = src.match(cmdRe);
  if (cmd) {
    const m = cmd[1].match(/set\s+"entry=([^"]*?app\.asar\\[^"]*)"/i);
    let next = src;
    if (m) next = next.replace(/"%entry%"/g, `"${m[1]}"`);
    next = next.replace(cmdRe, "\r\n");
    const resolved = Boolean(m) && !/%entry%/i.test(next);
    return { changed: next !== src, text: next, resolved };
  }

  const shRe = /\r?\n?# Xsdsh-purge-next cli entry begin([\s\S]*?)# Xsdsh-purge-next cli entry end\r?\n?/;
  const sh = src.match(shRe);
  if (sh) {
    const m = sh[1].match(/entry="([^"]*?app\.asar\/[^"]*)"/);
    let next = src;
    if (m) next = next.replace(/"\$entry"/g, `"${m[1]}"`);
    next = next.replace(shRe, "\n");
    const resolved = Boolean(m) && !/\$entry\b/.test(next);
    return { changed: next !== src, text: next, resolved };
  }

  return { changed: false, text: src, resolved: false };
}

function replaceQuotedInsensitive(text, pathValue, replacement) {
  const needle = `"${pathValue}"`;
  const lower = text.toLowerCase();
  const want = needle.toLowerCase();
  let out = "";
  let i = 0;
  while (i < text.length) {
    const at = lower.indexOf(want, i);
    if (at < 0) {
      out += text.slice(i);
      break;
    }
    out += text.slice(i, at) + replacement;
    i = at + needle.length;
  }
  return out;
}

/** Windows 官方 dsh.cmd 用 %~dp0，没有 %resources%。先改原文，再插入回退，避免正则改到刚插入的行。 */
export function patchOfficialCliCmdText(text) {
  if (!text) return { changed: false, text };
  const hasAsar = text.toLowerCase().includes("app.asar\\dsh\\node_modules\\@deepseek-ai\\dsh-desktop-host\\lib\\cli.js")
    || text.includes(CLI_ASAR_ENTRY);
  const hasMarker = text.includes(CMD_ENTRY_BEGIN);
  if (!hasAsar && !hasMarker) return { changed: false, text };
  if (cmdEntryAlreadyGood(text)) return { changed: false, text, already: true };

  const nl = text.includes("\r\n") ? "\r\n" : "\n";
  // 先从原文(含旧块的 set 行)取 %~dp0 前缀,这样两级旧块也能升级成三级。
  const found = text.match(/%~dp0[^"\r\n]*?app\.asar\\dsh\\node_modules\\@deepseek-ai\\dsh-desktop-host\\lib\\cli\.js/i);
  if (!found) return { changed: false, text };
  const cut = found[0].toLowerCase().indexOf("app.asar\\");
  if (cut < 0) return { changed: false, text };
  const prefix = found[0].slice(0, cut);
  let next = stripCmdEntryBlock(text);
  next = replaceQuotedInsensitive(next, `${prefix}app.asar\\${CMD_CLI_TAIL}`, '"%entry%"');
  next = replaceQuotedInsensitive(next, `${prefix}app.asar.unpacked\\${CMD_CLI_TAIL}`, '"%entry%"');
  next = replaceQuotedInsensitive(next, `${prefix}app\\${CMD_CLI_TAIL}`, '"%entry%"');
  const block = [
    CMD_ENTRY_BEGIN,
    `set "entry=${prefix}app.asar\\${CMD_CLI_TAIL}"`,
    `if not exist "%entry%" set "entry=${prefix}app.asar.unpacked\\${CMD_CLI_TAIL}"`,
    `if not exist "%entry%" set "entry=${prefix}app\\${CMD_CLI_TAIL}"`,
    CMD_ENTRY_END,
    "",
  ].join(nl);
  const insertAt = next.search(/ELECTRON_RUN_AS_NODE=1/);
  if (insertAt >= 0) {
    const lineEnd = next.indexOf("\n", insertAt);
    const at = lineEnd >= 0 ? lineEnd + 1 : next.length;
    next = `${next.slice(0, at)}${block}${next.slice(at)}`;
  } else {
    next = block + next;
  }
  if (/set\s+"entry=%entry%"/i.test(next)) return { changed: false, text };
  if (!/"%entry%"/.test(next)) return { changed: false, text };
  if (!cmdEntryAlreadyGood(next)) return { changed: false, text };
  return { changed: next !== text, text: next };
}

/** 解包 app.asar 后修补官方 CLI：入口回退到 app/，并补 app/runtime → ../runtime。 */
export function repairOfficialCliAfterUnpack(exe = findDesktopAppExecutable()) {
  if (!exe || !isOfficialHarnessExecutable(exe)) return { ok: false, error: "not_official" };
  const resources = resourcesDirForExecutable(exe);
  if (!resources || !isDir(resources)) return { ok: false, error: "no_resources" };
  const report = { ok: true, resources, symlink: null, shims: [] };
  report.symlink = ensureAppRuntimeSymlink(resources);
  const shimPaths = [
    path.join(resources, "runtime", "cli", "bin", "dsh"),
    path.join(resources, "runtime", "cli", "bin", "dsh.cmd"),
  ];
  for (const fp of shimPaths) {
    if (!isFile(fp)) {
      report.shims.push({ path: fp, status: "missing" });
      continue;
    }
    let text = "";
    try {
      text = fs.readFileSync(fp, "utf8");
    } catch (e) {
      report.shims.push({ path: fp, status: "read_error", error: String(e && e.message ? e.message : e) });
      continue;
    }
    const patched = fp.toLowerCase().endsWith(".cmd")
      ? patchOfficialCliCmdText(text)
      : patchOfficialCliShimText(text);
    if (!patched.changed) {
      report.shims.push({ path: fp, status: patched.already ? "already" : "skipped" });
      continue;
    }
    try {
      // 原子写之前先存一份 .Xsdsh-purge-next.bak，断电/磁盘满也能回退到官方原文。
      const bak = `${fp}.Xsdsh-purge-next.bak`;
      if (!isFile(bak)) {
        try { atomicCopyFile(fp, bak); } catch { /* 写不了 bak 不致命 */ }
      }
      atomicWriteSync(fp, patched.text, "utf8");
      report.shims.push({ path: fp, status: "patched" });
    } catch (e) {
      report.shims.push({ path: fp, status: "write_error", error: String(e && e.message ? e.message : e) });
    }
  }
  return report;
}
