import { resolveEngagementConfig } from './engagement-config.js'

/** 只导出本次调用需要的变量；不泄漏宿主其它环境变量，也不更改全局环境。 */
export function runtimeConfig(root, engagement, options = {}) {
  const resolved = resolveEngagementConfig(root, engagement, options)
  const env = { FOFA_KEY: resolved.env.FOFA_KEY, REDTEAM_TARGET_URL: resolved.target_url,
    REDTEAM_VPS_LIST: JSON.stringify(resolved.effective.vps),
    REDTEAM_VPS_HOST: '', REDTEAM_VPS_PORT: '', REDTEAM_VPS_KEY: '', REDTEAM_VPS_USER: '' }
  let selected = null
  if (options.vps_id !== undefined || options.vps_index !== undefined) {
    if (options.vps_id !== undefined && options.vps_index !== undefined) throw new Error('invalid VPS selection: supply vps_id or vps_index')
    if (options.vps_id !== undefined) selected = resolved.effective.vps.find((row) => row.id === options.vps_id)
    else if (Number.isInteger(options.vps_index) && options.vps_index >= 0) selected = resolved.effective.vps[options.vps_index]
    if (!selected) throw new Error('invalid VPS selection: node not found')
  } else if (resolved.compatibility.vps_format === 'legacy') selected = resolved.effective.vps[0]
  if (selected) {
    const at = selected.host.indexOf('@')
    env.REDTEAM_VPS_HOST = at < 0 ? selected.host : selected.host.slice(at + 1)
    env.REDTEAM_VPS_USER = at < 0 ? (resolved.env.REDTEAM_VPS_USER || '') : selected.host.slice(0, at)
    env.REDTEAM_VPS_PORT = String(selected.port)
    env.REDTEAM_VPS_KEY = selected.key
  }
  return { ok: true, engagement, target_url: resolved.target_url, sources: resolved.sources,
    compatibility: { vps_format: resolved.compatibility.vps_format }, vps: resolved.effective.vps,
    selected_vps: selected, selection_required: resolved.effective.vps.length > 0 && !selected, env,
    consumption: '将 env 合并到本次子进程的环境（覆盖同名旧值），不要写 process.env；VPS 列表无默认节点，调用时传 vps_id 或从 0 起的 vps_index。此工具不执行命令，也不自动修改宿主终端环境。原生终端工具若不支持按次 env，应由其调用适配层处理；不要把 FOFA_KEY 拼进命令、日志或报告。' }
}

export function registerRuntimeConfigTool(ctx, store, defineTool, wrap, resolveEngagement) {
  ctx.tools.register(wrap(defineTool({
    name: 'redteam_runtime_config',
    description: '读取本会话靶标的实际 FOFA/目标网址/VPS 配置及来源，供支持单次 env 的进程调用方消费。返回含密钥，禁止回显到报告或命令字符串。不会执行命令或修改终端环境；多 VPS 在执行时显式选节点。',
    parameters: {
      engagement: { type: 'string', description: '可选显式靶标 id；默认使用本会话绑定，绝不按面板 current 切换' },
      vps_id: { type: 'string', description: '本次使用的 VPS id，与 vps_index 二选一' },
      vps_index: { type: 'integer', description: '本次使用的 VPS 在有效列表中的索引，从 0 开始' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args, exec) {
      const id = resolveEngagement(store, exec, args.engagement)
      return JSON.stringify(runtimeConfig(store.root, id, args), null, 2)
    },
  })))
}

export function redactPlatformResources(platform) {
  const vps = (rows) => rows.map(({ key, ...row }) => ({ ...row, key_configured: !!key }))
  return { ...platform,
    config: { ...platform.config,
      env: Object.fromEntries(Object.entries(platform.config.env).map(([key, value]) => [key, value ? '(configured)' : ''])),
      vps: vps(platform.config.vps) },
    effective: { fofa_key: platform.effective.fofa_key ? '(configured)' : '', vps: vps(platform.effective.vps) } }
}

export function resourceSummary(resolved) {
  return { engagement: resolved.engagement, target_url: resolved.target_url, sources: resolved.sources,
    fofa_configured: !!resolved.effective.fofa_key,
    vps: resolved.effective.vps.map(({ key, ...row }) => ({ ...row, key_configured: !!key })),
    compatibility: resolved.compatibility,
    consumption: '执行前调用 redteam_runtime_config，按会话取得结构化 env 并由支持 env 的调用方注入单次进程；多 VPS 通过 vps_id/vps_index 显式选择。不自动修改原生终端环境，不要将密钥写入命令或报告。' }
}
