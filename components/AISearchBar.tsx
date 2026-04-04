// AI-powered search bar with gradient glow, loading spinner, and clear button.
// Triggers an AI search on Enter key press and renders inline loading feedback.

'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import {
  FaSearch,
  FaTimes,
  FaSpinner,
} from 'react-icons/fa'

const THEME = {
  accent: '#2563eb',
  accentGrad: 'from-blue-500 to-cyan-400',
}

interface AISearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onAISearch: (term: string) => void
  isSearching?: boolean
  onClear?: () => void
}

// Renders a search input with AI-search trigger and loading state
export default function AISearchBar({
  searchTerm,
  onSearchChange,
  onAISearch,
  isSearching = false,
  onClear,
}: AISearchBarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Trigger AI search on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim() && !isSearching) {
      onAISearch(searchTerm)
    }
  }

  // Update search term state on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onSearchChange(value)
  }

  // Clear input and refocus
  const handleClearSearch = () => {
    onSearchChange('')
    onClear?.()
    searchInputRef.current?.focus()
  }

  return (
    <div className="relative flex-1 max-w-2xl w-full group">
      <div className={`absolute inset-0 bg-gradient-to-r ${THEME.accentGrad} rounded-2xl blur opacity-15 group-hover:opacity-25 transition-opacity`} />

      <div className="relative flex items-center rounded-2xl px-5 py-4 backdrop-blur-xl bg-white/85 dark:bg-white/[0.04] border border-blue-500/10 dark:border-white/10 focus-within:border-blue-500/40 dark:focus-within:border-blue-400/40 transition-colors shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:shadow-xl dark:shadow-black/25">
        {isSearching && <FaSpinner className="text-blue-500 mr-4 animate-spin" size={18} />}
        {!isSearching && <FaSearch className="text-slate-400 dark:text-slate-500 mr-4" size={18} />}

        <input
          ref={searchInputRef}
          type="text"
          placeholder="Try 'best coffee shops' or 'highly rated restaurants'... Press Enter"
          className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-slate-600 font-medium"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isSearching}
        />

        {searchTerm && !isSearching && (
          <motion.button
            whileHover={{ rotate: 90 }}
            onClick={handleClearSearch}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <FaTimes />
          </motion.button>
        )}
      </div>

      {/* Inline loading indicator */}
      {isSearching && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
          <FaSpinner className="animate-spin" size={12} />
          Processing with AI...
        </div>
      )}
    </div>
  )
}
