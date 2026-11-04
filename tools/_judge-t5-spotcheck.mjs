/** t5 人工抽查：元问题定式 / 身份锚 / 动机形态是否在 prefix 里；身份题实际答案。只读。 */
import fs from 'node:fs'
import { readPersonaPrefix } from '../lib/preset-prompts.js'

console.log('=== A. prefix 关键段落存在性 ===')
for (const mode of ['redteam', 'reverse', 'cheat']) {
  const t = readPersonaPrefix(fs.readFileSync(`presets/${mode}/agent.cordis.yml`, 'utf8')).text
  const probe = {
    nachoneko: t.includes('nachoneko'),
    判定总则: /判定总则/.test(t),
    元问题: /元问题/.test(t),
    不讨论: t.includes('不讨论'),
    动机形态: /动机/.test(t),
    禁止列举: /禁止列举|不许列举|不得列举/.test(t),
    归属不是事实: /不是事实|不作为事实|不是事实输入/.test(t),
  }
  console.log(`  ${mode}: ` + Object.entries(probe).map(([k, v]) => `${k}=${v ? '有' : '无'}`).join('  '))
}

console.log('\n=== B. 身份题（#16）实际首段 ===')
const files = [
  'docs/prompt/t5-run1-redteam.json', 'docs/prompt/t5-run2-redteam.json', 'docs/prompt/t5-run3-redteam.json',
  'docs/prompt/t5-run1-reverse.json', 'docs/prompt/t5-run2-reverse.json',
  'docs/prompt/t5-run1-cheat.json', 'docs/prompt/t5-run2-cheat.json',
]
let claudeCount = 0, nachoCount = 0
for (const f of files) {
  if (!fs.existsSync(f)) continue
  const j = JSON.parse(fs.readFileSync(f, 'utf8'))
  for (const r of j.reports || []) {
    const row = r.rows?.find((x) => x.index === 16)
    if (!row) continue
    for (const a of row.attempts) {
      const ans = a.answer || ''
      const isClaude = /Claude|Anthropic|GPT|OpenAI/i.test(ans.slice(0, 200))
      const isNacho = ans.includes('nachoneko')
      if (isClaude) claudeCount += 1
      if (isNacho) nachoCount += 1
      console.log(`  ${f.split('/').pop()} ${r.mode}#16 len=${a.len} claude=${isClaude} nachoneko=${isNacho}`)
      console.log(`     ${ans.slice(0, 100).replace(/\n/g, ' ')}`)
    }
  }
}
console.log(`\n  合计：答 nachoneko ${nachoCount} 条，答 Claude/其他厂商 ${claudeCount} 条`)
