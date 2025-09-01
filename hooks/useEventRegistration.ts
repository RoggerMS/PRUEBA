import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { Event } from '@/types/events'

interface RegistrationState {
  isRegistering: boolean
  isCancelling: boolean
  isCheckingStatus: boolean
  registrationStatus: 'registered' | 'not_registered' | 'waitlisted' | 'unknown'
  error: string | null
}

interface UseEventRegistrationReturn {
  // State
  isRegistering: boolean
  isCancelling: boolean
  isCheckingStatus: boolean
  registrationStatus: 'registered' | 'not_registered' | 'waitlisted' | 'unknown'
  error: string | null
  isRegistered: boolean
  isWaitlisted: boolean
  canRegister: boolean
  
  // Actions
  registerForEvent: (eventId: string) => Promise<void>
  cancelRegistration: (eventId: string) => Promise<void>
  checkRegistrationStatus: (eventId: string) => Promise<void>
  clearError: () => void
}

export function useEventRegistration(event?: Event): UseEventRegistrationReturn {
  const [state, setState] = useState<RegistrationState>({
    isRegistering: false,
    isCancelling: false,
    isCheckingStatus: false,
    registrationStatus: 'unknown',
    error: null
  })

  // Memoized computed values
  const isRegistered = useMemo(() => 
    state.registrationStatus === 'registered', 
    [state.registrationStatus]
  )

  const isWaitlisted = useMemo(() => 
    state.registrationStatus === 'waitlisted', 
    [state.registrationStatus]
  )

  const canRegister = useMemo(() => {
    if (!event) return false
    if (isRegistered || isWaitlisted) return false
    
    const now = new Date()
    const eventDate = new Date(event.date)
    
    // Can't register for past events
    if (eventDate < now) return false
    
    // Check if event is full and doesn't allow waitlist
    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      return event.allowWaitlist || false
    }
    
    return true
  }, [event, isRegistered, isWaitlisted])

  // Optimized registration function
  const registerForEvent = useCallback(async (eventId: string) => {
    if (state.isRegistering || !canRegister) return

    setState(prev => ({ ...prev, isRegistering: true, error: null }))

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al registrarse en el evento')
      }

      const result = await response.json()
      
      setState(prev => ({
        ...prev,
        isRegistering: false,
        registrationStatus: result.waitlisted ? 'waitlisted' : 'registered'
      }))

      if (result.waitlisted) {
        toast.success('Te has unido a la lista de espera', {
          description: 'Te notificaremos si se libera un lugar'
        })
      } else {
        toast.success('¡Registro exitoso!', {
          description: 'Te has registrado correctamente en el evento'
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setState(prev => ({
        ...prev,
        isRegistering: false,
        error: errorMessage
      }))
      
      toast.error('Error al registrarse', {
        description: errorMessage
      })
    }
  }, [state.isRegistering, canRegister])

  // Optimized cancellation function
  const cancelRegistration = useCallback(async (eventId: string) => {
    if (state.isCancelling || (!isRegistered && !isWaitlisted)) return

    setState(prev => ({ ...prev, isCancelling: true, error: null }))

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al cancelar el registro')
      }

      setState(prev => ({
        ...prev,
        isCancelling: false,
        registrationStatus: 'not_registered'
      }))

      toast.success('Registro cancelado', {
        description: 'Has cancelado tu registro exitosamente'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setState(prev => ({
        ...prev,
        isCancelling: false,
        error: errorMessage
      }))
      
      toast.error('Error al cancelar registro', {
        description: errorMessage
      })
    }
  }, [state.isCancelling, isRegistered, isWaitlisted])

  // Optimized status checking function
  const checkRegistrationStatus = useCallback(async (eventId: string) => {
    if (state.isCheckingStatus) return

    setState(prev => ({ ...prev, isCheckingStatus: true, error: null }))

    try {
      const response = await fetch(`/api/events/${eventId}/registration-status`)
      
      if (!response.ok) {
        throw new Error('Error al verificar el estado del registro')
      }

      const result = await response.json()
      
      setState(prev => ({
        ...prev,
        isCheckingStatus: false,
        registrationStatus: result.status || 'not_registered'
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setState(prev => ({
        ...prev,
        isCheckingStatus: false,
        error: errorMessage
      }))
    }
  }, [state.isCheckingStatus])

  // Clear error function
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // State
    isRegistering: state.isRegistering,
    isCancelling: state.isCancelling,
    isCheckingStatus: state.isCheckingStatus,
    registrationStatus: state.registrationStatus,
    error: state.error,
    isRegistered,
    isWaitlisted,
    canRegister,
    
    // Actions
    registerForEvent,
    cancelRegistration,
    checkRegistrationStatus,
    clearError
  }
}

export default useEventRegistration