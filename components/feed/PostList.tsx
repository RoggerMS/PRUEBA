'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  HeartIcon, 
  MessageCircleIcon, 
  ShareIcon, 
  BookmarkIcon, 
  MoreHorizontalIcon,
  FileTextIcon,
  DownloadIcon,
  StarIcon,
  LoaderIcon,
  FlameIcon
} from 'lucide-react';
import { useFeed, useFireReaction } from '@/hooks/useFeed';
import { FeedPost } from '@/types/feed';
import { toast } from 'sonner';
import CommentModal from './CommentModal';
import { MediaViewer } from './MediaViewer';

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Hace unos minutos';
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  return `Hace ${Math.floor(diffInHours / 24)}d`;
};

function PostCard({ post }: { post: FeedPost }) {
  const fireReaction = useFireReaction();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const handleFire = async () => {
    try {
      await fireReaction.mutateAsync(post.id);
    } catch (error) {
      toast.error('Error al reaccionar al post');
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/feed/${post.id}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to bookmark post');
      }
      
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? 'Post removido de guardados' : 'Post guardado');
    } catch (error) {
      toast.error('Error al guardar el post');
    }
  };

  const getPostIcon = () => {
    switch (post.kind) {
      case 'note': return '📚';
      case 'question': return '❓';
      case 'photo': return '📷';
      case 'video': return '🎥';
      default: return '💬';
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      {/* Header del post */}
      <div className="flex items-start space-x-3 mb-4">
        <Avatar className="h-10 w-10">
          <img 
            src={post.author.avatar || '/default-avatar.png'} 
            alt={post.author.name}
            className="rounded-full"
          />
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm truncate">{post.author.name}</h3>
            <span className="text-xs">{getPostIcon()}</span>
            {post.author.verified && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                ✓ Verificado
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            @{post.author.username} • {formatTimeAgo(post.createdAt)}
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Contenido específico por tipo */}
      {post.kind === 'note' && post.title && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-900">{post.title}</h4>
            <Badge className="bg-blue-100 text-blue-800">Nota</Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-blue-700">
            <span className="flex items-center">
              <DownloadIcon className="h-3 w-3 mr-1" />
              {post.stats.saves} guardados
            </span>
            <span>👁️ {post.stats.views} vistas</span>
          </div>
        </div>
      )}

      {post.kind === 'question' && post.title && (
        <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-orange-900">{post.title}</h4>
            <Badge className="bg-orange-100 text-orange-800">Pregunta</Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {post.hashtags?.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Contenido del post */}
      <div className="mb-4">
        <p className="text-sm text-gray-800 mb-3">{post.text}</p>
        
        {/* Media content */}
        {post.media && post.media.length > 0 && (
          <div className="mt-3">
            {post.media.length === 1 ? (
              <div 
                className="rounded-lg overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => {
                  setSelectedMediaIndex(0);
                  setShowMediaViewer(true);
                }}
              >
                {post.media[0].type === 'image' ? (
                  <img
                    src={post.media[0].url}
                    alt="Post media"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                ) : (
                  <video
                    src={post.media[0].url}
                    className="w-full h-auto max-h-96 object-cover"
                    controls
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {post.media.slice(0, 4).map((media, index) => (
                  <div 
                    key={media.id} 
                    className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => {
                      setSelectedMediaIndex(index);
                      setShowMediaViewer(true);
                    }}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`Post media ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-32 object-cover"
                        muted
                      />
                    )}
                    {index === 3 && post.media.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          +{post.media.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Tags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.hashtags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Acciones del post */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleFire}
            className={`flex items-center space-x-1 ${post.viewerState.fired ? 'text-orange-600' : 'text-gray-600'}`}
            disabled={fireReaction.isPending}
          >
            <FlameIcon className={`h-4 w-4 ${post.viewerState.fired ? 'fill-orange-600' : ''}`} />
            <span className="text-xs">{post.stats.fires}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowCommentModal(true)}
            className="flex items-center space-x-1 text-gray-600"
          >
            <MessageCircleIcon className="h-4 w-4" />
            <span className="text-xs">{post.stats.comments}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600">
            <ShareIcon className="h-4 w-4" />
            <span className="text-xs">Compartir</span>
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBookmark}
          className={`${isBookmarked ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <BookmarkIcon className={`h-4 w-4 ${isBookmarked ? 'fill-blue-600' : ''}`} />
        </Button>
      </div>
      
      <CommentModal 
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        post={post}
      />
      
      <MediaViewer
        isOpen={showMediaViewer}
        onClose={() => setShowMediaViewer(false)}
        post={post}
        initialMediaIndex={selectedMediaIndex}
      />
      </Card>
    );
}

export default function PostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useFeed();

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
        <p className="text-red-600">Error al cargar los posts</p>
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

  const posts = data?.pages.flatMap(page => page.posts) || [];

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {/* Botón para cargar más posts */}
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
              'Cargar más posts'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}