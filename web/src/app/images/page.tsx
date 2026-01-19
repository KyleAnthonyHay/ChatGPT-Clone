'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { 
  ImageIcon, 
  Mic, 
  ArrowUp, 
  ChevronLeft, 
  ChevronRight,
  Menu,
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'

const imageStyles = [
  { name: 'Camcorder', image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=180&h=240&fit=crop' },
  { name: 'Neon fantasy', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=180&h=240&fit=crop' },
  { name: 'Norman Rockwell', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=180&h=240&fit=crop' },
  { name: 'Iconic', image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=180&h=240&fit=crop' },
  { name: 'Post-rain sunset', image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=180&h=240&fit=crop' },
  { name: 'Flower petals', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=180&h=240&fit=crop' },
  { name: 'Cyberpunk', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=180&h=240&fit=crop' },
  { name: 'Watercolor', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=180&h=240&fit=crop' },
  { name: 'Oil painting', image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=180&h=240&fit=crop' },
  { name: 'Anime', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=180&h=240&fit=crop' },
  { name: 'Vintage', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=180&h=240&fit=crop' },
  { name: 'Minimalist', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=180&h=240&fit=crop' },
]

const discoverPrompts = [
  { image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=96&h=96&fit=crop', text: 'Turn my apartment into a storybook' },
  { image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=96&h=96&fit=crop', text: 'Reimagine my pet as a human' },
  { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop', text: 'What does my future partner look like?' },
  { image: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=96&h=96&fit=crop', text: 'Give them a bowl cut' },
  { image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop', text: 'Me as an emperor' },
  { image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=96&h=96&fit=crop', text: 'Redecorate my room' },
  { image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=96&h=96&fit=crop', text: 'Design a futuristic gadget' },
  { image: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=96&h=96&fit=crop', text: 'Create motivational poster' },
  { image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=96&h=96&fit=crop', text: 'Fantasy landscape artwork' },
  { image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=96&h=96&fit=crop', text: 'Ocean sunset painting' },
  { image: 'https://images.unsplash.com/photo-1516617442634-75371039cb3a?w=96&h=96&fit=crop', text: 'City at night neon style' },
  { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop', text: 'Professional headshot edit' },
]

const sampleImages = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop',
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

export default function ImagesPage() {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [styleIndex, setStyleIndex] = useState(0)
  const [discoverIndex, setDiscoverIndex] = useState(0)
  const [styleDirection, setStyleDirection] = useState(0)
  const [discoverDirection, setDiscoverDirection] = useState(0)
  const stylesRef = useRef<HTMLDivElement>(null)
  const discoverRef = useRef<HTMLDivElement>(null)

  const stylesPerPage = 6
  const discoverPerPage = 6

  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  const scrollStyles = (direction: 'left' | 'right') => {
    setStyleDirection(direction === 'right' ? 1 : -1)
    if (direction === 'right' && styleIndex < imageStyles.length - stylesPerPage) {
      setStyleIndex(prev => Math.min(prev + stylesPerPage, imageStyles.length - stylesPerPage))
    } else if (direction === 'left' && styleIndex > 0) {
      setStyleIndex(prev => Math.max(prev - stylesPerPage, 0))
    }
  }

  const scrollDiscover = (direction: 'left' | 'right') => {
    setDiscoverDirection(direction === 'right' ? 1 : -1)
    if (direction === 'right' && discoverIndex < discoverPrompts.length - discoverPerPage) {
      setDiscoverIndex(prev => Math.min(prev + discoverPerPage, discoverPrompts.length - discoverPerPage))
    } else if (direction === 'left' && discoverIndex > 0) {
      setDiscoverIndex(prev => Math.max(prev - discoverPerPage, 0))
    }
  }

  const visibleStyles = imageStyles.slice(styleIndex, styleIndex + stylesPerPage)
  const visibleDiscover = discoverPrompts.slice(discoverIndex, discoverIndex + discoverPerPage)

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -100 : 100, opacity: 0 }),
  }

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
            {/* Header */}
            <div className="mb-8">
              {(isMobile || !sidebarOpen) && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="absolute top-3 left-3 p-2 hover:bg-hover-bg rounded-lg transition-colors"
                >
                  <Menu size={20} className="text-text-secondary" />
                </button>
              )}
              <h1 className="text-2xl md:text-3xl font-semibold text-text-primary mb-5">
                Images
              </h1>

              {/* Input */}
              <div className="relative max-w-2xl">
                <div className="flex items-center gap-2 bg-[#2f2f2f] rounded-full px-4 py-2.5 border border-zinc-700">
                  <ImageIcon size={18} className="text-text-secondary shrink-0" />
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe a new image"
                    className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary outline-none text-sm"
                  />
                  <button className="p-1.5 hover:bg-zinc-600 rounded-full transition-colors">
                    <Mic size={18} className="text-text-secondary" />
                  </button>
                  <button 
                    className={`p-1.5 rounded-full transition-colors ${
                      prompt ? 'bg-white text-black' : 'bg-zinc-600 text-zinc-400'
                    }`}
                    disabled={!prompt}
                  >
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Try a style */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium text-text-primary">Try a style on an image</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => scrollStyles('left')}
                    disabled={styleIndex === 0}
                    className="p-1.5 rounded-full border border-zinc-700 hover:bg-hover-bg transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft size={16} className="text-text-secondary" />
                  </button>
                  <button 
                    onClick={() => scrollStyles('right')}
                    disabled={styleIndex >= imageStyles.length - stylesPerPage}
                    className={`p-1.5 rounded-full border border-zinc-700 transition-colors ${
                      styleIndex >= imageStyles.length - stylesPerPage 
                        ? 'opacity-30' 
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div ref={stylesRef} className="overflow-hidden pb-2">
                <AnimatePresence mode="wait" custom={styleDirection}>
                  <motion.div
                    key={styleIndex}
                    custom={styleDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="flex gap-3"
                  >
                    {visibleStyles.map((style) => (
                      <button
                        key={style.name}
                        className="group relative shrink-0 w-[100px] h-[140px] md:w-[110px] md:h-[150px] rounded-xl overflow-hidden hover:ring-2 hover:ring-white/50 transition-all"
                      >
                        <img 
                          src={style.image} 
                          alt={style.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait" custom={styleDirection}>
                <motion.div
                  key={styleIndex}
                  custom={styleDirection}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="flex gap-3 mt-1"
                >
                  {visibleStyles.map((style) => (
                    <div key={style.name} className="shrink-0 w-[100px] md:w-[110px] text-center">
                      <span className="text-xs text-text-secondary">{style.name}</span>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </section>

            {/* Discover something new */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium text-text-primary">Discover something new</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => scrollDiscover('left')}
                    disabled={discoverIndex === 0}
                    className="p-1.5 rounded-full border border-zinc-700 hover:bg-hover-bg transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft size={16} className="text-text-secondary" />
                  </button>
                  <button 
                    onClick={() => scrollDiscover('right')}
                    disabled={discoverIndex >= discoverPrompts.length - discoverPerPage}
                    className={`p-1.5 rounded-full border border-zinc-700 transition-colors ${
                      discoverIndex >= discoverPrompts.length - discoverPerPage 
                        ? 'opacity-30' 
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div ref={discoverRef} className="overflow-hidden">
                <AnimatePresence mode="wait" custom={discoverDirection}>
                  <motion.div
                    key={discoverIndex}
                    custom={discoverDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="grid md:grid-cols-2 gap-x-8 gap-y-3"
                  >
                    {visibleDiscover.map((item, idx) => (
                      <button
                        key={idx}
                        className="flex items-center gap-4 py-2 hover:opacity-80 transition-opacity text-left"
                      >
                        <img 
                          src={item.image} 
                          alt=""
                          className="w-11 h-11 rounded-lg object-cover shrink-0"
                        />
                        <span className="text-sm text-text-primary">{item.text}</span>
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>

            {/* My images */}
            <section className="-mx-4">
              <h2 className="text-base font-medium text-text-primary mb-4 px-4">My images</h2>
              <div className="grid grid-cols-3 md:grid-cols-6">
                {sampleImages.map((img, idx) => (
                  <button
                    key={idx}
                    className="aspect-square overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src={img} 
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-text-secondary text-sm mt-6 px-4">
                Your generated images will appear here
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
