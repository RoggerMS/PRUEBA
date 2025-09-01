'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  MessageSquare, 
  FileText, 
  Briefcase, 
  Store, 
  User 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { 
    href: '/forum', 
    icon: MessageSquare, 
    label: 'Foro' 
  },
  { 
    href: '/apuntes', 
    icon: FileText, 
    label: 'Apuntes' 
  },
  { 
    href: '/workspace', 
    icon: Briefcase, 
    label: 'Workspace' 
  },
  { 
    href: '/tienda', 
    icon: Store, 
    label: 'Tienda' 
  },
  { 
    href: '/perfil', 
    icon: User, 
    label: 'Perfil' 
  }
];

export function MobileTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav 
      className="fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur border-t border-neutral-200 dark:border-neutral-800 shadow-sm md:hidden"
      role="navigation"
      aria-label="Navegación principal móvil"
    >
      <ul className="grid grid-cols-5 h-14">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          
          return (
            <li key={tab.href}>
              <Link 
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center h-full gap-1 transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-crunevo-500 focus:ring-inset",
                  active 
                    ? "text-crunevo-600 dark:text-crunevo-400" 
                    : "text-neutral-600 dark:text-neutral-400 hover:text-crunevo-500 dark:hover:text-crunevo-300"
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-70"
                  )} 
                />
                <span 
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    active 
                      ? "text-crunevo-600 dark:text-crunevo-400" 
                      : "text-neutral-500 dark:text-neutral-500"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}