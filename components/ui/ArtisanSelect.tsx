"use client"

import { useState } from "react"
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
  const selectedOption = options.find(o => o.value === value)

  return (
    <div className={`relative ${className}`}>
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1 mb-1.5 block">{label}</label>}
      
      {/* Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-muted/40 border border-border/30 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-muted/60 ${isOpen ? 'ring-4 ring-primary/20 border-primary/40 shadow-lg' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <Icon className="h-3.5 w-3.5 text-primary/60" />}
          <span className="text-sm font-black truncate tracking-tight">{selectedOption?.label || "Select..."}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Menu Overlay */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[240]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+8px)] left-0 w-full z-[250] bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 origin-top max-h-64 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`flex flex-col px-4 py-2.5 cursor-pointer transition-colors ${
                  value === opt.value ? 'bg-primary/10' : 'hover:bg-foreground/5'
                } ${opt.disabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${opt.color || "text-foreground"}`}>{opt.label}</span>
                  {value === opt.value && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                </div>
                {opt.subLabel && <span className="text-[10px] font-medium text-muted-foreground/50">{opt.subLabel}</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
