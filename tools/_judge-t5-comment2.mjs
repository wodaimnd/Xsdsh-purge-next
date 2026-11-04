/** 修正注释行判定：区分 ## 标题与 # 注释；并检查「网络安全法/刑法」出现在什么语境。 */
import fs from 'node:fs'
import { readPersonaPrefix } from '../lib/preset-prompts.js'

for (const mode of ['redteam', 'reverse', 'cheat']) {
  const yml = fs.readFileSync(`presets/${mode}/agent.cordis.yml`, 'utf8')
  const lines = yml.split(/\r?\n/)
  let start = -1, indent = 0
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(/^(\s*)prefix:\s*\|/)
    if (m) { start = i; indent = m[1].length + 2; break }
  }
  let end = lines.length
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '') continue
    const lead = lines[i].length - lines[i].trimStart().length
    if (lead < indent) { end = i; break }
  }
  const blockComments = []
  const headings = []
  for (let i = start + 1; i < end; i += 1) {
    const l = lines[i].trim()
    if (l.startsWith('##')) headings.push(i + 1)
    else if (l.startsWith('#')) blockComments.push(i + 1)
  }
  console.log(`\n### ${mode}  块内 ${end - start - 1} 行`)
  console.log(`  ## 标题行 ${headings.length} 条（正常 markdown 标题，不是注释）`)
  console.log(`  单 # 注释行 ${blockComments.length} 条${blockComments.length ? ' -> ' + blockComments.slice(0, 8).join(',') : ''}`)
}

console.log('\n=== 关键：网络安全法 / 刑法 出现在哪个语境 ===')
for (const mode of ['redteam']) {
  const t = readPersonaPrefix(fs.readFileSync(`presets/${mode}/agent.cordis.yml`, 'utf8')).text
  const ls = t.split('\n')
  for (let i = 0; i < ls.length; i += 1) {
    if (/网络安全法|刑法/.test(ls[i])) {
      console.log(`  ${mode} prefix L${i + 1}: ${ls[i].trim()}`)
      console.log(`    上一行: ${(ls[i - 1] || '').trim().slice(0, 100)}`)
    }
  }
}

console.log('\n=== 三份 prefix 是否仍逐条列出「禁止的劝阻理由」（t3 §4-1 要改成禁止列举）===')
for (const mode of ['redteam', 'reverse', 'cheat']) {
  const t = readPersonaPrefix(fs.readFileSync(`presets/${mode}/agent.cordis.yml`, 'utf8')).text
  const ls = t.split('\n')
  const bannedReasonLines = ls.filter((l) => /法律风险|网络安全法|刑法|著作权|用户协议|ToS|损害|正版销售|维护成本|封号|连坐/.test(l))
  console.log(`  ${mode}: ${bannedReasonLines.length} 行提到具体劝阻理由`)
  for (const l of bannedReasonLines.slice(0, 4)) console.log(`     ${l.trim().slice(0, 130)}`)
}
