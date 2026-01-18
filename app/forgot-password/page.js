// Forgot password and password reset page with multi-step form flow
// COMPONENTS:
// GRID BACKGROUND - Adaptive grid pattern background for light/dark modes
// VICINITY LOGO - Themed logo component with SVG icon
// NAVBAR - Navigation bar with logo and auth links
// EMAIL RESET FORM - Step 1: Email submission form for password reset
// CONFIRMATION MESSAGE - Step 2: Email confirmation message with resend option
// PASSWORD RESET FORM - Step 3: New password creation with strength indicator
// HELPER FUNCTIONS:
// IS VALID EMAIL - Validates email format using regex
// GET PASSWORD STRENGTH - Returns password strength level, percentage, and color
// HANDLE EMAIL SUBMIT - Sends password reset link to user email
// HANDLE PASSWORD RESET - Updates user password after token validation

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaArrowLeft, FaEnvelope, FaCheck, FaLock, FaEye, FaEyeSlash,
  FaArrowRight, FaExclamationCircle
} from 'react-icons/fa'
import { createClient } from '../../lib/supabase'

// --- THEMED CONSTANTS ---
const GLASS_NAV = "bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-lg transition-colors duration-300"
const GLASS_CARD = "bg-white/90 dark:bg-[#1a1a1a] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden transition-colors duration-300"
const GLASS_INPUT = "w-full pl-11 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
const TEXT_MAIN = "text-gray-900 dark:text-white"
const TEXT_MUTED = "text-gray-600 dark:text-gray-400"
const LABEL_STYLE = "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"

// --- ADAPTIVE GRID BACKGROUND ---
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none bg-gray-50 dark:bg-[#050505] transition-colors duration-300 text-gray-300 dark:text-[#444]">
    <div className="absolute inset-0 opacity-20 dark:opacity-10" 
         style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/80 dark:via-[#050505]/80 to-gray-50 dark:to-[#050505]" />
  </div>
)

// --- VICINITY LOGO (THEMED) ---
const VicinityLogo = ({ className = "", textClassName = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0,0,256,256" className="w-10 h-10">
      <g fill="#ff6f00" fillRule="nonzero">
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
    <span className={`font-black ${TEXT_MAIN} text-xl tracking-tight hidden md:block ${textClassName}`}>Vicinity</span>
  </div>
)

// --- NAVBAR (LOCAL & THEMED) ---
const Navbar = () => (
  <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
    <div className={`w-full max-w-5xl ${GLASS_NAV} rounded-2xl p-2 pointer-events-auto flex items-center justify-between pl-4 pr-2`}>
      <Link href="/"><VicinityLogo /></Link>
      <div className="flex items-center gap-2">
        <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Log In</Link>
        <Link href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">Get Started</Link>
      </div>
    </div>
  </motion.nav>
)

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetErrors, setResetErrors] = useState({})

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email.trim() || !isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        throw resetError
      }

      setSuccess('Password reset link sent! Check your email.')
      setStep(2)
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setError(null)
    setResetErrors({})

    const errors = {}
    if (!newPassword || newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setResetErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        throw updateError
      }

      setSuccess('Password updated successfully!')
      setStep(3)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const passwordStrength = getPasswordStrength(newPassword)

  return (
    <main className="min-h-screen relative flex flex-col bg-gray-50 dark:bg-[#050505] transition-colors duration-300 font-sans selection:bg-orange-500 selection:text-white">
      <GridBackground />
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-24 relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <EmailResetForm
              key="email"
              email={email}
              setEmail={setEmail}
              isLoading={isLoading}
              error={error}
              onSubmit={handleEmailSubmit}
            />
          ) : step === 2 ? (
            <ConfirmationMessage
              key="confirmation"
              email={email}
              onResend={handleEmailSubmit}
              isLoading={isLoading}
            />
          ) : (
            <PasswordResetForm
              key="reset"
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              isLoading={isLoading}
              error={error}
              success={success}
              errors={resetErrors}
              onSubmit={handlePasswordReset}
              passwordStrength={passwordStrength}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

const EmailResetForm = ({ email, setEmail, isLoading, error, onSubmit }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full max-w-md"
  >
    <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors text-sm font-medium">
      <FaArrowLeft /> Back to login
    </Link>

    <div className={GLASS_CARD}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-pink-500" />

      <div className="relative z-10 space-y-8">
        <div>
          <h1 className={`text-3xl md:text-4xl font-black ${TEXT_MAIN} mb-3 tracking-tight`}>
            Forgot Password?
          </h1>
          <p className={TEXT_MUTED}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-100 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-300 text-sm flex items-center gap-3"
          >
            <FaExclamationCircle className="flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className={LABEL_STYLE}>
              Email Address <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={GLASS_INPUT}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Send Reset Link <FaArrowRight size={14} />
              </>
            )}
          </motion.button>
        </form>

        <p className={`text-center text-sm ${TEXT_MUTED}`}>
          Remember your password?{' '}
          <Link href="/login" className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 font-semibold transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  </motion.div>
)

const ConfirmationMessage = ({ email, onResend, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="w-full max-w-md"
  >
    <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors text-sm font-medium">
      <FaArrowLeft /> Back to login
    </Link>

    <div className={GLASS_CARD}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-pink-500" />

      <div className="relative z-10 space-y-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-white text-3xl">
            <FaCheck />
          </div>
        </motion.div>

        <div>
          <h2 className={`text-3xl font-black ${TEXT_MAIN} mb-2 tracking-tight`}>
            Check Your Email
          </h2>
          <p className={TEXT_MUTED}>
            We've sent a password reset link to <span className={`font-semibold ${TEXT_MAIN}`}>{email}</span>
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <p className={`text-sm ${TEXT_MUTED}`}>
            The reset link will expire in <span className={`font-semibold ${TEXT_MAIN}`}>30 minutes</span>. If you don't see the email, check your spam folder.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <motion.button
            onClick={onResend}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Resend Email'}
          </motion.button>

          <Link
            href="/login"
            className="w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center border border-transparent dark:border-white/10"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  </motion.div>
)

const PasswordResetForm = ({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isLoading,
  error,
  success,
  errors,
  onSubmit,
  passwordStrength,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full max-w-md"
  >
    <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors text-sm font-medium">
      <FaArrowLeft /> Back to login
    </Link>

    <div className={GLASS_CARD}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-pink-500" />

      <div className="relative z-10 space-y-8">
        <div>
          <h1 className={`text-3xl md:text-4xl font-black ${TEXT_MAIN} mb-3 tracking-tight`}>
            Create New Password
          </h1>
          <p className={TEXT_MUTED}>
            Enter a strong password to secure your account.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-100 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-300 text-sm flex items-center gap-3"
          >
            <FaExclamationCircle className="flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-100 dark:bg-green-500/15 border border-green-200 dark:border-green-500/30 rounded-xl text-green-600 dark:text-green-300 text-sm flex items-center gap-3"
          >
            <FaCheck className="flex-shrink-0" />
            {success}
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className={LABEL_STYLE}>
              New Password <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={GLASS_INPUT}
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {newPassword && (
              <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${passwordStrength.percentage}%`,
                    backgroundColor: passwordStrength.color,
                  }}
                />
              </div>
            )}
            {errors.newPassword && <p className="text-xs text-red-500 dark:text-red-400">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className={LABEL_STYLE}>
              Confirm Password <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={GLASS_INPUT}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 dark:text-red-400">{errors.confirmPassword}</p>}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Reset Password <FaArrowRight size={14} />
              </>
            )}
          </motion.button>
        </form>

        <p className={`text-center text-sm ${TEXT_MUTED}`}>
          Remember your password?{' '}
          <Link href="/login" className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 font-semibold transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  </motion.div>
)

function getPasswordStrength(password) {
  if (!password) return { level: 0, percentage: 0, color: '#333' }
  if (password.length < 6) return { level: 1, percentage: 33, color: '#ef4444' }
  if (password.length < 10) return { level: 2, percentage: 66, color: '#f97316' }
  return { level: 3, percentage: 100, color: '#10b981' }
}
