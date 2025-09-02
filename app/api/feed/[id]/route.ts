import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/feed/[id] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            university: true,
            career: true,
            verified: true,
          },
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
                duration: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        hashtags: {
          include: {
            hashtag: { select: { name: true } },
          },
        },
        mentions: {
          include: {
            mentioned: {
              select: { id: true, username: true, name: true },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
            shares: true,
          },
        },
        ...(userId && {
          likes: { where: { userId }, select: { id: true } },
          bookmarks: { where: { userId }, select: { id: true } },
          reactions: { where: { userId }, select: { type: true } },
        }),
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const typeMap: Record<string, string> = {
      TEXT: 'post',
      IMAGE: 'photo',
      VIDEO: 'video',
      QUESTION: 'question',
      NOTE: 'note',
    }
    const visibilityMap: Record<string, string> = {
      PUBLIC: 'public',
      FOLLOWERS: 'friends',
      PRIVATE: 'private',
    }

    const transformedPost = {
      ...post,
      kind: typeMap[post.type] || 'post',
      visibility: visibilityMap[post.visibility] || 'public',
      text: post.content,
      viewerState: {
        fired: userId ? post.likes?.length > 0 : false,
        saved: userId ? post.bookmarks?.length > 0 : false,
        shared: false,
        reaction: userId && post.reactions?.length > 0 ? post.reactions[0].type : null,
      },
      stats: {
        fires: post._count.likes,
        comments: post._count.comments,
        saves: post._count.bookmarks,
        shares: post._count.shares,
        views: post.viewCount || 0,
      },
      author: {
        ...post.author,
        avatar: post.author.image,
      },
      media: post.media.map(pm => pm.media),
      hashtags: post.hashtags.map(ph => ph.hashtag.name),
      mentions: post.mentions.map(pm => pm.mentioned),
      content: undefined,
      type: undefined,
      likes: undefined,
      bookmarks: undefined,
      reactions: undefined,
      _count: undefined,
    } as any;

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
