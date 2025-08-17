import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const runtime = 'nodejs'

export async function POST() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    console.log("🔄 Connecting to database...")
    const sql = neon(process.env.DATABASE_URL)

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

    const result = {
      success: true,
      message: "Database setup completed successfully!",
      tables: [
        "user (NextAuth users)",
        "account (NextAuth accounts)", 
        "session (NextAuth sessions)",
        "verification_token (NextAuth verification)",
        "emails (MailPulse email tracking)",
        "open_events (MailPulse open events)"
      ],
      indexes: [
        "idx_emails_userId",
        "idx_emails_pixelToken", 
        "idx_open_events_emailId",
        "idx_account_userId",
        "idx_session_userId"
      ]
    }

    console.log("✅ Database setup completed successfully!")
    return NextResponse.json(result)
    
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Database setup failed", 
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}