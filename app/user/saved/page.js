'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaHeart,
  FaSearch,
  FaTimes,
  FaMapMarked,
  FaFire,
} from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessCard from '../../../components/BusinessCard'
import VicinityLogo from '../../../components/VicinityLogo'
import UserNavbar from '../../../components/UserNavbar'

// --- SHARED UI SYSTEM ---
// Matches the blue glass UI from the current Vicinity site
const UI = {
  page: 'min-h-screen text-slate-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden transition-colors duration-300',
  card: 'bg-white dark:bg-[#0f172a] border border-blue-500/12 dark:border-white/10 rounded-[28px] shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-colors duration-300',
  cardSoft: 'bg-white dark:bg-[#111827] border border-blue-500/10 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none transition-colors duration-300',
  input: 'w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#111827] border border-blue-500/15 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-blue-50/60 dark:focus:bg-[#162033] transition-all text-sm',
  primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]',
  secondaryButton: 'bg-white dark:bg-[#162033] hover:bg-blue-50 dark:hover:bg-[#1c2940] text-slate-700 dark:text-white border border-blue-500/12 dark:border-white/10',
}

// --- PAGE BACKGROUND ---
// Same animated blue glow background used by the current UI
const Background = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none transition-colors duration-300 bg-white dark:bg-[#081120]">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:bg-[#081120]" />

      {/* Main glow */}
      <motion.div
        animate={{ y: [0, -14, 0], scale: [1, 1.05, 1], opacity: [0.2, 0.38, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-8 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-blue-200/70 blur-[140px] dark:bg-blue-500/15"
      />

      {/* Left glow */}
      <motion.div
        animate={{ x: [0, 14, 0], y: [0, 10, 0], opacity: [0.12, 0.24, 0.12] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-[-32px] top-[18%] h-[320px] w-[320px] rounded-full bg-cyan-100/80 blur-[120px] dark:bg-cyan-500/10"
      />

      {/* Right glow */}
      <motion.div
        animate={{ x: [0, -16, 0], y: [0, -8, 0], opacity: [0.12, 0.24, 0.12] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[-32px] top-[10%] h-[340px] w-[340px] rounded-full bg-indigo-100/70 blur-[120px] dark:bg-indigo-500/10"
      />

      {/* Grid */}
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '72px 72px'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(59,130,246,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.22) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(circle at center, black 45%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 100%)',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#081120]" />
    </div>
  )
}

// --- HEADER ---
// Navbar styled to match the current site UI
// Header is now the shared UserNavbar component

// --- STAT CARD ---
// Statistics card for saved page metrics
const StatCard = ({ label, value, icon: Icon, color = 'blue', delay }) => {
  const iconStyleMap = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-300',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300',
    cyan: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-300',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className={`${UI.cardSoft} group relative p-6`}
    >
      {/* Soft hover tint */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/[0.01] to-cyan-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 flex items-center gap-4">
        <div className={`p-3.5 rounded-2xl border ${iconStyleMap[color] || iconStyleMap.blue}`}>
          <Icon size={22} />
        </div>

        <div>
          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight truncate max-w-[160px]">
            {value}
          </p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1.5">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  // Main page state
  const [loading, setLoading] = useState(true)
  const [savedBusinesses, setSavedBusinesses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  // --- STATS LOGIC ---
  // Get the most frequent category with tie handling
  const getTopCategory = () => {
    if (savedBusinesses.length === 0) return 'N/A'

    const counts = {}
    savedBusinesses.forEach((b) => {
      const type = b.type ? b.type.trim() : 'Other'
      counts[type] = (counts[type] || 0) + 1
    })

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

    if (winners.length === 1) return winners[0]
    return 'Diverse'
  }

  // Stats object
  const stats = {
    total: savedBusinesses.length,
    topCategory: getTopCategory(),
    categories: new Set(savedBusinesses.map((b) => b.type)).size,
  }

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  // Load saved businesses
  useEffect(() => {
    if (!user) return

    const fetchSaved = async () => {
      try {
        setLoading(true)

        // Get favorite rows
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

        // Load businesses for favorite ids
        const ids = fData.map((f) => f.business_id)
        const { data: bData, error: bError } = await supabase
          .from('businesses')
          .select('*')
          .in('id', ids)

        if (bError) throw bError

        // Merge business info with save date
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

  // Remove a place from saved
  const handleRemove = async (id) => {
    setSavedBusinesses((prev) => prev.filter((b) => b.id !== id))
    try {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('business_id', id)
    } catch (err) {
      console.error(err)
    }
  }

  // Toggle favorite state
  const handleSave = async (businessId) => {
    try {
      const isSaved = savedBusinesses.some((b) => b.id === businessId)

      if (isSaved) {
        await handleRemove(businessId)
      } else {
        await supabase.from('favorites').insert([{ user_id: user.id, business_id: businessId }])
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Apply search and sorting
  const filteredSaved = savedBusinesses
    .filter((b) => !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(b.saved_at) - new Date(a.saved_at)
    })

  if (authLoading || !user) {
    return <div className="min-h-screen bg-white dark:bg-[#081120] transition-colors" />
  }

  return (
    <div className={UI.page}>
      <Background />

      <UserNavbar activePage="saved" onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-6 py-10 pt-32 relative z-10">
        {/* Hero section */}
        <section className="mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-[0.9]">
              Your Favorite <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Spots
              </span>
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl leading-relaxed">
              All the places you&apos;ve saved, ready for your next adventure.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard label="Saved Places" value={stats.total} icon={FaHeart} color="blue" delay={0.1} />
            <StatCard label="Favorite Category" value={stats.topCategory} icon={FaFire} color="indigo" delay={0.2} />
            <StatCard label="Categories" value={stats.categories} icon={FaMapMarked} color="cyan" delay={0.3} />
          </div>

          {/* Search + sort controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4"
          >
            {/* Search input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-slate-400 dark:text-slate-500 text-sm" />
              </div>

              <input
                type="text"
                placeholder="Search saved places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${UI.input} pl-11 pr-12`}
              />

              {searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <FaTimes size={14} />
                </motion.button>
              )}
            </div>

            {/* Sort select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`${UI.secondaryButton} px-5 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer outline-none min-w-[200px]`}
            >
              <option value="recent">Recently Saved</option>
              <option value="rating">Highest Rated</option>
              <option value="name">A to Z</option>
            </select>
          </motion.div>
        </section>

        {/* Saved places grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 rounded-[28px] bg-white dark:bg-[#111827] border border-blue-500/10 dark:border-white/10 animate-pulse"
              />
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
          <div className="p-16 rounded-[28px] bg-white dark:bg-[#111827] border border-dashed border-blue-200 dark:border-white/10 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-slate-50 dark:bg-[#162033] border border-blue-500/10 dark:border-white/10">
              <FaHeart size={32} className="text-slate-300 dark:text-white/20" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {searchTerm ? 'No matches found' : 'No saved places yet'}
            </h3>

            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {searchTerm
                ? 'Try adjusting your search term.'
                : 'Start exploring to build your collection of favorite spots.'}
            </p>

            <a
              href="/user/dashboard"
              className="inline-block px-8 py-3 rounded-2xl font-bold text-sm transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
            >
              Explore Places
            </a>
          </div>
        )}
      </main>
    </div>
  )
}
