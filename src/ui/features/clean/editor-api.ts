import { checked, errorText, postBody, record } from "./api";
import type { CleanRuntime, JsonRecord, Translate } from "./types";
export const TARGETS = ["AGENTS.md", "CLAUDE.md"];
export function skillsRouteMissing(error: unknown) { return /\b404\b|\b405\b|non-json/i.test(errorText(error)); }
export function skillUiAllowed(value: unknown) {
  const data = record(value);
  const version = String(data.plugin_version || data.localVersion || "").replace(/^v/i, "");
  if (/^1\.1\.11(?:-|$)/.test(version)) return false;
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return false;
  return Number(match[1]) > 1 || Number(match[1]) === 1 && (Number(match[2]) > 1 || Number(match[2]) === 1 && Number(match[3]) >= 12);
}
export function createEditorApi(runtime: CleanRuntime) {
  return {
    rulesApi: async (op: string, extra: JsonRecord = {}) => checked(await runtime.apiJson("/Xsdsh-purge/rules", postBody({ op, ...extra }))),
    skillsApi: async (op: string, extra: JsonRecord = {}) => {
      const init = postBody({ op, ...extra });
      try { return checked(await runtime.apiJson("/Xsdsh-purge/skills", init)); }
      catch (error) { if (!skillsRouteMissing(error)) throw error; return checked(await runtime.apiJson("/Xsdsh-purge/skill", init)); }
    },
    warnNeedPrompt: (data: JsonRecord, t: Translate) => {
      // Return a warning to the editor; do not reach into window.alert.
      if (data.needPrompt || data.injectSource === "none") throw new Error(t("need.prompt"));
      return false;
    },
  };
}
