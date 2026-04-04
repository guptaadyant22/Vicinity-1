'use client'


// Saved businesses page displaying the user's bookmarked/favorite businesses.
// Allows removing saved items and navigating to individual business profiles.

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
import UserNavbar from '../../../components/UserNavbar'
import { FogBackground } from '@/components/ui/fog'


const UI = {
  page: 'relative min-h-screen bg-transparent text-slate-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden transition-colors duration-300',
  card: 'bg-white/20 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-[28px] shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition-colors duration-300',
  cardSoft: 'bg-white/12 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/25 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(59,130,246,0.08)] transition-colors duration-300',
  input: 'w-full px-4 py-3 rounded-2xl bg-white/14 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/25 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-400/60 focus:bg-white/20 dark:focus:bg-white/[0.06] transition-all text-sm',
  primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]',
  secondaryButton: 'bg-white/14 dark:bg-white/[0.04] backdrop-blur-2xl hover:bg-white/22 dark:hover:bg-white/[0.07] text-slate-700 dark:text-white border border-white/25 dark:border-white/10',
}


// Stat card with icon, value, and hover glow effect
const StatCard = ({ label, value, icon: Icon, color = 'blue', delay }) => {
  const iconStyleMap = {
    blue: 'bg-blue-500/10 dark:bg-blue-500/10 border-blue-400/20 dark:border-blue-400/20 text-blue-700 dark:text-blue-300',
    indigo: 'bg-indigo-500/10 dark:bg-indigo-500/10 border-indigo-400/20 dark:border-indigo-400/20 text-indigo-700 dark:text-indigo-300',
    cyan: 'bg-cyan-500/10 dark:bg-cyan-500/10 border-cyan-400/20 dark:border-cyan-400/20 text-cyan-700 dark:text-cyan-300',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className={`${UI.cardSoft} group relative p-6`}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/[0.03] to-cyan-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 flex items-center gap-4">
        <div className={`p-3.5 rounded-2xl border ${iconStyleMap[color] || iconStyleMap.blue}`}>
          <Icon size={22} />
        </div>

        <div>
          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight truncate max-w-[160px]">
            {value}
          </p>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mt-1.5">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// Saved businesses page with search, sort, and remove actions
export default function SavedPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()


  const [loading, setLoading] = useState(true)
  const [savedBusinesses, setSavedBusinesses] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')


  // Find the most-saved business category
  const getTopCategory = () => {
    if (savedBusinesses.length === 0) return 'N/A'

    const counts: Record<string, number> = {}
    savedBusinesses.forEach((b) => {
      const type = b.type ? b.type.trim() : 'Other'
      counts[type] = (counts[type] || 0) + 1
    })

    let maxCount = 0
    let winners: string[] = []

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


  const stats = {
    total: savedBusinesses.length,
    topCategory: getTopCategory(),
    categories: new Set(savedBusinesses.map((b) => b.type)).size,
  }


  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])


  useEffect(() => {
    if (!user) return

    const fetchSaved = async () => {
      try {
        setLoading(true)


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


        const ids = fData.map((f) => f.business_id)
        const { data: bData, error: bError } = await supabase
          .from('businesses')
          .select('*')
          .in('id', ids)

        if (bError) throw bError


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


  // Remove a business from favorites
  const handleRemove = async (id) => {
    setSavedBusinesses((prev) => prev.filter((b) => b.id !== id))
    try {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('business_id', id)
    } catch (err) {
      console.error(err)
    }
  }


  // Toggle a business in/out of favorites
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


  // Sign out and redirect to home
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }


  const filteredSaved = savedBusinesses
    .filter((b) => !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
    })

  if (authLoading || !user) {
    return <div className="min-h-screen bg-transparent" />
  }

  return (
    <div className={UI.page}>
      <FogBackground
        className="fixed inset-0 z-0"
        color="#60a5fa"
        darkColor="#2563eb"
        opacity={0.32}
        speed={1}
      />

      <div className="relative z-10">
        <UserNavbar activePage="saved" onLogout={handleLogout} />

        <main className="max-w-7xl mx-auto px-6 py-10 pt-32">
          <section className="mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-[0.9]">
                Your Favorite <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500 dark:from-blue-300 dark:to-cyan-300">
                  Spots
                </span>
              </h1>

              <p className="text-slate-700 dark:text-slate-300 text-lg max-w-2xl leading-relaxed">
                All the places you&apos;ve saved, ready for your next adventure.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard label="Saved Places" value={stats.total} icon={FaHeart} color="blue" delay={0.1} />
              <StatCard label="Favorite Category" value={stats.topCategory} icon={FaFire} color="indigo" delay={0.2} />
              <StatCard label="Categories" value={stats.categories} icon={FaMapMarked} color="cyan" delay={0.3} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-slate-500 dark:text-slate-400 text-sm" />
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <FaTimes size={14} />
                  </motion.button>
                )}
              </div>

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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-96 rounded-[28px] bg-white/10 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/20 dark:border-white/10 animate-pulse"
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
            <div className="p-16 rounded-[28px] bg-white/12 dark:bg-white/[0.03] backdrop-blur-2xl border border-dashed border-white/25 dark:border-white/10 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-white/20 dark:bg-white/[0.05] border border-white/20 dark:border-white/10">
                <FaHeart size={32} className="text-slate-400 dark:text-white/30" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                {searchTerm ? 'No matches found' : 'No saved places yet'}
              </h3>

              <p className="text-slate-700 dark:text-slate-300 mb-8 max-w-md mx-auto">
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
    </div>
  )
}
