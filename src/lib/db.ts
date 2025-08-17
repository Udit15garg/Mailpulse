import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// Ensure DATABASE_URL is available - this should be set in Vercel environment
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set. Please configure this in your Vercel project settings.")
}

// Create database connection - this will only execute if DATABASE_URL exists
const sql = neon(process.env.DATABASE_URL)
const database = drizzle(sql, { schema })

// Singleton instance for API routes
let dbInstance: typeof database | null = null

export function db() {
  if (!dbInstance) {
    dbInstance = database
  }
  return dbInstance
}

// Direct database instance for NextAuth DrizzleAdapter
export const authDb = database