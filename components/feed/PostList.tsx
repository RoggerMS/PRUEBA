'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  FlameIcon,
  MessageCircleIcon,
  ShareIcon,
  BookmarkIcon,
  MoreHorizontalIcon,
  FileTextIcon,
  DownloadIcon,
  StarIcon,
  LoaderIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { useFeed, useFireReaction, useFollowUser, useReportPost, useBookmarkPost } from '@/hooks/useFeed';
import { FeedPost } from '@/types/feed';
import { toast } from 'sonner';
import CommentModal from './CommentModal';
import { MediaViewer } from './MediaViewer';
import { useSession } from 'next-auth/react';

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
  const followUser = useFollowUser();
  const reportPost = useReportPost();
  const bookmarkPost = useBookmarkPost();
  const { data: session } = useSession();
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isFired, setIsFired] = useState(post.viewerState.fired);
  const [fireCount, setFireCount] = useState(post.stats.fires);
  const [fireAnimating, setFireAnimating] = useState(false);
  const [commentCount, setCommentCount] = useState(post.stats.comments);
  const [isSaved, setIsSaved] = useState(post.viewerState.saved);

  const handleFire = async () => {
    const newFired = !isFired;
    setIsFired(newFired);
    setFireCount((c) => c + (newFired ? 1 : -1));
    if (newFired) {
      setFireAnimating(true);
      setTimeout(() => setFireAnimating(false), 300);
    }

    try {
      await fireReaction.mutateAsync(post.id);
    } catch (error) {
      setIsFired(!newFired);
      setFireCount((c) => c + (newFired ? -1 : 1));
      toast.error('Error al reaccionar al post');
    }
  };

  const handleBookmark = async () => {
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    try {
      await bookmarkPost.mutateAsync(post.id);
    } catch (error) {
      setIsSaved(!newSaved);
    }
  };

  const handleFollow = async () => {
    try {
      await followUser.mutateAsync({
        userId: post.author.id,
        action: 'follow'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Enlace copiado al portapapeles');
      }
    } catch (error) {
      toast.error('Error al compartir el post');
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar el enlace');
    }
  };

  const handleReport = async () => {
     if (!reportReason.trim()) {
       toast.error('Por favor selecciona una razón para reportar');
       return;
     }
     
     try {
       await reportPost.mutateAsync({ 
         postId: post.id, 
         reason: reportReason 
       });
       setShowReportModal(false);
       setReportReason('');
     } catch (error) {
       // Error handling is done in the hook
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
        <Link href={`/u/${post.author.username}`} className="h-10 w-10">
          <Avatar className="h-10 w-10">
            <img
              src={post.author.avatar || '/default-avatar.png'}
              alt={post.author.name}
              className="rounded-full"
            />
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Link href={`/u/${post.author.username}`} className="hover:underline">
              <h3 className="font-semibold text-sm truncate">{post.author.name}</h3>
            </Link>
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
        {session?.user?.id !== post.author.id && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleFollow}
            className="mr-2"
            disabled={followUser.isPending}
          >
            Seguir
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleShare}>
              Compartir
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleCopyLink}>
              Copiar enlace
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleBookmark}>
              {isSaved ? 'Quitar de guardados' : 'Guardar'}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowReportModal(true)}>
              Reportar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
            className={`flex items-center space-x-1 ${isFired ? 'text-orange-600' : 'text-gray-600'}`}
            disabled={fireReaction.isPending}
          >
            <FlameIcon className={`h-4 w-4 transition-transform ${isFired ? 'fill-orange-600' : ''} ${fireAnimating ? 'animate-bounce' : ''}`} />
            <span className="text-xs">{fireCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommentModal(true)}
            className="flex items-center space-x-1 text-gray-600"
          >
            <MessageCircleIcon className="h-4 w-4" />
            <span className="text-xs">{commentCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-1 text-gray-600"
          >
            <ShareIcon className="h-4 w-4" />
            <span className="text-xs">Compartir</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`${isSaved ? 'text-blue-600' : 'text-gray-600'}`}
            disabled={bookmarkPost.isPending}
          >
            <BookmarkIcon className={`h-4 w-4 ${isSaved ? 'fill-blue-600' : ''}`} />
          </Button>
        </div>
      </div>

      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        post={post}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />
      
      <MediaViewer
        isOpen={showMediaViewer}
        onClose={() => setShowMediaViewer(false)}
        post={post}
        initialMediaIndex={selectedMediaIndex}
      />
      
      {/* Modal de reporte */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Reportar Post</h3>
            <div className="space-y-3 mb-4">
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="reportReason" 
                  value="spam" 
                  onChange={(e) => setReportReason(e.target.value)}
                  className="text-red-600"
                />
                <span className="text-sm">Spam o contenido no deseado</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="reportReason" 
                  value="harassment" 
                  onChange={(e) => setReportReason(e.target.value)}
                  className="text-red-600"
                />
                <span className="text-sm">Acoso o intimidación</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="reportReason" 
                  value="inappropriate" 
                  onChange={(e) => setReportReason(e.target.value)}
                  className="text-red-600"
                />
                <span className="text-sm">Contenido inapropiado</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="reportReason" 
                  value="misinformation" 
                  onChange={(e) => setReportReason(e.target.value)}
                  className="text-red-600"
                />
                <span className="text-sm">Información falsa</span>
              </label>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleReport}
                disabled={!reportReason || reportPost.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {reportPost.isPending ? 'Reportando...' : 'Reportar'}
              </Button>
            </div>
          </div>
        </div>
      )}
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