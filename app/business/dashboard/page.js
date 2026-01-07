'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useTime, useTransform } from 'framer-motion'
import {
  FaStar,
  FaCommentDots,
  FaArrowUp,
  FaClock,
  FaEye,
  FaChevronRight,
  FaTag,
  FaFire
} from 'react-icons/fa'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

export default function BusinessDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const time = useTime()
  const scale = useTransform(time, [0, 4000, 8000], [1, 1.2, 1])

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
        const { data: businessDataArray } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .single()

        if (!businessDataArray) {
          router.push('/business/profile')
          return
        }

        setBusinessData(businessDataArray)

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('business_id', businessDataArray.id)
          .order('created_at', { ascending: false })

        const fetchedReviews = reviewsData || []
        setReviews(fetchedReviews)

        // FETCH DEALS
        const { data: dealsData } = await supabase
          .from('deals')
          .select('*')
          .eq('business_id', businessDataArray.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        const fetchedDeals = dealsData || []
        setDeals(fetchedDeals)

        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        fetchedReviews.forEach(r => {
          const rating = Math.round(r.rating || 0)
          if (counts[rating] !== undefined) counts[rating]++
        })
        const barData = Object.keys(counts).map(star => ({
          name: `${star}★`,
          count: counts[Number(star)],
          color:
            Number(star) >= 4 ? '#22C55E' : Number(star) === 3 ? '#FBBF24' : '#EF4444'
        }))
        setRatingBarData(barData)

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return d.toISOString().split('T')[0]
        })

        const trendData = last7Days.map(date => {
          const count = fetchedReviews.filter(
            r => r.created_at && r.created_at.startsWith(date)
          ).length
          return {
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            reviews: count
          }
        })
        setReviewTrendData(trendData)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [authLoading, user, router, supabase])

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center transition-colors duration-300">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-3 border-purple-500/30 border-t-purple-500 dark:border-purple-500/30 dark:border-t-purple-500 rounded-full"
        />
      </div>
    )
  }

  const businessName = businessData?.name || 'Your Business'
  const businessId = businessData?.id
  const totalReviews = reviews.length
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
      : 0
  const latestReview = reviews[0]

  const positiveReviews = reviews.filter(r => (r.rating || 0) >= 4).length
  const negativeReviews = reviews.filter(r => (r.rating || 0) <= 2).length

  const thisWeekReviews = reviews.filter(r => {
    if (!r.created_at) return false
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(r.created_at) >= weekAgo
  }).length

  const lastMonthReviews = reviews.filter(r => {
    if (!r.created_at) return false
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return new Date(r.created_at) >= monthAgo
  }).length

  // CALCULATE ACTIVE DEALS
  const activeDealCount = deals.filter(deal => {
    if (!deal.expiry_date) return true
    return new Date() <= new Date(deal.expiry_date)
  }).length

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <BusinessLayout
      title="Business Dashboard"
      subtitle="Real-time business metrics"
      showTopBar={false}
    >
      {/* Premium Background - THEMED - FIXED: Added bg-gray-50 dark:bg-[#080808] */}
      <div className="fixed inset-0 -z-20 pointer-events-none h-screen bg-gray-50 dark:bg-[#080808] transition-colors duration-300">
        {/* Enhanced Animated Background */}
        <motion.div 
          style={{ scale }} 
          className="absolute -bottom-32 -right-32 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-gradient-to-tr from-orange-300/40 to-orange-500/40 dark:from-yellow-500/30 dark:to-orange-600/30 rounded-full blur-[120px]" 
        />

        {/* Grid Pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }}
          animate={{ backgroundPosition: ['0px 0px', '100px 100px'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-10 left-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-to-br from-blue-400/30 to-transparent dark:from-blue-600/20 dark:to-transparent rounded-full blur-[120px]"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div
          className="absolute bottom-0 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-to-tl from-purple-400/25 to-transparent dark:from-purple-600/15 dark:to-transparent rounded-full blur-[120px]"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Center Glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-orange-500/20 dark:from-yellow-500/10 dark:via-orange-500/10 dark:to-orange-600/10 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-8 pb-20 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* WELCOME SECTION */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                {getGreeting()},{' '}
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-yellow-300 bg-clip-text text-transparent">
                  {businessName}
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-500">Your real-time business overview</p>
            </div>
            <a
              href={`/business/${businessId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black/40 hover:bg-gray-100 dark:hover:bg-black/60 rounded-xl text-gray-700 dark:text-gray-200 font-bold text-sm border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer w-fit backdrop-blur-xl shadow-sm"
            >
              <FaEye size={14} />
              View Public Profile
            </a>
          </motion.div>

          {/* KEY METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Average Rating */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#111]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all group shadow-xl dark:shadow-none"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 blur-[60px] rounded-full group-hover:bg-yellow-500/20 transition-all duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.14em]">
                    Average Rating
                  </p>
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-xl text-yellow-600 dark:text-yellow-400">
                    <FaStar size={16} />
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">
                  {avgRating.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Out of 5.0</p>
              </div>
            </motion.div>

            {/* Total Reviews */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#111]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all group shadow-xl dark:shadow-none"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full group-hover:bg-purple-500/20 transition-all duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.14em]">
                    Total Reviews
                  </p>
                  <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400">
                    <FaCommentDots size={16} />
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{totalReviews}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{lastMonthReviews} this month</p>
              </div>
            </motion.div>

            {/* Active Deals */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#111]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all group shadow-xl dark:shadow-none"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full group-hover:bg-blue-500/20 transition-all duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.14em]">
                    Active Deals
                  </p>
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                    <FaTag size={16} />
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{activeDealCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  <Link 
                    href="/business/deals" 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Manage deals →
                  </Link>
                </p>
              </div>
            </motion.div>

            {/* Positive Reviews */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#111]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all group shadow-xl dark:shadow-none"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 blur-[60px] rounded-full group-hover:bg-green-500/20 transition-all duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.14em]">
                    Positive (4-5★)
                  </p>
                  <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-xl text-green-600 dark:text-green-400">
                    <FaArrowUp size={16} />
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{positiveReviews}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {totalReviews > 0 ? `${Math.round((positiveReviews / totalReviews) * 100)}%` : '0%'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Review Trend */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
              className="relative overflow-hidden bg-white dark:bg-[#111]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-[2rem] p-6 group transition-all shadow-xl dark:shadow-none"
            >
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/15 transition-all duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">Review Trend</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                    <FaClock size={12} /> Last 7 Days
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reviewTrendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0,0,0,0.05)"
                        className="dark:stroke-[rgba(255,255,255,0.05)]"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#999"
                        className="dark:stroke-[#666]"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#999"
                        className="dark:stroke-[#666]"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          color: '#111'
                        }}
                        wrapperClassName="dark:[&>div]:!bg-[#111] dark:[&>div]:!border-white/10 dark:[&>div]:!text-white"
                      />
                      <Line
                        type="monotone"
                        dataKey="reviews"
                        stroke="#a78bfa"
                        strokeWidth={3}
                        dot={{ fill: '#a78bfa', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Rating Distribution */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
              className="relative overflow-hidden bg-white dark:bg-[#111]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-[2rem] p-6 group transition-all shadow-xl dark:shadow-none"
            >
              <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-orange-500/10 blur-[80px] rounded-full group-hover:bg-orange-500/15 transition-all duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">Rating Distribution</h2>
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-bold">
                    {avgRating.toFixed(1)} avg
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ratingBarData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0,0,0,0.05)"
                        className="dark:stroke-[rgba(255,255,255,0.05)]"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#999"
                        className="dark:stroke-[#666]"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#999"
                        className="dark:stroke-[#666]"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          color: '#111'
                        }}
                        wrapperClassName="dark:[&>div]:!bg-[#111] dark:[&>div]:!border-white/10 dark:[&>div]:!text-white"
                        cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                        cursorClassName="dark:fill-[rgba(255,255,255,0.05)]"
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                        {ratingBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Latest Review Section */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden bg-white dark:bg-[#111]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 group transition-all shadow-xl dark:shadow-none"
          >
            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Latest Review</h2>
                <Link
                  href="/business/reviews"
                  className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-bold transition-colors flex items-center gap-1"
                >
                  View All <FaChevronRight size={10} />
                </Link>
              </div>
              {latestReview ? (
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(latestReview.user_name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {latestReview.user_name || 'Customer'}
                        </h3>
                        <div className="flex text-yellow-400 text-sm mt-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              size={12}
                              className={
                                i < (latestReview.rating || 0) ? '' : 'opacity-30'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(latestReview.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {truncateText(latestReview.text || '', 200)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaCommentDots className="text-gray-400 dark:text-gray-600 text-4xl mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-500 text-sm">No reviews yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </BusinessLayout>
  )
}

function truncateText(text, maxLength) {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}
