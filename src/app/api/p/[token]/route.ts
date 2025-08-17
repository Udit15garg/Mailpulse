import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emails, openEvents } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { parseUserAgent } from "@/lib/utils"
import { checkAlertRules } from "@/lib/alerts"

const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
)

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token.replace(".gif", "")
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown"
    
    const { uaFamily, device } = parseUserAgent(userAgent)

    const [email] = await db
      .select()
      .from(emails)
      .where(eq(emails.pixelToken, token))
      .limit(1)

    if (!email) {
      return new NextResponse(TRANSPARENT_GIF, {
        status: 200,
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      })
    }

    await db.insert(openEvents).values({
      emailId: email.id,
      ip,
      uaFamily,
      device,
    })

    if (email.status === "sent") {
      await db
        .update(emails)
        .set({ status: "opened" })
        .where(eq(emails.id, email.id))
    }

    await checkAlertRules(email.id)

    return new NextResponse(TRANSPARENT_GIF, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
  } catch (error) {
    console.error("Error tracking pixel:", error)
    
    return new NextResponse(TRANSPARENT_GIF, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
  }
}