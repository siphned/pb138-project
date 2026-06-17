// apps/web/scripts/refactor/compute-colocation.ts
// Computes, for every in-scope component, the deepest route directory that is a common
// ancestor of all routes transitively using it, then writes moves.json. Test files are
// anchored to their component's destination; __tests__ helpers to the common ancestor of
// the tests that import them; same-name collisions are disambiguated by source feature.
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { SourceFile } from "ts-morph";
import { inScope, isRouteFile, isTest, isTestHelper, makeProject, rel } from "./lib";

const project = makeProject();

// Memoized: set of route-file paths (or "ROOT") that transitively import `file`.
const cache = new Map<string, Set<string>>();
function routeUsers(file: SourceFile, seen = new Set<string>()): Set<string> {
  const key = file.getFilePath();
  if (cache.has(key)) return cache.get(key) as Set<string>;
  if (seen.has(key)) return new Set();
  seen.add(key);
  const out = new Set<string>();
  for (const ref of file.getReferencingSourceFiles()) {
    const rp = ref.getFilePath();
    if (isRouteFile(rp)) out.add(rp);
    else if (isTest(rp) || isTestHelper(rp)) {
      // tests must not influence a component's placement
    } else if (inScope(rp)) for (const u of routeUsers(ref, seen)) out.add(u);
    else out.add("ROOT"); // referenced by a non-route, non-in-scope file -> broadly shared
  }
  cache.set(key, out);
  return out;
}

function commonAncestorDir(users: string[]): string {
  if (users.includes("ROOT") || users.length === 0) return "routes";
  const dirs = users.map((f) => path.dirname(rel(f)).split("/"));
  const first = dirs[0];
  let i = 0;
  for (; i < first.length; i++) {
    if (!dirs.every((d) => d[i] === first[i])) break;
  }
  return first.slice(0, i).join("/") || "routes";
}

const destDirOf = (ancestor: string) =>
  `${ancestor.startsWith("routes") ? ancestor : `routes/${ancestor}`}/-components`;

// ---- Pass 1: place component (non-test, non-helper) files ----
type Cand = { from: string; base: string; destDir: string; feature: string };
const cands: Cand[] = [];
for (const sf of project.getSourceFiles()) {
  const p = sf.getFilePath();
  if (!inScope(p) || isTest(p) || isTestHelper(p)) continue;
  const r = rel(p);
  const destDir = destDirOf(commonAncestorDir([...routeUsers(sf)]));
  // feature = the source folder that distinguishes colliding names (e.g. "catalog", "shops")
  const parts = r.split("/");
  const feature = parts[0] === "components" ? parts[1] : "shared";
  cands.push({ base: path.basename(r), destDir, feature, from: r });
}

// Disambiguate same-name collisions: first (alphabetical by `from`) keeps the clean path,
// the rest get nested under their source feature folder.
cands.sort((a, b) => a.from.localeCompare(b.from));
const taken = new Set<string>();
const finalDir = new Map<string, string>(); // component rel -> final dest dir
const moves: Array<{ from: string; to: string }> = [];
for (const c of cands) {
  let destDir = c.destDir;
  if (taken.has(`${destDir}/${c.base}`)) destDir = `${destDir}/${c.feature}`;
  const dest = `${destDir}/${c.base}`;
  if (taken.has(dest)) throw new Error(`unresolved collision at ${dest} (from ${c.from})`);
  taken.add(dest);
  finalDir.set(c.from, destDir);
  if (c.from !== dest) moves.push({ from: c.from, to: dest });
}

// ---- Pass 2a: place test files next to their component ----
const testDestDir = new Map<string, string>(); // test rel -> dest dir
for (const sf of project.getSourceFiles()) {
  const p = sf.getFilePath();
  if (!inScope(p) || !isTest(p)) continue;
  const r = rel(p);
  const compRel = path
    .join(path.dirname(r), path.basename(r).replace(/\.test\.tsx?$/, ".tsx"))
    .replace(/\\/g, "/");
  const dir = finalDir.get(compRel);
  if (!dir) continue; // component not moving -> test stays
  testDestDir.set(r, dir);
  const dest = `${dir}/${path.basename(r)}`;
  if (r !== dest) moves.push({ from: r, to: dest });
}

// ---- Pass 2b: place __tests__ helper files at the common dir of the tests importing them ----
function commonDir(dirs: string[]): string {
  if (dirs.length === 0) return "routes/-components";
  const split = dirs.map((d) => d.split("/"));
  const first = split[0];
  let i = 0;
  for (; i < first.length; i++) if (!split.every((s) => s[i] === first[i])) break;
  const common = first.slice(0, i).join("/");
  return common.endsWith("/-components") ? common : `${common || "routes"}/-components`;
}
for (const sf of project.getSourceFiles()) {
  const p = sf.getFilePath();
  if (!inScope(p) || !isTestHelper(p)) continue;
  const r = rel(p);
  const importerDirs: string[] = [];
  for (const ref of sf.getReferencingSourceFiles()) {
    const rr = rel(ref.getFilePath());
    const d = testDestDir.get(rr) ?? finalDir.get(rr);
    if (d) importerDirs.push(d);
  }
  const destDir = commonDir(importerDirs);
  const dest = `${destDir}/${path.basename(r)}`;
  if (r !== dest) moves.push({ from: r, to: dest });
}

moves.sort((a, b) => a.from.localeCompare(b.from));
writeFileSync("scripts/refactor/moves.json", JSON.stringify(moves, null, 2));
