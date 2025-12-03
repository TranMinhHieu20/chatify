import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import { toast } from 'sonner'
import { Rss } from 'lucide-react'
import { useAuthStore } from './useAuthStore'
import { encryptMessage, decryptMessage } from '../lib/crypto'

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: 'chats',
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  isSoundEnabled: JSON.parse(localStorage.getItem('isSoundEnabled')) === true,

  toggleSound: () => {
    localStorage.setItem('isSoundEnabled', !get().isSoundEnabled)
    set({ isSoundEnabled: !get().isSoundEnabled })
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
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true })
    try {
      const { authUser, privateKey } = useAuthStore.getState()
      const res = await axiosInstance.get(`/messages/${userId}`)

      const decryptedMessages = res.data.map((msg) => {
        // ✅ Tin nhắn của mình: hiển thị text thẳng
        if (msg.senderId === authUser._id) {
          return msg // Chỉ có text, không cần giải mã
        }

        // ✅ Tin nhắn từ người khác: giải mã encryptedText
        if (msg.encryptedText && msg.nonce && msg.senderPublicKey && privateKey) {
          try {
            const decrypted = decryptMessage(msg.encryptedText, msg.nonce, msg.senderPublicKey, privateKey)
            return { ...msg, text: decrypted }
          } catch (error) {
            console.error('Decryption failed:', error)
            return { ...msg, text: '[Failed to decrypt]' }
          }
        }

        return msg
      })

      set({ messages: decryptedMessages })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load messages')
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get()
    const { authUser, privateKey } = useAuthStore.getState()

    if (!selectedUser) return
    if (!privateKey) return

    set({ isSendingMessage: true })
    const tempId = `temp-${Date.now()}`

    try {
      const pubKeyRes = await axiosInstance.get(`/messages/public-key/${selectedUser._id}`)
      const recipientPublicKey = pubKeyRes.data.publicKey
      if (!recipientPublicKey) throw new Error('Recipient public key not found')

      let encryptedText = null
      let nonce = null
      if (messageData.text) {
        const enc = encryptMessage(messageData.text, recipientPublicKey, privateKey)
        encryptedText = enc.encryptedText
        nonce = enc.nonce
      }

      const optimisticMessage = {
        _id: tempId,
        senderId: authUser._id,
        receiverId: selectedUser._id,
        text: messageData.text,
        image: messageData.image,
        encryptedText,
        nonce,
        senderPublicKey: authUser.publicKey,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      }

      // thêm optimistic dựa trên state hiện thời
      set((state) => ({ messages: [...state.messages, optimisticMessage] }))

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        text: messageData.text,
        image: messageData.image,
        encryptedText,
        nonce
      })

      // dùng state hiện tại để thay thế temp message hoặc append nếu không tìm thấy
      set((state) => {
        const found = state.messages.some((m) => m._id === tempId)
        if (found) {
          return { messages: state.messages.map((m) => (m._id === tempId ? res.data : m)) }
        }
        return { messages: [...state.messages, res.data] }
      })
    } catch (error) {
      // remove optimistic nếu lỗi
      set((state) => ({ messages: state.messages.filter((m) => m._id !== tempId) }))
      console.error(error)
    } finally {
      set({ isSendingMessage: false })
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get()
    const { authUser, privateKey } = useAuthStore.getState()

    if (!selectedUser) return

    const socket = useAuthStore.getState().socket
    if (!socket) return

    socket.on('newMessage', (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id
      if (!isMessageSentFromSelectedUser) return

      let decryptedMessage = newMessage

      // ✅ Giải mã tin nhắn mới nhận
      if (newMessage.encryptedText && newMessage.nonce && newMessage.senderPublicKey && privateKey) {
        try {
          const decrypted = decryptMessage(
            newMessage.encryptedText,
            newMessage.nonce,
            newMessage.senderPublicKey,
            privateKey
          )
          decryptedMessage = { ...newMessage, text: decrypted }
        } catch (error) {
          console.error('Decryption failed for new message:', error)
          decryptedMessage = { ...newMessage, text: '[Failed to decrypt]' }
        }
      }

      const currentMessages = get().messages
      set({ messages: [...currentMessages, decryptedMessage] })

      if (isSoundEnabled) {
        const notificationSound = new Audio('/sounds/notification.mp3')
        notificationSound.currentTime = 0
        notificationSound.play().catch((e) => console.log('Audio play failed:', e))
      }
    })
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket
    if (socket) {
      socket.off('newMessage')
    }
  }
}))
