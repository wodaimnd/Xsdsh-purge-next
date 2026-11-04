"""把 client.js 里的 GitHub 更新调用改成空实现。

保留 useState / useCallback 的结构（它们和别的 UI 共用作用域，
整体删除会连锁破坏几十处引用），只让这些函数不再发任何网络请求。
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
p = ROOT / "client.js"
s = p.read_text(encoding="utf-8")
before = len(s)


def swap(old, new, label):
    global s
    if old in s:
        s = s.replace(old, new, 1)
        print("  改 %s" % label)
    else:
        print("  ! 未匹配 %s" % label)


# ── 1. checkUpdate ──────────────────────────────────────────
swap(
    """			const checkUpdate = useCallback((id) => {
				setUpdateBusy(true);
				setUpdateJob({ id: id || "", kind: "check" });
				const tr = tRef.current;
				setUpdateNotice({ kind: "ok", text: tr("update.checking") });
				apiJson("/Xsdsh-purge/update")
					.then((d) => {
						if (!d || (!d.ok && !d.channel)) throw new Error((d && d.error) || "check failed");
						applyUpdateInfo(d, tr, "check");
					})
					.catch((e) => setUpdateNotice({ kind: "error", text: updateErrorText(tr, e) }))
					.finally(() => {
						setUpdateBusy(false);
						setUpdateJob(null);
					});
			}, [applyUpdateInfo]);""",
    """			// GitHub 自更新已移除：这个函数保留签名（别处仍会引用），
			// 但不再发任何请求，只提示一句。
			const checkUpdate = useCallback(() => {
				const tr = tRef.current;
				setUpdateNotice({ kind: "ok", text: tr("update.removed") });
			}, []);""",
    "checkUpdate",
)

# ── 2. saveSource ──────────────────────────────────────────
swap(
    """			const saveSource = useCallback((repo) => {
				setSourceBusy(true);
				const tr = tRef.current;
				return apiJson("/Xsdsh-purge/update", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ op: "source", repo }),
				})
					.then((d) => {
						if (d && d.source) setSourceRepo(d.source.repo || "");
						if (d) applyUpdateInfo(d, tr, "check");
						if (d && d.source) {
							setUpdateNotice({ kind: "ok", text: tr("update.source.saved", { repo: d.source.repo }) });
						}
					})
					.catch((e) => setUpdateNotice({ kind: "error", text: updateErrorText(tr, e) }))
					.finally(() => setSourceBusy(false));
			}, [applyUpdateInfo]);""",
    """			const saveSource = useCallback(() => {}, []);""",
    "saveSource",
)

# ── 3. postUpdate ──────────────────────────────────────────
swap(
    """			const postUpdate = useCallback((body, kind, id) => {
				setUpdateBusy(true);
				setUpdateJob({ id: id || "", kind });
				const tr = tRef.current;
				setUpdateNotice({ kind: "ok", text: kind === "switched" || kind === "channel" ? tr("update.switching") : tr("update.applying") });
				return apiJson("/Xsdsh-purge/update", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(body || {}),
				})
					.then((d) => {
						if (!d || (d.ok === false && d.error)) throw new Error((d && d.error) || "update failed");
						applyUpdateInfo(d, tr, kind);
						if (d.needsFullQuit) {
							suppressRestartAsk.current = false;
							setAskRestart(true);
							setUpdateNotice({ kind: "ok", text: tr("restart.official.body") });
							return d;
						}
						if (d.restartAfter) {
							setUpdateNotice({ kind: "ok", text: tr("update.restarting") });
							return d;
						}
						if (d.applied && d.reloadClient !== false) {
							setUpdateNotice({ kind: "ok", text: tr("update.reloading") });
							setTimeout(() => {
								try { window.location.reload(); } catch { /* ignore */ }
							}, 280);
						} else if (d.needRestart) {
							setAskRestart(true);
						}
						return d;
					})
					.catch((e) => {
						setUpdateNotice({ kind: "error", text: updateErrorText(tr, e) });
						throw e;
					})
					.finally(() => {
						setUpdateBusy(false);
						setUpdateJob(null);
					});
			}, [applyUpdateInfo]);""",
    """			const postUpdate = useCallback(() => Promise.resolve({ ok: false }), []);""",
    "postUpdate",
)

p.write_text(s, encoding="utf-8")
print("\nclient.js: %d → %d (-%d)" % (before, len(s), before - len(s)))

left = [x for x in ('"/Xsdsh-purge/update"', "Xsdsh-purge/update") if x in s]
print("残留网络调用:", left if left else "无")
