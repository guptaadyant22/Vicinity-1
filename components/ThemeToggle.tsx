// Animated dark/light mode toggle button with sun and moon icons.
// Reads from ThemeContext and waits for mount to prevent hydration mismatch.

'use client'

import { useTheme } from '../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSun, FaMoon } from 'react-icons/fa'

// Renders an animated sun/moon button that toggles the theme
const ThemeToggle = () => {
  const { isDark, toggleTheme, mounted } = useTheme()

  // Render placeholder until mounted to avoid icon flicker
  if (!mounted) {
    return <div className="w-[42px] h-[42px] shrink-0" aria-hidden="true" />
  }

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
      className={`
        relative flex h-[42px] w-[42px] items-center justify-center rounded-2xl border
        transition-all duration-300 shrink-0
        ${
          isDark
            ? 'bg-white/[0.05] border-white/10 text-yellow-400 hover:bg-white/[0.10] hover:border-yellow-400/30'
            : 'bg-white/80 border-blue-500/12 text-blue-600 hover:bg-blue-50 hover:border-blue-200'
        }
      `}
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? 'dark' : 'light'}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            {isDark ? <FaMoon className="text-lg" /> : <FaSun className="text-lg" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.button>
  )
}

export default ThemeToggle