import React from 'react'
import { FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
import VicinityLogo from './VicinityLogo'
import { UI_SETTINGS, LANDING_NAV_ITEMS, FOOTER_LINKS } from '../lib/ui'

export default function Footer() {
    return (
        <footer className="relative py-20 border-t border-blue-500/10 dark:border-white/10 text-slate-900 dark:text-white z-10 bg-white dark:bg-[#081120] transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div>
                    <div className="mb-6"><VicinityLogo /></div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{UI_SETTINGS.siteDescription}</p>
                    <div className="flex gap-4 text-slate-500 dark:text-slate-400">
                        <FaTwitter className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors cursor-pointer" />
                        <FaInstagram className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors cursor-pointer" />
                        <FaLinkedin className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors cursor-pointer" />
                    </div>
                </div>
                <div>
                    <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Navigation</h4>
                    <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                        {LANDING_NAV_ITEMS.map(item => (
                            <li key={item.name}><a href={item.href} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">{item.name}</a></li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Company</h4>
                    <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                        {FOOTER_LINKS.company.map(item => (
                            <li key={item.name}><a href={item.href} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">{item.name}</a></li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Legal</h4>
                    <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                        {FOOTER_LINKS.legal.map(item => (
                            <li key={item.name}><a href={item.href} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">{item.name}</a></li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-blue-500/10 dark:border-white/[0.05] text-center text-xs text-slate-400 dark:text-slate-500">
                {UI_SETTINGS.copyright}
            </div>
        </footer>
    )
}
