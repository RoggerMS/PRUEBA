export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required for account deletion'),
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'You must type DELETE to confirm account deletion' })
  })
});

// POST /api/settings/delete-account - Soft delete user account
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { password, confirmation } = deleteAccountSchema.parse(body);

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        status: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if account is already deleted
    if (user.status === 'DELETED') {
      return NextResponse.json(
        { error: 'Account is already deleted' },
        { status: 400 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: 'No password set for this account' },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 400 }
      );
    }

    // Perform soft delete - update user status and anonymize data
    const deletedAt = new Date();
    const anonymizedEmail = `deleted_${user.id}@deleted.local`;
    const anonymizedUsername = `deleted_${user.id}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        status: 'DELETED',
        email: anonymizedEmail,
        username: anonymizedUsername,
        name: 'Deleted User',
        bio: null,
        location: null,
        university: null,
        major: null,
        website: null,
        image: null,
        isPrivate: true,
        allowMessages: false,
        emailNotifications: false,
        pushNotifications: false,
        forumNotifications: false,
        showAchievements: false,
        showActivity: false,
        updatedAt: deletedAt
      }
    });

    // Note: We keep posts and comments for content integrity,
    // but they will show as "Deleted User" due to the name change
    // In a production environment, you might want to:
    // 1. Delete or anonymize posts/comments
    // 2. Remove from follows/followers
    // 3. Clear bookmarks and likes
    // 4. Send deletion confirmation email
    // 5. Log the deletion for audit purposes

    return NextResponse.json({
      success: true,
      message: 'Account has been successfully deleted'
    });

  } catch (error) {
    console.error('Delete account error:', error);
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