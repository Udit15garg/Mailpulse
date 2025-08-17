import { db } from "./db"
import { emails, openEvents } from "./schema"
import { eq, and, gte } from "drizzle-orm"
import { sendSlackAlert, sendSlackNotification } from "./slack"

interface AlertRule {
  type: "first_open" | "multiple_opens"
  threshold?: number
  timeWindow?: number // minutes
  enabled: boolean
}

const DEFAULT_ALERT_RULES: AlertRule[] = [
  { type: "first_open", enabled: true },
  { type: "multiple_opens", threshold: 5, timeWindow: 10, enabled: true },
]

export async function checkAlertRules(emailId: number) {
  try {
    const email = await db()
      .select()
      .from(emails)
      .where(eq(emails.id, emailId))
      .limit(1)
      .then(rows => rows[0])

    if (!email) return

    const openCount = await db()
      .select()
      .from(openEvents)
      .where(eq(openEvents.emailId, emailId))

    const rules = DEFAULT_ALERT_RULES

    for (const rule of rules) {
      if (!rule.enabled) continue

      if (rule.type === "first_open" && openCount.length === 1) {
        await sendSlackNotification(
          "🎯 First Email Open",
          `Your email "${email.subject}" was just opened for the first time!`,
          "good"
        )
      }

      if (rule.type === "multiple_opens" && rule.threshold && rule.timeWindow) {
        const timeThreshold = new Date(Date.now() - rule.timeWindow * 60 * 1000)
        
        const recentOpens = await db()
          .select()
          .from(openEvents)
          .where(
            and(
              eq(openEvents.emailId, emailId),
              gte(openEvents.ts, timeThreshold)
            )
          )

        if (recentOpens.length >= rule.threshold) {
          await sendSlackAlert(
            "🔥 High Email Activity",
            `Your email "${email.subject}" has been opened ${recentOpens.length} times in the last ${rule.timeWindow} minutes!`,
            [
              { title: "Opens", value: recentOpens.length.toString(), short: true },
              { title: "Time Window", value: `${rule.timeWindow} minutes`, short: true },
            ]
          )
        }
      }
    }
  } catch (error) {
    console.error("Error checking alert rules:", error)
  }
}

export async function getAlertSettings() {
  return DEFAULT_ALERT_RULES
}

export async function updateAlertSettings(rules: AlertRule[]) {
  return rules
}