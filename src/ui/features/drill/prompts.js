// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { PurgeSelect } from '../../components/PurgeSelect';
import { api } from './api.js';

/* 目标级编辑器只列执行角色：plan 是主会话人设，不参与子会话注入，放进来只会让人白改。 */
function isDispatchRole(role) {
  return Boolean(role) && role.role !== 'plan' && role.planner !== true
}

/* 服务端会给出 source：target 是靶标覆盖，global 是继承全局模板，builtin 是内置默认。
   老数据没有 source 时按靶标文件显示，避免出现空白。 */
function sourceLabel(role) {
  if (!role || !role.source) return '当前靶标文件'
  if (role.source === 'target') return '当前靶标自定义'
  if (role.source === 'global') return '继承全局模板'
  if (role.source === 'builtin') return '内置默认'
  return '当前靶标文件'
}

function PromptsTab(props) {
  const eng = props.engagement
  const refreshKey = props.refreshKey || 0
  /* 宿主可注入请求函数（目标配置页复用）；ref 保存，避免内联函数导致每次重渲染都重读。 */
  const requestRef = React.useRef(props.request)
  requestRef.current = props.request
  const call = React.useCallback((req) => (typeof requestRef.current === 'function' ? requestRef.current : api)(req), [])
  const [roles, setRoles] = React.useState([])
  const [active, setActive] = React.useState(null)
  /* 按角色保存草稿：切换角色不丢改动，后台刷新也不会把正在编辑的内容冲掉。 */
  const [drafts, setDrafts] = React.useState({})
  const [msg, setMsg] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [confirmReset, setConfirmReset] = React.useState(null)
  const loadSeq = React.useRef(0)
  const alive = React.useRef(true)
  const editVersion = React.useRef({})

  const cur = roles.find((x) => x.role === active)
  const draft = drafts[active] ?? (cur ? cur.content || '' : '')
  const dirty = roles.some((role) => {
    const value = drafts[role.role]
    return value !== undefined && value !== (role.content || '')
  })

  React.useEffect(() => {
    alive.current = true
    return () => { alive.current = false; loadSeq.current += 1 }
  }, [])

  React.useEffect(() => {
    const seq = ++loadSeq.current
    setBusy(true)
    /* 无靶标也允许：服务端回内置默认，不再报 engagement required */
    call(eng ? { op: 'prompts', engagement: eng } : { op: 'prompts' }).then((r) => {
      if (!alive.current || seq !== loadSeq.current) return
      setBusy(false)
      if (!r || r.ok === false) { setMsg({ err: (r && r.error) || '读取失败' }); return }
      const list = (r.roles || []).filter(isDispatchRole)
      setRoles(list)
      setActive((current) => (list.some((x) => x.role === current) ? current : (list[0] && list[0].role) || null))
      if (r.builtin) setMsg({ ok: '当前为内置默认提示词（创建靶标后可按靶标保存修改）' })
    }, (e) => {
      if (!alive.current || seq !== loadSeq.current) return
      setBusy(false)
      setMsg({ err: String((e && e.message) || e) })
    })
  }, [eng, refreshKey, call])

  const save = () => {
    if (!eng) { setMsg({ err: '请先创建靶标，再保存提示词' }); return }
    if (!active) { setMsg({ err: '请选择角色后再保存提示词' }); return }
    if (!draft.trim()) { setMsg({ err: '提示词不能为空；如需恢复继承，请用「恢复默认」' }); return }
    const role = active
    const submitted = draft
    const version = editVersion.current[role] || 0
    setBusy(true)
    setMsg(null)
    call({ op: 'savePrompt', engagement: eng, role, content: submitted }).then((r) => {
      if (!alive.current) return
      setBusy(false)
      if (!r || r.ok === false) { setMsg({ err: (r && r.error) || '保存失败' }); return }
      setRoles((list) => list.map((x) => (x.role === role
        ? Object.assign({}, x, { content: submitted, source: 'target', updated_at: new Date().toISOString() })
        : x)))
      /* 保存期间又改了内容就保留新草稿，别把用户刚敲的字丢掉。 */
      setDrafts((current) => {
        if ((editVersion.current[role] || 0) !== version) return current
        const next = Object.assign({}, current)
        delete next[role]
        return next
      })
      setMsg({ ok: '已保存' })
    }, (e) => { if (!alive.current) return; setBusy(false); setMsg({ err: String((e && e.message) || e) }) })
  }

  /* 老靶标的提示词是旧版模板；这里可以把当前角色（或全部）恢复成继承全局模板/内置最新版 */
  const reset = (all) => {
    if (!eng) { setMsg({ err: '请先创建靶标，再恢复默认提示词' }); return }
    setConfirmReset(null)
    const affected = all ? roles.map((x) => x.role) : [active]
    const versions = {}
    for (const role of affected) versions[role] = editVersion.current[role] || 0
    setBusy(true)
    setMsg(null)
    call({ op: 'resetPrompts', engagement: eng, role: all ? undefined : active }).then((r) => {
      if (!alive.current) return
      if (!r || r.ok === false) { setBusy(false); setMsg({ err: (r && r.error) || '恢复失败' }); return }
      /* 恢复后重新拉取：来源与内容都以服务端最新继承结果为准。 */
      call({ op: 'prompts', engagement: eng }).then((rr) => {
        if (!alive.current) return
        setBusy(false)
        if (!rr || rr.ok === false) { setMsg({ err: (rr && rr.error) || '恢复后读取失败' }); return }
        const list = (rr.roles || []).filter(isDispatchRole)
        setRoles(list)
        setActive((current) => (list.some((x) => x.role === current) ? current : (list[0] && list[0].role) || null))
        setDrafts((current) => {
          const next = Object.assign({}, current)
          for (const role of affected) {
            if ((editVersion.current[role] || 0) === versions[role]) delete next[role]
          }
          return next
        })
        setMsg({ ok: '已恢复继承模板：' + (r.reset || []).join('、') + '；原文件已备份为 .bak' })
      }, (e) => { if (alive.current) { setBusy(false); setMsg({ err: String((e && e.message) || e) }) } })
    }, (e) => { if (!alive.current) return; setBusy(false); setMsg({ err: String((e && e.message) || e) }) })
  }

  const chooseRole = (role) => {
    if (!role || role === active) return
    setActive(role)
    setConfirmReset(null)
    setMsg(null)
  }

  return h('div', { className: 'rt-main', 'aria-label': '当前靶标角色提示词' },
    h('div', { className: 'rt-toolbar' },
      h('b', null, '当前靶标角色提示词'),
      h('span', { className: 'rt-tag' }, '只作用于当前靶标'),
      dirty ? h('span', { role: 'status' }, '有未保存草稿') : null),
    h('p', { className: 'rt-hint' }, '靶标自定义优先，其次全局模板，最后内置模板。恢复默认会重新继承全局模板或内置默认；原文件会备份为 .bak。'),
    h('div', { className: 'rt-toolbar' },
      h('span', { className: 'rt-select-label' }, '角色'),
      h(PurgeSelect, {
        'aria-label': '靶标角色',
        value: active || '',
        onChange: chooseRole,
        options: roles.map((role) => ({ value: role.role, label: role.title })),
      }),
      h('span', null, '来源：' + sourceLabel(cur)),
      h('button', {
        type: 'button', className: 'rt-btn', disabled: busy || !active, title: '清除当前靶标覆盖，继承全局模板或内置默认',
        onClick: () => setConfirmReset('one'),
      }, '恢复当前默认'),
      h('button', {
        type: 'button', className: 'rt-btn', disabled: busy || !roles.length, title: '全部角色清除靶标覆盖，继承全局模板或内置默认',
        onClick: () => setConfirmReset('all'),
      }, '全部恢复默认'),
      h('button', { type: 'button', className: 'rt-btn rt-btn-primary', disabled: busy || !active, onClick: save }, busy ? '处理中…' : '保存')),
    confirmReset ? h('div', { className: 'rt-card', role: 'alertdialog', 'aria-label': '确认恢复靶标提示词' },
      h('p', null, (confirmReset === 'all' ? '全部执行角色' : (cur ? cur.title : '当前角色'))
        + '的靶标自定义将被清除，恢复为全局模板或内置默认；原文件会备份为 .bak。'),
      h('button', { type: 'button', className: 'rt-btn', disabled: busy, onClick: () => reset(confirmReset === 'all') }, '确认恢复'),
      h('button', { type: 'button', className: 'rt-btn', onClick: () => setConfirmReset(null) }, '取消')) : null,
    msg ? h('div', { className: msg.err ? 'rt-err' : 'rt-foot', role: msg.err ? 'alert' : 'status' }, msg.err || msg.ok) : null,
    h('div', { className: 'rt-pane' },
      h('textarea', {
        className: 'rt-textarea', value: draft, spellCheck: false, disabled: !cur,
        onChange: (e) => {
          const value = e.target.value
          editVersion.current[active] = (editVersion.current[active] || 0) + 1
          setDrafts((current) => Object.assign({}, current, { [active]: value }))
        },
        placeholder: '该角色的系统提示词（Markdown）',
      }),
      h('div', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)', marginTop: 6 } },
        '保存后写入 agents/' + (active || 'role') + '.md。子会话任务第一行写 redteamRole: recon、assess、vuln-scan、exploit 或 internal 后，对应文件进入系统提示词。')))
}

export { PromptsTab };
