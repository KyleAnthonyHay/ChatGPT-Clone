'use client'

import { Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal } from 'lucide-react'
import { Response } from '@/components/ui/response'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

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
              <button className="p-1.5 hover:bg-hover-bg rounded-lg transition-colors">
                <Copy size={16} className="text-text-secondary" />
              </button>
              <button className="p-1.5 hover:bg-hover-bg rounded-lg transition-colors">
                <ThumbsUp size={16} className="text-text-secondary" />
              </button>
              <button className="p-1.5 hover:bg-hover-bg rounded-lg transition-colors">
                <ThumbsDown size={16} className="text-text-secondary" />
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
