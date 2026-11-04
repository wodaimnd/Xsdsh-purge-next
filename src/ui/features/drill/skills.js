// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { api } from './api.js';
import { fmt } from './helpers.js';

/* 卡片网格 + 右侧详情。数据与 op 不变：skillCatalog / skillRead。 */
const SCOPES = [
  { id: 'all', label: '全部' },
  { id: 'own', label: '本插件自带' },
  { id: 'redteam', label: '红队' },
  { id: 'official', label: '官方' },
];

function availLabel(value) {
  return value === 'available' ? '可用' : value === 'broken' ? '不可用' : '未知';
}

function SkillsTab(props) {
  const refreshKey = props.refreshKey || 0
  const [items, setItems] = React.useState([])
  const [meta, setMeta] = React.useState({})
  const [err, setErr] = React.useState(null)
  const [q, setQ] = React.useState('')
  const [scope, setScope] = React.useState('all')
  const [active, setActive] = React.useState(null)
  const [detail, setDetail] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [brokenOnly, setBrokenOnly] = React.useState(false)

  /* refresh=true 跳过后端 30 秒可用性缓存（技能正文/环境变量可能刚改过） */
  const load = (force) => {
    setBusy(true)
    api({ op: 'skillCatalog', refresh: force === true }).then((r) => {
      setBusy(false)
      if (!r || r.ok === false) { setErr((r && r.error) || '读取失败'); return }
      setErr(null)
      setMeta(r || {})
      setItems(r.items || [])
    }, (e) => { setBusy(false); setErr(String((e && e.message) || e)) })
  }
  React.useEffect(load, [refreshKey])

  const keyOf = (skill) => (skill && skill.library ? skill.library : 'redteam') + ':' + (skill && skill.name)
  const open = (skill) => {
    const key = keyOf(skill)
    if (active === key) { setActive(null); setDetail(null); return }
    setActive(key)
    setDetail(null)
    api({ op: 'skillRead', name: skill.name, library: skill.library || 'redteam' }).then((r) => {
      if (r && r.ok) setDetail(r)
      else setErr((r && r.error) || '读取失败')
    }, (e) => setErr(String((e && e.message) || e)))
  }

  const needle = q.trim().toLowerCase()
  let filtered = needle
    ? items.filter((s) => (s.name + ' ' + s.description + ' ' + s.whenToUse).toLowerCase().indexOf(needle) >= 0)
    : items
  if (scope === 'own') filtered = filtered.filter((s) => s.library !== 'official' && s.fromPlugin === true)
  if (scope === 'redteam') filtered = filtered.filter((s) => s.library !== 'official')
  if (scope === 'official') filtered = filtered.filter((s) => s.library === 'official')
  if (brokenOnly) filtered = filtered.filter((s) => s.library !== 'official' && (s.availability === 'broken' || s.availability === 'unknown'))

  /* 目录聚合：一眼看出"这么多技能是哪来的"（本项目/别的插件/自带根…） */
  const dirs = (meta.byDir || []).filter((d) => d.n > 0).slice(0, 6)
  const availSummary = meta.availability ? meta.availability.summary : null
  const gapCount = availSummary ? (availSummary.broken || 0) + (availSummary.unknown || 0) : 0
  const needRestart = err !== null && String(err).indexOf('unknown op') >= 0
  const counts = { all: items.length, own: meta.fromPlugin || 0,
    redteam: (meta.libraries && meta.libraries.redteam) || 0, official: (meta.libraries && meta.libraries.official) || 0 }
  const selected = active ? items.find((x) => keyOf(x) === active) : null

  const card = (s) => {
    const key = keyOf(s)
    const on = active === key
    const avail = s.availability || 'unknown'
    const metaLine = [s.source ? '来源 ' + s.source : null,
      s.fromPlugin ? '本插件自带' : null,
      s.provider ? s.provider : null,
      s.dir ? s.dir : null].filter(Boolean).join(' · ')
    return h('button', {
      key, type: 'button', className: 'rt-skill-card' + (on ? ' on' : ''),
      'aria-pressed': on ? 'true' : 'false', title: s.description || s.name,
      onClick: () => open(s),
    },
      h('span', { className: 'rt-skill-card-top' },
        h('strong', { className: 'rt-skill-card-name' }, s.name),
        s.library === 'official'
          ? h('span', { className: 'rt-tag', title: '官方技能目录，不按红队工具路径检查' }, '官方')
          : h('span', {
            className: 'rt-avail rt-avail-' + avail,
            title: avail === 'available'
              ? '可用：技能正文可以加载。缺的外部工具或密钥记在详情里，不阻止调用。'
              : ((s.problems || []).join('\n') || '未知'),
          }, availLabel(avail))),
      h('span', { className: 'rt-skill-card-desc' }, s.description || '（无描述）'),
      h('span', { className: 'rt-skill-card-foot' },
        s.modelInvocable === false ? h('span', { className: 'rt-tag' }, '仅人工') : null,
        h('span', { className: 'rt-skill-card-meta' }, metaLine || '来源未知')),
      (s.problems || []).length > 0 && avail !== 'available' && s.library !== 'official'
        ? h('span', { className: 'rt-skill-card-warn' }, '⚠ ' + String(s.problems[0]).slice(0, 60))
        : null)
  }

  const detailBody = () => {
    if (!detail) {
      return h('div', { className: 'rt-skills-blank' },
        h('p', { className: 'rt-skills-note' }, meta.note || '技能由 DSH 原生 skill 体系管理，红队智能体通过 skill 工具调用。'),
        availSummary
          ? h('div', { className: 'rt-skills-sumline' },
              h('span', { className: 'rt-avail rt-avail-available' }, '可用 ' + (availSummary.available || 0)),
              availSummary.broken > 0 ? h('span', { className: 'rt-avail rt-avail-broken' }, '不可用 ' + availSummary.broken) : null,
              availSummary.unknown > 0 ? h('span', { className: 'rt-avail rt-avail-unknown' }, '未知 ' + availSummary.unknown) : null,
              h('span', { className: 'rt-skills-note' },
                '（' + (meta.availability && meta.availability.cached ? '缓存于 ' : '检查于 ')
                + (meta.availability && meta.availability.checked_at ? fmt(meta.availability.checked_at) : '—') + '）'))
          : null,
        meta.availability && (meta.availability.broken || []).length > 0
          ? h('div', { className: 'rt-hint' },
              h('div', { style: { fontWeight: 600, marginBottom: 4 } }, '现在跑不起来的技能：'),
              meta.availability.broken.slice(0, 12).map((b) => h('div', { key: b.name },
                '· ' + b.name + (b.problems && b.problems.length ? ' — ' + b.problems[0] : ''))))
          : null,
        dirs.map((d) => h('div', { key: d.key, className: 'rt-mono rt-skills-dir' }, d.n + ' 个 · ' + d.key)),
        (meta.byDir || []).length > 6
          ? h('div', { className: 'rt-skills-note' },
              '…另有 ' + ((meta.byDir || []).length - 6) + ' 个目录（共 ' + items.length + ' 个技能）')
          : null,
        h('div', { className: 'rt-empty' }, '从左侧选一个技能查看全文'))
    }
    const avail = (selected && selected.availability) || 'unknown'
    return h('div', { className: 'rt-skills-detail-body' },
      h('div', { className: 'rt-skills-detail-head' },
        h('strong', null, detail.name),
        selected && selected.library === 'official'
          ? h('span', { className: 'rt-tag' }, '官方')
          : h('span', { className: 'rt-avail rt-avail-' + avail }, availLabel(avail))),
      h('div', { className: 'rt-kv' }, h('b', null, '描述'), h('span', null, detail.description || '—')),
      h('div', { className: 'rt-kv' }, h('b', null, '何时使用'), h('span', null, detail.whenToUse || '—')),
      h('div', { className: 'rt-kv' }, h('b', null, '来源'), h('span', null, (detail.provider || '—') + ' / ' + (detail.source || '—'))),
      h('div', { className: 'rt-kv' }, h('b', null, '调用方式'),
        h('span', null, selected && selected.modelInvocable === false ? '仅人工调用' : '模型可调用（人工也可）')),
      (() => {
        if (!selected) return null
        if (selected.library === 'official') {
          return h('div', { className: 'rt-kv' }, h('b', null, '类型'), h('span', null, '官方技能。由宿主按任务调用，不按红队工具路径检查。'))
        }
        return h('div', null,
          h('div', { className: 'rt-kv' }, h('b', null, '可用性'),
            h('span', { className: 'rt-avail rt-avail-' + avail },
              avail === 'available' ? '可用' : avail === 'broken' ? '不可用（有明确缺口）' : '未知（正文读不到）')),
          (selected.problems || []).length > 0
            ? h('div', { className: 'rt-kv' }, h('b', null, avail === 'available' ? '未装上的外部工具' : '缺口'),
                h('span', null, selected.problems.map((x, i) => h('div', { key: 'p' + i }, '· ' + x))))
            : null,
          (selected.needs_user || []).length > 0
            ? h('div', { className: 'rt-kv' }, h('b', null, '需要你提供'),
                h('span', { style: { color: 'var(--xsdsh-warn)' } },
                  selected.needs_user.map((x, i) => h('div', { key: 'n' + i }, '· ' + x))))
            : null)
      })(),
      detail.path ? h('div', { className: 'rt-kv' }, h('b', null, '文件'), h('span', { className: 'rt-mono rt-skills-path' }, detail.path)) : null,
      h('pre', { className: 'rt-md rt-skills-md' }, detail.content || '（空）'))
  }

  return h('div', { className: 'rt-skills' },
    h('div', { className: 'rt-skills-head' },
      h('div', { className: 'rt-skills-title' },
        h('strong', null, '技能库'),
        h('span', { className: 'rt-skills-counts' },
          '红队 ' + counts.redteam + ' · 官方 ' + counts.official + ' · 自带 ' + counts.own)),
      h('div', { className: 'rt-skills-actions' },
        availSummary
          ? h('div', { className: 'rt-skills-sumline' },
              h('span', { className: 'rt-avail rt-avail-available' }, '可用 ' + (availSummary.available || 0)),
              availSummary.broken > 0 ? h('span', { className: 'rt-avail rt-avail-broken' }, '不可用 ' + availSummary.broken) : null,
              availSummary.unknown > 0 ? h('span', { className: 'rt-avail rt-avail-unknown' }, '未知 ' + availSummary.unknown) : null)
          : null,
        availSummary
          ? h('button', {
              type: 'button', className: 'rt-btn',
              title: '技能正文或环境变量刚改过？点这里跳过 30 秒缓存重查',
              onClick: () => load(true),
            }, '重查可用性')
          : null,
        h('button', { type: 'button', className: 'rt-btn', disabled: busy, onClick: () => load(true) }, busy ? '刷新中…' : '刷新'))),
    h('div', { className: 'rt-skills-tools' },
      h('input', {
        className: 'rt-input rt-skills-search', placeholder: '搜索技能 / 描述 / 使用场景',
        value: q, onChange: (e) => setQ(e.target.value), 'aria-label': '搜索技能',
      }),
      h('div', { className: 'rt-segbar', role: 'group', 'aria-label': '技能范围' },
        SCOPES.map((item) => h('button', {
          key: item.id, type: 'button',
          className: 'rt-segbar-btn' + (scope === item.id ? ' on' : ''),
          'aria-pressed': scope === item.id ? 'true' : 'false',
          onClick: () => setScope(item.id),
        }, item.label + ' ' + (counts[item.id] || 0)))),
      gapCount > 0
        ? h('button', {
            type: 'button', className: 'rt-gap-chip' + (brokenOnly ? ' on' : ''),
            'aria-pressed': brokenOnly ? 'true' : 'false',
            title: '只看有明确缺口（缺 key / 缺本机路径 / 基础设施还是占位符）或判不了可用性的技能',
            onClick: () => setBrokenOnly((v) => !v),
          }, '只看不可用/未知 ' + gapCount)
        : null),
    err
      ? (needRestart
          ? h('div', { className: 'rt-empty' }, '该模块的宿主代码已更新，需重启一次当前宿主（官方 exe / 社区版 / dsh web）后生效')
          : h('div', { className: 'rt-err' }, err))
      : null,
    h('div', { className: 'rt-skills-body' },
      h('div', { className: 'rt-skills-grid-wrap' },
        filtered.length > 0
          ? h('div', { className: 'rt-skills-grid' }, filtered.map(card))
          : h('div', { className: 'rt-empty' }, items.length === 0 ? '还没有可用的技能。' : '没有匹配的技能：换个关键词或切换范围。')),
      h('aside', { className: 'rt-skills-detail', 'aria-label': '技能详情' }, detailBody())))
}

export { SkillsTab };
