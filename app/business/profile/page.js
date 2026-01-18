// Business profile management with sections for branding, details, gallery, and hours
// COMPONENTS:
// FORM INPUT - Reusable input field with label styling
// TIP CARD - Informational tip with icon and description
// BRANDING TIPS - Tips for brand identity section
// DETAILS TIPS - Tips for contact and address section
// GALLERY TIPS - Tips for photo gallery section
// HOURS TIPS - Tips for operating hours section
// HELPER FUNCTIONS:
// GENERATE AI - Creates business description using AI based on business info
// UPLOAD IMAGE - Handles image uploads to Supabase storage (cover or gallery)
// HANDLE SAVE - Saves/updates business profile to database

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaSave, FaCamera, FaCloudUploadAlt, FaCheck, FaExclamationTriangle,
  FaMapMarkerAlt, FaPhone, FaGlobe, FaClock, FaMagic,
  FaImage, FaTrash, FaChevronDown, FaEye, FaInfo, FaLightbulb, FaChartLine
} from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout'
import Aurora from '../../../components/Aurora'

// Constants
const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: FaEye, color: 'purple' },
  { id: 'branding', label: 'Branding', icon: FaEye, color: 'orange' },
  { id: 'details', label: 'Details', icon: FaInfo, color: 'blue' },
  { id: 'gallery', label: 'Gallery', icon: FaImage, color: 'green' },
  { id: 'hours', label: 'Hours', icon: FaClock, color: 'yellow' },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const min = (i % 2) * 30
  const h = hour.toString().padStart(2, '0')
  const m = min.toString().padStart(2, '0')
  const period = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return { value: `${h}:${m}`, label: `${h12}:${m} ${period}` }
})

const DEFAULT_HOURS = Object.fromEntries(
  DAYS.map(d => [d, { open: '09:00', close: '17:00', closed: d === 'Sunday' }])
)

// --- THEMED CONSTANTS ---
const GLASS_BG = "bg-white/80 dark:bg-black/40 backdrop-blur-md border-b border-gray-200 dark:border-white/5"
const GLASS_HOVER = "hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/10"
const GLASS_INPUT = "w-full bg-gray-50 dark:bg-black/40 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-black/60 transition-all"
const GLASS_CARD = "bg-white dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/40 transition-all"

// Form Input Component
const FormInput = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-2 ml-1">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      className={GLASS_INPUT}
    />
  </div>
)

// Tip Card Component
const TipCard = ({ icon: Icon, title, desc }) => (
  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 ${GLASS_HOVER} px-4 py-3 rounded-lg transition-all group shadow-sm`}>
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-orange-500 dark:text-orange-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
      <div>
        <p className="text-xs font-bold text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
    </div>
  </motion.div>
)

// Tips Sections
const BrandingTips = () => (
  <div className="space-y-3">
    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-4">Tips</h4>
    <TipCard icon={FaEye} title="Strong Name" desc="Make it memorable" />
    <TipCard icon={FaMagic} title="AI Description" desc="Generate with one click" />
    <TipCard icon={FaCheck} title="Be Authentic" desc="Show your brand personality" />
  </div>
)

const DetailsTips = () => (
  <div className="space-y-3">
    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-4">Tips</h4>
    <TipCard icon={FaPhone} title="Complete Info" desc="All fields help customers" />
    <TipCard icon={FaMapMarkerAlt} title="Accurate Address" desc="Enables map integration" />
    <TipCard icon={FaGlobe} title="Website Link" desc="Drive traffic to your site" />
  </div>
)

const GalleryTips = () => (
  <div className="space-y-3">
    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-4">Tips</h4>
    <TipCard icon={FaImage} title="6+ Photos" desc="Higher engagement rate" />
    <TipCard icon={FaCheck} title="Show Quality" desc="Best products & spaces" />
    <TipCard icon={FaChartLine} title="Higher Ranking" desc="More images = more views" />
  </div>
)

const HoursTips = () => (
  <div className="space-y-3">
    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-4">Tips</h4>
    <TipCard icon={FaClock} title="Consistent Hours" desc="Builds customer trust" />
    <TipCard icon={FaCheck} title="Accurate Times" desc="Avoid confusion" />
    <TipCard icon={FaLightbulb} title="Special Hours?" desc="Update for holidays" />
  </div>
)

// Main Component
export default function BusinessProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [activeSection, setActiveSection] = useState('overview')

  const [data, setData] = useState({
    name: '', type: '', description: '', address: '', city: '', state: '', zip: '',
    phone: '', email: '', website: '', image_url: '', gallery: [], tags: [],
    hours: DEFAULT_HOURS,
    rating: 0, review_count: 0
  })

  const [state, setState] = useState({ 
    loading: true, saving: false, uploading: false, generatingAI: false, error: null, success: null 
  })
  const [completion, setCompletion] = useState(0)

  // Load data
  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      try {
        setState(s => ({ ...s, loading: true }))
        const { data: d } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single()
        if (d) {
          const loadedHours = d.hours && typeof d.hours === 'object' ? d.hours : DEFAULT_HOURS
          const safeData = {
            ...d,
            gallery: Array.isArray(d.gallery) ? d.gallery : [],
            description: d.description || '',
            hours: loadedHours
          }
          setData(prev => ({ ...prev, ...safeData }))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setState(s => ({ ...s, loading: false }))
      }
    })()
  }, [user?.id, supabase])

  // Calculate completion
  useEffect(() => {
    const fields = [data.name, data.type, data.description, data.phone, data.email, data.image_url, data.address, data.city, data.state, data.tags.length > 0, (data.gallery || []).length > 0]
    const score = Math.round((fields.filter(f => f).length / fields.length) * 100)
    setCompletion(score)
  }, [data])

  const generateAI = async () => {
    if (!data.name || !data.type) {
      setState(s => ({ ...s, error: 'Fill Business Name & Category first' }))
      setTimeout(() => setState(s => ({ ...s, error: null })), 3000)
      return
    }
    try {
      setState(s => ({ ...s, generatingAI: true }))
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessContext: { name: data.name, type: data.type, city: data.city, state: data.state, tags: data.tags } })
      })
      const { description } = await res.json()
      setData(d => ({ ...d, description }))
      setState(s => ({ ...s, success: '✨ AI description generated!' }))
      setTimeout(() => setState(s => ({ ...s, success: null })), 3000)
    } catch (e) {
      setState(s => ({ ...s, error: 'Failed to generate' }))
      setTimeout(() => setState(s => ({ ...s, error: null })), 3000)
    } finally {
      setState(s => ({ ...s, generatingAI: false }))
    }
  }

  const uploadImage = async (file, isGallery = false) => {
    if (!file) return
    try {
      setState(s => ({ ...s, uploading: true }))
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${isGallery ? 'gallery/' : ''}${Date.now()}.${ext}`
      await supabase.storage.from('business-images').upload(path, file)
      const { data: { publicUrl } } = supabase.storage.from('business-images').getPublicUrl(path)
      
      if (isGallery) {
        setData(d => ({ ...d, gallery: [...(d.gallery || []), publicUrl] }))
      } else {
        setData(d => ({ ...d, image_url: publicUrl }))
      }
      setState(s => ({ ...s, success: isGallery ? '✅ Image added!' : '✅ Cover updated!' }))
      setTimeout(() => setState(s => ({ ...s, success: null })), 2000)
    } catch (e) {
      setState(s => ({ ...s, error: 'Upload failed' }))
      setTimeout(() => setState(s => ({ ...s, error: null })), 3000)
    } finally {
      setState(s => ({ ...s, uploading: false }))
    }
  }

  const handleSave = async () => {
    if (!data.name.trim()) {
      setState(s => ({ ...s, error: 'Business Name required' }))
      return
    }
    try {
      setState(s => ({ ...s, saving: true }))
      const payload = { 
        ...data, 
        gallery: data.gallery || [],
        description: data.description || '',
        owner_id: user.id, 
        updated_at: new Date().toISOString() 
      }
      const { error: e } = await supabase.from('businesses').update(payload).eq('owner_id', user.id)
      if (e?.code === 'PGRST116') {
        await supabase.from('businesses').insert([payload])
      }
      setState(s => ({ ...s, success: '✅ Profile saved!' }))
      setTimeout(() => setState(s => ({ ...s, success: null })), 3000)
    } catch (e) {
      setState(s => ({ ...s, error: e.message || 'Save failed' }))
      setTimeout(() => setState(s => ({ ...s, error: null })), 3000)
    } finally {
      setState(s => ({ ...s, saving: false }))
    }
  }

  if (state.loading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center transition-colors duration-300">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <BusinessLayout>
      
            {/* BACKGROUND - UPDATED: Removed gray cast */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-white dark:bg-[#080808] transition-colors duration-300">
        {/* Adjusted mix-blend-multiply and removed extra opacity layer to keep it clean */}
        <div className="absolute inset-0 transition-opacity duration-300 mix-blend-multiply dark:mix-blend-normal" style={{ clipPath: 'polygon(256px 0, 100% 0, 100% 100%, 256px 100%)' }}>
          <Aurora 
            color1="#ff6f00"
            color2="#ffa500"
            color3="#ff6f00"
            amplitude={1}
            blend={0.5}
            speed={.3}
          />
        </div>
      </div>


      {/* PAGE HEADER */}
      <div className={`h-20 ${GLASS_BG} flex items-center px-8 relative z-10 transition-colors duration-300`}>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Profile</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage your business profile</p>
        </div>
      </div>

      {/* SECTION TABS + ACTION BAR */}
      <div className={`${GLASS_BG} px-8 relative z-10 transition-colors duration-300`}>
        <div className="flex items-center justify-between gap-8 min-h-16">
          {/* Tabs on the left */}
          <div className="flex gap-1 overflow-x-auto flex-1 no-scrollbar">
            {SECTIONS.map(section => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-3 font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 border-b-2 relative ${
                    isActive
                      ? 'border-b-orange-500 text-orange-600 dark:text-white'
                      : 'border-b-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={13} className={isActive ? 'text-orange-500' : ''} />
                  {section.label}
                </motion.button>
              )
            })}
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <motion.div className={`text-xs px-3 py-1.5 rounded-full bg-white dark:bg-black/40 border flex items-center gap-2 transition-all ${
              completion === 100 
                ? 'border-green-500/50 shadow-green-500/20 text-green-600 dark:text-green-300' 
                : 'border-orange-500/50 text-gray-600 dark:text-gray-300'
            }`}>
              <motion.div className="w-1.5 h-1.5 rounded-full bg-orange-500" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              {completion}%
            </motion.div>
            
            <motion.button 
              onClick={handleSave} 
              disabled={state.saving} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg text-white font-bold text-xs disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all backdrop-blur-md"
            >
              {state.saving ? <motion.div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaSave size={12} />}
              <span className="hidden sm:inline">{state.saving ? 'Saving...' : 'Save'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ALERTS */}
      {state.error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`px-8 py-3 bg-red-100 dark:bg-black/70 border-b border-red-500/50 text-red-700 dark:text-red-300 text-sm flex items-center gap-3 relative z-10`}>
          <FaExclamationTriangle /> {state.error}
        </motion.div>
      )}

      {state.success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`px-8 py-3 bg-green-100 dark:bg-black/70 border-b border-green-500/50 text-green-700 dark:text-green-300 text-sm flex items-center gap-3 relative z-10`}>
          <FaCheck /> {state.success}
        </motion.div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto p-8 pb-20">
          <AnimatePresence mode="wait">
            {/* OVERVIEW SECTION */}
            {activeSection === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Cover Preview */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`relative group rounded-2xl overflow-hidden ${GLASS_CARD} aspect-[3/1] !p-0 border-0`}>
                      <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">Business Card</div>
                      {data.image_url ? (
                        <>
                          <img src={data.image_url} className="w-full h-full object-cover" alt="Business Card Cover" />
                          <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3">
                            <label className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-lg cursor-pointer flex items-center gap-2 transition-all backdrop-blur-md border border-white/20">
                              <FaCamera /> Change
                              <input type="file" hidden accept="image/*" onChange={e => uploadImage(e.target.files?.[0])} disabled={state.uploading} />
                            </label>
                            <motion.button onClick={() => { setData({...data, image_url: ''}); setState(s => ({ ...s, success: '✅ Cover removed!' })); setTimeout(() => setState(s => ({ ...s, success: null })), 2000) }} whileHover={{ scale: 1.05 }} className="px-6 py-3 bg-red-500/30 hover:bg-red-500/50 text-white font-bold text-sm rounded-lg flex items-center gap-2 transition-all backdrop-blur-md border border-red-500/30">
                              <FaTrash /> Remove
                            </motion.button>
                          </motion.div>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <FaCamera size={48} className="mb-3 opacity-40" />
                          <span className="font-bold text-gray-600 dark:text-gray-300">Add Cover Image</span>
                          <span className="text-xs mt-1 text-gray-400">This will be your business card cover</span>
                          <input type="file" hidden accept="image/*" onChange={e => uploadImage(e.target.files?.[0])} disabled={state.uploading} />
                        </label>
                      )}
                    </motion.div>

                    {/* Basic Info */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={GLASS_CARD}>
                      <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Quick Overview</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormInput label="Business Name" value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="Your business name" />
                        <FormInput label="Category" value={data.type} onChange={e => setData({...data, type: e.target.value})} placeholder="Restaurant, Salon, etc." />
                      </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={GLASS_CARD}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Description</h3>
                        <motion.button onClick={generateAI} disabled={state.generatingAI || !data.name || !data.type} whileHover={{ scale: 1.05 }} className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20">
                          <FaMagic size={11} className={state.generatingAI ? 'animate-spin' : ''} />
                          {state.generatingAI ? 'Generating...' : 'AI Write'}
                        </motion.button>
                      </div>
                      <textarea value={data.description} onChange={e => setData({...data, description: e.target.value})} className={`w-full ${GLASS_INPUT} h-28 resize-none`} placeholder="Describe your business..." />
                      <p className="text-xs text-gray-400 mt-2">{data.description.length}/500</p>
                    </motion.div>
                  </div>

                  {/* Right Side - Stats */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
                    <div className={GLASS_CARD}>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-4">Profile Progress</h4>
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" className="stroke-gray-200 dark:stroke-white/10" strokeWidth="3" />
                          <motion.circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad)" strokeWidth="3" strokeDasharray={`${completion * 2.83} 283`} strokeLinecap="round" />
                          <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: '#ff6f00' }} />
                              <stop offset="100%" style={{ stopColor: '#ffa500' }} />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-transparent bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text">{completion}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Almost there!</p>
                    </div>

                    {(data.rating > 0 || data.review_count > 0) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={GLASS_CARD}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-3">Rating</p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-3xl font-black text-orange-500 dark:text-orange-400">{data.rating.toFixed(1)}</span>
                          <FaEye className="text-orange-500 dark:text-orange-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{data.review_count} reviews</p>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* BRANDING SECTION */}
            {activeSection === 'branding' && (
              <motion.div key="branding" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={GLASS_CARD}>
                      <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Brand Identity</h3>
                      <FormInput label="Business Name" value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="Your business name" />
                      <FormInput label="Category/Type" value={data.type} onChange={e => setData({...data, type: e.target.value})} placeholder="Restaurant, Salon, etc." />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={GLASS_CARD}>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Brand Description</h3>
                        <motion.button onClick={generateAI} disabled={state.generatingAI || !data.name} whileHover={{ scale: 1.05 }} className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20">
                          <FaMagic size={11} className={state.generatingAI ? 'animate-spin' : ''} />
                          AI Write
                        </motion.button>
                      </div>
                      <textarea value={data.description} onChange={e => setData({...data, description: e.target.value})} className={`w-full ${GLASS_INPUT} h-40 resize-none`} placeholder="Write a compelling description..." />
                      <p className="text-xs text-gray-400 mt-2">{data.description.length}/500 characters</p>
                    </motion.div>
                  </div>
                  <BrandingTips />
                </div>
              </motion.div>
            )}

            {/* DETAILS SECTION */}
            {activeSection === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={GLASS_CARD}>
                      <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Contact Information</h3>
                      <div className="space-y-4">
                        <FormInput label="Phone" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} placeholder="(555) 000-0000" />
                        <FormInput label="Email" value={data.email} onChange={e => setData({...data, email: e.target.value})} placeholder="hello@business.com" />
                        <FormInput label="Website" value={data.website} onChange={e => setData({...data, website: e.target.value})} placeholder="https://example.com" />
                      </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={GLASS_CARD}>
                      <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Address</h3>
                      <div className="space-y-4">
                        <FormInput label="Street Address" value={data.address} onChange={e => setData({...data, address: e.target.value})} placeholder="123 Main St" />
                        <div className="grid grid-cols-3 gap-4">
                          <FormInput label="City" value={data.city} onChange={e => setData({...data, city: e.target.value})} placeholder="City" />
                          <FormInput label="State" value={data.state} onChange={e => setData({...data, state: e.target.value})} placeholder="State" />
                          <FormInput label="ZIP" value={data.zip} onChange={e => setData({...data, zip: e.target.value})} placeholder="ZIP" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  <DetailsTips />
                </div>
              </motion.div>
            )}

            {/* GALLERY SECTION */}
            {activeSection === 'gallery' && (
              <motion.div key="gallery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={GLASS_CARD}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Photo Gallery</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Showcase your business with photos</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${(data.gallery && data.gallery.length >= 6) ? 'bg-green-100 text-green-700 dark:bg-green-500/30 dark:text-green-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/30 dark:text-orange-300'}`}>
                          {data.gallery ? data.gallery.length : 0}/12
                        </span>
                      </div>
                      <label className="block border-2 border-dashed border-gray-300 dark:border-white/30 rounded-2xl p-12 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all mb-8">
                        <div className="flex flex-col items-center gap-2">
                          <FaCloudUploadAlt size={40} className="text-gray-400 dark:text-gray-500" />
                          <span className="font-bold text-gray-700 dark:text-white">{state.uploading ? 'Uploading...' : 'Drop images here'}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 10MB</span>
                        </div>
                        <input type="file" multiple hidden accept="image/*" onChange={e => {
                          Array.from(e.target.files || []).forEach(f => uploadImage(f, true))
                        }} disabled={state.uploading} />
                      </label>
                      {data.gallery && data.gallery.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {data.gallery.map((img, i) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05 }} className={`relative group rounded-xl overflow-hidden aspect-square border border-gray-200 dark:border-white/10 shadow-sm`}>
                              <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                              <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                <motion.button 
                                  onClick={() => {
                                    const newGallery = (data.gallery || []).filter((_, x) => x !== i)
                                    setData({...data, gallery: newGallery})
                                    setState(s => ({ ...s, success: '✅ Image removed!' }))
                                    setTimeout(() => setState(s => ({ ...s, success: null })), 2000)
                                  }} 
                                  whileHover={{ scale: 1.2 }} 
                                  className="p-3 bg-red-500/40 hover:bg-red-500/60 backdrop-blur-md rounded-full transition-all border border-red-500/30 text-white"
                                >
                                  <FaTrash size={14} />
                                </motion.button>
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                          <FaImage size={40} className="mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No photos yet</p>
                        </div>
                      )}
                    </motion.div>
                  </div>
                  <GalleryTips />
                </div>
              </motion.div>
            )}

            {/* HOURS SECTION */}
            {activeSection === 'hours' && (
              <motion.div key="hours" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={GLASS_CARD}>
                      <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Operating Hours</h3>
                      <div className="space-y-3">
                        {DAYS.map((day, idx) => {
                          const dayHours = data.hours[day] || { open: '09:00', close: '17:00', closed: false }
                          return (
                            <motion.div key={day} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                              <span className="w-24 text-sm font-bold text-gray-600 dark:text-gray-300">{day}</span>
                              <motion.button 
                                onClick={() => setData(d => ({
                                  ...d, 
                                  hours: {
                                    ...d.hours, 
                                    [day]: {...dayHours, closed: !dayHours.closed}
                                  }
                                }))} 
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                  dayHours.closed 
                                    ? 'bg-red-100 text-red-600 dark:bg-red-500/30 dark:text-red-300 border border-red-500/50' 
                                    : 'bg-green-100 text-green-600 dark:bg-green-500/30 dark:text-green-300 border border-green-500/50'
                                }`}
                              >
                                {dayHours.closed ? 'Closed' : 'Open'}
                              </motion.button>
                              {!dayHours.closed && (
                                <div className="flex items-center gap-2 ml-auto">
                                  <div className="relative">
                                    <select 
                                      value={dayHours.open} 
                                      onChange={e => setData(d => ({
                                        ...d, 
                                        hours: {
                                          ...d.hours, 
                                          [day]: {...dayHours, open: e.target.value}
                                        }
                                      }))} 
                                      className={GLASS_INPUT}
                                    >
                                      {TIME_SLOTS.map(t => <option key={`${day}-open-${t.value}`} value={t.value}>{t.label}</option>)}
                                    </select>
                                    <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={10} />
                                  </div>
                                  <span className="text-xs text-gray-400">→</span>
                                  <div className="relative">
                                    <select 
                                      value={dayHours.close} 
                                      onChange={e => setData(d => ({
                                        ...d, 
                                        hours: {
                                          ...d.hours, 
                                          [day]: {...dayHours, close: e.target.value}
                                        }
                                      }))} 
                                      className={GLASS_INPUT}
                                    >
                                      {TIME_SLOTS.map(t => <option key={`${day}-close-${t.value}`} value={t.value}>{t.label}</option>)}
                                    </select>
                                    <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={10} />
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  </div>
                  <HoursTips />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </BusinessLayout>
  )
}
