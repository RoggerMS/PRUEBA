import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function PerfilRedirect() {
  const session = await getServerSession(authOptions);
  const username = session?.user?.username;
  if (!username) {
    redirect('/');
  }
  redirect(`/${username}/edit`);
}
