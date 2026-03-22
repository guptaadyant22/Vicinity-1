'use client'

// User profile page with editable profile information, statistics, and account management
// COMPONENTS:
// VICINITY LOGO - Branded logo component with optional text display
// NAVBAR - Navigation bar with dashboard link
// ANIMATED BG - Soft blue background with grid pattern for visual appeal
// CONFIRMATION MODAL - Reusable modal for confirming destructive actions
// HELPER FUNCTIONS:
// SAVE FIELD - Updates single user profile field in Supabase auth metadata
// SAVE INTERESTS - Updates user interests array in auth metadata
// HANDLE DELETE ALL REVIEWS - Deletes all reviews created by user from database
// HANDLE DELETE ACCOUNT - Permanently deletes user account, reviews, and all related data

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
  FaEnvelope,
  FaHeart,
} from 'react-icons/fa'

import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import VicinityLogo from '../../../components/VicinityLogo'
import UserNavbar from '../../../components/UserNavbar'

// --- SHARED UI TOKENS ---
const UI = {
  page: 'min-h-screen bg-white dark:bg-[#081120] text-slate-900 dark:text-white transition-colors duration-300 font-sans',
  shell:
    'bg-white dark:bg-[#0f172a] border border-blue-500/12 dark:border-white/10 shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-colors duration-300',
  card:
    'bg-white dark:bg-[#0f172a] border border-blue-500/12 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300',
  input:
    'w-full px-4 py-2 bg-slate-100 dark:bg-[#111827] border border-blue-500/15 dark:border-white/15 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors duration-300',
  iconBtn:
    'p-2 rounded-lg transition-all text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-[#162033]',
  pill:
    'px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  primaryBtn:
    'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all',
}

// --- ANIMATED BACKGROUND ---
const AnimatedBg = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-[#081120] transition-colors duration-300">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(59,130,246,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.35) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
        }}
      />

      {/* Top orb */}
      <div
        className="absolute -top-24 left-0 w-[620px] h-[620px] rounded-full blur-[160px] opacity-40 dark:opacity-50 -translate-x-1/3"
        style={{
          background: 'rgba(59,130,246,0.20)',
        }}
      />

      {/* Bottom orb */}
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[160px] opacity-40 dark:opacity-50 -translate-x-1/3 translate-y-1/3"
        style={{
          background: 'rgba(34,211,238,0.14)',
        }}
      />
    </div>
  )
}

// --- CONFIRMATION MODAL ---
const ConfirmationModal = ({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDanger = false,
}) => (
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
      className="bg-white dark:bg-[#0f172a] border border-blue-500/12 dark:border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl"
    >
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">{message}</p>
      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-slate-100 dark:bg-[#162033] hover:bg-slate-200 dark:hover:bg-[#1c2940] text-slate-900 dark:text-white font-bold rounded-xl transition-all"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all text-white ${
            isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
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

  const INTEREST_OPTIONS = [
    'Restaurants & Food',
    'Shopping & Retail',
    'Home Services',
    'Health & Wellness',
    'Professional Services',
  ]

  // Fetch user data
  useEffect(() => {
    if (!user || authLoading) return

    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push('/login')
          return
        }

        const authMetadata = authUser.user_metadata || {}
        const userType = authMetadata.user_type || 'community'
        const fullname =
          authMetadata.fullname ||
          authMetadata.full_name ||
          authUser.email?.split('@')[0] ||
          'User'
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
        data: updateData,
      })

      if (updateError) throw updateError

      setUserData((prev) => ({
        ...prev,
        [field]: value.trim(),
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
        data: { interests },
      })

      if (updateError) throw updateError

      setUserData((prev) => ({
        ...prev,
        interests,
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
      <div className="min-h-screen bg-white dark:bg-[#081120] flex items-center justify-center">
        <AnimatedBg />
        <FaSpinner className="text-4xl text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#081120] flex items-center justify-center">
        <AnimatedBg />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
            Please log in to view your profile
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
          >
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
    <div className={UI.page}>
      <AnimatedBg />
      <UserNavbar activePage="profile" onLogout={async () => { await createClient().auth.signOut(); logout(); router.push('/'); }} />

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

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${UI.shell} rounded-3xl p-8 md:p-12 mb-12`}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg flex-shrink-0">
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
                      onChange={(e) => setUserData((prev) => ({ ...prev, fullname: e.target.value }))}
                      onBlur={(e) => saveField('fullname', e.target.value)}
                      className={`${UI.input} flex-1 text-lg font-bold`}
                      autoFocus
                    />
                    <button
                      onClick={() => setEditingField(null)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-[#162033] text-slate-600 dark:text-slate-400 rounded-lg"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                      {userData.fullname}
                    </h1>
                    <button
                      onClick={() => setEditingField('fullname')}
                      className={UI.iconBtn}
                    >
                      <FaEdit size={16} />
                    </button>
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                  <span className={UI.pill}>
                    {userData.userType === 'business' ? '🏢 Business' : '👤 Community'}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <FaCalendar size={14} />
                    Joined {joinDate}
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  {/* City */}
                  <div className="space-y-2">
                    {editingField === 'city' ? (
                      <>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          City
                        </label>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-blue-600 dark:text-blue-300 flex-shrink-0" />
                          <input
                            type="text"
                            defaultValue={userData.city}
                            onChange={(e) => setUserData((prev) => ({ ...prev, city: e.target.value }))}
                            onBlur={(e) => saveField('city', e.target.value)}
                            className={`${UI.input} flex-1 text-sm`}
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingField(null)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#162033] rounded"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          City
                        </label>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#162033] rounded-xl">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-blue-600 dark:text-blue-300" />
                            <span className="font-medium text-slate-900 dark:text-white">
                              {userData.city || 'Not set'}
                            </span>
                          </div>
                          <button
                            onClick={() => setEditingField('city')}
                            className={UI.iconBtn}
                          >
                            <FaEdit size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* ZIP */}
                  <div className="space-y-2">
                    {editingField === 'zip' ? (
                      <>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          ZIP Code
                        </label>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-cyan-600 dark:text-cyan-300 flex-shrink-0" />
                          <input
                            type="text"
                            defaultValue={userData.zip}
                            onChange={(e) => setUserData((prev) => ({ ...prev, zip: e.target.value }))}
                            onBlur={(e) => saveField('zip', e.target.value)}
                            className={`${UI.input} flex-1 text-sm`}
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingField(null)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#162033] rounded"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          ZIP Code
                        </label>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#162033] rounded-xl">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-cyan-600 dark:text-cyan-300" />
                            <span className="font-medium text-slate-900 dark:text-white">
                              {userData.zip || 'Not set'}
                            </span>
                          </div>
                          <button
                            onClick={() => setEditingField('zip')}
                            className={UI.iconBtn}
                          >
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

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
            {/* Email & interests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`md:col-span-2 ${UI.card} rounded-2xl p-6 space-y-6`}
            >
              {/* Email */}
              <div>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Email
                </h2>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-blue-600 dark:text-blue-300 flex-shrink-0" />
                  <span className="font-medium text-slate-900 dark:text-white break-all">
                    {userData.email}
                  </span>
                </div>
              </div>

              {/* Interests */}
              {userData.userType === 'community' && (
                <div className="pt-4 border-t border-blue-500/10 dark:border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Interests
                    </h2>
                    {editingField !== 'interests' && (
                      <button
                        onClick={() => setEditingField('interests')}
                        className={UI.iconBtn}
                      >
                        <FaEdit size={14} />
                      </button>
                    )}
                  </div>

                  {editingField === 'interests' ? (
                    <div className="space-y-3">
                      {INTEREST_OPTIONS.map((interest) => (
                        <label
                          key={interest}
                          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-[#162033]"
                        >
                          <input
                            type="checkbox"
                            checked={userData.interests.includes(interest)}
                            onChange={(e) => {
                              const newInterests = e.target.checked
                                ? [...userData.interests, interest]
                                : userData.interests.filter((i) => i !== interest)
                              setUserData((prev) => ({ ...prev, interests: newInterests }))
                            }}
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                          />
                          <span className="text-sm font-medium">{interest}</span>
                        </label>
                      ))}

                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => saveInterests(userData.interests)}
                          className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-all"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="flex-1 py-2 bg-slate-300 dark:bg-[#162033] hover:bg-slate-400 dark:hover:bg-[#1c2940] text-slate-700 dark:text-white rounded-xl font-semibold text-sm transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userData.interests.length > 0 ? (
                        userData.interests.map((interest) => (
                          <span
                            key={interest}
                            className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 rounded-full text-xs font-semibold"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">No interests added</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Business info */}
              {userData.userType === 'business' && businessData && (
                <div className="pt-4 border-t border-blue-500/10 dark:border-white/10">
                  <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Business
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Name</p>
                      <p className="font-medium text-slate-900 dark:text-white">{businessData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Type</p>
                      <p className="font-medium text-slate-900 dark:text-white">{businessData.type}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Reviews card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${UI.card} rounded-2xl p-6`}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center mx-auto mb-3">
                  <FaStar className="text-blue-600 dark:text-blue-300 text-lg" />
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-1">
                  {reviewCount}
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Reviews</p>
              </div>
            </motion.div>

            {/* Saved places card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`${UI.card} rounded-2xl p-6`}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/15 flex items-center justify-center mx-auto mb-3">
                  <FaHeart className="text-cyan-600 dark:text-cyan-300 text-lg" />
                </div>
                <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-300 mb-1">
                  {savedPlaces.length}
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Saved</p>
              </div>
            </motion.div>

            {/* Danger zone */}
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
                {/* Delete reviews */}
                {reviewCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteReviewsModal(true)}
                    className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                    disabled={isSaving}
                  >
                    <FaTrash size={14} /> Delete {reviewCount} Reviews
                  </motion.button>
                )}

                {/* Delete account */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                  disabled={isSaving}
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
