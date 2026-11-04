/**
 * /Xsdsh-purge-next/* 路由：整个插件卸载。
 *
 * 从 lib/index.js 的 installWebServer 拆出（P2-2 第二刀）。注册顺序由 index.js
 * 决定，本文件只负责注册；跨站守卫与 disposer 收集仍在 index.js 的
 * registerPluginRoute 里。
 */
import * as hostctl from "../host.js";
import * as uninstaller from "../uninstall.js";
import { hostState } from "../state.js";
import { sendJson } from "./http.js";

/** 整个插件卸载（清树 + 撤补丁 + 撤登记），完成后按需重启宿主。 */
export function registerUninstall(register, ctx) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/uninstall",
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
        const result = await uninstaller.uninstallPurge();
        /* 登记没撤干净时不拦卸载（树和补丁已经清完了），但必须让用户看见：
           否则插件列表里还挂着一条，而界面只报「已卸载」。 */
        const regLeft = Array.isArray(result.registration_leftover) ? result.registration_leftover : [];
        const note = result.ok
          ? hostctl.restartNote() + (regLeft.length
            ? `（另有 ${regLeft.length} 个 profile 的登记没撤干净：${regLeft.map((x) => x.profile).join("、")}，插件列表里可能还会显示；可重跑安装器 --uninstall 清理）`
            : "")
          : undefined;
        sendJson(response, result.ok ? 200 : 500, {
          ...result,
          surface: hostctl.currentSurface(),
          fullApp: hostctl.currentSurface() === "desktop",
          note,
        });
        if (result.ok) {
          uninstaller.scheduleCleanupRestart({
            request,
            cleanup: result.cleanup,
            ctx,
          });
        }
      } catch (e) {
        sendJson(response, 500, { ok: false, error: String(e && e.message ? e.message : e) });
      }
    },
  }, "Xsdsh-purge-next: uninstall");
}
