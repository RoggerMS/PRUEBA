'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Award, 
  Search, 
  Filter, 
  Star, 
  Trophy, 
  Target, 
  Users, 
  Flame, 
  Crown,
  Lock,
  Calendar
} from 'lucide-react'
import { Badge as BadgeType } from '@/types/gamification'

interface BadgeCollectionProps {
  badges?: BadgeType[]
  totalBadges?: number
  className?: string
}

// Mock data para badges disponibles
const ALL_BADGES: BadgeType[] = [
  {
    id: '1',
    name: 'Primer Paso',
    description: 'Completa tu primer curso',
    icon: '🎯',
    rarity: 'common',
    category: 'learning',
    earnedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Constancia',
    description: 'Mantén una racha de 7 días',
    icon: '🔥',
    rarity: 'rare',
    category: 'streak',
    earnedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '3',
    name: 'Maestría',
    description: 'Alcanza el nivel 8',
    icon: '👑',
    rarity: 'epic',
    category: 'milestone'
  },
  {
    id: '4',
    name: 'Leyenda Académica',
    description: 'Alcanza el nivel 10',
    icon: '⭐',
    rarity: 'legendary',
    category: 'milestone'
  },
  {
    id: '5',
    name: 'Colaborador',
    description: 'Responde 10 preguntas en el foro',
    icon: '🤝',
    rarity: 'common',
    category: 'social',
    earnedAt: '2024-01-18T12:00:00Z'
  },
  {
    id: '6',
    name: 'Desafiante',
    description: 'Completa 5 desafíos',
    icon: '⚡',
    rarity: 'rare',
    category: 'challenge',
    earnedAt: '2024-01-22T09:15:00Z'
  },
  {
    id: '7',
    name: 'Inmortal del Saber',
    description: 'Alcanza el nivel 12',
    icon: '💎',
    rarity: 'legendary',
    category: 'milestone'
  },
  {
    id: '8',
    name: 'Trascendencia',
    description: 'Alcanza el nivel 14',
    icon: '🌟',
    rarity: 'legendary',
    category: 'milestone'
  },
  {
    id: '9',
    name: 'Omnisciencia',
    description: 'Alcanza el nivel máximo',
    icon: '🔮',
    rarity: 'legendary',
    category: 'milestone'
  },
  {
    id: '10',
    name: 'Explorador',
    description: 'Únete a 3 clubes diferentes',
    icon: '🗺️',
    rarity: 'common',
    category: 'social'
  }
]

export default function BadgeCollection({ badges = [], totalBadges = 50, className = '' }: BadgeCollectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterRarity, setFilterRarity] = useState<string>('all')
  const [showEarnedOnly, setShowEarnedOnly] = useState(false)

  // Combinar badges ganados con todos los badges disponibles
  const allBadgesWithStatus = ALL_BADGES.map(badge => {
    const earnedBadge = badges.find(b => b.id === badge.id)
    return earnedBadge || { ...badge, earnedAt: undefined }
  })

  // Filtrar badges
  const filteredBadges = allBadgesWithStatus.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || badge.category === filterCategory
    const matchesRarity = filterRarity === 'all' || badge.rarity === filterRarity
    const matchesEarned = !showEarnedOnly || badge.earnedAt

    return matchesSearch && matchesCategory && matchesRarity && matchesEarned
  })

  const getRarityColor = (rarity: BadgeType['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50'
      case 'rare': return 'border-blue-300 bg-blue-50'
      case 'epic': return 'border-purple-300 bg-purple-50'
      case 'legendary': return 'border-yellow-300 bg-yellow-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getRarityBadgeColor = (rarity: BadgeType['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800'
      case 'rare': return 'bg-blue-100 text-blue-800'
      case 'epic': return 'bg-purple-100 text-purple-800'
      case 'legendary': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: BadgeType['category']) => {
    switch (category) {
      case 'learning': return <Target className="h-4 w-4" />
      case 'social': return <Users className="h-4 w-4" />
      case 'streak': return <Flame className="h-4 w-4" />
      case 'challenge': return <Trophy className="h-4 w-4" />
      case 'milestone': return <Crown className="h-4 w-4" />
      case 'special': return <Star className="h-4 w-4" />
      default: return <Award className="h-4 w-4" />
    }
  }

  const earnedCount = badges.length
  const completionPercentage = Math.round((earnedCount / totalBadges) * 100)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Colección de Insignias
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {earnedCount} de {totalBadges} insignias desbloqueadas ({completionPercentage}%)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{earnedCount}</div>
            <div className="text-xs text-gray-500">Insignias</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar insignias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="learning">Aprendizaje</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="streak">Racha</SelectItem>
              <SelectItem value="challenge">Desafíos</SelectItem>
              <SelectItem value="milestone">Hitos</SelectItem>
              <SelectItem value="special">Especiales</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRarity} onValueChange={setFilterRarity}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Rareza" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="common">Común</SelectItem>
              <SelectItem value="rare">Rara</SelectItem>
              <SelectItem value="epic">Épica</SelectItem>
              <SelectItem value="legendary">Legendaria</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showEarnedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowEarnedOnly(!showEarnedOnly)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Solo ganadas
          </Button>
        </div>

        {/* Grid de insignias */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBadges.map((badge) => (
            <Card 
              key={badge.id} 
              className={`relative transition-all duration-200 hover:shadow-md ${
                badge.earnedAt 
                  ? `${getRarityColor(badge.rarity)} border-2` 
                  : 'bg-gray-100 border-gray-200 opacity-60'
              }`}
            >
              <CardContent className="p-4 text-center">
                {/* Icono de la insignia */}
                <div className="relative mb-3">
                  <div className={`text-4xl mb-2 transition-all duration-200 ${
                    badge.earnedAt ? 'scale-100' : 'grayscale scale-90'
                  }`}>
                    {badge.icon}
                  </div>
                  
                  {!badge.earnedAt && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Información de la insignia */}
                <div className="space-y-2">
                  <h3 className={`font-semibold text-sm ${
                    badge.earnedAt ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </h3>
                  
                  <p className={`text-xs leading-tight ${
                    badge.earnedAt ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {badge.description}
                  </p>

                  {/* Badges de rareza y categoría */}
                  <div className="flex flex-wrap gap-1 justify-center">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-2 py-0 ${getRarityBadgeColor(badge.rarity)}`}
                    >
                      {badge.rarity}
                    </Badge>
                    
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                      badge.earnedAt ? 'bg-gray-100 text-gray-700' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {getCategoryIcon(badge.category)}
                    </div>
                  </div>

                  {/* Fecha de obtención */}
                  {badge.earnedAt && (
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-2">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(badge.earnedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron insignias con los filtros aplicados</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}