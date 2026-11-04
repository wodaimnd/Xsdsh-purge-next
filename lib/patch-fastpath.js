/** Selection-aware fastpath helpers. No discovery: all IO follows the supplied archive. */
import path from "node:path";
import { asarInnerPathsFor, asarFastpathIdentity, sameAsarIdentityForFastpath, diskFs, readAsarEntryBytes, readAsarHeaderRaw, readFastpathStamp } from "./extract-asar.js";

/** A partial landing need not contain patch #1's agent-instructions directory. */
export function isPartialAiBase(base) {
  if (!base) return false;
  const normalized = path.normalize(base).replace(/\\/g, "/");
  const suffix = ".asar.unpacked/dsh/node_modules/@deepseek-ai";
  if (!normalized.endsWith(suffix)) return false;
  const asar = normalized.slice(0, -suffix.length) + ".asar";
  const stamp = readFastpathStamp(asar);
  return Boolean(stamp?.flippedPaths.length && sameAsarIdentityForFastpath(asarFastpathIdentity(asar, stamp.flippedPaths), stamp));
}

function entryAt(raw, inner) {
  return inner.split("/").reduce((node, key) => node?.files?.[key], raw.header);
}

export function selectedTargetFiles(files, patches) {
  if (patches === undefined) return files;
  const keys = new Set(patches.flatMap((p) => Array.isArray(p.file) ? p.file : [p.file]));
  return Object.fromEntries(Object.entries(files).filter(([key]) => keys.has(key)));
}

/** Incremental prime must keep earlier patches and user edits in an existing landing. */
export function readPrimeBytes(asar, inner, raw) {
  const dest = path.join(`${asar}.unpacked`, ...inner.split("/"));
  if (entryAt(raw, inner)?.unpacked === true && diskFs().existsSync(dest)) {
    return diskFs().readFileSync(dest);
  }
  return readAsarEntryBytes(asar, inner, raw);
}

export function mergedFlippedPaths(asar, added) {
  const raw = readAsarHeaderRaw(asar);
  const previous = readFastpathStamp(asar)?.flippedPaths || [];
  return [...new Set([...previous, ...added])].filter((inner) => entryAt(raw, inner)?.unpacked === true);
}

/** A prior subset stamp says nothing about targets never materialized by that subset. */
export function selectionFastpathPlan(plan, { asar, aiBase, patches, candidates }) {
  if (patches !== undefined && plan.missingLandings?.length) {
    throw new Error(`子集应用已阻断：历史落点缺失，请先修复或全量应用：${plan.missingLandings.join(", ")}`);
  }
  if (plan.action !== "reuse") return plan;
  if (patches !== undefined) return { ...plan, action: "prime", reason: "selected-patches" };
  const raw = readAsarHeaderRaw(asar);
  const recorded = new Set(plan.recordedPaths);
  for (const value of Object.values(candidates)) {
    for (const fp of Array.isArray(value) ? value : value ? [value] : []) {
      const rel = path.relative(aiBase, fp);
      if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) continue;
      const [mapped] = asarInnerPathsFor(asar, aiBase, [rel.split(path.sep).join("/")]);
      if (mapped?.ok && entryAt(raw, mapped.inner) && !recorded.has(mapped.inner)) {
        return { ...plan, action: "prime", reason: "selection-expanded" };
      }
    }
  }
  // Shell targets lie outside aiBase. Expanding a partial application must prime these too.
  if (candidates["desktop-shell"]) {
    for (const inner of ["lib/main.js", "main.js"]) {
      if (entryAt(raw, inner) && !recorded.has(inner)) return { ...plan, action: "prime", reason: "selection-expanded" };
    }
  }
  return plan;
}
