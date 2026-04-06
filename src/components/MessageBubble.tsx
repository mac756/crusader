import { User } from 'lucide-react'
import type { Message } from '../hooks/useChat'

interface MessageBubbleProps {
  message: Message
  darkMode: boolean
  isLightTerminal?: boolean
}

export default function MessageBubble({ message, darkMode, isLightTerminal = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex items-start gap-3 animate-fadeIn ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? isLightTerminal ? 'bg-red-600 border border-red-400' : 'bg-red-600' 
          : isLightTerminal ? 'bg-black border-2 border-yellow-400' : 'bg-red-700'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          isLightTerminal ? (
            <span className="text-yellow-400 text-xs font-mono font-bold">C</span>
          ) : (
            <span className="text-white text-sm">✝</span>
          )
        )}
      </div>
      
      {/* Message Content */}
      <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm font-mono text-sm ${
        isUser
          ? isLightTerminal
            ? 'bg-red-600 text-yellow-400 rounded-tr-sm border border-yellow-400/30'
            : 'bg-red-600 text-white rounded-tr-sm'
          : isLightTerminal
            ? 'bg-black text-green-400 rounded-tl-sm border border-gray-700'
            : darkMode
              ? 'bg-gray-700 text-white rounded-tl-sm border border-gray-600'
              : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
      }`}>
        {/* Name */}
        <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${
          isUser 
            ? isLightTerminal ? 'text-yellow-200' : 'text-red-200'
            : isLightTerminal ? 'text-yellow-400' : 'text-red-600'
        }`}>
          {isLightTerminal ? (isUser ? '> USER' : '$ CRUSADER') : (isUser ? 'You' : 'Crusader')}
        </div>
        
        {/* Message text */}
        <div className={`leading-relaxed ${isUser || isLightTerminal ? '' : 'font-serif'}`}>
          {formatMessage(message.content, isLightTerminal)}
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs mt-2 ${
          isUser 
            ? isLightTerminal ? 'text-yellow-300/50' : 'text-red-200' 
            : isLightTerminal ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

// Format message content
function formatMessage(content: string, isLightTerminal: boolean): React.ReactNode {
  const lines = content.split('\n')
  
  return lines.map((line, i) => {
    // Check for scripture references
    if (line.match(/\b(John|Romans|Psalm|Genesis|Exodus|Matthew|Mark|Luke|Acts|Revelation|Isaiah|Jeremiah|Ephesians|Philippians|Colossians|Timothy|Titus|Hebrews|James|Peter|Jude|Proverbs|Psalm)\s*\d+:\d+\b/gi)) {
      return (
        <p key={i} className={`italic my-2 py-2 px-3 rounded border-l-2 ${
          isLightTerminal 
            ? 'text-yellow-300 border-yellow-400 bg-black' 
            : 'text-red-700 dark:text-yellow-300 border-red-500 bg-gray-50 dark:bg-gray-600/30'
        }`}>
          {line}
        </p>
      )
    }
    
    // Empty lines
    if (line.trim() === '') {
      return <br key={i} />
    }
    
    // Regular text
    return (
      <p key={i} className="my-1">
        {highlightPhrases(line, isLightTerminal)}
      </p>
    )
  })
}

// Highlight important phrases
function highlightPhrases(text: string, isLightTerminal: boolean): React.ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g)
  
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className={isLightTerminal ? 'text-yellow-300' : 'text-red-600 dark:text-yellow-300'}>{part.slice(1, -1)}</em>
    }
    return part
  })
}
