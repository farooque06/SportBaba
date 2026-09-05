"use client"

import { useState, useMemo, Suspense } from "react"
import { registerAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { 
  User, Mail, Lock, Loader2, ArrowRight, ShieldCheck, CalendarCheck,
  Phone, MapPin, Trophy, ChevronLeft, CheckCircle2, Eye, EyeOff, Cake
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { sanitizeNumericInput, getPasswordStrength } from "@/lib/utils"

function RegisterFormContent() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [accountType, setAccountType] = useState<"player" | "facility">("player")
  const [step, setStep] = useState<1 | 2>(1)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || ""

  // Step 1 fields
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Step 2 fields (optional but validated)
  const [phone, setPhone] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [preferredSport, setPreferredSport] = useState("")
  const [city, setCity] = useState("")

  // Inline field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

  const passwordStrengthLabel: Record<string, { label: string; color: string }> = {
    weak: { label: "Weak", color: "text-red-500" },
    fair: { label: "Fair", color: "text-amber-500" },
    strong: { label: "Strong", color: "text-emerald-500" },
  }

  const sports = [
    { value: 'football', label: '⚽ Football', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
    { value: 'cricket', label: '🏏 Cricket', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
    { value: 'basketball', label: '🏀 Basketball', color: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
    { value: 'badminton', label: '🏸 Badminton', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  ]

  // Max DOB: 13 years ago
  const maxDob = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 13)
    return d.toISOString().split('T')[0]
  }, [])

  // Validate Step 1 fields
  const validateStep1 = () => {
    const errors: Record<string, string> = {}
    const trimmedName = fullName.trim()
    if (!trimmedName) {
      errors.fullName = "Name is required"
    } else if (trimmedName.length < 2) {
      errors.fullName = "Name must be at least 2 characters"
    } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
      errors.fullName = "Name must contain only letters and spaces"
    }

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Enter a valid email address"
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validate Step 2 fields (all optional, but validated if filled)
  const validateStep2 = () => {
    const errors: Record<string, string> = {}
    if (phone && !/^\d{10}$/.test(phone)) {
      errors.phone = "Phone must be exactly 10 digits"
    }
    if (city && (city.trim().length < 2 || !/^[a-zA-Z\s.'-]+$/.test(city.trim()))) {
      errors.city = "City must contain only letters (min 2 chars)"
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2)
      setError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!validateStep2()) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set("fullName", fullName.trim())
    formData.set("email", email.trim().toLowerCase())
    formData.set("password", password)
    formData.set("accountType", accountType)
    if (callbackUrl) formData.set("callbackUrl", callbackUrl)
    
    // Optional fields
    if (phone) formData.set("phone", phone)
    if (dateOfBirth) formData.set("dateOfBirth", dateOfBirth)
    if (preferredSport) formData.set("preferredSport", preferredSport)
    if (city) formData.set("city", city.trim())

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
    <Card glass className="w-full max-w-lg p-8 md:p-12 relative z-10 border-white/10 shadow-2xl">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="flex items-center gap-2">
          <div className={`step-dot ${step === 1 ? 'active' : 'completed'}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            Account
          </span>
        </div>
        <div className="w-8 h-px bg-border" />
        <div className="flex items-center gap-2">
          <div className={`step-dot ${step === 2 ? 'active' : 'inactive'}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            Profile
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 ${
          step === 1 
            ? 'bg-primary/20 border border-primary/30' 
            : 'bg-emerald-500/20 border border-emerald-500/30'
        }`}>
          {step === 1 ? (
            <ShieldCheck className="h-8 w-8 text-primary" />
          ) : (
            <User className="h-8 w-8 text-emerald-400" />
          )}
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic mb-2">
          {step === 1 ? "Create Account" : "Your Profile"}
        </h1>
        <p className="text-muted-foreground text-sm font-medium tracking-tight">
          {step === 1 
            ? (accountType === "player" 
              ? "Join open games, track stats, and book turfs instantly" 
              : "Complete software for turf and sports facility operations")
            : "Add your details to personalize your experience (optional)"
          }
        </p>
      </div>

      {callbackUrl && step === 1 && (
        <div className="mb-6 p-3 rounded-2xl bg-primary/10 border border-primary/25 flex items-center gap-2.5 text-xs text-primary font-bold">
          <CalendarCheck className="h-4 w-4 shrink-0" />
          <span>Creating your account will return you directly to your booking</span>
        </div>
      )}

      {/* ═══════════════ STEP 1: ACCOUNT DETAILS ═══════════════ */}
      {step === 1 && (
        <div className="animate-slide-up">
          {/* Account Type Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setAccountType("player")}
              className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                accountType === "player"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Player
            </button>
            <button
              type="button"
              onClick={() => setAccountType("facility")}
              className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                accountType === "facility"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Facility Owner
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-shake mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name */}
            <div className="input-group">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    const filtered = e.target.value.replace(/[^a-zA-Z\s.'-]/g, "")
                    setFullName(filtered)
                    if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: "" }))
                  }}
                  placeholder={accountType === "player" ? "Full Name *" : "Business / Facility Name *"}
                  maxLength={80}
                  className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 ${
                    fieldErrors.fullName ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-[11px] text-red-500 font-semibold mt-1.5 ml-1 animate-slide-up">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="input-group">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: "" }))
                  }}
                  placeholder="Email Address *"
                  maxLength={254}
                  className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 ${
                    fieldErrors.email ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-500 font-semibold mt-1.5 ml-1 animate-slide-up">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="input-group">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: "" }))
                  }}
                  placeholder="Choose Password *"
                  maxLength={128}
                  className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-12 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 ${
                    fieldErrors.password ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-500 font-semibold mt-1.5 ml-1 animate-slide-up">{fieldErrors.password}</p>
              )}
              {/* Password Strength Bar */}
              {password && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="password-strength-bar" data-strength={passwordStrength} />
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${passwordStrengthLabel[passwordStrength].color}`}>
                    {passwordStrengthLabel[passwordStrength].label} Password
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleNextStep}
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 group mt-6"
          >
            <span className="flex items-center gap-2">
              Continue <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
      )}

      {/* ═══════════════ STEP 2: PROFILE DETAILS ═══════════════ */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="animate-slide-up">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-shake mb-4">
              {error}
            </div>
          )}

          {/* Confirmed account summary */}
          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 mb-6 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{fullName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{email}</p>
            </div>
            <button
              type="button"
              onClick={() => { setStep(1); setError(null) }}
              className="text-[10px] text-primary font-bold uppercase tracking-wider ml-auto shrink-0 hover:underline"
            >
              Edit
            </button>
          </div>

          <p className="text-xs text-muted-foreground font-medium mb-5 text-center">
            These fields are <span className="text-primary font-bold">optional</span> — skip to finish or add them now.
          </p>

          <div className="space-y-4">
            {/* Phone */}
            <div className="input-group">
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    setPhone(sanitizeNumericInput(e.target.value, 10))
                    if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: "" }))
                  }}
                  placeholder="Phone Number (10 digits)"
                  className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 ${
                    fieldErrors.phone ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-[11px] text-red-500 font-semibold mt-1.5 ml-1 animate-slide-up">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="input-group">
              <div className="relative group">
                <Cake className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="date"
                  value={dateOfBirth}
                  max={maxDob}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all text-muted-foreground focus:text-foreground"
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1 ml-1">Must be at least 13 years old</p>
            </div>

            {/* Preferred Sport */}
            {accountType === "player" && (
              <div className="input-group">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">
                  Preferred Sport
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sports.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setPreferredSport(preferredSport === s.value ? "" : s.value)}
                      className={`h-11 rounded-xl border text-xs font-bold transition-all ${
                        preferredSport === s.value
                          ? s.color + ' ring-2 ring-primary/20 shadow-xs'
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/8'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* City */}
            <div className="input-group">
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => {
                    const filtered = e.target.value.replace(/[^a-zA-Z\s.'-]/g, "")
                    setCity(filtered)
                    if (fieldErrors.city) setFieldErrors(prev => ({ ...prev, city: "" }))
                  }}
                  placeholder="Your City / Location"
                  maxLength={100}
                  className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 ${
                    fieldErrors.city ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
              </div>
              {fieldErrors.city && (
                <p className="text-[11px] text-red-500 font-semibold mt-1.5 ml-1 animate-slide-up">{fieldErrors.city}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => { setStep(1); setError(null) }}
              className="h-14 px-4 rounded-2xl border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <Button 
              disabled={loading}
              className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 group"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Start Your Journey <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8 text-center border-t border-white/5 pt-8">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Already have an account?{" "}
          <Link 
            href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"} 
            className="text-primary hover:underline underline-offset-4"
          >
            Sign In
          </Link>
        </p>
      </div>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px]" />

      <Suspense fallback={
        <Card glass className="w-full max-w-lg p-12 relative z-10 border-white/10 shadow-2xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </Card>
      }>
        <RegisterFormContent />
      </Suspense>
    </div>
  )
}
