'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaStar,
  FaCalendarAlt,
  FaFilter,
  FaTrash,
  FaEdit,
  FaTimes,
  FaCheck,
  FaSearch,
  FaChartLine,
  FaPencilAlt,
  FaFire,
  FaQuoteLeft,
} from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import VicinityLogo from '../../../components/VicinityLogo'
import UserNavbar from '../../../components/UserNavbar'

// --- SHARED UI SYSTEM ---
// Matches the attached blue glass UI style
const UI = {
  page: 'min-h-screen text-slate-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden transition-colors duration-300',
  card: 'bg-white dark:bg-[#0f172a] border border-blue-500/12 dark:border-white/10 rounded-[28px] shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-colors duration-300',
  cardSoft: 'bg-white dark:bg-[#111827] border border-blue-500/10 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none transition-colors duration-300',
  modal: 'bg-white dark:bg-[#0f172a] border border-blue-500/12 dark:border-white/10 rounded-[30px] p-8 shadow-[0_20px_70px_rgba(15,23,42,0.16)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)] transition-colors duration-300',
  input: 'w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#111827] border border-blue-500/15 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-blue-50/60 dark:focus:bg-[#162033] transition-all text-sm',
  primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]',
  secondaryButton: 'bg-white dark:bg-[#162033] hover:bg-blue-50 dark:hover:bg-[#1c2940] text-slate-700 dark:text-white border border-blue-500/12 dark:border-white/10',
  softBlueButton: 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-300',
  softRedButton: 'bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-300',
}

// --- PAGE BACKGROUND ---
// Same animated blue glow + grid style
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
// Top navbar styled to match attached UI
// Header is now the shared UserNavbar component

// --- STAT CARD ---
// Top stats card
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
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/[0.01] to-cyan-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`p-3.5 rounded-2xl border ${iconStyleMap[color] || iconStyleMap.blue}`}>
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

// --- REVIEW MODAL ---
// Full detail modal
const ReviewDetailModal = ({ review, isOpen, onClose, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedComment, setEditedComment] = useState(review?.comment || '')
  const [editedRating, setEditedRating] = useState(review?.rating || 5)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  // Sync modal state when selection changes
  useEffect(() => {
    if (review) {
      setEditedComment(review.comment)
      setEditedRating(review.rating)
      setIsEditing(false)
    }
  }, [review])

  // Rating color helper
  const getStarColor = (rating) => {
    if (rating >= 4.5) return 'text-yellow-400'
    if (rating >= 3.5) return 'text-amber-400'
    return 'text-orange-400'
  }

  // Save changes
  const handleSaveEdit = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          comment: editedComment,
          rating: editedRating,
          updated_at: new Date().toISOString(),
        })
        .eq('id', review.id)

      if (error) throw error

      onUpdate({
        ...review,
        comment: editedComment,
        rating: editedRating,
      })

      setIsEditing(false)
    } catch (err) {
      console.error('Error updating review:', err)
      alert('Failed to update review')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete review
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
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/55 dark:bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
          >
            <div className={`${UI.modal} w-full max-w-2xl pointer-events-auto max-h-[90vh] overflow-y-auto relative text-slate-900 dark:text-white`}>
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 hover:bg-blue-50 dark:hover:bg-[#162033] rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <FaTimes size={20} />
              </button>

              <div className="mb-6">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{review.business_name}</h2>
                <p className="text-sm font-bold uppercase text-blue-600 dark:text-blue-300">{review.business_type}</p>
              </div>

              {/* Rating section */}
              {!isEditing ? (
                <div className="flex items-center gap-3 mb-8">
                  <div className={`flex items-center gap-1 text-2xl font-black ${getStarColor(review.rating)}`}>
                    {[...Array(Math.round(review.rating))].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{review.rating}</span>
                  <span className="text-slate-500 dark:text-slate-400">/5.0</span>
                </div>
              ) : (
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-slate-600 dark:text-slate-400 font-bold">Rating:</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditedRating(star)}
                        className={`text-3xl transition-all ${star <= editedRating ? 'text-yellow-400 scale-110' : 'text-slate-300 dark:text-white/20'}`}
                      >
                        <FaStar />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment section */}
              <div className="mb-8">
                <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 block">
                  Your Review
                </label>

                {!isEditing ? (
                  <div className={`${UI.cardSoft} relative p-5`}>
                    <FaQuoteLeft className="absolute top-4 left-4 text-blue-200 dark:text-white/10 text-lg" />
                    <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed pl-8">{review.comment}</p>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                      className={`${UI.input} h-32 resize-none`}
                      rows={5}
                      maxLength={500}
                      autoFocus
                    />
                    <p className="text-xs text-slate-500 mt-2">{editedComment.length}/500 characters</p>
                  </>
                )}
              </div>

              {/* Date row */}
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 pb-8 border-b border-blue-500/10 dark:border-white/10">
                <FaCalendarAlt />
                Posted on {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {!isEditing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditing(true)}
                      className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${UI.primaryButton}`}
                    >
                      <FaEdit size={16} />
                      Edit Review
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-red-600 hover:bg-red-700 text-white shadow-[0_10px_30px_rgba(220,38,38,0.22)] disabled:opacity-50"
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
                      className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${UI.primaryButton}`}
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
                      className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${UI.secondaryButton}`}
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
// Individual review card
const ReviewCard = React.forwardRef(({ review, index, onViewDetails }, ref) => {
  // Rating chip style
  const getRatingColor = (rating) => {
    if (rating >= 4.5) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-300',
      }
    }
    if (rating >= 3.5) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-200 dark:border-amber-500/20',
        text: 'text-amber-600 dark:text-amber-300',
      }
    }
    return {
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      border: 'border-orange-200 dark:border-orange-500/20',
      text: 'text-orange-600 dark:text-orange-300',
    }
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
      <div className={`${UI.cardSoft} h-full overflow-hidden hover:border-blue-500/18 dark:hover:border-white/20 transition-all`}>
        {/* Header */}
        <div className={`p-5 border-b ${ratingStyle.bg} ${ratingStyle.border}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                {review.business_name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase mt-1">{review.business_type}</p>
            </div>

            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl border ${ratingStyle.border} ${ratingStyle.bg} whitespace-nowrap flex-shrink-0`}>
              <FaStar size={14} className={ratingStyle.text} />
              <span className={`font-black text-sm ${ratingStyle.text}`}>{review.rating}</span>
            </div>
          </div>
        </div>

        {/* Comment preview */}
        <div className="p-5">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-4 mb-4">{review.comment}</p>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-300 group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors">
            <span>View full review</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-blue-500/10 dark:border-white/10 bg-slate-50/70 dark:bg-[#0b1220]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <FaCalendarAlt size={12} />
              <span>{new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-xs font-bold px-2.5 py-1 rounded-2xl border transition-all bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500/20"
            >
              Edit
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

ReviewCard.displayName = 'ReviewCard'

// --- MAIN PAGE ---
export default function ReviewsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  // Main state
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [filterRating, setFilterRating] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)
  const [selectedReview, setSelectedReview] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  // Fetch and subscribe to reviews
  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get reviews
        const { data: reviewsData, error: rError } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (rError) throw rError

        // Enrich with business data
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
              business_type: businessData?.type || 'Business',
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

    // Realtime updates
    const channel = supabase
      .channel(`user-reviews-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: businessData } = await supabase
              .from('businesses')
              .select('name, type')
              .eq('id', payload.new.business_id)
              .single()

            const enrichedReview = {
              ...payload.new,
              business_name: businessData?.name || 'Unknown Business',
              business_type: businessData?.type || 'Business',
            }

            setReviews((prev) => [enrichedReview, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const { data: businessData } = await supabase
              .from('businesses')
              .select('name, type')
              .eq('id', payload.new.business_id)
              .single()

            const enrichedReview = {
              ...payload.new,
              business_name: businessData?.name || 'Unknown Business',
              business_type: businessData?.type || 'Business',
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
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, supabase, selectedReview?.id])

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Open detail modal
  const handleViewDetails = (review) => {
    setSelectedReview(review)
    setIsModalOpen(true)
  }

  // Remove deleted review
  const handleDeleteReview = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId))
  }

  // Update edited review
  const handleUpdateReview = (updatedReview) => {
    setReviews((prev) => prev.map((r) => (r.id === updatedReview.id ? updatedReview : r)))
    setSelectedReview(updatedReview)
  }

  // Filters
  const filteredReviews = reviews.filter((r) => {
    const matchesRating = filterRating === 0 || r.rating >= filterRating
    const matchesSearch =
      searchQuery === '' ||
      r.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.business_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesRating && matchesSearch
  })

  // Stats
  const stats = {
    total: reviews.length,
    avgRating: reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0',
    impact: (reviews.length * 8).toLocaleString() + '+',
  }

  if (authLoading || !user) {
    return <div className="min-h-screen bg-white dark:bg-[#081120] transition-colors" />
  }

  return (
    <div className={UI.page}>
      <Background />

      <UserNavbar activePage="reviews" onLogout={handleLogout} />

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
          {/* Page intro */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-[0.9]">
              Your Voice, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Your Reviews
              </span>
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl leading-relaxed">
              Every review you write helps others discover amazing places.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Reviews" value={stats.total} icon={FaPencilAlt} color="blue" delay={0.1} />
            <StatCard label="Avg Rating" value={stats.avgRating} icon={FaChartLine} color="indigo" delay={0.2} />
            <StatCard label="Impact" value={stats.impact} icon={FaFire} color="cyan" delay={0.3} />
          </div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-slate-400 dark:text-slate-500 text-sm" />
              </div>

              <input
                type="text"
                placeholder="Search your reviews by business name, type, or comment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${UI.input} pl-11 pr-12`}
              />

              {searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <FaTimes size={14} />
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Filter row */}
          <div className={`${UI.cardSoft} flex flex-wrap items-center gap-4 p-4`}>
            <FaFilter className="text-slate-400 dark:text-slate-500" />
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Filter by Rating:</span>

            <div className="flex gap-2 flex-wrap">
              {[0, 5, 4, 3].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(rating)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
                    filterRating === rating
                      ? 'bg-blue-600 text-white border-blue-600 shadow-[0_10px_30px_rgba(59,130,246,0.24)]'
                      : 'bg-white dark:bg-[#162033] text-slate-600 dark:text-slate-300 border-blue-500/12 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-[#1c2940] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {rating === 0 ? 'All' : `${rating}+ ★`}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-4 py-3 rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-sm text-red-600 dark:text-red-300"
          >
            {error}
          </motion.div>
        )}

        {/* Main content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-[28px] bg-white dark:bg-[#111827] border border-blue-500/10 dark:border-white/10 animate-pulse"
              />
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
          <div className="p-16 rounded-[28px] bg-white dark:bg-[#111827] border border-dashed border-blue-200 dark:border-white/10 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-slate-50 dark:bg-[#162033] border border-blue-500/10 dark:border-white/10">
              <FaStar size={32} className="text-slate-300 dark:text-white/20" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {searchQuery
                ? `No reviews match "${searchQuery}"`
                : filterRating > 0
                ? `No ${filterRating}+ star reviews yet`
                : 'No reviews yet'}
            </h3>

            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {searchQuery
                ? 'Try a different search query.'
                : filterRating > 0
                ? 'Try adjusting the filter to see all reviews.'
                : 'Share your experiences to help the community discover great places.'}
            </p>

            {!searchQuery && (
              <a
                href="/user/dashboard"
                className="inline-block px-8 py-3 rounded-2xl font-bold text-sm transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
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
