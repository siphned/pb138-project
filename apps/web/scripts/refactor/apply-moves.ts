// apps/web/scripts/refactor/apply-moves.ts
// Single-phase moves ordered topologically: if move A's destination is currently
// occupied by move B's source, B is applied first (vacate-before-occupy). This avoids
// ts-morph "file already exists" errors without doubling the (expensive) move count.
import { readFileSync } from "node:fs";
import path from "node:path";
import { makeProject } from "./lib";

const filter = process.argv[2] ?? "";
const project = makeProject();
const moves: Array<{ from: string; to: string }> = JSON.parse(
  readFileSync("scripts/refactor/moves.json", "utf8")
);
const planned = moves.filter((m) => !filter || m.from.startsWith(filter));

const byFrom = new Map(planned.map((m) => [m.from, m]));
const state = new Map<string, 0 | 1 | 2>(); // 0 unvisited, 1 in-progress, 2 done
const order: Array<{ from: string; to: string }> = [];
function visit(m: { from: string; to: string }) {
  const s = state.get(m.from) ?? 0;
  if (s === 2) return;
  if (s === 1) throw new Error(`move cycle involving ${m.from} -> ${m.to}`);
  state.set(m.from, 1);
  const occupant = byFrom.get(m.to); // a move whose source is m's destination
  if (occupant && occupant.from !== m.from) visit(occupant);
  state.set(m.from, 2);
  order.push(m);
}
for (const m of planned) visit(m);

let n = 0;
for (const m of order) {
  const sf = project.getSourceFile(path.resolve("src", m.from));
  if (!sf) {
    console.warn(`skip (already moved?): ${m.from}`);
    continue;
  }
  sf.move(path.resolve("src", m.to));
  n++;
}
await project.save();
console.log(`Applied ${n} moves${filter ? ` (filter: ${filter})` : ""}`);
