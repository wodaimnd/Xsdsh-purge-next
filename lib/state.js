/**
 * 跨模块共享的可变状态。
 *
 * 路由拆到 lib/routes/ 之后，写者（/apply、/revert、/uninstall、/cleanup-residue、
 * /restart）与读者（/status、apply-lock 的 inspectApplyLock）必须是同一个持有者。
 * ESM 的 `export let` 对导入方是只读绑定，赋不了值，所以这里用可变对象承载。
 *
 * 只放真正跨模块的标志。`hungCache` 只服务 refreshHungOperator，随它进
 * lib/operator-inject.js。
 */
import * as core from "./core.js";

export const hostState = {
  /* C3：同一时刻只允许一次宿主写入（apply / revert 抢同一批 *@deepseek-ai 文件）。
     前端 patchBusy 只是按钮 disabled，切页签卸载就丢，串行化必须落在服务端。 */
  hostWriteInFlight: false,
  /* 本次宿主写入的开始时间：409 时一并返回，用户能判断「是真在跑还是卡死」。 */
  hostWriteSince: 0,
  /* 宿主树监听是否已就绪。watchWebTreeReady 写，/status 读；热重载时会重置。 */
  webTreeReady: false,
  /* /status 的单飞（C6）：gatherState 是全量扫描，低配机上单次要 60 s 级。
     前端两个消费者（面板 loadAll、技能卡）与多窗口/多标签会同时来问同一个问题，
     叠着跑只会把机器压得更死，而结果本来就该一样 —— 共享同一份在飞结果。 */
  statusFlight: typeof core.createSingleFlight === "function"
    ? core.createSingleFlight()
    : null,
  /* 本次 apply 是否需要整轮退出（只表示「密封包待换 asar」），与
     restartRequired（补丁已写、需重开客户端）是两件事，不可合并。 */
  bootFullQuit: false,
};
