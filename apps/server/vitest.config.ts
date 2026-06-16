import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      // Off by default: enabling coverage makes `vitest run` enforce thresholds
      // on every run. The `test:coverage` script re-enables it via --coverage.
      // Provider is istanbul (not v8): the v8 provider needs node:inspector
      // coverage APIs that Bun's runtime doesn't implement, so it crashes under Bun.
      enabled: false,
      exclude: [
        "src/**/*.test.ts",
        "src/db/migrations/**",
        "scripts/**",
        "src/__tests__/**",
        // Istanbul rewrites function bodies with coverage counters, which breaks
        // Elysia's Sucrose static analysis of this plugin's macro resolve/derive
        // functions (handlers then 500 with missing context). Skip instrumentation
        // here; the plugin is still exercised by auth.plugin.test.ts.
        "src/modules/auth/auth.plugin.ts",
      ],
      provider: "istanbul",
      reporter: ["text", "json", "html", "lcov"],
      // Calibrated for the istanbul provider, which counts branches differently
      // than v8 (the suite reports ~51.7% branches under istanbul).
      thresholds: {
        branches: 50,
        functions: 58,
        lines: 69,
        statements: 64,
      },
    },
    // Pre-bundle zod so its re-exported `z` namespace binding resolves correctly.
    // zod 3.25's root does `import * as z ...; export { z }`, and vitest's module
    // transform otherwise returns the named `z` import as undefined, crashing every
    // module that calls `z.object(...)` at top level.
    deps: { optimizer: { ssr: { enabled: true, include: ["zod"] } } },
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
