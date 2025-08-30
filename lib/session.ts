import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { prisma } from './prisma';

export async function getSession() {
  let session = await getServerSession(authOptions);
  
  // Mock session in development if no user is logged in
  if (!session?.user?.id && process.env.NODE_ENV === 'development') {
    const user = await prisma.user.findFirst({ 
      select: { id: true, email: true, name: true } 
    });
    if (user) {
      session = { 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name 
        } 
      } as any;
    }
  }
  
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  return session.user;
}