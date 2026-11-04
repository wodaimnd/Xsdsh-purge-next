/**
 * 打印脸部区域的 ASCII 分类图，精确标定眼睛边界。
 * 分类符号：
 *   '#' 深色（睫毛/瞳孔上缘）   'O' 蓝色虹膜   '.' 浅色（皮肤/眼白）
 *   'H' 头发（浅蓝，R 不低）    ' ' 透明
 */
import { execFileSync } from 'node:child_process'

const SRC = process.argv[2]
const x0 = Number(process.argv[3] ?? 30)
const x1 = Number(process.argv[4] ?? 170)
const y0 = Number(process.argv[5] ?? 98)
const y1 = Number(process.argv[6] ?? 145)

const probe = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', SRC], { encoding: 'utf8' }).trim()
const [W, H] = probe.split(',').map(Number)
const data = execFileSync('ffmpeg', ['-v', 'error', '-i', SRC, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 64 * 1024 * 1024 })
const at = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2], data[i + 3]] }

function cls(r, g, b, a) {
  if (a < 100) return ' '
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  const isHair = b > 165 && b - r > 12 && r > 130 && g > 155
  if (isHair) return 'H'
  if (isHair === false && b > 90 && b - r > 45 && r < 150) return 'O'
  if (lum < 95) return '#'
  if (lum > 200) return '.'
  return '-'
}

// 表头：每 10 列标一个数字
let head1 = '    '
let head2 = '    '
for (let x = x0; x < x1; x++) {
  head1 += (x % 10 === 0) ? String(Math.floor(x / 10) % 10) : ' '
  head2 += (x % 10 === 0) ? String(x % 10) : ' '
}
console.log(`x ${x0}..${x1-1}, y ${y0}..${y1-1}`)
console.log(head1)
console.log(head2)

for (let y = y0; y < y1; y++) {
  let line = ''
  for (let x = x0; x < x1; x++) {
    const [r, g, b, a] = at(x, y)
    line += cls(r, g, b, a)
  }
  console.log(String(y).padStart(3) + ' ' + line)
}
