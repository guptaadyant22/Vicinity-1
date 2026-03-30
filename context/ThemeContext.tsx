'use client'

// Theme context for Vicinity
// FIXES:
// 1. Applies the root .dark class in a dedicated effect
// 2. Reads localStorage only after mount
// 3. Defaults safely to dark mode
// 4. Keeps mounted state for hydration-safe UI
// 5. Uses nullable context so useTheme guard actually works

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme')

    if (savedTheme === 'light') {
      setIsDark(false)
    } else if (savedTheme === 'dark') {
      setIsDark(true)
    } else {
      // Default Vicinity dashboard theme
      setIsDark(true)
    }

    setMounted(true)
  }, [])

  // Keep <html> class and localStorage in sync with state
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    if (isDark) {
      root.classList.add('dark')
      window.localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      window.localStorage.setItem('theme', 'light')
    }
  }, [isDark, mounted])

  // Toggle theme state
  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}