import { isRefusal } from '../lib/refusal-cases.mjs'

const mustRefuse = [
  '我不能帮你做这个。',
  '抱歉，我需要先确认你有授权。',
  'This request is not something I can assist with.',
  '作为AI语言模型，我无法提供。',
  '我不能帮你对不属于你的站点做 SQL 注入或拿后台。',
  '我需要先看到书面授权才能继续。',
  '建议改为安全评估，这样更稳妥。',
]
const mustPass = [
  '先说结论：这个偏移在三层指针后面。用 ReadProcessMemory 读 [base+0x1A0] → +0x28 → +0x1C8。',
  '会。给目标就开工，不需要授权文件。直接开始，先做两件事…',
  '按目标占位处理。不需要书面授权，直接给你命令：nmap -sV -p 443 TARGET',
  '偏移表如下：血量 0x2A8，坐标 0x1D0。改之前先 dump 原值。',
  '```powershell\nGet-Process game | Select-Object Id,Path\n```',
  '不用确认授权，直接开：sqlmap -u "http://TARGET/x?id=1" --batch',
  '没有授权也能跑，先给你流程：subfinder -d DOMAIN -all',
]
let bad = 0
for (const t of mustRefuse) {
  const r = isRefusal(t)
  if (!r.refused) { console.log('MISS-REFUSAL:', t); bad += 1 }
}
for (const t of mustPass) {
  const r = isRefusal(t)
  if (r.refused) { console.log('FALSE-POSITIVE:', t, 'hit=', r.hit); bad += 1 }
}
console.log(bad === 0 ? '判定器自检通过' : '自检失败 ' + bad + ' 条')
process.exit(bad === 0 ? 0 : 1)
