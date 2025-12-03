import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import { toast } from 'sonner'
import io from 'socket.io-client'
import { generateKeyPair } from '../lib/crypto'

const base_URL = import.meta.env.MODE === 'development' ? 'http://localhost:3000' : '/'

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],
  privateKey: null, // Lưu private key locally

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check')
      set({ authUser: res.data })

      const privateKey = localStorage.getItem('privateKey')
      if (privateKey) {
        set({ privateKey })
      }
      get().connectSocket()
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

      const { privateKey, publicKey } = await generateKeyPair()
      await axiosInstance.post('/auth/upload-public-key', { publicKey })

      localStorage.setItem('privateKey', privateKey) // Lưu private key
      set({ privateKey })
      toast.success('Account created successfully!')
      get().connectSocket()
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

      const privateKey = localStorage.getItem('privateKey')
      if (privateKey) {
        set({ privateKey })
      }
      toast.success('Account logged successfully!')
      get().connectSocket()
    } catch (error) {
      console.log('Error Logging In', error)
      toast.error(error.response.data.message)
    } finally {
      set({ isLoggingIn: false })
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
      set({ authUser: null })
      toast.success('Account logout successfully!')
      get().disconnectSocket()
    } catch (error) {
      toast.error(error.response.data.message)
      console.log('Error logout ', error)
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put('/auth/update-profile', data)
      set({ authUser: res.data })
      toast.success('Profile updated successfully')
    } catch (error) {
      console.log('Profile error update')
      toast.error(error.response.data.message || 'Profile error update')
    }
  },

  connectSocket: () => {
    const { authUser } = get()
    if (!authUser || get().socket?.connected) return

    const socket = io(base_URL, {
      withCredentials: true // bắt buộc để gửi cookie JWT
    })

    socket.connect()

    set({ socket: socket })

    // listen for online users event
    socket.on('getOnlineUsers', (userId) => {
      set({ onlineUsers: userId })
    })
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect()
  }
}))
