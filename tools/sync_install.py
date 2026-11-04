"""把源树同步到四个安装位置。

默认只覆盖有变化的文件（按 sha256 比对），不删除目标里多出来的东西——
安装目录可能带着 host 生成的文件，删了会连带丢配置。

加 --prune 时，额外清掉「源树里已经没有」的文件。
删过模块（比如 update.js）之后必须跑一次带 --prune 的：
不清理的话旧文件还躺在 node_modules 里，import 依然找得到，等于没删干净。

用法：
    python tools/sync_install.py            # 真正写入
    python tools/sync_install.py --dry      # 只打印会改哪些文件
    python tools/sync_install.py --prune    # 写入 + 清理已删除的文件
"""
import hashlib
import os
import shutil
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTS = [
    r"C:\Users\Administrator\Desktop\Xsdsh-purge",
    r"C:\Users\Administrator\.dsh\profiles\desktop\node_modules\Xsdsh-purge",
    r"C:\Users\Administrator\.dsh\profiles\headless\node_modules\Xsdsh-purge",
    r"C:\Users\Administrator\.dsh\profiles\web\node_modules\Xsdsh-purge",
]
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".idea", ".vscode", "dist"}
SKIP_EXT = {".pyc", ".log", ".tmp"}
# 工作区里以 _ 开头的是临时目录（_bugreport-*、_tmp、_scratch 之类），
# 不属于插件内容。以前没排除，把解压出来的缺陷报告整套同步进了安装目录。
SKIP_PREFIX = "_"
# 安装目录里允许存在、但不属于源树的文件（host 或用户生成）
PRUNE_KEEP = {".DS_Store", "Thumbs.db"}
PRUNE_KEEP_EXT = {".log", ".bak", ".tmp", ".pyc"}


def digest(path):
    with open(path, "rb") as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def walk(src):
    for base, dirs, files in os.walk(src):
        dirs[:] = [
            d for d in dirs
            if d not in SKIP_DIRS and not (d.startswith(SKIP_PREFIX) and os.path.isdir(os.path.join(base, d)))
        ]
        for name in files:
            if os.path.splitext(name)[1] in SKIP_EXT:
                continue
            full = os.path.join(base, name)
            yield full, os.path.relpath(full, src)


def prune(dest, src_rels, dry):
    """删掉 dest 里源树已经不存在的文件，返回被删的相对路径列表。"""
    removed = []
    for base, dirs, files in os.walk(dest):
        dirs[:] = [d for d in dirs if d not in ("node_modules", "__pycache__", ".git")]
        for name in files:
            if name in PRUNE_KEEP:
                continue
            if os.path.splitext(name)[1] in PRUNE_KEEP_EXT:
                continue
            full = os.path.join(base, name)
            rel = os.path.relpath(full, dest)
            if rel not in src_rels:
                removed.append(rel)
                if not dry:
                    try:
                        os.remove(full)
                    except OSError as e:
                        print("      删除失败 %s: %s" % (rel, e))
    # 顺手清掉空目录
    if not dry:
        for base, dirs, files in os.walk(dest, topdown=False):
            if os.path.abspath(base) == os.path.abspath(dest):
                continue
            try:
                if not os.listdir(base):
                    os.rmdir(base)
            except OSError:
                pass
    return removed


def main():
    dry = "--dry" in sys.argv
    do_prune = "--prune" in sys.argv
    total = 0
    total_pruned = 0

    src_rels = {rel for _, rel in walk(SRC)}

    for dest in DESTS:
        if not os.path.isdir(dest):
            print("跳过（不存在）:", dest)
            continue
        changed = []
        for full, rel in walk(SRC):
            target = os.path.join(dest, rel)
            if os.path.exists(target):
                try:
                    if digest(full) == digest(target):
                        continue
                except OSError:
                    pass
            changed.append(rel)
            if not dry:
                os.makedirs(os.path.dirname(target), exist_ok=True)
                shutil.copy2(full, target)
        total += len(changed)
        print("%-58s %s %d 个文件"
              % (dest.replace("C:\\Users\\Administrator\\", "~"),
                 "待同步" if dry else "已同步", len(changed)))
        for rel in changed:
            print("     +", rel)

        if do_prune:
            gone = prune(dest, src_rels, dry)
            total_pruned += len(gone)
            if gone:
                print("    %s %d 个多余文件" % ("将清理" if dry else "已清理", len(gone)))
                for rel in gone:
                    print("     -", rel)

    print()
    print("DRY RUN：未写入任何文件" if dry
          else "完成，共写入 %d 个文件，清理 %d 个" % (total, total_pruned))
    return 0


if __name__ == "__main__":
    sys.exit(main())
