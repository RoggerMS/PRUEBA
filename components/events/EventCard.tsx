"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  Award,
  DollarSign
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
  prizes?: string[];
  requirements?: string[];
  speakers?: string[];
}

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
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
      case 'Tecnología': return 'bg-purple-100 text-purple-800';
      case 'Académico': return 'bg-blue-100 text-blue-800';
      case 'Arte': return 'bg-pink-100 text-pink-800';
      case 'Deportivo': return 'bg-green-100 text-green-800';
      case 'Extracurricular': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {event.isFeatured && (
            <Badge className="bg-yellow-500 text-white border-0">
              <Star className="h-3 w-3 mr-1" />
              Destacado
            </Badge>
          )}
          <Badge className={getCategoryColor(event.category)}>
            {event.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={getStatusColor(event.status)}>
            {event.status === 'upcoming' ? 'Próximo' : 
             event.status === 'ongoing' ? 'En curso' :
             event.status === 'completed' ? 'Finalizado' : 'Cancelado'}
          </Badge>
        </div>
        {event.price === 0 && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-green-500 text-white border-0">
              GRATIS
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {event.title}
          </h3>
          {event.prizes && event.prizes.length > 0 && (
            <Award className="h-5 w-5 text-yellow-500 flex-shrink-0" />
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
            <span>{formatDate(event.date)}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{event.time}</span>
            {event.endTime && <span>- {event.endTime}</span>}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{event.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{event.attendees}/{event.maxAttendees} participantes</span>
          </div>

          {event.price > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>${event.price}</span>
            </div>
          )}
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <img 
            src={event.organizerAvatar} 
            alt={event.organizer}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {event.organizer}
            </p>
            <p className="text-xs text-gray-500">
              Organizador
            </p>
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {event.isRegistered ? (
            <Button 
              variant="outline" 
              className="w-full border-green-200 text-green-700 hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation();
                // Handle unregister
              }}
            >
              <Star className="h-4 w-4 mr-2 fill-current" />
              Registrado
            </Button>
          ) : (
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                // Handle register
              }}
            >
              Ver Detalles
            </Button>
          )}
        </div>

        {/* Progress Bar for Attendees */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Ocupación</span>
            <span>{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}