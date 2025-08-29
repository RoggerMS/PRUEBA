'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit3, Check, Grid3X3, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface WorkspaceBoard {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  blocks: WorkspaceBlockData[];
}

interface WorkspaceBlockData {
  id: string;
  type: 'DOCS' | 'KANBAN' | 'FRASES';
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

const CANVAS_SIZE = 5000; // 5000x5000 infinite canvas
const GRID_SIZE = 20;
const MIN_BLOCK_SIZE = { width: 300, height: 200 };
const MAX_BLOCK_SIZE = { width: 800, height: 600 };

export default function WorkspacePage() {
  const { data: session, status } = useSession();
  const [boards, setBoards] = useState<WorkspaceBoard[]>([]);
  const [currentBoard, setCurrentBoard] = useState<WorkspaceBoard | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);


  const fetcher = async (url: string) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const normalizeBlock = (b: any): WorkspaceBlockData => ({
    ...b,
    width: b.width ?? b.w ?? 300,
    height: b.height ?? b.h ?? 200,
  });

  const loadBoards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetcher('/api/workspace/boards');
      if (!data.defaultBoard) {
        await fetch('/api/workspace/boards', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: 'Pizarra 1' })
        });
        const again = await fetcher('/api/workspace/boards');
        const mapped = again.boards.map((b: any) => ({
          ...b,
          blocks: b.blocks.map(normalizeBlock),
        }));
        setBoards(mapped);
        const def = mapped.find((b: WorkspaceBoard) => b.id === again.defaultBoard) || mapped[0] || null;
        setCurrentBoard(def);
      } else {
        const mapped = data.boards.map((b: any) => ({
          ...b,
          blocks: b.blocks.map(normalizeBlock),
        }));
        setBoards(mapped);
        const def = mapped.find((b: WorkspaceBoard) => b.id === data.defaultBoard) || mapped[0] || null;
        setCurrentBoard(def);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const createBoard = async (name: string) => {
    try {
      await fetch('/api/workspace/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      await loadBoards();
      toast.success('Pizarra creada exitosamente');
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('Error al crear la pizarra');
    }
  };

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
  const handleCreateBlock = async (type: 'DOCS' | 'KANBAN' | 'FRASES', title: string) => {
    if (!currentBoard) return;

    try {
      const response = await fetch('/api/workspace/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          boardId: currentBoard.id,
          x: Math.random() * 500, // Random position
          y: Math.random() * 500,
          w: MIN_BLOCK_SIZE.width,
          h: MIN_BLOCK_SIZE.height,
        }),
      });

      if (!response.ok) throw new Error('Failed to create block');

      const data = await response.json();
      const block = normalizeBlock(data.block);

      // Update current board with new block
      setCurrentBoard(prev => prev ? {
        ...prev,
        blocks: [...prev.blocks, block]
      } : null);
      
      toast.success('Bloque creado exitosamente');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating block:', error);
      toast.error('Error al crear el bloque');
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      loadBoards();
    }
  }, [status, loadBoards]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Requerido</h1>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder al Workspace</p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Iniciar Sesión
          </Button>
        </Card>
      </div>
    );
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

  if (!boards.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Crea tu primer bloque</h2>
          <Button onClick={() => createBoard('Pizarra 1')}>Crear Bloque</Button>
        </Card>
      </div>
    );
  }


  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
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

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
            backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Blocks */}
          {currentBoard?.blocks.map((block) => (
            <WorkspaceBlock
              key={block.id}
              block={block}
              isEditMode={isEditMode}
              canvasOffset={canvasOffset}
              zoom={zoom}
              onUpdate={(updatedBlock) => {
                setCurrentBoard(prev => prev ? {
                  ...prev,
                  blocks: prev.blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b)
                } : null);
              }}
              onDelete={(blockId) => {
                setCurrentBoard(prev => prev ? {
                  ...prev,
                  blocks: prev.blocks.filter(b => b.id !== blockId)
                } : null);
              }}
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {currentBoard && currentBoard.blocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Card className="p-8 text-center pointer-events-auto">
            <h2 className="text-xl font-semibold mb-2">Pizarra Vacía</h2>
            <p className="text-gray-600 mb-4">Crea tu primer bloque para comenzar</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Bloque
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}