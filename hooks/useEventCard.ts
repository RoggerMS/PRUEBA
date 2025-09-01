import { useMemo, useCallback } from 'react'
import { Event } from '@/shared/types/events'

/**
 * Custom hook for EventCard component optimization
 * Memoizes expensive calculations and provides optimized handlers
 */
export function useEventCard(event: Event) {
  // Memoize expensive date calculations
  const eventDate = useMemo(() => {
    return new Date(event.startDate)
  }, [event.startDate])

  const formattedDate = useMemo(() => {
    return eventDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [eventDate])

  const formattedTime = useMemo(() => {
    return eventDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [eventDate])

  // Memoize status calculations
  const eventStatus = useMemo(() => {
    const now = new Date()
    const eventDateTime = new Date(event.startDate)
    
    if (eventDateTime < now) {
      return 'past'
    } else if (eventDateTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return 'today'
    } else {
      return 'upcoming'
    }
  }, [event.startDate])

  // Memoize category colors
  const categoryColor = useMemo(() => {
    const colors: Record<string, string> = {
      'Tecnología': 'bg-blue-100 text-blue-800',
      'Deportes': 'bg-green-100 text-green-800',
      'Arte': 'bg-purple-100 text-purple-800',
      'Música': 'bg-pink-100 text-pink-800',
      'Educación': 'bg-yellow-100 text-yellow-800',
      'Negocios': 'bg-gray-100 text-gray-800',
      'Salud': 'bg-red-100 text-red-800',
      'Comida': 'bg-orange-100 text-orange-800'
    }
    return colors[event.category] || 'bg-gray-100 text-gray-800'
  }, [event.category])

  // Memoize difficulty colors
  const difficultyColor = useMemo(() => {
    const colors: Record<string, string> = {
      'Principiante': 'bg-green-100 text-green-800',
      'Intermedio': 'bg-yellow-100 text-yellow-800',
      'Avanzado': 'bg-red-100 text-red-800'
    }
    return colors[event.difficulty] || 'bg-gray-100 text-gray-800'
  }, [event.difficulty])

  // Memoize attendance progress
  const attendanceProgress = useMemo(() => {
    if (!event.maxAttendees) return 0
    return Math.min((event.currentAttendees / event.maxAttendees) * 100, 100)
  }, [event.currentAttendees, event.maxAttendees])

  // Memoize capacity status
  const capacityStatus = useMemo(() => {
    if (!event.maxAttendees) return 'available'
    const progress = attendanceProgress
    if (progress >= 100) return 'full'
    if (progress >= 80) return 'almost-full'
    return 'available'
  }, [attendanceProgress, event.maxAttendees])

  // Optimized handlers with useCallback
  const handleLike = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Like logic will be handled by parent component
  }, [])

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Share logic will be handled by parent component
  }, [])

  const handleRegister = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Registration logic will be handled by parent component
  }, [])

  return {
    // Memoized values
    eventDate,
    formattedDate,
    formattedTime,
    eventStatus,
    categoryColor,
    difficultyColor,
    attendanceProgress,
    capacityStatus,
    // Optimized handlers
    handleLike,
    handleShare,
    handleRegister
  }
}