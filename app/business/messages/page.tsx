'use client'

// Business messaging page for real-time conversations between owners and customers.
// Supports thread selection, message sending, and status updates via Supabase subscriptions.

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

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

const PAGE_WRAP =
  `${inter.variable} ${outfit.variable} relative text-slate-900 transition-colors duration-300 dark:text-white`

const PANEL =
  'rounded-[24px] border border-blue-500/12 bg-white/78 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.07)] transition-colors duration-300 dark:border-white/10 dark:bg-[#0f172a]/92 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]'

const SOFT_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-500/15 bg-white px-4 py-2.5 font-[var(--font-outfit)] text-xs font-semibold text-slate-700 transition-all hover:border-blue-500/30 hover:bg-blue-50 dark:border-white/10 dark:bg-[#162033] dark:text-slate-300 dark:hover:bg-[#1d2a44]'

const FILTER_BUTTON =
  'inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 font-[var(--font-outfit)] text-xs font-semibold transition-all'

// Format timestamps for requests and messages
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

// Build the status badge styles
const getStatusBadgeClasses = (status) => {
  if (status === 'active') {
    return 'bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300'
  }

  if (status === 'ignored') {
    return 'bg-slate-100 dark:bg-[#162033] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
  }

  return 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300'
}

// Real-time messaging page for business-customer conversations
export default function BusinessMessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const [supabase] = useState(() => createClient())

  const [business, setBusiness] = useState(null)
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [currentMessages, setCurrentMessages] = useState([])

  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState('pending')
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const selectedRequestIdRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Keep the selected request id available during async refreshes
  useEffect(() => {
    selectedRequestIdRef.current = selectedRequest?.id || null
  }, [selectedRequest?.id])

  // Auto-scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages])

  // Load all messages for a selected conversation
  const loadConversation = useCallback(
    async (requestId, showLoader = true) => {
      if (!requestId) {
        setCurrentMessages([])
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

        setCurrentMessages(data || [])

        const { data: freshReq } = await supabase
          .from('message_requests')
          .select('*, businesses(id, name, image_url, city, state, type)')
          .eq('id', requestId)
          .single()

        if (freshReq) setSelectedRequest(freshReq)
      } catch (e) {
        console.error('Error loading conversation:', e)
        setError('Failed to load conversation.')
      } finally {
        if (showLoader) setMessagesLoading(false)
      }
    },
    [supabase]
  )

  // Load all requests tied to the current business owner
  const loadRequests = useCallback(
    async (showLoader = true) => {
      if (!user?.id) return

      try {
        if (showLoader) setLoading(true)
        setError(null)

        let bizData = business

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

        const { data: rows, error: reqErr } = await supabase
          .from('message_requests')
          .select('*, businesses(id, name, image_url, city, state, type)')
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
    },
    [user?.id, business, supabase, loadConversation, currentMessages.length]
  )

  // Initial load
  useEffect(() => {
    if (!user?.id) return
    loadRequests()
  }, [user?.id])

  // Realtime updates for message request list
  useEffect(() => {
    if (!business?.id) return

    const channel = supabase
      .channel(`biz-requests-${business.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_requests',
          filter: `business_id=eq.${business.id}`,
        },
        () => loadRequests(false)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [business?.id, supabase, loadRequests])

  // Realtime updates for the selected thread
  useEffect(() => {
  console.log("BUSINESS Selected Request:", selectedRequest?.id);

  if (!selectedRequest?.id) return;

  console.log("BUSINESS Creating subscription...");

  const channel = supabase
    .channel(`biz-msgs-${selectedRequest.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `request_id=eq.${selectedRequest.id}`,
      },
      (payload) => {
        console.log("BUSINESS MESSAGE EVENT", payload);
        loadConversation(selectedRequest.id, false);
      }
    )
    .subscribe((status) => {
      console.log("BUSINESS Realtime Status:", status);
    });

  return () => {
    console.log("BUSINESS Removing channel", selectedRequest?.id);
    supabase.removeChannel(channel);
  };
}, [selectedRequest?.id, supabase, loadConversation]);

  // Accept a pending request
  const handleAcceptRequest = async (requestId) => {
    try {
      setError(null)
      const now = new Date().toISOString()

      const { error: rpcErr } = await supabase.rpc('update_request_status', {
        p_request_id: requestId,
        p_new_status: 'active',
      })

      if (rpcErr) {
        console.warn('Vicinity Accept RPC failed, falling back:', rpcErr.message)

        const { error: updateErr } = await supabase
          .from('message_requests')
          .update({ status: 'active', updated_at: now })
          .eq('id', requestId)

        if (updateErr) throw updateErr
      }

      setSuccess('Request accepted!')
      setTimeout(() => setSuccess(null), 2000)

      await loadRequests(false)

      if (selectedRequest?.id === requestId) {
        await loadConversation(requestId, false)
      }
    } catch (err) {
      console.error('Vicinity Accept request error:', err)
      setError(err.message || 'Failed to accept request.')
      setTimeout(() => setError(null), 3000)
    }
  }

  // Ignore a pending request
  const handleIgnoreRequest = async (requestId) => {
    try {
      setError(null)
      const now = new Date().toISOString()

      const { error: rpcErr } = await supabase.rpc('update_request_status', {
        p_request_id: requestId,
        p_new_status: 'ignored',
      })

      if (rpcErr) {
        console.warn('Vicinity Ignore RPC failed, falling back:', rpcErr.message)

        const { error: updateErr } = await supabase
          .from('message_requests')
          .update({ status: 'ignored', updated_at: now })
          .eq('id', requestId)

        if (updateErr) throw updateErr
      }

      setSuccess('Request ignored')
      setTimeout(() => setSuccess(null), 2000)

      await loadRequests(false)

      if (selectedRequest?.id === requestId) {
        await loadConversation(requestId, false)
      }
    } catch (err) {
      console.error('Vicinity Ignore request error:', err)
      setError(err.message || 'Failed to ignore request.')
      setTimeout(() => setError(null), 3000)
    }
  }

  // Send a business reply
  const handleReply = async (e) => {
    e.preventDefault()

    if (!replyText.trim() || !selectedRequest?.id || selectedRequest.status !== 'active') {
      return
    }

    try {
      setSendingReply(true)
      setError(null)

      const messageText = replyText.trim()
      const now = new Date().toISOString()

      console.log('Vicinity Sending business reply via RPC...')
      const { error: rpcErr } = await supabase.rpc('send_chat_message', {
        p_request_id: selectedRequest.id,
        p_sender: 'business',
        p_text: messageText,
      })

      if (rpcErr) {
        console.warn('Vicinity Reply RPC failed, falling back:', rpcErr.message)

        const { error: insertErr } = await supabase.from('messages').insert({
          request_id: selectedRequest.id,
          sender: 'business',
          text: messageText,
          created_at: now,
          user_id: selectedRequest.user_id,
        })

        if (insertErr) throw insertErr

        await supabase
          .from('message_requests')
          .update({ updated_at: now })
          .eq('id', selectedRequest.id)
      }

      setReplyText('')
      setSuccess('Message sent!')
      setTimeout(() => setSuccess(null), 2000)

      await loadRequests(false)
    } catch (err) {
      console.error('Vicinity Reply error:', err)
      setError(`Failed to send message: ${err.message || 'Unknown error'}`)
      setTimeout(() => setError(null), 3000)
    } finally {
      setSendingReply(false)
    }
  }

  // Filter inbox by request status
  const filteredRequests = useMemo(() => {
    if (filterType === 'pending') return requests.filter((r) => r.status === 'pending')
    if (filterType === 'active') return requests.filter((r) => r.status === 'active')
    if (filterType === 'ignored') return requests.filter((r) => r.status === 'ignored')
    return requests
  }, [requests, filterType])

  const isPending = selectedRequest?.status === 'pending'
  const isActive = selectedRequest?.status === 'active'
  const isIgnored = selectedRequest?.status === 'ignored'

  // Loading screen
  if (loading || authLoading) {
    return (
      <BusinessLayout>
        <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
          <div className="relative z-10 flex min-h-full items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-12 w-12 rounded-full border-[3px] border-blue-500/30 border-t-blue-600 dark:border-blue-400/20 dark:border-t-blue-300"
            />
          </div>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>
        <div className="relative z-10 border-b border-blue-500/10 bg-white/70 backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-[#0b1322]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-10 top-12 h-24 w-24 -translate-y-12 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
            <div className="absolute right-20 top-0 h-20 w-20 rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-400/10" />
          </div>

          <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div>
              <h1 className="font-[var(--font-outfit)] text-[30px] font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">
                Messages
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Review customer requests and continue active conversations
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'pending', label: 'Pending', icon: <FaEnvelope size={12} /> },
                { key: 'active', label: 'Active', icon: <FaComments size={12} /> },
                { key: 'ignored', label: 'Ignored', icon: <FaTimesCircle size={12} /> },
              ].map((filter) => {
                const active = filterType === filter.key

                return (
                  <button
                    key={filter.key}
                    onClick={() => setFilterType(filter.key)}
                    className={`${FILTER_BUTTON} ${
                      active
                        ? 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]'
                        : 'border border-blue-500/15 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-[#162033] dark:text-slate-300 dark:hover:bg-[#1d2a44] dark:hover:text-blue-300'
                    }`}
                  >
                    {filter.icon}
                    {filter.label}
                  </button>
                )
              })}

              <button onClick={() => loadRequests()} className={SOFT_BUTTON}>
                <FaSync size={12} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10 mx-auto mt-3 max-w-7xl px-5 lg:px-6"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-red-300/50 bg-red-50/90 px-4 py-3 text-sm text-red-700 backdrop-blur-xl dark:border-red-400/20 dark:bg-[#1f1720] dark:text-red-300">
                <FaExclamationTriangle />
                {error}
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10 mx-auto mt-3 max-w-7xl px-5 lg:px-6"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-blue-300/50 bg-blue-50/90 px-4 py-3 text-sm text-blue-700 backdrop-blur-xl dark:border-blue-400/20 dark:bg-[#0f172a] dark:text-blue-300">
                <FaCheck />
                {success}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="relative z-10 mx-auto max-w-7xl px-5 pb-5 pt-4 lg:px-6">
          <div className="grid gap-4 xl:grid-cols-[310px_minmax(0,1fr)]">
            {/* Inbox column */}
            <section className={`${PANEL} flex h-[calc(100vh-170px)] min-h-[560px] flex-col overflow-hidden`}>
              <div className="border-b border-blue-500/10 px-4 py-3 dark:border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-[var(--font-outfit)] text-lg font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                      Inbox
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {filteredRequests.length} conversation{filteredRequests.length === 1 ? '' : 's'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-500/15 bg-blue-500/8 px-3 py-1.5 text-[10px] font-[var(--font-outfit)] font-semibold uppercase tracking-[0.12em] text-blue-700 dark:border-blue-500/20 dark:text-blue-300">
                    {filterType}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5">
                {filteredRequests.length > 0 ? (
                  <div className="space-y-2.5">
                    {filteredRequests.map((request, idx) => (
                      <InboxRow
                        key={request.id}
                        request={request}
                        idx={idx}
                        selected={selectedRequest?.id === request.id}
                        onSelect={async () => {
                          setSelectedRequest(request)
                          await loadConversation(request.id)
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center p-3">
                    <div className="w-full rounded-[22px] border border-dashed border-blue-300/60 bg-white/40 p-6 text-center dark:border-white/15 dark:bg-[#0d1526]">
                      <FaInbox size={30} className="mx-auto mb-3 text-blue-300 dark:text-blue-500/40" />
                      <h3 className="font-[var(--font-outfit)] text-base font-semibold text-slate-900 dark:text-white">
                        No requests
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {filterType === 'pending'
                          ? 'No pending customer requests.'
                          : filterType === 'active'
                          ? 'No active conversations.'
                          : 'No ignored requests.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Conversation column */}
            <section className={`${PANEL} flex h-[calc(100vh-170px)] min-h-[560px] flex-col overflow-hidden`}>
              {selectedRequest ? (
                <>
                  <div className="border-b border-blue-500/10 px-4 py-3 dark:border-white/10">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]">
                          <FaUser size={14} />
                        </div>

                        <div>
                          <h2 className="font-[var(--font-outfit)] text-lg font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                            User {selectedRequest.user_id?.slice(-4)}
                          </h2>
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            Started {formatTime(selectedRequest.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1 text-[11px] font-[var(--font-outfit)] font-semibold ${getStatusBadgeClasses(
                            selectedRequest.status
                          )}`}
                        >
                          {selectedRequest.status}
                        </div>

                        <div className="rounded-full border border-blue-500/15 bg-white px-3 py-1 text-[11px] font-[var(--font-outfit)] font-semibold text-slate-600 dark:border-white/10 dark:bg-[#162033] dark:text-slate-300">
                          {selectedRequest.businesses?.name || business?.name || 'Business'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid min-h-0 flex-1 lg:grid-cols-[220px_minmax(0,1fr)]">
                    {/* Left details rail */}
                    <aside className="border-b border-blue-500/10 bg-white/35 p-3 dark:border-white/10 dark:bg-white/[0.02] lg:border-b-0 lg:border-r">
                      <div className="space-y-3">
                        <div className="rounded-[20px] border border-blue-500/12 bg-white/80 p-3 dark:border-white/10 dark:bg-[#111827]">
                          <p className="text-[10px] font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                            First request
                          </p>
                          <p className="mt-2 text-[13px] leading-6 text-slate-700 dark:text-slate-300">
                            {selectedRequest.summary || 'No request summary'}
                          </p>
                        </div>

                        {isPending && (
                          <div className="rounded-[20px] border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                            <div className="flex items-start gap-2.5">
                              <FaLock className="mt-1 text-blue-600 dark:text-blue-300" />
                              <div>
                                <p className="font-[var(--font-outfit)] text-sm font-semibold text-blue-700 dark:text-blue-300">
                                  Pending request
                                </p>
                                <p className="mt-1.5 text-[13px] leading-5 text-blue-700/80 dark:text-blue-200">
                                  Accept this request before replying.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {isActive && (
                          <div className="rounded-[20px] border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                            <p className="font-[var(--font-outfit)] text-sm font-semibold text-blue-700 dark:text-blue-300">
                              Active conversation
                            </p>
                            <p className="mt-1.5 text-[13px] leading-5 text-blue-700/80 dark:text-blue-200">
                              This thread is open and ready for replies.
                            </p>
                          </div>
                        )}

                        {isIgnored && (
                          <div className="rounded-[20px] border border-slate-200 bg-slate-100 p-3 dark:border-white/10 dark:bg-[#162033]">
                            <p className="font-[var(--font-outfit)] text-sm font-semibold text-slate-700 dark:text-slate-300">
                              Request ignored
                            </p>
                            <p className="mt-1.5 text-[13px] leading-5 text-slate-600 dark:text-slate-400">
                              This thread is closed and reply is disabled.
                            </p>
                          </div>
                        )}

                        {isPending && (
                          <div className="space-y-2.5 rounded-[20px] border border-blue-500/12 bg-white/80 p-3 dark:border-white/10 dark:bg-[#111827]">
                            <p className="text-[10px] font-[var(--font-outfit)] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                              Actions
                            </p>

                            <motion.button
                              onClick={() => handleAcceptRequest(selectedRequest.id)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 font-[var(--font-outfit)] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)]"
                            >
                              Accept request
                            </motion.button>

                            <motion.button
                              onClick={() => handleIgnoreRequest(selectedRequest.id)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex w-full items-center justify-center rounded-xl border border-blue-500/15 bg-white px-4 py-2.5 font-[var(--font-outfit)] text-sm font-semibold text-slate-700 transition-all hover:bg-blue-50 dark:border-white/10 dark:bg-[#162033] dark:text-slate-300 dark:hover:bg-[#1d2a44]"
                            >
                              Ignore
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </aside>

                    {/* Right thread panel */}
                    <div className="flex min-h-0 flex-col">
                      <div className="flex-1 overflow-y-auto px-3 py-3 md:px-4">
                        {messagesLoading ? (
                          <div className="flex h-full items-center justify-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="h-10 w-10 rounded-full border-[3px] border-blue-500/30 border-t-blue-600 dark:border-blue-400/20 dark:border-t-blue-300"
                            />
                          </div>
                        ) : currentMessages.length > 0 ? (
                          <div className="space-y-3">
                            {currentMessages.map((msg, idx) => {
                              const isBusinessMessage = msg.sender === 'business'

                              return (
                                <motion.div
                                  key={msg.id || idx}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`flex ${isBusinessMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className="max-w-[90%] md:max-w-[74%]">
                                    {!isBusinessMessage && (
                                      <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                                        Customer
                                      </p>
                                    )}

                                    {isBusinessMessage && (
                                      <p className="mb-1 px-1 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-500 dark:text-blue-300">
                                        You
                                      </p>
                                    )}

                                    <div
                                      className={`rounded-[20px] px-4 py-2.5 shadow-sm ${
                                        isBusinessMessage
                                          ? 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.18)]'
                                          : 'border border-blue-500/12 bg-white text-slate-800 dark:border-white/10 dark:bg-[#111827] dark:text-slate-200'
                                      }`}
                                    >
                                      <p className="whitespace-pre-line text-sm leading-6">
                                        {msg.text}
                                      </p>
                                      <p
                                        className={`mt-2 text-[10px] ${
                                          isBusinessMessage
                                            ? 'text-white/80'
                                            : 'text-slate-500 dark:text-slate-400'
                                        }`}
                                      >
                                        {formatTime(msg.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })}

                            <div ref={messagesEndRef} />
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <div className="w-full max-w-md rounded-[24px] border border-dashed border-blue-300/60 bg-white/45 p-8 text-center dark:border-white/15 dark:bg-[#0d1526]">
                              <FaStore size={30} className="mx-auto mb-3 text-blue-300 dark:text-blue-500/40" />
                              <h3 className="font-[var(--font-outfit)] text-lg font-semibold text-slate-900 dark:text-white">
                                No messages yet
                              </h3>
                              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                When this thread has messages, they’ll appear here.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Composer area - simplified so dark mode works cleanly */}
                      <div className="border-t border-blue-500/10 bg-slate-50/80 p-3 backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-[#111827] md:p-4">
                        {isActive && (
                          <form onSubmit={handleReply} className="space-y-2.5">
                            {/* Single input surface layer */}
                            <div className="rounded-[22px] border border-blue-500/15 bg-white/90 px-4 py-3 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#0f172a] dark:shadow-none">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white dark:placeholder-slate-500"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Keep replies clear and helpful.
                              </p>

                              <motion.button
                                type="submit"
                                disabled={sendingReply || !replyText.trim()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-[var(--font-outfit)] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.24)] disabled:opacity-50"
                              >
                                <FaPaperPlane size={12} />
                                {sendingReply ? 'Sending...' : 'Send reply'}
                              </motion.button>
                            </div>
                          </form>
                        )}

                        {isIgnored && (
                          <div className="rounded-[18px] border border-blue-500/12 bg-white/80 p-3 text-sm text-slate-500 dark:border-white/10 dark:bg-[#111827] dark:text-slate-400">
                            This request has been ignored, so replying is disabled.
                          </div>
                        )}

                        {isPending && (
                          <div className="rounded-[18px] border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                            Accept this request to start messaging.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center p-4">
                  <div className="w-full max-w-lg rounded-[26px] border border-dashed border-blue-300/60 bg-white/45 p-8 text-center dark:border-white/15 dark:bg-[#0d1526]">
                    <FaComments size={38} className="mx-auto mb-4 text-blue-300 dark:text-blue-500/40" />
                    <h3 className="font-[var(--font-outfit)] text-xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
                      No request selected
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Pick a conversation from the inbox to view the request details and full message thread.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </BusinessLayout>
  )
}

// Single inbox row item
function InboxRow({ request, idx, selected, onSelect }) {
  const isPending = request.status === 'pending'
  const isActive = request.status === 'active'

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      onClick={onSelect}
      className={`group w-full rounded-[20px] border p-3 text-left transition-all ${
        selected
          ? 'border-blue-500/30 bg-blue-50 shadow-[0_12px_30px_rgba(59,130,246,0.10)] dark:border-blue-500/20 dark:bg-blue-500/10'
          : 'border-blue-500/10 bg-white/70 hover:border-blue-500/22 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-[0_8px_20px_rgba(59,130,246,0.20)] ${
            isPending ? 'bg-blue-600' : isActive ? 'bg-blue-600' : 'bg-slate-500'
          }`}
        >
          {isPending ? <FaEnvelope size={12} /> : isActive ? <FaComments size={12} /> : <FaTimesCircle size={12} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="truncate font-[var(--font-outfit)] text-[14px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">
                User {request.user_id?.slice(-4)}
              </h4>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                {request.created_at ? formatTime(request.created_at) : 'Just now'}
              </p>
            </div>

            <div
              className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-[var(--font-outfit)] font-semibold uppercase tracking-[0.12em] ${getStatusBadgeClasses(
                request.status
              )}`}
            >
              {request.status}
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
            {request.summary || 'No request message'}
          </p>
        </div>
      </div>
    </motion.button>
  )
}