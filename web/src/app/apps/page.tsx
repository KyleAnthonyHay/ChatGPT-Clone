'use client'

import { useState, useEffect } from 'react'
import { 
  Search,
  ChevronRight,
  Menu,
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'

const tabs = ['Featured', 'Lifestyle', 'Productivity']

const apps = [
  { name: 'Adobe Photoshop', description: 'Edit, stylize, refine images', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Adobe_Photoshop_CC_icon.svg/512px-Adobe_Photoshop_CC_icon.svg.png', color: 'bg-[#31A8FF]' },
  { name: 'Airtable', description: 'Add structured data to ChatGPT', icon: 'https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png', color: 'bg-[#18BFFF]' },
  { name: 'AllTrails', description: 'Discover your next hike', icon: 'https://cdn.worldvectorlogo.com/logos/alltrails.svg', color: 'bg-[#428813]' },
  { name: 'Apple Music', description: 'Build playlists and find music', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/2048px-Apple_Music_icon.svg.png', color: 'bg-gradient-to-br from-[#FA2D48] to-[#FB5C74]' },
  { name: 'Booking.com', description: 'Find hotels, homes and more', icon: 'https://cf.bstatic.com/static/img/favicon/9f93c024c5795a498f00ce26b2d3d4a730e19616.svg', color: 'bg-[#003580]' },
  { name: 'Canva', description: 'Search, create, edit designs', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/2048px-Canva_icon_2021.svg.png', color: 'bg-gradient-to-br from-[#00C4CC] to-[#7B2FF7]' },
  { name: 'Expedia', description: 'Plan trips, flights and hotels', icon: 'https://www.expedia.com/favicon.ico', color: 'bg-[#FFCC00]' },
  { name: 'Figma', description: 'Make diagrams, slides, assets', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Figma-logo.svg/1667px-Figma-logo.svg.png', color: 'bg-black' },
  { name: 'Instacart', description: 'Groceries and more delivered', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Instacart_logo_and_wordmark.svg/2560px-Instacart_logo_and_wordmark.svg.png', color: 'bg-[#43B02A]' },
  { name: 'Lovable', description: 'Build apps and websites', icon: 'https://lovable.dev/favicon.ico', color: 'bg-gradient-to-br from-orange-400 to-pink-500' },
  { name: 'OpenTable', description: 'Find restaurant reservations', icon: 'https://cdn.otstatic.com/cfe/13/images/opentable-logo-153e80.svg', color: 'bg-[#DA3743]' },
  { name: 'Replit', description: 'Turn your ideas into real apps', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/New_Replit_Logo.svg/1200px-New_Replit_Logo.svg.png', color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
  { name: 'Spotify', description: 'Music and podcasts for you', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1982px-Spotify_icon.svg.png', color: 'bg-[#1DB954]' },
  { name: 'Target', description: 'Style, decor, beauty, and more', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Target_Corporation_logo_%28vector%29.svg/1200px-Target_Corporation_logo_%28vector%29.svg.png', color: 'bg-white' },
  { name: 'Tripadvisor', description: 'Book top-rated hotels', icon: 'https://static.tacdn.com/img2/brand_refresh/Tripadvisor_logoset_solid_green.svg', color: 'bg-[#34E0A1]' },
  { name: 'Zillow', description: 'Buy, rent, and sell homes', icon: 'https://s.zillowstatic.com/pfs/static/z-logo-default.svg', color: 'bg-[#006AFF]' },
]

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  return isMobile
}

export default function AppsPage() {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('Featured')

  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        isMobile={isMobile}
      />

      <main
        className={`flex-1 flex flex-col transition-all duration-200 min-w-0 ${
          !isMobile && sidebarOpen ? 'md:ml-64' : 'ml-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {(isMobile || !sidebarOpen) && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="absolute top-3 left-3 p-2 hover:bg-hover-bg rounded-lg transition-colors"
              >
                <Menu size={20} className="text-text-secondary" />
              </button>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-semibold text-text-primary">Apps</h1>
                  <span className="px-2 py-0.5 text-[10px] font-medium text-text-secondary border border-zinc-600 rounded-full">
                    BETA
                  </span>
                </div>
                <p className="text-sm text-text-secondary">Chat with your favorite apps in ChatGPT</p>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps"
                  className="pl-9 pr-4 py-2 bg-[#2f2f2f] rounded-lg text-sm text-text-primary placeholder:text-text-secondary outline-none border border-transparent focus:border-zinc-600 w-48"
                />
              </div>
            </div>

            {/* Featured Banner */}
            <div className="relative rounded-2xl overflow-hidden mb-8 h-48 md:h-56">
              <div className="absolute inset-0 bg-gradient-to-r from-[#7B2FF7] via-[#00C4CC] to-[#F5D76E]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="relative h-full p-6 flex flex-col justify-end">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00C4CC] to-[#7B2FF7] rounded-xl flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-white">C</span>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-1">Create with Canva</h2>
                    <p className="text-sm text-white/80 mb-4">Make designs and flyers</p>
                    <button className="px-5 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-100 transition-colors">
                      View
                    </button>
                  </div>
                  <div className="hidden md:block">
                    <div className="bg-white rounded-xl p-2 shadow-lg">
                      <p className="text-xs text-zinc-600">@Canva create social posts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm rounded-full transition-colors ${
                    activeTab === tab
                      ? 'bg-[#2f2f2f] text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Apps Grid */}
            <div className="grid md:grid-cols-2 gap-2">
              {filteredApps.map((app) => (
                <button
                  key={app.name}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#2f2f2f] transition-colors text-left group"
                >
                  <div className={`w-10 h-10 rounded-lg ${app.color} flex items-center justify-center shrink-0 overflow-hidden`}>
                    <img 
                      src={app.icon} 
                      alt={app.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary">{app.name}</div>
                    <div className="text-xs text-text-secondary truncate">{app.description}</div>
                  </div>
                  <ChevronRight size={16} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
