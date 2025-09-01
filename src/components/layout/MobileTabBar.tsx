'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  MessageSquare,
  FileText,
  Briefcase,
  Calendar,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

// EXACTAMENTE 6 ITEMS, reemplazando Clubes por INICIO e incluyendo EVENTOS
const QUICK_ITEMS = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/forum', icon: MessageSquare, label: 'Foro' },
  { href: '/apuntes', icon: FileText, label: 'Apuntes' },
  { href: '/workspace', icon: Briefcase, label: 'Workspace' },
  { href: '/eventos', icon: Calendar, label: 'Eventos' },
  { href: '/tienda', icon: Store, label: 'Tienda' },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  // ⚠️ ya NO es bottom fixed; ahora es una fila bajo el header
  return (
    <nav
      className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 md:hidden"
      role="navigation"
      aria-label="Accesos rápidos"
    >
      <ul
        className="px-3 py-2 flex justify-between gap-2 overflow-x-auto no-scrollbar"
      >
        {QUICK_ITEMS.map((tab) => {
          const Icon = tab.icon as any;
          const active = isActive(tab.href);
          return (
            <li key={tab.href} className="shrink-0">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  "w-14 h-14 flex flex-col items-center justify-center rounded-xl border bg-card text-card-foreground shadow-sm transition",
                  active
                    ? "border-crunevo-300/70 ring-1 ring-crunevo-300/50"
                    : "hover:shadow"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "opacity-100" : "opacity-80")} />
                <span className={cn("text-[11px] mt-1",
                  active ? "text-crunevo-600 dark:text-crunevo-400" : "text-neutral-500")}>
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