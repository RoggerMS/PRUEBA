'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileFeed } from '@/components/profile/ProfileFeed'
import ProfileEditor from '@/components/profile/ProfileEditor'
import AchievementCard from '@/components/profile/AchievementCard'
import BadgeCollection from '@/components/gamification/BadgeCollection'
import { Trophy, Users, FileText, BarChart3, Award, Heart, Target } from 'lucide-react'

interface UserProfile {
  name: string
  username: string
  avatar: string
  banner?: string
  bio?: string
  location?: string
  university?: string
  major?: string
  joinDate: string
  level: number
  xp: number
  maxXp: number
  interests: string[]
  followers: number
  following: number
  posts: number
}

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
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claimedAchievements, setClaimedAchievements] = useState<Set<string>>(new Set())
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

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
        const profile: UserProfile = {
          name: userData.name || '',
          username: userData.username || '',
          avatar: userData.image || mockUser.avatar,
          banner: userData.banner || mockUser.banner,
          bio: userData.bio || '',
          location: userData.location || '',
          university: userData.university || '',
          major: userData.career || '',
          joinDate: userData.createdAt
            ? new Date(userData.createdAt).toISOString().split('T')[0]
            : '',
          level: userData.level ?? 0,
          xp: userData.xp ?? 0,
          maxXp: userData.maxXp ?? mockUser.maxXp,
          interests: userData.interests ?? [],
          followers: userData.followers ?? 0,
          following: userData.following ?? 0,
          posts: userData.stats?.posts ?? 0
        }
        setUser(profile)
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setError('Error al cargar el perfil')
        // Fallback to mock data
        setUser(mockUser as UserProfile)
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

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleSaveProfile = async (updatedProfile: any) => {
    try {
      // Here you would typically call an API to save the profile
      // For now, we'll just update the local state
      setUser(prev => prev ? {
        ...prev,
        name: updatedProfile.name,
        bio: updatedProfile.bio,
        location: updatedProfile.location,
        major: updatedProfile.major,
        interests: updatedProfile.interests
      } : null)
      setIsEditing(false)
      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      toast.error('Error al actualizar el perfil')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <ProfileHeader
            user={user}
            mode={isEditing ? 'edit' : 'view'}
            onEdit={handleEditProfile}
            onBannerChange={(banner) => setUser(prev => prev ? { ...prev, banner } : prev)}
            onAvatarChange={(avatar) => setUser(prev => prev ? { ...prev, avatar } : prev)}
          />

          {/* Inline Profile Editor */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Editar Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileEditor
                  profile={user}
                  onSave={handleSaveProfile}
                  onCancel={handleCancelEdit}
                />
              </CardContent>
            </Card>
          )}

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Logros
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Estadísticas
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab Content */}
            <TabsContent value="profile" className="space-y-6">
              {/* User Interests */}
              {user?.interests && user.interests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pink-500" />
                      Intereses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-700">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Profile Feed */}
              <ProfileFeed
                isOwnProfile={session?.user?.id === user?.id}
                username={user.username}
              />
            </TabsContent>

            {/* Achievements Tab Content */}
            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Logros
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => router.push('/perfil/logros')}>
                    Ver más
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockAchievements.slice(0, 6).map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        onClaim={handleClaimAchievement}
                        isClaimed={claimedAchievements.has(achievement.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Badges Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-500" />
                    Insignias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BadgeCollection />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab Content */}
            <TabsContent value="statistics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Seguidores</p>
                        <p className="text-2xl font-bold text-blue-600">{user?.followers || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Siguiendo</p>
                        <p className="text-2xl font-bold text-green-600">{user?.following || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Publicaciones</p>
                        <p className="text-2xl font-bold text-purple-600">{user?.posts || 0}</p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Nivel</p>
                        <p className="text-2xl font-bold text-indigo-600">{user?.level || 1}</p>
                      </div>
                      <Target className="h-8 w-8 text-indigo-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">XP Total</p>
                        <p className="text-2xl font-bold text-orange-600">{user?.xp || 0}</p>
                      </div>
                      <Award className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}