import { Search, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search jobs by title, description, or category...',
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, onSearch])

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="search-bar">
      <Search className="search-icon" size={20} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {query && (
        <button onClick={handleClear} className="clear-btn" aria-label="Clear search">
          <X size={20} />
        </button>
      )}
    </div>
  )
}
