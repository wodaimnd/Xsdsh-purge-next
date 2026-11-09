import assert from "node:assert";

import {
  getApplyProgress,
  beginJob,
  beginApply,
  setApplyProgress,
  endApply,
  resetApplyProgress,
} from "../lib/apply-progress.js";

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

t("IDLE 初始态", () => {
  const p = getApplyProgress();
  assert.equal(p.active, false);
  assert.equal(p.kind, "apply");
  assert.equal(p.stage, "idle");
  assert.equal(p.applied, 0);
  assert.equal(p.total, 0);
});

t("beginJob 置活跃并记时间戳", () => {
  const before = Date.now();
  const p = beginJob("apply", "write");
  const after = Date.now();
  assert.equal(p.active, true);
  assert.equal(p.kind, "apply");
  assert.equal(p.stage, "write");
  assert.ok(p.startedAt >= before && p.startedAt <= after);
  assert.ok(p.updatedAt >= before && p.updatedAt <= after);
});

t("beginApply 委托 beginJob(kind=apply)", () => {
  const p = beginApply("write");
  assert.equal(p.kind, "apply");
  assert.equal(p.stage, "write");
  assert.equal(p.active, true);
});

t("setApplyProgress 部分合并并激活", () => {
  const p = setApplyProgress({ stage: "patch", applied: 3, total: 10 });
  assert.equal(p.stage, "patch");
  assert.equal(p.applied, 3);
  assert.equal(p.total, 10);
  assert.equal(p.active, true);
  assert.ok(p.updatedAt > 0);
});

t("setApplyProgress active:false 生效", () => {
  const p = setApplyProgress({ active: false });
  assert.equal(p.active, false);
});

t("endApply 置 inactive", () => {
  const p = endApply({ complete: true, failed: 0 });
  assert.equal(p.active, false);
  assert.equal(p.complete, true);
  assert.equal(p.failed, 0);
});

t("resetApplyProgress 回到 IDLE", () => {
  beginJob("apply", "write");
  const p = resetApplyProgress();
  assert.equal(p.active, false);
  assert.equal(p.stage, "idle");
  assert.equal(p.applied, 0);
  assert.equal(p.total, 0);
  assert.notEqual(p.updatedAt, 0);
});

console.log(`\n结果：${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
