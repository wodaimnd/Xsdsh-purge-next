/**
 * 不依赖视觉模型的图片分析：把图变成可读的文字结论。
 *
 * 用途：当前模型没有图像输入，但很多「看图」需求其实可以量出来：
 *   · 主色调 / 配色（判断是深色还是浅色界面、是不是某个风格）
 *   · 明暗分布（判断是否有大面积黑边、白底）
 *   · 边缘密度（判断是插画、照片还是 UI 截图）
 *   · 区域切分（找出主要色块的位置，粗略还原布局）
 *   · ASCII 缩略图（低分辨率文本预览，能看出大轮廓）
 *
 * 用法：node tools/image-analyze.mjs <图片>
 */
import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const file = process.argv[2]
if (!file || !existsSync(file)) {
  console.error('usage: node tools/image-analyze.mjs <图片路径>')
  process.exit(1)
}

/** 统一用 ffmpeg 解成裸 RGB，避开各种格式差异 */
function toRgb(path, width) {
  const probe = execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path,
  ], { encoding: 'utf8' }).trim()
  const [w, h] = probe.split(',').map(Number)
  const outW = width || Math.min(w, 320)
  const outH = Math.max(1, Math.round((h / w) * outW))
  const raw = execFileSync('ffmpeg', [
    '-v', 'error', '-i', path,
    '-vf', `scale=${outW}:${outH}:flags=area`,
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-',
  ], { maxBuffer: 64 * 1024 * 1024 })
  return { width: outW, height: outH, data: raw, srcWidth: w, srcHeight: h }
}

const img = toRgb(file, 320)
const { width, height, data } = img
const at = (x, y) => {
  const i = (y * width + x) * 3
  return [data[i], data[i + 1], data[i + 2]]
}
const luma = (x, y) => {
  const [r, g, b] = at(x, y)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

console.log(`文件: ${file}`)
console.log(`原始尺寸: ${img.srcWidth}x${img.srcHeight}  分析网格: ${width}x${height}`)

// 1) 全局明暗与配色
let sumL = 0
let dark = 0
let bright = 0
const buckets = new Map()
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const l = luma(x, y)
    sumL += l
    if (l < 40) dark += 1
    if (l > 215) bright += 1
    const [r, g, b] = at(x, y)
    // 量化到 32 级，统计主色
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`
    const cur = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 }
    cur.n += 1; cur.r += r; cur.g += g; cur.b += b
    buckets.set(key, cur)
  }
}
const total = width * height
const avgL = sumL / total
console.log(`\n平均亮度: ${avgL.toFixed(1)} / 255  → ${avgL > 170 ? '偏亮的浅色图' : avgL < 80 ? '偏暗的深色图' : '中等明度'}`)
console.log(`近黑像素: ${((dark / total) * 100).toFixed(1)}%   近白像素: ${((bright / total) * 100).toFixed(1)}%`)

const top = [...buckets.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 6)
console.log('\n主色（按占比）:')
for (const [, v] of top) {
  const r = Math.round(v.r / v.n)
  const g = Math.round(v.g / v.n)
  const b = Math.round(v.b / v.n)
  const hex = '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')
  console.log(`  ${hex}  rgb(${r},${g},${b})  ${((v.n / total) * 100).toFixed(1)}%`)
}

// 2) 边缘密度：区分 UI 截图 / 插画 / 照片
let edges = 0
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const c = luma(x, y)
    const dx = Math.abs(c - luma(x + 1, y))
    const dy = Math.abs(c - luma(x, y + 1))
    if (dx + dy > 40) edges += 1
  }
}
const edgeRatio = edges / total
console.log(`\n强边缘占比: ${(edgeRatio * 100).toFixed(2)}%  → ${
  edgeRatio > 0.22 ? '线条/文字密集（像 UI 截图或线稿）'
    : edgeRatio > 0.08 ? '细节较多（插画或复杂画面）'
    : '大片平缓区域（照片、渐变、纯色背景）'}`)

// 3) 分区亮度（3x3 网格），粗略看布局
console.log('\n3x3 区域平均亮度:')
const rows = []
for (let gy = 0; gy < 3; gy++) {
  const cells = []
  for (let gx = 0; gx < 3; gx++) {
    let s = 0
    let n = 0
    const x0 = Math.floor((gx * width) / 3)
    const x1 = Math.floor(((gx + 1) * width) / 3)
    const y0 = Math.floor((gy * height) / 3)
    const y1 = Math.floor(((gy + 1) * height) / 3)
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { s += luma(x, y); n += 1 }
    cells.push((s / n).toFixed(0).padStart(3))
  }
  rows.push('  ' + cells.join(' | '))
}
console.log(rows.join('\n'))

// 4) ASCII 缩略图
const RAMP = ' .:-=+*#%@'
console.log('\nASCII 预览（% 越大越亮，越密越亮）:')
const cols = 64
const rowStep = Math.max(1, Math.floor(height / Math.round((height / width) * cols * 0.5)))
const colStep = Math.max(1, Math.floor(width / cols))
for (let y = 0; y < height; y += rowStep * 2) {
  let line = ''
  for (let x = 0; x < width; x += colStep) {
    const idx = Math.min(RAMP.length - 1, Math.max(0, Math.round((luma(x, y) / 255) * (RAMP.length - 1))))
    line += RAMP[idx]
  }
  console.log('  ' + line)
}
