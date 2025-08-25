'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  Zap, 
  Calendar, 
  Users, 
  BookOpen, 
  MessageSquare, 
  TrendingUp,
  Lock,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react'
import { Achievement } from '@/types/gamification'

interface AchievementSystemProps {
  achievements: Achievement[]
  userAchievements: string[] // IDs de achievements desbloqueados
  className?: string
}

// Datos mock de achievements
const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'Primer Paso',
    description: 'Completa tu primer desafío',
    icon: 'star',
    category: 'challenges',
    rarity: 'common',
    xpReward: 50,
    crolarsReward: 10,
    requirements: {
      type: 'challenges_completed',
      target: 1,
      current: 0
    },
    unlockedAt: undefined
  },
  {
    id: '2',
    name: 'Estudiante Dedicado',
    description: 'Mantén una racha de 7 días consecutivos',
    icon: 'calendar',
    category: 'streaks',
    rarity: 'uncommon',
    xpReward: 200,
    crolarsReward: 50,
    requirements: {
      type: 'daily_streak',
      target: 7,
      current: 3
    },
    unlockedAt: undefined
  },
  {
    id: '3',
    name: 'Maestro del Conocimiento',
    description: 'Alcanza el nivel 10',
    icon: 'trophy',
    category: 'levels',
    rarity: 'rare',
    xpReward: 500,
    crolarsReward: 100,
    requirements: {
      type: 'level_reached',
      target: 10,
      current: 5
    },
    unlockedAt: undefined
  },
  {
    id: '4',
    name: 'Coleccionista',
    description: 'Obtén 25 insignias diferentes',
    icon: 'award',
    category: 'badges',
    rarity: 'epic',
    xpReward: 1000,
    crolarsReward: 250,
    requirements: {
      type: 'badges_collected',
      target: 25,
      current: 12
    },
    unlockedAt: undefined
  },
  {
    id: '5',
    name: 'Leyenda Académica',
    description: 'Completa 100 desafíos',
    icon: 'target',
    category: 'challenges',
    rarity: 'legendary',
    xpReward: 2500,
    crolarsReward: 500,
    requirements: {
      type: 'challenges_completed',
      target: 100,
      current: 45
    },
    unlockedAt: undefined
  },
  {
    id: '6',
    name: 'Mentor Comunitario',
    description: 'Ayuda a 50 estudiantes en el foro',
    icon: 'users',
    category: 'community',
    rarity: 'rare',
    xpReward: 750,
    crolarsReward: 150,
    requirements: {
      type: 'forum_answers',
      target: 50,
      current: 23
    },
    unlockedAt: undefined
  }
]

// Componente para un achievement individual
function AchievementCard({ 
  achievement, 
  isUnlocked 
}: { 
  achievement: Achievement
  isUnlocked: boolean
}) {
  const getIcon = () => {
    const iconProps = { className: `h-6 w-6 ${isUnlocked ? '' : 'text-gray-400'}` }
    
    switch (achievement.icon) {
      case 'trophy':
        return <Trophy {...iconProps} />
      case 'award':
        return <Award {...iconProps} />
      case 'star':
        return <Star {...iconProps} />
      case 'target':
        return <Target {...iconProps} />
      case 'calendar':
        return <Calendar {...iconProps} />
      case 'users':
        return <Users {...iconProps} />
      case 'book':
        return <BookOpen {...iconProps} />
      case 'message':
        return <MessageSquare {...iconProps} />
      default:
        return <Zap {...iconProps} />
    }
  }

  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50'
      case 'uncommon':
        return 'border-green-300 bg-green-50'
      case 'rare':
        return 'border-blue-300 bg-blue-50'
      case 'epic':
        return 'border-purple-300 bg-purple-50'
      case 'legendary':
        return 'border-yellow-300 bg-yellow-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const getRarityBadgeColor = () => {
    switch (achievement.rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800'
      case 'uncommon':
        return 'bg-green-100 text-green-800'
      case 'rare':
        return 'bg-blue-100 text-blue-800'
      case 'epic':
        return 'bg-purple-100 text-purple-800'
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const progress = achievement.requirements.current / achievement.requirements.target * 100
  const isCompleted = progress >= 100

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-md ${
      isUnlocked 
        ? `${getRarityColor()} border-2` 
        : 'border-gray-200 bg-gray-50 opacity-75'
    }`}>
      {/* Indicador de desbloqueado */}
      {isUnlocked && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
          <CheckCircle className="h-4 w-4" />
        </div>
      )}
      
      {/* Indicador de bloqueado */}
      {!isUnlocked && !isCompleted && (
        <div className="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full p-1">
          <Lock className="h-4 w-4" />
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icono */}
          <div className={`flex-shrink-0 p-2 rounded-lg ${
            isUnlocked ? getRarityColor() : 'bg-gray-100'
          }`}>
            {getIcon()}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h4 className={`font-semibold text-sm ${
                  isUnlocked ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {achievement.name}
                </h4>
                <p className={`text-xs mt-1 ${
                  isUnlocked ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {achievement.description}
                </p>
              </div>
              
              <Badge className={`text-xs ${getRarityBadgeColor()}`}>
                {achievement.rarity === 'common' && 'Común'}
                {achievement.rarity === 'uncommon' && 'Poco común'}
                {achievement.rarity === 'rare' && 'Raro'}
                {achievement.rarity === 'epic' && 'Épico'}
                {achievement.rarity === 'legendary' && 'Legendario'}
              </Badge>
            </div>

            {/* Progreso */}
            {!isUnlocked && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progreso</span>
                  <span>{achievement.requirements.current}/{achievement.requirements.target}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Recompensas */}
            <div className="flex items-center gap-2 text-xs">
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                isUnlocked ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <Zap className="h-3 w-3" />
                <span>+{achievement.xpReward} XP</span>
              </div>
              
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                isUnlocked ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <span className="text-xs">💰</span>
                <span>+{achievement.crolarsReward} Crolars</span>
              </div>
            </div>

            {/* Fecha de desbloqueo */}
            {isUnlocked && achievement.unlockedAt && (
              <div className="text-xs text-gray-500 mt-2">
                Desbloqueado el {new Date(achievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AchievementSystem({ 
  achievements = mockAchievements, 
  userAchievements = ['1', '3'], // Mock: usuario tiene achievements 1 y 3
  className = '' 
}: AchievementSystemProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  // Filtrar achievements
  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter
    const matchesRarity = rarityFilter === 'all' || achievement.rarity === rarityFilter
    
    const isUnlocked = userAchievements.includes(achievement.id)
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'unlocked' && isUnlocked) ||
                         (statusFilter === 'locked' && !isUnlocked)
    
    return matchesSearch && matchesCategory && matchesRarity && matchesStatus
  })

  // Estadísticas
  const totalAchievements = achievements.length
  const unlockedAchievements = userAchievements.length
  const completionPercentage = (unlockedAchievements / totalAchievements) * 100

  const categories = [...new Set(achievements.map(a => a.category))]
  const rarities = [...new Set(achievements.map(a => a.rarity))]

  return (
    <div className={className}>
      {/* Header con estadísticas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Sistema de Logros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{unlockedAchievements}</div>
              <div className="text-sm text-blue-800">Logros Desbloqueados</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{totalAchievements}</div>
              <div className="text-sm text-gray-800">Total de Logros</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.round(completionPercentage)}%</div>
              <div className="text-sm text-green-800">Completado</div>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progreso General</span>
              <span>{unlockedAchievements}/{totalAchievements}</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar logros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por categoría */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'challenges' && 'Desafíos'}
                  {category === 'streaks' && 'Rachas'}
                  {category === 'levels' && 'Niveles'}
                  {category === 'badges' && 'Insignias'}
                  {category === 'community' && 'Comunidad'}
                </option>
              ))}
            </select>

            {/* Filtro por rareza */}
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todas las rarezas</option>
              {rarities.map(rarity => (
                <option key={rarity} value={rarity}>
                  {rarity === 'common' && 'Común'}
                  {rarity === 'uncommon' && 'Poco común'}
                  {rarity === 'rare' && 'Raro'}
                  {rarity === 'epic' && 'Épico'}
                  {rarity === 'legendary' && 'Legendario'}
                </option>
              ))}
            </select>

            {/* Filtro por estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'unlocked' | 'locked')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="unlocked">Desbloqueados</option>
              <option value="locked">Bloqueados</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isUnlocked={userAchievements.includes(achievement.id)}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Filter className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-semibold text-gray-600 mb-2">No se encontraron logros</h3>
            <p className="text-sm text-gray-500">
              Intenta ajustar los filtros para ver más resultados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}