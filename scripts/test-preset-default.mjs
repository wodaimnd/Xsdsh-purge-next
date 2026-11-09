/**
 * lib/preset-default.js 的回归测试（纯本地，不碰真实 $DSH_HOME）。
 *
 * 重点验证三件事：
 *   1. `selectedDefault` 只改那一行，整份 YAML 的缩进 / 注释 / 其它键原样保留；
 *   2. 三套预设 id 都认（cheat / redteam / reverse），带前缀、带引号都认；
 *   3. 删预设目录前先认归属：不是我们的、或被用户改过的一律不删。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pfp-preset-default-"));
process.env.DSH_HOME = tmp;

const mod = await import("../lib/preset-default.js");
const {
  OWNED_PRESET_IDS,
  FALLBACK_PRESET,
  isOwnedPresetId,
  repairSelectedDefaultInYaml,
  clearOwnedSelectedDefault,
  sweepOwnedPresetDirs,
} = mod;

let pass = 0;
let fail = 0;

function ok(name, cond, extra = "") {
  if (cond) {
    pass += 1;
    console.log(`  PASS  ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${name}${extra ? "  ← " + extra : ""}`);
  }
}

function eq(name, actual, expected) {
  ok(name, actual === expected, `实际 ${JSON.stringify(actual)}，期望 ${JSON.stringify(expected)}`);
}

console.log("== 常量 ==");
eq("OWNED_PRESET_IDS 三套", OWNED_PRESET_IDS.join(","), "cheat,redteam,reverse");
eq("FALLBACK_PRESET", FALLBACK_PRESET, "standard");

console.log("== isOwnedPresetId ==");
for (const id of ["redteam", "reverse", "cheat", "local/redteam", "x\\reverse", " REDTEAM "]) {
  eq(`认 ${id}`, isOwnedPresetId(id), true);
}
for (const id of ["standard", "redteamx", "minimal", "", null, "purge/redteam2"]) {
  eq(`不认 ${String(id)}`, isOwnedPresetId(id), false);
}

console.log("== repairSelectedDefaultInYaml ==");
{
  const src = [
    "# 用户手写的注释，不许丢",
    "- id: Xsdsh-purge-next",
    "  config:",
    "    selectedDefault: redteam",
    "    default: standard",
    "",
  ].join("\n");
  const r = repairSelectedDefaultInYaml(src);
  ok("改了", r.changed);
  ok("只改那一行", r.text.includes("selectedDefault: standard") && r.text.includes("# 用户手写的注释，不许丢"));
  ok("其它键没动", r.text.includes("default: standard") && r.text.includes("- id: Xsdsh-purge-next"));
  eq("行数不变", r.text.split("\n").length, src.split("\n").length);
}
{
  const r = repairSelectedDefaultInYaml('selectedDefault: "reverse"');
  eq("双引号保留", r.text, 'selectedDefault: "standard"');
}
{
  const r = repairSelectedDefaultInYaml("selectedDefault: local/cheat");
  eq("带前缀", r.text, "selectedDefault: standard");
}
{
  const r = repairSelectedDefaultInYaml("selectedDefault: standard");
  ok("指 standard 时不动", !r.changed);
}
{
  const r = repairSelectedDefaultInYaml("selectedDefault: minimal");
  ok("别人的预设不动", !r.changed);
}
{
  const r = repairSelectedDefaultInYaml("  selectedDefault:redteam   ");
  ok("无空格 + 行尾空白", r.text.startsWith("  selectedDefault:standard") && r.text.endsWith("   "));
}

console.log("== sweepOwnedPresetDirs ==");
const presets = path.join(tmp, ".agent-presets");
fs.mkdirSync(path.join(presets, "redteam"), { recursive: true });
fs.writeFileSync(path.join(presets, "redteam", "agent.cordis.yml"), "# Xsdsh-purge-next owned\n");
fs.mkdirSync(path.join(presets, "reverse"), { recursive: true });
fs.writeFileSync(path.join(presets, "reverse", "agent.cordis.yml"), "# Xsdsh-purge-next owned\n");
fs.writeFileSync(path.join(presets, "reverse", "persona-override.md"), "用户改过的\n");
fs.mkdirSync(path.join(presets, "cheat"), { recursive: true });
fs.writeFileSync(path.join(presets, "cheat", "agent.cordis.yml"), "# 用户自己写的同名预设\n");
{
  const out = sweepOwnedPresetDirs(tmp);
  eq("删掉 1 个", out.removed.length, 1);
  ok("删的是 redteam", out.removed[0]?.endsWith("redteam"));
  eq("保留 2 个", out.kept.length, 2);
  const reasons = out.kept.map((k) => k.reason).sort().join("|");
  eq("保留原因", reasons, "not-ours|user-edited:persona-override.md");
  ok("用户改过的目录还在", fs.existsSync(path.join(presets, "reverse", "persona-override.md")));
  ok("别人的目录还在", fs.existsSync(path.join(presets, "cheat", "agent.cordis.yml")));
  ok("自己的目录没了", !fs.existsSync(path.join(presets, "redteam")));
}

console.log("== clearOwnedSelectedDefault（磁盘通道） ==");
const profiles = path.join(tmp, "profiles");
fs.mkdirSync(path.join(profiles, "next"), { recursive: true });
const yml = path.join(profiles, "next", "cordis.patch.yml");
fs.writeFileSync(yml, "- id: x\n  config:\n    selectedDefault: redteam\n", "utf8");
{
  const report = clearOwnedSelectedDefault({ dshHome: tmp });
  const after = fs.readFileSync(yml, "utf8");
  ok("状态 cleared", report.status === "cleared", report.status);
  ok("文件被改", report.files.includes(yml));
  ok("内容已收回", after.includes("selectedDefault: standard"));
  ok("没有残留 redteam 死引用", !/selectedDefault:\s*redteam/.test(after));
}
{
  const again = clearOwnedSelectedDefault({ dshHome: tmp });
  eq("二次调用无变化时 status=none", again.status, "none");
}

console.log("== 无 home 时不抛 ==");
{
  let report = null;
  let threw = "";
  try {
    report = clearOwnedSelectedDefault({ dshHome: path.join(tmp, "does-not-exist") });
  } catch (e) {
    threw = String(e?.message || e);
  }
  ok("不抛异常", threw === "", threw);
  ok("返回报告", report && typeof report.status === "string");
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n结果: ${pass} PASS / ${fail} FAIL`);
if (fail > 0) process.exit(1);
