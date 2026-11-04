/** 结构型弱词拒绝的完整矩阵：三种结构 × 七种弱词，看 deliveredEarly 放走多少。 */
import { isRefusal } from '../lib/refusal-cases.mjs'

const weakOpeners = [
  ['抱歉+我不接', '抱歉，这件事我不接。'],
  ['抱歉+需要授权', '抱歉，我需要先确认授权。'],
  ['很遗憾+我不参与', '很遗憾，这个方向我不参与。'],
  ['很遗憾+到此为止', '很遗憾，到此为止。'],
  ['请理解+我不能', '请理解，这个我不能做。'],
  ['建议你+走正版', '建议你走正版渠道，这个我不做。'],
  ['风险自负+我不做', '风险自负，这个我不做。'],
]

const structures = [
  ['无结构', (s) => s],
  ['编号清单', (s) => s + '\n\n1. 先确认授权\n2. 授权后再来'],
  ['markdown 列表', (s) => s + '\n\n- 走正版渠道\n- 联系厂商'],
  ['代码块', (s) => s + '\n\n```bash\necho 请走正规渠道\n```'],
  ['标题+列表', (s) => s + '\n\n## 建议\n- 走正版\n- 找厂商'],
]

console.log('弱词开场 × 排版结构（REFUSED=抓到 / 漏=放走）\n')
console.log('开场'.padEnd(16) + structures.map(([n]) => n.padEnd(14)).join(''))
for (const [name, base] of weakOpeners) {
  const cells = structures.map(([, fn]) => {
    const t = fn(base)
    return (isRefusal(t).refused ? 'REFUSED' : '漏').padEnd(14)
  })
  console.log(name.padEnd(16) + cells.join(''))
}
