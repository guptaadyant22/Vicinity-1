'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaRobot, FaSync, FaChevronDown, FaChevronUp,
  FaBolt, FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
} from 'react-icons/fa'

interface FocusArea {
  title: string
  body: string
  severity: 'critical' | 'improve' | 'maintain'
}

interface Insights {
  healthScore: number
  healthLabel: string
  summary: string
  focusAreas: FocusArea[]
  customerPersona: string
  weeklyDigest: string
  dealTip: string
}

interface Props {
  reviews: any[]
  deals: any[]
  profile: any
  stats: {
    profileCompletion: number
    missingFields: string[]
    totalReviews: number
    avgRating: string | number
    positiveRate: number
    thisMonthReviews: number
    lastMonthReviews: number
    unansweredCount: number
    activeDeals: number
    expiringDeals: number
  }
}

const SEVERITY_CONFIG = {
  critical: {
    icon: FaExclamationTriangle,
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
    dot: 'bg-red-500',
    label: 'Critical',
    labelCls: 'text-red-600 dark:text-red-300',
  },
  improve: {
    icon: FaBolt,
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    dot: 'bg-amber-500',
    label: 'Improve',
    labelCls: 'text-amber-600 dark:text-amber-300',
  },
  maintain: {
    icon: FaCheckCircle,
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
    label: 'Maintain',
    labelCls: 'text-emerald-600 dark:text-emerald-300',
  },
}

function HealthRing({ score }: { score: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor"
          className="text-slate-200 dark:text-white/10" strokeWidth="7" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 48 48)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[var(--font-outfit)] text-2xl font-semibold text-slate-900 dark:text-white leading-none">
          {score}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

export default function AIInsightsCard({ reviews, deals, profile, stats }: Props) {
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/business-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews, deals, profile, stats }),
      })
      if (!res.ok) throw new Error('Failed to fetch insights')
      const data = await res.json()
      setInsights(data)
      setExpanded(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [reviews, deals, profile, stats])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  const CARD = 'overflow-hidden rounded-[30px] border border-blue-500/15 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)]'

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-blue-500/10 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300">
            <FaRobot size={16} />
          </div>
          <div>
            <h2 className="font-[var(--font-outfit)] text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              AI Business Insights
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by your reviews, deals & profile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {insights && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {expanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
            </button>
          )}
          <motion.button
            onClick={fetchInsights}
            disabled={loading}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-[var(--font-outfit)] font-semibold text-xs shadow-[0_10px_30px_rgba(59,130,246,0.24)] disabled:opacity-50 transition-colors"
          >
            <FaSync size={11} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analyzing...' : 'Refresh'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-6 mt-4 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="flex items-center justify-center py-14">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-[3px] border-blue-500/20 border-t-blue-500"
          />
        </div>
      )}

      <AnimatePresence>
        {insights && expanded && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 space-y-6"
          >
            {/* Health Score + Summary */}
            <div className="flex items-center gap-6">
              <HealthRing score={insights.healthScore} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white">
                    {insights.healthLabel}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                    Business Health
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {insights.summary}
                </p>
              </div>
            </div>

            {/* Focus Areas */}
            <div>
              <h3 className="font-[var(--font-outfit)] font-semibold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FaBolt className="text-blue-500 dark:text-blue-300" size={12} />
                Focus areas
              </h3>
              <div className="space-y-2.5">
                {insights.focusAreas?.map((area, i) => {
                  const cfg = SEVERITY_CONFIG[area.severity] || SEVERITY_CONFIG.improve
                  const Icon = cfg.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`flex items-start gap-3 p-4 rounded-2xl border ${cfg.bg} ${cfg.border}`}
                    >
                      <Icon className={`mt-0.5 shrink-0 ${cfg.labelCls}`} size={13} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{area.title}</p>
                          <span className={`text-[10px] font-semibold ${cfg.labelCls}`}>{cfg.label}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">{area.body}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Customer Persona + Weekly Digest */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-blue-500/10 dark:border-white/[0.06]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <FaInfoCircle size={10} /> What customers say
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {insights.customerPersona}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                  <FaBolt size={10} /> This week
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {insights.weeklyDigest}
                </p>
              </div>
            </div>

            {/* Deal Tip */}
            {insights.dealTip && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                <FaCheckCircle className="text-emerald-600 dark:text-emerald-300 mt-0.5 shrink-0" size={13} />
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">Deal tip: </span>
                  {insights.dealTip}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}