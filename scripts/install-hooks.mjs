/**
 * 安装 git 钩子：pre-commit 跑轻量门禁。
 *
 * 为什么不直接把 .git/hooks/pre-commit 手写进仓库：
 *   .git/hooks 不进版本库，手写的内容换台机器就丢，也没法 review。
 *   钩子正文放在本文件里，仓库内可追溯；重装只需 `npm run hooks:install`。
 *
 * 只跑两个快项（lint + build:client:check，约 2 秒）：
 *   全量测试留在 `npm run gate`，不塞进 pre-commit，否则每次提交都要等几分钟，
 *   结果是所有人开始用 `--no-verify`，门禁等于没有。
 *
 * 用法：
 *   node scripts/install-hooks.mjs                  安装 / 覆盖到当前仓库
 *   node scripts/install-hooks.mjs --print          只打印钩子正文，不落盘
 *   node scripts/install-hooks.mjs --check          已安装且内容一致则退出 0
 *   node scripts/install-hooks.mjs --target=<file>  写到指定路径（测试用，不碰 .git）
 */
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** 找仓库根；插件被复制进 profile（无 git）时返回 null。 */
function repoRoot() {
  try {
    const out = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: PKG_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

/**
 * 生成钩子正文。
 * 插件目录相对路径在安装时烧进去：钩子从仓库根跑，而脚本在子目录里。
 */
export function hookText(pkgRel) {
  return `#!/bin/sh
# Xsdsh-purge-next pre-commit 门禁 —— 由 scripts/install-hooks.mjs 生成，请勿手改。
# 只跑快项：结构与规范扫描 + client.js 生成一致性。全量测试见 \`npm run gate\`。
set -u

PKG_REL='${pkgRel}'

ROOT=$(git rev-parse --show-toplevel) || exit 0
PKG="$ROOT/$PKG_REL"
if [ ! -f "$PKG/package.json" ]; then
  echo "[pre-commit] 未找到插件目录 $PKG_REL（可能已改名）。跳过门禁；请重跑 npm run hooks:install。"
  exit 0
fi
cd "$PKG" || exit 0

fail() {
  echo ""
  echo "[pre-commit] $1"
  echo ""
  exit 1
}

echo "[pre-commit] 结构与规范门禁…"
node scripts/lint.mjs || fail "结构与规范门禁未通过。修法：npm run lint（存量基线可 npm run lint:update，但需在提交信息写明理由）"

echo "[pre-commit] client.js 生成一致性…"
node scripts/build-client.mjs --check || fail "client.js 与拼装结果不一致。修法：改 lib/ui 下的片段（或 lib/redteam/client.js），再 npm run build:client；不要手改 client.js"
`;
}

function parseArg(argv, name) {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return null;
  const eq = hit.indexOf("=");
  return eq < 0 ? true : hit.slice(eq + 1);
}

function main(argv) {
  const root = repoRoot();
  /* 插件目录恰好就是仓库根时 relative() 返回空串，钩子里会变成 PKG="$ROOT/"，虽能跑但打印出来是空的。 */
  const pkgRel = (root && relative(root, PKG_ROOT).replace(/\\/g, "/")) || ".";
  const text = hookText(pkgRel);

  if (parseArg(argv, "print")) {
    process.stdout.write(text);
    return 0;
  }

  const explicit = parseArg(argv, "target");
  const target = typeof explicit === "string" ? explicit : root ? join(root, ".git", "hooks", "pre-commit") : null;

  if (!target) {
    /* 插件被复制进 profile 时没有仓库，这是正常情况，不该让安装失败。 */
    console.log("未检测到 git 仓库（插件可能装在 profile 下），跳过钩子安装。");
    return 0;
  }

  const check = Boolean(parseArg(argv, "check"));
  const current = existsSync(target) ? readFileSync(target, "utf8") : null;

  if (check) {
    if (current === null) {
      console.log(`钩子未安装：${target}`);
      return 1;
    }
    if (current !== text) {
      console.log(`钩子内容与生成结果不一致：${target}`);
      console.log("修法：npm run hooks:install");
      return 1;
    }
    console.log(`钩子已安装且一致：${target}`);
    return 0;
  }

  if (current === text) {
    console.log(`钩子已是最新，无需改动：${target}`);
    return 0;
  }

  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text, "utf8");
  /* Windows 上 chmod 是空操作，git 靠 shebang 识别；只在类 Unix 上设可执行位。 */
  if (process.platform !== "win32") chmodSync(target, 0o755);
  console.log(`已安装 pre-commit 钩子：${target}`);
  console.log(`  插件目录（相对仓库根）：${pkgRel}`);
  console.log("  跑的是快项：lint + build:client:check；全量测试请用 npm run gate。");
  return 0;
}

process.exitCode = main(process.argv.slice(2));
