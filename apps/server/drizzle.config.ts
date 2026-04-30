import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  dbCredentials: {
    // Fix Neon SSL mode warning
    ssl: process.env.DATABASE_URL?.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : undefined,
    url: process.env.DATABASE_URL ?? "",
  },
  dialect: "postgresql",
  out: "./src/db/migrations",
  schema: "./src/db/schema/index.ts",
});
