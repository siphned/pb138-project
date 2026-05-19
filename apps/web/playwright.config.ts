import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");

export default defineConfig({
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
  webServer: [
    {
      command: `bun run --cwd "${root}" dev`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: "http://localhost:5173",
    },
  ],
  workers: process.env.CI ? 1 : undefined,
});
