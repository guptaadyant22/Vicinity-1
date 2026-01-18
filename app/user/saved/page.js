// User saved places page with search, sort, and display of favorited businesses
// COMPONENTS:
// VICINITY LOGO - Branded logo component with optional text display
// HEADER - Navigation bar with logo, links, profile button, and logout
// STAT CARD - Statistics card displaying key metrics (total saved, top category, category count)
// HELPER FUNCTIONS:
// GET TOP CATEGORY - Calculates most frequent business type with tie-breaking logic (returns "Diverse" on tie)
// HANDLE REMOVE - Removes business from saved list and database
// HANDLE SAVE - Toggles favorite status for a business (save/unsave)
// HANDLE LOGOUT - Signs out user and redirects to home page

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaHeart, FaStar, FaMapMarkerAlt, FaSearch, FaTimes,
  FaMapMarked, FaChartLine, FaPencilAlt, FaFire, FaTag
} from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessCard from '../../../components/BusinessCard'

// --- THEME CONFIGURATION ---
// Define the primary color gradient for the Vicinity brand
const THEME = {
  accentGrad: 'from-orange-500 to-pink-500',
}

// Adaptive colors for StatCards - matches Vicinity theme (orange/purple/rose)
const colorMap = {
  orange: { 
    iconWrap: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/25', 
    glow: 'rgba(255,111,0,0.18)' 
  },
  purple: { 
    iconWrap: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/25', 
    glow: 'rgba(168,85,247,0.16)' 
  },
  rose: { 
    iconWrap: 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/25', 
    glow: 'rgba(244,63,94,0.14)' 
  }
}

// --- VICINITY LOGO (THEMED) ---
// Renders the Vicinity logo with optional text label
const VicinityLogo = ({ className = '', showText = true }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-9 h-9">
      <g className="fill-orange-500" fillRule="nonzero">
        <g transform="translate(256,256) rotate(180) scale(5.33,5.33)">
          <path d="M5,45l4,-11l12,-12l-6,23z"></path>
          <path d="M25,18l8,27h10l-11,-33z"></path>
          <path d="M16.059,14.164l3.941,-11.164h8z"></path>
          <path d="M10.731,29.002l12.269,-12.002v-2l-11.42,11.667z"></path>
          <path d="M15.142,16.429l-2.142,5.571l16.724,-16.275l-0.906,-2.547z"></path>
          <path d="M23.932,14.055l0.445,1.571l6.564,-6.448l-0.556,-1.476z"></path>
        </g>
      </g>
    </svg>
    {showText && <p className="font-black text-gray-900 dark:text-white text-xl tracking-tight leading-none">Vicinity</p>}
  </div>
)

// --- DASHBOARD HEADER ---
// Navigation bar with logo, links, profile button, and logout
const Header = ({ onLogout }) => {
  const router = useRouter()

  return (
    <motion.nav 
      initial={{ y: -100 }} 
      animate={{ y: 0 }} 
      className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4"
    >
      <div className="w-full max-w-5xl bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-gray-200 dark:border-white/15 rounded-2xl p-2 shadow-2xl pointer-events-auto flex items-center justify-between pl-4 pr-2 hover:bg-white/90 dark:hover:bg-black/50 transition-all">
        <VicinityLogo showText={true} />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
          <a href="/user/dashboard" className="hover:text-gray-900 dark:hover:text-white transition-colors relative group">
            Browse
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
          </a>
          <a href="/user/saved" className="text-gray-900 dark:text-white font-bold transition-colors relative group">
            Saved
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500 transition-all" />
          </a>
          <a href="/user/reviews" className="hover:text-gray-900 dark:hover:text-white transition-colors relative group">
            Reviews
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
          </a>
        </div>
        
        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center gap-3">
          {/* PROFILE BUTTON */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/user/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all shadow-md shadow-orange-500/20"
          >
            👤
          </motion.button>

          {/* LOGOUT BUTTON */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-orange-500/20"
          >
            Logout
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}

// --- STAT CARD ---
// Displays a single statistic with icon, label, and value
const StatCard = ({ label, value, icon: Icon, color, delay }) => {
  const t = colorMap[color] || colorMap.orange
  return (
    <motion.div 
      initial={{ opacity: 0, y: 18 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay }} 
      whileHover={{ y: -4 }} 
      className="group relative p-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/15 bg-white/80 dark:bg-black/40 backdrop-blur-2xl shadow-lg hover:shadow-xl transition-all hover:bg-white/90 dark:hover:bg-black/50"
    >
      {/* Animated glow effect on hover */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[70px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:mix-blend-normal mix-blend-multiply" style={{ background: `radial-gradient(circle, ${t.glow}, transparent 65%)` }} />
      <div className="relative z-10 flex items-center gap-4">
        {/* Icon wrapper with theme-matched color */}
        <div className={`p-3.5 rounded-xl border backdrop-blur-lg ${t.iconWrap}`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight truncate max-w-[140px]">{value}</p>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1.5">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  // State management for saved businesses, search, and sorting
  const [loading, setLoading] = useState(true)
  const [savedBusinesses, setSavedBusinesses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  // --- STATS LOGIC (REAL CALCULATION WITH TIE-BREAKING) ---
  // Calculates the top category from saved businesses with tie-breaking logic
  const getTopCategory = () => {
    if (savedBusinesses.length === 0) return 'N/A'
    
    // 1. Build frequency map of business types
    const counts = {}
    savedBusinesses.forEach(b => {
      const type = b.type ? b.type.trim() : 'Other'
      counts[type] = (counts[type] || 0) + 1
    })

    // 2. Find the maximum count and all categories that match it
    let maxCount = 0
    let winners = []

    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count
        winners = [type]
      } else if (count === maxCount) {
        winners.push(type)
      }
    })

    // 3. If there's a clear winner, return it. If tie, return "Diverse"
    if (winners.length === 1) return winners[0]
    return 'Diverse'
  }

  // Calculate statistics for display
  const stats = {
    total: savedBusinesses.length,
    topCategory: getTopCategory(),
    categories: new Set(savedBusinesses.map(b => b.type)).size
  }

  // Redirect to login if user not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  // Fetch saved businesses from database on component mount
  useEffect(() => {
    if (!user) return
    const fetchSaved = async () => {
      try {
        setLoading(true)
        // Fetch user's favorite business IDs
        const { data: fData, error: fError } = await supabase
          .from('favorites')
          .select('business_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fError) throw fError
        if (!fData || fData.length === 0) {
          setSavedBusinesses([])
          return
        }

        // Fetch full business details for each favorite
        const ids = fData.map((f) => f.business_id)
        const { data: bData, error: bError } = await supabase.from('businesses').select('*').in('id', ids)

        if (bError) throw bError

        // Merge business data with saved timestamp
        const businessesWithDate = (bData || []).map((b) => {
          const fav = fData.find((f) => f.business_id === b.id)
          return {
            ...b,
            rating: b.rating || 0,
            image_url: b.image_url || b.imageUrl || null,
            saved_at: fav?.created_at,
          }
        })

        setSavedBusinesses(businessesWithDate)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSaved()
  }, [user, supabase])

  // Remove a business from saved list
  const handleRemove = async (id) => {
    setSavedBusinesses((prev) => prev.filter((b) => b.id !== id))
    try {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('business_id', id)
    } catch (err) {
      console.error(err)
    }
  }

  // Toggle save status for a business
  const handleSave = async (businessId) => {
    try {
      const isSaved = savedBusinesses.some(b => b.id === businessId)
      if (isSaved) {
        await handleRemove(businessId)
      } else {
        await supabase.from('favorites').insert([{ user_id: user.id, business_id: businessId }])
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }

  // Sign out user and redirect to home
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Filter by search term and sort by selected criteria
  const filteredSaved = savedBusinesses
    .filter((b) => !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(b.saved_at) - new Date(a.saved_at) 
    })

  if (authLoading || !user) return <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors" />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-200 font-sans selection:bg-orange-500/25 selection:text-white overflow-x-hidden transition-colors duration-300">
      
      {/* Background Orbs - Changed from blue/purple to orange/pink theme */}
      <div className="fixed -top-40 -left-40 w-96 h-96 md:w-[500px] md:h-[500px] bg-gradient-to-br from-orange-600/30 via-orange-500/25 to-transparent rounded-full blur-[100px] opacity-80 pointer-events-none mix-blend-multiply dark:mix-blend-normal" style={{
        animation: 'float-top-left 12s ease-in-out infinite',
      }} />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 md:w-[500px] md:h-[500px] bg-gradient-to-tl from-pink-600/30 via-rose-500/25 to-transparent rounded-full blur-[100px] opacity-85 pointer-events-none mix-blend-multiply dark:mix-blend-normal" style={{
        animation: 'float-bottom-right 15s ease-in-out infinite',
      }} />

      <style>{`
        @keyframes float-top-left {
          0%, 100% { transform: translate(0px, 0px); opacity: 0.8; }
          50% { transform: translate(40px, 40px); opacity: 1; }
        }
        @keyframes float-bottom-right {
          0%, 100% { transform: translate(0px, 0px); opacity: 0.85; }
          50% { transform: translate(-40px, -40px); opacity: 1; }
        }
      `}</style>

      <Header onLogout={handleLogout} />

      {/* RESTORED: max-w-7xl to match symmetry of other page */}
      <main className="max-w-7xl mx-auto px-6 py-10 pt-32 relative z-10">
        {/* Hero Section */}
        <section className="mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter mb-4 leading-[0.9]">
              Your Favorite <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${THEME.accentGrad}`}>
                Spots
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl leading-relaxed">
              All the places you've saved, ready for your next adventure.
            </p>
          </motion.div>

          {/* Stats with Real Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard label="Saved Places" value={stats.total} icon={FaHeart} color="orange" delay={0.1} />
            <StatCard label="Favorite Category" value={stats.topCategory} icon={FaFire} color="purple" delay={0.2} />
            <StatCard label="Categories" value={stats.categories} icon={FaMapMarked} color="rose" delay={0.3} />
          </div>

          {/* Search & Sort Bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-500 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Search saved places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all shadow-sm"
              />
              {searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <FaTimes size={14} />
                </motion.button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-5 py-3.5 rounded-xl bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white font-bold text-sm hover:border-gray-300 dark:hover:border-white/25 hover:bg-white dark:hover:bg-black/50 transition-all cursor-pointer outline-none shadow-sm"
            >
              <option value="recent">Recently Saved</option>
              <option value="rating">Highest Rated</option>
              <option value="name">A to Z</option>
            </select>
          </motion.div>
        </section>

        {/* Grid - EXACT MATCH to browse page symmetry */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-gray-200 dark:bg-black/40 rounded-2xl animate-pulse border border-gray-300 dark:border-white/15" />
            ))}
          </div>
        ) : filteredSaved.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredSaved.map((business, idx) => (
                <div key={business.id} className="contents">
                  <BusinessCard 
                    business={business} 
                    isSaved={true}
                    onSave={handleSave}
                    viewMode="grid"
                    index={idx}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-32 bg-white/50 dark:bg-black/40 rounded-3xl border border-dashed border-gray-300 dark:border-white/15 backdrop-blur-xl">
            <div className="w-20 h-20 bg-gray-100 dark:bg-black/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-200 dark:border-white/15">
              <FaHeart size={32} className="text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No matches found' : 'No saved places yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm
                ? 'Try adjusting your search term.'
                : 'Start exploring to build your collection of favorite spots.'}
            </p>
            <a
              href="/user/dashboard"
              className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-orange-500/25 transition-all shadow-lg shadow-orange-500/20"
            >
              Explore Places
            </a>
          </div>
        )}
      </main>
    </div>
  )
}
