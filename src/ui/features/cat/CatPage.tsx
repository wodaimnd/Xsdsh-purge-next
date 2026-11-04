import React from "../../host/react";
import type { CatRuntime, CatSnapshot, WallPreference } from "./runtime";
import css from "./cat.css";

const tunes: { key: keyof Omit<WallPreference, "id">; label: string; min: number; max: number; step: number; factor: number; unit: string }[] = [
  { key: "opacity", label: "浓淡", min: 20, max: 100, step: 5, factor: 100, unit: "%" },
  { key: "blur", label: "把背景揉糊", min: 0, max: 24, step: 1, factor: 1, unit: "px" },
  { key: "scrim", label: "压压暗", min: 0, max: 70, step: 2, factor: 1, unit: "%" },
  { key: "glass", label: "玻璃保留原色", min: 20, max: 100, step: 2, factor: 1, unit: "%" },
  { key: "glassBlur", label: "面板打雾", min: 0, max: 24, step: 1, factor: 1, unit: "px" },
];
const musicLabels = { off: "已暂停", playing: "正在播放", waiting: "等待播放或浏览器交互", error: "音频加载失败" };
export function CatPage({ runtime }: { runtime: CatRuntime }) {
  const [state, setState] = React.useState(runtime.read);
  const [path, setPath] = React.useState(state.local.path);
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  const [bad, setBad] = React.useState(false);
  const mounted = React.useRef(false);
  const pathEdited = React.useRef(false);
  const localLock = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    let alive = true;
    setState(runtime.read());
    runtime.loadLocal().then(next => { if (alive) { setState(next); if (!pathEdited.current) setPath(next.local.path); } })
      .catch(error => { if (alive) { setBad(true); setNotice(`本地壁纸读取失败：${String(error.message || error)}`); } });
    const timer = setInterval(() => {
      /* 后台标签页不停刷新会每秒重渲染整页；隐藏时直接跳过，回来下一拍再对齐。 */
      if (!alive || (typeof document !== "undefined" && document.hidden)) return;
      setState(runtime.read());
    }, 1000);
    return () => { alive = false; mounted.current = false; clearInterval(timer); };
  }, [runtime]);
  const act = (action: () => CatSnapshot | void, message = "") => {
    try { const next = action(); setState(next || runtime.read()); setBad(false); setNotice(message); }
    catch (error) { setBad(true); setNotice(String(error instanceof Error ? error.message : error)); }
  };
  const local = async (clear: boolean) => {
    if (localLock.current) return;
    localLock.current = true; setBusy(true); setNotice("");
    try {
      const next = await (clear ? runtime.clearLocal() : runtime.saveLocal(path));
      if (mounted.current) { setState(next); setPath(next.local.path); setBad(false); setNotice(clear ? "已移除壁纸配置，原文件保留。" : "已应用本地壁纸。"); }
    } catch (error) { if (mounted.current) { setBad(true); setNotice(String(error instanceof Error ? error.message : error)); } }
    finally { localLock.current = false; if (mounted.current) setBusy(false); }
  };
  const preview = (id: string, kind: string) => kind === "video"
    ? <video src={runtime.wallUrl(id)} muted loop autoPlay playsInline preload="metadata" aria-hidden="true" />
    : <img src={runtime.wallUrl(id)} alt="" loading="lazy" />;
  return <section data-xsdsh-ui="cat" className="xsdsh-cat-page" aria-label="猫猫">
    <style>{css}</style>
    <header><h2>猫猫</h2><p>桌宠、壁纸与音乐，使用本机已保存的设置。</p></header>
    <div className="xsdsh-cat-grid">
      <section className="xsdsh-cat-card"><h3>猫猫背景</h3><p>内置图片与动态壁纸，也可以使用本地文件。</p>
        <div className="xsdsh-cat-swatches">
          <button type="button" aria-pressed={!state.wall.id} onClick={() => act(() => runtime.setWall({ id: "" }))}>不铺壁纸</button>
          {runtime.wallpapers.map(wall => <button key={wall.id} type="button" aria-pressed={state.wall.id === wall.id} onClick={() => act(() => runtime.setWall({ id: wall.id }))}>
            {preview(wall.id, wall.kind)}<span>{wall.label}{wall.kind === "video" ? " · 动态" : ""}</span>
          </button>)}
          <button type="button" disabled={!state.local.exists} aria-pressed={state.wall.id === runtime.localId} onClick={() => act(() => runtime.setWall({ id: runtime.localId }))}>
            {state.local.exists && preview(runtime.localId, state.local.kind)}<span>{state.local.name || "本地壁纸"}</span>
          </button>
        </div>
        <form className="xsdsh-cat-local" onSubmit={event => { event.preventDefault(); void local(false); }}>
          <label>本地壁纸路径<input value={path} disabled={busy} placeholder="图片或视频的完整路径" onChange={event => { pathEdited.current = true; setPath(event.target.value); }} /></label>
          <button type="submit" disabled={busy}>{busy ? "处理中…" : "叼进来"}</button>
          <button type="button" disabled={busy || !state.local.path} onClick={() => void local(true)}>拿走</button>
        </form>
        <div className="xsdsh-cat-tunes">{tunes.map(tune => <label key={tune.key}>{tune.label}
          <input type="range" aria-label={tune.label} min={tune.min} max={tune.max} step={tune.step} disabled={!state.wall.id}
            value={Math.round(state.wall[tune.key] * tune.factor)} onChange={event => act(() => runtime.setWall({ [tune.key]: Number(event.target.value) / tune.factor }))} />
          <output>{Math.round(state.wall[tune.key] * tune.factor)}{tune.unit}</output>
        </label>)}</div>
      </section>
      <section className="xsdsh-cat-card"><h3>猫猫桌宠</h3><p>拖着玩也行，待机久了会自己溜达、坐下、打哈欠。</p>
        <div className="xsdsh-cat-pet-preview"><img src={runtime.petImage()} alt="桌宠外观" /><span>{state.pet.on ? "桌宠已启用" : "桌宠已隐藏"}</span></div>
        <label className="xsdsh-cat-row"><input type="checkbox" data-pet-toggle="1" checked={state.pet.on} onChange={event => act(() => runtime.setPet({ on: event.target.checked }))} />让它蹲在窗口里</label>
        <div className="xsdsh-cat-row"><span>大小</span>{[[0.44, "小小只"], [0.62, "一般大"], [0.88, "大一点"]].map(([scale, label]) => <button type="button" key={scale} aria-pressed={Math.abs(state.pet.scale - Number(scale)) < 0.01} onClick={() => act(() => runtime.setPet({ scale: Number(scale) }))}>{label}</button>)}</div>
        <label className="xsdsh-cat-row"><input type="checkbox" data-pet-sound="1" checked={state.pet.sound !== false} onChange={event => act(() => runtime.setPet({ sound: event.target.checked }))} />喵喵叫</label>
        <div className="xsdsh-cat-row"><button type="button" onClick={() => act(runtime.callPet)}>叫它出来</button><button type="button" disabled={!state.pet.on} onClick={() => act(runtime.celebrate)}>鼓个掌</button></div>
      </section>
      <section className="xsdsh-cat-card"><h3>背景音乐</h3><p>播放器独立于设置面板，关闭面板后继续播放。</p>
        <div className="xsdsh-cat-row"><button type="button" onClick={() => act(() => runtime.setMusic({ on: !state.music.on }))}>{state.music.on ? "暂停" : "播放"}</button>
          <label className="xsdsh-cat-volume">音量<input type="range" min="0" max="100" step="5" data-music-volume="1" value={Math.round(state.music.volume * 100)} onChange={event => act(() => runtime.setMusic({ volume: Number(event.target.value) / 100 }))} /><output>{Math.round(state.music.volume * 100)}%</output></label>
        </div><p role="status">{musicLabels[state.musicStatus]}</p><p>首次播放可能需要点击界面，浏览器才允许出声。</p>
      </section>
    </div>
    <p role={bad ? "alert" : "status"} aria-live="polite" className="xsdsh-cat-notice" data-bad={bad || undefined}>{notice}</p>
  </section>;
}
