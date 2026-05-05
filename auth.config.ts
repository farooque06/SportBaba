import type { NextAuthConfig } from "next-auth"

/**
 * Edge-compatible Auth.js configuration.
 * This file MUST NOT import any Node.js-only modules (like bcryptjs, supabase, etc.)
 * so it can be safely used in middleware (Edge runtime).
 */
export default {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  trustHost: true,
} satisfies NextAuthConfig
