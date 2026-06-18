import path from "node:path";
import { fileURLToPath } from "node:url";
import { clerkSetup } from "@clerk/testing/playwright";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");

// Load server env vars (contains CLERK_SECRET_KEY) if not already set
if (!process.env.CLERK_SECRET_KEY) {
  try {
    const { readFileSync } = await import("node:fs");
    const envPath = path.join(root, "apps", "server", ".env.local");
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?$/);
      if (match) {
        process.env[match[1]] = match[2];
      }
    }
  } catch {
    // .env.local not found, rely on environment variables being set externally
  }
}

export default async function globalSetup() {
  await clerkSetup({
    publishableKey:
      process.env.VITE_CLERK_PUBLISHABLE_KEY ??
      "pk_test_d29uZHJvdXMtaGVyb24tMjkuY2xlcmsuYWNjb3VudHMuZGV2JA",
  });
}
