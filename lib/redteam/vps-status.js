import { existsSync } from 'node:fs'

/**
 * VPS 就绪状态的唯一判定口径（preflight 用）：
 * - 有 host 就算已配置；私钥文件是否存在单独作为非阻塞提示；
 * - list 模式（多 VPS）看列表里有没有任一存在的私钥；legacy 模式看单机默认/配置路径；
 * - 一个节点都没有时才判成“缺 VPS”。
 */
export function vpsStatus(resources, env, toolkit, platform) {
  const vpsKey = env.REDTEAM_VPS_KEY || (toolkit + (platform.runtime.windows ? '\\vps\\id_rsa' : '/vps/id_rsa'))
  const vpsHost = env.REDTEAM_VPS_HOST || ''
  const rows = resources.effective.vps || []
  const vpsCount = rows.length
  const vpsMode = vpsCount > 0 ? 'list' : vpsHost !== '' ? 'legacy' : 'none'
  const vpsConfigured = vpsMode !== 'none'
  const vpsKeyReady = vpsMode === 'list'
    ? rows.some((row) => !!row.key && existsSync(row.key))
    : vpsMode === 'legacy' ? existsSync(vpsKey) : false
  const warnings = []
  if (vpsConfigured && !vpsKeyReady) {
    warnings.push(vpsMode === 'list'
      ? 'VPS 已配置，但列表里没有找到存在的私钥文件；执行前请补齐私钥路径（「密钥与 VPS」），否则 SSH 会失败。'
      : 'VPS 已配置，但私钥文件不存在：' + vpsKey + '（「密钥与 VPS」）。')
  }
  const missingVps = vpsConfigured ? '' : platform.runtime.windows
    ? 'VPS 登录方式（在「密钥与 VPS」添加主机 user@host、端口与私钥路径；可以配多台，执行时选节点）'
    : 'VPS 登录方式——在「密钥与 VPS」添加主机 user@host、端口与私钥路径（步骤见技能 redteam-setup）'
  return {
    vpsKey, vpsHost, vpsMode, vpsCount, vpsKeyReady, vpsConfigured, warnings, missingVps,
    /* preflight 的 onboarding.configured 直接展开这一段，避免两处各写一遍状态字段。 */
    configured: {
      vps_mode: vpsMode,
      vps_count: vpsCount,
      vps_key: vpsKeyReady ? 'configured (see resources.vps)' : vpsConfigured ? 'host configured, key missing' : 'missing',
      vps_key_ready: vpsKeyReady,
      vps_host: vpsHost,
    },
  }
}
