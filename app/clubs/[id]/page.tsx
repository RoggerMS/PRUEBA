'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Star, 
  UserPlus, 
  UserMinus, 
  Settings, 
  ArrowLeft,
  MessageSquare,
  Heart,
  Share2,
  MoreHorizontal,
  Crown,
  Shield,
  User
} from 'lucide-react';
import type { Club, ClubMember, ClubPost } from '@/shared/types/clubs';

interface ClubDetailResponse {
  club: Club & {
    members: ClubMember[];
    posts: ClubPost[];
    events: any[];
    _count: {
      members: number;
      posts: number;
      events: number;
    };
  };
  userMembership?: ClubMember;
}

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const clubId = params.id as string;

  const [club, setClub] = useState<ClubDetailResponse['club'] | null>(null);
  const [userMembership, setUserMembership] = useState<ClubMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (clubId) {
      fetchClubDetails();
    }
  }, [clubId]);

  const fetchClubDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clubs/${clubId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Club no encontrado');
          router.push('/clubs');
          return;
        }
        throw new Error('Error al cargar el club');
      }

      const data: ClubDetailResponse = await response.json();
      setClub(data.club);
      setUserMembership(data.userMembership || null);
    } catch (error) {
      console.error('Error fetching club details:', error);
      toast.error('Error al cargar los detalles del club');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async () => {
    if (!session) {
      toast.error('Debes iniciar sesión para unirte a un club');
      return;
    }

    try {
      setJoining(true);
      const response = await fetch(`/api/clubs/${clubId}/join`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al unirse al club');
      }

      const { membership } = await response.json();
      setUserMembership(membership);
      
      // Update member count
      if (club) {
        setClub({
          ...club,
          _count: {
            ...club._count,
            members: club._count.members + 1
          }
        });
      }
      
      toast.success('Te has unido al club exitosamente');
    } catch (error: any) {
      console.error('Error joining club:', error);
      toast.error(error.message || 'Error al unirse al club');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveClub = async () => {
    if (!userMembership) return;

    try {
      setJoining(true);
      const response = await fetch(`/api/clubs/${clubId}/join`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al abandonar el club');
      }

      setUserMembership(null);
      
      // Update member count
      if (club) {
        setClub({
          ...club,
          _count: {
            ...club._count,
            members: club._count.members - 1
          }
        });
      }
      
      toast.success('Has abandonado el club');
    } catch (error: any) {
      console.error('Error leaving club:', error);
      toast.error(error.message || 'Error al abandonar el club');
    } finally {
      setJoining(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'PRESIDENT':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'MODERATOR':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'PRESIDENT':
        return 'Presidente';
      case 'MODERATOR':
        return 'Moderador';
      default:
        return 'Miembro';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <Card>
              <CardContent className="p-8">
                <div className="h-32 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">Club no encontrado</h2>
              <p className="text-gray-500 mb-6">El club que buscas no existe o ha sido eliminado.</p>
              <Button onClick={() => router.push('/clubs')}>
                Volver a Clubes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isPresident = userMembership?.role === 'PRESIDENT';
  const isModerator = userMembership?.role === 'MODERATOR' || isPresident;
  const isMember = !!userMembership;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/clubs')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Clubes
          </Button>
          
          {isModerator && (
            <Button 
              onClick={() => router.push(`/clubs/manage/${clubId}`)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Gestionar Club
            </Button>
          )}
        </div>

        {/* Club Header */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Club Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {club.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Club Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-800">{club.name}</h1>
                    <Badge 
                      variant={club.visibility === 'PUBLIC' ? 'default' : 'secondary'}
                      className={club.visibility === 'PUBLIC' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
                    >
                      {club.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-lg">{club.description}</p>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">{club._count.members}</span>
                    <span>miembros</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-medium">{club._count.posts}</span>
                    <span>publicaciones</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">{club._count.events}</span>
                    <span>eventos</span>
                  </div>
                  {club.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>{club.location}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!isMember ? (
                    <Button 
                      onClick={handleJoinClub}
                      disabled={joining}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      {joining ? 'Uniéndose...' : 'Unirse al Club'}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={handleLeaveClub}
                      disabled={joining}
                      className="flex items-center gap-2"
                    >
                      <UserMinus className="h-4 w-4" />
                      {joining ? 'Abandonando...' : 'Abandonar Club'}
                    </Button>
                  )}
                  
                  <Button variant="outline" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Compartir
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Información</TabsTrigger>
            <TabsTrigger value="members">Miembros</TabsTrigger>
            <TabsTrigger value="posts">Publicaciones</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Club Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Sobre el Club</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">{club.description}</p>
                    
                    {club.rules && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Reglas del Club</h4>
                        <p className="text-gray-600 text-sm">{club.rules}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{club.category}</Badge>
                      {club.subject && <Badge variant="outline">{club.subject}</Badge>}
                      {club.level && <Badge variant="outline">{club.level}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Recent Members */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Miembros Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {club.members.slice(0, 5).map((member) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user.image || ''} />
                            <AvatarFallback>
                              {member.user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {member.user.name}
                            </p>
                            <div className="flex items-center gap-1">
                              {getRoleIcon(member.role)}
                              <span className="text-xs text-gray-500">
                                {getRoleLabel(member.role)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Estadísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Creado</span>
                      <span className="font-medium">
                        {new Date(club.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actividad</span>
                      <span className="font-medium text-green-600">Activo</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Miembros del Club ({club._count.members})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {club.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Avatar>
                        <AvatarImage src={member.user.image || ''} />
                        <AvatarFallback>
                          {member.user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {member.user.name}
                        </p>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          <span className="text-sm text-gray-500">
                            {getRoleLabel(member.role)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Desde {new Date(member.joinedAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Publicaciones ({club._count.posts})</CardTitle>
              </CardHeader>
              <CardContent>
                {club.posts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay publicaciones</h3>
                    <p className="text-gray-500">Sé el primero en publicar en este club</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {club.posts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={post.author.image || ''} />
                            <AvatarFallback>
                              {post.author.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{post.author.name}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                            <h4 className="font-semibold mb-2">{post.title}</h4>
                            <p className="text-gray-700 mb-3">{post.content}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <button className="flex items-center gap-1 hover:text-red-500">
                                <Heart className="h-4 w-4" />
                                <span>0</span>
                              </button>
                              <button className="flex items-center gap-1 hover:text-blue-500">
                                <MessageSquare className="h-4 w-4" />
                                <span>0</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Eventos ({club._count.events})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay eventos programados</h3>
                  <p className="text-gray-500">Los eventos aparecerán aquí cuando se programen</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}