/**
 * 扫 Electron 的浏览器缓存，判断宿主注入的插件代码是哪个版本。
 * 命中 "xsdsh-lg-refract" 说明浏览器拿到过新版；只有旧标记说明是旧 bundle。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const roots = [
  join(homedir(), 'AppData/Roaming/@deepseek-ai/dsh-desktop/Cache/Cache_Data'),
  join(homedir(), 'AppData/Roaming/@deepseek-ai/dsh-desktop/Code Cache/js'),
]

const marks = {
  '新版·折射滤镜': 'xsdsh-lg-refract',
  '新版·ensureGlassFilter': 'ensureGlassFilter',
  '新版·猫眼玻璃': '猫眼玻璃',
  '旧版·极淡白色内高光': '再叠一层极淡的白色内高光',
  '插件代码': 'Xsdsh-purge-next',
}

function walk(dir, out = []) {
  let items = []
  try {
    items = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const it of items) {
    const p = join(dir, it.name)
    if (it.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

let scanned = 0
const found = Object.fromEntries(Object.keys(marks).map((k) => [k, 0]))
const samples = []

for (const root of roots) {
  for (const file of walk(root)) {
    let size = 0
    try {
      size = statSync(file).size
    } catch {
      continue
    }
    if (size < 200 || size > 20 * 1024 * 1024) continue
    let buf
    try {
      buf = readFileSync(file)
    } catch {
      continue
    }
    scanned += 1
    const text = buf.toString('latin1')
    for (const [label, needle] of Object.entries(marks)) {
      if (text.includes(needle)) {
        found[label] += 1
        if (samples.length < 12) samples.push(`${label} ← ${file.replace(root, '<cache>')}`)
      }
    }
  }
}

console.log(`扫描缓存文件 ${scanned} 个`)
for (const [label, n] of Object.entries(found)) {
  console.log(`  ${n > 0 ? '命中' : '    '} ${String(n).padStart(3)}  ${label}`)
}
if (samples.length) {
  console.log('\n样例:')
  for (const s of samples) console.log('  ' + s)
}
