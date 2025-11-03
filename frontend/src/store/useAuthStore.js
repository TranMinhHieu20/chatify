import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import { toast } from 'sonner'
export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check')
      set({ authUser: res.data })
    } catch (error) {
      console.log('Error is checkAuth', error)
      set({ authUser: null })
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true })
    try {
      const res = await axiosInstance.post('/auth/signup', data)
      set({ authUser: res.data })
      // toast
      toast.success('Account created successfully!')
    } catch (error) {
      toast.error(error.response.data.message)
      console.log('Error Signup In', error)
    } finally {
      set({ isSigningUp: false })
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true })
    try {
      const res = await axiosInstance.post('/auth/login', data)
      set({ authUser: res.data })
      // toast
      toast.success('Account logged successfully!')
    } catch (error) {
      toast.error(error.response.data.message)
      console.log('Error Logging In', error)
    } finally {
      set({ isLoggingIn: false })
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
      set({ authUser: null })
      toast.success('Account logout successfully!')
    } catch (error) {
      toast.error(error.response.data.message)
      console.log('Error logout ', error)
    }
  }
}))
