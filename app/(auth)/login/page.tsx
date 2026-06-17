"use client"

import { useState, useRef, useEffect } from "react"
import { loginAction, verify2FAAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { LogIn, Mail, Lock, Loader2, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 2FA state
  const [needs2FA, setNeeds2FA] = useState(false)
  const [savedEmail, setSavedEmail] = useState("")
  const [savedPassword, setSavedPassword] = useState("")
  const [totpCode, setTotpCode] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-focus first TOTP input when 2FA screen appears
  useEffect(() => {
    if (needs2FA) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [needs2FA])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await loginAction(formData)
      if (result?.requires2FA) {
        // Save credentials for the 2FA verification step
        setSavedEmail(email)
        setSavedPassword(password)
        setNeeds2FA(true)
        setLoading(false)
        return
      }
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch (err) {
      // Redirects are handled by throwing an error in Next.js
    }
  }

  async function handleVerify2FA() {
    const code = totpCode.join("")
    if (code.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await verify2FAAction(savedEmail, savedPassword, code)
      if (result?.error) {
        setError(result.error)
        setTotpCode(["", "", "", "", "", ""])
        setTimeout(() => inputRefs.current[0]?.focus(), 50)
        setLoading(false)
      }
    } catch (err) {
      // Redirect throw from signIn
    }
  }

  // Handle individual digit input
  function handleTotpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return // only digits

    const newCode = [...totpCode]
    newCode[index] = value.slice(-1) // only last char
    setTotpCode(newCode)

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5 && newCode.every(d => d)) {
      setTimeout(() => handleVerify2FA(), 100)
    }
  }

  function handleTotpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !totpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "Enter") {
      handleVerify2FA()
    }
  }

  function handleTotpPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      const newCode = pasted.split("")
      setTotpCode(newCode)
      inputRefs.current[5]?.focus()
      // Auto-submit
      setTimeout(() => {
        const code = newCode.join("")
        if (code.length === 6) handleVerify2FA()
      }, 200)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <Card glass className="w-full max-w-md p-8 md:p-10 relative z-10 border-white/10 shadow-2xl">
        
        {/* ─── 2FA CHALLENGE SCREEN ─── */}
        {needs2FA ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="h-16 w-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6 rotate-[-3deg]">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic mb-2">2FA Verify</h1>
              <p className="text-muted-foreground text-sm font-medium tracking-tight">
                Enter the 6-digit code from your<br />Google Authenticator app
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center mb-6 animate-shake">
                {error}
              </div>
            )}

            {/* 6-digit code input */}
            <div className="flex justify-center gap-3 mb-8" onPaste={handleTotpPaste}>
              {totpCode.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleTotpChange(i, e.target.value)}
                  onKeyDown={(e) => handleTotpKeyDown(i, e)}
                  className="w-12 h-14 bg-white/5 border border-white/10 rounded-2xl text-center text-xl font-black focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all text-foreground"
                />
              ))}
            </div>

            <Button
              onClick={handleVerify2FA}
              disabled={loading || totpCode.some(d => !d)}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 group mb-4"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Verify & Sign In <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            <button
              onClick={() => { setNeeds2FA(false); setError(null); setTotpCode(["", "", "", "", "", ""]); }}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Login
            </button>
          </div>
        ) : (

          /* ─── NORMAL LOGIN SCREEN ─── */
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-6 rotate-[-3deg]">
                <span className="text-3xl font-black text-primary-foreground">S</span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic mb-2">Welcome Back</h1>
              <p className="text-muted-foreground text-sm font-medium tracking-tight">Enter your credentials to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-4">
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
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              <Button 
                disabled={loading}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 group"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline underline-offset-4">
                  Register Now
                </Link>
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
