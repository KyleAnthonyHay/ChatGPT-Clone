'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  PanelLeftClose, 
  PanelLeft,
  PenSquare, 
  ChevronRight,
  ChevronDown,
  MessageSquare,
  SidebarIcon
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [chatsExpanded, setChatsExpanded] = useState(true)
  
  const recentChats = [
    { id: 1, title: 'Next.js Project Setup' },
    { id: 2, title: 'React Best Practices' },
    { id: 3, title: 'Tailwind CSS Tips' },
  ]

  return (
    <>
      {/* Collapsed toggle button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-3 left-3 p-2 hover:bg-hover-bg rounded-lg transition-colors z-50"
          aria-label="Open sidebar"
        >
          <PanelLeft size={20} className="text-text-secondary" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar-transition fixed left-0 top-0 h-full bg-sidebar-bg flex flex-col z-40 ${
          isOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="flex items-center justify-between p-3">
          <Image
            src="/chatgpt-logo(white).png"
            alt="ChatGPT"
            width={28}
            height={28}
            className="ml-1"
          />
          <button
            onClick={onToggle}
            className="p-2 hover:bg-hover-bg rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <SidebarIcon size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {/* New Chat */}
          <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-hover-bg rounded-lg transition-colors text-left">
            <MessageSquare size={18} className="text-text-secondary" />
            <span className="text-sm text-text-primary">New chat</span>
          </button>

          {/* GPTs Section */}
          <div className="mt-4">
            <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-hover-bg rounded-lg transition-colors">
              <span className="text-sm text-text-secondary">GPTs</span>
              <ChevronRight size={16} className="text-text-secondary" />
            </button>
          </div>

          {/* Projects Section */}
          <div className="mt-1">
            <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-hover-bg rounded-lg transition-colors">
              <span className="text-sm text-text-secondary">Projects</span>
              <ChevronRight size={16} className="text-text-secondary" />
            </button>
          </div>

          {/* Your Chats Section */}
          <div className="mt-1">
            <button 
              onClick={() => setChatsExpanded(!chatsExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-hover-bg rounded-lg transition-colors"
            >
              <span className="text-sm text-text-secondary">Your chats</span>
              {chatsExpanded ? (
                <ChevronDown size={16} className="text-text-secondary" />
              ) : (
                <ChevronRight size={16} className="text-text-secondary" />
              )}
            </button>
            
            {chatsExpanded && (
              <div className="mt-1 space-y-1">
                {recentChats.map((chat) => (
                  <button
                    key={chat.id}
                    className="w-full text-left px-3 py-2 pl-6 hover:bg-hover-bg rounded-lg transition-colors"
                  >
                    <span className="text-sm text-text-primary truncate block">
                      {chat.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-border-subtle">
          <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-hover-bg rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-medium text-white">
              KH
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm text-text-primary">Kyle-Anthony Hay</div>
              <div className="text-xs text-text-secondary">Plus</div>
            </div>
          </button>
        </div>
      </aside>
    </>
  )
}
