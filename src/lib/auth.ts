import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
// import { DrizzleAdapter } from "@auth/drizzle-adapter"
// import { getAuthDb } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Temporarily disable DrizzleAdapter to fix build issues
  // adapter: DrizzleAdapter(getAuthDb()),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub
      }
      return session
    },
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.sub = profile.id || account.providerAccountId
      }
      return token
    },
  },
})