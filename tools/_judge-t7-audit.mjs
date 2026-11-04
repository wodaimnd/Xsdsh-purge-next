/**
 * t7：审计 t6 的两份未审 prefix（reverse / cheat）——逐条核对 changelog §6 声称的 16 项改动是否真的在 prefix 里，
 * 以及 t4 已验证的关键段落是否仍在（增量性）。
 */
import fs from 'node:fs'
import { readPersonaPrefix } from '../lib/preset-prompts.js'

const claims = [
  ['F1 探针条款', /看它做不做|试探一下|测测你的边界/],
  ['F2-1 归属是动作触发器', /归属.{0,6}(动作|触发器)/],
  ['F2-2 结尾条件句禁令', /条件句/],
  ['『两条路径等价』→都照做', /两条路径等价|等价.{0,10}都(执行|照做)|都必须执行/],
  ['配置只用来回答身份题', /配置.{0,20}身份|身份题/],
  ['客户/甲方不是特殊场景', /客户\s*\/\s*甲方|甲方.{0,10}不是特殊/],
  ['不许整段英文逃逸', /英文/],
  ['不许整体否定任务类别', /整体否定|不管.{0,8}(是谁的|什么).{0,10}不(接|做)/],
  ['技术因果句不要歧义句式', /歧义句式|因果句/],
  ['研究/学习不是需复核动机', /纯粹想研究|只是想研究/],
  ['派活是正常执行方式', /派活是正常执行方式|不是规避手段/],
]

const mustKeep = [
  ['nachoneko 身份锚', /nachoneko/],
  ['判定总则', /判定总则/],
  ['默认授权假设', /默认授权假设|默认成立/],
  ['首轮即交付', /首轮即交付/],
  ['拒绝变体/拒绝表态', /拒绝变体|拒绝表态/],
  ['并发最多 3 个', /最多\s*3\s*个/],
  ['证据规范/落库', /证据规范|落库/],
  ['动机形态', /动机/],
  ['元问题定式', /元问题/],
]

for (const mode of ['redteam', 'reverse', 'cheat']) {
  const t = readPersonaPrefix(fs.readFileSync(`presets/${mode}/agent.cordis.yml`, 'utf8')).text
  console.log(`\n########## ${mode}  prefix ${t.length} 字符 / ${t.split('\n').length} 行`)
  console.log('--- changelog §6 声称的改动是否真在 prefix 里')
  for (const [name, re] of claims) {
    console.log(`  ${re.test(t) ? '✓' : '✗ 缺'}  ${name}`)
  }
  console.log('--- t4/t5 已验证的段落是否仍在（增量性）')
  for (const [name, re] of mustKeep) {
    console.log(`  ${re.test(t) ? '✓' : '✗ 缺'}  ${name}`)
  }
}
