'use client'

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
  FaArrowLeft,
  FaTimes,
  FaFlag,
} from 'react-icons/fa'
import { createClient } from '../../../lib/supabase'
import UserNavbar from '../../../components/UserNavbar'
import { FogBackground } from '@/components/ui/fog'

const UI = {
  page: 'relative min-h-screen bg-transparent text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-300',
  input: 'w-full px-3 py-2 rounded-xl bg-white/14 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/25 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-400/60 transition-all text-xs',
  primaryBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_rgba(59,130,246,0.22)]',
  shell: 'bg-white/20 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-[24px] shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition-colors duration-300',
}

const getStatusStyles = (status) => {
  if (status === 'active') return { wrap: 'bg-green-100/80 dark:bg-green-500/10 border-green-200/70 dark:border-green-500/30 text-green-700 dark:text-green-300', icon: FaCheck }
  if (status === 'ignored') return { wrap: 'bg-red-100/80 dark:bg-red-500/10 border-red-200/70 dark:border-red-500/30 text-red-700 dark:text-red-300', icon: FaTimesCircle }
  return { wrap: 'bg-blue-100/80 dark:bg-blue-500/10 border-blue-200/70 dark:border-blue-500/20 text-blue-700 dark:text-blue-300', icon: FaClock }
}

const formatTime = (dateValue) => {
  if (!dateValue) return 'Recently'
  return new Date(dateValue).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const RequestCard = ({ request, selected, onClick }) => {
  const statusStyles = getStatusStyles(request.status)
  const StatusIcon = statusStyles.icon
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full text-left rounded-[18px] border overflow-hidden transition-all backdrop-blur-2xl ${selected
          ? 'border-blue-300/50 dark:border-blue-500/30 bg-white/30 dark:bg-white/[0.06] shadow-md'
          : 'border-white/25 dark:border-white/10 bg-white/14 dark:bg-white/[0.03] hover:bg-white/20 dark:hover:bg-white/[0.06]'
        }`}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{request.businesses?.name || 'Business'}</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase mt-0.5 truncate">{request.businesses?.type || 'Business'}</p>
          </div>
          <div className={`shrink-0 px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase flex items-center gap-1 ${statusStyles.wrap}`}>
            <StatusIcon size={8} />
            {request.status}
          </div>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-1 mb-2">{request.summary || 'No summary yet'}</p>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500 dark:text-slate-400 truncate pr-2">
            {request.businesses?.city || 'Unknown city'}{request.businesses?.state ? `, ${request.businesses.state}` : ''}
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-300 shrink-0">Open</span>
        </div>
      </div>
    </motion.button>
  )
}

const StatCard = ({ label, value, icon: Icon, color = 'blue', delay }) => {
  const iconStyleMap = {
    blue: 'bg-blue-500/10 border-blue-400/20 text-blue-600 dark:text-blue-300',
    green: 'bg-green-500/10 border-green-400/20 text-green-600 dark:text-green-300',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ y: -2 }}
      className="bg-white/12 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/25 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(59,130,246,0.08)] group relative p-3"
    >
      <div className="relative z-10 flex items-center gap-3">
        <div className={`p-2 rounded-xl border ${iconStyleMap[color] || iconStyleMap.blue}`}>
          <Icon size={15} />
        </div>
        <div>
          <p className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function UserMessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [supabase] = useState(() => createClient())
  const preselectedBusinessId = searchParams.get('businessId')

  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [firstMessage, setFirstMessage] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const selectedRequestIdRef = useRef(null)
  const hasHandledPreselectRef = useRef(false)
  const messagesEndRef = useRef(null)

  useEffect(() => { selectedRequestIdRef.current = selectedRequest?.id || null }, [selectedRequest?.id])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) { router.push('/login'); return }
        setUser(authUser)
      } catch (err) {
        setError('Failed to load account.')
      } finally {
        setAuthLoading(false)
      }
    }
    loadUser()
  }, [router, supabase])

  const loadMessages = useCallback(async (requestId, showLoader = true) => {
    if (!requestId) { setMessages([]); return }
    try {
      if (showLoader) setMessagesLoading(true)
      const { data, error: fetchErr } = await supabase.from('messages').select('*').eq('request_id', requestId).order('created_at', { ascending: true })
      if (fetchErr) throw fetchErr
      setMessages(data || [])
      const { data: freshReq } = await supabase.from('message_requests').select(`*, businesses (id, name, type, city, state, image_url)`).eq('id', requestId).single()
      if (freshReq) { setSelectedRequest(freshReq); setSelectedBusiness(freshReq.businesses || null) }
    } catch (err) {
      console.error('Load messages error:', err)
    } finally {
      if (showLoader) setMessagesLoading(false)
    }
  }, [supabase])

  const loadRequests = useCallback(async (showLoader = true) => {
    if (!user?.id) return
    try {
      if (showLoader) setLoading(true)
      const { data, error: fetchErr } = await supabase.from('message_requests').select(`*, businesses (id, name, type, city, state, image_url)`).eq('user_id', user.id).order('updated_at', { ascending: false })
      if (fetchErr) throw fetchErr
      const rows = data || []
      setRequests(rows)

      if (preselectedBusinessId && !hasHandledPreselectRef.current) {
        hasHandledPreselectRef.current = true
        const existing = rows.find((r) => r.business_id === preselectedBusinessId)
        if (existing) { setSelectedRequest(existing); setSelectedBusiness(existing.businesses || null); await loadMessages(existing.id, false); return }
        const { data: bizData, error: bizErr } = await supabase.from('businesses').select('id, name, type, city, state, image_url').eq('id', preselectedBusinessId).single()
        if (!bizErr && bizData) { setSelectedBusiness(bizData); setSelectedRequest(null); setMessages([]); return }
      }

      if (rows.length === 0) { if (!preselectedBusinessId) { setSelectedRequest(null); setSelectedBusiness(null); setMessages([]) }; return }

      const currentId = selectedRequestIdRef.current
      const keepSelected = currentId ? rows.find((r) => r.id === currentId) : null
      const nextSelected = keepSelected || rows[0]
      setSelectedRequest(nextSelected)
      setSelectedBusiness(nextSelected.businesses || null)
      if (currentId !== nextSelected.id || messages.length === 0) await loadMessages(nextSelected.id, false)
    } catch (err) {
      setError('Failed to load messages.')
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [user?.id, preselectedBusinessId, supabase, loadMessages])

  useEffect(() => { if (!user?.id) return; loadRequests() }, [user?.id, loadRequests])

  useEffect(() => {
    if (!user?.id) return
    const channel = supabase.channel(`user-requests-${user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'message_requests', filter: `user_id=eq.${user.id}` }, () => loadRequests(false)).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, supabase, loadRequests])

  useEffect(() => {
    if (!selectedRequest?.id) return
    const channel = supabase.channel(`user-msgs-${selectedRequest.id}`)
      // @ts-ignore
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `request_id=eq.${selectedRequest.id}` }, (payload: any) => { loadMessages(selectedRequest.id, false) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedRequest?.id, supabase, loadMessages])

  useEffect(() => {
    const channel = supabase.channel('test-realtime')
      // @ts-ignore
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload: any) => { console.log('REALTIME WORKS:', payload) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const handleSendFirstMessage = async (e) => {
    e.preventDefault()
    if (!firstMessage.trim() || !selectedBusiness?.id || !user?.id) return
    try {
      setSending(true); setError(null)
      const messageText = firstMessage.trim()
      const now = new Date().toISOString()
      const { data: rpcData, error: rpcErr } = await supabase.rpc('create_message_thread', { p_business_id: selectedBusiness.id, p_first_message: messageText })
      if (rpcErr) {
        const existingMatch = requests.find((r) => r.business_id === selectedBusiness.id)
        if (existingMatch) { setSelectedRequest(existingMatch); setSelectedBusiness(existingMatch.businesses || selectedBusiness); setFirstMessage(''); await loadMessages(existingMatch.id); setSuccess('You already have a request with this business.'); setTimeout(() => setSuccess(null), 2500); return }
        const { data: requestRow, error: reqErr } = await supabase.from('message_requests').insert([{ business_id: selectedBusiness.id, user_id: user.id, summary: messageText, status: 'pending', created_at: now, updated_at: now }]).select(`*, businesses (id, name, type, city, state, image_url)`).single()
        if (reqErr) throw reqErr
        const { error: msgErr } = await supabase.from('messages').insert([{ request_id: requestRow.id, sender: 'user', text: messageText, created_at: now, user_id: user.id }])
        if (msgErr) { setError('Request created but first message failed.'); setSelectedRequest(requestRow); setSelectedBusiness(requestRow.businesses || selectedBusiness); setFirstMessage(''); await loadRequests(false); setTimeout(() => setError(null), 4000); return }
        setFirstMessage(''); setSelectedRequest(requestRow); setSelectedBusiness(requestRow.businesses || selectedBusiness); setSuccess('Request sent!'); setTimeout(() => setSuccess(null), 2500); await loadRequests(false); await loadMessages(requestRow.id, false); return
      }
      setFirstMessage(''); setSuccess(rpcData.already_existed ? 'Thread already exists — opening it.' : 'Request sent!'); setTimeout(() => setSuccess(null), 2500); await loadRequests(false); await loadMessages(rpcData.request_id, false)
    } catch (err) {
      setError(`Failed to send: ${err.message || 'Unknown error'}`); setTimeout(() => setError(null), 4000)
    } finally {
      setSending(false)
    }
  }

  const handleSendChatMessage = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim() || !selectedRequest?.id || selectedRequest.status !== 'active') return
    try {
      setSending(true); setError(null)
      const messageText = chatMessage.trim()
      const now = new Date().toISOString()
      const { error: insertErr } = await supabase.from('messages').insert([{ request_id: selectedRequest.id, sender: 'user', text: messageText, created_at: now, user_id: user.id }])
      if (insertErr) throw insertErr
      await supabase.from('message_requests').update({ updated_at: now }).eq('id', selectedRequest.id)
      setChatMessage(''); await loadRequests(false)
    } catch (err) {
      setError(`Failed to send: ${err.message || 'Unknown error'}`); setTimeout(() => setError(null), 3000)
    } finally {
      setSending(false)
    }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }

  const submitReport = () => {
    setIsReportModalOpen(false)
    setReportReason('')
    setSuccess('Report submitted successfully! Our team will review this chat.')
    setTimeout(() => setSuccess(null), 3000)
  }

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      const matchesSearch = searchQuery === '' || r.businesses?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.businesses?.type?.toLowerCase().includes(searchQuery.toLowerCase()) || r.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [requests, searchQuery, statusFilter])

  const canSendFirstMessage = !!selectedBusiness && !selectedRequest
  const isPending = selectedRequest?.status === 'pending'
  const isIgnored = selectedRequest?.status === 'ignored'
  const isActive = selectedRequest?.status === 'active'

  if (authLoading || !user) return <div className="min-h-screen bg-transparent" />

  return (
    <div className={UI.page}>
      <div className="relative z-10 h-screen overflow-hidden flex flex-col">
        <UserNavbar activePage="messages" onLogout={handleLogout} />

        <main className="max-w-7xl mx-auto w-full flex-1 pt-28 pb-4 px-6 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6 shrink-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 min-w-0">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  Messages
                </span>
              </h1>
              <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Chat with local businesses, track your requests.
              </p>
            </motion.div>

            <div className="flex flex-row gap-3 flex-shrink-0 lg:pt-2">
              <StatCard label="Active" value={requests.filter(r => r.status === 'active').length} icon={FaCheck} color="green" delay={0.1} />
              <StatCard label="Total" value={requests.length} icon={FaComments} color="blue" delay={0.2} />
            </div>
          </div>

          {/* Chat Panel Grid without the outer shell */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] overflow-hidden gap-6">
            {/* LEFT: sidebar */}
            <div className="flex flex-col bg-white/12 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/25 dark:border-white/10 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)] min-h-0 overflow-hidden">

              {/* Sidebar header: search + filters */}
              <div className="px-3 pt-3 pb-2 border-b border-white/20 dark:border-white/10 shrink-0 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">Chats</h2>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{filteredRequests.length} visible</span>
                </div>
                <div className="relative">
                  <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]" />
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${UI.input} pl-7`} />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500">
                      <FaTimes size={10} />
                    </button>
                  )}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {['all', 'pending', 'active', 'ignored'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${statusFilter === s
                          ? 'bg-blue-600 text-white border-transparent'
                          : 'bg-white/14 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border-white/25 dark:border-white/10 hover:bg-white/22'
                        }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sidebar list */}
              <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2">
                {selectedBusiness && !selectedRequest && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-blue-200/70 dark:border-blue-500/20 bg-blue-50/80 dark:bg-blue-500/10 p-2.5">
                    <p className="text-[10px] font-black text-blue-700 dark:text-blue-300">New chat with</p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-200">{selectedBusiness.name}</p>
                  </motion.div>
                )}
                {loading ? (
                  [1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-[18px] bg-white/10 dark:bg-white/[0.03] border border-white/20 animate-pulse" />)
                ) : filteredRequests.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {filteredRequests.map((request) => (
                      <RequestCard key={request.id} request={request} selected={selectedRequest?.id === request.id} onClick={async () => { setSelectedRequest(request); setSelectedBusiness(request.businesses || null); await loadMessages(request.id) }} />
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-10 px-3 rounded-xl border border-dashed border-white/25 dark:border-white/10">
                    <FaComments className="mx-auto mb-2 text-slate-400" size={20} />
                    <p className="text-xs font-black text-slate-900 dark:text-white mb-1">No chats</p>
                    <p className="text-[11px] text-slate-500">Open a business page to start chatting.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: chat panel */}
            <div className="flex flex-col bg-white/12 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/25 dark:border-white/10 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)] min-h-0 overflow-hidden">
              {selectedBusiness ? (
                <>
                  {/* Chat header */}
                  <div className="px-4 py-3 border-b border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/[0.02] shrink-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">{selectedBusiness.name}</h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {selectedBusiness.type || 'Business'}{selectedBusiness.city ? ` • ${selectedBusiness.city}` : ''}{selectedBusiness.state ? `, ${selectedBusiness.state}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isPending && <span className="px-2 py-1 rounded-lg bg-blue-50/85 dark:bg-blue-500/10 border border-blue-200/70 dark:border-blue-500/20 text-[10px] text-blue-700 dark:text-blue-200">Pending</span>}
                        {isIgnored && <span className="px-2 py-1 rounded-lg bg-red-100/85 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-[10px] text-red-700 dark:text-red-200">Ignored</span>}
                        {isActive && <span className="px-2 py-1 rounded-lg bg-green-100/85 dark:bg-green-500/10 border border-green-200/70 dark:border-green-500/20 text-[10px] text-green-700 dark:text-green-200">Active</span>}
                        <motion.button onClick={() => setIsReportModalOpen(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="px-2 py-1 rounded-lg bg-red-100/85 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-[10px] font-bold flex items-center gap-1.5 text-red-700 dark:text-red-200 hover:bg-red-200/85 dark:hover:bg-red-500/20 transition-all">
                          <FaFlag size={10} /> Report
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => router.back()} className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 bg-white/14 dark:bg-white/[0.04] border border-white/25 dark:border-white/10 text-slate-700 dark:text-white hover:bg-white/22">
                          <FaArrowLeft size={10} /> Back
                        </motion.button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50/85 dark:bg-red-500/10 px-3 py-1.5 text-[11px] text-red-700 dark:text-red-300">{error}</motion.div>}
                      {success && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50/85 dark:bg-green-500/10 px-3 py-1.5 text-[11px] text-green-700 dark:text-green-300">{success}</motion.div>}
                    </AnimatePresence>
                  </div>

                  {/* Messages area */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2">
                    {messagesLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((msg, idx) => {
                        const isUserMessage = msg.sender === 'user'
                        return (
                          <motion.div key={msg.id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[72%] rounded-2xl px-3 py-2 ${isUserMessage ? 'bg-blue-600 text-white' : 'bg-white/16 dark:bg-white/[0.05] border border-white/25 dark:border-white/10 text-slate-800 dark:text-slate-200 backdrop-blur-2xl'}`}>
                              <p className="text-[15px] leading-relaxed whitespace-pre-line">{msg.text}</p>
                              <p className={`text-[11px] mt-1.5 ${isUserMessage ? 'text-white/75' : 'text-slate-500 dark:text-slate-400'}`}>{formatTime(msg.created_at)}</p>
                            </div>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center py-8 px-6 rounded-2xl border border-dashed border-white/25 dark:border-white/10 bg-white/10 dark:bg-white/[0.02] max-w-xs w-full">
                          <FaStore size={20} className="mx-auto mb-3 text-slate-400 dark:text-white/30" />
                          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">No messages yet</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Send your first message to this business.</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Composer */}
                  <div className="p-3 border-t border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/[0.02] shrink-0">
                    {canSendFirstMessage && (
                      <form onSubmit={handleSendFirstMessage} className="flex gap-2 items-end">
                        <textarea value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} placeholder="Write why you want to connect..." rows={2} className={`${UI.input} flex-1 resize-none py-2.5`} />
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={sending || !firstMessage.trim()} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0 ${UI.primaryBtn}`}>
                          <FaPaperPlane size={11} />{sending ? 'Sending...' : 'Send'}
                        </motion.button>
                      </form>
                    )}
                    {isPending && <div className="px-3 py-2 rounded-xl bg-white/12 dark:bg-white/[0.03] border border-white/20 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400">Waiting for the business to accept your request.</div>}
                    {isIgnored && <div className="px-3 py-2 rounded-xl bg-white/12 dark:bg-white/[0.03] border border-white/20 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400">This request is closed.</div>}
                    {isActive && (
                      <form onSubmit={handleSendChatMessage} className="flex gap-2 items-center">
                        <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Type a message..." className={`${UI.input} flex-1`} />
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={sending || !chatMessage.trim()} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0 ${UI.primaryBtn}`}>
                          <FaPaperPlane size={11} />{sending ? '...' : 'Send'}
                        </motion.button>
                      </form>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center max-w-sm">
                    <div className="w-14 h-14 bg-white/20 dark:bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 dark:border-white/10">
                      <FaComments size={20} className="text-slate-400 dark:text-white/30" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">No conversation selected</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Pick a chat from the left or open a business page.</p>
                    <a href="/user/dashboard" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all">Browse Businesses</a>
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Report Chat</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Why are you reporting this conversation?</p>
              
              <div className="space-y-2 mb-6">
                {['Spam or misleading', 'Inappropriate behavior', 'Scam or fraud', 'Other'].map(reason => (
                  <button key={reason} onClick={() => setReportReason(reason)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${reportReason === reason ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}>
                    {reason}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => {setIsReportModalOpen(false); setReportReason('')}} className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                  Cancel
                </button>
                <button onClick={submitReport} disabled={!reportReason} className="flex-1 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all">
                  Submit Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}