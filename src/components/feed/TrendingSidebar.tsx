'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp,
  Users,
  Hash,
  Plus,
  ExternalLink,
  Star,
  Clock,
  MessageCircle,
  Eye,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TrendingSidebarProps {
  className?: string;
}

interface TrendingTopic {
  id: string;
  hashtag: string;
  posts: number;
  growth: number;
  category?: string;
}

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  followers: number;
  isVerified?: boolean;
  mutualConnections?: number;
}

interface SuggestedClub {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  members: number;
  category: string;
  isPrivate?: boolean;
}

interface PopularPost {
  id: string;
  title: string;
  author: string;
  fires: number;
  comments: number;
  timeAgo: string;
}

export function TrendingSidebar({ className }: TrendingSidebarProps) {
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(new Set());

  // Mock data - in real app, these would come from API
  const trendingTopics: TrendingTopic[] = [
    {
      id: '1',
      hashtag: '#ReactJS',
      posts: 1247,
      growth: 23.5,
      category: 'Tecnología'
    },
    {
      id: '2',
      hashtag: '#EstudiarEnCasa',
      posts: 892,
      growth: 18.2,
      category: 'Educación'
    },
    {
      id: '3',
      hashtag: '#DesarrolloWeb',
      posts: 634,
      growth: 15.7,
      category: 'Tecnología'
    },
    {
      id: '4',
      hashtag: '#UniversidadVirtual',
      posts: 456,
      growth: 12.3,
      category: 'Educación'
    },
    {
      id: '5',
      hashtag: '#Programación',
      posts: 789,
      growth: 9.8,
      category: 'Tecnología'
    }
  ];

  const suggestedUsers: SuggestedUser[] = [
    {
      id: '1',
      name: 'María González',
      username: 'maria_dev',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20developer%20avatar%20friendly%20smile&image_size=square',
      bio: 'Frontend Developer | React enthusiast',
      followers: 2847,
      isVerified: true,
      mutualConnections: 12
    },
    {
      id: '2',
      name: 'Carlos Ruiz',
      username: 'carlos_design',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20man%20designer%20creative%20modern&image_size=square',
      bio: 'UX/UI Designer | Creative solutions',
      followers: 1923,
      mutualConnections: 8
    },
    {
      id: '3',
      name: 'Ana Martínez',
      username: 'ana_data',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20data%20scientist%20smart%20glasses&image_size=square',
      bio: 'Data Scientist | AI researcher',
      followers: 3156,
      isVerified: true,
      mutualConnections: 15
    }
  ];

  const suggestedClubs: SuggestedClub[] = [
    {
      id: '1',
      name: 'Desarrolladores Frontend',
      description: 'Comunidad de desarrolladores especializados en tecnologías frontend',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20tech%20community%20logo%20frontend%20development&image_size=square',
      members: 15420,
      category: 'Tecnología'
    },
    {
      id: '2',
      name: 'Estudiantes de Ingeniería',
      description: 'Espacio para compartir conocimientos y experiencias académicas',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=university%20engineering%20students%20community%20logo&image_size=square',
      members: 8934,
      category: 'Educación'
    },
    {
      id: '3',
      name: 'Diseño UX/UI',
      description: 'Tendencias, recursos y feedback para diseñadores',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=creative%20design%20community%20ux%20ui%20modern%20logo&image_size=square',
      members: 6721,
      category: 'Diseño',
      isPrivate: true
    }
  ];

  const popularPosts: PopularPost[] = [
    {
      id: '1',
      title: 'Guía completa de React Hooks en 2024',
      author: 'DevMaster',
      fires: 234,
      comments: 67,
      timeAgo: '2h'
    },
    {
      id: '2',
      title: 'Cómo optimizar el rendimiento en aplicaciones web',
      author: 'TechGuru',
      fires: 189,
      comments: 43,
      timeAgo: '4h'
    },
    {
      id: '3',
      title: 'Tendencias en diseño web para este año',
      author: 'DesignPro',
      fires: 156,
      comments: 29,
      timeAgo: '6h'
    }
  ];

  const handleFollowUser = (userId: string) => {
    setFollowingUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleJoinClub = (clubId: string) => {
    setJoinedClubs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clubId)) {
        newSet.delete(clubId);
      } else {
        newSet.add(clubId);
      }
      return newSet;
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Trending Topics */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Tendencias</h3>
            </div>
          </div>
          
          <div className="p-2">
            {trendingTopics.map((topic, index) => (
              <Link
                key={topic.id}
                href={`/search?q=${encodeURIComponent(topic.hashtag)}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                    <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 group-hover:text-orange-600">
                        {topic.hashtag}
                      </span>
                      {topic.growth > 15 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700">
                          🔥 Hot
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{topic.posts.toLocaleString()} posts</span>
                      <span>•</span>
                      <span className="text-green-600">+{topic.growth}%</span>
                    </div>
                  </div>
                </div>
                
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
              </Link>
            ))}
            
            <Link
              href="/trending"
              className="flex items-center justify-center p-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Ver todas las tendencias
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Users */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Usuarios sugeridos</h3>
            </div>
          </div>
          
          <div className="p-2">
            {suggestedUsers.map((user) => (
              <div key={user.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {user.name}
                      </h4>
                      {user.isVerified && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          ✓
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 truncate">
                      @{user.username}
                    </p>
                    
                    {user.bio && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      <span>{user.followers.toLocaleString()} seguidores</span>
                      {user.mutualConnections && (
                        <span>• {user.mutualConnections} conexiones mutuas</span>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant={followingUsers.has(user.id) ? "outline" : "default"}
                      onClick={() => handleFollowUser(user.id)}
                      className={cn(
                        'mt-2 w-full',
                        followingUsers.has(user.id) 
                          ? 'border-orange-200 text-orange-600 hover:bg-orange-50' 
                          : 'bg-orange-600 hover:bg-orange-700'
                      )}
                    >
                      {followingUsers.has(user.id) ? (
                        <>
                          <Users className="w-3 h-3 mr-1" />
                          Siguiendo
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Seguir
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <Link
              href="/discover/users"
              className="flex items-center justify-center p-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Descubrir más usuarios
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Clubs */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Clubes recomendados</h3>
            </div>
          </div>
          
          <div className="p-2">
            {suggestedClubs.map((club) => (
              <div key={club.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={club.avatar} alt={club.name} />
                    <AvatarFallback>
                      {club.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {club.name}
                      </h4>
                      {club.isPrivate && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          Privado
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {club.description}
                    </p>
                    
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      <span>{club.members.toLocaleString()} miembros</span>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {club.category}
                      </Badge>
                    </div>
                    
                    <Button
                      size="sm"
                      variant={joinedClubs.has(club.id) ? "outline" : "default"}
                      onClick={() => handleJoinClub(club.id)}
                      className={cn(
                        'mt-2 w-full',
                        joinedClubs.has(club.id) 
                          ? 'border-purple-200 text-purple-600 hover:bg-purple-50' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      )}
                    >
                      {joinedClubs.has(club.id) ? (
                        <>
                          <Users className="w-3 h-3 mr-1" />
                          Miembro
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Unirse
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <Link
              href="/discover/clubs"
              className="flex items-center justify-center p-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Explorar más clubes
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Popular Posts */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Posts populares</h3>
            </div>
          </div>
          
          <div className="p-2">
            {popularPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 rounded text-xs font-bold text-yellow-600">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-orange-600">
                    {post.title}
                  </h4>
                  
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                    <span>por {post.author}</span>
                    <span>•</span>
                    <span>{post.timeAgo}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span>🔥</span>
                      <span>{post.fires}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            <Link
              href="/popular"
              className="flex items-center justify-center p-3 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Ver más posts populares
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">Actividad de hoy</h3>
              <p className="text-sm text-gray-600">Tu impacto en la comunidad</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="font-bold text-lg text-blue-600">1.2k</div>
                <div className="text-xs text-gray-500">Visualizaciones</div>
              </div>
              <div>
                <div className="font-bold text-lg text-orange-600">47</div>
                <div className="text-xs text-gray-500">Interacciones</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}