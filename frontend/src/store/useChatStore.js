import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import { toast } from 'sonner'

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: 'chats',
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnable: localStorage.getItem('isSoundEnable') === true,

  toggleSound: () => {
    localStorage.setItem('isSoundEnable', !get().isSoundEnable)
    set({ isSoundEnable: !get().isSoundEnable })
  },

  setActiveTab: (tab) => {
    set({
      activeTab: tab
    })
  },

  setSelectedUser: (selectedUser) => {
    set({
      selectedUser: selectedUser
    })
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true })
    try {
      const res = await axiosInstance.get('/messages/contacts')
      set({ allContacts: res.data })
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isUsersLoading: false })
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true })
    try {
      const res = await axiosInstance.get('/messages/chats')
      set({ chats: res.data })
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isUsersLoading: false })
    }
  }
}))
