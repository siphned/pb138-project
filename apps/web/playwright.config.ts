import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");

const config = defineConfig({
  expect: {
    timeout: 5_000,
  },
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: [["html"], ["json", { outputFile: "test-results/e2e-results.json" }]],
  retries: process.env.CI ? 2 : 0,
  testDir: "./src/__tests__/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5173",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: process.env.SHARD
    ? undefined
    : [
        {
          command: `bun run --cwd "${root}" dev:server`,
          reuseExistingServer: true,
          timeout: 120_000,
          url: "http://localhost:3000/swagger/json",
        },
        {
          command: `bun run --cwd "${root}" dev:web`,
          reuseExistingServer: true,
          timeout: 120_000,
          url: "http://localhost:5173",
        },
      ],
  workers: process.env.CI ? 1 : undefined,
});

// Enable test sharding via SHARD environment variable (e.g., SHARD=1/3 for shard 1 of 3)
// Usage: SHARD=1/3 bun run test:e2e
if (process.env.SHARD) {
  const [shardCurrent, shardTotal] = process.env.SHARD.split("/").map(Number);
  if (!Number.isNaN(shardCurrent) && !Number.isNaN(shardTotal)) {
    config.shard = { current: shardCurrent, total: shardTotal };
  }
}

export default config;
