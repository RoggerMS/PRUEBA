import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProfileView } from '@/components/profile/ProfileView';
import { USERNAME_REGEX } from '@/lib/validation';
import { getUserByUsername, isReservedUsername } from '@/lib/users';

type ParamP = { params: Promise<{ username: string }> };

// Generate metadata for SEO
export async function generateMetadata({ params }: ParamP): Promise<Metadata> {
  const { username } = await params;

  // Skip database queries during build time
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('localhost')) {
    return {
      title: `@${username} - CRUNEVO`,
      description: `Perfil de ${username} en CRUNEVO`
    };
  }

  try {
    if (!USERNAME_REGEX.test(username) || isReservedUsername(username)) {
      return {
        title: 'Usuario no encontrado - CRUNEVO',
        description: 'El perfil que buscas no existe.'
      };
    }

    const user = await getUserByUsername(username);

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
    return {
      title: `@${username} - CRUNEVO`,
      description: `Perfil de ${username} en CRUNEVO`
    };
  }
}

export default async function ProfilePage({ params }: ParamP) {
  const { username } = await params;

  if (isReservedUsername(username) || !USERNAME_REGEX.test(username)) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  if (user.username !== username) {
    redirect(`/u/${user.username}`);
  }

  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileView
        username={user.username}
        isOwnProfile={isOwnProfile}
        mode="public"
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