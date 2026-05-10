import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");

export default defineConfig({
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
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: "http://localhost:5173",
    },
  ],
  workers: undefined,
});
