import { z } from 'zod';

// Event creation schema for frontend forms
export const createEventFormSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título no puede exceder 100 caracteres'),
  description: z.string().min(1, 'La descripción es requerida').max(1000, 'La descripción no puede exceder 1000 caracteres'),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().optional(),
  location: z.string().optional(),
  isOnline: z.boolean().default(false),
  category: z.enum([
    'Conferencia',
    'Taller',
    'Seminario',
    'Hackathon',
    'Networking',
    'Competencia',
    'Curso',
    'Webinar'
  ], {
    required_error: 'La categoría es requerida',
    invalid_type_error: 'Categoría inválida'
  }),
  tags: z.array(z.string()).default([]),
  maxAttendees: z.number().min(1, 'Debe permitir al menos 1 asistente').max(1000, 'No puede exceder 1000 asistentes'),
  imageUrl: z.string().url('URL de imagen inválida').optional(),
  clubId: z.string().optional(),
}).refine((data) => {
  if (!data.isOnline && !data.location) {
    return false;
  }
  return true;
}, {
  message: 'La ubicación es requerida para eventos presenciales',
  path: ['location']
}).refine((data) => {
  if (data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate']
}).refine((data) => {
  const startDate = new Date(data.startDate);
  return startDate > new Date();
}, {
  message: 'El evento debe programarse para el futuro',
  path: ['startDate']
});

// Event filter schema for search and filtering
export const eventFilterSchema = z.object({
  search: z.string().optional(),
  category: z.enum([
    'Conferencia',
    'Taller',
    'Seminario',
    'Hackathon',
    'Networking',
    'Competencia',
    'Curso',
    'Webinar'
  ]).optional(),
  isOnline: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['date', 'title', 'popularity']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
});

// Event registration schema
export const eventRegistrationSchema = z.object({
  eventId: z.string().min(1, 'ID del evento es requerido'),
  action: z.enum(['register', 'unregister'], {
    required_error: 'Acción requerida',
    invalid_type_error: 'Acción inválida'
  }),
});

// Comment schema
export const eventCommentSchema = z.object({
  eventId: z.string().min(1, 'ID del evento es requerido'),
  content: z.string().min(1, 'El comentario no puede estar vacío').max(500, 'El comentario no puede exceder 500 caracteres'),
});

// Types derived from schemas
export type CreateEventFormData = z.infer<typeof createEventFormSchema>;
export type EventFilterData = z.infer<typeof eventFilterSchema>;
export type EventRegistrationData = z.infer<typeof eventRegistrationSchema>;
export type EventCommentData = z.infer<typeof eventCommentSchema>;