// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { api } from './api.js';
import { fmt, copyText } from './helpers.js';
import { ShotStrip } from './evidence.js';
import { PurgeSelect } from '../../components/PurgeSelect';

function ScoreTab(props) {
  const eng = props.engagement
  const refreshKey = props.refreshKey || 0
  const [data, setData] = React.useState(null)
  const [err, setErr] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [openId, setOpenId] = React.useState(null)
  const [form, setForm] = React.useState(null)
  const [msg, setMsg] = React.useState(null)

  const load = () => {
    if (!eng) return
    setBusy(true)
    api({ op: 'scores', engagement: eng }).then((r) => {
      setBusy(false)
      if (!r || r.ok === false) { setErr((r && r.error) || '读取失败'); return }
      setErr(null)
      setData(r)
    }, (e) => { setBusy(false); setErr(String((e && e.message) || e)) })
  }
  React.useEffect(load, [eng, refreshKey])

  /* builtin 要一路带到表单：内置得分点的分值/名称/口径由《得分规则》锁定，
     界面必须把输入框置灰并说明原因 —— 以前是「能改、提示已保存、刷新后变回去」，
     用户以为是 bug。 */
  const startEdit = (p) => setForm({
    id: p.id, name: p.name, category: p.category || '', points: p.points,
    description: p.description || '', enabled: p.enabled, builtin: p.builtin === true,
    src: p.src, cap: p.cap, rule: p.rule,
  })
  const startNew = () => { setForm({ name: '', category: '', points: 10, description: '', enabled: true, builtin: false }); setMsg(null) }
  const setField = (k, v) => setForm((f) => Object.assign({}, f, { [k]: v }))

  const save = () => {
    if (!form || !form.name) { setMsg({ err: '名称不能为空' }); return }
    setBusy(true)
    setMsg(null)
    api({ op: 'saveScorePoint', engagement: eng, point: form }).then((r) => {
      setBusy(false)
      if (!r || r.ok === false) { setMsg({ err: (r && r.error) || '保存失败' }); return }
      /* overridden === false 表示后端**没有采纳**提交的分值（内置点由规则锁定）。
         这时不能笼统说「已保存」 —— 那句话会让用户以为分值改成功了。 */
      if (r.overridden === false) {
        setMsg({ err: '已保存「启用/停用」。分值未改动：这是随《得分规则》分发的内置得分点，'
          + '分值 / 上限 / 计分口径由规则锁定（同一条规则的上限按组内所有得分点累计，'
          + '单独改分值会让一条命中吃掉整组上限）。要自定义分值时请「+ 新增得分点」。' })
      } else {
        setMsg({ ok: r.note || '已保存' })
      }
      setForm(null)
      load()
    }, (e) => { setBusy(false); setMsg({ err: String((e && e.message) || e) }) })
  }
  const remove = () => {
    if (!form || !form.id) { setForm(null); return }
    setBusy(true)
    setMsg(null)
    api({ op: 'deleteScorePoint', engagement: eng, id: form.id }).then((r) => {
      setBusy(false)
      if (!r || r.ok === false) { setMsg({ err: (r && r.error) || '删除失败' }); return }
      setMsg({ ok: '已删除' })
      setForm(null)
      setOpenId(null)
      load()
    }, (e) => { setBusy(false); setMsg({ err: String((e && e.message) || e) }) })
  }

  const summary = (data && data.summary) || { achievedPoints: 0, pointCount: 0, hitPointCount: 0, hitCount: 0, selfCreatedHits: 0, serviceCappedHits: 0 }
  const items = (data && data.items) || []

  /* 按合并版的 8 个类别分组渲染（后端 ruleGroups 已排好序、组内按分值升序）。
     兼容：后端没给 ruleGroups（老 host）时退回平铺。 */
  const groups = (data && data.ruleGroups && data.ruleGroups.length)
    ? data.ruleGroups
    : [{ key: 'all', name: '', capSum: 0, points: 0, counted: 0, tiers: items }]
  const rows = []
  for (const g of groups) {
    if (g.name) {
      rows.push(h('div', { key: 'g-' + g.key, className: 'rt-score-group' },
        h('span', null, g.name),
        h('span', { className: 'rt-sg-sub' },
          g.tiers.length + ' 项'
          + (g.capSum > 0 ? ' · 各项上限合计 ' + g.capSum + ' 分（各项独立，不跨项累加）' : '')),
        h('div', { className: 'rt-spacer' }),
        g.points > 0
          ? h('span', { className: 'rt-tag rt-tag-active' }, '+' + g.points + ' 分')
          : null))
    }
    for (const p of g.tiers) {
    const achieved = p.hits.length > 0
    const open = openId === p.id
    rows.push(h('div', {
      key: 'sp' + p.id, className: 'rt-score-row', role: 'button', tabIndex: 0,
      onClick: () => setOpenId(open ? null : p.id),
      onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenId(open ? null : p.id) } },
    },
      h('span', { className: 'rt-sec-caret' }, open ? '▾' : '▸'),
      h('span', null, h('span', {
        className: achieved ? 'rt-pri rt-pri-high' : 'rt-pri rt-pri-low',
        style: achieved ? {} : { background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-secondary)' },
      }, p.points + '分')),
      h('span', { title: p.description || '' },
        p.name,
        p.tier ? h('span', { className: 'rt-scope' }, '　' + p.tier) : null),
      /* 命中与上限：这一条计入几次、上限用了多少（G3 各项上限独立，到顶就不再累计） */
      h('span', { title: p.capped > 0
        ? '已计入 ' + p.counted + ' 次，另有 ' + p.capped + ' 条因「' + (p.scope_label || '计分口径') + '」或已达上限不计分'
        : (p.scope_label || '') },
        h('span', { className: 'rt-sec-count' }, p.hits.length > 0 ? p.counted + ' 次命中' : '未命中'),
        p.cap > 0
          ? h('span', { className: 'rt-scope' }, '　上限 ' + (p.cap_used === null ? 0 : p.cap_used) + '/' + p.cap)
          : null),
      h('span', { style: { textAlign: 'right' } }, p.earned > 0
        ? h('span', { className: 'rt-tag rt-tag-active' }, '+' + p.earned + ' 分')
        : h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, '—'))))
    if (!open) continue
    /* 命中记录：一行一条 —— 第一行给"序号 + 资产 + 时间 + 复制"，内容另起一行自适应换行 */
    const hitNodes = p.hits.map((hh, hi) => h('div', {
      key: 'h' + hh.id,
      className: 'rt-hit-row' + (hh.self_created ? ' self-created' : '') + (hh.capped ? ' service-capped' : ''),
    },
      h('span', { className: 'rt-hit-idx' }, String(hi + 1)),
      h('span', { className: 'rt-hit-asset', title: hh.target || hh.asset_ip || '' },
        hh.asset_ip || hh.target || '未指定资产'),
      hh.self_created ? h('span', { className: 'rt-tag rt-tag-warn', title: '自己注册/自建的账号不算得分权限，只作过程记录' }, '自建 · 不计分') : null,
      hh.capped ? h('span', {
        className: 'rt-tag rt-tag-warn',
        title: hh.capped_reason || '同一资产同一端口只算分值最高的一条，这条不计分',
      }, '服务已拿满 · 不计分' + (hh.service ? '（' + hh.service + '）' : '')) : null,
      hh.shot_count ? h('span', { className: 'rt-tag', title: '这条命中有证据截图（展开得分点即可看到代表图）' },
        '图 ' + hh.shot_count) : null,
      h('span', { className: 'rt-hit-time' }, fmt(hh.recorded_at)),
      h('button', {
        className: 'rt-btn', style: { padding: '0 5px', fontSize: 10.5 },
        title: '复制这一条',
        onClick: (e) => {
          e.stopPropagation()
          copyText((hh.asset_ip || hh.target || '') + '  ' + (hh.evidence || ''))
        },
      }, '复制'),
      hh.evidence
        ? h('span', { className: 'rt-hit-txt', title: hh.evidence }, String(hh.evidence).replace(/\n+/g, ' '))
        : h('span', { className: 'rt-hit-txt none' }, '未填账号密码/结果')))
    rows.push(h('div', {
      key: 'spd' + p.id, className: 'rt-score-row',
      style: { cursor: 'default', gridTemplateColumns: '1fr' },
    }, h('div', { className: 'rt-score-detail' },
      p.description ? h('div', { className: 'rt-kv' }, h('b', null, '得分条件'), h('span', null, p.description)) : null,
      h('div', { className: 'rt-kv' }, h('b', null, '状态'),
        h('span', null, (p.enabled ? '启用' : '停用') + ' · ' + p.points + ' 分/次 · 命中 ' + p.hits.length +
          ' 次 = ' + p.earned + ' 分' + (p.self_created ? '（另有 ' + p.self_created + ' 次自建不计分）' : '') +
          (p.capped ? '（另有 ' + p.capped + ' 次同服务重复命中不计分）' : ''))),
      p.capped
        ? h('div', { className: 'rt-kv' }, h('b', null, '服务封顶'),
            h('span', null, p.service_summary + '；账号权限与数据库权限按「同资产同端口」只算一次，拿到最高权限账号即该服务拿满'))
        : null,
      p.hits.length
        ? h('div', null,
            h(ShotStrip, { eng: eng, shots: p.shots, total: p.shot_total,
              title: '证据截图 · ' + (p.shot_total || (p.shots || []).length) + ' 张' }),
            h('div', { className: 'rt-section', style: { padding: '6px 0 0' } },
              '命中记录 · ' + p.hits.length + '（只记资产与账号密码，详细复现见报告）'),
            h('div', { className: 'rt-hits' }, hitNodes))
        : h('div', { className: 'rt-kv' }, h('b', null, '命中记录'),
            h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } },
              '还没有 —— 拿下成果后用 redteam_score_hit 记分：写明目标资产 + 拿到的账号密码/权限')),
      h('div', { className: 'rt-actions' },
        h('button', { className: 'rt-btn', onClick: (e) => { e.stopPropagation(); startEdit(p) } }, '编辑')))))
    }
  }

  return h('div', { className: 'rt-main' },
    h('div', { className: 'rt-toolbar' },
      h('span', { style: { fontWeight: 600 } }, '得分目标'),
      /* 只显示已拿下的总分，不显示目标分数、不显示进度条 */
      h('span', { style: { fontSize: 13, color: 'var(--dsw-alias-label-secondary)', marginLeft: 4 } }, '总分'),
      h('span', { className: 'rt-total' }, String(summary.achievedPoints)),
      h('span', { style: { fontSize: 13, color: 'var(--dsw-alias-label-secondary)' } }, '分'),
      h('span', { className: 'rt-tag' }, summary.pointCount + ' 个得分点'),
      /* 后端字段叫 countedHits；老快照/合成数据只有 hitCount，两者都缺时按 0 显示，别把 undefined 印到界面上。 */
      h('span', { className: 'rt-tag' }, '命中 ' + (summary.countedHits ?? summary.hitCount ?? 0) + ' 次'),
      summary.selfCreatedHits
        ? h('span', {
            className: 'rt-tag rt-tag-warn',
            title: '自己注册/自己创建的账号不算得分权限，只作过程记录（不计分、不占上限、不进报告）',
          }, '自建不计分 ' + summary.selfCreatedHits)
        : null,
      summary.serviceCappedHits
        ? h('span', {
            className: 'rt-tag rt-tag-warn',
            title: '账号权限与数据库权限按「同资产同端口」只算一次：该服务已拿满，这些重复命中不计分（只作留痕）',
          }, '服务已拿满不计分 ' + summary.serviceCappedHits)
        : null,
      h('div', { className: 'rt-spacer' }),
      h('button', { className: 'rt-btn', onClick: startNew }, '+ 新增得分点'),
      h('button', { className: 'rt-btn', disabled: busy, onClick: load }, busy ? '刷新中…' : '刷新')),
    msg ? h('div', { className: msg.err ? 'rt-err' : 'rt-foot' }, msg.err || msg.ok) : null,
    err ? h('div', { className: 'rt-err' }, err) : null,
    form ? h('div', { className: 'rt-pane', style: { flex: 'none', borderBottom: '1px solid var(--dsw-alias-border-l1)' } },
      /* 内置得分点（builtin）：分值 / 名称 / 分类由《得分规则》锁定，输入框置灰。
         可改的只有「启用 / 停用」。这样界面上就不会再出现「改完提示已保存、刷新变回去」的困惑。 */
      form.builtin
        ? h('div', { className: 'rt-hint', style: { marginBottom: 8 } },
            h('b', null, '内置得分点（来自《突破入侵类得分规则（合并版）》）'),
            h('div', { style: { marginTop: 3 } },
              '分值、上限、计分口径与名称由规则锁定 —— 同一条规则的上限按组内所有得分点累计，'
              + '单独改分值会让一条命中吃掉整组上限。这里可以改「启用 / 停用」；'
              + '要自定义分值时请返回上一屏点「+ 新增得分点」。'),
            form.src !== null && form.src !== undefined
              ? h('div', { style: { marginTop: 3, color: 'var(--dsw-alias-label-secondary)' } },
                  '规则原文序号 ' + form.src + (form.rule ? '　·　上限分组 rule=' + form.rule : '')
                  + (form.cap > 0 ? '　·　上限 ' + form.cap + ' 分' : '　·　不设上限'))
              : null)
        : null,
      h('div', { className: 'rt-score-form' },
        h('input', {
          className: 'rt-input', placeholder: '名称（必填）', value: form.name,
          readOnly: form.builtin === true,
          title: form.builtin ? '内置得分点的名称由规则锁定' : '',
          onChange: (e) => setField('name', e.target.value),
        }),
        h('input', {
          className: 'rt-input', placeholder: '分类，如 账号权限', value: form.category,
          readOnly: form.builtin === true,
          title: form.builtin ? '内置得分点的分类由规则锁定（决定它属于面板哪一组）' : '',
          onChange: (e) => setField('category', e.target.value),
        }),
        h('input', {
          className: 'rt-input', type: 'number', placeholder: '单次分值',
          readOnly: form.builtin === true,
          title: form.builtin
            ? '内置得分点的分值由《得分规则》锁定，不能在这里改'
            : '这一类的单次分值；每命中一次就按这个分值累加（受该条规则上限约束）',
          value: form.points, onChange: (e) => setField('points', Number(e.target.value)),
        }),
        h(PurgeSelect, {
          'aria-label': '得分点启用状态', size: 'sm', className: 'rt-select-block',
          value: form.enabled ? '1' : '0', onChange: (value) => setField('enabled', value === '1'),
          options: [{ value: '1', label: '启用' }, { value: '0', label: '停用' }],
        })),
      h('input', {
        className: 'rt-input', style: { width: '100%', marginBottom: 6, boxSizing: 'border-box' },
        placeholder: '得分条件说明', value: form.description,
        readOnly: form.builtin === true,
        title: form.builtin ? '内置得分点的条款正文由规则锁定' : '',
        onChange: (e) => setField('description', e.target.value),
      }),
      h('div', { className: 'rt-actions' },
        h('button', { className: 'rt-btn rt-btn-primary', disabled: busy, onClick: save }, '保存'),
      form.id
        ? (form.builtin
            ? h('button', {
                className: 'rt-btn', disabled: true,
                title: '内置得分点不能删除：删掉会让面板缺一条规则、报告少一类成果（下次启动还会自动补回来）。要让它不参与计分请改用「停用」。',
              }, '删除（内置项不可删）')
            : h('button', { className: 'rt-btn', disabled: busy, onClick: remove }, '删除'))
        : null,
        h('button', { className: 'rt-btn', onClick: () => setForm(null) }, '取消'))) : null,
    h('div', { className: 'rt-table' },
      h('div', { className: 'rt-score-row head' },
        h('span', null, ''), h('span', null, '分值'), h('span', null, '得分点（按分值从低到高）'),
        h('span', null, '命中 / 上限'), h('span', { style: { textAlign: 'right' } }, '已得分')),
      rows,
      !items.length ? h('div', { className: 'rt-empty' }, '暂无得分点，点右上角「新增得分点」') : null))
}

export { ScoreTab };
