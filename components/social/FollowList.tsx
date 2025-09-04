'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  MessageCircle,
  MoreHorizontal,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  MapPin,
  GraduationCap,
  Star,
  Crown,
  Shield
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  university?: string;
  major?: string;
  level?: number;
  isVerified?: boolean;
  isPremium?: boolean;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  mutualFollowers?: number;
  followedAt?: string;
  stats?: {
    followers: number;
    following: number;
    posts: number;
  };
}

interface FollowListProps {
  userId: string;
  followers?: User[];
  following?: User[];
  isOwnProfile?: boolean;
  onFollow?: (userId: string) => Promise<void>;
  onUnfollow?: (userId: string) => Promise<void>;
  onMessage?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

type SortOption = 'name' | 'recent' | 'followers' | 'mutual';
type FilterOption = 'all' | 'verified' | 'premium' | 'mutual';

export function FollowList({
  userId,
  followers = [],
  following = [],
  isOwnProfile = false,
  onFollow,
  onUnfollow,
  onMessage,
  onViewProfile
}: FollowListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());

  const currentList = activeTab === 'followers' ? followers : following;

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = currentList.filter(user => {
      // Search filter
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;

      // Category filter
      switch (filterBy) {
        case 'verified':
          return user.isVerified;
        case 'premium':
          return user.isPremium;
        case 'mutual':
          return user.isFollowing && user.isFollowedBy;
        default:
          return true;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'recent':
          const dateA = new Date(a.followedAt || 0).getTime();
          const dateB = new Date(b.followedAt || 0).getTime();
          comparison = dateB - dateA; // Most recent first
          break;
        case 'followers':
          comparison = (b.stats?.followers || 0) - (a.stats?.followers || 0);
          break;
        case 'mutual':
          comparison = (b.mutualFollowers || 0) - (a.mutualFollowers || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [currentList, searchQuery, sortBy, filterBy, sortOrder]);

  const handleFollow = async (targetUserId: string) => {
    setLoadingUsers(prev => new Set(prev).add(targetUserId));
    try {
      await onFollow?.(targetUserId);
      toast.success('Usuario seguido correctamente');
    } catch (error) {
      toast.error('Error al seguir usuario');
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    setLoadingUsers(prev => new Set(prev).add(targetUserId));
    try {
      await onUnfollow?.(targetUserId);
      toast.success('Has dejado de seguir al usuario');
    } catch (error) {
      toast.error('Error al dejar de seguir');
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const UserCard = ({ user }: { user: User }) => {
    const isLoading = loadingUsers.has(user.id);
    
    return (
      <div className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          {/* Status Indicators */}
          <div className="absolute -top-1 -right-1 flex gap-1">
            {user.isVerified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-2.5 h-2.5 text-white" />
              </div>
            )}
            {user.isPremium && (
              <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 
              className="font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
              onClick={() => onViewProfile?.(user.id)}
            >
              {user.name}
            </h3>
            {user.level && (
              <Badge variant="outline" className="text-xs">
                Nivel {user.level}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-600">@{user.username}</p>
          
          {user.bio && (
            <p className="text-sm text-gray-500 truncate mt-1">{user.bio}</p>
          )}
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            {user.stats && (
              <>
                <span>{formatNumber(user.stats.followers)} seguidores</span>
                <span>{formatNumber(user.stats.posts)} posts</span>
              </>
            )}
            
            {user.mutualFollowers && user.mutualFollowers > 0 && (
              <span className="text-blue-600">
                {user.mutualFollowers} en común
              </span>
            )}
            
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isOwnProfile && user.id !== userId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMessage?.(user.id)}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              
              <Button
                variant={user.isFollowing ? "outline" : "default"}
                size="sm"
                onClick={() => user.isFollowing ? handleUnfollow(user.id) : handleFollow(user.id)}
                disabled={isLoading}
                className="min-w-[80px]"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : user.isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-1" />
                    Siguiendo
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Seguir
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          {followers.length} seguidores • {following.length} siguiendo
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Conexiones sociales</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'followers' | 'following')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Seguidores ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Siguiendo ({following.length})
            </TabsTrigger>
          </TabsList>
          
          {/* Search and Filters */}
          <div className="space-y-3 p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="name">Ordenar por nombre</option>
                <option value="recent">Más recientes</option>
                <option value="followers">Por seguidores</option>
                <option value="mutual">Conexiones mutuas</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">Todos</option>
                <option value="verified">Verificados</option>
                <option value="premium">Premium</option>
                <option value="mutual">Mutuos</option>
              </select>
            </div>
          </div>
          
          <TabsContent value="followers" className="flex-1 overflow-y-auto mt-0">
            {filteredAndSortedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Users className="w-12 h-12 mb-4" />
                <p>No se encontraron seguidores</p>
                {searchQuery && (
                  <p className="text-sm">Intenta con otros términos de búsqueda</p>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {filteredAndSortedUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="flex-1 overflow-y-auto mt-0">
            {filteredAndSortedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Users className="w-12 h-12 mb-4" />
                <p>No se encontraron usuarios seguidos</p>
                {searchQuery && (
                  <p className="text-sm">Intenta con otros términos de búsqueda</p>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {filteredAndSortedUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default FollowList;