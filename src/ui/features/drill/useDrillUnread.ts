import React from '../../host/react';
import { api } from './api.js';
import { loadUnread, saveUnread, digestHasNew } from './unread.js';
import type { RedteamPage, GlobalPage } from './DrillContent';

type Stamp = { count: number; at: string | null };
type Digest = Record<string, Stamp>;
type Location = { area: 'home' } | { area: 'redteam'; tab: RedteamPage } | { area: 'global'; tab: GlobalPage };
interface Options {
  enabled: boolean;
  engagement: string | null;
  location: Location;
  /** A page is read only while the containing workspace is actually visible. */
  visible?: boolean;
  refreshKey?: number;
}
const REDTEAM_KEYS = ['assets', 'target', 'sessions', 'findings', 'chain', 'scores', 'report'];
const stamp = (value: { count?: unknown; at?: unknown } | undefined): Stamp => ({
  count: Number(value?.count) || 0,
  at: typeof value?.at === 'string' ? value.at : null,
});
const requireResult = (result: any) => {
  if (!result || result.ok === false) throw new Error(result?.error || '摘要读取失败');
  return result;
};
async function targetDigest(engagement: string): Promise<Digest> {
  const result = requireResult(await api({ op: 'consoleDigest', engagement }));
  const digest: Digest = {};
  for (const key of REDTEAM_KEYS) if (result.sections?.[key]) digest[key] = stamp(result.sections[key]);
  return digest;
}
async function globalDigest(): Promise<Digest> {
  // Explicit global APIs only. consoleDigest.agents describes target activity, not shared templates.
  // Independent failures retain the prior successful stamps for those sections.
  const results = await Promise.allSettled([
    api({ op: 'pocStats' }).then(requireResult),
    api({ op: 'globalPrompts' }).then(requireResult),
    api({ op: 'platformConfigGet' }).then(requireResult),
  ]);
  const digest: Digest = {};
  const [knowledge, agents, platform] = results;
  if (knowledge.status === 'fulfilled') digest.knowledge = stamp({ count: knowledge.value.stats?.total, at: knowledge.value.stats?.latest });
  if (agents.status === 'fulfilled') {
    const roles = agents.value.roles || [];
    digest.agents = stamp({ count: roles.length, at: roles.map((role: { updated_at?: string }) => role.updated_at || '').sort().pop() });
  }
  if (platform.status === 'fulfilled') {
    const at = platform.value.config?.updated_at;
    digest.env = stamp({ at });
    digest.net = stamp({ at });
  }
  // Skill catalog is shipped/static under the existing digest contract; no invented notifications.
  return digest;
}

const sameDigest = (a: Digest, b: Digest) => {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  for (const key of keys) { const x = a[key], y = b[key]; if (!y || x.count !== y.count || x.at !== y.at) return false; }
  return true;
};

function useScopeUnread(scope: string | null, active: string | null, refreshKey: number, read: () => Promise<Digest>) {
  const [state, setState] = React.useState<{ scope: string | null; digest: Digest; seen: Digest }>({ scope: null, digest: {}, seen: {} });
  const seenRef = React.useRef<Digest>({});
  const activeRef = React.useRef(active);
  activeRef.current = active;
  React.useEffect(() => {
    if (!scope) { setState({ scope: null, digest: {}, seen: {} }); return; }
    let alive = true;
    let inflight = false;
    let digest: Digest = {};
    seenRef.current = loadUnread(scope) || {};
    setState({ scope, digest, seen: seenRef.current });
    const tick = async () => {
      if (inflight) return;
      /* 窗口在后台时不轮询：没人看红点，省掉一次请求和整棵树的重渲染。 */
      if (typeof document !== 'undefined' && document.hidden) return;
      inflight = true;
      try {
        const next = await read();
        if (!alive) return;
        const merged = { ...digest, ...next };
        let seen = { ...seenRef.current };
        // First observation establishes a baseline instead of marking every existing row new.
        for (const key of Object.keys(next)) if (!seen[key]) seen[key] = merged[key];
        const page = activeRef.current;
        if (page && merged[page]) seen = { ...seen, [page]: merged[page] };
        // 没有变化就不 setState：25 秒一次的轮询不该把整页（含 VPS 表单）重绘一遍。
        const digestChanged = !sameDigest(merged, digest);
        const seenChanged = !sameDigest(seen, seenRef.current);
        digest = merged;
        seenRef.current = seen;
        if (seenChanged) saveUnread(scope, seen);
        if (digestChanged || seenChanged) setState({ scope, digest: { ...merged }, seen: { ...seen } });
      } catch {
        // Keep last successful unread state on a failed poll; next interval retries.
        if (alive) setState(previous => previous.scope === scope ? previous : { scope, digest, seen: seenRef.current });
      } finally { inflight = false; }
    };
    void tick();
    const timer = setInterval(() => { void tick(); }, 25000);
    return () => { alive = false; clearInterval(timer); };
  }, [scope, refreshKey, read]);

  React.useEffect(() => {
    if (!scope || !active) return;
    setState(previous => {
      if (previous.scope !== scope || !previous.digest[active]) return previous;
      const seen = { ...previous.seen, [active]: previous.digest[active] };
      seenRef.current = seen;
      saveUnread(scope, seen);
      return { ...previous, seen };
    });
  }, [scope, active]);

  const unread: Record<string, boolean> = {};
  if (scope && state.scope === scope) {
    for (const key of Object.keys(state.digest)) unread[key] = key !== active && digestHasNew(state.seen[key], state.digest[key]);
  }
  return unread;
}

/** Target and global read markers are independent; the controller remains request-focused. */
export function useDrillUnread({ enabled, engagement, location, visible = true, refreshKey = 0 }: Options) {
  const readTarget = React.useCallback(() => engagement ? targetDigest(engagement) : Promise.resolve({}), [engagement]);
  const redteam = useScopeUnread(enabled && engagement ? engagement : null,
    visible && location.area === 'redteam' ? location.tab : null, refreshKey, readTarget);
  const global = useScopeUnread(enabled ? 'global:shared' : null,
    visible && location.area === 'global' ? location.tab : null, refreshKey, globalDigest);
  return { redteam: redteam as Partial<Record<RedteamPage, boolean>>, global: global as Partial<Record<GlobalPage, boolean>> };
}
