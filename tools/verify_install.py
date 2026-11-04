"""核对四个安装位置的 Xsdsh-purge 是否与源树逐字节一致。"""
import hashlib
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# 源树路径从脚本位置推出来，不写死：项目目录改过名（dsh-purge → Xsdsh-purge），
# 写死的话一改名整张表就全是 MISSING。
SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTS = [
    r"C:\Users\Administrator\Desktop\Xsdsh-purge",
    r"C:\Users\Administrator\.dsh\profiles\desktop\node_modules\Xsdsh-purge",
    r"C:\Users\Administrator\.dsh\profiles\headless\node_modules\Xsdsh-purge",
    r"C:\Users\Administrator\.dsh\profiles\web\node_modules\Xsdsh-purge",
]
FILES = [
    "client.js",
    "package.json",
    r"lib\index.js",
    r"lib\rewrite.js",  # refusal-test 共用的只读模型选择器
    r"lib\wallpapers.js",
    r"lib\wallpapers\naco-neko.mp4",
    r"lib\wallpapers\tenene-nachoneko.mp4",
    r"lib\wallpapers\natsuki-nachoneko.jpg",
    # 桌宠：静态资源服务 + 三张眨眼帧 + 拆腿素材（走路用）
    r"lib\pet.js",
    r"lib\pet\pet-open.png",
    r"lib\pet\pet-half.png",
    r"lib\pet\pet-closed.png",
    r"lib\pet\pet-body-open.png",
    r"lib\pet\pet-body-half.png",
    r"lib\pet\pet-body-closed.png",
    r"lib\pet\pet-leg-left.png",
    r"lib\pet\pet-leg-right.png",
    r"lib\pet\pet-grab.png",
    r"lib\pet\pet-squint.png",
    # 猫猫分区的背景音乐（从 Wallpaper Engine 的 scene.pkg 里解出来的）
    r"lib\cat\bgm.mp3",
    r"lib\cat.js",
]


def digest(path):
    try:
        with open(path, "rb") as fh:
            return hashlib.sha256(fh.read()).hexdigest()[:12]
    except OSError:
        return "MISSING"


print("%-38s %-14s %s" % ("文件", "源哈希", "Desktop desktop headless web"))
print("-" * 78)
all_ok = True
for rel in FILES:
    src_hash = digest(os.path.join(SRC, rel))
    marks = []
    for d in DESTS:
        same = digest(os.path.join(d, rel)) == src_hash
        marks.append("OK" if same else " X")
        if not same:
            all_ok = False
    print("%-38s %-14s %s" % (rel, src_hash, "       ".join(marks)))

print()
for d in DESTS:
    pj = os.path.join(d, "package.json")
    ver = "?"
    if os.path.exists(pj):
        with open(pj, encoding="utf-8") as fh:
            ver = json.load(fh)["version"]
    print("%-56s v%s" % (d.replace("C:\\Users\\Administrator\\", "~"), ver))

print()
print("RESULT: ALL MATCH" if all_ok else "RESULT: MISMATCH")
sys.exit(0 if all_ok else 1)

