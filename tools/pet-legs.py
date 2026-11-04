"""
量出桌宠两条腿的精确边界和胯部锚点。

走路动作靠「绕胯旋转」实现，所以必须知道：
  · 腿从哪一行开始（腿根 / 裙摆下缘）
  · 左腿、右腿各自的 x 区间（中间有空隙才分得开）
  · 脚底到哪一行结束

用法：python tools/pet-legs.py <源图>
"""
import sys
from pathlib import Path
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "pet-src.gif"

im = Image.open(SRC).convert("RGBA")
W, H = im.size
px = im.load()


def opaque(x, y):
    return px[x, y][3] > 40


# 1) 逐行扫「不透明段」，从底部往上找腿区
print(f"{W}x{H}")
print("\n行 | 不透明段（起..止）")
rows = {}
for y in range(0, H):
    runs = []
    x = 0
    while x < W:
        if opaque(x, y):
            s = x
            while x < W and opaque(x, y):
                x += 1
            runs.append((s, x - 1))
        else:
            x += 1
    rows[y] = runs

for y in range(240, H):
    seg = " ".join(f"{a}..{b}" for a, b in rows[y])
    print(f"{y:3d} | {seg}")

# 2) 底部 20 行里，找「两段且中间有缺口」的行 → 就是两条腿
leg_rows = []
for y in range(H - 1, 240, -1):
    runs = [r for r in rows[y] if r[1] - r[0] >= 2]
    if len(runs) >= 2:
        leg_rows.append((y, runs))
        if len(leg_rows) >= 6:
            break

if not leg_rows:
    print("\n没找到分成两段的腿")
    sys.exit(1)

ys = [y for y, _ in leg_rows]
feet_y = max(ys)
# 取最靠近脚底那几行推断两条腿的 x 区间
sample = [r for y, r in leg_rows if y >= feet_y - 6]
left_x0 = min(r[0][0] for r in sample)
left_x1 = max(r[0][1] for r in sample)
right_x0 = min(r[1][0] for r in sample)
right_x1 = max(r[1][1] for r in sample)

print(f"\n采样行: {sorted(ys)}")
print(f"左腿 x {left_x0}..{left_x1}   右腿 x {right_x0}..{right_x1}")

# 3) 腿根：从脚底往上，找「还能看到两段」的最高行
top_two = None
for y in range(240, feet_y + 1):
    runs = [r for r in rows[y] if r[1] - r[0] >= 2]
    if len(runs) >= 2:
        top_two = y
        break
print(f"两段结构最靠上的行: {top_two}")

# 4) 腿根真实位置：往上找第一行「没有腿色像素」
#    腿是肤色（暖、亮），裙摆是浅蓝。用颜色区分。
def is_skin(r, g, b, a):
    if a < 120:
        return False
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    return lum > 175 and r >= g - 4 and r >= b


leg_x_ranges = [(left_x0, left_x1), (right_x0, right_x1)]
top_of_legs = None
for y in range(240, feet_y + 1):
    has = False
    for (a, b) in leg_x_ranges:
        for x in range(a, b + 1):
            r, g, bl, al = px[x, y]
            if is_skin(r, g, bl, al):
                has = True
                break
        if has:
            break
    if has:
        top_of_legs = y
        break

print(f"腿（肤色）最靠上的行: {top_of_legs}")

if top_of_legs is None:
    top_of_legs = top_two or (feet_y - 40)

print("\n=== 给渲染层用的常量 ===")
print(f"腿区顶 y = {top_of_legs}")
print(f"腿区底 y = {feet_y}")
print(f"左腿 x = {left_x0}..{left_x1}  中心 {(left_x0 + left_x1) / 2:.1f}")
print(f"右腿 x = {right_x0}..{right_x1}  中心 {(right_x0 + right_x1) / 2:.1f}")
print(f"左腿胯点 = ({(left_x0 + left_x1) / 2:.1f}, {top_of_legs})")
print(f"右腿胯点 = ({(right_x0 + right_x1) / 2:.1f}, {top_of_legs})")
