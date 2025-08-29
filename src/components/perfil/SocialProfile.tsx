import React, { useState } from 'react';
import { Camera, Edit3, MapPin, Calendar, GraduationCap, Users, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Composer } from '@/components/feed/Composer';
import { useSession } from 'next-auth/react';
import ProfileEditor from './ProfileEditor';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  banner?: string;
  bio: string;
  location: string;
  university: string;
  faculty?: string;
  major: string;
  joinDate: string;
  level: number;
  xp: number;
  maxXp: number;
  interests: string[];
  followers: number;
  following: number;
  posts: number;
}

interface SocialProfileProps {
  user: User;
  isOwnProfile?: boolean;
}

export function SocialProfile({ user, isOwnProfile = false }: SocialProfileProps) {
  const { data: session } = useSession();
  const [showEditor, setShowEditor] = useState(false);
  const [bannerImage, setBannerImage] = useState(user.banner || '');
  const [profileImage, setProfileImage] = useState(user.avatar);

  const handleBannerEdit = () => {
    // Simular selección de imagen para banner
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setBannerImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleProfileEdit = () => {
    // Simular selección de imagen para perfil
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (showEditor) {
    const profileData = {
      id: user.id,
      name: user.name,
      email: 'user@example.com', // TODO: Obtener del usuario real
      avatar: profileImage,
      banner: bannerImage,
      bio: user.bio,
      location: user.location,
      university: user.university,
      major: user.major,
      interests: user.interests,
      socialLinks: {
        linkedin: '',
        github: '',
        twitter: ''
      }
    };

    return (
      <ProfileEditor 
        profile={profileData}
        onCancel={() => setShowEditor(false)}
        onSave={(updatedProfile) => {
          // TODO: Actualizar los datos del usuario
          setShowEditor(false);
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Banner Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
        {bannerImage && (
          <img 
            src={bannerImage} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        )}
        {isOwnProfile && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-0"
            onClick={handleBannerEdit}
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Profile Header */}
      <Card className="-mt-16 mx-6 relative z-10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profileImage} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md hover:bg-gray-50"
                  onClick={handleProfileEdit}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-gray-600">@{user.username}</p>
                  <p className="mt-2 text-gray-700">{user.bio}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {user.university} - {user.major}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Se unió en {user.joinDate}
                    </div>
                  </div>
                </div>

                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEditor(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar perfil
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{user.posts}</div>
                  <div className="text-sm text-gray-600">Publicaciones</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{user.followers}</div>
                  <div className="text-sm text-gray-600">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{user.following}</div>
                  <div className="text-sm text-gray-600">Siguiendo</div>
                </div>
              </div>

              {/* Level Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Nivel {user.level}</span>
                  <span className="text-sm text-gray-600">{user.xp}/{user.maxXp} XP</span>
                </div>
                <Progress value={(user.xp / user.maxXp) * 100} className="h-2" />
              </div>

              {/* Interests */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Composer - Solo para perfil propio autenticado */}
      {isOwnProfile && session && (
        <div className="mx-6 mt-6">
          <Card>
            <CardContent className="p-0">
              <Composer />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Posts Section */}
      <div className="mx-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Publicaciones</h2>
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay publicaciones aún</p>
              {isOwnProfile && (
                <p className="text-sm mt-1">¡Comparte tu primera publicación!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}