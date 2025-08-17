import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// Create database connection - safe for both build time and runtime
function createDb() {
  // Only connect if we have a DATABASE_URL and we're not in build mode
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production" && typeof window === "undefined") {
      // In production server-side, DATABASE_URL should exist
      throw new Error("DATABASE_URL environment variable is not set")
    }
    // For build time or missing env, return a mock that won't try to connect
    return null as ReturnType<typeof drizzle>
  }
  
  const sql = neon(process.env.DATABASE_URL)
  return drizzle(sql, { schema })
}

// Lazy singleton for runtime usage
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

// For NextAuth - create at module load but handle missing DATABASE_URL gracefully
export const authDb = createDb()