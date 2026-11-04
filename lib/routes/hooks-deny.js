/**
 * /Xsdsh-purge-next/* 路由：宿主 hook 拒绝状态（只读诊断）。
 *
 * 从 lib/index.js 的 installWebServer 拆出（P2-2）。注册顺序由 index.js 决定，
 * 本文件只负责注册，跨站守卫与 disposer 收集仍在 index.js 的 registerPluginRoute 里。
 */
import * as core from "../core.js";
import { readJsonBody, sendJson } from "./http.js";

/** 宿主 hook 拒绝状态（只读诊断）。 */
export function registerHooksDeny(register) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/hooks-deny",
    handler: async (request, response) => {
      if (request.method === "GET") {
        try {
          const settings = core.refreshHooksDenySettings();
          sendJson(response, 200, { ok: true, hooksDenyBypass: settings.hooksDenyBypass });
        } catch (e) {
          sendJson(response, 500, { ok: false, error: String(e) });
        }
        return;
      }
      if (request.method === "POST") {
        try {
          const body = await readJsonBody(request);
          if (typeof body?.hooksDenyBypass !== "boolean") {
            sendJson(response, 400, { ok: false, error: "hooksDenyBypass must be boolean" });
            return;
          }
          const saved = core.setHooksDenySettings({ hooksDenyBypass: body.hooksDenyBypass });
          sendJson(response, 200, { ok: true, hooksDenyBypass: saved.hooksDenyBypass });
        } catch (e) {
          sendJson(response, 500, { ok: false, error: String(e) });
        }
        return;
      }
      response.writeHead(405, { allow: "GET, POST" });
      response.end();
    },
  }, "Xsdsh-purge-next: hooks-deny");
}
