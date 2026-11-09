import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  profileHasPurgeBodyInsert,
  classifyPatchBody,
  ensureProfileBodyInsert,
  parseAllowBuildLine,
  formatAllowBuildLine,
  rewritePnpmAllowBuilds,
  validateAllowBuildRewrite,
  ensurePnpmAllowBuild,
  ensureAllProfileBodyInserts,
  ensureAllProfileInstall,
  removeProfileBodyInsert,
  removePnpmAllowBuild,
  PURGE_NAME,
  INSERT_BLOCK,
} from "../lib/profile-insert.js";

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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pfp-profile-insert-"));

// ── profileHasPurgeBodyInsert ──
t("识别已存在的 insert（按 id）", () => {
  assert.ok(profileHasPurgeBodyInsert(`foo:\n  - insert:\n    - id: Xsdsh-purge-next\n`));
});
t("识别已存在的 insert（按 name）", () => {
  assert.ok(profileHasPurgeBodyInsert(`- insert:\n  - name: 'Xsdsh-purge-next'\n`));
});
t("空文本为不存在", () => {
  assert.equal(profileHasPurgeBodyInsert(""), false);
});
t("其他 insert 不误报", () => {
  assert.equal(profileHasPurgeBodyInsert(`- insert:\n  - id: other\n  - name: 'other'\n`), false);
});

// ── classifyPatchBody ──
t("空文档 -> empty", () => {
  assert.equal(classifyPatchBody("").kind, "empty");
});
t("[] 空 flow -> empty-flow", () => {
  assert.equal(classifyPatchBody("[]\n").kind, "empty-flow");
});
t("[] 尾注释 -> empty-flow", () => {
  assert.equal(classifyPatchBody("[]  # 注释\n").kind, "empty-flow");
});
t("块序列 -> block-seq", () => {
  assert.equal(classifyPatchBody("- a:\n    x: 1\n- b: 2\n").kind, "block-seq");
});
t("flow seq -> flow-seq", () => {
  assert.equal(classifyPatchBody("[a, b]\n").kind, "flow-seq");
});
t("未知形状 -> unknown", () => {
  const r = classifyPatchBody("a: 1\nb: 2\n");
  assert.equal(r.kind, "unknown");
});

// ── ensureProfileBodyInsert ──
const emptyProfile = path.join(tmp, "empty-profile");
fs.mkdirSync(emptyProfile, { recursive: true });
fs.writeFileSync(path.join(emptyProfile, "cordis.patch.yml"), "[]\n", "utf8");
const r1 = ensureProfileBodyInsert(emptyProfile);
t("空 flow 被替换成 insert 块", () => {
  assert.ok(r1.ok && r1.wrote);
  const text = fs.readFileSync(path.join(emptyProfile, "cordis.patch.yml"), "utf8");
  assert.ok(text.includes("- id: Xsdsh-purge-next"));
  assert.ok(text.includes("name: 'Xsdsh-purge-next'"));
  assert.ok(!text.includes("\n[]\n"));
});

const existingProfile = path.join(tmp, "existing-profile");
fs.mkdirSync(existingProfile, { recursive: true });
fs.writeFileSync(
  path.join(existingProfile, "cordis.patch.yml"),
  "- insert:\n  - id: Xsdsh-purge-next\n",
  "utf8",
);
const r2 = ensureProfileBodyInsert(existingProfile);
t("已存在则跳过不重写", () => {
  assert.ok(r2.ok && !r2.wrote);
});

const newProfile = path.join(tmp, "new-profile");
fs.mkdirSync(newProfile, { recursive: true });
fs.writeFileSync(path.join(newProfile, "cordis.patch.yml"), "# 空\n", "utf8");
const r3 = ensureProfileBodyInsert(newProfile);
t("普通空文档追加 insert 块", () => {
  assert.ok(r3.ok && r3.wrote);
});

// ── allowBuild 行级 round-trip ──
t("parseAllowBuildLine 双引号键", () => {
  const p = parseAllowBuildLine('  "Xsdsh-purge-next@1.2.3": true');
  assert.equal(p.key, "Xsdsh-purge-next@1.2.3");
  assert.equal(p.value, "true");
});
t("parseAllowBuildLine 无引号键", () => {
  const p = parseAllowBuildLine("  Xsdsh-purge-next: true");
  assert.equal(p.key, "Xsdsh-purge-next");
});
t("formatAllowBuildLine 无协议", () => {
  assert.equal(formatAllowBuildLine("Xsdsh-purge-next"), "  Xsdsh-purge-next: true");
});
t("formatAllowBuildLine 带协议引号化", () => {
  assert.equal(formatAllowBuildLine("Xsdsh-purge-next@https://example.com"), '  "Xsdsh-purge-next@https://example.com": true');
});

// ── rewritePnpmAllowBuilds / ensurePnpmAllowBuild ──
const pkgProfile = path.join(tmp, "pkg-profile");
fs.mkdirSync(pkgProfile, { recursive: true });
fs.writeFileSync(path.join(pkgProfile, "pnpm-workspace.yaml"), "packages:\n  - 'packages/*'\n", "utf8");
const rewritten = rewritePnpmAllowBuilds(
  fs.readFileSync(path.join(pkgProfile, "pnpm-workspace.yaml"), "utf8"),
  pkgProfile,
);
t("无 allowBuilds 时追加并写入 Xsdsh-purge-next", () => {
  assert.ok(rewritten.includes("allowBuilds:"));
  assert.ok(rewritten.includes("  Xsdsh-purge-next: true"));
});
t("key 不写 dsh-purge", () => {
  assert.ok(!rewritten.includes("dsh-purge:"));
});
t("关键写入的包名是主体包名", () => {
  assert.ok(PURGE_NAME === "Xsdsh-purge-next");
});
const r4 = ensurePnpmAllowBuild(pkgProfile);
t("ensurePnpmAllowBuild 第一次写入 ok", () => {
  assert.ok(r4.ok && r4.wrote);
});
const r5 = ensurePnpmAllowBuild(pkgProfile);
t("第二次幂等不写", () => {
  assert.ok(r5.ok && !r5.wrote);
});
t("写入后文件含 allowBuilds 且合法", () => {
  const text = fs.readFileSync(path.join(pkgProfile, "pnpm-workspace.yaml"), "utf8");
  assert.ok(validateAllowBuildRewrite(text));
});

// ── validateAllowBuildRewrite ──
t("合法文档通过", () => {
  assert.ok(validateAllowBuildRewrite("allowBuilds:\n  a: true\n  b: true\n"));
});
t("重复 key 不通过", () => {
  assert.equal(validateAllowBuildRewrite("allowBuilds:\n  a: true\n  a: true\n"), false);
});

// ── ensureAllProfileInstall（空目录，不崩，不写）──
const emptyHome = path.join(tmp, "empty-home");
fs.mkdirSync(emptyHome, { recursive: true });
const r6 = ensureAllProfileInstall(emptyHome);
t("空 home 返回空数组且 ok", () => {
  assert.ok(Array.isArray(r6) && r6.length === 0);
});
const r7 = ensureAllProfileBodyInserts(emptyHome);
t("ensureAllProfileBodyInserts 空 home 返回空数组", () => {
  assert.ok(Array.isArray(r7) && r7.length === 0);
});

// ── removeProfileBodyInsert（卸载对称撤除）──
const rmProfile = path.join(tmp, "rm-profile");
fs.mkdirSync(rmProfile, { recursive: true });
fs.writeFileSync(
  path.join(rmProfile, "cordis.patch.yml"),
  "hooks:\n  enabled: true\n- insert:\n    - id: Xsdsh-purge-next\n      name: 'Xsdsh-purge-next'\n      inject: [systemPrompt]\n",
  "utf8",
);
t("撤除前 profileHasPurgeBodyInsert 为真", () => {
  assert.ok(profileHasPurgeBodyInsert(fs.readFileSync(path.join(rmProfile, "cordis.patch.yml"), "utf8")));
});
const rm1 = removeProfileBodyInsert(rmProfile);
t("撤除成功（块内仅本体条目 → 连头一起撤 removed-block）", () => {
  assert.ok(rm1.ok && rm1.wrote);
  assert.equal(rm1.code, "removed-block");
});
t("撤除后文档保留他人内容且无本体条目", () => {
  const text = fs.readFileSync(path.join(rmProfile, "cordis.patch.yml"), "utf8");
  assert.ok(text.includes("hooks:"));
  assert.ok(!profileHasPurgeBodyInsert(text));
  assert.ok(!text.includes("inject: [systemPrompt]"));
});
const rm2 = removeProfileBodyInsert(rmProfile);
t("二次撤除幂等（absent）", () => {
  assert.ok(rm2.ok && !rm2.wrote && rm2.code === "absent");
});

// 空块撤头：insert 块里只有本体条目 → 连 - insert: 行一起撤
const rmOnlyProfile = path.join(tmp, "rm-only-profile");
fs.mkdirSync(rmOnlyProfile, { recursive: true });
fs.writeFileSync(
  path.join(rmOnlyProfile, "cordis.patch.yml"),
  "top: 1\n- insert:\n    - id: Xsdsh-purge-next\n      name: 'Xsdsh-purge-next'\ntail: 2\n",
  "utf8",
);
const rm3 = removeProfileBodyInsert(rmOnlyProfile);
t("块内仅本体条目时连 - insert: 行一起撤", () => {
  assert.ok(rm3.ok && rm3.wrote && rm3.code === "removed-block");
  const text = fs.readFileSync(path.join(rmOnlyProfile, "cordis.patch.yml"), "utf8");
  assert.ok(!text.includes("- insert:"));
  assert.ok(!profileHasPurgeBodyInsert(text));
  assert.ok(text.includes("top: 1") && text.includes("tail: 2"));
});

// 无 insert 父块 → 不写盘报错
const rmOrphan = path.join(tmp, "rm-orphan");
fs.mkdirSync(rmOrphan, { recursive: true });
const orphanText = "- name: Xsdsh-purge-next\n  inject: [x]\n";
fs.writeFileSync(path.join(rmOrphan, "cordis.patch.yml"), orphanText, "utf8");
const rm4 = removeProfileBodyInsert(rmOrphan);
t("无 - insert: 父块报 no-insert-parent 且不写盘", () => {
  assert.ok(!rm4.ok && !rm4.wrote && rm4.error === "no-insert-parent");
  assert.equal(fs.readFileSync(path.join(rmOrphan, "cordis.patch.yml"), "utf8"), orphanText);
});

// 文件不存在 → absent 不抛
const rmAbsent = path.join(tmp, "rm-absent");
fs.mkdirSync(rmAbsent, { recursive: true });
t("cordis.patch.yml 不存在返回 absent", () => {
  const r = removeProfileBodyInsert(rmAbsent);
  assert.ok(r.ok && !r.wrote && r.code === "absent");
});

// ── removePnpmAllowBuild ──
const rmPnpm = path.join(tmp, "rm-pnpm");
fs.mkdirSync(rmPnpm, { recursive: true });
fs.writeFileSync(
  path.join(rmPnpm, "pnpm-workspace.yaml"),
  "packages:\n  - 'packages/*'\nallowBuilds:\n  Xsdsh-purge-next: true\n  other-pkg: true\n",
  "utf8",
);
const rp1 = removePnpmAllowBuild(rmPnpm);
t("撤除 allowBuilds 键且保留其它键", () => {
  assert.ok(rp1.ok && rp1.wrote && rp1.code === "removed-key");
  const text = fs.readFileSync(path.join(rmPnpm, "pnpm-workspace.yaml"), "utf8");
  assert.ok(text.includes("other-pkg: true"));
  assert.ok(!text.includes("Xsdsh-purge-next"));
  assert.ok(validateAllowBuildRewrite(text));
});
const rp2 = removePnpmAllowBuild(rmPnpm);
t("二次撤除幂等（absent）", () => {
  assert.ok(rp2.ok && !rp2.wrote && rp2.code === "absent");
});

// 块内仅本体键 → 连 allowBuilds: 行整块撤
const rmPnpmOnly = path.join(tmp, "rm-pnpm-only");
fs.mkdirSync(rmPnpmOnly, { recursive: true });
fs.writeFileSync(
  path.join(rmPnpmOnly, "pnpm-workspace.yaml"),
  "packages:\n  - 'packages/*'\nallowBuilds:\n  Xsdsh-purge-next: true\n",
  "utf8",
);
const rp3 = removePnpmAllowBuild(rmPnpmOnly);
t("块内仅本体键时连 allowBuilds: 行整块撤", () => {
  assert.ok(rp3.ok && rp3.wrote && rp3.code === "removed-block");
  const text = fs.readFileSync(path.join(rmPnpmOnly, "pnpm-workspace.yaml"), "utf8");
  assert.ok(!text.includes("allowBuilds"));
  assert.ok(text.includes("packages:"));
});

// round-trip：ensure → remove → ensure 与初始形态一致
const rtProfile = path.join(tmp, "rt-profile");
fs.mkdirSync(rtProfile, { recursive: true });
fs.writeFileSync(path.join(rtProfile, "cordis.patch.yml"), "[]\n", "utf8");
fs.writeFileSync(path.join(rtProfile, "pnpm-workspace.yaml"), "packages:\n  - 'packages/*'\n", "utf8");
ensureProfileBodyInsert(rtProfile);
ensurePnpmAllowBuild(rtProfile);
const rt1 = removeProfileBodyInsert(rtProfile);
const rt2 = removePnpmAllowBuild(rtProfile);
t("round-trip：写入后撤除全部成功", () => {
  assert.ok(rt1.ok && rt1.wrote);
  assert.ok(rt2.ok && rt2.wrote);
  const patch = fs.readFileSync(path.join(rtProfile, "cordis.patch.yml"), "utf8");
  const ws = fs.readFileSync(path.join(rtProfile, "pnpm-workspace.yaml"), "utf8");
  assert.ok(!profileHasPurgeBodyInsert(patch));
  assert.ok(!ws.includes("allowBuilds"));
  assert.ok(ws.includes("packages:"));
});

console.log(`\n结果：${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
