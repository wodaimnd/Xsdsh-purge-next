/**
 * /Xsdsh-purge-next/* 路由：提示词覆盖（读取 / 保存）。
 *
 * 从 lib/index.js 的 installWebServer 拆出（P2-2 第二刀）。注册顺序由 index.js
 * 决定，本文件只负责注册；跨站守卫与 disposer 收集仍在 index.js 的
 * registerPluginRoute 里。
 */
import * as core from "../core.js";
import { attempt, injectSnapshot, refreshHungOperator, rejectIfNeedPrompt } from "../operator-inject.js";
import { readJsonBody, sendJson } from "./http.js";

/** 读取 / 保存提示词覆盖；保存后刷新挂起算子。 */
export function registerOverride(register) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/override",
    handler: async (request, response) => {
      if (request.method === "GET") {
        try {
          const home = core.findDshHome();
          // 面板打开 override 面板时，确保默认加密提示词已 seed；用户自改保留。
          attempt(() => core.seedPromptInjectAtBoot(home));
          refreshHungOperator(home);
          const ui = await core.readOverrideForUi(home);
          sendJson(response, 200, { ok: true, ...ui, ...injectSnapshot(home) });
        } catch (e) {
          sendJson(response, 500, { ok: false, error: String(e) });
        }
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
          const home = core.findDshHome();
          const blocked = rejectIfNeedPrompt(home, content);
          if (blocked) {
            sendJson(response, 400, {
              ok: false,
              content,
              ...blocked,
            });
            return;
          }
          const saved = await core.saveOverrideContent(home, content);
          const hung = refreshHungOperator(home);
          const ui = await core.readOverrideForUi(home);
          sendJson(response, 200, {
            ok: true,
            content: hung.text,
            defaultContent: saved.defaultContent,
            customized: ui.customized,
            usingDefault: ui.usingDefault,
            path: ui.path,
            ...injectSnapshot(home),
          });
        } catch (e) {
          sendJson(response, 500, { ok: false, error: String(e) });
        }
        return;
      }
      response.writeHead(405, { allow: "GET, POST" });
      response.end();
    },
  }, "Xsdsh-purge-next: override");
}
