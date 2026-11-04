import { readFileSync } from 'node:fs'

const src = readFileSync('client.js', 'utf8')
const keys = [
  'look.glass', 'look.glass.desc', 'look.wall', 'look.wall.none', 'look.wall.tune',
  'look.wall.opacity', 'look.wall.blur', 'look.wall.glassBlur', 'look.wall.scrim', 'look.wall.glass',
  'look.wall.local.use', 'look.wall.local.clear', 'look.wall.local.saved', 'look.wall.local.empty',
  'action.apply', 'action.revert', 'action.uninstall',
  'dock.redteam', 'dock.full', 'dock.close', 'dock.unauthorized',
  'restart.confirm', 'restart.ask.title', 'restart.now', 'restart.notNow',
  'ok.done', 'rules.title', 'rules.empty', 'rewrite.empty', 'rewrite.failed',
]

for (const k of keys) {
  const re = new RegExp('"' + k.replace(/[.]/g, '\\.') + '"\\s*:\\s*"([^"]*)"')
  const m = src.match(re)
  if (m) console.log(k.padEnd(26), '→', m[1])
}
