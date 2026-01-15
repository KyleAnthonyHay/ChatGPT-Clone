'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import { useChat } from '@/context/ChatContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { chats, activeChat, addMessage, createNewChat, isLoading, setIsLoading } = useChat()

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
                  <div className="flex gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">AI</span>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-text-secondary rounded-full"></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full"></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full"></div>
                      </div>
                    </div>
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
