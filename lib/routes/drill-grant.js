/**
 * /Xsdsh-purge-next/* 路由：演练授权开关。
 *
 * 从 lib/index.js 的 installWebServer 拆出（P2-2）。注册顺序由 index.js 决定，
 * 本文件只负责注册，跨站守卫与 disposer 收集仍在 index.js 的 registerPluginRoute 里。
 */
import * as core from "../core.js";
import { readDrillGrant, writeDrillGrant } from "../drill-grant.js";
import { sendJson } from "./http.js";

/** 演练授权开关。 */
export function registerDrillGrant(register) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/drill-grant",
    handler: async (request, response) => {
      const home = core.findDshHome();
      if (request.method === "GET") {
        sendJson(response, 200, { ok: true, ...readDrillGrant(home) });
        return;
      }
      if (request.method === "POST") {
        sendJson(response, 200, { ok: true, ...writeDrillGrant(home) });
        return;
      }
      response.writeHead(405, { allow: "GET, POST" });
      response.end();
    },
  }, "Xsdsh-purge-next: drill-grant");
}
