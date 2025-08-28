'use client';

import { useEffect, useRef, useCallback, useState, memo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useIntersection } from '@/hooks/useIntersection';
import { PostCard } from './PostCard';
// import PostSkeleton from './PostSkeleton'; // Using local component instead
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FeedPost, FeedResponse, FeedRanking } from '@/types/feed';
import { mockFeedPosts } from './mockData';

interface PostListProps {
  ranking?: FeedRanking;
  authorId?: string;
  hashtag?: string;
  className?: string;
}

const POSTS_PER_PAGE = 10;

export const PostList = memo(function PostList({ 
  ranking = 'home', 
  authorId, 
  hashtag, 
  className 
}: PostListProps) {
  const [isOnline, setIsOnline] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(loadMoreRef, { threshold: 0.1 });
  const isDev = process.env.NODE_ENV !== 'production';

  // Build query key
  const queryKey = ['feed', ranking, authorId, hashtag].filter(Boolean);

  // Infinite query for posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = null }) => {
      const params = new URLSearchParams();
      
      if (pageParam) params.append('cursor', pageParam);
      params.append('limit', POSTS_PER_PAGE.toString());
      if (ranking !== 'home') params.append('ranking', ranking);
      if (authorId) params.append('author', authorId);
      if (hashtag) params.append('hashtag', hashtag);

      const response = await fetch(`/api/feed?${params}`);
      
      if (!response.ok) {
        throw new Error('Error loading posts');
      }
      
      return response.json() as Promise<FeedResponse>;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Auto-load more when intersecting
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexión restaurada', {
        description: 'Actualizando contenido...'
      });
      refetch();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Sin conexión', {
        description: 'Mostrando contenido guardado'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refetch]);

  const handleRefresh = useCallback(() => {
    refetch();
    toast.success('Actualizando feed...', {
      description: 'Buscando nuevas publicaciones'
    });
  }, [refetch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'j':
          e.preventDefault();
          scrollToNextPost();
          break;
        case 'k':
          e.preventDefault();
          scrollToPrevPost();
          break;
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleRefresh();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleRefresh]);

  const scrollToNextPost = useCallback(() => {
    const posts = listRef.current?.querySelectorAll('[data-post-id]');
    if (!posts) return;

    const currentScroll = window.scrollY;
    const nextPost = Array.from(posts).find(post => {
      const rect = post.getBoundingClientRect();
      return rect.top > 100; // 100px from top
    });

    if (nextPost) {
      nextPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const scrollToPrevPost = useCallback(() => {
    const posts = listRef.current?.querySelectorAll('[data-post-id]');
    if (!posts) return;

    const currentScroll = window.scrollY;
    const prevPost = Array.from(posts).reverse().find(post => {
      const rect = post.getBoundingClientRect();
      return rect.top < -50; // 50px above viewport
    });

    if (prevPost) {
      prevPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Flatten all posts from pages
  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  // Use mock posts in development when the query fails or returns empty
  const fallbackPosts =
    isDev && (isError || allPosts.length === 0) ? mockFeedPosts : null;

  if (fallbackPosts) {
    return (
      <div className={cn('space-y-6', className)} ref={listRef}>
        {fallbackPosts.map((post, index) => (
          <div key={post.id} data-post-id={post.id}>
            <PostCard post={post} priority={index < 3} />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    const errorType = !navigator.onLine ? 'network' : 'server';
    return (
      <ErrorState 
        type={errorType}
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  // Empty state (production only)
  if (allPosts.length === 0) {
    return (
      <EmptyState 
        type="feed"
        actionText="Crear publicación"
        onAction={() => {
          // Scroll to composer
          const composer = document.querySelector('[data-composer]');
          composer?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className={cn('space-y-6', className)} ref={listRef}>
      {/* Online/Offline indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm text-gray-600">
            {isOnline ? 'En línea' : 'Sin conexión'}
          </span>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={isRefetching}
          className="text-gray-600 hover:text-gray-900"
        >
          <RefreshCw className={cn('w-4 h-4', isRefetching && 'animate-spin')} />
        </Button>
      </div>

      {/* Posts list */}
      {allPosts.map((post, index) => (
        <div key={post.id} data-post-id={post.id}>
          <PostCard 
            post={post} 
            priority={index < 3} // Prioritize first 3 posts for loading
          />
        </div>
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <PostSkeleton key={`loading-${i}`} />
            ))}
          </div>
        )}
        
        {!hasNextPage && allPosts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              🎉 ¡Has llegado al final! No hay más publicaciones.
            </p>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs px-3 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="space-y-1">
          <div>J/K: Navegar posts</div>
          <div>Ctrl+R: Actualizar</div>
        </div>
      </div>
    </div>
  );
});

// Post skeleton component
function PostSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-6 pt-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-18" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}