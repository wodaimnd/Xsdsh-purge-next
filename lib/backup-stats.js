import { constants } from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";

const SUFFIXES = [".xsdshpurge.bak", ".dshpurge.bak"];
const UNPACKED = /\.asar\.unpacked(?:[\\/]|$)/i;
const USER_PATCH = /[\\/]profiles[\\/][^\\/]+[\\/]cordis\.patch\.yml$/i;

/**
 * 只读统计 gatherState.files 当前目标表旁的文件级备份，不枚举目录、不另找宿主。
 * 与 revertAll 一样新后缀优先；同一目标的双后缀只计一次，真实路径别名去重。
 * 仅计可读、非空普通文件；用户 cordis.patch.yml 备份不用于还原，排除。
 * 范围不含 shim、历史孤立备份、归档备份或 sidecar（它们不是文件级还原目标）。
 * 快通道的 .unpacked 备份可能已打补丁，不能当原件计数；该模式返回 null。
 * 缺宿主/目标表、无权限或检测失败均为未知 null；完整检查后没有备份才是 0。
 */
export async function countBackupFiles(state, io = fs) {
  try {
    if (!state?.ai_base || !state.files || typeof state.files !== "object" || Array.isArray(state.files)) return null;
    if (UNPACKED.test(state.ai_base)) return null;
    const targets = new Set();
    for (const value of Object.values(state.files)) {
      for (const target of (Array.isArray(value) ? value : [value])) {
        if (target == null || target === "") continue;
        if (typeof target !== "string" || !path.isAbsolute(target)) return null;
        if (UNPACKED.test(target)) return null;
        if (!USER_PATCH.test(target)) targets.add(path.normalize(target));
      }
    }
    const backups = new Set();
    for (const target of targets) {
      for (const suffix of SUFFIXES) {
        const backup = target + suffix;
        let stat;
        try {
          stat = await io.stat(backup);
        } catch (error) {
          if (error?.code === "ENOENT") continue;
          return null;
        }
        // 无效的新备份会挡住旧后缀；不能跳过去把 core 不会使用的旧备份计入。
        if (stat.isFile() && stat.size > 0) {
          await io.access(backup, constants.R_OK);
          const real = await io.realpath(backup);
          backups.add(process.platform === "win32" ? real.toLowerCase() : real);
        }
        break;
      }
    }
    return backups.size;
  } catch {
    return null;
  }
}
