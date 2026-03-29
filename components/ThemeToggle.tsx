// components/ThemeToggle.tsx
'use client'

import { useTheme } from '../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSun, FaMoon } from 'react-icons/fa'

const ThemeToggle = () => {
  const { isDark, toggleTheme, mounted } = useTheme()

  // Don't render until hydration is complete to prevent icon flicker
  if (!mounted) return <div className="w-[42px] h-[42px]" />

  return (
    <motion.button
      className={`
        relative p-2.5 rounded-2xl border 
        transition-all duration-300
        ${isDark 
          ? 'bg-white/[0.05] border-white/10 text-yellow-400 hover:bg-white/[0.10] hover:border-yellow-400/30' 
          : 'bg-white/80 border-blue-500/12 text-blue-600 hover:bg-blue-50 hover:border-blue-200'
        }
      `}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? 'dark' : 'light'}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <FaMoon className="text-lg" />
            ) : (
              <FaSun className="text-lg" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.button>
  )
}

export default ThemeToggle
