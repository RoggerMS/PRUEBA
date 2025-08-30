'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ProfileHeader } from '@/components/perfil/ProfileHeader'
import { ProfileFeed } from '@/components/perfil/ProfileFeed'
import AchievementCard from '@/components/perfil/AchievementCard'
import { Trophy, Users, FileText, BarChart3, Award, Heart } from 'lucide-react'

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
  const { data: session } = useSession()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [claimedAchievements, setClaimedAchievements] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!session?.user?.id) {
          // Use mock data for development
          setUser(mockUser)
          setLoading(false)
          return
        }

        const response = await fetch('/api/user/profile')
        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }
        const { user: userData } = await response.json()
        setUser(userData)
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setError('Error al cargar el perfil')
        // Fallback to mock data
        setUser(mockUser)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [session])

  const handleClaimAchievement = (achievementId: string) => {
    setClaimedAchievements(prev => new Set([...prev, achievementId]))
    toast.success('¡Logro reclamado exitosamente!')
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Error al cargar el perfil'}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <ProfileHeader 
          user={{
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            banner: user.banner,
            bio: user.bio,
            location: user.location,
            university: user.university,
            major: user.major,
            joinDate: user.joinDate,
            level: user.level,
            xp: user.xp,
            maxXp: user.maxXp,
            interests: user.interests,
            followers: user.followers,
            following: user.following,
            posts: user.posts
          }}
          mode="view"
        />

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Intereses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Posts</span>
                  </div>
                  <span className="font-semibold">{mockStats.forumPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Desafíos</span>
                  </div>
                  <span className="font-semibold">{mockStats.challengesCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Racha</span>
                  </div>
                  <span className="font-semibold">{mockStats.streakDays} días</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Feed and Achievements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Feed */}
            <ProfileFeed
              isOwnProfile={true}
              username={user.username}
            />

            {/* Recent Achievements */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Logros Recientes</CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push('/achievements')}>
                  Ver todos
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAchievements
                    .filter(achievement => achievement.earned)
                    .slice(0, 4)
                    .map((achievement) => (
                      <AchievementCard 
                        key={achievement.id} 
                        achievement={{
                          ...achievement,
                          claimed: claimedAchievements.has(achievement.id) || achievement.claimed
                        }} 
                        showDetails={false}
                        onClaim={handleClaimAchievement}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}