import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import * as core from "./core.js";

const PLUGIN_ROOT = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

function pluginVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PLUGIN_ROOT, "package.json"), "utf8"));
    return String(pkg.version || "");
  } catch {
    return "";
  }
}

function installedRevPath() {
  return path.join(core.findDshHome(), "Xsdsh-purge-core", "installed-rev");
}

function installedRev() {
  try {
    return fs.readFileSync(installedRevPath(), "utf8").trim();
  } catch {
    return "";
  }
}

function appliedStampPath() {
  return path.join(core.findDshHome(), "Xsdsh-purge-core", "applied.json");
}

function settleGuardPath() {
  return path.join(core.findDshHome(), "Xsdsh-purge-core", "settle-restart.guard");
}

export function readAppliedStamp() {
  try {
    const raw = JSON.parse(fs.readFileSync(appliedStampPath(), "utf8"));
    return {
      version: String(raw.version || ""),
      sha: String(raw.sha || ""),
    };
  } catch {
    return null;
  }
}

/**
 * applied.json 的原始对象。
 * `readAppliedStamp()` 故意只回 `{version, sha}` 这个窄形状 ——
 * `patchesLostAfterHostReset()` 的「有没有戳」判据依赖它（F-C11-3）。
 * C5 的 `restartRequired` 走独立读函数，不往里塞。
 */
function readAppliedRaw() {
  try {
    const raw = JSON.parse(fs.readFileSync(appliedStampPath(), "utf8"));
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** 整文件重写 applied.json。写坏会让下次启动误判「没戳」，所以走 tmp + rename。 */
function writeAppliedRaw(raw) {
  const fp = appliedStampPath();
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  const tmp = `${fp}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
  try {
    fs.renameSync(tmp, fp);
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
    throw e;
  }
}

/**
 * C5：把「需要重启」持久化到 applied.json 的 `restartRequired`。
 *
 * 为什么必须落盘：`bootFullQuit` 只是模块级内存标志（`lib/index.js:58`），
 * `/apply` 返回之前前端任何一次 `loadAll()` 读到的都是 false，面板只能靠
 * 定时器碰运气再读一次 —— 这就是「点完应用要等一小会儿才弹窗」的机制。
 *
 * 旧文件没有该字段时 `readRestartRequired()` 回 false（向后兼容）。
 * 写入走「读-改-写」，不会把 version/sha/at 冲掉。
 */
const PROCESS_INSTANCE_KEY = Symbol.for("Xsdsh-purge-next.process-instance");
const PROCESS_INSTANCE = globalThis[PROCESS_INSTANCE_KEY] ||= `${process.pid}:${randomUUID()}`;

export function markSubsetApplied(patchIds, restartRequired) {
  const raw = readAppliedRaw() || {};
  writeAppliedRaw({ ...raw, applyScope: "subset", subsetPatchIds: patchIds,
    subsetProcess: PROCESS_INSTANCE, restartRequired: restartRequired || raw.restartRequired === true });
}

export function subsetApplyActive() {
  return readAppliedRaw()?.applyScope === "subset";
}

export function applyScopeSnapshot() {
  const raw = readAppliedRaw();
  const subset = raw?.applyScope === "subset";
  return { scope: subset ? "subset" : "full", restart_mode: subset ? "manual" : "auto",
    patchIds: subset ? raw.subsetPatchIds || [] : [], restart_required: raw?.restartRequired === true };
}

/** Same-process plugin reload is not a client restart; keep scope after acknowledgement. */
export function acknowledgeSubsetBoot(instance = PROCESS_INSTANCE) {
  const raw = readAppliedRaw();
  if (raw?.applyScope !== "subset" || raw.subsetProcess === instance) return false;
  writeAppliedRaw({ ...raw, subsetProcess: instance, restartRequired: false });
  return true;
}

export function markRestartRequired(flag) {
  const value = flag === true;
  const raw = readAppliedRaw() || {};
  writeAppliedRaw({ ...raw, restartRequired: value });
  return value;
}

/** 读 C5 的持久化标志。任何异常（文件不存在/半截 JSON）都按 false，绝不让 /status 500。 */
export function readRestartRequired() {
  const raw = readAppliedRaw();
  return raw?.restartRequired === true;
}

/**
 * 启动时该不该直接清 `restartRequired`。
 *
 * 【为什么新路可以在 boot 就清】
 *
 * boot 阶段还没有任何 apply 跑过。header 若已翻，只可能是**更早的进程**翻的；
 * 当前进程启动时加载的就是翻转后的 header —— 也就是说「重启」这件事已经发生了，
 * 标记是上一轮遗留的。
 *
 * 【为什么必须现在清，不能等 settle】
 *
 * 桌面面的 settle 是 `setTimeout(..., 4000)` 且**不 await**（`lib/index.js`）。
 * 前端 mount 时立刻拉 `/status`，第一帧就会读到 `restart_required:true` 并弹窗；
 * 等 settle 4 秒后清掉标记，弹窗已经弹出来了。所以要在路由注册前同步清一次。
 *
 * 只处理「密封 + 新路」这一种组合。路 A 的清标记时机不动 —— 那边 asar 已经挪走，
 * settle 原有的两道门本来就能过。
 */
export function shouldClearRestartAtBoot({ flag = false, sealed = false, fastpathActive = false } = {}) {
  return flag === true && sealed === true && fastpathActive === true;
}

/** 读一次真实状态并按 `shouldClearRestartAtBoot()` 决定是否落盘清标记。 */
export function clearRestartFlagOnFastpathBoot() {
  if (subsetApplyActive()) return acknowledgeSubsetBoot();
  if (!readRestartRequired()) return false;
  let sealed = false;
  try { sealed = core.desktopAsarStillSealed(); } catch { return false; }
  if (!shouldClearRestartAtBoot({ flag: true, sealed, fastpathActive: fastpathActiveNow() })) return false;
  markRestartRequired(false);
  return true;
}

function sameRev(a, b) {
  if (!a || !b) return false;
  return a === b || a.startsWith(b) || b.startsWith(a);
}

function isApplyPlaceholder(sha) {
  const text = String(sha || "");
  return text.startsWith("apply:") || text === "applied";
}

function applyPlaceholderVersion(sha) {
  const m = String(sha || "").trim().match(/^apply:(.+)$/);
  return m ? m[1] : "";
}

function refreshStaleApplyPlaceholder(sha) {
  const ver = pluginVersion();
  const oldVer = applyPlaceholderVersion(sha);
  if (oldVer && ver && oldVer !== ver) return `apply:${ver}`;
  return String(sha || "").trim();
}

/** 手动应用未必写过 installed-rev；空 sha 会让 settle 永远判未对齐并无限重启。 */
export function resolveApplySha(explicit) {
  const wanted = String(explicit == null ? "" : explicit).trim();
  if (wanted) return refreshStaleApplyPlaceholder(wanted) || wanted;
  const rev = installedRev();
  if (rev) return refreshStaleApplyPlaceholder(rev) || rev;
  const ver = pluginVersion();
  return ver ? `apply:${ver}` : "applied";
}

function writeInstalledRev(sha) {
  const value = String(sha || "").trim();
  if (!value) return;
  const fp = installedRevPath();
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, `${value}\n`, "utf8");
}

/**
 * 整文件重写 applied.json。
 *
 * **调用顺序契约（C5 / F-C5-2）**：这里只写 `version/sha/at`，会连带抹掉
 * `restartRequired`。所以 `markRestartRequired()` **必须**排在
 * `markPatchesApplied()` **之后**；boot 路径（`lib/index.js:945/961/1000`）
 * 只调 `markPatchesApplied()`，于是重启后 `restartRequired` 自然被清掉 ——
 * 这正是 C5 要求的「重启后清」语义，不要改成保留旧字段。
 */
function writeAppliedStamp(sha) {
  const fp = appliedStampPath();
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, `${JSON.stringify({
    version: pluginVersion(),
    sha: String(sha || "").trim(),
    at: new Date().toISOString(),
  }, null, 2)}\n`, "utf8");
}

/** 当前插件版本和已写入补丁的版本一致时，启动不必再还原重打。 */
export function stampMatches(stamp, version, rev) {
  if (!stamp || !stamp.version || stamp.version !== version) return false;
  // sha 为空表示 stamp 不完整（曾误写空串），不能当作已对齐（#56）。
  if (!stamp.sha) return false;
  const current = String(rev || "").trim();
  if (!current) return true;
  // 手动应用占位戳与后续 git rev 并存时，只认 version，避免再空转重启。
  if (isApplyPlaceholder(stamp.sha) || isApplyPlaceholder(current)) return true;
  if (!sameRev(current, stamp.sha)) return false;
  return true;
}

/**
 * 密封 asar 还在、但新路（免解包）没有生效 → 宿主运行时不会读 `resources/app`，
 * 那边的清洗标记不能当作「补丁还在」的证据。
 *
 * 新路**必须**把 `app.asar` 留在原地，`core.desktopAsarStillSealed()` 在新路上
 * 恒为 true。只看那一个判据，启动时 `patchesMatchInstallStrict()` 与
 * `hostCleanEnoughToKeep()` 会双双为假，`restartRequired` 永远清不掉 ——
 * 面板每次启动都弹「需要重启」。
 *
 * 拆成「纯判据 + 读取器」两段：纯判据可以在测试里跑完整真值表，
 * 读取器负责把可能抛错的两个 core 调用收进 try/catch。
 */
export function sealedBlocksHostEvidence(sealed, fastpathActive) {
  return sealed === true && fastpathActive !== true;
}

function fastpathActiveNow() {
  try {
    return core.unpackedFastpathActive().active === true;
  } catch {
    return false;
  }
}

export function sealedBlocksHostEvidenceNow() {
  let sealed = false;
  try { sealed = core.desktopAsarStillSealed(); } catch { /* 非桌面形态 */ }
  if (!sealed) return false;
  return sealedBlocksHostEvidence(sealed, fastpathActiveNow());
}

/**
 * stamp 对上了，但宿主被官方更新打回 sealed / 清洗标记没了时仍算未对齐（#57）。
 * 找不到插件根（web 启动早期、纯 CLI）不等于补丁丢失，否则会无限重打+重启（#59）。
 */
export function hostStillHasAppliedPatches() {
  try {
    if (sealedBlocksHostEvidenceNow()) return false;
  } catch {
    /* 非桌面面 */
  }
  try {
    const aiBase = core.findAiBase();
    if (!aiBase) return true;
    return core.hostCleanMarkersPresent(aiBase);
  } catch {
    return true;
  }
}

/** 空 sha 只有在「不是密封、也不是明确缺标记」时才允许就地补戳。 */
export function canHealEmptyStamp({ sealed = false, hasAiBase = false, markersPresent = false } = {}) {
  if (sealed) return false;
  if (hasAiBase && !markersPresent) return false;
  return true;
}

export function patchesMatchInstall() {
  if (!stampMatches(readAppliedStamp(), pluginVersion(), installedRev())) return false;
  return hostStillHasAppliedPatches();
}

/**
 * 逐补丁实检:patchStatus 里出现 "pending" 才算真的有活要干。
 * hostCleanMarkersPresent 只看任一清洗 marker 存在,无法发现 DSH 自升级后
 * agent-loop 这类文件被整体替换、#74/#87 marker 全不见的漂移。
 */
export async function hostPatchesStillPending() {
  try {
    const aiBase = core.findAiBase();
    if (!aiBase) return false;
    const status = await core.patchStatus(aiBase);
    return Object.values(status).some((row) => row === "pending");
  } catch {
    return false;
  }
}

/** fast path 过了也要再做一次逐补丁 pending 实检,避免 DSH 升级 marker 漂移时永不重打。 */
export async function patchesMatchInstallStrict() {
  if (!patchesMatchInstall()) return false;
  if (await hostPatchesStillPending()) return false;
  return true;
}

/**
 * 宿主上的清洗还在，只是版本戳旧了。启动时不能因此 revertAll，
 * 否则用户点应用并重启后，页面会回到「要重新清洗」。
 */
export async function hostCleanEnoughToKeep() {
  let aiBase = "";
  try {
    aiBase = core.findAiBase() || "";
  } catch {
    return false;
  }
  if (!aiBase || !core.hostCleanMarkersPresent(aiBase)) return false;
  /* 密封 asar 还在 ⇒ 宿主运行时压根不从 resources\app 加载，补丁写进去也没人读。
     原来的判断只看 resources\app 里的清洗标记，完全不看 asar 是否还在，
     于是「换包失败 + 重启」会让每次启动都把 applied.json 刷成「刚刚成功」，
     面板长期显示「已应用」而宿主跑的是未打补丁的原版 asar。
     这道门把「标记在但加载源不对」的状态判为不可保留，交给启动流程重打。

     新路例外：免解包宿主**必须**留着 asar，它读的是 `app.asar.unpacked`。
     此时 asar 还在不代表「加载源不对」，所以用 `sealedBlocksHostEvidenceNow()`
     把「密封 + 新路未生效」合起来判，而不是只看密封。 */
  try {
    if (sealedBlocksHostEvidenceNow()) return false;
  } catch {
    /* 非桌面形态：没 asar 概念，按原逻辑 */
  }
  const status = await core.patchStatus(aiBase);
  return !Object.values(status).some((row) => row === "pending");
}

/**
 * 有 applied 戳、且磁盘上的补丁真的没了：面板提示「补丁已丢失」（#57）。
 *
 * 旧实现只要 `desktopAsarStillSealed()` 为真就 return true，而 `desktopAsarStillSealed()`
 * 是「app.asar 还在」的意思（`core.js`：`Boolean(handoff?.asar && asarArchiveIsFile(...))`）。
 * 密封 asar 只有重启换包那一刻才被 rename 走，于是**正常使用期间这个字段恒为 true** ——
 * 面板永远说「补丁丢了」，用户无法判断补丁到底有没有生效（C11）。
 *
 * 现在把两个信号彻底拆开：
 *   · `asar_still_sealed`（/status 已有）表达「密封包待换」
 *   · `patches_lost`（本函数）只表达「磁盘上的补丁真没了」
 *
 * 判据（全部机械可判）：
 *   1. 没有 applied 戳（没应用过 / 文件被删）      → false（无戳不算丢）
 *   2. 定位不到宿主根（web、启动早期、纯 CLI）    → false（看不见不算丢）
 *   3. 清洗标记没了（宿主文件被官方升级整体替换）  → true
 *   4. 标记还在，但有补丁回到 pending             → true
 *   5. 其余（含 unmatched / skipped / na）        → false
 *
 * 第 5 条是刻意的：`unmatched` 表示「文件在、只是版本对不上」，官方升级后可能大面积出现，
 * 把它算成「丢」会让本字段又变成恒真（F-C11-1）。版本漂移由 `asar_still_sealed` 与
 * 升级流程表达。
 *
 * 变 async 是因为第 4 条要 `await core.patchStatus()`（逐文件读，天然异步）。
 *
 * `aiBase` 可选：不传时沿用 `core.findAiBase()`。
 * 为什么要这个参数：`core.findAiBase()` 在多宿主机器上可能指到 npm 全局宿主，
 * 而 `/status` 的 `patches_applied / patches_total` 来自 `gatherState().ai_base`。
 * 两者不是同一个宿主时，面板会出现「计数 63/66、却说补丁丢了」的自相矛盾。
 * 调用方把 `state.ai_base` 传进来就能对齐（不传的行为与旧版一致）。
 *
 * `options.status`（C2）：/status 里 gatherState 刚刚逐文件算过 patch_status，
 * 这里再整表扫一遍等于同一份工作做两次（低配 VM 上单次扫描 60 s 级）。
 * 调用方把 state.patch_status 传进来即可；不传仍按旧行为自己扫。
 */
export async function patchesLostAfterHostReset(aiBase = undefined, options = {}) {
  const stamp = readAppliedStamp();
  if (!stamp?.version || !stamp?.sha) return false;
  let base;
  if (aiBase === undefined) {
    // 零参调用（旧调用点）：自己找根。
    try { base = core.findAiBase() || ""; } catch { return false; }
  } else {
    // 调用方显式给了根（通常是 gatherState().ai_base）。空值代表「本机没定位到宿主」，
    // 不能偷偷回落到 findAiBase() —— 那会换到另一个宿主上判，结论对不上面板计数。
    base = String(aiBase || "");
  }
  if (!base) return false;
  let markers = false;
  try { markers = core.hostCleanMarkersPresent(base); } catch { markers = false; }
  if (!markers) return true;
  try {
    const status = options.status || await core.patchStatus(base);
    return Object.values(status).some((row) => row === "pending");
  } catch {
    return false;
  }
}

/** 手动「应用」成功后也要打戳，否则重启后 settle 会以为补丁未对齐再要求重启。 */
export function markPatchesApplied(sha) {
  const resolved = resolveApplySha(sha);
  const current = installedRev();
  // 已有更新通道写入的 git rev 时沿用；否则用 resolve 结果（含 apply:version 占位）。
  const finalSha = current && !isApplyPlaceholder(current) ? current : resolved;
  writeInstalledRev(finalSha);
  writeAppliedStamp(finalSha);
  return finalSha;
}

/**
 * #59/#60：空 sha 或缺失 installed-rev 会让 settle 每次启动都 reapply+restart。
 * 版本已对齐时先补非空戳 / 种子 rev，打断自重启；真正缺补丁再由后续逻辑重打。
 */
export function healEmptyAppliedStamp() {
  const stamp = readAppliedStamp();
  const version = pluginVersion();
  if (!stamp || stamp.version !== version) return false;
  if (stamp.sha) {
    if (!installedRev()) writeInstalledRev(stamp.sha);
    return false;
  }
  let sealed = false;
  try { sealed = core.desktopAsarStillSealed(); } catch { /* ignore */ }
  let hasAiBase = false;
  let markersPresent = false;
  try {
    const aiBase = core.findAiBase();
    hasAiBase = Boolean(aiBase);
    markersPresent = Boolean(aiBase && core.hostCleanMarkersPresent(aiBase));
  } catch {
    /* 根还没定位 */
  }
  // 密封或明确没打上清洗标记：不能补戳装成已对齐，否则 #57 不再自愈。
  if (!canHealEmptyStamp({ sealed, hasAiBase, markersPresent })) return false;
  markPatchesApplied();
  return true;
}

/** 安装后还没有 installed-rev 时先落盘占位（tarball / 手动应用常见）。 */
export function ensureInstalledRevSeed() {
  const current = installedRev();
  if (current) {
    const next = refreshStaleApplyPlaceholder(current);
    if (next && next !== current) {
      writeInstalledRev(next);
      return next;
    }
    return current;
  }
  const stamp = readAppliedStamp();
  if (stamp?.sha) {
    writeInstalledRev(stamp.sha);
    return stamp.sha;
  }
  const sha = resolveApplySha();
  writeInstalledRev(sha);
  return sha;
}

/** settle 刚重启过则冷却，防止「重打→重启→再重打」打成死循环。 */
export function shouldSkipSettleRestart(windowMs = 180000) {
  try {
    const raw = JSON.parse(fs.readFileSync(settleGuardPath(), "utf8"));
    if (String(raw.version || "") !== pluginVersion()) return false;
    const at = Date.parse(String(raw.at || "")) || 0;
    return at > 0 && Date.now() - at < windowMs;
  } catch {
    return false;
  }
}

export function markSettleRestart() {
  const fp = settleGuardPath();
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, `${JSON.stringify({
    version: pluginVersion(),
    at: new Date().toISOString(),
  }, null, 2)}\n`, "utf8");
}

/**
 * 先把宿主文件从备份还原，再按当前这份插件的补丁重写。
 * 低版本带着自己的补丁列表，高版本带着自己的；回退到哪一版就打哪一版。
 */
export async function reapplyInstalled(options = {}) {
  core.applyRuntimeEnv();
  let aiBase = null;
  let handoff = null;
  let freshExtract = null;
  try {
    const state = await core.gatherState();
    aiBase = state.ai_base;
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
  const sealed = core.sealedAsarHandoff();
  if (!aiBase || sealed) {
    try {
      const opened = await core.openSealedDesktopHost({
        upgrade: options.upgrade === true,
        forApply: true,
      });
      if (opened.aiBase) aiBase = opened.aiBase;
      if (opened.swapAsar) handoff = opened;
      if (opened.extracted) freshExtract = opened;
    } catch (e) {
      return { ok: false, error: String(e && e.message ? e.message : e) };
    }
  } else {
    core.rememberUnpackedArchive();
  }
  if (!aiBase) return { ok: false, error: core.missingAiBaseMessage() };
  // 刚解开的是官方原件。已经在用的目录仍先还原再按这一版重打。
  const preserveClientBundles = options.preserveClientBundles !== false;
  // DSH 自升级会把宿主文件整个换成新版,但旁边老 bak 不变。此时直接 revertAll 会把当前新版
  // 写回成旧版 → 新旧混码直接崩。先把"原文无 Xsdsh-purge-next marker 却和 bak 字节不同"的 bak
  // 刷到 current,再 revertAll 就不会毁掉新宿主,下面 applyPatches 把 marker 补回来。
  if (!freshExtract) {
    try {
      const refreshed = core.refreshStaleBaksForUpgrade(aiBase);
      if (refreshed.length) {
        console.warn(`[Xsdsh-purge-next] refreshed ${refreshed.length} stale bak(s) before revert:`, refreshed);
      }
    } catch (e) {
      console.warn("[Xsdsh-purge-next] refresh stale bak failed:", String(e && e.message ? e.message : e));
    }
  }
  const reverted = freshExtract ? { reverted: [] } : await core.revertAll(aiBase, { preserveClientBundles });
  if (!freshExtract) await core.revertAllShims();
  const multi = await core.applyPatchesAllHosts(core.ALL_PATCHES, { preserveClientBundles, forApply: true });
  await core.patchAllShims();
  const flash = core.silenceCmdFlash(multi.hosts[0]?.aiBase || aiBase);
  const summary = core.summarizeApplyReport(multi.report);
  const clean =
    summary.failed.length === 0 &&
    (core.allPatchHostsWritten(multi.hosts) || core.hostCleanMarkersPresent(aiBase));
  if (clean && flash.ok !== true) {
    console.warn("[Xsdsh-purge-next] cmd flash patch did not apply cleanly; clean flow continues, UI shows cmdFlashOk=false");
  }
  if (!clean && freshExtract) {
    const restored = core.restoreSealedExtract(freshExtract.appDir, freshExtract.prev);
    return {
      ok: false,
      error: restored ? "清洗没有完成，已放回上一份解开目录" : "清洗没有完成",
      restored,
      version: pluginVersion(),
      reverted: 0,
      applied: summary.applied || 0,
      failed: summary.failed.length,
      renamed: false,
      needsFullQuit: false,
      cmdFlashOk: flash.ok === true,
    };
  }
  if (clean) {
    markPatchesApplied(installedRev() || undefined);
    if (freshExtract?.archive) core.writeUnpackedAsarStamp(freshExtract.archive);
    try {
      const seed = core.seedPromptInjectAtBoot(core.findDshHome());
      if (seed && seed.action === "error") {
        console.warn("[Xsdsh-purge-next] seed prompt-inject failed:", seed.reason);
      }
    } catch (e) {
      console.warn("[Xsdsh-purge-next] seed prompt-inject exception:", String(e && e.message ? e.message : e));
    }
  }
  let renamed = false;
  if (clean && handoff?.asar && options.scheduleSwap !== false) {
    const swapped = core.scheduleSealedDesktopRestart(handoff);
    renamed = Boolean(swapped?.renamed);
  }
  const pending = Boolean(handoff?.asar && !renamed && options.scheduleSwap !== false);
  // 只有真的挪开了 app.asar，当前进程才还在旧包上，需要再开一次。
  // 官方端已经在 resources/app 里跑时，不能仅因 ELECTRON_RUN_AS_NODE 再弹「需要重启」，
  // 否则每次打开面板都会再要一次重启。
  return {
    ok: clean,
    error: clean ? "" : "清洗没有完成",
    version: pluginVersion(),
    reverted: reverted.reverted?.length || 0,
    applied: summary.applied || 0,
    failed: summary.failed.length,
    renamed,
    needsFullQuit: renamed || pending,
    cmdFlashOk: flash.ok === true,
  };
}
