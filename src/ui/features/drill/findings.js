// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { useCollapse, Section } from './primitives.js';
import { api } from './api.js';
import { STATUS_LABEL, sevClass, SEV_LABEL } from './labels.js';
import { clickable, fmt, targetKeyOf, copyText } from './helpers.js';
import { detailEvidence } from './evidence.js';
import { AttackFilesTab } from './attack-files.js';
import { PurgeSelect } from '../../components/PurgeSelect';

function FindingsTab(props) {
  const eng = props.engagement
  const refreshKey = props.refreshKey || 0
  const [sev, setSev] = React.useState('')
  const [status, setStatus] = React.useState('')
  const [q, setQ] = React.useState('')
  const [qApplied, setQApplied] = React.useState('')
  const [state, setState] = React.useState({ loading: false, error: null, total: 0, items: [], stats: null })
  const [creds, setCreds] = React.useState([])
  const [accesses, setAccesses] = React.useState([])
  const [files, setFiles] = React.useState([])
  const [openId, setOpenId] = React.useState(null)
  const [msg, setMsg] = React.useState(null)
  /* 子页签：漏洞 / 凭据 / 访问会话（凭据不再铺在漏洞页底部） */
  const [subTab, setSubTab] = React.useState('vulns')
  /* 默认按目标聚合：322 条平铺没法读，先看"哪台被打下什么" */
  const [grouped, setGrouped] = React.useState(true)
  const collapse = useCollapse('findings:' + eng)

  const load = () => {
    if (!eng) return
    api({
      op: 'vulns', engagement: eng, severity: sev || undefined,
      status: status || undefined, q: qApplied || undefined, limit: 200,
    }).then((r) => {
      if (!r || r.ok === false) {
        setState({ loading: false, error: (r && r.error) || '查询失败', total: 0, items: [], stats: null })
        return
      }
      setState({ loading: false, error: null, total: r.total, items: r.items || [], stats: r.stats || null })
    }, (e) => setState({ loading: false, error: String((e && e.message) || e), total: 0, items: [], stats: null }))
    api({ op: 'credentials', engagement: eng }).then((r) => setCreds((r && r.items) || []), () => {})
    api({ op: 'access', engagement: eng }).then((r) => setAccesses((r && r.items) || []), () => {})
    api({ op: 'attackFiles', engagement: eng }).then((r) => setFiles((r && r.items) || []), () => {})
  }
  React.useEffect(load, [eng, sev, status, qApplied, refreshKey])

  const setVulnStatus = (id, next) => {
    setMsg(null)
    api({ op: 'updateVuln', engagement: eng, id: id, patch: { status: next } }).then((r) => {
      if (!r || r.ok === false) { setMsg({ err: (r && r.error) || '更新失败' }); return }
      setMsg({ ok: '已更新为「' + (STATUS_LABEL[next] || next) + '」' })
      load()
    }, (e) => setMsg({ err: String((e && e.message) || e) }))
  }

  const stats = (state.stats && state.stats.bySeverity) ? state.stats : { bySeverity: {}, byStatus: {} }
  const needRestart = state.error !== null && String(state.error).indexOf('unknown op') >= 0

  const allFiles = (files || []).flatMap((g) => (g.files || []).map((f) => Object.assign({ target: g.target }, f)))
  const filesByVuln = new Map()
  const orphanFiles = []
  for (const f of allFiles) {
    const vid = f.vuln_id === null || f.vuln_id === undefined ? null : Number(f.vuln_id)
    if (vid === null) { orphanFiles.push(f); continue }
    if (!filesByVuln.has(vid)) filesByVuln.set(vid, [])
    filesByVuln.get(vid).push(f)
  }

  /* ── 结论行：只给结论，数字点一下就是筛选 ─────────────────────── */
  const concl = (key, label, value, active, onClick) => h('span', Object.assign({
    key: key, className: 'rt-concl-i' + (active ? ' on' : ''), title: '点击筛选 / 再点取消',
  }, clickable(onClick, { label: '按「' + label + '」筛选（' + (value || 0) + '）', expanded: active })),
    h('b', null, String(value || 0)), h('span', null, label))
  const conclusion = h('div', { className: 'rt-concl' },
    concl('conf', '已确认', (stats.byStatus.confirmed || 0), status === 'confirmed', () => setStatus((v) => (v === 'confirmed' ? '' : 'confirmed'))),
    concl('exp', '已利用', (stats.byStatus.exploited || 0), status === 'exploited', () => setStatus((v) => (v === 'exploited' ? '' : 'exploited'))),
    concl('crit', '严重', (stats.bySeverity.critical || 0), sev === 'critical', () => setSev((v) => (v === 'critical' ? '' : 'critical'))),
    concl('high', '高危', (stats.bySeverity.high || 0), sev === 'high', () => setSev((v) => (v === 'high' ? '' : 'high'))),
    concl('med', '中危', (stats.bySeverity.medium || 0), sev === 'medium', () => setSev((v) => (v === 'medium' ? '' : 'medium'))),
    concl('gain', '拿到权限', (stats.withGained || 0), false, () => {}),
    h('div', { className: 'rt-spacer' }),
    h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)' } },
      '默认按目标聚合 · 共 ' + (stats.targetGroups || 0) + ' 个目标'))
  const capHint = (state.total || 0) > state.items.length
    ? h('div', { className: 'rt-hint', role: 'status' },
      '共 ' + state.total + ' 条，当前仅显示前 ' + state.items.length + ' 条；完整结果请用 redteam_vuln_query 按等级/状态/关键字过滤。')
    : null

  const head = h('div', { className: 'rt-vrow head' },
    h('span', null, '等级'), h('span', null, '漏洞 / 编号'), h('span', null, '目标'),
    h('span', null, '拿到什么'), h('span', null, '状态'), h('span', null, '置信'))

  /* 单条漏洞（行 + 展开详情），聚合视图与平铺视图共用 */
  const vulnRows = (v, compact) => {
    const out = []
    const gainedList = String(v.gained || '').split(/[、,;，；]/).map((x) => x.trim()).filter(Boolean)
    const open = openId === v.id
    out.push(h('div', {
      key: 'v' + v.id, className: 'rt-vrow', role: 'button', tabIndex: 0,
      style: compact ? { cursor: 'pointer', gridTemplateColumns: '58px minmax(0,1fr) 104px 68px' } : { cursor: 'pointer' },
      onClick: () => setOpenId(open ? null : v.id),
      onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenId(open ? null : v.id) } },
    },
      h('span', null, h('span', { className: sevClass(v.severity) }, SEV_LABEL[v.severity] || v.severity)),
      h('span', { title: v.title || '' }, h('span', { className: 'rt-sec-caret' }, open ? '▾' : '▸'), (v.cve ? v.cve + ' ' : '') + (v.title || '')),
      compact ? null : h('span', { className: 'rt-mono', title: v.target || '' }, v.target || v.asset_ip || '—'),
      h('span', { title: v.gained || '' },
        gainedList.length
          ? h('span', { className: 'rt-gain', style: { maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' } }, gainedList[0] + (gainedList.length > 1 ? ' +' + (gainedList.length - 1) : ''))
          : h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, '—')),
      h('span', null, h('span', { className: 'rt-tag' }, STATUS_LABEL[v.status] || v.status)),
      compact ? null : h('span', null, v.confidence === null || v.confidence === undefined ? '—' : Math.round(v.confidence * 100) + '%')))
    if (openId !== v.id) return out
    out.push(h('div', {
      key: 'vd' + v.id, className: 'rt-vrow',
      style: { cursor: 'default', gridTemplateColumns: '1fr' },
    }, h('div', { className: 'rt-vdetail' },
      h('div', { className: 'rt-kv' }, h('b', null, '拿到什么'),
        gainedList.length
          ? h('span', null, gainedList.map((g, gi) => h('span', { key: 'g' + gi, className: 'rt-gain', style: { marginRight: 6 } }, g)))
          : h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } },
              '未记录 —— 拿到权限/成果后请用 redteam_vuln_update 补 gained（例：服务器权限、内网隧道、后台管理员账号）')),
      h('div', { className: 'rt-kv' }, h('b', null, '目标'), h('span', { className: 'rt-mono', style: { wordBreak: 'break-all' } }, v.target || '—')),
      h('div', { className: 'rt-kv' }, h('b', null, '资产'), h('span', null, (v.asset_ip || '—') + ' · ' + (v.segment_cidr || ''))),
      h('div', { className: 'rt-kv' }, h('b', null, '来源'), h('span', null, (v.source || '—') + ' · ' + (v.found_by_agent || '—') + ' · ' + fmt(v.found_at))),
      detailEvidence(v),
      (() => {
        const mine = filesByVuln.get(Number(v.id)) || []
        return h('div', { className: 'rt-kv' }, h('b', null, '攻击文件'),
          mine.length
            ? h('span', null, mine.map((f, fi) => h('div', { key: 'af' + fi, style: { marginBottom: 3 } },
                '· ' + (f.kind ? '[' + f.kind + '] ' : '') + (f.name || '(未命名)')
                + (f.description ? ' — ' + f.description : ''),
                h('div', { className: 'rt-mono', style: { fontSize: 11, marginLeft: 12, color: 'var(--dsw-alias-label-secondary)', overflowWrap: 'anywhere' } }, f.path || ''))))
            : h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } },
                '（无）用 redteam_attack_file_add 把这条漏洞打通的脚本/马/EXP 归档，并带上 vuln_id'))
      })(),
      h('div', { className: 'rt-actions' },
        h('button', { className: 'rt-btn', onClick: (e) => { e.stopPropagation(); setVulnStatus(v.id, 'confirmed') } }, '确认'),
        h('button', { className: 'rt-btn', onClick: (e) => { e.stopPropagation(); setVulnStatus(v.id, 'exploited') } }, '已利用'),
        h('button', { className: 'rt-btn', onClick: (e) => { e.stopPropagation(); setVulnStatus(v.id, 'false-positive') } }, '误报'),
        h('button', { className: 'rt-btn', onClick: (e) => { e.stopPropagation(); setVulnStatus(v.id, 'fixed') } }, '已修复')))))
    return out
  }

  const rows = []
  if (grouped) {
    /* 按目标聚合成组：先看"哪台被打下什么"，再点进去看具体漏洞 */
    const groups = new Map()
    for (const v of state.items) {
      const key = targetKeyOf(v)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(v)
    }
    const SEV_RANK = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    const list = Array.from(groups.entries()).map(([key, vs]) => ({
      key,
      vulns: vs,
      top: vs.slice().sort((a, b) => (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9))[0],
      gained: Array.from(new Set(vs.flatMap((v) => String(v.gained || '').split(/[、,;，；]/).map((x) => x.trim()).filter(Boolean)))),
      exploited: vs.filter((v) => v.status === 'exploited').length,
    })).sort((a, b) => (SEV_RANK[a.top.severity] ?? 9) - (SEV_RANK[b.top.severity] ?? 9) || b.vulns.length - a.vulns.length)
    for (const g of list) {
      const key = 'target:' + g.key
      const defOpen = false
      rows.push(h(Section, {
        key: 'sec:' + g.key, tone: 'target',
        title: g.key,
        count: g.vulns.length + ' 个漏洞',
        sub: [
          SEV_LABEL[g.top.severity] || g.top.severity,
          g.exploited ? '已利用 ' + g.exploited : null,
          g.top.asset_ip && g.top.asset_ip !== g.key ? '资产 ' + g.top.asset_ip : null,
        ].filter(Boolean).join(' · '),
        right: g.gained.length
          ? g.gained.slice(0, 2).join(' / ') + (g.gained.length > 2 ? ' +' + (g.gained.length - 2) : '')
          : '未记录权限',
        open: collapse.isOpen(key, defOpen),
        onToggle: collapse.toggle(key, defOpen),
      }, g.vulns.map((v) => vulnRows(v, true))))
    }
    if (!list.length && !state.loading && !state.error) {
      rows.push(h('div', { key: 'none', className: 'rt-empty' }, '暂无漏洞记录'))
    }
  } else {
    for (const v of state.items) rows.push(...vulnRows(v))
  }

  const toolbar = h('div', { className: 'rt-toolbar' },
    h('input', {
      className: 'rt-input', style: { flex: '1 1 140px' }, placeholder: '搜索标题 / CVE / 目标（回车）',
      value: q, onChange: (e) => setQ(e.target.value),
      onKeyDown: (e) => { if (e.key === 'Enter') setQApplied(q) },
    }),
    h('button', { className: 'rt-btn', onClick: () => setQApplied(q) }, '搜索'),
    h(PurgeSelect, {
      'aria-label': '等级筛选', size: 'sm', value: sev, onChange: setSev,
      options: [['', '全部等级'], ['critical', '严重'], ['high', '高危'], ['medium', '中危'], ['low', '低危'], ['info', '信息']]
        .map(([value, label]) => ({ value, label })),
    }),
    h(PurgeSelect, {
      'aria-label': '状态筛选', size: 'sm', value: status, onChange: setStatus,
      options: [['', '全部状态'], ['candidate', '待验证'], ['confirmed', '已确认'], ['exploited', '已利用'], ['false-positive', '误报'], ['fixed', '已修复']]
        .map(([value, label]) => ({ value, label })),
    }))

  const credSection = h('div', null,
    h('div', { className: 'rt-section' }, '凭据 · ' + creds.length + (creds.length ? '（明文直显，注意屏幕分享/录屏）' : '')),
    creds.length
      ? h('div', { style: { padding: '4px 10px 0' } }, creds.map((c) => h('div', { key: 'c' + c.id, className: 'rt-cred' },
          h('div', { className: 'rt-cred-head' },
            h('span', { className: 'rt-cred-host' }, c.host),
            c.username ? h('span', { className: 'rt-tag' }, c.username) : null,
            h('span', { className: 'rt-tag rt-tag-passive' }, c.secret_type || 'password'),
            c.privilege ? h('span', { className: 'rt-tag rt-tag-active' }, c.privilege) : null,
            h('div', { className: 'rt-spacer' }),
            h('button', {
              className: 'rt-btn', style: { padding: '0 6px', fontSize: 11 },
              onClick: (e) => { e.stopPropagation(); copyText(String(c.secret_value || '')) },
            }, '复制')),
          c.secret_value
            ? h('div', { className: 'rt-secret', title: '点击可全选' }, c.secret_value)
            : h('div', { className: 'rt-secret-none' }, '未记明文 —— 请用 redteam_credential_add 的 secret_value 补上，面板才能直显'),
          h('div', { className: 'rt-cred-meta' },
            [c.source ? '来源 ' + c.source : null,
              c.tool ? '工具 ' + c.tool : null,
              c.secret_ref ? '证据 ' + c.secret_ref : null,
              c.found_by_agent ? 'by ' + c.found_by_agent : null,
              c.found_at ? fmt(c.found_at) : null].filter(Boolean).join(' · ')),
          c.note ? h('div', { className: 'rt-cred-meta' }, '备注：' + c.note) : null)))
      : h('div', { className: 'rt-empty' }, '暂无凭据（拿到口令/密钥/Hash 后用 redteam_credential_add 落库，秒级可复用）'))

  const accessSection = h('div', null,
    h('div', { className: 'rt-section' }, '已获得访问会话 · ' + accesses.length),
    accesses.length
      ? accesses.map((a) => h('div', { key: 'a' + a.id, className: 'rt-vrow', style: { cursor: 'default', gridTemplateColumns: '1fr 110px 80px 80px 1fr' } },
          h('span', { className: 'rt-mono' }, a.host),
          h('span', null, a.username || '—'),
          h('span', null, h('span', { className: 'rt-tag rt-tag-active' }, a.method || '—')),
          h('span', null, a.privilege || '—'),
          h('span', { className: 'rt-mono', title: a.session_ref || '' }, a.session_ref || '—')))
      : h('div', { className: 'rt-empty' }, '暂无'))

  const subTabBtn = (key, label, n) => h('span', Object.assign({
    className: 'rt-subtab' + (subTab === key ? ' on' : ''),
  }, clickable(() => setSubTab(key), { label: label + '（' + n + '）', expanded: subTab === key })),
  label + ' ' + n)

  return h('div', { className: 'rt-main' }, toolbar, conclusion, capHint,
    h('div', { className: 'rt-subtabs' },
      subTabBtn('vulns', '漏洞', state.total || 0),
      subTabBtn('files', '攻击文件', allFiles.length),
      subTabBtn('creds', '凭据', creds.length),
      subTabBtn('access', '访问会话', accesses.length),
      h('div', { className: 'rt-spacer' }),
      grouped ? h('button', {
        className: 'rt-btn', title: '展开所有目标',
        onClick: () => collapse.setAll((state.items || []).map((v) => 'target:' + targetKeyOf(v)), true),
      }, '全部展开') : null,
      grouped ? h('button', {
        className: 'rt-btn', title: '收起所有目标',
        onClick: () => collapse.setAll((state.items || []).map((v) => 'target:' + targetKeyOf(v)), false),
      }, '全部收起') : null,
      h('button', {
        className: 'rt-btn' + (grouped ? ' rt-btn-primary' : ''),
        title: grouped ? '当前：按目标聚合（先看哪台被打下什么）' : '当前：平铺每条漏洞',
        onClick: () => setGrouped((g) => !g),
      }, grouped ? '按目标聚合' : '平铺列表')),
    msg ? h('div', { className: msg.err ? 'rt-err' : 'rt-foot' }, msg.err || msg.ok) : null,
    needRestart ? h('div', { className: 'rt-empty' }, '该模块的宿主代码已更新，需重启一次当前宿主（官方 exe / 社区版 / dsh web）后生效') : null,
    state.error && !needRestart ? h('div', { className: 'rt-err' }, state.error) : null,
    subTab === 'files'
      ? h('div', { className: 'rt-body', style: { overflow: 'auto' } },
          h('div', { className: 'rt-hint', style: { marginBottom: 8 } },
            '攻击文件按靶标目录组织（原「攻击文件」页签）；每条漏洞的关联文件也能在该漏洞详情里直接看到。'
            + (orphanFiles.length ? ' 目前有 ' + orphanFiles.length + ' 个文件没挂 vuln_id，建议补上以便与漏洞对应。' : '')),
          h(AttackFilesTab, { engagement: eng, refreshKey: refreshKey }))
      : subTab === 'creds'
      ? h('div', { className: 'rt-body', style: { overflow: 'auto' } }, credSection)
      : subTab === 'access'
        ? h('div', { className: 'rt-body', style: { overflow: 'auto' } }, accessSection)
        : h('div', { className: 'rt-table' }, grouped ? null : head, rows,
            /* 分组视图的空态已由上面 rows 里的 'none' 行给出，这里只补平铺视图的。 */
            !grouped && !state.loading && !state.items.length && !state.error ? h('div', { className: 'rt-empty' }, '暂无漏洞记录') : null))
}

export { FindingsTab };
