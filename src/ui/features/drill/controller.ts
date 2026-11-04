import React from '../../host/react';
import { api } from './api.js';

export interface Engagement { id: string; name?: string; target_url?: string }
export interface DrillSnapshot {
  engagement?: Engagement;
  stats?: Record<string, number>;
  segments?: unknown[];
  tests?: Record<string, number>;
  [key: string]: unknown;
}
export interface DrillController {
  engagements: Engagement[];
  engagement: string | null;
  snapshot: DrillSnapshot | null;
  error: string | null;
  loading: boolean;
  creating: boolean;
  newName: string;
  newUrl: string;
  setNewName: (name: string) => void;
  setNewUrl: (url: string) => void;
  selectEngagement: (id: string) => void;
  openEngagement: (name?: string, url?: string) => Promise<void>;
  deleteEngagement: (id: string) => Promise<boolean>;
  refreshList: () => void;
  refreshAll: () => void;
  refreshSnapshot: () => void;
  refreshKey: number;
}
const message = (error: unknown) => error instanceof Error ? error.message : String(error);

/** One controller per workspace, outside render callbacks, so navigation keeps the target. */
export function useDrillController({ enabled = true }: { enabled?: boolean } = {}): DrillController {
  const [engagements, setEngagements] = React.useState<Engagement[]>([]);
  const [engagement, setEngagement] = React.useState<string | null>(null);
  const [snapshot, setSnapshot] = React.useState<DrillSnapshot | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');
  const [refreshKey, setRefreshKey] = React.useState(0);
  const alive = React.useRef(false);
  const enabledRef = React.useRef(enabled);
  enabledRef.current = enabled;
  const generation = React.useRef(0);
  const current = React.useRef<string | null>(null);
  const listSeq = React.useRef(0);
  const snapshotSeq = React.useRef(0);
  const selectionSeq = React.useRef(0);
  const createBusy = React.useRef(false);
  // Serialize activation writes: a slower earlier request must not leave the host on the old target.
  const activation = React.useRef<Promise<unknown>>(Promise.resolve());

  const loadSnapshot = React.useCallback(async (id: string | null) => {
    if (!alive.current || !enabledRef.current) return;
    const seq = ++snapshotSeq.current;
    if (!id) { setSnapshot(null); return; }
    try {
      const result = await api({ op: 'snapshot', engagement: id });
      if (!alive.current || seq !== snapshotSeq.current || current.current !== id) return;
      if (!result || result.ok === false) { setError(result?.error || '加载失败'); return; }
      setError(null);
      setSnapshot(result);
    } catch (e) {
      if (alive.current && seq === snapshotSeq.current && current.current === id) setError(message(e));
    }
  }, []);

  const select = React.useCallback((id: string | null) => {
    current.current = id;
    selectionSeq.current += 1;
    setEngagement(id);
    setSnapshot(null);
    setError(null);
    void loadSnapshot(id);
  }, [loadSnapshot]);

  const loadList = React.useCallback(async (initial = false) => {
    if (!alive.current || !enabledRef.current) return;
    const seq = ++listSeq.current;
    const selection = selectionSeq.current;
    try {
      const result = await api({ op: 'bootstrap' });
      if (!alive.current || seq !== listSeq.current) return;
      if (!result || result.ok === false) { setError(result?.error || '无法连接资产库'); return; }
      const list: Engagement[] = result.engagements || [];
      setEngagements(list);
      if (initial && selection === selectionSeq.current) select(result.current || list[0]?.id || null);
    } catch (e) {
      if (alive.current && seq === listSeq.current) setError(message(e));
    } finally {
      if (alive.current && seq === listSeq.current) setLoading(false);
    }
  }, [select]);

  React.useEffect(() => {
    alive.current = true;
    generation.current += 1;
    setLoading(enabled);
    if (enabled) void loadList(true);
    else {
      current.current = null;
      setEngagement(null);
      setEngagements([]);
      setSnapshot(null);
      setError(null);
      setCreating(false);
    }
    return () => {
      alive.current = false;
      generation.current += 1;
      listSeq.current += 1;
      snapshotSeq.current += 1;
      selectionSeq.current += 1;
    };
  }, [loadList, enabled]);

  const selectEngagement = React.useCallback((id: string) => {
    if (!alive.current || !enabledRef.current) return;
    select(id || null);
    if (!id) return;
    const epoch = generation.current;
    activation.current = activation.current.then(async () => {
      if (!alive.current || !enabledRef.current || epoch !== generation.current) return;
      const result = await api({ op: 'activateEngagement', engagement: id });
      if (alive.current && enabledRef.current && epoch === generation.current && current.current === id && (!result || result.ok === false)) setError(result?.error || '切换当前靶标失败');
    }).catch(error => {
      if (alive.current && enabledRef.current && epoch === generation.current && current.current === id) setError(message(error));
    });
  }, [select]);

  const openEngagement = React.useCallback(async (nameArg?: string, urlArg?: string) => {
    const name = String(nameArg || newName).trim();
    const target_url = String(urlArg === undefined ? newUrl : urlArg).trim();
    if (!alive.current || !enabledRef.current || (!name && !target_url) || createBusy.current) return;
    const epoch = generation.current;
    createBusy.current = true;
    setCreating(true);
    const selection = selectionSeq.current;
    try {
      const result = await api({ op: 'openEngagement', name, ...(target_url ? { target_url } : {}) });
      if (!alive.current || !enabledRef.current || epoch !== generation.current) return;
      if (!result || result.ok === false) { setError(result?.error || '创建失败'); return; }
      setNewName('');
      setNewUrl('');
      if (selection === selectionSeq.current && result.engagement?.id) select(result.engagement.id);
      void loadList();
    } catch (e) {
      if (alive.current && enabledRef.current && epoch === generation.current) setError(message(e));
    } finally {
      createBusy.current = false;
      if (alive.current && epoch === generation.current) setCreating(false);
    }
  }, [newName, newUrl, select, loadList]);

  const refreshSnapshot = React.useCallback(() => { void loadSnapshot(current.current); }, [loadSnapshot]);
  const refreshList = React.useCallback(() => { void loadList(); }, [loadList]);
  /** 删除靶标是物理删除；成功返回 true，失败由 error 承载。 */
  const deleteEngagement = React.useCallback(async (id: string) => {
    if (!alive.current || !enabledRef.current || !id) return false;
    const epoch = generation.current;
    try {
      const result = await api({ op: 'deleteEngagement', engagement: id });
      if (!alive.current || !enabledRef.current || epoch !== generation.current) return false;
      if (!result || result.ok === false) { setError(result?.error || '删除靶标失败'); return false; }
      setError(null);
      const wasCurrent = current.current === id;
      if (wasCurrent) select(null);
      // 只有删的是当前靶标才让服务端重新选一个；否则保持用户当前选择。
      await loadList(wasCurrent);
      return true;
    } catch (e) {
      if (alive.current && enabledRef.current && epoch === generation.current) setError(message(e));
      return false;
    }
  }, [select, loadList]);
  const refreshAll = React.useCallback(() => {
    setRefreshKey(key => key + 1);
    void loadList();
    void loadSnapshot(current.current);
  }, [loadList, loadSnapshot]);

  return { engagements, engagement, snapshot, error, loading, creating, newName, newUrl, setNewName, setNewUrl,
    selectEngagement, openEngagement, deleteEngagement, refreshList, refreshAll, refreshSnapshot, refreshKey };
}
