"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  Award,
  DollarSign,
  Share2,
  Heart,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Trophy,
  Target,
  BookOpen,
  User
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
  isFeatured?: boolean;
  difficulty?: string;
  duration?: string;
  prizes?: string[];
  requirements?: string[];
  speakers?: string[];
}

interface EventDetailProps {
  event: Event;
  onBack: () => void;
}

export function EventDetail({ event, onBack }: EventDetailProps) {
  const [isRegistered, setIsRegistered] = useState(event.isRegistered);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      case 'EXTRACURRICULAR': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'TECHNOLOGY': return 'Tecnología';
      case 'ACADEMIC': return 'Académico';
      case 'ARTS': return 'Arte';
      case 'SPORTS': return 'Deportivo';
      case 'EXTRACURRICULAR': return 'Extracurricular';
      default: return category;
    }
  };

  const handleRegister = () => {
    setIsRegistered(!isRegistered);
    // Handle registration logic
  };

  const handleShare = () => {
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

  // Mock data for additional sections
  const mockComments = [
    {
      id: "1",
      user: "Ana García",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20profile%20avatar%20female%20friendly&image_size=square",
      comment: "¡Excelente evento! Muy bien organizado y con contenido de calidad.",
      date: "2024-01-15",
      rating: 5
    },
    {
      id: "2",
      user: "Carlos López",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20profile%20avatar%20male%20professional&image_size=square",
      comment: "Aprendí mucho sobre IA. Los ponentes fueron muy claros en sus explicaciones.",
      date: "2024-01-14",
      rating: 4
    }
  ];

  const mockAgenda = [
    {
      time: "09:00 - 09:30",
      title: "Registro y Bienvenida",
      description: "Acreditación de participantes y desayuno de networking"
    },
    {
      time: "09:30 - 11:00",
      title: "Conferencia Magistral: El Futuro de la IA",
      description: "Presentación sobre las tendencias actuales y futuras de la inteligencia artificial",
      speaker: "Dr. María Rodríguez"
    },
    {
      time: "11:00 - 11:15",
      title: "Pausa para Café",
      description: "Networking y refrigerio"
    },
    {
      time: "11:15 - 12:45",
      title: "Taller Práctico: Desarrollo con IA",
      description: "Sesión práctica de programación con herramientas de IA",
      speaker: "Ing. Juan Pérez"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="bg-white/90 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex-1" />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsFavorited(!isFavorited)}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            {isFavorited ? 'Guardado' : 'Guardar'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>

        {/* Hero Section */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
          <div className="relative">
            <img 
              src={event.imageUrl || `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(event.title + ' academic event')}&image_size=landscape_16_9`} 
              alt={event.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex flex-wrap gap-2 mb-4">
                {event.isFeatured && (
                  <Badge className="bg-yellow-500 text-white border-0">
                    <Star className="h-3 w-3 mr-1" />
                    Destacado
                  </Badge>
                )}
                <Badge className={getCategoryColor(event.category)}>
                  {getCategoryLabel(event.category)}
                </Badge>
                <Badge className={getStatusColor(getEventStatus(event))}>
                  {getEventStatus(event) === 'upcoming' ? 'Próximo' : 
                   getEventStatus(event) === 'ongoing' ? 'En curso' :
                   getEventStatus(event) === 'completed' ? 'Finalizado' : 'Cancelado'}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
              <p className="text-lg opacity-90 max-w-3xl">{event.description}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
                <TabsTrigger value="speakers">Ponentes</TabsTrigger>
                <TabsTrigger value="comments">Comentarios</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Descripción del Evento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      {event.description}
                    </p>
                    
                    {event.requirements && event.requirements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Requisitos
                        </h4>
                        <ul className="space-y-1">
                          {event.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2 text-gray-600">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {event.prizes && event.prizes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          Premios
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {event.prizes.map((prize, index) => (
                            <div key={index} className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                              <Award className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                              <p className="font-semibold text-gray-900">{index + 1}° Lugar</p>
                              <p className="text-sm text-gray-600">{prize}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {event.tags && event.tags.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Etiquetas</h4>
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="agenda">
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Agenda del Evento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAgenda.map((item, index) => (
                        <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <Badge variant="outline" className="font-mono">
                              {item.time}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                            {item.speaker && (
                              <p className="text-purple-600 text-sm font-medium">
                                Ponente: {item.speaker}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="speakers">
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Ponentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {event.speakers && event.speakers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {event.speakers.map((speaker, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={`https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20speaker%20avatar%20${index}&image_size=square`} />
                              <AvatarFallback>{speaker.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900">{speaker}</h4>
                              <p className="text-sm text-gray-600">Ponente Principal</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">
                        Información de ponentes próximamente
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments">
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Comentarios y Reseñas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockComments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback>{comment.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{comment.user}</h4>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-3 w-3 ${i < comment.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-2">{comment.comment}</p>
                            <p className="text-xs text-gray-500">{new Date(comment.date).toLocaleDateString('es-ES')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Información del Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(event.startDate)}</p>
                      <p className="text-sm text-gray-600">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">{event.isOnline ? 'Evento Virtual' : event.location}</p>
                      <p className="text-sm text-gray-600">Ubicación del evento</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">{event.currentAttendees}/{event.maxAttendees || 'Sin límite'}</p>
                      <p className="text-sm text-gray-600">Participantes</p>
                    </div>
                  </div>

                  {event.price > 0 && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">${event.price}</p>
                        <p className="text-sm text-gray-600">Precio de entrada</p>
                      </div>
                    </div>
                  )}

                  {event.difficulty && (
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">{event.difficulty}</p>
                        <p className="text-sm text-gray-600">Nivel de dificultad</p>
                      </div>
                    </div>
                  )}

                  {event.duration && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">{event.duration}</p>
                        <p className="text-sm text-gray-600">Duración</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {event.maxAttendees && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ocupación</span>
                      <span className="font-medium">{Math.round((event.currentAttendees / event.maxAttendees) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${(event.currentAttendees / event.maxAttendees) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Registration Button */}
                <div className="pt-4">
                  {isRegistered ? (
                    <Button 
                      variant="outline" 
                      className="w-full border-green-200 text-green-700 hover:bg-green-50"
                      onClick={handleRegister}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Registrado
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      onClick={handleRegister}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Registrarse
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Organizador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={event.organizer?.image || event.club?.imageUrl || undefined} />
                    <AvatarFallback>{(event.organizer?.name || event.club?.name || 'O').split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{event.organizer?.name || event.club?.name}</h4>
                    <p className="text-sm text-gray-600">{event.club?.name ? 'Club' : 'Organizador'} del evento</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Ver Perfil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}