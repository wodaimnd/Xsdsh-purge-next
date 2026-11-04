// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { useCollapse, Clip, Section } from './primitives.js';
import { api } from './api.js';
import { TEST_STATUS_LABEL } from './labels.js';
import { fmt } from './helpers.js';

function TestingTab(props) {
  const eng = props.engagement
  const refreshKey = props.refreshKey || 0
  const [data, setData] = React.useState(null)
  const [err, setErr] = React.useState(null)
  const [at, setAt] = React.useState(null)
  const [auto, setAuto] = React.useState(true)
  /* 折叠状态按「页签 + 靶标」记忆；正在测永远常显，不参与折叠 */
  const collapse = useCollapse('testing:' + eng)

  /* 5 秒轮询要有在途守卫：网络慢或后端卡住时，请求会越堆越多、
     而且旧响应回来会覆盖新状态（界面上表现为数字来回跳）。 */
  const inflight = React.useRef(false)
  const seq = React.useRef(0)
  const load = React.useCallback(() => {
    if (!eng || inflight.current) return
    inflight.current = true
    const my = ++seq.current
    api({ op: 'activeTests', engagement: eng, limit: 20 }).then((r) => {
      if (my !== seq.current) return          /* 切了靶标：这条已经过期，丢掉 */
      if (!r || r.ok === false) { setErr((r && r.error) || '读取失败'); return }
      setErr(null); setData(r); setAt(new Date())
    }, (e) => { if (my === seq.current) setErr(String((e && e.message) || e)) })
      .finally(() => { if (my === seq.current) inflight.current = false })
  }, [eng])
  React.useEffect(() => {
    seq.current += 1
    inflight.current = false
    setData(null)
    setErr(null)
    load()
    return () => { seq.current += 1; inflight.current = false }
  }, [eng, refreshKey, load])
  React.useEffect(() => {
    if (!eng || !auto) return undefined
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      load()
    }, 5000)
    return () => clearInterval(timer)
  }, [eng, auto, refreshKey, load])

  const testing = (data && data.testing) || []
  const recent = (data && data.recent) || []
  const queue = (data && data.queue) || []
  const stats = (data && data.stats) || {}

  /* 一台资产一张卡：一眼看清"打的是谁、打到哪、拿到什么" */
  const card = (a, past) => {
    const chips = []
    chips.push(h('span', { key: 'sc', className: 'rt-scope rt-scope-' + (a.scope === 'internal' ? 'internal' : 'external') },
      a.scope === 'internal' ? '内网' : '外网'))
    if (a.segment_cidr) chips.push(h('span', { key: 'seg', className: 'rt-tag' }, a.segment_cidr))
    if (a.open_ports) chips.push(h('span', { key: 'p', className: 'rt-tag rt-tag-active' }, '开放 ' + a.open_ports + ' 端口'))
    if (a.vulns) chips.push(h('span', { key: 'v', className: 'rt-tag rt-tag-live' }, '已确认漏洞 ' + a.vulns))
    if (a.webshells) chips.push(h('span', { key: 'w', className: 'rt-tag rt-tag-passive' }, 'WebShell ' + a.webshells))
    if (a.tunnels) chips.push(h('span', { key: 't', className: 'rt-tag rt-tag-passive' }, '隧道 ' + a.tunnels))
    if (a.priority) chips.push(h('span', { key: 'pr', className: 'rt-tag' }, '易打 ' + a.priority))
    if (a.blocked_count) chips.push(h('span', { key: 'b', className: 'rt-tag', style: { color: '#ef4444', borderColor: '#ef444455' } }, '被封 ' + a.blocked_count + ' 次'))
    const noteLines = a.test_notes
      ? String(a.test_notes).split('\n').slice(-3).map((l) => (l.length > 240 ? l.slice(0, 240) + ' …' : l))
      : []
    return h('div', { key: 'at' + a.id, className: 'rt-atest' + (past ? ' past' : '') },
      h('div', { className: 'rt-atest-head' },
        past ? null : h('span', { className: 'rt-live-dot' }),
        h('span', { className: 'rt-atest-ip' }, a.ip),
        h('span', { className: 'rt-tag ' + (a.test_status === 'testing' ? 'rt-tag-live' : '') }, TEST_STATUS_LABEL[a.test_status] || a.test_status),
        h('div', { className: 'rt-spacer' }),
        h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)' } },
          fmt(a.test_updated_at) + (a.test_updated_by ? ' · ' + a.test_updated_by : ''))),
      chips.length ? h('div', null, chips) : null,
      a.test_surface ? h('div', { className: 'rt-atest-meta' }, '测试面：' + a.test_surface) : null,
      a.potential ? h('div', { className: 'rt-atest-meta' }, '预期得分：' + a.potential) : null,
      noteLines.length ? h(Clip, { label: '测试记录', text: noteLines.join('\n') }) : null)
  }


  const concl = (label, value, tone) => h('span', { key: label, className: 'rt-concl-i', style: { cursor: 'default' } },
    h('b', null, String(value || 0)), h('span', null, label))
  const conclusion = h('div', { className: 'rt-concl' },
    concl('测试中', stats.testing, 'live'),
    concl('待测', stats.untested, ''),
    concl('已测', stats.tested, ''),
    concl('放弃', (stats.abandoned || 0) + (stats.blocked || 0), ''),
    concl('无攻击面', stats.no_surface, ''),
    h('div', { className: 'rt-spacer' }),
    at ? h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)' } },
      '更新于 ' + at.toLocaleTimeString('zh-CN', { hour12: false })) : null,
    h('button', {
      className: 'rt-btn', style: { padding: '0 7px', fontSize: 11 }, title: '展开最近动过与待测队列',
      onClick: () => collapse.setAll(['testing:' + eng, 'recent:' + eng, 'queue:' + eng], true),
    }, '全部展开'),
    h('button', {
      className: 'rt-btn', style: { padding: '0 7px', fontSize: 11 }, title: '只留正在测',
      onClick: () => collapse.setAll(['testing:' + eng, 'recent:' + eng, 'queue:' + eng], false),
    }, '全部收起'),
    h('button', {
      className: 'rt-btn' + (auto ? ' rt-btn-primary' : ''), style: { padding: '0 7px', fontSize: 11 },
      title: '每 5 秒自动刷新', onClick: () => setAuto((x) => !x),
    }, auto ? '实时 · 5s' : '已暂停'),
    h('button', { className: 'rt-btn', style: { padding: '0 7px', fontSize: 11 }, onClick: load }, '刷新'))

  const body = []
  /* 正在测：常显分组，首次打开折叠，展开状态按靶标记忆 */
  body.push(h(Section, {
    key: 'testing', tone: 'test', title: '正在测',
    count: testing.length + ' 台',
    sub: testing.length ? 'agent 正在打这些资产' : 'agent 开始测某台资产后会实时出现在这里',
    open: collapse.isOpen('testing:' + eng),
    onToggle: collapse.toggle('testing:' + eng),
  }, testing.length
    ? testing.map((a) => card(a, false))
    : h('div', { className: 'rt-atest-meta', style: { paddingBottom: 4 } }, '当前没有资产处于「测试中」')))

  /* 最近动过（默认折叠，可记忆） */
  body.push(h(Section, {
    key: 'recent', tone: 'past', title: '最近动过', count: recent.length + ' 台',
    sub: '已测过的资产',
    open: collapse.isOpen('recent:' + eng, false),
    onToggle: collapse.toggle('recent:' + eng, false),
  }, recent.length ? recent.map((a) => card(a, true)) : h('div', { className: 'rt-atest-meta' }, '暂无')))

  /* 待测队列（默认折叠，可记忆） */
  body.push(h(Section, {
    key: 'queue', tone: 'queue', title: '待测队列',
    count: (data ? (data.untested || 0) : 0) + ' 台',
    sub: '按易打性与端口数排出先打哪几台',
    open: collapse.isOpen('queue:' + eng, false),
    onToggle: collapse.toggle('queue:' + eng, false),
  }, queue.length
    ? queue.map((a) => card(a, true)).concat([
        h('div', { key: 'queueHint', className: 'rt-atest-meta', style: { paddingTop: 4 } },
          '完整清单（含筛选与排序）见「资产测绘」页')])
    : h('div', { className: 'rt-atest-meta' }, '没有待测资产')))

  return h('div', { className: 'rt-main' },
    conclusion,
    err ? h('div', { className: 'rt-err' }, err) : null,
    data === null && !err ? h('div', { className: 'rt-empty' }, '加载中…') : null,
    h('div', { className: 'rt-body', style: { overflow: 'auto' } },
      h('div', { style: { padding: '6px 12px 14px' } }, body)))
}

export { TestingTab };
