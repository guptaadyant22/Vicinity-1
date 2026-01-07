'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaHome, FaStore, FaStar, FaCog, FaBars, FaPowerOff, FaTag, FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaCopy, FaRocket
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { createClient } from '../lib/supabase'

// --- VICINITY LOGO COMPONENT ---
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

// --- ANIMATED BACKGROUND - FIXED POSITIONING ---
const Background = () => (
  <div className="fixed inset-0 -z-50 bg-white dark:bg-[#080808] overflow-hidden pointer-events-none transition-colors duration-300">
    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float mix-blend-multiply dark:mix-blend-normal" />
    <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl animate-float mix-blend-multiply dark:mix-blend-normal" style={{ animationDelay: '2s' }} />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
  </div>
)

const NAV_ITEMS = [
  { label: 'Dashboard', icon: FaHome, href: '/business/dashboard' },
  { label: 'Profile', icon: FaStore, href: '/business/profile' },
  { label: 'Deals', icon: FaTag, href: '/business/deals' },
  { label: 'Reviews', icon: FaStar, href: '/business/reviews' },
  { label: 'Settings', icon: FaCog, href: '/business/settings' },
]

// --- SIDEBAR NAVIGATION COMPONENT - WITH GLASSMORPHISM ---
function SidebarNav({ pathname, onLogout, isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:relative top-0 left-0 h-full w-64 bg-white/90 dark:bg-black/50 backdrop-blur-md border-r border-gray-200 dark:border-white/10 z-50 transform transition-all duration-300 lg:translate-x-0 flex flex-col shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 border-b border-gray-200 dark:border-white/10 flex items-center px-6">
          <Link href="/business/dashboard" className="font-black text-lg flex items-center gap-2 w-full">
            <VicinityLogo className="w-full" />
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.label} 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-white border border-orange-200 dark:border-orange-500/30' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-orange-500 dark:text-white' : 'text-gray-400 dark:text-gray-400'} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-white/10">
          <motion.button 
            onClick={onLogout} 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all text-sm font-bold cursor-pointer"
          >
            <FaPowerOff size={16} /> Logout
          </motion.button>
        </div>
      </aside>
    </>
  )
}

// --- DEALS MANAGEMENT MODAL COMPONENT ---
function DealsModal({ isOpen, onClose, onSubmit, editingDeal, business }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    code: '',
    expiry_date: '',
    is_active: true
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
        is_active: editingDeal.is_active
      })
    } else {
      setFormData({
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        code: '',
        expiry_date: '',
        is_active: true
      })
    }
    setError(null)
  }, [editingDeal, isOpen])

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

  const GLASS_INPUT = "w-full px-4 py-2.5 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all"

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/95 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-[#1a1a1a] border dark:border-orange-500/30 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-orange-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaTag className="text-orange-500" />
                {editingDeal ? 'Edit Deal' : 'Create New Deal'}
              </h2>
              <motion.button
                onClick={onClose}
                whileHover={{ rotate: 90 }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all"
              >
                <FaTimes className="text-gray-500 dark:text-gray-400" size={20} />
              </motion.button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-300 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">
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
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Details about your offer..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${GLASS_INPUT} resize-none h-20`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">
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
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">
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
                <p className="text-xs text-gray-500 mt-1.5">
                  {formData.discount_type === 'percentage' ? 'Enter as percentage (20 = 20%)' : 'Enter dollar amount'}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">
                  Promo Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., SUMMER20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={GLASS_INPUT}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">
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
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30 mt-6"
              >
                {editingDeal ? '💾 Update Deal' : '🚀 Create & Push Deal'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// --- DEALS SECTION COMPONENT ---
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
            is_active: formData.is_active
          })
          .eq('id', editingDeal.id)

        if (updateError) throw updateError
        setSuccess('✨ Deal updated!')
      } else {
        const { error: insertError } = await supabase
          .from('deals')
          .insert([{
            business_id: business.id,
            title: formData.title.trim(),
            description: formData.description.trim(),
            discount_type: formData.discount_type,
            discount_value: parseFloat(formData.discount_value),
            code: formData.code.trim() || null,
            expiry_date: formData.expiry_date,
            is_active: true
          }])

        if (insertError) throw insertError
        setSuccess('🎉 Deal created and pushed!')
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

  const toggleDealActive = async (deal) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ is_active: !deal.is_active })
        .eq('id', deal.id)

      if (error) throw error
      
      setDeals(deals.map(d => 
        d.id === deal.id ? { ...d, is_active: !d.is_active } : d
      ))
      setSuccess(deal.is_active ? '👁️ Deal hidden' : '🚀 Deal pushed')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error toggling deal:', err)
      setError('Error updating deal')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDelete = async (dealId) => {
    if (!confirm('Delete this deal?')) return

    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId)

      if (error) throw error
      setSuccess('✨ Deal deleted!')
      setDeals(deals.filter(d => d.id !== dealId))
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error deleting deal:', err)
      setError('Error deleting deal')
      setTimeout(() => setError(null), 3000)
    }
  }

  const getDealBadgeLabel = (type, value) => {
    const badges = {
      percentage: `${value}% OFF`,
      fixed: `$${value} OFF`,
      bogo: 'BUY ONE GET ONE',
      free: 'FREE ITEM'
    }
    return badges[type] || 'SPECIAL DEAL'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg shadow-orange-500/20">
            <FaTag className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Deals & Offers</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{deals.length} active offer{deals.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <motion.button
          onClick={() => {
            setEditingDeal(null)
            setIsModalOpen(true)
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/30"
        >
          <FaPlus /> New Deal
        </motion.button>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/50 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-3"
          >
            <FaCheck /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3"
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deals Grid */}
      {deals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10"
        >
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">No deals yet</p>
          <motion.button
            onClick={() => {
              setEditingDeal(null)
              setIsModalOpen(true)
            }}
            whileHover={{ scale: 1.05 }}
            className="px-6 py-2 bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/50 text-orange-600 dark:text-orange-300 rounded-lg inline-flex items-center gap-2"
          >
            <FaPlus /> Create First Deal
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deals.map((deal, idx) => {
            const isExpired = new Date(deal.expiry_date) < new Date()
            const daysLeft = Math.ceil((new Date(deal.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
            
            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-5 rounded-xl backdrop-blur-md border transition-all shadow-sm ${
                  deal.is_active
                    ? 'bg-orange-50 dark:bg-gradient-to-br dark:from-orange-500/20 dark:to-red-500/10 border-orange-200 dark:border-orange-500/30 hover:border-orange-300 dark:hover:border-orange-500/60'
                    : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-60'
                }`}
              >
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  {deal.is_active ? (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/50 text-green-700 dark:text-green-300 text-xs font-bold"
                    >
                      🟢 ACTIVE
                    </motion.div>
                  ) : (
                    <div className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-500/20 border border-gray-300 dark:border-gray-500/50 text-gray-500 dark:text-gray-300 text-xs font-bold">
                      ⭕ HIDDEN
                    </div>
                  )}
                </div>

                {/* Discount badge */}
                <div className="inline-block mb-3">
                  <div className={`px-3 py-1 rounded-full text-white text-xs font-bold shadow-md ${
                    deal.is_active
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-gray-500 dark:bg-gray-600'
                  }`}>
                    {getDealBadgeLabel(deal.discount_type, deal.discount_value)}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 pr-20">{deal.title}</h3>

                {/* Description */}
                {deal.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-1">{deal.description}</p>
                )}

                {/* Code */}
                {deal.code && (
                  <div className="mb-3 p-2 rounded bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">CODE</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-gray-900 dark:text-white font-mono text-xs font-bold">{deal.code}</code>
                      <motion.button
                        onClick={() => navigator.clipboard.writeText(deal.code)}
                        whileHover={{ scale: 1.1 }}
                        className="p-1"
                      >
                        <FaCopy size={10} className="text-orange-500 dark:text-orange-400" />
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Expiry */}
                <div className="text-xs font-bold mb-3">
                  {isExpired ? (
                    <span className="text-red-500 dark:text-red-400">⏰ EXPIRED</span>
                  ) : (
                    <span className={daysLeft <= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}>
                      ✓ {daysLeft} days left
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-white/10">
                  <motion.button
                    onClick={() => toggleDealActive(deal)}
                    whileHover={{ scale: 1.02 }}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                      deal.is_active
                        ? 'bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/50 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-500/30'
                        : 'bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                    }`}
                  >
                    {deal.is_active ? '👁️ Hide' : '🚀 Push'}
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setEditingDeal(deal)
                      setIsModalOpen(true)
                    }}
                    whileHover={{ scale: 1.05 }}
                    className="p-1.5 hover:bg-blue-50 dark:hover:bg-white/10 rounded text-blue-500 dark:text-blue-400 transition-all border border-gray-200 dark:border-white/10 hover:border-blue-200"
                  >
                    <FaEdit size={12} />
                  </motion.button>

                  <motion.button
                    onClick={() => handleDelete(deal.id)}
                    whileHover={{ scale: 1.05 }}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-white/10 rounded text-red-500 dark:text-red-400 transition-all border border-gray-200 dark:border-white/10 hover:border-red-200"
                  >
                    <FaTrash size={12} />
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <DealsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingDeal(null)
        }}
        onSubmit={handleSubmit}
        editingDeal={editingDeal}
        business={business}
      />
    </div>
  )
}

// --- MAIN BUSINESS LAYOUT COMPONENT ---
export default function BusinessLayout({ 
  children,
  showDealsSection = false,
  business = null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Auth Check
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
      <div className="h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center transition-colors">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="h-screen w-full font-sans bg-gray-50 dark:bg-[#080808] flex overflow-hidden text-gray-900 dark:text-white transition-colors duration-300">
      <Background />

      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4">
        <h1 className="font-black text-lg text-gray-900 dark:text-white">Vicinity</h1>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-900 dark:text-white"><FaBars size={20} /></button>
      </div>

      {/* SIDEBAR */}
      <SidebarNav 
        pathname={pathname} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full pt-16 lg:pt-0 overflow-hidden relative z-10">
        {/* DEALS SECTION - SHOWN IN DASHBOARD */}
        {showDealsSection && business && (
          <div className="border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md p-6">
            <DealsSection business={business} />
          </div>
        )}

        {/* MAIN CHILDREN */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

// --- EXPORT ---
export { VicinityLogo, Background, NAV_ITEMS, DealsSection }
