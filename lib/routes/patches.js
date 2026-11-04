/** Raw catalogue; register through the same origin guard/disposer as /status. */
import * as core from "../core.js";
import { hostState } from "../state.js";
import { patchCatalogue } from "../patch-selection.js";
import { sendJson } from "./http.js";

export function registerPatches(register) {
  register({
    kind: "exact",
    path: "/Xsdsh-purge-next/patches",
    handler: async (request, response) => {
      if (request.method !== "GET") {
        response.writeHead(405, { allow: "GET" });
        response.end();
        return;
      }
      try {
        if (!hostState.webTreeReady) {
          sendJson(response, 503, { ok: false, error: "not-ready", ready: false });
          return;
        }
        const state = await hostState.statusFlight(async () => await core.gatherState());
        const patches = patchCatalogue(state, core.getHooksDenySettings());
        sendJson(response, 200, {
          ok: true, ready: true, total: patches.length, patches,
          surface: state.surface || "", host_available: Boolean(state.ai_base),
        });
      } catch (e) {
        sendJson(response, 500, { ok: false, error: String(e) });
      }
    },
  }, "Xsdsh-purge-next: patches");
}
