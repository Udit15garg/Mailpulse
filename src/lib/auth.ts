import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const config = NextAuth({
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
        token.sub = profile.sub || account.providerAccountId
      }
      return token
    },
  },
})

export const { handlers, auth, signIn, signOut } = config