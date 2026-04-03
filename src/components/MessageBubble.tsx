import { Cross, User } from 'lucide-react'
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
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-br from-gold-400 to-gold-600' 
          : 'bg-gradient-to-br from-primary-500 to-primary-700'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Cross className="w-4 h-4 text-white" />
        )}
      </div>
      
      {/* Message Content */}
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-md ${
        isUser 
          ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-tr-sm' 
          : darkMode 
            ? 'bg-gray-700 text-white rounded-tl-sm' 
            : 'bg-white text-gray-800 rounded-tl-sm'
      }`}>
        {/* Name */}
        <p className={`text-xs font-semibold mb-1 ${isUser ? 'text-gold-100' : 'text-primary-600'}`}>
          {isUser ? 'You' : 'Crusader'}
        </p>
        
        {/* Message text */}
        <div className={`text-sm leading-relaxed ${isUser ? '' : 'scripture-text'}`}>
          {formatMessage(message.content)}
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs mt-2 ${isUser ? 'text-gold-200' : 'text-primary-400'}`}>
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
    // Check for scripture references
    if (line.match(/\b(John|Romans|Psalm|Genesis|Exodus|Matthew|Mark|Luke|Acts|Revelation|Isaiah|Jeremiah|Ephesians|Philippians|Colossians|Timothy|Titus|Hebrews|James|Peter|Jude)\s*\d+:\d+\b/gi)) {
      return (
        <p key={i} className="text-primary-700 dark:text-gold-300 font-serif italic my-2">
          {line}
        </p>
      )
    }
    
    // Check for bullet points
    if (line.startsWith('•') || line.startsWith('-')) {
      return (
        <p key={i} className="ml-4 my-1">
          {line}
        </p>
      )
    }
    
    // Check for numbered lists
    if (line.match(/^\d+\./)) {
      return (
        <p key={i} className="ml-4 my-1">
          {line}
        </p>
      )
    }
    
    // Empty lines
    if (line.trim() === '') {
      return <br key={i} />
    }
    
    // Regular paragraphs
    return (
      <p key={i} className="my-1">
        {line}
      </p>
    )
  })
}
