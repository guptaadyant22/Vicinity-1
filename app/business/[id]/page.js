// Business detail page with real-time reviews, deals, gallery, favorites, and review management
// HELPER FUNCTIONS:
// GET COVER IMAGE - Returns business image or placeholder
// FORMAT FULL ADDRESS - Combines address fields into readable string
// FORMAT REVIEW DATE - Converts timestamp to "X days ago" format
// FORMAT BUSINESS HOURS - Converts time formats (9-5, 09:00, objects) to 12-hour format
// GET DEAL LABEL - Returns formatted discount label (e.g., "25% OFF")
// GET DEAL EMOJI - Returns emoji based on deal type
// IS EXPIRED - Checks if deal expiry date has passed
// HANDLERS:
// TOGGLE FAVORITE - Add/remove business from user's favorites
// HANDLE SUBMIT REVIEW - Posts new review with rating and text
// HANDLE EDIT REVIEW - Updates existing review
// HANDLE DELETE REVIEW - Removes review with confirmation

'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaStar, FaMapMarkerAlt, FaTimes, FaArrowLeft, FaPhone,
  FaEnvelope, FaGlobe, FaCheck, FaClock, FaChevronLeft, FaChevronRight,
  FaShareAlt, FaHeart, FaInfoCircle, FaImages, FaTag, FaRegHeart, FaEdit, FaTrash,
  FaMapPin, FaExternalLinkAlt, FaCalendar, FaQuoteLeft
} from 'react-icons/fa'
import { createClient } from '../../../lib/supabase'

// --- CONSTANTS ---
const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=800&fit=crop'


const VicinityLogo = ({ className = "", textClassName = "" }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
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
    <span className={`font-black text-gray-900 dark:text-white text-xl tracking-tight ${textClassName}`}>Vicinity</span>
  </div>
)

const Background = () => (
  <div className="fixed inset-0 -z-50 bg-gray-50 dark:bg-[#080808] pointer-events-none transition-colors duration-300">
    {/* Top-left orange orb - theme color */}
    <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-orange-200/50 dark:bg-orange-600/15 rounded-full blur-[120px]" />
    {/* Bottom-right pink/rose orb - theme color */}
    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-200/50 dark:bg-pink-600/15 rounded-full blur-[120px]" />
  </div>
)

// --- HELPER FUNCTIONS ---
const getCoverImage = (business) => {
  if (business?.image_url && business.image_url.trim().length > 0) {
    return business.image_url
  }
  return PLACEHOLDER_IMAGE
}

const formatFullAddress = (business) => {
  if (!business) return 'Address not available'
  const parts = [business.address, business.city, business.state, business.zip].filter(
    (val) => val && val.toString().trim().length > 0
  )
  return parts.length > 0 ? parts.join(', ') : 'Address not available'
}

const formatReviewDate = (timestamp) => {
  if (!timestamp) return 'Recently'
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`

    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch (e) {
    console.warn('⚠️ Failed to parse date:', e)
    return 'Recently'
  }
}

const formatBusinessHours = (timeObj, dayName = '') => {
  if (!timeObj) return 'Closed'

  // Handle string inputs (like "9-5" or "09:00" from dashboard)
  if (typeof timeObj === 'string') {
    const str = timeObj.toString().trim()
    if (str.toLowerCase().includes('closed')) return 'Closed'

    // Handle "9-5" format (with dash)
    if (str.includes('-') && !str.includes(':')) {
      const [openStr, closeStr] = str.split('-').map(s => s.trim())
      
      const formatTimeFromNumber = (timeStr) => {
        const num = parseInt(timeStr, 10)
        if (!isNaN(num) && num >= 0 && num <= 23) {
          const ampm = num >= 12 ? 'PM' : 'AM'
          const hour12 = num % 12 || 12
          return `${hour12}:00 ${ampm}`
        }
        return timeStr
      }
      
      return `${formatTimeFromNumber(openStr)} - ${formatTimeFromNumber(closeStr)}`
    }

    // Handle "HH:MM" format (09:00, 17:30, etc)
    if (str.includes(':')) {
      const [h, m] = str.split(':')
      const hour = parseInt(h, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 || 12
      return `${hour12}:${m} ${ampm}`
    }

    // Handle plain numbers as strings ("9", "17")
    const timeNum = parseInt(str, 10)
    if (!isNaN(timeNum) && timeNum >= 0 && timeNum <= 23) {
      const ampm = timeNum >= 12 ? 'PM' : 'AM'
      const hour12 = timeNum % 12 || 12
      return `${hour12}:00 ${ampm}`
    }

    return str
  }

  // Handle pure number inputs
  const num = Number(timeObj)
  if (!isNaN(num) && Number.isInteger(num) && (typeof timeObj === 'number' || /^\d+$/.test(String(timeObj)))) {
    const hour = num
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:00 ${ampm}`
  }

  // Handle object inputs
  if (typeof timeObj === 'object' && timeObj !== null) {
    if (timeObj.closed === true) return 'Closed'

    const formatTime = (time) => {
      if (time === null || time === undefined || time === '') return ''

      const timeNum = Number(time)
      if (!isNaN(timeNum) && Number.isInteger(timeNum)) {
        const hour = timeNum
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const hour12 = hour % 12 || 12
        return `${hour12}:00 ${ampm}`
      }

      const timeStr = time.toString().trim()

      if (timeStr.includes(':')) {
        const [h, m] = timeStr.split(':')
        const hour = parseInt(h, 10)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const hour12 = hour % 12 || 12
        return `${hour12}:${m} ${ampm}`
      }

      const parsedNum = parseInt(timeStr, 10)
      if (!isNaN(parsedNum) && parsedNum >= 0 && parsedNum <= 23) {
        const ampm = parsedNum >= 12 ? 'PM' : 'AM'
        const hour12 = parsedNum % 12 || 12
        return `${hour12}:00 ${ampm}`
      }

      return timeStr
    }

    if ((timeObj.open && timeObj.close) || (timeObj.start && timeObj.end)) {
      const openTime = timeObj.open || timeObj.start
      const closeTime = timeObj.close || timeObj.end
      return `${formatTime(openTime)} - ${formatTime(closeTime)}`
    }
  }

  return 'Closed'
}





const getDealLabel = (deal) => {
  if (!deal) return ''

  const typeLabels = {
    percentage: `${deal.discount_value}% OFF`,
    fixed: `$${deal.discount_value} OFF`,
    bogo: 'BUY ONE GET ONE',
    free: 'FREE ITEM'
  }

  return typeLabels[deal.discount_type] || 'SPECIAL DEAL'
}

const getDealEmoji = (deal) => {
  if (!deal) return '✨'

  const emojis = {
    percentage: '📊',
    fixed: '💰',
    bogo: '🎁',
    free: '🎉'
  }

  return emojis[deal.discount_type] || '✨'
}

// CHECK IF DEAL IS EXPIRED
const isExpired = (expiryDate) => {
  if (!expiryDate) return false
  try {
    const now = new Date()
    const expiry = new Date(expiryDate)
    return now > expiry
  } catch (e) {
    return false
  }
}

// --- SUB-COMPONENTS ---
const ActionButton = ({ icon: Icon, onClick, color = 'text-gray-700 dark:text-white', label = '' }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    title={label}
    className="w-11 h-11 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 flex items-center justify-center hover:bg-white dark:hover:bg-white/20 hover:border-orange-500/30 transition-all cursor-pointer group shadow-sm"
  >
    <Icon className={`${color} group-hover:scale-110 transition-transform`} />
  </motion.button>
)

const Modal = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-black/90 backdrop-blur-md"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-gray-900 dark:text-white"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all"
      >
        <FaTimes size={20} />
      </button>
      {children}
    </motion.div>
  </motion.div>
)

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full"
      />
      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading business details...</p>
    </div>
  </div>
)

const ErrorDisplay = ({ error }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center px-4">
    <div className="text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-2">Error Loading Business</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
    </div>
  </div>
)

// --- MAIN PAGE COMPONENT ---
export default function BusinessDetailPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params?.id
  const supabase = createClient()

  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [reviews, setReviews] = useState([])
  const [photoUrls, setPhotoUrls] = useState([])
  const [isFavorited, setIsFavorited] = useState(false)
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [success, setSuccess] = useState(null)

  const [showNav, setShowNav] = useState(true)
  const lastScrollY = useRef(0)

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)

  const [editingReviewId, setEditingReviewId] = useState(null)
  const [editReviewText, setEditReviewText] = useState('')
  const [editReviewRating, setEditReviewRating] = useState(5)
  const [isEditingReview, setIsEditingReview] = useState(false)

  const [deals, setDeals] = useState([])
  const [copiedCode, setCopiedCode] = useState(null)

  // SCROLL HANDLER
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setShowNav(currentScrollY < lastScrollY.current || currentScrollY < 100)
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // AUTH
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser)
        if (authUser) {
          setUserData({
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          })
        }
      } catch (err) {
        console.error('❌ Auth error:', err)
      }
    }
    getUser()
  }, [supabase])

  // FETCH BUSINESS DATA
  useEffect(() => {
    if (!businessId) {
      setError('No business ID provided')
      setLoading(false)
      return
    }

    ; (async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: busData, error: busError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single()

        if (busError) throw new Error(busError.message || 'Business not found')
        if (!busData) throw new Error('Business data is empty')

        // Parse hours
        let parsedHours = null
        if (busData.hours) {
          if (typeof busData.hours === 'string') {
            try {
              parsedHours = JSON.parse(busData.hours)
            } catch {
              parsedHours = busData.hours
            }
          } else {
            parsedHours = busData.hours
          }
        }

        // Parse tags
        let parsedTags = []
        if (busData.tags) {
          if (typeof busData.tags === 'string') {
            try {
              parsedTags = JSON.parse(busData.tags)
            } catch {
              parsedTags = []
            }
          } else if (Array.isArray(busData.tags)) {
            parsedTags = busData.tags
          }
        }

        // Parse gallery
        let galleryImages = []
        if (busData.gallery) {
          if (typeof busData.gallery === 'string') {
            try {
              galleryImages = JSON.parse(busData.gallery)
              if (!Array.isArray(galleryImages)) galleryImages = []
            } catch {
              galleryImages = []
            }
          } else if (Array.isArray(busData.gallery)) {
            galleryImages = busData.gallery
          }
        }
        setPhotoUrls(galleryImages)

        setBusiness({
          ...busData,
          fullAddress: formatFullAddress(busData),
          tags: parsedTags,
          hours: parsedHours,
          gallery: galleryImages,
        })
      } catch (err) {
        console.error('❌ Data fetch error:', err.message)
        setError(err.message || 'Failed to load business details')
      } finally {
        setLoading(false)
      }
    })()
  }, [businessId, supabase])

  // REALTIME REVIEWS
  useEffect(() => {
    if (!businessId) return

      ; (async () => {
        try {
          const { data: reviewsData } = await supabase
            .from('reviews')
            .select('*')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false })

          setReviews(reviewsData || [])

          const channel = supabase
            .channel(`business-reviews-${businessId}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'reviews',
                filter: `business_id=eq.${businessId}`,
              },
              (payload) => {
                if (payload.eventType === 'INSERT') {
                  // CHECK IF REVIEW ALREADY EXISTS IN STATE TO AVOID DUPLICATES
                  setReviews((prev) => {
                    const reviewExists = prev.some((r) => r.id === payload.new.id)
                    if (reviewExists) return prev
                    return [payload.new, ...prev]
                  })
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

          return () => supabase.removeChannel(channel)
        } catch (e) {
          console.error('❌ Subscription error:', e)
        }
      })()
  }, [businessId, supabase])

  // FETCH DEALS
  useEffect(() => {
    if (!businessId) return

      ; (async () => {
        try {
          const { data: dealsData } = await supabase
            .from('deals')
            .select('id, title, discount_type, discount_value, is_active, code, expiry_date')
            .eq('business_id', businessId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })

          setDeals(dealsData || [])

          const dealsChannel = supabase
            .channel(`business-deals-${businessId}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'deals',
                filter: `business_id=eq.${businessId}`,
              },
              (payload) => {
                if (payload.eventType === 'INSERT') {
                  if (payload.new.is_active) {
                    setDeals((prev) => [payload.new, ...prev])
                    setSuccess('✨ New deal available!')
                    setTimeout(() => setSuccess(null), 3000)
                  }
                } else if (payload.eventType === 'UPDATE') {
                  setDeals((prev) =>
                    payload.new.is_active
                      ? prev.map((d) => (d.id === payload.new.id ? payload.new : d))
                      : prev.filter((d) => d.id !== payload.new.id)
                  )
                } else if (payload.eventType === 'DELETE') {
                  setDeals((prev) => prev.filter((d) => d.id !== payload.old.id))
                }
              }
            )
            .subscribe()

          return () => supabase.removeChannel(dealsChannel)
        } catch (e) {
          console.error('❌ Deals subscription error:', e)
        }
      })()
  }, [businessId, supabase])

  // FAVORITE STATUS
  useEffect(() => {
    if (!user || !businessId) return

    const checkFavorite = async () => {
      try {
        const { data } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('business_id', businessId)
          .maybeSingle()

        setIsFavorited(!!data)
      } catch (err) {
        console.error('❌ Favorite check error:', err)
      }
    }
    checkFavorite()
  }, [user, businessId, supabase])

  // FAVORITES REALTIME
  useEffect(() => {
    if (!user) return

    const favChannel = supabase
      .channel(`public:favorites:user_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new?.business_id === businessId) setIsFavorited(true)
          if (payload.old?.business_id === businessId) setIsFavorited(false)
        }
      )
      .subscribe()

    return () => supabase.removeChannel(favChannel)
  }, [user, businessId, supabase])

  // COMPUTED VALUES
  const liveStats = useMemo(() => {
    if (reviews.length === 0) return { rating: 0, count: 0 }
    const total = reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
    return {
      rating: parseFloat((total / reviews.length).toFixed(1)),
      count: reviews.length,
    }
  }, [reviews])

  const galleryImages = useMemo(() => {
    return photoUrls.filter((url) => url && typeof url === 'string' && url.trim().length > 5)
  }, [photoUrls])

  // FILTER OUT EXPIRED DEALS
  const activeDeals = useMemo(() => {
    return deals.filter(deal => !isExpired(deal.expiry_date))
  }, [deals])

  // USE BUSINESS.IMAGE_URL AS COVER
  const coverImage = business ? getCoverImage(business) : PLACEHOLDER_IMAGE

  // HANDLERS
  const toggleFavorite = async () => {
    if (!user) return router.push('/login')

    const oldState = isFavorited
    setIsFavorited(!isFavorited)

    try {
      if (oldState) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('business_id', businessId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('favorites').insert([
          { user_id: user.id, business_id: businessId }
        ])
        if (error) throw error
      }
    } catch (err) {
      setIsFavorited(oldState)
      console.error('❌ Favorite toggle error:', err)
    }
  }

  const handleSubmitReview = async () => {
    if (!user) return router.push('/login')
    if (!reviewText.trim()) {
      alert('Please write a review')
      return
    }

    try {
      setIsSubmittingReview(true)

      const reviewPayload = {
        business_id: businessId,
        user_id: user.id,
        user_name: userData?.full_name || user.email?.split('@')[0] || 'Anonymous',
        user_email: user.email,
        rating: reviewRating,
        text: reviewText.trim(),
        comment: reviewText.trim(),
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('reviews').insert([reviewPayload])
      if (error) throw error

      setReviewText('')
      setReviewRating(5)
      setIsReviewModalOpen(false)
      setSuccess('✨ Review posted!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('❌ Review submission error:', err)
      alert(`Review failed: ${err.message}`)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleEditReview = (review) => {
    setEditingReviewId(review.id)
    setEditReviewText(review.comment || review.text || '')
    setEditReviewRating(review.rating || 5)
  }

  const handleSaveEditedReview = async () => {
    if (!editReviewText.trim()) {
      alert('Please write a review')
      return
    }

    try {
      setIsEditingReview(true)

      const { error } = await supabase
        .from('reviews')
        .update({
          text: editReviewText.trim(),
          comment: editReviewText.trim(),
          rating: editReviewRating,
        })
        .eq('id', editingReviewId)

      if (error) throw error
      setEditingReviewId(null)
      setEditReviewText('')
      setEditReviewRating(5)
    } catch (err) {
      console.error('❌ Review update error:', err)
      alert(`Update failed: ${err.message}`)
    } finally {
      setIsEditingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
      if (error) throw error
    } catch (err) {
      console.error('❌ Review delete error:', err)
      alert(`Delete failed: ${err.message}`)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error || !business) return <ErrorDisplay error={error || 'Business not found'} />

  return (
    <div className="min-h-screen text-gray-900 dark:text-white font-sans selection:bg-orange-500 selection:text-white pb-20 overflow-x-hidden transition-colors duration-300">
      <Background />

      {/* SUCCESS ALERTS */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 bg-green-100 dark:bg-green-500/20 border border-green-500 dark:border-green-500/50 text-green-700 dark:text-green-300 text-sm flex items-center gap-3 rounded-xl backdrop-blur-md shadow-lg"
          >
            <FaCheck /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* INLINE BACK NAVBAR - USES VICINITY LOGO + BACK BUTTON */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4"
      >
        <div className="w-full max-w-5xl bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-2xl p-2 shadow-2xl pointer-events-auto flex items-center justify-between pl-4 pr-2">

          {/* VICINITY LOGO */}
          <VicinityLogo />

          {/* SPACER */}
          <div className="flex-1" />

          {/* BACK BUTTON - RIGHT SIDE */}
          <motion.button
            onClick={() => window.history.back()}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <FaArrowLeft size={14} />
            <span>Back</span>
          </motion.button>

        </div>
      </motion.nav>

      {/* HERO HEADER WITH COVER IMAGE */}
      <div className="relative h-[65vh] min-h-[500px] overflow-hidden pt-20">
        <div className="absolute inset-0 top-0">
          <img
            src={coverImage}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          {/* Overlay gradients - ADJUSTED FOR LIGHT/DARK */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 dark:from-black/40 via-white/10 dark:via-black/30 to-gray-50 dark:to-[#080808]" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#080808] via-white/60 dark:via-[#080808]/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {business.type && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-xs font-bold uppercase tracking-widest mb-4 inline-block shadow-lg shadow-orange-500/30 text-white"
                >
                  {business.type}
                </motion.span>
              )}

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter leading-tight text-gray-900 dark:text-white drop-shadow-2xl">
                {business.name}
              </h1>

              <div className="flex flex-wrap items-center gap-5">
                {/* Rating Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 bg-white/80 dark:bg-black/50 backdrop-blur-md px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/20 shadow-lg"
                >
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        size={16}
                        className={i < Math.round(liveStats.rating) ? 'text-yellow-400 drop-shadow-md' : 'text-gray-300 dark:text-white/20'}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-white text-lg leading-none">{liveStats.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-300">{liveStats.count} reviews</span>
                  </div>
                </motion.div>

                {/* Location Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 bg-white/80 dark:bg-black/50 backdrop-blur-md px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/20 shadow-lg"
                >
                  <FaMapMarkerAlt className="text-orange-500" size={16} />
                  <span className="text-sm text-gray-800 dark:text-gray-100">{business.fullAddress}</span>
                </motion.div>

                {/* Actions */}
                <div className="flex items-center gap-3 ml-auto">
                  <ActionButton
                    icon={FaShareAlt}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      setSuccess('Link copied!')
                      setTimeout(() => setSuccess(null), 2000)
                    }}
                    label="Share"
                  />
                  <ActionButton
                    icon={isFavorited ? FaHeart : FaRegHeart}
                    color={isFavorited ? 'text-red-500' : 'text-gray-700 dark:text-white'}
                    onClick={toggleFavorite}
                    label="Favorite"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            {/* ABOUT SECTION */}
            {business.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/20 backdrop-blur-md overflow-hidden group hover:border-orange-500/30 dark:hover:border-white/30 transition-all shadow-xl dark:shadow-none"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-purple-600/0 group-hover:from-orange-500/5 group-hover:to-purple-600/5 transition-all" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
                      <FaInfoCircle className="text-orange-500 dark:text-orange-400" size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About</h2>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base whitespace-pre-line mb-6">
                    {business.description}
                  </p>

                  {business.tags && business.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100 dark:border-white/10">
                      {business.tags.map((tag, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-600/10 border border-orange-200 dark:border-orange-500/30 text-xs font-bold text-orange-600 dark:text-orange-300 flex items-center gap-2 hover:border-orange-500/60 transition-all"
                        >
                          <FaTag size={11} /> {tag}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* DEALS SECTION */}
            {activeDeals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative p-8 rounded-2xl bg-blue-50 dark:bg-blue-600/5 border border-blue-200 dark:border-blue-500/30 backdrop-blur-md overflow-hidden group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-xl dark:shadow-none"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/5 group-hover:to-blue-600/5 transition-all" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/30 rounded-lg">
                      <FaTag className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🎉 Active Deals</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activeDeals.length} offer{activeDeals.length !== 1 ? 's' : ''} available</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeDeals.map((deal, idx) => (
                      <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-5 rounded-xl bg-white dark:bg-blue-700/20 border border-blue-100 dark:border-blue-500/50 hover:border-blue-400 dark:hover:border-blue-400/80 transition-all group/card shadow-sm"
                      >
                        {/* Deal Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{getDealEmoji(deal)}</span>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{getDealLabel(deal)}</h3>
                              {deal.title && <p className="text-xs text-gray-500 dark:text-gray-300">{deal.title}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Promo Code */}
                        {deal.code && (
                          <div className="mb-3 p-3 rounded-lg bg-gray-50 dark:bg-black/40 border border-blue-50 dark:border-blue-500/30">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-bold uppercase">Promo Code</p>
                            <div className="flex items-center justify-between gap-2">
                              <code className="text-sm font-mono font-bold text-blue-600 dark:text-blue-300 tracking-widest">
                                {deal.code}
                              </code>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={() => {
                                  navigator.clipboard.writeText(deal.code)
                                  setCopiedCode(deal.code)
                                  setSuccess(`Copied: ${deal.code}`)
                                  setTimeout(() => {
                                    setCopiedCode(null)
                                    setSuccess(null)
                                  }, 2000)
                                }}
                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-all"
                              >
                                {copiedCode === deal.code ? (
                                  <FaCheck className="text-green-500 dark:text-green-400" size={16} />
                                ) : (
                                  <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </motion.button>
                            </div>
                          </div>
                        )}

                        {/* Expiry Date */}
                        {deal.expiry_date && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-300 pt-3 border-t border-blue-50 dark:border-blue-500/20">
                            <FaCalendar size={12} className="text-blue-500 dark:text-blue-400" />
                            <span>Expires: {new Date(deal.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* GALLERY SECTION */}
            {galleryImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                    <FaImages className="text-purple-600 dark:text-purple-400" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery</h2>
                  <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{galleryImages.length} images</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {galleryImages.slice(0, 4).map((img, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.03 }}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-gray-200 dark:border-white/20 group ${i === 3 ? 'md:col-span-2' : ''}`}
                      onClick={() => {
                        setCurrentGalleryIndex(i)
                        setIsGalleryModalOpen(true)
                      }}
                    >
                      <img
                        src={img}
                        alt={`Gallery ${i}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />

                      {i === 3 && galleryImages.length > 4 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center font-bold text-2xl text-white">
                          +{galleryImages.length - 4}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* REVIEWS SECTION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="pt-4"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                    <FaQuoteLeft className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{liveStats.count} total</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsReviewModalOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all text-sm"
                >
                  Write Review
                </motion.button>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-16 rounded-2xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/20 text-center flex flex-col items-center justify-center"
                  >
                    <div className="text-5xl text-gray-300 dark:text-white/20 mb-4">★</div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No reviews yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Be the first to share your experience!</p>
                  </motion.div>
                ) : (
                  reviews.map((review, idx) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/15 backdrop-blur-sm hover:border-gray-300 dark:hover:border-white/25 transition-all group shadow-sm dark:shadow-none"
                    >
                      {editingReviewId === review.id ? (
                        <div className="space-y-4">
                          <div className="flex gap-2 justify-center mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setEditReviewRating(star)}
                                className={`text-3xl transition-all cursor-pointer ${star <= editReviewRating ? 'text-yellow-400 scale-110' : 'text-gray-300 dark:text-white/20'
                                  }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editReviewText}
                            onChange={(e) => setEditReviewText(e.target.value)}
                            className="w-full h-24 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg p-4 text-gray-900 dark:text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none resize-none"
                            placeholder="Edit your review..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEditedReview}
                              disabled={isEditingReview}
                              className="flex-1 py-2.5 rounded-lg font-bold bg-orange-500 hover:bg-orange-600 text-white disabled:bg-orange-500/50 transition-all text-sm"
                            >
                              {isEditingReview ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingReviewId(null)}
                              className="flex-1 py-2.5 rounded-lg font-bold bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-white transition-all text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-base">{review.user_name || 'Anonymous'}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <FaCalendar size={10} />
                                <span>{formatReviewDate(review.created_at)}</span>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  size={14}
                                  className={i < (review.rating || 0) ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-300 dark:text-white/20'}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                            {review.comment || review.text}
                          </p>

                          {/* EDIT & DELETE - ONLY IF OWN REVIEW */}
                          {user && user.id === review.user_id && (
                            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
                              <button
                                onClick={() => handleEditReview(review)}
                                className="flex-1 py-2 rounded-lg font-bold bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-all text-xs flex items-center justify-center gap-2 text-blue-600 dark:text-blue-300"
                              >
                                <FaEdit size={12} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="flex-1 py-2 rounded-lg font-bold bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 transition-all text-xs flex items-center justify-center gap-2 text-red-600 dark:text-red-300"
                              >
                                <FaTrash size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* SIDEBAR */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/20 backdrop-blur-md sticky top-24 space-y-6 shadow-xl dark:shadow-none">
              <div>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="text-2xl">ℹ️</span> Info & Hours
                </h3>
              </div>

              {/* Location */}
              {business.fullAddress && (
                <div className="pb-4 border-b border-gray-100 dark:border-white/10">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                    <FaMapPin className="text-orange-500" size={12} /> Location
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{business.fullAddress}</p>
                  <button
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(business.fullAddress || '')}`)}
                    className="text-xs text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 mt-2 flex items-center gap-1 transition-colors"
                  >
                    Open Maps <FaExternalLinkAlt size={10} />
                  </button>
                </div>
              )}

              {/* Phone */}
              {business.phone && (
                <div className="pb-4 border-b border-gray-100 dark:border-white/10">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                    <FaPhone className="text-green-500" size={12} /> Phone
                  </p>
                  <a href={`tel:${business.phone}`} className="text-sm text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 font-medium transition-colors">
                    {business.phone}
                  </a>
                </div>
              )}

              {/* Email */}
              {business.email && (
                <div className="pb-4 border-b border-gray-100 dark:border-white/10">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                    <FaEnvelope className="text-blue-500" size={12} /> Email
                  </p>
                  <a href={`mailto:${business.email}`} className="text-sm text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 font-medium transition-colors break-all">
                    {business.email}
                  </a>
                </div>
              )}

              {/* Website */}
              {business.website && (
                <div className="pb-4 border-b border-gray-100 dark:border-white/10">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                    <FaGlobe className="text-purple-500" size={12} /> Website
                  </p>
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 font-medium transition-colors flex items-center gap-2">
                    Visit Site <FaExternalLinkAlt size={11} />
                  </a>
                </div>
              )}

              {business.hours && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <FaClock className="text-yellow-500" size={12} /> Hours
                  </h4>
                  <div className="space-y-2.5">
                    {DAYS_ORDER.map((day) => {
                      let formattedTime = 'Closed'

                      if (typeof business.hours === 'object' && business.hours !== null) {
                        const dayKey = Object.keys(business.hours).find(
                          (k) => k.toLowerCase() === day.toLowerCase()
                        )
                        if (dayKey && business.hours[dayKey]) {
                          const dayData = business.hours[dayKey]
                          formattedTime = formatBusinessHours(dayData)
                        } else {
                          formattedTime = 'Not specified'
                        }
                      } else if (typeof business.hours === 'string') {
                        formattedTime = business.hours
                      }

                      const isClosed = formattedTime.toLowerCase().includes('closed') || formattedTime.toLowerCase().includes('not specified')

                      return (
                        <div key={day} className="flex justify-between items-center text-xs py-1.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                          <span className="capitalize text-gray-600 dark:text-gray-400 font-medium">{day}</span>
                          <span className={`font-bold ${isClosed ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {formattedTime}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}


            </div>
          </motion.div>
        </div>
      </div>

      {/* REVIEW MODAL */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <Modal onClose={() => setIsReviewModalOpen(false)}>
            <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">Share Your Experience</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">Help others by sharing your honest review</p>

            <div className="flex gap-2 mb-6 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`text-5xl transition-all cursor-pointer ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300 dark:text-white/20'
                    }`}
                >
                  ★
                </motion.button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What's your experience been like?"
              className="w-full h-32 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg p-4 text-gray-900 dark:text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none mb-6 resize-none"
            />

            <motion.button
              onClick={handleSubmitReview}
              disabled={isSubmittingReview}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white disabled:from-orange-500/50 disabled:to-orange-600/50 transition-all disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
            >
              {isSubmittingReview ? 'Posting...' : 'Post Review'}
            </motion.button>
          </Modal>
        )}
      </AnimatePresence>

      {/* GALLERY MODAL */}
      <AnimatePresence>
        {isGalleryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={() => setIsGalleryModalOpen(false)}
          >
            <button
              className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white z-50 transition-all"
              onClick={() => setIsGalleryModalOpen(false)}
            >
              <FaTimes size={24} />
            </button>

            <div className="relative w-full max-w-5xl flex items-center justify-center h-full">
              {galleryImages[currentGalleryIndex] && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={galleryImages[currentGalleryIndex]}
                  alt="Gallery view"
                  className="max-h-[90vh] max-w-full rounded-xl shadow-2xl shadow-black/50"
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              {galleryImages.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md text-white transition-all"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentGalleryIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
                    }}
                  >
                    <FaChevronLeft size={24} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md text-white transition-all"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentGalleryIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
                    }}
                  >
                    <FaChevronRight size={24} />
                  </motion.button>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full border border-white/20 text-xs text-gray-300">
                    {currentGalleryIndex + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}