/** 临时工具：导出三模式 prefix 全文（源树），带行号。只读。 */
import { readFileSync } from 'node:fs'
import { readPersonaPrefix } from '../lib/preset-prompts.js'

const SRC = 'D:/渗透/逆向模式/dsh-purge/presets'
const which = process.argv[2] || 'redteam'
const r = readPersonaPrefix(readFileSync(`${SRC}/${which}/agent.cordis.yml`, 'utf8'))
const lines = r.text.replace(/[\r\n]+$/, '').split('\n')
console.log(`### ${which}  lines=${lines.length} chars=${r.text.replace(/[\r\n]+$/, '').length}`)
lines.forEach((l, i) => console.log(`${String(i + 1).padStart(3)}| ${l}`))
