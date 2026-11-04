/** @jsx h */
import type { ReactNode } from 'react';
import React, { h } from '../../host/react';
import toolbarCSS from './drill-toolbar.css';
import type { DrillController, Engagement } from './controller';
import { NO_URL_LABEL } from './labels';
import { AssetsTab } from './assets.js';
import { SessionTab } from './sessions.js';
import { FindingsTab } from './findings.js';
import { ChainTab } from './chain.js';
import { ScoreTab } from './scores.js';
import { ReportTab } from './report.js';
import { EnvTab } from './environment.js';
import { AgentsTab } from './agents.js';
import { KnowledgeTab } from './knowledge.js';
import { SkillsTab } from './skills.js';
import { RtBoundary } from './primitives.js';
import { TrashIcon } from '../../components/TrashIcon';

export const REDTEAM_PAGES = ['assets', 'target', 'sessions', 'findings', 'chain', 'scores', 'report'] as const;
export const GLOBAL_PAGES = ['env', 'net', 'agents', 'knowledge', 'skills'] as const;
export type RedteamPage = typeof REDTEAM_PAGES[number];
export type GlobalPage = typeof GLOBAL_PAGES[number];
export interface DrillContentProps {
  area: 'redteam' | 'global';
  tab: RedteamPage | GlobalPage;
  controller: DrillController;
  renderTarget?: (context: DrillController) => ReactNode;
  renderGlobalNet?: (context: DrillController) => ReactNode;
}

/** Content only: the owning DrillWorkspace renders the one navigation bar. */
export function DrillContent(props: DrillContentProps) {
  const c = props.controller;
  const common = { engagement: c.engagement, refreshKey: c.refreshKey };
  let body: ReactNode;
  if (props.area === 'global') {
    switch (props.tab) {
      case 'env': body = <EnvTab refreshKey={c.refreshKey} section="environment" />; break;
      // The old editor remains usable before the new connection editor is wired by the host.
      case 'net': body = props.renderGlobalNet ? props.renderGlobalNet(c) : <EnvTab refreshKey={c.refreshKey} section="connections" />; break;
      case 'agents': body = <AgentsTab refreshKey={c.refreshKey} global />; break;
      case 'knowledge': body = <KnowledgeTab refreshKey={c.refreshKey} />; break;
      case 'skills': body = <SkillsTab refreshKey={c.refreshKey} />; break;
      default: body = <div className="rt-empty">未知全局页面</div>;
    }
  } else if (!c.engagement) {
    body = <div className="rt-pane"><div className="rt-card"><h4>{c.loading ? '正在加载靶标…' : '还没有靶标'}</h4>
      <p>输入目标 URL，可补充靶标名称，创建演练并开始资产测绘。</p><CreateEngagement controller={c} /></div></div>;
  } else {
    switch (props.tab) {
      case 'assets': body = <AssetsTab {...common} snapshot={c.snapshot} onRefresh={c.refreshAll} onData={c.refreshSnapshot} />; break;
      case 'target': body = props.renderTarget ? props.renderTarget(c) : <div className="rt-pane"><h4>目标配置</h4>
        <p>{c.snapshot?.engagement?.name || c.engagement}</p><p>{c.snapshot?.engagement?.target_url || '未配置目标 URL'}</p></div>; break;
      case 'sessions': body = <SessionTab {...common} />; break;
      case 'findings': body = <FindingsTab {...common} />; break;
      case 'chain': body = <ChainTab {...common} />; break;
      case 'scores': body = <ScoreTab {...common} />; break;
      case 'report': body = <ReportTab {...common} />; break;
      default: body = <div className="rt-empty">未知红队页面</div>;
    }
  }
  // Keying by target prevents old page state from leaking into another target.
  const key = `${props.area}:${props.tab}:${props.area === 'redteam' ? c.engagement : ''}`;
  return <div className="rt-workspace-content" data-drill-page={`${props.area}/${props.tab}`}>
    {props.area === 'redteam' && c.error && <div className="rt-err" role="alert">{c.error}</div>}
    <RtBoundary key={key} onRetry={c.refreshAll}><div className="rt-body" key={key}>{body}</div></RtBoundary>
  </div>;
}

function CreateEngagement({ controller: c, onCancel }: { controller: DrillController; onCancel?: () => void }) {
  return <form className="rt-create" onSubmit={event => { event.preventDefault(); void c.openEngagement(); }}>
    <input className="rt-input" type="url" aria-label="目标 URL" placeholder="https://target.example" value={c.newUrl}
      onChange={event => c.setNewUrl(event.target.value)} />
    <input className="rt-input" aria-label="新靶标名称" placeholder="靶标名称（可选）" value={c.newName}
      onChange={event => c.setNewName(event.target.value)} />
    <button type="submit" className="rt-btn" disabled={c.creating || (!c.newName.trim() && !c.newUrl.trim())}>{c.creating ? '创建中…' : '创建靶标'}</button>
    {onCancel && <button type='button' className='rt-btn' disabled={c.creating} onClick={onCancel}>取消</button>}
  </form>;
}

export function DrillToolbar({ controller: c }: { controller: DrillController }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const search = React.useRef<HTMLInputElement>(null);
  const id = React.useId();
  const selected = c.engagements.find(eng => eng.id === c.engagement);
  const filtered = c.engagements.filter(eng => [eng.target_url, eng.name, eng.id].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const close = () => { setOpen(false); setDeleting(null); trigger.current?.focus(); };
  const remove = async (eng: Engagement) => {
    setDeleteBusy(true);
    try { if (await c.deleteEngagement(eng.id)) setDeleting(null); }
    finally { setDeleteBusy(false); }
  };
  React.useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) { setOpen(false); setDeleting(null); }
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  React.useEffect(() => { setOpen(false); setQuery(''); setCreating(false); setDeleting(null); }, [c.engagement]);
  const moveFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    // Home/End retain normal text editing behavior in the search input.
    if (event.target === search.current && ['Home', 'End'].includes(event.key)) return;
    const options = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[data-target-option]') || []);
    if (!options.length) return;
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
      : event.key === 'ArrowDown' ? (current + 1) % options.length : (current <= 0 ? options.length - 1 : current - 1);
    event.preventDefault(); options[next].focus();
  };
  const stats = c.snapshot?.engagement?.id === c.engagement ? c.snapshot.stats : null;
  /* URL 是主身份，名称是别名。没有 URL 时让名称作主行，连名字都没有才显示「未填网址」——
     反过来的话，填了 URL 的靶标会一律叫「未填网址」，真网址被压成小字。 */
  const optionTitle = (eng: Engagement) => eng.target_url || eng.name || NO_URL_LABEL;
  const optionSub = (eng: Engagement) => (eng.target_url && eng.name ? eng.name : eng.target_url || eng.name ? `` : eng.id);
  /* 入口按示意稿排成一行：主身份 + （缺网址时的）标签 + 次要信息，不再叠两行把工具条撑高。 */
  const triggerTitle = selected ? (selected.target_url || selected.name || NO_URL_LABEL) : (c.loading ? `加载靶标…` : `选择靶标`);
  const triggerMeta = selected
    ? [selected.name && selected.target_url ? selected.name : '', stats ? `C 段 ${stats.segments ?? '—'} · 资产 ${stats.assets ?? '—'} · 漏洞 ${stats.vulns ?? '—'}` : ''].filter(Boolean).join(` · `)
    : (c.loading ? `` : `按 URL 或名称查找靶标`);
  return <div className="rt-workspace-toolbar rt-target-toolbar">
    <style>{toolbarCSS}</style>
    <span className="rt-target-label">靶标</span>
    <div className="rt-target-picker" ref={root} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <button type="button" ref={trigger} className="rt-target-current" aria-label="当前靶标"
        aria-expanded={open} aria-controls={`${id}-picker`} aria-haspopup="dialog"
        onClick={() => { if (!open) { setQuery(''); c.refreshList(); } setOpen(value => !value); }}>
        <span className="rt-target-identity"><strong>{triggerTitle}</strong>
          {selected && !selected.target_url && <em className='rt-target-missing'>{NO_URL_LABEL}</em>}
          {triggerMeta && <small>{triggerMeta}</small>}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && <div className="rt-target-menu" id={`${id}-picker`} role="dialog" aria-label="选择靶标" onKeyDown={moveFocus}>
        <div className="rt-target-search"><input ref={search} className="rt-input" type="search" aria-label="搜索靶标" placeholder="搜索 URL / 名称"
          value={query} onChange={event => setQuery(event.target.value)} /></div>
        <div className="rt-target-rows">
          {filtered.map(eng => <div key={eng.id} className='rt-target-item'>
            <div className='rt-target-row'>
              <button type='button' className='rt-target-option' data-target-option={eng.id}
                aria-pressed={eng.id === c.engagement} onClick={() => { c.selectEngagement(eng.id); close(); }}>
                <strong>{optionTitle(eng)}</strong><small>{optionSub(eng)}</small>
              </button>
              <button type='button' className='rt-target-del' aria-label={`删除靶标 ${optionTitle(eng)}`} title="删除靶标"
                aria-expanded={deleting === eng.id} disabled={deleteBusy}
                onClick={() => setDeleting(value => (value === eng.id ? null : eng.id))}><TrashIcon /></button>
            </div>
            {deleting === eng.id && <div className='rt-target-confirm' role='group' aria-label='确认删除靶标'>
              <p>删除「{optionTitle(eng)}」？资产库、漏洞、证据、报告和提示词会一起删除，无法恢复。</p>
              <div>
                <button type='button' className='rt-btn rt-btn-danger' disabled={deleteBusy} onClick={() => void remove(eng)}>{deleteBusy ? '删除中…' : '确认删除'}</button>
                <button type='button' className='rt-btn' disabled={deleteBusy} onClick={() => setDeleting(null)}>取消</button>
              </div>
            </div>}
          </div>)}
          {!filtered.length && <p className="rt-target-empty" role="status">{c.engagements.length ? '没有匹配的靶标' : '暂无靶标，请先创建'}</p>}
        </div>
        <div className="rt-target-menu-foot"><span>显示 {filtered.length} / {c.engagements.length} 个靶标</span>
          <button type="button" className="rt-btn" onClick={() => { close(); setCreating(true); }}>+ 创建靶标</button></div>
      </div>}
    </div>
    {/* 创建入口只保留下拉脚注这一处；打开下拉时自动刷新列表，因此不再需要常驻的创建/刷新按钮。 */}
    {creating && <div className="rt-target-create"><CreateEngagement controller={c} onCancel={() => setCreating(false)} /></div>}
  </div>;
}

export function DrillFooter({ controller: c }: { controller: DrillController }) {
  const stats = c.snapshot?.stats || {};
  return <div className="rt-workspace-footer">
    <span>C 段 {stats.segments || 0}</span><span>资产 {stats.assets || 0}（存活 {stats.liveAssets || 0}）</span>
    <span>端口 {stats.openPorts || 0}</span><span>指纹 {stats.fingerprints || 0}</span><span>漏洞 {stats.vulns || 0}</span>
    <span>被动/主动 {stats.passiveSignals || 0}/{stats.activeSignals || 0}</span>
    <span>SQLite · {c.snapshot?.engagement?.name || ''}</span>
  </div>;
}
