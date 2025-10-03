import { create } from 'zustand'
import useFirebaseAuth from '../hooks/useFirebaseAuth'

// Firebase-based auth store that wraps the Firebase auth hook
let firebaseAuthInstance = null

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  firebaseAuth: null,

  // Initialize Firebase auth
  initialize: () => {
    // This will be called by the component that uses the store
    // The actual Firebase auth state is managed by the useFirebaseAuth hook
  },

  // Set Firebase auth instance
  setFirebaseAuth: (authInstance) => {
    firebaseAuthInstance = authInstance
    set({ 
      user: authInstance.user,
      profile: authInstance.profile,
      isLoading: authInstance.loading,
      error: authInstance.error,
      firebaseAuth: authInstance
    })
  },

  // Login using Firebase
  login: async (credentials) => {
    if (firebaseAuthInstance) {
      return await firebaseAuthInstance.login(credentials.email, credentials.password)
    }
    return { success: false, error: 'Firebase auth not initialized' }
  },

  // Register using Firebase
  register: async (userData) => {
    if (firebaseAuthInstance) {
      const { first_name, last_name, email, password, ...rest } = userData
      return await firebaseAuthInstance.register(email, password, {
        firstName: first_name,
        lastName: last_name,
        ...rest
      })
    }
    return { success: false, error: 'Firebase auth not initialized' }
  },

  // Login with Google
  loginWithGoogle: async () => {
    if (firebaseAuthInstance) {
      return await firebaseAuthInstance.loginWithGoogle()
    }
    return { success: false, error: 'Firebase auth not initialized' }
  },

  // Logout using Firebase
  logout: async () => {
    if (firebaseAuthInstance) {
      return await firebaseAuthInstance.logout()
    }
    set({ user: null, profile: null, error: null })
    return { success: true }
  },

  // Reset password using Firebase
  resetPassword: async (email) => {
    if (firebaseAuthInstance) {
      return await firebaseAuthInstance.resetPassword(email)
    }
    return { success: false, error: 'Firebase auth not initialized' }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    if (firebaseAuthInstance) {
      return await firebaseAuthInstance.updateUserProfile(profileData)
    }
    return { success: false, error: 'Firebase auth not initialized' }
  },

  // Complete registration
  completeRegistration: async (userData) => {
    if (firebaseAuthInstance) {
      return await firebaseAuthInstance.completeRegistration(userData)
    }
    return { success: false, error: 'Firebase auth not initialized' }
  },

  // Clear error
  clearError: () => set({ error: null }),
}))


