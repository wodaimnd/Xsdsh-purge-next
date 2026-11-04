export const PHASE1_KEEP_EXPR =
  'PERSONA_SECTION_NAMES.has(section?.name) || String(section?.name || "").startsWith("Xsdsh-purge-next") || String(section?.name || "").startsWith("xsdshpg-")';

/**
 * 把官方 phase-1 白名单放宽到 Xsdsh-purge-next* + xsdshpg-*。
 * 已放行 Xsdsh-purge-next 的旧补丁会升到带 xsdshpg。
 */
export function widenPhase1KeepFilter(text) {
  const raw = String(text || "");
  const crlf = raw.includes("\r\n");
  let next = raw.replace(/\r\n/g, "\n");
  next = next.replace(
    /PERSONA_SECTION_NAMES\.has\(section\?\.name\) \|\| String\(section\?\.name \|\| ""\)\.startsWith\("Xsdsh-purge-next"\)(?! \|\| String\(section\?\.name \|\| ""\)\.startsWith\("xsdshpg-"\))/g,
    PHASE1_KEEP_EXPR,
  );
  next = next.replace(
    /section => PERSONA_SECTION_NAMES\.has\(section\?\.name\)(?! \|\|)/g,
    `section => ${PHASE1_KEEP_EXPR}`,
  );
  return crlf ? next.replace(/\n/g, "\r\n") : next;
}
