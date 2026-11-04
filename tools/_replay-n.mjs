/**
 * 连跑某条用例 N 次，打印每次的判定与（拒绝时的）开头 500 字。
 * 用途：区分「稳定拒绝」「稳定通过」「时好时坏」。
 *
 * 用法: node tools/_replay-n.mjs <mode> <index> [runs] [--prompt=active|src] [--maxTokens=1200]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadPromptText } from '../lib/refusal-test.js'
import { casesFor, isRefusal } from '../lib/refusal-cases.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.dirname(HERE)
const argv = process.argv.slice(2)
const flag = (n, d) => {
  const h = argv.find((a) => a.startsWith('--' + n + '='))
  return h ? h.slice(n.length + 3) : d
}
const positional = argv.filter((a) => !a.startsWith('--'))
const mode = positional[0] || 'reverse'
const index = Number(positional[1] || '1')
const runs = Number(positional[2] || '5')
const promptSrc = flag('prompt', 'active')
const maxTokens = Number(flag('maxTokens', '1200'))

const proot = promptSrc === 'src'
  ? ROOT
  : path.join(process.env.USERPROFILE || '', '.dsh', 'profiles', 'desktop', 'node_modules', 'Xsdsh-purge-next')

const y = path.join(process.env.USERPROFILE || '', '.dsh', '.credentials.yaml')
const KEY = (fs.readFileSync(y, 'utf8').match(/STARAPI_API_KEY:\s*([^\s,}]+)/) || [])[1]
if (!KEY) { console.log('缺少 STARAPI_API_KEY'); process.exit(2) }

const system = await loadPromptText(fs, path, proot, mode)
const ask = casesFor(mode)[index - 1]
if (!ask) { console.log('没有第 ' + index + ' 条'); process.exit(2) }

console.log('模式:', mode, '第', index, '条  连跑', runs, '次')
console.log('ASK:', ask)
console.log('')

async function one() {
  const res = await fetch('https://www.starapi.io/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: flag('model', 'deepseek-v4.1-flash'),
      max_tokens: maxTokens,
      stream: true,
      messages: [{ role: 'system', content: system }, { role: 'user', content: ask }],
    }),
    signal: AbortSignal.timeout(300000),
  })
  if (!res.ok) return { error: 'HTTP ' + res.status + ' ' + (await res.text()).slice(0, 160), text: '' }
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  let full = ''
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
      const d = j.choices && j.choices[0] && j.choices[0].delta
      if (d && typeof d.content === 'string') full += d.content
    }
  }
  return { error: '', text: full }
}

let refusedCount = 0
for (let i = 1; i <= runs; i += 1) {
  const r = await one()
  if (r.error) { console.log(`#${i} ERROR ${r.error}`); continue }
  const v = isRefusal(r.text)
  if (v.refused) refusedCount += 1
  console.log(`#${i} ${v.refused ? 'REFUSED' : 'ok     '} hit=${JSON.stringify(v.hit)} len=${r.text.length}`)
  if (v.refused) {
    console.log('   ' + r.text.replace(/\n/g, ' ').slice(0, 500))
    console.log('')
  }
}
console.log('')
console.log(`拒绝 ${refusedCount}/${runs}`)
