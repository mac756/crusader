import { useState, useCallback } from 'react'
import { sendChatMessage } from '../lib/api'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string, mode: string = 'chat') => {
    // Add user message
    setMessages(prev => [
      ...prev,
      { role: 'user', content, timestamp: new Date() }
    ])

    setIsLoading(true)

    try {
      const response = await sendChatMessage(content, mode, messages)
      
      // Add assistant message
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response, timestamp: new Date() }
      ])
    } catch (error) {
      // Add error message
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: `I apologize, but I'm having trouble processing your request right now. Please try again. God bless!\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          timestamp: new Date() 
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  }
}
