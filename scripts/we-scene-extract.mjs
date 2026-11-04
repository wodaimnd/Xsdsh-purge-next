/**
 * Wallpaper Engine scene.pkg 条目扫描器（PKGV0018 / PKGV0021）。
 *
 * 包内布局：
 *   头（u32 版本串长度 + 版本串 + u32 第一段表长）
 *   文件表（连续串接的 { u32 nameLen(含结尾 NUL) + name + u32 offset + u32 size }）
 *   数据区（每个条目的块，LZ4 压缩；offset 相对数据区起点）
 *
 * 单靠头里的表长只覆盖第一段，所以顺序扫到第一个数据块为止，用最后一条记录的
 * 结束位置作为数据区起点，再按 base+offset 取块。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

const pkgPath = process.argv[2]
const outDir = process.argv[3]
if (!pkgPath || !outDir) {
  console.error('usage: node we-scene-extract.mjs <scene.pkg> <outDir>')
  process.exit(1)
}

const buf = readFileSync(pkgPath)
const verLen = buf.readUInt32LE(0)
const version = buf.subarray(4, 4 + verLen).toString('latin1')
let p = 4 + verLen + 4
console.log(`version=${version} size=${buf.length}`)

const NAME_RE = /^[\w./\\ @()\-\[\]]+$/
const EXT_RE = /\.(tex|json|frag|vert|geom|comp|mp4|webm|wav|mp3|ogg|gif|png|jpg|jpeg)$/i

const entries = []
while (p + 8 <= buf.length) {
  const nameLen = buf.readUInt32LE(p)
  if (nameLen < 3 || nameLen > 200 || p + 4 + nameLen + 8 > buf.length) break
  const name = buf.subarray(p + 4, p + 4 + nameLen).toString('utf8').replace(/\0+$/, '')
  if (!NAME_RE.test(name) || !EXT_RE.test(name)) break
  const offset = buf.readUInt32LE(p + 4 + nameLen)
  const size = buf.readUInt32LE(p + 4 + nameLen + 4)
  entries.push({ name, offset, size })
  p += 4 + nameLen + 8
}

const dataStart = p
console.log(`entries=${entries.length} tableEnd=${dataStart} dataBytes=${buf.length - dataStart}`)

mkdirSync(join(outDir, '_raw'), { recursive: true })
writeFileSync(join(outDir, '_entries.json'), JSON.stringify({ version, tableEnd: dataStart, entries }, null, 2), 'utf8')

let bad = 0
for (const e of entries) {
  const abs = dataStart + e.offset
  if (abs + e.size > buf.length) {
    // 有包的 offset 是绝对位置而不是相对数据区，兜一下
    if (e.offset + e.size <= buf.length) {
      writeFileSync(join(outDir, '_raw', e.name.replace(/[\\/]/g, '__')), buf.subarray(e.offset, e.offset + e.size))
      continue
    }
    console.log(`  !! out of range: ${e.name} off=${e.offset} size=${e.size}`)
    bad++
    continue
  }
  const dest = join(outDir, '_raw', e.name.replace(/[\\/]/g, '__'))
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, buf.subarray(abs, abs + e.size))
}
console.log(`written, bad=${bad}`)
