"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, 
  LayoutDashboard, 
  Calendar, 
  LineChart, 
  Settings, 
  Plus, 
  Users,
  Command as CommandIcon,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandAction {
  id: string
  title: string
  description?: string
  icon: any
  href?: string
  action?: () => void
  category: "Navigation" | "Actions" | "Search"
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const actions: CommandAction[] = [
    { id: "dash", title: "Dashboard", icon: LayoutDashboard, href: "/dashboard", category: "Navigation" },
    { id: "bookings", title: "Bookings", icon: Calendar, href: "/dashboard/bookings", category: "Navigation" },
    { id: "analytics", title: "Analytics", icon: LineChart, href: "/dashboard/analytics", category: "Navigation" },
    { id: "customers", title: "Customers", icon: Users, href: "/dashboard/customers", category: "Navigation" },
    { id: "settings", title: "Settings", icon: Settings, href: "/dashboard/settings", category: "Navigation" },
    { id: "new-booking", title: "New Booking", description: "Create a new reservation", icon: Plus, action: () => router.push("/dashboard/bookings?new=true"), category: "Actions" },
  ]

  const filteredActions = actions.filter(action => 
    action.title.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  )

  const toggle = useCallback(() => setIsOpen(open => !open), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        toggle()
      }
      if (e.key === "/" && !isOpen && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault()
        toggle()
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, toggle])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSelectedIndex(0)
      setQuery("")
    }
  }, [isOpen])

  const handleSelect = (action: CommandAction) => {
    if (action.href) {
      router.push(action.href)
    } else if (action.action) {
      action.action()
    }
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(idx => (idx + 1) % filteredActions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(idx => (idx - 1 + filteredActions.length) % filteredActions.length)
    } else if (e.key === "Enter") {
      if (filteredActions[selectedIndex]) {
        handleSelect(filteredActions[selectedIndex])
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4 sm:px-6 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 bg-background/60 backdrop-blur-md" 
        onClick={() => setIsOpen(false)} 
      />
      
      <div className="relative w-full max-w-2xl bg-card/80 backdrop-blur-2xl border border-border/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in slide-in-from-top-4 duration-300">
        <div className="flex items-center p-6 border-b border-border/20">
          <Search className="h-5 w-5 text-muted-foreground mr-4 shrink-0" />
          <input 
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, pages, or actions..."
            className="w-full bg-transparent border-none outline-none text-lg font-bold placeholder:text-muted-foreground/40 placeholder:font-black tracking-tight"
          />
          <div className="flex items-center gap-1.5 ml-4 shrink-0">
             <kbd className="px-2 py-1 rounded bg-muted/40 border border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
               <CommandIcon className="h-2.5 w-2.5" /> K
             </kbd>
             <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted/40 rounded-lg transition-colors">
               <X className="h-4 w-4 text-muted-foreground" />
             </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 custom-scrollbar">
          {filteredActions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-40">No matches found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {["Actions", "Navigation"].map(category => {
                const categoryActions = filteredActions.filter(a => a.category === category)
                if (categoryActions.length === 0) return null
                
                return (
                  <div key={category} className="space-y-1">
                    <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-3">{category}</h3>
                    {categoryActions.map((action) => {
                      const absoluteIndex = filteredActions.indexOf(action)
                      const isActive = selectedIndex === absoluteIndex
                      
                      return (
                        <div 
                          key={action.id}
                          onClick={() => handleSelect(action)}
                          onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                          className={cn(
                            "flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 group relative",
                            isActive ? "bg-primary/10 pl-6" : "hover:bg-muted/30"
                          )}
                        >
                          {isActive && (
                            <div className="absolute left-2 w-1 h-6 bg-primary rounded-full animate-in slide-in-from-left duration-200" />
                          )}
                          
                          <div className={cn(
                            "p-2.5 rounded-xl mr-4 transition-colors",
                            isActive ? "bg-primary text-white" : "bg-muted/40 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                          )}>
                            <action.icon className="h-4.5 w-4.5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={cn(
                              "text-sm font-black tracking-tight",
                              isActive ? "text-primary" : "text-foreground"
                            )}>{action.title}</h4>
                            {action.description && (
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 truncate">{action.description}</p>
                            )}
                          </div>

                          {isActive && (
                            <Plus className="h-3 w-3 text-primary animate-pulse" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/20 border-t border-border/20 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><kbd className="p-1 rounded bg-muted/40 border border-border/30">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1.5"><kbd className="p-1 rounded bg-muted/40 border border-border/30">Enter</kbd> Select</span>
            <span className="flex items-center gap-1.5"><kbd className="p-1 rounded bg-muted/40 border border-border/30">ESC</kbd> Close</span>
          </div>
          <div>ARTISAN COMMAND HUB</div>
        </div>
      </div>
    </div>
  )
}
