// Simple auth-page navbar with logo, theme toggle, and optional navigation link.
// Used on login, signup, and forgot-password screens.

'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import VicinityLogo from './VicinityLogo'
import ThemeToggle from './ThemeToggle'
import { UI_SETTINGS } from '../lib/ui'

interface AuthNavbarProps {
    linkTo?: string
    linkText?: string
    homeText?: string
}

// Simplified navbar for auth pages (login, signup, forgot-password)
export default function AuthNavbar({ linkTo, linkText, homeText = "Home" }: AuthNavbarProps) {
    return (
        <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
            <div className="w-full max-w-5xl bg-white/82 dark:bg-[#0d142488] backdrop-blur-2xl border border-blue-500/12 dark:border-white/10 rounded-[24px] p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.35)] transition-all duration-300 pointer-events-auto flex items-center justify-between pl-4 pr-2">
                <Link href="/">
                    <VicinityLogo />
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {linkTo && linkText && (
                        <Link href={linkTo} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-white/[0.06] rounded-2xl transition-all">
                            {linkText}
                        </Link>
                    )}
                    <Link href="/" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                        {homeText}
                    </Link>
                </div>
            </div>
        </motion.nav>
    )
}
