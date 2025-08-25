'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Flag, Link as LinkIcon, EyeOff } from 'lucide-react';
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
  content: string;
  title?: string;
  tags: string[];
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  imageUrl?: string;
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

  const handlePostCreated = async (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
    // Otorgar XP por crear post
    try {
      await gamificationService.grantXP(
        'current-user-id', // En producción, obtener del contexto de autenticación
        15,
        'post',
        newPost.id,
        'Crear nuevo post'
      );
      
      toast.success('¡Post creado! +15 XP ganados', {
        duration: 3000,
      });
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
        
        toast.success('¡Like dado! +5 XP ganados', {
          duration: 2000,
        });
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
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>
                    {post.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={`/profile/${post.author.username}`}
                      className="font-semibold text-gray-900 hover:text-crunevo-600 transition-colors"
                    >
                      {post.author.name}
                    </Link>
                    {post.author.verified && (
                      <Badge className="bg-crunevo-100 text-crunevo-700 text-xs">
                        ✓
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {getPostTypeIcon(post.type)} {getPostTypeLabel(post.type)}
                    </Badge>
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
              {post.title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {post.title}
                </h3>
              )}
              <p className="text-gray-700 leading-relaxed">
                {post.content}
              </p>
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
                    'text-gray-500 hover:text-fire transition-colors',
                    post.isLiked && 'text-fire'
                  )}
                >
                  <Heart className={cn('w-4 h-4 mr-2', post.isLiked && 'fill-current')} />
                  {post.likes}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleComment(post.id)}
                  className="text-gray-500 hover:text-crunevo-600"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {post.comments}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleShare(post)}
                  className="text-gray-500 hover:text-crunevo-600"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {post.shares}
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBookmark(post.id)}
                className={cn(
                  'text-gray-500 hover:text-crunevo-600 transition-colors',
                  post.isBookmarked && 'text-crunevo-600'
                )}
              >
                <Bookmark className={cn('w-4 h-4', post.isBookmarked && 'fill-current')} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Load More */}
      <div className="text-center py-6">
        <Button variant="outline" className="text-crunevo-600 border-crunevo-200 hover:bg-crunevo-50">
          Cargar más publicaciones
        </Button>
      </div>
    </div>
  );
}
