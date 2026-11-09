/**
 * 停用 / 卸载时，把指向本插件预设的 selectedDefault 收回来。
 *
 * 为什么必须有这个文件：宿主的预设 resolve() 遇到未知预设是**硬抛**，不会回退
 * 到 config.default。本插件把 `redteam` / `reverse` / `cheat` 落到
 * `$DSH_HOME/.agent-presets/<id>/`，卸载后预设目录没了、注册行没了，但用户的
 * `cordis.patch.yml` 里那行 `selectedDefault: redteam` 还在 —— 下一次启动宿主直接
 * 起不来，报的是「未知预设」，和插件已经无关，用户根本查不到原因（上游 #108）。
 *
 * 两条清理通道，各自管一段：
 *   1. 运行中的宿主：直接改 live 配置（settings 里 `agent-preset-registry` 那一行）。
 *   2. 磁盘上的 profile 配置：只改 `selectedDefault:` 那一行，不重排整份 YAML。
 *
 * 取材自上游 dsh-purge 1.1.92 `lib/preset-default.js`（205 行），按本插件改写：
 *   · 预设 id 从单值 `redteam` 扩到三套（cheat / redteam / reverse），匹配走正则集合；
 *   · 写盘改走 `atomicWriteSync`（宿主被杀时不留半截 YAML）；
 *   · 删预设目录前先认标记：只有确认是我们原样落下去的才删，用户改过的一律保留并报告；
 *   · 返回值改成诊断记录 `{ status, ... }`，不是失败结果（见 docs/design/错误模型.md）。
 */
import fs from "node:fs";
import path from "node:path";
import { atomicWriteSync, findDshHome } from "./core.js";

/** 本插件会往 `.agent-presets/` 落盘的预设 id，与 `presets/` 下的目录一一对应。 */
export const OWNED_PRESET_IDS = ["cheat", "redteam", "reverse"];

/** 收回时落到哪个预设。宿主内置的 standard 一定存在。 */
export const FALLBACK_PRESET = "standard";

/** 预设目录里的归属标记：`presets/<id>/agent.cordis.yml` 正文含这个串。 */
const OWNERSHIP_MARK = "Xsdsh-purge-next";

/** 用户改过预设一定会留下的痕迹，看到就不删目录。 */
const USER_EDIT_MARKS = ["persona-override.md", ".defaults.json"];

/**
 * 试一下，失败就给兜底值。
 * 宿主这些节点（settings / config）形态随版本变，读不到是常态；统一在这里收口，
 * 调用点不写 catch，也就不会散成一堆静默吞异常。
 * @template T
 * @param {() => T} fn
 * @param {T} fallback
 * @returns {T}
 */
function tryOr(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/**
 * 这个 id 是不是我们的预设。
 * 兼容三种写法：`redteam`、`local/redteam`、`local\redteam`。
 * @param {unknown} value
 * @returns {boolean}
 */
export function isOwnedPresetId(value) {
  const id = String(value ?? "").trim().toLowerCase();
  if (!id) return false;
  return OWNED_PRESET_IDS.some((own) => id === own || id.endsWith(`/${own}`) || id.endsWith(`\\${own}`));
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readText(fp) {
  return tryOr(() => fs.readFileSync(fp, "utf8"), "");
}

/**
 * 列出所有可能写 `selectedDefault` 的用户配置文件。
 * 只认 profile 根下那两份，不递归、不碰 node_modules。
 * @param {string} dshHome
 * @returns {string[]}
 */
function listProfileYamlFiles(dshHome) {
  const root = path.join(dshHome, "profiles");
  const names = tryOr(() => fs.readdirSync(root), []);
  const out = [];
  for (const name of names) {
    if (name === "node_modules") continue;
    for (const file of ["cordis.patch.yml", "cordis.yml"]) {
      const fp = path.join(root, name, file);
      if (tryOr(() => fs.statSync(fp).isFile(), false)) out.push(fp);
    }
  }
  return out;
}

/**
 * 只把 `selectedDefault` 指向我们预设的那一行改成 fallback。
 * 整份 YAML 原样保留（缩进、注释、行尾空白都不动），所以除了那一行没有别的风险。
 * @param {string} text
 * @param {string} [fallback]
 * @returns {{ text: string, changed: boolean }}
 */
export function repairSelectedDefaultInYaml(text, fallback = FALLBACK_PRESET) {
  const src = String(text ?? "");
  if (!src || !/selectedDefault/.test(src)) return { text: src, changed: false };
  const ids = OWNED_PRESET_IDS.map(escapeRegExp).join("|");
  // 前缀段 `local/` 可选；引号捕获后回填，保持用户原来的引号风格。
  const pattern = new RegExp(
    `(selectedDefault\\s*:\\s*)(["']?)(?:[\\w.-]+[\\\\/])?(?:${ids})\\2`,
    "gi",
  );
  const next = src.replace(pattern, `$1$2${fallback}$2`);
  return { text: next, changed: next !== src };
}

/**
 * 改一个 profile 配置文件，没变化就不写盘。
 * @param {string} fp
 * @param {string} [fallback]
 * @returns {{ path: string, changed: boolean }}
 */
function repairProfileFile(fp, fallback = FALLBACK_PRESET) {
  const raw = readText(fp);
  if (!raw) return { path: fp, changed: false };
  const { text, changed } = repairSelectedDefaultInYaml(raw, fallback);
  if (!changed) return { path: fp, changed: false };
  atomicWriteSync(fp, text, "utf8");
  return { path: fp, changed: true };
}

function configValue(node) {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  const viaGet = tryOr(() => (typeof node.get === "function" ? node.get() : undefined), undefined);
  if (viaGet != null && String(viaGet) !== "") return String(viaGet);
  const viaValue = tryOr(() => node.value, undefined);
  if (viaValue != null) return String(viaValue);
  return "";
}

function configSet(node, value) {
  if (!node) return false;
  const viaSet = tryOr(() => {
    if (typeof node.set !== "function") return false;
    node.set(value);
    return true;
  }, false);
  if (viaSet) return true;
  return tryOr(() => {
    node.value = value;
    return true;
  }, false);
}

const REGISTRY_SETTINGS_KEYS = ["agent-preset-registry", "@deepseek-ai/dsh-agent-preset-registry"];

function registryRow(settings) {
  if (!settings || typeof settings.get !== "function") return null;
  for (const key of REGISTRY_SETTINGS_KEYS) {
    const row = tryOr(() => settings.get(key), null);
    if (row) return row;
  }
  return null;
}

/**
 * 改运行中宿主的配置：settings 那一行 + 内存里的 registry 对象。
 * 停用时宿主还活着，只改磁盘的话下拉里仍然是错的，所以两条都走。
 * @param {object} ctx
 * @returns {boolean} 是否改到了 live 配置
 */
function clearLiveSelectedDefault(ctx) {
  if (!ctx) return false;
  const settings = tryOr(() => (typeof ctx.get === "function" ? ctx.get("settings") : ctx.settings), null);
  let persisted = false;

  const row = registryRow(settings);
  const selected = configValue(row?.config?.selectedDefault ?? row?.selectedDefault);
  if (isOwnedPresetId(selected) && typeof settings?.update === "function") {
    const fallback = configValue(row?.config?.default ?? row?.default) || FALLBACK_PRESET;
    if (fallback && !isOwnedPresetId(fallback)) {
      const ret = tryOr(() => settings.update(REGISTRY_SETTINGS_KEYS[0], { selectedDefault: fallback }), null);
      if (ret && typeof ret.then === "function") ret.catch(() => {});
      persisted = Boolean(ret);
    }
  }

  const bags = [];
  const reg = tryOr(() => (typeof ctx.get === "function" ? ctx.get("agentPresets") : null), null) || ctx.agentPresets;
  if (reg) bags.push(reg.config || reg);
  const regRow = registryRow(settings);
  if (regRow) bags.push(regRow.config || regRow);

  for (const bag of bags) {
    if (!bag) continue;
    if (!isOwnedPresetId(configValue(bag.selectedDefault))) continue;
    const fallback = configValue(bag.default) || FALLBACK_PRESET;
    if (configSet(bag.selectedDefault, fallback)) return true;
  }
  return persisted;
}

/**
 * 把 selectedDefault 收回来。停用与卸载都调这一个。
 * 失败只记在返回值里，不抛 —— 清理动作不许把停用流程挡住。
 * @param {{ ctx?: object, dshHome?: string, ids?: string[] }} [opts]
 * @returns {{ status: string, live: boolean, files: string[], dirs: string[], kept: Array<{path: string, reason: string}> }}
 */
export function clearOwnedSelectedDefault(opts = {}) {
  const home = opts.dshHome || findDshHome();
  const report = { status: "none", live: false, files: [], dirs: [], kept: [] };
  report.live = tryOr(() => clearLiveSelectedDefault(opts.ctx), false);
  if (!home) {
    report.status = "no-home";
    return report;
  }
  for (const fp of listProfileYamlFiles(home)) {
    const row = tryOr(() => repairProfileFile(fp), { path: fp, changed: false, error: "" });
    if (row.error) report.kept.push({ path: fp, reason: "write-failed: " + row.error });
    else if (row.changed) report.files.push(fp);
  }
  const swept = sweepOwnedPresetDirs(home, opts.ids);
  report.dirs = swept.removed;
  report.kept.push(...swept.kept);
  if (report.live || report.files.length || report.dirs.length) report.status = "cleared";
  return report;
}

let pendingClear = null;

/**
 * 延迟清理：热重载是「先 dispose 再 apply」，同步删会把用户的红队默认冲掉。
 * 800ms 内 apply 又起来了就取消，等于没停用。
 * @param {{ ctx?: object, dshHome?: string, ids?: string[] }} [opts]
 */
export function scheduleClearOwnedSelectedDefault(opts = {}) {
  if (pendingClear) {
    clearTimeout(pendingClear);
    pendingClear = null;
  }
  pendingClear = setTimeout(() => {
    pendingClear = null;
    tryOr(() => clearOwnedSelectedDefault(opts), null);
  }, 800);
  if (typeof pendingClear.unref === "function") pendingClear.unref();
}

/** apply 进来时调用：撤销上一次 dispose 排下的清理。 */
export function cancelClearOwnedSelectedDefault() {
  if (!pendingClear) return;
  clearTimeout(pendingClear);
  pendingClear = null;
}

/**
 * 这个预设目录是不是我们原样落下去的那份。
 * 判据：agent.cordis.yml 带归属标记，且没有用户改动痕迹。
 * @param {string} dir
 * @returns {{ ours: boolean, reason: string }}
 */
function inspectPresetDir(dir) {
  const text = readText(path.join(dir, "agent.cordis.yml"));
  if (!text) return { ours: false, reason: "no-agent.cordis.yml" };
  if (!text.includes(OWNERSHIP_MARK)) return { ours: false, reason: "not-ours" };
  for (const mark of USER_EDIT_MARKS) {
    if (tryOr(() => fs.existsSync(path.join(dir, mark)), false)) {
      return { ours: false, reason: "user-edited:" + mark };
    }
  }
  return { ours: true, reason: "" };
}

/**
 * 扫掉本插件落下的预设目录。用户改过的一律保留并报告 —— 删了没法还原。
 * @param {string} dshHome
 * @param {string[]} [ids]
 * @returns {{ removed: string[], kept: Array<{path: string, reason: string}> }}
 */
export function sweepOwnedPresetDirs(dshHome, ids = OWNED_PRESET_IDS) {
  const removed = [];
  const kept = [];
  const home = dshHome || findDshHome();
  if (!home) return { removed, kept };
  for (const id of ids || OWNED_PRESET_IDS) {
    const dir = path.join(home, ".agent-presets", id);
    if (!tryOr(() => fs.statSync(dir).isDirectory(), false)) continue;
    const verdict = inspectPresetDir(dir);
    if (!verdict.ours) {
      kept.push({ path: dir, reason: verdict.reason });
      continue;
    }
    const done = tryOr(() => {
      fs.rmSync(dir, { recursive: true, force: true });
      return true;
    }, false);
    if (done) removed.push(dir);
    else kept.push({ path: dir, reason: "rm-failed" });
  }
  return { removed, kept };
}

/** 单目录版，给只要清一套的调用方用。 */
export function removeStaleAgentPresetDir(dshHome, id) {
  const out = sweepOwnedPresetDirs(dshHome, id ? [id] : OWNED_PRESET_IDS);
  return out.removed.length > 0;
}
