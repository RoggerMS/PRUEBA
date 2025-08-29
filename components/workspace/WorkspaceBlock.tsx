'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Kanban, MessageSquare, Trash2, GripVertical } from 'lucide-react';
import { DocsView } from './DocsView';
import { KanbanView } from './KanbanView';
import { FrasesView } from './FrasesView';

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

interface WorkspaceBlockProps {
  block: WorkspaceBlockData;
  isEditMode: boolean;
  canvasOffset: { x: number; y: number };
  zoom: number;
  onUpdate: (block: WorkspaceBlockData) => void;
  onDelete: (blockId: string) => void;
}

const BLOCK_ICONS = {
  DOCS: FileText,
  KANBAN: Kanban,
  FRASES: MessageSquare,
};

const BLOCK_COLORS = {
  DOCS: 'bg-blue-50 border-blue-200',
  KANBAN: 'bg-green-50 border-green-200',
  FRASES: 'bg-purple-50 border-purple-200',
};

export function WorkspaceBlock({
  block,
  isEditMode,
  canvasOffset,
  zoom,
  onUpdate,
  onDelete,
}: WorkspaceBlockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const blockRef = useRef<HTMLDivElement>(null);

  const Icon = BLOCK_ICONS[block.type];

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - block.x * zoom,
      y: e.clientY - block.y * zoom,
    });
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: block.width,
      height: block.height,
    });
  };

  // Handle mouse move for drag and resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = (e.clientX - dragStart.x) / zoom;
        const newY = (e.clientY - dragStart.y) / zoom;
        
        onUpdate({
          ...block,
          x: Math.max(0, Math.min(5000 - block.width, newX)),
          y: Math.max(0, Math.min(5000 - block.height, newY)),
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        const newWidth = Math.max(300, Math.min(800, resizeStart.width + deltaX / zoom));
        const newHeight = Math.max(200, Math.min(600, resizeStart.height + deltaY / zoom));
        
        onUpdate({
          ...block,
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        
        // Update block position/size on server
        updateBlockOnServer();
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, block, onUpdate, zoom]);

  // Update block on server
  const updateBlockOnServer = async () => {
    try {
      await fetch(`/api/workspace/blocks/${block.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: block.x,
          y: block.y,
          w: block.width,
          h: block.height,
        }),
      });
    } catch (error) {
      console.error('Error updating block:', error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/workspace/blocks/${block.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        onDelete(block.id);
      }
    } catch (error) {
      console.error('Error deleting block:', error);
    }
  };

  // Toggle completion
  const toggleCompletion = async () => {
    try {
      const response = await fetch(`/api/workspace/blocks/${block.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !block.completed }),
      });
      
      if (response.ok) {
        onUpdate({ ...block, completed: !block.completed });
      }
    } catch (error) {
      console.error('Error updating block completion:', error);
    }
  };

  return (
    <div
      ref={blockRef}
      className={`absolute select-none ${
        isDragging ? 'cursor-grabbing' : isEditMode ? 'cursor-grab' : 'cursor-pointer'
      }`}
      style={{
        left: canvasOffset.x + block.x * zoom,
        top: canvasOffset.y + block.y * zoom,
        width: block.width * zoom,
        height: block.height * zoom,
        zIndex: block.zIndex,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
      }}
    >
      <Card className={`h-full flex flex-col ${BLOCK_COLORS[block.type]} ${block.completed ? 'opacity-75' : ''}`}>
        {/* Header */}
        <div
          className={`flex items-center justify-between p-3 border-b bg-white/50 ${
            isEditMode ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium truncate">{block.title}</span>
            {block.completed && (
              <Badge variant="secondary" className="text-xs">
                Completado
              </Badge>
            )}
          </div>
          
          {isEditMode && (
            <div className="flex items-center gap-1">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {block.type === 'DOCS' && <DocsView blockId={block.id} />}
          {block.type === 'KANBAN' && <KanbanView blockId={block.id} />}
          {block.type === 'FRASES' && <FrasesView blockId={block.id} />}
        </div>

        {/* Completion Toggle */}
        {!isEditMode && (
          <div className="p-2 border-t bg-white/50">
            <Button
              variant={block.completed ? 'default' : 'outline'}
              size="sm"
              onClick={toggleCompletion}
              className="w-full"
            >
              {block.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
            </Button>
          </div>
        )}

        {/* Resize Handle */}
        {isEditMode && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-400 opacity-50 hover:opacity-75"
            onMouseDown={handleResizeStart}
          />
        )}
      </Card>
    </div>
  );
}