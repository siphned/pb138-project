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
  retries: 0,
  testDir: "./src/__tests__/e2e",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: `bun run --cwd "${root}" dev`,
      reuseExistingServer: true,
      timeout: 120_000,
      url: "http://localhost:5173",
    },
  ],
});

export default config;
