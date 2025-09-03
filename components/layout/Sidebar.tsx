'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCrolars } from '@/hooks/useCrolars';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  User,
  FileText,
  MessageSquare,
  Users,
  Calendar,
  BookOpen,
  ShoppingCart,
  Gamepad2,
  Target,
  Trophy,
  Bot,
  TrendingUp,
  Bookmark,
  Coins,
  Flame,
  ChevronLeft,
  ChevronRight,
  Upload,
  HelpCircle,
  UserPlus,
  Award,
  Star,
  Grid3X3,
  GraduationCap,
  ShoppingBag,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UserMiniCard } from '@/components/sidebar/UserMiniCard';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  color?: string;
}

const mainNavItems: SidebarItem[] = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Perfil', href: '/perfil', icon: User },
  { name: 'Workspace', href: '/workspace', icon: Grid3X3, color: 'text-crunevo-600' },
  { name: 'Apuntes', href: '/notes', icon: FileText },
  { name: 'Foro', href: '/forum', icon: MessageSquare },
  { name: 'Clubes', href: '/clubs', icon: Users },
  { name: 'Eventos', href: '/events', icon: Calendar },
  { name: 'Cursos', href: '/courses', icon: GraduationCap },
  { name: 'Tienda', href: '/marketplace', icon: ShoppingBag },
];

const gamificationItems: SidebarItem[] = [
  { name: 'Gamificación', href: '/perfil/gamification', icon: Zap, color: 'text-crunevo-600' },
  { name: 'Misiones', href: '/challenges', icon: Target, badge: '3' },
  { name: 'Ranking', href: '/ranking', icon: Trophy },
  { name: 'Liga Académica', href: '/league', icon: Award },
];

const utilityItems: SidebarItem[] = [
  { name: 'CruneBot', href: '/crunebot', icon: Bot, color: 'text-crunevo-600' },
  { name: 'Tendencias', href: '/trending', icon: TrendingUp },
  { name: 'Guardados', href: '/bookmarks', icon: Bookmark },
];

const quickActionItems: SidebarItem[] = [
  { name: 'Subir Apunte', href: '/notes/upload', icon: Upload },
  { name: 'Hacer Pregunta', href: '/forum/ask', icon: HelpCircle },
  { name: 'Crear Club', href: '/clubs/create', icon: UserPlus },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const { data: crolarsData } = useCrolars();
  const crolars = crolarsData?.user.crolars ?? 0;

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return num.toString();
  };
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
        'hidden md:block sticky top-16 h-[calc(100vh-4rem)] bg-white border-r border-crunevo-200 transition-all duration-300 overflow-y-auto',
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

        {/* User Mini Card */}
        {!isCollapsed && session && session.user && (
          <div className="mb-6">
            <UserMiniCard
              user={{
                name: session.user.name || '',
                username: (session.user as any).username || '',
                level: 1,
                xp: 0,
                xpToNext: 100,
              }}
            />
          </div>
        )}

        {/* User Crolars Balance - Enhanced Visibility */}
        {!isCollapsed && (
          <Link href="/crolars">
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400/20 via-orange-400/15 to-yellow-500/20 rounded-xl border-2 border-yellow-400/30 shadow-lg hover:shadow-xl hover:border-yellow-400/50 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-400 rounded-full shadow-md group-hover:bg-yellow-500 transition-colors duration-200">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide group-hover:text-gray-800 transition-colors duration-200">Mis Crolars</p>
                    <p className="text-2xl font-bold text-yellow-600 group-hover:text-yellow-700 transition-colors duration-200">{crolars.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">Saldo</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 group-hover:text-yellow-600 transition-colors duration-200" />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-200">Premium</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}
        
        {/* Collapsed Crolars Balance */}
        {isCollapsed && (
          <Link href="/crolars">
            <div className="mb-6 p-3 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 rounded-lg border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer group">
              <div className="flex flex-col items-center space-y-1">
                <div className="p-2 bg-yellow-400 rounded-full shadow-md group-hover:bg-yellow-500 transition-colors duration-200">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-yellow-600 group-hover:text-yellow-700 transition-colors duration-200">{formatNumber(crolars)}</p>
              </div>
            </div>
          </Link>
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
        <div className="mt-8">
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Accesos Rápidos
            </h3>
          )}
          <nav className="space-y-1">
            {quickActionItems.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        {/* Weekly Streak - Bottom Statistics */}
        {!isCollapsed && (
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">Racha Semanal</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">7 días</div>
                <div className="text-xs text-orange-600">¡Sigue así!</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
