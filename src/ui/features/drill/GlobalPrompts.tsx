/** @jsx h */
import React, { h } from '../../host/react';
import { PurgeSelect } from '../../components/PurgeSelect';
import { api } from './api.js';

interface Role { role: string; title: string; content: string; source: string; planner?: boolean }
export function GlobalPrompts({ refreshKey = 0 }: { refreshKey?: number }) {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [active, setActive] = React.useState('');
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [reset, setReset] = React.useState<'one' | 'all' | null>(null);
  const alive = React.useRef(false);
  const seq = React.useRef(0);
  const saving = React.useRef(false);
  const editVersion = React.useRef<Record<string, number>>({});

  React.useEffect(() => {
    alive.current = true;
    const ticket = ++seq.current;
    setBusy(true);
    api({ op: 'globalPrompts' }).then(result => {
      if (!alive.current || ticket !== seq.current) return;
      if (!result || result.ok === false) { setError(result?.error || '读取全局模板失败'); return; }
      /* plan 是主会话人设，不参与子会话注入，也不该出现在“角色模板”里让人白改。 */
      const list = ((result.roles || []) as Role[]).filter(role => role.role !== 'plan' && role.planner !== true);
      setRoles(list);
      setActive(previous => list.some(role => role.role === previous) ? previous : (list[0]?.role || ''));
      setError('');
    }, error => { if (alive.current && ticket === seq.current) setError(String(error)); })
      .finally(() => { if (alive.current && ticket === seq.current) setBusy(false); });
    return () => { alive.current = false; seq.current += 1; };
  }, [refreshKey]);

  const selected = roles.find(role => role.role === active);
  const draft = drafts[active] ?? selected?.content ?? '';
  const dirty = Object.keys(drafts).some(role => drafts[role] !== roles.find(item => item.role === role)?.content);
  const mutate = async (resetMode?: 'one' | 'all') => {
    if (saving.current || !selected || (!resetMode && !draft.trim())) return;
    saving.current = true;
    const ticket = ++seq.current;
    const role = active;
    const versions = { ...editVersion.current };
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await api(resetMode
        ? { op: 'globalPromptsReset', ...(resetMode === 'one' ? { role } : {}) }
        : { op: 'globalPromptSave', role, content: draft });
      if (!alive.current || ticket !== seq.current) return;
      if (!result || result.ok === false) {
        setError((result?.error || '保存全局模板失败') + (result?.failures?.length
          ? '\n' + result.failures.map((failure: {path: string; error: string}) => failure.path + '：' + failure.error).join('\n') : ''));
        return;
      }
      setRoles(result.roles || []);
      setDrafts(current => {
        const next = { ...current };
        for (const key of Object.keys(next)) {
          if ((resetMode === 'all' || key === role) && editVersion.current[key] === versions[key]) delete next[key];
        }
        return next;
      });
      setMessage(resetMode ? '已恢复内置模板；靶标自定义保持不变。' : '已保存全局模板；继承此角色的靶标已同步。');
      setReset(null);
    } catch (error) {
      if (alive.current && ticket === seq.current) setError(String(error));
    } finally {
      saving.current = false;
      if (alive.current && ticket === seq.current) setBusy(false);
    }
  };

  return <div className="rt-main" aria-label="全局角色模板">
    <div className="rt-toolbar"><b>全局角色模板</b><span className="rt-tag">跨靶标共享</span>
      {dirty && <span role="status">有未保存草稿</span>}</div>
    <p className="rt-hint">靶标自定义优先，其次全局模板，最后内置模板。保存后，继承默认的靶标使用此模板；历史自定义内容保持不变。主会话（plan）人设由预设维护，不在此编辑。</p>
    <div className="rt-toolbar">
      <span className="rt-select-label">角色</span>
      <PurgeSelect aria-label="全局模板角色" value={active} onChange={value => { setActive(value); setReset(null); }}
        options={roles.map(role => ({ value: role.role, label: role.title }))} />
      <span>{selected?.source === 'global' ? '来源：全局模板' : '来源：内置模板'}</span>
      <button className="rt-btn" disabled={busy || !selected} onClick={() => setReset('one')}>恢复当前内置模板</button>
      <button className="rt-btn" disabled={busy || !selected} onClick={() => setReset('all')}>恢复全部内置模板</button>
      <button className="rt-btn rt-btn-primary" disabled={busy || !selected || !draft.trim()} onClick={() => void mutate()}>保存全局模板</button>
    </div>
    {error && <div className="rt-err" role="alert" style={{ whiteSpace: 'pre-wrap' }}>{error}</div>}
    {message && <div role="status">{message}</div>}
    {reset && <div className="rt-card" role="alertdialog" aria-label="确认恢复全局模板">
      <p>恢复{reset === 'all' ? '全部角色' : selected?.title}的内置模板，并丢弃对应草稿？靶标自定义不变。</p>
      <button className="rt-btn" disabled={busy} onClick={() => void mutate(reset)}>确认恢复</button>
      <button className="rt-btn" onClick={() => setReset(null)}>取消</button>
    </div>}
    <textarea className="rt-textarea" aria-label="全局模板正文" value={draft} disabled={!selected} spellCheck={false}
      onChange={event => {
        editVersion.current[active] = (editVersion.current[active] || 0) + 1;
        setDrafts(current => ({ ...current, [active]: event.target.value }));
      }} />
  </div>;
}
