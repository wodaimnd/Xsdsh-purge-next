import fs from "node:fs";

/* 从 asar 文件里按绝对偏移读取一段并打印（不解包，只读字节） */
const file = process.argv[2];
const start = Number(process.argv[3]);
const len = Number(process.argv[4] || 6000);
const fd = fs.openSync(file, "r");
const buf = Buffer.allocUnsafe(len);
fs.readSync(fd, buf, 0, len, start);
fs.closeSync(fd);
process.stdout.write(buf.toString("utf8"));
