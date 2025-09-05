'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Menu, X, Bell, User, Settings, LogOut, ChevronDown,
  Home, FileText, MessageSquare, Users, Calendar, BookOpen, ShoppingCart,
  Gamepad2, Target, Trophy, Bot, TrendingUp, Bookmark, Coins,
  Upload, HelpCircle, UserPlus, Award, Star, Grid3X3, GraduationCap,
  ShoppingBag, Zap, Moon, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface MenuItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  new?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  // Principal
  { key: 'inicio', label: 'Inicio', href: '/', icon: Home },
  { key: 'perfil', label: 'Perfil', href: '/', icon: User },
  { key: 'workspace', label: 'Workspace', href: '/workspace', icon: Grid3X3 },
  { key: 'apunte', label: 'Apunte', href: '/apunte', icon: FileText },
  { key: 'foro', label: 'Foro', href: '/foro', icon: MessageSquare },
  { key: 'clubes', label: 'Clubes', href: '/clubes', icon: Users },
  { key: 'eventos', label: 'Eventos', href: '/eventos', icon: Calendar },
  { key: 'cursos', label: 'Cursos', href: '/cursos', icon: GraduationCap },
  { key: 'tienda', label: 'Tienda', href: '/tienda', icon: ShoppingBag },
  
  // Gamificación
  { key: 'gamificacion', label: 'Gamificación', href: '/gamification', icon: Zap },
  { key: 'misiones', label: 'Misiones', href: '/misiones', icon: Target, badge: 3 },
  { key: 'ranking', label: 'Ranking', href: '/ranking', icon: Trophy },
  { key: 'liga', label: 'Liga Académica', href: '/liga', icon: Award },
  
  // Utilidades
  { key: 'crunebot', label: 'Crunebot', href: '/crunebot', icon: Bot },
  { key: 'tendencias', label: 'Tendencias', href: '/tendencias', icon: TrendingUp },
  { key: 'guardados', label: 'Guardados', href: '/guardados', icon: Bookmark },
  
  // Sistema
  { key: 'settings', label: 'Configuración', href: '/settings', icon: Settings },
];

interface MobileNavbarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavbar({ isOpen, onClose }: MobileNavbarProps) {
  const { data: session } = useSession();
  // Use props instead of internal state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = MENU_ITEMS.map((item) => {
    if (item.key === 'perfil') {
      return {
        ...item,
        href: session?.user
          ? `/${(session.user as any).username}`
          : '/auth/login',
      };
    }
    if (item.key === 'gamificacion') {
      return {
        ...item,
        href: session?.user
          ? `/${(session.user as any).username}/gamification`
          : '/auth/login',
      };
    }
    return item;
  });

  // Load dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Close drawer on route change
  useEffect(() => {
    const handleRouteChange = () => {
      onClose();
    };
    
    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [onClose]);

  // Close drawer
  const closeDrawer = () => {
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      const drawer = document.getElementById('mobile-drawer');
      const focusableElements = drawer?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' });
    closeDrawer();
  };

  return (
    <>
      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-drawer"
        className={cn(
          "fixed top-0 left-0 h-full w-[88%] max-w-[420px] bg-white dark:bg-neutral-900 shadow-2xl z-50 transform transition-transform duration-250 ease-out md:hidden overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 backdrop-blur border-b border-gray-200 dark:border-neutral-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeDrawer}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>

        {/* User Profile Header */}
        {session && (
          <div className="px-4 py-4 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                <AvatarFallback className="bg-blue-500 text-white text-lg">
                  {session.user?.name?.charAt(0) || <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{session.user?.name}</p>
                <Link
                  href={session?.user ? `/${(session.user as any).username}` : '/auth/login'}
                  onClick={closeDrawer}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver tu perfil
                </Link>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        )}

        {/* Menu Grid */}
        <div className="px-3 py-4">
          <div className="grid grid-cols-2 gap-3 pb-24">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={closeDrawer}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-3 h-20 rounded-2xl shadow-sm transition-all duration-200 group",
                    active
                      ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700"
                      : "bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:shadow-md"
                  )}
                  aria-label={item.label}
                >
                  <Icon 
                    className={cn(
                      "w-6 h-6 mb-1 transition-transform duration-200 group-hover:scale-110",
                      active 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-600 dark:text-gray-400"
                    )} 
                  />
                  <span className={cn(
                    "text-sm font-medium text-center leading-tight",
                    active 
                      ? "text-blue-700 dark:text-blue-300" 
                      : "text-gray-700 dark:text-gray-300"
                  )}>
                    {item.label}
                  </span>
                  
                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}
                  
                  {/* New Pill */}
                  {item.new && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      NEW
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-t border-gray-200 dark:border-neutral-700 px-4 py-4 space-y-3">
          {/* Settings & Privacy */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Settings & privacy</h3>
            
            <Link
              href="/settings"
              onClick={closeDrawer}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Settings</span>
            </Link>
            
            {/* Orders and payments - if applicable */}
            <Link
              href="/orders"
              onClick={closeDrawer}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Orders and payments</span>
            </Link>
            
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
              <div className="flex items-center space-x-3">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
                <span className="text-gray-700 dark:text-gray-300">Dark mode</span>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                aria-label="Toggle dark mode"
              />
            </div>
          </div>

          {/* Logout */}
          {session && (
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
            >
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-600 dark:text-red-400">Cerrar sesión</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}