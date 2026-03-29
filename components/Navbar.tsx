'use client'

// Landing navbar with smooth-scroll section links
// Uses the current blue glass Vicinity UI style

import React from 'react'
import { motion } from 'framer-motion'
import VicinityLogo from './VicinityLogo'
import ThemeToggle from './ThemeToggle'
import { LANDING_NAV_ITEMS } from '../lib/ui'

export default function Navbar() {
  // Smooth scroll to landing page sections
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4"
    >
      <div className="w-full max-w-5xl bg-white/82 dark:bg-[#0d142488] backdrop-blur-2xl border border-blue-500/12 dark:border-white/10 rounded-[24px] p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.35)] pointer-events-auto flex items-center justify-between pl-4 pr-2 transition-all duration-300">
        <VicinityLogo />

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          {LANDING_NAV_ITEMS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors relative group text-slate-900 dark:text-white cursor-pointer"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Right side auth actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Login link */}
          <a
            href="/login"
            className="px-5 py-2.5 text-sm font-bold rounded-2xl transition-all bg-white/80 dark:bg-[rgba(255,255,255,0.05)] hover:bg-blue-50 dark:hover:bg-[rgba(255,255,255,0.08)] text-slate-700 dark:text-slate-300 border border-blue-500/12 dark:border-white/10"
          >
            Log In
          </a>

          {/* Primary CTA */}
          <a
            href="/signup"
            className="px-5 py-2.5 text-sm font-bold rounded-2xl transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
          >
            Get Started
          </a>
        </div>
      </div>
    </motion.nav>
  )
}
