'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Settings, Trophy, BarChart3, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { SocialProfile } from '@/components/perfil/SocialProfile'
import AchievementCard from '@/components/perfil/AchievementCard'
import StatsChart from '@/components/perfil/StatsChart'
import SettingsPanel from '@/components/perfil/SettingsPanel'
import ProfileEditor from '@/components/perfil/ProfileEditor'
import { ProfileFeed } from '@/components/perfil/ProfileFeed'

const mockUser = {
  id: '1',
  name: 'María Fernanda Quispe',
  username: 'mariafquispe',
  email: 'maria.quispe@une.edu.pe',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  banner: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=200&fit=crop',
  bio: 'Estudiante de Matemática e Informática en La Cantuta, apasionada por la programación educativa y el desarrollo de aplicaciones. Orgullosa de ser parte de la comunidad cantutana.',
  location: 'Chosica, Lima, Perú',
  university: 'Universidad Nacional de Educación Enrique Guzmán y Valle (La Cantuta)',
  faculty: 'Facultad de Ciencias',
  major: 'Matemática e Informática',
  joinDate: '2023-03-15',
  level: 12,
  xp: 2450,
  maxXp: 3000,
  followers: 156,
  following: 89,
  posts: 23,
  interests: ['Programación Educativa', 'Python', 'Matemáticas', 'Desarrollo Web', 'Tecnología Educativa'],
  socialLinks: {
    twitter: 'https://twitter.com/mariafquispe',
    linkedin: 'https://linkedin.com/in/mariafquispe',
    github: 'https://github.com/mariafquispe'
  }
}

const mockAchievements = [
  {
    id: '1',
    title: 'Bienvenido a La Cantuta',
    description: 'Completaste tu registro en la Universidad Nacional de Educación',
    icon: 'Trophy',
    category: 'milestone' as const,
    difficulty: 'easy' as const,
    points: 50,
    earned: true,
    earnedDate: '2024-01-15',
    claimed: false,
    claimable: true,
    reward: { xp: 50, crolars: 10 }
  },
  {
    id: '2',
    title: 'Futuro Educador',
    description: 'Completaste 10 módulos de formación pedagógica',
    icon: 'Star',
    category: 'learning' as const,
    difficulty: 'medium' as const,
    points: 100,
    earned: true,
    earnedDate: '2024-01-20',
    claimed: true,
    claimable: true,
    reward: { xp: 100, crolars: 25 }
  },
  {
    id: '3',
    title: 'Maestro de la Tecnología',
    description: 'Domina 50 conceptos de programación educativa',
    icon: 'Award',
    category: 'challenge' as const,
    difficulty: 'hard' as const,
    points: 500,
    earned: false,
    progress: 23,
    maxProgress: 50,
    claimed: false,
    claimable: false,
    reward: { xp: 500, crolars: 100 }
  },
  {
    id: '4',
    title: 'Compañero Solidario',
    description: 'Ayuda a 5 estudiantes cantutinos en el foro académico',
    icon: 'Award',
    category: 'social' as const,
    difficulty: 'medium' as const,
    points: 150,
    earned: true,
    earnedDate: '2024-01-25',
    claimed: false,
    claimable: true,
    reward: { xp: 150, crolars: 30 }
  },
  {
    id: '5',
    title: 'Disciplina Cantutina',
    description: 'Mantén una racha de estudio de 7 días consecutivos',
    icon: 'Trophy',
    category: 'streak' as const,
    difficulty: 'easy' as const,
    points: 75,
    earned: true,
    earnedDate: '2024-01-22',
    claimed: true,
    claimable: true,
    reward: { xp: 75, crolars: 15 }
  },
  {
    id: '6',
    title: 'Especialista en Ciencias',
    description: 'Completa tu primer curso de la Facultad de Ciencias',
    icon: 'Star',
    category: 'learning' as const,
    difficulty: 'medium' as const,
    points: 200,
    earned: false,
    progress: 8,
    maxProgress: 10,
    claimed: false,
    claimable: false,
    reward: { xp: 200, crolars: 50 }
  },
  {
    id: '7',
    title: 'Orgullo Chosicano',
    description: 'Participa en 3 actividades culturales de La Cantuta',
    icon: 'Heart',
    category: 'social' as const,
    difficulty: 'medium' as const,
    points: 120,
    earned: true,
    earnedDate: '2024-02-01',
    claimed: false,
    claimable: true,
    reward: { xp: 120, crolars: 25 }
  },
  {
    id: '8',
    title: 'Innovador Tecnológico',
    description: 'Desarrolla un proyecto para la Facultad de Tecnología',
    icon: 'Award',
    category: 'challenge' as const,
    difficulty: 'hard' as const,
    points: 300,
    earned: false,
    progress: 2,
    maxProgress: 5,
    claimed: false,
    claimable: false,
    reward: { xp: 300, crolars: 75 }
  },
  {
    id: '9',
    title: 'Mentor Pedagógico',
    description: 'Completa tu práctica pre-profesional con excelencia',
    icon: 'GraduationCap',
    category: 'milestone' as const,
    difficulty: 'hard' as const,
    points: 400,
    earned: false,
    progress: 0,
    maxProgress: 1,
    claimed: false,
    claimable: false,
    reward: { xp: 400, crolars: 100 }
  }
]

const mockStats = {
  coursesCompleted: 23,
  challengesCompleted: 45,
  totalXP: 2450,
  streakDays: 12,
  forumPosts: 8,
  notesCreated: 156
}

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState('perfil')
  const [isEditing, setIsEditing] = useState(false)
  const [claimedAchievements, setClaimedAchievements] = useState<Set<string>>(new Set())

  const handleClaimAchievement = (achievementId: string) => {
    setClaimedAchievements(prev => new Set([...prev, achievementId]))
    toast.success('¡Logro reclamado exitosamente!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="logros">Logros</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          </TabsList>
          
          <TabsContent value="perfil" className="space-y-6">
            <SocialProfile user={mockUser} isOwnProfile={true} />
            <ProfileFeed 
              posts={[]} // TODO: Cargar posts reales del usuario
              isOwnProfile={true}
              username="usuario_actual" // TODO: Obtener del contexto de autenticación
            />
          </TabsContent>
          
          <TabsContent value="logros" className="space-y-8">
            {/* Header de la sección de logros */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  Mis Logros
                </h2>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Descubre todos los logros que has desbloqueado en tu camino de aprendizaje y los desafíos que aún te esperan.
              </p>
              
              {/* Estadísticas rápidas */}
              <div className="flex items-center justify-center gap-8 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {mockAchievements.filter(a => a.earned).length}
                  </div>
                  <div className="text-sm text-gray-500">Desbloqueados</div>
                </div>
                <div className="w-px h-8 bg-gray-300" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {mockAchievements.length - mockAchievements.filter(a => a.earned).length}
                  </div>
                  <div className="text-sm text-gray-500">Por desbloquear</div>
                </div>
                <div className="w-px h-8 bg-gray-300" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {mockAchievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Puntos totales</div>
                </div>
              </div>
            </div>
            
            {/* Grid de logros mejorado */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockAchievements.map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={{
                    ...achievement,
                    claimed: claimedAchievements.has(achievement.id) || achievement.claimed
                  }} 
                  showDetails={true}
                  onClaim={handleClaimAchievement}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="estadisticas" className="mt-6">
            <StatsChart />
          </TabsContent>
          
          <TabsContent value="configuracion" className="mt-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}