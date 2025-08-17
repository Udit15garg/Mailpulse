"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

interface OpenEvent {
  id: number
  ts: Date
  ip: string | null
  uaFamily: string | null
  device: string | null
}

interface EmailDetailDrawerProps {
  email: Email
  open: boolean
  onClose: () => void
}

export function EmailDetailDrawer({ email, open, onClose }: EmailDetailDrawerProps) {
  const [openEvents, setOpenEvents] = useState<OpenEvent[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOpenEvents = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/emails/${email.id}/opens`)
      if (response.ok) {
        const data = await response.json()
        setOpenEvents(data.opens || [])
      }
    } catch (error) {
      console.error("Failed to fetch open events:", error)
    } finally {
      setLoading(false)
    }
  }, [email.id])

  useEffect(() => {
    if (open && email.id) {
      fetchOpenEvents()
    }
  }, [open, email.id, fetchOpenEvents])

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const maskEmail = (hash: string | null) => {
    if (!hash) return "Unknown"
    return hash.substring(0, 8) + "..."
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Email Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Subject</h3>
                <p className="text-gray-900">{email.subject || "No Subject"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Recipient</h3>
                <p className="font-mono text-sm text-gray-900">{maskEmail(email.toHash)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                  <Badge variant={email.status === "opened" ? "success" : "secondary"}>
                    {email.status === "opened" ? "Opened" : "Sent"}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Total Opens</h3>
                  <p className="text-xl font-semibold text-gray-900">{email.openCount}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Sent At</h3>
                <p className="text-gray-900">{email.sentAt ? formatDate(email.sentAt) : "—"}</p>
              </div>

              {email.lastOpened && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Last Opened</h3>
                  <p className="text-gray-900">{formatDate(email.lastOpened)}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Open Timeline</h3>
                {loading ? (
                  <p className="text-gray-500">Loading timeline...</p>
                ) : openEvents.length === 0 ? (
                  <p className="text-gray-500">No opens recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {openEvents.map((event, index) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            Email opened {index === 0 ? "(First open)" : `(Open #${index + 1})`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(event.ts)}
                          </p>
                          {(event.uaFamily || event.device) && (
                            <div className="flex gap-2 mt-2">
                              {event.uaFamily && (
                                <Badge variant="secondary" className="text-xs">
                                  {event.uaFamily}
                                </Badge>
                              )}
                              {event.device && (
                                <Badge variant="secondary" className="text-xs">
                                  {event.device}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}