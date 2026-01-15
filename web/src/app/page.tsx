'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const HARDCODED_RESPONSE = `Hey 👋

How can I help?`

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'user',
      content: 'hello',
    },
    {
      id: 2,
      role: 'assistant',
      content: HARDCODED_RESPONSE,
    },
  ])

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content,
    }

    setMessages((prev) => [...prev, userMessage])

    setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I received your message: "${content}"\n\nThis is a hardcoded response. API integration coming soon!`,
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 500)
  }

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main
        className={`flex-1 flex flex-col transition-all duration-200 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* Header */}
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

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-8 px-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSendMessage} />
      </main>
    </div>
  )
}
