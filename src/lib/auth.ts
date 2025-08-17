import GoogleProvider from "next-auth/providers/google"
import { getServerSession } from "next-auth/next"
import type { NextAuthOptions } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.sub = profile.sub || account.providerAccountId
      }
      return token
    },
  },
}

// Helper function for v4 compatibility
export const auth = () => getServerSession(authOptions)