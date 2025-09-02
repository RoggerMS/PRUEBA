import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { SearchResult } from '../api/search';
import { SearchHistoryItem } from '../api/search/history';
import { SavedSearch } from '../api/search/saved';

interface SearchFilters {
  sortBy: 'relevance' | 'date' | 'popularity';
  dateRange: 'all' | 'day' | 'week' | 'month' | 'year';
  verified?: boolean;
}

interface UseSearchOptions {
  debounceMs?: number;
  autoSearch?: boolean;
  initialQuery?: string;
  initialType?: 'all' | 'users' | 'posts' | 'conversations';
  initialFilters?: Partial<SearchFilters>;
}

export const useSearch = (options: UseSearchOptions = {}) => {
  const {
    debounceMs = 500,
    autoSearch = true,
    initialQuery = '',
    initialType = 'all',
    initialFilters = {}
  } = options;

  const { data: session } = useSession();
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<'all' | 'users' | 'posts' | 'conversations'>(initialType);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    dateRange: 'all',
    ...initialFilters
  });
  const [results, setResults] = useState<SearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [pagination, setPagination] = useState({ offset: 0, limit: 20 });

  // Load initial data
  useEffect(() => {
    if (session?.user) {
      loadSearchHistory();
      loadSavedSearches();
    }
  }, [session]);

  // Auto search with debounce
  useEffect(() => {
    if (!autoSearch) return;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.trim()) {
      const timeout = setTimeout(() => {
        performSearch(true); // Reset pagination on new search
      }, debounceMs);
      setSearchTimeout(timeout);
    } else {
      setResults(null);
      setError(null);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [query, searchType, filters, autoSearch, debounceMs]);

  const performSearch = useCallback(async (reset = false) => {
    if (!query.trim() || !session?.user) return;

    setLoading(true);
    setError(null);

    const currentOffset = reset ? 0 : pagination.offset;
    if (reset) {
      setPagination(prev => ({ ...prev, offset: 0 }));
    }

    try {
      const params = new URLSearchParams({
        q: query,
        type: searchType,
        sortBy: filters.sortBy,
        dateRange: filters.dateRange,
        limit: pagination.limit.toString(),
        offset: currentOffset.toString()
      });

      if (filters.verified !== undefined) {
        params.append('verified', filters.verified.toString());
      }

      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data: SearchResult = await response.json();
      
      if (reset) {
        setResults(data);
      } else {
        // Append results for pagination
        setResults(prev => {
          if (!prev) return data;
          
          if (searchType === 'all') {
            return {
              ...data,
              results: {
                users: [...(prev.results.users || []), ...(data.results.users || [])],
                posts: [...(prev.results.posts || []), ...(data.results.posts || [])],
                conversations: [...(prev.results.conversations || []), ...(data.results.conversations || [])]
              }
            };
          } else {
            return {
              ...data,
              results: [...prev.results, ...data.results]
            };
          }
        });
      }

      // Refresh search history after successful search
      if (reset) {
        loadSearchHistory();
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setError(error.message || 'Error al realizar la búsqueda');
      toast.error(error.message || 'Error al realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  }, [query, searchType, filters, pagination, session]);

  const loadMore = useCallback(() => {
    if (!results?.pagination.hasMore || loading) return;
    
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
    
    performSearch(false);
  }, [results, loading, performSearch]);

  const loadSearchHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/search/history?limit=20');
      if (response.ok) {
        const data = await response.json();
        setSearchHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  const loadSavedSearches = useCallback(async () => {
    try {
      const response = await fetch('/api/search/saved?active=true');
      if (response.ok) {
        const data = await response.json();
        setSavedSearches(data.savedSearches);
      }
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  }, []);

  const saveCurrentSearch = useCallback(async (name: string, notifications = false) => {
    if (!name.trim() || !query.trim()) {
      throw new Error('Name and query are required');
    }

    try {
      const response = await fetch('/api/search/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          query,
          type: searchType,
          filters,
          notifications
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save search');
      }

      const data = await response.json();
      toast.success('Búsqueda guardada exitosamente');
      loadSavedSearches();
      return data.savedSearch;
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la búsqueda');
      throw error;
    }
  }, [query, searchType, filters, loadSavedSearches]);

  const deleteSavedSearch = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/search/saved?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete saved search');
      }

      toast.success('Búsqueda guardada eliminada');
      loadSavedSearches();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la búsqueda guardada');
      throw error;
    }
  }, [loadSavedSearches]);

  const loadSavedSearch = useCallback((savedSearch: SavedSearch) => {
    setQuery(savedSearch.query);
    setSearchType(savedSearch.type as any);
    if (savedSearch.filters) {
      setFilters(prev => ({ ...prev, ...savedSearch.filters }));
    }
    setPagination(prev => ({ ...prev, offset: 0 }));
    
    // Update usage count
    fetch(`/api/search/saved`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: savedSearch.id,
        // This would require backend support to increment usage
      })
    }).catch(console.error);
  }, []);

  const loadHistorySearch = useCallback((historyItem: SearchHistoryItem) => {
    setQuery(historyItem.query);
    setSearchType(historyItem.type as any);
    if (historyItem.filters) {
      setFilters(prev => ({ ...prev, ...historyItem.filters }));
    }
    setPagination(prev => ({ ...prev, offset: 0 }));
  }, []);

  const toggleHistoryFavorite = useCallback(async (id: string, favorite: boolean) => {
    try {
      const response = await fetch('/api/search/history', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, favorite })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update history');
      }

      loadSearchHistory();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el historial');
    }
  }, [loadSearchHistory]);

  const clearSearchHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/search/history?all=true', {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear history');
      }

      setSearchHistory([]);
      toast.success('Historial de búsqueda eliminado');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el historial');
    }
  }, []);

  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/search/history?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete history item');
      }

      setSearchHistory(prev => prev.filter(item => item.id !== id));
      toast.success('Elemento del historial eliminado');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el elemento');
    }
  }, []);

  const resetSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
    setPagination({ offset: 0, limit: 20 });
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  }, []);

  return {
    // State
    query,
    searchType,
    filters,
    results,
    searchHistory,
    savedSearches,
    loading,
    error,
    pagination,

    // Actions
    setQuery,
    setSearchType,
    setFilters: updateFilters,
    performSearch: () => performSearch(true),
    loadMore,
    resetSearch,

    // History management
    loadSearchHistory,
    loadHistorySearch,
    toggleHistoryFavorite,
    clearSearchHistory,
    deleteHistoryItem,

    // Saved searches management
    loadSavedSearches,
    saveCurrentSearch,
    deleteSavedSearch,
    loadSavedSearch,

    // Computed values
    hasResults: !!results,
    hasMore: results?.pagination.hasMore || false,
    totalResults: results?.pagination.total || 0,
    canLoadMore: !loading && (results?.pagination.hasMore || false)
  };
};

export default useSearch;