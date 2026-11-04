import * as fs from 'node:fs'
import { join, basename } from 'node:path'

const JOURNAL = '.prompt-write.json'
let serial = 0

/** Same-directory rename keeps direct role-file readers away from truncated writes. */
function replace(path, text, io) {
  const tmp = path + '.tmp-' + process.pid + '-' + (++serial)
  try {
    io.writeFileSync(tmp, text, { encoding: 'utf8', mode: 0o600 })
    io.renameSync(tmp, path)
  } finally { io.rmSync(tmp, { force: true }) }
}

function restore(dir, before, io) {
  for (const [name, text] of Object.entries(before)) {
    if (basename(name) !== name || name === JOURNAL) throw new Error('提示词恢复清单包含非法文件名')
    const path = join(dir, name)
    if (text === null) io.rmSync(path, { force: true })
    else replace(path, text, io)
  }
}

/** Interrupted writes must recover before interpreting any fingerprints. */
export function recoverPromptFiles(dir, io = fs) {
  const journal = join(dir, JOURNAL)
  if (!io.existsSync(journal)) return
  const data = JSON.parse(io.readFileSync(journal, 'utf8'))
  if (!data || data.version !== 1 || !data.before || typeof data.before !== 'object') throw new Error('提示词恢复清单损坏')
  restore(dir, data.before, io)
  io.rmSync(journal)
}

/** Commit body files and their fingerprint manifest together, or restore the previous pair. */
export function commitPromptFiles(dir, changes, io = fs) {
  io.mkdirSync(dir, { recursive: true })
  recoverPromptFiles(dir, io)
  const before = {}
  for (const name of Object.keys(changes)) {
    if (basename(name) !== name || name === JOURNAL) throw new Error('提示词写入包含非法文件名')
    const path = join(dir, name)
    before[name] = io.existsSync(path) ? io.readFileSync(path, 'utf8') : null
  }
  const journal = join(dir, JOURNAL)
  replace(journal, JSON.stringify({ version: 1, before }), io)
  try {
    for (const [name, text] of Object.entries(changes)) replace(join(dir, name), text, io)
    io.rmSync(journal)
  } catch (error) {
    try {
      restore(dir, before, io)
      io.rmSync(journal)
    } catch (recoveryError) {
      throw new Error('提示词写入失败且回滚未完成；保留恢复清单 ' + journal + '：' + String(error) + '；' + String(recoveryError))
    }
    throw error
  }
}
