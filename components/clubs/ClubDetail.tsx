'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Star, 
  Heart, 
  MessageCircle, 
  Trophy,
  Clock,
  Mail,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';

interface ClubMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  joinDate: string;
}

interface ClubEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: number;
  maxAttendees?: number;
}

interface ClubAchievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

interface Club {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  memberCount: number;
  maxMembers?: number;
  location: string;
  meetingDay: string;
  meetingTime: string;
  rating: number;
  image?: string;
  coverImage?: string;
  tags: string[];
  isJoined: boolean;
  isFavorite: boolean;
  foundedDate: string;
  contact: {
    email?: string;
    phone?: string;
    website?: string;
    social?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
  };
  president: {
    name: string;
    avatar?: string;
    email?: string;
  };
  members: ClubMember[];
  events: ClubEvent[];
  achievements: ClubAchievement[];
}

interface ClubDetailProps {
  club: Club;
  onJoin?: (clubId: string) => void;
  onLeave?: (clubId: string) => void;
  onFavorite?: (clubId: string) => void;
  onClose?: () => void;
}

export default function ClubDetail({ 
  club, 
  onJoin, 
  onLeave, 
  onFavorite, 
  onClose 
}: ClubDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

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

  const upcomingEvents = club.events.filter(event => new Date(event.date) > new Date());
  const pastEvents = club.events.filter(event => new Date(event.date) <= new Date());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header con imagen de portada */}
      <Card>
        <div className="relative">
          {club.coverImage && (
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
              <img 
                src={club.coverImage} 
                alt={club.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleFavorite}
              className="bg-white/90 hover:bg-white"
            >
              <Heart 
                className={`h-4 w-4 ${
                  club.isFavorite 
                    ? 'text-red-500 fill-current' 
                    : 'text-gray-600'
                }`} 
              />
            </Button>
            {onClose && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="bg-white/90 hover:bg-white"
              >
                ×
              </Button>
            )}
          </div>
        </div>
        
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {club.image && (
                  <img 
                    src={club.image} 
                    alt={club.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <CardTitle className="text-2xl">{club.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
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
                </div>
              </div>
              <CardDescription className="text-base">
                {club.description}
              </CardDescription>
            </div>
            
            <div className="ml-6">
              <Button
                onClick={handleJoinLeave}
                size="lg"
                variant={club.isJoined ? "outline" : "default"}
                disabled={!club.isJoined && club.maxMembers && club.memberCount >= club.maxMembers}
              >
                {club.isJoined ? 'Abandonar Club' : 
                 (club.maxMembers && club.memberCount >= club.maxMembers) ? 'Club Lleno' : 'Unirse al Club'}
              </Button>
            </div>
          </div>

          {/* Información rápida */}
          <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <Users className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold">{club.memberCount}</p>
              <p className="text-sm text-gray-600">Miembros</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <Calendar className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold">{upcomingEvents.length}</p>
              <p className="text-sm text-gray-600">Eventos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <Trophy className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold">{club.achievements.length}</p>
              <p className="text-sm text-gray-600">Logros</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <Clock className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold">
                {new Date().getFullYear() - new Date(club.foundedDate).getFullYear()}
              </p>
              <p className="text-sm text-gray-600">Años</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenido con tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Información</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="achievements">Logros</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acerca del Club</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{club.longDescription}</p>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Detalles</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{club.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{club.meetingDay} a las {club.meetingTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Fundado en {new Date(club.foundedDate).getFullYear()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Contacto</h4>
                  <div className="space-y-2 text-sm">
                    {club.contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{club.contact.email}</span>
                      </div>
                    )}
                    {club.contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{club.contact.phone}</span>
                      </div>
                    )}
                    {club.contact.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span>{club.contact.website}</span>
                      </div>
                    )}
                  </div>
                  
                  {club.contact.social && (
                    <div className="flex gap-2 mt-3">
                      {club.contact.social.instagram && (
                        <Button variant="outline" size="sm">
                          <Instagram className="h-4 w-4" />
                        </Button>
                      )}
                      {club.contact.social.facebook && (
                        <Button variant="outline" size="sm">
                          <Facebook className="h-4 w-4" />
                        </Button>
                      )}
                      {club.contact.social.twitter && (
                        <Button variant="outline" size="sm">
                          <Twitter className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {club.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Etiquetas</h4>
                  <div className="flex flex-wrap gap-2">
                    {club.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          {/* Presidente */}
          <Card>
            <CardHeader>
              <CardTitle>Directiva</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={club.president.avatar} />
                  <AvatarFallback>
                    {club.president.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{club.president.name}</h4>
                  <p className="text-sm text-gray-600">Presidente</p>
                  {club.president.email && (
                    <p className="text-sm text-blue-600">{club.president.email}</p>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de miembros */}
          <Card>
            <CardHeader>
              <CardTitle>Miembros ({club.members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {club.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Desde {new Date(member.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge variant="outline">
                          {event.attendees}
                          {event.maxAttendees && `/${event.maxAttendees}`} asistentes
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {pastEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Eventos Pasados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-medium">{event.title}</h5>
                          <p className="text-sm text-gray-600">
                            {new Date(event.date).toLocaleDateString()} • {event.location}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {event.attendees} asistentes
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logros del Club</CardTitle>
            </CardHeader>
            <CardContent>
              {club.achievements.length > 0 ? (
                <div className="space-y-4">
                  {club.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-gray-600 text-sm">{achievement.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aún no hay logros registrados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}