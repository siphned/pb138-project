import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: false,
      exclude: ["src/**/*.test.ts", "src/db/migrations/**", "scripts/**"],
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50,
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
    testTimeout: 30_000,
  },
});
