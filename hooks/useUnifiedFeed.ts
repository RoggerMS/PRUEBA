import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface UnifiedContentItem {
  id: string
  contentType: 'POST' | 'NOTE'
  author: {
    id: string
    name: string
    username: string
    image: string
    verified: boolean
  }
  createdAt: string
  stats: {
    likes?: number
    comments: number
    bookmarks: number
    shares?: number
    downloads?: number
    rating?: number
  }
  viewerState: {
    liked?: boolean
    saved: boolean
    shared?: boolean
  }
  // Campos específicos por tipo
  content?: string // Para posts
  title?: string // Para notas
  description?: string // Para notas
  subject?: string // Para notas
  career?: string // Para notas
  fileUrl?: string // Para notas
  fileName?: string // Para notas
  visibility?: string
  imageUrl?: string // Para posts
  videoUrl?: string // Para posts
}

interface UnifiedFeedParams {
  type?: 'all' | 'posts' | 'notes'
  subject?: string
  career?: string
  university?: string
  author?: string
  sort?: 'recent' | 'popular' | 'trending'
}

export function useUnifiedFeed(params: UnifiedFeedParams = {}) {
  return useInfiniteQuery({
    queryKey: ['unified-feed', params],
    queryFn: async ({ pageParam = 1 }) => {
      const searchParams = new URLSearchParams({
        page: pageParam.toString(),
        limit: '10',
        type: params.type || 'all',
        sort: params.sort || 'recent',
        ...(params.subject && { subject: params.subject }),
        ...(params.career && { career: params.career }),
        ...(params.university && { university: params.university }),
        ...(params.author && { author: params.author })
      })

      const response = await fetch(`/api/content?${searchParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch unified feed')
      }

      return response.json()
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.page + 1
        : undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useContentInteraction() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: async ({
      contentId,
      contentType,
      action
    }: {
      contentId: string
      contentType: 'POST' | 'NOTE'
      action: 'like' | 'unlike' | 'bookmark' | 'unbookmark'
    }) => {
      const response = await fetch(`/api/content/${contentId}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, contentType })
      })

      if (!response.ok) {
        throw new Error('Failed to process interaction')
      }

      return response.json()
    },
    onSuccess: (_, { action }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['unified-feed'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['notes'] })

      // Mostrar toast de confirmación
      const messages = {
        like: 'Te gusta este contenido',
        unlike: 'Ya no te gusta este contenido',
        bookmark: 'Guardado en favoritos',
        unbookmark: 'Eliminado de favoritos'
      }
      toast.success(messages[action])
    },
    onError: () => {
      toast.error('Error al procesar la acción')
    }
  })
}

export type { UnifiedContentItem, UnifiedFeedParams }