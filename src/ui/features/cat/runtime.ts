export interface WallPreference { id: string; opacity: number; blur: number; scrim: number; glass: number; glassBlur: number }
export interface PetPreference { on: boolean; scale: number; sound?: boolean; x?: number | null; y?: number | null }
export interface MusicPreference { on: boolean; volume: number }
export interface LocalWallpaper { path: string; name: string; kind: string; exists: boolean; ext?: string; mtime?: number }
export interface Wallpaper { id: string; label: string; kind: string }
export interface CatLegacyDependencies {
  WALLPAPERS: readonly Wallpaper[];
  LOCAL_WALL_ID: string;
  readWallPref(): WallPreference;
  saveWallPref(pref: WallPreference): void;
  applyWallpaperToDom(pref: WallPreference): void;
  getLocalWall(): LocalWallpaper;
  setLocalWallMeta(meta: unknown): unknown;
  wallUrl(id: string): string;
  petPrefOrDefault(): PetPreference;
  petApply(patch: Partial<PetPreference>): PetPreference | null;
  petAssetUrl(name: string): string;
  petMeow(kind: string): unknown;
  celebrate(): void;
  readMusicLive(): MusicPreference;
  applyMusicPref(pref: MusicPreference): unknown;
  getMusicElement(): Pick<HTMLAudioElement, "paused" | "muted" | "error" | "readyState"> | null;
  fetch: typeof fetch;
}
export type MusicStatus = "off" | "playing" | "waiting" | "error";
export interface CatSnapshot { wall: WallPreference; pet: PetPreference; music: MusicPreference; local: LocalWallpaper; musicStatus: MusicStatus }
export function createCatRuntimeAdapter(deps: CatLegacyDependencies) {
  let localBusy = false;
  let localVersion = 0;
  const read = (): CatSnapshot => {
    const music = deps.readMusicLive();
    const el = deps.getMusicElement();
    return { wall: { ...deps.readWallPref() }, pet: { ...deps.petPrefOrDefault() }, music: { ...music }, local: { ...deps.getLocalWall() },
      musicStatus: !music.on ? "off" : el?.error ? "error" : el && !el.paused && !el.muted && el.readyState >= 2 ? "playing" : "waiting" };
  };
  const request = async (init?: RequestInit): Promise<LocalWallpaper> => {
    const response = await deps.fetch("/Xsdsh-purge/wallpaper-local", { credentials: "same-origin", cache: "no-store", ...init });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) throw new Error(data?.error || `HTTP ${response.status}`);
    return data;
  };
  const setWall = (patch: Partial<WallPreference>) => {
    const next = { ...deps.readWallPref(), ...patch };
    deps.saveWallPref(next); deps.applyWallpaperToDom(next);
    return read();
  };
  const applyPet = (patch: Partial<PetPreference>) => {
    const applied = deps.petApply(patch);
    // The legacy engine returns its old preference when localStorage fails.
    if (!applied || Object.entries(patch).some(([key, value]) => applied[key as keyof PetPreference] !== value)) {
      throw new Error("桌宠设置未能保存，请检查本机存储权限。");
    }
  };
  return {
    read, wallpapers: deps.WALLPAPERS, localId: deps.LOCAL_WALL_ID,
    wallUrl: (id: string) => deps.wallUrl(id), petImage: () => deps.petAssetUrl("open"), setWall,
    setPet(patch: Partial<PetPreference>) {
      applyPet(patch);
      if (patch.sound === true) deps.petMeow("click");
      return read();
    },
    callPet() {
      const wasOn = deps.petPrefOrDefault().on;
      applyPet({ on: true });
      if (wasOn) deps.celebrate();
      return read();
    },
    celebrate() { if (deps.petPrefOrDefault().on) deps.celebrate(); },
    setMusic(patch: Partial<MusicPreference>) { deps.applyMusicPref({ ...deps.readMusicLive(), ...patch }); return read(); },
    async loadLocal() {
      if (localBusy) return read();
      const version = ++localVersion;
      const data = await request();
      if (version === localVersion) deps.setLocalWallMeta(data);
      return read();
    },
    async saveLocal(path: string) {
      if (localBusy) throw new Error("壁纸操作正在进行。");
      if (!path.trim()) throw new Error("请填写本地壁纸路径。");
      localBusy = true; ++localVersion;
      try {
        const data = await request({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: path.trim() }) });
        deps.setLocalWallMeta(data);
        return setWall({ id: deps.LOCAL_WALL_ID });
      } finally { localBusy = false; }
    },
    async clearLocal() {
      if (localBusy) throw new Error("壁纸操作正在进行。");
      localBusy = true; ++localVersion;
      try {
        await request({ method: "DELETE" });
        deps.setLocalWallMeta(null);
        return deps.readWallPref().id === deps.LOCAL_WALL_ID ? setWall({ id: "" }) : read();
      } finally { localBusy = false; }
    },
  };
}
export type CatRuntime = ReturnType<typeof createCatRuntimeAdapter>;
