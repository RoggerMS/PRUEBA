import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const preferenceSchema = z.object({
  type: z.enum(['LIKE', 'COMMENT', 'FOLLOW', 'MENTION', 'MESSAGE', 'SYSTEM', 'ACHIEVEMENT']),
  enabled: z.boolean(),
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  frequency: z.enum(['INSTANT', 'HOURLY', 'DAILY', 'WEEKLY', 'NEVER']),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional()
});

const globalSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string(),
  quietHoursEnd: z.string(),
  weekendQuietMode: z.boolean()
});

const updatePreferencesSchema = z.object({
  preferences: z.array(preferenceSchema.extend({ id: z.string() })),
  globalSettings: globalSettingsSchema
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
        return await getPreferences(req, res, session.user.email);
      case 'PUT':
        return await updatePreferences(req, res, session.user.email);
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error in notification preferences API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function getPreferences(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        notificationPreferences: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Get or create notification preferences
    let preferences = user.notificationPreferences;
    
    if (!preferences || preferences.length === 0) {
      // Create default preferences
      const defaultPreferences = [
        {
          userId: user.id,
          type: 'LIKE' as const,
          enabled: true,
          emailEnabled: false,
          pushEnabled: true,
          frequency: 'INSTANT' as const
        },
        {
          userId: user.id,
          type: 'COMMENT' as const,
          enabled: true,
          emailEnabled: true,
          pushEnabled: true,
          frequency: 'INSTANT' as const
        },
        {
          userId: user.id,
          type: 'FOLLOW' as const,
          enabled: true,
          emailEnabled: true,
          pushEnabled: true,
          frequency: 'INSTANT' as const
        },
        {
          userId: user.id,
          type: 'MENTION' as const,
          enabled: true,
          emailEnabled: true,
          pushEnabled: true,
          frequency: 'INSTANT' as const
        },
        {
          userId: user.id,
          type: 'MESSAGE' as const,
          enabled: true,
          emailEnabled: true,
          pushEnabled: true,
          frequency: 'INSTANT' as const
        },
        {
          userId: user.id,
          type: 'ACHIEVEMENT' as const,
          enabled: true,
          emailEnabled: true,
          pushEnabled: true,
          frequency: 'INSTANT' as const
        },
        {
          userId: user.id,
          type: 'SYSTEM' as const,
          enabled: true,
          emailEnabled: true,
          pushEnabled: false,
          frequency: 'DAILY' as const
        }
      ];

      // Create preferences in database
      await prisma.notificationPreference.createMany({
        data: defaultPreferences
      });

      // Fetch the created preferences
      preferences = await prisma.notificationPreference.findMany({
        where: { userId: user.id }
      });
    }

    // Format preferences for frontend
    const formattedPreferences = preferences.map(pref => ({
      id: pref.id,
      type: pref.type,
      enabled: pref.enabled,
      emailEnabled: pref.emailEnabled,
      pushEnabled: pref.pushEnabled,
      frequency: pref.frequency,
      quietHoursStart: pref.quietHoursStart,
      quietHoursEnd: pref.quietHoursEnd
    }));

    // Global settings (can be stored in user profile or separate table)
    const globalSettings = {
      emailNotifications: user.emailNotifications ?? true,
      pushNotifications: user.pushNotifications ?? true,
      quietHoursEnabled: preferences.some(p => p.quietHoursStart && p.quietHoursEnd),
      quietHoursStart: preferences.find(p => p.quietHoursStart)?.quietHoursStart || '22:00',
      quietHoursEnd: preferences.find(p => p.quietHoursEnd)?.quietHoursEnd || '08:00',
      weekendQuietMode: false // This could be added to user model if needed
    };

    return res.status(200).json({
      preferences: formattedPreferences,
      globalSettings
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    return res.status(500).json({ error: 'Error al obtener preferencias' });
  }
}

async function updatePreferences(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string
) {
  try {
    const validation = updatePreferencesSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const { preferences, globalSettings } = validation.data;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Update global settings in user profile
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailNotifications: globalSettings.emailNotifications,
        pushNotifications: globalSettings.pushNotifications
      }
    });

    // Update notification preferences
    for (const preference of preferences) {
      const quietHours = globalSettings.quietHoursEnabled ? {
        quietHoursStart: globalSettings.quietHoursStart,
        quietHoursEnd: globalSettings.quietHoursEnd
      } : {
        quietHoursStart: null,
        quietHoursEnd: null
      };

      await prisma.notificationPreference.upsert({
        where: {
          userId_type: {
            userId: user.id,
            type: preference.type
          }
        },
        update: {
          enabled: preference.enabled,
          emailEnabled: preference.emailEnabled && globalSettings.emailNotifications,
          pushEnabled: preference.pushEnabled && globalSettings.pushNotifications,
          frequency: preference.frequency,
          ...quietHours
        },
        create: {
          userId: user.id,
          type: preference.type,
          enabled: preference.enabled,
          emailEnabled: preference.emailEnabled && globalSettings.emailNotifications,
          pushEnabled: preference.pushEnabled && globalSettings.pushNotifications,
          frequency: preference.frequency,
          ...quietHours
        }
      });
    }

    return res.status(200).json({
      message: 'Preferencias actualizadas correctamente'
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({ error: 'Error al actualizar preferencias' });
  }
}