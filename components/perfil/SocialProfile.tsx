import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProfileHeader } from './ProfileHeader';

const ProfileEditor = dynamic(() => import('./ProfileEditor'), { ssr: false });

export interface User {
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
  const router = useRouter();
  const [showEditor, setShowEditor] = useState(false);
  const [profileData, setProfileData] = useState(user);
  const [bannerImage, setBannerImage] = useState(user.banner || '');
  const [profileImage, setProfileImage] = useState(user.avatar);

  const handleSave = async (updatedProfile: any) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedProfile.name,
          username: updatedProfile.username
        })
      });

      if (response.ok) {
        setProfileData(prev => ({
          ...prev,
          name: updatedProfile.name,
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          location: updatedProfile.location,
          university: updatedProfile.university,
          major: updatedProfile.major,
          interests: updatedProfile.interests
        }));
        setProfileImage(updatedProfile.avatar);
        setBannerImage(updatedProfile.banner || '');
        toast.success('Perfil actualizado correctamente');
      } else {
        toast.error('Error al actualizar perfil');
      }
    } catch (error) {
      toast.error('Error al actualizar perfil');
    } finally {
      setShowEditor(false);
    }
  };

  if (showEditor) {
    const profileDataForEditor = {
      id: profileData.id,
      name: profileData.name,
      email: session?.user?.email || '',
      avatar: profileImage,
      banner: bannerImage,
      bio: profileData.bio,
      location: profileData.location,
      university: profileData.university,
      major: profileData.major,
      interests: profileData.interests,
      socialLinks: {
        linkedin: '',
        github: '',
        twitter: ''
      }
    };

    return (
      <ProfileEditor
        profile={profileDataForEditor}
        onCancel={() => setShowEditor(false)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader
        user={{
          name: profileData.name,
          username: profileData.username,
          avatar: profileImage,
          banner: bannerImage,
          bio: profileData.bio,
          location: profileData.location,
          university: profileData.university,
          major: profileData.major,
          joinDate: profileData.joinDate,
          level: profileData.level,
          xp: profileData.xp,
          maxXp: profileData.maxXp,
          interests: profileData.interests,
          followers: profileData.followers,
          following: profileData.following,
          posts: profileData.posts
        }}
        mode={isOwnProfile ? 'view' : 'public'}
        onEdit={() => setShowEditor(true)}
        onViewPublic={() => router.push(`/${profileData.username}`)}
        onBannerChange={(newBanner) => setBannerImage(newBanner)}
        onAvatarChange={(newAvatar) => setProfileImage(newAvatar)}
      />
    </div>
  );
}