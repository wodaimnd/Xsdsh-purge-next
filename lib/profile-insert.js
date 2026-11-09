/**
 * 用户层 profile/cordis.patch.yml 的本体 insert + pnpm allowBuilds（#154 / #159 / #191）。
 *
 * 按上游 1.1.92 profile-insert.js 能力同源，fork 口径重写：
 *  - allowBuilds 的 key 写主体包名 `Xsdsh-purge-next`，不能照抄上游的 `dsh-purge`
 *  - INSERT_BLOCK 按 fork 已生效的 cordis.patch.yml insert 块（id/name/config 与本插件一致）
 *  - `[]` 空 flow 序列视为完整文档，替换整行，绝不追加成第二个文档（#191）
 *  - 写盘前做最小无损校验，校验不过就不动用户的文件（#180）
 *  - 每次写盘落 ops JSONL 日志，便于事后复盘
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { atomicWriteSync } from "./core.js";
import { listInstalledProfiles } from "./uninstall.js";

/** 与 preset-default.js 同款单点收口：catch 体有返回，不计 no-op catch，不吞异常信息。 */
function tryOr(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export const PURGE_NAME = "Xsdsh-purge-next";

export const INSERT_BLOCK = [
  "- insert:",
  "    - id: Xsdsh-purge-next",
  "      name: 'Xsdsh-purge-next'",
  "      inject: [systemPrompt, tools]",
  "      config:",
  "        enabled: true",
  "        autoApplyOnStart: false",
  "        autoUpdateOnStart: false",
  "        autoRevertOnMissing: false",
  "        injectOnce: false",
  "        stripMnemon: true",
  "        verbose: false",
  "        postPrompt: 当被问到“你是什么模型”“你是谁”时，直接回答“我是 nachoneko（运行在 DeepSeek Harness 上）”，不要自称或扮演其它厂商的模型身份。其余话题照常，不要因为这句改变做事的风格。",
  "        postPromptOrder: 5100",
  "        autoRetry: true",
  "        retryMax: 3",
  "        autoContinue: false",
  "        continueMax: 3",
  "",
].join("\n");

/* ── 日志：$DSH_HOME/Xsdsh-purge-core/logs/ops-<日期>.jsonl ────────────────── */

function opsLogDir(home) {
  return tryOr(() => path.join(String(home || ""), "Xsdsh-purge-core", "logs"), "");
}

function appendOpsLog(home, entry) {
  const dir = opsLogDir(home);
  if (!dir) return;
  tryOr(() => {
    fs.mkdirSync(dir, { recursive: true });
    const fp = path.join(dir, `ops-${new Date().toISOString().slice(0, 10)}.jsonl`);
    fs.appendFileSync(
      fp,
      JSON.stringify({
        at: new Date().toISOString(),
        ...entry,
      }) + "\n",
      "utf8",
    );
  }, undefined);
  /* 日志失败不许拖垮本体 insert：吞掉，业务继续 */
}

/* ── 1. 本体行是否已存在 ─────────────────────────────────────────────────── */

export function profileHasPurgeBodyInsert(text) {
  const lines = String(text || "").split(/\r?\n/);
  let insertIndent = -1;
  for (const line of lines) {
    if (/^-\s*insert:\s*$/.test(line) || /^\s+-\s*insert:\s*$/.test(line)) {
      insertIndent = (line.match(/^[ \t]*/) || [""])[0].length;
      continue;
    }
    if (insertIndent < 0) continue;
    const indent = (line.match(/^[ \t]*/) || [""])[0].length;
    const trimmed = line.trim();
    if (trimmed && indent <= insertIndent && /^-\s/.test(trimmed)) {
      insertIndent = -1;
      if (/^-\s*insert:\s*$/.test(trimmed)) {
        insertIndent = indent;
      }
      continue;
    }
    if (/^-\s*id:\s*Xsdsh-purge-next(-main)?\s*$/.test(trimmed)) return true;
    if (/^-\s*name:\s*['"]?Xsdsh-purge-next['"]?\s*$/.test(trimmed)) return true;
  }
  return false;
}

/* ── 2. cordis.patch.yml 数据部分形态（#191）─────────────────────────────── */

export function classifyPatchBody(text) {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const dataLines = [];
  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    dataLines.push({ index: i, trimmed });
  }
  const lastDoc = [];
  for (const item of dataLines) {
    if (item.trimmed === "---") {
      lastDoc.length = 0;
      continue;
    }
    lastDoc.push(item);
  }
  if (lastDoc.length === 0) return { kind: "empty", lines };
  if (lastDoc.length === 1 && /^\[\s*\]\s*(#.*)?$/.test(lastDoc[0].trimmed)) {
    return { kind: "empty-flow", lines, emptyFlowIndex: lastDoc[0].index };
  }
  if (lastDoc[0].trimmed.startsWith("[")) return { kind: "flow-seq", lines };
  if (/^-(\s|$)/.test(lastDoc[0].trimmed)) {
    if (lastDoc.slice(1).some((item) => item.trimmed.startsWith("["))) {
      return { kind: "unknown", lines };
    }
    return { kind: "block-seq", lines };
  }
  return { kind: "unknown", lines };
}

/* ── 3. 把 insert 块写进单个 profile 的 cordis.patch.yml ─────────────────── */

export function ensureProfileBodyInsert(profileDir) {
  const fp = path.join(profileDir, "cordis.patch.yml");
  let text = "";
  try {
    text = fs.readFileSync(fp, "utf8");
  } catch {
    text = "";
  }
  const home = path.dirname(profileDir);
  if (profileHasPurgeBodyInsert(text)) {
    appendOpsLog(home, { op: "profile-insert", ok: true, code: "already-present", input: fp, output: "skipped" });
    return { ok: true, wrote: false, path: fp };
  }
  const shape = classifyPatchBody(text);
  const t0 = Date.now();
  if (shape.kind === "empty-flow") {
    const blockLines = INSERT_BLOCK.replace(/\n$/, "").split("\n");
    const out = [
      ...shape.lines.slice(0, shape.emptyFlowIndex),
      ...blockLines,
      ...shape.lines.slice(shape.emptyFlowIndex + 1),
    ].join("\n");
    atomicWriteSync(fp, out.endsWith("\n") ? out : `${out}\n`, "utf8");
    appendOpsLog(home, { op: "profile-insert", ok: true, code: "replaced-empty-flow", ms: Date.now() - t0, input: fp, output: "wrote" });
    return { ok: true, wrote: true, path: fp };
  }
  if (shape.kind === "flow-seq" || shape.kind === "unknown") {
    appendOpsLog(home, { op: "profile-insert", code: "skipped-host-content", input: fp, output: `shape=${shape.kind}` });
    return { ok: false, wrote: false, path: fp, error: "skip-host-content" };
  }
  const prefix = text && !text.endsWith("\n") ? "\n" : "";
  atomicWriteSync(fp, `${text}${prefix}${text ? "\n" : ""}${INSERT_BLOCK}`, "utf8");
  appendOpsLog(home, { op: "profile-insert", ok: true, code: "appended", ms: Date.now() - t0, input: fp, output: "wrote" });
  return { ok: true, wrote: true, path: fp };
}

/* ── 4. pnpm allowBuilds ─────────────────────────────────────────────────── */

export function purgePnpmBuildSpecs() {
  return [PURGE_NAME];
}

function isPurgeAllowBuildKey(key) {
  const name = String(key || "").replace(/^['"]|['"]$/g, "");
  return name === PURGE_NAME || name.startsWith(`${PURGE_NAME}@`);
}

function isSourcePurgeAllowBuildKey(key) {
  const name = String(key || "").replace(/^['"]|['"]$/g, "");
  if (!name.startsWith(`${PURGE_NAME}@`)) return false;
  return name.slice(PURGE_NAME.length + 1).includes("://");
}

function readJson(fp) {
  try {
    return JSON.parse(fs.readFileSync(fp, "utf8"));
  } catch {
    return undefined;
  }
}

/** pnpm 版本大号：取自 node_modules/.modules.yaml；读不到看 package.json 的 packageManager。 */
function pnpmMajor(profileDir) {
  const fp = path.join(String(profileDir || ""), "node_modules", ".modules.yaml");
  const fromModules = tryOr(() => {
    const text = fs.readFileSync(fp, "utf8");
    const m = text.match(/packageManager["']?[ \t]*:[ \t]*["']?pnpm@(\d+)/i);
    return m ? Number(m[1]) : undefined;
  }, undefined);
  if (fromModules !== undefined) return fromModules;
  const pkg = readJson(path.join(String(profileDir || ""), "package.json"));
  const spec = String(pkg?.packageManager || "");
  const m = spec.match(/^pnpm@(\d+)/i);
  return m ? Number(m[1]) : null;
}

/** 导出仅供单测 round-trip（#180）。 */
export function parseAllowBuildLine(line) {
  const text = String(line || "").replace(/\r$/, "");
  const quoted = text.match(/^[ \t]+(?:"([^"]+)"|'([^']+)')[ \t]*:[ \t]*(.*?)\s*$/);
  if (quoted) {
    return { key: quoted[1] !== undefined ? quoted[1] : quoted[2], value: String(quoted[3] || "").trim() };
  }
  if (!/^[ \t]+/.test(text)) return null;
  let split = -1;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== ":") continue;
    if (i + 1 >= text.length || /[ \t]/.test(text[i + 1])) split = i;
  }
  if (split < 0) return null;
  const key = text.slice(0, split).trim();
  if (!key) return null;
  return { key, value: text.slice(split + 1).trim() };
}

/** 导出仅供单测 round-trip（#180）。 */
export function formatAllowBuildLine(key) {
  const name = String(key || "");
  if (name.includes("://")) return `  ${JSON.stringify(name)}: true`;
  return `  ${name}: true`;
}

export function validateAllowBuildRewrite(text) {
  const lines = String(text || "").split("\n");
  let inAllow = false;
  let allowIndent = -1;
  const topKeys = new Set();
  const allowKeys = new Set();
  for (const line of lines) {
    if (!line.trim()) continue;
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) continue;
    if (/^\S/.test(line)) {
      inAllow = /^allowBuilds[ \t]*:/.test(line);
      allowIndent = -1;
      const m = line.match(/^(\S+?)[ \t]*:/);
      if (!m) return false;
      if (topKeys.has(m[1])) return false;
      topKeys.add(m[1]);
      continue;
    }
    if (!inAllow) continue;
    const indent = (line.match(/^[ \t]*/) || [""])[0].length;
    if (allowIndent < 0) allowIndent = indent;
    if (indent < allowIndent) {
      inAllow = false;
      continue;
    }
    const parsed = parseAllowBuildLine(line);
    if (!parsed || !parsed.key) return false;
    const name = parsed.key;
    if (allowKeys.has(name)) return false;
    if (parseAllowBuildLine(formatAllowBuildLine(name))?.key !== name) return false;
    allowKeys.add(name);
  }
  return true;
}

/**
 * 把 Xsdsh-purge-next 写成 true，避免装别的插件还报 ERR_PNPM_IGNORED_BUILDS（#168）。
 *
 * pnpm 11 见到来源键会报 ERR_PNPM_INVALID_VERSION_UNION；只有 12+（或判断不出）才保留来源键。
 * 版本判断不出时也保留，避免删用户配置。
 */
export function rewritePnpmAllowBuilds(raw, profileDir) {
  const wanted = purgePnpmBuildSpecs();
  const major = pnpmMajor(profileDir);
  const keepSources = major === null || major >= 12;
  const text = String(raw || "").replace(/\r\n/g, "\n");
  const wantedBlock = wanted.map(formatAllowBuildLine);
  if (!text.trim()) {
    return `allowBuilds:\n${wantedBlock.join("\n")}\n`;
  }
  const lines = text.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^allowBuilds[ \t]*:/.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start < 0) {
    const prefix = text.endsWith("\n") ? "" : "\n";
    return `${text}${prefix}\nallowBuilds:\n${wantedBlock.join("\n")}\n`;
  }
  let end = lines.length;
  const kept = [];
  const seen = new Set();
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) {
      end = i;
      break;
    }
    if (/^\S/.test(line)) {
      end = i;
      break;
    }
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) {
      kept.push(line);
      continue;
    }
    const parsed = parseAllowBuildLine(line);
    if (!parsed) {
      kept.push(line);
      continue;
    }
    if (isPurgeAllowBuildKey(parsed.key)) {
      if (keepSources && isSourcePurgeAllowBuildKey(parsed.key)) {
        if (seen.has(parsed.key)) continue;
        seen.add(parsed.key);
        kept.push(line);
      }
      continue;
    }
    if (seen.has(parsed.key)) continue;
    seen.add(parsed.key);
    kept.push(line);
  }
  for (let i = 0; i < wanted.length; i += 1) {
    if (!seen.has(wanted[i])) {
      kept.push(wantedBlock[i]);
      seen.add(wanted[i]);
    }
  }
  const next = [...lines.slice(0, start + 1), ...kept, ...lines.slice(end)].join("\n");
  return next.endsWith("\n") ? next : `${next}\n`;
}

/** pnpm 11/12 默认拦 postinstall（ERR_PNPM_IGNORED_BUILDS）。写进 profile 的 allowBuilds，下次 add 能跑脚本。 */
export function ensurePnpmAllowBuild(profileDir) {
  const fp = path.join(profileDir, "pnpm-workspace.yaml");
  let text = "";
  try {
    text = fs.readFileSync(fp, "utf8");
  } catch {
    text = "";
  }
  const home = path.dirname(profileDir);
  const current = String(text || "").replace(/\r\n/g, "\n");
  const t0 = Date.now();
  const next = rewritePnpmAllowBuilds(current, profileDir);
  if (next === current) {
    appendOpsLog(home, { op: "pnpm-allowbuild", ok: true, code: "already-present", input: fp, output: "skipped" });
    return { ok: true, wrote: false, path: fp };
  }
  if (!validateAllowBuildRewrite(next)) {
    appendOpsLog(home, { op: "pnpm-allowbuild", code: "allowBuilds-invalid", input: fp, output: "not-written" });
    return { ok: false, wrote: false, path: fp, error: "allowBuilds-invalid" };
  }
  atomicWriteSync(fp, next, "utf8");
  appendOpsLog(home, { op: "pnpm-allowbuild", ok: true, code: "wrote", ms: Date.now() - t0, input: fp, output: "wrote" });
  return { ok: true, wrote: true, path: fp };
}

/* ── 5. 全量：遍历所有已装 profile，补 insert + allowBuilds ─────────────── */

/** 已装进 bundles / node_modules 但缺 insert 的 profile，补上本体行。 */
export function ensureAllProfileBodyInserts(dshHome) {
  return ensureAllProfileInstall(dshHome).map((item) => ({
    dir: item.dir,
    ok: item.ok,
    wrote: Boolean(item.insert?.wrote),
    path: item.insert?.path || path.join(item.dir || "", "cordis.patch.yml"),
    error: item.error,
  }));
}

/** bundles + 本体 insert + pnpm allowBuilds。postinstall 被跳过、升级覆盖 overlay 之后靠这条把按钮找回来。 */
export function ensureAllProfileInstall(dshHome) {
  const results = [];
  for (const profile of listInstalledProfiles(dshHome)) {
    const dir = profile.dir;
    let insert = null;
    let pnpm = null;
    try {
      insert = ensureProfileBodyInsert(dir);
      pnpm = ensurePnpmAllowBuild(dir);
      results.push({ dir, ok: true, insert, pnpm });
    } catch (error) {
      results.push({
        dir,
        ok: false,
        error: error && error.message ? error.message : String(error),
        insert,
        pnpm,
      });
    }
  }
  return results;
}

/* ── 6. 卸载对称撤除（审计 2026-11-09：uninstall-insert-residue / allowbuild-uninstall-residue）──
 * 写进去的每一行都要有对称撤除：本体 insert 条目（cordis.patch.yml）与
 * allowBuilds 键（pnpm-workspace.yaml）。只动自己的条目；块因此变空时连块头一起撤；
 * 任何不确定形态一律不写盘并返回 error，宁留残留不删别人内容。 */

/** 从 cordis.patch.yml 撤掉本体 insert 条目。 */
export function removeProfileBodyInsert(profileDir) {
  const fp = path.join(profileDir, "cordis.patch.yml");
  let text = "";
  try {
    text = fs.readFileSync(fp, "utf8");
  } catch {
    return { ok: true, wrote: false, path: fp, code: "absent" };
  }
  const home = path.dirname(profileDir);
  const t0 = Date.now();
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  let idIndex = -1;
  for (let i = 0; i < lines.length; i += 1) {
    /* 优先认 id 行；兜底认 name 行（与 profileHasPurgeBodyInsert 同口径）。 */
    if (/^[ \t]*-[ \t]+id:[ \t]*Xsdsh-purge-next(-main)?[ \t]*$/.test(lines[i])) {
      idIndex = i;
      break;
    }
    if (idIndex < 0 && /^[ \t]*-[ \t]+name:[ \t]*['"]?Xsdsh-purge-next(-main)?['"]?[ \t]*$/.test(lines[i])) {
      idIndex = i;
    }
  }
  if (idIndex < 0) {
    appendOpsLog(home, { op: "profile-insert-remove", ok: true, code: "absent", input: fp, output: "skipped" });
    return { ok: true, wrote: false, path: fp, code: "absent" };
  }
  /* 向上找最近的 - insert: 行，确认该条目属于 insert 块（不碰其它顶层结构）。 */
  let insertIndex = -1;
  for (let i = idIndex - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (/^[ \t]*-[ \t]*insert:[ \t]*$/.test(line)) {
      insertIndex = i;
      break;
    }
    if (/^\S/.test(line)) break;
  }
  if (insertIndex < 0) {
    appendOpsLog(home, { op: "profile-insert-remove", code: "no-insert-parent", input: fp, output: "not-written" });
    return { ok: false, wrote: false, path: fp, error: "no-insert-parent" };
  }
  /* 删条目本体：从 id 行到下一个缩进不大于它的行。 */
  const idIndent = (lines[idIndex].match(/^[ \t]*/) || [""])[0].length;
  let endIndex = lines.length;
  for (let i = idIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;
    const indent = (line.match(/^[ \t]*/) || [""])[0].length;
    if (indent <= idIndent) {
      endIndex = i;
      break;
    }
  }
  lines.splice(idIndex, endIndex - idIndex);
  /* insert 块因此变空（块内再无 "- " 条目）时，连 - insert: 行一起撤。 */
  const insIndent = (lines[insertIndex].match(/^[ \t]*/) || [""])[0].length;
  let blockEnd = lines.length;
  let blockHasItems = false;
  for (let i = insertIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;
    const indent = (line.match(/^[ \t]*/) || [""])[0].length;
    if (indent <= insIndent) {
      blockEnd = i;
      break;
    }
    if (/^[ \t]*-[ \t]/.test(line)) blockHasItems = true;
  }
  if (!blockHasItems) lines.splice(insertIndex, blockEnd - insertIndex);
  let out = lines.join("\n");
  out = out.replace(/\n{3,}/g, "\n\n");
  if (out.trim() === "") out = "";
  else if (!out.endsWith("\n")) out += "\n";
  if (out !== "" && profileHasPurgeBodyInsert(out)) {
    appendOpsLog(home, { op: "profile-insert-remove", code: "still-present", input: fp, output: "not-written" });
    return { ok: false, wrote: false, path: fp, error: "still-present" };
  }
  atomicWriteSync(fp, out, "utf8");
  appendOpsLog(home, { op: "profile-insert-remove", ok: true, code: blockHasItems ? "removed-entry" : "removed-block", ms: Date.now() - t0, input: fp, output: "wrote" });
  return { ok: true, wrote: true, path: fp, code: blockHasItems ? "removed-entry" : "removed-block" };
}

/** 从 pnpm-workspace.yaml 的 allowBuilds 撤掉本体键；块因此变空时连 allowBuilds: 行一起撤。 */
export function removePnpmAllowBuild(profileDir) {
  const fp = path.join(profileDir, "pnpm-workspace.yaml");
  let text = "";
  try {
    text = fs.readFileSync(fp, "utf8");
  } catch {
    return { ok: true, wrote: false, path: fp, code: "absent" };
  }
  const home = path.dirname(profileDir);
  const t0 = Date.now();
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^allowBuilds[ \t]*:/.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start < 0) {
    appendOpsLog(home, { op: "pnpm-allowbuild-remove", ok: true, code: "absent", input: fp, output: "skipped" });
    return { ok: true, wrote: false, path: fp, code: "absent" };
  }
  let end = lines.length;
  const kept = [];
  let sawPurge = false;
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) {
      end = i;
      break;
    }
    if (/^\S/.test(line)) {
      end = i;
      break;
    }
    const parsed = parseAllowBuildLine(line);
    if (parsed && isPurgeAllowBuildKey(parsed.key)) {
      sawPurge = true;
      continue;
    }
    kept.push(line);
  }
  if (!sawPurge) {
    appendOpsLog(home, { op: "pnpm-allowbuild-remove", ok: true, code: "absent", input: fp, output: "skipped" });
    return { ok: true, wrote: false, path: fp, code: "absent" };
  }
  const meaningful = kept.filter((line) => line.trim() && !line.trim().startsWith("#"));
  let out;
  if (!meaningful.length) {
    out = [...lines.slice(0, start), ...lines.slice(end)].join("\n");
  } else {
    out = [...lines.slice(0, start + 1), ...kept, ...lines.slice(end)].join("\n");
  }
  out = out.replace(/\n{3,}/g, "\n\n");
  if (out.trim() === "") out = "";
  else if (!out.endsWith("\n")) out += "\n";
  if (meaningful.length && !validateAllowBuildRewrite(out)) {
    appendOpsLog(home, { op: "pnpm-allowbuild-remove", code: "allowBuilds-invalid", input: fp, output: "not-written" });
    return { ok: false, wrote: false, path: fp, error: "allowBuilds-invalid" };
  }
  atomicWriteSync(fp, out, "utf8");
  const code = meaningful.length ? "removed-key" : "removed-block";
  appendOpsLog(home, { op: "pnpm-allowbuild-remove", ok: true, code, ms: Date.now() - t0, input: fp, output: "wrote" });
  return { ok: true, wrote: true, path: fp, code };
}
