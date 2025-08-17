import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// Runtime-only database instance
let dbInstance: ReturnType<typeof drizzle> | null = null

export function db() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    const sql = neon(process.env.DATABASE_URL)
    dbInstance = drizzle(sql, { schema })
  }
  return dbInstance
}

// Create a safe database instance for NextAuth that handles build-time gracefully
function createSafeAuthDb() {
  try {
    // Only attempt connection if DATABASE_URL exists
    if (process.env.DATABASE_URL) {
      return db()
    }
    // During build time when DATABASE_URL might not be available,
    // create a minimal mock that satisfies DrizzleAdapter's interface
    const mockDb = {
      select: () => ({ from: () => ({ where: () => ({ limit: () => Promise.resolve([]) }) }) }),
      insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
      update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }),
      delete: () => ({ where: () => Promise.resolve() }),
      execute: () => Promise.resolve({ rows: [] }),
      transaction: (fn: any) => fn(mockDb),
      $client: null,
    }
    return mockDb as any
  } catch (error) {
    // If there's any error during build, return the mock
    const mockDb = {
      select: () => ({ from: () => ({ where: () => ({ limit: () => Promise.resolve([]) }) }) }),
      insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
      update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }),
      delete: () => ({ where: () => Promise.resolve() }),
      execute: () => Promise.resolve({ rows: [] }),
      transaction: (fn: any) => fn(mockDb),
      $client: null,
    }
    return mockDb as any
  }
}

// For NextAuth DrizzleAdapter - safe for build time
export const authDb = createSafeAuthDb()