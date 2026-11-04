// 精简版（core）：外观页的壁纸、背景音乐、桌宠三类娱乐功能已整体移除。
// 这里只保留「玻璃折射」这一层 —— 清洗页的玻璃开关（87-integration 的
// clean.glass）依赖 GLASS_KEY / readGlassPref / saveGlassPref / ensureGlassFilter，
// 所以这一小块必须留着；其余外观层符号（壁纸列表、偏好读写、开机启动、外壳软化、
// 背景音乐、桌宠）随原实现一并删除。
const GLASS_KEY = "xsdsh.glass";
// 改名迁移：旧键 dshp.glass 里还留着用户设过的开关，第一次读到就搬进新键。
const LEGACY_GLASS_KEY = "dshp.glass";

function readStored(key, legacyKey) {
	try {
		const fresh = localStorage.getItem(key);
		if (fresh !== null) return fresh;
		const old = localStorage.getItem(legacyKey);
		if (old === null) return null;
		try { localStorage.setItem(key, old); } catch { /* 配额满就只读这一次 */ }
		return old;
	} catch {
		return null;
	}
}

function readGlassPref() {
	try {
		const raw = readStored(GLASS_KEY, LEGACY_GLASS_KEY);
		return raw === null ? true : raw === "1";
	} catch {
		return true;
	}
}

function saveGlassPref(on) {
	try { localStorage.setItem(GLASS_KEY, on ? "1" : "0"); } catch { /* ignore */ }
}

const LG_FILTER_ID = "xsdsh-lg-refract";
const LG_FILTER_HTML = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;pointer-events:none" aria-hidden="true" focusable="false">
  <defs>
    <filter id="${LG_FILTER_ID}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feImage x="0" y="0" width="120" height="120" preserveAspectRatio="none" result="map" href="data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="gx" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#f00"/><stop offset="22%" stop-color="#808080"/>
            <stop offset="78%" stop-color="#808080"/><stop offset="100%" stop-color="#f00"/>
          </linearGradient>
          <linearGradient id="gy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0f0"/><stop offset="22%" stop-color="#808080"/>
            <stop offset="78%" stop-color="#808080"/><stop offset="100%" stop-color="#0f0"/>
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill="#808080"/>
        <rect width="120" height="120" fill="url(#gx)" style="mix-blend-mode:screen"/>
        <rect width="120" height="120" fill="url(#gy)" style="mix-blend-mode:screen"/>
        <rect x="26" y="26" width="68" height="68" rx="24" ry="24" fill="#808080" style="filter:blur(9px)"/>
      </svg>`)}" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale="14" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
</svg>`;

const LG_HOST_ID = "xsdsh-lg-defs";

function ensureGlassFilter() {
	if (typeof document === "undefined") return false;
	try {
		if (document.getElementById(LG_HOST_ID)) return true;
		const holder = document.createElement("div");
		holder.id = LG_HOST_ID;
		holder.innerHTML = LG_FILTER_HTML;
		(document.body || document.documentElement).appendChild(holder);
		return true;
	} catch {
		return false;
	}
}
