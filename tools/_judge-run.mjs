/**
 * 审判侧独立跑测器（不改出题者的 runCases）：
 *   - 四态：refused / empty / errored / ok
 *   - 支持 --thinking=off（关掉 reasoning_content，避免 maxTokens 被思维链吃光）
 *   - 支持 --prompt=src|active
 * 用法: node tools/_judge-run.mjs all --prompt=src --maxTokens=1200 --thinking=off --out=...
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
const modeArg = argv.find((a) => !a.startsWith('--')) || 'all'
const promptSrc = flag('prompt', 'src')
const maxTokens = Number(flag('maxTokens', '1200'))
const thinking = flag('thinking', 'off')
const outPath = flag('out', '')
const runsPerCase = Number(flag('runs', '1'))

const proot = promptSrc === 'src'
  ? ROOT
  : path.join(process.env.USERPROFILE || '', '.dsh', 'profiles', 'desktop', 'node_modules', 'Xsdsh-purge-next')
const y = path.join(process.env.USERPROFILE || '', '.dsh', '.credentials.yaml')
const KEY = (fs.readFileSync(y, 'utf8').match(/STARAPI_API_KEY:\s*([^\s,}]+)/) || [])[1]
if (!KEY) { console.log('缺少 STARAPI_API_KEY'); process.exit(2) }

async function one(system, ask) {
  const maxTry = 3
  for (let attempt = 0; attempt < maxTry; attempt += 1) {
    const r = await oneOnce(system, ask)
    if (!r.error) return r
    const transient = /ECONNRESET|ETIMEDOUT|socket hang up|fetch failed|other side closed|UND_ERR_SOCKET|50[234]|429|rate.?limit|network/i.test(r.error)
    if (!transient || attempt === maxTry - 1) return r
    await new Promise((res) => setTimeout(res, 3000 * (attempt + 1)))
  }
  return { error: 'unreachable', content: '', reasoning: '', finish: '' }
}

async function oneOnce(system, ask) {
  let res
  try {
    res = await fetch('https://www.starapi.io/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-v4.1-flash', max_tokens: maxTokens, stream: true,
        ...(thinking === 'off' ? { thinking: { type: 'disabled' } } : {}),
        messages: [{ role: 'system', content: system }, { role: 'user', content: ask }],
      }),
      signal: AbortSignal.timeout(600000),
    })
  } catch (e) {
    return { error: 'fetch: ' + (e && e.message ? e.message : String(e)), content: '', reasoning: '', finish: '' }
  }
  if (!res.ok) return { error: `HTTP ${res.status} ${(await res.text()).slice(0, 120)}`, content: '', reasoning: '', finish: '' }
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = '', content = '', reasoning = '', finish = ''
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
        const d = ch.delta || {}
        if (typeof d.content === 'string') content += d.content
        if (typeof d.reasoning_content === 'string') reasoning += d.reasoning_content
        if (ch.finish_reason) finish = ch.finish_reason
      }
    }
  } catch (e) {
    /* 流中断（socket closed / terminated）：有正文就交回正文，没有就当 transient 让上层重试 */
    return { error: content.trim() ? '' : 'stream: ' + (e && e.message ? e.message : String(e)), content, reasoning, finish }
  }
  return { error: '', content, reasoning, finish }
}

const modes = modeArg === 'all' ? ['redteam', 'reverse', 'cheat'] : [modeArg]
console.log(`prompt=${promptSrc} (${proot}) maxTokens=${maxTokens} thinking=${thinking} runsPerCase=${runsPerCase}`)
const doc = { generatedAt: new Date().toISOString(), promptSource: promptSrc, promptRoot: proot, maxTokens, thinking, runsPerCase, reports: [] }

for (const mode of modes) {
  const system = await loadPromptText(fs, path, proot, mode)
  const cases = casesFor(mode)
  console.log(`\n【${mode}】prefix ${system.length} 字符，${cases.length} 条用例`)
  const rows = []
  for (let i = 0; i < cases.length; i += 1) {
    const ask = cases[i]
    const attempts = []
    for (let r = 0; r < runsPerCase; r += 1) {
      const o = await one(system, ask)
      const empty = !o.error && !o.content.trim()
      const v = (o.error || empty) ? { refused: false, hit: '', where: '' } : isRefusal(o.content)
      attempts.push({ refused: v.refused, hit: v.hit, where: v.where, empty, error: o.error, finish: o.finish, len: o.content.length, answer: o.content.slice(0, 400), reasoningLen: o.reasoning.length })
    }
    const refused = attempts.filter((a) => a.refused).length
    const empty = attempts.filter((a) => a.empty).length
    const errored = attempts.filter((a) => a.error).length
    const ok = attempts.filter((a) => !a.refused && !a.empty && !a.error).length
    const mark = refused ? 'REFU' : empty ? 'EMPT' : errored ? 'ERR ' : 'ok  '
    console.log(`  ${String(i + 1).padStart(2)} ${mark} refused=${refused}/${runsPerCase} empty=${empty} ok=${ok}  ${ask.slice(0, 36)}${refused ? '  ← ' + attempts.find((a) => a.refused).hit : ''}`)
    rows.push({ index: i + 1, ask, refused, empty, errored, ok, attempts })
  }
  const sum = {
    mode,
    promptChars: system.length,
    total: rows.length,
    runsPerCase,
    refusedCases: rows.filter((r) => r.refused > 0).length,
    emptyCases: rows.filter((r) => r.empty > 0 && r.refused === 0).length,
    okCases: rows.filter((r) => r.refused === 0 && r.empty === 0 && r.errored === 0).length,
  }
  console.log(`  => 有拒绝的用例 ${sum.refusedCases} / 空回答用例 ${sum.emptyCases} / 干净通过 ${sum.okCases}（共 ${sum.total}）`)
  doc.reports.push({ ...sum, rows })
}

if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), 'utf8')
  console.log('\n报告:', outPath)
}
