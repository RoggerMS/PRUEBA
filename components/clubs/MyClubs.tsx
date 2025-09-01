'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Star, 
  Heart, 
  MessageCircle, 
  Trophy,
  Clock,
  Settings,
  Bell,
  UserPlus,
  Crown
} from 'lucide-react';

interface ClubRole {
  id: string;
  name: string;
  permissions: string[];
}

interface ClubMembership {
  id: string;
  clubId: string;
  clubName: string;
  clubDescription: string;
  clubImage?: string;
  category: string;
  role: ClubRole;
  joinDate: string;
  memberCount: number;
  nextEvent?: {
    title: string;
    date: string;
    location: string;
  };
  recentActivity: {
    type: string;
    description: string;
    date: string;
  }[];
  notifications: number;
  isActive: boolean;
}

interface MyClubsProps {
  memberships?: ClubMembership[];
  onViewClub?: (clubId: string) => void;
  onLeaveClub?: (clubId: string) => void;
  onManageClub?: (clubId: string) => void;
}

export default function MyClubs({ 
  memberships = [], 
  onViewClub, 
  onLeaveClub, 
  onManageClub 
}: MyClubsProps) {
  const [activeTab, setActiveTab] = useState('active');

  const mockMemberships: ClubMembership[] = memberships.length > 0 ? memberships : [
    {
      id: '1',
      clubId: 'club-1',
      clubName: 'Club de Programación',
      clubDescription: 'Desarrollamos proyectos y compartimos conocimientos de programación',
      clubImage: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=100&h=100&fit=crop',
      category: 'Tecnología',
      role: {
        id: 'president',
        name: 'Presidente',
        permissions: ['manage_members', 'create_events', 'edit_club']
      },
      joinDate: '2023-09-01',
      memberCount: 45,
      nextEvent: {
        title: 'Workshop de React',
        date: '2024-01-20',
        location: 'Aula 301'
      },
      recentActivity: [
        {
          type: 'new_member',
          description: 'Juan Pérez se unió al club',
          date: '2024-01-15'
        },
        {
          type: 'event_created',
          description: 'Nuevo evento: Workshop de React',
          date: '2024-01-14'
        }
      ],
      notifications: 3,
      isActive: true
    },
    {
      id: '2',
      clubId: 'club-2',
      clubName: 'Club de Fotografía',
      clubDescription: 'Exploramos el arte de la fotografía y organizamos salidas fotográficas',
      clubImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=100&h=100&fit=crop',
      category: 'Arte',
      role: {
        id: 'member',
        name: 'Miembro',
        permissions: ['view_content']
      },
      joinDate: '2023-10-15',
      memberCount: 28,
      nextEvent: {
        title: 'Salida Fotográfica al Parque',
        date: '2024-01-22',
        location: 'Parque Central'
      },
      recentActivity: [
        {
          type: 'photo_shared',
          description: 'María compartió 5 fotos nuevas',
          date: '2024-01-16'
        }
      ],
      notifications: 1,
      isActive: true
    },
    {
      id: '3',
      clubId: 'club-3',
      clubName: 'Club de Debate',
      clubDescription: 'Desarrollamos habilidades de oratoria y debate sobre temas actuales',
      category: 'Académico',
      role: {
        id: 'moderator',
        name: 'Moderador',
        permissions: ['moderate_discussions', 'create_events']
      },
      joinDate: '2023-08-20',
      memberCount: 22,
      recentActivity: [
        {
          type: 'debate_scheduled',
          description: 'Debate sobre IA programado para el viernes',
          date: '2024-01-12'
        }
      ],
      notifications: 0,
      isActive: false
    }
  ];

  const activeMemberships = mockMemberships.filter(m => m.isActive);
  const inactiveMemberships = mockMemberships.filter(m => !m.isActive);

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

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'president': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'moderator': return <Settings className="h-4 w-4 text-blue-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      case 'president': return 'bg-yellow-100 text-yellow-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderClubCard = (membership: ClubMembership) => (
    <Card key={membership.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex gap-3 flex-1">
            {membership.clubImage && (
              <img 
                src={membership.clubImage} 
                alt={membership.clubName}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{membership.clubName}</CardTitle>
                {membership.notifications > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {membership.notifications}
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {membership.clubDescription}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getCategoryColor(membership.category)}>
                  {membership.category}
                </Badge>
                <Badge className={getRoleColor(membership.role.id)} variant="outline">
                  <div className="flex items-center gap-1">
                    {getRoleIcon(membership.role.id)}
                    {membership.role.name}
                  </div>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información del club */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{membership.memberCount} miembros</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Desde {new Date(membership.joinDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Próximo evento */}
        {membership.nextEvent && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Próximo Evento</span>
            </div>
            <p className="text-sm text-blue-700">{membership.nextEvent.title}</p>
            <div className="flex items-center gap-4 text-xs text-blue-600 mt-1">
              <span>{new Date(membership.nextEvent.startDate).toLocaleDateString()}</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{membership.nextEvent.location}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actividad reciente */}
        {membership.recentActivity.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Actividad Reciente</h4>
            <div className="space-y-2">
              {membership.recentActivity.slice(0, 2).map((activity, index) => (
                <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p>{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onViewClub?.(membership.clubId)}
            variant="default"
            size="sm"
            className="flex-1"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Ver Club
          </Button>
          
          {membership.role.permissions.includes('manage_members') && (
            <Button
              onClick={() => onManageClub?.(membership.clubId)}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          
          {membership.notifications > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {membership.notifications}
              </span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Mis Clubs</h2>
        <p className="text-gray-600">Gestiona tu participación en los clubs estudiantiles</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeMemberships.length}</div>
            <div className="text-sm text-gray-600">Clubs Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {mockMemberships.filter(m => m.role.id === 'president').length}
            </div>
            <div className="text-sm text-gray-600">Presidencias</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {mockMemberships.reduce((acc, m) => acc + m.notifications, 0)}
            </div>
            <div className="text-sm text-gray-600">Notificaciones</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {mockMemberships.filter(m => m.nextEvent).length}
            </div>
            <div className="text-sm text-gray-600">Próximos Eventos</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Activos ({activeMemberships.length})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Inactivos ({inactiveMemberships.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeMemberships.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {activeMemberships.map(renderClubCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No tienes clubs activos</h3>
                <p className="text-gray-500 text-center mb-4">Explora y únete a clubs que te interesen</p>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Explorar Clubs
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          {inactiveMemberships.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {inactiveMemberships.map(renderClubCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No tienes clubs inactivos</h3>
                <p className="text-gray-500 text-center">Todos tus clubs están activos</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}