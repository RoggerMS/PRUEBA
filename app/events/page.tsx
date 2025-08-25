"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventCard } from "@/components/events/EventCard";
import { EventDetail } from "@/components/events/EventDetail";
import { MyEvents } from "@/components/events/MyEvents";
import { CreateEvent } from "@/components/events/CreateEvent";
import { EventCalendar } from "@/components/events/EventCalendar";
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  TrendingUp,
  Award,
  Target
} from "lucide-react";

// Mock data
const mockEvents = [
  {
    id: "1",
    title: "Hackathon de Inteligencia Artificial",
    description: "Competencia de 48 horas para desarrollar soluciones innovadoras con IA",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20hackathon%20event%20with%20students%20coding%20laptops%20modern%20tech%20atmosphere&image_size=landscape_4_3",
    date: "2024-02-15",
    time: "09:00",
    endTime: "18:00",
    location: "Auditorio Principal",
    category: "Tecnología",
    type: "Competencia",
    organizer: "Club de Programación",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=programming%20club%20logo%20modern%20tech%20icon&image_size=square",
    attendees: 156,
    maxAttendees: 200,
    price: 0,
    tags: ["IA", "Programación", "Competencia", "Premios"],
    status: "upcoming",
    isRegistered: false,
    isFeatured: true,
    difficulty: "Intermedio",
    duration: "2 días",
    prizes: ["$500", "$300", "$200"],
    requirements: ["Laptop", "Conocimientos básicos de programación"]
  },
  {
    id: "2",
    title: "Conferencia de Sostenibilidad",
    description: "Charlas sobre medio ambiente y desarrollo sostenible",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=sustainability%20conference%20green%20environment%20students%20presentation&image_size=landscape_4_3",
    date: "2024-02-20",
    time: "14:00",
    endTime: "17:00",
    location: "Sala de Conferencias",
    category: "Académico",
    type: "Conferencia",
    organizer: "Club de Medio Ambiente",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=environmental%20club%20logo%20green%20nature%20icon&image_size=square",
    attendees: 89,
    maxAttendees: 150,
    price: 15,
    tags: ["Sostenibilidad", "Medio Ambiente", "Conferencia"],
    status: "upcoming",
    isRegistered: true,
    isFeatured: false,
    difficulty: "Principiante",
    duration: "3 horas",
    speakers: ["Dr. Ana García", "Prof. Carlos López"]
  },
  {
    id: "3",
    title: "Torneo de Debate Universitario",
    description: "Competencia de debate sobre temas de actualidad",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=university%20debate%20tournament%20students%20speaking%20academic%20competition&image_size=landscape_4_3",
    date: "2024-02-25",
    time: "10:00",
    endTime: "16:00",
    location: "Aula Magna",
    category: "Extracurricular",
    type: "Competencia",
    organizer: "Club de Debate",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=debate%20club%20logo%20speech%20academic%20icon&image_size=square",
    attendees: 45,
    maxAttendees: 60,
    price: 10,
    tags: ["Debate", "Oratoria", "Competencia", "Académico"],
    status: "upcoming",
    isRegistered: false,
    isFeatured: true,
    difficulty: "Avanzado",
    duration: "6 horas",
    prizes: ["Trofeo", "Certificado", "Beca parcial"]
  }
];

const categories = ["Todos", "Académico", "Tecnología", "Arte", "Deportivo", "Extracurricular"];
const types = ["Todos", "Conferencia", "Taller", "Competencia", "Social", "Deportivo"];
const sortOptions = [
  { value: "date", label: "Fecha" },
  { value: "popularity", label: "Popularidad" },
  { value: "price", label: "Precio" },
  { value: "name", label: "Nombre" }
];

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedType, setSelectedType] = useState("Todos");
  const [sortBy, setSortBy] = useState("date");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [showCreateEvent, setShowCreateEvent] = useState(false);

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
    totalEvents: mockEvents.length,
    upcomingEvents: mockEvents.filter(e => e.status === "upcoming").length,
    myEvents: mockEvents.filter(e => e.isRegistered).length,
    totalAttendees: mockEvents.reduce((sum, e) => sum + e.attendees, 0)
  };

  if (selectedEvent) {
    const event = mockEvents.find(e => e.id === selectedEvent);
    if (event) {
      return (
        <EventDetail 
          event={event} 
          onBack={() => setSelectedEvent(null)}
        />
      );
    }
  }

  if (showCreateEvent) {
    return (
      <CreateEvent 
        onCancel={() => setShowCreateEvent(false)}
        onSuccess={() => {
          setShowCreateEvent(false);
          // Refresh events list
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
            <TabsTrigger value="my-events" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Mis Eventos
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear Evento
            </TabsTrigger>
          </TabsList>

          {/* Browse Events Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar eventos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Featured Events */}
            {featuredEvents.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Eventos Destacados</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => setSelectedEvent(event.id)}
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
              
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => setSelectedEvent(event.id)}
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
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("Todos");
                        setSelectedType("Todos");
                      }}
                      variant="outline"
                    >
                      Limpiar Filtros
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <EventCalendar 
              events={mockEvents} 
              onEventClick={setSelectedEvent}
              onCreateEvent={() => setShowCreateEvent(true)}
            />
          </TabsContent>

          {/* My Events Tab */}
          <TabsContent value="my-events">
            <MyEvents events={mockEvents} onEventClick={setSelectedEvent} />
          </TabsContent>

          {/* Create Event Tab */}
          <TabsContent value="create">
            <CreateEvent 
              onCancel={() => setActiveTab("browse")}
              onSuccess={() => {
                setActiveTab("browse");
                // Refresh events list
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}