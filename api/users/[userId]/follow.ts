import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const followSchema = z.object({
  userId: z.string().min(1)
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { userId } = req.query;
  
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  if (userId === session.user.id) {
    return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
  }

  try {
    if (req.method === 'POST') {
      // Seguir usuario
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId
          }
        }
      });

      if (existingFollow) {
        return res.status(400).json({ error: 'Ya sigues a este usuario' });
      }

      // Crear relación de seguimiento
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: userId
        }
      });

      // Crear notificación
      await prisma.notification.create({
        data: {
          type: 'follow',
          recipientId: userId,
          actorId: session.user.id,
          message: 'Te está siguiendo'
        }
      });

      return res.status(200).json({ success: true, following: true });
    }
    
    if (req.method === 'DELETE') {
      // Dejar de seguir usuario
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId
          }
        }
      });

      if (!existingFollow) {
        return res.status(400).json({ error: 'No sigues a este usuario' });
      }

      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId
          }
        }
      });

      return res.status(200).json({ success: true, following: false });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error in follow API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}