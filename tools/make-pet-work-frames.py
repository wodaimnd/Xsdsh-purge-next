"""
生成桌宠「工作联动」用的表情帧。

设计原则（试错之后定下来的，别再走回头路）：

  · 眼睛不做像素运算。
    这张图是「大眼无眼白」风格，虹膜几乎填满眼眶、且带青色渐变。
    试过三条路都失败：
      1. 水平切割擦虹膜 -> 残留一条直横带，是「半睁」不是笑，渐变还被擦出毛边
      2. 弧形切割逐像素擦 -> 两眼 bbox 不同，各按自身比例算弧度，绝对高度错开，
         左眼露青、右眼全闭，不对称
      3. 整块填皮肤再画弧 -> 填充溢出到刘海，弧线还会画到额头上
    （第 3 条的根因是 iris_core 判据偏松，把刘海高光和虹膜连成一片，
      实测右眼 x=123..130 那几列 ymin 恒为 103，而真正虹膜从 112 才开始。）

  · 改用已有的闭眼帧当底。
    pet-closed.png 是 make-pet-frames.py 用泛洪填肤色做的，本身就是自然闭眼，
    睫毛线保留、没有渐变残留。笑眼在日式卡通里就是闭眼 + 笑嘴，
    所以 happy / sleep 都拿它当底，只换嘴 —— 眼睛零改动，不可能错位。

  · 惊讶不换眼。
    原图本来就是睁大的，硬造眼白会变成白条（实测提亮 58% 后
    被判成虹膜的像素数和原图一模一样，等于没动）。只把嘴收成小圆。

产出：
  pet-happy.png     弯眼笑（闭眼 + 笑弧嘴 + 淡腮红）
  pet-surprise.png  惊讶（原睁眼 + 小圆嘴）
  pet-sleep.png     睡着（闭眼 + 放松小嘴；Zzz 由运行时画在 canvas 上）

用法：python tools/make-pet-work-frames.py
"""

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent.parent
OUT = HERE / "lib" / "pet"

EYE_BOXES = [(44, 96, 78, 140), (98, 100, 132, 142)]
MOUTH_BOX = (66, 138, 104, 166)

MOUTH_DARK = (108, 58, 62, 250)
MOUTH_INNER = (224, 130, 136, 245)
BLUSH = (255, 170, 172, 78)


def lum(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def is_skin(r, g, b, a):
    if a < 128:
        return False
    if lum(r, g, b) < 196:
        return False
    return r >= g >= b - 8


def is_iris_like(r, g, b, a):
    """虹膜或眼白：偏蓝、且不是肤色。"""
    if a < 128:
        return False
    if is_skin(r, g, b, a):
        return False
    return (b - r) >= 14 and b > 95


def column_skin(px, x, y_start, size, max_dy=18):
    w, h = size
    for dy in range(max_dy):
        y = y_start + dy
        if y >= h:
            break
        r, g, b, a = px[x, y]
        if is_skin(r, g, b, a):
            return (r, g, b)
    return None


def find_mouth(im):
    px = im.load()
    x0, y0, x1, y1 = MOUTH_BOX
    pts = []
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            r, g, b, a = px[x, y]
            if a < 128:
                continue
            if r > 150 and r - g > 46 and r - b > 40:
                pts.append((x, y))
    if not pts:
        return None
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return {
        "cx": (min(xs) + max(xs)) / 2,
        "cy": (min(ys) + max(ys)) / 2,
        "w": max(xs) - min(xs) + 1,
        "h": max(ys) - min(ys) + 1,
    }


def erase_mouth(im, cx, cy, pad=11):
    """把原来的嘴擦成周边肤色。取嘴框下方的皮肤色，避免取到衣领。"""
    out = im.copy()
    px = im.load()
    op = out.load()
    erase = set()
    for y in range(int(cy) - pad, int(cy) + pad + 1):
        for x in range(int(cx) - pad, int(cx) + pad + 1):
            if not (0 <= x < out.size[0] and 0 <= y < out.size[1]):
                continue
            skin = column_skin(px, x, MOUTH_BOX[3] + 1, out.size) or (255, 236, 224)
            op[x, y] = skin + (op[x, y][3],)
            erase.add((x, y))
    blur = out.filter(ImageFilter.GaussianBlur(0.7))
    mask = Image.new("L", out.size, 0)
    mp = mask.load()
    for (x, y) in erase:
        if 0 <= x < out.size[0] and 0 <= y < out.size[1]:
            mp[x, y] = 255
    mask = mask.filter(ImageFilter.GaussianBlur(0.6))
    return Image.composite(blur, out, mask)


def clean_closed(im):
    """
    把闭眼帧里残留的零星虹膜像素补成肤色。

    make-pet-frames.py 的 make_closed 用泛洪填肤色，泛洪边界上
    会漏掉几个抗锯齿像素（实测左眼 7 个、右眼 6 个，集中在
    y=109~118）。数量少但放大后能看见浅蓝点，补掉。
    """
    out = im.copy()
    px = im.load()
    op = out.load()
    fixed = 0
    for (x0, y0, x1, y1) in EYE_BOXES:
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                r, g, b, a = px[x, y]
                if not is_iris_like(r, g, b, a):
                    continue
                skin = column_skin(px, x, y1 + 1, out.size) or (254, 231, 216)
                op[x, y] = skin + (op[x, y][3],)
                fixed += 1
    return out, fixed


def make_happy(closed, base):
    """
    弯眼笑 = 闭眼帧 + 上弯的笑弧嘴 + 淡腮红。

    笑弧用逐点画而不是 ImageDraw.arc：arc 只吃椭圆包围盒，
    两端收不细，和原嘴的粗细对不上。逐点可以控制两端归零。
    """
    out = closed.copy()
    mouth = find_mouth(base)
    if mouth:
        mx, my = mouth["cx"], mouth["cy"]
        out = erase_mouth(out, mx, my, pad=11)
        d = ImageDraw.Draw(out)
        half_w = 8.0
        n = 48
        pts = []
        for i in range(n + 1):
            t = i / n
            x = mx - half_w + t * half_w * 2
            # 向下凸的弧（嘴角上翘）：sin 让中间低、两端高
            y = my - 1.0 + 3.2 * math.sin(math.pi * t)
            pts.append((x, y))
        d.line(pts, fill=MOUTH_DARK, width=2, joint="curve")
        d.line([pts[0], pts[1]], fill=MOUTH_DARK, width=1)
        d.line([pts[-2], pts[-1]], fill=MOUTH_DARK, width=1)

    blush = Image.new("RGBA", out.size, (0, 0, 0, 0))
    bd = ImageDraw.Draw(blush)
    for bx in (50, 118):
        bd.ellipse([bx - 10, 136, bx + 10, 150], fill=BLUSH)
    blush = blush.filter(ImageFilter.GaussianBlur(3.6))
    return Image.alpha_composite(out, blush)


def make_surprise(base):
    """
    惊讶 = 原睁眼 + 小圆嘴。

    眼睛不动：原图本来就是睁大的。只把嘴从原来的扁椭圆
    收成小圆，视觉上就是「咦？」。
    """
    out = base.copy()
    mouth = find_mouth(base)
    if mouth:
        mx, my = mouth["cx"], mouth["cy"]
        out = erase_mouth(out, mx, my, pad=11)
        d = ImageDraw.Draw(out)
        rw, rh = 4.4, 5.4
        d.ellipse([mx - rw, my - rh, mx + rw, my + rh], fill=MOUTH_DARK)
        d.ellipse([mx - rw * 0.42, my + rh * 0.10, mx + rw * 0.42, my + rh * 0.66], fill=MOUTH_INNER)
    return out


def make_sleep(closed, base):
    """
    睡着 = 闭眼帧 + 一条很浅的放松小嘴。

    和 happy 的区别靠两点：嘴型（浅弧 vs 大弧笑），
    以及运行时画的 Zzz 气泡（在 canvas 上，不占素材）。
    """
    out = closed.copy()
    mouth = find_mouth(base)
    if mouth:
        mx, my = mouth["cx"], mouth["cy"]
        out = erase_mouth(out, mx, my, pad=11)
        d = ImageDraw.Draw(out)
        half_w = 4.0
        n = 24
        pts = []
        for i in range(n + 1):
            t = i / n
            x = mx - half_w + t * half_w * 2
            y = my + 0.4 + 1.4 * math.sin(math.pi * t)
            pts.append((x, y))
        d.line(pts, fill=MOUTH_DARK, width=1, joint="curve")
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    base = Image.open(OUT / "pet-open.png").convert("RGBA")
    closed_src = Image.open(OUT / "pet-closed.png").convert("RGBA")
    closed, fixed = clean_closed(closed_src)
    print(f"基准: pet-open.png / pet-closed.png  {base.size}")
    print(f"闭眼帧补掉残留虹膜像素: {fixed} 个")

    if fixed:
        closed.save(OUT / "pet-closed.png")
        print("pet-closed.png 已更新（眨眼帧同步受益）")

    made = {}
    for name, img in (
        ("happy", make_happy(closed, base)),
        ("surprise", make_surprise(base)),
        ("sleep", make_sleep(closed, base)),
    ):
        img.save(OUT / f"pet-{name}.png")
        made[name] = img
        print(f"pet-{name}.png  {img.size}")

    cw, ch = 110, 90
    ox, oy = 44, 92
    faces = [("open", base), ("closed", closed)] + [(k, v) for k, v in made.items()]
    sheet = Image.new("RGBA", (cw * 4 * len(faces), ch * 4), (255, 255, 255, 255))
    for i, (name, img) in enumerate(faces):
        crop = img.crop((ox, oy, ox + cw, oy + ch)).resize((cw * 4, ch * 4), Image.NEAREST)
        sheet.paste(crop, (i * cw * 4, 0))
    sheet.save(OUT / "_preview-work.png")
    print("_preview-work.png  对照图（睁 / 闭 / 笑 / 惊讶 / 睡）")


if __name__ == "__main__":
    main()
