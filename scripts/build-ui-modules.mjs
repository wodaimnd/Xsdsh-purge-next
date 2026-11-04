import { buildSync } from "esbuild";
import { isAbsolute, relative, resolve } from "node:path";

export const MODULE_BEGIN = "/* __XSDSH_UI_MODULES_BEGIN__ */";
export const MODULE_END = "/* __XSDSH_UI_MODULES_END__ */";
export const MODULE_ENTRY = "src/ui/client-modules.ts";

/** Compile only migrated modules. Legacy fragments never pass through esbuild. */
export function buildUiModules(root, entry = MODULE_ENTRY) {
  if (entry !== MODULE_ENTRY) throw new Error(`未知 UI 模块入口：${entry}`);
  const result = buildSync({
    absWorkingDir: resolve(root),
    entryPoints: [entry],
    tsconfig: resolve(root, "tsconfig.json"),
    bundle: true,
    write: false,
    format: "cjs",
    platform: "browser",
    target: "es2020",
    charset: "utf8",
    loader: { ".css": "text" },
    minify: false,
    sourcemap: false,
    legalComments: "inline",
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    // Bare imports must remain external; the allowlist below rejects new runtimes.
    packages: "external",
    external: ["react", "react-dom"],
    metafile: true,
    logLevel: "silent",
  });
  const uiRoot = resolve(root, "src/ui");
  for (const input of Object.keys(result.metafile.inputs)) {
    const back = relative(uiRoot, resolve(root, input));
    if (!back || back.startsWith("..") || isAbsolute(back)) {
      throw new Error(`UI 模块只能打包 src/ui 内源码：${input}`);
    }
  }
  for (const output of Object.values(result.metafile.outputs)) {
    for (const dep of output.imports) {
      if (!dep.external || !["react", "react-dom"].includes(dep.path)) {
        throw new Error(`UI 模块依赖未由宿主提供：${dep.path}`);
      }
    }
  }
  const code = result.outputFiles[0].text;
  // The wrapper closes over ModuleLoader's require, not Node/global require.
  // Its local module/exports also cannot overwrite the plugin's exports.
  const text = `${MODULE_BEGIN}
const __xsdshClientModules = (() => {
  var module = { exports: {} };
  var exports = module.exports;
${code}
  return module.exports;
})();
${MODULE_END}
`;
  return { text, code, metafile: result.metafile };
}
