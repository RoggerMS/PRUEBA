"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyEvents } from "@/hooks/useEvents";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Heart,
  Share2,
  Building
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  type: string;
  organizer: {
    name: string;
    image?: string;
  };
  club: {
    name: string;
    imageUrl?: string;
  };
  currentAttendees: number;
  maxAttendees: number;
  price: number;
  isRegistered: boolean;
  isOnline: boolean;
  imageUrl?: string;
  canEdit: boolean;
  tags?: string[];
}

interface MyEventsProps {
  onEventClick: (eventId: string) => void;
}

export function MyEvents({ onEventClick }: MyEventsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [activeTab, setActiveTab] = useState("registered");
  const [page, setPage] = useState(1);

  const { data: myEventsData, isLoading, error } = useMyEvents({
    type: activeTab === 'registered' ? 'registered' : activeTab === 'organized' ? 'organized' : 'past',
    page,
    limit: 10
  });

  const events = myEventsData?.events || [];
  const stats = myEventsData?.stats || { totalOrganized: 0, totalAttended: 0 };

  // Filter events based on current tab
  const getEventsForTab = () => {
    const now = new Date();
    switch (activeTab) {
      case 'registered': 
        return events.filter(event => event.isRegistered);
      case 'organized': 
        return events.filter(event => event.canEdit);
      case 'attended': 
        return events.filter(event => new Date(event.endDate) < now && event.isRegistered);
      case 'upcoming': 
        return events.filter(event => new Date(event.startDate) > now && event.isRegistered);
      default: 
        return events;
    }
  };

  const filteredEvents = getEventsForTab().filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const eventStatus = getEventStatus(event);
    const matchesStatus = selectedStatus === "all" || eventStatus === selectedStatus;
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'completed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'TECHNOLOGY': return 'bg-purple-100 text-purple-800';
      case 'ACADEMIC': return 'bg-blue-100 text-blue-800';
      case 'ARTS': return 'bg-pink-100 text-pink-800';
      case 'SPORTS': return 'bg-green-100 text-green-800';
      case 'SOCIAL': return 'bg-orange-100 text-orange-800';
      case 'WORKSHOP': return 'bg-indigo-100 text-indigo-800';
      case 'CONFERENCE': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'TECHNOLOGY': return 'Tecnología';
      case 'ACADEMIC': return 'Académico';
      case 'ARTS': return 'Arte';
      case 'SPORTS': return 'Deportes';
      case 'SOCIAL': return 'Social';
      case 'WORKSHOP': return 'Taller';
      case 'CONFERENCE': return 'Conferencia';
      default: return category;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ongoing': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const eventStats = {
    registered: events.filter(event => event.isRegistered).length,
    organized: events.filter(event => event.canEdit).length,
    attended: events.filter(event => {
      const now = new Date();
      return new Date(event.endDate) < now && event.isRegistered;
    }).length,
    upcoming: events.filter(event => {
      const now = new Date();
      return new Date(event.startDate) > now && event.isRegistered;
    }).length
  };

  const categories = ["all", "TECHNOLOGY", "ACADEMIC", "ARTS", "SPORTS", "SOCIAL", "WORKSHOP", "CONFERENCE"];
  const statuses = ["all", "upcoming", "ongoing", "completed"];
  const sortOptions = [
    { value: "date", label: "Fecha" },
    { value: "name", label: "Nombre" },
    { value: "category", label: "Categoría" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Mis Eventos
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gestiona tus eventos registrados, favoritos y historial de participación
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{eventStats.registered}</p>
                <p className="text-sm text-gray-600">Registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{eventStats.organized}</p>
                <p className="text-sm text-gray-600">Organizados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{eventStats.attended}</p>
                <p className="text-sm text-gray-600">Completados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{eventStats.upcoming}</p>
                <p className="text-sm text-gray-600">Próximos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/50 backdrop-blur-sm p-1 rounded-lg">
        {[
          { id: 'registered', label: 'Registrados', icon: CheckCircle },
          { id: 'organized', label: 'Organizados', icon: Building },
          { id: 'attended', label: 'Completados', icon: Calendar },
          { id: 'upcoming', label: 'Próximos', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
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
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.slice(1).map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {statuses.slice(1).map(status => (
                      <SelectItem key={status} value={status}>
                        {status === 'upcoming' ? 'Próximo' : 
                         status === 'ongoing' ? 'En curso' :
                         status === 'completed' ? 'Finalizado' : 'Cancelado'}
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

        {/* Events List */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedEvents.map(event => (
              <Card 
                key={event.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden"
                onClick={() => onEventClick(event.id)}
              >
                <div className="relative">
                  <img 
                    src={event.imageUrl || `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=academic%20event%20${encodeURIComponent(event.category)}&image_size=landscape_4_3`}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className={getCategoryColor(event.category)}>
                      {getCategoryLabel(event.category)}
                    </Badge>
                    <Badge className={getStatusColor(getEventStatus(event))}>
                      {getEventStatus(event) === 'upcoming' ? 'Próximo' : 
                       getEventStatus(event) === 'ongoing' ? 'En curso' :
                       getEventStatus(event) === 'completed' ? 'Finalizado' : 'Cancelado'}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    {getStatusIcon(getEventStatus(event))}
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {event.title}
                    </h3>
                    {event.isFeatured && (
                      <Star className="h-5 w-5 text-yellow-500 flex-shrink-0 fill-current" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {event.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.startDate)}</span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{formatTime(event.startDate)}</span>
                      {event.endDate && <span>- {formatTime(event.endDate)}</span>}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">
                        {event.isOnline ? 'Evento Virtual' : event.location}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{event.currentAttendees}/{event.maxAttendees} participantes</span>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <Building className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.organizer?.name || event.club?.name || 'Organizador'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {event.club?.name ? 'Club' : 'Organizador'}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getCategoryColor(event.category)}`}
                    >
                      {getCategoryLabel(event.category)}
                    </Badge>
                    {event.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle share
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event.id);
                      }}
                    >
                      Ver Detalles
                    </Button>
                  </div>

                  {/* Progress Bar for Attendees */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Ocupación</span>
                      <span>{Math.round((event.currentAttendees / event.maxAttendees) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(event.currentAttendees / event.maxAttendees) * 100}%` }}
                      />
                    </div>
                  </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'registered' ? 'No tienes eventos registrados' :
                   activeTab === 'favorites' ? 'No tienes eventos favoritos' :
                   activeTab === 'attended' ? 'No has completado eventos aún' :
                   'No tienes eventos próximos'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'registered' ? 'Explora eventos disponibles y regístrate en los que te interesen' :
                   activeTab === 'favorites' ? 'Marca eventos como favoritos para encontrarlos fácilmente' :
                   activeTab === 'attended' ? 'Participa en eventos para construir tu historial académico' :
                   'Los eventos en los que te registres aparecerán aquí'}
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedStatus("all");
                  }}
                  variant="outline"
                >
                  Limpiar Filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}