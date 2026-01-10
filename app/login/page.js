'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FaEye, FaEyeSlash, FaArrowLeft, FaExclamationCircle } from 'react-icons/fa'
import { createClient } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'


// --- THEMED CONSTANTS ---
const GLASS_NAV = "bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-lg transition-colors duration-300"
const GLASS_CARD = "bg-white/90 dark:bg-[#1a1a1a] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden transition-colors duration-300"
const GLASS_INPUT_BASE = "w-full px-4 py-3 border rounded-xl outline-none focus:outline-none transition-all"
const GLASS_INPUT_THEME = "bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
const GLASS_INPUT_NORMAL = "border-gray-200 dark:border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-white/10"
const GLASS_INPUT_ERROR = "border-red-500/50 focus:border-red-500 focus:bg-red-50 dark:focus:bg-red-950/10"
const TEXT_MAIN = "text-gray-900 dark:text-white"
const TEXT_MUTED = "text-gray-600 dark:text-gray-400"
const LABEL_STYLE = "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"


// --- GRID BACKGROUND (THEME AWARE) ---
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none bg-gray-50 dark:bg-[#050505] transition-colors duration-300 text-gray-300 dark:text-[#444]">
    <div className="absolute inset-0 opacity-20 dark:opacity-20" 
         style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
    <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-500/10 dark:bg-orange-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-normal" />
    <div className="absolute bottom-0 right-1/4 w-[1000px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-normal" />
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
        <Link href="/signup" className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Sign Up</Link>
        <Link href="/" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">Back Home</Link>
      </div>
    </div>
  </motion.nav>
)


const ERROR_MESSAGES = {
  EMAIL_REQUIRED: 'Email address is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
}


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})


  const router = useRouter()
  const supabase = createClient()
  const { signInWithGoogle } = useAuth()


  const isValidEmail = email => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }


  const validateForm = () => {
    const errors = {}


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


  const clearError = () => {
    setTimeout(() => {
      setError('')
    }, 5000)
  }


  const handleEmailChange = e => {
    setEmail(e.target.value)
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: '' }))
    }
    if (error) {
      setError('')
    }
  }


  const handlePasswordChange = e => {
    setPassword(e.target.value)
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: '' }))
    }
    if (error) {
      setError('')
    }
  }


  const handleSubmit = async e => {
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
        password: password,
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


  const handleGoogleSignIn = async () => {
  setIsGoogleLoading(true)
  try {
    await signInWithGoogle()
    // Don't set isGoogleLoading to false - the page will redirect
  } catch (err) {
    console.error('Error:', err)
    setError('Google sign-in failed. Please try again.')
    setIsGoogleLoading(false)
    clearError()
  }
}


  return (
    <main className="min-h-screen relative flex flex-col bg-gray-50 dark:bg-[#050505] transition-colors duration-300 font-sans selection:bg-orange-500 selection:text-white">
      <GridBackground />
      <Navbar />


      <div className="flex-1 flex items-center justify-center px-4 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Glass Card Container */}
          <div className={GLASS_CARD}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-pink-500" />
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 dark:bg-orange-600/20 opacity-20 dark:opacity-5 blur-3xl rounded-full animate-pulse pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/20 opacity-20 dark:opacity-5 blur-3xl rounded-full animate-pulse pointer-events-none" />


            {/* Header Section */}
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


            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-red-100 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-300 text-sm flex items-center gap-3 relative z-10"
                >
                  <FaExclamationCircle className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>


            {/* Google Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full mb-6 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/15 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-3 relative z-10"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign In with Google
                </>
              )}
            </motion.button>


            {/* Divider */}
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
              <span className={`text-xs font-medium ${TEXT_MUTED}`}>OR</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            </div>


            {/* Form */}
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.password}</p>}
              </div>


              {/* Actions Row */}
              <div className="flex items-center justify-between text-sm">
                <Checkbox 
                  label="Remember me" 
                  checked={rememberMe} 
                  onChange={setRememberMe} 
                  disabled={isLoading || isGoogleLoading} 
                />
                <Link 
                  href="/forgot-password" 
                  className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium text-xs"
                >
                  Forgot password?
                </Link>
              </div>


              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
              </motion.button>
            </form>


            {/* Footer Links */}
            <div className="mt-8 text-center pt-6 border-t border-gray-200 dark:border-white/10 relative z-10">
              <p className={`text-sm ${TEXT_MUTED}`}>
                Don't have an account?{' '}
                <Link href="/signup" className="text-orange-500 dark:text-orange-400 font-bold hover:text-orange-600 dark:hover:text-orange-300 transition-colors">
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


const Input = ({ label, type, value, onChange, placeholder, error, disabled }) => (
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


const Checkbox = ({ label, checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    className="flex items-center gap-2 group"
  >
    <div className={`w-4 h-4 rounded border transition-all ${
      checked 
        ? 'bg-orange-500 border-orange-500' 
        : 'border-gray-300 dark:border-white/30 bg-transparent'
    }`}>
      {checked && <div className="w-full h-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-[1px]" /></div>}
    </div>
    <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors">{label}</span>
  </button>
)
