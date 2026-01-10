'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaUser,
  FaMapMarkerAlt,
  FaStar,
  FaEdit,
  FaCheck,
  FaTimes,
  FaTrash,
  FaExclamationTriangle,
  FaCalendar,
  FaSpinner,
  FaArrowRight,
  FaEnvelope,
  FaHeart,
} from 'react-icons/fa'

import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'

// --- OFFICIAL NAVBAR COMPONENT ---
const VicinityLogo = ({ className = '', textClassName = '' }) => (
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
    <span className={`font-black text-orange-500 dark:text-orange-400 text-xl tracking-tight ${textClassName}`}>Vicinity</span>
  </div>
)

const Navbar = () => {
  const router = useRouter()

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <div className="w-full max-w-5xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-gray-300/20 dark:border-white/15 rounded-2xl p-2 shadow-2xl pointer-events-auto flex items-center justify-between pl-4 pr-2 hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-300">
        <VicinityLogo />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/user/dashboard')}
          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-orange-500/20 flex items-center gap-2"
        >
          Dashboard <FaArrowRight size={12} />
        </motion.button>
      </div>
    </motion.nav>
  )
}

// --- ANIMATED BACKGROUND ---
const AnimatedBg = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
    <div 
      className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" 
      style={{ 
        backgroundImage: `linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)`, 
        backgroundSize: '120px 120px', 
      }} 
    />
    <div 
      className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[160px] opacity-40 dark:opacity-50 -translate-x-1/3 translate-y-1/3" 
      style={{ 
        background: 'radial-gradient(circle at 50% 50%, rgba(255,111,0,0.2), rgba(236,72,153,0.1), transparent 70%)',
      }} 
    />
  </div>
)

// --- CONFIRMATION MODAL ---
const ConfirmationModal = ({ title, message, confirmText, cancelText, onConfirm, onCancel, isDanger = false }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/15 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
    >
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{message}</p>
      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold rounded-lg transition-all"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 px-4 py-3 font-bold rounded-lg transition-all text-white ${
            isDanger
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </motion.div>
  </motion.div>
)

// --- MAIN PROFILE PAGE ---
export default function UserProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const supabase = createClient()

  const [userData, setUserData] = useState(null)
  const [businessData, setBusinessData] = useState(null)
  const [reviewCount, setReviewCount] = useState(0)
  const [savedPlaces, setSavedPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [showDeleteReviewsModal, setShowDeleteReviewsModal] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)

  const INTEREST_OPTIONS = ['Restaurants & Food', 'Shopping & Retail', 'Home Services', 'Health & Wellness', 'Professional Services']

  // Fetch user data
  useEffect(() => {
    if (!user || authLoading) return

    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          router.push('/login')
          return
        }

        const authMetadata = authUser.user_metadata || {}
        const userType = authMetadata.user_type || 'community'
        const fullname = authMetadata.fullname || authMetadata.full_name || authUser.email?.split('@')[0] || 'User'
        const city = authMetadata.city || ''
        const zip = authMetadata.zip || authMetadata.zipCode || ''
        const interests = authMetadata.interests || []

        setUserData({
          id: authUser.id,
          email: authUser.email,
          fullname: fullname,
          city: city,
          zip: zip,
          interests: interests,
          userType: userType,
          createdAt: authUser.created_at,
        })

        if (userType === 'business') {
          const { data: businessData } = await supabase
            .from('businesses')
            .select('*')
            .eq('owner_id', authUser.id)
            .single()

          if (businessData) {
            setBusinessData(businessData)
          }
        }

        const { count: reviewsCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authUser.id)

        setReviewCount(reviewsCount || 0)

        const { data: savedData } = await supabase
          .from('saved_places')
          .select('*')
          .eq('user_id', authUser.id)

        setSavedPlaces(savedData || [])
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, authLoading, supabase, router])

  // Save field function
  const saveField = async (field, value) => {
    if (!value.trim()) {
      setError(`${field} cannot be empty`)
      return
    }

    if (value === userData[field]) {
      setEditingField(null)
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const updateData = { [field]: value.trim() }
      const { error: updateError } = await supabase.auth.updateUser({
        data: updateData
      })

      if (updateError) throw updateError

      setUserData(prev => ({
        ...prev,
        [field]: value.trim()
      }))

      if (userData.userType === 'business' && businessData && field === 'fullname') {
        await supabase
          .from('businesses')
          .update({ owner_name: value.trim() })
          .eq('id', businessData.id)
      }

      setSaveSuccess(true)
      setEditingField(null)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      console.error('Error updating:', err)
      setError(`Failed to update ${field}. Please try again.`)
    } finally {
      setIsSaving(false)
    }
  }

  // Save interests
  const saveInterests = async (interests) => {
    try {
      setIsSaving(true)
      setError(null)

      const { error: updateError } = await supabase.auth.updateUser({
        data: { interests }
      })

      if (updateError) throw updateError

      setUserData(prev => ({
        ...prev,
        interests
      }))

      setSaveSuccess(true)
      setEditingField(null)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      console.error('Error updating interests:', err)
      setError('Failed to update interests. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete all reviews
  const handleDeleteAllReviews = async () => {
    try {
      setIsSaving(true)
      setError(null)

      await supabase.from('reviews').delete().eq('user_id', userData.id)

      setReviewCount(0)
      setSaveSuccess(true)
      setShowDeleteReviewsModal(false)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      console.error('Error deleting reviews:', err)
      setError('Failed to delete reviews. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      setIsSaving(true)
      setError(null)

      await supabase.from('reviews').delete().eq('user_id', userData.id)
      await supabase.from('saved_places').delete().eq('user_id', userData.id)
      
      if (userData.userType === 'business' && businessData) {
        await supabase.from('businesses').delete().eq('owner_id', userData.id)
      }

      await supabase.auth.signOut()
      logout()
      router.push('/')
    } catch (err) {
      console.error('Error deleting account:', err)
      setError('Failed to delete account.')
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <AnimatedBg />
        <FaSpinner className="text-4xl text-orange-500 animate-spin" />
      </div>
    )
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <AnimatedBg />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">Please log in to view your profile</p>
          <button onClick={() => router.push('/login')} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-bold">
            Go to Login
          </button>
        </motion.div>
      </div>
    )
  }

  const joinDate = new Date(userData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300 font-sans">
      <AnimatedBg />
      <Navbar />

      <main className="w-full pt-32 pb-16 px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-300 flex items-start gap-3"
              >
                <FaExclamationTriangle className="flex-shrink-0 mt-1" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl text-green-700 dark:text-green-300 flex items-start gap-3"
              >
                <FaCheck className="flex-shrink-0 mt-1" />
                <span className="font-medium">Profile updated successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Card - Full Width with Location Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/15 rounded-3xl p-8 md:p-12 mb-12 shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg flex-shrink-0">
                {userData.fullname.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left space-y-6 w-full">
                {/* Name */}
                {editingField === 'fullname' ? (
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <input
                      type="text"
                      defaultValue={userData.fullname}
                      onChange={e => setUserData(prev => ({ ...prev, fullname: e.target.value }))}
                      onBlur={e => saveField('fullname', e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      autoFocus
                    />
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 rounded-lg"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      {userData.fullname}
                    </h1>
                    <button
                      onClick={() => setEditingField('fullname')}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 text-orange-500 dark:text-orange-400 rounded-lg transition-all"
                    >
                      <FaEdit size={16} />
                    </button>
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-semibold">
                    {userData.userType === 'business' ? '🏢 Business' : '👤 Community'}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FaCalendar size={14} />
                    Joined {joinDate}
                  </div>
                </div>

                {/* Location Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  {/* City */}
                  <div className="space-y-2">
                    {editingField === 'city' ? (
                      <>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">City</label>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-orange-500 dark:text-orange-400 flex-shrink-0" />
                          <input
                            type="text"
                            defaultValue={userData.city}
                            onChange={e => setUserData(prev => ({ ...prev, city: e.target.value }))}
                            onBlur={e => saveField('city', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            autoFocus
                          />
                          <button onClick={() => setEditingField(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded">
                            <FaTimes size={12} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">City</label>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-orange-500 dark:text-orange-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{userData.city || 'Not set'}</span>
                          </div>
                          <button onClick={() => setEditingField('city')} className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-orange-500 rounded transition-all">
                            <FaEdit size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* ZIP Code */}
                  <div className="space-y-2">
                    {editingField === 'zip' ? (
                      <>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ZIP Code</label>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-pink-500 dark:text-pink-400 flex-shrink-0" />
                          <input
                            type="text"
                            defaultValue={userData.zip}
                            onChange={e => setUserData(prev => ({ ...prev, zip: e.target.value }))}
                            onBlur={e => saveField('zip', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                            autoFocus
                          />
                          <button onClick={() => setEditingField(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded">
                            <FaTimes size={12} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ZIP Code</label>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-pink-500 dark:text-pink-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{userData.zip || 'Not set'}</span>
                          </div>
                          <button onClick={() => setEditingField('zip')} className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-orange-500 rounded transition-all">
                            <FaEdit size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
            {/* Email & Interests Card - Full Width Top Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/15 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-6"
            >
              {/* Email */}
              <div>
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Email</h2>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-orange-500 dark:text-orange-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-white break-all">{userData.email}</span>
                </div>
              </div>

              {/* Interests - Community Only */}
              {userData.userType === 'community' && (
                <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interests</h2>
                    {editingField !== 'interests' && (
                      <button onClick={() => setEditingField('interests')} className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-orange-500 rounded transition-all">
                        <FaEdit size={14} />
                      </button>
                    )}
                  </div>

                  {editingField === 'interests' ? (
                    <div className="space-y-3">
                      {INTEREST_OPTIONS.map(interest => (
                        <label key={interest} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10">
                          <input
                            type="checkbox"
                            checked={userData.interests.includes(interest)}
                            onChange={(e) => {
                              const newInterests = e.target.checked
                                ? [...userData.interests, interest]
                                : userData.interests.filter(i => i !== interest)
                              setUserData(prev => ({ ...prev, interests: newInterests }))
                            }}
                            className="w-4 h-4 accent-orange-500 cursor-pointer"
                          />
                          <span className="text-sm font-medium">{interest}</span>
                        </label>
                      ))}
                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => saveInterests(userData.interests)}
                          className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-all"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="flex-1 py-2 bg-gray-300 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/30 text-gray-700 dark:text-white rounded-lg font-semibold text-sm transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userData.interests.length > 0 ? (
                        userData.interests.map(interest => (
                          <span key={interest} className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-semibold">
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No interests added</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Business Info - For business owners */}
              {userData.userType === 'business' && businessData && (
                <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                  <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Business</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{businessData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
                      <p className="font-medium text-gray-900 dark:text-white">{businessData.type}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Reviews Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/15 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                  <FaStar className="text-orange-500 dark:text-orange-400 text-lg" />
                </div>
                <div className="text-3xl font-bold text-orange-500 dark:text-orange-400 mb-1">
                  {reviewCount}
                </div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Reviews</p>
              </div>
            </motion.div>

            {/* Saved Places Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/15 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center mx-auto mb-3">
                  <FaHeart className="text-pink-500 dark:text-pink-400 text-lg" />
                </div>
                <div className="text-3xl font-bold text-pink-500 dark:text-pink-400 mb-1">
                  {savedPlaces.length}
                </div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Saved</p>
              </div>
            </motion.div>

            {/* Danger Zone Card - Full Width Bottom with Delete Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="md:col-span-2 lg:col-span-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <h2 className="text-sm font-bold text-red-700 dark:text-red-300 uppercase tracking-wider mb-6 flex items-center gap-2">
                <FaExclamationTriangle size={14} /> Danger Zone
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Delete Reviews Button */}
                {reviewCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteReviewsModal(true)}
                    className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <FaTrash size={14} /> Delete {reviewCount} Reviews
                  </motion.button>
                )}

                {/* Delete Account Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  <FaTrash size={14} /> Delete Account
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showDeleteReviewsModal && (
          <ConfirmationModal
            title="Delete All Reviews"
            message="Are you sure you want to delete all your reviews? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDeleteAllReviews}
            onCancel={() => setShowDeleteReviewsModal(false)}
            isDanger={true}
          />
        )}

        {showDeleteAccountModal && (
          <ConfirmationModal
            title="Delete Account"
            message="Are you absolutely sure? This will permanently delete your account and all data. This cannot be undone."
            confirmText="Delete Account"
            cancelText="Cancel"
            onConfirm={handleDeleteAccount}
            onCancel={() => setShowDeleteAccountModal(false)}
            isDanger={true}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
