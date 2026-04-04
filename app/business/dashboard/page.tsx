'use client'


// Business owner dashboard displaying key metrics, recent reviews, and performance analytics.
// Wraps content in the BusinessLayout sidebar and fetches data from Supabase.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Inter, Outfit } from 'next/font/google'
import {
  FaStar,
  FaEye,
  FaPen,
  FaClock,
  FaArrowRight,
  FaTag,
  FaCommentDots,
  FaCheckCircle,
  FaChartLine,
} from 'react-icons/fa'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout'
import { useTheme } from '../../../context/ThemeContext'

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  { ssr: false }
)

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const staggerWrap = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

// Animated blurred gradient background for the dashboard hero
function HeroBackground() {
  const { isDark } = useTheme()

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-[#081120]'
            : 'bg-gradient-to-b from-white via-slate-50 to-blue-50'
        }`}
      />

      <motion.div
        animate={{
          y: [0, -16, 0],
          scale: [1, 1.05, 1],
          opacity: [0.24, 0.42, 0.24],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute left-1/2 top-[5%] h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-[140px] ${
          isDark ? 'bg-blue-500/16' : 'bg-blue-200/75'
        }`}
      />

      <motion.div
        animate={{
          x: [0, 14, 0],
          y: [0, 12, 0],
          opacity: [0.15, 0.28, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute left-[-6%] top-[18%] h-[300px] w-[300px] rounded-full blur-[120px] ${
          isDark ? 'bg-blue-400/12' : 'bg-blue-100/85'
        }`}
      />

      <motion.div
        animate={{
          x: [0, -12, 0],
          y: [0, -10, 0],
          opacity: [0.14, 0.25, 0.14],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute right-[-6%] top-[16%] h-[320px] w-[320px] rounded-full blur-[120px] ${
          isDark ? 'bg-blue-600/12' : 'bg-blue-100/75'
        }`}
      />

      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '72px 72px'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-0 ${isDark ? 'opacity-[0.08]' : 'opacity-[0.06]'}`}
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(59,130,246,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.22) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(circle at center, black 45%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(circle at center, black 45%, transparent 100%)',
        }}
      />

      <motion.div
        animate={{
          opacity: [0.12, 0.3, 0.12],
          scaleY: [1, 1.12, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[12%] top-[14%] h-32 w-[3px] rounded-full bg-blue-400/70 blur-sm"
      />

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

// Soft drifting glow accent for section backgrounds
function SectionGlow({ position = 'left' }) {
  const { isDark } = useTheme()

  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.12, 0.22, 0.12],
        x: [0, position === 'left' ? 16 : -16, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute ${
        position === 'left' ? '-left-20 top-10' : '-right-20 top-10'
      } h-[260px] w-[260px] rounded-full blur-[110px] ${
        isDark ? 'bg-blue-500/10' : 'bg-blue-100/80'
      }`}
    />
  )
}

// Frosted-glass card wrapper used across the dashboard
function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-[30px] border border-blue-500/15 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)] ${className}`}
    >
      {children}
    </div>
  )
}

// Business dashboard with metrics, latest review, and activity chart
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

  useEffect(() => {
    const loadData = async () => {
      if (authLoading || !user) return

      try {
        setLoading(true)

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

        const { data: reviewRows } = await supabase
          .from('reviews')
          .select('*')
          .eq('business_id', businessProfile.id)
          .order('created_at', { ascending: false })

        const fetchedReviews = reviewRows || []
        setReviews(fetchedReviews)

        const { data: dealRows } = await supabase
          .from('deals')
          .select('*')
          .eq('business_id', businessProfile.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        setDeals(dealRows || [])

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return d.toISOString().split('T')[0]
        })

        const trend = last7Days.map((date) => {
          const count = fetchedReviews.filter(
            (review) => review.created_at && review.created_at.startsWith(date)
          ).length

          return {
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            reviews: count,
          }
        })

        setReviewTrendData(trend)
      } catch (error) {
        console.error('Dashboard load error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [authLoading, user, router, supabase])

  const businessName = businessData?.name || 'Your Business'
  const businessId = businessData?.id
  const totalReviews = reviews.length
  const latestReview = reviews[0] || null

  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews
      : 0

  const positiveReviews = reviews.filter((review) => (review.rating || 0) >= 4).length
  const positiveRate = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0

  const activeDeals = deals.filter((deal) => {
    if (!deal.expiry_date) return true
    return new Date() <= new Date(deal.expiry_date)
  })

  const activeDealCount = activeDeals.length

  const lastMonthReviews = reviews.filter((review) => {
    if (!review.created_at) return false
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return new Date(review.created_at) >= monthAgo
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

  let dashboardSummary = 'Your page is live and ready for quick updates.'

  if (totalReviews === 0 && activeDealCount === 0) {
    dashboardSummary = 'Complete your profile and add a deal to make the page feel active.'
  } else if (totalReviews > 0 && positiveRate >= 80) {
    dashboardSummary = 'Your reviews look strong right now and create a solid first impression.'
  } else if (totalReviews > 0 && positiveRate < 60) {
    dashboardSummary = 'Feedback is more mixed, so reviews and offers are the best place to focus next.'
  } else {
    dashboardSummary = 'Your page has activity, and a few updates could make it feel even stronger.'
  }

  // Return a time-of-day greeting (morning/afternoon/evening)
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const stats = [
    {
      label: 'Average rating',
      value: totalReviews > 0 ? avgRating.toFixed(1) : '0.0',
    },
    {
      label: 'Total reviews',
      value: totalReviews,
    },
    {
      label: 'Active deals',
      value: activeDealCount,
    },
    {
      label: 'Profile completion',
      value: `${profileCompletion}%`,
    },
  ]

  if (loading) {
    return (
      <div
        className={`${inter.variable} ${outfit.variable} flex h-screen items-center justify-center ${
          isDark ? 'bg-[#081120]' : 'bg-white'
        }`}
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.7, repeat: Infinity, ease: 'linear' }}
          className={`h-12 w-12 rounded-full border-[3px] ${
            isDark
              ? 'border-blue-500/20 border-t-blue-300'
              : 'border-blue-200 border-t-blue-600'
          }`}
        />
      </div>
    )
  }

  return (
    <main
      className={`${inter.variable} ${outfit.variable} relative min-h-screen overflow-x-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-[#081120] dark:text-white`}
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      <HeroBackground />

      <BusinessLayout>
        <div className="relative z-10">
          <motion.div
            variants={staggerWrap}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8"
          >
            <motion.section variants={fadeUp} className="relative pb-8 md:pb-10">
              <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="max-w-4xl">
                  <h1 className="mt-1 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.07em] text-slate-900 dark:text-white md:text-6xl">
                    {getGreeting()},{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-300 dark:to-blue-500">
                      {businessName}
                    </span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-[15px] leading-8 text-slate-600 dark:text-slate-400 md:text-[16px]">
                    {dashboardSummary}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href={`/business/${businessId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-500/20 bg-white px-5 py-3 font-[var(--font-outfit)] text-sm font-semibold text-slate-900 transition-colors hover:border-blue-500/40 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.06]"
                    >
                      <FaEye className="text-xs" />
                      View public profile
                    </a>

                    <Link
                      href="/business/profile"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-[var(--font-outfit)] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
                    >
                      <FaPen className="text-xs" />
                      Edit business
                    </Link>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="h-[300px] w-[300px] md:h-[380px] md:w-[380px]">
                    <DotLottieReact
                      src="https://lottie.host/4e4e53d8-bbfd-4a17-84b5-77bae5c846a5/ObgSrdv2ck.lottie"
                      loop
                      autoplay
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section variants={fadeUp} className="relative pb-8">
              <SectionGlow position="left" />

              <div className="relative z-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map((item) => (
                  <GlassCard key={item.label} className="p-5 md:p-6">
                    <p className="font-[var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
                      {item.value}
                    </p>
                  </GlassCard>
                ))}
              </div>
            </motion.section>

            <motion.section variants={fadeUp} className="relative pb-8">
              <div className="grid gap-6 lg:grid-cols-2">
                <GlassCard className="p-6 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="mt-0 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white md:text-3xl">
                        Latest review
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        See the newest customer feedback at a glance.
                      </p>
                    </div>

                    <Link
                      href="/business/reviews"
                      className="hidden items-center gap-2 font-[var(--font-outfit)] text-sm font-semibold text-blue-600 dark:text-blue-300 md:inline-flex"
                    >
                      Open reviews <FaArrowRight className="text-xs" />
                    </Link>
                  </div>

                  {latestReview ? (
                    <div className="mt-7">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.22)]">
                          {(latestReview.user_name || 'C').charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h3 className="font-[var(--font-outfit)] text-lg font-semibold text-slate-900 dark:text-white">
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
                              {latestReview.created_at
                                ? new Date(latestReview.created_at).toLocaleDateString()
                                : 'No date'}
                            </span>
                          </div>

                          <p className="mt-4 text-[15px] leading-8 text-slate-600 dark:text-slate-400">
                            {truncateText(latestReview.text || '', 260)}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/business/reviews"
                        className="mt-6 inline-flex items-center gap-2 font-[var(--font-outfit)] text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 md:hidden"
                      >
                        Open reviews <FaArrowRight className="text-xs" />
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-7 rounded-3xl border border-blue-500/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                      <p className="text-[15px] leading-7 text-slate-600 dark:text-slate-400">
                        No reviews yet. New customer feedback will show here.
                      </p>
                    </div>
                  )}
                </GlassCard>

                <GlassCard className="p-6 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="mt-0 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white md:text-3xl">
                        Active deals
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Keep your page feeling current with live offers.
                      </p>
                    </div>

                    <Link
                      href="/business/deals"
                      className="hidden items-center gap-2 font-[var(--font-outfit)] text-sm font-semibold text-blue-600 dark:text-blue-300 md:inline-flex"
                    >
                      Manage deals <FaArrowRight className="text-xs" />
                    </Link>
                  </div>

                  <div className="mt-7 space-y-4">
                    {activeDeals.length > 0 ? (
                      activeDeals.slice(0, 2).map((deal) => (
                        <div
                          key={deal.id}
                          className="rounded-3xl border border-blue-500/10 bg-white/72 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-white/[0.03]"
                        >
                          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-[var(--font-outfit)] text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700 dark:text-blue-300">
                            <FaTag className="text-[10px]" />
                            Live offer
                          </div>

                          <h3 className="font-[var(--font-outfit)] text-lg font-semibold text-slate-900 dark:text-white">
                            {deal.title || 'Untitled deal'}
                          </h3>

                          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                            {truncateText(deal.description || 'No description provided.', 120)}
                          </p>

                          {deal.expiry_date && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <FaClock size={11} />
                              Ends {new Date(deal.expiry_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-blue-500/10 bg-white/72 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                        <p className="text-[15px] leading-7 text-slate-600 dark:text-slate-400">
                          No active deals right now.
                        </p>

                        <Link
                          href="/business/deals"
                          className="mt-4 inline-flex items-center gap-2 font-[var(--font-outfit)] text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          Create your first deal <FaArrowRight className="text-xs" />
                        </Link>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            </motion.section>

            <motion.section variants={fadeUp} className="relative pb-12">
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <GlassCard className="p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="mt-0 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
                        Review activity
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Just enough detail to spot momentum without clutter.
                      </p>
                    </div>

                    <FaChartLine className="mt-1 text-blue-500" />
                  </div>

                  <div className="mt-6 h-72">
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
                </GlassCard>

                <GlassCard className="p-6 md:p-7">
                  <h2 className="mt-0 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
                    Keep your page active
                  </h2>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    A few focused updates go further than lots of extra content.
                  </p>

                  <div className="mt-6 space-y-3">
                    <Link
                      href="/business/profile"
                      className="flex items-center justify-between rounded-2xl border border-blue-500/15 bg-white/70 px-4 py-4 font-[var(--font-outfit)] text-sm font-semibold text-slate-900 transition-colors hover:border-blue-500/35 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]"
                    >
                      <span>Update profile</span>
                      <FaPen className="text-xs text-blue-600 dark:text-blue-300" />
                    </Link>

                    <Link
                      href="/business/reviews"
                      className="flex items-center justify-between rounded-2xl border border-blue-500/15 bg-white/70 px-4 py-4 font-[var(--font-outfit)] text-sm font-semibold text-slate-900 transition-colors hover:border-blue-500/35 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]"
                    >
                      <span>Review feedback</span>
                      <FaCommentDots className="text-xs text-blue-600 dark:text-blue-300" />
                    </Link>

                    <Link
                      href="/business/deals"
                      className="flex items-center justify-between rounded-2xl border border-blue-500/15 bg-white/70 px-4 py-4 font-[var(--font-outfit)] text-sm font-semibold text-slate-900 transition-colors hover:border-blue-500/35 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]"
                    >
                      <span>Manage deals</span>
                      <FaTag className="text-xs text-blue-600 dark:text-blue-300" />
                    </Link>
                  </div>

                  <div className="mt-6 rounded-2xl border border-blue-500/15 bg-blue-500/6 p-4 dark:bg-blue-500/8">
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="mt-1 text-blue-500" />
                      <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                        Keep this page focused: one clear update, one active offer, and one recent review signal are usually enough.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.section>
          </motion.div>
        </div>
      </BusinessLayout>
    </main>
  )
}

// Truncate text to a max length with ellipsis
function truncateText(text, maxLength) {
  if (!text) return ''
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}
