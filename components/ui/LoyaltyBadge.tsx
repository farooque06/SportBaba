"use client"

import { Star, Shield, Trophy } from "lucide-react"

interface LoyaltyBadgeProps {
  visits: number
  className?: string
}

export function LoyaltyBadge({ visits, className = "" }: LoyaltyBadgeProps) {
  if (visits === 0) return null

  let config = {
    label: "Bronze",
    icon: Star,
    styles: "bg-amber-500/10 text-amber-600 border-amber-500/20"
  }

  if (visits > 15) {
    config = {
      label: "Gold",
      icon: Trophy,
      styles: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 shadow-sm shadow-yellow-500/10"
    }
  } else if (visits > 5) {
    config = {
      label: "Silver",
      icon: Shield,
      styles: "bg-slate-500/10 text-slate-600 border-slate-500/20"
    }
  }

  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${config.styles} ${className}`}>
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </div>
  )
}
