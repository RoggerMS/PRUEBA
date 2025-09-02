'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Filter, History, Bookmark, X, ChevronDown, Calendar, Users, MessageSquare, FileText, Star, Trash2, Settings, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import useSearch from '../../hooks/useSearch';
import { SearchHistoryItem } from '../../api/search/history';
import { SavedSearch } from '../../api/search/saved';

interface AdvancedSearchProps {
  initialQuery?: string;
  initialType?: 'all' | 'users' | 'posts' | 'conversations';
  onResultSelect?: (result: any) => void;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  initialQuery = '',
  initialType = 'all',
  onResultSelect,
  className = ''
}) => {
  const { data: session } = useSession();
  const {
    query,
    searchType,
    filters,
    results,
    searchHistory,
    savedSearches,
    loading,
    error,
    hasResults,
    hasMore,
    totalResults,
    canLoadMore,
    setQuery,
    setSearchType,
    setFilters,
    performSearch,
    loadMore,
    resetSearch,
    loadHistorySearch,
    toggleHistoryFavorite,
    clearSearchHistory,
    deleteHistoryItem,
    saveCurrentSearch,
    deleteSavedSearch,
    loadSavedSearch
  } = useSearch({
    initialQuery,
    initialType,
    autoSearch: true,
    debounceMs: 300
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'history' | 'saved'>('results');

  const searchTypes = [
    { value: 'all', label: 'Todo', icon: Search },
    { value: 'users', label: 'Usuarios', icon: Users },
    { value: 'posts', label: 'Publicaciones', icon: FileText },
    { value: 'conversations', label: 'Conversaciones', icon: MessageSquare }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevancia' },
    { value: 'date', label: 'Fecha' },
    { value: 'popularity', label: 'Popularidad' }
  ];

  const dateRanges = [
    { value: 'all', label: 'Todo el tiempo' },
    { value: 'day', label: 'Último día' },
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Último mes' },
    { value: 'year', label: 'Último año' }
  ];

  const handleSaveSearch = async () => {
    if (!saveSearchName.trim()) {
      toast.error('Por favor ingresa un nombre para la búsqueda');
      return;
    }

    try {
      await saveCurrentSearch(saveSearchName, false);
      setSaveSearchName('');
      setShowSaveDialog(false);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const renderSearchResults = () => {
    if (!hasResults) {
      if (query && !loading) {
        return (
          <div className="text-center py-12 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron resultados para "{query}"</p>
          </div>
        );
      }
      return null;
    }

    const renderUserResult = (user: any) => (
      <div
        key={user.id}
        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
        onClick={() => onResultSelect?.(user)}
      >
        <img
          src={user.image || '/default-avatar.png'}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900 truncate">{user.name}</p>
            {user.verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-gray-600 truncate mt-1">{user.bio}</p>
          )}
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>{user.followersCount} seguidores</p>
        </div>
      </div>
    );

    const renderPostResult = (post: any) => (
      <div
        key={post.id}
        className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
        onClick={() => onResultSelect?.(post)}
      >
        <div className="flex items-start space-x-3">
          <img
            src={post.author.image || '/default-avatar.png'}
            alt={post.author.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-gray-900">{post.author.name}</span>
              <span className="text-gray-500">@{post.author.username}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 text-sm">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-900 mb-2">{post.content}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{post.likesCount} me gusta</span>
              <span>{post.commentsCount} comentarios</span>
              <span>{post.sharesCount} compartidos</span>
            </div>
          </div>
        </div>
      </div>
    );

    const renderConversationResult = (conversation: any) => (
      <div
        key={conversation.id}
        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
        onClick={() => onResultSelect?.(conversation)}
      >
        <div className="flex-shrink-0">
          {conversation.type === 'direct' ? (
            <img
              src={conversation.participants[0]?.image || '/default-avatar.png'}
              alt={conversation.participants[0]?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {conversation.title || conversation.participants.map((p: any) => p.name).join(', ')}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {conversation.lastMessage?.content || 'Sin mensajes'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>{conversation.participants.length} participantes</p>
          {conversation.lastMessage && (
            <p>{new Date(conversation.lastMessage.createdAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    );

    if (searchType === 'all' && typeof results.results === 'object') {
      return (
        <div className="space-y-6">
          {results.results.users && results.results.users.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Usuarios ({results.results.users.length})
              </h3>
              <div className="space-y-2">
                {results.results.users.map(renderUserResult)}
              </div>
            </div>
          )}

          {results.results.posts && results.results.posts.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Publicaciones ({results.results.posts.length})
              </h3>
              <div className="space-y-2">
                {results.results.posts.map(renderPostResult)}
              </div>
            </div>
          )}

          {results.results.conversations && results.results.conversations.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Conversaciones ({results.results.conversations.length})
              </h3>
              <div className="space-y-2">
                {results.results.conversations.map(renderConversationResult)}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Single type results
    const singleResults = Array.isArray(results.results) ? results.results : [];
    return (
      <div className="space-y-2">
        {searchType === 'users' && singleResults.map(renderUserResult)}
        {searchType === 'posts' && singleResults.map(renderPostResult)}
        {searchType === 'conversations' && singleResults.map(renderConversationResult)}
      </div>
    );
  };

  const renderHistoryItem = (item: SearchHistoryItem) => (
    <div
      key={item.id}
      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group"
    >
      <div
        className="flex-1 cursor-pointer"
        onClick={() => {
          loadHistorySearch(item);
          setActiveTab('results');
        }}
      >
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900">{item.query}</span>
          <span className="text-sm text-gray-500">({item.type})</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => toggleHistoryFavorite(item.id, !item.favorite)}
          className={`p-1 rounded hover:bg-gray-200 ${
            item.favorite ? 'text-yellow-500' : 'text-gray-400'
          }`}
        >
          <Star className="h-4 w-4" fill={item.favorite ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => deleteHistoryItem(item.id)}
          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderSavedSearch = (saved: SavedSearch) => (
    <div
      key={saved.id}
      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group"
    >
      <div
        className="flex-1 cursor-pointer"
        onClick={() => {
          loadSavedSearch(saved);
          setActiveTab('results');
        }}
      >
        <div className="flex items-center space-x-2">
          <Bookmark className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-gray-900">{saved.name}</span>
          {saved.notifications && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Notificaciones
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          "{saved.query}" en {saved.type} · Usado {saved.usageCount} veces
        </p>
      </div>
      <button
        onClick={() => deleteSavedSearch(saved.id)}
        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar usuarios, publicaciones, conversaciones..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {query && (
              <button
                onClick={resetSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
          {query && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
              title="Guardar búsqueda"
            >
              <Bookmark className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search Type Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {searchTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSearchType(type.value as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchType === type.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ sortBy: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rango de fecha
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ dateRange: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuarios verificados
                </label>
                <select
                  value={filters.verified === undefined ? 'all' : filters.verified.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters({
                      verified: value === 'all' ? undefined : value === 'true'
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="true">Solo verificados</option>
                  <option value="false">No verificados</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'results'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Resultados
          {totalResults > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              {totalResults}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Historial
          {searchHistory.length > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              {searchHistory.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'saved'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Guardadas
          {savedSearches.length > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              {savedSearches.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Buscando...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        )}

        {activeTab === 'results' && !loading && renderSearchResults()}

        {activeTab === 'history' && (
          <div className="space-y-2">
            {searchHistory.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Historial de búsqueda</h3>
                  <button
                    onClick={clearSearchHistory}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Limpiar todo
                  </button>
                </div>
                {searchHistory.map(renderHistoryItem)}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay historial de búsqueda</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-2">
            {savedSearches.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Búsquedas guardadas</h3>
                </div>
                {savedSearches.map(renderSavedSearch)}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay búsquedas guardadas</p>
                <p className="text-sm mt-2">Guarda tus búsquedas frecuentes para acceso rápido</p>
              </div>
            )}
          </div>
        )}

        {/* Load More Button */}
        {activeTab === 'results' && canLoadMore && (
          <div className="text-center mt-4">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Guardar búsqueda
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la búsqueda
                </label>
                <input
                  type="text"
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  placeholder="Ej: Usuarios de tecnología"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Consulta:</strong> "{query}"</p>
                <p><strong>Tipo:</strong> {searchTypes.find(t => t.value === searchType)?.label}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveSearchName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={!saveSearchName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;