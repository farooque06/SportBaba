"use client"

import { useState } from "react"
import { registerAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { User, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    try {
        const result = await registerAction(formData)
        if (result?.error) {
          setError(result.error)
          setLoading(false)
        }
    } catch (err) {
        // Redirects are handled by Next.js
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2" />

      <Card glass className="w-full max-w-lg p-8 md:p-12 relative z-10 border-white/10 shadow-2xl">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-14 w-14 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic mb-2">Create Account</h1>
          <p className="text-muted-foreground text-sm font-medium tracking-tight">Join the elite platform for sports facility management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                name="fullName"
                type="text"
                placeholder="Full Name"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30"
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                minLength={8}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30"
              />
            </div>
          </div>

          <Button 
            disabled={loading}
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 group mt-4"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Start Your Journey <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-8">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
