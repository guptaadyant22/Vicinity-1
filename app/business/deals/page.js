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
  FaTag, FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaCopy,
  FaExclamationTriangle, FaCalendar, FaSync, FaChevronDown, FaHistory
} from 'react-icons/fa'

import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout'
import Aurora from '../../../components/Aurora'

// --- THEMED CONSTANTS ---
const GLASS_BG = "bg-white/80 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-white/10"
const GLASS_CARD = "bg-white dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/40 hover:shadow-2xl transition-all"
const GLASS_INPUT = "w-full px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:bg-white dark:focus:bg-black/60 focus:outline-none transition-all"

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
        // Stats updated via effect

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

  // --- SYNCED STATS UPDATE ---
  useEffect(() => {
    updateStats(deals)
  }, [deals])

  const updateStats = (dealsData) => {
    if (!dealsData || dealsData.length === 0) {
      setStats({ totalDeals: 0, activeDeals: 0, expiringSoon: 0, expiredDeals: 0 })
      return
    }

    const today = new Date()
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    const totalDeals = dealsData.length
    
    // 1. Expired Deals (Any deal past expiry)
    const expiredDeals = dealsData.filter((d) => new Date(d.expiry_date) < today).length

    // 2. Active Deals (Visible AND Not Expired)
    const activeDeals = dealsData.filter((d) => {
      const expiryDate = new Date(d.expiry_date)
      return d.is_active && expiryDate >= today
    }).length
    
    // 3. Expiring Soon (Active AND Not Expired AND Within 3 Days)
    const expiringSoon = dealsData.filter((d) => {
      const expiryDate = new Date(d.expiry_date)
      return d.is_active && expiryDate >= today && expiryDate <= threeDaysFromNow
    }).length

    setStats({ totalDeals, activeDeals, expiringSoon, expiredDeals })
  }

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

  const getDealTypeInfo = (typeId) => {
    return dealTypes.find(d => d.id === typeId)
  }

  const shouldShowValueInput = (typeId) => {
    if (typeId === '__new__') return false
    const typeInfo = getDealTypeInfo(typeId)
    return typeInfo?.requiresValue || false
  }

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

  // Filter Logic
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
        <div className="h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center transition-colors">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full"
          />
        </div>
      </BusinessLayout>
    )
  }

  if (!business) {
    return (
      <BusinessLayout>
        <div className="h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center transition-colors">
          <div className="text-center">
            <p className="text-xl text-gray-500 dark:text-gray-400">No business found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Please create a business profile first</p>
          </div>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-white dark:bg-[#080808] transition-colors duration-300">
        <div className="absolute inset-0 transition-opacity duration-300 mix-blend-multiply dark:mix-blend-normal" style={{ clipPath: 'polygon(256px 0, 100% 0, 100% 100%, 256px 100%)' }}>
          <Aurora color1="#ff6f00" color2="#ffa500" color3="#ff6f00" amplitude={1} blend={0.5} speed={0.1} />
        </div>
      </div>

      <div className={`h-20 ${GLASS_BG} flex items-center px-8 relative z-10 transition-colors`}>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Deals</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage and share your special offers</p>
        </div>
      </div>

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

      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto p-8 pb-20">
          
          {/* STATS GRID - UPDATED TO 4 COLUMNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={GLASS_CARD}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Total Deals</p>
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-600 dark:text-orange-400"><FaTag size={16} /></div>
              </div>
              <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalDeals}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={GLASS_CARD}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Active</p>
                <div className="p-2 bg-green-500/20 rounded-lg text-green-600 dark:text-green-400"><FaCheck size={16} /></div>
              </div>
              <p className="text-4xl font-black text-green-600 dark:text-green-400">{stats.activeDeals}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={GLASS_CARD}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Expiring Soon</p>
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400"><FaCalendar size={16} /></div>
              </div>
              <p className="text-4xl font-black text-yellow-600 dark:text-yellow-400">{stats.expiringSoon}</p>
            </motion.div>

            {/* NEW EXPIRED STAT CARD */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={GLASS_CARD}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Expired</p>
                <div className="p-2 bg-red-500/20 rounded-lg text-red-600 dark:text-red-400"><FaHistory size={16} /></div>
              </div>
              <p className="text-4xl font-black text-red-600 dark:text-red-400">{stats.expiredDeals}</p>
            </motion.div>
          </div>

          <div className={`mb-6 ${GLASS_BG} flex items-center justify-between px-6 py-4 rounded-2xl relative z-10`}>
            <div className="flex gap-2 overflow-x-auto flex-1 no-scrollbar">
              {[{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'expiring', label: 'Expiring Soon' }].map((filter) => (
                <motion.button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all border ${
                    filterType === filter.key
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/30'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-orange-500/30 hover:text-orange-500 dark:hover:text-white'
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
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/30"
              >
                <FaPlus size={12} /> New Deal
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

          <div className="space-y-4">
            {filteredDeals.length > 0 ? (
              filteredDeals.map((deal, idx) => (
                <DealCard key={deal.id} deal={deal} idx={idx} onEdit={handleEdit} onDelete={handleDelete} onToggle={toggleDealActive} onCopyCode={handleCopyCode} copiedCode={copiedCode} dealTypes={dealTypes} />
              ))
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`text-center py-20 ${GLASS_CARD}`}>
                <FaTag size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-gray-900 dark:text-white font-bold mb-1">No deals found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{filterType === 'all' ? 'Create your first deal to get started!' : 'No deals match your current filter'}</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/95 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${GLASS_CARD} max-w-md w-full max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingDeal ? 'Edit Deal' : 'Create Deal'}</h2>
                <motion.button
                  onClick={closeModal}
                  whileHover={{ rotate: 90 }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all"
                >
                  <FaTimes className="text-gray-500 dark:text-gray-400" size={20} />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Sale"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={GLASS_INPUT}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Description</label>
                  <textarea
                    placeholder="Details about your offer..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${GLASS_INPUT} resize-none h-20`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Deal Type <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value, discount_value: '' })}
                      className={`${GLASS_INPUT} appearance-none cursor-pointer font-bold`}
                    >
                      {dealTypes.map(type => (
                        <option key={type.id} value={type.id} className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white">{type.label}</option>
                      ))}
                      <option value="__new__" className="bg-white dark:bg-[#1a1a1a] text-orange-500 dark:text-orange-400">➕ Create Custom Type</option>
                    </select>
                    <FaChevronDown className="absolute right-4 top-3.5 text-orange-500 dark:text-orange-400 pointer-events-none" size={14} />
                  </div>
                </div>

                {formData.discount_type === '__new__' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-orange-50 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 rounded-lg">
                    <p className="text-xs text-orange-600 dark:text-orange-300 font-bold mb-2">Create a custom deal type:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g., Gift Card, Bundle"
                        value={customDealType}
                        onChange={(e) => setCustomDealType(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white dark:bg-black/40 border border-orange-200 dark:border-orange-500/50 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:outline-none text-xs"
                      />
                      <motion.button
                        type="button"
                        onClick={handleAddCustomDealType}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded text-white font-bold text-xs"
                      >
                        Add
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {formData.discount_type !== '__new__' && shouldShowValueInput(formData.discount_type) && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">
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
                        <span className="absolute right-4 top-3 text-gray-400 font-bold">{getDealTypeInfo(formData.discount_type).suffix}</span>
                      )}
                    </div>
                  </motion.div>
                )}

                {formData.discount_type !== '__new__' && !shouldShowValueInput(formData.discount_type) && !DEFAULT_DEAL_TYPES.find(d => d.id === formData.discount_type) && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Value (Optional)</label>
                    <input
                      type="text"
                      placeholder="Add value if needed"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      className={GLASS_INPUT}
                    />
                  </motion.div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Promo Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., SUMMER20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className={`${GLASS_INPUT} font-bold tracking-widest`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Expires On <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className={GLASS_INPUT}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isCreating}
                  whileHover={{ scale: isCreating ? 1 : 1.02 }}
                  whileTap={{ scale: isCreating ? 1 : 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 mt-6 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : editingDeal ? '💾 Update Deal' : '🚀 Create Deal'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BusinessLayout>
  )
}

function DealCard({ deal, idx, onEdit, onDelete, onToggle, onCopyCode, copiedCode, dealTypes }) {
  const GLASS_CARD = "bg-white dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-md hover:shadow-xl dark:shadow-black/40 transition-all"
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
      className={GLASS_CARD}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/30">{getEmoji()}</div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 dark:text-white text-lg">{deal.title}</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><FaCalendar size={10} /> {isExpired ? '❌ Expired' : daysLeft === 0 ? '⏰ Today' : `${daysLeft} days left`}</span>
          </div>
        </div>
        <div className="flex gap-1">
          {isExpired ? (
             <div className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/20 border border-red-500/50 text-red-700 dark:text-red-300 text-xs font-bold">
               Expired
             </div>
          ) : deal.is_active ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/20 border border-green-500/50 text-green-700 dark:text-green-300 text-xs font-bold"
            >
              ✓ Active
            </motion.div>
          ) : (
            <div className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-500/20 border border-gray-300 dark:border-gray-500/50 text-gray-500 dark:text-gray-300 text-xs font-bold">Hidden</div>
          )}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <span className={`px-3 py-1 rounded-full text-white text-xs font-bold shadow-md ${deal.is_active && !isExpired ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gray-400 dark:bg-gray-600'}`}>
          {getEmoji()} {getLabel()}
        </span>
        {deal.discount_value > 0 && <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold">{deal.discount_value}{getSuffix()}</span>}
      </div>

      {deal.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{deal.description}</p>}

      {deal.code && (
        <div className="mb-3 p-3 rounded-lg bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-bold">PROMO CODE</p>
          <div className="flex items-center justify-between">
            <code className="text-orange-600 dark:text-orange-300 font-mono text-sm font-bold tracking-widest">{deal.code}</code>
            <motion.button
              onClick={() => onCopyCode(deal.code)}
              whileHover={{ scale: 1.1 }}
              className="p-2 hover:bg-white dark:hover:bg-white/20 rounded transition-all"
            >
              <FaCopy size={10} className={copiedCode === deal.code ? 'text-green-500' : 'text-orange-500'} />
            </motion.button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-gray-200 dark:border-white/5 pt-4 mt-4">
        <motion.button
          onClick={() => onToggle(deal)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isExpired}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isExpired ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-white/10' 
            : deal.is_active ? 'bg-orange-50 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/50 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-500/30' 
            : 'bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
          }`}
        >
          {isExpired ? '❌ Expired' : deal.is_active ? '👁️ Hide' : '🚀 Push'}
        </motion.button>
        <motion.button
          onClick={() => onEdit(deal)}
          whileHover={{ scale: 1.05 }}
          className="p-2 hover:bg-blue-50 dark:hover:bg-white/10 rounded-lg text-blue-500 dark:text-blue-400 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
        >
          <FaEdit size={14} />
        </motion.button>
        <motion.button
          onClick={() => onDelete(deal.id)}
          whileHover={{ scale: 1.05 }}
          className="p-2 hover:bg-red-50 dark:hover:bg-white/10 rounded-lg text-red-500 dark:text-red-400 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
        >
          <FaTrash size={14} />
        </motion.button>
      </div>
    </motion.div>
  )
}
