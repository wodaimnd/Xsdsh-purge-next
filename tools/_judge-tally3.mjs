/** 精确统计：干净通过数 = refused==0 且 empty==0（只算新判定器的三份跑测）。 */
import fs from 'node:fs'

const files = ['docs/prompt/refusal-baseline-v3-src.json', 'docs/prompt/refusal-baseline-v4-src.json', 'docs/prompt/refusal-baseline-v4-active.json']
const tally = {}
const bump = (mode, index, refused, empty) => {
  tally[mode] ||= {}
  tally[mode][index] ||= { runs: 0, refused: 0, empty: 0 }
  tally[mode][index].runs += 1
  if (refused) tally[mode][index].refused += 1
  if (empty) tally[mode][index].empty += 1
}
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'))
  for (const r of j.reports) {
    if (r.ok === false) continue
    if (r.rows) for (const row of r.rows) for (const a of row.attempts) bump(r.mode, row.index, a.refused, a.empty)
    else for (const row of r.results) bump(r.mode, row.index, row.refused, !(row.answer || '').trim())
  }
}
for (const mode of ['redteam', 'reverse', 'cheat']) {
  const rows = Object.entries(tally[mode]).map(([i, v]) => ({ i: +i, ...v }))
  const ref = rows.filter((r) => r.refused > 0)
  const empOnly = rows.filter((r) => r.refused === 0 && r.empty > 0)
  const clean = rows.filter((r) => r.refused === 0 && r.empty === 0)
  console.log(`${mode}: total=${rows.length} refusedCases=${ref.length} emptyOnly=${empOnly.length} clean=${clean.length}`)
  console.log(`  refused: ${ref.map((r) => '#' + r.i + ' ' + r.refused + '/' + r.runs).join(', ')}`)
  console.log(`  emptyOnly: ${empOnly.map((r) => '#' + r.i + ' ' + r.empty + '/' + r.runs).join(', ') || 'none'}`)
}
