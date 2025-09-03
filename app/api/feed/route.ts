import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for creating a new post
const createPostSchema = z
  .object({
    content: z.string().max(2000, 'Content too long').optional(),
    type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'POLL', 'QUESTION', 'NOTE']).default('TEXT'),
    imageUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
    tags: z.string().optional(),
    visibility: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']).default('PUBLIC'),
    hashtags: z.array(z.string()).optional(),
    mentions: z.array(z.string()).optional(),
    mediaIds: z.array(z.string()).optional()
  })
  .refine(
    (data) =>
      (data.content && data.content.trim().length > 0) ||
      (data.mediaIds && data.mediaIds.length > 0),
    {
      message: 'Content or media is required',
      path: ['content']
    }
  )

// Schema for feed query parameters
const feedQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'POLL', 'QUESTION', 'NOTE']).optional(),
  hashtag: z.string().optional(),
  author: z.string().optional(),
  following: z.coerce.boolean().default(false),
  sort: z.enum(['recent', 'popular', 'trending']).default('recent'),
  saved: z.coerce.boolean().default(false)
})

// Helper function to extract hashtags from content
function extractHashtags(content: string): string[] {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g
  const matches = content.match(hashtagRegex)
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : []
}

// Helper function to extract mentions from content
function extractMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g
  const matches = content.match(mentionRegex)
  return matches ? matches.map(mention => mention.slice(1).toLowerCase()) : []
}

// GET /api/feed - Get feed posts with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = feedQuerySchema.parse(Object.fromEntries(searchParams))
    const { page, limit, type, hashtag, author, following, sort, saved } = queryParams
    const skip = (page - 1) * limit

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Build where clause based on filters
    const whereClause: any = {
      AND: [
        // Visibility filter
        {
          OR: [
            { visibility: 'PUBLIC' },
            ...(userId ? [
              { visibility: 'FOLLOWERS', author: { followers: { some: { followerId: userId } } } },
              { visibility: 'PRIVATE', authorId: userId }
            ] : [])
          ]
        }
      ]
    }

    // Type filter
    if (type) {
      whereClause.AND.push({ type })
    }

    // Hashtag filter
    if (hashtag) {
      whereClause.AND.push({
        hashtags: {
          some: {
            hashtag: {
              name: hashtag.toLowerCase()
            }
          }
        }
      })
    }

    // Author filter
    if (author) {
      whereClause.AND.push({
        author: {
          username: author
        }
      })
    }

    // Following filter
    if (following && userId) {
      whereClause.AND.push({
        author: {
          followers: {
            some: {
              followerId: userId
            }
          }
        }
      })
    }

    // Saved posts filter
    if (saved && userId) {
      whereClause.AND.push({
        bookmarks: {
          some: {
            userId
          }
        }
      })
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'popular') {
      orderBy = [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }]
    } else if (sort === 'trending') {
      // Trending: posts with high engagement in last 24 hours
      orderBy = [{ viewCount: 'desc' }, { createdAt: 'desc' }]
    }

    // Get posts with enhanced data
    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy,
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            university: true,
            career: true,
            verified: true
          }
        },
        media: {
          include: {
            media: {
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                mimeType: true,
                width: true,
                height: true,
                duration: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        hashtags: {
          include: {
            hashtag: {
              select: {
                name: true
              }
            }
          }
        },
        mentions: {
          include: {
            mentioned: {
              select: {
                id: true,
                username: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
            shares: true
          }
        },
        // Include user's interactions if logged in
        ...(userId && {
          likes: {
            where: { userId },
            select: { id: true }
          },
          bookmarks: {
            where: { userId },
            select: { id: true }
          },
          reactions: {
            where: { userId },
            select: { type: true }
          }
        })
      }
    })

    // Update view counts for posts
    if (posts.length > 0 && userId) {
      await prisma.post.updateMany({
        where: {
          id: { in: posts.map(p => p.id) },
          authorId: { not: userId } // Don't count author's own views
        },
        data: {
          viewCount: { increment: 1 }
        }
      })
    }

    // Transform posts to include interaction flags and viewerState
    const typeMap: Record<string, string> = {
      TEXT: 'post',
      IMAGE: 'photo',
      VIDEO: 'video',
      QUESTION: 'question',
      NOTE: 'note'
    }
    const visibilityMap: Record<string, string> = {
      PUBLIC: 'public',
      FOLLOWERS: 'friends',
      PRIVATE: 'private'
    }

    const transformedPosts = posts.map(post => ({
      ...post,
      kind: typeMap[post.type] || 'post',
      visibility: visibilityMap[post.visibility] || 'public',
      text: post.content,
      viewerState: {
        fired: userId ? post.likes?.length > 0 : false,
        saved: userId ? post.bookmarks?.length > 0 : false,
        shared: false, // TODO: Implement share tracking
        reaction: userId && post.reactions?.length > 0 ? post.reactions[0].type : null
      },
      stats: {
        fires: post._count.likes,
        comments: post._count.comments,
        saves: post._count.bookmarks,
        shares: post._count.shares,
        views: post.viewCount || 0
      },
      author: {
        ...post.author,
        avatar: post.author.image
      },
      media: post.media.map(pm => pm.media),
      hashtags: post.hashtags.map(ph => ph.hashtag.name),
      mentions: post.mentions.map(pm => pm.mentioned),
      // Remove internal fields
      content: undefined,
      type: undefined,
      likes: undefined,
      bookmarks: undefined,
      reactions: undefined,
      _count: undefined
    }))

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    )
  }
}

// POST /api/feed - Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)
    const { hashtags: providedHashtags, mentions: providedMentions, mediaIds, ...postData } = validatedData

    // Extract hashtags and mentions from content
    const contentHashtags = extractHashtags(postData.content)
    const contentMentions = extractMentions(postData.content)
    
    // Combine provided and extracted hashtags/mentions
    const allHashtags = [...new Set([...(providedHashtags || []), ...contentHashtags])]
    const allMentions = [...new Set([...(providedMentions || []), ...contentMentions])]

    // Create post with transaction to handle related data
    const post = await prisma.$transaction(async (tx) => {
      // Create the post
      const newPost = await tx.post.create({
        data: {
          ...postData,
          authorId: session.user.id
        }
      })

      // Handle hashtags
      if (allHashtags.length > 0) {
        for (const hashtagName of allHashtags) {
          // Create or update hashtag
          const hashtag = await tx.hashtag.upsert({
            where: { name: hashtagName },
            update: { useCount: { increment: 1 } },
            create: { name: hashtagName, useCount: 1 }
          })

          // Link hashtag to post
          await tx.postHashtag.create({
            data: {
              postId: newPost.id,
              hashtagId: hashtag.id
            }
          })
        }
      }

      // Handle mentions
      if (allMentions.length > 0) {
        const mentionedUsers = await tx.user.findMany({
          where: {
            username: { in: allMentions }
          },
          select: { id: true, username: true }
        })

        for (const user of mentionedUsers) {
          await tx.postMention.create({
            data: {
              postId: newPost.id,
              mentionedId: user.id
            }
          })
        }
      }

      // Handle media attachments
      if (mediaIds && mediaIds.length > 0) {
        // Verify media belongs to the user
        const userMedia = await tx.media.findMany({
          where: {
            id: { in: mediaIds },
            uploaderId: session.user.id
          }
        })

        // Create post-media relationships
        for (let i = 0; i < userMedia.length; i++) {
          await tx.postMedia.create({
            data: {
              postId: newPost.id,
              mediaId: userMedia[i].id,
              order: i
            }
          })
        }
      }

      // Return post with all related data
      return await tx.post.findUnique({
        where: { id: newPost.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              university: true,
              career: true,
              verified: true
            }
          },
          media: {
            include: {
              media: {
                select: {
                  id: true,
                  url: true,
                  thumbnailUrl: true,
                  mimeType: true,
                  width: true,
                  height: true,
                  duration: true
                }
              }
            },
            orderBy: { order: 'asc' }
          },
          hashtags: {
            include: {
              hashtag: {
                select: {
                  name: true
                }
              }
            }
          },
          mentions: {
            include: {
              mentioned: {
                select: {
                  id: true,
                  username: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              bookmarks: true,
              shares: true
            }
          }
        }
      })
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    const typeMap: Record<string, string> = {
      TEXT: 'post',
      IMAGE: 'photo',
      VIDEO: 'video',
      QUESTION: 'question',
      NOTE: 'note'
    }
    const visibilityMap: Record<string, string> = {
      PUBLIC: 'public',
      FOLLOWERS: 'friends',
      PRIVATE: 'private'
    }

    return NextResponse.json({
      id: post.id,
      kind: typeMap[post.type] || 'post',
      text: post.content,
      visibility: visibilityMap[post.visibility] || 'public',
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      editedAt: post.editedAt,
      author: {
        ...post.author,
        avatar: post.author.image,
      },
      media: post.media.map(pm => pm.media),
      hashtags: post.hashtags.map(ph => ph.hashtag.name),
      mentions: post.mentions.map(pm => ({
        id: pm.mentioned.id,
        username: pm.mentioned.username,
        name: pm.mentioned.name
      })),
      stats: {
        fires: post._count.likes,
        comments: post._count.comments,
        saves: post._count.bookmarks,
        shares: post._count.shares,
        views: post.viewCount
      },
      viewerState: {
        fired: false,
        saved: false,
        shared: false,
        reaction: null
      }
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}