 'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import ProfileEditor from '@/components/personal/ProfileEditor'
import AchievementCard from '@/components/personal/AchievementCard'
import StatsChart from '@/components/personal/StatsChart'
import SettingsPanel from '@/components/personal/SettingsPanel'
import { 
  User, 
  Trophy, 
  Star, 
  Calendar, 
  BookOpen, 
  Target, 
  Award, 
  Settings, 
  Edit3,
  Camera,
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  Flame,
  Zap,
  Crown
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
  progress?: number
  maxProgress?: number
}

interface UserStats {
  totalXP: number
  level: number
  streak: number
  coursesCompleted: number
  challengesWon: number
  forumAnswers: number
  notesUploaded: number
  crolarsEarned: number
}

const mockUser = {
  id: '1',
  name: 'Ana García',
  email: 'ana.garcia@estudiante.com',
  avatar: '/avatars/ana.jpg',
  bio: 'Estudiante de Ingeniería en Sistemas apasionada por la tecnología y el aprendizaje continuo.',
  location: 'Madrid, España',
  joinDate: '2024-01-15',
  university: 'Universidad Politécnica de Madrid',
  major: 'Ingeniería en Sistemas'
}

const mockStats: UserStats = {
  totalXP: 15420,
  level: 12,
  streak: 28,
  coursesCompleted: 8,
  challengesWon: 15,
  forumAnswers: 42,
  notesUploaded: 156,
  crolarsEarned: 2840
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Primer Paso',
    description: 'Completa tu primer curso',
    icon: '🎯',
    earned: true,
    earnedDate: '2024-01-20'
  },
  {
    id: '2',
    title: 'Racha de Fuego',
    description: 'Mantén una racha de 30 días',
    icon: '🔥',
    earned: false,
    progress: 28,
    maxProgress: 30
  },
  {
    id: '3',
    title: 'Maestro del Foro',
    description: 'Responde 50 preguntas en el foro',
    icon: '🧠',
    earned: false,
    progress: 42,
    maxProgress: 50
  },
  {
    id: '4',
    title: 'Coleccionista',
    description: 'Sube 100 notas',
    icon: '📚',
    earned: true,
    earnedDate: '2024-02-15'
  },
  {
    id: '5',
    title: 'Campeón',
    description: 'Gana 10 desafíos',
    icon: '👑',
    earned: true,
    earnedDate: '2024-03-01'
  },
  {
    id: '6',
    title: 'Millonario',
    description: 'Acumula 5000 Crolars',
    icon: '💰',
    earned: false,
    progress: 2840,
    maxProgress: 5000
  }
]

export default function PersonalSpacePage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)

  const getXPForNextLevel = (level: number) => {
    return level * 1000 + 500
  }

  const getCurrentLevelXP = (totalXP: number, level: number) => {
    const previousLevelsXP = Array.from({ length: level - 1 }, (_, i) => getXPForNextLevel(i + 1))
      .reduce((sum, xp) => sum + xp, 0)
    return totalXP - previousLevelsXP
  }

  const nextLevelXP = getXPForNextLevel(mockStats.level)
  const currentLevelXP = getCurrentLevelXP(mockStats.totalXP, mockStats.level)
  const progressToNextLevel = (currentLevelXP / nextLevelXP) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Mi Espacio Personal
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Gestiona tu perfil, revisa tus logros y personaliza tu experiencia de aprendizaje
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 mx-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Logros
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileEditor 
              profile={{
                id: '1',
                name: mockUser.name,
                email: mockUser.email,
                avatar: mockUser.avatar,
                bio: mockUser.bio,
                location: mockUser.location,
                university: mockUser.university,
                major: mockUser.major,
                interests: ['Programación', 'Inteligencia Artificial', 'Desarrollo Web', 'Machine Learning'],
                socialLinks: {
                  linkedin: 'https://linkedin.com/in/ana-garcia',
                  github: 'https://github.com/ana-garcia',
                  twitter: 'https://twitter.com/ana_garcia'
                }
              }}
              onSave={(profile) => {
                console.log('Perfil guardado:', profile)
                // Aquí se implementaría la lógica para guardar el perfil
              }}
              onCancel={() => {
                console.log('Edición cancelada')
                // Aquí se implementaría la lógica para cancelar la edición
              }}
            />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={{
                    id: achievement.id,
                    title: achievement.title,
                    description: achievement.description,
                    icon: achievement.icon,
                    category: 'learning',
                    difficulty: 'easy',
                    points: 0,
                    earned: achievement.earned,
                    progress: achievement.progress,
                    maxProgress: achievement.maxProgress,
                    earnedDate: achievement.earnedDate,
                    requirements: [`Completa ${achievement.progress || 0}% del objetivo`],
                    reward: { xp: 0, crolars: 0 }
                  }}
                />
              ))}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center space-y-2">
                  <BookOpen className="h-8 w-8 text-blue-500 mx-auto" />
                  <div className="text-2xl font-bold">{mockStats.coursesCompleted}</div>
                  <div className="text-sm text-gray-600">Cursos Completados</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center space-y-2">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto" />
                  <div className="text-2xl font-bold">{mockStats.challengesWon}</div>
                  <div className="text-sm text-gray-600">Desafíos Ganados</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center space-y-2">
                  <Target className="h-8 w-8 text-green-500 mx-auto" />
                  <div className="text-2xl font-bold">{mockStats.forumAnswers}</div>
                  <div className="text-sm text-gray-600">Respuestas en Foro</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center space-y-2">
                  <Star className="h-8 w-8 text-purple-500 mx-auto" />
                  <div className="text-2xl font-bold">{mockStats.notesUploaded}</div>
                  <div className="text-sm text-gray-600">Notas Subidas</div>
                </CardContent>
              </Card>
            </div>

            <StatsChart />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}