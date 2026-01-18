// Browse page for discovering and filtering local businesses
// Displays businesses in grid/list view with AI search, category filters, and pagination

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaFilter,
  FaStore,
  FaGripHorizontal,
  FaListUl,
  FaTimes,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaSpinner,
  FaLock 
} from 'react-icons/fa'

import { createClient } from '../../lib/supabase'
import BusinessCard from '../../components/BusinessCard'

// Helper for category names
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
  if (CATEGORY_MAP[lowercase]) return CATEGORY_MAP[lowercase].short
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (lowercase.includes(key) || key.includes(lowercase)) return value.short
  }
  return type.length > 12 ? type.substring(0, 10) + '..' : type
}

// Animated Background Component that supports Dark/Light Mode
const AnimatedBg = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
    <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]" 
      style={{ 
        backgroundImage: `linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)`, 
        backgroundSize: '120px 120px', 
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' 
      }} 
    />
    <div 
      className="absolute -top-[380px] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full blur-[160px] opacity-60 dark:opacity-100" 
      style={{ 
        background: 'radial-gradient(circle at 50% 50%, rgba(255,111,0,0.15), rgba(236,72,153,0.1), transparent 70%)',
      }} 
    />
  </div>
)

const SkeletonCard = ({ viewMode }) => (
  <div className={`rounded-2xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/15 overflow-hidden backdrop-blur-2xl ${viewMode === 'list' ? 'flex h-80' : 'h-[400px]'}`}>
    <div className={`${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'w-full h-56'} bg-gray-200 dark:bg-black/50 animate-pulse`} />
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
        className="w-full flex items-center justify-between mb-3 text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest hover:text-orange-500 dark:hover:text-white transition-colors"
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

export default function BrowsePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [businesses, setBusinesses] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [filterOpen, setFilterOpen] = useState(true)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('')
  const [aiSearchLoading, setAiSearchLoading] = useState(false)
  const [aiSearchResults, setAiSearchResults] = useState(null)

  const [categoryFilter, setCategoryFilter] = useState(null)
  const [sortOption, setSortOption] = useState('default')

  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 9
  const [availableCategories, setAvailableCategories] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const { data: bData, error: bError } = await supabase
          .from('businesses')
          .select('*')
          .limit(100)
        
        if (bError) throw bError

        const formattedBusinesses = (bData || []).map((b) => ({
          ...b,
          rating: parseFloat(b.rating) || 0,
          review_count: parseInt(b.review_count) || 0,
          is_open: b.is_open ?? true,
          image_url: b.image_url || b.imageUrl || null,
          type: (b.type || 'Other').trim(),
          created_at: b.created_at || new Date().toISOString(),
        }))

        setBusinesses(formattedBusinesses)

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
      } catch (err) {
        console.error('Data fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value)
    if (!e.target.value.trim()) {
      setAiSearchResults(null)
    }
  }

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
          businesses: businesses,
        }),
      })

      const data = await response.json()
      setAiSearchResults(data.matchedBusinesses || [])
      setCurrentPage(1)
    } catch (error) {
      console.error('AI Search error:', error)
      setAiSearchResults(null)
    } finally {
      setAiSearchLoading(false)
    }
  }

  // --- UNIFIED FILTERING AND SORTING LOGIC ---
  const filteredAndSortedBusinesses = useMemo(() => {
    // 1. Determine base list: AI Results OR Full List
    let result = aiSearchResults !== null ? [...aiSearchResults] : [...businesses]

    // 2. Apply Basic Text Search (ONLY if AI search isn't active)
    if (aiSearchResults === null && searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase()
      result = result.filter(b => 
        b.name.toLowerCase().includes(lowerQuery) || 
        b.type.toLowerCase().includes(lowerQuery) ||
        (b.description && b.description.toLowerCase().includes(lowerQuery))
      )
    }

    // 3. Apply Category Filter
    if (categoryFilter) {
      result = result.filter(b => b.type === categoryFilter)
    }

    // 4. APPLY SORTING - THIS IS THE KEY PART
    if (sortOption === 'highest-rated') {
      result = result.sort((a, b) => {
        const ratingA = parseFloat(a.rating) || 0
        const ratingB = parseFloat(b.rating) || 0
        return ratingB - ratingA
      })
    } else if (sortOption === 'most-reviewed') {
      result = result.sort((a, b) => {
        const countA = parseInt(a.review_count) || 0
        const countB = parseInt(b.review_count) || 0
        return countB - countA
      })
    } else if (sortOption === 'newest') {
      result = result.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA
      })
    }

    return result
  }, [businesses, categoryFilter, sortOption, aiSearchResults, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedBusinesses.length / PAGE_SIZE))

  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, sortOption, aiSearchResults, searchQuery])

  const paginatedBusinesses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredAndSortedBusinesses.slice(start, start + PAGE_SIZE)
  }, [filteredAndSortedBusinesses, currentPage])

  const startIndex = (currentPage - 1) * PAGE_SIZE + 1
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredAndSortedBusinesses.length)

  const clearAllFilters = () => {
    setCategoryFilter(null)
    setSortOption('default')
    setSearchQuery('')
    setAiSearchResults(null)
    setCurrentPage(1)
  }

  const activeFilterCount = (categoryFilter ? 1 : 0) + (searchQuery ? 1 : 0)

  const handleRestrictedAction = () => {
    router.push('/login?redirect=/browse')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans selection:bg-orange-500/25 selection:text-orange-900 dark:selection:text-white relative transition-colors duration-300">
      <AnimatedBg />
      
      {/* ===== SIMPLIFIED NAVBAR - LOGIN/SIGNUP ONLY ===== */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
        <div className="w-full max-w-5xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-gray-300/20 dark:border-white/15 rounded-2xl p-2 shadow-2xl pointer-events-auto flex items-center justify-between pl-4 pr-2 hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-300">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
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
            <span className="font-black text-orange-500 dark:text-orange-400 text-xl tracking-tight">Vicinity</span>
          </div>
          
          {/* Spacer */}
          <div className="flex-1"></div>
          
          {/* Right Actions - Login/Signup Only */}
          <div className="flex items-center gap-2">
            <a href="/login" className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Log In</a>
            <a href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">Get Started</a>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-7xl mx-auto px-6 py-10 pt-32 relative z-10">
        <section className="mb-16 text-center lg:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter mb-6 leading-[0.9]"
          >
            Explore Amazing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600">
              Businesses Nearby
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl"
          >
            Browse and discover great places. <span className="text-orange-500 font-bold">Sign in</span> to view full details and save your favorites.
          </motion.p>
        </section>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/15 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:text-white transition-colors flex items-center justify-between"
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
                <div className="sticky top-28 rounded-2xl p-6 border border-gray-200 dark:border-white/15 bg-white/80 dark:bg-black/40 backdrop-blur-2xl shadow-xl space-y-6">
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
                      className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>

                  {activeFilterCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-600 dark:text-blue-300 font-bold text-center"
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
                                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:border-white/25 dark:hover:text-white'
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
                        { id: 'highest-rated', label: '⭐ Highest Rated' },
                        { id: 'most-reviewed', label: '💬 Most Reviewed' },
                        { id: 'newest', label: '✨ Newest' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSortOption(opt.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            sortOption === opt.id
                              ? 'bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-300'
                              : 'bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:border-white/25 dark:hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
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
                  className="hidden lg:flex p-2.5 rounded-lg bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:text-white transition-colors"
                  title="Toggle filters"
                >
                  <FaFilter size={14} />
                </motion.button>

                <h2 className="text-3xl font-black text-gray-900 dark:text-white flex-1">
                  ✨ Discover Nearby
                </h2>

                <div className="flex gap-2 bg-gray-100 dark:bg-black/40 p-1.5 rounded-xl border border-gray-200 dark:border-white/15">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm'
                        : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                        ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm'
                        : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                    placeholder="Search by name, category, or description..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="w-full pl-10 pr-12 py-3.5 rounded-lg bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                  />
                  {aiSearchLoading ? (
                    <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 animate-spin" size={16} />
                  ) : (
                    <button
                      type="submit"
                      disabled={!searchQuery.trim() || aiSearchLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Run AI Semantic Search"
                    >
                      <span className="text-xs font-bold mr-1">AI</span>
                      <FaSearch size={14} />
                    </button>
                  )}
                </div>
                {aiSearchResults !== null && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                    <span>🤖 AI Search: Found <span className="text-orange-500 dark:text-orange-400 font-bold">{filteredAndSortedBusinesses.length}</span> results</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAiSearchResults(null)
                        setSearchQuery('')
                      }}
                      className="text-orange-500 dark:text-orange-400 hover:text-orange-600 font-bold"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </form>

              <div className="flex items-center justify-between px-1">
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-300 font-medium">
                    Showing <span className="text-orange-500 dark:text-orange-400 font-bold">{startIndex}–{endIndex}</span> of <span className="text-gray-900 dark:text-white font-bold">{filteredAndSortedBusinesses.length}</span>
                  </span>
                </div>
              </div>

              {loading ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} viewMode={viewMode} />)}
                </div>
              ) : filteredAndSortedBusinesses.length > 0 ? (
                <>
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                    {paginatedBusinesses.map((business) => (
                      <div key={business.id} className="relative group cursor-pointer">
                        <div 
                          onClick={handleRestrictedAction}
                          className="absolute inset-0 z-10"
                        />
                        
                        <BusinessCard
                          business={business}
                          isSaved={false}
                          onSave={() => {}}
                          viewMode={viewMode}
                        />

                        <div className="absolute top-2 right-2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <FaLock size={10} /> Sign in to view
                        </div>
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
                            ? 'bg-gray-100 dark:bg-black/20 text-gray-400 cursor-not-allowed'
                            : 'bg-white dark:bg-black/40 border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-orange-500/50 hover:text-orange-500 dark:hover:text-white'
                        }`}
                      >
                        <FaChevronLeft size={12} /> Previous
                      </button>

                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                          .map((page, index, array) => {
                             const prev = array[index - 1]
                             const showEllipsis = prev && page - prev > 1
                             
                             return (
                               <React.Fragment key={page}>
                                 {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                                 <button
                                   onClick={() => {
                                     setCurrentPage(page)
                                     window.scrollTo({ top: 0, behavior: 'smooth' })
                                   }}
                                   className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                                     page === currentPage
                                       ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                                       : 'bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-orange-500/30 hover:text-orange-500 dark:hover:text-white'
                                   }`}
                                 >
                                   {page}
                                 </button>
                               </React.Fragment>
                             )
                          })}
                      </div>

                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                          currentPage === totalPages
                            ? 'bg-gray-100 dark:bg-black/20 text-gray-400 cursor-not-allowed'
                            : 'bg-white dark:bg-black/40 border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-orange-500/50 hover:text-orange-500 dark:hover:text-white'
                        }`}
                      >
                        Next <FaChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-300 dark:border-white/15 rounded-3xl bg-gray-50 dark:bg-black/40 backdrop-blur-2xl"
                >
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No places found</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">Try adjusting your filters or search to see more results.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={clearAllFilters}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-black text-sm hover:shadow-lg transition-all"
                  >
                    Clear All Filters
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
