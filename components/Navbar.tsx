// Landing page navbar with smooth-scroll section links, auth buttons, and theme toggle.
// Uses the floating glass-card style consistent with Vicinity's design system.

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import VicinityLogo from './VicinityLogo'
import ThemeToggle from './ThemeToggle'
import { LANDING_NAV_ITEMS } from '../lib/ui'
import { FaUniversalAccess } from 'react-icons/fa'

// Landing page navbar with smooth-scroll links and auth CTAs
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Trigger when scrolling past 90% of the viewport height (roughly the end of the hero section)
      setIsScrolled(window.scrollY > window.innerHeight * 0.9)
    }
    
    // Set initial state
    handleScroll()
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smooth scroll to the target section on click
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
      <div 
        className={`w-full max-w-5xl backdrop-blur-2xl border rounded-[24px] p-2 pointer-events-auto flex items-center justify-between pl-4 pr-2 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/82 dark:bg-[#0d142488] border-blue-500/12 dark:border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.35)]'
            : 'bg-[#0d142488] border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.35)]'
        }`}
      >
        <VicinityLogo textClassName={isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'} />

        {/* Section links (desktop) */}
        <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${isScrolled ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300'}`}>
          {LANDING_NAV_ITEMS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`transition-colors relative group cursor-pointer ${
                isScrolled 
                  ? 'text-slate-900 dark:text-white hover:text-slate-900 dark:hover:text-white'
                  : 'text-white hover:text-white'
              }`}
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle forceDark={!isScrolled} />
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('toggle-accessibility-menu'))}
            title="Accessibility Options"
            aria-label="Accessibility Options"
            className={`
              relative flex h-[42px] w-[42px] items-center justify-center rounded-2xl border
              transition-all duration-300 shrink-0
              ${
                !isScrolled
                  ? 'bg-white/[0.05] border-white/10 text-blue-400 hover:bg-white/[0.10] hover:border-blue-400/30'
                  : 'bg-white/80 border-blue-500/12 text-blue-600 hover:bg-blue-50 hover:border-blue-200 dark:bg-white/[0.05] dark:border-white/10 dark:text-blue-400 dark:hover:bg-white/[0.10] dark:hover:border-blue-400/30'
              }
            `}
          >
            <FaUniversalAccess size={18} />
          </button>

          <a
            href="/login"
            className={`px-5 py-2.5 text-sm font-bold rounded-2xl transition-all border ${
              isScrolled 
                ? 'bg-white/80 dark:bg-[rgba(255,255,255,0.05)] hover:bg-blue-50 dark:hover:bg-[rgba(255,255,255,0.08)] text-slate-700 dark:text-slate-300 border-blue-500/12 dark:border-white/10'
                : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] text-slate-300 border-white/10'
            }`}
          >
            Log In
          </a>

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
