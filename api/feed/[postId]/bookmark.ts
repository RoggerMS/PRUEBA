import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { postId } = req.query;
  
  if (!postId || typeof postId !== 'string') {
    return res.status(400).json({ error: 'ID de post requerido' });
  }

  try {
    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    // Verificar si ya está guardado
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    });

    let saved = false;

    if (existingBookmark) {
      // Remover bookmark
      await prisma.bookmark.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: postId
          }
        }
      });
      saved = false;
    } else {
      // Crear bookmark
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          postId: postId
        }
      });
      saved = true;
    }

    // Actualizar contador de saves en el post
    const bookmarkCount = await prisma.bookmark.count({
      where: { postId: postId }
    });

    await prisma.post.update({
      where: { id: postId },
      data: { saves: bookmarkCount }
    });

    return res.status(200).json({ 
      success: true, 
      saved: saved,
      saves: bookmarkCount
    });
  } catch (error) {
    console.error('Error in bookmark API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });