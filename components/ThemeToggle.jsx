// components/ThemeToggle.jsx
'use client'

import { useTheme } from '../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSun, FaMoon } from 'react-icons/fa'

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.button
      className={`fixed bottom-6 left-6 z-[9999] p-3 rounded-full shadow-2xl backdrop-blur-md border transition-all duration-300 group
        ${isDark 
          ? 'bg-black/40 border-white/10 text-yellow-400 hover:bg-black/60 hover:border-yellow-400/50' 
          : 'bg-white/80 border-gray-200 text-orange-500 hover:bg-white hover:border-orange-200'
        }
      `}
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Toggle Theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? 'dark' : 'light'}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? <FaMoon className="text-xl" /> : <FaSun className="text-xl" />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Optional: Tooltip on Hover */}
      <span className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none
        ${isDark ? 'bg-white text-black' : 'bg-black text-white'}
      `}>
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </motion.button>
  )
}

export default ThemeToggle

