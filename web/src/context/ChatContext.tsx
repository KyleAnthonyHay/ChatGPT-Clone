'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface MessageMetadata {
  response_time_ms?: number
  context_used?: boolean
  tool_calls?: string[]
  error_occurred?: boolean
  error_type?: string | null
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: MessageMetadata
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

interface ChatContextType {
  chats: Chat[]
  activeChat: Chat | null
  createNewChat: () => string
  selectChat: (chatId: string) => void
  addMessage: (message: Omit<Message, 'id'>, chatId?: string) => void
  updateChatTitle: (chatId: string, title: string) => void
  deleteChat: (chatId: string) => Promise<void>
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

function generateId(): string {
  return crypto.randomUUID()
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const activeChat = chats.find(c => c.id === activeChatId) || null

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: generateId(),
      title: 'New chat',
      messages: [],
      createdAt: new Date(),
    }
    setChats(prev => [newChat, ...prev])
    setActiveChatId(newChat.id)
    return newChat.id
  }, [])

  const selectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId)
  }, [])

  const addMessage = useCallback((message: Omit<Message, 'id'>, chatId?: string) => {
    const targetChatId = chatId || activeChatId
    if (!targetChatId) return

    const newMessage: Message = {
      ...message,
      id: generateId(),
    }

    setChats(prev => prev.map(chat => {
      if (chat.id !== targetChatId) return chat
      
      const updatedMessages = [...chat.messages, newMessage]
      const shouldUpdateTitle = chat.title === 'New chat' && 
        message.role === 'user' && 
        updatedMessages.filter(m => m.role === 'user').length === 1

      return {
        ...chat,
        messages: updatedMessages,
        title: shouldUpdateTitle ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '') : chat.title,
      }
    }))
  }, [activeChatId])

  const updateChatTitle = useCallback((chatId: string, title: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title } : chat
    ))
  }, [])

  const deleteChat = useCallback(async (chatId: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    try {
      await fetch(`${API_URL}/chat/${chatId}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Failed to delete chat memory:', error)
    }
    
    setChats(prev => {
      const remaining = prev.filter(chat => chat.id !== chatId)
      if (activeChatId === chatId) {
        setActiveChatId(remaining.length > 0 ? remaining[0].id : null)
      }
      return remaining
    })
  }, [activeChatId])

  return (
    <ChatContext.Provider value={{
      chats,
      activeChat,
      createNewChat,
      selectChat,
      addMessage,
      updateChatTitle,
      deleteChat,
      isLoading,
      setIsLoading,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
