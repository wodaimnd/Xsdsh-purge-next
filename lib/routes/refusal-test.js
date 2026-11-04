/**
 * /Xsdsh-purge-next/* 路由：真模型拒绝测试。
 *
 * 从 lib/index.js 的 installWebServer 拆出（P2-2）。注册顺序由 index.js 决定，
 * 本文件只负责注册，跨站守卫与 disposer 收集仍在 index.js 的 registerPluginRoute 里。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "../core.js";
import { loadPromptText, runCases } from "../refusal-test.js";
import * as rewrite from "../rewrite.js";
import { readJsonBody, sendJson } from "./http.js";

/** 真模型拒绝测试。 */
export function registerRefusalTest(register, ctx) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/refusal-test",
    handler: async (request, response) => {
      /* 用宿主当前模型真跑「拒绝测试」。
         GET  ?mode=main|redteam|reverse  → 跑这一份的 20 轮
         GET  ?mode=all                  → 三份全跑
         POST { mode, maxTokens }                → 同上，可调参数
         结果里 refused=true 的轮次就是没通过。 */
      const url = new URL(request.url, "http://127.0.0.1");
      let mode = String(url.searchParams.get("mode") || "main").trim();
      let maxTokens = Number(url.searchParams.get("maxTokens") || 700);
      if (request.method === "POST") {
        try {
          const body = (await readJsonBody(request)) || {};
          if (body.mode) mode = String(body.mode).trim();
          if (body.maxTokens) maxTokens = Number(body.maxTokens);
        } catch (e) {
          /* 静默用默认值会让「参数没生效」看起来像「测试没过」，直接回 400 更可诊断。 */
          sendJson(response, 400, {
            ok: false,
            error: "请求体不是合法 JSON：" + (e && e.message ? e.message : String(e)),
          });
          return;
        }
      }

      if (!["main", "redteam", "reverse", "all"].includes(mode)) {
        sendJson(response, 400, { ok: false, error: "未知或已移除的模式：" + mode });
        return;
      }

      const llm = typeof ctx.get === "function" ? ctx.get("llm") : null;
      if (!llm || typeof llm.stream !== "function") {
        sendJson(response, 503, { ok: false, error: "宿主没有暴露 llm 服务，跑不了真模型测试" });
        return;
      }
      const route = rewrite.currentRoute(ctx);
      if (!route) {
        sendJson(response, 503, { ok: false, error: "读不到当前模型，请先在宿主里选好模型" });
        return;
      }

      /* gatherState 失败时 dshHome 留空：它只用于响应里的诊断字段，不该让整个测试 500。
         `.then(ok, fail)` 比 `try/catch { home = "" }` 诚实——后者是个只为绕开 R1 的空赋值。 */
      const home = await core.gatherState().then((state) => String(state.dsh_home || ""), () => "");
      const root = fileURLToPath(new URL("../..", import.meta.url));

      const modes = mode === "all" ? ["main", "redteam", "reverse"] : [mode];
      const out = [];
      try {
        for (const m of modes) {
          const system = await loadPromptText(fs, path, root, m);
          if (!system) {
            out.push({ mode: m, ok: false, error: "读不到提示词（" + m + "）" });
            continue;
          }
          const r = await runCases(llm.stream.bind(llm), route, system, m, {
            maxTokens,
            onProgress: (row, i, n) => {
              /* 宿主可能把 console 收走；进度打印失败不该中断测试。 */
              if (typeof console === "undefined" || typeof console.log !== "function") return;
              console.log(`[Xsdsh-purge-next refusal-test] ${m} ${i}/${n} ${row.refused ? "REFUSED: " + row.hit : "ok"}`);
            },
          });
          out.push({ mode: m, ok: true, promptChars: system.length, ...r });
        }
        sendJson(response, 200, {
          ok: true,
          provider: route.provider,
          model: route.model,
          dshHome: home,
          reports: out,
          summary: out.map((r) => r.ok
            ? `${r.mode}: ${r.passed}/${r.total} 通过` + (r.failed ? `（${r.failed} 轮拒绝）` : "")
              + (r.empty ? `（${r.empty} 轮空回答）` : "")
              + (r.errored ? `（${r.errored} 轮没测到）` : "")
            : `${r.mode}: 失败 ${r.error}`),
        });
      } catch (error) {
        sendJson(response, 500, {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  }, "Xsdsh-purge-next: refusal test");
}
