import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  // biome-ignore lint/suspicious/noConsole: database initialization
  console.warn("⚠️ DATABASE_URL is not set. Database operations will fail.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({ client: pool, schema });
