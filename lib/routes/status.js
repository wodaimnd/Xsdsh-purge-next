/**
 * /Xsdsh-purge-next/* 路由：面板状态（只读）。
 *
 * 从 lib/index.js 的 installWebServer 拆出（P2-2 第二刀）。注册顺序由 index.js
 * 决定，本文件只负责注册；跨站守卫与 disposer 收集仍在 index.js 的
 * registerPluginRoute 里。
 *
 * `purgeLog` 由 index.js 注入：它是 index.js 的私有日志实现（依赖
 * PURGE_INTERNAL_LOG / 轮转计数），为这一条路由单独抽成模块不划算。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "../core.js";
import * as hostctl from "../host.js";
import * as reapply from "../reapply.js";
import * as skills from "../skills.js";
import { readUninstallLeftover } from "../uninstall-leftover.js";
import { countBackupFiles } from "../backup-stats.js";
import {
  applyInFlightForStatus,
  applyPhaseForStatus,
  fastpathStatusForStatus,
  inspectApplyLock,
  readRestartRequiredSafe,
} from "../apply-state.js";
import { hostState } from "../state.js";
import { sendJson } from "./http.js";

// 面板显示的版本号。以前借 update.js 的 localVersion()，
// 那个模块随 GitHub 自更新一起移除了，这里直接读自己的 package.json。
const PLUGIN_VERSION = (() => {
  try {
    const p = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "package.json");
    return JSON.parse(fs.readFileSync(p, "utf8")).version || "0.0.0";
  } catch {
    return "0.0.0";
  }
})();

/** 面板状态：gatherState 全量扫描 + 锁/阶段/新路诊断。 */
export function registerStatus(register, { purgeLog }) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/status",
    handler: async (request, response) => {
      if (request.method !== "GET") {
        response.writeHead(405, { allow: "GET" });
        response.end();
        return;
      }
      try {
        if (!hostState.webTreeReady) {
          sendJson(response, 503, { ok: false, error: "not-ready", ready: false });
          return;
        }
        const stateStartedAt = Date.now();
        /* C6：并发请求共享同一份在飞结果。typeof 守卫的成因见下面 applyLockSnapshot
           那条注释（本函数会被测试用固定符号表抽出来单独执行）。
           `async () => await` 不是多余：async-await-audit 要求 async 导出的调用点
           必须显式 await，否则会拿到 Promise 当同步值用（C11 就是这么栽的）。 */
        const state = typeof hostState.statusFlight === "function"
          ? await hostState.statusFlight(async () => await core.gatherState())
          : await core.gatherState();
        /* 现场诊断（只记日志，不改超时）：低配 VM 上出现过「读不到: timeout」
           —— 前端 /status 超时是 60 s，能触发说明后端整整 60 s 没回。
           这条日志把「慢」归到 gatherState 上（它内部含 patchStatus 逐文件读），
           下一次再出现时不必靠猜。 */
        const stateMs = Date.now() - stateStartedAt;
        if (stateMs > 3000) purgeLog("status-slow", { phase: "gatherState", ms: stateMs });
        // C5 拆语义：boot_full_quit 只说「密封包待换 asar」，保持内存原义；
        // restart_required 说「补丁已写、需重开客户端」，优先读 applied.json 的持久值。
        // 旧 applied.json 没有该字段 → readRestartRequired 回 false（向后兼容）；
        // reapply 侧函数缺失或读盘抛错 → 回落内存镜像，/status 不允许因此 500。
        const restartRequiredNow = readRestartRequiredSafe();
        // B6/B7：卡死标记只读一次盘，apply_in_flight 与 apply_phase 共用这份快照。
        // 分开读会在两次 readFileSync 之间被同伴实例删掉，两个字段就自相矛盾。
        // typeof 守卫不是防御性编程洁癖：test/hooks-deny-wiring.test.mjs 用 new Function
        // 把 /status handler 原样抽出来，只注入一张**固定**的符号表（core / reapply /
        // skills / hostctl / sendJson / …）。下面三个 helper 是后加的模块级函数，不在那张
        // 表里，直接调用就是 ReferenceError → /status 打成 500 → 那个测试整片变红。
        // 缺符号时降级成中性值（无标记 / idle），语义与「确实没有 lock」完全一致；
        // 有符号时走真实实现，不受影响。
        const applyLockSnapshot = typeof inspectApplyLock === "function" ? inspectApplyLock() : null;
        const applyInFlightNow = typeof applyInFlightForStatus === "function"
          ? applyInFlightForStatus(applyLockSnapshot)
          : { stale: false, pid: 0, since: 0, age_ms: 0 };
        const applyPhaseNow = typeof applyPhaseForStatus === "function"
          ? applyPhaseForStatus(applyLockSnapshot)
          : "idle";
        // B22：同一张固定符号表里也没有 fastpathStatusForStatus（见上一条注释的成因），
        // 缺符号时给 null —— 前端读到的语义是「判不了」，与「不会解包」区分得开。
        const fastpathNow = typeof fastpathStatusForStatus === "function"
          ? fastpathStatusForStatus()
          : {
            fastpath_will_use: null, fastpath_will_use_reason: null,
            fastpath_last_error: null, legacy_residue: null,
            fastpath_active: null, fastpath_active_reason: null,
          };
        // C11：patchesLostAfterHostReset 是 async（内部要 await core.patchStatus 逐文件读）。
        // 同步调用拿到的是 Promise，JSON 序列化成 {}，而 {} 恒真 —— 面板就永远说「补丁丢了」，
        // C11 的修复等于没做。必须 await，且把 gatherState 的 ai_base 显式传进去：
        // 零参会回落 core.findAiBase()，多宿主机器上可能指到另一个宿主，与上面的
        // patches_applied / patches_total 计数不同源。显式传空串 = 本机没定位到宿主，
        // reapply 侧不会偷换宿主（那会误报丢失），直接按「看不见不算丢」回 false。
        let patchesLostNow = false;
        try {
          /* C2：gatherState 刚刚逐文件算过 patch_status，这里直接复用；
             再调一次 patchStatus 等于每次 /status 都做两遍全量扫描。 */
          patchesLostNow = Boolean(await reapply.patchesLostAfterHostReset(state.ai_base || "", { status: state.patch_status }));
        } catch {
          /* 判不了就当没丢，绝不让 /status 500。赋 false 而不是空 catch —— R1 只认
             空 / 纯注释的 catch，而这里的语义是「失败回落到 false」。 */
          patchesLostNow = false;
        }
        const patch_names = {};
        for (const p of core.ALL_PATCHES) patch_names[String(p.id)] = p.name;
        sendJson(response, 200, {
          ok: true,
          ready: true,
          surface: state.surface || hostctl.currentSurface(),
          ai_base: state.ai_base,
          desktop_install: state.desktop_install || "",
          desktop_exe: state.desktop_exe || "",
          asar_still_sealed: state.asar_still_sealed || false,
          missing_ai_base: state.ai_base ? "" : core.missingAiBaseMessage(),
          patches_applied: state.ai_base ? (state.display_applied ?? state.patches_applied) : 0,
          patches_pending: state.display_pending ?? state.patches_pending,
          patches_skipped: state.display_skipped ?? state.patches_skipped ?? 0,
          patches_ready: state.display_ready ?? state.patches_ready ?? 0,
          patches_na: state.patches_na || 0,
          patches_total: state.ai_base ? (state.display_total ?? state.patches_total ?? 0) : 0,
          patches_lost: patchesLostNow,
          patch_status: state.patch_status,
          patches: (state.display_patches || []).map((p) => ({
            id: p.id,
            ids: p.ids,
            layer: p.layer || "",
            status: p.status,
          })),
          patch_names,
          shim_cmd: state.shim_cmd,
          shim_ps1: state.shim_ps1,
          shim_bin: state.shim_bin,
          has_backup: state.has_backup,
          // 仅当前目标表的文件级备份；快通道或判不了为 null。守卫兼容固定符号表测试。
          backup_count: typeof countBackupFiles === "function" ? await countBackupFiles(state) : null,
          override_status: state.override_status,
          override_path: state.override_path,
          dsh_home: state.dsh_home,
          plugin_version: PLUGIN_VERSION,
          boot_full_quit: hostState.bootFullQuit,
          // C5：与 boot_full_quit 拆开的第二语义 —— 补丁已写进宿主、需重开客户端。
          // 持久值优先（applied.json 的 restartRequired），回落内存镜像；前端弹窗读它。
          ...(typeof reapply.applyScopeSnapshot === "function" ? reapply.applyScopeSnapshot() : {}),
          restart_required: restartRequiredNow,
          // C5：apply / revert 进行中为 true，面板重挂载后据此恢复「处理中」外观。
          apply_running: hostState.hostWriteInFlight,
          // B6：跨进程 / 跨重启的卡死标记。apply_running 只是本进程的内存快照，
          // 进程被杀之后它随进程一起消失；这个字段读的是盘上的 apply-in-flight.lock，
          // 所以能跨重启告诉前端「上次应用异常中断」。stale=false 且 pid=0 = 没有标记。
          // 只读一次盘：两个字段必须基于同一次快照，否则中间锁被同伴删掉会自相矛盾。
          apply_in_flight: applyInFlightNow,
          // B7/B6 配套：apply_phase 是**唯一**能在同步解包期反映真实阶段的通道
          // （180 s 超时的 504 在同步阻塞下永不可达，见 t43 调查）。
          // 残留锁（持有者已死）一律报 unknown —— 盘上的 phase 多半还停在 extracting，
          // 照抄会让前端一直说「正在解包」，而那个进程早没了。
          apply_phase: applyPhaseNow,
          // B22：**预判**，不是断言。判定发生在 apply 之前，两者之间 fuse / asar /
          // 残留目录都可能变。前端文案必须写「预计」，不能写成事实陈述。
          // 它的价值在阻塞期：/status 全部超时后，前端仍持有阻塞前缓存的这个值。
          // true=预计走新路（不整目录解包）；false=预计走路 A（全量解包，慢）；
          // null=判不了（含 core 未导出该函数、抛错、返回形状异常）。
          fastpath_will_use: fastpathNow.fastpath_will_use,
          // 为什么走不成新路，让前端能区分文案：opt-out / legacy-residue /
          // no-electron / no-asar / header / fuse-unknown / integrity-fuse-on /
          // env / default。null 表示没拿到判定。
          fastpath_will_use_reason: fastpathNow.fastpath_will_use_reason,
          // 上一次新路失败的原因（core 用空串表示没失败过，这里归一成 null）。
          // 这是 apply **跑完之后**唯一能说明「为什么回落到路 A」的字段。
          fastpath_last_error: fastpathNow.fastpath_last_error,
          // resources/app 旧版残留。true 时 apply 会被硬阻断（补丁会写进残留目录、
          // 宿主却读归档，静默错乱），前端据此提前提示用户先清理。
          legacy_residue: fastpathNow.legacy_residue,
          // 新路**是否真的在生效**（事实，不是预判）。判据 = 身份记录 + 三元组比对。
          // 排障用：`false` 且 reason=identity-changed 表示官方换过包，需要重新应用。
          fastpath_active: fastpathNow.fastpath_active,
          fastpath_active_reason: fastpathNow.fastpath_active_reason,
          hooks_deny_bypass: core.getHooksDenySettings().hooksDenyBypass,
          // 「Hooks 拦截」开关的三态落地状态：dirty / applied_unrestarted / synced。
          // hooks_deny_bypass 只说「用户想要什么」，这个字段说「宿主现在是什么」，
          // 前端据此画精确的红/绿（改了没应用 / 已应用待重启 / 已同步）。
          // 判定全在 core.hookDenyState 里，复用既有 patch_status（已含
          // annotateHookDenyStatus 的折算）与上面的 restartRequiredNow（持久值优先），
          // 本处不新造任何检测逻辑。
          hooks_deny_state: core.hookDenyState(state.patch_status, restartRequiredNow),
          /* U9：上次卸载 helper 没删掉的目录。typeof 守卫的成因同 applyLockSnapshot：
             hooks-deny-wiring 测试把 handler 抽出去用固定符号表执行。 */
          uninstall_leftover: typeof readUninstallLeftover === "function"
            ? readUninstallLeftover()
            : null,
          /* 阶段 5：重启 helper 的日志尾部。helper 是 detached 子进程，
             stdio 被 ignore，失败时唯一能说明「死在哪一步」的就是 %TEMP%
             里那几份日志。这里直接给路径与最后几行，省得用户自己翻目录。
             typeof 守卫同 uninstall_leftover：hooks-deny-wiring 用固定符号表跑 handler。 */
          restart_diag: typeof core.restartDiagnostics === "function"
            ? core.restartDiagnostics()
            : null,
          ...(await skills.skillsStatus(core.findDshHome()).catch(() => ({ skills: [] }))),
        });
      } catch (e) {
        sendJson(response, 500, { ok: false, error: String(e) });
      }
    },
  }, "Xsdsh-purge-next: status");
}
