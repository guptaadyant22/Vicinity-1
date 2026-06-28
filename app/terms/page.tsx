'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Inter, Outfit } from 'next/font/google'
import AuthNavbar from '../../components/AuthNavbar'
import Footer from '../../components/Footer'
import { useTheme } from '../../context/ThemeContext'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

// Renders an animated glowing background blob that adapts to dark/light theme
function SectionGlow({ position = "left" }) {
  const { isDark } = useTheme();
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.08, 0.18, 0.08],
        transition: { duration: 10, repeat: Infinity, ease: "easeInOut" },
      }}
      className={`absolute ${position === "left" ? "-left-40 top-20" : "-right-40 top-40"} h-[450px] w-[450px] rounded-full blur-[140px] ${
        isDark ? "bg-blue-500/10" : "bg-blue-100/70"
      } pointer-events-none -z-10`}
    />
  );
}

// Background gradient mesh matching Vicinity's aesthetics
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-20 pointer-events-none bg-white dark:bg-[#081120] transition-colors duration-300">
    <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-blue-50/30 dark:bg-[#081120]" />
    <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-200/50 dark:bg-blue-500/10 blur-[130px] rounded-full" />
    <div className="absolute bottom-0 right-1/4 w-[1000px] h-[600px] bg-indigo-100/50 dark:bg-indigo-500/10 blur-[130px] rounded-full" />
  </div>
)

export default function TermsPage() {
  const rules = [
    {
      title: "1. Acceptance of Terms",
      desc: "By accessing or using Vicinity, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not access or use the platform. These terms govern all users, including standard consumers browsing the directory and commercial business owners listing their establishments."
    },
    {
      title: "2. User Accounts & Reviews",
      desc: "To access certain features, including leaving ratings and reviews, writing direct messages, or saving favorite businesses, you must register for an account. All reviews must be honest, authentic, and tied to verified accounts. You are solely responsible for all activities conducted under your login credentials."
    },
    {
      title: "3. Direct Messaging Guidelines",
      desc: "Vicinity offers a direct messaging system enabling communication between consumers and local businesses. You agree to use the messaging features professionally and respectfully. Any form of harassment, spam, offensive conduct, or unsolicited commercial advertisement is strictly prohibited."
    },
    {
      title: "4. Business Directory & Deals",
      desc: "Business owners are responsible for maintaining the accuracy of their directory listings, including hours of operation, photos, address, and descriptions. Any promotional deals published on the platform must be honored in accordance with the terms specified."
    },
    {
      title: "5. AI-Powered Search Intent",
      desc: "Vicinity utilizes machine learning and natural language processing to power search queries (e.g. interpreting contextual searches like 'cozy places for coffee'). While we strive to provide the most relevant listings, we do not guarantee the completeness or absolute accuracy of search results."
    },
    {
      title: "6. Limitation of Liability",
      desc: "To the maximum extent permitted by law, Vicinity, its affiliates, officers, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our local discovery platform."
    }
  ]

  return (
    <main
      className={`${inter.variable} ${outfit.variable} relative min-h-screen overflow-x-hidden bg-transparent text-slate-900 transition-colors duration-300 dark:text-white flex flex-col`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <GridBackground />
      <SectionGlow position="left" />
      <SectionGlow position="right" />
      <AuthNavbar homeText="Back Home" />

      {/* Simplified Hero Section */}
      <div className="relative pt-40 pb-12 px-6 text-center max-w-3xl mx-auto w-full">
        <h1 className="font-[var(--font-outfit)] text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Terms & Conditions
        </h1>
        <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-light">
          Last Updated: June 28, 2026
        </p>
      </div>

      {/* Rules list */}
      <div className="max-w-3xl mx-auto px-6 w-full pb-24 relative z-10 space-y-6 flex-grow">
        <div className="bg-white/80 dark:bg-[#0d1424]/90 border border-blue-500/10 dark:border-white/10 rounded-2xl p-8 md:p-10 shadow-sm space-y-8">
          {rules.map((rule) => (
            <div key={rule.title} className="space-y-2">
              <h3 className="font-bold text-sm font-[var(--font-outfit)] text-slate-800 dark:text-white">
                {rule.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                {rule.desc}
              </p>
            </div>
          ))}
          
          <div className="pt-6 border-t border-blue-500/10 dark:border-white/10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-light">
              Questions about our Terms & Conditions? Contact support at any time.
            </p>
            <Link 
              href="/help#contact"
              className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
