/**
 * 临时诊断接收端：接收浏览器半探针 POST 过来的 DOM 追踪数据。
 * 用法：node scripts/probe-server.mjs [输出文件]  （默认 scripts/probe-capture.txt）
 * 端口用环境变量 XDSP_PROBE_PORT 覆盖，默认 47999。
 * 定位完成后本文件可删。
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = Number(process.env.XDSP_PROBE_PORT || 47999);
const OUT = path.resolve(process.argv[2] || "scripts/probe-capture.txt");

const server = http.createServer((req, res) => {
	const chunks = [];
	req.on("data", (c) => chunks.push(c));
	req.on("end", () => {
		const body = Buffer.concat(chunks).toString("utf8");
		const url = req.url || "/";
		const cors = {
			"content-type": "text/plain; charset=utf-8",
			"access-control-allow-origin": "*",
			"access-control-allow-headers": "*",
			"access-control-allow-methods": "POST, GET, OPTIONS",
		};
		if (req.method === "OPTIONS") {
			res.writeHead(204, cors);
			res.end();
			return;
		}
		if (url.startsWith("/diag")) {
			const line = `\n===== ${new Date().toISOString()} ${req.method} ${url} len=${body.length} =====\n${body}\n`;
			try {
				fs.appendFileSync(OUT, line);
			} catch (e) {
				process.stdout.write(`[probe] 写文件失败：${String(e && e.message)}\n`);
			}
			process.stdout.write(`[probe] 已捕获 ${body.length} 字节 → ${OUT}\n`);
			res.writeHead(200, cors);
			res.end("ok");
			return;
		}
		res.writeHead(200, cors);
		res.end("probe alive");
	});
});

server.on("error", (e) => {
	process.stdout.write(`[probe] 监听失败：${String(e && e.message)}\n`);
	process.exit(1);
});

server.listen(PORT, "127.0.0.1", () => {
	process.stdout.write(`[probe] 监听 http://127.0.0.1:${PORT} → ${OUT}\n`);
});
