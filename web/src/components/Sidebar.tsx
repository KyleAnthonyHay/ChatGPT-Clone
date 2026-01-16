'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { 
  PanelLeft,
  ChevronRight,
  ChevronDown,
  SidebarIcon,
  MoreHorizontal,
  Upload,
  Users,
  Pencil,
  FolderOpen,
  Pin,
  Archive,
  Trash2,
  Sparkles,
  Clock,
  Settings,
  LifeBuoy,
  LogOut,
  SquarePen,
  Search,
  ImageIcon,
  LayoutGrid,
  Code2
} from 'lucide-react'
import { useChat, Chat } from '@/context/ChatContext'

interface ChatItemProps {
  chat: Chat
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (newTitle: string) => void
}

function ChatItem({ chat, isActive, onSelect, onDelete, onRename }: ChatItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(chat.title)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({ top: rect.top, left: rect.right + 4 })
    }
    setShowMenu(!showMenu)
  }

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== chat.title) {
      onRename(renameValue.trim())
    } else {
      setRenameValue(chat.title)
    }
    setIsRenaming(false)
  }

  const menuItems = [
    { icon: Upload, label: 'Share', action: () => {} },
    { icon: Users, label: 'Start a group chat', action: () => {} },
    { icon: Pencil, label: 'Rename', action: () => { setIsRenaming(true); setShowMenu(false) } },
    { icon: FolderOpen, label: 'Move to project', action: () => {}, hasSubmenu: true },
    { divider: true },
    { icon: Pin, label: 'Pin chat', action: () => {} },
    { icon: Archive, label: 'Archive', action: () => {} },
    { icon: Trash2, label: 'Delete', action: onDelete, danger: true },
  ]

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); if (!showMenu) setShowMenu(false) }}
    >
      <button
        onClick={onSelect}
        className={`w-full text-left px-3 py-2 pl-6 pr-10 rounded-lg transition-colors ${
          isActive ? 'bg-hover-bg' : 'hover:bg-hover-bg'
        }`}
      >
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') { setRenameValue(chat.title); setIsRenaming(false) }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-sm text-text-primary outline-none border-b border-text-secondary"
          />
        ) : (
          <span className="text-sm text-text-primary truncate block">
            {chat.title}
          </span>
        )}
      </button>

      {(isHovered || showMenu) && !isRenaming && (
        <button
          ref={buttonRef}
          onClick={handleMenuToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-600 rounded transition-colors"
        >
          <MoreHorizontal size={16} className="text-text-secondary" />
        </button>
      )}

      {showMenu && (
        <div
          ref={menuRef}
          style={{ top: menuPosition.top, left: menuPosition.left }}
          className="fixed w-52 bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 py-2 z-[100]"
        >
          {menuItems.map((item, idx) => 
            item.divider ? (
              <div key={idx} className="my-1 border-t border-zinc-700" />
            ) : (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); item.action?.(); setShowMenu(false) }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  item.danger 
                    ? 'text-red-400 hover:bg-zinc-700' 
                    : 'text-text-primary hover:bg-zinc-700'
                }`}
              >
                {item.icon && <item.icon size={18} />}
                <span className="flex-1 text-left">{item.label}</span>
                {item.hasSubmenu && <ChevronRight size={16} className="text-text-secondary" />}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile?: boolean
}

export default function Sidebar({ isOpen, onToggle, isMobile = false }: SidebarProps) {
  const [chatsExpanded, setChatsExpanded] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [profileMenuPosition, setProfileMenuPosition] = useState({ bottom: 0, left: 0 })
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const { chats, activeChat, createNewChat, selectChat, updateChatTitle, deleteChat } = useChat()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node) &&
          profileButtonRef.current && !profileButtonRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfileMenu])

  const handleProfileClick = () => {
    if (!showProfileMenu && profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect()
      setProfileMenuPosition({ bottom: window.innerHeight - rect.top + 8, left: rect.left })
    }
    setShowProfileMenu(!showProfileMenu)
  }

  const handleChatSelect = (chatId: string) => {
    selectChat(chatId)
    if (isMobile) onToggle()
  }

  const handleNewChat = () => {
    createNewChat()
    if (isMobile) onToggle()
  }

  const profileMenuItems = [
    { icon: Sparkles, label: 'Upgrade plan', action: () => {} },
    { icon: Clock, label: 'Personalization', action: () => {} },
    { icon: Settings, label: 'Settings', action: () => {} },
    { divider: true },
    { icon: LifeBuoy, label: 'Help', action: () => {}, hasSubmenu: true },
    { icon: LogOut, label: 'Log out', action: () => {} },
  ]

  return (
    <>
      {!isOpen && !isMobile && (
        <button
          onClick={onToggle}
          className="fixed top-3 left-3 p-2 hover:bg-hover-bg rounded-lg transition-colors z-50"
          aria-label="Open sidebar"
        >
          <PanelLeft size={20} className="text-text-secondary" />
        </button>
      )}

      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-sidebar-bg flex flex-col z-40 transition-transform duration-300 ease-in-out ${
          isMobile 
            ? `w-72 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `sidebar-transition ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`
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
          {/* Main action buttons */}
          <div className="space-y-1 mt-2">
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-hover-bg rounded-lg transition-colors text-left"
            >
              <SquarePen size={18} className="text-text-primary" />
              <span className="text-sm text-text-primary">New chat</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-hover-bg rounded-lg transition-colors text-left">
              <Search size={18} className="text-text-primary" />
              <span className="text-sm text-text-primary">Search chats</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-hover-bg rounded-lg transition-colors text-left">
              <ImageIcon size={18} className="text-text-primary" />
              <span className="text-sm text-text-primary">Images</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-hover-bg rounded-lg transition-colors text-left">
              <LayoutGrid size={18} className="text-text-primary" />
              <span className="text-sm text-text-primary">Apps</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-hover-bg rounded-lg transition-colors text-left">
              <Code2 size={18} className="text-text-primary" />
              <span className="text-sm text-text-primary">Codex</span>
            </button>
          </div>

          {/* Expandable sections */}
          <div className="mt-6 space-y-1">
            <button className="w-full flex items-center gap-1 px-3 py-2 hover:bg-hover-bg rounded-lg transition-colors">
              <span className="text-sm text-text-secondary">GPTs</span>
              <ChevronRight size={16} className="text-text-secondary" />
            </button>

            <button className="w-full flex items-center gap-1 px-3 py-2 hover:bg-hover-bg rounded-lg transition-colors">
              <span className="text-sm text-text-secondary">Projects</span>
              <ChevronRight size={16} className="text-text-secondary" />
            </button>

            <button 
              onClick={() => setChatsExpanded(!chatsExpanded)}
              className="w-full flex items-center gap-1 px-3 py-2 hover:bg-hover-bg rounded-lg transition-colors"
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
                {chats.length === 0 ? (
                  <p className="text-xs text-text-secondary px-3 py-2 pl-6">
                    No chats yet
                  </p>
                ) : (
                  chats.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChat?.id === chat.id}
                      onSelect={() => handleChatSelect(chat.id)}
                      onDelete={() => deleteChat(chat.id)}
                      onRename={(newTitle) => updateChatTitle(chat.id, newTitle)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-border-subtle">
          <button 
            ref={profileButtonRef}
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-hover-bg rounded-lg transition-colors"
          >
            <Image
              src="/profile-picture.jpg"
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            <div className="flex-1 text-left">
              <div className="text-sm text-text-primary">Kyle-Anthony Hay</div>
              <div className="text-xs text-text-secondary">Plus</div>
            </div>
          </button>
        </div>

        {showProfileMenu && (
          <div
            ref={profileMenuRef}
            style={{ bottom: profileMenuPosition.bottom, left: profileMenuPosition.left }}
            className="fixed w-52 bg-[#2f2f2f] rounded-xl shadow-xl border border-zinc-700 py-2 z-[100]"
          >
            <div className="flex items-center gap-2.5 px-3 pb-2 border-b border-zinc-700">
              <Image
                src="/profile-picture.jpg"
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <div>
                <div className="text-xs text-text-primary font-medium">Kyle-Anthony</div>
                <div className="text-[11px] text-text-secondary">@kyle-anthony</div>
              </div>
            </div>

            <div className="py-1">
              {profileMenuItems.map((item, idx) => 
                item.divider ? (
                  <div key={idx} className="my-1 border-t border-zinc-700" />
                ) : (
                  <button
                    key={idx}
                    onClick={() => { item.action?.(); setShowProfileMenu(false) }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-text-primary hover:bg-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon && <item.icon size={14} className="text-text-secondary" />}
                      <span>{item.label}</span>
                    </div>
                    {item.hasSubmenu && <ChevronRight size={14} className="text-text-secondary" />}
                  </button>
                )
              )}
            </div>

            <div className="pt-1.5 border-t border-zinc-700 px-3">
              <div className="flex items-center gap-2.5 py-1.5">
                <Image
                  src="/profile-picture.jpg"
                  alt="Profile"
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
                <div>
                  <div className="text-xs text-text-primary">Kyle-Anthony Hay</div>
                  <div className="text-[10px] text-text-secondary">Plus</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
