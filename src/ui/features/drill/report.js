// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { useCollapse } from './primitives.js';
import { api } from './api.js';
import { groupByStage, copyWithFeedback, fmt } from './helpers.js';
import { ROLE_LABEL } from './labels.js';
import { ShotStrip } from './evidence.js';

function ReportTab(props) {
  const eng = props.engagement
  const refreshKey = props.refreshKey || 0
  const [data, setData] = React.useState(null)
  const [err, setErr] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [msg, setMsg] = React.useState(null)
  /* 报告按阶段折叠：默认全开，折叠状态按靶标记住（阶段多时便于逐段交付） */
  const collapse = useCollapse('report:' + eng)

  const load = () => {
    if (!eng) return
    setBusy(true); setMsg(null)
    api({ op: 'scoreReport', engagement: eng }).then((r) => {
      if (!r || r.ok === false) { setBusy(false); setErr((r && r.error) || '生成失败'); return }
      /* 老 host 只给平铺条目、不给阶段分组（或阶段行缺失）：自己按攻击链分组，
         否则报告页会误报"还没有可交付的成果"。分组数据取自 scoreChain。 */
      if ((!r.stages || r.stages.length === 0) && (r.items || []).length > 0) {
        api({ op: 'scoreChain', engagement: eng }).then((c) => {
          setBusy(false); setErr(null); setData(Object.assign({}, r, { stages: groupByStage(r.items, c) }))
        }, () => { setBusy(false); setErr(null); setData(r) })
        return
      }
      setBusy(false); setErr(null); setData(r)
    }, (e) => { setBusy(false); setErr(String((e && e.message) || e)) })
  }
  React.useEffect(load, [eng, refreshKey])

  /* 复制结果必须是真实的：clipboard API 失败时（非安全上下文/失焦/被拒）要如实提示，
     否则用户以为复制成功、粘到 Yakit 里是空的。 */
  const copy = (text, label) => copyWithFeedback(text, label, (okFlag, message) => {
    setMsg(okFlag ? { ok: message } : { err: message })
  })
  const download = (text, label) => {
    try {
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'report-' + String(label || 'score').replace(/[^\w.\-]/g, '_') + '.md'
      a.click()
      URL.revokeObjectURL(url)
      setMsg({ ok: '已下载：' + label })
    } catch (e) { setMsg({ err: '下载失败：' + ((e && e.message) || e) }) }
  }

  const items = (data && data.items) || []
  const stages = (data && data.stages) || []
  const summary = (data && data.summary) || null
  const mdText = (data && data.markdown) || ''
  const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳']

  /* 每项一条，平铺不折叠：目标 → 拿到什么 → 复现请求（可直接粘进 Yakit）→ 响应 */
  const card = (x) => h('div', { key: 'r' + x.id, className: 'rt-rep' },
    h('div', { className: 'rt-rep-head' },
      h('span', { className: 'rt-rep-idx' }, String(x.seq)),
      h('span', { className: 'rt-rep-name' }, x.point_name),
      h('span', { className: 'rt-flow-pts' }, '+' + x.points + ' 分'),
      x.nth_of_point > 1 ? h('span', { className: 'rt-tag' }, '同类第 ' + x.nth_of_point + ' 次') : null,
      h('div', { className: 'rt-spacer' }),
      h('button', {
        className: 'rt-btn', style: { padding: '0 6px', fontSize: 11 },
        onClick: () => copy((x.requests || []).map((v) => v.request || '').filter(Boolean).join('\n\n'), '第 ' + x.seq + ' 项请求'),
      }, '复制请求')),
    h('div', { className: 'rt-rep-meta' },
      h('span', null, h('b', null, '目标 ')), h('span', { className: 'rt-mono' }, x.target || x.asset_ip || '—')),
    x.gained ? h('div', { className: 'rt-rep-meta' }, h('b', null, '拿到 '), h('span', null, x.gained)) : null,
    x.vuln ? h('div', { className: 'rt-rep-meta' }, h('b', null, '利用漏洞 '),
      h('span', null, [x.vuln.cve, x.vuln.title].filter(Boolean).join(' '))) : null,
    x.evidence ? h('div', { className: 'rt-rep-meta' }, h('b', null, '结果 '),
      h('span', null, String(x.evidence).replace(/\n+/g, ' '))) : null,
    x.recorded_at ? h('div', { className: 'rt-rep-meta' }, h('b', null, '取得时间 '),
      h('span', null, fmt(x.recorded_at) + (x.recorded_by ? '（' + (ROLE_LABEL[x.recorded_by] || x.recorded_by) + '）' : ''))) : null,
    h(ShotStrip, { eng: eng, shots: x.shots, total: x.shot_total, title: '证据截图' }),
    /* ── 复现步骤：动作记录（含实际命令与回显）+ 凭据 + 隧道 + WebShell ─────
       报告的交付价值全在这块：账号密码怎么来的、隧道怎么搭的，用户照着就能复现。 */
    h('details', { className: 'rt-rep-trace', open: x.incomplete === true || (x.steps || []).length === 0 },
      h('summary', { className: 'rt-rep-trace-head', style: { cursor: 'pointer' } },
        h('span', { className: 'rt-rep-trace-title' }, '复现步骤（点击展开）'),
        (x.steps || []).length ? h('span', { className: 'rt-tag' }, (x.steps || []).length + ' 个动作') : null,
        (x.credentials || []).length ? h('span', { className: 'rt-tag' }, (x.credentials || []).length + ' 条凭据') : null,
        (x.tunnels || []).length ? h('span', { className: 'rt-tag' }, (x.tunnels || []).length + ' 条隧道') : null,
        x.incomplete ? h('span', { className: 'rt-tag rt-tag-warn' }, '复现材料待补') : h('span', { className: 'rt-tag rt-tag-live' }, '可复现')),
      h('div', { style: { paddingTop: 6 } },
      x.how ? h('div', { className: 'rt-rep-trace-how' }, x.how) : null,
      (x.steps || []).length === 0
        ? h('div', { className: 'rt-rep-missing' },
            '⚠️ 没有关联的攻击步骤：说不清这一步是怎么做的。请用 redteam_chain_add 补上动作（title / detail / tool / result），记分时也可以带 point_code + evidence 一次完成。')
        : (x.steps || []).map((s, si) => h('div', { key: 's' + s.id, className: 'rt-rep-step' },
            h('div', { className: 'rt-rep-step-head' },
              h('span', { className: 'rt-rep-step-no' }, String(si + 1)),
              h('span', { className: 'rt-rep-step-title' }, s.title || '(未命名动作)'),
              s.agent ? h('span', { className: 'rt-tag' }, ROLE_LABEL[s.agent] || s.agent) : null,
              s.stage_code ? h('span', { className: 'rt-tag' }, s.stage_code) : null,
              s.inferred ? h('span', { className: 'rt-tag' }, '按同资产推断') : null,
              h('div', { className: 'rt-spacer' }),
              s.recorded_at ? h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)' } }, fmt(s.recorded_at)) : null),
            s.detail ? h('div', { className: 'rt-rep-step-detail' }, s.detail) : null,
            h('div', { className: 'rt-rep-step-cmd' },
              h('b', null, '执行 '),
              s.tool
                ? h('span', { className: 'rt-mono' }, s.tool)
                : h('span', { style: { color: 'var(--dsw-alias-state-warn-primary, #f59e0b)' } }, '未记录实际命令（redteam_chain_add 的 tool）')),
            s.tool ? h('div', { style: { marginTop: 3 } },
              h('button', {
                className: 'rt-btn', style: { padding: '0 6px', fontSize: 11 },
                onClick: () => copy(String(s.tool), '第 ' + (si + 1) + ' 步命令'),
              }, '复制命令')) : null,
            s.result ? h('div', { className: 'rt-rep-step-result' }, h('b', null, '结果 '), String(s.result).replace(/\n+/g, ' ')) : null,
            s.evidence_ref ? h('div', { className: 'rt-rep-step-result' }, h('b', null, '证据 '), h('span', { className: 'rt-mono' }, s.evidence_ref)) : null)),
      /* 账号密码怎么来的：凭据的来源 + 取得方式 */
      (x.credentials || []).length
        ? h('div', { className: 'rt-rep-src' },
            h('div', { className: 'rt-rep-src-title' }, '拿到的凭据（来源可追溯）'),
            (x.credentials || []).map((c) => h('div', { key: 'c' + c.id, className: 'rt-kv' },
              h('b', { className: 'rt-mono', style: { minWidth: 120 } }, c.host || '—'),
              h('span', null, (c.username || '(无用户名)') + ' / ' + (c.secret_type || 'password')
                + (c.privilege ? ' · 权限 ' + c.privilege : '')
                + ' · 来源 ' + (c.source || '未标注')
                + (c.tool ? ' · 取得方式 ' + String(c.tool).replace(/\n+/g, ' ').slice(0, 160) : '')))))
        : null,
      /* 隧道怎么搭的 */
      (x.tunnels || []).length
        ? h('div', { className: 'rt-rep-src' },
            h('div', { className: 'rt-rep-src-title' }, '用到的隧道 / 通道'),
            (x.tunnels || []).map((t) => h('div', { key: 't' + t.id, className: 'rt-kv' },
              h('b', { className: 'rt-mono', style: { minWidth: 120 } }, (t.kind || 'socks5') + ' ' + (t.listen || '')),
              h('span', null, '入口 ' + (t.entry || '未登记')
                + (t.reach ? ' · 可达 ' + t.reach : '')
                + ' · 目标侧 ' + (t.entry_kind || '未声明')
                + (t.legit === false ? ' · ⚠️ 不算跨越靶标边界' : '')
                + (t.status ? ' · ' + t.status : '')
                + (t.command ? ' · 命令 ' + String(t.command).replace(/\n+/g, ' ').slice(0, 160) : '')))))
        : null,
      (x.webshells || []).length
        ? h('div', { className: 'rt-rep-src' },
            h('div', { className: 'rt-rep-src-title' }, '用到的 WebShell'),
            (x.webshells || []).map((w) => h('div', { key: 'w' + w.id, className: 'rt-kv' },
              h('b', { className: 'rt-mono', style: { minWidth: 120 } }, w.shell_type || 'shell'),
              h('span', null, (w.url || '') + (w.pass_key ? ' · 口令/密钥 ' + w.pass_key : '')
                + (w.privilege ? ' · 权限 ' + w.privilege : '') + (w.status ? ' · ' + w.status : '')))))
        : null,
      (x.gaps || []).length ? h('div', { className: 'rt-rep-missing' }, '⚠️ 复现缺口：' + x.gaps.join('；')) : null),
    (x.requests || []).length === 0
      ? h('div', { className: 'rt-rep-missing' }, '⚠️ 这一项没有原始请求记录，无法直接复现 —— 请用 redteam_http_evidence_add 补上')
      : (x.requests || []).map((r, ri) => h('div', { key: 'q' + ri, className: 'rt-rep-req' },
          h('div', { className: 'rt-rep-req-head' },
            h('span', null, '复现请求 ' + (ri + 1) + (r.source === 'auto' ? '（按目标路径自动匹配，请核对）' : '')),
            h('span', { className: 'rt-tag' }, (r.method || 'GET') + ' ' + (r.status === null || r.status === undefined ? '' : r.status)),
            h('div', { className: 'rt-spacer' }),
            h('button', {
              className: 'rt-btn', style: { padding: '0 6px', fontSize: 11 },
              onClick: () => copy(String(r.request || ''), '请求 ' + (ri + 1)),
            }, '复制到 Yakit')),
          h('pre', { className: 'rt-rep-http' }, r.request || ((r.method || 'GET') + ' ' + (r.url || '') + ' HTTP/1.1')),
          r.response ? h('div', null,
            h('div', { className: 'rt-rep-req-head' }, h('span', null, '响应摘要')),
            h('pre', { className: 'rt-rep-http', style: { maxHeight: 160 } }, String(r.response).slice(0, 1600))) : null)),
    x.note ? h('div', { className: 'rt-rep-meta' }, h('b', null, '备注 '), h('span', null, x.note)) : null))

  return h('div', { className: 'rt-main' },
    h('div', { className: 'rt-toolbar' },
      h('span', { style: { fontWeight: 600 } }, '攻击得分链路复现报告'),
      summary ? h('span', { className: 'rt-tag rt-tag-live' }, '合计 ' + summary.points + ' 分') : null,
      summary ? h('span', { className: 'rt-tag' }, summary.count + ' 项得分') : null,
      summary ? h('span', { className: 'rt-tag' + (summary.missingRequests ? '' : ' rt-tag-live') },
        (summary.withRequests ?? 0) + '/' + (summary.count ?? 0) + ' 项带原始请求') : null,
      summary ? h('span', {
        className: 'rt-tag' + (summary.incomplete ? ' rt-tag-warn' : ' rt-tag-live'),
        title: '复现链是否完整：有攻击步骤、写了实际命令、关联了漏洞/凭据/隧道',
      }, '可复现 ' + (summary.count - (summary.incomplete || 0)) + '/' + summary.count) : null,
      summary && summary.serviceCappedExcluded
        ? h('span', {
            className: 'rt-tag rt-tag-warn',
            title: (summary.serviceCapped || []).map((x) => (x.service || '') + '｜' + (x.point_name || '')).join('\n')
              || '同一资产同一端口的重复账号/数据库权限命中：服务已拿满，不计分、不进报告',
          }, '同服务已拿满不计分 ' + summary.serviceCappedExcluded)
        : null,
      h('div', { className: 'rt-spacer' }),
      h('button', { className: 'rt-btn', disabled: busy || !mdText, onClick: () => copy(mdText, '整份报告') }, '复制全文'),
      h('button', { className: 'rt-btn', disabled: busy || !mdText, onClick: () => download(mdText, (data && data.target) || eng) }, '下载 .md'),
      h('button', { className: 'rt-btn', disabled: busy, onClick: load }, busy ? '生成中…' : '重新生成')),
    msg ? h('div', { className: msg.err ? 'rt-err' : 'rt-foot' }, msg.err || msg.ok) : null,
    err ? h('div', { className: 'rt-err' }, err) : null,
    data && (data.hit_total || 0) > items.length
      ? h('div', { className: 'rt-hint', role: 'status' },
        '共 ' + data.hit_total + ' 条得分记录，本次报告只含前 ' + items.length + ' 条（单次上限 '
        + (data.hit_limit || 500) + '）；完整明细请用 redteam_attack_chain / redteam_score_list 查询。')
      : null,
    h('div', { className: 'rt-body', style: { overflow: 'auto' } },
      stages.length
        ? h('div', { className: 'rt-rep-list' },
            h('div', { className: 'rt-rep-tools' },
              h('button', { className: 'rt-btn', onClick: () => collapse.setAll(stages.map((s) => 'st:' + s.code), true) }, '全部展开'),
              h('button', { className: 'rt-btn', onClick: () => collapse.setAll(stages.map((s) => 'st:' + s.code), false) }, '全部折叠')),
            stages.map((st) => {
              const open = collapse.isOpen('st:' + st.code)
              const toggle = collapse.toggle('st:' + st.code)
              return h('div', { key: 'g' + st.code, className: 'rt-rep-group' },
                h('div', {
                  className: 'rt-rep-stage', role: 'button', tabIndex: 0,
                  style: { borderLeftColor: st.color },
                  'aria-expanded': open ? 'true' : 'false',
                  onClick: toggle,
                  onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e) } },
                },
                  h('span', { className: 'rt-sec-caret' }, open ? '▾' : '▸'),
                  h('span', { className: 'rt-rep-no', style: { background: st.color } }, CIRCLED[st.ordinal - 1] || st.ordinal),
                  h('span', { className: 'rt-rep-stage-name' }, st.name),
                  h('span', { className: 'rt-rep-stage-n' }, st.items.length + ' 项'),
                  h('div', { className: 'rt-spacer' }),
                  h('span', { className: 'rt-rep-pts', style: { background: st.color + '22', color: st.color, borderColor: st.color + '66' } },
                    '+' + st.points + ' 分'),
                  h('span', { className: 'rt-ap-cum' }, '累计 ' + st.cumulative + ' 分')),
                open ? h('div', { className: 'rt-rep-body' }, st.items.map(card)) : null)
            }))
        : (data === null ? h('div', { className: 'rt-empty' }, '加载中…')
            : h('div', { className: 'rt-empty' },
                h('div', null, '还没有可交付的成果。'),
                h('div', { style: { marginTop: 6, fontSize: 12 } },
                  '本报告只收录"拿到了分"的成果；没有得分的漏洞不进报告。拿到成果后用 redteam_score_hit 记分（目标资产 + 拿到的东西），并补 redteam_http_evidence_add 以便复现。')))),
    h('div', { className: 'rt-foot' },
      h('span', null, '口径：只收录得分成果，每条附带可粘进 Yakit Repeater 的原始请求')))
}

export { ReportTab };
