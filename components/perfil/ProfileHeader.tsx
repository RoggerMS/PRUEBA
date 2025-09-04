'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Edit3, MapPin, Calendar, GraduationCap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ProfileStats } from './ProfileStats'

interface ProfileHeaderProps {
  user: {
    name: string;
    username: string;
    avatar: string;
    banner?: string;
    bio: string;
    location: string;
    university: string;
    major: string;
    joinDate: string;
    level: number;
    xp: number;
    maxXp: number;
    interests: string[];
    followers: number;
    following: number;
    posts: number;
  };
  mode: 'edit' | 'view' | 'public';
  onEdit?: () => void;
  onViewPublic?: () => void;
  onBannerChange?: (banner: string) => void;
  onAvatarChange?: (avatar: string) => void;
}

export function ProfileHeader({ user, mode, onEdit, onViewPublic, onBannerChange, onAvatarChange }: ProfileHeaderProps) {
  const router = useRouter()
  const handleBannerEdit = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          // You might want to show a toast here
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onBannerChange?.(result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAvatarEdit = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          // You might want to show a toast here
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onAvatarChange?.(result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const showEditControls = mode === 'edit'
  const showEditButton = mode === 'view'
  const isPublicMode = mode === 'public'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Banner Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
        {user.banner && (
          <img 
            src={user.banner} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        )}
        {mode === 'edit' && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-0 flex items-center justify-center"
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
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {mode === 'edit' && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md hover:bg-gray-50 flex items-center justify-center"
                  onClick={handleAvatarEdit}
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
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </div>
                    )}
                    {user.university && user.major && (
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {user.university} - {user.major}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Se unió en {user.joinDate}
                    </div>
                  </div>
                </div>

                {mode === 'view' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (onViewPublic) {
                          onViewPublic()
                        } else {
                          router.push(`/${user.username}`)
                        }
                      }}
                    >
                      Ver público
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (onEdit) {
                          onEdit()
                        } else {
                          router.push('/settings')
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Editar perfil
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats with Level - Only show for view and public modes */}
              {(mode === 'view' || mode === 'public') && (
                <div className="mt-6">
                  <ProfileStats
                    level={user.level}
                    xp={user.xp}
                    maxXp={user.maxXp}
                    posts={user.posts}
                    followers={user.followers}
                    following={user.following}
                    showLevel={true}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileHeader