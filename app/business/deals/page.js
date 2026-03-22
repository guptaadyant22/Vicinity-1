// Deals management page for creating, editing, and sharing promotional offers
// COMPONENTS:
// DEAL CARD - Individual deal display with copy code, toggle active, edit, and delete actions
// HELPER FUNCTIONS:
// UPDATE STATS - Calculates total, active, expiring soon, and expired deal counts
// RESET FORM - Clears form fields and editing state
// GET DEAL TYPE INFO - Returns deal type configuration object
// SHOULD SHOW VALUE INPUT - Determines if discount value field is required
// HANDLE ADD CUSTOM DEAL TYPE - Creates and adds custom deal type to dropdown
// HANDLERS:
// HANDLE SUBMIT - Creates or updates deals with validation
// TOGGLE DEAL ACTIVE - Activates or deactivates deal visibility
// HANDLE DELETE - Removes deal with confirmation
// HANDLE EDIT - Loads deal data into form for editing
// HANDLE COPY CODE - Copies promo code to clipboard with feedback

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaTag,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheck,
  FaCopy,
  FaExclamationTriangle,
  FaCalendar,
  FaSync,
  FaChevronDown,
  FaHistory,
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
  'bg-white/80 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 rounded-[28px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:border-blue-500/28 hover:shadow-[0_20px_60px_rgba(59,130,246,0.10)] transition-all duration-300'

const GLASS_INPUT =
  'w-full px-4 py-2.5 bg-white dark:bg-[#111827] border border-blue-500/15 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-blue-50/50 dark:focus:bg-[#162033] focus:outline-none transition-all'

// Animated background
function PageBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base background */}
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
        className="absolute right-[-6%] top-[14%] h-[340px] w-[340px] rounded-full bg-blue-100/70 blur-[120px] dark:bg-blue-600/10"
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

const DEFAULT_DEAL_TYPES = [
  { id: 'percentage', label: '📊 Percentage Off', placeholder: '20', suffix: '%', requiresValue: true },
  { id: 'fixed', label: '💰 Fixed Discount', placeholder: '10.00', suffix: '$', requiresValue: true },
  { id: 'bogo', label: '🎁 Buy One Get One', placeholder: '', suffix: '', requiresValue: false },
  { id: 'free', label: '🎉 Free Item', placeholder: '', suffix: '', requiresValue: false }
]

export default function DealsPage() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [deals, setDeals] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [copiedCode, setCopiedCode] = useState(null)
  const [customDealType, setCustomDealType] = useState('')
  const [dealTypes, setDealTypes] = useState(DEFAULT_DEAL_TYPES)
  const [isCreating, setIsCreating] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    code: '',
    expiry_date: '',
  })

  const [stats, setStats] = useState({
    totalDeals: 0,
    activeDeals: 0,
    expiringSoon: 0,
    expiredDeals: 0
  })

  // Load deals
  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      try {
        setLoading(true)
        const { data: businessData, error: busError } = await supabase
          .from('businesses')
          .select('id, name, image_url')
          .eq('owner_id', user.id)
          .single()

        if (busError && busError.code !== 'PGRST116') {
          throw busError
        }

        if (!businessData) {
          setError('No business profile found.')
          setLoading(false)
          return
        }

        setBusiness(businessData)

        // Fetch deals
        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false })

        if (dealsError) {
          console.error('Deals fetch error:', dealsError)
          throw dealsError
        }

        setDeals(dealsData || [])

        // Set up real-time
        const channel = supabase
          .channel(`business-deals-${businessData.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'deals',
              filter: `business_id=eq.${businessData.id}`,
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setDeals((prev) => [payload.new, ...prev])
                setSuccess('✨ New deal received!')
                setTimeout(() => setSuccess(null), 3000)
              } else if (payload.eventType === 'UPDATE') {
                setDeals((prev) =>
                  prev.map((d) => (d.id === payload.new.id ? payload.new : d))
                )
                setSuccess('✨ Deal updated!')
                setTimeout(() => setSuccess(null), 3000)
              } else if (payload.eventType === 'DELETE') {
                setDeals((prev) => prev.filter((d) => d.id !== payload.old.id))
                setSuccess('✨ Deal deleted!')
                setTimeout(() => setSuccess(null), 3000)
              }
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (e) {
        console.error('Error loading deals:', e)
        setError('Failed to load deals: ' + e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.id, supabase])

  // Synced stats update
  useEffect(() => {
    updateStats(deals)
  }, [deals])

  // Update stats
  const updateStats = (dealsData) => {
    if (!dealsData || dealsData.length === 0) {
      setStats({ totalDeals: 0, activeDeals: 0, expiringSoon: 0, expiredDeals: 0 })
      return
    }

    const today = new Date()
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    const totalDeals = dealsData.length
    
    // Expired deals
    const expiredDeals = dealsData.filter((d) => new Date(d.expiry_date) < today).length

    // Active deals
    const activeDeals = dealsData.filter((d) => {
      const expiryDate = new Date(d.expiry_date)
      return d.is_active && expiryDate >= today
    }).length
    
    // Expiring soon
    const expiringSoon = dealsData.filter((d) => {
      const expiryDate = new Date(d.expiry_date)
      return d.is_active && expiryDate >= today && expiryDate <= threeDaysFromNow
    }).length

    setStats({ totalDeals, activeDeals, expiringSoon, expiredDeals })
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      code: '',
      expiry_date: '',
    })
    setEditingDeal(null)
    setCustomDealType('')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  // Get deal type info
  const getDealTypeInfo = (typeId) => {
    return dealTypes.find(d => d.id === typeId)
  }

  // Check if value input should show
  const shouldShowValueInput = (typeId) => {
    if (typeId === '__new__') return false
    const typeInfo = getDealTypeInfo(typeId)
    return typeInfo?.requiresValue || false
  }

  // Add custom deal type
  const handleAddCustomDealType = () => {
    if (!customDealType.trim()) {
      setError('Please enter a deal type name')
      setTimeout(() => setError(null), 3000)
      return
    }

    const newDealType = {
      id: customDealType.toLowerCase().replace(/\s+/g, '_'),
      label: `✨ ${customDealType}`,
      placeholder: 'Enter value (optional)',
      suffix: '',
      requiresValue: false
    }

    setDealTypes([...dealTypes, newDealType])
    setFormData({ ...formData, discount_type: newDealType.id })
    setCustomDealType('')
  }

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      setTimeout(() => setError(null), 3000)
      return
    }

    if (shouldShowValueInput(formData.discount_type) && !formData.discount_value.toString().trim()) {
      setError('Value is required for this deal type')
      setTimeout(() => setError(null), 3000)
      return
    }

    if (!formData.expiry_date) {
      setError('Expiry date is required')
      setTimeout(() => setError(null), 3000)
      return
    }

    const expiryDate = new Date(formData.expiry_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (expiryDate < today) {
      setError('Expiry date must be in the future')
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      setIsCreating(true)

      if (editingDeal) {
        // Update deal
        const updateData = {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value ? parseFloat(formData.discount_value) : 0,
          code: formData.code.trim() || null,
          expiry_date: formData.expiry_date,
          updated_at: new Date().toISOString(),
        }

        const { error: updateError } = await supabase
          .from('deals')
          .update(updateData)
          .eq('id', editingDeal.id)

        if (updateError) throw updateError

        setSuccess('✨ Deal updated!')
        setTimeout(() => {
          setSuccess(null)
          closeModal()
        }, 1200)
      } else {
        // Create new deal
        const insertData = {
          business_id: business.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value ? parseFloat(formData.discount_value) : 0,
          code: formData.code.trim() || null,
          expiry_date: formData.expiry_date,
          is_active: true,
        }

        const { data, error: insertError } = await supabase
          .from('deals')
          .insert([insertData])

        if (insertError) throw new Error(insertError.message || 'Failed to create deal')

        setSuccess('✅ Deal created successfully!')
        setTimeout(() => {
          setSuccess(null)
          closeModal()
        }, 1200)
      }
    } catch (err) {
      console.error('Full error:', err)
      setError(err.message || 'Error saving deal')
      setTimeout(() => setError(null), 4000)
    } finally {
      setIsCreating(false)
    }
  }

  // Toggle active state
  const toggleDealActive = async (deal) => {
    try {
      const newStatus = !deal.is_active
      const { error } = await supabase
        .from('deals')
        .update({ is_active: newStatus })
        .eq('id', deal.id)

      if (error) throw error
      
      setSuccess(newStatus ? '✨ Deal activated!' : '✨ Deal deactivated!')
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      setError('Error updating deal')
      setTimeout(() => setError(null), 3000)
    }
  }

  // Delete handler
  const handleDelete = async (dealId) => {
    if (!confirm('Delete this deal?')) return

    try {
      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId)

      if (deleteError) throw deleteError
      
      setSuccess('✨ Deal deleted!')
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      setError('Error deleting deal')
      setTimeout(() => setError(null), 3000)
    }
  }

  // Edit handler
  const handleEdit = (deal) => {
    setEditingDeal(deal)
    setFormData({
      title: deal.title,
      description: deal.description || '',
      discount_type: deal.discount_type,
      discount_value: deal.discount_value || '',
      code: deal.code || '',
      expiry_date: deal.expiry_date?.split('T')[0] || '',
    })
    setIsModalOpen(true)
  }

  // Copy promo code
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      setError('Failed to copy code')
      setTimeout(() => setError(null), 3000)
    }
  }

  // Filter logic
  const filteredDeals = filterType === 'all'
    ? deals
    : filterType === 'active'
    ? deals.filter((d) => d.is_active && new Date(d.expiry_date) > new Date())
    : filterType === 'expiring'
    ? deals.filter((d) => {
        const threeDaysFromNow = new Date()
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
        const expiryDate = new Date(d.expiry_date)
        return d.is_active && expiryDate > new Date() && expiryDate <= threeDaysFromNow
      })
    : deals

  if (loading || authLoading) {
    return (
      <BusinessLayout>
        <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
          <PageBackground />
          <div className="relative z-10 h-screen flex items-center justify-center transition-colors">
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

  if (!business) {
    return (
      <BusinessLayout>
        <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
          <PageBackground />
          <div className="relative z-10 h-screen flex items-center justify-center transition-colors">
            <div className="text-center">
              <p className="text-xl text-slate-500 dark:text-slate-400">No business found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Please create a business profile first</p>
            </div>
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
          {/* Soft glow for header */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
            <div className="absolute right-20 top-0 h-20 w-20 rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-400/10" />
          </div>

          <div className="relative flex min-h-[88px] items-center px-8">
            <div>
              {/* Page title */}
              <h1 className="font-[var(--font-outfit)] text-[30px] font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">
                Deals
              </h1>

              {/* Subtitle */}
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage and share your special offers
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
              className="px-8 py-3 bg-red-50/90 dark:bg-[#1f1720] border-b border-red-300/50 dark:border-red-400/20 text-red-700 dark:text-red-300 text-sm flex items-center gap-3 relative z-10 backdrop-blur-xl"
            >
              <FaExclamationTriangle /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-8 py-3 bg-blue-50/90 dark:bg-[#0f172a] border-b border-blue-300/50 dark:border-blue-400/20 text-blue-700 dark:text-blue-300 text-sm flex items-center gap-3 relative z-10 backdrop-blur-xl"
            >
              <FaCheck /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-6xl mx-auto p-8 pb-20">

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={GLASS_CARD}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">Total Deals</p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaTag size={16} />
                  </div>
                </div>
                <p className="text-4xl font-[var(--font-outfit)] font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">{stats.totalDeals}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={GLASS_CARD}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">Active</p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaCheck size={16} />
                  </div>
                </div>
                <p className="text-4xl font-[var(--font-outfit)] font-semibold tracking-[-0.05em] text-blue-600 dark:text-blue-300">{stats.activeDeals}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={GLASS_CARD}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">Expiring Soon</p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaCalendar size={16} />
                  </div>
                </div>
                <p className="text-4xl font-[var(--font-outfit)] font-semibold tracking-[-0.05em] text-blue-600 dark:text-blue-300">{stats.expiringSoon}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={GLASS_CARD}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">Expired</p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaHistory size={16} />
                  </div>
                </div>
                <p className="text-4xl font-[var(--font-outfit)] font-semibold tracking-[-0.05em] text-slate-500 dark:text-slate-300">{stats.expiredDeals}</p>
              </motion.div>
            </div>

            {/* Filter / action bar */}
            <div className={`mb-6 ${GLASS_BG} flex items-center justify-between px-6 py-4 rounded-[28px] relative z-10`}>
              <div className="flex gap-2 overflow-x-auto flex-1 no-scrollbar">
                {[{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'expiring', label: 'Expiring Soon' }].map((filter) => (
                  <motion.button
                    key={filter.key}
                    onClick={() => setFilterType(filter.key)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-2xl font-[var(--font-outfit)] font-semibold text-xs whitespace-nowrap transition-all border ${
                      filterType === filter.key
                        ? 'bg-blue-600 text-white border-transparent shadow-[0_10px_30px_rgba(59,130,246,0.24)]'
                        : 'bg-white dark:bg-[#162033] text-slate-500 dark:text-slate-400 border-blue-500/15 dark:border-white/10 hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-300'
                    }`}
                  >
                    {filter.label}
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <motion.button
                  onClick={() => { resetForm(); setIsModalOpen(true) }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-[var(--font-outfit)] font-semibold text-xs flex items-center gap-2 shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
                >
                  <FaPlus size={12} /> New Deal
                </motion.button>

                <motion.button
                  onClick={() => window.location.reload()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white dark:bg-[#162033] hover:bg-blue-50 dark:hover:bg-[#1d2a44] rounded-2xl text-slate-500 dark:text-slate-300 font-[var(--font-outfit)] font-semibold text-xs border border-blue-500/15 dark:border-white/10 flex items-center gap-2 transition-all shadow-sm"
                >
                  <FaSync size={12} />
                </motion.button>
              </div>
            </div>

            {/* Deals list */}
            <div className="space-y-4">
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal, idx) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    idx={idx}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={toggleDealActive}
                    onCopyCode={handleCopyCode}
                    copiedCode={copiedCode}
                    dealTypes={dealTypes}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-center py-20 ${GLASS_CARD}`}
                >
                  <FaTag size={40} className="mx-auto mb-4 text-blue-300 dark:text-blue-500/40" />
                  <h3 className="text-slate-900 dark:text-white font-[var(--font-outfit)] font-semibold mb-1">No deals found</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {filterType === 'all' ? 'Create your first deal to get started!' : 'No deals match your current filter'}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </main>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 dark:bg-black/75 backdrop-blur-sm p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`${GLASS_CARD} max-w-md w-full max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-500/12 dark:border-white/10">
                  <h2 className="text-xl font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                    {editingDeal ? 'Edit Deal' : 'Create Deal'}
                  </h2>
                  <motion.button
                    onClick={closeModal}
                    whileHover={{ rotate: 90 }}
                    className="p-2 hover:bg-blue-50 dark:hover:bg-[#162033] rounded-2xl transition-all"
                  >
                    <FaTimes className="text-slate-500 dark:text-slate-400" size={20} />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-2 tracking-[0.16em]">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Summer Sale"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={GLASS_INPUT}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-2 tracking-[0.16em]">
                      Description
                    </label>
                    <textarea
                      placeholder="Details about your offer..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`${GLASS_INPUT} resize-none h-20`}
                    />
                  </div>

                  {/* Deal type */}
                  <div>
                    <label className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-2 tracking-[0.16em]">
                      Deal Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value, discount_value: '' })}
                        className={`${GLASS_INPUT} appearance-none cursor-pointer font-[var(--font-outfit)] font-semibold`}
                      >
                        {dealTypes.map(type => (
                          <option key={type.id} value={type.id} className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">
                            {type.label}
                          </option>
                        ))}
                        <option value="__new__" className="bg-white dark:bg-[#0f172a] text-blue-600 dark:text-blue-300">
                          ➕ Create Custom Type
                        </option>
                      </select>
                      <FaChevronDown className="absolute right-4 top-3.5 text-blue-500 dark:text-blue-300 pointer-events-none" size={14} />
                    </div>
                  </div>

                  {/* Custom type */}
                  {formData.discount_type === '__new__' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-blue-50/70 dark:bg-blue-500/10 border border-blue-500/20 rounded-2xl"
                    >
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-[var(--font-outfit)] font-semibold mb-2">
                        Create a custom deal type:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g., Gift Card, Bundle"
                          value={customDealType}
                          onChange={(e) => setCustomDealType(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white dark:bg-[#111827] border border-blue-500/15 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none text-xs"
                        />
                        <motion.button
                          type="button"
                          onClick={handleAddCustomDealType}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-[var(--font-outfit)] font-semibold text-xs"
                        >
                          Add
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Value input */}
                  {formData.discount_type !== '__new__' && shouldShowValueInput(formData.discount_type) && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-2 tracking-[0.16em]">
                        Amount ({getDealTypeInfo(formData.discount_type)?.suffix}) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          placeholder={getDealTypeInfo(formData.discount_type)?.placeholder}
                          value={formData.discount_value}
                          onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                          className={GLASS_INPUT}
                          required
                        />
                        {getDealTypeInfo(formData.discount_type)?.suffix && (
                          <span className="absolute right-4 top-3 text-slate-400 font-[var(--font-outfit)] font-semibold">
                            {getDealTypeInfo(formData.discount_type).suffix}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Optional value */}
                  {formData.discount_type !== '__new__' && !shouldShowValueInput(formData.discount_type) && !DEFAULT_DEAL_TYPES.find(d => d.id === formData.discount_type) && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-2 tracking-[0.16em]">
                        Value (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Add value if needed"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                        className={GLASS_INPUT}
                      />
                    </motion.div>
                  )}

                  {/* Promo code */}
                  <div>
                    <label className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-2 tracking-[0.16em]">
                      Promo Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., SUMMER20"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className={`${GLASS_INPUT} font-[var(--font-outfit)] font-semibold tracking-widest`}
                    />
                  </div>

                  {/* Expiry */}
                  <div>
                    <label className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-2 tracking-[0.16em]">
                      Expires On <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className={GLASS_INPUT}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isCreating}
                    whileHover={{ scale: isCreating ? 1 : 1.02 }}
                    whileTap={{ scale: isCreating ? 1 : 0.98 }}
                    className="w-full py-3 bg-blue-600 text-white font-[var(--font-outfit)] font-semibold rounded-2xl hover:bg-blue-700 transition-all shadow-[0_12px_30px_rgba(59,130,246,0.22)] mt-6 disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : editingDeal ? '💾 Update Deal' : '🚀 Create Deal'}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BusinessLayout>
  )
}

function DealCard({ deal, idx, onEdit, onDelete, onToggle, onCopyCode, copiedCode, dealTypes }) {
  const GLASS_CARD =
    'bg-white/80 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 rounded-[28px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:border-blue-500/28 hover:shadow-[0_20px_60px_rgba(59,130,246,0.10)] transition-all duration-300'

  const isExpired = new Date(deal.expiry_date) < new Date()
  const daysLeft = Math.ceil((new Date(deal.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
  const dealType = dealTypes.find(d => d.id === deal.discount_type)
  const getEmoji = () => dealType ? dealType.label.split(' ')[0] : '✨'
  const getLabel = () => dealType ? dealType.label.substring(dealType.label.indexOf(' ') + 1) : 'Special Deal'
  const getSuffix = () => dealType ? dealType.suffix : ''

  return (
    <motion.div
      key={deal.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={`${GLASS_CARD} group relative overflow-hidden`}
    >
      {/* Hover glow */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/0 blur-3xl transition-all duration-500 group-hover:bg-blue-500/15" />

      <div className="relative z-10">
        {/* Top row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-semibold text-xl shadow-[0_10px_30px_rgba(59,130,246,0.24)]">
              {getEmoji()}
            </div>
            <div className="flex-1">
              <h4 className="font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white text-lg tracking-[-0.03em]">
                {deal.title}
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                <FaCalendar size={10} /> {isExpired ? '❌ Expired' : daysLeft === 0 ? '⏰ Today' : `${daysLeft} days left`}
              </span>
            </div>
          </div>

          <div className="flex gap-1">
            {isExpired ? (
              <div className="px-2 py-1 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-[var(--font-outfit)] font-semibold">
                Expired
              </div>
            ) : deal.is_active ? (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-[var(--font-outfit)] font-semibold"
              >
                ✓ Active
              </motion.div>
            ) : (
              <div className="px-2 py-1 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 text-xs font-[var(--font-outfit)] font-semibold">
                Hidden
              </div>
            )}
          </div>
        </div>

        {/* Deal labels */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-[var(--font-outfit)] font-semibold shadow-md ${
            deal.is_active && !isExpired ? 'bg-blue-600 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-white'
          }`}>
            {getEmoji()} {getLabel()}
          </span>

          {deal.discount_value > 0 && (
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-[var(--font-outfit)] font-semibold">
              {deal.discount_value}{getSuffix()}
            </span>
          )}
        </div>

        {/* Description */}
        {deal.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
            {deal.description}
          </p>
        )}

        {/* Promo code */}
        {deal.code && (
          <div className="mb-3 p-3 rounded-2xl bg-white/80 dark:bg-[#111827] border border-blue-500/15 dark:border-white/10 transition-colors duration-300">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-[var(--font-outfit)] font-semibold tracking-[0.16em] uppercase">
              Promo Code
            </p>
            <div className="flex items-center justify-between">
              <code className="text-blue-600 dark:text-blue-300 font-mono text-sm font-semibold tracking-widest">
                {deal.code}
              </code>
              <motion.button
                onClick={() => onCopyCode(deal.code)}
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-blue-50 dark:hover:bg-[#162033] rounded-xl transition-all"
              >
                <FaCopy size={10} className={copiedCode === deal.code ? 'text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'} />
              </motion.button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-blue-500/12 dark:border-white/10 pt-4 mt-4">
          <motion.button
            onClick={() => onToggle(deal)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isExpired}
            className={`flex-1 py-2 rounded-2xl font-[var(--font-outfit)] font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isExpired
                ? 'bg-slate-100 dark:bg-[#162033] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10'
                : deal.is_active
                ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20'
                : 'bg-white dark:bg-[#162033] border border-blue-500/15 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-[#1d2a44]'
            }`}
          >
            {isExpired ? '❌ Expired' : deal.is_active ? '👁️ Hide' : '🚀 Push'}
          </motion.button>

          <motion.button
            onClick={() => onEdit(deal)}
            whileHover={{ scale: 1.05 }}
            className="p-2 hover:bg-blue-50 dark:hover:bg-[#162033] rounded-2xl text-blue-500 dark:text-blue-300 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-500/20"
          >
            <FaEdit size={14} />
          </motion.button>

          <motion.button
            onClick={() => onDelete(deal.id)}
            whileHover={{ scale: 1.05 }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-[#162033] rounded-2xl text-slate-500 dark:text-slate-300 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            <FaTrash size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
