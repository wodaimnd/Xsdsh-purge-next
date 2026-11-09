/**
 * web-reclaim 的纯逻辑测试：解析、记录读写、存活判定、跳过自身。
 * 不碰真机端口表（除 probeCapability 只读探测），不需要 DSH_HOME。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pfp-web-reclaim-"));
process.env.DSH_HOME = tmp;

const {
  RECORD_DIR, RECORD_PREFIX, recordPath, writeRecord, readRecord,
  isAlive, looksLikeDshWeb, parseNetstatListeners, parseSsListeners,
  parseLsofPids, listStaleRecords, probeCapability,
} = await import("../lib/web-reclaim.js");

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

/* ── 常量 ─────────────────────────────────────────────────────────────── */
eq("记录目录是插件自己的数据目录", RECORD_DIR, "Xsdsh-purge-core");
eq("记录前缀", RECORD_PREFIX, "web-server-");
ok("recordPath 落在 Xsdsh-purge-core/web 下", recordPath(tmp, 24838).includes(path.join("Xsdsh-purge-core", "web", "web-server-24838.json")), recordPath(tmp, 24838));

/* ── netstat（Windows） ───────────────────────────────────────────────── */
const netstat = [
  "",
  "活动连接",
  "",
  "  协议  本地地址          外部地址        状态           PID",
  "  TCP    0.0.0.0:24838         0.0.0.0:0              LISTENING       4521",
  "  TCP    127.0.0.1:10928        0.0.0.0:0              LISTENING       8832",
  "  TCP    192.168.1.5:54321      93.184.216.34:443      ESTABLISHED     4521",
  "  TCP    [::]:24838             [::]:0                 LISTENING       4521",
].join("\r\n");
eq("netstat 只取 LISTENING 行", parseNetstatListeners(netstat), [
  { port: 24838, pid: 4521 },
  { port: 10928, pid: 8832 },
  { port: 24838, pid: 4521 },
]);
eq("netstat 空输入不炸", parseNetstatListeners(""), []);

/* ── ss（Linux） ──────────────────────────────────────────────────────── */
const ss = [
  "State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process",
  'LISTEN 0      511          0.0.0.0:24838      0.0.0.0:*     users:(("node",pid=7788,fd=20))',
  'LISTEN 0      128        127.0.0.1:10928      0.0.0.0:*     users:(("node",pid=7789,fd=21))',
  "ESTAB  0      0        10.0.0.5:55000     10.0.0.9:443",
].join("\n");
eq("ss 取端口与 pid", parseSsListeners(ss), [
  { port: 24838, pid: 7788 },
  { port: 10928, pid: 7789 },
]);
eq("ss 没有 pid= 时 pid 为 0", parseSsListeners("LISTEN 0 128 0.0.0.0:8080 0.0.0.0:*"), [{ port: 8080, pid: 0 }]);

/* ── lsof（macOS 兜底） ───────────────────────────────────────────────── */
const lsof = [
  "COMMAND  PID USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME",
  "node    9012 shin   20u  IPv4 0x1234      0t0  TCP *:24838 (LISTEN)",
  "node    9013 shin   21u  IPv6 0x1235      0t0  TCP [::1]:10928 (LISTEN)",
].join("\n");
eq("lsof 取 pid 与端口", parseLsofPids(lsof), [
  { port: 24838, pid: 9012 },
  { port: 10928, pid: 9013 },
]);

/* ── 命令行判定 ───────────────────────────────────────────────────────── */
ok("认得出 dsh web",
  looksLikeDshWeb('node "C:/Users/x/.dsh/profiles/next/node_modules/@deepseek-ai/dsh/lib/bin.js" web --port 24838'));
ok("认得出带 = 形式的 web", looksLikeDshWeb("/usr/lib/node_modules/@deepseek-ai/dsh/lib/bin.js web"));
ok("别的程序不算", !looksLikeDshWeb("/usr/bin/python3 -m http.server 24838"));
ok("bin.js 但子命令不是 web 不算", !looksLikeDshWeb('node "C:/x/@deepseek-ai/dsh/lib/bin.js" mcp'));
ok("web 但路径不对不算", !looksLikeDshWeb("node /opt/other/bin.js web"));
ok("空串不算", !looksLikeDshWeb(""));

/* ── 记录读写 ─────────────────────────────────────────────────────────── */
const w = writeRecord({ dshHome: tmp, port: 24838, pid: 4521, url: "http://127.0.0.1:24838" });
ok("writeRecord 成功", w.ok, w);
ok("记录文件已落盘", fs.existsSync(w.path), w.path);
const rec = readRecord(w.path);
eq("读回字段", { port: rec.port, pid: rec.pid, url: rec.url }, { port: 24838, pid: 4521, url: "http://127.0.0.1:24838" });
ok("记录带归属标记", JSON.parse(fs.readFileSync(w.path, "utf8")).mark === "Xsdsh-purge-next");
ok("非法端口不写", writeRecord({ dshHome: tmp, port: 0, pid: 1 }).ok === false);
ok("没有 home 不写", writeRecord({ dshHome: "", port: 1, pid: 1 }).ok === false);
fs.writeFileSync(w.path.replace(/\.json$/, "-bad.json"), "{ 不是 json");
ok("坏记录读回 null", readRecord(w.path.replace(/\.json$/, "-bad.json")) === null);

/* ── 存活判定 ─────────────────────────────────────────────────────────── */
ok("自己活着", isAlive(process.pid));
ok("显然不存在的 pid 是死的", !isAlive(999999));
ok("pid 0 是死的", !isAlive(0));

/* ── listStaleRecords ─────────────────────────────────────────────────── */
const dir = path.join(tmp, RECORD_DIR, "web");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${RECORD_PREFIX}1.json`), JSON.stringify({ port: 1, pid: process.pid, url: "", at: "" }));
const stale = listStaleRecords({ dshHome: tmp });
ok("跳过自己的 pid", stale.every((x) => x.pid !== process.pid), stale);
ok("没有 home 时返回空数组", listStaleRecords({ dshHome: "" }).length === 0);

/* ── 能力探测 ─────────────────────────────────────────────────────────── */
const cap = probeCapability();
ok("probeCapability 有平台字段", typeof cap.platform === "string" && cap.platform.length > 0, cap);
ok("probeCapability 的 tools 是对象", cap.tools && typeof cap.tools === "object", cap.tools);

/* ── 收尾 ─────────────────────────────────────────────────────────────── */
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n结果: ${pass} PASS / ${fail} FAIL`);
if (fail > 0) process.exit(1);
