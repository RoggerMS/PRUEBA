import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const createConversationSchema = z.object({
  participantIds: z.array(z.string()).min(1).max(10), // Support group conversations up to 10 people
  title: z.string().optional(),
  type: z.enum(['DIRECT', 'GROUP']).default('DIRECT')
});

const updateConversationSchema = z.object({
  title: z.string().optional(),
  metadata: z.string().optional() // JSON string
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
        return await getConversations(req, res, session.user.email);
      case 'POST':
        return await createConversation(req, res, session.user.email);
      case 'PUT':
        return await updateConversation(req, res, session.user.email);
      case 'DELETE':
        return await deleteConversation(req, res, session.user.email);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error in conversations API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function getConversations(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    const { page = '1', limit = '20', search = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Build search conditions
    const searchConditions = search ? {
      OR: [
        {
          title: {
            contains: search as string,
            mode: 'insensitive' as const
          }
        },
        {
          participants: {
            some: {
              user: {
                OR: [
                  {
                    name: {
                      contains: search as string,
                      mode: 'insensitive' as const
                    }
                  },
                  {
                    username: {
                      contains: search as string,
                      mode: 'insensitive' as const
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    } : {};

    // Get conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.id
          }
        },
        ...searchConditions
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                isVerified: true,
                lastSeen: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
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
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: {
                  not: user.id
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip: offset,
      take: limitNum
    });

    // Get total count for pagination
    const totalCount = await prisma.conversation.count({
      where: {
        participants: {
          some: {
            userId: user.id
          }
        },
        ...searchConditions
      }
    });

    // Format conversations for frontend
    const formattedConversations = conversations.map(conversation => {
      const otherParticipants = conversation.participants
        .filter(p => p.userId !== user.id)
        .map(p => p.user);
      
      const lastMessage = conversation.messages[0];
      const unreadCount = conversation._count.messages;

      // Generate conversation title if not set
      let title = conversation.title;
      if (!title) {
        if (conversation.type === 'DIRECT' && otherParticipants.length === 1) {
          title = otherParticipants[0].name || otherParticipants[0].username;
        } else {
          title = otherParticipants.map(p => p.name || p.username).join(', ');
        }
      }

      return {
        id: conversation.id,
        title,
        type: conversation.type,
        participants: otherParticipants,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          sender: lastMessage.sender,
          createdAt: lastMessage.createdAt,
          type: lastMessage.type
        } : null,
        unreadCount,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        metadata: conversation.metadata ? JSON.parse(conversation.metadata) : null
      };
    });

    return res.status(200).json({
      conversations: formattedConversations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return res.status(500).json({ error: 'Error al obtener conversaciones' });
  }
}

async function createConversation(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    const validation = createConversationSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const { participantIds, title, type } = validation.data;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validate participants exist
    const participants = await prisma.user.findMany({
      where: {
        id: {
          in: participantIds
        }
      }
    });

    if (participants.length !== participantIds.length) {
      return res.status(400).json({ error: 'Algunos participantes no existen' });
    }

    // Check if direct conversation already exists
    if (type === 'DIRECT' && participantIds.length === 1) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              userId: {
                in: [user.id, participantIds[0]]
              }
            }
          }
        },
        include: {
          participants: {
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
            }
          }
        }
      });

      if (existingConversation && existingConversation.participants.length === 2) {
        return res.status(200).json({
          conversation: {
            id: existingConversation.id,
            title: existingConversation.title,
            type: existingConversation.type,
            participants: existingConversation.participants
              .filter(p => p.userId !== user.id)
              .map(p => p.user),
            createdAt: existingConversation.createdAt,
            updatedAt: existingConversation.updatedAt
          },
          message: 'Conversación existente encontrada'
        });
      }
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        title,
        type,
        creatorId: user.id,
        participants: {
          create: [
            { userId: user.id, role: 'ADMIN' },
            ...participantIds.map(id => ({
              userId: id,
              role: type === 'GROUP' ? 'MEMBER' as const : 'ADMIN' as const
            }))
          ]
        }
      },
      include: {
        participants: {
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
          }
        }
      }
    });

    // Create notification for other participants
    const otherParticipants = conversation.participants.filter(p => p.userId !== user.id);
    
    for (const participant of otherParticipants) {
      await prisma.notification.create({
        data: {
          userId: participant.userId,
          type: 'MESSAGE',
          title: type === 'DIRECT' ? 'Nueva conversación' : 'Te agregaron a un grupo',
          message: type === 'DIRECT' 
            ? `${user.name || user.username} inició una conversación contigo`
            : `${user.name || user.username} te agregó al grupo ${title || 'Sin título'}`,
          actionUrl: `/messages/${conversation.id}`,
          relatedId: conversation.id,
          relatedType: 'MESSAGE',
          metadata: JSON.stringify({
            conversationId: conversation.id,
            senderId: user.id
          })
        }
      });
    }

    return res.status(201).json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        type: conversation.type,
        participants: conversation.participants
          .filter(p => p.userId !== user.id)
          .map(p => p.user),
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      },
      message: 'Conversación creada correctamente'
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ error: 'Error al crear conversación' });
  }
}

async function updateConversation(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    const { conversationId } = req.query;
    
    if (!conversationId) {
      return res.status(400).json({ error: 'ID de conversación requerido' });
    }

    const validation = updateConversationSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const { title, metadata } = validation.data;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Check if user is participant and has permission to update
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId as string,
        participants: {
          some: {
            userId: user.id,
            role: {
              in: ['ADMIN', 'MODERATOR']
            }
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversación no encontrada o sin permisos' });
    }

    // Update conversation
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId as string },
      data: {
        ...(title && { title }),
        ...(metadata && { metadata })
      }
    });

    return res.status(200).json({
      conversation: updatedConversation,
      message: 'Conversación actualizada correctamente'
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return res.status(500).json({ error: 'Error al actualizar conversación' });
  }
}

async function deleteConversation(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    const { conversationId } = req.query;
    
    if (!conversationId) {
      return res.status(400).json({ error: 'ID de conversación requerido' });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Check if user is participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId as string,
        participants: {
          some: {
            userId: user.id
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }

    // For direct messages, just remove the user from participants
    // For group messages, only creator can delete the entire conversation
    if (conversation.type === 'DIRECT') {
      await prisma.conversationParticipant.delete({
        where: {
          conversationId_userId: {
            conversationId: conversationId as string,
            userId: user.id
          }
        }
      });
    } else {
      // Group conversation - check if user is creator
      if (conversation.creatorId === user.id) {
        // Delete entire conversation
        await prisma.conversation.delete({
          where: { id: conversationId as string }
        });
      } else {
        // Just leave the group
        await prisma.conversationParticipant.delete({
          where: {
            conversationId_userId: {
              conversationId: conversationId as string,
              userId: user.id
            }
          }
        });
      }
    }

    return res.status(200).json({
      message: 'Conversación eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return res.status(500).json({ error: 'Error al eliminar conversación' });
  }
}