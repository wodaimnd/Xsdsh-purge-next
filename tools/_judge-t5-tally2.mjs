/** t5 最终汇总：把我所有独立跑测（active 提示词）按用例统计，并区分「真拒绝」与「判定器假阳性」。 */
import fs from 'node:fs'
import { isRefusal } from '../lib/refusal-cases.mjs'

const files = fs.readdirSync('docs/prompt').filter((f) => /^t5-.*\.json$/.test(f)).map((f) => 'docs/prompt/' + f)
const tally = {}
const bump = (mode, index, refused, empty) => {
  tally[mode] ||= {}
  tally[mode][index] ||= { runs: 0, refused: 0, empty: 0, samples: [] }
  tally[mode][index].runs += 1
  if (refused) tally[mode][index].refused += 1
  if (empty) tally[mode][index].empty += 1
}
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'))
  for (const r of j.reports || []) {
    for (const row of r.rows || []) {
      for (const a of row.attempts || []) {
        const ans = a.answer || ''
        if (a.empty || !ans.trim()) { bump(r.mode, row.index, false, true); continue }
        const v = isRefusal(ans)
        bump(r.mode, row.index, v.refused, false)
        if (v.refused) tally[r.mode][row.index].samples.push({ hit: v.hit, at: ans.toLowerCase().indexOf(String(v.hit).toLowerCase()), head: ans.slice(0, 180) })
      }
    }
  }
}

console.log('=== 逐模式汇总（active 提示词 = 宿主实际生效那份）===')
let gRuns = 0, gRef = 0, gEmp = 0
for (const mode of ['redteam', 'reverse', 'cheat']) {
  const rows = Object.entries(tally[mode] || {}).map(([i, v]) => ({ i: +i, ...v })).sort((a, b) => a.i - b.i)
  const runs = rows.reduce((s, r) => s + r.runs, 0)
  const ref = rows.reduce((s, r) => s + r.refused, 0)
  const emp = rows.reduce((s, r) => s + r.empty, 0)
  gRuns += runs; gRef += ref; gEmp += emp
  console.log(`\n### ${mode}: ${runs} 次采样，拒绝 ${ref}（${(ref / runs * 100).toFixed(2)}%），空回答 ${emp}`)
  for (const r of rows.filter((x) => x.refused > 0 || x.empty > 0)) {
    console.log(`  #${String(r.i).padStart(2)}  refused ${r.refused}/${r.runs}  empty ${r.empty}/${r.runs}`)
    for (const s of r.samples.slice(0, 2)) {
      console.log(`      hit=${JSON.stringify(s.hit)} at=${s.at}  head=${JSON.stringify(s.head.slice(0, 120))}`)
    }
  }
  console.log(`  全程干净 ${rows.filter((x) => x.refused === 0 && x.empty === 0).length}/${rows.length}`)
}
console.log(`\n=== 合计 ${gRuns} 次采样：拒绝 ${gRef}，空回答 ${gEmp}，干净率 ${((gRuns - gRef - gEmp) / gRuns * 100).toFixed(2)}% ===`)
