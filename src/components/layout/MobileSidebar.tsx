'use client'

import Link from 'next/link'
import { Coins, Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  mainNavItems,
  gamificationItems,
  utilityItems,
  quickActionItems,
  SidebarItem,
} from './sidebarData'

interface MobileSidebarProps {
  onClose: () => void
}

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const SidebarLink = ({ item }: { item: SidebarItem }) => {
    const Icon = item.icon
    return (
      <Link
        href={item.href}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-crunevo-50"
        onClick={onClose}
      >
        <Icon className={cn('w-5 h-5', item.color)} />
        <span className="font-medium">{item.name}</span>
        {item.badge && (
          <Badge className="ml-auto bg-crunevo-500 text-white text-xs px-1.5 py-0.5">
            {item.badge}
          </Badge>
        )}
      </Link>
    )
  }

  return (
    <div className="w-64 h-full bg-white p-4 overflow-y-auto">
      {/* Crolars Balance */}
      <Link href="/crolars" onClick={onClose}>
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400/20 via-orange-400/15 to-yellow-500/20 rounded-xl border-2 border-yellow-400/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-400 rounded-full">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Mis Crolars</p>
              <p className="text-2xl font-bold text-yellow-600">2,450</p>
            </div>
          </div>
        </div>
      </Link>

      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Principal</h3>
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Gamificación</h3>
          <nav className="space-y-1">
            {gamificationItems.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Herramientas</h3>
          <nav className="space-y-1">
            {utilityItems.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Accesos Rápidos</h3>
          <nav className="space-y-1">
            {quickActionItems.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        {/* Weekly Streak */}
        <div className="pt-4 border-t border-gray-200">
          <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">Racha Semanal</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">7 días</div>
            <div className="text-xs text-orange-600">¡Sigue así!</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileSidebar
