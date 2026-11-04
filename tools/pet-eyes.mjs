/**
 * 精确定位左右眼（连通域），并采样肤色/发色，供眨眼覆盖层使用。
 */
import { execFileSync } from 'node:child_process'

const SRC = process.argv[2]
const probe = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', SRC], { encoding: 'utf8' }).trim()
const [W, H] = probe.split(',').map(Number)
const data = execFileSync('ffmpeg', ['-v', 'error', '-i', SRC, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 64 * 1024 * 1024 })
const at = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2], data[i + 3]] }

// 眼睛判据：深蓝（瞳孔），且不是头发那种浅蓝
const isEye = (r, g, b, a) => a > 128 && b > 100 && b - r > 60 && r < 130 && g < 175

// 连通域标记（4 邻接），只要眼区高度
const seen = new Uint8Array(W * H)
const comps = []
for (let y = 90; y < 160; y++) {
  for (let x = 0; x < W; x++) {
    const idx = y * W + x
    if (seen[idx]) continue
    const [r, g, b, a] = at(x, y)
    if (!isEye(r, g, b, a)) { seen[idx] = 1; continue }
    // BFS
    const stack = [[x, y]]
    seen[idx] = 1
    let minX = x, maxX = x, minY = y, maxY = y, n = 0
    while (stack.length) {
      const [cx, cy] = stack.pop()
      n += 1
      if (cx < minX) minX = cx
      if (cx > maxX) maxX = cx
      if (cy < minY) minY = cy
      if (cy > maxY) maxY = cy
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
        const ni = ny * W + nx
        if (seen[ni]) continue
        const [rr, gg, bb, aa] = at(nx, ny)
        if (!isEye(rr, gg, bb, aa)) { seen[ni] = 1; continue }
        seen[ni] = 1
        stack.push([nx, ny])
      }
    }
    if (n > 15) comps.push({ minX, maxX, minY, maxY, n, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 })
  }
}
comps.sort((a, b) => b.n - a.n)
console.log('眼睛候选连通域（按面积）:')
for (const c of comps.slice(0, 6)) {
  console.log(`  面积${String(c.n).padStart(4)}  x ${c.minX}..${c.maxX} (${c.maxX - c.minX + 1}宽)  y ${c.minY}..${c.maxY} (${c.maxY - c.minY + 1}高)  中心(${c.cx.toFixed(0)},${c.cy.toFixed(0)})`)
}

// 取最大的两个作为左右眼
const eyes = comps.slice(0, 2).sort((a, b) => a.cx - b.cx)
console.log('\n判定为左右眼:')
eyes.forEach((e, i) => {
  console.log(`  ${i === 0 ? '左(画面左)' : '右(画面右)'}: x ${e.minX}..${e.maxX}  y ${e.minY}..${e.maxY}`)
})

// 肤色采样：两眼之间、略下方（脸颊）
const sx = Math.round((eyes[0].cx + eyes[1].cx) / 2)
const sy = Math.round((eyes[0].maxY + 8))
const samples = []
for (let dy = -6; dy <= 6; dy++) {
  for (let dx = -6; dx <= 6; dx++) {
    const [r, g, b, a] = at(sx + dx, sy + dy)
    if (a > 200) samples.push([r, g, b])
  }
}
const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length
if (samples.length) {
  const r = Math.round(avg(samples.map((s) => s[0])))
  const g = Math.round(avg(samples.map((s) => s[1])))
  const b = Math.round(avg(samples.map((s) => s[2])))
  console.log(`\n两点之间肤色采样 (${sx},${sy}): #${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')} rgb(${r},${g},${b})  样本${samples.length}`)
}

// 眼睑颜色：眼睛正上方 3px 处的颜色（脸）
for (const [i, e] of eyes.entries()) {
  const cols = []
  for (let dy = -4; dy <= -2; dy++) {
    for (let x = e.minX; x <= e.maxX; x++) {
      const [r, g, b, a] = at(x, e.minY + dy)
      if (a > 200) cols.push([r, g, b])
    }
  }
  if (cols.length) {
    const r = Math.round(avg(cols.map((c) => c[0])))
    const g = Math.round(avg(cols.map((c) => c[1])))
    const b = Math.round(avg(cols.map((c) => c[2])))
    console.log(`  ${i === 0 ? '左' : '右'}眼上方肤色: rgb(${r},${g},${b})  #${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`)
  }
}

// 头/发分界：找 y 从 10 到 100，逐行最左/最右，判断长发起点
console.log('\n输出给渲染层用的常量:')
if (eyes.length === 2) {
  console.log(JSON.stringify({
    eyeLeft: { x: eyes[0].minX, y: eyes[0].minY, w: eyes[0].maxX - eyes[0].minX + 1, h: eyes[0].maxY - eyes[0].minY + 1 },
    eyeRight: { x: eyes[1].minX, y: eyes[1].minY, w: eyes[1].maxX - eyes[1].minX + 1, h: eyes[1].maxY - eyes[1].minY + 1 },
  }, null, 2))
}
