// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';

const isFullWindow = () => {
  try { return String(window.location.hash || '') === '#redteam-full' } catch { return false }
}

let ui = { open: true, tab: 'assets' }

const subs = new Set()

const setUI = (patch) => {
  ui = Object.assign({}, ui, patch)
  const snap = Object.assign({}, ui)
  for (const f of Array.from(subs)) {
    try { f(snap) } catch (error) { console.error('[drill] UI订阅更新失败', error) }
  }
}

const setDockWidth = () => {}

const useUI = () => {
  const [st, setSt] = React.useState(() => Object.assign({}, ui))
  React.useEffect(() => {
    const f = (snap) => setSt(Object.assign({}, snap || ui))
    subs.add(f)
    setSt(Object.assign({}, ui))
    return () => { subs.delete(f) }
  }, [])
  return st
}

export { isFullWindow, ui, subs, setUI, setDockWidth, useUI };
