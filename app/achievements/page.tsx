'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BadgeCollection from '@/components/gamification/BadgeCollection'
import AchievementCard from '@/components/perfil/AchievementCard'
import { Trophy, Search, Filter, ArrowLeft, Award, Target, Star, Zap } from 'lucide-react'

// Mock data for achievements
const mockAchievements = [
  {
    id: '1',
    title: 'Primer Post',
    description: 'Publicaste tu primer contenido en la plataforma',
    icon: '🎉',
    category: 'Contenido',
    difficulty: 'Fácil',
    points: 10,
    earned: true,
    earnedAt: '2024-01-15',
    rarity: 'common',
    reward: 'Badge: Creador Novato'
  },
  {
    id: '2',
    title: 'Estudiante Activo',
    description: 'Completa tu perfil académico con universidad y carrera',
    icon: '🎓',
    category: 'Perfil',
    difficulty: 'Fácil',
    points: 15,
    earned: true,
    earnedAt: '2024-01-10',
    rarity: 'common',
    reward: 'XP: +15 puntos'
  },
  {
    id: '3',
    title: 'Networking Pro',
    description: 'Conecta con 50 estudiantes de tu universidad',
    icon: '🤝',
    category: 'Social',
    difficulty: 'Medio',
    points: 50,
    earned: false,
    progress: 23,
    maxProgress: 50,
    rarity: 'uncommon',
    reward: 'Badge: Conector'
  },
  {
    id: '4',
    title: 'Mentor Experto',
    description: 'Ayuda a 10 estudiantes con sus dudas académicas',
    icon: '👨‍🏫',
    category: 'Ayuda',
    difficulty: 'Difícil',
    points: 100,
    earned: false,
    progress: 3,
    maxProgress: 10,
    rarity: 'rare',
    reward: 'Badge: Mentor + Título especial'
  },
  {
    id: '5',
    title: 'Explorador de Carreras',
    description: 'Visita perfiles de 20 carreras diferentes',
    icon: '🔍',
    category: 'Exploración',
    difficulty: 'Medio',
    points: 30,
    earned: true,
    earnedAt: '2024-01-20',
    rarity: 'uncommon',
    reward: 'Badge: Explorador'
  },
  {
    id: '6',
    title: 'Leyenda Universitaria',
    description: 'Alcanza el nivel 50 y mantén una racha de 100 días',
    icon: '👑',
    category: 'Prestigio',
    difficulty: 'Legendario',
    points: 500,
    earned: false,
    progress: 12,
    maxProgress: 50,
    rarity: 'legendary',
    reward: 'Badge: Leyenda + Título dorado + Beneficios premium'
  }
]

// Mock badges data
const mockBadges = [
  {
    id: '1',
    title: 'Creador Novato',
    description: 'Tu primer paso en la creación de contenido',
    icon: '🎨',
    rarity: 'common',
    category: 'Contenido',
    earned: true,
    earnedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Estudiante Verificado',
    description: 'Perfil académico completo y verificado',
    icon: '✅',
    rarity: 'common',
    category: 'Perfil',
    earned: true,
    earnedAt: '2024-01-10'
  },
  {
    id: '3',
    title: 'Explorador',
    description: 'Descubriste múltiples carreras y oportunidades',
    icon: '🧭',
    rarity: 'uncommon',
    category: 'Exploración',
    earned: true,
    earnedAt: '2024-01-20'
  },
  {
    id: '4',
    title: 'Conector',
    description: 'Maestro del networking universitario',
    icon: '🔗',
    rarity: 'uncommon',
    category: 'Social',
    earned: false
  },
  {
    id: '5',
    title: 'Mentor',
    description: 'Guía y ayuda a otros estudiantes',
    icon: '🎯',
    rarity: 'rare',
    category: 'Ayuda',
    earned: false
  },
  {
    id: '6',
    title: 'Leyenda',
    description: 'El más alto honor en la plataforma',
    icon: '👑',
    rarity: 'legendary',
    category: 'Prestigio',
    earned: false
  }
]

export default function AchievementsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('achievements')

  // Filter achievements
  const filteredAchievements = mockAchievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || achievement.category === filterCategory
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'earned' && achievement.earned) ||
                         (filterStatus === 'unearned' && !achievement.earned)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Filter badges
  const filteredBadges = mockBadges.filter(badge => {
    const matchesSearch = badge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || badge.category === filterCategory
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'earned' && badge.earned) ||
                         (filterStatus === 'unearned' && !badge.earned)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = ['all', 'Contenido', 'Perfil', 'Social', 'Ayuda', 'Exploración', 'Prestigio']
  const earnedAchievements = mockAchievements.filter(a => a.earned).length
  const earnedBadges = mockBadges.filter(b => b.earned).length
  const totalPoints = mockAchievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Mis Logros
            </h1>
            <p className="text-gray-600 mt-1">
              Descubre todos tus logros y progreso en la plataforma
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{earnedAchievements}</div>
              <div className="text-sm text-gray-600">Logros Obtenidos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{earnedBadges}</div>
              <div className="text-sm text-gray-600">Insignias Ganadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalPoints}</div>
              <div className="text-sm text-gray-600">Puntos Totales</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{Math.round((earnedAchievements / mockAchievements.length) * 100)}%</div>
              <div className="text-sm text-gray-600">Completado</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar logros o insignias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Todas las categorías' : category}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-white"
                >
                  <option value="all">Todos</option>
                  <option value="earned">Obtenidos</option>
                  <option value="unearned">Pendientes</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="achievements">Logros ({mockAchievements.length})</TabsTrigger>
            <TabsTrigger value="badges">Insignias ({mockBadges.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  showProgress={true}
                />
              ))}
            </div>
            {filteredAchievements.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron logros</h3>
                <p className="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="mt-6">
            <BadgeCollection 
              badges={filteredBadges}
              totalBadges={mockBadges.length}
              className=""
            />
            {filteredBadges.length === 0 && (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron insignias</h3>
                <p className="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}