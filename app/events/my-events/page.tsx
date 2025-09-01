'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast, eventToasts } from '@/components/ui/toast'
import { LoadingSpinner } from '@/components/ui/loading'
import { EventCardSkeleton } from '@/components/ui/skeleton'
import { PageTransition, AnimatedContainer, StaggeredList, StaggeredItem, HoverScale, FadeTransition } from '@/components/ui/animations'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Settings,
  Download,
  Share2,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Event, EventRegistration } from '@/types/events'
import { useEvents } from '@/hooks/useEvents'
import { useEventRegistration } from '@/hooks/useEventRegistration'

type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

interface MyEvent extends Event {
  status: EventStatus
  registrationsCount: number
  revenue?: number
}

export default function MyEventsPage() {
  const router = useRouter()
  const { success, error, warning } = useToast()
  const [activeTab, setActiveTab] = useState('created')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')
  const [createdEvents, setCreatedEvents] = useState<MyEvent[]>([])
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  const { events } = useEvents()
  const { registrations, cancelRegistration } = useEventRegistration()
  
  useEffect(() => {
    fetchMyEvents()
    fetchMyRegistrations()
  }, [])
  
  const fetchMyEvents = async () => {
    try {
      // This would typically fetch events created by the current user
      const response = await fetch('/api/events/my-events')
      if (response.ok) {
        const data = await response.json()
        setCreatedEvents(data)
      }
    } catch (error) {
      console.error('Error fetching my events:', error)
      // Fallback to mock data for development
      setCreatedEvents([
        {
          id: '1',
          title: 'Workshop de React Avanzado',
          description: 'Aprende técnicas avanzadas de React',
          date: '2024-02-15',
          time: '14:00',
          location: 'Centro de Convenciones',
          category: 'Tecnología',
          type: 'Taller',
          difficulty: 'Avanzado',
          maxAttendees: 30,
          price: 50,
          organizer: 'Tu Nombre',
          isOnline: false,
          requiresApproval: false,
          allowWaitlist: true,
          tags: ['react', 'javascript', 'frontend'],
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          status: 'upcoming' as EventStatus,
          registrationsCount: 25,
          revenue: 1250
        },
        {
          id: '2',
          title: 'Conferencia de IA',
          description: 'Últimas tendencias en inteligencia artificial',
          date: '2024-01-20',
          time: '09:00',
          location: 'Auditorio Principal',
          category: 'Tecnología',
          type: 'Conferencia',
          difficulty: 'Intermedio',
          maxAttendees: 100,
          price: 0,
          organizer: 'Tu Nombre',
          isOnline: true,
          requiresApproval: false,
          allowWaitlist: true,
          tags: ['ai', 'machine-learning'],
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
          status: 'completed' as EventStatus,
          registrationsCount: 85,
          revenue: 0
        }
      ])
    } finally {
      setLoading(false)
    }
  }
  
  const fetchMyRegistrations = async () => {
    try {
      // This would typically fetch events the user is registered for
      const response = await fetch('/api/events/my-registrations')
      if (response.ok) {
        const data = await response.json()
        setRegisteredEvents(data)
      }
    } catch (error) {
      console.error('Error fetching my registrations:', error)
      // Fallback to mock data
      setRegisteredEvents([
        {
          id: '3',
          title: 'Meetup de Desarrolladores',
          description: 'Networking para desarrolladores',
          date: '2024-02-10',
          time: '18:00',
          location: 'Café Central',
          category: 'Tecnología',
          type: 'Meetup',
          difficulty: 'Principiante',
          maxAttendees: 50,
          price: 0,
          organizer: 'Tech Community',
          isOnline: false,
          requiresApproval: false,
          allowWaitlist: true,
          tags: ['networking', 'developers'],
          createdAt: '2024-01-05T10:00:00Z',
          updatedAt: '2024-01-05T10:00:00Z'
        }
      ])
    }
  }
  
  const getEventStatus = (event: Event): EventStatus => {
    const eventDate = new Date(event.date)
    const now = new Date()
    
    if (eventDate > now) return 'upcoming'
    if (eventDate.toDateString() === now.toDateString()) return 'ongoing'
    return 'completed'
  }
  
  const filteredCreatedEvents = createdEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    return matchesSearch && matchesStatus
  })
  
  const filteredRegisteredEvents = registeredEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const eventStatus = getEventStatus(event)
    const matchesStatus = statusFilter === 'all' || eventStatus === statusFilter
    return matchesSearch && matchesStatus
  })
  
  const handleDeleteEvent = async (eventId: string) => {
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setCreatedEvents(prev => prev.filter(event => event.id !== eventId))
        const toastData = eventToasts.eventDeleted()
        success(toastData.title, toastData.description)
      } else {
        error('Error al eliminar', 'No se pudo eliminar el evento. Inténtalo de nuevo.')
      }
    } catch (err) {
      console.error('Error deleting event:', err)
      const networkToast = eventToasts.networkError()
      error(networkToast.title, networkToast.description)
    } finally {
      setDeleteLoading(false)
      setDeleteEventId(null)
    }
  }
  
  const handleCancelRegistration = async (eventId: string) => {
    try {
      await cancelRegistration(eventId)
      setRegisteredEvents(prev => prev.filter(event => event.id !== eventId))
      const event = registeredEvents.find(e => e.id === eventId)
      const toastData = eventToasts.registrationCancelled(event?.title || 'evento')
      warning(toastData.title, toastData.description)
    } catch (err) {
      error('Error al cancelar', 'No se pudo cancelar tu registro. Inténtalo de nuevo.')
    }
  }
  
  const exportEventData = (event: MyEvent) => {
    const data = {
      title: event.title,
      registrations: event.registrationsCount,
      revenue: event.revenue || 0,
      date: event.date,
      status: event.status
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title.replace(/\s+/g, '-').toLowerCase()}-data.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    success('Datos exportados', 'Los datos del evento han sido descargados exitosamente')
  }
  
  const getStatusBadge = (status: EventStatus) => {
    const variants = {
      upcoming: 'default',
      ongoing: 'secondary',
      completed: 'outline',
      cancelled: 'destructive'
    }
    
    const labels = {
      upcoming: 'Próximo',
      ongoing: 'En curso',
      completed: 'Completado',
      cancelled: 'Cancelado'
    }
    
    return (
      <Badge variant={variants[status] as any}>
        {labels[status]}
      </Badge>
    )
  }
  
  const EventCard = ({ event, isCreated = false }: { event: MyEvent | Event, isCreated?: boolean }) => {
    const eventStatus = isCreated ? (event as MyEvent).status : getEventStatus(event)
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">{event.category}</Badge>
                <Badge variant="outline">{event.type}</Badge>
                {getStatusBadge(eventStatus)}
                {event.price === 0 && <Badge className="bg-green-500">Gratis</Badge>}
              </div>
              
              <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.date).toLocaleDateString('es-ES')}
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {event.time}
                </div>
                
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {isCreated ? (event as MyEvent).registrationsCount : 0} / {event.maxAttendees}
                </div>
              </div>
              
              {isCreated && (event as MyEvent).revenue !== undefined && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Ingresos: </span>
                  <span className="text-green-600">${(event as MyEvent).revenue}</span>
                </div>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/events/${event.id}`)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </DropdownMenuItem>
                
                {isCreated && (
                  <>
                    <DropdownMenuItem onClick={() => router.push(`/events/${event.id}/edit`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => router.push(`/events/${event.id}/manage`)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Gestionar
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => exportEventData(event as MyEvent)}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Datos
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => setDeleteEventId(event.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
                
                {!isCreated && (
                  <DropdownMenuItem onClick={() => handleCancelRegistration(event.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancelar Registro
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: event.title,
                      url: `${window.location.origin}/events/${event.id}`
                    })
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`)
                    success('Enlace copiado', 'El enlace del evento ha sido copiado al portapapeles')
                  }
                }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        </CardContent>
      </Card>
    )
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <HoverScale scale={1.05}>
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
              </HoverScale>
              <h1 className="text-2xl font-bold">Mis Eventos</h1>
            </div>
            
            <HoverScale scale={1.05}>
              <Button
                onClick={() => router.push('/events/create')}
                className="flex items-center gap-2 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Crear Evento
              </Button>
            </HoverScale>
          </div>
        </AnimatedContainer>
      
        {/* Filters */}
        <FadeTransition>
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar eventos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 transition-all duration-200 focus:ring-2"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={(value: EventStatus | 'all') => setStatusFilter(value)}>
                  <SelectTrigger className="w-full md:w-48 transition-all duration-200">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="upcoming">Próximos</SelectItem>
                    <SelectItem value="ongoing">En curso</SelectItem>
                    <SelectItem value="completed">Completados</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </FadeTransition>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="created">Eventos Creados ({createdEvents.length})</TabsTrigger>
          <TabsTrigger value="registered">Eventos Registrados ({registeredEvents.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="created" className="mt-6">
          {filteredCreatedEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium mb-2">No tienes eventos creados</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== 'all'
                        ? 'No se encontraron eventos con los filtros aplicados'
                        : 'Crea tu primer evento para comenzar'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                      <Button onClick={() => router.push('/events/create')}>
                        Crear Primer Evento
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreatedEvents.map((event) => (
                <StaggeredItem key={event.id}>
                  <HoverScale scale={1.02}>
                    <EventCard event={event} isCreated={true} />
                  </HoverScale>
                </StaggeredItem>
              ))}
            </StaggeredList>
          )}
        </TabsContent>
        
        <TabsContent value="registered" className="mt-6">
          {filteredRegisteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Users className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium mb-2">No tienes eventos registrados</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== 'all'
                        ? 'No se encontraron eventos con los filtros aplicados'
                        : 'Explora eventos y regístrate en los que te interesen'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                      <Button onClick={() => router.push('/events')}>
                        Explorar Eventos
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRegisteredEvents.map((event) => (
                <StaggeredItem key={event.id}>
                  <HoverScale scale={1.02}>
                    <EventCard event={event} isCreated={false} />
                  </HoverScale>
                </StaggeredItem>
              ))}
            </StaggeredList>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El evento será eliminado permanentemente
              y todos los registros asociados se perderán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEventId && handleDeleteEvent(deleteEventId)}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </PageTransition>
  )
}