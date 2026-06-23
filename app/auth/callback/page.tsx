'use client'


// Handles the post-authentication redirect after login or signup.
// Routes users to the business or community dashboard based on their account type.

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'

// Post-login redirect handler that routes by user type
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
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )
}
