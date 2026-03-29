'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FaHeart,
  FaStar,
  FaMapMarkerAlt,
  FaPhone,
  FaArrowRight,
  FaClock,
  FaTag,
} from 'react-icons/fa'
import { createClient } from '../lib/supabase'

const shimmer = (w: number, h: number): string => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#151515" offset="20%" />
      <stop stop-color="#1f1f1f" offset="50%" />
      <stop stop-color="#151515" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#151515" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
</svg>`

const toBase64 = (str: string): string =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str)

const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23334155' width='400' height='300'/%3E%3Crect fill='%232563eb' x='0' y='0' width='400' height='4'/%3E%3Crect fill='%232563eb' x='0' y='296' width='400' height='4'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%232563eb' font-size='28' font-weight='bold' font-family='Arial, sans-serif'%3EBUSINESS%3C/text%3E%3Ctext x='200' y='170' text-anchor='middle' fill='%2394a3b8' font-size='14' font-family='Arial, sans-serif'%3ENo Image Available%3C/text%3E%3Ccircle cx='60' cy='60' r='30' fill='none' stroke='%232563eb' stroke-width='2'/%3E%3Ccircle cx='340' cy='240' r='25' fill='none' stroke='%232563eb' stroke-width='2'/%3E%3C/svg%3E`

const parseTime = (timeStr: string | null | undefined): Date | null => {
  if (!timeStr || typeof timeStr !== 'string') return null
  try {
    const trimmed = timeStr.trim()
    const [time, period] = trimmed.split(' ')

    if (!time || !period) return null

    const [hours, minutes] = time.split(':').map(Number)

    if (isNaN(hours) || isNaN(minutes)) return null

    const date = new Date()
    let finalHours = hours

    if (period.toUpperCase() === 'PM' && hours !== 12) {
      finalHours = hours + 12
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      finalHours = 0
    }

    date.setHours(finalHours, minutes, 0, 0)
    return date
  } catch (err) {
    return null
  }
}

const getBusinessStatus = (hours: string | null | undefined) => {
  if (!hours || typeof hours !== 'string') {
    return { isOpen: true, status: 'Open', nextStatus: '' }
  }

  const todayHours = hours.trim()

  if (todayHours.toLowerCase().includes('24 hours') || todayHours.toLowerCase() === 'open 24 hours') {
    return { isOpen: true, status: 'Open 24H', nextStatus: '' }
  }

  if (todayHours.toLowerCase() === 'closed') {
    return { isOpen: false, status: 'Closed', nextStatus: 'Closed today' }
  }

  if (!todayHours.includes(' - ')) {
    return { isOpen: true, status: 'Open', nextStatus: '' }
  }

  const timeParts = todayHours.split(' - ')
  if (timeParts.length !== 2) {
    return { isOpen: true, status: 'Open', nextStatus: '' }
  }

  try {
    const now = new Date()
    const openTime = parseTime(timeParts[0])
    const closeTime = parseTime(timeParts[1])

    if (!openTime || !closeTime) {
      return { isOpen: true, status: 'Open', nextStatus: '' }
    }

    const isOpen = now >= openTime && now < closeTime

    if (isOpen) {
      const minutesUntilClose = (closeTime.getTime() - now.getTime()) / (1000 * 60)
      const hoursUntilClose = Math.floor(minutesUntilClose / 60)
      const minsUntilClose = Math.floor(minutesUntilClose % 60)

      let closeText = ''
      if (hoursUntilClose > 0) {
        closeText = `${hoursUntilClose}h ${minsUntilClose}m`
      } else {
        closeText = `${minsUntilClose}m`
      }

      return {
        isOpen: true,
        status: 'Open',
        nextStatus: `Closes in ${closeText}`,
      }
    } else {
      return {
        isOpen: false,
        status: 'Closed',
        nextStatus: `Opens at ${timeParts[0]}`,
      }
    }
  } catch (err) {
    console.error('Error calculating business status:', err)
    return { isOpen: true, status: 'Open', nextStatus: '' }
  }
}

// HELPER FUNCTION TO CHECK IF DEAL IS EXPIRED
const isDealExpired = (expiryDate: string | null | undefined): boolean => {
  if (!expiryDate) return false
  const now = new Date()
  const expiry = new Date(expiryDate)
  return expiry < now
}

interface BusinessCardProps {
  business: any
  isSaved: boolean
  onSave: (id: string) => void | Promise<void>
  isTrending?: boolean
  viewMode?: 'grid' | 'list'
  index?: number
}

export default function BusinessCard({ business, isSaved, onSave, isTrending, viewMode = 'grid' }: BusinessCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [rating, setRating] = useState(parseFloat(business.rating || 0))
  const [reviewCount, setReviewCount] = useState(parseInt(business.review_count || 0))
  const [businessStatus, setBusinessStatus] = useState({ isOpen: true, status: 'Open', nextStatus: '' })
  const [hasDeal, setHasDeal] = useState(false)
  const [dealInfo, setDealInfo] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  const reviewText = reviewCount === 1 ? 'review' : 'reviews'

  // FETCH REAL REVIEWS FROM SUPABASE
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data: allReviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('business_id', business.id)

        if (allReviews && allReviews.length > 0) {
          const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0)
          const newAverage = totalRating / allReviews.length
          const newCount = allReviews.length

          setRating(newAverage)
          setReviewCount(newCount)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    }

    fetchReviews()
  }, [business.id, supabase])

  // FETCH DEALS FROM SUPABASE WITH EXPIRATION CHECK
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const { data: deals, error } = await supabase
          .from('deals')
          .select('id, title, discount_type, discount_value, is_active, expiry_date')
          .eq('business_id', business.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) {
          console.error('Error fetching deals:', error)
          setHasDeal(false)
          setDealInfo(null)
          return
        }

        if (deals && deals.length > 0) {
          const deal = deals[0]

          // CHECK IF DEAL HAS EXPIRED - USING EXPIRY_DATE
          if (isDealExpired(deal.expiry_date)) {
            setHasDeal(false)
            setDealInfo(null)
            return
          }

          // DEAL IS VALID, NOT EXPIRED, AND IS_ACTIVE = TRUE
          setHasDeal(true)
          setDealInfo(deal)
        } else {
          // NO ACTIVE DEALS FOUND
          setHasDeal(false)
          setDealInfo(null)
        }
      } catch (error) {
        console.error('Error fetching deals:', error)
        setHasDeal(false)
        setDealInfo(null)
      }
    }

    fetchDeals()

    // REFRESH DEALS EVERY MINUTE TO CHECK FOR EXPIRATION OR HIDDEN STATUS
    const interval = setInterval(fetchDeals, 60 * 1000)
    return () => clearInterval(interval)
  }, [business.id, supabase])

  // CHECK BUSINESS STATUS BASED ON HOURS
  useEffect(() => {
    const status = getBusinessStatus(business.hours)
    setBusinessStatus(status)

    // UPDATE STATUS EVERY MINUTE
    const interval = setInterval(() => {
      setBusinessStatus(getBusinessStatus(business.hours))
    }, 60000)

    return () => clearInterval(interval)
  }, [business.hours])

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    try {
      await onSave(business.id)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // NAVIGATE TO BUSINESS PAGE
  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push(`/business/${business.id}`)
  }

  const getDealLabel = () => {
    if (!dealInfo) return ''

    const typeLabels = {
      percentage: `${dealInfo.discount_value}% OFF`,
      fixed: `$${dealInfo.discount_value} OFF`,
      bogo: 'BUY ONE GET ONE',
      free: 'FREE ITEM'
    }

    return typeLabels[dealInfo.discount_type] || 'SPECIAL DEAL'
  }

  const getDealEmoji = () => {
    if (!dealInfo) return ''

    const emojis = {
      percentage: '📊',
      fixed: '💰',
      bogo: '🎁',
      free: '🎉'
    }

    return emojis[dealInfo.discount_type] || '✨'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className={`
        group relative rounded-2xl overflow-hidden
        border border-blue-500/12 dark:border-white/10
        bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl
        shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.30)]
        hover:border-blue-500/30 dark:hover:border-white/20
        transition-all duration-300
        ${viewMode === 'list' ? 'flex h-auto min-h-[320px]' : 'flex flex-col h-[400px]'}
      `}
    >
      {/* IMAGE CONTAINER */}
      <div className={`relative ${viewMode === 'list' ? 'w-80 h-80 flex-shrink-0' : 'h-56 w-full'} bg-slate-100 dark:bg-[#0a1020] overflow-hidden`}>
        <Image
          src={business.image_url || placeholderImage}
          alt={business.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
          sizes={viewMode === 'list' ? '320px' : '100%'}
        />

        {/* IMAGE OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent dark:from-[#081120] dark:via-[#081120]/20" />

        {/* BUSINESS TYPE BADGE - TOP LEFT */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-lg bg-blue-600/90 text-white text-[10px] font-semibold border border-blue-500/50 flex items-center gap-1.5 shadow-lg shadow-blue-500/20 w-fit backdrop-blur-sm">
            📍 {business.type}
          </span>
        </div>

        {/* SAVE BUTTON - TOP RIGHT */}
        <div className="absolute top-3 right-3 z-10">
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={handleSaveClick}
            disabled={isLoading}
            className={`flex items-center justify-center w-10 h-10 rounded-lg backdrop-blur-md border-2 transition-all 
            bg-white/90 border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200
            dark:bg-[#0d1424]/80 dark:border-white/20 dark:text-slate-300 dark:hover:text-red-400 dark:hover:border-red-500/40 
            ${isLoading ? 'opacity-70' : 'opacity-100'}`}
            title={isSaved ? 'Saved' : 'Save'}
          >
            {!isLoading &&
              (isSaved ? (
                <FaHeart size={18} fill="currentColor" className="text-red-500 dark:text-red-400 animate-pulse" />
              ) : (
                <FaHeart size={18} className="text-current" />
              ))}
          </motion.button>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className={`${viewMode === 'list' ? 'flex-1 p-6' : 'p-5 flex-1'} flex flex-col justify-between`}>
        {/* HEADER WITH RATING */}
        <div>
          <div className="flex justify-between items-start gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight truncate">
                {business.name}
              </h3>
            </div>

            {/* RATING DISPLAY */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border flex-shrink-0
              bg-blue-50 border-blue-100
              dark:bg-blue-500/10 dark:border-blue-500/20">
              <FaStar size={11} className="text-blue-500 dark:text-blue-300" />
              <span className="text-xs font-black text-blue-700 dark:text-white">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* LOCATION */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <FaMapMarkerAlt size={10} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
            <span className="truncate leading-tight">{business.address}</span>
          </div>

          {/* OPEN/CLOSED STATUS WITH TIME */}
          <div className="text-xs text-slate-500 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <FaClock
              size={10}
              className={businessStatus.isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
            />
            <span className={businessStatus.isOpen ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-red-700 dark:text-red-300 font-medium'}>
              {businessStatus.nextStatus || businessStatus.status}
            </span>
          </div>

          {/* DESCRIPTION - LINE CLAMPED */}
          {business.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 leading-tight">
              {business.description}
            </p>
          )}

          {/* REVIEWS INFO */}
          <div className="mb-4 pb-4 border-b border-slate-100 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
              <span className="text-emerald-600 dark:text-green-400 font-bold">{reviewCount}</span> {reviewText}
            </p>
          </div>
        </div>

        {/* DEAL TAG - BLUE COLOR & SMALLER SIZE */}
        {hasDeal && dealInfo && !isDealExpired(dealInfo.expiry_date) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ delay: 0.2 }}
            className="mb-3 px-2 py-1.5 rounded-lg 
            bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-400/80
            shadow-lg shadow-blue-500/30 w-fit"
          >
            <p className="text-[10px] font-black flex items-center gap-1 text-white">
              {getDealEmoji()} {getDealLabel()}
            </p>
          </motion.div>
        )}

        {/* ACTION BUTTONS */}
        <div className={`grid gap-2 ${viewMode === 'list' ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {business.phone && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`tel:${business.phone}`}
              className="flex items-center justify-center gap-1 py-2.5 rounded-lg 
              bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100
              dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white
              text-xs font-bold transition-all"
            >
              <FaPhone size={10} /> Call
            </motion.a>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewClick}
            className={`
              flex items-center justify-center gap-1 py-2.5 rounded-lg
              text-xs font-black text-white
              bg-blue-600
              hover:bg-blue-700
              shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30
              transition-all
              ${business.phone && viewMode !== 'list' ? 'col-span-1' : 'col-span-2'}
            `}
          >
            View <FaArrowRight size={9} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}