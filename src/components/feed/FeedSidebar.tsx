'use client';

import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home,
  Users,
  BookOpen,
  Trophy,
  MessageSquare,
  ShoppingBag,
  Calendar,
  Settings,
  Bookmark,
  TrendingUp,
  Bell,
  User,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FeedSidebarProps {
  className?: string;
}

const NAVIGATION_ITEMS = [
  {
    label: 'Inicio',
    href: '/feed',
    icon: Home,
    badge: null
  },
  {
    label: 'Clubes',
    href: '/clubs',
    icon: Users,
    badge: null
  },
  {
    label: 'Cursos',
    href: '/courses',
    icon: BookOpen,
    badge: null
  },
  {
    label: 'Desafíos',
    href: '/challenges',
    icon: Trophy,
    badge: 'Nuevo'
  },
  {
    label: 'Foro',
    href: '/forum',
    icon: MessageSquare,
    badge: null
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingBag,
    badge: null
  },
  {
    label: 'Eventos',
    href: '/events',
    icon: Calendar,
    badge: null
  }
];

const QUICK_ACTIONS = [
  {
    label: 'Guardados',
    href: '/saved',
    icon: Bookmark,
    count: null
  },
  {
    label: 'Tendencias',
    href: '/trending',
    icon: TrendingUp,
    count: null
  },
  {
    label: 'Notificaciones',
    href: '/notifications',
    icon: Bell,
    count: 3
  }
];

export function FeedSidebar({ className }: FeedSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className={cn('space-y-6', className)}>
      {/* User Profile Card */}
      {session && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Cover gradient */}
            <div className="h-16 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500" />
            
            {/* Profile info */}
            <div className="px-4 pb-4 -mt-8">
              <div className="flex items-end space-x-3">
                <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={session.user?.image || ''} 
                    alt={session.user?.name || ''}
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {session.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 pb-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {session.user?.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">127</div>
                  <div className="text-xs text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">1.2k</div>
                  <div className="text-xs text-gray-500">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">2.5k</div>
                  <div className="text-xs text-gray-500">XP</div>
                </div>
              </div>
              
              {/* Quick profile actions */}
              <div className="flex items-center space-x-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <Link href="/profile">
                    <User className="w-3 h-3 mr-1" />
                    Perfil
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/settings">
                    <Settings className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Navegación</h3>
          </div>
          
          <nav className="p-2">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn(
                      'w-4 h-4',
                      isActive ? 'text-orange-600' : 'text-gray-500'
                    )} />
                    <span>{item.label}</span>
                  </div>
                  
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Accesos rápidos</h3>
          </div>
          
          <nav className="p-2">
            {QUICK_ACTIONS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn(
                      'w-4 h-4',
                      isActive ? 'text-orange-600' : 'text-gray-500'
                    )} />
                    <span>{item.label}</span>
                  </div>
                  
                  {item.count && (
                    <Badge 
                      variant="destructive" 
                      className="text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center"
                    >
                      {item.count}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>

      {/* Weekly Streak */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Trophy className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Racha semanal</h3>
              <p className="text-sm text-gray-600">¡Mantén tu progreso!</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progreso</span>
              <span className="font-medium text-orange-600">5/7 días</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: '71%' }}
              />
            </div>
            
            <p className="text-xs text-gray-500">
              ¡Solo 2 días más para completar tu racha semanal!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <Link href="/about" className="hover:text-gray-700">Acerca de</Link>
          <Link href="/privacy" className="hover:text-gray-700">Privacidad</Link>
          <Link href="/terms" className="hover:text-gray-700">Términos</Link>
        </div>
        
        <p className="text-xs text-gray-400">
          © 2024 CRUNEVO. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
