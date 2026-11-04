#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = /\.(?:[cm]?[jt]sx?)$/;
const slash = (path) => path.replace(/\\/g, "/");
const options = { allowJs: true, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext };

/** Includes type-only dependencies: architectural ownership also applies to types. */
export function dependencySpecifiers(source) {
  const refs = [];
  const add = (node) => {
    if (node && ts.isStringLiteralLike(node)) {
      refs.push({ specifier: node.text, line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1 });
    }
  };
  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) add(node.moduleSpecifier);
    else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) add(node.moduleReference.expression);
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) add(node.argument.literal);
    else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      add(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return refs;
}

export function boundaryViolation(from, to) {
  const a = from.split("/");
  const b = to.split("/");
  if (["host", "shared", "components"].includes(a[0]) && ["features", "app"].includes(b[0])) {
    return `${a[0]} 不得依赖 ${b[0]}`;
  }
  if (a[0] === "features") {
    if (b[0] === "app") return "feature 不得依赖 app（类型也应放在 shared）";
    if (b[0] === "features" && a[1] !== b[1] && !(b.length === 3 && /^index\.[cm]?[jt]sx?$/.test(b[2]))) {
      return "跨 feature 只能依赖公开 index";
    }
  }
  return null;
}

export function checkUiBoundaries(root = ROOT) {
  const ui = resolve(root, "src/ui");
  const issues = [];
  const graph = new Map();
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = resolve(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile() && SOURCE.test(entry.name)) files.push(file);
    }
  };
  if (!existsSync(ui)) return { graph, issues: [{ rule: "missing-root", file: "src/ui", message: "src/ui 不存在" }] };
  walk(ui);
  if (!files.length) issues.push({ rule: "empty", file: "src/ui", message: "没有可检查的模块" });
  const fileSet = new Set(files);
  for (const file of files) {
    const name = slash(relative(ui, file));
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    graph.set(name, []);
    for (const diag of source.parseDiagnostics) {
      issues.push({ rule: "syntax", file: name, line: source.getLineAndCharacterOfPosition(diag.start || 0).line + 1, message: ts.flattenDiagnosticMessageText(diag.messageText, " ") });
    }
    for (const ref of dependencySpecifiers(source)) {
      if (!ref.specifier.startsWith(".")) continue;
      const abs = resolve(dirname(file), ref.specifier);
      const back = relative(ui, abs);
      if (back.startsWith("..") || isAbsolute(back)) {
        issues.push({ rule: "outside", file: name, ...ref, message: "相对依赖越出 src/ui" });
        continue;
      }
      // CSS is loaded as text by esbuild; it still must exist on disk.
      const resolved = extname(abs) === ".css"
        ? (existsSync(abs) && statSync(abs).isFile() ? abs : null)
        : ts.resolveModuleName(ref.specifier, file, options, ts.sys).resolvedModule?.resolvedFileName;
      if (!resolved || (!fileSet.has(resolve(resolved)) && extname(resolved) !== ".css")) {
        issues.push({ rule: "missing", file: name, ...ref, message: "相对模块不存在或不是 UI 源码" });
        continue;
      }
      const target = slash(relative(ui, resolve(resolved)));
      const violation = boundaryViolation(name, target);
      if (violation) issues.push({ rule: "boundary", file: name, ...ref, target, message: violation });
      if (SOURCE.test(resolved)) graph.get(name).push(target);
    }
  }
  const state = new Map();
  const stack = [];
  const visit = (name) => {
    state.set(name, 1);
    stack.push(name);
    for (const dep of graph.get(name) || []) {
      if (state.get(dep) === 1) {
        const cycle = [...stack.slice(stack.indexOf(dep)), dep];
        issues.push({ rule: "cycle", file: name, message: cycle.join(" -> ") });
      } else if (!state.has(dep)) visit(dep);
    }
    stack.pop();
    state.set(name, 2);
  };
  for (const name of graph.keys()) if (!state.has(name)) visit(name);
  return { graph, issues };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkUiBoundaries(process.env.XSDSH_PLUGIN_ROOT || ROOT);
  for (const issue of result.issues) console.error(`[${issue.rule}] src/ui/${issue.file}${issue.line ? ":" + issue.line : ""}: ${issue.message}${issue.specifier ? " (" + issue.specifier + ")" : ""}`);
  console.log(`UI 边界：${result.graph.size} 模块，${result.issues.length} 个问题`);
  process.exitCode = result.issues.length ? 1 : 0;
}
