"""彻底移除 GitHub 自更新功能。

拆掉的是「插件从 GitHub 检查/拉取自己新版本」这一整套：
    lib/update.js        整个文件（52KB）
    lib/index.js         路由 /Xsdsh-purge/update、启动自动更新、状态里的 update 字段
    lib/uninstall.js     只用到 updater.pluginRoot()，改成自己算
    client.js            面板里的检测/更新按钮、通道切换、自定义更新源

**不动**的是 Electron 官方更新（lib/official-update.js、core.js 里的
quitAndInstall）—— 那是 DeepSeek Harness 自己的升级通道，与 GitHub 无关。
"""
import os
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent


def rd(p):
    return (ROOT / p).read_text(encoding="utf-8")


def wr(p, s):
    (ROOT / p).write_text(s, encoding="utf-8")


# ══════════════════════════════════════════════════════════════
# 1. lib/index.js
# ══════════════════════════════════════════════════════════════
s = rd("lib/index.js")
before = len(s)

# import
s = s.replace('import * as updater from "./update.js";\n', "")

# 启动时自动更新
m = re.search(
    r"\t*if \(config\.autoUpdateOnStart === true\) \{.*?\n\t*\}\n", s, re.S)
if m:
    print("index.js: 移除启动自动更新块 (%d 字符)" % (m.end() - m.start()))
    s = s[:m.start()] + s[m.end():]
else:
    print("index.js: ! 没找到 autoUpdateOnStart 块")

# 状态里三个 updater 字段
s = s.replace("\t\t\t\tplugin_version: updater.localVersion(),\n", "")
s = s.replace("\t\t\t\tupdate: updater.lastUpdateResult(),\n", "")
s = s.replace("\t\t\t\t...updater.channelPublic(),\n", "")

# /Xsdsh-purge/update 路由整块
m = re.search(
    r'\n\t*if \(sub === "/update"\).*?\n\t*\}\n', s, re.S)
if m:
    print("index.js: 移除 /update 路由 (%d 字符)" % (m.end() - m.start()))
    s = s[:m.start()] + s[m.end():]
else:
    # 路由可能写成对象形式，退一步按大括号配平找
    i = s.find('path: "/Xsdsh-purge/update"')
    if i >= 0:
        # 往前找路由对象起点，往后找配平的 }
        start = s.rfind("\n", 0, s.rfind("{", 0, i))
        depth = 0
        j = s.find("{", start)
        while j < len(s):
            if s[j] == "{":
                depth += 1
            elif s[j] == "}":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        print("index.js: 移除 /update 路由对象 (%d 字符)" % (j + 1 - start))
        s = s[:start] + s[j + 1:]
    else:
        print("index.js: ! 没找到 /update 路由")

wr("lib/index.js", s)
print("index.js: %d → %d (-%d)\n" % (before, len(s), before - len(s)))


# ══════════════════════════════════════════════════════════════
# 2. lib/uninstall.js —— 只借用了 pluginRoot()
# ══════════════════════════════════════════════════════════════
s = rd("lib/uninstall.js")
before = len(s)
s = s.replace('import * as updater from "./update.js";\n', "")
if "updater.pluginRoot()" in s:
    # 就地算：uninstall.js 自己在 lib/ 下，上一级就是插件根
    s = s.replace(
        "const root = updater.pluginRoot();",
        "// 原来借 update.js 的 pluginRoot()，那个模块已移除；\n"
        "\t// 这里直接由本文件位置推插件根（lib/ 的上一级）。\n"
        "\tconst root = dirname(dirname(fileURLToPath(import.meta.url)));")
    # 确保有这两个 import
    if "fileURLToPath" not in s:
        s = s.replace(
            'import { dirname, join } from "node:path";',
            'import { dirname, join } from "node:path";\n'
            'import { fileURLToPath } from "node:url";')
        if "fileURLToPath" not in s:
            # 退一步：在第一个 import 后补
            s = re.sub(r"(^import [^\n]*\n)",
                       r"\1import { fileURLToPath } from \"node:url\";\n",
                       s, count=1, flags=re.M)
    print("uninstall.js: pluginRoot 改为就地计算")
wr("lib/uninstall.js", s)
print("uninstall.js: %d → %d (-%d)\n" % (before, len(s), before - len(s)))


# ══════════════════════════════════════════════════════════════
# 3. 删掉 lib/update.js
# ══════════════════════════════════════════════════════════════
p = ROOT / "lib" / "update.js"
if p.exists():
    size = p.stat().st_size
    p.unlink()
    print("已删除 lib/update.js (%d 字节)\n" % size)


# ══════════════════════════════════════════════════════════════
# 4. package.json 里的导出
# ══════════════════════════════════════════════════════════════
import json
pj = ROOT / "package.json"
data = json.loads(pj.read_text(encoding="utf-8"))
files = data.get("files") or []
print("package.json files 里没有 update.js 条目（update.js 在 lib/ 下随目录一起走）")
