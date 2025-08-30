'use client';

import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  HomeIcon,
  BookOpenIcon,
  MessageSquareIcon,
  ShoppingBagIcon,
  TrophyIcon,
  BellIcon,
  SettingsIcon,
  PlusIcon,
  CoinsIcon,
  StarIcon,
  TrendingUpIcon
} from 'lucide-react';
import Link from 'next/link';

interface UserStats {
  crolars: number;
  level: number;
  xp: number;
  xpToNext: number;
  notesShared: number;
  questionsAnswered: number;
  reputation: number;
}

// Mock data del usuario
const mockUserStats: UserStats = {
  crolars: 1250,
  level: 8,
  xp: 2340,
  xpToNext: 3000,
  notesShared: 23,
  questionsAnswered: 47,
  reputation: 892
};

const navigationItems = [
  { icon: HomeIcon, label: 'Inicio', href: '/', active: true },
  { icon: BookOpenIcon, label: 'Apuntes', href: '/notes' },
  { icon: MessageSquareIcon, label: 'Foro', href: '/forum' },
  { icon: ShoppingBagIcon, label: 'Marketplace', href: '/marketplace' },
  { icon: TrophyIcon, label: 'Rankings', href: '/gamification' },
  { icon: BellIcon, label: 'Notificaciones', href: '/notifications' },
  { icon: SettingsIcon, label: 'Configuración', href: '/profile/settings' }
];

const quickActions = [
  { icon: PlusIcon, label: 'Subir Apunte', href: '/notes/upload', color: 'bg-blue-500' },
  { icon: MessageSquareIcon, label: 'Hacer Pregunta', href: '/forum/ask', color: 'bg-green-500' },
  { icon: ShoppingBagIcon, label: 'Vender Servicio', href: '/marketplace/sell', color: 'bg-purple-500' }
];

export function FeedSidebar() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Perfil del usuario */}
      {session && (
        <Card className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-12 w-12">
              <img 
                src={session.user?.image || '/default-avatar.png'} 
                alt={session.user?.name || 'Usuario'}
                className="rounded-full"
              />
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {session.user?.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                Ingeniería de Sistemas
              </p>
            </div>
          </div>

          {/* Stats del usuario */}
          <div className="space-y-3">
            {/* Crolars */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CoinsIcon className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Crolars</span>
              </div>
              <Badge className="bg-orange-100 text-orange-800">
                {mockUserStats.crolars.toLocaleString()}
              </Badge>
            </div>

            {/* Nivel y XP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Nivel {mockUserStats.level}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {mockUserStats.xp}/{mockUserStats.xpToNext} XP
                </span>
              </div>
              <Progress 
                value={(mockUserStats.xp / mockUserStats.xpToNext) * 100} 
                className="h-2"
              />
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{mockUserStats.notesShared}</p>
                <p className="text-xs text-gray-500">Apuntes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{mockUserStats.questionsAnswered}</p>
                <p className="text-xs text-gray-500">Respuestas</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Navegación principal */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 text-gray-700">Navegación</h3>
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={item.active ? 'default' : 'ghost'} 
                  className="w-full justify-start text-sm"
                  size="sm"
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </Card>

      {/* Acciones rápidas */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 text-gray-700">Acciones Rápidas</h3>
        <div className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm hover:bg-gray-50"
                  size="sm"
                >
                  <div className={`h-3 w-3 rounded-full ${action.color} mr-3`} />
                  {action.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Desafío semanal */}
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center space-x-2 mb-3">
          <TrophyIcon className="h-4 w-4 text-purple-600" />
          <h3 className="font-semibold text-sm text-purple-800">Desafío Semanal</h3>
        </div>
        <p className="text-xs text-purple-700 mb-3">
          Sube 3 apuntes esta semana y gana 500 Crolars extra
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-purple-600">Progreso: 1/3</span>
            <span className="text-purple-600">+500 🪙</span>
          </div>
          <Progress value={33} className="h-2" />
        </div>
      </Card>

      {/* Trending topics */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUpIcon className="h-4 w-4 text-orange-500" />
          <h3 className="font-semibold text-sm text-gray-700">Trending</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">#algoritmos</span>
            <Badge variant="outline" className="text-xs">234 posts</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">#examenes</span>
            <Badge variant="outline" className="text-xs">189 posts</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">#proyectos</span>
            <Badge variant="outline" className="text-xs">156 posts</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">#tutorias</span>
            <Badge variant="outline" className="text-xs">98 posts</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}