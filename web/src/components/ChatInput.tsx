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
  isMobile?: boolean
}

export default function ChatInput({ onSend, disabled, isMobile = false }: ChatInputProps) {
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
    { icon: Paperclip, label: 'Add photos & files', showOnMobile: true },
    { icon: ImagePlus, label: 'Create image', showOnMobile: false },
    { icon: Search, label: 'Deep research', showOnMobile: false },
    { icon: ShoppingCart, label: 'Shopping research', showOnMobile: false },
    { icon: Bot, label: 'Agent mode', showOnMobile: false },
    { icon: MoreHorizontal, label: 'More', hasChevron: true, showOnMobile: true },
  ]

  const displayedItems = isMobile 
    ? toolkitItems.filter(item => item.showOnMobile) 
    : toolkitItems

  const hasText = input.trim().length > 0

  return (
    <div className={`p-3 md:p-4 bg-chat-bg ${isMobile ? 'sticky bottom-0 pb-safe' : ''}`}>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative flex items-center bg-[#303030] rounded-3xl border border-border-subtle focus-within:border-[#4a4a4a] transition-colors">
          {/* Plus button with toolkit */}
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setShowToolkit(!showToolkit)}
              className="p-2.5 md:p-3 hover:bg-hover-bg rounded-full transition-colors ml-1"
              aria-label="Attach"
            >
              <Plus size={isMobile ? 18 : 20} className="text-text-secondary" />
            </button>

            {/* Toolkit popup */}
            {showToolkit && (
              <div
                ref={toolkitRef}
                className={`absolute bottom-full left-0 mb-2 bg-[#2f2f2f] rounded-2xl border border-border-subtle shadow-xl py-2 z-50 ${
                  isMobile ? 'w-48' : 'w-56'
                }`}
              >
                {displayedItems.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-2.5 md:py-3 hover:bg-hover-bg transition-colors"
                    onClick={() => setShowToolkit(false)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={isMobile ? 16 : 18} className="text-text-secondary" />
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
            className="flex-1 bg-transparent py-2.5 md:py-3 px-2 text-text-primary placeholder-text-secondary outline-none text-sm md:text-[15px]"
          />
          
          <div className="flex items-center gap-1 pr-2">
            {!hasText && !isMobile && (
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
              className={`p-1.5 md:p-2 rounded-full transition-colors ${
                hasText && !disabled
                  ? 'bg-white hover:bg-gray-200' 
                  : 'bg-gray-500 cursor-not-allowed'
              }`}
              disabled={!hasText || disabled}
              aria-label="Send"
            >
              <ArrowUp size={isMobile ? 18 : 20} className="text-black" />
            </button>
          </div>
        </div>
      </form>
      <p className="text-center text-[11px] md:text-xs text-text-secondary mt-2 md:mt-3">
        ChatGPT can make mistakes. Check important info.
      </p>
    </div>
  )
}
