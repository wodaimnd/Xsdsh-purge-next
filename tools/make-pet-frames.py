"""
生成桌宠的闭眼帧 / 半闭帧。

素材是单帧静态图，眨眼必须合成。这条路上踩了三个坑：
  1. 椭圆填「平均肤色」→ 脸上留下明显的浅色椭圆斑。
  2. 按列取眼下皮肤往上填 → 相邻列有细微色差，出一片竖条纹。
  3. 用「蓝色阈值 + 膨胀」做掩膜 → 睫毛削太多、虹膜下缘的浅蓝没圈进来，
     眼睛闭不干净。

最终做法：**从虹膜种子做泛洪，遇皮肤和睫毛就停**。
眼睛是「脸上的一个洞」：洞壁上半是深色睫毛、其它三面是皮肤。
从虹膜任意一点往外扩，只走「既不是皮肤、也不是睫毛」的像素，
就能精确得到整个眼白区（含高光、含下缘浅蓝），
而深色睫毛完整保留 —— 它本来就是闭眼后的眼线。

填充边界一侧是睫毛（深色）、一侧是皮肤（同色），所以看不出任何接缝。

用法：python tools/make-pet-frames.py <源图>
"""
import sys
from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else "pet-src.gif"
OUT = Path(__file__).resolve().parent.parent / "lib" / "pet"

# 眼区搜索范围（宽松），真正形状由泛洪决定
EYE_BOXES = [
    (44, 101, 76, 138),    # 画面左眼
    (98, 106, 130, 138),   # 画面右眼
]


def lum(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def is_skin(r, g, b, a):
    """皮肤：亮、暖（r >= g >= b）。"""
    if a < 128:
        return False
    if lum(r, g, b) < 198:
        return False
    return r >= g >= b - 6


def is_lash(r, g, b, a):
    """睫毛 / 深色轮廓。"""
    return a >= 128 and lum(r, g, b) < 128


def is_iris(r, g, b, a):
    """虹膜种子：明显偏蓝。"""
    return a >= 128 and (b - r) >= 18 and b > 110


def flood_eye(im, box):
    """从虹膜种子泛洪，返回要填充的像素集合（含边界的 1px 收缩缓冲）。"""
    x0, y0, x1, y1 = box
    px = im.load()
    w, h = im.size

    seeds = []
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            r, g, b, a = px[x, y]
            if is_iris(r, g, b, a):
                seeds.append((x, y))
    if not seeds:
        return set()

    def open_px(x, y):
        r, g, b, a = px[x, y]
        if a < 128:
            return False
        if is_skin(r, g, b, a):
            return False
        if is_lash(r, g, b, a):
            return False
        return True

    seen = set()
    q = deque()
    for s in seeds:
        if s not in seen:
            seen.add(s)
            q.append(s)
    while q:
        x, y = q.popleft()
        # 限制在眼区内，避免顺着别的路径漏到脸外
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if nx < x0 - 2 or nx > x1 + 2 or ny < y0 - 2 or ny > y1 + 2:
                continue
            if nx < 0 or ny < 0 or nx >= w or ny >= h:
                continue
            if (nx, ny) in seen:
                continue
            if open_px(nx, ny):
                seen.add((nx, ny))
                q.append((nx, ny))
    return seen


def median_skin(px, box, size):
    """眼区外圈采样皮肤色，取中位数。"""
    x0, y0, x1, y1 = box
    w, h = size
    vals = []
    for x in range(x0 - 8, x1 + 9):
        for y in range(y1 + 2, y1 + 12):
            if not (0 <= x < w and 0 <= y < h):
                continue
            r, g, b, a = px[x, y]
            if is_skin(r, g, b, a):
                vals.append((r, g, b))
    for x in list(range(x0 - 8, x0 - 1)) + list(range(x1 + 2, x1 + 9)):
        for y in range(y0 + 6, y1 + 1):
            if not (0 <= x < w and 0 <= y < h):
                continue
            r, g, b, a = px[x, y]
            if is_skin(r, g, b, a):
                vals.append((r, g, b))
    if not vals:
        return (255, 240, 228)
    vals.sort(key=lambda c: lum(*c))
    return vals[len(vals) // 2]


def make_closed(im):
    out = im.copy()
    op = out.load()
    for box in EYE_BOXES:
        skin = median_skin(im.load(), box, im.size)
        region = flood_eye(im, box)
        if not region:
            continue
        x0, y0, x1, y1 = box
        # 按行号做轻微明暗，模拟上眼皮厚度
        for (x, y) in region:
            t = (y - y0) / max(1, (y1 - y0))
            shade = 0.948 + 0.052 * t
            fill = tuple(min(255, int(c * shade)) for c in skin)
            op[x, y] = (fill[0], fill[1], fill[2], op[x, y][3])

    # 不做额外羽化：填充边界一侧是深色睫毛（硬边天然合理），
    # 另一侧是与皮肤同色（接缝本来看不见）。再叠一次模糊合成反而会在
    # 边界漏出原图的蓝色，出现一圈虚线点。
    return out


# ── 腿部拆分 ────────────────────────────────────────────────────────
# 走路要让两条腿各自绕胯摆动。用 canvas 裁剪做不到：
# 腿一摆就超出自己的列范围被切掉，放宽裁剪又会把另一条腿的像素带进来。
# 所以在素材层就把腿拆成独立图，运行时叠着画。
#
# 边界是 tools/pet-legs.py 量出来的：
LEG_REGION_TOP = 264      # 从这行往下才算腿（上面留一点裙子下摆当「胯」，避免转起来露缝）
LEG_LEFT_X = (70, 84)     # 左腿列范围
LEG_RIGHT_X = (94, 110)   # 右腿列范围


def split_legs(frame, name, out_dir):
    """把 frame 的两条腿拆成独立图，返回去掉腿的身体。

    左腿 / 右腿都输出成**整幅尺寸**（204×320）的透明图，
    这样运行时不用记偏移量，按原始坐标画就行。
    """
    body = frame.copy()
    bp = body.load()
    W, H = frame.size

    for tag, (x0, x1) in (("left", LEG_LEFT_X), ("right", LEG_RIGHT_X)):
        leg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        lp = leg.load()
        for y in range(LEG_REGION_TOP, H):
            for x in range(x0, x1 + 1):
                r, g, b, a = frame.getpixel((x, y))
                if a <= 40:
                    continue
                lp[x, y] = (r, g, b, a)
                bp[x, y] = (0, 0, 0, 0)
        leg.save(out_dir / f"pet-leg-{tag}.png")

    body.save(out_dir / f"pet-body-{name}.png")
    return body


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC)
    if getattr(src, "n_frames", 1) > 1:
        src.seek(0)
    base = src.convert("RGBA")

    base.save(OUT / "pet-open.png")
    closed = make_closed(base)
    closed.save(OUT / "pet-closed.png")
    half = Image.blend(base, closed, 0.6)
    half.save(OUT / "pet-half.png")

    for name in ("pet-open.png", "pet-half.png", "pet-closed.png"):
        print(f"{name:16s} {Image.open(OUT / name).size}")

    for frame_name, frame in (("open", base), ("half", half), ("closed", closed)):
        split_legs(frame, frame_name, OUT)
        print(f"pet-body-{frame_name}.png 腿已拆出")

    cw, ch = 96, 44
    sheet = Image.new("RGBA", (cw * 4, ch * 4 * 3), (255, 255, 255, 255))
    for i, img in enumerate((base, half, closed)):
        crop = img.crop((36, 98, 36 + cw, 98 + ch)).resize((cw * 4, ch * 4), Image.NEAREST)
        sheet.paste(crop, (0, i * ch * 4))
    sheet.save(OUT / "_preview-eyes.png")

    # 走路对照图：把身体和腿按不同角度合成，肉眼确认摆动像不像走路
    walk_sheet = Image.new("RGBA", (204 * 4, 320), (24, 32, 42, 255))
    for i, deg in enumerate((-18, 0, 18, 0)):
        body = Image.open(OUT / "pet-body-open.png").convert("RGBA")
        legL = Image.open(OUT / "pet-leg-left.png").convert("RGBA")
        legR = Image.open(OUT / "pet-leg-right.png").convert("RGBA")
        hipL = (76.5, LEG_REGION_TOP)
        hipR = (101.5, LEG_REGION_TOP)
        rl = legL.rotate(-deg, center=hipL, resample=Image.BICUBIC)
        rr = legR.rotate(deg, center=hipR, resample=Image.BICUBIC)
        comp = Image.new("RGBA", (204, 320), (0, 0, 0, 0))
        comp.alpha_composite(body)
        comp.alpha_composite(rl)
        comp.alpha_composite(rr)
        walk_sheet.alpha_composite(comp, (i * 204, 0))
    walk_sheet.save(OUT / "_preview-walk.png")

    # 统计填充了多少像素，便于确认掩膜没失效
    for i, box in enumerate(EYE_BOXES):
        n = len(flood_eye(base, box))
        print(f"眼{i} 泛洪填充 {n} 像素")
    print("_preview-eyes.png 对照图（上到下：睁 / 半闭 / 闭）")
    print("_preview-walk.png 走路对照图（左腿 -18° / 0° / +18° / 0°）")


if __name__ == "__main__":
    main()
