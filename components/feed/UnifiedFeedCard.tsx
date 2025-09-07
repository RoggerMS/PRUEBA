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
  Image as ImageIcon,
  Play
} from 'lucide-react'
import { useContentInteraction } from '@/hooks/useUnifiedFeed'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { UnifiedContentItem } from '@/hooks/useUnifiedFeed'

interface UnifiedFeedCardProps {
  item: UnifiedContentItem
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
  const isLiked = item.viewerState?.liked || false
  const isBookmarked = item.viewerState?.saved || false

  return (
    <Card className="w-full mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.author.image} alt={item.author.name} />
              <AvatarFallback>{item.author.name?.[0] || 'U'}</AvatarFallback>
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
                    <span className="text-sm font-medium">
                      {item.fileName || 'Archivo adjunto'}
                    </span>
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
            {item.imageUrl && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt="Post image" 
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}
            {item.videoUrl && (
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video 
                  src={item.videoUrl} 
                  className="w-full h-auto max-h-96"
                  controls
                  preload="metadata"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            )}
          </div>
        )}

        {/* Estadísticas y acciones */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center space-x-4">
            {!isNote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInteraction(isLiked ? 'unlike' : 'like')}
                className={isLiked ? 'text-red-600' : ''}
                disabled={interaction.isPending}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
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
              onClick={() => handleInteraction(isBookmarked ? 'unbookmark' : 'bookmark')}
              className={isBookmarked ? 'text-blue-600' : ''}
              disabled={interaction.isPending}
            >
              <Bookmark className={`h-4 w-4 mr-1 ${isBookmarked ? 'fill-current' : ''}`} />
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