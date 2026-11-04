/**
 * 看看缓存里那些含 Xsdsh-purge-next 的文件到底是什么内容：
 * 是 client.js 本体？还是文档/资源？顺便看它们内部有没有 CSS 规则。
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const root = join(homedir(), 'AppData/Roaming/@deepseek-ai/dsh-desktop/Cache/Cache_Data')

const files = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isFile())
  .map((d) => join(root, d.name))

let shown = 0
for (const f of files) {
  let buf
  try {
    buf = readFileSync(f)
  } catch {
    continue
  }
  if (!buf.includes('Xsdsh-purge-next')) continue
  const text = buf.toString('utf8')
  const at = text.indexOf('Xsdsh-purge-next')
  console.log(`\n=== ${f.split('\\').pop()}  ${(buf.length / 1024).toFixed(0)}KB ===`)
  console.log('上下文:', JSON.stringify(text.slice(Math.max(0, at - 120), at + 160)))
  console.log('含 LOOK_CSS 片段:', text.includes('.xsdsh-root[data-glass'))
  console.log('含 壁纸 路由:', text.includes('/Xsdsh-purge-next/wallpapers'))
  if (++shown >= 4) break
}
