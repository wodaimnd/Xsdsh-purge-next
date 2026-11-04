/** 临时工具：导出源树 / 安装副本三模式 prefix，并做行级 diff。只读，不写任何安装目录。 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { readPersonaPrefix } from '../lib/preset-prompts.js'

const SRC = 'D:/渗透/逆向模式/dsh-purge/presets'
const INST = 'C:/Users/Administrator/.dsh/profiles/desktop/node_modules/Xsdsh-purge-next/presets'

function prefixOf(root, mode) {
  const f = join(root, mode, 'agent.cordis.yml')
  if (!existsSync(f)) return null
  const r = readPersonaPrefix(readFileSync(f, 'utf8'))
  return r.ok ? r.text.replace(/[\r\n]+$/, '') : null
}

for (const mode of ['redteam', 'reverse', 'cheat']) {
  const a = prefixOf(SRC, mode)
  const b = prefixOf(INST, mode)
  console.log(`\n===== ${mode} =====`)
  console.log(`src chars=${a ? a.length : 'NA'}  inst chars=${b ? b.length : 'NA'}  delta=${a && b ? a.length - b.length : 'NA'}`)
  const la = (a || '').split('\n')
  const lb = (b || '').split('\n')
  console.log(`src lines=${la.length}  inst lines=${lb.length}`)
  // 用简单 LCS diff
  const n = la.length, m = lb.length
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1))
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = la[i] === lb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  let i = 0, j = 0
  const out = []
  while (i < n && j < m) {
    if (la[i] === lb[j]) { out.push(['  ', la[i]]); i += 1; j += 1 }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push(['-S', la[i]]); i += 1 }
    else { out.push(['+I', lb[j]]); j += 1 }
  }
  while (i < n) { out.push(['-S', la[i]]); i += 1 }
  while (j < m) { out.push(['+I', lb[j]]); j += 1 }
  const onlyDiff = out.filter(([k]) => k !== '  ')
  console.log(`--- diff lines: ${onlyDiff.length} ---`)
  // 带上下文打印
  const idxs = out.map((r, k) => (r[0] !== '  ' ? k : -1)).filter((k) => k >= 0)
  const printed = new Set()
  for (const k of idxs) {
    for (let d = -2; d <= 2; d += 1) {
      const t = k + d
      if (t < 0 || t >= out.length || printed.has(t)) continue
      printed.add(t)
      const [tag, line] = out[t]
      console.log(`${String(t).padStart(4)} ${tag} | ${line}`)
    }
    console.log('   ----')
  }
}
