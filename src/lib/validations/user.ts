import { z } from 'zod';

// User profile update schema
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z.string().email('Email inválido'),
  bio: z.string().max(500, 'La biografía no puede exceder 500 caracteres').optional(),
  image: z.string().url('URL de imagen inválida').optional(),
  university: z.string().max(200, 'El nombre de la universidad no puede exceder 200 caracteres').optional(),
  major: z.string().max(100, 'La carrera no puede exceder 100 caracteres').optional(),
  graduationYear: z.number().min(1900, 'Año de graduación inválido').max(2050, 'Año de graduación inválido').optional(),
  interests: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  social: z.object({
    linkedin: z.string().url('URL de LinkedIn inválida').optional().or(z.literal('')),
    github: z.string().url('URL de GitHub inválida').optional().or(z.literal('')),
    twitter: z.string().url('URL de Twitter inválida').optional().or(z.literal('')),
    website: z.string().url('URL de sitio web inválida').optional().or(z.literal('')),
  }).optional(),
  preferences: z.object({
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    eventReminders: z.boolean().default(true),
    clubUpdates: z.boolean().default(true),
    marketingEmails: z.boolean().default(false),
  }).optional(),
});

// Password change schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// User search/filter schema
export const userFilterSchema = z.object({
  search: z.string().optional(),
  university: z.string().optional(),
  major: z.string().optional(),
  graduationYear: z.number().optional(),
  interests: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  sortBy: z.enum(['name', 'crolars', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(1, 'El asunto es requerido').max(200, 'El asunto no puede exceder 200 caracteres'),
  message: z.string().min(1, 'El mensaje es requerido').max(1000, 'El mensaje no puede exceder 1000 caracteres'),
  category: z.enum([
    'Soporte técnico',
    'Sugerencia',
    'Reporte de error',
    'Consulta general',
    'Otro'
  ], {
    required_error: 'La categoría es requerida',
    invalid_type_error: 'Categoría inválida'
  }),
});

// Feedback schema
export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'other'], {
    required_error: 'El tipo de feedback es requerido',
    invalid_type_error: 'Tipo de feedback inválido'
  }),
  title: z.string().min(1, 'El título es requerido').max(100, 'El título no puede exceder 100 caracteres'),
  description: z.string().min(1, 'La descripción es requerida').max(1000, 'La descripción no puede exceder 1000 caracteres'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  attachments: z.array(z.string().url()).optional(),
});

// Types derived from schemas
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UserFilterData = z.infer<typeof userFilterSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type FeedbackData = z.infer<typeof feedbackSchema>;