"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmailDetailDrawer } from "./email-detail-drawer"

interface Email {
  id: number
  subject: string | null
  toHash: string | null
  sentAt: Date | null
  status: string | null
  messageId: string | null
  openCount: number
  lastOpened: Date | null
}

interface EmailsTableProps {
  emails: Email[]
}

export function EmailsTable({ emails }: EmailsTableProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)

  const formatDate = (date: Date | null) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const maskEmail = (hash: string | null) => {
    if (!hash) return "—"
    return hash.substring(0, 8) + "..."
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Opens</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Last Opened</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No tracked emails yet. Start tracking your first email!
              </TableCell>
            </TableRow>
          ) : (
            emails.map((email) => (
              <TableRow
                key={email.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedEmail(email)}
              >
                <TableCell className="font-medium">
                  {email.subject || "No Subject"}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {maskEmail(email.toHash)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={email.status === "opened" ? "success" : "secondary"}
                  >
                    {email.status === "opened" ? "Opened" : "Sent"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-lg font-semibold">
                    {email.openCount}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600">
                  {formatDate(email.sentAt)}
                </TableCell>
                <TableCell className="text-gray-600">
                  {formatDate(email.lastOpened)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedEmail && (
        <EmailDetailDrawer
          email={selectedEmail}
          open={!!selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </>
  )
}