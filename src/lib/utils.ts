import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatePixelToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase()).digest("hex")
}

export function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()
  
  let uaFamily = "Unknown"
  let device = "Desktop"
  
  if (ua.includes("chrome")) uaFamily = "Chrome"
  else if (ua.includes("firefox")) uaFamily = "Firefox"
  else if (ua.includes("safari")) uaFamily = "Safari"
  else if (ua.includes("edge")) uaFamily = "Edge"
  
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    device = "Mobile"
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    device = "Tablet"
  }
  
  return { uaFamily, device }
}