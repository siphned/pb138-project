import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");

const config = defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: "html",
  retries: process.env.CI ? 2 : 0,
  testDir: "./src/__tests__/e2e",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: `bun run --cwd "${root}" dev`,
      reuseExistingServer: !!process.env.CI,
      timeout: 120_000,
      url: "http://localhost:5173",
    },
  ],
  workers: process.env.CI ? 1 : undefined,
});

// Enable test sharding via SHARD environment variable (e.g., SHARD=1/3 for shard 1 of 3)
if (process.env.SHARD) {
  const [shardIndex, shardTotal] = process.env.SHARD.split("/").map(Number);
  if (!Number.isNaN(shardIndex) && !Number.isNaN(shardTotal)) {
    config.shard = { index: shardIndex, total: shardTotal };
  }
}

export default config;
