// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { useCollapse, Section } from './primitives.js';
import { api } from './api.js';
import { FILE_KIND } from './labels.js';
import { fmt } from './helpers.js';

function AttackFilesTab(props) {
  const eng = props.engagement
  const refreshKey = props.refreshKey || 0
  const [folders, setFolders] = React.useState([])
  const [err, setErr] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const collapse = useCollapse('files:' + eng)
  const [detail, setDetail] = React.useState(null)

  const load = () => {
    if (!eng) return
    setBusy(true)
    api({ op: 'attackFiles', engagement: eng }).then((r) => {
      setBusy(false)
      if (!r || r.ok === false) { setErr((r && r.error) || '读取失败'); return }
      setErr(null)
      setFolders(r.items || [])
    }, (e) => { setBusy(false); setErr(String((e && e.message) || e)) })
  }
  React.useEffect(load, [eng, refreshKey])

  const openFile = (f) => {
    if (detail && detail.id === f.id) { setDetail(null); return }
    setDetail(null)
    api({ op: 'readAttackFile', engagement: eng, id: f.id }).then((r) => {
      if (r && r.ok) setDetail(r)
      else setErr((r && r.error) || '读取失败')
    }, (e) => setErr(String((e && e.message) || e)))
  }

  const rows = []
  for (const folder of folders) {
    const fKey = 'folder:' + folder.folder
    const fileNodes = []
    for (const f of folder.files) {
      fileNodes.push(h('div', {
        key: 'a' + f.id, className: 'rt-vrow', style: { gridTemplateColumns: '18px 1.2fr 60px 1.6fr', cursor: 'pointer' },
        role: 'button', tabIndex: 0,
        onClick: () => openFile(f),
        onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFile(f) } },
      },
        h('span', { className: 'rt-sec-caret' }, detail && detail.id === f.id ? '▾' : '▸'),
        h('span', { className: 'rt-mono' }, f.name),
        h('span', null, h('span', { className: 'rt-tag rt-tag-active' }, FILE_KIND[f.kind] || f.kind || '—')),
        h('span', { style: { fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)' }, title: f.description || '' }, f.description || '—')))
      if (!detail || detail.id !== f.id) continue
      fileNodes.push(h('div', {
        key: 'ad' + f.id, className: 'rt-vrow', style: { cursor: 'default', gridTemplateColumns: '1fr' },
      }, h('div', { className: 'rt-vdetail' },
        h('div', { className: 'rt-kv' }, h('b', null, '效果'), h('span', null, detail.evidence || '—')),
        h('div', { className: 'rt-kv' }, h('b', null, '路径'), h('span', { className: 'rt-mono', style: { wordBreak: 'break-all' } }, detail.path)),
        h('div', { className: 'rt-kv' }, h('b', null, '记录'), h('span', null, fmt(detail.created_at) + (detail.created_by ? ' · ' + detail.created_by : ''))),
        h('pre', { className: 'rt-md', style: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 6, maxHeight: '40vh', padding: '10px 12px' } }, detail.content || '（空）'))))
    }
    rows.push(h(Section, {
      key: 'sec:' + folder.folder, tone: 'folder', title: folder.folder + '/',
      count: folder.count + ' 个文件',
      open: collapse.isOpen(fKey), onToggle: collapse.toggle(fKey),
    }, fileNodes.length ? fileNodes : h('div', { className: 'rt-atest-meta' }, '（空）')))
  }

  const total = folders.reduce((n, f) => n + f.count, 0)
  return h('div', { className: 'rt-main' },
    h('div', { className: 'rt-toolbar' },
      h('span', { style: { fontWeight: 600 } }, '攻击文件'),
      h('span', { className: 'rt-tag' }, folders.length + ' 个目标 / ' + total + ' 个文件'),
      h('div', { className: 'rt-spacer' }),
      h('button', { className: 'rt-btn', disabled: busy, onClick: load }, busy ? '刷新中…' : '刷新')),
    err ? h('div', { className: 'rt-err' }, err) : null,
    h('div', { className: 'rt-table' },
      rows,
      !folders.length ? h('div', { className: 'rt-empty' }, '暂无攻击文件（打通的脚本/POC/EXP 会按目标文件夹出现在这里）') : null),
    h('div', { className: 'rt-foot' }, h('span', null, '目录：attack-files/<IP|URL主机|C段>/ ｜ 只收录实际生效的文件')))
}

export { AttackFilesTab };
