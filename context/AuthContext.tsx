// Provides global authentication state (session, user, userType) via React context.
// Listens to Supabase auth events and exposes login, logout, and Google OAuth helpers.

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '../lib/supabase'
import type { Session, User, AuthError } from '@supabase/supabase-js'

interface UserData {
  id: string
  email: string
  user_type: string
  fullname: string
  city: string | null
}

interface AuthContextType {
  session: Session | null
  user: User | null
  userData: UserData | null
  userType: string | null
  loading: boolean
  error: AuthError | Error | null
  logout: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  supabase: ReturnType<typeof createClient>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provides auth state and methods to all child components
export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | Error | null>(null)

  // Subscribe to auth state changes on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        setUser(session.user)
        fetchUserData(session.user)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await fetchUserData(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserData(null)
        setUserType(null)
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
        await fetchUserData(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Extract user type and profile data from auth metadata
  const fetchUserData = async (authUser: User) => {
    try {
      const user = authUser
      
      if (!user) {
        setUserData(null)
        setUserType(null)
        setLoading(false)
        return
      }

      const typeFromAuth = (user.user_metadata?.user_type as string) || 'user'
      setUserType(typeFromAuth)

      setUserData({
        id: user.id,
        email: user.email!,
        user_type: typeFromAuth,
        fullname: (user.user_metadata?.fullname as string) || user.email!.split('@')[0],
        city: (user.user_metadata?.city as string) || null,
      })

      setError(null)
    } catch (err) {
      console.error('Exception in fetchUserData:', err)
      setError(err as Error)
      setUserData(null)
      setUserType(null)
    } finally {
      setLoading(false)
    }
  }

  // Initiate Google OAuth flow
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      })
      
      if (error) {
        console.error('Google Sign-In Error:', error)
        setError(error)
        return
      }
    } catch (err) {
      console.error('Google OAuth Error:', err)
      setError(err as AuthError)
    }
  }

  // Clear all auth state and redirect to home
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      setUserData(null)
      setUserType(null)
      setLoading(false)
      window.location.href = '/' 
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const value: AuthContextType = {
    session,
    user,
    userData,
    userType,
    loading,
    error,
    logout,
    signInWithGoogle,
    supabase,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to access auth context — must be used inside AuthProvider
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
