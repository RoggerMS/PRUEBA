import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProfileView } from '@/components/profile/ProfileView';
import { USERNAME_REGEX } from '@/lib/validation';
import { getUserByUsername, isReservedUsername } from '@/lib/users';

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
    if (!USERNAME_REGEX.test(params.username) || isReservedUsername(params.username)) {
      return {
        title: 'Usuario no encontrado - CRUNEVO',
        description: 'El perfil que buscas no existe.'
      };
    }

    const user = await getUserByUsername(params.username);

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
        canonical: `/${user.username}`
      }
    };
  } catch (error) {
    return {
      title: `@${params.username} - CRUNEVO`,
      description: `Perfil de ${params.username} en CRUNEVO`
    };
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  if (isReservedUsername(params.username) || !USERNAME_REGEX.test(params.username)) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

  if (user.username !== params.username) {
    redirect(`/${user.username}`);
  }

  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileView
        username={user.username}
        isOwnProfile={isOwnProfile}
        mode={isOwnProfile ? 'edit' : 'public'}
      />
    </div>
  );
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