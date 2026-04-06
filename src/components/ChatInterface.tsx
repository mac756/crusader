import { useState, useRef, useEffect } from 'react'
import { Send, BookOpen, Sparkles, Mic, MicOff, Wifi, WifiOff } from 'lucide-react'
import MessageBubble from './MessageBubble'
import DailyDevotional from './DailyDevotional'
import { useChat } from '../hooks/useChat'

interface ChatInterfaceProps {
  darkMode: boolean
}

type Mode = 'chat' | 'scripture' | 'debate' | 'devotional'

const API_URL = import.meta.env.VITE_API_URL || ''

// Bible verses to display while thinking
const THINKING_VERSES = [
  { verse: "Trust in the Lord with all your heart.", reference: "Proverbs 3:5" },
  { verse: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
  { verse: "For God so loved the world...", reference: "John 3:16" },
  { verse: "The Lord is my shepherd, I lack nothing.", reference: "Psalm 23:1" },
  { verse: "Be strong and courageous. Do not be afraid.", reference: "Deuteronomy 31:6" },
  { verse: "And we know that in all things God works for good.", reference: "Romans 8:28" },
]

export default function ChatInterface({ darkMode }: ChatInterfaceProps) {
  const [mode, setMode] = useState<Mode>('chat')
  const [input, setInput] = useState('')
  const [localDarkMode, setLocalDarkMode] = useState(darkMode)
  const [isRecording, setIsRecording] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)
  const [showThoughts, setShowThoughts] = useState(false)
  const [currentThinkingVerse, setCurrentThinkingVerse] = useState(THINKING_VERSES[0])
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
      } catch {
        setIsConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [])

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
      console.error('Error starting recording:', err);
      alert('Could not access microphone.');
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
        const response = await fetch(`${API_URL}/api/transcribe`, {
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
      setIsAILoading(false);
    }
  };

  // API call for chat
  const callAPI = async (content: string, chatMode: string) => {
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: content, 
        mode: chatMode,
        conversationHistory: history
      })
    });
    const data = await response.json();
    return data.response;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isAILoading) return
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

  const handleQuickAction = async (action: string) => {
    const actions: Record<string, string> = {
      verse: 'Share a meaningful Bible verse for today.',
      prayer: 'Share a short prayer for the day.',
      explain: 'Explain the Gospel in simple terms.',
    }
    if (actions[action]) setInput(actions[action])
  }

  const isThinking = isLoading || isAILoading

  return (
    <div className={`flex flex-col h-chat-container rounded-xl overflow-hidden shadow-lg chat-container ${localDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
      {/* Mode Tabs */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${localDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-1">
          {(['chat', 'scripture', 'debate', 'devotional'] as Mode[]).map((m) => {
            const icons: Record<Mode, any> = { chat: Sparkles, scripture: BookOpen, debate: Sparkles, devotional: Sparkles }
            const labels: Record<Mode, string> = { chat: 'Chat', scripture: 'Scripture', debate: 'Debate', devotional: 'Devo' }
            const Icon = icons[m]
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-red-600 text-white'
                    : localDarkMode
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{labels[m]}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThoughts(!showThoughts)}
            className={`px-2 py-1 rounded-lg text-xs font-medium ${
              showThoughts ? 'bg-purple-600 text-white' : localDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}
          >
            AI Thoughts
          </button>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          </div>
          <button
            onClick={clearMessages}
            className={`px-2 py-1 rounded-lg text-xs font-medium ${localDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-3 space-y-3 ${localDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {mode === 'devotional' ? (
          <DailyDevotional darkMode={localDarkMode} onSpeak={() => {}} />
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${localDarkMode ? 'bg-gray-700' : 'bg-red-100'} mb-4`}>
              <span className={`text-2xl ${localDarkMode ? 'text-red-400' : 'text-red-600'}`}>✝</span>
            </div>
            <h2 className={`text-lg font-bold mb-1 ${localDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome to Crusader
            </h2>
            <p className={`text-sm mb-4 ${localDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Your Christian AI Assistant
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {mode === 'chat' && (
                <>
                  <button onClick={() => handleQuickAction('verse')} className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs hover:bg-red-700">
                    Daily Verse
                  </button>
                  <button onClick={() => handleQuickAction('explain')} className="px-3 py-1.5 bg-gray-600 text-white rounded-full text-xs hover:bg-gray-700">
                    Explain Gospel
                  </button>
                </>
              )}
              {mode === 'scripture' && (
                <button onClick={() => setInput('John 3:16')} className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs hover:bg-red-700">
                  John 3:16
                </button>
              )}
            </div>
          </div>
        ) : null}
        
        {messages.map((message, index) => (
          <div key={index}>
            <MessageBubble message={message} darkMode={localDarkMode} />
          </div>
        ))}
        
        {/* Thinking Banner */}
        {isThinking && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-red-600 text-white animate-slideUp">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">✝</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full typing-dot"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full typing-dot"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full typing-dot"></span>
                <span className="text-xs text-red-200 ml-1">Crusader is seeking wisdom...</span>
              </div>
              <p className="text-xs text-red-100 italic">"{currentThinkingVerse.verse}" — {currentThinkingVerse.reference}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {mode !== 'devotional' && (
        <div className={`p-3 border-t ${localDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`flex items-end gap-2 p-3 rounded-xl ${localDarkMode ? 'bg-gray-600' : 'bg-white border border-gray-300'}`}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Crusader..."
              className={`flex-1 resize-none bg-transparent border-none outline-none text-sm ${localDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-400'}`}
              rows={1}
              disabled={isLoading || isAILoading}
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading || isAILoading}
              className={`p-2 rounded-full ${isRecording ? 'bg-red-500 text-white animate-pulse' : localDarkMode ? 'bg-gray-500 text-gray-200' : 'bg-gray-200 text-gray-600'}`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isAILoading}
              className={`p-2 rounded-full ${input.trim() && !isLoading && !isAILoading ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-500'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
