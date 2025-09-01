"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp,
  Hash,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchSuggestion {
  id: string;
  type: 'event' | 'tag' | 'location' | 'organizer' | 'category';
  text: string;
  count?: number;
  icon?: React.ReactNode;
}

interface EventSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  onRecentSearchClick?: (search: string) => void;
  onClearRecentSearches?: () => void;
  isLoading?: boolean;
  className?: string;
}

// Mock suggestions - in real app, these would come from API
const mockSuggestions: SearchSuggestion[] = [
  {
    id: '1',
    type: 'event',
    text: 'Hackathon de Inteligencia Artificial',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    id: '2',
    type: 'tag',
    text: 'programación',
    count: 15,
    icon: <Hash className="h-4 w-4" />
  },
  {
    id: '3',
    type: 'location',
    text: 'Laboratorio de Computación',
    count: 8,
    icon: <MapPin className="h-4 w-4" />
  },
  {
    id: '4',
    type: 'organizer',
    text: 'Club de Programación',
    count: 12,
    icon: <User className="h-4 w-4" />
  },
  {
    id: '5',
    type: 'category',
    text: 'Tecnología',
    count: 25,
    icon: <TrendingUp className="h-4 w-4" />
  },
];

const mockRecentSearches = [
  'hackathon',
  'inteligencia artificial',
  'programación',
  'conferencia',
  'taller'
];

export function EventSearch({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar eventos, organizadores, ubicaciones...",
  suggestions = mockSuggestions,
  recentSearches = mockRecentSearches,
  onRecentSearchClick,
  onClearRecentSearches,
  isLoading = false,
  className = ""
}: EventSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Debounce search input
  const debouncedValue = useDebounce(value, 300);
  
  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 5);

  // Handle search execution
  useEffect(() => {
    if (debouncedValue && onSearch) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0 || isFocused);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    setIsFocused(false);
    if (onSearch) {
      onSearch(suggestion.text);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    onChange(search);
    setShowSuggestions(false);
    setIsFocused(false);
    if (onRecentSearchClick) {
      onRecentSearchClick(search);
    }
    if (onSearch) {
      onSearch(search);
    }
  };

  const handleClearInput = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsFocused(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && value.trim()) {
      setShowSuggestions(false);
      setIsFocused(false);
      if (onSearch) {
        onSearch(value.trim());
      }
    }
  };

  const getSuggestionTypeColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'event': return 'bg-blue-100 text-blue-700';
      case 'tag': return 'bg-purple-100 text-purple-700';
      case 'location': return 'bg-green-100 text-green-700';
      case 'organizer': return 'bg-orange-100 text-orange-700';
      case 'category': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSuggestionTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'event': return 'Evento';
      case 'tag': return 'Etiqueta';
      case 'location': return 'Ubicación';
      case 'organizer': return 'Organizador';
      case 'category': return 'Categoría';
      default: return '';
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className={`pl-10 pr-10 ${isFocused ? 'ring-2 ring-purple-500' : ''}`}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearInput}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (isFocused || value.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 bg-white shadow-lg border">
          <CardContent className="p-0">
            {/* Search Suggestions */}
            {value.length > 0 && filteredSuggestions.length > 0 && (
              <div className="p-3 border-b">
                <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Sugerencias
                </div>
                <div className="space-y-1">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <div className={`p-1 rounded ${getSuggestionTypeColor(suggestion.type)}`}>
                        {suggestion.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {suggestion.text}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {getSuggestionTypeLabel(suggestion.type)}
                          </Badge>
                        </div>
                        {suggestion.count && (
                          <div className="text-xs text-gray-500">
                            {suggestion.count} resultado{suggestion.count !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {value.length === 0 && recentSearches.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Búsquedas recientes
                  </div>
                  {onClearRecentSearches && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-700 h-auto p-1"
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-50 text-xs"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {value.length > 0 && filteredSuggestions.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <div className="text-sm">No se encontraron sugerencias</div>
                <div className="text-xs text-gray-400 mt-1">
                  Presiona Enter para buscar "{value}"
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}