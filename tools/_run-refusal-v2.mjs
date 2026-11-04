/**
 * 拒绝测试 v2 基线跑测器（不依赖宿主，不污染安装目录）。
 *
 * 为什么不用宿主的 /Xsdsh-purge-next/refusal-test：
 *   宿主读的是 profiles/<profile>/node_modules/Xsdsh-purge-next 里的副本，
 *   用例和 preset 都是旧版；把 v2 用例同步进去会连带覆盖 prefix，
 *   而 prefix 是下一棒的工作，基线必须保持「改提示词前」的状态。
 *
 * 这里复刻宿主的同一条链路：
 *   system prompt = 安装副本里 preset 的 prefix（= 宿主实际生效的那份）
 *   用例         = 源树 lib/refusal-cases.mjs（v2）
 *   判定         = lib/refusal-cases.mjs 的 isRefusal（同一套词表）
 *   跑法         = lib/refusal-test.js 的 runCases（同样的重试与三态）
 *
 * 用法：
 *   node tools/_run-refusal-v2.mjs [mode|all] [--prompt=active|src] [--maxTokens=700]
 *                                  [--out=<path>] [--model=<id>]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { runCases, loadPromptText } from '../lib/refusal-test.js'
import { casesFor } from '../lib/refusal-cases.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.dirname(HERE)

const argv = process.argv.slice(2)
const flag = (name, dflt) => {
  const hit = argv.find((a) => a.startsWith('--' + name + '='))
  return hit ? hit.slice(name.length + 3) : dflt
}
const mode = argv.find((a) => !a.startsWith('--')) || 'all'
const promptSrc = flag('prompt', 'active')
const maxTokens = Number(flag('maxTokens', '700'))
const model = flag('model', 'deepseek-v4.1-flash')
const outPath = flag('out', path.join(ROOT, 'docs', 'prompt', 'refusal-baseline-v2.json'))

/* ── 取提示词 ────────────────────────────────────────────────────── */
function promptRoot() {
  if (promptSrc === 'src') return ROOT
  const home = process.env.USERPROFILE || process.env.HOME || ''
  return path.join(home, '.dsh', 'profiles', 'desktop', 'node_modules', 'Xsdsh-purge-next')
}

/* ── 直连模型（OpenAI 兼容 SSE），包成宿主 llm.stream 的 chunk 形状 ── */
function readKey() {
  const y = path.join(process.env.USERPROFILE || '', '.dsh', '.credentials.yaml')
  if (!fs.existsSync(y)) return ''
  const t = fs.readFileSync(y, 'utf8')
  const m = t.match(/STARAPI_API_KEY:\s*([^\s,}]+)/)
  return m ? m[1] : ''
}

const API = 'https://www.starapi.io/v1/chat/completions'
const KEY = readKey()

function stream(opts) {
  return (async function* gen() {
    const body = {
      model: opts.model,
      max_tokens: opts.maxTokens,
      stream: true,
      messages: [
        { role: 'system', content: opts.system },
        ...opts.messages.map((m) => ({ role: m.role, content: m.content.map((c) => c.text).join('') })),
      ],
    }
    const res = await fetch(API, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(180000),
    })
    if (!res.ok) {
      const txt = await res.text()
      yield { type: 'finish', reason: { kind: 'error', failure: { message: `HTTP ${res.status} ${txt.slice(0, 200)}` } } }
      return
    }
    const reader = res.body.getReader()
    const dec = new TextDecoder()
    let buf = ''
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buf += dec.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() || ''
      for (const line of lines) {
        const s = line.trim()
        if (!s.startsWith('data:')) continue
        const payload = s.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        let j
        try { j = JSON.parse(payload) } catch { continue }
        const delta = j.choices && j.choices[0] && j.choices[0].delta
        if (delta && typeof delta.content === 'string' && delta.content) {
          yield { type: 'text-delta', text: delta.content }
        }
      }
    }
    yield { type: 'finish', reason: { kind: 'stop' } }
  })()
}

/* ── 跑 ──────────────────────────────────────────────────────────── */
if (!KEY) {
  console.log('缺少 STARAPI_API_KEY，跑不了真模型')
  process.exit(2)
}

const modes = mode === 'all' ? ['redteam', 'reverse', 'cheat'] : [mode]
const proot = promptRoot()
console.log('提示词来源:', proot, '(prompt=' + promptSrc + ')')
console.log('用例来源  :', path.join(ROOT, 'lib', 'refusal-cases.mjs'))
console.log('模型      :', model, ' maxTokens=' + maxTokens)
console.log('')

const reports = []
for (const m of modes) {
  const system = await loadPromptText(fs, path, proot, m)
  if (!system) {
    reports.push({ mode: m, ok: false, error: '读不到提示词' })
    console.log(`【${m}】读不到提示词，跳过`)
    continue
  }
  const cases = casesFor(m)
  console.log(`【${m}】提示词 ${system.length} 字符，用例 ${cases.length} 条，开跑…`)
  const started = Date.now()
  const r = await runCases(stream, { provider: 'starapi', model }, system, m, {
    maxTokens,
    retryMax: 3,
    onProgress: (row, i, n) => {
      const mark = row.errored ? 'ERR ' : row.refused ? 'REFU' : 'ok  '
      console.log(`  ${String(i).padStart(2)}/${n} ${mark} ${row.ask.slice(0, 40)}${row.refused ? '  ← ' + row.hit : ''}`)
    },
  })
  const secs = ((Date.now() - started) / 1000).toFixed(0)
  console.log(`  → ${r.passed}/${r.total} 通过，拒绝 ${r.failed}，没测到 ${r.errored}（${secs}s）\n`)
  reports.push({ mode: m, ok: true, promptChars: system.length, promptSource: promptSrc, ...r })
}

const summary = reports.map((r) => r.ok
  ? `${r.mode}: ${r.passed}/${r.total} 通过` + (r.failed ? `（${r.failed} 轮拒绝）` : '') + (r.errored ? `（${r.errored} 轮没测到）` : '')
  : `${r.mode}: 失败 ${r.error}`)

const doc = {
  generatedAt: new Date().toISOString(),
  purpose: '改提示词前的基线：v2 用例 + 宿主实际生效的 preset prefix',
  provider: 'starapi',
  model,
  maxTokens,
  promptSource: promptSrc,
  promptRoot: proot,
  casesFile: 'lib/refusal-cases.mjs',
  reports,
  summary,
}
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), 'utf8')

console.log('='.repeat(64))
for (const s of summary) console.log(s)
const totalPass = reports.filter((r) => r.ok).reduce((a, r) => a + r.passed, 0)
const totalAll = reports.filter((r) => r.ok).reduce((a, r) => a + r.total, 0)
console.log(`总计: ${totalPass}/${totalAll}`)
console.log('报告:', outPath)
