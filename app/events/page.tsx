"use client";

import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EventCard } from '@/components/events/EventCard'
import { EventCalendar } from '@/components/events/EventCalendar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EventFilters } from '@/components/events/EventFilters'
import { EventSearch } from '@/components/events/EventSearch'
import { EventSort, QuickSort, type SortField, type SortOrder } from '@/components/events/EventSort'
import { Search, Calendar, Users, Trophy, Plus, Filter, Clock, MapPin, Star, TrendingUp } from 'lucide-react'
import { useEvents, useEventRegistration } from '@/hooks/useEvents';
import { useEventFilters } from '@/hooks/useEventFilters'
import { usePagination } from '@/hooks/usePagination';
import { toast } from 'sonner';
import { PageTransition, StaggeredList, StaggeredItem, AnimatedContainer, HoverScale, FadeTransition } from '@/components/ui/animations';
import { seedEvents } from '@/lib/seed';

// Fallback data for development
const mockEvents = seedEvents.map(event => ({
  ...event,
  startDate: event.startDate.toISOString(),
  endDate: event.endDate.toISOString(),
  location: event.location.name,
  category: event.category.toUpperCase(),
  type: event.type.toUpperCase(),
  organizer: { name: event.organizer.name, image: event.organizer.avatar },
  club: { name: event.organizer.name, imageUrl: event.organizer.avatar },
  isRegistered: false,
  isOnline: false,
  imageUrl: event.image,
  canEdit: false,
  isFeatured: event.featured
}));


const sortOptions = [
  { value: "date", label: "Fecha" },
  { value: "popularity", label: "Popularidad" },
  { value: "price", label: "Precio" },
  { value: "name", label: "Nombre" }
];

export default function EventsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("browse");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // API hooks
  const { 
    data: eventsData, 
    isLoading, 
    error, 
    refetch 
  } = useEvents();

  const { 
    registerForEvent, 
    unregisterFromEvent, 
    isLoading: registrationLoading 
  } = useEventRegistration();

  const allEvents = eventsData?.events || mockEvents;
  
  // Optimized filtering hook
  const {
    filters,
    filteredEvents,
    sortedEvents,
    statistics,
    updateSearch,
    updateCategory,
    updateType,
    updateSort,
    updateFilters,
    resetFilters
  } = useEventFilters(allEvents);

  // Optimized pagination hook
  const {
    currentPage,
    totalPages,
    paginatedItems: events,
    goToPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious
  } = usePagination(sortedEvents, 12);

  // Registration handlers
  const handleRegister = async (eventId: string) => {
    try {
      await registerForEvent(eventId);
      toast.success('¡Te has registrado exitosamente al evento!');
      refetch();
    } catch (error) {
      toast.error('Error al registrarse al evento');
    }
  };

  const handleUnregister = async (eventId: string) => {
    try {
      await unregisterFromEvent(eventId);
      toast.success('Has cancelado tu registro al evento');
      refetch();
    } catch (error) {
      toast.error('Error al cancelar el registro');
    }
  };

  // Reset page when filters change
  useEffect(() => {
    goToPage(1);
  }, [filters, goToPage]);

  // Handle sort changes
  const handleSortChange = (field: SortField, order: SortOrder) => {
    updateSort(field, order);
  };

  // Handle search
  const handleSearch = (query: string) => {
    updateSearch(query);
  };

  // Use statistics from useEventFilters hook
  const stats = {
    totalEvents: statistics.totalEvents,
    upcomingEvents: statistics.upcomingEvents,
    myEvents: statistics.myEvents,
    totalAttendees: statistics.totalAttendees
  };

  // Get featured events from filtered results
  const featuredEvents = filteredEvents.filter(event => event.isFeatured || event.currentAttendees > 30);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <AnimatedContainer className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Eventos Académicos
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre conferencias, talleres, competencias y eventos que enriquecerán tu experiencia universitaria
          </p>
        </AnimatedContainer>

        {/* Stats Cards */}
        <StaggeredList className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StaggeredItem>
            <HoverScale>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                      <p className="text-sm text-gray-600">Total Eventos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverScale>
          </StaggeredItem>

          <StaggeredItem>
            <HoverScale>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                      <p className="text-sm text-gray-600">Próximos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverScale>
          </StaggeredItem>

          <StaggeredItem>
            <HoverScale>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Star className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.myEvents}</p>
                      <p className="text-sm text-gray-600">Mis Eventos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverScale>
          </StaggeredItem>

          <StaggeredItem>
            <HoverScale>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalAttendees}</p>
                      <p className="text-sm text-gray-600">Participantes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverScale>
          </StaggeredItem>
        </StaggeredList>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Explorar
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="my-events" className="flex items-center gap-2" asChild>
              <Link href="/events/my-events">
                <Star className="h-4 w-4" />
                Mis Eventos
              </Link>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2" asChild>
              <Link href="/events/create">
                <Plus className="h-4 w-4" />
                Crear Evento
              </Link>
            </TabsTrigger>
          </TabsList>

          {/* Browse Events Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search Bar */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <EventSearch
                      value={filters.search}
                      onChange={updateSearch}
                      onSearch={handleSearch}
                      placeholder="Buscar eventos, organizadores, ubicaciones..."
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <EventSort
                      sortBy={filters.sortBy}
                      sortOrder={filters.sortOrder}
                      onSortChange={handleSortChange}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filtros
                      {showAdvancedFilters && (
                        <Badge variant="secondary" className="ml-1">Activos</Badge>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Filters */}
            <FadeTransition show={showAdvancedFilters}>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <EventFilters
                      category={filters.category}
                      type={filters.eventType}
                      filters={filters}
                      onCategoryChange={updateCategory}
                      onTypeChange={updateType}
                      onFiltersChange={updateFilters}
                      onClearAll={resetFilters}
                    />
                </CardContent>
              </Card>
            </FadeTransition>

            {/* Quick Sort Options */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <QuickSort onSortChange={handleSortChange} />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Mostrando {events.length} de {statistics.totalEvents} eventos</span>
                  {(filters.search || filters.category !== 'all' || filters.eventType !== 'all' || 
                    filters.dateRange !== 'all' || filters.priceRange.min > 0 || filters.priceRange.max < 1000) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
            </div>

            {/* Featured Events */}
            {featuredEvents.length > 0 && (
              <AnimatedContainer className="space-y-4" delay={0.2}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Eventos Destacados</h2>
                </div>
                <StaggeredList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {featuredEvents.map(event => (
                    <StaggeredItem key={event.id}>
                      <HoverScale>
                        <EventCard
                          event={event}
                          onClick={() => router.push(`/events/${event.id}`)}
                        />
                      </HoverScale>
                    </StaggeredItem>
                  ))}
                </StaggeredList>
              </AnimatedContainer>
            )}

            {/* All Events */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Todos los Eventos</h2>
                  <Badge variant="secondary">{filteredEvents.length}</Badge>
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                      <div className="bg-white p-6 rounded-b-lg space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : events.length > 0 ? (
                <StaggeredList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {events.map(event => (
                    <StaggeredItem key={event.id}>
                      <HoverScale>
                        <EventCard
                          event={event}
                          onClick={() => router.push(`/events/${event.id}`)}
                          onRegister={handleRegister}
                          onUnregister={handleUnregister}
                          loading={registrationLoading}
                        />
                      </HoverScale>
                    </StaggeredItem>
                  ))}
                </StaggeredList>
              ) : (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron eventos</h3>
                    <p className="text-gray-600 mb-4">Intenta ajustar tus filtros de búsqueda</p>
                    <Button 
                      onClick={resetFilters}
                      variant="outline"
                    >
                      Limpiar Filtros
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={previousPage}
                    disabled={!canGoPrevious || isLoading}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={nextPage}
                    disabled={!canGoNext || isLoading}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <EventCalendar 
              events={allEvents} 
              onEventClick={(eventId) => router.push(`/events/${eventId}`)}
              onCreateEvent={() => router.push('/events/create')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}