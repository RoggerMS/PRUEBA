'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FeedPost, FeedKind, VisibilityLevel, FeedRanking } from '@/types/feed';
import { toast } from 'sonner';
import { useNotifications } from './useNotifications';

interface FeedResponse {
  posts: FeedPost[];
  nextCursor?: string;
  hasMore: boolean;
}

interface CreatePostData {
  kind: FeedKind;
  text?: string;
  media?: File[];
  visibility: VisibilityLevel;
  hashtags?: string[];
}

interface FeedParams {
  ranking?: FeedRanking;
  kind?: FeedKind;
  author?: string;
  hashtag?: string;
  limit?: number;
}

// Hook for infinite feed query
export function useFeed(params: FeedParams = {}) {
  const { createNotification } = useNotifications();
  const { ranking = 'home', kind, author, hashtag, limit = 10 } = params;

  return useInfiniteQuery({
    queryKey: ['feed', { ranking, kind, author, hashtag }],
    queryFn: async ({ pageParam = undefined }) => {
      const searchParams = new URLSearchParams();
      
      if (pageParam) searchParams.set('cursor', pageParam);
      searchParams.set('limit', limit.toString());
      searchParams.set('ranking', ranking);
      if (kind) searchParams.set('kind', kind);
      if (author) searchParams.set('author', author);
      if (hashtag) searchParams.set('hashtag', hashtag);

      const response = await fetch(`/api/feed?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }
      
      return response.json() as Promise<FeedResponse>;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

// Hook for creating posts
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      const formData = new FormData();
      
      formData.append('kind', data.kind);
      formData.append('visibility', data.visibility);
      
      if (data.text) {
        formData.append('text', data.text);
      }
      
      if (data.hashtags && data.hashtags.length > 0) {
        formData.append('hashtags', JSON.stringify(data.hashtags));
      }
      
      if (data.media && data.media.length > 0) {
        data.media.forEach((file, index) => {
          formData.append(`media_${index}`, file);
        });
      }

      const response = await fetch('/api/feed', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create post');
      }
      
      return response.json() as Promise<FeedPost>;
    },
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      // Create optimistic post
      const optimisticPost: FeedPost = {
        id: `temp-${Date.now()}`,
        kind: newPost.kind,
        author: {
          id: 'current-user',
          name: 'Tú',
          username: 'you',
          avatar: '/default-avatar.png',
          verified: false
        },
        text: newPost.text,
        media: [],
        visibility: newPost.visibility,
        createdAt: new Date().toISOString(),
        stats: {
          fires: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          views: 0
        },
        viewerState: {
          fired: false,
          saved: false,
          shared: false
        }
      };
      
      // Optimistically update feed queries
      queryClient.setQueriesData(
        { queryKey: ['feed'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: any, index: number) => {
              if (index === 0) {
                return {
                  ...page,
                  posts: [optimisticPost, ...page.posts]
                };
              }
              return page;
            })
          };
        }
      );
      
      return { optimisticPost };
    },
    onError: (err, newPost, context) => {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      
      toast.error('Error al crear el post');
    },
    onSuccess: (data) => {
      // Invalidate and refetch feed queries
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      
      toast.success('Post creado exitosamente');
    }
  });
}

// Hook for single post query
export function usePost(postId: string) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await fetch(`/api/feed/${postId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      return response.json() as Promise<FeedPost>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!postId
  });
}

// Hook for fire reaction
export function useFireReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/feed/${postId}/fire`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle fire reaction');
      }
      
      return response.json();
    },
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      
      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<FeedPost>(['post', postId]);
      
      // Optimistically update the post
      if (previousPost) {
        const newFired = !previousPost.viewerState.fired;
        const newFireCount = previousPost.stats.fires + (newFired ? 1 : -1);
        
        queryClient.setQueryData<FeedPost>(['post', postId], {
          ...previousPost,
          stats: {
            ...previousPost.stats,
            fires: Math.max(0, newFireCount)
          },
          viewerState: {
            ...previousPost.viewerState,
            fired: newFired
          }
        });
        
        // Also update in feed queries
        queryClient.setQueriesData(
          { queryKey: ['feed'] },
          (oldData: any) => {
            if (!oldData) return oldData;
            
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts.map((post: FeedPost) => 
                  post.id === postId
                    ? {
                        ...post,
                        stats: {
                          ...post.stats,
                          fires: Math.max(0, newFireCount)
                        },
                        viewerState: {
                          ...post.viewerState,
                          fired: newFired
                        }
                      }
                    : post
                )
              }))
            };
          }
        );
      }
      
      return { previousPost };
    },
    onError: (err, postId, context) => {
      // Revert optimistic update
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      
      toast.error('Error al reaccionar al post');
    },
    onSettled: (data, error, postId) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    }
  });
}

// Hook for following/unfollowing users
export function useFollowUser() {
  const queryClient = useQueryClient();
  const { createNotification } = useNotifications();

  return useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'follow' | 'unfollow' }) => {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: action === 'follow' ? 'POST' : 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }
      
      return response.json();
    },
    onSuccess: (data, { userId, action }) => {
      // Invalidate user profile and feed queries
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      
      if (action === 'follow') {
        // Create notification for the followed user
        createNotification({
          type: 'follow',
          recipientId: userId,
          message: 'Te está siguiendo'
        });
        toast.success('Usuario seguido exitosamente');
      } else {
        toast.success('Usuario no seguido');
      }
    },
    onError: (error, { action }) => {
      toast.error(`Error al ${action === 'follow' ? 'seguir' : 'dejar de seguir'} usuario`);
    }
  });
}

// Hook for reporting posts
export function useReportPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason: string }) => {
      const response = await fetch(`/api/feed/${postId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to report post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Post reportado exitosamente');
    },
    onError: () => {
      toast.error('Error al reportar el post');
    }
  });
}

// Hook for bookmarking posts
export function useBookmarkPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/feed/${postId}/bookmark`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle bookmark');
      }
      
      return response.json();
    },
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      
      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<FeedPost>(['post', postId]);
      
      // Optimistically update the post
      if (previousPost) {
        const newSaved = !previousPost.viewerState.saved;
        const newSaveCount = previousPost.stats.saves + (newSaved ? 1 : -1);
        
        queryClient.setQueryData<FeedPost>(['post', postId], {
          ...previousPost,
          stats: {
            ...previousPost.stats,
            saves: Math.max(0, newSaveCount)
          },
          viewerState: {
            ...previousPost.viewerState,
            saved: newSaved
          }
        });
        
        // Also update in feed queries
        queryClient.setQueriesData(
          { queryKey: ['feed'] },
          (oldData: any) => {
            if (!oldData) return oldData;
            
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts.map((post: FeedPost) => 
                  post.id === postId
                    ? {
                        ...post,
                        stats: {
                          ...post.stats,
                          saves: Math.max(0, newSaveCount)
                        },
                        viewerState: {
                          ...post.viewerState,
                          saved: newSaved
                        }
                      }
                    : post
                )
              }))
            };
          }
        );
      }
      
      return { previousPost };
    },
    onError: (err, postId, context) => {
      // Revert optimistic update
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      
      toast.error('Error al guardar el post');
    },
    onSuccess: (data) => {
      toast.success(data.saved ? 'Post guardado' : 'Post removido de guardados');
    },
    onSettled: (data, error, postId) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    }
  });
}

// Hook for search
export function useSearchFeed(query: string, filters: {
  kind?: FeedKind;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  return useQuery({
    queryKey: ['feed-search', query, filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      searchParams.set('q', query);
      if (filters.kind) searchParams.set('kind', filters.kind);
      if (filters.author) searchParams.set('author', filters.author);
      if (filters.dateFrom) searchParams.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) searchParams.set('dateTo', filters.dateTo);

      const response = await fetch(`/api/feed/search?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to search feed');
      }
      
      return response.json() as Promise<{ posts: FeedPost[]; total: number }>;
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for saved posts
export function useSavedPosts() {
  return useQuery({
    queryKey: ['saved-posts'],
    queryFn: async () => {
      const response = await fetch('/api/feed?ranking=saved');
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved posts');
      }
      
      return response.json() as Promise<FeedResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for bookmark toggle
export function useBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/feed/${postId}/bookmark`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle bookmark');
      }
      
      return response.json();
    },
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      
      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<FeedPost>(['post', postId]);
      
      // Optimistically update the post
      if (previousPost) {
        const newSaved = !previousPost.viewerState.saved;
        const newBookmarkCount = previousPost.stats.bookmarks + (newSaved ? 1 : -1);
        
        queryClient.setQueryData<FeedPost>(['post', postId], {
          ...previousPost,
          stats: {
            ...previousPost.stats,
            bookmarks: Math.max(0, newBookmarkCount)
          },
          viewerState: {
            ...previousPost.viewerState,
            saved: newSaved
          }
        });
        
        // Also update in feed queries
        queryClient.setQueriesData(
          { queryKey: ['feed'] },
          (oldData: any) => {
            if (!oldData) return oldData;
            
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts.map((post: FeedPost) => 
                  post.id === postId
                    ? {
                        ...post,
                        stats: {
                          ...post.stats,
                          bookmarks: Math.max(0, newBookmarkCount)
                        },
                        viewerState: {
                          ...post.viewerState,
                          saved: newSaved
                        }
                      }
                    : post
                )
              }))
            };
          }
        );
      }
      
      return { previousPost };
    },
    onError: (err, postId, context) => {
      // Revert optimistic update
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      
      toast.error('Error al guardar el post');
    },
    onSettled: (data, error, postId) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    }
  });
}

// Hook for trending topics
export function useTrendingTopics() {
  return useQuery({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      const response = await fetch('/api/feed/trending');
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending topics');
      }
      
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}