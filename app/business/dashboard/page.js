'use client'

// Business dashboard homepage-style layout
// Updated to match the Vicinity landing page color theme only

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Inter, Outfit } from 'next/font/google'
import {
  FaStar,
  FaCommentDots,
  FaEye,
  FaTag,
  FaStore,
  FaPen,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
  FaChartLine,
} from 'react-icons/fa'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout.jsx'
import { useTheme } from '../../../context/ThemeContext'

// Font setup
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

// Shared animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
}

const staggerWrap = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
}

// Landing-page style animated background
function HeroBackground() {
  const { isDark } = useTheme()

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base background */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-[#081120]'
            : 'bg-gradient-to-b from-white via-slate-50 to-blue-50'
        }`}
      />

      {/* Main blue glow */}
      <motion.div
        animate={{
          y: [0, -16, 0],
          scale: [1, 1.05, 1],
          opacity: [0.25, 0.45, 0.25],
          transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
        className={`absolute left-1/2 top-[8%] h-[540px] w-[540px] -translate-x-1/2 rounded-full blur-[140px] ${
          isDark ? 'bg-blue-500/18' : 'bg-blue-200/75'
        }`}
      />

      {/* Left glow */}
      <motion.div
        animate={{
          x: [0, 16, 0],
          y: [0, 14, 0],
          opacity: [0.18, 0.32, 0.18],
          transition: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
        }}
        className={`absolute left-[-8%] top-[16%] h-[320px] w-[320px] rounded-full blur-[120px] ${
          isDark ? 'bg-blue-400/12' : 'bg-blue-100/80'
        }`}
      />

      {/* Right glow */}
      <motion.div
        animate={{
          x: [0, -12, 0],
          y: [0, -10, 0],
          opacity: [0.14, 0.28, 0.14],
          transition: { duration: 11, repeat: Infinity, ease: 'easeInOut' },
        }}
        className={`absolute right-[-6%] top-[14%] h-[340px] w-[340px] rounded-full blur-[120px] ${
          isDark ? 'bg-blue-600/12' : 'bg-blue-100/70'
        }`}
      />

      {/* Bottom glow */}
      <motion.div
        animate={{
          scale: [1, 1.04, 1],
          opacity: [0.16, 0.28, 0.16],
          transition: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
        }}
        className={`absolute bottom-[-10%] left-[20%] h-[280px] w-[280px] rounded-full blur-[110px] ${
          isDark ? 'bg-blue-400/10' : 'bg-blue-50'
        }`}
      />

      {/* Top radial wash */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_42%)]'
            : 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_45%)]'
        }`}
      />

      {/* Animated grid */}
      <motion.div
        animate={{
          backgroundPosition: ['0px 0px', '72px 72px'],
          transition: { duration: 18, repeat: Infinity, ease: 'linear' },
        }}
        className={`absolute inset-0 ${isDark ? 'opacity-[0.08]' : 'opacity-[0.06]'}`}
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(59,130,246,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.22) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(circle at center, black 45%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 100%)',
        }}
      />

      {/* Accent beam */}
      <motion.div
        animate={{
          opacity: [0.12, 0.35, 0.12],
          scaleY: [1, 1.15, 1],
          transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute right-[12%] top-[14%] h-32 w-[3px] rounded-full bg-blue-400/70 blur-sm"
      />

      {/* Bottom fade */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-b from-transparent via-transparent to-[#081120]'
            : 'bg-gradient-to-b from-transparent via-transparent to-white'
        }`}
      />
    </div>
  )
}

// Reusable section glow
function SectionGlow({ position = 'left' }) {
  const { isDark } = useTheme()

  return (
    <>
      {/* Main glow */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.14, 0.28, 0.14],
          x: [0, position === 'left' ? 18 : -18, 0],
          transition: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
        }}
        className={`absolute ${
          position === 'left' ? '-left-24 top-10' : '-right-24 top-16'
        } h-[320px] w-[320px] rounded-full blur-[120px] ${
          isDark ? 'bg-blue-500/10' : 'bg-blue-100/80'
        }`}
      />

      {/* Smaller glow */}
      <motion.div
        animate={{
          y: [0, -14, 0],
          opacity: [0.1, 0.2, 0.1],
          transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
        }}
        className={`absolute ${
          position === 'left' ? 'right-10 bottom-0' : 'left-10 bottom-0'
        } h-[160px] w-[160px] rounded-full blur-[100px] ${
          isDark ? 'bg-blue-400/10' : 'bg-blue-50'
        }`}
      />
    </>
  )
}

// Small top badge
function Eyebrow({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 font-[var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.08)] dark:text-blue-300">
      {/* Pulse dot */}
      <motion.span
        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="h-2.5 w-2.5 rounded-full bg-blue-500"
      />
      {children}
    </div>
  )
}

export default function BusinessDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { isDark } = useTheme()
  const router = useRouter()
  const supabase = createClient()

  const [businessData, setBusinessData] = useState(null)
  const [reviews, setReviews] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewTrendData, setReviewTrendData] = useState([])
  const [ratingBarData, setRatingBarData] = useState([])

  useEffect(() => {
    const loadData = async () => {
      if (authLoading || !user) return

      try {
        setLoading(true)

        // Load business profile
        const { data: businessProfile } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .single()

        if (!businessProfile) {
          router.push('/business/profile')
          return
        }

        setBusinessData(businessProfile)

        // Load reviews
        const { data: reviewRows } = await supabase
          .from('reviews')
          .select('*')
          .eq('business_id', businessProfile.id)
          .order('created_at', { ascending: false })

        const fetchedReviews = reviewRows || []
        setReviews(fetchedReviews)

        // Load deals
        const { data: dealRows } = await supabase
          .from('deals')
          .select('*')
          .eq('business_id', businessProfile.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        const fetchedDeals = dealRows || []
        setDeals(fetchedDeals)

        // Rating bars
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

        fetchedReviews.forEach((review) => {
          const rounded = Math.round(review.rating || 0)
          if (counts[rounded] !== undefined) counts[rounded] += 1
        })

        setRatingBarData(
          Object.keys(counts).map((star) => ({
            name: `${star}★`,
            count: counts[Number(star)],
            color: Number(star) >= 4 ? '#2563eb' : Number(star) === 3 ? '#60a5fa' : '#cbd5e1',
          }))
        )

        // Last 7 days review trend
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return d.toISOString().split('T')[0]
        })

        setReviewTrendData(
          last7Days.map((date) => {
            const count = fetchedReviews.filter(
              (review) => review.created_at && review.created_at.startsWith(date)
            ).length

            return {
              date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
              reviews: count,
            }
          })
        )
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [authLoading, user, router, supabase])

  // Loading state
  if (loading) {
    return (
      <div
        className={`${inter.variable} ${outfit.variable} flex h-screen items-center justify-center ${
          isDark ? 'bg-[#081120]' : 'bg-white'
        }`}
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        {/* Loading spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          className={`h-12 w-12 rounded-full border-[3px] ${
            isDark
              ? 'border-blue-500/20 border-t-blue-300'
              : 'border-blue-200 border-t-blue-600'
          }`}
        />
      </div>
    )
  }

  // Derived data
  const businessName = businessData?.name || 'Your Business'
  const businessId = businessData?.id
  const totalReviews = reviews.length

  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews
      : 0

  const positiveReviews = reviews.filter((review) => (review.rating || 0) >= 4).length
  const positiveRate = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0
  const latestReview = reviews[0] || null

  const lastMonthReviews = reviews.filter((review) => {
    if (!review.created_at) return false
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return new Date(review.created_at) >= monthAgo
  }).length

  const activeDealCount = deals.filter((deal) => {
    if (!deal.expiry_date) return true
    return new Date() <= new Date(deal.expiry_date)
  }).length

  const profileChecks = [
    businessData?.name,
    businessData?.description,
    businessData?.category,
    businessData?.address,
    businessData?.phone,
    businessData?.image_url,
  ]
  const completedFields = profileChecks.filter(Boolean).length
  const profileCompletion = Math.round((completedFields / profileChecks.length) * 100)

  // Dashboard summary
  let dashboardSummary = ''

  if (totalReviews === 0 && activeDealCount === 0) {
    dashboardSummary =
      'You are set up, but the page is still quiet. The clearest next move is to complete your profile and publish a deal so visitors have something timely to engage with.'
  } else if (totalReviews > 0 && positiveRate >= 80) {
    dashboardSummary = `Your reputation looks strong right now. ${positiveRate}% of your reviews are 4 to 5 stars, which creates a solid trust signal for new visitors.`
  } else if (totalReviews > 0 && positiveRate < 60) {
    dashboardSummary =
      'Customer feedback is more mixed at the moment. A strong next step would be reviewing your latest comments and updating your offers or profile details to address recurring concerns.'
  } else {
    dashboardSummary =
      'Your page has healthy activity, but there is still room to make it feel more active and current. Fresh profile details and updated offers can help convert more visitors.'
  }

  // Greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <main
      className={`${inter.variable} ${outfit.variable} relative min-h-screen overflow-x-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-[#081120] dark:text-white`}
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {/* Background */}
      <HeroBackground />

      <BusinessLayout>
        <div className="relative z-10 overflow-hidden">
          <motion.div
            variants={staggerWrap}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-7xl px-6 pb-24 lg:px-8"
          >
            {/* Hero section */}
            <motion.section
              variants={fadeUp}
              className="relative px-0 pb-12 pt-8 md:pb-16 md:pt-12"
            >
              <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
                {/* Left hero content */}
                <div className="max-w-4xl">
                  <Eyebrow>Business home</Eyebrow>

                  {/* Hero title */}
                  <h1 className="mt-6 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.07em] text-slate-900 dark:text-white md:text-6xl lg:text-7xl">
                    {getGreeting()},{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-300 dark:to-blue-500">
                      {businessName}
                    </span>
                  </h1>

                  {/* Hero description */}
                  <p className="mt-6 max-w-3xl text-[15px] leading-8 text-slate-600 dark:text-slate-400 md:text-[17px]">
                    This page is designed more like a home base than a heavy dashboard. It gives you a quick sense of how your business is performing on Vicinity, what customers are saying, and what action is most worth your time next.
                  </p>

                  {/* Hero summary */}
                  <p className="mt-5 max-w-3xl text-[15px] leading-8 text-slate-600 dark:text-slate-400">
                    {dashboardSummary}
                  </p>

                  {/* Hero actions */}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href={`/business/${businessId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-500/20 bg-white px-5 py-3 font-[var(--font-outfit)] text-sm font-semibold tracking-[0.01em] text-slate-900 transition-colors hover:border-blue-500/40 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.06]"
                    >
                      <FaEye className="text-xs" />
                      View public profile
                    </a>

                    <Link
                      href="/business/profile"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-[var(--font-outfit)] text-sm font-semibold tracking-[0.01em] text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
                    >
                      <FaPen className="text-xs" />
                      Edit business
                    </Link>
                  </div>
                </div>

                {/* Right hero panel */}
                <div className="relative mx-auto w-full max-w-xl">
                  {/* Outer glow */}
                  <motion.div
                    animate={{
                      scale: [1, 1.04, 1],
                      opacity: [0.18, 0.34, 0.18],
                      transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    className="absolute inset-0 -z-10 rounded-[36px] bg-blue-500/10 blur-3xl"
                  />

                  <div className="overflow-hidden rounded-[36px] border border-blue-500/15 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                    <div className="border-b border-blue-500/10 px-6 py-4 dark:border-white/10">
                      <p className="font-[var(--font-outfit)] text-sm font-medium tracking-[0.02em] text-blue-600 dark:text-blue-300">
                        Today on Vicinity
                      </p>
                      <h2 className="mt-2 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
                        Your page status in one quick read
                      </h2>
                    </div>

                    <div className="space-y-0 p-6">
                      {[
                        {
                          label: 'Average rating',
                          text: 'Your overall public score right now.',
                          value: avgRating.toFixed(1),
                        },
                        {
                          label: 'Total reviews',
                          text: 'Feedback left by your customers.',
                          value: totalReviews,
                        },
                        {
                          label: 'Active deals',
                          text: 'Offers visitors can act on now.',
                          value: activeDealCount,
                        },
                        {
                          label: 'Profile completion',
                          text: 'How complete your business page feels.',
                          value: `${profileCompletion}%`,
                        },
                      ].map((item, index) => (
                        <div key={item.label}>
                          <div className="flex items-start justify-between gap-5 py-4">
                            <div>
                              <p className="font-[var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                {item.label}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                {item.text}
                              </p>
                            </div>
                            <p className="font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
                              {item.value}
                            </p>
                          </div>

                          {index !== 3 && (
                            <div className="h-px bg-blue-500/10 dark:bg-white/10" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Stat strip */}
            <motion.section
              variants={fadeUp}
              className="relative mb-16 overflow-hidden rounded-[32px] border border-blue-500/15 bg-white/80 px-6 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] md:px-8"
            >
              <SectionGlow position="left" />

              <div className="relative z-10 grid grid-cols-2 gap-6 md:grid-cols-4">
                <div>
                  <p className="font-[var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Positive share
                  </p>
                  <p className="mt-2 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white md:text-3xl">
                    {positiveRate}%
                  </p>
                </div>

                <div>
                  <p className="font-[var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Last 30 days
                  </p>
                  <p className="mt-2 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white md:text-3xl">
                    {lastMonthReviews}
                  </p>
                </div>

                <div>
                  <p className="font-[var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Active offers
                  </p>
                  <p className="mt-2 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white md:text-3xl">
                    {activeDealCount}
                  </p>
                </div>

                <div>
                  <p className="font-[var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Business page
                  </p>
                  <p className="mt-2 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white md:text-3xl">
                    Live
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Business health section */}
            <motion.section variants={fadeUp} className="relative py-10 md:py-16">
              <SectionGlow position="right" />

              <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
                {/* Text side */}
                <div>
                  <Eyebrow>Business health</Eyebrow>

                  <h2 className="mt-6 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.06em] text-slate-900 dark:text-white md:text-5xl">
                    A cleaner read on how your business is doing
                  </h2>

                  <p className="mt-5 text-[15px] leading-8 text-slate-600 dark:text-slate-400">
                    Your business currently has {totalReviews} total reviews with an average rating of {avgRating.toFixed(1)}. That tells the broad story, but what matters more is whether the page feels active, trustworthy, and current when someone lands on it for the first time.
                  </p>

                  <p className="mt-4 text-[15px] leading-8 text-slate-600 dark:text-slate-400">
                    Right now, {positiveRate}% of your reviews are positive and you have {activeDealCount} active deal{activeDealCount === 1 ? '' : 's'}. Those two signals work together because visitors want both confidence and a reason to act.
                  </p>

                  <div className="mt-7">
                    <Link
                      href="/business/reviews"
                      className="inline-flex items-center gap-2 font-[var(--font-outfit)] text-sm font-semibold tracking-[0.01em] text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Review customer feedback <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>

                {/* Chart side */}
                <div className="rounded-[32px] border border-blue-500/15 bg-white/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] md:p-6">
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-[var(--font-outfit)] text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Light analytics
                    </div>

                    <h3 className="mt-4 font-[var(--font-outfit)] text-xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-white md:text-2xl">
                      Review activity over the last 7 days
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                      This is just a quick pulse. It helps you spot whether feedback is arriving steadily or in short bursts without turning the page into a heavy analytics dashboard.
                    </p>
                  </div>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reviewTrendData}>
                        <defs>
                          <linearGradient id="reviewFlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.10)'}
                        />

                        <XAxis
                          dataKey="date"
                          stroke={isDark ? '#94a3b8' : '#64748b'}
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />

                        <YAxis
                          stroke={isDark ? '#94a3b8' : '#64748b'}
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#0d1424' : '#ffffff',
                            border: isDark
                              ? '1px solid rgba(255,255,255,0.08)'
                              : '1px solid rgba(59,130,246,0.18)',
                            borderRadius: '16px',
                            color: isDark ? '#fff' : '#0f172a',
                          }}
                        />

                        <Area
                          type="monotone"
                          dataKey="reviews"
                          stroke="#2563eb"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#reviewFlow)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Latest review section */}
            <motion.section variants={fadeUp} className="relative py-10 md:py-16">
              <SectionGlow position="left" />

              <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                {/* Review card */}
                <div className="rounded-[32px] border border-blue-500/15 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] md:p-8">
                  <Eyebrow>Latest feedback</Eyebrow>

                  <h2 className="mt-6 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-slate-900 dark:text-white md:text-4xl">
                    What your most recent customer is saying
                  </h2>

                  {latestReview ? (
                    <div className="mt-8">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.22)]">
                          {(latestReview.user_name || 'C').charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h3 className="font-[var(--font-outfit)] text-lg font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">
                                {latestReview.user_name || 'Customer'}
                              </h3>

                              <div className="mt-2 flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    size={14}
                                    className={
                                      i < (latestReview.rating || 0)
                                        ? 'text-blue-500'
                                        : isDark
                                        ? 'text-slate-700'
                                        : 'text-slate-300'
                                    }
                                  />
                                ))}
                              </div>
                            </div>

                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(latestReview.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="mt-5 text-[15px] leading-8 text-slate-600 dark:text-slate-400">
                            {truncateText(latestReview.text || '', 420)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8">
                      <p className="text-[15px] leading-8 text-slate-600 dark:text-slate-400">
                        No one has left a review yet. Once feedback starts coming in, this section becomes one of the most useful parts of the page because it shows you the newest customer impression in plain language.
                      </p>
                    </div>
                  )}

                  <div className="mt-8">
                    <Link
                      href="/business/reviews"
                      className="inline-flex items-center gap-2 font-[var(--font-outfit)] text-sm font-semibold tracking-[0.01em] text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Open full review history <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>

                {/* Review text side */}
                <div>
                  <Eyebrow>Customer perception</Eyebrow>

                  <h2 className="mt-6 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.06em] text-slate-900 dark:text-white md:text-5xl">
                    Reviews do more than raise or lower a score
                  </h2>

                  <p className="mt-5 text-[15px] leading-8 text-slate-600 dark:text-slate-400">
                    For most people, reviews are not just proof that your business exists. They shape the emotional tone of the page. They tell visitors whether your service feels reliable, welcoming, and worth trying.
                  </p>

                  <p className="mt-4 text-[15px] leading-8 text-slate-600 dark:text-slate-400">
                    That is why this page highlights the newest review in a more editorial way. It helps you notice what people are actually experiencing instead of only looking at summary numbers.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href="/business/reviews"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-500/20 bg-white px-4 py-2 font-[var(--font-outfit)] text-sm font-semibold tracking-[0.01em] text-slate-900 transition-colors hover:border-blue-500/40 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.06]"
                    >
                      <FaCommentDots className="text-xs text-blue-600 dark:text-blue-300" />
                      Manage reviews
                    </Link>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Deals section */}
            <motion.section variants={fadeUp} className="relative py-10 md:py-16">
              <SectionGlow position="right" />

              <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
                {/* Text side */}
                <div>
                  <Eyebrow>Offers and momentum</Eyebrow>

                  <h2 className="mt-6 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.06em] text-slate-900 dark:text-white md:text-5xl">
                    Active deals make your page feel current
                  </h2>

                  <p className="mt-5 text-[15px] leading-8 text-slate-600 dark:text-slate-400">
                    A business page with a timely offer usually feels more alive than one that only shows static information. It gives people a reason to pay attention now, not later.
                  </p>

                  <p className="mt-4 text-[15px] leading-8 text-slate-600 dark:text-slate-400">
                    You currently have {activeDealCount} active deal{activeDealCount === 1 ? '' : 's'}. Even one well-written offer can make the profile feel more relevant, more useful, and more actionable for a visitor browsing nearby options.
                  </p>

                  <div className="mt-7">
                    <Link
                      href="/business/deals"
                      className="inline-flex items-center gap-2 font-[var(--font-outfit)] text-sm font-semibold tracking-[0.01em] text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Manage offers and deals <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>

                {/* Deals card */}
                <div className="rounded-[32px] border border-blue-500/15 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-[var(--font-outfit)] text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Current offers
                      </div>

                      <h3 className="mt-4 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                        Active deals on your page
                      </h3>
                    </div>

                    <Link
                      href="/business/deals"
                      className="font-[var(--font-outfit)] text-sm font-semibold text-blue-600 dark:text-blue-300"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="mt-6 space-y-4">
                    {deals.length > 0 ? (
                      deals.slice(0, 3).map((deal) => (
                        <div
                          key={deal.id}
                          className="group relative overflow-hidden rounded-3xl border border-blue-500/10 bg-white/75 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_20px_60px_rgba(59,130,246,0.12)] dark:border-white/10 dark:bg-white/[0.04]"
                        >
                          {/* Hover glow */}
                          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/0 blur-3xl transition-all duration-500 group-hover:bg-blue-500/15" />

                          <div className="relative z-10 flex items-start justify-between gap-4">
                            <div className="max-w-2xl">
                              <div className="mb-3 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-[var(--font-outfit)] text-xs font-medium tracking-[0.02em] text-blue-700 dark:text-blue-300">
                                Live offer
                              </div>

                              <h4 className="font-[var(--font-outfit)] text-lg font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                                {deal.title || 'Untitled Deal'}
                              </h4>

                              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                                {truncateText(deal.description || 'No description provided.', 150)}
                              </p>

                              {deal.expiry_date && (
                                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                  <FaClock size={11} />
                                  Ends {new Date(deal.expiry_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            <div className="shrink-0 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 font-[var(--font-outfit)] text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-300">
                              Active
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-blue-500/10 bg-white/75 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
                        <h4 className="font-[var(--font-outfit)] text-lg font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                          No active deals yet
                        </h4>

                        <p className="mt-3 text-sm leading-8 text-slate-600 dark:text-slate-400">
                          Your page would feel more current with at least one live offer. A deal creates urgency and gives visitors an immediate reason to engage.
                        </p>

                        <Link
                          href="/business/deals"
                          className="mt-5 inline-flex items-center gap-2 font-[var(--font-outfit)] text-sm font-semibold tracking-[0.01em] text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          Create your first deal <FaArrowRight className="text-xs" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Insights section */}
            <motion.section variants={fadeUp} className="relative py-10 md:py-16">
              <SectionGlow position="left" />

              <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                {/* Chart panel */}
                <div className="rounded-[32px] border border-blue-500/15 bg-white/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] md:p-6">
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-[var(--font-outfit)] text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Rating spread
                    </div>

                    <h3 className="mt-4 font-[var(--font-outfit)] text-xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-white md:text-2xl">
                      How your ratings are distributed
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                      This chart is intentionally small. It helps you see whether your average rating is backed by consistent reviews or pulled around by a small number of extremes.
                    </p>
                  </div>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ratingBarData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.10)'}
                          vertical={false}
                        />

                        <XAxis
                          dataKey="name"
                          stroke={isDark ? '#94a3b8' : '#64748b'}
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />

                        <YAxis
                          stroke={isDark ? '#94a3b8' : '#64748b'}
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#0d1424' : '#ffffff',
                            border: isDark
                              ? '1px solid rgba(255,255,255,0.08)'
                              : '1px solid rgba(59,130,246,0.18)',
                            borderRadius: '16px',
                            color: isDark ? '#fff' : '#0f172a',
                          }}
                          cursor={{
                            fill: isDark
                              ? 'rgba(255,255,255,0.04)'
                              : 'rgba(59,130,246,0.05)',
                          }}
                        />

                        <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={44}>
                          {ratingBarData.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Text side */}
                <div>
                  <Eyebrow>Reputation insight</Eyebrow>

                  <h2 className="mt-6 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.06em] text-slate-900 dark:text-white md:text-5xl">
                    Reputation is clearer when you see the shape, not just the score
                  </h2>

                  <p className="mt-5 text-[15px] leading-8 text-slate-600 dark:text-slate-400">
                    A strong average rating matters, but consistency matters too. If most reviews cluster around 4 and 5 stars, visitors usually read that as stable trust. If the spread is more uneven, people may hesitate even when the average looks decent.
                  </p>

                  <p className="mt-4 text-[15px] leading-8 text-slate-600 dark:text-slate-400">
                    That is why the dashboard keeps one simple rating chart instead of overloading the page with analytics. It gives you just enough context to understand how your reputation is forming.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 font-[var(--font-outfit)] text-sm font-semibold tracking-[0.01em] text-blue-700 dark:text-blue-300">
                      <FaChartLine className="text-xs" />
                      Minimal but useful
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* CTA section */}
            <motion.section variants={fadeUp} className="relative px-0 pb-20 pt-8 md:pb-24">
              <SectionGlow position="right" />

              <div className="relative z-10 overflow-hidden rounded-[32px] border border-blue-500/15 bg-white/80 px-8 py-10 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] md:px-12 md:py-12">
                {/* CTA glow */}
                <motion.div
                  animate={{
                    x: ['-10%', '10%', '-10%'],
                    opacity: [0.08, 0.18, 0.08],
                    transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="absolute inset-0 bg-blue-500/10 blur-3xl"
                />

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-[var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                      <FaCheckCircle className="text-[11px]" />
                      Built for clarity
                    </div>

                    <h3 className="font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-slate-900 dark:text-white md:text-4xl">
                      Keep your Vicinity page active, clear, and worth visiting again
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400 md:text-[15px]">
                      The strongest business pages on Vicinity stay complete, stay current, and keep giving people a reason to trust what they see. That usually means maintaining profile quality, responding to feedback, and running at least one useful active offer.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/business/profile"
                      className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3.5 font-[var(--font-outfit)] text-sm font-semibold tracking-[0.01em] text-white shadow-[0_12px_30px_rgba(59,130,246,0.22)]"
                    >
                      Update profile
                    </Link>

                    <Link
                      href="/business/deals"
                      className="inline-flex items-center justify-center rounded-2xl border border-blue-500/20 bg-white px-6 py-3.5 font-[var(--font-outfit)] text-sm font-semibold tracking-[0.01em] text-slate-900 transition-colors hover:border-blue-500/40 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.06]"
                    >
                      Manage deals
                    </Link>

                    <Link
                      href="/business/reviews"
                      className="inline-flex items-center justify-center rounded-2xl border border-blue-500/20 bg-white px-6 py-3.5 font-[var(--font-outfit)] text-sm font-semibold tracking-[0.01em] text-slate-900 transition-colors hover:border-blue-500/40 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.06]"
                    >
                      Review feedback
                    </Link>
                  </div>
                </div>
              </div>
            </motion.section>
          </motion.div>
        </div>
      </BusinessLayout>
    </main>
  )
}

// Text helper
function truncateText(text, maxLength) {
  if (!text) return ''
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}
