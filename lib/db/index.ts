import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalForDb = globalThis as typeof globalThis & { fairworkPool?: Pool }

export const pool = globalForDb.fairworkPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 10_000,
})

if (process.env.NODE_ENV !== 'production') globalForDb.fairworkPool = pool

export const db = drizzle(pool, { schema })
