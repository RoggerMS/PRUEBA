import { z } from 'zod';

// Club creation schema for frontend forms
export const createClubFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string().min(1, 'La descripción es requerida').max(1000, 'La descripción no puede exceder 1000 caracteres'),
  category: z.enum([
    'Tecnología',
    'Ciencias',
    'Arte',
    'Deportes',
    'Música',
    'Literatura',
    'Negocios',
    'Idiomas',
    'Voluntariado',
    'Otros'
  ], {
    required_error: 'La categoría es requerida',
    invalid_type_error: 'Categoría inválida'
  }),
  location: z.string().min(1, 'La ubicación es requerida').max(200, 'La ubicación no puede exceder 200 caracteres'),
  meetingDay: z.enum([
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'
  ]).optional(),
  meetingTime: z.string().optional(),
  imageUrl: z.string().url('URL de imagen inválida').optional(),
  coverImage: z.string().url('URL de imagen de portada inválida').optional(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
  maxMembers: z.number().min(1, 'Debe permitir al menos 1 miembro').max(1000, 'No puede exceder 1000 miembros').optional(),
  contact: z.object({
    email: z.string().email('Email inválido').optional(),
    phone: z.string().optional(),
    website: z.string().url('URL de sitio web inválida').optional(),
    social: z.object({
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
    }).optional(),
  }).optional(),
});

// Club filter schema for search and filtering
export const clubFilterSchema = z.object({
  search: z.string().optional(),
  category: z.enum([
    'Tecnología',
    'Ciencias',
    'Arte',
    'Deportes',
    'Música',
    'Literatura',
    'Negocios',
    'Idiomas',
    'Voluntariado',
    'Otros'
  ]).optional(),
  location: z.string().optional(),
  meetingDay: z.enum([
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'
  ]).optional(),
  sortBy: z.enum(['name', 'memberCount', 'rating', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
});

// Club membership schema
export const clubMembershipSchema = z.object({
  clubId: z.string().min(1, 'ID del club es requerido'),
  action: z.enum(['join', 'leave'], {
    required_error: 'Acción requerida',
    invalid_type_error: 'Acción inválida'
  }),
});

// Club rating schema
export const clubRatingSchema = z.object({
  clubId: z.string().min(1, 'ID del club es requerido'),
  rating: z.number().min(1, 'La calificación mínima es 1').max(5, 'La calificación máxima es 5'),
  comment: z.string().max(500, 'El comentario no puede exceder 500 caracteres').optional(),
});

// Types derived from schemas
export type CreateClubFormData = z.infer<typeof createClubFormSchema>;
export type ClubFilterData = z.infer<typeof clubFilterSchema>;
export type ClubMembershipData = z.infer<typeof clubMembershipSchema>;
export type ClubRatingData = z.infer<typeof clubRatingSchema>;