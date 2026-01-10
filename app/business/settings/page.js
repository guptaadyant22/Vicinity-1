'use client'


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaTrash, FaExclamationTriangle, FaKey, FaCheck, FaDownload, FaCalendar
} from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout'
import Aurora from '../../../components/Aurora'


// --- THEMED CONSTANTS ---
const GLASS_BG = "bg-white/80 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-white/10"
const GLASS_CARD = "bg-white dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/40 transition-all hover:shadow-2xl"
const GLASS_MODAL = "bg-white dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-2xl shadow-gray-200/50 dark:shadow-black/40"
const GLASS_INPUT = "w-full px-4 py-2 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all"


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


  // UPDATED: Added 'deals' option
  const [exportOptions, setExportOptions] = useState({
    businessInfo: true,
    reviews: true,
    deals: true,
    favorites: true,
    dateRange: 'lifetime'
  })


  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  })


  useEffect(() => {
    if (!authLoading && user === null) {
      router.push('/login')
    }
  }, [authLoading, user, router])


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
        password: newPassword
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
          end: new Date(customDateRange.endDate)
        }
      default:
        return {
          start: new Date('2000-01-01'),
          end: today
        }
    }


    return {
      start: startDate,
      end: today
    }
  }


  const handleExportData = async () => {
    if (!user) return
    setIsExporting(true)
    setError(null)


    try {
      const dateRange = getDateRange()


      // 1. Fetch Business Info
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single()


      if (businessError) throw businessError


      let reviewsData = []
      let dealsData = []
      let favoritesData = []


      // 2. Fetch Reviews (Schema: reviews table)
      if (exportOptions.reviews) {
        const { data } = await supabase
          .from('reviews')
          .select('*')
          .eq('business_id', businessData.id)
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString())
          .order('created_at', { ascending: false })
        reviewsData = data || []
      }


      // 3. Fetch Deals (NEW - Schema: deals table)
      if (exportOptions.deals) {
        const { data } = await supabase
          .from('deals')
          .select('*')
          .eq('business_id', businessData.id)
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString())
          .order('created_at', { ascending: false })
        dealsData = data || []
      }


      // 4. Fetch Favorites (Schema: favorites table)
      if (exportOptions.favorites) {
        const { data } = await supabase
          .from('favorites')
          .select('*')
          .eq('business_id', businessData.id)
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString())
        favoritesData = data || []
      }


      const reportData = {
        business: exportOptions.businessInfo ? businessData : null,
        reviews: reviewsData,
        deals: dealsData,
        favorites: favoritesData,
        exportOptions: exportOptions,
        dateRange: {
          start: dateRange.start.toISOString().split('T')[0],
          end: dateRange.end.toISOString().split('T')[0]
        },
        generatedAt: new Date().toISOString()
      }


      await generateAdvancedPDFReport(reportData, businessData.name)


      setSuccess('Data exported successfully!')
      setShowExportModal(false)
      setTimeout(() => setSuccess(null), 3000)


    } catch (err) {
      console.error('Export error:', err)
      setError('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }


  const generateAdvancedPDFReport = async (reportData, businessName) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      const contentWidth = pageWidth - margin * 2


      let yPosition = margin


      const addPageIfNeeded = (spaceNeeded = 20) => {
        if (yPosition + spaceNeeded > pageHeight - 20) {
          doc.addPage()
          yPosition = margin
          return true
        }
        return false
      }


      const addHeading = (title) => {
        addPageIfNeeded(15)
        doc.setFontSize(14)
        doc.setTextColor(255, 111, 0)
        doc.text(title, margin, yPosition)
        yPosition += 10
      }


      // Title Page
      doc.setFontSize(24)
      doc.setTextColor(255, 111, 0)
      doc.text('BUSINESS DATA EXPORT', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20


      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, yPosition)
      yPosition += 6
      doc.text(`Export Period: ${reportData.dateRange.start} to ${reportData.dateRange.end}`, margin, yPosition)
      yPosition += 6
      doc.text(`Business: ${businessName}`, margin, yPosition)
      yPosition += 20


      // Business Information Section
      if (reportData.business) {
        addHeading('BUSINESS INFORMATION')


        doc.setFontSize(11)
        doc.setTextColor(0)


        const businessFields = [
          ['Business Name', reportData.business.name],
          ['Email', reportData.business.email || 'N/A'],
          ['Phone', reportData.business.phone || 'N/A'],
          ['Address', reportData.business.address || 'N/A'],
          ['City', reportData.business.city || 'N/A'],
          ['State', reportData.business.state || 'N/A'],
          ['Zip Code', reportData.business.zip || 'N/A'],
          ['Type', reportData.business.type || 'N/A'],
          ['Website', reportData.business.website || 'N/A'],
          ['Current Rating', reportData.business.rating ? `${reportData.business.rating}/5 stars` : 'N/A'],
          ['Total Reviews', reportData.business.review_count || '0'],
          ['Created Date', new Date(reportData.business.created_at).toLocaleDateString()]
        ]


        businessFields.forEach(([label, value]) => {
          addPageIfNeeded(6)
          const wrappedValue = doc.splitTextToSize(String(value), contentWidth - 60)
          doc.text(`${label}:`, margin, yPosition)
          doc.text(wrappedValue, margin + 50, yPosition)
          yPosition += Math.max(6, wrappedValue.length * 5) + 2
        })


        if (reportData.business.description) {
          addPageIfNeeded(30)
          doc.setFontSize(11)
          doc.setTextColor(255, 111, 0)
          doc.text('Description:', margin, yPosition)
          yPosition += 7


          doc.setFontSize(10)
          doc.setTextColor(0)
          const wrappedDesc = doc.splitTextToSize(String(reportData.business.description || ''), contentWidth)
          doc.text(wrappedDesc, margin, yPosition)
          yPosition += wrappedDesc.length * 5 + 15
        }
      }


      // Reviews Section
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
            doc.text(`... and ${reportData.reviews.length - 30} more reviews (see full data for complete list)`, margin, yPosition)
            return
          }
          addPageIfNeeded(25)


          doc.setFontSize(11)
          doc.setTextColor(255, 111, 0)
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


      // Deals Section (NEW)
      if (reportData.deals && reportData.deals.length > 0) {
        addHeading('ACTIVE DEALS & PROMOTIONS')


        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text(`Total Deals: ${reportData.deals.length}`, margin, yPosition)
        yPosition += 8


        reportData.deals.forEach((deal, index) => {
          addPageIfNeeded(30)


          doc.setFontSize(11)
          doc.setTextColor(255, 111, 0)
          doc.text(`Deal #${index + 1}: ${deal.title || 'Untitled Deal'}`, margin, yPosition)
          yPosition += 7


          doc.setFontSize(10)
          doc.setTextColor(0)


          if (deal.discount_type && deal.discount_value) {
            const discountDisplay = deal.discount_type === 'percentage' 
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


      // Favorites Section
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
            doc.text(`${idx + 1}. Favorited on: ${new Date(fav.created_at).toLocaleDateString()}`, margin + 5, yPosition)
            yPosition += 6
        })


        if (reportData.favorites.length > 20) {
          yPosition += 2
          doc.setFontSize(8)
          doc.setTextColor(150)
          doc.text(`... and ${reportData.favorites.length - 20} more favorites`, margin + 5, yPosition)
        }
      }


      // Summary Page
      addPageIfNeeded(80)
      doc.setFontSize(14)
      doc.setTextColor(255, 111, 0)
      doc.text('EXPORT SUMMARY', margin, yPosition)
      yPosition += 12


      doc.setFontSize(11)
      doc.setTextColor(0)


      const currentRatingDisplay = reportData.business && reportData.business.rating 
        ? `${reportData.business.rating}/5 stars` 
        : 'N/A'


      const summaryData = [
        ['Business Information', reportData.business ? 'Included' : 'Not Included'],
        ['Current Business Rating', currentRatingDisplay],
        ['Total Reviews', String(reportData.reviews?.length || 0)],
        ['Total Deals', String(reportData.deals?.length || 0)],
        ['Total Favorites', String(reportData.favorites?.length || 0)],
        ['Export Date Range', `${reportData.dateRange.start} to ${reportData.dateRange.end}`]
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


  const toggleExportOption = (option) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }


  if (authLoading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center transition-colors">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }


  return (
    <BusinessLayout>
      {/* BACKGROUND - UPDATED for Light/Dark Mode */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-white dark:bg-[#080808] transition-colors duration-300">
        <div className="absolute inset-0 transition-opacity duration-300 mix-blend-multiply dark:mix-blend-normal" style={{ clipPath: 'polygon(256px 0, 100% 0, 100% 100%, 256px 100%)' }}>
          <Aurora 
            color1="#ff6f00"
            color2="#ffa500"
            color3="#ff6f00"
            amplitude={1.0}
            blend={0.5}
            speed={0.1}
          />
        </div>
      </div>


      <div className={`h-20 ${GLASS_BG} flex items-center px-8 relative z-10 transition-colors`}>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Settings</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage your account</p>
        </div>
      </div>


      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="px-8 py-3 bg-red-100 dark:bg-black/70 border-b border-red-500/50 text-red-700 dark:text-red-300 text-sm flex items-center gap-3 relative z-10"
          >
            <FaExclamationTriangle size={16} /> {error}
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="px-8 py-3 bg-green-100 dark:bg-black/70 border-b border-green-500/50 text-green-700 dark:text-green-300 text-sm flex items-center gap-3 relative z-10"
          >
            <FaCheck size={16} /> {success}
          </motion.div>
        )}
      </AnimatePresence>


      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-3xl mx-auto p-8 pb-20">


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className={GLASS_CARD}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Data</p>
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <FaDownload size={16} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Export Your Data</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Download your business data with custom filters and comprehensive reports</p>
              <motion.button
                onClick={() => setShowExportModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-lg transition-all border border-blue-200 dark:border-blue-500/30 cursor-pointer flex items-center gap-2"
              >
                <FaDownload size={12} />
                Configure Export
              </motion.button>
            </motion.div>


            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={GLASS_CARD}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Security</p>
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-600 dark:text-orange-400">
                  <FaKey size={16} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password & Access</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Update your password</p>
              <motion.button
                onClick={() => setShowPasswordModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-orange-50 dark:bg-orange-500/20 hover:bg-orange-100 dark:hover:bg-orange-500/30 text-orange-600 dark:text-orange-400 font-bold text-xs rounded-lg transition-all border border-orange-200 dark:border-orange-500/30 cursor-pointer"
              >
                Update Password
              </motion.button>
            </motion.div>


          </div>


          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-red-50 dark:bg-black/50 backdrop-blur-md border border-red-200 dark:border-red-500/30 rounded-2xl p-8 hover:shadow-lg dark:hover:bg-black/60 dark:hover:border-red-500/50 transition-all dark:shadow-black/40"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg text-red-600 dark:text-red-400">
                    <FaTrash size={18} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Danger Zone</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Irreversible action</p>
              </div>
            </div>


            <div className="bg-white dark:bg-black/70 backdrop-blur-sm rounded-xl p-6 border border-red-100 dark:border-red-500/20">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Delete Account</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Permanently remove your business profile and all associated data. This action cannot be undone.
                </p>
              </div>
              <motion.button
                onClick={() => setShowDeleteModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-lg shadow-red-500/20"
              >
                Delete My Account
              </motion.button>
            </div>


          </motion.div>


        </div>
      </main>


      {/* EXPORT DATA MODAL */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4"
            onClick={() => !isExporting && setShowExportModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${GLASS_MODAL} max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto mb-4">
                <FaDownload size={20} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Configure Data Export</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed text-center">
                Choose what data to include and the date range for your export
              </p>


              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaCalendar size={14} /> Date Range
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['week', 'month', 'quarter', 'year', 'lifetime'].map(range => (
                    <motion.button
                      key={range}
                      onClick={() => setExportOptions(prev => ({ ...prev, dateRange: range }))}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                        exportOptions.dateRange === range
                          ? 'bg-orange-500 text-white border border-orange-600 shadow-lg shadow-orange-500/20'
                          : 'bg-gray-100 dark:bg-black/40 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-black/60'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </motion.button>
                  ))}
                </div>


                {exportOptions.dateRange === 'custom' && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className={GLASS_INPUT}
                    />
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className={GLASS_INPUT}
                    />
                  </div>
                )}
              </div>


              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Data to Include</h4>
                <div className="space-y-3">
                  {[
                    { key: 'businessInfo', label: 'Business Information', desc: 'Business details, rating, description & created date' },
                    { key: 'reviews', label: 'Customer Reviews', desc: 'All ratings, feedback & reviewer information' },
                    { key: 'deals', label: 'Deals & Promotions', desc: 'Active deals, discounts, pricing & expiry dates' },
                    { key: 'favorites', label: 'Favorites Data', desc: 'Users who have saved your business' }
                  ].map(item => (
                    <motion.button
                      key={item.key}
                      onClick={() => toggleExportOption(item.key)}
                      className="w-full p-4 bg-gray-50 dark:bg-black/40 hover:bg-gray-100 dark:hover:bg-black/60 border border-gray-200 dark:border-white/10 rounded-lg transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-3 ${
                          exportOptions[item.key] 
                            ? 'bg-orange-500 border-orange-600' 
                            : 'bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-700'
                        }`}>
                          {exportOptions[item.key] && <FaCheck size={12} className="text-white" />}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>


              <div className="flex gap-3">
                <motion.button 
                  onClick={() => setShowExportModal(false)}
                  disabled={isExporting}
                  whileHover={!isExporting ? { scale: 1.02 } : {}}
                  whileTap={!isExporting ? { scale: 0.98 } : {}}
                  className="flex-1 py-3 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  onClick={handleExportData}
                  disabled={isExporting}
                  whileHover={!isExporting ? { scale: 1.02 } : {}}
                  whileTap={!isExporting ? { scale: 0.98 } : {}}
                  className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  {isExporting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full" />
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


      {/* UPDATE PASSWORD MODAL */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4"
            onClick={() => !isUpdatingPassword && setShowPasswordModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className={GLASS_MODAL}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 mx-auto mb-4">
                <FaKey size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Update Password</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed text-center">
                Enter your new password to update your account security.
              </p>
              
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


              <div className="flex gap-3">
                <motion.button 
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isUpdatingPassword}
                  whileHover={!isUpdatingPassword ? { scale: 1.02 } : {}}
                  whileTap={!isUpdatingPassword ? { scale: 0.98 } : {}}
                  className="flex-1 py-3 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                  whileHover={!isUpdatingPassword ? { scale: 1.02 } : {}}
                  whileTap={!isUpdatingPassword ? { scale: 0.98 } : {}}
                  className="flex-1 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20"
                >
                  {isUpdatingPassword ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full" />
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


      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-black/50 backdrop-blur-md border border-red-200 dark:border-red-500/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl dark:shadow-black/40"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 mx-auto mb-4">
                <FaExclamationTriangle size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Delete Account?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed text-center">
                This will permanently delete your business profile, reviews, and all associated data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  whileHover={!isDeleting ? { scale: 1.02 } : {}}
                  whileTap={!isDeleting ? { scale: 0.98 } : {}}
                  className="flex-1 py-3 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  whileHover={!isDeleting ? { scale: 1.02 } : {}}
                  whileTap={!isDeleting ? { scale: 0.98 } : {}}
                  className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/20"
                >
                  {isDeleting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full" />
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
    </BusinessLayout>
  )
}