// apps/web/scripts/refactor/fix-imports.ts
// Safety net for import/export declarations that ts-morph's move() failed to update.
// IMPORTANT: only rewrite specifiers that no longer RESOLVE. A blind old->new mapping is
// unsafe because disambiguation can make one path both a new destination and another
// file's old source (e.g. WinemakerCard), so rewriting a resolved import would corrupt it.
import { readFileSync } from "node:fs";
import { makeProject } from "./lib";

const moves: Array<{ from: string; to: string }> = JSON.parse(
  readFileSync("scripts/refactor/moves.json", "utf8")
);
const noExt = (p: string) => p.replace(/\.(tsx|ts)$/, "");
const byOld = new Map(moves.map((m) => [`@/${noExt(m.from)}`, `@/${noExt(m.to)}`]));

const project = makeProject();
let _changed = 0;
for (const sf of project.getSourceFiles()) {
  let touched = false;
  for (const decl of [...sf.getImportDeclarations(), ...sf.getExportDeclarations()]) {
    const spec = decl.getModuleSpecifierValue();
    if (!spec || !byOld.has(spec)) continue;
    if (decl.getModuleSpecifierSourceFile()) continue; // resolves fine -> leave it alone
    decl.setModuleSpecifier(byOld.get(spec) as string);
    touched = true;
  }
  if (touched) _changed++;
}
await project.save();
