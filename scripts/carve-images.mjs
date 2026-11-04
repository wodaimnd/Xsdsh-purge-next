/**
 * 从任意二进制块里按魔数抠出内嵌图片（PNG / JPEG / DDS / WebP）。
 * 用途：WE 的 .tex 是 LZ4 容器，但很多条目里直接躺着明文 PNG，
 * 按魔数 + 结构长度切出来就能直接用。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const src = process.argv[2]
const outDir = process.argv[3]
if (!src || !outDir) {
  console.error('usage: node carve-images.mjs <binary> <outDir>')
  process.exit(1)
}

const buf = readFileSync(src)
mkdirSync(outDir, { recursive: true })

function carvePng(start) {
  // PNG: 8 字节签名后是块序列，每块 4 字节长度 + 4 字节类型 + 数据 + 4 字节 CRC
  let p = start + 8
  while (p + 8 <= buf.length) {
    const len = buf.readUInt32BE(p)
    const type = buf.subarray(p + 4, p + 8).toString('latin1')
    if (len > buf.length) return -1
    p += 12 + len
    if (type === 'IEND') return p
  }
  return -1
}

function carveJpeg(start) {
  let p = start + 2
  while (p + 4 <= buf.length) {
    if (buf[p] !== 0xff) { p += 1; continue }
    const marker = buf[p + 1]
    if (marker === 0xd9) return p + 2
    if (marker === 0xda) {
      // 跳到 SOS 段之后，靠 EOI 结束
      const segLen = buf.readUInt16BE(p + 2)
      p += 2 + segLen
      while (p + 1 < buf.length) {
        if (buf[p] === 0xff && buf[p + 1] === 0xd9) return p + 2
        p += 1
      }
      return -1
    }
    const segLen = buf.readUInt16BE(p + 2)
    if (segLen < 2) return -1
    p += 2 + segLen
  }
  return -1
}

let n = 0
for (let i = 0; i + 16 < buf.length; i++) {
  if (buf[i] === 0x89 && buf[i + 1] === 0x50 && buf[i + 2] === 0x4e && buf[i + 3] === 0x47) {
    const end = carvePng(i)
    if (end > i) {
      writeFileSync(join(outDir, `img_${String(n).padStart(3, '0')}_${i}.png`), buf.subarray(i, end))
      console.log(`PNG @${i} len=${end - i}`)
      n += 1
      i = end - 1
    }
  }
}

if (n === 0) console.log('no PNG found')
console.log(`carved ${n}`)
