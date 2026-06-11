'use client'

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

const PAGE_WRAP = `${inter.variable} ${outfit.variable} relative text-slate-900 transition-colors duration-300 dark:text-white`

const SHELL =
  'rounded-[24px] border border-blue-500/12 bg-white/78 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.07)] transition-colors duration-300 dark:border-white/10 dark:bg-[#0f172a]/92 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]'

const formatTime = (dateValue) => {
  if (!dateValue) return 'Recently'
  return new Date(dateValue).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const getStatusBadgeClasses = (status) => {
  if (status === 'active') return 'bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300'
  if (status === 'ignored') return 'bg-slate-100 dark:bg-[#162033] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
  return 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300'
}

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
  const [filterType, setFilterType] = useState('active')
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const selectedRequestIdRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => { selectedRequestIdRef.current = selectedRequest?.id || null }, [selectedRequest?.id])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [currentMessages])

  const loadConversation = useCallback(async (requestId, showLoader = true) => {
    if (!requestId) { setCurrentMessages([]); return }
    try {
      if (showLoader) setMessagesLoading(true)
      const { data, error: fetchErr } = await supabase.from('messages').select('*').eq('request_id', requestId).order('created_at', { ascending: true })
      if (fetchErr) throw fetchErr
      setCurrentMessages(data || [])
      const { data: freshReq } = await supabase.from('message_requests').select('*, businesses(id, name, image_url, city, state, type)').eq('id', requestId).single()
      if (freshReq) setSelectedRequest(freshReq)
    } catch (e) {
      setError('Failed to load conversation.')
    } finally {
      if (showLoader) setMessagesLoading(false)
    }
  }, [supabase])

  const loadRequests = useCallback(async (showLoader = true) => {
    if (!user?.id) return
    try {
      if (showLoader) setLoading(true)
      setError(null)
      let bizData = business
      if (!bizData) {
        const { data, error: bizErr } = await supabase.from('businesses').select('id, name, image_url').eq('owner_id', user.id).single()
        if (bizErr) throw bizErr
        if (!data) { setError('No business profile found.'); setRequests([]); setSelectedRequest(null); setCurrentMessages([]); return }
        bizData = data; setBusiness(data)
      }
      const { data: rows, error: reqErr } = await supabase.from('message_requests').select('*, businesses(id, name, image_url, city, state, type)').eq('business_id', bizData.id).order('updated_at', { ascending: false })
      if (reqErr) throw reqErr
      const list = rows || []
      setRequests(list)
      if (list.length === 0) { setSelectedRequest(null); setCurrentMessages([]); return }
      const currentId = selectedRequestIdRef.current
      const stillExists = currentId ? list.find((r) => r.id === currentId) : null
      const next = stillExists || list[0]
      setSelectedRequest(next)
      if (currentId !== next.id || currentMessages.length === 0) await loadConversation(next.id, false)
    } catch (e) {
      setError(`Failed to load messages: ${e.message}`)
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [user?.id, business, supabase, loadConversation, currentMessages.length])

  useEffect(() => { if (!user?.id) return; loadRequests() }, [user?.id])

  useEffect(() => {
    if (!business?.id) return
    const channel = supabase.channel(`biz-requests-${business.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'message_requests', filter: `business_id=eq.${business.id}` }, () => loadRequests(false)).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [business?.id, supabase, loadRequests])

  useEffect(() => {
    if (!selectedRequest?.id) return
    const channel = supabase.channel(`biz-msgs-${selectedRequest.id}`)
      // @ts-ignore
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `request_id=eq.${selectedRequest.id}` }, (payload: any) => { loadConversation(selectedRequest.id, false) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedRequest?.id, supabase, loadConversation])

  const handleAcceptRequest = async (requestId) => {
    try {
      setError(null)
      const now = new Date().toISOString()
      const { error: rpcErr } = await supabase.rpc('update_request_status', { p_request_id: requestId, p_new_status: 'active' })
      if (rpcErr) {
        const { error: updateErr } = await supabase.from('message_requests').update({ status: 'active', updated_at: now }).eq('id', requestId)
        if (updateErr) throw updateErr
      }
      setSuccess('Request accepted!'); setTimeout(() => setSuccess(null), 2000)
      await loadRequests(false)
      if (selectedRequest?.id === requestId) await loadConversation(requestId, false)
    } catch (err) {
      setError(err.message || 'Failed to accept.'); setTimeout(() => setError(null), 3000)
    }
  }

  const handleIgnoreRequest = async (requestId) => {
    try {
      setError(null)
      const now = new Date().toISOString()
      const { error: rpcErr } = await supabase.rpc('update_request_status', { p_request_id: requestId, p_new_status: 'ignored' })
      if (rpcErr) {
        const { error: updateErr } = await supabase.from('message_requests').update({ status: 'ignored', updated_at: now }).eq('id', requestId)
        if (updateErr) throw updateErr
      }
      setSuccess('Request ignored'); setTimeout(() => setSuccess(null), 2000)
      await loadRequests(false)
      if (selectedRequest?.id === requestId) await loadConversation(requestId, false)
    } catch (err) {
      setError(err.message || 'Failed to ignore.'); setTimeout(() => setError(null), 3000)
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedRequest?.id || selectedRequest.status !== 'active') return
    try {
      setSendingReply(true); setError(null)
      const messageText = replyText.trim()
      const now = new Date().toISOString()
      const { error: insertErr } = await supabase.from('messages').insert({ request_id: selectedRequest.id, sender: 'business', text: messageText, created_at: now, user_id: selectedRequest.user_id })
      if (insertErr) throw insertErr
      await supabase.from('message_requests').update({ updated_at: now }).eq('id', selectedRequest.id)
      setReplyText(''); setSuccess('Sent!'); setTimeout(() => setSuccess(null), 2000)
      await loadRequests(false)
    } catch (err) {
      setError(`Failed to send: ${err.message || 'Unknown error'}`); setTimeout(() => setError(null), 3000)
    } finally {
      setSendingReply(false)
    }
  }

  const filteredRequests = useMemo(() => {
    if (filterType === 'pending') return requests.filter((r) => r.status === 'pending')
    if (filterType === 'active') return requests.filter((r) => r.status === 'active')
    if (filterType === 'ignored') return requests.filter((r) => r.status === 'ignored')
    return requests
  }, [requests, filterType])

  const isPending = selectedRequest?.status === 'pending'
  const isActive = selectedRequest?.status === 'active'
  const isIgnored = selectedRequest?.status === 'ignored'

  if (loading || authLoading) {
    return (
      <BusinessLayout>
        <div className={PAGE_WRAP}>
          <div className="flex min-h-[60vh] items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="h-10 w-10 rounded-full border-[3px] border-blue-500/30 border-t-blue-600" />
          </div>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className={PAGE_WRAP} style={{ fontFamily: 'var(--font-inter)' }}>

        {/* Page header */}
        <div className="relative z-10 border-b border-blue-500/10 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1322]">
          <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div>
              <h1 className="font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">Messages</h1>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Review requests and chat with customers</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'pending', label: 'Pending', icon: <FaEnvelope size={11} /> },
                { key: 'active', label: 'Active', icon: <FaComments size={11} /> },
                { key: 'ignored', label: 'Ignored', icon: <FaTimesCircle size={11} /> },
              ].map((f) => (
                <button key={f.key} onClick={() => setFilterType(f.key)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    filterType === f.key
                      ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(59,130,246,0.22)]'
                      : 'border border-blue-500/15 bg-white text-slate-600 hover:bg-blue-50 dark:border-white/10 dark:bg-[#162033] dark:text-slate-300 dark:hover:bg-[#1d2a44]'
                  }`}>
                  {f.icon}{f.label}
                </button>
              ))}
              <button onClick={() => loadRequests()} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/15 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 dark:border-white/10 dark:bg-[#162033] dark:text-slate-300 dark:hover:bg-[#1d2a44]">
                <FaSync size={11} />Refresh
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative z-10 mx-auto mt-3 max-w-7xl px-5 lg:px-6">
              <div className="flex items-center gap-2 rounded-xl border border-red-300/50 bg-red-50/90 px-3 py-2 text-xs text-red-700 dark:border-red-400/20 dark:bg-[#1f1720] dark:text-red-300">
                <FaExclamationTriangle size={11} />{error}
              </div>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative z-10 mx-auto mt-3 max-w-7xl px-5 lg:px-6">
              <div className="flex items-center gap-2 rounded-xl border border-blue-300/50 bg-blue-50/90 px-3 py-2 text-xs text-blue-700 dark:border-blue-400/20 dark:bg-[#0f172a] dark:text-blue-300">
                <FaCheck size={11} />{success}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="relative z-10 mx-auto max-w-7xl px-5 pb-5 pt-4 lg:px-6">

          {/* Single unified shell — same WhatsApp style as user side */}
          <div className={`${SHELL} h-[calc(100vh-170px)] min-h-[560px] grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] overflow-hidden`}>

            {/* LEFT: inbox sidebar */}
            <div className="flex flex-col border-r border-blue-500/10 dark:border-white/10 min-h-0 overflow-hidden">
              <div className="px-3 py-3 border-b border-blue-500/10 dark:border-white/10 shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-[var(--font-outfit)] text-sm font-semibold text-slate-900 dark:text-white">Inbox</h2>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{filteredRequests.length} {filterType}</span>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request, idx) => (
                    <InboxRow key={request.id} request={request} idx={idx} selected={selectedRequest?.id === request.id}
                      onSelect={async () => { setSelectedRequest(request); await loadConversation(request.id) }} />
                  ))
                ) : (
                  <div className="flex h-full min-h-[200px] items-center justify-center p-3">
                    <div className="w-full rounded-[18px] border border-dashed border-blue-300/60 bg-white/40 p-5 text-center dark:border-white/15 dark:bg-[#0d1526]">
                      <FaInbox size={22} className="mx-auto mb-2 text-blue-300 dark:text-blue-500/40" />
                      <h3 className="font-[var(--font-outfit)] text-sm font-semibold text-slate-900 dark:text-white">No requests</h3>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {filterType === 'pending' ? 'No pending requests.' : filterType === 'active' ? 'No active chats.' : 'No ignored requests.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: conversation panel */}
            <div className="flex flex-col min-h-0 overflow-hidden">
              {selectedRequest ? (
                <>
                  {/* Chat header */}
                  <div className="px-4 py-3 border-b border-blue-500/10 dark:border-white/10 bg-white/30 dark:bg-white/[0.02] shrink-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_6px_16px_rgba(59,130,246,0.22)]">
                          <FaUser size={12} />
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-[var(--font-outfit)] text-sm font-semibold text-slate-900 dark:text-white truncate">
                            User ···{selectedRequest.user_id?.slice(-4)}
                          </h2>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Started {formatTime(selectedRequest.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusBadgeClasses(selectedRequest.status)}`}>
                          {selectedRequest.status}
                        </span>
                        {isPending && (
                          <>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => handleAcceptRequest(selectedRequest.id)}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[11px] font-semibold shadow-[0_6px_16px_rgba(59,130,246,0.22)]">
                              Accept
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => handleIgnoreRequest(selectedRequest.id)}
                              className="px-3 py-1.5 rounded-xl border border-blue-500/15 bg-white text-slate-600 text-[11px] font-semibold hover:bg-blue-50 dark:border-white/10 dark:bg-[#162033] dark:text-slate-300">
                              Ignore
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* First request summary */}
                    {selectedRequest.summary && (
                      <div className="mt-2 px-3 py-2 rounded-xl bg-white/50 dark:bg-white/[0.03] border border-blue-500/10 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wide mr-1.5">Request:</span>
                        {selectedRequest.summary}
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2">
                    {messagesLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="h-8 w-8 rounded-full border-[3px] border-blue-500/30 border-t-blue-600" />
                      </div>
                    ) : currentMessages.length > 0 ? (
                      currentMessages.map((msg, idx) => {
                        const isBusinessMessage = msg.sender === 'business'
                        return (
                          <motion.div key={msg.id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isBusinessMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[72%]">
                              <p className={`mb-1 px-1 text-[9px] font-semibold uppercase tracking-wide ${isBusinessMessage ? 'text-right text-blue-500 dark:text-blue-300' : 'text-slate-400 dark:text-slate-500'}`}>
                                {isBusinessMessage ? 'You' : 'Customer'}
                              </p>
                              <div className={`rounded-2xl px-3 py-2 ${isBusinessMessage ? 'bg-blue-600 text-white shadow-[0_6px_16px_rgba(59,130,246,0.18)]' : 'border border-blue-500/12 bg-white text-slate-800 dark:border-white/10 dark:bg-[#111827] dark:text-slate-200'}`}>
                                <p className="text-[13px] leading-relaxed whitespace-pre-line">{msg.text}</p>
                                <p className={`mt-1 text-[10px] ${isBusinessMessage ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>{formatTime(msg.created_at)}</p>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="w-full max-w-xs rounded-[20px] border border-dashed border-blue-300/60 bg-white/40 p-6 text-center dark:border-white/15 dark:bg-[#0d1526]">
                          <FaStore size={20} className="mx-auto mb-2 text-blue-300 dark:text-blue-500/40" />
                          <h3 className="font-[var(--font-outfit)] text-sm font-semibold text-slate-900 dark:text-white">No messages yet</h3>
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Messages will appear here once the chat starts.</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Composer */}
                  <div className="p-3 border-t border-blue-500/10 dark:border-white/10 bg-slate-50/80 dark:bg-[#111827] shrink-0">
                    {isActive && (
                      <form onSubmit={handleReply} className="flex gap-2 items-center">
                        <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." className="flex-1 rounded-xl border border-blue-500/15 bg-white/90 px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400/60 transition-all dark:border-white/10 dark:bg-[#0f172a] dark:text-white dark:placeholder-slate-500" />
                        <motion.button type="submit" disabled={sendingReply || !replyText.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(59,130,246,0.22)] disabled:opacity-50">
                          <FaPaperPlane size={11} />{sendingReply ? '...' : 'Send'}
                        </motion.button>
                      </form>
                    )}
                    {isPending && (
                      <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-[11px] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                        <FaLock size={10} />Accept this request to start replying.
                      </div>
                    )}
                    {isIgnored && (
                      <div className="rounded-xl border border-blue-500/12 bg-white/80 px-3 py-2.5 text-[11px] text-slate-500 dark:border-white/10 dark:bg-[#111827] dark:text-slate-400">
                        This request has been ignored — replying is disabled.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center p-6">
                  <div className="text-center max-w-sm">
                    <div className="w-14 h-14 rounded-full border border-blue-500/15 bg-white/60 flex items-center justify-center mx-auto mb-4 dark:border-white/10 dark:bg-[#0d1526]">
                      <FaComments size={20} className="text-blue-300 dark:text-blue-500/40" />
                    </div>
                    <h3 className="font-[var(--font-outfit)] text-base font-semibold text-slate-900 dark:text-white mb-2">No conversation selected</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pick a request from the inbox to view the thread.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </BusinessLayout>
  )
}

function InboxRow({ request, idx, selected, onSelect }) {
  const isPending = request.status === 'pending'
  const isActive = request.status === 'active'

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
      onClick={onSelect}
      className={`group w-full rounded-[18px] border p-3 text-left transition-all ${
        selected
          ? 'border-blue-500/30 bg-blue-50 shadow-[0_8px_20px_rgba(59,130,246,0.08)] dark:border-blue-500/20 dark:bg-blue-500/10'
          : 'border-blue-500/10 bg-white/70 hover:border-blue-500/22 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-[0_4px_12px_rgba(59,130,246,0.18)] ${isPending ? 'bg-blue-600' : isActive ? 'bg-blue-600' : 'bg-slate-400'}`}>
          {isPending ? <FaEnvelope size={11} /> : isActive ? <FaComments size={11} /> : <FaTimesCircle size={11} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="truncate font-[var(--font-outfit)] text-[13px] font-semibold text-slate-900 dark:text-white">
              User ···{request.user_id?.slice(-4)}
            </h4>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${getStatusBadgeClasses(request.status)}`}>
              {request.status}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{formatTime(request.created_at)}</p>
          <p className="mt-1.5 line-clamp-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300">{request.summary || 'No message'}</p>
        </div>
      </div>
    </motion.button>
  )
}