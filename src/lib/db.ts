import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// Safe database connection factory
function createDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  const sql = neon(process.env.DATABASE_URL)
  return drizzle(sql, { schema })
}

// Runtime-only database instance
let dbInstance: ReturnType<typeof drizzle> | null = null

export function db() {
  if (!dbInstance) {
    dbInstance = createDbConnection()
  }
  return dbInstance
}

// For NextAuth - lazy initialization to avoid build-time connection
export function getAuthDb() {
  // This function will only be called by NextAuth at runtime
  if (!process.env.DATABASE_URL) {
    // In a serverless environment, if DATABASE_URL is missing, return a placeholder
    // This should never happen in production but prevents build errors
    return null as unknown as ReturnType<typeof drizzle>
  }
  return db()
}