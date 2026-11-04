# 清洗页平铺化设计规格（clean-panel-flat）

> 状态：设计定稿，待实施
> 范围：`client.js` 的清洗页（`SettingsRoot` → `PurgifySection` / `RulesSection` / `SkillsSection`）
> 本文档**只写规格**，本任务不改 `client.js`，不提交 git。
> 依据：`ui-ux-pro-max` 技能（本地数据集：styles / products / ux-guidelines / typography），所有结论均标注查询命令。

---

## 0. 问题陈述（现状事实）

已核实于 `client.js`：

| 事实 | 位置 |
|---|---|
| `const FULL_CLEAN_PANEL = false;` 把标题区 / 版本行 / 指标卡 / 进度条 / 补丁分组 / Hook 拦截全部 `null` 掉 | `client.js:3325`，条件渲染见 `3328–3386` |
| 关掉之后页面只剩：`override.title` 标题 + 一个大 textarea（提示词）→ `own.title` 标题 + 一个 textarea（自己的服务器）→ 一个卸载按钮 | `client.js:3419–3485` |
| 竖排单列，无分组、无说明、无状态回读 | `PURGE_CSS` 中 `.xsdsh-root{max-width:920px;display:flex;flex-direction:column;gap:18px}`（`client.js:974`） |
| 组件其实都还在：`PatchGroups`(2564) / `HooksDenySection`(2611) / `RulesSection`(3486) / `SkillsSection`(3829) | 同上 |
| 样式是内联 CSS 常量 `PURGE_CSS`（973 起）/ `LOOK_CSS`（1375 起），变量前缀 `--xsdsh-*` | 同上 |
| 主题走 `data-theme="white" \| "dusk"` | `client.js:976–977`、`1222–1223`、`10807` |
| 文案字典 `zh`（127 起）/ `en`（550 起） | 同上 |
| 对话窗口挂点：`shell.overlay` 里 `TabRowPurgeMount`（10968，往 tab row 塞 `.xsdsh-tab-chip`）、`conversation.input.right` 槽位（12897，当前只注册了 `RewindSafe`，order 20） | 同上 |

结论：**信息全在，只是被一个布尔常量藏起来，且恢复后仍是单列竖排**。本次要做的是"恢复 + 平铺 + 说人话 + 对话窗内可开关"。

---

## 1. 设计系统摘要（逐条标注查询命令）

### 1.1 查询命令清单

脚本：`C:\Users\Administrator\.agents\skills\ui-ux-pro-max\scripts\search.py`（Windows 下用 `python`，Python 3.15.0）。

```bash
# ① 主设计系统：桌面端开发者设置面板、密集信息
python C:\Users\Administrator\.agents\skills\ui-ux-pro-max\scripts\search.py \
  "desktop developer settings panel dense information dashboard" \
  --design-system --density 8 --variance 4 --motion 3 \
  -p "Xsdsh Purge Clean Panel" -f markdown

# ② 分区 / 卡片扫读 / 可读性
python ...\search.py "section" --domain ux -n 8
python ...\search.py "readability" --domain ux -n 8
python ...\search.py "card grid scan" --domain ux -n 8          # 0 命中（见 1.5 说明）
python ...\search.py "sectioned card grid scanability" --domain ux -n 6  # 0 命中

# ③ 焦点可见 / 键盘 / 紧凑控件语义
python ...\search.py "focus visible" --domain ux -n 8
python ...\search.py "switch aria-checked keyboard" --domain ux -n 5
python ...\search.py "toggle switch state" --domain ux -n 6
python ...\search.py "progressive disclosure accordion collapse" --domain ux -n 6

# ④ 说明文案 / 排版
python ...\search.py "help text description" --domain ux -n 6
python ...\search.py "line length" --domain ux -n 3
python ...\search.py "spacing density dashboard" --domain ux -n 6
python ...\search.py "truncate long text tooltip" --domain ux -n 4

# ⑤ 反馈 / 回滚
python ...\search.py "error recovery retry" --domain ux -n 4

# ⑥ 风格
python ...\search.py "dense settings panel technical" --domain style -n 4
python ...\search.py "bento box grid" --domain style -n 2
python ...\search.py "developer tool admin settings" --domain product -n 2

# ⑦ 排版（等宽 + 中文正文）
python ...\search.py "monospace technical chinese" --domain typography -n 4

# ⑧ 动效
python ...\search.py "reduced motion" --domain ux -n 3
python ...\search.py "hover state" --domain ux -n 3
```

### 1.2 采纳的结论（含出处）

| # | 结论 | 出处命令 | 落到本设计 |
|---|---|---|---|
| D1 | 密集信息面板：**gap 8px、卡片内边距 12px、字号 12–14px、grid 布局** | ⑥ `--domain style` 命中 `data-dense-dashboard`（Design System Variables: `--grid-gap: 8px; --card-padding: 12px; --font-size-small: 12px`） | 卡片内边距 12px、正文字号 13px、说明 12px |
| D2 | 密度旋钮 8/10 = **8–32px 间距尺度**（低密度才是 24–96px） | ① `--design-system --density 8`（输出 Dials: Density 8/10 — Dense/Dashboard） | 全部间距锁在 4 / 8 / 12 / 16 / 24 五档 |
| D3 | 动效 3/10 = **Subtle**，只用 300–400ms 淡入位移，`prefers-reduced-motion` 时直接给终态 | ① `--motion 3`；⑧ `--domain ux "reduced motion"`（Reduced Motion，Severity High） | 卡片展开/收起只做 120ms 高度与透明度过渡；`reduce` 下 `transition:none` |
| D4 | 变体 4/10 = **Balanced/Modern**，不做非对称异形 | ① `--variance 4` | 2 列等宽卡片，不做 1x2 / 2x2 拼贴 |
| D5 | 卡片网格：`grid-template-columns: repeat(N,1fr)` + 明确响应式降级（4→2→1） | ⑥ `--domain style` 命中 `bento-box-grid`（Checklist: Grid responsive 4→2→1 cols） | 2→1 列降级，见 §2.2 |
| D6 | **每行 65–75 字符**，禁止满宽长段落 | ④ `--domain ux "line length"`（Line Length，Medium） | 卡片最大宽 560px，说明文案 `max-inline-size: 68ch` |
| D7 | 正文行高 **1.5–1.75** | ④ `--domain ux "readability"` 命中 Line Height（Medium：`1.5-1.75`） | 正文 1.6，说明 1.55（与现有 `.xsdsh-hint{11.5px/1.55}` 一致） |
| D8 | 正文对比度 ≥ **4.5:1**，禁止灰底灰字 | ④ `--domain ux "readability"` 命中 Contrast Readability（**High**） | 说明文字用 `--xsdsh-mute`，见 §2.6 对比度校验 |
| D9 | **每个可操作控件都要可见焦点环**，不得只 `outline:none` | ③ `--domain ux "focus visible"` 命中 Focus States（**High**） | 卡片头按钮 / 开关都加 `:focus-visible` 2px 环 |
| D10 | 焦点不得被常驻 UI 完全遮挡（WCAG 2.2 AA） | ③ 命中 Focus Not Obscured (Minimum)（**High**） | 卡片折叠时把焦点还给卡片头；dock 内滚动容器留 `scroll-padding` |
| D11 | 紧凑可交互 chip 必须是**原生 role + 可访问名 + 状态 + 键盘 + 可见焦点**；禁止 `div onclick` | ③ 命中 Compact Control Semantics（**Critical**） | 开关条用 `<button role="switch" aria-checked>` |
| D12 | 状态切换动画可被中断：直接设终态，**不依赖 `transitionend`** | ③ 命中 Cancellable State Transitions（**High**） | 开关点击后立刻写 `aria-checked`，动画只是装饰 |
| D13 | 徽标/计数更新用**一条** `role="status"` 播报，不要每块都开 live region | ③ 命中 Contextual Live Badge Updates（**High**） | 整个清洗页只留 1 个 `role="status"`（保存结果） |
| D14 | 出错必须给恢复路径（重试按钮 / 明确下一步） | ⑤ 命中 Error Recovery（Medium）+ Error Messages（**High**） | 卡片内 `role="alert"` + 「重试」 |
| D15 | 长文本截断要有展开手段 | ④ 命中 Truncation（Medium：`line-clamp-2 with expand`） | 说明文字 2 行截断 + 「展开说明」 |
| D16 | 文字在窄宽 / 缩放 / 用户加间距下必须可重排，不得写死宽高裁切 | ④ 命中 Text Reflow and Spacing（**Critical**） | 卡片 `height:auto`、`min-width:0`、禁 `overflow:hidden` 于文本容器 |
| D17 | 水平滚动条 = 失败 | ④ `"responsive grid auto-fit minmax"` 命中 Horizontal Scroll（**High**） | `min-width:0` + `overflow-wrap:anywhere` 用于路径/主机名 |
| D18 | 悬停只做增强，主操作不能只靠 hover | ⑧ `--domain ux "hover state"` 命中 Hover vs Tap（**High**） | 卡片操作按钮常驻可见，不做 hover 才显形 |
| D19 | 排版：中文正文用 Simplified Chinese 配对（Noto Sans SC 一类），等宽用于路径/状态 | ⑦ `--domain typography "monospace technical chinese"` 命中 `Chinese Simplified`（Noto Sans SC）与 `Terminal CLI Monospace`（JetBrains Mono，严格 12/14/16pt、行高 1.2x） | **不引入 Web Font**（离线 Electron），映射到既有本地字体栈，见 §1.3 |
| D20 | 产品气质：Developer Tool / IDE → Dark Mode + Minimalism + Flat，Dashboard 走 Real-Time Monitor + Terminal | ⑥ `--domain product "developer tool admin settings"` 命中 `Developer Tool / IDE` | 沿用现有 dusk/white 双主题，只做扁平卡片，不加玻璃层（玻璃已有 `data-glass` 开关） |

### 1.3 排版映射（不引入 Web Font）

`--design-system` 建议 `Fira Code / Fira Sans`、`--domain typography` 建议 `JetBrains Mono / Noto Sans SC`。**桌面 Electron 离线环境不能 `@import` Google Fonts**（会挂空请求、闪字、离线失效），因此只取"气质与尺度"，字体名映射到既有变量（`client.js:974`）：

| 角色 | 现有变量 | 取值 | 用法 |
|---|---|---|---|
| 正文 / UI | `--xsdsh-sans` | `"Yu Gothic UI","Hiragino Sans GB","Source Han Sans SC",system-ui,sans-serif` | 卡片正文 13px/1.6 |
| 等宽 | `--xsdsh-mono` | `"Cascadia Mono","Sarasa Mono SC",ui-monospace,monospace` | 路径、主机名、`12/82` 计数、状态 pill、`#id` |
| 标题 | `--xsdsh-display` | `"Songti SC","Noto Serif SC",...serif` | 仅页面主标题（20px）与卡片标题（15px）保留，**不扩散到正文** |

尺度（对齐 D19 的"严格 12/14/16"精神，按现有 13px 基准微调，避免全局跳变）：

| Token | 值 | 用途 |
|---|---|---|
| `--clean-fs-page` | 20px / 1.3 | 页面主标题（现状 `.xsdsh-title`，不动） |
| `--clean-fs-card` | 15px / 1.35 | 卡片标题 |
| `--clean-fs-body` | 13px / 1.6 | 卡片正文、输入框 |
| `--clean-fs-hint` | 12px / 1.55 | 「这到底是干什么的」说明 |
| `--clean-fs-mono` | 12px / 1.5 | 路径、计数、pill |
| `--clean-fs-micro` | 11px / 1.5 | 角标、kicker |

### 1.4 间距节奏（4/8 制，对齐 D1/D2）

| Token | 值 | 用途 |
|---|---|---|
| `--clean-sp-1` | 4px | 标题与说明之间、pill 内间隙 |
| `--clean-sp-2` | 8px | 卡片头内部 gap、按钮组 gap、行内元素 gap |
| `--clean-sp-3` | 12px | **卡片内边距**、**卡片网格 gap** |
| `--clean-sp-4` | 16px | 页头与网格之间、卡片之间的大分组（section 之间） |
| `--clean-sp-5` | 24px | 页面上/下留白 |

规则：**任何 padding / margin / gap 只能取这 5 档**，不再出现 `14px`、`18px`、`10px` 这类散值（现状 `PURGE_CSS` 里有 `gap:18px`、`padding:18px 18px 16px`、`margin:14px`，实施时收敛）。

### 1.5 没有命中的查询（如实标注，不假装有依据）

- `"card grid scan" --domain ux` → **0 命中**（Closest known terms: can / hard / scaling）
- `"sectioned card grid scanability" --domain ux` → **0 命中**
- `"accordion" --domain ux` → **0 命中**
- `"toggle switch settings" --domain icons` → **0 命中**

以上四处**不使用该数据集结论**，改用同域邻近条目替代：卡片扫读用 D1/D5/D6（密度 + 网格降级 + 行长）；折叠用 D10/D15（焦点归还 + 截断展开）；开关用 D11/D12（原生 role + 终态优先）。这些替代依据在正文里逐条注明来源编号。

---

## 2. 平铺布局规格

### 2.1 总体结构

```
SettingsRoot (.xsdsh-root, data-theme=white|dusk)
├─ <style>PURGE_CSS</style> + <style>LOOK_CSS</style>        ← 不动
├─ [A] 页头区  .clean-head        （单列，不参与网格）
│     标题「清洗」+ 当前版本 + 玻璃开关
└─ [B] 平铺网格 .clean-grid       （2 列自适应，本次新增）
      ├─ C1 补丁            span 2
      ├─ C2 Hook 拦截       span 1
      ├─ C3 提示词          span 2
      ├─ C4 自己的服务器    span 1
      ├─ C5 规矩本          span 2
      ├─ C6 技能            span 2
      └─ C7 卸载            span 2   （危险区，永远最后一行）
```

**为什么 Hook 拦截以下是重点**：`FULL_CLEAN_PANEL=true` 恢复后，补丁区在上、Hook 拦截在中间、提示词/自己的服务器在下，全部竖排单列，一屏只能看到两块。改成网格后，第一屏能同时看到"补丁 / Hook 拦截 / 提示词"三块的标题 + 一句人话说明，用户不用滚动就能判断"我要不要动它"。

### 2.2 网格定义

```css
/* 容器：dock 可缩放，媒体查询跟的是视口不是面板宽，所以用容器查询 */
.clean-grid {
  container-type: inline-size;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--clean-sp-3);          /* 12px */
  align-items: start;              /* 卡片各自高度，不拉伸 */
}

/* 单卡片 */
.clean-card {
  min-width: 0;                    /* D17：防水平滚动 */
  box-sizing: border-box;
  padding: var(--clean-sp-3);      /* 12px，D1 */
  border: 1px solid var(--xsdsh-line);
  border-radius: 8px;
  background: var(--xsdsh-paper);  /* 主题变量，不写死色值 */
  color: var(--xsdsh-ink);
  display: flex;
  flex-direction: column;
  gap: var(--clean-sp-2);          /* 8px */
  height: auto;                    /* D16：禁止写死高度 */
}

.clean-card[data-span="2"] { grid-column: 1 / -1; }
```

**降级（D5：2 → 1）**

| 容器内容宽 | 列数 | 对应 dock 宽度 | 卡片宽 |
|---|---|---|---|
| ≥ 572px | 2 | ≥ 606px（默认 620 ✓） | ≈ 287px |
| 420–571px | 1 | 454–605px | 全宽 |
| < 420px | 1 | < 454px（最小 380） | 全宽，最小 346px |

```css
@container (max-width: 571px) {
  .clean-grid { grid-template-columns: minmax(0, 1fr); }
  .clean-card[data-span="2"] { grid-column: auto; }
}
/* 容器查询不支持的旧内核兜底 */
@supports not (container-type: inline-size) {
  .clean-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  }
}
```

**卡片最小宽 280px 的推导**：`2 × 280 + 12(gap) = 572`，即容器内容宽 572px 起才允许 2 列；换算 dock 宽 = 572 + 32(`.xsdsh-root` 左右 padding 16) + 2(边框) ≈ **606px**。默认 620px 正好 2 列且每卡 287px，能放下 `12 / 82` 这种计数 pill + 4 个汉字标题。低于 380px（dock 最小宽）不成立，因为 dock 自身 `min-width:380px`。

**卡片最大宽 560px**：D6 要求每行 65–75 字符。560px / 13px 中文 ≈ 43 字/行，已是舒适上限；超过就靠 `[data-span="2"]` 不再加宽，而是让卡片内部再分栏。

### 2.3 每张卡片的 span 判定

| 卡片 | span | 理由 |
|---|---|---|
| C1 补丁 | **2** | 内含 3 个指标 + 进度条 + 5 个可展开分组表格（`xsdsh-table` 三列）。1 列（287px）下表格必然横向滚动（违反 D17） |
| C2 Hook 拦截 | **1** | 只有标题 + 一句说明 + 1 个复选框。1 列刚好，与 C1 同排会留白，所以让 C1 独占一行 |
| C3 提示词 | **2** | 大段 textarea，D6 行长要求 |
| C4 自己的服务器 | **1** | textarea `rows=4`，短内容；与 C2 气质相同（"一个开关/一段短名单"） |
| C5 规矩本 | **2** | 左列表 + 右编辑器（现状 `.xsdsh-split` 纵向堆叠），2 列卡内可改成左右 40/60 |
| C6 技能 | **2** | 同 C5，且有「导入压缩包 / 导入文件夹」按钮组 |
| C7 卸载 | **2** | 危险操作，独占一行 + 与上方 16px 间距隔开（视觉上"离远点"） |

**排布结果**（2 列态）：

```
行1: [ C1 补丁 .................... span 2 ]
行2: [ C2 Hook 拦截 ] [ C4 自己的服务器 ]
行3: [ C3 提示词 ................. span 2 ]
行4: [ C5 规矩本 ................. span 2 ]
行5: [ C6 技能 ................... span 2 ]
行6: [ C7 卸载 ................... span 2 ]
```

> C2 与 C4 同排是刻意的：两块都是"一行说明 + 一个可改的小东西"，高度接近，不会出现 287px 高 vs 60px 高的落差。

### 2.4 折叠策略

| 卡片 | 默认状态 | 折叠后显示 | 持久化 key |
|---|---|---|---|
| C1 补丁 | 展开（指标 + 进度条）；**5 个分组全部收起** | 标题 + `12/82` 计数 + 进度条 | `xsdsh.clean.card.patch` |
| C2 Hook 拦截 | 展开 | 标题 + 当前值 pill（`放行` / `按官方`） | `xsdsh.clean.card.hooks` |
| C3 提示词 | 展开 | 标题 + 字数（`1,204 字`） | `xsdsh.clean.card.prompt` |
| C4 自己的服务器 | 展开 | 标题 + 行数（`3 台`） | `xsdsh.clean.card.own` |
| C5 规矩本 | 展开 | 标题 + 条目数（`7 条`） | `xsdsh.clean.card.rules` |
| C6 技能 | 展开 | 标题 + 条目数（`42 个`） | `xsdsh.clean.card.skills` |
| C7 卸载 | **不可折叠** | — | — |

折叠交互：
- 触发元素 = 卡片标题行右侧的 chevron `<button>`，`aria-expanded` + `aria-controls="clean-card-<id>-body"`。
- 折叠时 `body` 用 `hidden` 属性（不是 `display:none` 内联），保证读屏能跳过、`aria-controls` 关系成立。
- **焦点归还**（D10）：折叠时若焦点在 body 内，焦点回到卡片头按钮；否则焦点留在原地（不抢）。
- 过渡：`max-height`/`opacity` 120ms；`prefers-reduced-motion: reduce` 时 `transition:none` 且直接给终态（D3）。
- **不依赖 `transitionend`**（D12）：状态在点击瞬间就写进 state 与 localStorage，动画纯装饰。

### 2.5 卡内滚动与截断

| 场景 | 规则 |
|---|---|
| 规矩本 / 技能列表 | `max-height: 240px; overflow:auto;`（沿用 `.xsdsh-rulebody` 现值），滚动容器加 `scroll-padding-block: 8px`（D10） |
| 补丁分组表格 | 展开时 `max-height: 320px; overflow:auto;`，表头 `position:sticky; top:0` |
| 路径 / 主机名 | `overflow-wrap:anywhere; word-break:break-all`（D17） |
| 说明文字 | 默认 `line-clamp: 2`；末尾「展开说明」按钮，展开后 `line-clamp: unset`（D15） |
| textarea | `min-height`：提示词 220px（沿用 `.xsdsh-area`）、自己的服务器 96px（沿用 inline 值）；`resize:vertical` |

### 2.6 主题与对比度

- 颜色**只能**来自 `--xsdsh-*` / `--dsw-alias-*`，新样式一律用 `color-mix(in srgb, ...)` 派生，禁止新增硬编码 hex（现状 `PURGE_CSS` 已全部 `color-mix`，保持）。
- `data-theme="dusk"` 与 `"white"` 两套必须**分别**验（D8 要求独立验证，不能靠"看起来还行"）。
- `--xsdsh-mute` 在 dusk 下是 `ink 84% + secondary`，white 下是 `76% + secondary`（`client.js:1222–1223`）。说明文字 12px 属小字，**必须 ≥4.5:1**；实施时用浏览器取色核对，不达标就把白底那档从 76% 提到 82%。
- 卡片边框 `--xsdsh-line` 在 dock-body 里被覆盖为 `color-mix(in srgb, var(--xsdsh-ink) 20%, transparent)`（`client.js:1137`）。这条 `!important` 覆盖层不动，新卡片直接继承即可，不要自己再写 `border-color`。

### 2.7 ASCII 线框

**宽态（dock ≥ 606px，2 列）**

```
┌─ .xsdsh-dock ────────────────────────────────────────────────────┐
│ Xsdsh-purge                                    [全看一遍] [揣起来] │  ← dock-head（可拖拽，不动）
├──────────────────────────────────────────────────────────────────┤
│ 清洗 │ 改写 │ 演练台 │ 猫猫 │ 模式提示词                          │  ← dock-tabs（不动）
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  清洗                                   当前 v0.1.5  [玻璃 ☑]      │  ← [A] .clean-head
│  管住宿主怎么读提示词、怎么放行 hook。改完点「应用」再重启。          │     说明 12px / --xsdsh-mute
│                                                                  │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐│
│  │ 补丁                12/82 ⌄ │  │ Hook 拦截          放行 ⌄   ││  ← C1 span2 / C2 span1
│  │ 官方代码里被改写了多少处。   │  │ 你自己的 hook 说"不许"时，  ││
│  │ ▓▓▓▓▓▓▓▓░░░░░░  已应用 12   │  │ 还要不要听。                ││
│  │  [提示词 3/8] [代码 5/30] …  │  │  ☑ 放行 deny / ask          ││
│  └─────────────────────────────┘  └─────────────────────────────┘│
│                                   ┌─────────────────────────────┐│
│                                   │ 自己的服务器        3 台 ⌄  ││  ← C4 span1
│                                   │ 这些主机不走清洗，原样放行。 ││
│                                   │  ┌───────────────────────┐  ││
│                                   │  │10.0.0.5               │  ││
│                                   │  │git.internal           │  ││
│                                   │  └───────────────────────┘  ││
│                                   │              [保存名单]      ││
│                                   └─────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ 提示词                                    1,204 字   [存起来]⌄││  ← C3 span2
│  │ 每次对话最先塞给模型的那段话。空着就用宿主默认。               ││
│  │ ┌──────────────────────────────────────────────────────────┐ ││
│  │ │                                                          │ ││
│  │ │  (textarea, min-height 220, resize:vertical)             │ ││
│  │ │                                                          │ ││
│  │ └──────────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ 规矩本                                        7 条   [复原]⌄ ││  ← C5 span2
│  │ 按目录生效的 AGENTS.md / CLAUDE.md，决定模型先看到哪些规矩。   ││
│  │ ┌──────────────┐ ┌──────────────────────────────────────────┐││
│  │ │ 工作区策略 ▾ │ │  名称 / 目标 / 正文编辑器                 │││
│  │ │ · 全局  (7)  │ │                                          │││
│  │ └──────────────┘ └──────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ 技能                                       42 个   [导入] ⌄   ││  ← C6 span2
│  │ 给模型装的手册。聊天里打 /名称 立刻加载。                      ││
│  │ ┌──────────────┐ ┌──────────────────────────────────────────┐││
│  │ │ · apk-reverse│ │  description + SKILL.md 正文              │││
│  │ └──────────────┘ └──────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────────┘│
│                                        (16px 空隙，危险区隔开)    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ 卸载                                              [卸载…]     ││  ← C7 span2（不可折叠）
│  │ 把 Xsdsh-purge 从宿主里删干净，清完要重启。不可撤销。           ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

**窄态（dock < 606px，1 列）**

```
┌─ .xsdsh-dock (380px) ────────────────────────┐
│ 清洗 │ 改写 │ 演练台 │ 猫猫 │ …             │
├──────────────────────────────────────────────┤
│ 清洗                   当前 v0.1.5 [玻璃 ☑]  │
│ 管住宿主怎么读提示词…                        │
│ ┌──────────────────────────────────────────┐ │
│ │ 补丁                            12/82 ⌄  │ │
│ │ 官方代码里被改写了多少处。               │ │
│ │ ▓▓▓▓▓░░░░░  [提示词 3/8] [代码 5/30]     │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ Hook 拦截                      放行 ⌄    │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ 自己的服务器                    3 台 ⌄   │ │
│ └──────────────────────────────────────────┘ │
│ …（其余卡片同宽，纵向堆叠，顺序不变）…       │
└──────────────────────────────────────────────┘
```

**补丁卡片展开态（分组表格）**

```
┌ 补丁 ──────────────────────────────── 12/82 ⌄ ┐
│ 官方代码里被改写了多少处。                      │
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░  已应用 12 · 待处理 3      │
│ ┌ 提示词  3/8  ──────────────────────── ▸ ┐   │
│ ├ 代码    5/30 ──────────────────────── ▾ ┤   │
│ │  #  │ 项目              │ 状态           │   │
│ │  #1 │ 注入清洗提示词     │ [已应用]       │   │
│ │  #2 │ 剥离 AGENTS.md     │ [已应用]       │   │
│ │  …  │ (max-height 320, 表头 sticky)     │   │
│ ├ 工具    2/9  ──────────────────────── ▸ ┤   │
│ └ 0.2.0   2/35 ──────────────────────── ▸ ┘   │
└────────────────────────────────────────────────┘
```

---

## 3. 每块「这到底是干什么的」人话注释定稿

> 写法要求：**一句话说清"它管什么"**，第二句说清"改它会发生什么"。不用术语缩写，不写"配置项""参数""策略"这类空词。
> 落地位置：`zh` / `en` 字典新增 key（**不改现有 key**，只加值），渲染在卡片标题下方 `.clean-card-desc`，字号 12px / 行高 1.55 / 颜色 `--xsdsh-mute`，2 行截断 + 展开。

### 3.1 中文定稿（zh 字典）

| 卡片 | 建议 key | 定稿文案 |
|---|---|---|
| 补丁 | `clean.desc.patch` | **官方代码里被改写了多少处。** 数字是"已应用 / 总数"；点开分组能看到每一处改的是什么、现在是开还是关。 |
| Hook 拦截 | `clean.desc.hooks` | **你自己的 hook 说"不许"时，还要不要听。** 关掉就是让官方那套拦截原样生效；改完要「应用」+ 重启才写进宿主。 |
| 提示词 | `clean.desc.prompt` | **每次对话最先塞给模型的那段话。** 空着就用宿主默认；写了就整段替换默认，所以别把临时想法留在这儿。 |
| 自己的服务器 | `clean.desc.own` | **这些主机不走清洗，原样放行。** 一行一个 IP 或完整主机名，写域名时它解析出的地址一起放行；不要写密码和网段。 |
| 规矩本 | `clean.desc.rules` | **按目录生效的 AGENTS.md / CLAUDE.md，决定模型先看到哪些规矩。** 「工作区策略」选什么时候用它们；下面勾的文件只在提示词框为空时兜底。 |
| 技能 | `clean.desc.skills` | **给模型装的手册，用的时候才翻。** 聊天里打 `/名称` 立刻加载；任务对上描述时模型自己会调。写"请激活"不会触发。 |
| 卸载 | `clean.desc.uninstall` | **把 Xsdsh-purge 从宿主里删干净。** 会清掉写进宿主的补丁和注入文件，清完必须重启，删了不能撤回。 |

配套的标题行副标（右侧 pill，替代原来的裸数字）：

| 卡片 | key | zh |
|---|---|---|
| 补丁 | `clean.pill.patch` | `已应用 12 / 82` |
| Hook 拦截 | `clean.pill.hooks.on` / `.off` | `放行` / `按官方` |
| 提示词 | `clean.pill.prompt` | `{n} 字` |
| 自己的服务器 | `clean.pill.own` | `{n} 台` |
| 规矩本 | `clean.pill.rules` | `{n} 条` |
| 技能 | `clean.pill.skills` | `{n} 个` |
| 卸载 | — | 无 |

### 3.2 英文定稿（en 字典）

| 卡片 | key | 定稿文案 |
|---|---|---|
| Patches | `clean.desc.patch` | **How many places in the host's own code were rewritten.** The number is applied / total; open a group to see what each change does and whether it is on. |
| Hook interception | `clean.desc.hooks` | **Whether your own hook's "no" still counts.** Turn it off and the host's interception runs exactly as shipped; click Apply and restart to write the files. |
| Prompt | `clean.desc.prompt` | **The text handed to the model before every conversation.** Leave it empty to use the host default; anything you type replaces that default, so do not park scratch notes here. |
| Own servers | `clean.desc.own` | **These hosts skip cleaning and pass through untouched.** One IP or exact hostname per line; a hostname also allows the addresses it resolves to. No passwords, no ranges. |
| Rule sets | `clean.desc.rules` | **AGENTS.md / CLAUDE.md per directory, deciding which rules the model sees first.** Workspace policy picks when they apply; the checked files are only a fallback while the prompt box is empty. |
| Skills | `clean.desc.skills` | **Manuals for the model, opened only when needed.** Type `/name` in chat to load one now; the model calls one itself when a task matches its description. Writing "please activate" does nothing. |
| Uninstall | `clean.desc.uninstall` | **Removes Xsdsh-purge from the host entirely.** It clears the patches and injected files, needs a restart, and cannot be undone. |

Pill 文案：`clean.pill.patch` = `12 / 82 applied`；`clean.pill.hooks.on/.off` = `Bypassed` / `Host default`；`clean.pill.prompt` = `{n} chars`；`clean.pill.own` = `{n} hosts`；`clean.pill.rules` = `{n} entries`；`clean.pill.skills` = `{n} skills`。

### 3.3 与现有文案的关系（必须遵守）

- 现有 `hooksDeny.hint` / `own.hint` / `policy.hint` / `cwd.hint` / `skills.hint` **保留**，作为卡片内二级说明（用户点开细节才看）。新加的是"卡片级一句话"，不是替换。
- 现有 `purge.title`（"补丁"）、`override.title`（"提示词"）、`own.title`（"自己的服务器"）、`rules.title`（"规矩本"）、`skills.title`（"Skill"）、`hooksDeny.title`（"Hooks 拦截"）**继续做卡片标题**，不改 key、不改值。
- 术语统一：中文一律"Hook 拦截"（不是"Hooks 拦截"）、"规矩本"、"自己的服务器"；英文一律 "Hook interception"、"Rule sets"、"Own servers"。

---

## 4. 对话窗口内开关条：交互与无障碍规格

### 4.1 位置

两个入口，同一个状态源（`dockBus` / `useDock()`，`client.js:9664–9678`）：

| 入口 | 挂点 | 现状 | 目标 |
|---|---|---|---|
| 主入口 | `conversation.input.right` 槽位（`client.js:12897`，order 20 是 `RewindSafe`） | 该槽位只有回退按钮 | 新注册 `id: "Xsdsh-purge-clean-switch"`，**order 22**（紧跟在回退按钮右侧），`RewindSafe` 不动 |
| 次入口 | `TabRowPurgeMount`（`client.js:10968`）塞进对话页签行的 `.xsdsh-tab-chip` | 是 `<button class="xsdsh-tab-btn">`，只切 `on` 类 | 保留位置，补 `role="switch"` + `aria-checked`，与主入口状态同步 |

> 为什么不放左边：`conversation.input.right` 是输入框右下的操作带，回退/继续/发送都在这儿；开关属于"打开一个面板"，和它们同类，放左边会跟附件/模型选择打架。

### 4.2 视觉规格

```
收起态（未开启）                     展开态（面板已开）
┌──────────────────────────┐        ┌──────────────────────────┐
│ ○  清洗                  │        │ ●  清洗                  │
└──────────────────────────┘        └──────────────────────────┘
 28px 高 / 圆角 8 / 透明底           底色 brand 12% / 文字 brand
 文字 --dsw-alias-label-secondary     文字 --dsw-alias-label-primary
 圆点 8px 空心 (currentColor 40%)     圆点 8px 实心 (brand)
```

- 高度 28px（与 `.xsdsh-rewind{height:28px}` 对齐，`client.js:4520`），`padding: 0 8px`，`gap: 4px`，圆角 8px。
- **不用 emoji 当图标**（技能"Common Rules"硬性要求）；状态点用 CSS 画（`border-radius:50%` + `border`/`background`），可被 `currentColor` 带着走，天然适配双主题。
- 悬停：`background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.12))`（沿用 `.xsdsh-rewind:hover` 的取值，保证同一行视觉一致）。
- 按下：`opacity: .72`，**不改布局尺寸**（技能要求"press 不位移"）。
- 打开 dock 时，开关本身**不消失**——用户要能在对话里直接关掉它（这是本次需求的核心）。

### 4.3 状态机

```
                    ┌──────────────┐
       点击/Enter   │              │  点击/Enter
   ┌───────────────►  OFF（关闭）  ├───────────────┐
   │                │              │               ▼
   │                └──────▲───────┘        ┌──────────────┐
   │                       │                │ ON（面板开）  │
   │        open 失败 → 回滚│                └──────┬───────┘
   │                ┌──────┴───────┐               │
   └────────────────┤  PENDING      │◄──────────────┘
                    │ (乐观 UI)     │  dock 被外部关闭（点 × / Esc）
                    └──────────────┘  → 订阅 dockBus，回读为 OFF
```

| 状态 | `aria-checked` | 视觉 | 可交互 |
|---|---|---|---|
| OFF | `false` | 空心点 + 次级文字 | 是 |
| ON | `true` | 实心点 + 品牌色 | 是 |
| PENDING | 保持目标值（乐观） | 同上 + `aria-busy="true"` | 否（`aria-disabled` 不设，用 `pointer-events:none` + 忽略点击） |
| 失败回滚 | 写回 `false` | 回到 OFF | 是 |

**切换语义（点击 ON）**：
1. 立刻写 `aria-checked="true"`（D12：不等动画）；
2. `setDock({ open: true, tab: "clean", authOpen: false, pending: "tab" })`；
3. 成功条件：`dockBus.open === true` **且** `.xsdsh-dock[data-open="1"]` 在下一帧存在；
4. 失败条件：任一不满足，或 `SettingsRoot` 渲染抛错（用现有 `PromptsErrorBoundary` 同款边界思路包一层）；
5. 失败 → 300ms 内回滚 `aria-checked="false"`，并在开关右侧挂一条 `role="alert"` 的 2 秒提示："面板没打开，再点一次"。**不给用户留一个"亮着但没开"的假状态。**

**状态回读（关键）**：开关**不自己存开关状态**，一律从 `useDock()` 读 `st.open`。这样：
- 点 dock 右上角 ×（`client.js:10830`）→ `open:false` → 开关自动变 OFF；
- 首页 `PurgeLauncher` 打开 dock → 对话里的开关自动变 ON；
- 页签行 chip 与输入区开关同时读同一个 `dockBus`，不可能不一致。

### 4.4 无障碍规格（对齐 D9 / D11 / D12 / D13）

| 项 | 规格 |
|---|---|
| 语义 | `<button type="button" role="switch">`（原生 button + switch role，既有键盘行为又有开关语义） |
| 状态 | `aria-checked="true" \| "false"`，值必须与视觉一致（D11：状态与可见标签一致） |
| 可访问名 | `aria-label` = `打开清洗面板` / `关闭清洗面板`（随状态变化），或 `aria-labelledby` 指向可见文字「清洗」+ `aria-describedby` 指向隐藏说明 |
| 说明 | 隐藏 `<span id="clean-switch-desc" class="sr-only">` 内容：`在对话里打开或收起清洗面板；面板里有提示词、规矩本、技能和补丁。` |
| 键盘 | `Tab` 可达（自然文档序，排在回退按钮之后）；`Enter` / `Space` 切换（原生 button 自带，不拦截）；**不做**方向键（不是 radiogroup） |
| 焦点环 | `:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary,#6dbf8c); outline-offset: 2px; }`（D9；2px 实线，不用 box-shadow 淡影） |
| 焦点不被遮挡 | 开关在输入框操作带内，dock 打开时右侧可能盖住它 → dock 打开时开关**仍然可见**（dock 是右上浮层，输入区在下方，不重叠）；若窗口极窄导致重叠，给 `conversation.input.right` 容器加 `padding-inline-end: var(--xsdsh-dock-w, 0)` 不可行（会挤坏输入框），改为：dock 打开时开关加 `aria-hidden="false"` 但**移出 dock 覆盖矩形**——实施时以实测矩形为准（D10 要求"至少部分可见"） |
| 状态播报 | 切换后由**唯一**一个 `role="status"` 节点播报：`清洗面板已打开` / `清洗面板已收起`（D13：不要每个卡片各开一个 live region） |
| 失败播报 | `role="alert"`，2 秒后移除；文案 `面板没打开，再点一次` |
| 减少动效 | `prefers-reduced-motion: reduce` 下状态点不做 scale 过渡（D3） |
| 对比度 | 文字对输入区底色 ≥4.5:1；状态点（非文本 UI）≥3:1；两套主题分别验（D8） |
| 触控 | 视觉高度 28px，命中区用 `::before` 扩到 36×36（技能 Touch Target 要求；桌面端可放宽，但键盘用户不受影响） |
| 不依赖 hover | 开关常驻可见，不做 hover 才显形（D18） |

### 4.5 与页签行 chip 的关系

`TabRowPurgeMount` 现在渲染 `t("dock.inSession")`（"Xsdsh-purge"）+ `.on` 类。改造：

1. `className: "xsdsh-tab-btn"` 保留（继承页签行的高度/字重/下划线视觉，不破坏宿主 tab row 节奏）；
2. 加 `role="switch"`、`aria-checked={st.open}`、`aria-label`；
3. 文案改为「清洗」（与输入区开关一致），`title` 保留"已开启 / 点击打开"；
4. **不改** `.xsdsh-tab-chip{display:inline-flex;align-items:flex-end;flex:0 0 auto}`（`client.js:1214`）——它保证 chip 不会把宿主 tab row 撑开换行。

---

## 5. 不许动的既有约束（硬约束清单）

> 以下每条都有代码位置，实施时逐条对照。动了任何一条，面板会在 Windows 标题栏、dock 缩放、主题切换或宿主升级时坏掉。

### 5.1 拖拽与命中（Windows 标题栏）

| # | 约束 | 位置 | 为什么不能动 |
|---|---|---|---|
| K1 | `.xsdsh-dock` 与 `.xsdsh-dock-head` 及其**所有后代**保持 `-webkit-app-region:no-drag; app-region:no-drag` | `client.js:1179–1186` | 宿主标题栏 drag 带是 `::before` 伪元素，选择器权重更高；父级声明 `no-drag` 才会把整块矩形从 drag 带里挖出来 |
| K2 | `.xsdsh-dock` 的 inline `WebkitAppRegion:"no-drag"` 必须保留 | `client.js:10821` | 内联样式是唯一能稳赢宿主 `[data-windows-titlebar] .frame:before` 的写法 |
| K3 | `.xsdsh-dock-head` 的 `onMouseDown={startDrag}` + `cursor:grab/grabbing` 不动 | `client.js:10824`、`1124–1125` | 拖动是唯一移动面板的方式（无原生窗口） |
| K4 | 新加的任何按钮/开关，若落在 dock 内，必须落在 `no-drag` 覆盖范围内 | 同上 | 否则点不动 |

### 5.2 尺寸与几何

| # | 约束 | 位置 | 为什么不能动 |
|---|---|---|---|
| K5 | `--xsdsh-dock-w` / `--xsdsh-dock-h` 由 JS 写进 `:root`，CSS **只能读**，不得写死 | `client.js:10713`、`10720` | 拖动缩放靠这两个变量回写；写死会让缩放手柄和实际尺寸脱钩 |
| K6 | dock 尺寸钳制：`min-width:380px; min-height:320px; max-width:calc(100vw-16px); max-height:calc(100vh-16px)` | `client.js:1119` | 网格断点就是按 380 推导的（§2.2）；改最小值会让 1 列态失效 |
| K7 | `defaultDockGeom()` 的 `DOCK_COMPOSER_CLEAR = 172` 与 `y = 48` 不动 | `client.js:9717–9725` | 172 是给输入框留的净空，改了面板会压住输入框 |
| K8 | `clampDockGeom` 与 `beginPointerSession` 的指针会话逻辑不动 | `client.js:9726` 起 | 老写法在 Windows 上最大化/切窗口时会丢 mouseup，这里已修过 |

### 5.3 层级

| # | 元素 | z-index | 位置 |
|---|---|---|---|
| K9 | `.xsdsh-dock` | 10050 | `1119` |
| K10 | `.xsdsh-launch` | 10040 | `1121` |
| K11 | `.xsdsh-dock-close` | 70（relative） | `1131` |
| K12 | resize 手柄 | 60 | `1162` |
| K13 | `.xsdsh-modal-bg` | 80 | `1058` |
| K14 | `.xsdsh-restart-mask` | 12000 | `1063` |

新增卡片**不得**引入新的 `position:fixed` 或 `z-index > 70`；卡片内部的 sticky 表头只能用 `z-index:1` 级别。

### 5.4 主题与颜色

| # | 约束 | 位置 |
|---|---|---|
| K15 | 只允许 `data-theme="white" \| "dusk"` 两值；新样式必须两套都验 | `976–977`、`1222–1223`、`10807` |
| K16 | 颜色一律 `color-mix(in srgb, var(--dsw-alias-*, var(--xsdsh-*)) ...)`，禁止新增硬编码 hex | 全 `PURGE_CSS` 现状 |
| K17 | `.xsdsh-dock-body` 的 `!important` 覆盖层（面板/卡片背景、`--xsdsh-line` 重算）不改优先级、不改选择器 | `1137–1144` |
| K18 | `select option` 的主题色两套（white `#fff/#16140f`、dusk `#1b1d22/#f4f1ea`）保留 | `1141–1142` |
| K19 | `data-glass="1"` 的玻璃层与 `ensureGlassFilter()` 幂等调用不动 | `1255–1365`、`4507` |

### 5.5 容器与滚动

| # | 约束 | 位置 | 说明 |
|---|---|---|---|
| K20 | `.xsdsh-dock-body .xsdsh-root{max-width:none;height:100%;flex:1;min-height:0;overflow:auto}` | `1137` | 这是唯一的滚动容器；卡片内再加 `overflow:auto` 只允许用于列表/表格，不要给整卡 |
| K21 | `.xsdsh-dock-body{flex:1;min-height:0;overflow:hidden}` | `1136` | 改成 `auto` 会出现双滚动条 |
| K22 | `.xsdsh-dock{overflow:visible}` | `1119` | resize 手柄在边框外（`right:-2px` / `bottom:-2px`），改 `hidden` 手柄就没了 |

### 5.6 行为与状态

| # | 约束 | 位置 | 说明 |
|---|---|---|---|
| K23 | `dockBus` / `setDock` / `useDock` / `toggleDock` 的签名与语义不动 | `9664–9712` | 首页 launcher、页签 chip、演练台授权跳转（`requestDrill`）全依赖它 |
| K24 | `FULL_CLEAN_PANEL` 常量保留，语义不变（`true` = 完整界面） | `3325` | 实施时把它改 `true` 或删掉条件渲染，但**不要删常量**——它是回滚开关 |
| K25 | `PurgifySection` 的 `askUninstall` 弹窗结构（`role="dialog"` + `aria-modal` + `aria-labelledby` + 遮罩点击关闭）不动 | `3387–3402` | 卸载确认是破坏性操作的最后一道 |
| K26 | `restartDsh` / `RestartAsk` / `waitForRestart` 的"先看到旧进程掉线再等新进程"逻辑不动 | `3405–3417`、`4123–4152` | 改了会误判重启成功 |
| K27 | `HooksDenySection` 的保存语义不动：先乐观 `setCfg`，失败再回滚并报 `err.save` | `2623–2643` | 与本次开关的"乐观 + 回滚"是同一套模式，保持一致 |
| K28 | 字典 key 只增不改；`zh` / `en` 两份必须同步加 | `127`、`550` | 缺一边会在英文界面露出 key 名 |

### 5.7 动效

| # | 约束 | 位置 |
|---|---|---|
| K29 | `@media (prefers-reduced-motion:reduce){.xsdsh-btn,.xsdsh-bar>i{transition:none}.xsdsh-skel{animation:none}}` 保留并扩到新卡片 | `1117` |
| K30 | `xsdsh-pulse` 骨架动画保留（加载态仍要用） | `1076`、`1115` |

---

## 6. 实施清单（给下一个任务的交接）

> 本文档不改代码。以下为实施顺序，供 t2/实现任务直接照做。

1. `client.js:3325` `FULL_CLEAN_PANEL` → `true`（保留常量）。
2. `PURGE_CSS` 追加 `.clean-grid` / `.clean-card` / `.clean-card-desc` / `.clean-card-head` 一组样式（§2.2、§2.4、§2.5），**只追加不重写**现有选择器。
3. `PurgifySection` 的返回结构改为：`[A] .clean-head` + `[B] .clean-grid`，卡片顺序 C1→C7（§2.1）。
4. `RulesSection` / `SkillsSection` 的 `<section class="xsdsh-panel">` 换成 `<section class="clean-card" data-span="2">`，内部 `.xsdsh-split` 在 2 列态下改 `flex-direction:row`（40/60）。
5. `zh` / `en` 各加 7 条 `clean.desc.*` + 6 条 `clean.pill.*`（§3）。
6. `TabRowPurgeMount` 的 chip 补 `role="switch"` + `aria-checked`（§4.5）。
7. `conversation.input.right` 追加注册 `Xsdsh-purge-clean-switch`（order 22，`client.js:12897` 旁），组件读 `useDock()`（§4.3）。
8. 只加**一个** `role="status"` 节点（§4.4，D13）。
9. 双主题 + 380/620/920 三个宽度 + `prefers-reduced-motion` 四项实测。

**验收口径**
- 380px dock：单列，无水平滚动条（D17）。
- 620px dock：2 列，C2/C4 同排，C1 独占一行。
- 对话页签 chip 与输入区开关，点任一个另一边立刻同步；点 dock × 两边都变 OFF。
- 键盘：`Tab` 到开关 → `Enter`/`Space` 切换 → 焦点环可见（2px 实线）。
- 读屏：切换播报"清洗面板已打开/已收起"，只播一次。
- 打开失败：`aria-checked` 回 `false` + `role="alert"` 提示，不留假亮状态。
