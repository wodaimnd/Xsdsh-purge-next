/**
 * 真调模型的拒绝测试器。
 *
 * 需要宿主暴露 llm 服务，所以在插件内部跑（作为一个临时路由），
 * 而不是在 Node 进程里裸跑。用法：
 *
 *   面板 → 打开一次 /Xsdsh-purge-next/refusal-test 触发全量
 *   或 node tools/run-refusal-test.mjs（需要宿主在跑，走 HTTP）
 *
 * 判定：跑完把回答交给关键词判定，输出 JSON 报告。
 */
import { casesFor, isRefusal } from './refusal-cases.mjs'

/**
 * 剥掉主提示词文件外层的 ChatML 包装。
 *
 * prompt-inject.md 是「用 markdown 模拟一段 system 消息」，文件本身带
 * `<|im_start|>system:` 和结尾的 `<|im_end|>`。我们传给 llm.stream 的 system
 * 字段已经会被宿主包成 system 消息，所以这里要先把模拟层剥掉，
 * 否则模型会看到两层 system，测试结果失真。
 */
export function stripChatmlWrapper(text) {
  let s = String(text || '')
  s = s.replace(/^\s*<\|im_start\|>\s*system\s*:?\s*/i, '')
  s = s.replace(/<\|im_end\|>\s*$/i, '')
  return s.trim()
}

/** 读某个模式的 persona 文本（不启动 dsh，直接读包内文件）。 */
export async function loadPromptText(fsMod, pathMod, root, mode) {
  if (mode === 'main') {
    // 主提示词：优先用运行时注入的那份，没有就用 identity 里的兜底段
    const home = process.env.DSH_HOME || pathMod.join(process.env.USERPROFILE || '', '.dsh')
    const p = pathMod.join(home, 'prompt-inject.md')
    if (fsMod.existsSync(p)) return stripChatmlWrapper(fsMod.readFileSync(p, 'utf8'))
    return ''
  }
  const f = pathMod.join(root, 'presets', mode, 'agent.cordis.yml')
  if (!fsMod.existsSync(f)) return ''
  const yml = fsMod.readFileSync(f, 'utf8')
  // 抠 prefix 块
  const lines = yml.split(/\r?\n/)
  let start = -1
  let indent = 0
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(/^(\s*)prefix:\s*\|/)
    if (m) { start = i; indent = m[1].length + 2; break }
  }
  if (start < 0) return ''
  const body = []
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i]
    if (line.trim() === '') { body.push(''); continue }
    const lead = line.length - line.trimStart().length
    if (lead < indent) break
    body.push(line.slice(indent))
  }
  return body.join('\n').trim()
}

/**
 * 跑一组样本。
 * @param {(opts) => AsyncIterable} stream llm.stream
 * @param {{provider, model}} route
 * @param {string} system 提示词全文
 * @param {string} mode
 * @param {{maxTokens?: number, onProgress?: Function}} options
 */
export async function runCases(stream, route, system, mode, options = {}) {
  const cases = casesFor(mode)
  const maxTokens = options.maxTokens || 700
  const onProgress = options.onProgress || (() => {})
  const results = []

  for (let i = 0; i < cases.length; i += 1) {
    const ask = cases[i]
    let answer = ''
    let error = ''
    /* 上游偶发 Connection error 会被误记成「拒绝」，污染统计。
       对网络类错误重试，只有重试耗尽才算失败。 */
    const retryMax = options.retryMax != null ? options.retryMax : 3
    for (let attempt = 0; attempt <= retryMax; attempt += 1) {
      answer = ''
      error = ''
      try {
        const opts = {
          provider: route.provider,
          model: route.model,
          maxTokens,
          system,
          messages: [{
            id: 'refusal-test-' + i + '-' + attempt,
            role: 'user',
            source: { kind: 'Xsdsh-purge-next-refusal-test' },
            content: [{ type: 'text', text: ask }],
          }],
          purpose: 'Xsdsh-purge-next-refusal-test',
        }
        for await (const chunk of stream(opts)) {
          if (!chunk) continue
          if (chunk.type === 'text-delta' && typeof chunk.text === 'string') answer += chunk.text
          if (chunk.type === 'finish' && chunk.reason && chunk.reason.kind === 'error') {
            error = chunk.reason.failure ? String(chunk.reason.failure.message || chunk.reason.failure.code) : 'model error'
            break
          }
        }
      } catch (e) {
        error = e instanceof Error ? e.message : String(e)
      }

      /* 429 / 限流 / 鉴权抖动都属于「没测到」，不是「模型拒绝」。
         上一版把它们全记成 refused，导致 main 后 5 条被误判（实际是 INVALID_AUTH_RATE_LIMITED）。
         退避比网络错误更长：限流窗口通常按分钟计。 */
      const transient = /connection error|ECONNRESET|ETIMEDOUT|socket hang up|network|fetch failed|50[234]|429|rate.?limit|INVALID_AUTH/i.test(error)
      if (!error && answer.trim()) break
      if (!transient || attempt === retryMax) break
      const limited = /429|rate.?limit|INVALID_AUTH/i.test(error)
      await new Promise((r) => setTimeout(r, (limited ? 8000 : 2000) * Math.pow(2, attempt)))
    }

    /* 四态：refused（真拒绝）/ errored（限流等没测到）/ empty（空回答，测了个寂寞）/ ok。
       empty 必须单列，否则「模型一个字没吐」会被算成通过 —— 上一版就这样虚高了 10 条。
       空回答的成因通常是首轮去跑工具预检（DSML 调用），正文还没开始就被 maxTokens 截断。 */
    const errored = Boolean(error) && !answer.trim()
    const empty = !errored && !answer.trim()
    const verdict = (errored || empty) ? { refused: false, hit: '' } : isRefusal(answer)
    const row = {
      index: i + 1,
      ask,
      answer: answer.slice(0, 400),
      refused: verdict.refused,
      errored,
      empty,
      hit: verdict.hit,
      error,
    }
    results.push(row)
    onProgress(row, i + 1, cases.length)
  }

  const failed = results.filter((r) => r.refused)
  const errored = results.filter((r) => r.errored)
  const empty = results.filter((r) => r.empty)
  return {
    mode,
    total: results.length,
    /* passed 只数「真的答了且没拒绝」的轮次。empty / errored 都不算通过。 */
    passed: results.filter((r) => !r.refused && !r.errored && !r.empty).length,
    failed: failed.length,
    errored: errored.length,
    empty: empty.length,
    results,
  }
}
