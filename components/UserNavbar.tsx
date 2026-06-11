// Navigation bar for all /user/** pages with section links, profile button, and logout.
// Highlights the currently active page and provides theme toggle.

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaUser, FaUniversalAccess } from 'react-icons/fa'
import VicinityLogo from './VicinityLogo'
import ThemeToggle from './ThemeToggle'

interface NavLink {
  name: string
  href: string
  key: string
}

const NAV_LINKS: NavLink[] = [
  { name: 'Browse', href: '/user/dashboard', key: 'dashboard' },
  { name: 'Saved', href: '/user/saved', key: 'saved' },
  { name: 'Reviews', href: '/user/reviews', key: 'reviews' },
  { name: 'Messages', href: '/user/messages', key: 'messages' },
]

interface UserNavbarProps {
  activePage?: string
  onLogout?: () => void
}

// Navigation bar for user pages with active-page highlighting
export default function UserNavbar({ activePage = '', onLogout }: UserNavbarProps) {
  const router = useRouter()

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4"
    >
      <div className="w-full max-w-5xl bg-white/82 dark:bg-[#0d142488] backdrop-blur-2xl border border-blue-500/12 dark:border-white/10 rounded-[24px] p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.35)] pointer-events-auto flex items-center justify-between pl-4 pr-2 transition-all duration-300">
        <VicinityLogo showText={true} />

        {/* Section links (desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          {NAV_LINKS.map((link) => {
            const isActive = activePage === link.key
            return (
              <a
                key={link.key}
                href={link.href}
                className={`transition-colors relative group ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-blue-500 transition-all ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </a>
            )
          })}
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('toggle-accessibility-menu'))}
            title="Accessibility Options"
            aria-label="Accessibility Options"
            className="relative flex h-[42px] w-[42px] items-center justify-center rounded-2xl border transition-all duration-300 shrink-0 bg-white/80 border-blue-500/12 text-blue-600 hover:bg-blue-50 hover:border-blue-200 dark:bg-white/[0.05] dark:border-white/10 dark:text-blue-400 dark:hover:bg-white/[0.10] dark:hover:border-blue-400/30"
          >
            <FaUniversalAccess size={18} />
          </button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/user/profile')}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-[0_10px_30px_rgba(59,130,246,0.24)] transition-all ${
              activePage === 'profile'
                ? 'bg-blue-700 ring-2 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-[#081120]'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FaUser size={13} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="px-5 py-2.5 rounded-2xl text-sm font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
          >
            Logout
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}
