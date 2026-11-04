import { DEFAULT_LOOK, getThemeTokens, migrateLook, normalizeLook, type LookPreference, type ThemeId, getTheme } from "./tokens";

export const LOOK_STORAGE_KEY = "xsdsh.look";
export type LookStorage = Pick<Storage, "getItem" | "setItem">;
export type LookIssue = "invalid-preference" | "storage-read-failed" | "storage-write-failed" | null;
export interface LookResult { readonly look: LookPreference; readonly issue: LookIssue }
function browserStorage(): LookStorage | null {
  try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; }
}
export function loadLook(storage: LookStorage | null = browserStorage()): LookResult {
  if (!storage) return { look: DEFAULT_LOOK, issue: "storage-read-failed" };
  let raw: string | null;
  try { raw = storage.getItem(LOOK_STORAGE_KEY); }
  catch { return { look: DEFAULT_LOOK, issue: "storage-read-failed" }; }
  if (raw === null) return { look: DEFAULT_LOOK, issue: null };
  try {
    const migrated = migrateLook(JSON.parse(raw));
    const input = migrated && typeof migrated === "object" && !Array.isArray(migrated)
      ? migrated as Record<string, unknown> : null;
    const look = normalizeLook(input);
    const valid = input
      && input.t === look.t && typeof input.a === "string" && input.a.toLowerCase() === look.a;
    return { look, issue: valid ? null : "invalid-preference" };
  } catch { return { look: DEFAULT_LOOK, issue: "invalid-preference" }; }
}
export function saveLook(value: unknown, storage: LookStorage | null = browserStorage()): LookResult {
  const look = normalizeLook(migrateLook(value));
  try {
    if (!storage) throw new Error("No local storage");
    storage.setItem(LOOK_STORAGE_KEY, JSON.stringify(look));
    return { look, issue: null };
  } catch { return { look, issue: "storage-write-failed" }; }
}

/** A root must already be explicitly marked as plugin-owned before registration. */
function assertPluginRoot(root: HTMLElement) {
  if (root === root.ownerDocument.documentElement || root === root.ownerDocument.body
    || !root.matches("[data-xsdsh-ui], [data-xsdsh-overlay], .xsdsh-root")) {
    throw new Error("Appearance requires a marked plugin root or plugin overlay; host html/body are forbidden.");
  }
}
interface RootBinding { update(look: LookPreference): void; cleanup(): void; users: number }
function bindRoot(root: HTMLElement, initial: LookPreference): RootBinding {
  assertPluginRoot(root);
  const names = [...Object.keys(getThemeTokens(initial)), "color-scheme"];
  const original = new Map(names.map(name => [name, [root.style.getPropertyValue(name), root.style.getPropertyPriority(name)]]));
  const previousTheme = root.getAttribute("data-xsdsh-theme");
  const applied = new Map<string, string>();
  let currentTheme = initial.t;
  const update = (look: LookPreference) => {
    currentTheme = look.t;
    root.setAttribute("data-xsdsh-theme", look.t);
    for (const [name, value] of Object.entries({ ...getThemeTokens(look), "color-scheme": look.t === "cat-night" ? "dark" : "light" })) {
      root.style.setProperty(name, value);
      applied.set(name, root.style.getPropertyValue(name));
    }
  };
  update(initial);
  return {
    users: 1,
    update,
    cleanup() {
      for (const [name, [value, priority]] of original) {
        // Do not overwrite a later owner's edits during unmount/hot reload.
        if (root.style.getPropertyValue(name) !== applied.get(name) || root.style.getPropertyPriority(name)) continue;
        if (value) root.style.setProperty(name, value, priority);
        else root.style.removeProperty(name);
      }
      if (root.getAttribute("data-xsdsh-theme") === currentTheme) {
        if (previousTheme === null) root.removeAttribute("data-xsdsh-theme");
        else root.setAttribute("data-xsdsh-theme", previousTheme);
      }
    },
  };
}

export interface AppearanceController {
  getSnapshot(): LookResult;
  subscribe(listener: () => void): () => void;
  registerRoot(root: HTMLElement): () => void;
  setTheme(theme: ThemeId): LookResult;
  setAccent(accent: string): LookResult;
  reset(): LookResult;
  reload(): LookResult;
  dispose(): void;
}
/** Create one per plugin instance, register all roots/portals, dispose on plugin unload. */
export function createAppearanceController(options: { storage?: LookStorage | null } = {}): AppearanceController {
  const storage = options.storage === undefined ? browserStorage() : options.storage;
  let snapshot: LookResult = Object.freeze(loadLook(storage));
  let disposed = false;
  const roots = new Map<HTMLElement, RootBinding>();
  const listeners = new Set<() => void>();
  const assertActive = () => { if (disposed) throw new Error("Appearance controller has been disposed"); };
  const publish = (result: LookResult) => {
    snapshot = Object.freeze(result);
    for (const binding of roots.values()) binding.update(snapshot.look);
    for (const listener of listeners) listener();
    return snapshot;
  };
  const commit = (look: unknown) => { assertActive(); return publish(saveLook(look, storage)); };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      assertActive(); listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    registerRoot(root) {
      assertActive();
      const existing = roots.get(root);
      if (existing) existing.users++;
      else roots.set(root, bindRoot(root, snapshot.look));
      let released = false;
      return () => {
        if (released) return;
        released = true;
        const binding = roots.get(root);
        if (binding && --binding.users === 0) { binding.cleanup(); roots.delete(root); }
      };
    },
    setTheme(theme) {
      // Normalize before looking up metadata so an untyped caller cannot inject a theme.
      const valid = normalizeLook({ t: theme }).t;
      return commit({ t: valid, a: getTheme(valid).accent });
    },
    setAccent: accent => commit({ t: snapshot.look.t, a: accent }),
    reset: () => commit(DEFAULT_LOOK),
    reload() { assertActive(); return publish(loadLook(storage)); },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const binding of roots.values()) binding.cleanup();
      roots.clear(); listeners.clear();
    },
  };
}
