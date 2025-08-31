'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Users, 
  Crown, 
  Shield, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Search,
  Settings,
  Plus,
  Globe,
  Lock,
  Loader2,
  BarChart3,
  Activity
} from 'lucide-react';
import { Club, ClubMember } from '@/types/clubs';

interface MyClubsData {
  clubs: (Club & {
    members: ClubMember[];
    _count: {
      posts: number;
      events: number;
      members: number;
    };
    userRole: 'PRESIDENT' | 'ADMIN' | 'MEMBER';
    recentActivity?: {
      posts: number;
      events: number;
      newMembers: number;
    };
  })[];
  stats: {
    totalClubs: number;
    presidingClubs: number;
    adminClubs: number;
    memberClubs: number;
    totalMembers: number;
    totalPosts: number;
    totalEvents: number;
  };
}

interface ClubCardProps {
  club: MyClubsData['clubs'][0];
  onManage: (clubId: string) => void;
  onView: (clubId: string) => void;
}

function MyClubCard({ club, onManage, onView }: ClubCardProps) {
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

  const getRoleText = (role: string) => {
    switch (role) {
      case 'PRESIDENT':
        return 'Presidente';
      case 'ADMIN':
        return 'Administrador';
      default:
        return 'Miembro';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {club.name}
              </h3>
              <p className="text-sm text-gray-500">{club.category}</p>
            </div>
          </div>
          
          <Badge className={`flex items-center gap-1 ${getRoleBadgeColor(club.userRole)}`}>
            {getRoleIcon(club.userRole)}
            {getRoleText(club.userRole)}
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {club.description}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700">
              <Users className="h-4 w-4" />
              {club._count.members}
            </div>
            <p className="text-xs text-gray-500">Miembros</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700">
              <MessageSquare className="h-4 w-4" />
              {club._count.posts}
            </div>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              {club._count.events}
            </div>
            <p className="text-xs text-gray-500">Eventos</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {club.visibility === 'PUBLIC' ? (
              <Globe className="h-4 w-4 text-green-500" />
            ) : (
              <Lock className="h-4 w-4 text-orange-500" />
            )}
            <span className="text-xs text-gray-500">
              {club.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onView(club.id)}>
              Ver
            </Button>
            {(club.userRole === 'PRESIDENT' || club.userRole === 'ADMIN') && (
              <Button size="sm" onClick={() => onManage(club.id)}>
                <Settings className="h-3 w-3 mr-1" />
                Gestionar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyClubsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MyClubsData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (session) {
      fetchMyClubs();
    }
  }, [session]);

  const fetchMyClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clubs/my-clubs?includeStats=true&includeActivity=true');
      
      if (!response.ok) {
        throw new Error('Error al cargar tus clubes');
      }

      const result: MyClubsData = await response.json();
      setData(result);
    } catch (error: any) {
      console.error('Error fetching my clubs:', error);
      toast.error(error.message || 'Error al cargar tus clubes');
    } finally {
      setLoading(false);
    }
  };

  const handleManageClub = (clubId: string) => {
    router.push(`/clubs/manage/${clubId}`);
  };

  const handleViewClub = (clubId: string) => {
    router.push(`/clubs/${clubId}`);
  };

  const getFilteredClubs = () => {
    if (!data) return [];
    
    let filtered = data.clubs;
    
    // Filter by role
    if (activeTab !== 'all') {
      filtered = filtered.filter(club => {
        switch (activeTab) {
          case 'president':
            return club.userRole === 'PRESIDENT';
          case 'admin':
            return club.userRole === 'ADMIN';
          case 'member':
            return club.userRole === 'MEMBER';
          default:
            return true;
        }
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(club => 
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">Acceso Requerido</h2>
              <p className="text-gray-500 mb-6">Debes iniciar sesión para ver tus clubes.</p>
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
              <p className="text-gray-500">Obteniendo tus clubes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredClubs = getFilteredClubs();

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
          
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h1 className="text-xl font-bold text-gray-800">Mis Clubes</h1>
          </div>
          
          <Button onClick={() => router.push('/clubs/create')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Club
          </Button>
        </div>

        {/* Stats Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clubes</p>
                    <p className="text-2xl font-bold text-gray-800">{data.stats.totalClubs}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Presidiendo</p>
                    <p className="text-2xl font-bold text-yellow-600">{data.stats.presidingClubs}</p>
                  </div>
                  <Crown className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Administrando</p>
                    <p className="text-2xl font-bold text-blue-600">{data.stats.adminClubs}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Miembros</p>
                    <p className="text-2xl font-bold text-green-600">{data.stats.totalMembers}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar en mis clubes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="president">Presidente</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                  <TabsTrigger value="member">Miembro</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Clubs Grid */}
        {filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <MyClubCard
                key={club.id}
                club={club}
                onManage={handleManageClub}
                onView={handleViewClub}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              {data?.clubs.length === 0 ? (
                <>
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-600 mb-2">No tienes clubes</h2>
                  <p className="text-gray-500 mb-6">
                    ¡Únete a un club existente o crea tu propio club para comenzar!
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => router.push('/clubs')} variant="outline">
                      Explorar Clubes
                    </Button>
                    <Button onClick={() => router.push('/clubs/create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Club
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-600 mb-2">No se encontraron clubes</h2>
                  <p className="text-gray-500 mb-6">
                    No hay clubes que coincidan con tu búsqueda o filtros.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setActiveTab('all');
                    }}
                    variant="outline"
                  >
                    Limpiar Filtros
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}