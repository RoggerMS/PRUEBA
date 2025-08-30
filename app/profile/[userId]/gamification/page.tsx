import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GamificationProfile } from '@/components/gamification/GamificationProfile';

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, username: true }
  });

  if (!user) {
    return {
      title: 'Usuario no encontrado'
    };
  }

  return {
    title: `Gamificación - ${user.name || user.username}`,
    description: `Perfil de gamificación de ${user.name || user.username}. Ve sus badges, nivel y progreso en la plataforma.`,
  };
}

export default async function GamificationPage({ params }: PageProps) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);
  
  // Verificar que el usuario existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      level: true,
      xp: true,
      crolars: true,
      streak: true,
      createdAt: true
    }
  });

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === userId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header del usuario */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {user.image && (
            <img
              src={user.image}
              alt={user.name || user.username || 'Usuario'}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {user.name || user.username}
            </h1>
            {user.username && user.name && (
              <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Nivel {user.level}</span>
              <span>•</span>
              <span>{user.xp.toLocaleString()} XP</span>
              <span>•</span>
              <span>Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Componente de gamificación */}
      <GamificationProfile 
        userId={userId}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}