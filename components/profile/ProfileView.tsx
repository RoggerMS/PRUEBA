'use client';

import { EnhancedProfile } from '@/components/user/EnhancedProfile';

interface ProfileViewProps {
  username: string;
  isOwnProfile: boolean;
  mode: 'public' | 'edit';
}

export function ProfileView({ username, isOwnProfile, mode }: ProfileViewProps) {
  return <EnhancedProfile username={username} isOwnProfile={isOwnProfile} mode={mode} />;
}

export default ProfileView;
