import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const addReactionSchema = z.object({
  messageId: z.string(),
  emoji: z.string().min(1).max(10)
});

const removeReactionSchema = z.object({
  messageId: z.string(),
  emoji: z.string().min(1).max(10)
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    switch (req.method) {
      case 'POST':
        return await addReaction(req, res, session.user.email);
      case 'DELETE':
        return await removeReaction(req, res, session.user.email);
      case 'GET':
        return await getMessageReactions(req, res, session.user.email);
      default:
        res.setHeader('Allow', ['POST', 'DELETE', 'GET']);
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error in reactions API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function addReaction(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    const validation = addReactionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const { messageId, emoji } = validation.data;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Get message and verify user has access to the conversation
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          participants: {
            some: {
              userId: user.id
            }
          }
        }
      },
      include: {
        conversation: {
          select: {
            id: true
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Mensaje no encontrado o sin acceso' });
    }

    // Check if reaction already exists
    const existingReaction = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: user.id,
          emoji
        }
      }
    });

    if (existingReaction) {
      return res.status(400).json({ error: 'Ya has reaccionado con este emoji' });
    }

    // Create reaction
    const reaction = await prisma.messageReaction.create({
      data: {
        messageId,
        userId: user.id,
        emoji
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    });

    // Create notification for message sender (if not reacting to own message)
    if (message.senderId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: message.senderId,
          type: 'REACTION',
          title: 'Nueva reacción',
          message: `${user.name || user.username} reaccionó ${emoji} a tu mensaje`,
          actionUrl: `/messages/${message.conversation.id}`,
          relatedId: messageId,
          relatedType: 'MESSAGE',
          metadata: JSON.stringify({
            conversationId: message.conversation.id,
            messageId,
            reactorId: user.id,
            emoji
          })
        }
      });
    }

    return res.status(201).json({
      reaction,
      message: 'Reacción agregada correctamente'
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return res.status(500).json({ error: 'Error al agregar reacción' });
  }
}

async function removeReaction(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    const validation = removeReactionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const { messageId, emoji } = validation.data;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verify message exists and user has access
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          participants: {
            some: {
              userId: user.id
            }
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Mensaje no encontrado o sin acceso' });
    }

    // Remove reaction
    const deletedReaction = await prisma.messageReaction.delete({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: user.id,
          emoji
        }
      }
    });

    return res.status(200).json({
      message: 'Reacción eliminada correctamente'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Reacción no encontrada' });
    }
    console.error('Error removing reaction:', error);
    return res.status(500).json({ error: 'Error al eliminar reacción' });
  }
}

async function getMessageReactions(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    const { messageId } = req.query;
    
    if (!messageId) {
      return res.status(400).json({ error: 'ID de mensaje requerido' });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verify message exists and user has access
    const message = await prisma.message.findFirst({
      where: {
        id: messageId as string,
        conversation: {
          participants: {
            some: {
              userId: user.id
            }
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Mensaje no encontrado o sin acceso' });
    }

    // Get all reactions for the message
    const reactions = await prisma.messageReaction.findMany({
      where: {
        messageId: messageId as string
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            isVerified: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
          userReacted: false
        };
      }
      
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.user);
      
      if (reaction.userId === user.id) {
        acc[reaction.emoji].userReacted = true;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return res.status(200).json({
      reactions: Object.values(groupedReactions),
      totalReactions: reactions.length
    });
  } catch (error) {
    console.error('Error getting message reactions:', error);
    return