import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import type { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres'
import type { PgDatabase } from 'drizzle-orm/pg-core'
import * as schema from './schema'

// Pool maintains reusable connections to PostgreSQL instead of opening
// a new connection for every query — faster and easier on the database.
const pool = new Pool({
  connectionString: Bun.env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })

/** Use this type to accept either the main `db` instance or a transaction `tx`. */
export type Database = PgDatabase<NodePgQueryResultHKT, typeof schema>
