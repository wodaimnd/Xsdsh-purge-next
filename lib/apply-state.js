/**
 * apply 状态的唯一所有者：restart-required 标志、跨进程 apply 锁、阶段判定、
 * 新路预判（只读）。
 *
 * 从 lib/index.js 拆出（P2-2 第二刀）。拆出的直接原因不是行数，而是路由：
 * `/status`、`/revert`、`/restart`、`/apply` 都要读同一份锁 / 阶段状态，而写者
 * （`/apply`、`/revert`）与读者（`/status`）拆进 `lib/routes/` 之后，必须共享
 * 同一个持有者。
 *
 * `sweepApplyLockAtBoot` 留在这里而不是 index.js：它和 inspect / remove 是同一组
 * 不变量（谁能删锁、什么算 stale），拆开会让「删锁」出现两个入口。日志由调用方
 * 注入，避免为 purgeLog 再建一个模块。
 */
import fs from "node:fs";
import path from "node:path";
import * as core from "./core.js";
import * as reapply from "./reapply.js";
import { hostState } from "./state.js";

// C5 拆语义：「补丁已经写进宿主、需要重开客户端」。它与 index.js 的 bootFullQuit
// （「密封包待换 asar」）不可合并 —— 合并会在 web surface 与「app 目录已在跑」的
// 桌面态也置真 boot_full_quit，面板弹「现在重开」却走 hostctl.scheduleRestart
// （开浏览器）而不是换包（见 F-C5-1）。
let restartRequiredFlag = false;

/* 读侧诊断的降级口：任一 core 探针抛错都只让该字段为 null，绝不让 /status 500。
   写成 `try/catch { return fallback }` 而不是空 catch —— 后者会被 R1 判成
   「静默吞异常」，而这里的语义是「这一项判不了」，必须有明确返回值。 */
function quiet(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

// 同时维护内存镜像与 applied.json 的 restartRequired。持久化字段由 lib/reapply.js 提供
// （markRestartRequired / readRestartRequired）；函数还没落地或读写失败时静默退化到内存
// 标志，绝不让 /status 或 /apply 因为一个可选持久化字段报错。
export function setRestartRequired(flag) {
  restartRequiredFlag = flag === true;
  return persistRestartRequired(restartRequiredFlag);
}

function persistRestartRequired(flag) {
  try {
    if (typeof reapply.markRestartRequired !== "function") return false;
    reapply.markRestartRequired(Boolean(flag));
    return true;
  } catch {
    return false;
  }
}

// /status 用：优先读持久值，回落内存镜像。任何异常都按内存值，绝不让 /status 500。
export function readRestartRequiredSafe() {
  try {
    return Boolean(reapply.readRestartRequired() || restartRequiredFlag);
  } catch {
    return restartRequiredFlag;
  }
}

/* ── B6：apply-in-flight.lock（跨进程 / 跨重启的卡死标记）─────────────────────
 *
 * 为什么必须有第二个标记：hostState.hostWriteInFlight 是纯内存布尔。`/apply` 里那句
 * `await core.resolveOfficialAiBaseForApply(...)` 做的是**同步**解包（extractAsar 纯同步），
 * 整段时间主线程被占死；而释放锁的 finally 也在同一线程上 —— 它根本轮不到执行。
 * 更糟的是连 409 都发不出去：发 409 同样需要事件循环。结果就是锁永久为 true、
 * 面板永远停在「正在进行」，只能重启 dsh 才能恢复。
 *
 * 所以兜底的判据必须**不依赖事件循环**：把「谁在写」落盘，判活走 process.kill(pid, 0)。
 * 进程被杀 → 文件留下 → 下次启动的同步检查就能发现并清掉。全部同步调用，不用定时器。
 *
 * 语义边界：内存标志仍是第一道闸（快路径 / 同进程），这个文件锁是第二道闸
 * （跨进程 / 跨重启）。两者并存，谁也不替代谁。
 */

const APPLY_LOCK_NAME = "apply-in-flight.lock";

/* 区分「读 / 解析失败」与「真的解析出 null」——两者在 clearApplyLock 里处置不同。 */
const PARSE_FAILED = Symbol("apply-lock-parse-failed");

function applyLockPath() {
  try {
    const home = core.pinDshHome() || core.findDshHome();
    if (!home) return "";
    return path.join(home, "Xsdsh-purge-core", APPLY_LOCK_NAME);
  } catch {
    return "";
  }
}

/* pid 存活检查。三种结果必须分开，混为一谈就会误删别人的锁：
 *   · 正常返回        → 进程存在（活着）
 *   · 抛 err.code === "ESRCH" → 进程不存在 —— 这是**唯一**能判定残留下的来的错误
 *   · 抛 err.code === "EPERM" → 进程**存在**但无权发信号（Windows 上 pid 4 / System 等）。
 *                              绝不能当残留：删了就等于主动放弃最后一道闸。
 * pid 非法（NaN / ≤0 / 非整数）按「不可信」处理 → 不当作活着。
 * 已知局限：pid 会被复用，死进程的 pid 恰好被无关进程占用时会误判为活着（锁留到下次
 * 重启仍不清）。不额外做进程启动时间比对 —— 那是平台相关且重的做法，age_ms 已够诊断。 */
function applyLockPidAlive(pid) {
  const n = Number(pid);
  if (!Number.isFinite(n) || n <= 0 || Math.floor(n) !== n) return false;
  try {
    process.kill(n, 0);
    return true;
  } catch (e) {
    if (e && e.code === "ESRCH") return false;
    return true;
  }
}

/* 读 lock 并判定。stale 的语义只有一条：**这个锁已经不可能是「正在进行的写入」**。
 *   pid 已死              → 持有者不存在 → 残留
 *   pid 是本进程且正在写  → 真的在跑（/status 轮询期就是这个状态）→ 不是残留
 *   pid 是本进程但没在写  → 只可能是 pid 复用（上一轮那个进程死了，pid 被我继承）→ 残留
 *   pid 是别的活进程      → 真有另一个 dsh 在写 → 不是残留，必须保留
 * 注意清单 B6 把「pid 活着且是当前进程」写成「保留但记录」；启动期 hostState.hostWriteInFlight
 * 必然为 false，那时这条只可能是 pid 复用，保留会让 stale 横幅永久挂着。此处按语义
 * 实现，清单未改。 */
export function inspectApplyLock() {
  const fp = applyLockPath();
  const none = { present: false, path: fp, pid: 0, since: 0, age_ms: 0, alive: false, owner: "none", stale: false };
  if (!fp) return none;
  let raw = "";
  try {
    raw = fs.readFileSync(fp, "utf8");
  } catch {
    return none; // 文件不存在是**正常路径**（没人在写），不许当错误
  }
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { parsed = null; }
  const pid = parsed && Number.isFinite(Number(parsed.pid)) ? Math.floor(Number(parsed.pid)) : 0;
  const since = parsed && Number.isFinite(Number(parsed.since)) ? Math.max(0, Math.floor(Number(parsed.since))) : 0;
  const age = since > 0 ? Math.max(0, Date.now() - since) : 0;
  const alive = applyLockPidAlive(pid);
  const isSelf = pid === process.pid;
  const liveHere = isSelf && hostState.hostWriteInFlight === true;
  const stale = !alive || (isSelf && !liveHere);
  return {
    present: true,
    path: fp,
    pid,
    since,
    age_ms: age,
    alive,
    owner: !alive ? "dead" : (isSelf ? "self" : "other"),
    stale,
  };
}

/* apply_phase 的三个来源按优先级排，顺序不能换：
 *   1. 锁残留且持有者已死 → 一律 "unknown"。**必须先判这条**：盘上 phase 很可能还停在
 *      "extracting"（进程就死在那一步），照抄给前端就是「正在解包」——而进程早没了，
 *      用户会一直等一个不存在的解包。这正是 captain 点名的坑。
 *   2. 锁属于**别的**活进程 → 内存里的 apply_phase 对我们毫无意义（那是我们自己的状态），
 *      只有盘上那份是真相。
 *   3. 否则内存优先（engine 的 core.getApplyPhase），回落盘上，最后 unknown。
 * 没有锁 = 没有写入在跑 = "idle"。
 * getApplyPhase 若尚未交付（engine 在 t52 落地），守卫成空串而不是抛错 —— /status 不许 500。 */
export function applyPhaseForStatus(info) {
  const VALID = new Set(["idle", "extracting", "patching", "unknown"]);
  /* engine 的 core.getApplyPhase() 返回对象 {phase, stale, pid, since, detail}；
     早期契约草稿写的是字符串。两种都接住 —— 这个字段会跨版本共存，
     硬要求某一种形状会让另一半环境直接拿到 unknown。 */
  let mem = "";
  let memStale = false;
  try {
    if (typeof core.getApplyPhase === "function") {
      const got = core.getApplyPhase();
      if (typeof got === "string") {
        mem = got;
      } else if (got && typeof got === "object" && typeof got.phase === "string") {
        mem = got.phase;
        memStale = got.stale === true;
      }
    }
  } catch {
    mem = "";
  }
  /* 优先级不能换：
     ① B6 锁残留（持有者 pid 已死）→ unknown。engine 那份 apply-phase.json 靠的是
        「盘上不是 idle 而内存是 idle」来判重启，它看不见「另一个 dsh 被杀了」这种情形；
        锁的 pid 判活是这里唯一能确认「进程真的没了」的证据。
     ② engine 自己说 stale → unknown（解析不了 / 重启后残留）。
     ③ 否则用 engine 的阶段值。
     没有锁也没有阶段 = 从没跑过 apply = idle。 */
  if (info && info.present && info.stale) return "unknown";
  if (memStale) return "unknown";
  if (VALID.has(mem)) return mem;
  return info && info.present ? "unknown" : "idle";
}

/* 写标记。必须同步：写成异步会被**同一个阻塞**推迟到阻塞结束之后，标记等于没写。
 * 任何失败都吞掉 —— 一个诊断用的标记不许把 apply 本身弄失败。 */
export function writeApplyLock(host) {
  const fp = applyLockPath();
  if (!fp) return false;
  try {
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    /* 这个文件只回答一个问题：**有没有 apply 正在跑、是谁**。字段刻意只有三个：
     *   pid    持有者进程号（判活靠它，process.kill(pid, 0)）
     *   since  写入时刻（ms epoch，算 age_ms，让用户知道卡了多久）
     *   host   apply / revert（哪个入口占的锁）
     * 阶段（extracting / patching）**不放这里**：engine 的 core.getApplyPhase() 有自己
     * 的 apply-phase.json，core.js 里明确写了不复用本文件的理由 —— 两件事混一个文件，
     * 两边都会互相覆盖。这里保持单一职责，阶段全部交给 engine。 */
    const payload = {
      pid: process.pid,
      since: Date.now(),
      host: String(host || "apply"),
    };
    fs.writeFileSync(fp, JSON.stringify(payload), "utf8");
    return true;
  } catch {
    return false;
  }
}

function removeApplyLockFile(fp) {
  const target = fp || applyLockPath();
  if (!target) return false;
  try {
    fs.unlinkSync(target);
    return true;
  } catch {
    return false; // 本来就不存在（ENOENT）也算目标达成，不区分
  }
}

/* finally 用：只删**自己写的**那把锁。多 dsh 实例并存时，别人的锁不能由我们清掉。 */
export function clearApplyLock() {
  const fp = applyLockPath();
  if (!fp) return false;
  /* 读不出来（半截文件 / 已消失）→ 按自己的删；读出来但不是自己的 → 留着。
     用哨兵区分「解析失败」与「解析出 null」，语义与原 try/catch 完全一致。 */
  const cur = quiet(() => JSON.parse(fs.readFileSync(fp, "utf8")), PARSE_FAILED);
  if (cur !== PARSE_FAILED && Number(cur && cur.pid) !== process.pid) return false;
  return removeApplyLockFile(fp);
}

/* 启动时检查（插件加载时调一次）。这是 B6 的**根因修复点**：
 * 上一次 apply 卡死在同步解包里、进程被用户杀掉，finally 永远不会跑，
 * 于是只能靠下一次启动在这里发现残留并清掉。
 * `log` 由调用方注入（index.js 传 purgeLog），避免本模块依赖日志实现。
 * 默认空函数：启动路径将来漏传时，清扫本身仍要完成，不能因日志而抛错。 */
export function sweepApplyLockAtBoot(log = () => {}) {
  const info = inspectApplyLock();
  if (!info.present) return { present: false, action: "none" };
  if (!info.stale) {
    log("apply-lock-kept", { pid: info.pid, since: info.since, age_ms: info.age_ms, owner: info.owner });
    return { present: true, action: "kept", info };
  }
  const removed = removeApplyLockFile(info.path);
  log("apply-lock-stale", {
    pid: info.pid,
    since: info.since,
    age_ms: info.age_ms,
    owner: info.owner,
    removed,
  });
  return { present: true, action: removed ? "removed" : "remove-failed", info };
}

/* /status 用：只透出四个字段。stale 是前端唯一需要的判据（显示「上次应用异常中断」）；
 * 没有 lock 时 pid/since/age_ms 全 0 且 stale=false，与「有 lock 但活着」靠 stale 区分。 */
export function applyInFlightForStatus(info) {
  const it = info || inspectApplyLock();
  return {
    stale: Boolean(it.stale),
    pid: it.pid || 0,
    since: it.since || 0,
    age_ms: it.age_ms || 0,
  };
}

/* ── B22：本次 apply 会走哪条路（预判）+ 新路诊断 ──────────────────────
 *
 * 【这个字段为什么必须在**阻塞前**读到】
 * 同步解包会把主进程事件循环钉死 10–16 分钟，期间 /status 全部排队、前端 60 s
 * abort。apply_phase 虽然专为阻塞期设计，但它也得经 /status 出去 —— 同样读不到。
 * 唯一出路是**预判**：判定在用户点「应用」之前就能算，前端每 800 ms 轮询一次，
 * 早已把结论缓存下来；等到阻塞开始、/status 全部超时，那份缓存仍在手上，
 * 于是能说「预计走全量解包，可能需要 10 分钟以上」而不是「还没定位到本机 Harness」。
 *
 * 【必须是「预计」，不是断言】
 * 判定发生在 apply 之前，两者之间存在时间差：fuse 可读性、asar 是否被换、残留目录
 * 出现与否都可能在这中间变化。所以前端文案**必须**用「预计/可能会」，不能写成
 * 事实陈述。真正的结果只有 apply 跑完后的 fastpath_last_error 与 asar_swap_log 能说。
 *
 * 【输入必须与真实 apply 同源】
 * 真实 apply（core.js:3411）传的是 {handoff, exe, asar, appDir, allowNonElectron}。
 * 这里用 core.sealedAsarHandoff({}) 取同一份 handoff，再按同样方式透传 exe/asar ——
 * 否则本字段探的是「本机真宿主」，而 apply 处理的是另一个归档，预判就是假的。
 * appDir 不必显式给：shouldUseUnpackedFastPath 内部的 detectLegacyResidue 会由 exe
 * 推出 appDir，与 apply 侧的 desktop.appDirForExecutable(handoff.exe) 同源同值。
 * allowNonElectron 生产路径恒为 false，故不传。
 *
 * 【只读】
 * 三个 core 函数全部只读：sealedAsarHandoff / detectLegacyResidue 只用 existsSync/statSync，
 * readAsarHeaderRaw 是 openSync(asar, "r")，readElectronFuses 是 openSync(exe, "r")。
 * 零 writeSync / 零 mkdir / 零 extractAsar —— /status 每 800 ms 调一次也不会写盘。
 * 实测四字段合计约 43 ms（gatherState 本身 450–1584 ms，占比可忽略）。
 *
 * 【降级】
 * 任一环抛错或返回异常形状 → 该字段 null，绝不让 /status 整体 500。
 * 四个字段都是 null 时前端应理解为「判不了」，不是「不会解包」。
 */
export function fastpathStatusForStatus() {
  const out = {
    fastpath_will_use: null,
    fastpath_will_use_reason: null,
    fastpath_last_error: null,
    legacy_residue: null,
    /* 与 fastpath_will_use 的区别：那个是**预判**（apply 前），这个是**事实**
       （身份记录 + 三元组比对通过 = 新路真的在生效）。排障时看这个。 */
    fastpath_active: null,
    fastpath_active_reason: null,
  };
  // 先取 handoff：它同时是 shouldUseUnpackedFastPath 的输入和 asar/exe 的来源。
  const handoff = quiet(
    () => (typeof core.sealedAsarHandoff === "function" ? core.sealedAsarHandoff({}) : null),
    null,
  );

  const d = quiet(
    () => (typeof core.shouldUseUnpackedFastPath === "function"
      ? core.shouldUseUnpackedFastPath(handoff ? { handoff, exe: handoff.exe, asar: handoff.asar } : {})
      : null),
    null,
  );
  // enabled 只认布尔：返回 undefined/非布尔说明形状变了，宁可 null 也不猜。
  out.fastpath_will_use = d && typeof d.enabled === "boolean" ? d.enabled : null;
  out.fastpath_will_use_reason = d && typeof d.reason === "string" ? d.reason : null;

  const e = quiet(
    () => (typeof core.getFastpathLastError === "function" ? core.getFastpathLastError() : ""),
    "",
  );
  // core 用空串表示「没失败过」；转成 null 让前端只需判真假，不必区分 "" 与 undefined。
  out.fastpath_last_error = typeof e === "string" && e ? e : null;

  // 只读 + 带缓存（键是 asar 与身份记录的 size+mtime），/status 高频调用也安全。
  const a = quiet(
    () => (typeof core.unpackedFastpathActive === "function"
      ? core.unpackedFastpathActive(handoff ? { asar: handoff.asar } : {})
      : null),
    null,
  );
  out.fastpath_active = a && typeof a.active === "boolean" ? a.active : null;
  out.fastpath_active_reason = a && typeof a.reason === "string" ? a.reason : null;

  // 与 apply 侧同源：带 exe 走同一个 appDir 推导，不带就退到本机 resourcesPath。
  const r = quiet(
    () => (typeof core.detectLegacyResidue === "function"
      ? core.detectLegacyResidue(handoff && handoff.exe ? { execPath: handoff.exe } : {})
      : null),
    null,
  );
  out.legacy_residue = typeof r === "boolean" ? r : null;

  return out;
}
