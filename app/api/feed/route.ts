import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FeedPost, FeedResponse, CreatePostData, FeedRanking } from '@/types/feed';
import { z } from 'zod';

// Marcar como ruta dinámica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Validation schemas
const createPostSchema = z.object({
  kind: z.enum(['post', 'photo', 'video', 'question', 'note']),
  text: z.string().optional(),
  visibility: z.enum(['public', 'university', 'followers']),
  hashtags: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string()).optional(),
});

const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  ranking: z.enum(['home', 'recent', 'saved', 'trending']).default('home'),
  kind: z.enum(['post', 'photo', 'video', 'question', 'note']).optional(),
  author: z.string().optional(),
  hashtag: z.string().optional(),
});

// GET /api/feed - Fetch feed posts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const query = feedQuerySchema.parse(Object.fromEntries(searchParams));

    // Build where clause based on filters
    const whereClause: any = {};

    // Visibility filter based on user's access level
    if (!userId) {
      // Only public posts for unauthenticated users
      whereClause.visibility = 'PUBLIC';
    } else {
      const orFilters: any[] = [
        { visibility: 'PUBLIC' },
        // User's own posts
        { authorId: userId }
      ];

      // Friends-only posts where the user follows the author
      orFilters.push({
        visibility: 'FRIENDS',
        author: {
          followers: {
            some: { followerId: userId }
          }
        }
      });

      // University-only posts (only if we know user's university)
      const userUniversity = (session?.user as any)?.university;
      if (userUniversity) {
        orFilters.push({
          visibility: 'UNIVERSITY',
          author: { university: userUniversity }
        });
      }

      whereClause.OR = orFilters;
    }

    // Apply additional filters
    if (query.kind) {
      const kindToPostType: Record<string, 'TEXT' | 'IMAGE' | 'VIDEO' | 'QUESTION'> = {
        post: 'TEXT',
        photo: 'IMAGE',
        video: 'VIDEO',
        question: 'QUESTION',
        // Map notes to TEXT posts for now
        note: 'TEXT',
      };
      whereClause.type = kindToPostType[query.kind];
    }

    if (query.author) {
      // Filter by author's username
      whereClause.author = { is: { username: query.author } };
    }

    if (query.hashtag) {
      // Our schema stores tags as a comma-separated string; use contains
      whereClause.tags = {
        contains: query.hashtag.toLowerCase()
      };
    }

    // Cursor pagination
    if (query.cursor) {
      whereClause.id = {
        lt: query.cursor
      };
    }

    // Determine order by ranking
    let orderBy: any = { createdAt: 'desc' };
    if (query.ranking === 'trending') {
      // Simple trending algorithm based on recent engagement
      orderBy = [
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
        { createdAt: 'desc' }
      ];
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy,
      take: query.limit + 1, // Take one extra to check if there are more
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true
          }
        },
        // Only include user-specific relations when authenticated
        ...(userId ? {
          likes: {
            where: { userId },
            select: { id: true }
          },
          bookmarks: {
            where: { userId },
            select: { id: true }
          }
        } : {}),
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true
          }
        }
      }
    });

    const hasMore = posts.length > query.limit;
    const feedPosts = posts.slice(0, query.limit);
    const nextCursor = hasMore ? feedPosts[feedPosts.length - 1]?.id : undefined;

    // Transform to FeedPost format
    const postTypeToKind = (t: string): FeedPost['kind'] => {
      switch (t) {
        case 'IMAGE':
          return 'photo';
        case 'VIDEO':
          return 'video';
        case 'QUESTION':
          return 'question';
        case 'TEXT':
        default:
          return 'post';
      }
    };

    const mapVisibility = (v: string) => {
      switch (v) {
        case 'university':
          return 'UNIVERSITY';
        case 'followers':
          return 'FOLLOWERS';
        case 'private':
          return 'PRIVATE';
        case 'public':
        default:
          return 'PUBLIC';
      }
    };

    const toVisibilityLevel = (v: string): FeedPost['visibility'] => {
      switch (v) {
        case 'UNIVERSITY':
          return 'university';
        case 'FRIENDS':
          return 'friends';
        case 'PRIVATE':
          return 'private';
        case 'PUBLIC':
        default:
          return 'public';
      }
    };

    const transformedPosts: FeedPost[] = feedPosts.map((post: any) => ({
      id: post.id,
      kind: postTypeToKind(post.type),
      author: {
        id: post.author.id,
        name: post.author.name || '',
        username: post.author.username,
        avatar: post.author.image || undefined,
        verified: post.author.verified,
      },
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt?.toISOString(),
      text: post.content || undefined,
      media: post.imageUrl || post.videoUrl ? [{
        id: '1',
        type: post.imageUrl ? 'image' : 'video',
        url: post.imageUrl || post.videoUrl!,
        name: post.imageUrl ? 'image' : 'video'
      }] : undefined,
      visibility: toVisibilityLevel(post.visibility),
      hashtags: post.tags || undefined,
      stats: {
        fires: post._count.likes,
        comments: post._count.comments,
        shares: 0,
        saves: post._count.bookmarks,
        views: 0
      },
      viewerState: {
        fired: userId ? (post.likes?.length ?? 0) > 0 : false,
        saved: userId ? (post.bookmarks?.length ?? 0) > 0 : false,
        shared: false
      }
    }));

    const response: FeedResponse = {
      posts: transformedPosts,
      nextCursor,
      hasMore
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Feed GET error:', error);
    const empty: FeedResponse = { posts: [], nextCursor: undefined, hasMore: false };
    return NextResponse.json(empty, { status: 200 });
  }
}

// POST /api/feed - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle FormData for file uploads
    const formData = await request.formData();
    
    // Extract fields from FormData
    const kind = formData.get('kind') as string;
    const text = formData.get('text') as string || '';
    const visibility = formData.get('visibility') as string;
    const hashtagsStr = formData.get('hashtags') as string;
    
    const hashtags = hashtagsStr ? JSON.parse(hashtagsStr) : [];
    
    // Extract media files
    const mediaFiles: File[] = [];
    let index = 0;
    while (formData.has(`media_${index}`)) {
      const file = formData.get(`media_${index}`) as File;
      if (file && file.size > 0) {
        mediaFiles.push(file);
      }
      index++;
    }
    
    // Validate required fields
    if (!kind || !['post', 'photo', 'video', 'question', 'note'].includes(kind)) {
      return NextResponse.json({ error: 'Invalid or missing kind' }, { status: 400 });
    }
    
    if (!visibility || !['public', 'university', 'followers'].includes(visibility)) {
      return NextResponse.json({ error: 'Invalid or missing visibility' }, { status: 400 });
    }
    
    // Process uploaded files (for now, we'll store them as base64 or use a simple file storage)
    const mediaUrls: string[] = [];
    
    for (const file of mediaFiles) {
      try {
        // Convert file to base64 for simple storage (in production, use cloud storage)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const mimeType = file.type;
        const dataUrl = `data:${mimeType};base64,${base64}`;
        mediaUrls.push(dataUrl);
      } catch (error) {
        console.error('Error processing file:', error);
        // Continue with other files
      }
    }
    
    // Validate the extracted data
    const validatedData = createPostSchema.parse({
      kind,
      text,
      visibility,
      hashtags,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    });

    // Extract hashtags from text
    const allHashtags = validatedData.hashtags || [];
    if (validatedData.text) {
      const textHashtags = validatedData.text.match(/#[\w\u00c0-\u024f\u1e00-\u1eff]+/g) || [];
      allHashtags.push(...textHashtags.map(tag => tag.slice(1).toLowerCase()));
    }

    // Determine post type based on kind and media
    let postType = 'TEXT';
    if (validatedData.kind === 'photo' || (mediaUrls.length > 0 && mediaUrls[0].startsWith('data:image'))) {
      postType = 'IMAGE';
    } else if (validatedData.kind === 'video' || (mediaUrls.length > 0 && mediaUrls[0].startsWith('data:video'))) {
      postType = 'VIDEO';
    } else if (validatedData.kind === 'question') {
      postType = 'QUESTION';
    }
    
    // Map visibility from frontend to database format
    const mapVisibility = (v: string) => {
      switch (v) {
        case 'university':
          return 'UNIVERSITY';
        case 'followers':
          return 'FRIENDS';
        case 'private':
          return 'PRIVATE';
        case 'public':
        default:
          return 'PUBLIC';
      }
    };

    // Create the post in the database
    const newPost = await prisma.post.create({
      data: {
        content: validatedData.text || '',
        type: postType as any,
        imageUrl: mediaUrls.find(url => url.startsWith('data:image/')) || null,
        videoUrl: mediaUrls.find(url => url.startsWith('data:video/')) || null,
        tags: JSON.stringify([...new Set(allHashtags)]),
        visibility: mapVisibility(validatedData.visibility),
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            university: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        }
      }
    });

    // Transform to FeedPost format
    const postTypeToKind = (t: string): FeedPost['kind'] => {
      switch (t) {
        case 'IMAGE':
          return 'photo';
        case 'VIDEO':
          return 'video';
        case 'QUESTION':
          return 'question';
        case 'TEXT':
        default:
          return 'post';
      }
    };
    
    const toVisibilityLevel = (v: string): FeedPost['visibility'] => {
      switch (v) {
        case 'UNIVERSITY':
          return 'university';
        case 'FRIENDS':
          return 'friends';
        case 'PRIVATE':
          return 'private';
        case 'PUBLIC':
        default:
          return 'public';
      }
    };
    
    const feedPost: FeedPost = {
      id: newPost.id,
      kind: postTypeToKind(newPost.type),
      author: {
        id: session.user.id,
        name: session.user.name || '',
        username: session.user.name || '',
        avatar: session.user.image || undefined,
        verified: false,
      },
      createdAt: newPost.createdAt.toISOString(),
      text: newPost.content || undefined,
      media: newPost.imageUrl || newPost.videoUrl ? [{
        id: '1',
        type: newPost.imageUrl ? 'image' : 'video',
        url: newPost.imageUrl || newPost.videoUrl!,
        name: newPost.imageUrl ? 'image' : 'video'
      }] : undefined,
      visibility: toVisibilityLevel(newPost.visibility),
      hashtags: newPost.tags ? JSON.parse(newPost.tags) : undefined,
      stats: {
        fires: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        views: 0
      },
      viewerState: {
        fired: false,
        saved: false,
        shared: false
      }
    };

    return NextResponse.json(feedPost, { status: 201 });
  } catch (error) {
    console.error('Feed POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
