import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"

// Simple lazy wrapper that delays database connection until runtime
function createLazyAdapter() {
  let adapter: ReturnType<typeof DrizzleAdapter> | null = null
  
  const getAdapter = () => {
    if (!adapter) {
      adapter = DrizzleAdapter(db())
    }
    return adapter
  }

  // Proxy all calls to the real adapter
  return new Proxy({}, {
    get(target, prop) {
      return (...args: unknown[]) => {
        const realAdapter = getAdapter()
        const method = (realAdapter as Record<string, unknown>)[prop]
        if (typeof method === 'function') {
          return method.apply(realAdapter, args)
        }
        return method
      }
    }
  })
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: createLazyAdapter() as ReturnType<typeof DrizzleAdapter>,
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