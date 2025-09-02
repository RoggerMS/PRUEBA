import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['TEXT', 'IMAGE', 'FILE', 'AUDIO', 'VIDEO']).default('TEXT'),
  attachments: z.string().optional(), // JSON string for file attachments
  replyToId: z.string().optional() // For replying to specific messages
});

const updateMessageSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  isRead: z.boolean().optional()
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
      case 'GET':
        return await getMessages(req, res, session.user.email);
      case 'POST':
        return await sendMessage(req, res, session.user.email);
      case 'PUT':
        return await updateMessage(req, res, session.user.email);
      case 'DELETE':
        return await deleteMessage(req, res, session.user.email);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error in messages API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function getMessages(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    const { conversationId } = req.query;
    const { page = '1', limit = '50', before, after } = req.query;
    
    if (!conversationId) {
      return res.status(400).json({ error: 'ID de conversación requerido' });
    }

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100); // Max 100 messages per request
    const offset = (pageNum - 1) * limitNum;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Check if user is participant in conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId as string,
          userId: user.id
        }
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'No tienes acceso a esta conversación' });
    }

    // Build date filters for cursor-based pagination
    const dateFilters: any = {};
    if (before) {
      dateFilters.createdAt = { lt: new Date(before as string) };
    }
    if (after) {
      dateFilters.createdAt = { gt: new Date(after as string) };
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId as string,
        ...dateFilters
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            isVerified: true
          }
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          }
        },
        reactions: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limitNum
    });

    // Mark messages as read for current user
    const unreadMessageIds = messages
      .filter(msg => msg.senderId !== user.id && !msg.isRead)
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: {
            in: unreadMessageIds
          }
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    }

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: {
        conversationId: conversationId as string,
        ...dateFilters
      }
    });

    // Format messages for frontend
    const formattedMessages = messages.reverse().map(message => ({
      id: message.id,
      content: message.content,
      type: message.type,
      sender: message.sender,
      attachments: message.attachments ? JSON.parse(message.attachments) : null,
      replyTo: message.replyTo ? {
        id: message.replyTo.id,
        content: message.replyTo.content,
        sender: message.replyTo.sender,
        type: message.replyTo.type
      } : null,
      reactions: message.reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction.user);
        return acc;
      }, {} as Record<string, any[]>),
      isRead: message.isRead,
      isEdited: message.editedAt !== null,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      readAt: message.readAt
    }));

    return res.status(200).json({
      messages: formattedMessages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        hasMore: totalCount > offset + limitNum
      }
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return res.status(500).json({ error: 'Error al obtener mensajes' });
  }
}

async function sendMessage(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    const { conversationId } = req.query;
    
    if (!conversationId) {
      return res.status(400).json({ error: 'ID de conversación requerido' });
    }

    const validation = sendMessageSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const { content, type, attachments, replyToId } = validation.data;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Check if user is participant in conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId as string,
          userId: user.id
        }
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'No tienes acceso a esta conversación' });
    }

    // Validate reply-to message if provided
    if (replyToId) {
      const replyToMessage = await prisma.message.findFirst({
        where: {
          id: replyToId,
          conversationId: conversationId as string
        }
      });

      if (!replyToMessage) {
        return res.status(400).json({ error: 'Mensaje de respuesta no encontrado' });
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        type,
        attachments,
        conversationId: conversationId as string,
        senderId: user.id,
        replyToId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            isVerified: true
          }
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          }
        }
      }
    });

    // Update conversation's last activity
    await prisma.conversation.update({
      where: { id: conversationId as string },
      data: { updatedAt: new Date() }
    });

    // Get other participants for notifications
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: conversationId as string,
        userId: {
          not: user.id
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true
          }
        }
      }
    });

    // Create notifications for other participants
    for (const participant of otherParticipants) {
      await prisma.notification.create({
        data: {
          userId: participant.userId,
          type: 'MESSAGE',
          title: 'Nuevo mensaje',
          message: `${user.name || user.username}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
          actionUrl: `/messages/${conversationId}`,
          relatedId: message.id,
          relatedType: 'MESSAGE',
          metadata: JSON.stringify({
            conversationId: conversationId,
            messageId: message.id,
            senderId: user.id
          })
        }
      });
    }

    // Format message for response
    const formattedMessage = {
      id: message.id,
      content: message.content,
      type: message.type,
      sender: message.sender,
      attachments: message.attachments ? JSON.parse(message.attachments) : null,
      replyTo: message.replyTo ? {
        id: message.replyTo.id,
        content: message.replyTo.content,
        sender: message.replyTo.sender,
        type: message.replyTo.type
      } : null,
      reactions: {},
      isRead: false,
      isEdited: false,
      createdAt: message.createdAt,
      editedAt: null,
      readAt: null
    };

    return res.status(201).json({
      message: formattedMessage,
      success: 'Mensaje enviado correctamente'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Error al enviar mensaje' });
  }
}

async function updateMessage(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    const { conversationId } = req.query;
    const { messageId } = req.query;
    
    if (!conversationId || !messageId) {
      return res.status(400).json({ error: 'ID de conversación y mensaje requeridos' });
    }

    const validation = updateMessageSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const { content, isRead } = validation.data;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Get message and verify ownership for content updates
    const message = await prisma.message.findFirst({
      where: {
        id: messageId as string,
        conversationId: conversationId as string
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    // For content updates, user must be the sender
    if (content && message.senderId !== user.id) {
      return res.status(403).json({ error: 'Solo puedes editar tus propios mensajes' });
    }

    // For read status updates, user must be a participant
    if (isRead !== undefined) {
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: conversationId as string,
            userId: user.id
          }
        }
      });

      if (!participant) {
        return res.status(403).json({ error: 'No tienes acceso a esta conversación' });
      }
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId as string },
      data: {
        ...(content && { 
          content,
          editedAt: new Date()
        }),
        ...(isRead !== undefined && {
          isRead,
          readAt: isRead ? new Date() : null
        })
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            isVerified: true
          }
        }
      }
    });

    return res.status(200).json({
      message: updatedMessage,
      success: 'Mensaje actualizado correctamente'
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return res.status(500).json({ error: 'Error al actualizar mensaje' });
  }
}

async function deleteMessage(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    const { conversationId, messageId } = req.query;
    
    if (!conversationId || !messageId) {
      return res.status(400).json({ error: 'ID de conversación y mensaje requeridos' });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Get message and verify ownership
    const message = await prisma.message.findFirst({
      where: {
        id: messageId as string,
        conversationId: conversationId as string,
        senderId: user.id
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Mensaje no encontrado o sin permisos' });
    }

    // Soft delete - mark as deleted instead of actually deleting
    await prisma.message.update({
      where: { id: messageId as string },
      data: {
        content: '[Mensaje eliminado]',
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    return res.status(200).json({
      success: 'Mensaje eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({ error: 'Error al eliminar mensaje' });
  }
}