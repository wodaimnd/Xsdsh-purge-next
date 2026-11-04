// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { api } from './api.js';
import { fmt, copyText } from './helpers.js';

const shotCache = new Map()

const shotLoading = new Map()

const shotSrc = (eng, id) => shotCache.has(eng + ':' + id) ? shotCache.get(eng + ':' + id) : null

const loadShot = (eng, id) => {
  const key = eng + ':' + id
  if (shotCache.has(key)) return Promise.resolve(shotCache.get(key))
  if (shotLoading.has(key)) return shotLoading.get(key)
  const p = api({ op: 'shotData', engagement: eng, id: id }).then((r) => {
    const src = r && r.base64 ? 'data:' + (r.mime || 'image/png') + ';base64,' + r.base64 : ''
    shotCache.set(key, src)
    return src
  }).catch(() => '').finally(() => { shotLoading.delete(key) })
  shotLoading.set(key, p)
  return p
}

const SHOT_KIND = { screenshot: '现场截图', card: '记录生成的证据摘录' }

const ShotImage = ({ eng, shot, height }) => {
  const [zoom, setZoom] = React.useState(false)
  const [image, setImage] = React.useState(() => ({ key: eng + ':' + shot.id, src: shotSrc(eng, shot.id) }))
  const imageKey = eng + ':' + shot.id
  const src = image.key === imageKey ? image.src : shotSrc(eng, shot.id)
  React.useEffect(() => {
    let alive = true
    setZoom(false)
    loadShot(eng, shot.id).then((value) => { if (alive) setImage({ key: imageKey, src: value }) })
    return () => { alive = false }
  }, [eng, shot.id, imageKey])
  const card = shot.kind === 'card'
  return h('div', { className: 'rt-shot' },
    src === null
      ? h('div', { className: 'rt-shot-thumb rt-shot-loading', style: { height: (height || 96) + 'px' } }, '载入中…')
      : !src ? h('div', { className: 'rt-shot-thumb rt-shot-loading' }, '证据图片不可用') : h('img', {
          className: 'rt-shot-thumb', src: src, alt: shot.label || ('证据 ' + shot.id),
          style: { height: (height || 96) + 'px', cursor: 'zoom-in' },
          onClick: () => setZoom(true),
        }),
    h('div', { className: 'rt-shot-cap' },
      h('span', { className: 'rt-tag ' + (card ? 'rt-tag-warn' : 'rt-tag-live'), title: card
        ? '由当日记录生成的证据摘录，不是现场截图 —— 报告里同样会标注'
        : '现场截图' }, SHOT_KIND[shot.kind] || shot.kind || '证据'),
      h('span', { className: 'rt-shot-label', title: shot.label || shot.note || '' },
        shot.label || shot.target || ('#' + shot.id))),
    zoom
      ? h('div', { className: 'rt-shot-zoom', onClick: () => setZoom(false) },
          h('img', { src: src, alt: shot.label || '' }),
          h('div', { className: 'rt-shot-zoom-cap' }, (shot.label || shot.target || '')
            + (card ? '　·　由当日记录生成（非现场截图）' : '')
            + (shot.captured_at ? '　·　' + fmt(shot.captured_at) : '')
            + '　·　点击任意处关闭'))
      : null)
}

const ShotStrip = ({ eng, shots, total, title }) => {
  const list = shots || []
  if (list.length === 0) return null
  return h('div', { className: 'rt-shots' },
    h('div', { className: 'rt-shots-head' },
      h('b', null, title || '证据截图'),
      h('span', { className: 'rt-shots-n' }, '显示 ' + list.length + ' 张'
        + (total && total > list.length ? '（该得分点共 ' + total + ' 张，取代表图）' : ''))),
    h('div', { className: 'rt-shot-row' }, list.map((sh) => h(ShotImage, { key: 'sh' + sh.id, eng: eng, shot: sh }))))
}

function HttpBlock(props) {
  const text = String(props.text || '')
  if (!text) return null
  const lines = text.split(/\r?\n/)
  const nodes = lines.map((ln, i) => {
    let cls = null
    if (i === 0 && /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH|TRACE)\s/.test(ln)) cls = 'rt-hl-req'
    else if (i === 0 && /^HTTP\//.test(ln)) cls = 'rt-hl-res'
    else if (/^[A-Za-z0-9-]+:/.test(ln)) {
      const name = ln.split(':')[0].toLowerCase()
      if (name === 'host' || name === 'cookie' || name === 'authorization' || name === 'content-type') cls = 'rt-hl-req'
    }
    return h('div', { key: 'l' + i, className: cls || undefined }, ln === '' ? '\u00a0' : ln)
  })
  return h('pre', { className: 'rt-evi-body' + (props.compact ? ' req' : '') }, nodes)
}

function detailEvidence(v) {
  const evi = String(v.evidence || '').trim()
  const looksHttp = /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH|HTTP\/)/m.test(evi) || /\n[A-Za-z-]+: /.test(evi)
  const blocks = []
  if (evi) {
    blocks.push(h('div', { key: 'ev', className: 'rt-evi' },
      h('div', { className: 'rt-evi-head' }, '证据摘要',
        h('span', { className: 'rt-tag' }, looksHttp ? '原始报文' : '文本'),
        h('div', { className: 'rt-spacer' }),
        h('button', {
          className: 'rt-btn', style: { padding: '0 6px', fontSize: 11 },
          onClick: (e) => { e.stopPropagation(); copyText(evi) },
        }, '复制')),
      looksHttp ? h(HttpBlock, { text: evi }) : h('pre', { className: 'rt-evi-body' }, evi)))
  }
  const http = v.http_evidence || []
  for (const e of http) {
    blocks.push(h('div', { key: 'h' + e.id, className: 'rt-evi' },
      h('div', { className: 'rt-evi-head' },
        e.label || 'HTTP 证据',
        h('span', { className: 'rt-tag' }, (e.method || '') + ' ' + (e.status === null || e.status === undefined ? '' : e.status)),
        h('div', { className: 'rt-spacer' }),
        h('span', { style: { fontWeight: 400, color: 'var(--dsw-alias-label-secondary)' } }, fmt(e.captured_at || e.created_at))),
      e.request ? h('div', null,
        h('div', { className: 'rt-evi-head', style: { borderTop: 'none' } }, '▸ 请求（可直接粘进 Burp Repeater）'),
        h(HttpBlock, { text: e.request, compact: true })) : null,
      e.response ? h('div', null,
        h('div', { className: 'rt-evi-head' }, '▸ 响应'),
        h(HttpBlock, { text: e.response })) : null,
      e.note ? h('pre', { className: 'rt-evi-body', style: { maxHeight: 80 } }, e.note) : null))
  }
  if (blocks.length === 0) {
    blocks.push(h('div', { key: 'none', className: 'rt-kv' }, h('b', null, '证据'),
      h('span', { style: { color: 'var(--dsw-alias-state-error-primary)' } }, '缺失 —— 未验证/无证据的漏洞不计入报告，请补 redteam_http_evidence_add')))
  }
  return h('div', { key: 'eviwrap' }, blocks)
}

export { shotCache, shotLoading, shotSrc, loadShot, SHOT_KIND, ShotImage, ShotStrip, HttpBlock, detailEvidence };
