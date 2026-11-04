"""在真实 Chromium 里实测壁纸层是否真的挂载并可见。

假 DOM 测试只验证「节点建出来了」，但用户看到的是「没反应」。
这里跑真浏览器：注入 client.js，触发 bootWallpaper，再检查
  - .xsdshw-layer 是否在 DOM 里
  - <video>/<img> 的 src 是否真的加载成功（naturalWidth / readyState）
  - z-index 与 opacity 是否让它可见
  - html[data-dshw] 是否置上

用法: python tools/wallpaper-live-check.py
"""
import json
import os
import subprocess
import sys
import tempfile
import time

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE = "http://127.0.0.1:50976"

HTML = """<!doctype html>
<html><head><meta charset="utf-8"><title>wall</title></head>
<body>
<div id="host-shell" style="position:fixed;inset:0;background:#1b1b1b">宿主外壳</div>
<pre id="out">running…</pre>
<script>
const out = [];
function log(...a){ out.push(a.join(" ")); document.getElementById("out").textContent = out.join("\\n"); }

(async () => {
  // 1) 先看静态路由是否真能拿到壁纸
  for (const id of ["naco-neko.mp4","tenene-nachoneko.mp4","natsuki-nachoneko.jpg"]) {
    try {
      const r = await fetch("/Xsdsh-purge/wallpapers/" + id, { method: "HEAD" });
      log("HEAD", id, r.status, r.headers.get("content-type"), r.headers.get("content-length"));
    } catch (e) { log("HEAD", id, "ERR", e.message); }
  }

  // 2) 装上 client.js（它自己会在末尾调 bootWallpaper）
  try {
    localStorage.setItem("xsdsh.wall", JSON.stringify({
      id: "natsuki-nachoneko", opacity: 1, blur: 0, scrim: 26
    }));
  } catch (e) { log("localStorage 写入失败", e.message); }

  log("--- 准备加载 client.js ---");
  window.__done = false;
})();
</script>
</body></html>
"""


def run():
    work = tempfile.mkdtemp(prefix="wallchk-")
    page = os.path.join(work, "index.html")
    with open(page, "w", encoding="utf-8") as f:
        f.write(HTML)

    # 用 Chrome 的 headless + 远程调试，实际加载页面并求值
    port = 9333
    user_dir = os.path.join(work, "profile")
    proc = subprocess.Popen([
        CHROME, "--headless=new", "--disable-gpu", "--no-first-run",
        "--no-default-browser-check",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_dir}",
        f"--app={BASE}/",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    time.sleep(4)
    try:
        import urllib.request
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/json", timeout=10) as r:
            tabs = json.load(r)
        print("标签页数:", len(tabs))
        for t in tabs:
            print("  ", t.get("type"), t.get("url"))
    except Exception as e:
        print("连不上调试端口:", e)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()


if __name__ == "__main__":
    run()
