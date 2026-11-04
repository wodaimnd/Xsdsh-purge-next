// Migrated from lib/redteam/client.js; API payloads and page behavior retained.
import React, { h } from '../../host/react';
import { provLabel, copyText } from './helpers.js';
import { PRI_LABEL, TEST_LABEL } from './labels.js';
import { setUI } from './ui-state.js';

function ProvTag(props) {
  if (!props.p) return h('span', { className: 'rt-tag' }, '未知')
  return h('span', { className: 'rt-tag rt-tag-' + props.p }, provLabel(props.p))
}

function PriTag(props) {
  if (!props.p) return h('span', { className: 'rt-tag' }, '未评')
  return h('span', { className: 'rt-pri rt-pri-' + props.p, title: props.title || '' }, PRI_LABEL[props.p] || props.p)
}

function TestTag(props) {
  const st = props.s || 'untested'
  return h('span', { className: 'rt-test rt-test-' + st }, TEST_LABEL[st] || st)
}

/* v2：默认值从「展开」改成「折叠」。换 key 让老用户已存的展开记忆失效一次，
   否则升级后第一眼看到的还是上次留着的全展开状态。 */
const COLLAPSE_KEY = 'rt-collapse-v2:'

const collapseLoad = (prefix) => {
  try {
    const raw = window.localStorage.getItem(COLLAPSE_KEY + prefix)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (e) { return {} }
}

const collapseSave = (prefix, value) => {
  try { window.localStorage.setItem(COLLAPSE_KEY + prefix, JSON.stringify(value)) } catch (e) { console.debug('[drill] 折叠状态仅在内存保留', e) }
}

function useCollapse(prefix) {
  const [state, setState] = React.useState(() => collapseLoad(prefix))
  React.useEffect(() => { setState(collapseLoad(prefix)) }, [prefix])
  const write = (next) => { collapseSave(prefix, next); setState(next) }
  /* 没有记忆过的节点一律折叠：页面第一次打开时先给全貌，展开由用户决定。 */
  const isOpen = (key, defaultOpen) => {
    const v = state[key]
    return v === undefined ? defaultOpen === true : v === true
  }
  const toggle = (key, defaultOpen) => (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    write(Object.assign({}, state, { [key]: !isOpen(key, defaultOpen) }))
  }
  const setAll = (keys, open) => {
    const next = Object.assign({}, state)
    for (const k of keys) next[k] = open
    write(next)
  }
  return { isOpen: isOpen, toggle: toggle, setAll: setAll }
}

function Section(props) {
  const always = props.always === true
  const open = always || props.open === true
  const head = h('div', {
    className: 'rt-sec t-' + (props.tone || 'target') + (always ? ' flat' : ''),
    role: always ? undefined : 'button',
    tabIndex: always ? undefined : 0,
    'aria-expanded': always ? undefined : (open ? 'true' : 'false'),
    onClick: always ? undefined : props.onToggle,
    onKeyDown: always ? undefined : (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (props.onToggle) props.onToggle(e) }
    },
  },
    h('span', { className: 'rt-sec-caret' }, always ? '▍' : (open ? '▾' : '▸')),
    props.title ? h('span', { className: 'rt-sec-title' }, props.title) : null,
    props.count !== undefined && props.count !== null ? h('span', { className: 'rt-sec-count' }, String(props.count)) : null,
    props.sub ? h('span', { className: 'rt-sec-sub' }, props.sub) : null,
    props.right ? h('span', { className: 'rt-sec-right' }, props.right) : null)
  return h('div', { className: 'rt-sec-wrap' }, head,
    open && props.children ? h('div', { className: 'rt-sec-body' }, props.children) : null)
}

function Clip(props) {
  const [open, setOpen] = React.useState(false)
  const text = String(props.text === undefined || props.text === null ? '' : props.text)
  if (text.trim() === '') return null
  return h('div', { className: 'rt-clip' + (open ? ' open' : '') },
    h('div', { className: 'rt-clip-head' },
      props.label ? h('span', { className: 'rt-clip-label' }, props.label) : null,
      h('div', { className: 'rt-spacer' }),
      h('button', {
        className: 'rt-btn', style: { padding: '0 6px', fontSize: 11 },
        onClick: (e) => { e.stopPropagation(); copyText(text) },
      }, '复制'),
      h('button', {
        className: 'rt-btn', style: { padding: '0 6px', fontSize: 11 },
        onClick: (e) => { e.stopPropagation(); setOpen((v) => !v) },
      }, open ? '收起' : '展开')),
    h('div', { className: 'rt-clip-body' }, text))
}

class RtBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error: error }
  }
  componentDidCatch(error) {
    console.error('[redteam-ui] 页面渲染出错:', error)
  }
  render() {
    if (this.state.error) {
      const msg = this.state.error && this.state.error.message ? this.state.error.message : String(this.state.error)
      return h('div', { className: 'rt-pane' },
        h('div', { className: 'rt-err' }, '该页面渲染出错：' + msg),
        h('button', {
          className: 'rt-btn',
          onClick: () => { this.setState({ error: null }); if (this.props.onRetry) this.props.onRetry(); else setUI({ tab: 'assets' }) },
        }, this.props.onRetry ? '重试当前页面' : '回到资产测绘'))
    }
    return this.props.children
  }
}

export { ProvTag, PriTag, TestTag, COLLAPSE_KEY, collapseLoad, collapseSave, useCollapse, Section, Clip, RtBoundary };
