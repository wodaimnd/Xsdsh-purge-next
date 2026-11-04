import React, { h } from '../../host/react';
import { PriTag, TestTag, ProvTag, Clip } from './primitives.js';
import { api } from './api.js';
import { clickable, fmt, fmtShort } from './helpers.js';
import { TestingTab } from './testing.js';
import { DiscoveryView } from './discovery.js';
import { PurgeSelect } from '../../components/PurgeSelect';
import assetsCSS from './assets.css';

/** 按 key 去重并保持首次出现顺序（前端防御：后端若因历史数据返回重复行也不重复渲染）。 */
function uniqueBy(list, keyOf) {
  const seen = new Set()
  const out = []
  for (const item of list || []) {
    const key = keyOf(item)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

function AssetsTab(props) {
  const eng = props.engagement
  const refreshKey = props.refreshKey || 0
  const [view, setView] = React.useState('list')
  const [cidr, setCidr] = React.useState('')
  const [q, setQ] = React.useState('')
  const [qApplied, setQApplied] = React.useState('')
  const [service, setService] = React.useState('')
  const [port, setPort] = React.useState('')
  const [prov, setProv] = React.useState('')
  const [testStatus, setTestStatus] = React.useState('')
  const [priority, setPriority] = React.useState('')
  const [scope, setScope] = React.useState('')
  const [assetState, setAssetState] = React.useState('')
  const [sort, setSort] = React.useState('priority')
  const [more, setMore] = React.useState(false)
  const [state, setState] = React.useState({ loading: false, error: null, total: 0, items: [] })
  const [domains, setDomains] = React.useState(null)
  const [web, setWeb] = React.useState(null)
  const [selection, setSelection] = React.useState(null)
  const [detail, setDetail] = React.useState(null)
  const [detailError, setDetailError] = React.useState(null)
  const seq = React.useRef(0)
  const detailSeq = React.useRef(0)
  const listRef = React.useRef(null)
  const detailRef = React.useRef(null)
  const revealedSelection = React.useRef(null)
  const onDataRef = React.useRef(props.onData)
  onDataRef.current = props.onData

  React.useEffect(() => {
    if (!eng) return
    const my = ++seq.current
    setState((s) => ({ ...s, loading: true, error: null }))
    api({
      op: 'assets', engagement: eng, cidr: cidr || undefined, q: qApplied || undefined,
      service: service || undefined, port: port || undefined,
      provenance: prov || undefined, test_status: testStatus || undefined,
      priority: priority || undefined, scope: scope || undefined,
      state: assetState || undefined, sort, limit: 400,
    }).then((r) => {
      if (my !== seq.current) return
      if (!r || r.ok === false) {
        setState({ loading: false, error: (r && r.error) || '查询失败', total: 0, items: [] })
        return
      }
      setState({ loading: false, error: null, total: r.total ?? (r.items || []).length, items: r.items || [] })
      if (onDataRef.current) onDataRef.current()
    }, (e) => {
      if (my === seq.current) setState({ loading: false, error: String((e && e.message) || e), total: 0, items: [] })
    })
    return () => { seq.current += 1 }
  }, [eng, cidr, qApplied, service, port, prov, testStatus, priority, scope, assetState, sort, refreshKey])

  React.useEffect(() => {
    if (!eng || (view !== 'domain' && view !== 'web')) return
    let alive = true
    const save = view === 'domain' ? setDomains : setWeb
    save(null)
    // These views are global to the target; hidden list filters must not narrow them.
    api({ op: view === 'domain' ? 'domains' : 'web', engagement: eng }).then((r) => {
      if (!alive) return
      if (!r || r.ok === false) { save([]); setState(s => ({ ...s, error: r?.error || '查询失败' })); return }
      save(r.items || [])
    }, (e) => { if (alive) { save([]); setState(s => ({ ...s, error: String(e) })) } })
    return () => { alive = false }
  }, [eng, view, refreshKey])

  // Detail requests have a separate generation so rapid row switches and target changes are safe.
  React.useEffect(() => {
    const my = ++detailSeq.current
    setDetail(null); setDetailError(null)
    if (!eng || !selection || selection.eng !== eng) return
    api({ op: 'asset', engagement: eng, id: selection.id }).then((r) => {
      if (my !== detailSeq.current) return
      if (r && r.ok && r.asset) setDetail(r.asset)
      else setDetailError(r?.error || '资产详情加载失败')
    }, (error) => { if (my === detailSeq.current) setDetailError(String(error)) })
    return () => { detailSeq.current += 1 }
  }, [eng, selection, refreshKey])

  React.useEffect(() => {
    if (view !== 'list' || !selection || selection.eng !== eng || state.loading) return
    if (revealedSelection.current === selection || (detail?.id !== selection.id && !detailError)) return
    const list = listRef.current
    const panel = detailRef.current
    const width = list?.closest('.rt-assets')?.clientWidth
    if (!list || !panel || !width) return
    revealedSelection.current = selection
    // Match the container breakpoint, not the browser window: the dock is resizable.
    // Narrow stack: the detail is appended below the rows, so scroll the outermost
    // chain (list → tab panel → drill body) until the detail top is visible.
    if (width <= 820) {
      let scroller = list
      const needed = panel.getBoundingClientRect().top - list.getBoundingClientRect().top - list.clientTop
      let delta = needed
      while (scroller && delta > 0) {
        const room = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop
        if (room > 0) scroller.scrollTop += Math.min(room, delta)
        const done = panel.getBoundingClientRect().top - list.getBoundingClientRect().top - list.clientTop
        if (done <= 1) break
        delta = done
        scroller = scroller.parentElement
      }
      panel.focus({ preventScroll: true })
    }
  }, [eng, view, selection, detail, detailError, state.loading])

  const reset = () => {
    setCidr(''); setQ(''); setQApplied(''); setService(''); setPort(''); setProv('')
    setTestStatus(''); setPriority(''); setScope(''); setAssetState(''); setSort('priority')
  }
  const selectAsset = (id) => setSelection({ eng, id })
  const jumpToAsset = (asset) => {
    reset(); setQ(asset.ip); setQApplied(asset.ip); setView('list')
    selectAsset(asset.id ?? asset.asset_id)
  }
  const selectedId = selection?.eng === eng ? selection.id : null
  const selected = state.items.find(item => item.id === selectedId)
  const segs = props.snapshot?.segments || []
  const tests = props.snapshot?.tests || {}
  const stats = props.snapshot?.stats || {}
  const select = (label, value, change, options) => h(PurgeSelect, {
    'aria-label': label, value, onChange: change, size: 'sm', className: 'rt-select',
    options: options.map(([id, text]) => ({ value: id, label: text })),
  })
  const viewLabels = [['list', '列表'], ['timeline', '发现时间'], ['domain', '域名'], ['web', 'Web']]
  const toolbar = h('div', { className: 'rt-assets-toolbar' },
    h('div', { className: 'rt-assets-views', role: 'group', 'aria-label': '资产视图' }, viewLabels.map(([id, label]) =>
      h('button', { type: 'button', key: id, className: 'rt-btn', 'aria-pressed': view === id, onClick: () => setView(id) }, label))),
    view === 'list' ? h(React.Fragment, null,
      h('label', { className: 'rt-assets-cidr' }, 'C 段', select('C 段', cidr, setCidr,
        [['', '全部 C 段'], ...segs.map(s => [s.cidr, `${s.cidr} · ${s.scope === 'internal' ? '内' : '外'}（${s.assets ?? 0} 台）`])])),
      h('form', { className: 'rt-assets-search', onSubmit: e => { e.preventDefault(); setQApplied(q) } },
        h('input', { className: 'rt-input', 'aria-label': '搜索资产', placeholder: '搜索 IP / 域名 / 指纹', value: q, onChange: e => setQ(e.target.value) }),
        h('button', { type: 'submit', className: 'rt-btn' }, '搜索')),
      select('易打性', priority, setPriority, [['', '易打性不限'], ['high', '易打（高）'], ['medium', '一般（中）'], ['low', '难打（低）']]),
      select('测试状态', testStatus, setTestStatus, [['', '测试状态不限'], ['untested', '未测试'], ['testing', '测试中'], ['tested', '已测试'], ['blocked', '被封禁'], ['abandoned', '已放弃'], ['no_surface', '无攻击面']]),
      h('button', { type: 'button', className: 'rt-btn', 'aria-expanded': more, onClick: () => setMore(!more) }, '更多'),
      h('button', { type: 'button', className: 'rt-btn', onClick: reset }, '重置'))
      : h('span', { className: 'rt-assets-hint' }, view === 'testing' ? '当前测试 · 5 秒自动刷新' : viewLabels.find(x => x[0] === view)?.[1]))

  const extraFilters = view === 'list' && more ? h('div', { className: 'rt-assets-more' },
    select('内外网', scope, setScope, [['', '内外网不限'], ['external', '仅外网资产'], ['internal', '仅内网资产']]),
    h('input', { className: 'rt-input', 'aria-label': '服务', placeholder: '服务，例如 nginx', value: service, onChange: e => setService(e.target.value) }),
    h('input', { className: 'rt-input', 'aria-label': '端口', placeholder: '端口，例如 443', value: port, onChange: e => setPort(e.target.value) }),
    select('来源', prov, setProv, [['', '来源不限'], ['passive', '仅被动'], ['active', '仅主动']])) : null
  const statButton = (label, count, active, action) => h('button', {
    type: 'button', className: 'rt-assets-stat', 'aria-pressed': active, onClick: action,
  }, label, ' ', count == null ? '—' : String(count))
  const toggleTest = value => { setTestStatus(cur => cur === value ? '' : value); setAssetState('') }
  const conclusion = view === 'list' ? h('div', { className: 'rt-assets-stats' },
    h('button', { type: 'button', className: 'rt-assets-stat', title: '列表单次最多 400 台；完整结果请用 redteam_asset_query 过滤或分页', onClick: reset }, `显示 ${state.items.length} / ${state.total} 台`),
    statButton('存活', stats.liveAssets, assetState === 'live', () => { setAssetState(v => v === 'live' ? '' : 'live'); setTestStatus('') }),
    ...[['untested', '待测'], ['testing', '测试中'], ['tested', '已测'], ['abandoned,blocked', '放弃'], ['no_surface', '无攻击面']].map(([id, label]) =>
      h(React.Fragment, { key: id }, statButton(label, id === 'abandoned,blocked' ? (tests.abandoned == null && tests.blocked == null ? null : (tests.abandoned || 0) + (tests.blocked || 0)) : tests[id], testStatus === id, () => toggleTest(id)))),
    h('span', { className: 'rt-spacer' }),
    h('button', { type: 'button', className: 'rt-btn', onClick: () => setView('testing') }, '当前测试'),
    h('button', { type: 'button', className: 'rt-btn', onClick: props.onRefresh }, '刷新'),
    select('列表排序方式', sort, setSort, [['priority', '易打性优先'], ['todo', '待测优先'], ['discovered', '最近发现优先'], ['ports', '端口多优先'], ['ip', '按 IP']]),
    state.total > state.items.length ? h('span', { className: 'rt-assets-hint', role: 'status' },
      `共 ${state.total} 台，当前仅显示前 ${state.items.length} 台；完整结果请用 redteam_asset_query 过滤或分页。`) : null) : null

  const rowNodes = state.items.map(it => {
    const ports = (it.ports || []).filter(p => p.state === 'open')
    const fingerprints = (it.fingerprints || []).map(f => [f.vendor, f.product, f.version].filter(Boolean).join(' ')).join(' / ')
    return h('div', Object.assign({ key: it.id, className: 'rt-assets-row' + (selectedId === it.id ? ' on' : ''), 'data-asset-id': it.id },
      clickable(() => selectAsset(it.id), { label: '查看资产 ' + it.ip, expanded: selectedId === it.id })),
      h('span', { className: 'rt-assets-ip' }, h('span', { className: 'rt-scope' }, it.scope === 'internal' ? '内' : '外'),
        h('span', { className: 'rt-assets-live' + (it.state === 'live' ? ' on' : ''), title: it.state === 'live' ? '存活' : (it.state || '状态未知') }),
        h('span', null, h('b', null, it.ip), h('small', { title: '发现时间：' + fmt(it.discovered_at) },
          (it.names || []).map(n => typeof n === 'string' ? n : n.name).join(', ') || (it.discovered_at ? fmtShort(it.discovered_at) : '发现时间未知')))),
      h('span', null, h(PriTag, { p: it.priority }), h('small', { title: it.potential || '未评估' }, it.potential || '未评估')),
      h('span', null, h(TestTag, { s: it.test_status }), it.blocked_count ? h('small', null, '封 ' + it.blocked_count) : null),
      h('span', { className: 'rt-assets-ellipsis', title: ports.map(p => `${p.port}/${p.service || '未知服务'}`).join(', ') }, ports.slice(0, 3).map(p => `${p.port}${p.service ? '/' + p.service : ''}`).join(', ') || '—', ports.length > 3 ? ` +${ports.length - 3}` : ''),
      h('span', { className: 'rt-assets-ellipsis', title: fingerprints }, fingerprints || '—'))
  })
  const d = detail && detail.id === selectedId ? detail : null
  const fact = (label, value) => h('div', { className: 'rt-assets-fact', key: label }, h('dt', null, label), h('dd', null, value))
  const portFacts = d && (d.ports || []).filter(p => p.state === 'open').map((p, index) => h('div', { key: index },
    p.url ? h('a', { className: 'rt-link', href: p.url, target: '_blank', rel: 'noreferrer' }, `${p.port}/${p.service || p.proto || '未知服务'}`)
      : `${p.port}/${p.service || p.proto || '未知服务'}`, h(ProvTag, { p: p.provenance })))
  const fpFacts = d && (d.fingerprints || []).map((f, index) => h('div', { key: index },
    [f.vendor, f.product, f.version].filter(Boolean).join(' ') || '未记录', f.evidence ? ' · ' + f.evidence : '', h(ProvTag, { p: f.provenance })))
  const detailPane = h('aside', { ref: detailRef, tabIndex: -1, className: 'rt-assets-detail', 'aria-label': '资产详情', 'aria-busy': selectedId != null && !d && !detailError },
    selectedId == null ? h('div', { className: 'rt-empty' }, '选择左侧资产查看详情')
      : detailError ? h('div', { role: 'alert', className: 'rt-err' }, detailError,
        h('button', { type: 'button', className: 'rt-btn', onClick: () => selectAsset(selectedId) }, '重试'))
      : !d ? h('div', { role: 'status', className: 'rt-empty' }, '加载资产详情…')
      : h(React.Fragment, null,
        h('h3', null, d.ip || selected?.ip), h('div', { className: 'rt-assets-hint' }, (d.names || []).map(n => typeof n === 'string' ? n : n.name).join(', ') || '未记录主机名', ' · ', d.segment_cidr || '未记录 C 段'),
        h('dl', { className: 'rt-assets-facts' },
          fact('易打性', h(React.Fragment, null, h(PriTag, { p: d.priority }), ' ', d.potential || '未评估')),
          fact('攻击面', d.test_surface || '未记录'), fact('开放端口', portFacts.length ? portFacts : '无开放端口'),
          fact('指纹', fpFacts.length ? fpFacts : '未记录'), fact('首次发现', fmt(d.discovered_at)),
          fact('来源', `被动端口 ${d.passive ?? 0} · 主动端口 ${d.active ?? 0}`),
          fact('测试状态', h(React.Fragment, null, h(TestTag, { s: d.test_status }), d.blocked_count ? ` · 被封 ${d.blocked_count} 次` : '')),
          fact('最近采集', fmt(d.last_seen))),
        h('details', null, h('summary', null, '测试记录与采集溯源'),
          d.assess_reason ? h('p', null, '评估依据：', d.assess_reason) : null,
          h('p', null, '测试更新：', fmt(d.test_updated_at), d.test_updated_by ? ' · ' + d.test_updated_by : ''),
          h('p', null, '数据源首见：', fmt(d.first_seen)),
          d.test_notes ? h(Clip, { label: '测试记录', text: d.test_notes }) : h('p', null, '暂无测试记录'),
          h('h4', null, '采集溯源（最近 8 条）'),
          (d.observations || []).length ? d.observations.slice(0, 8).map((o, i) => h('div', { className: 'rt-assets-record', key: i },
            `${o.attr || '—'} = ${o.value || ''} · ${o.tool || '未知工具'} · ${fmt(o.collected_at)}`, h(ProvTag, { p: o.provenance }))) : h('p', null, '暂无采集记录'))))
  const listPane = h('div', { ref: listRef, className: 'rt-assets-list' }, h('div', { className: 'rt-assets-workspace' },
    h('div', { className: 'rt-assets-table' },
      h('div', { className: 'rt-assets-row rt-assets-head' }, ...['IP / 主机', '易打', '测试状态', '开放端口 / 服务', '指纹'].map(label => h('span', { key: label }, label))),
      h('div', { className: 'rt-assets-rows', 'aria-busy': state.loading }, rowNodes,
        state.loading ? h('div', { role: 'status', className: 'rt-empty' }, '加载资产…') : !state.items.length ? h('div', { className: 'rt-empty' }, '没有匹配的资产。换个 C 段或清空搜索条件。') : null)), detailPane))

  /* 防御性去重：历史库可能因重复采集留下重复 service/域名行。 */
  const domainGroups = uniqueBy(domains, g => g.domain)
  const webItems = uniqueBy(web, w => w.port_id ?? `${w.asset_id}+${w.port}+${w.proto}`)
  let pane = listPane
  if (view === 'testing') pane = h(TestingTab, { engagement: eng, refreshKey })
  else if (view === 'timeline') pane = h(DiscoveryView, { engagement: eng, refreshKey })
  else if (view === 'domain') pane = h('div', { className: 'rt-assets-secondary' },
    domains === null ? '加载中…' : !domainGroups.length ? '暂无域名数据' : domainGroups.map(g => h('section', { className: 'rt-card', key: g.domain },
      h('h4', null, h('a', { className: 'rt-link', href: 'http://' + g.domain, target: '_blank', rel: 'noreferrer' }, g.domain)),
      uniqueBy(g.assets, a => a.id).map(a => h('button', { type: 'button', className: 'rt-btn', key: a.id, onClick: () => jumpToAsset(a) }, a.ip)))))
  else if (view === 'web') pane = h('div', { className: 'rt-assets-secondary' },
    web === null ? '加载中…' : !webItems.length ? '暂无 Web 资产' : webItems.map(w => {
      const url = w.url || `http${[443, 8443, 9443].includes(w.port) ? 's' : ''}://${w.ip}${[80, 443].includes(w.port) ? '' : ':' + w.port}`
      return h('section', { className: 'rt-card', key: w.port_id },
        h('a', { className: 'rt-link', href: url, target: '_blank', rel: 'noreferrer' }, url),
        h('p', null, w.title || '未记录标题'),
        h('button', { type: 'button', className: 'rt-btn', onClick: () => jumpToAsset({ id: w.asset_id, ip: w.ip }) }, w.ip),
        h('span', null, ' · ', [w.service, w.product, w.version].filter(Boolean).join(' ') || '未知服务'))
    }))
  return h('div', { className: 'rt-assets', 'data-view': view }, h('style', null, assetsCSS), toolbar, extraFilters, conclusion,
    state.error ? h('div', { className: 'rt-err', role: 'alert' }, state.error) : null,
    view === 'list' ? pane : h('div', { className: 'rt-assets-view' }, pane))
}

export { AssetsTab };
