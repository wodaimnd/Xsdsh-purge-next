// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { api } from './api.js';
import { copyWithFeedback, fmt, clickable } from './helpers.js';
import { useCollapse, Section } from './primitives.js';

function SessionTab(props) {
  const eng = props.engagement
  const refreshKey = props.refreshKey || 0
  const [data, setData] = React.useState(null)
  const [err, setErr] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [msg, setMsg] = React.useState(null)
  const [copied, setCopied] = React.useState(null)
  const copyTimer = React.useRef(null)
  const mounted = React.useRef(false)
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearTimeout(copyTimer.current) } }, [])

  const load = () => {
    if (!eng) return
    api({ op: 'sessions', engagement: eng }).then((r) => {
      if (!r || r.ok === false) { setErr((r && r.error) || '读取失败'); return }
      setErr(null)
      setData(r)
    }, (e) => setErr(String((e && e.message) || e)))
  }
  React.useEffect(load, [eng, refreshKey])

  const probe = () => {
    setBusy(true); setMsg(null)
    api({ op: 'probeSessions', engagement: eng, timeoutMs: 6000 }).then((r) => {
      setBusy(false)
      if (!r || r.ok === false) { setMsg({ err: (r && r.error) || '检测失败' }); load(); return }
      const on = (r.webshells || []).filter((x) => x.status === 'online').length
      const act = (r.tunnels || []).filter((x) => x.status === 'active').length
      setMsg({ ok: '检测完成：WebShell 在线 ' + on + '/' + (r.webshells || []).length + '，隧道可用 ' + act + '/' + (r.tunnels || []).length })
      load()
    }, (e) => { setBusy(false); setMsg({ err: String((e && e.message) || e) }) })
  }

  /* 只有真的写进剪贴板才把按钮点亮成「已复制」；失败时如实报错 */
  const copy = (key, text) => copyWithFeedback(text, text, (okFlag, message) => {
    if (!mounted.current) return
    if (!okFlag) { setMsg({ err: message }); return }
    setCopied(key)
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500)
  })

  const markTunnel = (t, status) => {
    setMsg(null)
    api({ op: 'updateTunnel', engagement: eng, id: t.id, patch: { status: status, check_note: '界面手动标记' } })
      .then(() => load(), (e) => setMsg({ err: String((e && e.message) || e) }))
  }
  const markShell = (w, status) => {
    setMsg(null)
    api({ op: 'updateWebshell', engagement: eng, id: w.id, patch: { status: status, check_note: '界面手动标记' } })
      .then(() => load(), (e) => setMsg({ err: String((e && e.message) || e) }))
  }

  const sessCollapse = useCollapse('sessions:' + eng)
  const totals = (data && data.totals) || {}
  const shells = (data && data.webshells) || []
  const tunnels = (data && data.tunnels) || []
  const statusDot = (s) => h('span', { className: s === 'online' || s === 'active' ? 'rt-dot-on' : (s === 'unknown' || !s ? 'rt-dot-unk' : 'rt-dot-off') })
  /* 卡片里统一用「标签 + 值」两列，长文本自动换行 —— 比一行点分隔好扫读 */
  const fact = (label, value) => h('div', { className: 'rt-sess-fact' }, h('b', null, label), h('span', null, value))
  /* 交付要求：马必须是冰蝎/哥斯拉加密马（用户才连得上），内网必须走 suo5 隧道 */
  const isEncryptedShell = (t) => /behinder|godzilla|冰蝎|哥斯拉/i.test(String(t || ''))
  const isSuo5 = (t) => /suo5/i.test(String(t || ''))
  /* 提示条：只留一句结论 + 可展开的做法（原来是把三段长解释平铺，正文全被淹掉） */
  const hint = (key, title, detail) => h('div', { key, className: 'rt-hint' },
    h('b', null, title),
    h('details', { className: 'rt-sess-fold', style: { marginTop: 3 } },
      h('summary', null, '怎么做（点击展开）'),
      h('div', { style: { marginTop: 4 } }, detail)))
  const hints = []
  const badShells = shells.filter((w) => !isEncryptedShell(w.shell_type))
  const legitTunnels = tunnels.filter((t) => t.legit === true)
  if (badShells.length > 0) {
    hints.push(hint('h1', '有 ' + badShells.length + ' 个入口不是冰蝎马/哥斯拉马（用户连不上，不算可交付入口）',
      '用技能 webshell-toolkit 重新上传冰蝎马（behinder）或哥斯拉马（godzilla），'
      + '并把 shell_type + pass_key 写进 redteam_webshell_add。只作临时中转的可在备注里写明。'))
  }
  if (tunnels.length > 0 && legitTunnels.length === 0) {
    hints.push(hint('h3', '现有 ' + tunnels.length + ' 条通道都不算"跨越靶标边界"（不算边界/内网突破）',
      '自己的 VPS / 自建服务器上开的 socks5、frp、代理不算隧道。必须是目标侧发起的通道：'
      + '目标反弹 shell 到我方、目标上跑 frp/Stowaway 客户端、或经目标 WebShell 建的 suo5/HTTP 隧道；登记时用 entry_kind 说明。'))
  }
  const activeSuo5 = tunnels.filter((t) => isSuo5(t.kind) && t.status === 'active')
  if (shells.length > 0 && activeSuo5.length === 0) {
    hints.push(hint('h2', '还没有可用的 suo5 隧道（打进内网的标准通道）',
      '用技能 suo5-tunnel 通过上面的 WebShell 建 socks5 隧道，再 redteam_tunnel_add'
      + '（kind=suo5、listen=127.0.0.1:1080、entry=WebShell URL、reach=可达网段）登记，'
      + '最后点「检测连通性」确认 status=active。'))
  }

  const shellCards = shells.map((w) => h('div', { key: 'w' + w.id, className: 'rt-sess' },
    h('div', { className: 'rt-sess-head' },
      statusDot(w.status),
      h('span', { className: 'rt-sess-title' }, w.url),
      h('span', { className: 'rt-tag rt-tag-active' }, w.shell_type || 'webshell'),
      isEncryptedShell(w.shell_type) ? null : h('span', { className: 'rt-tag rt-tag-warn' }, '用户连不上'),
      w.privilege ? h('span', { className: 'rt-tag' }, w.privilege) : null,
      h('div', { className: 'rt-spacer' }),
      copied === 'cmd' + w.id
        ? h('span', { className: 'rt-tag', style: { color: '#10b981' } }, '已复制')
        : h('button', {
            className: 'rt-btn', style: { padding: '0 6px', fontSize: 11 },
            onClick: () => copy('cmd' + w.id, 'curl -s "' + w.url + '"'),
          }, '复制 URL'),
      h('button', {
        className: 'rt-btn', style: { padding: '0 6px', fontSize: 11 },
        onClick: () => markShell(w, 'offline'),
      }, '标记失效')),
    h('div', { className: 'rt-sess-facts' },
      fact('类型', (isEncryptedShell(w.shell_type) ? '加密马（冰蝎/哥斯拉，用户可直连）' : '非加密马 —— 用户连不上，仅可作临时中转')),
      w.pass_key ? fact('连接口令', h('span', { className: 'rt-mono' }, w.pass_key)) : null,
      w.asset_ip ? fact('所在资产', w.asset_ip) : null,
      w.privilege ? fact('权限', w.privilege) : null,
      w.secret_ref ? fact('凭据引用', h('span', { className: 'rt-mono' }, w.secret_ref)) : null,
      fact('最后检测', (w.last_check ? fmt(w.last_check) : '未检测')
        + (w.latency_ms !== null && w.latency_ms !== undefined ? '（' + w.latency_ms + 'ms）' : '')),
      w.check_note ? fact('检测说明', w.check_note) : null,
      w.note ? fact('备注', w.note) : null)))

  const tunnelCards = tunnels.map((t) => {
    const proxy = t.listen ? 'socks5://' + t.listen : ''
    const gogoCmd = t.listen ? './gogo -i <内网CIDR> -m ss --ping -p top2,win,db --proxy ' + proxy : ''
    const fscanCmd = t.listen ? './fscan -h <内网CIDR> -np -nobr -nopoc -socks5 ' + t.listen + ' -o intranet.txt' : ''
    return h('div', { key: 't' + t.id, className: 'rt-sess' },
      h('div', { className: 'rt-sess-head' },
        statusDot(t.status),
        h('span', { className: 'rt-sess-title' }, t.listen || '(未填监听地址)'),
        h('span', { className: 'rt-tag rt-tag-passive' }, t.kind || 'tunnel'),
        isSuo5(t.kind) ? null : h('span', { className: 'rt-tag rt-tag-warn' }, '非 suo5 标准通道'),
        /* 只有跨越靶标边界的通道才算突破凭证（自己 VPS/自建服务器上开的不算） */
        t.legit === true
          ? h('span', { className: 'rt-tag rt-tag-live', title: t.entry_kind_label || '' }, '目标侧通道')
          : (t.legit === false
              ? h('span', { className: 'rt-tag rt-tag-warn', title: '只在自己 VPS/自建服务器上开的通道，没有碰到目标 —— 不算边界突破/内网突破' }, '不算突破')
              : h('span', { className: 'rt-tag', title: '未声明 entry_kind：请说明目标侧的那一端是什么（target-outbound / target-http / target-agent）' }, '待确认')),
        t.reach ? h('span', { className: 'rt-tag' }, '可达 ' + t.reach) : null,
        h('div', { className: 'rt-spacer' }),
        h('button', {
          className: 'rt-btn', style: { padding: '0 6px', fontSize: 11 },
          onClick: () => copy('sock' + t.id, t.listen || ''),
        }, copied === 'sock' + t.id ? '已复制' : '复制地址'),
        t.status === 'active'
          ? h('button', { className: 'rt-btn', style: { padding: '0 6px', fontSize: 11 }, onClick: () => markTunnel(t, 'down') }, '标记失效')
          : h('button', { className: 'rt-btn', style: { padding: '0 6px', fontSize: 11 }, onClick: () => markTunnel(t, 'active') }, '标记可用')),
      h('div', { className: 'rt-sess-facts' },
        fact('目标侧入口', t.entry || '未登记'),
        fact('跨越边界', t.legit === true
          ? h('span', { className: 'rt-tag rt-tag-live' }, t.entry_kind_label || t.entry_kind || '已确认目标侧')
          : (t.legit === false
              ? h('span', { className: 'rt-tag rt-tag-warn' }, '不算突破（只在自己 VPS 上开代理）')
              : h('span', { className: 'rt-tag' }, '未声明 entry_kind，待确认'))),
        t.reach ? fact('可达网段', t.reach) : null,
        t.asset_ip ? fact('所在资产', t.asset_ip) : null,
        fact('最后检测', (t.last_check ? fmt(t.last_check) : '未检测')
          + (t.latency_ms !== null && t.latency_ms !== undefined ? '（' + t.latency_ms + 'ms）' : '')),
        t.check_note ? fact('检测说明', t.check_note) : null,
        t.note ? fact('备注', t.note) : null),
      /* 命令默认折叠：卡片首要信息是"这条通道能不能用、通向哪"，命令按需展开 */
      t.command ? h('details', { className: 'rt-sess-fold' },
        h('summary', null, '建立命令（点击展开 / 复制）'),
        h('div', Object.assign({ className: 'rt-code', title: '点击复制' }, clickable(() => copy('c' + t.id, t.command), { label: '复制命令' })),
          copied === 'c' + t.id ? '已复制' : t.command)) : null,
      t.status === 'active' && t.listen
        ? h('details', { className: 'rt-sess-fold' },
            h('summary', null, '走这条隧道扫描（gogo / fscan 命令）'),
            h('div', { className: 'rt-sess-cmd' },
              h('div', Object.assign({ className: 'rt-code', title: '点击复制' }, clickable(() => copy('g' + t.id, gogoCmd), { label: '复制 gogo 命令' })),
                copied === 'g' + t.id ? '已复制' : gogoCmd),
              h('div', Object.assign({ className: 'rt-code', style: { display: 'block', marginTop: 3 }, title: '点击复制' }, clickable(() => copy('f' + t.id, fscanCmd), { label: '复制 fscan 命令' })),
                copied === 'f' + t.id ? '已复制' : fscanCmd)))
        : null)
  })

  return h('div', { className: 'rt-main' },
    h('div', { className: 'rt-toolbar' },
      h('span', { style: { fontWeight: 600 } }, '会话与入口'),
      h('span', { className: 'rt-tag' }, 'WebShell ' + (totals.webshellsOnline || 0) + '/' + (totals.webshells || 0) + ' 在线'),
      h('span', { className: 'rt-tag' }, '隧道 ' + (totals.tunnelsActive || 0) + '/' + (totals.tunnels || 0) + ' 可用'),
      h('span', { className: 'rt-tag' }, '凭据 ' + (totals.credentials || 0)),
      h('span', { className: 'rt-tag' }, '访问会话 ' + (totals.access || 0)),
      h('div', { className: 'rt-spacer' }),
      h('button', { className: 'rt-btn rt-btn-primary', disabled: busy, onClick: probe }, busy ? '检测中…' : '检测连通性'),
      h('button', { className: 'rt-btn', onClick: load }, '刷新')),
    msg ? h('div', { className: msg.err ? 'rt-err' : 'rt-foot' }, msg.err || msg.ok) : null,
    err ? h('div', { className: 'rt-err' }, err) : null,
    h('div', { className: 'rt-body', style: { overflow: 'auto' } },
      !shells.length && !tunnels.length
        ? h('div', { className: 'rt-empty' },
            h('div', null, '还没有登记任何 WebShell 或隧道。'),
            h('div', { style: { marginTop: 6, fontSize: 12 } },
              '拿到 WebShell 用 redteam_webshell_add；建好隧道用 redteam_tunnel_add（suo5 / socks5 / ssh -R）；之后智能体用 redteam_sessions 就能看到。'))
        : null,
      hints.length ? h('div', { style: { padding: '8px 10px 0' } }, hints) : null,
      h(Section, {
        key: 'webshells', tone: 'queue', title: 'WebShell',
        count: (totals.webshellsOnline || 0) + '/' + (totals.webshells || 0) + ' 在线',
        sub: '已上线的可控入口',
        open: sessCollapse.isOpen('shells'), onToggle: sessCollapse.toggle('shells'),
      }, shells.length
        ? h('div', { className: 'rt-sess-grid', style: { padding: 0 } }, shellCards)
        : h('div', { className: 'rt-atest-meta' }, '暂无（拿到 WebShell 后用 redteam_webshell_add 登记）')),
      h(Section, {
        key: 'tunnels', tone: 'test', title: '内网隧道',
        count: (totals.tunnelsActive || 0) + '/' + (totals.tunnels || 0) + ' 可用',
        sub: '可直接给扫描器当代理用',
        open: sessCollapse.isOpen('tunnels'), onToggle: sessCollapse.toggle('tunnels'),
      }, tunnels.length
        ? h('div', { className: 'rt-sess-grid', style: { padding: 0 } }, tunnelCards)
        : h('div', { className: 'rt-atest-meta' }, '暂无（建好隧道后用 redteam_tunnel_add 登记）'))))

}

export { SessionTab };
