'use client'


// Business account settings page for managing email, password, and account deletion.
// Provides forms for credential updates and a danger-zone section for account removal.

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


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})


const PAGE_WRAP =
  `${inter.variable} ${outfit.variable} relative min-h-screen text-slate-900 transition-colors duration-300 dark:text-white`

const GLASS_BG =
  'bg-white/75 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 transition-colors duration-300'

const GLASS_CARD =
  'bg-white/80 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 rounded-[28px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all hover:border-blue-500/28 hover:shadow-[0_20px_60px_rgba(59,130,246,0.10)] duration-300'

const GLASS_MODAL =
  'bg-white/85 dark:bg-[#0f172a]/95 backdrop-blur-2xl border border-blue-500/12 dark:border-white/10 rounded-[30px] p-8 max-w-2xl w-full shadow-[0_20px_70px_rgba(15,23,42,0.16)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)] transition-colors duration-300'

const GLASS_INPUT =
  'w-full px-4 py-3 bg-white dark:bg-[#111827] border border-blue-500/15 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-blue-50/60 dark:focus:bg-[#162033] transition-all text-sm'


function LoadingScreen() {
  return (
    <div className="relative z-10 flex min-h-[60vh] items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 rounded-full border-[3px] border-blue-500/30 border-t-blue-600 dark:border-blue-400/20 dark:border-t-blue-300"
      />
    </div>
  )
}

// Business account settings for credentials and account deletion
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


  const handleExportData = async () => {
    if (!user) return

    setIsExporting(true)
    setError(null)

    try {
      const dateRange = getDateRange()


      const { data: allBusinesses, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)

      if (businessError) throw businessError
      if (!allBusinesses || allBusinesses.length === 0) {
        throw new Error('No business found. Please create a business first.')
      }


      const businessData = allBusinesses[0]
      const businessId = businessData.id

      let reviewsData = []
      let dealsData = []
      let favoritesData = []


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


const generateAdvancedPDFReport = async (reportData, businessName) => {
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 18
    const contentWidth = pageWidth - margin * 2

const vicinityLogoPng = await new Promise((resolve) => {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <g fill="#2563eb" fill-rule="nonzero">
      <g transform="translate(256,256) rotate(180) scale(5.33333,5.33333)">
        <path d="M5,45l4,-11l12,-12l-6,23z"/>
        <path d="M25,18l8,27h10l-11,-33z"/>
        <path d="M16.059,14.164l3.941,-11.164h8z"/>
        <path d="M10.731,29.002l12.269,-12.002v-2l-11.42,11.667z"/>
        <path d="M15.142,16.429l-2.142,5.571l16.724,-16.275l-0.906,-2.547z"/>
        <path d="M23.932,14.055l0.445,1.571l6.564,-6.448l-0.556,-1.476z"/>
      </g>
    </g>
  </svg>`
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    resolve(canvas.toDataURL('image/png'))
  }
  img.src = url
})

    const BLUE       = [37,  99,  235] 
    const BLUE_DARK  = [29,  78,  216]   
    const BLUE_LIGHT = [219, 234, 254]   
    const SLATE_900  = [15,  23,  42]
    const SLATE_600  = [71,  85,  105]
    const SLATE_400  = [148, 163, 184]
    const SLATE_100  = [241, 245, 249]
    const WHITE      = [255, 255, 255]
    const GREEN      = [22,  163, 74]
    const RED        = [220, 38,  38]

    let y = 0

    const newPageIfNeeded = (need = 20) => {
      if (y + need > pageHeight - 20) {
        addFooter()
        doc.addPage()
        y = 0
        addPageHeader()
      }
    }

    const setColor = (rgb, type = 'text') => {
      if (type === 'fill') doc.setFillColor(...rgb)
      else doc.setTextColor(...rgb)
    }
//comment
    setColor([10, 25, 60], 'fill')
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    setColor([37, 99, 235], 'fill')
    doc.ellipse(pageWidth / 2, -10, 110, 55, 'F')

    doc.setDrawColor(255, 255, 255, 0.04)
    doc.setLineWidth(0.15)
    for (let i = 0; i < pageHeight; i += 14) {
      doc.line(0, i, pageWidth, i)
    }

    const cx = pageWidth / 2, cy = 58
    doc.addImage(vicinityLogoPng, 'PNG', cx - 12, cy - 14, 24, 24)

    // Brand name
    setColor(WHITE)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('VICINITY', cx, cy + 24, { align: 'center' })

    setColor([147, 197, 253])
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text('LOCAL BUSINESS PLATFORM', cx, cy + 30, { align: 'center' })

    setColor([59, 130, 246], 'fill')
    doc.rect(cx - 30, cy + 36, 60, 0.6, 'F')

    setColor(WHITE)
    doc.setFontSize(26)
    doc.setFont('helvetica', 'bold')
    doc.text('Business Report', cx, cy + 52, { align: 'center' })

    setColor([147, 197, 253])
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(businessName, cx, cy + 62, { align: 'center' })

    const metaY = cy + 80
    const pills = [
      { label: 'GENERATED', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
      { label: 'PERIOD',    value: `${reportData.dateRange.start} – ${reportData.dateRange.end}` },
    ]
    pills.forEach((pill, i) => {
      const bx = cx - 55 + i * 58
      setColor([255, 255, 255, 0.06], 'fill')
      doc.setFillColor(30, 58, 138)  
      doc.roundedRect(bx, metaY, 52, 18, 4, 4, 'F')
      setColor([147, 197, 253])
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(pill.label, bx + 26, metaY + 6, { align: 'center' })
      setColor(WHITE)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.text(pill.value, bx + 26, metaY + 13, { align: 'center' })
    })

    const stats = [
      { label: 'Reviews',    value: String(reportData.reviews?.length  || 0) },
      { label: 'Deals',      value: String(reportData.deals?.length    || 0) },
      { label: 'Favourites', value: String(reportData.favorites?.length || 0) },
    ]
    const statY = metaY + 28
    const boxW = 38, boxH = 26, gap = 7
    const totalW = stats.length * boxW + (stats.length - 1) * gap
    const startX = cx - totalW / 2
    stats.forEach((s, i) => {
      const bx = startX + i * (boxW + gap)
      setColor([17, 24, 39], 'fill')
      doc.roundedRect(bx, statY, boxW, boxH, 5, 5, 'F')
      setColor([59, 130, 246], 'fill')
      doc.roundedRect(bx, statY, boxW, 2.5, 1, 1, 'F')
      setColor(WHITE)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(s.value, bx + boxW / 2, statY + 15, { align: 'center' })
      setColor(SLATE_400)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(s.label, bx + boxW / 2, statY + 22, { align: 'center' })
    })

    setColor([30, 41, 59], 'fill')
    doc.rect(0, pageHeight - 14, pageWidth, 14, 'F')
    setColor(SLATE_400)
    doc.setFontSize(7)
    doc.text('Confidential · Generated by Vicinity · vicinity.app', cx, pageHeight - 5.5, { align: 'center' })

    const addPageHeader = () => {
      setColor(BLUE, 'fill')
      doc.rect(0, 0, pageWidth, 1.5, 'F')

      doc.addImage(vicinityLogoPng, 'PNG', margin - 1, 4, 8, 8)
      
      setColor(SLATE_900)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('VICINITY', margin + 12, 11)

      setColor(SLATE_400)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(businessName, pageWidth - margin, 11, { align: 'right' })

      setColor(SLATE_100, 'fill')
      doc.rect(margin, 16, contentWidth, 0.4, 'F')

      y = 22
    }

    const addFooter = () => {
      setColor(SLATE_100, 'fill')
      doc.rect(margin, pageHeight - 14, contentWidth, 0.4, 'F')
      setColor(SLATE_400)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text('vicinity.app  ·  Confidential Business Export', margin, pageHeight - 8)
      doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - margin, pageHeight - 8, { align: 'right' })
    }

    const addSection = (title, iconChar = '●') => {
      newPageIfNeeded(22)
      setColor(SLATE_100, 'fill')
      doc.roundedRect(margin, y, contentWidth, 12, 3, 3, 'F')
      setColor(BLUE, 'fill')
      doc.roundedRect(margin, y, 3, 12, 1.5, 1.5, 'F')
      setColor(BLUE)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(title.toUpperCase(), margin + 8, y + 8)
      y += 18
    }

    const addKV = (key, value, highlight = false) => {
      newPageIfNeeded(8)
      if (highlight) {
        setColor([239, 246, 255], 'fill')
        doc.roundedRect(margin, y - 1, contentWidth, 8, 2, 2, 'F')
      }
      setColor(SLATE_600)
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.text(key, margin + 3, y + 5)
      setColor(SLATE_900)
      doc.setFont('helvetica', 'bold')
      const wrapped = doc.splitTextToSize(String(value || 'N/A'), contentWidth - 60)
      doc.text(wrapped, margin + 58, y + 5)
      y += Math.max(9, wrapped.length * 5.5) + 1
    }

    const addDivider = () => {
      setColor(SLATE_100, 'fill')
      doc.rect(margin, y, contentWidth, 0.4, 'F')
      y += 5
    }

    doc.addPage()
    addPageHeader()

    if (reportData.business) {
      addSection('Business Information')
      const b = reportData.business
      const avgRating = reportData.reviews?.length
        ? (reportData.reviews.reduce((s, r) => s + (r.rating || 0), 0) / reportData.reviews.length).toFixed(1)
        : (b.rating || 0)

      const fields = [
        ['Business Name', b.name],
        ['Email',         b.email],
        ['Phone',         b.phone],
        ['Address',       b.address],
        ['City / State',  `${b.city || ''} ${b.state || ''}`.trim()],
        ['Zip Code',      b.zip],
        ['Type',          b.type],
        ['Website',       b.website],
        ['Rating',        `${avgRating} / 5 stars`],
        ['Total Reviews', String(reportData.reviews?.length || 0)],
        ['Member Since',  new Date(b.created_at).toLocaleDateString()],
      ]
      fields.forEach(([k, v], i) => addKV(k, v, i % 2 === 0))
      y += 6
    }

    if (reportData.reviews?.length) {
      addSection('Customer Reviews')

      const avg = (reportData.reviews.reduce((s, r) => s + (r.rating || 0), 0) / reportData.reviews.length).toFixed(1)
      setColor(SLATE_900)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`${avg} / 5`, margin, y + 6)
      setColor(SLATE_400)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`avg from ${reportData.reviews.length} review${reportData.reviews.length !== 1 ? 's' : ''}`, margin + 24, y + 6)
      y += 14

      const cap = Math.min(reportData.reviews.length, 30)
      reportData.reviews.slice(0, cap).forEach((r, i) => {
        newPageIfNeeded(28)

        const cardH = 26 + (r.text || r.comment ? 10 : 0)
        setColor(i % 2 === 0 ? [248, 250, 252] : WHITE, 'fill')
        doc.roundedRect(margin, y, contentWidth, cardH, 3, 3, 'F')
        setColor(BLUE_LIGHT, 'fill')
        doc.roundedRect(margin, y, 3, cardH, 1.5, 1.5, 'F')

        const ratingNum = r.rating || 0
        const drawStar = (cx, cy, r1, r2, filled) => {
          const points = []
          for (let p = 0; p < 10; p++) {
            const angle = (p * Math.PI) / 5 - Math.PI / 2
            const radius = p % 2 === 0 ? r1 : r2
            points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)])
          }
          if (filled) {
            doc.setFillColor(234, 179, 8)
          } else {
            doc.setFillColor(203, 213, 225)
          }
          doc.lines(
            points.slice(1).map((pt, i) => [pt[0] - points[i][0], pt[1] - points[i][1]]),
            points[0][0], points[0][1], [1, 1], 'F', true
          )
        }
        for (let d = 0; d < 5; d++) {
          drawStar(margin + 7 + d * 5.5, y + 6, 2.5, 1.1, d < ratingNum)
        }

        setColor(SLATE_400)
        doc.setFontSize(7.5)
        doc.text(new Date(r.created_at).toLocaleDateString(), margin + 7, y + 15)
        setColor(SLATE_600)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text(r.user_name || 'Anonymous', margin + 40, y + 15)

        if (r.text || r.comment) {
          setColor(SLATE_600)
          doc.setFontSize(8)
          doc.setFont('helvetica', 'italic')
          const wrap = doc.splitTextToSize(`"${r.text || r.comment}"`, contentWidth - 14)
          doc.text(wrap[0], margin + 7, y + 23)
        }

        y += cardH + 4
      })

      if (reportData.reviews.length > 30) {
        setColor(SLATE_400)
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'italic')
        doc.text(`+ ${reportData.reviews.length - 30} more reviews not shown`, margin, y)
        y += 8
      }
      y += 4
    }

    if (reportData.deals?.length) {
      addSection('Deals & Promotions')

      reportData.deals.forEach((deal, i) => {
        newPageIfNeeded(36)

        setColor([240, 253, 244], 'fill')
        doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'F')
        setColor(GREEN, 'fill')
        doc.roundedRect(margin, y, 3, 32, 1.5, 1.5, 'F')

        setColor(SLATE_900)
        doc.setFontSize(9.5)
        doc.setFont('helvetica', 'bold')
        doc.text(deal.title || 'Untitled Deal', margin + 7, y + 8)

        if (deal.discount_type && deal.discount_value) {
          const label = deal.discount_type === 'percentage' ? `${deal.discount_value}% OFF` : `$${deal.discount_value} OFF`
          setColor(GREEN, 'fill')
          doc.roundedRect(pageWidth - margin - 28, y + 2, 26, 10, 3, 3, 'F')
          setColor(WHITE)
          doc.setFontSize(8)
          doc.setFont('helvetica', 'bold')
          doc.text(label, pageWidth - margin - 15, y + 8.5, { align: 'center' })
        }

        setColor(SLATE_600)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        const meta = [
          deal.is_active ? '● Active' : '○ Inactive',
          deal.expiry_date ? `Expires ${new Date(deal.expiry_date).toLocaleDateString()}` : '',
          deal.original_price ? `$${deal.original_price} → $${deal.discounted_price}` : '',
        ].filter(Boolean).join('   ')
        doc.text(meta, margin + 7, y + 17)

        if (deal.description) {
          setColor(SLATE_400)
          doc.setFontSize(7.5)
          doc.setFont('helvetica', 'italic')
          const wrap = doc.splitTextToSize(deal.description, contentWidth - 14)
          doc.text(wrap[0], margin + 7, y + 25)
        }

        y += 36
      })
      y += 4
    }

    if (reportData.favorites?.length) {
      addSection('Favourites')
      setColor(SLATE_600)
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.text(`${reportData.favorites.length} user${reportData.favorites.length !== 1 ? 's' : ''} have saved this business.`, margin, y)
      y += 10

      const cap = Math.min(reportData.favorites.length, 20)
      reportData.favorites.slice(0, cap).forEach((fav, i) => {
        newPageIfNeeded(8)
        setColor(i % 2 === 0 ? SLATE_100 : WHITE, 'fill')
        doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F')
        setColor(SLATE_600)
        doc.setFontSize(8)
        doc.text(`${i + 1}.  Saved on ${new Date(fav.created_at).toLocaleDateString()}`, margin + 4, y + 5)
        y += 9
      })
      if (reportData.favorites.length > 20) {
        setColor(SLATE_400)
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'italic')
        doc.text(`+ ${reportData.favorites.length - 20} more`, margin, y + 4)
        y += 10
      }
      y += 6
    }

    addFooter()
    doc.addPage()
    addPageHeader()
    addSection('Export Summary')

    const summaryRows = [
      ['Business Info',      reportData.business ? 'Included' : 'Not included'],
      ['Rating',             reportData.business?.rating ? `${reportData.business.rating}/5` : 'N/A'],
      ['Total Reviews',      String(reportData.reviews?.length  || 0)],
      ['Total Deals',        String(reportData.deals?.length    || 0)],
      ['Total Favourites',   String(reportData.favorites?.length || 0)],
      ['Export Start',       reportData.dateRange.start],
      ['Export End',         reportData.dateRange.end],
      ['Generated At',       new Date().toLocaleString()],
    ]
    summaryRows.forEach(([k, v], i) => addKV(k, v, i % 2 === 0))

    y += 10
    newPageIfNeeded(60)

    setColor(SLATE_100, 'fill')
    doc.roundedRect(margin, y, contentWidth, 52, 6, 6, 'F')
    setColor(BLUE, 'fill')
    doc.roundedRect(margin, y, contentWidth, 2, 6, 6, 'F')

    doc.addImage(vicinityLogoPng, 'PNG', pageWidth / 2 - 8, y + 8, 16, 16)

    setColor(SLATE_900)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Thank you for being part of Vicinity!', pageWidth / 2, y + 34, { align: 'center' })

    setColor(SLATE_400)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('We are glad to support your business journey.', pageWidth / 2, y + 42, { align: 'center' })

    y += 60
    addFooter()

    doc.save(`${businessName}_Vicinity_Report_${new Date().toISOString().split('T')[0]}.pdf`)
  } catch (err) {
    console.error('PDF generation error:', err)
    throw new Error('Failed to generate PDF')
  }
}


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
          <LoadingScreen />
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
                Settings
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage your account
              </p>
            </div>
          </div>
        </div>

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

        <main className="relative z-10">
          <div className="max-w-3xl mx-auto p-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 mx-auto mb-4">
                  <FaDownload size={20} />
                </div>

                <h3 className="text-2xl font-[var(--font-outfit)] font-semibold tracking-[-0.04em] text-slate-900 dark:text-white mb-2 text-center">
                  Configure Data Export
                </h3>

                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed text-center">
                  Choose what data to include and the date range for your export
                </p>

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

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowExportModal(false)}
                    disabled={isExporting}
                    whileHover={!isExporting ? { scale: 1.02 } : {}}
                    whileTap={!isExporting ? { scale: 0.98 } : {}}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-[#162033] hover:bg-slate-200 dark:hover:bg-[#1d2a44] text-slate-700 dark:text-white font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </motion.button>

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
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 mx-auto mb-4">
                  <FaKey size={20} />
                </div>

                <h3 className="text-xl font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white mb-2 text-center">
                  Update Password
                </h3>

                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed text-center">
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
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/20 mx-auto mb-4">
                  <FaExclamationTriangle size={20} />
                </div>

                <h3 className="text-xl font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white mb-2 text-center">
                  Delete Account?
                </h3>

                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed text-center">
                  This will permanently delete your business profile, reviews, and all associated data. This action cannot be undone.
                </p>

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
