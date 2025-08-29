"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Heart, 
  Share2, 
  Star,
  DollarSign,
  Award,
  UserPlus,
  CheckCircle,
  MessageCircle,
  Send,
  User,
  Trophy,
  Target,
  BookOpen,
  Wifi,
  Coffee,
  Car,
  Accessibility
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

interface EventDetailProps {
  event: Event;
  onBack: () => void;
}

// Mock data for event details
const mockAgenda = [
  {
    id: "1",
    time: "09:00 - 09:30",
    title: "Registro y Bienvenida",
    description: "Registro de participantes y entrega de materiales",
    speaker: "Equipo Organizador"
  },
  {
    id: "2",
    time: "09:30 - 10:30",
    title: "Conferencia Inaugural",
    description: "Introducción al tema principal del evento",
    speaker: "Dr. Ana García"
  },
  {
    id: "3",
    time: "10:30 - 11:00",
    title: "Pausa para Café",
    description: "Networking y refrigerios",
    speaker: ""
  },
  {
    id: "4",
    time: "11:00 - 12:30",
    title: "Taller Práctico",
    description: "Sesión práctica con ejercicios y casos de estudio",
    speaker: "Prof. Carlos López"
  }
];

const mockComments = [
  {
    id: "1",
    user: "María González",
    avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20profile%20avatar%20female%20friendly&image_size=square",
    comment: "¡Excelente evento! Muy bien organizado y con contenido de calidad.",
    date: "2024-01-15",
    likes: 12
  },
  {
    id: "2",
    user: "Juan Pérez",
    avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20profile%20avatar%20male%20friendly&image_size=square",
    comment: "Los talleres fueron muy informativos. Definitivamente recomiendo este tipo de eventos.",
    date: "2024-01-14",
    likes: 8
  }
];

const mockAttendees = [
  {
    id: "1",
    name: "Ana Quispe",
    avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20profile%20avatar%20female%20academic%20peruvian&image_size=square",
    role: "Estudiante de Educación Inicial",
    university: "La Cantuta"
  },
  {
    id: "2",
    name: "Carlos Mamani",
    avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20profile%20avatar%20male%20academic%20peruvian&image_size=square",
    role: "Estudiante de Matemática e Informática",
    university: "La Cantuta"
  },
  {
    id: "3",
    name: "Laura Huamán",
    avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20profile%20avatar%20female%20tech%20peruvian&image_size=square",
    role: "Estudiante de Educación Física",
    university: "La Cantuta"
  }
];

export function EventDetail({ event, onBack }: EventDetailProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(event.isRegistered);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsRegistered(!isRegistered);
    setIsRegistering(false);
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

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // Add comment logic here
      setNewComment("");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
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
          <div className="flex items-center gap-2">
            {event.isFeatured && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Star className="h-3 w-3 mr-1" />
                Destacado
              </Badge>
            )}
            <Badge className={getCategoryColor(event.category)}>
              {event.category}
            </Badge>
            <Badge variant="outline">
              {event.type}
            </Badge>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
          <div className="relative">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 text-gray-600" />
              </Button>
            </div>

            {/* Price badge */}
            <div className="absolute bottom-4 right-4">
              {event.price > 0 ? (
                <Badge className="bg-green-500 text-white border-0 text-lg px-3 py-1">
                  <DollarSign className="h-4 w-4 mr-1" />
                  ${event.price}
                </Badge>
              ) : (
                <Badge className="bg-blue-500 text-white border-0 text-lg px-3 py-1">
                  Gratis
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                  <p className="text-gray-600 text-lg leading-relaxed">{event.description}</p>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Fecha</p>
                      <p className="text-gray-600">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Horario</p>
                      <p className="text-gray-600">
                        {event.time}
                        {event.endTime && ` - ${event.endTime}`}
                        {event.duration && ` (${event.duration})`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <MapPin className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Ubicación</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900">Participantes</p>
                      <p className="text-gray-600">{event.attendees} / {event.maxAttendees}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Etiquetas</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Registration Card */}
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-center">Registro</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Attendance Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ocupación</span>
                        <span>{Math.round(attendancePercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 text-center">
                        {event.attendees} de {event.maxAttendees} lugares ocupados
                      </p>
                    </div>

                    {/* Registration Button */}
                    {event.status === 'upcoming' && (
                      <Button 
                        className={`w-full ${isRegistered 
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
                          "Evento Lleno"
                        ) : (
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Registrarse Ahora
                          </div>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Organizer Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Organizador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <img 
                        src={event.organizerAvatar} 
                        alt={event.organizer}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{event.organizer}</p>
                        <p className="text-sm text-gray-600">Organizador del evento</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Prizes */}
                {event.prizes && event.prizes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Premios
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {event.prizes.map((prize, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{prize}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Requirements */}
                {event.requirements && event.requirements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        Requisitos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {event.requirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-sm">{req}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="attendees">Participantes</TabsTrigger>
            <TabsTrigger value="comments">Comentarios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Facilidades</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Wifi className="h-4 w-4" />
                        <span>WiFi gratuito</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Coffee className="h-4 w-4" />
                        <span>Refrigerios incluidos</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Car className="h-4 w-4" />
                        <span>Estacionamiento disponible</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Accessibility className="h-4 w-4" />
                        <span>Acceso para discapacitados</span>
                      </div>
                    </div>
                  </div>
                  
                  {event.speakers && event.speakers.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Ponentes</h4>
                      <div className="space-y-2">
                        {event.speakers.map((speaker, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{speaker}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agenda" className="space-y-4">
            {mockAgenda.map((item) => (
              <Card key={item.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-4">
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
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="attendees" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAttendees.map((attendee) => (
                <Card key={attendee.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={attendee.avatar} 
                        alt={attendee.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{attendee.name}</p>
                        <p className="text-sm text-gray-600">{attendee.role}</p>
                        <p className="text-xs text-gray-500">{attendee.university}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            {/* Comment Form */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Agregar Comentario</h3>
                  <Textarea
                    placeholder="Comparte tu opinión sobre este evento..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button 
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Publicar Comentario
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments List */}
            <div className="space-y-4">
              {mockComments.map((comment) => (
                <Card key={comment.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img 
                        src={comment.avatar} 
                        alt={comment.user}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-gray-900">{comment.user}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(comment.date).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <p className="text-gray-700 mb-3">{comment.comment}</p>
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-600">
                            <Heart className="h-4 w-4 mr-1" />
                            {comment.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Responder
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
