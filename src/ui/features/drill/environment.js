// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { api } from './api.js';
import { PurgeSelect } from '../../components/PurgeSelect';
import { SecretInput } from '../../components/SecretInput';

const ENV_TOOL_GROUPS = [
  { key: 'recon', title: '资产与子域', hint: '先有面：子域、存活、指纹、段扫', ids: ['subfinder', 'ksubdomain', 'dnsx', 'httpx', 'fscan', 'gogo'] },
  { key: 'scan', title: '端口与服务', hint: '精扫与速率控制', ids: ['nmap', 'masscan'] },
  { key: 'vuln', title: '漏洞验证', hint: '模板验证与目录爆破', ids: ['nuclei', 'ffuf'] },
  { key: 'tunnel', title: '隧道与横向', hint: '落地、代理、凭据', ids: ['suo5', 'frpc', 'frps', 'chisel', 'impacket'] },
]

const ENV_SRC_LABEL = { config: '手填', toolkit: '工具箱', binDir: '搜索目录', path: '系统 PATH', missing: '未找到' }

const envTag = (ok, text, extra) => h('span', { className: 'rt-tag ' + (ok ? 'rt-tag-live' : 'rt-tag-warn') + (extra || '') }, text)

const envCaret = () => h('svg', { width: 9, height: 9, viewBox: '0 0 12 12', 'aria-hidden': 'true' },
  h('path', { d: 'M4 2l4 4-4 4', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }))

function EnvTab(props) {
  const refreshKey = props.refreshKey || 0
  /* 旧单 VPS 环境变量兼容入口：产品主路径由 IntegratedApp.renderGlobalNet 渲染新的
     「密钥与 VPS」页；DrillContent 只在宿主没有注入 renderGlobalNet 时回退到这里。
     分支保留是为了旧宿主仍能改 REDTEAM_VPS_HOST/KEY，不要按多 VPS 语义扩展它。 */
  const connections = props.section === 'connections'
  const environment = props.section === 'environment'
  const [data, setData] = React.useState(null)
  const [draft, setDraft] = React.useState(null)
  const [err, setErr] = React.useState(null)
  const [msg, setMsg] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [folderPath, setFolderPath] = React.useState('')
  /* 折叠状态：默认全部收起，只记「用户主动展开过」的节点 */
  const [expanded, setExpanded] = React.useState({})
  const [onlyMissing, setOnlyMissing] = React.useState(false)

  const applyDraftFrom = (r) => {
    const c = (r && r.config) || {}
    setDraft({
      platform: c.platform || 'auto',
      toolkitDir: c.toolkitDir || '',
      nucleiTemplatesDir: c.nucleiTemplatesDir || '',
      binDirsText: (c.binDirs || []).join('\n'),
      tools: Object.assign({}, c.tools || {}),
      env: Object.assign({ FOFA_KEY: '', REDTEAM_VPS_HOST: '', REDTEAM_VPS_KEY: '' }, c.env || {}),
      notes: c.notes || '',
    })
    if (c.toolkitDir) setFolderPath(c.toolkitDir)
  }

  const load = () => {
    setBusy(true); setMsg(null)
    api({ op: 'platformConfigGet' }).then((r) => {
      setBusy(false)
      if (!r || r.ok === false) { setErr((r && r.error) || '读取失败'); return }
      setErr(null); setData(r)
      applyDraftFrom(r)
    }, (e) => { setBusy(false); setErr(String((e && e.message) || e)) })
  }
  React.useEffect(load, [refreshKey])

  const save = () => {
    if (!draft) return
    setBusy(true); setMsg(null)
    const config = {
      platform: draft.platform,
      toolkitDir: draft.toolkitDir,
      nucleiTemplatesDir: draft.nucleiTemplatesDir,
      binDirs: String(draft.binDirsText || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
      tools: draft.tools,
      env: draft.env,
      notes: draft.notes,
      envAdaptConfigured: true,
      envAdaptSkip: false,
    }
    if (environment) delete config.env
    if (connections) {
      for (const key of Object.keys(config)) if (key !== 'env') delete config[key]
    }
    api({ op: 'platformConfigSave', config }).then((r) => {
      setBusy(false)
      if (!r || r.ok === false) { setMsg({ err: (r && r.error) || '保存失败' }); return }
      setData(r)
      setMsg({ ok: '已保存到 ' + ((r.config && r.config.path) || '$DSH_HOME/redteam/config.json') })
      applyDraftFrom(r)
    }, (e) => { setBusy(false); setMsg({ err: String((e && e.message) || e) }) })
  }

  const assignFolder = () => {
    const dir = String(folderPath || (draft && draft.toolkitDir) || '').trim()
    if (!dir) { setMsg({ err: '请先填写工具所在文件夹路径' }); return }
    setBusy(true); setMsg(null)
    api({ op: 'platformAssignToolkit', dir }).then((r) => {
      setBusy(false)
      if (!r || r.ok === false) { setMsg({ err: (r && r.error) || '自动分配失败' }); return }
      setData(r)
      applyDraftFrom(r)
      setMsg({
        ok: '已从文件夹分配 ' + (r.assignedCount || 0) + ' 个工具'
          + (r.nucleiTemplatesDir ? '，并识别 nuclei-templates' : ''),
      })
    }, (e) => { setBusy(false); setMsg({ err: String((e && e.message) || e) }) })
  }

  const setTool = (id, value) => setDraft((d) => d ? Object.assign({}, d, { tools: Object.assign({}, d.tools, { [id]: value }) }) : d)
  const setEnv = (key, value) => setDraft((d) => d ? Object.assign({}, d, { env: Object.assign({}, d.env, { [key]: value }) }) : d)

  const runtime = (data && data.runtime) || {}
  const adapt = (data && data.adapt) || {}
  const tools = (data && data.tools && data.tools.items) || []
  const found = tools.filter((t) => t.path).length
  const missingN = tools.length - found
  const defaultToolkit = (data && data.toolkitDir) || '$DSH_HOME/redteam/toolkit'
  const defaultNuclei = (data && data.nucleiTemplatesDir) || (defaultToolkit + '/nuclei-templates')

  const toolById = {}
  for (const t of tools) toolById[t.id] = t
  const groups = (() => {
    const known = new Set()
    const out = ENV_TOOL_GROUPS.map((g) => {
      const items = g.ids.map((id) => toolById[id]).filter(Boolean)
      for (const t of items) known.add(t.id)
      return { key: g.key, title: g.title, hint: g.hint, items }
    })
    const rest = tools.filter((t) => !known.has(t.id))
    if (rest.length) out.push({ key: 'other', title: '其它', hint: '目录里多出来的工具', items: rest })
    return out.filter((g) => g.items.length)
  })()

  /* ---- 树：折叠 / 展开 ---- */
  const open = (k) => expanded[k] === true
  const toggleKey = (k) => setExpanded((c) => {
    const n = Object.assign({}, c)
    if (n[k]) delete n[k]
    else n[k] = true
    return n
  })
  const allKeys = () => {
    const keys = ['cfg:folder', 'cfg:dir', 'cfg:tools', 'cfg:keys', 'cfg:egress', 'cfg:notes']
    for (const g of groups) {
      keys.push('grp:' + g.key)
      for (const t of g.items) keys.push('tool:' + t.id)
    }
    return keys
  }
  const expandAll = () => {
    const n = {}
    for (const k of allKeys()) n[k] = true
    setExpanded(n)
  }
  const collapseAll = () => setExpanded({})

  /** 一行树节点：caret + 状态点 + 名称 + 摘要 + 右侧标签。 */
  const row = (o) => h('div', {
    key: o.key,
    className: 'rt-trow' + (o.depth === 0 ? ' rt-trow-root' : ''),
    style: { paddingLeft: 8 + o.depth * 15 },
    onClick: o.hasKids ? o.onClick : undefined,
    role: o.hasKids ? 'button' : undefined,
    tabIndex: o.hasKids ? 0 : undefined,
    'aria-expanded': o.hasKids ? (o.open ? 'true' : 'false') : undefined,
    onKeyDown: o.hasKids
      ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); o.onClick() } }
      : undefined,
  },
    o.hasKids ? h('span', { className: 'rt-caret' + (o.open ? ' open' : '') }, envCaret()) : h('span', { className: 'rt-caret rt-caret-leaf' }),
    o.st ? h('span', { className: 'rt-env-dot ' + o.st, 'aria-hidden': 'true' }) : null,
    h('span', { className: 'rt-tlabel' }, o.label),
    o.meta ? h('span', { className: 'rt-tmeta', title: o.meta }, o.meta) : null,
    h('span', { className: 'rt-spacer' }),
    o.right || null)

  const kids = (nodeKey, depth, children) => {
    if (!open(nodeKey) || !children || !children.length) return null
    return h('div', { className: 'rt-tkids', style: { marginLeft: 15 + depth * 15 } }, children.filter(Boolean))
  }

  const field = (key, label, node) => h('label', { key: key, className: 'rt-env-field' },
    h('span', { className: 'rt-env-field-label' }, label), node)

  /* ---- 叶子：单个工具（点开才出输入框） ---- */
  const toolNode = (t, depth) => {
    const key = 'tool:' + t.id
    const isOpen = open(key)
    const st = t.path ? 'ok' : (t.configured ? 'warn' : 'miss')
    const meta = t.path
      ? ((ENV_SRC_LABEL[t.source] || t.source) + ' · ' + t.path)
      : ((t.names || []).slice(0, 3).join(' / ') || '未找到')
    const manual = (draft && draft.tools && draft.tools[t.id]) || ''
    const tagText = t.path ? '到位' : (t.configured ? '路径失效' : '未到位')
    return h('div', { key: key },
      row({
        key: 'r', depth: depth, label: t.label || t.id, meta: meta, st: st,
        hasKids: true, open: isOpen, onClick: () => toggleKey(key),
        right: envTag(!!t.path, tagText),
      }),
      isOpen ? h('div', { className: 'rt-env-body', style: { paddingLeft: 30 + depth * 15 } },
        h('div', { className: 'rt-env-inline' },
          h('input', {
            className: 'rt-input', style: { flex: 1 },
            placeholder: '留空自动找：' + ((t.names || []).slice(0, 3).join(' / ') || t.id),
            value: manual,
            onChange: (e) => setTool(t.id, e.target.value),
          }),
          manual ? h('button', { className: 'rt-btn', onClick: () => setTool(t.id, '') }, '清空') : null),
        t.note ? h('div', { className: 'rt-env-note-warn' }, t.note) : null,
        t.path
          ? h('div', { className: 'rt-env-path' }, '解析到：' + t.path + '（' + (ENV_SRC_LABEL[t.source] || t.source) + '）')
          : h('div', { className: 'rt-env-path' }, '解析顺序：手填绝对路径 → 工具箱 → 搜索目录 → PATH。改完点右上角「保存」。')) : null)
  }

  /* ---- 分组节点：直接给「n/m 到位」 ---- */
  const groupNode = (g, depth) => {
    const key = 'grp:' + g.key
    const items = onlyMissing ? g.items.filter((t) => !t.path) : g.items
    if (!items.length) return null
    const okN = g.items.filter((t) => t.path).length
    const allOk = okN === g.items.length
    return h('div', { key: key },
      row({
        key: 'r', depth: depth, label: g.title, meta: g.hint,
        st: allOk ? 'ok' : (okN ? 'warn' : 'miss'),
        hasKids: true, open: open(key), onClick: () => toggleKey(key),
        right: envTag(allOk, okN + '/' + g.items.length + ' 到位'),
      }),
      kids(key, depth, items.map((t) => toolNode(t, depth + 1))))
  }

  const envKeys = ['FOFA_KEY', 'REDTEAM_VPS_HOST', 'REDTEAM_VPS_KEY']
  const envFilled = envKeys.filter((k) => draft && draft.env && String(draft.env[k] || '').trim()).length
  const dirSaved = !!(draft && (String(draft.toolkitDir || '').trim() || String(draft.nucleiTemplatesDir || '').trim() || String(draft.binDirsText || '').trim()))
  const egress = (data && data.egress) || null
  const egressOn = !!(egress && (egress.http_proxy || egress.https_proxy || egress.all_proxy))

  /* ---- 配置节点通用外壳：一行标题 + 折叠正文 ---- */
  const cfgNode = (o) => h('div', { key: o.id },
    row({
      key: 'r', depth: 0, label: o.label, meta: o.meta, st: o.st || null,
      hasKids: !!o.children, open: open(o.id), onClick: () => toggleKey(o.id),
      right: o.right || null,
    }),
    o.children ? kids(o.id, 0, [
      h('div', { key: 'body', className: 'rt-env-body', style: { paddingLeft: 30 } }, o.children),
    ]) : null)

  const cfgFolder = cfgNode({
    id: 'cfg:folder',
    label: '整包文件夹 → 自动分配',
    meta: (draft && draft.toolkitDir) ? draft.toolkitDir : '工具都在一个文件夹（含子目录）时用这个',
    st: (draft && draft.toolkitDir) ? 'ok' : null,
    right: h('span', { className: 'rt-tag' }, '扫描匹配'),
    children: [
      h('div', { key: 'in', className: 'rt-env-inline' },
        h('input', {
          className: 'rt-input', style: { flex: 1 },
          placeholder: '例如 D:\\pentest-tools 或 /opt/toolkit',
          value: folderPath,
          onChange: (e) => setFolderPath(e.target.value),
          onKeyDown: (e) => { if (e.key === 'Enter') assignFolder() },
        }),
        h('button', { className: 'rt-btn rt-btn-primary', disabled: busy, onClick: assignFolder },
          busy ? '扫描中…' : '自动分配')),
      h('div', { key: 'tip', className: 'rt-env-path' },
        '写入 toolkitDir，并按文件名把 nmap / nuclei / fscan 等填到对应工具节点。'),
    ],
  })

  const cfgDir = cfgNode({
    id: 'cfg:dir',
    label: '平台与目录',
    meta: (draft ? (draft.platform || 'auto') : 'auto') + ' · ' + ((draft && draft.toolkitDir) ? draft.toolkitDir : '工具箱默认'),
    st: dirSaved ? 'ok' : 'warn',
    right: envTag(dirSaved, dirSaved ? '已配置' : '走默认'),
    children: draft ? [
      field('platform', '平台模式',
        h(PurgeSelect, {
          'aria-label': '平台模式', size: 'sm', className: 'rt-select-block',
          value: draft.platform,
          onChange: (value) => setDraft(Object.assign({}, draft, { platform: value })),
          options: [
            { value: 'auto', label: 'auto（跟随本机，默认）' },
            { value: 'windows', label: 'windows' },
            { value: 'linux', label: 'linux' },
          ],
        })),
      field('toolkit', '工具箱目录 toolkitDir（留空＝默认）',
        h('input', {
          className: 'rt-input', style: { display: 'block', width: '100%', marginTop: 4 },
          placeholder: '默认：' + defaultToolkit,
          value: draft.toolkitDir,
          onChange: (e) => setDraft(Object.assign({}, draft, { toolkitDir: e.target.value })),
        })),
      field('nuclei', 'nuclei 模板目录（留空＝自动：toolkit/nuclei-templates）',
        h('input', {
          className: 'rt-input', style: { display: 'block', width: '100%', marginTop: 4 },
          placeholder: '默认：' + defaultNuclei,
          value: draft.nucleiTemplatesDir,
          onChange: (e) => setDraft(Object.assign({}, draft, { nucleiTemplatesDir: e.target.value })),
        })),
      field('bindirs', '工具搜索目录 binDirs（留空＝只搜 toolkit + PATH；每行一个）',
        h('textarea', {
          className: 'rt-input', rows: 4,
          style: { display: 'block', width: '100%', marginTop: 4, fontFamily: 'var(--xsdsh-font-ui, sans-serif)' },
          placeholder: '可选。例如：' + String.fromCharCode(10) + 'D:\\tools' + String.fromCharCode(10) + 'D:\\pentest-bin',
          value: draft.binDirsText,
          onChange: (e) => setDraft(Object.assign({}, draft, { binDirsText: e.target.value })),
        })),
    ] : [],
  })

  const cfgTools = cfgNode({
    id: 'cfg:tools',
    label: '工具链',
    meta: tools.length ? '按用途分组 · 点组展开' : '加载中…',
    st: tools.length ? (found === tools.length ? 'ok' : (found ? 'warn' : 'miss')) : null,
    right: envTag(tools.length > 0 && found === tools.length, found + '/' + tools.length + ' 到位'),
    children: groups.map((g) => groupNode(g, 1)),
  })

  const cfgKeys = cfgNode({
    id: 'cfg:keys',
    label: '密钥与 VPS',
    meta: 'FOFA_KEY / REDTEAM_VPS_HOST / REDTEAM_VPS_KEY · 留空＝不覆盖',
    st: envFilled === 3 ? 'ok' : (envFilled ? 'warn' : null),
    right: h('span', { className: 'rt-tag' + (envFilled === 3 ? ' rt-tag-live' : (envFilled ? ' rt-tag-active' : '')) }, envFilled + '/3 已填'),
    children: draft ? envKeys.map((k) => field(k, k + '（可选）',
      k === 'FOFA_KEY'
        ? h(SecretInput, {
          className: 'rt-secret-field', inputClassName: 'rt-input', 'aria-label': 'FOFA_KEY',
          placeholder: '留空；测绘时再填',
          value: (draft.env && draft.env[k]) || '',
          onChange: (value) => setEnv(k, value),
        })
        : h('input', {
          className: 'rt-input', style: { display: 'block', width: '100%', marginTop: 4 },
          type: 'text',
          placeholder: k === 'REDTEAM_VPS_KEY'
            ? '留空；需要时填私钥绝对路径'
            : '留空；需要时填 user@host',
          value: (draft.env && draft.env[k]) || '',
          onChange: (e) => setEnv(k, e.target.value),
        }))) : [],
  })

  const cfgEgress = cfgNode({
    id: 'cfg:egress',
    label: '出网状态（只读）',
    meta: egress ? ('HTTP_PROXY=' + (egress.http_proxy || '(空)')) : '无数据',
    st: egressOn ? 'ok' : null,
    right: egress ? h('span', { className: 'rt-tag' + (egressOn ? ' rt-tag-live' : '') }, egressOn ? '有代理' : '直连') : null,
    children: egress ? [
      h('div', { key: 'h', className: 'rt-mono rt-env-path' }, 'HTTP_PROXY=' + (egress.http_proxy || '(空)')),
      h('div', { key: 's', className: 'rt-mono rt-env-path' }, 'HTTPS_PROXY=' + (egress.https_proxy || '(空)')),
      h('div', { key: 'a', className: 'rt-mono rt-env-path' }, 'ALL_PROXY=' + (egress.all_proxy || '(空)')),
      h('div', { key: 'n', className: 'rt-mono rt-env-path' }, 'NO_PROXY=' + (egress.no_proxy || '(空)')),
      h('div', { key: 'note', className: 'rt-env-path' }, egress.note || ''),
    ] : [],
  })

  const cfgNotes = cfgNode({
    id: 'cfg:notes',
    label: '备注',
    meta: (draft && draft.notes) ? draft.notes.slice(0, 48) : '可选，例如工具来自某某绿色包',
    children: draft ? [
      h('textarea', {
        key: 'ta',
        className: 'rt-input', rows: 3, style: { width: '100%' },
        placeholder: '可选。例如：工具来自某某绿色包',
        value: draft.notes,
        onChange: (e) => setDraft(Object.assign({}, draft, { notes: e.target.value })),
      }),
    ] : [],
  })

  return h('div', { className: 'rt-main' },
    h('div', { className: 'rt-toolbar' },
      h('span', { style: { fontWeight: 600 } }, connections ? '密钥与出网' : '环境适配'),
      h('span', { className: 'rt-tag' }, runtime.effective === 'windows' ? 'Windows' : 'Linux/Kali'),
      adapt.kali ? h('span', { className: 'rt-tag rt-tag-live' }, 'Kali') : null,
      h('span', { className: 'rt-tag' + (adapt.ready ? ' rt-tag-live' : ' rt-tag-warn') },
        adapt.ready ? ('就绪 · ' + (adapt.reason || '')) : '待配置'),
      h('span', { className: 'rt-tag' + (found ? ' rt-tag-live' : ' rt-tag-warn') }, '工具 ' + found + '/' + tools.length),
      h('div', { className: 'rt-spacer' }),
      h('button', { className: 'rt-btn', disabled: busy, onClick: load }, busy ? '读取中…' : '刷新'),
      h('button', { className: 'rt-btn rt-btn-primary', disabled: busy || !draft, onClick: save }, '保存')),
    h('div', { className: 'rt-pane', style: { minHeight: 0 } },
      err ? h('div', { className: 'rt-err' }, err) : null,
      msg ? h('div', { className: msg.err ? 'rt-err' : 'rt-foot' }, msg.err || msg.ok) : null,
      /* 顶部总览：分段进度 + 缺口数 + 过滤/展开开关 */
      connections ? null : h('div', { className: 'rt-env-sum' },
        h('span', { className: 'rt-env-sum-label' }, '到位'),
        h('span', { className: 'rt-env-sum-n' }, found + '/' + tools.length),
        h('div', { className: 'rt-env-bar', role: 'img', 'aria-label': '工具到位进度 ' + found + ' / ' + tools.length },
          tools.length
            ? tools.map((t, i) => h('span', {
              key: 'seg' + i,
              className: 'rt-env-seg' + (t.path ? ' ok' : ''),
              title: (t.label || t.id) + (t.path ? ' · 到位' : ' · 未到位'),
            }))
            : h('span', { className: 'rt-env-seg' })),
        h('span', { className: 'rt-tag ' + (missingN ? 'rt-tag-warn' : 'rt-tag-live') }, '未到位 ' + missingN),
        h('div', { className: 'rt-spacer' }),
        h('button', {
          className: 'rt-btn' + (onlyMissing ? ' rt-btn-primary' : ''), disabled: !tools.length,
          onClick: () => setOnlyMissing((v) => !v),
        }, onlyMissing ? '只看未到位 ✓' : '只看未到位'),
        h('button', { className: 'rt-btn', onClick: expandAll }, '展开全部'),
        h('button', { className: 'rt-btn', onClick: collapseAll }, '折叠全部')),
      h('div', { className: 'rt-card', style: { margin: '0 0 8px', fontSize: 12, lineHeight: 1.6 } },
        adapt.message
          || '均可选填：留空则用默认路径/自动查找。填了的覆盖默认。密钥类只在需要测绘/反弹时才填。'),
      h('div', { className: 'rt-env-tree' },
        connections ? null : cfgFolder, connections ? null : cfgDir, connections ? null : cfgTools,
        environment ? null : cfgKeys, connections ? null : cfgEgress, connections ? null : cfgNotes),
      data && data.hint
        ? h('div', { className: 'rt-card', style: { margin: '8px 0 0', fontSize: 12, lineHeight: 1.6 } }, data.hint)
        : null,
      h('div', { className: 'rt-foot' },
        h('span', null,
          '配置文件：' + ((data && data.config && data.config.path) || '$DSH_HOME/redteam/config.json')
          + ' | 留空字段全部走默认'))))
}

export { ENV_TOOL_GROUPS, ENV_SRC_LABEL, envTag, envCaret, EnvTab };
