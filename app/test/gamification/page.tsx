'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Users, MessageSquare, Heart, User, Calendar } from 'lucide-react';

const eventTypes = [
  { value: 'post_created', label: 'Crear Post', icon: MessageSquare, description: 'Simula la creación de un post' },
  { value: 'user_followed', label: 'Seguir Usuario', icon: Users, description: 'Simula seguir a otro usuario' },
  { value: 'user_gained_follower', label: 'Ganar Seguidor', icon: User, description: 'Simula ganar un nuevo seguidor' },
  { value: 'comment_created', label: 'Crear Comentario', icon: MessageSquare, description: 'Simula crear un comentario' },
  { value: 'like_given', label: 'Dar Like', icon: Heart, description: 'Simula dar like a un post' },
  { value: 'profile_updated', label: 'Actualizar Perfil', icon: User, description: 'Simula actualizar el perfil' },
  { value: 'login_streak', label: 'Racha de Login', icon: Calendar, description: 'Simula una racha de login diario' }
];

export default function GamificationTestPage() {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streakDays, setStreakDays] = useState('1');
  const [postId, setPostId] = useState('');
  const [followedUserId, setFollowedUserId] = useState('');

  const handleEmitEvent = async () => {
    if (!selectedEvent) {
      toast.error('Selecciona un tipo de evento');
      return;
    }

    setIsLoading(true);

    try {
      const eventData: any = {};

      // Agregar datos específicos según el tipo de evento
      if (selectedEvent === 'login_streak') {
        eventData.streakDays = parseInt(streakDays) || 1;
      }
      if (selectedEvent === 'post_created' || selectedEvent === 'like_given' || selectedEvent === 'comment_created') {
        eventData.postId = postId || undefined;
      }
      if (selectedEvent === 'user_followed') {
        eventData.followedUserId = followedUserId || undefined;
      }
      if (selectedEvent === 'comment_created') {
        eventData.commentId = 'test-comment-' + Date.now();
      }

      const response = await fetch('/api/test/gamification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: selectedEvent,
          data: eventData
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Evento ${selectedEvent} emitido correctamente`);
        console.log('Evento emitido:', result);
      } else {
        toast.error(result.error || 'Error al emitir evento');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEventData = eventTypes.find(e => e.value === selectedEvent);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Trophy className="inline-block w-8 h-8 mr-2 text-yellow-500" />
            Pruebas de Gamificación
          </h1>
          <p className="text-gray-600">
            Utiliza esta página para probar el sistema de gamificación y las notificaciones en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Control */}
          <Card>
            <CardHeader>
              <CardTitle>Emitir Evento de Gamificación</CardTitle>
              <CardDescription>
                Selecciona un tipo de evento para probar el sistema de badges y notificaciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="event-type">Tipo de Evento</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((event) => {
                      const Icon = event.icon;
                      return (
                        <SelectItem key={event.value} value={event.value}>
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span>{event.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedEventData && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <selectedEventData.icon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-blue-900">{selectedEventData.label}</h3>
                  </div>
                  <p className="text-sm text-blue-700">{selectedEventData.description}</p>
                </div>
              )}

              {/* Campos específicos según el evento */}
              {selectedEvent === 'login_streak' && (
                <div className="space-y-2">
                  <Label htmlFor="streak-days">Días de Racha</Label>
                  <Input
                    id="streak-days"
                    type="number"
                    min="1"
                    max="365"
                    value={streakDays}
                    onChange={(e) => setStreakDays(e.target.value)}
                    placeholder="Número de días consecutivos"
                  />
                </div>
              )}

              {(selectedEvent === 'post_created' || selectedEvent === 'like_given' || selectedEvent === 'comment_created') && (
                <div className="space-y-2">
                  <Label htmlFor="post-id">ID del Post (opcional)</Label>
                  <Input
                    id="post-id"
                    value={postId}
                    onChange={(e) => setPostId(e.target.value)}
                    placeholder="Deja vacío para generar automáticamente"
                  />
                </div>
              )}

              {selectedEvent === 'user_followed' && (
                <div className="space-y-2">
                  <Label htmlFor="followed-user-id">ID del Usuario Seguido (opcional)</Label>
                  <Input
                    id="followed-user-id"
                    value={followedUserId}
                    onChange={(e) => setFollowedUserId(e.target.value)}
                    placeholder="Deja vacío para generar automáticamente"
                  />
                </div>
              )}

              <Button 
                onClick={handleEmitEvent} 
                disabled={!selectedEvent || isLoading}
                className="w-full"
              >
                {isLoading ? 'Emitiendo...' : 'Emitir Evento'}
              </Button>
            </CardContent>
          </Card>

          {/* Información del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>
                Información sobre el sistema de gamificación y notificaciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">WebSocket</div>
                  <div className="text-sm text-green-700">Notificaciones en Tiempo Real</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">Badges</div>
                  <div className="text-sm text-purple-700">Sistema de Logros</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Eventos Disponibles:</h4>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((event) => (
                    <Badge key={event.value} variant="outline" className="text-xs">
                      {event.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">💡 Instrucciones:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Selecciona un evento y haz clic en "Emitir Evento"</li>
                  <li>• Observa las notificaciones en tiempo real en la barra superior</li>
                  <li>• Revisa la consola del navegador para logs detallados</li>
                  <li>• Visita tu perfil para ver los badges obtenidos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}