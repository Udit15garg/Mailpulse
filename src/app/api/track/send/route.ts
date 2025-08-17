import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { emails } from "@/lib/schema"
import { generatePixelToken, hashEmail } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, to, messageId } = await request.json()
    
    if (!to) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 })
    }

    const pixelToken = generatePixelToken()
    const toHash = hashEmail(to)
    
    const [emailRecord] = await db
      .insert(emails)
      .values({
        userId: session.user.id,
        subject: subject || "No Subject",
        toHash,
        messageId,
        sentAt: new Date(),
        pixelToken,
        status: "sent",
      })
      .returning()

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
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