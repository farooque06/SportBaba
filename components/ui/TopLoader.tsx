"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function TopLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Use a ref for the interval to ensure we can always clear it
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const stopLoading = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startLoading = useCallback(() => {
    stopLoading() // Clear any existing loader first
    setLoading(true)
    setProgress(0)
    
    let current = 0
    intervalRef.current = setInterval(() => {
      current += Math.random() * 15
      if (current >= 90) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        current = 90
      }
      setProgress(current)
    }, 200)
  }, [stopLoading])

  useEffect(() => {
    // Complete loading when route changes
    stopLoading()
    setProgress(100)
    const timer = setTimeout(() => {
      setLoading(false)
      setProgress(0)
    }, 300)
    return () => {
      clearTimeout(timer)
      stopLoading()
    }
  }, [pathname, searchParams, stopLoading])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return
      
      // Don't trigger for same-page links unless it's a different search param
      if (href === pathname || (href.startsWith('/') && href.split('?')[0] === pathname)) {
         // Optionally skip if no actual navigation will happen
      }
      
      startLoading()
    }

    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("click", handleClick)
      stopLoading()
    }
  }, [pathname, startLoading, stopLoading])

  if (!loading && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[2000] h-[3px] pointer-events-none">
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
