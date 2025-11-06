import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import ChatHeader from './ChatHeader'
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder'
import MessageInput from './MessageInput'
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton'

function ChatContainer() {
  const { selectedUser, getMessagesByUserId, isMessagesLoading, messages } = useChatStore()

  const { authUser } = useAuthStore()

  useEffect(() => {
    getMessagesByUserId(selectedUser._id)
  }, [selectedUser, getMessagesByUserId])

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
                  {msg.image && <img src={msg.image} alt="shared" className="rounded-lg h-48 object-cover" />}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  {msg.createdAt && (
                    <time className="text-xs mt-1 opacity-75 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString(['en-US'], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>
      <MessageInput />
    </>
  )
}

export default ChatContainer
