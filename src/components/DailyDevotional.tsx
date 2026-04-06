import { useState, useEffect } from 'react'
import { BookOpen, Volume2, RefreshCw, Sun } from 'lucide-react'

interface DailyDevotionalProps {
  darkMode: boolean
  onSpeak?: (text: string) => void
}

interface DevotionalData {
  date: string
  verse: string
  text: string
  commentary: string
}

export default function DailyDevotional({ darkMode, onSpeak }: DailyDevotionalProps) {
  const [devotional, setDevotional] = useState<DevotionalData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_URL = 'http://localhost:3001'

  const fetchDevotional = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/devotional`)
      if (!res.ok) throw new Error('Failed to fetch devotional')
      const data = await res.json()
      setDevotional(data)
    } catch (err) {
      setError('Could not load devotional. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDevotional()
  }, [])

  const speakVerse = () => {
    if (devotional && onSpeak) {
      onSpeak(`${devotional.verse}. ${devotional.text}. ${devotional.commentary}`)
    }
  }

  return (
    <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gold-600' : 'bg-gold-500'}`}>
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-primary-900'}`}>
              Daily Devotional
            </h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-primary-500'}`}>
              {devotional?.date || new Date().toISOString().split('T')[0]}
            </p>
          </div>
        </div>
        <button
          onClick={fetchDevotional}
          disabled={isLoading}
          className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-cream-100 text-primary-600 hover:bg-cream-200'}`}
          title="Get new verse"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className={`w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin`}></div>
        </div>
      )}

      {error && (
        <div className={`text-center py-4 text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
          {error}
        </div>
      )}

      {devotional && !isLoading && (
        <div className="space-y-4">
          {/* Verse Reference */}
          <div className={`text-center p-4 rounded-xl ${darkMode ? 'bg-primary-900/50' : 'bg-primary-50'}`}>
            <p className={`text-2xl font-serif font-bold mb-2 ${darkMode ? 'text-gold-400' : 'text-primary-700'}`}>
              {devotional.verse}
            </p>
            <p className={`text-lg font-serif italic ${darkMode ? 'text-white' : 'text-primary-800'}`}>
              "{devotional.text}"
            </p>
          </div>

          {/* Commentary */}
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-cream-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className={`w-4 h-4 ${darkMode ? 'text-gold-400' : 'text-primary-600'}`} />
              <p className={`text-sm font-semibold ${darkMode ? 'text-gold-400' : 'text-primary-600'}`}>
                Reflection
              </p>
            </div>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-primary-700'}`}>
              {devotional.commentary}
            </p>
          </div>

          {/* Speak Button */}
          <button
            onClick={speakVerse}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
              darkMode 
                ? 'bg-primary-700 text-white hover:bg-primary-600' 
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            Listen to Devotional
          </button>
        </div>
      )}
    </div>
  )
}
