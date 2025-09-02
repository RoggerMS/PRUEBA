'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit3, Check, Grid3X3, Maximize2, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { WorkspaceBlock } from '../../components/workspace/WorkspaceBlock';
import { CreateBlockModal } from '../../components/workspace/CreateBlockModal';
import { CollaboratorManager } from '@/components/workspace/CollaboratorManager';
import { WorkspaceStats } from '@/components/workspace/WorkspaceStats';
import { WorkspaceSettings } from '@/components/workspace/WorkspaceSettings';
import { useWorkspace } from '@/hooks/useWorkspace';

// Types are now imported from useWorkspace hook

const CANVAS_SIZE = 5000; // 5000x5000 infinite canvas
const GRID_SIZE = 20;
const MIN_BLOCK_SIZE = { width: 300, height: 200 };
const MAX_BLOCK_SIZE = { width: 800, height: 600 };

export default function WorkspacePage() {
  const { data: session, status } = useSession();
  const {
    boards,
    currentBoard,
    setCurrentBoard,
    isLoading,
    error,
    loadBoards,
    createBoard,
    createBlock
  } = useWorkspace();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const GRID_SIZE = 20;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;

  // Handle canvas panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setCanvasOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(2, prev * delta)));
  };

  // Center canvas
  const centerCanvas = () => {
    setCanvasOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  // Handle block creation
  const handleCreateBlock = async (blockData: any) => {
    if (!currentBoard) return;
    
    try {
      // Generate random position
      const position = {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100
      };
      
      await createBlock(currentBoard.id, {
        ...blockData,
        position,
      });
      
      setShowCreateModal(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  useEffect(() => {
    if (status !== 'loading') {
      loadBoards();
    }
  }, [status, loadBoards]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  // Middleware already protects this route; render nothing for unauthenticated users
  if (status === 'unauthenticated') {
    return null
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <Button onClick={loadBoards}>Reintentar</Button>
        </Card>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="mb-4 text-gray-600">Aún no tienes pizarras.</p>
          <Button
            onClick={() => {
              const name = prompt('Nombre de la pizarra');
              if (name) createBoard(name);
            }}
          >
            Crear pizarra
          </Button>
        </Card>
      </div>
    );
  }


  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
            
            {/* Board Selector */}
            <Select
              value={currentBoard?.id || ''}
              onValueChange={(boardId) => {
                const board = boards.find(b => b.id === boardId);
                setCurrentBoard(board || null);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar pizarra" />
              </SelectTrigger>
              <SelectContent>
                {boards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    <div className="flex items-center gap-2">
                      {board.name}
                      {board.isDefault && <Badge variant="secondary">Por defecto</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            {/* Block Counter */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Grid3X3 className="w-4 h-4" />
              <span>{currentBoard?.blocks.length || 0}/100 bloques</span>
            </div>

            {/* Collaborators indicator */}
            {currentBoard && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCollaborators(true)}
              >
                <Users className="w-4 h-4 mr-2" />
                {(currentBoard.collaborators?.length || 0) + 1}
              </Button>
            )}

            {/* Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={centerCanvas}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            <Button
              variant={isEditMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? (
                <><Check className="w-4 h-4 mr-2" />Completar</>
              ) : (
                <><Edit3 className="w-4 h-4 mr-2" />Editar</>
              )}
            </Button>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!currentBoard || (currentBoard.blocks.length >= 100)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Bloque
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Bloque</DialogTitle>
                  <DialogDescription>
                    Selecciona el tipo de bloque que deseas crear
                  </DialogDescription>
                </DialogHeader>
                <CreateBlockModal onCreateBlock={handleCreateBlock} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <Tabs defaultValue="canvas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>
          
          <TabsContent value="canvas" className="mt-0">
            {/* Canvas content will be here */}
          </TabsContent>
          
          <TabsContent value="stats" className="mt-4">
            <WorkspaceStats />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4">
            {currentBoard && <WorkspaceSettings board={currentBoard} />}
          </TabsContent>
        </Tabs>
      </div>

      {/* Collaborators Dialog */}
      <Dialog open={showCollaborators} onOpenChange={setShowCollaborators}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestionar Colaboradores</DialogTitle>
            <DialogDescription>
              Invita y gestiona colaboradores para esta pizarra
            </DialogDescription>
          </DialogHeader>
          {currentBoard && (
            <CollaboratorManager board={currentBoard} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
