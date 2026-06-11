'use client'


// Shared layout wrapper for all business dashboard pages with sidebar navigation and deals management.
// Includes animated background, responsive sidebar, deal CRUD modal, and deals listing section.

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaHome,
  FaStore,
  FaStar,
  FaCog,
  FaBars,
  FaPowerOff,
  FaTag,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheck,
  FaCopy,
  FaEnvelope,
  FaUniversalAccess,
} from 'react-icons/fa'
import { Inter, Outfit } from 'next/font/google'

import { useAuth } from '../context/AuthContext'
import { createClient } from '../lib/supabase'
import ThemeToggle from './ThemeToggle'


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})


const UI_SETTINGS = {
  pageWrap:
    `${inter.variable} ${outfit.variable} h-screen w-full flex overflow-hidden text-slate-900 dark:text-white bg-white dark:bg-[#081120] transition-colors duration-300`,
  glassSidebar:
    'bg-white dark:bg-[#0b1322] border-r border-blue-500/12 dark:border-white/10 shadow-[0_10px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-colors duration-300',
  glassCard:
    'bg-white dark:bg-[#0f172a] border border-blue-500/12 dark:border-white/10 rounded-[26px] shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-colors duration-300',
  glassModal:
    'bg-white dark:bg-[#0f172a] border border-blue-500/12 dark:border-white/10 rounded-[30px] shadow-[0_20px_70px_rgba(15,23,42,0.16)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)] transition-colors duration-300',
  glassInput:
    'w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#111827] border border-blue-500/15 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-blue-50/60 dark:focus:bg-[#162033] transition-all text-sm',
  primaryButton:
    'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]',
  softButton:
    'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20',
}


// Inline Vicinity logo for the sidebar header
const VicinityLogo = ({ className = '', textClassName = '' }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="35"
      height="35"
      viewBox="0,0,256,256"
      className="w-8 h-8"
    >
      <g fill="#2563eb" fillRule="nonzero">
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

    <span
      className={`font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white text-xl tracking-[-0.04em] ${textClassName}`}
    >
      Vicinity
    </span>
  </div>
)


// Animated blue glow background for dashboard pages
const Background = () => (
  <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none transition-colors duration-300 bg-white dark:bg-[#081120]">
    <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:from-[#081120] dark:via-[#081120] dark:to-[#081120]" />

    <motion.div
      animate={{
        y: [0, -14, 0],
        scale: [1, 1.05, 1],
        opacity: [0.2, 0.38, 0.2],
        transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="absolute left-1/2 top-[8%] h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-blue-200/70 blur-[140px] dark:bg-blue-500/16"
    />

    <motion.div
      animate={{
        x: [0, 14, 0],
        y: [0, 10, 0],
        opacity: [0.12, 0.24, 0.12],
        transition: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="absolute left-[-8%] top-[18%] h-[320px] w-[320px] rounded-full bg-cyan-100/80 blur-[120px] dark:bg-cyan-500/10"
    />

    <motion.div
      animate={{
        x: [0, -16, 0],
        y: [0, -8, 0],
        opacity: [0.12, 0.24, 0.12],
        transition: { duration: 11, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="absolute right-[-8%] top-[10%] h-[340px] w-[340px] rounded-full bg-indigo-100/70 blur-[120px] dark:bg-indigo-500/10"
    />

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
        WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 100%)',
      }}
    />

    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#081120]" />
  </div>
)


const NAV_ITEMS = [
  { label: 'Dashboard', icon: FaHome, href: '/business/dashboard' },
  { label: 'Profile', icon: FaStore, href: '/business/profile' },
  { label: 'Messages', icon: FaEnvelope, href: '/business/messages' },
  { label: 'Deals', icon: FaTag, href: '/business/deals' },
  { label: 'Reviews', icon: FaStar, href: '/business/reviews' },
  { label: 'Settings', icon: FaCog, href: '/business/settings' },
]


// Responsive sidebar navigation with nav items and logout
function SidebarNav({ pathname, onLogout, isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 dark:bg-black/75 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:relative top-0 left-0 h-full w-64 ${UI_SETTINGS.glassSidebar} z-50 transform transition-all duration-300 lg:translate-x-0 flex flex-col shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-20%] top-10 h-40 w-40 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-500/10" />
          <div className="absolute right-[-15%] bottom-20 h-36 w-36 rounded-full bg-cyan-200/20 blur-3xl dark:bg-cyan-400/10" />
        </div>

        <div className="relative h-24 border-b border-blue-500/10 dark:border-white/10 flex items-center px-6">
          <Link href="/business/dashboard" className="w-full">
            <div className="flex items-center justify-between">
              <VicinityLogo className="w-full" />
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-[#162033] transition-colors"
                aria-label="Close sidebar"
              >
                <FaTimes size={18} />
              </button>
            </div>
          </Link>
        </div>

        <nav className="relative flex-1 px-4 py-5 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-[var(--font-outfit)] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border border-blue-700 shadow-[0_10px_30px_rgba(59,130,246,0.24)]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#162033] border border-transparent'
                }`}
              >
                <Icon
                  size={16}
                  className={
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-300'
                  }
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="relative p-4 border-t border-blue-500/10 dark:border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('toggle-accessibility-menu'))}
              title="Accessibility Options"
              aria-label="Accessibility Options"
              className="relative flex h-[42px] w-[42px] items-center justify-center rounded-2xl border transition-all duration-300 shrink-0 bg-white/80 border-blue-500/12 text-blue-600 hover:bg-blue-50 hover:border-blue-200 dark:bg-white/[0.05] dark:border-white/10 dark:text-blue-400 dark:hover:bg-white/[0.10] dark:hover:border-blue-400/30"
            >
              <FaUniversalAccess size={18} />
            </button>
          </div>
          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-[var(--font-outfit)] font-semibold cursor-pointer transition-all text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200/0 dark:border-red-500/0 hover:border-red-200 dark:hover:border-red-500/20"
          >
            <FaPowerOff size={16} />
            Logout
          </motion.button>
        </div>
      </aside>
    </>
  )
}


// Modal form for creating and editing business deals
function DealsModal({ isOpen, onClose, onSubmit, editingDeal }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    code: '',
    expiry_date: '',
    is_active: true,
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    if (editingDeal) {
      setFormData({
        title: editingDeal.title,
        description: editingDeal.description || '',
        discount_type: editingDeal.discount_type,
        discount_value: editingDeal.discount_value.toString(),
        code: editingDeal.code || '',
        expiry_date: editingDeal.expiry_date?.split('T')[0] || '',
        is_active: editingDeal.is_active,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        code: '',
        expiry_date: '',
        is_active: true,
      })
    }

    setError(null)
  }, [editingDeal, isOpen])


  // Validate and submit the deal form
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.discount_value) {
      setError('Discount value is required')
      return
    }

    if (!formData.expiry_date) {
      setError('Expiry date is required')
      return
    }

    onSubmit(formData)
    onClose()
  }

  const GLASS_INPUT = UI_SETTINGS.glassInput

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 dark:bg-black/80 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className={`${UI_SETTINGS.glassModal} max-w-md w-full max-h-[90vh] overflow-y-auto p-8`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-[var(--font-outfit)] font-semibold tracking-[-0.04em] text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                  <FaTag />
                </span>
                {editingDeal ? 'Edit Deal' : 'Create New Deal'}
              </h2>

              <motion.button
                onClick={onClose}
                whileHover={{ rotate: 90 }}
                className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-[#162033] transition-all"
              >
                <FaTimes className="text-slate-500 dark:text-slate-400" size={18} />
              </motion.button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[11px] font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em] block mb-2">
                  Deal Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Summer Sale, Happy Hour"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={GLASS_INPUT}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em] block mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Details about your offer..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${GLASS_INPUT} resize-none h-24`}
                />
              </div>

              <div>
                <label className="text-[11px] font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em] block mb-2">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className={GLASS_INPUT}
                >
                  <option value="percentage">Percentage Off (e.g., 20%)</option>
                  <option value="fixed">Fixed Amount Off (e.g., $10)</option>
                  <option value="bogo">Buy One Get One</option>
                  <option value="free">Free Item</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em] block mb-2">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={formData.discount_type === 'percentage' ? '20' : '10.00'}
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  className={GLASS_INPUT}
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  {formData.discount_type === 'percentage'
                    ? 'Enter as percentage (20 = 20%)'
                    : 'Enter dollar amount'}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em] block mb-2">
                  Promo Code
                </label>
                <input
                  type="text"
                  placeholder="e.g., SUMMER20"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className={GLASS_INPUT}
                />
              </div>

              <div>
                <label className="text-[11px] font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em] block mb-2">
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

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-2xl font-[var(--font-outfit)] font-semibold transition-all mt-6 ${UI_SETTINGS.primaryButton}`}
              >
                {editingDeal ? 'Update Deal' : 'Create Deal'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


// Deals listing with create, edit, toggle, and delete actions
function DealsSection({ business }) {
  const supabase = createClient()

  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (business?.id) {
      fetchDeals()
    }
  }, [business?.id])


  // Load deals from Supabase for the current business
  const fetchDeals = async () => {
    if (!business?.id) return

    try {
      setLoading(true)

      const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })

      setDeals(data || [])
    } catch (err) {
      console.error('Error fetching deals:', err)
      setError('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }


  // Validate and submit the deal form
  const handleSubmit = async (formData) => {
    try {
      if (editingDeal) {
        const { error: updateError } = await supabase
          .from('deals')
          .update({
            title: formData.title.trim(),
            description: formData.description.trim(),
            discount_type: formData.discount_type,
            discount_value: parseFloat(formData.discount_value),
            code: formData.code.trim() || null,
            expiry_date: formData.expiry_date,
            is_active: formData.is_active,
          })
          .eq('id', editingDeal.id)

        if (updateError) throw updateError
        setSuccess('Deal updated')
      } else {
        const { error: insertError } = await supabase.from('deals').insert([
          {
            business_id: business.id,
            title: formData.title.trim(),
            description: formData.description.trim(),
            discount_type: formData.discount_type,
            discount_value: parseFloat(formData.discount_value),
            code: formData.code.trim() || null,
            expiry_date: formData.expiry_date,
            is_active: true,
          },
        ])

        if (insertError) throw insertError
        setSuccess('Deal created')
      }

      setEditingDeal(null)
      await fetchDeals()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error saving deal:', err)
      setError(err.message || 'Error saving deal')
      setTimeout(() => setError(null), 3000)
    }
  }


  // Toggle a deal between active and hidden states
  const toggleDealActive = async (deal) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ is_active: !deal.is_active })
        .eq('id', deal.id)

      if (error) throw error

      setDeals(deals.map((d) => (d.id === deal.id ? { ...d, is_active: !d.is_active } : d)))
      setSuccess(deal.is_active ? 'Deal hidden' : 'Deal pushed')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error toggling deal:', err)
      setError('Error updating deal')
      setTimeout(() => setError(null), 3000)
    }
  }


  // Delete a deal after user confirmation
  const handleDelete = async (dealId) => {
    if (!confirm('Delete this deal?')) return

    try {
      const { error } = await supabase.from('deals').delete().eq('id', dealId)

      if (error) throw error

      setSuccess('Deal deleted')
      setDeals(deals.filter((d) => d.id !== dealId))
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error deleting deal:', err)
      setError('Error deleting deal')
      setTimeout(() => setError(null), 3000)
    }
  }


  // Return a formatted label for the deal discount badge
  const getDealBadgeLabel = (type, value) => {
    const badges = {
      percentage: `${value}% OFF`,
      fixed: `$${value} OFF`,
      bogo: 'BUY ONE GET ONE',
      free: 'FREE ITEM',
    }

    return badges[type] || 'SPECIAL DEAL'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]">
            <FaTag size={18} />
          </div>

          <div>
            <h2 className="text-2xl font-[var(--font-outfit)] font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
              Deals & Offers
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {deals.length} active offer{deals.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => {
            setEditingDeal(null)
            setIsModalOpen(true)
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-2xl font-[var(--font-outfit)] font-semibold flex items-center gap-2 ${UI_SETTINGS.primaryButton}`}
        >
          <FaPlus />
          New Deal
        </motion.button>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center gap-3"
          >
            <FaCheck /> {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 flex items-center gap-3"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className={`${UI_SETTINGS.glassCard} p-10 text-center`}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4 w-10 h-10 rounded-full border-[3px] border-blue-500/25 border-t-blue-600 dark:border-blue-400/20 dark:border-t-blue-300"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading deals...</p>
        </div>
      ) : deals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${UI_SETTINGS.glassCard} text-center py-16 px-6`}
        >
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
            <FaTag size={24} />
          </div>

          <p className="text-slate-500 dark:text-slate-400 mb-4">No deals yet</p>

          <motion.button
            onClick={() => {
              setEditingDeal(null)
              setIsModalOpen(true)
            }}
            whileHover={{ scale: 1.05 }}
            className={`px-6 py-2.5 rounded-2xl inline-flex items-center gap-2 font-[var(--font-outfit)] font-semibold ${UI_SETTINGS.softButton}`}
          >
            <FaPlus />
            Create First Deal
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deals.map((deal, idx) => {
            const isExpired = new Date(deal.expiry_date) < new Date()
            const daysLeft = Math.ceil(
              (new Date(deal.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`${UI_SETTINGS.glassCard} relative p-5 transition-all ${
                  deal.is_active
                    ? 'hover:border-blue-500/28'
                    : 'opacity-70 border-slate-200/70 dark:border-white/8'
                }`}
              >
                <div className="absolute top-4 right-4">
                  {deal.is_active ? (
                    <motion.div
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-[var(--font-outfit)] font-semibold"
                    >
                      Active
                    </motion.div>
                  ) : (
                    <div className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#162033] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 text-[11px] font-[var(--font-outfit)] font-semibold">
                      Hidden
                    </div>
                  )}
                </div>

                <div className="inline-block mb-3">
                  <div
                    className={`px-3 py-1 rounded-full text-white text-xs font-[var(--font-outfit)] font-semibold shadow-md ${
                      deal.is_active ? 'bg-blue-600' : 'bg-slate-500 dark:bg-slate-600'
                    }`}
                  >
                    {getDealBadgeLabel(deal.discount_type, deal.discount_value)}
                  </div>
                </div>

                <h3 className="text-base font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white mb-1 pr-20">
                  {deal.title}
                </h3>

                {deal.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                    {deal.description}
                  </p>
                )}

                {deal.code && (
                  <div className="mb-3 p-3 rounded-2xl bg-white dark:bg-[#111827] border border-blue-500/12 dark:border-white/10">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-[0.14em] font-[var(--font-outfit)] font-semibold">
                      Code
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <code className="text-slate-900 dark:text-white font-mono text-xs font-bold">
                        {deal.code}
                      </code>

                      <motion.button
                        onClick={() => navigator.clipboard.writeText(deal.code)}
                        whileHover={{ scale: 1.1 }}
                        className="p-1 rounded-md text-blue-600 dark:text-blue-300"
                      >
                        <FaCopy size={10} />
                      </motion.button>
                    </div>
                  </div>
                )}

                <div className="text-xs font-[var(--font-outfit)] font-semibold mb-3">
                  {isExpired ? (
                    <span className="text-red-500 dark:text-red-300">Expired</span>
                  ) : (
                    <span
                      className={
                        daysLeft <= 3
                          ? 'text-amber-600 dark:text-amber-300'
                          : 'text-emerald-600 dark:text-emerald-300'
                      }
                    >
                      {daysLeft} days left
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-blue-500/10 dark:border-white/10">
                  <motion.button
                    onClick={() => toggleDealActive(deal)}
                    whileHover={{ scale: 1.02 }}
                    className={`flex-1 py-2 rounded-xl text-xs font-[var(--font-outfit)] font-semibold transition-all ${
                      deal.is_active
                        ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20'
                        : 'bg-slate-100 dark:bg-[#162033] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1c2940]'
                    }`}
                  >
                    {deal.is_active ? 'Hide' : 'Push'}
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setEditingDeal(deal)
                      setIsModalOpen(true)
                    }}
                    whileHover={{ scale: 1.05 }}
                    className="p-2 rounded-xl text-blue-600 dark:text-blue-300 border border-blue-200/70 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-[#162033] transition-all"
                  >
                    <FaEdit size={12} />
                  </motion.button>

                  <motion.button
                    onClick={() => handleDelete(deal.id)}
                    whileHover={{ scale: 1.05 }}
                    className="p-2 rounded-xl text-red-500 dark:text-red-300 border border-red-200/70 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  >
                    <FaTrash size={12} />
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <DealsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingDeal(null)
        }}
        onSubmit={handleSubmit}
        editingDeal={editingDeal}
      />
    </div>
  )
}


// Main dashboard layout with sidebar, background, and content area
export default function BusinessLayout({
  children,
  showDealsSection = false,
  business = null,
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)


  useEffect(() => {
    if (!authLoading && user === null) {
      router.push('/login')
    }
  }, [authLoading, user, router])


  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }


  if (authLoading) {
    return (
      <div className={`${UI_SETTINGS.pageWrap} items-center justify-center`}>
        <Background />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          className="relative z-10 w-12 h-12 rounded-full border-[3px] border-blue-500/30 border-t-blue-600 dark:border-blue-400/20 dark:border-t-blue-300"
        />
      </div>
    )
  }

  return (
    <div className={UI_SETTINGS.pageWrap} style={{ fontFamily: 'var(--font-inter)' }}>
      <Background />

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-[#0b1322] border-b border-blue-500/10 dark:border-white/10 flex items-center justify-between px-4 transition-colors duration-300">
        <VicinityLogo />

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl text-slate-900 dark:text-white hover:bg-blue-50 dark:hover:bg-[#162033] transition-colors"
          aria-label="Open sidebar"
        >
          <FaBars size={20} />
        </button>
      </div>

      <SidebarNav
        pathname={pathname}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full pt-16 lg:pt-0 overflow-hidden relative z-10">
        {showDealsSection && business && (
          <div className="border-b border-blue-500/10 dark:border-white/10 bg-white/55 dark:bg-[#0b1220] backdrop-blur-xl p-6 transition-colors duration-300">
            <DealsSection business={business} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}


export { NAV_ITEMS, DealsSection }
