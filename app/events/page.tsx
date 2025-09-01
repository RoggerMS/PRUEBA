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
import { Search, Calendar, Users, Trophy, Plus, Filter, Clock, MapPin, Star } from 'lucide-react'
import { useEvents, useEventRegistration } from '@/hooks/useEvents';
import { toast } from 'sonner';

// Fallback mock data for development
const mockEvents = [
  {
    id: '1',
    title: 'Hackathon de Inteligencia Artificial',
    description: 'Competencia de programación enfocada en soluciones de IA para problemas reales del campus universitario.',
    startDate: '2024-02-15T09:00:00Z',
    endDate: '2024-02-15T18:00:00Z',
    location: 'Laboratorio de Computación A',
    category: 'TECHNOLOGY',
    type: 'WORKSHOP',
    organizer: { name: 'Club de Programación', image: null },
    club: { name: 'Club de Programación', imageUrl: null },
    currentAttendees: 45,
    maxAttendees: 60,
    price: 0,
    isRegistered: true,
    isOnline: false,
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=hackathon%20artificial%20intelligence%20programming%20competition%20university%20students%20coding%20laptops%20modern%20tech%20colorful&image_size=landscape_4_3',
    canEdit: false,
    tags: ['IA', 'Programación', 'Competencia']
  }
];


const sortOptions = [
  { value: "date", label: "Fecha" },
  { value: "popularity", label: "Popularidad" },
  { value: "price", label: "Precio" },
  { value: "name", label: "Nombre" }
];

export default function EventsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedType, setSelectedType] = useState("Todos");
  const [sortBy, setSortBy] = useState<SortField>("startDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: null as Date | null, end: null as Date | null },
    priceRange: { min: 0, max: 1000 },
    difficulty: "" as string,
    isOnline: null as boolean | null,
    isFree: null as boolean | null,
    hasAvailableSpots: null as boolean | null
  });

  const [activeTab, setActiveTab] = useState("browse");
  const [page, setPage] = useState(1);

  // API hooks
  const { 
    data: eventsData, 
    isLoading, 
    error, 
    refetch 
  } = useEvents({
    search: searchQuery,
    category: selectedCategory !== 'Todos' ? selectedCategory : undefined,
    type: selectedType !== 'Todos' ? selectedType : undefined,
    sortBy: sortBy as 'date' | 'title' | 'popularity',
    sortOrder,
    dateStart: filters.dateRange.start?.toISOString(),
    dateEnd: filters.dateRange.end?.toISOString(),
    minPrice: filters.priceRange.min,
    maxPrice: filters.priceRange.max,
    isOnline: filters.isOnline,
    isFree: filters.isFree,
    hasAvailableSpots: filters.hasAvailableSpots,
    page,
    limit: 12
  });

  const { 
    registerForEvent, 
    unregisterFromEvent, 
    isLoading: registrationLoading 
  } = useEventRegistration();

  const events = eventsData?.events || [];
  const totalEvents = eventsData?.total || 0;
  const totalPages = eventsData?.totalPages || 1;

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
    setPage(1);
  }, [searchQuery, selectedCategory, selectedType, sortBy, sortOrder, filters]);

  // Handle sort changes
  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todos");
    setSelectedType("Todos");
    setSortBy("startDate");
    setSortOrder("asc");
    setFilters({
      dateRange: { start: null, end: null },
      priceRange: { min: 0, max: 1000 },
      difficulty: "",
      isOnline: null,
      isFree: null,
      hasAvailableSpots: null
    });
  };

  // Calculate statistics from real data
  const upcomingEventsData = events.filter(event => {
    const eventDate = new Date(event.startDate);
    const today = new Date();
    return eventDate >= today;
  });

  const myRegisteredEvents = events.filter(event => event.isRegistered);
  const totalAttendees = events.reduce((sum, event) => sum + event.currentAttendees, 0);

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "Todos" || event.category === selectedCategory;
    const matchesType = selectedType === "Todos" || event.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const featuredEvents = filteredEvents.filter(event => event.isFeatured);
  const upcomingEvents = filteredEvents.filter(event => event.status === "upcoming");

  const stats = {
    totalEvents: events.length || mockEvents.length,
    upcomingEvents: upcomingEventsData.length || mockEvents.filter(e => e.status === "upcoming").length,
    myEvents: myRegisteredEvents.length || mockEvents.filter(e => e.isRegistered).length,
    totalAttendees: totalAttendees || mockEvents.reduce((sum, e) => sum + e.attendees, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Eventos Académicos
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre conferencias, talleres, competencias y eventos que enriquecerán tu experiencia universitaria
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        </div>

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
                      value={searchQuery}
                      onChange={setSearchQuery}
                      onSearch={handleSearch}
                      placeholder="Buscar eventos, organizadores, ubicaciones..."
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <EventSort
                      sortBy={sortBy}
                      sortOrder={sortOrder}
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
            {showAdvancedFilters && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <EventFilters
                    category={selectedCategory}
                    type={selectedType}
                    filters={filters}
                    onCategoryChange={setSelectedCategory}
                    onTypeChange={setSelectedType}
                    onFiltersChange={handleFiltersChange}
                    onClearAll={clearAllFilters}
                  />
                </CardContent>
              </Card>
            )}

            {/* Quick Sort Options */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <QuickSort onSortChange={handleSortChange} />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Mostrando {events.length} de {totalEvents} eventos</span>
                {(searchQuery || selectedCategory !== 'Todos' || selectedType !== 'Todos' || 
                  filters.dateRange.start || filters.isOnline !== null || filters.isFree !== null) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>

            {/* Featured Events */}
            {featuredEvents.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Eventos Destacados</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {featuredEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => router.push(`/events/${event.id}`)}
                    />
                  ))}
                </div>
              </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {events.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => router.push(`/events/${event.id}`)}
                      onRegister={handleRegister}
                      onUnregister={handleUnregister}
                      loading={registrationLoading}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron eventos</h3>
                    <p className="text-gray-600 mb-4">Intenta ajustar tus filtros de búsqueda</p>
                    <Button 
                      onClick={clearAllFilters}
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
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isLoading}
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
              events={mockEvents} 
              onEventClick={(eventId) => router.push(`/events/${eventId}`)}
              onCreateEvent={() => router.push('/events/create')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}