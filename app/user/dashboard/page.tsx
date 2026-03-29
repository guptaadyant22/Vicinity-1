// Community user dashboard with business discovery, filtering, and AI-powered search
// COMPONENTS:
// VICINITY LOGO - Branded logo component with optional text display
// HEADER - Navigation bar with user profile, logout, and navigation links
// STAT CARD - Statistics card displaying key metrics (total places, reviews, ratings, saved)
// SKELETON CARD - Loading placeholder for business cards in grid/list view
// FILTER SECTION - Collapsible filter category with expandable content
// HELPER FUNCTIONS:
// FORMAT BUSINESS TYPE - Converts business type to short display format using category mapping
// IS DEAL EXPIRED - Checks if deal expiry date has passed
// IS BUSINESS OPEN NOW - Determines if business is currently open based on hours
// HANDLE SEARCH INPUT CHANGE - Updates search query with debounced AI search trigger
// HANDLE AI SEARCH - Sends search query to AI API and retrieves matched businesses
// HANDLE SAVE - Saves/unsaves business to user favorites in database
// HANDLE LOGOUT - Signs out user and redirects to home page
// CLEAR ALL FILTERS - Resets all active filters and search state

'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaHeart, FaStar, FaFilter, FaClock, FaUserCheck, FaStore,
  FaGripHorizontal, FaListUl, FaTimes, FaChevronDown,
  FaChevronLeft, FaChevronRight, FaSearch, FaSpinner,
  FaMapMarkerAlt, FaTag,
} from 'react-icons/fa'

import BusinessCard from '../../../components/BusinessCard'
import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import VicinityLogo from '../../../components/VicinityLogo'
import UserNavbar from '../../../components/UserNavbar'

// --- THEMED CONSTANTS ---
const THEME = {
  accent: '#2563eb',
  accentGrad: 'from-blue-600 to-cyan-500',
}

// Shared UI tokens
const UI = {
  page: 'min-h-screen text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-600/25 selection:text-white relative bg-white dark:bg-[#081120] transition-colors duration-300',
  shell: 'bg-white border border-blue-500/12 dark:bg-[#0f172a] dark:border-white/10 shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-colors duration-300',
  shellSoft: 'bg-white dark:bg-[#111827] border border-blue-500/10 dark:border-white/10 transition-colors duration-300',
  input: 'w-full pl-10 pr-12 py-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-blue-500/12 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-sm',
  blueBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]',
  softBtn: 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20',
}

// Adaptive colors for StatCards
const statTheme = {
  blue: {
    iconWrap: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
    glow: 'rgba(59,130,246,0.18)'
  },
  cyan: {
    iconWrap: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20',
    glow: 'rgba(6,182,212,0.16)'
  },
  amber: {
    iconWrap: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
    glow: 'rgba(245,158,11,0.14)'
  },
  rose: {
    iconWrap: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
    glow: 'rgba(244,63,94,0.14)'
  }
}

const CATEGORY_MAP = {
  'restaurant': { short: 'Restaurants' },
  'cafe': { short: 'Cafes' },
  'bakery': { short: 'Bakery' },
  'bar': { short: 'Bars' },
  'clothing': { short: 'Fashion' },
  'electronics': { short: 'Electronics' },
  'home': { short: 'Home' },
  'salon': { short: 'Salon' },
  'gym': { short: 'Fitness' },
  'automotive': { short: 'Auto' },
  'cinema': { short: 'Cinema' },
  'bowling': { short: 'Bowling' },
  'pizza': { short: 'Pizza' },
  'sushi': { short: 'Sushi' },
  'burger': { short: 'Burgers' },
  'coffee': { short: 'Coffee' },
  'dessert': { short: 'Desserts' },
  'fast food': { short: 'Fast Food' },
  'korean': { short: 'Korean' },
  'japanese': { short: 'Japanese' },
}

const formatBusinessType = (type: string) => {
  if (!type) return 'Other'

  const lowercase = type.toLowerCase().trim()

  if (CATEGORY_MAP[lowercase]) {
    return CATEGORY_MAP[lowercase].short
  }

  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (lowercase.includes(key) || key.includes(lowercase)) {
      return value.short
    }
  }

  if (type.length > 12) {
    return type.substring(0, 10) + '..'
  }

  return type
}

// HELPER FUNCTION TO CHECK IF DEAL IS EXPIRED
const isDealExpired = (expiryDate: string | null) => {
  if (!expiryDate) return false
  const now = new Date()
  const expiry = new Date(expiryDate)
  return expiry < now
}

// Header is now the shared UserNavbar component

// Stat card
interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  delay: number;
}

const StatCard = ({ label, value, icon: Icon, color, delay }: DashboardStatCardProps) => {
  const t = statTheme[color as keyof typeof statTheme] || statTheme.blue
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className={`group relative p-6 rounded-[24px] overflow-hidden ${UI.shell} transition-all hover:bg-slate-50 dark:hover:bg-[#162033]`}
    >
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[70px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-multiply dark:mix-blend-normal"
        style={{ background: `radial-gradient(circle, ${t.glow}, transparent 65%)` }}
      />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`p-3.5 rounded-2xl border backdrop-blur-lg ${t.iconWrap}`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

// Loading skeleton
const SkeletonCard = ({ viewMode }: { viewMode: string }) => (
  <div className={`rounded-[24px] ${UI.shellSoft} overflow-hidden ${viewMode === 'list' ? 'flex h-80' : 'h-[400px]'}`}>
    <div className={`${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'w-full h-56'} bg-gradient-to-br from-slate-100 to-blue-100 dark:from-slate-800 dark:to-slate-900 animate-pulse`} />
    <div className={`${viewMode === 'list' ? 'flex-1 p-6' : 'w-full'} p-5 space-y-3`}>
      <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
)

// Filter section
const FilterSection = ({ title, icon: Icon, children }: { title: string; icon?: React.ComponentType<{ size?: number; className?: string }>; children: React.ReactNode }) => {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="border-t border-blue-500/10 dark:border-white/10 pt-4 first:border-t-0 first:pt-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3 text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={11} className="text-blue-500 dark:text-blue-300" />}
          {title}
        </div>
        <motion.div animate={{ rotate: expanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <FaChevronDown size={10} />
        </motion.div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function UserDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const bgRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [businesses, setBusinesses] = useState([])
  const [businessesWithRatings, setBusinessesWithRatings] = useState([])
  const [userReviews, setUserReviews] = useState([])
  const [savedIds, setSavedIds] = useState(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterOpen, setFilterOpen] = useState(true)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [aiSearchLoading, setAiSearchLoading] = useState(false)
  const [aiSearchResults, setAiSearchResults] = useState(null)
  const [userData, setUserData] = useState(null)
  const [hasDealsFilter, setHasDealsFilter] = useState(false)
  const [businessesWithDeals, setBusinessesWithDeals] = useState(new Set())

  const [categoryFilter, setCategoryFilter] = useState(null)
  const [openNowFilter, setOpenNowFilter] = useState(false)
  const [sortOption, setSortOption] = useState('default')

  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 9

  const [availableCategories, setAvailableCategories] = useState([])

  const debounceTimer = useRef(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    const fetchUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) return

        const userMetadata = authUser.user_metadata || {}
        const fullName = userMetadata.fullname || userMetadata.full_name || 'Traveler'
        const firstName = fullName.split(' ')[0]
        const city = userMetadata.city || ''

        setUserData({
          name: firstName,
          city: city,
        })
      } catch (err) {
        console.error('Error fetching user data:', err)
      }
    }

    fetchUserData()
  }, [user, supabase])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        setLoading(true)

        const { data: bData, error: bError } = await supabase.from('businesses').select('*').limit(100)
        if (bError) throw bError

        const { data: fData, error: fError } = await supabase.from('favorites').select('business_id').eq('user_id', user.id)
        if (fError) throw fError

        const { data: userReviewsData, error: rError } = await supabase.from('reviews').select('*').eq('user_id', user.id)
        if (rError) throw rError

        setUserReviews(userReviewsData || [])

        const formattedBusinesses = (bData || []).map((b) => (
          {
            ...b,
            rating: parseFloat(b.rating) || 0,
            review_count: parseInt(b.review_count) || 0,
            is_open: b.is_open ?? true,
            image_url: b.image_url || b.imageUrl || null,
            type: (b.type || 'Other').trim(),
            created_at: b.created_at || new Date().toISOString(),
          }
        ))

        setBusinesses(formattedBusinesses)
        setSavedIds(new Set((fData || []).map((f) => f.business_id)))

        const categoryCount: Record<string, number> = {}
        formattedBusinesses.forEach(b => {
          const type = b.type
          categoryCount[type] = (categoryCount[type] || 0) + 1
        })

        const topCategories = Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([type]) => type)

        setAvailableCategories(topCategories)

        // FETCH ALL DEALS - MATCHING THE BUSINESS CARD LOGIC
        const dealsWithBusinesses = new Set()

        for (const business of formattedBusinesses) {
          try {
            const { data: deals, error: dealsError } = await supabase
              .from('deals')
              .select('id, title, discount_type, discount_value, is_active, expiry_date')
              .eq('business_id', business.id)
              .eq('is_active', true)
              .order('created_at', { ascending: false })
              .limit(1)

            if (!dealsError && deals && deals.length > 0) {
              const deal = deals[0]

              // CHECK IF DEAL HAS EXPIRED - EXACT SAME LOGIC AS BUSINESS CARD
              if (!isDealExpired(deal.expiry_date)) {
                dealsWithBusinesses.add(business.id)
              }
            }
          } catch (error) {
            console.error(`Error fetching deals for business ${business.id}:`, error)
          }
        }

        setBusinessesWithDeals(dealsWithBusinesses)

        const businessesWithUpdatedRatings = await Promise.all(
          formattedBusinesses.map(async (business) => {
            try {
              const { data: allReviews } = await supabase
                .from('reviews')
                .select('rating')
                .eq('business_id', business.id)

              if (allReviews && allReviews.length > 0) {
                const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0)
                const newAverage = totalRating / allReviews.length
                const newCount = allReviews.length

                return {
                  ...business,
                  rating: newAverage,
                  review_count: newCount,
                }
              }
              return business
            } catch (error) {
              console.error(`Error fetching reviews for business ${business.id}:`, error)
              return business
            }
          })
        )

        setBusinessesWithRatings(businessesWithUpdatedRatings)
      } catch (err) {
        console.error('Data fetch error:', err)
        setBusinessesWithRatings(businesses)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    const channel = supabase.channel(`user-reviews-${user.id}`).on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reviews', filter: `user_id=eq.${user.id}` },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setUserReviews((prev) => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setUserReviews((prev) => prev.map((r) => (r.id === payload.new.id ? payload.new : r)))
        } else if (payload.eventType === 'DELETE') {
          setUserReviews((prev) => prev.filter((r) => r.id !== payload.old.id))
        }
      }
    ).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, supabase])

  const isBusinessOpenNow = (hours: string | Record<string, string> | null) => {
    if (!hours || typeof hours !== 'string') return true

    const todayHours = hours.trim()

    if (todayHours.toLowerCase().includes('24 hours') || todayHours.toLowerCase() === 'open 24 hours') {
      return true
    }

    if (todayHours.toLowerCase() === 'closed') {
      return false
    }

    if (!todayHours.includes(' - ')) {
      return true
    }

    const timeParts = todayHours.split(' - ')
    if (timeParts.length !== 2) {
      return true
    }

    try {
      const parseTime = (timeStr: string) => {
        if (!timeStr || typeof timeStr !== 'string') return null
        try {
          const trimmed = timeStr.trim()
          const [time, period] = trimmed.split(' ')

          if (!time || !period) return null

          const [hours, minutes] = time.split(':').map(Number)

          if (isNaN(hours) || isNaN(minutes)) return null

          const date = new Date()
          let finalHours = hours

          if (period.toUpperCase() === 'PM' && hours !== 12) {
            finalHours = hours + 12
          } else if (period.toUpperCase() === 'AM' && hours === 12) {
            finalHours = 0
          }

          date.setHours(finalHours, minutes, 0, 0)
          return date
        } catch (err) {
          return null
        }
      }

      const now = new Date()
      const openTime = parseTime(timeParts[0])
      const closeTime = parseTime(timeParts[1])

      if (!openTime || !closeTime) {
        return true
      }

      return now >= openTime && now < closeTime
    } catch (err) {
      return true
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (value.trim()) {
      debounceTimer.current = setTimeout(() => {
        handleAiSearch({ preventDefault: () => { } })
      }, 800)
    }
  }

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  const handleAiSearch = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setAiSearchResults(null)
      return
    }

    setAiSearchLoading(true)
    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          businesses: businessesWithRatings,
        }),
      })

      const data = await response.json()
      setAiSearchResults(data.matchedBusinesses || [])
      setCurrentPage(1)
    } catch (error) {
      console.error('AI Search error:', error)
      setAiSearchResults([])
    } finally {
      setAiSearchLoading(false)
    }
  }

  const filteredBusinesses = useMemo(() => {
    let result = aiSearchResults !== null ? [...aiSearchResults] : [...businessesWithRatings]

    if (categoryFilter) {
      result = result.filter(b => b.type === categoryFilter)
    }

    if (openNowFilter) {
      result = result.filter(b => isBusinessOpenNow(b.hours))
    }

    if (hasDealsFilter) {
      result = result.filter(b => businessesWithDeals.has(b.id))
    }

    if (sortOption === 'highest-rated') {
      result.sort((a, b) => {
        const ratingA = parseFloat(a.rating) || 0
        const ratingB = parseFloat(b.rating) || 0
        return ratingB - ratingA
      })
    } else if (sortOption === 'most-reviewed') {
      result.sort((a, b) => {
        const countA = parseInt(a.review_count) || 0
        const countB = parseInt(b.review_count) || 0
        return countB - countA
      })
    } else if (sortOption === 'newest') {
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || 0)
        const dateB = new Date(b.created_at || 0)
        return dateB.getTime() - dateA.getTime()
      })
    }

    return result
  }, [businessesWithRatings, categoryFilter, openNowFilter, sortOption, aiSearchResults, hasDealsFilter, businessesWithDeals])

  const totalPages = Math.max(1, Math.ceil(filteredBusinesses.length / PAGE_SIZE))

  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, openNowFilter, sortOption, aiSearchResults, hasDealsFilter])

  const paginatedBusinesses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredBusinesses.slice(start, start + PAGE_SIZE)
  }, [filteredBusinesses, currentPage])

  const startIndex = (currentPage - 1) * PAGE_SIZE + 1
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredBusinesses.length)

  const handleSave = async (id: string) => {
    if (!user) return
    const newSaved = new Set(savedIds)
    const isSaving = !newSaved.has(id)
    if (isSaving) newSaved.add(id)
    else newSaved.delete(id)
    setSavedIds(newSaved)

    try {
      if (isSaving) await supabase.from('favorites').insert({ user_id: user.id, business_id: id })
      else await supabase.from('favorites').delete().eq('user_id', user.id).eq('business_id', id)
    } catch (err) {
      console.error(err)
      if (isSaving) newSaved.delete(id)
      else newSaved.add(id)
      setSavedIds(new Set(newSaved))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const clearAllFilters = () => {
    setCategoryFilter(null)
    setOpenNowFilter(false)
    setSortOption('default')
    setSearchQuery('')
    setAiSearchResults(null)
    setHasDealsFilter(false)
    setCurrentPage(1)
  }

  const activeFilterCount = (categoryFilter ? 1 : 0) + (openNowFilter ? 1 : 0) + (aiSearchResults !== null ? 1 : 0) + (hasDealsFilter ? 1 : 0)

  const stats = {
    total: businesses.length,
    totalReviews: userReviews.length,
    avgRating: userReviews.length > 0
      ? (userReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / userReviews.length).toFixed(1)
      : '0.0',
    saved: savedIds.size,
  }

  if (authLoading || !user) return <div className="min-h-screen bg-white dark:bg-[#081120] transition-colors" />

  return (
    <div className={UI.page}>
      <UserNavbar activePage="dashboard" onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-6 py-10 pt-32 relative z-10">
        {/* Hero */}
        <section className="mb-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-[0.9]">
              Ready to explore, <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${THEME.accentGrad}`}>
                {userData?.name || 'Traveler'}?
              </span>
            </motion.h1>
            {userData?.city && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 shadow-sm">
                  <FaMapMarkerAlt className="text-blue-600 dark:text-blue-300" size={14} />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{userData.city}</span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <StatCard label="Places" value={stats.total} icon={FaStore} color="blue" delay={0.1} />
            <StatCard label="Your Reviews" value={stats.totalReviews} icon={FaUserCheck} color="cyan" delay={0.2} />
            <StatCard label="Your Avg Rating" value={stats.avgRating} icon={FaStar} color="amber" delay={0.3} />
            <StatCard label="Saved" value={stats.saved} icon={FaHeart} color="rose" delay={0.4} />
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:hidden">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className={`w-full p-3 rounded-2xl ${UI.shell} text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-between`}
            >
              <div className="flex items-center gap-2">
                <FaFilter size={14} />
                <span className="font-bold">Filters</span>
              </div>
              {activeFilterCount > 0 && (
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {(filterOpen || mobileFilterOpen) && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="lg:w-72 flex-shrink-0"
              >
                <div className={`sticky top-28 rounded-[28px] p-6 ${UI.shell} space-y-6`}>
                  <div className="flex items-center justify-between lg:block">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <FaFilter size={12} className="text-blue-500 dark:text-blue-300" /> Filters
                    </h3>
                    {activeFilterCount > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={clearAllFilters}
                        className="text-xs font-bold text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                      >
                        Clear All
                      </motion.button>
                    )}
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>

                  {activeFilterCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl text-xs text-blue-600 dark:text-blue-300 font-bold text-center"
                    >
                      🎯 {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
                    </motion.div>
                  )}

                  {availableCategories.length > 0 && (
                    <FilterSection title="Business Types" icon={FaStore}>
                      <div className="grid grid-cols-2 gap-2">
                        {availableCategories.map((type) => (
                          <button
                            key={type}
                            onClick={() => setCategoryFilter(categoryFilter === type ? null : type)}
                            className={`px-2 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                              categoryFilter === type
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                                : 'bg-slate-50 dark:bg-[#162033] border border-blue-500/10 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-blue-500/20 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {formatBusinessType(type)}
                          </button>
                        ))}
                      </div>
                    </FilterSection>
                  )}

                  <FilterSection title="Sort By">
                    <div className="space-y-2">
                      {[
                        { id: 'default', label: 'Default' },
                        { id: 'highest-rated', label: 'Highest Rated' },
                        { id: 'most-reviewed', label: 'Most Reviewed' },
                        { id: 'newest', label: 'Newest' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSortOption(opt.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            sortOption === opt.id
                              ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-300'
                              : 'bg-slate-50 dark:bg-[#162033] border border-blue-500/10 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-blue-500/20 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </FilterSection>

                  <FilterSection title="Availability">
                    <button
                      onClick={() => setOpenNowFilter(!openNowFilter)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        openNowFilter
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-[#162033] border-blue-500/10 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-blue-500/20 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-sm font-bold flex items-center gap-2">
                        <FaClock size={14} /> Open Now
                      </span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${openNowFilter ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-700'}`}>
                        <motion.div
                          animate={{ left: openNowFilter ? 24 : 4 }}
                          className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm"
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </button>
                  </FilterSection>

                  <FilterSection title="Deals">
                    <button
                      onClick={() => setHasDealsFilter(!hasDealsFilter)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        hasDealsFilter
                          ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-300'
                          : 'bg-slate-50 dark:bg-[#162033] border-blue-500/10 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-blue-500/20 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-sm font-bold flex items-center gap-2">
                        <FaTag size={14} /> Has Deals
                      </span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${hasDealsFilter ? 'bg-blue-500' : 'bg-slate-400 dark:bg-slate-700'}`}>
                        <motion.div
                          animate={{ left: hasDealsFilter ? 24 : 4 }}
                          className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm"
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </button>
                  </FilterSection>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`hidden lg:flex p-2.5 rounded-xl ${UI.shell} text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all`}
                  title="Toggle filters"
                >
                  <FaFilter size={14} />
                </motion.button>

                <h2 className="text-3xl font-black text-slate-900 dark:text-white flex-1">
                  ✨ Discover Nearby
                </h2>

                <div className={`flex gap-2 p-1.5 rounded-2xl ${UI.shell}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-xl transition-all ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                        : 'text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Grid view"
                  >
                    <FaGripHorizontal size={14} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-xl transition-all ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                        : 'text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="List view"
                  >
                    <FaListUl size={14} />
                  </motion.button>
                </div>
              </div>

              <form onSubmit={handleAiSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by taste, mood, cuisine... (try 'tacos', 'cozy coffee', 'healthy breakfast')"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className={UI.input}
                  />
                  {aiSearchLoading ? (
                    <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={16} />
                  ) : (
                    <button
                      type="submit"
                      disabled={!searchQuery.trim() || aiSearchLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaSearch size={16} />
                    </button>
                  )}
                </div>

                {aiSearchResults !== null && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>🤖 AI Search: Found <span className="text-blue-600 dark:text-blue-300 font-bold">{filteredBusinesses.length}</span> results</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAiSearchResults(null)
                        setSearchQuery('')
                      }}
                      className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 font-bold"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </form>

              <div className="flex items-center justify-between px-1">
                <div className="text-sm">
                  <span className="text-slate-500 dark:text-slate-300 font-medium">
                    Showing <span className="text-blue-600 dark:text-blue-300 font-bold">{startIndex}–{endIndex}</span> of <span className="text-slate-900 dark:text-white font-bold">{filteredBusinesses.length}</span>
                  </span>
                </div>
              </div>

              {loading ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} viewMode={viewMode} />)}
                </div>
              ) : filteredBusinesses.length > 0 ? (
                <>
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                    {paginatedBusinesses.map((business) => (
                      <div key={business.id} className="contents">
                        <BusinessCard
                          business={business}
                          isSaved={savedIds.has(business.id)}
                          onSave={handleSave}
                          viewMode={viewMode}
                        />
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-between px-2">
                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1))
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          currentPage === 1
                            ? 'bg-slate-100 dark:bg-[#162033] border border-slate-200 dark:border-white/[0.04] text-slate-400 dark:text-slate-600 cursor-not-allowed'
                            : `${UI.shell} text-slate-600 dark:text-slate-300 hover:border-blue-500/30 hover:text-slate-900 dark:hover:text-white`
                        }`}
                      >
                        <FaChevronLeft size={12} /> Previous
                      </button>

                      <div className="flex items-center gap-1.5">
                        {totalPages <= 7 ? (
                          Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => {
                                setCurrentPage(page)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                page === currentPage
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                                  : 'bg-white dark:bg-[#162033] border border-blue-500/10 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:border-blue-500/20 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              {page}
                            </button>
                          ))
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setCurrentPage(1)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                currentPage === 1
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                                  : 'bg-white dark:bg-[#162033] border border-blue-500/10 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:border-blue-500/20 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              1
                            </button>
                            {currentPage > 3 && (
                              <span className="px-2 text-slate-400">…</span>
                            )}

                            {Array.from(
                              { length: 3 },
                              (_, i) => currentPage - 1 + i
                            )
                              .filter((page) => page > 1 && page < totalPages)
                              .map((page) => (
                                <button
                                  key={page}
                                  onClick={() => {
                                    setCurrentPage(page)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                  }}
                                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                    page === currentPage
                                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                                      : 'bg-white dark:bg-[#162033] border border-blue-500/10 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:border-blue-500/20 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}

                            {currentPage < totalPages - 2 && (
                              <span className="px-2 text-slate-400">…</span>
                            )}

                            <button
                              onClick={() => {
                                setCurrentPage(totalPages)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                currentPage === totalPages
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                                  : 'bg-white dark:bg-[#162033] border border-blue-500/10 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:border-blue-500/20 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          currentPage === totalPages
                            ? 'bg-slate-100 dark:bg-[#162033] border border-slate-200 dark:border-white/[0.04] text-slate-400 dark:text-slate-600 cursor-not-allowed'
                            : `${UI.shell} text-slate-600 dark:text-slate-300 hover:border-blue-500/30 hover:text-slate-900 dark:hover:text-white`
                        }`}
                      >
                        Next <FaChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No businesses found</p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-blue-500/25"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
