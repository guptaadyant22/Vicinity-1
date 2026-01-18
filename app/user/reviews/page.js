// User reviews management page with view, edit, delete, search, and filter functionality
// COMPONENTS:
// VICINITY LOGO - Branded logo component with optional text display
// HEADER - Navigation bar with logo, links, profile button, and logout
// STAT CARD - Statistics card displaying key metrics (total reviews, avg rating, impact)
// REVIEW DETAIL MODAL - Full-screen modal for viewing, editing, and deleting individual reviews
// REVIEW CARD - Individual review card with business info, rating, comment preview, and edit button
// HELPER FUNCTIONS:
// GET RATING COLOR - Returns color styling based on review rating value (green/yellow/orange)
// GET STAR COLOR - Returns star icon color based on rating (green 4.5+, yellow 3.5+, orange)
// HANDLE SAVE EDIT - Updates edited review (rating, comment) to database
// HANDLE DELETE - Permanently deletes review from database with confirmation
// HANDLE VIEW DETAILS - Opens modal with selected review for full viewing/editing
// HANDLE DELETE REVIEW - Removes deleted review from state
// HANDLE UPDATE REVIEW - Updates edited review in state and modal
// HANDLE LOGOUT - Signs out user and redirects to home page
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaStar, FaCalendarAlt, FaFilter, FaTrash, FaEdit, FaTimes, FaCheck, FaSearch,
  FaChartLine, FaPencilAlt, FaFire, FaQuoteLeft
} from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'

// --- THEME CONSTANTS ---
// Primary gradient color scheme for Vicinity branding
const THEME = {
  accentGrad: 'from-orange-500 to-pink-500',
}

// Adaptive colors for StatCards - matches Vicinity theme
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
  const router = useRouter() // Hook for navigation

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
          <a href="/user/saved" className="hover:text-gray-900 dark:hover:text-white transition-colors relative group">
            Saved
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
          </a>
          <a href="/user/reviews" className="text-gray-900 dark:text-white font-bold transition-colors relative group">
            Reviews
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500 transition-all" />
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
          <p className="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{value}</p>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1.5">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

// --- REVIEW DETAIL MODAL ---
// Full-screen modal for viewing, editing, and deleting reviews
const ReviewDetailModal = ({ review, isOpen, onClose, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedComment, setEditedComment] = useState(review?.comment || '')
  const [editedRating, setEditedRating] = useState(review?.rating || 5)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  // Sync state when review changes
  useEffect(() => {
    if (review) {
      setEditedComment(review.comment)
      setEditedRating(review.rating)
      setIsEditing(false)
    }
  }, [review])

  // Returns color based on rating value
  const getStarColor = (rating) => {
    if (rating >= 4.5) return 'text-green-500 dark:text-green-400'
    if (rating >= 3.5) return 'text-yellow-500 dark:text-yellow-400'
    return 'text-orange-500 dark:text-orange-400'
  }

  // Saves edited review to database
  const handleSaveEdit = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          comment: editedComment,
          rating: editedRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', review.id)

      if (error) throw error
      onUpdate({
        ...review,
        comment: editedComment,
        rating: editedRating
      })
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating review:', err)
      alert('Failed to update review')
    } finally {
      setIsSaving(false)
    }
  }

  // Deletes review from database
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', review.id)
      if (error) throw error
      onDelete(review.id)
      onClose()
    } catch (err) {
      console.error('Error deleting review:', err)
      alert('Failed to delete review')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!review) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] backdrop-blur-xl border border-gray-200 dark:border-white/15 rounded-3xl p-8 pointer-events-auto shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{review.business_name}</h2>
                  <p className="text-sm text-orange-500 dark:text-orange-400 font-bold uppercase">{review.business_type}</p>
                </div>
                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <FaTimes className="text-gray-500 dark:text-gray-400 text-xl" />
                </motion.button>
              </div>

              {/* Rating display or edit section */}
              {!isEditing ? (
                <div className="flex items-center gap-3 mb-8">
                  <div className={`flex items-center gap-1 text-2xl font-black ${getStarColor(review.rating)}`}>
                    {[...Array(Math.round(review.rating))].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <span className="text-4xl font-black text-gray-900 dark:text-white">{review.rating}</span>
                  <span className="text-gray-500 dark:text-gray-400">/5.0</span>
                </div>
              ) : (
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-gray-600 dark:text-gray-400 font-bold">Rating:</span>
                  {/* Interactive star rating selector */}
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditedRating(star)}
                        className={`text-3xl transition-colors ${star <= editedRating ? 'text-orange-500 dark:text-orange-400' : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        <FaStar />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Review comment section */}
              <div className="mb-8">
                <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 block">Your Review</label>
                {!isEditing ? (
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/15 relative">
                    <FaQuoteLeft className="absolute top-3 left-3 text-gray-300 dark:text-white/10 text-lg" />
                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed pl-8">{review.comment}</p>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                      className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/20 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors resize-none"
                      rows={5}
                      maxLength={500}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2">{editedComment.length}/500 characters</p>
                  </>
                )}
              </div>

              {/* Posted date */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
                <FaCalendarAlt />
                Posted on {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {!isEditing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditing(true)}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-shadow"
                    >
                      <FaEdit size={16} />
                      Edit Review
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/25 transition-shadow disabled:opacity-50"
                    >
                      <FaTrash size={16} />
                      Delete Review
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/25 transition-shadow disabled:opacity-50"
                    >
                      <FaCheck size={16} />
                      Save Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsEditing(false)
                        setEditedComment(review.comment)
                        setEditedRating(review.rating)
                      }}
                      className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-white font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-black/50 transition-colors"
                    >
                      <FaTimes size={16} />
                      Cancel
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// --- REVIEW CARD ---
// Individual review card component with animation
const ReviewCard = React.forwardRef(({ review, index, onViewDetails }, ref) => {
  // Returns color styling based on rating value
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return { bg: 'bg-green-100 dark:bg-green-500/10', border: 'border-green-200 dark:border-green-500/30', text: 'text-green-600 dark:text-green-400' }
    if (rating >= 3.5) return { bg: 'bg-yellow-100 dark:bg-yellow-500/10', border: 'border-yellow-200 dark:border-yellow-500/30', text: 'text-yellow-600 dark:text-yellow-400' }
    return { bg: 'bg-orange-100 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/30', text: 'text-orange-600 dark:text-orange-400' }
  }

  const ratingStyle = getRatingColor(review.rating)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      onClick={() => onViewDetails(review)}
      className="group cursor-pointer h-full"
    >
      <div className="h-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/40 backdrop-blur-xl hover:border-orange-300 dark:hover:border-white/25 hover:shadow-lg dark:hover:bg-black/50 transition-all duration-300 overflow-hidden">
        {/* Header with business name and rating */}
        <div className={`p-5 ${ratingStyle.bg} border-b ${ratingStyle.border}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-gray-900 dark:text-white truncate group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">{review.business_name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mt-1">{review.business_type}</p>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border ${ratingStyle.border} ${ratingStyle.bg} whitespace-nowrap flex-shrink-0`}>
              <FaStar size={14} className={ratingStyle.text} />
              <span className={`font-black text-sm ${ratingStyle.text}`}>{review.rating}</span>
            </div>
          </div>
        </div>

        {/* Review comment preview */}
        <div className="p-5">
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-4 mb-4">{review.comment}</p>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 dark:text-orange-400 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
            <span>View full review</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* Footer with date and edit button */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <FaCalendarAlt size={12} />
              <span>{new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-500/30 group-hover:border-orange-300 dark:group-hover:border-orange-500/50 transition-colors">
              Edit
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

ReviewCard.displayName = 'ReviewCard'

export default function ReviewsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  // State management for reviews, filters, and modals
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [filterRating, setFilterRating] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)
  const [selectedReview, setSelectedReview] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  // Fetch reviews from database and subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch user's reviews from database
        const { data: reviewsData, error: rError } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (rError) throw rError

        // Enrich reviews with business name and type
        const enrichedReviews = await Promise.all(
          (reviewsData || []).map(async (review) => {
            const { data: businessData } = await supabase
              .from('businesses')
              .select('name, type')
              .eq('id', review.business_id)
              .single()

            return {
              ...review,
              business_name: businessData?.name || 'Unknown Business',
              business_type: businessData?.type || 'Business'
            }
          })
        )

        setReviews(enrichedReviews)
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError('Failed to load reviews.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Subscribe to real-time review changes
    const channel = supabase
      .channel(`user-reviews-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reviews',
        filter: `user_id=eq.${user.id}`,
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const { data: businessData } = await supabase.from('businesses').select('name, type').eq('id', payload.new.business_id).single()
          const enrichedReview = {
            ...payload.new,
            business_name: businessData?.name || 'Unknown Business',
            business_type: businessData?.type || 'Business'
          }
          setReviews((prev) => [enrichedReview, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          const { data: businessData } = await supabase.from('businesses').select('name, type').eq('id', payload.new.business_id).single()
          const enrichedReview = {
            ...payload.new,
            business_name: businessData?.name || 'Unknown Business',
            business_type: businessData?.type || 'Business'
          }
          setReviews((prev) => prev.map((r) => (r.id === enrichedReview.id ? enrichedReview : r)))
          if (selectedReview?.id === enrichedReview.id) {
            setSelectedReview(enrichedReview)
          }
        } else if (payload.eventType === 'DELETE') {
          setReviews((prev) => prev.filter((r) => r.id !== payload.old.id))
          if (selectedReview?.id === payload.old.id) {
            setIsModalOpen(false)
          }
        }
      }).subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, supabase, selectedReview?.id])

  // Sign out user and redirect to home
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Open modal with selected review
  const handleViewDetails = (review) => {
    setSelectedReview(review)
    setIsModalOpen(true)
  }

  // Remove deleted review from state
  const handleDeleteReview = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId))
  }

  // Update edited review in state
  const handleUpdateReview = (updatedReview) => {
    setReviews((prev) => prev.map((r) => (r.id === updatedReview.id ? updatedReview : r)))
    setSelectedReview(updatedReview)
  }

  // Filter reviews by rating and search query
  const filteredReviews = reviews.filter((r) => {
    const matchesRating = filterRating === 0 || r.rating >= filterRating
    const matchesSearch = searchQuery === '' || 
      r.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.business_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRating && matchesSearch
  })

  // Calculate statistics from reviews
  const stats = {
    total: reviews.length,
    avgRating: reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0',
    impact: (reviews.length * 8).toLocaleString() + '+'
  }

  if (authLoading || !user) return <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors" />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-200 font-sans selection:bg-orange-500/25 selection:text-white overflow-x-hidden transition-colors duration-300">
      
      {/* TOP LEFT CORNER - Orange/Rose gradient orb (changed from purple/blue) */}
      <div className="fixed -top-40 -left-40 w-96 h-96 md:w-[500px] md:h-[500px] bg-gradient-to-br from-orange-600/30 via-orange-500/25 to-transparent rounded-full blur-[100px] opacity-80 pointer-events-none mix-blend-multiply dark:mix-blend-normal" style={{
        animation: 'float-top-left 12s ease-in-out infinite',
      }} />
      
      {/* BOTTOM RIGHT CORNER - Pink/Rose gradient orb (matches theme) */}
      <div className="fixed -bottom-40 -right-40 w-96 h-96 md:w-[500px] md:h-[500px] bg-gradient-to-tl from-pink-600/30 via-rose-500/25 to-transparent rounded-full blur-[100px] opacity-85 pointer-events-none mix-blend-multiply dark:mix-blend-normal" style={{
        animation: 'float-bottom-right 15s ease-in-out infinite',
      }} />

      <style>{`
        @keyframes float-top-left {
          0%, 100% { 
            transform: translate(0px, 0px);
            opacity: 0.8;
          }
          50% { 
            transform: translate(40px, 40px);
            opacity: 1;
          }
        }
        @keyframes float-bottom-right {
          0%, 100% { 
            transform: translate(0px, 0px);
            opacity: 0.85;
          }
          50% { 
            transform: translate(-40px, -40px);
            opacity: 1;
          }
        }
      `}</style>

      <Header onLogout={handleLogout} />

      <ReviewDetailModal
        review={selectedReview}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedReview(null)
        }}
        onDelete={handleDeleteReview}
        onUpdate={handleUpdateReview}
      />

      <main className="max-w-7xl mx-auto px-6 py-10 pt-32 relative z-10">
        <section className="mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter mb-4 leading-[0.9]">
              Your Voice, <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${THEME.accentGrad}`}>
                Your Reviews
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl leading-relaxed">
              Every review you write helps others discover amazing places.
            </p>
          </motion.div>

          {/* Statistics cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Reviews" value={stats.total} icon={FaPencilAlt} color="orange" delay={0.1} />
            <StatCard label="Avg Rating" value={stats.avgRating} icon={FaChartLine} color="purple" delay={0.2} />
            <StatCard label="Impact" value={stats.impact} icon={FaFire} color="rose" delay={0.3} />
          </div>

          {/* Search bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-500 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Search your reviews by business name, type, or comment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all shadow-sm"
              />
              {searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <FaTimes size={14} />
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Rating filter buttons */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/15 hover:bg-white/90 dark:hover:bg-black/50 transition-all shadow-sm">
            <FaFilter className="text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Filter by Rating:</span>
            <div className="flex gap-2">
              {[0, 5, 4, 3].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(rating)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    filterRating === rating
                      ? 'bg-orange-100 dark:bg-orange-500/20 border-orange-200 dark:border-orange-500/50 text-orange-600 dark:text-orange-300'
                      : 'bg-white dark:bg-black/40 border-gray-200 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/25 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {rating === 0 ? 'All' : `${rating}+ ★`}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Reviews grid or empty state */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-black/40 rounded-2xl animate-pulse border border-gray-300 dark:border-white/15" />
            ))}
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredReviews.map((review, idx) => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  index={idx}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-32 bg-white/50 dark:bg-black/40 rounded-3xl border border-dashed border-gray-300 dark:border-white/15 backdrop-blur-xl">
            <div className="w-20 h-20 bg-gray-100 dark:bg-black/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-200 dark:border-white/15">
              <FaStar size={32} className="text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {searchQuery 
                ? `No reviews match "${searchQuery}"`
                : filterRating > 0 
                ? `No ${filterRating}+ star reviews yet` 
                : 'No reviews yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {searchQuery
                ? 'Try a different search query.'
                : filterRating > 0
                ? 'Try adjusting the filter to see all reviews.'
                : 'Share your experiences to help the community discover great places.'}
            </p>
            {!searchQuery && (
              <a
                href="/user/dashboard"
                className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-orange-500/25 transition-all shadow-lg shadow-orange-500/20"
              >
                Explore & Review Places
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
