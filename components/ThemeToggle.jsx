// components/ThemeToggle.jsx
'use client'

import { useTheme } from '../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSun, FaMoon } from 'react-icons/fa'

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.button
      className={`
        z-[9999] p-2 rounded-full shadow-2xl backdrop-blur-md border 
        transition-all duration-300 group
        ${isDark 
          ? 'bg-black/40 border-white/10 text-yellow-400 hover:bg-black/60 hover:border-yellow-400/50' 
          : 'bg-white/80 border-gray-200 text-orange-500 hover:bg-white hover:border-orange-200'
        }
      `}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Toggle Theme"
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

      {/* Tooltip on the LEFT of the button */}
      <span
        className={`
          absolute right-full mr-3 top-1/2 -translate-y-1/2 
          px-2 py-1 rounded text-xs font-bold 
          opacity-0 group-hover:opacity-100 
          transition-opacity duration-200 whitespace-nowrap pointer-events-none
          ${isDark ? 'bg-white text-black' : 'bg-black text-white'}
        `}
      >
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </motion.button>
  )
}

export default ThemeToggle
