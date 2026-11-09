/**
 * bin-preflight 的桩环境测试：在临时目录造一个假宿主根（lib/bin.js），
 * 走 install / 幂等 / state / revert / 跳过分支，最后验证 sidecar 内容只依赖 node 内置。
 * 全程不碰真实安装。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pfp-bin-preflight-"));
process.env.DSH_HOME = tmp;

const { MARK, SIDECAR, IMPORT_LINE, installBinPreflight, revertBinPreflight, binPreflightState, sweepDeadRecords } =
  await import("../lib/bin-preflight.js");

let pass = 0;
let fail = 0;
function ok(name, cond, extra) {
  if (cond) {
    pass += 1;
    return;
  }
  fail += 1;
  console.log(`  FAIL  ${name}${extra === undefined ? "" : "  → " + JSON.stringify(extra)}`);
}
function eq(name, actual, expected) {
  const same = JSON.stringify(actual) === JSON.stringify(expected);
  ok(name, same, same ? undefined : { actual, expected });
}
function mkRoot(label, { shebang = true, sides = {} } = {}) {
  const root = path.join(tmp, label);
  fs.mkdirSync(path.join(root, "lib"), { recursive: true });
  const body = [
    shebang ? "#!/usr/bin/env node" : null,
    'import { spawn } from "node:child_process";',
    'const argv = process.argv.slice(2);',
    'if (argv[0] === "web") spawn(process.execPath, ["web"], { stdio: "inherit" });',
    "",
  ].filter((x) => x !== null).join("\n");
  fs.writeFileSync(path.join(root, "lib", "bin.js"), body, "utf8");
  for (const [name, content] of Object.entries(sides)) fs.writeFileSync(path.join(root, "lib", name), content, "utf8");
  return root;
}

/* ── 常量 ─────────────────────────────────────────────────────────────── */
eq("标记", MARK, "Xsdsh-purge-next-web-preflight");
eq("sidecar 名", SIDECAR, "Xsdsh-purge-next-web-preflight.js");
ok("import 行带标记注释", IMPORT_LINE.startsWith('import "./Xsdsh-purge-next-web-preflight.js"'), IMPORT_LINE);

/* ── 正常注入 ─────────────────────────────────────────────────────────── */
const root = mkRoot("normal");
const r1 = installBinPreflight(root);
eq("首次注入成功", r1, "injected");
const after = fs.readFileSync(path.join(root, "lib", "bin.js"), "utf8");
const lines = after.split(/\r?\n/);
eq("shebang 保持第一行", lines[0], "#!/usr/bin/env node");
eq("import 行紧跟 shebang", lines[1], IMPORT_LINE);
ok("原有内容没丢", after.includes('spawn(process.execPath, ["web"]'), after.slice(0, 200));
ok("sidecar 已落盘", fs.existsSync(path.join(root, "lib", SIDECAR)));

const side = fs.readFileSync(path.join(root, "lib", SIDECAR), "utf8");
ok("sidecar 含预检入口注释", side.includes("[Xsdsh-purge-next/preflight]"), side.slice(0, 120));
ok("sidecar 不 import 本插件相对路径", !/from\s+"\.\.?\//.test(side) && !/from\s+"\.\//.test(side), side.match(/from\s+"[^"]+"/g));
ok("sidecar 只 import node 内置", (side.match(/from\s+"([^"]+)"/g) || []).every((s) => s.includes('"node:')), side.match(/from\s+"[^"]+"/g));
ok("sidecar 不碰 netstat 之外的 shell 注入面", !side.includes("child_process").valueOf() || side.includes("spawnSync"), "spawnSync 存在");
ok("sidecar 自带调试开关", side.includes("DSH_PURGE_PREFLIGHT_DEBUG"));

/* ── 幂等 ─────────────────────────────────────────────────────────────── */
eq("二次注入不重复", installBinPreflight(root), "already_injected");
const again = fs.readFileSync(path.join(root, "lib", "bin.js"), "utf8");
eq("import 行只有一处", again.split(IMPORT_LINE).length - 1, 1);

/* ── 状态诊断 ─────────────────────────────────────────────────────────── */
const st = binPreflightState(root);
eq("状态 injected", st.status, "injected");
ok("状态带 bin 路径", st.bin.endsWith(path.join("lib", "bin.js")), st.bin);

/* ── 还原 ─────────────────────────────────────────────────────────────── */
eq("还原成功", revertBinPreflight(root), "reverted");
const back = fs.readFileSync(path.join(root, "lib", "bin.js"), "utf8");
eq("还原后只剩 shebang 行", back.split(/\r?\n/)[0], "#!/usr/bin/env node");
ok("还原后没有 import 行", !back.includes(IMPORT_LINE), back.slice(0, 120));
ok("还原后 sidecar 已删", !fs.existsSync(path.join(root, "lib", SIDECAR)));
eq("二次还原是 absent", revertBinPreflight(root), "absent");
eq("还原后状态 absent", binPreflightState(root).status, "absent");

/* ── 没有 shebang ─────────────────────────────────────────────────────── */
const bare = mkRoot("bare", { shebang: false });
eq("无 shebang 也能注入", installBinPreflight(bare), "injected");
eq("import 行落到第一行", fs.readFileSync(path.join(bare, "lib", "bin.js"), "utf8").split(/\r?\n/)[0], IMPORT_LINE);

/* ── 跳过分支 ─────────────────────────────────────────────────────────── */
const srcCli = mkRoot("srccli");
fs.writeFileSync(path.join(srcCli, "lib", "tsconfig.tsbuildinfo"), "{}", "utf8");
eq("源码 cli 只读跳过", installBinPreflight(srcCli), "skipped_source_cli");
ok("源码 cli 的 bin.js 未被改", !fs.readFileSync(path.join(srcCli, "lib", "bin.js"), "utf8").includes(IMPORT_LINE));

const empty = path.join(tmp, "empty");
fs.mkdirSync(empty, { recursive: true });
eq("找不到 bin.js", installBinPreflight(empty), "missing_bin");
eq("找不到时还原是 absent", revertBinPreflight(empty), "absent");
eq("找不到时状态 unknown", binPreflightState(empty).status, "unknown");

/* ── 旧格式残留会被清掉 ───────────────────────────────────────────────── */
const legacy = mkRoot("legacy");
const legacyBin = path.join(legacy, "lib", "bin.js");
const old = '#!/usr/bin/env node\nimport "./Xsdsh-purge-next-web-preflight.js"; // 老版本\nimport x from "node:path";\n';
fs.writeFileSync(legacyBin, old, "utf8");
eq("旧行被替换而不是叠加", installBinPreflight(legacy), "injected");
eq("只剩一行 import", fs.readFileSync(legacyBin, "utf8").split("Xsdsh-purge-next-web-preflight.js").length - 1, 1);

/* ── 死记录清扫 ───────────────────────────────────────────────────────── */
const webDir = path.join(tmp, "Xsdsh-purge-core", "web");
fs.mkdirSync(webDir, { recursive: true });
fs.writeFileSync(path.join(webDir, "web-server-1.json"), JSON.stringify({ port: 1, pid: 999999 }), "utf8");
fs.writeFileSync(path.join(webDir, "web-server-2.json"), JSON.stringify({ port: 2, pid: process.pid }), "utf8");
fs.writeFileSync(path.join(webDir, "web-server-3.json"), "{ 坏 json", "utf8");
fs.writeFileSync(path.join(webDir, "other.json"), JSON.stringify({ port: 4, pid: 999999 }), "utf8");
const swept = sweepDeadRecords(tmp);
eq("删掉死 pid 与坏记录", swept.removed.length, 2);
eq("留下自己的记录", swept.kept.length, 1);
ok("留下的是自己的 pid", swept.kept[0].endsWith("web-server-2.json"), swept.kept);
ok("非 web-server- 前缀不动", fs.existsSync(path.join(webDir, "other.json")));
eq("没有目录时返回空", sweepDeadRecords(path.join(tmp, "nope")), { removed: [], kept: [] });

/* ── 收尾 ─────────────────────────────────────────────────────────────── */
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n结果: ${pass} PASS / ${fail} FAIL`);
if (fail > 0) process.exit(1);
