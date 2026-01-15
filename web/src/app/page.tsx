'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Sidebar from '@/components/Sidebar'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import { ShimmeringText } from '@/components/ui/shimmering-text'
import { useChat } from '@/context/ChatContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const loadingPhrases = [
  'Agent is thinking...',
  'Generating response...',
  'Almost there...',
]

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const { chats, activeChat, addMessage, createNewChat, isLoading, setIsLoading } = useChat()

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
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          thread_id: threadId,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      addMessage({ role: 'assistant', content: data.reply }, threadId)
    } catch (error) {
      addMessage({ 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
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
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main
        className={`flex-1 flex flex-col transition-all duration-200 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {hasChats ? (
          <>
            <header className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <div className={`flex items-center gap-2 ${sidebarOpen ? '' : 'ml-12'}`}>
                <span className="text-text-primary font-medium">ChatGPT</span>
                <span className="text-text-secondary text-sm">5.2 Instant</span>
                <svg
                  className="w-4 h-4 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto py-8 px-4">
                {activeChat?.messages.length === 0 ? (
                  <div className="text-center text-text-secondary mt-20">
                    <p className="text-lg">How can I help you today?</p>
                  </div>
                ) : (
                  activeChat?.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
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

            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="text-2xl text-text-primary font-medium mb-4">
              What's on your mind today?
            </h1>
            <div className="w-full max-w-3xl">
              <ChatInput onSend={handleWelcomeSend} disabled={isLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
