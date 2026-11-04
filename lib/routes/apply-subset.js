/** Subset response never writes the global applied stamp or invokes full-apply adjuncts. */
import * as core from "../core.js";
import { setRestartRequired } from "../apply-state.js";
import { subsetApplyOutcome } from "../patch-selection.js";
import * as reapply from "../reapply.js";
import { HOOK_DENY_PATCH_IDS } from "../hooks-deny.js";
import { sendJson } from "./http.js";

export function sendSubsetApplied(response, selection, effective, multi) {
  const summary = core.summarizeApplyReport(multi.report, effective.patches);
  const outcome = subsetApplyOutcome(multi, effective.patches, core.summarizeApplyReport);
  // Do not clear a pending restart from a prior full apply, nor set its settle guard.
  if (outcome.restartRequired) setRestartRequired(true);
  reapply.markSubsetApplied(selection.patchIds, outcome.restartRequired);
  const restoreFailed = multi.hookDenyRestoreFailed || [];
  const hookRestore = effective.excludedPatchIds.length > 0;
  const errors = restoreFailed.map((file) => ({ stage: "hook-restore", file: String(file), error: "Hook 官方状态恢复失败或仍残留旁路标记" }));
  const skipped = { skipped: true, reason: "subset-apply" };
  sendJson(response, 200, {
    ok: true, scope: "subset", patchIds: selection.patchIds,
    effectivePatchIds: effective.patches.map((p) => p.id), excludedPatchIds: effective.excludedPatchIds,
    complete: outcome.complete, global_applied: false,
    applied: summary.applied, already: summary.already, failed: outcome.failedItems.length + errors.length,
    failed_items: outcome.failedItems, errors,
    hook_restore: { requested: hookRestore, patchIds: hookRestore ? [...HOOK_DENY_PATCH_IDS] : [],
      changed: multi.hookDenyRestoreChanged || [], failed: restoreFailed },
    error: errors.length ? "Hook 恢复失败" : outcome.complete ? "" : "所选补丁未全部完成",
    report: [
      ...multi.report.map((r) => ({ id: r.patch_id, name: r.name, status: r.status })),
      ...selection.patches.filter((p) => effective.excludedPatchIds.includes(p.id))
        .map((p) => ({ id: p.id, name: p.name, status: "off" })),
    ],
    backup: {
      made: multi.backup?.made || 0, failed: multi.backup?.failed || 0,
      errors: (multi.backup?.errors || []).slice(0, 8).map(([file, error]) => ({ file: String(file), error: String(error) })),
    },
    // /restart performs a full cleanliness gate. Subsets require a manual client restart.
    restarting: false, restart_after_apply: false, restart_required: outcome.restartRequired,
    ...reapply.applyScopeSnapshot(), restart_mode: "manual",
    unpacked_asar: false, needs_full_quit: false, asar_swap_started: false,
    shim: skipped, desktop_scrubbed: skipped, cli_repair: skipped, cmd_flash: skipped,
    override_installed: "skipped", override_kept: true,
    adjuncts: {
      cli: "skipped", shim: "skipped", seed: "skipped", override: "skipped",
      backup: "existing-host-policy", hooks: hookRestore ? "restore-entire-hook-group" : "selected-only",
    },
  });
}
