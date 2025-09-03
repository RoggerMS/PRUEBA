'use client';

import React, { useState, useEffect } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, TrendingUp, Users, MessageSquare, FileText } from 'lucide-react';
import AdvancedSearch from '../../components/search/AdvancedSearch';

const SearchPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Skip database operations during build
  const isBuildTime =
    typeof window === 'undefined' &&
    process.env.NODE_ENV === 'production' &&
    !process.env.DATABASE_URL?.includes('localhost');

  // Get initial search parameters from URL
  const initialQuery = searchParams.get('q') || '';
  const initialType =
    (searchParams.get('type') as 'all' | 'users' | 'posts' | 'conversations') ||
    'all';

  useEffect(() => {
    if (isBuildTime) return;
    // Load trending searches (mock data for now)
    setTrendingSearches([
      'inteligencia artificial',
      'desarrollo web',
      'react nextjs',
      'diseño ui/ux',
      'startup tecnología',
      'programación python',
      'marketing digital',
      'blockchain crypto'
    ]);

    // Load recent searches from localStorage
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      try {
        setRecentSearches(JSON.parse(recent));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, [isBuildTime]);

  if (isBuildTime) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Search</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleResultSelect = (result: any) => {
    setSelectedResult(result);
    
    // Navigate based on result type
    if (result.username) {
      // User result
      router.push(`/u/${result.username}`);
    } else if (result.content) {
      // Post result
      router.push(`/post/${result.id}`);
    } else if (result.participants) {
      // Conversation result
      router.push(`/messages?conversation=${result.id}`);
    }
  };

  const handleTrendingClick = (query: string) => {
    // Update URL with search query
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('type', 'all');
    router.push(`/search?${params.toString()}`);
  };

  const addToRecentSearches = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Inicia sesión para buscar
          </h1>
          <p className="text-gray-600 mb-6">
            Accede a tu cuenta para utilizar la búsqueda avanzada
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Búsqueda Avanzada
          </h1>
          <p className="text-gray-600">
            Encuentra usuarios, publicaciones y conversaciones en CRUNEVO
          </p>
        </div>

        {/* Main Search Component */}
        <div className="mb-8">
          <AdvancedSearch
            initialQuery={initialQuery}
            initialType={initialType}
            onResultSelect={handleResultSelect}
            className="w-full"
          />
        </div>

        {/* Trending and Recent Searches */}
        {!initialQuery && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trending Searches */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Tendencias
                </h2>
              </div>
              <div className="space-y-2">
                {trendingSearches.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingClick(query)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 group-hover:text-blue-600">
                        {query}
                      </span>
                      <span className="text-sm text-gray-400">
                        #{index + 1}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Search className="h-5 w-5 text-blue-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Búsquedas recientes
                  </h2>
                </div>
                {recentSearches.length > 0 && (
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {recentSearches.length > 0 ? (
                  recentSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleTrendingClick(query)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-gray-700 group-hover:text-blue-600">
                        {query}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hay búsquedas recientes
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search Tips */}
        {!initialQuery && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Consejos de búsqueda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Buscar usuarios</p>
                  <p className="text-blue-600">Usa @ seguido del nombre de usuario</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Buscar publicaciones</p>
                  <p className="text-blue-600">Usa # para buscar por hashtags</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Buscar conversaciones</p>
                  <p className="text-blue-600">Busca por nombre de grupo o participante</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Search className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Búsqueda avanzada</p>
                  <p className="text-blue-600">Usa comillas para frases exactas</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {session && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estadísticas de búsqueda
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1.2M</div>
                <div className="text-sm text-gray-600">Usuarios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">5.8M</div>
                <div className="text-sm text-gray-600">Publicaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">890K</div>
                <div className="text-sm text-gray-600">Conversaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-gray-600">Disponible</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;