"use client"

import * as React from "react"

const ThemeContext = React.createContext<{
  theme: string
  setTheme: (theme: string) => void
  resolvedTheme?: string
} | undefined>(undefined)

export function ThemeProvider({ 
  children, 
}: { 
  children: React.ReactNode
}) {
  const [theme, setTheme] = React.useState<string>("dark")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
    document.documentElement.classList.add(savedTheme)
    setMounted(true)
  }, [])

  const handleSetTheme = (newTheme: string) => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(newTheme)
    localStorage.setItem("theme", newTheme)
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme: theme }}>
      {mounted ? children : (
        <div suppressHydrationWarning className="dark contents">
          {children}
        </div>
      )}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
