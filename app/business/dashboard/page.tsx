'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Inter, Outfit } from 'next/font/google'
import {
  FaStar, FaEye, FaPen, FaClock, FaArrowRight, FaTag,
  FaCommentDots, FaCheckCircle, FaChartLine, FaExclamationTriangle,
  FaReply, FaThumbsUp, FaMinus, FaArrowUp, FaArrowDown,
} from 'react-icons/fa'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie,
} from 'recharts'
import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout'
import { useTheme } from '../../../context/ThemeContext'
import AIInsightsCard from '../../../components/AIInsightsCard'

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  { ssr: false }
)

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}
const staggerWrap = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
}

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'is','it','was','this','that','they','their','them','i','we','you','he',
  'she','my','your','our','its','be','been','have','has','had','do','did',
  'will','would','could','should','not','are','were','from','by','as','so',
  'if','up','out','no','very','just','also','got','get','about','more',
])

function extractKeywords(reviews, topN = 10) {
  const freq: Record<string, number> = {}
  reviews.forEach((r) => {
    const words = (r.text || '')
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    words.forEach((w) => { freq[w] = (freq[w] || 0) + 1 })
  })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }))
}

function buildMonthlyTrend(reviews) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    const count = reviews.filter((r) => {
      if (!r.created_at) return false
      const rd = new Date(r.created_at)
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
    }).length
    return { month: label, reviews: count }
  })
}

function buildDayOfWeekData(reviews) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const counts = Array(7).fill(0)
  reviews.forEach((r) => {
    if (r.created_at) counts[new Date(r.created_at).getDay()]++
  })
  return days.map((day, i) => ({ day, reviews: counts[i] }))
}

function buildRatingData(reviews) {
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))
}

function avatarColor(name) {
  const palettes = [
    { bg: '#E1F5EE', color: '#0F6E56' },
    { bg: '#EEEDFE', color: '#3C3489' },
    { bg: '#FAEEDA', color: '#633806' },
    { bg: '#FAECE7', color: '#712B13' },
    { bg: '#E6F1FB', color: '#0C447C' },
  ]
  let hash = 0
  for (const c of (name || '')) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return palettes[Math.abs(hash) % palettes.length]
}

function truncateText(text, max) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '...' : text
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}


function HeroBackground({ isDark }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute inset-0 ${isDark ? 'bg-[#081120]' : 'bg-gradient-to-b from-white via-slate-50 to-blue-50'}`} />
      <motion.div
        animate={{ y: [0, -16, 0], scale: [1, 1.05, 1], opacity: [0.24, 0.42, 0.24] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute left-1/2 top-[5%] h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-[140px] ${isDark ? 'bg-blue-500/16' : 'bg-blue-200/75'}`}
      />
      <motion.div
        animate={{ opacity: [0.12, 0.3, 0.12], scaleY: [1, 1.12, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[12%] top-[14%] h-32 w-[3px] rounded-full bg-blue-400/70 blur-sm"
      />
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-transparent via-transparent to-[#081120]' : 'bg-gradient-to-b from-transparent via-transparent to-white'}`} />
    </div>
  )
}

function GlassCard({ children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-[30px] border border-blue-500/15 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)] ${className}`}>
      {children}
    </div>
  )
}

function StatCard({ label, value, delta, deltaType, icon: Icon }) {
  const deltaColor =
    deltaType === 'up'   ? 'text-emerald-500' :
    deltaType === 'down' ? 'text-red-400'      : 'text-slate-500 dark:text-slate-400'
  const DeltaIcon =
    deltaType === 'up'   ? FaArrowUp :
    deltaType === 'down' ? FaArrowDown : FaMinus
  return (
    <GlassCard className="p-5">
      <p className="font-[var(--font-outfit)] text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        {Icon && <Icon className="text-blue-500" />}
        {label}
      </p>
      <p className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
        {value}
      </p>
      {delta && (
        <p className={`mt-2 flex items-center gap-1 text-xs ${deltaColor}`}>
          <DeltaIcon className="text-[10px]" />
          {delta}
        </p>
      )}
    </GlassCard>
  )
}

const RATING_COLORS = { 5: '#22c55e', 4: '#86efac', 3: '#fbbf24', 2: '#fb923c', 1: '#f87171' }

function RatingBar({ star, count, max }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-3 text-right text-xs text-slate-500 dark:text-slate-400">{star}</span>
      <FaStar size={10} style={{ color: RATING_COLORS[star] }} />
      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: RATING_COLORS[star] }}
        />
      </div>
      <span className="w-6 text-xs text-slate-500 dark:text-slate-400">{count}</span>
    </div>
  )
}

function SentimentDonut({ positive, neutral, negative }) {
  const data = [
    { name: 'Positive', value: positive, color: '#22c55e' },
    { name: 'Neutral',  value: neutral,  color: '#94a3b8' },
    { name: 'Negative', value: negative, color: '#f87171' },
  ]
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28 shrink-0">
        <PieChart width={112} height={112}>
          <Pie data={data} cx={50} cy={50} innerRadius={34} outerRadius={50}
            dataKey="value" paddingAngle={2} startAngle={90} endAngle={-270}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-[var(--font-outfit)] text-xl font-semibold text-slate-900 dark:text-white">{positive}%</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">positive</span>
        </div>
      </div>
      <div className="space-y-3 text-sm">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-slate-600 dark:text-slate-400 w-16">{d.name}</span>
            <span className="font-semibold text-slate-900 dark:text-white">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function KeywordPill({ word, count, max }) {
  const intensity = count / max
  const cls =
    intensity > 0.6
      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/25'
      : intensity > 0.3
      ? 'bg-blue-500/8 text-blue-600 dark:text-blue-400 border-blue-500/15'
      : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border-transparent'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cls}`}>
      {word}
      <span className="opacity-50">{count}</span>
    </span>
  )
}

function InsightRow({ icon: Icon, iconBg, iconColor, title, body }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-blue-500/10 dark:border-white/[0.06] last:border-0">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`text-sm ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-5">{body}</p>
      </div>
    </div>
  )
}

function DealRow({ deal }) {
  const daysLeft = deal.expiry_date
    ? Math.ceil((new Date(deal.expiry_date).getTime() - Date.now()) / 86400000)
    : null
  const badge =
    daysLeft === null
      ? { label: 'No expiry',        cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' }
      : daysLeft <= 7
      ? { label: `${daysLeft}d left`, cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' }
      : { label: `${daysLeft}d left`, cls: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' }
  return (
    <div className="flex items-center justify-between py-3 border-b border-blue-500/10 dark:border-white/[0.06] last:border-0">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
          {deal.title || 'Untitled deal'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{deal.click_count ?? 0} clicks</p>
      </div>
      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
    </div>
  )
}

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      backgroundColor: isDark ? '#0d1424' : '#ffffff',
      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(59,130,246,0.18)',
      borderRadius: 14,
      padding: '8px 14px',
      color: isDark ? '#fff' : '#0f172a',
      fontSize: 12,
    }}>
      <p style={{ marginBottom: 2, opacity: 0.6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontWeight: 600 }}>{p.value}</p>
      ))}
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

  useEffect(() => {
    const loadData = async () => {
      if (authLoading || !user) return
      try {
        setLoading(true)
        const { data: biz } = await supabase
          .from('businesses').select('*').eq('owner_id', user.id).single()
        if (!biz) { router.push('/business/profile'); return }
        setBusinessData(biz)

        const { data: reviewRows } = await supabase
          .from('reviews').select('*').eq('business_id', biz.id)
          .order('created_at', { ascending: false })
        setReviews(reviewRows || [])

        const { data: dealRows } = await supabase
          .from('deals').select('*').eq('business_id', biz.id)
          .order('created_at', { ascending: false })
        setDeals(dealRows || [])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [authLoading, user, router, supabase])

  const totalReviews    = reviews.length
  const avgRating       = totalReviews > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : '0.0'

  const positiveReviews = reviews.filter((r) => (r.rating || 0) >= 4).length
  const neutralReviews  = reviews.filter((r) => (r.rating || 0) === 3).length
  const negativeReviews = reviews.filter((r) => (r.rating || 0) <= 2).length
  const positiveRate    = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0
  const neutralRate     = totalReviews > 0 ? Math.round((neutralReviews  / totalReviews) * 100) : 0
  const negativeRate    = totalReviews > 0 ? Math.round((negativeReviews / totalReviews) * 100) : 0

  const activeDeals = deals.filter((d) => {
    if (!d.expiry_date) return d.is_active !== false
    return new Date() <= new Date(d.expiry_date) && d.is_active !== false
  })

  const unansweredCount = reviews.filter((r) => !r.replied_at).length

  const expiringDeals = activeDeals.filter((d) => {
    if (!d.expiry_date) return false
    const days = Math.ceil((new Date(d.expiry_date).getTime() - Date.now()) / 86400000)
    return days <= 7 && days >= 0
  })

  const nowDate         = new Date()
  const thisMonthStart  = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1)
  const lastMonthStart  = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, 1)
  const thisMonthReviews = reviews.filter((r) => r.created_at && new Date(r.created_at) >= thisMonthStart).length
  const lastMonthReviews = reviews.filter((r) => {
    if (!r.created_at) return false
    const d = new Date(r.created_at)
    return d >= lastMonthStart && d < thisMonthStart
  }).length
  const reviewDelta = thisMonthReviews - lastMonthReviews

  const PROFILE_FIELDS = [
    { key: 'name',        label: 'Business name' },
    { key: 'description', label: 'Description' },
    { key: 'category',    label: 'Category' },
    { key: 'address',     label: 'Address' },
    { key: 'phone',       label: 'Phone number' },
    { key: 'image_url',   label: 'Cover photo' },
  ]
  const missingFields     = PROFILE_FIELDS.filter((f) => !businessData?.[f.key]).map((f) => f.label)
  const profileCompletion = Math.round(((PROFILE_FIELDS.length - missingFields.length) / PROFILE_FIELDS.length) * 100)

  const monthlyTrend = useMemo(() => buildMonthlyTrend(reviews), [reviews])
  const dowData      = useMemo(() => buildDayOfWeekData(reviews), [reviews])
  const ratingData   = useMemo(() => buildRatingData(reviews),    [reviews])
  const keywords     = useMemo(() => extractKeywords(reviews),    [reviews])
  const maxRating    = ratingData.reduce((m, d) => Math.max(m, d.count), 0)
  const maxKeyword   = keywords[0]?.count || 1
  const maxDow       = Math.max(...dowData.map((d) => d.reviews), 1)

  const latestReview  = reviews[0] || null
  const businessName  = businessData?.name || 'Your Business'
  const businessId    = businessData?.id

  let dashboardSummary = 'Your page is live and ready for quick updates.'
  if (totalReviews === 0 && activeDeals.length === 0)
    dashboardSummary = 'Complete your profile and add a deal to make the page feel active.'
  else if (totalReviews > 0 && positiveRate >= 80)
    dashboardSummary = `${thisMonthReviews} reviews this month — your page is building solid momentum.`
  else if (totalReviews > 0 && positiveRate < 60)
    dashboardSummary = 'Feedback is more mixed. Focus on reviews and offers to improve your score.'
  else
    dashboardSummary = 'Your page has activity — a few focused updates could make it feel even stronger.'

  const axisColor = isDark ? '#94a3b8' : '#64748b'
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(59,130,246,0.08)'
  const ttStyle   = {
    backgroundColor: isDark ? '#0d1424' : '#ffffff',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(59,130,246,0.18)',
    borderRadius: 16,
    color: isDark ? '#fff' : '#0f172a',
  }

  function BoundTooltip(props) {
    return <CustomTooltip {...props} isDark={isDark} />
  }

  if (loading) {
    return (
      <div
        className={`${inter.variable} ${outfit.variable} flex h-screen items-center justify-center ${isDark ? 'bg-[#081120]' : 'bg-white'}`}
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.7, repeat: Infinity, ease: 'linear' }}
          className={`h-12 w-12 rounded-full border-[3px] ${isDark ? 'border-blue-500/20 border-t-blue-300' : 'border-blue-200 border-t-blue-600'}`}
        />
      </div>
    )
  }

  return (
    <main
      className={`${inter.variable} ${outfit.variable} relative min-h-screen overflow-x-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-[#081120] dark:text-white`}
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      <HeroBackground isDark={isDark} />

      <BusinessLayout>
        <div className="relative z-10">
          <motion.div
            variants={staggerWrap} initial="hidden" animate="visible"
            className="mx-auto max-w-7xl px-6 pb-24 pt-8 lg:px-8 space-y-10"
          >
            <motion.section variants={fadeUp}>
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
                      href={`/business/${businessId}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-500/20 bg-white px-5 py-3 font-[var(--font-outfit)] text-sm font-semibold text-slate-900 hover:border-blue-500/40 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.06]"
                    >
                      <FaEye className="text-xs" /> View public profile
                    </a>
                    <Link
                      href="/business/profile"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-[var(--font-outfit)] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
                    >
                      <FaPen className="text-xs" /> Edit business
                    </Link>
                  </div>
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="h-[260px] w-[260px] md:h-[340px] md:w-[340px]">
                    <DotLottieReact
                      src="https://lottie.host/4e4e53d8-bbfd-4a17-84b5-77bae5c846a5/ObgSrdv2ck.lottie"
                      loop autoplay
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* <motion.section variants={fadeUp}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Avg rating"    icon={FaStar}          value={avgRating}
                  delta={reviewDelta !== 0 ? `${reviewDelta > 0 ? '+' : ''}${reviewDelta} vs last month` : 'No change'}
                  deltaType={reviewDelta > 0 ? 'up' : reviewDelta < 0 ? 'down' : 'neutral'} />
                <StatCard label="Total reviews" icon={FaCommentDots}   value={totalReviews}
                  delta={`${thisMonthReviews} this month`}
                  deltaType={thisMonthReviews > 0 ? 'up' : 'neutral'} />
                <StatCard label="Positive rate" icon={FaThumbsUp}      value={`${positiveRate}%`}
                  delta={positiveRate >= 80 ? 'Strong sentiment' : positiveRate >= 60 ? 'Room to improve' : 'Needs attention'}
                  deltaType={positiveRate >= 80 ? 'up' : positiveRate >= 60 ? 'neutral' : 'down'} />
                <StatCard label="Active deals"  icon={FaTag}           value={activeDeals.length}
                  delta={expiringDeals.length > 0 ? `${expiringDeals.length} expiring soon` : 'All good'}
                  deltaType={expiringDeals.length > 0 ? 'down' : 'neutral'} />
                <StatCard label="Expiring deals" icon={FaClock} value={expiringDeals.length}  delta={expiringDeals.length > 0 ? 'Need attention' : 'No deals expiring'} deltaType={expiringDeals.length > 0 ? 'down' : 'up'} />
                <StatCard label="This month"    icon={FaChartLine}     value={thisMonthReviews}
                  delta={reviewDelta > 0 ? `+${reviewDelta} vs last month` : reviewDelta < 0 ? `${reviewDelta} vs last month` : 'Same as last month'}
                  deltaType={reviewDelta > 0 ? 'up' : reviewDelta < 0 ? 'down' : 'neutral'} />
                <StatCard label="Total deals" icon={FaTag} value={deals.length} delta="Active + expired deals" deltaType="neutral"/>
                <StatCard label="Profile done"  icon={FaCheckCircle}   value={`${profileCompletion}%`}
                  delta={missingFields.length > 0 ? `${missingFields.length} fields missing` : 'Complete!'}
                  deltaType={profileCompletion === 100 ? 'up' : profileCompletion >= 70 ? 'neutral' : 'down'} />
              </div>
            </motion.section> */}

            <motion.section variants={fadeUp}>
  <AIInsightsCard
    reviews={reviews}
    deals={deals}
    profile={businessData}
    stats={{
      profileCompletion,
      missingFields,
      totalReviews,
      avgRating,
      positiveRate,
      thisMonthReviews,
      lastMonthReviews,
      unansweredCount,
      activeDeals: activeDeals.length,
      expiringDeals: expiringDeals.length,
    }}
  />
</motion.section>

            <motion.section variants={fadeUp}>
              <div className="grid gap-6 lg:grid-cols-2">

                <GlassCard className="p-6 md:p-7">
                  <h2 className="font-[var(--font-outfit)] text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    Monthly review trend
                  </h2>
                  <p className="mt-1 mb-5 text-sm text-slate-500 dark:text-slate-400">New reviews each month over 6 months</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrend}>
                        <defs>
                          <linearGradient id="monthFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="month" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<BoundTooltip />} contentStyle={ttStyle} />
                        <Area type="monotone" dataKey="reviews" stroke="#2563eb" strokeWidth={2.5}
                          fillOpacity={1} fill="url(#monthFill)" dot={{ r: 3, fill: '#2563eb' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                 <GlassCard className="p-6 md:p-7">
                  <h2 className="font-[var(--font-outfit)] text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    Sentiment split
                  </h2>
                  <p className="mt-1 mb-5 text-sm text-slate-500 dark:text-slate-400">Positive ≥ 4 stars · neutral = 3 · negative ≤ 2</p>
                  {totalReviews > 0 ? (
                    <SentimentDonut positive={positiveRate} neutral={neutralRate} negative={negativeRate} />
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet.</p>
                  )}
                  {totalReviews > 0 && (
                    <div className="mt-6 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4">
                      <p className="text-xs leading-6 text-slate-600 dark:text-slate-400">
                        {positiveRate >= 80
                          ? 'Great sentiment! Over 80% of customers are satisfied.'
                          : positiveRate >= 60
                          ? 'Decent sentiment — responding to negative reviews can push this higher.'
                          : 'Sentiment needs attention. Engage with unhappy customers to understand what\'s going wrong.'}
                      </p>
                    </div>
                  )}
                </GlassCard>

              </div>
            </motion.section>

          </motion.div>
        </div>
      </BusinessLayout>
    </main>
  )
}