import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.login(credentials)
          const { user, token } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          // Set token for future requests
          localStorage.setItem('token', token)
          
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.register(userData)
          const { user, token } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          localStorage.setItem('token', token)
          
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.updateProfile(profileData)
          const updatedUser = response.data
          
          set({
            user: updatedUser,
            isLoading: false,
          })
          
          return { success: true, user: updatedUser }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      changePassword: async (passwordData) => {
        set({ isLoading: true })
        try {
          await authAPI.changePassword(passwordData)
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true })
        try {
          await authAPI.forgotPassword({ email })
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ isLoading: true })
        try {
          await authAPI.resetPassword({ token, newPassword })
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      initializeAuth: () => {
        const token = localStorage.getItem('token')
        if (token) {
          // Verify token is still valid
          authAPI.getProfile()
            .then(response => {
              set({
                user: response.data,
                token,
                isAuthenticated: true,
              })
            })
            .catch(() => {
              // Token is invalid, clear it
              localStorage.removeItem('token')
              set({
                user: null,
                token: null,
                isAuthenticated: false,
              })
            })
        }
      },

      // Helper methods
      isAdmin: () => {
        const { user } = get()
        return user?.role === 'ADMIN'
      },

      hasRole: (role) => {
        const { user } = get()
        return user?.role === role
      },
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