"use client";


// Landing page for Vicinity featuring hero, features, how-it-works, audience, FAQ, and CTA sections.
// Combines animated UI components with Framer Motion to create an engaging marketing experience.

import { useState, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Inter, Outfit } from "next/font/google";
import {
  FaArrowRight,
  FaCompass,
  FaStore,
  FaShieldAlt,
  FaSearch,
  FaCommentDots,
  FaStar,
  FaBolt,
  FaChevronDown,
  FaUsers,
  FaChartLine,
  FaCheckCircle,
  FaHeart,
  FaTag,
  FaEnvelope, FaTwitter, FaInstagram, FaLinkedin
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { useTheme } from "../context/ThemeContext";
import { BackgroundBeamsWithCollision } from "@/components/ui/beams-collision";
import dynamic from "next/dynamic";
import VicinityLogo from '../components/VicinityLogo'
import { UI_SETTINGS, LANDING_NAV_ITEMS, FOOTER_LINKS } from '../lib/ui'


const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};


// Renders an animated glowing background blob that adapts to dark/light theme
function SectionGlow({ position = "left" }) {
  const { isDark } = useTheme();

  return (
    <motion.div
      // Slow organic float animation for visual background depth
      animate={{
        scale: [1, 1.06, 1],
        opacity: [0.1, 0.22, 0.1],
        x: [0, position === "left" ? 20 : -20, 0],
        transition: { duration: 10, repeat: Infinity, ease: "easeInOut" },
      }}
      className={`absolute ${position === "left" ? "-left-32 top-10" : "-right-32 top-16"
        } h-[360px] w-[360px] rounded-full blur-[140px] ${isDark ? "bg-blue-500/10" : "bg-blue-100/70"
        }`}
    />
  );
}


// Reusable section header with fade-in animation and optional description text
function SectionHeader({
  title,
  text,
  center = false,
}: {
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      custom={0}
      variants={fadeUp}
      className={center ? "mx-auto mb-10 max-w-2xl text-center" : "mb-10 max-w-2xl"}
    >
      <h2 className="font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.06em] text-slate-900 dark:text-white md:text-5xl leading-[1.1]">
        {title}
      </h2>

      {text && (
        <p className="mt-5 text-[15px] leading-8 text-slate-500 dark:text-slate-400">
          {text}
        </p>
      )}
    </motion.div>
  );
}


// Renders a hoverable feature card with responsive glassmorphism styles
function FeatureCard({ icon, title, text, badge, delay = 0 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      custom={delay}
      variants={fadeUp}
      // Spring lift-on-hover transition for interactive tactile feedback
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className="group relative overflow-hidden rounded-[28px] border border-blue-500/10 bg-white/70 p-7 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-all duration-300 hover:border-blue-500/25 hover:shadow-[0_24px_64px_rgba(59,130,246,0.10)] dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/15"
    >
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/0 blur-[60px] transition-all duration-500 group-hover:bg-blue-500/12" />

      <div
        className="relative z-10 mb-5 flex h-13 w-13 items-center justify-center rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-500/10 to-blue-600/5 text-blue-600 shadow-[0_6px_20px_rgba(59,130,246,0.10)] dark:text-blue-300 dark:from-blue-500/15 dark:to-blue-600/5"
        style={{ width: "52px", height: "52px" }}
      >
        {icon}
      </div>

      <h3 className="relative z-10 font-[var(--font-outfit)] text-[17px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="relative z-10 mt-2.5 text-[13.5px] leading-[1.8] text-slate-500 dark:text-slate-400">
        {text}
      </p>

      {badge && (
        <div className="relative z-10 mt-5 inline-flex rounded-full border border-blue-500/15 bg-blue-500/6 px-3 py-1 font-[var(--font-outfit)] text-[11px] font-semibold tracking-[0.04em] text-blue-600 dark:text-blue-300">
          {badge}
        </div>
      )}
    </motion.div>
  );
}

// Landing page hero section containing cycling category names and animated Lottie graphics
function HeroSection({ isAdhd }: { isAdhd: boolean }) {
  // Array of rotating search terms used in the title typing animation
  const words = ["spas", "cafes", "shops", "salons", "gyms"];
  const [currentWord, setCurrentWord] = useState(0);

  // Interval loop to rotate the current search term word; paused when ADHD/reduced-motion mode is active
  useEffect(() => {
    if (isAdhd) return;
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isAdhd]);

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-32 md:pb-24 md:pt-40 h-screen max-h-screen flex flex-col justify-center">
      <div className="absolute inset-0 z-0">
        <img
          src="/hero.webp"
          alt="Hero Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply dark:bg-blue-950/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-[82rem] w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">

        <div className="flex-1 max-w-xl flex flex-col items-center text-center lg:items-center lg:text-center">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-[var(--font-outfit)] text-[clamp(2.4rem,4.5vw,4rem)] font-bold leading-[1.1] tracking-tight text-white drop-shadow-sm dark:text-white"
          >
            Find the best local{" "}
            <span className="relative inline-block min-w-[1.15em]">
              {/* AnimatePresence mode="wait" ensures the exit transition completes before the next word enters */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={words[currentWord]}
                  initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                  transition={{ duration: 0.4 }}
                  className="inline-block bg-white bg-clip-text text-transparent drop-shadow-md"
                >
                  {words[currentWord]}
                </motion.span>
              </AnimatePresence>
              {/* Decorative underline with subtle scale pulse */}
              <motion.div
                animate={{ scaleX: [0.75, 1, 0.75], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-2 left-0 right-0 h-[4px] rounded-full bg-white/80"
              />
            </span>{" "}
            around you
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-blue-50/90 drop-shadow-sm dark:text-blue-100/80"
          >
            Search businesses, read trusted reviews, message owners, and discover
            deals near you with a cleaner local experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.a
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="/browse"
              className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 font-[var(--font-outfit)] text-sm font-bold text-blue-900 shadow-lg transition-all hover:bg-blue-50 dark:bg-white dark:text-blue-900 dark:hover:bg-blue-50"
            >
              Explore nearby
              <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 font-[var(--font-outfit)] text-sm font-bold text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/20 dark:border-white/30 dark:bg-white/5 dark:hover:bg-white/15"
            >
              Create free account
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/90 drop-shadow-sm"
          >
            <div className="flex items-center gap-2">
              <FaStore className="text-blue-200 dark:text-blue-300" />
              <span className="font-medium">500+ businesses</span>
            </div>
            <div className="flex items-center gap-2">
              <FaStar className="text-blue-200 dark:text-blue-300" />
              <span className="font-medium">10k reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="text-blue-200 dark:text-blue-300" />
              <span className="font-medium">Growing community</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28 }}
          className="flex-1 w-full max-w-xl"
        >
          <div className="overflow-hidden rounded-[24px] border border-white/30 bg-white/75 shadow-[0_32px_64px_rgba(0,0,0,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_32px_64px_rgba(0,0,0,0.5)]">

            {/* Simulated macOS-style window controller dots */}
            <div className="flex items-center gap-4 border-b border-white/30 bg-white/50 px-5 py-3 rounded-t-[24px] dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex flex-1 items-center">
                <div className="flex items-center gap-2 rounded-md bg-white/80 px-4 py-1.5 text-xs font-medium text-slate-500 shadow-inner dark:bg-white/10 dark:text-slate-400">
                  <span className="text-slate-300 dark:text-slate-500">🔒</span>
                  vicinity.app/browse
                </div>
              </div>
              <div className="w-12" />
            </div>

            <div className="grid grid-cols-[1fr_0.85fr] bg-white/90 rounded-b-[24px] dark:bg-[#0d1b2e]/90">
              <div className="p-5">
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                  <FaSearch className="text-sm text-blue-500 dark:text-blue-400" />
                  <span className="flex-1 text-sm text-slate-500 dark:text-slate-400">Best coffee near me</span>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                    AI
                  </span>
                </div>

                <div className="mt-4 space-y-2.5">
                  {[
                    { name: "Harbor Café", meta: "Coffee • 4.9 • 0.8 mi", deal: "20% OFF" },
                    { name: "Northline Books", meta: "Bookstore • 4.8 • 1.5 mi", deal: "BOGO" },
                    { name: "Summit Fitness", meta: "Gym • 4.7 • 1.2 mi", deal: null },
                  ].map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, delay: 0.38 + i * 0.08 }}
                      className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-blue-100 hover:shadow-md dark:bg-white/[0.04] dark:border-blue-500/30"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                        {item.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-[var(--font-outfit)] text-xs font-semibold text-slate-900 dark:text-white">
                            {item.name}
                          </p>
                          {item.deal && (
                            <span className="shrink-0 rounded-md bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700 dark:bg-green-500/15 dark:text-green-300">
                              {item.deal}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{item.meta}</p>
                      </div>
                      <FaHeart className="shrink-0 text-xs text-slate-300 transition-colors group-hover:text-red-400 dark:text-white/20" />
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="border-l border-slate-100 p-4 flex items-center justify-center bg-slate-50/50 dark:border-white/8 dark:bg-white/[0.02] dark:border-blue-500/30">
                <div className="relative rounded-[18px] border border-blue-100 dark:border-blue-500/30 bg-white shadow-sm w-full dark:border-white/8 dark:bg-[#0f1b2d]">
                  {/* Glare shimmer animation to emphasize interactive mock component */}
                  <motion.div
                    animate={{ x: ["-130%", "130%"] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 h-full w-16 bg-blue-50/50 blur-xl dark:bg-blue-400/10"
                  />
                  <div className="relative z-10 flex items-center justify-center rounded-[14px] bg-white dark:bg-[#0f1b2d]">
                    <div style={{ overflow: "hidden", height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DotLottieReact
                        key={isAdhd ? "lottie-hero-paused" : "lottie-hero-playing"}
                        src="https://lottie.host/33802768-1bbb-4a7b-a3cc-6c6151c8a4b5/tLoA9BEj41.lottie"
                        loop
                        autoplay={!isAdhd}
                        style={{ width: "300px", height: "300px", flexShrink: 0, marginLeft: "-35px", marginRight: "-40px", marginTop: "20px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Dashboard mock showcase panel displaying a simulated search result list
function ShowcasePanel() {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative"
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.15, 0.3, 0.15],
          transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute inset-0 -z-10 rounded-[40px] bg-blue-500/12 blur-[60px]"
      />

      <div className="overflow-hidden rounded-[32px] border border-blue-500/12 bg-white/85 shadow-[0_40px_100px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/8 dark:bg-white/[0.03] dark:shadow-[0_40px_100px_rgba(0,0,0,0.40)]">
        {/* Mock window control buttons and address bar */}
        <div className="flex items-center gap-3 border-b border-blue-500/8 px-6 py-3.5 dark:border-white/8">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          </div>
          <div className="ml-4 flex-1 rounded-xl bg-slate-100/80 px-4 py-1.5 text-center dark:bg-white/[0.04]">
            <span className="text-xs font-medium tracking-wide text-slate-400 dark:text-slate-500">
              vicinity.app/browse
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5 p-6 md:p-8">
            <div className="flex items-center gap-3 rounded-2xl border border-blue-500/10 bg-white px-4 py-3 shadow-sm dark:border-white/8 dark:bg-white/[0.04]">
              <FaSearch className="text-sm text-blue-500 dark:text-blue-400" />
              <motion.div className="flex-1">
                <motion.span
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-sm text-slate-400 dark:text-slate-500"
                >
                  Search &quot;best coffee near me&quot;...
                </motion.span>
              </motion.div>
              <div className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                AI
              </div>
            </div>

            {[
              { name: "Harbor Café", type: "Coffee", rating: "4.9", distance: "0.8 mi", deal: "20% OFF" },
              { name: "Summit Fitness", type: "Gym", rating: "4.7", distance: "1.2 mi", deal: null },
              { name: "Northline Books", type: "Bookstore", rating: "4.8", distance: "1.5 mi", deal: "BOGO" },
            ].map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="flex items-center gap-4 rounded-2xl border border-blue-500/8 bg-white/80 p-4 shadow-[0_4px_16px_rgba(15,23,42,0.03)] transition-all hover:border-blue-500/20 dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/15"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-600/10 text-sm font-bold text-blue-600 dark:text-blue-300">
                  {item.name.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-[var(--font-outfit)] text-sm font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    {item.deal && (
                      <span className="shrink-0 rounded-md border border-green-500/15 bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-300">
                        {item.deal}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    {item.type} · ⭐ {item.rating} · {item.distance}
                  </p>
                </div>

                <FaHeart className="shrink-0 cursor-pointer text-sm text-slate-300 transition-colors hover:text-red-400 dark:text-white/15" />
              </motion.div>
            ))}

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { value: "500+", label: "Businesses" },
                { value: "10k+", label: "Reviews" },
                { value: "24/7", label: "Live updates" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-blue-500/8 bg-blue-500/[0.03] px-3 py-3 text-center dark:border-white/8"
                >
                  <p className="font-[var(--font-outfit)] text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-blue-500/8 p-6 dark:border-white/8 lg:border-l lg:border-t-0 lg:p-8">
            <div
              className={`relative overflow-hidden rounded-[24px] p-5 ${isDark
                  ? "border border-white/8 bg-[#0a1628]"
                  : "border border-blue-500/8 bg-slate-50/80"
                }`}
            >
              <motion.div
                animate={{
                  x: ["-130%", "130%"],
                  transition: { duration: 5, repeat: Infinity, ease: "linear" },
                }}
                className="absolute top-0 h-full w-20 bg-white/15 blur-md"
              />

              <div className="relative z-10">
                <div className="flex h-[340px] items-center justify-center overflow-hidden rounded-[18px] border border-blue-500/8 bg-white dark:border-white/8 dark:bg-[#0f1b2d]">
                  <div className="h-[280px] w-[280px] md:h-[300px] md:w-[300px]">
                    <DotLottieReact
                      src="https://lottie.host/33802768-1bbb-4a7b-a3cc-6c6151c8a4b5/tLoA9BEj41.lottie"
                      loop
                      autoplay
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


// Grid section showcasing the platform's core functional features
function FeaturesSection() {
  const features = [
    {
      icon: <FaCompass size={20} />,
      title: "Smart local search",
      text: "Find restaurants, shops, gyms, and more with AI-powered search that understands what you're looking for.",
      badge: "AI-powered",
      number: "01",
    },
    {
      icon: <FaStore size={20} />,
      title: "Detailed profiles",
      text: "View hours, photos, menus, reviews, and active deals — everything you need to decide where to go.",
      badge: "All-in-one",
      number: "02",
    },
    {
      icon: <FaShieldAlt size={20} />,
      title: "Verified reviews",
      text: "Read honest feedback from real customers. Leave your own reviews to help your community.",
      badge: "Community-driven",
      number: "03",
    },
    {
      icon: <FaBolt size={20} />,
      title: "Exclusive deals",
      text: "Save money with special offers and promo codes from local businesses — updated in real time.",
      badge: "Real-time",
      number: "04",
    },
  ];

  return (
    <section id="features" className="relative mt-16 px-6 pb-24 md:pb-32">
      <SectionGlow position="left" />
      <div className="relative z-10 mx-auto max-w-6xl">

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          custom={0}
          variants={fadeUp}
          className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-xl">

            <h2 className="font-[var(--font-outfit)] text-3xl font-semibold leading-[1.1] tracking-[-0.06em] text-slate-900 dark:text-white md:text-5xl">
              Everything you need<br className="hidden md:block" /> to explore local.
            </h2>
          </div>


        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              custom={i * 0.08}
              variants={fadeUp}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative overflow-hidden rounded-[28px] border border-blue-500/10 bg-white/70 p-7 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-all duration-300 hover:border-blue-500/25 hover:shadow-[0_24px_64px_rgba(59,130,246,0.10)] dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/15"
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/0 blur-[60px] transition-all duration-500 group-hover:bg-blue-500/12" />

              <span className="absolute right-6 top-5 font-[var(--font-outfit)] text-[11px] font-semibold tracking-[0.06em] text-slate-300 dark:text-white/20">
                {f.number}
              </span>

              <div
                className="relative z-10 mb-5 flex items-center justify-center rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-500/10 to-blue-600/5 text-blue-600 shadow-[0_6px_20px_rgba(59,130,246,0.10)] dark:text-blue-300 dark:from-blue-500/15 dark:to-blue-600/5"
                style={{ width: "52px", height: "52px" }}
              >
                {f.icon}
              </div>

              <h3 className="relative z-10 font-[var(--font-outfit)] text-[17px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">
                {f.title}
              </h3>

              <p className="relative z-10 mt-2.5 text-[13.5px] leading-[1.8] text-slate-500 dark:text-slate-400">
                {f.text}
              </p>


              {f.badge && (
                <div className="relative z-10 mt-5 inline-flex items-center gap-1.5 rounded-full border border-blue-500/15 bg-blue-500/6 px-3 py-1 font-[var(--font-outfit)] text-[11px] font-semibold tracking-[0.04em] text-blue-600 dark:text-blue-300">
                  <span className="h-1 w-1 rounded-full bg-blue-400" />
                  {f.badge}
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}


// Section explaining the user discovery journey in three compact steps
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Search",
      text: "Type what you're looking for or browse by category. Our AI finds the best matches near you.",
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80&fit=crop",
    },
    {
      number: "02",
      title: "Compare",
      text: "View ratings, read reviews, check hours and deals — then message the business directly.",
      img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&fit=crop",
    },
    {
      number: "03",
      title: "Visit & Review",
      text: "Head to the business, enjoy the experience, then leave a review to help others discover great spots.",
      img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80&fit=crop",
    },
  ];

  const renderStepCard = (step, i) => (
    <motion.div
      key={step.number}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      // Triggers viewport reveal only when step card intersects with screen scroll frame
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: i * 0.12, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-[28px] border border-blue-500/10 bg-white/70 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/22 hover:shadow-[0_24px_56px_rgba(59,130,246,0.10)] dark:border-white/8 dark:bg-white/[0.03]"
    >
      <div className="relative flex-1 px-5 pb-3 pt-5">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/0 blur-[50px] transition-all duration-500 group-hover:bg-blue-400/12" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className="mb-1 block font-[var(--font-outfit)] text-2xl font-bold leading-none tracking-tight text-blue-600 dark:text-blue-300">
              {step.number}
            </span>
            <h3 className="font-[var(--font-outfit)] text-[17px] whitespace-nowrap font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
              {step.title}
            </h3>
          </div>
          <p className="mt-1 text-[13px] leading-[1.6] text-slate-500 dark:text-slate-400">
            {step.text}
          </p>


        </div>
      </div>

      <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-52 mt-auto">
        <motion.img
          src={step.img}
          alt={step.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </motion.div>
  );

  return (
    <section id="how-it-works" className="relative px-6 pb-16 md:pb-20">

      <div className="relative z-10 mx-auto max-w-6xl">

        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-16 items-start mb-8 md:mb-10">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col justify-start"
          >
            <div className="mb-5 flex items-center gap-2">
              <span className="h-px w-6 bg-blue-500" />
              <span className="font-[var(--font-outfit)] text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-500">
                How it works
              </span>
            </div>

            <h2 className="font-[var(--font-outfit)] text-3xl font-semibold leading-[1.1] tracking-[-0.06em] text-slate-900 dark:text-white md:text-4xl lg:text-5xl">
              From search to visit in three simple steps.
            </h2>

            <p className="mt-5 text-[15px] leading-8 text-slate-500 dark:text-slate-400">
              Whether you&apos;re looking for a new coffee shop, a trusted mechanic, or tonight&apos;s dinner spot — Vicinity gets you there faster.
            </p>

            <motion.a
              href="/browse"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-[var(--font-outfit)] text-sm font-semibold text-white transition-all hover:bg-blue-700"
            >
              Start exploring
              <FaArrowRight className="text-xs" />
            </motion.a>
          </motion.div>

          <div className="flex flex-col h-full">
            {renderStepCard(steps[0], 0)}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
          <div className="flex flex-col h-full">
            {renderStepCard(steps[1], 1)}
          </div>
          <div className="flex flex-col h-full">
            {renderStepCard(steps[2], 2)}
          </div>
        </div>

      </div>
    </section>
  );
}


// Split layout targeting personal users vs commercial business owners
function AudienceSection({ isAdhd }: { isAdhd: boolean }) {
  const cardClass =
    "group relative flex flex-col items-center text-center overflow-hidden rounded-[32px] border bg-white/80 pt-12 px-6 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:bg-white/[0.03] transition-all duration-300";

  return (
    <section className="relative px-6 pb-24 md:pb-32">

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10 md:mb-14 text-center">
          <h2 className="font-[var(--font-outfit)] text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-5xl">
            Great for locals. Powerful for businesses.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            className={`${cardClass} border-blue-500/10 hover:border-blue-500/25 dark:border-white/10 dark:hover:border-white/20`}
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/0 blur-[50px] transition-all duration-500 group-hover:bg-blue-400/15" />

            <h3 className="relative z-10 font-[var(--font-outfit)] text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              For Community
            </h3>
            <p className="relative z-10 mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
              Discover nearby restaurants, shops, and services. Read real reviews, find deals, and save your favorite spots.
            </p>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/signup"
              className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-6 py-3 font-[var(--font-outfit)] text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30"
            >
              Personal
              <FaArrowRight className="text-xs" />
            </motion.a>

            <div className="relative z-10 mx-auto mt-8 flex max-w-sm flex-col gap-2.5 text-left w-full px-4">
              {[
                "AI-powered search that understands context",
                "Real-time reviews, hours, and deal alerts",
                "Save favorites and message businesses directly",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <FaCheckCircle className="mt-0.5 text-sm shrink-0 text-blue-500 dark:text-blue-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                </div>
              ))}
            </div>

            <div className="relative p-6 flex h-[200px] w-full items-end justify-center overflow-hidden md:h-[240px]">
              <div className="h-[160px] w-[160px] md:h-[180px] md:w-[180px]">
                <DotLottieReact
                  key={isAdhd ? "lottie-aud1-paused" : "lottie-aud1-playing"}
                  src="https://lottie.host/0a569a01-8ee1-4d24-b8a7-a8506acc7c49/f4a3YwXYcM.lottie"
                  loop
                  autoplay={!isAdhd}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            className={`${cardClass} border-blue-500/10 hover:border-blue-500/25 dark:border-white/10 dark:hover:border-white/20`}
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/0 blur-[50px] transition-all duration-500 group-hover:bg-blue-400/15" />

            <h3 className="relative z-10 font-[var(--font-outfit)] text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              For Businesses
            </h3>
            <p className="relative z-10 mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
              Create a professional business profile, manage reviews, publish deals, and message customers — all from your dashboard.
            </p>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/signup"
              className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-6 py-3 font-[var(--font-outfit)] text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30"
            >
              Business
              <FaArrowRight className="text-xs" />
            </motion.a>

            <div className="relative z-10 mx-auto mt-8 flex max-w-sm flex-col gap-2.5 text-left w-full px-4">
              {[
                "Full business dashboard with analytics",
                "Publish deals and promo codes in seconds",
                "Respond to reviews and message customers",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <FaCheckCircle className="mt-0.5 text-sm shrink-0 text-blue-500 dark:text-blue-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                </div>
              ))}
            </div>

            <div className="relative flex w-full items-center justify-center  pb-4">
              <div className="h-[160px] w-[160px] md:h-[180px] md:w-[180px] scale-[1.2] md:scale-[1.7] transform-gpu">
                <DotLottieReact
                  key={isAdhd ? "lottie-aud2-paused" : "lottie-aud2-playing"}
                  src="https://lottie.host/a787e51b-7df0-41d2-8d23-a85c1c1a9576/nZxquDKzQ5.lottie"
                  loop
                  autoplay={!isAdhd}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


// Frequently Asked Questions accordion widget with animated toggle states
function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    {
      question: "What is Vicinity?",
      answer:
        "Vicinity is a local business discovery platform that helps you find restaurants, shops, services, and more in your area. Browse listings, read reviews, grab deals, and connect with business owners — all in one place.",
    },
    {
      question: "Is Vicinity free to use?",
      answer:
        "Yes, Vicinity is completely free for users. Browse businesses, read reviews, save favorites, and message businesses at no cost. Business accounts are also free to create.",
    },
    {
      question: "How do I list my business on Vicinity?",
      answer:
        "Sign up for a free business account, fill in your profile details — including hours, photos, and description — and your listing goes live. You can also publish deals and respond to customer reviews from your dashboard.",
    },
    {
      question: "How does the AI search work?",
      answer:
        "Our AI-powered search understands natural language queries. Instead of just matching keywords, it understands context — so searching for 'a quiet place for coffee' returns cozy cafes, not just any coffee shop.",
    },
    {
      question: "Can I message a business directly?",
      answer:
        "Yes. If you have an account, you can send messages directly to any business on the platform. Business owners receive your message in their dashboard and can reply in real time.",
    },
    {
      question: "How are reviews verified?",
      answer:
        "All reviews are tied to authenticated user accounts. You must be signed in to leave a review, which helps keep feedback honest and trustworthy for the community.",
    },
  ];

  return (
    <section id="faq" className="relative px-6 pb-28 md:pb-36">
      <SectionGlow position="right" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] items-start">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="lg:sticky lg:top-28"
          >
            <h2 className="font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.06em] text-slate-900 dark:text-white md:text-4xl leading-[1.1]">
              Got questions?{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300">
                We&apos;ve got answers.
              </span>
            </h2>

            <p className="mt-4 text-[15px] leading-[1.8] text-slate-500 dark:text-slate-400">
              Everything you need to know about using Vicinity to discover local businesses or grow your own.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: <FaCompass />, label: "Free to use", desc: "No hidden fees for users or businesses" },
                { icon: <FaBolt />, label: "Instant setup", desc: "Create your business listing in minutes" },
                { icon: <FaShieldAlt />, label: "Verified community", desc: "All reviews from authenticated users" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                  className="flex items-center gap-3.5 rounded-2xl border border-blue-500/8 bg-white/60 dark:bg-white/[0.02] dark:border-white/8 px-4 py-3.5 backdrop-blur-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 text-blue-600 dark:text-blue-300 border border-blue-500/12 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white font-[var(--font-outfit)]">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="/signup"
              whileHover={{ x: 4 }}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 font-[var(--font-outfit)] hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Still have questions? Contact us <FaArrowRight className="text-xs" />
            </motion.a>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;

              return (
                <motion.div
                  key={faq.question}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i * 0.06}
                  variants={fadeUp}
                  className={`overflow-hidden rounded-[20px] border backdrop-blur-xl transition-all duration-300 ${isOpen
                      ? "border-blue-500/20 bg-white/90 shadow-[0_8px_32px_rgba(59,130,246,0.08)] dark:border-blue-500/15 dark:bg-white/[0.05] dark:shadow-[0_8px_32px_rgba(59,130,246,0.06)]"
                      : "border-blue-500/6 bg-white/70 shadow-[0_2px_12px_rgba(15,23,42,0.02)] hover:border-blue-500/15 dark:border-white/6 dark:bg-white/[0.02] dark:hover:border-white/12"
                    }`}
                >
                  {/* Accordion index header button that toggles local openIndex state */}
                  <button onClick={() => setOpenIndex(isOpen ? null : i)} className="flex w-full items-center gap-4 px-6 py-5 text-left">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold font-[var(--font-outfit)] shrink-0 transition-all duration-300 ${isOpen
                          ? "bg-blue-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)]"
                          : "bg-blue-500/8 text-blue-600 dark:text-blue-300"
                        }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="flex-1 font-[var(--font-outfit)] text-[15px] font-medium tracking-[-0.01em] text-slate-800 dark:text-white">
                      {faq.question}
                    </span>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className={`shrink-0 transition-colors duration-300 ${isOpen ? "text-blue-600 dark:text-blue-400" : "text-slate-300 dark:text-white/20"
                        }`}
                    >
                      <FaChevronDown size={11} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-5 pl-[72px]">
                          <p className="text-[13.5px] leading-[1.9] text-slate-500 dark:text-slate-400">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


// Final call-to-action banner with custom background shapes and particle grid
function CTASection() {
  return (
    <section className="relative px-6 pb-28 ">
      <div className="relative z-10 mx-auto max-w-5xl xl:max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="relative overflow-hidden rounded-[36px] px-8 py-24 md:px-16"
        >

          <div className="absolute inset-0 bg-slate-50 dark:bg-[#060d1a]" />

          <div className="absolute inset-0 dark:opacity-0"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.10) 0%, transparent 70%)",
            }}
          />

          <div className="absolute inset-0 opacity-0 dark:opacity-100"
            style={{
              background: "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(59,130,246,0.22) 0%, transparent 70%)",
            }}
          />

          <motion.div
            animate={{ x: ["-10%", "8%", "-10%"], y: ["-8%", "6%", "-8%"], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-20 -top-20 h-[320px] w-[320px] rounded-full bg-blue-500/5 blur-[80px] dark:bg-blue-500/20"
          />
          <motion.div
            animate={{ x: ["8%", "-8%", "8%"], y: ["6%", "-6%", "6%"], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 -right-20 h-[280px] w-[280px] rounded-full bg-indigo-500/5 blur-[70px] dark:bg-indigo-500/18"
          />

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" fill="none">
            <motion.path
              d="M -100 560 Q 500 -60 1100 560"
              stroke="rgba(59,130,246,0.08)"
              strokeWidth="1.5"
              fill="none"
              className="dark:[stroke:rgba(255,255,255,0.07)]"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
            />
            <motion.path
              d="M 150 560 Q 600 40 1150 560"
              stroke="rgba(59,130,246,0.06)"
              strokeWidth="1"
              strokeDasharray="6 5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.5, delay: 0.7, ease: "easeInOut" }}
            />
          </svg>

          <div
            className="absolute inset-0 opacity-[0.025] dark:opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
            }}
          />

          <div className="absolute inset-0 rounded-[36px] border border-blue-500/10 dark:border-blue-500/20" />

          <div className="relative z-10 flex flex-col items-center text-center">

            <motion.h3
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto max-w-3xl font-[var(--font-outfit)] text-4xl font-semibold leading-[1.1] tracking-[-0.05em] text-slate-900 dark:text-white md:text-6xl"
            >
              Your neighborhood is{" "}
              <span
                className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent dark:from-blue-300 dark:via-blue-200 dark:to-white"
              >
                waiting to be explored.
              </span>
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.4 }}
              className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-500 dark:text-slate-400"
            >
              Join thousands of people using Vicinity to discover local businesses,
              read reviews, and find the best deals nearby.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.5 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="/browse"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-blue-600 px-8 py-4 font-[var(--font-outfit)] text-sm font-bold text-white shadow-[0_8px_32px_rgba(59,130,246,0.35)] hover:bg-blue-700 hover:shadow-[0_12px_40px_rgba(59,130,246,0.45)] transition-all"
              >
                Start exploring
                <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="/signup"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 font-[var(--font-outfit)] text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 dark:border-white/12 dark:bg-white/8  dark:hover:bg-white/14 dark:hover:border-white/22"
              >
                Create free account
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mx-auto mt-14 mb-10 h-px w-64 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/12"
            />

            <div className="flex flex-wrap items-center justify-center gap-10">
              {[
                { value: "50+", label: "Businesses" },
                { value: "1k+", label: "Reviews" },
                { value: "100%", label: "Free" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.65 + i * 0.1 }}
                  className="text-center"
                >
                  <p className="font-[var(--font-outfit)] text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Main landing page entry point coordinating accessibility and theme styling
export default function LandingPage() {
  const [isAdhd, setIsAdhd] = useState(false);

  // Monitor document class changes to dynamically disable animations for ADHD or reduced-motion users
  useEffect(() => {
    const checkAdhd = () => {
      setIsAdhd(document.documentElement.classList.contains('a11y-adhd'));
    };
    checkAdhd();
    // Observe class list changes on the html root node to respond to accessibility toggle events
    const observer = new MutationObserver(checkAdhd);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion={isAdhd ? "always" : "user"}>
      <main
        className={`${inter.variable} ${outfit.variable} relative min-h-screen overflow-x-hidden bg-transparent text-slate-900 transition-colors duration-300 dark:text-white`}
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <div className="relative z-10">
          <Navbar />
          <HeroSection isAdhd={isAdhd} />
          <FeaturesSection />
          <HowItWorksSection />
          <AudienceSection isAdhd={isAdhd} />
          <FAQSection />
          <CTASection />
          <Footer />
        </div>
      </main>
    </MotionConfig>
  );
}
