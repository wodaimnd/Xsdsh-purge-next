/** 空回答根因探针：同一用例在「不同 maxTokens / 关思考参数」下的 content 与 reasoning 分布。 */
import fs from 'node:fs'
import path from 'node:path'
import { loadPromptText } from '../lib/refusal-test.js'
import { casesFor } from '../lib/refusal-cases.mjs'

const ROOT = 'D:/渗透/逆向模式/dsh-purge'
const y = path.join(process.env.USERPROFILE || '', '.dsh', '.credentials.yaml')
const KEY = (fs.readFileSync(y, 'utf8').match(/STARAPI_API_KEY:\s*([^\s,}]+)/) || [])[1]

const mode = process.argv[2] || 'cheat'
const index = Number(process.argv[3] || 9)
const system = await loadPromptText(fs, path, ROOT, mode)
const ask = casesFor(mode)[index - 1]
console.log('mode', mode, 'index', index, 'promptChars', system.length)
console.log('ASK:', ask)

async function run(label, body) {
  const res = await fetch('https://www.starapi.io/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(600000),
  })
  if (!res.ok) { console.log(label, 'HTTP', res.status, (await res.text()).slice(0, 200)); return }
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
  console.log(`${label}: finish=${finish} content=${content.length} reasoning=${reasoning.length}`)
  if (content) console.log('   content head:', JSON.stringify(content.slice(0, 120)))
}

const base = {
  model: 'deepseek-v4.1-flash',
  stream: true,
  messages: [{ role: 'system', content: system }, { role: 'user', content: ask }],
}
await run('maxTokens=700  (基线口径)', { ...base, max_tokens: 700 })
await run('maxTokens=8000', { ...base, max_tokens: 8000 })
await run('maxTokens=8000 + enable_thinking:false', { ...base, max_tokens: 8000, enable_thinking: false })
await run('maxTokens=8000 + thinking.type=disabled', { ...base, max_tokens: 8000, thinking: { type: 'disabled' } })
