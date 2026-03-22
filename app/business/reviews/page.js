'use client'

// Reviews management page with AI-powered sentiment analysis and filtering
// COMPONENTS:
// REVIEW CARD - Individual review display with user info, rating, content, and actions
// REVIEWS ANALYZER - AI analysis modal showing sentiment breakdown, themes, and recommendations
// HELPER FUNCTIONS:
// UPDATE STATS - Calculates total reviews, average rating, and recent review count
// ANALYZE REVIEWS WITH AI - Calls API to analyze reviews and generate insights
// FORMAT DATE - Converts timestamp to readable date format

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaCheck,
  FaExclamationTriangle,
  FaChartLine,
  FaCommentDots,
  FaSync,
  FaChartBar,
  FaSmile,
  FaFrown,
  FaFilter,
  FaCalendar,
  FaArrowUp,
  FaTimes,
  FaLightbulb as FaBulb,
  FaStar,
  FaShare,
  FaBookmark,
  FaRocket,
  FaEye,
} from 'react-icons/fa'
import { Inter, Outfit } from 'next/font/google'

import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout'

// Font setup
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

// Theme classes
const PAGE_WRAP =
  `${inter.variable} ${outfit.variable} relative min-h-screen overflow-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-[#081120] dark:text-white`

const GLASS_BG =
  'bg-white/75 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 transition-colors duration-300'

const GLASS_CARD =
  'bg-white/80 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 rounded-[28px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all hover:border-blue-500/28 hover:shadow-[0_20px_60px_rgba(59,130,246,0.10)] duration-300'

const GLASS_BUTTON =
  'bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-[var(--font-outfit)] font-semibold text-xs disabled:opacity-50 flex items-center gap-2 shadow-[0_10px_30px_rgba(59,130,246,0.24)]'

// Animated page background
function PageBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:bg-[#081120]" />

      {/* Main glow */}
      <motion.div
        animate={{
          y: [0, -16, 0],
          scale: [1, 1.05, 1],
          opacity: [0.22, 0.4, 0.22],
          transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute left-1/2 top-[8%] h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-blue-200/70 blur-[140px] dark:bg-blue-500/16"
      />

      {/* Left glow */}
      <motion.div
        animate={{
          x: [0, 16, 0],
          y: [0, 14, 0],
          opacity: [0.15, 0.28, 0.15],
          transition: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute left-[-8%] top-[16%] h-[320px] w-[320px] rounded-full bg-blue-100/80 blur-[120px] dark:bg-blue-400/10"
      />

      {/* Right glow */}
      <motion.div
        animate={{
          x: [0, -12, 0],
          y: [0, -10, 0],
          opacity: [0.12, 0.24, 0.12],
          transition: { duration: 11, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute right-[-6%] top-[14%] h-[340px] w-[340px] rounded-full bg-cyan-100/70 blur-[120px] dark:bg-cyan-500/10"
      />

      {/* Grid */}
      <motion.div
        animate={{
          backgroundPosition: ['0px 0px', '72px 72px'],
          transition: { duration: 18, repeat: Infinity, ease: 'linear' },
        }}
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(59,130,246,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.22) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(circle at center, black 45%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(circle at center, black 45%, transparent 100%)',
        }}
      />

      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#081120]" />
    </div>
  )
}

export default function BusinessDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzerLoading, setAnalyzerLoading] = useState(false)
  const [filterRating, setFilterRating] = useState('all')
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [businessId, setBusinessId] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    recentReviews: 0,
  })

  // Load reviews and set up realtime
  useEffect(() => {
    if (!user?.id) return

    let activeChannel = null

    ;(async () => {
      try {
        setLoading(true)

        const { data: businessData } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        if (!businessData) return

        setBusinessId(businessData.id)

        // Initial fetch
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false })

        setReviews(reviewsData || [])
        updateStats(reviewsData || [])

        // Realtime subscription
        activeChannel = supabase
          .channel(`business-reviews-${businessData.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'reviews',
              filter: `business_id=eq.${businessData.id}`,
            },
            (payload) => {
              console.log('Real-time event:', payload.eventType)

              if (payload.eventType === 'INSERT') {
                setReviews((prev) => [payload.new, ...prev])
                setSuccess('✨ New review received!')
                setTimeout(() => setSuccess(null), 3000)
              } else if (payload.eventType === 'UPDATE') {
                setReviews((prev) =>
                  prev.map((r) => (r.id === payload.new.id ? payload.new : r))
                )
                setSuccess('✨ Review updated!')
                setTimeout(() => setSuccess(null), 3000)
              } else if (payload.eventType === 'DELETE') {
                setReviews((prev) => prev.filter((r) => r.id !== payload.old.id))
                setSuccess('✨ Review deleted!')
                setTimeout(() => setSuccess(null), 3000)
              }
            }
          )
          .subscribe()
      } catch (e) {
        console.error(e)
        setError('Failed to load reviews')
      } finally {
        setLoading(false)
      }
    })()

    return () => {
      if (activeChannel) {
        supabase.removeChannel(activeChannel)
      }
    }
  }, [user?.id, supabase])

  // Update stats on reviews change
  useEffect(() => {
    updateStats(reviews)
  }, [reviews])

  // Stats helper
  const updateStats = (reviewsData) => {
    if (reviewsData && reviewsData.length > 0) {
      const totalReviews = reviewsData.length
      const avgRating =
        reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentReviews = reviewsData.filter(
        (r) => new Date(r.created_at) > thirtyDaysAgo
      ).length

      setStats({
        totalReviews,
        averageRating: parseFloat(avgRating.toFixed(1)),
        recentReviews,
      })
    } else {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        recentReviews: 0,
      })
    }
  }

  // AI reviews analysis
  const analyzeReviewsWithAI = async () => {
    if (reviews.length === 0) {
      setError('No reviews to analyze')
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      setAnalyzerLoading(true)

      const response = await fetch('/api/analyze-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviews: reviews,
          businessId: businessId,
          totalReviews: reviews.length,
          averageRating: stats.averageRating,
        }),
      })

      if (!response.ok) throw new Error('Failed to analyze reviews')

      const data = await response.json()
      setAnalysis(data)
      setShowAnalyzer(true)
      setSuccess('✨ Analysis complete!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to analyze reviews: ' + err.message)
      setTimeout(() => setError(null), 3000)
    } finally {
      setAnalyzerLoading(false)
    }
  }

  const filteredReviews =
    filterRating === 'all'
      ? reviews
      : reviews.filter((r) => Math.round(r.rating) === parseInt(filterRating))

  if (loading || authLoading) {
    return (
      <BusinessLayout>
        <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
          <PageBackground />
          <div className="relative z-10 h-screen flex items-center justify-center">
            {/* Loading spinner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-full border-[3px] border-blue-500/30 border-t-blue-600 dark:border-blue-400/20 dark:border-t-blue-300"
            />
          </div>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
        <PageBackground />

        {/* Top header bar */}
        <div className="relative z-10 border-b border-blue-500/10 dark:border-white/10 bg-white/70 dark:bg-[#0b1322] backdrop-blur-xl transition-colors duration-300">
          {/* Header glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
            <div className="absolute right-20 top-0 h-20 w-20 rounded-full bg-cyan-100/50 blur-3xl dark:bg-cyan-400/10" />
          </div>

          <div className="relative flex min-h-[88px] items-center px-8">
            <div>
              {/* Title */}
              <h1 className="font-[var(--font-outfit)] text-[30px] font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">
                Reviews
              </h1>

              {/* Subtitle */}
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage and analyze your customer feedback
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-8 mt-4 px-4 py-3 rounded-2xl bg-red-50/90 dark:bg-[#1f1720] border border-red-300/50 dark:border-red-400/20 text-red-700 dark:text-red-300 text-sm flex items-center gap-3 relative z-10 backdrop-blur-xl"
            >
              <FaExclamationTriangle /> {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-8 mt-4 px-4 py-3 rounded-2xl bg-blue-50/90 dark:bg-[#0f172a] border border-blue-300/50 dark:border-blue-400/20 text-blue-700 dark:text-blue-300 text-sm flex items-center gap-3 relative z-10 backdrop-blur-xl"
            >
              <FaCheck /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-6xl mx-auto p-8 pb-20">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Total reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={GLASS_CARD}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">
                    Total Reviews
                  </p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaCommentDots size={16} />
                  </div>
                </div>

                <p className="text-4xl font-[var(--font-outfit)] font-semibold tracking-[-0.05em] text-slate-900 dark:text-white mb-4">
                  {stats.totalReviews}
                </p>

                {/* Rating distribution bars */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => Math.round(r.rating) === star).length
                    const percentage =
                      stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0

                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-blue-600 dark:text-blue-300 w-5">
                          {star}★
                        </span>
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 w-4 text-right">
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Average rating */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={GLASS_CARD}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">
                    Avg. Rating
                  </p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaEye size={16} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <p className="text-4xl font-[var(--font-outfit)] font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">
                    {stats.averageRating}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">/5</p>
                </div>

                {/* Column chart */}
                <div className="space-y-2">
                  <div className="flex items-end justify-center gap-1 h-16">
                    {[...Array(5)].map((_, i) => {
                      const filled = i < Math.round(stats.averageRating)
                      const maxHeight = 100
                      const height = filled ? ((5 - i) / 5) * maxHeight : 20

                      return (
                        <motion.div
                          key={i}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.05 + i * 0.1 }}
                          className={`flex-1 rounded-t ${
                            filled
                              ? 'bg-gradient-to-t from-blue-500 to-cyan-400'
                              : 'bg-slate-200 dark:bg-white/10'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      )
                    })}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    {Math.round((stats.averageRating / 5) * 100)}% rating score
                  </div>
                </div>
              </motion.div>

              {/* Recent reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={GLASS_CARD}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">
                    Last 30 Days
                  </p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaRocket size={16} />
                  </div>
                </div>

                <p className="text-4xl font-[var(--font-outfit)] font-semibold tracking-[-0.05em] text-slate-900 dark:text-white mb-4">
                  {stats.recentReviews}
                </p>

                {/* Growth bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Growth</span>
                    <span className="text-blue-600 dark:text-blue-300 font-[var(--font-outfit)] font-semibold">
                      {stats.totalReviews > 0
                        ? Math.round((stats.recentReviews / stats.totalReviews) * 100)
                        : 0}
                      %
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          stats.totalReviews > 0
                            ? (stats.recentReviews / stats.totalReviews) * 100
                            : 0
                        }%`,
                      }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    />
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Of total reviews this month
                  </div>
                </div>
              </motion.div>
            </div>

            {/* AI analysis panel */}
            <AnimatePresence>
              {showAnalyzer && analysis && (
                <ReviewsAnalyzer analysis={analysis} onClose={() => setShowAnalyzer(false)} />
              )}
            </AnimatePresence>

            {/* Filter bar */}
            <div className={`mb-6 ${GLASS_BG} flex items-center justify-between px-6 py-4 rounded-[28px] relative z-10`}>
              <div className="flex gap-2 overflow-x-auto flex-1 no-scrollbar">
                {['all', '5', '4', '3', '2', '1'].map((rating) => (
                  <motion.button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-2xl font-[var(--font-outfit)] font-semibold text-xs whitespace-nowrap transition-all flex items-center gap-2 border ${
                      filterRating === rating
                        ? 'bg-blue-600 text-white border-transparent shadow-[0_10px_30px_rgba(59,130,246,0.24)]'
                        : 'bg-white dark:bg-[#162033] text-slate-500 dark:text-slate-400 border-blue-500/15 dark:border-white/10 hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-300'
                    }`}
                  >
                    {rating === 'all' ? 'All' : rating}⭐
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                {/* AI analyze button */}
                <motion.button
                  onClick={analyzeReviewsWithAI}
                  disabled={analyzerLoading || reviews.length === 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2.5 ${GLASS_BUTTON}`}
                >
                  <FaChartBar
                    size={12}
                    className={analyzerLoading ? 'animate-spin' : ''}
                  />
                  <span className="hidden sm:inline">
                    {analyzerLoading ? 'Analyzing...' : 'AI Analysis'}
                  </span>
                </motion.button>

                {/* Refresh button */}
                <motion.button
                  onClick={() => window.location.reload()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 bg-white dark:bg-[#162033] hover:bg-blue-50 dark:hover:bg-[#1d2a44] rounded-2xl text-slate-500 dark:text-slate-300 font-[var(--font-outfit)] font-semibold text-xs border border-blue-500/15 dark:border-white/10 flex items-center gap-2 transition-all shadow-sm"
                >
                  <FaSync size={12} />
                </motion.button>
              </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-4">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review, idx) => (
                  <ReviewCard key={review.id} review={review} idx={idx} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-center py-20 ${GLASS_CARD}`}
                >
                  <FaCommentDots
                    size={40}
                    className="mx-auto mb-4 text-blue-300 dark:text-blue-500/40"
                  />
                  <h3 className="text-slate-900 dark:text-white font-[var(--font-outfit)] font-semibold mb-1">
                    No reviews found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No reviews match your current filter
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </BusinessLayout>
  )
}

// Review card component
function ReviewCard({ review, idx }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently'
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'Recently'
    }
  }

  const REVIEW_CARD =
    'bg-white/80 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 rounded-[28px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:border-blue-500/28 hover:shadow-[0_20px_60px_rgba(59,130,246,0.10)] transition-all duration-300'

  return (
    <motion.div
      key={review.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={REVIEW_CARD}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* User avatar */}
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-[var(--font-outfit)] font-semibold text-lg shadow-[0_10px_30px_rgba(59,130,246,0.24)]">
            {(review.user_name || 'A').charAt(0).toUpperCase()}
          </div>

          <div>
            <h4 className="font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white">
              {review.user_name || 'Anonymous'}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <FaCalendar size={10} /> {formatDate(review.created_at)}
            </span>
          </div>
        </div>

        {/* Star rating */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={16}
              className={
                star <= (review.rating || 0)
                  ? 'text-blue-500 dark:text-blue-300'
                  : 'text-slate-300 dark:text-white/15'
              }
            />
          ))}
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h3 className="font-[var(--font-outfit)] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white text-lg mb-2">
          {review.title}
        </h3>
      )}

      {/* Content */}
      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
        {review.comment || review.text}
      </p>

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {review.photos.map((photo, i) => (
            <img
              key={i}
              src={photo}
              className="h-24 w-24 object-cover rounded-2xl border border-blue-500/12 dark:border-white/10"
              alt={`Review photo ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-blue-500/12 dark:border-white/10 pt-4 mt-4">
        {/* Share action */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <FaShare size={14} />
        </motion.button>

        {/* Bookmark action */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
        >
          <FaBookmark size={14} />
        </motion.button>
      </div>
    </motion.div>
  )
}

// Analyzer component
function ReviewsAnalyzer({ analysis, onClose }) {
  const ANALYZER_CARD =
    'bg-white/80 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 rounded-[28px] p-8 mb-8 space-y-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all duration-300'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={ANALYZER_CARD}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
            <FaChartBar size={20} />
          </div>
          <h2 className="text-xl font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
            AI Reviews Analysis
          </h2>
        </div>

        {/* Close button */}
        <motion.button
          whileHover={{ rotate: 90 }}
          onClick={onClose}
          className="p-2 hover:bg-blue-50 dark:hover:bg-[#162033] rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <FaTimes size={20} />
        </motion.button>
      </div>

      {/* Sentiment cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4 rounded-[22px] backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaSmile className="text-blue-600 dark:text-blue-300" />
            <p className="text-slate-600 dark:text-slate-300 text-xs font-[var(--font-outfit)] font-semibold uppercase tracking-[0.14em]">
              Positive
            </p>
          </div>
          <p className="text-3xl font-[var(--font-outfit)] font-semibold text-blue-600 dark:text-blue-300">
            {analysis.sentimentBreakdown?.positive || 0}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-50 dark:bg-[#162033] border border-slate-200 dark:border-white/10 p-4 rounded-[22px] backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaFilter className="text-slate-600 dark:text-slate-300" />
            <p className="text-slate-600 dark:text-slate-300 text-xs font-[var(--font-outfit)] font-semibold uppercase tracking-[0.14em]">
              Neutral
            </p>
          </div>
          <p className="text-3xl font-[var(--font-outfit)] font-semibold text-slate-700 dark:text-slate-200">
            {analysis.sentimentBreakdown?.neutral || 0}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-[22px] backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaFrown className="text-red-600 dark:text-red-300" />
            <p className="text-slate-600 dark:text-slate-300 text-xs font-[var(--font-outfit)] font-semibold uppercase tracking-[0.14em]">
              Negative
            </p>
          </div>
          <p className="text-3xl font-[var(--font-outfit)] font-semibold text-red-600 dark:text-red-300">
            {analysis.sentimentBreakdown?.negative || 0}%
          </p>
        </motion.div>
      </div>

      {/* Key themes */}
      <div>
        <h3 className="text-slate-900 dark:text-white font-[var(--font-outfit)] font-semibold mb-4 flex items-center gap-2 tracking-[-0.02em]">
          <FaArrowUp className="text-blue-600 dark:text-blue-300" /> Key Themes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Praised */}
          <div className="bg-white dark:bg-[#111827] backdrop-blur-sm border border-blue-500/12 dark:border-white/10 p-4 rounded-[22px] transition-colors duration-300">
            <p className="text-slate-500 dark:text-slate-300 text-xs font-[var(--font-outfit)] font-semibold mb-3 tracking-[0.14em]">
              ✓ MOST PRAISED
            </p>

            <div className="space-y-2">
              {(analysis.keyThemes?.praised || []).length > 0 ? (
                analysis.keyThemes.praised.map((theme, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-blue-600 dark:text-blue-300 text-sm"
                  >
                    <span>✓</span> <span>{theme}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 dark:text-slate-500 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* Complaints */}
          <div className="bg-white dark:bg-[#111827] backdrop-blur-sm border border-blue-500/12 dark:border-white/10 p-4 rounded-[22px] transition-colors duration-300">
            <p className="text-slate-500 dark:text-slate-300 text-xs font-[var(--font-outfit)] font-semibold mb-3 tracking-[0.14em]">
              ⚠ TOP COMPLAINTS
            </p>

            <div className="space-y-2">
              {(analysis.keyThemes?.complaints || []).length > 0 ? (
                analysis.keyThemes.complaints.map((complaint, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-red-600 dark:text-red-300 text-sm"
                  >
                    <span>⚠</span> <span>{complaint}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 dark:text-slate-500 text-sm">No data</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div>
          <h3 className="text-slate-900 dark:text-white font-[var(--font-outfit)] font-semibold mb-3 flex items-center gap-2 tracking-[-0.02em]">
            <FaBulb className="text-blue-500 dark:text-blue-300" /> Recommendations
          </h3>

          <div className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <div
                key={i}
                className="bg-blue-50 dark:bg-blue-500/10 backdrop-blur-sm border border-blue-200 dark:border-blue-500/20 p-3 rounded-2xl text-sm text-slate-700 dark:text-slate-300"
              >
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend */}
      {analysis.trend && (
        <div className="bg-white dark:bg-[#111827] backdrop-blur-sm border border-blue-200 dark:border-blue-500/20 p-4 rounded-[22px] transition-colors duration-300">
          <p className="text-slate-500 dark:text-slate-300 text-sm font-[var(--font-outfit)] font-semibold mb-2 flex items-center gap-2">
            <FaChartLine className="text-blue-500 dark:text-blue-300" /> Overall Trend
          </p>
          <p className="text-slate-700 dark:text-white text-sm">{analysis.trend}</p>
        </div>
      )}
    </motion.div>
  )
}
