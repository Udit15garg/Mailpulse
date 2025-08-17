import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"
import type { Adapter } from "next-auth/adapters"

// Create a lazy adapter that only initializes the database when methods are called
function createLazyDrizzleAdapter(): Adapter {
  let adapter: ReturnType<typeof DrizzleAdapter> | null = null
  
  const getAdapter = () => {
    if (!adapter) {
      adapter = DrizzleAdapter(db())
    }
    return adapter
  }

  // Return an adapter interface that delegates to the real adapter at runtime
  return {
    createUser: (user) => getAdapter().createUser(user),
    getUser: (id) => getAdapter().getUser(id),
    getUserByEmail: (email) => getAdapter().getUserByEmail(email),
    getUserByAccount: (account) => getAdapter().getUserByAccount(account),
    updateUser: (user) => getAdapter().updateUser(user),
    deleteUser: (userId) => getAdapter().deleteUser?.(userId),
    linkAccount: (account) => getAdapter().linkAccount(account),
    unlinkAccount: (account) => getAdapter().unlinkAccount?.(account),
    createSession: (session) => getAdapter().createSession(session),
    getSessionAndUser: (sessionToken) => getAdapter().getSessionAndUser(sessionToken),
    updateSession: (session) => getAdapter().updateSession(session),
    deleteSession: (sessionToken) => getAdapter().deleteSession(sessionToken),
    createVerificationToken: (token) => getAdapter().createVerificationToken?.(token),
    useVerificationToken: (token) => getAdapter().useVerificationToken?.(token),
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: createLazyDrizzleAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        (session.user as { id?: string }).id = user.id
      }
      return session
    },
  },
})