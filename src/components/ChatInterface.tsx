import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Terminal } from 'lucide-react'
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

  // Terminal-style welcome message for light mode
  const isLightTerminal = !darkMode

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Main Chat Panel */}
      <div className={`w-full max-w-3xl h-[85vh] max-h-[800px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 ${
        isLightTerminal 
          ? 'bg-black border-red-600' // Terminal style: black bg, red border
          : darkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLightTerminal 
            ? 'bg-red-900/80 border-b border-red-700' 
            : darkMode 
              ? 'bg-red-900 border-gray-700' 
              : 'bg-red-600 border-red-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isLightTerminal ? 'bg-black border-2 border-yellow-400' : 'bg-white/20'
            }`}>
              {isLightTerminal ? (
                <Terminal className="w-5 h-5 text-yellow-400" />
              ) : (
                <span className="text-white text-lg">✝</span>
              )}
            </div>
            <div>
              <h1 className={`text-white font-bold text-lg ${isLightTerminal ? 'text-yellow-400 font-mono' : ''}`}>
                {isLightTerminal ? '> CRUSADER_AI' : 'Crusader AI'}
              </h1>
              <p className={`text-xs ${isLightTerminal ? 'text-red-400' : 'text-red-200'}`}>
                {isLightTerminal ? 'ONLINE - God bless!' : 'Christian Assistant'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold ${
              isConnected 
                ? isLightTerminal 
                  ? 'bg-green-500/20 text-green-400 border border-green-500'
                  : 'bg-green-500/20 text-green-200' 
                : isLightTerminal
                  ? 'bg-red-500/20 text-red-400 border border-red-500'
                  : 'bg-red-500/20 text-red-200'
            }`}>
              <span className={isConnected ? 'animate-pulse' : ''}>●</span>
              <span>{isConnected ? 'CONNECTED' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className={`flex items-center gap-1 px-4 py-2 border-b ${
          isLightTerminal 
            ? 'bg-black border-gray-800' 
            : darkMode 
              ? 'bg-gray-750 border-gray-700' 
              : 'bg-gray-50 border-gray-100'
        }`}>
          {(['chat', 'scripture', 'debate', 'devotional'] as Mode[]).map((m) => {
            const labels: Record<Mode, string> = { chat: 'CHAT', scripture: 'SCRIPT', debate: 'DEBATE', devotional: 'DEVO' }
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  mode === m
                    ? isLightTerminal
                      ? 'bg-red-600 text-yellow-400 border border-yellow-400/50'
                      : 'bg-red-600 text-white shadow-md'
                    : isLightTerminal
                      ? 'text-gray-500 hover:text-red-400 hover:bg-gray-900'
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
              className={`px-3 py-1.5 rounded text-xs font-mono ${
                isLightTerminal 
                  ? 'text-gray-500 hover:text-red-400' 
                  : darkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              [CLEAR]
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
          isLightTerminal ? 'bg-black' : darkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          {messages.length === 0 && !isThinking && (
            <div className={`flex flex-col items-center justify-center h-full text-center ${isLightTerminal ? 'font-mono' : ''}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                isLightTerminal 
                  ? 'bg-transparent border-2 border-yellow-400' 
                  : darkMode 
                    ? 'bg-red-900/50 border border-red-500/50' 
                    : 'bg-red-100 border border-red-200'
              }`}>
                <span className={`text-3xl ${isLightTerminal ? 'text-yellow-400' : 'text-red-600'}`}>✝</span>
              </div>
              <h2 className={`text-xl font-bold mb-2 ${isLightTerminal ? 'text-yellow-400 font-mono' : darkMode ? 'text-white' : 'text-gray-800'}`}>
                {isLightTerminal ? '> WELCOME TO CRUSADER_AI' : 'Welcome to Crusader AI'}
              </h2>
              <p className={`text-sm mb-6 max-w-sm ${isLightTerminal ? 'text-green-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isLightTerminal 
                  ? '# Your Christian AI Terminal\n# Type a message to begin...'
                  : 'Your Christian AI Assistant. Ask anything about faith, scripture, or theology.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button 
                  onClick={() => setInput('Share a Bible verse')} 
                  className={`px-4 py-2 rounded-lg text-sm font-mono font-bold transition-colors ${
                    isLightTerminal
                      ? 'bg-transparent border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isLightTerminal ? '$ bible --verse' : 'Bible Verse'}
                </button>
                <button 
                  onClick={() => setInput('Explain the Gospel')} 
                  className={`px-4 py-2 rounded-lg text-sm font-mono transition-colors ${
                    isLightTerminal
                      ? 'bg-transparent border border-green-400 text-green-400 hover:bg-green-400/10'
                      : darkMode 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isLightTerminal ? '$ gospel --explain' : 'Explain Gospel'}
                </button>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} darkMode={darkMode} isLightTerminal={isLightTerminal} />
          ))}
          
          {/* Thinking Indicator */}
          {isThinking && (
            <div className={`flex items-start gap-3 p-4 rounded-xl ${
              isLightTerminal 
                ? 'bg-black border border-red-500/50' 
                : darkMode 
                  ? 'bg-gray-700' 
                  : 'bg-white border border-gray-200'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isLightTerminal ? 'bg-red-900 border border-red-400' : darkMode ? 'bg-red-600' : 'bg-red-500'
              }`}>
                <span className="text-white text-sm">✝</span>
              </div>
              <div className="flex-1">
                <div className={`flex items-center gap-1.5 mb-2 ${isLightTerminal ? 'font-mono text-yellow-400' : ''}`}>
                  <span className={`w-2 h-2 rounded-full ${isLightTerminal ? 'bg-yellow-400' : 'bg-red-500'} typing-dot`}></span>
                  <span className={`w-2 h-2 rounded-full ${isLightTerminal ? 'bg-yellow-400' : 'bg-red-500'} typing-dot`}></span>
                  <span className={`w-2 h-2 rounded-full ${isLightTerminal ? 'bg-yellow-400' : 'bg-red-500'} typing-dot`}></span>
                  <span className={`text-xs ml-2 ${isLightTerminal ? 'text-green-500' : 'text-gray-400'}`}>
                    {isLightTerminal ? 'PROCESSING...' : 'Crusader is seeking wisdom...'}
                  </span>
                </div>
                <p className={`text-sm italic ${isLightTerminal ? 'text-gray-400 font-mono' : darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  "{currentThinkingVerse.verse}" — {currentThinkingVerse.reference}
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${
          isLightTerminal 
            ? 'bg-black border-gray-800' 
            : darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
        }`}>
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${
            isLightTerminal 
              ? 'bg-black border-gray-700 focus-within:border-red-500' 
              : darkMode 
                ? 'bg-gray-700 border-gray-600 focus-within:border-red-500' 
                : 'bg-gray-50 border-gray-300 focus-within:border-red-500'
          }`}>
            <span className={`text-lg ${isLightTerminal ? 'text-yellow-400 font-mono' : 'text-red-500'}`}>{">"}</span>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLightTerminal ? 'Enter command...' : 'Message Crusader...'}
              className={`flex-1 resize-none bg-transparent border-none outline-none text-sm font-mono ${
                isLightTerminal 
                  ? 'text-green-400 placeholder-gray-600' 
                  : darkMode 
                    ? 'text-white placeholder-gray-400' 
                    : 'text-gray-800 placeholder-gray-400'
              }`}
              rows={1}
              disabled={isLoading || isAILoading}
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading || isAILoading}
              className={`p-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : isLightTerminal
                    ? 'bg-gray-900 text-gray-400 hover:text-red-400 border border-gray-700'
                    : darkMode 
                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isAILoading}
              className={`px-4 py-2 rounded-lg font-mono font-bold text-sm transition-colors ${
                input.trim() && !isLoading && !isAILoading 
                  ? isLightTerminal
                    ? 'bg-red-600 text-yellow-400 border border-yellow-400/50 hover:bg-red-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                  : isLightTerminal
                    ? 'bg-gray-900 text-gray-600 border border-gray-700'
                    : darkMode 
                      ? 'bg-gray-600 text-gray-400' 
                      : 'bg-gray-200 text-gray-400'
              }`}
            >
              {isLightTerminal ? '[SEND]' : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className={`text-xs text-center mt-2 font-mono ${isLightTerminal ? 'text-gray-600' : 'text-gray-400'}`}>
            {isLightTerminal 
              ? '# Press ENTER to execute • God bless!' 
              : 'Press Enter to send • God bless!'}
          </p>
        </div>
      </div>
    </div>
  )
}
