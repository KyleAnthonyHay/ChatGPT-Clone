'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const apiFetch = (endpoint: string, options: RequestInit = {}) => {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'ngrok-skip-browser-warning': 'true',
    },
  })
}

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
  isLoadingChats: boolean
}

const ChatContext = createContext<ChatContextType | null>(null)

function generateId(): string {
  return crypto.randomUUID()
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingChats, setIsLoadingChats] = useState(true)

  const activeChat = chats.find(c => c.id === activeChatId) || null

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      const response = await apiFetch('/chats')
      if (response.ok) {
        const data = await response.json()
        const loadedChats: Chat[] = data.map((chat: any) => ({
          id: chat.id,
          title: chat.title,
          messages: chat.messages || [],
          createdAt: chat.created_at ? new Date(chat.created_at) : new Date(),
        }))
        setChats(loadedChats)
        if (loadedChats.length > 0) {
          setActiveChatId(loadedChats[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error)
    } finally {
      setIsLoadingChats(false)
    }
  }

  const saveMessageToDB = async (message: Message, chatId: string) => {
    try {
      await apiFetch('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: message.id,
          chat_id: chatId,
          role: message.role,
          content: message.content,
          response_time_ms: message.metadata?.response_time_ms,
          context_used: message.metadata?.context_used,
          tool_calls: message.metadata?.tool_calls,
          error_occurred: message.metadata?.error_occurred,
          error_type: message.metadata?.error_type,
        }),
      })
    } catch (error) {
      console.error('Failed to save message:', error)
    }
  }

  const saveChatToDB = async (chatId: string, title: string) => {
    try {
      await apiFetch('/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, title }),
      })
    } catch (error) {
      console.error('Failed to save chat:', error)
    }
  }

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: generateId(),
      title: 'New chat',
      messages: [],
      createdAt: new Date(),
    }
    setChats(prev => [newChat, ...prev])
    setActiveChatId(newChat.id)
    saveChatToDB(newChat.id, newChat.title)
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

      const newTitle = shouldUpdateTitle 
        ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '') 
        : chat.title

      saveMessageToDB(newMessage, targetChatId)
      if (shouldUpdateTitle) {
        saveChatToDB(targetChatId, newTitle)
      }

      return {
        ...chat,
        messages: updatedMessages,
        title: newTitle,
      }
    }))
  }, [activeChatId])

  const updateChatTitle = useCallback((chatId: string, title: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title } : chat
    ))
  }, [])

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await apiFetch(`/chats/${chatId}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Failed to delete chat:', error)
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
      isLoadingChats,
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
