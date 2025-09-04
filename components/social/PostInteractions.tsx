'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  Send,
  MoreHorizontal,
  Flag,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Laugh,
  Angry,
  Sad
} from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

interface PostInteractionsProps {
  postId: string;
  initialLikes?: number;
  initialComments?: number;
  initialShares?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  comments?: Comment[];
  onLike?: (postId: string) => Promise<void>;
  onUnlike?: (postId: string) => Promise<void>;
  onComment?: (postId: string, content: string) => Promise<void>;
  onShare?: (postId: string, platform?: string) => void;
  onBookmark?: (postId: string) => Promise<void>;
  onReport?: (postId: string, reason: string) => Promise<void>;
  className?: string;
}

const reactionEmojis = [
  { icon: Heart, label: 'Me gusta', color: 'text-red-500' },
  { icon: ThumbsUp, label: 'Excelente', color: 'text-blue-500' },
  { icon: Laugh, label: 'Divertido', color: 'text-yellow-500' },
  { icon: Sad, label: 'Triste', color: 'text-gray-500' },
  { icon: Angry, label: 'Molesto', color: 'text-orange-500' }
];

export function PostInteractions({
  postId,
  initialLikes = 0,
  initialComments = 0,
  initialShares = 0,
  isLiked = false,
  isBookmarked = false,
  comments = [],
  onLike,
  onUnlike,
  onComment,
  onShare,
  onBookmark,
  onReport,
  className = ''
}: PostInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [showReactions, setShowReactions] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<number | null>(null);

  const handleLike = async () => {
    try {
      if (liked) {
        await onUnlike?.(postId);
        setLikes(prev => prev - 1);
        setLiked(false);
        setSelectedReaction(null);
      } else {
        await onLike?.(postId);
        setLikes(prev => prev + 1);
        setLiked(true);
        setSelectedReaction(0); // Default to heart
      }
    } catch (error) {
      toast.error('Error al actualizar la reacción');
    }
  };

  const handleReaction = async (reactionIndex: number) => {
    try {
      if (selectedReaction === reactionIndex) {
        // Remove reaction
        await onUnlike?.(postId);
        setLikes(prev => prev - 1);
        setLiked(false);
        setSelectedReaction(null);
      } else {
        // Add or change reaction
        if (!liked) {
          await onLike?.(postId);
          setLikes(prev => prev + 1);
          setLiked(true);
        }
        setSelectedReaction(reactionIndex);
      }
    } catch (error) {
      toast.error('Error al actualizar la reacción');
    }
    setShowReactions(false);
  };

  const handleBookmark = async () => {
    try {
      await onBookmark?.(postId);
      setBookmarked(!bookmarked);
      toast.success(bookmarked ? 'Eliminado de guardados' : 'Guardado correctamente');
    } catch (error) {
      toast.error('Error al guardar la publicación');
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      await onComment?.(postId, newComment);
      setNewComment('');
      toast.success('Comentario agregado');
    } catch (error) {
      toast.error('Error al agregar comentario');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = (platform?: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    const shareText = 'Mira esta publicación interesante';
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast.success('Enlace copiado al portapapeles');
        break;
      default:
        onShare?.(postId, platform);
    }
    
    setIsShareOpen(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const SelectedReactionIcon = selectedReaction !== null ? reactionEmojis[selectedReaction].icon : Heart;
  const reactionColor = selectedReaction !== null ? reactionEmojis[selectedReaction].color : '';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Interaction Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like/Reaction Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setTimeout(() => setShowReactions(false), 200)}
              className={`flex items-center gap-2 transition-all duration-200 ${
                liked ? `${reactionColor} hover:bg-red-50` : 'hover:bg-gray-50'
              }`}
            >
              <SelectedReactionIcon className={`w-5 h-5 ${liked ? reactionColor : 'text-gray-500'}`} />
              <span className={liked ? reactionColor : 'text-gray-600'}>
                {formatNumber(likes)}
              </span>
            </Button>

            {/* Reaction Picker */}
            {showReactions && (
              <div 
                className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 flex gap-1 z-10"
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
              >
                {reactionEmojis.map((reaction, index) => {
                  const IconComponent = reaction.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(index)}
                      className={`p-2 hover:bg-gray-100 transition-all duration-200 ${
                        selectedReaction === index ? 'bg-gray-100' : ''
                      }`}
                      title={reaction.label}
                    >
                      <IconComponent className={`w-5 h-5 ${reaction.color}`} />
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCommentsOpen(true)}
            className="flex items-center gap-2 hover:bg-gray-50"
          >
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">{formatNumber(initialComments)}</span>
          </Button>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-2 hover:bg-gray-50"
          >
            <Share2 className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">{formatNumber(initialShares)}</span>
          </Button>
        </div>

        {/* Bookmark Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className="hover:bg-gray-50"
        >
          {bookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-blue-500" />
          ) : (
            <Bookmark className="w-5 h-5 text-gray-500" />
          )}
        </Button>
      </div>

      {/* Comments Dialog */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Comentarios ({comments.length})</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback>
                    {comment.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-sm text-gray-900">
                      @{comment.username}
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                      <Heart className="w-3 h-3 mr-1" />
                      {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Comment */}
          <div className="border-t pt-4 mt-4">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>Tú</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {newComment.length}/500
                  </span>
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    size="sm"
                  >
                    {isSubmittingComment ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Comentar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compartir publicación</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2 h-12"
            >
              <Twitter className="w-5 h-5 text-blue-400" />
              Twitter
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-2 h-12"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              Facebook
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleShare('linkedin')}
              className="flex items-center gap-2 h-12"
            >
              <Linkedin className="w-5 h-5 text-blue-700" />
              LinkedIn
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleShare('copy')}
              className="flex items-center gap-2 h-12"
            >
              <Copy className="w-5 h-5" />
              Copiar enlace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PostInteractions;