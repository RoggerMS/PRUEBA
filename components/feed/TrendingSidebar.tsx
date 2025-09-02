'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  TrendingUpIcon,
  FlameIcon,
  UsersIcon,
  BookOpenIcon,
  MessageSquareIcon,
  ShoppingBagIcon,
  StarIcon,
  EyeIcon,
  ArrowUpIcon
} from 'lucide-react';
import Link from 'next/link';

interface TrendingNote {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  subject: string;
  views: number;
  likes: number;
  price?: number;
}

interface TrendingQuestion {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  answers: number;
  votes: number;
  tags: string[];
}

interface PopularUser {
  id: string;
  name: string;
  avatar: string;
  reputation: number;
  specialty: string;
  isFollowing: boolean;
}

// Mock data
const trendingNotes: TrendingNote[] = [
  {
    id: '1',
    title: 'Algoritmos de Ordenamiento - Guía Completa',
    author: 'María González',
    authorAvatar: 'https://i.pravatar.cc/150?u=maria',
    subject: 'Algoritmos',
    views: 1234,
    likes: 89,
    price: 50
  },
  {
    id: '2',
    title: 'Cálculo Diferencial - Ejercicios Resueltos',
    author: 'Carlos Ruiz',
    authorAvatar: 'https://i.pravatar.cc/150?u=carlos',
    subject: 'Matemáticas',
    views: 987,
    likes: 67
  },
  {
    id: '3',
    title: 'Base de Datos - Normalización',
    author: 'Ana López',
    authorAvatar: 'https://i.pravatar.cc/150?u=ana',
    subject: 'Base de Datos',
    views: 756,
    likes: 45,
    price: 30
  }
];

const trendingQuestions: TrendingQuestion[] = [
  {
    id: '1',
    title: '¿Cómo optimizar consultas SQL complejas?',
    author: 'Pedro Martín',
    authorAvatar: 'https://i.pravatar.cc/150?u=pedro',
    answers: 12,
    votes: 34,
    tags: ['SQL', 'Optimización', 'Base de Datos']
  },
  {
    id: '2',
    title: 'Diferencias entre React y Vue.js',
    author: 'Laura Silva',
    authorAvatar: 'https://i.pravatar.cc/150?u=laura',
    answers: 8,
    votes: 28,
    tags: ['React', 'Vue', 'Frontend']
  },
  {
    id: '3',
    title: 'Mejores prácticas en Machine Learning',
    author: 'Diego Torres',
    authorAvatar: 'https://i.pravatar.cc/150?u=diego',
    answers: 15,
    votes: 42,
    tags: ['ML', 'Python', 'IA']
  }
];

const popularUsers: PopularUser[] = [
  {
    id: '1',
    name: 'Dr. Roberto Vega',
    avatar: 'https://i.pravatar.cc/150?u=roberto',
    reputation: 2340,
    specialty: 'Algoritmos y Estructuras de Datos',
    isFollowing: false
  },
  {
    id: '2',
    name: 'Ing. Sofia Mendez',
    avatar: 'https://i.pravatar.cc/150?u=sofia',
    reputation: 1890,
    specialty: 'Desarrollo Web',
    isFollowing: true
  },
  {
    id: '3',
    name: 'Lic. Miguel Castro',
    avatar: 'https://i.pravatar.cc/150?u=miguel',
    reputation: 1567,
    specialty: 'Machine Learning',
    isFollowing: false
  }
];

const trendingTopics = [
  { tag: 'algoritmos', posts: 234, growth: '+12%' },
  { tag: 'examenes', posts: 189, growth: '+8%' },
  { tag: 'proyectos', posts: 156, growth: '+15%' },
  { tag: 'tutorias', posts: 98, growth: '+22%' },
  { tag: 'javascript', posts: 87, growth: '+5%' }
];

export function TrendingSidebar() {
  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUpIcon className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-gray-800">Trending Topics</h3>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={topic.tag} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">#{topic.tag}</span>
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  {topic.growth}
                </Badge>
              </div>
              <span className="text-xs text-gray-500">{topic.posts} posts</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Apuntes Trending */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          {/* lucide-react does not export a FireIcon; use FlameIcon instead */}
          <FlameIcon className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-gray-800">Apuntes Populares</h3>
        </div>
        <div className="space-y-4">
          {trendingNotes.map((note) => (
            <div key={note.id} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
              <Link href={`/notes/${note.id}`} className="block hover:bg-gray-50 -m-2 p-2 rounded">
                <h4 className="font-medium text-sm text-gray-800 mb-2 line-clamp-2">
                  {note.title}
                </h4>
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <img src={note.authorAvatar} alt={note.author} className="rounded-full" />
                  </Avatar>
                  <span className="text-xs text-gray-600">{note.author}</span>
                  <Badge variant="secondary" className="text-xs">{note.subject}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="h-3 w-3" />
                      <span>{note.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FlameIcon className="h-3 w-3" />
                      <span>{note.likes}</span>
                    </div>
                  </div>
                  {note.price && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {note.price} 🪙
                    </Badge>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
        <Link href="/notes">
          <Button variant="ghost" className="w-full mt-3 text-sm">
            Ver más apuntes
          </Button>
        </Link>
      </Card>

      {/* Preguntas Trending */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquareIcon className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-800">Preguntas Populares</h3>
        </div>
        <div className="space-y-4">
          {trendingQuestions.map((question) => (
            <div key={question.id} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
              <Link href={`/forum/questions/${question.id}`} className="block hover:bg-gray-50 -m-2 p-2 rounded">
                <h4 className="font-medium text-sm text-gray-800 mb-2 line-clamp-2">
                  {question.title}
                </h4>
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <img src={question.authorAvatar} alt={question.author} className="rounded-full" />
                  </Avatar>
                  <span className="text-xs text-gray-600">{question.author}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MessageSquareIcon className="h-3 w-3" />
                      <span>{question.answers} respuestas</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ArrowUpIcon className="h-3 w-3" />
                      <span>{question.votes}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {question.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {question.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{question.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
        <Link href="/forum">
          <Button variant="ghost" className="w-full mt-3 text-sm">
            Ver más preguntas
          </Button>
        </Link>
      </Card>

      {/* Usuarios Populares */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <UsersIcon className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-gray-800">Usuarios Destacados</h3>
        </div>
        <div className="space-y-3">
          {popularUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <img src={user.avatar} alt={user.name} className="rounded-full" />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.specialty}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <StarIcon className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-gray-600">
                      {user.reputation.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant={user.isFollowing ? "outline" : "default"}
                className="text-xs"
              >
                {user.isFollowing ? 'Siguiendo' : 'Seguir'}
              </Button>
            </div>
          ))}
        </div>
        <Link href="/users">
          <Button variant="ghost" className="w-full mt-3 text-sm">
            Ver más usuarios
          </Button>
        </Link>
      </Card>

      {/* Marketplace Destacado */}
      <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center space-x-2 mb-3">
          <ShoppingBagIcon className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Servicios Destacados</h3>
        </div>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <h4 className="font-medium text-sm text-gray-800 mb-1">
              Tutoría de Cálculo Integral
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              Sesiones personalizadas 1:1
            </p>
            <div className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-800 text-xs">
                200 🪙/hora
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <StarIcon className="h-3 w-3 text-yellow-500" />
                <span>4.9 (23)</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <h4 className="font-medium text-sm text-gray-800 mb-1">
              Desarrollo de Proyecto Final
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              Asesoría completa para tesis
            </p>
            <div className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-800 text-xs">
                1500 🪙
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <StarIcon className="h-3 w-3 text-yellow-500" />
                <span>5.0 (8)</span>
              </div>
            </div>
          </div>
        </div>
        <Link href="/marketplace">
          <Button variant="outline" className="w-full mt-3 text-sm border-green-300 text-green-700 hover:bg-green-50">
            Ver marketplace
          </Button>
        </Link>
      </Card>
    </div>
  );
}