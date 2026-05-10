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
    // happy-dom is ~30% faster than jsdom but lacks full layout API
    // (getBoundingClientRect, scroll, canvas). Revert to jsdom if tests
    // relying on those APIs start failing.
    environment: "happy-dom",
    exclude: ["src/__tests__/e2e/**"],
    fileParallelism: true,
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    isolate: true,
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
