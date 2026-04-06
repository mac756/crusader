import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Wifi, WifiOff, Moon, Sun } from 'lucide-react'
import MessageBubble from './MessageBubble'
import { useChat } from '../hooks/useChat'

interface ChatInterfaceProps {
  darkMode: boolean
}

type Mode = 'chat' | 'scripture' | 'debate' | 'devotional'

const API_URL = import.meta.env.VITE_API_URL || ''

const THINKING_VERSES = [
  { verse: "Trust in the Lord with all your heart.", reference: "Proverbs 3:5" },
  { verse: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
  { verse: "For God so loved the world...", reference: "John 3:16" },
  { verse: "The Lord is my shepherd, I lack nothing.", reference: "Psalm 23:1" },
]

export default function ChatInterface({ darkMode }: ChatInterfaceProps) {
  const [mode, setMode] = useState<Mode>('chat')
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)
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

  // Cycle through verses while thinking
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

  const callAPI = async (content: string, chatMode: string) => {
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content, mode: chatMode, conversationHistory: history })
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

  const isThinking = isLoading || isAILoading

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Main Chat Panel */}
      <div className={`w-full max-w-2xl h-[90vh] max-h-[800px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${darkMode ? 'bg-red-900 border-gray-700' : 'bg-red-600 border-red-700'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-lg">✝</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Crusader AI</h1>
              <p className="text-red-200 text-xs">Christian Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              isConnected ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
            }`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isConnected ? 'Connected' : 'Offline'}</span>
            </div>
            {/* Dark Mode Toggle */}
            <button
              onClick={() => {}}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className={`flex items-center gap-1 px-4 py-2 border-b ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          {(['chat', 'scripture', 'debate', 'devotional'] as Mode[]).map((m) => {
            const labels: Record<Mode, string> = { chat: 'Chat', scripture: 'Scripture', debate: 'Debate', devotional: 'Devotional' }
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-red-600 text-white shadow-md'
                    : darkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {labels[m]}
              </button>
            )
          })}
          <div className="ml-auto">
            <button
              onClick={clearMessages}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Clear Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {messages.length === 0 && !isThinking && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className={`w-16 h-16 rounded-2xl ${darkMode ? 'bg-red-900/50' : 'bg-red-100'} flex items-center justify-center mb-4`}>
                <span className={`text-3xl ${darkMode ? 'text-red-400' : 'text-red-600'}`}>✝</span>
              </div>
              <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Welcome to Crusader AI
              </h2>
              <p className={`text-sm mb-6 max-w-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Your Christian AI Assistant. Ask anything about faith, scripture, or theology.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button 
                  onClick={() => setInput('Share a Bible verse')} 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Bible Verse
                </button>
                <button 
                  onClick={() => setInput('Explain the Gospel')} 
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Explain Gospel
                </button>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} darkMode={darkMode} />
          ))}
          
          {/* Thinking Indicator */}
          {isThinking && (
            <div className={`flex items-start gap-3 p-4 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-red-600' : 'bg-red-500'}`}>
                <span className="text-white text-sm">✝</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full typing-dot"></span>
                  <span className="w-2 h-2 bg-red-500 rounded-full typing-dot"></span>
                  <span className="w-2 h-2 bg-red-500 rounded-full typing-dot"></span>
                </div>
                <p className={`text-sm italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  "{currentThinkingVerse.verse}" — {currentThinkingVerse.reference}
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300 focus-within:border-red-500'}`}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Crusader..."
              className={`flex-1 resize-none bg-transparent border-none outline-none text-sm ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-800 placeholder-gray-400'}`}
              rows={1}
              disabled={isLoading || isAILoading}
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading || isAILoading}
              className={`p-2 rounded-lg transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : darkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isAILoading}
              className={`p-2.5 rounded-lg transition-colors ${input.trim() && !isLoading && !isAILoading ? 'bg-red-600 text-white hover:bg-red-700' : darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className={`text-xs text-center mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Press Enter to send • God bless!
          </p>
        </div>
      </div>
    </div>
  )
}
