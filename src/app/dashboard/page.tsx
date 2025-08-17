import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { emails, openEvents } from "@/lib/schema"
import { eq, desc, count } from "drizzle-orm"
import { EmailsTable } from "@/components/emails-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Force dynamic rendering for protected route
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export default async function DashboardPage() {
  let session = null
  let userEmails: Array<{
    id: number
    subject: string | null
    toHash: string | null
    sentAt: Date | null
    status: string | null
    messageId: string | null
    openCount: number
  }> = []
  let lastOpenEvents: Array<{
    emailId: number
    ts: Date | null
  }> = []

  try {
    session = await auth()

    if (!session?.user?.id) {
      redirect("/")
    }

    userEmails = await db()
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

    lastOpenEvents = await db()
      .select({
        emailId: openEvents.emailId,
        ts: openEvents.ts,
      })
      .from(openEvents)
      .innerJoin(emails, eq(emails.id, openEvents.emailId))
      .where(eq(emails.userId, session.user.id))
      .orderBy(desc(openEvents.ts))
  } catch (error) {
    console.error("Dashboard error:", error)
    // If not authenticated, redirect to home
    if (!session?.user?.id) {
      redirect("/")
    }
    // If DB error, show empty state
  }

  const emailsWithLastOpen = userEmails.map(email => ({
    ...email,
    lastOpened: lastOpenEvents
      .filter(event => event.emailId === email.id)
      .sort((a, b) => new Date(b.ts!).getTime() - new Date(a.ts!).getTime())[0]?.ts || null
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">MailPulse</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  Settings
                </Button>
              </Link>
              <span className="text-sm text-gray-600">
                {session.user.email}
              </span>
              <Link href="/api/auth/signout">
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Tracking Dashboard</h1>
          <p className="text-gray-600">Monitor your email opens and engagement analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold text-gray-900">{userEmails.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Opened Emails</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userEmails.filter(email => email.status === "opened").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userEmails.length > 0 
                    ? Math.round((userEmails.filter(email => email.status === "opened").length / userEmails.length) * 100)
                    : 0}%
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Tracked Emails</h2>
              <div className="flex gap-2">
                <a href="/api/emails/export" download>
                  <Button variant="outline" size="sm">
                    Export CSV
                  </Button>
                </a>
                <Button size="sm">
                  Track New Email
                </Button>
              </div>
            </div>
          </div>
          <EmailsTable emails={emailsWithLastOpen} />
        </div>
      </div>
    </div>
  )
}