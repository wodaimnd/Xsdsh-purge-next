"""
从 Wallpaper Engine 的 scene.pkg 里解出音频。

scene.pkg 的格式（实测，非官方文档）：
    string  magic        int32 长度 + "PKGV0018" 这样的 ASCII
    uint32  entryCount
    entry[entryCount] {
        string path      int32 长度 + UTF-8 路径
        uint32 offset    相对「数据区」起点的偏移
        uint32 length
    }
    <数据区>

用法：
    python tools/we-audio.py <scene.pkg> --list
    python tools/we-audio.py <scene.pkg> --extract <条目名> <输出路径>
"""
import struct
import sys
from pathlib import Path

AUDIO_EXT = (".mp3", ".ogg", ".wav", ".m4a", ".flac")


class Reader:
    def __init__(self, data):
        self.d = data
        self.p = 0

    def u32(self):
        (v,) = struct.unpack_from("<I", self.d, self.p)
        self.p += 4
        return v

    def string(self):
        n = self.u32()
        raw = self.d[self.p:self.p + n]
        self.p += n
        return raw.decode("utf-8", "replace")


def parse(path):
    data = Path(path).read_bytes()
    r = Reader(data)
    magic = r.string()
    count = r.u32()
    entries = []
    for _ in range(count):
        name = r.string()
        off = r.u32()
        size = r.u32()
        entries.append({"name": name, "offset": off, "length": size})
    data_start = r.p
    return magic, data_start, entries, data


def main():
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    pkg = sys.argv[1]
    magic, data_start, entries, data = parse(pkg)
    print(f"magic={magic}  条目 {len(entries)}  数据区起点 {data_start}")

    if "--list" in sys.argv:
        audio = [e for e in entries if e["name"].lower().endswith(AUDIO_EXT)]
        print(f"\n音频条目 {len(audio)} 个：")
        for e in audio:
            print(f"  {e['name']:<50} {e['length']:>10} 字节  @{data_start + e['offset']}")
        if not audio:
            print("  （没有扩展名像音频的条目，下面列出全部）")
            for e in entries:
                print(f"  {e['name']:<50} {e['length']:>10}")
        return

    if "--extract" in sys.argv:
        i = sys.argv.index("--extract")
        want = sys.argv[i + 1]
        out = Path(sys.argv[i + 2])
        for e in entries:
            if e["name"] == want:
                start = data_start + e["offset"]
                blob = data[start:start + e["length"]]
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_bytes(blob)
                print(f"已写出 {out}  {len(blob)} 字节")
                # 顺手看一下文件头，确认真的是音频
                print("文件头:", blob[:16].hex(" "))
                return
        raise SystemExit(f"没有这个条目: {want}")


if __name__ == "__main__":
    main()
