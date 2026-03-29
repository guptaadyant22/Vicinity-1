"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FaEnvelope,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTheme } from "../context/ThemeContext";
import { FogBackground } from "@/components/ui/fog";

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

// Section glow
function SectionGlow({ position = "left" }) {
  const { isDark } = useTheme();

  return (
    <motion.div
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

// Section header
function SectionHeader({ title, text, center = false }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      custom={0}
      variants={fadeUp}
      className={center ? "mx-auto mb-16 max-w-2xl text-center" : "mb-16 max-w-2xl"}
    >
      <h2 className="font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.06em] text-slate-900 dark:text-white md:text-5xl leading-[1.1]">
        {title}
      </h2>
      <p className="mt-5 text-[15px] leading-8 text-slate-500 dark:text-slate-400">
        {text}
      </p>
    </motion.div>
  );
}

// Feature card
function FeatureCard({ icon, title, text, badge, delay = 0 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      custom={delay}
      variants={fadeUp}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className="group relative overflow-hidden rounded-[28px] border border-blue-500/10 bg-white/70 p-7 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-all duration-300 hover:border-blue-500/25 hover:shadow-[0_24px_64px_rgba(59,130,246,0.10)] dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/15"
    >
      {/* Hover glow */}
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/0 blur-[60px] transition-all duration-500 group-hover:bg-blue-500/12" />

      {/* Icon */}
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

// Hero section
function HeroSection() {
  const words = ["restaurants", "salons", "gyms", "cafes", "shops"];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-40 md:pb-32 md:pt-48">
      {/* Hero-only fog background */}
      <FogBackground className="absolute inset-0" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mx-auto max-w-4xl font-[var(--font-outfit)] text-[clamp(2.5rem,6vw,4.5rem)] font-semibold tracking-[-0.07em] text-slate-900 dark:text-white leading-[1.05]"
        >
          Find the best local{" "}
          <span className="relative inline-block">
            <AnimatePresence mode="wait">
              <motion.span
                key={words[currentWord]}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.4 }}
                className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300"
              >
                {words[currentWord]}
              </motion.span>
            </AnimatePresence>

            {/* Underline accent */}
            <motion.div
              animate={{ scaleX: [0.7, 1, 0.7], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
            />
          </span>{" "}
          around you.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mx-auto mt-7 max-w-2xl text-[16px] leading-[1.9] text-slate-500 dark:text-slate-400"
        >
          Search local businesses, read real reviews, grab exclusive deals, and message owners directly — all powered by AI.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.a
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            href="/browse"
            className="group inline-flex items-center gap-2.5 rounded-2xl bg-blue-600 px-7 py-3.5 font-[var(--font-outfit)] text-sm font-semibold text-white shadow-[0_12px_36px_rgba(59,130,246,0.28)] hover:bg-blue-700 hover:shadow-[0_18px_48px_rgba(59,130,246,0.35)] transition-all"
          >
            Explore nearby
            <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            href="/signup"
            className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-white/80 px-7 py-3.5 font-[var(--font-outfit)] text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:border-blue-500/35 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.07]"
          >
            Create free account
          </motion.a>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="mx-auto mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400 dark:text-slate-500"
        >
          {[
            { icon: <FaStore />, text: "500+ businesses" },
            { icon: <FaStar />, text: "10k+ reviews" },
            { icon: <FaUsers />, text: "Growing community" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <span className="text-blue-500 dark:text-blue-400">{item.icon}</span>
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Showcase */}
      <div className="relative z-10 mx-auto mt-20 max-w-5xl">
        <ShowcasePanel />
      </div>
    </section>
  );
}

// Showcase panel
function ShowcasePanel() {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      {/* Glow */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.15, 0.3, 0.15],
          transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute inset-0 -z-10 rounded-[40px] bg-blue-500/12 blur-[60px]"
      />

      <div className="overflow-hidden rounded-[32px] border border-blue-500/12 bg-white/85 shadow-[0_40px_100px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/8 dark:bg-white/[0.03] dark:shadow-[0_40px_100px_rgba(0,0,0,0.40)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-blue-500/8 px-6 py-3.5 dark:border-white/8">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          </div>
          <div className="ml-4 flex-1 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] px-4 py-1.5 text-center">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">
              vicinity.app/browse
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left - Search + Results */}
          <div className="p-6 md:p-8 space-y-5">
            {/* Search bar */}
            <div className="flex items-center gap-3 rounded-2xl border border-blue-500/10 bg-white dark:bg-white/[0.04] px-4 py-3 shadow-sm dark:border-white/8">
              <FaSearch className="text-blue-500 dark:text-blue-400 text-sm" />
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

            {/* Result cards */}
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
                className="flex items-center gap-4 rounded-2xl border border-blue-500/8 bg-white/80 p-4 shadow-[0_4px_16px_rgba(15,23,42,0.03)] dark:border-white/8 dark:bg-white/[0.03] transition-all hover:border-blue-500/20 dark:hover:border-white/15"
              >
                {/* Avatar */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-600/10 text-blue-600 dark:text-blue-300 font-bold text-sm shrink-0">
                  {item.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-[var(--font-outfit)] text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    {item.deal && (
                      <span className="rounded-md bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-300 border border-green-500/15 shrink-0">
                        {item.deal}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {item.type} · ⭐ {item.rating} · {item.distance}
                  </p>
                </div>

                <FaHeart className="text-slate-300 dark:text-white/15 text-sm shrink-0 hover:text-red-400 transition-colors cursor-pointer" />
              </motion.div>
            ))}

            {/* Stats strip */}
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
                  <p className="font-[var(--font-outfit)] text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="border-t border-blue-500/8 p-6 dark:border-white/8 lg:border-l lg:border-t-0 lg:p-8">
            <div
              className={`relative overflow-hidden rounded-[24px] p-5 ${isDark ? "border border-white/8 bg-[#0a1628]" : "border border-blue-500/8 bg-slate-50/80"
                }`}
            >
              {/* Shimmer */}
              <motion.div
                animate={{
                  x: ["-130%", "130%"],
                  transition: { duration: 5, repeat: Infinity, ease: "linear" },
                }}
                className="absolute top-0 h-full w-20 bg-white/15 blur-md"
              />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-[var(--font-outfit)] text-[15px] font-semibold text-slate-900 dark:text-white">
                      Harbor Café
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      123 Main St · Open now
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-xl bg-blue-500/10 px-2.5 py-1 border border-blue-500/15">
                    <FaStar className="text-yellow-400 text-[10px]" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">4.9</span>
                  </div>
                </div>

                {/* Photo */}
                <div className="h-32 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-500/8 dark:border-white/8 flex items-center justify-center">
                  <span className="text-3xl">☕</span>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: <FaEnvelope />, label: "Message" },
                    { icon: <FaTag />, label: "Deals" },
                    { icon: <FaHeart />, label: "Save" },
                  ].map((action) => (
                    <div
                      key={action.label}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-blue-500/8 bg-white/60 dark:bg-white/[0.03] dark:border-white/8 p-2.5 text-center"
                    >
                      <span className="text-blue-500 dark:text-blue-400 text-xs">{action.icon}</span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {action.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recent review */}
                <div className="rounded-xl border border-blue-500/8 bg-white/60 dark:bg-white/[0.03] dark:border-white/8 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white font-bold">
                      S
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Sarah M.</span>
                    <div className="flex gap-0.5 ml-auto">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-[8px]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] leading-[1.6] text-slate-500 dark:text-slate-400">
                    &quot;Best coffee in town! The atmosphere is cozy and the staff is incredible.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Features section
function FeaturesSection() {
  const features = [
    {
      icon: <FaCompass size={20} />,
      title: "Smart local search",
      text: "Find restaurants, shops, gyms, and more with AI-powered search that understands what you're looking for.",
      badge: "AI-powered",
    },
    {
      icon: <FaStore size={20} />,
      title: "Detailed profiles",
      text: "View hours, photos, menus, reviews, and active deals — everything you need to decide where to go.",
      badge: "All-in-one",
    },
    {
      icon: <FaShieldAlt size={20} />,
      title: "Verified reviews",
      text: "Read honest feedback from real customers. Leave your own reviews to help your community.",
      badge: "Community-driven",
    },
    {
      icon: <FaBolt size={20} />,
      title: "Exclusive deals",
      text: "Save money with special offers and promo codes from local businesses — updated in real time.",
      badge: "Real-time",
    },
  ];

  return (
    <section id="features" className="relative px-6 pb-24 md:pb-32">
      <SectionGlow position="left" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeader
          title="Everything you need to explore local."
          text="Vicinity brings together search, reviews, deals, and messaging so you can discover and connect with businesses in your area — all from one platform."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

// How it works
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Search",
      text: "Type what you're looking for or browse by category. Our AI-powered search instantly finds the best matches near you.",
      icon: <FaSearch size={18} />,
    },
    {
      number: "02",
      title: "Compare",
      text: "View ratings, read reviews, check hours and deals — then message the business directly if you have questions.",
      icon: <FaCommentDots size={18} />,
    },
    {
      number: "03",
      title: "Visit & Review",
      text: "Head to the business, enjoy the experience, then leave a review to help others discover great spots.",
      icon: <FaStar size={18} />,
    },
  ];

  return (
    <section id="how-it-works" className="relative px-6 pb-24 md:pb-32">
      <SectionGlow position="right" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeader
          title="From search to visit in three simple steps."
          text="Whether you're looking for a new coffee shop, a trusted mechanic, or tonight's dinner spot — Vicinity gets you there faster."
          center
        />

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              custom={i * 0.1}
              variants={fadeUp}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative overflow-hidden rounded-[28px] border border-blue-500/8 bg-white/80 p-7 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl hover:border-blue-500/22 hover:shadow-[0_20px_56px_rgba(59,130,246,0.10)] dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/15 transition-all duration-300"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-400/0 blur-[50px] transition-all duration-500 group-hover:bg-blue-400/15" />

              <div className="relative z-10 flex items-center justify-between mb-6">
                <span className="font-[var(--font-outfit)] text-3xl font-bold tracking-tight text-blue-500/20 dark:text-blue-400/15">
                  {step.number}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-500/10 to-blue-600/5 text-blue-600 dark:text-blue-300 group-hover:shadow-[0_6px_20px_rgba(59,130,246,0.15)] transition-shadow">
                  {step.icon}
                </div>
              </div>

              <h3 className="relative z-10 font-[var(--font-outfit)] text-xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="relative z-10 mt-3 text-[13.5px] leading-[1.8] text-slate-500 dark:text-slate-400">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Audience section
function AudienceSection() {
  const cardClass =
    "group relative overflow-hidden rounded-[28px] border bg-white/80 p-8 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:bg-white/[0.03] transition-all duration-300";

  return (
    <section className="relative px-6 pb-24 md:pb-32">
      <SectionGlow position="left" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeader
          title="Great for locals. Powerful for businesses."
          text="Whether you're discovering new places or growing your business, Vicinity gives you the tools to do it better."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Users */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className={`${cardClass} border-blue-500/8 hover:border-blue-500/22 dark:border-white/8 dark:hover:border-white/15`}
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/0 blur-[50px] transition-all duration-500 group-hover:bg-blue-400/15" />

            <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-500/10 to-blue-600/5 text-blue-600 dark:text-blue-300 shadow-[0_8px_24px_rgba(59,130,246,0.10)]">
              <FaUsers size={20} />
            </div>

            <h3 className="relative z-10 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
              For users
            </h3>
            <p className="relative z-10 mt-3 text-sm leading-[1.8] text-slate-500 dark:text-slate-400">
              Discover nearby restaurants, shops, and services. Read real reviews, find deals, and save your favorite spots.
            </p>

            <div className="relative z-10 mt-6 space-y-2.5">
              {[
                "AI-powered search that understands context",
                "Real-time reviews, hours, and deal alerts",
                "Save favorites and message businesses directly",
              ].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 rounded-2xl border border-blue-500/8 bg-blue-50/30 px-4 py-3 dark:border-white/8 dark:bg-white/[0.02]"
                >
                  <FaCheckCircle className="text-blue-500 dark:text-blue-400 text-sm shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Businesses */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={0.1}
            variants={fadeUp}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className={`${cardClass} border-blue-500/8 hover:border-blue-500/22 dark:border-white/8 dark:hover:border-white/15`}
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/0 blur-[50px] transition-all duration-500 group-hover:bg-blue-400/15" />

            <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-500/10 to-blue-600/5 text-blue-600 dark:text-blue-300 shadow-[0_8px_24px_rgba(59,130,246,0.10)]">
              <FaChartLine size={20} />
            </div>

            <h3 className="relative z-10 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
              For businesses
            </h3>
            <p className="relative z-10 mt-3 text-sm leading-[1.8] text-slate-500 dark:text-slate-400">
              Create a professional business profile, manage reviews, publish deals, and message customers — all from your dashboard.
            </p>

            <div className="relative z-10 mt-6 space-y-2.5">
              {[
                "Full business dashboard with analytics",
                "Publish deals and promo codes in seconds",
                "Respond to reviews and message customers",
              ].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 rounded-2xl border border-blue-500/8 bg-blue-50/30 px-4 py-3 dark:border-white/8 dark:bg-white/[0.02]"
                >
                  <FaCheckCircle className="text-blue-500 dark:text-blue-400 text-sm shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// FAQ section
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
          {/* Left column */}
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

            {/* Info cards */}
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

            {/* CTA link */}
            <motion.a
              href="/signup"
              whileHover={{ x: 4 }}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 font-[var(--font-outfit)] hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Still have questions? Contact us <FaArrowRight className="text-xs" />
            </motion.a>
          </motion.div>

          {/* Right column */}
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

// CTA section
function CTASection() {
  return (
    <section className="relative px-6 pb-28 md:pb-36">
      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="relative overflow-hidden rounded-[36px] px-8 py-16 md:px-16 md:py-20"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-700 dark:via-blue-800 dark:to-indigo-900" />

          {/* Animated orbs */}
          <motion.div
            animate={{
              x: ["-10%", "10%", "-10%"],
              y: ["-5%", "5%", "-5%"],
              opacity: [0.15, 0.3, 0.15],
              transition: { duration: 10, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute top-0 left-0 h-[300px] w-[300px] rounded-full bg-white/10 blur-[80px]"
          />
          <motion.div
            animate={{
              x: ["8%", "-8%", "8%"],
              y: ["4%", "-4%", "4%"],
              opacity: [0.1, 0.25, 0.1],
              transition: { duration: 12, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute bottom-0 right-0 h-[250px] w-[250px] rounded-full bg-cyan-400/15 blur-[70px]"
          />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 text-center">
            <h3 className="mx-auto max-w-2xl font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white md:text-5xl leading-[1.1]">
              Your neighborhood is waiting to be explored.
            </h3>

            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.8] text-blue-100/70">
              Join thousands of people using Vicinity to discover local businesses, read reviews, and find the best deals nearby.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="/browse"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-8 py-4 font-[var(--font-outfit)] text-sm font-bold text-blue-700 shadow-[0_16px_48px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_56px_rgba(0,0,0,0.2)] transition-all"
              >
                Start exploring
                <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="/signup"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-8 py-4 font-[var(--font-outfit)] text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/18 hover:border-white/35"
              >
                Create free account
              </motion.a>
            </div>

            {/* Bottom stats */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-10">
              {[
                { value: "500+", label: "Businesses" },
                { value: "10k+", label: "Reviews" },
                { value: "100%", label: "Free" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <p className="font-[var(--font-outfit)] text-2xl font-bold text-white tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-blue-200/60 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Main page
export default function LandingPage() {
  return (
    <main
      className={`${inter.variable} ${outfit.variable} relative min-h-screen overflow-x-hidden bg-transparent text-slate-900 transition-colors duration-300 dark:text-white`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {/* Main page content */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AudienceSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}
