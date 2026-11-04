// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { api } from './api.js';

function ConcurrencyCard(props) {
  const info = props.concurrency || {}
  const [draft, setDraft] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [msg, setMsg] = React.useState(null)
  React.useEffect(() => { if (info.max) setDraft(String(info.max)) }, [info.max])

  const limit = info.limit || 10
  const used = typeof info.used === 'number' ? info.used : null
  const source = info.source === 'settings' ? '面板中设置'
    : info.source === 'env' ? '环境变量 REDTEAM_MAX_AGENTS' : '默认值'
  const n = Number(draft)
  const invalid = !Number.isFinite(n) || Math.floor(n) !== n || n < 1 || n > limit
  const save = () => {
    if (invalid) return
    setBusy(true); setMsg(null)
    api({ op: 'setAgentsMax', max: n }).then((r) => {
      setBusy(false)
      if (!r || r.ok === false) { setMsg({ err: (r && r.error) || '保存失败' }); return }
      setMsg({ ok: '已保存：并发上限 ' + r.max + '（立即生效，不用重启）' })
      if (props.onSaved) props.onSaved()
    }, (e) => { setBusy(false); setMsg({ err: String((e && e.message) || e) }) })
  }
  return h('div', { className: 'rt-card' },
    h('h4', null, '并发数量'),
    h('div', { style: { fontSize: 12, lineHeight: 1.8, marginBottom: 8 } },
      '同一靶标**同时最多几个执行智能体**。当前生效：**' + (info.max || '?') + '**'
      + (used === null ? '' : '（在跑 ' + used + '，剩余 ' + Math.max((info.max || 0) - used, 0) + '）')
      + '，来源：' + source + '。改完**立即生效**，不用重启。'),
    h('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
      h('input', {
        className: 'rt-input', style: { width: 90 }, type: 'number', min: 1, max: limit,
        value: draft, onChange: (e) => setDraft(e.target.value),
      }),
      h('span', { style: { fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)' } }, '范围 1 – ' + limit),
      h('button', { className: 'rt-btn rt-btn-primary', disabled: busy || invalid, onClick: save },
        busy ? '保存中…' : '保存'),
      msg && msg.err ? h('span', { style: { fontSize: 12, color: 'var(--rt-danger, #d33)' } }, msg.err) : null,
      msg && msg.ok ? h('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)' } }, msg.ok) : null),
    h('div', { className: 'rt-note', style: { marginTop: 8 } },
      '⚠️ 调大不等于更快：**同一个模型 API Key 的并发/速率上限是共享的**，同时派太多会互相挤占，'
      + '表现为排队等待、超时、返回被截断甚至限流报错 —— 反而让测试结果不稳定（漏测、半途而废）。'
      + '建议从 2–3 开始，只有在确认 Key 的额度足够、任务之间确实互不依赖时才调大。'))
}

export { ConcurrencyCard };
