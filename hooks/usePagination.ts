import { useMemo, useCallback, useState } from 'react'

export interface PaginationOptions {
  page: number
  pageSize: number
  totalItems: number
}

export interface PaginationResult<T> {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  startIndex: number
  endIndex: number
  paginatedItems: T[]
  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  setPageSize: (size: number) => void
}

/**
 * Custom hook for optimized pagination
 * Memoizes calculations and provides efficient navigation
 */
export function usePagination<T>(
  items: T[],
  initialPageSize: number = 12
): PaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const totalItems = items.length

  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalItems)
    const hasNextPage = currentPage < totalPages
    const hasPreviousPage = currentPage > 1

    return {
      totalPages,
      startIndex,
      endIndex,
      hasNextPage,
      hasPreviousPage
    }
  }, [currentPage, pageSize, totalItems])

  // Memoized paginated items
  const paginatedItems = useMemo(() => {
    const { startIndex, endIndex } = paginationData
    return items.slice(startIndex, endIndex)
  }, [items, paginationData])

  // Navigation functions with useCallback for optimization
  const goToPage = useCallback((page: number) => {
    const { totalPages } = paginationData
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }, [paginationData])

  const goToNextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [paginationData.hasNextPage])

  const goToPreviousPage = useCallback(() => {
    if (paginationData.hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [paginationData.hasPreviousPage])

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const goToLastPage = useCallback(() => {
    setCurrentPage(paginationData.totalPages)
  }, [paginationData.totalPages])

  const setPageSize = useCallback((size: number) => {
    const newSize = Math.max(1, size)
    setPageSizeState(newSize)
    // Reset to first page when page size changes
    setCurrentPage(1)
  }, [])

  // Reset to first page when items change significantly
  const itemsLength = items.length
  useMemo(() => {
    if (currentPage > Math.ceil(itemsLength / pageSize)) {
      setCurrentPage(1)
    }
  }, [itemsLength, pageSize, currentPage])

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages: paginationData.totalPages,
    hasNextPage: paginationData.hasNextPage,
    hasPreviousPage: paginationData.hasPreviousPage,
    startIndex: paginationData.startIndex,
    endIndex: paginationData.endIndex,
    paginatedItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setPageSize
  }
}

/**
 * Hook for infinite scroll pagination
 * Useful for mobile or when you want to load more items progressively
 */
export function useInfiniteScroll<T>(
  items: T[],
  initialPageSize: number = 12
) {
  const [loadedCount, setLoadedCount] = useState(initialPageSize)

  const visibleItems = useMemo(() => {
    return items.slice(0, loadedCount)
  }, [items, loadedCount])

  const hasMore = useMemo(() => {
    return loadedCount < items.length
  }, [loadedCount, items.length])

  const loadMore = useCallback(() => {
    if (hasMore) {
      setLoadedCount(prev => Math.min(prev + initialPageSize, items.length))
    }
  }, [hasMore, initialPageSize, items.length])

  const reset = useCallback(() => {
    setLoadedCount(initialPageSize)
  }, [initialPageSize])

  // Reset when items change
  useMemo(() => {
    if (loadedCount > items.length) {
      setLoadedCount(Math.min(initialPageSize, items.length))
    }
  }, [items.length, loadedCount, initialPageSize])

  return {
    visibleItems,
    hasMore,
    loadMore,
    reset,
    loadedCount,
    totalCount: items.length
  }
}