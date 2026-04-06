import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ChatInterface from './components/ChatInterface'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

// New Sword + Shield + Cross Logo
function CrusaderLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Shield gradient */}
        <linearGradient id="newShieldGrad" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7f1d1d"/>
          <stop offset="50%" stopColor="#991b1b"/>
          <stop offset="100%" stopColor="#450a0a"/>
        </linearGradient>
        
        {/* Gold gradient */}
        <linearGradient id="goldGrad" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fcd34d"/>
          <stop offset="50%" stopColor="#d4af37"/>
          <stop offset="100%" stopColor="#b8860b"/>
        </linearGradient>
        
        {/* Sword blade gradient */}
        <linearGradient id="bladeGrad" x1="50" y1="12" x2="50" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="50%" stopColor="#e5e5e5"/>
          <stop offset="100%" stopColor="#c0c0c0"/>
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feFlood floodColor="#d4af37" floodOpacity="0.6"/>
          <feComposite in2="blur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Shield - main shape */}
      <path 
        d="M32 4L6 14V30C6 44 32 60 32 60C32 60 58 44 58 30V14L32 4Z" 
        fill="url(#newShieldGrad)"
        stroke="url(#goldGrad)"
        strokeWidth="1.5"
      />
      
      {/* Shield inner border */}
      <path 
        d="M32 8L10 16V30C10 42 32 54 32 54C32 54 54 42 54 30V16L32 8Z" 
        fill="none"
        stroke="rgba(212, 175, 55, 0.4)"
        strokeWidth="1"
      />
      
      {/* Cross - centered and prominent */}
      <g filter="url(#goldGlow)">
        {/* Vertical beam */}
        <rect x="28" y="16" width="8" height="32" rx="1" fill="url(#goldGrad)"/>
        {/* Horizontal beam */}
        <rect x="20" y="24" width="24" height="8" rx="1" fill="url(#goldGrad)"/>
      </g>
      
      {/* Cross highlight */}
      <rect x="29" y="17" width="2" height="14" rx="0.5" fill="rgba(255,255,255,0.4)"/>
      <rect x="21" y="25" width="10" height="2" rx="0.5" fill="rgba(255,255,255,0.4)"/>
      
      {/* Sword - positioned at top right, diagonal */}
      <g>
        {/* Sword guard */}
        <rect 
          x="44" 
          y="22" 
          width="10" 
          height="3" 
          rx="1"
          transform="rotate(45 44 22)"
          fill="#8b7355"
        />
        {/* Sword handle */}
        <rect 
          x="47" 
          y="24" 
          width="4" 
          height="10" 
          rx="1"
          transform="rotate(45 47 24)"
          fill="#5c4033"
        />
        {/* Sword pommel */}
        <circle 
          cx="53.5" 
          cy="30.5" 
          r="2.5"
          fill="url(#goldGrad)"
        />
        {/* Sword blade */}
        <path 
          d="M46 18L54 10L56 12L48 20L46 18Z" 
          fill="url(#bladeGrad)"
        />
        <rect 
          x="47" 
          y="14" 
          width="3" 
          height="18" 
          rx="0.5"
          transform="rotate(45 47 14)"
          fill="url(#bladeGrad)"
        />
        {/* Blade edge highlight */}
        <path 
          d="M47.5 15L52.5 10"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="0.5"
          transform="rotate(45 47.5 15)"
        />
      </g>
      
      {/* Shield top decoration - small cross */}
      <rect x="30" y="6" width="4" height="6" rx="0.5" fill="url(#goldGrad)" opacity="0.8"/>
    </svg>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen crusader-bg flex items-center justify-center p-4">
        {/* Main Container - Fixed height ~650px, only chat scrolls */}
        <div className="w-full max-w-[700px] h-[650px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gold-500/30"
          style={{
            boxShadow: '0 0 40px rgba(212, 175, 55, 0.15), 0 25px 50px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Header - Fixed ~80px */}
          <header className="flex-shrink-0 bg-gradient-to-b from-[#1a0a0a] to-[#0f0808] border-b border-gold-500/20">
            <div className="px-4 py-3 flex items-center gap-3">
              {/* Logo */}
              <div className="relative">
                <CrusaderLogo className="w-12 h-12" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gold-500 rounded-full border border-[#450a0a] animate-pulse"
                  style={{ boxShadow: '0 0 8px #d4af37' }}
                />
              </div>
              
              {/* Title and Purpose */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="gold-gradient-text">CRUSADER</span>
                </h1>
                <p className="text-[10px] text-gold-400/70 font-medium tracking-wide uppercase truncate">
                  Christian AI Assistant
                </p>
                <p className="text-[9px] text-gold-300/50 mt-0.5 truncate hidden sm:block">
                  To bring the love and truth of Christ to everyone through AI
                </p>
              </div>
              
              {/* Decorative cross accent */}
              <div className="hidden sm:flex items-center gap-1 text-gold-500/30">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <rect x="10" y="2" width="4" height="20" rx="1" />
                  <rect x="3" y="9" width="18" height="4" rx="1" />
                </svg>
              </div>
            </div>
          </header>

          {/* Main Content - Chat takes remaining space, scrolls internally */}
          <main className="flex-1 overflow-hidden min-h-0">
            <ChatInterface />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
