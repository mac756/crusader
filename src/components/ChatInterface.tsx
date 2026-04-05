import { useState, useRef, useEffect } from 'react'
import { Send, Moon, BookOpen, Sword, Sparkles, Mic, MicOff, Search, Wifi, WifiOff, Brain, Quote } from 'lucide-react'
import MessageBubble from './MessageBubble'
import ScriptureLookup from './ScriptureLookup'
import DebateMode from './DebateMode'
import DailyDevotional from './DailyDevotional'
import ThoughtsPanel from './ThoughtsPanel'
import { useChat } from '../hooks/useChat'

interface ChatInterfaceProps {
  darkMode: boolean
}

type Mode = 'chat' | 'scripture' | 'debate' | 'devotional'

const API_URL = 'https://suppliers-arabic-cal-integer.trycloudflare.com'

// Bible verses to display while thinking
const THINKING_VERSES = [
  { verse: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
  { verse: "I can do all this through him who gives me strength.", reference: "Philippians 4:13" },
  { verse: "For God so loved the world that he gave his one and only Son...", reference: "John 3:16" },
  { verse: "The Lord is my shepherd, I lack nothing.", reference: "Psalm 23:1" },
  { verse: "Be strong and courageous. Do not be afraid... for the Lord your God goes with you.", reference: "Deuteronomy 31:6" },
  { verse: "And we know that in all things God works for the good of those who love him.", reference: "Romans 8:28" },
  { verse: "Your word is a lamp for my feet, a light on my path.", reference: "Psalm 119:105" },
  { verse: "The LORD bless you and keep you; the LORD make his face shine on you.", reference: "Numbers 6:24-25" },
  { verse: "Peace I leave with you; my peace I give you. I do not give to you as the world gives.", reference: "John 14:27" },
  { verse: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7" },
  { verse: "Therefore do not worry about tomorrow, for tomorrow will worry about itself.", reference: "Matthew 6:34" },
  { verse: "But seek first his kingdom and his righteousness, and all these things will be given to you.", reference: "Matthew 6:33" },
]

export default function ChatInterface({ darkMode }: ChatInterfaceProps) {
  const [mode, setMode] = useState<Mode>('chat')
  const [input, setInput] = useState('')
  const [localDarkMode, setLocalDarkMode] = useState(darkMode)
  const [isRecording, setIsRecording] = useState(false)
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [showThoughts, setShowThoughts] = useState(false)
  const [isSpeakingEspeak, setIsSpeakingEspeak] = useState(false)
  const [currentThinkingVerse, setCurrentThinkingVerse] = useState(THINKING_VERSES[0])
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { messages, isLoading, sendMessage, clearMessages } = useChat()

  // Check API connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        setIsConnected(res.ok);
        setConnectionError(null);
      } catch {
        setIsConnected(false);
        setConnectionError('AI server not connected. Run: npm run server');
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync with parent dark mode
  useEffect(() => {
    setLocalDarkMode(darkMode)
  }, [darkMode])

  // Cycle through bible verses while thinking
  useEffect(() => {
    if (isLoading || isAILoading) {
      const interval = setInterval(() => {
        setCurrentThinkingVerse(prev => {
          const currentIndex = THINKING_VERSES.findIndex(v => v.reference === prev.reference)
          const nextIndex = (currentIndex + 1) % THINKING_VERSES.length
          return THINKING_VERSES[nextIndex]
        })
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isLoading, isAILoading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsAILoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const response = await fetch(`${API_URL}/transcribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: base64, filename: 'recording.webm' })
        });
        const data = await response.json();
        if (data.transcript) {
          setInput(prev => prev + (prev ? ' ' : '') + data.transcript);
        } else {
          alert('Could not understand audio. Please try again.');
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Transcription error:', err);
      alert('Transcription failed. Please try again.');
    } finally {
      setIsAILoading(false);
    }
  };

  // espeak-ng TTS
  const speakWithEspeak = async (text: string) => {
    if (isSpeakingEspeak) return;
    setIsSpeakingEspeak(true);
    try {
      const response = await fetch(`${API_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) throw new Error('TTS failed');
      
      const audioBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioData = await audioContext.decodeAudioData(audioBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioData;
      source.connect(audioContext.destination);
      source.onended = () => setIsSpeakingEspeak(false);
      source.start(0);
    } catch (err) {
      console.error('espeak-ng TTS error:', err);
      setIsSpeakingEspeak(false);
    }
  };

  // API call for chat
  const callAPI = async (content: string, chatMode: string) => {
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content, 
          mode: chatMode,
          conversationHistory: history,
          search: isWebSearchEnabled
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.response;
    } catch (err) {
      console.error('API call failed:', err);
      throw err;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isAILoading) return
    const userMessage = input.trim()
    const currentMode = mode
    
    // Add user message
    setInput('')
    await sendMessage(userMessage, currentMode, callAPI)
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
      search: 'Search the web for current Christian events and news.',
    }
    if (actions[action]) {
      setInput(actions[action])
    }
  }

  const handleSpeak = (text: string) => {
    speakWithEspeak(text)
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
    devotional: {
      icon: Sparkles,
      label: 'Devotional',
      description: 'Daily verse with devotional commentary',
    },
  }

  const isThinking = isLoading || isAILoading

  // Check if we have thoughts to show in desktop panel
  const hasThoughts = messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].thoughts

  return (
    <div className={`flex flex-col lg:flex-row h-chat-container rounded-2xl overflow-hidden shadow-2xl chat-container gap-0 ${localDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
      {/* Mode Tabs */}
      <div className={`flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-b ${localDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-crusader-50 border-crusader-200'}`}>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`md:hidden p-2 rounded-lg touch-target transition-colors ${localDarkMode ? 'bg-gray-700 text-white' : 'bg-crusader-100 text-crusader-700'}`}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            {showMobileMenu ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mode Tabs - Desktop: inline, Mobile: dropdown */}
        <div className={`md:flex md:items-center md:gap-2 ${showMobileMenu ? 'absolute z-50 top-full left-0 right-0 flex-col gap-2 p-4 shadow-lg rounded-b-xl border-t' : 'hidden'} ${localDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-crusader-50 border-crusader-200'} md:relative md:flex-row md:p-0 md:shadow-none md:border-0`}>
          {(Object.keys(modeConfig) as Mode[]).map((m) => {
            const Icon = modeConfig[m].icon
            return (
              <button
                key={m}
                onClick={() => { setMode(m); setShowMobileMenu(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all touch-target mode-button ${
                  mode === m
                    ? 'bg-crusader-700 text-white shadow-md'
                    : localDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-crusader-700 hover:bg-crusader-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{modeConfig[m].label}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Thoughts Toggle */}
          <button
            onClick={() => setShowThoughts(!showThoughts)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showThoughts
                ? 'bg-purple-600 text-white'
                : localDarkMode
                ? 'bg-gray-700 text-gray-400'
                : 'bg-crusader-100 text-crusader-600'
            }`}
            title={showThoughts ? 'Hide AI Thoughts' : 'Show AI Thoughts'}
          >
            <Brain className="w-3 h-3" />
            <span className="hidden md:inline">Thoughts</span>
          </button>
          
          {/* Connection Status */}
          <button
            onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isWebSearchEnabled
                ? 'bg-green-600 text-white'
                : localDarkMode
                ? 'bg-gray-700 text-gray-400'
                : 'bg-crusader-100 text-crusader-600'
            }`}
            title={isWebSearchEnabled ? 'Web Search ON' : 'Web Search OFF'}
          >
            <Search className="w-3 h-3" />
            <span className="hidden md:inline">Web</span>
          </button>
          
          {/* Connection Indicator */}
          <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs ${
            isConnected 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden md:inline">{isConnected ? 'AI' : 'Local'}</span>
          </div>
          
          <button
            onClick={() => setLocalDarkMode(!localDarkMode)}
            className={`p-2 rounded-lg transition-colors ${localDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-crusader-100 text-crusader-700'}`}
            aria-label="Toggle dark mode"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={clearMessages}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${localDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-crusader-100 text-crusader-700 hover:bg-crusader-200'}`}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 message-container ${localDarkMode ? 'bg-gray-800' : 'bg-crusader-50/50'}`}>
        {connectionError && (
          <div className={`text-center py-3 px-4 rounded-lg text-sm ${localDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'}`}>
            {connectionError}
          </div>
        )}
        
        {mode === 'devotional' ? (
          <DailyDevotional darkMode={localDarkMode} onSpeak={handleSpeak} />
        ) : messages.length === 0 ? (
          <div className="text-center py-12 animate-fadeIn">
            {/* Welcome Logo */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-crusader-600 to-crusader-800 flex items-center justify-center shadow-lg border-2 border-gold-500/30">
              <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
                <path d="M32 8L12 16V32C12 44 32 56 32 56C32 56 52 44 52 32V16L32 8Z" fill="url(#welcomeGrad)" stroke="#d4af37" strokeWidth="2"/>
                <rect x="28" y="22" width="8" height="24" rx="1" fill="#d4af37"/>
                <rect x="22" y="28" width="20" height="8" rx="1" fill="#d4af37"/>
                <defs>
                  <linearGradient id="welcomeGrad" x1="32" y1="8" x2="32" y2="56">
                    <stop stopColor="#991b1b"/>
                    <stop offset="1" stopColor="#7f1d1d"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <h2 className={`text-2xl font-bold mb-2 ${localDarkMode ? 'text-white' : 'text-crusader-900'}`}>
              Welcome to <span className="gold-gradient-text">Crusader</span>
            </h2>
            <p className={`text-sm mb-2 max-w-md mx-auto ${localDarkMode ? 'text-gray-400' : 'text-crusader-600'}`}>
              {modeConfig[mode].description}
            </p>
            {isWebSearchEnabled && (
              <p className={`text-xs mb-4 max-w-md mx-auto ${localDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                Web search enabled - AI will search for current information
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {mode === 'chat' && (
                <>
                  <button onClick={() => handleQuickAction('verse')} className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-full text-sm hover:shadow-lg hover:scale-105 transition-all">
                    Daily Verse
                  </button>
                  <button onClick={() => handleQuickAction('news')} className="px-4 py-2 bg-gradient-to-r from-crusader-600 to-crusader-700 text-white rounded-full text-sm hover:shadow-lg hover:scale-105 transition-all">
                    Christian News
                  </button>
                  <button onClick={() => handleQuickAction('explain')} className="px-4 py-2 bg-gradient-to-r from-crusader-600 to-crusader-700 text-white rounded-full text-sm hover:shadow-lg hover:scale-105 transition-all">
                    Explain Gospel
                  </button>
                </>
              )}
              {mode === 'scripture' && (
                <>
                  <button onClick={() => setInput('John 3:16')} className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-full text-sm hover:shadow-lg hover:scale-105 transition-all">
                    John 3:16
                  </button>
                  <button onClick={() => setInput('Psalm 23')} className="px-4 py-2 bg-gradient-to-r from-crusader-600 to-crusader-700 text-white rounded-full text-sm hover:shadow-lg hover:scale-105 transition-all">
                    Psalm 23
                  </button>
                  <button onClick={() => setInput('Romans 8:28')} className="px-4 py-2 bg-gradient-to-r from-crusader-600 to-crusader-700 text-white rounded-full text-sm hover:shadow-lg hover:scale-105 transition-all">
                    Romans 8:28
                  </button>
                </>
              )}
              {mode === 'debate' && (
                <>
                  <button onClick={() => setInput('How do you respond to the problem of evil?')} className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-full text-sm hover:shadow-lg hover:scale-105 transition-all">
                    Problem of Evil
                  </button>
                  <button onClick={() => setInput('Why does God allow suffering?')} className="px-4 py-2 bg-gradient-to-r from-crusader-600 to-crusader-700 text-white rounded-full text-sm hover:shadow-lg hover:scale-105 transition-all">
                    Why Suffering?
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
        
        {messages.map((message, index) => (
          <div key={index}>
            <MessageBubble 
              message={message} 
              darkMode={localDarkMode} 
              onSpeak={message.role === 'user' ? undefined : handleSpeak}
            />
            {/* Show thoughts panel for the last assistant message - hidden on desktop lg+ */}
            {message.role === 'assistant' && index === messages.length - 1 && message.thoughts && (
              <div className="mt-2 lg:hidden">
                <ThoughtsPanel
                  darkMode={localDarkMode}
                  isVisible={showThoughts}
                  onToggle={() => setShowThoughts(!showThoughts)}
                  thoughts={message.thoughts}
                />
              </div>
            )}
          </div>
        ))}
        
        {/* Thinking Banner with Bible Verse */}
        {isThinking && (
          <div className="thinking-banner rounded-2xl p-4 animate-slideUp">
            <div className="flex items-start gap-3">
              {/* Animated Cross/Sword Icon */}
              <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 border border-gold-500/40">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-gold-400 animate-pulse" fill="currentColor">
                  <rect x="10" y="2" width="4" height="20" rx="1" />
                  <rect x="3" y="9" width="18" height="4" rx="1" />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Thinking Label */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gold-400 rounded-full typing-dot"></span>
                    <span className="w-2 h-2 bg-gold-400 rounded-full typing-dot"></span>
                    <span className="w-2 h-2 bg-gold-400 rounded-full typing-dot"></span>
                  </div>
                  <span className="text-gold-200 text-sm font-medium">
                    {isAILoading ? 'Transcribing...' : 'Crusader is seeking wisdom...'}
                  </span>
                </div>
                
                {/* Bible Verse Card */}
                <div className="bible-verse-card rounded-xl p-4 relative overflow-hidden">
                  {/* Quote Icon */}
                  <div className="absolute top-2 right-2 opacity-10">
                    <Quote className="w-8 h-8 text-gold-500" />
                  </div>
                  
                  <p className="text-gold-100/90 text-sm italic leading-relaxed mb-2 font-serif">
                    "{currentThinkingVerse.verse}"
                  </p>
                  <p className="text-gold-400/80 text-xs font-semibold tracking-wider">
                    — {currentThinkingVerse.reference}
                  </p>
                </div>
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
      {mode !== 'devotional' && (
        <div className={`p-3 sm:p-4 border-t ${localDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-crusader-200'}`}>
          <div className={`flex items-end gap-2 sm:gap-3 p-3 sm:p-4 lg:p-5 rounded-2xl ${localDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-crusader-50 border border-crusader-200'}`}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask Crusader about ${mode === 'scripture' ? 'scripture' : mode === 'debate' ? 'theology and debate' : 'Christianity'}...`}
              className={`flex-1 resize-none bg-transparent border-none outline-none text-base sm:text-lg lg:text-xl input-area ${localDarkMode ? 'text-white placeholder-gray-500' : 'text-crusader-900 placeholder-crusader-400'}`}
              rows={1}
              disabled={isLoading || isAILoading}
            />

            {/* Voice Input Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading || isAILoading}
              className={`p-3 sm:p-4 lg:p-4 rounded-full transition-all touch-target ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : localDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-crusader-100 text-crusader-600 hover:bg-crusader-200'
              } ${(isLoading || isAILoading) ? 'opacity-50' : ''}`}
              aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
              title={isRecording ? 'Stop recording' : 'Voice input'}
            >
              {isRecording ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />}
            </button>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isAILoading}
              className={`p-3 sm:p-4 lg:p-5 rounded-full transition-all touch-target ${
                input.trim() && !isLoading && !isAILoading
                  ? 'bg-gradient-to-r from-crusader-600 to-crusader-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : localDarkMode
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-crusader-200 text-crusader-400'
              }`}
              aria-label="Send message"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
            </button>
          </div>
          <p className={`text-xs sm:text-sm lg:text-base text-center mt-2 ${localDarkMode ? 'text-gray-500' : 'text-crusader-400'}`}>
            {isRecording ? 'Recording... Click mic to stop' : 'Press Enter to send • Click mic for voice • God bless!'}
          </p>
        </div>
      )}
      </div>

      {/* Desktop Thoughts Panel - Side by Side on lg+ */}
      {hasThoughts && (
        <div className="hidden lg:flex lg:w-96 xl:w-[420px] flex-col border-l border-gray-700 bg-gray-900">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-gold-400 font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Thoughts
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-sm text-gray-300">
              <pre className="whitespace-pre-wrap font-sans leading-relaxed">{messages[messages.length - 1].thoughts}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
