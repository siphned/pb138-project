import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@repo/shared": fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url)),
    },
  },
  test: {
    coverage: {
      // Off by default: the v8 provider needs node:inspector APIs Bun's runtime
      // doesn't implement, so `vitest run` under Bun crashes if coverage starts.
      // The `test:coverage` script re-enables it via the --coverage flag.
      enabled: false,
      exclude: ["src/generated/**", "src/**/__tests__/e2e/**"],
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        branches: 68,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    environment: "happy-dom",
    exclude: ["src/**/__tests__/e2e/**", "**/*.spec.ts", "**/*.spec.tsx"],
    fileParallelism: true,
    globals: true,
    hookTimeout: 10_000,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    isolate: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    testTimeout: 15_000,
  },
});
