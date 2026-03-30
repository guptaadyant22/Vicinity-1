'use client'

// =============================================================================
// USER MESSAGES PAGE — Vicinity
// =============================================================================
// Flow:
// 1. User opens a business chat from the business page via ?businessId=...
// 2. If a thread already exists, it opens that thread
// 3. If no thread exists, shows the first-message composer
// 4. First message is sent via the create_message_thread RPC (atomic)
// 5. Once accepted by the business, normal active chat begins
// =============================================================================

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaComments,
  FaClock,
  FaCheck,
  FaTimesCircle,
  FaPaperPlane,
  FaStore,
  FaSearch,
  FaFilter,
  FaSync,
  FaArrowLeft,
  FaFire,
  FaBolt,
  FaTimes,
} from 'react-icons/fa'
import { createClient } from '../../../lib/supabase'
import UserNavbar from '../../../components/UserNavbar'
import { FogBackground } from '@/components/ui/fog'

// -- Shared Vicinity glass UI -------------------------------------------------
const UI = {
  // Main page wrapper
  page: 'relative min-h-screen bg-transparent text-slate-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden transition-colors duration-300',

  // Main shell / panel style
  shell:
    'bg-white/20 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-[30px] shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition-colors duration-300',

  // Soft card style
  cardSoft:
    'bg-white/12 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/25 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(59,130,246,0.08)] transition-colors duration-300',

  // Input style
  input:
    'w-full px-4 py-3 rounded-2xl bg-white/14 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/25 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-400/60 focus:bg-white/20 dark:focus:bg-white/[0.06] transition-all text-sm',

  // Button styles
  primaryBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]',
  secondaryBtn:
    'bg-white/14 dark:bg-white/[0.04] backdrop-blur-2xl hover:bg-white/22 dark:hover:bg-white/[0.07] text-slate-700 dark:text-white border border-white/25 dark:border-white/10',
}

// -- Color tokens for stat cards ----------------------------------------------
const colorMap = {
  blue: {
    iconWrap:
      'bg-blue-500/10 dark:bg-blue-500/10 border-blue-400/20 dark:border-blue-400/20 text-blue-700 dark:text-blue-300',
    glow: 'rgba(59,130,246,0.18)',
  },
  cyan: {
    iconWrap:
      'bg-cyan-500/10 dark:bg-cyan-500/10 border-cyan-400/20 dark:border-cyan-400/20 text-cyan-700 dark:text-cyan-300',
    glow: 'rgba(6,182,212,0.16)',
  },
  rose: {
    iconWrap:
      'bg-rose-500/10 dark:bg-rose-500/10 border-rose-400/20 dark:border-rose-400/20 text-rose-700 dark:text-rose-300',
    glow: 'rgba(244,63,94,0.14)',
  },
}

// -- Stat card ----------------------------------------------------------------
const StatCard = ({ label, value, icon: Icon, color, delay }) => {
  const t = colorMap[color] || colorMap.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className={`${UI.cardSoft} group relative p-6 overflow-hidden`}
    >
      {/* Soft glow on hover */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[70px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle, ${t.glow}, transparent 65%)` }}
      />

      <div className="relative z-10 flex items-center gap-4">
        <div className={`p-3.5 rounded-2xl border ${t.iconWrap}`}>
          <Icon size={22} />
        </div>

        <div>
          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
            {value}
          </p>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mt-1.5">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// -- Status badge helpers -----------------------------------------------------
const getStatusStyles = (status) => {
  if (status === 'active') {
    return {
      wrap: 'bg-green-100/80 dark:bg-green-500/10 border-green-200/70 dark:border-green-500/30 text-green-700 dark:text-green-300',
      icon: FaCheck,
    }
  }

  if (status === 'ignored') {
    return {
      wrap: 'bg-red-100/80 dark:bg-red-500/10 border-red-200/70 dark:border-red-500/30 text-red-700 dark:text-red-300',
      icon: FaTimesCircle,
    }
  }

  return {
    wrap: 'bg-blue-100/80 dark:bg-blue-500/10 border-blue-200/70 dark:border-blue-500/20 text-blue-700 dark:text-blue-300',
    icon: FaClock,
  }
}

// -- Time formatter -----------------------------------------------------------
const formatTime = (dateValue) => {
  if (!dateValue) return 'Recently'

  return new Date(dateValue).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// -- Request card -------------------------------------------------------------
const RequestCard = ({ request, selected, onClick }) => {
  const statusStyles = getStatusStyles(request.status)
  const StatusIcon = statusStyles.icon

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full text-left rounded-[24px] border overflow-hidden transition-all backdrop-blur-2xl ${
        selected
          ? 'border-blue-300/50 dark:border-blue-500/30 bg-white/30 dark:bg-white/[0.06] shadow-lg'
          : 'border-white/25 dark:border-white/10 bg-white/14 dark:bg-white/[0.03] hover:bg-white/20 dark:hover:bg-white/[0.06]'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
              {request.businesses?.name || 'Business'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase mt-1">
              {request.businesses?.type || 'Business'}
            </p>
          </div>

          <div className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase flex items-center gap-1.5 ${statusStyles.wrap}`}>
            <StatusIcon size={11} />
            {request.status}
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
          {request.summary || 'No summary yet'}
        </p>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            {request.businesses?.city || 'Unknown city'}
            {request.businesses?.state ? `, ${request.businesses.state}` : ''}
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-300">Open →</span>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-white/20 dark:border-white/10 bg-white/12 dark:bg-white/[0.03] text-xs text-slate-500 dark:text-slate-400">
        Updated {formatTime(request.updated_at || request.created_at)}
      </div>
    </motion.button>
  )
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================
export default function UserMessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [supabase] = useState(() => createClient())

  // Business id from URL query param
  const preselectedBusinessId = searchParams.get('businessId')

  // -- Auth state -------------------------------------------------------------
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // -- Data state -------------------------------------------------------------
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [messages, setMessages] = useState([])

  // -- Loading / sending flags ------------------------------------------------
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)

  // -- Filter state -----------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // -- Input state ------------------------------------------------------------
  const [firstMessage, setFirstMessage] = useState('')
  const [chatMessage, setChatMessage] = useState('')

  // -- Feedback state ---------------------------------------------------------
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // -- Stable refs ------------------------------------------------------------
  const selectedRequestIdRef = useRef(null)
  const hasHandledPreselectRef = useRef(false)
  const messagesEndRef = useRef(null)

  // Keep selected request ref synced
  useEffect(() => {
    selectedRequestIdRef.current = selectedRequest?.id || null
  }, [selectedRequest?.id])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // -- Auth check -------------------------------------------------------------
  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push('/login')
          return
        }

        setUser(authUser)
      } catch (err) {
        console.error('Auth error:', err)
        setError('Failed to load account.')
      } finally {
        setAuthLoading(false)
      }
    }

    loadUser()
  }, [router, supabase])

  // -- Load requests ----------------------------------------------------------
  const loadRequests = useCallback(
    async (showLoader = true) => {
      if (!user?.id) return

      try {
        if (showLoader) setLoading(true)

        const { data, error: fetchErr } = await supabase
          .from('message_requests')
          .select(`*, businesses (id, name, type, city, state, image_url)`)
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (fetchErr) throw fetchErr

        const rows = data || []
        setRequests(rows)

        // Handle preselected business
        if (preselectedBusinessId && !hasHandledPreselectRef.current) {
          hasHandledPreselectRef.current = true

          const existing = rows.find((r) => r.business_id === preselectedBusinessId)

          if (existing) {
            setSelectedRequest(existing)
            setSelectedBusiness(existing.businesses || null)
            await loadMessages(existing.id, false)
            return
          }

          const { data: bizData, error: bizErr } = await supabase
            .from('businesses')
            .select('id, name, type, city, state, image_url')
            .eq('id', preselectedBusinessId)
            .single()

          if (!bizErr && bizData) {
            setSelectedBusiness(bizData)
            setSelectedRequest(null)
            setMessages([])
            return
          }
        }

        // No requests state
        if (rows.length === 0) {
          if (!preselectedBusinessId) {
            setSelectedRequest(null)
            setSelectedBusiness(null)
            setMessages([])
          }
          return
        }

        // Preserve selected request on refresh
        const currentId = selectedRequestIdRef.current
        const keepSelected = currentId ? rows.find((r) => r.id === currentId) : null
        const nextSelected = keepSelected || rows[0]

        setSelectedRequest(nextSelected)
        setSelectedBusiness(nextSelected.businesses || null)

        if (currentId !== nextSelected.id || messages.length === 0) {
          await loadMessages(nextSelected.id, false)
        }
      } catch (err) {
        console.error('Load requests error:', err)
        setError('Failed to load messages.')
      } finally {
        if (showLoader) setLoading(false)
      }
    },
    [user?.id, preselectedBusinessId, supabase]
  )

  // -- Load messages ----------------------------------------------------------
  const loadMessages = useCallback(
    async (requestId, showLoader = true) => {
      if (!requestId) {
        setMessages([])
        return
      }

      try {
        if (showLoader) setMessagesLoading(true)

        const { data, error: fetchErr } = await supabase
          .from('messages')
          .select('*')
          .eq('request_id', requestId)
          .order('created_at', { ascending: true })

        if (fetchErr) throw fetchErr
        setMessages(data || [])

        // Refresh selected request details
        const { data: freshReq } = await supabase
          .from('message_requests')
          .select(`*, businesses (id, name, type, city, state, image_url)`)
          .eq('id', requestId)
          .single()

        if (freshReq) {
          setSelectedRequest(freshReq)
          setSelectedBusiness(freshReq.businesses || null)
        }
      } catch (err) {
        console.error('Load messages error:', err)
      } finally {
        if (showLoader) setMessagesLoading(false)
      }
    },
    [supabase]
  )

  // -- Initial load -----------------------------------------------------------
  useEffect(() => {
    if (!user?.id) return
    loadRequests()
  }, [user?.id, loadRequests])

  // -- Realtime request list updates -----------------------------------------
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`user-requests-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_requests',
          filter: `user_id=eq.${user.id}`,
        },
        () => loadRequests(false)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, supabase, loadRequests])

  // -- Realtime messages for selected request --------------------------------
  useEffect(() => {
    if (!selectedRequest?.id) return

    const channel = supabase
      .channel(`user-msgs-${selectedRequest.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `request_id=eq.${selectedRequest.id}`,
        },
        () => loadMessages(selectedRequest.id, false)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedRequest?.id, supabase, loadMessages])

  // -- Send first message -----------------------------------------------------
  const handleSendFirstMessage = async (e) => {
    e.preventDefault()
    if (!firstMessage.trim() || !selectedBusiness?.id || !user?.id) return

    try {
      setSending(true)
      setError(null)

      const messageText = firstMessage.trim()
      const now = new Date().toISOString()

      // Try atomic RPC first
      const { data: rpcData, error: rpcErr } = await supabase.rpc('create_message_thread', {
        p_business_id: selectedBusiness.id,
        p_first_message: messageText,
      })

      if (rpcErr) {
        console.warn('[Vicinity] RPC failed, falling back:', rpcErr.message)

        // Existing thread fallback
        const existingMatch = requests.find((r) => r.business_id === selectedBusiness.id)
        if (existingMatch) {
          setSelectedRequest(existingMatch)
          setSelectedBusiness(existingMatch.businesses || selectedBusiness)
          setFirstMessage('')
          await loadMessages(existingMatch.id)
          setSuccess('You already have a request with this business.')
          setTimeout(() => setSuccess(null), 2500)
          return
        }

        // Direct insert fallback
        const { data: requestRow, error: reqErr } = await supabase
          .from('message_requests')
          .insert([
            {
              business_id: selectedBusiness.id,
              user_id: user.id,
              summary: messageText,
              status: 'pending',
              created_at: now,
              updated_at: now,
            },
          ])
          .select(`*, businesses (id, name, type, city, state, image_url)`)
          .single()

        if (reqErr) throw reqErr

        const { error: msgErr } = await supabase.from('messages').insert([
          {
            request_id: requestRow.id,
            sender: 'user',
            text: messageText,
            created_at: now,
            user_id: user.id,
          },
        ])

        if (msgErr) {
          console.error('[Vicinity] Message insert failed:', msgErr)
          setError('Request created but first message failed to save. Try sending again.')
          setSelectedRequest(requestRow)
          setSelectedBusiness(requestRow.businesses || selectedBusiness)
          setFirstMessage('')
          await loadRequests(false)
          setTimeout(() => setError(null), 4000)
          return
        }

        setFirstMessage('')
        setSelectedRequest(requestRow)
        setSelectedBusiness(requestRow.businesses || selectedBusiness)
        setSuccess('Request sent successfully!')
        setTimeout(() => setSuccess(null), 2500)
        await loadRequests(false)
        await loadMessages(requestRow.id, false)
        return
      }

      // RPC success
      setFirstMessage('')
      setSuccess(rpcData.already_existed ? 'Thread already exists — opening it.' : 'Request sent successfully!')
      setTimeout(() => setSuccess(null), 2500)

      await loadRequests(false)
      await loadMessages(rpcData.request_id, false)
    } catch (err) {
      console.error('[Vicinity] First message error:', err)
      setError(`Failed to send request: ${err.message || 'Unknown error'}`)
      setTimeout(() => setError(null), 4000)
    } finally {
      setSending(false)
    }
  }

  // -- Send chat message ------------------------------------------------------
  const handleSendChatMessage = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim() || !selectedRequest?.id || selectedRequest.status !== 'active') return

    try {
      setSending(true)
      setError(null)

      const messageText = chatMessage.trim()
      const now = new Date().toISOString()

      const { error: rpcErr } = await supabase.rpc('send_chat_message', {
        p_request_id: selectedRequest.id,
        p_sender: 'user',
        p_text: messageText,
      })

      if (rpcErr) {
        console.warn('[Vicinity] Chat RPC failed, falling back:', rpcErr.message)

        const { error: insertErr } = await supabase.from('messages').insert([
          {
            request_id: selectedRequest.id,
            sender: 'user',
            text: messageText,
            created_at: now,
            user_id: user.id,
          },
        ])

        if (insertErr) throw insertErr

        await supabase.from('message_requests').update({ updated_at: now }).eq('id', selectedRequest.id)
      }

      setChatMessage('')
      await loadRequests(false)
    } catch (err) {
      console.error('[Vicinity] Chat message error:', err)
      setError(`Failed to send message: ${err.message || 'Unknown error'}`)
      setTimeout(() => setError(null), 3000)
    } finally {
      setSending(false)
    }
  }

  // -- Logout -----------------------------------------------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // -- Filtered requests ------------------------------------------------------
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      const matchesSearch =
        searchQuery === '' ||
        r.businesses?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.businesses?.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.summary?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [requests, searchQuery, statusFilter])

  // -- Stats ------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      active: requests.filter((r) => r.status === 'active').length,
      activity: `${messages.length}+`,
    }),
    [requests, messages.length]
  )

  // -- Derived state ----------------------------------------------------------
  const canSendFirstMessage = !!selectedBusiness && !selectedRequest
  const isPending = selectedRequest?.status === 'pending'
  const isIgnored = selectedRequest?.status === 'ignored'
  const isActive = selectedRequest?.status === 'active'

  // -- Loading screen ---------------------------------------------------------
  if (authLoading || !user) {
    return <div className="min-h-screen bg-transparent" />
  }

  // -- Render -----------------------------------------------------------------
  return (
    <div className={UI.page}>
      {/* Same fog background as saved page */}
      <FogBackground
        className="fixed inset-0 z-0"
        color="#60a5fa"
        darkColor="#2563eb"
        opacity={0.32}
        speed={1}
      />

      {/* Main content */}
      <div className="relative z-10">
        <UserNavbar activePage="messages" onLogout={handleLogout} />

        <main className="max-w-7xl mx-auto px-6 py-10 pt-32">
          {/* Heading */}
          <section className="mb-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-[0.9]">
                Your Chats, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500 dark:from-blue-300 dark:to-cyan-300">
                  Your Connections
                </span>
              </h1>

              <p className="text-slate-700 dark:text-slate-300 text-lg max-w-2xl leading-relaxed">
                Start a request, wait for approval, and continue the conversation once the business accepts.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Threads" value={stats.total} icon={FaComments} color="blue" delay={0.1} />
              <StatCard label="Pending" value={stats.pending} icon={FaClock} color="cyan" delay={0.2} />
              <StatCard label="Active" value={stats.active} icon={FaBolt} color="rose" delay={0.3} />
              <StatCard label="Messages" value={stats.activity} icon={FaFire} color="blue" delay={0.4} />
            </div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-slate-500 dark:text-slate-400 text-sm" />
                </div>

                <input
                  type="text"
                  placeholder="Search by business name, type, or request summary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${UI.input} pl-11 pr-12 py-3.5`}
                />

                {searchQuery && (
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <FaTimes size={14} />
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Filter bar */}
            <div className={`flex flex-wrap items-center gap-4 p-4 rounded-[24px] ${UI.cardSoft}`}>
              <FaFilter className="text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Filter by Status:</span>

              {['all', 'pending', 'active', 'ignored'].map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white border-transparent shadow-lg shadow-blue-500/20'
                      : 'bg-white/14 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-white/25 dark:border-white/10 hover:bg-white/22 dark:hover:bg-white/[0.07]'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </motion.button>
              ))}

              <div className="ml-auto">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => loadRequests()}
                  className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${UI.secondaryBtn}`}
                >
                  <FaSync size={12} />
                  Refresh
                </motion.button>
              </div>
            </div>
          </section>

          {/* Main layout */}
          <div className="grid grid-cols-1 xl:grid-cols-[370px_minmax(0,1fr)] gap-6">
            {/* Sidebar */}
            <div className={UI.shell}>
              <div className="p-4 space-y-4 max-h-[900px] overflow-y-auto">
                {/* New conversation banner */}
                {selectedBusiness && !selectedRequest && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-blue-200/70 dark:border-blue-500/20 bg-blue-50/80 dark:bg-blue-500/10 p-4"
                  >
                    <p className="text-sm font-black text-blue-700 dark:text-blue-300 mb-1">Ready to start chat</p>
                    <p className="text-xs text-blue-600 dark:text-blue-200">
                      {selectedBusiness.name} was opened from the business page. Send your first request below.
                    </p>
                  </motion.div>
                )}

                {/* Loading / list / empty states */}
                {loading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-36 rounded-2xl bg-white/10 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/20 dark:border-white/10 animate-pulse"
                      />
                    ))}
                  </>
                ) : filteredRequests.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {filteredRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        selected={selectedRequest?.id === request.id}
                        onClick={async () => {
                          setSelectedRequest(request)
                          setSelectedBusiness(request.businesses || null)
                          await loadMessages(request.id)
                        }}
                      />
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-20 rounded-2xl border border-dashed border-white/25 dark:border-white/10 bg-white/12 dark:bg-white/[0.03]">
                    <FaComments className="mx-auto mb-4 text-slate-400 dark:text-slate-500" size={32} />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No matching chats</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                      Try a different search or open a business page and press chat.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat panel */}
            <div className={UI.shell}>
              {selectedBusiness ? (
                <>
                  {/* Panel header */}
                  <div className="px-6 py-5 border-b border-white/20 dark:border-white/10 bg-white/12 dark:bg-white/[0.03]">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                          {selectedBusiness.name}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {selectedBusiness.type || 'Business'}
                          {selectedBusiness.city ? ` • ${selectedBusiness.city}` : ''}
                          {selectedBusiness.state ? `, ${selectedBusiness.state}` : ''}
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => router.back()}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${UI.secondaryBtn}`}
                      >
                        <FaArrowLeft size={12} />
                        Back
                      </motion.button>
                    </div>
                  </div>

                  {/* Alerts */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mx-6 mt-5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50/85 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
                      >
                        {error}
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mx-6 mt-5 rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50/85 dark:bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300"
                      >
                        {success}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Status banners */}
                  <div className="px-6 pt-6">
                    {isPending && (
                      <div className="mb-4 p-4 rounded-2xl bg-blue-50/85 dark:bg-blue-500/10 border border-blue-200/70 dark:border-blue-500/20">
                        <p className="text-sm font-black text-blue-700 dark:text-blue-300 mb-1">Request pending</p>
                        <p className="text-sm text-blue-700/80 dark:text-blue-200">
                          You already sent your first message. Wait for the business to accept before sending more.
                        </p>
                      </div>
                    )}

                    {isIgnored && (
                      <div className="mb-4 p-4 rounded-2xl bg-red-100/85 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20">
                        <p className="text-sm font-black text-red-700 dark:text-red-300 mb-1">Request ignored</p>
                        <p className="text-sm text-red-700/80 dark:text-red-200">
                          This business did not open the conversation.
                        </p>
                      </div>
                    )}

                    {isActive && (
                      <div className="mb-4 p-4 rounded-2xl bg-green-100/85 dark:bg-green-500/10 border border-green-200/70 dark:border-green-500/20">
                        <p className="text-sm font-black text-green-700 dark:text-green-300 mb-1">Chat is active</p>
                        <p className="text-sm text-green-700/80 dark:text-green-200">
                          The business accepted your request. You can now chat normally.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="px-6 py-6 min-h-[420px] max-h-[520px] overflow-y-auto space-y-4">
                    {messagesLoading ? (
                      <div className="h-56 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
                        />
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((msg, idx) => {
                        const isUserMessage = msg.sender === 'user'

                        return (
                          <motion.div
                            key={msg.id || idx}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                                isUserMessage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white/16 dark:bg-white/[0.05] border border-white/25 dark:border-white/10 text-slate-800 dark:text-slate-200 backdrop-blur-2xl'
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                              <p
                                className={`text-[11px] mt-2 ${
                                  isUserMessage ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="text-center py-24 rounded-3xl border border-dashed border-white/25 dark:border-white/10 bg-white/12 dark:bg-white/[0.03]">
                        <div className="w-20 h-20 bg-white/20 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20 dark:border-white/10">
                          <FaStore size={28} className="text-slate-400 dark:text-white/30" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No messages yet</h3>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                          Start by sending your first request message to this business.
                        </p>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Composer */}
                  <div className="p-6 border-t border-white/20 dark:border-white/10 bg-white/12 dark:bg-white/[0.03]">
                    {/* First message composer */}
                    {canSendFirstMessage && (
                      <form onSubmit={handleSendFirstMessage} className="space-y-3">
                        <textarea
                          value={firstMessage}
                          onChange={(e) => setFirstMessage(e.target.value)}
                          placeholder="Write why you want to connect with this business..."
                          rows={4}
                          className={`${UI.input} p-4 resize-none`}
                        />

                        <div className="flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={sending || !firstMessage.trim()}
                            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-shadow disabled:opacity-50 ${UI.primaryBtn}`}
                          >
                            <FaPaperPlane size={14} />
                            {sending ? 'Sending...' : 'Send Request'}
                          </motion.button>
                        </div>
                      </form>
                    )}

                    {/* Pending notice */}
                    {isPending && (
                      <div className="p-4 rounded-2xl bg-white/14 dark:bg-white/[0.04] border border-white/25 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400 backdrop-blur-2xl">
                        You already sent your first message. Wait for the business to accept before sending more.
                      </div>
                    )}

                    {/* Ignored notice */}
                    {isIgnored && (
                      <div className="p-4 rounded-2xl bg-white/14 dark:bg-white/[0.04] border border-white/25 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400 backdrop-blur-2xl">
                        This request is closed and can no longer receive messages.
                      </div>
                    )}

                    {/* Active composer */}
                    {isActive && (
                      <form onSubmit={handleSendChatMessage} className="flex gap-3">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Type your message..."
                          className={`${UI.input} flex-1`}
                        />

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={sending || !chatMessage.trim()}
                          className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-shadow disabled:opacity-50 ${UI.primaryBtn}`}
                        >
                          <FaPaperPlane size={14} />
                          {sending ? 'Sending...' : 'Send'}
                        </motion.button>
                      </form>
                    )}
                  </div>
                </>
              ) : (
                // No conversation selected
                <div className="text-center py-32 px-6">
                  <div className="w-20 h-20 bg-white/20 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20 dark:border-white/10">
                    <FaComments size={30} className="text-slate-400 dark:text-white/30" />
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    No conversation selected
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    Open a business page and tap chat, or choose an existing request from the left.
                  </p>

                  <a
                    href="/user/dashboard"
                    className="inline-block px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
                  >
                    Browse Businesses
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}