'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaUser,
  FaMapMarkerAlt,
  FaHeart,
  FaStar,
  FaEdit,
  FaCheck,
  FaTimes,
  FaTrash,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCalendar,
  FaSpinner,
} from 'react-icons/fa'

import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'

// --- THEMED CONSTANTS ---
const THEME = {
  accent: '#ff6f00',
  accentGrad: 'from-orange-400 to-pink-500',
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
    
    {/* Top gradient circle */}
    <div 
      className="absolute -top-[380px] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full blur-[160px] mix-blend-multiply dark:mix-blend-normal" 
      style={{ 
        background: 'radial-gradient(circle at 50% 50%, rgba(255,111,0,0.15), rgba(236,72,153,0.10), transparent 70%)',
        opacity: 1,
      }} 
    />

    {/* Bottom gradient circle */}
    <div 
      className="absolute -bottom-[300px] right-[-200px] w-[900px] h-[900px] rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-normal" 
      style={{ 
        background: 'radial-gradient(circle at 50% 50%, rgba(255,111,0,0.2), rgba(236,72,153,0.15), transparent 70%)',
        opacity: 0.8,
      }} 
    />
    
    {/* Light Mode Overlay (Hidden in Dark Mode) */}
    <div className="absolute inset-0 bg-white/30 dark:hidden" 
         style={{ background: 'radial-gradient(circle at 50% 20%, transparent 0%, rgba(255,255,255,0.8) 100%)' }} />

    {/* Dark Mode Overlay (Hidden in Light Mode) */}
    <div className="absolute inset-0 hidden dark:block bg-black/80" 
         style={{ background: 'radial-gradient(circle at 50% 20%, transparent 0%, rgba(0,0,0,0.8) 100%)' }} />
  </div>
)

const Header = ({ onBack }) => (
  <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
    <div className="w-full max-w-6xl bg-white/80 dark:bg-black/30 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-3 shadow-2xl pointer-events-auto flex items-center justify-between pl-6 pr-3 hover:bg-white/90 dark:hover:bg-black/40 transition-all">
      <VicinityLogo showText={true} />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all"
      >
        <FaArrowLeft size={14} /> Back
      </motion.button>
    </div>
  </motion.nav>
)

const ProfileCard = ({ name, joinedDate, city }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl shadow-2xl"
  >
    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[100px] opacity-20 dark:opacity-30" style={{ background: 'radial-gradient(circle, rgba(255,111,0,0.2), transparent 70%)' }} />
    <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[80px] opacity-20 dark:opacity-30" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.2), transparent 70%)' }} />
    
    <div className="relative z-10 p-10">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-32 h-32 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-6xl font-black shadow-2xl shadow-orange-500/40"
        >
          👤
        </motion.div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">
            {name}
          </h1>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30">
                <FaCalendar className="text-orange-500 dark:text-orange-400" size={16} />
              </div>
              <span className="text-sm">Joined {joinedDate}</span>
            </div>
            {city && (
              <div className="flex items-center justify-center md:justify-start gap-3 text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-500/20 border border-pink-200 dark:border-pink-500/30">
                  <FaMapMarkerAlt className="text-pink-500 dark:text-pink-400" size={16} />
                </div>
                <span className="text-sm">{city}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
)

const StatCard = ({ label, value, icon: Icon, color = 'orange' }) => {
  const colorMap = {
    orange: { bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20', icon: 'text-orange-600 dark:text-orange-400' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-500/10', border: 'border-pink-200 dark:border-pink-500/20', icon: 'text-pink-600 dark:text-pink-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20', icon: 'text-purple-600 dark:text-purple-400' },
  }
  
  const colors = colorMap[color] || colorMap.orange

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative rounded-2xl overflow-hidden border ${colors.border} ${colors.bg} backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl transition-all`}
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle, rgba(255,111,0,0.1), transparent 70%)` }} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${colors.bg} border ${colors.border}`}>
            <Icon className={colors.icon} size={20} />
          </div>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
      </div>
    </motion.div>
  )
}

const EditField = ({ label, value, icon: Icon, isEditing, onEdit, onChange }) => (
  <motion.div layout className="space-y-3">
    <div className="flex items-center justify-between">
      <label className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30">
          <Icon className="text-orange-500 dark:text-orange-400" size={14} />
        </div>
        {label}
      </label>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEdit}
        className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all"
      >
        {isEditing ? <FaTimes size={14} /> : <FaEdit size={14} />}
      </motion.button>
    </div>
    
    {isEditing ? (
      <motion.input
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-black/40 border border-orange-500/40 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-semibold focus:outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
        placeholder="Enter value..."
      />
    ) : (
      <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gradient-to-br dark:from-white/5 dark:to-white/2 p-4">
        <p className="text-lg font-semibold text-gray-800 dark:text-white">{value || 'Not set'}</p>
      </div>
    )}
  </motion.div>
)

const Modal = ({ title, description, children, isOpen, onClose, variant = 'default' }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className={`rounded-3xl border backdrop-blur-xl shadow-2xl p-8 ${variant === 'danger' ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-500/40' : 'bg-white/90 dark:bg-black/60 border-gray-200 dark:border-white/10'}`}>
            <div className="flex items-center gap-3 mb-4">
              {variant === 'danger' && <FaExclamationTriangle className="text-red-500 dark:text-red-400 flex-shrink-0" size={28} />}
              <h3 className={`text-2xl font-black ${variant === 'danger' ? 'text-red-700 dark:text-white' : 'text-gray-900 dark:text-white'}`}>{title}</h3>
            </div>
            <p className={`${variant === 'danger' ? 'text-red-600 dark:text-gray-300' : 'text-gray-600 dark:text-gray-300'} mb-6 text-sm leading-relaxed`}>{description}</p>
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

export default function UserProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const bgRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    city: '',
    interestedBusinesses: '',
    joinedDate: '',
  })

  const [editingFields, setEditingFields] = useState({
    name: false,
    city: false,
    interestedBusinesses: false,
  })

  const [deleteReviewsModal, setDeleteReviewsModal] = useState(false)
  const [deleteAccountModal, setDeleteAccountModal] = useState(false)
  const [deletingReviews, setDeletingReviews] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    totalSaved: 0,
  })

  // --- OVERSCROLL FIX ---
  useEffect(() => {
    // This helper ensures the overscroll background matches the theme
    // eliminating white padding when scrolling past the content in dark mode
    const updateBodyColor = () => {
      const isDark = document.documentElement.classList.contains('dark')
      document.body.style.backgroundColor = isDark ? '#080808' : '#f9fafb'
    }

    updateBodyColor()

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateBodyColor()
        }
      })
    })
    
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        setLoading(true)

        const { data: userData } = await supabase.auth.getUser()
        const userMeta = userData?.user?.user_metadata || {}

        const joinedDate = new Date(user.created_at)
        const formattedDate = joinedDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        setProfileData({
          name: userMeta.full_name || userMeta.name || 'User',
          city: userMeta.city || '',
          interestedBusinesses: userMeta.interested_businesses?.join(', ') || '',
          joinedDate: formattedDate,
        })

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('rating')
          .eq('user_id', user.id)

        if (reviewsData) {
          const avgRating =
            reviewsData.length > 0
              ? (reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length).toFixed(1)
              : 0

          setStats((prev) => ({
            ...prev,
            totalReviews: reviewsData.length,
            avgRating: avgRating,
          }))
        }

        const { data: savedData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)

        if (savedData) {
          setStats((prev) => ({
            ...prev,
            totalSaved: savedData.length,
          }))
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  const handleEditToggle = (field) => {
    setEditingFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      setSaving(true)
      setSuccessMessage('')

      const businessesArray = profileData.interestedBusinesses
        .split(',')
        .map((b) => b.trim())
        .filter((b) => b.length > 0)

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.name,
          city: profileData.city,
          interested_businesses: businessesArray,
        },
      })

      if (authError) throw authError

      const { error: reviewsError } = await supabase
        .from('reviews')
        .update({ user_name: profileData.name })
        .eq('user_id', user.id)

      if (reviewsError) throw reviewsError

      setEditingFields({
        name: false,
        city: false,
        interestedBusinesses: false,
      })

      setSuccessMessage('✅ Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAllReviews = async () => {
    if (!user) return

    try {
      setDeletingReviews(true)

      const { error } = await supabase.from('reviews').delete().eq('user_id', user.id)

      if (error) throw error

      setStats((prev) => ({
        ...prev,
        totalReviews: 0,
        avgRating: 0,
      }))

      setDeleteReviewsModal(false)
      setSuccessMessage('✅ All reviews deleted!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Error deleting reviews:', err)
      alert('Failed to delete reviews. Please try again.')
    } finally {
      setDeletingReviews(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    try {
      setDeletingAccount(true)

      await supabase.from('reviews').delete().eq('user_id', user.id)
      await supabase.from('favorites').delete().eq('user_id', user.id)

      const { error } = await supabase.auth.admin.deleteUser(user.id)

      if (error) throw error

      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Error deleting account:', err)
      alert('Failed to delete account. Please try again.')
    } finally {
      setDeletingAccount(false)
    }
  }

  const isEditing = Object.values(editingFields).some((v) => v)
  const hasChanges = isEditing

  if (authLoading || !user) return <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors" />

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-200 font-sans selection:bg-orange-500/30 selection:text-white relative bg-gray-50 dark:bg-[#080808] transition-colors duration-300">
      <AnimatedBg bgRef={bgRef} />

      <Header onBack={() => router.push('/user/dashboard')} />

      <main className="max-w-6xl mx-auto px-6 py-10 pt-28 relative z-10">
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-3"
          >
            <FaCheck size={20} />
            {successMessage}
          </motion.div>
        )}

        {/* Profile Card */}
        <section className="mb-12">
          <ProfileCard 
            name={profileData.name} 
            joinedDate={profileData.joinedDate}
            city={profileData.city}
          />
        </section>

        {/* Stats Grid */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Reviews" 
            value={stats.totalReviews}
            icon={FaStar}
            color="orange"
          />
          <StatCard 
            label="Avg Rating" 
            value={stats.avgRating}
            icon={FaHeart}
            color="pink"
          />
          <StatCard 
            label="Saved Places" 
            value={stats.totalSaved}
            icon={FaMapMarkerAlt}
            color="purple"
          />
        </section>

        {/* Edit Profile Section */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl p-10 shadow-xl"
          >
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[100px] opacity-20 dark:opacity-30" style={{ background: 'radial-gradient(circle, rgba(255,111,0,0.2), transparent 70%)' }} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30">
                    <FaEdit className="text-orange-500 dark:text-orange-400" size={20} />
                  </div>
                  Edit Profile
                </h2>
                {hasChanges && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-black rounded-xl hover:scale-105 transition-transform disabled:opacity-50 shadow-lg shadow-orange-500/40"
                  >
                    {saving ? <FaSpinner className="animate-spin" size={16} /> : <FaCheck size={16} />}
                    {saving ? 'Saving...' : 'Save'}
                  </motion.button>
                )}
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <EditField
                    label="Full Name"
                    icon={FaUser}
                    value={profileData.name}
                    isEditing={editingFields.name}
                    onEdit={() => handleEditToggle('name')}
                    onChange={(value) => setProfileData((prev) => ({ ...prev, name: value }))}
                  />

                  <EditField
                    label="City"
                    icon={FaMapMarkerAlt}
                    value={profileData.city}
                    isEditing={editingFields.city}
                    onEdit={() => handleEditToggle('city')}
                    onChange={(value) => setProfileData((prev) => ({ ...prev, city: value }))}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30">
                        <FaHeart className="text-orange-500 dark:text-orange-400" size={14} />
                      </div>
                      Interested Businesses
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditToggle('interestedBusinesses')}
                      className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all"
                    >
                      {editingFields.interestedBusinesses ? <FaTimes size={14} /> : <FaEdit size={14} />}
                    </motion.button>
                  </div>
                  
                  {editingFields.interestedBusinesses ? (
                    <motion.textarea
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      value={profileData.interestedBusinesses}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, interestedBusinesses: e.target.value }))}
                      className="w-full bg-white dark:bg-black/40 border border-orange-500/40 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-semibold focus:outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                      placeholder="Enter business types (e.g., Coffee, Pizza, Bars)"
                      rows={4}
                    />
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gradient-to-br dark:from-white/5 dark:to-white/2 p-4">
                      <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                        {profileData.interestedBusinesses || 'No interested businesses set'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Danger Zone */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-red-600 dark:text-red-400 mb-6 flex items-center gap-3">
            <FaExclamationTriangle size={28} /> Danger Zone
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDeleteReviewsModal(true)}
              className="relative rounded-2xl overflow-hidden border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all group p-6 text-left"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.1), transparent 70%)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30">
                    <FaTrash className="text-red-600 dark:text-red-400" size={18} />
                  </div>
                  <h3 className="text-lg font-black text-red-700 dark:text-red-300">Delete All Reviews</h3>
                </div>
                <p className="text-sm text-red-600/70 dark:text-red-300/70">Remove all your reviews permanently.</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDeleteAccountModal(true)}
              className="relative rounded-2xl overflow-hidden border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all group p-6 text-left"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.1), transparent 70%)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30">
                    <FaTrash className="text-red-600 dark:text-red-400" size={18} />
                  </div>
                  <h3 className="text-lg font-black text-red-700 dark:text-red-300">Delete Account</h3>
                </div>
                <p className="text-sm text-red-600/70 dark:text-red-300/70">Permanently delete everything.</p>
              </div>
            </motion.button>
          </div>
        </section>
      </main>

      {/* Delete Reviews Modal */}
      <Modal
        title="Delete All Reviews?"
        description="This will permanently delete all your reviews. This action cannot be undone."
        isOpen={deleteReviewsModal}
        onClose={() => setDeleteReviewsModal(false)}
        variant="danger"
      >
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDeleteReviewsModal(false)}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/15 text-gray-700 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-black/50 transition-all"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeleteAllReviews}
            disabled={deletingReviews}
            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {deletingReviews ? <FaSpinner className="animate-spin" /> : <FaTrash size={14} />}
            {deletingReviews ? 'Deleting...' : 'Delete'}
          </motion.button>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        title="Delete Account?"
        description="This will permanently delete your account and all associated data including reviews, saved places, and profile information."
        isOpen={deleteAccountModal}
        onClose={() => setDeleteAccountModal(false)}
        variant="danger"
      >
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDeleteAccountModal(false)}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/15 text-gray-700 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-black/50 transition-all"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {deletingAccount ? <FaSpinner className="animate-spin" /> : <FaTrash size={14} />}
            {deletingAccount ? 'Deleting...' : 'Delete'}
          </motion.button>
        </div>
      </Modal>
    </div>
  )
}
