// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { api } from './api.js';
import { copyWithFeedback, fmt } from './helpers.js';
import { POC_KIND_LABEL, POC_SOURCE_LABEL, POC_CAT_NAME, ROLE_LABEL, POC_CAT_ORDER } from './labels.js';
import { PurgeSelect } from '../../components/PurgeSelect';

function KnowledgeTab(props) {
  const refreshKey = props.refreshKey || 0
  const [data, setData] = React.useState(null)
  const [err, setErr] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [msg, setMsg] = React.useState(null)
  const [q, setQ] = React.useState('')
  const [kind, setKind] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [engagement, setEngagement] = React.useState('')
  const [assetTarget, setAssetTarget] = React.useState('')
  const [grouped, setGrouped] = React.useState(true)
  const [verifiedOnly, setVerifiedOnly] = React.useState(false)
  const [openId, setOpenId] = React.useState(null)
  const [detail, setDetail] = React.useState(null)
  const [detailBusy, setDetailBusy] = React.useState(false)
  const [tplOffset, setTplOffset] = React.useState(0)
  const tplPageSize = 40

  const querySeq = React.useRef(0)
  const runQuery = React.useCallback((params) => {
    const my = ++querySeq.current
    setTplOffset(params.templateOffset || 0)
    setBusy(true); setMsg(null)
    api(Object.assign({ op: 'pocSearch', templateOffset: 0, templateLimit: 40 }, params)).then((r) => {
      if (my !== querySeq.current) return
      setBusy(false)
      if (!r || r.ok === false) { setErr((r && r.error) || '读取失败'); return }
      setErr(null); setData(r)
    }, (e) => { if (my === querySeq.current) { setBusy(false); setErr(String((e && e.message) || e)) } })
  }, [])
  const query = (over) => runQuery(Object.assign({
    q: q.trim() || undefined,
    kind: kind || undefined,
    category: category || undefined,
    engagement: engagement || undefined,
    asset_target: assetTarget.trim() || undefined,
    verified: verifiedOnly || undefined,
  }, over || {}))
  /* 首次进入与刷新键变化拉全量；编辑检索文字不触发请求。 */
  React.useEffect(() => {
    runQuery({})
    return () => { querySeq.current += 1 }
  }, [refreshKey, runQuery])

  const open = (id) => {
    if (openId === id) { setOpenId(null); setDetail(null); return }
    setOpenId(id); setDetail(null); setDetailBusy(true)
    api({ op: 'pocGet', id: id }).then((r) => {
      setDetailBusy(false)
      if (!r || r.ok === false) { setMsg({ err: (r && r.error) || '读取失败' }); return }
      setDetail(r)
    }, (e) => { setDetailBusy(false); setMsg({ err: String((e && e.message) || e) }) })
  }

  /* 同报告页：await 真实结果再提示 */
  const copy = (text, label) => copyWithFeedback(text, label, (okFlag, message) => {
    setMsg(okFlag ? { ok: message } : { err: message })
  })
  const recordUse = (row) => {
    api({ op: 'pocUse', id: row.id, used_on: '控制台手动标记' }).then(() => {
      setMsg({ ok: '已记一次复用：' + row.title })
      query()
    }, (e) => setMsg({ err: String((e && e.message) || e) }))
  }

  const stats = (data && data.stats) || { total: 0, verified: 0, reused: 0, byKind: [], bySource: [] }
  const items = (data && data.items) || []
  const tpl = (data && data.templates) || { dir: null, total: 0, matched: 0, offset: 0, items: [], byCategory: [] }
  const tplByCat = new Map((tpl.byCategory || []).map((c) => [c.code, c.n || 0]))
  const catShown = (c) => (c.n || 0) + (tplByCat.get(c.code) || 0)
  const tplItems = tpl.items || []
  const tplMatched = tpl.matched != null ? tpl.matched : tpl.total
  const tplStart = Number(tpl.offset) || 0
  const turnTpl = (next) => {
    const offset = Math.max(0, next)
    setTplOffset(offset)
    query({ templateOffset: offset })
  }

  const card = (x) => {
    const isOpen = openId === x.id
    const d = isOpen && detail && detail.id === x.id ? detail : null
    return h('div', { key: 'p' + x.id, className: 'rt-kb' + (isOpen ? ' open' : '') },
      h('div', {
        className: 'rt-kb-head', role: 'button', tabIndex: 0, 'aria-expanded': isOpen ? 'true' : 'false',
        onClick: () => open(x.id),
        onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(x.id) } },
      },
        h('span', { className: 'rt-sec-caret' }, isOpen ? '▾' : '▸'),
        h('span', { className: 'rt-kb-kind k-' + (x.kind || 'poc') }, POC_KIND_LABEL[x.kind] || x.kind || 'POC'),
        h('span', { className: 'rt-kb-title' }, x.title),
        x.cve ? h('span', { className: 'rt-tag rt-tag-passive' }, x.cve) : null,
        x.component ? h('span', { className: 'rt-tag' }, x.component) : null,
        x.verified === 1
          ? h('span', { className: 'rt-tag rt-tag-live' }, '已验证')
          : h('span', { className: 'rt-tag rt-tag-warn' }, '未验证'),
        h('div', { className: 'rt-spacer' }),
        h('span', { className: 'rt-tag' }, POC_SOURCE_LABEL[x.source] || x.source || '—'),
        x.hit_count ? h('span', { className: 'rt-tag' }, '复用 ' + x.hit_count) : null),
      /* 来源行：归类 · 影响版本 · 建立时间 · 来源靶标 · 发现资产 —— 一条知识"什么时候、
         在哪个单位的哪台资产上发现的"一眼可见 */
      h('div', { className: 'rt-kb-sub' },
        [x.category ? '归类 ' + (POC_CAT_NAME[x.category] || x.category) : null,
          x.versions ? '影响版本 ' + x.versions : null,
          x.language || null,
          x.tags || null,
          '建立时间 ' + fmt(x.created_at),
          (x.engagement_name || x.engagement_id) ? '来源靶标 ' + (x.engagement_name || x.engagement_id) : null,
          x.asset_target ? '发现资产 ' + x.asset_target : null,
          x.found_by_agent ? '发现角色 ' + (ROLE_LABEL[x.found_by_agent] || x.found_by_agent) : null,
          x.source_url ? '来源 ' + x.source_url : null].filter(Boolean).join(' · ')),
      isOpen
        ? h('div', { className: 'rt-kb-body' },
            detailBusy && !d ? h('div', { className: 'rt-empty' }, '读取中…') : null,
            d ? h('div', null,
              d.usage ? h('div', { className: 'rt-kv' }, h('b', null, '用法'), h('span', { className: 'rt-mono' }, d.usage)) : null,
              d.description ? h('div', { className: 'rt-kv' }, h('b', null, '说明'), h('span', null, d.description)) : null,
              d.verified_note ? h('div', { className: 'rt-kv' }, h('b', null, '验证证据'), h('span', null, d.verified_note)) : null,
              d.used_on ? h('div', { className: 'rt-kv' }, h('b', null, '最近使用'), h('span', null, d.used_on)) : null,
              d.path ? h('div', { className: 'rt-kv' }, h('b', null, '落盘'), h('span', { className: 'rt-mono' }, d.path)) : null,
              h('div', { className: 'rt-kb-actions' },
                h('button', { className: 'rt-btn', disabled: !d.content, onClick: () => copy(d.content || '', 'POC 正文') }, '复制正文'),
                h('button', { className: 'rt-btn', onClick: () => recordUse(x) }, '记一次复用'),
                d.source_url ? h('button', { className: 'rt-btn', onClick: () => copy(d.source_url, '来源链接') }, '复制来源') : null),
              d.content
                ? h('pre', { className: 'rt-rep-http' }, d.content.length > 12000 ? d.content.slice(0, 12000) + '\n…（已截断，完整内容见落盘文件）' : d.content)
                : h('div', { className: 'rt-empty' }, '这条只有元数据，没有正文 —— 拿到正文后用 redteam_poc_update 补上'))
            : null)
        : null)
  }

  /* 头部压成一行：计数用文本而不是一堆标签，省下的高度全给下方列表。 */
  const countText = stats.total + ' 条 · 已验证 ' + stats.verified + ' · 复用 ' + (stats.reused || 0)
    + (tpl.total ? ' · 模板 ' + tpl.total : '')
    + ((stats.uncategorized || 0) > 0 && (stats.uncategorized || 0) !== stats.total ? ' · 未归类 ' + stats.uncategorized : '');
  return h('div', { className: 'rt-main rt-kb-page' },
    h('div', { className: 'rt-kb-head' },
      h('div', { className: 'rt-kb-headline' },
        h('strong', null, '知识库 · POC / EXP'),
        h('span', {
          className: 'rt-kb-counts',
          title: '未归类的条目：智能体回填时用 redteam_poc_add 的 category 参数标一下',
        }, countText)),
      h('div', { className: 'rt-kb-head-actions' },
        h('button', { className: 'rt-btn' + (grouped ? ' rt-btn-primary' : ''), title: '按归类分组显示 / 平铺显示', onClick: () => setGrouped(!grouped) }, grouped ? '按归类分组' : '平铺显示'),
        h('button', { className: 'rt-btn', disabled: busy, onClick: () => query() }, busy ? '检索中…' : '刷新'))),
    /* 归类总览：点一下就是按该类筛选，一眼看清"哪类武器攒了多少、哪类还是空的" */
    h('div', { className: 'rt-kb-cats' },
      (stats.byCategory || []).filter((c) => catShown(c) > 0 || POC_CAT_ORDER.includes(c.code)).map((c) => h('span', {
        key: c.code,
        className: 'rt-concl-i' + (category === c.code ? ' on' : ''),
        title: (c.hint || POC_CAT_NAME[c.code] || c.code)
          + ' · 本机模板 ' + (tplByCat.get(c.code) || 0)
          + ' · 知识库 ' + (c.n || 0)
          + (c.verified ? '（已验证 ' + c.verified + '）' : ''),
        onClick: () => {
          const next = category === c.code ? '' : c.code
          setCategory(next)
          query({ category: next || undefined })
        },
      },
        h('b', null, String(catShown(c))),
        h('span', null, (POC_CAT_NAME[c.code] || c.code) + (c.verified ? '（已验证 ' + c.verified + '）' : ''))))),
    h('div', { className: 'rt-kb-filter' },
      h('input', {
        className: 'rt-input', style: { flex: 1, minWidth: 140 }, placeholder: '搜 CVE / 组件 / 关键字（正文也会搜）',
        value: q, onChange: (e) => setQ(e.target.value),
        onKeyDown: (e) => { if (e.key === 'Enter') query() },
      }),
      h(PurgeSelect, {
        'aria-label': '归类筛选', size: 'sm', className: 'rt-kb-select', value: category,
        onChange: (value) => { setCategory(value); query({ category: value || undefined }) },
        options: [{ value: '', label: '全部归类' }].concat(POC_CAT_ORDER.map((k) => ({ value: k, label: POC_CAT_NAME[k] }))),
      }),
      h(PurgeSelect, {
        'aria-label': '来源靶标筛选', size: 'sm', className: 'rt-kb-select', value: engagement,
        onChange: (value) => { setEngagement(value); query({ engagement: value || undefined }) },
        options: [{ value: '', label: '全部来源靶标' }].concat((stats.byEngagement || []).map((e) => ({ value: e.engagement, label: e.engagement + '（' + e.n + '）' }))),
      }),
      h('input', {
        className: 'rt-input', style: { width: 120 }, placeholder: '发现资产筛选',
        value: assetTarget, onChange: (e) => setAssetTarget(e.target.value),
        onKeyDown: (e) => { if (e.key === 'Enter') query() },
      }),
      h(PurgeSelect, {
        'aria-label': '类型筛选', size: 'sm', className: 'rt-kb-select', value: kind,
        onChange: (value) => { setKind(value); query({ kind: value || undefined }) },
        options: [{ value: '', label: '全部类型' }].concat(Object.keys(POC_KIND_LABEL).map((k) => ({ value: k, label: POC_KIND_LABEL[k] }))),
      }),
      h('label', { className: 'rt-kb-check' },
        h('input', { type: 'checkbox', checked: verifiedOnly, onChange: (e) => { setVerifiedOnly(e.target.checked); query({ verified: e.target.checked || undefined }) } }),
        '只看已验证'),
      h('button', { className: 'rt-btn rt-btn-primary', onClick: () => query() }, '检索')),
    items.length >= 200 && (stats.total || 0) > items.length
      ? h('div', { className: 'rt-hint', role: 'status' },
        '当前显示前 ' + items.length + ' 条（单次上限 200）；更多请用 redteam_poc_search 过滤或分页。')
      : null,
    msg ? h('div', { className: msg.err ? 'rt-err' : 'rt-foot' }, msg.err || msg.ok) : null,
    err ? h('div', { className: 'rt-err' },
      /engagement required|unknown op/i.test(err)
        /* 老 host 还没有知识库接口：讲清怎么恢复，别让人对着 "engagement required" 发懵 */
        ? '知识库接口由 host 侧提供，当前宿主还是旧进程 —— 请完全退出后重新打开（官方 exe / 社区版 / dsh web 任一），再刷新页面。'
        : err) : null,
    !err && data && data.dbPath
      ? h('div', { className: 'rt-foot', style: { marginBottom: 6, fontSize: 11 } },
          '知识库：' + data.dbPath
          + (data.root ? '（根目录 ' + data.root + '）' : ''))
      : null,
    h('div', { className: 'rt-table' },
      (() => {
        if (!grouped) return items.map(card)
        /* 分组渲染：按内置归类顺序，未知归类挂到末尾的「其它」 */
        const buckets = new Map()
        for (const x of items) {
          const code = POC_CAT_NAME[x.category] ? x.category : 'other'
          if (!buckets.has(code)) buckets.set(code, [])
          buckets.get(code).push(x)
        }
        const order = POC_CAT_ORDER.filter((c) => buckets.has(c))
        for (const code of buckets.keys()) if (!order.includes(code)) order.push(code)
        const out = []
        for (const code of order) {
          const list = buckets.get(code)
          out.push(h('div', { key: 'g' + code, className: 'rt-kb-cat' },
            h('span', { className: 'rt-kb-cat-name' }, POC_CAT_NAME[code] || code),
            h('span', { className: 'rt-tag' }, list.length + ' 条'),
            h('span', { className: 'rt-tag rt-tag-live' }, '已验证 ' + list.filter((x) => x.verified === 1).length),
            h('span', { className: 'rt-spacer' }),
            h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)' } },
              '最近建立 ' + fmt(list.map((x) => x.created_at).filter(Boolean).sort().pop()))))
          for (const x of list) out.push(card(x))
        }
        return out
      })(),
      tplItems.length
        ? h('div', { className: 'rt-kb-tpl' },
            h('div', { className: 'rt-ap-sub' },
              '本机 nuclei 模板 · ' + (tplStart + 1) + '–' + (tplStart + tplItems.length) + ' / ' + tplMatched
              + '（直接 `nuclei -t <模板路径>`）'),
            tplItems.map((t, i) => h('div', { key: 't' + tplStart + '-' + i, className: 'rt-kb-tpl-row' },
              h('span', { className: 'rt-tag' }, t.severity || '—'),
              t.category ? h('span', { className: 'rt-tag' }, POC_CAT_NAME[t.category] || t.category) : null,
              h('span', { className: 'rt-mono rt-kb-tpl-path', title: t.path }, t.path),
              h('span', { className: 'rt-kb-tpl-name', title: t.name }, t.name || ''),
              h('button', {
                className: 'rt-btn', style: { padding: '0 6px', fontSize: 10.5 },
                onClick: () => copy('nuclei -t ' + t.path + ' -u <目标>', '模板命令'),
              }, '复制命令'))),
            h('div', { className: 'rt-kb-actions' },
              h('button', {
                className: 'rt-btn', disabled: busy || tplStart <= 0,
                onClick: () => turnTpl(tplStart - tplPageSize),
              }, '上一页'),
              h('button', {
                className: 'rt-btn', disabled: busy || tplStart + tplItems.length >= tplMatched,
                onClick: () => turnTpl(tplStart + tplPageSize),
              }, '下一页')),
            tpl.dir ? h('div', { className: 'rt-foot' }, h('span', null, '模板目录：' + tpl.dir)) : null)
        : null,
      data === null ? h('div', { className: 'rt-empty' }, '加载中…') : null,
      data !== null && !items.length && !tplItems.length
        ? h('div', { className: 'rt-empty' },
            h('div', null,
              q || kind || verifiedOnly
                ? '没有命中：换个关键字再试，或去互联网找 / 自己手搓后回填。'
                : (tpl.total
                  ? ('POC/EXP 库还是空的；本机已有 ' + tpl.total + ' 个 nuclei 模板，但这一页没有列出来。请完全退出后重新打开客户端。')
                  : (tpl.dir
                    ? '知识库还是空的（本机模板目录存在但没有 yaml，请跑 nuclei -update-templates）。'
                    : '知识库还是空的。本机也还没有 nuclei 模板库 —— 在演练机上跑 setup.sh 或 `nuclei -update-templates`，装好后这里会出现「本机模板 N」。'))),
            h('div', { style: { marginTop: 6, fontSize: 12 } },
              '打 Nday/1day 的标准顺序：① redteam_poc_search 先查这里（顺带搜本机 nuclei 模板库）→ ② 都没有就互联网搜索（web_search / GitHub / ExploitDB / 厂商公告）或自己手搓 → ③ 在真实目标上验证有效后 redteam_poc_add 回填，后面的靶标直接就能用。'),
            data.dbPath ? h('div', { style: { marginTop: 6, fontSize: 11 }, className: 'rt-mono' }, '知识库文件：' + data.dbPath) : null,
            tpl.dir ? h('div', { style: { marginTop: 6, fontSize: 11 }, className: 'rt-mono' }, '模板目录：' + tpl.dir) : null)
        : null),
    h('div', { className: 'rt-foot' },
      h('span', null, '全局共享（跨靶标）｜ 落盘：pocs/<code>/ ｜ 只收录通用可复用的 POC/EXP，靶标专用脚本走「攻击文件」')))
}

export { KnowledgeTab };
