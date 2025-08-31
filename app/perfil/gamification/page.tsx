'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  Bell, 
  Users, 
  Target,
  Zap,
  Crown,
  Star,
  Gift
} from 'lucide-react'

// Importar componentes de gamificación
import LevelProgress from '@/components/gamification/LevelProgress'
import BadgeCollection from '@/components/gamification/BadgeCollection'
import GamificationNotifications from '@/components/gamification/GamificationNotifications'
import Leaderboard from '@/components/gamification/Leaderboard'
import AchievementSystem from '@/components/gamification/AchievementSystem'

// Importar tipos y servicios
import { User, UserStats, Notification, Leaderboard as LeaderboardType } from '@/types/gamification'
import { calculateUserLevel, LEVELS } from '@/services/gamificationService'

// Datos mock del usuario
const mockUser: User = {
  id: 'user-1',
  name: 'Ana García',
  email: 'ana.garcia@email.com',
  avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20friendly%20smile%20modern%20style&image_size=square',
  level: 8,
  xp: 3250,
  totalXp: 3250,
  crolars: 1850,
  badges: [
    {
      id: 'badge-1',
      name: 'Primer Paso',
      description: 'Completaste tu primer desafío',
      icon: 'star',
      rarity: 'common',
      category: 'challenge',
      earnedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'badge-2',
      name: 'Estudiante Dedicado',
      description: 'Mantuviste una racha de 7 días',
      icon: 'calendar',
      rarity: 'rare',
      category: 'streak',
      earnedAt: '2024-01-20T15:30:00Z'
    },
    {
      id: 'badge-3',
      name: 'Mentor Comunitario',
      description: 'Ayudaste a 10 estudiantes',
      icon: 'users',
      rarity: 'rare',
      category: 'social',
      earnedAt: '2024-01-25T09:15:00Z'
    }
  ],
  achievements: [
    {
      id: '1',
      title: 'Primer Logro',
      description: 'Completaste tu primera actividad',
      icon: 'star',
      category: 'learning',
      difficulty: 'easy',
      points: 100,
      earned: true,
      earnedDate: '2024-01-15T10:00:00Z',
      reward: { xp: 100, crolars: 50 }
    },
    {
      id: '2',
      title: 'Estudiante Constante',
      description: 'Mantén una racha de 7 días',
      icon: 'calendar',
      category: 'streak',
      difficulty: 'medium',
      points: 200,
      earned: true,
      earnedDate: '2024-01-20T15:30:00Z',
      reward: { xp: 200, crolars: 100 }
    },
    {
      id: '6',
      title: 'Mentor Experto',
      description: 'Ayuda a 10 estudiantes',
      icon: 'users',
      category: 'social',
      difficulty: 'hard',
      points: 500,
      earned: true,
      earnedDate: '2024-01-25T09:15:00Z',
      reward: { xp: 500, crolars: 250 }
    }
  ],
  streak: {
    current: 12,
    longest: 18,
    lastActivity: '2024-01-30T18:45:00Z'
  },
  stats: {
    coursesCompleted: 8,
    challengesCompleted: 45,
    forumAnswers: 23,
    notesUploaded: 15,
    eventsAttended: 5,
    clubsJoined: 3,
    friendsCount: 28,
    totalStudyTime: 1250
  }
}

// Datos mock de notificaciones
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'GAMIFICATION',
    title: '¡Subiste de nivel!',
    message: 'Has alcanzado el nivel 8. ¡Sigue así!',
    read: false,
    createdAt: new Date('2024-01-30T16:30:00Z'),
    data: {
      newLevel: LEVELS[7],
      rewards: { crolars: 100 }
    }
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'GAMIFICATION',
    title: 'Nueva insignia desbloqueada',
    message: 'Has ganado la insignia "Mentor Comunitario"',
    read: false,
    createdAt: new Date('2024-01-30T14:15:00Z'),
    data: {
      badge: {
        id: 'badge-3',
        name: 'Mentor Comunitario',
        description: 'Ayudaste a 10 estudiantes',
        icon: 'users',
        rarity: 'rare',
        earnedAt: '2024-01-30T14:15:00Z'
      }
    }
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'GAMIFICATION',
    title: 'XP ganada',
    message: 'Completaste un desafío de matemáticas',
    read: true,
    createdAt: new Date('2024-01-30T12:00:00Z'),
    data: {
      amount: 150,
      source: 'challenge_completed'
    }
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: 'GAMIFICATION',
    title: 'Racha impresionante',
    message: 'Has mantenido una racha de 12 días consecutivos',
    read: true,
    createdAt: new Date('2024-01-29T20:00:00Z'),
    data: {
      streak: 12
    }
  }
]

// Datos mock del leaderboard
const mockLeaderboard: LeaderboardType = {
  period: 'weekly',
  category: 'xp',
  users: [
    {
      rank: 1,
      user: {
        id: 'user-2',
        name: 'Carlos Mendoza',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20male%20confident%20smile%20modern%20style&image_size=square',
        level: 12
      },
      value: 4850,
      change: 2
    },
    {
      rank: 2,
      user: {
        id: 'user-3',
        name: 'María López',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20smart%20glasses%20modern%20style&image_size=square',
        level: 10
      },
      value: 4200,
      change: -1
    },
    {
      rank: 3,
      user: {
        id: mockUser.id,
        name: mockUser.name,
        avatar: mockUser.avatar,
        level: mockUser.level
      },
      value: 3250,
      change: 1
    },
    {
      rank: 4,
      user: {
        id: 'user-4',
        name: 'Diego Ruiz',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20male%20friendly%20modern%20style&image_size=square',
        level: 7
      },
      value: 2980,
      change: 0
    },
    {
      rank: 5,
      user: {
        id: 'user-5',
        name: 'Sofia Herrera',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20creative%20modern%20style&image_size=square',
        level: 6
      },
      value: 2650,
      change: 3
    }
  ]
}

export default function PerfilGamificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState('overview')

  // Calcular estadísticas del usuario
  const userLevel = calculateUserLevel(mockUser.xp)
  const nextLevel = LEVELS[userLevel.level] || null
  const progressToNext = nextLevel 
    ? ((mockUser.xp - userLevel.minXp) / (nextLevel.minXp - userLevel.minXp)) * 100
    : 100

  // Handlers para notificaciones
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const handleDismissNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Gamificación del Perfil
          </h1>
          <p className="text-gray-600 mt-2">
            Sigue tu progreso, desbloquea logros y compite con otros estudiantes
          </p>
        </div>

        {/* Indicador de notificaciones */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('notifications')}
            className="relative"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[1.25rem] h-5">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">Nivel {mockUser.level}</div>
            <div className="text-sm text-gray-600">Nivel actual</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{mockUser.xp.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Experiencia total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{mockUser.badges?.length || 0}</div>
            <div className="text-sm text-gray-600">Insignias ganadas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{mockUser.streak?.current || 0}</div>
            <div className="text-sm text-gray-600">Racha actual</div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal con tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Logros
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Insignias
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-1 ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progreso de nivel */}
            <LevelProgress 
              currentXp={mockUser.xp}
              totalXp={mockUser.xp}
              level={mockUser.level}
              crolars={mockUser.crolars}
              className="h-fit"
            />

            {/* Estadísticas rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Estadísticas Destacadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{mockUser.stats?.challengesCompleted || 0}</div>
                    <div className="text-sm text-blue-800">Desafíos completados</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{mockUser.stats?.coursesCompleted || 0}</div>
                    <div className="text-sm text-green-800">Cursos terminados</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{mockUser.stats?.forumAnswers || 0}</div>
                    <div className="text-sm text-purple-800">Respuestas en foro</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">{mockUser.streak?.longest || 0}</div>
                    <div className="text-sm text-orange-800">Racha más larga</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notificaciones recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-500" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {notification.type === 'GAMIFICATION' && <TrendingUp className="h-5 w-5 text-green-500" />}
                      {notification.type === 'SOCIAL' && <Award className="h-5 w-5 text-purple-500" />}
                      {notification.type === 'SYSTEM' && <Zap className="h-5 w-5 text-blue-500" />}
                      {notification.type === 'GAMIFICATION' && <Target className="h-5 w-5 text-orange-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{notification.title}</div>
                      <div className="text-xs text-gray-600">{notification.message}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setActiveTab('notifications')}
              >
                Ver todas las notificaciones
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Logros */}
        <TabsContent value="achievements">
          <AchievementSystem 
            achievements={[]} // Se usarán los datos mock del componente
            userAchievements={mockUser.achievements?.map(a => a.id) || []}
          />
        </TabsContent>

        {/* Tab: Insignias */}
        <TabsContent value="badges">
          <BadgeCollection
            badges={mockUser.badges || []}
          />
        </TabsContent>

        {/* Tab: Ranking */}
        <TabsContent value="leaderboard">
          <Leaderboard 
            leaderboard={mockLeaderboard}
            currentUserId={mockUser.id}
          />
        </TabsContent>

        {/* Tab: Notificaciones */}
        <TabsContent value="notifications">
          <GamificationNotifications 
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDismiss={handleDismissNotification}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}