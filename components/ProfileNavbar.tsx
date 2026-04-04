// Minimal navbar shown on public business profile pages with a dashboard link.
// Displays the Vicinity logo and a single CTA button.

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa'
import VicinityLogo from './VicinityLogo'

// Minimal navbar for public business profiles with dashboard link
export default function ProfileNavbar() {
    const router = useRouter()

    return (
        <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
            <div className="w-full max-w-5xl bg-white/82 dark:bg-[#0d142488] backdrop-blur-2xl border border-blue-500/12 dark:border-white/10 rounded-[24px] p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.35)] pointer-events-auto flex items-center justify-between pl-4 pr-2 hover:bg-white/85 transition-all duration-300">
                <VicinityLogo />

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/user/dashboard')}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.22)] flex items-center gap-2 transition-all"
                >
                    Dashboard <FaArrowRight size={12} />
                </motion.button>
            </div>
        </motion.nav>
    )
}
