import { Sword, HelpCircle, BookOpen, Users } from 'lucide-react'

interface DebateModeProps {
  onSelect: (topic: string) => void
  darkMode: boolean
}

const debateTopics = [
  { 
    category: 'Classical Apologetics', 
    icon: BookOpen,
    topics: [
      'How do you prove God exists?',
      'Explain the cosmological argument',
      'What about the teleological argument?',
      'Defend the resurrection historically',
    ]
  },
  { 
    category: 'Common Objections', 
    icon: HelpCircle,
    topics: [
      'How do you respond to the problem of evil?',
      'Why does God allow suffering?',
      'What about the hiddenness of God?',
      'Why do innocent people suffer?',
    ]
  },
  { 
    category: 'Faith & Reason', 
    icon: Users,
    topics: [
      'Is faith rational?',
      'Can science explain everything?',
      'What is the relationship between faith and reason?',
      'How do you know Christianity is true?',
    ]
  },
  { 
    category: 'Bible & Scripture', 
    icon: BookOpen,
    topics: [
      'How can we trust the Bible?',
      'Were the Gospel writers reliable?',
      'What about contradictions in the Bible?',
      'Is the Bible historically accurate?',
    ]
  },
]

export default function DebateMode({ onSelect, darkMode }: DebateModeProps) {
  return (
    <div className={`p-4 border-t ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-cream-50 border-cream-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Sword className={`w-4 h-4 ${darkMode ? 'text-gold-400' : 'text-primary-600'}`} />
        <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-primary-900'}`}>
          Debate Topics
        </h3>
      </div>
      
      <div className="space-y-4">
        {debateTopics.map((category) => {
          const Icon = category.icon
          return (
            <div key={category.category}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-3 h-3 ${darkMode ? 'text-gold-400' : 'text-primary-500'}`} />
                <p className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-primary-600'}`}>
                  {category.category}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => onSelect(topic)}
                    className={`px-3 py-1.5 rounded-lg text-xs text-left transition-colors ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                        : 'bg-white text-primary-700 hover:bg-primary-50 border border-primary-200'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gold-50 border border-gold-200'}`}>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gold-700'}`}>
          <strong>Tip:</strong> Crusader will engage respectfully while defending Christian positions with logic and scripture.
        </p>
      </div>
    </div>
  )
}
