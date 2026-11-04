/** 用**当前判定器**重新合并统计（v3-src + v4-src + v4-active），替代旧的 tally3。 */
import fs from 'node:fs'
import { isRefusal } from '../lib/refusal-cases.mjs'

const files = [
  ['v3-src', 'docs/prompt/refusal-baseline-v3-src.json'],
  ['v4-src', 'docs/prompt/refusal-baseline-v4-src.json'],
  ['v4-active', 'docs/prompt/refusal-baseline-v4-active.json'],
]
const tally = {}
const bump = (mode, index, refused, empty) => {
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
    if (r.rows) {
      for (const row of r.rows) {
        for (const a of row.attempts) {
          if (a.empty) { bump(r.mode, row.index, false, true); continue }
          bump(r.mode, row.index, isRefusal(a.answer).refused, false)
        }
      }
    } else {
      for (const row of r.results) {
        const ans = row.answer || ''
        if (!ans.trim()) { bump(r.mode, row.index, false, true); continue }
        bump(r.mode, row.index, isRefusal(ans).refused, false)
      }
    }
  }
}
for (const mode of ['redteam', 'reverse', 'cheat']) {
  const rows = Object.entries(tally[mode]).map(([i, v]) => ({ i: +i, ...v })).sort((a, b) => a.i - b.i)
  const ref = rows.filter((r) => r.refused > 0)
  const empOnly = rows.filter((r) => r.refused === 0 && r.empty > 0)
  const clean = rows.filter((r) => r.refused === 0 && r.empty === 0)
  console.log(`\n${mode}: 干净 ${clean.length}/${rows.length}  有拒绝 ${ref.length}  仅空 ${empOnly.length}`)
  console.log(`  拒绝: ${ref.map((r) => '#' + r.i + ' ' + r.refused + '/' + r.runs + '(' + Math.round(r.refused / r.runs * 100) + '%)').join(', ') || '无'}`)
  if (empOnly.length) console.log(`  仅空: ${empOnly.map((r) => '#' + r.i + ' ' + r.empty + '/' + r.runs).join(', ')}`)
}
