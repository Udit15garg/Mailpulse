import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"
import type { 
  Adapter, 
  AdapterUser, 
  AdapterAccount, 
  AdapterSession, 
  VerificationToken 
} from "next-auth/adapters"

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
    createUser: (user: Omit<AdapterUser, "id">) => getAdapter().createUser(user),
    getUser: (id: string) => getAdapter().getUser(id),
    getUserByEmail: (email: string) => getAdapter().getUserByEmail(email),
    getUserByAccount: (account: Pick<AdapterAccount, "providerAccountId" | "provider">) => getAdapter().getUserByAccount(account),
    updateUser: (user: Partial<AdapterUser> & Pick<AdapterUser, "id">) => getAdapter().updateUser(user),
    deleteUser: (userId: string) => getAdapter().deleteUser?.(userId),
    linkAccount: (account: AdapterAccount) => getAdapter().linkAccount(account),
    unlinkAccount: (account: Pick<AdapterAccount, "providerAccountId" | "provider">) => getAdapter().unlinkAccount?.(account),
    createSession: (session: { sessionToken: string; userId: string; expires: Date }) => getAdapter().createSession(session),
    getSessionAndUser: (sessionToken: string) => getAdapter().getSessionAndUser(sessionToken),
    updateSession: (session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">) => getAdapter().updateSession(session),
    deleteSession: (sessionToken: string) => getAdapter().deleteSession(sessionToken),
    createVerificationToken: (token: VerificationToken) => getAdapter().createVerificationToken?.(token),
    useVerificationToken: (params: { identifier: string; token: string }) => getAdapter().useVerificationToken?.(params),
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