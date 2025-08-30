export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Validation schemas
const updateSettingsSchema = z.object({
  // General settings
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  university: z.string().max(100).optional(),
  career: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  
  // Privacy settings
  isPrivate: z.boolean().optional(),
  showAchievements: z.boolean().optional(),
  showActivity: z.boolean().optional(),
  allowMessages: z.boolean().optional(),
  
  // Notification settings
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  forumNotifications: z.boolean().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// GET /api/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        location: true,
        university: true,
        career: true,
        website: true,
        image: true,
        isPrivate: true,
        showAchievements: true,
        showActivity: true,
        allowMessages: true,
        emailNotifications: true,
        pushNotifications: true,
        forumNotifications: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      general: {
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        university: user.university || '',
        career: user.career || '',
        website: user.website || '',
        avatar: user.image || '/default-avatar.png',
        joinDate: user.createdAt.toISOString()
      },
      privacy: {
        isPrivate: user.isPrivate || false,
        showAchievements: user.showAchievements ?? true,
        showActivity: user.showActivity ?? true,
        allowMessages: user.allowMessages ?? true
      },
      notifications: {
        emailNotifications: user.emailNotifications ?? true,
        pushNotifications: user.pushNotifications ?? true,
        forumNotifications: user.forumNotifications ?? true
      }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = updateSettingsSchema.parse(body);

    // Check if username is already taken (if username is being updated)
    if (data.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: data.username,
          id: { not: session.user.id }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Update user settings
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.username !== undefined && { username: data.username }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.university !== undefined && { university: data.university }),
        ...(data.career !== undefined && { career: data.career }),
        ...(data.website !== undefined && { website: data.website || null }),
        ...(data.isPrivate !== undefined && { isPrivate: data.isPrivate }),
        ...(data.showAchievements !== undefined && { showAchievements: data.showAchievements }),
        ...(data.showActivity !== undefined && { showActivity: data.showActivity }),
        ...(data.allowMessages !== undefined && { allowMessages: data.allowMessages }),
        ...(data.emailNotifications !== undefined && { emailNotifications: data.emailNotifications }),
        ...(data.pushNotifications !== undefined && { pushNotifications: data.pushNotifications }),
        ...(data.forumNotifications !== undefined && { forumNotifications: data.forumNotifications })
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        location: true,
        university: true,
        career: true,
        website: true,
        image: true,
        isPrivate: true,
        showAchievements: true,
        showActivity: true,
        allowMessages: true,
        emailNotifications: true,
        pushNotifications: true,
        forumNotifications: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        general: {
          name: updatedUser.name || '',
          username: updatedUser.username || '',
          email: updatedUser.email || '',
          bio: updatedUser.bio || '',
          location: updatedUser.location || '',
          university: updatedUser.university || '',
          career: updatedUser.career || '',
          website: updatedUser.website || '',
          avatar: updatedUser.image || '/default-avatar.png',
          joinDate: updatedUser.createdAt.toISOString()
        },
        privacy: {
          isPrivate: updatedUser.isPrivate || false,
          showAchievements: updatedUser.showAchievements ?? true,
          showActivity: updatedUser.showActivity ?? true,
          allowMessages: updatedUser.allowMessages ?? true
        },
        notifications: {
          emailNotifications: updatedUser.emailNotifications ?? true,
          pushNotifications: updatedUser.pushNotifications ?? true,
          forumNotifications: updatedUser.forumNotifications ?? true
        }
      }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}