'use client'


// Forgot password page that sends a reset email via Supabase and handles token-based password updates.
// Supports both the initial reset request and the new-password submission flow.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaArrowLeft, FaEnvelope, FaCheck, FaLock, FaEye, FaEyeSlash,
  FaArrowRight, FaExclamationCircle
} from 'react-icons/fa'
import { createClient } from '../../lib/supabase'
import ThemeToggle from '../../components/ThemeToggle'


const GLASS_NAV = "bg-white/82 dark:bg-[#0d142488] backdrop-blur-2xl border border-blue-500/12 dark:border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.35)] transition-colors duration-300"
const GLASS_CARD = "bg-white/88 dark:bg-[#0d1424]/96 backdrop-blur-2xl border border-blue-500/12 dark:border-white/10 rounded-[30px] p-8 md:p-12 shadow-[0_20px_70px_rgba(15,23,42,0.16)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)] relative overflow-hidden transition-colors duration-300"
const GLASS_INPUT = "w-full pl-11 py-3 bg-white dark:bg-white/[0.04] border border-blue-500/15 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 focus:bg-blue-50/60 dark:focus:bg-white/[0.06] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
const TEXT_MAIN = "text-slate-900 dark:text-white"
const TEXT_MUTED = "text-slate-500 dark:text-slate-400"
const LABEL_STYLE = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]"


const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none bg-white dark:bg-[#081120] transition-colors duration-300">
    <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:bg-[#081120]" />
    <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-200/60 dark:bg-blue-500/10 blur-[120px] rounded-full" />
    <div className="absolute bottom-0 right-1/4 w-[1000px] h-[600px] bg-indigo-100/60 dark:bg-indigo-500/10 blur-[120px] rounded-full" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 dark:via-[#081120]/80 to-white dark:to-[#081120]" />
  </div>
)


const VicinityLogo = ({ className = "", textClassName = "" }: { className?: string; textClassName?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0,0,256,256" className="w-8 h-8 shrink-0">
      <g fill="#2563eb" fillRule="nonzero">
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


const Navbar = () => (
  <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
    <div className={`w-full max-w-5xl ${GLASS_NAV} rounded-[24px] p-2 pointer-events-auto flex items-center justify-between pl-4 pr-2`}>
      <Link href="/"><VicinityLogo /></Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-white/[0.06] rounded-2xl transition-all">Log In</Link>
        <Link href="/signup" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.22)] transition-all">Get Started</Link>
      </div>
    </div>
  </motion.nav>
)

// Password reset flow with email request and new-password form
export default function ForgotPasswordPage() {
  const supabase = createClient()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({})

  const handleEmailSubmit = async (e: React.FormEvent) => {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResetErrors({})

    const errors: Record<string, string> = {}
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const passwordStrength = getPasswordStrength(newPassword)

  return (
    <main className="min-h-screen relative flex flex-col bg-white dark:bg-[#081120] transition-colors duration-300 font-sans selection:bg-blue-600 selection:text-white">
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

interface EmailResetFormProps {
  email: string;
  setEmail: (v: string) => void;
  isLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

const EmailResetForm = ({ email, setEmail, isLoading, error, onSubmit }: EmailResetFormProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full max-w-md"
  >
    <Link href="/login" className={`flex items-center gap-2 ${TEXT_MUTED} hover:text-slate-900 dark:hover:text-white mb-8 transition-colors text-sm font-medium`}>
      <FaArrowLeft /> Back to login
    </Link>

    <div className={GLASS_CARD}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />

      <div className="relative z-10 space-y-8">
        <div>
          <h1 className={`text-3xl md:text-4xl font-black ${TEXT_MAIN} mb-3 tracking-tight`}>
            Forgot Password?
          </h1>
          <p className={TEXT_MUTED}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-300 text-sm flex items-center gap-3"
          >
            <FaExclamationCircle className="flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className={LABEL_STYLE}>
              Email Address <span className="text-blue-500">*</span>
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm" />
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.24)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
          <Link href="/login" className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 font-semibold transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  </motion.div>
)

interface ConfirmationMessageProps {
  email: string;
  onResend: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const ConfirmationMessage = ({ email, onResend, isLoading }: ConfirmationMessageProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="w-full max-w-md"
  >
    <Link href="/login" className={`flex items-center gap-2 ${TEXT_MUTED} hover:text-slate-900 dark:hover:text-white mb-8 transition-colors text-sm font-medium`}>
      <FaArrowLeft /> Back to login
    </Link>

    <div className={GLASS_CARD}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />

      <div className="relative z-10 space-y-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl">
            <FaCheck />
          </div>
        </motion.div>

        <div>
          <h2 className={`text-3xl font-black ${TEXT_MAIN} mb-2 tracking-tight`}>
            Check Your Email
          </h2>
          <p className={TEXT_MUTED}>
            We&apos;ve sent a password reset link to <span className={`font-semibold ${TEXT_MAIN}`}>{email}</span>
          </p>
        </div>

        <div className="bg-blue-50/60 dark:bg-blue-500/[0.06] border border-blue-500/12 dark:border-blue-500/15 rounded-2xl p-4">
          <p className={`text-sm ${TEXT_MUTED}`}>
            The reset link will expire in <span className={`font-semibold ${TEXT_MAIN}`}>30 minutes</span>. If you don&apos;t see the email, check your spam folder.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <motion.button
            onClick={onResend}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.24)] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Resend Email'}
          </motion.button>

          <Link
            href="/login"
            className="w-full bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold py-3.5 rounded-2xl shadow-sm transition-all flex items-center justify-center border border-blue-500/10 dark:border-white/10"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  </motion.div>
)

interface PasswordResetFormProps {
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  errors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
  passwordStrength: { level: number; percentage: number; color: string };
}

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
}: PasswordResetFormProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full max-w-md"
  >
    <Link href="/login" className={`flex items-center gap-2 ${TEXT_MUTED} hover:text-slate-900 dark:hover:text-white mb-8 transition-colors text-sm font-medium`}>
      <FaArrowLeft /> Back to login
    </Link>

    <div className={GLASS_CARD}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />

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
            className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-300 text-sm flex items-center gap-3"
          >
            <FaExclamationCircle className="flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-300 text-sm flex items-center gap-3"
          >
            <FaCheck className="flex-shrink-0" />
            {success}
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className={LABEL_STYLE}>
              New Password <span className="text-blue-500">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm" />
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {newPassword && (
              <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
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

          <div className="space-y-1.5">
            <label className={LABEL_STYLE}>
              Confirm Password <span className="text-blue-500">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm" />
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.24)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
          <Link href="/login" className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 font-semibold transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  </motion.div>
)

function getPasswordStrength(password: string) {
  if (!password) return { level: 0, percentage: 0, color: '#334155' }
  if (password.length < 6) return { level: 1, percentage: 33, color: '#ef4444' }
  if (password.length < 10) return { level: 2, percentage: 66, color: '#3b82f6' }
  return { level: 3, percentage: 100, color: '#10b981' }
}
