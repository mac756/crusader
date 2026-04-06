import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ChatInterface from './components/ChatInterface'
import { useState } from 'react'

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

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : ''}`}>
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-red-700 border-red-800'} px-4 py-3 border-b sticky top-0 z-50`}>
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <CrusaderLogo className="w-11 h-11" />
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
                <span className={darkMode ? 'text-red-400' : 'text-yellow-300'}>CRUSADER</span>
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-red-200'}`}>
                Christian AI Assistant
              </p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4">
          <ChatInterface darkMode={darkMode} />
        </main>
      </div>
    </QueryClientProvider>
  )
}

export default App
