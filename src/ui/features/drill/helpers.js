// Migrated from lib/redteam/client.js; API payloads and page behavior retained.


const fmt = (s) => (s ? String(s).replace('T', ' ').slice(0, 16) : '—')

const fmtShort = (s) => {
  const t = String(s || '').replace('T', ' ')
  return t.length >= 16 ? t.slice(5, 16) : (t || '—')
}

const provLabel = (p) => (p === 'passive' ? '被动' : p === 'active' ? '主动' : '未知')

const clickable = (onActivate, options = {}) => {
  const props = {
    role: 'button',
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e) => {
      /* Enter 与 Space 是按钮的标准激活键；Space 还要阻止页面滚动 */
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onActivate(e)
      }
    },
  }
  if (options.label !== undefined) props['aria-label'] = String(options.label)
  if (options.expanded !== undefined) props['aria-expanded'] = options.expanded ? 'true' : 'false'
  return props
}

const copyText = async (text) => {
  const value = text === undefined || text === null ? '' : String(text)
  if (value === '') return false
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch (e) { console.debug('[drill] 剪贴板不可用，尝试本地复制', e) }
  /* 兜底：临时 textarea + execCommand —— 非安全上下文里唯一还能用的办法 */
  try {
    const ta = document.createElement('textarea')
    ta.value = value
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const okFlag = document.execCommand('copy')
    document.body.removeChild(ta)
    return okFlag === true
  } catch (e) { return false }
}

const copyWithFeedback = async (text, label, onResult) => {
  const okFlag = await copyText(text)
  const message = okFlag ? '已复制：' + label : '复制失败（浏览器未授权剪贴板）—— 请手动选中文本复制'
  if (typeof onResult === 'function') onResult(okFlag, message)
  return okFlag
}

function targetKeyOf(v) {
  const t = String(v.target || '').trim()
  if (t !== '') {
    const url = /^([a-z][a-z0-9+.-]*:\/\/[^/?#\s]+)/i.exec(t)
    if (url) return url[1]
    const head = /^([^\s/?#]+)/.exec(t)
    if (head) return head[1]
    return t
  }
  return v.asset_ip || '(未指定目标)'
}

function groupByStage(reportItems, chain) {
  const byId = new Map((reportItems || []).map((x) => [x.id, x]))
  const groups = []
  const stageList = (chain && chain.stages) || []
  stageList.forEach((st, si) => {
    const items = (st.items || []).map((x) => byId.get(x.id)).filter(Boolean)
    if (items.length === 0) return
    groups.push({ code: st.code, name: st.name, color: st.color || '#64748b',
      ordinal: st.ordinal || si + 1, points: st.points || 0, cumulative: st.cumulative || 0, items })
  })
  /* scoreChain 完全没有阶段信息时，至少把得分归到「其他」，不要让条目凭空消失 */
  const grouped = new Set(groups.reduce((acc, g) => acc.concat(g.items.map((x) => x.id)), []))
  const rest = (reportItems || []).filter((x) => !grouped.has(x.id))
  if (rest.length > 0) {
    groups.push({ code: 'other', name: '其他得分', color: '#64748b', ordinal: groups.length + 1,
      points: rest.reduce((n, x) => n + (x.counted ? x.points : 0), 0),
      cumulative: 0, items: rest })
  }
  return groups
}

export { fmt, fmtShort, provLabel, clickable, copyText, copyWithFeedback, targetKeyOf, groupByStage };
