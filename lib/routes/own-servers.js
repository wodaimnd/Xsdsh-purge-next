/**
 * /Xsdsh-purge-next/* 路由：自有服务地址白名单（网络作用域）。
 *
 * 从 lib/index.js 的 installWebServer 拆出（P2-2）。注册顺序由 index.js 决定，
 * 本文件只负责注册，跨站守卫与 disposer 收集仍在 index.js 的 registerPluginRoute 里。
 */
import * as core from "../core.js";
import { readAllowText, writeAllowText } from "../net-scope.js";
import { readJsonBody, sendJson } from "./http.js";

/** 自有服务地址白名单（网络作用域）。 */
export function registerOwnServers(register) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/own-servers",
    handler: async (request, response) => {
      const home = core.findDshHome();
      if (request.method === "GET") {
        sendJson(response, 200, { ok: true, content: readAllowText(home) });
        return;
      }
      if (request.method === "POST") {
        try {
          const body = await readJsonBody(request);
          const content = typeof body?.content === "string" ? body.content : null;
          if (content === null) {
            sendJson(response, 400, { ok: false, error: "content must be a string" });
            return;
          }
          const saved = await writeAllowText(home, content);
          sendJson(response, 200, { ok: true, content: saved.text, dropped: saved.dropped });
        } catch (e) {
          sendJson(response, 500, { ok: false, error: String(e && e.message ? e.message : e) });
        }
        return;
      }
      response.writeHead(405, { allow: "GET, POST" });
      response.end();
    },
  }, "Xsdsh-purge-next: own-servers");
}
