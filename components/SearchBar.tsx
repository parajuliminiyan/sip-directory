'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  onSearch?: () => void
  defaultValue?: string
}

interface Suggestion {
  id: string
  name: string
  slug: string
  categories: string[]
  shortSummary?: string
  highlightedName: string
}

export function SearchBar({ onSearch, defaultValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/suggestions?q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()
      setSuggestions(data.suggestions || [])
      setShowSuggestions(true)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced input handler
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value)
      setSelectedIndex(-1)

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value)
      }, 300)
    },
    [fetchSuggestions]
  )

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        setShowSuggestions(false)
        onSearch?.()
      }
    },
    [query, router, onSearch]
  )

  const handleSuggestionClick = useCallback(
    (slug: string) => {
      router.push(`/sip/${slug}`)
      setShowSuggestions(false)
      onSearch?.()
    },
    [router, onSearch]
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          if (selectedIndex >= 0) {
            e.preventDefault()
            handleSuggestionClick(suggestions[selectedIndex].slug)
          }
          break
        case 'Escape':
          setShowSuggestions(false)
          setSelectedIndex(-1)
          break
      }
    },
    [showSuggestions, suggestions, selectedIndex, handleSuggestionClick]
  )

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <div ref={wrapperRef} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin z-10" />
          )}
          <Input
            type="text"
            placeholder="Search for SIPs by name, category, or OS..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="pl-10 pr-10"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0',
                    selectedIndex === index
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  )}
                  onClick={() => handleSuggestionClick(suggestion.slug)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-medium truncate"
                        dangerouslySetInnerHTML={{
                          __html: suggestion.highlightedName,
                        }}
                      />
                      {suggestion.shortSummary && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {suggestion.shortSummary}
                        </p>
                      )}
                    </div>
                    {suggestion.categories.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {suggestion.categories.slice(0, 2).map((category) => (
                          <Badge
                            key={category}
                            variant="secondary"
                            className="text-xs"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button type="submit">Search</Button>
      </div>
    </form>
  )
}
