'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
import VicinityLogo from './VicinityLogo'
import { UI_SETTINGS, LANDING_NAV_ITEMS, FOOTER_LINKS } from '../lib/ui'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden pt-10 border-t border-blue-500/10 bg-white text-slate-900 transition-colors duration-300 dark:border-white/10 dark:bg-[#081120] dark:text-white">

      {/* Large background branding text matching landing page */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 z-0 flex items-end justify-center overflow-hidden"
      >
        <motion.h1
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="translate-y-8 select-none font-[var(--font-outfit)] text-[22vw] font-bold leading-[0.75] tracking-[-0.04em]"
          style={{
            backgroundImage: "linear-gradient(90deg, rgba(59,130,246,0.07) 0%, rgba(147,197,253,0.13) 40%, rgba(59,130,246,0.07) 70%, rgba(59,130,246,0.03) 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VICINITY
        </motion.h1>
      </motion.div>

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-blue-400 blur-[100px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8 ">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="mb-6"><VicinityLogo /></div>
            <p className="mb-8 text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              {UI_SETTINGS.siteDescription}
            </p>
            <div className="flex gap-3">
              {[
                { icon: <FaTwitter />, label: "Twitter" },
                { icon: <FaInstagram />, label: "Instagram" },
                { icon: <FaLinkedin />, label: "LinkedIn" },
              ].map(({ icon, label }) => (
                <motion.a
                  key={label}
                  href="#"
                  aria-label={label}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/5 text-slate-400 transition-colors hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-300"
                >
                  {icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <h4 className="mb-6 font-semibold text-slate-900 dark:text-white">Navigation</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              {LANDING_NAV_ITEMS.map((item, i) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
                >
                  <a href={item.href} className="group inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-300">
                    <span className="h-px w-0 bg-blue-500 transition-all duration-300 group-hover:w-3" />
                    {item.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <h4 className="mb-6 font-semibold text-slate-900 dark:text-white">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              {FOOTER_LINKS.company.map((item, i) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.18 + i * 0.05 }}
                >
                  <a href={item.href} className="group inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-300">
                    <span className="h-px w-0 bg-blue-500 transition-all duration-300 group-hover:w-3" />
                    {item.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.24 }}
          >
            <h4 className="mb-6 font-semibold text-slate-900 dark:text-white">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              {FOOTER_LINKS.legal.map((item, i) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.26 + i * 0.05 }}
                >
                  <a href={item.href} className="group inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-300">
                    <span className="h-px w-0 bg-blue-500 transition-all duration-300 group-hover:w-3" />
                    {item.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center justify-center pb-16 text-center text-sm font-medium text-slate-500 dark:text-slate-400"
        >
          {/* Note: Made with by Vicinity Team text has been removed from this shared footer */}
          <p className="mt-1 text-xs font-normal opacity-60">{UI_SETTINGS.copyright}</p>
        </motion.div>
      </div>

    </footer>
  )
}
