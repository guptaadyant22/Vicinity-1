// Community user dashboard with business discovery, filtering, and AI-powered search
// COMPONENTS:
// VICINITY LOGO - Branded logo component with optional text display
// ANIMATED BG - Adaptive gradient background with grid pattern and light rays
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
import LightRays from '../../../components/LightRays'
import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'

// --- THEMED CONSTANTS ---
const THEME = {
  accent: '#ff6f00',
  accentGrad: 'from-orange-500 to-pink-500',
}

// Adaptive colors for StatCards
const statTheme = { 
  orange: { 
    iconWrap: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/25', 
    glow: 'rgba(255,111,0,0.18)' 
  },
  purple: { 
    iconWrap: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/25', 
    glow: 'rgba(168,85,247,0.16)' 
  },
  yellow: { 
    iconWrap: 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/25', 
    glow: 'rgba(234,179,8,0.14)' 
  },
  rose: { 
    iconWrap: 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/25', 
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

const formatBusinessType = (type) => {
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
const isDealExpired = (expiryDate) => {
  if (!expiryDate) return false
  const now = new Date()
  const expiry = new Date(expiryDate)
  return expiry < now
}

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

const AnimatedBg = ({ bgRef }) => (
  <div ref={bgRef} className="fixed inset-0 -z-10 overflow-hidden bg-gray-50 dark:bg-[#080808] transition-colors duration-300">
    <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] text-gray-900 dark:text-white" 
         style={{ backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`, backgroundSize: '120px 120px', maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }} />
    <div 
      className="absolute -top-[380px] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full blur-[160px] mix-blend-multiply dark:mix-blend-normal" 
      style={{ 
        background: 'radial-gradient(circle at 50% 50%, rgba(255,111,0,0.15), rgba(236,72,153,0.10), transparent 70%)',
        opacity: 1,
      }} 
    />
    <div className="absolute inset-0 bg-white/30 dark:bg-black/80" style={{ background: 'radial-gradient(circle at 50% 20%, transparent 0%, rgba(255,255,255,0.8) 100%) dark:radial-gradient(circle at 50% 20%, transparent 0%, rgba(0,0,0,0.8) 100%)' }} />
  </div>
)

const Header = ({ savedCount, onLogout }) => {
  const router = useRouter()

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <div className="w-full max-w-5xl bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-gray-200/60 dark:border-white/15 rounded-2xl p-2 shadow-2xl pointer-events-auto flex items-center justify-between pl-4 pr-2 hover:bg-white/90 dark:hover:bg-black/50 transition-all">
        <VicinityLogo showText={true} />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
          <a href="/user/dashboard" className="hover:text-gray-900 dark:hover:text-white transition-colors relative group">Browse<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" /></a>
          <a href="/user/saved" className="hover:text-gray-900 dark:hover:text-white transition-colors relative group">Saved<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" /></a>
          <a href="/user/reviews" className="hover:text-gray-900 dark:hover:text-white transition-colors relative group">Reviews<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" /></a>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/user/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all shadow-md shadow-orange-500/20"
          >
            👤
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onLogout} className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">Logout</motion.button>
        </div>
      </div>
    </motion.nav>
  )
}

const StatCard = ({ label, value, icon: Icon, color, delay }) => {
  const t = statTheme[color] || statTheme.orange
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} whileHover={{ y: -4 }} className="group relative p-6 rounded-2xl overflow-hidden border border-gray-200/60 dark:border-white/15 bg-white/60 dark:bg-black/40 backdrop-blur-2xl shadow-lg hover:shadow-xl dark:shadow-none transition-all hover:bg-white/80 dark:hover:bg-black/50">
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[70px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-multiply dark:mix-blend-normal" style={{ background: `radial-gradient(circle, ${t.glow}, transparent 65%)` }} />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`p-3.5 rounded-xl border backdrop-blur-lg ${t.iconWrap}`}><Icon size={22} /></div>
        <div><p className="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{value}</p><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1.5">{label}</p></div>
      </div>
    </motion.div>
  )
}

const SkeletonCard = ({ viewMode }) => (
  <div className={`rounded-2xl bg-gray-100/50 dark:bg-black/40 border border-gray-200/50 dark:border-white/15 overflow-hidden backdrop-blur-2xl ${viewMode === 'list' ? 'flex h-80' : 'h-[400px]'}`}>
    <div className={`${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'w-full h-56'} bg-gradient-to-br from-gray-200 to-gray-300 dark:from-black/50 dark:to-black/30 animate-pulse`} />
    <div className={`${viewMode === 'list' ? 'flex-1 p-6' : 'w-full'} p-5 space-y-3`}>
      <div className="h-6 w-3/4 bg-gray-200 dark:bg-black/50 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-black/50 rounded animate-pulse" />
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-gray-200 dark:bg-black/50 rounded-lg animate-pulse" />
        <div className="flex-1 h-8 bg-gray-200 dark:bg-black/50 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
)

const FilterSection = ({ title, icon: Icon, children }) => {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="border-t border-gray-200 dark:border-white/10 pt-4 first:border-t-0 first:pt-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3 text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={11} className="text-orange-500 dark:text-orange-400" />}
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
  const [viewMode, setViewMode] = useState('grid')
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
    const handleScroll = () => {
      if (bgRef.current) {
        const scrollY = window.scrollY
        const opacity = scrollY > 100 ? 0 : Math.max(0, 1 - scrollY / 100)
        
        const gradientDiv = bgRef.current.querySelector('[style*="radial-gradient"]')
        if (gradientDiv) {
          gradientDiv.style.opacity = opacity
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

        const categoryCount = {}
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

    return () => supabase.removeChannel(channel)
  }, [user, supabase])

  const isBusinessOpenNow = (hours) => {
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
      const parseTime = (timeStr) => {
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

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (value.trim()) {
      debounceTimer.current = setTimeout(() => {
        handleAiSearch({ preventDefault: () => {} })
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

  const handleAiSearch = async (e) => {
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

    // DEALS FILTER - ONLY SHOW BUSINESSES WITH ACTIVE, NON-EXPIRED DEALS
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
        return dateB - dateA
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

  const handleSave = async (id) => {
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

  if (authLoading || !user) return <div className="min-h-screen bg-gray-50 dark:bg-[#080808] transition-colors" />

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-200 font-sans selection:bg-orange-500/25 selection:text-white relative bg-gray-50 dark:bg-[#080808] transition-colors duration-300">
      <AnimatedBg bgRef={bgRef} />
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <LightRays raysColor={THEME.accent} className="custom-rays opacity-50 dark:opacity-100" />
      </div>

      <Header savedCount={savedIds.size} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-6 py-10 pt-32 relative z-10">
        <section className="mb-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter mb-4 leading-[0.9]">
              Ready to explore, <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${THEME.accentGrad}`}>
                {userData?.name || 'Traveler'}?
              </span>
            </motion.h1>
            {userData?.city && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/70 dark:bg-orange-500/15 border border-orange-200/80 dark:border-orange-500/30 shadow-sm dark:shadow-none">
                  <FaMapMarkerAlt className="text-orange-600 dark:text-orange-400" size={14} />
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">{userData.city}</span>
                </div>
              </motion.div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <StatCard label="Places" value={stats.total} icon={FaStore} color="orange" delay={0.1} />
            <StatCard label="Your Reviews" value={stats.totalReviews} icon={FaUserCheck} color="purple" delay={0.2} />
            <StatCard label="Your Avg Rating" value={stats.avgRating} icon={FaStar} color="yellow" delay={0.3} />
            <StatCard label="Saved" value={stats.saved} icon={FaHeart} color="rose" delay={0.4} />
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="w-full p-3 rounded-lg bg-white/60 dark:bg-black/40 border border-gray-200/60 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-white/80 dark:hover:text-white dark:hover:bg-black/50 transition-all shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <FaFilter size={14} />
                <span className="font-bold">Filters</span>
              </div>
              {activeFilterCount > 0 && (
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
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
                <div className="sticky top-28 rounded-2xl p-6 border border-gray-200/60 dark:border-white/15 bg-white/60 dark:bg-black/40 backdrop-blur-2xl shadow-lg dark:shadow-none space-y-6">
                  <div className="flex items-center justify-between lg:block">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <FaFilter size={12} className="text-orange-500 dark:text-orange-400" /> Filters
                    </h3>
                    {activeFilterCount > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={clearAllFilters}
                        className="text-xs font-bold text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
                      >
                        Clear All
                      </motion.button>
                    )}
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="lg:hidden text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>

                  {activeFilterCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-2 bg-blue-100/60 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 rounded-lg text-xs text-blue-600 dark:text-blue-300 font-bold text-center"
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
                            className={`px-2 py-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                              categoryFilter === type
                                ? 'bg-gradient-to-r from-orange-500/80 to-pink-500/80 text-white shadow-md'
                                : 'bg-gray-100/70 dark:bg-black/40 border border-gray-200/60 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/25 hover:text-gray-900 dark:hover:text-white'
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
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            sortOption === opt.id
                              ? 'bg-orange-100/70 dark:bg-orange-500/15 border border-orange-200/60 dark:border-orange-500/30 text-orange-600 dark:text-orange-300'
                              : 'bg-gray-100/70 dark:bg-black/40 border border-gray-200/60 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/25 hover:text-gray-900 dark:hover:text-white'
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
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                        openNowFilter
                          ? 'bg-emerald-100/70 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/25 text-emerald-600 dark:text-emerald-300'
                          : 'bg-gray-100/70 dark:bg-black/40 border-gray-200/60 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/25 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-sm font-bold flex items-center gap-2">
                        <FaClock size={14} /> Open Now
                      </span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${openNowFilter ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-700'}`}>
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
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                        hasDealsFilter
                          ? 'bg-red-100/70 dark:bg-red-500/10 border-red-200/60 dark:border-red-500/25 text-red-600 dark:text-red-300'
                          : 'bg-gray-100/70 dark:bg-black/40 border-gray-200/60 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/25 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-sm font-bold flex items-center gap-2">
                        <FaTag size={14} /> Has Deals
                      </span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${hasDealsFilter ? 'bg-red-500' : 'bg-gray-400 dark:bg-gray-700'}`}>
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
                  className="hidden lg:flex p-2.5 rounded-lg bg-white/60 dark:bg-black/40 border border-gray-200/60 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:text-gray-900 hover:bg-white/80 dark:hover:text-white dark:hover:bg-black/50 transition-all shadow-sm"
                  title="Toggle filters"
                >
                  <FaFilter size={14} />
                </motion.button>

                <h2 className="text-3xl font-black text-gray-900 dark:text-white flex-1">
                  ✨ Discover Nearby
                </h2>

                <div className="flex gap-2 bg-white/60 dark:bg-black/40 p-1.5 rounded-xl border border-gray-200/60 dark:border-white/15 shadow-sm">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-orange-500/80 to-pink-500/80 text-white shadow-md'
                        : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title="Grid view"
                  >
                    <FaGripHorizontal size={14} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-orange-500/80 to-pink-500/80 text-white shadow-md'
                        : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                    className="w-full pl-10 pr-12 py-3.5 rounded-lg bg-white/70 dark:bg-black/40 border border-gray-200/60 dark:border-white/15 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all shadow-sm"
                  />
                  {aiSearchLoading ? (
                    <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 animate-spin" size={16} />
                  ) : (
                    <button
                      type="submit"
                      disabled={!searchQuery.trim() || aiSearchLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaSearch size={16} />
                    </button>
                  )}
                </div>
                {aiSearchResults !== null && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                    <span>🤖 AI Search: Found <span className="text-orange-500 dark:text-orange-400 font-bold">{filteredBusinesses.length}</span> results</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAiSearchResults(null)
                        setSearchQuery('')
                      }}
                      className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 font-bold"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </form>

              <div className="flex items-center justify-between px-1">
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-300 font-medium">
                    Showing <span className="text-orange-500 dark:text-orange-400 font-bold">{startIndex}–{endIndex}</span> of <span className="text-gray-900 dark:text-white font-bold">{filteredBusinesses.length}</span>
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
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                          currentPage === 1
                            ? 'bg-gray-100/60 dark:bg-black/20 border border-gray-200/60 dark:border-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : 'bg-white/60 dark:bg-black/40 border border-gray-200/60 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-orange-500/50 hover:text-gray-900 hover:bg-white/80 dark:hover:text-white dark:hover:bg-black/50 shadow-sm transition-all'
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
                              className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                                page === currentPage
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40'
                                  : 'bg-white/60 dark:bg-black/40 border border-gray-200/60 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:border-orange-500/30 hover:text-gray-900 dark:hover:text-white'
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
                              className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                                currentPage === 1
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40'
                                  : 'bg-white/60 dark:bg-black/40 border border-gray-200/60 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:border-orange-500/30 hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              1
                            </button>
                            {currentPage > 3 && (
                              <span className="px-2 text-gray-400">…</span>
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
                                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                                    page === currentPage
                                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40'
                                      : 'bg-white/60 dark:bg-black/40 border border-gray-200/60 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:border-orange-500/30 hover:text-gray-900 dark:hover:text-white'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}

                            {currentPage < totalPages - 2 && (
                              <span className="px-2 text-gray-400">…</span>
                            )}

                            <button
                              onClick={() => {
                                setCurrentPage(totalPages)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                                currentPage === totalPages
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40'
                                  : 'bg-white/60 dark:bg-black/40 border border-gray-200/60 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:border-orange-500/30 hover:text-gray-900 dark:hover:text-white'
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
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                          currentPage === totalPages
                            ? 'bg-gray-100/60 dark:bg-black/20 border border-gray-200/60 dark:border-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : 'bg-white/60 dark:bg-black/40 border border-gray-200/60 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-orange-500/50 hover:text-gray-900 hover:bg-white/80 dark:hover:text-white dark:hover:bg-black/50 shadow-sm transition-all'
                        }`}
                      >
                        Next <FaChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No businesses found</p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform shadow-lg"
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
