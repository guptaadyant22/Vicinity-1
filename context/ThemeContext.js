'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {}, mounted: false })

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check if user has a saved preference
    const saved = localStorage.getItem('theme')
    if (saved) {
      const shouldBeDark = saved === 'dark'
      setIsDark(shouldBeDark)
      if (shouldBeDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      // Default to dark mode
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
    
    // Apply the class immediately
    if (newDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Always render the Provider so useTheme() never fails
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
