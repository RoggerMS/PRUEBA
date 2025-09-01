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
  DollarSign,
  Building
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isOnline: boolean;
  category: string;
  tags: string[];
  maxAttendees: number | null;
  currentAttendees: number;
  imageUrl: string | null;
  price: number;
  isRegistered: boolean;
  canEdit: boolean;
  organizer: {
    id: string;
    name: string;
    image: string | null;
  };
  club: {
    id: string;
    name: string;
    imageUrl: string | null;
  } | null;
  createdAt: string;
}

interface EventCardProps {
  event: Event;
  onClick: () => void;
  onRegister?: (eventId: string) => void;
  onUnregister?: (eventId: string) => void;
  loading?: boolean;
}

export function EventCard({ event, onClick, onRegister, onUnregister, loading = false }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = () => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (now < startDate) return { status: 'upcoming', label: 'Próximo', color: 'bg-green-100 text-green-800' };
    if (now >= startDate && now <= endDate) return { status: 'ongoing', label: 'En curso', color: 'bg-blue-100 text-blue-800' };
    return { status: 'completed', label: 'Finalizado', color: 'bg-gray-100 text-gray-800' };
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
      case 'SPORTS': return 'Deportivo';
      case 'SOCIAL': return 'Social';
      case 'WORKSHOP': return 'Taller';
      case 'CONFERENCE': return 'Conferencia';
      default: return category;
    }
  };

  const eventStatus = getEventStatus();
  const defaultImage = "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=academic%20event%20university%20students%20modern%20colorful&image_size=landscape_4_3";

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={event.imageUrl || defaultImage} 
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={getCategoryColor(event.category)}>
            {getCategoryLabel(event.category)}
          </Badge>
          {event.isOnline && (
            <Badge className="bg-blue-500 text-white border-0">
              Online
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={eventStatus.color}>
            {eventStatus.label}
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
          {event.price > 0 && (
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
            <span>{formatDate(event.startDate)}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{formatTime(event.startDate)}</span>
            {event.endDate && <span>- {formatTime(event.endDate)}</span>}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{event.isOnline ? 'Evento Online' : event.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{event.currentAttendees}/{event.maxAttendees || '∞'} participantes</span>
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
            src={event.organizer.image || '/default-avatar.png'} 
            alt={event.organizer.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {event.organizer.name}
            </p>
            <p className="text-xs text-gray-500">
              Organizador
            </p>
          </div>
        </div>

        {/* Club */}
        {event.club && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <img 
              src={event.club.imageUrl || '/default-club.png'} 
              alt={event.club.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {event.club.name}
              </p>
              <p className="text-xs text-gray-500">
                Club
              </p>
            </div>
          </div>
        )}

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
          {(onRegister || onUnregister) && eventStatus.status === 'upcoming' ? (
            event.isRegistered ? (
              <Button 
                variant="outline" 
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnregister?.(event.id);
                }}
                disabled={loading}
              >
                <Star className="h-4 w-4 mr-2 fill-current" />
                {loading ? 'Cancelando...' : 'Registrado'}
              </Button>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegister?.(event.id);
                }}
                disabled={loading || (event.maxAttendees && event.currentAttendees >= event.maxAttendees)}
              >
                {loading ? 'Registrando...' : 
                 (event.maxAttendees && event.currentAttendees >= event.maxAttendees) ? 'Evento Lleno' : 'Registrarse'}
              </Button>
            )
          ) : (
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Ver Detalles
            </Button>
          )}
        </div>

        {/* Progress Bar for Attendees */}
        {event.maxAttendees && (
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
        )}
      </CardContent>
    </Card>
  );
}