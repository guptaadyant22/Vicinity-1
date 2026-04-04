// Manages dark/light theme state using React context and localStorage persistence.
// Syncs the "dark" class on the HTML root element and exposes a toggle for components.

'use client'

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

// Provides dark/light theme state and toggle to children
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Read persisted theme preference on mount
  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme')

    if (savedTheme === 'light') {
      setIsDark(false)
    } else if (savedTheme === 'dark') {
      setIsDark(true)
    } else {
      setIsDark(true)
    }

    setMounted(true)
  }, [])

  // Sync <html> class and localStorage when theme changes
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

  // Toggle between dark and light mode
  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to access theme context — must be used inside ThemeProvider
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}