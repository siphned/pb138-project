import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: ["src/**/*.test.ts", "src/db/migrations/**", "scripts/**", "src/__tests__/**"],
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        branches: 50,
        functions: 55,
        lines: 63,
        statements: 63,
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
