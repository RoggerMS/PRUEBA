'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  UserPlus,
  UserMinus,
  Shield,
  MessageCircle,
  Loader2
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
  bio?: string;
  isVerified: boolean;
  isFollowing?: boolean;
  mutualFollowers?: number;
  lastActive?: string;
}

interface FollowersModalProps {
  userId: string;
  type: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
}

export function FollowersModal({ userId, type, isOpen, onClose }: FollowersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/follow?userId=${userId}&type=${type}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setFilteredUsers(data.users || []);

        // Track which users are being followed
        const following = new Set(
          data.users
            .filter((user: User) => user.isFollowing)
            .map((user: User) => user.id)
        );
        setFollowingUsers(following);
      } else {
        toast.error(data.error || 'Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim()) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleFollow = async (targetUserId: string, isCurrentlyFollowing: boolean) => {
    setActionLoading(prev => new Set(prev).add(targetUserId));
    
    try {
      const response = await fetch('/api/users/follow', {
        method: isCurrentlyFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: targetUserId })
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          if (isCurrentlyFollowing) {
            newSet.delete(targetUserId);
          } else {
            newSet.add(targetUserId);
          }
          return newSet;
        });

        // Update users list
        setUsers(prev => prev.map(user => 
          user.id === targetUserId 
            ? { ...user, isFollowing: !isCurrentlyFollowing }
            : user
        ));

        toast.success(data.message);
      } else {
        toast.error(data.error || 'Error al seguir usuario');
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Error al seguir usuario');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  const handleMessage = (username: string) => {
    // Navigate to messages with this user
    window.location.href = `/messages?user=${username}`;
  };

  const formatLastActive = (lastActive?: string) => {
    if (!lastActive) return 'Nunca activo';
    
    const date = new Date(lastActive);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Activo ahora';
    if (diffInHours < 24) return `Activo hace ${diffInHours}h`;
    if (diffInHours < 168) return `Activo hace ${Math.floor(diffInHours / 24)}d`;
    return `Activo hace ${Math.floor(diffInHours / 168)}sem`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {type === 'followers' ? 'Seguidores' : 'Siguiendo'}
            {!loading && ` (${filteredUsers.length})`}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery 
                  ? 'No se encontraron usuarios' 
                  : `No hay ${type === 'followers' ? 'seguidores' : 'usuarios seguidos'}`}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isFollowing = followingUsers.has(user.id);
              const isLoading = actionLoading.has(user.id);
              
              return (
                <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <Avatar className="w-12 h-12 cursor-pointer" onClick={() => window.location.href = `/@${user.username}`}> 
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 
                        className="font-medium text-gray-900 truncate cursor-pointer hover:underline"
                        onClick={() => window.location.href = `/@${user.username}`}
                      >
                        {user.name}
                      </h3>
                      {user.isVerified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          <Shield className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">@{user.username}</p>
                    {user.bio && (
                      <p className="text-xs text-gray-500 truncate mt-1">{user.bio}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      {user.mutualFollowers && user.mutualFollowers > 0 && (
                        <span>{user.mutualFollowers} seguidores en común</span>
                      )}
                      <span>{formatLastActive(user.lastActive)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMessage(user.username)}
                      className="w-8 h-8 p-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={isFollowing ? "outline" : "default"}
                      onClick={() => handleFollow(user.id, isFollowing)}
                      disabled={isLoading}
                      className="min-w-[80px]"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-1" />
                          Dejar
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Seguir
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More Button (for future pagination) */}
        {filteredUsers.length > 0 && filteredUsers.length % 20 === 0 && (
          <div className="pt-3 border-t">
            <Button variant="outline" className="w-full" disabled>
              Cargar más usuarios
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}