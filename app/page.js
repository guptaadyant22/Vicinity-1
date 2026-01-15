'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useTime, useAnimationFrame,AnimatePresence  } from 'framer-motion'
import {
  FaStore, FaStar, FaRocket, FaMapMarkerAlt, 
  FaUserFriends, FaBolt, FaSearch, FaCommentDots, 
  FaBell, FaTwitter, FaInstagram, FaLinkedin, FaWifi,
  FaCompass, FaUser, FaCalendarAlt, FaTag,
  FaMusic, FaGamepad, FaCamera, FaCoffee,
  FaDumbbell, FaBook, FaBrain, FaChartLine,
  FaCheck,FaChevronDown 
} from 'react-icons/fa'

import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'
import LightPillar from '../components/LightPillar'


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

const CleanWhiteBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-white overflow-hidden pointer-events-none">
      
      {/* 1. Primary Gradient Beam - Orange from bottom-left */}
      <motion.div 
        animate={{ 
          opacity: [0.6, 0.9, 0.6],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-orange-400/70 via-orange-300/50 to-transparent rounded-full blur-[80px]"
      />

      {/* 2. Secondary Gradient Beam - Pink/Rose from top-right */}
      <motion.div 
        animate={{ 
          opacity: [0.5, 0.85, 0.5],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-gradient-to-bl from-pink-400/60 via-rose-300/40 to-transparent rounded-full blur-[90px]"
      />

      {/* 3. Tertiary Accent - Purple from top-left */}
      <motion.div 
        animate={{ 
          opacity: [0.4, 0.7, 0.4],
          x: [0, 40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/4 -left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/50 via-purple-300/30 to-transparent rounded-full blur-[100px]"
      />

      {/* 4. Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.2]" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #9ca3af 1px, transparent 1px), 
            linear-gradient(to bottom, #9ca3af 1px, transparent 1px)
          `, 
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(circle at center, black 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 100%)'
        }} 
      />

      {/* 5. Animated Accent Line */}
      <motion.div 
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scaleY: [1, 1.4, 1],
        }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-1/3 right-1/4 w-[3px] h-2/5 bg-gradient-to-b from-transparent via-orange-400/70 to-transparent blur-sm"
      />

      {/* 6. Center Glow - Warm overlay */}
      <motion.div 
        animate={{ 
          opacity: [0.6, 0.85, 0.6],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-r from-orange-200/50 via-pink-200/40 to-purple-200/40 rounded-full blur-[130px]"
      />

      {/* 7. Light Readability Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/10 to-white/20" />
    </div>
  )
}

const GridBackground = () => {
  const { isDark } = useTheme()
  
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {isDark ? (
        // Dark Mode - Existing LightPillar Configuration
        <LightPillar
          bottomColor="#ff6f00"
          topColor="#ff1493"
          intensity={0.8}
          rotationSpeed={0.3}
          interactive={false}
          glowAmount={0.008}
          pillarWidth={4.0}
          pillarHeight={0.5}
          noiseIntensity={0.3}
          pillarRotation={0}
        />
      ) : (
        // Light Mode - New Custom White Background
        <CleanWhiteBackground />
      )}
    </div>
  )
}

const AnimatedIPadDemo = () => {
  const time = useTime()
  const radarRotate = useTransform(time, [0, 4000], [0, 360], { clamp: false })
  const pulseScale = useTransform(time, [0, 1000, 2000], [1, 1.3, 1], { repeat: Infinity })

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-full h-full max-w-[750px] aspect-[4/3] bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-[48px] border-8 border-[#3a3a3a] shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#000] rounded-b-3xl z-20" />
        
        <div className="absolute inset-2 rounded-[40px] bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] overflow-hidden border border-[#2a2a2a] flex flex-col">
          
          <div className="bg-black/80 px-6 py-2.5 flex items-center justify-between text-white text-xs font-semibold border-b border-[#333]">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <FaWifi className="text-xs opacity-70" />
              <div className="flex items-center gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-0.5 h-2 rounded-sm ${i < 3 ? 'bg-white' : 'bg-gray-600'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden bg-black">
            
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ 
                opacity: [1, 1, 0.3, 0],
                scale: [1, 1, 1.05, 1.2]
              }}
              transition={{ duration: 5, times: [0, 0.3, 0.32, 0.4] }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black"
            >
              <div className="grid grid-cols-4 gap-4 w-fit">
                {[
                  { icon: <FaMapMarkerAlt />, gradient: "bg-gradient-to-br from-green-400 to-green-600" },
                  { icon: <FaCalendarAlt />, gradient: "bg-gradient-to-br from-red-400 to-red-600" },
                  { icon: <FaBolt />, gradient: "bg-gradient-to-br from-yellow-400 to-yellow-600" },
                  { icon: <FaMusic />, gradient: "bg-gradient-to-br from-purple-400 to-indigo-600" },
                  { icon: <FaCamera />, gradient: "bg-gradient-to-br from-pink-400 to-rose-600" },
                  { icon: <FaGamepad />, gradient: "bg-gradient-to-br from-violet-400 to-purple-600" },
                  { icon: <FaCoffee />, gradient: "bg-gradient-to-br from-amber-600 to-amber-800" },
                  { icon: <FaSearch />, gradient: "bg-gradient-to-br from-cyan-400 to-blue-600" },
                  { icon: <FaBell />, gradient: "bg-gradient-to-br from-orange-400 to-orange-600" },
                  { icon: <FaUser />, gradient: "bg-gradient-to-br from-slate-500 to-slate-700" },
                  { icon: <FaCompass />, gradient: "bg-gradient-to-br from-teal-400 to-teal-600" },
                  { icon: <FaRocket />, gradient: "bg-gradient-to-br from-orange-500 to-pink-600", highlight: true, isVicinity: true },
                  { icon: <FaWifi />, gradient: "bg-gradient-to-br from-cyan-400 to-cyan-600" },
                  { icon: <FaStar />, gradient: "bg-gradient-to-br from-yellow-400 to-yellow-600" },
                  { icon: <FaUserFriends />, gradient: "bg-gradient-to-br from-rose-400 to-rose-600" },
                  { icon: <FaTag />, gradient: "bg-gradient-to-br from-lime-400 to-lime-600" },
                ].map((app, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex flex-col items-center gap-2"
                    animate={app.isVicinity ? {
                      scale: [1, 1.15, 1],
                      y: [0, -8, 0]
                    } : {}}
                    transition={app.isVicinity ? {
                      duration: 0.8,
                      repeat: Infinity,
                      repeatType: "reverse"
                    } : {}}
                  >
                    <motion.div 
                      className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white text-2xl shadow-xl ${app.gradient} ${app.highlight ? 'ring-2 ring-orange-400' : ''}`}
                      animate={app.isVicinity ? {
                        boxShadow: [
                          "0 8px 24px rgba(249,115,22,0.3)",
                          "0 12px 32px rgba(249,115,22,0.6)",
                          "0 8px 24px rgba(249,115,22,0.3)"
                        ]
                      } : {}}
                      transition={app.isVicinity ? {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      } : {}}
                    >
                      {app.icon}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                className="mt-8 text-center"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-gray-400 text-xs font-medium">Tap Vicinity to explore</p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0, 0.5, 1, 1, 1]
              }}
              transition={{ duration: 5, times: [0, 0.3, 0.35, 0.42, 0.5, 1], ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] overflow-hidden flex flex-col"
            >
              <motion.div 
                className="bg-black/60 px-4 py-2.5 border-b border-orange-500/20 backdrop-blur-md flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 0.5, 1, 1, 1] }}
                transition={{ duration: 5, times: [0, 0.3, 0.35, 0.42, 0.5, 1] }}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0,0,256,256" className="w-6 h-6">
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
                    <div>
                      <h2 className="text-white text-sm font-bold">Vicinity</h2>
                      <p className="text-xs text-gray-400">Local Discovery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-xs text-gray-400">Live</span>
                  </div>
              </motion.div>

              <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#1a1a1a]/50 to-[#0a0a0a]/80 flex">
                
                <div className="w-40 bg-black/40 backdrop-blur-md border-r border-orange-500/20 p-2 flex flex-col gap-2">
                  
                  <motion.div
                    className="bg-black/50 backdrop-blur-md border border-orange-500/30 rounded-lg p-2 flex-shrink-0"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: [0, 0, 0, 1, 1, 1], x: [0, 0, 0, 0, 0, 0] }}
                    transition={{ duration: 5, times: [0, 0.3, 0.4, 0.5, 0.6, 1] }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-orange-400 font-bold text-xs uppercase tracking-wider">Scanning</p>
                      <motion.div 
                        className="w-1.5 h-1.5 rounded-full bg-green-400"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Radius</span>
                        <span className="text-white font-bold text-xs">2.5 km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Accuracy</span>
                        <span className="text-green-400 font-bold text-xs">98%</span>
                      </div>
                      <div className="w-full bg-gray-700/30 rounded-full h-1 mt-1">
                        <motion.div 
                          className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full"
                          animate={{ width: ["0%", "98%"] }}
                          transition={{ duration: 2, delay: 4.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-black/50 backdrop-blur-md border border-pink-500/30 rounded-lg p-2 flex-shrink-0"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: [0, 0, 0, 1, 1, 1], x: [0, 0, 0, 0, 0, 0] }}
                    transition={{ duration: 5, times: [0, 0.3, 0.4, 0.5, 0.6, 1] }}
                  >
                    <p className="text-pink-400 font-bold text-xs uppercase tracking-wider mb-1">Signal</p>
                    <div className="flex gap-0.5">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gray-700/30 rounded-sm"
                          style={{ height: `${16 + i * 6}px` }}
                          animate={{ 
                            backgroundColor: i < 3 ? ["rgba(249,115,22,0.3)", "rgba(249,115,22,0.8)", "rgba(249,115,22,0.3)"] : undefined
                          }}
                          transition={{ 
                            duration: 0.6, 
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        >
                          {i < 3 && <div className="w-full h-full bg-orange-500 rounded-sm" />}
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Strong</p>
                  </motion.div>

                  <motion.div
                    className="bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-lg p-2 flex-shrink-0"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: [0, 0, 0, 1, 1, 1], x: [0, 0, 0, 0, 0, 0] }}
                    transition={{ duration: 5, times: [0, 0.3, 0.4, 0.5, 0.6, 1] }}
                  >
                    <p className="text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">Activity</p>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">📍 Detected</span>
                        <motion.span 
                          className="text-white font-bold text-xs"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          4
                        </motion.span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">⭐ Top Rated</span>
                        <span className="text-yellow-400 font-bold text-xs">4.8</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="flex-1 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 opacity-15"
                    style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0, 0.1, 0.15, 0.15, 0.15] }}
                    transition={{ duration: 5, times: [0, 0.3, 0.35, 0.42, 0.5, 1] }}
                  />

                  <svg className="absolute inset-0 w-full h-full" style={{ opacity: 1 }}>
                    <defs>
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                      <filter id="innerGlow">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                      <radialGradient id="radarGradient" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.1"/>
                      </radialGradient>
                    </defs>
                    
                    <motion.circle 
                      cx="50%" 
                      cy="50%" 
                      fill="none" 
                      stroke="#ff8c42" 
                      strokeWidth="2" 
                      opacity="0.6"
                      filter="url(#glow)"
                      animate={{
                        r: ["5%", "35%"],
                        opacity: [0.8, 0],
                        strokeWidth: [2, 0.5]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                    <motion.circle 
                      cx="50%" 
                      cy="50%" 
                      fill="none" 
                      stroke="#ff6b35" 
                      strokeWidth="1.5" 
                      opacity="0.5"
                      filter="url(#glow)"
                      animate={{
                        r: ["5%", "35%"],
                        opacity: [0.6, 0],
                        strokeWidth: [1.5, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 0.5
                      }}
                    />
                    
                    <circle cx="50%" cy="50%" r="15%" fill="none" stroke="url(#radarGradient)" strokeWidth="1.5" opacity="0.7" filter="url(#innerGlow)" />
                    <circle cx="50%" cy="50%" r="30%" fill="none" stroke="#ff6b35" strokeWidth="1" opacity="0.4" />
                    <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#ff6b35" strokeWidth="1" opacity="0.2" />
                    <circle cx="50%" cy="50%" r="60%" fill="none" stroke="#444" strokeWidth="0.5" opacity="0.3" />
                  </svg>

                  <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.5 }}>
                    <motion.line 
                      x1="50%" 
                      y1="10%" 
                      x2="50%" 
                      y2="90%" 
                      stroke="#ff8c42" 
                      strokeWidth="0.8"
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.line 
                      x1="10%" 
                      y1="50%" 
                      x2="90%" 
                      y2="50%" 
                      stroke="#ff8c42" 
                      strokeWidth="0.8"
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                    />
                  </svg>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <motion.div 
                      style={{ scale: pulseScale }}
                      className="absolute inset-0 w-5 h-5 rounded-full border-2 border-orange-500 opacity-50 -left-1 -top-1"
                    />
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-300 to-orange-600 shadow-[0_0_30px_rgba(249,115,22,1), 0_0_50px_rgba(249,115,22,0.8), inset_0_0_10px_rgba(255,255,255,0.5)]" />
                    <motion.div 
                      animate={{ scale: [1, 2, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="absolute inset-0 w-3 h-3 rounded-full border-2 border-orange-400 opacity-40"
                    />
                    <motion.div 
                      animate={{ scale: [1, 2.5, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 w-3 h-3 rounded-full border border-orange-300 opacity-20"
                    />
                  </div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none">
                    <motion.div 
                      style={{ rotate: radarRotate }}
                      className="w-full h-full"
                    >
                      <div className="absolute top-0 left-1/2 w-1.5 h-1/2 bg-gradient-to-b from-orange-400 via-orange-500 to-transparent -translate-x-1/2 opacity-90 shadow-[0_0_20px_rgba(249,115,22,1), 0_0_40px_rgba(249,115,22,0.6)]" />
                      <div className="absolute top-0 left-1/2 w-3 h-1/2 bg-gradient-to-b from-orange-300 via-transparent to-transparent -translate-x-1/2 opacity-30 blur-sm shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                      <div className="absolute top-0 left-1/2 w-6 h-1/2 bg-gradient-to-b from-orange-200 via-transparent to-transparent -translate-x-1/2 opacity-15" />
                    </motion.div>
                  </div>

                  {[
                    { x: '10%', y: '0%', label: "Joe's Pizza", icon: <FaStore />, color: 'bg-blue-500', desc: 'Italian • 4.8★', distance: '2.7 mi' },
                    { x: '65%', y: '15%', label: 'Star Cafe', icon: <FaCoffee />, color: 'bg-pink-500', desc: 'Coffee • 4.9★', distance: '1.8 mi' },
                    { x: '20%', y: '55%', label: 'Book Store', icon: <FaBook />, color: 'bg-cyan-500', desc: 'Retail • 4.6★', distance: '2.4 mi' },
                    { x: '70%', y: '60%', label: 'Metro Gym', icon: <FaDumbbell />, color: 'bg-purple-500', desc: 'Fitness • 4.7★', distance: '3.1 mi' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="absolute z-30 flex flex-col items-center"
                      style={{ left: item.x, top: item.y, transform: 'translate(-50%, -50%)' }}
                      initial={{ scale: 0, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ 
                        delay: 4.3 + (0.15 * i),
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <motion.div 
                        className={`absolute w-12 h-12 rounded-2xl ${item.color} opacity-20 blur-lg -z-10`}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                      
                      <motion.div 
                        className={`w-9 h-9 rounded-2xl ${item.color} flex items-center justify-center text-white text-sm shadow-lg mb-1 border border-white/20`}
                        animate={{
                          boxShadow: [
                            `0 0 10px ${item.color}`,
                            `0 0 20px ${item.color}`,
                            `0 0 10px ${item.color}`
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      >
                        {item.icon}
                      </motion.div>
                      <div className="bg-white/95 px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                        <p className="text-xs font-bold text-gray-900 text-center">{item.label}</p>
                        <p className="text-xs text-gray-600 text-center">{item.desc}</p>
                      </div>
                      <div className="text-xs text-gray-300 mt-0.5 font-medium">📍 {item.distance}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-[#4a4a4a] rounded-full z-20" />
      </div>
    </div>
  )
}

const TiltCard = ({ children, className = "" }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [1.5, -1.5])
  const rotateY = useTransform(x, [-100, 100], [-1.5, 1.5])

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const xPct = (event.clientX - rect.left) / rect.width - 0.5
    const yPct = (event.clientY - rect.top) / rect.height - 0.5
    x.set(xPct * rect.width)
    y.set(yPct * rect.height)
  }

  return (
    <motion.div onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0) }} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className={`relative transition-all duration-200 ease-out ${className}`}>
      {children}
    </motion.div>
  )
}

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-12 px-6 overflow-hidden bg-white dark:bg-black transition-colors duration-300">
      <GridBackground />
      
      <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-8 tracking-tighter drop-shadow-2xl transition-colors duration-300">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
              Discover
            </span>{" "}
            Nearby. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
              Connect
            </span>{" "}
            Locally. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
              Decide
            </span>{" "}
            Smarter.
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-md leading-relaxed transition-colors duration-300">
            The all-in-one platform with AI at its core, discovering local gems, building real community connections, and making smarter decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/browse"
              className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-xl border border-gray-200 text-center"
            >
              Start Exploring
            </a>
            <a
              href="/signup"
              className="px-8 py-4 bg-gray-100 text-gray-900 border border-gray-300 dark:bg-white/10 dark:text-white dark:border-white/20 font-bold rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-all text-center shadow-lg"
            >
              Join as a Business
            </a>
          </div>
        </motion.div>

        <motion.div className="flex justify-center lg:justify-end">
          <TiltCard className="w-full max-w-3xl aspect-4/3 z-10">
            <AnimatedIPadDemo />
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
};


const SectionBackgroundGlow = ({ children, className, id }) => (
  <section id={id} className={`relative py-24 px-6 overflow-hidden bg-white dark:bg-black transition-colors duration-300 ${className}`}>
    <div className="absolute inset-0 -z-40 bg-white dark:bg-black" />
    <div className="absolute inset-0 opacity-5 dark:opacity-10 -z-40" style={{ backgroundImage: 'radial-gradient(circle, #666 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
    {children}
  </section>
)

const AIBenefitsSection = () => {
  const time = useTime()
  const scale = useTransform(time, [0, 4000, 8000], [1, 1.2, 1])

  return (
    <section id="features" className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-black transition-colors duration-300 flex items-center py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      {/* Enhanced Animated Background */}
      <motion.div 
        style={{ scale }} 
        className="absolute top-10 left-10 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-gradient-to-tr from-orange-500/30 to-purple-600/30 rounded-full blur-[120px]" 
      />

      {/* Premium Background */}
      <div className="absolute inset-0 -z-20">
        {/* Grid Pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }}
          animate={{ backgroundPosition: ['0px 0px', '100px 100px'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-10 left-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-[120px]"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div
          className="absolute bottom-0 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-to-tl from-purple-600/15 to-transparent rounded-full blur-[120px]"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Center Glow */}
        <motion.div
          className="absolute top-10 left-10 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-10 md:mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/50 mb-3 sm:mb-4">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Powered by AI</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
            Smarter Local Discovery <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">&</span> Growth
          </h2>
          
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
            AI-powered tools for users to discover and for businesses to grow
          </p>
        </motion.div>

        {/* Premium Features Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          
          {/* Feature 1: AI Smart Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: 0 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative bg-white dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-cyan-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 overflow-hidden hover:border-cyan-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10"
          >
            <div className="absolute -top-20 -right-20 w-40 sm:w-56 h-40 sm:h-56 bg-cyan-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-cyan-500/15 to-transparent rounded-2xl sm:rounded-3xl" />
            
            <div className="relative z-10">
              <motion.div 
                className="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-cyan-500/40 to-cyan-500/15 border border-cyan-500/60 flex items-center justify-center text-cyan-600 dark:text-cyan-200 text-base sm:text-lg mb-3 sm:mb-4 shadow-lg shadow-cyan-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <FaBrain />
              </motion.div>
              
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-200 transition-colors">Smart Search</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed">
                Search using natural language. "cozy coffee with WiFi open late" finds exactly what you want instantly.
              </p>
              
              <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-700 dark:text-cyan-300 font-medium hover:bg-cyan-500/15 transition-colors">
                <FaBolt className="text-xs" />
                <span>AI Context Aware</span>
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Real Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: 0.05 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative bg-white dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-pink-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 overflow-hidden hover:border-pink-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-pink-500/10"
          >
            <div className="absolute -top-20 -right-20 w-40 sm:w-56 h-40 sm:h-56 bg-pink-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-pink-500/15 to-transparent rounded-2xl sm:rounded-3xl" />
            
            <div className="relative z-10">
              <motion.div 
                className="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-pink-500/40 to-pink-500/15 border border-pink-500/60 flex items-center justify-center text-pink-600 dark:text-pink-200 text-base sm:text-lg mb-3 sm:mb-4 shadow-lg shadow-pink-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <FaStar />
              </motion.div>
              
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-200 transition-colors">Verified Reviews</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed">
                Real feedback from verified community members. Sign-in required to ensure authentic, trustworthy insights.
              </p>
              
              <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg bg-pink-500/10 border border-pink-500/30 text-xs text-pink-700 dark:text-pink-300 font-medium hover:bg-pink-500/15 transition-colors">
                <FaCheck className="text-xs" />
                <span>Sign-In Protected</span>
              </div>
            </div>
          </motion.div>

          {/* Feature 3: Review Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative bg-white dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-purple-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 overflow-hidden hover:border-purple-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10"
          >
            <div className="absolute -top-20 -right-20 w-40 sm:w-56 h-40 sm:h-56 bg-purple-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-purple-500/15 to-transparent rounded-2xl sm:rounded-3xl" />
            
            <div className="relative z-10">
              <motion.div 
                className="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-purple-500/40 to-purple-500/15 border border-purple-500/60 flex items-center justify-center text-purple-600 dark:text-purple-200 text-base sm:text-lg mb-3 sm:mb-4 shadow-lg shadow-purple-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <FaChartLine />
              </motion.div>
              
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-200 transition-colors">Review Analytics</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed">
                For businesses: AI analyzes customer feedback to show sentiment, trends, and exactly what to improve.
              </p>
              
              <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-500/15 transition-colors">
                <FaBrain className="text-xs" />
                <span>AI-Powered Insights</span>
              </div>
            </div>
          </motion.div>

          {/* Feature 4: AI Descriptions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: 0.15 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative bg-white dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-emerald-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 overflow-hidden hover:border-emerald-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10"
          >
            <div className="absolute -top-20 -right-20 w-40 sm:w-56 h-40 sm:h-56 bg-emerald-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/15 to-transparent rounded-2xl sm:rounded-3xl" />
            
            <div className="relative z-10">
              <motion.div 
                className="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-emerald-500/40 to-emerald-500/15 border border-emerald-500/60 flex items-center justify-center text-emerald-600 dark:text-emerald-200 text-base sm:text-lg mb-3 sm:mb-4 shadow-lg shadow-emerald-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <FaBolt />
              </motion.div>
              
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-200 transition-colors">AI Descriptions</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed">
                For businesses: Auto-generate compelling profiles that attract your ideal customers and stand out.
              </p>
              
              <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-500/15 transition-colors">
                <FaRocket className="text-xs" />
                <span>Auto-Generated Content</span>
              </div>
            </div>
          </motion.div>

          {/* Feature 5: Easy Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative bg-white dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-orange-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 overflow-hidden hover:border-orange-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-500/10"
          >
            <div className="absolute -top-20 -right-20 w-40 sm:w-56 h-40 sm:h-56 bg-orange-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-orange-500/15 to-transparent rounded-2xl sm:rounded-3xl" />
            
            <div className="relative z-10">
              <motion.div 
                className="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-orange-500/40 to-orange-500/15 border border-orange-500/60 flex items-center justify-center text-orange-600 dark:text-orange-200 text-base sm:text-lg mb-3 sm:mb-4 shadow-lg shadow-orange-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <FaRocket />
              </motion.div>
              
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-200 transition-colors">Easy Updates</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed">
                For businesses: Update hours, photos, specials instantly. Keep users informed in real-time with fresh info.
              </p>
              
              <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs text-orange-700 dark:text-orange-300 font-medium hover:bg-orange-500/15 transition-colors">
                <FaUser className="text-xs" />
                <span>Real-Time Sync</span>
              </div>
            </div>
          </motion.div>

          {/* Feature 6: AI Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: 0.25 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative bg-white dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-blue-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 overflow-hidden hover:border-blue-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="absolute -top-20 -right-20 w-40 sm:w-56 h-40 sm:h-56 bg-blue-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-blue-500/15 to-transparent rounded-2xl sm:rounded-3xl" />
            
            <div className="relative z-10">
              <motion.div 
                className="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-blue-500/40 to-blue-500/15 border border-blue-500/60 flex items-center justify-center text-blue-600 dark:text-blue-200 text-base sm:text-lg mb-3 sm:mb-4 shadow-lg shadow-blue-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <FaCommentDots />
              </motion.div>
              
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">AI Chat Help</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed">
                24/7 AI assistant available on every page to answer questions and guide you through Vicinity instantly.
              </p>
              
              <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-500/15 transition-colors">
                <FaBell className="text-xs" />
                <span>Always Available</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const navItems = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Community', href: '#community' }
]

const HowItWorks = () => {
  const time = useTime()
  const scale = useTransform(time, [0, 4000, 8000], [1, 1.2, 1])

  return (
    <SectionBackgroundGlow id="how-it-works" className="bg-white dark:bg-black relative py-16 sm:py-20 md:py-24 px-6 overflow-hidden transition-colors duration-300">
      {/* Enhanced Animated Background */}
      <motion.div 
        style={{ scale }} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-gradient-to-tr from-orange-500/30 to-purple-600/30 rounded-full blur-[120px]" 
      />

      {/* Premium Background */}
      <div className="absolute inset-0 -z-20">
        {/* Grid Pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }}
          animate={{ backgroundPosition: ['0px 0px', '100px 100px'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-10 left-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-[120px]"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div
          className="absolute bottom-0 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-to-tl from-purple-600/15 to-transparent rounded-full blur-[120px]"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Center Glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 mb-3 sm:mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Simple Process</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Works</span>
          </h2>
          
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
            Three simple steps to transform how you discover and connect with your local community
          </p>
        </motion.div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 sm:gap-5 md:gap-6 h-auto md:h-auto">
          {/* Step 1: Discover */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} 
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="md:col-span-1 md:row-span-2 group relative bg-white dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-blue-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 overflow-hidden hover:border-blue-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between"
          >
            <div className="absolute -top-20 -right-20 w-40 sm:w-56 h-40 sm:h-56 bg-blue-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-blue-500/15 to-transparent rounded-2xl sm:rounded-3xl" />
            
            <div className="relative z-10">
              <motion.div 
                className="inline-flex items-center justify-center w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-blue-500/40 to-blue-500/15 border border-blue-500/60 mb-3 sm:mb-4 shadow-lg shadow-blue-500/30"
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-blue-600 dark:text-blue-200 font-black text-base sm:text-lg">1</span>
              </motion.div>
              
              <motion.div 
                className="w-12 sm:w-13 md:w-14 h-12 sm:h-13 md:h-14 rounded-lg sm:rounded-2xl bg-gradient-to-br from-blue-500/40 to-blue-500/15 border border-blue-500/60 flex items-center justify-center text-blue-600 dark:text-blue-200 text-base sm:text-lg mb-3 sm:mb-4 shadow-lg shadow-blue-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <FaCompass />
              </motion.div>
              
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">Discover</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Explore your city with our smart feed. Find hidden gems, exclusive events, and top-rated spots tailored to your interests.
              </p>
            </div>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors">
                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />
                <span>Personalized Feed</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors">
                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />
                <span>Live Local Events</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors">
                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />
                <span>Exclusive Deals</span>
              </div>
            </div>
          </motion.div>

          {/* Step 2: Connect */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} 
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="md:col-span-2 group relative bg-white dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-purple-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 overflow-hidden hover:border-purple-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10"
          >
            <div className="absolute -top-20 -right-20 w-40 sm:w-56 h-40 sm:h-56 bg-purple-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-purple-500/15 to-transparent rounded-2xl sm:rounded-3xl" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <motion.div 
                  className="inline-flex items-center justify-center w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-purple-500/40 to-purple-500/15 border border-purple-500/60 mb-2 sm:mb-3 shadow-lg shadow-purple-500/30"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-purple-600 dark:text-purple-200 font-black text-base sm:text-lg">2</span>
                </motion.div>
                
                <motion.div 
                  className="w-12 sm:w-13 md:w-14 h-12 sm:h-13 md:h-14 rounded-lg sm:rounded-2xl bg-gradient-to-br from-purple-500/40 to-purple-500/15 border border-purple-500/60 flex items-center justify-center text-purple-600 dark:text-purple-200 text-base sm:text-lg shadow-lg shadow-purple-500/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaCommentDots />
                </motion.div>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-200 transition-colors">Connect Directly</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Message business owners directly, ask questions, make reservations, and get real-time updates on your favorite spots.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Step 3: Share */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }} 
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="md:col-span-2 group relative bg-white dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-orange-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 overflow-hidden hover:border-orange-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-500/10"
          >
            <div className="absolute -top-20 -right-20 w-40 sm:w-56 h-40 sm:h-56 bg-orange-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-orange-500/15 to-transparent rounded-2xl sm:rounded-3xl" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <motion.div 
                  className="inline-flex items-center justify-center w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-orange-500/40 to-orange-500/15 border border-orange-500/60 mb-2 sm:mb-3 shadow-lg shadow-orange-500/30"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-orange-600 dark:text-orange-200 font-black text-base sm:text-lg">3</span>
                </motion.div>
                
                <motion.div 
                  className="w-12 sm:w-13 md:w-14 h-12 sm:h-13 md:h-14 rounded-lg sm:rounded-2xl bg-gradient-to-br from-orange-500/40 to-orange-500/15 border border-orange-500/60 flex items-center justify-center text-orange-600 dark:text-orange-200 text-base sm:text-lg shadow-lg shadow-orange-500/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaStar />
                </motion.div>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-200 transition-colors">Share the Vibe</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Leave verified reviews, upload photos, and earn badges. Help your community grow by sharing your authentic experiences.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Get Started Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-center mt-12 sm:mt-14 md:mt-16"
        >
          <a href="/signup">
            <button className="px-8 sm:px-12 py-4 sm:py-5 bg-gray-900 dark:bg-white text-white dark:text-black text-lg sm:text-xl font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(0,0,0,0.3)] dark:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Get Started Now
            </button>
          </a>
        </motion.div>
      </div>
    </SectionBackgroundGlow>
  )
}
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)
  const time = useTime()
  const scale = useTransform(time, [0, 4000, 8000], [1, 1.2, 1])

  const faqs = [
    {
      question: "What is Vicinity?",
      answer: "Vicinity is a platform designed to empower local communities by connecting people with nearby opportunities, events, and services through AI-powered discovery."
    },
    {
      question: "How does Vicinity use AI?",
      answer: "Our AI technology analyzes your location and preferences to surface the most relevant local opportunities, making community discovery personalized and effortless."
    },
    {
      question: "Is my location data safe?",
      answer: "Yes, your privacy is our priority. All location data is encrypted and handled according to our privacy policy. You have full control over your location sharing settings."
    },
    {
      question: "How much does Vicinity cost?",
      answer: "Vicinity offers a free tier with essential features, plus premium plans for individuals and businesses looking for advanced features and priority support."
    },
    {
      question: "Can businesses use Vicinity?",
      answer: "Absolutely! Vicinity helps local businesses connect with their community through targeted visibility and engagement tools designed for growth."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up with your email or social account, set your location preferences, and start discovering local opportunities tailored just for you."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="bg-white dark:bg-black relative py-12 px-6 overflow-hidden transition-colors duration-300 min-h-screen flex items-center">
      {/* Enhanced Animated Background - Cut off at bottom-left */}
      <motion.div 
        style={{ scale }} 
        className="absolute -bottom-40 -left-40 sm:-bottom-56 sm:-left-56 md:-bottom-64 md:-left-64 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-gradient-to-tr from-orange-500/30 to-purple-600/30 rounded-full blur-[120px]" 
      />

      {/* Premium Background */}
      <div className="absolute inset-0 -z-20">
        {/* Grid Pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }}
          animate={{ backgroundPosition: ['0px 0px', '100px 100px'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-10 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-[120px]"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div
          className="absolute top-1/4 left-1/3 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-to-tl from-purple-600/15 to-transparent rounded-full blur-[120px]"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Center Glow */}
        <motion.div
          className="absolute top-1/3 right-1/3 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="w-full max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/50 mb-3">
            <div className="w-2 h-2 rounded-full bg-orange-600 dark:bg-orange-400 animate-pulse" />
            <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Have Questions?</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">Questions</span>
          </h2>
          
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto px-2">
            Everything you need to know about Vicinity
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="group relative bg-white dark:bg-black/60 backdrop-blur-xl border border-gray-300 dark:border-orange-500/20 rounded-xl sm:rounded-2xl overflow-hidden hover:border-orange-500/60 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-orange-500/10"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br from-orange-500/15 to-transparent rounded-xl sm:rounded-2xl" />

              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left relative z-10 group/button"
              >
                <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white pr-4 group-hover/button:text-orange-600 dark:group-hover/button:text-orange-300 transition-colors">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 text-orange-500 dark:text-orange-400 text-sm"
                >
                  <FaChevronDown />
                </motion.div>
              </button>

              {/* Answer */}
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 dark:border-orange-500/10 overflow-hidden relative z-10"
                  >
                    <p className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
const Footer = () => (
  <footer className="relative py-20 border-t border-gray-300 dark:border-white/10 text-gray-900 dark:text-white z-10 bg-white dark:bg-[#050505] transition-colors duration-300">
    <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
      <div>
        <div className="mb-6"><VicinityLogo /></div>
        <p className="text-gray-600 dark:text-gray-500 text-sm mb-6">Empowering local communities.</p>
        <div className="flex gap-4 text-gray-600 dark:text-gray-400"><FaTwitter className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors" /><FaInstagram className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors" /><FaLinkedin className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors" /></div>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-gray-900 dark:text-white">Navigation</h4>
        <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          {navItems.map(item => (
            <li key={item.name}><a href={item.href} className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">{item.name}</a></li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-gray-900 dark:text-white">Company</h4>
        <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400"><li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">About Us</a></li><li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Contact</a></li></ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-gray-900 dark:text-white">Legal</h4>
        <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400"><li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Privacy</a></li><li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Terms</a></li></ul>
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-gray-300 dark:border-white/5 text-center text-xs text-gray-600 dark:text-gray-600">© 2025 Vicinity Inc. All rights reserved.</div>
  </footer>
)

export default function LandingPage() {
  return (
    <main className="relative bg-white dark:bg-black font-sans selection:bg-orange-500/50 overflow-x-hidden transition-colors duration-300">
      <Navbar showThemeToggle={false} />
      <Hero />
      <AIBenefitsSection />
      <HowItWorks />
      <FAQ />
      <Footer />
    </main>
  )
}



