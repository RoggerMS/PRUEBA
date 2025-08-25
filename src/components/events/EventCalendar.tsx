"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users,
  Filter,
  Grid3X3,
  List,
  Plus,
  Eye,
  Star
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
}

interface EventCalendarProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
  onCreateEvent: () => void;
}

// Mock events for calendar demonstration
const mockCalendarEvents = [
  {
    id: "1",
    title: "Hackathon IA",
    description: "Competencia de 48 horas para desarrollar soluciones innovadoras con IA",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20hackathon%20event&image_size=landscape_4_3",
    date: "2024-02-15",
    time: "09:00",
    endTime: "18:00",
    location: "Auditorio Principal",
    category: "Tecnología",
    type: "Competencia",
    organizer: "Club de Programación",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=programming%20club%20logo&image_size=square",
    attendees: 156,
    maxAttendees: 200,
    price: 0,
    tags: ["IA", "Programación"],
    status: "upcoming",
    isRegistered: true,
    isFeatured: true
  },
  {
    id: "2",
    title: "Conferencia Sostenibilidad",
    description: "Charlas sobre medio ambiente y desarrollo sostenible",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=sustainability%20conference&image_size=landscape_4_3",
    date: "2024-02-20",
    time: "14:00",
    endTime: "17:00",
    location: "Sala de Conferencias",
    category: "Académico",
    type: "Conferencia",
    organizer: "Club de Medio Ambiente",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=environmental%20club%20logo&image_size=square",
    attendees: 89,
    maxAttendees: 150,
    price: 15,
    tags: ["Sostenibilidad", "Medio Ambiente"],
    status: "upcoming",
    isRegistered: false,
    isFeatured: false
  },
  {
    id: "3",
    title: "Taller React",
    description: "Aprende las últimas tecnologías de React",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=react%20workshop%20coding&image_size=landscape_4_3",
    date: "2024-02-22",
    time: "10:00",
    endTime: "16:00",
    location: "Lab de Computación",
    category: "Tecnología",
    type: "Taller",
    organizer: "Departamento de Sistemas",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=computer%20science%20department&image_size=square",
    attendees: 25,
    maxAttendees: 30,
    price: 20,
    tags: ["React", "JavaScript"],
    status: "upcoming",
    isRegistered: true,
    isFeatured: false
  },
  {
    id: "4",
    title: "Seminario Emprendimiento",
    description: "Estrategias para crear y hacer crecer tu startup",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=entrepreneurship%20seminar&image_size=landscape_4_3",
    date: "2024-02-25",
    time: "15:00",
    endTime: "18:00",
    location: "Aula de Negocios",
    category: "Extracurricular",
    type: "Seminario",
    organizer: "Centro de Emprendimiento",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=entrepreneurship%20center&image_size=square",
    attendees: 45,
    maxAttendees: 50,
    price: 0,
    tags: ["Emprendimiento", "Startup"],
    status: "upcoming",
    isRegistered: false,
    isFeatured: true
  }
];

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function EventCalendar({ events, onEventClick, onCreateEvent }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Use mock data for demonstration
  const calendarEvents = mockCalendarEvents;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => event.date === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const renderCalendarGrid = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-100 bg-gray-50/50" />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayEvents = getEventsForDate(date);
      const isCurrentDay = isToday(date);
      const isSelected = isSelectedDate(date);

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-100 p-1 cursor-pointer transition-colors hover:bg-purple-50 ${
            isCurrentDay ? 'bg-blue-50 border-blue-200' : 'bg-white'
          } ${
            isSelected ? 'bg-purple-100 border-purple-300' : ''
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentDay ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {day}
          </div>
          
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded truncate cursor-pointer transition-colors ${
                  event.category === 'Tecnología' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                  event.category === 'Académico' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                  event.category === 'Deportes' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                  event.category === 'Arte' ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' :
                  'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event.id);
                }}
                title={event.title}
              >
                {event.isFeatured && <Star className="inline h-2 w-2 mr-1" />}
                {event.title}
              </div>
            ))}
            
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 font-medium">
                +{dayEvents.length - 2} más
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderListView = () => {
    const today = new Date();
    const upcomingEvents = calendarEvents
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div className="space-y-4">
        {upcomingEvents.map(event => {
          const eventDate = new Date(event.date);
          const isEventToday = isToday(eventDate);
          
          return (
            <Card key={event.id} className={`cursor-pointer transition-all hover:shadow-md ${
              isEventToday ? 'border-blue-300 bg-blue-50/50' : 'bg-white'
            }`} onClick={() => onEventClick(event.id)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`text-center p-2 rounded-lg ${
                      isEventToday ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <div className="text-xs font-medium">
                        {eventDate.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                      </div>
                      <div className="text-lg font-bold">
                        {eventDate.getDate()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {event.isFeatured && <Star className="inline h-4 w-4 text-yellow-500 mr-1" />}
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Badge 
                          variant="secondary"
                          className={`${
                            event.category === 'Tecnología' ? 'bg-purple-100 text-purple-700' :
                            event.category === 'Académico' ? 'bg-green-100 text-green-700' :
                            event.category === 'Deportes' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {event.category}
                        </Badge>
                        
                        {event.isRegistered && (
                          <Badge className="bg-green-100 text-green-700">
                            Registrado
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.time}
                        {event.endTime && ` - ${event.endTime}`}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.attendees}/{event.maxAttendees}
                      </div>
                      
                      {event.price > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          {event.price} Crolars
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {upcomingEvents.length === 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos próximos</h3>
              <p className="text-gray-600 mb-4">
                No se encontraron eventos programados para las próximas fechas.
              </p>
              <Button 
                onClick={onCreateEvent}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Evento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-purple-600" />
                Calendario de Eventos
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <h2 className="text-lg font-semibold min-w-[200px] text-center">
                  {months[currentMonth]} {currentYear}
                </h2>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className="h-8"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                onClick={onCreateEvent}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Evento
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Content */}
      {viewMode === 'month' ? (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-0">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {weekDays.map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 bg-gray-50">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {renderCalendarGrid()}
            </div>
          </CardContent>
        </Card>
      ) : (
        renderListView()
      )}

      {/* Selected Date Events */}
      {selectedDate && viewMode === 'month' && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Eventos del {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedDate(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const dayEvents = getEventsForDate(selectedDate);
              
              if (dayEvents.length === 0) {
                return (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay eventos programados para esta fecha</p>
                    <Button 
                      onClick={onCreateEvent}
                      variant="outline"
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Evento
                    </Button>
                  </div>
                );
              }
              
              return (
                <div className="space-y-3">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => onEventClick(event.id)}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {event.isFeatured && <Star className="inline h-4 w-4 text-yellow-500 mr-1" />}
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{event.category}</Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}