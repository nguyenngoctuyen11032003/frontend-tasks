import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { X, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTagsStore } from '@/stores/tags-store'
import type { Tag } from '@/types'

interface TagsInputProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  placeholder?: string
  maxTags?: number
  className?: string
  readOnly?: boolean
}

export const TagsInput = memo(function TagsInput({
  selectedTags,
  onTagsChange,
  placeholder = 'Thêm tag...',
  maxTags = 10,
  className,
  readOnly = false
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Get all tags and search
  const tags = useTagsStore(state => state.tags)

  // Get available tags (not already selected)
  const getAvailableTags = useCallback((query: string) => {
    const selectedIds = new Set(selectedTags.map(t => t.id))
    return tags
      .filter(tag => !selectedIds.has(tag.id))
      .filter(tag => tag.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8)
  }, [tags, selectedTags])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setHighlightedIndex(-1)

    if (value.trim()) {
      const filtered = getAvailableTags(value)
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [getAvailableTags])

  // Handle tag selection from suggestions
  const handleSelectTag = useCallback((tag: Tag) => {
    if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag])
      setInputValue('')
      setSuggestions([])
      setShowSuggestions(false)
      setHighlightedIndex(-1)
      inputRef.current?.focus()
    }
  }, [selectedTags, maxTags, onTagsChange])

  // Handle tag removal
  const handleRemoveTag = useCallback((tagId: string) => {
    if (!readOnly) {
      onTagsChange(selectedTags.filter(tag => tag.id !== tagId))
    }
  }, [selectedTags, readOnly, onTagsChange])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) {
          handleSelectTag(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        setHighlightedIndex(-1)
        break
      default:
        break
    }
  }, [showSuggestions, suggestions, highlightedIndex, handleSelectTag])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !suggestionsRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (readOnly) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {selectedTags.map(tag => (
          <Badge
            key={tag.id}
            className="gap-1"
            style={{
              backgroundColor: `${tag.color}20`,
              color: tag.color,
              border: `1px solid ${tag.color}40`
            }}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setShowSuggestions(true)}
            placeholder={placeholder}
            disabled={selectedTags.length >= maxTags}
            className="pl-8"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md"
          >
            {suggestions.map((tag, index) => (
              <button
                key={tag.id}
                onClick={() => handleSelectTag(tag)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b last:border-b-0',
                  index === highlightedIndex && 'bg-accent'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1">{tag.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedTags.some(t => t.id === tag.id) ? 'Đã chọn' : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <Badge
              key={tag.id}
              className="gap-1 cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}40`
              }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Count Info */}
      {selectedTags.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedTags.length} / {maxTags} tags
        </p>
      )}

      {/* Empty State */}
      {selectedTags.length === 0 && !inputValue && (
        <p className="text-xs text-muted-foreground">Chưa chọn tag nào</p>
      )}
    </div>
  )
})

TagsInput.displayName = 'TagsInput'
