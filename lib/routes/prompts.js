/**
 * /Xsdsh-purge-next/* 路由：对话内容相关 —— 最后一条用户消息、提示词预设读写、rewind 落点与执行。
 *
 * 从 lib/index.js 的 installWebServer 拆出（P2-2）。注册顺序由 index.js 决定，
 * 本文件只负责注册，跨站守卫与 disposer 收集仍在 index.js 的 registerPluginRoute 里。
 */
import * as core from "../core.js";
import { PROMPT_PRESET_IDS, readAllPrompts, readPrompt, resetPrompt, writePrompt } from "../preset-prompts.js";
import * as rewind from "../rewind.js";
import { readJsonBody, sendJson } from "./http.js";

/** 取最后一条用户消息（rewind 的定位锚点）。 */
export function registerLastUser(register, ctx) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/last-user",
    handler: async (request, response) => {
      if (request.method !== "GET") {
        response.writeHead(405, { allow: "GET" });
        response.end();
        return;
      }
      try {
        const url = new URL(request.url, "http://127.0.0.1");
        const sessionId = String(url.searchParams.get("sessionId") || "").trim();
        sendJson(response, 200, await rewind.readLastUserText(ctx, sessionId));
      } catch (e) {
        sendJson(response, 500, { ok: false, error: String(e) });
      }
    },
  }, "Xsdsh-purge-next: last user");
}

/** 提示词预设的读 / 写 / 重置。 */
export function registerPrompts(register) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/prompts",
    handler: async (request, response) => {
      /* 模式提示词自定义：GET 读全部，POST 保存 / 恢复默认。
         改动写进 .agent-presets/<id>/ 下的覆盖文件并同步回 agent.cordis.yml，
         **下次重启才生效** —— dsh 的 persona 是启动时读进系统提示词的。 */
      let home = "";
      try {
        home = String((await core.gatherState()).dsh_home || "");
      } catch {
        home = "";
      }
      if (!home) {
        sendJson(response, 500, { ok: false, error: "拿不到 DSH_HOME，无法读写预设" });
        return;
      }
      try {
        if (request.method === "GET") {
          const url = new URL(request.url, "http://127.0.0.1");
          const id = String(url.searchParams.get("id") || "").trim();
          if (id) {
            if (!PROMPT_PRESET_IDS.includes(id)) {
              sendJson(response, 400, { ok: false, error: "未知模式：" + id });
              return;
            }
            sendJson(response, 200, readPrompt(home, id));
            return;
          }
          sendJson(response, 200, { ok: true, presets: readAllPrompts(home) });
          return;
        }
        if (request.method !== "POST") {
          response.writeHead(405, { allow: "GET, POST" });
          response.end();
          return;
        }
        const body = (await readJsonBody(request)) || {};
        const id = String(body.id || "").trim();
        if (!PROMPT_PRESET_IDS.includes(id)) {
          sendJson(response, 400, { ok: false, error: "未知模式：" + (id || "(空)") });
          return;
        }
        if (body.action === "reset") {
          const result = resetPrompt(home, id);
          sendJson(response, result.ok ? 200 : 400, result);
          return;
        }
        if (body.action === "save") {
          const result = writePrompt(home, id, body.text);
          sendJson(response, result.ok ? 200 : 400, result);
          return;
        }
        sendJson(response, 400, { ok: false, error: "action 只能是 save 或 reset" });
      } catch (error) {
        sendJson(response, 500, {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  }, "Xsdsh-purge-next: preset prompts");
}

/** rewind 可选落点列表。 */
export function registerRewindOptions(register, ctx) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/rewind/options",
    handler: async (request, response) => {
      if (request.method !== "GET") {
        response.writeHead(405, { allow: "GET" });
        response.end();
        return;
      }
      try {
        const url = new URL(request.url, "http://127.0.0.1");
        const sessionId = String(url.searchParams.get("sessionId") || "").trim();
        sendJson(response, 200, await rewind.analyzeRewind(ctx, sessionId));
      } catch (e) {
        sendJson(response, 500, { ok: false, error: String(e) });
      }
    },
  }, "Xsdsh-purge-next: rewind options");
}

/** 执行回退。 */
export function registerRewind(register, ctx) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/rewind",
    handler: async (request, response) => {
      if (request.method === "GET") {
        try {
          const url = new URL(request.url, "http://127.0.0.1");
          const sessionId = url.searchParams.get("sessionId");
          if (sessionId) {
            const draft = rewind.takeDraft(sessionId);
            sendJson(response, 200, { ok: true, ...(draft || {}) });
            return;
          }
          const pending = rewind.getPending();
          sendJson(response, 200, { ok: true, ...(pending || {}) });
        } catch (e) {
          sendJson(response, 500, { ok: false, error: String(e) });
        }
        return;
      }
      if (request.method === "POST") {
        try {
          const body = await readJsonBody(request);
          const sessionId = String(body?.sessionId || "").trim();
          if (!sessionId) {
            sendJson(response, 400, { ok: false, error: "需要 sessionId" });
            return;
          }
          const mode = body?.mode === "round" ? "round" : "once";
          const result = await rewind.applyRewind(ctx, sessionId, mode);
          sendJson(response, result.ok ? 200 : 409, result);
        } catch (e) {
          sendJson(response, 500, { ok: false, error: String(e) });
        }
        return;
      }
      response.writeHead(405, { allow: "GET, POST" });
      response.end();
    },
  }, "Xsdsh-purge-next: rewind");
}
