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
      exclude: ["src/gen/**"],
    },
    environment: "happy-dom",
    exclude: ["src/__tests__/e2e/**"],
    fileParallelism: true,
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    isolate: true,
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
