import assert from "node:assert";
import { installSubagentControl } from "../lib/subagent-control.js";

let pass = 0;
let fail = 0;
const t = (name, fn) => {
  try {
    fn();
    pass += 1;
    console.log(`PASS ${name}`);
  } catch (e) {
    fail += 1;
    console.log(`FAIL ${name}: ${e && e.message ? e.message : e}`);
  }
};

t("无 ctx.on 时返回空注册且不抛", () => {
  const dispose = installSubagentControl({});
  assert.equal(typeof dispose, "function");
  dispose();
  dispose(); // 二次释放不抛
});

t("配置关闭时返回空注册", () => {
  const dispose = installSubagentControl({ subagentControl: false });
  assert.equal(typeof dispose, "function");
  dispose();
});

t("正常 ctx 返回可释放的注册", () => {
  const events = [];
  const ctx = {
    on: (ev, handler, opts) => {
      events.push({ ev, handler, opts });
      return () => events.pop();
    },
  };
  const dispose = installSubagentControl(ctx, { subagentControl: true });
  assert.equal(typeof dispose, "function");
  assert.ok(events.length >= 1, `应至少注册 1 个事件监听器，实际 ${events.length}`);
  dispose();
});

t("repeated install on same ctx works", () => {
  const events = [];
  const ctx = {
    on: (ev, handler, opts) => {
      events.push({ ev, handler, opts });
      return () => events.pop();
    },
  };
  const d1 = installSubagentControl(ctx);
  const d2 = installSubagentControl(ctx);
  d1();
  d2();
});

console.log(`\n结果：${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
