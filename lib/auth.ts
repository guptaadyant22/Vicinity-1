// Authentication helper functions wrapping Supabase auth operations.
// Provides sign-up, sign-in, sign-out, session retrieval, and password management utilities.

import { createClient } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

const supabase = createClient()

// Register a new user with email and password
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

// Authenticate an existing user with email and password
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

// Sign out the current user
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Sign out error:', (error as Error).message)
    throw error
  }
}

// Retrieve the currently authenticated user
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

// Retrieve the active session
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

// Send a password-reset email to the given address
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

// Update the current user's password
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
