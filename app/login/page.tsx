'use client'


// Login page with email/password authentication and Google OAuth support.
// Redirects authenticated users to their appropriate dashboard based on account type.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa'
import { createClient } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import AuthNavbar from '../../components/AuthNavbar'


const GLASS_CARD =
  'bg-white/88 dark:bg-[#0d142496] backdrop-blur-2xl border border-blue-500/12 dark:border-white/10 rounded-[30px] p-8 md:p-12 shadow-[0_20px_70px_rgba(15,23,42,0.16)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)] relative overflow-hidden transition-colors duration-300'

const GLASS_INPUT_BASE =
  'w-full px-4 py-3 rounded-2xl outline-none focus:outline-none transition-all text-sm'

const GLASS_INPUT_THEME =
  'bg-white dark:bg-white/4 text-slate-900 placeholder-slate-400 border border-blue-500/15 dark:border-white/10'

const GLASS_INPUT_NORMAL =
  'focus:border-blue-500 focus:bg-blue-50/60 dark:focus:bg-white/6'

const GLASS_INPUT_ERROR =
  'border-red-500/50 focus:border-red-500 focus:bg-red-50 dark:focus:bg-red-950/10'

const TEXT_MAIN = 'text-slate-900 dark:text-white'
const TEXT_MUTED = 'text-slate-600 dark:text-slate-400'
const LABEL_STYLE =
  'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'


// Animated gradient background for the login page
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none bg-white dark:bg-[#081120] transition-colors duration-300">
    <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:bg-[#081120]" />

    <motion.div
      animate={{ y: [0, -14, 0], scale: [1, 1.05, 1], opacity: [0.2, 0.38, 0.2] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute left-1/2 top-8 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-blue-200/70 blur-[140px] dark:bg-blue-500/15"
    />

    <motion.div
      animate={{ x: [0, 14, 0], y: [0, 10, 0], opacity: [0.12, 0.24, 0.12] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute left-[-2rem] top-[18%] h-[320px] w-[320px] rounded-full bg-cyan-100/80 blur-[120px] dark:bg-cyan-500/10"
    />

    <motion.div
      animate={{ x: [0, -16, 0], y: [0, -8, 0], opacity: [0.12, 0.24, 0.12] }}
      transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute right-[-2rem] top-[10%] h-[340px] w-[340px] rounded-full bg-indigo-100/70 blur-[120px] dark:bg-indigo-500/10"
    />

    <motion.div
      animate={{ backgroundPosition: ['0px 0px', '72px 72px'] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(59,130,246,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.22) 1px, transparent 1px)',
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(circle at center, black 45%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 100%)',
      }}
    />

    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#081120]" />
  </div>
)

const ERROR_MESSAGES = {
  EMAIL_REQUIRED: 'Email address is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
}

// Login page with email/password and Google OAuth authentication
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const router = useRouter()
  const supabase = createClient()
  const { signInWithGoogle } = useAuth()


  // Check if a string is a valid email format
  const isValidEmail = (emailVal: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)
  }


  // Validate email and password fields before submission
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!email.trim()) {
      errors.email = ERROR_MESSAGES.EMAIL_REQUIRED
    } else if (!isValidEmail(email)) {
      errors.email = ERROR_MESSAGES.EMAIL_INVALID
    }

    if (!password.trim()) {
      errors.password = ERROR_MESSAGES.PASSWORD_REQUIRED
    }

    return errors
  }


  // Auto-dismiss the global error banner after 5 seconds
  const clearError = () => {
    setTimeout(() => {
      setError('')
    }, 5000)
  }


  // Update email state and clear related errors
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)

    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: '' }))
    }

    if (error) {
      setError('')
    }
  }


  // Update password state and clear related errors
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)

    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: '' }))
    }

    if (error) {
      setError('')
    }
  }


  // Validate form and authenticate via Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setFieldErrors({})

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        if (
          signInError.message.includes('Invalid login credentials') ||
          signInError.message.includes('invalid_grant')
        ) {
          setError(ERROR_MESSAGES.INVALID_CREDENTIALS)
        } else {
          setError(signInError.message || ERROR_MESSAGES.GENERIC_ERROR)
        }

        setIsLoading(false)
        clearError()
        return
      }

      if (data?.user) {
        const userType = data.user.user_metadata?.user_type || 'community'

        if (userType === 'business') {
          router.push('/business/dashboard')
        } else {
          router.push('/user/dashboard')
        }
      } else {
        setError(ERROR_MESSAGES.GENERIC_ERROR)
        setIsLoading(false)
        clearError()
      }
    } catch (err) {
      setError(ERROR_MESSAGES.GENERIC_ERROR)
      setIsLoading(false)
      clearError()
    }
  }


  // Initiate Google OAuth sign-in flow
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)

    try {
      await signInWithGoogle()
    } catch (err) {
      console.error('Error:', err)
      setError('Google sign-in failed. Please try again.')
      setIsGoogleLoading(false)
      clearError()
    }
  }

  return (
    <main className="min-h-screen relative flex flex-col bg-white dark:bg-[#081120] transition-colors duration-300 font-sans selection:bg-blue-600 selection:text-white">
      <GridBackground />
      <AuthNavbar linkTo="/signup" linkText="Sign Up" homeText="Back Home" />

      <div className="flex-1 flex items-center justify-center px-4 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className={GLASS_CARD}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500" />

            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/15 opacity-30 dark:opacity-20 blur-3xl rounded-full animate-pulse pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/10 opacity-30 dark:opacity-20 blur-3xl rounded-full animate-pulse pointer-events-none" />

            <div className="text-center mb-10 relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-4xl font-black ${TEXT_MAIN} mb-3 tracking-tight`}
              >
                Welcome Back
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-base ${TEXT_MUTED}`}
              >
                Sign in to your account
              </motion.p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-300 text-sm flex items-center gap-3 relative z-10"
                >
                  <FaExclamationCircle className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full mb-6 bg-white/80 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-white/8 border border-blue-500/12 dark:border-white/10 text-slate-700 dark:text-white font-bold py-3.5 rounded-2xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-3 relative z-10"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign In with Google
                </>
              )}
            </motion.button>

            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="flex-1 h-px bg-blue-500/10 dark:bg-white/10" />
              <span className={`text-xs font-medium ${TEXT_MUTED}`}>OR</span>
              <div className="flex-1 h-px bg-blue-500/10 dark:bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                error={fieldErrors.email}
                disabled={isLoading || isGoogleLoading}
              />

              <div className="space-y-1.5">
                <label className={LABEL_STYLE}>Password</label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    disabled={isLoading || isGoogleLoading}
                    className={`${GLASS_INPUT_BASE} ${GLASS_INPUT_THEME} ${
                      fieldErrors.password ? GLASS_INPUT_ERROR : GLASS_INPUT_NORMAL
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>

                {fieldErrors.password && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <Checkbox
                  label="Remember me"
                  checked={rememberMe}
                  onChange={setRememberMe}
                  disabled={isLoading || isGoogleLoading}
                />

                <Link
                  href="/forgot-password"
                  className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors font-medium text-xs"
                >
                  Forgot password?
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.24)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-blue-500/10 dark:border-white/10 relative z-10">
              <p className={`text-sm ${TEXT_MUTED}`}>
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-blue-600 dark:text-blue-300 font-bold hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}


interface LoginInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

// Reusable form input with label and error display
const Input = ({ label, type, value, onChange, placeholder, error, disabled }: LoginInputProps) => (
  <div className="space-y-1.5">
    <label className={LABEL_STYLE}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`${GLASS_INPUT_BASE} ${GLASS_INPUT_THEME} ${
        error ? GLASS_INPUT_ERROR : GLASS_INPUT_NORMAL
      }`}
    />
    {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
  </div>
)


interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

// Styled checkbox toggle button
const Checkbox = ({ label, checked, onChange, disabled }: CheckboxProps) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    className="flex items-center gap-2 group"
  >
    <div
      className={`w-4 h-4 rounded border transition-all ${
        checked
          ? 'bg-blue-600 border-blue-600'
          : 'border-blue-500/20 dark:border-white/30 bg-transparent'
      }`}
    >
      {checked && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-[1px]" />
        </div>
      )}
    </div>

    <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
      {label}
    </span>
  </button>
)
