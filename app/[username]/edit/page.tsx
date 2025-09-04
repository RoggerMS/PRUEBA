import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ProfileView } from '@/components/profile/ProfileView';
import { getUserByUsername, isReservedUsername } from '@/lib/users';
import { USERNAME_REGEX } from '@/lib/validation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false },
};

interface EditProfilePageProps {
  params: { username: string };
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  if (isReservedUsername(params.username) || !USERNAME_REGEX.test(params.username)) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

  if (user.username !== params.username) {
    redirect(`/${user.username}/edit`);
  }

  if (!session || session.user?.id !== user.id) {
    redirect(`/${user.username}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileView username={user.username} isOwnProfile={true} mode="edit" />
    </div>
  );
}
