/**
 * 量截图里两条腿各自的「最低点」，用来客观验证抬脚确实发生了。
 *
 * 背景是深色、腿是浅肤色，所以「该列最靠下的亮像素」就是脚底。
 * 抬起来的那条腿，脚底 y 会明显高于另一条。
 */
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dir = join(here, '..', 'test', 'output')

function gray(path) {
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], {
    maxBuffer: 64 * 1024 * 1024,
  })
  const probe = execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path,
  ], { encoding: 'utf8' })
  const [w, h] = String(probe).trim().split(',').map(Number)
  return { w, h, data: buf }
}

// 先在待机图上定位腿区：整幅最靠下的亮像素就是脚底
const idle = gray(join(dir, 'pet-idle.png'))
let footY = 0
let footX = 0
for (let y = 0; y < idle.h; y++) {
  for (let x = 0; x < idle.w; x++) {
    // 排除右下角/右侧的 HUD
    if (x > 330 && y < 200) continue
    if (idle.data[y * idle.w + x] > 120) {
      if (y > footY) { footY = y }
      if (y > footY - 6) footX = x
    }
  }
}
console.log(`脚底大约在 y=${footY}，x≈${footX}`)

// 腿区：脚底往上 60px。横向窗口从实测行段取：
// 截图上左腿占 x215..227、右腿 x245..258，各留几像素余量。
const yTop = footY - 60
const windows = [
  ['左腿', 212, 230],
  ['右腿', 242, 261],
]

function footOf(file, x0, x1) {
  const G = gray(join(dir, file))
  let best = -1
  for (let y = yTop; y <= Math.min(G.h - 1, footY + 6); y++) {
    for (let x = Math.max(0, x0); x < Math.min(G.w, x1); x++) {
      if (G.data[y * G.w + x] > 150) { if (y > best) best = y; break }
    }
  }
  return best
}

console.log('')
console.log('文件            左腿脚底  右腿脚底   差')
for (const f of ['pet-idle.png', 'pet-walk-a.png', 'pet-walk-b.png']) {
  const [lw, lx0, lx1] = windows[0]
  const [rw, rx0, rx1] = windows[1]
  const l = footOf(f, lx0, lx1)
  const r = footOf(f, rx0, rx1)
  console.log(`${f.padEnd(16)} ${String(l).padStart(6)}  ${String(r).padStart(7)}  ${String(Math.abs(l - r)).padStart(3)}`)
}
console.log('')
console.log('判读：待机两脚应齐平（差 ≈ 0）；走路时抬起的那只脚底应更高（差 ≥ 4px）')
