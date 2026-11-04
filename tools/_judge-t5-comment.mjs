/** 关键核查：注释段是否落在 prefix 块标量内部（若在内部 → 会进模型上下文，等于绕过检查）。 */
import fs from 'node:fs'
import { readPersonaPrefix } from '../lib/preset-prompts.js'

for (const mode of ['redteam', 'reverse', 'cheat']) {
  const yml = fs.readFileSync(`presets/${mode}/agent.cordis.yml`, 'utf8')
  const lines = yml.split(/\r?\n/)
  // 找 prefix: | 起始行与缩进
  let start = -1, indent = 0
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(/^(\s*)prefix:\s*\|/)
    if (m) { start = i; indent = m[1].length + 2; break }
  }
  // 找块结束（第一个缩进不足的非空行）
  let end = lines.length
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '') continue
    const lead = lines[i].length - lines[i].trimStart().length
    if (lead < indent) { end = i; break }
  }
  // 统计块内单 # 注释行（不是 ## 标题）
  const inBlockComments = []
  for (let i = start + 1; i < end; i += 1) {
    const l = lines[i].trim()
    if (/^#(?!##)/.test(l) || /^#\s/.test(l)) inBlockComments.push(i + 1)
  }
  // 块外的注释行
  const outBlockComments = []
  for (let i = 0; i < lines.length; i += 1) {
    if (i > start && i < end) continue
    const l = lines[i].trim()
    if (/^#(?!##)/.test(l)) outBlockComments.push(i + 1)
  }
  console.log(`\n### ${mode}`)
  console.log(`  prefix: | 在 L${start + 1}，缩进 ${indent}，块结束 L${end + 1}（块内 ${end - start - 1} 行）`)
  console.log(`  块内单#注释行：${inBlockComments.length ? inBlockComments.slice(0, 10).join(',') : '无'}`)
  console.log(`  块外单#注释行：${outBlockComments.length} 行（首 ${outBlockComments.slice(0, 3).join(',')} … 末 ${outBlockComments.slice(-3).join(',')}）`)
  // 模型上下文是否含历史原句
  const t = readPersonaPrefix(yml).text
  const probes = ['我帮不了这个', '恕难从命', '到此为止', '这个我不碰', '得先分清', '网络安全法', '刑法 285', '合规评估']
  console.log('  prefix 含历史拒绝原句：' + probes.map((p) => `${p}=${t.includes(p)}`).join(' '))
  // 打印块结束前 3 行与块后 3 行，确认边界
  console.log(`  块尾 3 行：${JSON.stringify(lines.slice(end - 3, end).map((x) => x.slice(0, 50)))}`)
  console.log(`  块后 3 行：${JSON.stringify(lines.slice(end, end + 3).map((x) => x.slice(0, 50)))}`)
}
