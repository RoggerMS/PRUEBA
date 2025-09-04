'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Globe, 
  MessageCircle, 
  UserPlus, 
  Share2, 
  Settings,
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  Crown,
  TrendingUp,
  Users,
  Heart,
  BookOpen,
  Camera,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GamificationStats } from '@/components/gamification/GamificationStats';
import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import { AchievementsGallery } from '@/components/profile/AchievementsGallery';
import { ProfileFeed } from '@/components/profile/ProfileFeed';
import { ProfileEditor } from '@/components/user/ProfileEditor';
import { toast } from 'sonner';

interface ProfileViewProps {
  username: string;
  isOwnProfile: boolean;
  mode: 'public' | 'edit';
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  image?: string;
  bio?: string;
  location?: string;
  university?: string;
  major?: string;
  website?: string;
  joinDate: string;
  isVerified?: boolean;
  followers: number;
  following: number;
  posts: number;
  isFollowing?: boolean;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
}

interface GamificationData {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  crolars: number;
  streak: number;
  maxStreak: number;
  totalBadges: number;
  earnedBadges: number;
  legendaryBadges: number;
  epicBadges: number;
  rareBadges: number;
  commonBadges: number;
  totalActivities: number;
  lastActivity: string | null;
  joinedAt: string;
  rank?: number;
  totalUsers?: number;
}

export function ProfileView({ username, isOwnProfile, mode }: ProfileViewProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [showFollowersModal, setShowFollowersModal] = useState(false);

  // Fetch user profile data
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const response = await fetch(`/api/users/${username}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json() as UserProfile;
    },
  });

  // Fetch gamification data
  const { data: gamificationData, isLoading: gamificationLoading } = useQuery({
    queryKey: ['gamification', 'stats', username],
    queryFn: async () => {
      if (!userProfile?.id) return null;
      const response = await fetch(`/api/gamification/user/${userProfile.id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch gamification data');
      return response.json();
    },
    enabled: !!userProfile?.id
  });

  // Fetch user badges
  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['badges', username],
    queryFn: async () => {
      const response = await fetch(`/api/gamification/badges/${username}`);
      if (!response.ok) throw new Error('Failed to fetch badges');
      return response.json();
    },
    enabled: !!userProfile,
  });

  const handleFollow = async () => {
    if (!session || !userProfile) return;
    
    try {
      const response = await fetch(`/api/users/${userProfile.id}/follow`, {
        method: userProfile.isFollowing ? 'DELETE' : 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to update follow status');
      
      // Refetch profile data
      // queryClient.invalidateQueries(['profile', username]);
      toast.success(userProfile.isFollowing ? 'Dejaste de seguir' : 'Ahora sigues a este usuario');
    } catch (error) {
      toast.error('Error al actualizar el seguimiento');
    }
  };

  const handleMessage = () => {
    if (!userProfile) return;
    // Navigate to messages with this user
    window.location.href = `/messages?user=${userProfile.username}`;
  };

  const handleShare = async () => {
    if (!userProfile) return;
    
    try {
      await navigator.share({
        title: `Perfil de ${userProfile.name}`,
        text: `Mira el perfil de ${userProfile.name} en nuestra plataforma`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  if (profileLoading) {
    return <ProfileSkeleton />;
  }

  if (profileError || !userProfile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Usuario no encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              El usuario que buscas no existe o ha sido eliminado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Profile Header with Gradient Background */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <CardContent className="relative -mt-16 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarImage src={userProfile.image} alt={userProfile.name} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {userProfile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-white dark:bg-gray-800"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {userProfile.name}
                </h1>
                {userProfile.isVerified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Star className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-2">@{userProfile.username}</p>
              
              {userProfile.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
                  {userProfile.bio}
                </p>
              )}

              {/* User Details */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                {userProfile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {userProfile.location}
                  </div>
                )}
                {userProfile.university && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {userProfile.university}
                  </div>
                )}
                {userProfile.website && (
                  <a 
                    href={userProfile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Sitio web
                  </a>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Se unió en {new Date(userProfile.joinDate).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
                <button 
                  onClick={() => setShowFollowersModal(true)}
                  className="text-center hover:text-blue-500 transition-colors"
                >
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {userProfile.followers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Seguidores</div>
                </button>
                <button className="text-center hover:text-blue-500 transition-colors">
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {userProfile.following.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Siguiendo</div>
                </button>
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {userProfile.posts.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isOwnProfile ? (
                <Button 
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? 'Ver perfil' : 'Editar perfil'}
                </Button>
              ) : (
                <>
                  <Button onClick={handleFollow} className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    {userProfile.isFollowing ? 'Siguiendo' : 'Seguir'}
                  </Button>
                  <Button onClick={handleMessage} variant="outline" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Mensaje
                  </Button>
                </>
              )}
              <Button onClick={handleShare} variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gamification Stats */}
      {gamificationData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Estadísticas de Gamificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GamificationStats stats={gamificationData} showDetailed={false} />
          </CardContent>
        </Card>
      )}

      {/* Profile Content Tabs */}
      {isEditing ? (
        <ProfileEditor 
          user={userProfile} 
          onSave={(updatedProfile) => {
            // Handle profile update
            setIsEditing(false);
            toast.success('Perfil actualizado correctamente');
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Logros
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Información
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            <ProfileFeed username={username} isOwnProfile={isOwnProfile} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
              <AchievementsGallery 
                userId={userProfile.id}
                isOwnProfile={isOwnProfile}
              />
            </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {gamificationData ? (
              <GamificationStats stats={gamificationData} showDetailed={true} />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Estadísticas no disponibles
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Las estadísticas de gamificación aparecerán aquí cuando estén disponibles.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfile.major && (
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Carrera</p>
                        <p className="text-gray-600 dark:text-gray-400">{userProfile.major}</p>
                      </div>
                    </div>
                  )}
                  {userProfile.university && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Universidad</p>
                        <p className="text-gray-600 dark:text-gray-400">{userProfile.university}</p>
                      </div>
                    </div>
                  )}
                  {userProfile.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Ubicación</p>
                        <p className="text-gray-600 dark:text-gray-400">{userProfile.location}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Miembro desde</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(userProfile.joinDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              {userProfile.socialLinks && Object.keys(userProfile.socialLinks).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Redes Sociales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userProfile.socialLinks.twitter && (
                      <a 
                        href={userProfile.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">T</span>
                        </div>
                        <div>
                          <p className="font-medium">Twitter</p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">@{userProfile.socialLinks.twitter.split('/').pop()}</p>
                        </div>
                      </a>
                    )}
                    {userProfile.socialLinks.linkedin && (
                      <a 
                        href={userProfile.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">in</span>
                        </div>
                        <div>
                          <p className="font-medium">LinkedIn</p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Ver perfil</p>
                        </div>
                      </a>
                    )}
                    {userProfile.socialLinks.github && (
                      <a 
                        href={userProfile.socialLinks.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">GH</span>
                        </div>
                        <div>
                          <p className="font-medium">GitHub</p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">@{userProfile.socialLinks.github.split('/').pop()}</p>
                        </div>
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Loading skeleton component
function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card className="overflow-hidden">
        <Skeleton className="h-32 w-full" />
        <CardContent className="relative -mt-16 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full max-w-2xl" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileView;
