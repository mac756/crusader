import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Cross, Moon, Sun } from 'lucide-react'
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

function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-primary-900 to-primary-800'}`}>
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-primary-900/90'} backdrop-blur-sm border-b border-gold-500/20 sticky top-0 z-50`}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
              <Cross className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Crusader</h1>
              <p className="text-xs text-gold-300">Christian AI Assistant</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-primary-800 text-gold-300'}`}
                aria-label="Toggle dark mode"
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
        <footer className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-primary-900/80 border-gold-500/10'} border-t py-3`}>
          <p className="text-center text-sm text-primary-300">
            Built for His glory • God bless!
          </p>
        </footer>
      </div>
    </QueryClientProvider>
  )
}

export default App
