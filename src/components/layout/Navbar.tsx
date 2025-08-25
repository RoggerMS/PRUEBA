'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Search, MessageCircle, User, Settings, LogOut, Menu, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export function Navbar() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-crunevo-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-crunevo-500 to-crunevo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gradient hidden sm:block">
                CRUNEVO
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar apuntes, personas, clubes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-crunevo-50 border-crunevo-200 focus:border-crunevo-400 focus:ring-crunevo-400"
                />
              </div>
            </form>
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <NotificationCenter />

            {/* Messages */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/messages">
                <MessageCircle className="w-5 h-5" />
              </Link>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                    <AvatarFallback className="bg-crunevo-500 text-white">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/personal-space" className="flex items-center">
                    <div className="mr-2 h-4 w-4 bg-crunevo-500 rounded-sm"></div>
                    <span>Espacio Personal</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-crunevo-200 py-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/notifications"
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-crunevo-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Bell className="w-5 h-5" />
                <span>Notificaciones</span>
                <Badge className="ml-auto bg-crunevo-500">3</Badge>
              </Link>
              <Link
                href="/messages"
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-crunevo-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Mensajes</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-crunevo-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                <span>Perfil</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-crunevo-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5" />
                <span>Configuración</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
