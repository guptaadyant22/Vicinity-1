'use client'


// Signup page with multi-step registration for both community users and business owners.
// Includes reCAPTCHA verification, Google OAuth, and account-type selection.

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Script from 'next/script'
import {
  FaStore,
  FaUser,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaArrowRight,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaMapPin,
  FaGlobe,
  FaBuilding,
  FaStar,
  FaPlus,
  FaExclamationCircle,
} from 'react-icons/fa'
import { createClient } from '../../lib/supabase'
import AuthNavbar from '../../components/AuthNavbar'
import type { IconType } from 'react-icons'


declare global {
  interface Window {
    grecaptcha: {
      render: (el: HTMLElement | null, opts: { sitekey: string | undefined; theme: string }) => void;
      getResponse: () => string;
    };
  }
}


const GLASS_CARD =
  'bg-white/88 dark:bg-[#0d142496] backdrop-blur-2xl border border-blue-500/12 dark:border-white/10 rounded-[30px] p-8 md:p-12 shadow-[0_20px_70px_rgba(15,23,42,0.16)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)] relative overflow-hidden transition-colors duration-300'

const TEXT_MAIN = 'text-slate-900 dark:text-white'
const TEXT_MUTED = 'text-slate-600 dark:text-slate-400'
const LABEL_STYLE =
  'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'

const INPUT_STYLE =
  'w-full py-3 px-4 bg-white dark:bg-[#111827] border border-blue-500/15 dark:border-white/10 rounded-lg text-slate-900 dark:text-white outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 focus:bg-blue-50/60 dark:focus:bg-[#162033] focus:border-blue-500'


const BUSINESS_TYPES = [
  'Restaurant',
  'Cafe',
  'Food Truck',
  'Bakery',
  'Retail Store',
  'Clothing Store',
  'Bookstore',
  'Gift Shop',
  'Hair Salon',
  'Spa',
  'Gym',
  'Yoga Studio',
  'Healthcare Clinic',
  'Dental Office',
  'Plumbing Service',
  'Cleaning Service',
  'Home Repair',
  'IT Consulting',
  'Accounting Service',
  'Photography Studio',
  'Entertainment Venue',
  'Arcade',
  'Cinema',
  'Escape Room',
  'Other',
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
  'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT',
  'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const EMPLOYEE_RANGES = ['1-10', '11-25', '26-50', '51-100']

const REVENUE_RANGES = ['Under $10K', '$10K - $25K', '$25K - $50K', '$50K - $100K']

const INTEREST_OPTIONS = [
  'Restaurants & Food',
  'Shopping & Retail',
  'Home Services',
  'Health & Wellness',
  'Professional Services',
]

const BUSINESS_STEPS = [
  { id: 1, label: 'Personal Info', icon: FaUser },
  { id: 2, label: 'Business Info', icon: FaBuilding },
  { id: 3, label: 'Location', icon: FaMapPin },
  { id: 4, label: 'Security', icon: FaLock },
  { id: 5, label: 'Confirm', icon: FaCheck },
]
 
const COMMUNITY_STEPS = [
  { id: 1, label: 'Profile', icon: FaUser },
  { id: 2, label: 'Interests', icon: FaStar },
  { id: 3, label: 'Security', icon: FaLock },
  { id: 4, label: 'Confirm', icon: FaCheck },
]

// Multi-step signup with user type selection and reCAPTCHA
export default function SignupPage() {
  const supabase = createClient()
  const router = useRouter()

  const [accountType, setAccountType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const [businessForm, setBusinessForm] = useState({
    name: '',
    businessName: '',
    email: '',
    website: '',
    phone: '',
    employeeCount: '',
    annualRevenue: '',
    businessType: '',
    customBusinessType: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    password: '',
    confirmPassword: '',
    isRealBusiness: false,
  })

  const [communityForm, setCommunityForm] = useState({
    name: '',
    email: '',
    city: '',
    zipCode: '',
    password: '',
    confirmPassword: '',
    interests: [],
    agreeToGuidelines: false,
  })

  const [businessErrors, setBusinessErrors] = useState<Record<string, string>>({})
  const [communityErrors, setCommunityErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)


  const handleAccountTypeSelect = (type: string) => {
    setAccountType(type)
    setCurrentStep(1)
    setBusinessErrors({})
    setCommunityErrors({})
    setError(null)
  }


  const handleBusinessInputChange = (field: string, value: string | boolean) => {
    setBusinessForm((prev) => ({ ...prev, [field]: value }))
    if (businessErrors[field]) {
      setBusinessErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }


  const handleCommunityInputChange = (field: string, value: string | boolean) => {
    setCommunityForm((prev) => ({ ...prev, [field]: value }))
    if (communityErrors[field]) {
      setCommunityErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }


  const handleInterestToggle = (interest: string) => {
    setCommunityForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }


  const isValidEmail = (emailVal: string) => /^\S+@\S+\.\S+$/.test(emailVal)


  const validateBusinessStep = (step: number) => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!businessForm.name.trim()) errors.name = 'Required'
      if (!businessForm.email.trim() || !isValidEmail(businessForm.email)) {
        errors.email = 'Invalid email'
      }
    } else if (step === 2) {
      if (!businessForm.businessName.trim()) errors.businessName = 'Required'
      if (!businessForm.businessType) errors.businessType = 'Required'
      if (
        businessForm.businessType === 'Other' &&
        !businessForm.customBusinessType.trim()
      ) {
        errors.customBusinessType = 'Please specify your business type'
      }
      if (!businessForm.phone.trim()) errors.phone = 'Required'
      if (!businessForm.employeeCount) errors.employeeCount = 'Required'
      if (!businessForm.annualRevenue) errors.annualRevenue = 'Required'
    } else if (step === 3) {
      if (!businessForm.streetAddress.trim()) errors.streetAddress = 'Required'
      if (!businessForm.city.trim()) errors.city = 'Required'
      if (!businessForm.state) errors.state = 'Required'
      if (!businessForm.zipCode.trim()) errors.zipCode = 'Required'
    } else if (step === 4) {
      if (!businessForm.password || businessForm.password.length < 8) {
        errors.password = 'Min 8 chars'
      }
      if (businessForm.password !== businessForm.confirmPassword) {
        errors.confirmPassword = 'Mismatch'
      }
    } else if (step === 5) {
      if (!businessForm.isRealBusiness) errors.isRealBusiness = 'Required'
    }

    return errors
  }


  const validateCommunityStep = (step: number) => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!communityForm.name.trim()) errors.name = 'Required'
      if (!communityForm.email.trim() || !isValidEmail(communityForm.email)) {
        errors.email = 'Invalid email'
      }
      if (!communityForm.city.trim()) errors.city = 'Required'
    } else if (step === 3) {
      if (!communityForm.password || communityForm.password.length < 8) {
        errors.password = 'Min 8 chars'
      }
      if (communityForm.password !== communityForm.confirmPassword) {
        errors.confirmPassword = 'Mismatch'
      }
    } else if (step === 4) {
      if (!communityForm.agreeToGuidelines) {
        errors.agreeToGuidelines = 'Required'
      }
    }

    return errors
  }


  const handleNextStep = () => {
    const isBusiness = accountType === 'business'
    const maxSteps = isBusiness ? 5 : 4
    const errors = isBusiness
      ? validateBusinessStep(currentStep)
      : validateCommunityStep(currentStep)

    if (Object.keys(errors).length > 0) {
      isBusiness ? setBusinessErrors(errors) : setCommunityErrors(errors)
      return
    }

    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1)
      setError(null)
    }
  }


  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }


  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const errors = validateBusinessStep(5)
    if (Object.keys(errors).length > 0) {
      setBusinessErrors(errors)
      return
    }

    setIsLoading(true)

    try {

      const token = await window.grecaptcha.getResponse()

      if (!token) {
        setError('Please complete the reCAPTCHA verification.')
        setIsLoading(false)
        return
      }

      const verifyResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyData.success) {
        setError('Bot verification failed. Please try again.')
        setIsLoading(false)
        return
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: businessForm.email.trim(),
        password: businessForm.password,
        options: {
          data: {
            user_type: 'business',
            fullname: businessForm.name,
          },
        },
      })

      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('No user ID returned')

      const { error: signinError } = await supabase.auth.signInWithPassword({
        email: businessForm.email.trim(),
        password: businessForm.password,
      })

      if (signinError) throw signinError

      const finalBusinessType =
        businessForm.businessType === 'Other'
          ? businessForm.customBusinessType
          : businessForm.businessType

      const { error: dbError } = await supabase.from('businesses').insert([
        {
          owner_id: userId,
          name: businessForm.businessName,
          type: finalBusinessType,
          email: businessForm.email,
          phone: businessForm.phone,
          website: businessForm.website || null,
          employee_count: businessForm.employeeCount,
          annual_revenue: businessForm.annualRevenue,
          address: businessForm.streetAddress,
          city: businessForm.city,
          state: businessForm.state,
          zip: businessForm.zipCode,
          photos: [],
          rating: 0,
          review_count: 0,
          description: '',
          hours: {
            monday: '9-5',
            tuesday: '9-5',
            wednesday: '9-5',
            thursday: '9-5',
            friday: '9-5',
            saturday: 'Closed',
            sunday: 'Closed',
          },
        },
      ])

      if (dbError) {
        throw new Error('Account created, but failed to save business profile.')
      }

      router.push('/business/profile')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.')
      setIsLoading(false)
    }
  }


  const handleCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const errors = validateCommunityStep(4)
    if (Object.keys(errors).length > 0) {
      setCommunityErrors(errors)
      return
    }

    setIsLoading(true)

    try {

      const token = await window.grecaptcha.getResponse()

      if (!token) {
        setError('Please complete the reCAPTCHA verification.')
        setIsLoading(false)
        return
      }

      const verifyResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyData.success) {
        setError('Bot verification failed. Please try again.')
        setIsLoading(false)
        return
      }

      const { error: authError } = await supabase.auth.signUp({
        email: communityForm.email.trim(),
        password: communityForm.password,
        options: {
          data: {
            user_type: 'community',
            fullname: communityForm.name,
            city: communityForm.city,
            zip: communityForm.zipCode,
            interests: communityForm.interests,
          },
        },
      })

      if (authError) throw authError

      const { error: signinError } = await supabase.auth.signInWithPassword({
        email: communityForm.email.trim(),
        password: communityForm.password,
      })

      if (signinError) throw signinError

      router.push('/user/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.')
      setIsLoading(false)
    }
  }


  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, percentage: 0, color: '#334155' }
    if (password.length < 6) return { level: 1, percentage: 33, color: '#ef4444' }
    if (password.length < 10) return { level: 2, percentage: 66, color: '#3b82f6' }
    return { level: 3, percentage: 100, color: '#06b6d4' }
  }

  return (
    <main className="min-h-screen relative flex flex-col bg-white dark:bg-[#081120] transition-colors duration-300 font-sans selection:bg-blue-600 selection:text-white">
      <AuthNavbar linkTo="/login" linkText="Log In" homeText="Home" />

      <div className="flex-1 flex items-center justify-center px-4 py-24 relative z-10">
        <AnimatePresence mode="wait">
          {!accountType ? (
            <div className="w-full" key="selection">
              <AccountTypeSelection onSelect={handleAccountTypeSelect} />
            </div>
          ) : (
            <div className="w-full max-w-2xl" key="form">
              <StepFormContainer
                accountType={accountType}
                currentStep={currentStep}
                onBack={() => setAccountType(null)}
                error={error}
              >
                {accountType === 'business' ? (
                  <BusinessStepForm
                    step={currentStep}
                    form={businessForm}
                    onInputChange={handleBusinessInputChange}
                    errors={businessErrors}
                    showPassword={showPassword}
                    showConfirmPassword={showConfirmPassword}
                    setShowPassword={setShowPassword}
                    setShowConfirmPassword={setShowConfirmPassword}
                    getPasswordStrength={getPasswordStrength}
                    onNext={handleNextStep}
                    onPrev={handlePrevStep}
                    onSubmit={handleBusinessSubmit}
                    isLoading={isLoading}
                  />
                ) : (
                  <CommunityStepForm
                    step={currentStep}
                    form={communityForm}
                    onInputChange={handleCommunityInputChange}
                    onInterestToggle={handleInterestToggle}
                    errors={communityErrors}
                    showPassword={showPassword}
                    showConfirmPassword={showConfirmPassword}
                    setShowPassword={setShowPassword}
                    setShowConfirmPassword={setShowConfirmPassword}
                    getPasswordStrength={getPasswordStrength}
                    onNext={handleNextStep}
                    onPrev={handlePrevStep}
                    onSubmit={handleCommunitySubmit}
                    isLoading={isLoading}
                  />
                )}
              </StepFormContainer>
            </div>
          )}
        </AnimatePresence>
      </div>

      <Script
        src="https://www.google.com/recaptcha/api.js"
        strategy="lazyOnload"
      />
    </main>
  )
}


const AccountTypeSelection = ({ onSelect }: { onSelect: (type: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="text-center w-full"
  >
    <h1 className={`text-5xl md:text-6xl font-black ${TEXT_MAIN} mb-6 tracking-tight`}>
      Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500">Vicinity</span>
    </h1>

    <p className={`text-lg ${TEXT_MUTED} mb-12`}>
      Connect with your city. Choose your path below.
    </p>

    <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
      <AccountCard
        icon={FaStore}
        title="Business Owner"
        subtitle="Grow your presence"
        features={['Manage reviews', 'Track analytics', 'Connect with locals']}
        onClick={() => onSelect('business')}
      />

      <AccountCard
        icon={FaUser}
        title="Community Member"
        subtitle="Discover & Support"
        features={['Find hidden gems', 'Write reviews', 'Build your profile']}
        onClick={() => onSelect('community')}
      />
    </div>
  </motion.div>
)


interface AccountCardProps {
  icon: IconType;
  title: string;
  subtitle: string;
  features: string[];
  onClick: () => void;
}

const AccountCard = ({ icon: Icon, title, subtitle, features, onClick }: AccountCardProps) => (
  <motion.button
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="group text-left w-full bg-white/88 dark:bg-[#0d142496] backdrop-blur-2xl border border-blue-500/12 dark:border-white/10 rounded-[30px] p-12 relative overflow-hidden hover:border-blue-500/25 dark:hover:border-white/20 transition-all shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
  >
    <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-15 blur-3xl transition-opacity duration-500 rounded-full" />

    <div className="relative z-10">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-500 flex items-center justify-center text-white text-3xl mb-8 shadow-[0_10px_30px_rgba(59,130,246,0.25)]">
        <Icon />
      </div>

      <h3 className={`text-3xl font-bold ${TEXT_MAIN} mb-3`}>{title}</h3>
      <p className={`${TEXT_MUTED} text-base mb-8`}>{subtitle}</p>

      <div className="space-y-4 mb-10">
        {features.map((f, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 text-base ${TEXT_MUTED} group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors`}
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
            {f}
          </div>
        ))}
      </div>

      <div className={`flex items-center gap-2 ${TEXT_MAIN} font-bold text-base`}>
        Get Started
        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </motion.button>
)


interface StepFormContainerProps {
  accountType: string;
  currentStep: number;
  onBack: () => void;
  error: string | null;
  children: React.ReactNode;
}

const StepFormContainer = ({ accountType, currentStep, onBack, error, children }: StepFormContainerProps) => {
  const isBusiness = accountType === 'business'
  const steps = isBusiness ? BUSINESS_STEPS : COMMUNITY_STEPS

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <button
        onClick={onBack}
        className={`flex items-center gap-2 ${TEXT_MUTED} hover:text-blue-600 dark:hover:text-white mb-8 transition-colors text-sm font-medium`}
      >
        <FaArrowLeft />
        Back to selection
      </button>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 mb-4">
          {steps.map((step, idx) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isComplete = currentStep > step.id

            return (
              <div key={step.id} className="flex-1">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isComplete
                        ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500 text-white'
                        : isActive
                        ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500 text-white ring-2 ring-blue-500/20'
                        : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                    }`}
                  >
                    {isComplete ? <FaCheck size={14} /> : <StepIcon size={14} />}
                  </div>

                  <span
                    className={`hidden md:block text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-slate-900 dark:text-white'
                        : isComplete
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>

                {idx < steps.length - 1 && (
                  <div
                    className={`h-1 transition-all ${
                      isComplete
                        ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500'
                        : 'bg-blue-500/10 dark:bg-white/10'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className={GLASS_CARD}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500" />

        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/15 opacity-30 dark:opacity-20 blur-3xl rounded-full animate-pulse pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/10 opacity-30 dark:opacity-20 blur-3xl rounded-full animate-pulse pointer-events-none" />

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-300 text-sm flex items-center gap-3 relative z-10">
            <FaExclamationCircle className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  )
}


interface BusinessFormData {
  name: string;
  businessName: string;
  email: string;
  website: string;
  phone: string;
  employeeCount: string;
  annualRevenue: string;
  businessType: string;
  customBusinessType: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  password: string;
  confirmPassword: string;
  isRealBusiness: boolean;
}

interface CommunityFormData {
  name: string;
  email: string;
  city: string;
  zipCode: string;
  password: string;
  confirmPassword: string;
  interests: string[];
  agreeToGuidelines: boolean;
}

interface BusinessStepFormProps {
  step: number;
  form: BusinessFormData;
  onInputChange: (field: string, value: string | boolean) => void;
  errors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  getPasswordStrength: (password: string) => { level: number; percentage: number; color: string };
  onNext: () => void;
  onPrev: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const BusinessStepForm = ({
  step,
  form,
  onInputChange,
  errors,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  getPasswordStrength,
  onNext,
  onPrev,
  onSubmit,
  isLoading,
}: BusinessStepFormProps) => {
  const recaptchaRef = useRef<HTMLDivElement>(null)
  const strength = getPasswordStrength(form.password)

  useEffect(() => {
    if (step === 5 && recaptchaRef.current && window.grecaptcha) {
      setTimeout(() => {
        window.grecaptcha.render(recaptchaRef.current, {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          theme: 'light',
        })
      }, 0)
    }
  }, [step])

  return (
    <form
      onSubmit={step === 5 ? onSubmit : (e) => { e.preventDefault(); onNext() }}
      className="space-y-6"
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        {step === 1 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Tell us about yourself</h3>
            <Input label="Your Full Name" placeholder="Will Jacks" required value={form.name} onChange={(e) => onInputChange('name', e.target.value)} error={errors.name} icon={FaUser} />
            <Input label="Email Address" placeholder="willjacks83@gmail.com" type="email" required value={form.email} onChange={(e) => onInputChange('email', e.target.value)} error={errors.email} icon={FaEnvelope} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Business Details</h3>
            <Input label="Business Name" placeholder='24 Fitness GYM' required value={form.businessName} onChange={(e) => onInputChange('businessName', e.target.value)} error={errors.businessName} icon={FaBuilding} />
            <Select label="Business Type" required value={form.businessType} onChange={(e) => onInputChange('businessType', e.target.value)} error={errors.businessType} options={BUSINESS_TYPES} />

            {form.businessType === 'Other' && (
              <Input
                label="Specify Your Business Type"
                required
                value={form.customBusinessType}
                onChange={(e) => onInputChange('customBusinessType', e.target.value)}
                error={errors.customBusinessType}
                placeholder="e.g., Art Gallery, Bookkeeping, etc."
                icon={FaPlus}
              />
            )}

            <Input label="Phone Number" placeholder='+1 212 555 1234' type="tel" required value={form.phone} onChange={(e) => onInputChange('phone', e.target.value)} error={errors.phone} icon={FaPhone} />
            <Input label="Website (Optional)" value={form.website} onChange={(e) => onInputChange('website', e.target.value)} error={errors.website} placeholder="www.24fitness.com.us" icon={FaGlobe} />
            <Select
              label="Number of Employees"
              required
              value={form.employeeCount}
              onChange={(e) => onInputChange('employeeCount', e.target.value)}
              error={errors.employeeCount}
              options={EMPLOYEE_RANGES}
              placeholder="Select range..."
            />

            <Select
              label="Annual Revenue"
              required
              value={form.annualRevenue}
              onChange={(e) => onInputChange('annualRevenue', e.target.value)}
              error={errors.annualRevenue}
              options={REVENUE_RANGES}
              placeholder="Select range..."
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Business Location</h3>
            <Input label="Street Address" placeholder='#-123, Lincon Towers, Downtown' required value={form.streetAddress} onChange={(e) => onInputChange('streetAddress', e.target.value)} error={errors.streetAddress} icon={FaMapPin} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" placeholder='LA' required value={form.city} onChange={(e) => onInputChange('city', e.target.value)} error={errors.city} />
              <Input label="ZIP Code" placeholder='10001' required value={form.zipCode} onChange={(e) => onInputChange('zipCode', e.target.value)} error={errors.zipCode} />
            </div>
            <Select label="State" required value={form.state} onChange={(e) => onInputChange('state', e.target.value)} error={errors.state} options={US_STATES} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Create Password</h3>

            <div className="space-y-1.5">
              <label className={LABEL_STYLE}>
                Password <span className="text-blue-600">*</span>
              </label>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  placeholder='********'
                  onChange={(e) => onInputChange('password', e.target.value)}
                  className={`${INPUT_STYLE} pl-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>

              {form.password && (
                <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${strength.percentage}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
              )}

              {errors.password && (
                <p className="text-xs text-red-500 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={LABEL_STYLE}>
                Confirm Password <span className="text-blue-600">*</span>
              </label>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  placeholder='********'
                  onChange={(e) => onInputChange('confirmPassword', e.target.value)}
                  className={`${INPUT_STYLE} pl-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600  transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-xs text-red-500 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Final Confirmation</h3>

            <div className="bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-300"><span className={`font-semibold ${TEXT_MAIN}`}>Name:</span> {form.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300"><span className={`font-semibold ${TEXT_MAIN}`}>Business:</span> {form.businessName}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300"><span className={`font-semibold ${TEXT_MAIN}`}>Type:</span> {form.businessType === 'Other' ? form.customBusinessType : form.businessType}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300"><span className={`font-semibold ${TEXT_MAIN}`}>Email:</span> {form.email}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300"><span className={`font-semibold ${TEXT_MAIN}`}>Location:</span> {form.city}, {form.state} {form.zipCode}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <div
                onClick={() => onInputChange('isRealBusiness', !form.isRealBusiness)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${
                  form.isRealBusiness
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-blue-500/20 dark:border-white/30 bg-transparent hover:border-blue-500/40 dark:hover:border-white/50'
                }`}
              >
                {form.isRealBusiness && <FaCheck className="text-white text-[10px]" />}
              </div>

              <span className={`text-xs ${TEXT_MUTED} pt-0.5`}>
                I confirm this is a real business and agree to Vicinity&apos;s terms.
              </span>
            </div>

            {errors.isRealBusiness && (
              <p className="text-xs text-red-500 dark:text-red-400">{errors.isRealBusiness}</p>
            )}

            <div className="flex justify-center py-4">
              <div ref={recaptchaRef}></div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex gap-4 mt-8 pt-6">
        {step > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="flex-1 px-6 py-3 bg-white/80 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-white/8 border border-blue-500/12 dark:border-white/10 text-slate-700 dark:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <FaArrowLeft size={14} />
            Back
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.24)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
            step === 1 ? 'col-span-2' : ''
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {step === 5 ? 'Create Account' : 'Next'}
              {step !== 5 && <FaArrowRight size={14} />}
            </>
          )}
        </button>
      </div>
    </form>
  )
}


interface CommunityStepFormProps {
  step: number;
  form: CommunityFormData;
  onInputChange: (field: string, value: string | boolean) => void;
  onInterestToggle: (interest: string) => void;
  errors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  getPasswordStrength: (password: string) => { level: number; percentage: number; color: string };
  onNext: () => void;
  onPrev: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const CommunityStepForm = ({
  step,
  form,
  onInputChange,
  onInterestToggle,
  errors,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  getPasswordStrength,
  onNext,
  onPrev,
  onSubmit,
  isLoading,
}: CommunityStepFormProps) => {
  const recaptchaRef = useRef<HTMLDivElement>(null)
  const strength = getPasswordStrength(form.password)

  useEffect(() => {
    if (step === 4 && recaptchaRef.current && window.grecaptcha) {
      setTimeout(() => {
        window.grecaptcha.render(recaptchaRef.current, {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          theme: 'light',
        })
      }, 0)
    }
  }, [step])

  return (
    <form
      onSubmit={step === 4 ? onSubmit : (e) => { e.preventDefault(); onNext() }}
      className="space-y-6"
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        {step === 1 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Create Your Profile</h3>
            <Input label="Full Name" placeholder="Cooper Wills" required value={form.name} onChange={(e) => onInputChange('name', e.target.value)} error={errors.name} icon={FaUser} />
            <Input label="Email Address" type="email" placeholder="cooper.wills@example.com" required value={form.email} onChange={(e) => onInputChange('email', e.target.value)} error={errors.email} icon={FaEnvelope} />
            <Input label="City" placeholder="Los Angeles" required value={form.city} onChange={(e) => onInputChange('city', e.target.value)} error={errors.city} icon={FaMapPin} />
            <Input label="ZIP Code (Optional)" value={form.zipCode} onChange={(e) => onInputChange('zipCode', e.target.value)} error={errors.zipCode} placeholder="10001" />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>What interests you?</h3>
            <p className={`text-sm ${TEXT_MUTED} mb-4`}>Help us personalize your experience</p>

            <div className="grid grid-cols-1 gap-3">
              {INTEREST_OPTIONS.map((interest) => (
                <div
                  key={interest}
                  onClick={() => onInterestToggle(interest)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    form.interests.includes(interest)
                      ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-700 dark:text-white shadow-md'
                      : 'bg-white/80 dark:bg-white/5 border-blue-500/12 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-white/8'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      form.interests.includes(interest)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-blue-500/20 dark:border-white/30 bg-transparent'
                    }`}
                  >
                    {form.interests.includes(interest) && (
                      <FaCheck className="text-white text-[10px]" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{interest}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Secure Your Account</h3>

            <div className="space-y-1.5">
              <label className={LABEL_STYLE}>
                Password <span className="text-blue-600">*</span>
              </label>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  placeholder="********"
                  onChange={(e) => onInputChange('password', e.target.value)}
                  className={`${INPUT_STYLE} pl-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>

              {form.password && (
                <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${strength.percentage}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
              )}

              {errors.password && (
                <p className="text-xs text-red-500 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={LABEL_STYLE}>
                Confirm Password <span className="text-blue-600">*</span>
              </label>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  placeholder="********"
                  onChange={(e) => onInputChange('confirmPassword', e.target.value)}
                  className={`${INPUT_STYLE} pl-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600  transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-xs text-red-500 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Review & Confirm</h3>

            <div className="bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-6 space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-300"><span className={`font-semibold ${TEXT_MAIN}`}>Name:</span> {form.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300"><span className={`font-semibold ${TEXT_MAIN}`}>Email:</span> {form.email}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300"><span className={`font-semibold ${TEXT_MAIN}`}>City:</span> {form.city}</p>
                {form.interests.length > 0 && (
                  <p className="text-sm text-slate-600 dark:text-slate-300"><span className={`font-semibold ${TEXT_MAIN}`}>Interests:</span> {form.interests.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <div
                onClick={() => onInputChange('agreeToGuidelines', !form.agreeToGuidelines)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${
                  form.agreeToGuidelines
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-blue-500/20 dark:border-white/30 bg-transparent hover:border-blue-500/40 dark:hover:border-white/50'
                }`}
              >
                {form.agreeToGuidelines && <FaCheck className="text-white text-[10px]" />}
              </div>

              <span className={`text-xs ${TEXT_MUTED} pt-0.5`}>
                I agree to the Community Guidelines.
              </span>
            </div>

            {errors.agreeToGuidelines && (
              <p className="text-xs text-red-500 dark:text-red-400">{errors.agreeToGuidelines}</p>
            )}

            <div className="flex justify-center py-4">
              <div ref={recaptchaRef}></div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex gap-4 mt-8 pt-6">
        {step > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="flex-1 px-6 py-3 bg-white/80 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-white/8 border border-blue-500/12 dark:border-white/10 text-slate-700 dark:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <FaArrowLeft size={14} />
            Back
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.24)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
            step === 1 ? 'col-span-2' : ''
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {step === 4 ? 'Join Community' : 'Next'}
              {step !== 4 && <FaArrowRight size={14} />}
            </>
          )}
        </button>
      </div>
    </form>
  )
}


interface SignupInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  icon?: IconType;
}

const Input = ({ label, required, error, icon: Icon, ...props }: SignupInputProps) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className={LABEL_STYLE}>
          {label} {required && <span className="text-blue-600">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm" />
        )}

        <input
          className={`${INPUT_STYLE} ${Icon ? 'pl-11' : 'px-4'} ${
            error
              ? 'border-red-500/50 focus:border-red-500 focus:bg-red-50 dark:focus:bg-red-950/10'
              : ''
          }`}
          {...props}
        />
      </div>

      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}


interface SignupSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  options: string[];
  placeholder?: string;
}

const Select = ({
  label,
  required,
  error,
  options,
  placeholder = 'Select...',
  ...props
}: SignupSelectProps) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className={LABEL_STYLE}>
          {label} {required && <span className="text-blue-600">*</span>}
        </label>
      )}

      <select
        className={`${INPUT_STYLE} px-4 appearance-none ${
          error ? 'border-red-500/50 focus:border-red-500' : ''
        }`}
        {...props}
      >
        <option value="" className="bg-white dark:bg-[#111827]">
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-white dark:bg-[#111827] dark:text-white">
            {o}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}
