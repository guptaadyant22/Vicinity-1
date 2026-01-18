// Reviews management page with AI-powered sentiment analysis and filtering
// COMPONENTS:
// REVIEW CARD - Individual review display with user info, rating, content, and actions
// REVIEWS ANALYZER - AI analysis modal showing sentiment breakdown, themes, and recommendations
// HELPER FUNCTIONS:
// UPDATE STATS - Calculates total reviews, average rating, and recent review count
// ANALYZE REVIEWS WITH AI - Calls API to analyze reviews and generate insights
// FORMAT DATE - Converts timestamp to readable date format


'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaSave, FaCamera, FaCloudUploadAlt, FaCheck, FaExclamationTriangle,
  FaMapMarkerAlt, FaPhone, FaGlobe, FaClock, FaMagic,
  FaImage, FaTrash, FaChevronDown, FaEye, FaInfo, FaLightbulb, FaChartLine,
  FaCommentDots, FaSync, FaChartBar, FaSmile, FaFrown,
  FaFilter, FaThumbsUp, FaCalendar, FaUser, FaArrowUp, FaQuestionCircle,
  FaArrowRight, FaPlay, FaRocket, FaShare, FaBookmark, FaTimes, FaLightbulb as FaBulb,
  FaStar
} from 'react-icons/fa'

import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout'
import Aurora from '../../../components/Aurora'

// --- THEMED CONSTANTS (Visual Only) ---
const GLASS_BG = "bg-white/80 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-white/10"
const GLASS_CARD = "bg-white dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/40 transition-all hover:shadow-2xl"
const GLASS_BUTTON = "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg text-white font-bold text-xs disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-orange-500/30"

export default function BusinessDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
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

  // Load reviews and set up real-time
  useEffect(() => {
    if (!user?.id) return
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

        // Fetch initial reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false })

        setReviews(reviewsData || [])
        updateStats(reviewsData || [])

        // Set up real-time subscription
        const channel = supabase
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

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (e) {
        console.error(e)
        setError('Failed to load reviews')
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.id, supabase])

  // Update stats whenever reviews change
  useEffect(() => {
    updateStats(reviews)
  }, [reviews])

  const updateStats = (reviewsData) => {
    if (reviewsData && reviewsData.length > 0) {
      const totalReviews = reviewsData.length
      const avgRating = reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews

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
      <div className="h-screen bg-white dark:bg-[#080808] flex items-center justify-center transition-colors">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <BusinessLayout>
      
      {/* BACKGROUND - UPDATED: Visible in Light/Dark Mode */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-white dark:bg-[#080808] transition-colors duration-300">
        <div className="absolute inset-0 transition-opacity duration-300 mix-blend-multiply dark:mix-blend-normal" style={{ clipPath: 'polygon(256px 0, 100% 0, 100% 100%, 256px 100%)' }}>
          <Aurora 
            color1="#ff6f00"
            color2="#ffa500"
            color3="#ff6f00"
            amplitude={1.0}
            blend={0.5}
            speed={0.1}
          />
        </div>
      </div>

      {/* PAGE HEADER */}
      <div className={`h-20 ${GLASS_BG} flex items-center px-8 relative z-10 transition-colors`}>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Reviews</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage and analyze your customer feedback
          </p>
        </div>
      </div>

      {/* ALERTS */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-8 py-3 bg-red-100 dark:bg-black/70 border-b border-red-500/50 text-red-700 dark:text-red-300 text-sm flex items-center gap-3 relative z-10"
          >
            <FaExclamationTriangle /> {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-8 py-3 bg-green-100 dark:bg-black/70 border-b border-green-500/50 text-green-700 dark:text-green-300 text-sm flex items-center gap-3 relative z-10"
          >
            <FaCheck /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto p-8 pb-20">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Total Reviews Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={GLASS_CARD}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">
                  Total Reviews
                </p>
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-600 dark:text-orange-400">
                  <FaCommentDots size={16} />
                </div>
              </div>
              <p className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                {stats.totalReviews}
              </p>

              {/* Mini Bar Chart */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(
                    (r) => Math.round(r.rating) === star
                  ).length
                  const percentage =
                    stats.totalReviews > 0
                      ? (count / stats.totalReviews) * 100
                      : 0
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-orange-500 dark:text-orange-300 w-3">{star}★</span>
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-orange-900/40 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-4 text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Average Rating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={GLASS_CARD}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">
                  Avg. Rating
                </p>
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400">
                  <FaEye size={16} />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-4xl font-black text-gray-900 dark:text-white">
                  {stats.averageRating}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">/5</p>
              </div>

              {/* Column Chart */}
              <div className="space-y-2">
                <div className="flex items-end justify-center gap-1 h-16">
                  {[...Array(5)].map((_, i) => {
                    const filled = i < Math.round(stats.averageRating)
                    const maxHeight = 100
                    const height = filled
                      ? ((5 - i) / 5) * maxHeight
                      : 20
                    return (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.05 + i * 0.1 }}
                        className={`flex-1 rounded-t ${
                          filled
                            ? 'bg-gradient-to-t from-yellow-400 to-yellow-500'
                            : 'bg-gray-200 dark:bg-gray-800/50'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    )
                  })}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {Math.round((stats.averageRating / 5) * 100)}% rating score
                </div>
              </div>
            </motion.div>

            {/* Recent Reviews Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={GLASS_CARD}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">
                  Last 30 Days
                </p>
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-600 dark:text-orange-400">
                  <FaRocket size={16} />
                </div>
              </div>
              <p className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                {stats.recentReviews}
              </p>

              {/* Progress Graph */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Growth</span>
                  <span className="text-orange-500 dark:text-orange-400 font-bold">
                    {stats.totalReviews > 0
                      ? Math.round((stats.recentReviews / stats.totalReviews) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-orange-900/40 rounded-full overflow-hidden">
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
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Of total reviews this month
                </div>
              </div>
            </motion.div>
          </div>

          {/* AI ANALYSIS */}
          <AnimatePresence>
            {showAnalyzer && analysis && (
              <ReviewsAnalyzer analysis={analysis} onClose={() => setShowAnalyzer(false)} />
            )}
          </AnimatePresence>

          {/* FILTER BAR */}
          <div className={`mb-6 ${GLASS_BG} flex items-center justify-between px-6 py-4 rounded-2xl relative z-10 transition-colors`}>
            <div className="flex gap-2 overflow-x-auto flex-1 no-scrollbar">
              {['all', '5', '4', '3', '2', '1'].map((rating) => (
                <motion.button
                  key={rating}
                  onClick={() => setFilterRating(rating)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 border ${
                    filterRating === rating
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/30'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-orange-500/30 hover:text-orange-500 dark:hover:text-white'
                  }`}
                >
                  {rating === 'all' ? 'All' : rating}⭐
                </motion.button>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <motion.button
                onClick={analyzeReviewsWithAI}
                disabled={analyzerLoading || reviews.length === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 ${GLASS_BUTTON}`}
              >
                <FaChartBar
                  size={12}
                  className={analyzerLoading ? 'animate-spin' : ''}
                />
                <span className="hidden sm:inline">
                  {analyzerLoading ? 'Analyzing...' : 'AI Analysis'}
                </span>
              </motion.button>
              <motion.button
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg text-gray-500 dark:text-gray-300 font-bold text-xs border border-gray-200 dark:border-white/10 flex items-center gap-2 transition-all shadow-sm"
              >
                <FaSync size={12} />
              </motion.button>
            </div>
          </div>

          {/* REVIEWS LIST */}
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
                <FaCommentDots size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-gray-900 dark:text-white font-bold mb-1">No reviews found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No reviews match your current filter
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </BusinessLayout>
  )
}

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

  const GLASS_CARD = "bg-white dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-md hover:shadow-xl dark:shadow-black/40 transition-all"

  return (
    <motion.div
      key={review.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={GLASS_CARD}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/20">
            {(review.user_name || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">{review.user_name || 'Anonymous'}</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <FaCalendar size={10} /> {formatDate(review.created_at)}
            </span>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={16}
              className={
                star <= (review.rating || 0)
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-gray-300 dark:text-gray-700'
              }
            />
          ))}
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{review.title}</h3>
      )}

      {/* Content */}
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
        {review.comment || review.text}
      </p>

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {review.photos.map((photo, i) => (
            <img
              key={i}
              src={photo}
              className="h-24 w-24 object-cover rounded-lg border border-gray-200 dark:border-white/10"
              alt={`Review photo ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-gray-200 dark:border-white/5 pt-4 mt-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FaShare size={14} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-2 text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        >
          <FaBookmark size={14} />
        </motion.button>
      </div>
    </motion.div>
  )
}

function ReviewsAnalyzer({ analysis, onClose }) {
  // Adaptive Analyzer Card
  const ANALYZER_CARD = "bg-white dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-8 mb-8 space-y-6 shadow-xl dark:shadow-black/40"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={ANALYZER_CARD}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg text-orange-600 dark:text-orange-400">
            <FaChartBar size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Reviews Analysis</h2>
        </div>
        <motion.button
          whileHover={{ rotate: 90 }}
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
        >
          <FaTimes size={20} />
        </motion.button>
      </div>

      {/* SENTIMENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100/50 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 p-4 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaSmile className="text-green-600 dark:text-green-400" />
            <p className="text-gray-600 dark:text-gray-300 text-xs font-bold">Positive</p>
          </div>
          <p className="text-3xl font-black text-green-600 dark:text-green-400">
            {analysis.sentimentBreakdown?.positive || 0}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-yellow-100/50 dark:bg-yellow-500/20 border border-yellow-200 dark:border-yellow-500/30 p-4 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaFilter className="text-yellow-600 dark:text-yellow-400" />
            <p className="text-gray-600 dark:text-gray-300 text-xs font-bold">Neutral</p>
          </div>
          <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">
            {analysis.sentimentBreakdown?.neutral || 0}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-100/50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 p-4 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaFrown className="text-red-600 dark:text-red-400" />
            <p className="text-gray-600 dark:text-gray-300 text-xs font-bold">Negative</p>
          </div>
          <p className="text-3xl font-black text-red-600 dark:text-red-400">
            {analysis.sentimentBreakdown?.negative || 0}%
          </p>
        </motion.div>
      </div>

      {/* KEY THEMES */}
      <div>
        <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2">
          <FaArrowUp className="text-orange-500 dark:text-orange-400" /> Key Themes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-black/70 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-4 rounded-xl">
            <p className="text-gray-500 dark:text-gray-300 text-xs font-bold mb-3">✓ MOST PRAISED</p>
            <div className="space-y-2">
              {(analysis.keyThemes?.praised || []).length > 0 ? (
                analysis.keyThemes.praised.map((theme, i) => (
                  <div key={i} className="flex items-start gap-2 text-green-600 dark:text-green-400 text-sm">
                    <span>✓</span> <span>{theme}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 dark:text-gray-500 text-sm">No data</div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-black/70 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-4 rounded-xl">
            <p className="text-gray-500 dark:text-gray-300 text-xs font-bold mb-3">
              ⚠ TOP COMPLAINTS
            </p>
            <div className="space-y-2">
              {(analysis.keyThemes?.complaints || []).length > 0 ? (
                analysis.keyThemes.complaints.map((complaint, i) => (
                  <div key={i} className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                    <span>⚠</span> <span>{complaint}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 dark:text-gray-500 text-sm">No data</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div>
          <h3 className="text-gray-900 dark:text-white font-bold mb-3 flex items-center gap-2">
            <FaBulb className="text-yellow-500 dark:text-yellow-400" /> Recommendations
          </h3>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-black/70 backdrop-blur-sm border border-yellow-200 dark:border-yellow-500/30 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300"
              >
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TREND */}
      {analysis.trend && (
        <div className="bg-blue-50 dark:bg-black/70 backdrop-blur-sm border border-blue-200 dark:border-blue-500/30 p-4 rounded-xl">
          <p className="text-gray-500 dark:text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
            <FaChartLine className="text-blue-500 dark:text-blue-400" /> Overall Trend
          </p>
          <p className="text-gray-700 dark:text-white text-sm">{analysis.trend}</p>
        </div>
      )}
    </motion.div>
  )
}
