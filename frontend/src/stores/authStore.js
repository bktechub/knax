import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', credentials)
          const { token, user } = response.data
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          
          return { success: true, user }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          })
          return { success: false, error: errorMessage }
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/register', userData)
          const { token, user } = response.data
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          
          return { success: true, user }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Registration failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          })
          return { success: false, error: errorMessage }
        }
      },

      // Logout action
      logout: () => {
        // Remove token from API headers
        delete api.defaults.headers.common['Authorization']
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },

      // Update user profile
      updateProfile: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.patch('/auth/profile', userData)
          const updatedUser = response.data
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          })
          
          return { success: true, user: updatedUser }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Profile update failed'
          set({
            error: errorMessage,
            isLoading: false,
          })
          return { success: false, error: errorMessage }
        }
      },

      // Change password
      changePassword: async (passwordData) => {
        set({ isLoading: true, error: null })
        try {
          await api.patch('/auth/change-password', passwordData)
          
          set({
            isLoading: false,
            error: null,
          })
          
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Password change failed'
          set({
            error: errorMessage,
            isLoading: false,
          })
          return { success: false, error: errorMessage }
        }
      },

      // Forgot password
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null })
        try {
          await api.post('/auth/forgot-password', { email })
          
          set({
            isLoading: false,
            error: null,
          })
          
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to send reset email'
          set({
            error: errorMessage,
            isLoading: false,
          })
          return { success: false, error: errorMessage }
        }
      },

      // Reset password
      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null })
        try {
          await api.post('/auth/reset-password', { token, newPassword })
          
          set({
            isLoading: false,
            error: null,
          })
          
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Password reset failed'
          set({
            error: errorMessage,
            isLoading: false,
          })
          return { success: false, error: errorMessage }
        }
      },

      // Initialize auth state (check if user is already logged in)
      initializeAuth: () => {
        const state = get()
        if (state.token && state.user) {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
          set({ isAuthenticated: true })
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialize auth on app start
useAuthStore.getState().initializeAuth()