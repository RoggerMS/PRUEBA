'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { LoaderIcon } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  FileText,
  HelpCircle,
  Trophy,
  Star,
  Download,
  Eye,
  Clock,
  Tag,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Pin,
  Edit3,
  Trash2
} from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'post' | 'note' | 'question' | 'achievement' | 'answer';
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    level: number;
  };
  content: string;
  title?: string;
  timestamp: string;
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
    downloads?: number;
  };
  tags?: string[];
  category?: string;
  isLiked?: boolean;
  isPinned?: boolean;
  attachments?: {
    type: 'file' | 'image' | 'link';
    name: string;
    url: string;
    size?: string;
  }[];
  achievement?: {
    name: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xp: number;
  };
}

interface ProfileFeedProps {
  userId?: string;
  isOwnProfile?: boolean;
  onLike?: (itemId: string) => void;
  onComment?: (itemId: string, comment: string) => void;
  onShare?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  onPin?: (itemId: string) => void;
}

// Hook for fetching profile feed data
// Fetches profile feed posts, ensuring the response is normalized
const useProfileFeed = (userId?: string) => {
  return useQuery<FeedItem[]>({
    queryKey: ['profile-feed', userId],
    queryFn: async () => {
      const response = await fetch(`/api/feed?userId=${userId || 'me'}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile feed');
      }
      const data = await response.json();
      // API returns an object with a `posts` array
      return data.posts ?? [];
    },
    // Allow fetching when userId is provided or for own profile
    enabled: !!userId || userId === undefined
  });
};

// Format time ago helper
const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'hace un momento';
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)}d`;
  return time.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
};

// Helper functions
const getTypeIcon = (type: FeedItem['type']) => {
  switch (type) {
    case 'post': return MessageCircle;
    case 'note': return FileText;
    case 'question': return HelpCircle;
    case 'achievement': return Trophy;
    case 'answer': return MessageCircle;
    default: return MessageCircle;
  }
};

const getTypeLabel = (type: FeedItem['type']) => {
  switch (type) {
    case 'post': return 'Post';
    case 'note': return 'Apunte';
    case 'question': return 'Pregunta';
    case 'achievement': return 'Logro';
    case 'answer': return 'Respuesta';
    default: return 'Contenido';
  }
};



const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export function ProfileFeed({
  userId,
  isOwnProfile = true,
  onLike,
  onComment,
  onShare,
  onDelete,
  onPin
}: ProfileFeedProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [commentDialogOpen, setCommentDialogOpen] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const { data: feedItems = [], isLoading, error, refetch } = useProfileFeed(userId);

  const filteredItems = activeTab === 'all' 
    ? feedItems 
    : feedItems.filter((item: FeedItem) => item.type === activeTab);

  const handleLike = (itemId: string) => {
    if (onLike) {
      onLike(itemId);
    }
  };

  const handleComment = (itemId: string) => {
    if (onComment && newComment.trim()) {
      onComment(itemId, newComment);
      setNewComment('');
      setCommentDialogOpen(null);
    }
  };

  const handleShare = (itemId: string) => {
    if (onShare) {
      onShare(itemId);
    }
  };

  const handleDelete = (itemId: string) => {
    if (onDelete) {
      onDelete(itemId);
    }
  };

  const handlePin = (itemId: string) => {
    if (onPin) {
      onPin(itemId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Todos</span>
          </TabsTrigger>
          <TabsTrigger value="post" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Posts</span>
          </TabsTrigger>
          <TabsTrigger value="note" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Apuntes</span>
          </TabsTrigger>
          <TabsTrigger value="question" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Preguntas</span>
          </TabsTrigger>
          <TabsTrigger value="answer" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Respuestas</span>
          </TabsTrigger>
          <TabsTrigger value="achievement" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Logros</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                          <div className="h-3 bg-gray-200 rounded w-1/6 animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-red-400 mb-4">
                    <MessageCircle className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Error al cargar el contenido
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No se pudo cargar la actividad del perfil.
                  </p>
                  <Button onClick={() => refetch()} variant="outline">
                    Intentar de nuevo
                  </Button>
                </CardContent>
              </Card>
            ) : filteredItems.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <MessageCircle className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay contenido aún
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'all' 
                      ? 'No hay actividad reciente para mostrar.'
                      : `No hay ${getTypeLabel(activeTab as FeedItem['type']).toLowerCase()}s para mostrar.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item: any) => {
                const TypeIcon = getTypeIcon(item.type);
                
                return (
                  <Card key={item.id} className={`transition-all duration-200 hover:shadow-md ${
                    item.isPinned ? 'border-blue-200 bg-blue-50/30' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={item.author.avatar} alt={item.author.name} />
                            <AvatarFallback>
                              {item.author.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{item.author.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                Nivel {item.author.level}
                              </Badge>
                              {item.isPinned && (
                                <Pin className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <TypeIcon className="w-4 h-4" />
                              <span>{getTypeLabel(item.type)}</span>
                              <span>•</span>
                              <Clock className="w-4 h-4" />
                              <span>{formatTimeAgo(item.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {isOwnProfile && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePin(item.id)}
                              className="text-gray-500 hover:text-blue-600"
                            >
                              <Pin className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Achievement Display */}
                      {item.achievement && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{item.achievement.icon}</div>
                            <div>
                              <h4 className="font-semibold text-purple-900">{item.achievement.name}</h4>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-purple-600 hover:bg-purple-700">
                                  +{item.achievement.xp} XP
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {item.achievement.rarity}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Title */}
                      {item.title && (
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      )}
                      
                      {/* Content */}
                      <p className="text-gray-700 mb-4 leading-relaxed">{item.content}</p>
                      
                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Attachments */}
                      {item.attachments && item.attachments.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {item.attachments.map((attachment: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700 flex-1">{attachment.name}</span>
                              {attachment.size && (
                                <span className="text-xs text-gray-500">{attachment.size}</span>
                              )}
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(item.id)}
                            className={`flex items-center gap-2 ${
                              item.isLiked ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-red-600'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-current' : ''}`} />
                            <span>{formatNumber(item.stats.likes)}</span>
                          </Button>
                          
                          <Dialog 
                            open={commentDialogOpen === item.id} 
                            onOpenChange={(open) => setCommentDialogOpen(open ? item.id : null)}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                <MessageCircle className="w-4 h-4" />
                                <span>{formatNumber(item.stats.comments)}</span>
                              </Button>
                            </DialogTrigger>
                            
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Agregar Comentario</DialogTitle>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <Textarea
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  placeholder="Escribe tu comentario..."
                                  rows={3}
                                />
                                
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => handleComment(item.id)}
                                    disabled={!newComment.trim()}
                                    className="flex-1"
                                  >
                                    Comentar
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setCommentDialogOpen(null)}
                                    className="flex-1"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(item.id)}
                            className="flex items-center gap-2 text-gray-600 hover:text-green-600"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>{formatNumber(item.stats.shares)}</span>
                          </Button>
                        </div>
                        
                        {/* Additional Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {item.stats.views && (
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{formatNumber(item.stats.views)}</span>
                            </div>
                          )}
                          
                          {item.stats.downloads && (
                            <div className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              <span>{formatNumber(item.stats.downloads)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}