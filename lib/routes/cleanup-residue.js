/**
 * /Xsdsh-purge-next/* 路由：旧路残留清理。
 *
 * 从 lib/index.js 的 installWebServer 拆出（P2-2 第二刀）。注册顺序由 index.js
 * 决定，本文件只负责注册；跨站守卫与 disposer 收集仍在 index.js 的
 * registerPluginRoute 里。
 */
import * as core from "../core.js";
import * as hostctl from "../host.js";
import * as uninstaller from "../uninstall.js";
import { hostState } from "../state.js";
import { sendJson } from "./http.js";

/**
 * 老用户的出路：apply 主干判定 `legacy-residue` 时硬拦（存在旧路残留的
 * resources/app，新路会读到过期代码），但 /uninstall 是「整个卸载」，只想
 * 清残留的人没有中间选项。这条路由只做 resources/app 的清理，不动插件树、
 * 不动 profile、不重启 —— 清完刷新页面即可正常「应用」。
 * 并发闸与 /uninstall 同款：只检查不持锁，避开 apply 正在写文件的时刻。
 */
export function registerCleanupResidue(register, ctx) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/cleanup-residue",
    handler: async (request, response) => {
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
      try {
        const state = await core.gatherState();
        const appCleanup = await uninstaller.cleanupResourcesApp(state);
        sendJson(response, appCleanup.ok ? 200 : 500, {
          ok: appCleanup.ok === true,
          /* 失败结果必须能说清为什么（错误模型 §5）。errors[] 是明细，error 是给前端的
             一句可读结论；成功时置 undefined，JSON.stringify 会把它丢掉，200 的体不变。 */
          error: appCleanup.ok ? undefined : String((appCleanup.errors || []).join("；") || "残留清理失败"),
          app_cleanup: appCleanup,
          surface: hostctl.currentSurface(),
          fullApp: hostctl.currentSurface() === "desktop",
          note: appCleanup.ok ? "残留已清理，正在重启宿主" : undefined,
        });
        /* 清理过程第一步就 kill 了宿主（asar 被占用时写不了 header），桌面端
           这次请求的响应多半到不了前端。必须把宿主拉回来，否则用户面对一个
           死掉的窗口。`cleanup: []` —— 这里只重启，不删插件树（与卸载的区别）。
           只在**真的杀过进程**时重启：纯 web 宿主（没有 desktop_exe）点这个按钮
           不该把 dsh 服务重启一遍、更不该重开浏览器。 */
        const killedNow = Array.isArray(appCleanup.killed) && appCleanup.killed.length > 0;
        if (appCleanup.ok && killedNow) {
          uninstaller.scheduleCleanupRestart({ request, cleanup: [], ctx });
        }
      } catch (e) {
        sendJson(response, 500, { ok: false, error: String(e && e.message ? e.message : e) });
      }
    },
  }, "Xsdsh-purge-next: cleanup-residue");
}
