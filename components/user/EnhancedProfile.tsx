'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  MapPin,
  Calendar,
  GraduationCap,
  Globe,
  Users,
  FileText,
  Heart,
  MessageCircle,
  Share2,
  Settings,
  UserPlus,
  UserMinus,
  Mail,
  Shield,
  Camera,
  Edit3
} from 'lucide-react';
import { ProfileEditor } from './ProfileEditor';
import { FollowersModal } from './FollowersModal';

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
  createdAt: string;
  isVerified: boolean;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  isFollowing?: boolean;
  profileCompletion?: number;
  stats?: {
    followers: number;
    following: number;
    posts: number;
  };
  posts?: any[];
  canMessage?: boolean;
  lastActive?: string;
}

interface EnhancedProfileProps {
  username?: string;
  isOwnProfile?: boolean;
}

export function EnhancedProfile({ username, isOwnProfile = false }: EnhancedProfileProps) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [followersType, setFollowersType] = useState<'followers' | 'following'>('followers');
  const [activeTab, setActiveTab] = useState('posts');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isOwnProfile || !username
        ? '/api/users/profile'
        : `/api/users/${username}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();

      if (response.ok) {
        setProfile(data);
        setIsFollowing(data.isFollowing || false);
      } else {
        toast.error(data.error || 'Error al cargar el perfil');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, [isOwnProfile, username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, session]);

  const handleFollow = async () => {
    if (!profile) return;

    try {
      const response = await fetch('/api/users/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: profile.id })
      });

      const data = await response.json();

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setProfile(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            followers: isFollowing ? (prev.stats?.followers || 0) - 1 : (prev.stats?.followers || 0) + 1
          }
        } : null);
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Error al seguir usuario');
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Error al seguir usuario');
    }
  };

  const handleMessage = () => {
    if (profile?.canMessage) {
      // Navigate to messages with this user
      window.location.href = `/messages?user=${profile.username}`;
    } else {
      toast.error('Este usuario no permite mensajes privados');
    }
  };

  const handleProfileUpdate = (updatedData: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updatedData } : null);
    setShowEditor(false);
    toast.success('Perfil actualizado exitosamente');
  };

  const showFollowersModal = (type: 'followers' | 'following') => {
    setFollowersType(type);
    setShowFollowers(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-40 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Usuario no encontrado</h2>
        <p className="text-gray-600">El perfil que buscas no existe o no tienes permisos para verlo.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {isOwnProfile && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-4 right-4"
              onClick={() => setShowEditor(true)}
            >
              <Camera className="w-4 h-4 mr-2" />
              Cambiar portada
            </Button>
          )}
        </div>
        
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile.image} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {profile.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                  onClick={() => setShowEditor(true)}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                {profile.isVerified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-gray-700 max-w-2xl">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
                {profile.university && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {profile.university}
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Se unió en {new Date(profile.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </div>
              </div>

              {/* Profile Completion (only for own profile) */}
              {isOwnProfile && profile.profileCompletion !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completitud del perfil</span>
                    <span className="font-medium">{profile.profileCompletion}%</span>
                  </div>
                  <Progress value={profile.profileCompletion} className="h-2" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <Button onClick={() => setShowEditor(true)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar perfil
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/settings'}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"}>
                    {isFollowing ? (
                      <><UserMinus className="w-4 h-4 mr-2" />Dejar de seguir</>
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-2" />Seguir</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleMessage}>
                    <Mail className="w-4 h-4 mr-2" />
                    Mensaje
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6 pt-6 border-t">
            <button 
              onClick={() => showFollowersModal('following')}
              className="text-center hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <div className="font-bold text-lg">{profile.stats?.following || 0}</div>
              <div className="text-gray-600 text-sm">Siguiendo</div>
            </button>
            <button 
              onClick={() => showFollowersModal('followers')}
              className="text-center hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <div className="font-bold text-lg">{profile.stats?.followers || 0}</div>
              <div className="text-gray-600 text-sm">Seguidores</div>
            </button>
            <div className="text-center">
              <div className="font-bold text-lg">{profile.stats?.posts || 0}</div>
              <div className="text-gray-600 text-sm">Publicaciones</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Publicaciones</TabsTrigger>
          <TabsTrigger value="media">Multimedia</TabsTrigger>
          <TabsTrigger value="likes">Me gusta</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {profile.posts && profile.posts.length > 0 ? (
            <div className="space-y-4">
              {profile.posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <p className="text-gray-900 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likesCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.commentsCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {post.sharesCount}
                      </div>
                      <div className="ml-auto">
                        {new Date(post.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isOwnProfile ? 'No has publicado nada aún' : 'No hay publicaciones'}
              </h3>
              <p className="text-gray-600">
                {isOwnProfile 
                  ? 'Comparte tu primera publicación para comenzar' 
                  : 'Este usuario no ha compartido publicaciones públicas'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="media">
          <div className="text-center py-12">
            <p className="text-gray-600">Contenido multimedia próximamente</p>
          </div>
        </TabsContent>

        <TabsContent value="likes">
          <div className="text-center py-12">
            <p className="text-gray-600">Me gusta próximamente</p>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="text-center py-12">
            <p className="text-gray-600">Actividad próximamente</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showEditor && (
        <ProfileEditor
          user={profile}
          onSave={handleProfileUpdate}
          onClose={() => setShowEditor(false)}
        />
      )}

      {showFollowers && (
        <FollowersModal
          userId={profile.id}
          type={followersType}
          isOpen={showFollowers}
          onClose={() => setShowFollowers(false)}
        />
      )}
    </div>
  );
}