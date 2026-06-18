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
      // Off by default: the `test:coverage` script re-enables it via --coverage.
      // Provider is istanbul (not v8): the v8 provider needs node:inspector
      // coverage APIs that Bun's runtime doesn't implement, so it crashes under Bun.
      enabled: false,
      exclude: ["src/generated/**", "src/**/__tests__/e2e/**"],
      provider: "istanbul",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        branches: 50,
        functions: 60,
        lines: 60,
        statements: 60,
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
