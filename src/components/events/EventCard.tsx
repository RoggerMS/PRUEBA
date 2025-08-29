"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { gamificationService } from "@/services/gamificationService";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Heart, 
  Share2, 
  Star,
  DollarSign,
  Award,
  Eye,
  UserPlus,
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
  prizes?: string[];
  requirements?: string[];
  speakers?: string[];
}

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(event.isRegistered);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    
    // Grant XP for liking an event (only when liking, not unliking)
    if (!wasLiked) {
      try {
        gamificationService.grantXP("user-id", 3, "event", event.id, 'Dar like a evento');
      } catch (error) {
        console.error('Error granting XP for event like:', error);
      }
    }
  };

  const handleRegister = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRegistering(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const wasRegistered = isRegistered;
    setIsRegistered(!isRegistered);
    setIsRegistering(false);
    
    // Grant XP for event registration (only when registering, not unregistering)
    if (!wasRegistered) {
      try {
        gamificationService.grantXP("user-id", 15, "event", event.id, 'Registrarse a evento');
      } catch (error) {
        console.error('Error granting XP for event registration:', error);
      }
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      case 'Académico': return 'bg-purple-100 text-purple-800';
      case 'Tecnología': return 'bg-blue-100 text-blue-800';
      case 'Arte': return 'bg-pink-100 text-pink-800';
      case 'Deportivo': return 'bg-green-100 text-green-800';
      case 'Extracurricular': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const attendancePercentage = (event.attendees / event.maxAttendees) * 100;

  return (
    <Card 
      className="group cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {event.isFeatured && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              <Star className="h-3 w-3 mr-1" />
              Destacado
            </Badge>
          )}
          <Badge className={getStatusColor(event.status)}>
            {event.status === 'upcoming' ? 'Próximo' : 
             event.status === 'ongoing' ? 'En curso' :
             event.status === 'completed' ? 'Finalizado' : 'Cancelado'}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        {/* Price badge */}
        {event.price > 0 && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-green-500 text-white border-0">
              <DollarSign className="h-3 w-3 mr-1" />
              ${event.price}
            </Badge>
          </div>
        )}
        
        {event.price === 0 && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-blue-500 text-white border-0">
              Gratis
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Title and Category */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
              {event.title}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={getCategoryColor(event.category)}>
              {event.category}
            </Badge>
            <Badge variant="outline">
              {event.type}
            </Badge>
            {event.difficulty && (
              <Badge variant="outline" className="text-xs">
                {event.difficulty}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>
              {event.time}
              {event.endTime && ` - ${event.endTime}`}
              {event.duration && ` (${event.duration})`}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-500" />
            <span>{event.location}</span>
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-3">
          <img 
            src={event.organizerAvatar} 
            alt={event.organizer}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">{event.organizer}</p>
            <p className="text-xs text-gray-500">Organizador</p>
          </div>
        </div>

        {/* Attendance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{event.attendees} / {event.maxAttendees} participantes</span>
            </div>
            <span className="text-xs text-gray-500">
              {Math.round(attendancePercentage)}% ocupado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
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

        {/* Prizes */}
        {event.prizes && event.prizes.length > 0 && (
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600">
              Premios: {event.prizes.slice(0, 2).join(", ")}
              {event.prizes.length > 2 && "..."}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalles
          </Button>
          
          {event.status === 'upcoming' && (
            <Button 
              size="sm" 
              className={`flex-1 ${isRegistered 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
              }`}
              onClick={handleRegister}
              disabled={isRegistering || event.attendees >= event.maxAttendees}
            >
              {isRegistering ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </div>
              ) : isRegistered ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Registrado
                </div>
              ) : event.attendees >= event.maxAttendees ? (
                "Lleno"
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Registrarse
                </div>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
