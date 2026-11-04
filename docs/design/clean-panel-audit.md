# 清洗页冗余审核 + 工单改动清单

> 审核对象：`client.js`（清洗分区 / dock 面板）与相关后端路由
> 审核人：code-auditor（team `xsdsh-purge-clean-panel`，task t2）
> 结论定位：**只写文档，未改 `client.js`**（本文件是唯一新增产物）
> 判定依据：`ui-ux-pro-max` 技能（`--domain ux`）检索结果，逐条在正文引用

## 0. 快照与并发说明（重要）

本仓库此刻可能被其他会话并发修改，因此所有行号都绑定下面这份快照。**动手前必须重新核对**。

| 文件 | 读取时 LastWriteTime | Length |
|---|---|---|
| `client.js` | 2026-10-22 19:58:56 | 689972 |
| `lib/index.js` | 2026-10-22 20:04:05 | 125284 |
| `test/preset-prompts.test.mjs` | 2026-10-22 18:56:49 | 31824 |
| `test/settings-render.test.mjs` | 2026-10-22 18:47:18 | 19495 |

写文档前（21:2x / 21:3x）二次、三次核对：`client.js` 仍是 `19:58:56 / 689972`，`SHA256 = FF8BD4E83EC1FCAC8C6CABEAF8583E6613706EF21B3F6E326DD2CC8BA4F91C4E`，未漂移，本文行号有效。若你的核对结果与此不同，**按新文件重新 grep 定位**，不要沿用本文行号。

**执行约定（给后续实现者）**：
1. 编辑前先 `Get-Item client.js | Select LastWriteTime,Length`；与上表不符就**重新定位行号**，不要按本文行号盲改。
2. ~~`client.js` 里 `/* __DSH_PURGE_DRILL_BEGIN__ */` … `/* __DSH_PURGE_DRILL_END__ */` 之间由 `scripts/build-client.mjs` 生成，**禁止手改**。~~ **订正（2026-10-27，Q4a）**：现在**整个 `client.js` 都是产物**——由 `lib/ui/client.fragments.json` 的 16 段拼装，`npm run build:client:check` 比对全文，任何位置手改都会红。改 UI 请改 `lib/ui/` 下对应片段（清洗面板在 `lib/ui/clean/`），再重建。
3. 门控常量 `FULL_CLEAN_PANEL`（`client.js:3325`）目前是 `false`。本文所有改动方案都按「要恢复成完整界面」设计，不保留这个常量。

## 1. 结构现状（先看清，再判定冗余）

清洗分区不是「一页」，而是**三个 `<section class="xsdsh-panel">` 竖着叠在一个滚动容器里**：

```
SettingsRoot (client.js:4465)
└─ div.xsdsh-root            (4508)  ← 唯一滚动容器，flex column，gap:18px，padding:16px
   ├─ PurgifySection         (4512)  → section.xsdsh-panel（补丁 / 提示词 / 自己的服务器）
   ├─ RulesSection           (4513)  → section.xsdsh-panel（策略 / 本地规则 / 列表+编辑器）
   └─ SkillsSection          (4514)  → section.xsdsh-panel（列表+编辑器）
```

dock 尺寸：默认 `620 × min(640, vh-48-172)`（`client.js:9718-9725`），可缩到 `380 × 240`（`client.js:9764-9772` 的 `clampDockGeom`）。也就是说**清洗页要在 380px 宽、240px 高的容器里活下来**，这是所有布局判定的前提。

`FULL_CLEAN_PANEL === false` 时，`PurgifySection` 的前六块（标题 / 版本+玻璃 / 指标卡 / 进度条 / 补丁分组 / Hooks 拦截）全部返回 `null`，只留「提示词 + 自己的服务器 + 一个卸载按钮」。**但 `RulesSection` 和 `SkillsSection` 没有被门住**，照旧全量渲染。于是"精简"实际只精简了第一个 panel，用户看到的仍是三个 panel 的长滚动页 —— 这是本页"看上去很冗杂"的第一根因。

## 2. 逐条问题清单

风险等级：**高** = 直接影响可用性/正确性；**中** = 明显影响可读性与操作效率；**低** = 一致性/维护性。

---

### A. 门控与整体结构

#### A-1 门控只砍了 1/3 的面板，另外两个 panel 照旧全量渲染
- **位置**：`client.js:3325`、`3328-3386`、`4512-4514`
- **现状片段**：
  ```js
  const FULL_CLEAN_PANEL = false;                       // 3325
  ...
  FULL_CLEAN_PANEL ? h("div", { className: "xsdsh-head" }, ...) : null,   // 3328
  FULL_CLEAN_PANEL ? h(PatchGroups, { state: s }) : null,                 // 3376
  FULL_CLEAN_PANEL ? h(HooksDenySection, { onSaved: loadAll }) : null,    // 3377
  ```
- **为什么冗余**：门控只作用于 `PurgifySection` 内部。`SettingsRoot` 仍然无条件挂 `RulesSection` + `SkillsSection`（`4513`、`4514`）。用户点「清洗」看到的是：一个**没有标题**的面板（提示词/自己的服务器）+ 规矩本（`h3` + 策略/本地规则/列表/编辑器）+ Skill（`h3` + 列表/导入/编辑器），三块各带自己的 `xsdsh-panel` 边框，垂直堆叠约 1500px+。**"精简"没有减少任何纵向长度**，只是把第一块的标题删了。
- **修法**：把 `FULL_CLEAN_PANEL` 这个"整块开关"换成分区级开关：每个 panel 由「该区块是否启用」的数据驱动（见 W-01 / W-02），三块默认都平铺，但**统一收进一个区块卡片栅格**，每个区块自带标题+一句话说明+折叠，折叠状态持久化。
- **风险**：高（这是整页观感的主因；改它会撞两组测试，见 §4）

#### A-2 精简模式下首屏没有页面标题，第一个标题是 `h4`
- **位置**：`client.js:3328-3331`（标题被门掉）、`3419-3420`、`3618`、`4036`
- **现状片段**：
  ```js
  FULL_CLEAN_PANEL ? h("div", { className: "xsdsh-head" },
    h("h3", { className: "xsdsh-title" }, t("purge.title")), ...) : null,   // 3328
  ...
  h("div", { className: "xsdsh-sub" }, h("h4", null, t("override.title"))), // 3419-3420
  ```
- **为什么冗余**：`h3` 只在下面两个 panel 出现（`3618` 规矩本、`4036` Skill），而首屏第一个标题是 `h4`「提示词」（`3420`）。标题层级倒挂，屏幕阅读器按标题跳转时会先读到 h4 再读到 h3。
  **量化**：清洗页可视范围内（`2500-4200`）有 **7 个 `h4`**（`2648` hooks、`2705` continue、`2778` 重启询问、`3395` 卸载、`3420` 提示词、`3442` 自己的服务器、`3648` 本地规则）和 **2 个 `h3`**（`3618`、`4036`），**0 个 `h1`/`h2`**（全文件 `h2` 只在 welcome `9805`、auth `9897`、envGate `10239` 三处弹窗里）。也就是说清洗页从 `h4` 起跳，层级断了两级。
  ui-ux-pro-max `--domain ux` → **Accessibility / Heading Hierarchy（Medium）**："Use sequential heading levels h1-h6 / Don't skip heading levels"；**Typography / Heading Clarity（Medium）**："Headings should stand out from body / Don't 与正文同字号"。
- **修法**：清洗页统一 `h2` 为面板级、`h3` 为区块级；首屏必须有可见标题（`purge.title`），并把它从门控里拿出来；把「提示词 / 自己的服务器」两个 `h4` 升为 `h3`。
- **风险**：中

#### A-3 三个 panel 各画一遍边框/内边距，形成"框中框"
- **位置**：`client.js:983`（`.xsdsh-panel`）、`1080`（`.xsdsh-split`）、`1093`（`.xsdsh-editor`）、`3633/3646/3686`（`.xsdsh-block`）、`1137-1138`（dock 内二次覆盖背景与边框）
- **现状片段**：
  ```css
  .xsdsh-panel{border:1px solid var(--xsdsh-line);background:var(--xsdsh-paper);border-radius:10px;padding:18px 18px 16px}  /* 983 */
  .xsdsh-dock-body .xsdsh-panel,.xsdsh-dock-body .xsdsh-editor,.xsdsh-dock-body .xsdsh-rulelist,...{background:...;border-color:...;backdrop-filter:blur(16px)}  /* 1138 */
  ```
- **为什么冗余**：panel 有边框 → block 有 `border-top` → rulelist 有边框 → editor 有边框 → ruleitem 有 `border-bottom`。在 380px 宽、240px 高的 dock 里，**最多同时出现 4 层描边**，把内容区压掉一半。`1138` 又给 dock 内所有容器统一刷一层 `!important` 玻璃底，等于把"卡片感"再叠一遍。
- **修法**：清洗页只保留**一层**卡片（区块卡片），块内用间距和分隔线（`border-top` 或 8px 节奏）表达层级，不再套 `xsdsh-panel`/`xsdsh-editor` 边框。ui-ux-pro-max `--domain ux` → **Layout / Container Width（Medium）** + **Touch / Touch Spacing（Medium）**（"Minimum 8px gap"）提示用间距而不是描边切分。
- **风险**：中（视觉回归面大，需截图对照 `docs/preview/dock-clean.png`）

---

### B. 「Hooks 拦截以下」区块：无分组、无说明、指向不存在的按钮

#### B-1 `HooksDenySection` 没有卡片边界，`.xsdsh-cr` 这个类根本没有 CSS
- **位置**：`client.js:2646`、`2703`（使用 `.xsdsh-cr`），`1028-1031`（只定义了 `.xsdsh-cr-row/-num/-text`）
- **现状片段**：
  ```js
  return h("div", { className: "xsdsh-cr", style: { marginTop: 12 } },   // 2646
    h("div", { className: "xsdsh-sub" }, h("h4", null, t("hooksDeny.title")), noticeNode(notice)),  // 2647-2650
  ```
- **为什么冗余**：`.xsdsh-cr` 在 `PURGE_CSS` 里**零条规则**（全文件只出现 `xsdsh-cr-row`/`-num`/`-text`）。所以 Hooks 区块既没有边框也没有背景，只靠 `marginTop:12` 和上一个区块粘在一起；而它旁边所有东西都有卡片边框 → 视觉上"这一块像是漏渲染"。`ContinueRetrySection`（`2703`）同样问题，且该组件已被注释掉不挂载（`3418`）。
- **修法**：把 `.xsdsh-cr` 纳入区块卡片体系统一（或直接复用新区块组件，见 W-03），删除无 CSS 的裸类名；`ContinueRetrySection` 整段删除或明确标注为未启用（见 W-11）。
- **风险**：低（视觉），但**高**（因为它是"Hooks 以下区块看起来没分组"的直接物证）

#### B-2 Hooks 文案让用户「点应用」，但精简模式里没有「应用」按钮
- **位置**：`client.js:532`（`hooksDeny.hint`）、`955`（英文同键）、`3378-3386`（应用/还原只在完整分支）
- **现状片段**：
  ```
  "hooksDeny.hint": "关掉后，用户自己的 PreToolUse / UserPromptSubmit / Stop hook 的 deny 会按官方逻辑生效。官方 ask 分支本身是空操作，关开关不会弹出审批框。改完后点「应用」并重启才写进宿主。"
  ```
- **为什么冗余**：`FULL_CLEAN_PANEL=false` 时 `doAction("apply")` 按钮不存在（只有卸载）。用户读完这段说明去找「应用」，找不到 → 说明文字变成了**错误指令**。同一段还暴露了 `PreToolUse / UserPromptSubmit / Stop`、`ask 分支空操作` 这类实现细节。
- **修法**：说明文字只写「这个开关做什么 / 关掉会发生什么 / 什么时候需要重启」，**不再提按钮名**；按钮存在性由渲染决定，文案里用中性动词（"保存后生效"）。技术细节收进折叠的「这是什么」里。
- **风险**：中

#### B-3 开关标签直接暴露补丁编号
- **位置**：`client.js:531`
- **现状片段**：`"hooksDeny.bypass": "放行 hooks 的 deny / ask（补丁 30 / 31 / 64 / 65）"`
- **为什么冗余**：`30 / 31 / 64 / 65` 是 `lib/hooks-deny.js:7` 的 `HOOK_DENY_PATCH_IDS`，属于实现细节。对用户而言这是一串无法验证的数字，占了标签一半长度，还让标签在 380px 宽度下换行。
  ui-ux-pro-max `--domain ux` → **Content / Compact Label Semantics（High）**："Badges communicate state while chips or tags represent values"；标签要能一眼读完。
- **修法**：标签改为「放行 hook 的拒绝」（一句话），补丁编号移到 `<details>` 或 title 属性里。
- **风险**：低

#### B-4 Hooks 区块紧跟指标卡，中间没有视觉分隔，且它的说明文字比标题长 4 倍
- **位置**：`client.js:3377`（挂载点）、`2647-2651`
- **现状片段**：
  ```js
  FULL_CLEAN_PANEL ? h(HooksDenySection, { onSaved: loadAll }) : null,   // 3377
  ...
  h("p", { className: "xsdsh-hint", style: { margin: "0 0 4px", color: "var(--xsdsh-mute)", fontSize: 12 } }, t("hooksDeny.hint")),  // 2651
  ```
- **为什么冗余**：标题 4 个字，说明 90+ 字，说明文字 12px 灰字紧贴标题下方，然后才是一个 checkbox。信息密度倒挂：**用户要先读完一段技术说明才能看到一个开关**。同类问题出现在 `own.hint`（`215`，60+ 字）、`policy.hint`（`365`）、`cwd.hint`（`369`）。
  ui-ux-pro-max `--domain ux` → **Accessibility / Text Reflow and Spacing（Critical）**："Text must remain available at narrow widths… Don't clip text in fixed-width boxes"；**Content / Essential Text Truncation（Critical）**：说明属于可读内容，不能靠挤。
- **修法**：统一「标题 + 一行摘要（≤30 字）+ 折叠详情」三段式（见 W-04）。一行摘要放在标题右侧或下方一行，完整说明进折叠。
- **风险**：中

---

### C. 「提示词 / 自己的服务器 / 规矩本」缺说明

#### C-1 「提示词」区块完全没有说明文字，只有一个 220px 高的大文本域
- **位置**：`client.js:3419-3436`、`1054`（`.xsdsh-area{min-height:220px}`）、`109`-`166` 区间无 `override.hint`
- **现状片段**：
  ```js
  h("div", { className: "xsdsh-sub" },
    h("h4", null, t("override.title")),                     // 3420
    h("div", { className: "xsdsh-row", style: { margin: 0 } },
      h(Btn, { ... onClick: saveOverride }, t("btn.saveInject")),        // 3422
      h(Btn, { ... onClick: restoreOverride }, t("btn.restoreInject")),  // 3423
  h("textarea", { className: "xsdsh-area", ref: promptAreaRef, value: override, placeholder: "" })  // 3426-3436
  ```
- **为什么冗余**：整个中文词典里**没有 `override.hint` 这个键**（`grep '"override\.'` 只命中 `override.title`）。用户看到：一个标题「提示词」、两个按钮（保存注入 / 恢复默认）、一个 220px 空文本域、占位符是空字符串。**没人告诉他这个框里的字会去哪、什么时候生效、和「模式提示词」有什么区别**。同时后端 `GET /override` 明明返回了 `customized / usingDefault / path / injectSource / needPrompt`（`lib/index.js:2387`），前端只用了 `content` / `defaultContent`（`2956-2961`）—— 一整片状态被丢掉，用户只能靠猜。
  ui-ux-pro-max `--domain ux` → **Accessibility / Form Labels（High）**："Inputs must have associated labels / Don't placeholder-only inputs"；**Forms / Input Affordance（Medium）**。
- **修法**：补 `override.hint`（一句话说明 + 折叠详情），标题行右侧显示状态徽章（`已自定义` / `用默认`，来自 `customized`），文本域加 `aria-label`、显示字数与目标路径（`path`）。
- **风险**：中

#### C-2 「自己的服务器」的说明在文本域下方 60+ 字，且没有条目计数/即时校验
- **位置**：`client.js:3468-3476`、`215`
- **现状片段**：
  ```js
  h("textarea", { className: "xsdsh-area", value: ownServers, rows: 4, style: { minHeight: 96 } }),  // 3468-3475
  h("p", { className: "xsdsh-hint", ... }, t("own.hint")),                                          // 3476
  ```
- **为什么冗余**：说明文字写在输入框**下方**，而用户要先知道"每行一个 IP 或完整主机名"才知道怎么填 → 顺序反了。保存后才由后端 `normalizeAllowText`（`lib/net-scope.js:357-379`）返回 `dropped` 告诉你哪几行被丢掉，**填的时候零反馈**。没有"当前 N 条"的计数，也没有"这条会被丢弃"的行内提示。
  ui-ux-pro-max `--domain ux` → **Forms / Error Placement（High）**："Show a specific error below the input and reference it with aria-describedby / Don't show only a top-level error"；**Forms / Inline Validation（Medium）**。
- **修法**：说明移到输入框上方一行；下方加实时计数「已识别 N 条 · 丢弃 M 条」，前端复用同一套规则做行内校验（正则见 `net-scope.js:327-355` 的 `HOST_NAME` / `V4_TEXT` / `entryHost`）。
- **风险**：中

#### C-3 保存反馈渲染在页面顶部，不在操作点旁边
- **位置**：`client.js:3382`、`3385`（`noticeNode(notice)` 唯一的渲染点）、`3134`（`saveOverride` 写 notice）、`3459-3462`（own-servers 写 notice）
- **现状片段**：
  ```js
  h(Btn, { ... }, uninstallBusy ? t("btn.uninstall.busy") : t("btn.uninstall")),
  noticeNode(notice),          // 3385  ← 精简模式下唯一渲染点，在页面最上方
  ```
- **为什么冗余**：`PurgifySection` 只有**一个** `notice` state，被「应用 / 还原 / 卸载 / 保存注入 / 恢复默认 / 保存自己的服务器」六处共用，而渲染点固定在动作行（`3382`/`3385`）。在 240px 高的 dock 里，用户滚到「自己的服务器」点保存，**反馈出现在上方 300px 之外，完全看不见** → 表现为"点了没反应"。
  ui-ux-pro-max `--domain ux` → **Forms / Submit Feedback（High）**："Show loading then success/error state / Don't no feedback after submit"；**Accessibility / Error Messages（High）**："Use aria-live or role=alert"。
- **修法**：每个区块自带 `notice`，渲染在区块标题行右侧（`RulesSection` 已经是这个模式：`3617-3620`），并加 `role="status"` / `role="alert"`。
- **风险**：高（功能级误导）

#### C-4 三个按钮语义重叠：保存注入 / 恢复默认 / 应用，都写同一个文件
- **位置**：`client.js:3422`（`saveOverride`）、`3423`（`restoreOverride`）、`3379`（`doAction("apply")`，完整模式）、`3113-3152`、`3154-3186`
- **现状片段**：
  ```js
  onClick: saveOverride    → POST /Xsdsh-purge/override {content}
  onClick: restoreOverride → POST /Xsdsh-purge/override {content: defaultOverride}
  onClick: doAction("apply") → POST /Xsdsh-purge/apply {content}
  ```
- **为什么冗余**：三个按钮都往 `prompt-inject.md` 写内容，用户无法判断该点哪个。`btn.saveInject` 的字面是"保存注入"，但旁边还有一个"应用"。文案层面没有任何区分。
- **修法**：收敛成两个语义：「保存」（写 override 文件，立即生效于新会话）+「恢复默认」（写回默认稿），"应用"只在完整模式下保留并明确文案为"写入补丁"。三者的差异写进折叠详情。
- **风险**：中

#### C-5 「规矩本」四个块没有标题层级，第三块还少一层缩进
- **位置**：`client.js:3616-3747`；`3633-3645`（策略块）、`3646-3685`（本地规则块）、`3686-3746`（列表+编辑器块）
- **现状片段**：
  ```js
  h("div", { className: "xsdsh-block" },
    h("div", { className: "xsdsh-policy-row" },
      h("label", { htmlFor: "xsdsh-policy-select" }, t("policy.title")),   // 3635  ← 不是标题，是 label
  ...
  h("div", { className: "xsdsh-block" },
  h("div", { className: "xsdsh-split" },                                   // 3686-3687  ← 缩进少一层，难读
  ```
- **为什么冗余**：策略块用 `<label>` 当标题（`3635`），本地规则块用 `h4`（`3648`），列表块**完全没有标题**（`3686` 直接进 `xsdsh-split`）。三块视觉权重相同，但语义层级不一致。`3686` 与 `3687` 缩进错位，说明这一块是从别处拼进来的，后续改动极易把闭合括号写错。
  ui-ux-pro-max `--domain ux` → **Typography / Heading Clarity（Medium）**、**Accessibility / Heading Hierarchy（Medium）**。
- **修法**：三块统一 `h3`（块标题）+ 可选一行摘要；策略块的 `label` 改为 `h3` + `<label for>` 双层；重排缩进（见 W-05）。
- **风险**：中

#### C-6 `skills.title` 写成 "Skill"（单数），与列表语义不符
- **位置**：`client.js:385`（zh）、`808`（en）
- **现状片段**：`"skills.title": "Skill"` / `"skills.title": "Skills"`
- **为什么冗余**：中英不一致（中文单数、英文复数），且该 panel 是一个列表。标题在 `h3`（`4036`）上，是页面第二/第三个大标题，用单数名词容易被读成"单个技能"。
- **修法**：中文改「技能（Skill）」或「Skill 列表」；保持中英单复数一致。
- **风险**：低

---

### D. textarea 高度与滚动

#### D-1 一个文本域吃掉整个 dock 的可视高度
- **位置**：`client.js:1054`、`3426-3436`、`1094`、`1093`
- **现状片段**：
  ```css
  .xsdsh-area{min-height:220px;resize:vertical}                 /* 1054 */
  .xsdsh-editor .xsdsh-area{flex:1;min-height:240px}            /* 1094 */
  .xsdsh-editor{...;min-height:320px}                           /* 1093 */
  ```
- **为什么冗余**：dock 最小高度 240px（`9768`），默认高度约 520-640px。提示词文本域硬编码 `min-height:220px` —— **在最小 dock 里一个文本域就占满全部可视高度**，下面的「自己的服务器」必须滚动才能看到。规矩本编辑器再叠 `320 + 240`，Skills 编辑器同样，三处加起来接近 900px 固定高度。
  ui-ux-pro-max `--domain ux` → **Accessibility / Text Reflow and Spacing（Critical）**："Use fluid sizes content-driven height… Don't clip text in fixed-width or fixed-height boxes"。
- **修法**：`min-height` 改成分级 `clamp()`（如 `clamp(96px, 22vh, 240px)`），并按区块折叠状态决定是否渲染编辑器；编辑器默认折叠，点条目才展开。
- **风险**：高

#### D-2 双重滚动条：外层 `.xsdsh-root` 滚动 + `.xsdsh-rulebody` 内层滚动
- **位置**：`client.js:1137`（外层 `overflow:auto`）、`1082`（`.xsdsh-rulebody{max-height:240px;overflow:auto}`）、`3689`、`4042`
- **现状片段**：
  ```css
  .xsdsh-dock-body .xsdsh-root{...;overflow:auto}                       /* 1137 */
  .xsdsh-rulebody{max-height:240px;overflow:auto}                        /* 1082 */
  ```
- **为什么冗余**：页面已经有一个滚动容器，列表再套一个 240px 的滚动区。在窄 dock 里滚轮落在列表上会**先滚列表、滚到底再滚页面**（scroll chaining），用户感觉"页面卡住不动了"。`max-height:240px` 又是硬编码，与 D-1 冲突。
  ui-ux-pro-max `--domain ux` → **Layout / Overflow Hidden（Medium）**、**Accessibility / Focus Not Obscured (Minimum)（High）**（"Offset sticky UI with scroll-padding… Don't let headers footers banners fully cover focus"）。
- **修法**：去掉 `.xsdsh-rulebody` 的 `max-height/overflow`，让列表跟随页面滚动；若必须限高，改用 `overscroll-behavior: contain` 阻断链式滚动。
- **风险**：中

#### D-3 文本域没有 label、没有 id、没有 `aria-describedby`
- **位置**：`client.js:3426-3436`（提示词）、`3468-3475`（自己的服务器）、`3729-3734`（规则正文）、`4097-4104`（Skill 正文）
- **现状片段**：
  ```js
  h("textarea", { className: "xsdsh-area", value: content, onChange: ..., placeholder: "" }),   // 3729-3734
  ```
- **为什么冗余**：四个文本域全靠"位置"表达含义，`placeholder` 还是空字符串。屏幕阅读器只会念 "textarea"。
  ui-ux-pro-max `--domain ux` → **Accessibility / Form Labels（High）**："Use label with for attribute or wrap input / Don't placeholder-only inputs"。
- **修法**：每个文本域加 `id` + 可见 `<label for>`（或 `aria-label`）+ `aria-describedby` 指向对应 hint。
- **风险**：中

---

### E. 规则列表 + 编辑器双栏在小 dock 宽度被挤压

#### E-1 `.xsdsh-split` 是**纵向** flex，不是双栏 —— 但两处调用都按"左列表右编辑器"的思路写
- **位置**：`client.js:1080`、`3687`、`4040`
- **现状片段**：
  ```css
  .xsdsh-split{display:flex;flex-direction:column;gap:12px}    /* 1080 */
  ```
- **为什么冗余**：类名叫 `split`（暗示左右分栏），实现是 `column`。于是「列表 240px + 新建行 + 编辑器 320px」纵向叠成 600px+。若按类名理解去改宽度，会立刻在 380px dock 里挤压（`create-row` 里三个控件 `3691-3714`：input + input + select(120px) + button，在 380px 宽度下必然换行/溢出）。
  ui-ux-pro-max `--domain ux` → **Layout / Long Token Wrapping（High）**："URLs identifiers and user content must not force horizontal overflow / Do use overflow-wrap anywhere and let flex or grid text children shrink"；**Responsive / Horizontal Scroll（High）**。
- **修法**：明确两种布局：≥520px 用 `grid-template-columns: minmax(180px, 34%) 1fr`；<520px 回退单列，编辑器以「抽屉/内联展开」形式出现在被点条目下方。`create-row` 改 `flex-wrap: wrap` 并给每个 `xsdsh-field` `min-width:0`。
- **风险**：高

#### E-2 新建行的三个控件没有 `min-width:0`，在窄 dock 里会撑破
- **位置**：`client.js:1091-1092`、`3690-3714`
- **现状片段**：
  ```css
  .xsdsh-create-row{display:flex;gap:6px;align-items:center}       /* 1091 */
  .xsdsh-create .xsdsh-field{flex:1;min-width:0;width:auto}        /* 1092 */
  ```
  ```js
  h("select", { className: "xsdsh-field", style: { minWidth: 120, flex: "0 0 auto" }, ... })  // 3694
  ```
- **为什么冗余**：`1092` 只覆盖了 `.xsdsh-create` 内的 field，`3694` 又内联写死 `minWidth:120`。三个控件最小宽度 140+140+120+按钮≈480px，**在 380px dock 里必然溢出**。`flex-wrap` 没设。
- **修法**：`xsdsh-create-row` 加 `flex-wrap:wrap`；两个 input 的 `min-width` 降到 88px；`select` 的 `minWidth:120` 改成 `flex:1 1 96px`。
- **风险**：中

#### E-3 列表项整行是 `role="button"`，里面又嵌了两个真按钮
- **位置**：`client.js:3571-3607`（规则）、`3997-4030`（Skill）
- **现状片段**：
  ```js
  h("div", { className: "xsdsh-ruleitem...", role: "button", tabIndex: 0, onClick: () => openRule(r.id), onKeyDown: ... },
    h("div", { className: "xsdsh-rule-ops" },
      h(Btn, { ... onClick: (e) => { e.stopPropagation(); doPost("activate", ...) } }, ...),
  ```
- **为什么冗余**：`div[role=button]` 里嵌真 `<button>`，是嵌套交互控件；键盘 Tab 会先到行、再到行内按钮，`Enter` 在行上触发 `openRule`、在按钮上触发启用 —— 行为不一致且无 `aria-pressed`。
  ui-ux-pro-max `--domain ux` → **Accessibility / Compact Control Semantics（Critical）**："Prefer a button and expose pressed or selected state / Don't use a clickable div"。
- **修法**：整行改为 `<li>` + 行内一个"打开"按钮 + 独立操作按钮组；选中态用 `aria-current="true"`。
- **风险**：中

#### E-4 编辑器空态占位 160px，且与列表各占一半高度
- **位置**：`client.js:1095`、`3743`、`4113`
- **现状片段**：`.xsdsh-editor-empty{flex:1;display:flex;...;min-height:160px}`
- **为什么冗余**：没选中条目时，编辑器仍占 320px 高、内部居中一行「翻一条规矩」——**160px 空白只为说一句话**。在 240px 高的 dock 里这等于整屏空白。
  ui-ux-pro-max `--domain ux` → **Feedback / Empty States（Medium）**："Show helpful message and action / Don't blank empty screens"。
- **修法**：空态不渲染编辑器容器，只在列表底部给一行提示（或直接把编辑器折叠掉）。
- **风险**：中

---

### F. Rules / Skills 无标题层级、无说明

#### F-1 两个 panel 的 `h3` 之间没有任何过渡说明
- **位置**：`client.js:3616-3619`、`4034-4039`
- **现状片段**：
  ```js
  h("section", { className: "xsdsh-panel", "aria-label": t("rules.title") },
    h("div", { className: "xsdsh-head" }, h("h3", { className: "xsdsh-title" }, t("rules.title")), ...   // 3617-3618
  ```
- **为什么冗余**：`rules.title` = "规矩本"、`skills.title` = "Skill"，两个 `h3` 直接相邻（中间只隔 root 的 18px gap），没有任何一句话解释"规矩本和 Skill 有什么区别、什么时候用哪个"。用户看到两个陌生名词并列。
- **修法**：每个 panel 标题下加一行 ≤30 字摘要（规矩本=写进 AGENTS.md 的长期指令；Skill=按需加载的技能包），完整说明折叠。
- **风险**：中

#### F-2 Skills 面板在版本门控下**静默消失**
- **位置**：`client.js:3750-3759`（`skillUiAllowed`）、`3987`（`if (!onBeta) return null;`）
- **现状片段**：
  ```js
  function skillUiAllowed(d) { ... return +parts[3] >= 12; }   // 3750-3759
  ...
  if (!onBeta) return null;                                     // 3987
  ```
- **为什么冗余**：低版本宿主下整个 Skill 面板返回 `null`，**页面上不留任何痕迹**，用户不知道为什么"Skill 那块没了"。同时 `SkillsSection` 挂载时会先 `GET /status`（`3856`）再可能 `POST /skills {op:status}`（`3868`）—— 两次请求拿同一份数据。
- **修法**：门控不满足时渲染一行说明（"当前宿主版本不支持在面板里管理 Skill，需 ≥1.1.12"）；状态只取一次（`/status` 已带 `skills`，见 `lib/index.js:1901`）。
- **风险**：中

---

### G. 危险操作位置

#### G-1 精简模式下「卸载」是页面上唯一的按钮，且在最上方
- **位置**：`client.js:3383-3386`
- **现状片段**：
  ```js
  ) : h("div", { className: "xsdsh-row", style: { marginTop: 14 } },
    h(Btn, { kind: "solid-danger", ... onClick: () => setAskUninstall(true) }, uninstallBusy ? t("btn.uninstall.busy") : t("btn.uninstall")),
    noticeNode(notice),
  ),
  ```
- **为什么冗余**：`FULL_CLEAN_PANEL=false` 时这一行只剩一个 `solid-danger` 卸载按钮，位置在提示词文本域**上方**（`3383` < `3426`）。用户的视觉动线是：进页面 → 第一个可点元素是红色的「卸载」。危险操作抢占了主操作位。
  ui-ux-pro-max `--domain ux` → **Interaction / Confirmation Dialogs（High）**："Prevent accidental destructive actions"；**Navigation / Active State（Medium）**（主操作位应给主任务）。
- **修法**：卸载移到页面最底部独立「危险区」，与其它操作之间加 `border-top` + 说明文字；主操作位留给「保存」。
- **风险**：高

#### G-2 两套确认交互并存：自定义 modal 与 `window.confirm`
- **位置**：`client.js:3387-3402`（卸载用自定义 modal）、`3602`（删规则用 `window.confirm`）、`3626`（复原用 `window.confirm`）、`4024`（删 Skill 用 `window.confirm`）
- **现状片段**：
  ```js
  if (!window.confirm(t("confirm.delete", { id: r.id }))) return;   // 3602
  if (!window.confirm(t("rules.reset.confirm"))) return;            // 3626
  ```
- **为什么冗余**：同一个页面里，删除规则弹系统原生 confirm（无主题、无焦点管理、在 Electron 里样式不受控），卸载却弹自定义 modal。用户对"这个操作危不危险"的感知完全取决于实现者随手用了哪个。
  全文件 `window.confirm` 共 **9** 处：清洗页 3 处（`3602` 删规则、`3626` 复原、`4024` 删 Skill）、`2904/2922`（已废弃的通道切换，随 W-11 删除）、`10388-10393`（改写页的 `ask()` 安全包装）。
  **关键旁证**：`test/preset-prompts.test.mjs:381-394` 已经立了一条规则——"不直接依赖 window.confirm（桌面端可能禁用它）"，要求业务代码必须走 `ask()` 包装、内部 `try/catch`、结果严格 `=== true`。但**这条守卫只扫 `PromptsTab` 区间**（`382-383` 用 `indexOf("function PromptsTab()")` 到 `indexOf("function RewriteTab()")` 切片），清洗页完全在射程之外。也就是说团队已经认定原生 confirm 不可靠，却漏了清洗页这三处。
- **修法**：统一到一个 `ConfirmDialog` 组件（复用 `3387-3402` 的结构），危险等级用按钮 `kind` 区分；顺手把 `10388-10393` 的 `ask()` 兜底收敛进同一组件。
- **风险**：中

#### G-3 卸载 modal 没有 Esc、没有焦点陷阱、没有初始焦点
- **位置**：`client.js:3387-3402`
- **核对数据**：全文件 `grep 'Escape'` 只命中 **1** 处 —— `client.js:9427`（演练台全屏退出的 `onKey`），与清洗页无关；`grep '\.focus()'` 命中 **0** 次（全文件没有任何主动聚焦）。即：清洗页的两个对话框（卸载 modal `3387`、重启询问 `3405`）**都没有 Esc、没有初始焦点、没有焦点陷阱**。
- **现状片段**：
  ```js
  h("div", { className: "xsdsh-modal-bg", role: "dialog", "aria-modal": "true",
    "aria-labelledby": "xsdsh-uninstall-title",
    onClick: (e) => { if (e.target === e.currentTarget && !uninstallBusy) setAskUninstall(false); },
  ```
- **为什么冗余**：只有遮罩点击关闭，**键盘用户按 Esc 无反应**，Tab 会跑到遮罩后面的页面元素上（无 focus trap），打开时焦点不落在对话框内。
  ui-ux-pro-max `--domain ux` → **Accessibility / Keyboard Navigation（High）**、**Interaction / Focus States（High）**、**Accessibility / Focus Not Obscured (Minimum)（High）**。
- **修法**：加 `keydown` Esc 关闭、`focus()` 初始焦点到「取消」、Tab 循环限制在 modal 内、关闭后焦点回落到触发按钮。
- **风险**：中（无障碍），高（如果评审要求 WCAG 2.2 AA）

#### G-4 「还原」按钮与「应用」并列，都是 `marginTop:14` 的一行，没有二次确认
- **位置**：`client.js:3378-3382`
- **现状片段**：
  ```js
  h(Btn, { kind: "primary", ... doAction("apply") }, ...),
  h(Btn, { kind: "danger", ... doAction("revert") }, t("btn.revert")),
  h(Btn, { kind: "solid-danger", ... setAskUninstall(true) }, ...),
  ```
- **为什么冗余**：三个按钮并排：主色"应用"、危险描边"还原"、实心危险"卸载"。还原会覆盖补丁文件（有备份但用户不读），却**没有确认弹窗**，而卸载有。
- **修法**：还原加确认（或至少加 `title` 说明"从 .xsdshpurge.bak 恢复"）；三个按钮之间留视觉分组（危险区独立）。
- **风险**：中

---

### H. 死代码与重复请求（"冗杂"的代码侧根因）

#### H-1 一整条「更新通道」逻辑留在组件里，`renderEdition` 从未被调用
- **位置**：`client.js:2814-2827`（state）、`2843-2853`（`syncPicks`）、`2862-2883`（`applyUpdateInfo`）、`2887-2890`（`checkUpdate`）、`2892`（`saveSource`）、`2894`（`postUpdate`）、`2896-2899`（`doUpdate`）、`2901-2913`（`changeChannel`）、`2915-2933`（`switchSelected`）、`3257-3319`（`versions` / `channelNow` / `renderEdition`）
- **现状片段**：
  ```js
  const renderEdition = (id) => { ... };   // 3260-3319，全文件调用次数 = 0
  ```
- **为什么冗余**：`renderEdition` 定义 60 行、引用 0 次；`sourceRepo/setSourceRepo`、`sourceBusy/setSourceBusy`、`updateJob/setUpdateJob`、`setUpdateBusy` 都是**只声明不读**（各自只出现 1 次）。`3337` 的注释已经写明"更新源 / 版本通道 / 检测更新 已整体移除"，但 240 行配套代码还在。这直接造成改这块时"看不出哪些还有用"。
  **词典侧的量化**（已核对）：`"update.*"` 共 **79** 个键、`"channel.*"` 共 **17** 个键、`"btn.checkUpdate*"` / `"btn.doUpdate*"` 各 **6** 个键（zh+en 成对）。其中 `t("update.*")` / `tr("update.*")` 的**19 处调用**全部落在 `2857-3315` 与 `3824-3825`（`versionChoiceLabel`，只被 `renderEdition` 调用）——即全部是死代码。`t("channel.*")` 的调用有 4 处：`2904`（死）、`3282/3297/3300`（`renderEdition` 内，死）、**`3334`（`channel.local`，在被门控的 `xsdsh-rel` 版本区里，W-01 若保留版本区则此键要留）**。
- **修法**：删除 H-1 列出的全部死代码；词典按上述量化删除 `update.*` / `channel.*`（**保留 `channel.local`，若 W-01 决定连版本区一起删则可一并删**）/ `btn.checkUpdate*` / `btn.doUpdate*`；保留 `detectHostTheme` 等仍被用的函数。删键前后必须跑 W-18 的 zh/en 对齐脚本。
- **风险**：低（但删错会白屏，需按 §4 跑全量测试）

#### H-2 挂载时对同一份数据发 6 次请求，其中 2 次重复
- **位置**：`client.js:2935-2976`（`loadAll`：status + override + own-servers）、`2617-2621`（hooks-deny）、`3501-3519`（rules status）、`3856-3868`（status → 可能再 skills status）
- **现状片段**：
  ```js
  apiJson("/Xsdsh-purge/status") ...       // 2937
  apiJson("/Xsdsh-purge/override") ...     // 2953
  apiJson("/Xsdsh-purge/own-servers") ...  // 2968
  // HooksDenySection:
  apiJson("/Xsdsh-purge/hooks-deny") ...   // 2618
  // SkillsSection:
  apiJson("/Xsdsh-purge/status") ...       // 3856  ← 第二次 /status
  ```
- **为什么冗余**：`GET /status` 已经返回 `hooks_deny_bypass`（`lib/index.js:1900`）和 `skills`（`1901`），但客户端**两个字段都没用**（`grep hooks_deny_bypass` 在 client.js 命中 0 次），反而各自再发一次请求。于是"同一个开关有两个数据源"，`HooksDenySection` 的本地 `cfg` 与 `state.hooks_deny_bypass` 可能不一致。
  **还有一层**：`2978-2982` 在挂载后又挂了一个 `setTimeout(loadAll, 5000)` —— 5 秒后**再把 status + override + own-servers 全拉一遍**。`/override` 的响应含完整正文（默认稿约 20KB 级），每开一次面板就白拉两遍。`promptSeededRef`（`2831`、`2959-2962`）挡住了二次 seeding，所以不会覆盖用户输入，但请求开销实打实。
- **修法**：以 `/status` 为唯一快照，删掉 `HooksDenySection` 的独立 GET 与 `SkillsSection` 的重复 GET；开关的 POST 响应写回父级 state；5 秒补拉改成"仅补 status"或改成用户点刷新，且不再重拉 `/override`。
- **风险**：中（改错会让开关显示滞后）

#### H-3 `ContinueRetrySection` 调用的 `/continue/settings` 路由在后端不存在
- **位置**：`client.js:2666-2766`（组件）、`2673`、`2685`；`lib/index.js` 全文无 `"/Xsdsh-purge/continue` 路由
- **现状片段**：
  ```js
  apiJson("/Xsdsh-purge/continue/settings")   // 2673  GET
  apiJson("/Xsdsh-purge/continue/settings", { method: "POST", ... })   // 2685
  ```
- **为什么冗余**：该组件已被注释掉不挂载（`3418`：`// h(ContinueRetrySection, null),`），且它请求的接口**根本不存在**（`lib/index.js` 只有 `continue-retry.js` 的模块导入与 `installContinueRetry`，无 HTTP 路由）。一旦有人把它放开，会稳定拿到 404。后端确有 `continueRetry.loadSettings/settingsPath`（`lib/continue-retry.js`），但没有暴露 HTTP。
- **修法**：二选一 —— (a) 删除组件并清理 `continue.*` 词典；(b) 补 `GET/POST /Xsdsh-purge/continue/settings` 路由后再挂载。**推荐 (a)**，续跑设置不属于清洗页。
- **风险**：中（留着一个"看起来能用其实 404"的组件是维护陷阱）

#### H-4 未定义的设计令牌 `--xsdsh-danger`
- **位置**：`client.js:3403`、`3439`
- **现状片段**：
  ```js
  style: { margin: "8px 0 0", color: "var(--xsdsh-danger, #c44)", fontSize: 12 }
  ```
- **为什么冗余**：`--xsdsh-danger` 在全文件**从未定义**（定义的是 `--xsdsh-bad`，`975`/`977`），所以永远落到兜底 `#c44` —— 而这个红色不属于主题色板，暗色模式下对比度与 `--xsdsh-bad`（`#f0b4b4`）不一致。
  ui-ux-pro-max `--domain ux` → **Accessibility / Color Contrast（High）**："Minimum 4.5:1 ratio"；**Accessibility / Color Only（High）**："Don't convey information by color alone / 红字需配图标或文字"。
- **修法**：改用 `var(--xsdsh-bad)`，并给警告行加前缀图标或「注意：」文字。
- **风险**：低（视觉），中（暗色可读性）

#### H-5 17 处内联 hint 样式重复，改一次要改 17 处
- **位置**：全文件 `color: "var(--xsdsh-(mute|danger"` 共 17 处；典型：`2651`、`3403`、`3404`、`3439`、`3476`、`4039`
- **现状片段**：
  ```js
  h("p", { className: "xsdsh-hint", style: { margin: "8px 0 0", color: "var(--xsdsh-mute)", fontSize: 12 } }, t("own.hint")),  // 3476
  ```
- **为什么冗余**：`.xsdsh-hint` 在 CSS 里已经有 `font:11.5px/1.55` 和 `color:var(--xsdsh-mute)`（`1044`），JS 里又逐处覆盖 `fontSize:12` + `color` + `margin`。字号出现 11.5 / 12 / 13 三种。
  ui-ux-pro-max `--domain ux` → **Typography / Font Size Scale（Medium）**："Use consistent modular scale / Don't arbitrary sizes"。
- **修法**：删掉内联样式，改为 `.xsdsh-hint` + `.xsdsh-hint.is-warn` 两个类；统一字号 12px。
- **风险**：低

---

## 3. 改动清单（可执行工单）

**执行顺序建议**：W-01 → W-02 → W-03 → W-04 →（其余可并行）→ W-16 收尾。
**所有条目默认只动 `client.js`；涉及 `lib/index.js` 的条目已单独标注。**
**每条都必须先按 §0 重新核对行号。**

---

### W-01 拆掉 `FULL_CLEAN_PANEL`，改为「区块开关表」
- **目标文件**：`client.js`
- **函数/区块**：`PurgifySection`（`2795` 起）、`3325`（常量）、`3327-3386`（return）
- **改什么**：
  1. 删除 `const FULL_CLEAN_PANEL = false;`（`3325`）及其注释（`3320-3324`）。
  2. 新增模块级常量 `CLEAN_BLOCKS = [{ id:"patches", on:true }, { id:"hooks", on:true }, { id:"prompt", on:true }, { id:"own", on:true }, { id:"danger", on:true }]`，并新增 `useBlockPrefs()`（读 `localStorage["xsdsh.clean.blocks"]`，缺省全 `true`）。
  3. `return h("section", ...)` 内改为按 `CLEAN_BLOCKS` 顺序 map 渲染，**不再用三元门控**。
  4. 保留 `PatchGroups` / `HooksDenySection` 的组件定义与挂载（它们必须仍在渲染树里，见 §4 测试）。
- **验收标准**：
  - `grep -c "FULL_CLEAN_PANEL" client.js` → `0`。
  - 清洗页首屏（默认 dock 620×520）同时可见：区块标题、提示词区、自己的服务器区；滚动到底可见危险区。
  - 关掉 `hooks` 开关后刷新，Hooks 区块仍不渲染，且 `localStorage["xsdsh.clean.blocks"]` 里 `hooks:false`。
  - `node test/settings-render.test.mjs` 与 `node --test test/preset-prompts.test.mjs` 通过（改完测试后，见 §4）。
- **需同步改的测试**：`test/preset-prompts.test.mjs:490-539`（整组重写）、`test/settings-render.test.mjs:251-265`（勾选框数量断言重写）。
- **风险**：高

---

### W-02 三个 panel 合并为一页「区块卡片栅格」
- **目标文件**：`client.js`
- **函数/区块**：`SettingsRoot`（`4465-4516`，尤其 `4508-4515`）
- **改什么**：
  1. `4508` 的 `div.xsdsh-root` 内不再平铺三个 section；改为
     `h("div", { className: "xsdsh-grid" }, h(PurgifySection,...), h(RulesSection,...), h(SkillsSection,...))`。
  2. 新增 CSS：
     ```css
     .xsdsh-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;align-items:start}
     @media (max-width:520px){.xsdsh-grid{grid-template-columns:1fr}}
     ```
  3. `RulesSection` / `SkillsSection` 的根节点从 `section.xsdsh-panel` 改为 `div.xsdsh-card`（新增类），样式：`border:1px solid var(--xsdsh-line);border-radius:10px;padding:12px;background:var(--xsdsh-paper)`。
- **验收标准**：
  - dock 宽 ≥ 640 时，规矩本与 Skill 并排两列；dock 宽 ≤ 520 时单列。
  - 页面总高（620×520 视口）从改前 >1400px 降到 ≤ 2 屏。
  - `docs/preview/dock-clean.png` 对照截图无"框中框"。
- **需同步改的测试**：`test/settings-render.test.mjs:227-232`（断言两份 `<style>` 与 `.xsdsh-root` 存在 —— 不变即可过）、`test/titlebar-drag.test.mjs:63-68`（fixture HTML 里 `xsdsh-panel` 只是占位，不需改，但若删掉 `.xsdsh-panel` 类名需确认 `test/titlebar-drag.test.mjs:142` 的 `.xsdsh-dock,` 选择器断言仍通过）。
- **风险**：中

---

### W-03 统一区块组件：标题 + 一行摘要 + 折叠详情 + 区块级 notice
- **目标文件**：`client.js`
- **函数/区块**：新增 `Block({ id, title, summary, notice, children, defaultOpen })`，放在 `Btn`（`2515`）之后
- **改什么**：
  1. 结构：
     ```js
     h("section", { className: "xsdsh-card", "aria-labelledby": "blk-" + id },
       h("div", { className: "xsdsh-card-head" },
         h("h3", { id: "blk-" + id, className: "xsdsh-card-title" }, title),
         notice ? h("span", { role: "status", "aria-live": "polite", className: "xsdsh-notice ..." }, notice.text) : null),
       summary ? h("p", { className: "xsdsh-card-summary" }, summary) : null,
       h("div", { className: "xsdsh-card-body" }, children))
     ```
  2. 摘要长度硬约束 ≤ 30 个汉字；完整说明进 `<details class="xsdsh-more"><summary>这是什么</summary>…</details>`。
  3. 新增 CSS：`.xsdsh-card-summary{font:12px/1.5 var(--xsdsh-sans);color:var(--xsdsh-mute);margin:2px 0 8px}`
- **验收标准**：
  - 每个区块都有 `h3` + 摘要；`grep -c 'role: "status"'` ≥ 3。
  - 摘要文案全部 ≤ 30 字（可用 `node -e` 扫词典值长度）。
  - 屏幕阅读器按 `h` 键跳转顺序为：清洗页标题 → 各区块 `h3`（无 `h4` 出现在首个 `h3` 之前）。
- **需同步改的测试**：新增断言（建议并入 `test/settings-render.test.mjs`）：每个区块必须有 `h3`，且第一个标题不是 `h4`。
- **风险**：中

---

### W-04 改写「Hook 拦截 / 提示词 / 自己的服务器 / 规矩本」四处人话文案
- **目标文件**：`client.js`
- **函数/区块**：词典 `zh`（`127-549`）与 `en`（`550-974`），键：`hooksDeny.hint`（`532`/`955`）、`hooksDeny.bypass`（`531`/`954`）、`own.hint`（`215`/`638`）、`policy.hint`（`365`/`788`）、`cwd.hint`（`369`/`792`）、`skills.hint`（`386`/`809`）、`warn.noInject`（`241`/`664`）
- **改什么**：
  1. 新增 `override.hint`（zh/en 各一条，≤30 字摘要 + `override.hintMore` 折叠详情）。文案必须回答：这框里的字会去哪（`prompt-inject.md`）、什么时候生效（新会话/重启）、和「模式提示词」的区别。
  2. `hooksDeny.hint` 删除「改完后点「应用」并重启」这类按钮指代；改为一句话摘要 + 详情里说明"需要重新写入宿主文件才生效"。
  3. `hooksDeny.bypass` 标签去掉补丁编号，编号进详情。
  4. `own.hint` 把「每行一个…」提到摘要第一句，并说明"保存后会立即生效/只放行这些主机"。
  5. 每条 `*.hint` 新增对应 `*.hintMore`（≤200 字），供 `<details>` 使用。
- **验收标准**：
  - `grep -c '"override.hint"' client.js` → `2`（zh+en）。
  - 所有 `*.hint` 值长度 ≤ 60 字符；所有 `*.hintMore` ≤ 220 字符。
  - 文案里不再出现「点「应用」」「补丁 30」等实现/按钮指代（`grep '点「应用」' client.js` → 0，除完整模式专用文案）。
- **需同步改的测试**：`test/preset-prompts.test.mjs:536` 断言 `CLIENT.includes('"hooksDeny.title"')` —— 保留 `hooksDeny.title` 键即可通过；若删键必须同步改该行。
- **风险**：低

---

### W-05 重排「规矩本」四块结构，统一标题层级
- **目标文件**：`client.js`
- **函数/区块**：`RulesSection`（`3486-3748`），重点 `3633-3645`（策略）、`3646-3685`（本地规则）、`3686-3746`（列表+编辑器）
- **改什么**：
  1. 策略块：`h("label", { htmlFor: "xsdsh-policy-select" }, t("policy.title"))`（`3635`）改为
     `h("h4", { id: "xsdsh-policy-title" }, t("policy.title"))` + `h("label", { htmlFor: "xsdsh-policy-select", className: "xsdsh-sr" }, t("policy.title"))`（视觉隐藏 label）。
  2. 列表+编辑器块补 `h4` 标题（`t("rules.listTitle")`，新增键）；修正 `3686-3687` 的缩进错位（`xsdsh-split` 应为 block 的子节点，闭合括号对齐）。
  3. 三块之间用 `.xsdsh-block` 的 `border-top` 分隔，不再各自加 margin。
- **验收标准**：
  - `node --check` 等价检查：`node -e "new Function(require('fs').readFileSync('client.js','utf8'))"` 不抛错（注意 client.js 是模块工厂，实际用 `test/settings-render.test.mjs` 的载入即验证）。
  - 规矩本内 `h4` 数量 = 3；策略 select 仍有 `htmlFor` 关联。
  - `node test/settings-render.test.mjs` 通过。
- **需同步改的测试**：`test/settings-render.test.mjs:168-181`（`renderSettings` 会渲染 `RulesSection`，改动后仍需不抛错）。
- **风险**：中

---

### W-06 文本域高度改为分级 `clamp()`，编辑器默认折叠
- **目标文件**：`client.js`
- **函数/区块**：CSS `1054`、`1093`、`1094`；`3426-3436`、`3468-3475`、`3729-3734`、`4097-4104`
- **改什么**：
  1. `1054` 改：`.xsdsh-area{min-height:clamp(96px,22vh,240px);resize:vertical}`。
  2. `1093` `min-height:320px` → `min-height:0`；`1094` `min-height:240px` → `min-height:clamp(96px,22vh,220px)`。
  3. 提示词文本域加 `rows: 6` 并保留 `resize:vertical`；「自己的服务器」文本域 `rows:4` 保持不变但去掉内联 `minHeight:96`（交给 CSS）。
- **验收标准**：
  - dock 高 240px 时，首屏能同时看到提示词标题 + 至少 3 行文本域 + 保存按钮。
  - 无 `min-height:220px` 字面量残留（`grep 'min-height:220px' client.js` → 0）。
  - 拖拽 `.xsdsh-dock-resize` 改高度时文本域跟随，不出现内容被裁切。
- **需同步改的测试**：`test/settings-render.test.mjs:231-234`（断言 `LOOK_CSS` 片段，不受影响）；`test/look-layout.test.mjs`（只解析 `LOOK_CSS`，不受影响）。
- **风险**：中

---

### W-07 去掉列表内层滚动，修 scroll chaining
- **目标文件**：`client.js`
- **函数/区块**：CSS `1082`、`3689`、`4042`
- **改什么**：`.xsdsh-rulebody{max-height:none;overflow:visible;overscroll-behavior:contain}`；若确实需要限高，改用 `.xsdsh-rulebody{max-height:min(40vh,360px);overflow:auto;overscroll-behavior:contain}`。
- **验收标准**：
  - dock 内滚轮滚动时页面连续滚动，列表区域不出现独立滚动条（除非列表 > 40vh）。
  - 键盘 Tab 到列表项时页面自动滚动使其可见（`scroll-margin-block: 48px` 加在 `.xsdsh-ruleitem`）。
- **需同步改的测试**：无（纯 CSS）。
- **风险**：低

---

### W-08 `.xsdsh-split` 改为真双栏 + 窄屏回退
- **目标文件**：`client.js`
- **函数/区块**：CSS `1080`、`1091-1092`；调用点 `3687`、`4040`
- **改什么**：
  ```css
  .xsdsh-split{display:grid;grid-template-columns:1fr;gap:12px}
  @media (min-width:520px){.xsdsh-split{grid-template-columns:minmax(180px,34%) minmax(0,1fr)}}
  .xsdsh-create-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .xsdsh-create-row .xsdsh-field{flex:1 1 88px;min-width:0}
  ```
  并把 `3694` 的 `style: { minWidth: 120, flex: "0 0 auto" }` 改为 `style: { flex: "1 1 96px", minWidth: 0 }`。
- **验收标准**：
  - dock 宽 380px：列表与编辑器上下排列，`create-row` 自动换行，无横向溢出（`document.scrollingElement.scrollWidth <= clientWidth`）。
  - dock 宽 620px：左右两栏，列表列宽 ≈ 34%。
- **需同步改的测试**：新增窄屏断言（建议并入 `test/look-layout.test.mjs` 的思路，用真 Chromium 量 `scrollWidth`）。
- **风险**：中

---

### W-09 列表项去掉嵌套交互，改语义化结构
- **目标文件**：`client.js`
- **函数/区块**：`3571-3607`（规则项）、`3997-4030`（Skill 项）
- **改什么**：
  1. 外层 `div[role=button][tabIndex=0]` → `<li>`，行内加一个真 `<button className="xsdsh-rule-open">` 承载「打开编辑器」。
  2. 当前选中项加 `aria-current="true"`（替代 `is-edit` 的纯视觉表达）。
  3. 行内两个操作按钮保留 `e.stopPropagation()` 可删（不再需要）。
- **验收标准**：
  - 键盘 Tab 顺序：行内「打开」→「启用」→「删除」，无重复焦点。
  - `Enter` 在「打开」上只打开编辑器；在「启用」上只启用。
  - 屏幕阅读器读出当前项为 current。
- **需同步改的测试**：新增断言（`settings-render`）：列表项内 `button` 数量 = 3 且外层不是 `role=button`。
- **风险**：中

---

### W-10 编辑器空态不占位
- **目标文件**：`client.js`
- **函数/区块**：CSS `1095`；`3743`、`4113`
- **改什么**：`.xsdsh-editor-empty{min-height:0;padding:12px 0;justify-content:flex-start}`；并把 `3743`/`4113` 的空态从编辑器容器内移出，改为列表底部一行提示。
- **验收标准**：未选中条目时，规矩本区块高度减少 ≥ 160px（620×520 视口下）。
- **需同步改的测试**：无。
- **风险**：低

---

### W-11 删除死代码：更新通道 + `ContinueRetrySection`
- **目标文件**：`client.js`
- **函数/区块**：H-1 与 H-3 列出的全部行
- **改什么**：
  1. 删 `2814-2827` 中只读不用的 state：`updateBusy/setUpdateBusy`、`sourceRepo/setSourceRepo`、`sourceBusy/setSourceBusy`、`updateJob/setUpdateJob`、`canApplyUpdate/setCanApplyUpdate`（确认 `canApplyUpdate` 仅被 `renderEdition` 读）。
  2. 删 `2843-2853`、`2862-2883`、`2887-2890`、`2892`、`2894`、`2896-2899`、`2901-2913`、`2915-2933`、`3257-3319`。
  3. 删 `2666-2766`（`ContinueRetrySection`）与 `3418` 的注释行。
  4. 删对应词典键（**已核对用量，按此清单删，别多删**）：
     - `update.*`（zh/en 各 79 个键）：全部调用点都在死代码里（`2857-3315`、`3824-3825`），可整族删。
     - `btn.checkUpdate*` / `btn.doUpdate*`（各 6 个键）：同上，可删。
     - `channel.*`（17 个键）：`2904`/`3282`/`3297`/`3300` 都是死代码，但 **`3334` 用了 `channel.local`**。若 W-01 保留版本区 → **必须保留 `channel.local`**；若连版本区一起删 → 17 个全删。
     - `continue.*`：**只删 UI 专用的 6 个**（`continue.title` / `continue.hint` / `continue.autoRetry` / `continue.retryMax` / `continue.autoContinue` / `continue.continueMax` / `continue.text`，zh `534-540`、en `957-963`）。**`continue.label` / `continue.aria` / `continue.busy` / `continue.ready` / `continue.limit` / `continue.fail` 必须保留** —— 它们被 `RewindContinue`（`4825`、`4838`、`4841`、`4889`、`4896-4908`）使用，删了会话里的「继续」按钮会显示原始键名。
  5. `loadAll`（`2935-2976`）中删除 `if (d.update && ...) setUpdateInfo(...)`（`2942`）与 `if (d.channel) setChannel(...)`（`2941`）。
- **验收标准**：
  - `grep -E "renderEdition|sourceRepo|updateJob|continue/settings|ContinueRetrySection" client.js` → 0 命中。
  - `grep -c '"continue\.label"' client.js` → 仍为 `5`（2 处在 zh/en 词典、3 处在 `RewindContinue` 的 `rewindText(...)` 调用里；当前实测就是 5，删完不许变少）。
  - `grep -c 'rewindText(.*"continue\.' client.js` → 仍为 `3` 组（`4825`、`4841`、`4896-4908` 一带），证明会话内「继续」按钮文案没断。
  - `client.js` 行数减少 ≥ 380 行（当前 12955）。
  - 全量测试通过（§4）。
- **需同步改的测试**：`test/settings-render.test.mjs`（渲染链更短，断言不变）、`test/preset-prompts.test.mjs:531-539`（若删 `hooksDeny.title` 会撞，注意别删这个键）。
- **风险**：中（删除面大，必须跑全量；`continue.*` 误删会打坏会话内「继续」按钮）

---

### W-12 以 `/status` 为唯一快照，删重复请求与 5 秒补拉
- **目标文件**：`client.js`（`HooksDenySection`、`SkillsSection`、`PurgifySection`）
- **函数/区块**：`2617-2621`、`3856-3868`、`2935-2976`、`2978-2982`
- **改什么**：
  1. `HooksDenySection` 接受 `value` + `onChange` 两个 prop，不再自己 GET；父级从 `state.hooks_deny_bypass`（`lib/index.js:1900`）传入。
  2. `SkillsSection` 直接用 `props.skills`（来自 `state.skills`，`lib/index.js:1901`），删掉 `apiJson("/Xsdsh-purge/status")`（`3856`）。
  3. `2978-2982` 的 `setTimeout(loadAll, 5000)` 改为只补 `/status`（新函数 `refreshStatusOnly`），不再重拉 `/override` 与 `/own-servers`。
  4. 保留 POST 后的局部刷新：`onSaved` → `loadAll`（已有）。
- **验收标准**：
  - 挂载清洗页时 Network 面板请求数从 6 降到 3（`/status`、`/override`、`/own-servers`）+ `rules/status`。
  - 挂载后 5 秒只新增 1 个 `/status` 请求（不是 3 个）。
  - 切换 Hooks 开关后，父级 `state.hooks_deny_bypass` 与开关显示一致（刷新后仍一致）。
- **需同步改的测试**：新增断言：`HooksDenySection` 渲染时不再调用 `fetch`（用 `settings-render` 的 sandbox fetch 计数器）；断言 `loadAll` 之外存在 `refreshStatusOnly` 且 5 秒定时器只调它。
- **风险**：中

---

### W-13 每个区块独立 notice + `role="status"`
- **目标文件**：`client.js`
- **函数/区块**：`PurgifySection`（`2821` 单 notice）、`3382`/`3385` 渲染点、`3134`、`3177`、`3459-3462`
- **改什么**：拆成 `noticePrompt` / `noticeOwn` / `noticePatch` 三个 state；各自渲染在对应区块标题行；`noticeNode`（`2510-2513`）加 `role`：`error → "alert"`，`ok → "status"`，并加 `aria-live`。
- **验收标准**：
  - 在「自己的服务器」点保存，成功提示出现在该区块内（滚动位置无需变化即可见）。
  - `noticeNode` 输出带 `role="alert"`（错误）或 `role="status"`（成功）。
- **需同步改的测试**：新增断言（`settings-render`）：三个区块各有一个 notice 容器。
- **风险**：中

---

### W-14 危险区下移 + 统一确认组件
- **目标文件**：`client.js`
- **函数/区块**：`3378-3386`（动作行）、`3387-3402`（卸载 modal）、`3602`/`3626`/`4024`（`window.confirm`）
- **改什么**：
  1. 新增 `DangerZone` 区块，放在清洗页最底部（W-01 的 `CLEAN_BLOCKS` 末位）：`border-top:1px solid var(--xsdsh-bad)` + 一行说明「卸载会还原补丁并删除本插件文件」+ 卸载按钮。
  2. 新增 `ConfirmDialog({ title, body, confirmText, kind, onConfirm, onCancel })`，从 `3387-3402` 抽出；补 Esc、focus trap、初始焦点（见 W-15）。
  3. 三处 `window.confirm` 改调 `ConfirmDialog`（需要把调用点改为设置 state 打开对话框）。
- **验收标准**：
  - 清洗页首屏无红色按钮；危险区在滚动到底才出现。
  - 删除规则 / 复原 / 删除 Skill / 卸载 四种确认使用同一组件（`grep -c 'window.confirm' client.js` → 0）。
- **需同步改的测试**：`test/preset-prompts.test.mjs:513-529`（断言精简分支"只有卸载按钮"—— 该断言随 W-01 一起重写）；并把 `test/preset-prompts.test.mjs:381-394` 的 confirm 守卫**扩大扫描范围**到清洗页（现在只扫 `PromptsTab`→`RewriteTab` 区间），改为全文件断言「`window.confirm` 只允许出现在 `ConfirmDialog` 的兜底包装里」。
- **风险**：中

---

### W-15 卸载/确认对话框无障碍
- **目标文件**：`client.js`
- **函数/区块**：`ConfirmDialog`（W-14 新增）
- **改什么**：
  1. `useEffect` 挂 `keydown`，`Escape` 时 `onCancel`。
  2. 打开时 `cancelRef.current.focus()`。
  3. Tab 循环限制在对话框内（首尾元素间 wrap）。
  4. 关闭后焦点回落到触发按钮（`triggerRef`）。
- **验收标准**：
  - 键盘：打开对话框 → Esc 关闭 → 焦点回到「卸载」按钮。
  - Tab 循环不逃出对话框。
  - `grep -c '"Escape"' client.js` ≥ 1。
- **需同步改的测试**：新增断言（`settings-render`）：对话框节点含 `onKeyDown` 或渲染时注册了 keydown effect。
- **风险**：低

---

### W-16 统一 hint 样式，清理未定义令牌
- **目标文件**：`client.js`
- **函数/区块**：17 处内联 hint 样式；`3403`、`3439`；CSS `1044`
- **改什么**：
  1. 删除所有 `style: { margin: ..., color: "var(--xsdsh-...)", fontSize: 12 }`，改为 `className: "xsdsh-hint"` / `"xsdsh-hint is-warn"`。
  2. `--xsdsh-danger` → `--xsdsh-bad`（`3403`、`3439`）。
  3. CSS 增 `.xsdsh-hint.is-warn{color:var(--xsdsh-bad)}`。
- **验收标准**：
  - `grep -c 'var(--xsdsh-danger' client.js` → 0。
  - `grep -c 'fontSize: 12' client.js` 在清洗页区块内 → 0（其它模块不计）。
  - 暗色主题下警告文字对比度 ≥ 4.5:1（用 DevTools 取色验算）。
- **需同步改的测试**：无。
- **风险**：低

---

### W-17 补 `.xsdsh-cr` 样式或删裸类名
- **目标文件**：`client.js`
- **函数/区块**：`2646`、`2703`；CSS `1028-1031`
- **改什么**：W-11 已删 `ContinueRetrySection`（`2703`）。剩余 `2646` 的 `div.xsdsh-cr` 改为 W-03 的 `Block` 组件（不再需要独立类），或补 `.xsdsh-cr{border:1px solid var(--xsdsh-line);border-radius:8px;padding:12px;background:var(--xsdsh-bg)}`。
- **验收标准**：`grep -c 'className: "xsdsh-cr"' client.js` → 0，或 `.xsdsh-cr{` 有对应 CSS 规则。
- **需同步改的测试**：无。
- **风险**：低

---

### W-18 补 `rules.listTitle` / `override.hint` / `*.hintMore` 等新键（zh+en 成对）
- **目标文件**：`client.js`
- **函数/区块**：`zh`（`127-549`）、`en`（`550-974`）
- **改什么**：按 W-04/W-05 新增的键，zh 与 en **必须成对**。当前两本词典各 418 个键且完全对齐（已用脚本核对，差集为空），新增后必须保持对齐。
- **验收标准**：
  - 脚本核对 zh/en 键集差集为空：
    ```powershell
    $lines=Get-Content client.js; $zh=@{};$en=@{}
    for($i=126;$i -lt 549;$i++){ if($lines[$i] -match '^\s*"([\w.$]+)"\s*:'){ $zh[$Matches[1]]=1 } }
    for($i=549;$i -lt 975;$i++){ if($lines[$i] -match '^\s*"([\w.$]+)"\s*:'){ $en[$Matches[1]]=1 } }
    ($zh.Keys|?{-not $en.ContainsKey($_)}); ($en.Keys|?{-not $zh.ContainsKey($_)})
    ```
    两行输出均为空。
- **需同步改的测试**：建议把上面的对齐检查固化成新测试 `test/i18n-parity.test.mjs`。
- **风险**：低

---

## 4. 测试同步方案（**必读：不改测试就一定会红**）

改 `client.js` 会直接撞下面两组用例。它们不是"顺手加的"，是专门守护当前形态的回归网，**必须按新形态重写，不能删**。

### 4.1 `test/preset-prompts.test.mjs`（31824 字节，2026-10-22 18:56:49）

| 行号 | 断言 | 为什么会被撞 | 同步方案 |
|---|---|---|---|
| `490-511` | `assert.ok(/const FULL_CLEAN_PANEL = false/.test(CLIENT))` + 用 `CLIENT.indexOf("const FULL_CLEAN_PANEL = false")` 定位 section 起点，再对 6 个块逐一断言 `FULL_CLEAN_PANEL ? h(...)` | W-01 删除常量 → 正则不命中，`indexOf` 返回 -1，后续 `slice(-1, ...)` 全部失效 | **整组替换**为「区块表驱动」断言：<br>① `assert.ok(!CLIENT.includes("FULL_CLEAN_PANEL"))`；<br>② 断言 `CLEAN_BLOCKS` 存在且包含 `patches/hooks/prompt/own/danger` 五个 id；<br>③ 断言 `return h("section"` 之后到文件末尾的渲染体里同时出现 `h(PatchGroups`、`h(HooksDenySection`（不再要求 `FULL_CLEAN_PANEL ?` 前缀） |
| `513-529` | 完整分支含 `doAction("apply")`/`doAction("revert")`；精简分支只含 `setAskUninstall(true)`，且**不含** `doAction("apply")` | W-14 把卸载移入 `DangerZone`，`apply/revert` 同页共存 → "精简分支不含 apply" 不再成立 | 改为断言：<br>① `apply`/`revert` 仍存在；<br>② 卸载按钮位于 `DangerZone` 内（用 `CLIENT.indexOf("function DangerZone")` 与 `CLIENT.indexOf('setAskUninstall(true)')` 的位置关系判定）；<br>③ 危险区在渲染顺序上晚于提示词区块 |
| `531-539` | `HooksDenySection`/`PatchGroups` 组件定义存在、`"hooksDeny.title"` 键存在、`lib/index.js` 含 `"/Xsdsh-purge/hooks-deny"` | W-04 若改键名、W-11 若删组件会撞 | **保持不变**（这正是"别删实现"的护栏）。仅当确实改名时同步改键名 |
| `381-394` | "不直接依赖 `window.confirm`"：用 `indexOf("function PromptsTab()")` → `indexOf("function RewriteTab()")` 切片，断言区间内 `window.confirm` ≤1 次、且必须走 `ask()` 包装（`try/catch` + `=== true`） | 扫描范围**只覆盖 PromptsTab**；W-14 若把清洗页 3 处 confirm 收敛进 `ConfirmDialog`，这条守卫仍是"只扫一段"，无法防回归 | 把切片范围改为「全文件减去 `ConfirmDialog` 定义体」，断言其余位置 `window.confirm` 次数为 0；并断言 `ConfirmDialog` 内部有 `try/catch` + `=== true` |
| `554-575` | 从 `client.js` 抽 `beginPointerSession` 做监听泄漏测试 | 只要不改该函数即可 | 不改 |

### 4.2 `test/settings-render.test.mjs`（19495 字节，2026-10-22 18:47:18）

| 行号 | 断言 | 为什么会被撞 | 同步方案 |
|---|---|---|---|
| `251-265` | `const fullPanel = /const FULL_CLEAN_PANEL = true/.test(source);`<br>if full: `boxes.length === 1`（玻璃开关）<br>else: `boxes.length === 0`（精简模式无勾选框） | **这是最危险的一条**：团队目标"对话窗口内可开关"若用 checkbox 实现，`boxes.length` 立刻从 0 变 >0，走 else 分支就 FAIL | 改为「按区块开关数量断言」：<br>① 读 `source` 里的 `CLEAN_BLOCKS` 条目数 `N`；<br>② 断言 `boxes.length === N`（每个区块一个开关）；<br>③ 断言玻璃开关**不在**清洗页（它随 A-1 移到外观区），即 `byClass(tree,"xsdsh-glass-row").length === 0`；<br>④ 删掉 `fullPanel` 这个基于常量的分支判断 |
| `227-232` | 根节点 `.xsdsh-root`、`data-glass`、两份 `<style>` | W-02 若把 `<style>` 合并会撞 | 保持两份 `<style>`（`PURGE_CSS` + `LOOK_CSS`）；若合并，改 `styles.length === 1` |
| `236-249` | 清洗分区无壁纸按钮 / 无桌宠预览 / 无桌宠开关 | 不受影响（这些已在 `CatSection`） | 不改 |
| `168-181` | `renderSettings()` 直接渲染 `SettingsRoot`，props 只有 `{t}` | W-02 后 `SettingsRoot` 仍渲染三块，可能因新 prop 缺失抛错 | 若 `PurgifySection` 新增必填 prop，在 `renderSettings` 里补 `{ look: {...} }` 默认值（该组件已有兜底 `2800-2804`，通常不用改） |
| `405-419` | `apply()` 在无 DOM 环境不抛错、注册 1 个槽位 | 只要不动 `apply` 即可 | 不改 |

### 4.3 间接影响（建议回归，不必改）

| 测试 | 原因 |
|---|---|
| `test/titlebar-drag.test.mjs:63-68`、`142`、`147-150` | 用自建 fixture HTML + 对 `PURGE_CSS` 正则断言 `.xsdsh-dock` / `.xsdsh-dock-head` 的 `no-drag`。W-02 若重写 `.xsdsh-dock` 选择器会撞；**保留现有 `.xsdsh-dock{...no-drag}` 与 `.xsdsh-dock-head` 结构即可** |
| `test/look-layout.test.mjs` | 只抽 `LOOK_CSS`，W-06/W-07 改的是 `PURGE_CSS`，不受影响 |
| `test/glass-filter.test.mjs:9` | 读 `client.js` 源码断言玻璃滤镜逻辑；W-01 把玻璃开关移出清洗页不影响 `ensureGlassFilter` |
| `test/self-audit.test.mjs` / `test/bugreport-20261021.test.mjs` | 未命中 `client.js` 面板结构断言，跑一遍确认 |

### 4.4 新增测试建议

1. `test/clean-panel-blocks.test.mjs`：区块表驱动（W-01/W-03）、`h3` 层级、摘要长度 ≤ 30 字。
2. `test/i18n-parity.test.mjs`：zh/en 键集对齐（W-18 脚本固化）。
3. 在 `test/settings-render.test.mjs` 内补：每个区块一个 notice（W-13）、对话框 Esc（W-15）、列表项无 `role=button`（W-09）。

### 4.5 跑测试的命令

```powershell
cd D:\渗透\逆向模式\dsh-purge
node test/settings-render.test.mjs
node --test test/preset-prompts.test.mjs
node test/look-layout.test.mjs
node --test test/titlebar-drag.test.mjs
# 全量
npm test
```

**注意**：本仓库此刻可能有人正在跑 `node test`，`client.js` 的 mtime/size 会变。每次改完先核对指纹（§0），再跑测试。

---

## 5. 「对话窗口内可开关」可复用接口清单

目标是让开关在**对话窗口内**（dock 面板）生效，所以先盘点已有 HTTP 接口：哪些能直接用、请求体长什么样、回读哪些字段、还缺什么聚合。

### 5.1 `/Xsdsh-purge/hooks-deny`（exact，`lib/index.js:1908-1938`）

| 项 | 内容 |
|---|---|
| 方法 | `GET` / `POST`（其它方法 405，`allow: GET, POST`） |
| POST 请求体 | `{ "hooksDenyBypass": boolean }`（必须是 boolean，否则 400 `hooksDenyBypass must be boolean`） |
| 响应（GET/POST 同形） | `{ ok: true, hooksDenyBypass: boolean }` |
| 副作用 | 写 `$DSH_HOME/Xsdsh-purge/hooks-deny.json`（`lib/hooks-deny.js:208-218`，原子写）；**不**立即改写宿主文件，需再走 `/apply` |
| 现状调用 | `client.js:2618`（GET）、`2627-2631`（POST） |
| 备注 | `GET /status` 已带 `hooks_deny_bypass`（`lib/index.js:1900`），可省掉 GET |

### 5.2 `/Xsdsh-purge/own-servers`（exact，`lib/index.js:2432-2459`）

| 项 | 内容 |
|---|---|
| 方法 | `GET` / `POST` |
| POST 请求体 | `{ "content": string }`（必须是 string，否则 400 `content must be a string`） |
| 响应（GET） | `{ ok: true, content: string }` |
| 响应（POST） | `{ ok: true, content: string, dropped: number }` —— `content` 是**规范化后**的文本（去重、丢弃非法行，见 `lib/net-scope.js:357-379`） |
| 副作用 | 写 `$DSH_HOME/net-scope-allow.txt`，并清空内存 allow 缓存（`net-scope.js:394`） |
| 现状调用 | `client.js:2968`（GET）、`3449-3453`（POST） |
| 缺口 | 没有"逐行校验"接口；`dropped` 只在保存后返回，无法边输入边提示 |

### 5.3 `/Xsdsh-purge/override`（exact，`lib/index.js:2377-2431`）

| 项 | 内容 |
|---|---|
| 方法 | `GET` / `POST` |
| POST 请求体 | `{ "content": string }`（必须是 string，否则 400 `content must be a string`） |
| 响应（GET） | `{ ok: true, path, exists, empty, customized, usingDefault, content, defaultContent, injectSource, injectRuleId, needPrompt }`（`lib/core.js` 的 `readOverrideForUi` + `injectSnapshot`，`lib/index.js:344-351`） |
| 响应（POST） | `{ ok: true, content, defaultContent, customized, usingDefault, path, injectSource, injectRuleId, needPrompt }` |
| 拒绝路径 | 内容为空且规则集也为空时返回 **400** + `{ ok:false, content, needPrompt:true, injectSource:"none" }`（`lib/index.js:2402-2409`） |
| 副作用 | 写 `prompt-inject.md`；`GET` 还会顺带 `seedPromptInjectAtBoot`（`2384`） |
| 现状调用 | `client.js:2953`（GET）、`3121-3125`（POST，`saveOverride`）、`3162-3166`（POST，`restoreOverride`） |
| **现状浪费** | 客户端只读 `content` / `defaultContent`（`2956-2957`），**`customized` / `usingDefault` / `path` / `injectSource` / `needPrompt` 全部丢弃** → 正是 C-1 的根因 |

### 5.4 `/Xsdsh-purge/rules`（prefix，`lib/index.js:2847-2858` → `rulesHttpHandler` `2733-2752` → `handleRulesOp` `2643-2731`）

op 通过 `body.op` / URL tail / `?op=` 三选一（`2745`），`id` 支持 `body.id` 或 `?id=`（`2645`），`cwd` 支持 `body.cwd` 或 `?cwd=`（`2646-2648`）。

| op | 请求体 | 回读字段 |
|---|---|---|
| `status`（默认） | `{}`（可带 `cwd`） | `{ ok, rules[], active, injectSource, injectRuleId, active_target, agents_exists, agents_synced, agents_path, rules_dir, cwd, cwd_candidates[], cwd_selections[], workspace_policy, workspace_policies[] }`（`lib/rules.js:340-383`） |
| `scan-cwd` / `scan` | `{ cwd? }` | `{ ok, cwd, candidates[], selections[] }`（`2655-2665`） |
| `toggle-cwd` | `{ path, enabled }` | `{ ok, selections[] }`（`2666-2672`；缺 `path` → 400） |
| `set-policy` / `workspace-policy` | `{ policy: "fallback"\|"strict"\|"always" }` | `{ ok, policy, policies[] }`（非法 → 400） |
| `read` | `{ id }` 或 `?id=` | `{ ok, id, name, target, content }`（404 if not found） |
| `save` | `{ id, content, name?, target? }`（`target` 只能 `AGENTS.md`/`CLAUDE.md`，否则 400） | `{ ok, id, injectSource, injectRuleId, needPrompt }`（`2703`） |
| `activate` | `{ id }` | `{ ok, id, name, target, agents_path, note, injectSource, injectRuleId, needPrompt }`（`2709-2717`） |
| `delete` | `{ id }` | `{ ok, id }`（`2719-2724`） |
| `reset` | `{}` | `{ ok, ...resetToOriginal(), note }`（`2725-2729`） |

现状调用：`client.js:101-107` 的 `rulesApi(op, extra)`，全部经 `POST /Xsdsh-purge/rules`。

### 5.5 `/Xsdsh-purge/skills`（prefix，`lib/index.js:2829-2845` → `handleSkillsOp` `2754-2793`）

`op` 支持 `body.op` / tail / `?op=` / 有 `?id=` 时默认 `read`（`2810-2814`）。兼容别名 `/Xsdsh-purge/skill`（`2837-2839`）。

| op | 请求体 | 回读字段 |
|---|---|---|
| `status` | `{}` | `{ ok, skills_dir, skills:[{ id, description, kind, valid, error, size, path }] }`（`lib/skills.js:733-747`） |
| `read` | `{ id }` | `{ ok, id, kind, path, content, description, whenToUse, modelInvocable, userInvocable, valid, error, size }`（`skills.js:278-294`） |
| `save` | `{ id, content, description }` | 同上（`2766-2772`） |
| `delete` | `{ id }` | 同上（`2773-2777`） |
| `import` | `{ data: base64, name }` **或** `{ files:[{path,content,encoding}], name }` | `{ ok, imported:[skill] }`（`2778-2791`） |

现状调用：`client.js:113-123` 的 `skillsApi(op, extra)`，带 404/405 回退到 `/skill`（`119-122`）。

### 5.6 `/Xsdsh-purge/status`（exact，`lib/index.js:1850-1907`）—— 最接近"聚合"的那个

`GET` 返回（节选，与清洗页相关）：
```
{ ok, ready, surface, ai_base, desktop_install, desktop_exe, asar_still_sealed, missing_ai_base,
  patches_applied, patches_pending, patches_skipped, patches_ready, patches_na, patches_total,
  patches_lost, patch_status, patches[], patch_names,
  shim_cmd, shim_ps1, shim_bin, has_backup, override_status, override_path, dsh_home,
  plugin_version, boot_full_quit,
  hooks_deny_bypass,          // ← 1900，客户端未使用
  skills: [...] }             // ← 1901，客户端只在 SkillsSection 里用了一次
```
超时：60s（`client.js:49`）。

### 5.7 缺口清单（要"对话窗口内可开关"，这些还不够）

| 缺口 | 现状 | 需要什么 |
|---|---|---|
| **G1 无「面板偏好」持久化接口** | 区块展开/折叠、各区块开关目前只能放 `localStorage`（如 `client.js:9715` 的 `DOCK_GEOM_KEY`），换设备/换浏览器就丢 | `GET/POST /Xsdsh-purge/panel-prefs`，请求体 `{ blocks: { patches:bool, hooks:bool, prompt:bool, own:bool, danger:bool }, collapsed: { ... } }`，落 `$DSH_HOME/Xsdsh-purge/panel-prefs.json`；回读同形 + `updatedAt` |
| **G2 无单次聚合快照** | 挂载时 4-6 次请求（§H-2），且 `/status` 不含 `own-servers` 内容、不含 `rules` 状态 | `GET /Xsdsh-purge/clean-state`：一次性返回 `{ status, override, ownServers, hooksDeny, rules, skills, panelPrefs }`；**或** 扩展 `/status` 增加 `own_servers` / `rules_status` 字段 |
| **G3 own-servers 无逐行校验** | 只能保存后拿 `dropped`（`lib/index.js:2450`） | `POST /Xsdsh-purge/own-servers/check`，请求体 `{ content }`，回 `{ ok, lines:[{ raw, host, valid, reason }], counts:{ total, valid, dropped } }`，不落盘 |
| **G4 无「提示词状态」轻量读** | 要拿 `customized/usingDefault` 必须拉整个 `/override`（含完整正文，可能 20KB+） | `GET /Xsdsh-purge/override/meta`，只回 `{ ok, customized, usingDefault, path, empty, injectSource, needPrompt, chars }` |
| **G5 无「一次应用所有待写设置」** | 改完 hooks 开关要单独点 `/apply`（`lib/index.js:2153`），文案还得让用户记住 | 扩 `/apply` 支持 `{ scope: ["hooks"] }`，或新增 `POST /Xsdsh-purge/apply-pending` 返回 `{ ok, applied:[], skipped:[], restartRequired:boolean }` |
| **G6 `continue/settings` 完全不存在** | `client.js:2673/2685` 在调，后端无路由（§H-3） | 删除调用（推荐），或补 `GET/POST /Xsdsh-purge/continue/settings`，读写 `lib/continue-retry.js` 的 `settingsPath` |
| **G7 无「区块开关」的服务端语义** | 开关只影响前端渲染，后端不知道哪些区块被关掉 | 与 G1 合并：`panel-prefs` 落盘后，`/clean-state` 一并返回，保证多端一致 |

**结论**：现有 4 组接口（`hooks-deny` / `own-servers` / `override` / `rules/*`）**足以支撑"可开关"**，但需要 ① 修掉 `continue/settings` 的 404 调用；② 把 `/status` 已有的 `hooks_deny_bypass`、`skills` 用起来；③ 若要"开关状态跨端记住"，必须补 G1（`panel-prefs`）；④ 若要减少请求，补 G2（`clean-state`）。

---

## 6. 判定依据汇总（ui-ux-pro-max `--domain ux` 命中条目）

| 引用处 | 类别 / 条目 | 严重度 | 原句要点 |
|---|---|---|---|
| A-2、C-5、F-1 | Accessibility / **Heading Hierarchy** | Medium | "Use sequential heading levels h1-h6 / Don't skip heading levels" |
| A-2、C-5 | Typography / **Heading Clarity** | Medium | "Headings should stand out from body / Don't 同字号" |
| A-3 | Layout / **Container Width** | Medium | "Limit max-width for text content (65-75ch)" |
| A-3 | Touch / **Touch Spacing** | Medium | "Minimum 8px gap between touch targets" |
| B-3 | Content / **Compact Label Semantics** | High | "Badges communicate state / chips represent values" |
| B-4、D-1 | Accessibility / **Text Reflow and Spacing** | Critical | "Use fluid sizes content-driven height / Don't clip in fixed-width or fixed-height boxes" |
| B-4 | Content / **Essential Text Truncation** | Critical | "Headings actions errors safety text need complete access" |
| C-1、D-3 | Accessibility / **Form Labels** | High | "Use label with for attribute / Don't placeholder-only inputs" |
| C-2 | Forms / **Error Placement** | High | "Show a specific error below the input and reference it with aria-describedby" |
| C-3 | Forms / **Submit Feedback** | High | "Show loading then success/error state / Don't no feedback after submit" |
| C-3 | Accessibility / **Error Messages** | High | "Use aria-live or role=alert for errors" |
| D-2 | Accessibility / **Focus Not Obscured (Minimum)** | High | "Offset sticky UI with scroll-padding / Don't let overlays fully cover focus" |
| E-1 | Layout / **Long Token Wrapping** | High | "Use overflow-wrap anywhere and let flex or grid text children shrink" |
| E-1 | Responsive / **Horizontal Scroll** | High | 窄屏不得横向溢出 |
| E-3 | Accessibility / **Compact Control Semantics** | Critical | "Prefer a button and expose pressed state / Don't use a clickable div" |
| E-4 | Feedback / **Empty States** | Medium | "Show helpful message and action / Don't blank empty screens" |
| G-1、G-4 | Interaction / **Confirmation Dialogs** | High | "Prevent accidental destructive actions / Confirm before irreversible actions" |
| G-3 | Accessibility / **Keyboard Navigation** | High | 键盘可达、可退出 |
| G-3 | Interaction / **Focus States** | High | 焦点必须可见且可管理 |
| H-4 | Accessibility / **Color Contrast** | High | "Minimum 4.5:1 ratio for normal text" |
| H-4 | Accessibility / **Color Only** | High | "Don't convey information by color alone" |
| H-5 | Typography / **Font Size Scale** | Medium | "Use consistent modular scale / Don't arbitrary sizes" |
| W-08 | Accessibility / **Target Size (Minimum)** | High | "At least 24×24 CSS px pointer targets"（W-08 换行后的按钮需保持 ≥28px 高，现 `.xsdsh-btn-tiny{min-height:28px}` 满足） |

> 说明：直接检索 `"dense settings panel grouping"`、`"card grid scannability"`、`"settings panel grouping sections"` 三个词组时，`ux-guidelines.csv`（119 条）**无命中**（工具明确回报 "No matches" 并给出 closest terms）。已按要求改用语义化拆词重查（`heading hierarchy` / `text reflow spacing` / `long token wrapping` / `chip collection reflow` / `target size minimum` / `focus not obscured` / `essential text truncation` / `compact control semantics` / `submit feedback` / `error placement` / `heading clarity` / `color only indicator` / `confirmation dialogs` / `empty states` / `container width`），上表全部来自这些命中结果，**未使用未经验证的通用建议**。

---

## 7. 一页速查

**最该先做的三件事**
1. **W-01**：删 `FULL_CLEAN_PANEL`，改区块开关表 —— 现在"精简"只砍了 1/3，另两个 panel 全量渲染。
2. **W-02 + W-03**：三块合成一页卡片栅格 + 统一区块头（标题/摘要/折叠/notice）—— 去掉"框中框"和"无标题面板"。
3. **W-04 + W-13**：文案改人话（尤其删掉"Hooks 文案让你点不存在的应用按钮"）+ notice 归位到各区块 —— 这是"看不懂 / 点了没反应"的直接来源。

**最容易踩的坑**
- 改 `client.js` **一定**会撞 `test/preset-prompts.test.mjs:490-539` 和 `test/settings-render.test.mjs:251-265`。后者尤其危险：它断言精简模式 `checkbox === 0`，而"对话窗口内可开关"如果做成 checkbox 会直接让它红。**先按 §4.2 改测试，再动 `client.js`**。
- `client.js` 里 drill 片段是生成的，别手改。
- 并发会话可能正在改同一文件：每次动手前核对 `(LastWriteTime, Length)`。
