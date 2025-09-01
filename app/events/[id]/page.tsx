'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useToast, eventToasts } from '@/components/ui/toast'
import { LoadingOverlay, LoadingSpinner } from '@/components/ui/loading'
import { EventDetailSkeleton } from '@/components/ui/skeleton'
import { PageTransition, AnimatedContainer, StaggeredList, StaggeredItem, HoverScale, FadeTransition } from '@/components/ui/animations'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Star,
  MessageCircle,
  Share2,
  Heart,
  ArrowLeft,
  User,
  Send,
  Bookmark,
  BookmarkCheck
} from 'lucide-react'
import { Event, EventRegistration, Comment } from '@/types/events'
import { useEvents } from '@/hooks/useEvents'
import { useEventRegistration } from '@/hooks/useEventRegistration'

interface EventDetailsPageProps {
  params: { id: string }
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const { success, error, warning, info } = useToast()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  
  const {
    registerForEvent,
    cancelRegistration,
    checkRegistrationStatus,
    isRegistering,
    isCancelling,
    isCheckingStatus,
    registrationStatus,
    error: registrationError
  } = useEventRegistration()
  
  useEffect(() => {
    fetchEventDetails()
    fetchEventRegistrations()
    fetchEventComments()
    // Check registration status when component mounts
    if (eventId) {
      checkRegistrationStatus(eventId)
    }
  }, [eventId, checkRegistrationStatus])
  
  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (response.ok) {
        const eventData = await response.json()
        setEvent(eventData)
        setLikesCount(eventData.likesCount || 0)
      } else {
        error('Error al cargar evento', 'No se pudo encontrar el evento solicitado')
        router.push('/events')
      }
    } catch (err) {
      console.error('Error fetching event:', err)
      const networkToast = eventToasts.networkError()
      error(networkToast.title, networkToast.description)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchEventRegistrations = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/registrations`)
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    }
  }
  
  const fetchEventComments = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }
  
  const handleRegistration = async () => {
    if (!event) return
    
    try {
      const isCurrentlyRegistered = registrationStatus[event.id] === 'registered'
      
      if (isCurrentlyRegistered) {
        await cancelRegistration(event.id)
        const toastData = eventToasts.registrationCancelled(event.title)
        warning(toastData.title, toastData.description)
      } else {
        await registerForEvent(event.id)
        const toastData = eventToasts.registrationSuccess(event.title)
        success(toastData.title, toastData.description)
      }
      
      // Refresh registrations after successful operation
      fetchEventRegistrations()
    } catch (err) {
      error('Error en el registro', registrationError || 'No se pudo procesar tu registro. Inténtalo de nuevo.')
    }
  }
  
  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    setCommentLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          userId: 'current-user-id' // This should come from auth context
        })
      })
      
      if (response.ok) {
        setNewComment('')
        fetchEventComments()
        const toastData = eventToasts.commentAdded()
        success(toastData.title, toastData.description)
      } else {
        error('Error al comentar', 'No se pudo agregar tu comentario. Inténtalo de nuevo.')
      }
    } catch (err) {
      console.error('Error adding comment:', err)
      error('Error al comentar', 'Problema de conexión al agregar comentario')
    } finally {
      setCommentLoading(false)
    }
  }
  
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    success(
      isBookmarked ? 'Eliminado de favoritos' : 'Agregado a favoritos',
      isBookmarked ? 'El evento fue removido de tus favoritos' : 'El evento fue guardado en tus favoritos'
    )
  }
  
  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
    info(
      isLiked ? 'Like eliminado' : '¡Te gusta este evento!',
      isLiked ? 'Tu like ha sido removido' : 'Tu like ha sido registrado'
    )
  }
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      success('Enlace copiado', 'El enlace del evento ha sido copiado al portapapeles')
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EventDetailSkeleton />
      </div>
    )
  }
  
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Evento no encontrado</h1>
        <Button onClick={() => router.push('/events')}>Volver a Eventos</Button>
      </div>
    )
  }
  
  const availableSpots = event.maxAttendees - registrations.length
  const isEventFull = availableSpots <= 0
  const isUserRegistered = registrationStatus[event.id] === 'registered'
  const isRegistrationLoading = isRegistering || isCancelling || isCheckingStatus
  
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center gap-4 mb-6">
            <HoverScale scale={1.05}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </HoverScale>
            
            <div className="flex gap-2 ml-auto">
              <HoverScale scale={1.1}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className="flex items-center gap-2 transition-all duration-200"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </HoverScale>
              
              <HoverScale scale={1.1}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center gap-2 transition-all duration-200"
                >
                  <Heart className={`h-4 w-4 transition-colors duration-200 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  {likesCount}
                </Button>
              </HoverScale>
              
              <HoverScale scale={1.1}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2 transition-all duration-200"
                >
                  <Share2 className="h-4 w-4" />
                  Compartir
                </Button>
              </HoverScale>
            </div>
          </div>
        </AnimatedContainer>
      
        {/* Event Header */}
        <FadeTransition>
          <Card className="mb-6 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <StaggeredList className="flex flex-wrap gap-2 mb-3">
                    <StaggeredItem><Badge variant="secondary">{event.category}</Badge></StaggeredItem>
                    <StaggeredItem><Badge variant="outline">{event.type}</Badge></StaggeredItem>
                    {event.difficulty && (
                      <StaggeredItem><Badge variant="outline">{event.difficulty}</Badge></StaggeredItem>
                    )}
                    {event.price === 0 && <StaggeredItem><Badge className="bg-green-500">Gratis</Badge></StaggeredItem>}
                  </StaggeredList>
              
              <CardTitle className="text-2xl md:text-3xl mb-2">
                {event.title}
              </CardTitle>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {event.organizer}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  4.8 (24 reseñas)
                </div>
              </div>
            </div>
            
            <div className="md:w-64">
              <HoverScale scale={1.02}>
                <Card className="transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      {registrations.length} / {event.maxAttendees} asistentes
                    </div>
                    
                    {event.price > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4" />
                        ${event.price}
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <HoverScale scale={1.05}>
                    <Button
                      onClick={handleRegistration}
                      disabled={isEventFull && !isUserRegistered || isRegistrationLoading}
                      className="w-full transition-all duration-200"
                      variant={isUserRegistered ? "destructive" : "default"}
                    >
                      <FadeTransition>
                        {isRegistrationLoading ? (
                          <>
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                            {isRegistering && 'Registrando...'}
                            {isCancelling && 'Cancelando...'}
                            {isCheckingStatus && 'Verificando...'}
                          </>
                        ) : (
                          isUserRegistered
                            ? 'Cancelar Registro'
                            : isEventFull
                            ? 'Evento Lleno'
                            : 'Registrarse'
                        )}
                      </FadeTransition>
                    </Button>
                  </HoverScale>
                  
                  {availableSpots <= 5 && availableSpots > 0 && (
                    <p className="text-xs text-orange-600 mt-2 text-center">
                      ¡Solo quedan {availableSpots} lugares!
                    </p>
                  )}
                  </CardContent>
                </Card>
              </HoverScale>
            </div>
          </div>
        </CardHeader>
      </Card>
    </FadeTransition>
      
        {/* Event Description */}
        <FadeTransition>
          <Card className="mb-6 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Descripción del Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </CardContent>
          </Card>
        </FadeTransition>
      
        {/* Attendees */}
        {registrations.length > 0 && (
          <FadeTransition>
            <Card className="mb-6 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Asistentes ({registrations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <StaggeredList className="flex flex-wrap gap-3">
                  {registrations.slice(0, 10).map((registration) => (
                    <StaggeredItem key={registration.id}>
                      <HoverScale scale={1.05}>
                        <div className="flex items-center gap-2 transition-all duration-200">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/avatars/${registration.userId}.jpg`} />
                            <AvatarFallback>
                              {registration.userId.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{registration.userId}</span>
                        </div>
                      </HoverScale>
                    </StaggeredItem>
                  ))}
                  {registrations.length > 10 && (
                    <StaggeredItem>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        +{registrations.length - 10} más
                      </div>
                    </StaggeredItem>
                  )}
                </StaggeredList>
              </CardContent>
            </Card>
          </FadeTransition>
        )}
      
        {/* Comments Section */}
        <FadeTransition>
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comentarios ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
          {/* Add Comment */}
          <div className="mb-6">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>TU</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <HoverScale scale={1.05}>
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || commentLoading}
                      size="sm"
                      className="flex items-center gap-2 transition-all duration-200"
                    >
                      <FadeTransition>
                        {commentLoading ? (
                          <>
                            <LoadingSpinner className="h-4 w-4" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Comentar
                          </>
                        )}
                      </FadeTransition>
                    </Button>
                  </HoverScale>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="mb-6" />
          
          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </p>
            ) : (
              <StaggeredList className="space-y-4">
                {comments.map((comment) => (
                  <StaggeredItem key={comment.id}>
                    <HoverScale scale={1.02}>
                      <div className="flex gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/avatars/${comment.userId}.jpg`} />
                          <AvatarFallback>
                            {comment.userId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.userId}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </HoverScale>
                  </StaggeredItem>
                ))}
              </StaggeredList>
            )}
          </div>
        </CardContent>
      </Card>
    </FadeTransition>
      </div>
    </PageTransition>
  )
}