"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  Plus,
  Eye,
  Star,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  category: string;
  type: string;
  organizer: string;
  organizerAvatar: string;
  attendees: number;
  maxAttendees: number;
  price: number;
  tags: string[];
  status: string;
  isRegistered: boolean;
  isFeatured: boolean;
  difficulty?: string;
  duration?: string;
}

interface EventCalendarProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
}

export function EventCalendar({ events, onEventClick }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const categories = ['all', 'Académico', 'Tecnología', 'Arte', 'Deportivo', 'Extracurricular'];
  const eventTypes = ['all', 'Presencial', 'Virtual', 'Híbrido'];

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesType = selectedType === 'all' || event.type === selectedType;
    return matchesCategory && matchesType;
  });

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => event.date === dateString);
  };

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const days = direction === 'prev' ? -7 : 7;
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const days = direction === 'prev' ? -1 : 1;
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const navigate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'month': navigateMonth(direction); break;
      case 'week': navigateWeek(direction); break;
      case 'day': navigateDay(direction); break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Generate week days for week view
  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Tecnología': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Académico': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Arte': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Deportivo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Extracurricular': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'ongoing': return <AlertCircle className="h-3 w-3 text-blue-600" />;
      case 'completed': return <CheckCircle className="h-3 w-3 text-gray-600" />;
      default: return null;
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const renderMonthView = () => {
    const days = generateCalendarDays();
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonthDay = isCurrentMonth(day);
          const isTodayDay = isToday(day);
          
          return (
            <div 
              key={index}
              className={`min-h-[120px] p-1 border border-gray-200 ${
                isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'
              } ${
                isTodayDay ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
              } ${
                isTodayDay ? 'text-purple-600' : ''
              }`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id}
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                      getCategoryColor(event.category)
                    }`}
                    onClick={() => onEventClick(event.id)}
                    title={event.title}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(event.status)}
                      <span className="truncate">{event.title}</span>
                      {event.isFeatured && <Star className="h-2 w-2 fill-current" />}
                    </div>
                    <div className="text-xs opacity-75">
                      {formatTime(event.time)}
                    </div>
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = generateWeekDays();
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isTodayDay = isToday(day);
          
          return (
            <div key={index} className="space-y-2">
              <div className={`text-center p-2 rounded ${
                isTodayDay ? 'bg-purple-100 text-purple-800' : 'bg-gray-50'
              }`}>
                <div className="text-xs text-gray-600">
                  {dayNames[day.getDay()]}
                </div>
                <div className={`text-lg font-semibold ${
                  isTodayDay ? 'text-purple-600' : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>
              </div>
              
              <div className="space-y-1 min-h-[400px]">
                {dayEvents.map(event => (
                  <Card 
                    key={event.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onEventClick(event.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        {getStatusIcon(event.status)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{event.title}</h4>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.time)}
                          </p>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.location}</span>
                          </p>
                          <Badge className={`text-xs mt-1 ${getCategoryColor(event.category)}`}>
                            {event.category}
                          </Badge>
                        </div>
                        {event.isFeatured && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const isTodayDay = isToday(currentDate);
    
    return (
      <div className="space-y-4">
        <div className={`text-center p-4 rounded-lg ${
          isTodayDay ? 'bg-purple-100' : 'bg-gray-50'
        }`}>
          <h3 className={`text-2xl font-bold ${
            isTodayDay ? 'text-purple-600' : 'text-gray-900'
          }`}>
            {formatDate(currentDate)}
          </h3>
          <p className="text-gray-600">
            {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''} programado{dayEvents.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {dayEvents.length > 0 ? (
          <div className="space-y-4">
            {dayEvents.map(event => (
              <Card 
                key={event.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onEventClick(event.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(event.status)}
                          {event.isFeatured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(event.time)}</span>
                          {event.endTime && <span>- {formatTime(event.endTime)}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{event.attendees}/{event.maxAttendees}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                        <Badge variant="outline">
                          {event.type}
                        </Badge>
                        {event.price > 0 && (
                          <Badge variant="secondary">
                            ${event.price}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay eventos programados
              </h3>
              <p className="text-gray-600">
                No se encontraron eventos para esta fecha
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Calendario de Eventos
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Visualiza todos los eventos programados en un calendario interactivo
        </p>
      </div>

      {/* Controls */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center min-w-[200px]">
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewMode === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                  {viewMode === 'week' && `Semana del ${formatDate(generateWeekDays()[0])}`}
                  {viewMode === 'day' && formatDate(currentDate)}
                </h3>
              </div>
              
              <Button variant="outline" onClick={() => navigate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" onClick={goToToday}>
                Hoy
              </Button>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Mes
              </Button>
              <Button 
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                <List className="h-4 w-4 mr-2" />
                Semana
              </Button>
              <Button 
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Día
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
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

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {eventTypes.slice(1).map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Content */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(1).map(category => (
              <div key={category} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border ${getCategoryColor(category)}`} />
                <span className="text-sm text-gray-700">{category}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">Próximo</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700">En curso</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Finalizado</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-700">Destacado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}