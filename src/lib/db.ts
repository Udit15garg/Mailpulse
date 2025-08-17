import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

let db: ReturnType<typeof drizzle>

function getDb() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    const sql = neon(process.env.DATABASE_URL)
    db = drizzle(sql, { schema })
  }
  return db
}

export { getDb as db }