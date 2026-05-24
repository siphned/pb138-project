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
<<<<<<< HEAD
    coverage: {
      enabled: true,
      exclude: ["src/gen/**", "src/**/__tests__/e2e/**"],
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        branches: 70,
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
=======
    environment: "jsdom",
    exclude: ["src/__tests__/e2e/**"],
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/__tests__/setup.ts"],
>>>>>>> origin/main
  },
});
