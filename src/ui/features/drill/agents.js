// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { api } from './api.js';
import { ConcurrencyCard } from './concurrency.js';
import { GlobalPrompts } from './GlobalPrompts';

/* 全局「智能体」页：只放并发信息和全局角色模板；目标级提示词在目标配置页。 */
function AgentsTab(props) {
  const refreshKey = props.refreshKey || 0
  const [localKey, setLocalKey] = React.useState(0)
  const [err, setErr] = React.useState(null)
  const [concurrency, setConcurrency] = React.useState(null)
  const [busy, setBusy] = React.useState(false)

  const loadStatus = () => {
    setBusy(true)
    /* 并发名额按"当前跑着的子智能体"算；host 侧读 subagents 注册表 */
    api({ op: 'agentsStatus' }).then((r) => {
      setBusy(false)
      if (!r || r.ok === false) { setErr((r && r.error) || '读取失败'); return }
      setErr(null)
      setConcurrency(r)
    }, (e) => { setBusy(false); setErr(String((e && e.message) || e)) })
  }
  React.useEffect(loadStatus, [refreshKey])
  /* 手动刷新同时拉并发和全局模板；首次挂载只让 GlobalPrompts 自己读一次。 */
  const refresh = () => { setLocalKey((key) => key + 1); loadStatus() }

  const used = concurrency ? concurrency.used : null
  const max = concurrency ? concurrency.max : 3
  return h('div', { className: 'rt-main' },
    h('div', { className: 'rt-toolbar' },
      h('span', { style: { fontWeight: 600 } }, '作战智能体'),
      h('span', { className: 'rt-tag rt-tag-passive' }, '并发上限 ' + max),
      used === null
        ? h('span', { className: 'rt-tag' }, '占用未知')
        : h('span', { className: 'rt-tag' + (used >= max ? ' rt-tag-warn' : ' rt-tag-live') }, '在跑 ' + used + ' / 剩余 ' + Math.max(max - used, 0)),
      h('div', { className: 'rt-spacer' }),
      h('button', { type: 'button', className: 'rt-btn', disabled: busy, onClick: refresh }, busy ? '读取中…' : '刷新')),
    h('div', { className: 'rt-pane' },
      err ? h('div', { className: 'rt-err' }, err) : null,
      h('div', { className: 'rt-card' },
        h('h4', null, '并发规则（硬约束）'),
        h('div', { style: { fontSize: 12, lineHeight: 1.7 } },
          '· 同一靶标**同时最多 ' + max + ' 个执行智能体**；主会话派活前用 `redteam_agent_slot` 占位，满了直接拒绝。',
          h('br'),
          '· **默认一个一个派、按顺序推进**；只有确实互不依赖的活才并行。',
          h('br'),
          '· 每个会话有**自己的靶标绑定**：多会话并行不会把报告写串（子智能体继承父会话的靶标）。')),
      h('div', { className: 'rt-card' },
        h('h4', null, '六个角色'),
        h('div', { style: { fontSize: 12, lineHeight: 1.8 } },
          '① 信息收集 `recon` —— 只收集资产，把单位资产收集完整（含边缘与未备案资产）', h('br'),
          '② 资产梳理 `assess` —— 一条一条过，评易打性并全部落库', h('br'),
          '③ 漏洞发现 `vuln-scan` —— 先查库去重 → Nday/1day 优先 → 接口未授权探测', h('br'),
          '④ 漏洞利用 `exploit` —— 先拿服务器权限（冰蝎/哥斯拉马）+ 建 suo5 隧道，再打其它得分项', h('br'),
          '⑤ 内网渗透 `internal` —— 走隧道，依次拉起 ①②③④ 做内网', h('br'),
          '⑥ 主会话 `plan` —— 只做计划、派活、汇总、汇报，不动手')),
      h(ConcurrencyCard, { concurrency, onSaved: loadStatus }),
      h('div', { className: 'rt-card' },
        h(GlobalPrompts, { refreshKey: refreshKey + localKey }))))
}

export { AgentsTab };
