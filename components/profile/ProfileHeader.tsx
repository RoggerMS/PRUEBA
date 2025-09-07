'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Edit3, 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  Globe, 
  Github, 
  Linkedin, 
  Twitter,
  Star,
  Users,
  BookOpen,
  Trophy,
  Settings,
  Camera,
  Share2,
  MessageCircle,
  UserPlus
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinDate: string;
  phone?: string;
  career: string;
  university: string;
  semester: number;
  stats: {
    followers: number;
    following: number;
    posts: number;
    notesShared: number;
    questionsAnswered: number;
    reputation: number;
    level: number;
    achievements: number;
  };
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  isFollowing?: boolean;
  isOwnProfile?: boolean;
}

interface ProfileHeaderProps {
  user?: UserProfile;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onShare?: (userId: string) => void;
  onEditProfile?: (updatedProfile: Partial<UserProfile>) => void;
}

const mockUser: UserProfile = {
  id: '1',
  name: 'María González',
  username: 'maria_gonzalez',
  email: 'maria.gonzalez@universidad.edu',
  avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20portrait%20of%20a%20young%20latina%20woman%20student%20smiling%20friendly%20university%20setting&image_size=square',
  coverImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20university%20campus%20library%20books%20academic%20atmosphere%20soft%20lighting&image_size=landscape_16_9',
  bio: 'Estudiante de Ingeniería en Sistemas apasionada por el desarrollo web y la inteligencia artificial. Me encanta compartir conocimiento y ayudar a otros estudiantes.',
  location: 'Ciudad de México, México',
  website: 'https://mariagonzalez.dev',
  joinDate: '2023-03-15T00:00:00Z',
  phone: '+52 55 1234 5678',
  career: 'Ingeniería en Sistemas',
  university: 'Universidad Nacional Autónoma de México',
  semester: 6,
  stats: {
    followers: 1247,
    following: 389,
    posts: 156,
    notesShared: 89,
    questionsAnswered: 234,
    reputation: 4850,
    level: 15,
    achievements: 23
  },
  socialLinks: {
    github: 'https://github.com/mariagonzalez',
    linkedin: 'https://linkedin.com/in/maria-gonzalez',
    twitter: 'https://twitter.com/maria_dev'
  },
  isFollowing: false,
  isOwnProfile: true
};

// Safely format numeric values, returning "0" when the input is undefined
const formatNumber = (num?: number): string => {
  if (typeof num !== 'number') {
    return '0';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatDate = (dateString: string): string => {
  const date = dateString ? new Date(dateString) : null;
  if (!date || isNaN(date.valueOf())) {
    return 'recientemente';
  }
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export function ProfileHeader({
  user = mockUser,
  onFollow,
  onMessage,
  onShare,
  onEditProfile
}: ProfileHeaderProps) {
  // Maintain a local copy of the profile so edits are reflected immediately
  const [profile, setProfile] = useState<UserProfile>(user);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name,
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    phone: profile.phone || ''
  });

  // Reset form values whenever the dialog is opened or profile changes
  useEffect(() => {
    if (isEditDialogOpen) {
      setEditForm({
        name: profile.name,
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        phone: profile.phone || ''
      });
    }
  }, [isEditDialogOpen, profile]);

  const handleFollow = () => {
    if (onFollow) {
      onFollow(profile.id);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(profile.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(profile.id);
    }
  };

  const handleEditSubmit = () => {
    const updatedProfile = { ...profile, ...editForm };
    setProfile(updatedProfile);
    if (onEditProfile) {
      onEditProfile(updatedProfile);
    }
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
        {profile.coverImage && (
          <img 
            src={profile.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            className="bg-white/90 hover:bg-white"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          
          {profile.isOwnProfile ? (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Cuéntanos sobre ti..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Ciudad, País"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleEditSubmit} className="flex-1">
                      Guardar Cambios
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMessage}
                className="bg-white/90 hover:bg-white"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              
              <Button
                variant={profile.isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollow}
                className={profile.isFollowing ? "bg-white/90 hover:bg-white" : ""}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {profile.isFollowing ? 'Siguiendo' : 'Seguir'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="relative -mt-16 px-4">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage
                    src={profile.avatar ?? ''}
                    alt={profile.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <AvatarFallback delayMs={300} className="text-2xl">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                {profile.isOwnProfile && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                    aria-label="Cambiar foto"
                    title="Cambiar foto"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="text-center md:text-left mt-4">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600">@{profile.username}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Nivel {profile.stats?.level ?? 0}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {formatNumber(profile.stats?.reputation)} pts
                  </Badge>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-4">
              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              )}
              
              {/* Academic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{profile.career}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{profile.university}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4" />
                    <span>Semestre {profile.semester}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {profile.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Se unió en {formatDate(profile.joinDate)}</span>
                  </div>
                  
                  {profile.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.website.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Social Links */}
              {profile.socialLinks && (
                <div className="flex gap-3">
                  {profile.socialLinks.github && (
                    <a 
                      href={profile.socialLinks.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  
                  {profile.socialLinks.linkedin && (
                    <a 
                      href={profile.socialLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  
                  {profile.socialLinks.twitter && (
                    <a 
                      href={profile.socialLinks.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-400 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(profile.stats?.followers)}</p>
              <p className="text-sm text-gray-600">Seguidores</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(profile.stats?.following)}</p>
              <p className="text-sm text-gray-600">Siguiendo</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(profile.stats?.posts)}</p>
              <p className="text-sm text-gray-600">Publicaciones</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(0)}</p>
              <p className="text-sm text-gray-600">Apuntes</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(0)}</p>
              <p className="text-sm text-gray-600">Respuestas</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(profile.stats?.reputation)}</p>
              <p className="text-sm text-gray-600">Experiencia</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">Nivel {profile.stats?.level ?? 0}</p>
              <p className="text-sm text-gray-600">Actual</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(0)}</p>
              <p className="text-sm text-gray-600">Logros</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}