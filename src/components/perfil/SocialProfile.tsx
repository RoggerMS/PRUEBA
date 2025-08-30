import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Composer } from '@/components/feed/Composer';
import { useSession } from 'next-auth/react';
import ProfileEditor from './ProfileEditor';
import { ProfileHeader } from './ProfileHeader';

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
      <ProfileHeader 
        user={{
          name: user.name,
          username: user.username,
          avatar: profileImage,
          banner: bannerImage,
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
        mode={isOwnProfile ? 'view' : 'public'}
        onEdit={() => setShowEditor(true)}
        onBannerChange={(newBanner) => setBannerImage(newBanner)}
        onAvatarChange={(newAvatar) => setProfileImage(newAvatar)}
      />
    </div>
  );
}