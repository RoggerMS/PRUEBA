import { NextRequest } from 'next/server'

interface RateLimitOptions {
  interval: number // en milisegundos
  uniqueTokenPerInterval: number // número máximo de tokens únicos por intervalo
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private options: RateLimitOptions

  constructor(options: RateLimitOptions) {
    this.options = options
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - this.options.interval

    // Limpiar entradas expiradas
    this.cleanup(windowStart)

    const existing = this.requests.get(identifier)
    const resetTime = now + this.options.interval

    if (!existing || existing.resetTime <= now) {
      // Primera solicitud o ventana expirada
      this.requests.set(identifier, {
        count: 1,
        resetTime
      })

      return {
        success: true,
        limit: this.options.uniqueTokenPerInterval,
        remaining: this.options.uniqueTokenPerInterval - 1,
        reset: resetTime
      }
    }

    if (existing.count >= this.options.uniqueTokenPerInterval) {
      // Límite excedido
      return {
        success: false,
        limit: this.options.uniqueTokenPerInterval,
        remaining: 0,
        reset: existing.resetTime
      }
    }

    // Incrementar contador
    existing.count++
    this.requests.set(identifier, existing)

    return {
      success: true,
      limit: this.options.uniqueTokenPerInterval,
      remaining: this.options.uniqueTokenPerInterval - existing.count,
      reset: existing.resetTime
    }
  }

  private cleanup(windowStart: number) {
    for (const [key, value] of this.requests.entries()) {
      if (value.resetTime <= windowStart) {
        this.requests.delete(key)
      }
    }
  }
}

// Instancias predefinidas para diferentes casos de uso
export const authRateLimit = new RateLimiter({
  interval: 15 * 60 * 1000, // 15 minutos
  uniqueTokenPerInterval: 5 // 5 intentos por IP cada 15 minutos
})

export const apiRateLimit = new RateLimiter({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 60 // 60 solicitudes por minuto
})

export const strictRateLimit = new RateLimiter({
  interval: 60 * 60 * 1000, // 1 hora
  uniqueTokenPerInterval: 3 // 3 intentos por hora
})

// Función helper para obtener el identificador de la solicitud
export function getIdentifier(request: NextRequest): string {
  // Intentar obtener la IP real del cliente
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || request.ip || 'unknown'
  
  return ip
}

// Función helper para aplicar rate limiting
export async function applyRateLimit(
  request: NextRequest,
  rateLimiter: RateLimiter = authRateLimit
): Promise<RateLimitResult> {
  const identifier = getIdentifier(request)
  return await rateLimiter.check(identifier)
}

export { RateLimiter }
export type { RateLimitOptions, RateLimitResult }