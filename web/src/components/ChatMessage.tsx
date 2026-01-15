'use client'

import { useState } from 'react'
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal, Check } from 'lucide-react'
import { Response } from '@/components/ui/response'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface MessageMetadata {
  response_time_ms?: number
  context_used?: boolean
  tool_calls?: string[]
  error_occurred?: boolean
  error_type?: string | null
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: MessageMetadata
}

interface ChatMessageProps {
  message: Message
  threadId?: string
}

export default function ChatMessage({ message, threadId }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFeedback = async (type: 'up' | 'down') => {
    const newFeedback = feedback === type ? null : type
    setFeedback(newFeedback)
    
    try {
      await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: message.id,
          thread_id: threadId,
          feedback: newFeedback,
          message_content: message.content,
          session_id: threadId,
          response_time_ms: message.metadata?.response_time_ms,
          context_used: message.metadata?.context_used,
          tool_calls: message.metadata?.tool_calls,
          error_occurred: message.metadata?.error_occurred ?? false,
          error_type: message.metadata?.error_type,
        }),
      })
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 message-enter`}>
      <div className={`max-w-2xl ${isUser ? 'order-1' : 'order-1'}`}>
        {isUser ? (
          <div className="bg-user-bubble rounded-3xl px-5 py-3">
            <p className="text-text-primary text-[15px] leading-relaxed">
              {message.content}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Response className="text-text-primary text-[15px] leading-relaxed">
              {message.content}
            </Response>
            <div className="flex items-center gap-1 pt-1">
              <button 
                onClick={handleCopy}
                className="p-1.5 hover:bg-hover-bg rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} className="text-text-secondary" />
                )}
              </button>
              <button 
                onClick={() => handleFeedback('up')}
                className={`p-1.5 hover:bg-hover-bg rounded-lg transition-colors ${
                  feedback === 'up' ? 'bg-hover-bg' : ''
                }`}
                title="Good response"
              >
                <ThumbsUp size={16} className="text-text-secondary" fill={feedback === 'up' ? 'currentColor' : 'none'} />
              </button>
              <button 
                onClick={() => handleFeedback('down')}
                className={`p-1.5 hover:bg-hover-bg rounded-lg transition-colors ${
                  feedback === 'down' ? 'bg-hover-bg' : ''
                }`}
                title="Bad response"
              >
                <ThumbsDown size={16} className="text-text-secondary" fill={feedback === 'down' ? 'currentColor' : 'none'} />
              </button>
              <button className="p-1.5 hover:bg-hover-bg rounded-lg transition-colors">
                <RotateCcw size={16} className="text-text-secondary" />
              </button>
              <button className="p-1.5 hover:bg-hover-bg rounded-lg transition-colors">
                <MoreHorizontal size={16} className="text-text-secondary" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
