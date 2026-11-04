// Migrated from lib/redteam/client.js; API payloads and page behavior retained.


const UNREAD_KEY = 'rt-unread:'

const loadUnread = (eng) => {
  try {
    const raw = window.localStorage.getItem(UNREAD_KEY + eng)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch (e) { return null }
}

const saveUnread = (eng, value) => {
  try { window.localStorage.setItem(UNREAD_KEY + eng, JSON.stringify(value)) } catch (e) { console.debug('[drill] 未读状态仅在内存保留', e) }
}

const digestHasNew = (prev, cur) => {
  if (!cur) return false
  if (!prev) return true
  const pc = Number(prev.count || 0)
  const cc = Number(cur.count || 0)
  if (cc > pc) return true
  const pa = prev.at || ''
  const ca = cur.at || ''
  return ca !== '' && ca !== pa && ca > pa
}

export { UNREAD_KEY, loadUnread, saveUnread, digestHasNew };
