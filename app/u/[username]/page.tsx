import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EnhancedProfile } from '@/components/user/EnhancedProfile';
import { prisma } from '@/lib/prisma';
import { USERNAME_REGEX } from '@/lib/validation';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  // Skip database queries during build time
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('localhost')) {
    return {
      title: `@${params.username} - CRUNEVO`,
      description: `Perfil de ${params.username} en CRUNEVO`
    };
  }

  try {
    if (!USERNAME_REGEX.test(params.username)) {
      return {
        title: 'Usuario no encontrado - CRUNEVO',
        description: 'El perfil que buscas no existe.'
      };
    }

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: params.username,
          mode: 'insensitive'
        }
      },
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
      },
      alternates: {
        canonical: `/u/${user.username}`
      }
    };
  } catch (error) {
    // Fallback metadata if database is not available
    return {
      title: `@${params.username} - CRUNEVO`,
      description: `Perfil de ${params.username} en CRUNEVO`
    };
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // Skip database queries during build time
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('localhost')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedProfile 
          username={params.username} 
          isOwnProfile={false}
        />
      </div>
    );
  }

  if (!USERNAME_REGEX.test(params.username)) {
    notFound();
  }

  try {
    const session = await getServerSession(authOptions);

    // Check if user exists (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: params.username,
          mode: 'insensitive'
        }
      },
      select: { id: true, username: true }
    });

    if (!user) {
      notFound();
    }

    // Redirect to canonical username if casing differs
    if (user.username !== params.username) {
      redirect(`/u/${user.username}`);
    }

    // Check if this is the user's own profile
    const isOwnProfile = session?.user?.id === user.id;

    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedProfile
          username={user.username}
          isOwnProfile={isOwnProfile}
        />
      </div>
    );
  } catch (error: any) {
    if (error?.digest === 'NEXT_REDIRECT' || error?.digest === 'NEXT_NOT_FOUND') {
      throw error;
    }
    // Fallback if database is not available
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedProfile
          username={params.username}
          isOwnProfile={false}
        />
      </div>
    );
  }
}

// Generate static params for popular users (optional)
// Commented out to avoid database connection during build
// export async function generateStaticParams() {
//   // Get some popular users for static generation
//   const users = await prisma.user.findMany({
//     select: { username: true },
//     take: 100, // Generate static pages for top 100 users
//     orderBy: {
//       createdAt: 'desc'
//     }
//   });

//   return users.map((user) => ({
//     username: user.username
//   }));
// }