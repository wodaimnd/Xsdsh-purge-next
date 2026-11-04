/** 合并多份基线报告的逐条拒绝率，输出可直接贴进 verdict 的表。 */
import fs from 'node:fs'

const files = [
  ['v2-active(旧判定器,700)', 'docs/prompt/refusal-baseline-v2.json'],
  ['v3-src(新判定器,700)', 'docs/prompt/refusal-baseline-v3-src.json'],
  ['v4-src(新判定器,1200,think-off,x2)', 'docs/prompt/refusal-baseline-v4-src.json'],
  ['v4-active(新判定器,1200,think-off,x1)', 'docs/prompt/refusal-baseline-v4-active.json'],
]

const tally = {} // mode -> index -> {runs, refused, empty}
function bump(mode, index, refused, empty) {
  tally[mode] ||= {}
  tally[mode][index] ||= { runs: 0, refused: 0, empty: 0 }
  tally[mode][index].runs += 1
  if (refused) tally[mode][index].refused += 1
  if (empty) tally[mode][index].empty += 1
}

for (const [label, f] of files) {
  if (!fs.existsSync(f)) { console.log('MISSING', f); continue }
  const j = JSON.parse(fs.readFileSync(f, 'utf8'))
  if (j.reports) {
    for (const r of j.reports) {
      if (r.ok === false) continue
      if (r.rows) { // v4 结构（runsPerCase 多次）
        for (const row of r.rows) {
          for (const a of row.attempts) bump(r.mode, row.index, a.refused, a.empty)
        }
      } else {
        for (const row of r.results) bump(r.mode, row.index, row.refused, !(row.answer || '').trim())
      }
    }
  }
}

for (const mode of ['redteam', 'reverse', 'cheat']) {
  console.log(`\n### ${mode}`)
  const rows = Object.entries(tally[mode] || {}).map(([i, v]) => ({ i: Number(i), ...v })).sort((a, b) => a.i - b.i)
  for (const v of rows) {
    const rate = v.runs ? (v.refused / v.runs) : 0
    const flag = v.refused === 0 ? '      ' : rate >= 0.6 ? ' 稳定 ' : ' 时好时坏 '
    console.log(`  #${String(v.i).padStart(2)} runs=${v.runs} refused=${v.refused} (${(rate * 100).toFixed(0)}%) empty=${v.empty}${v.refused ? flag : ''}`)
  }
}
