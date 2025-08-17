import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sendSlackNotification, sendSlackAlert } from "@/lib/slack"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, message, type = "notification", color = "good" } = await request.json()
    
    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    let success = false
    
    if (type === "alert") {
      success = await sendSlackAlert(title, message)
    } else {
      success = await sendSlackNotification(title, message, color)
    }

    if (success) {
      return NextResponse.json({ success: true, message: "Notification sent successfully" })
    } else {
      return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error sending Slack notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}