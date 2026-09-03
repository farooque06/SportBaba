"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqs = [
  {
    q: "How does booking a sports slot on SportBaba work?",
    a: "Simply browse featured venues or search by sport/city. Select an available time slot (from 30 to 120 minutes), enter your player details, and receive an instant digital receipt with a verified entry code."
  },
  {
    q: "Do I need to pay online in advance?",
    a: "No upfront payment is required on public bookings! You can pay comfortably at the facility counter via Cash, QR, or Card upon arrival."
  },
  {
    q: "Can I download and share my booking receipt with my team?",
    a: "Yes! Once booked, you receive a full digital entry pass. You can print or download the PDF receipt, or click 'Share to WhatsApp Squad' to send match details directly to your group chat."
  },
  {
    q: "How do turf and facility owners list their venues on SportBaba?",
    a: "Click 'Partner With Us' or 'Get Started'. Register your venue in under 2 minutes, configure your court pricing and operating hours, and your public booking page will go live instantly."
  },
  {
    q: "How does SportBaba prevent double-bookings?",
    a: "SportBaba features a high-speed real-time event lock. When a slot is booked either online or through the admin POS desk, it is locked immediately across all devices with zero latency."
  },
  {
    q: "Can facility owners manage tournament brackets and memberships?",
    a: "Yes! SportBaba includes a full Tournament Bracket Engine, recurring membership management, customer retention CRM, and automated PDF invoice generation."
  }
]

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        
        {/* Header */}
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mx-auto">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Got Questions?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-base text-muted-foreground max-w-xl mx-auto font-medium">
            Everything you need to know about playing, booking, and managing sports venues with SportBaba.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3.5">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i
            return (
              <div 
                key={i}
                className="rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xl transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-foreground text-sm sm:text-base hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium border-t border-border/40 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
