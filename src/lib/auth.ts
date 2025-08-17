import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"

// Create a lazy adapter that only initializes the database when methods are called
function createLazyDrizzleAdapter() {
  let adapter: ReturnType<typeof DrizzleAdapter> | null = null
  
  const getAdapter = () => {
    if (!adapter) {
      adapter = DrizzleAdapter(db())
    }
    return adapter
  }

  // Return an adapter interface that delegates to the real adapter at runtime
  return {
    createUser: (...args: any[]) => getAdapter().createUser(...args),
    getUser: (...args: any[]) => getAdapter().getUser(...args),
    getUserByEmail: (...args: any[]) => getAdapter().getUserByEmail(...args),
    getUserByAccount: (...args: any[]) => getAdapter().getUserByAccount(...args),
    updateUser: (...args: any[]) => getAdapter().updateUser(...args),
    deleteUser: (...args: any[]) => getAdapter().deleteUser(...args),
    linkAccount: (...args: any[]) => getAdapter().linkAccount(...args),
    unlinkAccount: (...args: any[]) => getAdapter().unlinkAccount(...args),
    createSession: (...args: any[]) => getAdapter().createSession(...args),
    getSessionAndUser: (...args: any[]) => getAdapter().getSessionAndUser(...args),
    updateSession: (...args: any[]) => getAdapter().updateSession(...args),
    deleteSession: (...args: any[]) => getAdapter().deleteSession(...args),
    createVerificationToken: (...args: any[]) => getAdapter().createVerificationToken(...args),
    useVerificationToken: (...args: any[]) => getAdapter().useVerificationToken(...args),
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: createLazyDrizzleAdapter() as any,
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