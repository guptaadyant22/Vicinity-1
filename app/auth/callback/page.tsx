// Handles post-login redirect after authentication
// Routes users to business dashboard or community dashboard based on account type

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'

export default function AuthCallback() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      const userType = user.user_metadata?.user_type || 'community'
      
      if (userType === 'business') {
        router.push('/business/dashboard')
      } else {
        router.push('/user/dashboard')
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )
}
