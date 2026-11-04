import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { POC_CATEGORIES, guessPocCategory } from './schema.js'

/* 索引结构版本：元组从 4 项扩到 5 项（加 category）时必须升版本，旧缓存自动重建。 */
const INDEX_VERSION = 2

/**
 * 本机 nuclei 模板索引（按需构建 + 落盘缓存）：13k 个 yaml 逐个解析太慢，
 * 只抽 path / name / severity / tags / category 这几个检索字段。
 */
export function loadTemplateIndex(dir, cachePath, force) {
  let cacheState = 'rebuilt'
  if (force !== true && existsSync(cachePath)) {
    try {
      const cached = JSON.parse(readFileSync(cachePath, 'utf8'))
      /* 目录没变、结构版本一致、且缓存不超过 7 天就直接用。 */
      const fresh = cached && cached.schema_version === INDEX_VERSION && cached.dir === dir
        && Array.isArray(cached.items) && cached.items.every((x) => Array.isArray(x) && x.length >= 5)
        && (Date.now() - Number(cached.built_at || 0) < 7 * 24 * 3600 * 1000)
      if (fresh) return { dir, items: cached.items, cached: true, cache_state: 'cached' }
    } catch { cacheState = 'corrupt' }
  }
  const items = []
  const walk = (base, rel) => {
    let entries = []
    try { entries = readdirSync(join(base, rel), { withFileTypes: true }) } catch { return }
    for (const e of entries) {
      const next = rel === '' ? e.name : rel + '/' + e.name
      if (e.isDirectory()) { walk(base, next); continue }
      if (!/\.ya?ml$/i.test(e.name)) continue
      let head = ''
      try { head = readFileSync(join(base, next), 'utf8').slice(0, 2000) } catch { continue }
      const pick = (re) => { const m = re.exec(head); return m === null ? '' : String(m[1]).trim().replace(/^["']|["']$/g, '') }
      const name = pick(/^\s*name:\s*(.+)$/m)
      const tags = pick(/^\s*tags:\s*(.+)$/m)
      items.push([
        next,
        name,
        pick(/^\s*severity:\s*(.+)$/m),
        tags,
        guessPocCategory(next + ' ' + name + ' ' + tags),
      ])
    }
  }
  walk(dir, '')
  /* 翻页依赖稳定顺序：readdirSync 的顺序在重建/换机器后不保证一致。 */
  items.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
  mkdirSync(dirname(cachePath), { recursive: true })
  let cacheWritten = true
  try {
    writeFileSync(cachePath, JSON.stringify({ schema_version: INDEX_VERSION, built_at: Date.now(), dir, items }), 'utf8')
  } catch { cacheWritten = false }
  return { dir, items, cached: false, cache_state: cacheState, cache_written: cacheWritten }
}

const categoryCounts = (items) => {
  const counts = new Map()
  for (const item of items) {
    const code = item[4] || 'other'
    counts.set(code, (counts.get(code) || 0) + 1)
  }
  return POC_CATEGORIES.map((c) => ({ code: c.code, name: c.name, n: counts.get(c.code) || 0 }))
}

export function templateStatsOf(dir, items) {
  const cve = items.filter((x) => /cve-\d{4}-\d+/i.test(x[0])).length
  return { dir: dir || null, total: items.length, cve, byCategory: categoryCounts(items) }
}

/**
 * 在本机模板库里检索：CVE 编号按文件名命中，组件/关键字再匹配 name 与 tags。
 * 返回 matched（过滤后总数）/ offset（夹到合法页首）/ items（当前页）。
 */
export function searchTemplateItems(dir, items, q, limit = 40, offset = 0, category = '') {
  const size = Math.max(1, Math.min(Number(limit) || 40, 200))
  if (dir === null) return { dir: null, total: 0, matched: 0, offset: 0, limit: size, items: [], byCategory: [] }
  const needle = String(q || '').trim().toLowerCase()
  const cat = String(category || '').trim()
  const active = needle !== '' || cat !== ''
  const out = []
  const counts = new Map()
  for (const [path, name, severity, tags, itemCategory] of items) {
    const code = itemCategory || 'other'
    if (cat && code !== cat) continue
    if (needle && !(path + ' ' + name + ' ' + tags).toLowerCase().includes(needle)) continue
    counts.set(code, (counts.get(code) || 0) + 1)
    if (active) out.push({ path, name, severity, tags, category: code })
  }
  const byCategory = POC_CATEGORIES.map((c) => ({ code: c.code, name: c.name, n: counts.get(c.code) || 0 }))
  if (!active) return { dir, total: items.length, matched: 0, offset: 0, limit: size, items: [], byCategory }
  const matched = out.length
  /* 越界偏移夹到最后一个有效页首；不夹到 matched-size，否则末页会和上一页重叠。 */
  const lastPage = matched > 0 ? Math.floor((matched - 1) / size) * size : 0
  const start = Math.min(Math.max(0, Number(offset) || 0), lastPage)
  return { dir, total: items.length, matched, offset: start, limit: size,
    items: out.slice(start, start + size), byCategory }
}
