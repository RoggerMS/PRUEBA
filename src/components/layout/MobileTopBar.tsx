'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { MobileNavbar } from './MobileNavbar';

interface MobileTopBarProps {
  onMenuToggle?: () => void;
}

export function MobileTopBar({ onMenuToggle }: MobileTopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuToggle?.();
  };

  return (
    <>
      <nav 
        className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 shadow-sm md:hidden"
        role="banner"
      >
        <div className="flex items-center gap-2 px-4 h-14">
          {/* Hamburger Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMenuToggle}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-expanded={isMenuOpen}
            aria-label="Abrir menú de navegación"
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center">
              <span className={`block w-4 h-0.5 bg-current transition-all duration-200 ${isMenuOpen ? 'rotate-45 translate-y-0.5' : ''}`} />
              <span className={`block w-4 h-0.5 bg-current mt-1 transition-all duration-200 ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-4 h-0.5 bg-current mt-1 transition-all duration-200 ${isMenuOpen ? '-rotate-45 -translate-y-0.5' : ''}`} />
            </div>
          </Button>

          {/* Logo */}
          <span className="font-semibold text-lg text-neutral-900 dark:text-white">
            CRUNEVO
          </span>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="mx-2 flex-1 max-w-[50vw]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full h-9 px-3 pl-9 text-sm bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:border-crunevo-400 focus:ring-crunevo-400"
                aria-label="Buscar contenido"
              />
            </div>
          </form>

          {/* Notifications */}
          <div className="flex-shrink-0">
            <NotificationCenter />
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileNavbar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}