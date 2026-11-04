/**
 * 拒绝点稳定性复测（新判定器 + 四态）。
 * 用法: node tools/_judge-stability.mjs --prompt=src --maxTokens=900 --runs=3 mode:index [mode:index ...]
 * 输出每条：refused / empty / ok 计数 + 命中词 + 首段。
 */
import fs from 'node:fs'
import path from 'node:path'
import { loadPromptText } from '../lib/refusal-test.js'
import { casesFor, isRefusal } from '../lib/refusal-cases.mjs'

const ROOT = 'D:/渗透/逆向模式/dsh-purge'
const argv = process.argv.slice(2)
const flag = (n, d) => {
  const h = argv.find((a) => a.startsWith('--' + n + '='))
  return h ? h.slice(n.length + 3) : d
}
const promptSrc = flag('prompt', 'src')
const maxTokens = Number(flag('maxTokens', '900'))
const runs = Number(flag('runs', '3'))
/* thinking=off：给 starapi 传 thinking:{type:'disabled'}，把 reasoning_content 关掉，
   否则 maxTokens 会被思维链吃光，content 为空（v3 基线里 5 条 empty 全是这个成因）。 */
const thinking = flag('thinking', 'on')
const targets = argv.filter((a) => !a.startsWith('--')).map((s) => {
  const [m, i] = s.split(':')
  return { mode: m, index: Number(i) }
})

const proot = promptSrc === 'src'
  ? ROOT
  : path.join(process.env.USERPROFILE || '', '.dsh', 'profiles', 'desktop', 'node_modules', 'Xsdsh-purge-next')
const y = path.join(process.env.USERPROFILE || '', '.dsh', '.credentials.yaml')
const KEY = (fs.readFileSync(y, 'utf8').match(/STARAPI_API_KEY:\s*([^\s,}]+)/) || [])[1]
if (!KEY) { console.log('缺少 STARAPI_API_KEY'); process.exit(2) }

const sysCache = new Map()
async function sys(mode) {
  if (!sysCache.has(mode)) sysCache.set(mode, await loadPromptText(fs, path, proot, mode))
  return sysCache.get(mode)
}

async function one(mode, index) {
  const system = await sys(mode)
  const ask = casesFor(mode)[index - 1]
  const res = await fetch('https://www.starapi.io/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-v4.1-flash', max_tokens: maxTokens, stream: true,
      ...(thinking === 'off' ? { thinking: { type: 'disabled' } } : {}),
      messages: [{ role: 'system', content: system }, { role: 'user', content: ask }],
    }),
    signal: AbortSignal.timeout(300000),
  })
  if (!res.ok) return { http: res.status, error: 'HTTP ' + res.status, content: '', reasoning: '', finish: '' }
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = '', content = '', reasoning = '', finish = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() || ''
    for (const line of lines) {
      const s = line.trim()
      if (!s.startsWith('data:')) continue
      const p = s.slice(5).trim()
      if (!p || p === '[DONE]') continue
      let j
      try { j = JSON.parse(p) } catch { continue }
      const ch = j.choices && j.choices[0]
      if (!ch) continue
      const d = ch.delta || {}
      if (typeof d.content === 'string') content += d.content
      if (typeof d.reasoning_content === 'string') reasoning += d.reasoning_content
      if (ch.finish_reason) finish = ch.finish_reason
    }
  }
  return { http: res.status, error: '', content, reasoning, finish }
}

console.log(`prompt=${promptSrc} (${proot})  maxTokens=${maxTokens}  runs=${runs}`)
for (const t of targets) {
  const ask = casesFor(t.mode)[t.index - 1]
  console.log(`\n===== ${t.mode} #${t.index}: ${ask}`)
  let ref = 0, emp = 0, ok = 0, err = 0
  for (let r = 1; r <= runs; r += 1) {
    const o = await one(t.mode, t.index)
    if (o.error) { err += 1; console.log(`  run${r}: ERROR ${o.error}`); continue }
    const empty = !o.content.trim()
    const v = empty ? { refused: false, hit: '', where: '' } : isRefusal(o.content)
    if (empty) emp += 1
    else if (v.refused) ref += 1
    else ok += 1
    console.log(`  run${r}: ${empty ? 'EMPTY' : v.refused ? 'REFUSED' : 'ok'} hit=${JSON.stringify(v.hit)} content=${o.content.length} reasoning=${o.reasoning.length} finish=${o.finish}`)
    if (v.refused) console.log(`      ${o.content.replace(/\n/g, ' ').slice(0, 260)}`)
    if (empty) console.log(`      reasoning head: ${o.reasoning.replace(/\n/g, ' ').slice(0, 200)}`)
  }
  console.log(`  => refused=${ref} empty=${emp} ok=${ok} err=${err}`)
}
