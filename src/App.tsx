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

// Simple Cross Logo
function CrossLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="17" y="6" width="6" height="28" rx="1" fill="#991b1b"/>
      <rect x="10" y="14" width="20" height="6" rx="1" fill="#991b1b"/>
    </svg>
  )
}

function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Compact Header */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-b border-gray-200'} px-4 py-3`}>
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <CrossLogo />
            <div>
              <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <span className={darkMode ? 'text-red-400' : 'text-red-600'}>CRUSADER</span>
              </h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Fits on one screen */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4">
          <ChatInterface darkMode={darkMode} />
        </main>

        {/* Simple Footer */}
        <footer className={`${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-t border-gray-200 text-gray-500'} py-3`}>
          <div className="max-w-4xl mx-auto px-4 text-center text-sm">
            Built for His glory • God bless!
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  )
}

export default App
