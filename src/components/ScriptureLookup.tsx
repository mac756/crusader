import { BookOpen } from 'lucide-react'

interface ScriptureLookupProps {
  onSelect: (reference: string) => void
  darkMode: boolean
}

const popularVerses = [
  { ref: 'John 3:16', text: 'For God so loved the world...' },
  { ref: 'Psalm 23:1', text: 'The Lord is my shepherd...' },
  { ref: 'Romans 8:28', text: 'And we know that all things work together...' },
  { ref: 'Philippians 4:13', text: 'I can do all things through Christ...' },
  { ref: 'Isaiah 40:31', text: 'Those who wait for the Lord...' },
  { ref: 'Jeremiah 29:11', text: 'For I know the plans I have for you...' },
  { ref: 'Proverbs 3:5', text: 'Trust in the Lord with all your heart...' },
  { ref: 'Matthew 11:28', text: 'Come to me, all who labor...' },
  { ref: '1 Corinthians 13:4', text: 'Love is patient, love is kind...' },
  { ref: 'Genesis 1:1', text: 'In the beginning, God created...' },
]

const books = [
  { name: 'Gospels', books: ['Matthew', 'Mark', 'Luke', 'John'] },
  { name: 'Old Testament', books: ['Genesis', 'Exodus', 'Psalms', 'Proverbs', 'Isaiah', 'Jeremiah'] },
  { name: 'New Testament', books: ['Romans', '1 Corinthians', 'Ephesians', 'Philippians', 'Colossians', 'Hebrews', 'James', '1 Peter', 'Revelation'] },
]

export default function ScriptureLookup({ onSelect, darkMode }: ScriptureLookupProps) {
  return (
    <div className={`p-4 border-t ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-cream-50 border-cream-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className={`w-4 h-4 ${darkMode ? 'text-gold-400' : 'text-primary-600'}`} />
        <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-primary-900'}`}>
          Scripture Lookup
        </h3>
      </div>
      
      {/* Popular Verses */}
      <div className="mb-4">
        <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-primary-500'}`}>Popular Verses</p>
        <div className="flex flex-wrap gap-2">
          {popularVerses.map((verse) => (
            <button
              key={verse.ref}
              onClick={() => onSelect(verse.ref)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              {verse.ref}
            </button>
          ))}
        </div>
      </div>
      
      {/* Browse by Book */}
      <div>
        <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-primary-500'}`}>Browse by Book</p>
        <div className="space-y-2">
          {books.map((category) => (
            <div key={category.name}>
              <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-primary-600'}`}>
                {category.name}
              </p>
              <div className="flex flex-wrap gap-1">
                {category.books.map((book) => (
                  <button
                    key={book}
                    onClick={() => onSelect(book)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      darkMode
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-cream-200 text-primary-600 hover:bg-cream-300'
                    }`}
                  >
                    {book}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
