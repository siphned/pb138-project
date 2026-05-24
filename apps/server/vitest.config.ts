import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: ["src/**/*.test.ts", "src/db/migrations/**", "scripts/**", "src/__tests__/**"],
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    environment: "node",
    fileParallelism: false,
    globals: true,
    hookTimeout: 15_000,
    isolate: true,
    server: {
      deps: {
        inline: ["@vitest/spy"],
      },
    },
    setupFiles: ["./src/__tests__/setup.ts"],
    testTimeout: 30_000,
  },
});
