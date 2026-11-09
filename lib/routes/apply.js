/**
 * /Xsdsh-purge-next/* 路由：应用补丁。
 *
 * 从 lib/index.js 的 installWebServer 拆出（P2-2 第二刀）。注册顺序由 index.js
 * 决定，本文件只负责注册；跨站守卫与 disposer 收集仍在 index.js 的
 * registerPluginRoute 里。
 *
 * 这是 24 条路由里状态最多的一条：串行锁（hostState）、apply-in-flight 标记
 * （apply-state）、挂起算子（operator-inject）三组都在这里汇合。拆出的前提是
 * 三组共享物已经各自有唯一所有者，本文件只做组装。
 */
import * as core from "../core.js";
import * as reapply from "../reapply.js";
import { applyShouldRestart } from "../settle-policy.js";
import { clearApplyLock, setRestartRequired, writeApplyLock } from "../apply-state.js";
import { injectSnapshot, refreshHungOperator, rejectIfNeedPrompt } from "../operator-inject.js";
import { hostState } from "../state.js";
import { ensureAllProfileInstall } from "../profile-insert.js";
import { beginApply, endApply } from "../apply-progress.js";
import { readJsonBody, sendJson } from "./http.js";
import { resolvePatchSelection, effectivePatchSelection } from "../patch-selection.js";
import { sendSubsetApplied } from "./apply-subset.js";

/** 应用全部补丁；串行锁 + 卡死标记 + 重启判定。 */
export function registerApply(register) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/apply",
    handler: async (request, response) => {
      let acquired = false;
      let subsetIntent = false;
      const failureScope = () => subsetIntent ? { ...reapply.applyScopeSnapshot(), partial: true,
        complete: false, restarting: false, restart_after_apply: false } : {};
      // C3：宿主写入串行锁。前端 patchBusy 只是按钮 disabled，切页签卸载就丢，
      // 串行化必须落在服务端。最外层 try/finally 兜住全部 return（405 / 409 与
      // 2176/2180/2198 这类提前 return）与抛异常分支 —— 任何一次提前 return
      // 都不能把锁永久占住，否则第二次点应用永远是 409。
      try {
        if (request.method !== "POST") {
          response.writeHead(405, { allow: "POST" });
          response.end();
          return;
        }
        if (hostState.hostWriteInFlight) {
          sendJson(response, 409, {
            ok: false,
            busy: true,
            error: "上一次应用还没跑完，请等它结束",
            since: hostState.hostWriteSince,
          });
          return;
        }
        hostState.hostWriteInFlight = true;
        hostState.hostWriteSince = Date.now();
        // B6：同步写下卡死标记（<1 ms）。必须在这一行**之后立刻**写 ——
        // 下一句 await 里就是同步解包，等进了那里再写就永远写不成了。
        writeApplyLock("apply");
        acquired = true;
        beginApply("write");
        try {
          let body;
          let selection;
          try {
            body = await readJsonBody(request);
            selection = resolvePatchSelection(body);
          } catch (e) {
            sendJson(response, 400, { ok: false, error: String(e.message || e) });
            return;
          }
          const settings = core.getHooksDenySettings();
          let effective;
          try {
            effective = effectivePatchSelection(selection, settings);
          } catch (e) {
            sendJson(response, 400, { ok: false, error: String(e.message || e) });
            return;
          }
          if (selection.subset) {
            // Intent precedes resolve/prime and every host write; errors must not lose subset scope.
            reapply.markSubsetApplied(selection.patchIds, true);
            subsetIntent = true;
          }
          const incoming = typeof body?.content === "string" ? body.content : null;
          core.applyRuntimeEnv();
          core.clearDesktopLocateCache();
          const home = core.pinDshHome();
          const scrubbed = selection.subset ? null : core.sanitizeDesktopCommandRuntimes();
          const state = await core.gatherState();
          if (home) state.dsh_home = home;
          let located;
          try {
            /* 应用死锁第三层：解包 + rename 在 DSH 开着时可能长时间不返回。
               不设超时的话 hostState.hostWriteInFlight 会一直被占着，第二次点应用永远吃
               409，面板停在「正在进行」只能靠重启 dsh 恢复。
               超时在 core 内部完成（resolveOfficialAiBaseForApply），这里保持
               `await core.xxx(...)` 的写法 —— async-await-audit 用 AST 强制。 */
            located = await core.resolveOfficialAiBaseForApply(state.ai_base, selection.subset ? { patches: effective.patches } : {});
            if (located && located.timedOut) {
              sendJson(response, 504, {
                ok: false,
                timeout: true, ...failureScope(),
                error: `解包超时，DSH 可能仍在运行，请完全退出后重试（等了 ${Math.round((located.timeoutMs || 0) / 1000)} 秒）`,
              });
              return;
            }
          } catch (e) {
            sendJson(response, 500, { ok: false, error: String(e && e.message ? e.message : e), ...failureScope() });
            return;
          }
          if (!located.aiBase) {
            sendJson(response, 500, { ok: false, error: core.missingAiBaseMessage(), ...failureScope() });
            return;
          }
          state.ai_base = located.aiBase;
          if (located.extracted) {
            const arch = located.handoff?.archive;
            if (arch) core.writeUnpackedAsarStamp(arch);
          }
          /* F6：新路孤儿清理的结果必须进日志。
           *
           * `sweptLeftover` 非零 = 有旧落点被占用删不掉（杀软锁文件、编辑器占着）。
           * 不报的话用户看到的是「清理了 N 个」，而实际留在磁盘上的失败项不可见 ——
           * 下一轮 apply 会重试，但用户不知道「为什么那个文件还在」。
           *
           * 只在 `fastpath === true` 时输出：路 A 没有孤儿清理这一步，
           * 那两个字段恒为 0，打出来是噪音。
           */
          if (located.fastpath === true) {
            console.log(
              `[Xsdsh-purge-next] 新路：复用=${located.fastpathReused === true ? "是" : "否"}`
              + ` 判定=${located.fastpathPlanReason || "unknown"}`
              + ` 清理孤儿=${located.sweptOrphans || 0}`
              + ` 残留=${located.sweptLeftover || 0}`
              + ` 补回落点=${located.missingLandings || 0}`,
            );
            if (Number(located.sweptLeftover) > 0) {
              console.warn(
                `[Xsdsh-purge-next] 有 ${located.sweptLeftover} 个旧落点未能删除（被占用），下次 apply 会再试。`,
              );
            }
            if (Number(located.missingLandings) > 0) {
              console.warn(
                `[Xsdsh-purge-next] 本轮补回了 ${located.missingLandings} 个丢失的落点文件（header 标记在、磁盘没有）。`,
              );
            }
          }
          if (selection.subset) {
            const multi = await core.applyPatchesAllHosts(selection.patches, {
              preserveClientBundles: false, forApply: true, subset: true, aiBase: state.ai_base,
              hooksDeny: { settings },
            });
            sendSubsetApplied(response, selection, effective, { ...multi, primeWritten: (multi.primeWritten || 0) + (located.primeWritten || 0) });
            return;
          }
          const handoff = located.handoff && located.handoff.swapAsar ? located.handoff : null;
          const blocked = rejectIfNeedPrompt(state.dsh_home, incoming === null ? undefined : incoming);
          if (blocked) {
            const ui = await core.readOverrideForUi(state.dsh_home);
            sendJson(response, 400, {
              ok: false,
              needPrompt: true,
              override_content: incoming || "",
              defaultContent: ui.defaultContent,
              ...blocked,
            });
            return;
          }
          try {
            await core.commitOverrideOnApply(state.dsh_home, incoming);
          } catch (e) {
            console.warn("[Xsdsh-purge-next] apply override:", String(e && e.message ? e.message : e));
          }
          const httpMulti = await core.applyPatchesAllHosts(core.ALL_PATCHES, {
            preserveClientBundles: false,
            forApply: true,
          });
          const report = httpMulti.report;
          const shim = await core.patchAllShims();
          let cliRepair = null;
          try {
            cliRepair = core.repairOfficialCliAfterUnpack();
          } catch (e) {
            cliRepair = { ok: false, error: String(e && e.message ? e.message : e) };
          }
          const flash = core.silenceCmdFlash(httpMulti.hosts[0]?.aiBase || state.ai_base);
          const summary = core.summarizeApplyReport(report);
          const hostWritten =
            core.allPatchHostsWritten(httpMulti.hosts) || core.hostCleanMarkersPresent(state.ai_base);
          const hookDenyRestoreFailed = (httpMulti.hookDenyRestoreFailed || []).length > 0;
          // 备份失败不能算 complete：补丁进得去但退不回来，必须让用户看见。
          const backupFailed = (httpMulti.backup && httpMulti.backup.failed) || 0;
          const complete = summary.failed.length === 0 && flash.ok === true && hostWritten && !hookDenyRestoreFailed && backupFailed === 0;
          const sealedNow = core.desktopAsarStillSealed();
          const promptReady = summary.failed.length > 0 && summary.failed.every((item) => item.status === "pattern_not_found");
          if (flash.ok === true && (complete || promptReady) && hostWritten) {
            reapply.markPatchesApplied();
          }
          // 全部洗完且标记进宿主才弹重启；密封包重启时换走 asar。
          const shouldRestart = applyShouldRestart({
            complete: complete || (promptReady && hostWritten),
            sealed: sealedNow,
            appliedCount: summary.applied,
            promptReady: promptReady && hostWritten,
          });
          // C5 拆语义：hostState.bootFullQuit 只表示「密封包待换 asar」，不能丢 handoff && sealedNow
          // 这道闸门，否则 web surface 与已解包宿主也会被置真，面板弹「现在重开」，
          // 点下去走 hostctl.scheduleRestart（开浏览器）而不是换包（F-C5-1）。
          const wroteToHost = Boolean(hostWritten && flash.ok === true);
          hostState.bootFullQuit = Boolean(shouldRestart && wroteToHost && handoff && sealedNow);
          // 第二语义：补丁确实写进宿主了 → 需要重开客户端。与上面互不覆盖，
          // 落盘一份，重启 / 面板重挂载后 /status 仍能读到（reapply 侧字段缺失时静默跳过）。
          setRestartRequired(Boolean(shouldRestart && wroteToHost));
          if (shouldRestart) reapply.markSettleRestart();
          let promptInjectInstall = "skipped";
          // 覆盖前备份的路径（有覆盖才有值）与「判定为用户稿、已保留」标记。
          // 后者让前端能明确说「你的改动保住了」，而不是只报一个 exists。
          let promptInjectBackup = "";
          let promptInjectKept = false;
          if (hostWritten && flash.ok === true) {
            // Apply → cleanup → restart 成功后，默认把加密提示词 seed 进 prompt-inject.md。
            // 用户自改过的内容保留；仅当文件不存在或仍是插件旧默认时才写。
            try {
              const seed = core.seedPromptInjectAtBoot(state.dsh_home);
              promptInjectInstall = seed?.action || "noop";
              // 覆盖前留的备份：前端据此告诉用户「旧内容没丢，在这儿」
              promptInjectBackup = seed?.backup || "";
              promptInjectKept = seed?.action === "keep";
            } catch (e) {
              promptInjectInstall = `error:${String(e && e.message ? e.message : e)}`;
            }
          }
          const hung = refreshHungOperator(state.dsh_home);
          let profileInsert = null;
          try {
            profileInsert = ensureAllProfileInstall(state.dsh_home);
          } catch (e) {
            console.warn("[Xsdsh-purge-next] profile-insert:", String(e));
          }
          const override = await core.readOverrideForUi(state.dsh_home);
          endApply({ complete, failed: summary.failed.length, applied: summary.applied });
          sendJson(response, 200, {
            ok: true,
            complete,
            profile_insert: profileInsert,
            restarting: shouldRestart,
            restart_after_apply: shouldRestart,
            unpacked_asar: shouldRestart,
            needs_full_quit: shouldRestart,
            asar_still_sealed: sealedNow,
            asar_swap_started: Boolean(shouldRestart && handoff && sealedNow),
            applied: summary.applied,
            already: summary.already,
            failed: summary.failed.length,
            // 备份侧状态：备份为 0 时「还原」没有数据可回滚，前端据此提示而不是装作成功。
            backup: {
              made: (httpMulti.backup && httpMulti.backup.made) || 0,
              failed: backupFailed,
              errors: ((httpMulti.backup && httpMulti.backup.errors) || [])
                .slice(0, 8)
                .map((row) => ({ file: String(row[0] || ""), error: String(row[1] || "") })),
            },
            failed_items: summary.failed.map((r) => ({
              id: r.patch_id,
              name: r.name,
              status: r.status,
            })),
            report: report.map((r) => ({ id: r.patch_id, name: r.name, status: r.status })),
            override_content: hung.text || override.content,
            defaultContent: override.defaultContent,
            ...injectSnapshot(state.dsh_home),
            override_path: override.path,
            override_installed: promptInjectInstall,
            override_backup: promptInjectBackup,
            override_kept: promptInjectKept,
            shim,
            desktop_scrubbed: scrubbed,
            cli_repair: cliRepair,
            cmd_flash: flash,
          });
        } catch (e) {
          sendJson(response, 500, { ok: false, error: String(e), ...failureScope() });
        }
      } finally {
        if (acquired) {
          hostState.hostWriteInFlight = false;
          hostState.hostWriteSince = 0;
          // B6：标记与内存标志一起释放。注意这条路径在**同步阻塞期间同样跑不到**
          // —— 真正兜底的是下次启动的 sweepApplyLockAtBoot()，不是这里。
          clearApplyLock();
        }
      }
    },
  }, "Xsdsh-purge-next: apply");
}
