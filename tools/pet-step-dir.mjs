/**
 * 量走路时「脚往哪边挪」，用来判定迈步方向对不对。
 *
 * 做法：拿同一相位（走路中某条腿在摆）的截图，量那条腿脚底的横向中心，
 * 与待机时同一位置对比。脚往行进方向挪才对。
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

/** 在 y 带内找所有亮像素的 x 中心（分左/右两个窗口） */
function footCenter(file, yFrom, yTo, x0, x1) {
  const G = gray(join(dir, file))
  let sum = 0
  let n = 0
  for (let y = Math.max(0, yFrom); y <= Math.min(G.h - 1, yTo); y++) {
    for (let x = Math.max(0, x0); x < Math.min(G.w, x1); x++) {
      if (G.data[y * G.w + x] > 130) { sum += x; n += 1 }
    }
  }
  return n ? sum / n : NaN
}

// 脚底那一段带（从之前实测：脚底 y≈470..487）
const YA = 468
const YB = 490
const LWIN = [200, 236]
const RWIN = [238, 272]

console.log('文件            左腿脚 x 中心   右腿脚 x 中心')
const rows = {}
for (const f of ['pet-idle.png', 'pet-walk-a.png', 'pet-walk-b.png']) {
  const l = footCenter(f, YA, YB, ...LWIN)
  const r = footCenter(f, YA, YB, ...RWIN)
  rows[f] = { l, r }
  console.log(`${f.padEnd(16)} ${l.toFixed(1).padStart(8)}  ${r.toFixed(1).padStart(12)}`)
}

const idle = rows['pet-idle.png']
const a = rows['pet-walk-a.png']
const b = rows['pet-walk-b.png']
console.log('')
console.log('相对待机的位移（正 = 往右）：')
console.log(`  walk-a  左 ${(a.l - idle.l).toFixed(1)}   右 ${(a.r - idle.r).toFixed(1)}`)
console.log(`  walk-b  左 ${(b.l - idle.l).toFixed(1)}   右 ${(b.r - idle.r).toFixed(1)}`)
console.log('')
console.log('判读：两张截图都是 facing=1（往右走），所以摆出去的那只脚应当往右挪（正数）。')
