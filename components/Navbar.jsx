'use client'


import { motion } from 'framer-motion'


const navItems = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'FAQs', href: '#faq' }
]


const VicinityLogo = ({ className = "", textClassName = "" }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0,0,256,256" className="w-8 h-8">
      <g fill="#ff6f00" fillRule="nonzero">
        <g transform="translate(256,256) rotate(180) scale(5.33333,5.33333)">
          <path d="M5,45l4,-11l12,-12l-6,23z"></path>
          <path d="M25,18l8,27h10l-11,-33z"></path>
          <path d="M16.059,14.164l3.941,-11.164h8z"></path>
          <path d="M10.731,29.002l12.269,-12.002v-2l-11.42,11.667z"></path>
          <path d="M15.142,16.429l-2.142,5.571l16.724,-16.275l-0.906,-2.547z"></path>
          <path d="M23.932,14.055l0.445,1.571l6.564,-6.448l-0.556,-1.476z"></path>
        </g>
      </g>
    </svg>
    <span className={`font-black text-orange-500 dark:text-orange-400 text-xl tracking-tight ${textClassName}`}>Vicinity</span>
  </div>
)


export default function Navbar() {
  const handleNavClick = (e, href) => {
    e.preventDefault()
    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <div className="w-full max-w-5xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-gray-300/20 dark:border-white/15 rounded-2xl p-2 shadow-2xl pointer-events-auto flex items-center justify-between pl-4 pr-2 hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-300">
        <VicinityLogo />
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700 dark:text-gray-300">
          {navItems.map((item) => (
            <a 
              key={item.name} 
              href={item.href} 
              onClick={(e) => handleNavClick(e, item.href)}
              className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors relative group text-gray-900 dark:text-white cursor-pointer"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
            </a>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Button Removed Here */}
          
          <a href="/login" className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Log In</a>
          <a href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">Get Started</a>
        </div>
      </div>
    </motion.nav>
  )
}