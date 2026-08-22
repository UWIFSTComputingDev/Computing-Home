'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isLoaded: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = "dept-theme"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(STORAGE_KEY)
      if (storedTheme === "light" || storedTheme === "dark") {
        setThemeState(storedTheme)
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setThemeState("dark")
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Unable to access theme preference from localStorage.", error)
      }
    } finally {
      setIsMounted(true)
    }
  }, [])

  useEffect(() => {
    if (!isMounted) {
      return
    }

    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    root.style.colorScheme = theme

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Unable to save theme preference to localStorage.", error)
      }
    }
  }, [theme, isMounted])

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"))
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isLoaded: isMounted,
    }),
    [theme, setTheme, toggleTheme, isMounted],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
