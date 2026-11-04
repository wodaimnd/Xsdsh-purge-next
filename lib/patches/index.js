/**
 * 补丁表汇总 + 结构校验。
 *
 * 为什么拆成 4 个文件：整张表 82 条、约 3 300 行，混在 `core.js`（1 万行）里
 * 改一条要滚上万行，review 和冲突成本都高。这里只放数据与校验，不放任何 IO 逻辑。
 *
 * 字段约定（新增字段请同步改 PATCH_KEYS，否则加载即报错）：
 *   id            必填，数字，全表唯一
 *   name          必填，稳定的符号名（也用于日志与测试定位）
 *   layer         必填，中文层名（提示词 / 代码 / 工具 / 兼容层）
 *   layer_en      选填，英文层名
 *   desc          必填，一句话说明
 *   file / rel    目标包与包内相对路径（file 可以是字符串或字符串数组）
 *   replacements  替换链 [{pattern, replace}]
 *   patterns      多模式替换
 *   pattern/replace  单条替换
 *   markers / marker / markersAny / skipIfMarked  防重复应用的判据
 *   optional / forbid / surfaces / strictFiles / softSettle  适用面与前置条件
 *   knownGap      归类：锚点对不上某个已知分发的说明（只影响面板与指纹测试的预期，
 *   migrationOnly 归类：needle 是旧版插件产物，只对升级用户有意义。两者都不改变 apply）
 */
import { PATCHES } from "./prompt.js";
import { CODE_PATCHES } from "./code.js";
import { ENGINE_PATCHES } from "./engine.js";
import { NEW_TOOL_PATCHES } from "./tool.js";

export { PATCHES, CODE_PATCHES, ENGINE_PATCHES, NEW_TOOL_PATCHES };

export const ALL_PATCHES = [...PATCHES, ...CODE_PATCHES, ...ENGINE_PATCHES, ...NEW_TOOL_PATCHES];

/** 允许出现的键。写错字段名（例如 `replacments`）会让补丁静默不生效，这里直接拦。 */
export const PATCH_KEYS = new Set([
  "id", "name", "layer", "layer_en", "desc",
  "file", "rel",
  "replacements", "patterns", "pattern", "replace",
  "markers", "marker", "markersAny", "skipIfMarked",
  "optional", "forbid", "surfaces", "strictFiles", "softSettle",
  "knownGap", "migrationOnly", "chainAfter",
]);

const REQUIRED = ["id", "name", "layer", "desc"];

/**
 * 结构校验。**在模块加载时调用一次**：字段写错是开发期错误，
 * 应该在启动时就炸，而不是等到某次 apply 之后才发现某条补丁从没生效。
 * @param {Array} patches
 */
export function validatePatches(patches = ALL_PATCHES) {
  const seen = new Map();
  for (const p of patches) {
    const label = p && p.id != null ? `#${p.id}` : "<无 id>";
    if (!p || typeof p !== "object") throw new Error(`补丁 ${label} 不是对象`);
    if (typeof p.id !== "number") throw new Error(`补丁 ${label} 的 id 必须是数字`);
    if (seen.has(p.id)) throw new Error(`补丁 id 重复：${p.id}（${seen.get(p.id)} 与 ${p.name}）`);
    seen.set(p.id, p.name);
    for (const key of REQUIRED) {
      if (p[key] == null || p[key] === "") throw new Error(`补丁 ${label} 缺必填字段 ${key}`);
    }
    const fileOk = (typeof p.file === "string" && p.file !== "")
      || (Array.isArray(p.file) && p.file.length > 0 && p.file.every((f) => typeof f === "string" && f));
    if (!fileOk) throw new Error(`补丁 ${label} 的 file 必须是字符串或非空字符串数组`);
    for (const key of Object.keys(p)) {
      if (!PATCH_KEYS.has(key)) {
        throw new Error(`补丁 ${label}（${p.name}）有未知字段 ${key}；新增字段请同步更新 PATCH_KEYS`);
      }
    }
    if (!(p.replacements || p.patterns || p.pattern || p.replace)) {
      throw new Error(`补丁 ${label}（${p.name}）没有任何替换内容`);
    }
    if (p.chainAfter !== undefined) {
      const chain = p.chainAfter;
      const chainOk = Array.isArray(chain) && chain.length > 0
        && chain.every((id) => typeof id === "number" && id !== p.id);
      if (!chainOk) {
        throw new Error(`补丁 ${label}（${p.name}）的 chainAfter 必须是非空数字数组，且不能引用自身`);
      }
    }
  }
  return patches.length;
}

validatePatches();
