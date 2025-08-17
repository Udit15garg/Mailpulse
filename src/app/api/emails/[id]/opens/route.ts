import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { emails, openEvents } from "@/lib/schema"
import { eq, and, desc } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailId = parseInt(params.id)
    
    if (isNaN(emailId)) {
      return NextResponse.json({ error: "Invalid email ID" }, { status: 400 })
    }

    const email = await db
      .select()
      .from(emails)
      .where(and(eq(emails.id, emailId), eq(emails.userId, session.user.id)))
      .limit(1)

    if (email.length === 0) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    const opens = await db
      .select()
      .from(openEvents)
      .where(eq(openEvents.emailId, emailId))
      .orderBy(desc(openEvents.ts))

    return NextResponse.json({ opens })
  } catch (error) {
    console.error("Error fetching open events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}