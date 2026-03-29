"use client";

// Browse page for discovering and filtering local businesses
// Displays businesses in grid/list view with AI search, category filters, and pagination

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Inter, Outfit } from "next/font/google";
import {
  FaFilter,
  FaStore,
  FaGripHorizontal,
  FaListUl,
  FaTimes,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaSpinner,
  FaLock,
} from "react-icons/fa";

import { createClient } from "../../lib/supabase";
import BusinessCard from "../../components/BusinessCard";
import ThemeToggle from "../../components/ThemeToggle";

// Font setup
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

// Helper for category names
const CATEGORY_MAP = {
  restaurant: { short: "Restaurants" },
  cafe: { short: "Cafes" },
  bakery: { short: "Bakery" },
  bar: { short: "Bars" },
  clothing: { short: "Fashion" },
  electronics: { short: "Electronics" },
  home: { short: "Home" },
  salon: { short: "Salon" },
  gym: { short: "Fitness" },
  automotive: { short: "Auto" },
  cinema: { short: "Cinema" },
  bowling: { short: "Bowling" },
  pizza: { short: "Pizza" },
  sushi: { short: "Sushi" },
  burger: { short: "Burgers" },
  coffee: { short: "Coffee" },
  dessert: { short: "Desserts" },
  "fast food": { short: "Fast Food" },
  korean: { short: "Korean" },
  japanese: { short: "Japanese" },
};

const formatBusinessType = (type) => {
  if (!type) return "Other";
  const lowercase = type.toLowerCase().trim();
  if (CATEGORY_MAP[lowercase]) return CATEGORY_MAP[lowercase].short;
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (lowercase.includes(key) || key.includes(lowercase)) return value.short;
  }
  return type.length > 12 ? type.substring(0, 10) + ".." : type;
};

// Shared page background
const AnimatedBg = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-[#081120] transition-colors duration-300">
    {/* Base wash */}
    <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:from-[#081120] dark:via-[#081120] dark:to-[#0b1528]" />

    {/* Main glow */}
    <motion.div
      animate={{
        y: [0, -16, 0],
        scale: [1, 1.05, 1],
        opacity: [0.25, 0.4, 0.25],
        transition: { duration: 9, repeat: Infinity, ease: "easeInOut" },
      }}
      className="absolute left-1/2 top-[-8%] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-blue-200/70 blur-[150px] dark:bg-blue-500/15"
    />

    {/* Side glows */}
    <motion.div
      animate={{
        x: [0, 18, 0],
        opacity: [0.16, 0.28, 0.16],
        transition: { duration: 11, repeat: Infinity, ease: "easeInOut" },
      }}
      className="absolute left-[-10%] top-[18%] h-[320px] w-[320px] rounded-full bg-blue-100/80 blur-[120px] dark:bg-blue-400/10"
    />
    <motion.div
      animate={{
        x: [0, -14, 0],
        opacity: [0.12, 0.24, 0.12],
        transition: { duration: 12, repeat: Infinity, ease: "easeInOut" },
      }}
      className="absolute right-[-8%] top-[16%] h-[320px] w-[320px] rounded-full bg-blue-100/70 blur-[120px] dark:bg-blue-600/10"
    />

    {/* Grid */}
    <motion.div
      animate={{
        backgroundPosition: ["0px 0px", "72px 72px"],
        transition: { duration: 18, repeat: Infinity, ease: "linear" },
      }}
      className="absolute inset-0 opacity-[0.06] dark:opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(59,130,246,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.22) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        maskImage:
          "radial-gradient(circle at center, black 42%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(circle at center, black 42%, transparent 100%)",
      }}
    />

    {/* Top radial */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_42%)]" />
  </div>
);

// Shared skeleton state
const SkeletonCard = ({ viewMode }: { viewMode: string }) => (
  <div
    className={`overflow-hidden rounded-[28px] border border-blue-500/10 bg-white/80 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172a] ${
      viewMode === "list" ? "flex h-80" : "h-[400px]"
    }`}
  >
    <div
      className={`animate-pulse bg-slate-200 dark:bg-[#162033] ${
        viewMode === "list" ? "w-64 flex-shrink-0" : "h-56 w-full"
      }`}
    />
    <div
      className={`space-y-3 p-5 ${viewMode === "list" ? "flex-1 p-6" : "w-full"}`}
    >
      <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-[#162033]" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-[#162033]" />
      <div className="flex gap-2">
        <div className="h-8 flex-1 animate-pulse rounded-xl bg-slate-200 dark:bg-[#162033]" />
        <div className="h-8 flex-1 animate-pulse rounded-xl bg-slate-200 dark:bg-[#162033]" />
      </div>
    </div>
  </div>
);

// Shared filter section
const FilterSection = ({ title, icon: Icon, children }: { title: string; icon?: React.ComponentType<{ size?: number; className?: string }>; children: React.ReactNode }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-t border-blue-500/10 pt-5 first:border-t-0 first:pt-0 dark:border-white/10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-3 flex w-full items-center justify-between font-[var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={11} className="text-blue-600 dark:text-blue-300" />}
          {title}
        </div>
        <motion.div
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown size={10} />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function BrowsePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>("grid");
  const [filterOpen, setFilterOpen] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState(null);
  const [sortOption, setSortOption] = useState("default");

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: bData, error: bError } = await supabase
          .from("businesses")
          .select("*")
          .limit(100);

        if (bError) throw bError;

        const formattedBusinesses = (bData || []).map((b) => ({
          ...b,
          rating: parseFloat(b.rating) || 0,
          review_count: parseInt(b.review_count) || 0,
          is_open: b.is_open ?? true,
          image_url: b.image_url || b.imageUrl || null,
          type: (b.type || "Other").trim(),
          created_at: b.created_at || new Date().toISOString(),
        }));

        setBusinesses(formattedBusinesses);

        const categoryCount: Record<string, number> = {};
        formattedBusinesses.forEach((b) => {
          const type = b.type;
          categoryCount[type] = (categoryCount[type] || 0) + 1;
        });

        const topCategories = Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([type]) => type);

        setAvailableCategories(topCategories);
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setAiSearchResults(null);
    }
  };

  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setAiSearchResults(null);
      return;
    }

    setAiSearchLoading(true);
    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          businesses: businesses,
        }),
      });

      const data = await response.json();
      setAiSearchResults(data.matchedBusinesses || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("AI Search error:", error);
      setAiSearchResults(null);
    } finally {
      setAiSearchLoading(false);
    }
  };

  // Unified filtering and sorting logic
  const filteredAndSortedBusinesses = useMemo(() => {
    let result = aiSearchResults !== null ? [...aiSearchResults] : [...businesses];

    if (aiSearchResults === null && searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(lowerQuery) ||
          b.type.toLowerCase().includes(lowerQuery) ||
          (b.description && b.description.toLowerCase().includes(lowerQuery))
      );
    }

    if (categoryFilter) {
      result = result.filter((b) => b.type === categoryFilter);
    }

    if (sortOption === "highest-rated") {
      result = result.sort((a, b) => {
        const ratingA = parseFloat(a.rating) || 0;
        const ratingB = parseFloat(b.rating) || 0;
        return ratingB - ratingA;
      });
    } else if (sortOption === "most-reviewed") {
      result = result.sort((a, b) => {
        const countA = parseInt(a.review_count) || 0;
        const countB = parseInt(b.review_count) || 0;
        return countB - countA;
      });
    } else if (sortOption === "newest") {
      result = result.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }

    return result;
  }, [businesses, categoryFilter, sortOption, aiSearchResults, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedBusinesses.length / PAGE_SIZE)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, sortOption, aiSearchResults, searchQuery]);

  const paginatedBusinesses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedBusinesses.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedBusinesses, currentPage]);

  const startIndex = filteredAndSortedBusinesses.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(
    currentPage * PAGE_SIZE,
    filteredAndSortedBusinesses.length
  );

  const clearAllFilters = () => {
    setCategoryFilter(null);
    setSortOption("default");
    setSearchQuery("");
    setAiSearchResults(null);
    setCurrentPage(1);
  };

  const activeFilterCount = (categoryFilter ? 1 : 0) + (searchQuery ? 1 : 0);

  const handleRestrictedAction = () => {
    router.push("/login?redirect=/browse");
  };

  return (
    <div
      className={`${inter.variable} ${outfit.variable} relative min-h-screen overflow-x-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-[#081120] dark:text-white`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <AnimatedBg />

      {/* Browse navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4"
      >
        <div className="pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-blue-500/15 bg-white/75 p-2 pl-4 pr-2 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-300 hover:bg-white/85 dark:border-white/10 dark:bg-[#0f172a]">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              viewBox="0,0,256,256"
              className="h-8 w-8"
            >
              <g fill="#3b82f6" fillRule="nonzero">
                <g transform="translate(256,256) rotate(180) scale(5.33333,5.33333)">
                  <path d="M5,45l4,-11l12,-12l-6,23z"></path>
                  <path d="M25,18l8,27h10l-11,-33z"></path>
                  <path d="M16.059,14.164l3.941,-11.164h8z"></path>
                  <path d="M10.731,29.002l12.269,-12.002v-2l-11.42,11.667z"></path>
                  <path d="M15.142,16.429l-2.142,5.571l16.724,-16.275l-0.906,-2.547z"></path>
                  <path d="M23.932,14.055l0.445,1.571l6.564,-6.448l-0.556,-1.476z"></path>
                </g>
              </g>
            </svg>

            <span className="font-[var(--font-outfit)] text-xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
              Vicinity
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="/login"
              className="rounded-xl px-5 py-2.5 font-[var(--font-outfit)] text-sm font-semibold text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-[#162033] dark:hover:text-white"
            >
              Log In
            </a>
            <a
              href="/signup"
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-[var(--font-outfit)] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.22)] transition-transform hover:scale-[1.03]"
            >
              Get Started
            </a>
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-32">
        {/* Hero */}
        <section className="mb-14">
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-[var(--font-outfit)] text-5xl font-semibold tracking-[-0.07em] text-slate-900 dark:text-white md:text-7xl"
            >
              Explore nearby places with a cleaner experience.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 max-w-2xl text-[15px] leading-8 text-slate-600 dark:text-slate-400 md:text-[17px]"
            >
              Browse local businesses, use search and filters, and discover better
              options faster. Sign in to unlock full details and deeper access.
            </motion.p>
          </div>
        </section>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Mobile filters trigger */}
          <div className="lg:hidden">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="flex w-full items-center justify-between rounded-2xl border border-blue-500/10 bg-white/80 p-3.5 text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-colors hover:border-blue-500/20 dark:border-white/10 dark:bg-[#0f172a] dark:text-slate-200"
            >
              <div className="flex items-center gap-2">
                <FaFilter size={14} className="text-blue-600 dark:text-blue-300" />
                <span className="font-[var(--font-outfit)] text-sm font-semibold">
                  Filters
                </span>
              </div>

              {activeFilterCount > 0 && (
                <span className="rounded-full bg-blue-600 px-2.5 py-1 font-[var(--font-outfit)] text-xs font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </motion.button>
          </div>

          {/* Sidebar */}
          <AnimatePresence>
            {(filterOpen || mobileFilterOpen) && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 lg:w-72"
              >
                <div className="sticky top-28 space-y-6 rounded-[28px] border border-blue-500/10 bg-white/80 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0f172a]">
                  {/* Filter top */}
                  <div className="flex items-center justify-between lg:block">
                    <h3 className="flex items-center gap-2 font-[var(--font-outfit)] text-sm font-semibold uppercase tracking-[0.18em] text-slate-900 dark:text-white">
                      <FaFilter size={12} className="text-blue-600 dark:text-blue-300" />
                      Filters
                    </h3>

                    {activeFilterCount > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        onClick={clearAllFilters}
                        className="font-[var(--font-outfit)] text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        Clear All
                      </motion.button>
                    )}

                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white lg:hidden"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>

                  {/* Active filter count */}
                  {activeFilterCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-center font-[var(--font-outfit)] text-xs font-semibold text-blue-700 dark:text-blue-300"
                    >
                      {activeFilterCount} active filter
                      {activeFilterCount > 1 ? "s" : ""}
                    </motion.div>
                  )}

                  {/* Categories */}
                  {availableCategories.length > 0 && (
                    <FilterSection title="Business Types" icon={FaStore}>
                      <div className="grid grid-cols-2 gap-2">
                        {availableCategories.map((type) => (
                          <button
                            key={type}
                            onClick={() =>
                              setCategoryFilter(categoryFilter === type ? null : type)
                            }
                            className={`rounded-xl px-2 py-2.5 text-center font-[var(--font-outfit)] text-xs font-medium transition-all ${
                              categoryFilter === type
                                ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(59,130,246,0.22)]"
                                : "border border-blue-500/10 bg-slate-50 text-slate-600 hover:border-blue-500/25 hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:bg-[#162033] dark:text-slate-300 dark:hover:bg-[#1d2a44] dark:hover:text-white"
                            }`}
                          >
                            {formatBusinessType(type)}
                          </button>
                        ))}
                      </div>
                    </FilterSection>
                  )}

                  {/* Sorting */}
                  <FilterSection title="Sort By">
                    <div className="space-y-2">
                      {[
                        { id: "default", label: "Default" },
                        { id: "highest-rated", label: "Highest Rated" },
                        { id: "most-reviewed", label: "Most Reviewed" },
                        { id: "newest", label: "Newest" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSortOption(opt.id)}
                          className={`w-full rounded-xl px-3 py-2.5 text-left font-[var(--font-outfit)] text-sm font-medium transition-all ${
                            sortOption === opt.id
                              ? "border border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                              : "border border-blue-500/10 bg-slate-50 text-slate-600 hover:border-blue-500/20 hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:bg-[#162033] dark:text-slate-300 dark:hover:bg-[#1d2a44] dark:hover:text-white"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </FilterSection>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main content */}
          <div className="flex-1">
            <div className="space-y-6">
              {/* Top controls */}
              <div className="flex items-center justify-between gap-4">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="hidden rounded-xl border border-blue-500/10 bg-white/80 p-2.5 text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors hover:border-blue-500/20 hover:text-blue-700 dark:border-white/10 dark:bg-[#0f172a] dark:text-slate-400 dark:hover:text-white lg:flex"
                  title="Toggle filters"
                >
                  <FaFilter size={14} />
                </motion.button>

                <h2 className="flex-1 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">
                  Discover Nearby
                </h2>

                <div className="flex gap-2 rounded-2xl border border-blue-500/10 bg-white/80 p-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172a]">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    onClick={() => setViewMode("grid")}
                    className={`rounded-xl p-2.5 transition-all ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white shadow-[0_8px_20px_rgba(59,130,246,0.22)]"
                        : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Grid view"
                  >
                    <FaGripHorizontal size={14} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    onClick={() => setViewMode("list")}
                    className={`rounded-xl p-2.5 transition-all ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white shadow-[0_8px_20px_rgba(59,130,246,0.22)]"
                        : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="List view"
                  >
                    <FaListUl size={14} />
                  </motion.button>
                </div>
              </div>

              {/* Search */}
              <form onSubmit={handleAiSearch} className="relative">
                <div className="relative overflow-hidden rounded-[24px] border border-blue-500/10 bg-white/85 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172a]">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />

                  <input
                    type="text"
                    placeholder="Search by name, category, or description..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="w-full bg-transparent py-4 pl-11 pr-20 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  />

                  {aiSearchLoading ? (
                    <FaSpinner
                      className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-blue-600"
                      size={16}
                    />
                  ) : (
                    <button
                      type="submit"
                      disabled={!searchQuery.trim() || aiSearchLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-blue-600 px-3 py-2 font-[var(--font-outfit)] text-xs font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Run AI Semantic Search"
                    >
                      AI Search
                    </button>
                  )}
                </div>

                {aiSearchResults !== null && (
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      AI Search found{" "}
                      <span className="font-[var(--font-outfit)] font-semibold text-blue-600 dark:text-blue-300">
                        {filteredAndSortedBusinesses.length}
                      </span>{" "}
                      results
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setAiSearchResults(null);
                        setSearchQuery("");
                      }}
                      className="font-[var(--font-outfit)] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </form>

              {/* Result count */}
              <div className="flex items-center justify-between px-1">
                <div className="text-sm text-slate-500 dark:text-slate-300">
                  Showing{" "}
                  <span className="font-[var(--font-outfit)] font-semibold text-blue-600 dark:text-blue-300">
                    {startIndex}–{endIndex}
                  </span>{" "}
                  of{" "}
                  <span className="font-[var(--font-outfit)] font-semibold text-slate-900 dark:text-white">
                    {filteredAndSortedBusinesses.length}
                  </span>
                </div>
              </div>

              {/* Loading */}
              {loading ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonCard key={i} viewMode={viewMode} />
                  ))}
                </div>
              ) : filteredAndSortedBusinesses.length > 0 ? (
                <>
                  {/* Results */}
                  <div
                    className={`grid gap-6 ${
                      viewMode === "grid"
                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1"
                    }`}
                  >
                    {paginatedBusinesses.map((business) => (
                      <div key={business.id} className="group relative cursor-pointer">
                        {/* Restricted overlay click */}
                        <div
                          onClick={handleRestrictedAction}
                          className="absolute inset-0 z-10"
                        />

                        {/* Existing card kept intact */}
                        <BusinessCard
                          business={business}
                          isSaved={false}
                          onSave={() => {}}
                          viewMode={viewMode}
                        />

                        {/* Lock badge */}
                        <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full border border-white/20 bg-slate-950/60 px-2.5 py-1 text-xs text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                          <FaLock size={10} /> Sign in to view
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-between px-2">
                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-[var(--font-outfit)] text-sm font-medium transition-all ${
                          currentPage === 1
                            ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-[#162033]"
                            : "border border-blue-500/10 bg-white/80 text-slate-600 hover:border-blue-500/25 hover:text-blue-700 dark:border-white/10 dark:bg-[#0f172a] dark:text-slate-300 dark:hover:text-white"
                        }`}
                      >
                        <FaChevronLeft size={12} /> Previous
                      </button>

                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(
                            (p) =>
                              p === 1 ||
                              p === totalPages ||
                              (p >= currentPage - 1 && p <= currentPage + 1)
                          )
                          .map((page, index, array) => {
                            const prev = array[index - 1];
                            const showEllipsis = prev && page - prev > 1;

                            return (
                              <React.Fragment key={page}>
                                {showEllipsis && (
                                  <span className="px-1 text-slate-400">...</span>
                                )}
                                <button
                                  onClick={() => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  className={`h-10 w-10 rounded-xl font-[var(--font-outfit)] text-sm font-semibold transition-all ${
                                    page === currentPage
                                      ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(59,130,246,0.2)]"
                                      : "border border-blue-500/10 bg-white/80 text-slate-600 hover:border-blue-500/20 hover:text-blue-700 dark:border-white/10 dark:bg-[#0f172a] dark:text-slate-300 dark:hover:text-white"
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            );
                          })}
                      </div>

                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-[var(--font-outfit)] text-sm font-medium transition-all ${
                          currentPage === totalPages
                            ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-[#162033]"
                            : "border border-blue-500/10 bg-white/80 text-slate-600 hover:border-blue-500/25 hover:text-blue-700 dark:border-white/10 dark:bg-[#0f172a] dark:text-slate-300 dark:hover:text-white"
                        }`}
                      >
                        Next <FaChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Empty state */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-blue-500/20 bg-white/80 py-24 text-center shadow-[0_12px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172a]"
                >
                  <h3 className="font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
                    No places found
                  </h3>
                  <p className="mx-auto mb-8 mt-2 max-w-xs text-slate-500 dark:text-slate-400">
                    Try adjusting your filters or search to see more results.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    onClick={clearAllFilters}
                    className="rounded-2xl bg-blue-600 px-8 py-3 font-[var(--font-outfit)] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.22)] transition-all"
                  >
                    Clear All Filters
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
