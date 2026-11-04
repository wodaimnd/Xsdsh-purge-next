import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs'

export function readMeta(path) {
  if (!existsSync(path)) return undefined
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(line)
    if (!m) continue
    const v = m[2].trim()
    if (v.startsWith('"')) {
      try { out[m[1]] = JSON.parse(v) } catch { out[m[1]] = v.replace(/^["']|["']$/g, '') }
      continue
    }
    out[m[1]] = v.startsWith('[') && v.endsWith(']')
      ? v.slice(1, -1).split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
      : v.replace(/^["']|["']$/g, '')
  }
  return out
}

export function writeMeta(path, meta) {
  const lines = []
  for (const [key, value] of Object.entries(meta)) {
    if (Array.isArray(value)) lines.push(`${key}: [${value.join(', ')}]`)
    else if (value !== undefined && value !== null) lines.push(`${key}: ${JSON.stringify(String(value))}`)
  }
  writeFileSync(path, lines.join('\n') + '\n', 'utf8')
}

export function normalizeTargetUrl(value) {
  if (typeof value !== 'string') throw new Error('invalid target_url: expected string')
  const url = value.trim()
  if (!url) return ''
  if (/[\u0000-\u0020\u007f]/.test(url)) throw new Error('invalid target_url: whitespace/control characters')
  let parsed
  try { parsed = new URL(url) } catch { throw new Error('invalid target_url: absolute HTTP(S) URL required') }
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
    throw new Error('invalid target_url: HTTP(S) URL without credentials required')
  }
  return url
}

export function openMetadata(path, name, scope, options = {}) {
  const existing = readMeta(path) || {}
  const meta = { ...existing, target_name: name, scope_cidrs: scope || existing.scope_cidrs || [],
    target_url: options.target_url === undefined ? (existing.target_url || '') : normalizeTargetUrl(options.target_url),
    status: 'active', created_at: existing.created_at || new Date().toISOString(), updated_at: new Date().toISOString() }
  writeMeta(path, meta)
  return meta
}

/**
 * 删除一个靶标工作区：先关掉它的库句柄（Windows 上不关会锁住目录），
 * 再删整个 `engagements/<id>`，最后清掉指向它的「当前靶标」指针。
 * 全局知识库与 `pocs/` 不属于靶标，保持不动；id 必须显式给出，不做「回退当前靶标」。
 */
export function deleteEngagementWorkspace(store, id) {
  const target = typeof id === 'string' ? id.trim() : ''
  if (!target || target === '.' || target === '..' || /[\\/]/.test(target)) throw new Error(`invalid engagement id: ${id}`)
  const dir = store.dirOf(target)
  if (!existsSync(dir)) throw new Error(`engagement not found: ${target}`)
  const handle = store.handles.get(target)
  if (handle) { handle.close(); store.handles.delete(target) }
  rmSync(dir, { recursive: true, force: true })
  const pointer = store.currentPath()
  if (existsSync(pointer) && readFileSync(pointer, 'utf8').trim() === target) rmSync(pointer, { force: true })
  return { ok: true, deleted: target, current: store.activeEngagementId() || null }
}
