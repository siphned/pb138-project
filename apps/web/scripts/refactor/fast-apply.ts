// apps/web/scripts/refactor/fast-apply.ts
// Deterministic, swap-safe, FAST replacement for ts-morph's per-move reference updating.
// Resolves specifiers with pure path math + existsSync (NO type checker, which is what
// made getModuleSpecifierSourceFile pathologically slow on this project's big generated
// files). Steps:
//   1. Parse imports/exports, resolve each to its target FILE on the current (pre-move) disk.
//   2. Rewrite each affected specifier to the "@/" alias of the target's NEW location.
//   3. Save (still at old paths), then physically move files with fs.rename.
// Resolving by actual file path makes name-swap disambiguation correct: an importer of
// catalog/WinemakerCard maps to catalog's destination, never to a same-named sibling.
import { existsSync, mkdirSync, readFileSync, renameSync, statSync } from "node:fs";
import path from "node:path";
import { makeProject, SRC } from "./lib";

const norm = (p: string) => p.replace(/\\/g, "/");
const moves: Array<{ from: string; to: string }> = JSON.parse(
  readFileSync("scripts/refactor/moves.json", "utf8")
);
const moveMap = new Map<string, string>(); // abs old -> abs new
for (const m of moves)
  moveMap.set(norm(path.resolve("src", m.from)), norm(path.resolve("src", m.to)));

const EXTS = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx"];
function resolveSpec(spec: string, importerAbs: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
  else if (spec.startsWith("./") || spec.startsWith("../"))
    base = path.resolve(path.dirname(importerAbs), spec);
  else return null; // bare specifier (node_modules)
  base = norm(base);
  for (const ext of EXTS) {
    const c = norm(base + ext);
    if (existsSync(c) && !statSync(c).isDirectory()) return c;
  }
  return null;
}

const newAbsOf = (abs: string) => moveMap.get(norm(abs)) ?? norm(abs);
const aliasOf = (abs: string) =>
  `@/${path
    .relative(SRC, abs)
    .replace(/\\/g, "/")
    .replace(/\.(tsx|ts|jsx|js)$/, "")}`;

const project = makeProject();
let _rewrites = 0;
for (const sf of project.getSourceFiles()) {
  const importerOld = norm(sf.getFilePath());
  for (const decl of [...sf.getImportDeclarations(), ...sf.getExportDeclarations()]) {
    const spec = decl.getModuleSpecifierValue();
    if (!spec) continue;
    const targetOld = resolveSpec(spec, importerOld);
    if (!targetOld) continue; // external / unresolved
    if (!moveMap.has(importerOld) && !moveMap.has(targetOld)) continue; // nothing moved
    decl.setModuleSpecifier(aliasOf(newAbsOf(targetOld)));
    _rewrites++;
  }
}
await project.save();

// Order renames topologically: if A's destination is occupied by B's source, move B first
// (vacate-before-occupy), so a name-swap doesn't clobber the file moving into the slot.
const ordered: [string, string][] = [];
const seen = new Set<string>();
const visit = (oldAbs: string, newAbs: string, stack = new Set<string>()) => {
  if (seen.has(oldAbs)) return;
  if (stack.has(oldAbs)) throw new Error(`rename cycle at ${oldAbs}`);
  stack.add(oldAbs);
  const occupantNew = moveMap.get(newAbs); // a move whose SOURCE is this destination
  if (occupantNew && newAbs !== oldAbs) visit(newAbs, occupantNew, stack);
  stack.delete(oldAbs);
  seen.add(oldAbs);
  ordered.push([oldAbs, newAbs]);
};
for (const [oldAbs, newAbs] of moveMap) visit(oldAbs, newAbs);

let _moved = 0;
for (const [oldAbs, newAbs] of ordered) {
  if (!existsSync(oldAbs)) {
    continue;
  }
  mkdirSync(path.dirname(newAbs), { recursive: true });
  renameSync(oldAbs, newAbs);
  _moved++;
}
