import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Wrapper around getServerSession with development fallback.
 * If running in development and no session exists, it will
 * return the first user as a mock session so workspace APIs
 * can be tested without going through the login flow.
 */
export async function getSession() {
  let session = await getServerSession(authOptions);
  if (!session?.user?.id && process.env.NODE_ENV === 'development') {
    const user = await prisma.user.findFirst({ select: { id: true, email: true } });
    if (user) {
      session = {
        user: { id: user.id, email: user.email }
      } as any;
    }
  }
  return session;
}
