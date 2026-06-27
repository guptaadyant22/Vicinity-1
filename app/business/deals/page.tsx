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
} from 'react-icons/fa'
import { Inter, Outfit } from 'next/font/google'

import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout'


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})


const PAGE_WRAP =
  `${inter.variable} ${outfit.variable} relative text-slate-900 transition-colors duration-300 dark:text-white`

const GLASS_BG =
  'bg-white/82 dark:bg-[#0e1628]/92 backdrop-blur-xl border border-blue-500/12 dark:border-white/10 transition-colors duration-300'

const GLASS_CARD =
  'bg-white/88 dark:bg-[#0f172a]/94 backdrop-blur-xl border border-blue-500/10 dark:border-white/10 rounded-[30px] p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_55px_rgba(0,0,0,0.35)] transition-all duration-300'

const MODAL_CARD =
  'bg-white dark:bg-[#0c1424] backdrop-blur-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-[30px] p-6 shadow-[0_30px_90px_rgba(15,23,42,0.18)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.55)] transition-all duration-300'

const GLASS_INPUT =
  'w-full px-4 py-3 bg-slate-50 dark:bg-[#111a2e] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-blue-50 dark:focus:bg-[#16233d] focus:outline-none transition-all'


const DEFAULT_DEAL_TYPES = [
  { id: 'percentage', label: '📊 Percentage Off', placeholder: '20', suffix: '%', requiresValue: true },
  { id: 'fixed', label: '💰 Fixed Discount', placeholder: '10.00', suffix: '$', requiresValue: true },
  { id: 'bogo', label: '🎁 Buy One Get One', placeholder: '', suffix: '', requiresValue: false },
  { id: 'free', label: '🎉 Free Item', placeholder: '', suffix: '', requiresValue: false },
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
    expiredDeals: 0,
  })


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
    const expiredDeals = dealsData.filter((d) => new Date(d.expiry_date) < today).length

    const activeDeals = dealsData.filter((d) => {
      const expiryDate = new Date(d.expiry_date)
      return d.is_active && expiryDate >= today
    }).length

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
    return dealTypes.find((d) => d.id === typeId)
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
      requiresValue: false,
    }

    setDealTypes([...dealTypes, newDealType])
    setFormData({ ...formData, discount_type: newDealType.id })
    setCustomDealType('')
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError('Title is required')
      setTimeout(() => setError(null), 3000)
      return
    }

    if (
      shouldShowValueInput(formData.discount_type) &&
      !formData.discount_value.toString().trim()
    ) {
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

        const { error: insertError } = await supabase
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


  const filteredDeals =
    filterType === 'all'
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
          <div className="relative z-10 flex min-h-full items-center justify-center py-16 transition-colors">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-12 w-12 rounded-full border-[3px] border-blue-500/30 border-t-blue-600 dark:border-blue-400/20 dark:border-t-blue-300"
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
          <div className="relative z-10 flex min-h-full items-center justify-center py-16 transition-colors">
            <div className="text-center">
              <p className="text-xl text-slate-500 dark:text-slate-400">No business found</p>
              <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
                Please create a business profile first
              </p>
            </div>
          </div>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
        <div className="relative z-10 border-b border-blue-500/10 dark:border-white/10 bg-white/70 dark:bg-[#0b1322] backdrop-blur-xl transition-colors duration-300">
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute left-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
    <div className="absolute right-20 top-0 h-20 w-20 rounded-full bg-cyan-100/50 blur-3xl dark:bg-cyan-400/10" />
  </div>

  <div className="relative flex min-h-[88px] items-center justify-between px-8">
    <div>
      <h1 className="font-[var(--font-outfit)] text-[30px] font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">
        Deals
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Manage active promotions and keep your offers polished.
      </p>
    </div>

    <div className="flex items-center gap-3">
      <motion.button
        onClick={() => window.location.reload()}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/15 bg-white px-4 py-3 font-[var(--font-outfit)] text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-blue-50 dark:border-white/10 dark:bg-[#13203a] dark:text-slate-300 dark:hover:bg-[#1c2b4b]"
      >
        <FaSync size={12} />
        Refresh
      </motion.button>

      <motion.button
        onClick={() => {
          resetForm()
          setIsModalOpen(true)
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-[var(--font-outfit)] text-xs font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.24)]"
      >
        <FaPlus size={12} />
        New Deal
      </motion.button>
    </div>
  </div>
</div>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10 border-b border-red-300/50 bg-red-50/90 px-8 py-3 text-sm text-red-700 backdrop-blur-xl dark:border-red-400/20 dark:bg-[#1f1720] dark:text-red-300"
            >
              <div className="mx-auto flex max-w-7xl items-center gap-3">
                <FaExclamationTriangle />
                {error}
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10 border-b border-blue-300/50 bg-blue-50/90 px-8 py-3 text-sm text-blue-700 backdrop-blur-xl dark:border-blue-400/20 dark:bg-[#0f172a] dark:text-blue-300"
            >
              <div className="mx-auto flex max-w-7xl items-center gap-3">
                <FaCheck />
                {success}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="relative z-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pb-20 pt-8 lg:px-8">
            <section>
              <div className={`${GLASS_CARD} relative overflow-hidden`}>
                <div className="absolute right-[-30px] top-[-20px] h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute bottom-[-40px] left-[-20px] h-36 w-36 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-500/10" />

                <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                  <div>
                    <h2 className="font-[var(--font-outfit)] text-[30px] font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
                      Keep your offers fresh and easy to manage.
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                      Track what is live and what needs attention without changing any of your current logic.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-[22px] border border-blue-500/10 bg-white/85 px-4 py-4 dark:border-white/10 dark:bg-[#111f36]">
                      <p className="text-[10px] font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        Total
                      </p>
                      <p className="mt-1 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
                        {stats.totalDeals}
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-blue-500/20 bg-blue-50 px-4 py-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                      <p className="text-[10px] font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">
                        Active
                      </p>
                      <p className="mt-1 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-blue-700 dark:text-blue-300">
                        {stats.activeDeals}
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-slate-200 bg-slate-100 px-4 py-4 dark:border-white/10 dark:bg-[#172033]">
                      <p className="text-[10px] font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
                        Expired
                      </p>
                      <p className="mt-1 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-700 dark:text-slate-200">
                        {stats.expiredDeals}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={`${GLASS_BG} rounded-[30px] p-4`}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {[
                    { key: 'all', label: 'All deals' },
                    { key: 'active', label: 'Active' },
                    { key: 'expiring', label: 'Expiring soon' },
                  ].map((filter) => (
                    <motion.button
                      key={filter.key}
                      onClick={() => setFilterType(filter.key)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`rounded-2xl px-4 py-2.5 font-[var(--font-outfit)] text-xs font-semibold whitespace-nowrap transition-all border ${
                        filterType === filter.key
                          ? 'bg-blue-600 text-white border-transparent shadow-[0_10px_30px_rgba(59,130,246,0.24)]'
                          : 'bg-white dark:bg-[#13203a] text-slate-500 dark:text-slate-400 border-blue-500/15 dark:border-white/10 hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-300'
                      }`}
                    >
                      {filter.label}
                    </motion.button>
                  ))}
                </div>

                <div className="rounded-2xl border border-blue-500/12 bg-white/80 px-4 py-2.5 text-[11px] font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-white/10 dark:bg-[#111f36] dark:text-slate-400">
                  Showing {filteredDeals.length} result{filteredDeals.length === 1 ? '' : 's'}
                </div>
              </div>
            </section>

            <section className="space-y-4">
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
                  className={`${GLASS_CARD} py-20 text-center`}
                >
                  <FaTag size={40} className="mx-auto mb-4 text-blue-300 dark:text-blue-500/40" />
                  <h3 className="mb-1 font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white">
                    No deals found
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {filterType === 'all'
                      ? 'Create your first deal to get started!'
                      : 'No deals match your current filter'}
                  </p>
                </motion.div>
              )}
            </section>
          </div>
        </main>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md dark:bg-black/70"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
                className={`${MODAL_CARD} max-h-[90vh] w-full max-w-md overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
                  <div>
                    <p className="text-[11px] font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                      {editingDeal ? 'Update offer' : 'Create offer'}
                    </p>
                    <h2 className="mt-2 font-[var(--font-outfit)] text-xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                      {editingDeal ? 'Edit Deal' : 'Create Deal'}
                    </h2>
                  </div>

                  <motion.button
                    onClick={closeModal}
                    whileHover={{ rotate: 90 }}
                    className="rounded-2xl p-2 text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#13203a]"
                  >
                    <FaTimes size={20} />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
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

                  <div>
                    <label className="mb-2 block text-xs font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Description
                    </label>
                    <textarea
                      placeholder="Details about your offer..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`${GLASS_INPUT} h-24 resize-none`}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Deal Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.discount_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount_type: e.target.value,
                            discount_value: '',
                          })
                        }
                        className={`${GLASS_INPUT} appearance-none cursor-pointer font-[var(--font-outfit)] font-semibold [color-scheme:light] dark:[color-scheme:dark]`}
                      >
                        {dealTypes.map((type) => (
                          <option
                            key={type.id}
                            value={type.id}
                            className="bg-white text-slate-900 dark:bg-[#0c1424] dark:text-white"
                          >
                            {type.label}
                          </option>
                        ))}
                        <option
                          value="__new__"
                          className="bg-white text-blue-600 dark:bg-[#0c1424] dark:text-blue-300"
                        >
                          ➕ Create Custom Type
                        </option>
                      </select>

                      <FaChevronDown
                        className="pointer-events-none absolute right-4 top-4 text-blue-500 dark:text-blue-300"
                        size={14}
                      />
                    </div>
                  </div>

                  {formData.discount_type === '__new__' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-blue-200 bg-blue-50/90 p-3 dark:border-blue-500/20 dark:bg-blue-500/10"
                    >
                      <p className="mb-2 text-xs font-[var(--font-outfit)] font-semibold text-blue-700 dark:text-blue-300">
                        Create a custom deal type:
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g., Gift Card, Bundle"
                          value={customDealType}
                          onChange={(e) => setCustomDealType(e.target.value)}
                          className="flex-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-[#111f36] dark:text-white dark:placeholder-slate-500"
                        />

                        <motion.button
                          type="button"
                          onClick={handleAddCustomDealType}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-xl bg-blue-600 px-3 py-2 font-[var(--font-outfit)] text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Add
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {formData.discount_type !== '__new__' &&
                    shouldShowValueInput(formData.discount_type) && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <label className="mb-2 block text-xs font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                          Amount ({getDealTypeInfo(formData.discount_type)?.suffix}){' '}
                          <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            placeholder={getDealTypeInfo(formData.discount_type)?.placeholder}
                            value={formData.discount_value}
                            onChange={(e) =>
                              setFormData({ ...formData, discount_value: e.target.value })
                            }
                            className={GLASS_INPUT}
                            required
                          />

                          {getDealTypeInfo(formData.discount_type)?.suffix && (
                            <span className="absolute right-4 top-3.5 font-[var(--font-outfit)] font-semibold text-slate-400 dark:text-slate-500">
                              {getDealTypeInfo(formData.discount_type)?.suffix}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}

                  {formData.discount_type !== '__new__' &&
                    !shouldShowValueInput(formData.discount_type) &&
                    !DEFAULT_DEAL_TYPES.find((d) => d.id === formData.discount_type) && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <label className="mb-2 block text-xs font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                          Value (Optional)
                        </label>

                        <input
                          type="text"
                          placeholder="Add value if needed"
                          value={formData.discount_value}
                          onChange={(e) =>
                            setFormData({ ...formData, discount_value: e.target.value })
                          }
                          className={GLASS_INPUT}
                        />
                      </motion.div>
                    )}

                  <div>
                    <label className="mb-2 block text-xs font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Promo Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., SUMMER20"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      className={`${GLASS_INPUT} font-[var(--font-outfit)] font-semibold tracking-widest`}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Expires On <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) =>
                        setFormData({ ...formData, expiry_date: e.target.value })
                      }
                      className={`${GLASS_INPUT} [color-scheme:light] dark:[color-scheme:dark]`}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isCreating}
                    whileHover={{ scale: isCreating ? 1 : 1.02 }}
                    whileTap={{ scale: isCreating ? 1 : 0.98 }}
                    className="mt-6 w-full rounded-2xl bg-blue-600 py-3 font-[var(--font-outfit)] font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.22)] transition-all hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : editingDeal ? 'Update Deal' : 'Create Deal'}
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
  const isExpired = new Date(deal.expiry_date) < new Date()
  const daysLeft = Math.ceil((new Date(deal.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const dealType = dealTypes.find((d) => d.id === deal.discount_type)


  const getEmoji = () => (dealType ? dealType.label.split(' ')[0] : '✨')
  const getLabel = () =>
    dealType ? dealType.label.substring(dealType.label.indexOf(' ') + 1) : 'Special Deal'
  const getSuffix = () => (dealType ? dealType.suffix : '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="group relative overflow-hidden rounded-[30px] border border-blue-500/10 bg-white/88 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/24 hover:shadow-[0_22px_60px_rgba(59,130,246,0.10)] dark:border-white/10 dark:bg-[#0f172a]/94 dark:shadow-[0_20px_55px_rgba(0,0,0,0.35)]"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/0 blur-3xl transition-all duration-500 group-hover:bg-blue-500/12" />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-blue-600 text-xl text-white shadow-[0_12px_30px_rgba(59,130,246,0.24)]">
              {getEmoji()}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-[var(--font-outfit)] text-[22px] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                  {deal.title}
                </h3>

                {isExpired ? (
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-[var(--font-outfit)] font-semibold text-slate-600 dark:border-white/10 dark:bg-[#172033] dark:text-slate-300">
                    Expired
                  </span>
                ) : deal.is_active ? (
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-[var(--font-outfit)] font-semibold text-blue-700 dark:text-blue-300"
                  >
                    Active
                  </motion.span>
                ) : (
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-[var(--font-outfit)] font-semibold text-slate-500 dark:border-white/10 dark:bg-[#172033] dark:text-slate-300">
                    Hidden
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {isExpired
                  ? 'This deal has passed its expiry date.'
                  : daysLeft === 0
                  ? 'Ends today.'
                  : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left.`}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-[var(--font-outfit)] font-semibold ${
                    deal.is_active && !isExpired
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white'
                  }`}
                >
                  {getLabel()}
                </span>

                {deal.discount_value > 0 && (
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-[var(--font-outfit)] font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                    {deal.discount_value}
                    {getSuffix()}
                  </span>
                )}

                <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/12 bg-white/80 px-3 py-1 text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:border-white/10 dark:bg-[#13203a] dark:text-slate-400">
                  <FaCalendar size={10} />
                  {new Date(deal.expiry_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:justify-end">
            <motion.button
              onClick={() => onEdit(deal)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl border border-blue-500/12 bg-white p-3 text-blue-600 transition-all hover:bg-blue-50 dark:border-white/10 dark:bg-[#13203a] dark:text-blue-300 dark:hover:bg-[#1c2b4b]"
            >
              <FaEdit size={14} />
            </motion.button>

            <motion.button
              onClick={() => onDelete(deal.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl border border-blue-500/12 bg-white p-3 text-slate-500 transition-all hover:bg-slate-100 dark:border-white/10 dark:bg-[#13203a] dark:text-slate-300 dark:hover:bg-[#1c2b4b]"
            >
              <FaTrash size={14} />
            </motion.button>
          </div>
        </div>

        {deal.description && (
          <div className="mt-5 rounded-[24px] border border-blue-500/10 bg-white/82 p-4 dark:border-white/10 dark:bg-[#111f36]">
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              {deal.description}
            </p>
          </div>
        )}

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            {deal.code ? (
              <div className="rounded-[24px] border border-blue-500/12 bg-white/85 p-4 dark:border-white/10 dark:bg-[#111f36]">
                <p className="mb-2 text-[11px] font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Promo Code
                </p>

                <div className="flex items-center justify-between gap-3">
                  <code className="font-mono text-sm font-semibold tracking-[0.24em] text-blue-600 dark:text-blue-300">
                    {deal.code}
                  </code>

                  <motion.button
                    onClick={() => onCopyCode(deal.code)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-xl p-2 transition-all hover:bg-blue-50 dark:hover:bg-[#1c2b4b]"
                  >
                    <FaCopy
                      size={11}
                      className={
                        copiedCode === deal.code
                          ? 'text-blue-600 dark:text-blue-300'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    />
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-blue-300/50 bg-white/55 p-4 dark:border-white/12 dark:bg-[#111f36]/80">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No promo code attached to this deal.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onToggle(deal)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isExpired}
              className={`rounded-2xl px-5 py-3 font-[var(--font-outfit)] text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                isExpired
                  ? 'border border-slate-200 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-[#13203a] dark:text-slate-500'
                  : deal.is_active
                  ? 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20'
                  : 'border border-blue-500/15 bg-white text-slate-700 hover:bg-blue-50 dark:border-white/10 dark:bg-[#13203a] dark:text-slate-300 dark:hover:bg-[#1c2b4b]'
              }`}
            >
              {isExpired ? 'Expired' : deal.is_active ? 'Hide deal' : 'Activate'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
