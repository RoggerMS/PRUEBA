import { EventEmitter } from 'events';

// Tipos de eventos de gamificación
export interface GamificationEvents {
  'post_created': { userId: string; postId: string };
  'user_followed': { userId: string; followedUserId: string };
  'user_gained_follower': { userId: string; followerId: string };
  'level_reached': { userId: string; level: number };
  'comment_created': { userId: string; commentId: string; postId: string };
  'like_given': { userId: string; postId: string };
  'profile_updated': { userId: string };
  'login_streak': { userId: string; streakDays: number };
  'badge_earned': { userId: string; badgeId: string };
}

// Event Bus singleton para gamificación
class GamificationEventBus extends EventEmitter {
  private static instance: GamificationEventBus;

  private constructor() {
    super();
    this.setMaxListeners(100); // Aumentar límite de listeners
  }

  public static getInstance(): GamificationEventBus {
    if (!GamificationEventBus.instance) {
      GamificationEventBus.instance = new GamificationEventBus();
    }
    return GamificationEventBus.instance;
  }

  // Método tipado para emitir eventos
  public emitGamificationEvent<K extends keyof GamificationEvents>(
    eventType: K,
    data: GamificationEvents[K]
  ): boolean {
    console.log(`[EventBus] Emitting event: ${eventType}`, data);
    return this.emit(eventType, data);
  }

  // Método tipado para escuchar eventos
  public onGamificationEvent<K extends keyof GamificationEvents>(
    eventType: K,
    listener: (data: GamificationEvents[K]) => void
  ): this {
    return this.on(eventType, listener);
  }

  // Método para remover listeners
  public offGamificationEvent<K extends keyof GamificationEvents>(
    eventType: K,
    listener: (data: GamificationEvents[K]) => void
  ): this {
    return this.off(eventType, listener);
  }

  // Método para obtener estadísticas del event bus
  public getStats() {
    return {
      eventNames: this.eventNames(),
      listenerCount: this.eventNames().reduce((acc, event) => {
        acc[event as string] = this.listenerCount(event);
        return acc;
      }, {} as Record<string, number>),
      maxListeners: this.getMaxListeners()
    };
  }
}

// Exportar la instancia singleton
export const gamificationEventBus = GamificationEventBus.getInstance();

// Función helper para emitir eventos desde cualquier parte de la aplicación
export function emitGamificationEvent<K extends keyof GamificationEvents>(
  eventType: K,
  data: GamificationEvents[K]
): void {
  gamificationEventBus.emitGamificationEvent(eventType, data);
}

// Función helper para registrar listeners
export function onGamificationEvent<K extends keyof GamificationEvents>(
  eventType: K,
  listener: (data: GamificationEvents[K]) => void
): void {
  gamificationEventBus.onGamificationEvent(eventType, listener);
}

export default gamificationEventBus;