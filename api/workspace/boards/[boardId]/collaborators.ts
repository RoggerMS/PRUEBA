import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const inviteCollaboratorSchema = z.object({
  email: z.string().email('Email inválido'),
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
      },
      include: {
        collaborators: {
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
        }
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Pizarra no encontrada o sin permisos' });
    }

    if (req.method === 'GET') {
      // Obtener colaboradores
      return res.status(200).json({ 
        collaborators: board.collaborators 
      });
    }
    
    if (req.method === 'POST') {
      // Invitar colaborador
      const validation = inviteCollaboratorSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: validation.error.errors
        });
      }

      const { email, role } = validation.data;

      // Buscar usuario por email
      const invitedUser = await prisma.user.findUnique({
        where: { email }
      });

      if (!invitedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (invitedUser.id === session.user.id) {
        return res.status(400).json({ error: 'No puedes invitarte a ti mismo' });
      }

      // Verificar si ya es colaborador
      const existingCollaborator = await prisma.workspaceCollaborator.findUnique({
        where: {
          boardId_userId: {
            boardId: boardId,
            userId: invitedUser.id
          }
        }
      });

      if (existingCollaborator) {
        return res.status(400).json({ error: 'El usuario ya es colaborador' });
      }

      // Crear colaborador
      const collaborator = await prisma.workspaceCollaborator.create({
        data: {
          boardId: boardId,
          userId: invitedUser.id,
          role: role,
          invitedBy: session.user.id
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

      // Crear notificación para el usuario invitado
      await prisma.notification.create({
        data: {
          type: 'workspace_invite',
          recipientId: invitedUser.id,
          actorId: session.user.id,
          message: `Te han invitado a colaborar en la pizarra "${board.name}"`,
          metadata: JSON.stringify({ 
            boardId: boardId,
            boardName: board.name,
            role: role
          })
        }
      });

      return res.status(201).json({ 
        success: true,
        collaborator
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error in collaborators API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}