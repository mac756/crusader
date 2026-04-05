import { Brain, ChevronDown, ChevronUp } from 'lucide-react'

interface ThoughtsPanelProps {
  darkMode: boolean
  isVisible: boolean
  onToggle: () => void
  thoughts?: string
}

export default function ThoughtsPanel({ darkMode, isVisible, onToggle, thoughts }: ThoughtsPanelProps) {
  return (
    <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-cream-50'} border ${darkMode ? 'border-gray-700' : 'border-cream-200'}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-3 transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-cream-100 hover:bg-cream-200'}`}
      >
        <div className="flex items-center gap-2">
          <Brain className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-primary-800'}`}>
            AI Thoughts
          </span>
        </div>
        {isVisible ? (
          <ChevronUp className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-primary-500'}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-primary-500'}`} />
        )}
      </button>

      {/* Content */}
      {isVisible && (
        <div className="p-4">
          {thoughts ? (
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-primary-700'}`}>
              <pre className="whitespace-pre-wrap font-sans">{thoughts}</pre>
            </div>
          ) : (
            <div className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-primary-400'}`}>
              No thoughts recorded yet. The AI will show its reasoning process here.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
