import {
  Home,
  User,
  FileText,
  MessageSquare,
  Users,
  Calendar,
  Target,
  Trophy,
  Bot,
  TrendingUp,
  Bookmark,
  Upload,
  HelpCircle,
  UserPlus,
  Award,
  Grid3X3,
  GraduationCap,
  ShoppingBag,
  Zap,
  Rss
} from 'lucide-react'

export interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  color?: string
}

export const mainNavItems: SidebarItem[] = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Feed', href: '/feed', icon: Rss },
  { name: 'Perfil', href: '/perfil', icon: User },
  { name: 'Workspace', href: '/workspace', icon: Grid3X3, color: 'text-crunevo-600' },
  { name: 'Apuntes', href: '/notes', icon: FileText },
  { name: 'Foro', href: '/forum', icon: MessageSquare },
  { name: 'Clubes', href: '/clubs', icon: Users },
  { name: 'Eventos', href: '/events', icon: Calendar },
  { name: 'Cursos', href: '/courses', icon: GraduationCap },
  { name: 'Tienda', href: '/marketplace', icon: ShoppingBag }
]

export const gamificationItems: SidebarItem[] = [
  { name: 'Gamificación', href: '/perfil/gamification', icon: Zap, color: 'text-crunevo-600' },
  { name: 'Misiones', href: '/challenges', icon: Target, badge: '3' },
  { name: 'Ranking', href: '/ranking', icon: Trophy },
  { name: 'Liga Académica', href: '/league', icon: Award }
]

export const utilityItems: SidebarItem[] = [
  { name: 'CruneBot', href: '/crunebot', icon: Bot, color: 'text-crunevo-600' },
  { name: 'Tendencias', href: '/trending', icon: TrendingUp },
  { name: 'Guardados', href: '/bookmarks', icon: Bookmark }
]

export const quickActionItems: SidebarItem[] = [
  { name: 'Subir Apunte', href: '/notes/upload', icon: Upload },
  { name: 'Hacer Pregunta', href: '/forum/ask', icon: HelpCircle },
  { name: 'Crear Club', href: '/clubs/create', icon: UserPlus }
]
