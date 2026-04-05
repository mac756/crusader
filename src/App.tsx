import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Moon, Sun, Maximize2, Minimize2 } from 'lucide-react'
import ChatInterface from './components/ChatInterface'
import { useState, useEffect } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

// Sword and Shield Logo with Christ Cross
function CrusaderLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield */}
      <path 
        d="M32 4L8 14V32C8 46 32 60 32 60C32 60 56 46 56 32V14L32 4Z" 
        fill="url(#shieldGradient)"
        stroke="url(#shieldStroke)"
        strokeWidth="2"
      />
      
      {/* Shield Inner Border */}
      <path 
        d="M32 8L12 16V32C12 44 32 56 32 56C32 56 52 44 52 32V16L32 8Z" 
        fill="none"
        stroke="rgba(212, 175, 55, 0.5)"
        strokeWidth="1"
      />
      
      {/* Cross (Christ Symbol) */}
      <rect x="28" y="18" width="8" height="28" rx="1" fill="#d4af37"/>
      <rect x="20" y="26" width="24" height="8" rx="1" fill="#d4af37"/>
      
      {/* Cross Highlight */}
      <rect x="29" y="19" width="2" height="12" rx="0.5" fill="rgba(255,255,255,0.3)"/>
      <rect x="21" y="27" width="10" height="2" rx="0.5" fill="rgba(255,255,255,0.3)"/>
      
      {/* Sword on the side */}
      <path 
        d="M48 8L54 14L52 16L46 10L48 8Z" 
        fill="url(#swordGradient)"
      />
      <rect 
        x="50" 
        y="14" 
        width="3" 
        height="20" 
        rx="0.5" 
        transform="rotate(45 50 14)"
        fill="url(#swordBlade)"
      />
      <rect 
        x="48" 
        y="28" 
        width="7" 
        height="3" 
        rx="0.5"
        transform="rotate(45 48 28)"
        fill="#8b7355"
      />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="shieldGradient" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7f1d1d"/>
          <stop offset="50%" stopColor="#991b1b"/>
          <stop offset="100%" stopColor="#450a0a"/>
        </linearGradient>
        <linearGradient id="shieldStroke" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d4af37"/>
          <stop offset="100%" stopColor="#b8860b"/>
        </linearGradient>
        <linearGradient id="swordGradient" x1="48" y1="8" x2="54" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d4af37"/>
          <stop offset="100%" stopColor="#b8860b"/>
        </linearGradient>
        <linearGradient id="swordBlade" x1="51.5" y1="14" x2="51.5" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e5e5e5"/>
          <stop offset="50%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#c0c0c0"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'knight-bg'}`}>
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800/95' : 'bg-crusader-800/95'} backdrop-blur-md border-b border-gold-500/20 sticky top-0 z-50 shield-border`}>
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
            {/* Logo */}
            <div className="relative">
              <CrusaderLogo className="w-11 h-11" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gold-500 rounded-full border-2 border-crusader-800"></div>
            </div>
            
            {/* Title */}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white tracking-tight">
                <span className="gold-gradient-text">CRUSADER</span>
              </h1>
              <p className="text-xs text-gold-300/80 font-medium tracking-widest uppercase">
                Christian AI Assistant
              </p>
            </div>
            
            {/* Decorative cross */}
            <div className="hidden sm:flex ml-2 opacity-30">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-gold-500" fill="currentColor">
                <rect x="10" y="3" width="4" height="18" rx="1" />
                <rect x="4" y="9" width="16" height="4" rx="1" />
              </svg>
            </div>
            
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className={`p-2.5 rounded-lg transition-all duration-200 ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-crusader-700 text-gold-300 hover:bg-crusader-600'}`}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-lg transition-all duration-200 ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-crusader-700 text-gold-300 hover:bg-crusader-600'}`}
                aria-label="Toggle dark mode"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
          <ChatInterface darkMode={darkMode} />
        </main>

        {/* Footer */}
        <footer className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-crusader-900/80 border-gold-500/10'} border-t py-4`}>
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-center text-sm text-gold-300/70">
              <span className="inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-gold-500/50" fill="currentColor">
                  <rect x="10" y="2" width="4" height="20" rx="1" />
                  <rect x="3" y="9" width="18" height="4" rx="1" />
                </svg>
                Built for His glory
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-gold-500/50" fill="currentColor">
                  <rect x="10" y="2" width="4" height="20" rx="1" />
                  <rect x="3" y="9" width="18" height="4" rx="1" />
                </svg>
              </span>
              <span className="mx-3 text-gold-500/30">|</span>
              God bless!
            </p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  )
}

export default App
