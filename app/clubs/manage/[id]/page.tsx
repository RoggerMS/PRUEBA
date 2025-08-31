'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  UserPlus, 
  UserMinus, 
  Crown, 
  Shield, 
  Globe, 
  Lock, 
  Loader2,
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react';
import { Club, ClubMember } from '@/types/clubs';

interface ClubManagementData {
  club: Club & {
    members: (ClubMember & {
      user: {
        id: string;
        name: string;
        email: string;
        image?: string;
      };
    })[];
  };
}

interface MemberAction {
  memberId: string;
  action: 'PROMOTE' | 'DEMOTE' | 'REMOVE';
}

export default function ClubManagePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [club, setClub] = useState<ClubManagementData['club'] | null>(null);
  const [activeTab, setActiveTab] = useState('settings');
  
  // Club settings form
  const [clubForm, setClubForm] = useState({
    name: '',
    description: '',
    category: '',
    subject: '',
    level: '',
    location: '',
    rules: '',
    visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
    maxMembers: undefined as number | undefined,
  });

  const clubId = params?.id as string;

  useEffect(() => {
    if (clubId && session) {
      fetchClubData();
    }
  }, [clubId, session]);

  const fetchClubData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clubs/${clubId}/manage`);
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('No tienes permisos para gestionar este club');
          router.push(`/clubs/${clubId}`);
          return;
        }
        throw new Error('Error al cargar los datos del club');
      }

      const data: ClubManagementData = await response.json();
      setClub(data.club);
      
      // Initialize form with club data
      setClubForm({
        name: data.club.name,
        description: data.club.description,
        category: data.club.category,
        subject: data.club.subject || '',
        level: data.club.level || '',
        location: data.club.location || '',
        rules: data.club.rules || '',
        visibility: data.club.visibility,
        maxMembers: data.club.maxMembers || undefined,
      });
    } catch (error: any) {
      console.error('Error fetching club data:', error);
      toast.error(error.message || 'Error al cargar los datos del club');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/clubs/${clubId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clubForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar el club');
      }

      toast.success('Configuración actualizada exitosamente');
      await fetchClubData(); // Refresh data
    } catch (error: any) {
      console.error('Error updating club:', error);
      toast.error(error.message || 'Error al actualizar el club');
    } finally {
      setSaving(false);
    }
  };

  const handleMemberAction = async (action: MemberAction) => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/members`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al realizar la acción');
      }

      const actionMessages = {
        PROMOTE: 'Miembro promovido a administrador',
        DEMOTE: 'Administrador degradado a miembro',
        REMOVE: 'Miembro expulsado del club'
      };

      toast.success(actionMessages[action.action]);
      await fetchClubData(); // Refresh data
    } catch (error: any) {
      console.error('Error performing member action:', error);
      toast.error(error.message || 'Error al realizar la acción');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'PRESIDENT':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'PRESIDENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">Acceso Requerido</h2>
              <p className="text-gray-500 mb-6">Debes iniciar sesión para gestionar un club.</p>
              <Button onClick={() => router.push('/auth/signin')}>
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">Cargando...</h2>
              <p className="text-gray-500">Obteniendo información del club</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">Club no encontrado</h2>
              <p className="text-gray-500 mb-6">El club que buscas no existe o no tienes permisos para gestionarlo.</p>
              <Button onClick={() => router.push('/clubs')}>
                Volver a Clubes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/clubs/${clubId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Club
          </Button>
          
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <h1 className="text-xl font-bold text-gray-800">Gestionar Club</h1>
          </div>
        </div>

        {/* Club Info Header */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">{club.name}</h2>
                <p className="text-gray-600">{club.category}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {club.members.length} miembros
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {club.visibility === 'PUBLIC' ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    {club.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Configuración</TabsTrigger>
            <TabsTrigger value="members">Miembros</TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Configuración del Club</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Club</Label>
                    <Input
                      id="name"
                      value={clubForm.name}
                      onChange={(e) => setClubForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Input
                      id="category"
                      value={clubForm.category}
                      onChange={(e) => setClubForm(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={clubForm.description}
                    onChange={(e) => setClubForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Materia</Label>
                    <Input
                      id="subject"
                      value={clubForm.subject}
                      onChange={(e) => setClubForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Nivel</Label>
                    <Input
                      id="level"
                      value={clubForm.level}
                      onChange={(e) => setClubForm(prev => ({ ...prev, level: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={clubForm.location}
                      onChange={(e) => setClubForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rules">Reglas del Club</Label>
                  <Textarea
                    id="rules"
                    value={clubForm.rules}
                    onChange={(e) => setClubForm(prev => ({ ...prev, rules: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {clubForm.visibility === 'PUBLIC' ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-orange-500" />
                        )}
                        <Label>Visibilidad</Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        {clubForm.visibility === 'PUBLIC' 
                          ? 'Cualquiera puede ver y unirse'
                          : 'Solo miembros invitados'
                        }
                      </p>
                    </div>
                    <Switch
                      checked={clubForm.visibility === 'PUBLIC'}
                      onCheckedChange={(checked) => 
                        setClubForm(prev => ({ ...prev, visibility: checked ? 'PUBLIC' : 'PRIVATE' }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxMembers">Límite de Miembros</Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      min="2"
                      max="1000"
                      value={clubForm.maxMembers || ''}
                      onChange={(e) => setClubForm(prev => ({ 
                        ...prev, 
                        maxMembers: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      placeholder="Sin límite"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Miembros del Club ({club.members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {club.members.map((member) => {
                    const isCurrentUser = member.user.id === session?.user?.id;
                    const canManage = !isCurrentUser && member.role !== 'PRESIDENT';
                    
                    return (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.user.image} />
                            <AvatarFallback>
                              {member.user.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{member.user.name}</p>
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-xs">
                                  Tú
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{member.user.email}</p>
                            <p className="text-xs text-gray-400">
                              Miembro desde {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={`flex items-center gap-1 ${getRoleBadgeColor(member.role)}`}>
                            {getRoleIcon(member.role)}
                            {member.role === 'PRESIDENT' ? 'Presidente' : 
                             member.role === 'ADMIN' ? 'Administrador' : 'Miembro'}
                          </Badge>
                          
                          {canManage && (
                            <div className="flex gap-1">
                              {member.role === 'MEMBER' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMemberAction({
                                    memberId: member.id,
                                    action: 'PROMOTE'
                                  })}
                                  className="flex items-center gap-1"
                                >
                                  <UserPlus className="h-3 w-3" />
                                  Promover
                                </Button>
                              )}
                              
                              {member.role === 'ADMIN' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMemberAction({
                                    memberId: member.id,
                                    action: 'DEMOTE'
                                  })}
                                  className="flex items-center gap-1"
                                >
                                  <UserMinus className="h-3 w-3" />
                                  Degradar
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMemberAction({
                                  memberId: member.id,
                                  action: 'REMOVE'
                                })}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                                Expulsar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}