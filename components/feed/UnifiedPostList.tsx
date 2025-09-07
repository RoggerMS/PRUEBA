'use client';

import { Button } from '@/components/ui/button';
import { LoaderIcon } from 'lucide-react';
import { useUnifiedFeed } from '@/hooks/useUnifiedFeed';
import type { UnifiedContentItem } from '@/hooks/useUnifiedFeed';
import { UnifiedFeedCard } from './UnifiedFeedCard';

export default function UnifiedPostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useUnifiedFeed();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoaderIcon className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar el contenido</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  // Filtra elementos inválidos para evitar errores al acceder a `id`
  const content = (data?.pages.flatMap(page => page.content || []) || []).filter(
    (item): item is UnifiedContentItem => Boolean(item?.id)
  );

  return (
    <div className="space-y-6">
      {content.map((item) => (
        <UnifiedFeedCard key={item.id} item={item} />
      ))}
      
      {/* Botón para cargar más contenido */}
      {hasNextPage && (
        <div className="flex justify-center pt-6">
          <Button 
            variant="outline" 
            className="w-full max-w-xs"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                Cargando...
              </>
            ) : (
              'Cargar más contenido'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}