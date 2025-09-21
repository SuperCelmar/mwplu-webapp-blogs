// src/stores/auth.js
/**
 * Authentication Store
 * @module authStore
 * @description This module defines the authentication store using Pinia.
 * It manages user authentication state, including login, signup, logout, and session management.
 * It integrates with Supabase for authentication and provides methods to handle user sessions.
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-02): Initial version with basic authentication functionality.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, dbService, isSupabaseConfigured } from '@/services/supabase'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const session = ref(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!session.value)
  const userEmail = computed(() => user.value?.email || '')
  const userName = computed(
    () => user.value?.user_metadata?.name || user.value?.user_metadata?.full_name || '',
  )
  const userId = computed(() => user.value?.id || null)

  // Actions
  const setUser = (userData) => {
    user.value = userData
  }

  const setSession = (sessionData) => {
    session.value = sessionData
  }

  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setLoading(true)

      if (!isSupabaseConfigured) {
        // In dev without Supabase, mark initialized and stop loading
        isInitialized.value = true
        setLoading(false)
        return
      }

      // Get current session from Supabase
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting session:', error)
        throw error
      }

      if (session) {
        setSession(session)
        setUser(session.user)
        try {
          await dbService.ensureUserProfile(session.user)
        } catch (e) {
          console.warn('ensureUserProfile on init failed:', e)
        }
      }

      isInitialized.value = true
    } catch (error) {
      console.error('Auth initialization error:', error)
      setError('Failed to initialize authentication')
    } finally {
      setLoading(false)
    }
  }

  // Login function - Pure Supabase
  const login = async (email, password) => {
    try {
      setLoading(true)
      clearError()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      setSession(data.session)
      setUser(data.user)

      return { success: true, user: data.user }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Signup function - with identities array checking for already existing user
  const signup = async (email, password, name, captchaToken, phone) => {
    try {
      setLoading(true)
      clearError()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name,
            ...(phone ? { phone } : {}),
          },
          captchaToken: captchaToken,
        },
      })

      // First check for any signup errors
      if (error) {
        console.error('Supabase signup error:', error)
        throw error
      }

      // Log the complete response structure for debugging
      console.log('Supabase signup response:', {
        user: data.user,
        session: data.session,
        identities: data.user?.identities,
        identitiesLength: data.user?.identities?.length,
        userEmail: data.user?.email,
        confirmationSentAt: data.user?.confirmation_sent_at,
      })

      // Check if user exists by examining identities array
      if (data.user && data.user.identities !== undefined) {
        if (data.user.identities.length === 0) {
          console.log('Existing user detected - identities array is empty')
          console.log('User details:', {
            email: data.user.email,
            created_at: data.user.created_at,
            confirmation_sent_at: data.user.confirmation_sent_at,
            identities: data.user.identities,
          })

          return {
            success: false,
            error: 'EMAIL_ALREADY_EXISTS',
            isExistingUser: true,
            message:
              'Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.',
          }
        } else {
          console.log(
            'New user signup detected - identities array populated:',
            data.user.identities.length,
          )
        }
      } else {
        console.warn('Identities array is undefined - this may indicate an API change or error')
      }

      // Check if email confirmation is required (normal flow for new users)
      if (data.user && !data.session) {
        return {
          success: true,
          message: 'Please check your email for a confirmation link',
          needsConfirmation: true,
        }
      }

      // If auto-confirmed, set the session
      if (data.session) {
        setSession(data.session)
        setUser(data.user)
      }

      return { success: true, user: data.user }
    } catch (error) {
      console.error('Signup error:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setLoading(true)

      const { error } = await supabase.auth.signOut()

      if (error) throw error

      // Clear state
      setUser(null)
      setSession(null)
      clearError()

      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      setError('Logout failed')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true)
      clearError()

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      }
    } catch (error) {
      console.error('Password reset error:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true)
      clearError()

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      return { success: true, message: 'Password updated successfully' }
    } catch (error) {
      console.error('Password update error:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Update profile
  const updateProfile = async (updates) => {
    try {
      setLoading(true)
      clearError()

      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      })

      if (error) throw error

      setUser(data.user)
      return { success: true, message: 'Profile updated successfully' }
    } catch (error) {
      console.error('Profile update error:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Resend confirmation email
  const resendConfirmation = async (email) => {
    try {
      setLoading(true)
      clearError()

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      return {
        success: true,
        message: 'Confirmation email resent. Please check your inbox.',
      }
    } catch (error) {
      console.error('Resend confirmation error:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      clearError()

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Google sign-in error:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Google Sign Up
  const signUpWithGoogle = async () => {
    try {
      setLoading(true)
      clearError()

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Google sign-up error:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Listen to auth changes
  const setupAuthListener = () => {
    if (!isSupabaseConfigured) return
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)

      switch (event) {
        case 'SIGNED_IN':
          if (session) {
            setSession(session)
            setUser(session.user)
            clearError()
            // Ensure a public.profiles row exists for this user
            dbService
              .ensureUserProfile(session.user)
              .catch((e) => console.warn('ensureUserProfile on sign-in failed:', e))
          }
          break
        case 'SIGNED_OUT':
          setSession(null)
          setUser(null)
          clearError()
          break
        case 'TOKEN_REFRESHED':
          if (session) {
            setSession(session)
            setUser(session.user)
            dbService
              .ensureUserProfile(session.user)
              .catch((e) => console.warn('ensureUserProfile on token refresh failed:', e))
          }
          break
        case 'USER_UPDATED':
          if (session) {
            setUser(session.user)
            dbService
              .ensureUserProfile(session.user)
              .catch((e) => console.warn('ensureUserProfile on user update failed:', e))
          }
          break
      }
    })
  }

  // Helper function to format error messages
  const getErrorMessage = (error) => {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password'
      case 'Email not confirmed':
        return 'Please confirm your email address before signing in'
      case 'User already registered':
        return 'An account with this email already exists'
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long'
      case 'Unable to validate email address: invalid format':
        return 'Please enter a valid email address'
      case 'Signup is disabled':
        return 'Account registration is currently disabled'
      default:
        return error.message || 'An unexpected error occurred'
    }
  }

  return {
    // State
    user,
    session,
    isLoading,
    isInitialized,
    error,

    // Getters
    isAuthenticated,
    userEmail,
    userName,
    userId,

    // Actions
    initializeAuth,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    resendConfirmation,
    signInWithGoogle,
    signUpWithGoogle,
    setupAuthListener,
    setError,
    clearError,
  }
})
