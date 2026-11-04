/**
 * 分析桌宠素材，定位眨眼要用的眼睛区域、头发和身体轮廓。
 *
 * 素材是 204x320 的单帧 GIF（浅蓝长发猫耳 Q 版）。
 * 眨眼得靠覆盖层实现，所以必须知道眼睛的精确像素范围；
 * 发丝摆动用「按行水平位移」实现，所以要知道头发在哪些 y 段。
 */
import { execFileSync } from 'node:child_process'

const SRC = process.argv[2]
if (!SRC) {
  console.error('usage: node tools/pet-analyze.mjs <图片>')
  process.exit(1)
}

function toRgb(path) {
  const probe = execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path,
  ], { encoding: 'utf8' }).trim()
  const [w, h] = probe.split(',').map(Number)
  const raw = execFileSync('ffmpeg', [
    '-v', 'error', '-i', path,
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-',
  ], { maxBuffer: 64 * 1024 * 1024 })
  return { width: w, height: h, data: raw }
}

const img = toRgb(SRC)
const { width: W, height: H, data } = img
const at = (x, y) => {
  const i = (y * W + x) * 4
  return [data[i], data[i + 1], data[i + 2], data[i + 3]]
}

console.log(`尺寸 ${W}x${H}`)

// 1) 不透明包围盒（GIF 可能有透明边）
let minX = W, maxX = -1, minY = H, maxY = -1
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const a = at(x, y)[3]
    if (a > 24) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
}
console.log(`不透明包围盒: x ${minX}..${maxX}  y ${minY}..${maxY}`)

// 2) 找眼睛：高饱和蓝色像素（B 明显大于 R，且偏暗）
const bluePts = []
for (let y = minY; y <= maxY; y++) {
  for (let x = minX; x <= maxX; x++) {
    const [r, g, b, a] = at(x, y)
    if (a < 128) continue
    // 眼睛是较深的蓝色；头发是浅蓝（R 也不低）
    if (b > 120 && b - r > 70 && r < 120 && g < 170) bluePts.push([x, y, r, g, b])
  }
}
console.log(`\n深蓝像素（疑似眼睛/瞳色）: ${bluePts.length} 个`)
if (bluePts.length) {
  const ys = bluePts.map((p) => p[1])
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  console.log(`  y 范围: ${yMin}..${yMax}`)

  // 按 y 直方图找出最密集的两簇（左右眼）
  const hist = new Map()
  for (const [, y] of bluePts) hist.set(y, (hist.get(y) || 0) + 1)
  const top = [...hist.entries()].filter(([, n]) => n > 2).sort((a, b) => b[1] - a[1]).slice(0, 12)
  console.log('  密集行:', top.map(([y, n]) => `y${y}:${n}`).join(' '))

  // 左右分簇：以 x 中位数切
  const xs = bluePts.map((p) => p[0]).sort((a, b) => a - b)
  const midX = xs[Math.floor(xs.length / 2)]
  const left = bluePts.filter((p) => p[0] < midX)
  const right = bluePts.filter((p) => p[0] >= midX)
  for (const [name, pts] of [['右眼(画面左)', left], ['左眼(画面右)', right]]) {
    if (!pts.length) continue
    const px = pts.map((p) => p[0])
    const py = pts.map((p) => p[1])
    console.log(`  ${name}: x ${Math.min(...px)}..${Math.max(...px)}  y ${Math.min(...py)}..${Math.max(...py)}`)
  }
}

// 3) 逐行统计「内容宽度」和「浅蓝占比」，用来确定头发分段
console.log('\n逐行画像（每 8 行采样）: y | 内容x范围 | 宽 | 浅蓝% | 深色%')
const lightBlue = (r, g, b) => b > 170 && b - r > 15 && r > 120 && g > 150
const dark = (r, g, b) => r < 90 && g < 90 && b < 110
for (let y = minY; y <= maxY; y += 8) {
  let l = W, r2 = -1, lb = 0, dk = 0, n = 0
  for (let x = 0; x < W; x++) {
    const [r, g, b, a] = at(x, y)
    if (a < 128) continue
    if (x < l) l = x
    if (x > r2) r2 = x
    if (lightBlue(r, g, b)) lb += 1
    if (dark(r, g, b)) dk += 1
    n += 1
  }
  if (r2 < 0) { console.log(`${String(y).padStart(3)} | (空)`); continue }
  console.log(
    `${String(y).padStart(3)} | ${l}..${r2} | ${String(r2 - l + 1).padStart(3)} | ` +
    `${((lb / n) * 100).toFixed(0).padStart(3)}% | ${((dk / n) * 100).toFixed(0).padStart(3)}%`,
  )
}

// 4) 主色调
const buckets = new Map()
for (let y = minY; y <= maxY; y += 2) {
  for (let x = minX; x <= maxX; x += 2) {
    const [r, g, b, a] = at(x, y)
    if (a < 200) continue
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`
    const cur = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 }
    cur.n += 1; cur.r += r; cur.g += g; cur.b += b
    buckets.set(key, cur)
  }
}
const totalPx = [...buckets.values()].reduce((a, v) => a + v.n, 0)
console.log('\n主色:')
for (const [, v] of [...buckets.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 8)) {
  const r = Math.round(v.r / v.n), g = Math.round(v.g / v.n), b = Math.round(v.b / v.n)
  console.log(`  #${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}  ${((v.n / totalPx) * 100).toFixed(1)}%`)
}
