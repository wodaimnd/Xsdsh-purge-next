/**
 * 用**当前判定器**复算全部已落盘基线（v2/v3/v4-src/v4-active）。
 * 关键：v3/v4 是我在 captain 修判定器（0:45）之前跑的，存下来的 refused 结论已过期。
 * 这里只重判、不重跑模型。
 */
import fs from 'node:fs'
import { isRefusal } from '../lib/refusal-cases.mjs'

const files = [
  ['v2-active(旧判定器/700tok)', 'docs/prompt/refusal-baseline-v2.json'],
  ['v3-src(700tok)', 'docs/prompt/refusal-baseline-v3-src.json'],
  ['v4-src(1200/think-off/x2)', 'docs/prompt/refusal-baseline-v4-src.json'],
  ['v4-active(1200/think-off/x1)', 'docs/prompt/refusal-baseline-v4-active.json'],
]

const summary = {}
for (const [label, f] of files) {
  if (!fs.existsSync(f)) continue
  const j = JSON.parse(fs.readFileSync(f, 'utf8'))
  console.log(`\n########## ${label}  (${f})`)
  for (const r of j.reports || []) {
    if (r.ok === false) continue
    const rows = []
    if (r.rows) {
      for (const row of r.rows) {
        let ref = 0, emp = 0
        for (const a of row.attempts) {
          if (a.empty) { emp += 1; continue }
          if (isRefusal(a.answer).refused) ref += 1
        }
        rows.push({ index: row.index, runs: row.attempts.length, refused: ref, empty: emp })
      }
    } else {
      for (const row of r.results) {
        const ans = row.answer || ''
        const emp = !ans.trim()
        const ref = emp ? 0 : (isRefusal(ans).refused ? 1 : 0)
        rows.push({ index: row.index, runs: 1, refused: ref, empty: emp ? 1 : 0 })
      }
    }
    const refCases = rows.filter((x) => x.refused > 0)
    const empCases = rows.filter((x) => x.refused === 0 && x.empty > 0)
    const clean = rows.filter((x) => x.refused === 0 && x.empty === 0)
    console.log(`  ${r.mode}: 干净 ${clean.length}/${rows.length}  有拒绝 ${refCases.length}  仅空 ${empCases.length}`)
    if (refCases.length) console.log(`     拒绝: ${refCases.map((x) => '#' + x.index + ' ' + x.refused + '/' + x.runs).join(', ')}`)
    if (empCases.length) console.log(`     空:   ${empCases.map((x) => '#' + x.index + ' ' + x.empty + '/' + x.runs).join(', ')}`)
    summary[`${label}|${r.mode}`] = { clean: clean.length, total: rows.length, ref: refCases.map((x) => x.index) }
  }
}
