"use client"

import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react"
import { ChevronDown, CheckCircle2, LucideIcon, Search, X, Loader2 } from "lucide-react"
import { Portal } from "@/components/ui/Portal"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: any
  label: string
  disabled?: boolean
  color?: string
  subLabel?: string
  icon?: LucideIcon
}

interface ArtisanSelectProps {
  value: any
  onChange: (val: any) => void
  options: SelectOption[]
  icon?: LucideIcon
  label?: string
  className?: string
  placeholder?: string
}

export function ArtisanSelect({ 
  value, onChange, options, icon: Icon, label, className = "", placeholder = "Select..."
}: ArtisanSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find(o => o.value === value)

  // Update position when opening
  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom, 
        left: rect.left,
        width: rect.width
      })
    }
  }

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement
        if (!target.closest('[data-select-menu]')) {
          setIsOpen(false)
        }
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
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1 mb-1.5 block">{label}</label>}
      
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-muted/40 border border-border/40 p-3 min-h-[48px] rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300",
          isOpen ? "ring-4 ring-primary/10 border-primary/40 bg-card shadow-xl scale-[1.02]" : "hover:bg-muted/60"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && <Icon className="h-4 w-4 text-primary/60 shrink-0" />}
          <span className="text-xs font-black truncate tracking-tight uppercase">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground/30 transition-transform duration-500", isOpen ? "rotate-180 text-primary" : "")} />
      </button>

      {isOpen && (
        <Portal>
          <div 
            data-select-menu
            className="fixed z-[3000] bg-card/95 backdrop-blur-2xl border border-border/40 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-300 origin-top flex flex-col"
            style={{ 
              top: `${coords.top + 8}px`, 
              left: `${coords.left}px`, 
              width: `${coords.width}px`,
              maxHeight: '320px'
            }}
          >
            <div className="overflow-y-auto custom-scrollbar flex-1 py-1.5">
              {options.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No customers found</p>
                </div>
              ) : (
                options.map((opt, idx) => (
                  <button 
                    type="button"
                    key={opt.value + idx}
                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                    className={cn(
                      "flex flex-col w-full text-left px-5 py-3 transition-all duration-200 hover:pl-6",
                      value === opt.value ? "bg-primary/10" : "hover:bg-muted/60 active:bg-muted"
                    )}
                    disabled={opt.disabled}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                         {opt.icon && <opt.icon className="h-3.5 w-3.5 text-primary/60" />}
                         <span className={cn("text-xs font-black uppercase tracking-tight", opt.color || "text-foreground")}>{opt.label}</span>
                      </div>
                      {value === opt.value && <CheckCircle2 className="h-4 w-4 text-primary shrink-0 animate-in zoom-in duration-300" />}
                    </div>
                    {opt.subLabel && <span className="text-[9px] font-bold text-muted-foreground/50 mt-0.5 uppercase tracking-widest">{opt.subLabel}</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
