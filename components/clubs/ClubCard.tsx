'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MapPin, Calendar, Star, Heart, MessageCircle } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  maxMembers?: number;
  location: string;
  meetingDay: string;
  rating: number;
  image?: string;
  tags: string[];
  isJoined: boolean;
  isFavorite: boolean;
  president: {
    name: string;
    avatar?: string;
  };
  nextEvent?: {
    title: string;
    date: string;
  };
}

interface ClubCardProps {
  club: Club;
  onJoin?: (clubId: string) => void;
  onLeave?: (clubId: string) => void;
  onFavorite?: (clubId: string) => void;
  onViewDetails?: (clubId: string) => void;
}

export default function ClubCard({ 
  club, 
  onJoin, 
  onLeave, 
  onFavorite, 
  onViewDetails 
}: ClubCardProps) {
  const handleJoinLeave = () => {
    if (club.isJoined) {
      onLeave?.(club.id);
    } else {
      onJoin?.(club.id);
    }
  };

  const handleFavorite = () => {
    onFavorite?.(club.id);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Académico': 'bg-blue-100 text-blue-800',
      'Deportes': 'bg-green-100 text-green-800',
      'Arte': 'bg-purple-100 text-purple-800',
      'Tecnología': 'bg-orange-100 text-orange-800',
      'Voluntariado': 'bg-pink-100 text-pink-800',
      'Música': 'bg-indigo-100 text-indigo-800',
      'Literatura': 'bg-yellow-100 text-yellow-800',
      'Ciencias': 'bg-teal-100 text-teal-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating?: number) => {
    const safeRating = rating ?? 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(safeRating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {club.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className="p-1 h-auto"
              >
                <Heart 
                  className={`h-4 w-4 ${
                    club.isFavorite 
                      ? 'text-red-500 fill-current' 
                      : 'text-gray-400 hover:text-red-500'
                  }`} 
                />
              </Button>
            </div>
            <CardDescription className="line-clamp-2">
              {club.description}
            </CardDescription>
          </div>
          {club.image && (
            <div className="ml-4">
              <img 
                src={club.image} 
                alt={club.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Badge className={getCategoryColor(club.category)}>
            {club.category}
          </Badge>
          <div className="flex items-center gap-1">
            {renderStars(club.rating)}
            <span className="text-sm text-gray-600 ml-1">
              ({club.rating !== undefined ? club.rating.toFixed(1) : 'N/A'})
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información del Club */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {club.memberCount}
              {club.maxMembers && ` / ${club.maxMembers}`} miembros
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{club.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 col-span-2">
            <Calendar className="h-4 w-4" />
            <span>Reuniones: {club.meetingDay}</span>
          </div>
        </div>

        {/* Presidente del Club */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarImage src={club.president?.avatar ?? undefined} />
            <AvatarFallback>
              {club.president?.name
                ? club.president.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                : 'NA'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {club.president?.name ?? 'Presidente no asignado'}
            </p>
            <p className="text-xs text-gray-500">Presidente</p>
          </div>
        </div>

        {/* Próximo Evento */}
        {club.nextEvent && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Próximo Evento</span>
            </div>
            <p className="text-sm text-blue-700">{club.nextEvent.title}</p>
            <p className="text-xs text-blue-600">
              {new Date(club.nextEvent.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}

        {/* Tags */}
        {club.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {club.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {club.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{club.tags.length - 3} más
              </Badge>
            )}
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleJoinLeave}
            variant={club.isJoined ? "outline" : "default"}
            size="sm"
            className="flex-1"
            disabled={!club.isJoined && club.maxMembers && club.memberCount >= club.maxMembers}
          >
            {club.isJoined ? 'Abandonar' : 
             (club.maxMembers && club.memberCount >= club.maxMembers) ? 'Lleno' : 'Unirse'}
          </Button>
          <Button
            onClick={() => onViewDetails?.(club.id)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            Ver Más
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}