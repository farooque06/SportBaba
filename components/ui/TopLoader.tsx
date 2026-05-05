"use client"

import { useEffect, useState, useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function TopLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const startLoading = useCallback(() => {
    setLoading(true)
    setProgress(0)
    
    // Simulate progress
    let current = 0
    const interval = setInterval(() => {
      current += Math.random() * 15
      if (current >= 90) {
        clearInterval(interval)
        current = 90
      }
      setProgress(current)
    }, 200)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Complete loading when route changes
    setProgress(100)
    const timer = setTimeout(() => {
      setLoading(false)
      setProgress(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  // Intercept all link clicks to start the loader
  useEffect(() => {
    let cleanup: (() => void) | undefined

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return
      
      // Don't trigger for same-page links
      if (href === pathname) return
      
      cleanup = startLoading()
    }

    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("click", handleClick)
      cleanup?.()
    }
  }, [pathname, startLoading])

  if (!loading && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none">
      <div 
        className="h-full bg-gradient-to-r from-primary via-primary to-emerald-300 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          opacity: loading ? 1 : 0,
        }}
      />
      {loading && (
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-primary/60 to-transparent animate-pulse" />
      )}
    </div>
  )
}
