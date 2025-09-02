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

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            notificationPreferences: true,
            userVerification: true,
            userAnalytics: true,
            followers: {
              include: {
                follower: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true
                  }
                }
              }
            },
            following: {
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
            },
            posts: {
              select: {
                id: true,
                createdAt: true
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 10
            }
          }
        });

        if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Calculate profile completion percentage
        const profileFields = [
          user.name,
          user.bio,
          user.location,
          user.university,
          user.major,
          user.image,
          user.website
        ];
        const completedFields = profileFields.filter(field => field && field.trim() !== '').length;
        const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

        const profileData = {
          ...user,
          profileCompletion,
          stats: {
            followers: user.followers.length,
            following: user.following.length,
            posts: user.posts.length
          }
        };

        return res.status(200).json(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    case 'PUT':
      try {
        const {
          name,
          bio,
          location,
          university,
          major,
          website,
          socialLinks,
          privacySettings
        } = req.body;

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            name,
            bio,
            location,
            university,
            major,
            website,
            socialLinks: socialLinks ? JSON.stringify(socialLinks) : undefined,
            privacySettings: privacySettings ? JSON.stringify(privacySettings) : undefined,
            updatedAt: new Date()
          },
          include: {
            notificationPreferences: true,
            userVerification: true,
            userAnalytics: true
          }
        });

        return res.status(200).json(updatedUser);
      } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}