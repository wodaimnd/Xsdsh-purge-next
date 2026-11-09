/**
 * 浏览器半契约测试（无需真实浏览器/宿主）
 *
 * 背景：宿主 Web GUI 里「悬浮入口 launcher 看不见」的根因是
 *   `window.__ModuleLoader__.load({ id })` 的 id 与 loader 条目名（= 包名）不一致，
 * 导致 dsh-client-modules 认为该 bundle「执行了但没注册」→ 回落到单资源 URL 再执行一次
 * → `duplicate factory registration` → 行永不激活 → apply() 不执行 → 槽位全空。
 *
 * 本脚本把 client.js 放进 vm 沙箱、喂最小 window/document/react 存根，
 * 验证四件事：
 *   1. bundle 顶层注册的 id 必须 === package.json 的 name
 *   2. cordis.patch.yml 里每一条装载行的 name 必须 === package.json 的 name
 *   3. factory 能在最小存根下求值，exports.apply 是函数
 *   4. apply(fakeCtx) 会注册 shell.overlay / id="dsh破甲-dock" / order=50，且请求了正确服务
 *
 * 用法：node scripts/test-client-bundle.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundlePath = path.join(root, "client.js");
const pkgPath = path.join(root, "package.json");
const patchPath = path.join(root, "cordis.patch.yml");

let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, extra) {
  if (cond) {
    pass += 1;
    console.log(`PASS  ${name}`);
  } else {
    fail += 1;
    failures.push(name);
    console.log(`FAIL  ${name}${extra ? ` :: ${extra}` : ""}`);
  }
}

function tryOr(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/* ── 存根：DOM / 浏览器全局 ───────────────────────────────── */

function makeStyleDecl() {
  return new Proxy({}, {
    get: (t, k) => (k === "setProperty" ? () => {} : (k === "getPropertyValue" ? () => "" : (k in t ? t[k] : ""))),
    set: (t, k, v) => { t[k] = v; return true; },
  });
}

function makeElement(tag) {
  const el = {
    tagName: String(tag || "div").toUpperCase(),
    nodeType: 1,
    style: makeStyleDecl(),
    dataset: {},
    children: [],
    childNodes: [],
    attributes: {},
    innerHTML: "",
    textContent: "",
    id: "",
    className: "",
    classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; },
    removeAttribute(k) { delete this.attributes[k]; },
    hasAttribute: () => false,
    appendChild(c) { this.children.push(c); return c; },
    insertBefore(c) { this.children.unshift(c); return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); return c; },
    remove() {},
    cloneNode() { return makeElement(tag); },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => true,
    querySelector: () => null,
    querySelectorAll: () => [],
    getBoundingClientRect: () => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
    focus() {},
    blur() {},
    scrollIntoView() {},
    contains: () => false,
    setPointerCapture() {},
    releasePointerCapture() {},
    animate: () => ({ cancel() {}, finished: Promise.resolve() }),
  };
  return el;
}

function makeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(String(k)) ? map.get(String(k)) : null),
    setItem: (k, v) => { map.set(String(k), String(v)); },
    removeItem: (k) => { map.delete(String(k)); },
    clear: () => map.clear(),
    key: (i) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
    _map: map,
  };
}

/* ── 存根：react / react-dom ──────────────────────────────── */

const FRAGMENT = Symbol("react.fragment");
function makeReact() {
  const createElement = (type, props, ...children) => ({
    $$element: true,
    type,
    props: props || {},
    children: children.length ? children : undefined,
  });
  /* client.js 内有 4 处 `extends Component`，基类必须存在，否则 factory 求值即抛 */
  class Component {
    constructor(props) {
      this.props = props || {};
      this.state = {};
    }
    setState(next) {
      this.state = { ...this.state, ...(typeof next === "function" ? next(this.state) : next || {}) };
    }
    forceUpdate() {}
    render() {
      return null;
    }
  }
  const react = {
    Component,
    PureComponent: Component,
    createElement,
    Fragment: FRAGMENT,
    isValidElement: (v) => Boolean(v && v.$$element),
    cloneElement: (el, props, ...children) => ({ ...el, props: { ...(el.props || {}), ...(props || {}) }, children }),
    Children: { toArray: (c) => (Array.isArray(c) ? c : c == null ? [] : [c]), count: (c) => (Array.isArray(c) ? c.length : c == null ? 0 : 1), map: (c, f) => (Array.isArray(c) ? c.map(f) : []) },
    createContext: (v) => ({ Provider: (p) => p.children, Consumer: (p) => p.children, _default: v }),
    memo: (fn) => fn,
    forwardRef: (fn) => fn,
    lazy: (fn) => fn,
    useState: (v) => [typeof v === "function" ? undefined : v, () => {}],
    useReducer: (r, v) => [v, () => {}],
    useEffect: () => {},
    useLayoutEffect: () => {},
    useInsertionEffect: () => {},
    useMemo: (fn) => tryOr(fn, undefined),
    useCallback: (fn) => fn,
    useRef: (v) => ({ current: v }),
    useContext: (c) => (c && "_default" in c ? c._default : undefined),
    useId: () => "r0",
    useSyncExternalStore: (sub, get) => tryOr(get, undefined),
    useTransition: () => [false, (fn) => tryOr(fn, undefined)],
    useDeferredValue: (v) => v,
    startTransition: (fn) => tryOr(fn, undefined),
    version: "18.0.0-test",
  };
  return react;
}

function makeReactDom() {
  return {
    version: "18.0.0-test",
    createPortal: (children, container) => ({ $$element: true, type: "__portal__", props: { children, container } }),
    flushSync: (fn) => tryOr(fn, undefined),
    render() {},
    unmountComponentAtNode() {},
    findDOMNode: () => null,
  };
}

/* ── 构建沙箱并执行 bundle ───────────────────────────────── */

const bundleText = readFileSync(bundlePath, "utf8");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const pkgName = String(pkg.name || "");

const registrations = [];
const sandbox = {};
const win = sandbox;
const doc = {
  head: makeElement("head"),
  body: makeElement("body"),
  documentElement: makeElement("html"),
  createElement: (t) => makeElement(t),
  createElementNS: (_ns, t) => makeElement(t),
  createTextNode: (t) => ({ nodeType: 3, textContent: t }),
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => true,
  contains: () => false,
  adoptedStyleSheets: [],
  styleSheets: [],
  activeElement: null,
  pointerLockElement: null,
  visibilityState: "visible",
  hidden: false,
  cookie: "",
};

Object.assign(sandbox, {
  window: win,
  self: win,
  globalThis: win,
  document: doc,
  localStorage: makeStorage(),
  sessionStorage: makeStorage(),
  navigator: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) test-runner", platform: "Win32", language: "zh-CN", languages: ["zh-CN", "en"], clipboard: { writeText: async () => {}, readText: async () => "" } },
  location: { href: "http://127.0.0.1:1/", hostname: "127.0.0.1", port: "1", protocol: "http:", origin: "http://127.0.0.1:1", pathname: "/", search: "", hash: "" },
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  queueMicrotask,
  requestAnimationFrame: (cb) => setTimeout(() => tryOr(() => cb(Date.now()), undefined), 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
  requestIdleCallback: (cb) => setTimeout(() => tryOr(() => cb({ didTimeout: false, timeRemaining: () => 0 }), undefined), 0),
  cancelIdleCallback: (id) => clearTimeout(id),
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
  getComputedStyle: () => makeStyleDecl(),
  MutationObserver: class { observe() {} disconnect() {} takeRecords() { return []; } },
  ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } },
  /* 存根不联网：apply() 只注册槽位，不该发起请求；真发了就让它拿到一个明确的失败 */
  fetch: async () => ({ ok: false, status: 0, statusText: "stub-no-network", error: "测试存根不联网", json: async () => ({}), text: async () => "" }),
  crypto: { randomUUID: () => "00000000-0000-4000-8000-000000000000", getRandomValues: (a) => a },
  performance: { now: () => Date.now() },
  structuredClone: (v) => JSON.parse(JSON.stringify(v ?? null)),
  alert() {},
  prompt: () => null,
  confirm: () => false,
});

win.__ModuleLoader__ = {
  mode: "queue",
  pendingQueue: registrations,
  load(registration) {
    registrations.push(registration);
  },
  create(options) {
    return { id: options && options.id, destroy() {} };
  },
};

let evalError = null;
vm.createContext(sandbox);
try {
  vm.runInContext(bundleText, sandbox, { filename: "Xsdsh-purge-next/client.js" });
} catch (e) {
  evalError = e;
}

ok("bundle 在最小存根下可求值（不抛）", evalError === null, evalError && `${evalError.name}: ${evalError.message}`);
ok("bundle 调用了 __ModuleLoader__.load 恰好 1 次", registrations.length === 1, `实际 ${registrations.length} 次`);

const reg = registrations[0] || {};
ok("注册 id 与 package.json name 一致", reg.id === pkgName, `id=${JSON.stringify(reg.id)} name=${JSON.stringify(pkgName)}`);
ok("注册 id 不含中文/空格", typeof reg.id === "string" && /^[A-Za-z0-9@/._-]+$/.test(reg.id || ""), `id=${JSON.stringify(reg.id)}`);
ok("注册含 factory 函数", typeof reg.factory === "function");
ok("client.js 首行 id 字面量与包名一致", new RegExp(`__ModuleLoader__\\.load\\(\\{\\s*id:\\s*"${pkgName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(bundleText));

/* cordis.patch.yml 装载行 name 一致性（真实故障点回归守卫） */
const patchText = tryOr(() => readFileSync(patchPath, "utf8"), "");
const patchNames = Array.from(patchText.matchAll(/^\s*name:\s*['"]?([^'"\r\n]+?)['"]?\s*$/gm)).map((m) => m[1].trim());
const uniquePatchNames = Array.from(new Set(patchNames));
ok("cordis.patch.yml 可读且含装载行", patchText.length > 0 && patchNames.length > 0, `抓到 ${patchNames.length} 行`);
ok(
  `cordis.patch.yml 装载行 name 全部等于包名（子路径除外）`,
  uniquePatchNames.every((n) => n === pkgName || n.startsWith(`${pkgName}/`)),
  `不等价项: ${JSON.stringify(uniquePatchNames.filter((n) => n !== pkgName && !n.startsWith(`${pkgName}/`)))}`,
);
ok("cordis.patch.yml 含主装载行（裸包名）", uniquePatchNames.includes(pkgName), `现有: ${JSON.stringify(uniquePatchNames)}`);

/* ── 求值 factory + 执行 apply ───────────────────────────── */

let exportsObj = null;
let factoryError = null;
if (typeof reg.factory === "function") {
  const req = (name) => {
    if (name === "react") return makeReact();
    if (name === "react-dom") return makeReactDom();
    if (name === "react/jsx-runtime") return makeReact();
    throw new Error(`未预期的 require("${name}")`);
  };
  try {
    exportsObj = reg.factory(req);
  } catch (e) {
    factoryError = e;
  }
}
ok("factory(require) 求值不抛", factoryError === null, factoryError && `${factoryError.name}: ${factoryError.message}`);
ok("exports.apply 是函数", typeof (exportsObj || {}).apply === "function");
ok("exports.name === 包内展示名", (exportsObj || {}).name === "dsh破甲", `实际 ${JSON.stringify((exportsObj || {}).name)}`);
ok("exports.inject === ['slots','locale']", JSON.stringify((exportsObj || {}).inject) === JSON.stringify(["slots", "locale"]), JSON.stringify((exportsObj || {}).inject));

const slotRegs = [];
const injectedSlots = [];
const effects = [];
const localeRegs = [];
const injectCalls = [];
const ctx = {
  effect(fn, label) {
    const d = tryOr(fn, undefined);
    /* cordis 的 effect 回调可返回 disposer 函数，或返回带 dispose() 的对象 */
    const disposable = typeof d === "function" || Boolean(d && typeof d.dispose === "function");
    effects.push({ label, hasDisposer: disposable });
    return () => {};
  },
  locale: {
    /* 真 locale 服务的 register 返回「幂等 disposer 函数」（见 dsh-client-locale 内 register 实现） */
    register(ns, dicts) {
      localeRegs.push({ ns, locales: Object.keys(dicts || {}) });
      return () => {};
    },
    bind() {
      return (k) => k;
    },
  },
  slots: {
    inject(slot, cb) {
      injectedSlots.push(slot);
      return tryOr(cb, undefined);
    },
    register(spec, render) {
      slotRegs.push({ spec, render });
      return { dispose() {} };
    },
  },
  inject(names, cb) {
    injectCalls.push(Array.isArray(names) ? names.slice() : names);
    return tryOr(() => cb(ctx), undefined);
  },
};

let applyError = null;
if (exportsObj && typeof exportsObj.apply === "function") {
  try {
    exportsObj.apply(ctx);
  } catch (e) {
    applyError = e;
  }
}
ok("apply(ctx) 执行不抛", applyError === null, applyError && `${applyError.name}: ${applyError.message}`);
ok("apply 注册了 locale 字典（NS=settings.dsh破甲）", localeRegs.some((r) => r.ns === "settings.dsh破甲"), JSON.stringify(localeRegs));
const dict = localeRegs.find((r) => r.ns === "settings.dsh破甲");
ok("字典 locale id 合法（zh + en，BCP-47 前缀匹配宿主校验）", Boolean(dict) && dict.locales.includes("zh") && dict.locales.includes("en"), dict && JSON.stringify(dict.locales));

const overlay = slotRegs.find((r) => r.spec && r.spec.name === "shell.overlay");
ok("apply 注册 shell.overlay 槽位", Boolean(overlay), JSON.stringify(slotRegs.map((r) => r.spec)));
ok("槽位 id === 'dsh破甲-dock'（与宿主 occupant 观测名一致）", Boolean(overlay) && overlay.spec.id === "dsh破甲-dock", overlay && JSON.stringify(overlay.spec));
ok("槽位 order === 50", Boolean(overlay) && overlay.spec.order === 50, overlay && String(overlay.spec.order));
ok("slots.inject 走的是 shell.overlay", injectedSlots.includes("shell.overlay"), JSON.stringify(injectedSlots));

const tree = overlay && tryOr(() => overlay.render(), null);
ok("槽位渲染函数返回 React 元素", Boolean(tree && tree.$$element === true));
ok("渲染树顶层含 5 个入口组件", Boolean(tree) && Array.isArray(tree.children) && tree.children.length === 5, tree && `children=${tree.children && tree.children.length}`);
ok("apply 注册的 effect 都带 disposer", effects.length > 0 && effects.every((e) => e.hasDisposer), JSON.stringify(effects));

/* 只断言「请求了哪些服务」，不要求沙箱里真的存在这些服务 */
const wanted = ["sessions", "uiWorkspace", "workspaces", "conversation"];
ok("apply 请求了 rewind 所需服务", injectCalls.some((c) => Array.isArray(c) && wanted.every((w) => c.includes(w))), JSON.stringify(injectCalls));

console.log("");
console.log(`结果: ${pass} PASS / ${fail} FAIL`);
if (fail > 0) {
  console.log(`失败用例: ${failures.join(" | ")}`);
  process.exit(1);
}
