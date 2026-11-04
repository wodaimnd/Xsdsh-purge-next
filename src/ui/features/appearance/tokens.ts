export const THEMES = [
  { id: "cat-sky", name: "晴空", accent: "#2563eb", description: "中性冷灰底配明亮靛蓝，白卡片与极淡边框，白天投屏也清楚。" },
  { id: "cat-night", name: "夜巡", accent: "#7fc8e8", description: "深蓝底配冰蓝高光，深海军蓝让夜间阅读更舒适。" },
  { id: "cat-sakura", name: "樱雪", accent: "#b04a72", description: "奶白底配樱粉强调，状态色加深后小字也看得清。" },
] as const;
export type ThemeId = (typeof THEMES)[number]["id"];
export const ACCENTS = [
  { color: "#8fbf9a", name: "鼠尾草绿" }, { color: "#2563eb", name: "靛蓝" },
  { color: "#e79ab2", name: "猫耳粉" }, { color: "#a78bca", name: "雪青紫" },
  { color: "#d8b56c", name: "琥珀" }, { color: "#e0897f", name: "珊瑚" },
] as const;
export interface LookPreference { readonly t: ThemeId; readonly a: string }
export const DEFAULT_LOOK: LookPreference = Object.freeze({ t: "cat-sky", a: "#2563eb" });
export function getTheme(id: ThemeId) { return THEMES.find(theme => theme.id === id)!; }
export function accentName(color: string): string {
  return ACCENTS.find(accent => accent.color === color)?.name
    ?? ({ "#2563eb": "靛蓝", "#7fc8e8": "冰蓝", "#b04a72": "樱粉" } as Record<string, string>)[color]
    ?? color;
}
/** Themes and accents that shipped before 4.6.4; migrated silently so users keep their look. */
const LEGACY_THEMES: Record<string, ThemeId> = { "default-light": "cat-sky" };
const LEGACY_ACCENTS: Record<string, string> = { "#2f7f8f": "#2563eb", "#d97fa4": "#b04a72" };
export function migrateLook(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const input = value as Record<string, unknown>;
  const theme = typeof input.t === "string" ? LEGACY_THEMES[input.t] ?? input.t : input.t;
  const accent = typeof input.a === "string" ? LEGACY_ACCENTS[input.a.toLowerCase()] ?? input.a : input.a;
  return theme === input.t && accent === input.a ? value : { ...input, t: theme, a: accent };
}
export function normalizeLook(value: unknown): LookPreference {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_LOOK;
  const input = value as Record<string, unknown>;
  const theme = THEMES.find(item => item.id === input.t);
  if (!theme) return DEFAULT_LOOK;
  const accent = typeof input.a === "string" ? input.a.toLowerCase() : "";
  // Only the six offered accents and this style's native accent are supported.
  const valid = accent === theme.accent || ACCENTS.some(item => item.color === accent);
  return Object.freeze({ t: theme.id, a: valid ? accent : theme.accent });
}

// Direction 9 palettes. These are values only; no html/body or host theme selectors.
// 背景一律纯色：面板背后常垫着聊天内容，径向渐变会把泛光映得局部发亮，观感比纯色脏。
const paletteSource: Record<ThemeId, string> = {
  "cat-sky": `
    bg:#f4f7fb;panel:#ffffff;panel2:#f8fafc;panel3:#eef2f7;
    inset:#f6f8fb;inset2:#f0f4f9;soft:#e5eaf1;soft2:#d8e0ea;hover:#eef3f9;hover2:#e7eef6;sel:#e8f0ff;
    line:#e4e9f0;line2:#edf1f5;line3:#cfd7e3;line-hover:#aab7c8;ink:#101828;mute:#5b6b80;faint:#667282;
    accent:#2563eb;accent-bg:#e8f0ff;accent-soft:rgba(37,99,235,.10);accent-glow:rgba(37,99,235,.22);
    ok:#067647;ok-soft:rgba(6,118,71,.10);ok-line:rgba(6,118,71,.32);
    warn:#b54708;warn-soft:rgba(181,71,8,.10);warn-line:rgba(181,71,8,.28);
    bad:#d0241a;bad-soft:rgba(208,36,26,.10);bad-line:rgba(208,36,26,.28);
    na:#667282;na-soft:rgba(102,114,130,.16);skip:#6938ef;purple:#7a5af8;purple-soft:rgba(122,90,248,.12);
    mut-soft:rgba(91,107,128,.08);danger-line:#f0b4b0;danger-bg:#fef3f2;scroll:#cfd7e3;scroll-h:#aab7c8;cat-pink:#e79ab2;
    overlay:rgba(16,24,40,.42);shadow-dock:0 18px 44px rgba(16,24,40,.14);shadow-menu:0 16px 36px rgba(16,24,40,.18);`,
  "cat-night": `
    bg:#0d121b;panel:#151c28;panel2:#1a2230;panel3:#131a26;
    inset:#101722;inset2:#121a26;soft:#202a3a;soft2:#2b3a4e;hover:#1e2837;hover2:#232e3f;sel:#1b2b3a;
    line:#2b3748;line2:#222d3d;line3:#3a4a5f;line-hover:#3d4f66;ink:#e3edf6;mute:#93a6ba;faint:#8698ab;
    accent:#7fc8e8;accent-bg:#1d3a4b;accent-soft:rgba(127,200,232,.14);accent-glow:rgba(127,200,232,.25);
    ok:#63c39a;ok-soft:rgba(99,195,154,.12);ok-line:rgba(99,195,154,.5);
    warn:#e0b878;warn-soft:rgba(224,184,120,.12);warn-line:rgba(224,184,120,.24);
    bad:#e08a92;bad-soft:rgba(224,138,146,.13);bad-line:rgba(224,138,146,.28);
    na:#8a9aac;na-soft:rgba(138,154,172,.16);skip:#a99bd6;purple:#b79ae0;purple-soft:rgba(183,154,224,.16);
    mut-soft:rgba(147,166,186,.1);danger-line:#6b3a44;danger-bg:#2a1a22;scroll:#3a4a5f;scroll-h:#5b7390;cat-pink:#e8a7b8;
    overlay:rgba(5,8,13,.66);shadow-dock:0 20px 50px rgba(0,0,0,.5);shadow-menu:0 18px 40px rgba(0,0,0,.6);`,
  "cat-sakura": `
    bg:#faf1f5;panel:#fffdfe;panel2:#fdf7fa;panel3:#f9f0f5;
    inset:#fbf5f8;inset2:#f8eef4;soft:#f0e2ea;soft2:#e6d3df;hover:#f9eef4;hover2:#f6e6ef;sel:#f2e2ec;
    line:#e6d2de;line2:#efdfe8;line3:#d8bccd;line-hover:#cda9be;ink:#2b2a33;mute:#6d6270;faint:#7a6b78;
    accent:#b04a72;accent-bg:#f7dde8;accent-soft:rgba(176,74,114,.13);accent-glow:rgba(176,74,114,.25);
    ok:#2f6b4a;ok-soft:rgba(47,107,74,.12);ok-line:rgba(47,107,74,.45);
    warn:#8a5f16;warn-soft:rgba(138,95,22,.12);warn-line:rgba(138,95,22,.28);
    bad:#a83f4b;bad-soft:rgba(168,63,75,.12);bad-line:rgba(168,63,75,.3);
    na:#7a6b78;na-soft:rgba(122,107,120,.16);skip:#7a5fa0;purple:#8a63b0;purple-soft:rgba(138,99,176,.14);
    mut-soft:rgba(109,98,112,.1);danger-line:#e2a7a7;danger-bg:#fdeeee;scroll:#d8bccd;scroll-h:#bb93a9;cat-pink:#d97fa4;
    overlay:rgba(43,42,51,.42);shadow-dock:0 18px 44px rgba(43,42,51,.16);shadow-menu:0 16px 36px rgba(43,42,51,.2);`,
};
export type ThemeTokens = Record<`--xsdsh-${string}`, string>;
function channels(hex: string) { return [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16)); }
function rgba(hex: string, alpha: number) { return `rgba(${channels(hex).join(",")},${alpha})`; }
function mix(accent: string, panel: string): string {
  const base = channels(panel);
  return "#" + channels(accent).map((channel, i) => Math.round(channel * .2 + base[i] * .8).toString(16).padStart(2, "0")).join("");
}
function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex).map(value => {
    const channel = value / 255;
    return channel <= .03928 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return .2126 * r + .7152 * g + .0722 * b;
}
/** Pick a foreground that stays readable on the accent fill (dark accents get white, pale ones ink). */
export function readableOn(hex: string): string {
  const lum = relativeLuminance(hex);
  const onWhite = 1.05 / (lum + .05);
  const onInk = (lum + .05) / (relativeLuminance("#101828") + .05);
  return onWhite >= onInk ? "#ffffff" : "#101828";
}
export function getThemeTokens(value: unknown = DEFAULT_LOOK): ThemeTokens {
  const look = normalizeLook(value);
  const tokens: ThemeTokens = {};
  for (const item of paletteSource[look.t].split(";")) {
    const [key, ...parts] = item.trim().split(":");
    if (key && parts.length) tokens[`--xsdsh-${key}`] = parts.join(":");
  }
  if (look.a !== getTheme(look.t).accent) {
    tokens["--xsdsh-accent"] = look.a;
    tokens["--xsdsh-accent-bg"] = mix(look.a, tokens["--xsdsh-panel"]);
    tokens["--xsdsh-accent-soft"] = rgba(look.a, .14);
    tokens["--xsdsh-accent-glow"] = rgba(look.a, .25);
  }
  tokens["--xsdsh-font-ui"] = '"Segoe UI","Microsoft YaHei UI","PingFang SC","Noto Sans SC",system-ui,sans-serif';
  tokens["--xsdsh-font-code"] = '"Cascadia Mono","Sarasa Mono SC",ui-monospace,monospace';
  // Compatibility with PURGE_CSS. Keep these on plugin roots, never host roots.
  tokens["--xsdsh-paper"] = tokens["--xsdsh-panel"];
  tokens["--xsdsh-fill"] = tokens["--xsdsh-accent-soft"];
  // Legacy alias: some clean-page rules still ask for --xsdsh-text.
  tokens["--xsdsh-text"] = tokens["--xsdsh-ink"];
  tokens["--xsdsh-accent-fg"] = readableOn(tokens["--xsdsh-accent"]);
  tokens["--xsdsh-sans"] = tokens["--xsdsh-font-ui"];
  tokens["--xsdsh-display"] = tokens["--xsdsh-font-ui"];
  tokens["--xsdsh-mono"] = tokens["--xsdsh-font-code"];
  tokens["--xsdsh-ease"] = "cubic-bezier(.16,1,.3,1)";
  return tokens;
}
