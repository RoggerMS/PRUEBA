'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
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
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  
  const { registerForEvent, cancelRegistration, isRegistered } = useEventRegistration()
  
  useEffect(() => {
    fetchEventDetails()
    fetchEventRegistrations()
    fetchEventComments()
  }, [eventId])
  
  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (response.ok) {
        const eventData = await response.json()
        setEvent(eventData)
        setLikesCount(eventData.likesCount || 0)
      } else {
        toast.error('Error al cargar el evento')
        router.push('/events')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Error al cargar el evento')
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
      if (isRegistered(event.id)) {
        await cancelRegistration(event.id)
        toast.success('Registro cancelado exitosamente')
      } else {
        await registerForEvent(event.id)
        toast.success('¡Te has registrado exitosamente!')
      }
      fetchEventRegistrations()
    } catch (error) {
      toast.error('Error al procesar el registro')
    }
  }
  
  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
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
        toast.success('Comentario agregado')
      } else {
        toast.error('Error al agregar comentario')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Error al agregar comentario')
    }
  }
  
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? 'Eliminado de favoritos' : 'Agregado a favoritos')
  }
  
  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
    toast.success(isLiked ? 'Like eliminado' : '¡Te gusta este evento!')
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
      toast.success('Enlace copiado al portapapeles')
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
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
  const isUserRegistered = isRegistered(event.id)
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        
        <div className="flex gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className="flex items-center gap-2"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="flex items-center gap-2"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            {likesCount}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
        </div>
      </div>
      
      {/* Event Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary">{event.category}</Badge>
                <Badge variant="outline">{event.type}</Badge>
                {event.difficulty && (
                  <Badge variant="outline">{event.difficulty}</Badge>
                )}
                {event.price === 0 && <Badge className="bg-green-500">Gratis</Badge>}
              </div>
              
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
              <Card>
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
                  
                  <Button
                    onClick={handleRegistration}
                    disabled={isEventFull && !isUserRegistered}
                    className="w-full"
                    variant={isUserRegistered ? "destructive" : "default"}
                  >
                    {isUserRegistered
                      ? 'Cancelar Registro'
                      : isEventFull
                      ? 'Evento Lleno'
                      : 'Registrarse'
                    }
                  </Button>
                  
                  {availableSpots <= 5 && availableSpots > 0 && (
                    <p className="text-xs text-orange-600 mt-2 text-center">
                      ¡Solo quedan {availableSpots} lugares!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Event Description */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Descripción del Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        </CardContent>
      </Card>
      
      {/* Attendees */}
      {registrations.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Asistentes ({registrations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {registrations.slice(0, 10).map((registration) => (
                <div key={registration.id} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/avatars/${registration.userId}.jpg`} />
                    <AvatarFallback>
                      {registration.userId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{registration.userId}</span>
                </div>
              ))}
              {registrations.length > 10 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  +{registrations.length - 10} más
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Comments Section */}
      <Card>
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
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Comentar
                  </Button>
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
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}