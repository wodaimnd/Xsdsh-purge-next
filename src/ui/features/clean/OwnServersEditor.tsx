import { React } from "../../host/react";
import { isFileLikeHost } from "../../shared/host-suffix";
import type { CleanApi } from "./api";
import { errorText } from "./api";
import type { CleanRuntime, Notice } from "./types";
import { NoticeView } from "./primitives";
import { TrashIcon } from "../../components/TrashIcon";

export type OwnEntryKind = "host" | "comment";
export interface OwnEntry { readonly key: string; readonly kind: OwnEntryKind; readonly text: string }

let entrySequence = 0;
function newEntry(kind: OwnEntryKind, text = ""): OwnEntry {
  return { key: `own-${++entrySequence}`, kind, text };
}

/** Split the allow-list file into ordered host/comment rows; blank lines are dropped. */
export function parseOwnServers(content: string): OwnEntry[] {
  const entries: OwnEntry[] = [];
  for (const raw of String(content || "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    entries.push(line.startsWith("#") ? newEntry("comment", line.replace(/^#\s?/, "")) : newEntry("host", line));
  }
  if (!entries.some(entry => entry.kind === "host")) entries.push(newEntry("host"));
  return entries;
}

/** Rebuild the file text; blank rows are skipped, comments keep their place in the list. */
export function serializeOwnServers(entries: readonly OwnEntry[]): string {
  const lines = entries
    .map(entry => entry.kind === "comment" ? (entry.text.trim() ? `# ${entry.text.trim()}` : "") : entry.text.trim())
    .filter(Boolean);
  return lines.length ? `${lines.join("\n")}\n` : "";
}

export type HostCheck = { ok: true; label: string } | { error: string; ok: false };

const USER_RE = /^[A-Za-z0-9._-]{1,32}$/;
const DOMAIN_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_RE = /^[0-9A-Fa-f:]+$/;
const SECRET_RE = /BEGIN|PRIVATE KEY|ssh-rsa|ssh-ed25519|ssh-dss/i;

/** Mirrors the host-side entryHost() rules so the table can flag a row before saving. */
export function classifyHost(text: string): HostCheck {
  const value = String(text || "").trim();
  if (!value) return { ok: false, error: "不能为空" };
  if (value.length > 253) return { ok: false, error: "超过 253 个字符" };
  if (/\s/.test(value)) return { ok: false, error: "不能含空格" };
  if (/[\\/*]/.test(value)) return { ok: false, error: "不支持网段、通配符或路径" };
  if (SECRET_RE.test(value)) return { ok: false, error: "不要填密钥内容" };
  const at = value.indexOf("@");
  const user = at >= 0 ? value.slice(0, at) : "";
  const host = at >= 0 ? value.slice(at + 1) : value;
  if (at >= 0 && !USER_RE.test(user)) return { ok: false, error: "账号只允许字母、数字、点、下划线和短横线" };
  if (!host) return { ok: false, error: "@ 后面缺少主机名" };
  if (host.includes(":")) {
    return IPV6_RE.test(host) ? { ok: true, label: at >= 0 ? "账号@IPv6" : "IPv6" } : { ok: false, error: "只接受单个 IPv6 地址" };
  }
  const ipv4 = IPV4_RE.exec(host);
  if (ipv4) {
    const parts = ipv4.slice(1).map(Number);
    return parts.every(part => part <= 255)
      ? { ok: true, label: at >= 0 ? "账号@IPv4" : "IPv4" }
      : { ok: false, error: "IPv4 每段须在 0–255" };
  }
  if (isFileLikeHost(host)) return { ok: false, error: "看起来是文件名，不是主机名" };
  if (!DOMAIN_RE.test(host)) return { ok: false, error: "不是完整域名或 IP" };
  return { ok: true, label: at >= 0 ? "账号@域名" : "域名" };
}

export function OwnServersEditor({ api, runtime, locked, onSaved }: {
  api: CleanApi; runtime: CleanRuntime; locked: boolean; onSaved: () => void;
}) {
  const [entries, setEntries] = React.useState<OwnEntry[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const saving = React.useRef(false);
  const [notice, setNotice] = React.useState<Notice>({ kind: "idle", text: "" });

  React.useEffect(() => {
    let alive = true;
    api.get("own-servers").then(data => {
      if (!alive) return;
      setEntries(parseOwnServers(typeof data.content === "string" ? data.content : ""));
      setLoaded(true);
    }).catch(error => { if (alive) setNotice({ kind: "error", text: errorText(error) }); });
    return () => { alive = false; };
  }, [api]);

  const hosts = entries.filter(entry => entry.kind === "host");
  const comments = entries.filter(entry => entry.kind === "comment");
  const checks = new Map(hosts.map(entry => [entry.key, entry.text.trim() ? classifyHost(entry.text) : null]));
  const invalid = hosts.filter(entry => checks.get(entry.key) && !checks.get(entry.key)!.ok);
  const filled = hosts.filter(entry => entry.text.trim()).length;

  const update = (key: string, text: string) => setEntries(list => list.map(entry => entry.key === key ? { ...entry, text } : entry));
  const remove = (key: string) => setEntries(list => {
    const next = list.filter(entry => entry.key !== key);
    return next.some(entry => entry.kind === "host") ? next : [...next, newEntry("host")];
  });
  const addHost = () => setEntries(list => [...list, newEntry("host")]);
  const addComment = () => { setCommentsOpen(true); setEntries(list => [...list, newEntry("comment")]); };

  const save = async () => {
    if (!loaded || saving.current || locked) return;
    if (invalid.length) { setNotice({ kind: "error", text: `有 ${invalid.length} 行地址不合法，先修正再保存。` }); return; }
    saving.current = true; setBusy(true); setNotice({ kind: "busy", text: "正在保存…" });
    try {
      const content = serializeOwnServers(entries);
      const data = await api.post("own-servers", { content });
      const saved = typeof data.content === "string" ? data.content : content;
      setEntries(parseOwnServers(saved));
      const dropped = Number(data.dropped) || 0;
      const kept = saved.split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith("#")).length;
      setNotice({ kind: "ok", text: dropped > 0 ? `已保存 ${kept} 台主机，后端过滤了 ${dropped} 条无效地址。` : `已保存 ${kept} 台主机。` });
      onSaved();
    } catch (error) { setNotice({ kind: "error", text: errorText(error) }); }
    finally { saving.current = false; setBusy(false); }
  };

  const disabled = !loaded || busy || locked;
  return <section className="clean9-editor clean9-own">
    <p className="clean9-own-hint clean9-own-lead">{runtime.t("own.hint")}</p>
    <div className="clean9-own-scroll">
      <table className="clean9-own-table">
        <colgroup><col style={{ width: "min(340px, 62%)" }} /><col style={{ width: 34 }} /><col /></colgroup>
        <thead><tr><th scope="col">主机 / IP</th><th scope="col"><span className="clean9-sr">删除</span></th><th scope="col">识别</th></tr></thead>
        <tbody>
          {hosts.map(entry => {
            const check = checks.get(entry.key);
            return <tr key={entry.key} className={check && !check.ok ? "is-bad" : undefined}>
              <td><input aria-label="主机地址" value={entry.text} disabled={disabled} placeholder="example.com 或 ops@10.0.0.5"
                spellCheck={false} autoCapitalize="none" onChange={event => update(entry.key, event.target.value)} /></td>
              <td><button type="button" className="clean9-icon-btn" aria-label="删除这一行" title="删除" disabled={disabled} onClick={() => remove(entry.key)}><TrashIcon size={15} /></button></td>
              <td>{!check ? <span className="clean9-own-kind">待填写</span>
                : check.ok ? <span className="clean9-own-kind">{check.label}</span>
                : <span className="clean9-own-kind is-bad">{check.error}</span>}</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
    <div className="clean9-actions">
      <button type="button" onClick={addHost} disabled={disabled}>+ 添加主机</button>
      <button type="button" className="is-primary" disabled={disabled || invalid.length > 0} onClick={() => { void save(); }}>保存</button>
      <span className="clean9-own-count">{filled} 台主机 · {comments.length} 条注释</span>
    </div>
    <details className="clean9-own-comments" open={commentsOpen} onToggle={event => setCommentsOpen((event.target as HTMLDetailsElement).open)}>
      <summary>注释 {comments.length} 条</summary>
      <p className="clean9-own-hint">注释行以 # 开头，只给人看，不影响放行；保存时按原顺序写回。</p>
      {comments.map(entry => <div key={entry.key} className="clean9-own-comment">
        <input aria-label="注释内容" value={entry.text} disabled={disabled} spellCheck={false}
          onChange={event => update(entry.key, event.target.value)} />
        <button type="button" className="clean9-icon-btn" aria-label="删除这条注释" title="删除" disabled={disabled} onClick={() => remove(entry.key)}><TrashIcon size={15} /></button>
      </div>)}
      <button type="button" onClick={addComment} disabled={disabled}>+ 添加注释</button>
    </details>
    <NoticeView notice={notice} />
  </section>;
}
