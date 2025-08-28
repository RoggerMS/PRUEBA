import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { User as PrismaUser } from '@prisma/client';

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    username: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUserByEmail(credentials.email);
        if (!user || !user.password) {
          return null;
        }

        // Verify password using bcrypt
        const isPasswordValid = await verifyPassword(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.image,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as PrismaUser).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    }
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Initialize user data for new users
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              crolars: 1000, // Welcome bonus
              level: 1,
              xp: 0,
              streak: 0,
              lastActivity: new Date()
            }
          });

          // Create welcome notification
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'SYSTEM',
              title: '¡Bienvenido a CRUNEVO!',
              message: 'Completa tu perfil y comienza a conectar con otros estudiantes. ¡Recibiste 1000 Crolars de bienvenida!',
              read: false
            }
          });
        } catch (error) {
          console.error('Error initializing new user:', error);
        }
      } else {
        // Update last active time for existing users
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastActivity: new Date()
            }
          });
        } catch (error) {
          console.error('Error updating user last active:', error);
        }
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Helper function to verify passwords
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Helper function to get user by email
export async function getUserByEmail(email: string): Promise<{
  id: string;
  email: string;
  name: string | null;
  username: string;
  image: string | null;
  password: string | null;
  emailVerified: Date | null;
} | null> {
  try {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
        password: true,
        emailVerified: true
      }
    });
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Helper function to get user by username
export async function getUserByUsername(username: string): Promise<PrismaUser | null> {
  try {
    return await prisma.user.findUnique({
      where: { username }
    });
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
}

// Helper function to create user
export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  username: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}): Promise<PrismaUser | null> {
  try {
    const hashedPassword = await hashPassword(userData.password);
    
    return await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        username: userData.username,
        birthDate: userData.dateOfBirth,
        gender: userData.gender,
        crolars: 1000, // Welcome bonus
        level: 1,
        xp: 0,
        streak: 0,
        lastActivity: new Date()
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}