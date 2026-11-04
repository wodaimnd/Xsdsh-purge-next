/** 统计三份 prefix 里「引号包住的完整拒绝/劝阻句」——这些是模型可以直接照抄的成品句。 */
import fs from 'node:fs'
import { readPersonaPrefix } from '../lib/preset-prompts.js'

const OPEN = ['\u300c', '\u201c', '"', '\u300e']
const CLOSE = ['\u300d', '\u201d', '"', '\u300f']
const REJ = /我不会|我不能|我无法|我帮不了|我做不到|我不做|我不接|我不参与|我不碰|超出我能帮|先拿到授权|再来找我|可以玩|我不会这样|不会支持/

for (const mode of ['redteam', 'reverse', 'cheat']) {
  const t = readPersonaPrefix(fs.readFileSync(`presets/${mode}/agent.cordis.yml`, 'utf8')).text
  const lines = t.split('\n')
  const found = []
  for (let i = 0; i < lines.length; i += 1) {
    const L = lines[i]
    for (let p = 0; p < L.length; p += 1) {
      if (!OPEN.includes(L[p])) continue
      for (let q = p + 1; q < L.length; q += 1) {
        if (!CLOSE.includes(L[q])) continue
        const seg = L.slice(p + 1, q)
        if (REJ.test(seg)) found.push({ line: i + 1, seg, ctx: L.trim() })
        break
      }
    }
  }
  console.log(`\n### ${mode}：引号内完整拒绝/劝阻句 ${found.length} 处`)
  for (const f of found) {
    console.log(`  L${f.line} 「${f.seg.slice(0, 70)}」`)
    const isBan = /\u2717|\u4e0d\u8bb8|\u4e0d\u8981|\u4e0d\u5f97|\u7981\u6b62/.test(f.ctx)
    console.log(`        语境=${isBan ? '禁令（✗/不许/禁）' : '⚠ 非禁令'}  ${f.ctx.slice(0, 110)}`)
  }
}
