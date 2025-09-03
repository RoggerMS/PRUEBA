'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Bell,
  Mail,
  Smartphone,
  Globe,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Award,
  AlertCircle,
  Save,
  Loader2
} from 'lucide-react';

interface NotificationPreference {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION' | 'MESSAGE' | 'SYSTEM' | 'ACHIEVEMENT';
  enabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  frequency: 'INSTANT' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'NEVER';
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    weekendQuietMode: false
  });

  const fetchPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();

      if (response.ok) {
        setPreferences(data.preferences || getDefaultPreferences());
        if (data.globalSettings) {
          setGlobalSettings(data.globalSettings);
        }
      } else {
        toast.error(data.error || 'Error al cargar preferencias');
        setPreferences(getDefaultPreferences());
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Error al cargar preferencias');
      setPreferences(getDefaultPreferences());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchPreferences();
    }
  }, [session, fetchPreferences]);

  const getDefaultPreferences = (): NotificationPreference[] => [
    {
      id: 'like',
      type: 'LIKE',
      enabled: true,
      emailEnabled: false,
      pushEnabled: true,
      frequency: 'INSTANT'
    },
    {
      id: 'comment',
      type: 'COMMENT',
      enabled: true,
      emailEnabled: true,
      pushEnabled: true,
      frequency: 'INSTANT'
    },
    {
      id: 'follow',
      type: 'FOLLOW',
      enabled: true,
      emailEnabled: true,
      pushEnabled: true,
      frequency: 'INSTANT'
    },
    {
      id: 'mention',
      type: 'MENTION',
      enabled: true,
      emailEnabled: true,
      pushEnabled: true,
      frequency: 'INSTANT'
    },
    {
      id: 'message',
      type: 'MESSAGE',
      enabled: true,
      emailEnabled: true,
      pushEnabled: true,
      frequency: 'INSTANT'
    },
    {
      id: 'achievement',
      type: 'ACHIEVEMENT',
      enabled: true,
      emailEnabled: true,
      pushEnabled: true,
      frequency: 'INSTANT'
    },
    {
      id: 'system',
      type: 'SYSTEM',
      enabled: true,
      emailEnabled: true,
      pushEnabled: false,
      frequency: 'DAILY'
    }
  ];

  const savePreferences = async () => {
    if (!session?.user) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferences,
          globalSettings
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Preferencias guardadas correctamente');
      } else {
        toast.error(data.error || 'Error al guardar preferencias');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Error al guardar preferencias');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (id: string, updates: Partial<NotificationPreference>) => {
    setPreferences(prev => prev.map(pref => 
      pref.id === id ? { ...pref, ...updates } : pref
    ));
  };

  const getNotificationIcon = (type: NotificationPreference['type']) => {
    switch (type) {
      case 'LIKE':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'COMMENT':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'FOLLOW':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'MENTION':
        return <AtSign className="w-4 h-4 text-purple-500" />;
      case 'MESSAGE':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'ACHIEVEMENT':
        return <Award className="w-4 h-4 text-yellow-500" />;
      case 'SYSTEM':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationLabel = (type: NotificationPreference['type']) => {
    switch (type) {
      case 'LIKE':
        return 'Me gusta';
      case 'COMMENT':
        return 'Comentarios';
      case 'FOLLOW':
        return 'Nuevos seguidores';
      case 'MENTION':
        return 'Menciones';
      case 'MESSAGE':
        return 'Mensajes privados';
      case 'ACHIEVEMENT':
        return 'Logros';
      case 'SYSTEM':
        return 'Sistema';
      default:
        return 'Notificación';
    }
  };

  const getNotificationDescription = (type: NotificationPreference['type']) => {
    switch (type) {
      case 'LIKE':
        return 'Cuando alguien le da me gusta a tu contenido';
      case 'COMMENT':
        return 'Cuando alguien comenta en tu contenido';
      case 'FOLLOW':
        return 'Cuando alguien comienza a seguirte';
      case 'MENTION':
        return 'Cuando alguien te menciona en un post o comentario';
      case 'MESSAGE':
        return 'Cuando recibes un mensaje privado';
      case 'ACHIEVEMENT':
        return 'Cuando desbloqueas un nuevo logro';
      case 'SYSTEM':
        return 'Actualizaciones del sistema y anuncios importantes';
      default:
        return 'Notificaciones generales';
    }
  };

  if (!session?.user) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Inicia sesión para configurar tus notificaciones</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Cargando preferencias...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Configuración Global
          </CardTitle>
          <CardDescription>
            Configuración general para todas las notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notificaciones por email</Label>
              <p className="text-sm text-gray-500">Recibir notificaciones en tu correo electrónico</p>
            </div>
            <Switch
              checked={globalSettings.emailNotifications}
              onCheckedChange={(checked) => 
                setGlobalSettings(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notificaciones push</Label>
              <p className="text-sm text-gray-500">Recibir notificaciones en tiempo real</p>
            </div>
            <Switch
              checked={globalSettings.pushNotifications}
              onCheckedChange={(checked) => 
                setGlobalSettings(prev => ({ ...prev, pushNotifications: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Modo silencioso</Label>
              <p className="text-sm text-gray-500">No recibir notificaciones durante ciertas horas</p>
            </div>
            <Switch
              checked={globalSettings.quietHoursEnabled}
              onCheckedChange={(checked) => 
                setGlobalSettings(prev => ({ ...prev, quietHoursEnabled: checked }))
              }
            />
          </div>

          {globalSettings.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 pl-4">
              <div>
                <Label className="text-sm">Desde</Label>
                <Select
                  value={globalSettings.quietHoursStart}
                  onValueChange={(value) => 
                    setGlobalSettings(prev => ({ ...prev, quietHoursStart: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Hasta</Label>
                <Select
                  value={globalSettings.quietHoursEnd}
                  onValueChange={(value) => 
                    setGlobalSettings(prev => ({ ...prev, quietHoursEnd: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Tipos de Notificaciones
          </CardTitle>
          <CardDescription>
            Configura qué notificaciones quieres recibir y cómo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {preferences.map((preference) => (
              <div key={preference.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getNotificationIcon(preference.type)}
                    <div>
                      <Label className="text-base font-medium">
                        {getNotificationLabel(preference.type)}
                      </Label>
                      <p className="text-sm text-gray-500">
                        {getNotificationDescription(preference.type)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preference.enabled}
                    onCheckedChange={(checked) => 
                      updatePreference(preference.id, { enabled: checked })
                    }
                  />
                </div>

                {preference.enabled && (
                  <div className="pl-10 space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={preference.pushEnabled && globalSettings.pushNotifications}
                          onCheckedChange={(checked) => 
                            updatePreference(preference.id, { pushEnabled: checked })
                          }
                          disabled={!globalSettings.pushNotifications}
                        />
                        <Label className="text-sm flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          Push
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={preference.emailEnabled && globalSettings.emailNotifications}
                          onCheckedChange={(checked) => 
                            updatePreference(preference.id, { emailEnabled: checked })
                          }
                          disabled={!globalSettings.emailNotifications}
                        />
                        <Label className="text-sm flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email
                        </Label>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-sm">Frecuencia</Label>
                        <Select
                          value={preference.frequency}
                          onValueChange={(value: NotificationPreference['frequency']) => 
                            updatePreference(preference.id, { frequency: value })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INSTANT">Inmediato</SelectItem>
                            <SelectItem value="HOURLY">Cada hora</SelectItem>
                            <SelectItem value="DAILY">Diario</SelectItem>
                            <SelectItem value="WEEKLY">Semanal</SelectItem>
                            <SelectItem value="NEVER">Nunca</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {preference.id !== preferences[preferences.length - 1].id && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar Preferencias
        </Button>
      </div>
    </div>
  );
}