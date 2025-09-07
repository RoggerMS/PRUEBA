# Integración Sistema de Apuntes con Feed Social - Guía de Implementación

## 1. Modificaciones del Backend

### 1.1 API Unificada de Contenido

#### Crear nuevo endpoint unificado: `/api/content/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema para contenido unificado
const unifiedContentSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  type: z.enum(['all', 'posts', 'notes', 'questions']).default('all'),
  sort: z.enum(['recent', 'popular', 'trending']).default('recent'),
  subject: z.string().optional(),
  career: z.string().optional(),
  university: z.string().optional(),
  author: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = unifiedContentSchema.parse(Object.fromEntries(searchParams))
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const skip = (params.page - 1) * params.limit

    // Construir contenido unificado
    let unifiedContent: any[] = []

    if (params.type === 'all' || params.type === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          visibility: 'PUBLIC',
          ...(params.author && {
            author: { username: params.author }
          })
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              verified: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              bookmarks: true
            }
          },
          ...(userId && {
            likes: {
              where: { userId },
              select: { id: true }
            },
            bookmarks: {
              where: { userId },
              select: { id: true }
            }
          })
        },
        take: params.limit,
        orderBy: { createdAt: 'desc' }
      })

      unifiedContent.push(...posts.map(post => ({
        ...post,
        contentType: 'POST',
        isLiked: userId ? post.likes?.length > 0 : false,
        isBookmarked: userId ? post.bookmarks?.length > 0 : false,
        stats: {
          likes: post._count.likes,
          comments: post._count.comments,
          bookmarks: post._count.bookmarks,
          shares: post.shareCount || 0
        },
        likes: undefined,
        bookmarks: undefined,
        _count: undefined
      })))
    }

    if (params.type === 'all' || params.type === 'notes') {
      const noteWhere: any = {
        status: 'APPROVED',
        visibility: 'PUBLIC'
      }

      if (params.subject) {
        noteWhere.subject = { contains: params.subject, mode: 'insensitive' }
      }
      if (params.career) {
        noteWhere.career = { contains: params.career, mode: 'insensitive' }
      }
      if (params.university) {
        noteWhere.university = { contains: params.university, mode: 'insensitive' }
      }
      if (params.author) {
        noteWhere.author = { username: params.author }
      }

      const notes = await prisma.note.findMany({
        where: noteWhere,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              verified: true
            }
          },
          _count: {
            select: {
              comments: true,
              bookmarks: true,
              ratings: true
            }
          },
          ...(userId && {
            bookmarks: {
              where: { userId },
              select: { id: true }
            }
          })
        },
        take: params.limit,
        orderBy: { createdAt: 'desc' }
      })

      unifiedContent.push(...notes.map(note => ({
        ...note,
        contentType: 'NOTE',
        isBookmarked: userId ? note.bookmarks?.length > 0 : false,
        stats: {
          downloads: note.downloads,
          rating: note.rating,
          comments: note._count.comments,
          bookmarks: note._count.bookmarks
        },
        bookmarks: undefined,
        _count: undefined
      })))
    }

    // Ordenar contenido unificado
    unifiedContent.sort((a, b) => {
      if (params.sort === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      // Agregar más lógicas de ordenamiento
      return 0
    })

    // Aplicar paginación al contenido unificado
    const paginatedContent = unifiedContent.slice(skip, skip + params.limit)

    return NextResponse.json({
      items: paginatedContent,
      pagination: {
        page: params.page,
        limit: params.limit,
        hasMore: unifiedContent.length > skip + params.limit
      },
      filters: {
        type: params.type,
        subject: params.subject,
        career: params.career,
        university: params.university
      }
    })
  } catch (error) {
    console.error('Error fetching unified content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
```

### 1.2 Modificar API de Feed Existente

#### Actualizar `/api/feed/route.ts` para incluir notas:

```typescript
// Agregar al GET existente después de obtener posts
if (type === 'NOTE' || !type) {
  const noteWhere: any = {
    status: 'APPROVED',
    AND: [
      {
        OR: [
          { visibility: 'PUBLIC' },
          ...(userId ? [
            { visibility: 'FOLLOWERS', author: { followers: { some: { followerId: userId } } } },
            { visibility: 'PRIVATE', authorId: userId }
          ] : [])
        ]
      }
    ]
  }

  // Aplicar filtros específicos de notas
  if (subject) {
    noteWhere.AND.push({ subject: { contains: subject, mode: 'insensitive' } })
  }
  if (career) {
    noteWhere.AND.push({ career: { contains: career, mode: 'insensitive' } })
  }

  const notes = await prisma.note.findMany({
    skip,
    take: limit,
    where: noteWhere,
    orderBy,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          university: true,
          career: true,
          verified: true
        }
      },
      _count: {
        select: {
          comments: true,
          bookmarks: true,
          ratings: true
        }
      },
      ...(userId && {
        bookmarks: {
          where: { userId },
          select: { id: true }
        }
      })
    }
  })

  // Transformar notas para el feed
  const transformedNotes = notes.map(note => ({
    id: note.id,
    kind: 'note' as const,
    author: note.author,
    text: note.description,
    title: note.title,
    subject: note.subject,
    career: note.career,
    fileUrl: note.fileUrl,
    fileName: note.fileName,
    visibility: note.visibility.toLowerCase(),
    createdAt: note.createdAt.toISOString(),
    stats: {
      fires: 0, // Las notas no tienen fires
      comments: note._count.comments,
      shares: 0,
      saves: note._count.bookmarks,
      views: note.views || 0,
      downloads: note.downloads || 0,
      rating: note.rating || 0
    },
    viewerState: {
      fired: false,
      saved: userId ? note.bookmarks?.length > 0 : false,
      shared: false
    }
  }))

  // Combinar posts y notas
  allContent.push(...transformedNotes)
}

// Ordenar contenido combinado por fecha
allContent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
```

### 1.3 API de Interacciones Unificadas

#### Crear `/api/content/[id]/interactions/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, contentType } = await request.json()
    const contentId = params.id
    const userId = session.user.id

    switch (action) {
      case 'like':
        if (contentType === 'POST') {
          await prisma.like.create({
            data: {
              userId,
              postId: contentId
            }
          })
        }
        break

      case 'unlike':
        if (contentType === 'POST') {
          await prisma.like.deleteMany({
            where: {
              userId,
              postId: contentId
            }
          })
        }
        break

      case 'bookmark':
        await prisma.bookmark.create({
          data: {
            userId,
            ...(contentType === 'POST' ? { postId: contentId } : { noteId: contentId })
          }
        })
        break

      case 'unbookmark':
        await prisma.bookmark.deleteMany({
          where: {
            userId,
            ...(contentType === 'POST' ? { postId: contentId } : { noteId: contentId })
          }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling interaction:', error)
    return NextResponse.json(
      { error: 'Failed to process interaction' },
      { status: 500 }
    )
  }
}
```

## 2. Modificaciones del Frontend

### 2.1 Hook Unificado de Contenido

#### Crear `hooks/useUnifiedFeed.ts`:

```typescript
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
```

### 2.2 Componente de Feed Unificado

#### Crear `components/feed/UnifiedFeedCard.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Download, 
  Star,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import { useContentInteraction } from '@/hooks/useUnifiedFeed'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface UnifiedFeedCardProps {
  item: {
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
    // Campos específicos
    content?: string
    title?: string
    description?: string
    subject?: string
    career?: string
    fileUrl?: string
  }
}

export function UnifiedFeedCard({ item }: UnifiedFeedCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const interaction = useContentInteraction()

  const handleInteraction = (action: 'like' | 'unlike' | 'bookmark' | 'unbookmark') => {
    interaction.mutate({
      contentId: item.id,
      contentType: item.contentType,
      action
    })
  }

  const isNote = item.contentType === 'NOTE'

  return (
    <Card className="w-full mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.author.image} alt={item.author.name} />
              <AvatarFallback>{item.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-sm">{item.author.name}</h4>
                {item.author.verified && (
                  <Badge variant="secondary" className="text-xs">Verificado</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{item.author.username}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isNote ? (
              <Badge variant="outline" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Apunte
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <ImageIcon className="h-3 w-3 mr-1" />
                Post
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isNote ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            {item.description && (
              <p className="text-muted-foreground">
                {isExpanded ? item.description : `${item.description.slice(0, 150)}...`}
                {item.description.length > 150 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-600 hover:underline ml-1"
                  >
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {item.subject && (
                <Badge variant="secondary">{item.subject}</Badge>
              )}
              {item.career && (
                <Badge variant="outline">{item.career}</Badge>
              )}
            </div>
            {item.fileUrl && (
              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Archivo adjunto</span>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{item.content}</p>
          </div>
        )}

        {/* Estadísticas y acciones */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center space-x-4">
            {!isNote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInteraction(item.viewerState.liked ? 'unlike' : 'like')}
                className={item.viewerState.liked ? 'text-red-600' : ''}
              >
                <Heart className={`h-4 w-4 mr-1 ${item.viewerState.liked ? 'fill-current' : ''}`} />
                {item.stats.likes || 0}
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              {item.stats.comments}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleInteraction(item.viewerState.saved ? 'unbookmark' : 'bookmark')}
              className={item.viewerState.saved ? 'text-blue-600' : ''}
            >
              <Bookmark className={`h-4 w-4 mr-1 ${item.viewerState.saved ? 'fill-current' : ''}`} />
              {item.stats.bookmarks}
            </Button>
            {isNote && (
              <>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Download className="h-4 w-4" />
                  {item.stats.downloads || 0}
                </div>
                {item.stats.rating && item.stats.rating > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {item.stats.rating.toFixed(1)}
                  </div>
                )}
              </>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 2.3 Modal Unificado de Creación

#### Modificar `components/feed/CreatePostModal.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FileText, Image, Upload, X } from 'lucide-react'
import { useCreatePost } from '@/hooks/useFeed'
import { useCreateNote } from '@/hooks/useNotes'
import { toast } from 'sonner'

interface CreateContentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateContentModal({ isOpen, onClose }: CreateContentModalProps) {
  const [activeTab, setActiveTab] = useState('post')
  const [postContent, setPostContent] = useState('')
  const [noteData, setNoteData] = useState({
    title: '',
    description: '',
    subject: '',
    career: '',
    university: '',
    semester: '',
    tags: [] as string[],
    files: [] as File[]
  })
  const [tagInput, setTagInput] = useState('')

  const createPost = useCreatePost()
  const createNote = useCreateNote()

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast.error('El contenido del post no puede estar vacío')
      return
    }

    try {
      await createPost.mutateAsync({
        kind: 'post',
        text: postContent,
        visibility: 'public',
        hashtags: []
      })
      setPostContent('')
      onClose()
    } catch (error) {
      toast.error('Error al crear el post')
    }
  }

  const handleCreateNote = async () => {
    if (!noteData.title.trim() || noteData.files.length === 0) {
      toast.error('El título y al menos un archivo son requeridos')
      return
    }

    try {
      const formData = new FormData()
      formData.append('title', noteData.title)
      formData.append('description', noteData.description)
      formData.append('subject', noteData.subject)
      formData.append('career', noteData.career)
      formData.append('university', noteData.university)
      formData.append('semester', noteData.semester)
      formData.append('tags', noteData.tags.join(','))
      
      noteData.files.forEach((file, index) => {
        formData.append(`file`, file)
      })

      const response = await fetch('/api/notes', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al crear el apunte')
      }

      setNoteData({
        title: '',
        description: '',
        subject: '',
        career: '',
        university: '',
        semester: '',
        tags: [],
        files: []
      })
      onClose()
      toast.success('Apunte creado exitosamente')
    } catch (error) {
      toast.error('Error al crear el apunte')
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !noteData.tags.includes(tagInput.trim())) {
      setNoteData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNoteData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setNoteData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }))
  }

  const removeFile = (index: number) => {
    setNoteData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Contenido</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="post" className="flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span>Post</span>
            </TabsTrigger>
            <TabsTrigger value="note" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Apunte</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-content">¿Qué estás pensando?</Label>
              <Textarea
                id="post-content"
                placeholder="Comparte algo interesante..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreatePost}
                disabled={!postContent.trim() || createPost.isPending}
              >
                {createPost.isPending ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="note" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="note-title">Título *</Label>
                <Input
                  id="note-title"
                  placeholder="Título del apunte"
                  value={noteData.title}
                  onChange={(e) => setNoteData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-subject">Materia</Label>
                <Input
                  id="note-subject"
                  placeholder="Ej: Matemáticas"
                  value={noteData.subject}
                  onChange={(e) => setNoteData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-description">Descripción</Label>
              <Textarea
                id="note-description"
                placeholder="Describe el contenido del apunte..."
                value={noteData.description}
                onChange={(e) => setNoteData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="note-career">Carrera</Label>
                <Input
                  id="note-career"
                  placeholder="Ej: Ingeniería"
                  value={noteData.career}
                  onChange={(e) => setNoteData(prev => ({ ...prev, career: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-semester">Semestre</Label>
                <Select
                  value={noteData.semester}
                  onValueChange={(value) => setNoteData(prev => ({ ...prev, semester: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>
                        {sem}° Semestre
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Agregar tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Agregar
                </Button>
              </div>
              {noteData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {noteData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Archivos *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Arrastra archivos aquí o haz click para seleccionar
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Seleccionar Archivos
                </Button>
              </div>
              {noteData.files.length > 0 && (
                <div className="space-y-2">
                  {noteData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateNote}
                disabled={!noteData.title.trim() || noteData.files.length === 0}
              >
                Crear Apunte
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
```

## 3. Integración en Páginas Existentes

### 3.1 Actualizar Feed Principal

#### Modificar `app/feed/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Filter } from 'lucide-react'
import { useUnifiedFeed } from '@/hooks/useUnifiedFeed'
import { UnifiedFeedCard } from '@/components/feed/UnifiedFeedCard'
import { CreateContentModal } from '@/components/feed/CreateContentModal'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function FeedPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'posts' | 'notes',
    subject: '',
    career: '',
    sort: 'recent' as 'recent' | 'popular' | 'trending'
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useUnifiedFeed(filters)

  const allItems = data?.pages.flatMap(page => page.items) ?? []

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filtros</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            value={filters.type}
            onValueChange={(value: 'all' | 'posts' | 'notes') => 
              setFilters(prev => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo</SelectItem>
              <SelectItem value="posts">Posts</SelectItem>
              <SelectItem value="notes">Apuntes</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Materia"
            value={filters.subject}
            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
          />

          <Input
            placeholder="Carrera"
            value={filters.career}
            onChange={(e) => setFilters(prev => ({ ...prev, career: e.target.value }))}
          />

          <Select
            value={filters.sort}
            onValueChange={(value: 'recent' | 'popular' | 'trending') => 
              setFilters(prev => ({ ...prev, sort: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recientes</SelectItem>
              <SelectItem value="popular">Populares</SelectItem>
              <SelectItem value="trending">Tendencia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.type !== 'all' && (
            <Badge variant="secondary">
              Tipo: {filters.type === 'posts' ? 'Posts' : 'Apuntes'}
            </Badge>
          )}
          {filters.subject && (
            <Badge variant="secondary">Materia: {filters.subject}</Badge>
          )}
          {filters.career && (
            <Badge variant="secondary">Carrera: {filters.career}</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Error al cargar el contenido
          </div>
        ) : allItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay contenido disponible
          </div>
        ) : (
          <>
            {allItems.map((item) => (
              <UnifiedFeedCard key={`${item.contentType}-${item.id}`} item={item} />
            ))}
            
            {hasNextPage && (
              <div className="flex justify-center py-4">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                >
                  {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Content Modal */}
      <CreateContentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}
```

## 4. Pasos de Implementación

### Fase 1: Backend (Semana 1)
1. Crear API unificada de contenido (`/api/content`)
2. Modificar API de feed existente para incluir notas
3. Implementar API de interacciones unificadas
4. Crear vistas de base de datos para contenido unificado
5. Testing de APIs

### Fase 2: Frontend Core (Semana 2)
1. Crear hook unificado de feed (`useUnifiedFeed`)
2. Desarrollar componente de card unificado
3. Modificar modal de creación para incluir apuntes
4. Implementar sistema de filtros avanzados
5. Testing de componentes

### Fase 3: Integración (Semana 3)
1. Actualizar página de feed principal
2. Modificar página de apuntes para usar componentes unificados
3. Integrar sistema de notificaciones
4. Optimizar performance y caching
5. Testing de integración

### Fase 4: Pulido y Optimización (Semana 4)
1. Implementar lazy loading y virtualización
2. Optimizar queries de base de datos
3. Agregar analytics y métricas
4. Testing de performance
5. Deployment y monitoreo

## 5. Consideraciones Técnicas

### Performance
- Implementar paginación infinita para el feed unificado
- Usar React Query para caching inteligente
- Optimizar queries de base de datos con índices apropiados
- Implementar lazy loading para archivos pesados

### Seguridad
- Validar todos los uploads de archivos
- Implementar rate limiting en APIs
- Sanitizar contenido generado por usuarios
- Verificar permisos de acceso a contenido

### Escalabilidad
- Preparar para migración a CDN para archivos
- Implementar sistema de cache distribuido
- Considerar separación de microservicios en el futuro
- Monitorear métricas de performance

Esta implementación creará una experiencia unificada donde los apuntes se integran naturalmente con el feed social, manteniendo la funcionalidad específica de cada tipo de contenido mientras proporciona una interfaz coherente y intuitiva.