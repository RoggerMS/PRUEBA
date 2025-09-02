import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EnhancedProfile } from '@/components/user/EnhancedProfile';

export const metadata: Metadata = {
  title: 'Mi Perfil - CRUNEVO',
  description: 'Gestiona tu perfil y configuración en CRUNEVO'
};

export default async function MyProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedProfile isOwnProfile={true} />
    </div>
  );
}