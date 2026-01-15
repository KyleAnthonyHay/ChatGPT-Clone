'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Plus, 
  Mic, 
  ArrowUp, 
  Paperclip, 
  ImagePlus, 
  Search, 
  ShoppingCart, 
  Bot, 
  MoreHorizontal,
  ChevronRight
} from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [showToolkit, setShowToolkit] = useState(false)
  const toolkitRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        toolkitRef.current && 
        !toolkitRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setShowToolkit(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const toolkitItems = [
    { icon: Paperclip, label: 'Add photos & files' },
    { icon: ImagePlus, label: 'Create image' },
    { icon: Search, label: 'Deep research' },
    { icon: ShoppingCart, label: 'Shopping research' },
    { icon: Bot, label: 'Agent mode' },
    { icon: MoreHorizontal, label: 'More', hasChevron: true },
  ]

  const hasText = input.trim().length > 0

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative flex items-center bg-[#303030] rounded-3xl border border-border-subtle focus-within:border-[#4a4a4a] transition-colors">
          {/* Plus button with toolkit */}
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setShowToolkit(!showToolkit)}
              className="p-3 hover:bg-hover-bg rounded-full transition-colors ml-1"
              aria-label="Attach"
            >
              <Plus size={20} className="text-text-secondary" />
            </button>

            {/* Toolkit popup */}
            {showToolkit && (
              <div
                ref={toolkitRef}
                className="absolute bottom-full left-0 mb-2 w-56 bg-[#2f2f2f] rounded-2xl border border-border-subtle shadow-xl py-2 z-50"
              >
                {toolkitItems.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-hover-bg transition-colors"
                    onClick={() => setShowToolkit(false)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="text-text-secondary" />
                      <span className="text-sm text-text-primary">{item.label}</span>
                    </div>
                    {item.hasChevron && (
                      <ChevronRight size={16} className="text-text-secondary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            className="flex-1 bg-transparent py-3 px-2 text-text-primary placeholder-text-secondary outline-none text-[15px]"
          />
          
          <div className="flex items-center gap-1 pr-2">
            {!hasText && (
              <button
                type="button"
                className="p-2 hover:bg-hover-bg rounded-full transition-colors"
                aria-label="Voice input"
              >
                <Mic size={20} className="text-text-secondary" />
              </button>
            )}
            <button
              type="submit"
              className={`p-2 rounded-full transition-colors ${
                hasText && !disabled
                  ? 'bg-white hover:bg-gray-200' 
                  : 'bg-gray-500 cursor-not-allowed'
              }`}
              disabled={!hasText || disabled}
              aria-label="Send"
            >
              <ArrowUp size={20} className="text-black" />
            </button>
          </div>
        </div>
      </form>
      <p className="text-center text-xs text-text-secondary mt-3">
        ChatGPT is AI and can make mistakes. Check important info.
      </p>
    </div>
  )
}
