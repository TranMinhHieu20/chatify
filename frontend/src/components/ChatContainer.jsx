import React, { useEffect, useState, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import ChatHeader from './ChatHeader'
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder'
import MessageInput from './MessageInput'
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton'
import { XIcon } from 'lucide-react'

function ChatContainer() {
  const { selectedUser, getMessagesByUserId, isMessagesLoading, messages } = useChatStore()

  const { authUser } = useAuthStore()

  const [previewImage, setPreviewImage] = useState(null)
  const messageEndRef = useRef(null)

  useEffect(() => {
    if (!selectedUser?._id) return
    getMessagesByUserId(selectedUser._id)
  }, [selectedUser, getMessagesByUserId])

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-4xl mx-auto space-y-2">
            {messages.map((msg) => (
              <div key={msg._id} className={`chat ${msg.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}>
                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser._id ? 'bg-cyan-600 text-white' : 'bg-slate-600 text-slate-200'
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="shared"
                      className="rounded-lg h-48 object-cover cursor-pointer"
                      onClick={() => setPreviewImage(msg.image)}
                    />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  {msg.createdAt && (
                    <time className="text-xs mt-1 opacity-75 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString(['en-US'], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  )}
                </div>
              </div>
            ))}
            {/* Scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>
      <MessageInput />
      {previewImage && (
        <div
          className=" fixed  inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="full"
            className=" relative max-w-full max-h-full rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()} // ko dong khi click vao anh
          />
          <XIcon
            className="absolute w-7 h-8  text-white cursor-pointer right-5 top-5 hover:text-red-500 transition-colors"
            onClick={() => setPreviewImage(null)}
          />
        </div>
      )}
    </>
  )
}

export default ChatContainer
