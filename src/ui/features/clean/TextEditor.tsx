import { React } from "../../host/react";
import type { CleanApi } from "./api";
import { errorText } from "./api";
import type { CleanRuntime, Notice } from "./types";
import { NoticeView } from "./primitives";

export function TextEditor({ kind, api, runtime, locked, onSaved }: { kind: "override" | "own-servers"; api: CleanApi; runtime: CleanRuntime; locked: boolean; onSaved: () => void }) {
  const [content, setContent] = React.useState("");
  const [defaultContent, setDefaultContent] = React.useState("");
  const [loaded, setLoaded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const saving = React.useRef(false);
  const [notice, setNotice] = React.useState<Notice>({ kind: "idle", text: "" });
  const prompt = kind === "override";
  React.useEffect(() => {
    let alive = true;
    api.get(kind).then(data => {
      if (!alive) return;
      const fallback = typeof data.defaultContent === "string" ? data.defaultContent : "";
      setDefaultContent(fallback); setContent(typeof data.content === "string" ? data.content : fallback); setLoaded(true);
    }).catch(error => { if (alive) setNotice({ kind: "error", text: errorText(error) }); });
    return () => { alive = false; };
  }, [api, kind]);
  const save = async (text: string) => {
    if (!loaded || saving.current || locked) return;
    if (prompt && !text.trim() && !defaultContent.trim()) { setNotice({ kind: "error", text: runtime.t("need.prompt") }); return; }
    saving.current = true; setBusy(true); setNotice({ kind: "busy", text: "正在保存…" });
    try {
      const data = await api.post(kind, { content: text });
      if (data.needPrompt || data.injectSource === "none") throw new Error(runtime.t("need.prompt"));
      setContent(typeof data.content === "string" ? data.content : text);
      setNotice({ kind: "ok", text: prompt ? "提示词已保存，实际注入状态请以宿主结果为准。" : Number(data.dropped) > 0 ? `已保存，${data.dropped} 条无效地址已过滤。` : "服务器列表已保存。" });
      onSaved();
    } catch (error) { setNotice({ kind: "error", text: errorText(error) }); }
    finally { saving.current = false; setBusy(false); }
  };
  return <section className="clean9-editor">
    <p>{runtime.t(prompt ? "override.hint" : "own.hint")}</p>
    <textarea aria-label={prompt ? "提示词内容" : "自己的服务器"} value={content} disabled={!loaded || busy || locked} spellCheck={false} rows={prompt ? 16 : 8} onChange={event => setContent(event.target.value)} />
    <div className="clean9-actions">
      <button type="button" disabled={!loaded || busy || locked} onClick={() => { void save(content); }}>保存</button>
      {prompt && <button type="button" disabled={!loaded || busy || locked || !defaultContent} onClick={() => { if (runtime.confirm("恢复并保存随包默认提示词？当前编辑内容将被替换。")) void save(defaultContent); }}>恢复默认</button>}
      <span>{content.trim().length} 字</span>
    </div>
    <NoticeView notice={notice} />
  </section>;
}
