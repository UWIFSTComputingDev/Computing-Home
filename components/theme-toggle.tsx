"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme, isLoaded } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border-color)] text-[color:var(--muted)] transition-all hover:border-[color:var(--primary-color)] hover:text-[color:var(--primary-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={!isLoaded}
    >
      {isLoaded ? (
        isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )
      ) : (
        <span className="h-5 w-5 animate-pulse rounded-full bg-[color:var(--muted)]/40" />
      )}
    </button>
  )
}