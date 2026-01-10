'use client'


import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'


const AuthContext = createContext()


export function AuthProvider({ children }) {
  const supabase = createClient()
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  useEffect(() => {
    console.log('🔐 Setting up Supabase auth state listener...')
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📡 Initial session:', session?.user?.id || 'no session')
      setSession(session)
      if (session?.user) {
        setUser(session.user)
        fetchUserData(session.user)
      } else {
        setLoading(false)
      }
    })


    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.id || 'no user')
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
      console.log('🔐 Cleaning up Supabase auth state listener...')
      subscription.unsubscribe()
    }
  }, [])


  const fetchUserData = async (authUser) => {
    try {
      console.log('📡 Processing auth user data for:', authUser.id)
      
      const user = authUser
      
      if (!user) {
        console.log('❌ No user provided')
        setUserData(null)
        setUserType(null)
        setLoading(false)
        return
      }


      console.log('✅ Auth user:', {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      })


      // Get user_type from auth metadata first
      const typeFromAuth = user.user_metadata?.user_type || 'user'
      setUserType(typeFromAuth)
      console.log('✅ User type:', typeFromAuth)


      setUserData({
        id: user.id,
        email: user.email,
        user_type: typeFromAuth,
        fullname: user.user_metadata?.fullname || user.email.split('@')[0],
        city: user.user_metadata?.city || null,
      })


      setError(null)
    } catch (err) {
      console.error('❌ Exception in fetchUserData:', err)
      setError(err)
      setUserData(null)
      setUserType(null)
    } finally {
      setLoading(false)
    }
  }


 const signInWithGoogle = async () => {
  try {
    console.log('🔐 Starting Google OAuth sign-in...')
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    })
    
    if (error) {
      console.error('❌ Google Sign-In Error:', error)
      setError(error)
      return
    }
    
    console.log('✅ Google OAuth initiated')
  } catch (err) {
    console.error('❌ Google OAuth Error:', err)
    setError(err)
  }
}


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


  const value = {
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
        <div className="w-12 h-12 border-4 border-[#E74C3C]/20 border-t-[#E74C3C] rounded-full animate-spin" />
      </div>
    )
  }


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
