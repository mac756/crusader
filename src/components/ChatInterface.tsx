import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Wifi, WifiOff, MessageSquare, GraduationCap, BookOpen } from 'lucide-react'
import MessageBubble from './MessageBubble'
import { useChat } from '../hooks/useChat'

const API_URL = 'http://localhost:3001'

// Mode types per SPEC
type Mode = 'debator' | 'instructor' | 'reader'

// Bible verses for thinking indicator
const THINKING_VERSES = [
  { verse: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
  { verse: "I can do all this through him who gives me strength.", reference: "Philippians 4:13" },
  { verse: "For God so loved the world that he gave his one and only Son...", reference: "John 3:16" },
  { verse: "The Lord is my shepherd, I lack nothing.", reference: "Psalm 23:1" },
  { verse: "Be strong and courageous. Do not be afraid...", reference: "Deuteronomy 31:6" },
  { verse: "And we know that in all things God works for the good of those who love him.", reference: "Romans 8:28" },
  { verse: "Your word is a lamp for my feet, a light on my path.", reference: "Psalm 119:105" },
  { verse: "Peace I leave with you; my peace I give you.", reference: "John 14:27" },
  { verse: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7" },
  { verse: "But seek first his kingdom and his righteousness...", reference: "Matthew 6:33" },
]

const MODE_CONFIG = {
  debator: {
    icon: MessageSquare,
    label: 'DEBATOR',
    description: 'Defends Christianity, answers objections with Scripture',
    placeholder: 'Ask a question about faith or share an objection...',
  },
  instructor: {
    icon: GraduationCap,
    label: 'INSTRUCTOR', 
    description: 'Gentle teaching, devotionals, guidance on Christian living',
    placeholder: 'Ask for teaching, devotional help, or prayer guidance...',
  },
  reader: {
    icon: BookOpen,
    label: 'READER',
    description: 'Bible lookup, verse-by-verse study, cross-references',
    placeholder: 'Enter a Bible verse or reference (e.g., John 3:16)...',
  },
}

export default function ChatInterface() {
  const [mode, setMode] = useState<Mode>('debator')
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentThinkingVerse, setCurrentThinkingVerse] = useState(THINKING_VERSES[0])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { messages, sendMessage } = useChat()

  // Check API connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        setIsConnected(res.ok);
      } catch {
        setIsConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through verses while thinking
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentThinkingVerse(prev => {
          const idx = THINKING_VERSES.findIndex(v => v.reference === prev.reference)
          return THINKING_VERSES[(idx + 1) % THINKING_VERSES.length]
        })
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isLoading])

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
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsLoading(true);
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
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const callAPI = async (content: string, chatMode: string) => {
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content, mode: chatMode, conversationHistory: history })
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.response;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userMessage = input.trim()
    setInput('')
    await sendMessage(userMessage, mode, callAPI)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (action: string) => {
    const actions: Record<string, string> = {
      verse: 'Share a meaningful Bible verse for today.',
      prayer: 'Share a short prayer for the day.',
      explain: 'Explain the Gospel in simple terms.',
      evil: 'How do you respond to the problem of evil?',
      suffering: 'Why does God allow suffering?',
    }
    if (actions[action]) setInput(actions[action])
  }

  const isThinking = isLoading

  return (
    <div className="flex flex-col h-full">
      {/* Mode Tabs - Fixed ~50px */}
      <div className="flex-shrink-0 bg-[#0f0808] border-b border-gold-500/20">
        <div className="flex">
          {(Object.keys(MODE_CONFIG) as Mode[]).map((m) => {
            const ModeIcon = MODE_CONFIG[m].icon
            const isActive = mode === m
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold tracking-wide transition-all duration-300 border-b-2 ${
                  isActive
                    ? 'bg-gradient-to-b from-[#1a0a0a] to-[#0f0808] text-gold-400 border-gold-500'
                    : 'text-gold-500/50 border-transparent hover:bg-[#1a0a0a]/50 hover:text-gold-400/70'
                }`}
                style={isActive ? { boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)' } : {}}
              >
                <ModeIcon className="w-4 h-4" />
                <span>{MODE_CONFIG[m].label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat Messages - Scrollable, flex-1 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0f0f0f] to-[#141414] scrollable-chat">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
            {/* Welcome Logo */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#7f1d1d] to-[#450a0a] flex items-center justify-center border border-gold-500/30"
              style={{ boxShadow: '0 0 20px rgba(212, 175, 55, 0.15)' }}
            >
              <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none">
                <path d="M32 8L12 16V32C12 44 32 56 32 56C32 56 52 44 52 32V16L32 8Z" fill="#991b1b" stroke="#d4af37" strokeWidth="2"/>
                <rect x="28" y="22" width="8" height="24" rx="1" fill="#d4af37"/>
                <rect x="22" y="28" width="20" height="8" rx="1" fill="#d4af37"/>
              </svg>
            </div>
            
            <h2 className="text-lg font-bold text-white mb-1">
              Welcome to <span className="gold-gradient-text">Crusader</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4 max-w-xs">
              {MODE_CONFIG[mode].description}
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-2">
              {mode === 'debator' && (
                <>
                  <button onClick={() => handleQuickAction('evil')} className="px-3 py-1.5 bg-[#991b1b] text-gold-300 rounded-full text-xs hover:bg-[#7f1d1d] transition-all border border-gold-500/20">
                    Problem of Evil
                  </button>
                  <button onClick={() => handleQuickAction('suffering')} className="px-3 py-1.5 bg-[#991b1b] text-gold-300 rounded-full text-xs hover:bg-[#7f1d1d] transition-all border border-gold-500/20">
                    Why Suffering?
                  </button>
                </>
              )}
              {mode === 'instructor' && (
                <>
                  <button onClick={() => handleQuickAction('verse')} className="px-3 py-1.5 bg-[#991b1b] text-gold-300 rounded-full text-xs hover:bg-[#7f1d1d] transition-all border border-gold-500/20">
                    Daily Verse
                  </button>
                  <button onClick={() => handleQuickAction('prayer')} className="px-3 py-1.5 bg-[#991b1b] text-gold-300 rounded-full text-xs hover:bg-[#7f1d1d] transition-all border border-gold-500/20">
                    Prayer Help
                  </button>
                  <button onClick={() => handleQuickAction('explain')} className="px-3 py-1.5 bg-[#991b1b] text-gold-300 rounded-full text-xs hover:bg-[#7f1d1d] transition-all border border-gold-500/20">
                    Explain Gospel
                  </button>
                </>
              )}
              {mode === 'reader' && (
                <>
                  <button onClick={() => setInput('John 3:16')} className="px-3 py-1.5 bg-[#991b1b] text-gold-300 rounded-full text-xs hover:bg-[#7f1d1d] transition-all border border-gold-500/20">
                    John 3:16
                  </button>
                  <button onClick={() => setInput('Psalm 23')} className="px-3 py-1.5 bg-[#991b1b] text-gold-300 rounded-full text-xs hover:bg-[#7f1d1d] transition-all border border-gold-500/20">
                    Psalm 23
                  </button>
                  <button onClick={() => setInput('Romans 8:28')} className="px-3 py-1.5 bg-[#991b1b] text-gold-300 rounded-full text-xs hover:bg-[#7f1d1d] transition-all border border-gold-500/20">
                    Romans 8:28
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={index} message={message} darkMode={true} />
          ))
        )}
        
        {/* Thinking Indicator with Bible Verse */}
        {isThinking && (
          <div className="thinking-banner rounded-2xl p-4 animate-slideUp">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 border border-gold-500/40"
                style={{ boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)' }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-gold-400 animate-pulse" fill="currentColor">
                  <rect x="10" y="2" width="4" height="20" rx="1" />
                  <rect x="3" y="9" width="18" height="4" rx="1" />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gold-400 rounded-full typing-dot"></span>
                    <span className="w-2 h-2 bg-gold-400 rounded-full typing-dot"></span>
                    <span className="w-2 h-2 bg-gold-400 rounded-full typing-dot"></span>
                  </div>
                  <span className="text-gold-200 text-sm font-medium">
                    Crusader is seeking wisdom...
                  </span>
                </div>
                
                <div className="bible-verse-card rounded-xl p-3 relative overflow-hidden">
                  <div className="absolute top-1 right-1 opacity-10">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-gold-500" fill="currentColor">
                      <rect x="10" y="2" width="4" height="20" rx="1" />
                      <rect x="3" y="9" width="18" height="4" rx="1" />
                    </svg>
                  </div>
                  <p className="text-gold-100/90 text-xs italic leading-relaxed mb-1 font-serif">
                    "{currentThinkingVerse.verse}"
                  </p>
                  <p className="text-gold-400/80 text-[10px] font-semibold tracking-wider">
                    — {currentThinkingVerse.reference}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed ~80px */}
      <div className="flex-shrink-0 p-3 bg-[#0a0505] border-t border-gold-500/20">
        <div className="flex items-end gap-2 p-2 rounded-xl bg-[#1a1a1a] border border-gold-500/20">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={MODE_CONFIG[mode].placeholder}
            className="flex-1 resize-none bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
            rows={1}
            disabled={isLoading}
          />
          
          {/* Voice Input */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`p-2 rounded-full transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]'
            } ${isLoading ? 'opacity-50' : ''}`}
            title={isRecording ? 'Stop recording' : 'Voice input'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          
          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-full transition-all ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white'
                : 'bg-[#2a2a2a] text-gray-500'
            }`}
            style={input.trim() && !isLoading ? { boxShadow: '0 0 15px rgba(153, 27, 27, 0.4)' } : {}}
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Status Bar */}
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[9px] text-gray-500">Press Enter to send</span>
          <div className={`flex items-center gap-1 text-[9px] ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isConnected ? 'AI Connected' : 'Local Mode'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
