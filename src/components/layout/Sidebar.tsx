'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  User,
  FileText,
  MessageSquare,
  Users,
  Calendar,
  GraduationCap,
  ShoppingBag,
  Target,
  Trophy,
  Bot,
  TrendingUp,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Coins,
  Flame,
  Star,
  Grid3X3,
  Zap,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  color?: string;
}

const mainNavItems: SidebarItem[] = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Perfil', href: '/profile', icon: User },
  { name: 'Espacio Personal', href: '/personal-space', icon: Grid3X3, color: 'text-crunevo-600' },
  { name: 'Apuntes', href: '/notes', icon: FileText },
  { name: 'Foro', href: '/forum', icon: MessageSquare },
  { name: 'Clubes', href: '/clubs', icon: Users },
  { name: 'Eventos', href: '/events', icon: Calendar },
  { name: 'Cursos', href: '/courses', icon: GraduationCap },
  { name: 'Tienda', href: '/marketplace', icon: ShoppingBag },
];

const gamificationItems: SidebarItem[] = [
  { name: 'Gamificación', href: '/gamification', icon: Zap, color: 'text-crunevo-600' },
  { name: 'Misiones', href: '/missions', icon: Target, badge: '3' },
  { name: 'Ranking', href: '/ranking', icon: Trophy },
  { name: 'Liga Académica', href: '/league', icon: Star },
];

const utilityItems: SidebarItem[] = [
  { name: 'CruneBot', href: '/crunebot', icon: Bot, color: 'text-crunevo-600' },
  { name: 'Tendencias', href: '/trending', icon: TrendingUp },
  { name: 'Guardados', href: '/bookmarks', icon: Bookmark },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const SidebarLink = ({ item }: { item: SidebarItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
          active
            ? 'bg-crunevo-100 text-crunevo-700 shadow-sm'
            : 'text-gray-600 hover:bg-crunevo-50 hover:text-crunevo-600',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <Icon 
          className={cn(
            'w-5 h-5 flex-shrink-0',
            item.color || (active ? 'text-crunevo-600' : ''),
            'group-hover:scale-110 transition-transform duration-200'
          )} 
        />
        {!isCollapsed && (
          <>
            <span className="font-medium">{item.name}</span>
            {item.badge && (
              <Badge className="ml-auto bg-crunevo-500 text-white text-xs px-1.5 py-0.5">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <aside 
      className={cn(
        'sticky top-16 h-[calc(100vh-4rem)] bg-white border-r border-crunevo-200 transition-all duration-300 overflow-y-auto',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4">
        {/* Collapse Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-crunevo-600"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* User Crolars Balance */}
        {!isCollapsed && (
          <div className="mb-6 p-3 bg-gradient-to-r from-crolars/10 to-crolars/5 rounded-lg border border-crolars/20">
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-crolars" />
              <div>
                <p className="text-sm font-medium text-gray-900">Mis Crolars</p>
                <p className="text-lg font-bold text-crolars">2,450</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="space-y-1">
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Principal
            </h3>
          )}
          {mainNavItems.map((item) => (
            <SidebarLink key={item.href} item={item} />
          ))}
        </nav>

        {/* Gamification Section */}
        <div className="mt-8">
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Gamificación
            </h3>
          )}
          <nav className="space-y-1">
            {gamificationItems.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        {/* Utility Section */}
        <div className="mt-8">
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Herramientas
            </h3>
          )}
          <nav className="space-y-1">
            {utilityItems.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Accesos Rápidos
            </h3>
            <div className="space-y-2">
              <Link
                href="/notes/upload"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-crunevo-600 hover:bg-crunevo-50 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Subir Apunte</span>
              </Link>
              <Link
                href="/forum/ask"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-crunevo-600 hover:bg-crunevo-50 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Hacer Pregunta</span>
              </Link>
              <Link
                href="/clubs/create"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-crunevo-600 hover:bg-crunevo-50 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Crear Club</span>
              </Link>
            </div>
          </div>
        )}

        {/* Weekly Streak Indicator */}
        {!isCollapsed && (
          <div className="mt-8 p-3 bg-gradient-to-r from-fire/10 to-fire/5 rounded-lg border border-fire/20">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-fire" />
              <div>
                <p className="text-sm font-medium text-gray-900">Racha Semanal</p>
                <p className="text-xs text-gray-600">5 de 7 días completados</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="bg-fire h-1.5 rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}