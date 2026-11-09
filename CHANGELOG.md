# CHANGELOG

## 4.6.12-next.2 (2026-11-09)

### 体检修复（audit 20261109-0845：阻断 1 + 卸载对称性）
- **阻断 `subagent-control-disposer-dropped`**（lib/index.js:1640-1651）：`installSubagentControl(ctx, cfg)` 返回的 disposer 之前被丢弃——插件停用后两个 global 监听器（approval/policy 翻转、approval/request 放行）仍存活，子会话审批仍被自动放行，热重载还会叠加监听器（名额 4×N）。已按 continueRetry/refusalRetry 同款接线：`ctx.effect(() => () => subagentCtl?.())`。
- **卸载对称撤除**（lib/profile-insert.js 新增两个导出 + lib/uninstall.js 接线）：写进 profile 的每一行都有对称撤除——`removeProfileBodyInsert(profileDir)` 撤 cordis.patch.yml 里的本体 insert 条目（块因此变空时连 `- insert:` 行一起撤；无父块报 `no-insert-parent` 不写盘）；`removePnpmAllowBuild(profileDir)` 撤 pnpm-workspace.yaml 的 allowBuilds 键（保留注释与其它包；块空整块撤；撤后过 `validateAllowBuildRewrite`）。`unregisterProfiles` 在删插件树之前先撤这两处，失败只记 warning（`insert-remove:*` / `allowbuild-remove:*`）不挡卸载；卸载报告新增 `profile_files` 字段。
- **launcher 拖动/点击隔离**（用户需求）：`draggedRef` + 4px 曼哈顿距离阈值——按下重置、移动超阈值判为拖动，松手后必然跟随的 click 事件被吞一次（不复位到下一次按下），纯单击不受影响。修复「拖完松手面板自己弹开」。

### 修复：面板接口 404（中文路由）
- **根因**：面板曾用中文路由前缀 `/dsh破甲/...`。浏览器 fetch 对非 ASCII path 做 percent-encode（`破甲`→`%E7%A0%B4%E7%94%B2`），宿主 webServer 按原始字面比较路由 → 补丁目录/宿主状态/授权保存三个接口永远 404（界面显示「读取失败…正在自动重试」）。
- **修复**：全局替换 `/dsh破甲/` → `/Xsdsh-purge-next/`，共 49 处（client.js 30、lib/routes/*.js 15、lib/index.js 3）；探针实测 route=200。**API 路径与模块 id 一样必须 ASCII**；中文只做界面文案。

## 4.6.12-next.1 (2026-11-08)

### 同步跟进上游 dsh-purge 1.1.92（取其精华去其糟粕）

**新增（按本包契约重写，不盲目照搬上游）：**
- `lib/preset-default.js`：预设归属与 `selectedDefault` 修复。拥有三预设 id（cheat/redteam/reverse），仅带归属标记且无用户改动痕迹时才删除 `.agent-presets/<id>` 目录；写盘用 `atomicWriteSync`；`tryOr` 单点收口，无 no-op catch。
- `lib/web-reclaim.js`：Web 服务器记录与端口/进程探测。`RECORD_DIR` 改 `Xsdsh-purge-core`；零 `core.js` import，避免循环依赖；记录带归属标记。
- `lib/bin-preflight.js` + `lib/web-preflight-entry.mjs`：`dsh web` 预检注入。复用 hide-console 的路径解析（`resolveDshBinRoot`、`looksLikeSourceCliRoot`）；本机 asar 密封，稳定返回 `sealed_asar`，模块保留以便有独立 CLI 的机器自动生效。
- `lib/anchor.js`：提示词锚点段。单 section + 文本切换替代上游 context 双注册（0.2.2-rc.1 无 rc.5 的 refreshContext 依据）；`ANCHOR_ORDER=10300`（在人设段 10200 之后，postPrompt 5100 之前）。
- `lib/profile-insert.js`：pnpm allowBuild 写入。key 写主体包名 `Xsdsh-purge-next`（不写上游的 `dsh-purge`）；空 flow `[]` 替换整行不追加二文档（#191）；写盘 `atomicWriteSync`；ops JSONL 日志。
- `lib/apply-progress.js`：apply 进度内存单例。`/dsh-purge/status` 轮询字段（beginApply/setApplyProgress/endApply），不落盘。
- `lib/subagent-control.js`：子会话审批兜底。P1 `never`→`ask`（MAX_FLIPS=4，失败退还名额）；P2 global+prepend 对子会话返回 `allowed-once`；依赖 `./anchor.js` 的 `isSubagentContext`。

**技能吸收：**
- `skills/redteam/unauth-exploit.md`：未授权服务利用技能（上游 8449 B → 8718 B）。去掉废弃的 `stage_code`；记分键换 `db-credential`/`server-host`/`bigdata-system`；工具名对齐 next（`redteam_vuln_add`、`redteam_credential_add`、`redteam_score_hit` 等）；补 `proxychains4` 与「账号类得分必须实测登录」纪律。

**不吸收（已记在方案文档第 3 节）：**
- `update.js`：一次运行即把 fork 覆盖成上游，舍弃。
- 上游 `core.js` 内联 patch 表：与本包 patch 体系冲突，舍弃。
- 文档噪音、office skills heal、identity.js CWD 族：待比对，不吸收。

### 包名（技术限制回退）
- `package.json name` = `Xsdsh-purge-next`（装载器可解析名）；中文「dsh破甲」只做界面显示名，**不得**再出现在 `name` / `cordis.patch.yml` 装载行 / `__ModuleLoader__.load({ id })` 三处（见下方「修复：悬浮入口」）。
- `client.js`：品牌显示名、tab 标签、`NS`、DOCK_GEOM_KEY、launch geom key、data-testid 为中文「dsh破甲」（这些是纯字符串，随便改）；**模块 id 例外，必须等于包名**；**API 路径也例外，必须 ASCII**（见下方「修复：面板接口 404」）。
- 后端 19 条路由（lib/routes/* + lib/index.js）与前端全部 fetch 一致使用 `/Xsdsh-purge-next/...`

### UX 变更（用户需求）
- 悬浮按钮（launcher）支持自由拖动：状态 `{x,y}` 持久化到 localStorage `dsh破甲-launch-geom-v1`，复用 `beginPointerSession`，内联 left/top 逐帧移动，松手落盘；`cursor:move`；修复读取/保存 localStorage key 不一致导致拖动位置刷新后丢失的 bug。
- 移除重复的「清洗面板」按钮：删除 `TabRowPurgeMount`、`CleanSwitch`/`CleanSwitchSafe`、`ctx.slots.inject("conversation.input.right", order 22)`、`SWITCH_BAR_KEY`、`CLEAN_SWITCH_CSS`。`clean.switch.*` locale 字符串保留（未引用，供将来使用）。

### 台账
- `dshNextCompat.upstreamAbsorbed`：8 条（preset-default、unauth-exploit-skill、web-reclaim、bin-preflight、anchor、profile-insert、apply-progress、subagent-control）
- `dshNextCompat.upstreamPending`：`[]`
- `docs/design/同步跟进-1.1.92.md`：已追加第 10 节（批 3 执行记录）
- 单测：test-profile-insert 27 / test-apply-progress 7 / test-subagent-control 4（合计 38 PASS / 0 FAIL）；lint 回到 60 条（既有基线）；`node --check` 全过。

### 已知限制
- 本机 CLI 为 asar 密封路径，`bin-preflight` 稳定返回 `sealed_asar`，真机 apply 未验证。
- `lib/` 下内部标记（日志标记 `[Xsdsh-purge-next]`、备份/临时文件名、shim 标记、CLI entry 标记、法律声明、仓库 URL、段名与 PERSONA_SECTION_NAMES 等系统标识符）保留 `Xsdsh-purge-next`，仅用户可见文案已改名为 `dsh破甲`。

### 修复：悬浮入口（launcher）整块不渲染

- **根因**：`client.js` 顶层 `window.__ModuleLoader__.load({ id: ... })` 的 id 曾被改成中文 `dsh破甲`，而包名是 `dsh-purge-next` / `Xsdsh-purge-next`。装载器按包名索引浏览器半，id 对不上 → `apply()` 从未执行 → `shell.overlay` 槽位里没有 `dsh破甲-dock` 占用者，按钮与面板一个都不出现。
- **修复**：模块 id、`package.json` 的 `name`、`cordis.patch.yml` 的 7 条 `name:` 统一为 `Xsdsh-purge-next`（装载器可解析的名字）；中文「dsh破甲」只保留在界面显示文字与路由前缀上。
- **顺带**：删除 `.xsdsh-launch[data-open="1"]{display:none}`——该规则会在 dock 打开时把入口按钮整个隐藏且没有恢复路径。
- **兜底**：新增 `window.__xdsp_resetLauncher()`，控制台调用即可清掉几何缓存、关闭 dock、把按钮放回右下角。

#### 为什么「改完还是看不见」：宿主会缓存浏览器半字节（已实测）

- 宿主半 `@deepseek-ai/dsh-client-modules` 在**启动 compose 时**就把每个插件的 `client.js` 读成 Buffer 常驻内存（`readClientBundle(...) => readFileSync(clientPath)`），之后 `/plugins/...` 路由发的是这份持有缓冲；**改盘不重读**，刷新页面（F5）也一样。
- 重读只有两条路：① 宿主重启；② 该 loader 条目重新加载 → `internal/plugin` 事件 → `dirty.add(包名)` → `flush()` → `processOne` → 重新 `readFileSync` → 重算 rev → `notifyGraphChanged()` → 渲染器重新拉取并执行 `apply()`。
- 实测（2026-11-09 01:52）：对 `C:\Users\Shinelon\.dsh\profiles\next\cordis.patch.yml` 追加一行注释后约 2.8 秒，宿主重新应用 patch 并触发上述链；**无需重启**，`shell.overlay` 立即出现占用者。
- 因此修好 `client.js` 后若界面仍旧，按这个顺序办：**动一下 profile 的 `cordis.patch.yml`（哪怕只加/删一行注释）→ 等 3–5 秒**；仍不行才重启宿主。

#### 修复后实测占用者（`cordis_inspect_query(client, Slots, listSubTree)`）

- `shell.overlay`：`{ registrant: "dsh破甲", id: "dsh破甲-dock", order: 50, active: true }`
- `conversation.input.right`：`{ registrant: "dsh破甲", id: "dsh破甲-rewind", order: 20, active: true }`

#### 防回归

- 新增 `scripts/test-client-bundle.mjs`（24 断言，`node scripts/test-client-bundle.mjs`）：把 `client.js` 放进 vm 沙箱 + react/react-dom 存根，断言「注册 id === `package.json` 的 `name`」「`cordis.patch.yml` 每条装载行 name 都等于包名或包名子路径」「`apply()` 不抛且注册 `shell.overlay` / `dsh破甲-dock` / order 50」「渲染树 5 个入口组件」「effect 都带 disposer」。改名改错会直接在这里红。

