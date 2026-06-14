// apps/web/scripts/refactor/convert-routes.ts
import path from "node:path";
import { Project } from "ts-morph";

const project = new Project({ tsConfigFilePath: "tsconfig.app.json" });
const routesDir = path.resolve("src/routes");

// Only top-level files directly in src/routes/. Subdirectories are already nested.
const moves: Array<{ from: string; to: string }> = [];
for (const sf of project.getSourceFiles("src/routes/*.tsx")) {
  const dir = sf.getDirectoryPath();
  if (path.resolve(dir) !== routesDir) continue; // skip files already in subdirs
  const base = sf.getBaseNameWithoutExtension(); // e.g. "shops.$id.inventory.new"
  if (!base.includes(".")) continue; // index, cart, search, __root — leave
  const nested = `${base.split(".").join("/")}.tsx`;
  const to = path.join(routesDir, nested);
  moves.push({ from: sf.getFilePath(), to });
  sf.move(to);
}

await project.save();
console.log(`Moved ${moves.length} route files:`);
for (const m of moves) {
  console.log(`  ${path.relative(routesDir, m.from)} -> ${path.relative(routesDir, m.to)}`);
}
