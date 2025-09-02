import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.enum(['EDITOR', 'VIEWER'])
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { boardId, userId } = req.query;
  
  if (!boardId || typeof boardId !== 'string' || !userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'ID de pizarra y usuario requeridos' });
  }

  try {
    // Verificar que el usuario es propietario de la pizarra
    const board = await prisma.workspaceBoard.findFirst({
      where: {
        id: boardId,
        userId: session.user.id // Solo el propietario puede gestionar colaboradores
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Pizarra no encontrada o sin permisos' });
    }

    // Verificar que el colaborador existe
    const collaborator = await prisma.workspaceCollaborator.findUnique({
      where: {
        boardId_userId: {
          boardId: boardId,
          userId: userId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    if (!collaborator) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    if (req.method === 'PUT') {
      // Actualizar rol del colaborador
      const validation = updateRoleSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: validation.error.errors
        });
      }

      const { role } = validation.data;

      const updatedCollaborator = await prisma.workspaceCollaborator.update({
        where: {
          boardId_userId: {
            boardId: boardId,
            userId: userId
          }
        },
        data: { role },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      });

      // Crear notificación para el colaborador
      await prisma.notification.create({
        data: {
          type: 'workspace_role_updated',
          recipientId: userId,
          actorId: session.user.id,
          message: `Tu rol en la pizarra "${board.name}" ha sido actualizado a ${role}`,
          metadata: JSON.stringify({ 
            boardId: boardId,
            boardName: board.name,
            newRole: role
          })
        }
      });

      return res.status(200).json({ 
        success: true,
        collaborator: updatedCollaborator
      });
    }
    
    if (req.method === 'DELETE') {
      // Remover colaborador
      await prisma.workspaceCollaborator.delete({
        where: {
          boardId_userId: {
            boardId: boardId,
            userId: userId
          }
        }
      });

      // Crear notificación para el colaborador removido
      await prisma.notification.create({
        data: {
          type: 'workspace_removed',
          recipientId: userId,
          actorId: session.user.id,
          message: `Has sido removido de la pizarra "${board.name}"`,
          metadata: JSON.stringify({ 
            boardId: boardId,
            boardName: board.name
          })
        }
      });

      return res.status(200).json({ 
        success: true,
        message: 'Colaborador removido exitosamente'
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error in collaborator management API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}