'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  HeartIcon, 
  MessageCircleIcon, 
  ShareIcon, 
  BookmarkIcon,
  MoreHorizontalIcon,
  TrendingUpIcon,
  DownloadIcon
} from 'lucide-react';

interface Post {
  id: string;
  type: 'text' | 'note' | 'question';
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    university: string;
    career: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  // Para posts de tipo 'note'
  noteData?: {
    title: string;
    subject: string;
    fileType: string;
    downloads: number;
    rating: number;
  };
  // Para posts de tipo 'question'
  questionData?: {
    title: string;
    tags: string[];
    isSolved: boolean;
  };
}

// Mock data basado en el esquema de la base de datos
const mockPosts: Post[] = [
  {
    id: '1',
    type: 'note',
    content: 'Acabo de subir mis apuntes de Algoritmos y Estructuras de Datos. Incluye ejemplos prácticos y ejercicios resueltos. ¡Espero que les sea útil! 📚',
    author: {
      id: 'user1',
      name: 'María González',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20latina%20university&image_size=square',
      university: 'Universidad Nacional Mayor de San Marcos',
      career: 'Ingeniería de Sistemas'
    },
    createdAt: '2024-01-20T10:30:00Z',
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
    isBookmarked: true,
    noteData: {
      title: 'Algoritmos y Estructuras de Datos - Semana 5',
      subject: 'Algoritmos',
      fileType: 'PDF',
      downloads: 156,
      rating: 4.8
    }
  },
  {
    id: '2',
    type: 'question',
    content: '¿Alguien puede explicarme la diferencia entre herencia y composición en POO? Tengo examen mañana y no logro entender bien el concepto 😅',
    author: {
      id: 'user2',
      name: 'Carlos Mendoza',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20male%20latino%20university&image_size=square',
      university: 'Universidad Católica del Perú',
      career: 'Ingeniería de Sistemas'
    },
    createdAt: '2024-01-20T09:15:00Z',
    likes: 12,
    comments: 15,
    shares: 2,
    isLiked: true,
    isBookmarked: false,
    questionData: {
      title: 'Herencia vs Composición en POO',
      tags: ['programacion', 'poo', 'java'],
      isSolved: true
    }
  },
  {
    id: '3',
    type: 'text',
    content: '¡Acabo de terminar mi proyecto final de Bases de Datos! 🎉 Fue un sistema de gestión para bibliotecas universitarias. Aprendí mucho sobre normalización y optimización de consultas.',
    author: {
      id: 'user3',
      name: 'Ana Rodríguez',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20latina%20university%20happy&image_size=square',
      university: 'Universidad de Lima',
      career: 'Ingeniería de Sistemas'
    },
    createdAt: '2024-01-20T08:45:00Z',
    likes: 31,
    comments: 6,
    shares: 4,
    isLiked: false,
    isBookmarked: false
  }
];

function PostCard({ post }: { post: Post }) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const getPostIcon = () => {
    switch (post.type) {
      case 'note': return '📚';
      case 'question': return '❓';
      default: return '💬';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    return `Hace ${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      {/* Header del post */}
      <div className="flex items-start space-x-3 mb-4">
        <Avatar className="h-10 w-10">
          <img 
            src={post.author.avatar} 
            alt={post.author.name}
            className="rounded-full"
          />
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm truncate">{post.author.name}</h3>
            <span className="text-xs">{getPostIcon()}</span>
            <Badge variant="outline" className="text-xs">
              {post.author.career}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 truncate">
            {post.author.university} • {formatTimeAgo(post.createdAt)}
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Contenido específico por tipo */}
      {post.type === 'note' && post.noteData && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-900">{post.noteData.title}</h4>
            <Badge className="bg-blue-100 text-blue-800">{post.noteData.fileType}</Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-blue-700">
            <span className="flex items-center">
              <DownloadIcon className="h-3 w-3 mr-1" />
              {post.noteData.downloads} descargas
            </span>
            <span>⭐ {post.noteData.rating}/5</span>
            <span>📖 {post.noteData.subject}</span>
          </div>
        </div>
      )}

      {post.type === 'question' && post.questionData && (
        <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-orange-900">{post.questionData.title}</h4>
            {post.questionData.isSolved && (
              <Badge className="bg-green-100 text-green-800">✅ Resuelto</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {post.questionData.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Contenido del post */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed">{post.content}</p>
      </div>

      {/* Acciones del post */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex space-x-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike}
            className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
          >
            <HeartIcon className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likes}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-500">
            <MessageCircleIcon className="h-4 w-4" />
            <span className="text-sm">{post.comments}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-500">
            <ShareIcon className="h-4 w-4" />
            <span className="text-sm">{post.shares}</span>
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBookmark}
          className={`${isBookmarked ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <BookmarkIcon className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
      </div>
    </Card>
  );
}

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const loadPosts = async () => {
      setLoading(true);
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
      setLoading(false);
    };

    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="flex space-x-4">
              <div className="h-8 bg-gray-200 rounded w-16" />
              <div className="h-8 bg-gray-200 rounded w-16" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {/* Load more button */}
      <div className="text-center py-6">
        <Button variant="outline" className="flex items-center space-x-2">
          <TrendingUpIcon className="h-4 w-4" />
          <span>Cargar más posts</span>
        </Button>
      </div>
    </div>
  );
}