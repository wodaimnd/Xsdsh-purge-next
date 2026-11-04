// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { api } from './api.js';
import { fmt, clickable } from './helpers.js';
import { PriTag } from './primitives.js';

function DiscoveryView(props) {
  const eng = props.engagement
  const refreshKey = props.refreshKey || 0
  const [data, setData] = React.useState(null)
  const [err, setErr] = React.useState(null)
  const [day, setDay] = React.useState('')
  React.useEffect(() => {
    if (!eng) return
    setData(null)
    api({ op: 'discoveryTimeline', engagement: eng, limit: 200 })
      .then((r) => { if (!r || r.ok === false) setErr((r && r.error) || '加载失败'); else { setErr(null); setData(r) } },
        (e) => setErr(String((e && e.message) || e)))
  }, [eng, refreshKey])
  if (err) return h('div', { className: 'rt-pane' }, h('div', { className: 'rt-err' }, err))
  if (!data) return h('div', { className: 'rt-empty' }, '加载中…')
  const recent = (data.recent || []).filter((a) => day === '' || String(a.discovered_at || '').slice(0, 10) === day)
  return h('div', { className: 'rt-pane', style: { flex: 1, minHeight: 0 } },
    h('div', { className: 'rt-card' },
      h('h4', null, '资产发现时间线'),
      h('div', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)' } },
        '共 ' + ((data.span && data.span.total) || 0) + ' 台 · 最早 '
        + (data.span && data.span.first ? fmt(data.span.first) : '—')
        + ' · 最近 ' + (data.span && data.span.last ? fmt(data.span.last) : '—')
        + '（发现时间 = 第一次进入资产库的时刻；重复采集只刷新"最近采集"）')),
    (data.days || []).length === 0 ? h('div', { className: 'rt-empty' }, '还没有资产。') : null,
    h('div', { className: 'rt-card' },
      h('h4', null, '按天统计', day
        ? h('span', Object.assign({ className: 'rt-tag', style: { marginLeft: 6, cursor: 'pointer' } },
            clickable(() => setDay(''), { label: '清除按天筛选：' + day })), '清除筛选：' + day)
        : null),
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
        (data.days || []).map((d) => h('div', Object.assign({
          key: d.day, className: 'rt-seg' + (day === d.day ? ' on' : ''), style: { marginBottom: 0, cursor: 'pointer' },
          title: d.day + '：新增 ' + d.assets + ' 台（内网 ' + d.internal + ' / 外网 ' + d.external + '）',
        }, clickable(() => setDay(day === d.day ? '' : d.day),
          { label: '筛选 ' + d.day + ' 发现的资产', expanded: day === d.day })),
          h('div', { className: 'rt-seg-cidr' }, d.day),
          h('div', { className: 'rt-seg-meta' }, d.assets + ' 台 · 内 ' + d.internal + ' / 外 ' + d.external))))),
    h('div', { className: 'rt-card' },
      h('h4', null, day ? day + ' 发现的资产（' + recent.length + '）' : '最近发现的资产（' + recent.length + '）'),
      recent.length === 0 ? h('div', { className: 'rt-empty' }, '这一天没有新增资产。') : null,
      recent.map((a) => h('div', { key: a.id, className: 'rt-kv' },
        h('b', { className: 'rt-mono', style: { minWidth: 110 } },
          h('span', { className: 'rt-scope rt-scope-' + (a.scope === 'internal' ? 'internal' : 'external'), style: { marginRight: 4 } },
            a.scope === 'internal' ? '内' : '外'),
          a.ip),
        h('span', { style: { minWidth: 132, fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)' } },
          a.discovered_at ? fmt(a.discovered_at) : '时间未知'),
        h('span', { style: { flex: 1 } }, (a.primary_name || '—') + (a.open_ports ? ' · ' + a.open_ports + ' 端口' : '')),
        h(PriTag, { p: a.priority })))))
}

export { DiscoveryView };
