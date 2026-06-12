'use client'


// Business profile editor for updating name, description, hours, photos, and contact info.
// Includes an AI description generator and handles image uploads to Supabase storage.

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaSave,
  FaCamera,
  FaCloudUploadAlt,
  FaCheck,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaPhone,
  FaGlobe,
  FaClock,
  FaMagic,
  FaImage,
  FaTrash,
  FaChevronDown,
  FaEye,
  FaInfo,
  FaLightbulb,
  FaChartLine,
} from 'react-icons/fa'
import { Inter, Outfit } from 'next/font/google'

import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout'

// Google Fonts setup for consistent typography across the profile editor, using Inter for body text and Outfit for headings and accents.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})
// Outfit is used for headings and important labels to give a modern, stylish look that complements the clean design of the profile editor.
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

// Section definitions for the profile editor, each with a unique ID, label, and icon. These sections will be used to organize the profile editing interface and allow users to easily navigate between different aspects of their business profile.
const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: FaEye },
  { id: 'branding', label: 'Branding', icon: FaEye },
  { id: 'details', label: 'Details', icon: FaInfo },
  { id: 'gallery', label: 'Gallery', icon: FaImage },
  { id: 'hours', label: 'Hours', icon: FaClock },
]
// Days of the week and time slots for business hours management, allowing users to set opening and closing times for each day, with an option to mark days as closed.
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
  DAYS.map((d) => [d, { open: '09:00', close: '17:00', closed: d === 'Sunday' }])
)

// Tailwind class combinations for consistent styling across the profile editor, including glassmorphism effects, hover states, and responsive design.
const PAGE_WRAP =
  `${inter.variable} ${outfit.variable} relative min-h-screen text-slate-900 transition-colors duration-300 dark:text-white`

const GLASS_BG =
  '  transition-colors duration-300'

const GLASS_CARD =
  ' rounded-[28px] p-8  transition-all duration-300'

const GLASS_HOVER =
  'hover:bg-blue-50/80 dark:hover:bg-[#162033] hover:border-blue-500/28 transition-colors duration-300'

const GLASS_INPUT =
  'w-full bg-white dark:bg-[#111827] backdrop-blur-sm border border-blue-500/15 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-blue-50/60 dark:focus:bg-[#162033] transition-all'


const FormInput = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-[var(--font-outfit)] font-semibold tracking-[0.16em] text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">
      {label}
    </label>

    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={GLASS_INPUT}
    />
  </div>
)

//card animation with icon, title, desc, and hover effect
const TipCard = ({ icon: Icon, title, desc }) => (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    className={` ${GLASS_HOVER} px-4 py-3 rounded-2xl transition-all group shadow-sm`}
  >
    <div className="flex items-start gap-3">
      <Icon
        size={14}
        className="text-blue-600 dark:text-blue-300 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform"
      />
      <div>
        <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  </motion.div>
)

//tips for each section with relevant icons and advice, using the TipCard component for consistency and style. These will be displayed in the sidebar when the corresponding section is active.
const BrandingTips = () => (
  <div className="space-y-3">
    <h4 className="text-xs font-[var(--font-outfit)] font-semibold tracking-[0.16em] text-slate-400 dark:text-slate-500 uppercase px-4">
      Tips
    </h4>
    <TipCard icon={FaEye} title="Strong Name" desc="Make it memorable" />
    <TipCard icon={FaMagic} title="AI Description" desc="Generate with one click" />
    <TipCard icon={FaCheck} title="Be Authentic" desc="Show your brand personality" />
  </div>
)

const DetailsTips = () => (
  <div className="space-y-3">
    <h4 className="text-xs font-[var(--font-outfit)] font-semibold tracking-[0.16em] text-slate-400 dark:text-slate-500 uppercase px-4">
      Tips
    </h4>
    <TipCard icon={FaPhone} title="Complete Info" desc="All fields help customers" />
    <TipCard icon={FaMapMarkerAlt} title="Accurate Address" desc="Enables map integration" />
    <TipCard icon={FaGlobe} title="Website Link" desc="Drive traffic to your site" />
  </div>
)

const GalleryTips = () => (
  <div className="space-y-3">
    <h4 className="text-xs font-[var(--font-outfit)] font-semibold tracking-[0.16em] text-slate-400 dark:text-slate-500 uppercase px-4">
      Tips
    </h4>
    <TipCard icon={FaImage} title="6+ Photos" desc="Higher engagement rate" />
    <TipCard icon={FaCheck} title="Show Quality" desc="Best products & spaces" />
    <TipCard icon={FaChartLine} title="Higher Ranking" desc="More images = more views" />
  </div>
)

const HoursTips = () => (
  <div className="space-y-3">
    <h4 className="text-xs font-[var(--font-outfit)] font-semibold tracking-[0.16em] text-slate-400 dark:text-slate-500 uppercase px-4">
      Tips
    </h4>
    <TipCard icon={FaClock} title="Consistent Hours" desc="Builds customer trust" />
    <TipCard icon={FaCheck} title="Accurate Times" desc="Avoid confusion" />
    <TipCard icon={FaLightbulb} title="Special Hours?" desc="Update for holidays" />
  </div>
)


export default function BusinessProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const [activeSection, setActiveSection] = useState('overview')

  const [data, setData] = useState({
    name: '',
    type: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    website: '',
    image_url: '',
    gallery: [],
    tags: [],
    hours: DEFAULT_HOURS,
    rating: 0,
    review_count: 0,
  })

  const [state, setState] = useState({
    loading: true,
    saving: false,
    uploading: false,
    generatingAI: false,
    error: null,
    success: null,
  })

  const [completion, setCompletion] = useState(0)


  useEffect(() => {
    if (!user?.id) return

    ;(async () => {
      try {
        setState((s) => ({ ...s, loading: true }))

        const { data: d } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .single()

        if (d) {
          const loadedHours = d.hours && typeof d.hours === 'object' ? d.hours : DEFAULT_HOURS

          const safeData = {
            ...d,
            gallery: Array.isArray(d.gallery) ? d.gallery : [],
            description: d.description || '',
            hours: loadedHours,
          }

          setData((prev) => ({ ...prev, ...safeData }))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setState((s) => ({ ...s, loading: false }))
      }
    })()
  }, [user?.id, supabase])


  useEffect(() => {
    const fields = [
      data.name,
      data.type,
      data.description,
      data.phone,
      data.email,
      data.image_url,
      data.address,
      data.city,
      data.state,
      data.tags.length > 0,
      (data.gallery || []).length > 0,
    ]

    const score = Math.round((fields.filter((f) => f).length / fields.length) * 100)
    setCompletion(score)
  }, [data])


  const generateAI = async () => {
    if (!data.name || !data.type) {
      setState((s) => ({ ...s, error: 'Fill Business Name & Category first' }))
      setTimeout(() => setState((s) => ({ ...s, error: null })), 3000)
      return
    }

    try {
      setState((s) => ({ ...s, generatingAI: true }))

      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessContext: {
            name: data.name,
            type: data.type,
            city: data.city,
            state: data.state,
            tags: data.tags,
          },
        }),
      })

      const { description } = await res.json()
      setData((d) => ({ ...d, description }))
      setState((s) => ({ ...s, success: '✨ AI description generated!' }))
      setTimeout(() => setState((s) => ({ ...s, success: null })), 3000)
    } catch (e) {
      setState((s) => ({ ...s, error: 'Failed to generate' }))
      setTimeout(() => setState((s) => ({ ...s, error: null })), 3000)
    } finally {
      setState((s) => ({ ...s, generatingAI: false }))
    }
  }


  const uploadImage = async (file, isGallery = false) => {
    if (!file) return

    try {
      setState((s) => ({ ...s, uploading: true }))

      const ext = file.name.split('.').pop()
      const path = `${user.id}/${isGallery ? 'gallery/' : ''}${Date.now()}.${ext}`

      await supabase.storage.from('business-images').upload(path, file)

      const {
        data: { publicUrl },
      } = supabase.storage.from('business-images').getPublicUrl(path)

      if (isGallery) {
        setData((d) => ({ ...d, gallery: [...(d.gallery || []), publicUrl] }))
      } else {
        setData((d) => ({ ...d, image_url: publicUrl }))
      }

      setState((s) => ({
        ...s,
        success: isGallery ? '✅ Image added!' : '✅ Cover updated!',
      }))
      setTimeout(() => setState((s) => ({ ...s, success: null })), 2000)
    } catch (e) {
      setState((s) => ({ ...s, error: 'Upload failed' }))
      setTimeout(() => setState((s) => ({ ...s, error: null })), 3000)
    } finally {
      setState((s) => ({ ...s, uploading: false }))
    }
  }


  const handleSave = async () => {
    if (!data.name.trim()) {
      setState((s) => ({ ...s, error: 'Business Name required' }))
      return
    }

    try {
      setState((s) => ({ ...s, saving: true }))

      const payload = {
        ...data,
        gallery: data.gallery || [],
        description: data.description || '',
        owner_id: user.id,
        updated_at: new Date().toISOString(),
      }

      const { error: e } = await supabase
        .from('businesses')
        .update(payload)
        .eq('owner_id', user.id)

      if (e?.code === 'PGRST116') {
        await supabase.from('businesses').insert([payload])
      }

      setState((s) => ({ ...s, success: '✅ Profile saved!' }))
      setTimeout(() => setState((s) => ({ ...s, success: null })), 3000)
    } catch (e) {
      setState((s) => ({ ...s, error: e.message || 'Save failed' }))
      setTimeout(() => setState((s) => ({ ...s, error: null })), 3000)
    } finally {
      setState((s) => ({ ...s, saving: false }))
    }
  }


  if (state.loading || authLoading) {
    return (
      <BusinessLayout>
        <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
          <div className="relative z-10 flex min-h-[60vh] items-center justify-center">
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

  return (
    <BusinessLayout>
      <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
        <div className="relative z-10 border-b border-blue-500/10 dark:border-white/10 bg-white/70 dark:bg-[#0b1322] backdrop-blur-xl transition-colors duration-300">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
            <div className="absolute right-20 top-0 h-20 w-20 rounded-full bg-cyan-100/50 blur-3xl dark:bg-cyan-400/10" />
          </div>

          <div className="relative flex min-h-[88px] items-center px-8">
            <div>
              <h1 className="font-[var(--font-outfit)] text-[30px] font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">
                Profile
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage your business profile
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-8 pt-6">
          <div className={`${GLASS_BG} rounded-[28px] px-5 py-4`}>
            <div className="flex items-center justify-between gap-8 min-h-16">
              <div className="flex gap-2 overflow-x-auto flex-1 no-scrollbar">
                {SECTIONS.map((section) => {
                  const Icon = section.icon
                  const isActive = activeSection === section.id

                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-2.5 rounded-2xl font-[var(--font-outfit)] font-semibold text-xs whitespace-nowrap transition-all flex items-center gap-2 border ${
                        isActive
                          ? 'bg-blue-600 text-white border-transparent shadow-[0_10px_30px_rgba(59,130,246,0.24)]'
                          : 'bg-white dark:bg-[#162033] text-slate-500 dark:text-slate-400 border-blue-500/15 dark:border-white/10 hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-300'
                      }`}
                    >
                      <Icon size={13} />
                      {section.label}
                    </motion.button>
                  )
                })}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">

                <motion.button
                  onClick={handleSave}
                  disabled={state.saving}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-[var(--font-outfit)] font-semibold text-xs disabled:opacity-50 flex items-center gap-2 shadow-[0_10px_30px_rgba(59,130,246,0.24)] transition-all"
                >
                  {state.saving ? (
                    <motion.div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaSave size={12} />
                  )}
                  <span className="hidden sm:inline">{state.saving ? 'Saving...' : 'Save'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-8 mt-4 px-4 py-3 rounded-2xl bg-red-50/90 dark:bg-[#1f1720] border border-red-300/50 dark:border-red-400/20 text-red-700 dark:text-red-300 text-sm flex items-center gap-3 relative z-10 backdrop-blur-xl"
            >
              <FaExclamationTriangle />
              {state.error}
            </motion.div>
          )}

          {state.success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-8 mt-4 px-4 py-3 rounded-2xl bg-blue-50/90 dark:bg-[#0f172a] border border-blue-300/50 dark:border-blue-400/20 text-blue-700 dark:text-blue-300 text-sm flex items-center gap-3 relative z-10 backdrop-blur-xl"
            >
              <FaCheck />
              {state.success}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="relative z-10">
          <div className="max-w-6xl mx-auto p-8 pb-20">
            <AnimatePresence mode="wait">
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3 space-y-2">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`relative group rounded-[28px] overflow-hidden ${GLASS_CARD} aspect-[3/1] !p-0`}
                      >
                        <div className="absolute top-4 left-4 z-10 bg-blue-600 px-3 py-1 rounded-full text-xs font-[var(--font-outfit)] font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]">
                          Business Card
                        </div>

                        {data.image_url ? (
                          <>
                            <img
                              src={data.image_url}
                              className="w-full h-full object-cover"
                              alt="Business Card Cover"
                            />

                            <motion.div
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center gap-3"
                            >
                              <label className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-[var(--font-outfit)] font-semibold text-sm rounded-2xl cursor-pointer flex items-center gap-2 transition-all backdrop-blur-md border border-white/20">
                                <FaCamera /> Change
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => uploadImage(e.target.files?.[0])}
                                  disabled={state.uploading}
                                />
                              </label>

                              <motion.button
                                onClick={() => {
                                  setData({ ...data, image_url: '' })
                                  setState((s) => ({ ...s, success: '✅ Cover removed!' }))
                                  setTimeout(
                                    () => setState((s) => ({ ...s, success: null })),
                                    2000
                                  )
                                }}
                                whileHover={{ scale: 1.05 }}
                                className="px-6 py-3 bg-red-500/30 hover:bg-red-500/50 text-white font-[var(--font-outfit)] font-semibold text-sm rounded-2xl flex items-center gap-2 transition-all backdrop-blur-md border border-red-400/30"
                              >
                                <FaTrash /> Remove
                              </motion.button>
                            </motion.div>
                          </>
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 cursor-pointer hover:bg-blue-50/60 dark:hover:bg-[#162033] transition-colors">
                            <FaCamera size={48} className="mb-3 opacity-40" />
                            <span className="font-[var(--font-outfit)] font-semibold text-slate-700 dark:text-slate-300">
                              Add Cover Image
                            </span>
                            <span className="text-xs mt-1 text-slate-400">
                              This will be your business card cover
                            </span>
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={(e) => uploadImage(e.target.files?.[0])}
                              disabled={state.uploading}
                            />
                          </label>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className={GLASS_CARD}
                      >
                        <h3 className="text-lg font-[var(--font-outfit)] font-semibold mb-6 tracking-[-0.03em] text-slate-900 dark:text-white">
                          Quick Overview
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormInput
                            label="Business Name"
                            value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                            placeholder="Your business name"
                          />
                          <FormInput
                            label="Category"
                            value={data.type}
                            onChange={(e) => setData({ ...data, type: e.target.value })}
                            placeholder="Restaurant, Salon, etc."
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={GLASS_CARD}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                            Description
                          </h3>

                          <motion.button
                            onClick={generateAI}
                            disabled={state.generatingAI || !data.name || !data.type}
                            whileHover={{ scale: 1.05 }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-[var(--font-outfit)] font-semibold text-xs flex items-center gap-2 disabled:opacity-50 transition-all shadow-[0_10px_30px_rgba(59,130,246,0.18)]"
                          >
                            <FaMagic size={11} className={state.generatingAI ? 'animate-spin' : ''} />
                            {state.generatingAI ? 'Generating...' : 'AI Write'}
                          </motion.button>
                        </div>

                        <textarea
                          value={data.description}
                          onChange={(e) => setData({ ...data, description: e.target.value })}
                          className={`w-full ${GLASS_INPUT} h-28 resize-none`}
                          placeholder="Describe your business..."
                        />

                        <p className="text-xs text-slate-400 mt-2">{data.description.length}/500</p>
                      </motion.div>
                    </div>

                    
                  </div>
                </motion.div>
              )}

              {activeSection === 'branding' && (
                <motion.div
                  key="branding"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={GLASS_CARD}
                      >
                        <h3 className="text-lg font-[var(--font-outfit)] font-semibold mb-6 tracking-[-0.03em] text-slate-900 dark:text-white">
                          Brand Identity
                        </h3>

                        <div className="space-y-6">
                          <FormInput
                            label="Business Name"
                            value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                            placeholder="Your business name"
                          />
                          <FormInput
                            label="Category/Type"
                            value={data.type}
                            onChange={(e) => setData({ ...data, type: e.target.value })}
                            placeholder="Restaurant, Salon, etc."
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className={GLASS_CARD}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                            Brand Description
                          </h3>

                          <motion.button
                            onClick={generateAI}
                            disabled={state.generatingAI || !data.name}
                            whileHover={{ scale: 1.05 }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-[var(--font-outfit)] font-semibold text-xs flex items-center gap-2 disabled:opacity-50 transition-all shadow-[0_10px_30px_rgba(59,130,246,0.18)]"
                          >
                            <FaMagic size={11} className={state.generatingAI ? 'animate-spin' : ''} />
                            AI Write
                          </motion.button>
                        </div>

                        <textarea
                          value={data.description}
                          onChange={(e) => setData({ ...data, description: e.target.value })}
                          className={`w-full ${GLASS_INPUT} h-40 resize-none`}
                          placeholder="Write a compelling description..."
                        />

                        <p className="text-xs text-slate-400 mt-2">
                          {data.description.length}/500 characters
                        </p>
                      </motion.div>
                    </div>

                    <BrandingTips />
                  </div>
                </motion.div>
              )}

              {activeSection === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={GLASS_CARD}
                      >
                        <h3 className="text-lg font-[var(--font-outfit)] font-semibold mb-6 tracking-[-0.03em] text-slate-900 dark:text-white">
                          Contact Information
                        </h3>

                        <div className="space-y-4">
                          <FormInput
                            label="Phone"
                            value={data.phone}
                            onChange={(e) => setData({ ...data, phone: e.target.value })}
                            placeholder="(555) 000-0000"
                          />
                          <FormInput
                            label="Email"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            placeholder="hello@business.com"
                          />
                          <FormInput
                            label="Website"
                            value={data.website}
                            onChange={(e) => setData({ ...data, website: e.target.value })}
                            placeholder="https://example.com"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className={GLASS_CARD}
                      >
                        <h3 className="text-lg font-[var(--font-outfit)] font-semibold mb-6 tracking-[-0.03em] text-slate-900 dark:text-white">
                          Address
                        </h3>

                        <div className="space-y-4">
                          <FormInput
                            label="Street Address"
                            value={data.address}
                            onChange={(e) => setData({ ...data, address: e.target.value })}
                            placeholder="123 Main St"
                          />

                          <div className="grid grid-cols-3 gap-4">
                            <FormInput
                              label="City"
                              value={data.city}
                              onChange={(e) => setData({ ...data, city: e.target.value })}
                              placeholder="City"
                            />
                            <FormInput
                              label="State"
                              value={data.state}
                              onChange={(e) => setData({ ...data, state: e.target.value })}
                              placeholder="State"
                            />
                            <FormInput
                              label="ZIP"
                              value={data.zip}
                              onChange={(e) => setData({ ...data, zip: e.target.value })}
                              placeholder="ZIP"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <DetailsTips />
                  </div>
                </motion.div>
              )}

              {activeSection === 'gallery' && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={GLASS_CARD}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                              Photo Gallery
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Showcase your business with photos
                            </p>
                          </div>

                          <span
                            className={`text-xs px-3 py-1 rounded-full border ${
                              data.gallery && data.gallery.length >= 6
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
                                : 'bg-white text-slate-700 border-blue-200 dark:bg-[#162033] dark:text-slate-300 dark:border-white/10'
                            }`}
                          >
                            {data.gallery ? data.gallery.length : 0}/12
                          </span>
                        </div>

                        <label className="block border-2 border-dashed border-blue-200 dark:border-white/15 rounded-[28px] p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-[#162033] transition-all mb-8">
                          <div className="flex flex-col items-center gap-2">
                            <FaCloudUploadAlt size={40} className="text-slate-400 dark:text-slate-500" />
                            <span className="font-[var(--font-outfit)] font-semibold text-slate-700 dark:text-white">
                              {state.uploading ? 'Uploading...' : 'Drop images here'}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              PNG, JPG up to 10MB
                            </span>
                          </div>

                          <input
                            type="file"
                            multiple
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              Array.from(e.target.files || []).forEach((f) => uploadImage(f, true))
                            }}
                            disabled={state.uploading}
                          />
                        </label>

                        {data.gallery && data.gallery.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {data.gallery.map((img, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.03 }}
                                className="relative group rounded-2xl overflow-hidden aspect-square border border-blue-500/12 dark:border-white/10 shadow-sm bg-white dark:bg-[#111827]"
                              >
                                <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />

                                <motion.div
                                  initial={{ opacity: 0 }}
                                  whileHover={{ opacity: 1 }}
                                  className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center"
                                >
                                  <motion.button
                                    onClick={() => {
                                      const newGallery = (data.gallery || []).filter((_, x) => x !== i)
                                      setData({ ...data, gallery: newGallery })
                                      setState((s) => ({ ...s, success: '✅ Image removed!' }))
                                      setTimeout(
                                        () => setState((s) => ({ ...s, success: null })),
                                        2000
                                      )
                                    }}
                                    whileHover={{ scale: 1.2 }}
                                    className="p-3 bg-red-500/40 hover:bg-red-500/60 backdrop-blur-md rounded-full transition-all border border-red-400/30 text-white"
                                  >
                                    <FaTrash size={14} />
                                  </motion.button>
                                </motion.div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-slate-400 dark:text-slate-600">
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

              {activeSection === 'hours' && (
                <motion.div
                  key="hours"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={GLASS_CARD}
                      >
                        <h3 className="text-lg font-[var(--font-outfit)] font-semibold mb-6 tracking-[-0.03em] text-slate-900 dark:text-white">
                          Operating Hours
                        </h3>

                        <div className="space-y-3">
                          {DAYS.map((day, idx) => {
                            const dayHours = data.hours[day] || {
                              open: '09:00',
                              close: '17:00',
                              closed: false,
                            }

                            return (
                              <motion.div
                                key={day}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50/60 dark:hover:bg-[#162033] transition-all"
                              >
                                <span className="w-24 text-sm font-[var(--font-outfit)] font-semibold text-slate-600 dark:text-slate-300">
                                  {day}
                                </span>

                                <motion.button
                                  onClick={() =>
                                    setData((d) => ({
                                      ...d,
                                      hours: {
                                        ...d.hours,
                                        [day]: { ...dayHours, closed: !dayHours.closed },
                                      },
                                    }))
                                  }
                                  className={`px-3 py-1.5 rounded-full text-xs font-[var(--font-outfit)] font-semibold whitespace-nowrap transition-all border ${
                                    dayHours.closed
                                      ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#162033] dark:text-slate-300 dark:border-white/10'
                                      : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
                                  }`}
                                >
                                  {dayHours.closed ? 'Closed' : 'Open'}
                                </motion.button>

                                {!dayHours.closed && (
                                  <div className="flex items-center gap-2 ml-auto">
                                    <div className="relative">
                                      <select
                                        value={dayHours.open}
                                        onChange={(e) =>
                                          setData((d) => ({
                                            ...d,
                                            hours: {
                                              ...d.hours,
                                              [day]: { ...dayHours, open: e.target.value },
                                            },
                                          }))
                                        }
                                        className={`${GLASS_INPUT} pr-8 appearance-none`}
                                      >
                                        {TIME_SLOTS.map((t) => (
                                          <option key={`${day}-open-${t.value}`} value={t.value}>
                                            {t.label}
                                          </option>
                                        ))}
                                      </select>
                                      <FaChevronDown
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                                        size={10}
                                      />
                                    </div>

                                    <span className="text-xs text-slate-400">→</span>

                                    <div className="relative">
                                      <select
                                        value={dayHours.close}
                                        onChange={(e) =>
                                          setData((d) => ({
                                            ...d,
                                            hours: {
                                              ...d.hours,
                                              [day]: { ...dayHours, close: e.target.value },
                                            },
                                          }))
                                        }
                                        className={`${GLASS_INPUT} pr-8 appearance-none`}
                                      >
                                        {TIME_SLOTS.map((t) => (
                                          <option key={`${day}-close-${t.value}`} value={t.value}>
                                            {t.label}
                                          </option>
                                        ))}
                                      </select>
                                      <FaChevronDown
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                                        size={10}
                                      />
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
      </div>
    </BusinessLayout>
  )
}
