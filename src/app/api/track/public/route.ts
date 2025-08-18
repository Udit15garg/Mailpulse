import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emails } from "@/lib/schema"
import { generatePixelToken, hashEmail } from "@/lib/utils"

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { subject, to, messageId } = await request.json()
    
    if (!to) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 })
    }

    const pixelToken = generatePixelToken()
    const toHash = hashEmail(to)
    
    // For public tracking, use anonymous user ID
    const [emailRecord] = await db()
      .insert(emails)
      .values({
        userId: "anonymous", // For extension users without login
        subject: subject || "No Subject",
        toHash,
        messageId,
        sentAt: new Date(),
        pixelToken,
        status: "sent",
      })
      .returning()

    const baseUrl = process.env.NEXTAUTH_URL || "https://mailpulse-mauve.vercel.app"
    const pixelUrl = `${baseUrl}/api/p/${pixelToken}.gif`

    return NextResponse.json({
      pixelUrl,
      emailId: emailRecord.id,
      token: pixelToken,
    })
  } catch (error) {
    console.error("Error creating tracking pixel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}