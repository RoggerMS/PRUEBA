'use client';

import { useState } from 'react';
import { UserPlus, Users, BookOpen, TrendingUp, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  career: string;
  followers: number;
  isFollowing: boolean;
  verified: boolean;
}

interface Club {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  isJoined: boolean;
  avatar?: string;
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  students: number;
  price: number;
  thumbnail?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Diego Vargas',
    username: 'diego_v',
    avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20portrait%20male%20engineering&image_size=square',
    career: 'Ingeniería Civil',
    followers: 234,
    isFollowing: false,
    verified: true
  },
  {
    id: '2',
    name: 'Sofía Herrera',
    username: 'sofia_h',
    career: 'Arquitectura',
    followers: 189,
    isFollowing: false,
    verified: false
  },
  {
    id: '3',
    name: 'Roberto Chen',
    username: 'roberto_c',
    career: 'Medicina',
    followers: 456,
    isFollowing: false,
    verified: true
  }
];

const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Programadores UNMSM',
    description: 'Comunidad de estudiantes de programación',
    members: 1247,
    category: 'Tecnología',
    isJoined: false,
    avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=programming%20club%20logo%20modern%20tech&image_size=square'
  },
  {
    id: '2',
    name: 'Medicina Integral',
    description: 'Recursos y discusiones médicas',
    members: 892,
    category: 'Salud',
    isJoined: false
  }
];

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Cálculo Diferencial Avanzado',
    instructor: 'Dr. María López',
    rating: 4.8,
    students: 156,
    price: 250,
    thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematics%20calculus%20course%20educational&image_size=landscape_4_3'
  },
  {
    id: '2',
    title: 'Anatomía Humana Básica',
    instructor: 'Dr. Carlos Mendoza',
    rating: 4.9,
    students: 203,
    price: 180
  }
];

export function Suggestions() {
  const [users, setUsers] = useState(mockUsers);
  const [clubs, setClubs] = useState(mockClubs);
  const [dismissedSections, setDismissedSections] = useState<string[]>([]);

  const handleFollow = (userId: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newIsFollowing = !user.isFollowing;
        toast.success(newIsFollowing ? `Ahora sigues a ${user.name}` : `Dejaste de seguir a ${user.name}`);
        return {
          ...user,
          isFollowing: newIsFollowing,
          followers: newIsFollowing ? user.followers + 1 : user.followers - 1
        };
      }
      return user;
    }));
  };

  const handleJoinClub = (clubId: string) => {
    setClubs(prev => prev.map(club => {
      if (club.id === clubId) {
        const newIsJoined = !club.isJoined;
        toast.success(newIsJoined ? `Te uniste a ${club.name}` : `Saliste de ${club.name}`);
        return {
          ...club,
          isJoined: newIsJoined,
          members: newIsJoined ? club.members + 1 : club.members - 1
        };
      }
      return club;
    }));
  };

  const dismissSection = (section: string) => {
    setDismissedSections(prev => [...prev, section]);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Suggested Users */}
      {!dismissedSections.includes('users') && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-crunevo-600" />
                Usuarios sugeridos
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissSection('users')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {users.slice(0, 3).map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-1">
                      <Link 
                        href={`/profile/${user.username}`}
                        className="font-medium text-sm hover:text-crunevo-600 transition-colors"
                      >
                        {user.name}
                      </Link>
                      {user.verified && (
                        <Badge className="bg-crunevo-100 text-crunevo-700 text-xs px-1 py-0">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{user.career}</p>
                    <p className="text-xs text-gray-400">{formatNumber(user.followers)} seguidores</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={user.isFollowing ? "outline" : "default"}
                  onClick={() => handleFollow(user.id)}
                  className={user.isFollowing ? "" : "bg-crunevo-600 hover:bg-crunevo-700"}
                >
                  {user.isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
              </div>
            ))}
            <Link href="/discover/users">
              <Button variant="ghost" className="w-full text-crunevo-600 hover:bg-crunevo-50">
                Ver más usuarios
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Suggested Clubs */}
      {!dismissedSections.includes('clubs') && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-crunevo-600" />
                Clubes recomendados
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissSection('clubs')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {clubs.map((club) => (
              <div key={club.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={club.avatar} alt={club.name} />
                      <AvatarFallback>
                        {club.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link 
                        href={`/clubs/${club.id}`}
                        className="font-medium text-sm hover:text-crunevo-600 transition-colors"
                      >
                        {club.name}
                      </Link>
                      <p className="text-xs text-gray-500">{club.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {club.category}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {formatNumber(club.members)} miembros
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={club.isJoined ? "outline" : "default"}
                  onClick={() => handleJoinClub(club.id)}
                  className={`w-full ${club.isJoined ? "" : "bg-crunevo-600 hover:bg-crunevo-700"}`}
                >
                  {club.isJoined ? 'Miembro' : 'Unirse'}
                </Button>
              </div>
            ))}
            <Link href="/clubs">
              <Button variant="ghost" className="w-full text-crunevo-600 hover:bg-crunevo-50">
                Explorar clubes
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Trending Courses */}
      {!dismissedSections.includes('courses') && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-crunevo-600" />
                Cursos populares
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissSection('courses')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCourses.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <Link 
                    href={`/courses/${course.id}`}
                    className="font-medium text-sm hover:text-crunevo-600 transition-colors line-clamp-2"
                  >
                    {course.title}
                  </Link>
                  <p className="text-xs text-gray-500">{course.instructor}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-xs text-gray-600 ml-1">{course.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatNumber(course.students)} estudiantes
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-semibold text-crolars">
                        {course.price}
                      </span>
                      <span className="text-xs text-crolars">₡</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/courses">
              <Button variant="ghost" className="w-full text-crunevo-600 hover:bg-crunevo-50">
                Ver todos los cursos
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Crunevo+ Promotion */}
      {!dismissedSections.includes('premium') && (
        <Card className="bg-gradient-to-br from-crunevo-50 to-crunevo-100 border-crunevo-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-crunevo-800">
                ✨ Crunevo+
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissSection('premium')}
                className="text-crunevo-400 hover:text-crunevo-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-crunevo-700 mb-4">
              Accede a contenido premium, cursos exclusivos y beneficios especiales.
            </p>
            <Link href="/premium">
              <Button className="w-full bg-crunevo-600 hover:bg-crunevo-700">
                Conocer más
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
