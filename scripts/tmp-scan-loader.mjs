import fs from "node:fs";

const file = process.argv[2];
const needle = process.argv[3] || "ModuleLoader";
const maxHits = Number(process.argv[4] || 30);

const fd = fs.openSync(file, "r");
const size = fs.fstatSync(fd).size;
const CHUNK = 4 * 1024 * 1024;
const overlap = 256;
const buf = Buffer.allocUnsafe(CHUNK);

let hits = 0;
for (let off = 0; off < size && hits < maxHits; off += CHUNK - overlap) {
  const len = Math.min(CHUNK, size - off);
  fs.readSync(fd, buf, 0, len, off);
  let from = 0;
  for (;;) {
    const i = buf.indexOf(needle, from, "utf8");
    if (i < 0) break;
    hits++;
    const start = Math.max(0, i - 120);
    const end = Math.min(len, i + 200);
    const ctx = buf.subarray(start, end).toStringenge = buf.subarray(start, end).toString("latin1");
    console.log("--- offset " + (off + i) + " ---");
    console.log(JSON.stringify(ctx.replace(/[^\x20-\x7e\u00a0-\uffff]/g, ".")));
    if (hits >= maxHits) break;
    from = i + needle.length;
  }
}
fs.closeSync(fd);
console.log("total hits:", hits, "file size:", sizeHolder());
function sizeHolder() { return size; }
