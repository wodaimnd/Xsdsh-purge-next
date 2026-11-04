/**
 * 模式提示词（preset persona）自定义。
 *
 * 设计要点：
 *
 *  · **默认提示词就是 `presets/<id>/agent.cordis.yml` 里那段 `prefix: |`**，
 *    不另存副本 —— 包升级后默认值跟着升级，不会变成「默认值冻结在 4.5.17」。
 *
 *  · **用户改过的存一份覆盖**，落在 `$DSH_HOME/.agent-presets/<id>/persona-override.md`。
 *    不进 `agent.cordis.yml` 本体：那边每次启动都会被 `installPreset` 自愈/刷新，
 *    写进去会被覆盖掉。单独一个文件，职责清楚，也不会被自愈逻辑碰到。
 *
 *  · **生效方式是启动时把覆盖内容拼回 `agent.cordis.yml` 的 persona 块**。
 *    dsh 只认 agent.cordis.yml，所以必须在启动前把它合成好。
 *    撤销覆盖时要能从覆盖状态还原回默认（所以 `writeOverride` 前会先备份默认块）。
 *
 *  · 保存后**下次重启生效**（用户明确要求这一条）。dsh 的 persona 是启动时
 *    从 preset 读进系统提示词的，热改不会重载，所以 UI 要如实告诉用户「重启后生效」。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { failResult } from './result.js'

/** 支持自定义提示词的模式。顺序就是界面里的显示顺序。 */
export const PROMPT_PRESET_IDS = ['redteam', 'reverse']

export const PROMPT_PRESET_LABELS = {
  redteam: '红队模式',
  reverse: '逆向模式',
}

/** 覆盖文件名。放 preset 目录里，和 agent.cordis.yml 同级。 */
const OVERRIDE_NAME = 'persona-override.md'
/** 写覆盖前的默认块快照，用于「恢复默认」。 */
const BASELINE_NAME = 'persona-baseline.md'

function presetDir(dshHome, id) {
  return join(dshHome, '.agent-presets', id)
}

function overridePath(dshHome, id) {
  return join(presetDir(dshHome, id), OVERRIDE_NAME)
}

function baselinePath(dshHome, id) {
  return join(presetDir(dshHome, id), BASELINE_NAME)
}

function presetFile(dshHome, id) {
  return join(presetDir(dshHome, id), 'agent.cordis.yml')
}

/**
 * 从 agent.cordis.yml 里抠出 persona 的 prefix 块。
 *
 * 只认 `- id: persona` 那一段里的 `prefix: |`，因为同一份 yml 里可能有别的
 * 块标量（suffix、instructions），按第一个 `|` 找会抓错。
 *
 * @returns `{ ok: true, text, indent }` 或 `{ ok: false, error }`
 */
export function readPersonaPrefix(ymlText) {
  const src = String(ymlText || '')
  const lines = src.split(/\r?\n/)

  // 1) 定位 persona 段
  let personaAt = -1
  for (let i = 0; i < lines.length; i += 1) {
    if (/^\s*-\s*id:\s*persona\s*$/.test(lines[i])) { personaAt = i; break }
  }
  if (personaAt === -1) return failResult('no-persona')

  // 2) persona 段内找 prefix: |
  let start = -1
  let indent = ''
  for (let i = personaAt + 1; i < lines.length; i += 1) {
    const line = lines[i]
    // 段落结束：下一个同级或更浅的 `- id:` / 顶层键
    if (/^\s*-\s*id:/.test(line) || /^[A-Za-z_#]/.test(line)) break
    const m = line.match(/^(\s*)(prefix|suffix|text):\s*[|>]\s*$/)
    if (m && m[2] === 'prefix') {
      start = i
      indent = m[1] + '  '
      break
    }
  }
  if (start === -1) return failResult('no-prefix')

  /* 3) 块标量：缩进 >= baseIndent 的非空行是内容；空行也归块内。
     坑：不能遇到空行就 break —— yml 里块和下一个键之间常有空行，
     那样会把 suffix: 一起吞进来。反过来也不能无条件 continue 到底：
     自定义文本若不以空行结尾，会把后面所有内容当成块内容写回去。
     正确做法：记录「最后一个非空内容行」的位置，块正文到那里为止，
     其后的空行属于结构，原样留给后面。 */
  const baseIndent = indent.length
  const body = []
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i]
    if (line.trim() === '') { body.push(''); continue }
    const lead = line.length - line.trimStart().length
    if (lead < baseIndent) break
    body.push(line.slice(baseIndent))
  }
  /* 尾部空行保留在 text 里（它们是 yml 结构，写回时要靠它们定位），
     但对外比较/展示时用 stripTrailingBlank 抹平。见 readPrompt。 */
  return { ok: true, text: body.join('\n'), indent: ' '.repeat(baseIndent) }
}

/**
 * 把 `text` 写回 agent.cordis.yml 的 persona prefix 块，其余字节不动。
 *
 * @returns `{ ok: true, text, changed }` 或 `{ ok: false, error }`
 */
export function writePersonaPrefix(ymlText, personaText) {
  const src = String(ymlText || '')
  const eol = src.includes('\r\n') ? '\r\n' : '\n'
  const lines = src.split(/\r?\n/)

  let personaAt = -1
  for (let i = 0; i < lines.length; i += 1) {
    if (/^\s*-\s*id:\s*persona\s*$/.test(lines[i])) { personaAt = i; break }
  }
  if (personaAt === -1) return failResult('no-persona')

  let start = -1
  let indentLen = 0
  for (let i = personaAt + 1; i < lines.length; i += 1) {
    const line = lines[i]
    if (/^\s*-\s*id:/.test(line) || /^[A-Za-z_#]/.test(line)) break
    const m = line.match(/^(\s*)(prefix|suffix|text):\s*[|>]\s*$/)
    if (m && m[2] === 'prefix') { start = i; indentLen = m[1].length + 2; break }
  }
  if (start === -1) return failResult('no-prefix')

  /* 找块结束：空行跳过，第一个缩进不足的非空行（structAt）是块之后的结构起点。
     块区间 = [start+1, structAt)，含块内所有行（含块内空行）。
     替换时 **block 不带尾部空行**，块尾的空行由原文件的 [.. structAt) 保住 ——
     这样纯往返字节不变，写短文本也不会吃掉结构空行。 */
  let structAt = lines.length
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i]
    if (line.trim() === '') continue
    const lead = line.length - line.trimStart().length
    if (lead < indentLen) { structAt = i; break }
  }

  const pad = ' '.repeat(indentLen)
  const bodyLines = String(personaText || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
  // 尾部空行不进块（由结构空行代表），否则会重复
  while (bodyLines.length > 1 && bodyLines[bodyLines.length - 1] === '') bodyLines.pop()
  const block = bodyLines.map((l) => (l === '' ? '' : pad + l))

  // 原块已有的尾部空行（属于结构，原样保留）
  let keepFrom = structAt
  while (keepFrom > start + 1 && lines[keepFrom - 1].trim() === '') keepFrom -= 1

  const next = lines.slice(0, start + 1).concat(block, lines.slice(keepFrom))
  const out = next.join(eol)
  return { ok: true, text: out, changed: out !== src }
}

/** 现在是否用了自定义提示词。 */
export function hasOverride(dshHome, id) {
  return existsSync(overridePath(dshHome, id))
}

/**
 * 读某个模式的提示词现状。
 * @returns `{ ok, id, label, isCustom, custom, builtin, savedAt, error? }`
 */
export function readPrompt(dshHome, id) {
  if (!PROMPT_PRESET_IDS.includes(id)) return failResult('unsupported-mode', '未知或已移除的模式：' + id)
  const label = PROMPT_PRESET_LABELS[id] || id
  const file = presetFile(dshHome, id)
  if (!existsSync(file)) {
    return failResult('preset-missing', undefined, { id, label, isCustom: false, custom: '', builtin: '' })
  }
  let yml = ''
  try {
    yml = readFileSync(file, 'utf8')
  } catch (error) {
    return failResult('read-failed', error instanceof Error ? error.message : String(error), {
      id, label, isCustom: false, custom: '', builtin: '',
    })
  }
  const parsed = readPersonaPrefix(yml)
  if (!parsed.ok) {
    return failResult(parsed.error, undefined, { id, label, isCustom: false, custom: '', builtin: '' })
  }
  const ov = overridePath(dshHome, id)
  const base = baselinePath(dshHome, id)
  const custom = hasOverride(dshHome, id)

  /* 默认值必须来自「覆盖之外」——
     yml 里那份在有覆盖时已经**是**自定义内容了，拿它当 builtin 会让
     「恢复默认」变成「恢复自定义」。优先取基线（首次保存前存下的那份），
     没有基线再退回 yml 当前块（此时还没被覆盖过，等同默认）。 */
  let builtin = ''
  if (existsSync(base)) builtin = safeRead(base)
  if (!builtin) builtin = parsed.text

  return {
    ok: true,
    id,
    label,
    isCustom: custom,
    // 当前生效的那份：有覆盖就是覆盖（启动时已拼回 yml）
    custom: custom ? safeRead(ov) : '',
    builtin: stripTrailingBlank(builtin),
    savedAt: custom ? ymlStatSafe(ov) : '',
    current: stripTrailingBlank(parsed.text),
  }
}

function safeRead(p) {
  try { return readFileSync(p, 'utf8') } catch { return '' }
}

/**
 * 去掉尾部空行。
 *
 * yml 的 `|` 块标量会把块尾的结构空行也当成内容的一部分带回来，
 * 于是「存进去的」和「读回来的」会差一个尾换行。对用户来说这是噪声，
 * 统一在边界上抹掉，比较与展示都用同一个口径。
 */
function stripTrailingBlank(text) {
  return String(text || '').replace(/[\r\n]+$/, '')
}

function ymlStatSafe(p) {
  try {
    return new Date(statSync(p).mtimeMs).toISOString()
  } catch {
    return ''
  }
}

/**
 * 保存自定义提示词。
 *
 * 落盘顺序：先备份默认块 → 写 override → 把 override 拼进 agent.cordis.yml。
 * 任何一步失败都不会留下「override 在但 yml 没更新」的半成品。
 *
 * @returns `{ ok, ok: boolean, restartRequired: true }`
 */
export function writePrompt(dshHome, id, text) {
  if (!PROMPT_PRESET_IDS.includes(id)) return failResult('unsupported-mode', '未知或已移除的模式：' + id)
  const file = presetFile(dshHome, id)
  if (!existsSync(file)) return { ok: false, error: '预设不存在：' + file }
  const body = String(text == null ? '' : text)
  if (!body.trim()) return { ok: false, error: '提示词不能为空（要恢复默认请用「恢复默认提示词」）' }

  const dir = presetDir(dshHome, id)
  try { mkdirSync(dir, { recursive: true }) } catch { /* 已存在 */ }

  let yml = ''
  try { yml = readFileSync(file, 'utf8') } catch (error) {
    return { ok: false, error: '读预设失败：' + (error instanceof Error ? error.message : String(error)) }
  }
  const parsed = readPersonaPrefix(yml)
  if (!parsed.ok) return failResult('no-persona-block', '这个预设里找不到可改的提示词块（' + parsed.error + '）')

  // 首次保存：把当前（默认）块存成基线，供「恢复默认」用
  const base = baselinePath(dshHome, id)
  if (!existsSync(base)) {
    try { writeFileSync(base, parsed.text, 'utf8') } catch { /* 备份失败不阻断保存 */ }
  }

  const ov = overridePath(dshHome, id)
  const tmp = ov + '.tmp'
  try {
    writeFileSync(tmp, body, 'utf8')
    renameSync(tmp, ov)
  } catch (error) {
    try { rmSync(tmp, { force: true }) } catch { /* ignore */ }
    return { ok: false, error: '写覆盖失败：' + (error instanceof Error ? error.message : String(error)) }
  }

  const merged = writePersonaPrefix(yml, body)
  if (!merged.ok) return failResult('rebuild-failed', '拼回预设失败：' + merged.error)
  if (merged.changed) {
    const bak = file + '.bak-persona'
    try { writeFileSync(bak, yml, 'utf8') } catch { /* 备份失败仍继续，至少文件内容是对的 */ }
    try { writeFileSync(file, merged.text, 'utf8') } catch (error) {
      return { ok: false, error: '写预设失败：' + (error instanceof Error ? error.message : String(error)) }
    }
  }
  return { ok: true, isCustom: true, restartRequired: true }
}

/**
 * 恢复默认提示词：删覆盖，把基线（或包内模板）拼回去。
 * @returns `{ ok, restartRequired: true }`
 */
export function resetPrompt(dshHome, id) {
  if (!PROMPT_PRESET_IDS.includes(id)) return failResult('unsupported-mode', '未知或已移除的模式：' + id)
  const file = presetFile(dshHome, id)
  if (!existsSync(file)) return { ok: false, error: '预设不存在：' + file }

  let yml = ''
  try { yml = readFileSync(file, 'utf8') } catch (error) {
    return { ok: false, error: '读预设失败：' + (error instanceof Error ? error.message : String(error)) }
  }

  // 默认值优先用基线（用户第一次保存前的那份），没有再退回当前块
  let builtin = ''
  const base = baselinePath(dshHome, id)
  if (existsSync(base)) builtin = safeRead(base)
  if (!builtin) {
    const parsed = readPersonaPrefix(yml)
    if (!parsed.ok) return failResult('no-persona-block', '找不到提示词块（' + parsed.error + '）')
    builtin = parsed.text
  }

  const merged = writePersonaPrefix(yml, builtin)
  if (!merged.ok) return failResult('rebuild-failed', '拼回默认失败：' + merged.error)
  if (merged.changed) {
    try { writeFileSync(file + '.bak-persona', yml, 'utf8') } catch { /* ignore */ }
    try { writeFileSync(file, merged.text, 'utf8') } catch (error) {
      return { ok: false, error: '写预设失败：' + (error instanceof Error ? error.message : String(error)) }
    }
  }
  try { rmSync(overridePath(dshHome, id), { force: true }) } catch { /* ignore */ }
  return { ok: true, isCustom: false, restartRequired: true }
}

/** 只列出当前支持的模式；已移除模式的用户文件原样保留。 */
export function readAllPrompts(dshHome) {
  const out = []
  for (const id of PROMPT_PRESET_IDS) out.push(readPrompt(dshHome, id))
  return out
}
