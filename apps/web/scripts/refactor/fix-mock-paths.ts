// apps/web/scripts/refactor/fix-mock-paths.ts
// ts-morph move and import-fixing only update import/export declarations. Vitest mock
// calls reference modules as plain string-literal arguments (vi.mock("@/x"),
// vi.importActual("@/x"), await import("@/x")). Rewrite any string literal that exactly
// equals a moved module's old alias path to its new path.
import { readFileSync } from "node:fs";
import { Node, SyntaxKind } from "ts-morph";
import { makeProject } from "./lib";

const moves: Array<{ from: string; to: string }> = JSON.parse(
  readFileSync("scripts/refactor/moves.json", "utf8")
);
const noExt = (p: string) => p.replace(/\.(tsx|ts)$/, "");
const byOld = new Map(moves.map((m) => [`@/${noExt(m.from)}`, `@/${noExt(m.to)}`]));

const project = makeProject();
let changed = 0;
for (const sf of project.getSourceFiles()) {
  let touched = false;
  for (const lit of sf.getDescendantsOfKind(SyntaxKind.StringLiteral)) {
    // Skip import/export module specifiers — fast-apply handles those swap-safely.
    // Rewriting them here would blindly re-introduce name-swap corruption.
    const parent = lit.getParent();
    if (Node.isImportDeclaration(parent) || Node.isExportDeclaration(parent)) continue;
    const v = lit.getLiteralValue();
    if (byOld.has(v)) {
      lit.setLiteralValue(byOld.get(v) as string);
      touched = true;
    }
  }
  if (touched) changed++;
}
await project.save();
console.log(`fix-mock-paths: rewrote module string literals in ${changed} files`);
