'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Settings, 
  Palette, 
  Grid, 
  Bell, 
  Shield, 
  Trash2, 
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace, WorkspaceBoard } from '@/hooks/useWorkspace';

interface WorkspaceSettingsProps {
  board: WorkspaceBoard;
  className?: string;
}

export function WorkspaceSettings({ board, className }: WorkspaceSettingsProps) {
  const { updateBoard, deleteBoard, duplicateBoard } = useWorkspace();
  
  // Board settings state
  const [boardName, setBoardName] = useState(board.name);
  const [boardDescription, setBoardDescription] = useState(board.description || '');
  const [isPublic, setIsPublic] = useState(board.isPublic || false);
  const [allowComments, setAllowComments] = useState(board.allowComments || true);
  const [autoSave, setAutoSave] = useState(true);
  
  // UI preferences
  const [gridSize, setGridSize] = useState('20');
  const [theme, setTheme] = useState('light');
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [collaboratorNotifications, setCollaboratorNotifications] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateBoard(board.id, {
        name: boardName,
        description: boardDescription,
        isPublic,
        allowComments,
      });
      toast.success('Configuración guardada');
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBoard = async () => {
    setIsDeleting(true);
    try {
      await deleteBoard(board.id);
      toast.success('Pizarra eliminada');
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicateBoard = async () => {
    setIsDuplicating(true);
    try {
      await duplicateBoard(board.id);
      toast.success('Pizarra duplicada');
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleExportBoard = async () => {
    try {
      const response = await fetch(`/api/workspace/boards/${board.id}/export`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${board.name}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Pizarra exportada');
    } catch (error) {
      toast.error('Error al exportar pizarra');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Board Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Información de la Pizarra
          </CardTitle>
          <CardDescription>
            Configura los detalles básicos de tu pizarra
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board-name">Nombre de la pizarra</Label>
            <Input
              id="board-name"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Mi pizarra de trabajo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="board-description">Descripción</Label>
            <Textarea
              id="board-description"
              value={boardDescription}
              onChange={(e) => setBoardDescription(e.target.value)}
              placeholder="Describe el propósito de esta pizarra..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pizarra pública</Label>
              <p className="text-sm text-muted-foreground">
                Permite que otros usuarios encuentren esta pizarra
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Permitir comentarios</Label>
              <p className="text-sm text-muted-foreground">
                Los colaboradores pueden dejar comentarios
              </p>
            </div>
            <Switch
              checked={allowComments}
              onCheckedChange={setAllowComments}
            />
          </div>
        </CardContent>
      </Card>

      {/* UI Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Preferencias de Interfaz
          </CardTitle>
          <CardDescription>
            Personaliza la apariencia del workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tamaño de cuadrícula</Label>
              <Select value={gridSize} onValueChange={setGridSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Pequeña (10px)</SelectItem>
                  <SelectItem value="20">Mediana (20px)</SelectItem>
                  <SelectItem value="30">Grande (30px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tema</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mostrar cuadrícula</Label>
              <p className="text-sm text-muted-foreground">
                Muestra la cuadrícula de fondo
              </p>
            </div>
            <Switch
              checked={showGrid}
              onCheckedChange={setShowGrid}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ajustar a cuadrícula</Label>
              <p className="text-sm text-muted-foreground">
                Los bloques se ajustan automáticamente a la cuadrícula
              </p>
            </div>
            <Switch
              checked={snapToGrid}
              onCheckedChange={setSnapToGrid}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Guardado automático</Label>
              <p className="text-sm text-muted-foreground">
                Guarda cambios automáticamente cada 30 segundos
              </p>
            </div>
            <Switch
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Configura cómo quieres recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones por email</Label>
              <p className="text-sm text-muted-foreground">
                Recibe actualizaciones por correo electrónico
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones push</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones en el navegador
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Actividad de colaboradores</Label>
              <p className="text-sm text-muted-foreground">
                Notificar cuando los colaboradores hagan cambios
              </p>
            </div>
            <Switch
              checked={collaboratorNotifications}
              onCheckedChange={setCollaboratorNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Acciones de la Pizarra
          </CardTitle>
          <CardDescription>
            Gestiona tu pizarra con estas acciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleExportBoard}
              className="justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar pizarra
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDuplicateBoard}
              disabled={isDuplicating}
              className="justify-start"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isDuplicating ? 'Duplicando...' : 'Duplicar pizarra'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex items-center justify-between pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar pizarra
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente la pizarra
                y todos sus bloques.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteBoard}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar configuración'}
        </Button>
      </div>
    </div>
  );
}