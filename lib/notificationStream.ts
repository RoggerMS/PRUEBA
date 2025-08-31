import { NextRequest } from 'next/server'

export interface StreamNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  userId?: string
  actionUrl?: string
  actionText?: string
}

class NotificationStream {
  private static instance: NotificationStream
  private connections: Map<string, ReadableStreamDefaultController> = new Map()
  private userConnections: Map<string, Set<string>> = new Map()

  private constructor() {}

  static getInstance(): NotificationStream {
    if (!NotificationStream.instance) {
      NotificationStream.instance = new NotificationStream()
    }
    return NotificationStream.instance
  }

  createStream(userId?: string): ReadableStream {
    const connectionId = Math.random().toString(36).substring(7)
    
    return new ReadableStream({
      start: (controller) => {
        // Almacenar la conexión
        this.connections.set(connectionId, controller)
        
        if (userId) {
          if (!this.userConnections.has(userId)) {
            this.userConnections.set(userId, new Set())
          }
          this.userConnections.get(userId)!.add(connectionId)
        }

        // Enviar mensaje de conexión inicial
        const initialMessage = {
          type: 'connected',
          timestamp: new Date().toISOString(),
          connectionId
        }
        
        controller.enqueue(`data: ${JSON.stringify(initialMessage)}\n\n`)

        // Configurar heartbeat cada 30 segundos
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`)
          } catch (error) {
            clearInterval(heartbeat)
            this.removeConnection(connectionId, userId)
          }
        }, 30000)

        // Limpiar al cerrar
        controller.enqueue = new Proxy(controller.enqueue, {
          apply: (target, thisArg, args) => {
            try {
              return target.apply(thisArg, args)
            } catch (error) {
              clearInterval(heartbeat)
              this.removeConnection(connectionId, userId)
              throw error
            }
          }
        })
      },
      
      cancel: () => {
        this.removeConnection(connectionId, userId)
      }
    })
  }

  private removeConnection(connectionId: string, userId?: string) {
    this.connections.delete(connectionId)
    
    if (userId && this.userConnections.has(userId)) {
      this.userConnections.get(userId)!.delete(connectionId)
      if (this.userConnections.get(userId)!.size === 0) {
        this.userConnections.delete(userId)
      }
    }
  }

  broadcast(notification: StreamNotification) {
    const message = `data: ${JSON.stringify(notification)}\n\n`
    
    // Enviar a todas las conexiones activas
    for (const [connectionId, controller] of this.connections.entries()) {
      try {
        controller.enqueue(message)
      } catch (error) {
        // Conexión cerrada, remover
        this.connections.delete(connectionId)
      }
    }
  }

  sendToUser(userId: string, notification: StreamNotification) {
    const userConnections = this.userConnections.get(userId)
    if (!userConnections) return

    const message = `data: ${JSON.stringify(notification)}\n\n`
    
    for (const connectionId of userConnections) {
      const controller = this.connections.get(connectionId)
      if (controller) {
        try {
          controller.enqueue(message)
        } catch (error) {
          // Conexión cerrada, remover
          this.removeConnection(connectionId, userId)
        }
      }
    }
  }

  getActiveConnections(): number {
    return this.connections.size
  }

  getUserConnections(userId: string): number {
    return this.userConnections.get(userId)?.size || 0
  }
}

export const notificationStream = NotificationStream.getInstance()

// Helper para crear respuesta SSE
export function createSSEResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Authorization',
      // Permitir el envío de cookies/sesión en conexiones de distinto origen
      'Access-Control-Allow-Credentials': 'true'
    }
  })
}

// Helper para obtener userId de la request
export function getUserIdFromRequest(request: NextRequest): string | undefined {
  // Aquí deberías implementar la lógica para extraer el userId
  // desde el token de autenticación, cookies, etc.
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    // Decodificar token y extraer userId
    // Por ahora retornamos undefined para conexiones anónimas
    return undefined
  }
  return undefined
}

export default notificationStream