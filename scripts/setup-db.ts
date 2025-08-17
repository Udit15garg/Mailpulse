#!/usr/bin/env tsx

import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { migrate } from "drizzle-orm/neon-http/migrator"

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  console.log("🔄 Connecting to database...")
  const sql = neon(databaseUrl)
  const db = drizzle(sql)

  try {
    console.log("🔄 Creating tables...")
    
    // Create NextAuth tables
    await sql`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text,
        "email" text,
        "image" text,
        "emailVerified" timestamp
      )
    `
    
    await sql`
      CREATE TABLE IF NOT EXISTS "account" (
        "userId" text NOT NULL,
        "type" text NOT NULL,
        "provider" text NOT NULL,
        "providerAccountId" text NOT NULL,
        "refresh_token" text,
        "access_token" text,
        "expires_at" integer,
        "token_type" text,
        "scope" text,
        "id_token" text,
        "session_state" text,
        PRIMARY KEY ("provider", "providerAccountId"),
        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `
    
    await sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sessionToken" text PRIMARY KEY NOT NULL,
        "userId" text NOT NULL,
        "expires" timestamp NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `
    
    await sql`
      CREATE TABLE IF NOT EXISTS "verification_token" (
        "identifier" text NOT NULL,
        "token" text NOT NULL,
        "expires" timestamp NOT NULL,
        PRIMARY KEY ("identifier", "token")
      )
    `

    // Create MailPulse tables
    await sql`
      CREATE TABLE IF NOT EXISTS "emails" (
        "id" serial PRIMARY KEY NOT NULL,
        "userId" text NOT NULL,
        "subject" text,
        "toHash" text,
        "sentAt" timestamp DEFAULT now(),
        "messageId" text,
        "pixelToken" text UNIQUE,
        "status" text DEFAULT 'sent',
        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `
    
    await sql`
      CREATE TABLE IF NOT EXISTS "open_events" (
        "id" serial PRIMARY KEY NOT NULL,
        "emailId" integer NOT NULL,
        "ts" timestamp DEFAULT now(),
        "ip" text,
        "uaFamily" text,
        "device" text,
        FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE CASCADE
      )
    `

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS "idx_emails_userId" ON "emails"("userId")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_emails_pixelToken" ON "emails"("pixelToken")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_open_events_emailId" ON "open_events"("emailId")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_account_userId" ON "account"("userId")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_session_userId" ON "session"("userId")`

    console.log("✅ Database setup completed successfully!")
    console.log("📊 Tables created:")
    console.log("   - user (NextAuth users)")
    console.log("   - account (NextAuth accounts)")
    console.log("   - session (NextAuth sessions)")
    console.log("   - verification_token (NextAuth verification)")
    console.log("   - emails (MailPulse email tracking)")
    console.log("   - open_events (MailPulse open events)")
    console.log("🔍 Indexes created for optimal performance")
    
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()