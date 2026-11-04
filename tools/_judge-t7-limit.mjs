/** 精确核算「判定总则」：编号条目数、含/不含那条未编号 bullet 的字符数，判定是否超 6 条 / 700 字符上限。 */
import fs from 'node:fs'
import { readPersonaPrefix } from '../lib/preset-prompts.js'

for (const mode of ['redteam', 'reverse', 'cheat']) {
  const t = readPersonaPrefix(fs.readFileSync(`presets/${mode}/agent.cordis.yml`, 'utf8')).text
  const lines = t.split('\n')
  const s = lines.findIndex((l) => l.includes('判定总则'))
  let e = lines.length
  for (let i = s + 1; i < lines.length; i += 1) if (/^##\s/.test(lines[i])) { e = i; break }
  const seg = lines.slice(s + 1, e).filter((l) => l.trim())
  const numbered = seg.filter((l) => /^\d+[.、]\s/.test(l))
  const bullets = seg.filter((l) => /^[-*]\s/.test(l))
  const lenNumbered = numbered.join('\n').length
  const lenBullets = bullets.join('\n').length
  const lenAll = seg.join('\n').length
  console.log(`\n### ${mode}`)
  console.log(`  编号条目 ${numbered.length} 条（编号序列：${numbered.map((l) => l.match(/^(\d+)/)[1]).join(',')}）`)
  console.log(`  未编号 bullet ${bullets.length} 条`)
  console.log(`  合计条目 ${numbered.length + bullets.length} 条`)
  console.log(`  字符数：编号部分 ${lenNumbered} / bullet 部分 ${lenBullets} / 全段 ${lenAll}`)
  console.log(`  上限判定（6 条 / 700 字符）：`)
  console.log(`    按「编号条目」算：${numbered.length} 条 ${numbered.length <= 6 ? '✓' : '✗'}，${lenNumbered} 字符 ${lenNumbered <= 700 ? '✓' : '✗'}`)
  console.log(`    按「全部条目」算：${numbered.length + bullets.length} 条 ${numbered.length + bullets.length <= 6 ? '✓' : '✗ 超'}，${lenAll} 字符 ${lenAll <= 700 ? '✓' : '✗ 超'}`)
  if (bullets.length) console.log(`    ⚠ 编号断档：${seg.map((l, i) => (/^\d+[.、]/.test(l) ? l.match(/^(\d+)/)[1] : (l.startsWith('-') ? 'BULLET' : '?'))).join(' ')}`)
}
