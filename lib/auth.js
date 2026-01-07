import { createClient } from './supabase'

const supabase = createClient()

// ==========================================
// AUTH HELPERS - Authentication Utility Functions
// ==========================================

// === SIGN UP ===
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return { user: data.user, session: data.session }
  } catch (error) {
    console.error('Sign up error:', error.message)
    throw error
  }
}

// === SIGN IN ===
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return { user: data.user, session: data.session }
  } catch (error) {
    console.error('Sign in error:', error.message)
    throw error
  }
}

// === SIGN OUT ===
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Sign out error:', error.message)
    throw error
  }
}

// === GET CURRENT USER ===
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  } catch (error) {
    console.error('Get current user error:', error.message)
    return null
  }
}

// === GET SESSION ===
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  } catch (error) {
    console.error('Get session error:', error.message)
    return null
  }
}

// === RESET PASSWORD ===
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password`,
    })
    if (error) throw error
  } catch (error) {
    console.error('Reset password error:', error.message)
    throw error
  }
}

// === UPDATE PASSWORD ===
export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  } catch (error) {
    console.error('Update password error:', error.message)
    throw error
  }
}
