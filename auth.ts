import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import authConfig from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          const { data: user, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", credentials.email)
            .single()

          if (error || !user || !user.password_hash) return null

          const isValid = await bcrypt.compare(credentials.password as string, user.password_hash)

          if (!isValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            image: user.avatar_url,
          }
        } catch (err) {
          console.error("[AUTH] authorize error:", err)
          return null
        }
      }
    })
  ],
  secret: process.env.AUTH_SECRET,
})
