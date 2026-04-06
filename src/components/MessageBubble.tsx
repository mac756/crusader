import { User } from 'lucide-react'
import type { Message } from '../hooks/useChat'

interface MessageBubbleProps {
  message: Message
  darkMode: boolean
}

export default function MessageBubble({ message, darkMode }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex items-start gap-3 animate-fadeIn ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-red-600' 
          : 'bg-red-700'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <span className="text-white text-sm">✝</span>
        )}
      </div>
      
      {/* Message Content */}
      <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
        isUser
          ? 'bg-red-600 text-white rounded-tr-sm'
          : darkMode
            ? 'bg-gray-700 text-white rounded-tl-sm border border-gray-600'
            : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
      }`}>
        {/* Name */}
        <div className={`text-xs font-semibold tracking-wide uppercase mb-1 ${
          isUser ? 'text-red-200' : 'text-red-600'
        }`}>
          {isUser ? 'You' : 'Crusader'}
        </div>
        
        {/* Message text */}
        <div className={`text-sm leading-relaxed ${isUser ? '' : 'font-serif'}`}>
          {formatMessage(message.content)}
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs mt-2 ${
          isUser ? 'text-red-200' : 'text-gray-400'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        
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
