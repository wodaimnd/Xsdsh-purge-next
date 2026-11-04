// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { api } from './api.js';
import { fmt } from './helpers.js';
import { Clip } from './primitives.js';

function ChainTab(props) {
  const eng = props.engagement
  const refreshKey = props.refreshKey || 0
  const [data, setData] = React.useState(null)
  const [err, setErr] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [view, setView] = React.useState('A')
  const [openId, setOpenId] = React.useState(null)

  const load = () => {
    if (!eng) return
    setLoading(true)
    api({ op: 'scoreChain', engagement: eng }).then((r) => {
      setLoading(false)
      if (!r || r.ok === false) { setErr((r && r.error) || '读取失败'); return }
      setErr(null); setData(r)
    }, (e) => { setLoading(false); setErr(String((e && e.message) || e)) })
  }
  React.useEffect(load, [eng, refreshKey])

  const stages = (data && data.stages) || []
  const summary = (data && data.summary) || null
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id))
  const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥']

  /* 单次得分的详情 */
  const hitDetail = (x) => h('div', { className: 'rt-flow-detail' },
    h('div', { className: 'rt-kv' }, h('b', null, '目标'), h('span', { className: 'rt-mono', style: { wordBreak: 'break-all' } }, x.target || '—')),
    x.asset_ip ? h('div', { className: 'rt-kv' }, h('b', null, '资产'), h('span', { className: 'rt-mono' }, x.asset_ip)) : null,
    x.vuln_title ? h('div', { className: 'rt-kv' }, h('b', null, '利用漏洞'), h('span', null, [x.vuln_cve, x.vuln_title].filter(Boolean).join(' '))) : null,
    h('div', { className: 'rt-kv' }, h('b', null, '次数'), h('span', null,
      '同类第 ' + x.nth_of_point + ' 次 · +' + (x.points || 0) + ' 分')),
    h('div', { className: 'rt-kv' }, h('b', null, '记录'), h('span', null, fmt(x.recorded_at) + (x.recorded_by ? ' · ' + x.recorded_by : ''))),
    x.evidence ? h(Clip, { label: '结果与证据', text: x.evidence }) : null)

  const hitRow = (x) => h('div', {
    key: 'h' + x.id,
    className: 'rt-ap-hit' + (openId === x.id ? ' open' : ''),
    role: 'button', tabIndex: 0,
    onClick: () => toggle(x.id),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(x.id) } },
  },
    h('div', { className: 'rt-ap-hit-head' },
      h('span', { className: 'rt-ap-pts' + (x.counted ? '' : ' uncounted'), title: x.capped_reason || undefined },
        '+' + (x.counted ? (x.points || 0) : 0)),
      h('span', { className: 'rt-ap-hit-name' }, x.point_name),
      x.capped ? h('span', { className: 'rt-tag rt-tag-warn', title: x.capped_reason || '同一资产同一端口只算分值最高的一条' }, '服务已拿满 · 不计分') : null,
      x.nth_of_point > 1 ? h('span', { className: 'rt-ap-nth' }, '第 ' + x.nth_of_point + ' 次') : null,
      h('span', { className: 'rt-ap-hit-target' }, x.target || x.asset_ip || '—')),
    x.action
      ? h('div', { className: 'rt-ap-act' + (x.action_inferred ? ' inferred' : '') },
          '动作：' + (x.action.title || '（未命名步骤）') + (x.action_inferred ? '（推断）' : ''))
      : null,
    openId === x.id ? hitDetail(x) : null)

  /* 资产行（信息收集阶段 / 各阶段涉及资产） */
  const assetRow = (a) => h('div', { key: 'a' + a.id, className: 'rt-ap-asset' },
    h('span', { className: 'rt-scope rt-scope-' + (a.scope === 'internal' ? 'internal' : 'external') },
      a.scope === 'internal' ? '内' : '外'),
    h('span', { className: 'rt-mono', style: { fontWeight: 600 } }, a.ip),
    a.segment_cidr ? h('span', { className: 'rt-ap-nth' }, a.segment_cidr) : null,
    h('span', { className: 'rt-ap-nth' }, '端口 ' + (a.open_ports || 0)),
    a.vulns ? h('span', { className: 'rt-ap-nth' }, '漏洞 ' + a.vulns) : null,
    a.priority ? h('span', { className: 'rt-tag' }, '易打 ' + a.priority) : null,
    h('div', { className: 'rt-spacer' }),
    h('span', { className: 'rt-ap-pts' }, '+' + (a.points || 0) + ' 分'),
    h('span', { className: 'rt-ap-nth' }, (a.hits || 0) + ' 次'))

  /* 攻击链只讲"打到哪了、拿了多少分"：不展示打法要点与工具清单，
     那些是执行细节，混在链路里会淹没得分与资产信息。 */

  /* ── A：竖向攻击链 ─────────────────────────────────────────── */
  const stageA = (st, i) => {
    const isRecon = st.code === 'recon'
    const body = []
    if (isRecon) {
      body.push(h('div', { key: 'at', className: 'rt-ap-sub' }, '拿到分数的资产 · ' + st.assetCount + ' 台'))
      body.push(h('div', { key: 'al', className: 'rt-ap-assets' },
        st.assets.length ? st.assets.map(assetRow) : h('div', { className: 'rt-ap-none' }, '还没有产生得分的资产')))
    } else {
      body.push(h('div', { key: 'ht', className: 'rt-ap-sub' },
        '本阶段命中 ' + st.hits + ' 次' + (st.points ? ' · +' + st.points + ' 分' : '')))
      body.push(h('div', { key: 'hl', className: 'rt-ap-hits' },
        st.items.length ? st.items.map(hitRow) : h('div', { className: 'rt-ap-none' }, '本阶段还没有得分')))
      if (st.code === 'boundary') {
        const selfOnly = (st.tunnels_self_only || []).length
        body.push(h('div', { key: 'tt', className: 'rt-ap-sub' },
          '跨越靶标边界的通道 · ' + st.tunnels.length + ' 条' + (selfOnly ? '（另有 ' + selfOnly + ' 条只在自己 VPS/自建服务器上，不算突破）' : '')))
        if (selfOnly && st.tunnels.length === 0) {
          body.push(h('div', { key: 'tw', className: 'rt-ap-none' },
            '⚠️ 现有的通道都在自己的服务器上，没有碰到目标 —— 不计边界突破。需要目标侧发起的通道（反弹 shell 到我这 / 目标上跑 frp 客户端 / 经目标 WebShell 的 suo5）。'))
        }
        body.push(h('div', { key: 'tl', className: 'rt-ap-tunnels' },
          st.tunnels.length
            ? st.tunnels.map((t) => h('div', { key: 't' + t.id, className: 'rt-ap-tunnel' },
                h('span', { className: 'rt-tag rt-tag-passive' }, t.kind || 'tunnel'),
                h('span', { className: 'rt-mono', style: { fontWeight: 600 } }, t.listen || '—'),
                h('span', {
                  className: 'rt-tag ' + (t.status === 'active' ? 'rt-tag-live' : ''),
                  style: t.status === 'active' ? {} : { opacity: .7 },
                }, t.status === 'active' ? '可用' : (t.status || '未知')),
                h('span', { className: 'rt-ap-nth', style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' } },
                  '可达 ' + (t.reach || '—'))))
            : h('div', { className: 'rt-ap-none' }, '还没有建立隧道（建好后用 redteam_tunnel_add 登记）')))
      }
      if (st.assets.length && st.code !== 'boundary') {
        body.push(h('div', { key: 'at', className: 'rt-ap-sub' }, '涉及资产 · ' + st.assetCount + ' 台'))
        body.push(h('div', { key: 'al', className: 'rt-ap-assets' }, st.assets.map(assetRow)))
      }
    }

    return h('div', { key: 'st' + st.code, className: 'rt-ap-stage' },
      h('div', { className: 'rt-ap-head', style: { borderLeftColor: st.color } },
        h('span', { className: 'rt-ap-no', style: { background: st.color } }, CIRCLED[i] || ('0' + (i + 1))),
        h('span', { className: 'rt-ap-name' }, st.name),
        st.subtitle ? h('span', { className: 'rt-ap-en' }, st.subtitle) : null,
        h('div', { className: 'rt-spacer' }),
        st.points > 0 ? h('span', { className: 'rt-ap-pts', style: { background: st.color + '22', color: st.color, borderColor: st.color + '66' } }, '+' + st.points) : null,
        h('span', { className: 'rt-ap-cum' }, '累计 ' + st.cumulative + ' 分')),
      h('div', { className: 'rt-ap-goal', style: { borderLeftColor: st.color } },
        h('span', { className: 'rt-ap-goal-tag', style: { color: st.color, borderColor: st.color + '66' } }, '阶段目标'),
        h('span', null, st.goal)),
      h('div', { className: 'rt-ap-result', style: { borderLeftColor: st.color } }, body),
      i < stages.length - 1
        ? h('div', { className: 'rt-ap-trans' },
            h('span', { className: 'rt-flow-arrow' }, '▼'),
            st.transition ? h('span', { className: 'rt-ap-trans-t' }, st.transition) : null,
            h('span', { className: 'rt-ap-trans-t', style: { marginLeft: 'auto' } }, '累计 ' + st.cumulative + ' 分'))
        : h('div', { className: 'rt-ap-trans' },
            h('span', { className: 'rt-flow-arrow' }, '▼'),
            h('span', { className: 'rt-ap-trans-t' }, '合计 ' + ((summary && summary.points) || 0) + ' 分')))
  }

  /* ── B：横向攻击链（一屏看完） ─────────────────────────────── */
  const stageB = (st, i) => h('div', { key: 'c' + st.code, className: 'rt-ap-col' },
    i > 0 ? h('span', { className: 'rt-ap-col-arrow' }, '▶') : null,
    h('div', { className: 'rt-hcol', style: { borderTopColor: st.color } },
      h('div', { className: 'rt-ap-head', style: { borderLeftColor: st.color, padding: '5px 8px' } },
        h('span', { className: 'rt-ap-no', style: { background: st.color, width: 16, height: 16, fontSize: 10 } }, String(i + 1)),
        h('span', { className: 'rt-ap-name', style: { fontSize: 12 } }, st.name),
        h('div', { className: 'rt-spacer' }),
        h('span', { className: 'rt-ap-cum', style: { fontWeight: 700 } }, st.cumulative)),
      h('div', { className: 'rt-hcol-goal', title: st.goal }, st.goal),
      h('div', { className: 'rt-hcol-body' },
        st.code === 'boundary'
          ? h('div', null,
              h('div', { className: 'rt-hcol-hit' }, h('span', { className: 'rt-hcol-pts' }, '+' + st.points), h('span', { className: 'rt-hcol-name' }, '隧道 ' + st.tunnels.length + ' 条')),
              st.tunnels.slice(0, 3).map((t) => h('div', { key: 't' + t.id, className: 'rt-hcol-sub' }, '▸ ' + (t.kind || '') + ' ' + (t.listen || ''))))
          : st.code === 'recon'
            ? h('div', null,
                h('div', { className: 'rt-hcol-hit' }, h('span', { className: 'rt-hcol-pts' }, st.assetCount), h('span', { className: 'rt-hcol-name' }, '台资产拿到分')),
                st.assets.slice(0, 6).map((a) => h('div', { key: 'a' + a.id, className: 'rt-hcol-sub', title: a.ip + '  +' + a.points + ' 分' },
                  (a.scope === 'internal' ? '内 ' : '外 ') + a.ip + '  +' + a.points)))
            : h('div', null,
                h('div', { className: 'rt-hcol-hit' }, h('span', { className: 'rt-hcol-pts' }, '+' + st.points), h('span', { className: 'rt-hcol-name' }, st.hits + ' 次命中')),
                st.items.slice(0, 6).map((x) => h('div', { key: 'c' + x.id, className: 'rt-hcol-sub', title: x.point_name + '  ' + (x.target || '') },
                  h('span', { className: 'rt-hcol-pts' }, '+' + x.points), h('span', { className: 'rt-hcol-name' }, x.point_name))),
                st.items.length > 6 ? h('div', { className: 'rt-hcol-none' }, '…另有 ' + (st.items.length - 6) + ' 次') : null,
                st.assetCount ? h('div', { className: 'rt-hcol-none' }, '涉及 ' + st.assetCount + ' 台资产') : null))))

  return h('div', { className: 'rt-main' },
    h('div', { className: 'rt-toolbar' },
      h('span', { style: { fontWeight: 600 } }, '攻击链'),
      h('span', { className: 'rt-tag', style: { fontSize: 10.5 } }, '信息收集 → 互联网资产权限 → 边界突破 → 内网资产权限 → 靶标权限'),
      summary ? h('span', { className: 'rt-tag rt-tag-live' }, '总分 ' + summary.points + ' 分') : null,
      h('div', { className: 'rt-spacer' }),
      h('button', { className: 'rt-btn' + (view === 'A' ? ' rt-btn-primary' : ''), title: '竖向攻击链：逐阶段向下看细节', onClick: () => setView('A') }, '链路 A'),
      h('button', { className: 'rt-btn' + (view === 'B' ? ' rt-btn-primary' : ''), title: '横向攻击链：一屏看完五个阶段', onClick: () => setView('B') }, '链路 B'),
      h('button', { className: 'rt-btn', disabled: loading, onClick: load }, loading ? '加载中…' : '刷新')),
    err ? h('div', { className: 'rt-err' }, err) : null,
    !stages.length && !err && data !== null
      ? h('div', { className: 'rt-empty' }, '还没有得分记录。拿到成果后用 redteam_score_hit 记分，这条链才会长出来。')
      : view === 'A'
        ? h('div', { className: 'rt-ap' }, stages.map(stageA))
        : h('div', { className: 'rt-ap-h' }, stages.map(stageB)))
}

export { ChainTab };
