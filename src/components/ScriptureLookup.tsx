import { useState, useEffect } from 'react'
import { BookOpen, Search, Loader2 } from 'lucide-react'

interface ScriptureLookupProps {
  onSelect: (reference: string) => void
  darkMode: boolean
}

interface Book {
  name: string
  abbrev: string
  testament: 'old' | 'new'
}

const API_URL = 'http://localhost:3001'

export default function ScriptureLookup({ onSelect, darkMode }: ScriptureLookupProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchResult, setSearchResult] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch all Bible books
    fetch(`${API_URL}/api/bible/books/all`)
      .then(res => res.json())
      .then(data => setBooks(data.books || []))
      .catch(err => console.error('Failed to load books:', err))
  }, [])

  const handleSearch = async () => {
    if (!searchInput.trim()) return
    
    setIsLoading(true)
    setSearchError(null)
    setSearchResult(null)
    
    try {
      const encodedRef = encodeURIComponent(searchInput.trim())
      const res = await fetch(`${API_URL}/api/bible/${encodedRef}`)
      const data = await res.json()
      
      if (data.found && data.text) {
        setSearchResult(data.text)
      } else {
        setSearchError('Verse not found. Try a different reference (e.g., "John 3:16" or "Psalm 23:1-5")')
      }
    } catch (err) {
      setSearchError('Failed to lookup verse. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookClick = (book: Book) => {
    onSelect(book.name + ' ')
    setSearchInput(book.name + ' ')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const oldTestament = books.filter(b => b.testament === 'old')
  const newTestament = books.filter(b => b.testament === 'new')

  return (
    <div className={`p-4 border-t ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-cream-50 border-cream-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className={`w-4 h-4 ${darkMode ? 'text-gold-400' : 'text-primary-600'}`} />
        <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-primary-900'}`}>
          Full Bible Lookup
        </h3>
      </div>
      
      {/* Search Bar */}
      <div className={`flex gap-2 mb-4 p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter verse reference (e.g., John 3:16, Psalm 23:1-5)"
          className={`flex-1 bg-transparent border-none outline-none text-sm ${
            darkMode ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
          }`}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !searchInput.trim()}
          className={`p-2 rounded-lg transition-colors ${
            isLoading || !searchInput.trim()
              ? darkMode ? 'bg-gray-700 text-gray-500' : 'bg-cream-200 text-gray-400'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>

      {/* Search Result */}
      {searchResult && (
        <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-primary-900/50 border border-primary-700' : 'bg-primary-50 border border-primary-200'}`}>
          <pre className={`text-xs whitespace-pre-wrap ${darkMode ? 'text-gold-300' : 'text-primary-700'} font-serif`}>
            {searchResult}
          </pre>
          <button
            onClick={() => onSelect(searchInput)}
            className="mt-2 px-3 py-1 bg-gold-500 text-white rounded-full text-xs hover:bg-gold-600 transition-colors"
          >
            Ask about this verse
          </button>
        </div>
      )}

      {/* Search Error */}
      {searchError && (
        <div className={`mb-4 p-3 rounded-lg text-xs ${darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'}`}>
          {searchError}
        </div>
      )}
      
      {/* Browse by Book - Old Testament */}
      <div className="mb-4">
        <p className={`text-xs mb-2 font-semibold ${darkMode ? 'text-gray-400' : 'text-primary-500'}`}>
          Old Testament ({oldTestament.length} books)
        </p>
        <div className="flex flex-wrap gap-1">
          {oldTestament.map((book) => (
            <button
              key={book.abbrev}
              onClick={() => handleBookClick(book)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                darkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  : 'bg-cream-200 text-primary-600 hover:bg-cream-300'
              }`}
            >
              {book.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Browse by Book - New Testament */}
      <div>
        <p className={`text-xs mb-2 font-semibold ${darkMode ? 'text-gray-400' : 'text-primary-500'}`}>
          New Testament ({newTestament.length} books)
        </p>
        <div className="flex flex-wrap gap-1">
          {newTestament.map((book) => (
            <button
              key={book.abbrev}
              onClick={() => handleBookClick(book)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                darkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  : 'bg-cream-200 text-primary-600 hover:bg-cream-300'
              }`}
            >
              {book.name}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Verses Quick Access */}
      <div className="mt-4 pt-4 border-t border-cream-200 dark:border-gray-700">
        <p className={`text-xs mb-2 font-semibold ${darkMode ? 'text-gray-400' : 'text-primary-500'}`}>
          Popular Verses
        </p>
        <div className="flex flex-wrap gap-2">
          {['John 3:16', 'Psalm 23', 'Romans 8:28', 'Philippians 4:13', 'Isaiah 40:31', 
            'Jeremiah 29:11', 'Proverbs 3:5', 'Matthew 11:28', '1 Corinthians 13:4', 
            'Genesis 1:1', 'John 1:1', 'Romans 3:23', 'Romans 6:23', 'Ephesians 2:8',
            'Hebrews 11:1', '1 Peter 3:15', 'John 14:6', 'Acts 1:8', 'Psalm 46:1'].map((ref) => (
            <button
              key={ref}
              onClick={() => {
                setSearchInput(ref)
                onSelect(ref)
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-700 text-gold-300 hover:bg-gray-600'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              {ref}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
