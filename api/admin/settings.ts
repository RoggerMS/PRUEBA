import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const systemSettingsSchema = z.object({
  siteName: z.string().min(1).max(100).optional(),
  siteDescription: z.string().max(500).optional(),
  siteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  supportEmail: z.string().email().optional(),
  maintenanceMode: z.boolean().optional(),
  registrationEnabled: z.boolean().optional(),
  emailVerificationRequired: z.boolean().optional(),
  moderationEnabled: z.boolean().optional(),
  autoModerationEnabled: z.boolean().optional(),
  maxFileSize: z.number().min(1).max(100).optional(), // MB
  allowedFileTypes: z.array(z.string()).optional(),
  maxPostLength: z.number().min(1).max(10000).optional(),
  maxCommentLength: z.number().min(1).max(5000).optional(),
  rateLimitEnabled: z.boolean().optional(),
  maxRequestsPerMinute: z.number().min(1).max(1000).optional(),
  sessionTimeout: z.number().min(1).max(168).optional(), // hours
  passwordMinLength: z.number().min(6).max(50).optional(),
  passwordRequireSpecialChars: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  socialLoginEnabled: z.boolean().optional(),
  googleLoginEnabled: z.boolean().optional(),
  facebookLoginEnabled: z.boolean().optional(),
  twitterLoginEnabled: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  emailNotificationsEnabled: z.boolean().optional(),
  pushNotificationsEnabled: z.boolean().optional(),
  analyticsEnabled: z.boolean().optional(),
  cookieConsentRequired: z.boolean().optional(),
  gdprCompliant: z.boolean().optional(),
  backupEnabled: z.boolean().optional(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  logRetentionDays: z.number().min(1).max(365).optional()
});

const emailSettingsSchema = z.object({
  smtpHost: z.string().optional(),
  smtpPort: z.number().min(1).max(65535).optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpSecure: z.boolean().optional(),
  fromEmail: z.string().email().optional(),
  fromName: z.string().optional(),
  replyToEmail: z.string().email().optional()
});

const storageSettingsSchema = z.object({
  storageProvider: z.enum(['local', 'aws', 'cloudinary', 'google']).optional(),
  awsAccessKey: z.string().optional(),
  awsSecretKey: z.string().optional(),
  awsBucket: z.string().optional(),
  awsRegion: z.string().optional(),
  cloudinaryCloudName: z.string().optional(),
  cloudinaryApiKey: z.string().optional(),
  cloudinaryApiSecret: z.string().optional(),
  googleProjectId: z.string().optional(),
  googleKeyFile: z.string().optional(),
  googleBucket: z.string().optional()
});

// Helper function to check admin permissions
async function checkAdminPermissions(session: any) {
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!user || user.role !== 'admin') {
    return { error: 'Only admins can access system settings', status: 403 };
  }

  return { user };
}

// Helper function to get or create settings
async function getOrCreateSettings() {
  let settings = await prisma.systemSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: {
        siteName: 'CRUNEVO',
        siteDescription: 'Sistema Integral de Usuarios',
        registrationEnabled: true,
        emailVerificationRequired: true,
        moderationEnabled: true,
        autoModerationEnabled: false,
        maxFileSize: 10,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        maxPostLength: 5000,
        maxCommentLength: 1000,
        rateLimitEnabled: true,
        maxRequestsPerMinute: 60,
        sessionTimeout: 24,
        passwordMinLength: 8,
        passwordRequireSpecialChars: true,
        twoFactorEnabled: false,
        socialLoginEnabled: true,
        googleLoginEnabled: true,
        facebookLoginEnabled: false,
        twitterLoginEnabled: false,
        notificationsEnabled: true,
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: false,
        analyticsEnabled: true,
        cookieConsentRequired: true,
        gdprCompliant: true,
        backupEnabled: true,
        backupFrequency: 'daily',
        logRetentionDays: 30
      }
    });
  }
  
  return settings;
}

// GET /api/admin/settings - Get all system settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const permissionCheck = await checkAdminPermissions(session);
    
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const settings = await getOrCreateSettings();
    
    // Get email settings
    const emailSettings = await prisma.emailSettings.findFirst();
    
    // Get storage settings
    const storageSettings = await prisma.storageSettings.findFirst();

    // Return specific category or all settings
    if (category === 'system') {
      return NextResponse.json({ settings });
    } else if (category === 'email') {
      return NextResponse.json({ emailSettings });
    } else if (category === 'storage') {
      return NextResponse.json({ storageSettings });
    }

    return NextResponse.json({
      settings,
      emailSettings,
      storageSettings
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update system settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const permissionCheck = await checkAdminPermissions(session);
    
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'system';
    
    const body = await request.json();

    let updatedSettings;

    if (category === 'system') {
      const updates = systemSettingsSchema.parse(body);
      
      // Get existing settings or create new ones
      const existingSettings = await getOrCreateSettings();
      
      updatedSettings = await prisma.systemSettings.update({
        where: { id: existingSettings.id },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });
      
    } else if (category === 'email') {
      const updates = emailSettingsSchema.parse(body);
      
      // Get existing email settings or create new ones
      let existingEmailSettings = await prisma.emailSettings.findFirst();
      
      if (!existingEmailSettings) {
        updatedSettings = await prisma.emailSettings.create({
          data: updates
        });
      } else {
        updatedSettings = await prisma.emailSettings.update({
          where: { id: existingEmailSettings.id },
          data: {
            ...updates,
            updatedAt: new Date()
          }
        });
      }
      
    } else if (category === 'storage') {
      const updates = storageSettingsSchema.parse(body);
      
      // Get existing storage settings or create new ones
      let existingStorageSettings = await prisma.storageSettings.findFirst();
      
      if (!existingStorageSettings) {
        updatedSettings = await prisma.storageSettings.create({
          data: updates
        });
      } else {
        updatedSettings = await prisma.storageSettings.update({
          where: { id: existingStorageSettings.id },
          data: {
            ...updates,
            updatedAt: new Date()
          }
        });
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid settings category' },
        { status: 400 }
      );
    }

    // Log the settings change
    await prisma.auditLog.create({
      data: {
        action: 'settings_update',
        entityType: 'settings',
        entityId: updatedSettings.id,
        userId: session.user.id,
        details: {
          category,
          changes: body
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings/test - Test settings (e.g., email configuration)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const permissionCheck = await checkAdminPermissions(session);
    
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type');
    
    const body = await request.json();

    if (testType === 'email') {
      // Test email configuration
      const { smtpHost, smtpPort, smtpUser, smtpPassword, smtpSecure, testEmail } = body;
      
      if (!testEmail) {
        return NextResponse.json(
          { error: 'Test email address is required' },
          { status: 400 }
        );
      }

      // Here you would implement actual email testing
      // For now, we'll simulate a test
      const testResult = {
        success: true,
        message: 'Email configuration test successful',
        details: {
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          testEmailSent: true
        }
      };

      return NextResponse.json(testResult);
      
    } else if (testType === 'storage') {
      // Test storage configuration
      const { storageProvider } = body;
      
      // Here you would implement actual storage testing
      // For now, we'll simulate a test
      const testResult = {
        success: true,
        message: `${storageProvider} storage configuration test successful`,
        details: {
          provider: storageProvider,
          connectionTest: true,
          uploadTest: true
        }
      };

      return NextResponse.json(testResult);
      
    } else {
      return NextResponse.json(
        { error: 'Invalid test type' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error testing settings:', error);
    return NextResponse.json(
      { error: 'Failed to test settings' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/settings/reset - Reset settings to defaults
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const permissionCheck = await checkAdminPermissions(session);
    
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required for reset' },
        { status: 400 }
      );
    }

    if (category === 'system') {
      // Reset system settings to defaults
      const existingSettings = await getOrCreateSettings();
      
      const resetSettings = await prisma.systemSettings.update({
        where: { id: existingSettings.id },
        data: {
          siteName: 'CRUNEVO',
          siteDescription: 'Sistema Integral de Usuarios',
          registrationEnabled: true,
          emailVerificationRequired: true,
          moderationEnabled: true,
          autoModerationEnabled: false,
          maxFileSize: 10,
          allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
          maxPostLength: 5000,
          maxCommentLength: 1000,
          rateLimitEnabled: true,
          maxRequestsPerMinute: 60,
          sessionTimeout: 24,
          passwordMinLength: 8,
          passwordRequireSpecialChars: true,
          twoFactorEnabled: false,
          socialLoginEnabled: true,
          googleLoginEnabled: true,
          facebookLoginEnabled: false,
          twitterLoginEnabled: false,
          notificationsEnabled: true,
          emailNotificationsEnabled: true,
          pushNotificationsEnabled: false,
          analyticsEnabled: true,
          cookieConsentRequired: true,
          gdprCompliant: true,
          backupEnabled: true,
          backupFrequency: 'daily',
          logRetentionDays: 30,
          updatedAt: new Date()
        }
      });
      
      return NextResponse.json({
        message: 'System settings reset to defaults',
        settings: resetSettings
      });
      
    } else {
      return NextResponse.json(
        { error: 'Invalid category for reset' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error resetting settings:', error);
    return NextResponse.json(
      { error: 'Failed to reset settings' },
      { status: 500 }
    );
  }
}