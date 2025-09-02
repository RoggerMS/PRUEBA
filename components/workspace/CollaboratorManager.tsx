'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, UserPlus, MoreVertical, Crown, Edit, Eye, Trash2, Share2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace, WorkspaceBoard, WorkspaceCollaborator } from '@/hooks/useWorkspace';

interface CollaboratorManagerProps {
  board: WorkspaceBoard;
  className?: string;
}

export function CollaboratorManager({ board, className }: CollaboratorManagerProps) {
  const {
    inviteCollaborator,
    removeCollaborator,
    updateCollaboratorRole,
    shareBoard
  } = useWorkspace();
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('VIEWER');
  const [shareUrl, setShareUrl] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Por favor ingresa un email');
      return;
    }

    setIsInviting(true);
    try {
      await inviteCollaborator(board.id, inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('VIEWER');
      setShowInviteDialog(false);
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await removeCollaborator(board.id, userId);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'EDITOR' | 'VIEWER') => {
    try {
      await updateCollaboratorRole(board.id, userId, newRole);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleGenerateShareLink = async () => {
    setIsSharing(true);
    try {
      const url = await shareBoard(board.id);
      setShareUrl(url);
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar enlace');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-3 w-3" />;
      case 'EDITOR':
        return <Edit className="h-3 w-3" />;
      case 'VIEWER':
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-yellow-100 text-yellow-800';
      case 'EDITOR':
        return 'bg-blue-100 text-blue-800';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Colaboradores</h3>
          <Badge variant="secondary">
            {(board.collaborators?.length || 0) + 1}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compartir pizarra</DialogTitle>
                <DialogDescription>
                  Genera un enlace público para compartir esta pizarra
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {!shareUrl ? (
                  <Button 
                    onClick={handleGenerateShareLink}
                    disabled={isSharing}
                    className="w-full"
                  >
                    {isSharing ? 'Generando...' : 'Generar enlace de compartir'}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Label>Enlace de compartir</Label>
                    <div className="flex gap-2">
                      <Input value={shareUrl} readOnly />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCopyShareLink}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Este enlace expira en 30 días
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invitar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar colaborador</DialogTitle>
                <DialogDescription>
                  Invita a alguien a colaborar en esta pizarra
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select value={inviteRole} onValueChange={(value: 'EDITOR' | 'VIEWER') => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Visualizador - Solo puede ver
                        </div>
                      </SelectItem>
                      <SelectItem value="EDITOR">
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Editor - Puede editar y crear
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleInviteCollaborator}
                  disabled={isInviting}
                  className="w-full"
                >
                  {isInviting ? 'Invitando...' : 'Enviar invitación'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        {/* Propietario */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={board.owner?.image} />
              <AvatarFallback>
                {board.owner?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{board.owner?.name || 'Usuario'}</p>
              <p className="text-sm text-muted-foreground">{board.owner?.email}</p>
            </div>
          </div>
          <Badge className={getRoleColor('OWNER')}>
            {getRoleIcon('OWNER')}
            <span className="ml-1">Propietario</span>
          </Badge>
        </div>

        {/* Colaboradores */}
        {board.collaborators?.map((collaborator) => (
          <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={collaborator.user.image} />
                <AvatarFallback>
                  {collaborator.user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{collaborator.user.name}</p>
                <p className="text-sm text-muted-foreground">{collaborator.user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getRoleColor(collaborator.role)}>
                {getRoleIcon(collaborator.role)}
                <span className="ml-1">
                  {collaborator.role === 'EDITOR' ? 'Editor' : 'Visualizador'}
                </span>
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {collaborator.role === 'VIEWER' ? (
                    <DropdownMenuItem onClick={() => handleUpdateRole(collaborator.userId, 'EDITOR')}>
                      <Edit className="h-4 w-4 mr-2" />
                      Hacer editor
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleUpdateRole(collaborator.userId, 'VIEWER')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Hacer visualizador
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => handleRemoveCollaborator(collaborator.userId)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        
        {(!board.collaborators || board.collaborators.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay colaboradores aún</p>
            <p className="text-sm">Invita a alguien para empezar a colaborar</p>
          </div>
        )}
      </div>
    </div>
  );
}