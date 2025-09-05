import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Mi Perfil - CRUNEVO',
  description: 'Gestiona tu perfil y configuración en CRUNEVO'
};

export default async function MyProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }
  // Redirect to the user's public profile instead of rendering the edit view
  redirect(`/${session.user.username}`);
}