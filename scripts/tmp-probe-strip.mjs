/**
 * 临时：把 __XDSP_STACK_BEGIN__ / __XDSP_STACK_END__ 之间的诊断块，以及它的调用行，从 client.js 里摘掉。
 * 只做精确子串删除，其余字节原样保留。
 */
import fs from "node:fs";

const fp = process.argv[2] || "client.js";
let text = fs.readFileSync(fp, "utf8");
const before = text.length;

const begin = "/* __XDSP_STACK_BEGIN__";
const endMark = "/* __XDSP_STACK_END__ */\n";
const b = text.indexOf(begin);
const e = text.indexOf(endMark);
if (b < 0 || e < 0 || e < b) {
	process.stdout.write(`标记未找到 b=${b} e=${e}\n`);
	process.exit(1);
}
text = text.slice(0, b) + text.slice(e + endMark.length);

const callLine = "\t\t\t__xdspProbeStack();\n";
const calls = text.split(callLine).length - 1;
text = text.split(callLine).join("");

fs.writeFileSync(fp, text);
process.stdout.write(`删除块 ${e + endMark.length - b} 字节，删除调用行 ${calls} 处；文件 ${before} → ${text.length}\n`);
