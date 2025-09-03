'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  MessageCircleIcon,
  MoreHorizontalIcon,
  SendIcon,
  ReplyIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LoaderIcon
} from 'lucide-react';
import { FeedPost, Comment } from '@/types/feed';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Ahora';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  return `${Math.floor(diffInMinutes / 1440)}d`;
};

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReply: (commentId: string, parentAuthor: string) => void;
  depth?: number;
}

function CommentItem({ comment, postId, onReply, depth = 0 }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(depth < 2); // Auto-expand first 2 levels
  const [isLiked, setIsLiked] = useState(comment.viewerState?.liked || false);
  const [likeCount, setLikeCount] = useState(comment.stats.likes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    const newLiked = !isLiked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    
    // Optimistic update
    setIsLiked(newLiked);
    setLikeCount(newCount);
    
    try {
      const response = await fetch(`/api/feed/${postId}/comments/${comment.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to like comment');
      }
    } catch (error) {
      // Revert optimistic update
      setIsLiked(!newLiked);
      setLikeCount(newLiked ? newCount - 1 : newCount + 1);
      toast.error('Error al reaccionar al comentario');
    } finally {
      setIsLiking(false);
    }
  };

  const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 12)}` : '';
  const maxDepth = 4;

  return (
    <div className={`${indentClass} ${depth > 0 ? 'border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="flex space-x-3 py-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <img 
            src={comment.author.avatar || '/default-avatar.png'} 
            alt={comment.author.name}
            className="rounded-full"
          />
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-2xl px-3 py-2">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-sm">{comment.author.name}</span>
              {comment.author.verified && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 px-1 py-0">
                  ✓
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-800">{comment.text}</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
            <span>{formatTimeAgo(comment.createdAt)}</span>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              disabled={isLiking}
              className={`h-auto p-0 text-xs font-semibold ${
                isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              Me gusta {likeCount > 0 && `(${likeCount})`}
            </Button>
            
            {depth < maxDepth && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onReply(comment.id, comment.author.name)}
                className="h-auto p-0 text-xs font-semibold text-gray-500 hover:text-blue-600"
              >
                Responder
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="h-auto p-0">
              <MoreHorizontalIcon className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {!showReplies ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowReplies(true)}
                  className="h-auto p-0 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <ChevronDownIcon className="h-3 w-3 mr-1" />
                  Ver {comment.replies.length} respuesta{comment.replies.length !== 1 ? 's' : ''}
                </Button>
              ) : (
                <>
                  {depth > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowReplies(false)}
                      className="h-auto p-0 text-xs font-semibold text-gray-500 hover:text-gray-700 mb-2"
                    >
                      <ChevronUpIcon className="h-3 w-3 mr-1" />
                      Ocultar respuestas
                    </Button>
                  )}
                  {comment.replies.map((reply) => (
                    <CommentItem 
                      key={reply.id} 
                      comment={reply} 
                      postId={postId}
                      onReply={onReply}
                      depth={depth + 1}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: FeedPost;
  onCommentAdded?: () => void;
}

export default function CommentModal({ isOpen, onClose, post, onCommentAdded }: CommentModalProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load comments when modal opens
  useEffect(() => {
    if (isOpen && post.id) {
      loadComments();
    }
  }, [isOpen, post.id]);

  // Focus textarea when replying
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/feed/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      toast.error('Error al cargar comentarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('El comentario está vacío');
      return;
    }
    if (!session?.user) {
      toast.error('Debes iniciar sesión para comentar');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/feed/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment.trim(),
          parentId: replyingTo?.id || null
        })
      });
      
      if (response.ok) {
        const newCommentData = await response.json();
        
        if (replyingTo) {
          // Add reply to existing comment
          setComments(prev => updateCommentsWithReply(prev, replyingTo.id, newCommentData));
        } else {
          // Add new top-level comment
          setComments(prev => [newCommentData, ...prev]);
        }
        
        setNewComment('');
        setReplyingTo(null);
        toast.success('Comentario publicado');
        onCommentAdded?.();
      } else {
        throw new Error('Failed to post comment');
      }
    } catch (error) {
      toast.error('Error al publicar comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCommentsWithReply = (comments: Comment[], parentId: string, reply: Comment): Comment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [reply, ...(comment.replies || [])],
          stats: { ...comment.stats, replies: comment.stats.replies + 1 }
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentsWithReply(comment.replies, parentId, reply)
        };
      }
      return comment;
    });
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo({ id: commentId, author: authorName });
    setNewComment(`@${authorName} `);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircleIcon className="h-5 w-5" />
            <span>Comentarios</span>
            <Badge variant="outline">{comments.length}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full max-h-[60vh]">
          {/* Comments List */}
          <ScrollArea className="flex-1 px-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoaderIcon className="h-6 w-6 animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircleIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Sé el primero en comentar</p>
              </div>
            ) : (
              <div className="space-y-1">
                {comments.map((comment) => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    postId={post.id}
                    onReply={handleReply}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
          
          <Separator />
          
          {/* Comment Input */}
          <div className="p-6 pt-4">
            {replyingTo && (
              <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  Respondiendo a <strong>{replyingTo.author}</strong>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={cancelReply}
                  className="h-auto p-1 text-blue-600 hover:text-blue-700"
                >
                  ✕
                </Button>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <img 
                  src={session?.user?.image || '/default-avatar.png'} 
                  alt={session?.user?.name || 'Usuario'}
                  className="rounded-full"
                />
              </Avatar>
              
              <div className="flex-1">
                <Textarea 
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyingTo ? `Responder a ${replyingTo.author}...` : 'Escribe un comentario...'}
                  className="min-h-[60px] resize-none border-gray-200 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleSubmitComment();
                    }
                  }}
                />
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    Presiona Ctrl+Enter para enviar
                  </span>
                  
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                    className="ml-2"
                  >
                    {isSubmitting ? (
                      <LoaderIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <SendIcon className="h-4 w-4 mr-1" />
                        {replyingTo ? 'Responder' : 'Comentar'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}