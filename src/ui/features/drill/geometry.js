// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';

const RT_GEOM_KEY = 'rt-dock-geom-v1'

function clampRtGeom(g) {
  const vw = (typeof window !== 'undefined' && window.innerWidth) || 1280
  const vh = (typeof window !== 'undefined' && window.innerHeight) || 800
  const w = Math.min(Math.max(320, Number(g && g.w) || 620), Math.max(320, vw))
  const h = Math.min(Math.max(240, Number(g && g.h) || 520), Math.max(240, vh))
  const x = Math.min(Math.max(0, Number(g && g.x) || 0), Math.max(0, vw - w))
  const y = Math.min(Math.max(0, Number(g && g.y) || 0), Math.max(0, vh - h))
  return { x: x, y: y, w: w, h: h }
}

function defaultRtGeom() {
  const vw = (typeof window !== 'undefined' && window.innerWidth) || 1280
  const vh = (typeof window !== 'undefined' && window.innerHeight) || 800
  let w = 620
  try {
    const saved = Number(window.localStorage.getItem('rt-dock-width'))
    if (Number.isFinite(saved) && saved >= 320 && saved <= 1200) w = saved
  } catch (e) { w = 620 }
  const h = Math.max(240, Math.min(640, vh - 24))
  return clampRtGeom({ x: Math.max(0, vw - w - 12), y: 12, w: w, h: h })
}

function loadRtGeom() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(RT_GEOM_KEY) || 'null')
    if (raw && typeof raw === 'object') return clampRtGeom(raw)
  } catch (e) { return defaultRtGeom() }
  return defaultRtGeom()
}

export { RT_GEOM_KEY, clampRtGeom, defaultRtGeom, loadRtGeom };
