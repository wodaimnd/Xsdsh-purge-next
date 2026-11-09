/**
 * 临时工具：从 Electron userData 的 localStorage leveldb 里取出浏览器半探针写的 JSON。
 * 用法：node scripts/tmp-probe-read.mjs [键名...]   默认键名：xdsp-probe xdsp-probe-mini xdsp-probe-err
 * leveldb 的 .log 是 Write-Ahead-Log，记录未压缩，所以纯 ASCII 的 JSON 能以字面量读出。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const KEY_DIR = path.join(os.homedir(), ".dsh", "electron-user-data", "Local Storage", "leveldb");
const keys = process.argv.slice(2);
const wanted = keys.length ? keys : ['{"ev":[', '{"mini":[', '{"err"'];

function readShared(fp) {
	const fd = fs.openSync(fp, "r");
	try {
		const size = fs.fstatSync(fd).size;
		const buf = Buffer.alloc(size);
		fs.readSync(fd, buf, 0, size, 0);
		return buf;
	} finally {
		fs.closeSync(fd);
	}
}

/** 从 buf 的 start 处找一个平衡的 JSON 值，返回它的结束下标（含）。 */
function jsonEnd(buf, start) {
	let depth = 0;
	let inStr = false;
	let esc = false;
	for (let i = start; i < buf.length; i += 1) {
		const c = buf[i];
		if (inStr) {
			if (esc) esc = false;
			else if (c === 0x5c) esc = true;
			else if (c === 0x22) inStr = false;
			continue;
		}
		if (c === 0x22) inStr = true;
		else if (c === 0x7b || c === 0x5b) depth += 1;
		else if (c === 0x7d || c === 0x5d) {
			depth -= 1;
			if (depth === 0) return i;
		}
	}
	return -1;
}

const files = fs.readdirSync(KEY_DIR)
	.filter((n) => !n.startsWith("LOCK"))
	.map((n) => path.join(KEY_DIR, n))
	.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

for (const key of wanted) {
	const needle = Buffer.from(key, "utf8");
	let best = null;
	for (const fp of files) {
		let buf;
		try {
			buf = readShared(fp);
		} catch (e) {
			continue;
		}
		let from = 0;
		for (;;) {
			const at = buf.indexOf(needle, from);
			if (at < 0) break;
			const braceAt = at;
			const end = jsonEnd(buf, braceAt);
			if (end > 0) {
				const text = buf.subarray(braceAt, end + 1).toString("utf8");
				try {
					const parsed = JSON.parse(text);
					best = { file: path.basename(fp), at, parsed };
				} catch (e) {
					if (!best) best = { file: path.basename(fp), at, raw: text };
				}
			}
			from = at + needle.length;
		}
	}
	if (!best) {
		process.stdout.write(`\n### ${key}: 未找到\n`);
		continue;
	}
	process.stdout.write(`\n### ${key}  来自 ${best.file} @ ${best.at}\n`);
	if (best.parsed) process.stdout.write(`${JSON.stringify(best.parsed, null, 1)}\n`);
	else process.stdout.write(`${best.raw}\n`);
}
