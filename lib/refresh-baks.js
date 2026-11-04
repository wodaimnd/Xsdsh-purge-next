/**
 * 升级自愈：刷新过期 bak 时，不能把「已打补丁」的 live 当成官方新版。
 *
 * DSH 自升级会把宿主文件整个换成官方新版,但旁边的 .xsdshpurge.bak 不会动
 * (backupAll 对已有 bak 走 wx 独占直接 continue)。老 bak 变过期后:
 *   · revertAll 会把当前的新版文件写回成老版 → 新代码/旧代码混合直接崩
 *   · patchesMatchInstall 的 hostCleanMarkersPresent 只看任一文件存在清洗 marker 就算对齐,
 *     结果 #74/#87 这类放到 agent-loop 的补丁从未被重打,hang-inject 全路径哑火。
 * 这里:current 和 bak 字节不同、且 current 不是「我们打过的版本」→ 把 bak 刷到 current。
 *
 * 判断「打过」不能只看 `Xsdsh-purge-next` 字面量：#1 这类提示词补丁的输出只有
 * STRONG_INTRO 文本，不含该字面量，旧逻辑会把已打补丁的 live 当成官方新版，
 * 用补丁后的内容覆盖纯净 bak，回滚就失去原件。所以先按目标文件逐补丁
 * `patchApplied()` 判断，字面量只作兜底。
 *
 * 本模块从 core.js 拆出：core.js 是巨型文件，lint 禁止继续增长；
 * 依赖由调用方注入，避免与 core.js 形成循环 import。
 */
import fs from "node:fs";
import path from "node:path";
import { ALL_PATCHES } from "./patches/index.js";

const DSH_PURGE_MARKER_NEEDLE = "Xsdsh-purge-next";

/** 目标文件 → 会写它的补丁。 */
function targetPatchesByPath(aiBase, deps) {
  const map = new Map();
  let files;
  try { files = deps.targetFiles(aiBase); } catch { return map; }
  for (const p of ALL_PATCHES) {
    for (const key of deps.fileKeysOf(p)) {
      for (const fp of deps.pathsOf(files, key)) {
        if (!fp) continue;
        if (!map.has(fp)) map.set(fp, []);
        map.get(fp).push(p);
      }
    }
  }
  return map;
}

/**
 * @param {string} aiBase
 * @param {{targetFiles:Function, fileKeysOf:Function, pathsOf:Function, patchApplied:Function,
 *          isUserProfilePatchFile:Function, isDir:Function, bakSuffix:string}} deps
 * @returns {string[]} 被刷新的原文件路径
 */
export function refreshStaleBaksForUpgrade(aiBase, deps) {
  const refreshed = [];
  if (!aiBase || !deps.isDir(aiBase)) return refreshed;
  const patchedByPath = targetPatchesByPath(aiBase, deps);
  const roots = [aiBase];
  const nested = path.join(aiBase, "dsh", "node_modules", "@deepseek-ai");
  if (deps.isDir(nested)) roots.push(nested);
  const visit = (dir, depth) => {
    if (depth > 10) return;
    let ents = [];
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const ent of ents) {
      if (ent.name === "node_modules" || ent.name === ".git") continue;
      const fp = path.join(dir, ent.name);
      if (ent.isDirectory()) { visit(fp, depth + 1); continue; }
      if (!ent.isFile() || !ent.name.endsWith(deps.bakSuffix)) continue;
      const original = fp.slice(0, -deps.bakSuffix.length);
      if (deps.isUserProfilePatchFile(original)) continue;
      let originalBuf;
      let bakBuf;
      try {
        originalBuf = fs.readFileSync(original);
        bakBuf = fs.readFileSync(fp);
      } catch { continue; }
      if (originalBuf.equals(bakBuf)) continue;
      // 原文件是「我们打过的版本」就不碰 bak：先按目标补丁的 markers 判断，
      // 再用字面量兜底（有些补丁的输出不带 Xsdsh-purge-next）。
      let patched = originalBuf.includes(DSH_PURGE_MARKER_NEEDLE);
      if (!patched) {
        const text = originalBuf.toString("utf8");
        // migrationOnly / knownGap 的 marker 是原生宿主本来就有的官方措辞，
        // 不能当成「我们打过」的证据；否则官方升级后 bak 永远不会刷新。
        const candidates = (patchedByPath.get(original) || [])
          .filter((p) => !p.migrationOnly && !p.knownGap);
        try {
          patched = candidates.some((p) => deps.patchApplied(text, p));
        } catch {
          patched = false;
        }
      }
      if (patched) continue;
      try {
        fs.writeFileSync(fp, originalBuf);
        refreshed.push(original);
      } catch {
        continue; // bak 被占用，下次再试
      }
    }
  };
  for (const root of roots) visit(root, 0);
  return refreshed;
}
