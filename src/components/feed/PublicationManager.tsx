import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Globe, 
  Users, 
  Lock, 
  FileText, 
  HelpCircle, 
  Trash2, 
  Edit3, 
  Eye,
  EyeOff,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Post {
  id: string;
  type: 'text' | 'question' | 'note' | 'image';
  author: {
    id: string;
    name: string;
    avatar: string;
    career: string;
  };
  content: string | {
    title?: string;
    description?: string;
    subject?: string;
    category?: string;
    price?: number;
    bounty?: number;
  };
  title?: string;
  tags: string[];
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  visibility: 'public' | 'followers' | 'private';
  publishToFeed: boolean;
}

interface PublicationManagerProps {
  posts: Post[];
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  onDeletePost: (postId: string) => void;
}

const PublicationManager: React.FC<PublicationManagerProps> = ({
  posts,
  onUpdatePost,
  onDeletePost
}) => {
  const [filter, setFilter] = useState<'all' | 'public' | 'followers' | 'private'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'text' | 'question' | 'note'>('all');

  const visibilityOptions = [
    {
      value: 'public' as const,
      label: 'Público',
      icon: <Globe className="w-4 h-4" />,
      color: 'text-blue-600'
    },
    {
      value: 'followers' as const,
      label: 'Seguidores',
      icon: <Users className="w-4 h-4" />,
      color: 'text-orange-600'
    },
    {
      value: 'private' as const,
      label: 'Privado',
      icon: <Lock className="w-4 h-4" />,
      color: 'text-red-600'
    }
  ];

  const typeOptions = [
    { value: 'text', label: 'Post', icon: <Edit3 className="w-4 h-4" /> },
    { value: 'question', label: 'Pregunta', icon: <HelpCircle className="w-4 h-4" /> },
    { value: 'note', label: 'Apunte', icon: <FileText className="w-4 h-4" /> }
  ];

  const filteredPosts = posts.filter(post => {
    const visibilityMatch = filter === 'all' || post.visibility === filter;
    const typeMatch = typeFilter === 'all' || post.type === typeFilter;
    return visibilityMatch && typeMatch;
  });

  const handleVisibilityChange = (postId: string, newVisibility: 'public' | 'followers' | 'private') => {
    onUpdatePost(postId, { visibility: newVisibility });
    toast.success(`Visibilidad actualizada: La publicación ahora es ${visibilityOptions.find(opt => opt.value === newVisibility)?.label.toLowerCase()}.`);
  };

  const handleToggleFeedVisibility = (postId: string, currentStatus: boolean) => {
    onUpdatePost(postId, { publishToFeed: !currentStatus });
    toast.success(currentStatus 
      ? "Ocultado del feed: La publicación ya no aparece en el feed público."
      : "Mostrado en el feed: La publicación ahora aparece en el feed público.");
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      onDeletePost(postId);
      toast.success("Publicación eliminada: La publicación ha sido eliminada exitosamente.");
    }
  };

  const getPostTitle = (post: Post) => {
    if (post.type === 'question' || post.type === 'note') {
      if (typeof post.content === 'object' && post.content.title) {
        return post.content.title;
      }
    }
    return post.title || 'Sin título';
  };

  const getPostDescription = (post: Post) => {
    if (post.type === 'question' || post.type === 'note') {
      if (typeof post.content === 'object' && post.content.description) {
        return post.content.description;
      }
    }
    return typeof post.content === 'string' ? post.content : '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5" />
            <span>Gestión de Publicaciones</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Visibilidad:</span>
              <Select value={filter} onValueChange={(value: 'all' | 'public' | 'followers' | 'private') => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="public">Públicas</SelectItem>
                  <SelectItem value="followers">Seguidores</SelectItem>
                  <SelectItem value="private">Privadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Tipo:</span>
              <Select value={typeFilter} onValueChange={(value: 'all' | 'text' | 'question' | 'note') => setTypeFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="text">Posts</SelectItem>
                  <SelectItem value="question">Preguntas</SelectItem>
                  <SelectItem value="note">Apuntes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Edit3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tienes publicaciones que coincidan con los filtros seleccionados.</p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const visibilityOption = visibilityOptions.find(opt => opt.value === post.visibility);
                const typeOption = typeOptions.find(opt => opt.value === post.type);
                
                return (
                  <Card key={post.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {typeOption?.icon}
                            <span className="font-medium text-sm text-gray-600">
                              {typeOption?.label}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`${visibilityOption?.color} border-current`}
                            >
                              {visibilityOption?.icon}
                              <span className="ml-1">{visibilityOption?.label}</span>
                            </Badge>
                            {!post.publishToFeed && (
                              <Badge variant="secondary" className="text-gray-600">
                                <EyeOff className="w-3 h-3 mr-1" />
                                Oculto del feed
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {getPostTitle(post)}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {getPostDescription(post)}
                          </p>
                          
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{post.tags.length - 3} más
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                            <span>{post.likes} likes</span>
                            <span>{post.comments} comentarios</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Select 
                            value={post.visibility} 
                            onValueChange={(value: 'public' | 'followers' | 'private') => 
                              handleVisibilityChange(post.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {visibilityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center space-x-2">
                                    {option.icon}
                                    <span>{option.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem 
                                onClick={() => handleToggleFeedVisibility(post.id, post.publishToFeed)}
                              >
                                {post.publishToFeed ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Ocultar del feed
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Mostrar en feed
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicationManager;