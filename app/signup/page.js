'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaStore, FaUser, FaArrowLeft, FaEye, FaEyeSlash, FaCheck,
  FaArrowRight, FaLock, FaEnvelope, FaPhone, FaMapPin, FaGlobe,
  FaBuilding, FaStar, FaPlus
} from 'react-icons/fa'
import { createClient } from '../../lib/supabase'


// --- NAVBAR COMPONENT ---
const VicinityLogo = ({ className = "", textClassName = "" }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0,0,256,256" className="w-8 h-8">
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
    <span className={`font-black text-orange-500 dark:text-orange-400 text-xl tracking-tight ${textClassName}`}>Vicinity</span>
  </div>
)


const SignupNavbar = () => (
  <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
    <div className="w-full max-w-5xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-gray-300/20 dark:border-white/15 rounded-2xl p-2 shadow-2xl pointer-events-auto flex items-center justify-between pl-4 pr-2 hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-300">
      <VicinityLogo />
      
      <div className="flex items-center gap-2">
        <a href="/login" className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Log In</a>
        <a href="/" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">Home</a>
      </div>
    </div>
  </motion.nav>
)


// --- THEMED CONSTANTS ---
const GLASS_CARD = "bg-white/90 dark:bg-[#1a1a1a] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden transition-colors duration-300"
const TEXT_MAIN = "text-gray-900 dark:text-white"
const TEXT_MUTED = "text-gray-600 dark:text-gray-400"
const LABEL_STYLE = "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
const INPUT_STYLE = "w-full py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"


// --- GRID BACKGROUND (THEME AWARE) ---
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none bg-gray-50 dark:bg-[#050505] transition-colors duration-300 text-gray-300 dark:text-[#444]">
    <div className="absolute inset-0 opacity-20 dark:opacity-20" 
         style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-500/10 dark:bg-orange-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-normal" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/80 dark:via-[#050505]/80 to-gray-50 dark:to-[#050505]" />
  </div>
)


const BUSINESS_TYPES = [
  'Restaurant', 'Cafe', 'Food Truck', 'Bakery', 'Retail Store', 'Clothing Store',
  'Bookstore', 'Gift Shop', 'Hair Salon', 'Spa', 'Gym', 'Yoga Studio',
  'Healthcare Clinic', 'Dental Office', 'Plumbing Service', 'Cleaning Service',
  'Home Repair', 'IT Consulting', 'Accounting Service', 'Photography Studio',
  'Entertainment Venue', 'Arcade', 'Cinema', 'Escape Room', 'Other'
]


const US_STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
const INTEREST_OPTIONS = ['Restaurants & Food', 'Shopping & Retail', 'Home Services', 'Health & Wellness', 'Professional Services']


const BUSINESS_STEPS = [
  { id: 1, label: 'Personal Info', icon: FaUser },
  { id: 2, label: 'Business Info', icon: FaBuilding },
  { id: 3, label: 'Location', icon: FaMapPin },
  { id: 4, label: 'Security', icon: FaLock },
  { id: 5, label: 'Confirm', icon: FaCheck }
]


const COMMUNITY_STEPS = [
  { id: 1, label: 'Profile', icon: FaUser },
  { id: 2, label: 'Interests', icon: FaStar },
  { id: 3, label: 'Security', icon: FaLock },
  { id: 4, label: 'Confirm', icon: FaCheck }
]


export default function SignupPage() {
  const supabase = createClient()
  const [accountType, setAccountType] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)


  const [businessForm, setBusinessForm] = useState({
    name: '', businessName: '', email: '', website: '', phone: '',
    businessType: '', customBusinessType: '', streetAddress: '', city: '', state: '', zipCode: '',
    password: '', confirmPassword: '', isRealBusiness: false,
  })


  const [communityForm, setCommunityForm] = useState({
    name: '', email: '', city: '', zipCode: '',
    password: '', confirmPassword: '', interests: [], agreeToGuidelines: false,
  })


  const [businessErrors, setBusinessErrors] = useState({})
  const [communityErrors, setCommunityErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)


  const router = useRouter()


  const handleAccountTypeSelect = type => {
    setAccountType(type)
    setCurrentStep(1)
    setBusinessErrors({})
    setCommunityErrors({})
    setError(null)
  }


  const handleBusinessInputChange = (field, value) => {
    setBusinessForm(prev => ({ ...prev, [field]: value }))
    if (businessErrors[field]) setBusinessErrors(prev => ({ ...prev, [field]: '' }))
  }


  const handleCommunityInputChange = (field, value) => {
    setCommunityForm(prev => ({ ...prev, [field]: value }))
    if (communityErrors[field]) setCommunityErrors(prev => ({ ...prev, [field]: '' }))
  }


  const handleInterestToggle = interest => {
    setCommunityForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }))
  }


  const validateBusinessStep = (step) => {
    const errors = {}
    if (step === 1) {
      if (!businessForm.name.trim()) errors.name = 'Required'
      if (!businessForm.email.trim() || !isValidEmail(businessForm.email)) errors.email = 'Invalid email'
    } else if (step === 2) {
      if (!businessForm.businessName.trim()) errors.businessName = 'Required'
      if (!businessForm.businessType) errors.businessType = 'Required'
      if (businessForm.businessType === 'Other' && !businessForm.customBusinessType.trim()) errors.customBusinessType = 'Please specify your business type'
      if (!businessForm.phone.trim()) errors.phone = 'Required'
    } else if (step === 3) {
      if (!businessForm.streetAddress.trim()) errors.streetAddress = 'Required'
      if (!businessForm.city.trim()) errors.city = 'Required'
      if (!businessForm.state) errors.state = 'Required'
      if (!businessForm.zipCode.trim()) errors.zipCode = 'Required'
    } else if (step === 4) {
      if (!businessForm.password || businessForm.password.length < 8) errors.password = 'Min 8 chars'
      if (businessForm.password !== businessForm.confirmPassword) errors.confirmPassword = 'Mismatch'
    } else if (step === 5) {
      if (!businessForm.isRealBusiness) errors.isRealBusiness = 'Required'
    }
    return errors
  }


  const validateCommunityStep = (step) => {
    const errors = {}
    if (step === 1) {
      if (!communityForm.name.trim()) errors.name = 'Required'
      if (!communityForm.email.trim() || !isValidEmail(communityForm.email)) errors.email = 'Invalid email'
      if (!communityForm.city.trim()) errors.city = 'Required'
    } else if (step === 2) {
      // Interests are optional
    } else if (step === 3) {
      if (!communityForm.password || communityForm.password.length < 8) errors.password = 'Min 8 chars'
      if (communityForm.password !== communityForm.confirmPassword) errors.confirmPassword = 'Mismatch'
    } else if (step === 4) {
      if (!communityForm.agreeToGuidelines) errors.agreeToGuidelines = 'Required'
    }
    return errors
  }


  const handleNextStep = () => {
    const isBusiness = accountType === 'business'
    const maxSteps = isBusiness ? 5 : 4
    const errors = isBusiness ? validateBusinessStep(currentStep) : validateCommunityStep(currentStep)


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


  const handleBusinessSubmit = async e => {
    e.preventDefault()
    setError(null)


    const errors = validateBusinessStep(5)
    if (Object.keys(errors).length > 0) {
      setBusinessErrors(errors)
      return
    }


    setIsLoading(true)


    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: businessForm.email.trim(),
        password: businessForm.password,
        options: { data: { user_type: 'business', fullname: businessForm.name } },
      })


      if (authError) throw authError
      const userId = authData.user?.id
      if (!userId) throw new Error('No user ID returned')


      const { error: signinError } = await supabase.auth.signInWithPassword({
        email: businessForm.email.trim(), 
        password: businessForm.password,
      })


      if (signinError) throw signinError


      const finalBusinessType = businessForm.businessType === 'Other' ? businessForm.customBusinessType : businessForm.businessType


      const { error: dbError } = await supabase
        .from('businesses')
        .insert([
          {
            owner_id: userId,
            name: businessForm.businessName,
            type: finalBusinessType,
            email: businessForm.email,
            phone: businessForm.phone,
            website: businessForm.website || null,
            address: businessForm.streetAddress,
            city: businessForm.city,
            state: businessForm.state,
            zip: businessForm.zipCode,
            photos: [],
            rating: 0,
            review_count: 0,
            description: '',
            hours: { monday: "9-5", tuesday: "9-5", wednesday: "9-5", thursday: "9-5", friday: "9-5", saturday: "Closed", sunday: "Closed" }
          }
        ])


      if (dbError) throw new Error('Account created, but failed to save business profile.')


      router.push('/business/profile')
    } catch (err) {
      setError(err.message || 'An error occurred.')
      setIsLoading(false)
    }
  }


  const handleCommunitySubmit = async e => {
    e.preventDefault()
    setError(null)


    const errors = validateCommunityStep(4)
    if (Object.keys(errors).length > 0) {
      setCommunityErrors(errors)
      return
    }


    setIsLoading(true)


    try {
      const { error: authError } = await supabase.auth.signUp({
        email: communityForm.email.trim(),
        password: communityForm.password,
        options: { data: { user_type: 'community', fullname: communityForm.name, city: communityForm.city, zip: communityForm.zipCode, interests: communityForm.interests } },
      })


      if (authError) throw authError


      const { error: signinError } = await supabase.auth.signInWithPassword({
        email: communityForm.email.trim(), password: communityForm.password,
      })


      if (signinError) throw signinError


      router.push('/user/dashboard')
    } catch (err) {
      setError(err.message || 'An error occurred.')
      setIsLoading(false)
    }
  }


  const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)


  const getPasswordStrength = password => {
    if (!password) return { level: 0, percentage: 0, color: '#333' }
    if (password.length < 6) return { level: 1, percentage: 33, color: '#ef4444' }
    if (password.length < 10) return { level: 2, percentage: 66, color: '#f97316' }
    return { level: 3, percentage: 100, color: '#10b981' }
  }


  return (
    <main className="min-h-screen relative flex flex-col bg-gray-50 dark:bg-[#050505] transition-colors duration-300 font-sans selection:bg-orange-500 selection:text-white">
      <GridBackground />
      <SignupNavbar />


      <div className="flex-1 flex items-center justify-center px-4 py-24 relative z-10">
        <AnimatePresence mode="wait">
          {!accountType ? (
            <div className="w-full" key="selection">
              <AccountTypeSelection onSelect={handleAccountTypeSelect} />
            </div>
          ) : (
            <div className="w-full max-w-2xl" key="form">
              <StepFormContainer accountType={accountType} currentStep={currentStep} onBack={() => setAccountType(null)} error={error}>
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
    </main>
  )
}


const AccountTypeSelection = ({ onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="text-center w-full"
  >
    <h1 className={`text-5xl md:text-6xl font-black ${TEXT_MAIN} mb-6 tracking-tight`}>
      Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Vicinity</span>
    </h1>
    <p className={`text-lg ${TEXT_MUTED} mb-12`}>Connect with your city. Choose your path below.</p>
    <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
      <AccountCard
        icon={FaStore} title="Business Owner" subtitle="Grow your presence"
        features={['Manage reviews', 'Track analytics', 'Connect with locals']}
        onClick={() => onSelect('business')} gradient="from-orange-500 to-pink-500"
      />
      <AccountCard
        icon={FaUser} title="Community Member" subtitle="Discover & Support"
        features={['Find hidden gems', 'Write reviews', 'Build your profile']}
        onClick={() => onSelect('community')} gradient="from-indigo-500 to-purple-600"
      />
    </div>
  </motion.div>
)


const AccountCard = ({ icon: Icon, title, subtitle, features, onClick, gradient }) => (
  <motion.button
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="group text-left w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-3xl p-12 relative overflow-hidden hover:border-orange-500/30 dark:hover:border-white/20 transition-all shadow-lg hover:shadow-xl"
  >
    <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-15 blur-3xl transition-opacity duration-500 rounded-full`} />
    <div className="relative z-10">
      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-3xl mb-8 shadow-lg`}>
        <Icon />
      </div>
      <h3 className={`text-3xl font-bold ${TEXT_MAIN} mb-3`}>{title}</h3>
      <p className={`${TEXT_MUTED} text-base mb-8`}>{subtitle}</p>
      <div className="space-y-4 mb-10">
        {features.map((f, i) => (
          <div key={i} className={`flex items-center gap-3 text-base ${TEXT_MUTED} group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors`}>
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
            {f}
          </div>
        ))}
      </div>
      <div className={`flex items-center gap-2 ${TEXT_MAIN} font-bold text-base`}>Get Started <FaArrowRight className="group-hover:translate-x-1 transition-transform" /></div>
    </div>
  </motion.button>
)


const StepFormContainer = ({ accountType, currentStep, onBack, error, children }) => {
  const isBusiness = accountType === 'business'
  const steps = isBusiness ? BUSINESS_STEPS : COMMUNITY_STEPS
  const gradient = isBusiness ? 'from-orange-500 to-pink-500' : 'from-indigo-500 to-purple-600'


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <button onClick={onBack} className={`flex items-center gap-2 ${TEXT_MUTED} hover:text-orange-500 dark:hover:text-white mb-8 transition-colors text-sm font-medium`}>
        <FaArrowLeft /> Back to selection
      </button>


      {/* Step Indicator */}
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
                  className={`flex items-center gap-2 mb-2`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isComplete ? `bg-gradient-to-r ${gradient} text-white` :
                    isActive ? `bg-gradient-to-r ${gradient} text-white ring-2 ring-orange-500/20` :
                    'bg-gray-200 dark:bg-white/10 text-gray-400'
                  }`}>
                    {isComplete ? <FaCheck size={14} /> : <StepIcon size={14} />}
                  </div>
                  <span className={`hidden md:block text-xs font-medium transition-colors ${
                    isActive ? 'text-gray-900 dark:text-white' : isComplete ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </motion.div>
                {idx < steps.length && (
                  <div className={`h-1 transition-all ${isComplete ? `bg-gradient-to-r ${gradient}` : 'bg-gray-200 dark:bg-white/10'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>


      <div className={GLASS_CARD}>
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`} />
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${gradient} opacity-10 blur-3xl rounded-full animate-pulse`} />


        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-300 text-sm flex items-center gap-3">
            <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
            {error}
          </div>
        )}


        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  )
}


const BusinessStepForm = ({ step, form, onInputChange, errors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, getPasswordStrength, onNext, onPrev, onSubmit, isLoading }) => {
  const strength = getPasswordStrength(form.password)


  return (
    <form onSubmit={step === 5 ? onSubmit : (e) => { e.preventDefault(); onNext() }} className="space-y-6">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        {step === 1 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Tell us about yourself</h3>
            <Input label="Your Full Name" required value={form.name} onChange={e => onInputChange('name', e.target.value)} error={errors.name} icon={FaUser} />
            <Input label="Email Address" type="email" required value={form.email} onChange={e => onInputChange('email', e.target.value)} error={errors.email} icon={FaEnvelope} />
          </div>
        )}


        {step === 2 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Business Details</h3>
            <Input label="Business Name" required value={form.businessName} onChange={e => onInputChange('businessName', e.target.value)} error={errors.businessName} icon={FaBuilding} />
            <Select label="Business Type" required value={form.businessType} onChange={e => onInputChange('businessType', e.target.value)} error={errors.businessType} options={BUSINESS_TYPES} />
            
            {form.businessType === 'Other' && (
              <Input 
                label="Specify Your Business Type" 
                required 
                value={form.customBusinessType} 
                onChange={e => onInputChange('customBusinessType', e.target.value)} 
                error={errors.customBusinessType} 
                placeholder="e.g., Art Gallery, Bookkeeping, etc."
                icon={FaPlus}
              />
            )}
            
            <Input label="Phone Number" type="tel" required value={form.phone} onChange={e => onInputChange('phone', e.target.value)} error={errors.phone} icon={FaPhone} />
            <Input label="Website" value={form.website} onChange={e => onInputChange('website', e.target.value)} error={errors.website} placeholder="Optional" icon={FaGlobe} />
          </div>
        )}


        {step === 3 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Business Location</h3>
            <Input label="Street Address" required value={form.streetAddress} onChange={e => onInputChange('streetAddress', e.target.value)} error={errors.streetAddress} icon={FaMapPin} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" required value={form.city} onChange={e => onInputChange('city', e.target.value)} error={errors.city} />
              <Input label="ZIP Code" required value={form.zipCode} onChange={e => onInputChange('zipCode', e.target.value)} error={errors.zipCode} />
            </div>
            <Select label="State" required value={form.state} onChange={e => onInputChange('state', e.target.value)} error={errors.state} options={US_STATES} />
          </div>
        )}


        {step === 4 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Create Password</h3>
            <div className="space-y-1.5">
              <label className={LABEL_STYLE}>
                Password <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => onInputChange('password', e.target.value)}
                  className={`${INPUT_STYLE} pl-11`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {form.password && <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${getPasswordStrength(form.password).percentage}%`, backgroundColor: getPasswordStrength(form.password).color }} /></div>}
              {errors.password && <p className="text-xs text-red-500 dark:text-red-400">{errors.password}</p>}
            </div>


            <div className="space-y-1.5">
              <label className={LABEL_STYLE}>
                Confirm Password <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => onInputChange('confirmPassword', e.target.value)}
                  className={`${INPUT_STYLE} pl-11`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                  {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 dark:text-red-400">{errors.confirmPassword}</p>}
            </div>
          </div>
        )}


        {step === 5 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Final Confirmation</h3>
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300"><span className={`font-semibold ${TEXT_MAIN}`}>Name:</span> {form.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300"><span className={`font-semibold ${TEXT_MAIN}`}>Business:</span> {form.businessName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300"><span className={`font-semibold ${TEXT_MAIN}`}>Type:</span> {form.businessType === 'Other' ? form.customBusinessType : form.businessType}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300"><span className={`font-semibold ${TEXT_MAIN}`}>Email:</span> {form.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300"><span className={`font-semibold ${TEXT_MAIN}`}>Location:</span> {form.city}, {form.state} {form.zipCode}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 pt-2">
              <div onClick={() => onInputChange('isRealBusiness', !form.isRealBusiness)} className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${form.isRealBusiness ? 'bg-orange-500 border-orange-500' : 'border-gray-300 dark:border-white/30 bg-transparent hover:border-gray-400 dark:hover:border-white/50'}`}>
                {form.isRealBusiness && <FaCheck className="text-white text-[10px]" />}
              </div>
              <span className={`text-xs ${TEXT_MUTED} pt-0.5`}>I confirm this is a real business and agree to Vicinity's terms.</span>
            </div>
            {errors.isRealBusiness && <p className="text-xs text-red-500 dark:text-red-400">{errors.isRealBusiness}</p>}
          </div>
        )}
      </motion.div>


      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-8 pt-6">
        {step > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <FaArrowLeft size={14} /> Back
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${step === 1 ? 'col-span-2' : ''}`}
        >
          {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>{step === 5 ? 'Create Account' : 'Next'} {step !== 5 && <FaArrowRight size={14} />}</>}
        </button>
      </div>
    </form>
  )
}


const CommunityStepForm = ({ step, form, onInputChange, onInterestToggle, errors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, getPasswordStrength, onNext, onPrev, onSubmit, isLoading }) => {
  const strength = getPasswordStrength(form.password)


  return (
    <form onSubmit={step === 4 ? onSubmit : (e) => { e.preventDefault(); onNext() }} className="space-y-6">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        {step === 1 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Create Your Profile</h3>
            <Input label="Full Name" required value={form.name} onChange={e => onInputChange('name', e.target.value)} error={errors.name} icon={FaUser} />
            <Input label="Email Address" type="email" required value={form.email} onChange={e => onInputChange('email', e.target.value)} error={errors.email} icon={FaEnvelope} />
            <Input label="City" required value={form.city} onChange={e => onInputChange('city', e.target.value)} error={errors.city} icon={FaMapPin} />
            <Input label="ZIP Code (Optional)" value={form.zipCode} onChange={e => onInputChange('zipCode', e.target.value)} error={errors.zipCode} placeholder="Optional" />
          </div>
        )}


        {step === 2 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>What interests you?</h3>
            <p className={`text-sm ${TEXT_MUTED} mb-4`}>Help us personalize your experience</p>
            <div className="grid grid-cols-1 gap-3">
              {INTEREST_OPTIONS.map(interest => (
                <div
                  key={interest}
                  onClick={() => onInterestToggle(interest)}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    form.interests.includes(interest)
                      ? 'bg-orange-50 dark:bg-orange-500/20 border-orange-500 text-orange-700 dark:text-white shadow-md'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${form.interests.includes(interest) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 dark:border-white/30 bg-transparent'}`}>
                    {form.interests.includes(interest) && <FaCheck className="text-white text-[10px]" />}
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
                Password <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => onInputChange('password', e.target.value)}
                  className={`${INPUT_STYLE} pl-11`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {form.password && <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${getPasswordStrength(form.password).percentage}%`, backgroundColor: getPasswordStrength(form.password).color }} /></div>}
              {errors.password && <p className="text-xs text-red-500 dark:text-red-400">{errors.password}</p>}
            </div>


            <div className="space-y-1.5">
              <label className={LABEL_STYLE}>
                Confirm Password <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => onInputChange('confirmPassword', e.target.value)}
                  className={`${INPUT_STYLE} pl-11`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                  {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 dark:text-red-400">{errors.confirmPassword}</p>}
            </div>
          </div>
        )}


        {step === 4 && (
          <div className="space-y-5">
            <h3 className={`text-xl font-bold ${TEXT_MAIN} mb-6`}>Review & Confirm</h3>
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-6 space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300"><span className={`font-semibold ${TEXT_MAIN}`}>Name:</span> {form.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300"><span className={`font-semibold ${TEXT_MAIN}`}>Email:</span> {form.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300"><span className={`font-semibold ${TEXT_MAIN}`}>City:</span> {form.city}</p>
                {form.interests.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-300"><span className={`font-semibold ${TEXT_MAIN}`}>Interests:</span> {form.interests.join(', ')}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3 pt-2">
              <div onClick={() => onInputChange('agreeToGuidelines', !form.agreeToGuidelines)} className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${form.agreeToGuidelines ? 'bg-orange-500 border-orange-500' : 'border-gray-300 dark:border-white/30 bg-transparent hover:border-gray-400 dark:hover:border-white/50'}`}>
                {form.agreeToGuidelines && <FaCheck className="text-white text-[10px]" />}
              </div>
              <span className={`text-xs ${TEXT_MUTED} pt-0.5`}>I agree to the Community Guidelines.</span>
            </div>
            {errors.agreeToGuidelines && <p className="text-xs text-red-500 dark:text-red-400">{errors.agreeToGuidelines}</p>}
          </div>
        )}
      </motion.div>


      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-8 pt-6">
        {step > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <FaArrowLeft size={14} /> Back
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${step === 1 ? 'col-span-2' : ''}`}
        >
          {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>{step === 4 ? 'Join Community' : 'Next'} {step !== 4 && <FaArrowRight size={14} />}</>}
        </button>
      </div>
    </form>
  )
}


const Input = ({ label, required, error, icon: Icon, ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className={LABEL_STYLE}>
          {label} {required && <span className="text-orange-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />}
        <input 
          className={`${INPUT_STYLE} ${Icon ? 'pl-11' : 'px-4'} ${error ? 'border-red-500/50 focus:border-red-500/50 focus:bg-red-50 dark:focus:bg-red-950/10' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}


const Select = ({ label, required, error, options, placeholder = "Select...", ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className={LABEL_STYLE}>
          {label} {required && <span className="text-orange-500">*</span>}
        </label>
      )}
      <select 
        className={`${INPUT_STYLE} px-4 appearance-none ${error ? 'border-red-500/50' : ''}`}
        {...props}
      >
        <option value="" className="bg-white dark:bg-[#111]">{placeholder}</option>
        {options.map(o => <option key={o} value={o} className="bg-white dark:bg-[#111]">{o}</option>)}
      </select>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}