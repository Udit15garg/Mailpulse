import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { emails, openEvents } from "@/lib/schema"
import { eq, desc, count } from "drizzle-orm"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmails = await db
      .select({
        id: emails.id,
        subject: emails.subject,
        toHash: emails.toHash,
        sentAt: emails.sentAt,
        status: emails.status,
        messageId: emails.messageId,
        openCount: count(openEvents.id),
      })
      .from(emails)
      .leftJoin(openEvents, eq(emails.id, openEvents.emailId))
      .where(eq(emails.userId, session.user.id))
      .groupBy(emails.id)
      .orderBy(desc(emails.sentAt))

    const lastOpenEvents = await db
      .select({
        emailId: openEvents.emailId,
        ts: openEvents.ts,
      })
      .from(openEvents)
      .innerJoin(emails, eq(emails.id, openEvents.emailId))
      .where(eq(emails.userId, session.user.id))
      .orderBy(desc(openEvents.ts))

    const emailsWithLastOpen = userEmails.map(email => ({
      ...email,
      lastOpened: lastOpenEvents
        .filter(event => event.emailId === email.id)
        .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())[0]?.ts || null
    }))

    const csvHeaders = [
      "Subject",
      "Recipient Hash",
      "Status", 
      "Opens",
      "Sent At",
      "Last Opened",
      "Message ID"
    ]

    const csvRows = emailsWithLastOpen.map(email => [
      `"${(email.subject || "No Subject").replace(/"/g, '""')}"`,
      email.toHash || "",
      email.status || "sent",
      email.openCount.toString(),
      email.sentAt ? new Date(email.sentAt).toISOString() : "",
      email.lastOpened ? new Date(email.lastOpened).toISOString() : "",
      email.messageId || ""
    ])

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map(row => row.join(","))
    ].join("\n")

    const filename = `mailpulse-export-${new Date().toISOString().split('T')[0]}.csv`

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting emails:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}