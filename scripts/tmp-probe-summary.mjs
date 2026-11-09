/**
 * 临时：把探针 POST 到 scripts/probe-capture.txt 的最后一条记录，压缩成可读摘要。
 * 用法：node scripts/tmp-probe-summary.mjs [capture文件] [第几条(默认最后)]
 */
import fs from "node:fs";

const fp = process.argv[2] || "scripts/probe-capture.txt";
const which = process.argv[3] ? Number(process.argv[3]) : -1;
const text = fs.readFileSync(fp, "utf8");
const blocks = text.split(/^===== /m).filter((s) => s.includes("POST "));
if (!blocks.length) {
	process.stdout.write("没有捕获到任何 POST\n");
	process.exit(1);
}
const picked = which < 0 ? blocks.slice(which) : [blocks[which]];
process.stdout.write(`共 ${blocks.length} 条捕获，显示 ${picked.length} 条\n`);

const fmt = (r) => (Array.isArray(r) ? `${r[0]} z=${r[2]} pe=${r[3]} bg=${r[4]} ${r[6] || ""}` : String(r));
const short = (arr, n) => (Array.isArray(arr) ? arr.slice(0, n).map(fmt).join("\n      ") : String(arr));

for (const b of picked) {
	const head = b.split("\n")[0];
	const start = b.indexOf('{"');
	if (start < 0) {
		process.stdout.write(`\n${head}\n  (无 JSON)\n`);
		continue;
	}
	let data;
	try {
		data = JSON.parse(b.slice(start).trim());
	} catch (e) {
		process.stdout.write(`\n${head}\n  解析失败：${String(e.message)}\n`);
		continue;
	}
	process.stdout.write(`\n===== ${head}\n`);
	process.stdout.write(`mv=${data.mv} age=${data.age} href=${data.href} mini=${data.mini ? data.mini.length : "-"}\n`);
	const ev = data.ev || data.mini || [];
	for (const e of ev) {
		const k = String(e.k);
		if (k.startsWith("t") && Array.isArray(e.d)) {
			const [present, styles, snapEl, atCenter, atCorner, zchain, ztest] = e.d;
			process.stdout.write(`  -- ${k} @${e.at}ms present=${present} styles=${styles}\n`);
			if (Array.isArray(snapEl)) process.stdout.write(`     按钮: ${snapEl.join(" | ").slice(0, 220)}\n`);
			if (Array.isArray(zchain)) process.stdout.write(`     层级: ${zchain.map((r) => r.join(":")).join("  >  ")}\n`);
			if (Array.isArray(atCenter)) process.stdout.write(`     中心点栈(${atCenter.length}):\n      ${short(atCenter, 4)}\n`);
			if (Array.isArray(atCorner)) process.stdout.write(`     角落栈(${atCorner.length}):\n      ${short(atCorner, 4)}\n`);
			if (Array.isArray(ztest)) process.stdout.write(`     ztest栈:\n      ${short(ztest, 3)}\n`);
		} else {
			process.stdout.write(`  -- ${k} @${e.at}ms ${JSON.stringify(e.d).slice(0, 260)}\n`);
		}
	}
}
