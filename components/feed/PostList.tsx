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
import { useFeed, useFireReaction, useBookmark } from '@/hooks/useFeed';
import { FeedPost } from '@/types/feed';
import { toast } from 'sonner';

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
  const bookmarkMutation = useBookmark();

  const handleFire = async () => {
    try {
      await fireReaction.mutateAsync(post.id);
    } catch (error) {
      toast.error('Error al reaccionar al post');
    }
  };

  const handleBookmark = async () => {
    try {
      await bookmarkMutation.mutateAsync(post.id);
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
      {post.type === 'note' && post.noteData && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-900">{post.noteData.title}</h4>
            <Badge className="bg-blue-100 text-blue-800">{post.noteData.fileType}</Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-blue-700">
            <span className="flex items-center">
              <DownloadIcon className="h-3 w-3 mr-1" />
              {post.noteData.downloads} descargas
            </span>
            <span>⭐ {post.noteData.rating}/5</span>
            <span>📖 {post.noteData.subject}</span>
          </div>
        </div>
      )}

      {post.type === 'question' && post.questionData && (
        <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-orange-900">{post.questionData.title}</h4>
            {post.questionData.isSolved && (
              <Badge className="bg-green-100 text-green-800">✅ Resuelto</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {post.questionData.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Contenido del post */}
      <div className="mb-4">
        <p className="text-sm text-gray-800 mb-3">{post.content}</p>
        
        {/* Media content */}
        {post.media && post.media.length > 0 && (
          <div className="mt-3 rounded-lg overflow-hidden">
            {post.media[0].type === 'image' && (
              <img 
                src={post.media[0].url} 
                alt="Post image" 
                className="w-full max-h-96 object-cover"
              />
            )}
            {post.media[0].type === 'video' && (
              <video 
                src={post.media[0].url} 
                controls 
                className="w-full max-h-96"
              />
            )}
          </div>
        )}
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map((tag, index) => (
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
          
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600">
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
          className={`${post.viewerState.saved ? 'text-blue-600' : 'text-gray-600'}`}
          disabled={bookmarkMutation.isPending}
        >
          <BookmarkIcon className={`h-4 w-4 ${post.viewerState.saved ? 'fill-blue-600' : ''}`} />
        </Button>
      </div>
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