import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Wrapper around getServerSession with development fallback.
 * If DEV_MOCK_SESSION is true and no session exists, it will
 * return the first user as a mock session so workspace APIs
 * can be tested without going through the login flow.
 * 
 * IMPORTANT: DEV_MOCK_SESSION should always be false in production!
 */
export async function getSession() {
  let session = await getServerSession(authOptions);
  
  // Mock session for development only
  const shouldMockSession = process.env.DEV_MOCK_SESSION === 'true' && 
                           process.env.NODE_ENV === 'development';
  
  if (!session?.user?.id && shouldMockSession) {
    const user = await prisma.user.findFirst({ 
       select: { 
         id: true, 
         email: true, 
         username: true, 
         name: true 
       } 
     });
    
    if (user) {
      session = {
        user: { 
           id: user.id, 
           email: user.email,
           username: user.username,
           name: user.name
         },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      } as any;
      
      // Log mock session usage in development
      console.log(`🔧 DEV: Using mock session for user ${user.email} (${user.id})`);
    }
  }
  
  return session;
}
