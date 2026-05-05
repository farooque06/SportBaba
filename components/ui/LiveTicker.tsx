"use client"

import { useEffect, useState } from "react"
import { Trophy, TrendingUp, Zap, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

const MOCK_UPDATES = [
  { type: "LIVE", label: "ICC Men's Ranking", val: "IND (1) • AUS (2) • ENG (3)", icon: Trophy },
  { type: "MATCH", label: "IND vs AUS", val: "IND 245/4 (42.1) • Target 278", icon: Radio },
  { type: "UPCOMING", label: "Premier League", val: "MCI vs ARS • Starting in 2h", icon: Zap },
  { type: "TRENDING", label: "SportBaba Growth", val: "+24% Efficiency in Elite Venues", icon: TrendingUp },
  { type: "LIVE", label: "ICC Women's Ranking", val: "AUS (1) • ENG (2) • IND (3)", icon: Trophy },
  { type: "NEWS", label: "Facility Update", val: "12 New Cricket Nets Online in London", icon: Zap },
]

export function LiveTicker() {
  return (
    <div className="w-full bg-background/80 backdrop-blur-xl border-y border-border/50 overflow-hidden group py-3 relative">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex whitespace-nowrap animate-marquee hover:pause-marquee">
        {/* Render twice for continuous loop */}
        {[...MOCK_UPDATES, ...MOCK_UPDATES].map((update, i) => (
          <div key={i} className="flex items-center gap-6 px-8 border-r border-border/50 last:border-0 group/item">
            <div className={cn(
               "flex items-center gap-2 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md",
               update.type === 'LIVE' ? "bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : 
               update.type === 'MATCH' ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(34,197,94,0.2)]" :
               "bg-muted/50 text-muted-foreground"
            )}>
              {update.type === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>}
              {update.type}
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 opacity-60">
                {update.label}
              </span>
              <div className="flex items-center gap-2">
                <update.icon className="h-4 w-4 text-primary group-hover/item:scale-110 transition-transform" />
                <span className="text-sm font-black italic tracking-tight text-foreground uppercase">
                  {update.val}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .hover\:pause-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
