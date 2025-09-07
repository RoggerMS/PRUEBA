'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  UserPlus,
  UserMinus,
  MessageCircle,
  Share2,
  Heart,
  HeartHandshake,
  Send,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Link,
  Users,
  Bell,
  BellOff
} from 'lucide-react';

interface SocialActionsProps {
  userId: string;
  username: string;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
  followerCount?: number;
  onFollow?: (userId: string) => Promise<void>;
  onUnfollow?: (userId: string) => Promise<void>;
  onMessage?: (userId: string, message: string) => Promise<void>;
  onShare?: (userId: string, platform?: string) => void;
  className?: string;
}

export function SocialActions({
  userId,
  username,
  isFollowing = false,
  isOwnProfile = false,
  followerCount = 0,
  onFollow,
  onUnfollow,
  onMessage,
  onShare,
  className = ''
}: SocialActionsProps) {
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  const profileUrl = `${window.location.origin}/@${username}`;

  const handleFollow = async () => {
    if (isFollowLoading) return;
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await onUnfollow?.(userId);
        toast.success(`Has dejado de seguir a @${username}`);
      } else {
        await onFollow?.(userId);
        toast.success(`Ahora sigues a @${username}`);
      }
    } catch (error) {
      toast.error('Error al actualizar el seguimiento');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error('Por favor escribe un mensaje');
      return;
    }

    try {
      await onMessage?.(userId, messageText);
      toast.success('Mensaje enviado correctamente');
      setMessageText('');
      setIsMessageDialogOpen(false);
    } catch (error) {
      toast.error('Error al enviar el mensaje');
    }
  };

  const handleShare = (platform?: string) => {
    const shareText = `Mira el perfil de @${username}`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(profileUrl);
        toast.success('Enlace copiado al portapapeles');
        break;
      default:
        onShare?.(userId, platform);
    }
    
    setIsShareDialogOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
    toast.success(
      isNotificationsEnabled 
        ? 'Notificaciones desactivadas' 
        : 'Notificaciones activadas'
    );
  };

  if (isOwnProfile) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button variant="outline" onClick={() => handleShare()}>
          <Share2 className="w-4 h-4 mr-2" />
          Compartir Perfil
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Follow/Unfollow Button */}
      <Button
        onClick={handleFollow}
        disabled={isFollowLoading}
        variant={isFollowing ? "outline" : "default"}
        className={`transition-all duration-200 ${
          isFollowing 
            ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        }`}
      >
        {isFollowLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : isFollowing ? (
          <UserMinus className="w-4 h-4 mr-2" />
        ) : (
          <UserPlus className="w-4 h-4 mr-2" />
        )}
        {isFollowing ? 'Siguiendo' : 'Seguir'}
      </Button>

      {/* Notifications Toggle (only if following) */}
      {isFollowing && (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleNotifications}
          className="px-3"
        >
          {isNotificationsEnabled ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
        </Button>
      )}

      {/* Message Button */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Mensaje
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar mensaje a @{username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Escribe tu mensaje aquí..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {messageText.length}/500 caracteres
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSendMessage} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsMessageDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Button */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compartir perfil de @{username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 h-12"
              >
                <Twitter className="w-5 h-5 text-blue-400" />
                Twitter
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 h-12"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                Facebook
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 h-12"
              >
                <Linkedin className="w-5 h-5 text-blue-700" />
                LinkedIn
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShare('copy')}
                className="flex items-center gap-2 h-12"
              >
                <Copy className="w-5 h-5" />
                Copiar enlace
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <Label htmlFor="profile-url">Enlace del perfil</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="profile-url"
                  value={profileUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('copy')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Follower Count Badge */}
      {followerCount > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {followerCount.toLocaleString()} seguidores
        </Badge>
      )}
    </div>
  );
}

export default SocialActions;