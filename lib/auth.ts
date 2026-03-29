import { createClient } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

const supabase = createClient()

// ==========================================
// AUTH HELPERS - Authentication Utility Functions
// ==========================================

// === SIGN UP ===
export const signUp = async (email: string, password: string): Promise<{ user: User | null; session: Session | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return { user: data.user, session: data.session }
  } catch (error) {
    console.error('Sign up error:', (error as Error).message)
    throw error
  }
}

// === SIGN IN ===
export const signIn = async (email: string, password: string): Promise<{ user: User | null; session: Session | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return { user: data.user, session: data.session }
  } catch (error) {
    console.error('Sign in error:', (error as Error).message)
    throw error
  }
}

// === SIGN OUT ===
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Sign out error:', (error as Error).message)
    throw error
  }
}

// === GET CURRENT USER ===
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  } catch (error) {
    console.error('Get current user error:', (error as Error).message)
    return null
  }
}

// === GET SESSION ===
export const getSession = async (): Promise<Session | null> => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  } catch (error) {
    console.error('Get session error:', (error as Error).message)
    return null
  }
}

// === RESET PASSWORD ===
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password`,
    })
    if (error) throw error
  } catch (error) {
    console.error('Reset password error:', (error as Error).message)
    throw error
  }
}

// === UPDATE PASSWORD ===
export const updatePassword = async (newPassword: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  } catch (error) {
    console.error('Update password error:', (error as Error).message)
    throw error
  }
}
