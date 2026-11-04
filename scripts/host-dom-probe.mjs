/**
 * 真机 DOM 探针 —— 桌面 DSH 页签行/首页 chip 的观感基线。
 *
 * 为什么需要它：`test/q4b-generated-browser.test.mjs` 里的 rc5 页签观感断言
 * （36px 间距、13px/500/16px、与宿主同字体、不换行、不横向溢出）跑在**本地
 * 生成的夹具页**上；夹具能证明补丁代码没坏，却证明不了「装进真桌面后宿主
 * 的真实 DOM 仍是这个形状」。宿主升版改掉 viewTabs 结构时，夹具测试照样绿。
 * 这里连真桌面（`--remote-debugging-port=9222`），只读地量一遍真实指标，
 * 把观测结果记进 `test/fixtures/host-dom.json`，之后同版本重跑即可对比。
 *
 * 边界（硬约束）：
 *   · 只读 DOM/layout，不点击、不派发输入、不改应用状态；
 *   · 只关闭自己那条 WebSocket，绝不 `Browser.close` / 杀进程 / taskkill；
 *   · 没有调试端口时明确提示怎么启动，退出码 2，不猜、不自动拉起桌面。
 *
 * 用法：
 *   node scripts/host-dom-probe.mjs                     # 打印当前指标 JSON
 *   node scripts/host-dom-probe.mjs --json              # 同上（显式）
 *   node scripts/host-dom-probe.mjs --write             # 写入 fixture（版本自动读 asar）
 *   node scripts/host-dom-probe.mjs --write --host-version 0.2.1-rc.5
 *   node scripts/host-dom-probe.mjs --check             # 按 fixture 同 key 校验真机
 *   node scripts/host-dom-probe.mjs --port 9333 --json  # 换调试端口
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { appAsarPath, findDesktopAppExecutable } from "../lib/desktop.js";
import { readAsarEntryBytes, readAsarHeaderRaw } from "../lib/extract-asar.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const FIXTURE_PATH = join(ROOT, "test", "fixtures", "host-dom.json");
export const SCHEMA = 1;
const DEFAULT_PORT = 9222;
const PAGE_ORIGIN_PREFIX = "dsh-app://app";

/** 调试端口不可用：不是脚本 bug，而是桌面没按约定启动，退出码 2。 */
class CdpUnavailableError extends Error {}

/** 页面还没有会话/首页，没东西可量：属于检查失败，退出码 1。 */
class CheckUnavailableError extends Error {}

/* 真机只读表达式：字段口径与 q4b-generated-browser.test.mjs 的 host-tab-chip-rc5 一致。
   More 按钮必须限定在 row.parentElement 内查 —— rc5 外层 .tabs 里也有一排菜单按钮，
   全局查会拿到错误的那个，beforeMore 就失去意义。 */
const DOM_EXPRESSION = `(() => {
  const row = document.querySelector('[data-conversation-tabs]');
  const chip = row ? row.querySelector(':scope > .xsdsh-tab-chip') : null;
  const tabs = row ? [...row.querySelectorAll('[role=tab]')] : [];
  const last = tabs.length ? tabs[tabs.length - 1] : null;
  const more = row && row.parentElement ? row.parentElement.querySelector('[aria-haspopup=menu]') : null;
  const btn = chip ? chip.querySelector('.xsdsh-tab-btn') : null;
  const hero = document.querySelector('.xsdsh-hero-chip');
  const round1 = (n) => Math.round(n * 10) / 10;
  const origin = location.origin && location.origin !== 'null'
    ? location.origin
    : location.protocol + '//' + location.host;
  const out = {
    origin,
    title: document.title,
    launch: !!document.querySelector('.xsdsh-launch'),
    tabRow: !!row,
    chip: !!chip,
    heroChip: !!hero,
    heroText: hero ? (hero.textContent || '').replace(/\\s+/g, ' ').trim() : '',
  };
  if (row && chip) {
    const chipRect = chip.getBoundingClientRect();
    const tabRect = last ? last.getBoundingClientRect() : null;
    const cs = getComputedStyle(btn || chip);
    const hs = last ? getComputedStyle(last) : null;
    out.gap = tabRect ? round1(chipRect.left - tabRect.right) : null;
    out.topDelta = tabRect ? round1(chipRect.top - tabRect.top) : null;
    out.beforeMore = !!(more && (chip.compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING));
    out.fontSize = cs.fontSize;
    out.fontWeight = cs.fontWeight;
    out.lineHeight = cs.lineHeight;
    out.fontFamily = cs.fontFamily;
    out.hostFontFamily = hs ? hs.fontFamily : null;
    out.nowrap = getComputedStyle(row).flexWrap;
    out.overflow = row.scrollWidth - row.clientWidth;
  }
  return out;
})()`;

function parseArgs(argv) {
  const opts = { port: DEFAULT_PORT, write: false, check: false, json: false, hostVersion: "" };
  const take = (i, flag) => {
    const val = argv[i];
    if (!val || val.startsWith("--")) throw new Error(`${flag} 需要一个值`);
    return val;
  };
  const setPort = (raw) => {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1 || n > 65535) throw new Error(`--port 需要 1-65535 的整数，收到 ${raw}`);
    opts.port = n;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--write") opts.write = true;
    else if (a === "--check") opts.check = true;
    else if (a === "--json") opts.json = true;
    else if (a === "--port") setPort(take(++i, "--port"));
    else if (a === "--host-version") opts.hostVersion = take(++i, "--host-version");
    else if (a.startsWith("--port=")) setPort(a.slice("--port=".length));
    else if (a.startsWith("--host-version=")) opts.hostVersion = a.slice("--host-version=".length);
    else throw new Error(`未知参数：${a}`);
  }
  return opts;
}

function hintFor(port) {
  return `请用 --remote-debugging-port=${port} 启动桌面`;
}

/** 找到 `dsh-app://app` 的 page target。 */
async function findPageTarget(port) {
  const endpoint = `http://127.0.0.1:${port}/json/list`;
  let list;
  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    list = await res.json();
  } catch (error) {
    const reason = (error && error.cause && error.cause.code) || (error && error.message) || String(error);
    throw new CdpUnavailableError(`${hintFor(port)}（连接 ${endpoint} 失败：${reason}）`);
  }
  if (!Array.isArray(list)) throw new CdpUnavailableError(`${hintFor(port)}（${endpoint} 返回的不是 target 列表）`);
  const pages = list.filter((t) => t && typeof t.url === "string" && t.url.startsWith(PAGE_ORIGIN_PREFIX));
  const target = pages.find((t) => t.type === "page") || pages[0];
  if (!target) {
    throw new CdpUnavailableError(`${hintFor(port)}（没有找到 ${PAGE_ORIGIN_PREFIX} 页面，桌面窗口可能没打开）`);
  }
  if (!target.webSocketDebuggerUrl) {
    throw new CdpUnavailableError(`${hintFor(port)}（page target 缺少 webSocketDebuggerUrl）`);
  }
  return target;
}

function openSocket(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timer = setTimeout(() => {
      try { ws.close(); } catch (error) { void error; }
      reject(new Error("WebSocket 连接超时"));
    }, 8000);
    ws.addEventListener("open", () => {
      clearTimeout(timer);
      resolve(ws);
    }, { once: true });
    ws.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error("WebSocket 连接失败"));
    }, { once: true });
  });
}

function makeSender(ws) {
  let serial = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch (error) {
      void error;
      return;
    }
    if (!message || !message.id) return;
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    clearTimeout(waiter.timer);
    if (message.error) waiter.reject(new Error(`CDP ${message.error.message || JSON.stringify(message.error)}`));
    else waiter.resolve(message.result);
  });
  return (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++serial;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP 超时：${method}`));
    }, 15000);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function closeSocket(ws) {
  if (!ws) return;
  await new Promise((resolve) => {
    const done = () => resolve();
    const timer = setTimeout(done, 1000);
    ws.addEventListener("close", () => {
      clearTimeout(timer);
      done();
    }, { once: true });
    try {
      ws.close();
    } catch (error) {
      clearTimeout(timer);
      void error;
      done();
    }
  });
}

/** 连真机、读一遍指标。只关闭自己的 WebSocket。 */
async function probe(port) {
  const target = await findPageTarget(port);
  const ws = await openSocket(target.webSocketDebuggerUrl);
  try {
    const send = makeSender(ws);
    await send("Runtime.enable");
    const result = await send("Runtime.evaluate", {
      expression: DOM_EXPRESSION,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result && result.exceptionDetails) {
      const detail = result.exceptionDetails.exception && result.exceptionDetails.exception.description;
      throw new Error(`页面求值异常：${detail || result.exceptionDetails.text || "未知异常"}`);
    }
    const metrics = result && result.result ? result.result.value : null;
    if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
      throw new Error("页面求值没有返回指标对象");
    }
    return metrics;
  } finally {
    await closeSocket(ws);
  }
}

/** 宿主版本：显式参数优先，否则从桌面 app.asar 的 dsh/package.json 读；都不行就报错。 */
function resolveHostVersion(explicit) {
  const given = String(explicit || "").trim();
  if (given) return given.replace(/^desktop\//, "").trim();
  const exe = findDesktopAppExecutable({ discover: true });
  if (!exe) throw new Error("找不到桌面宿主可执行文件，无法确定宿主版本；请用 --host-version 指定");
  const asar = appAsarPath(exe);
  if (!asar || !existsSync(asar)) {
    throw new Error(`找不到 app.asar（${asar || "空路径"}），无法确定宿主版本；请用 --host-version 指定`);
  }
  let raw;
  try {
    raw = readAsarHeaderRaw(asar);
  } catch (error) {
    throw new Error(`读取 app.asar 头失败（${asar}）：${error && error.message ? error.message : String(error)}`);
  }
  const bytes = readAsarEntryBytes(asar, "dsh/package.json", raw);
  if (!bytes) throw new Error(`app.asar 里没有 dsh/package.json（${asar}）；请用 --host-version 指定`);
  let pkg;
  try {
    pkg = JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    throw new Error(`dsh/package.json 解析失败：${error && error.message ? error.message : String(error)}`);
  }
  if (!pkg || !pkg.version) throw new Error("dsh/package.json 没有 version；请用 --host-version 指定");
  return String(pkg.version);
}

function loadFixture() {
  if (!existsSync(FIXTURE_PATH)) return { schema: SCHEMA, hosts: {} };
  let data;
  try {
    data = JSON.parse(readFileSync(FIXTURE_PATH, "utf8"));
  } catch (error) {
    throw new Error(`fixture 解析失败（${FIXTURE_PATH}）：${error && error.message ? error.message : String(error)}`);
  }
  if (!data || typeof data !== "object" || data.schema !== SCHEMA) {
    throw new Error(`fixture schema 必须是 ${SCHEMA}（${FIXTURE_PATH}）`);
  }
  if (!data.hosts || typeof data.hosts !== "object" || Array.isArray(data.hosts)) {
    throw new Error(`fixture 的 hosts 必须是对象（${FIXTURE_PATH}）`);
  }
  return data;
}

function saveFixture(data) {
  mkdirSync(dirname(FIXTURE_PATH), { recursive: true });
  writeFileSync(FIXTURE_PATH, `${JSON.stringify(data, null, 1)}\n`, "utf8");
}

/**
 * 按设计约束逐项比对。返回差异行；没有差异返回空数组。
 * 「打开会话」与「首页」是互斥的两条路径：有页签行就查页签，有 hero 就查 hero，
 * 两样都没有说明应用还停在空状态，直接报不可检查。
 */
function checkMetrics(current) {
  if (current.tabRow !== true && current.heroChip !== true) {
    throw new CheckUnavailableError("请打开一个会话或新会话后再检查");
  }
  const diffs = [];
  const eq = (name, actual, expected) => {
    if (actual !== expected) diffs.push(`${name}: 期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`);
  };
  const near = (name, actual, expected, tolerance) => {
    if (typeof actual !== "number" || !Number.isFinite(actual)) {
      diffs.push(`${name}: 期望 ≈${expected}±${tolerance}，实际 ${JSON.stringify(actual)}`);
      return;
    }
    if (Math.abs(actual - expected) > tolerance) {
      diffs.push(`${name}: 期望 ≈${expected}±${tolerance}，实际 ${actual}`);
    }
  };

  eq("launch", current.launch, true);

  if (current.tabRow === true) {
    eq("chip", current.chip, true);
    near("gap", current.gap, 36, 1);
    near("topDelta", current.topDelta, 0, 1);
    eq("beforeMore", current.beforeMore, true);
    eq("fontSize", current.fontSize, "13px");
    eq("fontWeight", current.fontWeight, "500");
    eq("lineHeight", current.lineHeight, "16px");
    if (current.fontFamily !== current.hostFontFamily) {
      diffs.push(`fontFamily: 必须与宿主页签一致，实际 ${JSON.stringify(current.fontFamily)} vs hostFontFamily ${JSON.stringify(current.hostFontFamily)}`);
    }
    eq("nowrap", current.nowrap, "nowrap");
    if (typeof current.overflow !== "number" || !Number.isFinite(current.overflow)) {
      diffs.push(`overflow: 期望 <=1，实际 ${JSON.stringify(current.overflow)}`);
    } else if (current.overflow > 1) {
      diffs.push(`overflow: 期望 <=1，实际 ${current.overflow}`);
    }
  }

  if (current.heroChip === true && !String(current.heroText || "").trim()) {
    diffs.push(`heroText: 期望非空，实际 ${JSON.stringify(current.heroText)}`);
  }

  return diffs;
}

async function main(argv) {
  const opts = parseArgs(argv);
  const metrics = await probe(opts.port);

  if (opts.check) {
    const hostVersion = resolveHostVersion(opts.hostVersion);
    const key = `desktop/${hostVersion}`;
    const data = loadFixture();
    const recorded = data.hosts[key];
    if (!recorded || !recorded.metrics || typeof recorded.metrics !== "object") {
      throw new Error(`fixture 里没有 ${key} 的基线（${FIXTURE_PATH}）；先跑 --write 记录一次`);
    }
    const diffs = checkMetrics(metrics);
    if (diffs.length) {
      console.log(`不匹配：${key}（fixture 观测于 ${recorded.observedAt || "未知时间"}）`);
      for (const line of diffs) console.log(`  ${line}`);
      return 1;
    }
    console.log(`通过：${key}（tabRow=${metrics.tabRow} heroChip=${metrics.heroChip}）`);
    return 0;
  }

  if (opts.json || !opts.write) {
    console.log(JSON.stringify(metrics, null, 1));
    return 0;
  }

  const hostVersion = resolveHostVersion(opts.hostVersion);
  const key = `desktop/${hostVersion}`;
  const data = loadFixture();
  data.hosts[key] = { observedAt: new Date().toISOString(), metrics };
  saveFixture(data);
  console.log(`已写入 ${FIXTURE_PATH}（${key}；tabRow=${metrics.tabRow} heroChip=${metrics.heroChip}）`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = await main(process.argv.slice(2));
  } catch (error) {
    console.error(error && error.message ? error.message : String(error));
    process.exitCode = error instanceof CdpUnavailableError ? 2 : 1;
  }
}
