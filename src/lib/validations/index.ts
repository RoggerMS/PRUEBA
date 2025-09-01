// Export all validation schemas and types
export * from './event';
export * from './club';
export * from './user';

// Common validation utilities
import { z } from 'zod';

// Common field validations
export const commonValidations = {
  // Email validation
  email: z.string().email('Email inválido'),
  
  // URL validation
  url: z.string().url('URL inválida'),
  
  // Phone validation (basic)
  phone: z.string().regex(/^[+]?[0-9\s\-\(\)]{10,}$/, 'Número de teléfono inválido'),
  
  // Date validation
  futureDate: z.string().refine((date) => {
    return new Date(date) > new Date();
  }, 'La fecha debe ser futura'),
  
  // Password validation
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  // Text length validations
  shortText: z.string().min(1, 'Este campo es requerido').max(100, 'No puede exceder 100 caracteres'),
  mediumText: z.string().min(1, 'Este campo es requerido').max(500, 'No puede exceder 500 caracteres'),
  longText: z.string().min(1, 'Este campo es requerido').max(1000, 'No puede exceder 1000 caracteres'),
  
  // Number validations
  positiveNumber: z.number().min(1, 'Debe ser un número positivo'),
  percentage: z.number().min(0, 'No puede ser menor a 0').max(100, 'No puede ser mayor a 100'),
  rating: z.number().min(1, 'La calificación mínima es 1').max(5, 'La calificación máxima es 5'),
};

// Validation error formatter
export const formatValidationErrors = (error: z.ZodError) => {
  const errors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return errors;
};

// Safe validation wrapper
export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    return {
      success: true as const,
      data: schema.parse(data),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        data: null,
        errors: formatValidationErrors(error),
      };
    }
    throw error;
  }
};