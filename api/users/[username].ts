import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username requerido' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const session = await getServerSession(req, res, authOptions);
        const currentUserId = session?.user?.id;

        const user = await prisma.user.findUnique({
          where: { username },
          include: {
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
              where: {
                // Only show public posts or posts from followed users
                OR: [
                  { isPublic: true },
                  currentUserId ? {
                    author: {
                      followers: {
                        some: {
                          followerId: currentUserId
                        }
                      }
                    }
                  } : {}
                ]
              },
              select: {
                id: true,
                content: true,
                mediaUrls: true,
                createdAt: true,
                likes: {
                  select: {
                    id: true,
                    userId: true
                  }
                },
                comments: {
                  select: {
                    id: true
                  }
                },
                shares: {
                  select: {
                    id: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 20
            }
          }
        });

        if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Check if current user is following this user
        let isFollowing = false;
        if (currentUserId) {
          const followRelation = await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: user.id
              }
            }
          });
          isFollowing = !!followRelation;
        }

        // Parse privacy settings
        const privacySettings = user.privacySettings 
          ? JSON.parse(user.privacySettings as string)
          : {
              showEmail: false,
              showPhone: false,
              showActivity: true,
              showFollowers: true,
              allowMessages: true
            };

        // Filter sensitive information based on privacy settings
        const publicProfile = {
          id: user.id,
          name: user.name,
          username: user.username,
          image: user.image,
          bio: user.bio,
          location: user.location,
          university: user.university,
          major: user.major,
          website: user.website,
          createdAt: user.createdAt,
          isVerified: user.userVerification?.emailVerified || false,
          socialLinks: user.socialLinks ? JSON.parse(user.socialLinks as string) : {},
          isFollowing,
          stats: {
            followers: privacySettings.showFollowers ? user.followers.length : null,
            following: privacySettings.showFollowers ? user.following.length : null,
            posts: user.posts.length
          },
          posts: user.posts.map(post => ({
            ...post,
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
            sharesCount: post.shares.length,
            isLiked: currentUserId ? post.likes.some(like => like.userId === currentUserId) : false
          })),
          canMessage: privacySettings.allowMessages,
          lastActive: privacySettings.showActivity ? user.userAnalytics?.lastActiveAt : null
        };

        // Update profile views if viewing someone else's profile
        if (currentUserId && currentUserId !== user.id) {
          await prisma.userAnalytics.upsert({
            where: { userId: user.id },
            update: {
              profileViews: {
                increment: 1
              }
            },
            create: {
              userId: user.id,
              profileViews: 1,
              postsViews: 0,
              engagementScore: 0.0
            }
          });
        }

        return res.status(200).json(publicProfile);
      } catch (error) {
        console.error('Error fetching public profile:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}