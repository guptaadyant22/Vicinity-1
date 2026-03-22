'use client'

// Business settings page for account management, data export, and security
// COMPONENTS:
// SETTINGS MODALS - Export, password update, and delete confirmation
// HELPER FUNCTIONS:
// HANDLE DELETE ACCOUNT - Removes business profile and user data permanently
// HANDLE UPDATE PASSWORD - Updates user password with validation
// HANDLE EXPORT DATA - Fetches business data and generates PDF report
// GENERATE ADVANCED PDF REPORT - Creates formatted PDF with business info, reviews, deals, and favorites
// GET DATE RANGE - Calculates date range based on export option selection
// TOGGLE EXPORT OPTION - Toggles checkboxes for data export selections

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaTrash,
  FaExclamationTriangle,
  FaKey,
  FaCheck,
  FaDownload,
  FaCalendar,
} from 'react-icons/fa'
import { Inter, Outfit } from 'next/font/google'

import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout'

// Font setup
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

// Theme classes
const PAGE_WRAP =
  `${inter.variable} ${outfit.variable} relative min-h-screen overflow-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-[#081120] dark:text-white`

const GLASS_BG =
  'bg-white/75 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 transition-colors duration-300'

const GLASS_CARD =
  'bg-white/80 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 rounded-[28px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all hover:border-blue-500/28 hover:shadow-[0_20px_60px_rgba(59,130,246,0.10)] duration-300'

const GLASS_MODAL =
  'bg-white/85 dark:bg-[#0f172a]/95 backdrop-blur-2xl border border-blue-500/12 dark:border-white/10 rounded-[30px] p-8 max-w-2xl w-full shadow-[0_20px_70px_rgba(15,23,42,0.16)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)] transition-colors duration-300'

const GLASS_INPUT =
  'w-full px-4 py-3 bg-white dark:bg-[#111827] border border-blue-500/15 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-blue-50/60 dark:focus:bg-[#162033] transition-all text-sm'

// Animated page background
function PageBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:bg-[#081120]" />

      {/* Main glow */}
      <motion.div
        animate={{
          y: [0, -16, 0],
          scale: [1, 1.05, 1],
          opacity: [0.22, 0.4, 0.22],
          transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute left-1/2 top-[8%] h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-blue-200/70 blur-[140px] dark:bg-blue-500/16"
      />

      {/* Left glow */}
      <motion.div
        animate={{
          x: [0, 16, 0],
          y: [0, 14, 0],
          opacity: [0.15, 0.28, 0.15],
          transition: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute left-[-8%] top-[16%] h-[320px] w-[320px] rounded-full bg-blue-100/80 blur-[120px] dark:bg-blue-400/10"
      />

      {/* Right glow */}
      <motion.div
        animate={{
          x: [0, -12, 0],
          y: [0, -10, 0],
          opacity: [0.12, 0.24, 0.12],
          transition: { duration: 11, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute right-[-6%] top-[14%] h-[340px] w-[340px] rounded-full bg-cyan-100/70 blur-[120px] dark:bg-cyan-500/10"
      />

      {/* Grid */}
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
          WebkitMaskImage:
            'radial-gradient(circle at center, black 45%, transparent 100%)',
        }}
      />

      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#081120]" />
    </div>
  )
}

// Loading spinner component
function LoadingScreen() {
  return (
    <div className="relative z-10 h-screen flex items-center justify-center">
      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 rounded-full border-[3px] border-blue-500/30 border-t-blue-600 dark:border-blue-400/20 dark:border-t-blue-300"
      />
    </div>
  )
}

export default function BusinessSettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Export selections
  const [exportOptions, setExportOptions] = useState({
    businessInfo: true,
    reviews: true,
    deals: true,
    favorites: true,
    dateRange: 'lifetime',
  })

  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && user === null) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeleting(true)
    setError(null)

    try {
      const { error: businessError } = await supabase
        .from('businesses')
        .delete()
        .eq('owner_id', user.id)

      if (businessError) throw businessError

      await supabase.auth.signOut()
      setSuccess('Account deleted successfully')
      setShowDeleteModal(false)
      setTimeout(() => router.push('/'), 1500)
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete account. Please try again.')
      setIsDeleting(false)
    }
  }

  // Password update handler
  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsUpdatingPassword(true)
    setError(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      setSuccess('Password updated successfully!')
      setShowPasswordModal(false)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Password update error:', err)
      setError('Failed to update password. Please try again.')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Date range helper
  const getDateRange = () => {
    const today = new Date()
    const startDate = new Date()

    switch (exportOptions.dateRange) {
      case 'week':
        startDate.setDate(today.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(today.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1)
        break
      case 'custom':
        return {
          start: new Date(customDateRange.startDate),
          end: new Date(customDateRange.endDate),
        }
      default:
        return {
          start: new Date('2000-01-01'),
          end: today,
        }
    }

    return {
      start: startDate,
      end: today,
    }
  }

  // Export handler
  const handleExportData = async () => {
    if (!user) return

    setIsExporting(true)
    setError(null)

    try {
      const dateRange = getDateRange()

      // Fetch business records
      const { data: allBusinesses, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)

      if (businessError) throw businessError
      if (!allBusinesses || allBusinesses.length === 0) {
        throw new Error('No business found. Please create a business first.')
      }

      // Use first business
      const businessData = allBusinesses[0]
      const businessId = businessData.id

      let reviewsData = []
      let dealsData = []
      let favoritesData = []

      // Reviews
      if (exportOptions.reviews) {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('business_id', businessId)
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString())
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Reviews fetch error:', error)
        } else {
          reviewsData = data || []
        }
      }

      // Deals
      if (exportOptions.deals) {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('business_id', businessId)
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString())
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Deals fetch error:', error)
        } else {
          dealsData = data || []
        }
      }

      // Favorites
      if (exportOptions.favorites) {
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('business_id', businessId)
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString())

        if (error) {
          console.error('Favorites fetch error:', error)
        } else {
          favoritesData = data || []
        }
      }

      // Report payload
      const reportData = {
        business: exportOptions.businessInfo ? businessData : null,
        reviews: reviewsData,
        deals: dealsData,
        favorites: favoritesData,
        exportOptions: exportOptions,
        dateRange: {
          start: dateRange.start.toISOString().split('T')[0],
          end: dateRange.end.toISOString().split('T')[0],
        },
        generatedAt: new Date().toISOString(),
      }

      // Generate PDF
      await generateAdvancedPDFReport(reportData, businessData.name || 'Business')

      setSuccess('Data exported successfully!')
      setShowExportModal(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Export error:', err)
      setError(err.message || 'Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // PDF report generator
  const generateAdvancedPDFReport = async (reportData, businessName) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      const contentWidth = pageWidth - margin * 2

      let yPosition = margin

      // Page overflow helper
      const addPageIfNeeded = (spaceNeeded = 20) => {
        if (yPosition + spaceNeeded > pageHeight - 20) {
          doc.addPage()
          yPosition = margin
          return true
        }
        return false
      }

      // Section heading helper
      const addHeading = (title) => {
        addPageIfNeeded(15)
        doc.setFontSize(14)
        doc.setTextColor(37, 99, 235)
        doc.text(title, margin, yPosition)
        yPosition += 10
      }

      // Title page
      doc.setFontSize(24)
      doc.setTextColor(37, 99, 235)
      doc.text('BUSINESS DATA EXPORT', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20

      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text(
        `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        margin,
        yPosition
      )
      yPosition += 6
      doc.text(
        `Export Period: ${reportData.dateRange.start} to ${reportData.dateRange.end}`,
        margin,
        yPosition
      )
      yPosition += 6
      doc.text(`Business: ${businessName}`, margin, yPosition)
      yPosition += 20

      // Business information
      if (reportData.business) {
        addHeading('BUSINESS INFORMATION')

        doc.setFontSize(11)
        doc.setTextColor(0)

        const avgRating =
          reportData.reviews && reportData.reviews.length > 0
            ? (
                reportData.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                reportData.reviews.length
              ).toFixed(1)
            : reportData.business.rating || 0

        const businessFields = [
          ['Business Name', reportData.business.name || 'N/A'],
          ['Email', reportData.business.email || 'N/A'],
          ['Phone', reportData.business.phone || 'N/A'],
          ['Address', reportData.business.address || 'N/A'],
          ['City', reportData.business.city || 'N/A'],
          ['State', reportData.business.state || 'N/A'],
          ['Zip Code', reportData.business.zip || 'N/A'],
          ['Type', reportData.business.type || 'N/A'],
          ['Website', reportData.business.website || 'N/A'],
          ['Current Rating', `${avgRating}/5 stars`],
          ['Total Reviews', String(reportData.reviews?.length || 0)],
          ['Created Date', new Date(reportData.business.created_at).toLocaleDateString()],
        ]

        businessFields.forEach(([label, value]) => {
          addPageIfNeeded(6)
          const wrappedValue = doc.splitTextToSize(String(value), contentWidth - 60)
          doc.text(`${label}:`, margin, yPosition)
          doc.text(wrappedValue, margin + 50, yPosition)
          yPosition += Math.max(6, wrappedValue.length * 5) + 2
        })
      }

      // Reviews section
      if (reportData.reviews && reportData.reviews.length > 0) {
        addHeading('CUSTOMER REVIEWS')

        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text(`Total Reviews: ${reportData.reviews.length}`, margin, yPosition)
        yPosition += 8

        let reviewsCount = 0
        reportData.reviews.forEach((review, index) => {
          if (reviewsCount >= 30) {
            addPageIfNeeded(10)
            doc.setFontSize(9)
            doc.setTextColor(150)
            doc.text(
              `... and ${reportData.reviews.length - 30} more reviews (see full data for complete list)`,
              margin,
              yPosition
            )
            return
          }

          addPageIfNeeded(25)

          doc.setFontSize(11)
          doc.setTextColor(37, 99, 235)
          doc.text(`Review #${index + 1}`, margin, yPosition)
          yPosition += 6

          doc.setFontSize(10)
          doc.setTextColor(0)
          doc.text(`Rating: ${review.rating || 'N/A'}/5 stars`, margin, yPosition)
          yPosition += 5
          doc.text(`Date: ${new Date(review.created_at).toLocaleDateString()}`, margin, yPosition)
          yPosition += 5
          doc.text(`Reviewer: ${review.user_name || 'Anonymous'}`, margin, yPosition)
          yPosition += 6

          doc.setFontSize(9)
          const reviewText = review.text || review.comment || 'No written comment'
          const wrappedReview = doc.splitTextToSize(String(reviewText), contentWidth)
          doc.text(wrappedReview, margin, yPosition)
          yPosition += wrappedReview.length * 4 + 8

          reviewsCount++
        })
      }

      // Deals section
      if (reportData.deals && reportData.deals.length > 0) {
        addHeading('ACTIVE DEALS & PROMOTIONS')

        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text(`Total Deals: ${reportData.deals.length}`, margin, yPosition)
        yPosition += 8

        reportData.deals.forEach((deal, index) => {
          addPageIfNeeded(30)

          doc.setFontSize(11)
          doc.setTextColor(37, 99, 235)
          doc.text(`Deal #${index + 1}: ${deal.title || 'Untitled Deal'}`, margin, yPosition)
          yPosition += 7

          doc.setFontSize(10)
          doc.setTextColor(0)

          if (deal.discount_type && deal.discount_value) {
            const discountDisplay =
              deal.discount_type === 'percentage'
                ? `${deal.discount_value}% OFF`
                : `$${deal.discount_value} OFF`
            doc.text(`Discount: ${discountDisplay}`, margin, yPosition)
            yPosition += 5
          }

          if (deal.original_price && deal.discounted_price) {
            doc.text(`Price: $${deal.original_price} → $${deal.discounted_price}`, margin, yPosition)
            yPosition += 5
          }

          doc.text(`Status: ${deal.is_active ? 'Active' : 'Inactive'}`, margin, yPosition)
          yPosition += 5

          if (deal.expiry_date) {
            doc.text(`Expires: ${new Date(deal.expiry_date).toLocaleDateString()}`, margin, yPosition)
            yPosition += 5
          }

          doc.text(`Created: ${new Date(deal.created_at).toLocaleDateString()}`, margin, yPosition)
          yPosition += 6

          if (deal.description) {
            doc.setFontSize(9)
            const wrappedDesc = doc.splitTextToSize(String(deal.description), contentWidth)
            doc.text(wrappedDesc, margin, yPosition)
            yPosition += wrappedDesc.length * 4 + 10
          }

          yPosition += 3
        })
      }

      // Favorites section
      if (reportData.favorites && reportData.favorites.length > 0) {
        addHeading('FAVORITES')
        doc.setFontSize(10)
        doc.setTextColor(0)
        doc.text(`Total Users who favorited: ${reportData.favorites.length}`, margin, yPosition)
        yPosition += 10

        doc.setFontSize(9)
        const favCount = Math.min(reportData.favorites.length, 20)
        reportData.favorites.slice(0, favCount).forEach((fav, idx) => {
          addPageIfNeeded(6)
          doc.text(
            `${idx + 1}. Favorited on: ${new Date(fav.created_at).toLocaleDateString()}`,
            margin + 5,
            yPosition
          )
          yPosition += 6
        })

        if (reportData.favorites.length > 20) {
          yPosition += 2
          doc.setFontSize(8)
          doc.setTextColor(150)
          doc.text(
            `... and ${reportData.favorites.length - 20} more favorites`,
            margin + 5,
            yPosition
          )
        }
      }

      // Summary
      addPageIfNeeded(80)
      doc.setFontSize(14)
      doc.setTextColor(37, 99, 235)
      doc.text('EXPORT SUMMARY', margin, yPosition)
      yPosition += 12

      doc.setFontSize(11)
      doc.setTextColor(0)

      const currentRatingDisplay =
        reportData.business && reportData.business.rating
          ? `${reportData.business.rating}/5 stars`
          : 'N/A'

      const summaryData = [
        ['Business Information', reportData.business ? 'Included' : 'Not Included'],
        ['Current Business Rating', currentRatingDisplay],
        ['Total Reviews', String(reportData.reviews?.length || 0)],
        ['Total Deals', String(reportData.deals?.length || 0)],
        ['Total Favorites', String(reportData.favorites?.length || 0)],
        ['Export Date Range', `${reportData.dateRange.start} to ${reportData.dateRange.end}`],
      ]

      summaryData.forEach(([label, value]) => {
        addPageIfNeeded(6)
        doc.text(`${label}: ${value}`, margin, yPosition)
        yPosition += 7
      })

      yPosition += 10

      doc.setFontSize(9)
      doc.setTextColor(150)
      doc.text('This is an official data export from Vicinity Business Platform', margin, yPosition)

      doc.save(`${businessName}_export_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error('PDF generation error:', err)
      throw new Error('Failed to generate PDF')
    }
  }

  // Checkbox toggle helper
  const toggleExportOption = (option) => {
    setExportOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }))
  }

  if (authLoading) {
    return (
      <BusinessLayout>
        <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
          <PageBackground />
          <LoadingScreen />
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
        <PageBackground />

        {/* Top header bar */}
        <div className="relative z-10 border-b border-blue-500/10 dark:border-white/10 bg-white/70 dark:bg-[#0b1322] backdrop-blur-xl transition-colors duration-300">
          {/* Header glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
            <div className="absolute right-20 top-0 h-20 w-20 rounded-full bg-cyan-100/50 blur-3xl dark:bg-cyan-400/10" />
          </div>

          <div className="relative flex min-h-[88px] items-center px-8">
            <div>
              {/* Title */}
              <h1 className="font-[var(--font-outfit)] text-[30px] font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">
                Settings
              </h1>

              {/* Subtitle */}
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage your account
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-8 mt-4 px-4 py-3 rounded-2xl bg-red-50/90 dark:bg-[#1f1720] border border-red-300/50 dark:border-red-400/20 text-red-700 dark:text-red-300 text-sm flex items-center gap-3 relative z-10 backdrop-blur-xl"
            >
              <FaExclamationTriangle size={16} /> {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-8 mt-4 px-4 py-3 rounded-2xl bg-blue-50/90 dark:bg-[#0f172a] border border-blue-300/50 dark:border-blue-400/20 text-blue-700 dark:text-blue-300 text-sm flex items-center gap-3 relative z-10 backdrop-blur-xl"
            >
              <FaCheck size={16} /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-3xl mx-auto p-8 pb-20">
            {/* Top cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Export data card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={GLASS_CARD}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">
                    Data
                  </p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaDownload size={16} />
                  </div>
                </div>

                <h3 className="text-xl font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white mb-2">
                  Export Your Data
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Download your business data with custom filters and comprehensive reports
                </p>

                {/* Export button */}
                <motion.button
                  onClick={() => setShowExportModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 font-[var(--font-outfit)] font-semibold text-xs rounded-2xl transition-all border border-blue-200 dark:border-blue-500/20 cursor-pointer flex items-center gap-2"
                >
                  <FaDownload size={12} />
                  Configure Export
                </motion.button>
              </motion.div>

              {/* Password card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={GLASS_CARD}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">
                    Security
                  </p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaKey size={16} />
                  </div>
                </div>

                <h3 className="text-xl font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white mb-2">
                  Password & Access
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Update your password
                </p>

                {/* Password button */}
                <motion.button
                  onClick={() => setShowPasswordModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-[var(--font-outfit)] font-semibold text-xs rounded-2xl transition-all cursor-pointer shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
                >
                  Update Password
                </motion.button>
              </motion.div>
            </div>

            {/* Danger zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-red-50/90 dark:bg-[#150f16]/80 backdrop-blur-xl border border-red-200 dark:border-red-500/20 rounded-[30px] p-8 hover:shadow-lg transition-all dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-2xl text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/20">
                      <FaTrash size={18} />
                    </div>
                    <h2 className="text-2xl font-[var(--font-outfit)] font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
                      Danger Zone
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Irreversible action
                  </p>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-[#111827] backdrop-blur-sm rounded-[24px] p-6 border border-red-100 dark:border-red-500/15 transition-colors duration-300">
                <div className="mb-4">
                  <h3 className="font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white mb-2">
                    Delete Account
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Permanently remove your business profile and all associated data. This action cannot be undone.
                  </p>
                </div>

                {/* Delete button */}
                <motion.button
                  onClick={() => setShowDeleteModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-[var(--font-outfit)] font-semibold text-xs rounded-2xl transition-all cursor-pointer shadow-lg shadow-red-500/20"
                >
                  Delete My Account
                </motion.button>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Export modal */}
        <AnimatePresence>
          {showExportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md p-4"
              onClick={() => !isExporting && setShowExportModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className={`${GLASS_MODAL} max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 mx-auto mb-4">
                  <FaDownload size={20} />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-[var(--font-outfit)] font-semibold tracking-[-0.04em] text-slate-900 dark:text-white mb-2 text-center">
                  Configure Data Export
                </h3>

                {/* Subtitle */}
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed text-center">
                  Choose what data to include and the date range for your export
                </p>

                {/* Date range */}
                <div className="mb-8">
                  <h4 className="text-sm font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaCalendar size={14} /> Date Range
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {['week', 'month', 'quarter', 'year', 'lifetime'].map((range) => (
                      <motion.button
                        key={range}
                        onClick={() =>
                          setExportOptions((prev) => ({ ...prev, dateRange: range }))
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`py-2.5 px-3 rounded-2xl font-[var(--font-outfit)] font-semibold text-xs transition-all border ${
                          exportOptions.dateRange === range
                            ? 'bg-blue-600 text-white border-blue-700 shadow-[0_10px_30px_rgba(59,130,246,0.24)]'
                            : 'bg-white dark:bg-[#162033] text-slate-600 dark:text-slate-300 border-blue-500/15 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-[#1d2a44]'
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </motion.button>
                    ))}
                  </div>

                  {exportOptions.dateRange === 'custom' && (
                    <div className="mt-4 space-y-3">
                      {/* Start date */}
                      <input
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) =>
                          setCustomDateRange((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        className={GLASS_INPUT}
                      />

                      {/* End date */}
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) =>
                          setCustomDateRange((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        className={GLASS_INPUT}
                      />
                    </div>
                  )}
                </div>

                {/* Data selections */}
                <div className="mb-8">
                  <h4 className="text-sm font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white mb-4">
                    Data to Include
                  </h4>

                  <div className="space-y-3">
                    {[
                      {
                        key: 'businessInfo',
                        label: 'Business Information',
                        desc: 'Business details, rating, description & created date',
                      },
                      {
                        key: 'reviews',
                        label: 'Customer Reviews',
                        desc: 'All ratings, feedback & reviewer information',
                      },
                      {
                        key: 'deals',
                        label: 'Deals & Promotions',
                        desc: 'Active deals, discounts, pricing & expiry dates',
                      },
                      {
                        key: 'favorites',
                        label: 'Favorites Data',
                        desc: 'Users who have saved your business',
                      },
                    ].map((item) => (
                      <motion.button
                        key={item.key}
                        onClick={() => toggleExportOption(item.key)}
                        className="w-full p-4 bg-white dark:bg-[#111827] hover:bg-blue-50 dark:hover:bg-[#162033] border border-blue-500/12 dark:border-white/10 rounded-[22px] transition-all text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white">
                              {item.label}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {item.desc}
                            </p>
                          </div>

                          {/* Toggle indicator */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-3 border ${
                              exportOptions[item.key]
                                ? 'bg-blue-600 border-blue-700'
                                : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {exportOptions[item.key] && (
                              <FaCheck size={12} className="text-white" />
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Modal actions */}
                <div className="flex gap-3">
                  {/* Cancel button */}
                  <motion.button
                    onClick={() => setShowExportModal(false)}
                    disabled={isExporting}
                    whileHover={!isExporting ? { scale: 1.02 } : {}}
                    whileTap={!isExporting ? { scale: 0.98 } : {}}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-[#162033] hover:bg-slate-200 dark:hover:bg-[#1d2a44] text-slate-700 dark:text-white font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </motion.button>

                  {/* Export button */}
                  <motion.button
                    onClick={handleExportData}
                    disabled={isExporting}
                    whileHover={!isExporting ? { scale: 1.02 } : {}}
                    whileTap={!isExporting ? { scale: 0.98 } : {}}
                    className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-[var(--font-outfit)] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
                  >
                    {isExporting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full"
                        />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <FaDownload size={14} />
                        <span>Export PDF</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Password modal */}
        <AnimatePresence>
          {showPasswordModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md p-4"
              onClick={() => !isUpdatingPassword && setShowPasswordModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className={GLASS_MODAL}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 mx-auto mb-4">
                  <FaKey size={20} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white mb-2 text-center">
                  Update Password
                </h3>

                {/* Subtitle */}
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed text-center">
                  Enter your new password to update your account security.
                </p>

                {/* Inputs */}
                <div className="space-y-3 mb-6">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={GLASS_INPUT}
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={GLASS_INPUT}
                  />
                </div>

                {/* Modal actions */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowPasswordModal(false)}
                    disabled={isUpdatingPassword}
                    whileHover={!isUpdatingPassword ? { scale: 1.02 } : {}}
                    whileTap={!isUpdatingPassword ? { scale: 0.98 } : {}}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-[#162033] hover:bg-slate-200 dark:hover:bg-[#1d2a44] text-slate-700 dark:text-white font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword}
                    whileHover={!isUpdatingPassword ? { scale: 1.02 } : {}}
                    whileTap={!isUpdatingPassword ? { scale: 0.98 } : {}}
                    className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-[var(--font-outfit)] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full"
                        />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <FaKey size={14} />
                        <span>Update Password</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md p-4"
              onClick={() => !isDeleting && setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-white/90 dark:bg-[#140f16]/95 backdrop-blur-2xl border border-red-200 dark:border-red-500/20 rounded-[30px] p-8 max-w-sm w-full shadow-[0_20px_70px_rgba(15,23,42,0.16)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/20 mx-auto mb-4">
                  <FaExclamationTriangle size={20} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white mb-2 text-center">
                  Delete Account?
                </h3>

                {/* Subtitle */}
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed text-center">
                  This will permanently delete your business profile, reviews, and all associated data. This action cannot be undone.
                </p>

                {/* Modal actions */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    whileHover={!isDeleting ? { scale: 1.02 } : {}}
                    whileTap={!isDeleting ? { scale: 0.98 } : {}}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-[#162033] hover:bg-slate-200 dark:hover:bg-[#1d2a44] text-slate-700 dark:text-white font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    whileHover={!isDeleting ? { scale: 1.02 } : {}}
                    whileTap={!isDeleting ? { scale: 0.98 } : {}}
                    className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-[var(--font-outfit)] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/20"
                  >
                    {isDeleting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full"
                        />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <FaTrash size={14} />
                        <span>Delete Account</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BusinessLayout>
  )
}
