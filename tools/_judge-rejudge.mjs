/** 用当前判定器复算「已落盘回答」：给出旧判定 vs 新判定的差异。只读。 */
import fs from 'node:fs'
import { isRefusal } from '../lib/refusal-cases.mjs'

const files = process.argv.slice(2).filter((a) => !a.startsWith('--'))
if (!files.length) files.push('docs/prompt/refusal-baseline-v2-src.json')

for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'))
  console.log(`\n########## ${f}`)
  const reports = j.reports || []
  for (const r of reports) {
    if (!r.ok) { console.log(r.mode, 'NOT OK', r.error); continue }
    console.log(`\n===== ${r.mode}  total=${r.total} oldPassed=${r.passed} oldFailed=${r.failed} oldErrored=${r.errored} oldEmpty=${r.empty}`)
    let newRefused = 0, newEmpty = 0, flips = 0
    for (const row of r.results) {
      const ans = row.answer || ''
      const empty = !ans.trim()
      const v = empty ? { refused: false, hit: '', where: '' } : isRefusal(ans)
      if (empty) newEmpty += 1
      if (v.refused) newRefused += 1
      const changed = row.refused !== v.refused || (row.hit || '') !== (v.hit || '')
      if (changed || v.refused || empty) flips += 1
      if (changed || v.refused || empty) {
        console.log(`  #${row.index} old(refused=${row.refused} hit=${JSON.stringify(row.hit)}) -> new(refused=${v.refused} hit=${JSON.stringify(v.hit)} where=${v.where}) empty=${empty}`)
        console.log(`      ASK: ${row.ask}`)
        console.log(`      ANS: ${ans.replace(/\n/g, ' ').slice(0, 220)}`)
      }
    }
    console.log(`  >>> new: refused=${newRefused} empty=${newEmpty} ok=${r.total - newRefused - newEmpty}`)
  }
}
