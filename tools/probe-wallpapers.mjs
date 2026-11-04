/**
 * 探测当前运行的 DSH Web GUI 有没有把最新内置壁纸加载进来。
 *
 * 用法：node tools/probe-wallpapers.mjs [port]
 * 默认 52542（桌面宿主当前监听的端口）。
 *
 * 判定口径：逐个 HEAD 请求 /Xsdsh-purge-next/wallpapers/<id>.<ext>，
 * 期望 200 且 content-length 与本地文件一致；404 说明那个实例跑的还是旧模块。
 */
import { statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const pkgRoot = join(here, '..')

const port = Number(process.argv[2] || 52542)
const base = `http://127.0.0.1:${port}/Xsdsh-purge-next/wallpapers`

const { WALLPAPERS } = await import(new URL('../lib/wallpapers.js', import.meta.url).href)

let bad = 0
for (const wp of WALLPAPERS) {
  const localPath = join(pkgRoot, 'lib', 'wallpapers', wp.file)
  let localSize = 0
  try {
    localSize = statSync(localPath).size
  } catch {
    console.log(`MISSING  ${wp.id.padEnd(20)} 本地文件不存在: ${wp.file}`)
    bad += 1
    continue
  }

  let response
  try {
    response = await fetch(`${base}/${wp.file}`, { method: 'HEAD' })
  } catch (err) {
    console.log(`DEAD     ${wp.id.padEnd(20)} 连不上 ${base}（${err.message}）`)
    bad += 1
    continue
  }

  const served = Number(response.headers.get('content-length') || 0)
  const ok = response.status === 200 && served === localSize
  console.log(
    `${ok ? 'OK      ' : 'BAD     '}${wp.id.padEnd(20)} status=${response.status} served=${served} local=${localSize}`,
  )
  if (!ok) bad += 1
}

console.log(bad === 0 ? 'RESULT: 运行中的实例已加载全部内置壁纸' : `RESULT: ${bad} 项对不上（多半是实例还没重启）`)
process.exit(bad === 0 ? 0 : 1)
