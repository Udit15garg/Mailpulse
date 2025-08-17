import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">MailPulse Settings</span>
            </div>
            <div className="flex items-center gap-4">
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your tracking preferences and privacy controls</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Slack Notifications</h2>
              <p className="text-sm text-gray-600 mt-1">Configure when you receive Slack alerts</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">First Open Alerts</h3>
                  <p className="text-sm text-gray-600">Get notified when an email is opened for the first time</p>
                </div>
                <Badge variant="success">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Multiple Opens</h3>
                  <p className="text-sm text-gray-600">Alert when an email is opened 5+ times in 10 minutes</p>
                </div>
                <Badge variant="success">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Bot Detection</h3>
                  <p className="text-sm text-gray-600">Filter out potential bot activity (Coming in V2)</p>
                </div>
                <Badge variant="secondary">V2 Feature</Badge>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Privacy Controls</h2>
              <p className="text-sm text-gray-600 mt-1">Manage privacy settings and data handling</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Recipient Anonymization</h3>
                  <p className="text-sm text-gray-600">Email addresses are hashed and masked in the dashboard</p>
                </div>
                <Badge variant="success">Always On</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Do Not Track Domains</h3>
                  <p className="text-sm text-gray-600">Exclude specific domains from tracking (Coming in V2)</p>
                </div>
                <Badge variant="secondary">V2 Feature</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Forward Detection</h3>
                  <p className="text-sm text-gray-600">Detect when emails are forwarded (Coming in V2)</p>
                </div>
                <Badge variant="secondary">V2 Feature</Badge>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Chrome Extension</h2>
              <p className="text-sm text-gray-600 mt-1">Gmail integration settings</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Gmail Integration</h3>
                  <p className="text-sm text-gray-600">Add tracking toggle to Gmail compose window</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Auto-Label</h3>
                  <p className="text-sm text-gray-600">Automatically apply "Tracked" label to sent emails</p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Status Indicators</h3>
                  <p className="text-sm text-gray-600">Show tracking status in Sent folder</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Account</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your account and data</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Connected Account</h3>
                  <p className="text-sm text-gray-600">{session.user.email}</p>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Data Export</h3>
                  <p className="text-sm text-gray-600">Download all your tracking data as CSV</p>
                </div>
                <a href="/api/emails/export" download>
                  <Button variant="outline" size="sm">
                    Export Data
                  </Button>
                </a>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">Privacy Notice</h3>
                <p className="text-sm text-blue-800">
                  MailPulse is designed with privacy in mind. We only track opens when you explicitly enable tracking, 
                  recipient emails are hashed for anonymization, and you have full control over your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}