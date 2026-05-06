"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, CheckCircle2 } from "lucide-react"

export interface SelectOption {
  value: any
  label: string
  disabled?: boolean
  color?: string
  subLabel?: string
}

interface ArtisanSelectProps {
  value: any
  onChange: (val: any) => void
  options: SelectOption[]
  icon?: any
  label?: string
  className?: string
}

export function ArtisanSelect({ 
  value, onChange, options, icon: Icon, label, className = "" 
}: ArtisanSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find(o => o.value === value)

  // Close on outside click/touch
  useEffect(() => {
    if (!isOpen) return
    const handleOutside = (e: Event) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [isOpen])

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1 mb-1.5 block">{label}</label>}
      
      {/* Trigger — proper button for mobile touch */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-muted/40 border border-border/30 p-3 min-h-[44px] rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-muted/60 ${isOpen ? 'ring-4 ring-primary/20 border-primary/40 shadow-lg' : ''}`}
        style={{ touchAction: 'manipulation' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <Icon className="h-3.5 w-3.5 text-primary/60 shrink-0" />}
          <span className="text-sm font-black truncate tracking-tight">{selectedOption?.label || "Select..."}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground/30 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[240]" onClick={() => setIsOpen(false)} onTouchEnd={(e) => { e.preventDefault(); setIsOpen(false); }} />
          <div className="absolute top-[calc(100%+8px)] left-0 w-full z-[250] bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 origin-top max-h-64 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button 
                type="button"
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`flex flex-col w-full text-left px-4 py-3 min-h-[44px] cursor-pointer transition-colors ${
                  value === opt.value ? 'bg-primary/10' : 'hover:bg-foreground/5 active:bg-foreground/10'
                } ${opt.disabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                disabled={opt.disabled}
                style={{ touchAction: 'manipulation' }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-sm font-bold ${opt.color || "text-foreground"}`}>{opt.label}</span>
                  {value === opt.value && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                </div>
                {opt.subLabel && <span className="text-[10px] font-medium text-muted-foreground/50">{opt.subLabel}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
