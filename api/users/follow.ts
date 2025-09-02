import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const followerId = session.user.id;

  switch (req.method) {
    case 'POST':
      try {
        const { userId: followingId } = req.body;

        if (!followingId) {
          return res.status(400).json({ error: 'ID de usuario requerido' });
        }

        if (followerId === followingId) {
          return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
        }

        // Check if user exists
        const userToFollow = await prisma.user.findUnique({
          where: { id: followingId }
        });

        if (!userToFollow) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Check if already following
        const existingFollow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId,
              followingId
            }
          }
        });

        if (existingFollow) {
          return res.status(400).json({ error: 'Ya sigues a este usuario' });
        }

        // Create follow relationship
        const follow = await prisma.follow.create({
          data: {
            followerId,
            followingId
          },
          include: {
            following: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          }
        });

        // Create notification for the followed user
        await prisma.notification.create({
          data: {
            userId: followingId,
            type: 'FOLLOW',
            title: 'Nuevo seguidor',
            message: `${session.user.name} comenzó a seguirte`,
            metadata: JSON.stringify({
              followerId,
              followerName: session.user.name,
              followerUsername: session.user.username,
              followerImage: session.user.image
            })
          }
        });

        return res.status(201).json({
          message: 'Usuario seguido exitosamente',
          follow
        });
      } catch (error) {
        console.error('Error following user:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    case 'DELETE':
      try {
        const { userId: followingId } = req.body;

        if (!followingId) {
          return res.status(400).json({ error: 'ID de usuario requerido' });
        }

        // Find and delete follow relationship
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId,
              followingId
            }
          }
        });

        if (!follow) {
          return res.status(404).json({ error: 'No sigues a este usuario' });
        }

        await prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId,
              followingId
            }
          }
        });

        return res.status(200).json({
          message: 'Usuario no seguido exitosamente'
        });
      } catch (error) {
        console.error('Error unfollowing user:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    case 'GET':
      try {
        const { type = 'following', userId } = req.query;
        const targetUserId = userId as string || followerId;

        if (type === 'following') {
          const following = await prisma.follow.findMany({
            where: { followerId: targetUserId },
            include: {
              following: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                  bio: true,
                  userVerification: {
                    select: {
                      emailVerified: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          });

          return res.status(200).json({
            following: following.map(f => f.following)
          });
        } else if (type === 'followers') {
          const followers = await prisma.follow.findMany({
            where: { followingId: targetUserId },
            include: {
              follower: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                  bio: true,
                  userVerification: {
                    select: {
                      emailVerified: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          });

          return res.status(200).json({
            followers: followers.map(f => f.follower)
          });
        }

        return res.status(400).json({ error: 'Tipo de consulta inválido' });
      } catch (error) {
        console.error('Error fetching follow data:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}