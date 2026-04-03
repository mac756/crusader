import { useState, useRef, useEffect } from 'react'
import { Send, Moon, BookOpen, Sword, Sparkles } from 'lucide-react'
import { Cross } from 'lucide-react'
import MessageBubble from './MessageBubble'
import ScriptureLookup from './ScriptureLookup'
import DebateMode from './DebateMode'
import { useChat } from '../hooks/useChat'

interface ChatInterfaceProps {
  darkMode: boolean
}

type Mode = 'chat' | 'scripture' | 'debate'

export default function ChatInterface({ darkMode }: ChatInterfaceProps) {
  const [mode, setMode] = useState<Mode>('chat')
  const [input, setInput] = useState('')
  const [localDarkMode, setLocalDarkMode] = useState(darkMode)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { messages, isLoading, sendMessage, clearMessages } = useChat()

  // Sync with parent dark mode
  useEffect(() => {
    setLocalDarkMode(darkMode)
  }, [darkMode])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userMessage = input.trim()
    setInput('')
    await sendMessage(userMessage, mode)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = async (action: string) => {
    const actions: Record<string, string> = {
      verse: 'Share a meaningful Bible verse for today.',
      news: 'What are the latest Christian news headlines?',
      prayer: 'Share a short prayer for the day.',
      explain: 'Explain the Gospel in simple terms.',
    }
    if (actions[action]) {
      setInput(actions[action])
    }
  }

  const modeConfig = {
    chat: {
      icon: Sparkles,
      label: 'Chat',
      description: 'Ask questions about faith, theology, and Christian living',
    },
    scripture: {
      icon: BookOpen,
      label: 'Scripture',
      description: 'Look up Bible verses and get interpretations',
    },
    debate: {
      icon: Sword,
      label: 'Debate',
      description: 'Engage in theological debate with apologetics',
    },
  }

  const ActiveIcon = modeConfig[mode].icon

  return (
    <div className={`flex flex-col h-[calc(100vh-180px)] rounded-2xl overflow-hidden shadow-2xl ${localDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Mode Tabs */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${localDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-cream-50 border-cream-200'}`}>
        <div className="flex items-center gap-2">
          {(Object.keys(modeConfig) as Mode[]).map((m) => {
            const Icon = modeConfig[m].icon
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-primary-700 text-white shadow-md'
                    : localDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-primary-700 hover:bg-primary-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{modeConfig[m].label}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocalDarkMode(!localDarkMode)}
            className={`p-2 rounded-lg transition-colors ${localDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-primary-50 text-primary-700'}`}
            aria-label="Toggle dark mode"
          >
            {localDarkMode ? <Moon className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={clearMessages}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${localDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'}`}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${localDarkMode ? 'bg-gray-800' : 'bg-cream-50'}`}>
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <ActiveIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-xl font-bold mb-2 ${localDarkMode ? 'text-white' : 'text-primary-900'}`}>
              Welcome to Crusader
            </h2>
            <p className={`text-sm mb-6 max-w-md mx-auto ${localDarkMode ? 'text-gray-400' : 'text-primary-600'}`}>
              {modeConfig[mode].description}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {mode === 'chat' && (
                <>
                  <button onClick={() => handleQuickAction('verse')} className="px-4 py-2 bg-gold-500 text-white rounded-full text-sm hover:bg-gold-600 transition-colors">
                    Daily Verse
                  </button>
                  <button onClick={() => handleQuickAction('news')} className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm hover:bg-primary-700 transition-colors">
                    Christian News
                  </button>
                  <button onClick={() => handleQuickAction('explain')} className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm hover:bg-primary-700 transition-colors">
                    Explain Gospel
                  </button>
                </>
              )}
              {mode === 'scripture' && (
                <>
                  <button onClick={() => setInput('John 3:16')} className="px-4 py-2 bg-gold-500 text-white rounded-full text-sm hover:bg-gold-600 transition-colors">
                    John 3:16
                  </button>
                  <button onClick={() => setInput('Psalm 23')} className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm hover:bg-primary-700 transition-colors">
                    Psalm 23
                  </button>
                  <button onClick={() => setInput('Romans 8:28')} className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm hover:bg-primary-700 transition-colors">
                    Romans 8:28
                  </button>
                </>
              )}
              {mode === 'debate' && (
                <>
                  <button onClick={() => setInput('How do you respond to the problem of evil?')} className="px-4 py-2 bg-gold-500 text-white rounded-full text-sm hover:bg-gold-600 transition-colors">
                    Problem of Evil
                  </button>
                  <button onClick={() => setInput('Why does God allow suffering?')} className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm hover:bg-primary-700 transition-colors">
                    Why Suffering?
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} darkMode={localDarkMode} />
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <Cross className="w-4 h-4 text-white" />
            </div>
            <div className={`px-4 py-3 rounded-2xl ${localDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} shadow-md`}>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary-500 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-primary-500 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-primary-500 typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scripture Lookup Panel */}
      {mode === 'scripture' && <ScriptureLookup onSelect={(ref) => setInput(ref)} darkMode={localDarkMode} />}

      {/* Debate Mode Panel */}
      {mode === 'debate' && <DebateMode onSelect={(topic) => setInput(topic)} darkMode={localDarkMode} />}

      {/* Input */}
      <div className={`p-4 border-t ${localDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-cream-200'}`}>
        <div className={`flex items-end gap-3 p-3 rounded-2xl ${localDarkMode ? 'bg-gray-800' : 'bg-cream-100'}`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask Crusader anything about ${mode === 'scripture' ? 'scripture' : mode === 'debate' ? 'theology and debate' : 'Christianity'}...`}
            className={`flex-1 resize-none bg-transparent border-none outline-none text-base ${localDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}`}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-full transition-all ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl'
                : localDarkMode
                ? 'bg-gray-700 text-gray-500'
                : 'bg-cream-200 text-gray-400'
            }`}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className={`text-xs text-center mt-2 ${localDarkMode ? 'text-gray-500' : 'text-primary-400'}`}>
          Press Enter to send • God bless!
        </p>
      </div>
    </div>
  )
}
