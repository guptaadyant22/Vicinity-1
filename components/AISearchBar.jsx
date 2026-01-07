// components/AISearchBar.jsx
'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  FaSearch,
  FaTimes,
  FaSpinner,
} from 'react-icons/fa'

const THEME = {
  accent: '#ff6f00',
  accentGrad: 'from-orange-400 to-pink-500',
}

export default function AISearchBar({
  searchTerm,
  onSearchChange,
  onAISearch,
  isSearching = false,
  onClear,
}) {
  const searchInputRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim() && !isSearching) {
      onAISearch(searchTerm)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    onSearchChange(value)
  }

  const handleClearSearch = () => {
    onSearchChange('')
    onClear?.()
    searchInputRef.current?.focus()
  }

  return (
    <div className="relative flex-1 max-w-2xl w-full group">
      <div className={`absolute inset-0 bg-gradient-to-r ${THEME.accentGrad} rounded-2xl blur opacity-15 group-hover:opacity-25 transition-opacity`} />

      <div className="relative flex items-center rounded-2xl px-5 py-4 backdrop-blur-xl bg-[#0f0f0f]/70 border border-white/10 focus-within:border-orange-500/40 transition-colors shadow-xl shadow-black/25">
        {isSearching && <FaSpinner className="text-orange-400 mr-4 animate-spin" size={18} />}
        {!isSearching && <FaSearch className="text-gray-500 mr-4" size={18} />}

        <input
          ref={searchInputRef}
          type="text"
          placeholder="Try 'best coffee shops' or 'highly rated restaurants'... Press Enter"
          className="bg-transparent border-none outline-none text-white w-full placeholder-gray-600 font-medium"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isSearching}
        />

        {searchTerm && !isSearching && (
          <motion.button
            whileHover={{ rotate: 90 }}
            onClick={handleClearSearch}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <FaTimes />
          </motion.button>
        )}
      </div>

      {/* Inline loading state */}
      {isSearching && (
        <div className="mt-2 text-xs text-orange-400 font-bold flex items-center gap-1">
          <FaSpinner className="animate-spin" size={12} />
          Processing with AI...
        </div>
      )}
    </div>
  )
}
