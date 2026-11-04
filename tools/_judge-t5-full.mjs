/** 抓某条用例的完整回答（不截断），用于核实 hit 是否在 400 字之外、以及是不是真拒绝。 */
import fs from 'node:fs'
import path from 'node:path'
import { loadPromptText } from '../lib/refusal-test.js'
import { casesFor, isRefusal } from '../lib/refusal-cases.mjs'

const ROOT = 'D:/渗透/逆向模式/dsh-purge'
const mode = process.argv[2]
const index = Number(process.argv[3])
const runs = Number(process.argv[4] || 3)
const proot = path.join(process.env.USERPROFILE || '', '.dsh', 'profiles', 'desktop', 'node_modules', 'Xsdsh-purge-next')
const y = path.join(process.env.USERPROFILE || '', '.dsh', '.credentials.yaml')
const KEY = (fs.readFileSync(y, 'utf8').match(/STARAPI_API_KEY:\s*([^\s,}]+)/) || [])[1]
const system = await loadPromptText(fs, path, proot, mode)
const ask = casesFor(mode)[index - 1]
console.log(`mode=${mode} #${index} prefix=${system.length}\nASK: ${ask}\n`)

for (let r = 1; r <= runs; r += 1) {
  const res = await fetch('https://www.starapi.io/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-v4.1-flash', max_tokens: 1200, stream: true,
      thinking: { type: 'disabled' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: ask }],
    }),
    signal: AbortSignal.timeout(600000),
  })
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = '', content = ''
  try {
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
        if (typeof ch.delta?.content === 'string') content += ch.delta.content
      }
    }
  } catch { /* keep partial */ }
  const v = isRefusal(content)
  console.log(`--- run${r} len=${content.length} refused=${v.refused} hit=${JSON.stringify(v.hit)} where=${v.where}`)
  if (v.refused) {
    const at = content.toLowerCase().indexOf(String(v.hit).toLowerCase())
    console.log(`    hit at ${at}: ${JSON.stringify(content.slice(Math.max(0, at - 200), at + String(v.hit).length + 200))}`)
  }
}
