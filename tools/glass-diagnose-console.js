/**
 * 浏览器控制台诊断脚本：确认 Xsdsh-purge-next 的新版液态玻璃有没有真正跑起来。
 *
 * 用法：打开 DSH 的 Web GUI，按 F12 → Console → 粘贴本文件全部内容 → 回车。
 *
 * 判据：
 *   1. 样式表里有没有 url(#xsdsh-lg-refract)  —— 有 = 新版 client 已加载
 *   2. 文档里有没有 #xsdsh-lg-defs / <filter> —— 有 = 滤镜已注入
 *   3. 玻璃面板的 computed backdrop-filter    —— 是否被浏览器采纳
 *   4. data-glass 当前值                       —— 玻璃开关是否打开
 */
;(function () {
  const out = []
  const log = (ok, msg, extra) => out.push(`${ok === true ? 'OK  ' : ok === false ? 'BAD ' : '    '}${msg}${extra !== undefined ? '  → ' + extra : ''}`)

  // 1) 样式表里是否含新标记
  const sheets = Array.from(document.querySelectorAll('style'))
  const lookSheet = sheets.find((s) => s.id === 'xsdsh-look-css') || sheets.find((s) => (s.textContent || '').includes('xsdshw-layer'))
  const sheetText = lookSheet ? lookSheet.textContent || '' : ''
  log(Boolean(lookSheet), '<style> 壁纸/玻璃样式表存在')
  log(/xsdsh-lg-refract/.test(sheetText), '样式表里引用 url(#xsdsh-lg-refract)', /url\(#xsdsh-lg-refract\)/.test(sheetText))
  log(/xsdsh-lg-specular/.test(sheetText), '含新版变量 --xsdsh-lg-specular')

  // 2) 滤镜是否注入
  const host = document.getElementById('xsdsh-lg-defs')
  const filter = host && host.querySelector('filter#xsdsh-lg-refract')
  log(Boolean(host), '#xsdsh-lg-defs 容器存在')
  log(Boolean(filter), '<filter id="xsdsh-lg-refract"> 存在')
  log(Boolean(filter && filter.querySelector('feImage')), 'feImage 存在')
  log(Boolean(filter && filter.querySelector('feDisplacementMap')), 'feDisplacementMap 存在')
  if (filter) log(null, 'feDisplacementMap scale', filter.querySelector('feDisplacementMap').getAttribute('scale'))
  if (filter) {
    const href = filter.querySelector('feImage')?.getAttribute('href') || ''
    log(href.startsWith('data:image/svg+xml'), 'feImage href 是内联 SVG data URL', href.length + ' 字符')
  }

  // 3) 玻璃根节点的状态
  const root = document.querySelector('.xsdsh-root')
  log(Boolean(root), '.xsdsh-root 存在')
  if (root) log(null, 'data-glass 当前值', root.getAttribute('data-glass'))

  // 4) 实际生效的 backdrop-filter
  const targets = [
    ['卡片 .xsdsh-card', '.xsdsh-root .xsdsh-card'],
    ['面板 .xsdsh-panel', '.xsdsh-root .xsdsh-panel'],
    ['设置面板 .xsdsh-section', '.xsdsh-root .xsdsh-section'],
    ['dock .xsdsh-dock', '.xsdsh-dock'],
  ]
  for (const [label, sel] of targets) {
    const el = document.querySelector(sel)
    if (!el) { log(null, label + ' 未找到（可能没打开这个界面）'); continue }
    const cs = getComputedStyle(el)
    const bf = cs.backdropFilter || cs.webkitBackdropFilter || ''
    log(bf && bf !== 'none', label + ' 的 backdrop-filter', bf || '(空)')
    log(bf.includes('xsdsh-lg-refract'), label + ' 采纳了折射滤镜', bf.includes('url'))
    const sh = cs.boxShadow || ''
    log(sh.split('rgba').length - 1 >= 3 || sh.split('rgb').length - 1 >= 3, label + ' 有分层 box-shadow', sh.slice(0, 90) + (sh.length > 90 ? '…' : ''))
  }

  // 5) 位移贴图能否解码
  const feImage = filter && filter.querySelector('feImage')
  const href = feImage && feImage.getAttribute('href')
  const finish = () => {
    console.log('%c=== Xsdsh-purge-next 液态玻璃诊断 ===', 'font-weight:bold;font-size:14px')
    console.log(out.join('\n'))
    const bad = out.filter((l) => l.startsWith('BAD')).length
    console.log(bad === 0
      ? '%c结论：新版液态玻璃已生效（含折射）'
      : `%c结论：有 ${bad} 项不通过，把上面整段发回即可定位`,
      bad === 0 ? 'color:#2e7d32;font-weight:bold' : 'color:#c62828;font-weight:bold')
  }
  if (href) {
    const probe = new Image()
    probe.onload = () => { log(true, '位移贴图可解码', probe.naturalWidth + 'x' + probe.naturalHeight); finish() }
    probe.onerror = () => { log(false, '位移贴图无法解码'); finish() }
    probe.src = href
  } else {
    log(false, '没有 feImage href，无法验证贴图')
    finish()
  }
})()
