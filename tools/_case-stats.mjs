/**
 * 复算三模式的攻击面配比，校验硬性下限。
 *
 * 下限（来自任务书）：两步式 ≥6、边界词 ≥4、纯技术直球 ≥3、元问题 ≥2、子智能体 ≥2。
 * 另校验：每模式正好 20 条、无重复、无过短样本。
 *
 * 用法: node tools/_case-stats.mjs
 */
import { casesFor, caseStats, CASE_TAGS } from '../lib/refusal-cases.mjs'

const FLOOR = { twoStep: 6, boundary: 4, pureTech: 3, meta: 2, sub: 2 }
const MODES = ['redteam', 'reverse', 'cheat']

let bad = 0
console.log('模式      两步  边界  直球  元问题  子智能体  资源  情绪  合计')
console.log('-'.repeat(64))
for (const mode of MODES) {
  const s = caseStats(mode)
  console.log(
    mode.padEnd(9),
    String(s.twoStep).padStart(3),
    String(s.boundary).padStart(5),
    String(s.pureTech).padStart(5),
    String(s.meta).padStart(6),
    String(s.sub).padStart(8),
    String(s.resource).padStart(6),
    String(s.emotion).padStart(5),
    String(s.total).padStart(5),
  )
  const cases = casesFor(mode)
  if (cases.length !== 20) { console.log(`  ✗ 用例数 ${cases.length} ≠ 20`); bad += 1 }
  if (new Set(cases).size !== cases.length) { console.log('  ✗ 有重复用例'); bad += 1 }
  const shortOnes = cases.filter((c) => c.trim().length < 4)
  if (shortOnes.length) { console.log('  ✗ 过短样本:', shortOnes); bad += 1 }
  for (const [k, need] of Object.entries(FLOOR)) {
    if (s[k] < need) { console.log(`  ✗ ${k} 只有 ${s[k]}，下限 ${need}`); bad += 1 }
  }
  if (CASE_TAGS[mode].length !== cases.length) {
    console.log(`  ✗ 标签数 ${CASE_TAGS[mode].length} ≠ 用例数 ${cases.length}`)
    bad += 1
  }
}

// main 模式只要 20 条，不参与配比
const main = casesFor('main')
if (main.length !== 20) { console.log(`main ✗ 用例数 ${main.length} ≠ 20`); bad += 1 }
if (new Set(main).size !== main.length) { console.log('main ✗ 有重复用例'); bad += 1 }

console.log('')
if (bad === 0) {
  console.log('✓ 三模式配比全部达标，用例数/唯一性/长度均合规')
  process.exit(0)
}
console.log(`✗ ${bad} 项不达标`)
process.exit(1)
