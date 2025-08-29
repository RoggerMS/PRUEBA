'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Share2,
  Globe,
  Users,
  Lock,
  School,
  Loader2,
  X,
  MessageCircle,
  Heart,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  Play,
  FileText,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeedPost, VisibilityLevel } from '@/types/feed';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface ShareModalProps {
  post: FeedPost;
  isOpen: boolean;
  onClose: () => void;
}

const visibilityOptions = [
  {
    value: 'public' as VisibilityLevel,
    label: 'Público',
    description: 'Cualquiera puede ver este post',
    icon: Globe,
    color: 'text-green-600'
  },
  {
    value: 'university' as VisibilityLevel,
    label: 'Universidad',
    description: 'Solo usuarios de tu universidad',
    icon: School,
    color: 'text-blue-600'
  },
  {
    value: 'friends' as VisibilityLevel,
    label: 'Amigos',
    description: 'Solo tus amigos pueden ver',
    icon: Users,
    color: 'text-purple-600'
  },
  {
    value: 'private' as VisibilityLevel,
    label: 'Privado',
    description: 'Solo tú puedes ver',
    icon: Lock,
    color: 'text-gray-600'
  }
];

export function ShareModal({ post, isOpen, onClose }: ShareModalProps) {
  const [comment, setComment] = useState('');
  const [visibility, setVisibility] = useState<VisibilityLevel>('public');
  const queryClient = useQueryClient();

  const sharePostMutation = useMutation({
    mutationFn: async (data: { comment?: string; visibility: VisibilityLevel }) => {
      const response = await fetch(`/api/feed/${post.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to share post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
      toast.success('Post compartido exitosamente');
      onClose();
      setComment('');
      setVisibility('public');
    },
    onError: () => {
      toast.error('Error al compartir el post');
    }
  });

  const handleShare = () => {
    sharePostMutation.mutate({
      comment: comment.trim() || undefined,
      visibility
    });
  };

  const handleClose = () => {
    if (!sharePostMutation.isPending) {
      onClose();
      setComment('');
      setVisibility('public');
    }
  };

  const selectedVisibility = visibilityOptions.find(option => option.value === visibility);
  const VisibilityIcon = selectedVisibility?.icon || Globe;

  const getMediaIcon = (kind: string) => {
    switch (kind) {
      case 'photo':
        return ImageIcon;
      case 'video':
        return Play;
      case 'note':
        return FileText;
      default:
        return MessageCircle;
    }
  };

  const MediaIcon = getMediaIcon(post.kind);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <span>Compartir post</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Comment Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Agregar un comentario (opcional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Qué piensas sobre este post?"
              className="min-h-[80px] resize-none"
              disabled={sharePostMutation.isPending}
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Opcional: comparte tu opinión</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {/* Visibility Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              ¿Quién puede ver tu post compartido?
            </label>
            <Select value={visibility} onValueChange={(value: VisibilityLevel) => setVisibility(value)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    <VisibilityIcon className={cn('w-4 h-4', selectedVisibility?.color)} />
                    <span>{selectedVisibility?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-start space-x-3 py-1">
                        <Icon className={cn('w-4 h-4 mt-0.5', option.color)} />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Original Post Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Post original
            </label>
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                {/* Post Header */}
                <div className="flex items-start space-x-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>
                      {post.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {post.author.name}
                      </h4>
                      {post.author.verified && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          ✓
                        </Badge>
                      )}
                      <MediaIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>@{post.author.username}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(post.createdAt), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                {post.text && (
                  <div className="mb-3">
                    <p className="text-gray-800 text-sm line-clamp-3">
                      {post.text}
                    </p>
                  </div>
                )}

                {/* Media Preview */}
                {post.media && post.media.length > 0 && (
                  <div className="mb-3">
                    {post.media[0].type === 'image' && (
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                        <img
                          src={post.media[0].url}
                          alt="Post media"
                          className="w-full h-full object-cover"
                        />
                        {post.media.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            +{post.media.length - 1} más
                          </div>
                        )}
                      </div>
                    )}
                    
                    {post.media[0].type === 'video' && (
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                        <Play className="w-12 h-12 text-gray-400" />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Video
                        </div>
                      </div>
                    )}
                    
                    {post.media[0].type === 'document' && (
                      <div className="border border-gray-200 rounded-lg p-3 flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {post.media[0].name || 'Documento'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {post.media[0].size ? `${(post.media[0].size / 1024 / 1024).toFixed(1)} MB` : 'Documento'}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                )}

                {/* Post Stats */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>🔥</span>
                    <span>{post.stats.fires}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{post.stats.comments}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 className="w-3 h-3" />
                    <span>{post.stats.shares}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={sharePostMutation.isPending}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleShare}
              disabled={sharePostMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sharePostMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Compartiendo...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}