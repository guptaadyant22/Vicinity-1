'use client'

// =============================================================================
// BUSINESS MESSAGES PAGE — Vicinity
// =============================================================================
// Flow:
// 1. Business owner views incoming message requests
// 2. Can filter by pending / active / ignored
// 3. Can accept or ignore pending requests via RPC
// 4. Once accepted, can chat with the user in real-time
// =============================================================================

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaEnvelope,
  FaCheck,
  FaUser,
  FaSync,
  FaPaperPlane,
  FaStore,
  FaInbox,
  FaComments,
  FaTimesCircle,
  FaLock,
  FaExclamationTriangle,
} from 'react-icons/fa'
import { Inter, Outfit } from 'next/font/google'

import { useAuth } from '../../../context/AuthContext'
import { createClient } from '../../../lib/supabase'
import BusinessLayout from '../../../components/BusinessLayout'

// -- Font setup --------------------------------------------------------------
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

// -- Theme tokens (Vicinity design language) ---------------------------------
const PAGE_WRAP = `${inter.variable} ${outfit.variable} relative min-h-screen overflow-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-[#081120] dark:text-white`

const GLASS_BG = 'bg-white/75 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 transition-colors duration-300'

const GLASS_CARD = 'bg-white/80 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 rounded-[28px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:border-blue-500/28 hover:shadow-[0_20px_60px_rgba(59,130,246,0.10)] transition-all duration-300'

const GLASS_INPUT = 'w-full px-4 py-2.5 bg-white dark:bg-[#111827] border border-blue-500/15 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-blue-50/50 dark:focus:bg-[#162033] focus:outline-none transition-all'

// -- Background component ----------------------------------------------------
function PageBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        className="absolute right-[-6%] top-[14%] h-[340px] w-[340px] rounded-full bg-blue-100/70 blur-[120px] dark:bg-blue-600/10"
      />

      {/* Grid pattern */}
      <motion.div
        animate={{
          backgroundPosition: ['0px 0px', '72px 72px'],
          transition: { duration: 18, repeat: Infinity, ease: 'linear' },
        }}
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(59,130,246,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.22) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(circle at center, black 45%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 100%)',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#081120]" />
    </div>
  )
}

// -- Helpers -----------------------------------------------------------------
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

const getStatusBadgeClasses = (status) => {
  if (status === 'active') return 'bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300'
  if (status === 'ignored') return 'bg-slate-100 dark:bg-[#162033] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
  return 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300'
}


// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================
export default function BusinessMessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const [supabase] = useState(() => createClient())

  // -- Data state ------------------------------------------------------------
  const [business, setBusiness] = useState(null)
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [currentMessages, setCurrentMessages] = useState([])

  // -- UI state --------------------------------------------------------------
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState('pending')
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  // -- Stable ref to preserve selection across realtime updates ---------------
  const selectedRequestIdRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Keep ref in sync
  useEffect(() => {
    selectedRequestIdRef.current = selectedRequest?.id || null
  }, [selectedRequest?.id])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages])


  // -- LOAD CONVERSATION MESSAGES --------------------------------------------
  const loadConversation = useCallback(async (requestId, showLoader = true) => {
    if (!requestId) { setCurrentMessages([]); return }

    try {
      if (showLoader) setMessagesLoading(true)

      const { data, error: fetchErr } = await supabase
        .from('messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true })

      if (fetchErr) throw fetchErr
      setCurrentMessages(data || [])

      // Refresh the selected request to pick up status/timestamp changes
      const { data: freshReq } = await supabase
        .from('message_requests')
        .select(`*, businesses (id, name, image_url, city, state, type)`)
        .eq('id', requestId)
        .single()

      if (freshReq) setSelectedRequest(freshReq)
    } catch (e) {
      console.error('Error loading conversation:', e)
      setError('Failed to load conversation.')
    } finally {
      if (showLoader) setMessagesLoading(false)
    }
  }, [supabase])

  // -- LOAD ALL REQUESTS -----------------------------------------------------
  const loadRequests = useCallback(async (showLoader = true) => {
    if (!user?.id) return

    try {
      if (showLoader) setLoading(true)
      setError(null)

      let bizData = business

      // Load business record once
      if (!bizData) {
        const { data, error: bizErr } = await supabase
          .from('businesses')
          .select('id, name, image_url')
          .eq('owner_id', user.id)
          .single()

        if (bizErr) throw bizErr
        if (!data) {
          setError('No business profile found.')
          setRequests([])
          setSelectedRequest(null)
          setCurrentMessages([])
          return
        }

        bizData = data
        setBusiness(data)
      }

      // Load request threads sorted by most recently updated
      const { data: rows, error: reqErr } = await supabase
        .from('message_requests')
        .select(`*, businesses (id, name, image_url, city, state, type)`)
        .eq('business_id', bizData.id)
        .order('updated_at', { ascending: false })

      if (reqErr) throw reqErr

      const list = rows || []
      setRequests(list)

      if (list.length === 0) {
        setSelectedRequest(null)
        setCurrentMessages([])
        return
      }

      // Preserve current selection across refreshes
      const currentId = selectedRequestIdRef.current
      const stillExists = currentId ? list.find((r) => r.id === currentId) : null
      const next = stillExists || list[0]

      setSelectedRequest(next)

      if (currentId !== next.id || currentMessages.length === 0) {
        await loadConversation(next.id, false)
      }
    } catch (e) {
      console.error('Error loading business requests:', e)
      setError(`Failed to load messages: ${e.message}`)
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [user?.id, business, supabase, loadConversation, currentMessages.length])


  // -- INITIAL LOAD ----------------------------------------------------------
  useEffect(() => {
    if (!user?.id) return
    loadRequests()
  }, [user?.id])

  // -- REALTIME: REQUEST LIST ------------------------------------------------
  useEffect(() => {
    if (!business?.id) return

    const channel = supabase
      .channel(`biz-requests-${business.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_requests',
        filter: `business_id=eq.${business.id}`,
      }, () => loadRequests(false))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [business?.id, supabase, loadRequests])

  // -- REALTIME: MESSAGES FOR SELECTED THREAD --------------------------------
  useEffect(() => {
    if (!selectedRequest?.id) return

    const channel = supabase
      .channel(`biz-msgs-${selectedRequest.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `request_id=eq.${selectedRequest.id}`,
      }, () => loadConversation(selectedRequest.id, false))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [selectedRequest?.id, supabase, loadConversation])

  // -- ACCEPT REQUEST (RPC with fallback) ------------------------------------
  const handleAcceptRequest = async (requestId) => {
    try {
      setError(null)
      const now = new Date().toISOString()

      // Try the RPC first
      const { error: rpcErr } = await supabase.rpc('update_request_status', {
        p_request_id: requestId,
        p_new_status: 'active',
      })

      if (rpcErr) {
        console.warn('[Vicinity] Accept RPC failed, falling back:', rpcErr.message)
        // Fallback: direct update
        const { error: updateErr } = await supabase
          .from('message_requests')
          .update({ status: 'active', updated_at: now })
          .eq('id', requestId)

        if (updateErr) throw updateErr
      }

      setSuccess('✅ Request accepted!')
      setTimeout(() => setSuccess(null), 2000)

      await loadRequests(false)
      if (selectedRequest?.id === requestId) {
        await loadConversation(requestId, false)
      }
    } catch (err) {
      console.error('[Vicinity] Accept request error:', err)
      setError(err.message || 'Failed to accept request.')
      setTimeout(() => setError(null), 3000)
    }
  }

  // -- IGNORE REQUEST (RPC with fallback) ------------------------------------
  const handleIgnoreRequest = async (requestId) => {
    try {
      setError(null)
      const now = new Date().toISOString()

      // Try the RPC first
      const { error: rpcErr } = await supabase.rpc('update_request_status', {
        p_request_id: requestId,
        p_new_status: 'ignored',
      })

      if (rpcErr) {
        console.warn('[Vicinity] Ignore RPC failed, falling back:', rpcErr.message)
        // Fallback: direct update
        const { error: updateErr } = await supabase
          .from('message_requests')
          .update({ status: 'ignored', updated_at: now })
          .eq('id', requestId)

        if (updateErr) throw updateErr
      }

      setSuccess('👋 Request ignored')
      setTimeout(() => setSuccess(null), 2000)

      await loadRequests(false)
      if (selectedRequest?.id === requestId) {
        await loadConversation(requestId, false)
      }
    } catch (err) {
      console.error('[Vicinity] Ignore request error:', err)
      setError(err.message || 'Failed to ignore request.')
      setTimeout(() => setError(null), 3000)
    }
  }

  // -- SEND BUSINESS REPLY (RPC with fallback) -------------------------------
  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedRequest?.id || selectedRequest.status !== 'active') return

    try {
      setSendingReply(true)
      setError(null)

      const messageText = replyText.trim()
      const now = new Date().toISOString()

      // Try the RPC first (bypasses RLS cleanly)
      console.log('[Vicinity] Sending business reply via RPC...')
      const { error: rpcErr } = await supabase.rpc('send_chat_message', {
        p_request_id: selectedRequest.id,
        p_sender: 'business',
        p_text: messageText,
      })

      if (rpcErr) {
        console.warn('[Vicinity] Reply RPC failed, falling back:', rpcErr.message)

        // Fallback: direct insert
        const { error: insertErr } = await supabase.from('messages').insert([{
          request_id: selectedRequest.id,
          sender: 'business',
          text: messageText,
          created_at: now,
          user_id: selectedRequest.user_id,
        }])

        if (insertErr) throw insertErr

        // Manually update timestamp
        await supabase
          .from('message_requests')
          .update({ updated_at: now })
          .eq('id', selectedRequest.id)
      }

      setReplyText('')
      setSuccess('✅ Message sent!')
      setTimeout(() => setSuccess(null), 2000)
      await loadRequests(false)
    } catch (err) {
      console.error('[Vicinity] Reply error:', err)
      setError(`Failed to send message: ${err.message || 'Unknown error'}`)
      setTimeout(() => setError(null), 3000)
    } finally {
      setSendingReply(false)
    }
  }

  // -- FILTERED REQUESTS -----------------------------------------------------
  const filteredRequests = useMemo(() => {
    if (filterType === 'pending') return requests.filter((r) => r.status === 'pending')
    if (filterType === 'active') return requests.filter((r) => r.status === 'active')
    if (filterType === 'ignored') return requests.filter((r) => r.status === 'ignored')
    return requests
  }, [requests, filterType])

  // -- STATS -----------------------------------------------------------------
  const stats = useMemo(() => ({
    pendingRequests: requests.filter((r) => r.status === 'pending').length,
    activeChats: requests.filter((r) => r.status === 'active').length,
    ignoredRequests: requests.filter((r) => r.status === 'ignored').length,
    totalMessages: currentMessages.length,
  }), [requests, currentMessages.length])

  // -- DERIVED STATE ---------------------------------------------------------
  const isPending = selectedRequest?.status === 'pending'
  const isActive = selectedRequest?.status === 'active'
  const isIgnored = selectedRequest?.status === 'ignored'

  // -- LOADING SCREEN --------------------------------------------------------
  if (loading || authLoading) {
    return (
      <BusinessLayout>
        <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
          <PageBackground />
          <div className="relative z-10 h-screen flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-full border-[3px] border-blue-500/30 border-t-blue-600 dark:border-blue-400/20 dark:border-t-blue-300"
            />
          </div>
        </div>
      </BusinessLayout>
    )
  }

  // -- RENDER ----------------------------------------------------------------
  return (
    <BusinessLayout>
      <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
        <PageBackground />

        {/* Top header bar */}
        <div className="relative z-10 border-b border-blue-500/10 dark:border-white/10 bg-white/70 dark:bg-[#0b1322] backdrop-blur-xl transition-colors duration-300">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
            <div className="absolute right-20 top-0 h-20 w-20 rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-400/10" />
          </div>

          <div className="relative flex min-h-[88px] items-center px-8">
            <div>
              <h1 className="font-[var(--font-outfit)] text-[30px] font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">
                Messages
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage customer requests & conversations
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
              className="px-8 py-3 bg-red-50/90 dark:bg-[#1f1720] border-b border-red-300/50 dark:border-red-400/20 text-red-700 dark:text-red-300 text-sm flex items-center gap-3 relative z-10 backdrop-blur-xl"
            >
              <FaExclamationTriangle />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-8 py-3 bg-blue-50/90 dark:bg-[#0f172a] border-b border-blue-300/50 dark:border-blue-400/20 text-blue-700 dark:text-blue-300 text-sm flex items-center gap-3 relative z-10 backdrop-blur-xl"
            >
              <FaCheck />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-7xl mx-auto p-8 pb-20">
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={GLASS_CARD}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">Pending Requests</p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaEnvelope size={16} />
                  </div>
                </div>
                <p className="text-4xl font-[var(--font-outfit)] font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">{stats.pendingRequests}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={GLASS_CARD}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">Active Chats</p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaCheck size={16} />
                  </div>
                </div>
                <p className="text-4xl font-[var(--font-outfit)] font-semibold tracking-[-0.05em] text-blue-600 dark:text-blue-300">{stats.activeChats}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={GLASS_CARD}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">Ignored</p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaTimesCircle size={16} />
                  </div>
                </div>
                <p className="text-4xl font-[var(--font-outfit)] font-semibold tracking-[-0.05em] text-slate-500 dark:text-slate-300">{stats.ignoredRequests}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={GLASS_CARD}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">Open Thread Messages</p>
                  <div className="p-2 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    <FaComments size={16} />
                  </div>
                </div>
                <p className="text-4xl font-[var(--font-outfit)] font-semibold tracking-[-0.05em] text-blue-600 dark:text-blue-300">{stats.totalMessages}</p>
              </motion.div>
            </div>

            {/* Filter bar */}
            <div className={`${GLASS_BG} flex items-center justify-between px-6 py-4 rounded-[28px] mb-8`}>
              <div className="flex gap-2 overflow-x-auto flex-1 no-scrollbar">
                {[
                  { key: 'pending', label: 'Pending Requests', icon: '📥' },
                  { key: 'active', label: 'Active Chats', icon: '💬' },
                  { key: 'ignored', label: 'Ignored', icon: '👋' },
                ].map((filter) => (
                  <motion.button
                    key={filter.key}
                    onClick={() => setFilterType(filter.key)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-2xl font-[var(--font-outfit)] font-semibold text-xs whitespace-nowrap transition-all border ${
                      filterType === filter.key
                        ? 'bg-blue-600 text-white border-transparent shadow-[0_10px_30px_rgba(59,130,246,0.24)]'
                        : 'bg-white dark:bg-[#162033] text-slate-500 dark:text-slate-400 border-blue-500/15 dark:border-white/10 hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-300'
                    }`}
                  >
                    {filter.icon} {filter.label}
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => loadRequests()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white dark:bg-[#162033] hover:bg-blue-50 dark:hover:bg-[#1d2a44] rounded-2xl text-slate-500 dark:text-slate-300 font-[var(--font-outfit)] font-semibold text-xs border border-blue-500/15 dark:border-white/10 flex items-center gap-2 transition-all shadow-sm ml-4"
              >
                <FaSync size={12} /> Refresh
              </motion.button>
            </div>

            {/* Main two-column layout */}
            <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6">
              {/* Request list */}
              <div className="space-y-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request, idx) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      idx={idx}
                      selected={selectedRequest?.id === request.id}
                      onAccept={handleAcceptRequest}
                      onIgnore={handleIgnoreRequest}
                      onSelect={async () => {
                        setSelectedRequest(request)
                        await loadConversation(request.id)
                      }}
                    />
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={GLASS_CARD}>
                    <FaInbox size={40} className="mx-auto mb-4 text-blue-300 dark:text-blue-500/40" />
                    <h3 className="text-slate-900 dark:text-white font-[var(--font-outfit)] font-semibold mb-1 text-center">No requests</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                      {filterType === 'pending' ? 'No pending customer requests' : filterType === 'active' ? 'No active conversations' : 'No ignored requests'}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Conversation panel */}
              <div className={`${GLASS_CARD} min-h-[720px]`}>
                {selectedRequest ? (
                  <>
                    {/* Conversation header */}
                    <div className="flex items-start justify-between gap-4 border-b border-blue-500/12 dark:border-white/10 pb-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-[0_10px_30px_rgba(59,130,246,0.24)]">
                            <FaUser size={16} />
                          </div>
                          <div>
                            <h2 className="text-xl font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                              User {selectedRequest.user_id?.slice(-4)}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Started {formatTime(selectedRequest.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-[var(--font-outfit)] font-semibold ${getStatusBadgeClasses(selectedRequest.status)}`}>
                            {selectedRequest.status}
                          </div>
                          <div className="px-3 py-1 rounded-full text-xs font-[var(--font-outfit)] font-semibold bg-white dark:bg-[#162033] border border-blue-500/15 dark:border-white/10 text-slate-600 dark:text-slate-300">
                            {selectedRequest.businesses?.name || business?.name || 'Business'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* First request summary */}
                    <div className="mb-6 p-4 rounded-[22px] bg-white/80 dark:bg-[#111827] border border-blue-500/12 dark:border-white/10 transition-colors duration-300">
                      <p className="text-xs font-[var(--font-outfit)] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-[0.16em]">First request</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedRequest.summary || 'No request summary'}
                      </p>
                    </div>

                    {/* Status-specific banners */}
                    {isPending && (
                      <div className="mb-4 p-4 rounded-[22px] bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-start gap-3">
                        <FaLock className="text-blue-600 dark:text-blue-300 mt-0.5" />
                        <div>
                          <p className="text-sm font-[var(--font-outfit)] font-semibold text-blue-700 dark:text-blue-300 mb-1">
                            Pending request
                          </p>
                          <p className="text-sm text-blue-700/80 dark:text-blue-200">
                            Review the user's first message below, then accept or ignore it.
                          </p>
                        </div>
                      </div>
                    )}

                    {isActive && (
                      <div className="mb-4 p-4 rounded-[22px] bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                        <p className="text-sm font-[var(--font-outfit)] font-semibold text-blue-700 dark:text-blue-300 mb-1">Chat is active</p>
                        <p className="text-sm text-blue-700/80 dark:text-blue-200">
                          This request was accepted. You can reply below.
                        </p>
                      </div>
                    )}

                    {isIgnored && (
                      <div className="mb-4 p-4 rounded-[22px] bg-slate-100 dark:bg-[#162033] border border-slate-200 dark:border-white/10">
                        <p className="text-sm font-[var(--font-outfit)] font-semibold text-slate-700 dark:text-slate-300 mb-1">Request ignored</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          This conversation is closed. No further messages can be sent.
                        </p>
                      </div>
                    )}

                    {/* Messages list */}
                    <div className="min-h-[420px] max-h-[520px] overflow-y-auto space-y-4 pr-1">
                      {messagesLoading ? (
                        <div className="h-56 flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-10 h-10 rounded-full border-[3px] border-blue-500/30 border-t-blue-600 dark:border-blue-400/20 dark:border-t-blue-300"
                          />
                        </div>
                      ) : currentMessages.length > 0 ? (
                        currentMessages.map((msg, idx) => {
                          const isBusinessMessage = msg.sender === 'business'

                          return (
                            <motion.div
                              key={msg.id || idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isBusinessMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-[22px] px-4 py-3 shadow-sm ${
                                  isBusinessMessage
                                    ? 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.18)]'
                                    : 'bg-white dark:bg-[#111827] border border-blue-500/15 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-colors duration-300'
                                }`}
                              >
                                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                                <p className={`text-[11px] mt-2 ${isBusinessMessage ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {formatTime(msg.created_at)}
                                </p>
                              </div>
                            </motion.div>
                          )
                        })
                      ) : (
                        <div className="text-center py-24 rounded-[28px] border border-dashed border-blue-300/60 dark:border-white/15 bg-white/40 dark:bg-[#0d1526] transition-colors duration-300">
                          <FaStore size={32} className="mx-auto mb-4 text-blue-300 dark:text-blue-500/40" />
                          <h3 className="text-slate-900 dark:text-white font-[var(--font-outfit)] font-semibold mb-1">No messages yet</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                            When a request is opened, its messages will show here.
                          </p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Composer / action area */}
                    <div className="border-t border-blue-500/12 dark:border-white/10 pt-4 mt-6">
                      {/* Pending — show accept/ignore buttons */}
                      {isPending && (
                        <div className="flex items-center gap-3">
                          <motion.button
                            onClick={() => handleAcceptRequest(selectedRequest.id)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1 py-3 rounded-2xl font-[var(--font-outfit)] font-semibold text-sm bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
                          >
                            ✅ Accept Request
                          </motion.button>
                          <motion.button
                            onClick={() => handleIgnoreRequest(selectedRequest.id)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1 py-3 rounded-2xl font-[var(--font-outfit)] font-semibold text-sm bg-white dark:bg-[#162033] hover:bg-blue-50 dark:hover:bg-[#1d2a44] text-slate-700 dark:text-slate-300 border border-blue-500/15 dark:border-white/10 transition-all"
                          >
                            👋 Ignore
                          </motion.button>
                        </div>
                      )}

                      {/* Active — show reply composer */}
                      {isActive && (
                        <form onSubmit={handleReply} className="flex gap-3">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Reply to this customer..."
                            className={GLASS_INPUT}
                          />
                          <motion.button
                            type="submit"
                            disabled={sendingReply || !replyText.trim()}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-5 py-3 rounded-2xl font-[var(--font-outfit)] font-semibold text-sm bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)] disabled:opacity-50 flex items-center gap-2"
                          >
                            <FaPaperPlane size={13} />
                            {sendingReply ? 'Sending...' : 'Send'}
                          </motion.button>
                        </form>
                      )}

                      {/* Ignored — closed notice */}
                      {isIgnored && (
                        <div className="p-4 rounded-[22px] bg-white/80 dark:bg-[#111827] border border-blue-500/12 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
                          This request has been ignored, so replying is disabled.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* No request selected */
                  <div className="text-center py-24">
                    <FaComments size={42} className="mx-auto mb-4 text-blue-300 dark:text-blue-500/40" />
                    <h3 className="text-xl font-[var(--font-outfit)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white mb-2">
                      No request selected
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Pick a request from the left to view the customer's first message and full conversation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </BusinessLayout>
  )
}


// =============================================================================
// REQUEST CARD COMPONENT
// =============================================================================
function RequestCard({ request, idx, selected, onAccept, onIgnore, onSelect }) {
  const CARD_CLASS = 'bg-white/80 dark:bg-[#0f172a] backdrop-blur-xl border border-blue-500/12 dark:border-white/10 rounded-[28px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:border-blue-500/28 hover:shadow-[0_20px_60px_rgba(59,130,246,0.10)] transition-all duration-300'

  const isPending = request.status === 'pending'
  const isActive = request.status === 'active'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      whileHover={{ scale: selected ? 1 : 1.01 }}
      className={`${CARD_CLASS} ${selected ? 'ring-2 ring-blue-500/25 shadow-[0_20px_60px_rgba(59,130,246,0.12)]' : ''} cursor-pointer group relative overflow-hidden`}
      onClick={onSelect}
    >
      {/* Hover glow */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/0 blur-3xl transition-all duration-500 group-hover:bg-blue-500/15" />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold text-xl shadow-[0_10px_30px_rgba(59,130,246,0.24)] ${
                isPending ? 'bg-blue-600' : isActive ? 'bg-blue-600' : 'bg-slate-500'
              }`}
            >
              {isPending ? '📥' : isActive ? '💬' : '👋'}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white text-lg tracking-[-0.03em] truncate">
                User {request.user_id?.slice(-4)}
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                {request.created_at ? formatTime(request.created_at) : 'Just now'}
              </span>
            </div>
          </div>

          <div className="flex gap-1">
            <div className={`px-2 py-1 rounded-full text-xs font-[var(--font-outfit)] font-semibold ${getStatusBadgeClasses(request.status)}`}>
              {request.status}
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
          {request.summary || 'No request message'}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-2 border-t border-blue-500/12 dark:border-white/10 pt-4 mt-4">
          {isPending ? (
            <>
              <motion.button
                onClick={(e) => { e.stopPropagation(); onAccept(request.id) }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-2 rounded-2xl font-[var(--font-outfit)] font-semibold text-xs bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)] transition-all"
              >
                ✅ Accept
              </motion.button>
              <motion.button
                onClick={(e) => { e.stopPropagation(); onIgnore(request.id) }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-2 rounded-2xl font-[var(--font-outfit)] font-semibold text-xs bg-white dark:bg-[#162033] hover:bg-blue-50 dark:hover:bg-[#1d2a44] text-slate-700 dark:text-slate-300 border border-blue-500/15 dark:border-white/10 transition-all"
              >
                👋 Ignore
              </motion.button>
            </>
          ) : (
            <motion.button
              onClick={(e) => { e.stopPropagation(); onSelect() }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 rounded-2xl font-[var(--font-outfit)] font-semibold text-xs bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)] transition-all"
            >
              💬 Open Chat
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
