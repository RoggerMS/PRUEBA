import { useMemo, useCallback, useState } from 'react'

// Event interface compatible with the app structure
interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  category: string
  type: string
  organizer: { name: string; image?: string | null }
  club?: { name: string; imageUrl?: string | null }
  currentAttendees: number
  maxAttendees: number
  price: number
  isRegistered: boolean
  isOnline: boolean
  imageUrl?: string
  canEdit: boolean
  tags?: string[]
  isFeatured?: boolean
  status?: string
}

export interface FilterOptions {
  search: string
  category: string
  eventType: string
  difficulty: string
  priceRange: string
  dateRange: string
  sortBy: string
}

const DEFAULT_FILTERS: FilterOptions = {
  search: '',
  category: 'all',
  eventType: 'all',
  difficulty: 'all',
  priceRange: 'all',
  dateRange: 'all',
  sortBy: 'date'
}

/**
 * Custom hook for optimized event filtering and searching
 * Uses memoization to prevent unnecessary re-computations
 */
export function useEventFilters(events: Event[]) {
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS)

  // Memoized filtered and sorted events
  const filteredEvents = useMemo(() => {
    let filtered = [...events]

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim()
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.organizer.name.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm) ||
        (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      )
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(event => event.category === filters.category)
    }

    // Event type filter
    if (filters.eventType !== 'all') {
      filtered = filtered.filter(event => event.type === filters.eventType)
    }

    // Difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(event => event.difficulty === filters.difficulty)
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(event => {
        const price = event.price
        switch (filters.priceRange) {
          case 'free':
            return price === 0
          case 'low':
            return price > 0 && price <= 50
          case 'medium':
            return price > 50 && price <= 200
          case 'high':
            return price > 200
          default:
            return true
        }
      })
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startDate)
        switch (filters.dateRange) {
          case 'today':
            return eventDate.toDateString() === now.toDateString()
          case 'week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            return eventDate >= now && eventDate <= weekFromNow
          case 'month':
            const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
            return eventDate >= now && eventDate <= monthFromNow
          case 'past':
            return eventDate < now
          default:
            return true
        }
      })
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
        case 'startDate':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        case 'date-desc':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'price':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'popularity':
          return (b.currentAttendees || 0) - (a.currentAttendees || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [events, filters])

  // Memoized statistics
  const statistics = useMemo(() => {
    const now = new Date()
    const upcomingEvents = events.filter(event => new Date(event.startDate) >= now).length
    const myEvents = events.filter(event => event.isRegistered).length
    const totalAttendees = events.reduce((sum, event) => sum + event.currentAttendees, 0)
    
    return {
      totalEvents: events.length,
      upcomingEvents,
      myEvents,
      totalAttendees,
      filteredCount: filteredEvents.length,
      categories: [...new Set(events.map(e => e.category))].length,
      avgPrice: events.length > 0 ? Math.round(events.reduce((sum, e) => sum + e.price, 0) / events.length) : 0,
      freeEvents: events.filter(e => e.price === 0).length,
      paidEvents: events.filter(e => e.price > 0).length
    }
  }, [events, filteredEvents])

  // Optimized filter update functions
  const updateFilter = useCallback((key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateSearch = useCallback((search: string) => {
    updateFilter('search', search)
  }, [updateFilter])

  const updateCategory = useCallback((category: string) => {
    updateFilter('category', category)
  }, [updateFilter])

  const updateType = useCallback((eventType: string) => {
    updateFilter('eventType', eventType)
  }, [updateFilter])

  const updateEventType = useCallback((eventType: string) => {
    updateFilter('eventType', eventType)
  }, [updateFilter])

  const updateSort = useCallback((field: string, order: string = 'asc') => {
    const sortValue = order === 'desc' ? `${field}-desc` : field
    updateFilter('sortBy', sortValue)
  }, [updateFilter])

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const updateDifficulty = useCallback((difficulty: string) => {
    updateFilter('difficulty', difficulty)
  }, [updateFilter])

  const updatePriceRange = useCallback((priceRange: string) => {
    updateFilter('priceRange', priceRange)
  }, [updateFilter])

  const updateDateRange = useCallback((dateRange: string) => {
    updateFilter('dateRange', dateRange)
  }, [updateFilter])

  const updateSortBy = useCallback((sortBy: string) => {
    updateFilter('sortBy', sortBy)
  }, [updateFilter])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      return value !== DEFAULT_FILTERS[key as keyof FilterOptions]
    })
  }, [filters])

  // Computed values for compatibility
  const sortedEvents = filteredEvents

  return {
      // State
      filters,
      filteredEvents,
      sortedEvents,
      statistics,
      hasActiveFilters,
      // Actions
      updateFilter,
      updateSearch,
      updateCategory,
      updateType,
      updateEventType,
      updateSort,
      updateFilters,
      updateDifficulty,
      updatePriceRange,
      updateDateRange,
      updateSortBy,
      resetFilters
    }
  }