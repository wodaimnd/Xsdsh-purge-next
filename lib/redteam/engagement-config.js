import { existsSync, readFileSync, realpathSync, writeFileSync, renameSync, rmSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { isIP } from 'node:net'
import { readMeta, writeMeta, normalizeTargetUrl } from './engagement-metadata.js'

const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
export function configObject(value, label = 'config') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`invalid ${label}: expected object`)
  return value
}
function stringValue(value, label) {
  if (typeof value !== 'string' || /[\u0000-\u001f\u007f]/.test(value)) throw new Error(`invalid ${label}: expected single-line string`)
  return value.trim()
}
export function normalizeVps(value, options = {}) {
  const assignIds = options.assignIds === true
  if (!Array.isArray(value)) throw new Error('invalid vps: expected array')
  if (value.length > 100) throw new Error('invalid vps: maximum 100 rows')
  const ids = new Set()
  return value.flatMap((input) => {
    const row = configObject(input, 'vps row')
    const host = stringValue(row.host === undefined ? '' : row.host, 'vps.host')
    if (!host) return [] // 空白编辑行不参与继承，也不校验尚未填完的其它字段。
    const address = host.includes('@') ? host.slice(host.indexOf('@') + 1) : host
    const user = host.includes('@') ? host.slice(0, host.indexOf('@')) : ''
    const ip = address.replace(/^\[|\]$/g, '')
    if ((host.includes('@') && !/^[\w.-]+$/.test(user))
      || (!isIP(ip) && !/^(?=.{1,253}$)[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(address))) {
      throw new Error('invalid vps.host: hostname/IP or user@host required; put port in port field')
    }
    const rawPort = row.port === undefined || row.port === '' ? 22 : row.port
    if (!['string', 'number'].includes(typeof rawPort) || !/^\d+$/.test(String(rawPort))) throw new Error('invalid vps.port')
    const port = Number(rawPort)
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('invalid vps.port: expected 1..65535')
    const result = { name: stringValue(row.name === undefined ? '' : row.name, 'vps.name'), host, port,
      key: stringValue(row.key === undefined ? '' : row.key, 'vps.key') }
    if (result.key && !isAbsolute(result.key)) throw new Error('invalid vps.key: absolute private-key path required')
    if (row.id !== undefined && row.id !== '') {
      const id = stringValue(row.id, 'vps.id')
      if (!/^[\w.-]+$/.test(id) || ids.has(id)) throw new Error('invalid vps.id: unique identifier required')
      ids.add(id)
      result.id = id
    } else if (assignIds) {
      /* 保存时补 id：vps_id 选择依赖稳定标识，读取路径不生成，避免每次读取都换 id。 */
      let id = randomUUID()
      while (ids.has(id)) id = randomUUID()
      ids.add(id)
      result.id = id
    }
    return [result]
  })
}

export function loadVpsField(raw, options = {}) {
  try { return { vps: normalizeVps(raw.vps === undefined ? [] : raw.vps, options) } }
  catch (error) { return { vps: [], vps_error: error.message, vps_invalid: raw.vps } }
}

export function assertPlatformConfigWritable(previous, patch) {
  configObject(patch)
  if (previous.error) throw new Error('invalid existing config; repair file before saving: ' + previous.error)
  if (previous.vps_error && !own(patch, 'vps')) throw new Error('invalid existing vps; supply corrected vps before saving: ' + previous.vps_error)
}

export function validateResourceEnv(env) {
  configObject(env, 'env')
  for (const name of ['FOFA_KEY', 'REDTEAM_VPS_HOST', 'REDTEAM_VPS_KEY', 'REDTEAM_VPS_PORT', 'REDTEAM_VPS_USER']) {
    if (own(env, name)) stringValue(env[name], name)
  }
  legacyVps(env)
  return env
}

function readConfig(file) {
  if (!existsSync(file)) return {}
  return configObject(JSON.parse(readFileSync(file, 'utf8')))
}
function engagementDir(root, id) {
  if (typeof id !== 'string' || !id || id === '.' || id === '..' || /[/\\:\u0000-\u001f]/.test(id)) throw new Error('invalid engagement: explicit id required')
  const base = resolve(root, 'engagements')
  const dir = join(base, id)
  if (!existsSync(join(dir, 'engagement.yaml'))) throw new Error('engagement not found: ' + id)
  const rel = relative(realpathSync(base), realpathSync(dir))
  if (rel.startsWith('..') || resolve(base, rel) !== realpathSync(dir)) throw new Error('invalid engagement path')
  return dir
}
function targetConfig(raw, options = {}) {
  return { fofa_key: stringValue(raw.fofa_key === undefined ? '' : raw.fofa_key, 'fofa_key'),
    vps: normalizeVps(raw.vps === undefined ? [] : raw.vps, options), updated_at: raw.updated_at || null }
}
/** 读取用：VPS 损坏时保留错误字段，交给 UI 走「确认替换」修复；写入仍走严格 targetConfig。 */
function targetConfigField(raw) {
  return { fofa_key: stringValue(raw.fofa_key === undefined ? '' : raw.fofa_key, 'fofa_key'),
    ...loadVpsField(raw), updated_at: raw.updated_at || null }
}
function dotenvAt(root) {
  const path = join(dirname(root), '.env')
  const env = {}
  if (existsSync(path)) {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line)
      if (!match) continue
      const raw = match[2].trim()
      const quoted = /^(["'])(.*)\1\s*(?:#.*)?$/.exec(raw)
      const value = (quoted ? quoted[2] : raw.replace(/\s+#.*$/, '')).trim()
      if (value) env[match[1]] = value
    }
  }
  return { path, env }
}
function legacyVps(env) {
  if (!env.REDTEAM_VPS_HOST) return []
  return normalizeVps([{ name: '', host: env.REDTEAM_VPS_HOST, port: env.REDTEAM_VPS_PORT || 22, key: env.REDTEAM_VPS_KEY || '' }])
}

/** 请求局部环境：目标 > 全局；旧进程/.env 作为兼容来源单列，绝不写 process.env。 */
export function resolveEngagementConfig(root, engagement = null, options = {}) {
  if (!root) throw new Error('redteam store root required')
  const global = options.config || readConfig(join(root, 'config.json'))
  const globalEnv = global.env || {}
  const processEnv = options.env || process.env
  const dotenv = dotenvAt(root)
  const dir = engagement ? engagementDir(root, engagement) : null
  const config = dir ? targetConfigField(readConfig(join(dir, 'config.json'))) : targetConfig({})
  const target_url = dir ? (readMeta(join(dir, 'engagement.yaml'))?.target_url || '') : ''
  const env = { ...processEnv, DSH_HOME: dirname(root) }
  const envSources = {}
  // 其它旧变量沿用 process → config → .env 的已有顺序。
  for (const [source, values] of [['process', processEnv], ['global', globalEnv], ['dotenv', dotenv.env]]) {
    for (const [key, value] of Object.entries(values)) {
      if (typeof value !== 'string' || !value.trim()) continue
      if (!envSources[key]) { env[key] = value.trim(); envSources[key] = source }
    }
  }
  const fofaOptions = [['target', config.fofa_key], ['global', globalEnv.FOFA_KEY], ['process', processEnv.FOFA_KEY], ['dotenv', dotenv.env.FOFA_KEY]]
  const fofa = fofaOptions.find(([, value]) => typeof value === 'string' && value.trim()) || ['none', '']
  const globalVpsField = global.vps_error ? global : loadVpsField(global)
  const globalVps = globalVpsField.vps
  let vps = config.vps.length ? config.vps : globalVps
  let vpsSource = config.vps.length ? 'target' : globalVps.length ? 'global' : 'none'
  let vpsFormat = vps.length ? 'list' : null
  if (!vps.length) {
    // HOST/KEY 可来自旧混合环境，保持原优先级；来源按实际 HOST 标明。
    vps = legacyVps(env)
    if (vps.length) {
      vpsSource = envSources.REDTEAM_VPS_HOST; vpsFormat = 'legacy'
      if (!vps[0].key) vps[0].key = join(global.toolkitDir || join(root, 'toolkit'), 'vps', 'id_rsa')
    }
  }
  env.DSH_HOME = dirname(root)
  env.FOFA_KEY = fofa[1].trim()
  env.REDTEAM_TARGET_URL = target_url
  env.REDTEAM_VPS_LIST = JSON.stringify(vps)
  // 列表本身不是默认节点；旧单 HOST 环境仍保持兼容。
  if (vpsFormat !== 'legacy') {
    delete env.REDTEAM_VPS_HOST
    delete env.REDTEAM_VPS_KEY
    delete env.REDTEAM_VPS_PORT
    delete env.REDTEAM_VPS_USER
  }
  const vpsError = config.vps_error || globalVpsField.vps_error || null
  const vpsErrorScope = config.vps_error ? 'target' : globalVpsField.vps_error ? 'global' : null
  return { ok: true, engagement, target_url, config,
    effective: { fofa_key: env.FOFA_KEY, vps }, sources: { fofa_key: fofa[0], vps: vpsSource },
    compatibility: { vps_format: vpsFormat, vps_error: vpsError, vps_error_scope: vpsErrorScope, env_sources: envSources, env_file: { path: dotenv.path, exists: existsSync(dotenv.path), keys: Object.keys(dotenv.env) } }, env }
}

export function engagementConfigView(root, engagement, options) {
  const { env, ...view } = resolveEngagementConfig(root, engagement, options)
  return view
}
export function saveEngagementConfig(root, engagement, patch, io = { writeFileSync, renameSync, rmSync, writeMeta }) {
  configObject(patch)
  const dir = engagementDir(root, engagement)
  const file = join(dir, 'config.json')
  const previous = readConfig(file)
  const next = targetConfig({ ...previous, ...patch }, { assignIds: true })
  const url = own(patch, 'target_url') ? normalizeTargetUrl(patch.target_url) : undefined
  next.updated_at = new Date().toISOString()
  const metaFile = join(dir, 'engagement.yaml')
  const suffix = '.tmp-' + randomUUID()
  const staged = [file + suffix, ...(url === undefined ? [] : [metaFile + suffix])]
  let configSaved = false
  let metadataSaved = false
  let failure
  const cleanupErrors = []
  try {
    io.writeFileSync(staged[0], JSON.stringify(next, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 })
    if (url !== undefined) io.writeMeta(staged[1], { ...readMeta(metaFile), target_url: url, updated_at: next.updated_at })
    io.renameSync(staged[0], file)
    configSaved = true
    if (url !== undefined) { io.renameSync(staged[1], metaFile); metadataSaved = true }
  } catch (error) { failure = error }
  finally {
    for (const path of staged) {
      try { io.rmSync(path, { force: true }) } catch (error) { cleanupErrors.push({ path, error: error.message }) }
    }
  }
  // 两个文件不能跨平台事务提交；明确报告提交到哪一步，禁止把部分保存伪装成普通失败。
  if (failure) return { ok: false, error: failure.message, error_kind: configSaved ? 'partial_save' : 'save_failed',
    partial_save: configSaved, saved: { config: configSaved, metadata: metadataSaved }, cleanup_errors: cleanupErrors,
    recovery: configSaved ? 'config.json 已保存，网址 metadata 未保存；重新读取后重试保存。' : '原配置与网址均未替换，可修复错误后重试。' }
  const view = engagementConfigView(root, engagement)
  return cleanupErrors.length ? { ...view, cleanup_errors: cleanupErrors } : view
}
export function dispatchEngagementConfig(store, request) {
  return request.op === 'engagementConfigSave'
    ? saveEngagementConfig(store.root, request.engagement, request.config)
    : engagementConfigView(store.root, request.engagement || (() => { throw new Error('engagement required') })())
}

/** 多节点逐一检查，避免为了 availability 随意选一个默认 VPS。 */
export function resourceCheckEnvs(resolved) {
  const rows = resolved.effective.vps
  return rows.length ? rows.map((row) => ({ ...resolved.env, REDTEAM_VPS_HOST: row.host,
    REDTEAM_VPS_PORT: String(row.port), REDTEAM_VPS_KEY: row.key })) : [resolved.env]
}
export function checkSkillWithResources(check, skill, options, resolved) {
  const checks = resourceCheckEnvs(resolved).map((env) => check(skill, { ...options, env }))
  const best = checks.reduce((a, b) => (b.problems?.length || 0) < (a.problems?.length || 0) ? b : a)
  return { ...best, resource_sources: resolved.sources,
    vps_checks: resolved.effective.vps.map((row, i) => ({ index: i, id: row.id, name: row.name, host: row.host, status: checks[i].status, problems: checks[i].problems })) }
}
