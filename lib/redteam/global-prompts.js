import { createHash } from 'node:crypto'
import { existsSync, readFileSync, mkdirSync, writeFileSync, renameSync, rmSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'
import { commitPromptFiles, recoverPromptFiles } from './prompt-files.js'

export const CUSTOM_PROMPT = 'target-custom'
export const GLOBAL_PROMPT_OPS = new Set(['globalPrompts', 'globalPromptSave', 'globalPromptsReset'])
export const promptFingerprint = (text) => createHash('sha1').update(String(text ?? '').trim()).digest('hex').slice(0, 12)
const configPath = (root) => join(root, 'global-prompts.json')

export function readGlobalPrompts(root) {
  const path = configPath(root)
  if (!existsSync(path)) return {}
  const value = JSON.parse(readFileSync(path, 'utf8'))
  if (!value || value.version !== 1 || !value.roles || typeof value.roles !== 'object' || Array.isArray(value.roles)) throw new Error('全局提示词文件格式无效')
  for (const entry of Object.values(value.roles)) {
    if (!entry || typeof entry.content !== 'string') throw new Error('全局提示词正文格式无效')
  }
  return value.roles
}

function writeGlobalPrompts(root, roles) {
  mkdirSync(root, { recursive: true })
  const path = configPath(root)
  const tmp = path + '.tmp-' + process.pid
  try {
    writeFileSync(tmp, JSON.stringify({ version: 1, roles }, null, 2), { encoding: 'utf8', mode: 0o600 })
    renameSync(tmp, path)
  } finally { rmSync(tmp, { force: true }) }
}

export function effectiveDefault(root, role, defaults) {
  const global = readGlobalPrompts(root)
  return global[role]?.content ?? defaults[role] ?? ''
}

export function isInheritedPrompt(content, marker, builtin, legacyHashes = []) {
  if (marker === CUSTOM_PROMPT) return false
  const hash = promptFingerprint(content)
  return marker === hash || hash === promptFingerprint(builtin) || legacyHashes.includes(hash)
}

/** Materialize inherited templates for existing file readers; unknown edits are never overwritten. */
export function refreshInheritedPrompts(store, id, defaults, titles, legacyHashes, options = {}) {
  const global = readGlobalPrompts(store.root)
  recoverPromptFiles(store.promptsDirOf(id))
  const manifest = store.readPromptManifest(id)
  const dir = store.promptsDirOf(id)
  let changed = 0, created = 0
  const kept = []
  const changes = {}
  mkdirSync(dir, { recursive: true })
  for (const role of Object.keys(titles)) {
    const next = global[role]?.content ?? defaults[role] ?? ''
    const path = join(dir, role + '.md')
    if (!existsSync(path)) {
      changes[role + '.md'] = next; manifest[role] = promptFingerprint(next); created++
      continue
    }
    const current = readFileSync(path, 'utf8')
    if (!options.force && !isInheritedPrompt(current, manifest[role], defaults[role], legacyHashes[role])) {
      kept.push(role)
      continue
    }
    if (current !== next) {
      copyFileSync(path, path + '.bak-' + Date.now())
      changes[role + '.md'] = next; changed++
    }
    manifest[role] = promptFingerprint(next)
  }
  // A failed manifest write must surface, otherwise inherited copies can be misclassified as custom.
  changes['.defaults.json'] = JSON.stringify(manifest, null, 2)
  commitPromptFiles(dir, changes, options.io)
  return { changed, created, kept }
}

export function globalPromptView(root, defaults, titles, planner) {
  const global = readGlobalPrompts(root)
  return { ok: true, scope: 'global', roles: Object.entries(titles).map(([role, title]) => ({
    role, title, planner: role === planner, dispatcher: role !== planner,
    content: global[role]?.content ?? defaults[role] ?? '',
    source: global[role] ? 'global' : 'builtin', updated_at: global[role]?.updated_at ?? null,
  })) }
}

/** 目标文件的来源：命中全局模板 → global；等于内置默认 → builtin；其余 → target。 */
export function promptSourceOf(global, role, content, builtin) {
  const globalContent = global[role]?.content
  if (globalContent !== undefined && content === globalContent) return 'global'
  return content === (builtin || '') ? 'builtin' : 'target'
}

export function saveTargetPrompt(store, id, role, content, titles, options = {}) {
  if (!Object.hasOwn(titles, role)) throw new Error('unknown role: ' + role)
  const dir = store.promptsDirOf(id)
  recoverPromptFiles(dir, options.io)
  const text = String(content ?? '')
  const manifest = store.readPromptManifest(id)
  manifest[role] = CUSTOM_PROMPT
  commitPromptFiles(dir, { [role + '.md']: text, '.defaults.json': JSON.stringify(manifest, null, 2) }, options.io)
  return { role, bytes: Buffer.byteLength(text), source: 'target' }
}

export function resetTargetPrompts(store, id, role, defaults, titles, options = {}) {
  if (role != null && !Object.hasOwn(titles, role)) throw new Error('unknown role: ' + role)
  const selected = role == null ? Object.keys(titles) : [role]
  const global = readGlobalPrompts(store.root)
  const dir = store.promptsDirOf(id)
  recoverPromptFiles(dir, options.io)
  const manifest = store.readPromptManifest(id)
  const changes = {}
  for (const key of selected) {
    const content = global[key]?.content ?? defaults[key] ?? ''
    const path = join(dir, key + '.md')
    /* 恢复默认会丢掉用户当前内容，先留一份同目录备份，误点还能捞回来。 */
    if (existsSync(path)) {
      const current = readFileSync(path, 'utf8')
      if (current !== content) copyFileSync(path, path + '.bak-' + Date.now())
    }
    changes[key + '.md'] = content
    manifest[key] = promptFingerprint(content)
  }
  changes['.defaults.json'] = JSON.stringify(manifest, null, 2)
  commitPromptFiles(dir, changes, options.io)
  return { reset: selected, inherited: true }
}

/** Explicit global API: engagement/current pointers are deliberately not consulted. */
export function dispatchGlobalPrompts(store, req, defaults, titles, planner) {
  if (!GLOBAL_PROMPT_OPS.has(req.op)) return undefined
  if (req.op === 'globalPrompts') return globalPromptView(store.root, defaults, titles, planner)
  const role = req.role
  if (role !== undefined && !Object.hasOwn(titles, role)) throw new Error('unknown role: ' + role)
  const roles = readGlobalPrompts(store.root)
  if (req.op === 'globalPromptSave') {
    if (!Object.hasOwn(titles, role)) throw new Error('role required')
    if (typeof req.content !== 'string' || !req.content.trim()) throw new Error('提示词不能为空')
    roles[role] = { content: req.content, updated_at: new Date().toISOString() }
  } else if (role !== undefined) delete roles[role]
  else for (const key of Object.keys(roles)) delete roles[key]
  writeGlobalPrompts(store.root, roles)
  // Native role-section readers consume files, so update all known inherited copies now.
  const failures = []
  for (const engagement of store.listEngagements()) {
    try { store.refreshDefaultPrompts(engagement.id) }
    catch (error) { failures.push({ engagement: engagement.id, path: store.promptsDirOf(engagement.id), error: String(error.message || error) }) }
  }
  if (failures.length) return { ok: false, saved: true, error: '全局模板已保存，部分靶标同步失败，请重试保存', failures }
  return globalPromptView(store.root, defaults, titles, planner)
}
