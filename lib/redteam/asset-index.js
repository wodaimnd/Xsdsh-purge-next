/**
 * 资产维度的纯查询/归一辅助。
 *
 * 放在独立文件里，避免 store-core.js 继续膨胀；这里不依赖 RedteamStore 实例，
 * 只接收 sqlite 句柄和查询参数，方便单独测试。
 */
import { nowIso } from './ip-utils.js'

/** trim → 小写 → 去尾部点 → 拆出开头的通配符 `*.`。只用于展示/分组，不改库里的原始名字。 */
export function normalizeDomain(raw) {
  let name = String(raw ?? '').trim().toLowerCase()
  if (!name) return { domain: '', wildcard: false }
  name = name.replace(/\.+$/, '')
  let wildcard = false
  if (name.startsWith('*.')) {
    wildcard = true
    name = name.slice(2).replace(/^\.+/, '')
  }
  return { domain: name, wildcard }
}

/**
 * 按规范化主域聚合资产。
 * `*.foo` 与 `foo` 合并到 `foo`；只有通配符时显示 `*.foo`；www/api 等子域仍独立。
 */
export function domainIndex(db, f = {}) {
  const assets = (f.cidr
    ? db.prepare('SELECT id, ip, segment_cidr, state, primary_name FROM asset WHERE segment_cidr = ? ORDER BY ip_int').all(f.cidr)
    : db.prepare('SELECT id, ip, segment_cidr, state, primary_name FROM asset ORDER BY ip_int').all())
  const names = db.prepare('SELECT asset_id, name, kind, provenance FROM asset_name').all()
  const byAsset = new Map()
  for (const n of names) {
    if (!byAsset.has(n.asset_id)) byAsset.set(n.asset_id, [])
    byAsset.get(n.asset_id).push(n)
  }
  /* key = 规范化主域；value = { wildcard, assets: Map<assetId, entry> } */
  const groups = new Map()
  for (const a of assets) {
    const rawNames = []
    if (a.primary_name) rawNames.push(a.primary_name)
    for (const n of byAsset.get(a.id) || []) rawNames.push(n.name)
    /* 同一资产内先去重：`*.foo` 与 `foo` 只算一个组；组名优先非通配符 */
    const keys = new Map()
    for (const raw of rawNames) {
      const { domain, wildcard } = normalizeDomain(raw)
      if (!domain) continue
      keys.set(domain, (keys.get(domain) ?? true) && wildcard)
    }
    if (keys.size === 0) keys.set('(未关联域名)', false)
    for (const [domain, wildcard] of keys) {
      if (!groups.has(domain)) groups.set(domain, { wildcard, assets: new Map() })
      const group = groups.get(domain)
      if (!wildcard) group.wildcard = false
      if (!group.assets.has(a.id)) {
        group.assets.set(a.id, {
          id: a.id, ip: a.ip, segment: a.segment_cidr, state: a.state,
          names: (byAsset.get(a.id) || []).map((n) => n.name),
        })
      }
    }
  }
  return Array.from(groups.entries())
    .map(([domain, group]) => ({
      domain: domain === '(未关联域名)' || !group.wildcard ? domain : '*.' + domain,
      count: group.assets.size,
      assets: Array.from(group.assets.values()),
    }))
    .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain))
}

/**
 * service 表没有唯一约束：重复采集时先找同一端口下 name/product/version
 * 完全相同的既有行（NULL 用 IFNULL 归一），命中只刷新字段，避免 Web 视图被放大。
 */
export function upsertService(db, portId, p, provenance, tool) {
  const existing = db.prepare(`SELECT id FROM service
    WHERE port_id = ?
      AND IFNULL(name, '') = IFNULL(?, '')
      AND IFNULL(product, '') = IFNULL(?, '')
      AND IFNULL(version, '') = IFNULL(?, '')
    ORDER BY id DESC LIMIT 1`).get(
    portId, p.service ?? null, p.product ?? null, p.version ?? null,
  )
  if (existing) {
    db.prepare(`UPDATE service SET last_seen = ?, cpe = COALESCE(?, cpe),
      provenance = COALESCE(?, provenance), tool = COALESCE(?, tool) WHERE id = ?`).run(
      nowIso(), p.cpe ?? null, provenance, tool, existing.id,
    )
    return
  }
  db.prepare(`INSERT INTO service(port_id, name, product, version, cpe, provenance, tool, first_seen, last_seen)
    VALUES(?,?,?,?,?,?,?,?,?)`).run(
    portId, p.service ?? null, p.product ?? null, p.version ?? null, p.cpe ?? null,
    provenance, tool, nowIso(), nowIso(),
  )
}
