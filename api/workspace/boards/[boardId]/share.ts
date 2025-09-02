import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { boardId } = req.query;
  
  if (!boardId || typeof boardId !== 'string') {
    return res.status(400).json({ error: 'ID de pizarra requerido' });
  }

  try {
    // Verificar que el usuario es propietario o editor de la pizarra
    const board = await prisma.workspaceBoard.findFirst({
      where: {
        id: boardId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: { in: ['OWNER', 'EDITOR'] }
              }
            }
          }
        ]
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Pizarra no encontrada o sin permisos' });
    }

    if (req.method === 'POST') {
      // Generar enlace de compartir
      const shareToken = nanoid(32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expira en 30 días

      const shareLink = await prisma.workspaceShareLink.create({
        data: {
          boardId: boardId,
          token: shareToken,
          createdBy: session.user.id,
          expiresAt: expiresAt,
          isActive: true
        }
      });

      const shareUrl = `${process.env.NEXTAUTH_URL}/workspace/shared/${shareToken}`;

      return res.status(201).json({ 
        success: true,
        shareUrl: shareUrl,
        shareLink: shareLink,
        expiresAt: expiresAt
      });
    }
    
    if (req.method === 'GET') {
      // Obtener enlaces de compartir existentes
      const shareLinks = await prisma.workspaceShareLink.findMany({
        where: {
          boardId: boardId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const shareUrls = shareLinks.map(link => ({
        ...link,
        shareUrl: `${process.env.NEXTAUTH_URL}/workspace/shared/${link.token}`
      }));

      return res.status(200).json({ 
        shareLinks: shareUrls
      });
    }
    
    if (req.method === 'DELETE') {
      // Desactivar todos los enlaces de compartir
      await prisma.workspaceShareLink.updateMany({
        where: {
          boardId: boardId,
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      return res.status(200).json({ 
        success: true,
        message: 'Enlaces de compartir desactivados'
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error in share API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}