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
import BusinessLayout from '../../../components/BusinessLayout.jsx'
import { useTheme } from '../../../context/ThemeContext'

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

const CleanWhiteBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-white overflow-hidden pointer-events-none">
      {/* Grid */}
      <div 
        className="absolute inset-0 opacity-[0.3]" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px), 
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `, 
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)'
        }} 
      />

      {/* Orange Beam */}
      <motion.div 
        animate={{ 
          x: [0, 20, 0],
          y: [0, -20, 0],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[150%] bg-gradient-to-tr from-orange-200/60 via-orange-100/30 to-transparent transform rotate-12 blur-[80px]"
      />

      {/* Pink Flow */}
      <motion.div 
        animate={{ 
          x: [0, -30, 0],
          y: [0, 20, 0],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -top-[20%] -right-[10%] w-[80%] h-[120%] bg-gradient-to-bl from-pink-200/50 via-rose-100/30 to-transparent transform -rotate-6 blur-[90px]"
      />

      {/* Data Stream */}
      <motion.div 
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scaleY: [1, 1.2, 1],
        }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-0 right-1/3 w-[1px] h-full bg-gradient-to-b from-transparent via-orange-300/50 to-transparent blur-[1px]"
      />

      {/* Glass Polish */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/40 to-white/80" />
    </div>
  )
}

const DarkBackground = () => {
  const time = useTime()
  const scale = useTransform(time, [0, 4000, 8000], [1, 1.2, 1])

  return (
    <div className="absolute inset-0 -z-20 pointer-events-none h-screen bg-black overflow-hidden">
      {/* Animated Gradient Orbs */}
      <motion.div 
        style={{ scale }} 
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tl from-orange-500/20 to-pink-600/20 rounded-full blur-[150px]" 
      />

      <motion.div
        className="absolute top-20 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-orange-500/15 to-pink-500/15 rounded-full blur-[120px]"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-gradient-to-tl from-pink-500/10 to-orange-500/10 rounded-full blur-[120px]"
        animate={{
          opacity: [0.2, 0.5, 0.2],
          x: [0, -40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  )
}

const GridBackground = ({ isDark }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {isDark ? (
        <DarkBackground />
      ) : (
        <CleanWhiteBackground />
      )}
    </div>
  )
}

export default function BusinessDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { isDark } = useTheme()
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
            Number(star) >= 4 ? '#10b981' : Number(star) === 3 ? '#f59e0b' : '#ef4444'
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
      <div className={`h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center transition-colors duration-300`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-12 h-12 border-3 ${isDark ? 'border-orange-500/30 border-t-orange-500' : 'border-orange-300/50 border-t-orange-500'} rounded-full`}
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

  const lastMonthReviews = reviews.filter(r => {
    if (!r.created_at) return false
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return new Date(r.created_at) >= monthAgo
  }).length

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
    <BusinessLayout>
      {/* Premium Background */}
      <div className={`fixed inset-0 -z-20 pointer-events-none h-screen transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <GridBackground isDark={isDark} />
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-8 pb-20 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* WELCOME SECTION */}
          <motion.div
            variants={itemVariants}
            className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div>
              <h1 className={`text-4xl md:text-5xl font-black mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getGreeting()},{' '}
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  {businessName}
                </span>
              </h1>
              <p className={`text-lg transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Track your business performance in real-time</p>
            </div>
            <a
              href={`/business/${businessId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border transition-all backdrop-blur-xl w-fit ${
                isDark 
                  ? 'bg-gradient-to-r from-orange-500/10 to-pink-500/10 hover:from-orange-500/20 hover:to-pink-500/20 text-orange-300 border-orange-500/30 hover:border-orange-500/60' 
                  : 'bg-gradient-to-r from-orange-100 to-pink-100 hover:from-orange-200 hover:to-pink-200 text-orange-700 border-orange-300 hover:border-orange-400 shadow-md hover:shadow-lg'
              }`}
            >
              <FaEye size={16} />
              View Public Profile
            </a>
          </motion.div>

          {/* KEY METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Average Rating */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              className={`group relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border transition-all shadow-lg ${
                isDark
                  ? 'bg-white/10 border-orange-500/20 hover:border-orange-500/50'
                  : 'bg-gradient-to-br from-orange-50 to-pink-50 border-orange-300/50 hover:border-orange-400/70'
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full group-hover:opacity-100 transition-all ${
                isDark ? 'bg-orange-500/10 group-hover:bg-orange-500/20' : 'bg-orange-300/20 group-hover:bg-orange-400/30'
              }`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-orange-700'
                  }`}>
                    Average Rating
                  </p>
                  <div className={`p-3 rounded-lg border transition-colors duration-300 ${
                    isDark
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                      : 'bg-orange-200 text-orange-700 border-orange-300'
                  }`}>
                    <FaStar size={18} />
                  </div>
                </div>
                <p className={`text-5xl font-black mb-1 transition-colors duration-300 ${isDark ? 'text-white' : 'text-orange-900'}`}>
                  {avgRating.toFixed(1)}
                </p>
                <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-orange-700/70'}`}>Out of 5.0 stars</p>
              </div>
            </motion.div>

            {/* Total Reviews */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              className={`group relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border transition-all shadow-lg ${
                isDark
                  ? 'bg-white/10 border-pink-500/20 hover:border-pink-500/50'
                  : 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-300/50 hover:border-pink-400/70'
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full group-hover:opacity-100 transition-all ${
                isDark ? 'bg-pink-500/10 group-hover:bg-pink-500/20' : 'bg-pink-300/20 group-hover:bg-pink-400/30'
              }`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-pink-700'
                  }`}>
                    Total Reviews
                  </p>
                  <div className={`p-3 rounded-lg border transition-colors duration-300 ${
                    isDark
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                      : 'bg-pink-200 text-pink-700 border-pink-300'
                  }`}>
                    <FaCommentDots size={18} />
                  </div>
                </div>
                <p className={`text-5xl font-black mb-1 transition-colors duration-300 ${isDark ? 'text-white' : 'text-pink-900'}`}>{totalReviews}</p>
                <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-pink-700/70'}`}>{lastMonthReviews} this month</p>
              </div>
            </motion.div>

            {/* Active Deals */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              className={`group relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border transition-all shadow-lg ${
                isDark
                  ? 'bg-white/10 border-purple-500/20 hover:border-purple-500/50'
                  : 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-300/50 hover:border-purple-400/70'
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full group-hover:opacity-100 transition-all ${
                isDark ? 'bg-purple-500/10 group-hover:bg-purple-500/20' : 'bg-purple-300/20 group-hover:bg-purple-400/30'
              }`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-purple-700'
                  }`}>
                    Active Deals
                  </p>
                  <div className={`p-3 rounded-lg border transition-colors duration-300 ${
                    isDark
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-purple-200 text-purple-700 border-purple-300'
                  }`}>
                    <FaTag size={18} />
                  </div>
                </div>
                <p className={`text-5xl font-black mb-1 transition-colors duration-300 ${isDark ? 'text-white' : 'text-purple-900'}`}>{activeDealCount}</p>
                <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-purple-700/70'}`}>
                  <Link 
                    href="/business/deals" 
                    className={`font-semibold transition-colors ${isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'}`}
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
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              className={`group relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border transition-all shadow-lg ${
                isDark
                  ? 'bg-white/10 border-green-500/20 hover:border-green-500/50'
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300/50 hover:border-green-400/70'
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full group-hover:opacity-100 transition-all ${
                isDark ? 'bg-green-500/10 group-hover:bg-green-500/20' : 'bg-green-300/20 group-hover:bg-green-400/30'
              }`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-green-700'
                  }`}>
                    Positive 4-5★
                  </p>
                  <div className={`p-3 rounded-lg border transition-colors duration-300 ${
                    isDark
                      ? 'bg-green-500/20 text-green-300 border-green-500/40'
                      : 'bg-green-200 text-green-700 border-green-300'
                  }`}>
                    <FaArrowUp size={18} />
                  </div>
                </div>
                <p className={`text-5xl font-black mb-1 transition-colors duration-300 ${isDark ? 'text-white' : 'text-green-900'}`}>{positiveReviews}</p>
                <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-green-700/70'}`}>
                  {totalReviews > 0 ? `${Math.round((positiveReviews / totalReviews) * 100)}%` : '0%'} of all reviews
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
              className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-6 group transition-all shadow-lg ${
                isDark
                  ? 'bg-white/10 border-orange-500/20 hover:border-orange-500/50'
                  : 'bg-gradient-to-br from-orange-50/70 to-pink-50/70 border-orange-300/50 hover:border-orange-400/70'
              }`}
            >
              <div className={`absolute -right-20 -top-20 w-60 h-60 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                isDark ? 'bg-orange-500/10' : 'bg-orange-300/20'
              }`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`font-bold text-lg transition-colors duration-300 ${isDark ? 'text-white' : 'text-orange-900'}`}>Review Trend</h2>
                  <span className={`text-xs flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-orange-700'}`}>
                    <FaClock size={12} /> Last 7 Days
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reviewTrendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                      />
                      <XAxis
                        dataKey="date"
                        stroke={isDark ? "#999" : "#666"}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={isDark ? "#999" : "#666"}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#111' : '#fff',
                          border: isDark ? '1px solid #333' : '1px solid #e5e7eb',
                          borderRadius: '12px',
                          color: isDark ? '#fff' : '#111'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="reviews"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 7 }}
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
              className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-6 group transition-all shadow-lg ${
                isDark
                  ? 'bg-white/10 border-pink-500/20 hover:border-pink-500/50'
                  : 'bg-gradient-to-br from-pink-50/70 to-rose-50/70 border-pink-300/50 hover:border-pink-400/70'
              }`}
            >
              <div className={`absolute -left-20 -bottom-20 w-60 h-60 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                isDark ? 'bg-pink-500/10' : 'bg-pink-300/20'
              }`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`font-bold text-lg transition-colors duration-300 ${isDark ? 'text-white' : 'text-pink-900'}`}>Rating Distribution</h2>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors duration-300 ${
                    isDark
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                      : 'bg-orange-200 text-orange-700 border-orange-300'
                  }`}>
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
                        stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke={isDark ? "#999" : "#666"}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={isDark ? "#999" : "#666"}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#111' : '#fff',
                          border: isDark ? '1px solid #333' : '1px solid #e5e7eb',
                          borderRadius: '12px',
                          color: isDark ? '#fff' : '#111'
                        }}
                        cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={45}>
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
            className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-6 group transition-all shadow-lg ${
              isDark
                ? 'bg-white/10 border-purple-500/20 hover:border-purple-500/50'
                : 'bg-gradient-to-br from-purple-50/70 to-violet-50/70 border-purple-300/50 hover:border-purple-400/70'
            }`}
          >
            <div className={`absolute -right-16 -bottom-16 w-48 h-48 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
              isDark ? 'bg-purple-500/10' : 'bg-purple-300/20'
            }`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`font-bold text-lg transition-colors duration-300 ${isDark ? 'text-white' : 'text-purple-900'}`}>Latest Review</h2>
                <Link
                  href="/business/reviews"
                  className={`text-xs font-bold transition-colors flex items-center gap-2 ${
                    isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'
                  }`}
                >
                  View All <FaChevronRight size={12} />
                </Link>
              </div>
              {latestReview ? (
                <div className={`flex items-start gap-4 p-5 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                    : 'bg-white/70 border-orange-200 hover:border-orange-300'
                }`}>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(latestReview.user_name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <h3 className={`font-bold text-base transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {latestReview.user_name || 'Customer'}
                        </h3>
                        <div className="flex text-yellow-400 text-sm mt-2 gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              size={14}
                              className={
                                i < (latestReview.rating || 0) ? 'text-yellow-400' : isDark ? 'text-slate-700' : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <span className={`text-xs whitespace-nowrap transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                        {new Date(latestReview.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {truncateText(latestReview.text || '', 200)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaCommentDots className={`text-4xl mx-auto mb-3 transition-colors duration-300 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>No reviews yet</p>
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