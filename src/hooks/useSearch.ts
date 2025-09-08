import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface UseSearchOptions {
  delay?: number
}

export function useSearch<T>(items: T[], searchFields: (item: T) => string[], options: UseSearchOptions = {}) {
  const { delay = 300 } = options
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')

  const debouncedSetSearch = useMemo(
    () =>
      debounce((text: string) => {
        setDebouncedSearchText(text)
      }, delay),
    [delay]
  )

  useEffect(() => {
    debouncedSetSearch(searchText)

    return () => {
      debouncedSetSearch.cancel()
    }
  }, [searchText, debouncedSetSearch])

  const filteredItems = useMemo(() => {
    if (!debouncedSearchText) {
      return items
    }

    const lowerSearchText = debouncedSearchText.toLowerCase().trim()

    if (!lowerSearchText) {
      return items
    }

    return items.filter(item => {
      const fields = searchFields(item)
      return fields.some(field => field && field.toLowerCase().includes(lowerSearchText))
    })
  }, [items, debouncedSearchText, searchFields])

  const clearSearch = useCallback(() => {
    setSearchText('')
    setDebouncedSearchText('')
  }, [])

  return {
    searchText,
    setSearchText,
    filteredItems,
    isSearching: searchText !== debouncedSearchText,
    hasSearchText: !!debouncedSearchText,
    clearSearch
  }
}
