/**
 * 主机名末段里“其实是个文件名”的后缀。
 *
 * 前端预校验（自己的服务器表格）与宿主机取词（net-scope）必须用同一份清单：
 * 两侧各写一份时很容易一边放行 `config.yml`、另一边把它当主机名收进白名单。
 * `.zip` 已从清单移除——它是真实顶级域，不能再按文件名丢弃。
 */
export const HOST_FILE_SUFFIX = new Set([
  "js", "jsx", "ts", "tsx", "mjs", "cjs", "json", "md", "yml", "yaml",
  "css", "html", "map", "log", "txt", "png", "jpg", "jpeg", "gif", "svg",
  "webp", "pdf", "woff", "woff2", "lock", "vue", "py", "go", "rs", "java",
  "xml", "toml", "ini", "bak", "patch", "diff", "sh", "ps1", "cmd", "bat",
  "exe", "dll", "tar", "gz",
]);

/** host 允许带 `user@`；只看最后一个点之后的部分。 */
export function isFileLikeHost(host) {
  const text = String(host || "");
  const dot = text.lastIndexOf(".");
  if (dot < 0 || dot === text.length - 1) return false;
  return HOST_FILE_SUFFIX.has(text.slice(dot + 1).toLowerCase());
}
