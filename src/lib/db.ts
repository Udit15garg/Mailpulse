import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// Database instance that gets created only when needed at runtime
let dbInstance: ReturnType<typeof drizzle> | null = null

export function db() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set. Please configure this in your Vercel project settings.")
    }
    const sql = neon(process.env.DATABASE_URL)
    dbInstance = drizzle(sql, { schema })
  }
  return dbInstance
}

// For NextAuth DrizzleAdapter - use a getter function that creates the instance only when called
export function getAuthDb() {
  return db()
}