/**
 * /Xsdsh-purge-next/* 路由：回滚宿主补丁。
 *
 * 从 lib/index.js 的 installWebServer 拆出（P2-2 第二刀）。注册顺序由 index.js
 * 决定，本文件只负责注册；跨站守卫与 disposer 收集仍在 index.js 的
 * registerPluginRoute 里。
 */
import * as core from "../core.js";
import { clearApplyLock, writeApplyLock } from "../apply-state.js";
import { hostState } from "../state.js";
import { sendJson } from "./http.js";

/** 回滚所有已应用的补丁，并撤掉 shim 目录。 */
export function registerRevert(register) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/revert",
    handler: async (request, response) => {
      // C3：revert 与 apply 抢同一批宿主文件，共用同一把锁。最外层 try/finally
      // 保证 405 / 409 这些提前 return 与抛异常分支都不会把锁占死。
      let acquired = false;
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
        acquired = true;
        const result = {};
        try {
          // 先标记已持有内存锁，诊断锁即使抛错也能在 finally 释放。
          writeApplyLock("revert");
          const state = await core.gatherState();
          if (!state.ai_base) {
            sendJson(response, 422, { ok: false, error: "未定位到宿主，无法还原补丁" });
            return;
          }
          const rev = await core.revertAll(state.ai_base);
          // 原始结果完整保留，包括错误元组、用户文件及快通道明细。
          result.details = rev;
          result.summary = rev.summary;
          const counts = ["reverted", "errors", "noBackup", "alreadyOriginal"];
          if (counts.some((key) => !Number.isSafeInteger(rev.summary?.[key]) || rev.summary[key] < 0)) {
            throw new Error("还原结果缺少有效 summary，无法确认完成情况");
          }
          result.reverted = rev.summary.reverted;
          result.errors = rev.summary.errors;
          result.no_backup = rev.summary.noBackup;
          result.already_original = rev.summary.alreadyOriginal;
          result.has_backup = rev.hasBackup === true;
          result.message = rev.message || "";
          result.shim = await core.revertAllShims();
          const shimFailed = Object.values(result.shim).some((entries) =>
            entries && typeof entries === "object" && Object.values(entries).some((value) =>
              typeof value === "string" && value.startsWith("error:")));
          if (result.errors > 0 || rev.errors.length > 0 || rev.unpacked?.error || shimFailed) {
            sendJson(response, 500, { ok: false, ...result, error: "还原未全部完成，请查看文件及 shim 错误明细" });
            return;
          }
          sendJson(response, 200, { ok: true, ...result, note: "重启 dsh 恢复; prompt-inject.md 保留" });
        } catch (e) {
          sendJson(response, 500, { ok: false, ...result, error: String(e) });
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
  }, "Xsdsh-purge-next: revert");
}
