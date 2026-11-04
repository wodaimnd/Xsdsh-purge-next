"""
生成桌宠的表情帧。

  pet-grab.png    被托起来：半闭眼（复用眨眼那套真眼睑）+ 张圆的嘴 + 一滴汗
  pet-squint.png  思考眯眼：上眼睑压下 45%，和 open 之间过渡做微表情

关于 grab 表情为什么不再手画 >< 折线：
  204×320 的小图上手画折线，笔画粗细、抗锯齿、和原画睫毛的叠压都很难对齐；
  放大看是一团，缩到实际显示尺寸（约 0.6 倍）就是几根歪线，反而更怪。
  改成复用眨眼用的真眼睑（半闭），配上张嘴和汗滴——
  眼睛是原画像素，怎么缩都干净；情绪靠嘴/汗滴表达，再靠身体形变（压扁+抖动）加强。

用法：python tools/make-pet-expressions.py <源图>
"""
import sys
from collections import deque
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else "pet-src.gif"
OUT = Path(__file__).resolve().parent.parent / "lib" / "pet"

EYE_BOXES = [(46, 100, 74, 138), (100, 105, 128, 138)]
MOUTH_BOX = (66, 138, 104, 166)

SWEAT = (146, 202, 236, 210)
MOUTH_DARK = (108, 58, 62, 250)
MOUTH_INNER = (224, 130, 136, 245)


def lum(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def is_skin(r, g, b, a):
    if a < 128:
        return False
    if lum(r, g, b) < 196:
        return False
    return r >= g >= b - 8


def is_lash_px(r, g, b, a):
    """
    睫毛/眼线。

    只靠亮度判会留横向条纹：虹膜**顶部**那几行是深藏青，
    lum 在 98~102，和真睫毛（lum 42~61）落在同一个区间，
    于是被当成睫毛跳过擦除，眼皮压下去以后就剩一条条横线。

    加蓝色通道才分得开。实测这张图：
      真睫毛  b = 26..91
      虹膜暗部 b = 98..134
    分界取 95，两边都没有样本落进 ±3 的灰区。
    """
    if a < 100:
        return False
    if b >= 95:
        return False
    return lum(r, g, b) < 100


def is_iris(r, g, b, a):
    """虹膜判据（泛洪种子）。必须严格，放松会把浅蓝头发丝圈进来。"""
    return a >= 128 and (b - r) >= 18 and b > 110


def is_iris_core(r, g, b, a):
    """虹膜核心（擦除用）。虹膜顶部那圈深蓝过不了严格判据，这里放松但用 r 挡头发。"""
    return a >= 128 and (b - r) >= 12 and b >= 70 and r < 135


def flood(im, box):
    x0, y0, x1, y1 = box
    px = im.load()
    w, h = im.size
    seeds = [(x, y) for y in range(y0, y1 + 1) for x in range(x0, x1 + 1) if is_iris(*px[x, y])]
    if not seeds:
        return set()

    def open_px(x, y):
        r, g, b, a = px[x, y]
        return a >= 128 and not is_skin(r, g, b, a) and not is_lash_px(r, g, b, a)

    seen = set()
    q = deque()
    for s in seeds:
        seen.add(s)
        q.append(s)
    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if nx < x0 - 2 or nx > x1 + 2 or ny < y0 - 2 or ny > y1 + 2:
                continue
            if nx < 0 or ny < 0 or nx >= w or ny >= h or (nx, ny) in seen:
                continue
            if open_px(nx, ny):
                seen.add((nx, ny))
                q.append((nx, ny))
    return seen


def column_skin(px, x, y_start, size, max_dy=16):
    """按列取眼下方的皮肤色。同列上下颜色几乎一致，填出来看不出接缝。"""
    w, h = size
    for dy in range(max_dy):
        y = y_start + dy
        if y >= h:
            break
        r, g, b, a = px[x, y]
        if is_skin(r, g, b, a):
            return (r, g, b)
    return None


def dilate(region, r):
    """圆形膨胀。方框会把眼睛周围撑出一块方补丁。"""
    out = set()
    rr = r * r
    for (x, y) in region:
        for dx in range(-r, r + 1):
            for dy in range(-r, r + 1):
                if dx * dx + dy * dy <= rr:
                    out.add((x + dx, y + dy))
    return out


def feather(im, pts, radius=0.9):
    """只在擦除区做一点模糊再贴回，去掉硬边。"""
    if not pts:
        return im
    blur = im.filter(ImageFilter.GaussianBlur(radius))
    mask = Image.new("L", im.size, 0)
    mp = mask.load()
    for (x, y) in pts:
        if 0 <= x < im.size[0] and 0 <= y < im.size[1]:
            mp[x, y] = 255
    mask = mask.filter(ImageFilter.GaussianBlur(0.6))
    return Image.composite(blur, im, mask)


def eye_region(im, box):
    """眼白区 ∪ 虹膜核心。"""
    px = im.load()
    region = flood(im, box)
    extra = set()
    for y in range(box[1], box[3] + 1):
        for x in range(box[0], box[2] + 1):
            if is_iris_core(*px[x, y]):
                extra.add((x, y))
    return region | extra


def make_lids(im, ratio):
    """每只眼的虹膜按 ratio 从上往下压成肤色 = 眼睑下沉。"""
    out = im.copy()
    op = out.load()
    px = im.load()
    for box in EYE_BOXES:
        region = eye_region(im, box)
        if not region:
            continue
        ys = [p[1] for p in region]
        y0, y1 = min(ys), max(ys)
        cut = y0 + (y1 - y0) * ratio
        erase = set()
        for (x, y) in dilate(region, 1):
            if y > cut:
                continue
            if not (0 <= x < out.size[0] and 0 <= y < out.size[1]):
                continue
            r, g, b, a = op[x, y]
            if is_lash_px(r, g, b, a):
                continue                      # 睫毛留着当眼线
            skin = column_skin(px, x, y1 + 1, out.size)
            if skin is None:
                continue
            op[x, y] = skin + (a,)
            erase.add((x, y))
        out = feather(out, erase, 0.8)
        op = out.load()
    return out


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
    return {"cx": (min(xs) + max(xs)) / 2, "cy": (min(ys) + max(ys)) / 2,
            "w": max(xs) - min(xs) + 1, "h": max(ys) - min(ys) + 1}


def make_grab(im, half_eyes):
    """被托起来：半闭眼 + 张圆的嘴 + 一滴汗。"""
    out = half_eyes.copy()
    px = im.load()
    op = out.load()

    mouth = find_mouth(im)
    mx, my = (mouth["cx"], mouth["cy"]) if mouth else (83, 150)

    # 擦掉原来的嘴（取嘴下方的肤色，别取到衣领）
    for y in range(int(my) - 9, int(my) + 10):
        for x in range(int(mx) - 9, int(mx) + 10):
            if not (0 <= x < out.size[0] and 0 <= y < out.size[1]):
                continue
            skin = column_skin(px, x, MOUTH_BOX[3] + 1, out.size) or (255, 236, 224)
            op[x, y] = skin + (op[x, y][3],)

    d = ImageDraw.Draw(out)
    rw, rh = 4.6, 6.2
    d.ellipse([mx - rw, my - rh, mx + rw, my + rh], fill=MOUTH_DARK)
    d.ellipse([mx - rw * 0.5, my + rh * 0.12, mx + rw * 0.5, my + rh * 0.78], fill=MOUTH_INNER)

    # 汗滴
    sx, sy = 154, 100
    d.polygon([(sx, sy - 7), (sx + 3.6, sy + 1), (sx - 3.6, sy + 1)], fill=SWEAT)
    d.ellipse([sx - 3.8, sy - 2, sx + 3.8, sy + 6.4], fill=SWEAT)
    d.ellipse([sx - 1.6, sy + 1.6, sx + 0.6, sy + 3.8], fill=(255, 255, 255, 180))

    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC)
    if getattr(src, "n_frames", 1) > 1:
        src.seek(0)
    base = src.convert("RGBA")

    # 半闭（60%）——和眨眼系统的 half 帧同源，视觉统一
    half_eyes = make_lids(base, 0.60)
    grab = make_grab(base, half_eyes)
    grab.save(OUT / "pet-grab.png")
    print(f"pet-grab.png    {grab.size}")

    squint = make_lids(base, 0.45)
    squint.save(OUT / "pet-squint.png")
    print(f"pet-squint.png  {squint.size}")

    m = find_mouth(base)
    print(f"嘴巴定位: {m}")

    cw, ch = 120, 96
    sheet = Image.new("RGBA", (cw * 3 * 3, ch * 3), (255, 255, 255, 255))
    for i, img in enumerate((base, grab, squint)):
        crop = img.crop((48, 94, 48 + cw, 94 + ch)).resize((cw * 3, ch * 3), Image.NEAREST)
        sheet.paste(crop, (i * cw * 3, 0))
    sheet.save(OUT / "_preview-faces.png")
    print("_preview-faces.png 对照图（睁眼 / 被抓 / 思考眯眼）")


if __name__ == "__main__":
    main()
