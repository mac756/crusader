import { User, Volume2 } from 'lucide-react'
import type { Message } from '../hooks/useChat'

interface MessageBubbleProps {
  message: Message
  darkMode: boolean
  onSpeak?: (text: string) => void
}

export default function MessageBubble({ message, darkMode, onSpeak }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex items-start gap-3 animate-fadeIn ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
        isUser 
          ? 'bg-gradient-to-br from-gold-400 to-gold-600 border-gold-500' 
          : 'bg-gradient-to-br from-crusader-600 to-crusader-800 border-gold-500/50'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-gold-400" fill="currentColor">
            <rect x="10" y="2" width="4" height="20" rx="1" />
            <rect x="3" y="9" width="18" height="4" rx="1" />
          </svg>
        )}
      </div>
      
      {/* Message Content */}
      <div className={`max-w-[75%] px-5 py-4 rounded-2xl shadow-md ${
        isUser 
          ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-tr-sm' 
          : darkMode 
            ? 'bg-gray-700/90 text-white rounded-tl-sm border border-gray-600'
            : 'bg-white text-gray-800 rounded-tl-sm border border-crusader-100'
      }`}>
        {/* Name */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold tracking-wide uppercase ${
            isUser ? 'text-gold-100' : 'text-crusader-600 dark:text-gold-400'
          }`}>
            {isUser ? 'You' : 'Crusader'}
          </span>
          {!isUser && (
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
          )}
        </div>
        
        {/* Message text */}
        <div className={`text-sm leading-relaxed ${isUser ? '' : 'scripture-text'}`}>
          {formatMessage(message.content)}
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs mt-3 flex items-center gap-1 ${
          isUser ? 'text-gold-200' : 'text-gray-400 dark:text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        
        {/* Speak button for assistant */}
        {!isUser && onSpeak && (
          <button
            onClick={() => onSpeak(message.content)}
            className={`mt-2 p-1.5 rounded-full transition-all ${
              darkMode 
                ? 'hover:bg-gray-600 text-gray-400 hover:text-gold-400' 
                : 'hover:bg-crusader-50 text-crusader-400 hover:text-gold-600'
            }`}
            title="Read aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Format message content with basic markdown-like styling
function formatMessage(content: string): React.ReactNode {
  // Split by newlines and preserve formatting
  const lines = content.split('\n')
  
  return lines.map((line, i) => {
    // Check for scripture references (bold them and style)
    if (line.match(/\b(John|Romans|Psalm|Genesis|Exodus|Matthew|Mark|Luke|Acts|Revelation|Isaiah|Jeremiah|Ephesians|Philippians|Colossians|Timothy|Titus|Hebrews|James|Peter|Jude|Proverbs|Psalm)\s*\d+:\d+\b/gi)) {
      return (
        <p key={i} className="text-crusader-700 dark:text-gold-300 font-serif italic my-3 py-2 px-3 bg-crusader-50/50 dark:bg-gray-600/30 rounded-lg border-l-2 border-gold-500">
          {line}
        </p>
      )
    }
    
    // Check for bold headers (like "1. God's Love")
    if (line.match(/^\d+\.\s+\*\*[A-Z]/)) {
      return (
        <p key={i} className="font-semibold text-crusader-800 dark:text-gold-300 my-2">
          {line.replace(/\*\*/g, '')}
        </p>
      )
    }
    
    // Check for bullet points
    if (line.startsWith('•') || line.startsWith('-')) {
      return (
        <p key={i} className="ml-4 my-2 flex items-start gap-2">
          <span className="text-gold-500 mt-1">•</span>
          <span>{line.substring(1).trim()}</span>
        </p>
      )
    }
    
    // Check for numbered lists
    if (line.match(/^\d+\./)) {
      return (
        <p key={i} className="ml-4 my-2 flex items-start gap-2">
          <span className="text-gold-500 font-semibold">{line.match(/^\d+/)}.</span>
          <span>{line.replace(/^\d+\.\s*/, '')}</span>
        </p>
      )
    }
    
    // Empty lines
    if (line.trim() === '') {
      return <br key={i} />
    }
    
    // Regular paragraphs - highlight key phrases
    return (
      <p key={i} className="my-1">
        {highlightPhrases(line)}
      </p>
    )
  })
}

// Highlight important phrases
function highlightPhrases(text: string): React.ReactNode {
  // Split by scripture-like patterns to highlight them
  const parts = text.split(/(\*[^*]+\*)/g)
  
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="text-crusader-600 dark:text-gold-300">{part.slice(1, -1)}</em>
    }
    return part
  })
}
