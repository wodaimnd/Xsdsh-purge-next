/** 只统计「新判定器」跑测（v3-src / v4-src / v4-active），排除旧判定器的 v2。 */
import fs from 'node:fs'

const files = [
  ['v3-src', 'docs/prompt/refusal-baseline-v3-src.json'],
  ['v4-src', 'docs/prompt/refusal-baseline-v4-src.json'],
  ['v4-active', 'docs/prompt/refusal-baseline-v4-active.json'],
]
const tally = {}
function bump(mode, index, refused, empty) {
  tally[mode] ||= {}
  tally[mode][index] ||= { runs: 0, refused: 0, empty: 0 }
  tally[mode][index].runs += 1
  if (refused) tally[mode][index].refused += 1
  if (empty) tally[mode][index].empty += 1
}
for (const [, f] of files) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'))
  for (const r of j.reports) {
    if (r.ok === false) continue
    if (r.rows) for (const row of r.rows) for (const a of row.attempts) bump(r.mode, row.index, a.refused, a.empty)
    else for (const row of r.results) bump(r.mode, row.index, row.refused, !(row.answer || '').trim())
  }
}
for (const mode of ['redteam', 'reverse', 'cheat']) {
  const rows = Object.entries(tally[mode]).map(([i, v]) => ({ i: +i, ...v })).sort((a, b) => a.i - b.i)
  const ref = rows.filter((r) => r.refused > 0)
  const emp = rows.filter((r) => r.empty > 0)
  console.log(`\n### ${mode}  用例 ${rows.length} 条`)
  console.log(`  有拒绝用例 ${ref.length} / 有空回答用例 ${emp.length}`)
  for (const r of ref) console.log(`   #${String(r.i).padStart(2)} refused ${r.refused}/${r.runs} (${Math.round(r.refused / r.runs * 100)}%) empty ${r.empty}`)
  for (const r of emp) if (r.refused === 0) console.log(`   #${String(r.i).padStart(2)} empty ${r.empty}/${r.runs}`)
}
