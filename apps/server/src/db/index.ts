import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "test") {
  throw new Error("DATABASE_URL is required. Set it in your .env file.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgres://localhost/test",
});

export const db = drizzle({ client: pool, schema });
