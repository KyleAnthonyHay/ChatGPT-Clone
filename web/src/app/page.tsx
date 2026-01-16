'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import { ShimmeringText } from '@/components/ui/shimmering-text'
import { useChat } from '@/context/ChatContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

const apiFetch = (endpoint: string, options: RequestInit = {}) => {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'ngrok-skip-browser-warning': 'true',
    },
  })
}

const loadingPhrases = [
  'Agent is thinking...',
  'Generating response...',
  'Almost there...',
]

export default function Home() {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const { chats, activeChat, addMessage, createNewChat, isLoading, setIsLoading } = useChat()

  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  useEffect(() => {
    if (!isLoading) {
      setPhraseIndex(0)
      return
    }
    
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [isLoading])

  const handleSendMessage = async (content: string, chatId?: string) => {
    const threadId = chatId || activeChat?.id
    if (!threadId || isLoading) return

    addMessage({ role: 'user', content }, threadId)
    setIsLoading(true)

    try {
      const response = await apiFetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          thread_id: threadId,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      addMessage({ 
        role: 'assistant', 
        content: data.reply,
        metadata: {
          response_time_ms: data.response_time_ms,
          context_used: data.context_used,
          tool_calls: data.tool_calls,
          error_occurred: data.error_occurred,
          error_type: data.error_type,
        }
      }, threadId)
    } catch (error) {
      addMessage({ 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        metadata: { error_occurred: true, error_type: 'NetworkError' }
      }, threadId)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWelcomeSend = (content: string) => {
    const newChatId = createNewChat()
    handleSendMessage(content, newChatId)
  }

  const hasChats = chats.length > 0

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        isMobile={isMobile}
      />

      <main
        className={`flex-1 flex flex-col transition-all duration-200 min-w-0 ${
          !isMobile && sidebarOpen ? 'md:ml-64' : 'ml-0'
        }`}
      >
        {hasChats ? (
          <>
            <header className="flex items-center justify-between px-4 py-3 border-b border-border-subtle shrink-0">
              <div className="flex items-center gap-2">
                {(isMobile || !sidebarOpen) && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 -ml-2 hover:bg-hover-bg rounded-lg transition-colors"
                    aria-label="Open menu"
                  >
                    <Menu size={20} className="text-text-secondary" />
                  </button>
                )}
                <span className="text-text-primary font-medium">ChatGPT</span>
                <span className="text-text-secondary text-sm hidden sm:inline">5.2 Instant</span>
                <svg
                  className="w-4 h-4 text-text-secondary hidden sm:block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="max-w-3xl mx-auto py-6 md:py-8 px-3 md:px-4">
                {activeChat?.messages.length === 0 ? (
                  <div className="text-center text-text-secondary mt-12 md:mt-20">
                    <p className="text-base md:text-lg">How can I help you today?</p>
                  </div>
                ) : (
                  activeChat?.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} threadId={activeChat.id} />
                  ))
                )}
                {isLoading && (
                  <div className="mb-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={phraseIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ShimmeringText 
                          text={loadingPhrases[phraseIndex]} 
                          className="text-base"
                          duration={1.5}
                          color="#a1a1aa"
                          shimmerColor="#ffffff"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            <ChatInput onSend={handleSendMessage} disabled={isLoading} isMobile={isMobile} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="absolute top-3 left-3 p-2 hover:bg-hover-bg rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu size={20} className="text-text-secondary" />
              </button>
            )}
            <h1 className="text-xl md:text-2xl text-text-primary font-medium mb-4 text-center">
              What's on your mind today?
            </h1>
            <div className="w-full max-w-3xl">
              <ChatInput onSend={handleWelcomeSend} disabled={isLoading} isMobile={isMobile} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
