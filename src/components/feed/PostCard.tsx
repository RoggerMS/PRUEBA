'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  Eye,
  Calendar,
  ExternalLink,
  Play,
  Download,
  Flag,
  Copy,
  Link
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FeedPost, VisibilityLevel } from '@/types/feed';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

interface PostCardProps {
  post: FeedPost;
  priority?: boolean;
  className?: string;
}

const VISIBILITY_ICONS = {
  public: Globe,
  university: Users,
  friends: Users,
  private: Lock
};

const VISIBILITY_LABELS = {
  public: 'Público',
  university: 'Universidad',
  friends: 'Amigos',
  private: 'Privado'
};

export function PostCard({ post, priority = false, className }: PostCardProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isFireAnimating, setIsFireAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const VisibilityIcon = VISIBILITY_ICONS[post.visibility];

  // Fire reaction mutation
  const fireReactionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/feed/${post.id}/fire`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error toggling fire reaction');
      }
      
      return response.json();
    },
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      const previousData = queryClient.getQueriesData({ queryKey: ['feed'] });
      
      queryClient.setQueriesData({ queryKey: ['feed'] }, (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: FeedPost) => 
              p.id === post.id 
                ? {
                    ...p,
                    stats: {
                      ...p.stats,
                      fires: p.viewerState.fired 
                        ? p.stats.fires - 1 
                        : p.stats.fires + 1
                    },
                    viewerState: {
                      ...p.viewerState,
                      fired: !p.viewerState.fired
                    }
                  }
                : p
            )
          }))
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast.error('Error al reaccionar', {
        description: err instanceof Error ? err.message : 'Intenta de nuevo'
      });
    },
    onSuccess: () => {
      // Fire animation
      setIsFireAnimating(true);
      setTimeout(() => setIsFireAnimating(false), 600);
    }
  });

  // Save post mutation
  const savePostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/feed/${post.id}/save`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error saving post');
      }
      
      return response.json();
    },
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      queryClient.setQueriesData({ queryKey: ['feed'] }, (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: FeedPost) => 
              p.id === post.id 
                ? {
                    ...p,
                    viewerState: {
                      ...p.viewerState,
                      saved: !p.viewerState.saved
                    }
                  }
                : p
            )
          }))
        };
      });
    },
    onError: (err) => {
      toast.error('Error al guardar', {
        description: err instanceof Error ? err.message : 'Intenta de nuevo'
      });
      
      // Refetch to get correct state
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onSuccess: (data) => {
      toast.success(
        data.saved ? '¡Post guardado!' : 'Post removido de guardados',
        {
          description: data.saved 
            ? 'Puedes encontrarlo en tu sección de guardados' 
            : 'Ya no está en tu sección de guardados'
        }
      );
    }
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const isInView = rect.top >= 0 && rect.top <= window.innerHeight / 2;
      
      if (!isInView) return;
      
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          handleFireReaction();
          break;
        case 'c':
          e.preventDefault();
          setShowComments(true);
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleSavePost();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFireReaction = () => {
    if (!session) {
      toast.error('Inicia sesión para reaccionar');
      return;
    }
    fireReactionMutation.mutate();
  };

  const handleSavePost = () => {
    if (!session) {
      toast.error('Inicia sesión para guardar posts');
      return;
    }
    savePostMutation.mutate();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${post.author.name}`,
          text: post.text?.slice(0, 100) + '...',
          url
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('¡Enlace copiado!', {
        description: 'El enlace del post se copió al portapapeles'
      });
    }
  };

  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const renderHashtags = (text: string) => {
    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index}>
            <a 
              href={`/search?q=${encodeURIComponent(word)}`}
              className="text-orange-600 hover:text-orange-700 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {word}
            </a>
            {' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    return (
      <div className="mt-4">
        {post.media.length === 1 ? (
          <MediaItem media={post.media[0]} priority={priority} />
        ) : (
          <div className={cn(
            'grid gap-2',
            post.media.length === 2 ? 'grid-cols-2' :
            post.media.length === 3 ? 'grid-cols-2' :
            'grid-cols-2'
          )}>
            {post.media.slice(0, 4).map((media, index) => (
              <div key={index} className={cn(
                post.media!.length === 3 && index === 0 ? 'row-span-2' : ''
              )}>
                <MediaItem 
                  media={media} 
                  priority={priority && index === 0}
                  showOverlay={index === 3 && post.media!.length > 4}
                  overlayCount={post.media!.length - 4}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es
  });

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'overflow-hidden transition-all duration-200 hover:shadow-lg border-gray-200',
        className
      )}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={post.author.avatar || ''} 
                  alt={post.author.name}
                />
                <AvatarFallback>
                  {post.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 hover:text-orange-600 cursor-pointer">
                    {post.author.name}
                  </h3>
                  {post.author.verified && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      ✓
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{timeAgo}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <VisibilityIcon className="w-3 h-3" />
                    <span>{VISIBILITY_LABELS[post.visibility]}</span>
                  </div>
                  {post.kind !== 'post' && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {post.kind === 'question' ? 'Pregunta' :
                         post.kind === 'note' ? 'Apunte' :
                         post.kind === 'photo' ? 'Foto' : 'Video'}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-2">
          {/* Title for questions and notes */}
          {post.title && (
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {post.title}
            </h2>
          )}
          
          {/* Text content */}
          {post.text && (
            <div className="text-gray-800 leading-relaxed">
              {isExpanded ? (
                <div>{renderHashtags(post.text)}</div>
              ) : (
                <div>
                  {renderHashtags(truncateText(post.text))}
                  {post.text.length > 300 && (
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="text-orange-600 hover:text-orange-700 font-medium ml-1"
                    >
                      ver más
                    </button>
                  )}
                </div>
              )}
              
              {isExpanded && post.text.length > 300 && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-orange-600 hover:text-orange-700 font-medium mt-2 block"
                >
                  ver menos
                </button>
              )}
            </div>
          )}
          
          {/* Media */}
          {renderMedia()}
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Fire reaction */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFireReaction}
                disabled={fireReactionMutation.isPending}
                className={cn(
                  'flex items-center space-x-2 transition-all duration-200',
                  post.viewerState.fired 
                    ? 'text-orange-600 hover:text-orange-700' 
                    : 'text-gray-600 hover:text-orange-600',
                  isFireAnimating && 'animate-bounce'
                )}
              >
                <span className={cn(
                  'text-lg transition-transform duration-200',
                  isFireAnimating && 'scale-125'
                )}>
                  🔥
                </span>
                <span className="font-medium">{post.stats.fires}</span>
              </Button>
              
              {/* Comments */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{post.stats.comments}</span>
              </Button>
              
              {/* Share */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
              >
                <Share2 className="w-4 h-4" />
                <span>{post.stats.shares}</span>
              </Button>
            </div>
            
            {/* Save */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSavePost}
              disabled={savePostMutation.isPending}
              className={cn(
                'transition-colors duration-200',
                post.viewerState.saved 
                  ? 'text-yellow-600 hover:text-yellow-700' 
                  : 'text-gray-600 hover:text-yellow-600'
              )}
            >
              {post.viewerState.saved ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="border-t border-gray-100">
            {/* Comments will be rendered here */}
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Los comentarios se mostrarán aquí</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Media item component
function MediaItem({ 
  media, 
  priority = false, 
  showOverlay = false, 
  overlayCount = 0 
}: { 
  media: any; 
  priority?: boolean; 
  showOverlay?: boolean; 
  overlayCount?: number; 
}) {
  const [isLoading, setIsLoading] = useState(true);

  if (media.type.startsWith('image/')) {
    return (
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
        <Image
          src={media.url}
          alt={media.alt || 'Post image'}
          fill
          priority={priority}
          className={cn(
            'object-cover transition-all duration-300 group-hover:scale-105',
            isLoading && 'blur-sm'
          )}
          onLoad={() => setIsLoading(false)}
        />
        
        {showOverlay && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              +{overlayCount}
            </span>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  if (media.type.startsWith('video/')) {
    return (
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
        <video
          src={media.url}
          className="w-full h-full object-cover"
          preload="metadata"
        />
        
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
          <div className="bg-white/90 rounded-full p-3 group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  // Document/file
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
      <div className="flex items-center space-x-3">
        <div className="bg-orange-100 p-2 rounded-lg">
          <ExternalLink className="w-5 h-5 text-orange-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {media.name || 'Documento'}
          </p>
          <p className="text-sm text-gray-500">
            {media.size ? `${(media.size / 1024 / 1024).toFixed(1)} MB` : 'Archivo'}
          </p>
        </div>
        
        <Button size="sm" variant="ghost">
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}