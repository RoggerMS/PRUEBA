'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share,
  Download,
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Send
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface Post {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
  };
  createdAt: string;
  media: MediaItem[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  viewerState: {
    liked: boolean;
    bookmarked: boolean;
  };
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  initialMediaIndex?: number;
}

export function MediaViewer({ isOpen, onClose, post, initialMediaIndex = 0 }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialMediaIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(post.viewerState.liked);
  const [likeCount, setLikeCount] = useState(post.stats.likes);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const currentMedia = post.media[currentIndex];
  const hasMultipleMedia = post.media.length > 1;

  // Load comments when viewer opens
  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, post.id]);

  // Reset media index when post changes
  useEffect(() => {
    setCurrentIndex(initialMediaIndex);
  }, [post.id, initialMediaIndex]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/feed/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handlePrevious = useCallback(() => {
    if (hasMultipleMedia) {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : post.media.length - 1));
    }
  }, [hasMultipleMedia, post.media.length]);

  const handleNext = useCallback(() => {
    if (hasMultipleMedia) {
      setCurrentIndex((prev) => (prev < post.media.length - 1 ? prev + 1 : 0));
    }
  }, [hasMultipleMedia, post.media.length]);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/feed/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Error al dar like');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post de ${post.author.name}`,
          text: post.text,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `media-${currentMedia.id}.${currentMedia.type === 'image' ? 'jpg' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Error al descargar');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/feed/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
        toast.success('Comentario agregado');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Error al agregar comentario');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const response = await fetch(`/api/feed/${post.id}/comments/${commentId}/like`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, isLiked: data.isLiked, likes: data.likeCount }
            : comment
        ));
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          if (currentMedia.type === 'video') {
            e.preventDefault();
            setIsPlaying(prev => !prev);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrevious, handleNext, currentMedia.type]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black">
        <div className="flex h-full">
          {/* Media Display Area */}
          <div className="flex-1 relative flex items-center justify-center bg-black">
            {/* Navigation Arrows */}
            {hasMultipleMedia && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Media Content */}
            {currentMedia.type === 'image' ? (
              <img
                src={currentMedia.url}
                alt="Media content"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="relative">
                <video
                  src={currentMedia.url}
                  className="max-w-full max-h-full object-contain"
                  controls={false}
                  autoPlay={isPlaying}
                  muted={isMuted}
                  loop
                />
                
                {/* Video Controls */}
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Media Counter */}
            {hasMultipleMedia && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {post.media.length}
              </div>
            )}

            {/* Top Controls */}
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={handleDownload}
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-96 bg-white flex flex-col">
            {/* Post Header */}
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm">{post.author.name}</h3>
                    {post.author.verified && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">@{post.author.username} • {formatTimeAgo(post.createdAt)}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              {post.text && (
                <p className="mt-3 text-sm text-gray-800">{post.text}</p>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`flex items-center space-x-1 ${isLiked ? 'text-red-600' : 'text-gray-600'}`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-600' : ''}`} />
                    <span className="text-xs">{likeCount}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center space-x-1 text-gray-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{post.stats.comments}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center space-x-1 text-gray-600"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 flex flex-col">
              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar} />
                      <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm">{comment.author.name}</span>
                          <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-800">{comment.content}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommentLike(comment.id)}
                          className={`text-xs ${comment.isLiked ? 'text-red-600' : 'text-gray-500'}`}
                        >
                          <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? 'fill-red-600' : ''}`} />
                          {comment.likes > 0 && comment.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                          Responder
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSubmitComment} className="flex space-x-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                    rows={1}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newComment.trim() || isSubmittingComment}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}