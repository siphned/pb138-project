import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "test") {
<<<<<<< HEAD
  throw new Error("DATABASE_URL is required. Set it in your .env file.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgres://localhost/test",
});

export const db = drizzle({ client: pool, schema });

export type Database =
  | typeof db
  | Extract<Parameters<Parameters<typeof db.transaction>[0]>[0], { execute: unknown }>;
=======
  // biome-ignore lint/suspicious/noConsole: database initialization
  console.warn("⚠️ DATABASE_URL is not set. Database operations will fail.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://localhost/placeholder",
});

export const db = drizzle({ client: pool, schema });
>>>>>>> origin/main
