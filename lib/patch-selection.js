/** Raw patch catalogue and strict HTTP selection. Never infer full apply from a bad list. */
import { ALL_PATCHES } from "./patches/index.js";
import { adapterFor } from "./surface.js";
import { HOOK_DENY_PATCH_IDS, selectPatches } from "./hooks-deny.js";

export function resolvePatchSelection(body, patches = ALL_PATCHES) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("请求体必须是 JSON 对象");
  }
  if (!Object.hasOwn(body, "patchIds")) return { subset: false, patches, patchIds: patches.map((p) => p.id) };
  if (!Array.isArray(body.patchIds) || body.patchIds.length === 0) {
    throw new Error("patchIds 必须是非空补丁 ID 数组");
  }
  const known = new Set(patches.map((p) => p.id));
  const ids = new Set();
  for (const value of body.patchIds) {
    const id = typeof value === "string" && /^[1-9]\d*$/.test(value) ? Number(value) : value;
    if (!Number.isSafeInteger(id) || id <= 0 || !known.has(id)) {
      throw new Error("patchIds 含非法或未知补丁 ID");
    }
    ids.add(id);
  }
  // Table order matters for patches that share a file; request order must not reorder them.
  const selected = patches.filter((p) => ids.has(p.id));
  return { subset: true, patches: selected, patchIds: selected.map((p) => p.id) };
}

export function patchCatalogue(state, settings, patches = ALL_PATCHES) {
  const surface = state.surface || "";
  return patches.map((p) => {
    const applicable = !p.surfaces?.length || p.surfaces.includes(surface) || p.surfaces.includes(adapterFor(surface));
    const enabled = settings?.hooksDenyBypass !== false || !HOOK_DENY_PATCH_IDS.includes(p.id);
    return {
      id: p.id, name: p.name, desc: p.desc, layer: p.layer,
      status: state.patch_status?.[p.id] || (!applicable ? "na" : !enabled ? "off" : "unknown"),
      applicable, enabled, optional: p.optional === true,
    };
  });
}

export function shouldRestoreSelectedHooks(patches, options, settings) {
  return settings.hooksDenyBypass === false
    && (!options.subset || patches.some((p) => HOOK_DENY_PATCH_IDS.includes(p.id)));
}

export function effectivePatchSelection(selection, settings) {
  const patches = selectPatches(selection.patches, settings);
  if (selection.subset && settings?.hooksDenyBypass !== false) {
    for (const id of [64, 65]) {
      if (patches.some((p) => p.id === id) && ![30, 31].every((dep) => selection.patchIds.includes(dep))) {
        throw new Error(`补丁 #${id} 需要同次选择前置补丁 #30 和 #31`);
      }
    }
  }
  const effective = new Set(patches.map((p) => p.id));
  return {
    patches,
    excludedPatchIds: selection.patchIds.filter((id) => !effective.has(id)),
  };
}

/** Subset completion is local to the requested rows, never a global applied stamp. */
export function subsetApplyOutcome(multi, patches, summarize) {
  const expected = new Set(patches.map((p) => p.id));
  const hosts = multi.hosts || [];
  const failedItems = [];
  const covered = hosts.length > 0 && hosts.map((h) => {
    const seen = new Map(h.report.map((r) => [r.patch_id, r]));
    for (const p of patches) {
      const row = seen.get(p.id);
      if (!row || (!(p.optional === true) && (row.status === "missing_file" || row.missing > 0))
        || summarize([row], [p]).failed.length > 0) {
        failedItems.push({ id: p.id, name: p.name, status: row?.status || "missing_report", file: row?.path || h.aiBase || "" });
      }
    }
    return [...expected].every((id) => seen.has(id));
  }).every(Boolean) && failedItems.length === 0;
  const complete = covered && !(multi.backup?.failed > 0) && !(multi.hookDenyRestoreFailed?.length > 0);
  // prime may have done the write already, leaving only `already` in the final report.
  const restartRequired = Number(multi.primeWritten) > 0 || hosts.some((h) => h.report.some((r) => Number(r.applied) > 0 || r.status === "applied" || r.status === "already"))
    || (multi.hookDenyRestoreChanged?.length || 0) > 0;
  return { complete, restartRequired, failedItems };
}
