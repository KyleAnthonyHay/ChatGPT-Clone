'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { X, SquarePen, MessageCircle } from 'lucide-react'
import { useChat, Chat } from '@/context/ChatContext'

interface SearchChatsModalProps {
  isOpen: boolean
  onClose: () => void
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
}

type ChatGroup = {
  label: string
  chats: Chat[]
}

function groupChatsByDate(chats: Chat[]): ChatGroup[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const groups: { [key: string]: Chat[] } = {
    today: [],
    yesterday: [],
    previous7Days: [],
    previous30Days: [],
    older: [],
  }

  chats.forEach((chat) => {
    const chatDate = new Date(chat.createdAt)
    
    if (chatDate >= today) {
      groups.today.push(chat)
    } else if (chatDate >= yesterday) {
      groups.yesterday.push(chat)
    } else if (chatDate >= last7Days) {
      groups.previous7Days.push(chat)
    } else if (chatDate >= last30Days) {
      groups.previous30Days.push(chat)
    } else {
      groups.older.push(chat)
    }
  })

  const result: ChatGroup[] = []
  if (groups.today.length > 0) result.push({ label: 'Today', chats: groups.today })
  if (groups.yesterday.length > 0) result.push({ label: 'Yesterday', chats: groups.yesterday })
  if (groups.previous7Days.length > 0) result.push({ label: 'Previous 7 Days', chats: groups.previous7Days })
  if (groups.previous30Days.length > 0) result.push({ label: 'Previous 30 Days', chats: groups.previous30Days })
  if (groups.older.length > 0) result.push({ label: 'Older', chats: groups.older })

  return result
}

export default function SearchChatsModal({ isOpen, onClose, onNewChat, onSelectChat }: SearchChatsModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const { chats } = useChat()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats
    const query = searchQuery.toLowerCase()
    return chats.filter((chat) => 
      chat.title.toLowerCase().includes(query) ||
      chat.messages.some((msg) => msg.content.toLowerCase().includes(query))
    )
  }, [chats, searchQuery])

  const groupedChats = useMemo(() => {
    return groupChatsByDate(filteredChats)
  }, [filteredChats])

  const handleChatClick = (chatId: string) => {
    onSelectChat(chatId)
    onClose()
    setSearchQuery('')
  }

  const handleNewChat = () => {
    onNewChat()
    onClose()
    setSearchQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-[#2f2f2f] rounded-2xl shadow-2xl border border-zinc-700 overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="flex-1 bg-transparent text-text-primary text-base placeholder:text-text-secondary outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-600 rounded-lg transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          <div className="p-2">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-hover-bg rounded-lg transition-colors text-left"
            >
              <SquarePen size={18} className="text-text-primary" />
              <span className="text-sm text-text-primary font-medium">New chat</span>
            </button>
          </div>

          {groupedChats.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-text-secondary">
                {searchQuery ? 'No chats found' : 'No chats yet'}
              </p>
            </div>
          ) : (
            groupedChats.map((group) => (
              <div key={group.label} className="px-2 pb-2">
                <div className="px-3 py-2">
                  <span className="text-xs text-text-secondary font-medium">
                    {group.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {group.chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleChatClick(chat.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-hover-bg rounded-lg transition-colors text-left"
                    >
                      <MessageCircle size={18} className="text-text-secondary shrink-0" />
                      <span className="text-sm text-text-primary truncate">
                        {chat.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
