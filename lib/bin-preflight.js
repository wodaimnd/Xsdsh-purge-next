/**
 * `dsh web` 启动前的端口预检（宿主 bin.js 侧终场哨）。
 *
 * 背景：`lib/restart-web.js` 的重启轮询只在**同一个进程树内**有效。用户从新终端敲
 * `dsh web --port 24838`、而上一轮的 node 还挂在端口上时，新进程会 EADDRINUSE 直接退出。
 * 本模块在宿主 `lib/bin.js` 的 shebang 之后插一行 import，让每个 `dsh web` 启动先等
 * 上一轮把端口让出来（默认最多 1500 ms），再走宿主原来的启动逻辑。
 *
 * 与 `lib/hide-console.js` 的关系：那边的 `installHideConsoleIntoBin` 已经在做同一件事
 * （往 bin.js 插一行 import + 落一个 sidecar），本模块**复用它的路径解析**
 * （`resolveDshBinRoot` / `looksLikeSourceCliRoot`），只用自己的标记与 sidecar 名，
 * 不复制第二套解析逻辑，也不与它抢同一个文件名。
 *
 * 注意：本模块会被 `lib/index.js` 在 apply 阶段调用，也会被 `lib/uninstall.js` 调用，
 * 所以不许 import `core.js`（core 会 import 本模块，反向成环）。
 */
import { readFileSync, existsSync, unlinkSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveDshBinRoot, looksLikeSourceCliRoot } from "./hide-console.js";
import { isAsarSealedPath } from "./desktop.js";
import { diskFs, fsFor } from "./extract-asar.js";

/** bin.js 里的识别标记：改文案时只改这一处。 */
export const MARK = "Xsdsh-purge-next-web-preflight";
/** sidecar 文件名（落在宿主 lib/ 下）。 */
export const SIDECAR = `${MARK}.js`;
/** 插入 bin.js 的那一行。 */
export const IMPORT_LINE = `import "./${SIDECAR}"; // [Xsdsh-purge-next] web preflight`;
/** 预检入口源文件（本包内）。 */
const ENTRY_FILE = "web-preflight-entry.mjs";

/**
 * 把 sidecar 与 import 行装进宿主 `lib/bin.js`。
 *
 * 返回的状态既不是异常也不是布尔，调用方按字符串分支（与 hide-console 保持一致）：
 *   injected / already_injected / skipped_not_win32 / missing_bin /
 *   skipped_source_cli / sealed_asar / error:<原因>
 *
 * @param {string} [aiBase] 宿主 asar 解包目录；省略时按安装布局自动找
 * @returns {string}
 */
export function installBinPreflight(aiBase) {
  if (process.platform !== "win32" && process.platform !== "linux" && process.platform !== "darwin") {
    return "skipped_not_supported";
  }
  try {
    const root = resolveDshBinRoot(aiBase, { fs: diskFs(), path });
    if (!root) return "missing_bin";
    if (looksLikeSourceCliRoot(root, { fs: diskFs(), path })) return "skipped_source_cli";
    const binJs = path.join(root, "lib", "bin.js");
    if (isAsarSealedPath(root) || isAsarSealedPath(binJs)) return "sealed_asar";
    const io = fsFor(diskFs());
    if (!io.existsSync(binJs)) return "missing_bin";

    const side = path.join(root, "lib", SIDECAR);
    const entrySrc = diskFs().readFileSync(
      fileURLToPath(new URL(`./${ENTRY_FILE}`, import.meta.url)),
      "utf8",
    );
    io.mkdirSync(path.dirname(side), { recursive: true });
    io.writeFileSync(side, entrySrc, "utf8");

    const text = io.readFileSync(binJs, "utf8");
    if (text.includes(IMPORT_LINE)) return "already_injected";
    // 旧版本可能留下同一标记但格式不同的行：先清掉再插，避免一行变两行。
    const cleaned = text.replace(new RegExp(`^import "\\./${SIDECAR.replace(/\./g, "\\.")}".*\\r?\\n`, "gm"), "");
    const next = withImportLine(cleaned);
    io.writeFileSync(binJs, next, "utf8");
    return "injected";
  } catch (error) {
    return `error:${error && error.message ? error.message : error}`;
  }
}

/**
 * 把 bin.js 里的 import 行与 sidecar 撤掉。
 * @returns {"reverted"|"absent"|`error:${string}`}
 */
export function revertBinPreflight(aiBase) {
  try {
    const root = resolveDshBinRoot(aiBase, { fs: diskFs(), path });
    if (!root) return "absent";
    const io = fsFor(diskFs());
    const binJs = path.join(root, "lib", "bin.js");
    const side = path.join(root, "lib", SIDECAR);
    let changed = false;

    if (io.existsSync(binJs)) {
      const text = io.readFileSync(binJs, "utf8");
      const cleaned = text.replace(new RegExp(`^import "\\./${SIDECAR.replace(/\./g, "\\.")}".*\\r?\\n`, "gm"), "");
      if (cleaned !== text) {
        io.writeFileSync(binJs, cleaned, "utf8");
        changed = true;
      }
    }
    if (io.existsSync(side)) {
      io.unlinkSync(side);
      changed = true;
    }
    return changed ? "reverted" : "absent";
  } catch (error) {
    return `error:${error && error.message ? error.message : error}`;
  }
}

/** import 行插在 shebang 之后、其余内容之前。 */
function withImportLine(text) {
  if (/^#!/.test(text)) {
    const nl = text.indexOf("\n");
    return nl >= 0
      ? text.slice(0, nl + 1) + IMPORT_LINE + "\n" + text.slice(nl + 1)
      : text + "\n" + IMPORT_LINE + "\n";
  }
  return IMPORT_LINE + "\n" + text;
}

/**
 * 诊断：bin.js 里现在有没有预检行、sidecar 在不在。
 * 给 `/dsh-purge/status` 与设置页用，不参与 apply 判定。
 * @returns {{status:"injected"|"absent"|"partial"|"unknown", bin:string, sidecar:string}}
 */
export function binPreflightState(aiBase) {
  try {
    const root = resolveDshBinRoot(aiBase, { fs: diskFs(), path });
    if (!root) return { status: "unknown", bin: "", sidecar: "" };
    const binJs = path.join(root, "lib", "bin.js");
    const side = path.join(root, "lib", SIDECAR);
    const hasBin = existsSync(binJs) && readFileSync(binJs, "utf8").includes(IMPORT_LINE);
    const hasSide = existsSync(side);
    const status = hasBin && hasSide ? "injected" : hasBin || hasSide ? "partial" : "absent";
    return { status, bin: binJs, sidecar: side };
  } catch {
    return { status: "unknown", bin: "", sidecar: "" };
  }
}

/**
 * 清理遗留记录：pid 已死的记录删掉，避免预检每次都白等。
 * 供宿主侧 preflight 入口与面板「清理记录」按钮共用。
 * @param {string} home DSH_HOME
 * @returns {{removed:string[], kept:string[]}}
 */
export function sweepDeadRecords(home) {
  const out = { removed: [], kept: [] };
  const dir = path.join(String(home || ""), "Xsdsh-purge-core", "web");
  let names = [];
  try {
    names = readdirSync(dir).filter((n) => n.startsWith("web-server-") && n.endsWith(".json"));
  } catch {
    return out;
  }
  for (const name of names) {
    const fp = path.join(dir, name);
    let rec = null;
    try {
      rec = JSON.parse(readFileSync(fp, "utf8"));
    } catch {
      rec = null;
    }
    const pid = Number(rec && rec.pid);
    if (!rec || !Number.isFinite(pid) || pid <= 0 || !alive(pid)) {
      try {
        unlinkSync(fp);
        out.removed.push(fp);
      } catch {
        out.kept.push(fp);
      }
      continue;
    }
    out.kept.push(fp);
  }
  return out;
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return Boolean(error && error.code === "EPERM");
  }
}
