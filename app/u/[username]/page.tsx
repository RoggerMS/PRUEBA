import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EnhancedProfile } from '@/components/user/EnhancedProfile';
import { prisma } from '@/lib/prisma';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      name: true,
      username: true,
      bio: true,
      image: true
    }
  });

  if (!user) {
    return {
      title: 'Usuario no encontrado - CRUNEVO',
      description: 'El perfil que buscas no existe.'
    };
  }

  return {
    title: `${user.name} (@${user.username}) - CRUNEVO`,
    description: user.bio || `Perfil de ${user.name} en CRUNEVO`,
    openGraph: {
      title: `${user.name} (@${user.username})`,
      description: user.bio || `Perfil de ${user.name} en CRUNEVO`,
      images: user.image ? [{ url: user.image }] : [],
      type: 'profile'
    },
    twitter: {
      card: 'summary',
      title: `${user.name} (@${user.username})`,
      description: user.bio || `Perfil de ${user.name} en CRUNEVO`,
      images: user.image ? [user.image] : []
    }
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions);
  
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { id: true, username: true }
  });

  if (!user) {
    notFound();
  }

  // Check if this is the user's own profile
  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedProfile 
        username={params.username} 
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}

// Generate static params for popular users (optional)
export async function generateStaticParams() {
  // Get some popular users for static generation
  const users = await prisma.user.findMany({
    select: { username: true },
    take: 100, // Generate static pages for top 100 users
    orderBy: {
      createdAt: 'desc'
    }
  });

  return users.map((user) => ({
    username: user.username
  }));
}