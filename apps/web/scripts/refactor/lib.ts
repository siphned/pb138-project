// apps/web/scripts/refactor/lib.ts
// Shared helpers for the colocation codemods. The app tsconfig excludes test files,
// so we must explicitly add them to the ts-morph project, otherwise their imports are
// never rewritten on move and they get orphaned.
import path from "node:path";
import { Project } from "ts-morph";

export function makeProject(): Project {
  const project = new Project({ tsConfigFilePath: "tsconfig.app.json" });
  project.addSourceFilesAtPaths([
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/__tests__/**/*.ts",
    "src/**/__tests__/**/*.tsx",
  ]);
  return project;
}

export const SRC = path.resolve("src").replace(/\\/g, "/");
export const rel = (p: string) => path.relative(SRC, p.replace(/\\/g, "/")).replace(/\\/g, "/");

export const IN_SCOPE = [
  "components/catalog",
  "components/shops",
  "components/events",
  "components/dashboard",
  "components/forms",
  "components/home",
  "components/reviews",
  "components/settings",
  "components/stats",
  "components/dev",
  "routes/-components",
];
export const inScope = (p: string) => IN_SCOPE.some((d) => rel(p).startsWith(`${d}/`));

export const isTest = (p: string) => /\.test\.tsx?$/.test(p);
export const isTestHelper = (p: string) => rel(p).includes("/__tests__/") && !isTest(p);

// A "route file" = under routes/, not inside any "-" prefixed segment (TanStack ignores those).
export const isRouteFile = (p: string) => {
  const r = rel(p);
  if (!r.startsWith("routes/")) return false;
  return !r.split("/").some((seg) => seg.startsWith("-"));
};
