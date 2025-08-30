import { initializeGamificationWorker } from './gamification-worker';
import { getNotificationService } from './notification-service';

// Función para inicializar todos los servicios de la aplicación
export function initializeApp(): void {
  console.log('[App] Initializing application services...');
  
  try {
    // Inicializar el worker de gamificación
    initializeGamificationWorker();
    console.log('[App] Gamification worker initialized');
    
    // Inicializar el servicio de notificaciones
    const notificationService = getNotificationService();
    console.log('[App] Notification service initialized');
    
    console.log('[App] All services initialized successfully');
  } catch (error) {
    console.error('[App] Error initializing services:', error);
    throw error;
  }
}

// Función para limpiar recursos al cerrar la aplicación
export function shutdownApp(): void {
  console.log('[App] Shutting down application services...');
  
  try {
    // Aquí se pueden agregar más limpiezas si es necesario
    console.log('[App] All services shut down successfully');
  } catch (error) {
    console.error('[App] Error shutting down services:', error);
  }
}

// Auto-inicializar en desarrollo
if (process.env.NODE_ENV === 'development') {
  initializeApp();
}