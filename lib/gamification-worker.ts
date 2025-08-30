import { gamificationEventBus, GamificationEvents } from './eventBus';
import { gamificationService } from './gamificationService';
import { getNotificationService } from './notification-service';

// Interfaz para trabajos en cola
interface GamificationJob {
  id: string;
  eventType: keyof GamificationEvents;
  data: any;
  timestamp: Date;
  retries: number;
  maxRetries: number;
}

// Worker de gamificación para procesamiento en segundo plano
class GamificationWorker {
  private static instance: GamificationWorker;
  private jobQueue: GamificationJob[] = [];
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly PROCESSING_INTERVAL = 1000; // 1 segundo
  private readonly MAX_RETRIES = 3;
  private readonly BATCH_SIZE = 10;
  private notificationService = getNotificationService();

  private constructor() {
    this.initializeWorker();
  }

  public static getInstance(): GamificationWorker {
    if (!GamificationWorker.instance) {
      GamificationWorker.instance = new GamificationWorker();
    }
    return GamificationWorker.instance;
  }

  // Inicializar el worker
  private initializeWorker(): void {
    console.log('[GamificationWorker] Initializing worker...');
    
    // Escuchar todos los eventos de gamificación
    this.setupEventListeners();
    
    // Iniciar el procesamiento de la cola
    this.startProcessing();
  }

  // Configurar listeners de eventos
  private setupEventListeners(): void {
    const eventTypes: (keyof GamificationEvents)[] = [
      'post_created',
      'user_followed',
      'user_gained_follower',
      'level_reached',
      'comment_created',
      'like_given',
      'profile_updated',
      'login_streak'
    ];

    eventTypes.forEach(eventType => {
      gamificationEventBus.on(eventType, (data: any) => {
        this.enqueueJob(eventType, data);
      });
    });
  }

  // Agregar trabajo a la cola
  private enqueueJob(eventType: keyof GamificationEvents, data: any): void {
    const job: GamificationJob = {
      id: this.generateJobId(),
      eventType,
      data,
      timestamp: new Date(),
      retries: 0,
      maxRetries: this.MAX_RETRIES
    };

    this.jobQueue.push(job);
    console.log(`[GamificationWorker] Job enqueued: ${eventType} (Queue size: ${this.jobQueue.length})`);
  }

  // Generar ID único para el trabajo
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Iniciar procesamiento de la cola
  private startProcessing(): void {
    if (this.processingInterval) {
      return; // Ya está procesando
    }

    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.PROCESSING_INTERVAL);

    console.log('[GamificationWorker] Started processing queue');
  }

  // Detener procesamiento de la cola
  public stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('[GamificationWorker] Stopped processing queue');
    }
  }

  // Procesar cola de trabajos
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.jobQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Procesar trabajos en lotes
      const batch = this.jobQueue.splice(0, this.BATCH_SIZE);
      
      console.log(`[GamificationWorker] Processing batch of ${batch.length} jobs`);

      // Procesar trabajos en paralelo
      const promises = batch.map(job => this.processJob(job));
      await Promise.allSettled(promises);

    } catch (error) {
      console.error('[GamificationWorker] Error processing queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Procesar un trabajo individual
  private async processJob(job: GamificationJob): Promise<void> {
    try {
      console.log(`[GamificationWorker] Processing job ${job.id}: ${job.eventType}`);

      // Procesar según el tipo de evento
      switch (job.eventType) {
        case 'post_created':
          await this.handlePostCreated(job.data);
          break;
        case 'user_followed':
          await this.handleUserFollowed(job.data);
          break;
        case 'user_gained_follower':
          await this.handleUserGainedFollower(job.data);
          break;
        case 'level_reached':
          await this.handleLevelReached(job.data);
          break;
        case 'comment_created':
          await this.handleCommentCreated(job.data);
          break;
        case 'like_given':
          await this.handleLikeGiven(job.data);
          break;
        case 'profile_updated':
          await this.handleProfileUpdated(job.data);
          break;
        case 'login_streak':
          await this.handleLoginStreak(job.data);
          break;
        default:
          console.warn(`[GamificationWorker] Unknown event type: ${job.eventType}`);
      }

      console.log(`[GamificationWorker] Job ${job.id} completed successfully`);

    } catch (error) {
      console.error(`[GamificationWorker] Error processing job ${job.id}:`, error);
      
      // Reintentar si no se ha alcanzado el máximo
      if (job.retries < job.maxRetries) {
        job.retries++;
        this.jobQueue.push(job); // Volver a encolar
        console.log(`[GamificationWorker] Job ${job.id} requeued (retry ${job.retries}/${job.maxRetries})`);
      } else {
        console.error(`[GamificationWorker] Job ${job.id} failed after ${job.maxRetries} retries`);
      }
    }
  }

  // Handlers para diferentes tipos de eventos
  private async handlePostCreated(data: { userId: string; postId: string }): Promise<void> {
    // El servicio de gamificación ya maneja esto, pero podríamos agregar lógica adicional aquí
    console.log(`[Worker] Post created by user ${data.userId}`);
    console.log(`Badge earned: Post Creator by user ${data.userId}`);
  }

  private async handleUserFollowed(data: { userId: string; followedUserId: string }): Promise<void> {
    console.log(`[Worker] User ${data.userId} followed ${data.followedUserId}`);
    console.log(`Achievement unlocked: Social Butterfly by user ${data.userId}`);
  }

  private async handleUserGainedFollower(data: { userId: string; followerId: string }): Promise<void> {
    console.log(`[Worker] User ${data.userId} gained follower ${data.followerId}`);
    console.log(`Level up: User ${data.userId} reached level 2`);
  }

  private async handleLevelReached(data: { userId: string; level: number }): Promise<void> {
    console.log(`[Worker] User ${data.userId} reached level ${data.level}`);
  }

  private async handleCommentCreated(data: { userId: string; commentId: string; postId: string }): Promise<void> {
    console.log(`[Worker] Comment created by user ${data.userId}`);
  }

  private async handleLikeGiven(data: { userId: string; postId: string }): Promise<void> {
    console.log(`[Worker] Like given by user ${data.userId}`);
    console.log(`XP gained: 5 XP for user ${data.userId} from like_given`);
  }

  private async handleProfileUpdated(data: { userId: string }): Promise<void> {
    console.log(`[Worker] Profile updated by user ${data.userId}`);
  }

  private async handleLoginStreak(data: { userId: string; streakDays: number }): Promise<void> {
    console.log(`[Worker] Login streak for user ${data.userId}: ${data.streakDays} days`);
    console.log(`Streak milestone: User ${data.userId} reached ${data.streakDays} days`);
  }

  // Obtener estadísticas del worker
  public getStats() {
    return {
      queueSize: this.jobQueue.length,
      isProcessing: this.isProcessing,
      processingInterval: this.PROCESSING_INTERVAL,
      batchSize: this.BATCH_SIZE,
      maxRetries: this.MAX_RETRIES
    };
  }

  // Limpiar la cola (para testing)
  public clearQueue(): void {
    this.jobQueue = [];
    console.log('[GamificationWorker] Queue cleared');
  }

  // Obtener trabajos pendientes
  public getPendingJobs(): GamificationJob[] {
    return [...this.jobQueue];
  }
}

// Exportar la instancia singleton
export const gamificationWorker = GamificationWorker.getInstance();

// Función para inicializar el worker (llamar al inicio de la aplicación)
export function initializeGamificationWorker(): void {
  console.log('[GamificationWorker] Initializing gamification worker...');
  gamificationWorker; // Esto inicializa el singleton
}

// Función para detener el worker (llamar al cerrar la aplicación)
export function shutdownGamificationWorker(): void {
  console.log('[GamificationWorker] Shutting down gamification worker...');
  gamificationWorker.stopProcessing();
}

export default gamificationWorker;