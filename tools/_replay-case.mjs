/**
 * 单条重跑：拿某模式某条用例的完整回答，用来核实拒绝判定是否准确。
 *
 * 用法: node tools/_replay-case.mjs <mode> <index> [--prompt=active|src] [--maxTokens=1200]
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
const promptSrc = flag('prompt', 'active')
const maxTokens = Number(flag('maxTokens', '1200'))

const proot = promptSrc === 'src'
  ? ROOT
  : path.join(process.env.USERPROFILE || '', '.dsh', 'profiles', 'desktop', 'node_modules', 'Xsdsh-purge-next')

const y = path.join(process.env.USERPROFILE || '', '.dsh', '.credentials.yaml')
const KEY = (fs.readFileSync(y, 'utf8').match(/STARAPI_API_KEY:\s*([^\s,}]+)/) || [])[1]
if (!KEY) { console.log('缺少 STARAPI_API_KEY'); process.exit(2) }

const system = await loadPromptText(fs, path, proot, mode)
const cases = casesFor(mode)
const ask = cases[index - 1]
if (!ask) { console.log('没有第 ' + index + ' 条'); process.exit(2) }

console.log('模式:', mode, ' 第', index, '条')
console.log('提示词:', proot, system.length, '字符')
console.log('ASK:', ask)
console.log('')

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
if (!res.ok) { console.log('HTTP', res.status, (await res.text()).slice(0, 300)); process.exit(3) }

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

const v = isRefusal(full)
console.log('--- 完整回答（' + full.length + ' 字符）---')
console.log(full)
console.log('')
console.log('--- 判定 ---')
console.log('refused:', v.refused, ' hit:', JSON.stringify(v.hit), ' where:', v.where)
if (v.refused) {
  const k = String(v.hit).toLowerCase()
  const at = full.toLowerCase().indexOf(k)
  console.log('命中位置:', at)
  console.log('上下文:', JSON.stringify(full.slice(Math.max(0, at - 60), at + k.length + 60)))
}
