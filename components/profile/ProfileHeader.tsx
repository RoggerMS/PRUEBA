'use client';

import { useState } from 'react';
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

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long'
  });
};

export function ProfileHeader({
  user = mockUser,
  onFollow,
  onMessage,
  onShare,
  onEditProfile
}: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
    phone: user.phone || ''
  });

  const handleFollow = () => {
    if (onFollow) {
      onFollow(user.id);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(user.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(user.id);
    }
  };

  const handleEditSubmit = () => {
    if (onEditProfile) {
      onEditProfile(editForm);
    }
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
        {user.coverImage && (
          <img 
            src={user.coverImage} 
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
          
          {user.isOwnProfile ? (
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
                variant={user.isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollow}
                className={user.isFollowing ? "bg-white/90 hover:bg-white" : ""}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {user.isFollowing ? 'Siguiendo' : 'Seguir'}
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
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                {user.isOwnProfile && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="text-center md:text-left mt-4">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">@{user.username}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Nivel {user.level || 1}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {user.xp || 0} pts
                  </Badge>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-4">
              {/* Bio */}
              {user.bio && (
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              )}
              
              {/* Academic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{user.career}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{user.university}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4" />
                    <span>Semestre {user.semester}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {user.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Se unió en {formatDate(user.joinDate)}</span>
                  </div>
                  
                  {user.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      <a 
                        href={user.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {user.website.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Social Links */}
              {user.socialLinks && (
                <div className="flex gap-3">
                  {user.socialLinks.github && (
                    <a 
                      href={user.socialLinks.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  
                  {user.socialLinks.linkedin && (
                    <a 
                      href={user.socialLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  
                  {user.socialLinks.twitter && (
                    <a 
                      href={user.socialLinks.twitter} 
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
              <p className="text-2xl font-bold text-gray-900">{formatNumber(user.followers || 0)}</p>
              <p className="text-sm text-gray-600">Seguidores</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(user.following || 0)}</p>
              <p className="text-sm text-gray-600">Siguiendo</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(user.posts || 0)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{formatNumber(user.xp || 0)}</p>
              <p className="text-sm text-gray-600">Reputación</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{user.level || 1}</p>
              <p className="text-sm text-gray-600">Nivel</p>
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