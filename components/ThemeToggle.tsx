"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "./ThemeProvider"
import { Button } from "@/components/ui/Button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    const nextTheme = theme === "dark" || resolvedTheme === "dark" ? "light" : "dark"
    console.log("Current theme:", theme, "Resolved:", resolvedTheme, "Switching to:", nextTheme)
    setTheme(nextTheme)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-10 px-0"
      onClick={toggleTheme}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-500" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
