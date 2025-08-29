import { create } from 'zustand'
import { authAPI, usersAPI } from '../lib/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  // Initialize auth state from localStorage
  initialize: () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        set({ user })
        // Verify token is still valid
        get().verifyToken()
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  },

  // Verify token validity
  verifyToken: async () => {
    try {
      const response = await authAPI.getProfile()
      set({ user: response.data })
    } catch (error) {
      get().logout()
    }
  },

  // Login
  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.login(credentials)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      set({ user, isLoading: false })
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      set({ error: errorMessage, isLoading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Register
  register: async (userData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.register(userData)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      set({ user, isLoading: false })
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      set({ error: errorMessage, isLoading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, error: null })
  },

  // Update user profile
  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await usersAPI.updateProfile(profileData)
      const updatedUser = response.data
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      set({ user: updatedUser, isLoading: false })
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Profile update failed'
      set({ error: errorMessage, isLoading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}))

// Initialize auth state when store is created
useAuthStore.getState().initialize()
