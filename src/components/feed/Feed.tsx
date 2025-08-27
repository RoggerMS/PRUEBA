'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Flag, Link as LinkIcon, EyeOff, CheckCircle, Globe, Users, Lock, FileText, HelpCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CreatePost } from './CreatePost';
import { gamificationService } from '@/services/gamificationService';

interface Post {
  id: string;
  type: 'text' | 'question' | 'note' | 'image';
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    verified: boolean;
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
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  imageUrl?: string;
  visibility?: 'public' | 'followers' | 'private';
  publishToFeed?: boolean;
}

const mockPosts: Post[] = [
  {
    id: '1',
    type: 'question',
    author: {
      id: '1',
      name: 'María González',
      username: 'maria_g',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20portrait%20female%20smiling&image_size=square',
      verified: true,
      career: 'Ingeniería de Sistemas'
    },
    title: '¿Cómo optimizar algoritmos de ordenamiento?',
    content: 'Estoy estudiando diferentes algoritmos de ordenamiento y me gustaría saber cuáles son las mejores prácticas para optimizarlos. ¿Alguien tiene experiencia con QuickSort vs MergeSort?',
    tags: ['algoritmos', 'programación', 'optimización'],
    createdAt: '2h',
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
    isBookmarked: true
  },
  {
    id: '2',
    type: 'note',
    author: {
      id: '2',
      name: 'Carlos Mendoza',
      username: 'carlos_m',
      verified: false,
      career: 'Medicina'
    },
    title: 'Apuntes de Anatomía - Sistema Cardiovascular',
    content: 'Comparto mis apuntes completos sobre el sistema cardiovascular. Incluye diagramas, funciones principales y patologías más comunes.',
    tags: ['anatomía', 'medicina', 'cardiovascular'],
    createdAt: '4h',
    likes: 45,
    comments: 12,
    shares: 18,
    isLiked: true,
    isBookmarked: false
  },
  {
    id: '3',
    type: 'text',
    author: {
      id: '3',
      name: 'Ana Rodríguez',
      username: 'ana_r',
      verified: true,
      career: 'Psicología'
    },
    content: '¡Acabo de terminar mi tesis sobre neuroplasticidad! Ha sido un viaje increíble de 2 años. Gracias a todos los que me apoyaron en el proceso. 🧠✨',
    tags: ['tesis', 'neuroplasticidad', 'psicología'],
    createdAt: '6h',
    likes: 89,
    comments: 23,
    shares: 7,
    isLiked: true,
    isBookmarked: true
  }
];

const getPostTypeIcon = (type: string) => {
  switch (type) {
    case 'question':
      return '❓';
    case 'note':
      return '📝';
    case 'image':
      return '🖼️';
    default:
      return '💭';
  }
};

const getPostTypeLabel = (type: string) => {
  switch (type) {
    case 'question':
      return 'Pregunta';
    case 'note':
      return 'Apunte';
    case 'image':
      return 'Imagen';
    default:
      return 'Publicación';
  }
};

export function Feed() {
  const [posts, setPosts] = useState(mockPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState<string[]>([]);

  // Animate posts on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      posts.forEach((post, index) => {
        setTimeout(() => {
          setVisiblePosts(prev => [...prev, post.id]);
        }, index * 100);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [posts]);

  const handlePostCreated = async (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
    // Animate new post
    setTimeout(() => {
      setVisiblePosts(prev => [newPost.id, ...prev]);
    }, 50);
    
    // Otorgar XP por crear post
    try {
      await gamificationService.grantXP(
        'current-user-id', // En producción, obtener del contexto de autenticación
        15,
        'post',
        newPost.id,
        'Crear nuevo post'
      );
      
      toast.success(
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span>¡Post creado! +15 XP ganados</span>
        </div>,
        {
          duration: 3000,
        }
      );
    } catch (error) {
      console.error('Error al otorgar XP:', error);
    }
  };

  const handleLike = async (postId: string) => {
    // Primero actualizar el estado
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newIsLiked = !post.isLiked;
        return {
          ...post,
          isLiked: newIsLiked,
          likes: newIsLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
    
    // Luego otorgar XP si es un like (no unlike)
    const post = posts.find(p => p.id === postId);
    if (post && !post.isLiked) {
      try {
        await gamificationService.grantXP(
          'current-user-id',
          5,
          'like',
          postId,
          'Dar like a un post'
        );
        
        toast.success(
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>¡Like dado! +5 XP ganados</span>
          </div>,
          {
            duration: 2000,
          }
        );
      } catch (error) {
        console.error('Error al otorgar XP:', error);
      }
    }
  };

  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newIsBookmarked = !post.isBookmarked;
        toast.success(newIsBookmarked ? 'Guardado en marcadores' : 'Eliminado de marcadores');
        return {
          ...post,
          isBookmarked: newIsBookmarked
        };
      }
      return post;
    }));
  };

  const handleShare = async (post: Post) => {
    navigator.clipboard.writeText(`https://crunevo.com/posts/${post.id}`);
    // Otorgar XP por compartir
    try {
      await gamificationService.grantXP(
        'current-user-id',
        3,
        'share',
        post.id,
        'Compartir post'
      );
      
      toast.success('¡Post compartido! +3 XP ganados', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Error al otorgar XP:', error);
    }
    
    navigator.clipboard.writeText(`https://crunevo.com/posts/${post.id}`);
  };

  const handleComment = async (postId: string) => {
    // Otorgar XP por comentar
    try {
      await gamificationService.grantXP(
        'current-user-id',
        8,
        'comment',
        postId,
        'Comentar en un post'
      );
      
      toast.success('¡Comentario agregado! +8 XP ganados', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Error al otorgar XP:', error);
    }
    
    // Aquí se abriría el modal de comentarios
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¡Tu feed está vacío!
        </h3>
        <p className="text-gray-600 mb-6">
          Sigue a otros usuarios, únete a clubes o crea tu primera publicación.
        </p>
        <Button asChild>
          <Link href="/create-post">
            Crear primera publicación
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreatePost onPostCreated={handlePostCreated} />
      {posts.map((post, index) => {
        const isVisible = visiblePosts.includes(post.id);
        return (
        <Card 
          key={post.id} 
          className={`group hover:shadow-lg hover:shadow-crunevo-100/50 transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm hover:border-crunevo-200/50 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
          style={{
            transitionDelay: isVisible ? '0ms' : `${index * 100}ms`
          }}
        >
          <CardContent className="p-6 relative overflow-hidden">
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-crunevo-50/0 to-crunevo-100/0 group-hover:from-crunevo-50/30 group-hover:to-crunevo-100/10 transition-all duration-500 pointer-events-none" />
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-crunevo-200 transition-all duration-300">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback className="bg-gradient-to-br from-crunevo-100 to-crunevo-200 text-crunevo-700">
                    {post.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={`/profile/${post.author.username}`}
                      className="font-semibold text-gray-900 hover:text-crunevo-600 transition-all duration-200 hover:scale-105 inline-block"
                    >
                      {post.author.name}
                    </Link>
                    {post.author.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                    {/* Post Type Badge */}
                    {post.type === 'question' && (
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                        <HelpCircle className="w-3 h-3" />
                        <span>Pregunta</span>
                      </div>
                    )}
                    {post.type === 'note' && (
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                        <FileText className="w-3 h-3" />
                        <span>Apunte</span>
                      </div>
                    )}
                    {post.type === 'text' && (
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                        <span>Post</span>
                      </div>
                    )}
                    {/* Visibility Badge */}
                    {post.visibility === 'followers' && (
                      <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                        <Users className="w-3 h-3" />
                        <span>Seguidores</span>
                      </div>
                    )}
                    {post.visibility === 'private' && (
                      <div className="flex items-center space-x-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                        <Lock className="w-3 h-3" />
                        <span>Privado</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>@{post.author.username}</span>
                    <span>•</span>
                    <span>{post.author.career}</span>
                    <span>•</span>
                    <span>{post.createdAt}</span>
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleBookmark(post.id)}>
                    <Bookmark className="w-4 h-4 mr-2" />
                    {post.isBookmarked ? 'Quitar de guardados' : 'Guardar'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(post)}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copiar enlace
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <EyeOff className="w-4 h-4 mr-2" />
                    No me interesa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Flag className="w-4 h-4 mr-2" />
                    Denunciar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <div className="mb-4">
              {/* Contenido específico por tipo */}
              {post.type === 'question' && typeof post.content === 'object' && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{post.content.title}</h3>
                  <p className="text-gray-700">{post.content.description}</p>
                  {post.content.subject && (
                    <p className="text-sm text-gray-600">Materia: {post.content.subject}</p>
                  )}
                  {post.content.bounty && (
                    <p className="text-sm text-green-600 font-medium">Recompensa: {post.content.bounty} Crolars</p>
                  )}
                </div>
              )}
              
              {post.type === 'note' && typeof post.content === 'object' && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{post.content.title}</h3>
                  <p className="text-gray-700">{post.content.description}</p>
                  {post.content.category && (
                    <p className="text-sm text-gray-600">Categoría: {post.content.category}</p>
                  )}
                  {post.content.price && (
                    <p className="text-sm text-blue-600 font-medium">Precio: {post.content.price} Crolars</p>
                  )}
                </div>
              )}
              
              {(post.type === 'text' || post.type === 'image') && (
                <div className="space-y-2">
                  {post.title && <h3 className="font-semibold text-lg">{post.title}</h3>}
                  <p className="text-gray-700">{typeof post.content === 'string' ? post.content : ''}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
                    <Badge 
                      variant="secondary" 
                      className="text-xs hover:bg-crunevo-100 hover:text-crunevo-700 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={cn(
                    'text-gray-500 hover:text-fire transition-all duration-200 hover:scale-110 hover:bg-red-50',
                    post.isLiked && 'text-fire bg-red-50'
                  )}
                >
                  <Heart className={cn(
                    'w-4 h-4 mr-2 transition-all duration-200', 
                    post.isLiked && 'fill-current scale-110 animate-pulse'
                  )} />
                  <span className="font-medium">{post.likes}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleComment(post.id)}
                  className="text-gray-500 hover:text-crunevo-600 transition-all duration-200 hover:scale-110 hover:bg-crunevo-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2 transition-transform duration-200 hover:rotate-12" />
                  <span className="font-medium">{post.comments}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleShare(post)}
                  className="text-gray-500 hover:text-crunevo-600 transition-all duration-200 hover:scale-110 hover:bg-crunevo-50"
                >
                  <Share2 className="w-4 h-4 mr-2 transition-transform duration-200 hover:-rotate-12" />
                  <span className="font-medium">{post.shares}</span>
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBookmark(post.id)}
                className={cn(
                  'text-gray-500 hover:text-crunevo-600 transition-all duration-200 hover:scale-110 hover:bg-crunevo-50',
                  post.isBookmarked && 'text-crunevo-600 bg-crunevo-50'
                )}
              >
                <Bookmark className={cn(
                  'w-4 h-4 transition-all duration-200', 
                  post.isBookmarked && 'fill-current scale-110'
                )} />
              </Button>
            </div>
          </CardContent>
        </Card>
        );
      })}
      
      {/* Load More */}
      <div className="text-center py-6">
        <Button 
          variant="outline" 
          className="text-crunevo-600 border-crunevo-200 hover:bg-crunevo-50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-crunevo-100/50 group"
          onClick={() => {
            setIsLoading(true);
            // Simulate loading
            setTimeout(() => setIsLoading(false), 1000);
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-crunevo-600 border-t-transparent rounded-full animate-spin" />
              <span>Cargando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span>Cargar más publicaciones</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
