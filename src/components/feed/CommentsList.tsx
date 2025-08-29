'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  MoreHorizontal,
  Reply,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Heart,
  Flag,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Comment } from '@/types/feed';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CommentsListProps {
  postId: string;
  className?: string;
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  level?: number;
  onReply?: (commentId: string) => void;
}

interface CommentComposerProps {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function CommentsList({ postId, className }: CommentsListProps) {
  const [sortBy, setSortBy] = useState<'relevant' | 'recent'>('relevant');
  const [showComposer, setShowComposer] = useState(false);

  // Fetch comments
  const { 
    data: commentsData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['comments', postId, sortBy],
    queryFn: async () => {
      const response = await fetch(
        `/api/feed/${postId}/comments?sort=${sortBy}&limit=20`
      );
      
      if (!response.ok) {
        throw new Error('Error loading comments');
      }
      
      return response.json();
    }
  });

  const comments = commentsData?.comments || [];
  const topLevelComments = comments.filter((c: Comment) => !c.parentId);

  if (isLoading) {
    return (
      <div className={cn('space-y-4 p-4', className)}>
        {[...Array(3)].map((_, i) => (
          <CommentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-4 text-center text-gray-500', className)}>
        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Error al cargar comentarios</p>
        <Button 
          size="sm" 
          variant="outline" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <h3 className="font-semibold text-gray-900">
          Comentarios ({commentsData?.total || 0})
        </h3>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={sortBy === 'relevant' ? 'default' : 'ghost'}
            onClick={() => setSortBy('relevant')}
            className="text-xs"
          >
            Relevantes
          </Button>
          <Button
            size="sm"
            variant={sortBy === 'recent' ? 'default' : 'ghost'}
            onClick={() => setSortBy('recent')}
            className="text-xs"
          >
            Recientes
          </Button>
        </div>
      </div>

      {/* Main composer */}
      <div className="px-4">
        {showComposer ? (
          <CommentComposer
            postId={postId}
            placeholder="Escribe un comentario..."
            onSubmit={() => setShowComposer(false)}
            onCancel={() => setShowComposer(false)}
            autoFocus
          />
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowComposer(true)}
            className="w-full justify-start text-gray-500 hover:text-gray-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Escribe un comentario...
          </Button>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-1">
        {topLevelComments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium mb-1">No hay comentarios aún</p>
            <p className="text-sm">¡Sé el primero en comentar!</p>
          </div>
        ) : (
          topLevelComments.map((comment: Comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              level={0}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, postId, level = 0, onReply }: CommentItemProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [isFireAnimating, setIsFireAnimating] = useState(false);
  const commentRef = useRef<HTMLDivElement>(null);

  // Get replies for this comment
  const { data: repliesData } = useQuery({
    queryKey: ['comment-replies', comment.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/feed/${postId}/comments?parentId=${comment.id}&limit=10`
      );
      
      if (!response.ok) {
        throw new Error('Error loading replies');
      }
      
      return response.json();
    },
    enabled: showReplies && comment.stats.replies > 0
  });

  const replies = repliesData?.comments || [];

  // Fire reaction on comment
  const fireCommentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/comments/${comment.id}/fire`, {
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
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });
      
      queryClient.setQueryData(['comments', postId], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          comments: old.comments.map((c: Comment) => 
            c.id === comment.id 
              ? {
                  ...c,
                  stats: {
                    ...c.stats,
                    fires: c.viewerState.fired 
                      ? c.stats.fires - 1 
                      : c.stats.fires + 1
                  },
                  viewerState: {
                    ...c.viewerState,
                    fired: !c.viewerState.fired
                  }
                }
              : c
          )
        };
      });
      
      return { comment };
    },
    onError: (err, variables, context) => {
      toast.error('Error al reaccionar', {
        description: err instanceof Error ? err.message : 'Intenta de nuevo'
      });
      
      // Refetch to get correct state
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onSuccess: () => {
      setIsFireAnimating(true);
      setTimeout(() => setIsFireAnimating(false), 600);
    }
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!commentRef.current) return;
      
      const rect = commentRef.current.getBoundingClientRect();
      const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
      
      if (!isInView) return;
      
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          handleFireReaction();
          break;
        case 'r':
          e.preventDefault();
          setShowReplyComposer(true);
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
    fireCommentMutation.mutate();
  };

  const handleReply = () => {
    if (!session) {
      toast.error('Inicia sesión para responder');
      return;
    }
    setShowReplyComposer(true);
  };

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: es
  });

  const maxLevel = 3; // Maximum nesting level
  const shouldNest = level < maxLevel;

  return (
    <div 
      ref={commentRef}
      className={cn(
        'group',
        level > 0 && 'ml-8 border-l-2 border-gray-100 pl-4'
      )}
    >
      <div className="flex space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage 
            src={comment.author.avatar || ''} 
            alt={comment.author.name}
          />
          <AvatarFallback className="text-xs">
            {comment.author.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Comment header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-sm text-gray-900">
              {comment.author.name}
            </span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          
          {/* Comment text */}
          <div className="text-sm text-gray-800 leading-relaxed mb-2">
            {comment.text}
          </div>
          
          {/* Comment actions */}
          <div className="flex items-center space-x-4">
            {/* Fire reaction */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFireReaction}
              disabled={fireCommentMutation.isPending}
              className={cn(
                'h-6 px-2 text-xs transition-all duration-200',
                comment.viewerState.fired 
                  ? 'text-orange-600 hover:text-orange-700' 
                  : 'text-gray-500 hover:text-orange-600',
                isFireAnimating && 'animate-bounce'
              )}
            >
              <span className={cn(
                'mr-1 transition-transform duration-200',
                isFireAnimating && 'scale-125'
              )}>
                🔥
              </span>
              {comment.stats.fires > 0 && (
                <span>{comment.stats.fires}</span>
              )}
            </Button>
            
            {/* Reply */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReply}
              className="h-6 px-2 text-xs text-gray-500 hover:text-blue-600"
            >
              <Reply className="w-3 h-3 mr-1" />
              Responder
            </Button>
            
            {/* More options */}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Reply composer */}
      {showReplyComposer && (
        <div className="ml-11 mb-3">
          <CommentComposer
            postId={postId}
            parentId={comment.id}
            placeholder={`Responder a ${comment.author.name}...`}
            onSubmit={() => {
              setShowReplyComposer(false);
              setShowReplies(true);
            }}
            onCancel={() => setShowReplyComposer(false)}
            autoFocus
          />
        </div>
      )}

      {/* Show replies toggle */}
      {comment.stats.replies > 0 && (
        <div className="ml-11 mb-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowReplies(!showReplies)}
            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
          >
            {showReplies ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Ocultar respuestas
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Ver {comment.stats.replies} respuesta{comment.stats.replies !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="space-y-1">
          {replies.map((reply: Comment) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              level={shouldNest ? level + 1 : level}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentComposer({ 
  postId, 
  parentId, 
  placeholder = "Escribe un comentario...", 
  onSubmit, 
  onCancel,
  autoFocus = false 
}: CommentComposerProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createCommentMutation = useMutation({
    mutationFn: async (data: { text: string; parentId?: string }) => {
      const response = await fetch(`/api/feed/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error creating comment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setText('');
      onSubmit?.();
      
      // Invalidate comments to refetch
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: ['comment-replies', parentId] });
      }
      
      toast.success('¡Comentario publicado!');
    },
    onError: (err) => {
      toast.error('Error al publicar comentario', {
        description: err instanceof Error ? err.message : 'Intenta de nuevo'
      });
    }
  });

  const handleSubmit = () => {
    if (!session) {
      toast.error('Inicia sesión para comentar');
      return;
    }
    
    if (!text.trim()) {
      toast.error('Escribe algo antes de publicar');
      return;
    }
    
    createCommentMutation.mutate({ text: text.trim(), parentId });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    
    if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  if (!session) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Inicia sesión para comentar
        </p>
        <Button size="sm" variant="outline">
          Iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex space-x-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage 
            src={session.user?.image || ''} 
            alt={session.user?.name || ''}
          />
          <AvatarFallback className="text-xs">
            {session.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[80px] resize-none border-gray-200 focus:border-orange-300 focus:ring-orange-200"
            disabled={createCommentMutation.isPending}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between ml-11">
        <p className="text-xs text-gray-500">
          Presiona Enter para enviar, Shift+Enter para nueva línea
        </p>
        
        <div className="flex items-center space-x-2">
          {onCancel && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              disabled={createCommentMutation.isPending}
            >
              Cancelar
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!text.trim() || createCommentMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {createCommentMutation.isPending ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-3 h-3 mr-1" />
                Comentar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex space-x-3 p-3">
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center space-x-4">
          <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}