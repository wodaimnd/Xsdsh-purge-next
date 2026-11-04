/**
 * /Xsdsh-purge-next/* 路由：重启宿主。
 *
 * 从 lib/index.js 的 installWebServer 拆出（P2-2 第二刀）。注册顺序由 index.js
 * 决定，本文件只负责注册；跨站守卫与 disposer 收集仍在 index.js 的
 * registerPluginRoute 里。
 */
import * as core from "../core.js";
import * as hostctl from "../host.js";
import * as reapply from "../reapply.js";
import { setRestartRequired } from "../apply-state.js";
import { hostState } from "../state.js";
import { sendJson } from "./http.js";

async function ensureRestartReady() {
  return core.ensureHostClean();
}

/** 按当前宿主形态选择重启路径：新路重拉 / 密封包换包 / 普通重启。 */
export function registerRestart(register, ctx) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/restart",
    handler: async (request, response) => {
      if (request.method !== "POST") {
        response.writeHead(405, { allow: "POST" });
        response.end();
        return;
      }
      /* B11：本次写入不获取锁，只**检查并拒绝** —— 这两个路由不写补丁文件，
         只是杀进程 / 删文件，它们不需要串行化自己；但必须避开「apply 正在写 52 个
         文件」的时刻，否则 Stop-Process 会把写到一半的宿主留在半成品状态
         （部分文件已写、header 未改）。 */
      if (hostState.hostWriteInFlight) {
        sendJson(response, 409, {
          ok: false,
          busy: true,
          error: "上一次应用还没跑完，请等它结束",
          since: hostState.hostWriteSince,
        });
        return;
      }
      try {
        if (reapply.subsetApplyActive()) {
          sendJson(response, 409, { ok: false, error: "子集应用需手动重启客户端；自动重启的全量清洗已阻断",
            ...reapply.applyScopeSnapshot(), restarting: false });
          return;
        }
        const ready = await ensureRestartReady();
        if (!ready.ok) {
          hostState.bootFullQuit = false;
          sendJson(response, 200, {
            ok: false,
            error: ready.error || "清洗没有完成，已取消重启",
            restarting: false,
            pending: ready.pending || [],
          });
          return;
        }
        const surface = hostctl.currentSurface();
        let planned = null;
        /* 密封包必须分两路：新路（免解包）走「只杀进程 + 重新拉起」，
           路 A 才走换包。新路走换包会把 `.unpacked` 覆盖成 `resources/app`
           并挪走 `app.asar`，等于当场退回全量解包。 */
        const kind = core.sealedRestartKind({});
        if (kind === "fastpath-relaunch") {
          planned = core.relaunchDesktopForFastpath({ ctx });
        } else if (kind === "asar-swap") {
          planned = core.restartSealedDesktopIfNeeded({ ctx });
        } else {
          planned = hostctl.scheduleRestart(request, ctx);
        }
        if (planned && planned.clean === false) {
          hostState.bootFullQuit = false;
          sendJson(response, 200, {
            ok: false,
            error: "清洗没有写进当前宿主，已取消重启",
            restarting: false,
            planned: false,
            asar_swap_log: "",
          });
          return;
        }
        // C9：只在「确认真的踢起来了」时才清标记。密封包分支的 restartSealedDesktopIfNeeded
        // 只是计划一次异步 swap（spawn PowerShell），此刻并没有重启；swap 失败时标记必须留着，
        // 否则用户回面板看到「无需重启」，补丁实际没生效且不会再有提示。
        // restarting 只认显式的成功信号：planned.restarting === true（core 按 F-C9-2 把
        // scheduleAsarSwapRestart 的 scheduled 结果映射过来），或 core 直接透出 {scheduled:true}。
        // 绝不看 planned.asarSwap —— 那是「计划要换包」，恒为真，拿它当成功判据等于没改。
        const plannedOk = Boolean(planned) && planned.clean !== false;
        const restarting = Boolean(planned && (planned.restarting === true || planned.scheduled === true));
        if (plannedOk && restarting) {
          hostState.bootFullQuit = false;
          // 与 C5 配套：持久标记与内存镜像一并清掉（reapply 侧字段缺失时静默跳过）。
          setRestartRequired(false);
        }
        const restartError = planned && planned.error ? String(planned.error) : "";
        sendJson(response, 200, {
          ok: restarting || !restartError,
          planned: plannedOk,
          surface,
          fullApp: surface === "desktop",
          restarting,
          already: Boolean(planned && planned.already),
          needsFullQuit: Boolean(planned && planned.asarSwap),
          // C9：swap 日志路径。唯一来源是 lib/desktop.js 的 PS1 $SwapLog，
          // JS 侧不另写死文件名（F-C9-4），core 透不出来时给空串。
          asar_swap_log: String((planned && planned.logPath) || ""),
          asar_still_sealed: core.desktopAsarStillSealed(),
          error: restartError || undefined,
          note: restarting ? "正在重启。" : restartError,
        });
      } catch (e) {
        sendJson(response, 500, { ok: false, error: String(e) });
      }
    },
  }, "Xsdsh-purge-next: restart");
}
